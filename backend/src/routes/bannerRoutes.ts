import { Router } from "express";
import { Banner } from "../models/Banner.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

// Public route to get active banners
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { placement } = req.query;
    const filter: Record<string, unknown> = { isActive: true };
    if (placement) {
      filter.placement = placement;
    }
    
    const banners = await Banner.find(filter).sort("order").lean();
    res.json({ success: true, data: banners });
  })
);

export default router;
