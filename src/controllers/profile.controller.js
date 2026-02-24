import { sendSuccess, sendError } from "../utils/response.js";
import bcrypt from "bcrypt";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";
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
  const { name, password, newPassword } = req.body;
  const avatar = req.file;
  try {
    const user = req.user;
    if (!user) {
      return sendError(res, "User not found", 404);
    }
    if (name) {
      user.name = name;
    }
    if (password && newPassword) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return sendError(res, "Invalid password", 400);
      }
      user.password = newPassword;
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

export { getProfile, updateProfile };
