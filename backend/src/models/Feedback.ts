import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFeedback extends Document {
  user?: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  type: "suggestion" | "feedback" | "inquiry";
  message: string;
  status: "pending" | "approved" | "rejected";
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    type: { type: String, enum: ["suggestion", "feedback", "inquiry"], default: "suggestion" },
    message: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    rating: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true }
);

export const Feedback = mongoose.model<IFeedback>("Feedback", feedbackSchema);
