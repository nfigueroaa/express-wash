import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { obtenerPedidos } from '@/lib/firestore-admin';
import { verifySessionCookie } from '@/lib/auth';

/**
 * GET /api/pedidos
 * Retorna todos los pedidos — requiere sesión de admin válida.
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar sesión de admin
    const cookieStore = cookies();
    const session = cookieStore.get('session')?.value;

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const usuario = await verifySessionCookie(session);
    if (!usuario) {
      return NextResponse.json({ error: 'Sesión inválida o expirada' }, { status: 401 });
    }

    const pedidos = await obtenerPedidos();
    return NextResponse.json(pedidos);
  } catch (error) {
    console.error('[pedidos GET] Error:', error);
    return NextResponse.json({ error: 'Error obteniendo pedidos' }, { status: 500 });
  }
}
