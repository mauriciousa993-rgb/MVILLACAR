# 👥 Usuarios de Prueba - App Compraventa de Vehículos

## 🎯 Cómo Crear un Usuario de Prueba

### Opción 1: Registrarte en la App

1. Ve a tu app en Vercel (la URL que te dio)
2. Click en **"Registrarse"** o **"Register"**
3. Completa el formulario:
   - **Nombre:** Tu nombre o "Usuario Prueba"
   - **Email:** tu-email@ejemplo.com
   - **Password:** Una contraseña segura (mínimo 6 caracteres)
   - **Rol:** Selecciona "Administrador" o "Vendedor"
4. Click en **"Registrarse"**
5. ¡Listo! Ya puedes usar la app

---

## 👤 Usuario de Prueba Sugerido

Si quieres crear un usuario de prueba rápido:

### Usuario Administrador:
```
Nombre: Admin Prueba
Email: admin@prueba.com
Password: admin123
Rol: Administrador
```

### Usuario Vendedor:
```
Nombre: Vendedor Prueba
Email: vendedor@prueba.com
Password: vendedor123
Rol: Vendedor
```

---

## 🔐 Diferencias entre Roles

### Administrador:
- ✓ Puede ver todos los vehículos
- ✓ Puede crear, editar y eliminar vehículos
- ✓ Puede ver estadísticas
- ✓ Puede gestionar usuarios
- ✓ Acceso completo a todas las funciones

### Vendedor:
- ✓ Puede ver todos los vehículos
- ✓ Puede crear y editar vehículos
- ✓ Puede ver estadísticas básicas
- ✓ Acceso limitado a funciones administrativas

---

## 🚀 Primeros Pasos Después de Registrarte

### 1. Iniciar Sesión
- Ve a la página de login
- Ingresa tu email y password
- Click en "Iniciar Sesión"

### 2. Explorar el Dashboard
- Verás el panel principal con estadísticas
- Navegación en el menú superior

### 3. Agregar tu Primer Vehículo
- Click en "Nuevo Vehículo" o "Agregar Vehículo"
- Completa el formulario:
  - **Marca:** Toyota, Honda, Chevrolet, etc.
  - **Modelo:** Corolla, Civic, Spark, etc.
  - **Año:** 2020, 2021, 2022, etc.
  - **Placa:** ABC123 (formato de tu país)
  - **VIN:** 1HGBH41JXMN109186 (17 caracteres)
  - **Color:** Rojo, Azul, Negro, etc.
  - **Kilometraje:** 50000
  - **Precio de Compra:** 10000
  - **Precio de Venta:** 12000
  - **Foto:** Sube una imagen del vehículo
- Click en "Guardar Vehículo"

### 4. Ver Lista de Vehículos
- Click en "Vehículos" en el menú
- Verás todos los vehículos registrados
- Puedes filtrar por estado, marca, modelo

### 5. Ver Estadísticas
- Click en "Dashboard" o "Estadísticas"
- Verás gráficos y métricas de tu inventario

---

## 📝 Datos de Prueba para Vehículos

### Vehículo 1:
```
Marca: Toyota
Modelo: Corolla
Año: 2020
Placa: ABC123
VIN: 1HGBH41JXMN109186
Color: Blanco
Kilometraje: 45000
Precio Compra: $8,000
Precio Venta: $10,000
Estado: En Proceso
```

### Vehículo 2:
```
Marca: Honda
Modelo: Civic
Año: 2021
Placa: XYZ789
VIN: 2HGFC2F59MH123456
Color: Negro
Kilometraje: 30000
Precio Compra: $12,000
Precio Venta: $14,500
Estado: Listo para Venta
```

### Vehículo 3:
```
Marca: Chevrolet
Modelo: Spark
Año: 2019
Placa: DEF456
VIN: 3GNKBERS5KS123789
Color: Rojo
Kilometraje: 60000
Precio Compra: $5,000
Precio Venta: $6,500
Estado: Vendido
```

---

## 🔧 Funciones para Probar

### 1. Gestión de Vehículos
- ✓ Crear nuevo vehículo
- ✓ Editar vehículo existente
- ✓ Eliminar vehículo
- ✓ Subir foto del vehículo
- ✓ Cambiar estado del vehículo

### 2. Documentación
- ✓ Marcar documentos como verificados
- ✓ Agregar fechas de vencimiento (SOAT, Tecnomecánica)
- ✓ Registrar si tiene prenda

### 3. Gastos
- ✓ Registrar gastos de pintura
- ✓ Registrar gastos de mecánica
- ✓ Registrar gastos varios
- ✓ Ver total de gastos

### 4. Checklist
- ✓ Marcar revisión mecánica
- ✓ Marcar limpieza/detailing
- ✓ Marcar fotografías completas
- ✓ Marcar documentos completos
- ✓ Marcar precio establecido

### 5. Estadísticas
- ✓ Ver total de vehículos
- ✓ Ver vehículos por estado
- ✓ Ver ganancias totales
- ✓ Ver inversión total

---

## 🆘 Si No Puedes Registrarte

### Problema: El backend no está conectado

Si ves un error al intentar registrarte:

1. **Verifica que el backend esté corriendo** en Render
2. **Agrega la variable de entorno** en Vercel:
   - Ve a Settings → Environment Variables
   - Agrega `VITE_API_URL` con la URL de tu backend
   - Ejemplo: `https://tu-backend.onrender.com/api`
3. **Redeploy** el frontend en Vercel
4. **Intenta registrarte de nuevo**

### Problema: Error de CORS

Si ves un error de CORS:

1. Verifica que el backend tenga configurado CORS correctamente
2. El backend debe permitir la URL de Vercel
3. Revisa los logs del backend en Render

---

## 📱 Acceso desde Móvil

Para probar desde tu celular:

1. Abre el navegador en tu celular
2. Ingresa la URL de Vercel
3. Regístrate o inicia sesión
4. ¡Funciona igual que en PC!

---

## 💡 Consejos

1. **Usa emails reales** si quieres recibir notificaciones (futuro)
2. **Guarda tus credenciales** en un lugar seguro
3. **Prueba todas las funciones** para familiarizarte con la app
4. **Sube fotos reales** de vehículos para que se vea mejor
5. **Experimenta** - es una app de prueba, no hay problema si algo sale mal

---

**¿Necesitas ayuda con algo más?**
- ¿Cómo conectar el backend?
- ¿Cómo agregar más funciones?
- ¿Cómo personalizar la app?

¡Disfruta tu app de compraventa de vehículos! 🚗✨
