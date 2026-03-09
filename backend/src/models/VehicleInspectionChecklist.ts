import mongoose, { Document, Schema } from 'mongoose';

export type InspectionStatus = 'bien' | 'mal';

export interface IInspectionItem {
  key: string;
  label: string;
  category: string;
  status: InspectionStatus;
  observaciones: string;
  responsable: string;
  porcentajeEstado?: number | null;
  tipoTransmision?: '' | 'mecanica' | 'automatica';
}

export interface IZoneMarkerPosition {
  x: number;
  y: number;
  z: number;
}

export interface IDamageZone {
  key: string;
  label: string;
  status: InspectionStatus;
  observaciones: string;
  responsable: string;
  markerPositions?: IZoneMarkerPosition[];
  markerPosition?: IZoneMarkerPosition | null;
}

export interface IVehicleInspectionChecklistDocument extends Document {
  vehicle: mongoose.Types.ObjectId;
  inspectorName: string;
  inspectionDate: Date;
  deliveredByName: string;
  deliveredBySignature: string;
  items: IInspectionItem[];
  damageZones: IDamageZone[];
  generalObservations: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const inspectionItemSchema = new Schema<IInspectionItem>(
  {
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    status: { type: String, enum: ['bien', 'mal'], required: true },
    observaciones: { type: String, default: '', trim: true },
    responsable: { type: String, default: '', trim: true },
    porcentajeEstado: { type: Number, min: 0, max: 100, default: null },
    tipoTransmision: { type: String, enum: ['', 'mecanica', 'automatica'], default: '' },
  },
  { _id: false }
);

const zoneMarkerPositionSchema = new Schema<IZoneMarkerPosition>(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    z: { type: Number, required: true },
  },
  { _id: false }
);

const damageZoneSchema = new Schema<IDamageZone>(
  {
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    status: { type: String, enum: ['bien', 'mal'], required: true },
    observaciones: { type: String, default: '', trim: true },
    responsable: { type: String, default: '', trim: true },
    markerPositions: { type: [zoneMarkerPositionSchema], default: [] },
    markerPosition: { type: zoneMarkerPositionSchema, default: null },
  },
  { _id: false }
);

const vehicleInspectionChecklistSchema = new Schema<IVehicleInspectionChecklistDocument>(
  {
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true, unique: true, index: true },
    inspectorName: { type: String, default: '', trim: true },
    inspectionDate: { type: Date, default: Date.now },
    deliveredByName: { type: String, default: '', trim: true },
    deliveredBySignature: { type: String, default: '', trim: true },
    items: { type: [inspectionItemSchema], default: [] },
    damageZones: { type: [damageZoneSchema], default: [] },
    generalObservations: { type: String, default: '', trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IVehicleInspectionChecklistDocument>(
  'VehicleInspectionChecklist',
  vehicleInspectionChecklistSchema
);
