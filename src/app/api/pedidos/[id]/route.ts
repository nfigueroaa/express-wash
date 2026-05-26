import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { actualizarPedidoParcial } from '@/lib/firestore-admin';
import { verifySessionCookie } from '@/lib/auth';
import type { EstadoPedido } from '@/lib/types';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * PATCH /api/pedidos/:id
 * Actualiza estado y/o notas de un pedido.
 * Body: { "estado"?: EstadoPedido, "notas"?: string }
 * Al menos uno de los dos campos debe estar presente.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const { id } = params;
    const body = await request.json();
    const { estado, notas } = body as { estado?: EstadoPedido; notas?: string };

    if (estado === undefined && notas === undefined) {
      return NextResponse.json(
        { error: 'Se requiere al menos "estado" o "notas"' },
        { status: 400 },
      );
    }

    const estadosValidos: EstadoPedido[] = [
      'pendiente', 'en_proceso', 'listo', 'entregado', 'cancelado',
    ];

    if (estado !== undefined && !estadosValidos.includes(estado)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
    }

    const updates: Partial<{ estado: EstadoPedido; notas: string }> = {};
    if (estado !== undefined) updates.estado = estado;
    if (notas !== undefined) updates.notas = notas;

    await actualizarPedidoParcial(id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[pedidos PATCH] Error:', error);
    return NextResponse.json({ error: 'Error actualizando pedido' }, { status: 500 });
  }
}
