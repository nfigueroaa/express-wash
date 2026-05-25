import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySessionCookie } from '@/lib/auth';
import Sidebar from '@/components/admin/Sidebar';

export const metadata = {
  title: 'Panel de Administración | Ed Wash',
  description: 'Panel de administración de Ed Wash',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Obtener cookie de sesión
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;

  // Si no hay sesión, redirigir a login
  if (!session) {
    redirect('/admin/login');
  }

  // Verificar que la sesión sea válida
  const usuario = await verifySessionCookie(session);

  // Si la sesión no es válida, redirigir a login
  if (!usuario) {
    redirect('/admin/login');
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar usuario={usuario} />

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 hidden md:block">
          <h1 className="text-xl font-semibold text-gray-900">
            Panel de Administración
          </h1>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-auto p-4 md:p-8 mt-12 md:mt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
