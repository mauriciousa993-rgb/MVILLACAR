# 🚀 Guía Completa: Desplegar Backend en Render

## 📋 Requisitos Previos

Antes de empezar, necesitas:
1. ✓ Cuenta en Render.com (gratis)
2. ✓ Cuenta en MongoDB Atlas (gratis)
3. ✓ Tu código en GitHub (ya lo tienes)

---

## PASO 1: Crear Cuenta en MongoDB Atlas (Base de Datos)

### 1.1 Ir a MongoDB Atlas
1. Ve a: https://www.mongodb.com/cloud/atlas/register
2. Regístrate con Google o email
3. Completa el formulario de registro

### 1.2 Crear un Cluster (Base de Datos)
1. Click en **"Build a Database"** o **"Create"**
2. Selecciona **"M0 FREE"** (gratis)
3. Selecciona un proveedor:
   - **AWS** (recomendado)
   - Región: Elige la más cercana a ti (ejemplo: N. Virginia, São Paulo)
4. Click en **"Create Cluster"**
5. Espera 1-3 minutos mientras se crea

### 1.3 Configurar Acceso a la Base de Datos

#### A) Crear Usuario de Base de Datos:
1. En el menú izquierdo, click en **"Database Access"**
2. Click en **"Add New Database User"**
3. Completa:
   - **Username:** `admin` (o el que prefieras)
   - **Password:** Click en "Autogenerate Secure Password" y **COPIA LA CONTRASEÑA**
   - O crea tu propia contraseña (ejemplo: `Admin123456`)
4. **Database User Privileges:** Selecciona **"Read and write to any database"**
5. Click en **"Add User"**

**⚠️ IMPORTANTE:** Guarda el usuario y contraseña, los necesitarás después.

#### B) Permitir Acceso desde Cualquier IP:
1. En el menú izquierdo, click en **"Network Access"**
2. Click en **"Add IP Address"**
3. Click en **"Allow Access from Anywhere"**
4. Confirma que aparece `0.0.0.0/0`
5. Click en **"Confirm"**

### 1.4 Obtener la Connection String (URL de Conexión)
1. Ve a **"Database"** en el menú izquierdo
2. Click en **"Connect"** en tu cluster
3. Selecciona **"Connect your application"**
4. Copia la **Connection String** (se ve así):
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **REEMPLAZA** `<password>` con la contraseña que creaste
6. **AGREGA** el nombre de la base de datos antes del `?`:
   ```
   mongodb+srv://admin:TuPassword@cluster0.xxxxx.mongodb.net/compraventa?retryWrites=true&w=majority
   ```

**⚠️ GUARDA ESTA URL**, la necesitarás en Render.

---

## PASO 2: Generar JWT Secret

Necesitas una clave secreta para los tokens de autenticación.

### Opción A: Usar el Script (Windows)
1. Abre el archivo `generar-jwt-secret.bat`
2. Ejecútalo (doble click)
3. Copia el JWT_SECRET que genera

### Opción B: Generar Manualmente
1. Ve a: https://www.uuidgenerator.net/
2. Copia el UUID generado
3. O usa cualquier cadena aleatoria larga (mínimo 32 caracteres)

**Ejemplo:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
```

**⚠️ GUARDA ESTE JWT_SECRET**, lo necesitarás en Render.

---

## PASO 3: Desplegar en Render

### 3.1 Crear Cuenta en Render
1. Ve a: https://render.com/
2. Click en **"Get Started"** o **"Sign Up"**
3. Regístrate con GitHub (recomendado)
4. Autoriza a Render para acceder a tus repositorios

### 3.2 Crear Nuevo Web Service
1. En el dashboard de Render, click en **"New +"**
2. Selecciona **"Web Service"**
3. Conecta tu repositorio de GitHub:
   - Si no aparece, click en **"Configure account"**
   - Selecciona tu repositorio: `app-compraventa`
   - Click en **"Connect"**

### 3.3 Configurar el Web Service

Completa el formulario con estos datos:

#### Información Básica:
- **Name:** `compraventa-backend` (o el nombre que prefieras)
- **Region:** Selecciona la más cercana (ejemplo: Oregon, Ohio)
- **Branch:** `main`
- **Root Directory:** `backend`
- **Runtime:** `Node`

#### Build & Deploy:
- **Build Command:**
  ```
  npm install && npm run build
  ```

- **Start Command:**
  ```
  npm start
  ```

#### Plan:
- Selecciona **"Free"** (gratis)

### 3.4 Configurar Variables de Entorno

Antes de hacer el deploy, necesitas agregar las variables de entorno:

1. Scroll down hasta **"Environment Variables"**
2. Click en **"Add Environment Variable"**
3. Agrega estas variables una por una:

#### Variable 1: MONGODB_URI
- **Key:** `MONGODB_URI`
- **Value:** La connection string de MongoDB Atlas que copiaste antes
  ```
  mongodb+srv://admin:TuPassword@cluster0.xxxxx.mongodb.net/compraventa?retryWrites=true&w=majority
  ```

#### Variable 2: JWT_SECRET
- **Key:** `JWT_SECRET`
- **Value:** El JWT secret que generaste antes
  ```
  a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
  ```

#### Variable 3: PORT
- **Key:** `PORT`
- **Value:** `5000`

#### Variable 4: NODE_ENV
- **Key:** `NODE_ENV`
- **Value:** `production`

### 3.5 Hacer el Deploy
1. Verifica que todas las variables estén correctas
2. Click en **"Create Web Service"**
3. Espera 3-5 minutos mientras Render:
   - Clona tu repositorio
   - Instala dependencias
   - Construye el proyecto
   - Inicia el servidor

### 3.6 Verificar que Funciona
1. Cuando termine, verás **"Live"** con un ✓ verde
2. Copia la URL que te da Render (ejemplo: `https://compraventa-backend.onrender.com`)
3. Abre esa URL en tu navegador
4. Deberías ver un JSON como este:
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

**✅ Si ves ese mensaje, ¡el backend está funcionando!**

---

## PASO 4: Conectar Frontend con Backend

Ahora que el backend está desplegado, necesitas conectar el frontend:

### 4.1 Agregar Variable de Entorno en Vercel
1. Ve a tu proyecto en Vercel
2. Click en **"Settings"**
3. Click en **"Environment Variables"**
4. Agrega una nueva variable:
   - **Key:** `VITE_API_URL`
   - **Value:** La URL de tu backend en Render + `/api`
   - Ejemplo: `https://compraventa-backend.onrender.com/api`
5. **Environments:** Marca las 3 opciones (Production, Preview, Development)
6. Click en **"Save"**

### 4.2 Redeploy el Frontend
1. Ve a **"Deployments"**
2. Click en los 3 puntos (...) del último deployment
3. Click en **"Redeploy"**
4. Espera 2-3 minutos

### 4.3 Probar la Aplicación
1. Abre la URL de Vercel
2. Presiona **Ctrl + Shift + R** (limpiar caché)
3. Intenta registrarte con:
   - Nombre: Admin Prueba
   - Email: admin@prueba.com
   - Password: admin123
   - Rol: Administrador
4. Click en **"Registrarse"**
5. **✅ Si te registra exitosamente, ¡TODO FUNCIONA!**

---

## 🆘 Solución de Problemas

### Problema 1: Build Failed en Render

**Error:** `npm ERR! code ELIFECYCLE`

**Solución:**
1. Ve a los logs del build en Render
2. Busca el error específico
3. Usualmente es por dependencias faltantes
4. Verifica que `package.json` tenga todas las dependencias

### Problema 2: Application Failed to Respond

**Error:** El servicio no responde

**Solución:**
1. Verifica que el **Start Command** sea: `npm start`
2. Verifica que el **PORT** en variables de entorno sea `5000`
3. Revisa los logs en Render para ver el error

### Problema 3: MongoDB Connection Error

**Error:** `MongoServerError: bad auth`

**Solución:**
1. Verifica que la contraseña en `MONGODB_URI` sea correcta
2. Verifica que el usuario tenga permisos de lectura/escritura
3. Verifica que `0.0.0.0/0` esté en Network Access

### Problema 4: Frontend No Se Conecta

**Error:** "Ruta no encontrada" en el frontend

**Solución:**
1. Verifica que `VITE_API_URL` en Vercel tenga `/api` al final
2. Verifica que la URL del backend sea correcta
3. Abre la consola del navegador (F12) y busca errores de CORS

---

## 📝 Resumen de URLs y Credenciales

Guarda esta información:

### MongoDB Atlas:
- **URL:** https://cloud.mongodb.com/
- **Usuario DB:** `admin` (o el que creaste)
- **Password DB:** `[tu contraseña]`
- **Connection String:** `mongodb+srv://...`

### Render:
- **URL Dashboard:** https://dashboard.render.com/
- **URL Backend:** `https://compraventa-backend.onrender.com`
- **JWT_SECRET:** `[tu jwt secret]`

### Vercel:
- **URL Dashboard:** https://vercel.com/dashboard
- **URL Frontend:** `https://tu-app.vercel.app`
- **VITE_API_URL:** `https://compraventa-backend.onrender.com/api`

---

## ✅ Checklist Final

Antes de terminar, verifica:

- [ ] MongoDB Atlas creado y configurado
- [ ] Usuario de base de datos creado
- [ ] Network Access configurado (0.0.0.0/0)
- [ ] Connection String copiada
- [ ] JWT Secret generado
- [ ] Backend desplegado en Render
- [ ] Variables de entorno configuradas en Render
- [ ] Backend respondiendo (URL abierta en navegador)
- [ ] Variable VITE_API_URL agregada en Vercel
- [ ] Frontend redeployado
- [ ] Registro de usuario funcionando

---

## 🎉 ¡Listo!

Si completaste todos los pasos, tu aplicación debería estar **100% funcional**:
- ✓ Frontend en Vercel
- ✓ Backend en Render
- ✓ Base de datos en MongoDB Atlas
- ✓ Todo conectado y funcionando

**¿Necesitas ayuda con algún paso? Dime en cuál estás y te ayudo.**
