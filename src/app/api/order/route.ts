import { NextRequest, NextResponse } from 'next/server';
import { crearPedido } from '@/lib/firestore';
import type { Pedido } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validación básica
    if (!body.nombre?.trim()) {
      return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });
    }
    if (!body.direccion?.trim()) {
      return NextResponse.json({ error: 'Dirección requerida' }, { status: 400 });
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'Debe incluir al menos un item' }, { status: 400 });
    }

    const ahora = new Date().toISOString();

    const pedido: Omit<Pedido, 'id'> = {
      nombre: body.nombre.trim(),
      telefono: body.telefono?.trim() || '',
      direccion: body.direccion.trim(),
      lat: body.lat,
      lon: body.lon,
      distanciaKm: body.distanciaKm,
      items: body.items,
      subtotal: body.subtotal || 0,
      costoDespacho: body.costoDespacho || 0,
      descuento: body.descuento || 0,
      total: body.total || 0,
      notas: body.notas?.trim() || '',
      estado: 'pendiente',
      canal: body.canal || 'web',
      creadoEn: ahora,
      actualizadoEn: ahora,
    };

    const id = await crearPedido(pedido);

    // Notificar al dueño de forma no bloqueante
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    fetch(`${baseUrl}/api/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pedidoId: id, pedido }),
    }).catch((err) => console.error('[order] Error notificando:', err));

    return NextResponse.json({ id, success: true }, { status: 201 });
  } catch (error) {
    console.error('[order] Error creando pedido:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
