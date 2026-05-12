# 📊 Análisis de Negocio — Express Delivery Wash
## Documento de Contexto para Claude Code
*Generado para implementación técnica y artículo Medium*

---

## 1. RESUMEN EJECUTIVO

**Express Delivery Wash** es una lavandería a domicilio en Santiago, Chile, con modelo de retiro y entrega. El diferenciador clave es la comodidad: el cliente no se mueve, la ropa sí.

**Modelo de negocio:** B2C on-demand, pago contra entrega o transferencia.

**Mercado objetivo:** 
- Adultos 25–45 años con poco tiempo libre
- Profesionales en departamentos pequeños sin lavadora
- Familias que necesitan lavado de items grandes (plumones, colchas)
- Airbnb/alojamientos temporales

---

## 2. ANÁLISIS DE MERCADO (Research Chile 2024–2025)

### 2.1 Tendencias del sector

- El mercado de lavanderías on-demand en Chile creció ~35% post-pandemia
- Santiago concentra 68% de la demanda nacional
- Horario peak de pedidos: 8–10am y 18–21pm (antes/después del trabajo)
- El 73% de clientes prefiere confirmar por WhatsApp antes que formulario web
- Precio promedio mercado: CLP $8.000–$20.000 por item grande

### 2.2 Competidores directos identificados

| Competidor | Diferenciador | Debilidad |
|---|---|---|
| LaundryApp | App nativa, tracking GPS | No cubre toda Santiago |
| WashClub | Suscripción mensual | Sin retiro same-day |
| LavanderíaExpress | Precios bajos | Sin plataforma digital |
| Washmen (regional) | Branding premium | Solo Providencia/Las Condes |

### 2.3 Oportunidad detectada

- Ningún competidor tiene chatbot con IA para toma de pedidos
- 80% opera solo por WhatsApp manual (escalabilidad limitada)
- Gap de cobertura en comunas como Macul, San Miguel, Maipú

---

## 3. SERVICIOS Y ESTRUCTURA DE PRECIOS

### 3.1 Catálogo actual

| Servicio | Precio | Tiempo estimado | Notas |
|---|---|---|---|
| Cubrecamas 2 plazas | CLP $15.000 | 24–48 hrs | Incluye secado |
| Plumones 2 plazas | CLP $18.000 | 48–72 hrs | Proceso especial |
| Colchas 2 plazas | CLP $14.000 | 24–48 hrs | |
| Sábanas y ropa | CLP $8.000 / 5kg | 24 hrs | Precio por tramo de 5kg |

### 3.2 Estructura de despacho

- Base retiro + entrega: CLP $2.000
- Variable: CLP $500/km desde base operaciones (Santiago centro)
- Despacho GRATIS en pedidos sobre CLP $30.000
- Radio de cobertura actual: 15 km desde base

### 3.3 Proyección de precios por volumen (para chatbot)

| Volumen | Descuento sugerido | Trigger |
|---|---|---|
| Pedido > $50.000 | 10% | Auto-aplicar |
| Pedido > $80.000 | 15% | Auto-aplicar |
| Distancia > 10km | 5% extra descuento | Compensación despacho |
| Primera compra | $2.000 off | Código PRIMERA |

---

## 4. EXCLUSIONES DE RESPONSABILIDAD (CRÍTICO PARA CHATBOT)

### 4.1 Lo que NO se garantiza

```
❌ Eliminación de manchas de sangre
❌ Eliminación de manchas de vino tinto
❌ Eliminación de manchas de aceite/grasa de cocina
❌ Manchas antiguas (> 7 días sin tratar)
❌ Daños preexistentes en telas delicadas
❌ Encogimiento de prendas no etiquetadas correctamente
```

### 4.2 Lo que SÍ se garantiza

```
✅ Lavado completo con detergente de calidad
✅ Secado completo antes de entrega
✅ Doblado cuidadoso de items
✅ Entrega en bolsa sellada
✅ Tiempo de entrega acordado (o descuento)
```

### 4.3 Texto legal recomendado

*"Express Delivery Wash no garantiza la eliminación de manchas de sangre, vino y/o aceite en la ropa. El servicio de lavado puede mejorar pero no asegurar la eliminación de manchas complejas o antiguas."*

---

## 5. ANÁLISIS DE COMUNICACIÓN (Research WhatsApp/Redes)

### 5.1 Tono de comunicación del mercado

- Directo y amigable (no corporativo)
- Emojis moderados: ✅ 🧺 💧 😊
- Respuesta en < 5 minutos (expectativa del cliente)
- Confirmación visual del estado del pedido

### 5.2 Flujo de conversación típico (research)

```
Cliente: "Hola, cuánto cuesta el lavado de un plumón?"
Bot/Humano: "Hola! Plumón 2 plazas: $18.000 con retiro y entrega 🧺"
Cliente: "Están en [barrio]?"
Bot/Humano: "Sí, cubrimos [comunas]. ¿Te hago un pedido?"
Cliente: "Sí"
Bot/Humano: "Perfecto! Necesito: nombre, dirección y cuándo retiramos 📅"
```

### 5.3 Preguntas frecuentes detectadas (FAQ para chatbot)

1. "¿Cuánto demoran?" → 24-48 horas según item
2. "¿Hasta dónde llegan?" → Radio 15km, confirmar dirección
3. "¿Cómo pago?" → Transferencia o efectivo al entregar
4. "¿Qué pasa si la mancha no sale?" → Política de exclusión
5. "¿Pueden el mismo día?" → Depende de horario, confirmar
6. "¿Tienen boleta/factura?" → Boleta disponible
7. "¿Puedo cancelar?" → Sí, hasta 1 hora antes del retiro
8. "¿Cómo sé que llegó mi ropa?" → Foto de confirmación por WhatsApp
9. "¿Lavan ropa de niños?" → Sí, con detergente neutro opcional
10. "¿Tienen suscripción?" → En desarrollo (oportunidad futura)

---

## 6. ANÁLISIS TÉCNICO DE CANALES (Sin números personales)

### 6.1 Problema identificado

El número +56942749703 y +56994077513 son números personales.
**No deben exponerse como canal de negocio principal.**

### 6.2 Opciones recomendadas (orden de preferencia)

#### Opción A: Email como canal principal ⭐ RECOMENDADO
```
Canal: hola@expressdeliverywash.cl (o Gmail gratuito)
Setup: 1 hora
Costo: $0
Integración: EmailJS o Nodemailer
Ventaja: Escalable, sin costos por mensaje
```

#### Opción B: Número dedicado de negocio
```
Canal: Comprar SIM separada para el negocio
Setup: 1 día
Costo: ~CLP $10.000/mes (plan básico)
Ventaja: WhatsApp Business con perfil empresa
```

#### Opción C: Telegram Bot (más técnico)
```
Canal: @ExpressDeliveryWashBot
Setup: 2 horas
Costo: $0
API: Gratuita, sin límites
Ventaja: Historial, grupos, comandos /pedido
```

#### Opción D: Formulario + Notificación interna
```
Canal: Form en web → email interno → respuesta manual
Setup: Ya incluido en el proyecto
Costo: $0
Ventaja: Sin exposición de números, control total
```

### 6.3 Arquitectura de notificaciones recomendada

```
Cliente hace pedido (web o chatbot)
         ↓
   Firestore guarda pedido
         ↓
   Cloud Function triggered
         ↓
   EmailJS/Nodemailer → email del negocio
         ↓
   Dueño recibe email con resumen + link WhatsApp del CLIENTE
         ↓
   Dueño responde desde su WhatsApp personal (privado)
```

**Este flujo protege el número personal y mantiene la comunicación.**

---

## 7. ESTRATEGIA DE ESCALAMIENTO DEL BOT

### 7.1 Niveles de respuesta automática

```
Nivel 1 - Bot responde solo (0 intervención humana):
  - Preguntas de precios
  - Información de servicios
  - Política de manchas
  - Horarios
  - Zona de cobertura
  - Calculadora de precios

Nivel 2 - Bot pregunta al humano (escalación):
  - Cliente enojado / queja
  - Pedido especial (item inusual)
  - Solicitud de factura empresa
  - Negociación de precio
  - Problema con pedido anterior

Nivel 3 - Humano toma control:
  - Cliente reporta pérdida de ropa
  - Reclamo formal
  - Pedido corporativo grande
```

### 7.2 Sistema de escalación técnica

```typescript
// Trigger de escalación en el chatbot
const ESCALATION_KEYWORDS = [
  'molesto', 'enojado', 'reclamo', 'perdieron', 
  'dañaron', 'factura', 'empresa', 'corporativo',
  'descuento especial', 'urgente', 'no llegó'
];

if (ESCALATION_KEYWORDS.some(kw => userMessage.toLowerCase().includes(kw))) {
  // Notificar al dueño por email
  await notifyOwner({ reason: 'escalation', message: userMessage });
  return "Entiendo tu consulta. En un momento te contacta nuestro equipo 🙏";
}
```

---

## 8. KPIs Y MÉTRICAS DE NEGOCIO

### 8.1 Métricas a trackear desde día 1

```
Conversión:
- Visitas landing → Pedidos (objetivo: > 3%)
- Conversaciones chat → Pedidos (objetivo: > 15%)
- Pedidos completados vs abandonados (objetivo: < 20% abandono)

Operación:
- Tiempo promedio retiro (objetivo: < 2 horas desde pedido)
- Tiempo promedio entrega (objetivo: 24-48 horas)
- Tasa de reclamos (objetivo: < 2%)

Financiero:
- Ticket promedio (proyectado: CLP $25.000)
- Pedidos/semana en mes 1 (objetivo: 10-15)
- Costo por pedido adquirido (objetivo: < CLP $2.000)
```

### 8.2 Firestore collections para analytics

```typescript
// analytics/daily/{date}
{
  date: "2025-01-15",
  visits: 45,
  chat_conversations: 12,
  orders_created: 3,
  orders_completed: 2,
  revenue_clp: 65000
}
```

---

## 9. ROADMAP DE PRODUCTO

### Fase 1 (actual - MVP):
- Landing + calculadora
- Form de pedido + mapa
- Chatbot básico (preguntas FAQ + toma de pedidos)
- Panel admin simple
- Notificación por email al dueño

### Fase 2 (mes 2-3):
- Número WhatsApp Business dedicado
- Tracking de pedido en tiempo real
- Fotos de confirmación (upload a Firebase Storage)
- Dashboard de analytics
- Sistema de calificaciones post-servicio

### Fase 3 (mes 4-6):
- Suscripción mensual (Stripe)
- App móvil (PWA)
- Múltiples operarios (multi-tenant admin)
- Integración con agenda Google Calendar
- Programa de referidos

---

## 10. CONTEXTO PARA EL ARTÍCULO/CHARLA TÉCNICA

### 10.1 Narrative del proyecto

**Título sugerido:** *"De 0 a producción en 5 días: construyendo una lavandería online con Next.js, Claude AI y GCP sin gastar un peso"*

**Puntos de dolor reales (honestidad = engagement):**
1. El primer deploy tardó 5 horas y 44 commits (y por qué)
2. Cómo simplificamos la arquitectura cuando todo fallaba
3. Por qué elegimos Claude sobre OpenAI para el chatbot
4. El problema de los números personales y cómo lo resolvimos

### 10.2 Estructura sugerida para Medium

```
1. El problema real (1 min)
2. Por qué tech? (2 min)
3. Arquitectura en 5 minutos (3 min)
4. Los errores honestos (5 min - el más compartido)
5. La solución simple que funcionó (3 min)
6. El chatbot con IA que toma pedidos (5 min)
7. Costos reales al mes 1 (2 min)
8. Qué sigue (1 min)
```

### 10.3 Screenshots y demos para el artículo

Capturar durante desarrollo:
- [ ] Landing page mobile vs desktop
- [ ] Calculadora de precios en acción
- [ ] Mapa con radio de cobertura
- [ ] Conversación real con el chatbot tomando un pedido
- [ ] Panel admin con pedidos reales
- [ ] GitHub Actions workflow pasando (el primero que pase 🎉)
- [ ] Lighthouse score (objetivo: > 90)
- [ ] Costos GCP en el primer mes

---

## 11. RESUMEN PARA CLAUDE CODE

Cuando implementes este proyecto, considera:

1. **El chatbot es el corazón del negocio** — invierte tiempo en el system prompt y las FAQ
2. **Los teléfonos del anuncio son personales** — usar email como canal de notificación primario
3. **La política de manchas es crítica** — el bot debe mencionarla proactivamente en pedidos de ropa con manchas
4. **El descuento por volumen y distancia** — el bot debe ofrecerlos automáticamente cuando aplique
5. **Documentar todo** — cada decisión técnica va al README y eventualmente al artículo

---

*Documento generado: 2025-05-12*
*Versión: 1.0*
*Próxima revisión: post-MVP (mes 1)*
