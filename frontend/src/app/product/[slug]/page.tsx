import { notFound } from "next/navigation";
import { Metadata } from "next";
import { apiClient } from "@/lib/api";
import type { Product } from "@/types";
import ProductDetailsClient from "./ProductDetailsClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const res = await apiClient.get<{ success: boolean; data: Product }>(`/products/${slug}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching product on server:", error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found | DEHYDE",
      description: "The requested menswear streetwear product could not be found.",
    };
  }

  return {
    title: `${product.title} | DEHYDE`,
    description: product.description || `Buy ${product.title} on DEHYDE — premium menswear streetwear from India.`,
    openGraph: {
      title: `${product.title} | DEHYDE`,
      description: product.description,
      images: product.images?.[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="pt-28 pb-section">
      <ProductDetailsClient product={product} />
    </div>
  );
}
