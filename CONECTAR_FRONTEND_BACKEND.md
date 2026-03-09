# 🔗 Conectar Frontend (Vercel) con Backend (Render)

## 📋 Información de tu Backend:

**URL del Backend:** `https://app-compraventa.onrender.com`
**URL de la API:** `https://app-compraventa.onrender.com/api`

---

## 🚀 PASOS PARA CONECTAR:

### PASO 1: Agregar Variable de Entorno en Vercel

1. **Ve a Vercel:**
   - Abre: https://vercel.com/dashboard
   - Click en tu proyecto (app-compraventa o como lo hayas nombrado)

2. **Ve a Settings:**
   - Click en la pestaña **"Settings"** (arriba)

3. **Agregar Variable de Entorno:**
   - En el menú izquierdo, click en **"Environment Variables"**
   - Click en el botón **"Add New"** o el campo de texto

4. **Completa los datos:**
   - **Key (Name):** `VITE_API_URL`
   - **Value:** `https://app-compraventa.onrender.com/api`
   - **Environments:** Marca las 3 opciones:
     - ✓ Production
     - ✓ Preview
     - ✓ Development

5. **Guardar:**
   - Click en **"Save"**
   - Deberías ver la variable agregada en la lista

---

### PASO 2: Redeploy del Frontend

Ahora necesitas que Vercel reconstruya el frontend con la nueva variable:

1. **Ve a Deployments:**
   - Click en la pestaña **"Deployments"** (arriba)

2. **Redeploy:**
   - Busca el deployment más reciente (el primero de la lista)
   - Click en los **3 puntos (...)** a la derecha
   - Click en **"Redeploy"**

3. **Confirmar:**
   - En el popup, **NO marques** "Use existing Build Cache"
   - Click en **"Redeploy"**

4. **Esperar:**
   - El redeploy tomará 2-3 minutos
   - Verás el progreso en tiempo real
   - Cuando termine, dirá **"Ready"** con ✓ verde

---

### PASO 3: Verificar la Conexión

1. **Abrir la App:**
   - Click en **"Visit"** o copia la URL de Vercel
   - Abre la URL en tu navegador

2. **Limpiar Caché del Navegador:**
   - Presiona **Ctrl + Shift + R** (Windows)
   - O **Cmd + Shift + R** (Mac)
   - Esto asegura que cargue la versión nueva

3. **Probar Registro:**
   - Click en **"Registrarse"** o **"Register"**
   - Completa el formulario:
     - **Nombre:** Admin Prueba
     - **Email:** admin@prueba.com
     - **Password:** admin123
     - **Rol:** Administrador
   - Click en **"Registrarse"**

4. **Verificar:**
   - ✅ Si te registra y te lleva al dashboard: **¡FUNCIONA!**
   - ❌ Si sale error "Ruta no encontrada": Revisa los pasos anteriores

---

## 🔍 Verificar que el Backend Funciona

Antes de probar el frontend, verifica que el backend esté respondiendo:

1. **Abre esta URL en tu navegador:**
   ```
   https://app-compraventa.onrender.com
   ```

2. **Deberías ver un JSON como este:**
   ```json
   {
     "message": "API de Compraventa de Vehículos",
     "version": "1.0.0",
     "endpoints": {
       "auth": "/api/auth",
       "vehicles": "/api/vehicles"
     }
   }
   ```

3. **Si ves ese mensaje:** ✅ El backend está funcionando correctamente

4. **Si NO ves ese mensaje:** ❌ Hay un problema con el backend en Render

---

## 🆘 Solución de Problemas

### Problema 1: "Ruta no encontrada" después del redeploy

**Posibles causas:**
1. La variable `VITE_API_URL` no se guardó correctamente
2. El redeploy no tomó la nueva variable
3. El caché del navegador no se limpió

**Solución:**
1. Ve a Vercel → Settings → Environment Variables
2. Verifica que `VITE_API_URL` esté ahí con el valor correcto
3. Si no está, agrégala de nuevo
4. Haz otro redeploy
5. Limpia el caché del navegador (Ctrl + Shift + R)

### Problema 2: Error de CORS

**Error en consola:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solución:**
1. El backend ya tiene CORS configurado para permitir todas las origins
2. Verifica que la URL en `VITE_API_URL` termine en `/api`
3. Verifica que no haya espacios extra en la URL

### Problema 3: Backend no responde

**Error:** `ERR_CONNECTION_REFUSED` o timeout

**Solución:**
1. Ve a Render → tu servicio backend
2. Verifica que el estado sea **"Live"** (verde)
3. Si dice **"Failed"** o **"Suspended"**, revisa los logs
4. Render free tier se suspende después de 15 minutos de inactividad
5. Abre la URL del backend en el navegador para "despertarlo"

### Problema 4: Error 500 en el backend

**Error:** Internal Server Error

**Solución:**
1. Ve a Render → tu servicio → **"Logs"**
2. Busca el error específico
3. Usualmente es por:
   - MongoDB no conectado (verifica `MONGODB_URI`)
   - JWT_SECRET faltante
   - Variables de entorno incorrectas

---

## ✅ Checklist de Verificación

Antes de probar, verifica que:

- [ ] Backend en Render está **"Live"** (verde)
- [ ] Backend responde en `https://app-compraventa.onrender.com`
- [ ] Variable `VITE_API_URL` agregada en Vercel
- [ ] Valor de la variable: `https://app-compraventa.onrender.com/api`
- [ ] Frontend redeployado en Vercel
- [ ] Redeploy completado (Ready ✓)
- [ ] Caché del navegador limpiado (Ctrl + Shift + R)

---

## 🎯 Resumen de URLs

**Backend (Render):**
- Dashboard: https://dashboard.render.com/
- API Base: https://app-compraventa.onrender.com
- API Endpoints: https://app-compraventa.onrender.com/api

**Frontend (Vercel):**
- Dashboard: https://vercel.com/dashboard
- App: [Tu URL de Vercel]

**Variable de Entorno:**
- Key: `VITE_API_URL`
- Value: `https://app-compraventa.onrender.com/api`

---

## 🎉 Próximos Pasos

Una vez que todo funcione:

1. **Registra tu primer usuario** (admin@prueba.com)
2. **Inicia sesión**
3. **Agrega tu primer vehículo**
4. **Explora todas las funciones**

---

**¿Necesitas ayuda? Dime en qué paso estás:**
- A) Agregando variable en Vercel
- B) Haciendo redeploy
- C) Probando el registro
- D) Tengo un error (compártelo)
