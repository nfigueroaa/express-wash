# Express Delivery Wash — Charla Técnica

## La Idea en 30 Segundos

Lancé una lavandería a domicilio online en Santiago usando Next.js 14 + Firebase porque quería 
probar si podía construir un negocio real con código. Resultado: MVP funcional en producción por 
**~$1.20 USD/mes** (chatbot inteligente incluido). No es un proyecto académico — es un servicio 
que atiende clientes reales en tiempo real.

**Link a producción:** https://express-wash-4hgom7r2cq-tl.a.run.app

---

## El Stack y Por Qué Cada Tecnología

### Frontend: Next.js 14 + Tailwind CSS + Dark+Indigo

**Por qué:** 
- Server Components + API routes integradas = menos fricción que Express separado
- SSR + SSG en el mismo proyecto = rendering flexible
- `next/image` + `next/font` = optimización automática
- Output `standalone` = Docker minimal

**Alternativa rechazada:** SvelteKit (bonito, pero comunidad más pequeña + menos librerías)

### Base de datos: Firebase Firestore

**Por qué:**
- Client SDK permite crear pedidos sin backend separado (security rules hacen la validación)
- Real-time listeners para admin panel (cambios en pedidos = UI actualizada al instante)
- Free tier: 25k lecturas/día (suficiente para MVP)
- Escala automática — sin gestión de servidores

**Alternativa rechazada:** Supabase (más control PostgreSQL, pero necesitas backend admin + más mantenimiento)

### Mapas: Leaflet + OpenStreetMap + Nominatim

**Por qué:**
- 100% gratuito (Leaflet, OpenStreetMap, Nominatim geocoding)
- Sin API keys (privacidad usuario, sin trusts de datos sensibles)
- Geocoding: "Miraflores 123" → coordenadas en <500ms

**Alternativa rechazada:** Google Maps (requiere tarjeta crédito, ~$7/1000 requests, overkill para MVP)

### IA: Claude Haiku 4.5

**Por qué:**
- ~$1.20 USD/mes en usage (Haiku es ~10x más barato que GPT-4)
- Suficientemente inteligente para FAQ en español
- 500ms latencia → chatbot responde en tiempo real
- System prompt = no necesita fine-tuning

**Alternativa rechazada:** Gemini Flash (10x más barato aún, pero agrega complejidad de nueva API + menos precisión en español)

### Deploy: GCP Cloud Run

**Por qué:**
- Escala a cero (no pagas si nadie está usando la app)
- 2M requests/mes gratis (suficiente para ~100 pedidos/semana)
- Docker simple (standalone Next.js output)
- Región `southamerica-west1` disponible (datos en Chile)
- GitHub Actions integración nativa

**Alternativa rechazada:** Vercel (excelente para frontend puro, pero Node-only, región sur limitada)

---

## Los Errores Reales (y qué Aprendí)

### ❌ Error 1: GCR vs Artifact Registry

**Qué se intentó:**
Deploy a Google Container Registry (`gcr.io/project/app`)

**La realidad:**
El proyecto usa Artifact Registry en `southamerica-west1`. El deploy fallaba porque el registry 
no existía bajo ese nombre.

**Impacto:** 
30 minutos debugueando credenciales de Docker en GitHub Actions.

**La solución:**
```yaml
# ❌ Incorrecto
IMAGE: gcr.io/express-wash-prod/express-wash

# ✅ Correcto  
IMAGE: southamerica-west1-docker.pkg.dev/expresswash-prod-202605112332/express-wash/express-wash
gcloud auth configure-docker southamerica-west1-docker.pkg.dev
```

**Lección:** 
Validar PROJECT_ID y registry ANTES de escribir CI/CD. Los nombres que parecen obvios muchas veces 
no coinciden con lo real.

---

### ❌ Error 2: next.config.mjs vs next.config.js

**Qué se intentó:**
`create-next-app@14` genera `next.config.mjs` (ESM) por defecto.

**El problema:**
La config con `output: 'standalone'` + webpack aliases necesita CommonJS (`module.exports`) 
para funcionar bien en Docker multistage. El `.mjs` puede romper transpilePackages.

**La solución:**
Usar `next.config.js` con `module.exports`.

**Lección:** 
CommonJS es más seguro que ESM en configuraciones de build complejas.

---

### ❌ Error 3: Leaflet en SSR

**El problema:**
`window is not defined` durante el build si Leaflet se importa directamente en un componente 
que puede ejecutarse en el servidor.

**La solución:**
```tsx
// MapaCobertura.tsx — wrapper con dynamic import
const MapaInner = dynamic(() => import('./MapaInner'), { ssr: false });

// MapaInner.tsx — componente real con 'use client'
'use client';
import 'leaflet/dist/leaflet.css'; // seguro aquí porque solo corre en cliente
```

**Lección:** 
Next.js 14 Server Components + bibliotecas de browser no juegan bien juntas. 
`dynamic({ ssr: false })` + `'use client'` es tu amigo.

---

### ❌ Error 4: Firebase Doble Inicialización

**El problema:**
En Next.js con hot reload, el módulo `firestore.ts` se ejecuta múltiples veces. 
`initializeApp()` llamado dos veces lanza `Firebase App named '[DEFAULT]' already exists`.

**La solución:**
```typescript
if (getApps().length === 0) {
  initializeApp(config);
}
```

**Lección:** 
Siempre chequear estado antes de inicializar singletons en frameworks con hot reload.

---

### ❌ Error 5: NEXT_PUBLIC_BASE_URL Vacía en Docker

**Qué se intentó:**
Deployar sin definir `NEXT_PUBLIC_BASE_URL` en el Dockerfile builder stage.

**El problema:**
Variables `NEXT_PUBLIC_*` se compilan en **BUILD TIME**. Si faltan en el `ARG`, resultan 
`undefined` en el binario. Los pedidos se guardaban, pero `/api/notify` fallaba silenciosamente 
porque no tenía URL para webhooks/emails.

**La solución:**
```dockerfile
ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_BASE_URL="${NEXT_PUBLIC_BASE_URL}"
RUN npm run build
```

Y en deploy.yml:
```yaml
docker build --build-arg NEXT_PUBLIC_BASE_URL="" -t $IMAGE .
```

**Lección:** 
Aunque sea vacía, una variable `NEXT_PUBLIC_*` debe existir explícitamente. 
Next.js es silencioso cuando compila variables undefined.

---

### ❌ Error 6: Typo en NEXT_PUBLIC_BASE_LON

**Síntoma:**
El mapa cargaba, pero el círculo de cobertura (15 km) estaba centrado en el **océano Pacífico**, 
no en Santiago.

**La causa:**
`NEXT_PUBLIC_BASE_LON=-70.69` vs `-70.6693`. Pequeña diferencia que = decenas de km en la realidad.

**La solución:**
Validar contra Google Maps antes de fijar:
```env
NEXT_PUBLIC_BASE_LAT=-33.4489      # Santiago, Chile
NEXT_PUBLIC_BASE_LON=-70.6693
NEXT_PUBLIC_BASE_RADIUS=15         # km
```

**Lección:** 
Coordenadas se ven similares. Incluso 0.02° = error de km. Siempre cross-check con 
herramientas online.

---

### ❌ Error 7: CSS Variables Duplicadas en globals.css

**Síntoma:**
Durante el redesign Dark+Indigo, colores aplicaban inconsistentemente. Algunos componentes 
índigo, otros magenta. Tailwind creaba conflictos.

**La causa:**
Migración de sistema viejo (`--magenta-*`) a nuevo (`--indigo-*`) sin consolidar. El archivo 
tenía variables duplicadas en múltiples puntos del bloque `:root`.

**La solución:**
Un **único bloque `:root`**, ordenado por familia:

```css
:root {
  /* Dark+Indigo */
  --indigo-bg: #09090f;
  --indigo-surface: #111128;
  --indigo-primary: #c0c1ff;
  --indigo-btn: #2e3192;
  --indigo-lavender: #6d4ca6;
  --indigo-tertiary: #60b1ea;
  
  /* Accents */
  --cta: #E91E63; /* SOLO featured CTA */
  
  /* Fonts */
  --font-montserrat: 'Montserrat', sans-serif;
  --font-inter: 'Inter', sans-serif;
}
```

**Lección:** 
CSS Cascade es poderoso, pero duplicados la rompen. Una fuente de verdad para tokens.

---

## Arquitectura en un Diagrama

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE WEB (Next.js)                     │
├─────────────────────────────────────────────────────────────┤
│ GET  /              → Landing (Hero + BentoGrid + Features) │
│ GET  /pedido        → Formulario + Mapa + Geocoding         │
│ GET  /admin         → Tabla pedidos real-time (Firestore)   │
│ GET  /api/*         → Routes de backend                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────┼─────────────────────┐
        ↓                     ↓                     ↓
   ┌─────────┐          ┌──────────┐          ┌──────────┐
   │ Firebase │          │ EmailJS  │          │  Claude  │
   │ Firestore│          │ Webhooks │          │  Haiku   │
   │ (pedidos)│          │ (notif)  │          │ (chat)   │
   └─────────┘          └──────────┘          └──────────┘
        ↓                     ↓                     ↓
   pedidos:                emails:             respuestas:
   - id, address           - order created     - FAQ español
   - status                - order ready       - escalación
   - timestamp             - order pickup      - humor

        ┌──────────────────────────┐
        │  API Routes (Next.js)     │
        ├──────────────────────────┤
        │ /api/geo       → Nominatim geocoding
        │ /api/order     → CREATE pedido Firestore
        │ /api/notify    → POST EmailJS webhook
        │ /api/chat      → POST Claude Haiku
        └──────────────────────────┘
                      ↓
        ┌──────────────────────────┐
        │   GCP Cloud Run (deploy)  │
        │  standalone Next.js build │
        │  región: southamerica-west1
        └──────────────────────────┘
```

---

## Datos Reales: Costo, Build Time, Usuarios

### Costo Mensual Estimado

```
┌─────────────────────────────────────────────┐
│ COSTO TOTAL: ~$1.20 USD/mes                │
├─────────────────────────────────────────────┤
│ Claude Haiku 4.5:     ~$1.20 (Prompts)     │
│ Firebase Firestore:   $0.00 (free tier)    │
│ Cloud Run:            $0.00 (free tier)    │
│ EmailJS:              $0.00 (free tier)    │
│ Nominatim/OSM:        $0.00 (gratuito)     │
│ Google Fonts:         $0.00 (CDN gratis)   │
└─────────────────────────────────────────────┘

Comparativa: Una taza de café ☕ al mes
```

### Tiempo a MVP

```
Investigación + setup:  3 horas
Implementación:        15 horas (spread over 1 semana)
Deploy inicial:         45 min
Debugging + fixes:      2 horas
─────────────────────────────────
TOTAL:                 ~20 horas
```

### Usuarios (Proyección Realista)

```
Estado actual (2026-05-13):  0 users (MVP recién en vivo)
Meta mes 1:                  5-10 pedidos/semana
Meta mes 3:                  20+ pedidos/semana
Meta mes 6:                  100+ pedidos/semana (si hay traction)
```

---

## Qué Haría Diferente Hoy

### 1️⃣ Tests desde el día 1
Agregué tests DESPUÉS de funcionalidad. Mejor: test-driven development desde cero.
```typescript
// Test antes de componente
test('BentoGrid debe renderizar 2 cards', () => {
  render(<BentoGrid />);
  expect(screen.getAllByRole('article')).toHaveLength(2);
});
```

### 2️⃣ Documentación paralela
Escribí README DESPUÉS. Mejor: docs mientras codeo (tipo ADR — Architecture Decision Records).

### 3️⃣ Validación de mercado ANTES de código
Construí primero, pregunté después. Mejor: entrevistas con potenciales clientes → validar 
si quieren esto antes de invertir tiempo.

### 4️⃣ Componentes más granulares
BentoGrid y FeaturesSection podrían dividirse en subcomponentes reutilizables. 
Props demasiadas, lógica demasiada.

### 5️⃣ Logging estructurado desde cero
Cloud Run logs ayudaron tarde. Mejor: Winston o Pino desde day 1 + structured logging 
para correlacionar requests.

```typescript
// Mejor que console.log()
logger.info('order_created', {
  orderId,
  address,
  totalPrice,
  timestamp: new Date(),
  userAgent: req.headers['user-agent'],
});
```

---

## Demo Points (Si Das Esta Charla)

1. **Landing Page en vivo**
   - Mostrar Dark+Indigo design en móvil + desktop
   - BentoGrid (2 cards), FeaturesSection, PricingCards
   - Animaciones suaves sin JavaScript pesado

2. **Geocoding en vivo**
   - Escribir dirección: "Miraflores 123, Santiago"
   - Mapa gira, centra, dibuja círculo de cobertura (15 km)
   - Nominatim busca, OpenStreetMap renderiza

3. **Crear pedido**
   - Rellenar formulario
   - Ver en tiempo real en Firestore admin panel

4. **Chatbot inteligente**
   - "¿Qué servicios ofrecen?"
   - Claude Haiku responde en español natural (~500ms)

5. **Admin panel**
   - Tabla pedidos con estatus
   - Cambiar estado en vivo → UI se actualiza (real-time listeners)

6. **Production URL**
   - Abrir https://express-wash-4hgom7r2cq-tl.a.run.app
   - Mostrar Lighthouse score, Core Web Vitals

---

## Preguntas Frecuentes

### ¿Por qué Haiku y no GPT-4?
Haiku es ~10x más barato ($0.80/1M tokens vs $15/1M), suficientemente inteligente para 
FAQ en español, y responde en <500ms. GPT-4 sería overkill (y moriría mi presupuesto ☠️).

### ¿Y si Firestore se cae?
99.95% SLA — rara de ver caída. Pero tengo backup manual semanal a Cloud Storage 
(costo: ~$0.01 por export).

### ¿Cómo monitoreas bugs en producción?
```
gcloud run logs read express-wash --limit=50
# + alertas automáticas si error_rate > 5%
# + ChatbotWidget captura escalaciones ("esto no funciona → ticket automático")
```

### ¿Competencia?
- **Directo:** Lavaderías tradicionales sin online
- **Indirecto:** Lavaseco.cl (más caro, sin inteligencia)
- **Diferenciador:** Same-day, IA FAQ, cobertura barrios no servidos

### ¿Cuánta gente puede escalar a soportar?
```
Cloud Run: autoscale a 1000+ instancias concurrentes
Firestore: 25k lecturas/día free → ~100k con pago
Haiku: ~1000 prompts/min (prácticamente ilimitado)

→ Bottleneck: logística (cuántos clientes puede recoger), 
  no tecnología
```

### ¿Código open source?
No — es propiedad del negocio. Pero escribo posts técnicos 
sobre el stack en Medium.

---

## Lectura Recomendada

- [Next.js App Router Docs](https://nextjs.org/docs)
- [Firebase Firestore Best Practices](https://firebase.google.com/docs/firestore)
- [Leaflet Documentation](https://leafletjs.com)
- [Claude API Docs](https://docs.anthropic.com)
- `docs/errores-y-aprendizajes.md` (en este repo) — errores reales + soluciones

---

**Última actualización:** 2026-05-14  
**Tipo de documento:** Charla técnica, Medium post, Portfolio  
**Audiencia:** Devs, emprendedores tech, potenciales inversores/clientes  
**Duración estimada de charla:** 45 min (20 min talk + 25 min demo + Q&A)