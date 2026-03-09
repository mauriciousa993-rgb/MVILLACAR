# Variables de Entorno para Vercel (Frontend)

## 📋 Variable de Entorno Requerida

Para desplegar tu frontend en Vercel, necesitas configurar **UNA SOLA** variable de entorno:

### Variable Principal:

```
VITE_API_URL=https://app-compraventa.onrender.com
```

**Explicación:**
- `VITE_API_URL`: URL de tu backend desplegado en Render
- El prefijo `VITE_` es necesario porque usas Vite como bundler
- Esta variable le dice al frontend dónde está tu API

---

## 🚀 Cómo Configurar en Vercel

### Opción 1: Desde el Dashboard de Vercel (Recomendado)

1. **Ve a tu proyecto en Vercel:**
   - https://vercel.com/dashboard
   - Selecciona tu proyecto (o créalo si no existe)

2. **Ve a Settings:**
   - Click en "Settings" en la barra superior

3. **Configura Environment Variables:**
   - En el menú lateral, click en "Environment Variables"
   - Click en "Add New"

4. **Agrega la variable:**
   ```
   Key:   VITE_API_URL
   Value: https://app-compraventa.onrender.com
   ```

5. **Selecciona los entornos:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development

6. **Guarda:**
   - Click en "Save"

7. **Redeploy:**
   - Ve a "Deployments"
   - Click en los tres puntos del último deployment
   - Click en "Redeploy"

---

### Opción 2: Usando Vercel CLI

Si prefieres usar la línea de comandos:

```bash
# Instalar Vercel CLI (si no lo tienes)
npm install -g vercel

# Ir a la carpeta del frontend
cd frontend

# Login en Vercel
vercel login

# Configurar la variable de entorno
vercel env add VITE_API_URL production
# Cuando te pregunte el valor, ingresa: https://app-compraventa.onrender.com

# También para preview y development
vercel env add VITE_API_URL preview
vercel env add VITE_API_URL development

# Desplegar
vercel --prod
```

---

## 📝 Configuración Completa Paso a Paso

### 1. Crear/Configurar Proyecto en Vercel

**Si NO tienes proyecto en Vercel:**

```bash
cd frontend
vercel
```

Sigue las instrucciones:
- Set up and deploy? **Y**
- Which scope? Selecciona tu cuenta
- Link to existing project? **N**
- What's your project's name? **app-compraventa** (o el nombre que prefieras)
- In which directory is your code located? **./** 
- Want to override the settings? **N**

**Si YA tienes proyecto en Vercel:**

```bash
cd frontend
vercel link
```

### 2. Configurar Variable de Entorno

```bash
vercel env add VITE_API_URL
```

Cuando te pregunte:
- What's the value? **https://app-compraventa.onrender.com**
- Add to which environments? Selecciona **Production, Preview, Development**

### 3. Desplegar

```bash
vercel --prod
```

Esto te dará la URL de tu aplicación, algo como:
```
https://app-compraventa-xxx.vercel.app
```

---

## ✅ Verificación

Después de desplegar, verifica que todo funcione:

1. **Abre la URL de Vercel** que te dio el comando (o desde el dashboard)

2. **Verifica la consola del navegador:**
   - Presiona F12
   - Ve a la pestaña "Console"
   - No deberían haber errores de conexión

3. **Prueba iniciar sesión:**
   - Si puedes iniciar sesión, la conexión con el backend funciona ✅

---

## 🔧 Solución de Problemas

### Error: "Network Error" o "Failed to fetch"

**Causa:** La variable `VITE_API_URL` no está configurada correctamente

**Solución:**
1. Verifica que la variable esté en Vercel Settings > Environment Variables
2. Asegúrate que el valor sea exactamente: `https://app-compraventa.onrender.com`
3. Redeploy el proyecto

### Error: CORS

**Causa:** El backend no permite peticiones desde el dominio de Vercel

**Solución:** Ya está configurado en tu backend, no deberías tener este problema

### La aplicación carga pero no muestra datos

**Causa:** El backend en Render puede estar dormido (free tier)

**Solución:** 
1. Abre `https://app-compraventa.onrender.com` en otra pestaña
2. Espera 30-60 segundos a que el backend despierte
3. Recarga tu aplicación en Vercel

---

## 📱 URLs Finales

Después de configurar todo, tendrás:

- **Frontend (Vercel):** `https://tu-proyecto.vercel.app`
- **Backend (Render):** `https://app-compraventa.onrender.com`

El frontend se conectará automáticamente al backend usando la variable `VITE_API_URL`.

---

## 🎯 Resumen Rápido

**Para desplegar en Vercel necesitas:**

1. Variable de entorno:
   ```
   VITE_API_URL=https://app-compraventa.onrender.com
   ```

2. Comandos:
   ```bash
   cd frontend
   vercel login
   vercel env add VITE_API_URL production
   # Ingresa: https://app-compraventa.onrender.com
   vercel --prod
   ```

3. Obtener la URL de tu app y probarla

¡Eso es todo! 🚀
