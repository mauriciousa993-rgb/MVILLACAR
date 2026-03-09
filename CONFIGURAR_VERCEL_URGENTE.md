# 🚨 CONFIGURAR VERCEL AHORA - PASO FINAL

## ✅ Lo que ya está listo:

1. ✅ Admin creado en MongoDB: admin@compraventa.com / admin123
2. ✅ Backend desplegado en Render: https://app-compraventa.onrender.com
3. ✅ Registro deshabilitado por seguridad (Commit 73c4e02)
4. ✅ Render está haciendo redeploy automáticamente

## 🚨 PROBLEMA ACTUAL:

El frontend en Vercel muestra "Ruta no encontrada" porque **NO ESTÁ CONECTADO AL BACKEND**.

Falta configurar la variable de entorno `VITE_API_URL` en Vercel.

## 📋 SOLUCIÓN - Sigue estos pasos AHORA:

### Paso 1: Ir a Vercel Dashboard

1. Abre: https://vercel.com/dashboard
2. Click en tu proyecto de la app de compraventa

### Paso 2: Configurar Variable de Entorno

1. Click en **"Settings"** (arriba)
2. Click en **"Environment Variables"** (menú izquierdo)
3. Click en **"Add New"**

### Paso 3: Agregar la Variable

Completa estos campos:

**Name:**
```
VITE_API_URL
```

**Value:**
```
https://app-compraventa.onrender.com
```

**Environments:** (Marca las 3 opciones)
- ✅ Production
- ✅ Preview  
- ✅ Development

4. Click en **"Save"**

### Paso 4: Redeploy

1. Ve a la pestaña **"Deployments"**
2. Click en los 3 puntos (...) del deployment más reciente
3. Click en **"Redeploy"**
4. Confirma el redeploy

### Paso 5: Esperar (1-2 minutos)

Vercel reconstruirá el frontend con la nueva variable de entorno.

### Paso 6: Probar el Login

1. Abre tu app en Vercel (el link que te da Vercel)
2. Intenta hacer login con:
   - Email: admin@compraventa.com
   - Password: admin123

## ✅ Si todo funciona:

Deberías ver:
- ✅ Login exitoso
- ✅ Dashboard con tus vehículos
- ✅ Todas las funcionalidades

## ❌ Si sigue sin funcionar:

1. Verifica que la variable `VITE_API_URL` esté bien escrita
2. Verifica que el valor sea: `https://app-compraventa.onrender.com` (sin / al final)
3. Asegúrate de haber hecho redeploy después de agregar la variable
4. Espera 2-3 minutos para que Vercel termine el build

## 🔗 Enlaces Importantes:

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Backend Render:** https://app-compraventa.onrender.com
- **Render Dashboard:** https://dashboard.render.com

## 📝 Resumen:

```
Variable: VITE_API_URL
Valor: https://app-compraventa.onrender.com
Acción: Save → Redeploy → Esperar → Probar login
```

---

**IMPORTANTE:** Sin esta variable, el frontend NO puede comunicarse con el backend.
