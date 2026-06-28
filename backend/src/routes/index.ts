import { Router } from "express";
import mongoose from "mongoose";
import authRoutes from "./authRoutes.js";
import productRoutes from "./productRoutes.js";
import orderRoutes from "./orderRoutes.js";
import wishlistRoutes from "./wishlistRoutes.js";
import walletRoutes from "./walletRoutes.js";
import adminRoutes from "./adminRoutes.js";
import uploadRoutes from "./uploadRoutes.js";

import bannerRoutes from "./bannerRoutes.js";
import settingRoutes from "./settingRoutes.js";
import couponRoutes from "./couponRoutes.js";
import feedbackRoutes from "./feedbackRoutes.js";
import offerRoutes from "./offerRoutes.js";

const router = Router();

// Disable caching for all API endpoints to ensure client-side state is always fresh
router.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  next();
});

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/rewards", walletRoutes);
router.use("/admin", adminRoutes);
router.use("/upload", uploadRoutes);
router.use("/banners", bannerRoutes);
router.use("/settings", settingRoutes);
router.use("/coupons", couponRoutes);
router.use("/feedback", feedbackRoutes);
router.use("/offers", offerRoutes);

router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "DEHYDE API",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

export default router;

