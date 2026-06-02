"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWishlistStore } from "@/store/wishlistStore";
import { ProductCard } from "@/components/product/ProductCard";
import { getProducts } from "@/lib/products";
import type { Product } from "@/types";

export default function WishlistPage() {
  const ids = useWishlistStore((s) => s.ids);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (ids.length === 0) {
      setProducts([]);
      return;
    }
    getProducts({ limit: 48 })
      .then((res) => setProducts(res.data.filter((p) => ids.includes(p._id))))
      .catch(() => setProducts([]));
  }, [ids]);

  return (
    <div className="pt-32 pb-section">
      <div className="luxury-container">
        <Link href="/account" className="text-[10px] uppercase tracking-editorial text-muted">
          ← Account
        </Link>
        <h1 className="editorial-heading mt-6 text-5xl">Wishlist</h1>
        {products.length === 0 ? (
          <p className="mt-12 text-muted">No saved pieces yet.</p>
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
            {products.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
