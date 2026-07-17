# Postmortem: Modulo de Exportacion de Reportes

## Claridad de la intencion al inicio

Mi intencion inicial era vaga: "un boton que descargue el reporte". No tenia claro
los tipos de reporte, los estados intermedios ni los edge cases. La intencion cubria
el happy path pero ignoraba todo lo demas.

## Que extrajo Claude que yo no habria articulado

La entrevista guiada saco tres requisitos que no tenia contemplados:
1. **Empty state**: que pasa cuando no hay datos en el rango seleccionado.
2. **Branding en el PDF**: incluir logo y datos del restaurante en el header.
3. **Formato de fechas**: forzar DD/MM/YYYY para evitar el clasico error de formato gringo.

Ademas, al implementar se detecto el bug de timezone (UTC vs local) en los date inputs,
que habria pasado desapercibido sin la verificacion en navegador.

## Area sub-especificada

El formato de las fechas quedo sub-especificado hasta que lo probe en el navegador.
Los inputs type="date" devuelven strings YYYY-MM-DD que `new Date()` interpreta en UTC,
causando un desfase de un dia en zonas horarias negativas. Lo detecte al ver que el
periodo decia "30/06" en vez de "01/07". La correccion fue parsear las fechas como
locales en vez de confiar en el constructor de Date.

## Decision de stack

Elegi pdfmake sobre jsPDF por su API declarativa y soporte nativo de tablas dinamicas.
Elegi Tailwind CSS sobre CSS puro por velocidad de prototipado con utility classes.
Ambas decisiones se validaron durante la implementacion.

## Fase de convergencia

No active plan mode formal. La convergencia se logro mediante: (1) entrevista guiada
con 4 preguntas sobre requisitos latentes, (2) wireframe HTML commiteado como spec,
y (3) decision de stack conversada con justificacion documentada. El agente nunca
corrio sin fase previa de alineacion.
