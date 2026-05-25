# Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el panel admin básico con un dashboard completo: autenticación Google vía Firebase Auth, sidebar, stats cards, tabla de pedidos con auto-refresh, cambio de estado, modal de detalle, y notas inline.

**Architecture:** Next.js 14 App Router. Middleware protege `/admin/*` verificando cookie `session` (Firebase session cookie). El layout server component verifica la cookie con Firebase Admin SDK y obtiene el usuario. Los componentes client-side consumen `/api/pedidos` con polling cada 30s. Los admins autorizados viven en Firestore colección `admins`.

**Tech Stack:** Next.js 14, Firebase Auth (Client SDK para Google Sign-In), Firebase Admin SDK (para crear/verificar session cookies y acceder a Firestore), Tailwind CSS, Dark+Indigo design system (`--indigo-bg: #09090f`, `--indigo-surface: #111128`, `--indigo-primary: #c0c1ff`, `--indigo-btn: #2e3192`)

---

## Contexto del proyecto

- **Repo:** https://github.com/nfigueroaa/express-wash
- **URL prod:** https://express-wash-4hgom7r2cq-tl.a.run.app
- **Firebase project:** `expresswash-prod-202605112332`
- **Stack existente:** Next.js 14, Firebase Admin SDK ya en uso en `src/lib/firestore-admin.ts`, firebase Client SDK v12.13 instalado
- **APIs existentes:** `GET /api/pedidos`, `PATCH /api/pedidos/:id` (solo acepta `estado`, habrá que extender para `notas`)
- **Tipos base:** `Pedido`, `EstadoPedido`, `ItemPedido` en `src/lib/types.ts`
- **Utilidades:** `formatCLP()` en `src/lib/utils.ts`

## Mapa de archivos

### Crear
- `src/lib/auth.ts` — verificar session cookie con Firebase Admin, retornar usuario admin
- `src/middleware.ts` — proteger `/admin/*`, redirect a `/admin/login` si no hay cookie
- `src/app/api/auth/session/route.ts` — POST: crear session cookie / DELETE: borrar cookie
- `src/app/admin/login/page.tsx` — pantalla de login con Google
- `src/app/admin/layout.tsx` — layout con sidebar, verifica sesión server-side
- `src/components/admin/Sidebar.tsx` — sidebar de navegación con usuario activo
- `src/components/admin/StatsCards.tsx` — 4 cards de métricas calculadas client-side
- `src/components/admin/DetalleModal.tsx` — modal con detalle completo del pedido
- `src/components/admin/PedidosTableAdmin.tsx` — tabla con auto-refresh, filtros, acciones

### Modificar
- `src/lib/types.ts` — agregar tipo `Admin` y `UsuarioAdmin`
- `src/lib/firestore-admin.ts` — agregar `verificarAdmin()` y `actualizarPedidoParcial()`
- `src/app/api/pedidos/[id]/route.ts` — PATCH también acepta `notas`
- `src/app/admin/page.tsx` — ensamblar `StatsCards` + `PedidosTableAdmin`

---

## Task 1: Tipos + Firestore helpers

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/lib/firestore-admin.ts`

- [ ] **Step 1: Agregar tipos `Admin` y `UsuarioAdmin` en `src/lib/types.ts`**

Al final del archivo, después de `PrecioServicio`:

```typescript
export interface Admin {
  email: string;
  nombre: string;
  activo: boolean;
  creadoEn: string;
}

export interface UsuarioAdmin {
  email: string;
  nombre: string;
  foto?: string;
}
```

- [ ] **Step 2: Agregar `verificarAdmin()` y `actualizarPedidoParcial()` en `src/lib/firestore-admin.ts`**

Agregar al final del archivo:

```typescript
/**
 * Verifica si un email está en la colección 'admins' y tiene activo: true.
 * Si el campo 'activo' no existe, asume true (retrocompatibilidad).
 */
export async function verificarAdmin(email: string): Promise<boolean> {
  const db = getDb();
  const doc = await db.collection('admins').doc(email).get();
  if (!doc.exists) return false;
  const data = doc.data();
  return data?.activo !== false; // true si activo no está definido o es true
}

/**
 * Actualiza campos parciales de un pedido (estado y/o notas).
 * Siempre actualiza actualizadoEn.
 */
export async function actualizarPedidoParcial(
  id: string,
  updates: Partial<Pick<Pedido, 'estado' | 'notas'>>,
): Promise<void> {
  const db = getDb();
  await db.collection('pedidos').doc(id).update({
    ...updates,
    actualizadoEn: new Date().toISOString(),
  });
}
```

- [ ] **Step 3: Verificar que TypeScript compila sin errores**

```bash
cd "C:\Users\figue\Documents\Proyectos\Claude Code\edwash"
npx tsc --noEmit
```

Esperado: Sin errores (o solo warnings preexistentes).

- [ ] **Step 4: Commit**

```bash
git add src/lib/types.ts src/lib/firestore-admin.ts
git commit -m "feat(admin): add Admin types and Firestore helpers (verificarAdmin, actualizarPedidoParcial)"
```

---

## Task 2: Extender PATCH /api/pedidos/:id para aceptar notas

**Files:**
- Modify: `src/app/api/pedidos/[id]/route.ts`

- [ ] **Step 1: Reemplazar el contenido completo de `src/app/api/pedidos/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { actualizarPedidoParcial } from '@/lib/firestore-admin';
import type { EstadoPedido } from '@/lib/types';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * PATCH /api/pedidos/:id
 * Actualiza estado y/o notas de un pedido.
 * Body: { "estado"?: EstadoPedido, "notas"?: string }
 * Al menos uno de los dos campos debe estar presente.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();
    const { estado, notas } = body as { estado?: EstadoPedido; notas?: string };

    if (estado === undefined && notas === undefined) {
      return NextResponse.json(
        { error: 'Se requiere al menos "estado" o "notas"' },
        { status: 400 },
      );
    }

    const estadosValidos: EstadoPedido[] = [
      'pendiente', 'en_proceso', 'listo', 'entregado', 'cancelado',
    ];

    if (estado !== undefined && !estadosValidos.includes(estado)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
    }

    const updates: Partial<{ estado: EstadoPedido; notas: string }> = {};
    if (estado !== undefined) updates.estado = estado;
    if (notas !== undefined) updates.notas = notas;

    await actualizarPedidoParcial(id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[pedidos PATCH] Error:', error);
    return NextResponse.json({ error: 'Error actualizando pedido' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Probar que notas funciona**

```bash
# Reemplaza <ID> con un id real de Firestore (consúltalo en /api/pedidos)
curl -X PATCH "http://localhost:3000/api/pedidos/<ID>" \
  -H "Content-Type: application/json" \
  -d '{"notas":"Nota de prueba desde plan"}' \
  -s | python3 -m json.tool
```

Esperado: `{"success": true}`

- [ ] **Step 3: Commit**

```bash
git add src/app/api/pedidos/[id]/route.ts
git commit -m "feat(admin): extend PATCH /api/pedidos/:id to accept notas field"
```

---

## Task 3: Firebase Auth — API de sesión

**Files:**
- Create: `src/app/api/auth/session/route.ts`
- Create: `src/lib/auth.ts`

- [ ] **Step 1: Crear `src/lib/auth.ts`**

```typescript
import * as admin from 'firebase-admin';
import { verificarAdmin } from './firestore-admin';
import type { UsuarioAdmin } from './types';

/**
 * Verifica una Firebase session cookie y retorna el usuario admin si es válido.
 * Retorna null si la cookie es inválida, expirada, o el email no está en 'admins'.
 */
export async function verifySessionCookie(
  sessionCookie: string,
): Promise<UsuarioAdmin | null> {
  try {
    // Reutiliza la inicialización de firestore-admin si ya ocurrió
    if (!admin.apps.length) {
      admin.initializeApp({ projectId: 'expresswash-prod-202605112332' });
    }

    // Verifica la cookie (checkRevoked: true revoca sesiones de usuarios eliminados)
    const decoded = await admin.auth().verifySessionCookie(sessionCookie, true);

    if (!decoded.email) return null;

    // Verifica que el email está en la lista de admins
    const esAdmin = await verificarAdmin(decoded.email);
    if (!esAdmin) return null;

    return {
      email: decoded.email,
      nombre: decoded.name || decoded.email,
      foto: decoded.picture,
    };
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Crear `src/app/api/auth/session/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { verificarAdmin } from '@/lib/firestore-admin';

const SESSION_DURATION_MS = 60 * 60 * 24 * 5 * 1000; // 5 días

function getAdminApp() {
  if (!admin.apps.length) {
    admin.initializeApp({ projectId: 'expresswash-prod-202605112332' });
  }
  return admin;
}

/**
 * POST /api/auth/session
 * Recibe un Firebase ID token, verifica que el email esté en 'admins',
 * y crea una session cookie httpOnly de 5 días.
 */
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: 'idToken requerido' }, { status: 400 });
    }

    const adminSdk = getAdminApp();

    // Verificar el ID token de Firebase
    const decoded = await adminSdk.auth().verifyIdToken(idToken);

    if (!decoded.email) {
      return NextResponse.json({ error: 'Email no disponible' }, { status: 400 });
    }

    // Verificar que el email está en la lista de admins
    const esAdmin = await verificarAdmin(decoded.email);
    if (!esAdmin) {
      return NextResponse.json(
        { error: 'No tienes acceso. Contacta al administrador.' },
        { status: 403 },
      );
    }

    // Crear la session cookie de Firebase (válida 5 días)
    const sessionCookie = await adminSdk
      .auth()
      .createSessionCookie(idToken, { expiresIn: SESSION_DURATION_MS });

    const response = NextResponse.json({ success: true });

    response.cookies.set('session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: SESSION_DURATION_MS / 1000, // en segundos
      path: '/',
      sameSite: 'strict',
    });

    return response;
  } catch (error) {
    console.error('[auth/session POST] Error:', error);
    return NextResponse.json({ error: 'Error al crear sesión' }, { status: 500 });
  }
}

/**
 * DELETE /api/auth/session
 * Elimina la session cookie (logout).
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/',
  });
  return response;
}
```

- [ ] **Step 3: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: Sin errores nuevos.

- [ ] **Step 4: Commit**

```bash
git add src/lib/auth.ts src/app/api/auth/session/route.ts
git commit -m "feat(admin): add Firebase Auth session API (POST/DELETE) and verifySessionCookie helper"
```

---

## Task 4: Middleware de protección de rutas

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Crear `src/middleware.ts`**

El middleware corre en Edge Runtime (no puede usar Firebase Admin SDK). Solo verifica que la cookie `session` existe. La verificación real de validez ocurre en el layout server component.

```typescript
import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware de Next.js para proteger rutas /admin/*.
 * Verifica presencia de cookie 'session'.
 * La validez real se verifica en AdminLayout (server component).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get('session')?.value;

  const isLoginPage = pathname === '/admin/login';

  // Sin cookie → redirigir a login (excepto si ya está en login)
  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Con cookie → si está en login, redirigir al panel
  if (session && isLoginPage) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
```

- [ ] **Step 2: Verificar que el middleware se aplica correctamente**

Con el dev server corriendo (`npm run dev`):

```bash
# Sin cookie: debe redirigir a /admin/login
curl -s -o /dev/null -w "%{http_code} %{redirect_url}" http://localhost:3000/admin
```

Esperado: `307 http://localhost:3000/admin/login`

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat(admin): add Next.js middleware to protect /admin/* routes"
```

---

## Task 5: Página de login con Google

**Files:**
- Create: `src/app/admin/login/page.tsx`

- [ ] **Step 1: Crear directorio y archivo**

```bash
mkdir -p src/app/admin/login
```

- [ ] **Step 2: Crear `src/app/admin/login/page.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// Inicializar Firebase Client SDK (reutiliza si ya fue inicializado)
const firebaseConfig = JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG!);
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'No tienes acceso. Contacta al administrador.');
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('popup')) {
        setError('Permite popups para este sitio e intenta nuevamente.');
      } else {
        setError('Error al iniciar sesión. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--indigo-bg)' }}
    >
      <div
        className="rounded-xl p-8 w-full max-w-sm text-center"
        style={{ backgroundColor: '#111128', border: '1px solid #1a1a2e' }}
      >
        <div
          className="text-2xl font-bold mb-1"
          style={{ color: '#c0c1ff', fontFamily: 'Montserrat, sans-serif' }}
        >
          ⚡ Express Wash
        </div>
        <div className="text-sm mb-8" style={{ color: '#555' }}>
          Panel de administración
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg font-medium text-sm transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
          style={{ backgroundColor: '#fff', color: '#333' }}
        >
          {/* Logo G de Google */}
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {loading ? 'Iniciando sesión...' : 'Entrar con Google'}
        </button>

        {error && (
          <div
            className="mt-4 text-xs px-3 py-2 rounded"
            style={{
              backgroundColor: '#2d1515',
              color: '#ef4444',
              border: '1px solid #ef444433',
            }}
          >
            {error}
          </div>
        )}

        <div className="mt-6 text-xs" style={{ color: '#444' }}>
          Solo usuarios autorizados
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Verificar que la página carga**

```bash
# Con dev server corriendo:
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/admin/login
```

Esperado: `200`

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/login/page.tsx
git commit -m "feat(admin): add Google Sign-In login page at /admin/login"
```

---

## Task 6: Sidebar + Layout del admin

**Files:**
- Create: `src/components/admin/Sidebar.tsx`
- Create: `src/app/admin/layout.tsx`

- [ ] **Step 1: Crear directorio de componentes admin**

```bash
mkdir -p src/components/admin
```

- [ ] **Step 2: Crear `src/components/admin/Sidebar.tsx`**

```typescript
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { UsuarioAdmin } from '@/lib/types';

interface SidebarProps {
  usuario: UsuarioAdmin;
}

export function Sidebar({ usuario }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/session', { method: 'DELETE' });
    router.push('/admin/login');
    router.refresh();
  };

  const navItems = [
    { href: '/admin', label: '📋 Pedidos', active: true },
    { href: '/admin/estadisticas', label: '📊 Estadísticas', active: false },
  ];

  return (
    <aside
      className="w-[180px] flex-shrink-0 flex flex-col min-h-screen"
      style={{ backgroundColor: '#0d0d1f', borderRight: '1px solid #1a1a2e' }}
    >
      {/* Logo */}
      <div className="p-4 mb-2">
        <div
          className="font-bold text-sm"
          style={{ color: '#c0c1ff', fontFamily: 'Montserrat, sans-serif' }}
        >
          ⚡ Express Wash
        </div>
        <div className="text-xs mt-0.5" style={{ color: '#555' }}>
          Panel Admin
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-2 space-y-1">
        {navItems.map((item) => {
          const isCurrentPage = pathname === item.href;
          const isDisabled = !item.active;

          if (isDisabled) {
            return (
              <div
                key={item.href}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm cursor-not-allowed"
                style={{ color: '#333' }}
                title="Próximamente"
              >
                {item.label}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors"
              style={
                isCurrentPage
                  ? { backgroundColor: '#2e3192', color: '#c0c1ff' }
                  : { color: '#666' }
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Usuario y logout */}
      <div className="p-4" style={{ borderTop: '1px solid #1a1a2e' }}>
        <div className="flex items-center gap-2 mb-3">
          {usuario.foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={usuario.foto}
              alt="Avatar"
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: '#2e3192', color: '#c0c1ff' }}
            >
              {usuario.nombre[0].toUpperCase()}
            </div>
          )}
          <div className="overflow-hidden">
            <div
              className="text-xs font-medium truncate"
              style={{ color: '#c0c1ff' }}
              title={usuario.nombre}
            >
              {usuario.nombre}
            </div>
            <div className="text-xs" style={{ color: '#555' }}>
              Admin
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="text-xs hover:underline transition-colors"
          style={{ color: '#E91E63' }}
        >
          → Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: Crear `src/app/admin/layout.tsx`**

Este es un Server Component que verifica la sesión antes de renderizar.

```typescript
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySessionCookie } from '@/lib/auth';
import { Sidebar } from '@/components/admin/Sidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const session = cookieStore.get('session')?.value;

  // Sin cookie → middleware ya debería haber redirigido, pero por seguridad:
  if (!session) {
    redirect('/admin/login');
  }

  // Verificar cookie con Firebase Admin SDK
  const usuario = await verifySessionCookie(session);

  if (!usuario) {
    // Cookie inválida o expirada o email no en lista admins
    redirect('/admin/login');
  }

  return (
    <div
      className="flex min-h-screen"
      style={{ backgroundColor: 'var(--indigo-bg)' }}
    >
      <Sidebar usuario={usuario} />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
```

- [ ] **Step 4: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: Sin errores nuevos.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/Sidebar.tsx src/app/admin/layout.tsx
git commit -m "feat(admin): add Sidebar component and AdminLayout with server-side session verification"
```

---

## Task 7: StatsCards

**Files:**
- Create: `src/components/admin/StatsCards.tsx`

- [ ] **Step 1: Crear `src/components/admin/StatsCards.tsx`**

```typescript
import { formatCLP } from '@/lib/utils';
import type { Pedido } from '@/lib/types';

interface StatsCardsProps {
  pedidos: Pedido[];
}

interface StatCard {
  label: string;
  valor: number;
  color: string;
  tipo: 'numero' | 'moneda';
}

export function StatsCards({ pedidos }: StatsCardsProps) {
  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString();

  const pendientes = pedidos.filter((p) => p.estado === 'pendiente').length;
  const enProceso = pedidos.filter((p) => p.estado === 'en_proceso').length;
  const entregados = pedidos.filter((p) => p.estado === 'entregado').length;
  const ingresosMes = pedidos
    .filter((p) => p.creadoEn >= inicioMes && p.estado !== 'cancelado')
    .reduce((acc, p) => acc + p.total, 0);

  const cards: StatCard[] = [
    { label: 'Pendientes', valor: pendientes, color: '#f59e0b', tipo: 'numero' },
    { label: 'En proceso', valor: enProceso, color: '#3b82f6', tipo: 'numero' },
    { label: 'Entregados', valor: entregados, color: '#22c55e', tipo: 'numero' },
    { label: 'Ingresos mes', valor: ingresosMes, color: '#c0c1ff', tipo: 'moneda' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl p-4"
          style={{
            backgroundColor: '#111128',
            borderLeft: `3px solid ${card.color}`,
          }}
        >
          <div
            className="text-2xl font-bold mb-1"
            style={{ color: card.color, fontFamily: 'Montserrat, sans-serif' }}
          >
            {card.tipo === 'moneda' ? formatCLP(card.valor) : card.valor}
          </div>
          <div className="text-xs" style={{ color: '#666' }}>
            {card.label}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: Sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/StatsCards.tsx
git commit -m "feat(admin): add StatsCards component (pendientes, en proceso, entregados, ingresos mes)"
```

---

## Task 8: DetalleModal

**Files:**
- Create: `src/components/admin/DetalleModal.tsx`

- [ ] **Step 1: Crear `src/components/admin/DetalleModal.tsx`**

```typescript
'use client';

import { useEffect } from 'react';
import { formatCLP } from '@/lib/utils';
import type { Pedido } from '@/lib/types';

interface DetalleModalProps {
  pedido: Pedido;
  onClose: () => void;
}

export function DetalleModal({ pedido, onClose }: DetalleModalProps) {
  // Cerrar con Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <div
        className="rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: '#111128', border: '1px solid #2e3192' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2
              className="text-lg font-bold"
              style={{ color: '#c0c1ff', fontFamily: 'Montserrat, sans-serif' }}
            >
              {pedido.nombre}
            </h2>
            <div className="text-xs mt-0.5" style={{ color: '#555' }}>
              ID: {pedido.id}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xl leading-none hover:text-white transition-colors"
            style={{ color: '#555' }}
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-sm">
          {/* Cliente */}
          <section>
            <div className="text-xs uppercase mb-1.5" style={{ color: '#555' }}>
              Cliente
            </div>
            <div style={{ color: '#e0e0e0' }}>{pedido.nombre}</div>
            {pedido.telefono && (
              <div style={{ color: '#888' }}>{pedido.telefono}</div>
            )}
          </section>

          <div style={{ borderTop: '1px solid #1a1a2e' }} />

          {/* Dirección */}
          <section>
            <div className="text-xs uppercase mb-1.5" style={{ color: '#555' }}>
              Dirección
            </div>
            <div style={{ color: '#888' }}>{pedido.direccion}</div>
            {pedido.distanciaKm !== undefined && (
              <div className="text-xs mt-0.5" style={{ color: '#555' }}>
                {pedido.distanciaKm} km del centro · Lat {pedido.lat?.toFixed(4)}, Lon{' '}
                {pedido.lon?.toFixed(4)}
              </div>
            )}
          </section>

          <div style={{ borderTop: '1px solid #1a1a2e' }} />

          {/* Items */}
          <section>
            <div className="text-xs uppercase mb-2" style={{ color: '#555' }}>
              Items
            </div>
            <div className="space-y-1">
              {pedido.items.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between py-1.5"
                  style={{ borderBottom: '1px solid #1a1a2e' }}
                >
                  <span style={{ color: '#888' }}>
                    {item.cantidad}× {item.tipo}
                  </span>
                  <span style={{ color: '#c0c1ff' }}>
                    {formatCLP(item.precioUnitario * item.cantidad)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Totales */}
          <section className="space-y-1.5">
            <div className="flex justify-between text-xs" style={{ color: '#666' }}>
              <span>Subtotal</span>
              <span>{formatCLP(pedido.subtotal)}</span>
            </div>
            {pedido.descuento > 0 && (
              <div className="flex justify-between text-xs" style={{ color: '#22c55e' }}>
                <span>Descuento</span>
                <span>-{formatCLP(pedido.descuento)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs" style={{ color: '#666' }}>
              <span>Despacho</span>
              <span>{formatCLP(pedido.costoDespacho)}</span>
            </div>
            <div
              className="flex justify-between font-bold pt-1"
              style={{ color: '#c0c1ff', borderTop: '1px solid #2e3192' }}
            >
              <span>Total</span>
              <span>{formatCLP(pedido.total)}</span>
            </div>
          </section>

          {/* Estado */}
          <div style={{ borderTop: '1px solid #1a1a2e' }} />
          <section>
            <div className="text-xs uppercase mb-1.5" style={{ color: '#555' }}>
              Estado actual
            </div>
            <span
              className="text-xs font-medium px-2 py-1 rounded-full"
              style={{ backgroundColor: '#2e319233', color: '#c0c1ff' }}
            >
              {pedido.estado.replace('_', ' ')}
            </span>
          </section>

          {/* Notas */}
          {pedido.notas && (
            <>
              <div style={{ borderTop: '1px solid #1a1a2e' }} />
              <section>
                <div className="text-xs uppercase mb-1.5" style={{ color: '#555' }}>
                  Notas internas
                </div>
                <div
                  className="text-xs p-3 rounded-lg"
                  style={{ backgroundColor: '#0d0d1f', color: '#888' }}
                >
                  {pedido.notas}
                </div>
              </section>
            </>
          )}

          {/* Fechas */}
          <div style={{ borderTop: '1px solid #1a1a2e' }} />
          <section className="text-xs space-y-1" style={{ color: '#444' }}>
            <div>
              Creado:{' '}
              {new Date(pedido.creadoEn).toLocaleString('es-CL', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
            <div>
              Actualizado:{' '}
              {new Date(pedido.actualizadoEn).toLocaleString('es-CL', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/DetalleModal.tsx
git commit -m "feat(admin): add DetalleModal component with full order details"
```

---

## Task 9: PedidosTableAdmin (tabla principal con auto-refresh y acciones)

**Files:**
- Create: `src/components/admin/PedidosTableAdmin.tsx`

- [ ] **Step 1: Crear `src/components/admin/PedidosTableAdmin.tsx`**

Este es el componente más complejo. Incluye auto-refresh, filtros, cambio de estado, modal de detalle y nota inline.

```typescript
'use client';

import { Fragment, useState, useEffect, useCallback, useRef } from 'react';
import { formatCLP } from '@/lib/utils';
import type { Pedido, EstadoPedido } from '@/lib/types';
import { DetalleModal } from './DetalleModal';

const ESTADOS: EstadoPedido[] = [
  'pendiente',
  'en_proceso',
  'listo',
  'entregado',
  'cancelado',
];

const ESTADO_COLOR: Record<EstadoPedido, string> = {
  pendiente: '#f59e0b',
  en_proceso: '#3b82f6',
  listo: '#a855f7',
  entregado: '#22c55e',
  cancelado: '#ef4444',
};

const INTERVALO_REFRESH_MS = 30_000; // 30 segundos

export function PedidosTableAdmin() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | 'todos'>('todos');
  const [pedidoDetalle, setPedidoDetalle] = useState<Pedido | null>(null);
  const [notaAbierta, setNotaAbierta] = useState<string | null>(null); // id del pedido
  const [notaTexto, setNotaTexto] = useState('');
  const [guardandoNota, setGuardandoNota] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);
  const [segundosDesdeUpdate, setSegundosDesdeUpdate] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const clockRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar pedidos desde la API
  const cargar = useCallback(async () => {
    try {
      const res = await fetch('/api/pedidos');
      if (!res.ok) throw new Error('Error HTTP: ' + res.status);
      const data: Pedido[] = await res.json();
      setPedidos(data);
      setErrorMsg(null);
      setUltimaActualizacion(new Date());
      setSegundosDesdeUpdate(0);
    } catch {
      setErrorMsg('Error cargando pedidos. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    cargar();
    intervalRef.current = setInterval(cargar, INTERVALO_REFRESH_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [cargar]);

  // Reloj de "actualizado hace X segundos"
  useEffect(() => {
    clockRef.current = setInterval(() => {
      setSegundosDesdeUpdate((s) => s + 1);
    }, 1000);
    return () => {
      if (clockRef.current) clearInterval(clockRef.current);
    };
  }, []);

  // Mostrar toast temporal
  const mostrarToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Cambiar estado de un pedido
  const cambiarEstado = async (id: string, estado: EstadoPedido) => {
    try {
      const res = await fetch(`/api/pedidos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado }),
      });
      if (!res.ok) throw new Error();
      mostrarToast('Estado actualizado ✓');
      await cargar();
    } catch {
      mostrarToast('Error al actualizar estado');
    }
  };

  // Guardar nota interna
  const guardarNota = async (id: string) => {
    setGuardandoNota(true);
    try {
      const res = await fetch(`/api/pedidos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notas: notaTexto }),
      });
      if (!res.ok) throw new Error();
      mostrarToast('Nota guardada ✓');
      setNotaAbierta(null);
      setNotaTexto('');
      await cargar();
    } catch {
      mostrarToast('Error al guardar nota');
    } finally {
      setGuardandoNota(false);
    }
  };

  // Abrir formulario de nota para un pedido
  const abrirNota = (pedido: Pedido) => {
    setNotaAbierta(pedido.id!);
    setNotaTexto(pedido.notas || '');
  };

  const pedidosFiltrados =
    filtroEstado === 'todos'
      ? pedidos
      : pedidos.filter((p) => p.estado === filtroEstado);

  const countEstado = (estado: EstadoPedido) =>
    pedidos.filter((p) => p.estado === estado).length;

  // --- RENDER ---

  if (loading) {
    return (
      <div className="text-center py-24 animate-pulse" style={{ color: '#555' }}>
        Cargando pedidos...
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="text-center py-24">
        <div className="mb-4 text-sm" style={{ color: '#ef4444' }}>
          {errorMsg}
        </div>
        <button
          onClick={cargar}
          className="px-4 py-2 rounded text-sm font-medium"
          style={{ backgroundColor: '#2e3192', color: '#c0c1ff' }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-xl"
          style={{ backgroundColor: '#2e3192', color: '#c0c1ff' }}
        >
          {toast}
        </div>
      )}

      {/* Modal de detalle */}
      {pedidoDetalle && (
        <DetalleModal
          pedido={pedidoDetalle}
          onClose={() => setPedidoDetalle(null)}
        />
      )}

      {/* Filtros + indicador de refresh */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap gap-2">
          {/* Chip "Todos" */}
          <button
            onClick={() => setFiltroEstado('todos')}
            className="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
            style={
              filtroEstado === 'todos'
                ? { backgroundColor: '#2e3192', color: '#c0c1ff', borderColor: '#2e3192' }
                : { backgroundColor: 'transparent', color: '#555', borderColor: '#1a1a2e' }
            }
          >
            Todos ({pedidos.length})
          </button>

          {/* Chips por estado */}
          {ESTADOS.map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
              style={
                filtroEstado === estado
                  ? {
                      backgroundColor: ESTADO_COLOR[estado] + '33',
                      color: ESTADO_COLOR[estado],
                      borderColor: ESTADO_COLOR[estado],
                    }
                  : { backgroundColor: 'transparent', color: '#555', borderColor: '#1a1a2e' }
              }
            >
              {estado.replace('_', ' ')} ({countEstado(estado)})
            </button>
          ))}
        </div>

        {/* Indicador auto-refresh */}
        <div className="text-xs" style={{ color: '#444' }}>
          🔄{' '}
          {ultimaActualizacion
            ? `Actualizado hace ${segundosDesdeUpdate}s`
            : 'Cargando...'}
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #1a1a2e' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead style={{ backgroundColor: '#0d0d1f' }}>
              <tr>
                {['Cliente', 'Dirección', 'Items', 'Total', 'Estado', 'Fecha', 'Acciones'].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs uppercase"
                      style={{ color: '#555' }}
                    >
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map((p, idx) => (
                <Fragment key={p.id}>
                  {/* Fila del pedido */}
                  <tr
                    style={{
                      backgroundColor: idx % 2 === 0 ? '#111128' : '#0d0d1f',
                      borderTop: '1px solid #1a1a2e',
                    }}
                  >
                    {/* Cliente */}
                    <td className="px-4 py-3">
                      <div className="font-medium" style={{ color: '#fff' }}>
                        {p.nombre}
                      </div>
                      {p.telefono && (
                        <div className="text-xs" style={{ color: '#555' }}>
                          {p.telefono}
                        </div>
                      )}
                    </td>

                    {/* Dirección */}
                    <td className="px-4 py-3 max-w-[160px]">
                      <div
                        className="truncate text-xs"
                        title={p.direccion}
                        style={{ color: '#888' }}
                      >
                        {p.direccion}
                      </div>
                      {p.distanciaKm !== undefined && (
                        <div className="text-xs" style={{ color: '#555' }}>
                          {p.distanciaKm} km
                        </div>
                      )}
                    </td>

                    {/* Items */}
                    <td className="px-4 py-3 text-xs" style={{ color: '#888' }}>
                      {p.items.map((item, i) => (
                        <div key={i}>
                          {item.cantidad}× {item.tipo}
                        </div>
                      ))}
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3 font-bold" style={{ color: '#c0c1ff' }}>
                      {formatCLP(p.total)}
                    </td>

                    {/* Estado (dropdown) */}
                    <td className="px-4 py-3">
                      <select
                        value={p.estado}
                        onChange={(e) =>
                          cambiarEstado(p.id!, e.target.value as EstadoPedido)
                        }
                        className="text-xs rounded px-2 py-1 border focus:outline-none cursor-pointer"
                        style={{
                          backgroundColor: '#0d0d1f',
                          color: ESTADO_COLOR[p.estado],
                          borderColor: ESTADO_COLOR[p.estado] + '55',
                        }}
                      >
                        {ESTADOS.map((e) => (
                          <option key={e} value={e}>
                            {e.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Fecha */}
                    <td className="px-4 py-3 text-xs" style={{ color: '#555' }}>
                      {new Date(p.creadoEn).toLocaleDateString('es-CL', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPedidoDetalle(p)}
                          className="text-xs px-2 py-1 rounded border transition-colors hover:border-gray-500"
                          style={{
                            backgroundColor: '#0d0d1f',
                            color: '#888',
                            borderColor: '#1a1a2e',
                          }}
                        >
                          👁 Detalle
                        </button>
                        <button
                          onClick={() =>
                            notaAbierta === p.id
                              ? setNotaAbierta(null)
                              : abrirNota(p)
                          }
                          className="text-xs px-2 py-1 rounded border transition-colors hover:border-gray-500"
                          style={{
                            backgroundColor: notaAbierta === p.id ? '#2e319233' : '#0d0d1f',
                            color: notaAbierta === p.id ? '#c0c1ff' : '#888',
                            borderColor: notaAbierta === p.id ? '#2e3192' : '#1a1a2e',
                          }}
                        >
                          📝 Nota{p.notas ? ' ●' : ''}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Fila de nota inline (se expande debajo del pedido) */}
                  {notaAbierta === p.id && (
                    <tr
                      style={{
                        backgroundColor: '#09090f',
                        borderTop: '1px solid #2e3192',
                      }}
                    >
                      <td
                        colSpan={7}
                        className="px-4 py-3"
                      >
                        <div className="flex gap-3 items-start">
                          <textarea
                            value={notaTexto}
                            onChange={(e) => setNotaTexto(e.target.value)}
                            rows={2}
                            placeholder="Escribe una nota interna sobre este pedido..."
                            className="flex-1 text-xs rounded-lg px-3 py-2 resize-none focus:outline-none"
                            style={{
                              backgroundColor: '#111128',
                              color: '#c0c1ff',
                              border: '1px solid #2e3192',
                            }}
                          />
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => guardarNota(p.id!)}
                              disabled={guardandoNota}
                              className="text-xs px-3 py-1.5 rounded font-medium disabled:opacity-50 transition-opacity"
                              style={{ backgroundColor: '#2e3192', color: '#c0c1ff' }}
                            >
                              {guardandoNota ? 'Guardando...' : 'Guardar'}
                            </button>
                            <button
                              onClick={() => setNotaAbierta(null)}
                              className="text-xs px-3 py-1.5 rounded"
                              style={{ backgroundColor: '#1a1a2e', color: '#555' }}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estado vacío */}
      {pedidosFiltrados.length === 0 && (
        <div className="text-center py-16" style={{ color: '#555' }}>
          {filtroEstado === 'todos'
            ? 'No hay pedidos todavía.'
            : `No hay pedidos con estado "${filtroEstado.replace('_', ' ')}".`}
        </div>
      )}

      {/* Conteo */}
      <div className="text-xs mt-3 text-right" style={{ color: '#333' }}>
        {pedidosFiltrados.length} pedido(s)
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: Sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/PedidosTableAdmin.tsx
git commit -m "feat(admin): add PedidosTableAdmin with auto-refresh, filters, status change, detail modal, and inline notes"
```

---

## Task 10: Ensamblar admin/page.tsx + setup Firebase Console + deploy

**Files:**
- Modify: `src/app/admin/page.tsx`

- [ ] **Step 1: Reemplazar `src/app/admin/page.tsx`**

```typescript
import { StatsCards } from '@/components/admin/StatsCards';
import { PedidosTableAdmin } from '@/components/admin/PedidosTableAdmin';

export default function AdminPage() {
  return (
    <>
      {/* Título de sección */}
      <div className="mb-6">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: '#c0c1ff', fontFamily: 'Montserrat, sans-serif' }}
        >
          Pedidos
        </h1>
        <p className="text-sm" style={{ color: '#555' }}>
          Gestión de pedidos en tiempo real
        </p>
      </div>

      {/*
        StatsCards recibe pedidos como prop para calcular métricas client-side.
        PedidosTableAdmin carga sus propios pedidos vía fetch y los comparte
        elevando estado a través de un wrapper. Para simplicidad MVP, las stats
        se calculan dentro de PedidosTableAdmin y se pasan como prop a StatsCards.
        
        NOTA: Se usa un wrapper que combina ambos componentes para compartir el
        array de pedidos sin duplicar el fetch.
      */}
      <AdminDashboard />
    </>
  );
}

/**
 * Wrapper client-side que carga pedidos una vez y los distribuye
 * a StatsCards y PedidosTableAdmin.
 * Se define aquí para no necesitar un archivo extra.
 */
import { AdminDashboard } from '@/components/admin/AdminDashboard';
```

Espera — necesitamos un componente wrapper `AdminDashboard` para compartir el estado de pedidos. De lo contrario `StatsCards` y `PedidosTableAdmin` harían dos fetches separados. Crea ese wrapper:

- [ ] **Step 2: Crear `src/components/admin/AdminDashboard.tsx`**

```typescript
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { StatsCards } from './StatsCards';
import { PedidosTableAdmin } from './PedidosTableAdmin';
import type { Pedido } from '@/lib/types';

const INTERVALO_REFRESH_MS = 30_000;

/**
 * Wrapper que carga los pedidos una vez y los pasa a StatsCards y PedidosTableAdmin.
 * Evita hacer dos fetches independientes.
 */
export function AdminDashboard() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const cargar = useCallback(async () => {
    try {
      const res = await fetch('/api/pedidos');
      if (!res.ok) throw new Error();
      const data: Pedido[] = await res.json();
      setPedidos(data);
      setErrorMsg(null);
    } catch {
      setErrorMsg('Error cargando pedidos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
    intervalRef.current = setInterval(cargar, INTERVALO_REFRESH_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [cargar]);

  if (loading) {
    return (
      <div className="text-center py-24 animate-pulse" style={{ color: '#555' }}>
        Cargando...
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="text-center py-24">
        <div className="mb-4 text-sm" style={{ color: '#ef4444' }}>{errorMsg}</div>
        <button
          onClick={cargar}
          className="px-4 py-2 rounded text-sm font-medium"
          style={{ backgroundColor: '#2e3192', color: '#c0c1ff' }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <>
      <StatsCards pedidos={pedidos} />
      <PedidosTableAdmin pedidos={pedidos} onRefresh={cargar} />
    </>
  );
}
```

- [ ] **Step 3: Actualizar `PedidosTableAdmin` para recibir pedidos como props**

`PedidosTableAdmin` ahora recibe `pedidos` y `onRefresh` como props en vez de hacer su propio fetch. Reemplaza la firma del componente y quita el fetch interno:

Cambia el inicio de `src/components/admin/PedidosTableAdmin.tsx`:

```typescript
// Reemplazar las primeras líneas y la interfaz de props:

interface PedidosTableAdminProps {
  pedidos: Pedido[];
  onRefresh: () => Promise<void>;
}

export function PedidosTableAdmin({ pedidos, onRefresh }: PedidosTableAdminProps) {
  // Quitar: useState para pedidos, loading, errorMsg
  // Quitar: el useEffect de cargar() y el intervalRef de 30s
  // Quitar: la función cargar()
  // MANTENER: filtroEstado, pedidoDetalle, notaAbierta, notaTexto, guardandoNota, toast, ultimaActualizacion, segundosDesdeUpdate, clockRef
  
  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | 'todos'>('todos');
  const [pedidoDetalle, setPedidoDetalle] = useState<Pedido | null>(null);
  const [notaAbierta, setNotaAbierta] = useState<string | null>(null);
  const [notaTexto, setNotaTexto] = useState('');
  const [guardandoNota, setGuardandoNota] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date>(new Date());
  const [segundosDesdeUpdate, setSegundosDesdeUpdate] = useState(0);
  const clockRef = useRef<NodeJS.Timeout | null>(null);

  // Actualizar reloj cuando llegan nuevos pedidos
  useEffect(() => {
    setUltimaActualizacion(new Date());
    setSegundosDesdeUpdate(0);
  }, [pedidos]);

  // Reloj de "actualizado hace X segundos"
  useEffect(() => {
    clockRef.current = setInterval(() => {
      setSegundosDesdeUpdate((s) => s + 1);
    }, 1000);
    return () => {
      if (clockRef.current) clearInterval(clockRef.current);
    };
  }, []);

  const mostrarToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const cambiarEstado = async (id: string, estado: EstadoPedido) => {
    try {
      const res = await fetch(`/api/pedidos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado }),
      });
      if (!res.ok) throw new Error();
      mostrarToast('Estado actualizado ✓');
      await onRefresh();
    } catch {
      mostrarToast('Error al actualizar estado');
    }
  };

  const guardarNota = async (id: string) => {
    setGuardandoNota(true);
    try {
      const res = await fetch(`/api/pedidos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notas: notaTexto }),
      });
      if (!res.ok) throw new Error();
      mostrarToast('Nota guardada ✓');
      setNotaAbierta(null);
      setNotaTexto('');
      await onRefresh();
    } catch {
      mostrarToast('Error al guardar nota');
    } finally {
      setGuardandoNota(false);
    }
  };

  const abrirNota = (pedido: Pedido) => {
    setNotaAbierta(pedido.id!);
    setNotaTexto(pedido.notas || '');
  };

  // El resto del render permanece igual (filtros, tabla, modal, nota inline)
  // Quitar el bloque if(loading) y if(errorMsg) — AdminDashboard los maneja
```

- [ ] **Step 4: Actualizar `src/app/admin/page.tsx` (versión final)**

```typescript
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  return (
    <>
      <div className="mb-6">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: '#c0c1ff', fontFamily: 'Montserrat, sans-serif' }}
        >
          Pedidos
        </h1>
        <p className="text-sm" style={{ color: '#555' }}>
          Gestión de pedidos en tiempo real
        </p>
      </div>

      <AdminDashboard />
    </>
  );
}
```

- [ ] **Step 5: Verificar que el build compila sin errores**

```bash
npm run build 2>&1 | tail -20
```

Esperado: `✓ Compiled successfully` (o similar, sin errores de TypeScript/ESLint).

- [ ] **Step 6: Setup Firebase Console — habilitar Google Auth** (manual, una vez)

1. Ir a https://console.firebase.google.com → proyecto `expresswash-prod-202605112332`
2. Authentication → Sign-in method → Google → Habilitar → Guardar
3. Authentication → Settings → Authorized domains → Agregar: `express-wash-4hgom7r2cq-tl.a.run.app`

- [ ] **Step 7: Agregar primer admin en Firestore** (manual, una vez)

1. Firebase Console → Firestore Database → colección `admins`
2. Agregar documento con ID = tu email (ej: `hola@expressdeliverywash.cl`)
3. Campos: `email` (string), `nombre` (string), `activo` (boolean: true), `creadoEn` (string: fecha ISO)

- [ ] **Step 8: Commit y deploy**

```bash
git add src/app/admin/page.tsx src/components/admin/AdminDashboard.tsx src/components/admin/PedidosTableAdmin.tsx
git commit -m "feat(admin): assemble AdminDashboard — stats + table with shared state"
git push origin main
```

Esperar ~5 minutos a que GitHub Actions complete el deploy.

- [ ] **Step 9: Verificación end-to-end en producción**

```bash
# 1. Verificar que /admin redirige a /admin/login sin sesión
curl -s -o /dev/null -w "%{http_code}" https://express-wash-4hgom7r2cq-tl.a.run.app/admin
# Esperado: 307 o 200 (depende de si Cloud Run sigue redirect)

# 2. Verificar que la página de login carga
curl -s -o /dev/null -w "%{http_code}" https://express-wash-4hgom7r2cq-tl.a.run.app/admin/login
# Esperado: 200

# 3. En el navegador: ir a https://express-wash-4hgom7r2cq-tl.a.run.app/admin/login
# → Hacer clic en "Entrar con Google"
# → Iniciar sesión con el email que agregaste en Firestore admins
# → Verificar que redirige a /admin con:
#   - Sidebar visible con nombre de usuario
#   - 4 stats cards
#   - Tabla de pedidos con los pedidos reales
#   - El pedido de prueba "Test Admin SDK" debe aparecer
# → Cambiar el estado de un pedido → verificar toast "Estado actualizado ✓"
# → Abrir detalle de un pedido → verificar modal con info completa
# → Agregar una nota → verificar que se guarda y aparece "●" en el botón Nota
# → Cerrar sesión → verificar redirect a /admin/login
```

---

## Self-Review del Plan

**Spec coverage:**
- ✅ Google Sign-In vía Firebase Auth → Tasks 3, 4, 5
- ✅ Lista de admins en Firestore → Task 1 (verificarAdmin), Task 10 (setup Firebase Console)
- ✅ Middleware protege `/admin/*` → Task 4
- ✅ Layout con Sidebar → Task 6
- ✅ Stats Cards (4 métricas) → Task 7
- ✅ Tabla con auto-refresh 30s → Task 10 (AdminDashboard)
- ✅ Cambiar estado (dropdown) → Task 9
- ✅ Ver detalle (modal) → Task 8, Task 9
- ✅ Nota interna (inline) → Task 9, Task 2 (PATCH extendido)
- ✅ Multi-admin → Task 10 (setup Firebase Console)
- ✅ Costo $0 extra → Firebase Auth gratuito

**Placeholders:** Ninguno — todo el código está completo.

**Type consistency:**
- `UsuarioAdmin` definido en Task 1, usado en Task 3 (auth.ts), Task 6 (Sidebar)
- `verificarAdmin(email)` definida en Task 1, usada en Task 3
- `actualizarPedidoParcial()` definida en Task 1, usada en Task 2 (PATCH route)
- `onRefresh` prop en PedidosTableAdmin definida en Task 10, coincide con tipo `() => Promise<void>`
