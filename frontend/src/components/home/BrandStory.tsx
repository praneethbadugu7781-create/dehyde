"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function BrandStory() {
  return (
    <section className="py-section">
      <motion.div className="luxury-container grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="relative aspect-[4/5] overflow-hidden"
        >
          <Image
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=85"
            alt="DEHYDE brand story"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
        >
          <p className="text-[10px] uppercase tracking-editorial text-muted">Since 2020 · India</p>
          <h2 className="editorial-heading mt-6 text-4xl leading-tight md:text-5xl">
            Defining modern street luxury
          </h2>
          <p className="mt-8 text-sm leading-relaxed text-muted md:text-base">
            DEHYDE merges urban utility with editorial restraint. Every piece is designed for the
            cinematic everyday — architectural silhouettes, premium fabrics, and a palette drawn
            from shadow and light.
          </p>
          <Button asChild variant="outline" className="mt-10">
            <Link href="/about">Discover our story</Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
