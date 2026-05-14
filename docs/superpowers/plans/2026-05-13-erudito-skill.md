# Skill "erudito" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Crear la skill "erudito" — un orquestador de documentación técnica que despacha 3 subagentes especializados (Técnico, Arquitecto, Narrador) para actualizar todos los docs de cualquier proyecto.

**Architecture:** 4 archivos Markdown en `skills/erudito/`: el orquestador `SKILL.md` y 3 archivos de referencia en `references/` (uno por subagente). No hay código ejecutable — solo instrucciones en lenguaje natural que Claude sigue al invocar la skill.

**Tech Stack:** Claude Code skills (Markdown + YAML frontmatter) · superpowers plugin directory

---

## File Map

| Acción | Archivo | Responsabilidad |
|--------|---------|-----------------|
| Crear | `skills/erudito/SKILL.md` | Orquestador: diagnóstico + despacho + commit |
| Crear | `skills/erudito/references/tecnico.md` | Instrucciones para actualizar README, API, deploy, setup, troubleshooting |
| Crear | `skills/erudito/references/arquitecto.md` | Instrucciones para actualizar arquitectura.md con decisiones técnicas |
| Crear | `skills/erudito/references/narrador.md` | Instrucciones para actualizar errores-y-aprendizajes.md y crear charla-tecnica.md |

**Base directory:** `C:\Users\figue\.claude\plugins\cache\claude-plugins-official\superpowers\5.1.0\skills\`

---

## Task 1: SKILL.md — Orquestador Principal

**Files:**
- Create: `C:\Users\figue\.claude\plugins\cache\claude-plugins-official\superpowers\5.1.0\skills\erudito\SKILL.md`

- [ ] **Step 1: Crear el directorio y el archivo SKILL.md**

Crear el archivo en la ruta exacta con este contenido completo:

```markdown
---
name: erudito
description: Use when the user wants to update, audit, or create technical documentation
  for any project. Triggers on "actualiza la documentación", "documenta el proyecto",
  "prepara la charla técnica", "actualiza el README", "documenta la arquitectura",
  "actualiza los docs", "erudito". Dispatches 3 parallel specialized subagents —
  Técnico (README/API/deploy/setup), Arquitecto (architecture/decisions), Narrador
  (errors/lessons/tech-talk). Always reads current code state before writing. Works
  on any tech stack. Use this skill proactively whenever documentation seems stale
  after a major feature or redesign.
---

# erudito — Documentación Técnica Orquestada

Eres el orquestador de la skill erudito. Tu trabajo es leer el estado actual del proyecto, diagnosticar qué documentación está desactualizada, y despachar 3 subagentes especializados que actualicen cada sección. Nunca tocas código — solo lees `src/` para entender el estado real y escribes en `docs/`.

## Contexto configurable (opcional)

Si el usuario proveyó un bloque de configuración, úsalo. Si no, infiere desde el proyecto:

```yaml
# Ejemplo de configuración manual (el usuario puede proveerlo al invocar la skill):
proyecto: Express Delivery Wash
stack: Next.js 14, Cloud Run, Firebase, Claude Haiku
repo: https://github.com/nfigueroaa/express-wash
url-produccion: https://express-wash-4hgom7r2cq-tl.a.run.app
audiencias: [dev-contribuidor, yo-mismo, charla-tecnica]
```

**Si no hay configuración manual, infiere así:**
1. Nombre del proyecto: leer `package.json` → campo `name` o `description`
2. Stack: leer `package.json` → `dependencies` + buscar `Dockerfile`, `next.config.js`, `firebase.json`
3. Repo: ejecutar `git remote get-url origin`
4. URL de producción: buscar en `README.md`, `.github/workflows/*.yml`, o `deployment.md`
5. Audiencias: asumir `[dev-contribuidor, yo-mismo, charla-tecnica]` por defecto

## Fase 1: Diagnóstico

Lee estos archivos para entender el estado actual del proyecto:

**Código fuente (solo lectura, nunca modificar):**
- `package.json` — dependencias, nombre, versión
- `next.config.js` o equivalente — configuración del framework
- `Dockerfile` — configuración de contenedor
- `.github/workflows/` — pipelines de CI/CD
- `src/app/api/` o equivalente — endpoints disponibles
- `src/components/` — lista de componentes
- `src/lib/` — utilidades, tipos, configuración

**Documentación actual:**
- `README.md`
- `docs/` — todos los archivos .md

**Historial:**
- Los últimos 20 commits: `git log --oneline -20`
- `ROADMAP.md` si existe

**Output del diagnóstico (escríbelo internamente antes de despachar):**
```
DIAGNÓSTICO erudito — [fecha]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
README.md: [desactualizado / ok] — razón
docs/setup-local.md: [desactualizado / ok] — razón
docs/api.md: [desactualizado / ok] — razón
docs/deployment.md: [desactualizado / ok] — razón
docs/troubleshooting.md: [desactualizado / ok] — razón
docs/arquitectura.md: [desactualizado / ok] — razón
docs/errores-y-aprendizajes.md: [desactualizado / ok] — razón
docs/charla-tecnica.md: [existe / NO EXISTE — crear]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Fase 2: Despacho de subagentes

Despacha los 3 subagentes. Cada uno recibe como contexto:
1. El diagnóstico completo
2. Los archivos de código relevantes para su sección (NO el código completo — solo los relevantes)
3. La versión actual del doc que va a actualizar
4. Sus instrucciones desde `references/` (incluye el contenido completo del archivo de referencia en el prompt)

**Al construir el prompt de cada subagente, incluye:**

```
Eres el subagente [Técnico/Arquitecto/Narrador] de la skill erudito.

DIAGNÓSTICO:
[pegar diagnóstico completo]

INSTRUCCIONES:
[pegar contenido completo de references/tecnico.md / arquitecto.md / narrador.md]

ARCHIVOS DE CÓDIGO RELEVANTES:
[pegar contenido de los archivos específicos listados en las instrucciones]

DOCUMENTACIÓN ACTUAL:
[pegar el contenido actual de los docs que debe actualizar]

CONFIGURACIÓN DEL PROYECTO:
proyecto: [nombre]
stack: [stack]
repo: [url]
url-produccion: [url]
```

**Modelos recomendados:**
- Subagente Técnico → haiku (estructura fija, poco juicio)
- Subagente Arquitecto → sonnet (razonamiento sobre decisiones)
- Subagente Narrador → sonnet (tono narrativo, juicio editorial)

## Fase 3: Commit

Después de que los 3 subagentes completen su trabajo:

```bash
git add README.md docs/
git commit -m "docs: update all documentation via erudito skill"
git push origin main
```

Verifica que al menos 3 archivos cambiaron. Si ninguno cambió, algo salió mal — reporta al usuario.

## Quick Reference

| Trigger | Qué hace |
|---------|---------|
| "actualiza la documentación" | Ejecuta diagnóstico + 3 subagentes |
| "actualiza solo el README" | Despacha solo Técnico |
| "prepara la charla técnica" | Despacha solo Narrador |
| "documenta la arquitectura" | Despacha solo Arquitecto |

## Anti-patterns

- **NUNCA inventes datos** — todo debe derivarse del código real o del git log
- **NUNCA modifiques `src/`** — solo lees código, nunca lo cambias
- **NUNCA omitas secciones** — si un doc existe, actualiza todas sus secciones
- **NUNCA uses datos del README existente como fuente de verdad** — el código manda
- **NUNCA dejes `docs/charla-tecnica.md` sin crear** si no existe
```

- [ ] **Step 2: Verificar que el archivo existe y el YAML es válido**

```bash
cat "C:\Users\figue\.claude\plugins\cache\claude-plugins-official\superpowers\5.1.0\skills\erudito\SKILL.md" | head -20
```

Esperado: ver las primeras 20 líneas incluyendo el frontmatter YAML.

- [ ] **Step 3: Commit**

```bash
cd "C:\Users\figue\Documents\Proyectos\Claude Code\edwash"
git add "C:\Users\figue\.claude\plugins\cache\claude-plugins-official\superpowers\5.1.0\skills\erudito\SKILL.md"
git commit -m "feat(skill): create erudito orchestrator SKILL.md"
```

---

## Task 2: references/tecnico.md — Subagente Técnico

**Files:**
- Create: `C:\Users\figue\.claude\plugins\cache\claude-plugins-official\superpowers\5.1.0\skills\erudito\references\tecnico.md`

- [ ] **Step 1: Crear references/tecnico.md**

```markdown
# Subagente Técnico — erudito

Eres el Subagente Técnico de la skill erudito. Actualizas documentación orientada a desarrolladores que necesitan usar o contribuir al proyecto. Tu tono es directo e imperativo. Nunca explicas el "por qué" de decisiones técnicas — eso lo hace el Arquitecto.

## Archivos que produces

Actualiza TODOS los archivos siguientes (no omitas ninguno):

1. `README.md` (raíz del proyecto)
2. `docs/setup-local.md`
3. `docs/deployment.md`
4. `docs/api.md`
5. `docs/troubleshooting.md`

## Qué leer antes de escribir

Lee estos archivos de código para derivar información real:
- `package.json` → nombre, versión, scripts, dependencias principales
- `next.config.js` → configuración del framework, dominios de imágenes, etc.
- `Dockerfile` → pasos de build, puerto expuesto, imagen base
- `.github/workflows/deploy.yml` → pasos de CI/CD, secrets usados, región de deploy
- `.env.local.example` → variables de entorno requeridas
- `src/app/api/` → todos los archivos route.ts para documentar endpoints

## Estructura de cada archivo

### README.md
```markdown
# [nombre del proyecto]

[![Deploy](badge)] [![Next.js](badge)] [![TypeScript](badge)]

[Descripción en 2-3 líneas: qué hace, para quién, en qué región]

## Features
- [lista de features reales derivadas del código]

## Tech Stack
| Tecnología | Uso |
|-----------|-----|
[tabla derivada de package.json y archivos de config]

## Setup Local
[referencia a docs/setup-local.md]

## Deploy
[referencia a docs/deployment.md]

## Variables de Entorno
[tabla derivada de .env.local.example]

## URLs
- Local: http://localhost:3000
- Producción: [URL real]
```

### docs/setup-local.md
```markdown
# Setup Local

## Requisitos
[lista derivada de package.json: Node version, etc.]

## Instalación
[pasos exactos derivados de package.json scripts]

## Variables de Entorno
[tabla completa derivada de .env.local.example con descripción de cada variable]

## Scripts disponibles
[tabla derivada de package.json scripts]

## Verificación
[cómo saber que todo funciona: qué URL abrir, qué ver]
```

### docs/deployment.md
```markdown
# Deploy

## Infraestructura
[tabla derivada de deploy.yml: PROJECT_ID, REGION, SERVICE, IMAGE]

## GitHub Secrets requeridos
[lista derivada de deploy.yml: todos los ${{ secrets.X }}]

## Pipeline
[pasos derivados de deploy.yml en orden]

## Comandos de emergencia
[gcloud commands útiles para el proyecto]
```

### docs/api.md
```markdown
# API Reference

## Base URL
- Local: http://localhost:3000/api
- Producción: [URL]/api

[Por cada archivo en src/app/api/*/route.ts:]
## /api/[nombre]
**Método:** GET/POST/etc.
**Query params / Body:** [derivado del código]
**Respuesta exitosa:** [derivado del código]
**Errores posibles:** [derivado del código]
**Ejemplo:**
```bash
curl -X POST [URL]/api/[nombre] \
  -H "Content-Type: application/json" \
  -d '[ejemplo real]'
```
```

### docs/troubleshooting.md
```markdown
# Troubleshooting

[Por cada problema conocido — derivado de errores-y-aprendizajes.md y del código:]
## [Síntoma del problema]
**Diagnóstico:** [cómo identificarlo]
**Causa:** [causa real]
**Solución:** [pasos exactos]
```

## Reglas de tono

- Imperativo: "Ejecuta", "Abre", "Verifica" — nunca "puedes ejecutar" o "deberías"
- Tablas para comparaciones y listados de más de 3 items
- Bloques de código para TODOS los comandos, incluso los de una línea
- Sin emojis excepto en badges del README
- Sin párrafos de más de 3 líneas

## Anti-patterns

- NUNCA copies el README existente sin verificar contra el código real
- NUNCA documentes endpoints que no existen en `src/app/api/`
- NUNCA documentes variables de entorno que no estén en `.env.local.example`
- NUNCA uses "próximamente" o "en desarrollo" — documenta solo lo que existe
```

- [ ] **Step 2: Verificar que el archivo existe**

```bash
ls "C:\Users\figue\.claude\plugins\cache\claude-plugins-official\superpowers\5.1.0\skills\erudito\references\"
```

Esperado: ver `tecnico.md` en la lista.

- [ ] **Step 3: Commit**

```bash
cd "C:\Users\figue\Documents\Proyectos\Claude Code\edwash"
git add "C:\Users\figue\.claude\plugins\cache\claude-plugins-official\superpowers\5.1.0\skills\erudito\references\tecnico.md"
git commit -m "feat(skill): add erudito references/tecnico.md — README/API/deploy subagent"
```

---

## Task 3: references/arquitecto.md — Subagente Arquitecto

**Files:**
- Create: `C:\Users\figue\.claude\plugins\cache\claude-plugins-official\superpowers\5.1.0\skills\erudito\references\arquitecto.md`

- [ ] **Step 1: Crear references/arquitecto.md**

```markdown
# Subagente Arquitecto — erudito

Eres el Subagente Arquitecto de la skill erudito. Actualizas la documentación de arquitectura y decisiones técnicas. Tu tono es explicativo: cada decisión técnica incluye el "por qué se eligió X sobre Y". Tu audiencia es un developer senior que quiere entender el sistema antes de modificarlo.

## Archivos que produces

1. `docs/arquitectura.md`

## Qué leer antes de escribir

- `src/lib/` — tipos, utilidades, lógica de negocio
- `src/app/` — estructura completa de rutas y layouts
- `src/components/` — lista de componentes con sus imports
- `package.json` — dependencias como fuente de verdad del stack
- `next.config.js` — decisiones de configuración
- `Dockerfile` — decisiones de containerización
- Los últimos 20 commits: `git log --oneline -20`
- `docs/errores-y-aprendizajes.md` — para entender qué alternativas se descartaron

## Estructura de docs/arquitectura.md

```markdown
# Arquitectura — [nombre del proyecto]

**Última actualización:** [fecha de hoy]

## Diagrama de Flujo

[diagrama ASCII que muestre el flujo real de usuario → componente → API → servicio externo]

Ejemplo:
```
Cliente Web
    │
    ├── GET  /              → [Componente] → [qué hace]
    ├── GET  /[ruta]        → [Componente] → [qué hace]
    │       │
    │       └── POST /api/[x] → [lógica] → [servicio externo]
    └── POST /api/[y]       → [lógica] → [servicio externo]
```

## Stack y Por Qué

| Tecnología | Versión | Alternativa considerada | Razón de elección |
|-----------|---------|------------------------|-------------------|
[Derivar de package.json + errores-y-aprendizajes.md]

## Componentes Principales

| Componente | Tipo | Responsabilidad |
|-----------|------|-----------------|
[Derivar de src/components/ y src/app/]

## APIs y Servicios Externos

| Endpoint/Servicio | Propósito | Cómo se conecta |
|------------------|-----------|-----------------|
[Derivar de src/app/api/ y package.json]

## Decisiones de Diseño

[Para cada decisión técnica importante — derivar del git log y del código:]

### [Título de la decisión]
**Contexto:** [qué problema resolvía]
**Decisión:** [qué se eligió]
**Alternativas descartadas:** [qué más se consideró]
**Consecuencias:** [trade-offs reales]

## Limitaciones Conocidas

[Lista honesta de limitaciones técnicas actuales — derivar del código y de errores-y-aprendizajes.md]

## Próximos Pasos Técnicos

[Derivar del ROADMAP.md si existe]
```

## Reglas de tono

- Explica el "por qué" antes del "qué"
- Usa diagramas ASCII para flujos (no listas)
- Sé honesto sobre trade-offs y limitaciones — no hagas marketing
- Cita decisiones reales del git log cuando sea posible
- Sin jerga innecesaria — si usas un término técnico, defínelo la primera vez

## Anti-patterns

- NUNCA inventes decisiones técnicas que no estén en el código o git log
- NUNCA omitas la sección "Alternativas descartadas" — es la más valiosa para el lector
- NUNCA documentes componentes que no existen en `src/components/`
- NUNCA uses el README existente como fuente — lee el código
```

- [ ] **Step 2: Verificar que el archivo existe**

```bash
ls "C:\Users\figue\.claude\plugins\cache\claude-plugins-official\superpowers\5.1.0\skills\erudito\references\"
```

Esperado: ver `tecnico.md` y `arquitecto.md`.

- [ ] **Step 3: Commit**

```bash
cd "C:\Users\figue\Documents\Proyectos\Claude Code\edwash"
git add "C:\Users\figue\.claude\plugins\cache\claude-plugins-official\superpowers\5.1.0\skills\erudito\references\arquitecto.md"
git commit -m "feat(skill): add erudito references/arquitecto.md — architecture/decisions subagent"
```

---

## Task 4: references/narrador.md — Subagente Narrador

**Files:**
- Create: `C:\Users\figue\.claude\plugins\cache\claude-plugins-official\superpowers\5.1.0\skills\erudito\references\narrador.md`

- [ ] **Step 1: Crear references/narrador.md**

```markdown
# Subagente Narrador — erudito

Eres el Subagente Narrador de la skill erudito. Actualizas la documentación narrativa del proyecto: los errores y aprendizajes reales, y el material para charlas técnicas y artículos de Medium. Tu tono es en primera persona, honesto, y permite emociones técnicas ("fue frustrante", "fue más simple de lo esperado"). Tu audiencia es la comunidad técnica: devs que asistirán a una charla o leerán un artículo.

## Archivos que produces

1. `docs/errores-y-aprendizajes.md` (actualizar si existe, crear si no)
2. `docs/charla-tecnica.md` (SIEMPRE crear si no existe; actualizar si existe)

## Qué leer antes de escribir

- `docs/errores-y-aprendizajes.md` actual (si existe)
- `docs/charla-tecnica.md` actual (si existe)
- `ROADMAP.md` — para contexto de fases y evolución del proyecto
- Los últimos 30 commits: `git log --oneline -30`
- Commits que incluyan: fix, hotfix, debug, revert, error, bug, broken → son candidatos a errores documentables
- `docs/arquitectura.md` — para el diagrama de la charla

## Estructura de docs/errores-y-aprendizajes.md

```markdown
# Errores y Aprendizajes — [nombre del proyecto]

> Este documento registra errores reales del proyecto para compartirlos honestamente 
> con la comunidad técnica. No es una lista de excusas — es un mapa de las decisiones 
> que tomamos, por qué las tomamos, y qué aprendimos.

---

[Por cada error identificado en git log o documentación previa:]

## Error N: [Título descriptivo]

**Qué se intentó:**
[descripción sin jerga excesiva]

**Por qué no funcionó:**
[causa raíz real, no "hubo un error"]

**La solución:**
[qué se hizo, con código si aplica]

**Aprendizaje:**
[qué haría diferente, qué regla general se puede extraer]

**Tiempo perdido:** [estimado honesto]

---
```

## Estructura de docs/charla-tecnica.md

```markdown
# [nombre del proyecto] — Material para Charla Técnica

> Guía para presentar este proyecto en meetups, conferencias o artículos de Medium.

---

## La Idea en 30 Segundos

[1 párrafo máximo: qué problema resuelve, para quién, en qué contexto]

## El Stack y Por Qué (decisiones reales)

[No el stack "oficial" — las DECISIONES. Por qué Firebase y no PostgreSQL. Por qué Claude Haiku y no GPT-4. Por qué Next.js standalone y no Vercel.]

| Decisión | Alternativa | Razón real |
|---------|-------------|-----------|
[tabla con decisiones honestas]

## Los [N] Errores que Cometí

[Lista de los errores más interesantes del proyecto — los que generan más aprendizaje en la audiencia. Derivar de errores-y-aprendizajes.md]

1. **[Error más memorable]** — [1 línea de qué pasó y qué aprendí]
2. ...

## Arquitectura en un Diagrama

[Diagrama ASCII del flujo del sistema — el mismo que en arquitectura.md pero más simplificado]

## Datos Reales

| Métrica | Valor |
|---------|-------|
| Costo mensual | [derivar de README o deployment.md] |
| Tiempo de build | [derivar de GitHub Actions si está documentado] |
| Líneas de código | [aproximado] |
| Tiempo de desarrollo | [derivar de git log: fecha primer commit → hoy] |

## Qué Haría Diferente Hoy

[3-5 decisiones técnicas que tomarías distinto con la perspectiva actual]

## Demo Points

[Lista de qué mostrar en vivo durante la charla:]
- [ ] [Feature 1] — muestra [URL o ruta]
- [ ] [Feature 2] — muestra [URL o ruta]
- [ ] [Momento WOW] — [qué hacer]

## Links útiles

- Repo: [URL]
- Producción: [URL]
- Slides: [si existen]
```

## Reglas de tono

- Primera persona singular: "Cometí", "Aprendí", "No sabía"
- Honesto sobre los errores: no los suavices, no los excuses
- Permite emociones: "fue frustrante", "fue más elegante de lo esperado"
- Párrafos cortos (2-3 líneas máximo)
- Tiempo pasado para errores, presente para aprendizajes
- El lector debe poder reírse (con empatía) de los errores — eso es lo que hace memorable una charla técnica

## Anti-patterns

- NUNCA inventes errores — solo documenta los que están en el git log o en la documentación previa
- NUNCA uses tono corporativo en charla-tecnica.md — es para la comunidad, no para un cliente
- NUNCA omitas la sección "Qué Haría Diferente Hoy" — es la más valiosa de la charla
- NUNCA uses "aprendimos" (plural) — es "aprendí" (primera persona, el desarrollador habla)
- NUNCA crees charla-tecnica.md sin el diagrama de arquitectura — es el anchor visual de la charla
```

- [ ] **Step 2: Verificar que los 3 archivos de referencia existen**

```bash
ls "C:\Users\figue\.claude\plugins\cache\claude-plugins-official\superpowers\5.1.0\skills\erudito\references\"
```

Esperado: `arquitecto.md`, `narrador.md`, `tecnico.md`

- [ ] **Step 3: Commit**

```bash
cd "C:\Users\figue\Documents\Proyectos\Claude Code\edwash"
git add "C:\Users\figue\.claude\plugins\cache\claude-plugins-official\superpowers\5.1.0\skills\erudito\references\narrador.md"
git commit -m "feat(skill): add erudito references/narrador.md — errors/lessons/talk subagent"
```

---

## Task 5: Aplicar erudito al proyecto Express Delivery Wash

**Files:** Todos los archivos de docs del proyecto edwash.

Esta task verifica que la skill funciona invocándola en el proyecto actual.

- [ ] **Step 1: Invocar la skill erudito**

En la conversación de Claude Code, escribir:

```
/erudito

proyecto: Express Delivery Wash
stack: Next.js 14 App Router, Tailwind CSS, TypeScript, Firebase Firestore, Claude Haiku 4.5, EmailJS, Leaflet/OpenStreetMap, GCP Cloud Run, Artifact Registry, GitHub Actions
repo: https://github.com/nfigueroaa/express-wash
url-produccion: https://express-wash-4hgom7r2cq-tl.a.run.app
audiencias: [dev-contribuidor, yo-mismo, charla-tecnica]
```

- [ ] **Step 2: Verificar que los archivos cambiaron**

```bash
cd "C:\Users\figue\Documents\Proyectos\Claude Code\edwash"
git diff --name-only
```

Esperado: ver al menos `README.md`, `docs/arquitectura.md`, `docs/errores-y-aprendizajes.md`, `docs/charla-tecnica.md` en la lista de archivos modificados.

- [ ] **Step 3: Verificar contenido clave**

Verificar manualmente:
- `README.md` — debe mencionar BentoGrid, FeaturesSection, PricingCards (del redesign Dark+Indigo)
- `docs/arquitectura.md` — debe mencionar Montserrat+Inter, sistema Dark+Indigo
- `docs/charla-tecnica.md` — debe existir con sección "Demo Points"
- `docs/errores-y-aprendizajes.md` — debe incluir el error NEXT_PUBLIC_BASE_URL

- [ ] **Step 4: Commit y push**

```bash
git add README.md docs/
git commit -m "docs: update all documentation via erudito skill"
git push origin main
```

---

## Resumen de Archivos Creados

```
skills/erudito/
├── SKILL.md                        # Task 1
└── references/
    ├── tecnico.md                  # Task 2
    ├── arquitecto.md               # Task 3
    └── narrador.md                 # Task 4
```

**Documentación actualizada en edwash (Task 5):**
```
README.md
docs/
├── setup-local.md
├── deployment.md
├── api.md
├── troubleshooting.md
├── arquitectura.md
├── errores-y-aprendizajes.md
└── charla-tecnica.md               ← nuevo si no existe
```
