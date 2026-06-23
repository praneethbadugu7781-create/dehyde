import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { initCloudinary } from "./services/cloudinaryService.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use((req, res, next) => {
  res.on("finish", () => {
    console.log(`[API] ${req.method} ${req.path} - ${res.statusCode}`);
  });
  next();
});

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
const allowedOrigins = [
  env.clientUrl,
  "https://dehyde.in",
  "https://www.dehyde.in",
  "http://localhost:3000",
  "http://localhost:3001",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.endsWith(".dehyde.in") ||
        origin.endsWith(".vercel.app");
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
  })
);

initCloudinary();
app.use("/uploads", express.static("public/uploads")); // Serve local uploads statically
app.use("/api", routes);
app.use(errorHandler);

async function connectWithRetry(attempt = 1): Promise<void> {
  try {
    await connectDB();
    try {
      const { Banner } = await import("./models/Banner.js");
      const res = await Banner.deleteMany({ placement: "collection" });
      if (res.deletedCount > 0) {
        console.log(`[DB Cleanup] Deleted ${res.deletedCount} legacy collection banners.`);
      }
    } catch (err) {
      console.error("Failed to clean up legacy collection banners:", err);
    }
  } catch (err) {
    console.error(`MongoDB connection attempt ${attempt} failed:`, err);
    if (attempt < 10) {
      setTimeout(() => connectWithRetry(attempt + 1), 5000);
    }
  }
}

app.listen(env.port, () => {
  console.log(`DEHYDE API running on port ${env.port}`);
  connectWithRetry();
});
