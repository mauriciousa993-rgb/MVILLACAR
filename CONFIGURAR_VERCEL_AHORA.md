# Configurar Variable de Entorno en Vercel - AHORA

## 🎯 Tu URL de Backend en Render

```
https://app-compraventa.onrender.com
```

## ⚙️ Pasos para Configurar en Vercel

### Paso 1: Ir a Vercel Dashboard
1. Abre: https://vercel.com/dashboard
2. Busca tu proyecto de frontend (app-compraventa o similar)
3. Click en el proyecto

### Paso 2: Ir a Settings
1. Click en la pestaña "Settings" (arriba)
2. En el menú lateral izquierdo, click en "Environment Variables"

### Paso 3: Agregar la Variable
1. En la sección "Environment Variables", click en "Add New"
2. Completa los campos:

**Name (Nombre):**
```
VITE_API_URL
```

**Value (Valor):**
```
https://app-compraventa.onrender.com
```

**IMPORTANTE:** 
- ❌ NO pongas `/api` al final
- ❌ NO pongas barra `/` al final
- ✅ Exactamente como está arriba

**Environments (Entornos):**
- ✅ Marca "Production"
- ✅ Marca "Preview"  
- ✅ Marca "Development"

3. Click en "Save"

### Paso 4: Redeploy
1. Ve a la pestaña "Deployments" (arriba)
2. Busca el deployment más reciente
3. Click en los 3 puntos (...) a la derecha
4. Click en "Redeploy"
5. Confirma el redeploy

### Paso 5: Esperar
- El redeploy tarda 1-2 minutos
- Verás el estado "Building..." y luego "Ready"

### Paso 6: Verificar
1. Una vez que esté "Ready", click en "Visit"
2. La aplicación debería abrir correctamente
3. Intenta hacer login

## ✅ Verificación Rápida

Para verificar que la variable está configurada:

1. Abre tu app en Vercel
2. Presiona F12 (DevTools)
3. Ve a la pestaña "Console"
4. Escribe:
```javascript
import.meta.env.VITE_API_URL
```
5. Deberías ver: `"https://app-compraventa.onrender.com"`

## 🚨 Si No Funciona

### Problema: La app no se conecta al backend
**Solución:**
1. Verifica que escribiste exactamente: `VITE_API_URL`
2. Verifica que el valor sea: `https://app-compraventa.onrender.com`
3. Verifica que hiciste el redeploy después de agregar la variable

### Problema: Error de CORS
**Solución:**
- El backend ya tiene CORS configurado
- Si persiste, verifica que el backend esté "Live" en Render

### Problema: La variable no aparece
**Solución:**
- Las variables solo se aplican en nuevos builds
- Debes hacer redeploy después de agregarlas

## 📋 Checklist

- [ ] Ir a https://vercel.com/dashboard
- [ ] Click en tu proyecto
- [ ] Settings → Environment Variables
- [ ] Add New
- [ ] Name: `VITE_API_URL`
- [ ] Value: `https://app-compraventa.onrender.com`
- [ ] Environments: Production, Preview, Development
- [ ] Save
- [ ] Deployments → Redeploy
- [ ] Esperar 1-2 minutos
- [ ] Visit → Probar la app

## 🎉 Después de Configurar

Una vez que la app esté funcionando:

1. **Crear Admin en Producción:**
   - Ve a Render Dashboard
   - Click en tu servicio
   - Click en "Shell"
   - Ejecuta: `node backend/scripts/crear-admin-inicial.js`

2. **Login:**
   - Email: admin@compraventa.com
   - Password: admin123

3. **Probar Funcionalidades:**
   - Dashboard con estadísticas corregidas
   - Crear usuarios inversionistas
   - Agregar inversionistas a vehículos
   - Verificar que cada usuario ve solo sus utilidades

---

**Tu configuración exacta:**
```
VITE_API_URL=https://app-compraventa.onrender.com
```

¡Listo! Con esto tu frontend en Vercel se conectará correctamente a tu backend en Render.
