import mongoose, { Schema, Document } from "mongoose";

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  image: string;
  mobileImage?: string;
  link?: string;
  cta?: string;
  order: number;
  isActive: boolean;
  placement: "hero" | "collection" | "promo";
}

const bannerSchema = new Schema<IBanner>(
  {
    title: String,
    subtitle: String,
    image: { type: String, required: true },
    mobileImage: String,
    link: String,
    cta: String,
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    placement: { type: String, enum: ["hero", "collection", "promo"], default: "hero" },
  },
  { timestamps: true }
);

export const Banner = mongoose.model<IBanner>("Banner", bannerSchema);
