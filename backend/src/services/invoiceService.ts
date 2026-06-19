import PDFDocument from "pdfkit";
import { IOrder } from "../models/Order.js";

export function generateInvoicePDF(order: IOrder, userEmail: string, userName: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const buffers: Buffer[] = [];
      doc.on("data", chunk => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", err => reject(err));

      // 1. Header (DEHYDE Logo on left, INVOICE info on right)
      doc.fillColor("#111827");
      
      // Brand Name
      doc.font("Helvetica-Bold").fontSize(28).text("DEHYDE", 50, 50);
      doc.font("Helvetica").fontSize(9).fillColor("#6b7280").text("PREMIUM MENSWEAR", 50, 80);
      
      // Invoice Meta Info (Right side)
      doc.fillColor("#111827");
      doc.font("Helvetica-Bold").fontSize(20).text("INVOICE", 400, 50, { align: "right" });
      doc.font("Helvetica").fontSize(9).fillColor("#374151")
        .text(`Invoice No: #${order.orderNumber}`, 400, 75, { align: "right" })
        .text(`Date: ${(order as any).createdAt ? new Date((order as any).createdAt).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN")}`, 400, 90, { align: "right" })
        .text(`Payment: ${order.paymentMethod.toUpperCase()}`, 400, 105, { align: "right" });

      // Horizontal Line
      doc.strokeColor("#e5e7eb").lineWidth(1).moveTo(50, 130).lineTo(545, 130).stroke();

      // 2. Bill To & Shipping Details
      doc.fillColor("#111827");
      doc.font("Helvetica-Bold").fontSize(10).text("BILL TO:", 50, 150);
      doc.font("Helvetica").fontSize(9).fillColor("#374151")
        .text(userName, 50, 165)
        .text(userEmail, 50, 180);
      
      const addr = order.shippingAddress || {};
      const addressLines = [
        addr.fullName || userName,
        addr.line1 || "",
        addr.line2 || "",
        `${addr.city || ""}, ${addr.state || ""} - ${addr.pincode || ""}`,
        `Phone: ${addr.phone || ""}`
      ].filter(line => line.trim() !== "");

      doc.font("Helvetica-Bold").fontSize(10).fillColor("#111827").text("SHIP TO:", 300, 150);
      doc.font("Helvetica").fontSize(9).fillColor("#374151");
      let addressY = 165;
      addressLines.forEach(line => {
        doc.text(line, 300, addressY);
        addressY += 15;
      });

      // Horizontal Line
      const itemsStartY = Math.max(addressY + 20, 240);
      doc.strokeColor("#e5e7eb").lineWidth(1).moveTo(50, itemsStartY).lineTo(545, itemsStartY).stroke();

      // 3. Items Table Header
      const tableHeaderY = itemsStartY + 15;
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#111827");
      doc.text("Item Details", 50, tableHeaderY);
      doc.text("Size/Color", 230, tableHeaderY);
      doc.text("Price", 370, tableHeaderY, { width: 50, align: "right" });
      doc.text("Qty", 440, tableHeaderY, { width: 30, align: "center" });
      doc.text("Total", 495, tableHeaderY, { width: 50, align: "right" });

      doc.strokeColor("#111827").lineWidth(1).moveTo(50, tableHeaderY + 15).lineTo(545, tableHeaderY + 15).stroke();

      // 4. Items Table Rows
      let currentY = tableHeaderY + 25;
      doc.font("Helvetica").fontSize(9).fillColor("#374151");

      for (const item of order.items) {
        // Page break check
        if (currentY > 700) {
          doc.addPage();
          currentY = 50;
          doc.strokeColor("#e5e7eb").lineWidth(1).moveTo(50, currentY).lineTo(545, currentY).stroke();
          currentY += 15;
        }

        doc.font("Helvetica-Bold").fillColor("#111827").text(item.title, 50, currentY, { width: 170 });
        doc.font("Helvetica").fillColor("#4b5563").text(`${item.size} / ${item.color}`, 230, currentY, { width: 130 });
        doc.text(`₹${item.price.toLocaleString('en-IN')}`, 370, currentY, { width: 50, align: "right" });
        doc.text(String(item.quantity), 440, currentY, { width: 30, align: "center" });
        
        const lineTotal = item.price * item.quantity;
        doc.font("Helvetica-Bold").fillColor("#111827").text(`₹${lineTotal.toLocaleString('en-IN')}`, 495, currentY, { width: 50, align: "right" });

        currentY += 25;
      }

      doc.strokeColor("#e5e7eb").lineWidth(1).moveTo(50, currentY).lineTo(545, currentY).stroke();
      currentY += 15;

      // 5. Summary block (Right side aligned)
      const summaryX = 350;
      doc.font("Helvetica").fontSize(9).fillColor("#4b5563");
      
      doc.text("Subtotal:", summaryX, currentY);
      doc.font("Helvetica-Bold").fillColor("#111827").text(`₹${order.subtotal.toLocaleString('en-IN')}`, 495, currentY, { align: "right" });
      currentY += 18;

      if (order.discount > 0) {
        doc.font("Helvetica").fillColor("#e11d48").text("Promo Discount:", summaryX, currentY);
        doc.font("Helvetica-Bold").fillColor("#e11d48").text(`-₹${order.discount.toLocaleString('en-IN')}`, 495, currentY, { align: "right" });
        currentY += 18;
      }

      if (order.coinDiscount > 0) {
        doc.font("Helvetica").fillColor("#e11d48").text("Coins Discount:", summaryX, currentY);
        doc.font("Helvetica-Bold").fillColor("#e11d48").text(`-₹${order.coinDiscount.toLocaleString('en-IN')}`, 495, currentY, { align: "right" });
        currentY += 18;
      }

      doc.font("Helvetica").fillColor("#4b5563").text("Shipping:", summaryX, currentY);
      doc.font("Helvetica-Bold").fillColor("#111827").text(order.shipping === 0 ? "FREE" : `₹${order.shipping.toLocaleString('en-IN')}`, 495, currentY, { align: "right" });
      currentY += 25;

      // Double line before total
      doc.strokeColor("#e5e7eb").lineWidth(1).moveTo(summaryX, currentY - 5).lineTo(545, currentY - 5).stroke();

      doc.font("Helvetica-Bold").fontSize(12).fillColor("#111827").text("Total Paid:", summaryX, currentY);
      doc.text(`₹${order.total.toLocaleString('en-IN')}`, 495, currentY, { align: "right" });

      // Footer
      doc.font("Helvetica").fontSize(8).fillColor("#9ca3af")
        .text("Thank you for shopping with DEHYDE.", 50, 750, { align: "center" })
        .text("For any support queries, email us at dehyde333@gmail.com", 50, 765, { align: "center" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
