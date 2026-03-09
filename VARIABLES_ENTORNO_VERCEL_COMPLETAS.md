# Variables de Entorno para Vercel (Frontend)

## 📋 Variable Requerida

Para que el frontend en Vercel se conecte correctamente al backend en Render, necesitas configurar esta variable de entorno:

### VITE_API_URL

**Nombre:** `VITE_API_URL`

**Valor:** La URL de tu backend desplegado en Render

**Ejemplo:**
```
VITE_API_URL=https://tu-app-backend.onrender.com
```

## 🔍 Cómo Obtener la URL del Backend

### Opción 1: Desde Render Dashboard
1. Ve a https://dashboard.render.com
2. Click en tu servicio de backend
3. Copia la URL que aparece arriba (ejemplo: `https://app-compraventa-backend.onrender.com`)

### Opción 2: Desde el Email de Render
Render te envió un email con la URL de tu servicio cuando lo creaste.

## ⚙️ Cómo Configurar en Vercel

### Método 1: Desde Vercel Dashboard (Recomendado)

1. Ve a https://vercel.com/dashboard
2. Click en tu proyecto de frontend
3. Click en "Settings" (Configuración)
4. Click en "Environment Variables" en el menú lateral
5. Agrega la variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://tu-backend.onrender.com` (sin barra al final)
   - **Environment:** Selecciona "Production", "Preview" y "Development"
6. Click en "Save"
7. Ve a "Deployments"
8. Click en los 3 puntos del último deployment
9. Click en "Redeploy"

### Método 2: Desde CLI de Vercel

```bash
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Login
vercel login

# Agregar variable de entorno
vercel env add VITE_API_URL production
# Cuando te pregunte el valor, ingresa: https://tu-backend.onrender.com

# Redeploy
vercel --prod
```

## 📝 Ejemplo Completo

Si tu backend en Render está en:
```
https://app-compraventa-backend-xyz.onrender.com
```

Entonces en Vercel configuras:
```
VITE_API_URL=https://app-compraventa-backend-xyz.onrender.com
```

**IMPORTANTE:** 
- ❌ NO incluyas `/api` al final
- ❌ NO incluyas barra `/` al final
- ✅ Solo la URL base del backend

## 🔄 Después de Configurar

1. **Redeploy automático:** Vercel detectará el cambio y redesplegará automáticamente
2. **Redeploy manual:** O puedes forzar un redeploy desde el dashboard
3. **Verificar:** Abre tu app en Vercel y verifica que se conecte al backend

## ✅ Verificación

Para verificar que la variable está configurada correctamente:

1. Abre tu app en Vercel
2. Abre las DevTools del navegador (F12)
3. Ve a la pestaña "Console"
4. Escribe: `import.meta.env.VITE_API_URL`
5. Deberías ver la URL de tu backend

## 🚨 Problemas Comunes

### Error: "Cannot connect to backend"
- Verifica que `VITE_API_URL` esté configurada
- Verifica que la URL sea correcta (sin `/` al final)
- Verifica que el backend en Render esté "Live"

### Error: CORS
- Asegúrate de que el backend tenga configurado CORS para tu dominio de Vercel
- El backend ya tiene CORS configurado para aceptar todas las origins en desarrollo

### La variable no se aplica
- Después de agregar la variable, debes hacer un redeploy
- Las variables de entorno solo se aplican en nuevos builds

## 📋 Checklist de Configuración

- [ ] Obtener URL del backend desde Render
- [ ] Ir a Vercel Dashboard → Settings → Environment Variables
- [ ] Agregar `VITE_API_URL` con la URL del backend
- [ ] Seleccionar Production, Preview y Development
- [ ] Guardar la variable
- [ ] Hacer redeploy del frontend
- [ ] Verificar que la app se conecta correctamente
- [ ] Probar login y funcionalidades

## 🔗 Enlaces Útiles

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Render Dashboard:** https://dashboard.render.com
- **Documentación Vercel Env Vars:** https://vercel.com/docs/concepts/projects/environment-variables

---

**Nota:** Esta variable es crítica para que el frontend se comunique con el backend. Sin ella, la aplicación no funcionará en producción.
