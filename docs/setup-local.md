# 🖥️ Guía de Setup Local

Cómo configurar Express Delivery Wash en tu máquina para desarrollo.

---

## 📋 Requisitos Previos

- **Node.js 20+** ([descargar](https://nodejs.org/))
- **npm 10+** (incluido con Node.js)
- **Git** ([descargar](https://git-scm.com/))
- **Editor de código** (recomendado: VS Code)
- **Cuenta Firebase** (crear en https://console.firebase.google.com)
- **Cuenta Anthropic** (para API key: https://console.anthropic.com)
- **Cuenta EmailJS** (para notificaciones: https://www.emailjs.com)
- **Conocimiento de Dark+Indigo design system** (ver [Arquitectura](arquitectura.md) para detalle visual)

---

## 🚀 Instalación Paso a Paso

### 1. Clonar el repositorio

```bash
git clone https://github.com/nfigueroaa/express-wash.git
cd express-wash
```

### 2. Instalar dependencias

```bash
npm install
```

Esto descargará todas las dependencias del `package.json`. Espera ~2-3 minutos.

**Dependencias principales:**
- `next@14` — Framework web
- `react@18` — Library UI
- `typescript` — Type safety
- `tailwindcss` — Estilos (con Dark+Indigo design system)
- `firebase` — Base de datos
- `leaflet` — Mapas
- `emailjs-com` — Notificaciones
- `anthropic` — API de Claude (opcional, usamos fetch directo)
- `@next/font/google` — Montserrat (headers) + Inter (body)

### 3. Crear archivo `.env.local`

```bash
cp .env.local.example .env.local
```

Luego edita `.env.local` con tus valores reales. Ve a la sección **Variables de Entorno** más abajo.

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Deberías ver:

```
  ▲ Next.js 14.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local
```

Abre http://localhost:3000 en tu navegador. 🎉

---

## 🔐 Configurar Variables de Entorno

### Firebase Config

1. Abre https://console.firebase.google.com
2. Selecciona tu proyecto (expresswash-prod-...)
3. Ve a **Project Settings** (⚙️ abajo a la izquierda)
4. Copia la configuración bajo "Firebase SDK snippet" → "Config"
5. Pega en `.env.local` como `NEXT_PUBLIC_FIREBASE_CONFIG`

**Formato:**
```
NEXT_PUBLIC_FIREBASE_CONFIG={"apiKey":"...","authDomain":"...","projectId":"expresswash-prod-202605112332",...}
```

### Coordinates Base

Las coordenadas de tu negocio (Santiago Centro):
```
NEXT_PUBLIC_BASE_LAT=-33.4489
NEXT_PUBLIC_BASE_LON=-70.6693
```

Puedes cambiarlas si tu negocio está en otro lugar.

### EmailJS Config

1. Abre https://dashboard.emailjs.com
2. Ve a **Account** (esquina superior derecha)
3. Copia el **Service ID** (ej: `service_abc123xyz`)
4. Ve a **Email Templates**, copia el **Template ID**
5. Vuelve a **Account**, copia la **Public Key**

```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_...
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_...
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=...
```

### Anthropic API Key

1. Abre https://console.anthropic.com
2. Ve a **API Keys**
3. Crea una nueva key (o copia una existente)
4. Copia a `.env.local`

```
ANTHROPIC_API_KEY=sk-ant-v7-...
```

### Email del Dueño

Donde recibirás las notificaciones de nuevos pedidos:

```
OWNER_EMAIL=tu@email.com
```

---

## ✅ Verificar Setup

Después de configurar todo, verifica que funciona:

### 1. Verificar que el dev server está corriendo

```bash
npm run dev
```

Abre http://localhost:3000 — debe cargar la landing page.

### 2. Probar landing page

- ✅ Debe mostrar hero con logo y servicios
- ✅ **Verifica colores Dark+Indigo:** fondo oscuro (#09090f), primario lavanda (#c0c1ff), botones índigo (#2e3192)
- ✅ **Verifica nuevos componentes:** BentoGrid (2 cards), FeaturesSection, PricingCards (3 planes)
- ✅ **Verifica tipografía:** Headers en Montserrat bold, body en Inter regular
- ✅ Mapa debe aparecer con círculo de cobertura
- ✅ Calculadora de precios debe funcionar
- ✅ Chatbot debe estar en esquina inferior derecha

### 3. Probar geocoding

1. Abre http://localhost:3000/pedido
2. Ingresa dirección: "Miraflores 123, Santiago"
3. Presiona Tab o click afuera
4. Debe mostrar coordenadas y "Dentro de cobertura"

### 4. Probar pedido

1. Completa el formulario:
   - Nombre: Test User
   - Teléfono: tu número
   - Dirección: Miraflores 123, Santiago
   - Selecciona 1 servicio
2. Click "Enviar pedido"
3. Debe mostrar "¡Pedido recibido!"
4. Abre Firebase Console → Firestore → colección `pedidos` → debe haber un documento nuevo

### 5. Probar email

- Email debe llegar a `OWNER_EMAIL` en ~30 segundos
- Si no llega, revisa EmailJS dashboard

### 6. Probar chatbot

1. Click en el ícono del chat (esquina inferior derecha)
2. Escribe: "¿Cuál es la cobertura?"
3. Debe responder con info sobre cobertura

---

## 🛠️ Comandos Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor en localhost:3000

# Build
npm run build            # Compilar para producción
npm run start            # Ejecutar build de producción localmente

# Testing
npm run test             # Ejecutar tests (próximamente)
npm run test:watch      # Tests en modo watch

# Linting
npm run lint             # Verificar TypeScript y ESLint

# Docker
docker build -t express-wash-local .                    # Build imagen
docker run -p 8080:8080 \
  -e ANTHROPIC_API_KEY=sk-ant-... \
  -e OWNER_EMAIL=tu@email.com \
  express-wash-local                                    # Run imagen
```

---

## 📱 Testing en Dispositivos

### Acceder desde otra máquina en la red

Encuentra tu IP local:

**Windows/Linux/Mac:**
```bash
ipconfig getifaddr en0        # Mac
ipconfig                       # Windows
hostname -I                    # Linux
```

Ejemplo: si tu IP es `192.168.1.100`:

```
http://192.168.1.100:3000
```

Otros dispositivos en la red pueden acceder así.

### Mobile Testing

**Con Chrome DevTools:**
1. F12 → Toggle device toolbar (Ctrl+Shift+M)
2. Selecciona "iPhone 12" o "Pixel 5"
3. Prueba responsividad

**Físico (Android/iOS):**
1. Asegúrate que el teléfono está en la misma red WiFi
2. Accede a `http://[TU_IP]:3000`

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'leaflet'"

```bash
npm install leaflet react-leaflet @types/leaflet
```

### Error: "NEXT_PUBLIC_FIREBASE_CONFIG is not set"

- Verifica que `.env.local` existe
- Verifica que las variables están correctas
- Reinicia el dev server: Ctrl+C → `npm run dev`

### El mapa no se carga

1. Abre la consola (F12)
2. Busca errores de Leaflet
3. Verifica que `MapaInner.tsx` importa `leaflet/dist/leaflet.css`
4. Recarga la página (Ctrl+Shift+R)

### Firestore no guarda documentos

1. Verifica Firebase Console → Firestore está habilitado
2. Verifica que colección `pedidos` existe (puede estar vacía al inicio)
3. Ve a rules y asegúrate que permite writes
4. Revisa Network tab (F12) → XHR → llama a `/api/order`

### EmailJS no envía emails

1. Abre https://dashboard.emailjs.com → Email Activity
2. Busca tu email reciente
3. Si dice "Failed", haz click para ver error
4. Verifica que template existe y tiene variables correctas

---

## 💡 Tips de Desarrollo

### Usar React DevTools

Instala extensión de Chrome: [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/)

Luego puedes inspeccionar componentes en la pestaña "Components" de DevTools.

### Usar Redux DevTools para debugging

Para Firestore queries, agrega logging en `src/lib/firestore.ts`:

```typescript
console.log('📡 Firestore query:', { colección, filtro });
```

### Acceder a variables de entorno en consola

```javascript
// En consola del navegador (F12)
console.log(process.env.NEXT_PUBLIC_BASE_LAT)  // ✅ Funciona
console.log(process.env.ANTHROPIC_API_KEY)     // ❌ Undefined (server-only)
```

### Inspeccionar Network requests

1. Abre F12 → Network tab
2. Filtra por "XHR/Fetch"
3. Haz una acción (crear pedido, etc.)
4. Verás requests a `/api/order`, `/api/geo`, etc.

---

## 🚀 Próximos Pasos

Después de verificar setup:

1. Revisa [Arquitectura](arquitectura.md) para entender el proyecto
2. Lee [API Reference](api.md) para ver endpoints disponibles
3. Crea una rama para tu feature: `git checkout -b feature/mi-feature`
4. Haz cambios y tests locales
5. Abre un PR cuando esté listo

---

## 📞 ¿Problemas?

- Revisa [Troubleshooting](troubleshooting.md)
- Abre un [GitHub Issue](https://github.com/nfigueroaa/express-wash/issues)
- Contacta al equipo (ver README.md)

---

## 🎨 Dark+Indigo Design System

La landing page usa el sistema visual "Purity Tech" con paleta Dark+Indigo:

**Colores CSS Variables (en `globals.css`):**
```css
--indigo-bg: #09090f           /* Fondo principal */
--indigo-surface: #111128      /* Cards y secciones */
--indigo-primary: #c0c1ff      /* Textos y logo */
--indigo-btn: #2e3192          /* Botones principales */
--indigo-lavender: #6d4ca6     /* Acentos */
--indigo-tertiary: #60b1ea     /* Chips y checkmarks */
--cta: #E91E63                 /* Solo botón Confort XL */
```

**Tipografía:**
- **Headers (H1-H3):** Montserrat 600/700, -0.02em letter-spacing
- **Body/UI:** Inter 400/500/600

**Componentes nuevos:**
- `Hero.tsx` — Layout 2 columnas (texto + imagen Unsplash)
- `BentoGrid.tsx` — 2 featured cards (Prendas Diarias + Cubrecamas)
- `FeaturesSection.tsx` — 3 features (AI Support, GCP, Easy Ordering)
- `PricingCards.tsx` — 3 planes (Essential, Confort XL featured, Deluxe AI)
- `CTASection.tsx` — CTA final + chatbot trigger

Si cambias colores o tipografía, recuerda:
```bash
npm run dev   # Tailwind se recompila automáticamente
# o
npm run build # Si estás debugueando producción
```

**Última actualización:** 2026-05-14
