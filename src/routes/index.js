import { Router } from "express";
import authRoutes from "./auth.route.js";
// import linkRoutes from "./links.route.js";
// import aiRoutes from "./ai.route.js";

const router = Router();

router.use("/auth", authRoutes);
// router.use("/links", linkRoutes);
// router.use("/ai", aiRoutes);

export default router;
