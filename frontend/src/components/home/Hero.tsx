"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface BannerData {
  id: string;
  title: string;
  subtitle: string;
  price?: string;
  image: string;
  cta: string;
  link: string;
  layout: "campaign" | "bottom-left";
}

const BANNERS: BannerData[] = [
  {
    id: "banner1",
    title: "Premium wear for modern living",
    subtitle: "Warm Winter Layers",
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=2400&q=90",
    cta: "See all collections",
    link: "/shop",
    layout: "campaign"
  },
  {
    id: "banner2",
    title: "Oversized Tees",
    subtitle: "For Every Mood",
    price: "₹ 599 / ONWARDS",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=2400&q=90",
    cta: "Explore Oversized Tees",
    link: "/shop?category=oversized-tees",
    layout: "bottom-left"
  },
  {
    id: "banner3",
    title: "Tailored",
    subtitle: "For Every Moment",
    price: "₹ 199 / ONWARDS",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=2400&q=90",
    cta: "Explore Tailored",
    link: "/shop?category=casual-shirts",
    layout: "bottom-left"
  }
];

export function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BANNERS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const activeBanner = BANNERS[currentIndex];

  const handleScrollDown = () => {
    // Scroll smoothly past the 100vh Hero section
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth"
    });
  };

  return (
    <section className="relative w-full h-[100vh] overflow-hidden bg-black flex flex-col justify-end">
      {/* Background Images with Fade Transition */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeBanner.id}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={activeBanner.image}
              alt={activeBanner.title}
              fill
              priority={currentIndex === 0}
              className="object-cover object-center"
              sizes="100vw"
            />
            {/* Soft dark overlay for text legibility */}
            <div className="absolute inset-0 bg-black/35" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Content Wrapper */}
      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 md:px-10 pb-24 md:pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeBanner.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-2xl flex flex-col items-start text-white"
          >
            {activeBanner.layout === "campaign" ? (
              // Banner 1 Content Layout (Classic Center-Left Campaign)
              <div className="flex flex-col items-start">
                <div className="inline-flex items-center gap-3 backdrop-blur-md bg-white/15 border border-white/20 rounded-full p-1 pr-4 mb-6">
                  <span className="bg-white text-black text-[9px] uppercase tracking-widest font-bold px-3 py-1 rounded-full">
                    Soft
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-white/90">
                    {activeBanner.subtitle}
                  </span>
                </div>

                <h1 className="font-display text-4xl md:text-6xl font-bold tracking-[-0.035em] leading-[1.05]">
                  {activeBanner.title}
                </h1>

                <p className="mt-4 text-xs md:text-sm text-white/70 max-w-lg leading-relaxed font-light font-sans">
                  Upgrade your everyday wardrobe with minimal silhouettes, comfortable geometry, and timeless layers crafted for modern living.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href={activeBanner.link}
                    className="inline-flex items-center justify-center text-[11px] uppercase tracking-wider font-semibold rounded-full bg-white text-black px-6 py-3.5 hover:bg-neutral-200 transition-colors"
                  >
                    {activeBanner.cta}
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center text-[11px] uppercase tracking-wider font-semibold rounded-full border border-white/30 bg-transparent text-white px-6 py-3.5 hover:bg-white hover:text-black transition-all duration-300"
                  >
                    Contact us
                  </Link>
                </div>
              </div>
            ) : (
              // Banners 2 & 3 Content Layout (Style Union bottom-left format)
              <div className="flex flex-col items-start">
                {/* Category Title in heavy uppercase */}
                <h2 className="font-display text-5xl md:text-8xl font-black tracking-[-0.04em] leading-[0.95] uppercase">
                  {activeBanner.title}
                </h2>
                
                {/* Subtitle description */}
                <p className="mt-2 text-base md:text-xl font-light text-white/85 font-sans tracking-wide">
                  {activeBanner.subtitle}
                </p>
                
                {/* Price tag onwards format */}
                {activeBanner.price && (
                  <div className="mt-4 flex items-baseline gap-1 font-display">
                    <span className="text-3xl md:text-5xl font-extrabold tracking-tight">
                      {activeBanner.price.split(" ")[0]}
                    </span>
                    <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-white/70 ml-1 font-semibold">
                      {activeBanner.price.substring(activeBanner.price.indexOf(" ") + 1)}
                    </span>
                  </div>
                )}
                
                {/* Action button */}
                <Link
                  href={activeBanner.link}
                  className="mt-6 inline-flex items-center justify-center text-[10px] uppercase tracking-[0.2em] font-semibold rounded-full bg-white text-black px-6 py-3 hover:bg-neutral-200 transition-colors"
                >
                  Shop Now
                </Link>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Side Dot Navigation Indicator (Right side of slideshow viewport) */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-4">
        {BANNERS.map((_, idx) => {
          const isActive = currentIndex === idx;
          return (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "rounded-full transition-all duration-300 cursor-pointer border-none outline-none focus:outline-none",
                isActive
                  ? "w-[4px] h-[24px] bg-white"
                  : "w-[4px] h-[4px] bg-white/35 hover:bg-white/70"
              )}
              aria-label={`Go to slide ${idx + 1}`}
            />
          );
        })}
      </div>

      {/* Scroll Down Animated chevron at bottom center */}
      <div
        onClick={handleScrollDown}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 cursor-pointer group text-white/60 hover:text-white transition-colors select-none"
      >
        <span className="text-[9px] uppercase tracking-[0.25em] font-bold">
          Scroll Down
        </span>
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-1.5 h-1.5 border-b-2 border-r-2 border-white rotate-45"
          />
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.2 }}
            className="w-1.5 h-1.5 border-b-2 border-r-2 border-white rotate-45 -mt-0.5"
          />
        </div>
      </div>
    </section>
  );
}
