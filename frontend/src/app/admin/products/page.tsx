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
import { Plus, Upload, Folder, Layers, Palette, DollarSign } from "lucide-react";

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
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["S", "M", "L", "XL"]);
  const [imageUrls, setImageUrls] = useState("");
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

  const handleUpload = async (files: FileList | null) => {
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
      setImageUrls((current) => [current, ...urls].filter(Boolean).join("\n"));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accessToken) return;
    if (selectedSizes.length === 0) {
      setMessage("Please select at least one size.");
      return;
    }
    setSaving(true);
    setMessage("");
    const images = imageUrls
      .split(/\r?\n|,/)
      .map((url) => url.trim())
      .filter(Boolean);
    const stock = Number(form.stock || 0);

    try {
      await apiClient.post(
        "/admin/products",
        {
          title: form.title,
          description: form.description,
          category: form.category,
          price: Number(form.price),
          compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
          sizes: selectedSizes,
          variants: [{ color: form.color, colorHex: form.colorHex, images, stock }],
          images,
          stock,
          rewardCoins: Number(form.rewardCoins || 0),
          featured: form.featured,
          trending: form.trending,
          tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        },
        accessToken
      );
      setForm({ ...emptyForm, category: categories[0]?._id || "" });
      setSelectedSizes(["S", "M", "L", "XL"]);
      setImageUrls("");
      setMessage("Product added successfully!");
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
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Folder size={16} className="text-charcoal/50" />
              <h2 className="text-xs uppercase tracking-editorial font-bold text-charcoal/80">General Information</h2>
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

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-charcoal/50 font-medium">Stock Level</label>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 h-11 bg-white text-charcoal outline-none focus:border-charcoal hover:border-gray-300 transition-all text-sm"
                  placeholder="100"
                  value={form.stock}
                  onChange={(e) => update("stock", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
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

          {/* Section 3: Sizes & Colors */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Palette size={16} className="text-charcoal/50" />
              <h2 className="text-xs uppercase tracking-editorial font-bold text-charcoal/80">Sizes & Color Options</h2>
            </div>

            {/* Premium Multi-select Sizes Selector */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-charcoal/50 font-medium block">
                Available Sizes (Select multiple)
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

            {/* Colors Preset Swatches + Hex picker */}
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-charcoal/50 font-medium block">
                  Color Preset Swatches
                </label>
                <div className="flex flex-wrap gap-3">
                  {PRESET_COLORS.map((color) => {
                    const isSelected = form.colorHex.toLowerCase() === color.hex.toLowerCase();
                    return (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => {
                          setForm((current) => ({
                            ...current,
                            color: color.name,
                            colorHex: color.hex,
                          }));
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all font-medium ${
                          isSelected
                            ? "border-charcoal bg-gray-50 text-charcoal"
                            : "border-gray-200 bg-white text-charcoal/70 hover:border-gray-300"
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 flex-shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />
                        {color.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Color Config */}
              <div className="grid sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-charcoal/50 font-medium">Color Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 h-11 bg-white text-charcoal outline-none focus:border-charcoal hover:border-gray-300 transition-all text-sm"
                    placeholder="e.g. Sage Green"
                    value={form.color}
                    onChange={(e) => update("color", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-charcoal/50 font-medium block">Color Code (Hex)</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        className="w-full border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 h-11 bg-white text-charcoal outline-none focus:border-charcoal hover:border-gray-300 transition-all text-sm font-mono"
                        placeholder="#7d8471"
                        value={form.colorHex}
                        onChange={(e) => {
                          const hex = e.target.value;
                          setForm((current) => ({
                            ...current,
                            colorHex: hex,
                            color: hex.startsWith("#") && (hex.length === 4 || hex.length === 7) ? getClosestColorName(hex) : current.color,
                          }));
                        }}
                        required
                      />
                      <span
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-black/10 shadow-sm"
                        style={{ backgroundColor: form.colorHex }}
                      />
                    </div>
                    {/* Visual Color Picker */}
                    <div className="w-11 h-11 border border-gray-200 rounded-xl flex items-center justify-center bg-white overflow-hidden relative group hover:border-gray-300 cursor-pointer">
                      <input
                        type="color"
                        value={form.colorHex}
                        onChange={(e) => {
                          const hex = e.target.value;
                          setForm((current) => ({
                            ...current,
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
            </div>
          </div>

          {/* Section 4: Images */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Upload size={16} className="text-charcoal/50" />
              <h2 className="text-xs uppercase tracking-editorial font-bold text-charcoal/80">Product Images</h2>
            </div>
            
            <div className="space-y-3">
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-charcoal/30 transition-all bg-gray-50/50 cursor-pointer relative group">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleUpload(e.target.files)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload size={24} className="mx-auto text-charcoal/30 group-hover:text-charcoal/60 mb-2 transition-colors" />
                <p className="text-xs font-semibold text-charcoal/70">Click to Upload Files</p>
                <p className="text-[10px] text-charcoal/40 mt-1 uppercase tracking-wider">Supports high-res PNG, JPG, WebP</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-charcoal/50 font-medium">Image URLs (one per line or comma separated)</label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 min-h-20 bg-white text-charcoal outline-none focus:border-charcoal hover:border-gray-300 transition-all text-sm font-mono resize-none"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imageUrls}
                  onChange={(e) => setImageUrls(e.target.value)}
                />
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
            className="w-full bg-charcoal text-white hover:bg-black h-12 text-xs uppercase tracking-widest mt-4 rounded-xl flex items-center justify-center gap-2 font-bold shadow-md hover:shadow-lg transition-all"
            disabled={saving || uploading || categories.length === 0}
          >
            {saving ? "Saving..." : uploading ? "Uploading Images..." : (
              <>
                <Plus size={14} strokeWidth={2.5} />
                Create Product Listing
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
              <div key={product._id} className="flex items-center justify-between py-4 text-sm last:border-0 hover:bg-gray-50/50 px-2.5 -mx-2.5 transition-colors rounded-xl group">
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
                <div className="text-right flex-shrink-0 ml-4">
                  <span className="block font-semibold text-charcoal">{formatPrice(product.price)}</span>
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
