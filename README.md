# 🚗 Sistema de Gestión de Compraventa de Vehículos
> Deploy rapido: ver [DEPLOY_RENDER_VERCEL.md](DEPLOY_RENDER_VERCEL.md).

Sistema completo de gestión de inventario para compraventa de vehículos con control de documentación, checklist de ingreso, gestión de fotos y reportes en Excel.

## 📋 Características Principales

### ✅ Gestión de Vehículos
- Registro completo de vehículos (marca, modelo, año, placa, VIN, etc.)
- Control de precios (compra y venta)
- Estados: En Proceso, Listo para Venta, En Negociación, Vendido, Retirado
- Checklist de ingreso personalizable
- Gestión de pendientes

### 📄 Documentación
- **SOAT**: Control de vigencia con alertas
- **Tecnomecánica**: Control de vigencia con alertas
- **Prenda**: Verificación y detalles
- **Tarjeta de Propiedad**: Verificación

### 📸 Evidencia Fotográfica
- Fotos exteriores del vehículo
- Fotos interiores
- Fotos de detalles/daños
- Fotos de documentos
- Carga múltiple de imágenes

### 📊 Reportes y Estadísticas
- Dashboard con métricas en tiempo real
- Exportación a Excel del inventario
- Filtros avanzados
- Estadísticas financieras
- Alertas de documentos próximos a vencer

### 👥 Multi-usuario
- Sistema de autenticación con JWT
- Roles: Admin, Vendedor, Visualizador
- Permisos diferenciados por rol

### 💰 Control Financiero
- Valor total del inventario
- Ganancias estimadas
- Ganancias reales (vehículos vendidos)
- Margen de ganancia por vehículo

## 🛠️ Tecnologías Utilizadas

### Backend
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT (autenticación)
- Multer (carga de archivos)
- ExcelJS (reportes)
- Node-cron (tareas programadas)

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Lucide React (iconos)
- Recharts (gráficos)

## 📦 Instalación

### Requisitos Previos
- Node.js v18 o superior
- MongoDB Atlas (cuenta gratuita) o MongoDB local
- Git

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd app-compraventa
```

### 2. Configurar Backend

```bash
cd backend
npm install
```

Crear archivo `.env`:
```bash
cp .env.example .env
```

Editar `.env` con tus datos:
```env
PORT=5000
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/compraventa-vehiculos
JWT_SECRET=tu_clave_secreta_super_segura_123456
NODE_ENV=development
```

### 3. Configurar Frontend

```bash
cd ../frontend
npm install
```

(Opcional) Crear archivo `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Configurar MongoDB Atlas

1. Ve a https://www.mongodb.com/cloud/atlas
2. Crea una cuenta gratuita
3. Crea un nuevo cluster (M0 - Free)
4. En "Database Access", crea un usuario con contraseña
5. En "Network Access", agrega tu IP (o 0.0.0.0/0 para desarrollo)
6. Obtén tu connection string y pégalo en el `.env` del backend

## 🚀 Ejecutar la Aplicación

### Opción 1: Ejecutar Backend y Frontend por separado

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
El backend estará en: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
El frontend estará en: http://localhost:3000

### Opción 2: Script de inicio rápido

Puedes crear un script para iniciar ambos:

**Windows (start.bat):**
```batch
start cmd /k "cd backend && npm run dev"
start cmd /k "cd frontend && npm run dev"
```

**Linux/Mac (start.sh):**
```bash
#!/bin/bash
cd backend && npm run dev &
cd frontend && npm run dev &
```

## 👤 Primer Usuario

Para crear el primer usuario administrador, puedes usar la ruta de registro:

**POST** `http://localhost:5000/api/auth/register`

Body:
```json
{
  "nombre": "Administrador",
  "email": "admin@compraventa.com",
  "password": "admin123",
  "rol": "admin"
}
```

O usar el formulario de registro en: http://localhost:3000/register

## 📱 Uso de la Aplicación

### 1. Iniciar Sesión
- Accede a http://localhost:3000
- Ingresa con tus credenciales

### 2. Dashboard
- Visualiza estadísticas generales
- Accede a vehículos listos o pendientes
- Ve el resumen financiero

### 3. Registrar Vehículo
- Click en "Nuevo Vehículo"
- Completa el formulario con datos básicos
- Completa el checklist de ingreso
- Sube fotos (exteriores, interiores, detalles, documentos)
- Registra documentación (SOAT, tecnomecánica, etc.)

### 4. Gestionar Vehículos
- Filtra por estado
- Edita información
- Actualiza checklist
- Cambia estado del vehículo

### 5. Exportar Reportes
- Click en "Exportar a Excel"
- Selecciona filtros (opcional)
- Descarga el archivo

## 📂 Estructura del Proyecto

```
app-compraventa/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuración (DB)
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── middleware/      # Middlewares
│   │   ├── models/          # Modelos de MongoDB
│   │   ├── routes/          # Rutas de la API
│   │   ├── types/           # Tipos TypeScript
│   │   └── server.ts        # Punto de entrada
│   ├── uploads/             # Archivos subidos
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── context/         # Context API
│   │   ├── pages/           # Páginas
│   │   ├── services/        # API calls
│   │   ├── types/           # Tipos TypeScript
│   │   └── App.tsx
│   └── package.json
│
└── README.md
```

## 🔐 Roles y Permisos

### Admin
- Acceso completo al sistema
- Gestión de usuarios
- Eliminar vehículos
- Todas las funciones de vendedor

### Vendedor
- Registrar vehículos
- Editar vehículos
- Subir fotos
- Ver estadísticas
- Exportar reportes

### Visualizador
- Solo lectura
- Ver vehículos
- Ver estadísticas
- Exportar reportes

## 📊 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil
- `GET /api/auth/users` - Listar usuarios (admin)

### Vehículos
- `GET /api/vehicles` - Listar vehículos
- `POST /api/vehicles` - Crear vehículo
- `GET /api/vehicles/:id` - Obtener vehículo
- `PUT /api/vehicles/:id` - Actualizar vehículo
- `DELETE /api/vehicles/:id` - Eliminar vehículo (admin)
- `GET /api/vehicles/statistics` - Estadísticas
- `GET /api/vehicles/export` - Exportar Excel
- `POST /api/vehicles/:id/photos` - Subir fotos

## 🐛 Solución de Problemas

### Error de conexión a MongoDB
- Verifica que tu IP esté en la whitelist de MongoDB Atlas
- Verifica que el connection string sea correcto
- Verifica que el usuario y contraseña sean correctos

### Error al subir fotos
- Verifica que la carpeta `backend/uploads` exista
- Verifica los permisos de escritura

### Error de CORS
- Verifica que el backend esté corriendo en el puerto 5000
- Verifica la configuración de CORS en `backend/src/server.ts`

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 👨‍💻 Autor

Desarrollado para la gestión eficiente de compraventa de vehículos.

## 📞 Soporte

Para soporte o preguntas, por favor abre un issue en el repositorio.


