# 🔧 Troubleshooting Guide

Soluciones a problemas comunes en Express Delivery Wash.

---

## 🔴 Problemas Críticos

### Los pedidos no se guardan en Firestore

**Síntomas:**
- Formulario dice "¡Pedido recibido!" pero no aparece en Firebase Console
- Firestore colección `pedidos` está vacía

**Diagnóstico:**

1. Abre Chrome DevTools (F12) → Network tab
2. Haz un pedido de prueba
3. Busca request a `/api/order`
4. ¿Qué status devuelve?

**Soluciones:**

#### Status 400 (Bad Request)
```json
{
  "error": "Nombre requerido"  // o similar
}
```
→ Verifica que todos los campos requeridos estén completos:
- ✅ Nombre
- ✅ Dirección  
- ✅ Al menos 1 item

#### Status 500 (Server Error)
→ Verifica estos puntos:

1. **Firebase no conectado:**
   ```bash
   # En Cloud Run logs:
   gcloud run logs read express-wash --limit 50 | grep -i firebase
   ```
   → Verifica que `NEXT_PUBLIC_FIREBASE_CONFIG` está correcto

2. **Firestore rules bloqueando writes:**
   - Abre Firebase Console → Firestore → Rules
   - Verifica que `match /pedidos/{document=**}` permite `write`
   - Temporalmente (solo desarrollo): `allow write: if true;`

3. **Colección no existe:**
   - En Firebase Console, crea colección manualmente: `pedidos`
   - Agrega un documento dummy (se eliminará después)

### Los emails no llegan

**Síntomas:**
- Pedido se crea exitosamente pero no llega email
- EmailJS dashboard muestra "Failed"

**Diagnóstico:**

1. Abre https://dashboard.emailjs.com
2. Ve a **Email Activity**
3. Busca el email reciente → ¿qué error dice?

**Soluciones:**

#### "Invalid parameters: Service not found"
→ `NEXT_PUBLIC_EMAILJS_SERVICE_ID` está incorrecto
- Abre EmailJS Dashboard → Services
- Copia el Service ID correcto
- Actualiza en GitHub Secrets

#### "Invalid parameters: Template not found"
→ `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` está incorrecto
- Abre EmailJS Dashboard → Email Templates
- Copia el Template ID correcto
- Actualiza en GitHub Secrets

#### "Invalid API Key"
→ `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` está incorrecto
- Abre EmailJS Dashboard → Account → General
- Copia la Public Key completa
- Actualiza en GitHub Secrets

#### Email llegó pero con valores vacíos
→ Variables del template no coinciden con variables en `/api/notify`
- Abre EmailJS → Email Templates → tu template
- Verifica que las variables (entre `{{}}`) existen en `/api/notify`
- Ejemplo: si el template usa `{{customer_phone}}`, verifica que `/api/notify` envía `customer_phone` en `template_params`

---

## 🟠 Problemas Comunes

### El mapa no se carga

**Síntomas:**
- Página `/pedido` carga pero el mapa no aparece
- Console muestra error sobre Leaflet

**Diagnóstico:**

1. Abre DevTools → Console (F12)
2. Busca mensajes de error rojo

**Soluciones:**

#### "window is not defined"
→ Leaflet está siendo importado en servidor
- Verifica `MapaInner.tsx`: debe tener `'use client'` arriba
- Verifica que `leaflet/dist/leaflet.css` solo se importa en `MapaInner.tsx`, no en componentes padre

#### Mapa aparece pero sin estilos
```
yarn add leaflet
npm install leaflet
```

#### Nominatim no responde (geocoding lento)
→ OpenStreetMap está lento
- Intenta otra dirección
- O espera unos minutos

---

### El chatbot no responde

**Síntomas:**
- Click en chatbot, no responde
- O responde "Error interno"

**Diagnóstico:**

1. DevTools → Network → busca request a `/api/chat`
2. ¿Qué status devuelve?

**Soluciones:**

#### Status 500 - "API key no configurado"
```
ANTHROPIC_API_KEY no está en Cloud Run
```

→ En Cloud Run Console:
- Ve a **Environment Variables**
- Verifica que `ANTHROPIC_API_KEY` existe
- Si no, agrégala desde GitHub Secrets

#### Status 500 - "Error en Anthropic API"
→ API key puede ser inválido
- Verifica en https://console.anthropic.com/account/keys
- Copia la key correcta
- Actualiza en GitHub Secrets
- Redeploy: `git push origin main`

#### Timeout (>30 segundos)
→ Claude Haiku está lento (raro)
- Intenta otra pregunta
- O reinicia el navegador

---

### Errores al hacer build

#### "Cannot find module 'leaflet'"

```bash
npm install leaflet react-leaflet @types/leaflet
npm run build
```

#### "NEXT_PUBLIC_BASE_URL is not defined"

1. Verifica `.env.local` tiene todas las variables
2. Reinicia dev server: Ctrl+C → `npm run dev`

#### TypeScript errors en build

```bash
# Ver qué está mal
npm run build

# Ejemplo:
# src/app/api/order/route.ts:50:18
# Type 'string | undefined' is not assignable to type 'string'

# → Agregar type assertion:
// @ts-ignore  (temporal)
// o mejorar el tipo
```

---

### Firebase Console vs App Sync

**Síntoma:**
- Veo pedido en Firebase Console, pero admin panel no lo muestra
- O vice-versa

**Solución:**

Firestore tiene retraso de replicación (< 1 segundo normalmente).

1. Espera 5 segundos
2. Recarga la página
3. Si sigue sin sincronizar, verifica Firestore rules

---

## 🟡 Problemas Menores

### Tailwind CSS no se aplica

**Síntomas:**
- Estilos feos o grises en producción
- Colores correctos en dev pero no en prod

**Solución:**

Tailwind necesita recompilarse si cambias HTML:

```bash
npm run build
# o en dev mode, espera a que se recompile
```

### Imágenes no se cargan

**Síntomas:**
- "Image with src "/public/logo.png" is missing"

**Solución:**

1. Verifica que el archivo existe: `public/logo.png`
2. Si usas `<Image>` de Next.js, agrega `width` y `height`:
   ```tsx
   <Image
     src="/logo.png"
     alt="Logo"
     width={200}
     height={100}
   />
   ```

---

## 🟢 Tips de Debugging

### Ver logs de Cloud Run

```bash
# Últimos 50 logs
gcloud run logs read express-wash --limit 50

# Solo errores
gcloud run logs read express-wash --limit 50 | grep -i error

# En tiempo real (tail)
gcloud run logs read express-wash --limit 50 --follow
```

### Verificar variables de entorno

**En local:**
```bash
# Ver todas las variables cargadas
grep NEXT_PUBLIC .env.local
echo $ANTHROPIC_API_KEY
```

**En Cloud Run:**
```bash
# Ver qué recibió la app
gcloud run services describe express-wash \
  --region southamerica-west1 \
  --format="value(spec.template.spec.containers[0].env)"
```

### Inspeccionar request/response

**En navegador (DevTools):**
1. F12 → Network tab
2. Haz la acción (crear pedido, etc.)
3. Click en el request
4. Tab "Response" para ver respuesta

**Ejemplo: /api/order**
```json
Request:
{
  "nombre": "Test",
  "direccion": "Calle 123",
  "items": [...],
  "total": 7000
}

Response:
{
  "id": "O2j3K8xL9nPqR4sT5uV6wX",
  "success": true
}
```

### Testear API manualmente con curl

```bash
# Geocoding
curl "http://localhost:3000/api/geo?q=Santiago"

# Crear pedido
curl -X POST http://localhost:3000/api/order \
  -H "Content-Type: application/json" \
  -d '{
    "nombre":"Test",
    "direccion":"Calle 123",
    "items":[{"tipo":"Lavado","cantidad":1,"precioUnitario":5000}],
    "total":7000
  }'

# Chatbot
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hola"}]}'
```

### Verificar Firestore desde CLI

```bash
# Instalar firebase CLI
npm install -g firebase-tools
firebase login

# Ver documentos en colección 'pedidos'
firestore-access pedidos --project expresswash-prod-202605112332 list
```

---

## 📊 Checklist de Verificación

Antes de reportar un bug, verifica:

- [ ] `.env.local` tiene todas las variables requeridas
- [ ] Dev server está corriendo: `npm run dev`
- [ ] Todos los servicios tienen credenciales válidas:
  - [ ] Firebase config es correcto
  - [ ] EmailJS service/template/key son correctos
  - [ ] Anthropic API key es válido
- [ ] Firestore existe y tiene permisos de lectura/escritura
- [ ] EmailJS template existe y tiene las variables necesarias
- [ ] Cloud Run tiene todas las env vars configuradas
- [ ] Últimas 50 logs no muestran errores críticos
- [ ] Base de datos (Firestore) está respondiendo

---

## 🆘 Si Nada Funciona

### Opción 1: Reiniciar todo

```bash
# Elimina cache y reinstala
rm -rf node_modules .next
npm install
npm run dev
```

### Opción 2: Redeploy en Cloud Run

```bash
git push origin main
# Espera a que GitHub Actions termine (~5 min)
# Verifica: https://express-wash-4hgom7r2cq-tl.a.run.app
```

### Opción 3: Contactar soporte

- 📧 Email: [email-soporte]
- 💬 WhatsApp: +56 9 4274 9703
- 🐛 GitHub Issues: https://github.com/nfigueroaa/express-wash/issues

---

## 📝 Reporte de Bug

Si encuentras un bug, por favor reporta:

1. **¿Qué intentaste hacer?** (paso a paso)
2. **¿Qué esperabas que pasara?**
3. **¿Qué pasó realmente?**
4. **Error o código** (si existe)
5. **Logs relevantes** (ver sección Debugging)
6. **Navegador/SO** que estabas usando

Abre un issue en GitHub: https://github.com/nfigueroaa/express-wash/issues/new

---

**Última actualización:** 2026-05-12  
**Mantener al día:** A medida que resolvemos issues, agregamos aquí
