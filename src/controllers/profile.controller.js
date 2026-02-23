import { sendSuccess, sendError } from "../utils/response.js";

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

export { getProfile };
