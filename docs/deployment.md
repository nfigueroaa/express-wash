# Guía de Deploy

## Infraestructura GCP

| Recurso | Valor |
|---------|-------|
| Proyecto | `expresswash-prod-202605112332` |
| Región | `southamerica-west1` |
| Servicio Cloud Run | `express-wash` |
| Artifact Registry | `southamerica-west1-docker.pkg.dev/expresswash-prod-202605112332/express-wash/express-wash` |
| Service Account | `github-deployer@expresswash-prod-202605112332.iam.gserviceaccount.com` |

## Primer Deploy (Setup)

1. Verificar que los 9 GitHub Secrets están configurados
2. Hacer push a `main`:
   ```bash
   git push origin main
   ```
3. Ir a GitHub → Actions → monitorear el workflow
4. Si falla, revisar los logs del step específico

## Deploy Rutinario

```bash
# Cualquier push a main dispara el deploy automáticamente
git add .
git commit -m "feat: descripción del cambio"
git push origin main
```

## Rollback

```bash
# Ver versiones anteriores
gcloud run revisions list --service=express-wash --region=southamerica-west1

# Redirigir tráfico a una revisión anterior
gcloud run services update-traffic express-wash \
  --region=southamerica-west1 \
  --to-revisions=express-wash-XXXXX=100
```

## Ver Logs en Producción

```bash
gcloud run services logs read express-wash \
  --region=southamerica-west1 \
  --limit=50
```

## Troubleshooting Común

| Error | Causa probable | Solución |
|-------|----------------|----------|
| Build falla en GitHub Actions | Secret faltante | Verificar los 9 secrets en Settings → Secrets |
| `docker push` falla | Auth de Artifact Registry | Verificar que `configure-docker` usa `southamerica-west1-docker.pkg.dev` |
| Cloud Run no levanta | Puerto incorrecto | Verificar `ENV PORT=8080` en Dockerfile |
| Leaflet error SSR | Import fuera de client | Verificar `dynamic({ ssr: false })` en `MapaCobertura.tsx` |
| Firebase init error | Config inválida | Verificar JSON en `NEXT_PUBLIC_FIREBASE_CONFIG` secret |
| Chat no responde | API key inválida | Verificar `ANTHROPIC_API_KEY` en Cloud Run env vars |
