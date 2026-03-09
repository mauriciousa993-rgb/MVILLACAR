# Configuración de Cloudinary para Almacenamiento de Fotos

## ¿Por qué usar Cloudinary?

Cloudinary es un servicio de almacenamiento en la nube que te permite:
- **Persistir las fotos**: Las imágenes no se borran en cada deploy
- **CDN global**: Las fotos se cargan rápidamente desde servidores cercanos al usuario
- **Optimización automática**: Cloudinary comprime y optimiza las imágenes
- **Plan gratuito generoso**: Hasta 25 minutos de video, 25 GB de almacenamiento y 25 GB de bandwidth mensuales

---

## Paso 1: Crear cuenta en Cloudinary

1. Ve a [cloudinary.com](https://cloudinary.com) y haz clic en **"Sign Up"**
2. Regístrate usando tu cuenta de Google o correo electrónico
3. Completa el formulario con tu información
4. Selecciona el plan **"Free"** (gratuito)
5. Una vez creado, verás tu **Dashboard** de Cloudinary

---

## Paso 2: Obtener credenciales de API

1. En el Dashboard de Cloudinary, busca la sección **"Product Environment Credentials"**
2. Copia los siguientes valores:
   - **Cloud Name**: Es el nombre de tu cloud (algo como `tu-nombre`)
   - **API Key**: Una cadena larga de números y letras
   - **API Secret**: Una cadena secreta (ocrétala, no la compartas)

---

## Paso 3: Configurar variables de entorno

Agrega estas variables al archivo `backend/.env`:

```env
# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

---

## Paso 4: Configurar el backend

El código ya está preparado para usar Cloudinary. Solo necesitas:

1. **Instalar dependencias**:
   ```bash
   cd backend
   npm install cloudinary multer-storage-cloudinary
   npm install -D @types/multer
   ```

2. **Agregar las variables de entorno** en Render:
   - Ve a tu proyecto en Render
   - Busca la sección **"Environment Variables"**
   - Agrega las 3 variables de Cloudinary que obtuviste en el Paso 2

---

## Paso 5: Verificar la configuración

Después de configurar las variables en Render:

1. Sube una foto de prueba desde la aplicación
2. Verifica que la foto aparezca en el dashboard de Cloudinary
3. Confirma que la foto se muestre correctamente en la aplicación

---

## Estructura de archivos modificados

```
backend/src/
├── config/
│   └── cloudinary.ts          (NUEVO - configuración de Cloudinary)
├── middleware/
│   └── upload.middleware.ts  (MODIFICADO - usa Cloudinary)
└── controllers/
    └── vehicle.controller.ts (MODIFICADO - maneja URLs de Cloudinary)
```

---

## Notas importantes

1. **Fotos existentes**: Las fotos que ya están almacenadas localmente no se moverán automáticamente. Deberás volver a subirlas después de configurar Cloudinary.

2. **URLs de fotos**: El sistema detectará automáticamente si una foto es una URL de Cloudinary (comienza con `https://res.cloudinary.com`) o una foto local (nombre de archivo).

3. **Plan gratuito**: El plan gratuito de Cloudinary es suficiente para la mayoría de aplicaciones pequeñas y medianas.

4. **Seguridad**: Nunca compartas tu `API Secret` públicamente. Mantenlo solo en las variables de entorno del backend.
