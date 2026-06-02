"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { getProducts } from "@/lib/products";
import type { Product } from "@/types";

export function FeaturedProducts() {
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    getProducts({ featured: true, limit: 4 })
      .then((res) => setFeatured(res.data))
      .catch(() => setFeatured([]));
  }, []);

  return (
    <section className="py-section bg-cream/30">
      <motion.div className="luxury-container">
        <motion.div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <motion.div>
            <p className="text-[10px] uppercase tracking-editorial text-muted">Featured</p>
            <h2 className="editorial-heading mt-4 text-4xl md:text-5xl">Signature pieces</h2>
          </motion.div>
          <Link href="/shop" className="link-underline text-[11px] uppercase tracking-editorial">
            Shop all
          </Link>
        </motion.div>
        <motion.div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
          {featured.map((p, i) => (
            <ProductCard key={p._id} product={p} index={i} />
          ))}
        </motion.div>
        {featured.length === 0 && (
          <p className="text-sm text-muted">Products added from admin will appear here.</p>
        )}
      </motion.div>
    </section>
  );
}
