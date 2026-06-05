"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { productImage } from "@/lib/products";
import { useAuthStore } from "@/store/authStore";
import type { Category, Product } from "@/types";
import { Plus, Upload, Folder, Layers, Palette, DollarSign, Trash2, X } from "lucide-react";

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

const PRESET_COLORS = [
  { name: "Off-Black", hex: "#1a1a1a" },
  { name: "Cream White", hex: "#f5f2eb" },
  { name: "Concrete Grey", hex: "#a3a3a3" },
  { name: "Warm Taupe", hex: "#8c8275" },
  { name: "Sage Green", hex: "#7d8471" },
  { name: "Midnight Navy", hex: "#1d2d44" },
  { name: "Crimson Red", hex: "#8b2635" },
];

const BASE_COLORS = [
  { name: "Black", r: 26, g: 26, b: 26 },
  { name: "White", r: 245, g: 242, b: 235 },
  { name: "Grey", r: 163, g: 163, b: 163 },
  { name: "Taupe", r: 140, g: 130, b: 117 },
  { name: "Sage Green", r: 125, g: 132, b: 113 },
  { name: "Midnight Navy", r: 29, g: 45, b: 68 },
  { name: "Crimson Red", r: 139, g: 38, b: 53 },
  { name: "Red", r: 255, g: 0, b: 0 },
  { name: "Blue", r: 0, g: 0, b: 255 },
  { name: "Green", r: 0, g: 255, b: 0 },
  { name: "Yellow", r: 255, g: 255, b: 0 },
  { name: "Orange", r: 255, g: 165, b: 0 },
  { name: "Purple", r: 128, g: 0, b: 128 },
  { name: "Pink", r: 255, g: 192, b: 203 },
  { name: "Brown", r: 165, g: 42, b: 42 },
  { name: "Beige", r: 245, g: 245, b: 220 },
];

function hexToRgb(hex: string) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function getClosestColorName(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "Custom";

  let closestName = "Custom";
  let minDistance = Infinity;

  for (const color of BASE_COLORS) {
    const distance = Math.sqrt(
      Math.pow(rgb.r - color.r, 2) +
      Math.pow(rgb.g - color.g, 2) +
      Math.pow(rgb.b - color.b, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestName = color.name;
    }
  }
  return closestName;
}


const emptyForm = {
  title: "",
  description: "",
  category: "",
  price: "",
  compareAtPrice: "",
  color: "Off-Black",
  colorHex: "#1a1a1a",
  stock: "",
  rewardCoins: "",
  tags: "",
  featured: false,
  trending: false,
};

export default function AdminProductsPage() {
  const { accessToken, user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["S", "M", "L", "XL"]);
  
  // Multiple variants state
  const [variants, setVariants] = useState<any[]>([]);
  const [currentVariant, setCurrentVariant] = useState({
    id: "",
    color: "Off-Black",
    colorHex: "#1a1a1a",
    stock: "50",
    imageUrls: "",
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const refresh = () => {
    if (!accessToken || user?.role !== "admin") return;
    apiClient
      .get<{ success: boolean; data: Product[] }>("/admin/products?limit=48", accessToken)
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]));
  };

  useEffect(() => {
    apiClient
      .get<{ success: boolean; data: Category[] }>("/products/categories")
      .then((res) => {
        setCategories(res.data);
        setForm((current) => ({ ...current, category: current.category || res.data[0]?._id || "" }));
      })
      .catch(() => setCategories([]));
  }, []);

  useEffect(refresh, [accessToken, user?.role]);

  const update = (key: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      title: product.title,
      description: product.description,
      category: typeof product.category === "string" ? product.category : product.category?._id || "",
      price: String(product.price),
      compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
      color: "Off-Black",
      colorHex: "#1a1a1a",
      stock: "",
      rewardCoins: String(product.rewardCoins || 0),
      tags: (product.tags || []).join(", "),
      featured: product.featured || false,
      trending: product.trending || false,
    });
    setSelectedSizes(product.sizes || []);
    
    // Load variants
    const loadedVariants = (product.variants || []).map((v, index) => ({
      id: (v as any)._id || String(index),
      color: v.color,
      colorHex: v.colorHex || "#1a1a1a",
      stock: v.stock,
      images: v.images || [],
    }));
    setVariants(loadedVariants);

    setCurrentVariant({
      id: "",
      color: "Off-Black",
      colorHex: "#1a1a1a",
      stock: "50",
      imageUrls: "",
    });
    setMessage("");
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setForm({ ...emptyForm, category: categories[0]?._id || "" });
    setSelectedSizes(["S", "M", "L", "XL"]);
    setVariants([]);
    setCurrentVariant({
      id: "",
      color: "Off-Black",
      colorHex: "#1a1a1a",
      stock: "50",
      imageUrls: "",
    });
    setMessage("");
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering edit
    if (!accessToken) return;
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await apiClient.delete(`/products/${id}`, accessToken);
      setMessage("Product deleted successfully!");
      refresh();
      if (editingProduct?._id === id) {
        cancelEdit();
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Product deletion failed");
    }
  };

  const handleVariantImageUpload = async (files: FileList | null) => {
    if (!files?.length || !accessToken) return;
    setUploading(true);
    setMessage("");
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const data = new FormData();
        data.append("image", file);
        const res = await apiClient.upload<{ success: boolean; data: { url: string } }>("/upload", data, accessToken);
        urls.push(res.data.url);
      }
      setCurrentVariant((curr) => ({
        ...curr,
        imageUrls: [curr.imageUrls, ...urls].filter(Boolean).join("\n"),
      }));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveVariant = () => {
    if (!currentVariant.color.trim()) {
      alert("Please enter a color name.");
      return;
    }
    const images = currentVariant.imageUrls
      .split(/\r?\n|,/)
      .map((url) => url.trim())
      .filter(Boolean);
    const stock = Number(currentVariant.stock || 0);

    if (currentVariant.id) {
      // Edit mode
      setVariants((prev) =>
        prev.map((v) =>
          v.id === currentVariant.id
            ? { ...v, color: currentVariant.color, colorHex: currentVariant.colorHex, stock, images }
            : v
        )
      );
    } else {
      // Add mode
      const newVar = {
        id: String(Date.now()),
        color: currentVariant.color,
        colorHex: currentVariant.colorHex,
        stock,
        images,
      };
      setVariants((prev) => [...prev, newVar]);
    }

    // Reset current variant inputs
    setCurrentVariant({
      id: "",
      color: "Off-Black",
      colorHex: "#1a1a1a",
      stock: "50",
      imageUrls: "",
    });
  };

  const handleEditVariant = (v: any) => {
    setCurrentVariant({
      id: v.id,
      color: v.color,
      colorHex: v.colorHex || "#1a1a1a",
      stock: String(v.stock),
      imageUrls: (v.images || []).join("\n"),
    });
  };

  const handleDeleteVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
    if (currentVariant.id === id) {
      cancelEditVariant();
    }
  };

  const cancelEditVariant = () => {
    setCurrentVariant({
      id: "",
      color: "Off-Black",
      colorHex: "#1a1a1a",
      stock: "50",
      imageUrls: "",
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accessToken) return;
    if (selectedSizes.length === 0) {
      setMessage("Please select at least one size.");
      return;
    }
    if (variants.length === 0) {
      setMessage("Please add at least one color variant.");
      return;
    }
    setSaving(true);
    setMessage("");

    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
    const allImages = Array.from(new Set(variants.flatMap((v) => v.images)));

    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
      sizes: selectedSizes,
      variants: variants.map((v) => ({
        color: v.color,
        colorHex: v.colorHex,
        images: v.images,
        stock: v.stock,
      })),
      images: allImages,
      stock: totalStock,
      rewardCoins: Number(form.rewardCoins || 0),
      featured: form.featured,
      trending: form.trending,
      tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    };

    try {
      if (editingProduct) {
        await apiClient.patch(`/admin/products/${editingProduct._id}`, payload, accessToken);
        setMessage("Product updated successfully!");
        setEditingProduct(null);
      } else {
        await apiClient.post("/admin/products", payload, accessToken);
        setMessage("Product added successfully!");
      }
      setForm({ ...emptyForm, category: categories[0]?._id || "" });
      setSelectedSizes(["S", "M", "L", "XL"]);
      setVariants([]);
      refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Product save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto px-4 pb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-charcoal">Products Catalog</h1>
          <p className="text-xs text-charcoal/50 mt-1">Manage and create premium streetwear listings.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
        {/* Creation Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 bg-white border border-gray-100 p-6 md:p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
        >
          {/* Section 1: General Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Folder size={16} className="text-charcoal/50" />
                <h2 className="text-xs uppercase tracking-editorial font-bold text-charcoal/80">
                  {editingProduct ? "Edit Product Details" : "General Information"}
                </h2>
              </div>
              {editingProduct && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="text-[10px] uppercase tracking-wider text-red-600 hover:text-red-700 font-bold flex items-center gap-1 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-all"
                >
                  <X size={10} strokeWidth={3} />
                  Cancel Edit
                </button>
              )}
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-charcoal/50 font-medium">Product Title</label>
              <input
                type="text"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 h-11 bg-white text-charcoal outline-none focus:border-charcoal hover:border-gray-300 transition-all text-sm"
                placeholder="e.g. Minimalist Editorial Tee"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-charcoal/50 font-medium">Description</label>
              <textarea
                className="w-full border border-gray-200 rounded-xl px-4 py-3 min-h-24 bg-white text-charcoal outline-none focus:border-charcoal hover:border-gray-300 transition-all text-sm resize-none"
                placeholder="Detail the fit, material, weave, and editorial design elements..."
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-charcoal/50 font-medium">Category</label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 h-11 bg-white text-charcoal outline-none focus:border-charcoal hover:border-gray-300 transition-all text-sm cursor-pointer"
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                  required
                >
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-charcoal/50 font-medium">Tags (Comma-separated)</label>
                <input
                  type="text"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 h-11 bg-white text-charcoal outline-none focus:border-charcoal hover:border-gray-300 transition-all text-sm"
                  placeholder="e.g. heavyweight, oversized, essential"
                  value={form.tags}
                  onChange={(e) => update("tags", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Inventory */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <DollarSign size={16} className="text-charcoal/50" />
              <h2 className="text-xs uppercase tracking-editorial font-bold text-charcoal/80">Pricing & Inventory</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-charcoal/50 font-medium">Discounted Price (₹)</label>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 h-11 bg-white text-charcoal outline-none focus:border-charcoal hover:border-gray-300 transition-all text-sm"
                  placeholder="2499"
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-charcoal/50 font-medium">Original Price (₹)</label>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 h-11 bg-white text-charcoal outline-none focus:border-charcoal hover:border-gray-300 transition-all text-sm"
                  placeholder="3499"
                  value={form.compareAtPrice}
                  onChange={(e) => update("compareAtPrice", e.target.value)}
                />
              </div>

              <div className="space-y-1 col-span-2 sm:col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-charcoal/50 font-medium">Reward Coins</label>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 h-11 bg-white text-charcoal outline-none focus:border-charcoal hover:border-gray-300 transition-all text-sm"
                  placeholder="50"
                  value={form.rewardCoins}
                  onChange={(e) => update("rewardCoins", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Sizes */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Layers size={16} className="text-charcoal/50" />
              <h2 className="text-xs uppercase tracking-editorial font-bold text-charcoal/80">Available Sizes</h2>
            </div>

            {/* Premium Multi-select Sizes Selector */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-charcoal/50 font-medium block">
                Select Available Sizes
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_SIZES.map((size) => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`h-10 px-4 rounded-xl text-xs uppercase tracking-wider transition-all font-semibold border ${
                        isSelected
                          ? "bg-charcoal text-white border-charcoal shadow-sm"
                          : "bg-white text-charcoal/60 border-gray-200 hover:border-gray-300 hover:text-charcoal"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 4: Color Variants */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Palette size={16} className="text-charcoal/50" />
              <h2 className="text-xs uppercase tracking-editorial font-bold text-charcoal/80">Color Variants & Inventory ({variants.length})</h2>
            </div>

            {/* List of Added Variants */}
            {variants.length > 0 ? (
              <div className="grid gap-3">
                {variants.map((v, idx) => (
                  <div 
                    key={v.id || idx} 
                    className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-100 rounded-xl"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-6 h-6 rounded-full border border-black/10 flex-shrink-0"
                        style={{ backgroundColor: v.colorHex }}
                      />
                      <div className="min-w-0 text-xs">
                        <p className="font-semibold text-charcoal">{v.color}</p>
                        <p className="text-[10px] text-charcoal/40 font-mono mt-0.5">
                          Stock: {v.stock} · {v.images.length} images
                        </p>
                        {v.images.length > 0 && (
                          <div className="flex gap-1.5 mt-2 overflow-x-auto">
                            {v.images.slice(0, 5).map((imgUrl: string, imgIdx: number) => (
                              <img
                                key={imgIdx}
                                src={imgUrl}
                                alt=""
                                className="w-7 h-7 object-cover rounded border border-gray-200"
                              />
                            ))}
                            {v.images.length > 5 && (
                              <div className="w-7 h-7 bg-gray-200 border border-gray-300 flex items-center justify-center text-[8px] font-bold text-charcoal/60 rounded">
                                +{v.images.length - 5}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditVariant(v)}
                        className="text-[10px] uppercase font-bold tracking-wider text-charcoal/70 hover:text-charcoal bg-white border border-gray-200 px-2.5 py-1 rounded-lg shadow-sm"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteVariant(v.id)}
                        className="text-[10px] uppercase font-bold tracking-wider text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl bg-gray-50/30 text-charcoal/40 text-xs">
                <Palette size={20} className="mx-auto text-charcoal/20 mb-2" />
                <p>No color variants added yet.</p>
                <p className="text-[9px] uppercase tracking-wider mt-1 text-charcoal/30">Add at least one color variant below</p>
              </div>
            )}

            {/* Variant Editor Subform */}
            <div className="border border-charcoal/10 rounded-2xl p-5 bg-stone-50/50 space-y-4">
              <p className="text-[10px] uppercase tracking-wider text-charcoal font-bold">
                {currentVariant.id ? "Edit Color Variant" : "Add New Color Variant"}
              </p>

              {/* Swatches & Color Input */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-charcoal/50 font-medium block">
                  Color Presets
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => {
                        setCurrentVariant((curr) => ({
                          ...curr,
                          color: color.name,
                          colorHex: color.hex,
                        }));
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1.2 rounded-lg border text-xs transition-all ${
                        currentVariant.colorHex.toLowerCase() === color.hex.toLowerCase()
                          ? "border-charcoal bg-white font-semibold"
                          : "border-gray-200 bg-white text-charcoal/60 hover:border-gray-300"
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/10 flex-shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-charcoal/50 font-medium">Color Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 h-11 bg-white text-charcoal outline-none focus:border-charcoal hover:border-gray-300 transition-all text-sm"
                    placeholder="e.g. Sage Green"
                    value={currentVariant.color}
                    onChange={(e) => setCurrentVariant((curr) => ({ ...curr, color: e.target.value }))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-charcoal/50 font-medium block">Color Hex</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        className="w-full border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 h-11 bg-white text-charcoal outline-none focus:border-charcoal hover:border-gray-300 transition-all text-sm font-mono"
                        placeholder="#7d8471"
                        value={currentVariant.colorHex}
                        onChange={(e) => {
                          const hex = e.target.value;
                          setCurrentVariant((curr) => ({
                            ...curr,
                            colorHex: hex,
                            color: hex.startsWith("#") && (hex.length === 4 || hex.length === 7) ? getClosestColorName(hex) : curr.color,
                          }));
                        }}
                      />
                      <span
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-black/10"
                        style={{ backgroundColor: currentVariant.colorHex }}
                      />
                    </div>
                    <div className="w-11 h-11 border border-gray-200 rounded-xl flex items-center justify-center bg-white overflow-hidden relative group hover:border-gray-300 cursor-pointer">
                      <input
                        type="color"
                        value={currentVariant.colorHex}
                        onChange={(e) => {
                          const hex = e.target.value;
                          setCurrentVariant((curr) => ({
                            ...curr,
                            colorHex: hex,
                            color: getClosestColorName(hex),
                          }));
                        }}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      />
                      <Palette size={16} className="text-charcoal/60 group-hover:text-charcoal" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Variant Stock level */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-charcoal/50 font-medium">Variant Stock Level</label>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 h-11 bg-white text-charcoal outline-none focus:border-charcoal hover:border-gray-300 transition-all text-sm"
                  placeholder="50"
                  value={currentVariant.stock}
                  onChange={(e) => setCurrentVariant((curr) => ({ ...curr, stock: e.target.value }))}
                />
              </div>

              {/* Variant Images Upload area */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-wider text-charcoal/50 font-medium block">
                  Variant Images
                </label>
                
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-5 text-center hover:border-charcoal/30 transition-all bg-gray-50/50 cursor-pointer relative group">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleVariantImageUpload(e.target.files)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload size={20} className="mx-auto text-charcoal/30 group-hover:text-charcoal/60 mb-2 transition-colors" />
                  <p className="text-[11px] font-semibold text-charcoal/70">Click to Upload Variant Images</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-charcoal/40 font-medium">Variant Image URLs (one per line)</label>
                  <textarea
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 min-h-20 bg-white text-charcoal outline-none focus:border-charcoal hover:border-gray-300 transition-all text-xs font-mono resize-none"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={currentVariant.imageUrls}
                    onChange={(e) => setCurrentVariant((curr) => ({ ...curr, imageUrls: e.target.value }))}
                  />
                </div>
              </div>

              {/* Save/Add Variant action button */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSaveVariant}
                  className="flex-1 bg-charcoal text-offwhite hover:bg-black h-10 text-[10px] uppercase tracking-widest rounded-xl font-bold transition-all shadow-sm"
                >
                  {currentVariant.id ? "Update Variant" : "Add Variant"}
                </button>
                {currentVariant.id && (
                  <button
                    type="button"
                    onClick={cancelEditVariant}
                    className="bg-gray-100 hover:bg-gray-200 text-charcoal h-10 px-4 text-[10px] uppercase tracking-widest rounded-xl font-bold transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section 5: Status Features */}
          <div className="flex flex-wrap gap-8 py-4 border-t border-gray-100 pt-6 text-xs text-charcoal/70">
            <label className="flex items-center gap-2.5 cursor-pointer font-medium select-none group">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-charcoal focus:ring-charcoal/30 cursor-pointer"
                checked={form.featured}
                onChange={(e) => update("featured", e.target.checked)}
              />
              <span className="group-hover:text-charcoal transition-colors">Featured Product</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer font-medium select-none group">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-charcoal focus:ring-charcoal/30 cursor-pointer"
                checked={form.trending}
                onChange={(e) => update("trending", e.target.checked)}
              />
              <span className="group-hover:text-charcoal transition-colors">Trending Item</span>
            </label>
          </div>

          {message && (
            <p className={`text-xs p-3.5 rounded-xl font-semibold border ${
              message.toLowerCase().includes("success") 
                ? "bg-green-50 text-green-700 border-green-200" 
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}>
              {message}
            </p>
          )}

          <Button
            type="submit"
            className={`w-full text-white h-12 text-xs uppercase tracking-widest mt-4 rounded-xl flex items-center justify-center gap-2 font-bold shadow-md hover:shadow-lg transition-all ${
              editingProduct ? "bg-amber-600 hover:bg-amber-700" : "bg-charcoal hover:bg-black"
            }`}
            disabled={saving || uploading || categories.length === 0}
          >
            {saving ? "Saving..." : uploading ? "Uploading Images..." : (
              <>
                {editingProduct ? (
                  <>
                    <Layers size={14} />
                    Update Product Listing
                  </>
                ) : (
                  <>
                    <Plus size={14} strokeWidth={2.5} />
                    Create Product Listing
                  </>
                )}
              </>
            )}
          </Button>
        </motion.form>

        {/* Catalog List */}
        <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] h-fit">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-charcoal/50" />
              <h2 className="text-xs uppercase tracking-editorial font-bold text-charcoal/80">Manage Catalog</h2>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-charcoal/40 font-bold bg-gray-100 px-2 py-0.5 rounded">
              {products.length} Items
            </span>
          </div>

          <div className="space-y-1 divide-y divide-gray-100 max-h-[75vh] overflow-y-auto pr-1">
            {products.map((product) => (
              <div 
                key={product._id} 
                onClick={() => startEdit(product)}
                className={`flex items-center justify-between py-4 text-sm last:border-0 px-2.5 -mx-2.5 transition-all rounded-xl group cursor-pointer ${
                  editingProduct?._id === product._id 
                    ? "bg-stone-100 ring-1 ring-charcoal/10" 
                    : "hover:bg-gray-50/50"
                }`}
              >
                <div className="flex gap-4 items-center min-w-0">
                  <div className="w-11 h-11 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200/50">
                    {productImage(product) ? (
                      <img src={productImage(product) || ''} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] text-charcoal/30 uppercase font-semibold">No Img</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-charcoal truncate">{product.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-charcoal/40 font-mono">{product.stock} in stock</span>
                      {product.featured && (
                        <span className="text-[8px] uppercase tracking-wider bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded font-semibold border border-amber-200/50">Featured</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <div className="text-right">
                    <span className="block font-semibold text-charcoal">{formatPrice(product.price)}</span>
                  </div>
                  <button
                    onClick={(e) => handleDelete(product._id, e)}
                    className="p-2 text-charcoal/30 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Delete product"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="text-center py-16 text-charcoal/30">
                <Layers size={32} className="mx-auto text-charcoal/10 mb-3" />
                <p className="text-sm font-medium">No products found</p>
                <p className="text-[10px] uppercase tracking-widest mt-2">Create your first product using the form</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
