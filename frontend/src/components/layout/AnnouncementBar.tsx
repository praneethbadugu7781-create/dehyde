"use client";

import Link from "next/link";

export function AnnouncementBar() {
  // Let's create an array of texts to make sure it repeats enough to fill the screen
  const items = Array(12).fill("Black friday sale 50% off");

  return (
    <div className="relative w-full overflow-hidden bg-royal py-2.5 text-white border-b border-white/10 z-50">
      <div className="flex animate-marquee whitespace-nowrap text-[10px] md:text-xs uppercase tracking-[0.2em] font-medium">
        {items.map((item, idx) => (
          <span key={idx} className="mx-8 flex items-center">
            {item}
            <span className="ml-16 select-none opacity-40">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
