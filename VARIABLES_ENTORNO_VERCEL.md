# 🔐 Variables de Entorno para Vercel

## 📋 Variables que Necesitas Configurar:

### Opción 1: Configurar AHORA (Antes del Deploy)

Si quieres configurar las variables de entorno ANTES de hacer el deploy:

1. En la pantalla de configuración de Vercel, busca **"Environment Variables"**
2. Click para expandir la sección
3. Agrega estas variables:

#### Variable 1: URL del Backend
- **Key (Name):** `VITE_API_URL`
- **Value:** La URL de tu backend en Render
- **Ejemplo:** `https://tu-backend.onrender.com/api`
- **Environment:** Production, Preview, Development (marca las 3)

#### Variable 2 (Opcional): Otras configuraciones
Si tienes otras variables, agrégalas aquí.

---

### Opción 2: Configurar DESPUÉS (Recomendado para Principiantes)

**Puedes hacer el deploy AHORA sin variables de entorno** y agregarlas después:

1. **Primero haz el deploy** sin variables (click en "Deploy")
2. **Espera a que termine** (2-3 minutos)
3. **Después agrega las variables:**
   - Ve a tu proyecto en Vercel
   - Click en **"Settings"**
   - Click en **"Environment Variables"**
   - Agrega `VITE_API_URL` con la URL de tu backend
   - Click en **"Save"**
4. **Redeploy** para que tome las variables:
   - Ve a **"Deployments"**
   - Click en los 3 puntos (...)
   - Click en **"Redeploy"**

---

## 🎯 ¿Qué Variable Necesitas?

### Si tu Backend está en Render:

**Variable:** `VITE_API_URL`
**Valor:** La URL de tu backend en Render

**Ejemplo:**
```
https://compraventa-backend.onrender.com/api
```

**Cómo obtener la URL:**
1. Ve a tu proyecto backend en Render
2. Copia la URL que aparece arriba
3. Agrégale `/api` al final

---

## 🚀 Mi Recomendación:

### Para Empezar Rápido:

1. **NO agregues variables ahora**
2. **Deja la sección "Environment Variables" vacía**
3. **Click en "Deploy"**
4. **Espera a que termine el deploy**
5. **Verifica que la app cargue** (aunque no se conecte al backend todavía)
6. **Después agrega las variables** siguiendo la Opción 2

### ¿Por qué?

- Es más fácil diagnosticar problemas
- Primero verificamos que el frontend funcione
- Después conectamos el backend
- Si algo falla, sabemos qué es

---

## 📝 Configuración Completa (Si quieres hacerlo ahora):

Si prefieres configurar TODO ahora:

### En la sección "Environment Variables":

**Variable 1:**
- **Key:** `VITE_API_URL`
- **Value:** `https://tu-backend-en-render.onrender.com/api`
- **Environments:** ✓ Production ✓ Preview ✓ Development

**Nota:** Reemplaza `tu-backend-en-render` con el nombre real de tu backend en Render.

---

## ❓ ¿Qué Hacer Ahora?

**Opción A - Rápido (Recomendado):**
1. Deja "Environment Variables" vacío
2. Click en "Deploy"
3. Agrega variables después

**Opción B - Completo:**
1. Agrega `VITE_API_URL` ahora
2. Click en "Deploy"
3. Todo funcionará desde el inicio

---

## 🆘 Si No Sabes la URL del Backend:

Si no tienes el backend desplegado todavía:

1. **Haz el deploy del frontend SIN variables**
2. **Después despliega el backend en Render**
3. **Obtén la URL del backend**
4. **Agrega la variable en Vercel**
5. **Redeploy el frontend**

---

**¿Qué prefieres hacer?**
- **A)** Deploy ahora sin variables (más rápido)
- **B)** Agregar variables ahora (necesito la URL del backend)
- **C)** No tengo backend desplegado todavía
