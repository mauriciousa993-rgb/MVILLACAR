# Frontend - Sistema de Gestión de Compraventa de Vehículos

## 🚀 Instalación

1. **Instalar dependencias:**
```bash
cd frontend
npm install
```

2. **Configurar variables de entorno (opcional):**
Crea un archivo `.env` en la raíz del frontend:

```env
VITE_API_URL=http://localhost:5000/api
```

## 🏃 Ejecutar la aplicación

**Modo desarrollo:**
```bash
npm run dev
```

La aplicación estará disponible en: http://localhost:3000

**Compilar para producción:**
```bash
npm run build
```

**Vista previa de producción:**
```bash
npm run preview
```

## 📱 Funcionalidades

### Dashboard
- Estadísticas generales del inventario
- Resumen financiero
- Accesos rápidos a vehículos listos y pendientes

### Gestión de Vehículos
- Listado de vehículos con filtros
- Registro de nuevos vehículos
- Edición de vehículos existentes
- Checklist de ingreso
- Carga de fotos (exteriores, interiores, detalles, documentos)
- Gestión de documentación (SOAT, tecnomecánica, prenda, tarjeta de propiedad)
- Estados: En Proceso, Listo para Venta, En Negociación, Vendido, Retirado

### Reportes
- Exportación a Excel del inventario
- Filtros por estado
- Información completa de cada vehículo

### Usuarios (Solo Admin)
- Gestión de usuarios
- Roles: Admin, Vendedor, Visualizador

## 🎨 Tecnologías

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Lucide React (iconos)
- Recharts (gráficos)
- date-fns (manejo de fechas)

## 📂 Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/
│   │   └── Layout/
│   │       ├── Navbar.tsx
│   │       └── Layout.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── pages/
│   │   ├── Login.tsx
│   │   └── Dashboard.tsx
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── index.html
└── package.json
```

## 🔐 Autenticación

El sistema utiliza JWT (JSON Web Tokens) para la autenticación. El token se almacena en localStorage y se envía automáticamente en cada petición a la API.

## 🎯 Próximas Funcionalidades

- Página completa de listado de vehículos
- Formulario completo de registro/edición de vehículos
- Vista detallada de vehículo individual
- Gestión de usuarios (para admin)
- Notificaciones de documentos próximos a vencer
- Gráficos y estadísticas avanzadas
