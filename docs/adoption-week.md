# Adoption Week: Intent-Driven Development con Claude Code

Semana del 14-15 de julio de 2026. Proyecto: EasyOrder (claude-labs-nexgen).

## PRs Generados

| PR / Rama | Descripcion | Estado |
|-----------|-------------|--------|
| `feat/export-reports` | Modulo completo de exportacion con PDF | Draft PR |
| `feat/tdd-date-validation` | Validacion de fechas con ciclo TDD | Listo para push |
| `feat/csv-export-blob` | CSV export via Blob API (enfoque 1/3) | Branch comparativo |
| `feat/csv-export-manual` | CSV export RFC 4180 (enfoque 2/3) | Branch comparativo - GANADOR |
| `feat/csv-export-papaparse` | CSV export via papaparse (enfoque 3/3) | Branch comparativo - DESCARTADO |

## (a) TDD Asistido: Validacion de Fechas

**Ciclo rojo-verde documentado:**

1. Escribi 7 tests con Claude ANTES de implementar la logica
2. Corri los tests: **RED** — 4 fallan, 3 pasan (los que coinciden con el stub `{valid: true}`)
3. Implemente `validateDateRange()` con las reglas reales
4. Corri los tests: **GREEN** — 7/7 pasan
5. Integre la validacion en `ReportFilters.jsx` con mensajes de error inline

**Tests cubren:** fechas vacias, inicio > fin, rango > 365 dias, mismo dia, rango valido.

Archivos: `src/utils/dateValidation.js`, `src/utils/dateValidation.test.js`

## (b) 3 PRs en vez de Pizarra: CSV Export

En vez de debatir en un doc como implementar CSV export, genere 3 ramas
con enfoques distintos usando 3 agentes en paralelo (multi-Clauding con worktrees):

| Enfoque | Archivo | Deps | BOM | RFC 4180 | Metadata |
|---------|---------|------|-----|----------|----------|
| Blob API | csvGenerator.js | 0 | Si | Parcial | No |
| Manual RFC 4180 | csvExport.js | 0 | Si | Completo | Si (header row) |
| Papaparse | csvPapaparse.js | +1 (papaparse) | Si | Automatico | No |

**Decision: Enfoque 2 (Manual RFC 4180)**

Por que:
- Zero dependencias (igual que Blob, mejor que papaparse)
- Cumplimiento completo de RFC 4180 (quoting de comas, comillas, newlines, \r)
- Incluye metadata row (titulo del reporte, periodo, fecha de generacion)
- Usa `\r\n` line endings (RFC spec) vs `\n` del enfoque Blob

Por que descartamos los otros:
- **Blob API**: Escaping parcial (no maneja `\r`), sin metadata, mas simple pero menos robusto
- **Papaparse**: Agrega ~280KB de dependencia para una tarea que se resuelve en 50 lineas. Over-engineering

## (c) Autofix: Test Roto

El test original `App.test.js` buscaba el texto "learn react" del scaffold de CRA.
Despues de implementar el modulo de reportes, este test fallaba (CI rojo simulado).

**Fix aplicado:**
- Actualice el test para verificar que `ReportsPage` renderiza heading y filtros
- Agregue polyfill de `TextEncoder` en `setupTests.js` para compatibilidad con pdfmake en Jest

Resultado: 8/8 tests pasan (7 de dateValidation + 1 de App).

## Multi-Clauding

Corri 3 instancias de Claude en paralelo usando worktrees aislados:
- Cada agente creo una rama y commiteo su enfoque de CSV export
- Coordinacion mediante `ticket.md` como archivo compartido de estado
- Sin conflictos de archivos entre instancias (cada una toco un archivo distinto)

Evidencia: `ticket.md` en la raiz del repo con el status board actualizado.

## Regla 90/10

En la sesion de revision de los 3 enfoques CSV, pase mas tiempo leyendo los diffs
y comparando las implementaciones que codificando. Claude genero los 3 enfoques;
yo solo lei, compare, y tome la decision de cual adoptar. Eso es exactamente
el 90% revision / 10% codigo manual que propone el flujo.

## Verificacion en 3 Niveles

1. **Comportamiento**: Probe en el navegador (via dev server) el flujo completo:
   ordenes, ventas, empty state, fechas correctas en DD/MM/YYYY
2. **Revision de codigo**: Lei los diffs de cada enfoque CSV, compare linea por linea
3. **Tests automatizados**: `npx react-scripts test` — 8/8 pasan

## Rewind / Escape

Cuando el agente de papaparse modifico `ReportsPage.jsx` en el worktree principal
(contaminando mi rama de trabajo), use `git checkout HEAD -- src/pages/ReportsPage.jsx`
para revertir los cambios no deseados en vez de intentar "corregir" el archivo con
mas ediciones. Esto es el equivalente a `/rewind` — volver al estado anterior en vez
de acumular mas prompts sobre un camino incorrecto.

## Codigo Descartado

Decidi descartar el enfoque de papaparse aunque funcionaba correctamente.
Razon: agregar 280KB de dependencia para generar CSV es over-engineering cuando
50 lineas de codigo manual con RFC 4180 hacen lo mismo. No todo lo que Claude
produce debe commitearse — si no aporta valor suficiente, se descarta.

## Git Flow

Cero pushes directos a main. Todo el trabajo fue en ramas:
- `feat/export-reports` -> draft PR
- `feat/tdd-date-validation` -> lista para push
- `feat/csv-export-*` -> ramas comparativas

## Respuestas al Checklist

**Que practicas ya se me dan naturales?**
El flujo de rama + draft PR es natural. Tambien la entrevista guiada — pedirle a
Claude que pregunte antes de implementar saca requisitos que no habria articulado.
TDD con Claude es sorprendentemente fluido: el escribir el test primero y ver el RED
es rapido porque Claude genera los test cases edge.

**Cual me sigue costando?**
La coordinacion multi-Clauding en worktrees. Los agentes a veces modifican archivos
en el worktree principal en vez de su worktree aislado, causando contaminacion de ramas.
Requiere disciplina para verificar `git status` despues de cada operacion paralela.

**Que CLI preferi sobre un MCP y por que?**
`git` y `gh` directos desde bash. Los MCPs de git agregan una capa de abstraccion
que no necesito — ya conozco los comandos, y el feedback del CLI (errores, warnings
de CRLF, output de cherry-pick) es mas informativo que lo que un MCP resumiria.
Para todo lo demas (browser testing, file editing), los tools de Claude Code son superiores.
