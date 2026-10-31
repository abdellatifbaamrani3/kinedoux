"use client";

import dynamic from "next/dynamic";

import { PixelManager } from "@/components/tracking/PixelManager";

const CartDrawer = dynamic(() => import("@/components/cart/CartDrawer").then((m) => m.CartDrawer), { ssr: false });
const CheckoutPopupModal = dynamic(
  () => import("@/components/cart/CheckoutPopupModal").then((m) => m.CheckoutPopupModal),
  { ssr: false },
);
const UpsellCountdownModal = dynamic(
  () => import("@/components/cart/UpsellCountdownModal").then((m) => m.UpsellCountdownModal),
  { ssr: false },
);

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
