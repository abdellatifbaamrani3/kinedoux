FROM node:20-alpine AS base

# Stage 1: Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

# Stage 2: Build Next.js application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time NEXT_PUBLIC_ variables (can be passed as build args in EasyPanel or runtime config)
ARG NEXT_PUBLIC_SITE_URL=https://kinedoux.com
ARG NEXT_PUBLIC_API_URL=https://api.kinedoux.com
ARG NEXT_PUBLIC_PHONE_VALIDATION_MODE=MA
ARG NEXT_PUBLIC_WHATSAPP_NUMBER=212600000000
ARG NEXT_PUBLIC_META_PIXEL_ID=""
ARG NEXT_PUBLIC_TIKTOK_PIXEL_ID=""
ARG NEXT_PUBLIC_SNAP_PIXEL_ID=""
ARG NEXT_PUBLIC_CURRENCY=MAD
ARG NEXT_PUBLIC_UPSELL_TIMER_SECONDS=15

ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_PHONE_VALIDATION_MODE=$NEXT_PUBLIC_PHONE_VALIDATION_MODE
ENV NEXT_PUBLIC_WHATSAPP_NUMBER=$NEXT_PUBLIC_WHATSAPP_NUMBER
ENV NEXT_PUBLIC_META_PIXEL_ID=$NEXT_PUBLIC_META_PIXEL_ID
ENV NEXT_PUBLIC_TIKTOK_PIXEL_ID=$NEXT_PUBLIC_TIKTOK_PIXEL_ID
ENV NEXT_PUBLIC_SNAP_PIXEL_ID=$NEXT_PUBLIC_SNAP_PIXEL_ID
ENV NEXT_PUBLIC_CURRENCY=$NEXT_PUBLIC_CURRENCY
ENV NEXT_PUBLIC_UPSELL_TIMER_SECONDS=$NEXT_PUBLIC_UPSELL_TIMER_SECONDS
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Stage 3: Production runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
