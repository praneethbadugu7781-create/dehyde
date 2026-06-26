"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export function BrandStory() {
  return (
    <section className="py-20 bg-white border-t border-black/5 font-sans">
      <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10 grid gap-12 lg:grid-cols-2 items-center">
        {/* Left Image Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative aspect-[4/5] rounded-xl overflow-hidden bg-neutral-100 border border-black/5"
        >
          <Image
            src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop"
            alt="DEHYDE brand story"
            fill
            className="object-cover hover:scale-102 transition-transform duration-700"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </motion.div>

        {/* Right Content Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-start lg:pl-10"
        >
          {/* Badge Container */}
          <div className="inline-flex items-center gap-2 bg-[#f8f8f8] border border-black/5 rounded-full px-3 py-1 mb-6">
            <span className="text-[9px] uppercase tracking-widest font-bold text-neutral-800">
              DEHYDE
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400">
              Since 2020
            </span>
          </div>

          {/* Heading */}
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-black leading-tight">
            Defining modern style
          </h2>

          {/* Paragraph Description */}
          <p className="mt-6 text-xs md:text-sm text-neutral-500 leading-relaxed font-light">
            A decade ago, we set out to redefine the modern streetwear silhouette. Today, we merge urban utility with high-end aesthetics in a resilient, beautiful collection that speaks of restraint, quality, and daily comfort.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/about"
              className="inline-flex items-center justify-center text-[10px] uppercase tracking-wider font-semibold rounded-full bg-royal text-white px-5 py-3 hover:bg-blue-800 transition-colors"
            >
              More about us
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center text-[10px] uppercase tracking-wider font-semibold rounded-full border border-royal/20 bg-transparent text-black px-5 py-3 hover:bg-royal hover:text-white transition-all duration-300"
            >
              Contact us
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
