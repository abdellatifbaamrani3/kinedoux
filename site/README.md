# Kinédoux site

Static store for [kinedoux.com](https://kinedoux.com). Arabic is the default. French is under `/fr/`. One product landing page: **Kinédoux Lumba** at `/lumba/`.

The build is plain HTML, one CSS block, and a small script for the order form. Upload the `dist/` folder to Hostinger. Nothing needs Node on the server.

Prices in the page today: **499 درهم** for one, **849 درهم** for two. Delivery is free. The customer pays when the parcel is in their hand. Exchange is free for 14 days.

The copy stays on comfort, support, and a light stretch. It does not say the belt treats a disease.

## Edit text and prices

Open `src/data/products/lumba.ts`.

- Arabic text is in the `ar` block. French text is in the `fr` block.
- `offers` holds the two prices. `compareAt` is the crossed-out price. Set it to `null` if you do not have a real previous price.
- Reviews are placeholders. Replace the name, the city, and the sentence, and swap the dashed photo box when you have a real customer photo. Do not publish the example lines as if they were real reviews.

Shared labels (buttons, form, footer, thank-you) are in `src/data/ui.ts`. Cities are in `src/data/cities.ts`. The home page line is in `src/data/home.ts`.

## Swap images

1. Put the new photo in `frontend/public/images/lumba/` (or point `scripts/images.mjs` at your folder).
2. Run `npm run images`.
3. If you add or rename a file, update the imports at the top of `src/data/products/lumba.ts`.

The script writes AVIF and WebP at 400, 800, and 1200 pixels wide, each under 100 KB. The hero is preloaded. Other images load when the visitor reaches them.

## Add a product page

1. Copy `src/data/products/lumba.ts` to a new file, for example `src/data/products/posta.ts`.
2. Change `slug`, `id`, prices, images, and both languages.
3. Add one line in `src/data/products/index.ts`:

```ts
import { posta } from './posta';
export const products = [lumba, posta];
```

A page appears at `/posta/` and `/fr/posta/`. Set `featured: true` only if it should also show on the home page.

## Webhook and Meta pixel

Edit `src/config.ts`.

```ts
webhookUrl: 'https://script.google.com/macros/s/XXXX/exec',
pixelId: '123456789012345',
```

Then build again.

The form posts JSON the existing Google Sheet script already understands (`order_number`, `customer_name`, `customer_phone_local`, `customer_phone_e164`, `items_summary`, `total_mad`, `city_and_address`, `event_id`, …).

- A Google Apps Script URL is sent once in `no-cors` mode, because that host does not answer the browser’s CORS check. A second try would write the row twice.
- Any other URL (n8n, for example) is a normal `POST`. If it fails, the script tries once more. n8n must answer with CORS headers and status 200.
- The phone field accepts `06` / `07` and ten digits, or `+212`.
- A hidden fax field and a short wait (2.5 seconds) drop instant bot submits. There is no reCAPTCHA.
- The order is stored in `localStorage` until the send resolves. If both tries fail, the customer sees an error and the copy stays on the phone. It is not sent again on the next visit, so a row that actually arrived is not duplicated.

Leave `webhookUrl` empty until the URL is real. The form will not tell the customer the order was sent.

### Pixel events

The pixel file loads on `window` `load`, after the page is up. Until then, events sit in a queue.

| Event | When | event id |
|---|---|---|
| PageView | Every page | New id per page |
| ViewContent | Lumba page | New id |
| InitiateCheckout | First tap or focus in the order form | New id |
| Lead | Thank-you page, once per order | `event_id` in the webhook |
| Purchase | Thank-you page, once per order | `purchase_event_id` in the webhook |

A refresh of the thank-you page does not send Lead or Purchase again. Opening `/thank-you/` directly does not send them at all.

For cash on delivery, optimize the ad on **Lead** or on **Purchase**, not on both. Lead is the order placed. The money is collected later, at the door.

### Conversions API later

The webhook body already carries what a server event needs to match the browser event:

- `event_id` for Lead, `purchase_event_id` for Purchase
- `fbp`, `fbc` (and `fbclid` is stored in the `_fbc` cookie when the ad link has it)
- `client_user_agent`, `page_url`, `customer_phone_e164`, `customer_name`, `value`, `currency`

In n8n, hash the phone with SHA-256 before you send it to Meta. Use the same event name and the same event id the browser used. That is the deduplication.

## The video

Export a short phone clip of the five pumps: MP4, H.264, no sound, under 2 MB. Save it as:

```
site/public/video/lumba.mp4
```

Rebuild. The page shows a poster. The file downloads only after the visitor taps play. Nothing autoplays.

## Build

```bash
cd site
npm install
npm run build
```

Output: `site/dist/`. Check weights with `npm run budget`.

Local preview: `npm run preview`, then open `http://127.0.0.1:4321/lumba/`.

## Lab check (this build)

Lighthouse mobile, simulated Slow 4G, on `http://127.0.0.1:4321/lumba/` (local preview, not Hostinger):

| | |
|---|---|
| Performance | 100 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| LCP | 1.0 s |
| CLS | 0 |
| Total blocking time | 0 ms |
| Max potential FID | 20 ms |

Lab Lighthouse does not report INP. Total blocking time and max potential FID are the lab stand-ins, and both are far under 200 ms. The order script is about 3 KB gzipped. Hostinger’s real TTFB will be higher than the local preview (the lab document arrived in about 10 ms).

The page transferred about 54 KB on that run: the HTML, the hero AVIF, the order script, three nearby photos, and the icon. Above the fold is the HTML plus the hero, roughly 18 KB.

## Upload to Hostinger (File Manager)

1. In hPanel, open **Websites → kinedoux.com → File Manager**.
2. Open `public_html`. Delete old site files you are replacing. Keep nothing that would override `index.html` (an old `default.php`, for example).
3. On your computer, open `site/dist`. Select **everything inside** `dist`, including the hidden `.htaccess`. Upload that into `public_html`. Do not upload the folder named `dist` itself. `index.html` must sit directly in `public_html`.
4. In File Manager settings, show hidden files and confirm `.htaccess` is there.
5. In hPanel, turn **SSL** on for `kinedoux.com`. The `.htaccess` sends `http` and `www` to `https://kinedoux.com` in one jump.
6. Open `https://kinedoux.com/lumba/` on a phone. Place a test order. Confirm the row in the sheet, then open the thank-you page once and check Meta Test Events.

What the server rules do:

- HTML is cached for about 5 minutes, so a new text change shows up quickly.
- Files in `/_astro/` (CSS, JS, images with hashed names) are cached for one year.
- Gzip is on. Brotli is on only if the host has the module.

## Upload with Git (optional)

Hostinger’s Git deploy needs a plan that can run Node **at build time**. The live site still has no Node process.

1. Push this repo to GitHub.
2. In hPanel, **Advanced → Git**, connect the repo.
3. Build command: `cd site && npm ci && npm run build`
4. Publish directory: `site/dist`

If the plan cannot run Node, build on your computer and use File Manager. That path is the reliable one.

## Page list

| URL | Page |
|---|---|
| `/` | Home, Arabic |
| `/lumba/` | Lumba order page |
| `/thank-you/` | After a successful order. Not in the sitemap |
| `/privacy/` `/terms/` `/contact/` | Static pages |
| `/fr/…` | The same pages in French |
