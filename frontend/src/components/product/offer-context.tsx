"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { Offer, Product } from "@/data/products";

type OfferActions = {
  product: Product;
  offer: Offer;
  selectBundle: () => void;
  scrollToForm: () => void;
};

const OfferActionsContext = createContext<OfferActions | null>(null);

export function OfferActionsProvider({ value, children }: { value: OfferActions; children: ReactNode }) {
  return <OfferActionsContext.Provider value={value}>{children}</OfferActionsContext.Provider>;
}

export function useOfferActions(): OfferActions {
  const value = useContext(OfferActionsContext);
  if (!value) throw new Error("Offer actions are only available on the product page");
  return value;
}
