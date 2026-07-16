# Entrevista Dirigida — Metrics Dashboard

**Feature:** Dashboard de Métricas con Visualización + Export  
**Fecha:** 2026-07-15  
**Método:** Entrevista ask-user con 5 preguntas navegables

---

## Pregunta 1: Audiencia primaria y secundaria

**Claude:** ¿Quién va a usar este dashboard? ¿Es para el dueño del restaurante, el gerente de turno, o un analista externo?

**Usuario:** Principalmente el dueño y el gerente. Pero también quiero que un analista de datos pueda exportar los números para hacer reportes externos.

**Requisito extraído:** Dos audiencias: operativa (dueño/gerente que mira rápido) y analítica (exporta CSV para herramientas externas). El diseño debe priorizar lectura rápida pero el export debe ser siempre accesible.

---

## Pregunta 2: Criterios de éxito

**Claude:** ¿Cómo sabrás que el dashboard está funcionando bien? ¿Qué números necesitas ver de un vistazo?

**Usuario:** Total de reportes en un rango, cuántos están aprobados/pendientes/rechazados, la tasa de aprobación como porcentaje, y cuánto tardan en promedio en revisarse.

**Requisito extraído:** 4 KPIs principales: total, breakdown por status, tasa de aprobación (%), tiempo promedio de revisión (días). Todos visibles sin scroll.

---

## Pregunta 3: Edge cases y estados vacíos

**Claude:** ¿Qué debería pasar cuando el rango de fechas no tiene datos? ¿Y si todos los reportes están en un solo estado (100% aprobados o 100% pendientes)?

**Usuario:** Si no hay datos, que se vea un mensaje claro, no NaN ni errores. Y el botón de exportar debe funcionar siempre — incluso con cero filas debería generar un CSV vacío.

**Requisito latente extraído:** El export NUNCA se deshabilita. Esto previene un edge case donde el analista llega, filtra un rango vacío, y no puede ni descargar un archivo vacío para confirmar que no hay datos. Sin esta pregunta, el default sería deshabilitar el botón con 0 resultados.

---

## Pregunta 4: Prioridad visual y layout

**Claude:** Tengo dos direcciones posibles: (A) Grid compacto con KPIs arriba y gráfica de tendencia abajo, export directo como botón. (B) Layout de 2 columnas con KPIs a la izquierda y gráfica grande a la derecha, export en menú desplegable. ¿Cuál prefieres?

**Usuario:** La A. Quiero que sea compacto y que el botón de exportar sea directo, sin menús escondidos.

**Decisión:** Dirección A ganó. Grid compacto + export como botón visible, no menú.

---

## Pregunta 5: Formato de tendencia

**Claude:** Para la gráfica de tendencia, ¿quieres ver los últimos 7 días, 14 días, o todo el rango seleccionado?

**Usuario:** 14 días está bien. Si el rango es más largo, que muestre los últimos 14 de ese rango.

**Requisito extraído:** Trend chart = últimos 14 días del rango seleccionado, no el rango completo (evita gráficas demasiado anchas con 200+ barras).

---

## Resumen de requisitos extraídos

| Requisito | Fuente | Latente? |
|-----------|--------|----------|
| 4 KPIs visibles sin scroll | Pregunta 2 | No |
| Export siempre habilitado (incluso con 0 filas) | Pregunta 3 | **Sí** |
| Grid compacto, botón directo (no menú) | Pregunta 4 | No |
| Trend chart = 14 días, no rango completo | Pregunta 5 | No |
| Dos audiencias: operativa + analítica | Pregunta 1 | Parcial |
| Empty state con mensaje claro, no NaN | Pregunta 3 | **Sí** |
| data-* contract para verificación agéntica | Diseño técnico | **Sí** |
