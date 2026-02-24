import { Router } from "express";
import {
  getProfile,
  updateProfile,
} from "../controllers/profile.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();
router.patch("/", authMiddleware, upload.single("avatar"), updateProfile);
router.get("/", authMiddleware, getProfile);

export default router;
