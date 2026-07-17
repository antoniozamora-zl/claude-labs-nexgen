# Routines Report: Generador + Critico con verificacion

## CLAUDE.md

Creado en la raiz del repo con: arquitectura, comandos, workaround de Tailwind CSS,
DOM contract, convenciones y decisiones clave. Un agente sin contexto previo puede
levantar el proyecto y entender donde vive cada cosa.

## Conectores (3)

| Conector | Uso | Por que |
|----------|-----|---------|
| GitHub MCP | PRs, commits, reviews, comments | Ambas rutinas crean/revisan PRs |
| Claude Browser | Verificacion visual del dashboard | Deploy-verifier corre la skill con navegador |
| Slack (configurar) | Notificaciones de docs-sync | Cierra el loop: el equipo sabe que se abrio un PR |

Regla de Maya aplicada: el agente tiene acceso al repo (GitHub), al navegador (verificacion),
y al canal de comunicacion (Slack). Sin estos tres, el contexto seria insuficiente para
triage autonomo.

## Rutina 1: docs-sync (Generador)

**Trigger:** Semanal, lunes 9am (`/schedule`).
**Prompt:** "Revisa commits mergeados a main en la ultima semana. Compara cambios en
src/components/ y src/pages/ contra docs/spec/. Abre PR con docs actualizados."

### Tres decisiones

1. **Trigger: horario semanal** — batch reduce ruido vs evento por commit. Docs internos
   no necesitan actualizacion inmediata.
2. **Contexto: GitHub MCP + Slack** — git log para detectar cambios, Slack para notificar.
   No incluimos Jira porque la sync de docs no requiere tickets.
3. **Dirigibilidad: skip list persistente** — `.claude/routines/docs-sync-skip.json`
   permite excluir componentes ya documentados manualmente. El agente acepta steering
   mid-session ("ignora MetricsFilters").

## Rutina 2: deploy-verifier (Critico)

**Trigger:** Evento (PR con prefijo "docs:" creado).
**Payload:** PR number, branch, files changed — llegan como contexto de sesion.

### Tres decisiones

1. **Trigger: evento nativo GitHub** — `pull_request.opened` con filtro en titulo.
   El payload incluye todo lo que el agente necesita sin buscar.
2. **Contexto: GitHub MCP + Browser + skill** — Browser para verificacion real con DOM
   contract. La skill `verify-dashboard` estructura el bucle.
3. **Dirigibilidad: steering via /remote-control** — el humano puede interrumpir
   "deten, ya hay un review manual en ese PR".

### Patron generador-critico

docs-sync abre PR -> deploy-verifier revisa automaticamente -> humano revisa DESPUES.
El critico deja review comments ANTES del humano, reduciendo carga de revision.

## Skill automejorable: verify-dashboard

Ubicacion: `.claude/skills/verify-dashboard/SKILL.md`

### Auto-edicion registrada

Durante la ejecucion de la skill, el Browser hizo timeout al tomar screenshot.
Siguiendo el protocolo de auto-mejora de la skill, se agrego el bloqueador:

```
- Screenshot timeout: el Browser pane puede hacer timeout...
  Solucion: navegar de nuevo o usar javascript_tool para DOM inspection.
```

La skill ahora tiene 4 bloqueadores conocidos (3 iniciales + 1 auto-agregado).
Commit history refleja el cambio.

## Bucle de verificacion ejecutado

Receta aplicada:

1. Correr la app: `preview_start` levanto dev server en puerto 52393.
2. Usar la app: `read_page` + `left_click` para cargar metricas.
3. Verificar DOM contract con `javascript_tool`:
   - `data-verify="metrics-dashboard"`: PRESENT
   - `data-metric="total"`: 12
   - `data-metric="approval-rate"`: 50 (entre 0-100)
   - `data-metric="status-breakdown"`: approved=6, pending=3, rejected=3
   - `data-metric="avg-review-time"`: 6.2
   - `data-action="export-csv"`: enabled
   - Suma check: 6+3+3 = 12 = total. MATCH
4. Export CSV: sin errores en consola.
5. Bloqueador encontrado (screenshot timeout) -> skill auto-editada.

## Progresion de confianza (deploy-verifier)

| Fase | Descripcion | Estado |
|------|-------------|--------|
| 1 (actual) | Solo recomienda: deja review comments, humano decide | HOY |
| 2 (futuro) | Aprueba/mergea autonomamente PRs de docs-sync | Requiere 10 ejecuciones sin falsos positivos |

**Evidencia para Fase 2:** 0 falsos positivos en 10 ejecuciones consecutivas, precision >= 95%.

## Plano de control humano

| Superficie | Funcion |
|------------|---------|
| Claude Code desktop | Sesiones fijadas, overview de rutinas activas |
| Claude Code web | Abrir sesion de rutina mid-execution para steering |
| `/loop 10min` local | "Cuida mis PRs abiertos" — monitoreo continuo |
| `/remote-control` | Notificaciones push al movil cuando el agente necesita input |
| `claude agents` terminal | Lista de sesiones ordenadas por atencion requerida |

**Capacidad estimada:** Con este setup, 3-4 sesiones en paralelo sin degradar atencion.
Mas alla de 4, el switching cost humano supera el beneficio de paralelismo.
La clave es que las rutinas son mayormente autonomas — el humano solo interviene
en decisiones de merge y steering excepcional.
