## Jerarquía de Permisos Aplicada

En este entorno de desarrollo, la resolución de permisos de Claude Code sigue el modelo estándar, evaluando de mayor a menor prioridad:

De la empresa (Managed): Este ni aplica. Como no tengo restricciones corporativas ni estoy en una red de empresa, nos lo saltamos.

Global (~/.claude/settings.json): Las reglas generales para mi compu. Más que nada para que la IA no le mueva a nada del sistema operativo.

Del proyecto (.claude/settings.json): Las reglas de la carpeta donde esté trabajando. Lo que yo configure aquí siempre mata a las reglas globales si es que llegan a chocar.

## Justificación de Decisiones de Seguridad
* **Por qué `Bash(rm *)` está en ASK y no en DENY:** La neta, cuando ando refactorizando código o limpiando dependencias, tira mucho paro que el asistente me ayude a volar los archivos que ya no ocupo. Si lo bloqueo por completo en DENY, me va a trabar el flujo y voy a tener que andar borrando todo a mano. Dejándolo en ASK, simplemente me avisa, le echo un ojo rápido para ver qué va a borrar, le doy luz verde y seguimos chambeando sin broncas.
* **Por qué NO se utiliza `--dangerously-skip-permissions`:** 
Sí, estaría muy bien que el asistente hiciera todo en automático y más rápido, pero no le voy a soltar las llaves de los proyectos así nomás. Activar eso es darle permiso de correr scripts a lo loco o mover la estructura sin avisarme. No me voy a arriesgar a que me truene algo crítico del código nada más por darme flojera teclear la "Y" en la consola para confirmar.
y puedo ur viendo que mueve y que no.