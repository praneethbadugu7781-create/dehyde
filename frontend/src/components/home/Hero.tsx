"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BannerData {
  id: string;
  title: string;
  subtitle: string;
  price?: string;
  image: string;
  mobileImage?: string;
  cta: string;
  link: string;
  layout: "campaign" | "bottom-left";
}

const FALLBACK_BANNERS: BannerData[] = [
  {
    id: "banner1",
    title: "Winter Wear",
    subtitle: "Warm Winter Layers",
    price: "₹ 1,499 / ONWARDS",
    image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=2400&q=90",
    cta: "See all collections",
    link: "/shop",
    layout: "bottom-left"
  },
  {
    id: "banner2",
    title: "T-Shirts",
    subtitle: "For Every Mood",
    price: "₹ 599 / ONWARDS",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=2400&q=90",
    cta: "Explore T-Shirts",
    link: "/shop?category=t-shirts",
    layout: "bottom-left"
  },
  {
    id: "banner3",
    title: "Shirts",
    subtitle: "For Every Moment",
    price: "₹ 1,199 / ONWARDS",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=2400&q=90",
    cta: "Explore Shirts",
    link: "/shop?category=shirts",
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
  const [showControls, setShowControls] = useState(true);

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
              mobileImage: b.mobileImage,
              cta: b.cta || "Shop Now",
              link: b.link || "/shop",
              layout: b.layout || "bottom-left"
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
    const handleWindowScroll = () => {
      const h = window.innerHeight;
      setShowControls(window.scrollY < h * 0.8);
    };
    window.addEventListener("scroll", handleWindowScroll, { passive: true });
    handleWindowScroll();
    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, []);

  // Autoplay slides every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setTimeout(() => {
      const nextIdx = (activeBannerIdx + 1) % banners.length;
      scrollToSlide(nextIdx);
    }, 5000);
    return () => clearTimeout(timer);
  }, [activeBannerIdx, banners.length]);

  const scrollToSlide = (idx: number) => {
    const container = document.getElementById("hero-slides-container");
    if (container) {
      container.scrollTo({
        left: container.clientWidth * idx,
        behavior: "smooth"
      });
      setActiveBannerIdx(idx);
    }
  };

  return (
    <div className="relative w-full h-[100vh] bg-black overflow-hidden group">
      {/* Horizontal Slides Container */}
      <div
        id="hero-slides-container"
        className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
        onScroll={(e) => {
          const container = e.currentTarget;
          const activeIdx = Math.round(container.scrollLeft / container.clientWidth);
          setActiveBannerIdx(activeIdx);
        }}
      >
        {banners.map((banner, idx) => {
          const isFirst = idx === 0;

          return (
            <section
              key={banner.id}
              className="w-full h-full shrink-0 snap-start relative overflow-hidden bg-black flex flex-col justify-end"
            >
              {/* Clickable Background Link */}
              <Link href={banner.link} className="absolute inset-0 z-0 cursor-pointer">
                <motion.div 
                  initial={{ scale: 1.05 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: false, amount: 0.1 }}
                  transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 origin-center"
                >
                  {/* Desktop Image */}
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    priority={isFirst}
                    className={`object-cover object-center ${banner.mobileImage ? "hidden md:block" : ""}`}
                    sizes="100vw"
                  />
                  {/* Mobile Image */}
                  {banner.mobileImage && (
                    <Image
                      src={banner.mobileImage}
                      alt={`${banner.title} Mobile`}
                      fill
                      priority={isFirst}
                      className="object-cover object-center block md:hidden"
                      sizes="100vw"
                    />
                  )}
                </motion.div>
                {/* Conditional overlay based on banner layout */}
                {banner.layout === "campaign" ? (
                  <div className="absolute inset-0 bg-black/25 backdrop-brightness-[0.9] z-1" />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/10 to-transparent z-1" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-1" />
                  </>
                )}
              </Link>

              {/* Content Wrapper */}
              {banner.layout === "campaign" ? (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6 md:px-24 pointer-events-none select-none">
                  <div className="max-w-2xl flex flex-col items-center pointer-events-auto">
                    <motion.div
                      initial={{ opacity: 0, y: 25 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.3 }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      className="flex flex-col items-center"
                    >
                      {/* Centered Campaign Badge */}
                      <span className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-1.5 rounded-full font-bold mb-5 shadow-sm">
                        DEHYDE Campaign
                      </span>

                      {/* Title (Jost Bold Centered Uppercase) */}
                      <h2 className="font-display text-4xl md:text-7xl font-black tracking-wide leading-none uppercase text-white drop-shadow-sm">
                        {banner.title}
                      </h2>

                      {/* Subtitle (Instrument Serif Italic Centered) */}
                      <p className="mt-4 font-serif italic text-2xl md:text-3.5xl font-normal text-white/95 tracking-wide leading-tight max-w-xl">
                        {banner.subtitle}
                      </p>

                      {/* Price Tag (Jost Bold Centered with Suffix) */}
                      {banner.price && (
                        <div className="mt-5 flex items-baseline justify-center font-display text-white">
                          <span className="text-3xl md:text-4.5xl font-extrabold tracking-tight">
                            {parsePrice(banner.price).main}
                          </span>
                          {parsePrice(banner.price).suffix && (
                            <span className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-white/70 font-semibold font-sans ml-2.5">
                              {parsePrice(banner.price).suffix}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Dual Action Call to Actions */}
                      <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <Link
                          href={banner.link}
                          className="inline-flex items-center justify-center text-[10px] md:text-xs uppercase tracking-widest font-extrabold rounded-full bg-white text-royal px-8 py-3.5 hover:bg-royal hover:text-white border border-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                          {banner.cta}
                        </Link>
                        <Link
                          href="/shop"
                          className="inline-flex items-center justify-center text-[10px] md:text-xs uppercase tracking-widest font-extrabold rounded-full bg-transparent text-white px-8 py-3.5 hover:bg-white hover:text-royal border border-white/30 hover:border-white transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                        >
                          Explore Collection
                        </Link>
                      </div>
                    </motion.div>
                  </div>
                </div>
              ) : (
                <div className="relative z-10 mx-auto w-full max-w-[1400px] px-8 md:px-24 pb-20 md:pb-24 pointer-events-none select-none">
                  <Link href={banner.link} className="inline-flex flex-col items-start text-white pointer-events-auto">
                    <motion.div
                      initial={{ opacity: 0, y: 25 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.3 }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      className="flex flex-col items-start text-left"
                    >
                      {/* Title (Jost Bold Uppercase) */}
                      <h2 className="font-display text-4xl md:text-6xl font-black tracking-wide leading-none uppercase">
                        {banner.title}
                      </h2>
                      
                      {/* Subtitle (Instrument Serif Italic) */}
                      <p className="mt-2 font-serif italic text-2xl md:text-3xl font-normal text-white/95 tracking-wide leading-tight">
                        {banner.subtitle}
                      </p>
                      
                      {/* Price Tag (Jost Bold with Suffix) */}
                      {banner.price && (
                        <div className="mt-4 flex items-baseline font-display">
                          <span className="text-3xl md:text-4.5xl font-extrabold tracking-tight">
                            {parsePrice(banner.price).main}
                          </span>
                          {parsePrice(banner.price).suffix && (
                            <span className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-white/70 font-semibold font-sans ml-2.5">
                              {parsePrice(banner.price).suffix}
                            </span>
                          )}
                        </div>
                      )}
                    </motion.div>
                  </Link>
                </div>
              )}

              {/* Scroll Down Animated Single Chevron */}
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
                }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 cursor-pointer group text-white/60 hover:text-white transition-colors select-none"
              >
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={{ y: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="w-2 h-2 border-b-2 border-r-2 border-white rotate-45"
                  />
                </div>
                <span className="text-[8px] uppercase tracking-[0.3em] font-bold mt-1">
                  DISCOVER MORE
                </span>
              </div>
            </section>
          );
        })}
      </div>

      {/* Floating Arrow Controls */}
      {showControls && banners.length > 1 && (
        <>
          <button
            onClick={() => {
              const prevIdx = activeBannerIdx - 1;
              if (prevIdx >= 0) scrollToSlide(prevIdx);
            }}
            className={cn(
              "absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-40 p-2.5 rounded-full bg-black/15 hover:bg-black/35 text-white/70 hover:text-white transition-all cursor-pointer backdrop-blur-sm border border-white/5 opacity-0 group-hover:opacity-100",
              activeBannerIdx === 0 && "pointer-events-none opacity-0"
            )}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          </button>
          <button
            onClick={() => {
              const nextIdx = activeBannerIdx + 1;
              if (nextIdx < banners.length) scrollToSlide(nextIdx);
            }}
            className={cn(
              "absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-40 p-2.5 rounded-full bg-black/15 hover:bg-black/35 text-white/70 hover:text-white transition-all cursor-pointer backdrop-blur-sm border border-white/5 opacity-0 group-hover:opacity-100",
              activeBannerIdx === banners.length - 1 && "pointer-events-none opacity-0"
            )}
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2} />
          </button>
        </>
      )}

      {/* Floating Bottom Dot Navigation Indicator */}
      {showControls && banners.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3">
          {banners.map((_, idx) => {
            const isActive = activeBannerIdx === idx;
            return (
              <button
                key={idx}
                onClick={() => scrollToSlide(idx)}
                className={cn(
                  "rounded-full transition-all duration-300 cursor-pointer border-none outline-none focus:outline-none",
                  isActive
                    ? "w-[24px] h-[4px] bg-white"
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
