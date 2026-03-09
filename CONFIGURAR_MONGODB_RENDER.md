# 🔧 CONFIGURAR MONGODB EN RENDER

## 🎯 Objetivo

Configurar la variable de entorno `MONGODB_URI` en Render para que tu backend pueda conectarse a MongoDB Atlas.

---

## 📋 PASO 1: Obtener Connection String de MongoDB Atlas

Ya tienes el connection string:
```
mongodb+srv://mvillacar:villacar123@mvillacar.1uocybr.mongodb.net/?retryWrites=true&w=majority&appName=mvillacar
```

Pero necesitamos agregar el nombre de la base de datos. El formato correcto es:
```
mongodb+srv://mvillacar:villacar123@mvillacar.1uocybr.mongodb.net/compraventa-vehiculos?retryWrites=true&w=majority&appName=mvillacar
```

**Nota:** Se agregó `/compraventa-vehiculos` antes del `?`

---

## 🚀 PASO 2: Configurar en Render

### 2.1 Ir a Render Dashboard
1. Ve a: https://dashboard.render.com/
2. Inicia sesión con tu cuenta

### 2.2 Seleccionar tu Backend
1. En el dashboard, busca tu servicio del backend
2. Debería llamarse algo como: `compraventa-backend` o similar
3. Click en el nombre del servicio

### 2.3 Ir a Environment Variables
1. En el menú izquierdo, click en **"Environment"**
2. Verás la lista de variables de entorno actuales

### 2.4 Actualizar MONGODB_URI

**Opción A: Si ya existe la variable**
1. Busca `MONGODB_URI` en la lista
2. Click en el icono de **editar** (lápiz)
3. Reemplaza el valor con:
   ```
   mongodb+srv://mvillacar:villacar123@mvillacar.1uocybr.mongodb.net/compraventa-vehiculos?retryWrites=true&w=majority&appName=mvillacar
   ```
4. Click en **"Save Changes"**

**Opción B: Si NO existe la variable**
1. Click en **"Add Environment Variable"**
2. **Key:** `MONGODB_URI`
3. **Value:**
   ```
   mongodb+srv://mvillacar:villacar123@mvillacar.1uocybr.mongodb.net/compraventa-vehiculos?retryWrites=true&w=majority&appName=mvillacar
   ```
4. Click en **"Save Changes"**

### 2.5 Redeploy Automático
- Render automáticamente hará redeploy cuando guardes los cambios
- Espera 2-3 minutos mientras se redeploya

---

## ✅ PASO 3: Verificar que Funciona

### 3.1 Ver los Logs
1. En Render, ve a la pestaña **"Logs"**
2. Busca este mensaje:
   ```
   ✅ MongoDB conectado exitosamente
   🚀 Servidor corriendo en puerto 5000
   ```
3. Si ves ese mensaje, ¡funciona!

### 3.2 Probar desde el Navegador
1. Abre la URL de tu backend en Render
2. Ejemplo: `https://compraventa-backend.onrender.com`
3. Deberías ver un JSON con información de la API

### 3.3 Probar el Login
1. Ve a tu app en Vercel: `https://app-compraventa.vercel.app`
2. Presiona **Ctrl + Shift + R** (limpiar caché)
3. Intenta registrarte:
   - Nombre: Admin
   - Email: admin@test.com
   - Password: admin123
4. Si te registra, ¡TODO FUNCIONA! ✅

---

## ⚠️ IMPORTANTE: Problema de DNS

Si después de configurar sigues viendo el error:
```
Error: querySrv ECONNREFUSED _mongodb._tcp.mvillacar.1uocybr.mongodb.net
```

Esto significa que **Render tampoco puede resolver el DNS SRV** de MongoDB Atlas.

### Solución Alternativa: Usar Connection String Estándar

1. Ve a MongoDB Atlas
2. Al obtener el connection string, busca la opción:
   - **"I have MongoDB 4.2 or earlier"**
   - O **"Standard connection string"**
3. Copia ese connection string (será más largo)
4. Úsalo en lugar del formato `mongodb+srv://`

El formato estándar se ve así:
```
mongodb://mvillacar:villacar123@mvillacar-shard-00-00.1uocybr.mongodb.net:27017,mvillacar-shard-00-01.1uocybr.mongodb.net:27017,mvillacar-shard-00-02.1uocybr.mongodb.net:27017/compraventa-vehiculos?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority
```

---

## 🔄 ALTERNATIVA: Usar MongoDB Atlas Serverless

Si el problema persiste, considera usar MongoDB Atlas Serverless:

1. En MongoDB Atlas, crea un nuevo cluster **Serverless**
2. Estos tienen mejor compatibilidad con servicios como Render
3. Obtén el nuevo connection string
4. Actualiza en Render

---

## 📞 Checklist

Antes de continuar, verifica:

- [ ] Connection string tiene `/compraventa-vehiculos` antes del `?`
- [ ] Variable `MONGODB_URI` está configurada en Render
- [ ] Render hizo redeploy automáticamente
- [ ] Los logs muestran "MongoDB conectado exitosamente"
- [ ] Puedes registrarte en la app de Vercel

---

## 🎯 Siguiente Paso

Una vez que MongoDB esté conectado en Render:

1. Ve a: `https://app-compraventa.vercel.app`
2. Regístrate con una cuenta nueva
3. Inicia sesión
4. Ve a "Vehículos" → "Nuevo Vehículo"
5. **Crea un vehículo SIN VIN ni Color** (para probar la solución)
6. ¡Debería funcionar! ✅

---

**Fecha:** ${new Date().toLocaleDateString('es-CO')}
**Estado:** Esperando configuración en Render
