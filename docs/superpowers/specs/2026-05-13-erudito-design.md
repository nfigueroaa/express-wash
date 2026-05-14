# Spec: Skill "erudito" — Documentación Técnica Orquestada

**Fecha:** 2026-05-13  
**Aprobado por:** Nelson Figueroa Albarrán  
**Enfoque elegido:** C — Orquestadora con subagentes especializados

---

## Resumen

"erudito" es una skill híbrida de Claude Code que actualiza, audita y crea documentación técnica completa de cualquier proyecto de software. Es genérica en su lógica (configurable por proyecto), pero especializada en producir dos tipos de documentación: **práctica** (deploy en <30 min) y **narrativa** (decisiones, errores, material para charlas y Medium).

Despacha 3 subagentes especializados en paralelo: Técnico, Arquitecto y Narrador — cada uno con tono, audiencia y archivos propios.

---

## Audiencias objetivo

| Audiencia | Necesidad | Archivos |
|-----------|-----------|---------|
| **Yo mismo** (6 meses después) | Recordar cómo funciona y cómo deployar | README, setup-local, troubleshooting |
| **Dev contribuidor** | Clonar, entender, contribuir en <30 min | README, api, arquitectura, deployment |
| **Audiencia charla/Medium** | Entender decisiones, errores, aprendizajes | errores-y-aprendizajes, charla-tecnica |

---

## Arquitectura

### Flujo de ejecución

```
[erudito invocado]
        │
        ▼
[Fase 1: Contexto] — Lee código fuente, git log reciente, docs actuales, ROADMAP
        │
        ▼
[Fase 2: Diagnóstico] — Lista qué está desactualizado en cada archivo de docs
        │
        ▼
[Fase 3: Despacho paralelo — 3 subagentes]
        │
   ┌────┴──────────┬──────────────┐
   ▼               ▼              ▼
[Técnico]      [Arquitecto]   [Narrador]
README.md      arquitectura   errores-y-
setup-local    .md            aprendizajes
deployment     decisiones     .md
api.md         técnicas       charla-tecnica
troubleshoot                  .md (nuevo si
                              no existe)
        │
        ▼
[Fase 4: Commit único]
"docs: update all documentation via erudito"
```

### Bloque de configuración (opcional — lo que hace híbrida a la skill)

El usuario puede definir al invocar la skill:

```yaml
proyecto: Express Delivery Wash
stack: Next.js 14, Cloud Run, Firebase, Claude Haiku
repo: https://github.com/nfigueroaa/express-wash
url-produccion: https://express-wash-4hgom7r2cq-tl.a.run.app
audiencias: [dev-contribuidor, yo-mismo, charla-tecnica]
```

Si no se define, la skill infiere los valores desde `package.json`, `README.md` existente, y `git remote get-url origin`.

---

## Subagentes

### Subagente Técnico

**Archivos que produce:**
- `README.md` — badges, descripción, setup rápido, deploy, variables de entorno, arquitectura en tabla
- `docs/setup-local.md` — guía paso a paso para desarrollo local
- `docs/deployment.md` — CI/CD, Cloud Run, secrets, troubleshooting de deploy
- `docs/api.md` — endpoints, request/response, ejemplos curl/fetch
- `docs/troubleshooting.md` — problemas comunes y soluciones

**Lee antes de escribir:**
- `package.json`, `next.config.js`, `Dockerfile`, `.github/workflows/deploy.yml`
- Todos los archivos en `src/app/api/`
- `.env.local.example`

**Tono:** Directo e imperativo. Tablas para comparaciones, bloques de código para comandos. Nunca explica el "por qué" — eso es trabajo del Arquitecto.

**Audiencia principal:** Dev que clona el repo por primera vez.

---

### Subagente Arquitecto

**Archivos que produce:**
- `docs/arquitectura.md` — diagrama ASCII del flujo, stack con justificaciones, decisiones técnicas clave

**Lee antes de escribir:**
- `src/lib/` (types, utils, firestore, chatbot-config)
- `src/app/` (estructura de rutas)
- `src/components/` (lista de componentes y su rol)
- Git log de los últimos 20 commits

**Tono:** Explicativo. Cada decisión técnica incluye "por qué se eligió X sobre Y". Diagramas ASCII para flujos. Secciones de "Alternativas consideradas".

**Audiencia principal:** Dev senior o colaborador que quiere entender el sistema antes de modificarlo.

**Estructura del output:**
```markdown
# Arquitectura — [Proyecto]
## Diagrama de Flujo
## Stack y Por Qué (tabla: Tecnología | Alternativa | Razón de elección)
## Componentes Principales (mapa de responsabilidades)
## Decisiones de Diseño
## Limitaciones conocidas
```

---

### Subagente Narrador

**Archivos que produce:**
- `docs/errores-y-aprendizajes.md` — errores reales, diagnóstico, solución, aprendizaje
- `docs/charla-tecnica.md` — material para presentación técnica (CREA si no existe)

**Lee antes de escribir:**
- `docs/errores-y-aprendizajes.md` actual (si existe)
- Git log completo (busca commits de fix/hotfix/debug)
- ROADMAP.md (para contexto de fases y decisiones)

**Tono:** Primera persona, honesto, narrativo. "Esto falló porque…", "Lo que aprendí fue…". Permite emociones técnicas ("fue frustrante", "fue elegante"). Ideal para Medium y charlas.

**Estructura de `charla-tecnica.md`:**
```markdown
# [Proyecto] — Para la Charla Técnica
## La Idea en 30 Segundos
## El Stack y Por Qué (decisiones reales)
## Los N Errores que Cometí
## Arquitectura en un Diagrama
## Datos Reales: costo, tiempo de build, usuarios
## Qué Haría Diferente Hoy
## Demo points
```

---

## Estructura de Archivos de la Skill

```
skills/erudito/
├── SKILL.md                    # Orquestadora principal
└── references/
    ├── tecnico.md              # Instrucciones completas para subagente Técnico
    ├── arquitecto.md           # Instrucciones completas para subagente Arquitecto
    └── narrador.md             # Instrucciones completas para subagente Narrador
```

**Ubicación:** `C:\Users\figue\.claude\plugins\cache\claude-plugins-official\superpowers\5.1.0\skills\erudito\`

Va en el directorio de superpowers (no en `express-wash-skills`) para que esté disponible en cualquier proyecto futuro.

---

## SKILL.md — Frontmatter

```yaml
---
name: erudito
description: Use when the user wants to update, audit, or create technical 
  documentation for any project. Triggers on: "actualiza la documentación", 
  "documenta el proyecto", "prepara la charla técnica", "actualiza el README",
  "documenta la arquitectura", "actualiza los docs", "erudito". Dispatches 
  3 parallel specialized subagents: Técnico (README/API/deploy), Arquitecto 
  (architecture/decisions), Narrador (errors/lessons/talk). Always reads 
  current code state before writing. Works on any tech stack.
---
```

---

## Secciones del SKILL.md (body)

1. **Contexto configurable** — bloque YAML opcional + fallback de inferencia automática
2. **Fase 1: Diagnóstico** — qué leer, cómo generar el diagnóstico, formato de salida
3. **Fase 2: Despacho de subagentes** — cómo construir el prompt de cada uno, qué contexto incluir
4. **Fase 3: Commit** — mensaje estándar, cómo verificar que los archivos cambiaron
5. **Quick Reference** — tabla de triggers, archivos afectados, modelos recomendados
6. **Anti-patterns** — qué NO hacer (inventar datos, omitir secciones, no leer código antes de escribir)

---

## Modelo recomendado por rol

| Rol | Modelo | Razón |
|-----|--------|-------|
| Orquestadora (Fases 1-2, diagnóstico + despacho) | haiku | Tarea mecánica: leer archivos y generar lista de cambios |
| Subagente Técnico | haiku | Documentación estructurada, formato fijo, poco juicio editorial |
| Subagente Arquitecto | sonnet | Requiere razonamiento sobre decisiones de diseño y alternativas |
| Subagente Narrador | sonnet | Requiere tono narrativo, juicio editorial, primera persona honesta |

---

## Criterios de Éxito

- [ ] Skill se activa con triggers en español e inglés
- [ ] Infiere stack del proyecto si no se configura
- [ ] Técnico actualiza README con estado actual (componentes, stack, URL de producción)
- [ ] Arquitecto documenta decisiones reales con alternativas consideradas
- [ ] Narrador produce `charla-tecnica.md` si no existe
- [ ] Todos los archivos commiteados en un solo commit
- [ ] Sin datos inventados — todo derivado del código real
- [ ] Aplicable a cualquier proyecto (no solo edwash)

---

## Archivos NO modificados por erudito

- `src/` — nunca toca código
- `ROADMAP.md` — actualizado por el usuario, no por erudito
- `docs/superpowers/` — plans y specs, no son docs de usuario
- `.env.local.example` — no lo modifica, pero lo lee para documentar variables

---

**Última actualización:** 2026-05-13  
**Estado:** Aprobado — Listo para plan de implementación
