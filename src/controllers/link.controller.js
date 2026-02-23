import Link from "../models/link.model.js";
import { sendSuccess, sendError } from "../utils/response.js";

const createLink = async (req, res) => {
  try {
    const { slug, destination, og } = req.body;
    const link = await Link.create({ slug, destination, og });
    return sendSuccess(res, "Link created successfully", link, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const getLink = async (req, res) => {
  try {
    const { slug } = req.params;
    const link = await Link.findOne({ slug });
    return sendSuccess(res, "Link fetched successfully", link, 200);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
const getUserLinks = async (req, res) => {
  try {
    const links = await Link.find({ createdBy: req.user.id });
    return sendSuccess(res, "Links fetched successfully", links, 200);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
export { createLink, getLink, getUserLinks };
