import { IOrder } from "../models/Order.js";
import { env } from "../config/env.js";

/**
 * Sends a native push notification to the admin's phone via ntfy.sh
 */
export async function sendAdminNewOrderNotification(order: IOrder, customerName: string) {
  const topic = process.env.ADMIN_NOTIFICATION_TOPIC || "dehyde_admin_orders_default";
  const url = `https://ntfy.sh/${topic}`;

  const title = `🚨 New Order #${order.orderNumber}`;
  const paymentText = order.paymentMethod === "cod" ? "COD (₹150 Paid)" : "Paid Online";
  
  // Format items list for the message body
  const itemsText = order.items
    .map((item) => `${item.title} (${item.size}) x${item.quantity}`)
    .join(", ");

  const body = `Customer: ${customerName}\nTotal: ₹${order.total} (${paymentText})\nItems: ${itemsText}`;
  const clickUrl = `${env.clientUrl}/admin/orders`;

  try {
    const res = await fetch(url, {
      method: "POST",
      body: body,
      headers: {
        "Title": title,
        "Priority": "high", // Sends immediately with high priority and alert sound
        "Tags": "shopping_bags,bell", // Custom visual tags / notification icons
        "Click": clickUrl, // Links directly to the admin orders page on click
      },
    });

    if (!res.ok) {
      console.error(`Failed to send ntfy notification to admin. Status: ${res.status}`);
    } else {
      console.log(`Admin order notification sent successfully to topic: ${topic}`);
    }
  } catch (err) {
    console.error("Error sending admin order push notification:", err);
  }
}
