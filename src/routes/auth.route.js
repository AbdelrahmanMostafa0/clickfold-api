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
import { csrfProtection } from "../middlewares/csrf.middleware.js";
import {
  authLimiter,
  forgotPasswordLimiter,
} from "../middlewares/rateLimit.middleware.js";

const router = Router();

router.post("/register", authLimiter, registerUser);
router.post("/google", authLimiter, googleAuth);
router.post("/login", authLimiter, loginUser);
router.post("/refresh", refreshAccessToken);
router.post("/logout", authMiddleware, csrfProtection, logoutUser);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
