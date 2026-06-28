import mongoose, { Schema, Document } from "mongoose";

export interface IOffer extends Document {
  title: string;
  type: "buyXgetY";
  buyQuantity: number;
  getQuantity: number;
  targetType: "all" | "category" | "product";
  targetCategories: mongoose.Types.ObjectId[];
  targetProducts: mongoose.Types.ObjectId[];
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
}

const offerSchema = new Schema<IOffer>(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ["buyXgetY"], default: "buyXgetY", required: true },
    buyQuantity: { type: Number, required: true, default: 2 },
    getQuantity: { type: Number, required: true, default: 1 },
    targetType: { type: String, enum: ["all", "category", "product"], default: "all", required: true },
    targetCategories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    targetProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    isActive: { type: Boolean, default: true },
    startDate: Date,
    endDate: Date,
  },
  { timestamps: true }
);

export const Offer = mongoose.model<IOffer>("Offer", offerSchema);
