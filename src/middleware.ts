import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware de Next.js para proteger rutas /admin/*.
 * Verifica presencia de cookie 'session'.
 * La validez real se verifica en AdminLayout (server component).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get('session')?.value;

  // Si está en /admin/login, SIEMPRE dejar pasar sin redirecciones
  if (pathname.endsWith('/login')) {
    return NextResponse.next();
  }

  // Sin cookie → redirigir a login
  if (!session) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
