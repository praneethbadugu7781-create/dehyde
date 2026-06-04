"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import type { Category } from "@/types";

interface CategoryMeta {
  tag: string;
  subtitle: string;
  desc: string;
  minPrice: string;
  maxPrice: string;
  image: string;
}

const CATEGORY_MAP: Record<string, CategoryMeta> = {
  men: {
    tag: "Mens's wear",
    subtitle: "Premium modern collection for men",
    desc: "Upgrade your daily look with our crafted pieces made from the finest fabrics for lasting comfort and timeless style.",
    minPrice: "₹1,499",
    maxPrice: "₹4,999",
    image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=600&auto=format&fit=crop"
  },
  women: {
    tag: "Women's wear",
    subtitle: "Modern daily wear for women",
    desc: "Elevate your style with our signature soft pieces designed to make every single day feel truly fresh and special.",
    minPrice: "₹1,299",
    maxPrice: "₹3,999",
    image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=80&w=600&auto=format&fit=crop"
  },
  kids: {
    tag: "Children's wear",
    subtitle: "Modern easy styles for children",
    desc: "Provide your children with the best soft touch gear made for play & long lasting wear throughout every single busy day.",
    minPrice: "₹999",
    maxPrice: "₹2,499",
    image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=600&auto=format&fit=crop"
  },
  children: {
    tag: "Children's wear",
    subtitle: "Modern easy styles for children",
    desc: "Provide your children with the best soft touch gear made for play & long lasting wear throughout every single busy day.",
    minPrice: "₹999",
    maxPrice: "₹2,499",
    image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=600&auto=format&fit=crop"
  }
};

export function CollectionShowcase() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    apiClient
      .get<{ success: boolean; data: Category[] }>("/products/categories")
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  // Ensure we display at least our default collections if backend has none
  const displayCategories = categories.length > 0 ? categories : [
    { _id: "1", name: "Men's Wear", slug: "men", description: "" },
    { _id: "2", name: "Women's Wear", slug: "women", description: "" },
    { _id: "3", name: "Children's Wear", slug: "kids", description: "" }
  ];

  return (
    <section className="py-20 bg-[#f8f8f8] border-t border-black/5 font-sans">
      <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10">
        {/* Header Block */}
        <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end border-b border-black/5 pb-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-semibold">
              Our Collections
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2 text-black tracking-tight">
              Modern collections defined by simplicity
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center text-[11px] uppercase tracking-wider font-semibold rounded-full bg-black text-white px-5 py-2.5 hover:bg-neutral-800 transition-colors"
          >
            Shop all items
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {displayCategories.map((col, i) => {
            const meta = CATEGORY_MAP[col.slug.toLowerCase()] || {
              tag: col.name,
              subtitle: col.name,
              desc: col.description || "Premium quality modern streetwear items selected for effortless fit.",
              minPrice: "₹1,499",
              maxPrice: "₹3,999",
              image: col.image || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop"
            };

            return (
              <motion.article
                key={col._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                className="group flex flex-col bg-white border border-black/5 rounded-xl overflow-hidden hover:shadow-lg hover:border-black/15 transition-all duration-300"
              >
                {/* Image Section */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100 border-b border-black/5">
                  <Image
                    src={meta.image}
                    alt={col.name}
                    fill
                    className="object-cover transition-transform duration-1000 ease-luxury group-hover:scale-103"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute left-4 top-4 bg-white/90 backdrop-blur-sm border border-black/5 rounded-full px-3 py-1 z-10 flex items-center">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-neutral-800">
                      {meta.tag}
                    </span>
                  </div>
                </div>

                {/* Info Content Section */}
                <div className="p-6 flex flex-col justify-between flex-1 bg-white">
                  <div>
                    <h3 className="font-display text-lg font-bold text-black tracking-tight leading-snug">
                      {meta.subtitle}
                    </h3>
                    <p className="mt-3 text-xs text-neutral-500 leading-relaxed font-light">
                      {meta.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-5 border-t border-black/5 flex flex-col gap-4">
                    <div className="flex items-center justify-between text-xs font-semibold text-black">
                      <span className="text-neutral-400 font-normal">Pricing starts from:</span>
                      <div className="flex items-center gap-1.5">
                        <span>{meta.minPrice}</span>
                        <span className="text-neutral-300 font-light">—</span>
                        <span className="text-neutral-400 line-through text-[10px] font-normal">{meta.maxPrice}</span>
                      </div>
                    </div>

                    <Link
                      href={`/shop?category=${col.slug}`}
                      className="w-full text-center text-[10px] uppercase tracking-wider font-semibold rounded-full border border-black/10 py-3 hover:bg-black hover:text-white transition-colors"
                    >
                      All collections
                    </Link>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
