import { Response } from 'express';
import Vehicle from '../models/Vehicle';
import VehicleInspectionChecklist from '../models/VehicleInspectionChecklist';
import { AuthRequest } from '../types';

type InspectionStatus = 'bien' | 'mal';

interface ChecklistInputRow {
  key?: string;
  label?: string;
  category?: string;
  status?: InspectionStatus;
  observaciones?: string;
  responsable?: string;
  porcentajeEstado?: number | string | null;
  tipoTransmision?: string;
}

interface DamageZoneInputRow {
  key?: string;
  label?: string;
  status?: InspectionStatus;
  observaciones?: string;
  responsable?: string;
  markerPositions?: Array<{
    x?: number | string | null;
    y?: number | string | null;
    z?: number | string | null;
  }> | null;
  markerPosition?: {
    x?: number | string | null;
    y?: number | string | null;
    z?: number | string | null;
  } | null;
}

const normalizeStatus = (value: any): InspectionStatus => (value === 'mal' ? 'mal' : 'bien');
const normalizeTransmissionType = (value: any): '' | 'mecanica' | 'automatica' =>
  value === 'mecanica' || value === 'automatica' ? value : '';

const normalizePercentage = (value: any): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return null;
  if (parsed < 0) return 0;
  if (parsed > 100) return 100;
  return parsed;
};

const normalizeMarkerPosition = (
  value: DamageZoneInputRow['markerPosition']
): { x: number; y: number; z: number } | null => {
  if (!value || typeof value !== 'object') return null;
  const x = Number(value.x);
  const y = Number(value.y);
  const z = Number(value.z);
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return null;
  return { x, y, z };
};

const normalizeMarkerPositions = (
  values: DamageZoneInputRow['markerPositions']
): { x: number; y: number; z: number }[] => {
  if (!Array.isArray(values)) return [];
  return values
    .map((value) => normalizeMarkerPosition(value))
    .filter((value): value is { x: number; y: number; z: number } => value !== null);
};

const sanitizeChecklistItem = (row: ChecklistInputRow) => ({
  key: (row.key || '').toString().trim(),
  label: (row.label || '').toString().trim(),
  category: (row.category || 'General').toString().trim(),
  status: normalizeStatus(row.status),
  observaciones: (row.observaciones || '').toString().trim(),
  responsable: (row.responsable || '').toString().trim(),
  porcentajeEstado: normalizePercentage(row.porcentajeEstado),
  tipoTransmision: normalizeTransmissionType(row.tipoTransmision),
});

const sanitizeDamageZone = (row: DamageZoneInputRow) => {
  const normalizedMarkers = normalizeMarkerPositions(row.markerPositions);
  const fallbackMarker = normalizeMarkerPosition(row.markerPosition);
  const markers = normalizedMarkers.length > 0 ? normalizedMarkers : fallbackMarker ? [fallbackMarker] : [];

  return {
    key: (row.key || '').toString().trim(),
    label: (row.label || '').toString().trim(),
    status: normalizeStatus(row.status),
    observaciones: (row.observaciones || '').toString().trim(),
    responsable: (row.responsable || '').toString().trim(),
    markerPositions: markers,
    // Compatibilidad temporal con checklists previos.
    markerPosition: markers[0] || null,
  };
};

export const getVehicleInspectionChecklist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id).select('_id');

    if (!vehicle) {
      res.status(404).json({ message: 'Vehiculo no encontrado' });
      return;
    }

    const checklist = await VehicleInspectionChecklist.findOne({ vehicle: id }).lean();
    if (!checklist) {
      res.json({
        vehicle: id,
        inspectorName: '',
        inspectionDate: new Date().toISOString(),
        items: [],
        damageZones: [],
        generalObservations: '',
      });
      return;
    }

    res.json(checklist);
  } catch (error: any) {
    res.status(500).json({
      message: 'Error al obtener checklist del vehiculo',
      error: error.message,
    });
  }
};

export const upsertVehicleInspectionChecklist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const vehicle = await Vehicle.findById(id).select('_id');
    if (!vehicle) {
      res.status(404).json({ message: 'Vehiculo no encontrado' });
      return;
    }

    const items = Array.isArray(req.body.items)
      ? req.body.items
          .map((row: ChecklistInputRow) => sanitizeChecklistItem(row))
          .filter((row: any) => row.key && row.label)
      : [];

    const damageZones = Array.isArray(req.body.damageZones)
      ? req.body.damageZones
          .map((row: DamageZoneInputRow) => sanitizeDamageZone(row))
          .filter((row: any) => row.key && row.label)
      : [];

    const payload: any = {
      inspectorName: (req.body.inspectorName || '').toString().trim(),
      inspectionDate: req.body.inspectionDate ? new Date(req.body.inspectionDate) : new Date(),
      items,
      damageZones,
      generalObservations: (req.body.generalObservations || '').toString().trim(),
      updatedBy: userId,
    };

    const checklist = await VehicleInspectionChecklist.findOneAndUpdate(
      { vehicle: id },
      {
        $set: payload,
        $setOnInsert: {
          vehicle: id,
          createdBy: userId,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({
      message: 'Checklist de inspeccion guardado exitosamente',
      checklist,
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error al guardar checklist del vehiculo',
      error: error.message,
    });
  }
};
