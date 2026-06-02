"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import type { Category } from "@/types";

export function CollectionShowcase() {
  const [collections, setCollections] = useState<Category[]>([]);

  useEffect(() => {
    apiClient
      .get<{ success: boolean; data: Category[] }>("/products/categories")
      .then((res) => setCollections(res.data))
      .catch(() => setCollections([]));
  }, []);

  const visibleCollections = collections.filter((collection) => collection.image);
  if (visibleCollections.length === 0) return null;

  return (
    <section className="py-section">
      <motion.div className="luxury-container">
        <motion.div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <motion.div>
            <p className="text-[10px] uppercase tracking-editorial text-muted">Collections</p>
            <h2 className="editorial-heading mt-4 text-4xl md:text-5xl">Curated for the modern silhouette</h2>
          </motion.div>
          <Link href="/shop" className="link-underline text-[11px] uppercase tracking-editorial">
            View all
          </Link>
        </motion.div>

        <motion.div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleCollections.map((col, i) => (
            <motion.div
              key={col.slug}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className={i === 0 ? "md:col-span-2 lg:row-span-2" : ""}
            >
              <Link href={`/shop?category=${col.slug}`} className="group relative block overflow-hidden">
                <motion.div
                  className={`relative overflow-hidden bg-stone/5 ${
                    i === 0 ? "aspect-[16/10] md:aspect-[2/1]" : "aspect-[4/5]"
                  }`}
                >
                  <Image
                    src={col.image!}
                    alt={col.name}
                    fill
                    className="object-cover transition-transform duration-[1.2s] ease-luxury group-hover:scale-105"
                    sizes={i === 0 ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 50vw, 33vw"}
                  />
                  <motion.div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-90" />
                </motion.div>
                <motion.div className="absolute bottom-0 left-0 p-8 text-offwhite md:p-10">
                  <p className="text-[10px] uppercase tracking-editorial text-offwhite/60">Collection</p>
                  <h3 className="editorial-heading mt-2 text-2xl md:text-3xl">{col.name}</h3>
                  {col.description && <p className="mt-2 max-w-xs text-sm text-offwhite/70">{col.description}</p>}
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
