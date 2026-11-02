import type { MetadataRoute } from "next";

import { PRODUCTS } from "@/data/products";
import { SITE_URL } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/collections", "/about", "/contact", ...PRODUCTS.map((p) => `/products/${p.slug}`)];
  return paths.flatMap((path) =>
    ["", "/fr", "/en"].map((prefix) => ({
      url: `${SITE_URL}${prefix}${path}`,
      lastModified: new Date(),
    })),
  );
}
