import { Router } from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  //   forgotPassword,
  googleAuth,
  //   resetPassword,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", registerUser);
router.post("/google", googleAuth);
router.post("/login", loginUser);
router.post("/refresh", refreshAccessToken);
// router.post("/forgot-password", forgotPassword);
// router.post("/reset-password", resetPassword);

export default router;
