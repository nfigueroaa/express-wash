# Arquitectura del Sistema

## Diagrama de Flujo

```
Cliente Web
    │
    ├── GET  /              → Landing (Hero + Servicios + Calculadora + Mapa)
    ├── GET  /pedido        → Formulario de pedido
    │       │
    │       ├── GET /api/geo?q=... → Nominatim → Haversine → GeoResult
    │       └── POST /api/order  → Firestore.addDoc("pedidos")
    │                               └── POST /api/notify → EmailJS API
    ├── GET  /admin         → PedidosTable → Firestore.getDocs("pedidos")
    └── POST /api/chat      → detectarEscalacion() → Claude Haiku API
```

## Stack y Por Qué

### Next.js 14 App Router
**Por qué**: Server components + API routes en el mismo proyecto. Standalone output para Docker.
**Alternativa descartada**: Express.js separado — más complejidad sin beneficio real para este caso.

### Firebase Client SDK (sin Admin SDK)
**Por qué**: Regla de oro de simplicidad. El cliente puede escribir/leer directamente con reglas de Firestore apropiadas. No necesitamos operaciones privilegiadas.
**Alternativa descartada**: Firebase Admin SDK — requiere secret management adicional.

### Leaflet + OpenStreetMap
**Por qué**: 100% gratuito, sin API keys, funciona con `dynamic({ ssr: false })` en Next.js.
**Alternativa descartada**: Google Maps — requiere tarjeta de crédito y API key.

### EmailJS (notificaciones)
**Por qué**: 200 emails/mes gratis. API REST simple, funciona server-side con fetch.
**Alternativa descartada**: Firebase Functions — agrega complejidad y costo de compute.

### Claude Haiku 4.5
**Por qué**: ~$1.20/mes para 50 conversaciones/día. `ANTHROPIC_API_KEY` ya configurado. System prompt en español chileno natural.
**Alternativa evaluada**: Gemini Flash 2.5 — 10x más barato pero agrega nuevo secret y API diferente.

### GCP Cloud Run
**Por qué**: Escala a cero, 2M requests/mes gratis, deploy con una imagen Docker.
**Región**: southamerica-west1 (São Paulo) — la más cercana a Chile disponible.

## Variables de Entorno: Build-time vs Runtime

Las `NEXT_PUBLIC_*` se compilan dentro del bundle JavaScript en build time.
Por eso el Dockerfile las declara como `ARG` → `ENV` *antes* del `RUN npm run build`.

Las variables sin `NEXT_PUBLIC_` (ANTHROPIC_API_KEY, OWNER_EMAIL) son solo para el servidor
y se pasan en runtime vía `--set-env-vars` en Cloud Run — nunca llegan al cliente.
