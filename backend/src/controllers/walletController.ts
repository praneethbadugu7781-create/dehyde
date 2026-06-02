import { AuthRequest } from "../middleware/auth.js";
import { getOrCreateWallet, calculateMaxRedeemable } from "../services/walletService.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const getWallet = asyncHandler(async (req: AuthRequest, res) => {
  const wallet = await getOrCreateWallet(req.user!.userId);
  res.json({ success: true, data: wallet });
});

export const getMaxRedemption = asyncHandler(async (req: AuthRequest, res) => {
  const subtotal = Number(req.query.subtotal) || 0;
  const result = await calculateMaxRedeemable(req.user!.userId, subtotal);
  res.json({ success: true, data: result });
});
