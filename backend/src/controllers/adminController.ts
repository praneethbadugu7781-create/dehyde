import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { Coupon } from "../models/Coupon.js";
import { Banner } from "../models/Banner.js";
import { Settings } from "../models/Settings.js";
import { Wallet } from "../models/Wallet.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { AuthRequest } from "../middleware/auth.js";
import bcrypt from "bcryptjs";
import { sendOrderStatusEmail } from "../services/mailService.js";


export const getDashboard = asyncHandler(async (_req, res) => {
  const [totalOrders, totalRevenue, totalProducts, totalCustomers, recentOrders] =
    await Promise.all([
      Order.countDocuments({ status: { $ne: "cancelled" } }),
      Order.aggregate([
        { $match: { status: { $in: ["paid", "processing", "shipped", "delivered"] } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Product.countDocuments({ isActive: true }),
      User.countDocuments({ role: "user" }),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("user", "name email")
        .lean(),
    ]);

  const lowStock = await Product.find({
    isActive: true,
    stock: { $lte: 5 },
  })
    .select("title stock")
    .limit(10)
    .lean();

  res.json({
    success: true,
    data: {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalProducts,
      totalCustomers,
      recentOrders,
      lowStock,
    },
  });
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Order.countDocuments(filter),
  ]);
  res.json({ success: true, data: orders, pagination: { total, page: Number(page) } });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingNumber, courierName } = req.body;
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) {
    res.status(404).json({ success: false, message: "Order not found" });
    return;
  }

  order.status = status;
  if (trackingNumber !== undefined) {
    order.trackingNumber = trackingNumber;
  }
  if (courierName !== undefined) {
    order.courierName = courierName;
  }
  await order.save();

  // Send email update to customer asynchronously
  const user = order.user as any;
  if (user && user.email) {
    sendOrderStatusEmail(user.email, user.name || "Customer", order).catch(console.error);
  }

  res.json({ success: true, data: order });
});

export const manageCoupons = asyncHandler(async (req, res) => {
  if (req.method === "GET" || !req.body.code) {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
    return;
  }
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, data: coupon });
});

export const manageBanners = asyncHandler(async (_req, res) => {
  const banners = await Banner.find().sort("order");
  res.json({ success: true, data: banners });
});

export const createBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.create(req.body);
  res.status(201).json({ success: true, data: banner });
});

export const getSettings = asyncHandler(async (_req, res) => {
  let settings = await Settings.findOne({ key: "global" });
  if (!settings) {
    settings = await Settings.create({ key: "global" });
  }
  res.json({ success: true, data: settings });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.findOneAndUpdate({ key: "global" }, req.body, {
    upsert: true,
    new: true,
  });
  res.json({ success: true, data: settings });
});

export const getCustomers = asyncHandler(async (_req, res) => {
  const users = await User.find({ role: "user" }).select("name email createdAt").lean();
  res.json({ success: true, data: users });
});

export const adjustWallet = asyncHandler(async (req, res) => {
  const { userId, amount, description } = req.body;
  const wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    res.status(404).json({ success: false, message: "Wallet not found" });
    return;
  }
  wallet.balance += amount;
  wallet.history.push({
    type: "adjust",
    amount: Math.abs(amount),
    description: description || "Admin adjustment",
    createdAt: new Date(),
  });
  await wallet.save();
  res.json({ success: true, data: wallet });
});

export const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!banner) {
    res.status(404).json({ success: false, message: "Banner not found" });
    return;
  }
  res.json({ success: true, data: banner });
});

export const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndDelete(req.params.id);
  if (!banner) {
    res.status(404).json({ success: false, message: "Banner not found" });
    return;
  }
  res.json({ success: true, message: "Banner deleted" });
});

export const changePassword = asyncHandler(async (req: AuthRequest, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400).json({ success: false, message: "Current and new passwords are required" });
    return;
  }
  const user = await User.findById(req.user!.userId).select("+password");
  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }
  if (!user.password || !(await bcrypt.compare(currentPassword, user.password))) {
    res.status(401).json({ success: false, message: "Invalid current password" });
    return;
  }
  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();
  res.json({ success: true, message: "Password updated successfully" });
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!coupon) {
    res.status(404).json({ success: false, message: "Coupon not found" });
    return;
  }
  res.json({ success: true, data: coupon });
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) {
    res.status(404).json({ success: false, message: "Coupon not found" });
    return;
  }
  res.json({ success: true, message: "Coupon deleted" });
});

export const exportOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .lean();

  let csvContent = "\ufeffOrder Number,Date,Customer Name,Customer Email,Items,Subtotal,Discount,Coin Discount,Shipping,Total,Status,Payment Method,Tracking Number,Shipping Address\n";

  for (const order of orders) {
    const user: any = order.user;
    const orderDate = (order as any).createdAt ? new Date((order as any).createdAt).toLocaleDateString("en-IN") : "";
    const customerName = user ? `"${user.name.replace(/"/g, '""')}"` : "Guest";
    const customerEmail = user ? user.email : "";
    
    const itemsSummary = order.items.map(item => `${item.title} (${item.size}, ${item.color}) x${item.quantity}`).join("; ");
    const escapedItems = `"${itemsSummary.replace(/"/g, '""')}"`;
    
    const addr = order.shippingAddress || {};
    const addressStr = `${addr.fullName || ""}, ${addr.line1 || ""}, ${addr.line2 || ""}, ${addr.city || ""}, ${addr.state || ""} - ${addr.pincode || ""}`;
    const escapedAddress = `"${addressStr.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;

    csvContent += `${order.orderNumber},${orderDate},${customerName},${customerEmail},${escapedItems},${order.subtotal},${order.discount},${order.coinDiscount},${order.shipping},${order.total},${order.status},${order.paymentMethod},${order.trackingNumber || ""},${escapedAddress}\n`;
  }

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename=orders-export-${Date.now()}.csv`);
  res.status(200).send(csvContent);
});

