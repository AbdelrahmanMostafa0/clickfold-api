import Link from "../models/link.model.js";
import fs from "fs";
import { sendSuccess, sendError } from "../utils/response.js";
import cloudinary from "../utils/cloudinary.js";
import geoip from "geoip-lite";
import { UAParser } from "ua-parser-js";
import Click from "../models/click.model.js";
import { nanoid } from "nanoid";
import { formatSlug } from "../utils/link.js";
import scrapeOG from "../utils/ogFetch.js";

const createLink = async (req, res) => {
  try {
    const { slug, destination, ogTitle, ogDescription, susPopups, ogMode } =
      req.body;

    const linkExists = await Link.findOne({ slug });
    if (linkExists) {
      if (req.file) fs.unlinkSync(req.file.path);
      return sendError(res, "Slug already exists", 400);
    }
    if (ogMode === "custom" && !req.file) {
      return sendError(res, "Image is required for custom OG mode", 400);
    }

    let og = {
      title: "",
      description: "",
      image: null,
    };
    let ogImage = null;
    if (req.file && ogMode === "custom") {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "b8lnk/og-preview",
        transformation: {
          width: 1200,
          height: 630,
          crop: "fill",
          gravity: "auto",
        },
      });
      ogImage = result.secure_url;
    }
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    switch (ogMode) {
      case "original":
        const ogData = await scrapeOG(destination);
        og = {
          title: ogData.title,
          description: ogData.description,
          image: ogData.image,
        };
        break;
      case "custom":
        og = { title: ogTitle, description: ogDescription, image: ogImage };
        break;
      case "none":
      default:
        og = { title: "", description: "", image: "" };
    }
    const link = await Link.create({
      slug: formatSlug(slug),
      destination,
      og,
      susPopups: susPopups === "true",
      ogMode,
      createdBy: req.user._id,
    });

    return sendSuccess(res, link, "Link created successfully", 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const updateLink = async (req, res) => {
  try {
    const { slug } = req.params;
    const link = await Link.findOne({ slug, isDeleted: { $ne: true } });
    if (link.createdBy.toString() !== req.user._id.toString()) {
      return sendError(res, "Unauthorized", 401);
    }
    const {
      slug: newSlug,
      destination,
      ogTitle,
      ogDescription,
      ogImage: ogImageString,
      ogMode,
      susPopups,
    } = req.body;
    if (!link) {
      if (req.file) fs.unlinkSync(req.file.path);
      return sendError(res, "Link not found", 404);
    }
    let ogImage = null;
    if (req.file) {
      // User uploaded a file — upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "b8lnk/og-preview",
        transformation: {
          width: 1200,
          height: 630,
          crop: "fill",
          gravity: "auto",
        },
      });
      ogImage = result.secure_url;
      fs.unlinkSync(req.file.path);
    } else if (ogImageString) {
      // User sent the image as a URL string
      ogImage = ogImageString;
    }
    let og;
    switch (ogMode) {
      case "original":
        const ogData = await scrapeOG(destination);
        og = {
          title: ogData.title,
          description: ogData.description,
          image: ogData.image,
        };
        break;
      case "custom":
        og = { title: ogTitle, description: ogDescription, image: ogImage };
        break;
      case "none":
      default:
        og = { title: "", description: "", image: "" };
    }
    const updatedLink = await Link.findByIdAndUpdate(
      link._id,
      {
        slug: formatSlug(newSlug),
        destination,
        og,
        susPopups: susPopups === "true",
        ogMode,
      },
      { new: true },
    );
    return sendSuccess(res, updatedLink, "Link updated successfully", 200);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const deleteLink = async (req, res) => {
  try {
    const { slug } = req.params;
    const link = await Link.findOne({ slug, isDeleted: { $ne: true } });

    if (!link) {
      return sendError(res, "Link not found", 404);
    }

    if (link.createdBy.toString() !== req.user._id.toString()) {
      return sendError(res, "Unauthorized", 401);
    }
    await Link.findByIdAndUpdate(link._id, {
      isDeleted: true,
      deletedAt: Date.now(),
    });
    return sendSuccess(res, null, "Link deleted successfully", 200);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
const getLink = async (req, res) => {
  try {
    const { slug } = req.params;
    const link = await Link.findOne({ slug });
    if (link.createdBy.toString() !== req.user._id.toString()) {
      return sendError(res, "Unauthorized", 401);
    }
    return sendSuccess(res, link, "Link fetched successfully", 200);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const getUserLinks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { createdBy: req.user._id, isDeleted: { $ne: true } };

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      mostClicked: { clicks: -1 },
    };
    const sort = sortOptions[req.query.sortBy] || sortOptions.newest;

    const [links, total] = await Promise.all([
      Link.find(filter).sort(sort).skip(skip).limit(limit),
      Link.countDocuments(filter),
    ]);

    return sendSuccess(
      res,
      {
        links,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      },
      "Links fetched successfully",
      200,
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const redirectLink = async (req, res) => {
  try {
    const { slug } = req.params;
    const link = await Link.findOne({ slug, isDeleted: false });
    if (!link) {
      return sendError(res, "Link not found", 404);
    }
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

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
const getLinkOg = async (req, res) => {
  try {
    const { slug } = req.params;
    const link = await Link.findOne({ slug, isDeleted: false });
    if (!link) {
      return sendError(res, "Link not found", 404);
    }
    return sendSuccess(res, link, "OG fetched successfully", 200);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
const checkSlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const link = await Link.findOne({ slug, isDeleted: false });
    if (link) {
      const suggestions = [];
      const candidates = Array.from(
        { length: 6 },
        () => `${slug}-${nanoid(4)}`,
      );
      const taken = await Link.find({ slug: { $in: candidates } }).select(
        "slug",
      );
      const takenSlugs = new Set(taken.map((l) => l.slug));
      const available = candidates
        .filter((c) => !takenSlugs.has(c))
        .slice(0, 4);
      suggestions.push(...available);
      return sendSuccess(res, suggestions, "Slug already exists", 400);
    }
    return sendSuccess(res, null, "Slug is available", 200);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const userlinksStats = async (req, res) => {
  try {
    const stats = await Link.aggregate([
      { $match: { createdBy: req.user._id } },
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

const getLinkAnalytics = async (req, res) => {
  try {
    const { slug } = req.params;
    const days = Math.min(Math.max(parseInt(req.query.days) || 7, 1), 90);

    const link = await Link.findOne({ slug, isDeleted: { $ne: true } });
    if (!link) {
      return sendError(res, "Link not found", 404);
    }
    if (link.createdBy.toString() !== req.user._id.toString()) {
      return sendError(res, "Unauthorized", 401);
    }

    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const matchStage = { link: link._id, createdAt: { $gte: since } };

    const [aggregation, recentClicks] = await Promise.all([
      Click.aggregate([
        { $match: matchStage },
        {
          $facet: {
            clicksByDate: [
              {
                $group: {
                  _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                  },
                  clicks: { $sum: 1 },
                },
              },
              { $sort: { _id: 1 } },
              { $project: { _id: 0, date: "$_id", clicks: 1 } },
            ],
            topCountries: [
              { $group: { _id: "$country", clicks: { $sum: 1 } } },
              { $sort: { clicks: -1 } },
              { $limit: 5 },
              { $project: { _id: 0, name: "$_id", clicks: 1 } },
            ],
            topCities: [
              { $group: { _id: "$city", clicks: { $sum: 1 } } },
              { $sort: { clicks: -1 } },
              { $limit: 5 },
              { $project: { _id: 0, name: "$_id", clicks: 1 } },
            ],
            topDevices: [
              { $group: { _id: "$device", clicks: { $sum: 1 } } },
              { $sort: { clicks: -1 } },
              { $project: { _id: 0, name: "$_id", clicks: 1 } },
            ],
            topBrowsers: [
              { $group: { _id: "$browser", clicks: { $sum: 1 } } },
              { $sort: { clicks: -1 } },
              { $limit: 5 },
              { $project: { _id: 0, name: "$_id", clicks: 1 } },
            ],
            topOS: [
              { $group: { _id: "$os", clicks: { $sum: 1 } } },
              { $sort: { clicks: -1 } },
              { $limit: 5 },
              { $project: { _id: 0, name: "$_id", clicks: 1 } },
            ],
            topReferrers: [
              { $match: { referer: { $ne: null } } },
              { $group: { _id: "$referer", clicks: { $sum: 1 } } },
              { $sort: { clicks: -1 } },
              { $limit: 5 },
              { $project: { _id: 0, name: "$_id", clicks: 1 } },
            ],
            uniqueVisitors: [{ $group: { _id: "$ip" } }, { $count: "count" }],
            totalClicks: [{ $count: "count" }],
          },
        },
      ]),
      Click.find({ link: link._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("country city device browser os referer createdAt -_id"),
    ]);

    const result = aggregation[0];

    return sendSuccess(
      res,
      {
        link: {
          slug: link.slug,
          destination: link.destination,
          clicks: link.clicks,
          isActive: link.isActive,
          createdAt: link.createdAt,
        },
        analytics: {
          totalClicks: result.totalClicks[0]?.count || 0,
          uniqueVisitors: result.uniqueVisitors[0]?.count || 0,
          clicksByDate: result.clicksByDate,
          topCountries: result.topCountries,
          topCities: result.topCities,
          topDevices: result.topDevices,
          topBrowsers: result.topBrowsers,
          topOS: result.topOS,
          topReferrers: result.topReferrers,
          recentClicks,
        },
      },
      "Analytics fetched successfully",
      200,
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export {
  createLink,
  getLink,
  getUserLinks,
  redirectLink,
  userlinksStats,
  checkSlug,
  updateLink,
  deleteLink,
  getLinkOg,
  getLinkAnalytics,
};
