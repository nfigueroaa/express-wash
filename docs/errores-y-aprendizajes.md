# Errores y Aprendizajes
## (Para el artículo de Medium y charla técnica)

Este documento registra los errores reales del proyecto para compartirlos 
honestamente con la comunidad técnica.

---

## Error 1: GCR vs Artifact Registry (el más caro en tiempo)

**Qué se intentó primero:**
El deploy.yml inicial usaba `gcr.io/express-wash-prod/express-wash` (Google Container Registry).

**Por qué no funcionó:**
El proyecto real se llama `expresswash-prod-202605112332` (no `express-wash-prod`) 
y usa Artifact Registry (no GCR). El deploy fallaba en el paso de autenticación 
de Docker porque el registry no existía.

**La solución simple:**
```yaml
# ❌ Incorrecto
IMAGE: gcr.io/express-wash-prod/express-wash
gcloud auth configure-docker

# ✅ Correcto  
IMAGE: southamerica-west1-docker.pkg.dev/expresswash-prod-202605112332/express-wash/express-wash
gcloud auth configure-docker southamerica-west1-docker.pkg.dev
```

**Tiempo perdido:** Detectado en la fase de planificación — 0 commits fallidos gracias a la validación previa.

**Lección:** Siempre validar PROJECT_ID y nombre del registry antes de crear el pipeline CI/CD.

---

## Error 2: next.config.mjs vs next.config.js

**Qué se intentó primero:**
`create-next-app@14` genera `next.config.mjs` (ESM) por defecto.

**Por qué fue un issue:**
La config con `output: 'standalone'` y webpack aliases necesita CommonJS (`module.exports`)
para funcionar correctamente con el Dockerfile multistage. El `.mjs` puede causar problemas
con `transpilePackages`.

**La solución:**
Eliminar `next.config.mjs` y crear `next.config.js` con `module.exports`.

---

## Error 3: Leaflet en SSR

**El problema clásico:**
`window is not defined` durante el build si Leaflet se importa directamente en un
componente que puede ejecutarse en el servidor.

**La solución:**
```tsx
// MapaCobertura.tsx — wrapper con dynamic import
const MapaInner = dynamic(() => import('./MapaInner'), { ssr: false });

// MapaInner.tsx — componente real con 'use client'
'use client';
import 'leaflet/dist/leaflet.css'; // seguro aquí porque solo corre en cliente
```

---

## Error 4: Firebase doble inicialización

**El problema:**
En Next.js con hot reload, el módulo `firestore.ts` se ejecuta múltiples veces.
`initializeApp()` llamado dos veces lanza `Firebase App named '[DEFAULT]' already exists`.

**La solución:**
```typescript
if (getApps().length === 0) {
  initializeApp(config);
}
```

---

## Error 5: NEXT_PUBLIC_BASE_URL vacía en Docker

**Qué se intentó primero:**
Deployar con `NEXT_PUBLIC_BASE_URL` sin definir explícitamente en el Dockerfile builder stage.

**Por qué fue un issue:**
Las variables `NEXT_PUBLIC_*` se compilan en **BUILD TIME**, no en runtime. Si faltan en el `ARG` 
del builder stage, resultan como `undefined` en el binario compilado. Los pedidos se guardaban 
en Firestore, pero `/api/notify` fallaba silenciosamente porque no tenía URL base para hacer 
el callback a `Webhook` o enviar emails.

**La solución:**
```dockerfile
# ❌ Incorrecto — variable nunca se defineARG NEXT_PUBLIC_BASE_URL
RUN npm run build

# ✅ Correcto
ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_BASE_URL="${NEXT_PUBLIC_BASE_URL}"
RUN npm run build
```

Y en el workflow deploy.yml:
```yaml
- name: Build and push Docker image
  run: |
    docker build \
      --build-arg NEXT_PUBLIC_BASE_URL="" \
      -t $IMAGE .
```

**Lección:** Aunque sea vacía o no usada, una variable `NEXT_PUBLIC_*` debe existir explícitamente 
en el `ARG` para que Next.js la compile. De lo contrario, `process.env.NEXT_PUBLIC_BASE_URL` será 
`undefined` en runtime.

**Fix:** Commit `2b12645`

---

## Error 6: Typo en NEXT_PUBLIC_BASE_LON

**Qué se intentó primero:**
Copiar las coordenadas base (Santiago) sin verificar contra un mapa en vivo.

**Síntoma:**
El mapa en `/pedido` cargaba, el círculo de cobertura de 15 km se dibujaba, pero **el punto central 
estaba en el océano Pacífico**, no en Santiago. Los usuarios veían la cobertura fuera de la ciudad.

**La causa:**
`NEXT_PUBLIC_BASE_LON=-70.69` debía ser `-70.6693` (longitud correcta para Santiago centro). 
Pequeña diferencia, pero en mapas = diferencia de decenas de kilómetros.

**La solución:**
Validar coordenadas contra Google Maps antes de fijarlas:
```typescript
// ✅ Correcto para Santiago, Chile
NEXT_PUBLIC_BASE_LAT=-33.4489
NEXT_PUBLIC_BASE_LON=-70.6693
NEXT_PUBLIC_BASE_RADIUS=15
```

**Lección:** Coordenadas geográficas se ven similares, pero incluso 0.02° de diferencia = 
error kilométrico. Siempre cross-check con Google Maps y herramientas online.

**Fix:** Commit `608ca9d`

---

## Error 7: CSS variables duplicadas en globals.css

**Qué se intentó primero:**
Migrar de sistema viejo (`--magenta-*`) a nuevo (`--indigo-*`) sin consolidar las variables antiguas.

**Síntoma:**
Durante el redesign Dark+Indigo, los colores no aplicaban consistentemente. Algunos componentes 
usaban magenta, otros índigo. Tailwind creaba conflictos porque el archivo CSS tenía definiciones 
duplicadas en múltiples lugares del bloque `:root`.

**La causa:**
El archivo `globals.css` heredaba variables antiguas (`--magenta-*`, `--cyan-*`, etc.) y se 
le agregaron nuevas (`--indigo-*`). CSS Cascade — **la última definición gana**, pero tener 
variables duplicadas crea confusión: ¿cuál aplica en cuál contexto?

```css
/* ❌ Incorrecto — duplicados, Cascade impredecible */
:root {
  --magenta-primary: #E91E63;
  --indigo-primary: #c0c1ff;
  --magenta-bg: #1a1a1a;
  --indigo-bg: #09090f;
  /* ... más adelante ... */
  --indigo-primary: #c0c1ff; /* ¿Usa esto o el primero? */
}
```

**La solución:**
Consolidar todas las variables en un **único bloque `:root`**, ordenadas por familia 
(indigo-*, magenta-*, etc.):

```css
/* ✅ Correcto — una fuente de verdad */
:root {
  /* Dark+Indigo Palette */
  --indigo-bg: #09090f;
  --indigo-surface: #111128;
  --indigo-primary: #c0c1ff;
  --indigo-btn: #2e3192;
  --indigo-lavender: #6d4ca6;
  --indigo-tertiary: #60b1ea;
  
  /* Accents */
  --cta: #E91E63; /* SOLO para featured CTA */
  
  /* Typography */
  --font-montserrat: 'Montserrat', sans-serif;
  --font-inter: 'Inter', sans-serif;
}
```

**Lección:** Una fuente de verdad para design tokens. Si necesitas múltiples paletas, 
organiza por prefix (`--indigo-*`, `--magenta-*`), pero en un solo lugar. CSS Cascade 
es tu amiga, pero duplicados son tu enemiga.

**Fix:** Commit `5e28486`

---

## Experiencias Positivas del Redesign

- [x] Componentes BentoGrid, FeaturesSection, PricingCards adoptados sin fricción — lógica clara, Props tipados
- [x] Montserrat + Inter fonts cargadas en primer render — Google Fonts + next/font = experiencia fluida
- [x] Dark+Indigo paleta recibida bien — menos "ruptura visual" que cambio radical a colores claros
- [x] Imágenes Unsplash integradas sin API keys — descarga + caché rápido

---

## Por documentar (agregar conforme avanza el proyecto)

- [ ] Costos reales al mes 1 vs estimación ($1.20/mes proyectado)
- [ ] Primer pedido real recibido — cómo se comportó el sistema end-to-end
- [ ] Primer uso del chatbot por un cliente real — latencia, precisión de respuestas
- [ ] Feedback de usuarios reales en landing — A/B testing Dark+Indigo vs alternativa
- [ ] Performance en mobile — lighthouse score después del redesign
- [ ] Rate limiting y protección contra spam — necesidad real o prematura optimización?
