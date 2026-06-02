"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { getProducts } from "@/lib/products";
import type { Product } from "@/types";

export function NewArrivals() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts({ sort: "newest", limit: 4 })
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]));
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="py-section bg-white">
      <motion.div className="luxury-container">
        <motion.div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <motion.div>
            <p className="text-[10px] uppercase tracking-editorial text-muted">New Arrivals</p>
            <h2 className="editorial-heading mt-4 text-4xl md:text-5xl">Latest Drops</h2>
          </motion.div>
          <Link href="/shop?sort=newest" className="link-underline text-[11px] uppercase tracking-editorial">
            Shop New
          </Link>
        </motion.div>
        <motion.div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
          {products.map((p, i) => (
            <ProductCard key={p._id} product={p} index={i} />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
