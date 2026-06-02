import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div>
      <section className="relative h-[70vh] min-h-[500px]">
        <Image
          src="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=2000&q=85"
          alt="DEHYDE"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-charcoal/40" />
        <div className="absolute bottom-0 luxury-container pb-20">
          <p className="text-[10px] uppercase tracking-editorial text-offwhite/70">About</p>
          <h1 className="editorial-heading mt-4 max-w-2xl text-5xl text-offwhite md:text-7xl">
            Luxury streetwear, born in India
          </h1>
        </div>
      </section>
      <section className="luxury-container max-w-3xl py-section">
        <p className="text-lg leading-relaxed text-muted">
          DEHYDE was founded on a single belief: premium menswear should feel cinematic, not commercial.
          We design for men who move through cities with intention — architectural silhouettes, muted palettes,
          and fabrics chosen for how they fall, not how they flash.
        </p>
        <p className="mt-8 text-lg leading-relaxed text-muted">
          Every collection is an editorial chapter. Every piece earns its place. Welcome to the new uniform
          of modern Indian street luxury.
        </p>
        <Button asChild className="mt-12">
          <Link href="/shop">Explore the collection</Link>
        </Button>
      </section>
    </div>
  );
}
