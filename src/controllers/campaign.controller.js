import Campaign from "../models/campaign.model.js";
import Link from "../models/link.model.js";
import Click from "../models/click.model.js";
import { sendSuccess, sendError } from "../utils/response.js";
import {
  createCampaignSchema,
  updateCampaignSchema,
} from "../validators/campaign.validator.js";

const createCampaign = async (req, res) => {
  try {
    const validationResult = createCampaignSchema.safeParse(req.body);
    if (!validationResult.success) {
      return sendError(res, validationResult.error.errors[0].message, 400);
    }
    const { name, description } = validationResult.data;

    const campaign = await Campaign.create({
      name,
      description: description || "",
      userId: req.user._id,
    });

    return sendSuccess(res, campaign, "Campaign created successfully", 201);
  } catch (error) {
    return sendError(res, error?.message || "Internal Server Error", 500);
  }
};

const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.aggregate([
      {
        $match: { userId: req.user._id, deletedAt: null },
      },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "links",
          let: { campaignId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$campaignId", "$$campaignId"] },
                isDeleted: { $ne: true },
              },
            },
            { $project: { clicks: 1 } },
          ],
          as: "links",
        },
      },
      {
        $addFields: {
          linksCount: { $size: "$links" },
          totalClicks: { $sum: "$links.clicks" },
        },
      },
      { $project: { links: 0 } },
    ]);

    return sendSuccess(res, campaigns, "Campaigns fetched successfully", 200);
  } catch (error) {
    return sendError(res, error?.message || "Internal Server Error", 500);
  }
};

const getCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findOne({
      _id: id,
      userId: req.user._id,
      deletedAt: null,
    });
    if (!campaign) {
      return sendError(res, "Campaign not found", 404);
    }
    return sendSuccess(res, campaign, "Campaign fetched successfully", 200);
  } catch (error) {
    return sendError(res, error?.message || "Internal Server Error", 500);
  }
};

const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const validationResult = updateCampaignSchema.safeParse(req.body);
    if (!validationResult.success) {
      return sendError(res, validationResult.error.errors[0].message, 400);
    }

    const campaign = await Campaign.findOne({
      _id: id,
      userId: req.user._id,
      deletedAt: null,
    });
    if (!campaign) {
      return sendError(res, "Campaign not found", 404);
    }

    Object.assign(campaign, validationResult.data);
    await campaign.save();

    return sendSuccess(res, campaign, "Campaign updated successfully", 200);
  } catch (error) {
    return sendError(res, error?.message || "Internal Server Error", 500);
  }
};

const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findOne({
      _id: id,
      userId: req.user._id,
      deletedAt: null,
    });
    if (!campaign) {
      return sendError(res, "Campaign not found", 404);
    }

    campaign.deletedAt = new Date();
    await campaign.save();

    await Link.updateMany({ campaignId: campaign._id }, { campaignId: null });

    return sendSuccess(res, null, "Campaign deleted successfully", 200);
  } catch (error) {
    return sendError(res, error?.message || "Internal Server Error", 500);
  }
};

const getCampaignStats = async (req, res) => {
  try {
    const { id } = req.params;
    const days = Math.min(Math.max(parseInt(req.query.days) || 30, 1), 90);

    const campaign = await Campaign.findOne({
      _id: id,
      userId: req.user._id,
      deletedAt: null,
    });
    if (!campaign) {
      return sendError(res, "Campaign not found", 404);
    }

    const links = await Link.find({
      campaignId: campaign._id,
      isDeleted: { $ne: true },
    }).select("slug destination clicks isActive createdAt");

    if (links.length === 0) {
      return sendSuccess(
        res,
        {
          campaign,
          links: [],
          analytics: {
            totalClicks: 0,
            clicksByDate: [],
            topCountries: [],
            topDevices: [],
          },
        },
        "Campaign stats fetched successfully",
        200,
      );
    }

    const linkIds = links.map((link) => link._id);

    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const [aggregation] = await Click.aggregate([
      {
        $match: {
          link: { $in: linkIds },
          createdAt: { $gte: since },
        },
      },
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
          topDevices: [
            { $group: { _id: "$device", clicks: { $sum: 1 } } },
            { $sort: { clicks: -1 } },
            { $project: { _id: 0, name: "$_id", clicks: 1 } },
          ],
          totalClicks: [{ $count: "count" }],
        },
      },
    ]);

    const linksWithClicks = links.map((link) => ({
      _id: link._id,
      slug: link.slug,
      destination: link.destination,
      clicks: link.clicks,
      isActive: link.isActive,
      createdAt: link.createdAt,
    }));

    return sendSuccess(
      res,
      {
        campaign,
        links: linksWithClicks,
        analytics: {
          totalClicks: aggregation.totalClicks[0]?.count || 0,
          clicksByDate: aggregation.clicksByDate,
          topCountries: aggregation.topCountries,
          topDevices: aggregation.topDevices,
        },
      },
      "Campaign stats fetched successfully",
      200,
    );
  } catch (error) {
    return sendError(res, error?.message || "Internal Server Error", 500);
  }
};

export {
  createCampaign,
  getCampaigns,
  getCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignStats,
};
