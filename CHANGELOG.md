# 📋 Changelog

Historial de cambios en Express Delivery Wash.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es/) y el versionamiento sigue [Semantic Versioning](https://semver.org/lang/es/).

---

## [1.0.0] - 2026-05-12

### ✨ Added (MVP Completado)

- ✅ **Landing Page** con hero, servicios y calculadora de precios
- ✅ **Formulario de Pedido** con:
  - Geocoding en tiempo real (Nominatim)
  - Validación de cobertura (15 km)
  - Cálculo automático de despacho y descuentos
  - Mapa interactivo (Leaflet + OpenStreetMap)
- ✅ **Sistema de Pedidos**:
  - Almacenamiento en Firestore
  - Validación de datos en servidor
  - Estado: pendiente → procesando → completado
- ✅ **Notificaciones por Email**:
  - EmailJS integrado
  - Emails automáticos al dueño
  - Información completa del pedido
- ✅ **Chatbot IA**:
  - Claude Haiku 4.5 (Anthropic API)
  - Sistema de escalación automática
  - FAQ completa sobre servicios
  - Widget flotante en todas las páginas
- ✅ **Panel Administrativo**:
  - Tabla de pedidos con filtros
  - Cambio de estado en tiempo real
  - Sin autenticación (MVP protegido por obscuridad)
- ✅ **Deploy en Cloud Run**:
  - GitHub Actions para CI/CD
  - Dockerfile multistage
  - Artifact Registry (GCP)
- ✅ **Diseño Responsivo**:
  - Tailwind CSS
  - shadcn/ui components
  - Mobile-first
- ✅ **Documentación Completa**:
  - README con setup
  - Arquitectura del proyecto
  - API Reference
  - Guía de troubleshooting

### 🔧 Technical Stack

```
Frontend:    Next.js 14 • React 18 • TypeScript • Tailwind CSS • shadcn/ui
Backend:     Next.js API Routes • Node.js
Database:    Firebase Firestore
Maps:        Leaflet • OpenStreetMap • Nominatim
AI:          Anthropic Claude Haiku 4.5
Email:       EmailJS REST API
Deployment:  GitHub Actions • Docker • GCP Cloud Run
```

### 💰 Costo Mensual

| Servicio | Costo |
|----------|-------|
| Cloud Run | $0 (free tier) |
| Firestore | $0 (free tier) |
| Artifact Registry | $0 (free tier) |
| EmailJS | $0 (200 emails/mes) |
| Nominatim/OSM | $0 |
| Claude Haiku | ~$1.20/mes |
| **TOTAL** | **~$1.20 USD** |

---

## [1.0.1] - 2026-05-12

### 🐛 Fixed

- **CRÍTICO**: Agregado `NEXT_PUBLIC_BASE_URL` en Dockerfile
  - Causaba: Pedidos no se guardaban, emails no se enviaban
  - Solución: Variable env para internal API calls
  - Commit: 2b12645

### 📚 Added

- Documentación completa del proyecto
  - README.md mejorado
  - docs/setup-local.md (new)
  - docs/api.md (new)
  - docs/troubleshooting.md (new)
  - ROADMAP.md con 13 mejoras planificadas
  - CONTRIBUTING.md (new)
  - CHANGELOG.md (new)

- GitHub Issues automatizados (13 total)
  - P0: Stabilidad (3 issues)
  - P1: UX & Contenido (3 issues)
  - P2: Seguridad (3 issues)
  - P3: Monetización (4 issues)

### 📝 Changed

- Estructura de documentación reorganizada
- Secretos de GitHub expandidos (9 total)
- Deploy notes para rastrear fixes

---

## [Unreleased] - Próximas Versiones

### 🔴 P0: Stabilidad (próximas 3 sesiones)

- [ ] #1: Validación & Logging de Pedidos
- [ ] #2: EmailJS Debugging & Notificaciones mejorado
- [ ] #3: Cloud Run Observability & Error Tracking

### 🟠 P1: UX & Contenido (próximas 3 sesiones)

- [ ] #4: Imágenes & Brand Assets
- [ ] #5: Entrenamiento & Mejora del Chatbot
- [ ] #6: FAQ & Documentación Mejorada

### 🟡 P2: Seguridad (próximas 3 sesiones)

- [ ] #7: Firestore Security Rules & Protección de Datos
- [ ] #8: Rate Limiting & DDoS Mitigation
- [ ] #9: CORS, HTTPS & Headers de Seguridad

### 🟢 P3: Monetización (próximas 4 sesiones)

- [ ] #10: Carrito Persistente & Mejora de UX
- [ ] #11: Integración Stripe para Pagos
- [ ] #12: Descuentos Dinámicos & Promociones
- [ ] #13: Analytics & Dashboard Mejorado

---

## 🏗️ Arquitectura

```
express-wash/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── page.tsx            # Landing (/)
│   │   ├── pedido/page.tsx     # Formulario (/pedido)
│   │   ├── admin/page.tsx      # Admin panel (/admin)
│   │   ├── api/                # API routes
│   │   │   ├── geo/route.ts    # Geocoding
│   │   │   ├── order/route.ts  # Crear pedido
│   │   │   ├── notify/route.ts # Email notification
│   │   │   └── chat/route.ts   # Chatbot
│   │   └── layout.tsx          # Layout global
│   ├── components/             # React components
│   │   ├── Hero.tsx
│   │   ├── ServiciosGrid.tsx
│   │   ├── CalculadoraPedido.tsx
│   │   ├── MapaCobertura.tsx
│   │   ├── MapaInner.tsx
│   │   ├── ChatbotWidget.tsx
│   │   ├── PedidosTable.tsx
│   │   ├── Footer.tsx
│   │   └── ui/                 # shadcn/ui
│   └── lib/                    # Lógica compartida
│       ├── types.ts            # TypeScript types
│       ├── utils.ts            # Utilidades (Haversine, etc.)
│       ├── faq.ts              # FAQ base
│       ├── chatbot-config.ts   # Chatbot config
│       └── firestore.ts        # Firebase helpers
├── public/                     # Static assets
├── docs/                       # Documentación
├── Dockerfile                  # Build multistage
├── docker-compose.yml          # (opcional)
├── .github/workflows/
│   └── deploy.yml              # CI/CD
├── ROADMAP.md                  # Mejoras planificadas
└── package.json
```

---

## 🎯 Hitos Completados

### MVP (1.0.0) ✅

- [x] Landing page funcional
- [x] Formulario de pedidos
- [x] Almacenamiento en Firestore
- [x] Notificaciones por email
- [x] Chatbot con Claude Haiku
- [x] Admin panel básico
- [x] Deploy en Cloud Run
- [x] Documentación

### Post-MVP (En progreso)

- [ ] Tests unitarios e integración
- [ ] Mejora de UX con imágenes
- [ ] Hardening de seguridad
- [ ] Stripe payments
- [ ] Analytics

---

## 📞 Versionamiento

**Semantic Versioning (MAJOR.MINOR.PATCH):**

- **MAJOR** (1.0.0): Cambios incompatibles
- **MINOR** (1.1.0): Nuevas features (compatible)
- **PATCH** (1.0.1): Bug fixes (compatible)

---

## 🔗 Referencias

- [GitHub Repo](https://github.com/nfigueroaa/express-wash)
- [Firebase Console](https://console.firebase.google.com/project/expresswash-prod-202605112332)
- [Cloud Run](https://console.cloud.google.com/run)
- [Roadmap](ROADMAP.md)
- [Setup Local](docs/setup-local.md)

---

**Última actualización:** 2026-05-12  
**Versión Actual:** 1.0.1  
**Próxima:** 1.1.0 (P0: Stabilidad)
