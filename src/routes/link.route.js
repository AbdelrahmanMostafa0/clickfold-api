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
} from "../controllers/link.controller.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

router.post("/", authMiddleware, upload.single("ogImage"), createLink);
router.get("/", authMiddleware, getUserLinks);
router.put("/:slug", authMiddleware, upload.single("ogImage"), updateLink);
router.delete("/:slug", authMiddleware, deleteLink);
router.get("/:slug", getLink);
router.get("/stats", authMiddleware, userlinksStats);
router.get("/redirect/:slug", redirectLink);
router.get("/check-slug/:slug", authMiddleware, checkSlug);
export default router;
