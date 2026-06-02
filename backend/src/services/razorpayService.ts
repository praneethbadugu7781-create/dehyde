import Razorpay from "razorpay";
import crypto from "crypto";
import { env } from "../config/env.js";

let instance: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (!instance) {
    if (!env.razorpay.keyId || !env.razorpay.keySecret) {
      throw new Error("Razorpay credentials not configured");
    }
    instance = new Razorpay({
      key_id: env.razorpay.keyId,
      key_secret: env.razorpay.keySecret,
    });
  }
  return instance;
}

export async function createRazorpayOrder(amountInPaise: number, receipt: string) {
  const rzp = getRazorpay();
  return rzp.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt,
  });
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac("sha256", env.razorpay.keySecret)
    .update(body)
    .digest("hex");
  return expected === signature;
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  const expected = crypto
    .createHmac("sha256", env.razorpay.webhookSecret)
    .update(body)
    .digest("hex");
  return expected === signature;
}
