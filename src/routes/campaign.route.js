import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { csrfProtection } from "../middlewares/csrf.middleware.js";
import {
  createCampaign,
  getCampaigns,
  getCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignStats,
} from "../controllers/campaign.controller.js";

const router = Router();

router.use(authMiddleware);
router.use(csrfProtection);

router.post("/", createCampaign);
router.get("/", getCampaigns);
router.get("/:id", getCampaign);
router.put("/:id", updateCampaign);
router.delete("/:id", deleteCampaign);
router.get("/:id/stats", getCampaignStats);

export default router;
