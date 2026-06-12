"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";

interface PromoBanner {
  _id: string;
  title: string;
  link?: string;
  isActive: boolean;
  placement: string;
  order?: number;
}

const FALLBACK_ITEMS = Array(12).fill({ title: "BLACK FRIDAY SALE 50% OFF", link: "/shop" });

export function AnnouncementBar() {
  const [items, setItems] = useState<{ title: string; link?: string }[]>(FALLBACK_ITEMS);

  useEffect(() => {
    apiClient
      .get<{ success: boolean; data: PromoBanner[] }>("/banners?placement=promo")
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          const activeBanners = res.data
            .filter((b) => b.isActive)
            .sort((a, b) => (a.order || 0) - (b.order || 0));

          if (activeBanners.length > 0) {
            // Repeat to make sure there are enough items for the marquee loop (at least 12 items)
            const repeatCount = Math.max(12, Math.ceil(12 / activeBanners.length));
            const repeated: { title: string; link?: string }[] = [];
            for (let i = 0; i < repeatCount; i++) {
              repeated.push(
                ...activeBanners.map((b) => ({
                  title: b.title,
                  link: b.link,
                }))
              );
            }
            setItems(repeated);
          } else {
            setItems(FALLBACK_ITEMS);
          }
        } else {
          setItems(FALLBACK_ITEMS);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch promo banners", err);
        setItems(FALLBACK_ITEMS);
      });
  }, []);

  return (
    <div className="relative w-full overflow-hidden bg-royal py-2.5 text-white border-b border-white/10 z-50">
      <div className="flex animate-marquee whitespace-nowrap text-[10px] md:text-xs uppercase tracking-[0.2em] font-medium">
        {items.map((item, idx) => (
          <span key={idx} className="mx-8 flex items-center">
            {item.link ? (
              <Link href={item.link} className="hover:underline">
                {item.title}
              </Link>
            ) : (
              item.title
            )}
            <span className="ml-16 select-none opacity-40">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
