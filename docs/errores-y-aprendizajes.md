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

## Por documentar (agregar conforme avanza el proyecto)

- [ ] Primer deploy exitoso a Cloud Run — qué funcionó
- [ ] Primer pedido real recibido — cómo se comportó el sistema
- [ ] Primer uso del chatbot por un cliente real
- [ ] Costos reales al mes 1 vs estimación
