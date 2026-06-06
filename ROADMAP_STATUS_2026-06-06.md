# 📊 Estado del Roadmap — 2026-06-06

## 🎯 Resumen Ejecutivo

| Fase | Completado | Total | % | Estado |
|------|-----------|-------|---|--------|
| **P0: Estabilidad** | 1/3 | 3 | 33% | 🔴 EN RIESGO |
| **P1: UX/Contenido** | 1/3 | 3 | 33% | 🟠 ATRASADO |
| **P2: Seguridad** | 2.5/3 | 3 | 83% | 🟡 CASI LISTO |
| **P3: Monetización** | 0/4 | 4 | 0% | 🟢 NO INICIADO |
| **TOTAL** | **4.5/13** | **13** | **35%** | ⚠️ REQUIERE ATENCIÓN |

---

## 🔴 FASE P0: ESTABILIDAD (CRÍTICA)

### P0.1: Validación & Logging de Pedidos — ❌ PENDIENTE
- **Estimado:** 2 horas
- **Prioridad:** 🔴 CRÍTICA
- **Estado:** No iniciado
- **Bloqueante:** SÍ (necesario para auditar pedidos en producción)

**Qué falta:**
- [ ] Tests unitarios para `/api/order`
- [ ] Logging estructurado en `audit_logs` Firestore collection
- [ ] Respuestas HTTP más descriptivas

---

### P0.2: EmailJS Debugging & Notificaciones — ✅ COMPLETADO
- **Estimado:** 2 horas
- **Prioridad:** 🔴 CRÍTICA
- **Estado:** ✅ HECHO (2026-05-29)
- **Commit:** `bd316e6`

**Incluye:**
- [x] Retry exponencial en `/api/notify` (500ms → 1s → 2s)
- [x] Campo `notificacion_status` en Firestore
- [x] Logging detallado de intentos

---

### P0.3: Cloud Logging & Alertas — ❌ PENDIENTE
- **Estimado:** 2 horas
- **Prioridad:** 🔴 CRÍTICA
- **Estado:** No iniciado
- **Bloqueante:** SÍ (necesario para observabilidad en producción)

**Qué falta:**
- [ ] Dashboards en Cloud Logging Console
- [ ] Alertas automáticas (error rate > 5%, latency > 2s)
- [ ] Verificación con 5 pedidos de prueba

**Impacto:** Sin esto, los issues en producción se detectan manualmente.

---

## 🟠 FASE P1: UX & CONTENIDO (ALTA)

### P1.1: Imágenes & Brand Assets — ✅ COMPLETADO
- **Estimado:** 2 horas
- **Prioridad:** 🟠 ALTA
- **Estado:** ✅ HECHO (2026-05-13)
- **Commit:** P1.1 redesign

**Incluye:**
- [x] Logo Express Wash integrado
- [x] Dark+Indigo theme aplicado
- [x] Componentes Hero, Navbar, Footer, Chat mejorados

---

### P1.2: Entrenamiento Chatbot — ⚠️ PARCIAL
- **Estimado:** 2 horas
- **Prioridad:** 🟠 ALTA
- **Estado:** ⚠️ PARCIALMENTE COMPLETADO
- **Commit:** `b5b4f01`

**Completado:**
- [x] FAQ ampliado (7 preguntas nuevas)
- [x] Escalación por keywords (reclamo, daño, perdida)
- [x] System prompt mejorado

**Falta:**
- [ ] Revisar logs reales de chats (si existen)
- [ ] Agregar respuestas a preguntas no cubiertas
- [ ] Tests manuales de 10 conversaciones típicas

---

### P1.3: FAQ & Documentación — ⚠️ PARCIAL
- **Estimado:** 2 horas
- **Prioridad:** 🟠 ALTA
- **Estado:** ⚠️ PARCIALMENTE COMPLETADO
- **Commit:** `b5b4f01`

**Completado:**
- [x] Sección FAQ en landing (accordion)
- [x] Preguntas sobre cobertura, tiempo, manchas
- [x] Modal de T&C integrado

**Falta:**
- [ ] Política de cancelación mejorada (detalles sobre reagendamiento)
- [ ] Política de daños con fotos de ejemplo
- [ ] Test visual en móvil/desktop

---

## 🟡 FASE P2: SEGURIDAD & HARDENING (MEDIA)

### P2.1: Firestore Security Rules — ⚠️ PARCIAL
- **Estimado:** 2 horas
- **Prioridad:** 🟡 MEDIA
- **Estado:** ⚠️ PARCIALMENTE COMPLETADO

**Completado:**
- [x] Validación en servidor (precios)
- [x] AES-256-GCM para teléfonos (2026-05-29)
- [x] Autenticación en `/api/pedidos` GET/PATCH

**Falta:**
- [ ] Firestore Security Rules (reglas en Firestore Console)
- [ ] Restricciones de lectura (solo admins)
- [ ] Restricciones de escritura (solo `/api/order`)

**Crítico:** Sin Security Rules, cualquiera podría leer/escribir en Firestore directamente.

---

### P2.2: Rate Limiting & DDoS — ✅ COMPLETADO
- **Estimado:** 2 horas
- **Prioridad:** 🟡 MEDIA
- **Estado:** ✅ HECHO (2026-05-26)
- **Commit:** `9bbe3e0`

**Implementado:**
- [x] `/api/chat`: 30 req/min por IP
- [x] `/api/order`: 5 pedidos/hora por IP
- [x] `/api/geo`: 60 búsquedas/hora por IP
- [x] `/api/notify`: retry exponencial

---

### P2.3: CORS, HTTPS & Security Headers — ✅ COMPLETADO (CON FIX)
- **Estimado:** 2 horas
- **Prioridad:** 🟡 MEDIA
- **Estado:** ✅ HECHO + FIXEADO (2026-06-06)
- **Commits:** `9bbe3e0`, `70d0dd2` (fix CSP)

**Implementado:**
- [x] X-Frame-Options, X-Content-Type-Options
- [x] HSTS, Referrer-Policy
- [x] CSP (ojo: fue `frame-src 'none'`, ahora permite Firebase)
- [x] HTTPS obligatorio en Cloud Run

**Nota:** Se descubrió que CSP bloqueaba Firebase Auth. **FIXEADO hoy** con `frame-src 'self' https://*.firebaseapp.com`

---

## 🟢 FASE P3: MONETIZACIÓN (BAJA)

### P3.1: Carrito Persistente — ❌ NO INICIADO
- **Estimado:** 2 horas
- **Prioridad:** 🟢 BAJA
- **Estado:** ❌ No iniciado
- **Bloqueante:** NO

---

### P3.2: Integración Stripe — ❌ NO INICIADO
- **Estimado:** 2 horas
- **Prioridad:** 🟢 BAJA
- **Estado:** ❌ No iniciado
- **Bloqueante:** NO

---

### P3.3: Cupones & Descuentos — ❌ NO INICIADO
- **Estimado:** 2 horas
- **Prioridad:** 🟢 BAJA
- **Estado:** ❌ No iniciado
- **Bloqueante:** NO

---

### P3.4: Analytics & Dashboard — ❌ NO INICIADO
- **Estimado:** 2 horas
- **Prioridad:** 🟢 BAJA
- **Estado:** ❌ No iniciado
- **Bloqueante:** NO

---

## 🚨 ISSUES & APRENDIZAJES

### 1️⃣ CSP bloqueaba Firebase Auth (FIXEADO HOY)
- **Problema:** `frame-src 'none'` en auditoría de seguridad bloqueaba iframe de Google Sign-In
- **Síntoma:** Login colgaba en "Iniciando sesión..."
- **Root cause:** Google Auth necesita cargar iframe desde `firebaseapp.com`
- **Fix:** Cambiar a `frame-src 'self' https://*.firebaseapp.com`
- **Commit:** `70d0dd2`
- **Lección:** Después de cambios de seguridad, hacer E2E testing completo

### 2️⃣ Falta Firestore Security Rules
- **Riesgo:** 🔴 CRÍTICO
- **Impacto:** Cualquiera podría acceder directamente a Firestore
- **Solución:** Aplicar reglas restrictivas en Firestore Console
- **Estimado:** 30 minutos (tarea manual)

### 3️⃣ Falta Cloud Logging Dashboards
- **Riesgo:** 🔴 CRÍTICO
- **Impacto:** Issues en producción se detectan tarde
- **Solución:** Crear dashboards + alertas en Cloud Console
- **Estimado:** 2 horas

---

## 📅 Recomendaciones Prioritarias

### 🔴 ESTA SEMANA (Críticas)
1. **P0.1:** Tests unitarios + audit_logs (2h)
2. **P0.3:** Cloud Logging dashboards (2h)
3. **P2.1:** Firestore Security Rules (0.5h manual)

### 🟠 PRÓXIMA SEMANA (Altas)
1. **P1.2 resto:** Mejorar FAQ con logs reales (1h)
2. **P1.3 resto:** Documentación de cancelación (1h)

### 🟢 DESPUÉS (Bajas - Monetización)
1. **P3.x:** Carrito → Stripe → Cupones → Analytics

---

## 📊 Horas Pendientes

| Prioridad | Horas | Tareas |
|-----------|-------|--------|
| 🔴 CRÍTICA | 4.5 | P0.1 (2h), P0.3 (2h), P2.1 (0.5h) |
| 🟠 ALTA | 3 | P1.2 resto (1h), P1.3 resto (1h), FAQ actualizaciones (1h) |
| 🟡 MEDIA | 0 | Completadas |
| 🟢 BAJA | 8 | P3.1-3.4 (2h cada una) |
| **TOTAL** | **15.5h** | En código + 0.5h manual (Firestore Rules) |

---

## ✅ Resumen de la Sesión de Hoy (2026-06-06)

**Problema:** Admin login roto desde auditoría de seguridad
**Causa:** CSP bloqueaba Firebase Auth iframe
**Solución:** Permitir `firebaseapp.com` en `frame-src`
**Resultado:** Login ✅ funcional nuevamente

**Commits hoy:**
- `1d93654` — Revert login a versión original probada
- `70d0dd2` — Fix CSP para permitir Firebase iframes

---

**Última actualización:** 2026-06-06
**Próxima sesión:** Comenzar P0.1 (Tests unitarios)
