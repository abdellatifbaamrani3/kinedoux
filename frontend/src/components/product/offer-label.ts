import { isBundleOffer, type Offer } from "@/data/products";

export function offerTileLabel(offer: Offer, labels: { tilePair: string; tileBundle: string }): string {
  if (isBundleOffer(offer)) return labels.tileBundle;
  if (offer.units > 1) return labels.tilePair;
  return offer.title;
}
