import { PolicyLayout } from "@/components/policy/PolicyLayout";

export default function RefundPage() {
  return (
    <PolicyLayout title="Return & Refund Policy">
      <p>Last updated: June 02, 2026</p>

      <p>
        At DEHYDE, customer satisfaction is our top priority. We want you to be completely satisfied with your purchase. Please read our Return, Refund, and Cancellation policy carefully to understand your rights and options.
      </p>

      <h3 className="font-serif text-lg text-charcoal mt-8">1. Returns & Exchanges Window</h3>
      <p>
        We accept returns and exchanges within <strong>14 days</strong> of the delivery date. To be eligible for a return or exchange:
      </p>
      <ul className="list-disc pl-5 space-y-2">
        <li>The item must be unused, unwashed, and in the same condition that you received it.</li>
        <li>The item must be in its original packaging with all editorial tags, labels, and hygiene seals fully intact.</li>
        <li>Proof of purchase (invoice or order confirmation email) must be provided.</li>
      </ul>
      <p>
        Items showing signs of wear, makeup stains, perfumes, or laundry scent will not be accepted and will be sent back at the customer's expense. Certain items such as innerwear, socks, and custom-tailored garments are final sale and cannot be returned unless defective.
      </p>

      <h3 className="font-serif text-lg text-charcoal mt-8">2. Return Shipping Cost</h3>
      <p>
        We offer <strong>complimentary return shipping</strong> for all eligible returns and exchanges within India. Once your return request is approved, we will arrange a free reverse pickup from your shipping address via our courier partners.
      </p>

      <h3 className="font-serif text-lg text-charcoal mt-8">3. How to Initiate a Return or Exchange</h3>
      <p>
        To start a return or exchange process, please follow these steps:
      </p>
      <ul className="list-decimal pl-5 space-y-2">
        <li>Email us at <strong>support@dehyde.in</strong> within 14 days of delivery.</li>
        <li>Include your order number, list of items you wish to return/exchange, and the reason for the return. If an item is damaged or defective, please attach clear photographs.</li>
        <li>Our support team will review your request within 24 hours. Upon approval, we will share reverse pickup coordinates and instructions.</li>
      </ul>

      <h3 className="font-serif text-lg text-charcoal mt-8">4. Order Cancellation Policy</h3>
      <p>
        You can cancel your order free of charge within <strong>2 hours</strong> of placing it, or before it has been handed over to the courier partner for shipment, whichever is earlier.
      </p>
      <p>
        To request a cancellation, please email us immediately at <strong>support@dehyde.in</strong> with your order number. Once shipped, orders cannot be cancelled but can be returned in accordance with our 14-day return window.
      </p>

      <h3 className="font-serif text-lg text-charcoal mt-8">5. Refund Processing Timeline</h3>
      <p>
        Once your return is received and inspected by our warehouse quality team, we will send you an email notifying you of the approval or rejection of your refund:
      </p>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Approved Returns:</strong> The refund will be initiated instantly back to your original payment method (via <strong>Razorpay</strong>).</li>
        <li><strong>Processing Time:</strong> It typically takes <strong>5 to 7 business days</strong> for the refunded amount to reflect in your bank account, credit card statement, or UPI account, depending on your bank's processing cycles.</li>
        <li><strong>DEHYDE Coins:</strong> If you used DEHYDE Coins during checkout, the respective coins will be credited back to your digital wallet balance instantly.</li>
      </ul>

      <h3 className="font-serif text-lg text-charcoal mt-8">6. Contact Us</h3>
      <p>
        For any questions regarding returns, refunds, or cancellations, please contact us at:
        <br />
        <strong>Email:</strong> support@dehyde.in
        <br />
        <strong>Phone:</strong> +91 62818 11294
      </p>
    </PolicyLayout>
  );
}
