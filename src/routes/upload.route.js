import { Router } from "express";
import upload from "../middlewares/multer.middleware.js";
import cloudinary from "../utils/cloudinary.js";

const router = Router();

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "linkpulse/uploads",
      transformation: {
        width: 1200,
        height: 630,
        crop: "fill",
        gravity: "auto",
      },
    });

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        size: result.bytes,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
