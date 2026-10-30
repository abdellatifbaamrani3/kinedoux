# 03 — 12/10 CRO ARCHITECTURE, UI/UX BLUEPRINT & PAGE WIREFRAMES

## 1. Global Layout & RTL Design Rules

### 1.1 Document Direction (`dir="rtl"`)
The entire application renders in **Arabic Right-to-Left (`<html lang="ar" dir="rtl">`)**.
- In CSS Flexbox and Grid under `dir="rtl"`:
  - The **first child** of a `flex-row` appears on the **Right**.
  - The **last child** of a `flex-row` appears on the **Left**.

### 1.2 Top Announcement Bar (Sticky above Header)
- Background: `#11221A` (Deep Forest Charcoal), Text: `#F8F7F4` with `#C8A96E` gold highlights.
- Copy: `🇲🇦 توصيل مجاني وسريع (24-48 ساعة) لجميع مدن المغرب | الدفع عند الاستلام بعد فحص الكولية | ضمان استبدال 14 يوماً`

### 1.3 Header Wireframe (Exact User Specification)
In `dir="rtl"`, the Header (`sticky top-0 z-40 bg-[#F8F7F4]/95 backdrop-blur-md border-b border-[#1E4D3B]/10`) is structured from **Right to Left** as follows:

```text
+---------------------------------------------------------------------------------------------------+
| [ (KD)  كينيدو   ]          [ الرئيسية | منتجاتنا | لومبا | بوسطا | كالما | قصتنا | اتصل بنا ]     [ 🛍️ سلتي (2) ] |
| [      kenidoux ]                                                                                 |
+---------------------------------------------------------------------------------------------------+
  ^ RIGHT SIDE (Start of RTL)                 ^ CENTER MENU                             ^ LEFT SIDE (End of RTL)
```

- **Logo Component (`<BrandLogo />`) on the Right**:
  - Flex container (`flex items-center gap-3`):
  - **Element 1 (Rightmost)**: Circle (`w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#1E4D3B] border-2 border-[#C8A96E] flex items-center justify-center shadow-sm`) containing the text **`KD`** (`text-[#F8F7F4] font-bold text-base md:text-lg tracking-wider font-sans`).
  - **Element 2 (Immediately to the left of the `KD` circle)**: Vertical flex container (`flex flex-col items-start leading-none`):
    - **Top Text**: **`كينيدو`** (`text-xl md:text-2xl font-extrabold text-[#11221A] tracking-tight`).
    - **Bottom Text**: **`kenidoux`** (`text-[11px] md:text-xs font-semibold text-[#1E4D3B] tracking-[0.22em] lowercase font-sans mt-0.5`).
- **Navigation Menu in the Center**:
  - Desktop horizontal links (`hidden lg:flex items-center gap-7 text-sm font-bold text-[#11221A]`).
  - Active/hover state: `#1E4D3B` with underline indicator.
- **Cart Trigger on the Left**:
  - Button (`flex items-center gap-2 bg-[#1E4D3B] text-white px-4 py-2.5 rounded-full hover:bg-[#163A2C] transition`) with bag icon, item count badge (`bg-[#C8A96E] text-[#11221A] font-extrabold rounded-full px-2 py-0.5 text-xs`), and label `سلتي`. Clicking opens `<CartDrawer />`.

---

## 2. Desktop Alternating Sections Rule (Z-Pattern Visual Flow)

**CRITICAL REQUIREMENT:** On Desktop (`lg:` breakpoint and above), content sections that combine persuasive copy and visual proof on the **Home Page**, **Product Landing Pages**, and **About Us Page** MUST alternate their horizontal layout:

- **Odd Sections (Section 1, Section 3,Hero)**:
  - **Right Column (50%)**: Persuasive Arabic Heading, Emotional/Scientific Copy, Bullet Points, and CTA.
  - **Left Column (50%)**: High-resolution Product / Clinical / Lifestyle Sample Image with floating authority badge.
- **Even Sections (Section 2, Section 4)**:
  - **Right Column (50%)**: High-resolution Sample Image / Diagram.
  - **Left Column (50%)**: Persuasive Arabic Heading, Scientific/Ingredients Copy, Bullet Points, and CTA.
- **On Mobile (`< lg`)**:
  - Always stack vertically in a logical reading order (Image first or Heading -> Image -> Copy -> CTA) using Tailwind's `flex-col lg:flex-row` and `flex-col lg:flex-row-reverse`.

---

## 3. Sample Images System (Easy to Swap Later)

Because real studio/UGC photos will be swapped in later, the AI coder must build a clean centralized image map in `frontend/src/data/images.ts` with local SVG/WebP clinical-styled sample images (or high-craft generated SVG illustrations stored in `public/images/`) so every image slot looks rich, branded, and intentional right now:
- **Home Hero Image**: `public/images/hero-kenidoux-collection.svg` (Shows all 3 Kinédoux products in a parapharmacie clinical setting).
- **Each Product Page (`كينيدو لومبا`, `كينيدو بوسطا`, `كينيدو كالما`) MUST have 4 Gallery Images**:
  1. `main.svg` — Studio Hero Shot with packaging & French-Moroccan parapharmacie badge
  2. `mechanism.svg` — Biomechanical Action / Anatomy Diagram (Air columns / Smart Angle Sensor / 42°C Thermal Cupping)
  3. `lifestyle.svg` — Daily Moroccan Usage Context (Driving / Office / Evening Home Relaxation)
  4. `kit-contents.svg` — Full Box Contents & Included Free Bonuses ("شنو كيجي فالكولية")
- Plus 3 alternating section images per product (`section-1.svg`, `section-2.svg`, `section-3.svg`).

---

## 4. Reusable High-CRO Product Card (`<ProductCard />`)

Used on the **Home Page**, **Collection Page**, and **Related Products** section. Every `<ProductCard />` must include:
1. **Top Image Container**:
   - Aspect ratio `aspect-[4/3]` or `aspect-square`, rounded corners, subtle hover zoom.
   - **Top-Right Badge**: Category / Authority badge (e.g., `الأكثر مبيعاً في المغرب`).
   - **Bottom-Right Scarcity Pill**: Warm coral badge (`🔥 باقي 7 قطع فقط`).
2. **Star Rating & Social Proof Row**:
   - 5 Gold Stars (`★★★★★`) + Rating (`4.9`) + Verified review count (`(1,428 تقييم موثق)`).
3. **Heading & Subheading**:
   - **Heading**: Bold Arabic name + hook (e.g., `كينيدو لومبا — الحزام الهوائي لتمديد وراحة أسفل الظهر`).
   - **Subheading**: 2-line emotional & functional summary explaining the benefit.
4. **Offer & Price Highlight Box**:
   - Current Price (`499 د.م`) + Strike-through price (`699 د.م`) + Savings badge (`وفّر 200 د.م`).
   - Bundle teaser pill: `💡 عرض 2 قطع بـ 849 د.م متوفر بالداخل` + `توصيل مجاني`.
5. **Dual Action Area**:
   - **Primary CTA Button**: `اطلب الآن — الدفع عند الاستلام` (Links to `/products/[slug]` OR has quick-add to open Cart Drawer).
   - **Secondary Link**: `اكتشف التفاصيل والعروض ←` (Navigates to `/products/[slug]`).

---

## 5. Page-by-Page Structure & Section Blueprint

### 5.1 Home Page (`/`) — 10 High-Converting Sections
1. **Hero Section (Desktop: Text Right / Image Left)**:
   - Trust pill: `✨ العلامة المتخصصة رقم 1 في راحة الظهر والوقفة بالمغرب`
   - Main Headline: `تخلّص من عيا وثقل الظهر، الكتاف والرقبة في 15 دقيقة يومياً — من دارك وبمعايير البارافارماسي`
   - Subheadline: `حلول هندسية وميكانيكية مصممة للسائقين، الموظفين، الأمهات والوالدين. توصيل مجاني 24-48 ساعة والدفع حتى تفحص الكولية فيدك.`
   - Primary CTA (`اكتشف منتجات كينيدو الثلاثة`) + Secondary WhatsApp/Guarantee reassurance + 4 micro-trust icons below CTA.
   - Left Side: Hero visual showcasing **كينيدو لومبا**, **كينيدو بوسطا**, and **كينيدو كالما** with clinical callouts.
2. **Authority & Certifications Bar**:
   - 4 Columns: `معايير CE & ISO-13485` | `ضمان استبدال مجاني 14 يوماً` | `توصيل مجاني 24-48 ساعة` | `الدفع عند الاستلام وفحص الطرد`.
3. **The 3 Flagship Products Showcase Grid (`منتجات كينيدو المتخصصة`)**:
   - Displays all 3 products (`كينيدو لومبا`, `كينيدو بوسطا`, `كينيدو كالما`) using the full CRO `<ProductCard />`.
4. **Alternating Section 1 (Desktop: Text Right / Image Left) — The Daily Moroccan Struggle**:
   - Speaks to the emotional pain of sitting 8 hours in a taxi/car, working at a desk, or standing all day at home, and why ignoring spinal compression ruins sleep, prayer, and family time.
5. **Alternating Section 2 (Desktop: Text Left / Image Right) — Biomechanical Science vs. Cheap Knockoffs**:
   - Explains why `Kinédoux™` uses vertical air traction (`29 columns`), smart bio-feedback sensors, and `42°C` controlled thermal cupping instead of cheap market elastic straps.
6. **Materials & "Ingredients" Quality Showcase (`تشريح الجودة والخامات الطبية`)**:
   - Visual grid highlighting the 4 core materials across the Kinédoux line (`TPU طبي عالي الكثافة`, `نسيج Aero-Mesh مضاد للتعرق`, `مستشعر الزاوية الذكي`, `شريحة الحرارة الثابتة 42°C`).
7. **Complete Bundle Banner (`باقة كينيدو الشاملة — الراحة المتكاملة للعائلة`)**:
   - High-AOV feature block offering all 3 products together (`لومبا + بوسطا + كالما`) for `890 د.م` instead of `1,427 د.م`, with a 1-click **"أضف الباقة الكاملة للسلة"** button that adds the bundle and opens the Cart Drawer.
8. **Moroccan Video / UGC & Written Reviews Section (`آراء وتجارب المغاربة مع كينيدو`)**:
   - 3 Video/UGC style preview cards ("تجربة سي محمد سائق مهني فالدار البيضاء", "تجربة سناء موظفة بالرباط", "أحسن هدية للواليد فمراكش") + 6 verified written reviews with city badges.
9. **Interactive FAQ & Parapharmacie Transparency Accordion**.
10. **Bottom Risk-Reversal Guarantee Section**: `جرّب كينيدو لمدة 14 يوماً بدون أي مخاطرة`.

---

### 5.2 Dedicated Product Landing Page (`/products/[slug]`) — 12/10 DTC Funnel

Every one of the 3 products (`kenidoux-lumba`, `kenidoux-posta`, `kenidoux-calma`) gets this complete landing page layout:

#### Above the Fold (Desktop: Product Details & Offer Selector on Right / 4-Image Gallery on Left):
1. **Gallery (4 Sample Images)**:
   - Large active image with clinical badge + 4 clickable thumbnails below (`الصورة الرئيسية`, `التقنية العلمية`, `طريقة الاستعمال`, `محتويات العلبة`).
2. **Product Header & Authority Block**:
   - Category pill + `★★★★★ 4.9 (1,428 تقييم موثق)`
   - Product Title (`كينيدو لومبا`) + Latin Subtitle (`Kinédoux Lumba™`)
   - Emotional & Functional Subheading
   - Live Scarcity Box: `🔴 يشاهد هذا المنتج الآن 24 شخصاً — باقي 7 قطع فقط في مخزون الدار البيضاء`
3. **High-AOV Tiered Offer Selector (`اختر العرض المناسب لك ولعائلتك`)**:
   - 3 interactive radio cards (Tier 1: 1 Unit, Tier 2: 2 Units "الأكثر طلباً — واحد ليك وواحد للواليد/الواليدة" pre-selected by default for maximum AOV, Tier 3: 3 Units / Complete Kit).
   - Shows exact price, compare-at price, savings badge (`وفّر 549 د.م`), and included free gifts.
4. **Main Conversion CTA Button**:
   - Large, high-contrast button (`bg-[#1E4D3B] hover:bg-[#163A2C] text-white text-lg font-extrabold py-4 px-6 rounded-xl shadow-lg w-full flex items-center justify-center gap-3`):
   - Text: **`أضف للسلة واطلب الآن — الدفع عند الاستلام (499 د.م)`** *(dynamically reflects the selected offer price)*.
   - **EXACT BEHAVIOR**: Clicking this CTA **adds the selected offer tier to the cart AND immediately opens the `<CartDrawer />`** so the customer sees their selected offer and the In-Cart Cross-Sells!
5. **Under-CTA Trust Micro-Badges**:
   - `✔ الدفع عند الاستلام` | `✔ توصيل مجاني 24-48 ساعة` | `✔ ضمان استبدال 14 يوماً` | `✔ فحص الكولية قبل الدفع`.

#### Below the Fold (Product Landing Page Persuasion Architecture):
6. **Alternating Section 1 (Desktop: Text Right / Image Left)** — *Emotional Pain & Daily Life Transformation*.
7. **Alternating Section 2 (Desktop: Text Left / Image Right)** — *Biomechanical Science & Clinical Mechanism*.
8. **Alternating Section 3 (Desktop: Text Right / Image Left)** — *Materials & "Ingredients" Engineering Breakdown*.
9. **"شنو كيجي فالكولية ديالك؟" (What's Inside Your Kinédoux Box)**: Visual value-stack checklist showing the device + free accessories + printed Darija/French routine guide.
10. **Comparison Table (`علاش تختار كينيدو عوض المنتجات العادية فالسوق؟`)**:
    - 5 criteria comparing **كينيدو الأصلي (`Kinédoux™`)** (`✔ خامات طبية CE`, `✔ دليل استعمال بالدارجة`, `✔ ضمان استبدال 14 يوم`, `✔ وصلة توسيع مجانية`, `✔ مراقبة جودة فالدار البيضاء`) vs. **المنتجات المقلدة الرخيصة** (`❌ بلاستيك رديء كيتنفس`, `❌ بدون ضمان`, `❌ مقاس صغير ومزعج`).
11. **How to Use in 3 Simple Steps (`طريقة الاستعمال في 3 خطوات بسيطة`)**.
12. **Customer Reviews & Rating Breakdown + Parapharmacie FAQ Accordion**.
13. **Sticky Bottom Bar on Mobile**: Displays selected offer price + **"اطلب الآن — الدفع عند الاستلام"** button that triggers the same Add-to-Cart + Open Cart Drawer action.

---

## 6. The 3-Step High-AOV Checkout & Upsell Funnel

### Step A: Slide-Over Cart Drawer (`<CartDrawer />`)
Triggered automatically whenever the user clicks a Product Page CTA or clicks the Header Cart icon:
1. **Header**: `سلة طلباتك من كينيدو` + Close (`X`) button + Reservation Timer (`⏳ طلبك محجوز مع التوصيل المجاني لمدة 09:48`).
2. **Free Shipping Progress Bar**: `🎉 مبروك! حصلت على توصيل سريع ومجاني + هدية دليل الروتين اليومي`.
3. **Cart Items List**: Shows the added product/offer tier, image, unit/tier price, savings badge, quantity/+/- or remove button.
4. **In-Cart Cross-Sells Block (`🔥 عروض تكميلية بنصف الثمن — تُشحن مع طلبك مجاناً`)**:
   - Displays the 2 complementary Kinédoux products not yet in the cart (e.g., **كينيدو كالما** at `+199 د.م` instead of `349 د.م`, and **كينيدو بوسطا** at `+249 د.م`).
   - Users can click **`+ أضف للسلة`** to immediately add the cross-sell into the cart OR click the product title/thumbnail to view its page.
5. **Cart Footer & Primary CTA**:
   - Shows Subtotal, Shipping (`مجاني 0 د.م`), Total (`المجموع شامل التوصيل`), and **"إتمام الطلب الآن — الدفع عند الاستلام"** button.
   - **EXACT BEHAVIOR**: Clicking the Cart CTA closes the drawer (or overlays) and opens the **Checkout Popup Modal (`<CheckoutPopupModal />`)** while firing the `InitiateCheckout` pixel/CAPI event.

---

### Step B: 2-Field Checkout Popup Modal (`<CheckoutPopupModal />`)
A fast, friction-free modal designed for maximum COD conversion:
1. **Top Trust & Scarcity Header**:
   - Title: `إتمام الطلب السريع — الدفع عند الاستلام`
   - Scarcity & Social Proof Banner: `⚡ باقي عدد محدود للشحن اليوم | ⭐ +18,500 زبون مغربي يثقون في كينيدو`
2. **Compact Order Summary Box**:
   - Lists all items in the cart + quantities + `التوصيل: مجاني (0 د.م)` + Total Amount in bold (`المبلغ الإجمالي عند الاستلام: XXX د.م`).
3. **Strictly 2 Input Fields**:
   - **Field 1 — الاسم الكامل (`Full Name`)**:
     - Label: `الاسم الكامل *`
     - Placeholder: `أدخل اسمك الكامل (مثال: محمد العلمي)`
     - Validation: Minimum 3 characters, non-empty.
   - **Field 2 — رقم الهاتف (`Phone Number`)**:
     - Label: `رقم الهاتف لتأكيد الطلب *`
     - Placeholder: `05XXXXXXXX أو 06XXXXXXXX` (`dir="ltr"` input alignment for digits)
     - **Phone Validation Rules (Important — Supports Valid KSA & Moroccan Numbers)**:
       - Convert any Eastern Arabic numerals (`٠١٢٣٤٥٦٧٨٩`) to Western digits (`0123456789`) and strip spaces/dashes automatically as the user types.
       - Validate against clean regex supporting:
         - **Valid KSA mobile numbers**: `^(?:\+?966|00966|0)?5[0-9]{8}$` (e.g., `0512345678`, `+966512345678`, `512345678`)
         - **Valid Moroccan mobile numbers**: `^(?:\+?212|00212|0)?[67][0-9]{8}$` (e.g., `0612345678`, `0712345678`, `+212612345678`)
         - *(Configurable via `NEXT_PUBLIC_PHONE_VALIDATION_MODE` env variable: defaults to `BOTH` or `KSA` / `MA` so neither KSA test numbers nor Moroccan customer numbers ever fail).*
       - Show a green checkmark (`✔ رقم هاتف صحيح`) once valid, and keep the submit button disabled or show a clear Arabic helper error (`يرجى إدخال رقم هاتف صحيح يبدأ بـ 05 أو 06/07 مكون من 10 أرقام`) if invalid.
4. **Checkout Submit CTA**:
   - Button: **`تأكيد الطلب الآن — الدفع عند الاستلام`**
   - **EXACT BEHAVIOR**:
     1. Immediately sends `POST /api/v1/orders` to the FastAPI backend to save the order in PostgreSQL (`status="pending_upsell"`).
     2. Immediately switches the modal to **Step C: The 10–15 Second One-Click Upsell Screen (`<UpsellCountdownModal />`)**.

---

### Step C: 10–15 Second One-Click Upsell Modal (`<UpsellCountdownModal />`)
Displayed for **15 seconds** right after the customer submits the 2-field checkout form:
1. **Progress Bar & Live Countdown (`15s -> 0s`)**:
   - Animated progress bar shrinking over 15 seconds + badge: `⏳ ينتهي هذا العرض الحصري خلال 00:12 ثانية`.
2. **Relevant Product Upsell Card**:
   - Displays the relevant complementary product (e.g., **`كينيدو كالما — جهاز الكاسات الحرارية الذكية`** if they bought `لومبا` or `بوسطا`, or **`كينيدو بوسطا`** if they already have `كالما`).
   - Special One-Time Add-on Price: **`+199 د.م فقط`** *(بدل 349 د.م — شحن مجاني في نفس الكولية)*.
3. **Two Actions**:
   - **Action 1 (Accept Upsell — One Click, No Re-typing Info)**:
     - Button: `🎁 نعم! أضف العرض لطلبي بنفس الشحنة (+199 د.م)`
     - Calls `POST /api/v1/orders/{order_id}/upsell` with `{ accepted: true, upsell_product_slug: "kenidoux-calma" }`.
     - Backend updates order total & items in PostgreSQL, fires Google Sheets Webhook + `Purchase` CAPI with the new higher total, and frontend redirects to `/thank-you?order_id={order_id}`.
   - **Action 2 (Decline OR 15-Second Timer Expires Automatically)**:
     - Button: `لا شكراً، أريد إكمال طلبي الحالي فقط`
     - When clicked OR when the countdown reaches `0`: calls `POST /api/v1/orders/{order_id}/upsell` with `{ accepted: false }`.
     - Backend finalizes the order (`status="confirmed"`), fires Google Sheets Webhook + `Purchase` CAPI, and frontend redirects to `/thank-you?order_id={order_id}`.
   - *(Safety Net: The FastAPI backend also schedules an async 20-second fallback timer when the order is first created so if the customer closes their browser tab during the 15-second upsell window, the backend still finalizes the order and sends it to the Google Sheet webhook automatically!)*
