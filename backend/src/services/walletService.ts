import { Types } from "mongoose";
import { Wallet } from "../models/Wallet.js";
import { Settings } from "../models/Settings.js";
import { env } from "../config/env.js";

async function getSettings() {
  let s = await Settings.findOne({ key: "global" });
  if (!s) {
    s = await Settings.create({
      key: "global",
      rewardsEnabled: env.rewards.enabled,
      maxCoinRedemptionPercent: env.rewards.maxRedemptionPercent,
      coinExpiryDays: env.rewards.expiryDays,
    });
  }
  return s;
}

export async function getOrCreateWallet(userId: Types.ObjectId | string) {
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    wallet = await Wallet.create({ user: userId, balance: 0, history: [] });
  }
  return wallet;
}

export async function creditCoins(
  userId: Types.ObjectId | string,
  amount: number,
  orderId: Types.ObjectId,
  description: string
) {
  const settings = await getSettings();
  if (!settings.rewardsEnabled || amount <= 0) return;

  const wallet = await getOrCreateWallet(userId);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + settings.coinExpiryDays);

  wallet.balance += amount;
  wallet.totalEarned += amount;
  wallet.history.push({
    type: "earn",
    amount,
    orderId,
    description,
    expiresAt,
    createdAt: new Date(),
  });
  await wallet.save();
}

export async function redeemCoins(
  userId: Types.ObjectId | string,
  amount: number,
  orderId: Types.ObjectId
) {
  const wallet = await getOrCreateWallet(userId);
  if (wallet.balance < amount) throw new Error("Insufficient coins");

  wallet.balance -= amount;
  wallet.totalRedeemed += amount;
  wallet.history.push({
    type: "redeem",
    amount,
    orderId,
    description: `Redeemed on order`,
    createdAt: new Date(),
  });
  await wallet.save();
}

export async function calculateMaxRedeemable(
  userId: Types.ObjectId | string,
  orderSubtotal: number
): Promise<{ maxCoins: number; maxDiscount: number }> {
  const settings = await getSettings();
  if (!settings.rewardsEnabled) return { maxCoins: 0, maxDiscount: 0 };

  const wallet = await getOrCreateWallet(userId);
  const maxByPercent = Math.floor((orderSubtotal * settings.maxCoinRedemptionPercent) / 100);
  const maxCoins = Math.min(wallet.balance, maxByPercent);
  return { maxCoins, maxDiscount: maxCoins };
}
