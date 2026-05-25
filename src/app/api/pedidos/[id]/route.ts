import { NextRequest, NextResponse } from 'next/server';
import { actualizarEstadoPedido } from '@/lib/firestore-admin';
import type { EstadoPedido } from '@/lib/types';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * PATCH /api/pedidos/:id
 * Actualiza el estado de un pedido
 * Body: { "estado": "pendiente" | "en_proceso" | "listo" | "entregado" | "cancelado" }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();
    const { estado } = body as { estado: EstadoPedido };

    if (!estado) {
      return NextResponse.json({ error: 'Estado requerido' }, { status: 400 });
    }

    const estadosValidos = ['pendiente', 'en_proceso', 'listo', 'entregado', 'cancelado'];
    if (!estadosValidos.includes(estado)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
    }

    await actualizarEstadoPedido(id, estado);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[pedidos PATCH] Error:', error);
    return NextResponse.json({ error: 'Error actualizando pedido' }, { status: 500 });
  }
}
