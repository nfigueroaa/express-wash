# Arquitectura del Sistema — Express Delivery Wash

**Última actualización:** 2026-05-14 | **Estado:** Dark+Indigo redesign (P1.1) ✅ Desplegado

---

## Diagrama de Flujo

```
Cliente Web
    │
    ├── GET  /              → Landing (Hero → BentoGrid → FeaturesSection → PricingCards 
    │                                        → CalculadoraPedido → MapaCobertura → CTASection)
    │
    ├── GET  /pedido        → Formulario de pedido (con calculadora customizable)
    │       │
    │       ├── GET /api/geo?q=... → Nominatim → Haversine → GeoResult
    │       └── POST /api/order  → Firestore.addDoc("pedidos")
    │                               └── POST /api/notify → EmailJS API
    │
    ├── GET  /admin         → PedidosTable → Firestore.getDocs("pedidos")
    │
    └── POST /api/chat      → detectarEscalacion() → Claude Haiku 4.5 API
    
    [Sidebar Floating]
    └── ChatbotWidget       → Client-side chat, integración Washi
```

---

## Stack Tecnológico y Decisiones

### Frontend Framework: Next.js 14 App Router
| Aspecto | Decisión | Alternativa | Razón |
|--------|----------|-------------|-------|
| **Router** | App Router (Server Components) | Pages Router | Mejor performance, SSR nativo, server-side secrets seguros |
| **Renderizado** | Server + Client híbrido | Solo Client (SPA) | Componentes visuales (Hero, Grid, Cards) son Server para SEO |
| **Output** | Standalone Docker | Vercel deploy | Autonomía total, GCP Cloud Run, sin vendor lock-in |

**Por qué este stack:**
- Server Components (Hero, BentoGrid, FeaturesSection, PricingCards, Footer) rinden el HTML inicial completo
- Client Components (CTASection, ChatbotWidget) manejan interactividad sin sacrificar speed
- API routes (`/api/geo`, `/api/order`, `/api/notify`, `/api/chat`) en el mismo monorepo

---

### Diseño Visual: Dark+Indigo + Montserrat + Inter

#### Paleta de Colores CSS Variables
```css
:root {
  /* Fondos */
  --indigo-bg:         #09090f;    /* Fondo principal (muy oscuro, casi negro) */
  --indigo-surface:    #111128;    /* Cards, secciones secundarias */
  
  /* Texto y UI */
  --indigo-primary:    #c0c1ff;    /* Texto principal, logo, contraste alto */
  --indigo-secondary:  #8a8bb8;    /* Texto secundario, labels */
  --indigo-tertiary:   #60b1ea;    /* Chips, checkmarks, accents suaves */
  
  /* Botones y CTAs */
  --indigo-btn:        #2e3192;    /* Botones primarios (índigo oscuro) */
  --indigo-lavender:   #6d4ca6;    /* Featured plans, acentos premium */
  --cta-magenta:       #E91E63;    /* SOLO Confort XL featured CTA */
}
```

**Por qué esta paleta:**
1. **Dark+Indigo mantiene identidad oscura** — App original era dark, evitamos cambio radical
2. **Índigo/Lavanda del "Stitch" design system** — Coherencia visual con marca
3. **Magenta reservado** — Solo en botón CTA de Confort XL (featured plan), destaca sin abrumar
4. **Alto contraste** — #c0c1ff sobre #09090f = 12:1 WCAG AAA ✓

#### Tipografía: Google Fonts
| Fuente | Pesos | Uso | Alternativa descartada |
|--------|-------|-----|----------------------|
| **Montserrat** | 600, 700 | H1-H3, CTAs, headlines | System fonts (-apple-system) |
| **Inter** | 400, 500, 600 | Body, UI, labels | Futura, Avenir (no gratuitas) |

**Por qué Google Fonts:**
- Gratuito y sin API key requerida
- Buen contraste visual: Montserrat (serif-like, geometric) vs Inter (sans humanista)
- Rápido, servido desde CDN global (`next/font/google`)
- Configurable en `layout.tsx` con fallback CSS variables

---

### Gestión de Imágenes: Unsplash (no iconos SVG)

| Componente | Fuente | Imagen | Razón |
|-----------|--------|--------|-------|
| Hero | Unsplash | Laundry service real | Humanidad, conexión emocional |
| BentoGrid (Prendas) | Unsplash | Ropa limpia/plegada | Visual, no abstracto |
| BentoGrid (Plumones) | Unsplash | Cubrecamas lavado | Muestra servicio específico |
| FeaturesSection | Unsplash | Lavandería moderna | Confianza, profesionalismo |

**Por qué Unsplash sobre iconos SVG:**
- SVG: abstracto, requiere interpretación (↓ conversión)
- Fotos reales: visceral, storytelling inmediato (↑ engagement)
- Libre para uso comercial (sin atribución requerida)
- Sin API key, sin quotas

**Limitación conocida:** URLs de Unsplash pueden rotar/desaparecer
**Mitigación:** Monitorear en P1.2, considerar backups locales en Q2

---

### Base de Datos: Firebase Firestore

| Decisión | Alternativa | Razón |
|----------|-------------|-------|
| **Client SDK (no Admin)** | Admin SDK | Regla KISS: Firestore rules manejan auth/permisos, client escribe directo |
| **Colección "pedidos"** | SQL relacional | NoSQL: sin schema rígido, escala horizontal, $0 en capa gratuita |

---

### Notificaciones: EmailJS + Claude Haiku 4.5

| Herramienta | Costo | Razón | Alternativa |
|-----------|-------|-------|-------------|
| **EmailJS** | 200 emails/mes gratis | API REST simple, transaccional | SendGrid ($10-20/mes) |
| **Claude Haiku 4.5** | ~$1.20/mes | 50 chats/día, respuestas naturales en español | Gemini Flash 2.5 (más barato pero nuevo secret) |

**API flow:**
```
POST /api/notify → EmailJS template → owner@email.com
POST /api/chat  → Claude Haiku API → detectarEscalacion() → response
```

---

### Hosting: GCP Cloud Run

| Característica | Valor | Implicación |
|-----------------|-------|------------|
| **Escala** | 0 → N automático | Cero costo en inactividad |
| **Región** | southamerica-west1 (São Paulo) | Latencia ~40ms a Chile |
| **Cuota gratis** | 2M requests/mes | ~67k requests/día sin costo |
| **Dockerfile** | Node.js 20 LTS | Standalone Next.js output |

**Variables de entorno:**
- Build-time (`NEXT_PUBLIC_*`): compiladas en bundle → seguras enviar a cliente
- Runtime (sin `NEXT_PUBLIC_`): ANTHROPIC_API_KEY, OWNER_EMAIL → solo servidor, pasadas via `--set-env-vars`

---

## Componentes Principales

### Arquitectura de Página: Landing (`src/app/page.tsx`)

```
Landing
├── <Hero />
│   └── 2-col split: copy + Unsplash hero image, badges flotantes
│
├── <BentoGrid />
│   ├── Card 1 (1 col): Prendas Diarias + img
│   └── Card 2 (2 cols): Cubrecamas & Plumones + img
│
├── <FeaturesSection />
│   ├── Feature 1: AI-Driven Support
│   ├── Feature 2: GCP Infrastructure
│   ├── Feature 3: Easy Ordering
│   └── Img derecha: lavandería moderna
│
├── <PricingCards />
│   ├── Plan 1: Essential ($15.990)
│   ├── Plan 2: Confort XL ($24.990) [featured, magenta CTA]
│   └── Plan 3: Deluxe AI ($39.990)
│
├── <CalculadoraPedido />
│   └── Calculadora precios, integración con plan seleccionado
│
├── <MapaCobertura />
│   └── dynamic({ ssr: false }) → Leaflet mapa 15 km
│
├── <CTASection />
│   ├── CTA final: "¿Listo para liberar tu tiempo?"
│   └── Botón primario + Washi chatbot trigger
│
└── <ChatbotWidget />
    └── Floating chat, Claude Haiku 4.5
```

### Componentes Detallados

| Componente | Ubicación | Server/Client | Responsabilidad | Estado |
|-----------|-----------|---------------|-----------------|--------|
| **Hero** | `src/components/Hero.tsx` | Server | 2-col split: copy izq (badge "Impulsado por Google Cloud AI" + "Recogida Express < 60 min"), Unsplash img derecha | ✅ Nuevo P1.1 |
| **BentoGrid** | `src/components/BentoGrid.tsx` | Server | 2 cards: Prendas Diarias (1 col) + Cubrecamas & Plumones (2 col), Unsplash imgs, alternancia visual | ✅ Nuevo P1.1 |
| **FeaturesSection** | `src/components/FeaturesSection.tsx` | Server | 3 features (AI, GCP, UX) + imagen derecha, copy explicativo | ✅ Nuevo P1.1 |
| **PricingCards** | `src/components/PricingCards.tsx` | Server | 3 planes, solo Confort XL usa magenta CTA, links a `/pedido?plan={X}` | ✅ Nuevo P1.1 |
| **CalculadoraPedido** | `src/components/CalculadoraPedido.tsx` | Server | Calcula precios según cantidad/peso, integra con plan seleccionado | ✅ Existente |
| **MapaCobertura** | `src/components/MapaCobertura.tsx` | Client (dynamic) | Leaflet + OpenStreetMap, 15 km radius, sin SSR | ✅ Existente |
| **CTASection** | `src/components/CTASection.tsx` | Client | CTA final + onClick Washi chatbot trigger, no Server | ✅ Nuevo P1.1 |
| **ChatbotWidget** | `src/components/ChatbotWidget.tsx` | Client | Floating chat sidebar, Claude Haiku 4.5, español natural | ✅ Existente |
| **Footer** | `src/components/Footer.tsx` | Server | Dark+Indigo colores, Montserrat headers, firma Nelson Figueroa Albarrán | ✅ Actualizado P1.1 |

---

## Decisiones de Diseño: Por Qué Cada Una

### 1. Dark+Indigo vs Sistema Completamente Nuevo
**Decisión:** Mantener fondos oscuros, adoptar índigo/lavanda del Stitch design system.
**Razón:** 
- Evita disrupción visual brutal con versión anterior
- Índigo/lavanda son más corporativos que la magenta pura
- Magenta reservado SOLO para featured CTA (Confort XL) = atención focal

**Alternativa descartada:** Colores completamente nuevos
- Requeriría rebranding de toda UI ya existente
- Choque visual con ChatbotWidget, admin panel, formularios antiguos
- Riesgo: confundir a usuarios registrados

---

### 2. Hero 2-Column Split
**Decisión:** Texto izquierda + Unsplash imagen derecha.
**Razón:**
- Moderno, balanceado, aprovecha pantalla ancha (1200px+)
- Lado izq = copy/CTA densa (menos scrolling requerido)
- Lado derecho = visual poderosa sin distractores textuales
- Badges flotantes crean profundidad

**Alternativa descartada:** Stack vertical (imagen arriba, copy abajo)
- Mobile-first thinking pero desktop es main traffic
- Requiere scroll mayor, menos impactante al cargar

---

### 3. BentoGrid Alternancia 1-2-2
**Decisión:** Card 1 (1 col) "Prendas Diarias" + Card 2 (2 cols) "Cubrecamas & Plumones".
**Razón:**
- Evita monotonía de grid uniforme
- 1-2 = F-pattern visual natural, mantiene scanability
- Posiciona "Cubrecamas" (premium) en lugar prominent (2 cols)

**Alternativa descartada:** 3-col uniforme (como Cards 2x2)
- Aburrido, predecible
- No diferencia servicios por importancia

---

### 4. 3 Features + 3 Pricing Plans
**Decisión:** Número mágico 3 en cada sección.
**Razón:**
- Memorable: 2 = incompleto, 4+ = cognitive overload
- Features (AI, GCP, UX) son los 3 pilares de positioning
- Pricing (Essential, Confort XL, Deluxe) cubre todo rango (presupuesto ↔ premium)

**Alternativa descartada:** 4+ features o planes
- Abruma al usuario
- Dilute mensaje principal
- Más opciones ≠ más conversión (paradoja de Hick's Law)

---

### 5. Unsplash Images vs Iconos SVG
**Decisión:** Fotos reales para Hero, BentoGrid, FeaturesSection.
**Razón:**
- **Icono SVG:** abstracto, requiere interpretación mental → slower processing
- **Foto real:** visceral, storytelling inmediato → faster emotional connection
- Aumenta confianza (humanidad > geometría)
- Libres para comercial, sin API key

**Alternativa descartada:** Illustrations (Blobs, Figma)
- Siguen siendo abstracciones
- Requieren diseñador/herramienta
- Unsplash es faster time-to-market

---

### 6. Montserrat 600/700 + Inter 400-600
**Decisión:** Dos fuentes, roles claros.
**Razón:**
- **Montserrat (geometric, heavy):** headlines = gravedad, autoridad
- **Inter (humanist, light):** body = legibilidad, amigabilidad
- Alto contraste de weight = jerarquía visual clara
- Google Fonts = gratuito, sin secrets

**Alternativa descartada:** System fonts only (-apple-system, Segoe UI)
- Menos distinguido visualmente
- Sin control de pesos
- Zero personalidad de marca

---

### 7. Magenta SOLO en Confort XL CTA
**Decisión:** #E91E63 reservado para featured plan button.
**Razón:**
- Magenta en toda la UI = loses impact (habituación)
- Confort XL = best-seller, merece atención focal
- Resto de UI = índigo = consistencia, no competencia

**Alternativa descartada:** Magenta en múltiples elementos
- Visual fatigue
- No hay jerarquía
- Los usuarios ignoran lo que aparece "everywhere"

---

### 8. PricingCards "Landing Only" + CalculadoraPedido "/pedido Only"
**Decisión:** Las 2 coexisten (no reemplazar una con la otra).
**Razón:**
- **Landing cards:** venta persuasiva, números fijos, psicología de precios
- **Calculator /pedido:** customización, transparencia de cálculo (weight-based, distance)
- Usuarios deciden plan en landing, detallan en checkout

**Conflicto resuelto:** Ambas muestran precios pero:
- Cards = "desde $15.990" (round, memorable)
- Calculator = dinámico (actual = weight + distance)

---

### 9. Server Components (Hero, Grid, Cards, Footer) vs Client (CTA, Chat)
**Decisión:** Máximo SSR donde posible, Client solo para interactividad.
**Razón:**
- **Server:** mejor SEO, faster First Contentful Paint, sin JavaScript overhead
- **Client:** onClick handlers, state management (chat, plan selection)
- BentoGrid/FeaturesSection = puro render HTML → Server
- CTASection = onClick chatbot trigger → Client
- ChatbotWidget = WebSocket-like chat → Client

---

## Alternativas Consideradas (Por Qué NO)

### Tailwind Colors Only (sin CSS Variables)
**Considerado:** Usar `bg-indigo-900`, `text-indigo-100` directo.
**Descartado porque:**
- Tailwind colors no matcha exactamente paleta Stitch
- Cambiar tema requeriría editar todos los archivos (100+ líneas)
- CSS vars = 1 edit en `globals.css` = actualización global al instante

### Sistema de Colores Completamente Nuevo
**Considerado:** Paleta de 0, no heredada.
**Descartado porque:**
- Visual discontinuidad con v1 (Hero anterior, ChatbotWidget, Admin Table existentes)
- Usuarios registrados verían "qué pasó con la UI"
- Máximo que se soporta = evolución (Dark+Indigo es evolución, no revolución)

### 4+ Servicios en Landing
**Considerado:** Agregar Ropa Deportiva, Sábanas, Cortinas, etc.
**Descartado porque:**
- Cognitive overload (más de 3 = user no recuerda)
- Dilute propuesta de valor principal (lavandería express)
- BentoGrid crecería a 3+ cards = rompe 2-col balance
- Mejor: Add to `/servicios` subpage, link desde footer

### Google Maps en Lugar de Leaflet
**Considerado:** Mejor UX, más familiar.
**Descartado porque:**
- API key requerida (secreto adicional)
- Billing: primeros $200 gratis luego $7/1000 requests
- Nuestra latencia es baja con Nominatim + haversine
- Leaflet = 0 cost, 0 secrets, suficiente funcionalidad

---

## Limitaciones Conocidas y Mitigaciones

| Limitación | Impacto | Mitigación |
|-----------|--------|-----------|
| Unsplash URLs pueden rotar | Hero/BentoGrid/FeaturesSection imgbroken | P1.2: monitorear mensualmente, backups locales en /public |
| Montserrat solo H1-H3 | H4-H5 sin peso definido | Use Inter 600 para subheadings (<h4>) |
| Leaflet en browser (client) | Sin SSR | Ya mitigado: `dynamic({ ssr: false })` |
| PricingCards links a `/pedido?plan=` | Parámetro puede ignorarse | Calculator en /pedido valida `?plan` y pre-llena form |
| ChatbotWidget flotante | Puede ocluir contenido móvil | P2: collapsible sidebar en mobile < 768px |

---

## Próximos Pasos por Fase

### P1.2 — Validación QA (2026-05-15)
- [ ] Captura de pantalla responsive (desktop, tablet, mobile)
- [ ] Verificar Montserrat load times (Google Fonts CDN latency)
- [ ] Monitorear Unsplash URLs (setup alert si 404)
- [ ] Test accesibilidad (WCAG AA/AAA contrast)

### P1.3 — Ajustes de Feedback (2026-05-20)
- [ ] Chat training: actualizar Claude system prompt con BentoGrid servicios
- [ ] FAQ accordion: explicar diferencias Essential vs Confort XL vs Deluxe
- [ ] Mobile responsividad: BentoGrid stack vertical en <768px

### P2.x — Features (2026-06-01+)
- [ ] Payment gateway: Stripe/Mercado Pago integration
- [ ] Shopping Cart mejorado (persistencia localStorage)
- [ ] Admin panel redesign (alinear con Dark+Indigo)
- [ ] Chatbot training con nuevos servicios

---

## Referencias de Configuración

### Archivos Afectados por Redesign

| Archivo | Cambio | Commit |
|---------|--------|--------|
| `next.config.js` | Unsplash remotePatterns | `086af78` |
| `src/app/globals.css` | 13 CSS vars --indigo-*, --cta-magenta | `086af78` + fix `5e28486` |
| `tailwind.config.ts` | font-montserrat, font-inter tokens | `086af78` |
| `src/app/layout.tsx` | next/font Google imports + CSS vars expose | `f2c5c8b` |
| `src/components/Hero.tsx` | 2-col split, Unsplash, badges | `4df7b44` |
| `src/components/BentoGrid.tsx` | Nuevo, 1-2 grid, Unsplash | `849c976` |
| `src/components/FeaturesSection.tsx` | Nuevo, 3 features, imagen | `84dd289` |
| `src/components/PricingCards.tsx` | Nuevo, 3 planes, featured Confort | `665829d` |
| `src/components/CTASection.tsx` | Nuevo, CTA final + chatbot | `f656a04` |
| `src/components/Footer.tsx` | Dark+Indigo colors, Montserrat | `252f955` |
| `src/app/page.tsx` | Ensamblado: Hero → Grid → Features → Cards → Calcs → CTA | `9c5a47c` |
| `ROADMAP.md` | P1.1 completado ✅ | `d0e24fa` |

### Cómo Actualizar Este Documento

1. **Cambios en paleta de colores:** Edit `:root` en `src/app/globals.css` → reflejar acá
2. **Nuevos componentes:** Add row en tabla de componentes + referencia a commit
3. **Decisiones futuras:** Add sección bajo "Alternativas Consideradas" con alternativa descartada y razón
4. **Limitaciones descubiertas:** Add a tabla "Limitaciones Conocidas" con mitigación

---

## Deploy y Verificación

**Última ejecución:** 2026-05-14 10:45 UTC
**URL producción:** https://express-wash-4hgom7r2cq-tl.a.run.app
**CI/CD:** GitHub Actions → GCP Cloud Run
**Build time:** ~2 min
**Bundle size:** 21.4 kB (11 páginas)
