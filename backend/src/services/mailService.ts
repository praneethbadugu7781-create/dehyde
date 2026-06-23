import { IOrder } from "../models/Order.js";

export async function sendOrderStatusEmail(email: string, customerName: string, order: IOrder, pdfBuffer?: Buffer) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("Resend API Key is missing. Skipping status email.");
    return;
  }

  let subject = `Order Update - DEHYDE #${order.orderNumber}`;
  let statusText = order.status.toUpperCase();
  let description = `Your order status has been updated to ${order.status}.`;
  
  if (order.status === "confirmed") {
    subject = `Order Confirmed - DEHYDE #${order.orderNumber}`;
    description = `Your order has been confirmed and is now being processed. We are preparing it for packaging.`;
  } else if (order.status === "packed") {
    subject = `Order Packed & Ready - DEHYDE #${order.orderNumber}`;
    description = `Great news! Your order has been packed and is ready to be handed over to our shipping partner.`;
  } else if (order.status === "shipped") {
    subject = `Order Shipped - DEHYDE #${order.orderNumber}`;
    const courierText = order.courierName ? ` via <strong>${order.courierName}</strong>` : "";
    const trackingText = order.trackingNumber ? ` (Tracking Number: <strong>${order.trackingNumber}</strong>)` : "";
    description = `Your order has been shipped${courierText}${trackingText}! It is on its way to your delivery address.`;
  } else if (order.status === "delivered") {
    subject = `Order Delivered - DEHYDE #${order.orderNumber}`;
    description = `Your order has been successfully delivered. Thank you for shopping with DEHYDE!`;
  } else if (order.status === "cancelled") {
    subject = `Order Cancelled - DEHYDE #${order.orderNumber}`;
    description = `Your order has been cancelled. If this was a mistake, please contact our support.`;
  } else if (order.status === "refunded") {
    subject = `Order Refunded - DEHYDE #${order.orderNumber}`;
    description = `Your order has been refunded. The amount will be credited back to your original payment method.`;
  }

  // Format order items HTML table
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="${item.image}" alt="${item.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />
          <div>
            <p style="margin: 0; font-weight: bold; font-size: 14px; color: #1a1a1a;">${item.title}</p>
            <p style="margin: 2px 0 0 0; font-size: 11px; color: #666;">Size: ${item.size} | Color: ${item.color}</p>
          </div>
        </div>
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: center; font-size: 14px; color: #333;">x${item.quantity}</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right; font-size: 14px; font-weight: bold; color: #1a1a1a;">₹${item.price}</td>
    </tr>
  `).join("");

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #eee; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 1px solid #f0f0f0; padding-bottom: 20px;">
        <h2 style="font-family: Georgia, serif; letter-spacing: 3px; margin: 0; color: #1a1a1a; text-transform: uppercase;">D E H Y D E</h2>
        <p style="margin: 5px 0 0 0; font-size: 10px; text-transform: uppercase; tracking-widest; color: #777;">Premium Menswear</p>
      </div>
      
      <p style="font-size: 15px; color: #1a1a1a; font-weight: bold; margin-bottom: 10px;">Hello ${customerName},</p>
      <p style="font-size: 14px; color: #333; line-height: 1.6; margin-top: 0;">${description}</p>
      
      <div style="margin: 25px 0; background-color: #f9f9f9; border: 1px solid #eaeaea; border-radius: 8px; padding: 15px;">
        <table style="width: 100%; font-size: 13px; color: #555; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; font-weight: bold; color: #1a1a1a; width: 120px;">Order Number:</td>
            <td style="padding: 4px 0;">#${order.orderNumber}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: bold; color: #1a1a1a;">Status:</td>
            <td style="padding: 4px 0;"><span style="background-color: #eaeaea; color: #1a1a1a; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase;">${statusText}</span></td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: bold; color: #1a1a1a;">Payment:</td>
            <td style="padding: 4px 0; text-transform: capitalize;">${order.paymentMethod}</td>
          </tr>
          ${order.courierName ? `
          <tr>
            <td style="padding: 4px 0; font-weight: bold; color: #1a1a1a;">Courier Partner:</td>
            <td style="padding: 4px 0; font-weight: bold; color: #1a1a1a;">${order.courierName}</td>
          </tr>
          ` : ""}
          ${order.trackingNumber ? `
          <tr>
            <td style="padding: 4px 0; font-weight: bold; color: #1a1a1a;">Tracking ID:</td>
            <td style="padding: 4px 0; font-family: monospace; font-weight: bold; color: #000;">${order.trackingNumber}</td>
          </tr>
          ` : ""}
        </table>
      </div>

      <h3 style="font-size: 14px; color: #1a1a1a; border-bottom: 2px solid #1a1a1a; padding-bottom: 8px; margin-top: 30px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">Order Items</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="text-align: left; padding-bottom: 8px; border-bottom: 1px solid #ddd; font-size: 12px; text-transform: uppercase; color: #777;">Item</th>
            <th style="text-align: center; padding-bottom: 8px; border-bottom: 1px solid #ddd; font-size: 12px; text-transform: uppercase; color: #777; width: 60px;">Qty</th>
            <th style="text-align: right; padding-bottom: 8px; border-bottom: 1px solid #ddd; font-size: 12px; text-transform: uppercase; color: #777; width: 80px;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="margin-top: 20px; text-align: right;">
        <table style="display: inline-block; width: 220px; font-size: 14px; color: #333;">
          <tr>
            <td style="padding: 4px 0; text-align: left;">Subtotal:</td>
            <td style="padding: 4px 0; text-align: right;">₹${order.subtotal}</td>
          </tr>
          ${order.discount > 0 ? `
          <tr>
            <td style="padding: 4px 0; text-align: left; color: #e11d48;">Discount:</td>
            <td style="padding: 4px 0; text-align: right; color: #e11d48;">-₹${order.discount}</td>
          </tr>
          ` : ""}
          ${order.coinDiscount > 0 ? `
          <tr>
            <td style="padding: 4px 0; text-align: left; color: #e11d48;">Coins Discount:</td>
            <td style="padding: 4px 0; text-align: right; color: #e11d48;">-₹${order.coinDiscount}</td>
          </tr>
          ` : ""}
          <tr>
            <td style="padding: 4px 0; text-align: left;">Shipping:</td>
            <td style="padding: 4px 0; text-align: right;">₹${order.shipping}</td>
          </tr>
          <tr style="border-top: 1px solid #ddd; font-weight: bold; font-size: 16px;">
            <td style="padding: 8px 0; text-align: left; color: #1a1a1a;">Total Paid:</td>
            <td style="padding: 8px 0; text-align: right; color: #1a1a1a;">₹${order.total}</td>
          </tr>
        </table>
      </div>

      <div style="border-top: 1px solid #eee; margin-top: 35px; padding-top: 20px; text-align: center;">
        <p style="font-size: 12px; color: #777; margin: 0;">If you have any questions, feel free to reply to this email or contact us at <a href="mailto:dehyde333@gmail.com" style="color: #000; text-decoration: underline;">dehyde333@gmail.com</a></p>
        <p style="font-size: 10px; color: #aaa; margin-top: 8px;">© ${new Date().getFullYear()} DEHYDE. All rights reserved.</p>
      </div>
    </div>
  `;

  const sender: string = "DEHYDE <orders@dehyde.in>";

  const attachments = pdfBuffer ? [
    {
      content: pdfBuffer.toString("base64"),
      filename: `invoice-${order.orderNumber}.pdf`,
    }
  ] : undefined;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: sender,
        to: email.toLowerCase(),
        subject: subject,
        html: html,
        attachments,
      }),
    });

    const data: any = await res.json();
    if (!res.ok) {
      console.error("Resend API status email error details:", data);
      if (sender !== "DEHYDE <onboarding@resend.dev>") {
        console.log("Retrying status email with onboarding@resend.dev sandbox sender...");
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            from: "DEHYDE <onboarding@resend.dev>",
            to: email.toLowerCase(),
            subject: subject,
            html: html,
            attachments,
          }),
        });
      }
    }
  } catch (err) {
    console.error("Failed to send status email via Resend:", err);
  }
}
