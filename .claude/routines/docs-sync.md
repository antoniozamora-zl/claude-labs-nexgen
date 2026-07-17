# Rutina: docs-sync (Generador)

## Trigger

Semanal, lunes a las 9:00 AM.

Prompt para `/schedule`:
```
Cada lunes a las 9am, revisa los commits mergeados a main en la ultima semana.
Compara los cambios en src/components/ y src/pages/ contra docs/spec/.
Si hay componentes modificados sin actualizacion correspondiente en docs,
abre un PR con la documentacion actualizada.
Notifica en el canal de Slack #engineering con el link al PR.
```

## Contexto

- Repo: claude-labs-nexgen (GitHub)
- Conectores: GitHub MCP (commits, PRs), Slack (notificacion)
- Archivos clave: src/components/*.jsx, src/pages/*.jsx, docs/spec/*.md

## Comportamiento

1. `git log --since="1 week ago" --name-only main` para listar archivos cambiados.
2. Filtrar solo cambios en `src/components/` y `src/pages/`.
3. Para cada componente cambiado, verificar si `docs/spec/` tiene documentacion actualizada.
4. Si falta actualizacion:
   a. Leer el componente actual.
   b. Generar/actualizar la doc en `docs/spec/<componente>.md`.
   c. Crear branch `docs/sync-<fecha>`.
   d. Abrir PR con titulo "docs: sync <componente> spec with code changes".
5. Notificar en Slack con link al PR.

## Tres decisiones de diseno

1. **Trigger: horario semanal (lunes 9am)**
   - Por que no evento: los docs no necesitan actualizarse en cada commit. Batch semanal reduce ruido y agrupa cambios relacionados en un solo PR.
   - Trade-off: si un cambio critico se mergea el lunes por la tarde, la doc tarda una semana. Aceptable para docs internos.

2. **Contexto: GitHub MCP + Slack**
   - GitHub MCP para leer commits, crear branches y PRs sin tokens manuales.
   - Slack para notificacion (no para trigger — el trigger es temporal).
   - No incluimos Jira/Linear: la sincronizacion de docs no requiere tickets.

3. **Dirigibilidad: prompt editable + skip list**
   - El agente acepta steering mid-session: "ignora MetricsFilters, ya lo documente manualmente".
   - Mantiene una skip list en `.claude/routines/docs-sync-skip.json` que persiste entre ejecuciones.
