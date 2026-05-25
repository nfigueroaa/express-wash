export type UserRole = 'admin' | 'supervisor' | 'operario';

export interface RolePermission {
  canViewDashboard: boolean;
  canManageOrders: boolean;
  canManageUsers: boolean;
  canChangeSettings: boolean;
  canViewReports: boolean;
}

export type PermissionMatrix = Record<UserRole, RolePermission>;
