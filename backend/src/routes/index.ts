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

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/rewards", walletRoutes);
router.use("/admin", adminRoutes);
router.use("/upload", uploadRoutes);
router.use("/banners", bannerRoutes);

router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "DEHYDE API",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

export default router;
