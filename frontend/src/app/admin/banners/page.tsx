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
  image: string;
  link?: string;
  cta?: string;
  isActive: boolean;
  placement: string;
  order: number;
}

const emptyForm = {
  title: "",
  subtitle: "",
  image: "",
  link: "/shop",
  cta: "Explore Collection",
  placement: "hero",
  order: 0,
};

export default function AdminBannersPage() {
  const { accessToken } = useAuthStore();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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

  const handleUpload = async (file: File | null) => {
    if (!file || !accessToken) return;
    setUploading(true);
    setMessage("");
    try {
      const data = new FormData();
      data.append("image", file);
      const res = await apiClient.upload<{ success: boolean; data: { url: string } }>("/upload", data, accessToken);
      update("image", res.data.url);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
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
      setForm(emptyForm);
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
      image: banner.image || "",
      link: banner.link || "/shop",
      cta: banner.cta || "Explore Collection",
      placement: banner.placement || "hero",
      order: banner.order || 0,
    });
  };

  const handleDelete = async (id: string) => {
    if (!accessToken) return;
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    try {
      await apiClient.delete(`/admin/banners/${id}`, accessToken);
      if (editingId === id) {
        setForm(emptyForm);
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

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-charcoal">Homepage Banners</h1>
          <p className="text-xs text-charcoal/50 mt-1">Configure active images and text for the homepage hero carousel.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 bg-white border border-gray-100 p-6 md:p-8 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] h-fit"
        >
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <p className="text-[10px] uppercase tracking-editorial text-charcoal/40 font-bold">
              {editingId ? "Edit Banner Slide" : "Create New Banner"}
            </p>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
                className="text-[10px] uppercase tracking-editorial text-red-500 hover:underline font-bold"
              >
                Cancel Edit
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest text-charcoal/50 font-bold block">Main Title</label>
              <Input className="border-gray-200 text-charcoal placeholder:text-charcoal/40" placeholder="e.g. Defined by silence." value={form.title} onChange={(e) => update("title", e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest text-charcoal/50 font-bold block">Subtitle / Lead Text</label>
              <Input className="border-gray-200 text-charcoal placeholder:text-charcoal/40" placeholder="e.g. Premium streetwear from India" value={form.subtitle} onChange={(e) => update("subtitle", e.target.value)} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-charcoal/50 font-bold block">Button Label (CTA)</label>
                <Input className="border-gray-200 text-charcoal placeholder:text-charcoal/40" placeholder="Explore Collection" value={form.cta} onChange={(e) => update("cta", e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-charcoal/50 font-bold block">Button Link (URL)</label>
                <Input className="border-gray-200 text-charcoal placeholder:text-charcoal/40" placeholder="/shop" value={form.link} onChange={(e) => update("link", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-charcoal/50 font-bold block">Display Order Index</label>
                <Input type="number" className="border-gray-200 text-charcoal placeholder:text-charcoal/40" placeholder="0" value={form.order} onChange={(e) => update("order", Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-charcoal/50 font-bold block">Placement</label>
                <select className="w-full border border-gray-200 rounded-xl px-3 py-2 h-11 bg-white text-charcoal outline-none focus:border-charcoal hover:border-gray-300 transition-all text-sm cursor-pointer" value={form.placement} onChange={(e) => update("placement", e.target.value)}>
                  <option value="hero">Hero Section</option>
                  <option value="collection">Collection Section</option>
                  <option value="promo">Promo Banner</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-100">
              <label className="text-[9px] uppercase tracking-widest text-charcoal/50 font-bold block">Banner Slide Image</label>
              <input type="file" accept="image/*" onChange={(e) => handleUpload(e.target.files?.[0] || null)} className="w-full text-xs text-charcoal/60 file:mr-4 file:border-0 file:bg-gray-100 file:px-4 file:py-3 file:text-[10px] file:uppercase file:tracking-editorial file:text-charcoal file:rounded-xl file:cursor-pointer" />
              <Input className="border-gray-200 text-charcoal placeholder:text-charcoal/40" placeholder="Or paste image URL" value={form.image} onChange={(e) => update("image", e.target.value)} required />
            </div>
            
            {form.image && (
              <div className="relative h-32 w-full mt-4 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {message && <p className={`text-xs p-3.5 rounded-xl font-semibold border ${message.toLowerCase().includes("success") ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>{message}</p>}
          <Button type="submit" className="w-full bg-charcoal text-white hover:bg-black h-12 text-xs uppercase tracking-widest mt-4 rounded-xl flex items-center justify-center gap-2 font-bold shadow-md hover:shadow-lg transition-all" disabled={saving || uploading || !form.image}>
            {saving ? "Saving..." : uploading ? "Uploading..." : (
              <>
                {editingId ? <Edit2 size={14} /> : <Plus size={14} />}
                {editingId ? "Update Banner Slide" : "Add Banner Slide"}
              </>
            )}
          </Button>
        </motion.form>

        {/* List */}
        <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] h-fit">
          <p className="text-[10px] uppercase tracking-editorial text-charcoal/40 border-b border-gray-100 pb-4 font-bold">Configure Banners List</p>
          <div className="mt-6 space-y-4">
            {banners.map((banner) => (
              <div key={banner._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-100 p-4 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors relative overflow-hidden">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-20 h-14 bg-black flex-shrink-0 relative rounded-lg overflow-hidden border border-gray-200/50">
                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover opacity-80" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-charcoal text-sm truncate">{banner.title}</p>
                      <span className="text-[8px] uppercase tracking-wider bg-gray-100 text-charcoal/60 px-1.5 py-0.5 rounded font-mono font-bold">
                        Order: {banner.order}
                      </span>
                    </div>
                    <p className="text-[10px] text-charcoal/50 mt-1 uppercase tracking-wider font-mono truncate">{banner.placement} · {banner.cta} → {banner.link}</p>
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
            {banners.length === 0 && (
              <div className="text-center py-12 text-charcoal/30 border border-dashed border-gray-200 rounded-2xl bg-gray-50/30">
                <p className="text-sm font-medium">No banners uploaded yet</p>
                <p className="text-[10px] uppercase tracking-widest mt-2">The default fallback will be shown</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
