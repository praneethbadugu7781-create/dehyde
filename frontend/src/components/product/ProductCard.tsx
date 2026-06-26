"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart } from "lucide-react";
import type { Product, CartItem } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";
import { productImage } from "@/lib/products";

interface Props {
  product: Product;
  index?: number;
}

// Simple color helper mapping text color names to hex codes
const getColorHex = (name: string, hex?: string) => {
  if (hex) return hex;
  const colors: Record<string, string> = {
    black: "#000000",
    white: "#ffffff",
    charcoal: "#242424",
    grey: "#808080",
    gray: "#808080",
    beige: "#f5f5dc",
    navy: "#000080",
    blue: "#0000ff",
    red: "#ff0000",
    green: "#008000",
    olive: "#808000",
    sand: "#c2b280",
    stone: "#877f7d",
    cream: "#fffdd0",
    brown: "#a52a2a",
    khaki: "#f0e68c",
  };
  return colors[name.toLowerCase()] || "#cccccc";
};

export function ProductCard({ product, index = 0 }: Props) {
  const [hovered, setHovered] = useState(false);
  const { has, toggle } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);
  
  const inWishlist = has(product._id);
  const primaryImage = productImage(product);
  
  // Track selected color variant index
  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number | null>(null);
  const [added, setAdded] = useState(false);
  const [flyingItem, setFlyingItem] = useState<{
    id: number;
    startX: number;
    startY: number;
    width: number;
    height: number;
    endX: number;
    endY: number;
  } | null>(null);

  // Determine which image to show
  let currentImage = primaryImage;
  if (selectedVariantIdx !== null && product.variants?.[selectedVariantIdx]?.images?.length > 0) {
    currentImage = product.variants[selectedVariantIdx].images[0];
  }

  // Determine secondary image for hover transition
  let secondaryImage = product.images?.[1] || primaryImage;
  if (selectedVariantIdx !== null && product.variants?.[selectedVariantIdx]?.images?.length > 1) {
    secondaryImage = product.variants[selectedVariantIdx].images[1];
  }

  // Handle Quick Add Action
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (flyingItem) return;

    // Default values
    const selectedSize = product.sizes?.[0] || "M";
    const variantColor = selectedVariantIdx !== null && product.variants?.[selectedVariantIdx]
      ? product.variants[selectedVariantIdx].color
      : (product.variants?.[0]?.color || "Default");

    const cartItem: CartItem = {
      productId: product._id,
      slug: product.slug,
      title: product.title,
      image: currentImage || "",
      price: product.price,
      size: selectedSize,
      color: variantColor,
      quantity: 1,
      rewardCoins: product.rewardCoins || 0
    };

    const imgEl = document.getElementById(`product-card-image-${product._id}`);
    const cartBtn = document.getElementById("nav-cart-btn");

    if (imgEl && cartBtn) {
      const imgRect = imgEl.getBoundingClientRect();
      const cartRect = cartBtn.getBoundingClientRect();

      setFlyingItem({
        id: Date.now(),
        startX: imgRect.left,
        startY: imgRect.top,
        width: imgRect.width,
        height: imgRect.height,
        endX: cartRect.left + cartRect.width / 2 - 15,
        endY: cartRect.top + cartRect.height / 2 - 15,
      });

      setTimeout(() => {
        setFlyingItem(null);

        // Add bounce effect to cart icon
        cartBtn.classList.add("cart-bounce");
        setTimeout(() => {
          cartBtn.classList.remove("cart-bounce");
        }, 400);

        addItem(cartItem);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      }, 1000);
    } else {
      // Fallback
      addItem(cartItem);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      className="group relative flex flex-col bg-transparent overflow-hidden transition-all duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Product Image Frame */}
      <div 
        id={`product-card-image-${product._id}`}
        className="relative aspect-[3/4] w-full overflow-hidden bg-[#f8f8f8]"
      >
        <Link href={`/product/${product.slug}`} className="absolute inset-0">
          {currentImage ? (
            <>
              <Image
                src={currentImage}
                alt={product.title}
                fill
                className={cn(
                  "object-cover transition-all duration-700 ease-luxury",
                  hovered ? "opacity-0 scale-102" : "opacity-100"
                )}
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <Image
                src={secondaryImage}
                alt=""
                fill
                className={cn(
                  "object-cover transition-all duration-700 ease-luxury",
                  hovered ? "opacity-100 scale-102" : "opacity-0"
                )}
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-widest text-neutral-400">
              DEHYDE
            </div>
          )}
        </Link>

        {/* Floating Action Badge (Top Left) */}
        {product.trending && (
          <span className="absolute left-3 top-3 bg-royal text-white text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full z-10">
            Best seller
          </span>
        )}
        {!product.trending && product.featured && (
          <span className="absolute left-3 top-3 bg-neutral-200 text-black text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full z-10">
            New
          </span>
        )}

        {/* Floating Wishlist Button (Top Right) */}
        <button
          type="button"
          onClick={() => toggle(product._id)}
          className="absolute right-3 top-3 z-10 p-2 bg-white rounded-full opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 border border-black/5 shadow-sm"
          aria-label="Add to wishlist"
        >
          <Heart className={cn("h-3.5 w-3.5 text-black transition-colors", inWishlist && "fill-black")} strokeWidth={1.5} />
        </button>

        {/* Quick Add Pill Overlay Button */}
        <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center px-4">
          <button
            type="button"
            onClick={handleQuickAdd}
            className={cn(
              "w-full text-[10px] uppercase tracking-[0.15em] font-semibold py-3 px-4 rounded-full border shadow-sm transition-all duration-300 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 flex items-center justify-center gap-2",
              added
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white text-black border-black/5 hover:bg-royal hover:text-white"
            )}
          >
            {added ? (
              "Added to cart!"
            ) : (
              <>
                <ShoppingCart className="h-3 w-3" />
                Quick Add
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Blocks (Title, Price, Swatches) */}
      <div className="pt-2 flex flex-col flex-1 bg-transparent justify-start px-0">
        {/* Swatches Row - above Title, matching Style Union style */}
        <div className="min-h-[22px] flex items-center mb-1">
          {product.variants && product.variants.length > 1 ? (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1">
                {product.variants.slice(0, 3).map((v, idx) => {
                  const isActive = selectedVariantIdx === idx;
                  return (
                    <button
                      key={v.color}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedVariantIdx(isActive ? null : idx);
                      }}
                      onMouseEnter={() => setSelectedVariantIdx(idx)}
                      className={cn(
                        "relative h-4.5 w-4.5 rounded-full flex items-center justify-center transition-all duration-200 border",
                        isActive ? "border-charcoal scale-105" : "border-gray-200 hover:border-charcoal/50"
                      )}
                      title={v.color}
                    >
                      <span
                        className="h-3 w-3 rounded-full shadow-inner"
                        style={{ backgroundColor: getColorHex(v.color, v.colorHex) }}
                      />
                    </button>
                  );
                })}
              </div>
              {product.variants.length > 3 && (
                <span className="text-[10px] text-muted font-medium">
                  +{product.variants.length - 3}
                </span>
              )}
            </div>
          ) : null}
        </div>

        <Link href={`/product/${product.slug}`} className="block">
          <h3 className="card-product__title">
            {product.title}
          </h3>
          <div className="mt-1 flex items-center gap-2 font-sans font-bold text-xs md:text-sm text-royal">
            <span>{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-[10px] md:text-xs text-neutral-400 line-through font-normal">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
        </Link>
      </div>
      <AnimatePresence>
        {flyingItem && (
          <motion.div
            key={flyingItem.id}
            initial={{
              position: "fixed",
              left: flyingItem.startX,
              top: flyingItem.startY,
              width: flyingItem.width,
              height: flyingItem.height,
              opacity: 0.8,
              borderRadius: "8px",
              overflow: "hidden",
              zIndex: 9999,
              pointerEvents: "none",
            }}
            animate={{
              left: flyingItem.endX,
              top: flyingItem.endY,
              width: 30,
              height: 30,
              opacity: 0.2,
              borderRadius: "50%",
            }}
            exit={{ opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 50,
              damping: 15,
              mass: 0.8,
            }}
          >
            <img src={currentImage || ""} alt="" className="w-full h-full object-cover" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
