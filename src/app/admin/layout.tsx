import { RoleGuard } from '@/components/admin/RoleGuard';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySessionCookie } from '@/lib/auth';
import { Sidebar } from '@/components/admin/Sidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = headers();
  const isLoginPage = headersList.get('x-is-login-page') === 'true';

  // Si estamos en la página de login, renderizar sin verificación de sesión
  if (isLoginPage) {
    return children;
  }

  // Para otras rutas bajo /admin, verificar sesión
  const cookieStore = cookies();
  const session = cookieStore.get('session')?.value;

  // Sin cookie → middleware debería haber redirigido, pero por seguridad:
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
