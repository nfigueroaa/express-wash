'use client';

import { useState, useEffect } from 'react';

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
        const userLevel = roleHierarchy[role as keyof typeof roleHierarchy] || 0;
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
