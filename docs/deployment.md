# Guía de Deploy a Cloud Run

## 🏗️ Infraestructura GCP

| Recurso | Valor |
|---------|-------|
| **Proyecto** | `expresswash-prod-202605112332` |
| **Región** | `southamerica-west1` (América del Sur) |
| **Servicio** | `express-wash` |
| **Artifact Registry** | `southamerica-west1-docker.pkg.dev/expresswash-prod-202605112332/express-wash/express-wash` |
| **Service Account** | `github-deployer@expresswash-prod-202605112332.iam.gserviceaccount.com` |
| **URL producción** | https://express-wash-4hgom7r2cq-tl.a.run.app |

---

## 🔐 GitHub Secrets (9 requeridos)

Configurar en GitHub → Settings → Secrets and variables → Actions:

```
GCP_SA_KEY                           # JSON service account
ANTHROPIC_API_KEY                    # sk-ant-...
NEXT_PUBLIC_FIREBASE_CONFIG          # {"apiKey":"...","projectId":"..."}
NEXT_PUBLIC_BASE_LAT                 # -33.4489
NEXT_PUBLIC_BASE_LON                 # -70.6693
NEXT_PUBLIC_EMAILJS_SERVICE_ID       # service_xxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID      # template_xxx
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY       # xxx_public
OWNER_EMAIL                          # hola@expressdeliverywash.cl
```

---

## ⚙️ Pipeline GitHub Actions

El workflow `.github/workflows/deploy.yml` ejecuta:

```
1. Checkout código
   ↓
2. Autenticar en GCP (GCP_SA_KEY)
   ↓
3. Configurar Docker → Artifact Registry
   ↓
4. Build Docker image (multistage: deps → builder → runner)
   - Inyectar NEXT_PUBLIC_* como ARGs
   - Inyectar NEXT_PUBLIC_BASE_URL="" (vacío por defecto)
   - npm run build → generate .next/standalone
   ↓
5. Push a Artifact Registry
   ↓
6. Deploy a Cloud Run
   - Puerto: 8080
   - Memoria: 512Mi
   - CPU: 1
   - Min instances: 0
   - Max instances: 10
   - Env vars (runtime):
     • ANTHROPIC_API_KEY
     • OWNER_EMAIL
```

**Tiempo total:** ~5 minutos

---

## ⚡ Deploy Rutinario

```bash
git add .
git commit -m "feat: descripción"
git push origin main
```

GitHub Actions dispara automáticamente. Monitor en: https://github.com/nfigueroaa/express-wash/actions

---

## 🔄 Rollback a Revisión Anterior

```bash
# Listar revisiones (últimas primero)
gcloud run revisions list \
  --service=express-wash \
  --region=southamerica-west1 \
  --limit=10

# Redirigir 100% tráfico a una revisión anterior
gcloud run services update-traffic express-wash \
  --region=southamerica-west1 \
  --to-revisions=express-wash-XXXXX=100
```

---

## 📊 Monitoreo & Logs

```bash
# Ver últimos 50 logs
gcloud run logs read express-wash \
  --region=southamerica-west1 \
  --limit=50

# Solo errores
gcloud run logs read express-wash \
  --region=southamerica-west1 \
  --limit=50 | grep ERROR

# En tiempo real (tail)
gcloud run logs read express-wash \
  --region=southamerica-west1 \
  --follow
```

---

## 🐛 Troubleshooting Deploy

| Error | Causa | Solución |
|-------|-------|----------|
| **GitHub Actions: Secret faltante** | Variable build no inyectada | Revisar 9 secrets en Settings |
| **Docker build falla** | `npm run build` error | Ver logs GitHub Actions → Build step |
| **`docker push` falla** | Auth Artifact Registry | Verificar `gcloud auth configure-docker` usa `southamerica-west1-docker.pkg.dev` |
| **Cloud Run no levanta** | Puerto incorrecto | Dockerfile: `ENV PORT=8080` ✅ |
| **Pedidos/Emails fallan en prod** | `NEXT_PUBLIC_BASE_URL` vacía en Dockerfile | ✅ Ya fix: línea 44 deploy.yml: `--build-arg NEXT_PUBLIC_BASE_URL=""` |
| **Firebase config inválida** | JSON malformado en secret | Verificar caracteres especiales/quotes |
| **Chatbot no responde** | `ANTHROPIC_API_KEY` faltante | Revisar Cloud Run env vars: `gcloud run services describe express-wash --region=southamerica-west1` |

---

## 🚀 Primer Deploy (Setup Inicial)

Si estás configurando por primera vez:

```bash
# 1. Crear GCP project y service account
gcloud projects create expresswash-prod-202605112332
gcloud iam service-accounts create github-deployer \
  --project=expresswash-prod-202605112332

# 2. Otorgar permisos
gcloud projects add-iam-policy-binding expresswash-prod-202605112332 \
  --member="serviceAccount:github-deployer@expresswash-prod-202605112332.iam.gserviceaccount.com" \
  --role="roles/run.admin"

# 3. Crear key JSON
gcloud iam service-accounts keys create key.json \
  --iam-account=github-deployer@expresswash-prod-202605112332.iam.gserviceaccount.com

# 4. Copiar contenido key.json → GitHub secret GCP_SA_KEY
# 5. Añadir los otros 8 secrets
# 6. Push a main
git push origin main
```

---

## 📝 Dockerfile Multistage

```dockerfile
# Stage 1: Deps
FROM node:20-alpine AS deps
RUN npm ci

# Stage 2: Build (inyecta NEXT_PUBLIC_*)
FROM node:20-alpine AS builder
ARG NEXT_PUBLIC_FIREBASE_CONFIG
ARG NEXT_PUBLIC_BASE_LAT
ARG NEXT_PUBLIC_BASE_LON
ARG NEXT_PUBLIC_EMAILJS_SERVICE_ID
ARG NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
ARG NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
ARG NEXT_PUBLIC_BASE_URL

ENV NEXT_PUBLIC_FIREBASE_CONFIG=$NEXT_PUBLIC_FIREBASE_CONFIG
... (copiar resto)
RUN npm run build

# Stage 3: Runner (mínima)
FROM node:20-alpine AS runner
ENV NODE_ENV=production
ENV PORT=8080
COPY --from=builder /app/.next/standalone ./
EXPOSE 8080
CMD ["node", "server.js"]
```

---

## 🔔 Notas de Producción

1. **NEXT_PUBLIC_BASE_URL en Dockerfile:** Actualmente vacía (`--build-arg NEXT_PUBLIC_BASE_URL=""`) — usa mismo dominio. Si necesitas URL explícita, añadir secret y actualizar deploy.yml.

2. **Firestore Realtime:** Replicate desde Cloud Console, no desde código.

3. **Certificate autorenewable:** Cloud Run maneja HTTPS automáticamente.

4. **Free tier Cloud Run:** 2M requests/mes gratis — estimado <100K/mes hoy.

5. **Ver estado actual:**
   ```bash
   gcloud run services describe express-wash --region=southamerica-west1
   ```

**Última actualización:** 2026-05-13  
**Versión:** Pipeline ✅ Estable
