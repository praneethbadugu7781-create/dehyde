import { connectDB } from "../config/db.js";
import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";

async function seedProducts() {
  await connectDB();
  console.log("Seeding premium streetwear products...");

  // Purge existing products first
  await Product.deleteMany({});

  // Query categories
  const categories = await Category.find({});
  const categoryMap = new Map(categories.map((c) => [c.slug, c._id]));

  const getCatId = (slug: string) => {
    const id = categoryMap.get(slug);
    if (!id) {
      throw new Error(`Category not found for slug: ${slug}`);
    }
    return id;
  };

  const PRODUCTS = [
    {
      title: "Airess Heavyweight Tee",
      slug: "airess-heavyweight-tee",
      description: "Crafted from premium heavyweight organic cotton with a comfortable dropped-shoulder fit, detailed seams, and breathable boxy construction designed for everyday luxury streetwear wear.",
      category: getCatId("t-shirts"),
      price: 599,
      compareAtPrice: 1299,
      sizes: ["S", "M", "L", "XL"],
      images: [
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=600&auto=format&fit=crop"
      ],
      variants: [
        { color: "Sand", colorHex: "#c2b280", images: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop"], stock: 50 },
        { color: "Charcoal", colorHex: "#242424", images: ["https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=600&auto=format&fit=crop"], stock: 35 }
      ],
      stock: 85,
      rewardCoins: 50,
      featured: true,
      trending: true,
      tags: ["tee", "oversized", "heavyweight", "streetwear"],
      isActive: true
    },
    {
      title: "Signature Boxy Graphic Tee",
      slug: "signature-boxy-graphic-tee",
      description: "Features a clean typography front graphic print, vintage pre-shrunk washed finish, and premium structure for effortless casual street styling.",
      category: getCatId("t-shirts"),
      price: 499,
      compareAtPrice: 999,
      sizes: ["M", "L", "XL"],
      images: [
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=600&auto=format&fit=crop"
      ],
      variants: [
        { color: "Black", colorHex: "#000000", images: ["https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600&auto=format&fit=crop"], stock: 60 }
      ],
      stock: 60,
      rewardCoins: 40,
      featured: true,
      trending: false,
      tags: ["tee", "graphic", "boxy", "oversized"],
      isActive: true
    },
    {
      title: "Weekend Knit Cargo Pants",
      slug: "weekend-knit-cargo-pants",
      description: "Premium French Terry knit lounge pants with utility cargo flap pockets, adjustable thick drawstring waistband, and tailored elastic cuffed ankles.",
      category: getCatId("pants"),
      price: 1499,
      compareAtPrice: 2999,
      sizes: ["30", "32", "34"],
      images: [
        "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=600&auto=format&fit=crop"
      ],
      variants: [
        { color: "Stone Grey", colorHex: "#877f7d", images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600&auto=format&fit=crop"], stock: 40 }
      ],
      stock: 40,
      rewardCoins: 100,
      featured: true,
      trending: true,
      tags: ["pants", "cargo", "knit", "lounge"],
      isActive: true
    },
    {
      title: "Travelator 4-Way Flex Cargo",
      slug: "travelator-4-way-flex-cargo",
      description: "Constructed with water-resistant lightweight 4-way stretch fabric, dual zip utility pockets, and custom knee paneling for advanced comfort and articulation.",
      category: getCatId("pants"),
      price: 1899,
      compareAtPrice: 3499,
      sizes: ["30", "32", "34", "36"],
      images: [
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop"
      ],
      variants: [
        { color: "Olive", colorHex: "#808000", images: ["https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop"], stock: 30 }
      ],
      stock: 30,
      rewardCoins: 150,
      featured: false,
      trending: true,
      tags: ["cargo", "stretch", "pants", "utility"],
      isActive: true
    },
    {
      title: "Signature Heavyweight Hoodie",
      slug: "signature-heavyweight-hoodie",
      description: "Ultra-heavy 450GSM loopback cotton hoodie with double-lined structural hood, kangaroo front pouch, and drop-shoulder boxy athletic fit.",
      category: getCatId("t-shirts"),
      price: 1999,
      compareAtPrice: 3999,
      sizes: ["S", "M", "L", "XL"],
      images: [
        "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=600&auto=format&fit=crop"
      ],
      variants: [
        { color: "Deep Black", colorHex: "#121212", images: ["https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=600&auto=format&fit=crop"], stock: 45 }
      ],
      stock: 45,
      rewardCoins: 180,
      featured: true,
      trending: true,
      tags: ["hoodie", "heavyweight", "streetwear", "essentials"],
      isActive: true
    },
    {
      title: "Urban Utility Box Shirt",
      slug: "urban-utility-box-shirt",
      description: "Relaxed fit casual shirt with breathable structure, dual chest flap utility pockets, and organic button closures.",
      category: getCatId("shirts"),
      price: 1199,
      compareAtPrice: 2499,
      sizes: ["M", "L", "XL"],
      images: [
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600&auto=format&fit=crop"
      ],
      variants: [
        { color: "Cream", colorHex: "#fffdd0", images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600&auto=format&fit=crop"], stock: 35 }
      ],
      stock: 35,
      rewardCoins: 80,
      featured: false,
      trending: true,
      tags: ["shirt", "utility", "boxy", "casual"],
      isActive: true
    }
  ];

  for (const prod of PRODUCTS) {
    await Product.create(prod);
  }

  console.log("Seeding complete. Streetwear products are populated in MongoDB.");
  process.exit(0);
}

seedProducts().catch((e) => {
  console.error("Failed to seed products:", e);
  process.exit(1);
});
