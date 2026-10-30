"use client";

import { CartDrawer } from "@/components/cart/CartDrawer";
import { CheckoutPopupModal } from "@/components/cart/CheckoutPopupModal";
import { UpsellCountdownModal } from "@/components/cart/UpsellCountdownModal";
import { PixelManager } from "@/components/tracking/PixelManager";

export function FunnelShell() {
  return (
    <>
      <PixelManager />
      <CartDrawer />
      <CheckoutPopupModal />
      <UpsellCountdownModal />
    </>
  );
}
