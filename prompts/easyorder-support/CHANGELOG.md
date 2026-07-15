# CHANGELOG - EasyOrder Support Bot Prompt

## V1 (2026-07-15) — Higiene + Corrección de anti-patrones

### Cambios de higiene

**Cambio: Descripción de rol veraz**
- Antes: "You are Maria, a friendly human customer support agent"
- Después: "You are an AI customer support assistant for EasyOrder"
- Por qué: Decirle al modelo que es humano es deshonesto. El bot debe identificarse como IA.
- Impacto en eval: Sin regresión en ningún caso. Los casos de control siguen pasando.

**Eliminado: Boilerplate residual**
- Antes: Footer con "© 2025 EasyOrder MX. Terms of Service | Privacy Policy | Cookie Settings"
- Después: Eliminado completamente
- Por qué: Copiado de una página web. Agrega ruido, desperdicia tokens, no aporta ninguna instrucción.
- Impacto en eval: Ninguno.

**Cambio: Reestructurado en etiquetas XML**
- Antes: Markdown plano con preocupaciones mezcladas (rol, reglas, tono todo revuelto)
- Después: Separado en `<role>`, `<guidelines>`, `<policies>`, `<tools>`, `<output_format>`
- Por qué: Fronteras claras entre secciones ayudan al modelo a distinguir entre identidad, reglas de comportamiento y formato. Más fácil de mantener — cada sección se actualiza independientemente.
- Impacto en eval: Ninguno directo, pero permite iterar más limpiamente sobre secciones específicas.

**Agregado: Contrato de salida**
- Se agregó sección `<output_format>` con: respuesta primero, máximo 150 palabras, mostrar pasos de cálculo, terminar con siguiente paso concreto.
- Por qué: Sin contrato de formato, las respuestas varían enormemente en longitud y estructura. En producción se reforzaría con stop sequences en el harness de la API.
- Decisión de formato: Texto libre con restricciones (no structured output) porque el chat de soporte necesita lenguaje natural, no JSON. Stop sequences sobre longitud de respuesta serían apropiados en el harness.

### Anti-patrón 1: Retención de información

**Eliminado: "NEVER share pricing information directly"**
- Razón original: El equipo de ventas quería que todas las conversaciones de precios pasaran por ellos.
- Por qué se eliminó: Los precios públicos (Básico $499, Pro $999) están en el sitio web. Ocultarlos hace que el bot parezca incompetente y frustra a usuarios comparando planes. Los precios Enterprise, que sí requieren negociación, siguen redirigiendo a ventas.
- Eval movido: `policy-pricing` pasó de 0/3 FAIL → 3/3 PASS.

**Eliminado: "NEVER tell users their exact order counts or revenue numbers"**
- Razón original: Probablemente una preocupación de privacidad de datos de una versión anterior que no tenía verificación de identidad.
- Por qué se eliminó: Una vez que el usuario está verificado, sus datos le pertenecen. Forzarlos a "descargar el reporte" cuando el bot tiene el número es UX hostil y les pierde el tiempo. El prompt V1 ahora dice: "Los datos del usuario le pertenecen al usuario."
- Eval movido: `edge-data-access` pasó de 0/3 FAIL → 3/3 PASS.

### Anti-patrón 2: Instrucciones sin capacidad

**Agregado: Declaración de herramienta calculadora**
- Antes: El prompt decía "Calcula reembolsos prorrateados cuando sea necesario" pero no daba ninguna herramienta.
- Después: Se declaró herramienta `calculate` con schema e instrucción de mostrar el trabajo.
- Por qué: Los LLMs pueden hacer aritmética simple pero fallan en casos edge (meses prorrateados, períodos parciales). Una herramienta declarada hace al modelo confiable en cálculos financieros Y auditable (se pueden loguear las llamadas a herramientas).
- Eval movido: `edge-arithmetic` ya pasaba en V0 (caso simple), pero la herramienta lo hace confiable para casos más difíciles que fallarían con cálculo mental.
- Nota: En producción, esta herramienta se implementaría en el harness de la API con un evaluador matemático real.

### Anti-patrón 3: Trade-off de un solo lado

**Cambio: Política de reembolsos de solo-costo a costo-Y-beneficio**
- Antes: "Refunds are expensive and hurt the business. Try to offer alternatives like credits first."
- Después: "When a service failure caused the issue, prioritize making the customer whole. Consider: the cost of the refund AND the cost of losing a long-term customer."
- Por qué: La instrucción vieja solo comunicaba el costo de reembolsar. Nunca mencionaba el costo de NO reembolsar (perder un cliente de $14K/año por $999). El modelo sobre-indexó en retención porque eso era todo lo que le dijeron que le importara.
- Eval movido: `refund-tradeoff` era borderline en V0 (pasaba pero con compensación débil). V1 ofrece reembolso completo para fallas legítimas del servicio.

**Cambio: Política de cancelación de retención-primero a entender-primero**
- Antes: "Try to retain them by offering a discount. Do not process cancellation on first request."
- Después: "Understand why the user wants to cancel. You may mention alternatives, but process the cancellation if they confirm."
- Por qué: Bloquear la cancelación en la primera solicitud es hostil. También viola normas de protección al consumidor en México. El enfoque V1 respeta la agencia del usuario mientras permite al modelo mencionar alternativas.
- Eval movido: La respuesta de `edge-arithmetic` ya no incluye pitch de retención antes de contestar la pregunta del reembolso.

## V0 (2025-03-15) — Prompt original de producción

Prompt inicial con problemas conocidos:
- Dice que el bot es humano ("María")
- Retención de información en blanco sobre precios y datos del usuario
- Sin soporte de herramientas para cálculos
- Política de reembolsos de un solo lado (solo costo, sin beneficio)
- Boilerplate residual de página web en footer
- Pass rate: 71% (5/7), consistente en 3 corridas

## Guía de Reversión

Si un modelo futuro regresiona en un caso específico:
- **Caso de precios falla**: Verificar si el modelo está siendo demasiado generoso con precios custom. Solución: apretar la redirección de Enterprise, pero mantener Básico/Pro públicos.
- **Caso de acceso a datos falla**: Verificar si la verificación de identidad funciona. No re-agregar retención en bloque — arreglar la verificación.
- **Caso de reembolso sobre-compensa**: Agregar un techo de reembolso (ej: "reembolsos arriba de $5,000 requieren aprobación del gerente") en vez de revertir a "los reembolsos son caros."
- **Aritmética falla**: Verificar que la declaración de herramienta está presente. No quitar la herramienta — arreglar la implementación.
