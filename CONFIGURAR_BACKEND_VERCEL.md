# 🔧 CONFIGURAR BACKEND EN VERCEL

## 🎯 Problema

Vercel carga correctamente pero no se conecta al backend de Render.

## ✅ SOLUCIÓN: Agregar Variable de Entorno en Vercel

### Paso 1: Ir a Vercel Dashboard
1. Ve a: https://vercel.com/dashboard
2. Click en tu proyecto: **app-compraventa**

### Paso 2: Ir a Settings
1. Click en la pestaña **"Settings"**
2. En el menú lateral, click en **"Environment Variables"**

### Paso 3: Agregar VITE_API_URL
1. Click en **"Add New"** o el botón para agregar variable
2. Completa los campos:

   **Key:**
   ```
   VITE_API_URL
   ```

   **Value:**
   ```
   https://app-compraventa.onrender.com/api
   ```

   **Environments:** Marca las 3 opciones:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

3. Click en **"Save"**

### Paso 4: Redeploy
1. Ve a la pestaña **"Deployments"**
2. Click en los **3 puntos (...)** del deployment más reciente
3. Click en **"Redeploy"**
4. Confirma haciendo click en **"Redeploy"** nuevamente
5. **Espera 2-3 minutos**

### Paso 5: Probar
1. Cuando el deployment diga "Ready"
2. Ve a: https://app-compraventa.vercel.app
3. Presiona **Ctrl + Shift + R** (limpiar caché)
4. Intenta iniciar sesión
5. **¡Debería funcionar!** ✅

---

## 🧪 VERIFICACIÓN

### Test 1: Verificar que la variable se agregó
1. En Vercel Settings → Environment Variables
2. Deberías ver:
   ```
   VITE_API_URL = https://app-compraventa.onrender.com/api
   ```

### Test 2: Verificar que el backend responde
1. Abre en el navegador: https://app-compraventa.onrender.com
2. Deberías ver un JSON con información de la API

### Test 3: Probar login en Vercel
1. Ve a: https://app-compraventa.vercel.app
2. Intenta iniciar sesión
3. Si funciona → ✅ Todo configurado correctamente

---

## 🎯 PRUEBA FINAL: Crear Vehículo sin VIN ni Color

Una vez que el login funcione:

1. **Inicia sesión** en https://app-compraventa.vercel.app
2. **Ve a "Vehículos" → "Nuevo Vehículo"**
3. **Llena el formulario:**
   - Marca: Peugeot
   - Modelo: 3008 Active
   - Año: 2025
   - Placa: PROD001
   - **VIN: (VACÍO)** ✅
   - **Color: (VACÍO)** ✅
   - Kilometraje: 8220
   - Precio Compra: 50000000
   - Precio Venta: 55000000
4. **Click en "Guardar Vehículo"**
5. **¡Debería funcionar!** ✅

---

## 🆘 Si el Problema Persiste

### Problema: Sigue sin conectarse al backend

**Verifica que:**
1. La variable `VITE_API_URL` esté correctamente escrita
2. La URL termine en `/api`
3. El backend en Render esté corriendo (https://app-compraventa.onrender.com)
4. Hiciste redeploy después de agregar la variable

### Problema: Backend de Render no responde

**Solución:**
1. Ve a: https://dashboard.render.com/
2. Selecciona tu backend
3. Verifica que esté "Live"
4. Si no, click en "Manual Deploy" → "Deploy latest commit"

---

## 📊 Checklist

- [ ] Variable `VITE_API_URL` agregada en Vercel
- [ ] Valor: `https://app-compraventa.onrender.com/api`
- [ ] Marcadas las 3 environments (Production, Preview, Development)
- [ ] Redeploy realizado
- [ ] Deployment completado (Status: Ready)
- [ ] Backend de Render funcionando
- [ ] Login funciona en Vercel
- [ ] Puedo crear vehículo sin VIN ni Color

---

**Tiempo estimado:** 5 minutos
**Dificultad:** Baja
**Estado:** Esperando configuración
