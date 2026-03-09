# Sistema de Seguridad Mejorado

## 🔒 Cambios Implementados

### 1. Eliminación del Registro Público
- ❌ **ANTES**: Cualquier persona podía registrarse en `/register`
- ✅ **AHORA**: Solo el administrador puede crear nuevos usuarios

### 2. Control de Acceso por Roles

#### Administrador (admin)
- ✅ Acceso total a toda la aplicación
- ✅ Puede crear, editar y eliminar usuarios
- ✅ Puede gestionar vehículos, reportes, contratos
- ✅ Acceso a todas las funcionalidades

#### Vendedor (vendedor)
- ✅ Puede crear y editar vehículos
- ✅ Puede generar reportes
- ✅ Puede vender vehículos y generar contratos
- ❌ NO puede gestionar usuarios

#### Visualizador (visualizador)
- ✅ Solo puede ver información
- ❌ NO puede crear, editar o eliminar
- ❌ NO puede gestionar usuarios

## 📋 Configuración Inicial

### Paso 1: Crear el Primer Usuario Administrador

Ejecuta el script para crear el admin inicial:

```bash
# Opción 1: Usando el archivo batch (Windows)
crear-admin.bat

# Opción 2: Comando directo
cd backend
node scripts/crear-admin-inicial.js
```

**Credenciales por defecto:**
- Email: `admin@compraventa.com`
- Contraseña: `admin123`

⚠️ **IMPORTANTE**: Cambia esta contraseña después del primer login

### Paso 2: Iniciar Sesión como Administrador

1. Inicia la aplicación
2. Ve a la página de login
3. Ingresa las credenciales del admin
4. Cambia la contraseña por una segura

### Paso 3: Crear Usuarios Vendedores

Como administrador, ahora puedes crear usuarios:

1. Ve a la sección "Usuarios" en el menú
2. Click en "Crear Nuevo Usuario"
3. Llena el formulario:
   - Nombre completo
   - Email
   - Contraseña temporal
   - Rol (vendedor o visualizador)
4. El nuevo usuario recibirá sus credenciales

## 🔐 Flujo de Seguridad

### Para el Administrador

```
1. Login con credenciales de admin
   ↓
2. Acceso al panel de administración
   ↓
3. Crear usuarios vendedores/visualizadores
   ↓
4. Gestionar permisos y accesos
```

### Para Vendedores/Visualizadores

```
1. Recibir credenciales del administrador
   ↓
2. Login con email y contraseña
   ↓
3. Acceso limitado según rol
   ↓
4. Trabajar dentro de sus permisos
```

## 🛡️ Medidas de Seguridad

### Backend

1. **Ruta de Registro Eliminada**
   - `POST /api/auth/register` → ELIMINADA
   - Solo queda `POST /api/auth/login` como ruta pública

2. **Nueva Ruta Protegida**
   - `POST /api/auth/users/create` → Solo Admin
   - Requiere autenticación y rol de administrador

3. **Validaciones**
   - Verificación de email único
   - Validación de roles permitidos
   - Hash de contraseñas con bcrypt

### Frontend

1. **Página de Registro Eliminada**
   - Ya no existe la opción de "Registrarse"
   - Solo existe la página de Login

2. **Panel de Gestión de Usuarios**
   - Solo visible para administradores
   - Formulario para crear nuevos usuarios
   - Lista de usuarios con opciones de editar/eliminar

## 📝 Archivos Modificados

### Backend
- `backend/src/routes/auth.routes.ts` - Rutas actualizadas
- `backend/src/controllers/auth.controller.ts` - Nueva función createUser
- `backend/scripts/crear-admin-inicial.js` - Script para crear admin

### Frontend (Pendiente)
- `frontend/src/App.tsx` - Eliminar ruta de registro
- `frontend/src/pages/Users.tsx` - Nueva página de gestión (crear)
- `frontend/src/services/api.ts` - Agregar función createUser

## 🚀 Próximos Pasos

1. ✅ Backend completado
2. ⏳ Frontend en progreso:
   - Eliminar página de registro
   - Crear página de gestión de usuarios
   - Actualizar navegación

## 💡 Recomendaciones de Seguridad

1. **Contraseñas Fuertes**
   - Mínimo 8 caracteres
   - Combinar mayúsculas, minúsculas, números y símbolos

2. **Cambio de Contraseña Inicial**
   - Cambiar `admin123` inmediatamente después del primer login

3. **Gestión de Usuarios**
   - Desactivar usuarios en lugar de eliminarlos
   - Revisar periódicamente los accesos
   - Mantener un registro de quién tiene acceso

4. **Backup de Datos**
   - Hacer respaldos regulares de la base de datos
   - Incluir la colección de usuarios

## 🔧 Solución de Problemas

### No puedo crear el admin inicial
- Verifica que MongoDB esté corriendo
- Verifica la variable MONGODB_URI en .env
- Asegúrate de no tener ya un admin creado

### Olvidé la contraseña del admin
1. Detén la aplicación
2. Elimina el usuario admin de MongoDB
3. Ejecuta nuevamente `crear-admin.bat`
4. Usa las credenciales por defecto

### Un vendedor no puede acceder
- Verifica que el usuario esté activo
- Confirma que las credenciales sean correctas
- Revisa que el rol sea correcto

## 📞 Soporte

Si tienes problemas con el sistema de seguridad:
1. Revisa este documento
2. Verifica los logs del backend
3. Confirma que MongoDB esté corriendo
4. Verifica las variables de entorno

---

**Fecha de Implementación:** ${new Date().toLocaleDateString('es-CO')}
**Versión:** 2.0.0 - Sistema de Seguridad Mejorado
