import { Router } from 'express';
import {
  getAllLiquidaciones,
  getComisionesResumen,
  getVendedoresConComisiones,
  createOrUpdateLiquidacion,
  liquidarComision,
  getLiquidacionById,
} from '../controllers/commission.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas de liquidaciones de comisiones
router.get('/resumen', authorize('admin', 'vendedor'), getComisionesResumen);
router.get('/vendedores', authorize('admin', 'vendedor'), getVendedoresConComisiones);
router.get('/', authorize('admin'), getAllLiquidaciones);
router.get('/:id', authorize('admin'), getLiquidacionById);
router.post('/', authorize('admin'), createOrUpdateLiquidacion);
router.post('/liquidar', authorize('admin'), liquidarComision);

export default router;
