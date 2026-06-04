"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const COMMUNITY_IMAGES = [
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop"
];

export function SocialPromo() {
  return (
    <section className="py-20 bg-white border-t border-black/5 font-sans">
      <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10">
        <div className="grid gap-12 lg:grid-cols-12 items-center">
          {/* Text and Actions (Left) */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-semibold">
              Stay connected
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2 text-black tracking-tight leading-tight">
              See our community in modern silhouettes
            </h2>
            <p className="mt-4 text-xs md:text-sm text-neutral-500 leading-relaxed font-light max-w-sm">
              Connect with us on social media for a daily dose of fresh style, featuring exclusive editorial looks from our global community.
            </p>
            
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center text-[10px] uppercase tracking-wider font-semibold rounded-full bg-black text-white px-5 py-3 hover:bg-neutral-800 transition-colors"
              >
                See collections
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center text-[10px] uppercase tracking-wider font-semibold rounded-full border border-black/10 bg-transparent text-black px-5 py-3 hover:bg-black hover:text-white transition-all duration-300"
              >
                Contact us
              </Link>
            </div>
          </div>

          {/* Community Images Grid (Right) */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-4">
            {COMMUNITY_IMAGES.map((img, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.5 }}
                className="relative aspect-[3/4] rounded-xl overflow-hidden bg-neutral-100 border border-black/5 hover:shadow-md transition-shadow"
              >
                <Image
                  src={img}
                  alt={`Community style ${idx + 1}`}
                  fill
                  className="object-cover hover:scale-102 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 15vw"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
