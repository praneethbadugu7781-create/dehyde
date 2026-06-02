import type { Category, Product } from "@/types";
import { apiClient } from "@/lib/api";

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination?: { page: number; limit: number; total: number; pages: number };
}

export interface ProductResponse {
  success: boolean;
  data: Product;
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
}

export function productImage(product: Product): string {
  return product.images?.[0] || product.variants?.find((v) => v.images?.length)?.images[0] || "";
}

export async function getProducts(params: Record<string, string | number | boolean | undefined> = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const query = search.toString();
  return apiClient.get<ProductsResponse>(`/products${query ? `?${query}` : ""}`);
}
