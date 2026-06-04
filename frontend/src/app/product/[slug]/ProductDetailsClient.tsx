"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { ProductCard } from "@/components/product/ProductCard";
import { apiClient } from "@/lib/api";
import type { Product } from "@/types";
import { productImage } from "@/lib/products";

interface Props {
  product: Product;
}

export default function ProductDetailsClient({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [variantImageOverride, setVariantImageOverride] = useState<string | null>(null);
  const [size, setSize] = useState(product.sizes?.[0] || "");
  const [color, setColor] = useState(product.variants?.[0]?.color || "");

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

  const images = product.images?.length ? product.images : product.variants?.flatMap((v) => v.images || []) || [];
  const activeImage = variantImageOverride || images[selectedImage] || productImage(product);

  const handleAdd = (buyNow = false) => {
    if (!size) {
      alert("Please select a size first.");
      return;
    }
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
    if (buyNow) window.location.href = "/checkout";
  };

  return (
    <div className="luxury-container">
      <motion.div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="space-y-4">
          <div className="relative aspect-[3/4] overflow-hidden bg-stone/5">
            {activeImage ? (
              <Image
                src={activeImage}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-editorial text-muted">
                DEHYDE
              </div>
            )}
          </div>
          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => {
                    setSelectedImage(i);
                    setVariantImageOverride(null);
                  }}
                  className={`relative aspect-square overflow-hidden ${
                    (variantImageOverride === null && selectedImage === i) || variantImageOverride === img ? "ring-1 ring-charcoal" : "opacity-60"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="100px" />
                </button>
              ))}
            </div>
          )}
        </div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <p className="text-[10px] uppercase tracking-editorial text-muted">
            {typeof product.category === "object" ? product.category.name : "Collection"}
          </p>
          <h1 className="editorial-heading mt-4 text-4xl md:text-5xl">{product.title}</h1>
          <div className="mt-6 flex items-center gap-4">
            <span className="text-lg">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-sm text-muted line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
          {product.rewardCoins > 0 && (
            <p className="mt-4 text-xs text-muted">
              Earn <span className="text-charcoal">{product.rewardCoins} DEHYDE coins</span> (₹
              {product.rewardCoins} value) on this purchase
            </p>
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
                      if (swatchImage) {
                        setVariantImageOverride(swatchImage);
                      }
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
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`min-w-[48px] border px-4 py-3 text-xs uppercase ${
                    size === s
                      ? "border-charcoal bg-charcoal text-offwhite"
                      : "border-charcoal/20 hover:border-charcoal"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button className="flex-1" onClick={() => handleAdd(false)}>
              Add to cart
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => handleAdd(true)}>
              Buy now
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
                  <span className="text-muted">Fulfillment Distance:</span>
                  <span className="font-semibold text-charcoal">~{estimate.distance} km from {estimate.warehouseName} Warehouse</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Cash on Delivery (COD):</span>
                  <span className={`font-semibold ${estimate.isCodAvailable ? 'text-green-600' : 'text-amber-600'}`}>
                    {estimate.isCodAvailable ? "Available" : "Prepaid Only"}
                  </span>
                </div>
                
                <div className="mt-2 border-t border-charcoal/5 pt-2 grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white border border-charcoal/5 rounded">
                    <p className="font-semibold text-[10px] text-charcoal uppercase tracking-wider">Standard Delivery</p>
                    <p className="text-green-600 font-semibold mt-1">{estimate.standard.dateString}</p>
                    <p className="text-muted mt-0.5">Shipping: {estimate.standard.price === 0 ? "Complimentary" : `₹${estimate.standard.price}`}</p>
                    <p className="text-[10px] text-muted/80 mt-1">via {estimate.standard.courier}</p>
                  </div>
                  
                  {estimate.express.isAvailable ? (
                    <div className="p-3 bg-white border border-charcoal/5 rounded">
                      <p className="font-semibold text-[10px] text-charcoal uppercase tracking-wider flex items-center gap-1">
                        Express Delivery
                        <span className="bg-charcoal text-offwhite text-[8px] px-1 py-0.2 rounded font-normal uppercase scale-90">Fast</span>
                      </p>
                      <p className="text-green-600 font-semibold mt-1">{estimate.express.dateString}</p>
                      <p className="text-muted mt-0.5">Shipping: ₹{estimate.express.price}</p>
                      <p className="text-[10px] text-muted/80 mt-1">via {estimate.express.courier}</p>
                    </div>
                  ) : (
                    <div className="p-3 bg-stone/5 border border-dashed border-charcoal/10 rounded flex flex-col justify-center items-center text-center">
                      <p className="text-[10px] text-muted uppercase font-semibold">Express Delivery</p>
                      <p className="text-muted text-[10px] mt-1">Unavailable (&gt;2500 km)</p>
                    </div>
                  )}
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
    </div>
  );
}
