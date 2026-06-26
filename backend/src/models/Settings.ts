import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
  key: string;
  rewardsEnabled: boolean;
  maxCoinRedemptionPercent: number;
  coinExpiryDays: number;
  freeShippingThreshold: number;
  defaultShippingFee: number;
  expressShippingFee: number;
  introAnimationImage?: string;
}

const settingsSchema = new Schema<ISettings>(
  {
    key: { type: String, default: "global", unique: true },
    rewardsEnabled: { type: Boolean, default: true },
    maxCoinRedemptionPercent: { type: Number, default: 70 },
    coinExpiryDays: { type: Number, default: 365 },
    freeShippingThreshold: { type: Number, default: 2999 },
    defaultShippingFee: { type: Number, default: 99 },
    expressShippingFee: { type: Number, default: 149 },
    introAnimationImage: { type: String, default: "/campaign_streetwear.png" },
  },
  { timestamps: true }
);

export const Settings = mongoose.model<ISettings>("Settings", settingsSchema);
