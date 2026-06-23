"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Eye, Package, Shield, Truck, CreditCard, ShoppingBag, MapPin, Mail, Phone, User as UserIcon, Download, ChevronDown, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OrderItem {
  product: string;
  title: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  user?: { name: string; email: string };
  total: number;
  subtotal: number;
  discount: number;
  coinDiscount?: number;
  shipping: number;
  status: string;
  paymentMethod: string;
  trackingNumber?: string;
  courierName?: string;
  items: OrderItem[];
  createdAt: string;
  shippingAddress: {
    fullName?: string;
    phone?: string;
    line1?: string;
    line2?: string;
    street?: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export default function AdminOrdersPage() {
  const { accessToken } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [courierNameInput, setCourierNameInput] = useState("");
  const [statusInput, setStatusInput] = useState("");
  const [savingChanges, setSavingChanges] = useState(false);
  const [exportingCSV, setExportingCSV] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const handleExportCSV = async () => {
    if (!accessToken) return;
    setExportingCSV(true);
    setShowExportDropdown(false);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_URL}/admin/orders/export`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      });
      if (!res.ok) throw new Error("Failed to export CSV");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to export CSV");
    } finally {
      setExportingCSV(false);
    }
  };

  const handleExportPDF = () => {
    setShowExportDropdown(false);
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to export PDF");
      return;
    }

    const orderRows = orders.map(order => `
      <tr style="border-bottom: 1px solid #f3f4f6;">
        <td style="padding: 12px 10px; font-weight: bold; font-family: monospace; color: #111827;">${order.orderNumber}</td>
        <td style="padding: 12px 10px; color: #4b5563;">${new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
        <td style="padding: 12px 10px; color: #111827;">
          <div style="font-weight: 600;">${order.shippingAddress?.fullName || order.user?.name || "Guest"}</div>
          <div style="font-size: 10px; color: #6b7280; margin-top: 2px;">${order.user?.email || "N/A"}</div>
        </td>
        <td style="padding: 12px 10px; color: #374151;">
          <div style="font-size: 11px; max-width: 250px; line-height: 1.4;">
            ${order.items.map(item => `${item.title} (${item.size}) x${item.quantity}`).join(", ")}
          </div>
        </td>
        <td style="padding: 12px 10px; text-transform: uppercase; font-size: 9px; font-weight: 700; letter-spacing: 0.5px;">
          <span style="padding: 4px 8px; border-radius: 4px; background-color: #f3f4f6; color: #374151;">
            ${order.status}
          </span>
        </td>
        <td style="padding: 12px 10px; font-weight: bold; text-align: right; color: #111827;">₹${order.total.toLocaleString('en-IN')}</td>
      </tr>
    `).join("");

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    const htmlContent = `
      <html>
        <head>
          <title>DEHYDE - Orders Report</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #111827; padding: 40px; }
            .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #111827; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-family: Georgia, serif; font-size: 28px; letter-spacing: 4px; text-transform: uppercase; margin: 0; }
            .title { font-size: 14px; text-transform: uppercase; tracking-widest; color: #666; margin: 5px 0 0 0; }
            .meta { text-align: right; font-size: 12px; color: #4b5563; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th { background-color: #f9fafb; padding: 12px 10px; font-weight: bold; text-transform: uppercase; font-size: 10px; border-bottom: 1px solid #111827; }
            .summary { margin-top: 40px; display: flex; justify-content: flex-end; }
            .summary-table { width: 250px; font-size: 14px; }
            .summary-table td { padding: 6px 0; }
            @media print {
              body { padding: 0; }
              @page { size: A4 landscape; margin: 1.5cm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="logo">D E H Y D E</h1>
              <p class="title">Orders Export Report</p>
            </div>
            <div class="meta">
              <p>Generated: ${new Date().toLocaleString('en-IN')}</p>
              <p>Total Orders: ${orders.length}</p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th style="text-align: left;">Order ID</th>
                <th style="text-align: left;">Date</th>
                <th style="text-align: left;">Customer</th>
                <th style="text-align: left; width: 30%;">Items</th>
                <th style="text-align: left;">Status</th>
                <th style="text-align: right;">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              ${orderRows}
            </tbody>
          </table>
          
          <div class="summary">
            <table class="summary-table">
              <tr>
                <td style="text-align: left; color: #4b5563;">Total Orders:</td>
                <td style="text-align: right; font-weight: bold;">${orders.length}</td>
              </tr>
              <tr style="border-top: 1px solid #111827; font-size: 16px; font-weight: bold;">
                <td style="padding-top: 10px; text-align: left;">Total Revenue:</td>
                <td style="padding-top: 10px; text-align: right;">₹${totalRevenue.toLocaleString('en-IN')}</td>
              </tr>
            </table>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const getPaymentStatus = (orderStatus: string) => {
    switch (orderStatus) {
      case "pending":
        return { text: "Pending / Unpaid", color: "text-amber-600" };
      case "cancelled":
        return { text: "Cancelled Payment", color: "text-red-500 font-semibold" };
      case "refunded":
        return { text: "Refunded", color: "text-rose-500 font-semibold" };
      case "failed":
        return { text: "Failed Payment", color: "text-red-600 font-bold" };
      default:
        return { text: "Paid", color: "text-green-600 font-semibold" };
    }
  };

  const fetchOrders = () => {
    if (!accessToken) return;
    setLoading(true);
    apiClient
      .get<{ success: boolean; data: Order[] }>("/admin/orders", accessToken)
      .then((res) => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetchOrders, [accessToken]);

  const updateStatus = async (id: string, newStatus: string, trackingNumber?: string, courierName?: string) => {
    if (!accessToken) return;
    try {
      await apiClient.patch(`/admin/orders/${id}`, { status: newStatus, trackingNumber, courierName }, accessToken);
      fetchOrders();
    } catch (error) {
      console.error(error);
      alert("Failed to update status");
    }
  };

  const handleStatusChangeInList = async (id: string, newStatus: string) => {
    let trackingNumber = undefined;
    let courierName = undefined;
    if (newStatus === "shipped") {
      const courier = prompt("Enter courier name (e.g. Delhivery, BlueDart, DTDC):");
      if (courier === null) return; // Cancelled
      const num = prompt("Enter shipping tracking ID (triggers customer email notification):");
      if (num === null) return; // Cancelled
      trackingNumber = num;
      courierName = courier;
    }
    await updateStatus(id, newStatus, trackingNumber, courierName);
  };

  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
    setStatusInput(order.status);
    setTrackingInput(order.trackingNumber || "");
    setCourierNameInput(order.courierName || "");
  };

  const handleSaveModalChanges = async () => {
    if (!selectedOrder || !accessToken) return;
    setSavingChanges(true);
    try {
      await apiClient.patch(`/admin/orders/${selectedOrder._id}`, {
        status: statusInput,
        trackingNumber: trackingInput,
        courierName: courierNameInput
      }, accessToken);
      fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update order details");
    } finally {
      setSavingChanges(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-50 text-green-700 border-green-200';
      case 'shipped': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'packed': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'confirmed': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'processing': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      case 'refunded': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-charcoal">Orders Management</h1>
          <p className="text-xs text-charcoal/50 mt-1">Track and manage customer transactions.</p>
        </div>
        <div className="flex items-center gap-3 relative">
          <div className="relative">
            <Button 
              onClick={() => setShowExportDropdown(!showExportDropdown)} 
              variant="outline" 
              className="border-gray-200 text-charcoal hover:bg-gray-50 h-10 px-4 text-[10px] uppercase tracking-widest bg-white flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              Export
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showExportDropdown ? 'rotate-180' : ''}`} />
            </Button>
            
            {showExportDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowExportDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-150 rounded-xl shadow-lg py-1.5 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={handleExportCSV}
                    disabled={exportingCSV}
                    className="w-full text-left px-4 py-2 text-xs text-charcoal hover:bg-gray-50 flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5 text-charcoal/50" />
                    <span>{exportingCSV ? "Exporting CSV..." : "Export as CSV (.csv)"}</span>
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="w-full text-left px-4 py-2 text-xs text-charcoal hover:bg-gray-50 flex items-center gap-2 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-charcoal/50" />
                    <span>Export as PDF (.pdf)</span>
                  </button>
                </div>
              </>
            )}
          </div>
          
          <Button onClick={fetchOrders} variant="outline" className="border-gray-200 text-charcoal hover:bg-gray-50 h-10 px-4 text-[10px] uppercase tracking-widest bg-white">
            Refresh List
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-charcoal/80">
            <thead className="text-[10px] uppercase tracking-editorial bg-gray-50 border-b border-gray-100 text-charcoal/40">
              <tr>
                <th className="px-6 py-5 font-normal">Order ID / Date</th>
                <th className="px-6 py-5 font-normal">Customer</th>
                <th className="px-6 py-5 font-normal">Amount</th>
                <th className="px-6 py-5 font-normal">Status</th>
                <th className="px-6 py-5 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-charcoal/40">Loading orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-charcoal/40">No orders found.</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/30 transition-colors">
                    {/* Order Number / Date */}
                    <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => handleOpenDetails(order)}>
                      <div className="font-medium text-charcoal hover:underline">{order.orderNumber}</div>
                      <div className="text-xs text-charcoal/40 mt-1">{formatDate(order.createdAt)}</div>
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4 cursor-pointer" onClick={() => handleOpenDetails(order)}>
                      <div className="text-charcoal font-medium">{order.shippingAddress?.fullName || order.user?.name || "Guest"}</div>
                      <div className="text-xs text-charcoal/40 mt-1">{order.user?.email || "N/A"}</div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 font-medium text-charcoal cursor-pointer" onClick={() => handleOpenDetails(order)}>
                      {formatPrice(order.total)}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 cursor-pointer" onClick={() => handleOpenDetails(order)}>
                      <span className={`px-2.5 py-1 text-[9px] uppercase tracking-widest rounded-md border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>

                    {/* Actions dropdown + Eye details trigger */}
                    <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChangeInList(order._id, e.target.value)}
                        className="bg-white border border-gray-200 text-charcoal text-[10px] uppercase tracking-widest rounded-md px-3 py-1.5 outline-none cursor-pointer hover:bg-gray-50 transition-colors inline-block"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid (New)</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="packed">Packed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                      </select>

                      <button
                        onClick={() => handleOpenDetails(order)}
                        className="p-2 rounded-lg border bg-white border-gray-200 text-charcoal/70 hover:text-charcoal hover:border-gray-300 hover:bg-gray-50 transition-all inline-flex items-center justify-center align-middle"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/45 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gray-50/50">
                <div>
                  <h3 className="font-serif text-xl text-charcoal flex items-center gap-2">
                    Order details {selectedOrder.orderNumber}
                  </h3>
                  <p className="text-[10px] text-charcoal/40 uppercase tracking-widest mt-1">Placed on {formatDate(selectedOrder.createdAt)}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)} 
                  className="p-1.5 rounded-full hover:bg-gray-200/60 text-charcoal/40 hover:text-charcoal transition-colors border border-transparent"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Content Grid */}
              <div className="overflow-y-auto flex-1 p-8 grid gap-8 md:grid-cols-2">
                {/* Left Column: Customer info, shipping, payment */}
                <div className="space-y-6">
                  {/* Customer Block */}
                  <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-5 space-y-3">
                    <p className="text-[9px] uppercase tracking-widest text-charcoal/40 font-bold flex items-center gap-1.5">
                      <UserIcon size={12} /> Customer Information
                    </p>
                    <div className="text-sm space-y-1.5">
                      <p className="font-semibold text-charcoal">{selectedOrder.shippingAddress?.fullName || selectedOrder.user?.name || "N/A"}</p>
                      <p className="text-charcoal/70 flex items-center gap-2"><Mail size={13} /> {selectedOrder.user?.email || "N/A"}</p>
                      {selectedOrder.shippingAddress?.phone && (
                        <p className="text-charcoal/70 flex items-center gap-2"><Phone size={13} /> {selectedOrder.shippingAddress.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-5 space-y-3">
                    <p className="text-[9px] uppercase tracking-widest text-charcoal/40 font-bold flex items-center gap-1.5">
                      <MapPin size={12} /> Shipping Address
                    </p>
                    <div className="text-sm text-charcoal/80 space-y-1 leading-relaxed">
                      <p className="font-medium">{selectedOrder.shippingAddress?.fullName}</p>
                      <p>{selectedOrder.shippingAddress?.line1 || selectedOrder.shippingAddress?.street}</p>
                      {selectedOrder.shippingAddress?.line2 && <p>{selectedOrder.shippingAddress.line2}</p>}
                      <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}</p>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-5 space-y-3">
                    <p className="text-[9px] uppercase tracking-widest text-charcoal/40 font-bold flex items-center gap-1.5">
                      <CreditCard size={12} /> Payment Method
                    </p>
                    <div className="text-sm space-y-1 text-charcoal/80">
                      <p className="font-medium uppercase tracking-wide">{selectedOrder.paymentMethod || "razorpay"}</p>
                      <p className="text-xs text-charcoal/50">
                        Status:{" "}
                        <span className={getPaymentStatus(selectedOrder.status).color}>
                          {getPaymentStatus(selectedOrder.status).text}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Status & Tracking update */}
                  <div className="border border-gray-100 rounded-2xl p-5 space-y-4">
                    <p className="text-[9px] uppercase tracking-widest text-charcoal/40 font-bold flex items-center gap-1.5">
                      <Package size={12} /> Update Status & Tracking
                    </p>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest text-charcoal/50 font-bold block">Order Status</label>
                        <select 
                          value={statusInput} 
                          onChange={(e) => setStatusInput(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white text-charcoal outline-none focus:border-charcoal hover:border-gray-300 transition-all text-sm cursor-pointer h-11"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid (New)</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="packed">Packed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest text-charcoal/50 font-bold block">Courier Name</label>
                        <Input 
                          placeholder="e.g. Delhivery, BlueDart, DTDC" 
                          value={courierNameInput}
                          onChange={(e) => setCourierNameInput(e.target.value)}
                          className="border-gray-200 text-charcoal placeholder:text-charcoal/40 h-11"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest text-charcoal/50 font-bold block">Courier Tracking ID</label>
                        <Input 
                          placeholder="e.g. SF123456789IN (triggers customer email)" 
                          value={trackingInput}
                          onChange={(e) => setTrackingInput(e.target.value)}
                          className="border-gray-200 text-charcoal placeholder:text-charcoal/40 h-11"
                        />
                        {statusInput === "shipped" && !trackingInput && (
                          <p className="text-[9px] text-amber-600 uppercase tracking-widest font-bold mt-1 animate-pulse">
                            ⚠️ Enter tracking number to notify customer by mail!
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Order items listing and price summary */}
                <div className="flex flex-col h-full space-y-6">
                  {/* Items list */}
                  <div className="border border-gray-100 rounded-2xl p-5 space-y-4 flex-1 flex flex-col overflow-hidden max-h-[350px]">
                    <p className="text-[9px] uppercase tracking-widest text-charcoal/40 font-bold flex items-center gap-1.5">
                      <ShoppingBag size={12} /> Ordered Items
                    </p>
                    <div className="overflow-y-auto divide-y divide-gray-100 flex-1 pr-2">
                      {selectedOrder.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                          {/* Thumbnail */}
                          <div className="w-14 h-16 bg-neutral-100 rounded-lg overflow-hidden relative border border-gray-200/50 flex-shrink-0">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                          {/* Details */}
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-charcoal text-sm truncate">{item.title}</p>
                            <p className="text-[10px] text-charcoal/45 uppercase tracking-wider mt-0.5">
                              Size: {item.size} · Color: {item.color}
                            </p>
                            <p className="text-xs text-charcoal/65 mt-1 font-medium">
                              {formatPrice(item.price)} × {item.quantity}
                            </p>
                          </div>
                          {/* Total for item */}
                          <div className="font-bold text-charcoal text-sm flex-shrink-0">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary calculations */}
                  <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6 space-y-3.5">
                    <p className="text-[9px] uppercase tracking-widest text-charcoal/40 font-bold">Price Calculation</p>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between text-charcoal/60">
                        <span>Subtotal:</span>
                        <span>{formatPrice(selectedOrder.subtotal || (selectedOrder.total - selectedOrder.shipping + selectedOrder.discount))}</span>
                      </div>
                      {selectedOrder.discount > 0 && (
                        <div className="flex justify-between text-rose-600 font-medium">
                          <span>Coupon Discount:</span>
                          <span>-{formatPrice(selectedOrder.discount)}</span>
                        </div>
                      )}
                      {selectedOrder.coinDiscount && selectedOrder.coinDiscount > 0 && (
                        <div className="flex justify-between text-rose-600 font-medium">
                          <span>Coins Redeemed:</span>
                          <span>-{formatPrice(selectedOrder.coinDiscount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-charcoal/60">
                        <span>Shipping Charges:</span>
                        <span>{selectedOrder.shipping === 0 ? "FREE" : formatPrice(selectedOrder.shipping)}</span>
                      </div>
                      <div className="flex justify-between text-charcoal font-bold border-t border-gray-200/80 pt-3 text-base">
                        <span>Total Paid:</span>
                        <span>{formatPrice(selectedOrder.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-gray-100 bg-gray-50/50">
                <Button 
                  onClick={() => setSelectedOrder(null)} 
                  variant="outline" 
                  className="border-gray-200 text-charcoal hover:bg-gray-100 h-11 px-6 text-[10px] uppercase tracking-widest rounded-xl bg-white"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveModalChanges} 
                  className="bg-charcoal text-white hover:bg-black h-11 px-8 text-[10px] uppercase tracking-widest rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
                  disabled={savingChanges}
                >
                  {savingChanges ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
