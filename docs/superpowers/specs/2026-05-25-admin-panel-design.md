# Panel de Administración — Design Spec

> **Para agentes:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reemplazar el panel admin básico existente con un dashboard funcional con autenticación Google, estadísticas, tabla de pedidos con acciones y auto-refresh.

**Architecture:** Next.js App Router con Firebase Auth (Google Sign-In) para protección de rutas vía middleware. La lista de admins autorizados se gestiona en Firestore colección `admins`. El panel consume los endpoints existentes `/api/pedidos` y `/api/pedidos/:id`.

**Tech Stack:** Next.js 14, Firebase Auth, Firebase Admin SDK, Tailwind CSS, Dark+Indigo design system

---

## Contexto del proyecto

- **URL producción:** https://express-wash-4hgom7r2cq-tl.a.run.app
- **Admin actual:** `/admin` — existe pero solo muestra "Cargando pedidos..." sin funcionar
- **APIs disponibles:** `GET /api/pedidos`, `PATCH /api/pedidos/:id`
- **Design system:** Dark+Indigo (`--indigo-bg: #09090f`, `--indigo-surface: #111128`, `--indigo-primary: #c0c1ff`, `--indigo-btn: #2e3192`)
- **Firebase:** Ya configurado con Admin SDK en `src/lib/firestore-admin.ts`

---

## Estructura de archivos

### Archivos nuevos
- `src/app/admin/login/page.tsx` — Pantalla de login con Google
- `src/app/admin/layout.tsx` — Layout con sidebar (reemplaza implícito)
- `src/middleware.ts` — Protección de rutas `/admin/*`
- `src/lib/auth.ts` — Helpers de Firebase Auth (verificar sesión, obtener usuario)
- `src/app/api/auth/session/route.ts` — POST: crear cookie de sesión / DELETE: cerrar sesión
- `src/app/api/auth/verify/route.ts` — GET: verificar si email está en lista de admins
- `src/components/admin/Sidebar.tsx` — Sidebar con navegación y usuario activo
- `src/components/admin/StatsCards.tsx` — Cards de estadísticas (4 métricas)
- `src/components/admin/PedidosTableAdmin.tsx` — Tabla con auto-refresh y acciones
- `src/components/admin/DetalleModal.tsx` — Modal con detalle completo del pedido
- `src/components/admin/NotaForm.tsx` — Formulario inline para agregar nota

### Archivos modificados
- `src/app/admin/page.tsx` — Reemplazar contenido con StatsCards + PedidosTableAdmin
- `src/components/PedidosTable.tsx` — Sin cambios (se mantiene, lo reemplaza PedidosTableAdmin en admin)
- `src/lib/firestore-admin.ts` — Agregar: `verificarAdmin(email)`, `listarAdmins()`
- `src/lib/types.ts` — Agregar tipo `Admin`

---

## Diseño por sección

### 1. Autenticación con Google

**Flujo:**
1. Usuario accede a `/admin/*`
2. Middleware verifica cookie `session` (Firebase session cookie)
3. Sin cookie válida → redirect a `/admin/login`
4. En `/admin/login` → botón "Entrar con Google" → Firebase Auth popup
5. Firebase retorna ID token → POST `/api/auth/session` → verifica email en Firestore → crea cookie httpOnly
6. Si email NO está en lista `admins` → error "No autorizado"
7. Si email SÍ está → redirect a `/admin`

**Colección Firestore `admins`:**
```
admins/
  {email}/
    email: string
    nombre: string
    activo: boolean
    creadoEn: timestamp
```

El primer admin (dueño) se agrega manualmente en Firebase Console. Admins adicionales se agregan desde Firebase Console también (no hay UI de gestión en esta versión).

**Cookie de sesión:**
- Nombre: `session`
- httpOnly: true
- Secure: true (en producción)
- MaxAge: 5 días (Firebase session cookies máximo 14 días)
- SameSite: strict

**Variables de entorno requeridas:**
- `NEXT_PUBLIC_FIREBASE_CONFIG` — ya existe
- No se necesitan nuevas vars (Firebase Admin SDK ya usa Application Default Credentials en Cloud Run)

### 2. Layout con Sidebar

**Estructura visual:**
```
┌─────────────────────────────────────────────┐
│ Sidebar (180px fijo)  │  Contenido principal │
│                       │                      │
│  ⚡ Express Wash      │  [Stats Cards]        │
│  Panel Admin          │                      │
│                       │  [Filtros]            │
│  > 📋 Pedidos         │  [Tabla Pedidos]      │
│    📊 Estadísticas    │                      │
│                       │                      │
│  ─────────────────    │                      │
│  [Avatar] Nelson F.   │                      │
│  Admin                │                      │
│  → Cerrar sesión      │                      │
└─────────────────────────────────────────────┘
```

**Sidebar items:**
- Pedidos → `/admin` (activo por defecto)
- Estadísticas → `/admin/estadisticas` (página futura, por ahora disabled)
- Sección usuario: avatar Google + nombre + email + botón cerrar sesión

### 3. Stats Cards (4 métricas)

Cards en grid de 4 columnas, calculadas desde los pedidos cargados (client-side, sin endpoint extra):

| Card | Métrica | Color borde |
|------|---------|-------------|
| Pendientes | `pedidos.filter(p => p.estado === 'pendiente').length` | `#f59e0b` (amarillo) |
| En proceso | `pedidos.filter(p => p.estado === 'en_proceso').length` | `#3b82f6` (azul) |
| Entregados | `pedidos.filter(p => p.estado === 'entregado').length` | `#22c55e` (verde) |
| Ingresos del mes | Suma de `total` de pedidos del mes actual | `#c0c1ff` (lavanda) |

### 4. Tabla de Pedidos con Auto-refresh

**Columnas:** Cliente (nombre + teléfono) | Dirección (+ km) | Items | Total | Estado | Fecha | Acciones

**Auto-refresh:** `setInterval` cada 30 segundos que llama a `GET /api/pedidos`. Indicador visual en UI: texto "🔄 Actualizado hace X seg" que se actualiza con cada refresh.

**Filtros por estado:** Chips clickeables: Todos | Pendiente | En proceso | Listo | Entregado | Cancelado. Cada chip muestra el count entre paréntesis.

**Acción 1 — Cambiar estado:**
- Dropdown `<select>` en la columna Estado
- Al cambiar → `PATCH /api/pedidos/:id` con nuevo estado
- Toast de confirmación: "Estado actualizado ✓"
- Reload inmediato de la tabla

**Acción 2 — Ver detalle (modal):**
- Botón "👁 Detalle" por fila
- Abre `DetalleModal` con:
  - Nombre, teléfono, email (si existe)
  - Dirección completa + coordenadas
  - Lista de items con cantidad y precio unitario
  - Subtotal, descuento, costo despacho, total
  - Estado actual + historial (si se implementa en el futuro)
  - Notas internas existentes
  - Fecha creación y última actualización

**Acción 3 — Nota interna:**
- Botón "📝 Nota" por fila
- Expande inline debajo de la fila (no modal)
- Textarea + botón "Guardar"
- Llama a `PATCH /api/pedidos/:id` con campo `notas`
- El campo `notas` ya existe en el tipo `Pedido`

### 5. Middleware de protección

```typescript
// src/middleware.ts
// Protege todas las rutas /admin/* excepto /admin/login
// Verifica cookie `session` con Firebase Admin SDK
// Sin cookie válida → redirect a /admin/login
// Con cookie válida → permite acceso
```

---

## Tipos nuevos

```typescript
// En src/lib/types.ts — agregar:
export interface Admin {
  email: string;
  nombre: string;
  activo: boolean;
  creadoEn: string;
}
```

---

## Manejo de errores

| Escenario | Comportamiento |
|-----------|----------------|
| Email de Google no en lista `admins` | Mostrar mensaje "No tienes acceso. Contacta al administrador." en `/admin/login` |
| Error al cargar pedidos | Mostrar mensaje de error con botón "Reintentar" |
| Error al cambiar estado | Toast de error: "Error al actualizar. Intenta nuevamente." |
| Sesión expirada (5 días) | Middleware detecta cookie inválida → redirect a `/admin/login` |
| Firebase Auth popup bloqueado | Mostrar instrucción: "Permite popups para este sitio" |

---

## Decisiones de diseño

1. **Google Sign-In vs contraseña:** Google es más seguro (2FA de Google, sin contraseñas que robar) y más conveniente. Costo $0.

2. **Lista de admins en Firestore vs env var:** Firestore permite agregar/quitar admins sin redeploy. La limitación es que requiere acceso a Firebase Console para gestionar, pero es aceptable para esta etapa.

3. **Stats calculadas client-side:** Los pedidos ya se cargan en la tabla. Calcular stats desde los datos cargados evita un endpoint extra y mantiene el costo en $0.

4. **Auto-refresh 30s vs WebSocket:** WebSocket sería más eficiente pero añade complejidad y costo. Un polling de 30 segundos es suficiente para un negocio de lavandería donde los pedidos no cambian en milisegundos.

5. **Nota inline vs modal:** La nota se expande debajo de la fila (inline) para no interrumpir el flujo de revisión de pedidos. El detalle completo sí abre modal porque requiere más espacio.

6. **PedidosTableAdmin separado de PedidosTable:** Se crea un nuevo componente específico para el admin en lugar de modificar el existente. El `PedidosTable` original podría usarse en otras partes del sitio.

---

## Out of scope (esta versión)

- UI de gestión de admins (agregar/quitar desde el panel) — se hace desde Firebase Console
- Página de Estadísticas completa (`/admin/estadisticas`) — queda disabled en sidebar
- Notificaciones push cuando llega un pedido nuevo
- Historial de cambios de estado por pedido
- Exportar pedidos a CSV/Excel
- Búsqueda de pedidos por nombre o dirección

---

## Setup requerido (manual, una vez)

1. En Firebase Console → Authentication → Sign-in method → habilitar Google
2. Agregar dominio de producción en Firebase Console → Authentication → Authorized domains:
   - `express-wash-4hgom7r2cq-tl.a.run.app`
3. En Firebase Console → Firestore → Crear colección `admins` → agregar primer documento con tu email

---

**Última actualización:** 2026-05-25
**Estado:** Aprobado por usuario — listo para implementación
