import { Request } from 'express';

export interface IUser {
  _id: string;
  nombre: string;
  email: string;
  password: string;
  rol: 'admin' | 'vendedor' | 'visualizador';
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    rol: string;
  };
  files?: any;
  [key: string]: any;
}

export interface IVehicle {
  _id: string;
  // Datos básicos
  marca: string;
  modelo: string;
  año: number;
  placa: string;
  vin: string;
  color: string;
  kilometraje: number;
  
  // Precios
  precioCompra: number;
  precioVenta: number;
  
  // Estado
  estado: 'en_proceso' | 'listo_venta' | 'en_negociacion' | 'separado' | 'vendido' | 'retirado';
  datosTarjetaPropiedad?: {
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
  };
  
  // Documentación
  documentacion: {
    prenda: {
      tiene: boolean;
      detalles?: string;
      verificado: boolean;
    };
    soat: {
      tiene: boolean;
      fechaVencimiento?: Date;
      foto?: string;
      verificado: boolean;
    };
    tecnomecanica: {
      tiene: boolean;
      fechaVencimiento?: Date;
      foto?: string;
      verificado: boolean;
    };
    tarjetaPropiedad: {
      tiene: boolean;
      foto?: string;
      verificado: boolean;
    };
  };
  
  // Checklist de ingreso
  checklist: {
    revisionMecanica: boolean;
    limpiezaDetailing: boolean;
    fotografiasCompletas: boolean;
    documentosCompletos: boolean;
    precioEstablecido: boolean;
  };
  
  // Fotos
  fotos: {
    exteriores: string[];
    interiores: string[];
    detalles: string[];
    documentos: string[];
  };
  
  // Observaciones
  observaciones: string;
  pendientes: string[];
  
  // Fechas
  fechaIngreso: Date;
  fechaVenta?: Date;
  
  // Usuario que registró
  registradoPor: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface IChecklistItem {
  nombre: string;
  completado: boolean;
  fecha?: Date;
}

export interface IEstadisticas {
  totalVehiculos: number;
  vehiculosListos: number;
  vehiculosEnNegociacion: number;
  vehiculosPendientes: number;
  vehiculosVendidos: number;
  valorInventario: number;
  gananciasEstimadas: number;
}
