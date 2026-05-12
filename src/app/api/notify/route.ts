import { NextRequest, NextResponse } from 'next/server';
import { formatCLP } from '@/lib/utils';
import type { ItemPedido } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { pedidoId, pedido } = await request.json();

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
    const ownerEmail = process.env.OWNER_EMAIL;

    if (!serviceId || !templateId || !publicKey || !ownerEmail) {
      console.warn('[notify] EmailJS no configurado — saltando notificación');
      return NextResponse.json({ ok: true, skipped: true });
    }

    // Formatear lista de items
    const itemsTexto = (pedido.items as ItemPedido[])
      .map((item) => `${item.cantidad}x ${item.tipo}: ${formatCLP(item.precioUnitario * item.cantidad)}`)
      .join('\n');

    // Generar link de WhatsApp hacia el cliente (si proporcionó teléfono)
    const whatsappLink = pedido.telefono
      ? `https://wa.me/56${pedido.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(
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
        customer_phone: pedido.telefono || 'No proporcionado',
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

    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`[notify] EmailJS error ${res.status}:`, text);
      return NextResponse.json({ ok: false, error: `EmailJS: ${res.status}` }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[notify] Error enviando notificación:', error);
    return NextResponse.json({ ok: false, error: 'Error interno' }, { status: 500 });
  }
}
