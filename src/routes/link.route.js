import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createLink,
  getLink,
  getUserLinks,
  redirectLink,
  userlinksStats,
  checkSlug,
} from "../controllers/link.controller.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

router.post("/", authMiddleware, upload.single("ogImage"), createLink);
router.get("/check-slug/:slug", authMiddleware, checkSlug);
router.get("/", authMiddleware, getUserLinks);
router.get("/stats", authMiddleware, userlinksStats);
router.get("/redirect/:slug", redirectLink);
router.get("/:slug", getLink);
export default router;
