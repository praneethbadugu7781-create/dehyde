"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Power, Trash2, Tag, Calendar, CheckSquare, Square } from "lucide-react";
import type { Category, Product, Offer } from "@/types";

const emptyForm = {
  title: "",
  buyQuantity: "2",
  getQuantity: "1",
  targetType: "all" as "all" | "category" | "product",
  targetCategories: [] as string[],
  targetProducts: [] as string[],
  startDate: "",
  endDate: "",
  isActive: true,
};

export default function AdminOffersPage() {
  const { accessToken } = useAuthStore();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fetchOffers = () => {
    if (!accessToken) return;
    setLoading(true);
    apiClient
      .get<{ success: boolean; data: Offer[] }>("/admin/offers", accessToken)
      .then((res) => setOffers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const fetchCategoriesAndProducts = () => {
    // Public categories
    apiClient
      .get<{ success: boolean; data: Category[] }>("/products/categories")
      .then((res) => setCategories(res.data))
      .catch(console.error);

    if (!accessToken) return;
    // Admin products
    apiClient
      .get<{ success: boolean; data: Product[] }>("/admin/products?limit=100", accessToken)
      .then((res) => setProducts(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchOffers();
    fetchCategoriesAndProducts();
  }, [accessToken]);

  const handleToggleActive = async (offer: Offer) => {
    if (!accessToken) return;
    try {
      await apiClient.patch(`/admin/offers/${offer._id}`, {
        isActive: !offer.isActive,
      }, accessToken);
      fetchOffers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to toggle offer status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this offer?")) return;
    if (!accessToken) return;
    try {
      await apiClient.delete(`/admin/offers/${id}`, accessToken);
      fetchOffers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete offer");
    }
  };

  const update = (key: string, value: any) => setForm((c) => ({ ...c, [key]: value }));

  const toggleCategorySelection = (catId: string) => {
    const current = [...form.targetCategories];
    const idx = current.indexOf(catId);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(catId);
    }
    update("targetCategories", current);
  };

  const toggleProductSelection = (prodId: string) => {
    const current = [...form.targetProducts];
    const idx = current.indexOf(prodId);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(prodId);
    }
    update("targetProducts", current);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setSaving(true);
    setMessage("");

    try {
      await apiClient.post("/admin/offers", {
        title: form.title,
        buyQuantity: Number(form.buyQuantity),
        getQuantity: Number(form.getQuantity),
        targetType: form.targetType,
        targetCategories: form.targetType === "category" ? form.targetCategories : [],
        targetProducts: form.targetType === "product" ? form.targetProducts : [],
        startDate: form.startDate ? new Date(form.startDate) : undefined,
        endDate: form.endDate ? new Date(form.endDate) : undefined,
        isActive: form.isActive,
      }, accessToken);

      setForm(emptyForm);
      setMessage("Offer created successfully!");
      fetchOffers();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to create offer");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No limit";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-charcoal">Configurable Offers</h1>
          <p className="text-xs text-charcoal/50 mt-1">Manage Buy X Get Y Free promotional deals.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)]">
        {/* Creation Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 bg-white border border-gray-100 p-6 md:p-8 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] h-fit"
        >
          <p className="text-[10px] uppercase tracking-editorial text-charcoal/40 border-b border-gray-100 pb-4">
            Create New Offer
          </p>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-editorial text-charcoal/40 font-bold block">
                Offer Title
              </label>
              <Input
                className="border-gray-200 text-charcoal placeholder:text-charcoal/40"
                placeholder="e.g. Buy 2 Get 1 Free on Shirts"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-editorial text-charcoal/40 font-bold block">
                  Buy Quantity (Pay For)
                </label>
                <Input
                  className="border-gray-200 text-charcoal"
                  type="number"
                  min="1"
                  value={form.buyQuantity}
                  onChange={(e) => update("buyQuantity", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-editorial text-charcoal/40 font-bold block">
                  Get Quantity (Free)
                </label>
                <Input
                  className="border-gray-200 text-charcoal"
                  type="number"
                  min="1"
                  value={form.getQuantity}
                  onChange={(e) => update("getQuantity", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-editorial text-charcoal/40 font-bold block">
                Eligibility Target
              </label>
              <select
                className="h-10 w-full border-0 border-b border-gray-200 bg-white text-sm outline-none text-charcoal cursor-pointer"
                value={form.targetType}
                onChange={(e) => update("targetType", e.target.value)}
                required
              >
                <option value="all">All Products</option>
                <option value="category">Specific Categories</option>
                <option value="product">Specific Products</option>
              </select>
            </div>

            {/* Target Category Selection */}
            {form.targetType === "category" && (
              <div className="space-y-2 border border-gray-100 p-4 rounded-xl max-h-[160px] overflow-y-auto">
                <label className="text-[9px] uppercase tracking-editorial text-charcoal/40 font-bold block mb-2">
                  Select Categories
                </label>
                {categories.length === 0 ? (
                  <p className="text-xs text-charcoal/40">Loading categories...</p>
                ) : (
                  <div className="space-y-2">
                    {categories.map((c) => {
                      const isSelected = form.targetCategories.includes(c._id);
                      return (
                        <div
                          key={c._id}
                          className="flex items-center gap-2 cursor-pointer text-sm text-charcoal/80 hover:text-charcoal select-none"
                          onClick={() => toggleCategorySelection(c._id)}
                        >
                          {isSelected ? (
                            <CheckSquare size={16} className="text-royal fill-royal/5" />
                          ) : (
                            <Square size={16} className="text-gray-300" />
                          )}
                          <span>{c.name}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Target Product Selection */}
            {form.targetType === "product" && (
              <div className="space-y-2 border border-gray-100 p-4 rounded-xl max-h-[220px] overflow-y-auto">
                <label className="text-[9px] uppercase tracking-editorial text-charcoal/40 font-bold block mb-2">
                  Select Products
                </label>
                {products.length === 0 ? (
                  <p className="text-xs text-charcoal/40">Loading products...</p>
                ) : (
                  <div className="space-y-2">
                    {products.map((p) => {
                      const isSelected = form.targetProducts.includes(p._id);
                      return (
                        <div
                          key={p._id}
                          className="flex items-center gap-2 cursor-pointer text-sm text-charcoal/80 hover:text-charcoal select-none"
                          onClick={() => toggleProductSelection(p._id)}
                        >
                          {isSelected ? (
                            <CheckSquare size={16} className="text-royal fill-royal/5" />
                          ) : (
                            <Square size={16} className="text-gray-300" />
                          )}
                          <span className="truncate">{p.title}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-editorial text-charcoal/40 font-bold block">
                  Start Date (Optional)
                </label>
                <Input
                  className="border-gray-200 text-charcoal bg-transparent"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => update("startDate", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-editorial text-charcoal/40 font-bold block">
                  End Date (Optional)
                </label>
                <Input
                  className="border-gray-200 text-charcoal bg-transparent"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => update("endDate", e.target.value)}
                />
              </div>
            </div>

            {/* Dynamic discount live preview summary */}
            {form.title && (
              <div className="bg-royal/5 border border-royal/10 text-royal p-4 rounded-xl text-xs space-y-1.5 font-medium animate-in fade-in duration-300">
                <p className="font-semibold uppercase tracking-wider text-[9px] text-royal/60">
                  Offer Summary Preview
                </p>
                <p>
                  Customers who purchase at least{" "}
                  <span className="font-bold text-royal">
                    {Number(form.buyQuantity || 2) + Number(form.getQuantity || 1)}
                  </span>{" "}
                  eligible items will receive the cheapest{" "}
                  <span className="font-bold text-royal">{form.getQuantity || 1}</span> of them for{" "}
                  <span className="font-semibold">FREE</span>.
                </p>
                <p className="text-[10px] text-royal/60">
                  Target: {form.targetType === "all" ? "All Products" : form.targetType === "category" ? `${form.targetCategories.length} Categories` : `${form.targetProducts.length} Products`}
                </p>
              </div>
            )}
          </div>

          {message && (
            <p className="text-xs text-amber-600 p-3 bg-amber-50 rounded-md font-medium">{message}</p>
          )}
          <Button
            type="submit"
            className="w-full bg-royal text-white hover:bg-blue-800 h-12 text-xs uppercase tracking-widest mt-4 rounded-xl"
            disabled={saving}
          >
            {saving ? "Saving..." : "Create Offer"}
          </Button>
        </motion.form>

        {/* Existing Offers List */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] h-fit overflow-hidden">
          <p className="text-[10px] uppercase tracking-editorial text-charcoal/40 border-b border-gray-100 p-6 md:p-8 pb-4">
            Active Offers
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-charcoal/80">
              <thead className="text-[10px] uppercase tracking-editorial bg-gray-50 border-b border-gray-100 text-charcoal/40">
                <tr>
                  <th className="px-6 py-4 font-normal">Offer Title</th>
                  <th className="px-6 py-4 font-normal">Rules</th>
                  <th className="px-6 py-4 font-normal">Target</th>
                  <th className="px-6 py-4 font-normal">Status</th>
                  <th className="px-6 py-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-charcoal/40">
                      Loading...
                    </td>
                  </tr>
                ) : offers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-charcoal/40">
                      No offers active.
                    </td>
                  </tr>
                ) : (
                  offers.map((o) => {
                    let targetText = "All Products";
                    if (o.targetType === "category") {
                      targetText = o.targetCategories?.map((c) => c.name).join(", ") || "Categories";
                    } else if (o.targetType === "product") {
                      targetText = `${o.targetProducts?.length || 0} Products`;
                    }

                    return (
                      <tr key={o._id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-charcoal">
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">{o.title}</span>
                            {o.startDate || o.endDate ? (
                              <span className="text-[9px] text-charcoal/40 flex items-center gap-1 mt-1 font-mono">
                                <Calendar size={10} />
                                {formatDate(o.startDate)} - {formatDate(o.endDate)}
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-royal font-bold">
                          Buy {o.buyQuantity} Get {o.getQuantity} Free
                        </td>
                        <td className="px-6 py-4 text-xs text-charcoal/60 max-w-[150px] truncate" title={targetText}>
                          {targetText}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-0.5 text-[9px] uppercase tracking-widest rounded-full font-bold border ${
                              o.isActive
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-gray-50 text-gray-500 border-gray-200"
                            }`}
                          >
                            {o.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Toggle Active Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleActive(o)}
                              className={`p-2 rounded-lg border transition-all ${
                                o.isActive
                                  ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                                  : "bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200"
                              }`}
                              title={o.isActive ? "Deactivate Offer" : "Activate Offer"}
                            >
                              <Power size={13} strokeWidth={2.5} />
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDelete(o._id)}
                              className="p-2 rounded-lg border bg-red-50 border-red-100 text-red-600 hover:text-red-700 hover:border-red-200 hover:bg-red-100 transition-all"
                              title="Delete Offer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
