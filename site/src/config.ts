/**
 * The only place for the pixel, the order webhook, and the public contact details.
 * Edit these, then run `npm run build` again.
 *
 * webhookUrl examples:
 *   Google Apps Script web app ending in /exec
 *   n8n production webhook
 * Leave "" until you have the URL. The form will not pretend an order was sent.
 *
 * pixelId: the numeric dataset id from Meta Events Manager. Leave "" until you have it.
 */
export const site = {
  url: 'https://kinedoux.com',
  name: 'Kinédoux',
  nameAr: 'كينيدو',
  webhookUrl: '',
  pixelId: '',
  email: 'contact@kinedoux.com',
  /** Digits only, country code, no plus. Local display: 0640392534. */
  whatsapp: '212640392534',
  /** Shown on the contact page. */
  phoneDisplay: '0640392534',
  videoSrc: '/video/lumba.mp4',
} as const;

export type Lang = 'ar' | 'fr';

export function localizePath(path: string, lang: Lang): string {
  const clean = path.endsWith('/') ? path : `${path}/`;
  if (lang === 'ar') return clean;
  if (clean === '/') return '/fr/';
  return `/fr${clean}`;
}
