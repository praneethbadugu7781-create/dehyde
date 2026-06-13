import { Router } from "express";
import { Coupon } from "../models/Coupon.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

// Public route to list active coupons
router.get(
  "/active",
  asyncHandler(async (req, res) => {
    const coupons = await Coupon.find({
      isActive: true,
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }],
    }).select("code type value minOrder maxDiscount");
    res.json({ success: true, data: coupons });
  })
);

// Public route to validate a coupon
router.get(
  "/validate",
  asyncHandler(async (req, res) => {
    const { code, subtotal } = req.query;
    if (!code) {
      res.status(400).json({ success: false, message: "Coupon code is required" });
      return;
    }

    const coupon = await Coupon.findOne({
      code: String(code).toUpperCase().trim(),
      isActive: true,
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }],
    });

    if (!coupon) {
      res.status(404).json({ success: false, message: "Invalid coupon code" });
      return;
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      res.status(400).json({ success: false, message: "Coupon usage limit reached" });
      return;
    }

    const subtotalNum = Number(subtotal || 0);
    if (subtotalNum < coupon.minOrder) {
      res.status(400).json({
        success: false,
        message: `Minimum purchase amount of ₹${coupon.minOrder} is required to use this coupon.`,
      });
      return;
    }

    res.json({
      success: true,
      data: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minOrder: coupon.minOrder,
        maxDiscount: coupon.maxDiscount,
      },
    });
  })
);

export default router;
