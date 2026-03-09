import { Router } from 'express';
import multer from 'multer';
import {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getStatistics,
  exportToExcel,
  uploadPhotos,
  getVehiclesWithExpiringDocuments,
  getMonthlyReports,
  exportVehicleReport,
  exportMonthlyReport,
  saveSaleData,
  saveSeparationData,
  updateSeparationData,
  generateContract,
  generateTransferForm,
  getVehiclePhoto,
  consultarEstadoTramite,
} from '../controllers/vehicle.controller';
import { ocrPropertyCardWithVisionAI } from '../controllers/propertyCardOcr.controller';
import {
  getVehicleInspectionChecklist,
  upsertVehicleInspectionChecklist,
} from '../controllers/vehicleInspectionChecklist.controller';
import { getMarketplaceVehicles } from '../controllers/marketplace.controller';
import { exportBusinessTemplate } from '../controllers/reportTemplates.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { uploadMultiple } from '../middleware/upload.middleware';

const router = Router();
const ocrUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

// Ruta pública para marketplace (sin autenticación)
router.get('/marketplace', getMarketplaceVehicles);
router.get('/photo/:filename', getVehiclePhoto);
router.get('/consulta/:placa', consultarEstadoTramite);

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas de vehículos
router.post('/', authorize('admin', 'vendedor'), createVehicle);
router.get('/', getAllVehicles);
router.get('/statistics', getStatistics);
router.get('/reports/monthly', getMonthlyReports);
router.get('/reports/monthly/export', exportMonthlyReport);
router.get('/reports/templates/:templateType', exportBusinessTemplate);
router.get('/expiring-documents', getVehiclesWithExpiringDocuments);
router.get('/export', exportToExcel);
router.post(
  '/ocr/property-card',
  authorize('admin', 'vendedor'),
  ocrUpload.single('file'),
  ocrPropertyCardWithVisionAI
);
router.get('/:id/inspection-checklist', getVehicleInspectionChecklist);
router.put('/:id/inspection-checklist', authorize('admin', 'vendedor'), upsertVehicleInspectionChecklist);
router.get('/:id', getVehicleById);
router.get('/:id/export', exportVehicleReport);
router.put('/:id', authorize('admin', 'vendedor'), updateVehicle);
router.delete('/:id', authorize('admin'), deleteVehicle);

// Ruta para subir fotos
router.post('/:id/photos', authorize('admin', 'vendedor'), uploadMultiple, uploadPhotos);

// Rutas para contratos de compraventa
router.post('/:id/sale-data', authorize('admin', 'vendedor'), saveSaleData);
router.put('/:id/sale-data', authorize('admin', 'vendedor'), saveSaleData); // Reutiliza la misma función

// Rutas para separación de vehículos
router.post('/:id/separation-data', authorize('admin', 'vendedor'), saveSeparationData);
router.put('/:id/separation-data', authorize('admin', 'vendedor'), updateSeparationData);

router.get('/:id/contract', authorize('admin', 'vendedor'), generateContract);
router.get('/:id/transfer-form', authorize('admin', 'vendedor'), generateTransferForm);

export default router;
