"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { apiClient } from "@/lib/api";
import type { Product } from "@/types";
import { productImage } from "@/lib/products";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SearchOverlay({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }
    const timer = window.setTimeout(() => {
      apiClient
        .get<{ success: boolean; data: Product[] }>(`/products/search?q=${encodeURIComponent(trimmed)}`)
        .then((res) => setResults(res.data))
        .catch(() => setResults([]));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-offwhite"
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="luxury-container pt-32"
          >
            <div className="flex items-center gap-4 border-b border-charcoal/10 pb-6">
              <Search className="h-5 w-5 text-muted" strokeWidth={1} />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search collections, pieces..."
                className="flex-1 bg-transparent font-serif text-2xl outline-none placeholder:text-muted md:text-4xl"
              />
              <button type="button" onClick={onClose} aria-label="Close search">
                <X className="h-6 w-6" strokeWidth={1} />
              </button>
            </div>

            {results.length > 0 && (
              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {results.map((p) => (
                  <Link key={p._id} href={`/product/${p.slug}`} onClick={onClose} className="group flex gap-4">
                    <motion.div className="relative h-24 w-20 overflow-hidden bg-stone/10">
                      {productImage(p) ? (
                        <Image src={productImage(p)} alt={p.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[9px] uppercase tracking-editorial text-muted">DEHYDE</div>
                      )}
                    </motion.div>
                    <motion.div>
                      <p className="text-sm">{p.title}</p>
                      <p className="mt-1 text-xs text-muted">{formatPrice(p.price)}</p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
