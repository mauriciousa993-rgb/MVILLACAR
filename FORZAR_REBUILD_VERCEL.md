# FORZAR REBUILD LIMPIO EN VERCEL

El problema es que Vercel está usando código cacheado antiguo. Sigue estos pasos:

## Opción 1: Limpiar Cache desde Dashboard (MÁS RÁPIDO)

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Click en tu proyecto "app-compraventa"
3. Ve a **Settings** (Configuración)
4. En el menú lateral, busca **Data Cache**
5. Click en **"Clear Build Cache"** (Limpiar caché de build)
6. Confirma la acción
7. Ve a **Deployments**
8. Click en los 3 puntos (...) del último deployment
9. Selecciona **"Redeploy"**
10. Marca la opción **"Use existing Build Cache"** como **DESACTIVADA**
11. Click en **"Redeploy"**

## Opción 2: Forzar Rebuild con Commit Vacío

Si la Opción 1 no funciona, ejecuta estos comandos:

```bash
git commit --allow-empty -m "Force rebuild: Clear Vercel cache"
git push origin main
```

## Opción 3: Rebuild Manual con Variables de Entorno

1. Ve a Vercel Dashboard → Settings → Environment Variables
2. Agrega una variable temporal:
   - Name: `FORCE_REBUILD`
   - Value: `true`
3. Guarda
4. Ve a Deployments
5. Redeploy el último deployment
6. Después de que termine, elimina la variable `FORCE_REBUILD`

## Verificar que funcionó:

Después del rebuild, verifica:
1. El título debe decir **"Editar Vehículo"** (no "Nuevo Vehículo")
2. Los campos deben estar pre-llenados con los datos del vehículo
3. El botón debe decir **"Actualizar Vehículo"** (no "Guardar Vehículo")

## Si aún no funciona:

Verifica en la consola del navegador (F12) si hay errores de JavaScript.
