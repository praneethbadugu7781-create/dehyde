import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";

export function ensureDb(_req: Request, res: Response, next: NextFunction): void {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({
      success: false,
      message:
        "Database is not connected. Check MongoDB Atlas network access and run: cd backend && npm run seed",
    });
    return;
  }
  next();
}
