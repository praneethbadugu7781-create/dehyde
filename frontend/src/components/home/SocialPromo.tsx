"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Instagram, MessageCircle } from "lucide-react";

const COMMUNITY_IMAGES = [
  "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1618886614638-80e3c103d31a?q=80&w=600&auto=format&fit=crop"
];

export function SocialPromo() {
  return (
    <section className="py-20 bg-white border-t border-black/5 font-sans">
      <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10">
        <div className="grid gap-12 lg:grid-cols-12 items-center">
          {/* Text and Actions (Left) */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <p className="text-[10px] uppercase tracking-[0.2em] text-amber-600 font-bold">
              Our Story & Community
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2 text-black tracking-tight leading-tight">
              Grit, struggle, and the journey of keeping DEHYDE alive
            </h2>
            <p className="mt-4 text-xs md:text-sm text-neutral-500 leading-relaxed font-light max-w-sm">
              DEHYDE was forged in the fire of raw hustle and personal sacrifice. From sleepless nights to production hurdles, our founder's struggle to build and maintain this brand is woven into every thread. We created this label to unite a resilient community of dreamers who push through their own challenges. Connect with our founder directly on Instagram to join our journey.
            </p>
            
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="https://www.instagram.com/dehyde_333?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider font-extrabold rounded-full bg-royal text-white px-5 py-3.5 hover:bg-blue-800 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                <Instagram className="h-4 w-4" />
                Follow Instagram
              </a>
              <Link
                href="/suggestions"
                className="inline-flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider font-extrabold rounded-full border border-royal/20 bg-transparent text-black px-5 py-3.5 hover:bg-royal hover:text-white transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                <MessageCircle className="h-4 w-4" />
                Share Your Story
              </Link>
            </div>
          </div>

          {/* Community Images Grid (Right) */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-4 md:gap-6">
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
                  sizes="(max-width: 768px) 50vw, 30vw"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
