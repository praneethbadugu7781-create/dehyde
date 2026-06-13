import { Response } from "express";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { Coupon } from "../models/Coupon.js";
import { Settings } from "../models/Settings.js";
import { AuthRequest } from "../middleware/auth.js";
import { generateOrderNumber } from "../utils/slugify.js";
import { createRazorpayOrder, verifyPaymentSignature } from "../services/razorpayService.js";
import {
  calculateMaxRedeemable,
  creditCoins,
  redeemCoins,
} from "../services/walletService.js";
import { asyncHandler } from "../middleware/errorHandler.js";

async function getShippingFee(subtotal: number) {
  const settings = await Settings.findOne({ key: "global" });
  const threshold = settings?.freeShippingThreshold ?? 2999;
  const fee = settings?.defaultShippingFee ?? 99;
  return subtotal >= threshold ? 0 : fee;
}

export const createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { items, shippingAddress, couponCode, coinsToRedeem = 0, shippingMethod = "standard" } = req.body;
  const userId = req.user!.userId;

  let subtotal = 0;
  let coinsEarned = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product || !product.isActive) {
      res.status(400).json({ success: false, message: `Product unavailable: ${item.productId}` });
      return;
    }
    if (product.stock < item.quantity) {
      res.status(400).json({ success: false, message: `Insufficient stock for ${product.title}` });
      return;
    }
    const lineTotal = product.price * item.quantity;
    subtotal += lineTotal;
    coinsEarned += product.rewardCoins * item.quantity;
    orderItems.push({
      product: product._id,
      title: product.title,
      image: product.images[0] || item.image,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      price: product.price,
      rewardCoins: product.rewardCoins,
    });
  }

  let discount = 0;
  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }],
    });
    if (coupon && coupon.usedCount < coupon.usageLimit && subtotal >= coupon.minOrder) {
      discount =
         coupon.type === "percent"
          ? Math.min((subtotal * coupon.value) / 100, coupon.maxDiscount ?? Infinity)
          : coupon.value;
    }
  }

  const { maxCoins } = await calculateMaxRedeemable(userId, subtotal - discount);
  const coinsRedeemed = Math.min(coinsToRedeem, maxCoins);
  const coinDiscount = coinsRedeemed;

  const settings = await Settings.findOne({ key: "global" });
  let shipping = 0;
  if (shippingMethod === "express") {
    shipping = settings?.expressShippingFee ?? 149;
  } else {
    shipping = await getShippingFee(subtotal - discount - coinDiscount);
  }
  const total = Math.max(0, subtotal - discount - coinDiscount + shipping);

  const orderNumber = generateOrderNumber();
  const order = await Order.create({
    user: userId,
    orderNumber,
    items: orderItems,
    shippingAddress,
    subtotal,
    discount,
    couponCode,
    coinsRedeemed,
    coinDiscount,
    shipping,
    shippingMethod,
    total,
    coinsEarned,
    status: "pending",
  });

  const amountPaise = Math.round(total * 100);
  let razorpayOrder = null;
  if (amountPaise > 0) {
    razorpayOrder = await createRazorpayOrder(amountPaise, orderNumber);
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();
  }

  res.status(201).json({
    success: true,
    data: {
      order,
      razorpayOrderId: razorpayOrder?.id,
      amount: amountPaise,
      key: process.env.RAZORPAY_KEY_ID,
    },
  });
});

export const verifyPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const valid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
  if (!valid) {
    res.status(400).json({ success: false, message: "Payment verification failed" });
    return;
  }

  const order = await Order.findOne({ _id: orderId, user: req.user!.userId });
  if (!order || order.status !== "pending") {
    res.status(400).json({ success: false, message: "Invalid order" });
    return;
  }

  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (product) {
      product.stock = Math.max(0, product.stock - item.quantity);
      await product.save();
    }
  }

  if (order.coinsRedeemed > 0) {
    await redeemCoins(req.user!.userId, order.coinsRedeemed, order._id);
  }

  if (order.couponCode) {
    await Coupon.findOneAndUpdate({ code: order.couponCode }, { $inc: { usedCount: 1 } });
  }

  order.status = "paid";
  order.razorpayPaymentId = razorpayPaymentId;
  order.razorpaySignature = razorpaySignature;
  await order.save();

  await creditCoins(
    req.user!.userId,
    order.coinsEarned,
    order._id,
    `Earned from order ${order.orderNumber}`
  );

  res.json({ success: true, data: order });
});

export const getMyOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const orders = await Order.find({ user: req.user!.userId }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: orders });
});

export const getOrderById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user!.userId });
  if (!order) {
    res.status(404).json({ success: false, message: "Order not found" });
    return;
  }
  res.json({ success: true, data: order });
});

export const cancelOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user!.userId });
  if (!order) {
    res.status(404).json({ success: false, message: "Order not found" });
    return;
  }
  if (order.status !== "pending") {
    res.status(400).json({ success: false, message: "Only pending orders can be cancelled" });
    return;
  }
  order.status = "cancelled";
  await order.save();
  res.json({ success: true, message: "Order cancelled successfully", data: order });
});
