"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  title: "Defined by silence.\nBuilt for the street.",
  subtitle: "Premium menswear streetwear from India. Architectural silhouettes, editorial craft.",
  image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=2400&q=90",
  cta: "Explore Collection",
  link: "/shop"
};

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
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const activeBanner = banners[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <section className="relative h-screen min-h-[700px] w-full overflow-hidden bg-charcoal">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeBanner._id}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={activeBanner.image}
            alt={activeBanner.title || "DEHYDE Editorial Campaign"}
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/30 to-charcoal/10" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex h-full flex-col justify-end luxury-container pb-24 md:pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${activeBanner._id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
          >
            {activeBanner.subtitle && (
              <div className="text-[10px] uppercase tracking-[0.35em] text-offwhite/70 mb-6">
                {activeBanner.subtitle}
              </div>
            )}
            
            <div className="editorial-heading max-w-3xl text-5xl leading-[1.05] text-offwhite md:text-7xl lg:text-8xl whitespace-pre-line">
              {activeBanner.title}
            </div>

            <div className="mt-12 flex flex-wrap gap-4">
              <Link
                href={activeBanner.link || "/shop"}
                className="inline-flex bg-offwhite px-8 py-4 text-xs uppercase tracking-editorial text-charcoal transition-colors hover:bg-cream"
              >
                {activeBanner.cta || "Explore Collection"}
              </Link>
              <Link
                href="/about"
                className="inline-flex border border-offwhite/40 px-8 py-4 text-xs uppercase tracking-editorial text-offwhite transition-colors hover:bg-offwhite hover:text-charcoal"
              >
                Our Story
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Manual Sliding Left/Right Controls */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-black/10 hover:bg-black/30 text-offwhite border border-offwhite/10 transition-all rounded-sm flex items-center justify-center hover:scale-105"
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-black/10 hover:bg-black/30 text-offwhite border border-offwhite/10 transition-all rounded-sm flex items-center justify-center hover:scale-105"
            aria-label="Next slide"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-3 z-20">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1 transition-all duration-500 ${
                idx === currentIndex ? "w-8 bg-offwhite" : "w-4 bg-offwhite/30 hover:bg-offwhite/50"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
