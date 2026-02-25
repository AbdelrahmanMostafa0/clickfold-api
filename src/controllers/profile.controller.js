import { sendSuccess, sendError } from "../utils/response.js";
import bcrypt from "bcrypt";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";
import { sendEmail } from "../utils/email.js";
import { deleteAccountEmail } from "../emails/delete-account.js";
import { generateDeleteToken, verifyDeleteToken } from "../utils/token.util.js";
import User from "../models/user.model.js";

const getProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return sendError(res, "User not found", 404);
    }
    return sendSuccess(res, user, "Profile fetched successfully", 200);
  } catch (error) {
    return sendError(res, error?.message || "Internal Server Error", 500);
  }
};

const updateProfile = async (req, res) => {
  const { name } = req.body;
  const avatar = req.file;
  try {
    const user = req.user;
    if (!user) {
      return sendError(res, "User not found", 404);
    }
    if (name) {
      if (name.length < 3 || name.length > 20) {
        return sendError(res, "Name must be between 3 and 20 characters", 400);
      }
      user.name = name;
    }

    if (avatar) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "b8lnk/avatars",
        transformation: {
          width: 200,
          height: 200,
          crop: "fill",
          gravity: "auto",
        },
      });
      user.avatar = result.secure_url;
      fs.unlinkSync(req.file.path);
    }
    await user.save();
    return sendSuccess(res, user, "Profile updated successfully", 200);
  } catch (error) {
    return sendError(res, error?.message || "Internal Server Error", 500);
  }
};

const updatePassword = async (req, res) => {
  const { password, newPassword } = req.body;
  try {
    const user = req.user;
    if (!user) {
      return sendError(res, "User not found", 404);
    }
    const userPass = await User.findById(user._id).select("password");
    const isPasswordValid = await bcrypt.compare(password, userPass.password);
    if (!isPasswordValid) {
      return sendError(res, "Invalid password", 400);
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return sendSuccess(res, null, "Password updated successfully", 200);
  } catch (error) {
    return sendError(res, error?.message || "Internal Server Error", 500);
  }
};

const updateAvatar = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return sendError(res, "User not found", 404);
    }
    if (!req.file) {
      return sendError(res, "Avatar not found", 400);
    }
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "b8lnk/avatars",
      transformation: {
        width: 200,
        height: 200,
        crop: "fill",
        gravity: "auto",
      },
    });
    user.avatar = result.secure_url;
    fs.unlinkSync(req.file.path);
    await user.save();
    return sendSuccess(res, user, "Avatar updated successfully", 200);
  } catch (error) {
    return sendError(res, error?.message || "Internal Server Error", 500);
  }
};

const requestDeleteProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    const token = generateDeleteToken(user._id.toString());
    // Send confirmation email (fire-and-forget)
    sendEmail({
      to: user.email,
      subject: "Confirm your b8lnk account deletion",
      html: deleteAccountEmail({ name: user.name, token }),
    })
      .then((res) => console.log("res", res))
      .catch((err) => console.log("err", err));

    return sendSuccess(
      res,
      null,
      "A confirmation email has been sent. Please check your inbox.",
      200,
    );
  } catch (error) {
    return sendError(res, error?.message || "Internal Server Error", 500);
  }
};

const confirmDeleteProfile = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return sendError(res, "Token is required", 400);
    }

    const payload = verifyDeleteToken(token);
    if (!payload) {
      return sendError(res, "Invalid or expired token", 401);
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    if (user.isDeleted) {
      return sendError(res, "Account already deleted", 400);
    }

    user.isDeleted = true;
    user.deletedAt = Date.now();
    await user.save();

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return sendSuccess(res, null, "Account deleted successfully", 200);
  } catch (error) {
    return sendError(res, error?.message || "Internal Server Error", 500);
  }
};

export {
  getProfile,
  updateProfile,
  requestDeleteProfile,
  confirmDeleteProfile,
  updatePassword,
  updateAvatar,
};
