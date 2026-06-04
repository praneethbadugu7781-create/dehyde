import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
  key: string;
  rewardsEnabled: boolean;
  maxCoinRedemptionPercent: number;
  coinExpiryDays: number;
  freeShippingThreshold: number;
  defaultShippingFee: number;
  warehousePincode: string;
  warehouseCity: string;
  warehouseState: string;
  warehouseAddress: string;
  expressShippingFee: number;
}

const settingsSchema = new Schema<ISettings>(
  {
    key: { type: String, default: "global", unique: true },
    rewardsEnabled: { type: Boolean, default: true },
    maxCoinRedemptionPercent: { type: Number, default: 30 },
    coinExpiryDays: { type: Number, default: 365 },
    freeShippingThreshold: { type: Number, default: 2999 },
    defaultShippingFee: { type: Number, default: 99 },
    warehousePincode: { type: String, default: "560001" },
    warehouseCity: { type: String, default: "Bengaluru" },
    warehouseState: { type: String, default: "Karnataka" },
    warehouseAddress: { type: String, default: "DEHYDE Fulfillment Center, MG Road" },
    expressShippingFee: { type: Number, default: 149 },
  },
  { timestamps: true }
);

export const Settings = mongoose.model<ISettings>("Settings", settingsSchema);
