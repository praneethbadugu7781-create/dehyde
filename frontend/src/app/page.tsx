import { Hero } from "@/components/home/Hero";
import { MostLovedStyles } from "@/components/home/MostLovedStyles";
import { BrandStory } from "@/components/home/BrandStory";
import { CollectionShowcase } from "@/components/home/CollectionShowcase";
import { Features } from "@/components/home/Features";
import { Reviews } from "@/components/home/Reviews";
import { SocialPromo } from "@/components/home/SocialPromo";

export default function HomePage() {
  return (
    <>
      {/* 1. Stacked Triple Viewport Campaign Banners */}
      <Hero />

      {/* 2. Stores Stats & Most Loved Styles (Best Sellers & New In Switcher Grid) */}
      <MostLovedStyles />

      {/* 3. Collections categories splits */}
      <CollectionShowcase />

      {/* 4. What defines our wear tags grid */}
      <Features />

      {/* 5. Voice of Quality customer testimonials */}
      <Reviews />

      {/* 6. Stay connected social promo banner */}
      <SocialPromo />

      {/* 7. Brand Story split block */}
      <BrandStory />
    </>
  );
}
