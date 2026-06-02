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

        <div className="flex flex-col gap-12 lg:flex-row">
          <ShopFilters filters={filters} onChange={setFilters} />
          <div className="flex-1">
            <p className="mb-8 text-xs text-muted">{products.length} pieces</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:gap-x-8">
              {products.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
            {products.length === 0 && (
              <p className="text-sm text-muted">No products yet. Admin-added products will appear here.</p>
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
