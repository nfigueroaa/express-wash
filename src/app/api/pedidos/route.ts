import { NextResponse } from 'next/server';
import { obtenerPedidos } from '@/lib/firestore-admin';

/**
 * GET /api/pedidos
 * Retorna todos los pedidos ordenados por fecha de creación (más recientes primero)
 */
export async function GET() {
  try {
    const pedidos = await obtenerPedidos();
    return NextResponse.json(pedidos);
  } catch (error) {
    console.error('[pedidos GET] Error:', error);
    return NextResponse.json({ error: 'Error obteniendo pedidos' }, { status: 500 });
  }
}
