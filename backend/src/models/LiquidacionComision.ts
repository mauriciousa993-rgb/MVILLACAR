import mongoose, { Schema, Document } from 'mongoose';

export interface ILiquidacionComision {
  _id: mongoose.Types.ObjectId;
  vendedor: string;
  mes: number; // 1-12
  año: number;
  totalComisiones: number;
  comisionesPendientes: number;
  comisionesPagadas: number;
  Liquidaciones: {
    vehiculoId: mongoose.Types.ObjectId;
    placa: string;
    comision: number;
    fechaVenta: Date;
    liquidada: boolean;
    fechaLiquidacion?: Date;
  }[];
  estado: 'pendiente' | 'parcial' | 'liquidado';
  notas: string;
  creadoPor: mongoose.Types.ObjectId;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

const liquidacionComisionSchema = new Schema<ILiquidacionComision>({
  vendedor: { type: String, required: true },
  mes: { type: Number, required: true, min: 1, max: 12 },
  año: { type: Number, required: true },
  totalComisiones: { type: Number, default: 0 },
  comisionesPendientes: { type: Number, default: 0 },
  comisionesPagadas: { type: Number, default: 0 },
  Liquidaciones: [{
    vehiculoId: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    placa: { type: String, required: true },
    comision: { type: Number, default: 0 },
    fechaVenta: { type: Date },
    liquidada: { type: Boolean, default: false },
    fechaLiquidacion: { type: Date },
  }],
  estado: { 
    type: String, 
    enum: ['pendiente', 'parcial', 'liquidado'], 
    default: 'pendiente' 
  },
  notas: { type: String, default: '' },
  creadoPor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true,
});

// Índice único para evitar duplicados por vendedor+mes+año
liquidacionComisionSchema.index({ vendedor: 1, mes: 1, año: 1 }, { unique: true });

export const LiquidacionComision = mongoose.model<ILiquidacionComision>('LiquidacionComision', liquidacionComisionSchema);
