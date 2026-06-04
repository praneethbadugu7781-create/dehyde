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
      {/* 1. Hero Campaign View with Auto-Ticker */}
      <Hero />

      {/* 2. New Arrivals Grid */}
      <NewArrivals />

      {/* 3. Best Sellers (Trending) Grid */}
      <TrendingProducts />

      {/* 4. Collections categories splits */}
      <CollectionShowcase />

      {/* 5. What defines our wear tags grid */}
      <Features />

      {/* 6. Voice of Quality customer testimonials */}
      <Reviews />

      {/* 7. Stay connected social promo banner */}
      <SocialPromo />

      {/* 8. Brand Story split block */}
      <BrandStory />
    </>
  );
}
