"use client";

import Link from "next/link";
import Image from "next/image";

const BLOG_POSTS = [
  {
    slug: "minimal-street-style",
    tag: "Style Guide",
    title: "How to master the art of minimal street style",
    description: "Build a timeless, comfortable wardrobe with high-quality fabrics, muted tones, and effortless oversized fits.",
    time: "8 min read",
    date: "Jan 29, 2026",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop"
  },
  {
    slug: "minimalist-styling",
    tag: "Fashion Tips",
    title: "Elevate everyday outfits using modern minimalist styling",
    description: "Learn how to use structure, color coordination, and quality materials to upgrade your everyday dressing routine.",
    time: "8 min read",
    date: "Dec 30, 2025",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop"
  },
  {
    slug: "capsule-wardrobe",
    tag: "Style Guide",
    title: "Build a capsule wardrobe that works year round",
    description: "Discover the essential transition pieces that keep your style sharp and functional through every season shift.",
    time: "5 min read",
    date: "Nov 22, 2025",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600&auto=format&fit=crop"
  }
];

export default function BlogPage() {
  return (
    <div className="bg-[#f8f8f8] min-h-screen pt-36 pb-20 px-6 font-sans">
      <div className="mx-auto w-full max-w-[1200px]">
        {/* Header */}
        <div className="mb-16 border-b border-black/10 pb-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-semibold">
            DEHYDE Voice
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-black mt-2">
            Elevating your daily style journey
          </h1>
        </div>

        {/* Blog Grid */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {BLOG_POSTS.map((post) => (
            <article key={post.slug} className="group flex flex-col justify-between border border-black/5 bg-white p-5 rounded-lg hover:border-black/20 transition-all duration-300">
              <div>
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100 rounded-md">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                </div>
                
                <span className="inline-block bg-[#f8f8f8] border border-black/5 text-[9px] uppercase tracking-wider font-semibold rounded-full px-3 py-1 mt-6 text-neutral-600">
                  {post.tag}
                </span>

                <h2 className="font-display text-lg font-bold tracking-tight mt-4 text-black group-hover:underline decoration-1 leading-snug">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h2>

                <p className="text-xs text-neutral-500 leading-relaxed mt-3">
                  {post.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-black/5 flex items-center justify-between text-[10px] text-neutral-400 font-medium uppercase tracking-wider">
                <span>{post.time}</span>
                <span>{post.date}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
