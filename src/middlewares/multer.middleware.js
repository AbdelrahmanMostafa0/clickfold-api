import multer from "multer";
import path from "path";
import { nanoid } from "nanoid";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${nanoid()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, WEBP, or GIF images are allowed"));
    }
    cb(null, true);
  },
});

export default upload;
