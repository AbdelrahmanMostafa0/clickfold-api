import { Router } from "express";
import authRoutes from "./auth.route.js";
import profileRoutes from "./ profile.route.js";
import linkRoutes from "./link.route.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/links", linkRoutes);

export default router;
