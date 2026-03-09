# 🚀 Guía de Inicio Rápido

Esta guía te llevará paso a paso para poner en marcha tu sistema de gestión de compraventa de vehículos.

## ✅ Paso 1: Verificar Requisitos

Abre una terminal y verifica que tienes Node.js instalado:

```bash
node --version
```

Deberías ver algo como `v24.13.0` o superior.

## ✅ Paso 2: Configurar MongoDB Atlas (Base de Datos en la Nube - GRATIS)

### 2.1 Crear Cuenta
1. Ve a: https://www.mongodb.com/cloud/atlas/register
2. Regístrate con tu email o cuenta de Google
3. Completa el formulario de registro

### 2.2 Crear Cluster
1. Selecciona el plan **M0 FREE** (gratis para siempre)
2. Elige el proveedor de nube (AWS, Google Cloud o Azure)
3. Selecciona la región más cercana a ti
4. Dale un nombre a tu cluster (ej: "Cluster0")
5. Click en **"Create Cluster"**
6. Espera 3-5 minutos mientras se crea

### 2.3 Configurar Acceso
1. En el menú lateral, ve a **"Database Access"**
2. Click en **"Add New Database User"**
3. Crea un usuario:
   - Username: `admin`
   - Password: `admin123` (o la que prefieras)
   - Database User Privileges: **"Read and write to any database"**
4. Click en **"Add User"**

### 2.4 Configurar Red
1. En el menú lateral, ve a **"Network Access"**
2. Click en **"Add IP Address"**
3. Click en **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click en **"Confirm"**

### 2.5 Obtener Connection String
1. Ve a **"Database"** en el menú lateral
2. Click en **"Connect"** en tu cluster
3. Selecciona **"Connect your application"**
4. Copia el connection string, se verá así:
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **IMPORTANTE**: Reemplaza `<password>` con tu contraseña real (ej: `admin123`)

## ✅ Paso 3: Instalar Dependencias del Backend

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
cd backend
npm install
```

Espera a que se instalen todas las dependencias (puede tomar 2-3 minutos).

## ✅ Paso 4: Configurar Variables de Entorno del Backend

1. En la carpeta `backend`, copia el archivo `.env.example`:
   ```bash
   copy .env.example .env
   ```
   (En Mac/Linux usa `cp` en lugar de `copy`)

2. Abre el archivo `.env` con un editor de texto

3. Pega tu connection string de MongoDB:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://admin:admin123@cluster0.xxxxx.mongodb.net/compraventa-vehiculos?retryWrites=true&w=majority
   JWT_SECRET=mi_clave_super_secreta_12345
   NODE_ENV=development
   ```

4. Guarda el archivo

## ✅ Paso 5: Instalar Dependencias del Frontend

Abre una **NUEVA terminal** (deja la anterior abierta) y ejecuta:

```bash
cd frontend
npm install
```

Espera a que se instalen todas las dependencias (puede tomar 2-3 minutos).

## ✅ Paso 6: Iniciar el Backend

En la primera terminal (carpeta `backend`), ejecuta:

```bash
npm run dev
```

Deberías ver:
```
✅ MongoDB conectado exitosamente
🚀 Servidor corriendo en puerto 5000
📍 URL: http://localhost:5000
```

**¡Deja esta terminal abierta!**

## ✅ Paso 7: Iniciar el Frontend

En la segunda terminal (carpeta `frontend`), ejecuta:

```bash
npm run dev
```

Deberías ver:
```
  VITE v5.0.11  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

**¡Deja esta terminal abierta también!**

## ✅ Paso 8: Abrir la Aplicación

1. Abre tu navegador (Chrome, Firefox, Edge, etc.)
2. Ve a: http://localhost:3000
3. Deberías ver la pantalla de inicio de sesión

## ✅ Paso 9: Crear tu Primer Usuario

### Opción A: Desde el Navegador
1. En la pantalla de login, click en **"Regístrate aquí"**
2. Completa el formulario:
   - Nombre: Tu nombre
   - Email: tu@email.com
   - Contraseña: (mínimo 6 caracteres)
   - Rol: admin
3. Click en **"Registrarse"**

### Opción B: Usando Postman o Thunder Client
```
POST http://localhost:5000/api/auth/register

Body (JSON):
{
  "nombre": "Administrador",
  "email": "admin@compraventa.com",
  "password": "admin123",
  "rol": "admin"
}
```

## ✅ Paso 10: Iniciar Sesión

1. Ingresa tu email y contraseña
2. Click en **"Iniciar Sesión"**
3. ¡Listo! Deberías ver el Dashboard

## 🎉 ¡Felicidades! Tu aplicación está funcionando

Ahora puedes:
- ✅ Ver el dashboard con estadísticas
- ✅ Registrar vehículos
- ✅ Subir fotos
- ✅ Gestionar documentación
- ✅ Exportar reportes a Excel
- ✅ Crear más usuarios

## 📝 Próximos Pasos

### Registrar tu Primer Vehículo
1. Click en **"+ Nuevo Vehículo"** en el dashboard
2. Completa los datos básicos
3. Marca el checklist
4. Sube fotos
5. Guarda

### Crear Más Usuarios
1. Ve a **"Usuarios"** en el menú (solo admin)
2. Click en **"Nuevo Usuario"**
3. Asigna roles según necesites:
   - **Admin**: Control total
   - **Vendedor**: Puede registrar y editar vehículos
   - **Visualizador**: Solo puede ver

## 🆘 Problemas Comunes

### ❌ Error: "Cannot connect to MongoDB"
**Solución:**
- Verifica que copiaste bien el connection string
- Verifica que reemplazaste `<password>` con tu contraseña real
- Verifica que agregaste tu IP en Network Access de MongoDB Atlas

### ❌ Error: "Port 5000 is already in use"
**Solución:**
- Cambia el puerto en el archivo `.env` del backend:
  ```env
  PORT=5001
  ```
- Reinicia el backend

### ❌ Error: "Cannot GET /"
**Solución:**
- Asegúrate de estar accediendo a http://localhost:3000 (frontend)
- No a http://localhost:5000 (backend)

### ❌ La página no carga
**Solución:**
- Verifica que ambas terminales (backend y frontend) estén corriendo
- Presiona Ctrl+C en ambas terminales y vuelve a ejecutar `npm run dev`

### ❌ Errores de TypeScript en VSCode
**Solución:**
- Estos errores son normales antes de instalar las dependencias
- Desaparecerán después de ejecutar `npm install`
- Si persisten, cierra y vuelve a abrir VSCode

## 💡 Consejos

1. **Mantén ambas terminales abiertas** mientras uses la aplicación
2. **Guarda tu connection string** de MongoDB en un lugar seguro
3. **Haz backups** de tu base de datos regularmente
4. **Cambia el JWT_SECRET** a algo más seguro en producción

## 📞 ¿Necesitas Ayuda?

Si tienes problemas:
1. Revisa esta guía nuevamente
2. Verifica los logs en las terminales
3. Consulta el archivo README.md principal
4. Abre un issue en el repositorio

## 🎯 Siguiente Nivel

Una vez que domines lo básico, puedes:
- Personalizar los colores en `frontend/tailwind.config.js`
- Agregar más campos al modelo de vehículos
- Crear reportes personalizados
- Integrar con servicios de terceros

---

**¡Disfruta tu nuevo sistema de gestión de vehículos!** 🚗✨
