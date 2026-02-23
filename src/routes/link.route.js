import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createLink,
  getLink,
  getUserLinks,
} from "../controllers/link.controller.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

router.post("/", authMiddleware, upload.single("ogImage"), createLink);
router.get("/", authMiddleware, getUserLinks);
router.get("/:slug", getLink);
export default router;
