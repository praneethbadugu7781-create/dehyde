import { Hero } from "@/components/home/Hero";
import { CategoryTabs } from "@/components/home/CategoryTabs";
import { NewArrivals } from "@/components/home/NewArrivals";
import { TrendingProducts } from "@/components/home/TrendingProducts";
import { Reviews } from "@/components/home/Reviews";
import { SocialPromo } from "@/components/home/SocialPromo";

export default function HomePage() {
  return (
    <>
      {/* 1. Stacked Triple Full-Viewport (100vh) Banners */}
      <Hero />

      {/* 2. Existing Dehyde Website Content begins here */}
      <div className="w-full relative">
        {/* Category Switcher Tabs */}
        <CategoryTabs />

        {/* New Arrivals Grid */}
        <NewArrivals />

        {/* Best Sellers (Trending) Grid */}
        <TrendingProducts />

        {/* Voice of Quality customer testimonials */}
        <Reviews />

        {/* Stay connected social promo banner */}
        <SocialPromo />
      </div>
    </>
  );
}
