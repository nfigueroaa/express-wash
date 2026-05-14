# Spec: Rediseño Visual — Dark + Indigo (Stitch Integration)

**Fecha:** 2026-05-13  
**Aprobado por:** Nelson Figueroa Albarrán  
**Enfoque elegido:** C — Dark + Indigo (fusión del tema oscuro actual con el sistema visual Stitch)

---

## Resumen

Rediseño visual completo de la landing page de Express Delivery Wash, integrando el sistema de diseño "Purity Tech" del archivo `stitch_smart_ai_laundry_service.zip`. Se mantiene el fondo oscuro actual pero se adopta la paleta indigo/lavanda, tipografía Montserrat+Inter, y se agregan 3 secciones nuevas. Las imágenes reales reemplazan los iconos placeholder en todas las secciones visuales.

---

## Sistema de Diseño

### Paleta de Colores

| Token | Valor | Uso |
|-------|-------|-----|
| `--bg` | `#09090f` | Fondo principal (negro con tinte índigo) |
| `--surface` | `#111128` | Cards, secciones alternas |
| `--surface-2` | `#16162a` | Cards sobre surface |
| `--primary` | `#c0c1ff` | Textos primarios, logo, links |
| `--primary-dim` | `#9da1ff` | Textos secundarios indigo |
| `--primary-btn` | `#2e3192` | Botones principales |
| `--secondary` | `#d4bbff` | Acentos lavanda |
| `--lavender` | `#6d4ca6` | Bordes featured, badges |
| `--tertiary` | `#60b1ea` | Chips, checkmarks, accents |
| `--cta` | `#E91E63` | Solo CTA principal (plan Confort XL) |
| `--border` | `rgba(192,193,255,0.1)` | Bordes de cards |
| `--text-secondary` | `#888` | Texto descriptivo |

> ⚠️ El magenta (#E91E63) se conserva **únicamente** para el botón del plan destacado (Confort XL) como acento de urgencia. Todo lo demás usa la paleta índigo.

### Tipografía

| Uso | Fuente | Peso | Tamaño |
|-----|--------|------|--------|
| Headlines (H1, H2, H3) | Montserrat | 700 / 600 | 38px / 28px / 18px |
| Cuerpo | Inter | 400 / 500 | 15px / 14px |
| Labels / Badges | Inter | 600 | 10–12px |
| Letra espaciado | `letter-spacing: -0.02em` | — | en H1 |

**Cargar desde Google Fonts:**
```html
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>
```

### Geometría

- Cards estándar: `border-radius: 24px`
- Cards grandes / contenedores: `border-radius: 32–40px`
- Botones: `border-radius: 9999px` (pill)
- Chips: `border-radius: 4–8px`
- Sombras: `box-shadow: 0 8px 32px rgba(0,0,0,0.25)`
- Shadow featured: `box-shadow: 0 24px 48px rgba(0,0,0,0.4)`

---

## Estructura de Páginas

### Landing (`/`) — Secciones en orden

```
1. Navbar           (actualizar)
2. Hero             (actualizar)
3. Bento Grid       (reemplaza ServiciosGrid)
4. Features         (nueva)
5. Pricing Cards    (nueva)
6. Mapa Cobertura   (se mantiene)
7. CTA Section      (nueva)
8. Footer           (actualizar colores)
```

### `/pedido` — Sin cambios estructurales
La calculadora interactiva se mantiene intacta. Solo actualizar colores al nuevo sistema.

### `/admin` — Sin cambios
Panel administrativo sin modificaciones en este sprint.

---

## Detalle de Secciones

### 1. Navbar

**Componente:** `src/components/Navbar.tsx` (crear si no existe) o actualizar header en `layout.tsx`

- Fondo: `rgba(9,9,15,0.85)` + `backdrop-filter: blur(12px)`
- Logo: `font-family: Montserrat` · color `#c0c1ff`
- Links: color `#666` → hover `#c0c1ff`
- CTA button: `background: #2e3192` · pill shape
- `position: sticky; top: 0; z-index: 50`

### 2. Hero Section

**Componente:** `src/components/Hero.tsx` (refactor)

- Layout: 2 columnas en desktop (`grid-template-columns: 1fr 1fr`)
- Badge superior: `"✦ Impulsado por Google Cloud AI"` — pill, fondo `rgba(192,193,255,0.08)`
- H1: Montserrat 38px · `Tu Lavandería, Reimaginada por IA` · `<span>` en color `#c0c1ff`
- Subtítulo: Inter 15px · color `#888`
- Botones: "Hacer mi Pedido" (indigo) + "Ver Cobertura" (outline)
- **Imagen derecha:** Foto real de lavandería premium (ver sección de imágenes)
- Badge flotante: tarjeta blanca oscura en `bottom-left` con ícono 🚚 y texto "Recogida Express / En menos de 60 min"
- Decoración fondo: gradiente radial `rgba(21,21,125,0.18)` en esquina derecha

### 3. Bento Grid — Cuidado Especializado

**Componente:** `src/components/BentoGrid.tsx` (nuevo, reemplaza `ServiciosGrid.tsx`)

- Título: `"Para cada tipo de prenda"` — label `"CUIDADO ESPECIALIZADO"`
- Layout: `grid-template-columns: 1fr 2fr`
- **Card 1 — Prendas Diarias** (columna 1):
  - **Imagen real** de prendas/ropa en perchas (ver sección imágenes)
  - Título: Montserrat, color `#c0c1ff`
  - Descripción: Inter, color `#888`
- **Card 2 — Cubrecamas & Plumones** (columna 2, wide):
  - Layout interno: imagen izquierda + texto derecha
  - **Imagen real** de dormitorio con ropa de cama premium
  - Chip `"Más Popular"` — fondo `rgba(0,66,100,0.5)` · texto `#60b1ea`
  - Feature check: `"✓ Tratamiento de Plumón Natural"`

### 4. Features Section — Por Qué Elegirnos

**Componente:** `src/components/FeaturesSection.tsx` (nuevo)

- Layout: 2 columnas — lista features izquierda + imagen visual derecha
- **Imagen derecha:** Foto de instalación tecnológica / laundry moderno
- 3 features con icon box de color + título + descripción:
  1. 🧠 **AI-Driven Support** — fondo `rgba(109,76,166,0.25)` — "Nuestro asistente Washi monitorea cada ciclo en tiempo real"
  2. ☁️ **GCP Infrastructure** — fondo `rgba(0,66,100,0.35)` — "99.9% de disponibilidad en tus pedidos"
  3. 👆 **Easy Ordering** — fondo `rgba(55,58,155,0.3)` — "Pide tu servicio en 3 clicks"

### 5. Pricing Cards — Precios Transparentes

**Componente:** `src/components/PricingCards.tsx` (nuevo)

- Contenedor: `background: var(--surface-2)` · `border-radius: 40px` · margen lateral
- Grid: 3 columnas iguales
- **Plan Essential** ($15.990/bolsa): card estándar, botón outline
  - Items: Hasta 8kg de ropa diaria · Lavado y secado estándar · Doblado automático
- **Plan Confort XL** ($24.990/pack): card featured, `transform: translateY(-8px)`, border `#6d4ca6`, botón CTA magenta
  - Badge: `"RECOMENDADO"` — pill lavanda
  - Items: 2 Plumones · Tratamiento Hipoalergénico · Bolsa al vacío · Recogida Prioritaria
- **Plan Deluxe AI** ($39.990/mes): card estándar, botón outline
  - Items: 4 bolsas/sem · Planchado a vapor · Desmanchado inteligente

> Nota: Al hacer click en "Seleccionar", llevar al usuario a `/pedido` con el plan pre-seleccionado como query param.

### 6. Mapa de Cobertura

**Componente:** `src/components/MapaCobertura.tsx` — se mantiene sin cambios  
Solo actualizar título/subtítulo para que use la nueva tipografía y colores.

### 7. CTA Section

**Componente:** `src/components/CTASection.tsx` (nuevo)

- H2: Montserrat 36px · `"¿Listo para liberar tu tiempo?"`
- Subtítulo: Inter · `"Tu primera recogida con descuento especial"`
- 2 botones: "Hacer mi primer pedido" (indigo) + "Hablar con Washi 🤖" (outline)
- Fondo: `var(--bg)` con padding generoso

### 8. Footer

**Componente:** `src/components/Footer.tsx` — actualizar colores

- Fondo: `#050508`
- Logo: Montserrat · color `#c0c1ff`
- Textos: color `#333–#444`
- Link WhatsApp: `#60b1ea` (tertiary) en lugar de verde
- Firma: `"Desarrollada por Nelson Figueroa Albarrán · 2026"` (ya existe)

---

## Imágenes

Las imágenes reemplazan todos los placeholders emoji. Se usarán fotos de **Unsplash** (libres, sin API key):

| Sección | Descripción | URL sugerida |
|---------|-------------|--------------|
| Hero (derecha) | Lavandería premium, ropa blanca plegada, luz suave | `https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&q=80` |
| Bento — Prendas | Ropa en perchas, fondo neutro, estilo limpio | `https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80` |
| Bento — Plumones | Cama con ropa de cama blanca y esponjosa | `https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80` |
| Features (derecha) | Interior moderno, máquinas, luz azul | `https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&q=80` |

> Todas las imágenes en Next.js deben usar el componente `<Image>` de `next/image` con `width`, `height`, y `alt` descriptivo. Agregar `unsplash.com` y `images.unsplash.com` en `next.config.js` bajo `images.domains`.

---

## Cambios en Configuración

### `next.config.js`
```js
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['leaflet', 'react-leaflet'],
  images: {
    domains: ['images.unsplash.com'],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};
```

### `src/styles/globals.css`
Actualizar variables CSS:
```css
:root {
  --magenta: #E91E63;    /* solo CTA */
  --primary: #c0c1ff;
  --primary-btn: #2e3192;
  --secondary: #d4bbff;
  --lavender: #6d4ca6;
  --tertiary: #60b1ea;
  --bg: #09090f;
  --surface: #111128;
}
```

### `tailwind.config.ts`
Agregar tipografías y colores del sistema Stitch:
```ts
theme: {
  extend: {
    fontFamily: {
      montserrat: ['Montserrat', 'sans-serif'],
      inter: ['Inter', 'sans-serif'],
    },
    colors: {
      primary: '#c0c1ff',
      'primary-btn': '#2e3192',
      secondary: '#d4bbff',
      lavender: '#6d4ca6',
      tertiary: '#60b1ea',
    },
  },
}
```

---

## Archivos a Crear / Modificar

### Nuevos componentes
| Archivo | Descripción |
|---------|-------------|
| `src/components/BentoGrid.tsx` | Reemplaza ServiciosGrid.tsx |
| `src/components/FeaturesSection.tsx` | Sección de 3 features |
| `src/components/PricingCards.tsx` | 3 planes en landing |
| `src/components/CTASection.tsx` | CTA final |

### Componentes a refactorizar
| Archivo | Cambios |
|---------|---------|
| `src/components/Hero.tsx` | Split layout, badge IA, imagen real, badge flotante |
| `src/components/Footer.tsx` | Colores indigo, link tertiary |
| `src/app/layout.tsx` | Agregar fuentes Montserrat+Inter, variables CSS |
| `src/app/page.tsx` | Agregar nuevas secciones, reemplazar ServiciosGrid |

### Configuración
| Archivo | Cambios |
|---------|---------|
| `next.config.js` | Agregar `images.domains` para Unsplash |
| `tailwind.config.ts` | Nuevas fuentes y colores |
| `src/styles/globals.css` | Variables CSS actualizadas |

---

## Componentes NO modificados en este sprint

- `src/app/pedido/page.tsx` — solo actualizar colores CSS
- `src/app/admin/page.tsx` — sin cambios
- `src/components/MapaCobertura.tsx` — sin cambios (solo título/colores)
- `src/components/MapaInner.tsx` — sin cambios
- `src/components/ChatbotWidget.tsx` — sin cambios funcionales (colores opcionales)
- Todas las API routes — sin cambios

---

## Criterios de Éxito

- [ ] Landing page carga con el nuevo diseño Dark+Indigo
- [ ] Fuentes Montserrat e Inter se ven correctamente
- [ ] Imágenes reales en Hero, Bento Grid y Features (sin emoji placeholders)
- [ ] Bento Grid muestra Prendas + Plumones con fotos
- [ ] Sección Features visible con 3 items
- [ ] Pricing Cards muestra 3 planes, Confort XL destacado
- [ ] Mapa de cobertura sigue funcionando
- [ ] CTA Section al final de la landing
- [ ] Magenta solo aparece en botón "Seleccionar" de Confort XL
- [ ] Diseño responsivo en mobile (media queries)
- [ ] Sin errores de consola
- [ ] `npm run build` sin errores TypeScript
- [ ] Calculadora en `/pedido` sigue funcionando con nuevos colores

---

## Roadmap — Impacto

Este redesign corresponde a la **Fase P1.1** del ROADMAP.md (Imágenes & Brand Assets) y parcialmente **P1** (UX & Contenido). Se actualiza issue #4 como completado al finalizar.

---

**Última actualización:** 2026-05-13  
**Estado:** Aprobado — Listo para plan de implementación
