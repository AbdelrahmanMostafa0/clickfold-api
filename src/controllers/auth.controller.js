import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { sendSuccess, sendError } from "../utils/response.js";
import { loginSchema, signupSchema } from "../validators/auth.validator.js";
import {
  generateTokens,
  setTokenCookies,
  verifyRefreshToken,
} from "../utils/token.util.js";
import { generateTempToken, verifyTempToken } from "../utils/token.util.js";

import { forgotPasswordEmail } from "../emails/forgot-password.js";
import { sendEmail } from "../utils/email.js";
const COOLDOWN_DAYS = 3;

const canReuseEmail = (deletedAt) => {
  const cooldownMs = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() - new Date(deletedAt).getTime() > cooldownMs;
};
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const validationResult = signupSchema.safeParse({ name, email, password });
    if (!validationResult.success) {
      return sendError(res, validationResult.error.issues[0].message, 400);
    }
    const user = await User.findOne({ email });
    if (user) {
      if (!user.isDeleted) {
        return sendError(res, "User already exists", 400);
      }
      if (!canReuseEmail(user.deletedAt)) {
        return sendError(res, "You can create a new account after 3 days", 400);
      }
      await User.deleteOne({ _id: user._id });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    const { accessToken, refreshToken } = generateTokens({ id: newUser._id });
    setTokenCookies(res, accessToken, refreshToken);

    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return sendSuccess(res, userResponse, "User registered successfully", 201);
  } catch (error) {
    return sendError(res, error?.message || "Internal Server Error", 500);
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const validationResult = loginSchema.safeParse({ email, password });
    if (!validationResult.success) {
      return sendError(res, validationResult.error.issues[0].message, 400);
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return sendError(res, "User not found", 404);
    }
    if (user.isDeleted) {
      return sendError(
        res,
        "Account is deleted. Please create a new account.",
        400,
      );
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendError(res, "Invalid password", 401);
    }
    const { accessToken, refreshToken } = generateTokens({ id: user._id });
    setTokenCookies(res, accessToken, refreshToken);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return sendSuccess(res, userResponse, "User logged in successfully", 200);
  } catch (error) {
    return sendError(res, error?.message || "Internal Server Error", 500);
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return sendError(res, "Unauthorized", 401);

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id);
    if (!user) return sendError(res, "Unauthorized", 401);

    const { accessToken, refreshToken } = generateTokens({ id: user._id });
    setTokenCookies(res, accessToken, refreshToken);
    return sendSuccess(res, null, "Tokens refreshed", 200);
  } catch (error) {
    return sendError(res, "Unauthorized", 401);
  }
};
const googleAuth = async (req, res) => {
  try {
    const { access_token } = req.body;
    if (!access_token) {
      return sendError(res, "Access token is required", 400);
    }
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      },
    );

    const googleUser = await userInfoResponse.json();
    const { sub: googleId, email, name, picture } = googleUser;
    if (!email) {
      return sendError(res, "Invalid access token", 400);
    }
    let user = await User.findOne({ email });
    if (user && user.isDeleted) {
      if (!canReuseEmail(user.deletedAt)) {
        return sendError(res, "You can create a new account after 3 days", 400);
      }
      await User.deleteOne({ _id: user._id });
      user = null;
    }
    if (!user) {
      user = await User.create({
        name,
        email,
        avatar: picture,
        provider: "google",
        googleId,
      });
    } else if (!user.googleId) {
      // Link Google account to existing email/password user
      user.googleId = googleId;
      user.provider = "google";
      if (!user.avatar) user.avatar = picture;
      await user.save();
    }
    const { accessToken, refreshToken } = generateTokens({ id: user._id });
    setTokenCookies(res, accessToken, refreshToken);
    return sendSuccess(res, user, "User logged in successfully", 200);
  } catch (error) {
    return sendError(res, error?.message || "Internal Server Error", 500);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, "User not found", 404);
    }
    const token = generateTempToken(user._id.toString(), "forgot-password");
    // Send confirmation email (fire-and-forget)
    sendEmail({
      to: user.email,
      subject: "Reset your password",
      html: forgotPasswordEmail({ name: user.name, token }),
    })
      .then((res) => console.log("res", res))
      .catch((err) => console.log("err", err));
    return sendSuccess(
      res,
      null,
      "An Email has been sent to reset your password.",
      200,
    );
  } catch (error) {
    return res
      .status(500)
      .json({ message: error?.message || "Internal Server Error" });
  }
};
const logoutUser = async (req, res) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return sendSuccess(res, null, "User logged out successfully", 200);
  } catch (error) {
    return sendError(res, error?.message || "Internal Server Error", 500);
  }
};
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const payload = verifyTempToken(token, "forgot-password");
    if (!payload) {
      return sendError(res, "Invalid or expired token", 401);
    }
    if (payload.purpose !== "forgot-password") {
      return sendError(res, "Invalid token purpose", 401);
    }
    const user = await User.findById(payload.userId);
    if (!user) {
      return sendError(res, "User not found", 404);
    }
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    return sendSuccess(res, null, "Password reset successfully", 200);
  } catch (error) {
    return sendError(res, error?.message || "Internal Server Error", 500);
  }
};

export {
  registerUser,
  loginUser,
  googleAuth,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  logoutUser,
};
