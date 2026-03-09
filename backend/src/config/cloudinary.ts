import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configurar Cloudinary con las variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Verificar si Cloudinary está configurado
export const isCloudinaryConfigured = (): boolean => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

// Configuración del almacenamiento con Cloudinary
export const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (_req: any, file: any) => {
    const ext = ((file?.originalname || '').split('.').pop() || '').toLowerCase();
    const isPdf = ext === 'pdf' || file?.mimetype === 'application/pdf';

    return {
      folder: 'vehiculos',
      resource_type: 'auto',
      allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp', 'pdf'],
      ...(isPdf
        ? {}
        : {
            transformation: [
              { width: 1200, height: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' }
            ],
          }),
    };
  },
});

// Exportar cloudinary y multer configurados
export { cloudinary, multer };
