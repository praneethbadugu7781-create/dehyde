import { Router } from "express";
import multer from "multer";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { uploadImage } from "../services/cloudinaryService.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const router = Router();

router.post(
  "/",
  authenticate,
  requireAdmin,
  upload.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400).json({ success: false, message: "No file uploaded" });
      return;
    }
    const url = await uploadImage(req.file.buffer, req.body.folder || "dehyde/products");
    res.json({ success: true, data: { url } });
  })
);

export default router;
