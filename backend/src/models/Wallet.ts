import mongoose, { Schema, Document, Types } from "mongoose";

export type CoinTransactionType = "earn" | "redeem" | "expire" | "adjust";

export interface ICoinTransaction {
  type: CoinTransactionType;
  amount: number;
  orderId?: Types.ObjectId;
  description: string;
  expiresAt?: Date;
  createdAt: Date;
}

export interface IWallet extends Document {
  user: Types.ObjectId;
  balance: number;
  totalEarned: number;
  totalRedeemed: number;
  history: ICoinTransaction[];
}

const transactionSchema = new Schema<ICoinTransaction>(
  {
    type: { type: String, enum: ["earn", "redeem", "expire", "adjust"], required: true },
    amount: { type: Number, required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    description: String,
    expiresAt: Date,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const walletSchema = new Schema<IWallet>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", unique: true, required: true },
    balance: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
    totalRedeemed: { type: Number, default: 0 },
    history: [transactionSchema],
  },
  { timestamps: true }
);

export const Wallet = mongoose.model<IWallet>("Wallet", walletSchema);
