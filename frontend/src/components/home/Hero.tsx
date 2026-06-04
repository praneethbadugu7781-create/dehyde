"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
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
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const [showDots, setShowDots] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const h = window.innerHeight;
      const scrollPos = window.scrollY;

      // Determine active slide index based on viewport center scroll offset
      const centerPos = scrollPos + h / 2;
      const activeIdx = Math.floor(centerPos / h);
      setActiveBannerIdx(Math.min(Math.max(activeIdx, 0), BANNERS.length - 1));

      // Hide indicator dots when scrolled past the 3 full-screen banners
      setShowDots(scrollPos < h * 2.6);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative w-full flex flex-col">
      {/* 3 Stacked Full-Screen Snap Sections */}
      {BANNERS.map((banner, idx) => {
        const isFirst = idx === 0;

        return (
          <section
            key={banner.id}
            id={`hero-banner-${idx}`}
            className="snap-start w-full h-[100vh] relative overflow-hidden bg-black flex flex-col justify-end"
          >
            {/* Background Image with subtle Parallax Scale */}
            <motion.div 
              initial={{ scale: 1.05 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 z-0 origin-center"
            >
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                priority={isFirst}
                className="object-cover object-center"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-black/35" />
            </motion.div>

            {/* Content Wrapper */}
            <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 md:px-10 pb-24 md:pb-28">
              {banner.layout === "campaign" ? (
                // Banner 1 Content (Classic Campaign Format)
                <div className="max-w-2xl flex flex-col items-start text-white">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="inline-flex items-center gap-3 backdrop-blur-md bg-white/15 border border-white/20 rounded-full p-1 pr-4 mb-6"
                  >
                    <span className="bg-white text-black text-[9px] uppercase tracking-widest font-bold px-3 py-1 rounded-full">
                      Soft
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-white/90">
                      {banner.subtitle}
                    </span>
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="font-display text-4xl md:text-6xl font-bold tracking-[-0.035em] leading-[1.05]"
                  >
                    {banner.title}
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="mt-4 text-xs md:text-sm text-white/70 max-w-lg leading-relaxed font-light font-sans"
                  >
                    Upgrade your everyday wardrobe with minimal silhouettes, comfortable geometry, and timeless layers crafted for modern living.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="mt-8 flex flex-wrap gap-4"
                  >
                    <Link
                      href={banner.link}
                      className="inline-flex items-center justify-center text-[11px] uppercase tracking-wider font-semibold rounded-full bg-white text-black px-6 py-3.5 hover:bg-neutral-200 transition-colors"
                    >
                      {banner.cta}
                    </Link>
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center text-[11px] uppercase tracking-wider font-semibold rounded-full border border-white/30 bg-transparent text-white px-6 py-3.5 hover:bg-white hover:text-black transition-all duration-300"
                    >
                      Contact us
                    </Link>
                  </motion.div>
                </div>
              ) : (
                // Banners 2 & 3 Content (Style Union Vibe Bottom-Left)
                <div className="max-w-2xl flex flex-col items-start text-white">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.7 }}
                    className="flex flex-col items-start"
                  >
                    {/* Category Title in heavy uppercase */}
                    <h2 className="font-display text-5xl md:text-8xl font-black tracking-[-0.04em] leading-[0.95] uppercase">
                      {banner.title}
                    </h2>
                    
                    {/* Subtitle description */}
                    <p className="mt-2 text-base md:text-xl font-light text-white/85 font-sans tracking-wide">
                      {banner.subtitle}
                    </p>
                    
                    {/* Price tag onwards format */}
                    {banner.price && (
                      <div className="mt-4 flex items-baseline gap-1 font-display">
                        <span className="text-3xl md:text-5xl font-extrabold tracking-tight">
                          {banner.price.split(" ")[0]}
                        </span>
                        <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-white/70 ml-1 font-semibold">
                          {banner.price.substring(banner.price.indexOf(" ") + 1)}
                        </span>
                      </div>
                    )}
                    
                    {/* Action button */}
                    <Link
                      href={banner.link}
                      className="mt-6 inline-flex items-center justify-center text-[10px] uppercase tracking-[0.2em] font-semibold rounded-full bg-white text-black px-6 py-3 hover:bg-neutral-200 transition-colors"
                    >
                      Shop Now
                    </Link>
                  </motion.div>
                </div>
              )}
            </div>

            {/* Scroll Down Animated chevron at bottom center */}
            <div
              onClick={() => {
                const nextIdx = idx + 1;
                if (nextIdx < BANNERS.length) {
                  const targetEl = document.getElementById(`hero-banner-${nextIdx}`);
                  targetEl?.scrollIntoView({ behavior: "smooth" });
                } else {
                  // Scroll past Hero completely to the existing page content
                  const scrollH = window.innerHeight * BANNERS.length;
                  window.scrollTo({ top: scrollH, behavior: "smooth" });
                }
              }}
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
      })}

      {/* Floating Side Dot Navigation Indicator */}
      {showDots && (
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-4">
          {BANNERS.map((_, idx) => {
            const isActive = activeBannerIdx === idx;
            return (
              <button
                key={idx}
                onClick={() => {
                  const targetEl = document.getElementById(`hero-banner-${idx}`);
                  targetEl?.scrollIntoView({ behavior: "smooth" });
                }}
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
      )}
    </div>
  );
}
