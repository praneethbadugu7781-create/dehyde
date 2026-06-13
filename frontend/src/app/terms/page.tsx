import { PolicyLayout } from "@/components/policy/PolicyLayout";

export default function TermsPage() {
  return (
    <PolicyLayout title="Terms & Conditions">
      <p>Last updated: June 02, 2026</p>

      <p>
        Welcome to DEHYDE. These Terms & Conditions govern your use of the website <strong>dehyde.in</strong> and the purchase of any products from our online store. By accessing our site, registering an account, or making a purchase, you agree to comply with and be bound by these terms. If you do not agree to these terms, please refrain from using our services.
      </p>

      <h3 className="font-serif text-lg text-charcoal mt-8">1. Business Profile & Identification</h3>
      <p>
        The trade name <strong>DEHYDE</strong> and website <strong>dehyde.in</strong> are owned and operated by <strong>DEHYDE RETAIL PRIVATE LIMITED</strong>, with its registered office in Gudivada, Andhra Pradesh, India.
      </p>

      <h3 className="font-serif text-lg text-charcoal mt-8">2. Registration and Accounts</h3>
      <p>
        When you create an account on our platform, you are responsible for maintaining the confidentiality of your credentials and account details. You agree to accept responsibility for all activities that occur under your account. You must provide accurate, current, and complete information during checkout or registration.
      </p>

      <h3 className="font-serif text-lg text-charcoal mt-8">3. Product Offerings and Pricing</h3>
      <p>
        We make every effort to display the colors and details of our products as accurately as possible. However, the actual colors you see will depend on your monitor/device screen.
      </p>
      <ul className="list-disc pl-5 space-y-2">
        <li>All prices listed on our website are in <strong>Indian Rupees (INR)</strong> and are inclusive of applicable goods and services taxes (GST) unless stated otherwise.</li>
        <li>We reserve the right to modify pricing, description, or availability of products at any time without prior notice.</li>
        <li>In the event of a pricing error on the website, we reserve the right to cancel any orders placed for the incorrectly priced item. If your payment was already processed, we will issue a full refund to your original payment method.</li>
      </ul>

      <h3 className="font-serif text-lg text-charcoal mt-8">4. Payments & Razorpay Integration</h3>
      <p>
        We accept online payments using major credit cards, debit cards, Net Banking, wallets, and UPI. All transactions are securely processed through the <strong>Razorpay</strong> payment gateway. By completing a transaction, you authorize Razorpay to charge the designated amount to your chosen payment instrument. We do not store any sensitive cardholder information on our systems.
      </p>

      <h3 className="font-serif text-lg text-charcoal mt-8">5. Loyalty Rewards & DEHYDE Coins</h3>
      <p>
        DEHYDE Coins are promotional loyalty credits earned through eligible purchases on our website:
      </p>
      <ul className="list-disc pl-5 space-y-2">
        <li>1 DEHYDE Coin is equivalent to ₹1.</li>
        <li>Coins are non-transferable, cannot be exchanged for physical cash, and can only be used for discounts on future purchases at dehyde.in.</li>
        <li>Redemption limits are capped at a maximum percentage (currently 30%) per order as configured in our store settings. Coins expire 365 days after the date of credit.</li>
      </ul>

      <h3 className="font-serif text-lg text-charcoal mt-8">6. Intellectual Property</h3>
      <p>
        All content on this website, including but not limited to text, graphics, logos, images, typography, and source code, is the property of DEHYDE RETAIL PRIVATE LIMITED and is protected by copyright and intellectual property laws. You may not reproduce, copy, or redistribute any materials without our express written consent.
      </p>

      <h3 className="font-serif text-lg text-charcoal mt-8">7. Governing Law & Jurisdiction</h3>
      <p>
        These Terms & Conditions and any separate agreements whereby we provide you services shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or relating to these terms shall be subject to the exclusive jurisdiction of the courts located in <strong>Gudivada, Andhra Pradesh, India</strong>.
      </p>

      <h3 className="font-serif text-lg text-charcoal mt-8">8. Contact Information</h3>
      <p>
        For any inquiries regarding our Terms & Conditions, please contact us:
        <br />
        <strong>Email:</strong> dehyde333@gmail.com
        <br />
        <strong>Phone:</strong> +91 62818 11294
        <br />
        <strong>Address:</strong> DEHYDE RETAIL PRIVATE LIMITED, Door No: 23B-5-16, Ramachandra Rao Pet, Gudivada, Andhra Pradesh - 521301, India
      </p>
    </PolicyLayout>
  );
}
