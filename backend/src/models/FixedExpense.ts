import mongoose, { Schema, Document } from 'mongoose';

export type FixedExpenseCategory =
  | 'arriendo'
  | 'nomina'
  | 'servicios'
  | 'marketing'
  | 'software'
  | 'impuestos'
  | 'seguros'
  | 'mantenimiento'
  | 'otros';

export interface IFixedExpenseDocument extends Document {
  nombre: string;
  categoria: FixedExpenseCategory;
  monto: number;
  diaPago: number;
  proveedor: string;
  metodoPago: string;
  fechaInicio: Date;
  fechaFin?: Date;
  observaciones: string;
  activo: boolean;
  registradoPor: mongoose.Types.ObjectId;
}

const fixedExpenseSchema = new Schema<IFixedExpenseDocument>(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del gasto es requerido'],
      trim: true,
    },
    categoria: {
      type: String,
      required: [true, 'La categoria es requerida'],
      enum: [
        'arriendo',
        'nomina',
        'servicios',
        'marketing',
        'software',
        'impuestos',
        'seguros',
        'mantenimiento',
        'otros',
      ],
    },
    monto: {
      type: Number,
      required: [true, 'El monto es requerido'],
      min: [0, 'El monto no puede ser negativo'],
    },
    diaPago: {
      type: Number,
      default: 5,
      min: [1, 'El dia de pago debe ser minimo 1'],
      max: [31, 'El dia de pago debe ser maximo 31'],
    },
    proveedor: {
      type: String,
      default: '',
      trim: true,
    },
    metodoPago: {
      type: String,
      default: 'transferencia',
      trim: true,
    },
    fechaInicio: {
      type: Date,
      default: Date.now,
    },
    fechaFin: {
      type: Date,
    },
    observaciones: {
      type: String,
      default: '',
      trim: true,
    },
    activo: {
      type: Boolean,
      default: true,
    },
    registradoPor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

fixedExpenseSchema.index({ activo: 1, categoria: 1 });
fixedExpenseSchema.index({ fechaInicio: 1, fechaFin: 1 });

export default mongoose.model<IFixedExpenseDocument>('FixedExpense', fixedExpenseSchema);
