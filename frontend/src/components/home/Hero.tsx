"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api";

interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  mobileImage?: string;
  link?: string;
  cta?: string;
}

const FALLBACK_BANNER: Banner = {
  _id: "fallback",
  title: "Premium wear for modern living",
  subtitle: "Warm Winter Layers",
  image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=2400&q=90",
  cta: "See all collections",
  link: "/shop"
};

const TICKER_DETAILS = [
  "Urban", "Latest", "Premium", "Arctic", "Casual", "Iconic", "Unique"
];

export function Hero() {
  const [banners, setBanners] = useState<Banner[]>([FALLBACK_BANNER]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function loadBanners() {
      try {
        const res = await apiClient.get<{ success: boolean; data: Banner[] }>("/banners?placement=hero");
        if (res.success && res.data.length > 0) {
          setBanners(res.data);
        }
      } catch (err) {
        console.error("Failed to load banners", err);
      }
    }
    loadBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const activeBanner = banners[currentIndex];

  return (
    <section className="relative w-full overflow-hidden bg-black flex flex-col pt-16">
      {/* Main Campaign Slide View */}
      <div className="relative w-full aspect-[4/5] md:aspect-[16/9] min-h-[500px] md:max-h-[750px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeBanner._id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={activeBanner.image}
              alt={activeBanner.title || "DEHYDE Campaign"}
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
            {/* Soft dark overlay to make text highly legible */}
            <div className="absolute inset-0 bg-black/35" />
          </motion.div>
        </AnimatePresence>

        {/* Content Wrapper */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 md:p-16 text-white max-w-[1400px] mx-auto w-full">
          <div className="max-w-2xl flex flex-col items-start">
            {/* Pill Badge Container */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-3 backdrop-blur-md bg-white/15 border border-white/20 rounded-full p-1 pr-4 mb-6"
            >
              <span className="bg-white text-black text-[9px] uppercase tracking-widest font-bold px-3 py-1 rounded-full">
                Soft
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-white/90">
                {activeBanner.subtitle || "Warm Winter Layers"}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-display text-4xl md:text-6xl font-bold tracking-[-0.035em] leading-[1.05] whitespace-pre-line"
            >
              {activeBanner.title}
            </motion.h1>

            {/* Description Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-4 text-xs md:text-sm text-white/70 max-w-lg leading-relaxed font-light"
            >
              Upgrade your everyday wardrobe with minimal silhouettes, comfortable geometry, and timeless layers crafted for modern living.
            </motion.p>

            {/* Call to Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link
                href={activeBanner.link || "/shop"}
                className="inline-flex items-center justify-center text-[11px] uppercase tracking-wider font-semibold rounded-full bg-white text-black px-6 py-3.5 hover:bg-neutral-200 transition-colors"
              >
                {activeBanner.cta || "See all collections"}
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center text-[11px] uppercase tracking-wider font-semibold rounded-full border border-white/30 bg-transparent text-white px-6 py-3.5 hover:bg-white hover:text-black transition-all duration-300"
              >
                Contact us
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Under-Hero Horizontal auto-scroll Category Ticker */}
      <div className="w-full bg-[#f8f8f8] py-4 border-y border-black/5 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap text-[10px] md:text-xs uppercase tracking-[0.2em] font-medium text-neutral-400">
          {Array(8).fill(TICKER_DETAILS).flat().map((item, idx) => (
            <span key={idx} className="mx-6 flex items-center gap-10">
              <span className="text-black/85 font-semibold">{item}</span>
              <span className="h-4 w-px bg-black/10 select-none"></span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
