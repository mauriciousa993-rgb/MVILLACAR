import fs from 'fs';
import path from 'path';

export const getUploadsDir = (): string =>
  process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.join(__dirname, '../../uploads');

export const ensureUploadsDir = (): string => {
  const uploadsDir = getUploadsDir();
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
};

export const getPhotoFileName = (photoPath: string): string => {
  if (!photoPath) return '';
  return path.basename(photoPath);
};
