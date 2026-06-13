import { Request, Response } from "express";
import { Feedback } from "../models/Feedback.js";
import { AuthRequest } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// @desc    Submit suggestion/feedback
// @route   POST /api/feedback
// @access  Public (Optionally authenticated)
export const createFeedback = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, phone, type, message } = req.body;

  if (!name || !email || !message) {
    res.status(400);
    throw new Error("Please provide name, email, and message");
  }

  const feedback = await Feedback.create({
    user: req.user?.userId,
    name,
    email,
    phone,
    type: type || "suggestion",
    message,
  });

  res.status(201).json({
    success: true,
    message: "Feedback submitted successfully",
    data: feedback,
  });
});

// @desc    Get all feedback
// @route   GET /api/admin/feedback
// @access  Private (Admin only)
export const getAllFeedback = asyncHandler(async (_req: Request, res: Response) => {
  const feedbacks = await Feedback.find({})
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: feedbacks,
  });
});

// @desc    Delete feedback
// @route   DELETE /api/admin/feedback/:id
// @access  Private (Admin only)
export const deleteFeedback = asyncHandler(async (req: Request, res: Response) => {
  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    res.status(404);
    throw new Error("Feedback record not found");
  }

  await feedback.deleteOne();

  res.json({
    success: true,
    message: "Feedback record deleted successfully",
  });
});
