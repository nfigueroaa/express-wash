# 🔌 API Reference

Documentación completa de los endpoints disponibles en Express Delivery Wash.

---

## 📡 Base URLs

- **Local:** `http://localhost:3000/api`
- **Producción:** `https://express-wash-4hgom7r2cq-tl.a.run.app/api`

---

## 🗺️ `/api/geo` — Geocoding

Busca coordenadas de una dirección usando Nominatim (OpenStreetMap).

### Request

```http
GET /api/geo?q=Miraflores+123,+Santiago
```

### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `q` | string | ✅ Sí | Dirección a buscar (URL encoded) |

### Response (200 OK)

```json
{
  "lat": -33.4489,
  "lon": -70.6693,
  "displayName": "Miraflores, Región Metropolitana, Chile",
  "distanciaKm": 5.2,
  "dentroDeCobertura": true,
  "costoDespacho": 2000
}
```

### Fields

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `lat` | number | Latitud |
| `lon` | number | Longitud |
| `displayName` | string | Nombre completo de la dirección |
| `distanciaKm` | number | Distancia en km desde centro (Haversine) |
| `dentroDeCobertura` | boolean | ¿Está dentro de 15 km? |
| `costoDespacho` | number | Costo en CLP (cero si subtotal ≥ $30k) |

### Error Responses

```json
// 400 - Sin parámetro q
{
  "error": "Parámetro 'q' requerido"
}

// 404 - Dirección no encontrada
{
  "error": "No se encontró la dirección"
}

// 500 - Error en servidor
{
  "error": "Error interno del servidor"
}
```

### Ejemplo cURL

```bash
curl "http://localhost:3000/api/geo?q=Santiago%20Centro"
```

---

## 📦 `/api/order` — Crear Pedido

Crea un nuevo pedido en Firestore y dispara notificación por email.

### Request

```http
POST /api/order
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "telefono": "942749703",
  "direccion": "Miraflores 123, Santiago",
  "lat": -33.4489,
  "lon": -70.6693,
  "distanciaKm": 5.2,
  "items": [
    {
      "tipo": "Lavado Estándar",
      "cantidad": 2,
      "precioUnitario": 5000
    }
  ],
  "subtotal": 10000,
  "descuento": 0,
  "costoDespacho": 2000,
  "total": 12000,
  "notas": "Consultar antes de lavar",
  "canal": "web"
}
```

### Body Parameters

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `nombre` | string | ✅ | Nombre cliente |
| `telefono` | string | ❌ | Teléfono sin código país |
| `direccion` | string | ✅ | Dirección completa |
| `lat` | number | ❌ | Latitud del resultado geocoding |
| `lon` | number | ❌ | Longitud del resultado geocoding |
| `distanciaKm` | number | ❌ | Distancia en km |
| `items` | array | ✅ | Array de ItemPedido |
| `subtotal` | number | ✅ | Suma de items |
| `descuento` | number | ❌ | Descuento aplicado |
| `costoDespacho` | number | ❌ | Costo de entrega |
| `total` | number | ✅ | Subtotal + despacho - descuento |
| `notas` | string | ❌ | Instrucciones especiales |
| `canal` | string | ❌ | "web" (default) u otro canal |

### ItemPedido

```json
{
  "tipo": "Lavado Estándar",
  "cantidad": 2,
  "precioUnitario": 5000
}
```

### Response (201 Created)

```json
{
  "id": "O2j3K8xL9nPqR4sT5uV6wX",
  "success": true
}
```

### Error Responses

```json
// 400 - Validación fallida
{
  "error": "Nombre requerido"
}

// 400 - Sin items
{
  "error": "Debe incluir al menos un item"
}

// 500 - Error creando pedido
{
  "error": "Error interno del servidor"
}
```

### Side Effects

- 📄 Crea documento en `pedidos` collection
- 📧 Dispara `/api/notify` (no bloqueante)
- 📊 Actualiza métricas (próximamente)

### Ejemplo cURL

```bash
curl -X POST http://localhost:3000/api/order \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test",
    "direccion": "Miraflores 123",
    "items": [{"tipo": "Lavado Estándar", "cantidad": 1, "precioUnitario": 5000}],
    "total": 7000
  }'
```

---

## 📧 `/api/notify` — Enviar Notificación

Envía un email al dueño cuando hay un nuevo pedido.

> **Nota:** Normalmente se llama automáticamente desde `/api/order`. Aquí se documenta para referencia.

### Request

```http
POST /api/notify
Content-Type: application/json

{
  "pedidoId": "O2j3K8xL9nPqR4sT5uV6wX",
  "pedido": {
    "nombre": "Juan Pérez",
    "telefono": "942749703",
    "direccion": "Miraflores 123",
    "items": [...],
    "subtotal": 10000,
    "costoDespacho": 2000,
    "total": 12000
  }
}
```

### Response (200 OK)

```json
{
  "ok": true
}
```

### Error Responses

```json
// 200 - EmailJS no configurado (skipped)
{
  "ok": true,
  "skipped": true
}

// 500 - Error enviando email
{
  "ok": false,
  "error": "EmailJS: 400"
}
```

---

## 💬 `/api/chat` — Chatbot Claude

Envía un mensaje al chatbot y obtiene respuesta de Claude Haiku.

### Request

```http
POST /api/chat
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "¿Cuál es la cobertura?"
    }
  ]
}
```

### Messages Format

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Primera pregunta"
    },
    {
      "role": "assistant",
      "content": "Respuesta"
    },
    {
      "role": "user",
      "content": "Pregunta siguiente"
    }
  ]
}
```

### Response (200 OK)

```json
{
  "content": "La cobertura es de 15 km desde Santiago centro. Retiramos ropa en 24-48 horas.",
  "escalado": false
}
```

### Fields

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `content` | string | Respuesta del chatbot |
| `escalado` | boolean | ¿Fue escalado a humanos? |

### Response (Escalado)

```json
{
  "content": "Entendido, necesitas ayuda especial. Te contactaremos vía WhatsApp al 942749703",
  "escalado": true
}
```

### Error Responses

```json
// 400 - Sin messages
{
  "error": "Campo 'messages' requerido"
}

// 500 - Error en Claude API
{
  "error": "Error en Anthropic API"
}

// 500 - ANTHROPIC_API_KEY no configurado
{
  "error": "API key no configurado"
}
```

### Escalación Automática

El chatbot detecta estas palabras y escala automáticamente:
- "reclamo", "complaint"
- "daño", "damaged", "manchado", "stain"
- "perdida", "lost", "missing"
- "urgente", "emergency"

### Ejemplo cURL

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "¿Qué servicios ofrecen?"}
    ]
  }'
```

---

## 🔍 Status Codes

| Código | Significado |
|--------|------------|
| `200` | Exitoso — respuesta devuelta |
| `201` | Creado — recurso creado (pedido) |
| `400` | Bad Request — parámetro inválido |
| `404` | Not Found — recurso no existe |
| `429` | Too Many Requests — rate limit excedido |
| `500` | Server Error — error interno |

---

## ⚡ Rate Limits (Próximamente)

Cuando se implemente P2.2:

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| `/api/order` | 10 requests | 1 minuto |
| `/api/chat` | 20 requests | 1 minuto |
| `/api/geo` | 30 requests | 1 minuto |

Exceder el límite devuelve `429 Too Many Requests`.

---

## 🔐 Seguridad

### NEXT_PUBLIC_* vs Variables Privadas

```javascript
// ✅ Seguro — visible en client, no es sensible
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

// ❌ Inseguro — NUNCA usar en client
const apiKey = process.env.ANTHROPIC_API_KEY;  // undefined aquí

// ✅ Seguro — solo en server
// src/app/api/chat/route.ts
const apiKey = process.env.ANTHROPIC_API_KEY;
```

### CORS

- ✅ Requests desde mismo dominio: permitido
- ❌ Requests desde otro dominio: bloqueado (próximamente)

---

## 📚 Ejemplos por Framework

### JavaScript/Fetch

```javascript
// GET /api/geo
const geo = await fetch(
  '/api/geo?q=Santiago'
).then(r => r.json());

// POST /api/order
const order = await fetch('/api/order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombre: 'Test',
    direccion: 'Miraflores 123',
    items: [...],
    total: 7000
  })
}).then(r => r.json());
```

### React Hook

```typescript
import { useState } from 'react';

export function useChat() {
  const [loading, setLoading] = useState(false);

  const send = async (messages: ChatMessage[]) => {
    setLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      });
      return await response.json();
    } finally {
      setLoading(false);
    }
  };

  return { send, loading };
}
```

---

## 📖 Más Información

- [Arquitectura](arquitectura.md)
- [Setup Local](setup-local.md)
- [Troubleshooting](troubleshooting.md)

**Última actualización:** 2026-05-12
