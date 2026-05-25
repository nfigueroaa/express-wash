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
