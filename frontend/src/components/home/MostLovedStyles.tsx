"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Store, MessageSquare, Star, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { getProducts } from "@/lib/products";
import type { Product } from "@/types";

// Standard mock products for preview when the database contains no items yet
const MOCK_PRODUCTS: Product[] = [
  {
    _id: "mock1",
    title: "Oversized Heavyweight Tee",
    slug: "oversized-heavyweight-tee",
    description: "Premium cotton oversized streetwear t-shirt with dropped shoulders.",
    category: "oversized-tees" as any,
    price: 699,
    compareAtPrice: 1299,
    sizes: ["S", "M", "L", "XL"],
    variants: [
      { color: "White", colorHex: "#ffffff", images: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80", "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80"], stock: 20 },
      { color: "Black", colorHex: "#000000", images: ["https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80"], stock: 15 }
    ],
    images: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80", "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80"],
    stock: 35,
    rewardCoins: 50,
    featured: true,
    trending: true,
    tags: ["Tee", "Oversized", "Essentials"]
  },
  {
    _id: "mock2",
    title: "Signature Cargo Pants",
    slug: "signature-cargo-pants",
    description: "Multi-pocket durable cargo pants with a modern tapered fit.",
    category: "cargo-pants" as any,
    price: 1499,
    compareAtPrice: 2499,
    sizes: ["30", "32", "34"],
    variants: [
      { color: "Khaki", colorHex: "#c2b280", images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80"], stock: 12 },
      { color: "Olive", colorHex: "#556b2f", images: ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80"], stock: 8 }
    ],
    images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80"],
    stock: 20,
    rewardCoins: 100,
    featured: true,
    trending: true,
    tags: ["Cargos", "Pants", "Streetwear"]
  },
  {
    _id: "mock3",
    title: "Urban Utility Hoodie",
    slug: "urban-utility-hoodie",
    description: "Premium heavy brushed hoodie with front kangaroo pocket.",
    category: "streetwear" as any,
    price: 1899,
    compareAtPrice: 2999,
    sizes: ["M", "L", "XL"],
    variants: [
      { color: "Charcoal", colorHex: "#2f3e46", images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80"], stock: 15 }
    ],
    images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80"],
    stock: 15,
    rewardCoins: 150,
    featured: false,
    trending: true,
    tags: ["Hoodie", "Warm", "Urban"]
  },
  {
    _id: "mock4",
    title: "Relaxed Fit Denim Jacket",
    slug: "relaxed-fit-denim-jacket",
    description: "Vintage wash heavyweight denim jacket with button chest closures.",
    category: "streetwear" as any,
    price: 2299,
    compareAtPrice: 3999,
    sizes: ["S", "M", "L"],
    variants: [
      { color: "Denim Blue", colorHex: "#4682b4", images: ["https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80"], stock: 10 }
    ],
    images: ["https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80"],
    stock: 10,
    rewardCoins: 200,
    featured: true,
    trending: false,
    tags: ["Jacket", "Denim", "Outerwear"]
  },
  {
    _id: "mock5",
    title: "Classic Linen Casual Shirt",
    slug: "classic-linen-casual-shirt",
    description: "Breathable linen shirt for relaxed premium styling.",
    category: "casual-shirts" as any,
    price: 1199,
    compareAtPrice: 1999,
    sizes: ["M", "L", "XL"],
    variants: [
      { color: "Beige", colorHex: "#f5f5dc", images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80"], stock: 12 }
    ],
    images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80"],
    stock: 12,
    rewardCoins: 80,
    featured: false,
    trending: false,
    tags: ["Shirt", "Casual", "Linen"]
  },
  {
    _id: "mock6",
    title: "Modern Tailored Blazer",
    slug: "modern-tailored-blazer",
    description: "Premium slim-fit structural blazer suited for formal and smart-casual moments.",
    category: "casual-shirts" as any,
    price: 2999,
    compareAtPrice: 4999,
    sizes: ["M", "L", "XL"],
    variants: [
      { color: "Navy Blue", colorHex: "#000080", images: ["https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80"], stock: 5 }
    ],
    images: ["https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80"],
    stock: 5,
    rewardCoins: 250,
    featured: false,
    trending: false,
    tags: ["Blazer", "Tailored", "Formal"]
  },
  {
    _id: "mock7",
    title: "Retro Ribbed Knit Tee",
    slug: "retro-ribbed-knit-tee",
    description: "Slim-fit ribbed knit cotton t-shirt with contrast hems.",
    category: "oversized-tees" as any,
    price: 799,
    compareAtPrice: 1499,
    sizes: ["S", "M", "L"],
    variants: [
      { color: "Black", colorHex: "#000000", images: ["https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80"], stock: 25 }
    ],
    images: ["https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80"],
    stock: 25,
    rewardCoins: 60,
    featured: false,
    trending: false,
    tags: ["Tee", "Knit", "Retro"]
  },
  {
    _id: "mock8",
    title: "Aesthetic Streetwear Crewneck",
    slug: "aesthetic-streetwear-crewneck",
    description: "Relaxed fit sweatshirt in heavy cream cotton fleece.",
    category: "essentials" as any,
    price: 1699,
    compareAtPrice: 2799,
    sizes: ["M", "L", "XL"],
    variants: [
      { color: "Cream", colorHex: "#fffdd0", images: ["https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80"], stock: 15 }
    ],
    images: ["https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80"],
    stock: 15,
    rewardCoins: 120,
    featured: false,
    trending: false,
    tags: ["Crewneck", "Sweatshirt", "Essentials"]
  }
];

export function MostLovedStyles() {
  const [activeTab, setActiveTab] = useState<"best-sellers" | "new-in">("best-sellers");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const queryParams =
      activeTab === "best-sellers"
        ? { trending: true, limit: 8 }
        : { sort: "newest", limit: 8 };

    getProducts(queryParams)
      .then((res) => {
        // If DB has actual products, use them. Otherwise fallback to mock database
        if (res.success && res.data && res.data.length > 0) {
          setProducts(res.data);
        } else {
          // Filter mock list for representation
          const filteredMocks = MOCK_PRODUCTS.filter(p => 
            activeTab === "best-sellers" ? p.trending : p.featured
          );
          setProducts(filteredMocks.length > 0 ? filteredMocks : MOCK_PRODUCTS.slice(0, 4));
        }
      })
      .catch(() => {
        const filteredMocks = MOCK_PRODUCTS.filter(p => 
          activeTab === "best-sellers" ? p.trending : p.featured
        );
        setProducts(filteredMocks.length > 0 ? filteredMocks : MOCK_PRODUCTS.slice(0, 4));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activeTab]);

  return (
    <section className="bg-white font-sans">
      {/* 1. Stats Grid Container (Style Union inspired) */}
      <div className="border-y border-black/10 py-10 md:py-14 bg-neutral-50/50">
        <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-black/10 text-center">
            {/* Stat 1 */}
            <div className="flex flex-col items-center justify-center p-4">
              <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center mb-4 text-black">
                <Store className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <span className="text-3xl md:text-4xl font-extrabold tracking-tight text-black font-sans">
                160+
              </span>
              <span className="mt-1 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
                Stores across India
              </span>
            </div>

            {/* Stat 2 */}
            <div className="flex flex-col items-center justify-center p-4 md:pl-8">
              <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center mb-4 text-black">
                <MessageSquare className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <span className="text-3xl md:text-4xl font-extrabold tracking-tight text-black font-sans">
                16L+
              </span>
              <span className="mt-1 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
                Reviews On Google
              </span>
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col items-center justify-center p-4 md:pl-8">
              <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center mb-4 text-black">
                <Star className="w-5 h-5 fill-black" strokeWidth={1.5} />
              </div>
              <span className="text-3xl md:text-4xl font-extrabold tracking-tight text-black font-sans">
                4.8+
              </span>
              <span className="mt-1 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
                Google Rating
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Most Loved Styles Layout */}
      <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10 py-20 md:py-28">
        {/* Creative Title row with Category silhouette navigation */}
        <div className="flex flex-col items-center justify-center text-center gap-6 mb-12">
          <div className="flex items-center justify-center gap-8 md:gap-16 w-full max-w-4xl">
            {/* Men Silhouette Button */}
            <Link 
              href="/shop?category=men" 
              className="group flex flex-col items-center gap-2 hover:opacity-100 transition-opacity"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border border-black/10 flex items-center justify-center bg-white shadow-sm group-hover:border-black transition-all duration-300">
                <svg className="w-6 h-6 text-neutral-400 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 group-hover:text-black transition-colors">
                Men
              </span>
            </Link>

            {/* Core Section title */}
            <div className="flex-1">
              <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold block mb-2">
                Hot Picks
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-[-0.02em] text-black uppercase">
                Most Loved Styles
              </h2>
            </div>

            {/* Women Silhouette Button */}
            <Link 
              href="/shop?category=women" 
              className="group flex flex-col items-center gap-2 hover:opacity-100 transition-opacity"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border border-black/10 flex items-center justify-center bg-white shadow-sm group-hover:border-black transition-all duration-300">
                <svg className="w-6 h-6 text-neutral-400 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </div>
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 group-hover:text-black transition-colors">
                Women
              </span>
            </Link>
          </div>

          {/* Toggle Tab Selectors */}
          <div className="flex gap-4 border-b border-black/5 pb-2 mt-8">
            <button
              onClick={() => setActiveTab("best-sellers")}
              className={`text-xs md:text-sm font-bold uppercase tracking-[0.2em] px-4 py-2 border-b-2 transition-all duration-300 ${
                activeTab === "best-sellers"
                  ? "border-black text-black font-extrabold"
                  : "border-transparent text-neutral-400 hover:text-black"
              }`}
            >
              Best Sellers
            </button>
            <button
              onClick={() => setActiveTab("new-in")}
              className={`text-xs md:text-sm font-bold uppercase tracking-[0.2em] px-4 py-2 border-b-2 transition-all duration-300 ${
                activeTab === "new-in"
                  ? "border-black text-black font-extrabold"
                  : "border-transparent text-neutral-400 hover:text-black"
              }`}
            >
              New In
            </button>
          </div>
        </div>

        {/* Product Cards Grid with Fade transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4 mt-12"
          >
            {products.map((product, i) => (
              <ProductCard key={product._id} product={product} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* View All Collection Link */}
        <div className="mt-16 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-black border-b border-black pb-1 hover:opacity-75 transition-opacity"
          >
            View Full Collections <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
