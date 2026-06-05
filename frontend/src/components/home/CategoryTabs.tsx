"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "@/components/product/ProductCard";
import { getProducts } from "@/lib/products";
import type { Product } from "@/types";

interface TabItem {
  id: string;
  name: string;
  slug: string;
  icon: React.ReactNode;
}

export function CategoryTabs() {
  const [activeTab, setActiveTab] = useState("t-shirts");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Outline icons corresponding to Shirts, T-Shirts, and Pants
  const tabs: TabItem[] = [
    {
      id: "t-shirts",
      name: "T-Shirts",
      slug: "t-shirts",
      icon: (
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 md:w-16 md:h-16 transition-all duration-300">
          {/* Crew Neck collar */}
          <path d="M26 10 C26 14, 38 14, 38 10" />
          {/* Body Outline */}
          <path d="M26 10 L14 13 L8 23 L16 27 L19 25 L19 60 L45 60 L45 25 L48 27 L56 23 L50 13 L38 10" />
          {/* Hem line */}
          <path d="M19 54 L45 54" />
        </svg>
      )
    },
    {
      id: "shirts",
      name: "Shirts",
      slug: "shirts",
      icon: (
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 md:w-16 md:h-16 transition-all duration-300">
          {/* Collar */}
          <path d="M20 12 L32 22 L44 12" />
          <path d="M16 12 L32 26 L48 12" />
          {/* Body Outline */}
          <path d="M16 12 L8 19 L13 27 L19 25 L19 60 L45 60 L45 25 L51 27 L56 19 L48 12" />
          {/* Placket/Buttons */}
          <path d="M32 26 L32 60" />
          <circle cx="32" cy="34" r="1.2" fill="currentColor" />
          <circle cx="32" cy="42" r="1.2" fill="currentColor" />
          <circle cx="32" cy="50" r="1.2" fill="currentColor" />
        </svg>
      )
    },
    {
      id: "pants",
      name: "Pants",
      slug: "pants",
      icon: (
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 md:w-16 md:h-16 transition-all duration-300">
          {/* Waistband */}
          <path d="M18 10 H46 V15 H18 Z" />
          {/* Legs */}
          <path d="M18 15 L14 60 H25 L29 30 L32 30 L35 30 L39 60 H50 L46 15" />
          {/* Fly detail */}
          <path d="M32 15 V25" />
          <path d="M18 19 C21 19, 23 15, 23 15" />
          <path d="M46 19 C43 19, 41 15, 41 15" />
        </svg>
      )
    }
  ];

  useEffect(() => {
    setLoading(true);
    getProducts({ category: activeTab, limit: 4 })
      .then((res) => {
        setProducts(res.data);
      })
      .catch(() => {
        setProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activeTab]);

  return (
    <section className="py-20 bg-white border-t border-black/5 font-sans">
      <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10">
        
        {/* Category Switcher Header Concept */}
        <div className="flex flex-col items-center justify-center mb-16 text-center">
          <div className="flex items-center justify-center gap-10 md:gap-16 w-full max-w-2xl">
            
            {/* Left Category: T-Shirts */}
            <button
              onClick={() => setActiveTab("t-shirts")}
              className={`flex flex-col items-center gap-2 group focus:outline-none transition-all duration-300 ${
                activeTab === "t-shirts" ? "text-[#c80a0a]" : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              <div className="transform transition-transform duration-300 group-hover:scale-105">
                {tabs[0].icon}
              </div>
              <span className={`text-[10px] md:text-xs uppercase tracking-[0.2em] font-extrabold transition-colors duration-300`}>
                {tabs[0].name}
              </span>
            </button>

            {/* Central Typography Heading */}
            <div className="px-4 py-2 border-x border-black/5 flex flex-col justify-center min-w-[150px] md:min-w-[240px]">
              <h2 className="font-display text-[#c80a0a] text-xl md:text-3xl font-black tracking-widest uppercase leading-tight">
                Most Loved<br />Styles
              </h2>
            </div>

            {/* Right Categories Column */}
            <div className="flex gap-8 md:gap-12 items-center">
              {tabs.slice(1).map((tab) => {
                const isActive = activeTab === tab.slug;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.slug)}
                    className={`flex flex-col items-center gap-2 group focus:outline-none transition-all duration-300 ${
                      isActive ? "text-[#c80a0a]" : "text-neutral-400 hover:text-neutral-600"
                    }`}
                  >
                    <div className="transform transition-transform duration-300 group-hover:scale-105">
                      {tab.icon}
                    </div>
                    <span className={`text-[10px] md:text-xs uppercase tracking-[0.2em] font-extrabold transition-colors duration-300`}>
                      {tab.name}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>
        </div>

        {/* Products Grid Section */}
        <div className="relative min-h-[350px]">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs uppercase tracking-widest text-neutral-400 animate-pulse">
                Fetching pieces...
              </span>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {products.length > 0 ? (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4"
                >
                  {products.map((p, i) => (
                    <ProductCard key={p._id} product={p} index={i} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key={`empty-${activeTab}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-neutral-100 rounded-2xl"
                >
                  <p className="text-sm font-light text-neutral-400 italic font-sans max-w-sm">
                    No designs added to {activeTab.replace(/-/g, " ")} yet.
                  </p>
                  <Link
                    href="/shop"
                    className="mt-6 inline-flex items-center justify-center text-[10px] uppercase tracking-widest font-extrabold rounded-full border border-black/10 text-neutral-800 px-6 py-2.5 hover:bg-neutral-50 transition-colors"
                  >
                    Shop all items
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

      </div>
    </section>
  );
}
