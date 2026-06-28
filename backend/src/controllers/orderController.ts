import { Response } from "express";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { Coupon } from "../models/Coupon.js";
import { Settings } from "../models/Settings.js";
import { Offer } from "../models/Offer.js";
import { calculateOffers } from "../utils/offerCalculator.js";
import { AuthRequest } from "../middleware/auth.js";
import { generateOrderNumber } from "../utils/slugify.js";
import { createRazorpayOrder, verifyPaymentSignature } from "../services/razorpayService.js";
import {
  calculateMaxRedeemable,
  creditCoins,
  redeemCoins,
} from "../services/walletService.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { User } from "../models/User.js";
import { sendOrderStatusEmail } from "../services/mailService.js";
import { generateInvoicePDF } from "../services/invoiceService.js";

async function getShippingFee(subtotal: number) {
  const settings = await Settings.findOne({ key: "global" });
  const threshold = settings?.freeShippingThreshold ?? 2999;
  const fee = settings?.defaultShippingFee ?? 99;
  return subtotal >= threshold ? 0 : fee;
}

function deductProductStock(product: any, color: string, size: string, quantity: number) {
  const variant = product.variants?.find((v: any) => v.color === color);
  if (variant) {
    if (variant.sizes && variant.sizes.length > 0) {
      const sizeObj = variant.sizes.find((s: any) => s.size === size);
      if (sizeObj) {
        sizeObj.stock = Math.max(0, sizeObj.stock - quantity);
      }
      variant.stock = variant.sizes.reduce((sum: number, s: any) => sum + s.stock, 0);
    } else {
      variant.stock = Math.max(0, variant.stock - quantity);
    }
  }
  if (product.variants && product.variants.length > 0) {
    product.stock = product.variants.reduce((sum: number, v: any) => sum + v.stock, 0);
  } else {
    product.stock = Math.max(0, product.stock - quantity);
  }
}

async function computeOrderTotals(params: {
  items: any[];
  userId?: string;
  couponCode?: string;
  coinsToRedeem?: number;
  shippingMethod?: string;
  paymentMethod?: string;
}) {
  const {
    items,
    userId,
    couponCode,
    coinsToRedeem = 0,
    shippingMethod = "standard",
    paymentMethod = "razorpay",
  } = params;

  let subtotal = 0;
  let coinsEarned = 0;
  const rawCartItemsForOffers: any[] = [];
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product || !product.isActive) {
      throw new Error(`Product unavailable: ${item.productId}`);
    }

    // Size-wise stock check
    const variant = product.variants?.find((v: any) => v.color === item.color);
    if (variant) {
      if (variant.sizes && variant.sizes.length > 0) {
        const sizeObj = variant.sizes.find((s: any) => s.size === item.size);
        if (!sizeObj || sizeObj.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.title} (Color: ${item.color}, Size: ${item.size})`
          );
        }
      } else {
        if (variant.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.title} (Color: ${item.color})`);
        }
      }
    } else {
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.title}`);
      }
    }

    subtotal += product.price * item.quantity;
    coinsEarned += product.rewardCoins * item.quantity;

    rawCartItemsForOffers.push({
      productId: product._id.toString(),
      price: product.price,
      quantity: item.quantity,
      category: product.category ? product.category.toString() : "",
      title: product.title,
      image: product.images[0] || item.image || "",
      size: item.size,
      color: item.color,
      rewardCoins: product.rewardCoins,
    });

    orderItems.push({
      product: product._id,
      title: product.title,
      image: product.images[0] || item.image || "",
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      price: product.price,
      rewardCoins: product.rewardCoins,
      freeQuantity: 0,
      offerDiscount: 0,
    });
  }

  // 1. Fetch active offers and apply
  const now = new Date();
  const activeOffers = await Offer.find({
    isActive: true,
    $and: [
      {
        $or: [
          { startDate: { $exists: false } },
          { startDate: null },
          { startDate: { $lte: now } },
        ],
      },
      {
        $or: [
          { endDate: { $exists: false } },
          { endDate: null },
          { endDate: { $gte: now } },
        ],
      },
    ],
  });

  const offerResult = calculateOffers(rawCartItemsForOffers, activeOffers);

  // Update orderItems with calculation results
  for (let i = 0; i < orderItems.length; i++) {
    const updated = offerResult.items[i];
    orderItems[i].freeQuantity = updated.freeQuantity;
    orderItems[i].offerDiscount = updated.offerDiscount;
  }

  // Remaining subtotal after offer discounts
  const subtotalAfterOffers = subtotal - offerResult.offerDiscount;

  // 2. Apply Coupon on the remaining subtotal after offers
  let discount = 0;
  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }],
    });
    if (coupon && coupon.usedCount < coupon.usageLimit && subtotalAfterOffers >= coupon.minOrder) {
      discount =
        coupon.type === "percent"
          ? Math.min((subtotalAfterOffers * coupon.value) / 100, coupon.maxDiscount ?? Infinity)
          : coupon.value;
    }
  }

  // 3. Apply Coins on remaining subtotal
  let coinsRedeemed = 0;
  let coinDiscount = 0;
  if (userId) {
    const { maxCoins } = await calculateMaxRedeemable(userId, subtotalAfterOffers - discount);
    coinsRedeemed = Math.min(coinsToRedeem, maxCoins);
    coinDiscount = coinsRedeemed;
  }

  // 4. Calculate shipping
  const settings = await Settings.findOne({ key: "global" });
  let shipping = 0;
  if (shippingMethod === "express") {
    shipping = settings?.expressShippingFee ?? 149;
  } else {
    shipping = await getShippingFee(subtotalAfterOffers - discount - coinDiscount);
  }

  let codFee = 0;
  if (paymentMethod === "cod") {
    codFee = 150;
  }

  const total = Math.max(0, subtotalAfterOffers - discount - coinDiscount + shipping + codFee);

  return {
    subtotal,
    offerDiscount: offerResult.offerDiscount,
    discount,
    coinsRedeemed,
    coinDiscount,
    shipping,
    codFee,
    total,
    coinsEarned,
    items: orderItems,
    appliedOffers: offerResult.appliedOffers,
  };
}

export const calculateOrderSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    items,
    couponCode,
    coinsToRedeem = 0,
    shippingMethod = "standard",
    paymentMethod = "razorpay",
  } = req.body;
  const userId = req.user?.userId;

  try {
    const totals = await computeOrderTotals({
      items,
      userId,
      couponCode,
      coinsToRedeem,
      shippingMethod,
      paymentMethod,
    });
    res.json({ success: true, data: totals });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || "Calculation failed" });
  }
});

export const createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    items,
    shippingAddress,
    couponCode,
    coinsToRedeem = 0,
    shippingMethod = "standard",
    paymentMethod = "razorpay",
  } = req.body;
  const userId = req.user!.userId;

  let totals;
  try {
    totals = await computeOrderTotals({
      items,
      userId,
      couponCode,
      coinsToRedeem,
      shippingMethod,
      paymentMethod,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || "Order creation calculation failed" });
    return;
  }

  const orderNumber = generateOrderNumber();
  const order = await Order.create({
    user: userId,
    orderNumber,
    items: totals.items,
    shippingAddress,
    subtotal: totals.subtotal,
    offerDiscount: totals.offerDiscount,
    discount: totals.discount,
    couponCode,
    coinsRedeemed: totals.coinsRedeemed,
    coinDiscount: totals.coinDiscount,
    shipping: totals.shipping,
    shippingMethod,
    codFee: totals.codFee,
    total: totals.total,
    coinsEarned: totals.coinsEarned,
    status: "pending",
    paymentMethod,
  });

  const paymentAmount = paymentMethod === "cod" ? Math.min(150, totals.total) : totals.total;
  const amountPaise = Math.round(paymentAmount * 100);
  let razorpayOrder = null;

  if (amountPaise > 0) {
    razorpayOrder = await createRazorpayOrder(amountPaise, orderNumber);
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();
  } else {
    // Free order (100% covered by coupon/coins/offers or standard shipping fee configured as 0)
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        deductProductStock(product, item.color, item.size, item.quantity);
        await product.save();
      }
    }

    if (order.coinsRedeemed > 0) {
      await redeemCoins(userId, order.coinsRedeemed, order._id);
    }

    if (order.couponCode) {
      await Coupon.findOneAndUpdate({ code: order.couponCode }, { $inc: { usedCount: 1 } });
    }

    order.status = paymentMethod === "cod" ? "confirmed" : "paid";
    await order.save();

    await creditCoins(
      userId,
      order.coinsEarned,
      order._id,
      `Earned from order ${order.orderNumber}`
    );

    const user = await User.findById(userId);
    if (user) {
      generateInvoicePDF(order, user.email, user.name || "Customer")
        .then((pdfBuffer) => {
          sendOrderStatusEmail(user.email, user.name || "Customer", order, pdfBuffer).catch(
            console.error
          );
        })
        .catch((err) => {
          console.error("Failed to generate free order PDF invoice:", err);
          sendOrderStatusEmail(user.email, user.name || "Customer", order).catch(console.error);
        });
    }
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
      deductProductStock(product, item.color, item.size, item.quantity);
      await product.save();
    }
  }

  if (order.coinsRedeemed > 0) {
    await redeemCoins(req.user!.userId, order.coinsRedeemed, order._id);
  }

  if (order.couponCode) {
    await Coupon.findOneAndUpdate({ code: order.couponCode }, { $inc: { usedCount: 1 } });
  }

  order.status = order.paymentMethod === "cod" ? "confirmed" : "paid";
  order.razorpayPaymentId = razorpayPaymentId;
  order.razorpaySignature = razorpaySignature;
  await order.save();

  await creditCoins(
    req.user!.userId,
    order.coinsEarned,
    order._id,
    `Earned from order ${order.orderNumber}`
  );

  const user = await User.findById(req.user!.userId);
  if (user) {
    generateInvoicePDF(order, user.email, user.name || "Customer")
      .then(pdfBuffer => {
        sendOrderStatusEmail(user.email, user.name || "Customer", order, pdfBuffer).catch(console.error);
      })
      .catch(err => {
        console.error("Failed to generate order PDF invoice:", err);
        sendOrderStatusEmail(user.email, user.name || "Customer", order).catch(console.error);
      });
  }

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
