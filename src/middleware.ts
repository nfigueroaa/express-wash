import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware de Next.js para proteger rutas /admin/*.
 * Verifica presencia de cookie 'session'.
 * La validez real se verifica en AdminLayout (server component).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get('session')?.value;

  const response = NextResponse.next();

  // Agregar header personalizado indicando si estamos en /admin/login
  // para que el layout pueda decidir si redirigir o no
  const isLoginPage = pathname.endsWith('/login');
  response.headers.set('x-is-login-page', isLoginPage ? 'true' : 'false');

  // Si está en /admin/login, SIEMPRE dejar pasar sin redirecciones
  if (isLoginPage) {
    return response;
  }

  // Sin cookie → redirigir a login
  if (!session) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
