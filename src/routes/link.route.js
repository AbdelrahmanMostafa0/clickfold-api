import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createLink,
  updateLink,
  getLink,
  getUserLinks,
  redirectLink,
  userlinksStats,
  checkSlug,
  deleteLink,
  getLinkOg,
  getLinkAnalytics,
} from "../controllers/link.controller.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

router.post("/", authMiddleware, upload.single("ogImage"), createLink);
router.get("/", authMiddleware, getUserLinks);
router.put("/:slug", authMiddleware, upload.single("ogImage"), updateLink);
router.delete("/:slug", authMiddleware, deleteLink);
router.get("/stats", authMiddleware, userlinksStats);
router.get("/analytics/:slug", authMiddleware, getLinkAnalytics);
router.get("/redirect/:slug", redirectLink);
router.get("/check-slug/:slug", authMiddleware, checkSlug);
router.get("/og/:slug", getLinkOg);
router.get("/:slug", authMiddleware, getLink);
export default router;
