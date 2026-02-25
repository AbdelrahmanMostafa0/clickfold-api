import { Router } from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  forgotPassword,
  googleAuth,
  resetPassword,
  logoutUser,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/google", googleAuth);
router.post("/login", loginUser);
router.post("/refresh", refreshAccessToken);
router.post("/logout", authMiddleware, logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
