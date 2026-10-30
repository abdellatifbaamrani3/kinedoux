"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ApiOrder, ApiUpsellOffer } from "@/lib/api";
import { trackEvent, type TrackContent } from "@/lib/tracking";
import { type Offer, type Product, type ProductSlug, PRODUCTS, crossSellOrder, getProduct } from "@/data/products";

export type CartItem = {
  lineId: string;
  productSlug: ProductSlug;
  offerId: string;
  title: string;
  subtitle: string;
  quantity: number;
  units: number;
  price: number;
  compareAtPrice: number;
  image: string;
  isCrossSell: boolean;
  isUpsell: boolean;
  includes: ProductSlug[];
};

export type ActiveOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  totalMad: number;
  eventId: string | null;
  items: CartItem[];
  upsellOffer: ApiUpsellOffer | null;
};

type CartState = {
  items: CartItem[];
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isUpsellOpen: boolean;
  isMobileNavOpen: boolean;
  reservedUntil: number | null;
  activeOrder: ActiveOrder | null;
  lastConfirmedOrder: ActiveOrder | null;
  addOfferAndOpenCart: (product: Product, offer: Offer) => void;
  addCrossSellItem: (product: Product) => void;
  setQty: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  openCart: () => void;
  closeCart: () => void;
  openCheckoutFromCart: () => void;
  closeCheckout: () => void;
  setActiveOrderAndOpenUpsell: (order: ApiOrder) => void;
  closeUpsell: () => void;
  markOrderConfirmed: (order: ApiOrder) => void;
  clearCart: () => void;
  setMobileNav: (open: boolean) => void;
};

const RESERVE_MS = 10 * 60 * 1000;

function lineId(slug: string, offerId: string, cross: boolean) {
  return `${cross ? "x" : "o"}:${slug}:${offerId}`;
}

function contentsOf(items: CartItem[]): TrackContent[] {
  return items.map((i) => ({
    id: i.productSlug,
    quantity: i.quantity * i.units,
    item_price: i.price,
    name: i.title,
  }));
}

function cartValue(items: CartItem[]) {
  return items.reduce((s, i) => s + i.price * i.quantity, 0);
}

function ensureTimer(current: number | null) {
  if (current && current > Date.now()) return current;
  return Date.now() + RESERVE_MS;
}

function toActive(order: ApiOrder, items: CartItem[]): ActiveOrder {
  return {
    id: order.id,
    orderNumber: order.order_number,
    customerName: order.customer_name,
    customerPhone: order.customer_phone_local,
    totalMad: order.total_mad,
    eventId: order.event_id,
    items,
    upsellOffer: order.upsell_offer,
  };
}

export function slugsInCart(items: CartItem[]): Set<ProductSlug> {
  const set = new Set<ProductSlug>();
  for (const item of items) {
    for (const slug of item.includes.length ? item.includes : [item.productSlug]) {
      set.add(slug);
    }
  }
  return set;
}

export function getCrossSells(items: CartItem[]) {
  if (!items.length) return [];
  const present = slugsInCart(items);
  const primary = items.find((i) => !i.isCrossSell)?.productSlug ?? items[0].productSlug;
  const ordered = crossSellOrder(primary);
  const rest = PRODUCTS.map((p) => p.slug).filter((s) => !ordered.includes(s) && s !== primary);
  return [...ordered, ...rest]
    .filter((slug) => !present.has(slug))
    .map((slug) => getProduct(slug)!)
    .filter(Boolean)
    .slice(0, 2);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      isCheckoutOpen: false,
      isUpsellOpen: false,
      isMobileNavOpen: false,
      reservedUntil: null,
      activeOrder: null,
      lastConfirmedOrder: null,

      addOfferAndOpenCart: (product, offer) => {
        const id = lineId(product.slug, offer.id, false);
        const existing = get().items.find((i) => i.lineId === id);
        const next: CartItem[] = existing
          ? get().items.map((i) => (i.lineId === id ? { ...i, quantity: i.quantity + 1 } : i))
          : [
              ...get().items,
              {
                lineId: id,
                productSlug: product.slug,
                offerId: offer.id,
                title: `${product.nameAr} — ${offer.title}`,
                subtitle: offer.subtitle,
                quantity: 1,
                units: offer.units,
                price: offer.price,
                compareAtPrice: offer.compareAt,
                image: product.image,
                isCrossSell: false,
                isUpsell: false,
                includes: offer.includes ?? [product.slug],
              },
            ];
        const item = next.find((i) => i.lineId === id)!;
        set({ items: next, isCartOpen: true, isMobileNavOpen: false, reservedUntil: ensureTimer(get().reservedUntil) });
        trackEvent("AddToCart", {
          value: item.price,
          contents: [{ id: product.slug, quantity: item.units, item_price: item.price, name: product.nameAr }],
        });
      },

      addCrossSellItem: (product) => {
        if (slugsInCart(get().items).has(product.slug)) return;
        const offerId = `crosssell-${product.slug}`;
        const id = lineId(product.slug, offerId, true);
        const next: CartItem[] = [
          ...get().items,
          {
            lineId: id,
            productSlug: product.slug,
            offerId,
            title: `${product.nameAr} — عرض تكميلي`,
            subtitle: product.crossSellNote,
            quantity: 1,
            units: 1,
            price: product.crossSellPrice,
            compareAtPrice: product.price,
            image: product.image,
            isCrossSell: true,
            isUpsell: false,
            includes: [product.slug],
          },
        ];
        set({ items: next, reservedUntil: ensureTimer(get().reservedUntil) });
        trackEvent("AddToCart", {
          value: product.crossSellPrice,
          contents: [{ id: product.slug, quantity: 1, item_price: product.crossSellPrice, name: product.nameAr }],
        });
      },

      setQty: (lineId, quantity) => {
        if (quantity < 1) {
          set({ items: get().items.filter((i) => i.lineId !== lineId) });
          return;
        }
        set({ items: get().items.map((i) => (i.lineId === lineId ? { ...i, quantity } : i)) });
      },

      removeItem: (lineId) => set({ items: get().items.filter((i) => i.lineId !== lineId) }),

      openCart: () => set({ isCartOpen: true, isMobileNavOpen: false }),
      closeCart: () => set({ isCartOpen: false }),

      openCheckoutFromCart: () => {
        const items = get().items;
        if (!items.length) return;
        set({ isCartOpen: false, isCheckoutOpen: true });
        trackEvent("InitiateCheckout", { value: cartValue(items), contents: contentsOf(items) });
      },

      closeCheckout: () => set({ isCheckoutOpen: false }),

      setActiveOrderAndOpenUpsell: (order) => {
        set({
          isCheckoutOpen: false,
          isUpsellOpen: true,
          activeOrder: toActive(order, get().items),
        });
      },

      closeUpsell: () => set({ isUpsellOpen: false }),

      markOrderConfirmed: (order) => {
        const prev = get().activeOrder;
        set({
          isUpsellOpen: false,
          activeOrder: null,
          lastConfirmedOrder: {
            id: order.id,
            orderNumber: order.order_number,
            customerName: order.customer_name,
            customerPhone: order.customer_phone_local,
            totalMad: order.total_mad,
            eventId: order.event_id,
            items: prev?.items ?? get().items,
            upsellOffer: null,
          },
          items: [],
          reservedUntil: null,
        });
      },

      clearCart: () => set({ items: [], reservedUntil: null }),
      setMobileNav: (open) => set({ isMobileNavOpen: open, isCartOpen: open ? false : get().isCartOpen }),
    }),
    {
      name: "kd-cart",
      partialize: (s) => ({ items: s.items, reservedUntil: s.reservedUntil, lastConfirmedOrder: s.lastConfirmedOrder }),
    },
  ),
);

export function selectCount(items: CartItem[]) {
  return items.reduce((s, i) => s + i.quantity, 0);
}

export function selectTotal(items: CartItem[]) {
  return cartValue(items);
}
