import { Router } from "express";
import { Offer } from "../models/Offer.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

// Public route to list active offers
router.get(
  "/active",
  asyncHandler(async (req, res) => {
    const now = new Date();
    const offers = await Offer.find({
      isActive: true,
      $and: [
        {
          $or: [
            { startDate: { $exists: false } },
            { startDate: null },
            { startDate: { $lte: now } },
          ],
        },
        {
          $or: [
            { endDate: { $exists: false } },
            { endDate: null },
            { endDate: { $gte: now } },
          ],
        },
      ],
    })
      .populate("targetCategories", "name slug")
      .select("title type buyQuantity getQuantity targetType targetCategories targetProducts");

    res.json({ success: true, data: offers });
  })
);

export default router;
