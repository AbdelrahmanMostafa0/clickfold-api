import { Router } from "express";
import {
  getProfile,
  updateProfile,
  requestDeleteProfile,
  confirmDeleteProfile,
  updatePassword,
  updateAvatar,
} from "../controllers/profile.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();
router.get("/", authMiddleware, getProfile);
router.patch("/", authMiddleware, upload.single("avatar"), updateProfile);
router.patch("/password", authMiddleware, updatePassword);
router.patch("/avatar", authMiddleware, upload.single("avatar"), updateAvatar);
router.delete("/", authMiddleware, requestDeleteProfile);
router.delete("/confirm-delete", confirmDeleteProfile);

export default router;
