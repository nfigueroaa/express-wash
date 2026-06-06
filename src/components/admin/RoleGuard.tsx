'use client';

import { useState, useEffect } from 'react';

export interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'supervisor' | 'operario';
  fallback?: React.ReactNode;
  /** Si se provee, evita el fetch a /api/admin/validate-role (ya verificado en el layout). */
  userRole?: 'admin' | 'supervisor' | 'operario';
}

const ROLE_HIERARCHY = { admin: 3, supervisor: 2, operario: 1 } as const;

export function RoleGuard({
  children,
  requiredRole = 'operario',
  fallback,
  userRole,
}: RoleGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(
    // Si ya tenemos el rol del layout, evaluamos inmediatamente sin fetch
    userRole != null
      ? (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[requiredRole] || 1)
      : null,
  );

  useEffect(() => {
    // Si el rol ya fue provisto desde el servidor, no necesitamos el fetch
    if (userRole != null) return;

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
        const userLevel = ROLE_HIERARCHY[role as keyof typeof ROLE_HIERARCHY] || 0;
        const requiredLevel = ROLE_HIERARCHY[requiredRole] || 1;
        setIsAuthorized(userLevel >= requiredLevel);
      } catch (error) {
        console.error('Role validation error:', error);
        setIsAuthorized(false);
      }
    }

    checkRole();
  }, [requiredRole, userRole]);

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
