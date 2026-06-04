import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";
import { Category } from "../models/Category.js";
import { Settings } from "../models/Settings.js";

const CATEGORIES = [
  { name: "Oversized Tees", slug: "oversized-tees", order: 1 },
  { name: "Cargo Pants", slug: "cargo-pants", order: 2 },
  { name: "Streetwear", slug: "streetwear", order: 3 },
  { name: "Essentials", slug: "essentials", order: 4 },
  { name: "Casual Shirts", slug: "casual-shirts", order: 5 },
];

async function seed() {
  await connectDB();
  console.log("Seeding DEHYDE...");

  const adminHash = await bcrypt.hash(env.admin.password, 12);
  await User.findOneAndUpdate(
    { email: env.admin.email },
    { name: "DEHYDE Admin", email: env.admin.email, password: adminHash, role: "admin" },
    { upsert: true }
  );

  await Settings.findOneAndUpdate(
    { key: "global" },
    {
      rewardsEnabled: true,
      maxCoinRedemptionPercent: 30,
      coinExpiryDays: 365,
      freeShippingThreshold: 2999,
      defaultShippingFee: 99,
      expressShippingFee: 149,
    },
    { upsert: true }
  );

  for (const cat of CATEGORIES) {
    await Category.findOneAndUpdate({ slug: cat.slug }, { ...cat, isActive: true }, { upsert: true });
  }

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
