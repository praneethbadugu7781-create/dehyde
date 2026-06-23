import mongoose, { Schema, Document } from "mongoose";

export interface IProductVariantSize {
  size: string;
  stock: number;
}

export interface IProductVariant {
  color: string;
  colorHex?: string;
  images: string[];
  sizes: IProductVariantSize[];
  stock: number;
}

export interface IProduct extends Document {
  title: string;
  slug: string;
  description: string;
  category: mongoose.Types.ObjectId;
  price: number;
  compareAtPrice?: number;
  sizes: string[];
  variants: IProductVariant[];
  images: string[];
  stock: number;
  rewardCoins: number;
  featured: boolean;
  trending: boolean;
  tags: string[];
  isActive: boolean;
  lowStockThreshold: number;
}

const variantSizeSchema = new Schema<IProductVariantSize>({
  size: { type: String, required: true },
  stock: { type: Number, default: 0 },
});

const variantSchema = new Schema<IProductVariant>({
  color: { type: String, required: true },
  colorHex: String,
  images: [String],
  sizes: [variantSizeSchema],
  stock: { type: Number, default: 0 },
});

const productSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    price: { type: Number, required: true },
    compareAtPrice: Number,
    sizes: [String],
    variants: [variantSchema],
    images: [String],
    stock: { type: Number, default: 0 },
    rewardCoins: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },
    tags: [String],
    isActive: { type: Boolean, default: true },
    lowStockThreshold: { type: Number, default: 5 },
  },
  { timestamps: true }
);

productSchema.pre("save", function (next) {
  let totalProductStock = 0;
  if (this.variants && this.variants.length > 0) {
    this.variants.forEach((v) => {
      if (v.sizes && v.sizes.length > 0) {
        v.stock = v.sizes.reduce((sum, s) => sum + (s.stock || 0), 0);
      }
      totalProductStock += v.stock || 0;
    });
    this.stock = totalProductStock;
  }
  next();
});

productSchema.index({ title: "text", description: "text", tags: "text" });

export const Product = mongoose.model<IProduct>("Product", productSchema);
