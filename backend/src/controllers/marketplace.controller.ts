import { Response } from 'express';
import Vehicle from '../models/Vehicle';
import { AuthRequest } from '../types';

// Nueva función para obtener vehículos del marketplace (público - sin autenticación)
// VERSION: 2025-01-13-v2-marketplace-fotos
export const getMarketplaceVehicles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('📸 Marketplace v2: Obteniendo vehículos con fotos...');
    const vehicles = await Vehicle.find({ estado: 'listo_venta' })

      .select('marca modelo año placa color kilometraje precioVenta fotos.exteriores fotos.interiores fotos.detalles observaciones')
      .sort({ fechaIngreso: -1 });

    const normalizePhotoPath = (photo: string): string => {
      if (!photo) return '';
      if (photo.startsWith('http://') || photo.startsWith('https://')) return photo;
      if (photo.startsWith('/uploads/')) return photo;
      if (photo.startsWith('uploads/')) return `/${photo}`;
      return `/uploads/${photo}`;
    };

    const vehiclesWithNormalizedPhotos = vehicles.map((vehicle) => {
      const v = vehicle.toObject();
      return {
        ...v,
        anio: v.año,
        fotos: {
          exteriores: (v.fotos?.exteriores || []).map(normalizePhotoPath),
          interiores: (v.fotos?.interiores || []).map(normalizePhotoPath),
          detalles: (v.fotos?.detalles || []).map(normalizePhotoPath),
        },
      };
    });

    res.json(vehiclesWithNormalizedPhotos);
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener vehículos del marketplace', error: error.message });
  }
};
