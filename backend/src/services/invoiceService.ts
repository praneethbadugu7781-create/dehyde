import PDFDocument from "pdfkit";
import { IOrder } from "../models/Order.js";
import { Product } from "../models/Product.js";

async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  try {
    if (!url || !url.startsWith("http")) {
      return null;
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) {
      console.warn(`Failed to fetch image: ${url}, status: ${response.status}`);
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error(`Error fetching image buffer from ${url}:`, error);
    return null;
  }
}

export function generateInvoicePDF(order: IOrder, userEmail: string, userName: string): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 30, size: "A4" });
      const buffers: Buffer[] = [];
      doc.on("data", chunk => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", err => reject(err));

      // Brand/Header Title
      doc.fillColor("#111827");
      doc.font("Helvetica-Bold").fontSize(22).text("DEHYDE", 30, 30);
      doc.font("Helvetica").fontSize(7.5).fillColor("#6b7280").text("PREMIUM MENSWEAR", 30, 55);

      // Horizontal separator line
      doc.strokeColor("#e5e7eb").lineWidth(1).moveTo(30, 70).lineTo(565, 70).stroke();

      // Top metadata dates and address block
      const orderDate = (order as any).createdAt ? new Date((order as any).createdAt).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN");
      const invoiceDate = orderDate;

      // Column 1: Order Metadata
      let colY = 80;
      doc.fillColor("#111827");
      doc.font("Helvetica-Bold").fontSize(7.5).text("Order ID:", 30, colY);
      doc.font("Helvetica").text(order.orderNumber, 30, colY + 10);
      doc.font("Helvetica-Bold").text("Order Date:", 30, colY + 22);
      doc.font("Helvetica").text(orderDate, 30, colY + 32);
      doc.font("Helvetica-Bold").text("Invoice Date:", 30, colY + 44);
      doc.font("Helvetica").text(invoiceDate, 30, colY + 54);

      const addr = order.shippingAddress || {};

      // Column 2: Bill To
      doc.font("Helvetica-Bold").text("Bill To:", 200, colY);
      doc.font("Helvetica").text(userName, 200, colY + 10);
      let billAddrY = colY + 22;
      const billAddress = [
        addr.line1 || "",
        addr.line2 || "",
        `${addr.city || ""}, ${addr.state || ""} - ${addr.pincode || ""}`,
        `Phone: ${addr.phone || ""}`
      ].filter(l => l.trim() !== "");
      
      billAddress.forEach(line => {
        doc.text(line, 200, billAddrY, { width: 155 });
        billAddrY += doc.heightOfString(line, { width: 155 }) + 2;
      });

      // Column 3: Ship To
      doc.font("Helvetica-Bold").text("Ship To:", 370, colY);
      doc.font("Helvetica").text(addr.fullName || userName, 370, colY + 10);
      let shipAddrY = colY + 22;
      const shipAddress = [
        addr.line1 || "",
        addr.line2 || "",
        `${addr.city || ""}, ${addr.state || ""} - ${addr.pincode || ""}`,
        `Phone: ${addr.phone || ""}`
      ].filter(l => l.trim() !== "");
      
      shipAddress.forEach(line => {
        doc.text(line, 370, shipAddrY, { width: 110 });
        shipAddrY += doc.heightOfString(line, { width: 110 }) + 2;
      });

      // Column 4: Warranty note
      doc.font("Helvetica-Oblique").fontSize(6.5).fillColor("#4b5563")
        .text("*Keep this invoice and manufacturer box for warranty purposes.", 490, colY, { width: 75, align: "right" });

      const maxHeaderY = Math.max(colY + 65, billAddrY, shipAddrY) + 10;
      
      // Horizontal separator line before table
      doc.strokeColor("#e5e7eb").lineWidth(1).moveTo(30, maxHeaderY).lineTo(565, maxHeaderY).stroke();

      // Items calculation
      let subtotalQty = 0;
      let subtotalTotal = 0;

      // 1. Fetch images and load product details asynchronously in parallel
      const fetchedItems = await Promise.all(
        order.items.map(async (item) => {
          let categoryName = "Menswear";
          try {
            const product = await Product.findById(item.product).populate("category");
            if (product) {
              if (product.category && typeof product.category === "object") {
                categoryName = (product.category as any).name || "Menswear";
              }
            }
          } catch (err) {
            console.error("Error fetching product details for invoice:", err);
          }

          let imgBuffer: Buffer | null = null;
          if (item.image) {
            imgBuffer = await fetchImageBuffer(item.image);
          }

          return {
            item,
            category: categoryName,
            imgBuffer
          };
        })
      );

      const itemsData = [];
      for (const { item, category, imgBuffer } of fetchedItems) {
        const lineTotal = item.price * item.quantity;
        subtotalQty += item.quantity;
        subtotalTotal += lineTotal;

        itemsData.push({
          category,
          title: item.title,
          size: item.size,
          color: item.color,
          qty: item.quantity,
          price: item.price,
          total: lineTotal,
          imgBuffer,
        });
      }

      // Print Total items indicator
      doc.fillColor("#111827");
      doc.font("Helvetica-Bold").fontSize(7.5).text(`Total items: ${order.items.length}`, 30, maxHeaderY + 10);

      // Table Headers
      const tableHeaderY = maxHeaderY + 22;
      doc.font("Helvetica-Bold").fontSize(8).fillColor("#111827");
      doc.text("Product", 30, tableHeaderY, { width: 40 });
      doc.text("Item Details", 80, tableHeaderY, { width: 270 });
      doc.text("Price", 360, tableHeaderY, { width: 60, align: "right" });
      doc.text("Qty", 430, tableHeaderY, { width: 40, align: "center" });
      doc.text("Total", 480, tableHeaderY, { width: 85, align: "right" });

      doc.strokeColor("#111827").lineWidth(1).moveTo(30, tableHeaderY + 15).lineTo(565, tableHeaderY + 15).stroke();

      // Print Rows
      let currentY = tableHeaderY + 22;
      doc.font("Helvetica").fontSize(7.5);
      
      for (const item of itemsData) {
        if (currentY > 680) {
          doc.addPage();
          currentY = 40;
          doc.strokeColor("#e5e7eb").lineWidth(1).moveTo(30, currentY).lineTo(565, currentY).stroke();
          currentY += 15;
        }

        // Draw Product image or placeholder
        if (item.category !== "Services") {
          if (item.imgBuffer) {
            try {
              doc.image(item.imgBuffer, 30, currentY, { width: 30, height: 40 });
            } catch (imageErr) {
              console.error("Error drawing image in pdfkit:", imageErr);
              doc.fillColor("#f3f4f6").strokeColor("#e5e7eb").rect(30, currentY, 30, 40).fillAndStroke();
              doc.fontSize(5).fillColor("#9ca3af").text("No Image", 30, currentY + 18, { width: 30, align: "center" });
            }
          } else {
            doc.fillColor("#f3f4f6").strokeColor("#e5e7eb").rect(30, currentY, 30, 40).fillAndStroke();
            doc.fontSize(5).fillColor("#9ca3af").text("No Image", 30, currentY + 18, { width: 30, align: "center" });
          }
        }

        // Column 2: Title & Details
        doc.font("Helvetica-Bold").fontSize(8).fillColor("#111827").text(item.title, 80, currentY, { width: 270 });
        let detailsText = "";
        if (item.size || item.color) {
          detailsText += `Size: ${item.size} | Color: ${item.color}`;
        }
        if (detailsText) {
          doc.font("Helvetica").fontSize(7).fillColor("#6b7280").text(detailsText, 80, currentY + 14, { width: 270 });
        }

        // Numeric Columns
        doc.font("Helvetica").fontSize(8).fillColor("#374151");
        doc.text(`Rs. ${item.price.toFixed(2)}`, 360, currentY, { width: 60, align: "right" });
        doc.text(String(item.qty), 430, currentY, { width: 40, align: "center" });
        doc.font("Helvetica-Bold").fillColor("#111827").text(`Rs. ${item.total.toFixed(2)}`, 480, currentY, { width: 85, align: "right" });

        currentY += 48;
      }

      // Total Divider Line
      doc.strokeColor("#e5e7eb").lineWidth(1).moveTo(30, currentY).lineTo(565, currentY).stroke();
      currentY += 15;

      // Summary Block
      if (currentY > 620) {
        doc.addPage();
        currentY = 40;
      }
      
      const summaryX = 350;
      doc.font("Helvetica").fontSize(8.5).fillColor("#4b5563");
      
      doc.text("Subtotal:", summaryX, currentY);
      doc.font("Helvetica-Bold").fillColor("#111827").text(`Rs. ${order.subtotal.toFixed(2)}`, 495, currentY, { align: "right" });
      currentY += 16;

      if (order.discount > 0) {
        doc.font("Helvetica").fillColor("#e11d48").text("Promo Discount:", summaryX, currentY);
        doc.font("Helvetica-Bold").fillColor("#e11d48").text(`-Rs. ${order.discount.toFixed(2)}`, 495, currentY, { align: "right" });
        currentY += 16;
      }

      if (order.coinDiscount > 0) {
        doc.font("Helvetica").fillColor("#e11d48").text("Coins Discount:", summaryX, currentY);
        doc.font("Helvetica-Bold").fillColor("#e11d48").text(`-Rs. ${order.coinDiscount.toFixed(2)}`, 495, currentY, { align: "right" });
        currentY += 16;
      }

      doc.font("Helvetica").fillColor("#4b5563").text("Shipping Charges:", summaryX, currentY);
      doc.font("Helvetica-Bold").fillColor("#111827").text(order.shipping === 0 ? "FREE" : `Rs. ${order.shipping.toFixed(2)}`, 495, currentY, { align: "right" });
      currentY += 22;

      // Double line before total
      doc.strokeColor("#e5e7eb").lineWidth(1).moveTo(summaryX, currentY - 5).lineTo(565, currentY - 5).stroke();

      doc.font("Helvetica-Bold").fontSize(11).fillColor("#111827").text("Total Paid:", summaryX, currentY);
      doc.text(`Rs. ${order.total.toFixed(2)}`, 495, currentY, { align: "right" });

      currentY += 18;
      doc.font("Helvetica").fontSize(7.5).fillColor("#6b7280");
      doc.text("DEHYDE Retail Pvt. Ltd.", 300, currentY, { width: 265, align: "right" });

      // Footer Notes
      doc.font("Helvetica").fontSize(7.5).fillColor("#9ca3af")
        .text("For any support queries, email us at dehyde333@gmail.com", 30, 765, { align: "center" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
