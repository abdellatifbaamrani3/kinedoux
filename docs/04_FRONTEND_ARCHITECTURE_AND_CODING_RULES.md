# 04 — FRONTEND ARCHITECTURE, LIBRARIES & CODING STANDARDS

## 1. Recommended Frontend Tech Stack (2026 DTC Best-in-Class)

| Layer | Technology / Library | Why It Is Chosen for `kenidoux.com` |
|---|---|---|
| **Framework** | **Next.js 15+ (App Router)** with `output: "standalone"` | Instant SSR/SSG page loads, optimal SEO/OpenGraph for Meta & TikTok crawlers, and tiny Docker image for EasyPanel |
| **Language** | **TypeScript 5+** (`strict: true`) | Zero runtime type errors across Cart, Offers, Upsells, and Pixel payloads |
| **Styling** | **Tailwind CSS v3.4 / v4** + Logical RTL utilities | Rapid, responsive RTL styling with customParapharmacie color tokens |
| **State Management** | **Zustand** (with `persist` middleware in `localStorage`) | Ultra-fast, lightweight state for Cart Drawer, Selected Offer Tiers, Checkout Modal, and 15s Upsell state |
| **Icons** | **Lucide React** (`lucide-react`) | Clean clinical, medical, delivery, and security icons |
| **Phone Parsing** | **`libphonenumber-js`** + Custom Regex Validator | Ensures bulletproof E.164 normalization (`+212...` / `+966...`) for TikTok, Meta, and Snapchat pixels |
| **Fonts** | `next/font/google` (`Cairo` for Arabic + `Plus Jakarta Sans` for `KD` & `kenidoux`) | Zero layout shift (CLS = 0), self-hosted automatically by Next.js |

---

## 2. Frontend Directory Structure (`frontend/`)

```text
frontend/
├── public/
│   └── images/
│       ├── hero-brand.svg
│       ├── products/
│       │   ├── lumba-1.svg
│       │   ├── lumba-2.svg
│       │   ├── lumba-3.svg
│       │   ├── lumba-4.svg
│       │   ├── posta-1.svg
│       │   ├── posta-2.svg
│       │   ├── posta-3.svg
│       │   ├── posta-4.svg
│       │   ├── calma-1.svg
│       │   ├── calma-2.svg
│       │   ├── calma-3.svg
│       │   └── calma-4.svg
│       └── badges/
│           ├── ce-iso.svg
│           └── guarantee-14d.svg
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root <html lang="ar" dir="rtl">, Fonts, Header, Footer, CartDrawer, Modals, DeferredPixels
│   │   ├── globals.css                # Tailwind imports, custom scrollbar, clinical animations
│   │   ├── page.tsx                   # Home Page (Hero, TrustBar, 3 Products, Alternating Sections, Science, Reviews, FAQ)
│   │   ├── collections/
│   │   │   └── page.tsx               # Collection Page (All 3 Products + Complete Kit Bundle + Comparison)
│   │   ├── products/
│   │   │   └── [slug]/
│   │   │       └── page.tsx           # Product Landing Page (Gallery, Offer Tiers, Alternating Sections, Science, Ingredients, Reviews)
│   │   ├── about/
│   │   │   └── page.tsx               # About Us Page (Kinédoux Story, Clinical Standards, Casablanca Hub)
│   │   ├── contact/
│   │   │   └── page.tsx               # Contact Us Page (WhatsApp Card, Contact Form, FAQ)
│   │   └── thank-you/
│   │       └── page.tsx               # Order Confirmation Page (Order Summary, Reference ID, WhatsApp Fast-Track, Purchase Pixel Trigger)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AnnouncementBar.tsx
│   │   │   ├── Header.tsx             # Right: KD Circle + كينيدو / kenidoux | Center: Menu | Left: Cart
│   │   │   └── Footer.tsx
│   │   ├── product/
│   │   │   ├── ProductCard.tsx        # Reusable high-CRO card with stars, scarcity, offer pills, CTA
│   │   │   ├── ProductGallery.tsx     # 4-image interactive gallery with thumbnails
│   │   │   ├── OfferTierSelector.tsx  # 1-unit, 2-unit (Most Popular), 3-unit selector
│   │   │   └── ProductLandingView.tsx # Full client/server hybrid product page view
│   │   ├── cart/
│   │   │   ├── CartDrawer.tsx         # Slide-over cart + Free shipping bar + Cross-sells + Checkout trigger
│   │   │   ├── CheckoutPopupModal.tsx # Order Summary + Scarcity + Social Proof + 2 Fields (Name & Valid Phone)
│   │   │   └── UpsellCountdownModal.tsx # 10-15s live timer + 1-click add to existing order
│   │   └── tracking/
│   │       └── PixelManager.tsx       # Deferred Meta, TikTok, Snapchat web pixels + CAPI relay
│   ├── data/
│   │   └── products.ts                # Complete typed dataset for كينيدو لومبا, كينيدو بوسطا, كينيدو كالما
│   ├── lib/
│   │   ├── api.ts                     # Fetch wrapper talking to NEXT_PUBLIC_API_URL
│   │   ├── phone.ts                   # Phone validation & E.164 normalization utility
│   │   └── tracking.ts                # Event ID generator, cookie reader (_fbp, _fbc, _ttp, _scid), pixel fire functions
│   └── store/
│       └── useCartStore.ts            # Zustand store managing Cart items, Drawer open state, Checkout modal, Active Order for Upsell
├── Dockerfile
├── .dockerignore
├── .env.example
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## 3. Core Component Implementation Rules

### 3.1 Header Logo Component (`Header.tsx`)
Ensure the logo strictly follows the user's specification:
```tsx
{/* Right side of RTL Header */}
<Link href="/" className="flex items-center gap-3 group">
  {/* KD inside a circle with the brand color */}
  <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#1E4D3B] border-2 border-[#C8A96E] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
    <span className="text-[#F8F7F4] font-bold text-base md:text-lg tracking-wider font-sans">
      KD
    </span>
  </div>
  {/* Next to it: Arabic logo text in good font, and below it English name kenidoux */}
  <div className="flex flex-col items-start justify-center leading-none">
    <span className="text-xl md:text-2xl font-extrabold text-[#11221A] tracking-tight">
      كينيدو
    </span>
    <span className="text-[11px] md:text-xs font-semibold text-[#1E4D3B] tracking-[0.22em] lowercase font-sans mt-1">
      kenidoux
    </span>
  </div>
</Link>
```

### 3.2 Phone Number Validator & Normalizer (`src/lib/phone.ts`)
The user specified: *"2 fields, name and phone number, only accept valid ksa numbers once they enter valid stuff"* in a Morocco COD store context.
To make sure **both** KSA numbers (`05XXXXXXXX` / `+9665XXXXXXXX`) and Moroccan numbers (`06XXXXXXXX` / `07XXXXXXXX` / `+2126XXXXXXXX`) work seamlessly (and can be locked to `KSA`, `MA`, or `BOTH` via `NEXT_PUBLIC_PHONE_VALIDATION_MODE`), implement `src/lib/phone.ts` exactly like this:

```typescript
export type PhoneValidationResult = {
  isValid: boolean;
  country: 'SA' | 'MA' | null;
  e164WithPlus: string;     // Used by TikTok Pixel & TikTok CAPI: e.g. "+966512345678" or "+212612345678"
  digitsOnlyNoPlus: string; // Used by Meta CAPI & Snapchat CAPI: e.g. "966512345678" or "212612345678"
  localDisplay: string;     // Clean local display: e.g. "0512345678" or "0612345678"
  errorMessage?: string;
};

// Converts Arabic/Persian numerals (٠١٢٣٤٥٦٧٨٩) to Western numerals (0123456789)
export function normalizeDigits(input: string): string {
  return input
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[\s\-\(\)\.]/g, '');
}

export function validateAndFormatPhone(rawInput: string): PhoneValidationResult {
  const mode = process.env.NEXT_PUBLIC_PHONE_VALIDATION_MODE || 'BOTH'; // 'KSA' | 'MA' | 'BOTH'
  const cleaned = normalizeDigits(rawInput.trim());

  // 1. Check KSA Format: 05XXXXXXXX, 5XXXXXXXX, +9665XXXXXXXX, 009665XXXXXXXX, 9665XXXXXXXX
  const ksaMatch = cleaned.match(/^(?:\+?966|00966|0)?(5[0-9]{8})$/);
  if (ksaMatch && (mode === 'KSA' || mode === 'BOTH')) {
    const subscriber = ksaMatch[1]; // 9 digits starting with 5
    return {
      isValid: true,
      country: 'SA',
      e164WithPlus: `+966${subscriber}`,
      digitsOnlyNoPlus: `966${subscriber}`,
      localDisplay: `0${subscriber}`,
    };
  }

  // 2. Check Morocco Format: 06XXXXXXXX, 07XXXXXXXX, +2126XXXXXXXX, 002126XXXXXXXX, 2126XXXXXXXX
  const maMatch = cleaned.match(/^(?:\+?212|00212|0)?([67][0-9]{8})$/);
  if (maMatch && (mode === 'MA' || mode === 'BOTH')) {
    const subscriber = maMatch[1]; // 9 digits starting with 6 or 7
    return {
      isValid: true,
      country: 'MA',
      e164WithPlus: `+212${subscriber}`,
      digitsOnlyNoPlus: `212${subscriber}`,
      localDisplay: `0${subscriber}`,
    };
  }

  return {
    isValid: false,
    country: null,
    e164WithPlus: '',
    digitsOnlyNoPlus: '',
    localDisplay: cleaned,
    errorMessage:
      mode === 'KSA'
        ? 'يرجى إدخال رقم جوال سعودي صحيح (مثال: 0512345678)'
        : 'يرجى إدخال رقم هاتف صحيح مكون من 10 أرقام (مثال: 0612345678 أو 0512345678)',
  };
}
```

### 3.3 Zustand Funnel State (`src/store/useCartStore.ts`)
The store must manage the entire high-AOV flow seamlessly:
- `items`: Array of cart items (each item tracks `productSlug`, `offerId`, `title`, `subtitle`, `quantity`, `price`, `compareAtPrice`, `image`, `isCrossSell`, `isUpsell`).
- `isCartOpen`: Boolean controlling `<CartDrawer />`.
- `isCheckoutOpen`: Boolean controlling `<CheckoutPopupModal />`.
- `isUpsellOpen`: Boolean controlling `<UpsellCountdownModal />`.
- `activeOrder`: Stores the order returned by `POST /api/v1/orders` (`orderId`, `orderNumber`, `customerName`, `customerPhone`, `totalMad`, `upsellOffer`) while the 10–15s countdown modal is active.
- `addOfferAndOpenCart(product, offer)`: Adds the chosen offer tier from the Product Page and immediately sets `isCartOpen: true` + fires `AddToCart` pixel & CAPI event.
- `addCrossSellItem(crossSellProduct)`: Adds the discounted cross-sell item inside the Cart Drawer and fires `AddToCart`.
- `openCheckoutFromCart()`: Sets `isCartOpen: false`, `isCheckoutOpen: true`, and fires `InitiateCheckout` pixel & CAPI event.

---

## 4. Performance & Core Web Vitals Rules
1. **Deferred Third-Party Pixels**: Never load `fbevents.js`, `events.js` (TikTok), or `scevent.min.js` (Snapchat) synchronously in `<head>`. Load them only after `window.requestIdleCallback` or a `2500ms` timeout / first user scroll/click so First Contentful Paint (FCP) and Largest Contentful Paint (LCP) happen in `< 1.0s`.
2. **Next.js Standalone Build**: Configure `output: 'standalone'` in `next.config.ts` so the production Docker container starts in milliseconds and consumes `< 120MB` RAM on EasyPanel.
