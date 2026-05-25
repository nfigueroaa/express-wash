# Admin Panel Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the Express Delivery Wash admin panel with a professional header, real-time notifications, role-based access control, and dark mode toggle.

**Architecture:** 
- Header component replaces footer link with sticky navbar containing logo and admin access
- Notifications system uses Server-Sent Events (SSE) to push new orders to connected admins in real-time
- Role-based access control (RBAC) validates user roles in Firebase Firestore and restricts UI/API endpoints by role
- Dark mode toggle stores preference in localStorage and applies theme via CSS variables (Dark mode is default, Light mode is optional)

**Tech Stack:** Next.js 14 App Router, TypeScript, React, Tailwind CSS, Firebase Admin SDK, Server-Sent Events

---

## File Structure

```
src/
├── components/
│   ├── Header.tsx                    [CREATE] Main header navbar with logo and admin link
│   └── admin/
│       ├── NotificationsCenter.tsx  [CREATE] Real-time notification UI
│       ├── RoleGuard.tsx            [CREATE] Client-side role protection wrapper
│       └── Sidebar.tsx              [MODIFY] Add theme toggle and logout
├── lib/
│   ├── auth.ts                      [MODIFY] Add role verification helper
│   ├── roles.ts                     [CREATE] Role definitions and permission matrix
│   └── notifications.ts             [CREATE] Notification queue management
├── app/
│   ├── layout.tsx                   [MODIFY] Add Header, remove Footer link from here, add theme provider
│   ├── page.tsx                     [MODIFY] Remove old footer link reference
│   ├── api/
│   │   ├── admin/
│   │   │   ├── notifications/route.ts  [CREATE] SSE endpoint for notifications
│   │   │   └── validate-role/route.ts  [CREATE] Role validation endpoint
│   │   └── pedidos/route.ts         [MODIFY] Add role check to POST
│   └── admin/
│       ├── layout.tsx               [MODIFY] Add RoleGuard and notification listener
│       ├── page.tsx                 [MODIFY] Import updated Sidebar
│       ├── users/
│       │   ├── page.tsx             [CREATE] User management page (admin only)
│       │   └── components/
│       │       └── UsersList.tsx    [CREATE] Users table
│       └── settings/
│           ├── page.tsx             [CREATE] Settings page (admin only)
│           └── components/
│               └── RoleSettings.tsx [CREATE] Role management UI
├── types/
│   └── roles.ts                     [CREATE] TypeScript types for roles
└── hooks/
    └── useNotifications.ts          [CREATE] Custom hook for notification management
```

---

## Tasks

### Task 1: Create Header Component and Integrate

**Files:**
- Create: `src/components/Header.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/Footer.tsx`

- [ ] **Step 1: Create Header component with logo and admin link**

Create `src/components/Header.tsx`:

```typescript
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function Header() {
  const router = useRouter();

  return (
    <header
      className="sticky top-0 z-50 border-b px-6 md:px-16 py-4"
      style={{
        backgroundColor: 'var(--indigo-surface)',
        borderColor: 'var(--indigo-border)',
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <div
            className="text-2xl font-bold font-montserrat cursor-pointer hover:opacity-80 transition-opacity"
            style={{ color: 'var(--indigo-primary)' }}
          >
            ⚡ Express Wash
          </div>
        </Link>

        {/* Right side */}
        <nav className="flex items-center gap-6">
          <Link
            href="/admin/login"
            className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors hover:opacity-80"
            style={{
              backgroundColor: 'var(--indigo-btn)',
              color: '#fff',
            }}
          >
            Panel Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Update layout.tsx to include Header**

Modify `src/app/layout.tsx` to import and use Header:

```typescript
import { Header } from '@/components/Header';

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
        <Header />
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Remove Footer admin link**

Modify `src/components/Footer.tsx` to remove the admin panel link:

```typescript
// Remove this section:
// <p style={{ color: '#333', marginTop: '12px' }}>
//   <a href="/admin/login">Panel de Administración</a>
// </p>
```

- [ ] **Step 4: Test Header displays correctly**

Build and start dev server:
```bash
npm run dev
```

Visit `http://localhost:3000` and verify:
- Header appears at top with logo
- "Panel Admin" button visible
- Button links to `/admin/login`
- Header is sticky on scroll

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.tsx src/app/layout.tsx src/components/Footer.tsx
git commit -m "feat: add sticky header navbar with admin access"
```

---

### Task 2: Create Role System

**Files:**
- Create: `src/types/roles.ts`
- Create: `src/lib/roles.ts`
- Modify: `src/lib/auth.ts`

- [ ] **Step 1: Define role types**

Create `src/types/roles.ts`:

```typescript
export type UserRole = 'admin' | 'supervisor' | 'operario';

export interface RolePermission {
  canViewDashboard: boolean;
  canManageOrders: boolean;
  canManageUsers: boolean;
  canChangeSettings: boolean;
  canViewReports: boolean;
}

export type PermissionMatrix = Record<UserRole, RolePermission>;
```

- [ ] **Step 2: Create role permissions matrix**

Create `src/lib/roles.ts`:

```typescript
import { PermissionMatrix, UserRole } from '@/types/roles';

export const ROLE_PERMISSIONS: PermissionMatrix = {
  admin: {
    canViewDashboard: true,
    canManageOrders: true,
    canManageUsers: true,
    canChangeSettings: true,
    canViewReports: true,
  },
  supervisor: {
    canViewDashboard: true,
    canManageOrders: true,
    canManageUsers: false,
    canChangeSettings: false,
    canViewReports: true,
  },
  operario: {
    canViewDashboard: true,
    canManageOrders: true,
    canManageUsers: false,
    canChangeSettings: false,
    canViewReports: false,
  },
};

export function hasPermission(
  role: UserRole | null,
  permission: keyof typeof ROLE_PERMISSIONS['admin']
): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.[permission] ?? false;
}

export function canAccessAdminPanel(role: UserRole | null): boolean {
  return role !== null && ['admin', 'supervisor', 'operario'].includes(role);
}
```

- [ ] **Step 3: Extend auth verification with role check**

Modify `src/lib/auth.ts` to add role retrieval:

```typescript
// Add this function to the existing auth.ts file:

export async function getUserRole(
  session: string
): Promise<'admin' | 'supervisor' | 'operario' | null> {
  try {
    const decodedToken = await admin.auth().verifySessionCookie(session);
    const userDoc = await admin
      .firestore()
      .collection('admins')
      .doc(decodedToken.uid)
      .get();

    const userData = userDoc.data();
    return userData?.role || 'operario'; // Default to operario if not specified
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Test role system**

Create a test file `src/lib/__tests__/roles.test.ts`:

```typescript
import { hasPermission, canAccessAdminPanel } from '@/lib/roles';

describe('Role Permissions', () => {
  it('admin has all permissions', () => {
    expect(hasPermission('admin', 'canManageUsers')).toBe(true);
    expect(hasPermission('admin', 'canChangeSettings')).toBe(true);
  });

  it('supervisor cannot manage users', () => {
    expect(hasPermission('supervisor', 'canManageUsers')).toBe(false);
  });

  it('operario can only manage orders and view dashboard', () => {
    expect(hasPermission('operario', 'canManageOrders')).toBe(true);
    expect(hasPermission('operario', 'canViewDashboard')).toBe(true);
    expect(hasPermission('operario', 'canManageUsers')).toBe(false);
  });

  it('null role has no access', () => {
    expect(hasPermission(null, 'canViewDashboard')).toBe(false);
  });

  it('canAccessAdminPanel checks if user can access', () => {
    expect(canAccessAdminPanel('admin')).toBe(true);
    expect(canAccessAdminPanel('supervisor')).toBe(true);
    expect(canAccessAdminPanel('operario')).toBe(true);
    expect(canAccessAdminPanel(null)).toBe(false);
  });
});
```

Run tests:
```bash
npm test -- src/lib/__tests__/roles.test.ts
```

Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add src/types/roles.ts src/lib/roles.ts src/lib/auth.ts src/lib/__tests__/roles.test.ts
git commit -m "feat: implement role-based access control system"
```

---

### Task 3: Create RoleGuard Component and Protect Admin Routes

**Files:**
- Create: `src/components/admin/RoleGuard.tsx`
- Create: `src/app/api/admin/validate-role/route.ts`
- Modify: `src/app/admin/layout.tsx`

- [ ] **Step 1: Create RoleGuard wrapper component**

Create `src/components/admin/RoleGuard.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'supervisor' | 'operario';
  fallback?: React.ReactNode;
}

export function RoleGuard({
  children,
  requiredRole = 'operario',
  fallback,
}: RoleGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkRole() {
      try {
        const response = await fetch('/api/admin/validate-role', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          setIsAuthorized(false);
          return;
        }

        const { role } = await response.json();

        // Role hierarchy: admin > supervisor > operario
        const roleHierarchy = { admin: 3, supervisor: 2, operario: 1 };
        const userLevel = roleHierarchy[role] || 0;
        const requiredLevel = roleHierarchy[requiredRole] || 1;

        if (userLevel >= requiredLevel) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('Role validation error:', error);
        setIsAuthorized(false);
      }
    }

    checkRole();
  }, [requiredRole]);

  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p style={{ color: 'var(--indigo-primary)' }}>Verificando acceso...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      fallback || (
        <div className="flex flex-col items-center justify-center h-screen text-center">
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: 'var(--indigo-primary)' }}
          >
            Acceso Denegado
          </h1>
          <p style={{ color: 'var(--indigo-text-muted)' }}>
            No tienes permiso para acceder a esta sección.
          </p>
        </div>
      )
    );
  }

  return <>{children}</>;
}
```

- [ ] **Step 2: Create role validation endpoint**

Create `src/app/api/admin/validate-role/route.ts`:

```typescript
import { cookies } from 'next/headers';
import { getUserRole } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const session = cookieStore.get('session')?.value;

    if (!session) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      );
    }

    const role = await getUserRole(session);

    if (!role) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    return NextResponse.json({ role });
  } catch (error) {
    console.error('Role validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Wrap admin layout with RoleGuard**

Modify `src/app/admin/layout.tsx`:

```typescript
import { RoleGuard } from '@/components/admin/RoleGuard';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySessionCookie } from '@/lib/auth';
import { Sidebar } from '@/components/admin/Sidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = require('next/headers').headers();
  const isLoginPage = headersList.get('x-is-login-page') === 'true';

  if (isLoginPage) {
    return children;
  }

  const cookieStore = cookies();
  const session = cookieStore.get('session')?.value;

  if (!session) {
    redirect('/admin/login');
  }

  const usuario = await verifySessionCookie(session);

  if (!usuario) {
    redirect('/admin/login');
  }

  return (
    <RoleGuard requiredRole="operario">
      <div
        className="flex min-h-screen"
        style={{ backgroundColor: 'var(--indigo-bg)' }}
      >
        <Sidebar usuario={usuario} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </RoleGuard>
  );
}
```

- [ ] **Step 4: Test role validation**

Manually test by:
```bash
npm run dev
```

- Login as admin
- Check browser DevTools Console Network tab
- Navigate to `/admin`
- Verify `/api/admin/validate-role` returns 200 with role

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/RoleGuard.tsx src/app/api/admin/validate-role/route.ts src/app/admin/layout.tsx
git commit -m "feat: add role-based access guard to admin panel"
```

---

### Task 4: Create Real-Time Notifications System

**Files:**
- Create: `src/lib/notifications.ts`
- Create: `src/hooks/useNotifications.ts`
- Create: `src/components/admin/NotificationsCenter.tsx`
- Create: `src/app/api/admin/notifications/route.ts`
- Modify: `src/app/admin/layout.tsx`

- [ ] **Step 1: Create notification queue manager**

Create `src/lib/notifications.ts`:

```typescript
export interface Notification {
  id: string;
  type: 'new_order' | 'order_status' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: Record<string, any>;
}

export interface NotificationEvent {
  type: 'new_order' | 'order_status' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
}

// In-memory queue for notifications (in production, use Redis or similar)
const notificationQueues = new Map<string, Notification[]>();
const notificationSubscribers = new Map<
  string,
  Set<(notification: Notification) => void>
>();

export function createNotification(
  userId: string,
  event: NotificationEvent
): Notification {
  const notification: Notification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    type: event.type,
    title: event.title,
    message: event.message,
    timestamp: new Date(),
    read: false,
    data: event.data,
  };

  // Store notification
  if (!notificationQueues.has(userId)) {
    notificationQueues.set(userId, []);
  }
  notificationQueues.get(userId)!.push(notification);

  // Notify subscribers
  const subscribers = notificationSubscribers.get(userId);
  if (subscribers) {
    subscribers.forEach((callback) => callback(notification));
  }

  return notification;
}

export function subscribe(
  userId: string,
  callback: (notification: Notification) => void
): () => void {
  if (!notificationSubscribers.has(userId)) {
    notificationSubscribers.set(userId, new Set());
  }
  notificationSubscribers.get(userId)!.add(callback);

  // Return unsubscribe function
  return () => {
    notificationSubscribers.get(userId)?.delete(callback);
  };
}

export function getNotifications(userId: string): Notification[] {
  return notificationQueues.get(userId) || [];
}

export function markAsRead(userId: string, notificationId: string): void {
  const notifications = notificationQueues.get(userId);
  if (notifications) {
    const notif = notifications.find((n) => n.id === notificationId);
    if (notif) {
      notif.read = true;
    }
  }
}
```

- [ ] **Step 2: Create useNotifications hook**

Create `src/hooks/useNotifications.ts`:

```typescript
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Notification } from '@/lib/notifications';

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    let eventSource: EventSource | null = null;

    // Connect to SSE endpoint
    eventSource = new EventSource(`/api/admin/notifications?userId=${userId}`);

    eventSource.addEventListener('notification', (event: Event) => {
      const customEvent = event as MessageEvent;
      const notification = JSON.parse(customEvent.data) as Notification;
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    eventSource.onerror = () => {
      eventSource?.close();
    };

    return () => {
      eventSource?.close();
    };
  }, [userId]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  return { notifications, unreadCount, markAsRead };
}
```

- [ ] **Step 3: Create NotificationsCenter UI**

Create `src/components/admin/NotificationsCenter.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@/lib/notifications';

interface NotificationsCenterProps {
  userId: string;
}

export function NotificationsCenter({ userId }: NotificationsCenterProps) {
  const { notifications, unreadCount, markAsRead } = useNotifications(userId);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg transition-colors hover:opacity-80"
        style={{ backgroundColor: 'rgba(192,193,255,0.1)' }}
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span
            className="absolute top-0 right-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: '#ef4444' }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 rounded-lg border shadow-lg max-h-96 overflow-y-auto"
          style={{
            backgroundColor: 'var(--indigo-surface)',
            borderColor: 'var(--indigo-border)',
          }}
        >
          <div className="p-4 border-b" style={{ borderColor: 'var(--indigo-border)' }}>
            <h3
              className="text-sm font-semibold"
              style={{ color: 'var(--indigo-primary)' }}
            >
              Notificaciones
            </h3>
          </div>

          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm" style={{ color: 'var(--indigo-text-muted)' }}>
              No hay notificaciones
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className="p-3 border-b cursor-pointer transition-colors hover:opacity-80"
                  style={{
                    borderColor: 'var(--indigo-border)',
                    backgroundColor: notification.read ? 'transparent' : 'rgba(192,193,255,0.05)',
                  }}
                >
                  <div className="flex gap-2">
                    <span className="text-lg flex-shrink-0">
                      {notification.type === 'new_order' ? '📦' : '⚙️'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: 'var(--indigo-primary)' }}>
                        {notification.title}
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: 'var(--indigo-text-muted)' }}
                      >
                        {notification.message}
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: 'var(--indigo-text-faint)' }}
                      >
                        {new Date(notification.timestamp).toLocaleTimeString('es-CL')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create SSE notification endpoint**

Create `src/app/api/admin/notifications/route.ts`:

```typescript
import { cookies } from 'next/headers';
import { verifySessionCookie } from '@/lib/auth';
import { getNotifications, subscribe } from '@/lib/notifications';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const cookieStore = cookies();
    const session = cookieStore.get('session')?.value;

    if (!session || !userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const usuario = await verifySessionCookie(session);
    if (!usuario || usuario.uid !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Set up SSE headers
    const responseHeaders = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const stream = new ReadableStream({
      start(controller) {
        // Send existing notifications
        const existingNotifications = getNotifications(userId);
        existingNotifications.forEach((notif) => {
          controller.enqueue(
            `event: notification\ndata: ${JSON.stringify(notif)}\n\n`
          );
        });

        // Subscribe to new notifications
        const unsubscribe = subscribe(userId, (notification) => {
          controller.enqueue(
            `event: notification\ndata: ${JSON.stringify(notification)}\n\n`
          );
        });

        // Clean up on disconnect
        const closeHandler = () => {
          unsubscribe();
          controller.close();
        };

        request.signal.addEventListener('abort', closeHandler);
      },
    });

    return new NextResponse(stream, { headers: responseHeaders });
  } catch (error) {
    console.error('Notifications endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 5: Add NotificationsCenter to Sidebar**

Modify `src/components/admin/Sidebar.tsx` to include NotificationsCenter:

```typescript
// At the top of Sidebar.tsx, add import:
import { NotificationsCenter } from '@/components/admin/NotificationsCenter';

// Inside the Sidebar component, add to the header section:
<div className="flex items-center gap-2">
  {usuario?.uid && <NotificationsCenter userId={usuario.uid} />}
  {/* ... rest of sidebar header ... */}
</div>
```

- [ ] **Step 6: Update orders endpoint to send notifications**

Modify `src/app/api/pedidos/route.ts` POST handler to trigger notification:

```typescript
// Add this import at the top:
import { createNotification } from '@/lib/notifications';

// After successfully creating a new order, add:
// Get all admin IDs from Firestore
const adminsSnapshot = await admin
  .firestore()
  .collection('admins')
  .get();

adminsSnapshot.forEach((doc) => {
  createNotification(doc.id, {
    type: 'new_order',
    title: 'Nuevo Pedido',
    message: `Nuevo pedido de ${data.clientName} - ${data.service_type}`,
    data: { orderId: docRef.id },
  });
});
```

- [ ] **Step 7: Test notifications system**

```bash
npm run dev
```

- Login as admin
- Open admin panel
- Create new order from public page (`/pedido`)
- Verify notification bell shows notification in real-time
- Click notification to mark as read

- [ ] **Step 8: Commit**

```bash
git add src/lib/notifications.ts src/hooks/useNotifications.ts src/components/admin/NotificationsCenter.tsx src/app/api/admin/notifications/route.ts src/components/admin/Sidebar.tsx src/app/api/pedidos/route.ts
git commit -m "feat: implement real-time notification system with SSE"
```

---

### Task 5: Add Dark Mode Toggle

**Files:**
- Create: `src/components/ThemeToggle.tsx`
- Create: `src/hooks/useTheme.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/admin/Sidebar.tsx`

- [ ] **Step 1: Create useTheme hook**

Create `src/hooks/useTheme.ts`:

```typescript
'use client';

import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get theme from localStorage or default to dark
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'dark';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      applyTheme(newTheme);
      return newTheme;
    });
  };

  return { theme, toggleTheme, mounted };
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;

  if (theme === 'dark') {
    // Dark theme (current default)
    root.style.setProperty('--indigo-bg', '#09090f');
    root.style.setProperty('--indigo-surface', '#111128');
    root.style.setProperty('--indigo-primary', '#c0c1ff');
    root.style.setProperty('--indigo-primary-dim', '#8889d9');
    root.style.setProperty('--indigo-btn', '#2e3192');
    root.style.setProperty('--indigo-text-muted', '#888899');
    root.style.setProperty('--indigo-text-faint', '#444455');
    root.style.setProperty('--indigo-border', '#1a1a2e');
    root.style.setProperty('--indigo-border-2', '#0f0f1f');
    root.style.setProperty('--indigo-tertiary', '#6b7adb');
  } else {
    // Light theme
    root.style.setProperty('--indigo-bg', '#f5f5f9');
    root.style.setProperty('--indigo-surface', '#ffffff');
    root.style.setProperty('--indigo-primary', '#2e3192');
    root.style.setProperty('--indigo-primary-dim', '#5a5db5');
    root.style.setProperty('--indigo-btn', '#6b7adb');
    root.style.setProperty('--indigo-text-muted', '#666666');
    root.style.setProperty('--indigo-text-faint', '#999999');
    root.style.setProperty('--indigo-border', '#e0e0e8');
    root.style.setProperty('--indigo-border-2', '#f0f0f5');
    root.style.setProperty('--indigo-tertiary', '#2e3192');
  }
}
```

- [ ] **Step 2: Create ThemeToggle component**

Create `src/components/ThemeToggle.tsx`:

```typescript
'use client';

import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg transition-colors hover:opacity-80"
      style={{ backgroundColor: 'rgba(192,193,255,0.1)' }}
      title={`Cambiar a tema ${theme === 'dark' ? 'claro' : 'oscuro'}`}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
```

- [ ] **Step 3: Integrate ThemeToggle into Header**

Modify `src/components/Header.tsx` to include theme toggle:

```typescript
'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Header() {
  return (
    <header
      className="sticky top-0 z-50 border-b px-6 md:px-16 py-4"
      style={{
        backgroundColor: 'var(--indigo-surface)',
        borderColor: 'var(--indigo-border)',
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/">
          <div
            className="text-2xl font-bold font-montserrat cursor-pointer hover:opacity-80 transition-opacity"
            style={{ color: 'var(--indigo-primary)' }}
          >
            ⚡ Express Wash
          </div>
        </Link>

        <nav className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/admin/login"
            className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors hover:opacity-80"
            style={{
              backgroundColor: 'var(--indigo-btn)',
              color: '#fff',
            }}
          >
            Panel Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Add ThemeToggle to admin Sidebar**

Modify `src/components/admin/Sidebar.tsx` to include theme toggle in the header:

```typescript
import { ThemeToggle } from '@/components/ThemeToggle';

// Inside Sidebar, add to the header section:
<div className="flex items-center gap-2">
  <ThemeToggle />
  {usuario?.uid && <NotificationsCenter userId={usuario.uid} />}
  {/* ... rest ... */}
</div>
```

- [ ] **Step 5: Test theme toggle**

```bash
npm run dev
```

- Visit `http://localhost:3000`
- Click theme toggle button (☀️/🌙)
- Verify colors change to light theme
- Refresh page - verify theme persists
- Toggle back to dark
- Verify theme persists in localStorage

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useTheme.ts src/components/ThemeToggle.tsx src/components/Header.tsx src/components/admin/Sidebar.tsx src/app/layout.tsx
git commit -m "feat: add dark/light mode theme toggle with persistence"
```

---

## Summary

**Total Commits:** 6
- Header and navbar structure
- Role-based access control system
- Role guard wrapper and validation endpoint
- Real-time notification system with SSE
- Dark/light theme toggle with persistence

**Testing Checklist:**
- [ ] Header displays on all pages
- [ ] Admin panel link accessible from header
- [ ] Role validation works correctly
- [ ] Users see "Access Denied" if insufficient role
- [ ] New orders trigger notifications
- [ ] Notifications appear in real-time in admin panel
- [ ] Theme toggle persists across pages
- [ ] Light mode colors are appropriate
- [ ] All 6 commits pushed to main
- [ ] Cloud Run deployment succeeds

**Next Steps After Implementation:**
- [ ] Add admin user management page (Task 1: Create Users page with role assignment)
- [ ] Add settings/configuration page (Task 2: Create Settings page)
- [ ] Add order status notifications
- [ ] Add email notifications for critical events
- [ ] Add notification persistence to Firestore
