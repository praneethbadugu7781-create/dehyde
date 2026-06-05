"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/product/ProductCard";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { getProducts } from "@/lib/products";
import type { Product } from "@/types";

function ShopContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const sort = searchParams.get("sort") || "newest";
  const [filters, setFilters] = useState({ size: "", color: "", minPrice: 0, maxPrice: 10000 });
  const [products, setProducts] = useState<Product[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    getProducts({
      category: category || undefined,
      sort,
      size: filters.size || undefined,
      minPrice: filters.minPrice || undefined,
      maxPrice: filters.maxPrice < 10000 ? filters.maxPrice : undefined,
      limit: 48,
    })
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]));
  }, [category, sort, filters]);

  return (
    <div className="pt-32 pb-section">
      <div className="luxury-container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
          <p className="text-[10px] uppercase tracking-editorial text-muted">Shop</p>
          <h1 className="editorial-heading mt-4 text-5xl capitalize md:text-6xl">
            {category ? category.replace(/-/g, " ") : "All pieces"}
          </h1>
        </motion.div>

        <div className="flex items-center justify-between border-b border-black/5 pb-4 mb-8">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-black hover:opacity-70 transition-all border border-black/10 rounded-full px-4 py-2 hover:bg-neutral-50 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="17" y1="12" y2="12"/><line x1="13" x2="3" y1="12" y2="12"/><line x1="21" x2="11" y1="20" y2="20"/><line x1="7" x2="3" y1="20" y2="20"/><line x1="14" y1="2" x2="14" y2="6"/><line x1="17" y1="10" x2="17" y2="14"/><line x1="7" y1="18" x2="7" y2="22"/></svg>
            Filter
          </button>
          <p className="text-xs text-muted font-sans font-medium">{products.length} pieces</p>
        </div>

        <div className="flex flex-col gap-12 lg:flex-row items-start">
          {showFilters && (
            <div className="w-full lg:w-[240px] flex-shrink-0 animate-in fade-in slide-in-from-left duration-300">
              <ShopFilters filters={filters} onChange={setFilters} />
            </div>
          )}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:gap-x-8">
              {products.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
            {products.length === 0 && (
              <p className="text-sm text-muted">No products</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="luxury-container pt-32">Loading...</div>}>
      <ShopContent />
    </Suspense>
  );
}
