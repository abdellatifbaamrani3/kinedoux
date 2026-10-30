import type { MetadataRoute } from "next";

import { PRODUCTS } from "@/data/products";
import { SITE_URL } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/collections", "/about", "/contact"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));
  const products = PRODUCTS.map((p) => ({
    url: `${SITE_URL}/products/${p.slug}`,
    lastModified: new Date(),
  }));
  return [...staticPages, ...products];
}
