import { verifyAccessToken } from "../utils/token.util.js";
import User from "../models/user.model.js";
import { sendError } from "../utils/response.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return sendError(res, "Unauthorized request", 401);
    }

    const decodedToken = verifyAccessToken(token);

    if (!decodedToken) {
      return sendError(res, "Invalid Access Token", 401);
    }

    const user = await User.findById(
      decodedToken.id || decodedToken._id,
    ).select("-password");

    if (!user) {
      return sendError(res, "User not found", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, error?.message || "Internal Server Error", 500);
  }
};
