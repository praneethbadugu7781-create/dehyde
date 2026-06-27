"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Instagram, MessageCircle } from "lucide-react";

export function SocialPromo() {
  return (
    <section className="py-20 bg-white border-t border-black/5 font-sans">
      <div className="mx-auto w-full max-w-[800px] px-6 md:px-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <p className="text-[10px] uppercase tracking-[0.2em] text-royal font-bold">
            Our Story & Community
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-2 text-royal tracking-tight leading-tight">
            Grit, struggle, and the journey of keeping DEHYDE alive
          </h2>
          <p className="mt-4 text-xs md:text-sm text-neutral-500 leading-relaxed font-light max-w-lg">
            DEHYDE was forged in the fire of raw hustle and personal sacrifice. From sleepless nights to production hurdles, our founder's struggle to build and maintain this brand is woven into every thread. We created this label to unite a resilient community of dreamers who push through their own challenges. Connect with our founder directly on Instagram to join our journey.
          </p>
          
          <div className="mt-8 flex flex-wrap justify-center gap-4">
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
        </motion.div>
      </div>
    </section>
  );
}
