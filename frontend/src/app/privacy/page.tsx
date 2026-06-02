import { PolicyLayout } from "@/components/policy/PolicyLayout";

export default function PrivacyPage() {
  return (
    <PolicyLayout title="Privacy Policy">
      <p>Last updated: June 02, 2026</p>
      
      <p>
        At DEHYDE, accessible from <strong>dehyde.in</strong>, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by DEHYDE and how we use it. If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at <strong>privacy@dehyde.in</strong>.
      </p>

      <h3 className="font-serif text-lg text-charcoal mt-8">1. Information We Collect</h3>
      <p>
        We collect several types of information for various purposes to provide and improve our service to you:
      </p>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Personal Identifiable Information:</strong> While using our service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you. This includes your email address, first name and last name, phone number, and billing/shipping address.</li>
        <li><strong>Payment Data:</strong> All payments are processed securely through our payment partner, <strong>Razorpay</strong>. We do not store or collect your payment card details or UPI credentials on our servers. This information is provided directly to Razorpay, whose use of your personal information is governed by their Privacy Policy.</li>
        <li><strong>Order & Wallet History:</strong> We maintain records of your purchases, transactional history, and your DEHYDE Coins wallet balance to process redemptions and loyalty rewards.</li>
      </ul>

      <h3 className="font-serif text-lg text-charcoal mt-8">2. How We Use Your Information</h3>
      <p>
        DEHYDE uses the collected data for various purposes:
      </p>
      <ul className="list-disc pl-5 space-y-2">
        <li>To process, fulfill, and ship your orders.</li>
        <li>To manage your customer account and track reward balances.</li>
        <li>To send you transactional notifications, including order confirmations, invoice details, and shipping tracking.</li>
        <li>To provide customer support and respond to your inquiries.</li>
        <li>To detect, prevent, and address technical or security issues.</li>
      </ul>

      <h3 className="font-serif text-lg text-charcoal mt-8">3. Cookies and Tracking</h3>
      <p>
        DEHYDE uses cookies to enhance your shopping experience. Cookies are small files stored on your device that help us remember items in your shopping cart, recognize your session on future visits, and understand user preferences. You can choose to disable cookies through your browser settings, though some features of the website may not function correctly as a result.
      </p>

      <h3 className="font-serif text-lg text-charcoal mt-8">4. Data Sharing and Disclosure</h3>
      <p>
        We do not sell, trade, or rent your personal identification information to third parties. We share your information only with trusted service providers to the extent necessary to perform their services:
      </p>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Razorpay:</strong> To process payments securely.</li>
        <li><strong>Logistics & Courier Partners:</strong> To print shipping labels and deliver your purchased products.</li>
        <li><strong>Cloud Hosting & Database Providers:</strong> To keep our platform running securely.</li>
      </ul>

      <h3 className="font-serif text-lg text-charcoal mt-8">5. Data Security</h3>
      <p>
        The security of your data is important to us. We implement industry-standard security measures, including SSL encryption during transit, to protect your personal details. However, please remember that no method of transmission over the Internet or method of electronic storage is 100% secure.
      </p>

      <h3 className="font-serif text-lg text-charcoal mt-8">6. Contact Information</h3>
      <p>
        If you have any questions or concerns regarding this Privacy Policy, please contact us at:
        <br />
        <strong>Email:</strong> privacy@dehyde.in
        <br />
        <strong>Address:</strong> DEHYDE RETAIL PRIVATE LIMITED, Door No: 23B-5-16, Ramachandra Rao Pet, Eluru, Andhra Pradesh - 534002, India
      </p>
    </PolicyLayout>
  );
}
