import { Hero } from "@/components/home/Hero";
import { NewArrivals } from "@/components/home/NewArrivals";
import { BrandStory } from "@/components/home/BrandStory";
import { TrendingProducts } from "@/components/home/TrendingProducts";
import { CollectionShowcase } from "@/components/home/CollectionShowcase";
import { Features } from "@/components/home/Features";
import { Reviews } from "@/components/home/Reviews";
import { SocialPromo } from "@/components/home/SocialPromo";

export default function HomePage() {
  return (
    <>
      {/* 1. Stacked Triple Full-Viewport (100vh) Banners */}
      <Hero />

      {/* 2. Existing Dehyde Website Content begins here */}
      <div className="snap-start w-full relative">
        {/* New Arrivals Grid */}
        <NewArrivals />

        {/* Best Sellers (Trending) Grid */}
        <TrendingProducts />

        {/* Collections categories showcase */}
        <CollectionShowcase />

        {/* What defines our wear tags grid */}
        <Features />

        {/* Voice of Quality customer testimonials */}
        <Reviews />

        {/* Stay connected social promo banner */}
        <SocialPromo />

        {/* Brand Story split block */}
        <BrandStory />
      </div>
    </>
  );
}
