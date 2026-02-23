import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createLink,
  getLink,
  getUserLinks,
} from "../controllers/link.controller.js";

const router = Router();

router.post("/", authMiddleware, createLink);
router.get("/", authMiddleware, getUserLinks);
router.get("/:slug", getLink);
export default router;
