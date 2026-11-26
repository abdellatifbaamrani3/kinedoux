/** Natural pixel size of each photo used below the product hero. Measured from the files. */
const SIZE: Record<string, readonly [number, number]> = {
  "/images/lumba/guide-booklet.webp": [1024, 765],
  "/images/lumba/kit-mint.webp": [1024, 765],
  "/images/lumba/man-shop-square.webp": [1024, 1024],
  "/images/posta/button.webp": [1200, 900],
  "/images/posta/kit.webp": [1200, 900],
  "/images/posta/office.webp": [1200, 900],
  "/images/calma/buttons.webp": [1200, 900],
  "/images/calma/kit.webp": [1200, 900],
  "/images/calma/studio.webp": [1200, 900],
  "/images/palma/rest.webp": [576, 1024],
  "/images/palma/nodes.webp": [1024, 1024],
  "/images/palma/neck.webp": [1024, 1024],
};

export function sectionImageSize(src: string): { width: number; height: number } {
  const box = SIZE[src];
  if (!box) return { width: 1200, height: 900 };
  return { width: box[0], height: box[1] };
}
