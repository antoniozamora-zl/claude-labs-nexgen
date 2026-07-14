### 1. Pruebas con `$ARGUMENTS`
* **`/code-review src`:** Analizo tod y dio erroes AJSDJAJSDAJSdj

### 2. Uso de `disable-model-invocation: true`
Elegí esto (en lugar de `user-invocable: false`) porque el comando es exclusivo para mí. Evita que Claude dispare revisiones por su cuenta; solo corre cuando yo lanzo el *slash command* manualmente.

### 3. Workflow Dinámico (`/qa-check`)
Le pedí revisar archivos modificados y correr tests. Con `/workflows` vi las fases secuenciales, lo guardé con la tecla `S` como `/qa-check` y, al volver a correrlo, ejecutó los mismos sub-agentes a la perfección.

### 4. Control de Costos 
Edité el JS del workflow para bajarle el modelo a `haiku` (en vez de `sonnet`) al sub-agente que solo lee los logs de la consola. jalo exactamente igual y sale más barato por tarea

### 5. Próxima "Claude-ificación"
Voy a automatizar la creación de mensajes de commits (`git commit -m`) y la actualización del Changelog para que arme los resúmenes leyendo el diff en automático.