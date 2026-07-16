# Evidencia de 3 Roturas Deliberadas

Ejecutadas el 2026-07-16 vía Playwright MCP (Browser pane agéntico).

## Rotura 1: Fallo aritmético hardcodeado

**Acción:** Se cambió `data-value={metrics.total}` → `data-value={999}` en MetricsDashboard.jsx  
**La app:** Sigue renderizando normalmente (muestra "999" como total)  
**Verificación:**
```json
{
  "domTotal": 999,
  "calcSum": 212,
  "arithmeticViolation": true,
  "message": "FAIL: arithmetic-sum violated — DOM total=999 but approved+pending+rejected=212"
}
```
**Resultado:** DETECTADO. La sonda aritmética captura el mismatch.

---

## Rotura 2: Contrato roto sin romper la app

**Acción:** Se eliminaron `data-metric="approval-rate"` y `data-value` del div de tasa de aprobación  
**La app:** Sigue mostrando "61%" visualmente (React no necesita data-* para renderizar)  
**Verificación:**
```json
{
  "contractElement": null,
  "contractMissing": true,
  "appStillRendersValue": "61%",
  "message": "FAIL: missing contract — data-metric=\"approval-rate\" not found in DOM. App still renders fine visually."
}
```
**Resultado:** DETECTADO. El contrato DOM es independiente de la implementación visual. Sin data-*, la verificación agéntica no puede leer el valor — aunque el humano lo ve.

---

## Rotura 3: Verificación underspecified

**Acción:** Se manipuló el DOM: approved=50, pending=50, rejected=50 (sum=150) mientras total=212  
**Probe débil:** `total > 0` → **PASS** (incorrecto)  
**Probe fuerte:** `total === approved + pending + rejected` → **FAIL** (correcto)

```json
{
  "domTotal": 212,
  "tamperedSum": 150,
  "weakProbe_totalGtZero": { "result": "PASS", "note": "Only checks total > 0 — misses broken arithmetic" },
  "strongProbe_arithmeticSum": { "result": "FAIL", "note": "total(212) !== sum(150) — invariant violated" }
}
```
**Resultado:** DETECTADO por la sonda fuerte. La sonda débil da falso positivo.  
**Lección:** Testing ≠ Verifying. Las sondas deben verificar invariantes, no solo existencia.
