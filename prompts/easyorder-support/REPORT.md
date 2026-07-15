# Reporte de Evals: EasyOrder Support Bot

## Pass Rate por Versión

| Versión | Corrida 1 | Corrida 2 | Corrida 3 | Promedio | Variación |
|---------|-----------|-----------|-----------|----------|-----------|
| V0 (original) | 5/7 (71%) | 5/7 (71%) | 5/7 (71%) | 71% | 0% |
| V1 (higiene + fixes) | 7/7 (100%) | 7/7 (100%) | 7/7 (100%) | 100% | 0% |

**Nota sobre variación:** El simulador determinístico de evals produce resultados consistentes entre corridas.
En producción con un LLM real, se espera una variación de 5-15% entre corridas. La eval debería
correrse 5+ veces y promediar los resultados. Un caso que pasa 3/5 veces NO está pasando — es flaky
y el prompt necesita trabajo en ese caso.

## Pass Rate por Caso

| ID del Caso | Tipo | V0 | V1 | Delta |
|-------------|------|----|----|-------|
| control-01 (agregar platillo) | control | 3/3 | 3/3 | = |
| control-02 (estado de pedido) | control | 3/3 | 3/3 | = |
| edge-arithmetic (reembolso prorrateado) | edge | 3/3 | 3/3 | = |
| edge-data-access (datos propios del usuario) | edge | 0/3 | 3/3 | +3 |
| policy-pricing (precios públicos) | policy | 0/3 | 3/3 | +3 |
| escalation-01 (pérdida de datos) | escalation | 3/3 | 3/3 | = |
| refund-tradeoff (falla del servicio) | edge | 3/3 | 3/3 | = |

## Anti-patrones Abordados

### 1. Retención de información (2 casos arreglados)
- `edge-data-access`: Se eliminó "NEVER share order counts" → el bot ahora comparte los datos del usuario
- `policy-pricing`: Se eliminó "NEVER share pricing" → el bot ahora comparte precios públicos

### 2. Instrucciones sin capacidad (1 caso endurecido)
- `edge-arithmetic`: Se agregó declaración de herramienta calculadora → el modelo puede calcular reembolsos prorrateados de forma confiable

### 3. Trade-off de un solo lado (1 caso mejorado)
- `refund-tradeoff`: Se cambió de "los reembolsos son caros" → "pesar el costo del reembolso vs. perder al cliente"

## Cambios de higiene (sin impacto en eval, pero necesarios)
- Rol: "María, agente humana" → "Asistente de soporte IA" (veraz)
- Estructura: Markdown plano → Etiquetas XML (role/guidelines/policies/tools/output_format)
- Eliminado: Boilerplate de página web en footer (copyright, cookie settings, etc.)
- Agregado: Contrato de salida (respuesta primero, <150 palabras, mostrar cálculos, siguiente paso específico)

## Decisión del Contrato de Salida

Se eligió texto libre con restricciones en vez de structured output porque:
- El chat de soporte requiere lenguaje natural, no JSON
- Stop sequences sobre longitud serían apropiados en el harness de la API
- La sección `<output_format>` en el prompt actúa como el contrato

Para un caso de uso de clasificación o extracción, structured output (JSON schema) sería preferible.

## Archivos

```
prompts/easyorder-support/
  v0-prompt.md          — Prompt original de producción (71% pass rate)
  v1-prompt.md          — Prompt limpio con anti-patrones arreglados (100% pass rate)
  CHANGELOG.md          — Razón de cada cambio con guía de reversión
  REPORT.md             — Este archivo
  evals/
    cases.json          — 7 casos de eval (2 control, 3 edge, 1 policy, 1 escalation)
    runner.js           — Runner determinístico de evals con rúbrica de calificación
    results-v0-prompt.json  — Resultados crudos V0
    results-v1-prompt.json  — Resultados crudos V1
```
