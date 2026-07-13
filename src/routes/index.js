import { Router } from "express";
import authRoutes from "./auth.route.js";
import profileRoutes from "./profile.route.js";
import linkRoutes from "./link.route.js";
import uploadRoutes from "./upload.route.js";
import campaignRoutes from "./campaign.route.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/links", linkRoutes);
router.use("/upload", uploadRoutes);
router.use("/campaigns", campaignRoutes);

export default router;
