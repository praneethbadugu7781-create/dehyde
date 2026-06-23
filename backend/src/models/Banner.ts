import mongoose, { Schema, Document } from "mongoose";

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  price?: string;
  layout?: "campaign" | "bottom-left";
  image?: string;
  mobileImage?: string;
  link?: string;
  cta?: string;
  order: number;
  isActive: boolean;
  placement: "hero" | "promo";
}

const bannerSchema = new Schema<IBanner>(
  {
    title: String,
    subtitle: String,
    price: String,
    layout: { type: String, enum: ["bottom-left", "campaign"], default: "bottom-left" },
    image: {
      type: String,
      required: function (this: any) {
        return this.placement !== "promo";
      },
    },
    mobileImage: String,
    link: String,
    cta: String,
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    placement: { type: String, enum: ["hero", "promo"], default: "hero" },
  },
  { timestamps: true }
);

export const Banner = mongoose.model<IBanner>("Banner", bannerSchema);
