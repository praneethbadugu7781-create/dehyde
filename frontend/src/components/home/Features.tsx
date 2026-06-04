"use client";

import { motion } from "framer-motion";

interface FeatureItem {
  title: string;
  desc: string;
  tags: string[];
}

const FEATURES: FeatureItem[] = [
  {
    title: "Everyday Comfort",
    desc: "Designed to feel natural on the body throughout long, active days.",
    tags: ["All-day wear", "Comfort", "Relaxed fit"]
  },
  {
    title: "Modern Silhouettes",
    desc: "Contemporary shapes balance structure & ease for confident everyday styling.",
    tags: ["Balanced fit", "Modern", "Structured"]
  },
  {
    title: "Effortless Styling",
    desc: "Pieces work together naturally, making daily outfit choices simple & intuitive.",
    tags: ["Versatile", "Easy to style", "Layered"]
  },
  {
    title: "Daily Essentials",
    desc: "Core clothing pieces designed for frequent wear across modern everyday routines.",
    tags: ["Core pieces", "Everyday", "Wearable"]
  },
  {
    title: "Wearable Design",
    desc: "Design decisions focused on comfort, fit, and real-life wearability.",
    tags: ["Practical", "Functional", "Adaptable"]
  },
  {
    title: "Clean Aesthetic",
    desc: "Clean lines, minimal tones, and timeless fits designed to outlast seasonal trends.",
    tags: ["Clean lines", "Minimal", "Timeless"]
  }
];

export function Features() {
  return (
    <section className="py-20 bg-white border-t border-black/5 font-sans">
      <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10">
        {/* Header */}
        <div className="mb-16 max-w-xl">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-semibold">
            What defines our wear
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-2 text-black tracking-tight leading-tight">
            Where style meets ease
          </h2>
          <p className="mt-4 text-xs md:text-sm text-neutral-500 leading-relaxed font-light">
            Thoughtful design blending modern style, comfort, and versatility for everyday living across lifestyles.
          </p>
        </div>

        {/* Features 6-Column Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feat, idx) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05, duration: 0.5 }}
              className="flex flex-col justify-between border border-black/5 bg-[#f8f8f8] p-6 rounded-xl hover:border-black/15 transition-all duration-300"
            >
              <div>
                <h3 className="font-display text-sm font-semibold tracking-tight text-black">
                  {feat.title}
                </h3>
                <p className="mt-2.5 text-xs text-neutral-500 leading-relaxed font-light">
                  {feat.desc}
                </p>
              </div>

              {/* Tag Badges row */}
              <div className="mt-6 flex flex-wrap gap-1.5 pt-4 border-t border-black/5">
                {feat.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-white border border-black/5 text-[9px] uppercase tracking-wider font-semibold text-neutral-600 rounded-full px-2.5 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
