"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { ProductCard } from "@/components/product/ProductCard";
import { apiClient } from "@/lib/api";
import type { Product } from "@/types";
import { productImage } from "@/lib/products";
import { Heart, Share2, Coins } from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";

interface Props {
  product: Product;
}

export default function ProductDetailsClient({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const { has: hasWishlist, toggle: toggleWishlist } = useWishlistStore();
  const inWishlist = hasWishlist(product._id);
  const [copied, setCopied] = useState(false);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [variantImageOverride, setVariantImageOverride] = useState<string | null>(null);
  // Auto-select first in-stock size for the default variant
  const getFirstInStockSize = () => {
    const firstVariant = product.variants?.[0];
    if (firstVariant?.sizes?.length) {
      const inStock = product.sizes?.find((s) => {
        const sizeEntry = firstVariant.sizes.find((sz) => sz.size === s);
        return sizeEntry ? sizeEntry.stock > 0 : false;
      });
      return inStock || product.sizes?.[0] || "";
    }
    return product.sizes?.[0] || "";
  };
  const [size, setSize] = useState(getFirstInStockSize());
  const [color, setColor] = useState(product.variants?.[0]?.color || "");

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Could not copy link: ", err);
      });
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      if (navigator.share) {
        navigator.share({
          title: product.title,
          text: `Check out ${product.title} on DEHYDE`,
          url: window.location.href,
        }).catch((err) => {
          if (err.name !== "AbortError") {
            copyToClipboard();
          }
        });
      } else {
        copyToClipboard();
      }
    }
  };

  const [flyingItem, setFlyingItem] = useState<{
    id: number;
    startX: number;
    startY: number;
    width: number;
    height: number;
    endX: number;
    endY: number;
  } | null>(null);

  const [pincode, setPincode] = useState("");
  const [estimate, setEstimate] = useState<any>(null);
  const [error, setError] = useState("");
  const [loadingPincode, setLoadingPincode] = useState(false);

  useEffect(() => {
    const savedPincode = localStorage.getItem("hyde_checked_pincode");
    if (savedPincode) {
      setPincode(savedPincode);
      setLoadingPincode(true);
      apiClient
        .post<{ success: boolean; data: any }>("/settings/estimate", { pincode: savedPincode, subtotal: product.price })
        .then((res) => {
          setEstimate(res.data);
        })
        .catch(() => {})
        .finally(() => setLoadingPincode(false));
    }
  }, [product._id, product.price]);

  const checkDelivery = async () => {
    if (pincode.length !== 6) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }
    setLoadingPincode(true);
    setError("");
    setEstimate(null);
    try {
      const res = await apiClient.post<{ success: boolean; data: any }>("/settings/estimate", {
        pincode,
        subtotal: product.price,
      });
      if (res.success && res.data) {
        setEstimate(res.data);
        localStorage.setItem("hyde_checked_pincode", pincode);
      } else {
        setError("Unable to calculate delivery estimate for this pincode.");
      }
    } catch (err: any) {
      setError(err?.message || "Could not fetch delivery details. Please check the pincode.");
    } finally {
      setLoadingPincode(false);
    }
  };


  useEffect(() => {
    // Fetch related products on client side
    apiClient
      .get<{ success: boolean; data: Product[] }>("/products?limit=5")
      .then((res) => {
        setRelated(res.data.filter((p) => p.slug !== product.slug).slice(0, 4));
      })
      .catch(console.error);
  }, [product.slug]);

  useEffect(() => {
    setSelectedImage(0);
    setVariantImageOverride(null);
  }, [color]);

  const activeVariant = product.variants?.find((v) => v.color === color);
  const images = activeVariant?.images?.length
    ? activeVariant.images
    : (product.images?.length ? product.images : []);
  const activeImage = variantImageOverride || images[selectedImage] || productImage(product);

  const handleAdd = (buyNow = false, e?: React.MouseEvent<HTMLButtonElement>) => {
    if (!size) {
      alert("Please select a size first.");
      return;
    }

    // Block adding out-of-stock items
    if (isOutOfStock) {
      alert("This size is currently out of stock. Please select a different size.");
      return;
    }

    if (!buyNow) {
      if (flyingItem) return;

      const imgEl = document.getElementById("product-main-image");
      const cartBtn = document.getElementById("nav-cart-btn");
      const btnEl = e?.currentTarget;

      if (imgEl && cartBtn) {
        const imgRect = imgEl.getBoundingClientRect();
        const cartRect = cartBtn.getBoundingClientRect();
        const btnRect = btnEl ? btnEl.getBoundingClientRect() : null;

        // Check if main product image is visible on-screen
        const isImgVisible = imgRect.bottom > 80 && imgRect.top < window.innerHeight;
        // Start from product image if visible (typical on desktop), else start from clicked button (typical on mobile)
        const startRect = (isImgVisible || !btnRect) ? imgRect : btnRect;

        setFlyingItem({
          id: Date.now(),
          startX: startRect.left,
          startY: startRect.top,
          width: startRect.width,
          height: startRect.height,
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

          // Add item to cart
          addItem({
            productId: product._id,
            slug: product.slug,
            title: product.title,
            image: activeImage,
            price: product.price,
            size,
            color,
            quantity: 1,
            rewardCoins: product.rewardCoins,
          });
        }, 1000);
      } else {
        // Fallback
        addItem({
          productId: product._id,
          slug: product.slug,
          title: product.title,
          image: activeImage,
          price: product.price,
          size,
          color,
          quantity: 1,
          rewardCoins: product.rewardCoins,
        });
      }
    } else {
      addItem({
        productId: product._id,
        slug: product.slug,
        title: product.title,
        image: activeImage,
        price: product.price,
        size,
        color,
        quantity: 1,
        rewardCoins: product.rewardCoins,
      });
      window.location.href = "/checkout";
    }
  };

  const selectedSizeObj = activeVariant?.sizes?.find((sz) => sz.size === size);
  const isOutOfStock = selectedSizeObj 
    ? (selectedSizeObj.stock <= 0) 
    : (activeVariant ? activeVariant.stock <= 0 : product.stock <= 0);

  return (
    <div className="luxury-container">
      <motion.div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5 flex flex-col-reverse md:flex-row gap-4 items-start w-full">
          {/* Thumbnail list (vertical on desktop, horizontal on mobile) */}
          {images.length > 0 && (
            <div className="flex flex-row md:flex-col gap-3 w-full md:w-[80px] md:max-h-[650px] overflow-x-auto md:overflow-y-auto no-scrollbar justify-start flex-shrink-0">
              {images.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => {
                    setSelectedImage(i);
                    setVariantImageOverride(null);
                  }}
                  className={`relative w-20 h-24 md:w-20 md:h-24 flex-shrink-0 overflow-hidden transition-all ${
                    (variantImageOverride === null && selectedImage === i) || variantImageOverride === img 
                      ? "ring-1 ring-charcoal opacity-100" 
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="100px" />
                </button>
              ))}
            </div>
          )}

          {/* Main Image Container */}
          <div className="relative flex-1 aspect-[3/4] w-full overflow-hidden bg-stone/5">
            {activeImage ? (
              <div className="relative w-full h-full">
                <Image
                  id="product-main-image"
                  src={activeImage}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  priority
                />
                {/* Floating Wishlist Button (Top Right) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleWishlist(product._id);
                  }}
                  className="absolute right-4 top-4 z-10 p-2 text-charcoal hover:text-black transition-all"
                  aria-label="Toggle wishlist"
                >
                  <Heart
                    className={cn(
                      "h-6 w-6 transition-all duration-300",
                      inWishlist ? "fill-black text-black" : "text-black hover:scale-110"
                    )}
                    strokeWidth={1.5}
                  />
                </button>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-editorial text-muted">
                DEHYDE
              </div>
            )}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-7 w-full">
          <p className="text-[10px] uppercase tracking-editorial text-muted">
            {typeof product.category === "object" ? product.category.name : "Collection"}
          </p>
          <div className="flex justify-between items-start gap-4 mt-4">
            <h1 className="editorial-heading text-3xl md:text-4xl lg:text-5xl flex-1 leading-tight">{product.title}</h1>
            <div className="relative flex-shrink-0 mt-1">
              <button
                type="button"
                onClick={handleShare}
                className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-charcoal hover:bg-neutral-200 hover:text-black transition-all duration-300 shadow-sm border border-black/5"
                title="Share product"
                aria-label="Share product"
              >
                <Share2 className="h-4 w-4" />
              </button>
              
              <AnimatePresence>
                {copied && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 bottom-full mb-2 z-20 whitespace-nowrap bg-charcoal text-offwhite text-[10px] uppercase tracking-widest px-3 py-1.5 shadow-md font-medium"
                  >
                    Link copied!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          {/* Premium Pricing Block */}
          <div className="mt-6 p-4 rounded-xl border border-charcoal/5 bg-neutral-50/50 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl md:text-3xl font-extrabold text-charcoal tracking-tight">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-sm md:text-base text-neutral-400 line-through font-normal">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="bg-royal text-white text-[10px] uppercase tracking-widest font-extrabold px-3 py-1.5 rounded-full shadow-sm">
                Save {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
              </span>
            )}
          </div>
          {product.rewardCoins > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-5 flex items-center gap-3 bg-gradient-to-r from-amber-50/60 to-amber-50/10 border-l-[3px] border-amber-500 rounded-r-xl px-4 py-3 shadow-[0_2px_8px_rgba(245,158,11,0.03)] group cursor-default"
            >
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-600 relative overflow-hidden group-hover:scale-110 transition-transform duration-300">
                <Coins size={16} className="relative z-10 animate-[spin_4s_linear_infinite]" />
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent animate-pulse" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-charcoal flex items-center gap-1.5">
                  Earn <span className="text-amber-600 font-bold font-serif text-sm tracking-wide">{product.rewardCoins} DEHYDE Coins</span>
                </p>
                <p className="text-[10px] text-muted/80 mt-0.5 font-medium">
                  Worth <span className="font-semibold text-charcoal/70">₹{product.rewardCoins}</span> in savings on your next checkout!
                </p>
              </div>
            </motion.div>
          )}
          <p className="mt-8 text-sm leading-relaxed text-muted">{product.description}</p>

          <div className="mt-10">
            <p className="text-[10px] uppercase tracking-editorial text-muted">Color — {color}</p>
            <motion.div className="mt-3 flex flex-wrap gap-3">
              {product.variants.map((v) => {
                const swatchImage = v.images?.[0];
                const isSelected = color === v.color;
                return (
                  <button
                    key={v.color}
                    type="button"
                    onClick={() => {
                      setColor(v.color);
                    }}
                    className={`h-12 w-12 rounded-full border-2 overflow-hidden relative transition-all ${
                      isSelected ? "border-charcoal scale-105 shadow-sm" : "border-gray-200 hover:border-charcoal/50"
                    }`}
                    aria-label={v.color}
                  >
                    {swatchImage ? (
                      <img
                        src={swatchImage}
                        alt={v.color}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span
                        className="absolute inset-0 rounded-full"
                        style={{ backgroundColor: v.colorHex || "#1a1a1a" }}
                      />
                    )}
                  </button>
                );
              })}
            </motion.div>
          </div>

          <div className="mt-8">
            <p className="text-[10px] uppercase tracking-editorial text-muted">Size</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((s) => {
                const sizeStock = activeVariant?.sizes?.find((sz) => sz.size === s)?.stock ?? 1;
                const outOfStock = sizeStock <= 0;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => !outOfStock && setSize(s)}
                    disabled={outOfStock}
                    className={`min-w-[48px] border px-4 py-3 text-xs uppercase relative transition-all ${
                      size === s && !outOfStock
                        ? "border-charcoal bg-charcoal text-offwhite"
                        : outOfStock
                        ? "border-charcoal/15 text-charcoal/30 cursor-not-allowed bg-stone/5"
                        : "border-charcoal/20 hover:border-charcoal"
                    }`}
                  >
                    {s}
                    {outOfStock && (
                      <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="w-[120%] h-[1px] bg-charcoal/20 rotate-45 transform origin-center" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button 
              className="flex-1 font-bold text-xs uppercase tracking-widest h-12" 
              onClick={(e) => handleAdd(false, e)}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? "Out of Stock" : "Add to cart"}
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 font-bold text-xs uppercase tracking-widest h-12 border-charcoal text-charcoal hover:bg-stone/5" 
              onClick={(e) => handleAdd(true, e)}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? "Out of Stock" : "Buy now"}
            </Button>
          </div>

          {/* Pincode Checker Card */}
          <div className="mt-8 border border-charcoal/10 p-5 rounded-lg bg-cream/20">
            <p className="text-[10px] uppercase tracking-editorial text-charcoal font-semibold mb-3">
              Delivery Availability & Estimations
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit Pincode"
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value.replace(/\D/g, ""));
                  setEstimate(null);
                  setError("");
                }}
                className="flex-1 bg-white border border-charcoal/20 px-4 py-2.5 text-xs tracking-wider outline-none placeholder:text-muted focus:border-charcoal transition-colors text-charcoal"
              />
              <button
                type="button"
                onClick={checkDelivery}
                disabled={pincode.length !== 6 || loadingPincode}
                className="bg-charcoal text-offwhite hover:bg-black px-6 py-2.5 text-xs uppercase tracking-widest transition-colors font-medium disabled:opacity-40"
              >
                {loadingPincode ? "Checking..." : "Check"}
              </button>
            </div>
            
            {error && (
              <p className="text-red-500 text-xs mt-3 font-medium">{error}</p>
            )}
            
            {estimate && (
              <div className="mt-4 space-y-3 border-t border-charcoal/10 pt-4 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted">Destination:</span>
                  <span className="font-semibold text-charcoal">{estimate.city}, {estimate.state}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Cash on Delivery (COD):</span>
                  <span className={`font-semibold ${estimate.isCodAvailable ? 'text-green-600' : 'text-amber-600'}`}>
                    {estimate.isCodAvailable ? "Available" : "Prepaid Only"}
                  </span>
                </div>
                
                <div className="mt-2 border-t border-charcoal/5 pt-2">
                  <div className="p-3.5 bg-white border border-charcoal/5 rounded">
                    <p className="font-semibold text-[10px] text-charcoal uppercase tracking-wider">Shipping</p>
                    <p className="text-green-600 font-semibold mt-1">{estimate.standard.dateString}</p>
                    <p className="text-muted mt-0.5">Rate: {estimate.standard.price === 0 ? "FREE" : `₹${estimate.standard.price}`}</p>
                    <p className="text-[10px] text-muted/80 mt-1.5 border-t border-gray-100 pt-1.5">Dispatched via {estimate.standard.courier}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-12 space-y-4 border-t border-charcoal/10 pt-8 text-sm text-muted">
            <p>Free shipping on orders above ₹2,999</p>
            <p>Delivery across India · 3–7 business days</p>
            <p>14-day returns on unworn items</p>
          </div>
        </motion.div>
      </motion.div>

      <section className="mt-section">
        <h2 className="editorial-heading text-3xl">You may also like</h2>
        <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
          {related.map((p, i) => (
            <ProductCard key={p._id} product={p} index={i} />
          ))}
        </div>
      </section>
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
            <img src={activeImage} alt="" className="w-full h-full object-cover" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
