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
      doc.font("Helvetica-Bold").text("PAN:", 30, colY + 66);
      doc.font("Helvetica").text("AAXCS0655F", 30, colY + 76);
      doc.font("Helvetica-Bold").text("CIN:", 30, colY + 88);
      doc.font("Helvetica").text("U52399DL2016PTC299716", 30, colY + 98);

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
        billAddrY += 12;
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
        shipAddrY += 12;
      });

      // Column 4: Warranty note
      doc.font("Helvetica-Oblique").fontSize(6.5).fillColor("#4b5563")
        .text("*Keep this invoice and manufacturer box for warranty purposes.", 490, colY, { width: 75, align: "right" });

      const maxHeaderY = Math.max(colY + 115, billAddrY, shipAddrY);
      
      // Horizontal separator line before table
      doc.strokeColor("#e5e7eb").lineWidth(1).moveTo(30, maxHeaderY).lineTo(565, maxHeaderY).stroke();

      // Items calculation
      const totalDiscount = (order.discount || 0) + (order.coinDiscount || 0);
      let remainingDiscount = totalDiscount;
      let subtotalQty = 0;
      let subtotalGross = 0;
      let subtotalDiscount = 0;
      let subtotalTaxable = 0;
      let subtotalSgst = 0;
      let subtotalCgst = 0;
      let subtotalTotal = 0;

      // 1. Fetch images and load product details asynchronously in parallel
      const fetchedItems = await Promise.all(
        order.items.map(async (item) => {
          let categoryName = "Menswear";
          let fsn = item.product ? String(item.product).substring(0, 12).toUpperCase() : "DEHYDE-SKU";
          try {
            const product = await Product.findById(item.product).populate("category");
            if (product) {
              if (product.category && typeof product.category === "object") {
                categoryName = (product.category as any).name || "Menswear";
              }
              fsn = product.slug.toUpperCase();
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
            fsn,
            imgBuffer
          };
        })
      );

      const itemsData = [];
      for (let i = 0; i < fetchedItems.length; i++) {
        const { item, category, fsn, imgBuffer } = fetchedItems[i];
        const lineTotal = item.price * item.quantity;
        
        let itemDiscount = 0;
        if (i === fetchedItems.length - 1) {
          itemDiscount = remainingDiscount;
        } else {
          itemDiscount = order.subtotal > 0 ? Math.round((totalDiscount * lineTotal) / order.subtotal * 100) / 100 : 0;
          remainingDiscount -= itemDiscount;
        }

        const grossAmount = lineTotal;
        const taxableValue = (grossAmount - itemDiscount) / 1.12;
        const sgst = taxableValue * 0.06;
        const cgst = taxableValue * 0.06;
        const itemTotal = grossAmount - itemDiscount;

        subtotalQty += item.quantity;
        subtotalGross += grossAmount;
        subtotalDiscount += itemDiscount;
        subtotalTaxable += taxableValue;
        subtotalSgst += sgst;
        subtotalCgst += cgst;
        subtotalTotal += itemTotal;

        itemsData.push({
          category,
          fsn,
          hsn: "6203", // Standard HSN code for apparel
          title: item.title,
          size: item.size,
          color: item.color,
          qty: item.quantity,
          gross: grossAmount,
          discount: itemDiscount,
          taxable: taxableValue,
          sgst,
          cgst,
          total: itemTotal,
          imgBuffer,
        });
      }

      // Add shipping charges row if shipping > 0
      if (order.shipping > 0) {
        const shippingGross = order.shipping;
        const shippingTaxable = shippingGross / 1.18;
        const shippingSgst = shippingTaxable * 0.09;
        const shippingCgst = shippingTaxable * 0.09;

        subtotalQty += 1;
        subtotalGross += shippingGross;
        subtotalTaxable += shippingTaxable;
        subtotalSgst += shippingSgst;
        subtotalCgst += shippingCgst;
        subtotalTotal += shippingGross;

        itemsData.push({
          category: "Services",
          fsn: "DELIVERY",
          hsn: "9968",
          title: "Shipping & Handling Charges",
          size: "",
          color: "",
          qty: 1,
          gross: shippingGross,
          discount: 0,
          taxable: shippingTaxable,
          sgst: shippingSgst,
          cgst: shippingCgst,
          total: shippingGross,
          imgBuffer: null,
        });
      }

      // Print Total items indicator
      doc.fillColor("#111827");
      doc.font("Helvetica-Bold").fontSize(7.5).text(`Total items: ${order.items.length}`, 30, maxHeaderY + 10);

      // Table Headers
      const tableHeaderY = maxHeaderY + 22;
      doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#111827");
      doc.text("Product", 30, tableHeaderY, { width: 80 });
      doc.text("Title", 115, tableHeaderY, { width: 145 });
      doc.text("Qty", 265, tableHeaderY, { width: 20, align: "center" });
      doc.text("Gross\nAmount Rs.", 290, tableHeaderY, { width: 50, align: "right" });
      doc.text("Discounts\n/Coupons Rs.", 345, tableHeaderY, { width: 55, align: "right" });
      doc.text("Taxable\nValue Rs.", 405, tableHeaderY, { width: 50, align: "right" });
      doc.text("SGST\n/UTGST Rs.", 460, tableHeaderY, { width: 40, align: "right" });
      doc.text("CGST\nRs.", 505, tableHeaderY, { width: 25, align: "right" });
      doc.text("Total\nRs.", 535, tableHeaderY, { width: 30, align: "right" });

      doc.strokeColor("#111827").lineWidth(1).moveTo(30, tableHeaderY + 20).lineTo(565, tableHeaderY + 20).stroke();

      // Print Rows
      let currentY = tableHeaderY + 25;
      doc.font("Helvetica").fontSize(7);
      
      for (const item of itemsData) {
        if (currentY > 700) {
          doc.addPage();
          currentY = 40;
          doc.strokeColor("#e5e7eb").lineWidth(1).moveTo(30, currentY).lineTo(565, currentY).stroke();
          currentY += 15;
        }

        // Draw Product image or placeholder inside the Product column
        if (item.category !== "Services") {
          if (item.imgBuffer) {
            try {
              doc.image(item.imgBuffer, 30, currentY, { width: 28, height: 36 });
            } catch (imageErr) {
              console.error("Error drawing image in pdfkit:", imageErr);
              doc.fillColor("#f3f4f6").strokeColor("#e5e7eb").rect(30, currentY, 28, 36).fillAndStroke();
              doc.fontSize(5).fillColor("#9ca3af").text("No Image", 30, currentY + 15, { width: 28, align: "center" });
            }
          } else {
            doc.fillColor("#f3f4f6").strokeColor("#e5e7eb").rect(30, currentY, 28, 36).fillAndStroke();
            doc.fontSize(5).fillColor("#9ca3af").text("No Image", 30, currentY + 15, { width: 28, align: "center" });
          }

          // Category + FSN + HSN next to the image at X=63
          doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#111827").text(item.category, 63, currentY, { width: 47 });
          doc.font("Helvetica").fontSize(6.5).fillColor("#6b7280")
            .text(`FSN: ${item.fsn}`, 63, currentY + 10, { width: 47 })
            .text(`HSN: ${item.hsn}`, 63, currentY + 20, { width: 47 });
        } else {
          // For Services like shipping
          doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#111827").text(item.category, 30, currentY, { width: 80 });
          doc.font("Helvetica").fontSize(6.5).fillColor("#6b7280")
            .text(`FSN: ${item.fsn}`, 30, currentY + 10, { width: 80 })
            .text(`HSN: ${item.hsn}`, 30, currentY + 20, { width: 80 });
        }

        // Column 2: Title + specs + GST rates details
        doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#111827").text(item.title, 115, currentY, { width: 145 });
        let detailsText = "";
        if (item.size || item.color) {
          detailsText += `Size: ${item.size} | Color: ${item.color} | `;
        }
        const gstRate = item.category === "Services" ? "9.0 %" : "6.0 %";
        detailsText += `SGST/UTGST: ${gstRate} | CGST: ${gstRate}`;
        doc.font("Helvetica").fontSize(6.5).fillColor("#6b7280").text(detailsText, 115, currentY + 18, { width: 145 });

        // Numeric Columns
        doc.font("Helvetica").fontSize(7.5).fillColor("#374151");
        doc.text(String(item.qty), 265, currentY, { width: 20, align: "center" });
        doc.text(item.gross.toFixed(2), 290, currentY, { width: 50, align: "right" });
        doc.text(item.discount > 0 ? `-${item.discount.toFixed(2)}` : "0.00", 345, currentY, { width: 55, align: "right" });
        doc.text(item.taxable.toFixed(2), 405, currentY, { width: 50, align: "right" });
        doc.text(item.sgst.toFixed(2), 460, currentY, { width: 40, align: "right" });
        doc.text(item.cgst.toFixed(2), 505, currentY, { width: 25, align: "right" });
        doc.font("Helvetica-Bold").fillColor("#111827").text(item.total.toFixed(2), 535, currentY, { width: 30, align: "right" });

        currentY += 42;
      }

      // Total Divider Line
      doc.strokeColor("#e5e7eb").lineWidth(1).moveTo(30, currentY).lineTo(565, currentY).stroke();
      currentY += 5;

      // Total Row
      doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#111827");
      doc.text("Total", 115, currentY, { width: 145 });
      doc.text(String(subtotalQty), 265, currentY, { width: 20, align: "center" });
      doc.text(subtotalGross.toFixed(2), 290, currentY, { width: 50, align: "right" });
      doc.text(subtotalDiscount > 0 ? `-${subtotalDiscount.toFixed(2)}` : "0.00", 345, currentY, { width: 55, align: "right" });
      doc.text(subtotalTaxable.toFixed(2), 405, currentY, { width: 50, align: "right" });
      doc.text(subtotalSgst.toFixed(2), 460, currentY, { width: 40, align: "right" });
      doc.text(subtotalCgst.toFixed(2), 505, currentY, { width: 25, align: "right" });
      doc.text(subtotalTotal.toFixed(2), 535, currentY, { width: 30, align: "right" });

      currentY += 12;
      doc.strokeColor("#e5e7eb").lineWidth(1).moveTo(30, currentY).lineTo(565, currentY).stroke();

      // Grand Total Block
      currentY += 15;
      if (currentY > 750) {
        doc.addPage();
        currentY = 40;
      }
      doc.font("Helvetica-Bold").fontSize(12).fillColor("#111827");
      doc.text("Grand Total", 300, currentY, { width: 120, align: "right" });
      doc.text(`Rs. ${order.total.toFixed(2)}`, 440, currentY, { width: 125, align: "right" });

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
