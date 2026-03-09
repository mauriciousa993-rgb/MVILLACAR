# Crear Admin en Render - Solución

## 🔍 El Problema

Tus datos están en MongoDB Atlas ✅
Render está conectado a MongoDB ✅
PERO: No tienes un usuario admin en producción para acceder ❌

## ✅ Solución: Crear Admin en Render

### Opción 1: Desde Render Shell (Recomendado)

**Paso 1: Ir a Render Shell**
1. Ve a https://dashboard.render.com
2. Click en tu servicio de backend
3. En el menú superior, busca "Shell" (icono de terminal)
4. Click en "Shell"

**Paso 2: Ejecutar el Script**
En la terminal que se abre, escribe:
```bash
node backend/scripts/crear-admin-inicial.js
```

**Paso 3: Verificar**
Deberías ver un mensaje como:
```
✅ Usuario admin creado exitosamente
Email: admin@compraventa.com
Password: admin123
```

### Opción 2: Usando la API Directamente

Si la Opción 1 no funciona, usa este comando desde tu computadora:

```bash
curl -X POST https://app-compraventa.onrender.com/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"nombre\":\"Administrador\",\"email\":\"admin@compraventa.com\",\"password\":\"admin123\",\"rol\":\"admin\"}"
```

**Nota:** Esto solo funcionará si la ruta de registro aún está activa. Después de crear el admin, se deshabilitará automáticamente.

### Opción 3: Crear Admin Manualmente en MongoDB Atlas

Si las opciones anteriores no funcionan:

**Paso 1: Ir a MongoDB Atlas**
1. Ve a https://cloud.mongodb.com
2. Click en "Browse Collections"
3. Busca la base de datos "compraventa"
4. Click en la colección "users"

**Paso 2: Insertar Admin**
Click en "Insert Document" y pega esto:

```json
{
  "nombre": "Administrador",
  "email": "admin@compraventa.com",
  "password": "$2b$10$YourHashedPasswordHere",
  "rol": "admin",
  "activo": true,
  "createdAt": {"$date": "2024-01-01T00:00:00.000Z"},
  "updatedAt": {"$date": "2024-01-01T00:00:00.000Z"}
}
```

**Nota:** El password debe estar hasheado con bcrypt. Es más fácil usar las Opciones 1 o 2.

## 🎯 Después de Crear el Admin

### 1. Configurar Vercel

Ahora que tienes el backend funcionando, configura el frontend:

1. Ve a https://vercel.com/dashboard
2. Click en tu proyecto → Settings → Environment Variables
3. Agrega:
   - Name: `VITE_API_URL`
   - Value: `https://app-compraventa.onrender.com`
   - Environments: Production, Preview, Development
4. Save y Redeploy

### 2. Acceder a la Aplicación

1. Abre tu app en Vercel
2. Login con:
   - Email: `admin@compraventa.com`
   - Password: `admin123`
3. ¡Deberías ver toda tu información!

## 🔐 Seguridad

**Cambiar la contraseña del admin:**

Una vez que hayas iniciado sesión, es recomendable cambiar la contraseña por una más segura.

## ✅ Verificar que Todo Funciona

### 1. Probar el Backend

```bash
curl https://app-compraventa.onrender.com/
```

Deberías ver:
```json
{
  "message": "API de Compraventa de Vehículos",
  "version": "1.0.0"
}
```

### 2. Probar Login

```bash
curl -X POST https://app-compraventa.onrender.com/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@compraventa.com\",\"password\":\"admin123\"}"
```

Deberías recibir un token.

### 3. Probar Estadísticas

Usa el token del paso anterior:

```bash
curl https://app-compraventa.onrender.com/api/vehicles/statistics ^
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

Deberías ver tus estadísticas.

## 🚨 Si Aún No Ves Tus Datos

### Verificar la Base de Datos

1. Ve a MongoDB Atlas
2. Click en "Browse Collections"
3. Verifica que existan las colecciones:
   - `users`
   - `vehicles`
4. Verifica que haya datos en `vehicles`

### Verificar Logs de Render

1. Ve a Render Dashboard → Tu servicio
2. Click en "Logs"
3. Busca errores de conexión a MongoDB
4. Deberías ver: "MongoDB conectado exitosamente"

## 📋 Checklist

- [ ] Ir a Render Dashboard → Shell
- [ ] Ejecutar: `node backend/scripts/crear-admin-inicial.js`
- [ ] Verificar que se creó el admin
- [ ] Configurar `VITE_API_URL` en Vercel
- [ ] Redeploy en Vercel
- [ ] Abrir la app y hacer login
- [ ] Verificar que aparecen tus datos

---

**Resumen:** Tu información está segura en MongoDB. Solo necesitas crear un usuario admin en producción para acceder a ella.
