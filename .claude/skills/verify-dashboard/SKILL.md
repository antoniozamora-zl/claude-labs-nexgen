---
name: verify-dashboard
description: Verifica el MetricsDashboard con DOM contract y navegador. Se auto-edita cuando encuentra bloqueadores.
---

# Verificacion del MetricsDashboard

## Objetivo

Verificar que el MetricsDashboard renderiza correctamente todas las metricas,
que el DOM contract (data-* attributes) es consistente con los datos, y que
el export CSV funciona.

## Pasos

1. Levantar el dev server si no esta corriendo (`npm start` o usar preview_start).
2. Navegar a la ruta `/` (Dashboard).
3. Usar el formulario de fechas para cargar metricas (click "Cargar metricas").
4. Verificar con `read_page` que existen los elementos del DOM contract:
   - `data-verify="metrics-dashboard"`
   - `data-metric="total"` con `data-value` numerico
   - `data-metric="approval-rate"` con `data-value` entre 0 y 100
   - `data-metric="status-breakdown"` con `data-approved`, `data-pending`, `data-rejected`
   - `data-metric="avg-review-time"` con `data-value`
   - `data-action="export-csv"` habilitado (no disabled)
5. Verificar la suma: approved + pending + rejected == total.
6. Tomar screenshot como evidencia.
7. Click en "Exportar CSV" y verificar que no hay errores en consola.

## Bloqueadores conocidos

- Tailwind no carga: verificar que `src/tailwind.output.css` existe.
  Si no existe, compilar: `npx @tailwindcss/cli -i src/tailwind.input.css -o src/tailwind.output.css`
- Puerto 3000 ocupado: el dev server usa autoPort, buscar el puerto asignado en los logs.
- dateValidation.js missing: el archivo debe existir en src/utils/.

## Auto-mejora

Si durante la verificacion encuentras un bloqueador NO listado arriba:
1. Diagnostica la causa raiz.
2. Agrega el bloqueador y su solucion a la seccion "Bloqueadores conocidos" de ESTE archivo.
3. Haz commit del cambio con mensaje: "skill(verify-dashboard): add blocker - <descripcion corta>"
4. Continua con la verificacion.

Esto asegura que la proxima ejecucion no tropiece con el mismo problema.

- Screenshot timeout: el Browser pane puede hacer timeout al tomar capturas tras
  largos periodos de inactividad. Solucion: navegar de nuevo a la pagina antes del
  screenshot (`navigate` al URL actual), luego reintentar. Si persiste, usar
  `javascript_tool` para leer el DOM como verificacion alternativa — los data-*
  attributes son la fuente de verdad, no el screenshot.

## Ultima auto-edicion

- 2026-07-17: Agregado bloqueador de screenshot timeout con workaround via DOM inspection.
- 2026-07-17: Creacion inicial con 3 bloqueadores conocidos.
