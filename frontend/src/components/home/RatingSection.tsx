"use client";

import { motion } from "framer-motion";

interface IndicatorItem {
  id: string;
  icon: React.ReactNode;
  number: string;
  label: string;
}

export function RatingSection() {
  const items: IndicatorItem[] = [
    {
      id: "stores",
      number: "160+",
      label: "Stores across India",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 md:w-12 md:h-12 text-royal">
          <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
          <path d="M2 7h20" />
          <path d="M3 12h18" />
        </svg>
      )
    },
    {
      id: "reviews",
      number: "16L+",
      label: "Reviews On Google",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 md:w-12 md:h-12 text-royal">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M8 10h8" />
          <path d="M8 14h6" />
        </svg>
      )
    },
    {
      id: "rating",
      number: "4.8+",
      label: "Google Rating",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 md:w-12 md:h-12 text-royal">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )
    }
  ];

  return (
    <section className="py-10 md:py-12 bg-[#f8f8f8] border-b border-black/5 font-sans">
      <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6 lg:gap-12">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="flex items-center gap-4 justify-center md:justify-start lg:justify-center border-b border-black/5 md:border-b-0 pb-6 md:pb-0 last:border-b-0 last:pb-0"
            >
              {/* Icon Container */}
              <div className="flex-shrink-0 flex items-center justify-center p-2 bg-white rounded-xl border border-black/5 shadow-sm">
                {item.icon}
              </div>
              {/* Text Container */}
              <div className="text-left">
                <div className="text-2xl md:text-3xl font-black text-royal font-display leading-none tracking-tight">
                  {item.number}
                </div>
                <div className="text-xs md:text-[13px] text-neutral-500 font-sans mt-1 font-medium leading-none">
                  {item.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
