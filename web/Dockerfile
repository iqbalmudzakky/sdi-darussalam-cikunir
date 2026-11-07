# Konteks build: folder web/ (bukan akar repo).
#
# Urutan tahap sengaja begini: dependensi jarang berubah, kode sering. Dengan
# package.json disalin lebih dulu, deploy harian hanya mengirim ulang lapisan
# kode — bukan seluruh node_modules.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build tidak menyentuh database: halaman publik dirender saat diminta, bukan
# saat build (lihat app/page.tsx). Jadi tahap ini tidak butuh DATABASE_URL.
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    TZ=Asia/Jakarta

# Berjalan sebagai user biasa. UID 1001 dipakai juga saat menyiapkan izin
# folder unggahan di server — berkas yang ditulis container jadi milik UID ini.
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# /robots.txt dipilih karena dirender server tapi TIDAK menyentuh database:
# healthcheck yang ikut mati saat database bermasalah akan membuat container
# di-restart terus-menerus, memperburuk keadaan alih-alih menunjukkannya.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/robots.txt').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
