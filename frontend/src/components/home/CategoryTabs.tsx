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
  const [activeTab, setActiveTab] = useState("tees");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Custom outline SVG icons for Tee's, T-Shirts, Shirts, and Pants
  const tabs: TabItem[] = [
    {
      id: "tees",
      name: "Tee's",
      slug: "tees",
      icon: (
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 transition-all duration-300">
          <path d="M24 12 C24 16, 40 16, 40 12" />
          <path d="M24 12 L12 15 L6 26 L15 30 L18 27 L18 58 H46 V27 L49 30 L58 26 L52 15 L40 12" />
        </svg>
      )
    },
    {
      id: "t-shirts",
      name: "T-Shirts",
      slug: "t-shirts",
      icon: (
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 transition-all duration-300">
          <path d="M26 10 C26 14, 38 14, 38 10" />
          <path d="M26 10 L14 13 L8 23 L16 27 L19 25 L19 60 L45 60 L45 25 L48 27 L56 23 L50 13 L38 10" />
          <path d="M19 54 L45 54" />
        </svg>
      )
    },
    {
      id: "shirts",
      name: "Shirts",
      slug: "shirts",
      icon: (
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 transition-all duration-300">
          <path d="M20 12 L32 22 L44 12" />
          <path d="M16 12 L32 26 L48 12" />
          <path d="M16 12 L8 19 L13 27 L19 25 L19 60 L45 60 L45 25 L51 27 L56 19 L48 12" />
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
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 transition-all duration-300">
          <path d="M18 10 H46 V15 H18 Z" />
          <path d="M18 15 L14 60 H25 L29 30 L32 30 L35 30 L39 60 H50 L46 15" />
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
    <section className="py-20 bg-white border-t border-black/5 font-sans relative">
      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-10">
        
        {/* Style Union Flanking Header Selector Layout */}
        <div className="flex flex-row items-center justify-center gap-2 sm:gap-8 md:gap-12 lg:gap-16 mb-16 w-full max-w-4xl mx-auto px-1 sm:px-4">
          
          {/* Left Block (Tee's & T-Shirts side-by-side Tabs) */}
          <div className="flex gap-2.5 sm:gap-8 md:gap-12 items-center justify-center">
            {tabs.slice(0, 2).map((tab) => {
              const isActive = activeTab === tab.slug;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.slug)}
                  className={`flex flex-col items-center gap-2 md:gap-3 group focus:outline-none transition-all duration-300 relative pb-2 ${
                    isActive ? "text-[#c80a0a]" : "text-neutral-400 hover:text-neutral-600"
                  }`}
                >
                  {/* SVG Outline Icon */}
                  <div className={`transform transition-all duration-300 group-hover:scale-105 ${
                    isActive ? "scale-105 drop-shadow-[0_4px_12px_rgba(200,10,10,0.15)]" : ""
                  }`}>
                    {tab.icon}
                  </div>
                  {/* Label */}
                  <span className="text-[8px] sm:text-[10px] md:text-xs uppercase tracking-[0.15em] sm:tracking-[0.25em] font-extrabold transition-colors duration-300">
                    {tab.name}
                  </span>
                  {/* Slide Line Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#c80a0a]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Central Card (white background with thin border) */}
          <div className="w-[85px] h-[85px] sm:w-[130px] sm:h-[130px] md:w-[190px] md:h-[190px] bg-white border border-black/5 flex flex-col items-center justify-center shadow-sm rounded-lg px-1 sm:px-4 pointer-events-none select-none shrink-0">
            <h3 className="font-display text-[#c80a0a] text-[8px] sm:text-xs md:text-lg font-black tracking-wider text-center leading-[1.2] uppercase">
              PREMIUM.<br />AFFORDABLE
            </h3>
          </div>

          {/* Right Block (Shirts & Pants side-by-side Tabs) */}
          <div className="flex gap-2.5 sm:gap-8 md:gap-12 items-center justify-center">
            {tabs.slice(2).map((tab) => {
              const isActive = activeTab === tab.slug;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.slug)}
                  className={`flex flex-col items-center gap-2 md:gap-3 group focus:outline-none transition-all duration-300 relative pb-2 ${
                    isActive ? "text-[#c80a0a]" : "text-neutral-400 hover:text-neutral-600"
                  }`}
                >
                  {/* SVG Outline Icon */}
                  <div className={`transform transition-all duration-300 group-hover:scale-105 ${
                    isActive ? "scale-105 drop-shadow-[0_4px_12px_rgba(200,10,10,0.15)]" : ""
                  }`}>
                    {tab.icon}
                  </div>
                  {/* Label */}
                  <span className="text-[8px] sm:text-[10px] md:text-xs uppercase tracking-[0.15em] sm:tracking-[0.25em] font-extrabold transition-colors duration-300">
                    {tab.name}
                  </span>
                  {/* Slide Line Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#c80a0a]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

        </div>

        {/* Products Grid Section */}
        <div className="relative min-h-[300px]">
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
