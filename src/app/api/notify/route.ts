import { NextRequest, NextResponse } from 'next/server';
import { formatCLP } from '@/lib/utils';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';
import { actualizarNotificacionStatus } from '@/lib/firestore-admin';
import { logger } from '@/lib/logger';
import { decrypt, isEncrypted } from '@/lib/crypto';
import type { ItemPedido } from '@/lib/types';

const MAX_INTENTOS = 3;
const BACKOFF_BASE_MS = 500; // 500ms, 1000ms, 2000ms

/**
 * Envía un email via EmailJS con retry exponencial.
 * Retorna true si el email se envió con éxito, false si falló todos los intentos.
 */
async function enviarEmailConRetry(payload: object): Promise<{ ok: boolean; intentos: number; error?: string }> {
  let ultimoError = '';

  for (let intento = 1; intento <= MAX_INTENTOS; intento++) {
    try {
      const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        logger.info(`Email enviado en intento ${intento}`, { route: '/api/notify' });
        return { ok: true, intentos: intento };
      }

      ultimoError = `EmailJS ${res.status}: ${await res.text()}`;
      logger.warn(`Notify intento ${intento}/${MAX_INTENTOS} fallido`, { route: '/api/notify', error: ultimoError });
    } catch (err) {
      ultimoError = err instanceof Error ? err.message : String(err);
      logger.warn(`Notify intento ${intento}/${MAX_INTENTOS} error`, { route: '/api/notify', error: ultimoError });
    }

    // Backoff exponencial antes del próximo intento (no esperar después del último)
    if (intento < MAX_INTENTOS) {
      await new Promise((resolve) => setTimeout(resolve, BACKOFF_BASE_MS * Math.pow(2, intento - 1)));
    }
  }

  return { ok: false, intentos: MAX_INTENTOS, error: ultimoError };
}

export async function POST(request: NextRequest) {
  // Rate limit: 10 notificaciones por IP por hora (llamado internamente desde /api/order)
  const ip = getClientIP(request);
  if (!checkRateLimit(`notify:${ip}`, 10, 60 * 60_000)) {
    return NextResponse.json({ ok: false, error: 'Rate limit excedido' }, { status: 429 });
  }

  try {
    const { pedidoId, pedido } = await request.json();

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
    const ownerEmail = process.env.OWNER_EMAIL;

    if (!serviceId || !templateId || !publicKey || !ownerEmail) {
      console.warn('[notify] EmailJS no configurado — saltando notificación');
      // Guardar status skipped en Firestore si tenemos el ID
      if (pedidoId) {
        await actualizarNotificacionStatus(pedidoId, 'skipped').catch(() => {});
      }
      return NextResponse.json({ ok: true, skipped: true });
    }

    // Descifrar teléfono si está encriptado (retrocompatible con pedidos sin cifrar)
    const telefonoPlano = isEncrypted(pedido.telefono)
      ? (decrypt(pedido.telefono) ?? pedido.telefono)
      : pedido.telefono;

    // Formatear lista de items
    const itemsTexto = (pedido.items as ItemPedido[])
      .map((item) => `${item.cantidad}x ${item.tipo}: ${formatCLP(item.precioUnitario * item.cantidad)}`)
      .join('\n');

    // Generar link de WhatsApp hacia el cliente (si proporcionó teléfono)
    const whatsappLink = telefonoPlano
      ? `https://wa.me/56${telefonoPlano.replace(/\D/g, '')}?text=${encodeURIComponent(
          `Hola ${pedido.nombre}! Tu pedido #${pedidoId?.slice(-6)?.toUpperCase()} de Express Delivery Wash está confirmado 🧺`,
        )}`
      : 'No disponible (sin teléfono)';

    const payload = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        to_email: ownerEmail,
        pedido_id: pedidoId?.slice(-6)?.toUpperCase() || pedidoId,
        customer_name: pedido.nombre,
        customer_phone: telefonoPlano || 'No proporcionado',
        address: pedido.direccion,
        items: itemsTexto,
        subtotal: formatCLP(pedido.subtotal || 0),
        despacho: formatCLP(pedido.costoDespacho || 0),
        descuento: formatCLP(pedido.descuento || 0),
        total: formatCLP(pedido.total || 0),
        notas: pedido.notas || 'Sin notas',
        whatsapp_link: whatsappLink,
      },
    };

    const resultado = await enviarEmailConRetry(payload);

    // Actualizar status en Firestore
    if (pedidoId) {
      await actualizarNotificacionStatus(pedidoId, resultado.ok ? 'sent' : 'failed').catch((err) =>
        console.error('[notify] Error actualizando notificacion_status:', err),
      );
    }

    if (!resultado.ok) {
      logger.error('Notify: todos los intentos fallaron', { route: '/api/notify', pedidoId, error: resultado.error });
      return NextResponse.json(
        { ok: false, error: resultado.error, intentos: resultado.intentos },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, intentos: resultado.intentos });
  } catch (error) {
    logger.error('Error en /api/notify', { route: '/api/notify', error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ ok: false, error: 'Error interno' }, { status: 500 });
  }
}
