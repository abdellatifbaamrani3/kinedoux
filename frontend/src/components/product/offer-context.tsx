"use client";

import { createContext, useContext, type ReactNode } from "react";

type OfferActions = {
  selectBundle: () => void;
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
