"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Edit2, Trash2, Power, Plus, ArrowLeft } from "lucide-react";

interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  price?: string;
  layout?: string;
  image?: string;
  mobileImage?: string;
  link?: string;
  cta?: string;
  isActive: boolean;
  placement: string;
  order: number;
}

const emptyForm = {
  title: "",
  subtitle: "",
  price: "",
  layout: "bottom-left",
  image: "",
  mobileImage: "",
  link: "/shop",
  cta: "Explore Collection",
  placement: "hero",
  order: 0,
};

export default function AdminBannersPage() {
  const { accessToken } = useAuthStore();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [form, setForm] = useState({ ...emptyForm, placement: "hero" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"hero" | "promo">("hero");

  const refresh = () => {
    if (!accessToken) return;
    apiClient
      .get<{ success: boolean; data: Banner[] }>("/admin/banners", accessToken)
      .then((res) => setBanners(res.data))
      .catch(console.error);
  };

  useEffect(refresh, [accessToken]);

  const update = (key: string, value: any) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleTabChange = (tab: "hero" | "promo") => {
    setActiveTab(tab);
    setForm((current) => ({
      ...emptyForm,
      placement: tab,
      cta: tab === "promo" ? "" : "Explore Collection",
    }));
    setEditingId(null);
    setMessage("");
  };

  const handleUpload = async (file: File | null, field: "image" | "mobileImage") => {
    if (!file || !accessToken) return;
    if (field === "image") {
      setUploading(true);
    } else {
      setUploadingMobile(true);
    }
    setMessage("");
    try {
      const data = new FormData();
      data.append("image", file);
      const res = await apiClient.upload<{ success: boolean; data: { url: string } }>("/upload", data, accessToken);
      update(field, res.data.url);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      if (field === "image") {
        setUploading(false);
      } else {
        setUploadingMobile(false);
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accessToken) return;
    setSaving(true);
    setMessage("");

    try {
      if (editingId) {
        await apiClient.patch(`/admin/banners/${editingId}`, form, accessToken);
        setMessage("Banner updated successfully.");
      } else {
        await apiClient.post("/admin/banners", form, accessToken);
        setMessage("Banner added successfully.");
      }
      setForm({
        ...emptyForm,
        placement: activeTab,
        cta: activeTab === "promo" ? "" : "Explore Collection",
      });
      setEditingId(null);
      refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to save banner");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingId(banner._id);
    setForm({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      price: banner.price || "",
      layout: banner.layout || "bottom-left",
      image: banner.image || "",
      mobileImage: banner.mobileImage || "",
      link: banner.link || "/shop",
      cta: banner.cta || "",
      placement: banner.placement || "hero",
      order: banner.order || 0,
    });
    if (banner.placement === "hero" || banner.placement === "promo") {
      setActiveTab(banner.placement);
    }
  };

  const handleDelete = async (id: string) => {
    if (!accessToken) return;
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    try {
      await apiClient.delete(`/admin/banners/${id}`, accessToken);
      if (editingId === id) {
        setForm({ ...emptyForm, placement: activeTab });
        setEditingId(null);
      }
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    if (!accessToken) return;
    try {
      await apiClient.patch(`/admin/banners/${banner._id}`, { isActive: !banner.isActive }, accessToken);
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBanners = banners.filter((b) => b.placement === activeTab);

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-charcoal">
            {activeTab === "hero"
              ? "Hero Slideshow Banners"
              : "Promo & Announcement Banners"}
          </h1>
          <p className="text-xs text-charcoal/50 mt-1">
            {activeTab === "hero"
              ? "Configure active images, styles, and text overlays for the homepage full-screen hero slideshow."
              : "Configure homepage announcement bars, promotional strips, or announcement overlays."}
          </p>
        </div>
      </div>

      {/* Tabs Navigator */}
      <div className="flex border-b border-gray-100 mb-8 gap-4">
        {(["hero", "promo"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleTabChange(tab)}
            className={`pb-3 text-[10px] uppercase tracking-widest px-1.5 font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === tab
                ? "border-charcoal text-charcoal"
                : "border-transparent text-charcoal/30 hover:text-charcoal/60"
            }`}
          >
            {tab === "hero" ? "Hero Slides" : "Promo Strips"}
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {/* Form Container */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 bg-white border border-gray-100 p-6 md:p-8 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] h-fit"
        >
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <p className="text-[10px] uppercase tracking-editorial text-charcoal/40 font-bold">
              {editingId ? "Edit Banner Slide" : `Add ${activeTab === "hero" ? "Hero Slide" : "Promo Strip"}`}
            </p>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ ...emptyForm, placement: activeTab });
                }}
                className="text-[10px] uppercase tracking-editorial text-red-500 hover:underline font-bold"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Title / Primary Text */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest text-charcoal/50 font-bold block">
                {activeTab === "hero" ? "Main Title" : "Promo Message"}
              </label>
              <Input
                className="border-gray-200 text-charcoal placeholder:text-charcoal/40"
                placeholder={activeTab === "hero" ? "e.g. Defined by silence." : "e.g. Black Friday Sale: 50% Off"}
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                required
              />
            </div>

            {/* Subtitle / Description (Hidden for Promo) */}
            {activeTab !== "promo" && (
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-charcoal/50 font-bold block">
                  Subtitle / Lead Text
                </label>
                <Input
                  className="border-gray-200 text-charcoal placeholder:text-charcoal/40"
                  placeholder="e.g. Premium streetwear from India"
                  value={form.subtitle}
                  onChange={(e) => update("subtitle", e.target.value)}
                />
              </div>
            )}

            {/* Price Tag (Only for Hero Section) */}
            {activeTab === "hero" && (
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-charcoal/50 font-bold block">Price Label (e.g. ₹ 599 / ONWARDS)</label>
                <Input
                  className="border-gray-200 text-charcoal placeholder:text-charcoal/40"
                  placeholder="e.g. ₹ 599 / ONWARDS"
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                />
              </div>
            )}

            {/* CTA and URL configuration */}
            {activeTab !== "promo" ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-charcoal/50 font-bold block">Button Label (CTA)</label>
                  <Input
                    className="border-gray-200 text-charcoal placeholder:text-charcoal/40"
                    placeholder="Explore Collection"
                    value={form.cta}
                    onChange={(e) => update("cta", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-charcoal/50 font-bold block">Button Link (URL)</label>
                  <Input
                    className="border-gray-200 text-charcoal placeholder:text-charcoal/40"
                    placeholder="/shop"
                    value={form.link}
                    onChange={(e) => update("link", e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-charcoal/50 font-bold block">Promo Link (URL)</label>
                <Input
                  className="border-gray-200 text-charcoal placeholder:text-charcoal/40"
                  placeholder="/shop"
                  value={form.link}
                  onChange={(e) => update("link", e.target.value)}
                />
              </div>
            )}

            {/* Sorting Order & Optional Layout Picker */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-charcoal/50 font-bold block">Order Index</label>
                <Input
                  type="number"
                  className="border-gray-200 text-charcoal placeholder:text-charcoal/40"
                  placeholder="0"
                  value={form.order}
                  onChange={(e) => update("order", Number(e.target.value))}
                />
              </div>
              {activeTab === "hero" ? (
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-charcoal/50 font-bold block">Layout Style</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 h-11 bg-white text-charcoal outline-none focus:border-charcoal hover:border-gray-300 transition-all text-sm cursor-pointer"
                    value={form.layout}
                    onChange={(e) => update("layout", e.target.value)}
                  >
                    <option value="bottom-left">Left Aligned (Default)</option>
                    <option value="campaign">Centered Campaign</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-charcoal/50 font-bold block">Type</label>
                  <Input
                    className="border-gray-200 text-charcoal/50 bg-gray-50 uppercase text-[10px] tracking-wider"
                    value="Promo Strip"
                    disabled
                  />
                </div>
              )}
            </div>

            {/* Image Upload Block */}
            {activeTab !== "promo" && (
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <label className="text-[9px] uppercase tracking-widest text-charcoal/50 font-bold block">
                  Hero Image (Desktop/Landscape)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUpload(e.target.files?.[0] || null, "image")}
                  className="w-full text-xs text-charcoal/60 file:mr-4 file:border-0 file:bg-gray-100 file:px-4 file:py-3 file:text-[10px] file:uppercase file:tracking-editorial file:text-charcoal file:rounded-xl file:cursor-pointer"
                />
                <Input
                  className="border-gray-200 text-charcoal placeholder:text-charcoal/40"
                  placeholder="Or paste image URL"
                  value={form.image}
                  onChange={(e) => update("image", e.target.value)}
                  required
                />
              </div>
            )}

            {activeTab !== "promo" && form.image && (
              <div className="relative h-32 w-full mt-4 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                <img src={form.image} alt="Desktop Preview" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Mobile Image Upload Block */}
            {activeTab !== "promo" && (
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <label className="text-[9px] uppercase tracking-widest text-charcoal/50 font-bold block">
                  Mobile Hero Image (Mobile/Portrait)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUpload(e.target.files?.[0] || null, "mobileImage")}
                  className="w-full text-xs text-charcoal/60 file:mr-4 file:border-0 file:bg-gray-100 file:px-4 file:py-3 file:text-[10px] file:uppercase file:tracking-editorial file:text-charcoal file:rounded-xl file:cursor-pointer"
                />
                <Input
                  className="border-gray-200 text-charcoal placeholder:text-charcoal/40"
                  placeholder="Or paste mobile image URL"
                  value={form.mobileImage}
                  onChange={(e) => update("mobileImage", e.target.value)}
                />
              </div>
            )}

            {activeTab !== "promo" && form.mobileImage && (
              <div className="relative h-32 w-24 mt-4 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                <img src={form.mobileImage} alt="Mobile Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {message && (
            <p
              className={`text-xs p-3.5 rounded-xl font-semibold border ${
                message.toLowerCase().includes("success")
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {message}
            </p>
          )}

          <Button
            type="submit"
            className="w-full bg-royal text-white hover:bg-blue-800 h-12 text-xs uppercase tracking-widest mt-4 rounded-xl flex items-center justify-center gap-2 font-bold shadow-md hover:shadow-lg transition-all"
            disabled={saving || uploading || uploadingMobile || (activeTab !== "promo" && !form.image)}
          >
            {saving ? "Saving..." : (uploading || uploadingMobile) ? "Uploading..." : (
              <>
                {editingId ? <Edit2 size={14} /> : <Plus size={14} />}
                {editingId ? "Update Banner" : "Add Banner"}
              </>
            )}
          </Button>
        </motion.form>

        {/* List Container */}
        <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] h-fit">
          <p className="text-[10px] uppercase tracking-editorial text-charcoal/40 border-b border-gray-100 pb-4 font-bold">
            Active {activeTab === "hero" ? "Hero Slides" : "Promo Banners"} List
          </p>

          <div className="mt-6 space-y-4">
            {filteredBanners.map((banner) => (
              <div
                key={banner._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-100 p-4 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors relative overflow-hidden"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {banner.placement !== "promo" && banner.image && (
                    <div className="flex gap-1.5 flex-shrink-0">
                      <div className="w-20 h-14 bg-black relative rounded-lg overflow-hidden border border-gray-200/50" title="Desktop Image">
                        <img src={banner.image} alt={banner.title} className="w-full h-full object-cover opacity-80" />
                      </div>
                      {banner.mobileImage && (
                        <div className="w-10 h-14 bg-black relative rounded-lg overflow-hidden border border-gray-200/50" title="Mobile Image">
                          <img src={banner.mobileImage} alt={`${banner.title} Mobile`} className="w-full h-full object-cover opacity-80" />
                        </div>
                      )}
                    </div>
                  )}
                  {banner.placement === "promo" && (
                    <div className="w-20 h-14 bg-royal/10 text-royal flex-shrink-0 relative rounded-lg overflow-hidden border border-royal/20 flex items-center justify-center font-bold text-[10px] tracking-wider uppercase font-mono">
                      Promo
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-charcoal text-sm truncate">{banner.title}</p>
                      <span className="text-[8px] uppercase tracking-wider bg-gray-100 text-charcoal/60 px-1.5 py-0.5 rounded font-mono font-bold">
                        Order: {banner.order}
                      </span>
                    </div>
                    <p className="text-[10px] text-charcoal/50 mt-1 uppercase tracking-wider font-mono truncate">
                      {banner.placement}
                      {banner.placement === "hero" && ` (${banner.layout || "bottom-left"})`}
                      {banner.cta && ` · ${banner.cta}`}
                      {banner.link && ` → ${banner.link}`}
                      {banner.price && ` · Price: ${banner.price}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 flex-shrink-0">
                  {/* Toggle Active Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(banner)}
                    className={`p-2 rounded-lg border transition-all ${
                      banner.isActive
                        ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                        : "bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-250"
                    }`}
                    title={banner.isActive ? "Deactivate" : "Activate"}
                  >
                    <Power size={14} strokeWidth={2.5} />
                  </button>

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => handleEdit(banner)}
                    className="p-2 rounded-lg border bg-white border-gray-200 text-charcoal/70 hover:text-charcoal hover:border-gray-300 hover:bg-gray-50 transition-all"
                    title="Edit Banner"
                  >
                    <Edit2 size={14} />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(banner._id)}
                    className="p-2 rounded-lg border bg-red-50 border-red-100 text-red-600 hover:text-red-700 hover:border-red-200 hover:bg-red-100 transition-all"
                    title="Delete Banner"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            {filteredBanners.length === 0 && (
              <div className="text-center py-12 text-charcoal/30 border border-dashed border-gray-200 rounded-2xl bg-gray-50/30 animate-pulse">
                <p className="text-sm font-medium">No banners in this section</p>
                <p className="text-[10px] uppercase tracking-widest mt-2">The default fallbacks will be displayed</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
