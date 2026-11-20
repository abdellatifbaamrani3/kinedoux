import { lumba } from './lumba';

/** Register a new product here after you copy lumba.ts. */
export const products = [lumba];

export function getProduct(slug: string) {
  return products.find((item) => item.slug === slug);
}
