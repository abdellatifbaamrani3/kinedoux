/** Natural pixel size of each photo used below the product hero. Measured from the files. */
const SIZE: Record<string, readonly [number, number]> = {
  "/images/about-unbox-2.webp": [960, 1200],
  "/images/lumba/before-after.webp": [1024, 765],
  "/images/lumba/columns-closeup.webp": [1024, 765],
  "/images/lumba/drive-2.webp": [1200, 900],
  "/images/lumba/guide-booklet.webp": [1024, 765],
  "/images/lumba/kit-mint.webp": [1024, 765],
  "/images/lumba/man-shop-square.webp": [1024, 1024],
  "/images/lumba/woman-salon.webp": [1024, 765],
  "/images/posta/button.webp": [1200, 900],
  "/images/posta/how.webp": [1200, 900],
  "/images/posta/kit.webp": [1200, 900],
  "/images/posta/laptop.webp": [1200, 900],
  "/images/posta/office.webp": [1200, 900],
  "/images/calma/buttons.webp": [1200, 900],
  "/images/calma/kit.webp": [1200, 900],
  "/images/calma/knee.webp": [1200, 900],
  "/images/calma/studio.webp": [1200, 900],
  "/images/palma/cutaway.webp": [1024, 1024],
  "/images/palma/heat.webp": [1024, 1024],
  "/images/palma/nodes.webp": [1024, 1024],
  "/images/palma/rest.webp": [576, 1024],
  "/images/palma/sofa.webp": [1024, 1024],
  "/images/palma/neck.webp": [1024, 1024],
};

export function sectionImageSize(src: string): { width: number; height: number } {
  const box = SIZE[src];
  if (!box) return { width: 1200, height: 900 };
  return { width: box[0], height: box[1] };
}
