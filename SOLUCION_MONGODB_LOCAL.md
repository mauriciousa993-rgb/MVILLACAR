# 🔧 SOLUCIÓN: Usar MongoDB Local

## ⚠️ Problema Actual

Tu red está bloqueando las consultas DNS SRV necesarias para MongoDB Atlas:
```
Error: querySrv ECONNREFUSED _mongodb._tcp.mvillacar.1uocybr.mongodb.net
```

Esto es común en redes corporativas, ciertos routers o configuraciones de firewall.

## ✅ SOLUCIÓN RÁPIDA: MongoDB Local

En lugar de luchar con la configuración de red, usaremos MongoDB instalado localmente en tu computadora.

---

## 📥 PASO 1: Instalar MongoDB Community Edition

### Opción A: Descarga Directa (RECOMENDADO)

1. Ve a: https://www.mongodb.com/try/download/community
2. Selecciona:
   - **Version:** 7.0.x (Current)
   - **Platform:** Windows
   - **Package:** MSI
3. Click en **"Download"**
4. Ejecuta el instalador descargado
5. Durante la instalación:
   - ✅ Marca "Install MongoDB as a Service"
   - ✅ Marca "Install MongoDB Compass" (opcional, es una GUI)
   - ✅ Usa la configuración por defecto
6. Click en "Install" y espera a que termine

### Opción B: Usando Chocolatey (Si lo tienes instalado)

```bash
choco install mongodb
```

---

## 🚀 PASO 2: Verificar que MongoDB está Corriendo

Abre una nueva terminal y ejecuta:

```bash
mongod --version
```

Deberías ver algo como:
```
db version v7.0.x
```

---

## ⚙️ PASO 3: Actualizar Configuración del Backend

Ejecuta este script que creé para ti:

```bash
.\configurar-mongodb-local.bat
```

O manualmente, edita `backend/.env` y cambia la línea de MONGODB_URI a:

```env
MONGODB_URI=mongodb://localhost:27017/compraventa-vehiculos
```

---

## 🔄 PASO 4: Reiniciar el Backend

```bash
.\reiniciar-backend.bat
```

Deberías ver:
```
✅ MongoDB conectado exitosamente
🚀 Servidor corriendo en puerto 5000
```

---

## ✅ PASO 5: Probar Crear Vehículo

1. Abre: http://localhost:5173
2. Ve a "Vehículos" → "Nuevo Vehículo"
3. Llena el formulario (VIN y Color son opcionales ahora)
4. Click en "Guardar Vehículo"
5. ¡Debería funcionar! ✅

---

## 🎯 VENTAJAS DE MONGODB LOCAL

✅ **No depende de internet**
✅ **Más rápido** (sin latencia de red)
✅ **Sin problemas de DNS**
✅ **Perfecto para desarrollo**
✅ **Gratis e ilimitado**

---

## 🔄 CAMBIAR ENTRE LOCAL Y ATLAS

### Para usar MongoDB Local:
```env
MONGODB_URI=mongodb://localhost:27017/compraventa-vehiculos
```

### Para usar MongoDB Atlas (cuando funcione):
```env
MONGODB_URI=mongodb+srv://mvillacar:mvillacar123@mvillacar.1uocybr.mongodb.net/compraventa-vehiculos?retryWrites=true&w=majority
```

---

## 📊 Ver tus Datos

### Opción 1: MongoDB Compass (GUI)
1. Abre MongoDB Compass
2. Conecta a: `mongodb://localhost:27017`
3. Selecciona la base de datos: `compraventa-vehiculos`
4. Explora tus colecciones: `vehicles`, `users`

### Opción 2: Línea de Comandos
```bash
mongosh
use compraventa-vehiculos
db.vehicles.find()
```

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### "mongod no se reconoce como comando"

MongoDB no está en el PATH. Agrega manualmente:
```
C:\Program Files\MongoDB\Server\7.0\bin
```

### "Error: connect ECONNREFUSED 127.0.0.1:27017"

MongoDB no está corriendo. Inícialo:
```bash
net start MongoDB
```

O manualmente:
```bash
mongod --dbpath C:\data\db
```

### "Error: Data directory not found"

Crea el directorio de datos:
```bash
mkdir C:\data\db
```

---

## 🎉 SIGUIENTE PASO

Una vez que MongoDB local esté funcionando, podrás:
- ✅ Crear vehículos sin VIN ni Color
- ✅ Ver todos tus vehículos
- ✅ Editar y eliminar vehículos
- ✅ Usar todas las funcionalidades de la app

---

**Fecha:** ${new Date().toLocaleDateString('es-CO')}
**Recomendación:** Usa MongoDB local para desarrollo, MongoDB Atlas para producción
