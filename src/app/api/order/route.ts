import { NextRequest, NextResponse } from 'next/server';
import { crearPedido } from '@/lib/firestore-admin';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';
import { calcularDespacho, calcularDescuento } from '@/lib/utils';
import { PRECIOS } from '@/lib/types';
import { logger } from '@/lib/logger';
import { encrypt } from '@/lib/crypto';
import type { Pedido, ItemPedido } from '@/lib/types';

export async function POST(request: NextRequest) {
  const start = Date.now();
  // Rate limit: 5 pedidos por IP por hora
  const ip = getClientIP(request);
  if (!checkRateLimit(ip, 5, 60 * 60_000)) {
    logger.warn('Rate limit excedido en /api/order', { route: '/api/order', ip });
    return NextResponse.json(
      { error: 'Demasiados pedidos. Intenta nuevamente en una hora.' },
      { status: 429 },
    );
  }

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

    // Validar tipos de items y recalcular precios SERVER-SIDE
    // No se confía en los precios enviados por el cliente
    const tiposValidos = PRECIOS.map((p) => p.tipo);
    const itemsSanitizados: ItemPedido[] = [];
    for (const item of body.items) {
      if (!tiposValidos.includes(item.tipo)) {
        return NextResponse.json({ error: `Tipo de item inválido: ${item.tipo}` }, { status: 400 });
      }
      const cantidad = Math.max(1, Math.floor(Number(item.cantidad) || 1));
      const precioOficial = PRECIOS.find((p) => p.tipo === item.tipo)!.precio;
      itemsSanitizados.push({ tipo: item.tipo, cantidad, precioUnitario: precioOficial });
    }

    // Recalcular totales con valores oficiales (no del cliente)
    const distanciaKm = typeof body.distanciaKm === 'number' ? body.distanciaKm : 0;
    const subtotalCalculado = itemsSanitizados.reduce(
      (acc, i) => acc + i.precioUnitario * i.cantidad, 0,
    );
    const descuentoCalculado = calcularDescuento(subtotalCalculado, distanciaKm);
    const subtotalConDescuento = subtotalCalculado - descuentoCalculado;
    const costoDespachoCalculado = calcularDespacho(distanciaKm, subtotalConDescuento);
    const totalCalculado = subtotalConDescuento + costoDespachoCalculado;

    const ahora = new Date().toISOString();

    const telefonoRaw = body.telefono?.trim() || '';

    const pedido: Omit<Pedido, 'id'> = {
      nombre: body.nombre.trim(),
      telefono: encrypt(telefonoRaw) ?? telefonoRaw, // AES-256-GCM cifrado
      direccion: body.direccion.trim(),
      lat: body.lat,
      lon: body.lon,
      distanciaKm,
      items: itemsSanitizados,
      subtotal: subtotalCalculado,
      costoDespacho: costoDespachoCalculado,
      descuento: descuentoCalculado,
      total: totalCalculado,
      notas: body.notas?.trim() || '',
      estado: 'pendiente',
      canal: body.canal || 'web',
      creadoEn: ahora,
      actualizadoEn: ahora,
      notificacion_status: 'pending',
    };

    const id = await crearPedido(pedido);

    logger.info('Pedido creado', {
      route: '/api/order',
      ip,
      pedidoId: id,
      total: totalCalculado,
      items: itemsSanitizados.length,
      durationMs: Date.now() - start,
    });

    // Notificar al dueño de forma no bloqueante
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    fetch(`${baseUrl}/api/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pedidoId: id, pedido }),
    }).catch((err) => logger.error('Error disparando notificación', { route: '/api/order', pedidoId: id, error: String(err) }));

    return NextResponse.json({ id, success: true }, { status: 201 });
  } catch (error) {
    logger.error('Error creando pedido', {
      route: '/api/order',
      ip,
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - start,
    });
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
