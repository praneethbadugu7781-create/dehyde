import mongoose, { Schema, Document, Types } from "mongoose";

export interface IOrderItem {
  product: Types.ObjectId;
  title: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  rewardCoins: number;
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface IOrder extends Document {
  user: Types.ObjectId;
  orderNumber: string;
  items: IOrderItem[];
  shippingAddress: Record<string, string>;
  subtotal: number;
  discount: number;
  couponCode?: string;
  coinsRedeemed: number;
  coinDiscount: number;
  shipping: number;
  shippingMethod?: string;
  total: number;
  coinsEarned: number;
  status: OrderStatus;
  paymentMethod: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  trackingNumber?: string;
  notes?: string;
}

const orderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: "Product" },
  title: String,
  image: String,
  size: String,
  color: String,
  quantity: Number,
  price: Number,
  rewardCoins: Number,
});

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderNumber: { type: String, unique: true, required: true },
    items: [orderItemSchema],
    shippingAddress: { type: Schema.Types.Mixed, required: true },
    subtotal: Number,
    discount: { type: Number, default: 0 },
    couponCode: String,
    coinsRedeemed: { type: Number, default: 0 },
    coinDiscount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    shippingMethod: { type: String, default: "standard" },
    total: Number,
    coinsEarned: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"],
      default: "pending",
    },
    paymentMethod: { type: String, default: "razorpay" },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    trackingNumber: String,
    notes: String,
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>("Order", orderSchema);
