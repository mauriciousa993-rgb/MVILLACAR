# 🚀 CÓMO USAR LA APLICACIÓN

## ✅ La aplicación ya está funcionando en: http://localhost:3000

---

## 📝 PASO A PASO PARA EMPEZAR:

### 1️⃣ CREAR TU PRIMERA CUENTA

Cuando abras http://localhost:3000 verás la página de Login.

**Para registrarte:**
1. Haz click en **"Regístrate aquí"** (abajo del formulario de login)
2. Llena el formulario:
   - **Nombre Completo:** Tu nombre
   - **Correo Electrónico:** tu@email.com (puede ser cualquier email)
   - **Rol:** Selecciona "Administrador" para tener todos los permisos
   - **Contraseña:** Mínimo 6 caracteres
   - **Confirmar Contraseña:** La misma contraseña
3. Click en **"Crear Cuenta"**
4. Te redirigirá automáticamente al Login

### 2️⃣ INICIAR SESIÓN

1. Ingresa el email y contraseña que acabas de crear
2. Click en **"Iniciar Sesión"**
3. ¡Listo! Entrarás al Dashboard

---

## 🎯 FUNCIONALIDADES PRINCIPALES:

### 📊 DASHBOARD (Página Principal)
- Ver estadísticas de tu inventario
- Total de vehículos
- Vehículos listos para venta
- Vehículos con pendientes
- Valor total del inventario

### ➕ AGREGAR VEHÍCULO
1. Click en "Agregar Vehículo" en el menú
2. Llena los datos del vehículo:
   - **Datos básicos:** Marca, modelo, año, placa, VIN, color, kilometraje
   - **Precios:** Precio de compra y venta
   - **Documentación:**
     - ¿Tiene prenda? (Sí/No)
     - SOAT (fecha de vencimiento)
     - Tecnomecánica (fecha de vencimiento)
     - Tarjeta de propiedad
   - **Fotos:** Subir fotos del vehículo
   - **Checklist:** Marcar items completados
3. Click en "Guardar Vehículo"

### 📋 LISTA DE VEHÍCULOS
- Ver todos los vehículos registrados
- Filtrar por estado:
  - 🟢 Listos para venta
  - 🟡 Con pendientes
  - 🔵 En negociación
  - 🟣 Vendidos
- Buscar vehículos
- Ver detalles de cada vehículo
- Editar o eliminar vehículos

### 📊 REPORTES EN EXCEL
1. Click en "Exportar a Excel"
2. Se descargará un archivo con todos los vehículos
3. Incluye: datos, estado, documentación, precios

### 👥 GESTIÓN DE USUARIOS
- **Admin:** Puede hacer todo
- **Vendedor:** Puede agregar y editar vehículos
- **Visualizador:** Solo puede ver (no editar)

---

## 🔧 SOLUCIÓN DE PROBLEMAS:

### ❌ No puedo escribir en los campos
**Solución:** 
- Refresca la página (F5)
- Verifica que el frontend esté corriendo
- Abre la consola del navegador (F12) y busca errores

### ❌ Error al registrar usuario
**Solución:**
- Verifica que el backend esté corriendo (debe mostrar "Servidor corriendo en puerto 5000")
- Verifica que MongoDB esté corriendo
- Revisa que el email no esté ya registrado

### ❌ No se suben las fotos
**Solución:**
- Verifica que las fotos sean JPG, PNG o JPEG
- Tamaño máximo: 5MB por foto
- El backend debe estar corriendo

### ❌ La página no carga
**Solución:**
1. Verifica que el frontend esté corriendo: `.\iniciar-frontend.bat`
2. Verifica que el backend esté corriendo: `.\iniciar-backend.bat`
3. Verifica que MongoDB esté corriendo: `.\iniciar-mongodb-local.bat`

---

## 📱 NAVEGACIÓN:

### Menú Principal:
- **Dashboard:** Página principal con estadísticas
- **Vehículos:** Lista de todos los vehículos
- **Agregar Vehículo:** Registrar nuevo vehículo
- **Reportes:** Exportar a Excel
- **Perfil:** Ver tu información
- **Cerrar Sesión:** Salir de la aplicación

---

## 💡 CONSEJOS:

1. **Primer vehículo:** Registra un vehículo de prueba para familiarizarte
2. **Fotos:** Sube fotos claras de todos los ángulos
3. **Checklist:** Marca todos los items cuando estén completos
4. **Estados:** Cambia el estado del vehículo según avance el proceso
5. **Reportes:** Exporta regularmente para tener respaldo

---

## 🔄 USO DIARIO:

**Cada día que uses la aplicación:**

1. Ejecuta: `iniciar-backend.bat`
2. Ejecuta: `iniciar-frontend.bat`
3. Abre: http://localhost:3000
4. Inicia sesión
5. ¡Listo para trabajar!

**Al terminar:**
- Presiona `Ctrl + C` en las ventanas de terminal para detener los servidores

---

## 📞 ¿NECESITAS AYUDA?

Si tienes problemas:
1. Revisa esta guía
2. Verifica que todos los servicios estén corriendo
3. Revisa la consola del navegador (F12) para errores
4. Revisa las ventanas de terminal para mensajes de error

---

**¡Disfruta usando tu sistema de gestión de compraventa de vehículos!** 🚗✨
