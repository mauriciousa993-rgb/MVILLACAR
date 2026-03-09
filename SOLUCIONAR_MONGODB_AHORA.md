# 🔧 SOLUCIONAR MONGODB ATLAS - PASO A PASO

## 🎯 Problema Actual

El error muestra:
```
❌ Error: querySrv ECONNREFUSED _mongodb._tcp.mvillacar.1uocybr.mongodb.net
```

Esto significa que MongoDB Atlas no está accesible. Vamos a solucionarlo.

---

## ✅ SOLUCIÓN RÁPIDA (5 MINUTOS)

### **Paso 1: Verificar MongoDB Atlas**

1. Ve a: https://cloud.mongodb.com
2. Inicia sesión con tu cuenta
3. Verifica que tu cluster **"mvillacar"** esté en estado **"Active"** (verde)
   - Si dice "Paused" o "Stopped", haz click en "Resume"
   - Si no existe, necesitas crear uno nuevo

---

### **Paso 2: Configurar Network Access (CRÍTICO)**

1. En MongoDB Atlas, ve al menú izquierdo
2. Click en **"Network Access"**
3. Verifica si hay alguna IP en la lista
4. Si NO hay ninguna IP o solo hay IPs específicas:
   - Click en **"Add IP Address"**
   - Click en **"Allow Access from Anywhere"**
   - Verás que se agrega: `0.0.0.0/0`
   - Click en **"Confirm"**
   - **Espera 1-2 minutos** para que se aplique

⚠️ **ESTE ES EL PASO MÁS IMPORTANTE** - Sin esto, no funcionará

---

### **Paso 3: Verificar Usuario de Base de Datos**

1. En MongoDB Atlas, ve a **"Database Access"**
2. Verifica que existe el usuario: **mvillacar**
3. Si NO existe:
   - Click en **"Add New Database User"**
   - Username: `mvillacar`
   - Password: `mvillacar123` (sin caracteres especiales)
   - Privileges: **"Atlas admin"**
   - Click en **"Add User"**

---

### **Paso 4: Obtener el Connection String Correcto**

1. Ve a **"Database"** en el menú izquierdo
2. En tu cluster, click en **"Connect"**
3. Selecciona **"Connect your application"**
4. **COPIA** el connection string completo

Debería verse así:
```
mongodb+srv://mvillacar:<password>@mvillacar.1uocybr.mongodb.net/?retryWrites=true&w=majority
```

---

### **Paso 5: Actualizar el archivo .env**

1. Abre el archivo: `backend/.env`
2. Busca la línea que dice `MONGODB_URI=`
3. Reemplázala con tu connection string, pero:
   - Cambia `<password>` por `mvillacar123`
   - Agrega `/compraventa-vehiculos` antes del `?`

Ejemplo final:
```env
MONGODB_URI=mongodb+srv://mvillacar:mvillacar123@mvillacar.1uocybr.mongodb.net/compraventa-vehiculos?retryWrites=true&w=majority
```

4. **GUARDA** el archivo (Ctrl + S)

---

### **Paso 6: Reiniciar el Backend**

1. Cierra la terminal actual del backend (Ctrl + C)
2. Ejecuta:
```bash
.\reiniciar-backend.bat
```

3. Deberías ver:
```
✅ MongoDB conectado exitosamente
🚀 Servidor corriendo en puerto 5000
```

---

## 🔍 VERIFICAR QUE FUNCIONA

Ejecuta este comando para probar la conexión:
```bash
.\test-conexion-mongodb-v2.bat
```

Si ves **"✅ Conexión exitosa"**, ¡todo está bien!

---

## ❌ SI AÚN NO FUNCIONA

### **Opción A: Usar Connection String Alternativo**

Si el formato `mongodb+srv://` no funciona, prueba con el formato directo:

1. En MongoDB Atlas, al obtener el connection string
2. Selecciona **"I have MongoDB 4.2 or earlier"**
3. Copia ese connection string (será más largo)
4. Úsalo en tu `.env`

### **Opción B: Crear un Nuevo Cluster**

Si tu cluster está dañado o pausado:

1. En MongoDB Atlas, elimina el cluster actual
2. Crea uno nuevo:
   - Click en **"Build a Database"**
   - Selecciona **"M0 FREE"**
   - Region: **N. Virginia (us-east-1)** o la más cercana
   - Cluster Name: `mvillacar`
3. Sigue los pasos 2-6 de arriba

### **Opción C: Usar MongoDB Local**

Si MongoDB Atlas sigue sin funcionar, puedes usar MongoDB local:

1. Instala MongoDB Community Edition
2. En `backend/.env` cambia a:
```env
MONGODB_URI=mongodb://localhost:27017/compraventa-vehiculos
```
3. Ejecuta:
```bash
.\iniciar-mongodb-local.bat
```

---

## 📞 CHECKLIST FINAL

Antes de continuar, verifica que:

- [ ] Tu cluster en Atlas está **"Active"** (verde)
- [ ] Network Access tiene `0.0.0.0/0` configurado
- [ ] El usuario `mvillacar` existe con contraseña `mvillacar123`
- [ ] El archivo `backend/.env` tiene el connection string correcto
- [ ] Esperaste 1-2 minutos después de configurar Network Access
- [ ] Reiniciaste el backend después de cambiar `.env`

---

## 🎯 SIGUIENTE PASO

Una vez que veas **"✅ MongoDB conectado exitosamente"**, avísame y continuaremos con las pruebas de creación de vehículos.

---

**Fecha:** ${new Date().toLocaleDateString('es-CO')}
**Estado:** Esperando configuración de MongoDB Atlas
