"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useWishlistStore } from "@/store/wishlistStore";
import { cn } from "@/lib/utils";
import { productImage } from "@/lib/products";

interface Props {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: Props) {
  const [hovered, setHovered] = useState(false);
  const { has, toggle } = useWishlistStore();
  const inWishlist = has(product._id);
  const primaryImage = productImage(product);
  const secondaryImage = product.images?.[1] || primaryImage;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.6 }}
      className="group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-stone/5">
        <Link href={`/product/${product.slug}`}>
          {primaryImage ? (
            <>
              <Image
                src={primaryImage}
                alt={product.title}
                fill
                className={cn(
                  "object-cover transition-all duration-700 ease-luxury",
                  hovered ? "opacity-0 scale-105" : "opacity-100"
                )}
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <Image
                src={secondaryImage}
                alt=""
                fill
                className={cn(
                  "object-cover transition-all duration-700 ease-luxury",
                  hovered ? "opacity-100 scale-105" : "opacity-0"
                )}
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-editorial text-muted">
              DEHYDE
            </div>
          )}
        </Link>
        <button
          type="button"
          onClick={() => toggle(product._id)}
          className="absolute right-4 top-4 z-10 p-2 opacity-0 transition-opacity group-hover:opacity-100"
          aria-label="Add to wishlist"
        >
          <Heart className={cn("h-4 w-4", inWishlist && "fill-charcoal")} strokeWidth={1} />
        </button>
        {product.rewardCoins > 0 && (
          <span className="absolute bottom-4 left-4 bg-charcoal/90 px-2 py-1 text-[9px] uppercase tracking-editorial text-offwhite">
            +{product.rewardCoins} coins
          </span>
        )}
      </div>
      <Link href={`/product/${product.slug}`} className="mt-5 block">
        <h3 className="text-sm font-normal tracking-wide">{product.title}</h3>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-sm">{formatPrice(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-xs text-muted line-through">{formatPrice(product.compareAtPrice)}</span>
          )}
        </div>
      </Link>
    </motion.article>
  );
}
