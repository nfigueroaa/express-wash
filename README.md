# 🧺 Express Delivery Wash

[![Deploy to Cloud Run](https://img.shields.io/badge/Deploy-Cloud%20Run-4285F4?logo=google-cloud&logoColor=white)](https://cloud.google.com/run)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Claude AI](https://img.shields.io/badge/Claude-Haiku%204.5-D97706)](https://anthropic.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Lavandería a domicilio en Santiago, Chile** — Plataforma web moderna para retiro y entrega de ropa en 24–48 horas, con:
- 🤖 Chatbot IA (Claude Haiku 4.5) para consultas
- 🗺️ Mapa interactivo de cobertura con Leaflet + OpenStreetMap
- 💬 Notificaciones en tiempo real vía EmailJS
- 📊 Panel de administración para gestionar pedidos
- ⚡ Precio: ~$1.20 USD/mes (free tier completo)

---

## 🚀 Demo en Vivo

👉 **[express-wash-4hgom7r2cq-tl.a.run.app](https://express-wash-4hgom7r2cq-tl.a.run.app)**

**Puntos de entrada:**
- Landing: `/`
- Hacer pedido: `/pedido`
- Admin panel: `/admin`
- Chatbot: Disponible en toda la app (esquina inferior derecha)

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

### Build-time (inyectadas en Docker build)
| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_FIREBASE_CONFIG` | JSON completo de Firebase SDK | `{"apiKey":"...","projectId":"expresswash-prod-..."}` |
| `NEXT_PUBLIC_BASE_LAT` | Latitud de cobertura base | `-33.4489` (Santiago centro) |
| `NEXT_PUBLIC_BASE_LON` | Longitud de cobertura base | `-70.6693` |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | ID del servicio EmailJS | `service_abc123xyz` |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` | ID del template EmailJS | `template_abc123xyz` |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | Public key de EmailJS | `abc123xyz_public` |
| `NEXT_PUBLIC_BASE_URL` | URL base para internal API calls | `` (vacío = usar mismo dominio) |

### Runtime (configuradas en Cloud Run)
| Variable | Descripción | Sensibilidad |
|----------|-------------|--------------|
| `ANTHROPIC_API_KEY` | API key de Anthropic (server-only) | 🔴 **SECRETA** |
| `OWNER_EMAIL` | Email del dueño para notificaciones | 🟡 **PRIVADA** |

> ⚠️ **Nota importante:** Las variables `NEXT_PUBLIC_*` se inyectan en **build time** vía Docker ARGs y se compilarán en el bundle público. Las variables de **runtime** se pasan como environment variables de Cloud Run y NO se exponen al cliente.

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

## ✅ Testing

### Tests locales
```bash
# Ejecutar todos los tests
npm run test

# Tests en modo watch
npm run test:watch

# Coverage
npm run test:coverage
```

### Testing manual
1. **Landing Page** — Verificar UI en desktop/mobile
2. **Geocoding** — Buscar "Miraflores, Santiago" en `/pedido`
3. **Pedido** — Crear pedido completo, verificar en Firestore
4. **Email** — Confirmar que EmailJS envia notificación
5. **Chatbot** — Probar preguntas sobre servicios, cobertura, precios
6. **Admin** — Cambiar estado de pedidos en `/admin`

---

## 🔍 Troubleshooting

### "Los pedidos no se guardan"
1. Verificar que Firestore está conectado (Firebase Console)
2. Ver logs: `npm run logs` (si está en Cloud Run)
3. Revisar `/api/order` en Network tab del navegador

### "Los emails no llegan"
1. Verificar EmailJS dashboard: https://dashboard.emailjs.com
2. Revisar que `NEXT_PUBLIC_EMAILJS_*` estén correctos
3. Ver error en `/api/notify` logs

### "El mapa no se carga"
1. Verificar que Leaflet CSS está importado en `MapaInner.tsx`
2. Ver si hay errores en console (F12)
3. Revisar que Nominatim responde: `curl https://nominatim.openstreetmap.org/search?q=Santiago`

### "Cloud Run returns 500 error"
1. Ver logs en Cloud Console: `gcloud run logs read express-wash --limit 50`
2. Verificar que todas las env vars están configuradas
3. Revisar que Docker build es exitoso: `docker build ...`

→ **Ver más:** [Troubleshooting Guide](docs/troubleshooting.md)

---

## 🤝 Contributing

### Flujo de trabajo
1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/mi-feature`
3. Haz cambios y tests
4. Commit: `git commit -m "feat: descripción"`
5. Push: `git push origin feature/mi-feature`
6. Abre PR contra `main`

### Estándares
- TypeScript strict mode
- Componentes con `'use client'` cuando sea necesario
- Tomar en cuenta CSS en Tailwind (ver `src/styles/globals.css`)
- Actualizar `CHANGELOG.md` con cambios

→ **Ver más:** [Contributing Guide](CONTRIBUTING.md)

---

## 📚 Documentación Completa

| Documento | Contenido |
|-----------|----------|
| [Arquitectura](docs/arquitectura.md) | Diagrama de componentes, flujo de datos, decisiones técnicas |
| [Setup Local](docs/setup-local.md) | Instalación detallada, troubleshooting, desarrollo |
| [API Reference](docs/api.md) | Endpoints disponibles, request/response, error codes |
| [Chatbot Design](docs/chatbot-design.md) | Sistema de escalación, FAQ, entrenamientoç |
| [Deploy Guide](docs/deployment.md) | Cloud Run, GitHub Actions, CI/CD, rollback |
| [Troubleshooting](docs/troubleshooting.md) | Problemas comunes y soluciones |
| [Roadmap](ROADMAP.md) | Mejoras planificadas (P0-P3), timeline |
| [Changelog](CHANGELOG.md) | Historial de cambios y versiones |

---

## 📊 Estadísticas del Proyecto

```
Lines of Code:    ~3,500 (TypeScript/TSX)
Components:       12 principales
API Routes:       4 endpoints
Test Coverage:    En progreso (P0.1)
Performance:      Lighthouse ~85-90
Bundle Size:      ~200 KB (gzip)
Deployment Time:  ~5 min (GitHub Actions → Cloud Run)
Monthly Cost:     ~$1.20 USD
```

---

## 🛣️ Roadmap Futuro

**Fase actual:** P0 (Stabilidad) — Tests y logging  
**Próximo:** P1 (UX) — Imágenes y mejoras visuales

Ver [ROADMAP.md](ROADMAP.md) para detalles completos de todas las 13 mejoras planificadas.

---

## 📝 Licencia

[MIT](LICENSE) — Libre para usar, modificar y distribuir

---

## 🙏 Créditos

- **Desarrollo:** [Claude Code](https://claude.ai/code) (asistente IA)
- **Stack:** Next.js, TypeScript, Tailwind, Firebase, Anthropic
- **Maps:** [OpenStreetMap](https://www.openstreetmap.org/), [Nominatim](https://nominatim.org/)
- **Componentes UI:** [shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/)
- **Alojamiento:** [Google Cloud Run](https://cloud.google.com/run)

---

## 📞 Soporte

- **Issues:** [GitHub Issues](https://github.com/nfigueroaa/express-wash/issues)
- **Email:** [tu-email@example.com](mailto:hola@expressdeliverywash.cl)
- **WhatsApp:** [+56 9 4274 9703](https://wa.me/56942749703)

**Última actualización:** 2026-05-12  
**Versión:** 1.0.0-MVP
