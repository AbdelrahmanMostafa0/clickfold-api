import Link from "../models/link.model.js";
import fs from "fs";
import { sendSuccess, sendError } from "../utils/response.js";
import cloudinary from "../utils/cloudinary.js";
import geoip from "geoip-lite";
import { UAParser } from "ua-parser-js";
import Click from "../models/click.model.js";
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
    return sendSuccess(res, link, "Link fetched successfully", 200);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const getUserLinks = async (req, res) => {
  try {
    const links = await Link.find({ createdBy: req.user.id });
    return sendSuccess(res, links, "Links fetched successfully", 200);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const redirectLink = async (req, res) => {
  try {
    const { slug } = req.params;
    const link = await Link.findOne({ slug });
    if (!link) {
      return sendError(res, "Link not found", 404);
    }
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    console.log(ip);

    const geo = geoip.lookup(ip);
    const parser = new UAParser(req.headers["user-agent"]);
    const ua = parser.getResult();
    await Click.create({
      link: link._id,
      ip,
      country: geo?.country || "Unknown",
      city: geo?.city || "Unknown",
      device: ua.device.type || "desktop",
      os: ua.os.name,
      browser: ua.browser.name,
      referer: req.headers.referer || null,
    });
    if (link.isActive) {
      await Link.findByIdAndUpdate(link._id, { $inc: { clicks: 1 } });
    }
    const linkres = link.isActive
      ? link
      : { isActive: false, susPopups: false, _id: link._id };
    return sendSuccess(res, linkres, "Link fetched successfully", 200);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const userlinksStats = async (req, res) => {
  try {
    const stats = await Link.aggregate([
      { $match: { createdBy: req.user.id } },
      {
        $group: {
          _id: null,
          activeLinks: {
            $sum: {
              $cond: [{ $eq: ["$isActive", true] }, 1, 0],
            },
          },
          totalClicks: { $sum: "$clicks" },
          totalLinks: { $sum: 1 },
        },
      },
    ]);

    const result = stats[0] || {
      activeLinks: 0,
      totalClicks: 0,
      totalLinks: 0,
    };

    return sendSuccess(res, result, "Stats fetched successfully", 200);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export { createLink, getLink, getUserLinks, redirectLink, userlinksStats };
