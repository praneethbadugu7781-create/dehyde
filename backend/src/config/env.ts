import dotenv from "dotenv";
dotenv.config();

function required(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env: ${key}`);
  return v;
}

export const env = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/dehyde",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "dev-access-secret-change-in-prod",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-in-prod",
    accessExpires: process.env.JWT_ACCESS_EXPIRES || "7d",
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || "7d",
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "",
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
  admin: {
    email: process.env.ADMIN_EMAIL || "admin@dehyde.in",
    password: process.env.ADMIN_PASSWORD || "admin123",
  },
  rewards: {
    enabled: process.env.REWARDS_ENABLED !== "false",
    maxRedemptionPercent: parseInt(process.env.MAX_COIN_REDEMPTION_PERCENT || "70", 10),
    expiryDays: parseInt(process.env.COIN_EXPIRY_DAYS || "365", 10),
  },
};
