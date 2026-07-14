---
name: code-checarxd
description: Hace un review rápido del código y checa malas prácticas.
model: claude-3-5-sonnet-20241022
disable-model-invocation: true
---
Revisa el código en la siguiente ruta: $ARGUMENTS

Pasos a seguir:
1. Lee los archivos de la ruta especificada.
2. Checa si hay errores, bugs o código que se pueda optimizar.
3. Dame una lista cortita y directa de lo que hay que mejorar. No modifiques el código, solo dime qué onda.