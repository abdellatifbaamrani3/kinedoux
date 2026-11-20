/** Astro may return a string URL or an image object. Both are accepted. */
export type Img = string | { src: string; width: number; height: number };

export function imgSrc(img: Img): string {
  return typeof img === 'string' ? img : img.src;
}

export function imgWidth(img: Img, fallback = 800): number {
  return typeof img === 'string' ? fallback : img.width;
}

export function imgHeight(img: Img, fallback = 800): number {
  return typeof img === 'string' ? fallback : img.height;
}
