# ⚡ INICIO RÁPIDO - Desplegar Backend en 10 Minutos

## 🎯 Resumen Ultra Rápido

Sigue estos pasos en orden:

### 1️⃣ MongoDB Atlas (3 minutos)
1. Ve a: https://www.mongodb.com/cloud/atlas/register
2. Regístrate (usa Google para más rápido)
3. Click en **"Build a Database"** → **"M0 FREE"** → **"Create"**
4. **Database Access** → **"Add New Database User"**:
   - Username: `admin`
   - Password: Click "Autogenerate" y **COPIA LA CONTRASEÑA**
5. **Network Access** → **"Add IP Address"** → **"Allow Access from Anywhere"**
6. **Database** → **"Connect"** → **"Connect your application"**
7. Copia la URL y reemplaza `<password>` con tu contraseña
8. Agrega `/compraventa` antes del `?`:
   ```
   mongodb+srv://admin:TU_PASSWORD@cluster0.xxxxx.mongodb.net/compraventa?retryWrites=true&w=majority
   ```

### 2️⃣ JWT Secret (30 segundos)
1. Ve a: https://www.uuidgenerator.net/
2. Copia el UUID generado
3. O usa: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0`

### 3️⃣ Render (5 minutos)
1. Ve a: https://render.com/
2. Regístrate con GitHub
3. **New +** → **Web Service**
4. Conecta tu repositorio `app-compraventa`
5. Configura:
   - **Name:** `compraventa-backend`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free

6. **Environment Variables** (agrega estas 4):
   ```
   MONGODB_URI = [tu connection string de MongoDB]
   JWT_SECRET = [tu UUID o clave generada]
   PORT = 5000
   NODE_ENV = production
   ```

7. Click en **"Create Web Service"**
8. Espera 3-5 minutos

### 4️⃣ Conectar Frontend (2 minutos)
1. Cuando Render termine, copia la URL (ejemplo: `https://compraventa-backend.onrender.com`)
2. Ve a Vercel → tu proyecto → **Settings** → **Environment Variables**
3. Agrega:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://compraventa-backend.onrender.com/api`
4. **Deployments** → **Redeploy**

### 5️⃣ Probar (1 minuto)
1. Abre tu app en Vercel
2. Presiona **Ctrl + Shift + R**
3. Regístrate con:
   - Email: admin@prueba.com
   - Password: admin123
4. ✅ ¡Debería funcionar!

---

## 📋 Checklist Rápido

- [ ] MongoDB Atlas creado
- [ ] Usuario y password de DB guardados
- [ ] Connection String copiada
- [ ] JWT Secret generado
- [ ] Render configurado con 4 variables
- [ ] Backend desplegado (Live ✓)
- [ ] VITE_API_URL agregada en Vercel
- [ ] Frontend redeployado
- [ ] Registro funcionando

---

## 🆘 Si Algo Falla

Abre el archivo **DESPLEGAR_BACKEND_RENDER.md** para la guía completa con solución de problemas.

---

**Tiempo total estimado: 10-15 minutos**

¡Vamos! 🚀
