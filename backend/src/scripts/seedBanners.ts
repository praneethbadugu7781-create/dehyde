import { connectDB } from "../config/db.js";
import { Banner } from "../models/Banner.js";

const DEFAULT_BANNERS = [
  {
    title: "Winter Wear",
    subtitle: "Warm Winter Layers",
    price: "₹ 1,499 / ONWARDS",
    image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=2400&q=90",
    cta: "See all collections",
    link: "/shop",
    order: 0,
    isActive: true,
    placement: "hero"
  },
  {
    title: "Oversized Tees",
    subtitle: "For Every Mood",
    price: "₹ 599 / ONWARDS",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=2400&q=90",
    cta: "Explore Oversized Tees",
    link: "/shop?category=oversized-tees",
    order: 1,
    isActive: true,
    placement: "hero"
  },
  {
    title: "Streetwear",
    subtitle: "For Every Moment",
    price: "₹ 1,199 / ONWARDS",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=2400&q=90",
    cta: "Explore Streetwear",
    link: "/shop?category=streetwear",
    order: 2,
    isActive: true,
    placement: "hero"
  }
];

async function seedBanners() {
  await connectDB();
  console.log("Seeding premium banners into DEHYDE...");

  // Remove existing hero banners to avoid duplicates
  await Banner.deleteMany({ placement: "hero" });

  for (const b of DEFAULT_BANNERS) {
    await Banner.create(b);
  }

  console.log("Seeding complete. Hero banners are populated in MongoDB.");
  process.exit(0);
}

seedBanners().catch((e) => {
  console.error("Failed to seed banners:", e);
  process.exit(1);
});
