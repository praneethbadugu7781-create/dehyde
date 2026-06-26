import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="font-sans text-charcoal">
      {/* Premium Hero Banner */}
      <section className="relative h-[80vh] min-h-[550px] flex items-end">
        <Image
          src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=2000&auto=format&fit=crop"
          alt="DEHYDE Premium Streetwear Campaign"
          fill
          className="object-cover object-top filter brightness-[0.85]"
          priority
        />
        {/* Subtle overlay gradients for luxury branding feel */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent z-1" />
        
        <div className="absolute bottom-0 w-full z-10 py-16 md:py-24">
          <div className="luxury-container">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/80 font-bold mb-4">
              ABOUT DEHYDE
            </p>
            <h1 className="font-serif italic font-normal text-3xl md:text-5xl lg:text-6xl text-white max-w-4xl leading-[1.15] tracking-tight">
              &ldquo;Bringing tomorrow&apos;s trends today &mdash; crafted with quality and priced for everyone.&rdquo;
            </h1>
          </div>
        </div>
      </section>

      {/* Main Narrative Section */}
      <section className="py-24 bg-white">
        <div className="luxury-container">
          <div className="grid gap-12 lg:grid-cols-12 items-start">
            {/* Left Sidebar Label */}
            <div className="lg:col-span-4 lg:sticky lg:top-32">
              <span className="text-[10px] uppercase tracking-[0.2em] text-royal font-extrabold">
                OUR MISSION
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-royal mt-3 font-semibold leading-tight">
                Accessible fashion,<br />without compromise.
              </h2>
            </div>

            {/* Right Story Paragraphs */}
            <div className="lg:col-span-8 space-y-8 text-neutral-600 text-sm md:text-base leading-relaxed font-light">
              <p>
                At our brand, we believe great fashion should be accessible to everyone. Our mission is to bring the latest trendy designs to our customers by identifying upcoming fashion trends and launching stylish collections at the right time.
              </p>
              <p>
                We are committed to delivering premium quality clothing without compromising affordability. Every product is carefully selected and crafted to provide the perfect balance of style, comfort, and value.
              </p>
              <p className="font-medium text-royal">
                Our goal is simple: to make trendy, high-quality fashion available at prices everyone can afford.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Statement / Short Version Quote Block */}
      <section className="py-20 bg-offwhite border-y border-black/5">
        <div className="luxury-container max-w-4xl text-center">
          <span className="text-[9px] uppercase tracking-[0.25em] text-neutral-400 font-extrabold block mb-6">
            IN ESSENCE
          </span>
          <blockquote className="font-serif italic text-xl md:text-3xl text-neutral-800 leading-relaxed max-w-3xl mx-auto">
            &ldquo;We predict trends, create quality, and deliver style at affordable prices. Our mission is to help people look their best without spending a fortune.&rdquo;
          </blockquote>
        </div>
      </section>

      {/* Three Pillars Section */}
      <section className="py-24 bg-white">
        <div className="luxury-container">
          <div className="mb-16 text-center max-w-xl mx-auto">
            <span className="text-[10px] uppercase tracking-[0.2em] text-royal font-bold">
              THE THREE PILLARS
            </span>
            <h3 className="font-display text-2xl md:text-3xl text-royal font-bold mt-3">
              How we redefine D2C clothing
            </h3>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Pillar 1 */}
            <div className="border border-black/5 p-8 md:p-10 rounded-2xl bg-[#fcfcfc] flex flex-col justify-between min-h-[220px]">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">01 / PREDICT</span>
                <h4 className="font-display text-lg font-bold text-royal mt-4 mb-2">Trend Analysis</h4>
                <p className="text-xs text-neutral-500 leading-relaxed font-light">
                  We study global streetwear movements to identify upcoming styles early, delivering drops right when they are most desired.
                </p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="border border-black/5 p-8 md:p-10 rounded-2xl bg-[#fcfcfc] flex flex-col justify-between min-h-[220px]">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">02 / CRAFT</span>
                <h4 className="font-display text-lg font-bold text-royal mt-4 mb-2">Premium Quality</h4>
                <p className="text-xs text-neutral-500 leading-relaxed font-light">
                  Every garment is meticulously selected and constructed to provide an optimal balance of premium fit, long-term durability, and daily comfort.
                </p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="border border-black/5 p-8 md:p-10 rounded-2xl bg-[#fcfcfc] flex flex-col justify-between min-h-[220px]">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">03 / VALUE</span>
                <h4 className="font-display text-lg font-bold text-royal mt-4 mb-2">True Affordability</h4>
                <p className="text-xs text-neutral-500 leading-relaxed font-light">
                  By cutting out middlemen and optimizing direct production, we bring high-end fashion design directly to you at honest, affordable prices.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Footer */}
          <div className="mt-20 text-center">
            <Button asChild className="rounded-full px-10 py-5 bg-royal text-white hover:bg-neutral-800 transition-colors shadow-md">
              <Link href="/shop">Explore Our Collections</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
