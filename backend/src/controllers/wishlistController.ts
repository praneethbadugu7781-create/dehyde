import { User } from "../models/User.js";
import { AuthRequest } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const getWishlist = asyncHandler(async (req: AuthRequest, res) => {
  const user = await User.findById(req.user!.userId).populate({
    path: "wishlist",
    match: { isActive: true },
  });
  res.json({ success: true, data: user?.wishlist || [] });
});

export const toggleWishlist = asyncHandler(async (req: AuthRequest, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.user!.userId);
  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }
  const idx = user.wishlist.findIndex((id) => String(id) === productId);
  if (idx >= 0) user.wishlist.splice(idx, 1);
  else user.wishlist.push(productId);
  await user.save();
  res.json({ success: true, data: user.wishlist, added: idx < 0 });
});
