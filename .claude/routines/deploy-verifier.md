# Rutina: deploy-verifier (Critico)

## Trigger

Event-based: se dispara cuando docs-sync abre un PR, o manualmente con `/loop`.

Prompt para `/schedule` (event-based):
```
Cuando se abra un PR en este repo con prefijo "docs:" en el titulo,
revisa que la documentacion generada sea correcta:
1. Verifica que los data-* attributes del DOM contract estan documentados.
2. Corre la skill verify-dashboard para confirmar que la app sigue funcionando.
3. Compara el spec de docs/ con el componente real en src/.
4. Deja comentarios de revision en el PR con lo que encuentres.
5. Si todo esta bien, aprueba el PR con "LGTM - verified by deploy-verifier".
```

## Contexto

- Repo: claude-labs-nexgen (GitHub)
- Conectores: GitHub MCP (PR reviews, comments), Browser (verificacion visual)
- Skill: verify-dashboard (bucle de verificacion con DOM contract)

## Comportamiento

1. Recibir evento de PR creado (payload incluye PR number, branch, files changed).
2. Checkout la branch del PR.
3. Ejecutar skill `verify-dashboard`:
   a. Levantar dev server.
   b. Navegar al dashboard.
   c. Verificar DOM contract.
   d. Screenshot como evidencia.
4. Comparar docs generados vs componentes reales:
   a. Leer el spec en `docs/spec/<componente>.md`.
   b. Leer el componente en `src/components/<componente>.jsx`.
   c. Verificar que props, data-* attributes y comportamiento coinciden.
5. Dejar review comments en el PR:
   - Si hay discrepancias: "REQUEST_CHANGES" con detalles.
   - Si todo correcto: "APPROVE" con evidencia (screenshot + invariant check).

## Patron generador-critico

```
docs-sync (generador)          deploy-verifier (critico)
  |                               |
  | abre PR "docs: sync ..."      |
  |------------------------------>|
  |                               | checkout branch
  |                               | run verify-dashboard skill
  |                               | compare spec vs code
  |                               | leave review comments
  |                               |
  |  <-- APPROVE / REQUEST_CHANGES|
  |                               |
  [humano revisa DESPUES del critico]
```

## Tres decisiones de diseno

1. **Trigger: evento (PR creado con prefijo "docs:")**
   - Nativo de GitHub: `pull_request.opened` con filtro en titulo.
   - El payload del evento incluye PR number, branch y files — el agente NO necesita buscarlo, lo recibe como contexto de sesion.
   - Trade-off: si alguien abre un PR "docs:" manualmente, tambien se dispara. Aceptable.

2. **Contexto: GitHub MCP + Browser + skill**
   - Browser (Claude in Chrome o preview) para verificacion visual real.
   - Skill `verify-dashboard` para el bucle de verificacion estructurado.
   - GitHub MCP para dejar review comments programaticamente.

3. **Dirigibilidad: steering mid-session**
   - El humano puede abrir la sesion en Claude Code web y decir: "deten, ya hay un review manual en ese PR".
   - O redirigir: "no dejes review, solo genera un resumen en Slack".
   - La sesion acepta interrupciones via `/remote-control`.

## Progresion de confianza

### Fase 1 (actual): Solo recomienda

El agente deja review comments pero NO aprueba ni mergea automaticamente.
El humano toma la decision final.

**Evidencia para pasar a Fase 2:**
- 10 ejecuciones consecutivas sin falsos positivos (reviews incorrectos).
- 0 PRs aprobados por el critico que luego requirieron changes del humano.
- Log de precision: # reviews correctos / # reviews totales >= 95%.

### Fase 2 (futuro): Aprueba autonomamente

El agente puede aprobar y mergear PRs de docs-sync si:
- Todos los checks de verificacion pasan.
- No hay cambios en archivos fuera de `docs/`.
- El PR fue generado por docs-sync (no manual).

Rollback: si un PR mergeado causa CI failure, la rutina auto-revierte.
