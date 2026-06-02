import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAddress {
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  avatar?: string;
  googleId?: string;
  role: "user" | "admin";
  addresses: IAddress[];
  wishlist: Types.ObjectId[];
  otpHash?: string;
  otpExpires?: Date;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>(
  {
    label: String,
    fullName: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false },
    phone: String,
    avatar: String,
    googleId: { type: String, sparse: true, unique: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    addresses: [addressSchema],
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    otpHash: String,
    otpExpires: Date,
    refreshToken: String,
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
