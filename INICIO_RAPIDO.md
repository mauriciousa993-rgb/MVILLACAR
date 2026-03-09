# 🚀 INICIO RÁPIDO - Instrucciones Simples

## ✅ Pasos para Poner en Marcha tu Aplicación

### Paso 1: Instalar Dependencias

**Haz doble clic en estos archivos (en orden):**

1. **`instalar-backend.bat`** ⬅️ Primero este
   - Espera a que termine (2-3 minutos)
   - Verás "INSTALACION COMPLETADA EXITOSAMENTE!"

2. **`instalar-frontend.bat`** ⬅️ Luego este
   - Espera a que termine (2-3 minutos)
   - Verás "INSTALACION COMPLETADA EXITOSAMENTE!"

---

### Paso 2: Configurar MongoDB Atlas (Base de Datos)

#### 2.1 Crear Cuenta (5 minutos)
1. Ve a: **https://www.mongodb.com/cloud/atlas/register**
2. Regístrate con tu email o Google
3. Completa el formulario

#### 2.2 Crear Cluster GRATIS
1. Selecciona el plan **M0 FREE** (gratis para siempre)
2. Elige cualquier proveedor (AWS, Google Cloud o Azure)
3. Selecciona la región más cercana
4. Click en **"Create Cluster"**
5. Espera 3-5 minutos

#### 2.3 Crear Usuario de Base de Datos
1. En el menú lateral: **"Database Access"**
2. Click en **"Add New Database User"**
3. Crea un usuario:
   - Username: `admin`
   - Password: `admin123` (o la que prefieras)
   - Privileges: **"Read and write to any database"**
4. Click en **"Add User"**

#### 2.4 Permitir Acceso desde Cualquier IP
1. En el menú lateral: **"Network Access"**
2. Click en **"Add IP Address"**
3. Click en **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click en **"Confirm"**

#### 2.5 Obtener Connection String
1. Ve a **"Database"** en el menú lateral
2. Click en **"Connect"** en tu cluster
3. Selecciona **"Connect your application"**
4. Copia el connection string (se ve así):
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **IMPORTANTE:** Reemplaza `<password>` con tu contraseña (ej: `admin123`)

#### 2.6 Actualizar el archivo .env
1. Abre el archivo: **`backend/.env`**
2. Busca la línea que dice `MONGODB_URI=`
3. Pega tu connection string completo
4. Debe quedar así:
   ```env
   MONGODB_URI=mongodb+srv://admin:admin123@cluster0.xxxxx.mongodb.net/compraventa-vehiculos?retryWrites=true&w=majority
   ```
5. **Guarda el archivo** (Ctrl+S)

---

### Paso 3: Iniciar la Aplicación

**Haz doble clic en estos archivos (abre ambos):**

1. **`iniciar-backend.bat`** ⬅️ Primero este
   - Se abrirá una ventana negra
   - Espera a ver: "✅ MongoDB conectado exitosamente"
   - **NO CIERRES ESTA VENTANA**

2. **`iniciar-frontend.bat`** ⬅️ Luego este (en otra ventana)
   - Se abrirá otra ventana negra
   - Espera a ver: "Local: http://localhost:3000/"
   - **NO CIERRES ESTA VENTANA**

---

### Paso 4: Abrir en el Navegador

1. Abre tu navegador (Chrome, Firefox, Edge)
2. Ve a: **http://localhost:3000**
3. Deberías ver la pantalla de login

---

### Paso 5: Crear tu Primer Usuario

En la pantalla de login:
1. Click en **"Regístrate aquí"**
2. Completa el formulario:
   - Nombre: Tu nombre
   - Email: tu@email.com
   - Contraseña: (mínimo 6 caracteres)
   - Rol: **admin**
3. Click en **"Registrarse"**

---

### Paso 6: Iniciar Sesión

1. Ingresa tu email y contraseña
2. Click en **"Iniciar Sesión"**
3. **¡Listo!** Verás el Dashboard

---

## 🎉 ¡FELICIDADES! Tu aplicación está funcionando

Ahora puedes:
- ✅ Ver estadísticas en el dashboard
- ✅ Registrar vehículos
- ✅ Gestionar inventario
- ✅ Exportar reportes

---

## 🆘 Problemas Comunes

### ❌ Error: "Cannot connect to MongoDB"
**Solución:**
- Verifica que copiaste bien el connection string en `backend/.env`
- Verifica que reemplazaste `<password>` con tu contraseña real
- Verifica que permitiste acceso desde cualquier IP en MongoDB Atlas

### ❌ Error: "Port 5000 is already in use"
**Solución:**
- Cierra la ventana del backend
- Abre el archivo `backend/.env`
- Cambia `PORT=5000` a `PORT=5001`
- Vuelve a ejecutar `iniciar-backend.bat`

### ❌ La página no carga
**Solución:**
- Verifica que ambas ventanas (backend y frontend) estén abiertas
- Cierra ambas ventanas (Ctrl+C)
- Vuelve a ejecutar `iniciar-backend.bat` y `iniciar-frontend.bat`

### ❌ "npm no se reconoce como comando"
**Solución:**
- Node.js no está instalado correctamente
- Descarga e instala desde: https://nodejs.org/
- Durante la instalación, marca: ☑️ "Add to PATH"
- Reinicia tu computadora
- Vuelve a intentar

---

## 📝 Resumen de Archivos Importantes

| Archivo | Para qué sirve |
|---------|----------------|
| `instalar-backend.bat` | Instala dependencias del backend |
| `instalar-frontend.bat` | Instala dependencias del frontend |
| `iniciar-backend.bat` | Inicia el servidor backend |
| `iniciar-frontend.bat` | Inicia la aplicación frontend |
| `backend/.env` | Configuración (connection string de MongoDB) |

---

## 💡 Consejos

1. **Mantén ambas ventanas abiertas** mientras uses la aplicación
2. **No cierres las ventanas negras** (son los servidores)
3. **Guarda tu connection string** en un lugar seguro
4. **Haz backup** de tu base de datos regularmente

---

## 📞 ¿Necesitas Ayuda?

Si algo no funciona:
1. Lee esta guía nuevamente
2. Revisa los mensajes de error en las ventanas negras
3. Consulta el archivo `INSTALAR_DEPENDENCIAS.md`
4. Avísame y te ayudo

---

## ✅ Checklist Rápido

- [ ] Ejecutar `instalar-backend.bat`
- [ ] Ejecutar `instalar-frontend.bat`
- [ ] Crear cuenta en MongoDB Atlas
- [ ] Crear cluster M0 (gratis)
- [ ] Crear usuario de base de datos
- [ ] Permitir acceso desde cualquier IP
- [ ] Copiar connection string
- [ ] Actualizar `backend/.env` con connection string
- [ ] Ejecutar `iniciar-backend.bat`
- [ ] Ejecutar `iniciar-frontend.bat`
- [ ] Abrir http://localhost:3000
- [ ] Crear primer usuario
- [ ] Iniciar sesión
- [ ] ¡Disfrutar!

---

**¡Todo listo! Sigue estos pasos y en 15 minutos tendrás tu aplicación funcionando.** 🚗✨
