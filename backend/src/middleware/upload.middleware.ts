import multer from 'multer';
import path from 'path';
import { ensureUploadsDir, getUploadsDir } from '../utils/uploads';
import { cloudinaryStorage, isCloudinaryConfigured } from '../config/cloudinary';

// Crear directorio de uploads si no existe (solo para almacenamiento local)
const uploadDir = ensureUploadsDir();

// Configuración de almacenamiento local
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `vehicle-${uniqueSuffix}${ext}`);
  },
});

// Filtro de archivos (solo imágenes)
const fileFilter = (req: any, file: any, cb: any) => {
  const imageTypes = /jpeg|jpg|png|gif|webp/;
  const pdfTypes = /pdf/;
  const ext = path.extname(file.originalname).toLowerCase();
  const isImage = imageTypes.test(ext) && imageTypes.test(file.mimetype);
  const isPdf = pdfTypes.test(ext) && file.mimetype === 'application/pdf';
  const isDocumentUpload = req.body?.tipo === 'documentos';

  if (isImage || (isDocumentUpload && isPdf)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        isDocumentUpload
          ? 'Solo se permiten imagenes o PDF para documentos.'
          : 'Solo se permiten archivos de imagen (jpeg, jpg, png, gif, webp)'
      )
    );
  }
};

// Seleccionar el almacenamiento según la configuración
const getStorage = () => {
  if (isCloudinaryConfigured()) {
    return cloudinaryStorage;
  }
  return localStorage;
};

// Configuración de multer
export const upload = multer({
  storage: getStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
  fileFilter: fileFilter,
});

// Middleware para múltiples archivos
export const uploadMultiple = upload.array('fotos', 20); // Máximo 20 fotos

// Middleware para un solo archivo
export const uploadSingle = upload.single('foto');

// Exportar función para verificar si se usa Cloudinary
export const isUsingCloudinary = () => isCloudinaryConfigured();
