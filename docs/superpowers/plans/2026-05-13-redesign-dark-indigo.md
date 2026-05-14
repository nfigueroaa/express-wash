# Rediseño Visual Dark+Indigo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar la landing page de Express Delivery Wash adoptando el sistema visual Stitch (Dark+Indigo): nueva paleta índigo/lavanda, tipografía Montserrat+Inter, Bento Grid, Features Section, Pricing Cards, y CTA Section — manteniendo el fondo oscuro y la lógica de negocio intactos.

**Architecture:** Crear 4 nuevos componentes de servidor (`BentoGrid`, `FeaturesSection`, `PricingCards`, `CTASection`), refactorizar `Hero` a layout split con imagen real, actualizar `Footer` con colores índigo, y ensamblar todo en `page.tsx`. La fundación visual (fuentes, CSS variables, Tailwind tokens) se establece primero para que todos los componentes la hereden.

**Tech Stack:** Next.js 14 App Router · TypeScript · Tailwind CSS · next/font/google (Montserrat + Inter) · next/image (Unsplash) · shadcn/ui (Button existente) · CSS custom properties

---

## File Map

| Acción | Archivo | Responsabilidad |
|--------|---------|-----------------|
| Modificar | `next.config.js` | Agregar `images.remotePatterns` para Unsplash |
| Modificar | `src/app/globals.css` | Variables CSS del sistema Dark+Indigo |
| Modificar | `tailwind.config.ts` | Tokens de color y familias tipográficas |
| Modificar | `src/app/layout.tsx` | Cargar Montserrat + Inter vía next/font |
| Modificar | `src/components/Hero.tsx` | Rewrite: split layout, imagen, badge flotante |
| Crear | `src/components/BentoGrid.tsx` | Grid de servicios con imágenes reales |
| Crear | `src/components/FeaturesSection.tsx` | 3 features con íconos + imagen lateral |
| Crear | `src/components/PricingCards.tsx` | 3 planes de precio |
| Crear | `src/components/CTASection.tsx` | CTA final de la landing |
| Modificar | `src/components/Footer.tsx` | Colores actualizados a índigo |
| Modificar | `src/app/page.tsx` | Ensamblar todas las secciones nuevas |

---

## Task 1: Configuración Base — next.config.js, CSS Variables, Tailwind

**Files:**
- Modify: `next.config.js`
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.ts`

### Por qué primero
Esta tarea establece los tokens de diseño globales. Todos los componentes siguientes los usarán via `var(--indigo-primary)` y clases Tailwind como `font-montserrat`.

- [ ] **Step 1: Actualizar `next.config.js` para permitir imágenes de Unsplash**

Reemplazar el archivo completo con:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['leaflet', 'react-leaflet'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};
module.exports = nextConfig;
```

- [ ] **Step 2: Actualizar variables CSS en `src/app/globals.css`**

Agregar al final del archivo (después de `--cyan: #00BCD4;`):

```css
/* Sistema Dark+Indigo (Stitch) */
--indigo-bg: #09090f;
--indigo-surface: #111128;
--indigo-surface-2: #16162a;
--indigo-primary: #c0c1ff;
--indigo-primary-dim: #9da1ff;
--indigo-btn: #2e3192;
--indigo-secondary: #d4bbff;
--indigo-lavender: #6d4ca6;
--indigo-tertiary: #60b1ea;
--indigo-border: rgba(192, 193, 255, 0.1);
--indigo-border-2: rgba(192, 193, 255, 0.06);
--indigo-text-muted: #888888;
--indigo-text-faint: #555555;
```

- [ ] **Step 3: Actualizar `tailwind.config.ts`**

Reemplazar el archivo completo con:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ["var(--font-montserrat)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Sistema Indigo
        "indigo-primary": "var(--indigo-primary)",
        "indigo-btn": "var(--indigo-btn)",
        "indigo-lavender": "var(--indigo-lavender)",
        "indigo-tertiary": "var(--indigo-tertiary)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 4: Verificar que la config compila**

```bash
cd "C:\Users\figue\Documents\Proyectos\Claude Code\edwash"
npx tsc --noEmit
```

Esperado: sin errores TypeScript.

- [ ] **Step 5: Commit**

```bash
git add next.config.js src/app/globals.css tailwind.config.ts
git commit -m "feat(design): add Dark+Indigo CSS variables, Tailwind tokens, Unsplash image domain"
```

---

## Task 2: Fuentes Montserrat + Inter en layout.tsx

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Reemplazar `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Express Delivery Wash — Lavandería a domicilio Santiago',
  description:
    'Retiro y entrega de ropa a domicilio en Santiago, Chile. Cubrecamas, plumones, colchas y más en 24–48 horas. Sin salir de casa.',
  keywords: 'lavandería, domicilio, Santiago, Chile, cubrecamas, plumones, retiro, entrega',
  openGraph: {
    title: 'Express Delivery Wash',
    description: 'Lavandería a domicilio en Santiago — retiro y entrega 24–48 hrs',
    type: 'website',
    locale: 'es_CL',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${montserrat.variable} font-inter antialiased`}
        style={{ backgroundColor: 'var(--indigo-bg)', color: '#ffffff' }}
      >
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verificar que el build no falla**

```bash
npm run build
```

Esperado: build exitoso, sin errores. La app en `localhost:3000` debe verse igual que antes (fuentes aún no están en uso en componentes).

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat(design): add Montserrat+Inter via next/font, update body background to Dark+Indigo"
```

---

## Task 3: Hero Redesign — Split Layout con Imagen Real

**Files:**
- Modify: `src/components/Hero.tsx`

El Hero pasa de layout centrado a dos columnas: texto a la izquierda, imagen a la derecha. Se agrega un badge "Impulsado por IA" y un badge flotante de entrega express.

- [ ] **Step 1: Reemplazar `src/components/Hero.tsx`**

```tsx
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section
      className="relative px-6 md:px-16 py-20 md:py-28 overflow-hidden"
      style={{ backgroundColor: 'var(--indigo-bg)' }}
    >
      {/* Decoración fondo */}
      <div
        className="absolute top-0 right-0 w-1/2 h-full -z-10 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 80% 50%, rgba(21,21,125,0.18) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        {/* Columna izquierda — texto */}
        <div>
          {/* Badge IA */}
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{
              background: 'rgba(192,193,255,0.08)',
              border: '1px solid var(--indigo-border)',
              color: 'var(--indigo-primary-dim)',
            }}
          >
            ✦ Impulsado por Google Cloud AI
          </span>

          {/* Título */}
          <h1
            className="font-montserrat text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-5"
            style={{ letterSpacing: '-0.02em' }}
          >
            Tu Lavandería,{' '}
            <br />
            <span style={{ color: 'var(--indigo-primary)' }}>
              Reimaginada por IA
            </span>
          </h1>

          {/* Subtítulo */}
          <p
            className="font-inter text-base md:text-lg leading-relaxed mb-8 max-w-lg"
            style={{ color: 'var(--indigo-text-muted)' }}
          >
            Experimenta el futuro del cuidado textil. Recogemos y entregamos
            tus prendas, cubrecamas y plumones con precisión quirúrgica y
            suavidad algodonosa — en 24 a 48 horas.
          </p>

          {/* Botones */}
          <div className="flex flex-wrap gap-3">
            <Link href="/pedido">
              <Button
                size="lg"
                className="rounded-full font-semibold px-8 py-6 text-base text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--indigo-btn)', border: 'none' }}
              >
                Hacer mi Pedido
              </Button>
            </Link>
            <Link href="#cobertura">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8 py-6 text-base transition-colors"
                style={{
                  borderColor: '#333',
                  color: 'var(--indigo-primary-dim)',
                  backgroundColor: 'transparent',
                }}
              >
                Ver Cobertura
              </Button>
            </Link>
          </div>
        </div>

        {/* Columna derecha — imagen */}
        <div className="relative">
          <div
            className="relative w-full aspect-square rounded-[32px] overflow-hidden"
            style={{
              border: '1px solid var(--indigo-border)',
              boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
            }}
          >
            <Image
              src="https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&q=80"
              alt="Ropa blanca perfectamente plegada — Express Delivery Wash"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Badge flotante */}
          <div
            className="absolute -bottom-4 -left-4 flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{
              backgroundColor: 'var(--indigo-surface)',
              border: '1px solid var(--indigo-border)',
              boxShadow: '0 16px 32px rgba(0,0,0,0.4)',
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ backgroundColor: 'rgba(0,66,100,0.4)' }}
            >
              🚚
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Recogida Express</p>
              <p className="text-xs" style={{ color: 'var(--indigo-text-faint)' }}>
                En menos de 60 min
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verificar en dev**

```bash
npm run dev
```

Abrir `http://localhost:3000`. Verificar:
- Layout de 2 columnas en desktop
- Imagen de Unsplash cargando
- Badge "Impulsado por Google Cloud AI" visible
- Badge flotante 🚚 en esquina inferior izquierda de la imagen
- En mobile (DevTools): columna única, imagen abajo del texto

- [ ] **Step 3: Commit**

```bash
git add src/components/Hero.tsx
git commit -m "feat(hero): redesign to split layout with AI badge, Unsplash image, floating delivery badge"
```

---

## Task 4: BentoGrid — Cuidado Especializado

**Files:**
- Create: `src/components/BentoGrid.tsx`

Reemplaza `ServiciosGrid.tsx`. No se elimina `ServiciosGrid.tsx` aún (se hace en Task 9 al editar `page.tsx`).

- [ ] **Step 1: Crear `src/components/BentoGrid.tsx`**

```tsx
import Image from 'next/image';

export function BentoGrid() {
  return (
    <section
      id="servicios"
      className="px-6 md:px-16 py-20"
      style={{ backgroundColor: 'var(--indigo-surface)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span
            className="inline-block px-4 py-1 rounded-full text-xs font-semibold tracking-widest uppercase mb-4"
            style={{
              background: 'rgba(192,193,255,0.08)',
              color: 'var(--indigo-primary-dim)',
            }}
          >
            Cuidado Especializado
          </span>
          <h2
            className="font-montserrat text-3xl md:text-4xl font-bold text-white mb-3"
            style={{ letterSpacing: '-0.01em' }}
          >
            Para cada tipo de prenda
          </h2>
          <p
            className="font-inter text-base max-w-xl mx-auto leading-relaxed"
            style={{ color: 'var(--indigo-text-muted)' }}
          >
            Nuestra IA detecta el tipo de fibra y la mancha exacta para
            aplicar el tratamiento perfecto sin dañar tus telas.
          </p>
        </div>

        {/* Grid 1fr 2fr */}
        <div className="grid md:grid-cols-3 gap-5">
          {/* Card 1 — Prendas Diarias (1 columna) */}
          <div
            className="md:col-span-1 flex flex-col rounded-[24px] overflow-hidden"
            style={{
              backgroundColor: 'var(--indigo-surface-2)',
              border: '1px solid var(--indigo-border)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            }}
          >
            <div className="relative h-48 w-full flex-shrink-0">
              <Image
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80"
                alt="Prendas diarias en perchas — Express Delivery Wash"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6 flex flex-col gap-2 flex-grow">
              <h3
                className="font-montserrat text-lg font-semibold"
                style={{ color: 'var(--indigo-primary)' }}
              >
                Prendas Diarias
              </h3>
              <p
                className="font-inter text-sm leading-relaxed"
                style={{ color: 'var(--indigo-text-muted)' }}
              >
                Lavado, secado y doblado para tu ropa del día a día.
              </p>
            </div>
          </div>

          {/* Card 2 — Cubrecamas & Plumones (2 columnas) */}
          <div
            className="md:col-span-2 flex flex-col md:flex-row rounded-[24px] overflow-hidden"
            style={{
              backgroundColor: 'var(--indigo-surface-2)',
              border: '1px solid var(--indigo-border)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            }}
          >
            <div className="relative md:w-5/12 h-56 md:h-auto flex-shrink-0">
              <Image
                src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80"
                alt="Cubrecamas y plumones limpios — Express Delivery Wash"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-8 flex flex-col justify-center gap-4">
              <span
                className="inline-block px-3 py-1 rounded text-xs font-semibold w-fit"
                style={{
                  backgroundColor: 'rgba(0,66,100,0.5)',
                  color: 'var(--indigo-tertiary)',
                }}
              >
                Más Popular
              </span>
              <h3
                className="font-montserrat text-xl font-semibold"
                style={{ color: 'var(--indigo-primary)' }}
              >
                Cubrecamas &amp; Plumones
              </h3>
              <p
                className="font-inter text-sm leading-relaxed"
                style={{ color: 'var(--indigo-text-muted)' }}
              >
                Limpieza profunda con tecnología de ozono que elimina el
                99.9% de ácaros y alérgenos en piezas de gran volumen.
              </p>
              <div
                className="flex items-center gap-2 text-sm font-medium"
                style={{ color: 'var(--indigo-primary-dim)' }}
              >
                <span>✓</span>
                <span>Tratamiento de Plumón Natural</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verificar en dev**

```bash
npm run dev
```

`BentoGrid` aún no está en `page.tsx`, verificar que no hay errores TypeScript en el archivo:

```bash
npx tsc --noEmit
```

Esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/BentoGrid.tsx
git commit -m "feat(bento): add BentoGrid component with Unsplash images for Prendas and Plumones"
```

---

## Task 5: FeaturesSection — Por Qué Elegirnos

**Files:**
- Create: `src/components/FeaturesSection.tsx`

- [ ] **Step 1: Crear `src/components/FeaturesSection.tsx`**

```tsx
import Image from 'next/image';

const features = [
  {
    icon: '🧠',
    iconBg: 'rgba(109,76,166,0.25)',
    title: 'AI-Driven Support',
    description:
      'Nuestro asistente Washi monitorea cada ciclo de lavado en tiempo real, garantizando que nunca se pierda un botón o se dañe un tejido delicado.',
  },
  {
    icon: '☁️',
    iconBg: 'rgba(0,66,100,0.35)',
    title: 'GCP Infrastructure',
    description:
      'Operamos sobre Google Cloud Platform para asegurar que tus pedidos y seguimiento estén siempre disponibles con una fiabilidad del 99.9%.',
  },
  {
    icon: '👆',
    iconBg: 'rgba(55,58,155,0.3)',
    title: 'Easy Ordering',
    description:
      'Pide tu servicio en 3 clicks. Sin formularios largos, sin llamadas. Todo desde la palma de tu mano con nuestra interfaz intuitiva.',
  },
] as const;

export function FeaturesSection() {
  return (
    <section
      className="px-6 md:px-16 py-20"
      style={{ backgroundColor: 'var(--indigo-bg)' }}
    >
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        {/* Columna izquierda — features */}
        <div className="flex flex-col gap-10">
          <div>
            <span
              className="inline-block px-4 py-1 rounded-full text-xs font-semibold tracking-widest uppercase mb-4"
              style={{
                background: 'rgba(192,193,255,0.08)',
                color: 'var(--indigo-primary-dim)',
              }}
            >
              Por qué elegirnos
            </span>
            <h2
              className="font-montserrat text-3xl md:text-4xl font-bold text-white leading-tight"
              style={{ letterSpacing: '-0.01em' }}
            >
              La pureza tecnológica<br />de Express Wash
            </h2>
          </div>

          {features.map((feature) => (
            <div key={feature.title} className="flex gap-5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ backgroundColor: feature.iconBg }}
              >
                {feature.icon}
              </div>
              <div>
                <h3
                  className="font-montserrat text-base font-semibold text-white mb-1"
                >
                  {feature.title}
                </h3>
                <p
                  className="font-inter text-sm leading-relaxed"
                  style={{ color: 'var(--indigo-text-muted)' }}
                >
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Columna derecha — imagen */}
        <div
          className="relative rounded-[28px] overflow-hidden aspect-video"
          style={{
            border: '1px solid var(--indigo-border)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          }}
        >
          <Image
            src="https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&q=80"
            alt="Instalación moderna de lavandería tecnológica"
            fill
            className="object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, rgba(21,21,125,0.35), transparent)',
            }}
          />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/FeaturesSection.tsx
git commit -m "feat(features): add FeaturesSection with AI/GCP/Easy Ordering and laundry image"
```

---

## Task 6: PricingCards — Precios Transparentes

**Files:**
- Create: `src/components/PricingCards.tsx`

- [ ] **Step 1: Crear `src/components/PricingCards.tsx`**

```tsx
import Link from 'next/link';

const plans = [
  {
    name: 'Essential',
    price: '$15.990',
    period: '/ bolsa',
    featured: false,
    queryParam: 'essential',
    features: [
      'Hasta 8kg de ropa diaria',
      'Lavado y secado estándar',
      'Doblado automático',
    ],
  },
  {
    name: 'Confort XL',
    price: '$24.990',
    period: '/ pack',
    featured: true,
    queryParam: 'confort',
    features: [
      '2 Plumones o Cubrecamas',
      'Tratamiento Hipoalergénico',
      'Entrega en bolsa al vacío',
      'Recogida Prioritaria',
    ],
  },
  {
    name: 'Deluxe AI',
    price: '$39.990',
    period: '/ mes',
    featured: false,
    queryParam: 'deluxe',
    features: [
      'Suscripción semanal (4 bolsas)',
      'Planchado a vapor manual',
      'Desmanchado inteligente',
    ],
  },
] as const;

export function PricingCards() {
  return (
    <section className="px-6 md:px-16 py-12">
      <div
        className="max-w-6xl mx-auto rounded-[40px] px-8 md:px-12 py-14"
        style={{
          backgroundColor: 'var(--indigo-surface-2)',
          border: '1px solid var(--indigo-border)',
        }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <span
            className="inline-block px-4 py-1 rounded-full text-xs font-semibold tracking-widest uppercase mb-4"
            style={{
              background: 'rgba(192,193,255,0.08)',
              color: 'var(--indigo-primary-dim)',
            }}
          >
            Precios
          </span>
          <h2
            className="font-montserrat text-3xl md:text-4xl font-bold text-white mb-3"
            style={{ letterSpacing: '-0.01em' }}
          >
            Precios Transparentes
          </h2>
          <p
            className="font-inter text-sm max-w-md mx-auto leading-relaxed"
            style={{ color: 'var(--indigo-text-muted)' }}
          >
            Sin sorpresas ni cargos ocultos. El precio que ves es el que
            pagas por el cuidado de tus prendas.
          </p>
        </div>

        {/* Grid de planes */}
        <div className="grid md:grid-cols-3 gap-5 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-[24px] p-7 ${
                plan.featured ? 'md:-translate-y-3' : ''
              }`}
              style={{
                backgroundColor: plan.featured
                  ? 'var(--indigo-surface)'
                  : 'rgba(255,255,255,0.04)',
                border: plan.featured
                  ? '2px solid var(--indigo-lavender)'
                  : '1px solid var(--indigo-border)',
                boxShadow: plan.featured
                  ? '0 24px 48px rgba(0,0,0,0.4)'
                  : 'none',
              }}
            >
              {/* Nombre + badge */}
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-montserrat text-base font-semibold text-white">
                  {plan.name}
                </h3>
                {plan.featured && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: 'var(--indigo-lavender)' }}
                  >
                    RECOMENDADO
                  </span>
                )}
              </div>

              {/* Precio */}
              <div className="mt-3 mb-6">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
                <span
                  className="text-sm ml-1"
                  style={{ color: 'var(--indigo-text-faint)' }}
                >
                  {plan.period}
                </span>
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-3 flex-grow mb-7">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-sm font-inter"
                    style={{ color: 'var(--indigo-text-muted)' }}
                  >
                    <span
                      style={{
                        color: plan.featured
                          ? 'var(--indigo-secondary)'
                          : 'var(--indigo-tertiary)',
                        fontWeight: 600,
                      }}
                    >
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* Botón */}
              <Link href={`/pedido?plan=${plan.queryParam}`}>
                <button
                  className="w-full py-3 rounded-full font-semibold text-sm transition-opacity hover:opacity-90"
                  style={
                    plan.featured
                      ? {
                          backgroundColor: '#E91E63',
                          color: '#ffffff',
                          border: 'none',
                        }
                      : {
                          backgroundColor: 'transparent',
                          color: 'var(--indigo-primary-dim)',
                          border: '1.5px solid #333',
                        }
                  }
                >
                  Seleccionar
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/PricingCards.tsx
git commit -m "feat(pricing): add PricingCards with 3 plans, featured Confort XL, links to /pedido?plan=X"
```

---

## Task 7: CTASection — Llamada Final a la Acción

**Files:**
- Create: `src/components/CTASection.tsx`

- [ ] **Step 1: Crear `src/components/CTASection.tsx`**

```tsx
import Link from 'next/link';

export function CTASection() {
  return (
    <section
      className="px-6 md:px-16 py-24 text-center"
      style={{ backgroundColor: 'var(--indigo-bg)' }}
    >
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
        <h2
          className="font-montserrat text-4xl md:text-5xl font-bold text-white leading-tight"
          style={{ letterSpacing: '-0.02em' }}
        >
          ¿Listo para liberar tu tiempo?
        </h2>
        <p
          className="font-inter text-base md:text-lg leading-relaxed"
          style={{ color: 'var(--indigo-text-muted)' }}
        >
          Únete a los profesionales que han delegado su lavandería a Express
          Wash. Tu primera recogida con descuento especial.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/pedido">
            <button
              className="rounded-full font-semibold px-8 py-4 text-base text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--indigo-btn)', border: 'none' }}
            >
              Hacer mi primer pedido
            </button>
          </Link>
          <button
            className="rounded-full px-8 py-4 text-base font-semibold transition-colors"
            style={{
              backgroundColor: 'transparent',
              border: '1.5px solid #333',
              color: 'var(--indigo-primary-dim)',
            }}
            onClick={() => {
              const chatBtn = document.querySelector<HTMLButtonElement>(
                '[data-chatbot-trigger]',
              );
              chatBtn?.click();
            }}
          >
            Hablar con Washi 🤖
          </button>
        </div>
      </div>
    </section>
  );
}
```

> Nota: el botón "Hablar con Washi" necesita que `ChatbotWidget` exponga un `data-chatbot-trigger` en su botón. Si ese atributo no existe, el click no hace nada pero tampoco rompe nada — es una mejora progresiva.

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/CTASection.tsx
git commit -m "feat(cta): add CTASection with primary CTA and Washi chatbot trigger"
```

---

## Task 8: Footer — Actualizar Colores a Índigo

**Files:**
- Modify: `src/components/Footer.tsx`

- [ ] **Step 1: Reemplazar `src/components/Footer.tsx`**

```tsx
const WHATSAPP_URL =
  'https://wa.me/56942749703?text=' +
  encodeURIComponent('Hola! Quiero consultar sobre sus servicios de lavandería.');

export function Footer() {
  return (
    <footer
      className="border-t py-10 px-6 md:px-16"
      style={{
        backgroundColor: '#050508',
        borderColor: 'var(--indigo-border-2)',
      }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <h3
            className="font-montserrat font-bold text-lg mb-3"
            style={{ color: 'var(--indigo-primary)' }}
          >
            Express Delivery Wash
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: '#444' }}>
            Lavandería a domicilio en Santiago, Chile.
            <br />
            Retiro y entrega en 24–48 horas.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3 font-montserrat text-sm">
            Horarios
          </h4>
          <p className="text-sm leading-relaxed" style={{ color: '#444' }}>
            Lunes a Viernes: 8:00 – 20:00
            <br />
            Sábado: 9:00 – 17:00
            <br />
            Domingo: Cerrado
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3 font-montserrat text-sm">
            Contacto
          </h4>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm block mb-2 transition-colors hover:opacity-80"
            style={{ color: 'var(--indigo-tertiary)' }}
          >
            💬 WhatsApp (solo mensajes)
          </a>
          <p className="text-sm" style={{ color: '#444' }}>
            Cobertura: 15 km desde Santiago centro
          </p>
        </div>
      </div>

      <div
        className="text-center text-xs pt-6 border-t space-y-1"
        style={{ borderColor: '#111' }}
      >
        <p style={{ color: '#222' }}>
          © {new Date().getFullYear()} Express Delivery Wash · Santiago, Chile
        </p>
        <p style={{ color: '#333' }}>
          Desarrollada por{' '}
          <span className="font-semibold" style={{ color: '#444' }}>
            Nelson Figueroa Albarrán
          </span>{' '}
          · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Footer.tsx
git commit -m "feat(footer): update colors to Dark+Indigo system, Montserrat headers"
```

---

## Task 9: Ensamblar page.tsx — Integrar Todas las Secciones

**Files:**
- Modify: `src/app/page.tsx`

Esta tarea conecta todos los componentes nuevos en la landing.

- [ ] **Step 1: Reemplazar `src/app/page.tsx`**

```tsx
import { Hero } from '@/components/Hero';
import { BentoGrid } from '@/components/BentoGrid';
import { CalculadoraPedido } from '@/components/CalculadoraPedido';
import { FeaturesSection } from '@/components/FeaturesSection';
import { PricingCards } from '@/components/PricingCards';
import { MapaCobertura } from '@/components/MapaCobertura';
import { CTASection } from '@/components/CTASection';
import { Footer } from '@/components/Footer';
import { ChatbotWidget } from '@/components/ChatbotWidget';

export default function Home() {
  return (
    <main>
      <Hero />
      <BentoGrid />
      <FeaturesSection />
      <PricingCards />
      <CalculadoraPedido />
      <MapaCobertura />
      <CTASection />
      <Footer />
      <ChatbotWidget />
    </main>
  );
}
```

> Nota: `ServiciosGrid` ya no se importa. `CalculadoraPedido` se mantiene entre PricingCards y el mapa — así los planes de precio contextualizan la calculadora de items personalizada.

- [ ] **Step 2: Verificar en dev — revisión visual completa**

```bash
npm run dev
```

Abrir `http://localhost:3000` y verificar scroll completo:
- [ ] Navbar/header con fondo oscuro (revisar layout.tsx body)
- [ ] Hero con imagen Unsplash y badge flotante
- [ ] BentoGrid con 2 imágenes de Unsplash
- [ ] FeaturesSection con imagen de lavandería
- [ ] PricingCards con 3 planes, Confort XL destacado
- [ ] CalculadoraPedido (sin cambios funcionales)
- [ ] Mapa Leaflet visible
- [ ] CTASection con 2 botones
- [ ] Footer con colores índigo y firma

- [ ] **Step 3: Verificar TypeScript y build**

```bash
npx tsc --noEmit
npm run build
```

Esperado: build exitoso. El `.next/standalone/` debe generarse correctamente.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(page): assemble new landing with BentoGrid, FeaturesSection, PricingCards, CTASection"
```

---

## Task 10: Push Final y Verificación en Producción

**Files:** Ninguno nuevo — solo git push y verificación.

- [ ] **Step 1: Verificar que no hay archivos sensibles**

```bash
git status
```

Confirmar que `.env.local` y `key.json` NO aparecen en la lista.

- [ ] **Step 2: Push a main**

```bash
git push origin main
```

- [ ] **Step 3: Monitorear GitHub Actions**

Abrir: `https://github.com/nfigueroaa/express-wash/actions`

Esperar ~5 minutos a que el workflow `Deploy to Cloud Run` complete con ✅.

- [ ] **Step 4: Verificar en producción**

Abrir: `https://express-wash-4hgom7r2cq-tl.a.run.app`

Checklist final:
- [ ] Hero carga con imagen Unsplash
- [ ] BentoGrid muestra 2 imágenes reales
- [ ] Sección Features visible
- [ ] Pricing Cards 3 planes
- [ ] Calculadora interactiva funciona
- [ ] Mapa Leaflet visible
- [ ] CTA Section
- [ ] Footer con firma de Nelson Figueroa Albarrán
- [ ] Chatbot responde
- [ ] `/pedido` funciona y acepta pedidos

- [ ] **Step 5: Actualizar ROADMAP.md — marcar P1.1 como completado**

En `ROADMAP.md`, cambiar el item `#4: Imágenes & Brand Assets` a:
```
- [x] #4: Imágenes & Brand Assets ✅ Completado 2026-05-13
```

```bash
git add ROADMAP.md
git commit -m "docs(roadmap): mark P1.1 Imágenes & Brand Assets as completed"
git push origin main
```

---

## Resumen de Commits

Al finalizar todas las tasks, el historial debe verse así:

```
feat(design): add Dark+Indigo CSS variables, Tailwind tokens, Unsplash image domain
feat(design): add Montserrat+Inter via next/font, update body background
feat(hero): redesign to split layout with AI badge, Unsplash image, floating delivery badge
feat(bento): add BentoGrid component with Unsplash images
feat(features): add FeaturesSection with AI/GCP/Easy Ordering and laundry image
feat(pricing): add PricingCards with 3 plans, featured Confort XL
feat(cta): add CTASection with primary CTA and Washi chatbot trigger
feat(footer): update colors to Dark+Indigo system
feat(page): assemble new landing with all new sections
docs(roadmap): mark P1.1 as completed
```

**Total: 10 commits · 4 componentes nuevos · 5 archivos modificados**
