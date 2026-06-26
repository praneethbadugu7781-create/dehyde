"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Trash2, Eye, X, MessageSquare, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeedbackRecord {
  _id: string;
  user?: { name: string; email: string };
  name: string;
  email: string;
  phone?: string;
  type: "suggestion" | "feedback" | "inquiry";
  message: string;
  createdAt: string;
}

export default function AdminSuggestionsPage() {
  const { accessToken } = useAuthStore();
  const [feedbacks, setFeedbacks] = useState<FeedbackRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedRecord, setSelectedRecord] = useState<FeedbackRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchFeedbacks = () => {
    if (!accessToken) return;
    setLoading(true);
    apiClient
      .get<{ success: boolean; data: FeedbackRecord[] }>("/admin/feedback", accessToken)
      .then((res) => setFeedbacks(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [accessToken]);

  const handleDelete = async (id: string) => {
    if (!accessToken) return;
    if (!confirm("Are you sure you want to delete this suggestions/feedback record?")) return;

    try {
      await apiClient.delete(`/admin/feedback/${id}`, accessToken);
      setFeedbacks(feedbacks.filter((f) => f._id !== id));
      if (selectedRecord?._id === id) {
        setSelectedRecord(null);
      }
    } catch (err) {
      alert("Failed to delete record.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredFeedbacks = feedbacks.filter((item) => {
    const matchesType = filterType === "all" || item.type === filterType;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(searchLower) ||
      item.email.toLowerCase().includes(searchLower) ||
      item.message.toLowerCase().includes(searchLower);
    return matchesType && matchesSearch;
  });

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl text-charcoal">Customer Suggestions & Feedback</h1>
          <p className="text-xs text-charcoal/50 mt-1">Review feedback, feature suggestions, and contact form entries.</p>
        </div>
        <div className="bg-white border border-gray-100 text-charcoal text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-sm font-medium w-fit">
          Total: {filteredFeedbacks.length}
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by customer name, email, or message..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-sm outline-none focus:border-charcoal transition-colors text-charcoal shadow-sm"
        />
        <div className="flex gap-2">
          {["all", "suggestion", "feedback", "inquiry"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2.5 text-xs uppercase tracking-widest border transition-all rounded-xl font-medium ${
                filterType === type
                  ? "border-royal bg-royal text-offwhite shadow-sm"
                  : "border-gray-200 bg-white text-charcoal/60 hover:border-royal/40"
              }`}
            >
              {type === "all" ? "All Logs" : type === "inquiry" ? "Inquiries" : `${type}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Table grid */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-charcoal/80">
            <thead className="text-[10px] uppercase tracking-editorial bg-gray-50 border-b border-gray-100 text-charcoal/40">
              <tr>
                <th className="px-6 py-5 font-normal">Date & Time</th>
                <th className="px-6 py-5 font-normal">Customer</th>
                <th className="px-6 py-5 font-normal">Type</th>
                <th className="px-6 py-5 font-normal">Message Summary</th>
                <th className="px-6 py-5 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-charcoal/40">
                    Loading records...
                  </td>
                </tr>
              ) : filteredFeedbacks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-charcoal/40">
                    No suggestions or feedback found.
                  </td>
                </tr>
              ) : (
                filteredFeedbacks.map((f) => (
                  <tr key={f._id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4 text-charcoal/60 whitespace-nowrap">
                      {formatDate(f.createdAt)}
                    </td>
                    <td className="px-6 py-4 max-w-[200px]">
                      <div className="font-medium text-charcoal truncate">{f.name}</div>
                      <div className="text-xs text-charcoal/40 truncate mt-0.5">{f.email}</div>
                      {f.phone && <div className="text-[10px] text-charcoal/30 font-mono mt-0.5">{f.phone}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md font-semibold ${
                          f.type === "suggestion"
                            ? "bg-blue-50 text-blue-600"
                            : f.type === "feedback"
                            ? "bg-green-50 text-green-600"
                            : "bg-purple-50 text-purple-600"
                        }`}
                      >
                        {f.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-[320px] truncate text-charcoal/70">
                      {f.message}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedRecord(f)}
                          className="p-2 text-charcoal/60 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(f._id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Record"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Side Panel (Drawer Drawer style) */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end transition-opacity duration-300 animate-in fade-in">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-gray-150 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="text-charcoal/70" size={20} />
                <h3 className="font-serif text-xl text-charcoal">Details View</h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-2 hover:bg-gray-150 rounded-lg text-charcoal/40 hover:text-charcoal transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Type badge and Date */}
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span
                  className={`text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-md font-bold ${
                    selectedRecord.type === "suggestion"
                      ? "bg-blue-50 text-blue-600"
                      : selectedRecord.type === "feedback"
                      ? "bg-green-50 text-green-600"
                      : "bg-purple-50 text-purple-600"
                  }`}
                >
                  {selectedRecord.type}
                </span>
                <span className="text-xs text-charcoal/40 font-mono">
                  {formatDate(selectedRecord.createdAt)}
                </span>
              </div>

              {/* User association */}
              {selectedRecord.user && (
                <div className="bg-amber-50/50 border border-amber-100/50 p-4 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
                  <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Linked Account:</span> Submitted by authenticated customer{" "}
                    <strong>{selectedRecord.user.name}</strong> ({selectedRecord.user.email}).
                  </div>
                </div>
              )}

              {/* Customer details */}
              <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-widest text-charcoal/40 font-bold border-b border-gray-100 pb-1.5">
                  Sender Details
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-charcoal/40">Full Name</p>
                    <p className="font-medium text-charcoal mt-0.5">{selectedRecord.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-charcoal/40">Email Address</p>
                    <p className="font-medium text-charcoal mt-0.5 break-all">
                      <a href={`mailto:${selectedRecord.email}`} className="hover:underline text-blue-600">
                        {selectedRecord.email}
                      </a>
                    </p>
                  </div>
                  {selectedRecord.phone && (
                    <div className="col-span-2">
                      <p className="text-xs text-charcoal/40">Phone Number</p>
                      <p className="font-medium text-charcoal mt-0.5 font-mono">
                        <a href={`tel:${selectedRecord.phone}`} className="hover:underline">
                          {selectedRecord.phone}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Message block */}
              <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-widest text-charcoal/40 font-bold border-b border-gray-100 pb-1.5">
                  Message Content
                </h4>
                <div className="bg-gray-50/30 border border-gray-100 p-5 rounded-2xl text-sm text-charcoal/80 leading-relaxed whitespace-pre-wrap">
                  {selectedRecord.message}
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="p-6 border-t border-gray-150 flex gap-3">
              <Button
                variant="outline"
                className="flex-1 text-xs uppercase tracking-widest rounded-xl py-3 border-gray-250 text-charcoal hover:bg-gray-50"
                onClick={() => setSelectedRecord(null)}
              >
                Close Panel
              </Button>
              <Button
                className="flex-1 text-xs uppercase tracking-widest rounded-xl py-3 bg-red-600 text-white hover:bg-red-700 hover:shadow-lg transition-all"
                onClick={() => handleDelete(selectedRecord._id)}
              >
                Delete Log
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
