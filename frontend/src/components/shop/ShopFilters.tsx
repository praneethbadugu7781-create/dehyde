"use client";

import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";

interface Filters {
  size: string;
  color: string;
  minPrice: number;
  maxPrice: number;
}

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
}

const SIZES = ["S", "M", "L", "XL", "28", "30", "32", "34"];
const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "trending", label: "Trending" },
  { value: "price_asc", label: "Price: Low" },
  { value: "price_desc", label: "Price: High" },
];

export function ShopFilters({ filters, onChange }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") || "newest";

  return (
    <aside className="w-full shrink-0 lg:w-56">
      <p className="text-[10px] uppercase tracking-editorial text-muted">Filter</p>
      <motion.div className="mt-6 space-y-8">
        <div>
          <p className="mb-3 text-xs">Sort</p>
          <div className="flex flex-wrap gap-2">
            {SORTS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => {
                  const p = new URLSearchParams(searchParams.toString());
                  p.set("sort", s.value);
                  router.push(`/shop?${p.toString()}`);
                }}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-wider transition-colors ${
                  sort === s.value ? "bg-charcoal text-offwhite" : "text-muted hover:text-charcoal"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs">Size</p>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onChange({ ...filters, size: filters.size === size ? "" : size })}
                className={`min-w-[40px] border px-3 py-2 text-[10px] uppercase ${
                  filters.size === size
                    ? "border-charcoal bg-charcoal text-offwhite"
                    : "border-charcoal/20 hover:border-charcoal"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs">Max price</p>
          <input
            type="range"
            min={500}
            max={10000}
            step={500}
            value={filters.maxPrice}
            onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
            className="w-full accent-charcoal"
          />
          <p className="mt-2 text-xs text-muted">Up to ₹{filters.maxPrice.toLocaleString("en-IN")}</p>
        </div>
      </motion.div>
    </aside>
  );
}
