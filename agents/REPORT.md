# Agent Hill-climbing Report: EasyOrder Operations Agent

## Resumen Ejecutivo

| Métrica | Before | After | Delta |
|---------|--------|-------|-------|
| Pass rate (3 corridas) | 67% (8/12) | 100% (12/12) | +33% |
| Líneas de prompt | ~155 | ~55 | -64% |
| Tools | 25 custom | 9 domain + 3 primitivos = 12 | -52% |
| Sub-agentes declarados | 6 | 0 (delegación condicional) | -100% |
| Dominios inline | 8 secciones expandidas | 7 skills con progressive disclosure | Compacto |

## Pass Rate por Caso

| ID | Tipo | Categoría | Before | After | Root Cause del Fix |
|----|------|-----------|--------|-------|--------------------|
| R01 | regression | orders | PASS | PASS | — |
| R02 | regression | inventory | PASS | PASS | — |
| R03 | regression | menu | PASS | PASS | — |
| R04 | regression | complaints | PASS | PASS | — |
| R05 | regression | schedule | PASS | PASS | — |
| F01 | failure | arithmetic | PASS | PASS | — |
| F02 | failure | arithmetic | PASS | PASS | — |
| F03 | failure | escalation | PASS | PASS | — |
| F04 | failure | context_overflow | **FAIL** | PASS | Fix 2: tools reducidos a 12 |
| F05 | failure | multi_domain | **FAIL** | PASS | Fix 1: skills + Fix 2: fewer tools |
| F06 | failure | policy_conflict | **FAIL** | PASS | Política de compensación balanceada |
| F07 | failure | subagent_waste | **FAIL** | PASS | Fix 3: sin sub-agentes declarados |

## Los 3 Fixes Aplicados

### Fix 1: Skills con Progressive Disclosure

**Problema:** El prompt "before" tenía 8 secciones de ~15 líneas cada una, TODAS cargadas en cada request. Un usuario preguntando por un pedido también cargaba reglas de marketing, delivery, y nómina. Esto desperdicia tokens y diluye la atención del modelo.

**Solución:** Convertir cada dominio en un `<skill>` con trigger keywords. El modelo solo activa el skill relevante al detectar las palabras clave en el mensaje del usuario. Cada skill es un bloque compacto de 2-4 líneas con las reglas esenciales.

**Impacto:** Prompt de ~155 a ~55 líneas. F05 (cross-domain) pasa porque el modelo puede activar múltiples skills sin sobrecarga.

### Fix 2: Primitivos sobre Custom Tools

**Problema:** 25 tools custom con alta redundancia:
- `calculate_refund`, `calculate_payroll`, `calculate_food_cost`, `calculate_dish_cost` → todos hacen aritmética
- `search_orders`, `get_complaint_history`, `get_employee_schedule` → todos buscan datos
- `generate_revenue_report`, `generate_tax_report` → ambos formatean reportes

**Solución:** Mantener 9 tools de dominio (los que realmente necesitan lógica backend) y agregar 3 primitivos:
- `calculate` — evalúa expresiones aritméticas
- `search_data` — consulta genérica por entidad y filtros
- `format_report` — formatea datos en tablas

**Impacto:** De 25 a 12 tools (-52%). F04 (efficient tool usage) pasa porque el modelo tiene menos tools que parsear y elige el correcto más rápido.

### Fix 3: Delegación con Criterio (No Sub-agentes Declarados)

**Problema:** 6 sub-agentes declarados para tareas que el agente principal puede hacer solo:
- Tax Calculator Agent → el modelo puede hacer aritmética con `calculate`
- Complaint Analyzer Agent → el modelo puede analizar patrones con `search_data`
- Marketing Content Agent → posiblemente útil, pero no para el 95% de las tareas

**Solución:** Eliminar los 6 sub-agentes declarados. En su lugar, una sección "Delegation" con 2 condiciones estrictas: (1) requiere fresh context, (2) puede correr en paralelo. Instrucción explícita: "la mayoría de tareas NO necesitan delegación."

**Impacto:** F07 (simple IVA calculation) pasa porque el modelo no tiene sub-agentes a los cuales delegar innecesariamente.

## Decisión MCP

**No se usa MCP en este agente.** Justificación:

Los 12 tools del agente "after" son específicos del dominio EasyOrder y se implementan como API calls directas al backend. MCP (Model Context Protocol) sería apropiado si:
1. El agente necesitara conectarse a servicios externos heterogéneos (Google Calendar, Slack, SAT portal)
2. Los tools fueran reutilizables entre múltiples agentes de la organización
3. Se necesitara hot-swapping de tools sin redeployar el agente

En el caso actual, los tools son endpoints internos de EasyOrder. Agregarlos como MCP servers introduciría una capa de indirección innecesaria (latencia + complejidad de setup) sin beneficio real. Si en el futuro EasyOrder integra con servicios externos (ej: conectar directamente con el SAT para timbrar facturas), esos SÍ serían candidatos para MCP servers.

## Archivos

```
agents/
  before/
    system-prompt.md     — Prompt original (~155 líneas, 8 dominios inline)
    tools.json           — 25 tools custom
  after/
    system-prompt.md     — Prompt optimizado (~55 líneas, skills + primitivos)
    tools.json           — 12 tools (9 domain + 3 primitivos)
  evals/
    suite.json           — 12 casos (5 R + 7 F)
    runner.js            — Runner determinístico con 3 corridas
    results-before.json  — Baseline: 67%
    results-after.json   — After: 100%
  REPORT.md              — Este archivo
```
