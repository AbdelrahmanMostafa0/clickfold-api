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
import { csrfProtection } from "../middlewares/csrf.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();
router.get("/", authMiddleware, getProfile);
router.patch(
  "/",
  authMiddleware,
  csrfProtection,
  upload.single("avatar"),
  updateProfile,
);
router.patch("/password", authMiddleware, csrfProtection, updatePassword);
router.patch(
  "/avatar",
  authMiddleware,
  csrfProtection,
  upload.single("avatar"),
  updateAvatar,
);
router.delete("/", authMiddleware, csrfProtection, requestDeleteProfile);
router.delete("/confirm-delete", confirmDeleteProfile);

export default router;
