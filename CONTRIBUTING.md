# 🤝 Contributing Guide

¿Quieres contribuir a Express Delivery Wash? ¡Excelente! Aquí está cómo.

---

## 📋 Requisitos Previos

- Leer [README.md](README.md) para entender el proyecto
- Revisar [ROADMAP.md](ROADMAP.md) para ver mejoras planificadas
- Tener Node.js 20+ instalado
- Fork del repositorio en tu cuenta de GitHub

---

## 🚀 Flujo de Contribución

### 1. Fork del Repositorio

```bash
# En GitHub, haz click en "Fork" arriba a la derecha
# O vía CLI:
gh repo fork nfigueroaa/express-wash --clone
cd express-wash
```

### 2. Crea una Rama

```bash
# Actualiza main antes de crear rama
git pull origin main

# Crea rama con nombre descriptivo
git checkout -b feature/mi-feature
# o para bug fix:
git checkout -b fix/bug-descripcion
# o para docs:
git checkout -b docs/actualizar-readme
```

**Convención de nombres:**
- `feature/` — nueva funcionalidad
- `fix/` — corrección de bug
- `docs/` — cambios de documentación
- `refactor/` — mejora de código sin cambios funcionales
- `perf/` — mejoras de performance

### 3. Crea o Modifica Código

Asegúrate de:

- ✅ Seguir los estándares de código del proyecto
- ✅ Agregar comments si el código es complejo
- ✅ Actualizar tipos TypeScript
- ✅ Tomar en cuenta testing si aplica

### 4. Commits

```bash
# Staging de cambios
git add src/components/MiComponente.tsx

# Commit con mensaje claro
git commit -m "feat: agregar nuevo componente MiComponente"
```

**Formato de mensajes:**
```
<tipo>(<scope>): <descripción>

<cuerpo opcional>

Closes #123
```

**Tipos:**
- `feat` — nueva funcionalidad
- `fix` — corrección de bug
- `docs` — cambios de documentación
- `refactor` — mejora de código
- `perf` — mejora de performance
- `test` — cambios de tests
- `chore` — cambios en build, deps, etc.

**Ejemplos:**
```
feat(chatbot): agregar soporte para escalación de reclamos
fix(order): validar que subtotal > 0 antes de crear pedido
docs(api): actualizar endpoint /api/order
refactor(firestore): mejorar helper de lectura de pedidos
```

### 5. Push a tu Fork

```bash
git push origin feature/mi-feature
```

### 6. Abre Pull Request

En GitHub:
1. Ve a tu fork → "Pull requests" → "New pull request"
2. Selecciona `nfigueroaa/express-wash` (upstream) ← `tu-usuario/express-wash`
3. Rellena el template (ver más abajo)
4. Click "Create pull request"

---

## 📝 Template de Pull Request

```markdown
## 📝 Descripción

Descripción breve de qué cambia y por qué.

Cierra #123

## 🎯 Tipo de Cambio

- [ ] Nueva funcionalidad (feature)
- [ ] Corrección de bug (fix)
- [ ] Cambio de documentación
- [ ] Cambio que no afecta código/tests (refactoring, etc.)
- [ ] Cambio de performance

## ✅ Checklist

- [ ] Mi código sigue el estilo del proyecto
- [ ] He hecho self-review de mis cambios
- [ ] He comentado el código complejo
- [ ] He actualizado la documentación correspondiente
- [ ] Mis cambios no generan nuevos warnings
- [ ] He testeado mis cambios localmente
- [ ] Los cambios nuevos tienen tests correspondientes (si aplica)

## 🧪 Testing

Describe los tests que hiciste:
- [ ] Feature se ve bien en desktop
- [ ] Feature se ve bien en mobile
- [ ] No hay console errors
- [ ] Datos se guardan en Firestore

## 📸 Screenshots (si aplica)

Si es un cambio visual, agrega screenshots.
```

---

## 📋 Estándares de Código

### TypeScript

- ✅ **Strict mode activado** (`strict: true` en tsconfig.json)
- ✅ **Tipos explícitos** para funciones:
  ```typescript
  function crearPedido(datos: Omit<Pedido, 'id'>): Promise<string> {
    // ...
  }
  ```
- ❌ **NO usar `any`** a menos que sea inevitable
- ✅ **Comentarios para tipos complejos:**
  ```typescript
  /** Calcula la distancia en km entre dos puntos usando Haversine */
  function calcularDistancia(lat1: number, lon1: number, ...): number {
    // ...
  }
  ```

### React Components

- ✅ **Nombrar con PascalCase:**
  ```tsx
  export function MiComponente() { }
  ```
- ✅ **'use client' si usas hooks:**
  ```tsx
  'use client';
  import { useState } from 'react';
  ```
- ✅ **Props typed:**
  ```tsx
  interface MiComponenteProps {
    titulo: string;
    onSubmit?: (data: unknown) => void;
  }
  
  export function MiComponente({ titulo, onSubmit }: MiComponenteProps) {
    // ...
  }
  ```
- ❌ **NO renderizar lógica compleja** — extraer a funciones:
  ```tsx
  // ❌ Evitar:
  {items.map((item) => (
    <div>
      {item.nombre} - {item.precio * item.cantidad}
    </div>
  ))}
  
  // ✅ Mejor:
  function ItemRow({ item }: { item: ItemPedido }) {
    return <div>{item.nombre} - {formatCLP(item.total)}</div>;
  }
  ```

### Tailwind CSS

- ✅ **Usar clases Tailwind** para estilos
- ✅ **Extraer componentes repetitivos** a shadcn/ui
- ❌ **NO agregar CSS custom** si existe clase Tailwind
- ✅ **Usar variables CSS** para colores de marca:
  ```tsx
  <div className="bg-[#E91E63]">  // Magenta Express
  ```

### API Routes

- ✅ **Validar input:**
  ```typescript
  if (!body.nombre?.trim()) {
    return NextResponse.json({ error: '...' }, { status: 400 });
  }
  ```
- ✅ **Logging de errores:**
  ```typescript
  console.error('[order] Error:', error);
  ```
- ❌ **NO exponer info sensible** en respuestas de error
- ✅ **Documentar parámetros** en comentarios

---

## 🧪 Testing

### Tests Unitarios (Próximamente P0.1)

```bash
npm run test
```

Cuando esté implementado, escribe tests para:
- Funciones de utilidad (Haversine, formatCLP, etc.)
- Lógica de API routes
- Cálculos de precios

### Testing Manual

Para cambios UI/UX:
1. Abre http://localhost:3000
2. Prueba en desktop (1920x1080)
3. Prueba en mobile (DevTools → iPhone 12)
4. Verifica console (F12) → no hay errores
5. Verifica Firestore si hay cambios de datos

### Testing en Staging

Antes de mergear a `main`:
1. Abre branch en Cloud Run (opcional, manual por ahora)
2. Prueba en producción simulada
3. Verifica logs no muestran errores

---

## 📚 Documentación

Si tu cambio afecta:

| Cambio | Actualizar |
|--------|-----------|
| Nueva API route | `docs/api.md` |
| Nuevo component | `README.md` → Funcionalidades |
| Nueva config var | `docs/setup-local.md` |
| Breaking change | `CHANGELOG.md` |
| Setup change | `docs/setup-local.md` |

**Actualizar documentación es parte de la PR.**

---

## 🔍 Code Review

Tu PR será revisada por:

- ✅ **Funcionamiento** — ¿funciona el cambio?
- ✅ **Estándares** — ¿sigue los estándares del proyecto?
- ✅ **Tests** — ¿está testeado?
- ✅ **Documentación** — ¿está documentado?
- ✅ **Performance** — ¿no degrada performance?
- ✅ **Seguridad** — ¿es seguro?

Si hay comentarios:
1. Haz los cambios solicitados
2. Commit y push nuevamente
3. Responde a los comentarios

---

## ✅ Checklist Antes de Mergear

- [ ] Tests pasan: `npm run test`
- [ ] Build sin errores: `npm run build`
- [ ] Linting pasa: `npm run lint`
- [ ] TypeScript sin errors: `npx tsc --noEmit`
- [ ] PR description es clara
- [ ] Documentación está actualizada
- [ ] Screenshots si es visual
- [ ] Commits tienen mensajes claros
- [ ] Rama está actualizada con main: `git pull origin main`

---

## 🚀 Deploy Automático

Cuando tu PR se mergea a `main`:

1. GitHub Actions construye la aplicación
2. Docker image se pushea a Artifact Registry
3. Cloud Run se actualiza automáticamente
4. Tu cambio está en producción en ~5 minutos

**Monitorear:**
```bash
gcloud run logs read express-wash --follow
```

---

## 🐛 Reportar Bugs

Si encuentras un bug:

1. ¿Existe ya un issue? Revisa [Issues](https://github.com/nfigueroaa/express-wash/issues)
2. Si no existe, abre uno nuevo con:
   - Descripción clara del problema
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Logs/screenshots si aplica
   - Tu navegador/SO

---

## 💡 Sugerencias de Feature

¿Una idea para mejorar el proyecto?

1. Abre un [GitHub Discussion](https://github.com/nfigueroaa/express-wash/discussions)
2. O revisa [ROADMAP.md](ROADMAP.md) — quizás ya está planeado

---

## 📞 Dudas?

- 📧 Email: [email del proyecto]
- 💬 Discusiones: https://github.com/nfigueroaa/express-wash/discussions
- 🐛 Issues: https://github.com/nfigueroaa/express-wash/issues

---

## 🎓 Recursos Útiles

- [Documentación Oficial Next.js](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Anthropic API](https://docs.anthropic.com/)

---

## 🙏 Gracias por Contribuir!

Tu trabajo ayuda a mejorar Express Delivery Wash. ¡Apreciamos tu esfuerzo! 🎉

**¡Happy coding!** 🚀

---

## 📄 Acerca del Proyecto

**Desarrollada por:** Nelson Figueroa Albarrán — 2026  
**Asistencia IA:** Claude Code (Anthropic)

---

**Última actualización:** 2026-05-12
