import Link from "../models/link.model.js";
import fs from "fs";
import { sendSuccess, sendError } from "../utils/response.js";
import cloudinary from "../utils/cloudinary.js";
const createLink = async (req, res) => {
  try {
    const { slug, destination, ogTitle, ogDescription } = req.body;

    let ogImage = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "b8lnk/og-preview",
        transformation: {
          width: 1200,
          height: 630,
          crop: "fill",
          gravity: "auto",
        },
      });
      console.log("result", result);
      ogImage = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const link = await Link.create({
      slug,
      destination,
      og: {
        title: ogTitle,
        description: ogDescription,
        image: ogImage,
      },
      createdBy: req.user._id,
    });

    return sendSuccess(res, link, "Link created successfully", 201);
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
