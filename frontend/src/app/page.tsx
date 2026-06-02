import { Hero } from "@/components/home/Hero";
import { CollectionShowcase } from "@/components/home/CollectionShowcase";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { NewArrivals } from "@/components/home/NewArrivals";
import { TrendingProducts } from "@/components/home/TrendingProducts";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CollectionShowcase />
      <FeaturedProducts />
      <NewArrivals />
      <TrendingProducts />
    </>
  );
}
