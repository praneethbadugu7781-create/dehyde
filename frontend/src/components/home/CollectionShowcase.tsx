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
  "shirts": {
    tag: "Shirts",
    subtitle: "Premium Shirts Collection",
    desc: "Organic cotton and soft linen shirts designed for effortless style and breathable comfort.",
    minPrice: "₹999",
    maxPrice: "₹1,999",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600&auto=format&fit=crop"
  },
  "t-shirts": {
    tag: "T-Shirts",
    subtitle: "Heavyweight T-Shirts",
    desc: "Premium structural drop-shoulder crewneck tees crafted from high-density organic cotton.",
    minPrice: "₹599",
    maxPrice: "₹1,299",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop"
  },
  "pants": {
    tag: "Pants",
    subtitle: "Urban Pants & Cargos",
    desc: "Utility trousers and tapered cargos styled with multi-pocket storage and custom hems.",
    minPrice: "₹1,499",
    maxPrice: "₹2,999",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600&auto=format&fit=crop"
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
    { _id: "1", name: "Shirts", slug: "shirts", description: "" },
    { _id: "2", name: "T-Shirts", slug: "t-shirts", description: "" },
    { _id: "3", name: "Pants", slug: "pants", description: "" }
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
            className="inline-flex items-center justify-center text-[11px] uppercase tracking-wider font-semibold rounded-full bg-royal text-white px-5 py-2.5 hover:bg-blue-800 transition-colors"
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
                className="group flex flex-col bg-transparent overflow-hidden transition-all duration-300"
              >
                <Link href={`/shop?category=${col.slug}`} className="flex flex-col h-full">
                  {/* Image Section */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
                    <Image
                      src={meta.image}
                      alt={col.name}
                      fill
                      className="object-cover transition-transform duration-1000 ease-luxury group-hover:scale-103"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute left-4 top-4 bg-white/95 backdrop-blur-sm border border-black/5 px-3 py-1 z-10 flex items-center shadow-sm">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-neutral-800">
                        {meta.tag}
                      </span>
                    </div>
                  </div>

                  {/* Info Content Section */}
                  <div className="pt-3 flex flex-col justify-between flex-1 bg-transparent px-0">
                    <div>
                      <h3 className="font-campton font-medium text-[16px] leading-[1.2] text-black uppercase tracking-wide">
                        {meta.subtitle}
                      </h3>
                      <p className="mt-2 text-xs text-neutral-500 leading-relaxed font-light font-sans">
                        {meta.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-xs font-semibold text-black">
                      <span className="text-neutral-400 font-normal uppercase tracking-wider text-[10px]">Pricing starts from:</span>
                      <div className="flex items-center gap-1.5 font-sans font-bold text-sm md:text-[16px]">
                        <span>{meta.minPrice}</span>
                        <span className="text-neutral-300 font-light">—</span>
                        <span className="text-neutral-400 line-through text-[10px] font-normal">{meta.maxPrice}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
