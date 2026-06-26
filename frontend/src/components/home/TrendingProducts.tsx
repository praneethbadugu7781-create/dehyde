"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { getProducts } from "@/lib/products";
import type { Product } from "@/types";

export function TrendingProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts({ trending: true, limit: 4 })
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]));
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="py-20 bg-[#f8f8f8] border-t border-black/5 font-sans">
      <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10">
        {/* Header Block */}
        <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end border-b border-black/5 pb-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-semibold">
              Best sellers
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2 text-royal tracking-tight">
              Our signature best selling pieces
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center text-[11px] uppercase tracking-wider font-semibold rounded-full bg-royal text-white px-5 py-2.5 hover:bg-neutral-800 transition-colors"
          >
            See all collections
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p._id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
