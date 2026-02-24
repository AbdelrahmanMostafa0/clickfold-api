import { Router } from "express";
import {
  getProfile,
  updateProfile,
  requestDeleteProfile,
  confirmDeleteProfile,
} from "../controllers/profile.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();
router.get("/", authMiddleware, getProfile);
router.patch("/", authMiddleware, upload.single("avatar"), updateProfile);
router.delete("/", authMiddleware, requestDeleteProfile);
router.delete("/confirm-delete", confirmDeleteProfile);

export default router;
