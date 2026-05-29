# CLAUDE.md — Reglas del Proyecto Express Delivery Wash

> Este archivo es leído automáticamente por Claude Code al inicio de cada sesión.
> Las reglas aquí **sobrescriben** el comportamiento por defecto.

---

## 🔐 REGLA #1 — NUNCA publicar datos sensibles en git

**NUNCA** hagas `git add` ni `git commit` de archivos que contengan:

| Tipo de dato | Ejemplos | Dónde viven correctamente |
|---|---|---|
| API keys de Anthropic | `sk-ant-api03-...` | Variable de entorno en Cloud Run |
| Firebase private keys | `-----BEGIN PRIVATE KEY-----` | Secret de GCP / nunca en código |
| Credenciales de EmailJS | `service_xxx`, `template_xxx`, public key real | GitHub Secrets |
| Contraseñas o tokens | cualquier string > 20 chars que no sea placeholder | `.env.local` (gitignoreado) |
| `.env.local` | el archivo entero | nunca en git |
| `.claude/settings.local.json` | contiene permisos con comandos que pueden incluir keys | nunca en git |
| `.claude/worktrees/` | subagentes pueden tener keys en settings | nunca en git |

### Antes de cualquier `git add` verifica:
```bash
# Busca keys reales (no placeholders) en archivos que vas a stagear
git diff --cached | grep -E "(sk-ant-api03-[A-Za-z0-9]{20,}|AIza[0-9A-Za-z]{35}|BEGIN PRIVATE KEY)"
```

Si el resultado no está vacío → **NO hagas commit**. Revisa y elimina el secreto primero.

---

## 🚫 REGLA #2 — Archivos NUNCA en git

Los siguientes archivos están en `.gitignore` y **NUNCA** deben rastrearse:

```
.env.local
.env.*.local
.claude/settings.local.json
.claude/worktrees/
key.json
*.pem
*.p12
*.pfx
serviceAccount*.json
firebase-adminsdk*.json
```

Si por error un secreto entra en un commit → **detente y avisa al usuario** antes de hacer push. El proceso de limpieza es costoso (filter-branch + force push).

---

## ⚠️ REGLA #3 — Variables de entorno, nunca hardcodeadas

**MAL** (nunca hacer esto):
```typescript
admin.initializeApp({ projectId: 'expresswash-prod-202605112332' }); // OK (project ID es público)
const key = 'sk-ant-api03-xxxxx'; // ❌ NUNCA
```

**BIEN**:
```typescript
const key = process.env.ANTHROPIC_API_KEY; // ✅ solo server-side
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID; // ✅
```

Regla de oro: **si el valor cambia entre dev/prod, va en variable de entorno**.

---

## 📋 Variables de entorno del proyecto

| Variable | Tipo | Dónde se configura |
|---|---|---|
| `ANTHROPIC_API_KEY` | 🔴 SECRETA | Cloud Run runtime env |
| `OWNER_EMAIL` | 🟡 PRIVADA | Cloud Run runtime env |
| `NEXT_PUBLIC_FIREBASE_CONFIG` | 🟡 BUILD-TIME | GitHub Secret → Docker ARG |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | 🟡 BUILD-TIME | GitHub Secret → Docker ARG |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` | 🟡 BUILD-TIME | GitHub Secret → Docker ARG |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | 🟡 BUILD-TIME | GitHub Secret → Docker ARG |
| `NEXT_PUBLIC_BASE_LAT` | 🟢 PÚBLICA | GitHub Secret → Docker ARG |
| `NEXT_PUBLIC_BASE_LON` | 🟢 PÚBLICA | GitHub Secret → Docker ARG |

---

## 🔄 REGLA #4 — Antes de hacer push

Checklist obligatorio:

- [ ] `git diff HEAD` — ¿hay algún valor que parece una key real?
- [ ] Ningún archivo `.env.*` en staging area
- [ ] Ningún `settings.local.json` en staging area
- [ ] Si hay duda, mejor preguntar al usuario que arriesgarse

---

## 🛠️ Stack del proyecto (referencia rápida)

- **Framework:** Next.js 14 App Router + TypeScript + Tailwind CSS
- **DB:** Firebase Firestore (Admin SDK server-side, Client SDK solo para auth browser)
- **Auth:** Firebase Auth (Google) + session cookie httpOnly
- **Deploy:** GitHub Actions → Docker → GCP Cloud Run (`southamerica-west1`)
- **AI:** Claude Haiku 4.5 via Anthropic API (solo server-side)
- **Email:** EmailJS (200/mes gratis)
- **Mapas:** Leaflet + OpenStreetMap + Nominatim (sin API key)

## 🌐 URLs

- **Producción:** https://express-wash-4hgom7r2cq-tl.a.run.app
- **Admin:** https://express-wash-4hgom7r2cq-tl.a.run.app/admin
- **Repo:** https://github.com/nfigueroaa/express-wash
