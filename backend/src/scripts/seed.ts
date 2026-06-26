import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";
import { Category } from "../models/Category.js";
import { Settings } from "../models/Settings.js";

const CATEGORIES = [
  { name: "Shirts", slug: "shirts", order: 1 },
  { name: "T-Shirts", slug: "t-shirts", order: 2 },
  { name: "Pants", slug: "pants", order: 3 },
  { name: "Tee's", slug: "tees", order: 4 },
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
      maxCoinRedemptionPercent: 70,
      coinExpiryDays: 365,
      freeShippingThreshold: 2999,
      defaultShippingFee: 99,
      expressShippingFee: 149,
    },
    { upsert: true }
  );

  // Clean up any old categories that are not in the new list
  await Category.deleteMany({ slug: { $nin: CATEGORIES.map(c => c.slug) } });

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
