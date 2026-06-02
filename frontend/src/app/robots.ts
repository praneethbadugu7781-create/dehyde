import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/account/orders",
        "/account/wallet",
        "/account/wishlist",
        "/cart",
        "/checkout",
      ],
    },
    sitemap: "https://dehyde.in/sitemap.xml",
  };
}
