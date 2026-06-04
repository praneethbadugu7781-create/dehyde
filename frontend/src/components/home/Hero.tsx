"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api";

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

const FALLBACK_BANNERS: BannerData[] = [
  {
    id: "banner1",
    title: "Premium wear for modern living",
    subtitle: "Warm Winter Layers",
    image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=2400&q=90",
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
    title: "Tailored Essentials",
    subtitle: "For Every Moment",
    price: "₹ 1,199 / ONWARDS",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=2400&q=90",
    cta: "Explore Tailored",
    link: "/shop?category=casual-shirts",
    layout: "bottom-left"
  }
];

const parsePrice = (priceStr?: string) => {
  if (!priceStr) return { main: "", suffix: "" };
  const slashIdx = priceStr.indexOf('/') !== -1 ? priceStr.indexOf('/') : priceStr.indexOf('\\');
  if (slashIdx !== -1) {
    return {
      main: priceStr.substring(0, slashIdx).trim(),
      suffix: priceStr.substring(slashIdx).trim()
    };
  }
  return { main: priceStr, suffix: "" };
};

export function Hero() {
  const [banners, setBanners] = useState<BannerData[]>(FALLBACK_BANNERS);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const [showDots, setShowDots] = useState(true);

  useEffect(() => {
    async function loadBanners() {
      try {
        const res = await apiClient.get<{ success: boolean; data: any[] }>("/banners?placement=hero");
        if (res.success && res.data && res.data.length > 0) {
          const dbBanners: BannerData[] = res.data
            .filter((b) => b.isActive)
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((b, idx) => ({
              id: b._id,
              title: b.title || "DEHYDE Campaign",
              subtitle: b.subtitle || "Premium Modern Streetwear",
              price: b.price || "",
              image: b.image,
              cta: b.cta || "Shop Now",
              link: b.link || "/shop",
              // Layout fallback: Banner 1 is campaign format, others bottom-left format
              layout: idx === 0 ? "campaign" : "bottom-left"
            }));

          if (dbBanners.length > 0) {
            setBanners(dbBanners);
          }
        }
      } catch (err) {
        console.error("Failed to load banners from admin panel", err);
      }
    }
    loadBanners();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const h = window.innerHeight;
      const scrollPos = window.scrollY;

      // Determine active slide index based on viewport center scroll offset
      const centerPos = scrollPos + h / 2;
      const activeIdx = Math.floor(centerPos / h);
      setActiveBannerIdx(Math.min(Math.max(activeIdx, 0), banners.length - 1));

      // Hide indicator dots when scrolled past the full-screen banners
      setShowDots(scrollPos < h * (banners.length - 0.4));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [banners.length]);

  return (
    <div className="relative w-full flex flex-col">
      {/* Stacked Full-Screen Snap Sections */}
      {banners.map((banner, idx) => {
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
              <div className="max-w-2xl flex flex-col items-start text-white">
                <motion.div
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-start"
                >
                  {/* Title (Jost Bold Uppercase) */}
                  <h2 className="font-display text-5xl md:text-8xl font-black tracking-wide leading-[0.95] uppercase">
                    {banner.title}
                  </h2>
                  
                  {/* Subtitle (Instrument Serif Italic) */}
                  <p className="mt-2.5 font-serif italic text-2xl md:text-3.5xl font-normal text-white/90 tracking-wide leading-tight">
                    {banner.subtitle}
                  </p>
                  
                  {/* Price Tag (Jost Bold with Suffix) */}
                  {banner.price && (
                    <div className="mt-5 flex items-baseline gap-2 font-display">
                      <span className="text-3xl md:text-5xl font-extrabold tracking-tight">
                        {parsePrice(banner.price).main}
                      </span>
                      {parsePrice(banner.price).suffix && (
                        <span className="text-xs md:text-sm uppercase tracking-[0.25em] text-white/75 font-semibold font-sans ml-1">
                          {parsePrice(banner.price).suffix}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* CTA Action button (Clickable pill) */}
                  <Link
                    href={banner.link}
                    className="mt-7 inline-flex items-center justify-center text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-semibold rounded-full bg-white text-black px-6 md:px-7 py-3 md:py-3.5 hover:bg-neutral-200 transition-all duration-300 shadow-sm"
                  >
                    {banner.cta || "Shop Now"}
                  </Link>
                </motion.div>
              </div>
            </div>

            {/* Scroll Down Animated chevron at bottom center */}
            <div
              onClick={() => {
                const nextIdx = idx + 1;
                if (nextIdx < banners.length) {
                  const targetEl = document.getElementById(`hero-banner-${nextIdx}`);
                  targetEl?.scrollIntoView({ behavior: "smooth" });
                } else {
                  // Scroll past Hero completely to the existing page content
                  const scrollH = window.innerHeight * banners.length;
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
          {banners.map((_, idx) => {
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
