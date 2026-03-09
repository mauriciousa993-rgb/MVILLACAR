# 🔧 GUÍA DE SOLUCIÓN DE PROBLEMAS DE DESPLIEGUE

## ❌ Error: 404 NOT_FOUND - DEPLOYMENT_NOT_FOUND

Este error significa que la aplicación **no ha sido desplegada todavía** en Vercel.

---

## 🔍 DIAGNOSTICO: ¿Qué pasos ya completaste?

Responde SÍ o NO a cada pregunta:

### 1. ¿Creaste MongoDB Atlas?
- [ ] SÍ - Tengo mi MONGODB_URI
- [ ] NO - Necesito crear cuenta

### 2. ¿Subiste tu código a GitHub?
```bash
git init
git add .
git commit -m "versión inicial"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/app-compraventa.git
git push -u origin main
```
- [ ] SÍ - Mi código está en GitHub
- [ ] NO - Necesito hacer esto

### 3. ¿Desplegaste el Backend en Render?
- [ ] SÍ - Mi backend está en Render (tengo URL como https://compraventa-backend.onrender.com)
- [ ] NO - Necesito desplegar

### 4. ¿Desplegaste el Frontend en Vercel?
- [ ] SÍ - Vercel tiene mi proyecto
- [ ] NO - Necesito desplegar

### 5. ¿Configuraste Variables de Entorno?
- [ ] SÍ - VITE_API_URL está configurado en Vercel
- [ ] NO - Necesito agregar variables

---

## ⚡ SOLUCIÓN RÁPIDA (Si NO hiciste nada aún)

### Paso 1: Prepara tu Código (2 min)
```bash
# En la carpeta raíz del proyecto
git init
git add .
git commit -m "Versión inicial"
git branch -M main
```

### Paso 2: Crea Repositorio en GitHub (2 min)
1. Ve a https://github.com/new
2. Nombre: `app-compraventa`
3. Privado
4. Create repository
5. Copia los comandos que te aparecen y ejecuta:
```bash
git remote add origin https://github.com/TU_USUARIO/app-compraventa.git
git push -u origin main
```

### Paso 3: Crea MongoDB Atlas (5 min)
1. Ve a https://mongodb.com/cloud/atlas
2. Sign up
3. Create Cluster
4. Copia tu connection string (mongodb+srv://...)

### Paso 4: Deploy Backend en Render (5 min)
1. Ve a https://render.com
2. Sign up con GitHub
3. New Web Service
4. Selecciona: `app-compraventa`
5. Configura:
   - Build: `cd backend && npm install && npm run build`
   - Start: `cd backend && npm start`
6. Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=genera_uno_seguro
   NODE_ENV=production
   ```
7. Deploy
8. Espera 10 min, copia la URL (ej: https://compraventa-backend.onrender.com)

### Paso 5: Deploy Frontend en Vercel (5 min)
1. Ve a https://vercel.com
2. Sign up con GitHub
3. Import Project
4. Selecciona: `app-compraventa`
5. Configura:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build: `npm run build`
   - Output: `dist`
6. Environment Variables:
   ```
   VITE_API_URL=https://compraventa-backend.onrender.com/api
   ```
7. Deploy
8. ¡LISTO!

---

## 🔍 Si ya intentaste desplegar y falla:

### ❌ Error: Build fails en Render
**Solución:**
```bash
# Asegúrate que tu package.json en backend tiene:
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

### ❌ Error: Cannot find module 'express'
**Solución:** Las dependencias no se instalaron
```bash
# En backend/:
npm install
```

### ❌ Error: CORS Error en Vercel
**Solución:** VITE_API_URL no apunta a tu Render correcto
- En Vercel Settings → Environment Variables
- Verifica que VITE_API_URL sea: `https://tu-backend.onrender.com/api`

### ❌ Error: Cannot connect MongoDB
**Solución:**
1. En MongoDB Atlas → Security → Network Access
2. Agregar: `0.0.0.0/0` (permite todas las IPs)
3. Verifica credenciales en MONGODB_URI

### ❌ Error: Blank page en Vercel
**Solución:**
1. Abre F12 (Developer Tools)
2. Busca errores rojos en consola
3. Revisa si API_URL es correcto
4. Revisa logs en Render

---

## 📊 Checklist de Verificación

```
[ ] Tengo MongoDB Atlas funcionando
[ ] Mi código está en GitHub
[ ] Backend está en Render (con URL funcionando)
[ ] Frontend está en Vercel (con URL)
[ ] VITE_API_URL apunta a Render
[ ] No hay errores en F12 del navegador
[ ] Puedo hacer login en https://compraventa-vehiculos.vercel.app
```

---

## 🆘 Si NADA de esto funciona:

1. **Escribe exactamente qué error ves** (screenshot ayuda)
2. **Revisa los logs:**
   - Render: Dashboard → Logs
   - Vercel: Dashboard → Deployments → View logs
3. **Verifica variables de entorno:**
   - Render: Settings → Environment
   - Vercel: Settings → Environment Variables

---

## 💡 Importante

**La URL `compraventa-vehiculos.vercel.app` solo funciona si:**
1. ✅ Importaste el proyecto a Vercel
2. ✅ Configuraste Environment Variables
3. ✅ El Build completó sin errores
4. ✅ Vercel muestra "Ready"

Si ves "404 NOT_FOUND", no ha sido desplegado aún.

---

**¿Cuál es el primer paso que necesitas completar?**
1. MongoDB Atlas
2. GitHub
3. Render
4. Vercel

Avísame y te guío paso a paso. 🚀
