# Backend - Sistema de Gestión de Compraventa de Vehículos

## 🚀 Instalación

1. **Instalar dependencias:**
```bash
cd backend
npm install
```

2. **Configurar variables de entorno:**
   - Copia el archivo `.env.example` a `.env`
   - Edita `.env` con tus credenciales de MongoDB Atlas

```bash
cp .env.example .env
```

3. **Configurar MongoDB Atlas:**
   - Ve a https://www.mongodb.com/cloud/atlas
   - Crea una cuenta gratuita
   - Crea un nuevo cluster (gratis)
   - Obtén tu connection string
   - Pégalo en el archivo `.env`

## 📝 Configuración del archivo .env

```env
PORT=5000
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/compraventa-vehiculos?retryWrites=true&w=majority
JWT_SECRET=tu_clave_secreta_super_segura_123456
NODE_ENV=development
```

## 🏃 Ejecutar el servidor

**Modo desarrollo (con auto-reload):**
```bash
npm run dev
```

**Modo producción:**
```bash
npm run build
npm start
```

## 📚 API Endpoints

### Autenticación

- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil (requiere token)
- `GET /api/auth/users` - Listar usuarios (solo admin)
- `PUT /api/auth/users/:id` - Actualizar usuario (solo admin)
- `DELETE /api/auth/users/:id` - Eliminar usuario (solo admin)

### Vehículos

- `POST /api/vehicles` - Crear vehículo
- `GET /api/vehicles` - Listar vehículos (con filtros)
- `GET /api/vehicles/:id` - Obtener vehículo por ID
- `PUT /api/vehicles/:id` - Actualizar vehículo
- `DELETE /api/vehicles/:id` - Eliminar vehículo (solo admin)
- `GET /api/vehicles/statistics` - Obtener estadísticas
- `GET /api/vehicles/export` - Exportar a Excel
- `GET /api/vehicles/expiring-documents` - Vehículos con docs por vencer
- `POST /api/vehicles/:id/photos` - Subir fotos

## 🔐 Roles de Usuario

- **admin**: Acceso completo
- **vendedor**: Puede crear y editar vehículos
- **visualizador**: Solo puede ver información

## 📦 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuración (DB)
│   ├── controllers/     # Lógica de negocio
│   ├── middleware/      # Middlewares (auth, upload)
│   ├── models/          # Modelos de MongoDB
│   ├── routes/          # Rutas de la API
│   ├── types/           # Tipos de TypeScript
│   └── server.ts        # Punto de entrada
├── uploads/             # Archivos subidos
└── package.json
```

## 🛠️ Tecnologías

- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT para autenticación
- Multer para subida de archivos
- ExcelJS para reportes
