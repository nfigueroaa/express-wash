/**
 * Base de conocimiento del chatbot.
 * Se inyecta directamente en el system prompt de Claude.
 */
export const FAQ_BASE = `
SERVICIOS Y PRECIOS:
- Cubrecamas 2 plazas: $15.000 CLP (24-48 horas, incluye secado)
- Plumones 2 plazas: $18.000 CLP (48-72 horas, proceso especial)
- Colchas 2 plazas: $14.000 CLP (24-48 horas)
- Sábanas y ropa: $8.000 CLP cada 5 kg (24 horas)

DESPACHO:
- Base: $2.000 CLP + $500 por km desde Santiago centro
- GRATIS en pedidos sobre $30.000 CLP
- Cobertura máxima: 15 km desde Santiago centro (-33.4489, -70.6693)

DESCUENTOS AUTOMÁTICOS:
- Pedido > $50.000: 10% de descuento
- Pedido > $80.000: 15% de descuento
- Dirección a más de 10 km: 5% adicional (compensación de distancia)
- Primera compra: $2.000 de descuento con código PRIMERA

POLÍTICA DE MANCHAS (IMPORTANTE - siempre mencionar si es relevante):
Express Delivery Wash NO garantiza la eliminación de manchas de sangre, vino tinto,
aceite o grasa de cocina, ni manchas antiguas (más de 7 días sin tratar).
El servicio puede mejorar pero no asegurar su eliminación completa.

LO QUE SÍ GARANTIZAMOS:
- Lavado completo con detergente de calidad
- Secado completo antes de entrega
- Doblado cuidadoso de items
- Entrega en bolsa sellada
- Foto de confirmación al entregar por WhatsApp
- Puntualidad o notificamos si hay demora

PREGUNTAS FRECUENTES:
- Pago: transferencia bancaria o efectivo al momento de la entrega
- Cancelación: hasta 1 hora antes del retiro, sin costo
- Boleta: disponible. Factura con RUT empresa: consultar.
- Ropa de bebés/pieles sensibles: sí, con detergente neutro opcional
- Pedido mismo día: posible si se pide antes de las 10am
- Confirmación de entrega: foto por WhatsApp
- Retiro y entrega: coordinamos fecha y franja horaria con el cliente

ESCALACIÓN (derivar al equipo humano si mencionan estas palabras):
molesto, enojado, reclamo, perdieron, dañaron, factura empresa, rut empresa,
corporativo, no llegó, urgente, mal estado, queja, devolución, horrible, pésimo
`;
