# Stage 1: Instalar dependencias
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Build de la aplicación
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de build-time (NEXT_PUBLIC_* se inyectan aquí)
ARG NEXT_PUBLIC_FIREBASE_CONFIG
ARG NEXT_PUBLIC_BASE_LAT
ARG NEXT_PUBLIC_BASE_LON
ARG NEXT_PUBLIC_EMAILJS_SERVICE_ID
ARG NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
ARG NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

ENV NEXT_PUBLIC_FIREBASE_CONFIG=$NEXT_PUBLIC_FIREBASE_CONFIG
ENV NEXT_PUBLIC_BASE_LAT=$NEXT_PUBLIC_BASE_LAT
ENV NEXT_PUBLIC_BASE_LON=$NEXT_PUBLIC_BASE_LON
ENV NEXT_PUBLIC_EMAILJS_SERVICE_ID=$NEXT_PUBLIC_EMAILJS_SERVICE_ID
ENV NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=$NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
ENV NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=$NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

RUN npm run build

# Stage 3: Runner de producción (imagen mínima)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Copiar solo los artefactos del build standalone
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 8080
CMD ["node", "server.js"]
