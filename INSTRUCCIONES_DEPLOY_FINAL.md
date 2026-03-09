# 🚀 DEPLOY FINAL: Render + Vercel

## ✅ Paso 1 Completado: Git ✓

Tu código está listo en Git. Ahora necesitamos:
1. Crear repositorio en GitHub
2. Desplegar en Render (backend)
3. Desplegar en Vercel (frontend)

---

## 🔑 DATOS QUE NECESITAS ANTES

Asegúrate de tener:

### 1. MongoDB Atlas ✅ (YA TIENES)
```
MONGODB_URI = mongodb+srv://usuario:contraseña@cluster.xxxxx.mongodb.net/compraventa-vehiculos?retryWrites=true&w=majority
```

### 2. JWT_SECRET (GENERA AHORA)
Abre PowerShell y ejecuta:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Copia el resultado** (será una cadena larga de caracteres)

### 3. GitHub (CREARÁS AHORA)

---

## 📋 INSTRUCCIONES PASO A PASO

### PASO 1: Crear Repositorio en GitHub (2 min)

1. Abre: https://github.com/new

2. Completa así:
   - **Repository name:** `app-compraventa`
   - **Description:** Sistema de compraventa de vehículos
   - **Private:** Selecciona PRIVATE
   - Click en **Create repository**

3. Te aparecerá esta pantalla. Copia estos comandos:
   ```
   git remote add origin https://github.com/TU_USUARIO/app-compraventa.git
   git branch -M main
   git push -u origin main
   ```

4. Ejecuta en PowerShell:
   ```powershell
   cd "c:\Users\mauri\OneDrive\Escritorio\app compraventa"
   git remote add origin https://github.com/TU_USUARIO/app-compraventa.git
   git branch -M main
   git push -u origin main
   ```

5. Te pedirá autenticación. Hay dos opciones:
   - **Opción A (Fácil):** GitHub te abrirá navegador para autorizar
   - **Opción B (Token):** Ve a GitHub → Settings → Developer settings → Personal access tokens → Generate new token (classic) → Copia y pega como contraseña

6. Cuando termine, tu código estará en GitHub ✅

---

### PASO 2: Desplegar Backend en Render (10 min)

#### 2.1 Crear cuenta en Render

1. Abre: https://render.com
2. Click en **Sign up with GitHub**
3. Autoriza Render
4. Completa tu información

#### 2.2 Crear Web Service

1. En dashboard, click en **+ New**
2. Selecciona **Web Service**
3. Conecta tu repositorio:
   - Si aparece `app-compraventa`, selecciona
   - Si no, click en **Adjust GitHub App Permissions**

#### 2.3 Configurar Servicio

Completa así:
```
Name: compraventa-backend
Environment: Node
Build Command: cd backend && npm install && npm run build
Start Command: cd backend && npm start
Instance Type: Free
```

#### 2.4 Agregar Variables de Entorno

Scroll hacia abajo, en **Environment Variables** agrega:

```
PORT = 5000
MONGODB_URI = (pega tu MONGODB_URI completo)
JWT_SECRET = (pega tu JWT_SECRET generado)
NODE_ENV = production
```

**MUY IMPORTANTE:** Sin espacios antes/después

#### 2.5 Deploy

Click en **Create Web Service**

⏳ ESPERA 10-15 minutos mientras compila y despliega

Cuando termine verás:
```
✓ Your service is live
```

Con una URL como: `https://compraventa-backend.onrender.com`

**COPIA ESTA URL** 👈 La necesitarás para Vercel

---

### PASO 3: Desplegar Frontend en Vercel (5 min)

#### 3.1 Crear cuenta en Vercel

1. Abre: https://vercel.com
2. Click en **Sign up with GitHub**
3. Autoriza Vercel
4. Completa tu información

#### 3.2 Importar Proyecto

1. En dashboard, click en **Add New**
2. Selecciona **Project**
3. Click en **Import Git Repository**
4. Busca y selecciona `app-compraventa`
5. Click en **Continue**

#### 3.3 Configurar Proyecto

Vercel sugiere automáticamente, pero verifica:

```
Project Name: app-compraventa (o similar)
Framework Preset: Vite
Root Directory: frontend (IMPORTANTE)
Build Command: npm run build
Output Directory: dist
```

#### 3.4 Agregar Variable de Entorno

En **Environment Variables**, agrega:

```
VITE_API_URL = https://compraventa-backend.onrender.com/api
```

(Reemplaza con tu URL real de Render)

**IMPORTANTE:** Incluye `/api` al final

#### 3.5 Deploy

Click en **Deploy**

⏳ ESPERA 3-5 minutos

Cuando termine:
```
✓ Congratulations! Your project has been successfully deployed
```

Tu URL final: `https://compraventa-vehiculos.vercel.app`

---

## ✅ VERIFICACIÓN FINAL

### 1. Verifica Render
1. Abre: `https://compraventa-backend.onrender.com`
2. Deberías ver JSON con mensaje de bienvenida ✅

### 2. Verifica Vercel
1. Abre: `https://compraventa-vehiculos.vercel.app`
2. Deberías ver página de login ✅
3. Intenta registrarte y hacer login ✅

### 3. Si algo falla
- Abre F12 en el navegador
- Busca errores rojos en consola
- Revisa logs en Render/Vercel dashboard

---

## 🎯 URLs Finales

```
Frontend: https://compraventa-vehiculos.vercel.app
Backend:  https://compraventa-backend.onrender.com
API:      https://compraventa-backend.onrender.com/api
```

---

## 🎉 ¡LISTO!

Tu aplicación está en internet y accesible desde cualquier móvil en el mundo.

Comparte: **https://compraventa-vehiculos.vercel.app**

---

## 🆘 Problemas Comunes

### "Cannot connect to MongoDB"
→ En MongoDB Atlas, ve a Security → Network Access → Agregar `0.0.0.0/0`

### "CORS Error"
→ Verifica que `VITE_API_URL` en Vercel apunte a tu Render URL correcto

### "Build fails en Render"
→ Revisa logs, generalmente falta instalar dependencias

### "Página en blanco en Vercel"
→ Abre F12, busca errores, verifica que API_URL sea correcto

---

**¿Necesitas ayuda en algún paso?** Avísame. 🚀
