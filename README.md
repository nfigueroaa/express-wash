# 🧺 Express Delivery Wash

[![Deploy to Cloud Run](https://img.shields.io/badge/Deploy-Cloud%20Run-4285F4?logo=google-cloud&logoColor=white)](https://cloud.google.com/run)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Claude AI](https://img.shields.io/badge/Claude-Haiku%204.5-D97706)](https://anthropic.com/)

> **Lavandería a domicilio en Santiago, Chile** — Retiro y entrega en 24–48 horas con chatbot de IA, mapa de cobertura y panel de administración.

---

## 🚀 Demo

[Ver aplicación en producción](https://express-wash-XXXXX.run.app) *(actualizar con URL real)*

---

## ✨ Funcionalidades

| Feature | Descripción |
|---------|-------------|
| 🏠 **Landing Page** | Hero, grid de servicios y calculadora de precios interactiva |
| 📦 **Formulario de Pedido** | Geocoding con Nominatim, mapa Leaflet, cálculo de despacho |
| 🤖 **Chatbot IA** | Washi — asistente con Claude Haiku 4.5, FAQ completa, escalación automática |
| 📊 **Panel Admin** | Tabla de pedidos con filtros y cambio de estado en tiempo real |
| 📧 **Notificaciones** | Email automático al dueño vía EmailJS en cada pedido nuevo |
| 🗺️ **Mapas** | Leaflet + OpenStreetMap (sin API keys, 100% gratuito) |

---

## 🛠️ Stack Técnico

```
Frontend:  Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui
Base datos: Firebase Firestore (client SDK, sin Admin SDK)
Mapas:     Leaflet + OpenStreetMap + Nominatim geocoding
IA:        Claude Haiku 4.5 via Anthropic API (fetch directo)
Email:     EmailJS (200 emails/mes gratis)
Deploy:    GitHub Actions → Docker multistage → GCP Cloud Run
```

---

## 💰 Costo mensual estimado: ~$1.20 USD

| Servicio | Free Tier | Costo |
|----------|-----------|-------|
| Cloud Run | 2M requests/mes | $0 |
| Firestore | 50K reads, 20K writes/día | $0 |
| Artifact Registry | 0.5 GB | $0 |
| EmailJS | 200 emails/mes | $0 |
| Nominatim/OSM | Sin límite | $0 |
| Claude Haiku 4.5 | — | ~$1.20/mes |

---

## 🏃 Setup Local

### Requisitos
- Node.js 20+
- npm 10+

### 1. Clonar e instalar

```bash
git clone https://github.com/nfigueroaa/express-wash.git
cd express-wash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.local.example .env.local
```

Editar `.env.local` con tus valores reales (ver sección de variables más abajo).

### 3. Ejecutar en desarrollo

```bash
npm run dev
# → http://localhost:3000
```

---

## 🔐 Variables de Entorno

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `NEXT_PUBLIC_FIREBASE_CONFIG` | Build-time | JSON del SDK de Firebase |
| `NEXT_PUBLIC_BASE_LAT` | Build-time | Latitud base (-33.4489) |
| `NEXT_PUBLIC_BASE_LON` | Build-time | Longitud base (-70.6693) |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | Build-time | ID del servicio EmailJS |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` | Build-time | ID del template EmailJS |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | Build-time | Public Key de EmailJS |
| `ANTHROPIC_API_KEY` | Runtime | API key de Anthropic (solo server) |
| `OWNER_EMAIL` | Runtime | Email del dueño para notificaciones |

> Las variables `NEXT_PUBLIC_*` se inyectan en **build time** vía Docker ARGs.
> Las otras son variables de **runtime** en Cloud Run.

---

## 🐳 Build Docker Local

```bash
docker build \
  --build-arg NEXT_PUBLIC_FIREBASE_CONFIG='{"apiKey":"..."}' \
  --build-arg NEXT_PUBLIC_BASE_LAT=-33.4489 \
  --build-arg NEXT_PUBLIC_BASE_LON=-70.6693 \
  --build-arg NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxx \
  --build-arg NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xxx \
  --build-arg NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxx \
  -t express-wash-local .

docker run -p 8080:8080 \
  -e ANTHROPIC_API_KEY=sk-ant-... \
  -e OWNER_EMAIL=tu@email.com \
  express-wash-local
```

---

## 🚀 Deploy

El deploy es **automático** con cada push a `main`:

```
git push origin main
→ GitHub Actions build Docker image
→ Push a Artifact Registry (southamerica-west1)
→ Deploy a Cloud Run
```

### GitHub Secrets requeridos (9 total)

| Secret | Descripción |
|--------|-------------|
| `GCP_SA_KEY` | JSON de la service account de GCP |
| `ANTHROPIC_API_KEY` | API key de Anthropic |
| `NEXT_PUBLIC_FIREBASE_CONFIG` | Configuración Firebase |
| `NEXT_PUBLIC_BASE_LAT` | Latitud base |
| `NEXT_PUBLIC_BASE_LON` | Longitud base |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | EmailJS service ID |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` | EmailJS template ID |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | EmailJS public key |
| `OWNER_EMAIL` | Email del dueño |

---

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── pedido/page.tsx       # Formulario de pedido
│   ├── admin/page.tsx        # Panel admin
│   └── api/
│       ├── chat/route.ts     # Chatbot Claude Haiku
│       ├── order/route.ts    # Crear pedido en Firestore
│       ├── geo/route.ts      # Geocoding Nominatim
│       └── notify/route.ts   # Notificación EmailJS
├── components/
│   ├── Hero.tsx
│   ├── ServiciosGrid.tsx
│   ├── CalculadoraPedido.tsx
│   ├── MapaCobertura.tsx     # dynamic import (sin SSR)
│   ├── MapaInner.tsx         # Leaflet real
│   ├── ChatbotWidget.tsx     # Chat flotante
│   ├── PedidosTable.tsx      # Admin table
│   └── Footer.tsx
└── lib/
    ├── types.ts              # TypeScript types + PRECIOS
    ├── utils.ts              # Haversine, formatCLP, etc.
    ├── faq.ts                # Base de conocimiento chatbot
    ├── chatbot-config.ts     # System prompt + escalación
    └── firestore.ts          # Firebase client helpers
```

---

## 📖 Documentación

- [Arquitectura](docs/arquitectura.md)
- [Diseño del Chatbot](docs/chatbot-design.md)
- [Guía de Deploy](docs/deployment.md)
- [Errores y Aprendizajes](docs/errores-y-aprendizajes.md)

---

## 🙏 Créditos

Construido con [Claude Code](https://claude.ai/code) como asistente de desarrollo.

Mapa: [OpenStreetMap](https://www.openstreetmap.org/) contributors · Geocoding: [Nominatim](https://nominatim.org/)
