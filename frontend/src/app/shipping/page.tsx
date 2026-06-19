import { PolicyLayout } from "@/components/policy/PolicyLayout";

export default function ShippingPage() {
  return (
    <PolicyLayout title="Shipping & Delivery Policy">
      <p>Last updated: June 02, 2026</p>

      <p>
        Welcome to DEHYDE. We are committed to delivering your premium streetwear garments quickly, securely, and in pristine condition. Below are the terms and conditions that constitute our Shipping & Delivery Policy.
      </p>

      <h3 className="font-serif text-lg text-charcoal mt-8">1. Delivery Coverage Area</h3>
      <p>
        We ship to all serviceable pincodes across <strong>India</strong> through our trusted logistics partners (including Delhivery, Blue Dart, DTDC, and Xpressbees). Currently, we do not support international shipping outside India.
      </p>

      <h3 className="font-serif text-lg text-charcoal mt-8">2. Order Processing & Dispatch Timeline</h3>
      <p>
        All orders are processed and prepared for dispatch within <strong>1 to 2 business days</strong> after payment confirmation:
      </p>
      <ul className="list-disc pl-5 space-y-2">
        <li>Orders placed on weekends (Saturdays and Sundays) or public holidays will be processed on the next business day.</li>
        <li>During high-volume promotional periods, order processing may take up to 3 business days. We will notify you via email/SMS if any significant delay occurs.</li>
      </ul>

      <h3 className="font-serif text-lg text-charcoal mt-8">3. Shipping Rates & Thresholds</h3>
      <p>
        We aim to keep shipping transparent and straightforward:
      </p>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Free Shipping:</strong> We offer free standard delivery on all orders above <strong>₹2,999</strong>.</li>
        <li><strong>Standard Shipping Fee:</strong> For orders below ₹2,999, a flat shipping and handling fee of <strong>₹99</strong> is charged at checkout.</li>
      </ul>

      <h3 className="font-serif text-lg text-charcoal mt-8">4. Transit & Delivery Timelines</h3>
      <p>
        Once dispatched from our fulfillment center in Mumbai, the estimated delivery transit timelines are:
      </p>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Metro Cities:</strong> 2 to 4 business days.</li>
        <li><strong>Rest of India:</strong> 4 to 7 business days.</li>
      </ul>
      <p>
        Please note that transit times are estimates provided by our courier partners. Occasional delays may occur due to local restrictions, extreme weather, festivals, or logistics disruptions.
      </p>

      <h3 className="font-serif text-lg text-charcoal mt-8">5. Shipment Tracking</h3>
      <p>
        Once your package is shipped, you will receive a confirmation email and SMS containing your unique <strong>AWB (Air Waybill) number</strong> and a tracking link. You can use this link to monitor the real-time status of your package.
      </p>

      <h3 className="font-serif text-lg text-charcoal mt-8">6. Delivery Attempts & Failed Delivery</h3>
      <p>
        Our logistics partners will attempt to deliver the package up to <strong>3 times</strong> before returning it to our warehouse. Please ensure your shipping address and contact phone number are correct at the time of checkout.
      </p>
      <p>
        If a package is returned due to incorrect address details, unavailability, or refusal to accept, reshipping charges of ₹99 will apply to dispatch the package again.
      </p>

      <h3 className="font-serif text-lg text-charcoal mt-8">7. Contact Information</h3>
      <p>
        If you have any questions regarding the delivery status of your order, please reach out to us:
        <br />
        <strong>Email:</strong> dehyde333@gmail.com
        <br />
        <strong>Phone:</strong> +91 62818 11294 (Mon-Fri, 10 AM to 6 PM IST)
      </p>
    </PolicyLayout>
  );
}
