import { hasPermission, canAccessAdminPanel } from '@/lib/roles';

describe('Role Permissions', () => {
  it('admin has all permissions', () => {
    expect(hasPermission('admin', 'canManageUsers')).toBe(true);
    expect(hasPermission('admin', 'canChangeSettings')).toBe(true);
    expect(hasPermission('admin', 'canViewDashboard')).toBe(true);
    expect(hasPermission('admin', 'canManageOrders')).toBe(true);
    expect(hasPermission('admin', 'canViewReports')).toBe(true);
  });

  it('supervisor cannot manage users or change settings', () => {
    expect(hasPermission('supervisor', 'canManageUsers')).toBe(false);
    expect(hasPermission('supervisor', 'canChangeSettings')).toBe(false);
  });

  it('supervisor can manage orders and view reports', () => {
    expect(hasPermission('supervisor', 'canManageOrders')).toBe(true);
    expect(hasPermission('supervisor', 'canViewReports')).toBe(true);
  });

  it('operario can only manage orders and view dashboard', () => {
    expect(hasPermission('operario', 'canManageOrders')).toBe(true);
    expect(hasPermission('operario', 'canViewDashboard')).toBe(true);
    expect(hasPermission('operario', 'canManageUsers')).toBe(false);
    expect(hasPermission('operario', 'canChangeSettings')).toBe(false);
    expect(hasPermission('operario', 'canViewReports')).toBe(false);
  });

  it('null role has no access', () => {
    expect(hasPermission(null, 'canViewDashboard')).toBe(false);
    expect(hasPermission(null, 'canManageOrders')).toBe(false);
  });

  it('canAccessAdminPanel checks if user can access', () => {
    expect(canAccessAdminPanel('admin')).toBe(true);
    expect(canAccessAdminPanel('supervisor')).toBe(true);
    expect(canAccessAdminPanel('operario')).toBe(true);
    expect(canAccessAdminPanel(null)).toBe(false);
  });
});
