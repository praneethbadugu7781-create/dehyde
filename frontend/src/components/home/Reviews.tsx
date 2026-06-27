"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { apiClient } from "@/lib/api";

interface ReviewData {
  _id: string;
  name: string;
  message: string;
  rating?: number;
  createdAt: string;
}

export function Reviews() {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<{ success: boolean; data: ReviewData[] }>("/feedback/approved")
      .then((res) => {
        setReviews(res.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % reviews.length);
  };

  // Don't render the section at all if no approved reviews
  if (!loading && reviews.length === 0) return null;

  const current = reviews[activeIdx];

  return (
    <section className="py-20 bg-[#f8f8f8] border-t border-black/5 font-sans">
      <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10">
        <div className="grid gap-12 lg:grid-cols-12 items-center">
          {/* Left Text Box */}
          <div className="lg:col-span-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-semibold">
              Customer reviews
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2 text-royal tracking-tight leading-tight">
              The voice of quality
            </h2>
            <p className="mt-4 text-xs md:text-sm text-neutral-500 leading-relaxed font-light max-w-sm">
              Experience the difference through the words of customers who value premium fabrics, geometric fits, and timeless minimalist style.
            </p>
            
            <div className="mt-8 flex items-center gap-2">
              <span className="text-sm font-bold text-royal">{reviews.length} Review{reviews.length !== 1 ? "s" : ""}</span>
              <div className="flex text-royal">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-royal text-royal" />
                ))}
              </div>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 ml-2">
                from our customers
              </span>
            </div>
          </div>

          {/* Right Slideshow Testimonial */}
          <div className="lg:col-span-7 bg-white border border-black/5 rounded-2xl p-8 md:p-12 relative flex flex-col justify-between shadow-sm min-h-[300px]">
            {loading ? (
              <div className="flex items-center justify-center h-full text-charcoal/30 text-sm">
                Loading reviews...
              </div>
            ) : current ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIdx}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="flex text-neutral-300 mb-6">
                      {Array(current.rating || 5).fill(0).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-royal text-royal" />
                      ))}
                    </div>

                    <blockquote>
                      <p className="font-display text-base md:text-lg font-medium text-black leading-relaxed tracking-tight italic">
                        &ldquo;{current.message}&rdquo;
                      </p>
                    </blockquote>

                    <div className="mt-8">
                      <p className="text-xs font-bold text-black uppercase tracking-wider">
                        {current.name}
                      </p>
                      <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold mt-1">
                        Verified Customer
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Slider Buttons */}
                {reviews.length > 1 && (
                  <div className="flex items-center gap-3 self-end mt-8 lg:mt-0">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="h-8 w-8 rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                      aria-label="Previous review"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="h-8 w-8 rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                      aria-label="Next review"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
