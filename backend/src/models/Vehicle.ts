import mongoose, { Schema, Document } from 'mongoose';

export interface IGastoInversionista {
  categoria: 'pintura' | 'mecanica' | 'traspaso' | 'alistamiento' | 'tapiceria' | 'transporte' | 'varios';
  monto: number;
  descripcion: string;
  fecha: Date;
}

export interface IInversionista {
  usuario: mongoose.Types.ObjectId;
  nombre: string;
  montoInversion: number;
  gastos: IGastoInversionista[];
  porcentajeParticipacion: number;
  utilidadCorrespondiente: number;
}

export interface IDatosSeparacion {
  cliente: {
    nombre: string;
    identificacion: string;
    direccion: string;
    telefono: string;
    email: string;
  };
  valorSeparacion: number;
  fechaSeparacion: Date;
  notas?: string;
}

export interface IDatosVenta {
  vendedor: {
    nombre: string;
    identificacion: string;
    direccion: string;
    telefono: string;
  };
  comprador: {
    nombre: string;
    identificacion: string;
    direccion: string;
    telefono: string;
    email: string;
  };
  vehiculoAdicional: {
    tipoCarroceria: string;
    capacidad: string;
    cilindrada: string;
    claseVehiculo: string;
    numeroPuertas: number;
    numeroMotor: string;
    numeroChasis: string;
    linea: string;
    actaManifiesto: string;
    sitioMatricula: string;
    tipoServicio: string;
  };
  transaccion: {
    lugarCelebracion: string;
    fechaCelebracion: Date;
    precioLetras: string;
    formaPago: string;
    vendedorAnterior: string;
    cedulaVendedorAnterior: string;
    diasTraspaso: number;
    fechaEntrega: Date;
    horaEntrega: string;
    domicilioContractual: string;
    clausulasAdicionales: string;
  };
  // Campos de comisión del vendedor
  comision: {
    monto: number;
    porcentaje: number;
    descripcion: string;
  };
}

export interface IDatosTarjetaPropiedad {
  linea: string;
  cilindrada: string;
  claseVehiculo: string;
  servicio: string;
  tipoCarroceria: string;
  numeroMotor: string;
  capacidad: string;
  numeroChasis: string;
  propietario: string;
  identificacionPropietario: string;
}

export interface IGastoDetalle {
  descripcion: string;
  encargado: string;
  fecha: Date;
  monto: number;
}

export interface IVehicleDocument extends Document {
  marca: string;
  modelo: string;
  tipoVehiculo: 'suv' | 'pickup' | 'sedan' | 'hatchback';
  año: number;
  placa: string;
  vin: string;
  color: string;
  kilometraje: number;
  precioCompra: number;
  precioVenta: number;
  fechaIngreso: Date;
  fechaListoVenta?: Date;
  fechaVenta?: Date;
  gastos: {
    pintura: number;
    mecanica: number;
    traspaso: number;
    alistamiento: number;
    tapiceria: number;
    transporte: number;
    varios: number;
    total: number;
  };
  gastosDetallados: {
    pintura: IGastoDetalle[];
    mecanica: IGastoDetalle[];
    traspaso: IGastoDetalle[];
    alistamiento: IGastoDetalle[];
    tapiceria: IGastoDetalle[];
    transporte: IGastoDetalle[];
    varios: IGastoDetalle[];
  };
  inversionistas: IInversionista[];
  tieneInversionistas: boolean;
  estado: 'en_proceso' | 'listo_venta' | 'en_negociacion' | 'separado' | 'vendido' | 'retirado';
  estadoTramite?: 'firma_documentos' | 'radicacion' | 'revision_documentos' | 'aprobado' | 'rechazado';
  datosTarjetaPropiedad?: IDatosTarjetaPropiedad;
  datosVenta?: IDatosVenta;
  datosSeparacion?: IDatosSeparacion;
  fotos: {
    exteriores: string[];
    interiores: string[];
    detalles: string[];
    documentos: string[];
  };
  documentacion: {
    soat: {
      tiene: boolean;
      fechaVencimiento?: Date;
      detalles?: string;
      verificado: boolean;
    };
    tecnomecanica: {
      tiene: boolean;
      fechaVencimiento?: Date;
      detalles?: string;
      verificado: boolean;
    };
    tarjetaPropiedad: {
      tiene: boolean;
      detalles?: string;
      verificado: boolean;
    };
    prenda: {
      tiene: boolean;
      detalles?: string;
    };
  };
  checklist: {
    pintura: boolean;
    mecanica: boolean;
    alistamiento: boolean;
    tapiceria: boolean;
    limpieza: boolean;
    papeles: boolean;
  };
  observaciones?: string;
  registradoPor: mongoose.Types.ObjectId;
}

const gastoDetalleSchema = new Schema<IGastoDetalle>({
  descripcion: { type: String, default: '' },
  encargado: { type: String, default: '' },
  fecha: { type: Date, default: Date.now },
  monto: { type: Number, default: 0 },
});

const gastoInversionistaSchema = new Schema<IGastoInversionista>({
  categoria: {
    type: String,
    enum: ['pintura', 'mecanica', 'traspaso', 'alistamiento', 'tapiceria', 'transporte', 'varios'],
    required: true,
  },
  monto: { type: Number, required: true },
  descripcion: { type: String, default: '' },
  fecha: { type: Date, default: Date.now },
});

const inversionistaSchema = new Schema<IInversionista>({
  usuario: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  nombre: { type: String, required: true },
  montoInversion: { type: Number, required: true },
  gastos: [gastoInversionistaSchema],
  porcentajeParticipacion: { type: Number, default: 0 },
  utilidadCorrespondiente: { type: Number, default: 0 },
});

const vehicleSchema = new Schema<IVehicleDocument>({
  marca: { type: String, required: true },
  modelo: { type: String, required: true },
  tipoVehiculo: {
    type: String,
    enum: ['suv', 'pickup', 'sedan', 'hatchback'],
    default: 'sedan',
  },
  año: { type: Number, required: true },
  placa: { type: String, required: true, unique: true },
  vin: { type: String, required: false, unique: true },
  color: { type: String, required: true },
  kilometraje: { type: Number, required: true },
  precioCompra: { type: Number, required: true },
  precioVenta: { type: Number, required: true },
  fechaIngreso: { type: Date, default: Date.now },
  fechaListoVenta: { type: Date },
  fechaVenta: { type: Date },
  gastos: {
    pintura: { type: Number, default: 0 },
    mecanica: { type: Number, default: 0 },
    traspaso: { type: Number, default: 0 },
    alistamiento: { type: Number, default: 0 },
    tapiceria: { type: Number, default: 0 },
    transporte: { type: Number, default: 0 },
    varios: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  gastosDetallados: {
    pintura: [gastoDetalleSchema],
    mecanica: [gastoDetalleSchema],
    traspaso: [gastoDetalleSchema],
    alistamiento: [gastoDetalleSchema],
    tapiceria: [gastoDetalleSchema],
    transporte: [gastoDetalleSchema],
    varios: [gastoDetalleSchema],
  },
  inversionistas: [inversionistaSchema],
  tieneInversionistas: { type: Boolean, default: false },
  estado: {
    type: String,
    enum: ['en_proceso', 'listo_venta', 'en_negociacion', 'separado', 'vendido', 'retirado'],
    default: 'en_proceso',
  },
  estadoTramite: {
    type: String,
    enum: ['firma_documentos', 'radicacion', 'revision_documentos', 'aprobado', 'rechazado'],
  },
  datosTarjetaPropiedad: {
    linea: { type: String, default: '' },
    cilindrada: { type: String, default: '' },
    claseVehiculo: { type: String, default: '' },
    servicio: { type: String, default: '' },
    tipoCarroceria: { type: String, default: '' },
    numeroMotor: { type: String, default: '' },
    capacidad: { type: String, default: '' },
    numeroChasis: { type: String, default: '' },
    propietario: { type: String, default: '' },
    identificacionPropietario: { type: String, default: '' },
  },
  datosVenta: {
    vendedor: {
      nombre: { type: String, default: '' },
      identificacion: { type: String, default: '' },
      direccion: { type: String, default: '' },
      telefono: { type: String, default: '' },
    },
    comprador: {
      nombre: { type: String, default: '' },
      identificacion: { type: String, default: '' },
      direccion: { type: String, default: '' },
      telefono: { type: String, default: '' },
      email: { type: String, default: '' },
    },
    vehiculoAdicional: {
      tipoCarroceria: { type: String, default: '' },
      capacidad: { type: String, default: '' },
      cilindrada: { type: String, default: '' },
      claseVehiculo: { type: String, default: '' },
      numeroPuertas: { type: Number, default: 4 },
      numeroMotor: { type: String, default: '' },
      numeroChasis: { type: String, default: '' },
      linea: { type: String, default: '' },
      actaManifiesto: { type: String, default: '' },
      sitioMatricula: { type: String, default: '' },
      tipoServicio: { type: String, default: 'PARTICULAR' },
    },
    transaccion: {
      lugarCelebracion: { type: String, default: '' },
      fechaCelebracion: { type: Date, default: Date.now },
      precioLetras: { type: String, default: '' },
      formaPago: { type: String, default: '' },
      vendedorAnterior: { type: String, default: '' },
      cedulaVendedorAnterior: { type: String, default: '' },
      diasTraspaso: { type: Number, default: 30 },
      fechaEntrega: { type: Date, default: Date.now },
      horaEntrega: { type: String, default: '' },
      domicilioContractual: { type: String, default: '' },
      clausulasAdicionales: { type: String, default: '' },
    },
    // Campos de comisión del vendedor
    comision: {
      monto: { type: Number, default: 0 },
      porcentaje: { type: Number, default: 0 },
      descripcion: { type: String, default: '' },
    },
  },
  datosSeparacion: {
    cliente: {
      nombre: { type: String, default: '' },
      identificacion: { type: String, default: '' },
      direccion: { type: String, default: '' },
      telefono: { type: String, default: '' },
      email: { type: String, default: '' },
    },
    valorSeparacion: { type: Number, default: 0 },
    fechaSeparacion: { type: Date },
    notas: { type: String, default: '' },
  },
  fotos: {
    exteriores: [{ type: String }],
    interiores: [{ type: String }],
    detalles: [{ type: String }],
    documentos: [{ type: String }],
  },
  documentacion: {
    soat: {
      tiene: { type: Boolean, default: false },
      fechaVencimiento: { type: Date },
      detalles: { type: String, default: '' },
      verificado: { type: Boolean, default: false },
    },
    tecnomecanica: {
      tiene: { type: Boolean, default: false },
      fechaVencimiento: { type: Date },
      detalles: { type: String, default: '' },
      verificado: { type: Boolean, default: false },
    },
    tarjetaPropiedad: {
      tiene: { type: Boolean, default: false },
      detalles: { type: String, default: '' },
      verificado: { type: Boolean, default: false },
    },
    prenda: {
      tiene: { type: Boolean, default: false },
      detalles: { type: String, default: '' },
    },
  },
  checklist: {
    pintura: { type: Boolean, default: false },
    mecanica: { type: Boolean, default: false },
    alistamiento: { type: Boolean, default: false },
    tapiceria: { type: Boolean, default: false },
    limpieza: { type: Boolean, default: false },
    papeles: { type: Boolean, default: false },
  },
  observaciones: { type: String, default: '' },
  registradoPor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

// Pre-save hook para calcular totales
vehicleSchema.pre('save', function (next) {
  // Calcular gastos generales
  const gastosGenerales =
    (this.gastos.pintura || 0) +
    (this.gastos.mecanica || 0) +
    (this.gastos.traspaso || 0) +
    (this.gastos.alistamiento || 0) +
    (this.gastos.tapiceria || 0) +
    (this.gastos.transporte || 0) +
    (this.gastos.varios || 0);

  // Calcular gastos de inversionistas
  const gastosInversionistas = (this.inversionistas || []).reduce((sum: number, inv: any) => {
    const totalInv = (inv.gastos || []).reduce((acc: number, g: any) => acc + (g.monto || 0), 0);
    return sum + totalInv;
  }, 0);

  // Calcular total de gastos (generales + inversionistas)
  this.gastos.total = gastosGenerales + gastosInversionistas;

  // Calcular distribución de inversionistas si existen
  if (this.inversionistas && this.inversionistas.length > 0) {
    const totalInversion = this.inversionistas.reduce((sum, inv) => sum + inv.montoInversion, 0);

    // Utilidad bruta (sin considerar gastos de inversionistas)
    const utilidadBruta = this.precioVenta - this.precioCompra - gastosGenerales;

    // Utilidad neta a distribuir (después de restar gastos de inversionistas)
    const utilidadNeta = utilidadBruta - gastosInversionistas;

    this.inversionistas.forEach((inv) => {
      // Calcular porcentaje de participación
      inv.porcentajeParticipacion = totalInversion > 0 ? (inv.montoInversion / totalInversion) * 100 : 0;

      // Calcular total de gastos del inversionista
      const totalGastosInv = inv.gastos?.reduce((s, g) => s + (g.monto || 0), 0) || 0;

      // Utilidad correspondiente = (porcentaje × utilidad neta) + gastos del inversionista
      const utilidadPorParticipacion = (inv.porcentajeParticipacion / 100) * utilidadNeta;
      inv.utilidadCorrespondiente = utilidadPorParticipacion + totalGastosInv;
    });
  }

  next();
});

// Método virtual para calcular costo total (compra + gastos)
vehicleSchema.virtual('costoTotal').get(function () {
  return this.precioCompra + this.gastos.total;
});

// Método virtual para calcular ganancia real (venta - compra - gastos)
vehicleSchema.virtual('ganancia').get(function () {
  return this.precioVenta - this.precioCompra - this.gastos.total;
});

// Método virtual para calcular margen de ganancia en porcentaje
vehicleSchema.virtual('margenGanancia').get(function () {
  const costoTotal = this.precioCompra + this.gastos.total;
  if (costoTotal === 0) return 0;
  return ((this.precioVenta - costoTotal) / costoTotal) * 100;
});

// Método virtual para calcular días en proceso
vehicleSchema.virtual('diasEnProceso').get(function () {
  if (!this.fechaIngreso) return 0;
  const fechaInicio = this.fechaIngreso;
  const fechaFin = this.fechaListoVenta || new Date();
  if (!fechaInicio || !fechaFin) return 0;
  const diffTime = fechaFin.getTime() - fechaInicio.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Método virtual para calcular días en vitrina
vehicleSchema.virtual('diasEnVitrina').get(function () {
  if (!this.fechaListoVenta) return 0;
  const fechaInicio = this.fechaListoVenta;
  const fechaFin = this.fechaVenta || new Date();
  if (!fechaInicio || !fechaFin) return 0;
  const diffTime = fechaFin.getTime() - fechaInicio.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Método virtual para verificar si está listo para venta
vehicleSchema.virtual('listoParaVenta').get(function () {
  const checklistCompleto = Object.values(this.checklist).every((item) => item === true);
  const documentosCompletos =
    this.documentacion.soat.verificado &&
    this.documentacion.tecnomecanica.verificado &&
    this.documentacion.tarjetaPropiedad.verificado &&
    !this.documentacion.prenda.tiene;

  return checklistCompleto && documentosCompletos;
});

// Configurar para incluir virtuales en JSON
vehicleSchema.set('toJSON', { virtuals: true });
vehicleSchema.set('toObject', { virtuals: true });

export default mongoose.model<IVehicleDocument>('Vehicle', vehicleSchema);
