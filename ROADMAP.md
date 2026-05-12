# 📋 Roadmap Express Delivery Wash — 2026

**Última actualización:** 2026-05-12  
**Estado:** MVP en producción ✅ — Mejoras planificadas

---

## 🎯 Visión General

Este roadmap organiza las mejoras del MVP en **4 fases** de 2 horas cada una, enfocadas en:
1. **Stabilidad & Bug Fixes** — asegurar que pedidos y notificaciones funcionan perfectamente
2. **UX & Contenido** — mejorar experiencia, agregar imágenes y información
3. **Seguridad & Hardening** — proteger datos, auditar permisos, encriptar sensibles
4. **Monetización & Features Avanzadas** — carrito, carrito, pago online, descuentos

---

## 📊 Matriz de Trabajo

| Fase | Tema | Sesiones | Prioridad |
|------|------|----------|-----------|
| **P0: Stabilidad** | Pedidos, Emails, Logging | 3 sesiones × 2h | 🔴 CRÍTICA |
| **P1: UX/Contenido** | Imágenes, FAQ mejorado, Chat training | 3 sesiones × 2h | 🟠 ALTA |
| **P2: Seguridad** | BD hardening, Auth, Rate limiting, Audit | 3 sesiones × 2h | 🟡 MEDIA |
| **P3: Monetización** | Carrito, Checkout, Pago, Analytics | 4 sesiones × 2h | 🟢 BAJA |

**Total: 13 sesiones (26 horas de desarrollo)**

---

## 🔴 FASE P0: STABILIDAD (Sesiones 1-3)

### P0.1: Validación & Logging de Pedidos (2h)
**Descripción:** Asegurar que cada pedido se guarda correctamente en Firestore y genera logs auditables.

- [ ] **Tests unitarios para `/api/order`** — validar cada caso de error
  - Nombre/dirección/items requeridos
  - Items con cantidad > 0
  - Geo data correcta (lat/lon válidos)
  - Subtotal > 0
  
- [ ] **Logging estructurado** — agregar logs en formato JSON a Firestore collection `audit_logs`
  - timestamp, pedidoId, error, metadata, ip_cliente
  
- [ ] **Manejo de errores mejorado** — respuestas HTTP claras al cliente
  - 400: validación fallida (especificar cuál)
  - 500: error interno (log para debug)
  
- [ ] **Test end-to-end** — hacer 3 pedidos de prueba, verificar que aparecen en Firestore
  
**Archivos:** `src/app/api/order/route.ts`, `src/lib/firestore.ts`, tests/

**Estimación:** 2 horas  
**GitHub Issue:** #1

---

### P0.2: EmailJS Debugging & Notificaciones (2h)
**Descripción:** Garantizar que cada pedido dispara una notificación confiable al OWNER_EMAIL.

- [ ] **Verificar configuración de EmailJS**
  - Confirmar que SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY son correctos
  - Probar template en dashboard de EmailJS
  
- [ ] **Mejorar `/api/notify` route**
  - Retries en caso de timeout (max 3 intentos, backoff exponencial)
  - Logging detallado de cada intento
  - Guardar status de notificación en Firestore `pedidos.notificacion_status`
  
- [ ] **Monitoreo**
  - Agregar métrica a Admin Panel: "emails enviados hoy"
  - Alertar si > 5 emails fallan en 1 hora
  
- [ ] **Fallback SMS** — (opcional, Fase 3) considera Twilio para SMS si EmailJS falla
  
**Archivos:** `src/app/api/notify/route.ts`, `src/lib/firestore.ts`, Admin Panel

**Estimación:** 2 horas  
**GitHub Issue:** #2

---

### P0.3: Cloud Run Observability & Error Tracking (2h)
**Descripción:** Implementar observabilidad nativa en Cloud Run para debuguear issues en producción.

- [ ] **Configurar Cloud Logging**
  - Enviar todos los logs de `/api/order` y `/api/notify` a Cloud Logging (ya disponible)
  - Crear dashboards en Cloud Console
  
- [ ] **Alertas automáticas**
  - Error rate > 5% en `/api/order` → email a OWNER_EMAIL
  - Latency p95 > 2s → notificación
  
- [ ] **Trace distribuido** (opcional, para después)
  - Integrar Cloud Trace para ver llamadas Firestore + EmailJS
  
- [ ] **Verificación:**
  - Hacer 5 pedidos, ver logs en Cloud Console
  - Simular error (break EmailJS), verificar alerta
  
**Archivos:** Cloud Run config, `.github/workflows/deploy.yml`, alerts

**Estimación:** 2 horas  
**GitHub Issue:** #3

---

## 🟠 FASE P1: UX & CONTENIDO (Sesiones 4-6)

### P1.1: Imágenes & Brand Assets (2h)
**Descripción:** Agregar imágenes de marca y servicios para mejorar atractivo visual.

- [ ] **Crear/obtener imágenes**
  - Logo Express Delivery Wash (PNG + SVG)
  - Foto de lavandería/ropa (hero)
  - Iconos para cada servicio (lavado, planchado, etc.)
  - Foto de cobertura/mapa
  
- [ ] **Optimizar para web**
  - Convertir a WebP (soporte en navegadores modernos)
  - Resizing (thumbnail ~200px, display ~600px)
  - Lazy loading en componentes
  
- [ ] **Integración**
  - Agregar a `Hero.tsx` (fondo hero mejorado)
  - Agregar a `ServiciosGrid.tsx` (iconos en tarjetas)
  - Optimizar `Footer.tsx` con logo
  
- [ ] **Tests visuales** — screenshot en mobile/desktop
  
**Archivos:** `public/images/`, componentes, Next.js Image optimization

**Estimación:** 2 horas  
**GitHub Issue:** #4

---

### P1.2: Entrenamiento & Mejora del Chatbot (2h)
**Descripción:** Entrenar al chatbot para responder mejor sobre servicios, precios y cobertura.

- [ ] **Revisar conversaciones pasadas**
  - Exportar logs de chats (si existen)
  - Identificar preguntas frecuentes NO respondidas bien
  
- [ ] **Actualizar FAQ y system prompt**
  - `src/lib/faq.ts` — agregar respuestas a preguntas nuevas
  - `src/lib/chatbot-config.ts` — mejorar SYSTEM_PROMPT para tono más natural
  - Agregar ejemplos de escalación (si pregunta sobre garantía, pasarlo a humans)
  
- [ ] **Pruebas manuales**
  - Simular 10 conversaciones típicas
  - Validar respuestas sobre: cobertura, precios, descuentos, manchas, tiempo
  
- [ ] **Escalación mejorada**
  - Si detecta palabras como "reclamo", "daño", "perdida" → siempre escala
  - Guardar conversaciones escaladas en Firestore `escalations`
  
**Archivos:** `src/lib/faq.ts`, `src/lib/chatbot-config.ts`

**Estimación:** 2 horas  
**GitHub Issue:** #5

---

### P1.3: FAQ & Documentación Mejorada (2h)
**Descripción:** Expandir FAQ, agregar política de cancelación, y mejorar transparencia.

- [ ] **Secciones en landing**
  - Nueva sección "Preguntas Frecuentes" (accordion)
  - Política de cancelación (markdown renderizado)
  - Términos y condiciones (modal o página separada)
  - Política de manchas y garantía
  
- [ ] **API `/api/faqs`** (opcional)
  - GET todos los FAQs en formato JSON
  - Permite actualizarlos sin redeploy
  
- [ ] **Contenido**
  - ¿Cuál es la cobertura geográfica?
  - ¿Cuánto tiempo toman los pedidos?
  - ¿Cómo pago?
  - ¿Puedo cancelar mi pedido?
  - ¿Qué pasa si mi ropa se mancha?
  
**Archivos:** `src/components/FAQ.tsx`, `src/app/page.tsx`, docs/

**Estimación:** 2 horas  
**GitHub Issue:** #6

---

## 🟡 FASE P2: SEGURIDAD & HARDENING (Sesiones 7-9)

### P2.1: Firestore Security Rules & Protección de Datos (2h)
**Descripción:** Configurar reglas de seguridad en Firestore para prevenir acceso no autorizado.

- [ ] **Firestore Security Rules**
  ```
  - Pedidos: lectura solo si es admin (después se agrega auth)
  - Lectura: solo si `UID == admin` (temporal: false en MVP)
  - Escritura: solo desde `/api/order` (verificar token de sesión)
  - Audit logs: solo lectura para admin
  ```
  
- [ ] **Encripción de datos sensibles**
  - Teléfono: encriptar con clave maestra (AES-256)
  - Dirección: opcional encriptar
  - Crear `src/lib/crypto.ts`
  
- [ ] **Validación en servidor**
  - Sanitizar input en `/api/order` (prevenir inyección)
  - Usar `escapeHtml` para XSS
  
- [ ] **Auditoría**
  - Crear colección `audit_logs` con: timestamp, action, actor, resource, result
  - Implementar función para logging automático
  
**Archivos:** Firestore Console (rules), `src/lib/crypto.ts`, `src/lib/firestore.ts`

**Estimación:** 2 horas  
**GitHub Issue:** #7

---

### P2.2: Rate Limiting & DDoS Mitigation (2h)
**Descripción:** Proteger APIs contra abuso y ataques.

- [ ] **Rate limiting global**
  - `/api/order`: max 10 peticiones por IP por minuto
  - `/api/chat`: max 20 por IP por minuto
  - `/api/geo`: max 30 por IP por minuto
  - Usar memoria en proceso o Redis (si disponible)
  
- [ ] **Implementación**
  - Crear middleware `src/middleware.ts` para Cloud Run
  - O usar `npm install rate-limiter-flexible`
  - Retornar 429 (Too Many Requests) cuando se exceda
  
- [ ] **Protección de bot**
  - Agregar CAPTCHA simple (ej: timestamp hash) en formulario
  - O usar Google reCAPTCHA (opcional, Fase 3)
  
- [ ] **Tests**
  - Simular 15 requests a `/api/order` en 10s → debe bloquearse
  
**Archivos:** `src/middleware.ts`, API routes

**Estimación:** 2 horas  
**GitHub Issue:** #8

---

### P2.3: CORS, HTTPS & Headers de Seguridad (2h)
**Descripción:** Configurar headers de seguridad y validar CORS.

- [ ] **Configurar CORS en Next.js**
  - `next.config.js`: headers de seguridad
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  
- [ ] **HTTPS obligatorio**
  - Cloud Run auto-redirige HTTP → HTTPS
  - Verificar en prod
  
- [ ] **Validación de origen**
  - `/api/order`, `/api/notify` solo aceptan requests del mismo dominio
  - Verificar `Origin` header
  
- [ ] **Tests de seguridad**
  - curl con headers maliciosos
  - Verificar respuestas correctas
  
**Archivos:** `next.config.js`, API routes

**Estimación:** 2 horas  
**GitHub Issue:** #9

---

## 🟢 FASE P3: MONETIZACIÓN & FEATURES (Sesiones 10-13)

### P3.1: Carrito Persistente & Mejora de UX (2h)
**Descripción:** Agregar carrito con persistencia en localStorage, summary mejorado.

- [ ] **Context API para carrito**
  - Crear `src/context/CartContext.tsx`
  - Guardar cantidades en localStorage
  - Sincronizar con servidor (opcional)
  
- [ ] **Carrito visual**
  - Componente `CartSummary.tsx` en página de pedido
  - Mostrar: subtotal, descuento, despacho, total
  - Botón para limpiar carrito
  
- [ ] **Mejora: poder modificar carrito después de geocodificar**
  - Actualizar precio total en tiempo real si cambia dirección
  - Mostrar si hay descuento aplicado
  
- [ ] **Tests**
  - Agregar items, guardar, recargar página → debe persistir
  - Cambiar dirección → recalcular automáticamente
  
**Archivos:** `src/context/CartContext.tsx`, componentes

**Estimación:** 2 horas  
**GitHub Issue:** #10

---

### P3.2: Integración Stripe para Pagos (2h)
**Descripción:** Agregar pago online via Stripe (opcional para MVP+1).

- [ ] **Configurar Stripe**
  - Crear cuenta Stripe (si no existe)
  - Obtener STRIPE_PUBLIC_KEY y STRIPE_SECRET_KEY
  - Agregar a secrets de GitHub
  
- [ ] **Checkout con Stripe**
  - Instalar `stripe` y `@stripe/react-stripe-js`
  - Crear `/api/payment/create-checkout-session`
  - Crear `/api/payment/webhook` para confirmar pago
  
- [ ] **UI**
  - Agregar botón "Pagar ahora" en form de pedido
  - Redirigir a Stripe Checkout
  - Guardar `payment_status` en pedido
  
- [ ] **Seguridad**
  - Verificar firma de webhook
  - No guardar números de tarjeta (todo en Stripe)
  
**Archivos:** `src/app/api/payment/`, `/api/order` modificado

**Estimación:** 2 horas  
**GitHub Issue:** #11

---

### P3.3: Descuentos Dinámicos & Promociones (2h)
**Descripción:** Agregar sistema de cupones y promociones temporales.

- [ ] **Modelo de datos**
  - Colección Firestore `promociones`: código, descuento%, fecha_inicio, fecha_fin, uso_máximo
  - Validar cupón en `/api/order`
  
- [ ] **Lógica**
  - Cupón "PRUEBA10" → 10% descuento
  - Cupón "LEJOS5" → 5% si distancia > 10km
  - Mostrar mensaje "Cupón válido" en form
  
- [ ] **Admin Panel**
  - Ver cupones activos
  - Crear/editar/eliminar cupones
  - Ver uso (cuántas veces fue usado)
  
- [ ] **Tests**
  - Aplicar cupón inválido → error
  - Aplicar cupón válido → descuento aplicado
  - Cupón expirado → rechazado
  
**Archivos:** `src/lib/firestore.ts`, `/api/order`, Admin Panel

**Estimación:** 2 horas  
**GitHub Issue:** #12

---

### P3.4: Analytics & Dashboard Mejorado (2h)
**Descripción:** Implementar analytics básico para entender patrón de uso.

- [ ] **Métricas a rastrear**
  - Total pedidos por día
  - Ingresos por día (si hay pago)
  - Servicios más solicitados
  - Zona de cobertura más activa (mapa de calor)
  - Chats iniciados vs completados (conversion)
  
- [ ] **Storage**
  - Crear colección `metrics` con documentos por fecha
  - Usar Cloud Functions para agregar datos cada noche
  
- [ ] **Dashboard**
  - Expandir Admin Panel con gráficos
  - Usar Chart.js o similar
  - Mostrar últimos 30 días
  
- [ ] **Exportación**
  - CSV con pedidos (para reportes)
  - PDF con resumen mensual
  
**Archivos:** Admin Panel, `src/app/api/metrics/`, Cloud Functions

**Estimación:** 2 horas  
**GitHub Issue:** #13

---

## 📅 Timeline Sugerido

```
Semana 1 (Mayo 12-17):
  ├─ Sesión 1: P0.1 (pedidos)
  ├─ Sesión 2: P0.2 (emails)
  └─ Sesión 3: P0.3 (logging)

Semana 2 (Mayo 19-24):
  ├─ Sesión 4: P1.1 (imágenes)
  ├─ Sesión 5: P1.2 (chatbot)
  └─ Sesión 6: P1.3 (FAQ)

Semana 3 (Mayo 26-31):
  ├─ Sesión 7: P2.1 (Firestore security)
  ├─ Sesión 8: P2.2 (rate limiting)
  └─ Sesión 9: P2.3 (headers/CORS)

Semana 4 (Jun 2-7):
  ├─ Sesión 10: P3.1 (carrito)
  ├─ Sesión 11: P3.2 (Stripe)
  ├─ Sesión 12: P3.3 (descuentos)
  └─ Sesión 13: P3.4 (analytics)
```

---

## 📝 Notas Importantes

1. **Cada sesión = 2 horas de desarrollo puro** (no incluye testing o reuniones)
2. **P0 es BLOQUEANTE** — no continuar a P1 hasta que pedidos y emails funcionen perfectamente
3. **Testing continuo** — cada sesión debe incluir tests end-to-end, no agregar al final
4. **Documentación** — documentar cada cambio en `CHANGELOG.md`
5. **Rollback plan** — antes de cada deploy en producción, tener plan de rollback

---

## ✅ Checklist Pre-Deployment

Antes de desplegar cambios:

- [ ] Tests unitarios pasan (npm run test)
- [ ] Build sin errores (npm run build)
- [ ] No hay warnings de TypeScript
- [ ] Code review completado
- [ ] Probado en staging (si existe)
- [ ] Documentación actualizada
- [ ] Logs de Cloud Run revisados
- [ ] Performance acceptable (Lighthouse > 70)

---

## 🔗 Referencias

- [Código fuente](https://github.com/nfigueroaa/express-wash)
- [Admin Panel](https://express-wash-4hgom7r2cq-tl.a.run.app/admin)
- [Firestore Console](https://console.firebase.google.com/project/expresswash-prod-202605112332)
- [Cloud Run Console](https://console.cloud.google.com/run)
- [GitHub Issues](https://github.com/nfigueroaa/express-wash/issues)

---

**Última actualización:** 2026-05-12 por Claude  
**Siguiente revisión:** Después de completar P0.1
