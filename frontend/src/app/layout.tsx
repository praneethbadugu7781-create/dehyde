import type { Metadata } from "next";
import { Montserrat, Cormorant_Garamond } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackButton } from "@/components/layout/BackButton";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "DEHYDE — Premium Menswear Streetwear",
    template: "%s | DEHYDE",
  },
  description:
    "Luxury menswear streetwear from India. Editorial silhouettes, cinematic campaigns, premium D2C fashion.",
  keywords: ["menswear", "streetwear", "luxury fashion", "India", "DEHYDE"],
  openGraph: {
    title: "DEHYDE",
    description: "Premium menswear streetwear from India",
    type: "website",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${montserrat.variable} ${cormorant.variable}`}>
      <body suppressHydrationWarning>
        <Navbar />
        <BackButton />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
