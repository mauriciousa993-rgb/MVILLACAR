export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'vendedor' | 'visualizador' | 'inversionista';
  activo: boolean;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

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

export interface FixedExpense {
  _id: string;
  nombre: string;
  categoria: FixedExpenseCategory;
  monto: number;
  diaPago: number;
  proveedor: string;
  metodoPago: string;
  fechaInicio: string;
  fechaFin?: string;
  observaciones: string;
  activo: boolean;
  registradoPor?: {
    _id?: string;
    id?: string;
    nombre?: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GastoInversionista {
  categoria: 'pintura' | 'mecanica' | 'traspaso' | 'alistamiento' | 'tapiceria' | 'transporte' | 'varios';
  monto: number;
  descripcion: string;
  fecha: string;
}

export interface Inversionista {
  usuario: string; // ID del usuario inversionista
  nombre: string;
  montoInversion: number;
  gastos: GastoInversionista[];
  porcentajeParticipacion: number;
  utilidadCorrespondiente: number;
}

export interface GastoDetalle {
  descripcion: string;
  encargado: string;
  fecha: string;
  monto: number;
}

export interface DatosSeparacion {
  cliente: {
    nombre: string;
    identificacion: string;
    direccion: string;
    telefono: string;
    email: string;
  };
  valorSeparacion: number;
  fechaSeparacion: string | Date;
  notas?: string;
}

export interface DatosVenta {
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
    fechaCelebracion: string;
    precioLetras: string;
    formaPago: string;
    vendedorAnterior: string;
    cedulaVendedorAnterior: string;
    diasTraspaso: number;
    fechaEntrega: string;
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

export interface DatosTarjetaPropiedad {
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

export type InspectionStatus = 'bien' | 'mal';
export type TransmissionType = '' | 'mecanica' | 'automatica';

export interface VehicleInspectionItem {
  key: string;
  label: string;
  category: string;
  status: InspectionStatus;
  observaciones: string;
  responsable: string;
  porcentajeEstado?: number | null;
  tipoTransmision?: TransmissionType;
}

export interface VehicleDamageZoneMarkerPosition {
  x: number;
  y: number;
  z: number;
}

export interface VehicleDamageZone {
  key: string;
  label: string;
  status: InspectionStatus;
  observaciones: string;
  responsable: string;
  markerPositions?: VehicleDamageZoneMarkerPosition[];
  markerPosition?: VehicleDamageZoneMarkerPosition | null;
}

export interface VehicleInspectionChecklist {
  _id?: string;
  vehicle: string;
  inspectorName: string;
  inspectionDate: string;
  items: VehicleInspectionItem[];
  damageZones: VehicleDamageZone[];
  generalObservations: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VehicleInspectionChecklistPayload {
  inspectorName: string;
  inspectionDate: string;
  items: VehicleInspectionItem[];
  damageZones: VehicleDamageZone[];
  generalObservations: string;
}

export interface Vehicle {
  _id: string;
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
  gastosDetallados?: {
    pintura: GastoDetalle[];
    mecanica: GastoDetalle[];
    traspaso: GastoDetalle[];
    alistamiento: GastoDetalle[];
    tapiceria: GastoDetalle[];
    transporte: GastoDetalle[];
    varios: GastoDetalle[];
  };
  inversionistas: Inversionista[];
  tieneInversionistas: boolean;
  estado: 'en_proceso' | 'listo_venta' | 'en_negociacion' | 'separado' | 'vendido' | 'retirado';
  estadoTramite?: 'firma_documentos' | 'radicacion' | 'recepcion_tarjeta' | 'entrega_cliente' | 'completado';
  datosTarjetaPropiedad?: DatosTarjetaPropiedad;
  documentacion: {
    prenda: {
      tiene: boolean;
      detalles?: string;
      verificado: boolean;
    };
    soat: {
      tiene: boolean;
      fechaVencimiento?: string;
      foto?: string;
      verificado: boolean;
    };
    tecnomecanica: {
      tiene: boolean;
      fechaVencimiento?: string;
      foto?: string;
      verificado: boolean;
    };
    tarjetaPropiedad: {
      tiene: boolean;
      foto?: string;
      verificado: boolean;
    };
  };
  checklist: {
    revisionMecanica: boolean;
    limpiezaDetailing: boolean;
    fotografiasCompletas: boolean;
    documentosCompletos: boolean;
    precioEstablecido: boolean;
  };
  fotos: {
    exteriores: string[];
    interiores: string[];
    detalles: string[];
    documentos: string[];
  };
  observaciones: string;
  pendientes: string[];
  fechaIngreso: string;
  fechaVenta?: string;
  fechaListoVenta?: string;
  datosVenta?: DatosVenta;
  datosSeparacion?: DatosSeparacion;
  inspectionChecklist?: VehicleInspectionChecklist;
  registradoPor: {
    _id: string;
    nombre: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Statistics {
  totalVehiculos: number;
  vehiculosListos: number;
  vehiculosEnNegociacion?: number;
  vehiculosPendientes: number;
  vehiculosVendidos: number;
  // Valores del sistema (totales)
  valorInventario: number;
  valorInventarioTotal?: number;
  totalGastos: number;
  totalGastosSistema?: number;
  gananciasEstimadas: number;
  gananciasEstimadasTotal?: number;
  gananciasReales: number;
  gananciasRealesTotal?: number;
  vehiculosEnStock: number;
  // Valores del inversionista
  miInversion?: number;
  misGastos?: number;
  miUtilidadEstimada?: number;
  miUtilidadReal?: number;
  // Nuevos totales por tipo de inversionista (solo admin)
  inventarioInversionistasInvitados?: number;
  rentabilidadEsperadaInversionistasInvitados?: number;
  inventarioInversionistasAdmin?: number;
  rentabilidadEsperadaInversionistasAdmin?: number;
}

export interface VehicleFormData {
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
  observaciones?: string;
}
