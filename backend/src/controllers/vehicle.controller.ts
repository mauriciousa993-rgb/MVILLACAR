import { Request, Response } from 'express';
import Vehicle, { IVehicleDocument } from '../models/Vehicle';
import User from '../models/User';
import { AuthRequest } from '../types';
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import { ensureUploadsDir, getPhotoFileName, getUploadsDir } from '../utils/uploads';
import { isUsingCloudinary } from '../middleware/upload.middleware';

const VEHICLE_TYPES = new Set(['suv', 'pickup', 'sedan', 'hatchback']);
const SALE_READY_STATUS = 'listo_venta';
const NEGOTIATION_STATUS = 'en_negociacion';
const INVENTORY_STATUSES = ['en_proceso', SALE_READY_STATUS, NEGOTIATION_STATUS];

const normalizeVehicleType = (value: any): 'suv' | 'pickup' | 'sedan' | 'hatchback' => {
  const parsed = typeof value === 'string' ? value.toLowerCase().trim() : '';
  return VEHICLE_TYPES.has(parsed) ? (parsed as 'suv' | 'pickup' | 'sedan' | 'hatchback') : 'sedan';
};

const calculateVehicleTotalExpenses = (vehicle: any): number => {
  const gastos = vehicle.gastos || {};
  const gastosGenerales =
    (gastos.pintura || 0) +
    (gastos.mecanica || 0) +
    (gastos.traspaso || 0) +
    (gastos.alistamiento || 0) +
    (gastos.tapiceria || 0) +
    (gastos.transporte || 0) +
    (gastos.varios || 0);

  const gastosInversionistas = (vehicle.inversionistas || []).reduce((sum: number, inv: any) => {
    const totalInv = (inv.gastos || []).reduce((acc: number, g: any) => acc + (g.monto || 0), 0);
    return sum + totalInv;
  }, 0);

  return gastosGenerales + gastosInversionistas;
};

const calculateInvestorExpenses = (inversionista: any): number => {
  return (inversionista?.gastos || []).reduce((sum: number, gasto: any) => {
    return sum + (gasto?.monto || 0);
  }, 0);
};

const getInvestorUserId = (inversionista: any): string | undefined => {
  if (!inversionista?.usuario) return undefined;

  if (typeof inversionista.usuario === 'string') {
    return inversionista.usuario;
  }

  if (inversionista.usuario?._id) {
    return inversionista.usuario._id.toString();
  }

  if (typeof inversionista.usuario.toString === 'function') {
    return inversionista.usuario.toString();
  }

  return undefined;
};

type VehicleSaleData = NonNullable<IVehicleDocument['datosVenta']>;
type VehicleCardData = NonNullable<IVehicleDocument['datosTarjetaPropiedad']>;

const createEmptySaleData = (): VehicleSaleData => ({
  vendedor: {
    nombre: '',
    identificacion: '',
    direccion: '',
    telefono: '',
  },
  comprador: {
    nombre: '',
    identificacion: '',
    direccion: '',
    telefono: '',
    email: '',
  },
  vehiculoAdicional: {
    tipoCarroceria: '',
    capacidad: '',
    cilindrada: '',
    claseVehiculo: '',
    numeroPuertas: 4,
    numeroMotor: '',
    numeroChasis: '',
    linea: '',
    actaManifiesto: '',
    sitioMatricula: '',
    tipoServicio: 'PARTICULAR',
  },
  transaccion: {
    lugarCelebracion: '',
    fechaCelebracion: new Date(),
    precioLetras: '',
    formaPago: '',
    vendedorAnterior: '',
    cedulaVendedorAnterior: '',
    diasTraspaso: 30,
    fechaEntrega: new Date(),
    horaEntrega: '',
    domicilioContractual: '',
    clausulasAdicionales: '',
  },
  comision: {
    monto: 0,
    porcentaje: 0,
    descripcion: '',
  },
});

const getTrimmedString = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

const getFirstString = (...values: unknown[]): string => {
  for (const value of values) {
    const normalized = getTrimmedString(value);
    if (normalized) return normalized;
  }

  return '';
};

const getFirstNumber = (...values: unknown[]): number => {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return 0;
};

const getFirstDate = (...values: unknown[]): Date => {
  for (const value of values) {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
  }

  return new Date();
};

const normalizeTextValue = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase();

const normalizeSaleService = (value: unknown): string => {
  const text = getTrimmedString(value);
  if (!text) return '';

  const normalized = normalizeTextValue(text);

  if (normalized.includes('PUBLIC')) return 'PUBLICO';
  if (normalized.includes('OFICIAL')) return 'OFICIAL';
  if (normalized.includes('DIPLO')) return 'DIPLOMATICO';
  if (normalized.includes('PARTIC')) return 'PARTICULAR';

  return normalized;
};

const resolveVehicleSaleData = (
  vehicle: IVehicleDocument,
  source?: Partial<VehicleSaleData>
): VehicleSaleData => {
  const defaults = createEmptySaleData();
  const currentSale = (vehicle.datosVenta || {}) as Partial<VehicleSaleData>;
  const incomingSale = (source || {}) as Partial<VehicleSaleData>;
  const cardData = (vehicle.datosTarjetaPropiedad || {}) as Partial<VehicleCardData>;

  return {
    vendedor: {
      ...defaults.vendedor,
      ...(currentSale.vendedor || {}),
      ...(incomingSale.vendedor || {}),
    },
    comprador: {
      ...defaults.comprador,
      ...(currentSale.comprador || {}),
      ...(incomingSale.comprador || {}),
    },
    vehiculoAdicional: {
      ...defaults.vehiculoAdicional,
      ...(currentSale.vehiculoAdicional || {}),
      ...(incomingSale.vehiculoAdicional || {}),
      tipoCarroceria: getFirstString(
        incomingSale.vehiculoAdicional?.tipoCarroceria,
        currentSale.vehiculoAdicional?.tipoCarroceria,
        cardData.tipoCarroceria
      ),
      capacidad: getFirstString(
        incomingSale.vehiculoAdicional?.capacidad,
        currentSale.vehiculoAdicional?.capacidad,
        cardData.capacidad
      ),
      cilindrada: getFirstString(
        incomingSale.vehiculoAdicional?.cilindrada,
        currentSale.vehiculoAdicional?.cilindrada,
        cardData.cilindrada
      ),
      claseVehiculo: getFirstString(
        incomingSale.vehiculoAdicional?.claseVehiculo,
        currentSale.vehiculoAdicional?.claseVehiculo,
        cardData.claseVehiculo
      ),
      numeroPuertas: getFirstNumber(
        incomingSale.vehiculoAdicional?.numeroPuertas,
        currentSale.vehiculoAdicional?.numeroPuertas,
        defaults.vehiculoAdicional.numeroPuertas
      ),
      numeroMotor: getFirstString(
        incomingSale.vehiculoAdicional?.numeroMotor,
        currentSale.vehiculoAdicional?.numeroMotor,
        cardData.numeroMotor
      ),
      numeroChasis: getFirstString(
        incomingSale.vehiculoAdicional?.numeroChasis,
        currentSale.vehiculoAdicional?.numeroChasis,
        cardData.numeroChasis,
        vehicle.vin
      ),
      linea: getFirstString(
        incomingSale.vehiculoAdicional?.linea,
        currentSale.vehiculoAdicional?.linea,
        cardData.linea
      ),
      actaManifiesto: getFirstString(
        incomingSale.vehiculoAdicional?.actaManifiesto,
        currentSale.vehiculoAdicional?.actaManifiesto
      ),
      sitioMatricula: getFirstString(
        incomingSale.vehiculoAdicional?.sitioMatricula,
        currentSale.vehiculoAdicional?.sitioMatricula
      ),
      tipoServicio: getFirstString(
        normalizeSaleService(incomingSale.vehiculoAdicional?.tipoServicio),
        normalizeSaleService(currentSale.vehiculoAdicional?.tipoServicio),
        normalizeSaleService(cardData.servicio),
        defaults.vehiculoAdicional.tipoServicio
      ),
    },
    transaccion: {
      ...defaults.transaccion,
      ...(currentSale.transaccion || {}),
      ...(incomingSale.transaccion || {}),
      lugarCelebracion: getFirstString(
        incomingSale.transaccion?.lugarCelebracion,
        currentSale.transaccion?.lugarCelebracion
      ),
      fechaCelebracion: getFirstDate(
        incomingSale.transaccion?.fechaCelebracion,
        currentSale.transaccion?.fechaCelebracion,
        defaults.transaccion.fechaCelebracion
      ),
      precioLetras: getFirstString(
        incomingSale.transaccion?.precioLetras,
        currentSale.transaccion?.precioLetras
      ),
      formaPago: getFirstString(
        incomingSale.transaccion?.formaPago,
        currentSale.transaccion?.formaPago
      ),
      vendedorAnterior: getFirstString(
        incomingSale.transaccion?.vendedorAnterior,
        currentSale.transaccion?.vendedorAnterior,
        cardData.propietario
      ),
      cedulaVendedorAnterior: getFirstString(
        incomingSale.transaccion?.cedulaVendedorAnterior,
        currentSale.transaccion?.cedulaVendedorAnterior,
        cardData.identificacionPropietario
      ),
      diasTraspaso: getFirstNumber(
        incomingSale.transaccion?.diasTraspaso,
        currentSale.transaccion?.diasTraspaso,
        defaults.transaccion.diasTraspaso
      ),
      fechaEntrega: getFirstDate(
        incomingSale.transaccion?.fechaEntrega,
        currentSale.transaccion?.fechaEntrega,
        defaults.transaccion.fechaEntrega
      ),
      horaEntrega: getFirstString(
        incomingSale.transaccion?.horaEntrega,
        currentSale.transaccion?.horaEntrega
      ),
      domicilioContractual: getFirstString(
        incomingSale.transaccion?.domicilioContractual,
        currentSale.transaccion?.domicilioContractual,
        incomingSale.transaccion?.lugarCelebracion,
        currentSale.transaccion?.lugarCelebracion
      ),
      clausulasAdicionales: getFirstString(
        incomingSale.transaccion?.clausulasAdicionales,
        currentSale.transaccion?.clausulasAdicionales
      ),
    },
    comision: {
      ...defaults.comision,
      ...(currentSale.comision || {}),
      ...(incomingSale.comision || {}),
      monto: getFirstNumber(
        incomingSale.comision?.monto,
        currentSale.comision?.monto,
        defaults.comision.monto
      ),
      porcentaje: getFirstNumber(
        incomingSale.comision?.porcentaje,
        currentSale.comision?.porcentaje,
        defaults.comision.porcentaje
      ),
      descripcion: getFirstString(
        incomingSale.comision?.descripcion,
        currentSale.comision?.descripcion
      ),
    },
  };
};

const resolveVehicleDocumentInfo = (vehicle: IVehicleDocument, saleData: VehicleSaleData) => {
  const cardData = (vehicle.datosTarjetaPropiedad || {}) as Partial<VehicleCardData>;
  const hasPrenda = Boolean(vehicle.documentacion?.prenda?.tiene);

  return {
    vin: getFirstString(vehicle.vin, cardData.numeroChasis, saleData.vehiculoAdicional.numeroChasis),
    linea: getFirstString(saleData.vehiculoAdicional.linea, cardData.linea),
    cilindrada: getFirstString(saleData.vehiculoAdicional.cilindrada, cardData.cilindrada),
    claseVehiculo: getFirstString(saleData.vehiculoAdicional.claseVehiculo, cardData.claseVehiculo),
    tipoServicio: getFirstString(
      saleData.vehiculoAdicional.tipoServicio,
      normalizeSaleService(cardData.servicio)
    ),
    tipoCarroceria: getFirstString(
      saleData.vehiculoAdicional.tipoCarroceria,
      cardData.tipoCarroceria
    ),
    numeroMotor: getFirstString(saleData.vehiculoAdicional.numeroMotor, cardData.numeroMotor),
    capacidad: getFirstString(saleData.vehiculoAdicional.capacidad, cardData.capacidad),
    numeroChasis: getFirstString(
      saleData.vehiculoAdicional.numeroChasis,
      cardData.numeroChasis,
      vehicle.vin
    ),
    propietario: getFirstString(
      saleData.transaccion.vendedorAnterior,
      cardData.propietario
    ),
    identificacionPropietario: getFirstString(
      saleData.transaccion.cedulaVendedorAnterior,
      cardData.identificacionPropietario
    ),
    prenda: hasPrenda
      ? getFirstString(vehicle.documentacion?.prenda?.detalles, 'Si, revisar detalle de prenda')
      : 'No registra',
  };
};

// Crear nuevo vehículo
export const createVehicle = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const vehicleData = { ...req.body };
    vehicleData.tipoVehiculo = normalizeVehicleType(vehicleData.tipoVehiculo);
    vehicleData.registradoPor = req.user?.userId;

    const vehicle = new Vehicle(vehicleData);
    await vehicle.save();

    res.status(201).json({
      message: 'Vehículo creado exitosamente',
      vehicle,
    });
  } catch (error: any) {
    console.error('Error al crear vehículo:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({ 
        message: 'Error de validación', 
        errors: errors,
        details: error.message 
      });
      return;
    }
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      res.status(400).json({ 
        message: `Ya existe un vehículo con ${field === 'placa' ? 'esta placa' : 'este VIN'}`,
        field: field
      });
      return;
    }
    
    res.status(500).json({ 
      message: 'Error al crear vehículo', 
      error: error.message 
    });
  }
};

// Obtener todos los vehículos
export const getAllVehicles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { estado, marca, modelo, año } = req.query;
    const userRole = req.user?.rol;
    
    const filter: any = {};
    
    if (estado) filter.estado = estado;
    if (marca) filter.marca = new RegExp(marca as string, 'i');
    if (modelo) filter.modelo = new RegExp(modelo as string, 'i');
    if (año) filter.año = parseInt(año as string);

    const vehicles = await Vehicle.find(filter)
      .populate('registradoPor', 'nombre email')
      .sort({ fechaIngreso: -1 });

    if (userRole === 'visualizador') {
      const vehiclesSinFinanzas = vehicles.map(vehicle => {
        const vehicleObj = vehicle.toObject();
        delete vehicleObj.precioCompra;
        delete vehicleObj.precioVenta;
        delete vehicleObj.gastos;
        delete vehicleObj.gastosDetallados;
        delete vehicleObj.inversionistas;
        return vehicleObj;
      });
      res.json(vehiclesSinFinanzas);
      return;
    }
    
    if (userRole === 'vendedor') {
      const vehiclesVendedor = vehicles.map(vehicle => {
        const vehicleObj = vehicle.toObject();
        delete vehicleObj.precioCompra;
        delete vehicleObj.gastos;
        delete vehicleObj.gastosDetallados;
        delete vehicleObj.inversionistas;
        return vehicleObj;
      });
      res.json(vehiclesVendedor);
      return;
    }

    res.json(vehicles);
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener vehículos', error: error.message });
  }
};

// Obtener vehículo por ID
export const getVehicleById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.rol;

    const vehicle = await Vehicle.findById(id).populate('registradoPor', 'nombre email');

    if (!vehicle) {
      res.status(404).json({ message: 'Vehículo no encontrado' });
      return;
    }

    if (userRole === 'visualizador') {
      const vehicleObj = vehicle.toObject();
      const vehicleSinFinanzas = {
        ...vehicleObj,
        precioCompra: undefined,
        precioVenta: undefined,
        gastos: undefined,
        gastosDetallados: undefined,
        inversionistas: undefined,
      };
      res.json(vehicleSinFinanzas);
      return;
    }
    
    if (userRole === 'vendedor') {
      const vehicleObj = vehicle.toObject();
      const vehicleVendedor = {
        ...vehicleObj,
        precioCompra: undefined,
        gastos: undefined,
        gastosDetallados: undefined,
        inversionistas: undefined,
      };
      res.json(vehicleVendedor);
      return;
    }

    res.json(vehicle);
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener vehículo', error: error.message });
  }
};

// Actualizar vehículo
export const updateVehicle = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      res.status(404).json({ message: 'Vehículo no encontrado' });
      return;
    }

    // Detectar cambio de estado a 'listo_venta' y establecer fechaListoVenta
    const nuevoEstado = req.body.estado;
    const estadoAnterior = vehicle.estado;
    
    if (nuevoEstado === 'listo_venta' && estadoAnterior !== 'listo_venta') {
      req.body.fechaListoVenta = new Date();
    }

    // Usar una aproximación mixta: actualizar con findByIdAndUpdate pero mantener el documento
    // para campos complejos que requieren el hook pre-save
    const updateFields: any = { ...req.body };
    if (Object.prototype.hasOwnProperty.call(updateFields, 'tipoVehiculo')) {
      updateFields.tipoVehiculo = normalizeVehicleType(updateFields.tipoVehiculo);
    }
    
    // Eliminar campos problemáticos del update
    delete updateFields._id;
    delete updateFields.registradoPor;
    delete updateFields.createdAt;
    delete updateFields.updatedAt;
    
    // Convertir campos numéricos que vengan como string vacío
    if (updateFields.kilometraje === '') updateFields.kilometraje = 0;
    if (updateFields.precioCompra === '') updateFields.precioCompra = 0;
    if (updateFields.precioVenta === '') updateFields.precioVenta = 0;
    if (updateFields.año === '') updateFields.año = 0;

    // Actualizar directamente los campos simples y luego guardar para los complejos
    for (const [key, value] of Object.entries(updateFields)) {
      // Campos que necesitan manejo especial (arrays y objetos anidados)
      if (key === 'fotos' || key === 'gastos' || key === 'gastosDetallados' || 
          key === 'inversionistas' || key === 'datosVenta' || key === 'documentacion' || 
          key === 'checklist') {
        // Para objetos/arrays complejos, usamos el método set del documento
        if (value !== undefined) {
          (vehicle as any)[key] = value;
        }
      } else {
        // Para campos simples, actualizamos directamente
        if (value !== undefined) {
          (vehicle as any)[key] = value;
        }
      }
    }

    // Guardar el documento para que funcione el hook pre-save de gastos
    await vehicle.save();
    await vehicle.populate('registradoPor', 'nombre email');

    res.json({
      message: 'Vehículo actualizado exitosamente',
      vehicle,
    });

  } catch (error: any) {
    console.error('Error al actualizar vehículo:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      console.error('Validation errors:', errors);
      res.status(400).json({ 
        message: 'Error de validación', 
        errors: errors,
        details: error.message 
      });
      return;
    }
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      res.status(400).json({ 
        message: `Ya existe un vehículo con ${field === 'placa' ? 'esta placa' : 'este VIN'}`,
        field: field
      });
      return;
    }
    
    res.status(500).json({ 
      message: 'Error al actualizar vehículo', 
      error: error.message 
    });
  }
};

// Eliminar vehículo
export const deleteVehicle = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findByIdAndDelete(id);

    if (!vehicle) {
      res.status(404).json({ message: 'Vehículo no encontrado' });
      return;
    }

    const allPhotos = [
      ...vehicle.fotos.exteriores,
      ...vehicle.fotos.interiores,
      ...vehicle.fotos.detalles,
      ...vehicle.fotos.documentos,
    ];

    allPhotos.forEach((photo) => {
      const fileName = getPhotoFileName(photo);
      if (!fileName) return;
      const photoPath = path.join(getUploadsDir(), fileName);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    });

    res.json({ message: 'Vehículo eliminado exitosamente' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al eliminar vehículo', error: error.message });
  }
};

// Servir foto por nombre de archivo
export const getVehiclePhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    const fileName = getPhotoFileName(req.params.filename || '');
    
    // Verificar si es una URL de Cloudinary
    if (fileName.startsWith('https://res.cloudinary.com/') || fileName.startsWith('http://res.cloudinary.com/')) {
      // Redireccionar a la URL de Cloudinary
      res.redirect(fileName);
      return;
    }
    
    if (!fileName) {
      res.status(404).json({ message: 'Foto no encontrada' });
      return;
    }

    const photoPath = path.join(getUploadsDir(), fileName);
    if (!fs.existsSync(photoPath)) {
      res.status(404).json({ message: 'Foto no encontrada' });
      return;
    }

    res.sendFile(photoPath);
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener foto', error: error.message });
  }
};

// Obtener estadísticas
export const getStatistics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.rol;

    const totalVehiculos = await Vehicle.countDocuments();
    const vehiculosListos = await Vehicle.countDocuments({ estado: SALE_READY_STATUS });
    const vehiculosEnNegociacion = await Vehicle.countDocuments({ estado: NEGOTIATION_STATUS });
    const vehiculosPendientes = await Vehicle.countDocuments({ estado: 'en_proceso' });
    const vehiculosVendidos = await Vehicle.countDocuments({ estado: 'vendido' });

    const vehiculosEnStock = await Vehicle.find({
      estado: { $in: INVENTORY_STATUSES },
    });

    const vehiculosVendidosData = await Vehicle.find({ estado: 'vendido' });

    const valorInventarioTotal = vehiculosEnStock.reduce(
      (sum, vehicle) => {
        const precioCompra = vehicle.precioCompra || 0;
        const gastosTotal = calculateVehicleTotalExpenses(vehicle);
        return sum + precioCompra + gastosTotal;
      },
      0
    );

    const totalGastosSistema = vehiculosEnStock.reduce(
      (sum, vehicle) => sum + calculateVehicleTotalExpenses(vehicle),
      0
    );

    const gananciasEstimadasTotal = vehiculosEnStock.reduce(
      (sum, vehicle) => {
        const precioVenta = vehicle.precioVenta || 0;
        const precioCompra = vehicle.precioCompra || 0;
        const gastosTotal = calculateVehicleTotalExpenses(vehicle);
        const utilidad = precioVenta - precioCompra - gastosTotal;
        return sum + utilidad;
      },
      0
    );

    const gananciasRealesTotal = vehiculosVendidosData.reduce(
      (sum, vehicle) => {
        const precioVenta = vehicle.precioVenta || 0;
        const precioCompra = vehicle.precioCompra || 0;
        const gastosTotal = calculateVehicleTotalExpenses(vehicle);
        const utilidad = precioVenta - precioCompra - gastosTotal;
        return sum + utilidad;
      },
      0
    );

    const inversionistaIds = new Set<string>();
    vehiculosEnStock.forEach((vehicle) => {
      (vehicle.inversionistas || []).forEach((inv: any) => {
        const inversionistaId = getInvestorUserId(inv);
        if (inversionistaId) inversionistaIds.add(inversionistaId);
      });
    });

    const inversionistaRoles = new Map<string, string>();
    if (inversionistaIds.size > 0) {
      const inversionistasUsuarios = await User.find({
        _id: { $in: Array.from(inversionistaIds) },
      }).select('_id rol');

      inversionistasUsuarios.forEach((usuario: any) => {
        inversionistaRoles.set(usuario._id.toString(), usuario.rol);
      });
    }

    let inventarioInversionistasInvitados = 0;
    let rentabilidadEsperadaInversionistasInvitados = 0;
    let inventarioInversionistasAdmin = 0;
    let rentabilidadEsperadaInversionistasAdmin = 0;

    vehiculosEnStock.forEach((vehicle) => {
      const inversionistas = vehicle.inversionistas || [];
      if (inversionistas.length === 0) return;

      const totalInversionVehiculo = inversionistas.reduce(
        (sum, inv) => sum + (inv?.montoInversion || 0),
        0
      );
      const utilidadVehiculo =
        (vehicle.precioVenta || 0) -
        (vehicle.precioCompra || 0) -
        calculateVehicleTotalExpenses(vehicle);

      inversionistas.forEach((inv: any) => {
        const montoInversion = inv?.montoInversion || 0;
        const gastosInversionista = calculateInvestorExpenses(inv);
        const inventarioInversionista = montoInversion + gastosInversionista;
        const porcentajeParticipacion =
          totalInversionVehiculo > 0 ? montoInversion / totalInversionVehiculo : 0;
        const rentabilidadEsperada = utilidadVehiculo * porcentajeParticipacion;

        const inversionistaId = getInvestorUserId(inv);
        const rolInversionista = inversionistaId ? inversionistaRoles.get(inversionistaId) : undefined;
        const esAdmin = rolInversionista === 'admin';

        if (esAdmin) {
          inventarioInversionistasAdmin += inventarioInversionista;
          rentabilidadEsperadaInversionistasAdmin += rentabilidadEsperada;
        } else {
          inventarioInversionistasInvitados += inventarioInversionista;
          rentabilidadEsperadaInversionistasInvitados += rentabilidadEsperada;
        }
      });
    });

    let miInversion = 0;
    let misGastos = 0;
    let miUtilidadEstimada = 0;
    let miUtilidadReal = 0;
    
    // Para admin: calcular inversión de otros usuarios
    let inversionOtros = 0;
    let gastosOtros = 0;
    let utilidadEstimadaOtros = 0;
    let utilidadRealOtros = 0;

    if (userId) {
      vehiculosEnStock.forEach(vehicle => {
        const inversionista = vehicle.inversionistas?.find(
          inv => getInvestorUserId(inv) === userId
        );
        
        if (inversionista) {
          const totalInversion = vehicle.inversionistas.reduce((sum, inv) => sum + inv.montoInversion, 0);
          const porcentaje = totalInversion > 0 ? (inversionista.montoInversion / totalInversion) : 0;
          
          const gastosInv = calculateInvestorExpenses(inversionista);
          miInversion += inversionista.montoInversion + gastosInv;
          misGastos += gastosInv;
          
          const utilidadTotal = vehicle.precioVenta - vehicle.precioCompra - calculateVehicleTotalExpenses(vehicle);
          miUtilidadEstimada += utilidadTotal * porcentaje;
        }
      });

      vehiculosVendidosData.forEach(vehicle => {
        const inversionista = vehicle.inversionistas?.find(
          inv => getInvestorUserId(inv) === userId
        );
        
        if (inversionista) {
          miUtilidadReal += inversionista.utilidadCorrespondiente || 0;
        }
      });
      
      // Para admin: calcular valores de otros inversionistas
      if (userRole === 'admin') {
        vehiculosEnStock.forEach(vehicle => {
          const totalInversionVehiculo = vehicle.inversionistas?.reduce((sum, inv) => sum + inv.montoInversion, 0) || 0;
          const totalGastosInvVehiculo = vehicle.inversionistas?.reduce((sum, inv) => {
            const gastosInv = inv.gastos?.reduce((s, g) => s + (g.monto || 0), 0) || 0;
            return sum + gastosInv;
          }, 0) || 0;
          
          // Inversión del usuario actual en este vehículo
          const miInversionEnVehiculo = vehicle.inversionistas?.find(
            inv => getInvestorUserId(inv) === userId
          );
          const miMontoEnVehiculo = miInversionEnVehiculo 
            ? miInversionEnVehiculo.montoInversion + calculateInvestorExpenses(miInversionEnVehiculo)
            : 0;
          
          // Inversión de otros = total - mío
          const inversionOtrosEnVehiculo = totalInversionVehiculo + totalGastosInvVehiculo - miMontoEnVehiculo;
          inversionOtros += inversionOtrosEnVehiculo > 0 ? inversionOtrosEnVehiculo : 0;
          
          // Gastos de otros
          const misGastosEnVehiculo = miInversionEnVehiculo
            ? calculateInvestorExpenses(miInversionEnVehiculo)
            : 0;
          const gastosOtrosEnVehiculo = totalGastosInvVehiculo - misGastosEnVehiculo;
          gastosOtros += gastosOtrosEnVehiculo > 0 ? gastosOtrosEnVehiculo : 0;
          
          // Utilidad estimada de otros
          const utilidadTotal = vehicle.precioVenta - vehicle.precioCompra - calculateVehicleTotalExpenses(vehicle);
          const miPorcentaje = totalInversionVehiculo > 0 && miInversionEnVehiculo
            ? miInversionEnVehiculo.montoInversion / totalInversionVehiculo 
            : 0;
          const miUtilidadEnVehiculo = utilidadTotal * miPorcentaje;
          const utilidadOtrosEnVehiculo = utilidadTotal - miUtilidadEnVehiculo;
          utilidadEstimadaOtros += utilidadOtrosEnVehiculo;
        });

        vehiculosVendidosData.forEach(vehicle => {
          const totalUtilidadReal = vehicle.inversionistas?.reduce((sum, inv) => sum + (inv.utilidadCorrespondiente || 0), 0) || 0;
          const miUtilidadEnVehiculo = vehicle.inversionistas?.find(
            inv => getInvestorUserId(inv) === userId
          )?.utilidadCorrespondiente || 0;
          
          utilidadRealOtros += totalUtilidadReal - miUtilidadEnVehiculo;
        });
      }
    }

    res.json({
      totalVehiculos,
      vehiculosListos,
      vehiculosEnNegociacion,
      vehiculosPendientes,
      vehiculosVendidos,
      // Valores totales del sistema
      valorInventarioTotal,
      totalGastosSistema,
      gananciasEstimadasTotal,
      gananciasRealesTotal,
      // Valores del usuario actual (admin o inversionista)
      miInversion,
      misGastos,
      miUtilidadEstimada,
      miUtilidadReal,
      // Valores de otros usuarios (solo para admin)
      inversionOtros: userRole === 'admin' ? inversionOtros : undefined,
      gastosOtros: userRole === 'admin' ? gastosOtros : undefined,
      utilidadEstimadaOtros: userRole === 'admin' ? utilidadEstimadaOtros : undefined,
      utilidadRealOtros: userRole === 'admin' ? utilidadRealOtros : undefined,
      inventarioInversionistasInvitados:
        userRole === 'admin' ? inventarioInversionistasInvitados : undefined,
      rentabilidadEsperadaInversionistasInvitados:
        userRole === 'admin' ? rentabilidadEsperadaInversionistasInvitados : undefined,
      inventarioInversionistasAdmin:
        userRole === 'admin' ? inventarioInversionistasAdmin : undefined,
      rentabilidadEsperadaInversionistasAdmin:
        userRole === 'admin' ? rentabilidadEsperadaInversionistasAdmin : undefined,
      // Valores compatibles (retrocompatibilidad)
      valorInventario: userRole === 'admin' ? valorInventarioTotal : miInversion,
      totalGastos: userRole === 'admin' ? totalGastosSistema : misGastos,
      gananciasEstimadas: userRole === 'admin' ? gananciasEstimadasTotal : miUtilidadEstimada,
      gananciasReales: userRole === 'admin' ? gananciasRealesTotal : miUtilidadReal,
      vehiculosEnStock: vehiculosEnStock.length,
    });

  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
  }
};

// Exportar a Excel
export const exportToExcel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { estado } = req.query;
    
    const filter: any = {};
    if (estado) filter.estado = estado;

    const vehicles = await Vehicle.find(filter)
      .populate('registradoPor', 'nombre email')
      .sort({ fechaIngreso: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventario de Vehículos');

    worksheet.columns = [
      { header: 'Placa', key: 'placa', width: 12 },
      { header: 'Marca', key: 'marca', width: 15 },
      { header: 'Modelo', key: 'modelo', width: 15 },
      { header: 'Año', key: 'año', width: 10 },
      { header: 'Color', key: 'color', width: 12 },
      { header: 'VIN', key: 'vin', width: 20 },
      { header: 'Kilometraje', key: 'kilometraje', width: 12 },
      { header: 'Precio Compra', key: 'precioCompra', width: 15 },
      { header: 'Precio Venta', key: 'precioVenta', width: 15 },
      { header: 'Gastos Totales', key: 'gastosTotales', width: 15 },
      { header: 'Comisión', key: 'comision', width: 15 },
      { header: 'Ganancia Neta', key: 'gananciaNeta', width: 15 },
      { header: 'Estado', key: 'estado', width: 15 },
      { header: 'SOAT', key: 'soat', width: 12 },
      { header: 'Tecnomecánica', key: 'tecnomecanica', width: 15 },
      { header: 'Prenda', key: 'prenda', width: 10 },
      { header: 'Fecha Ingreso', key: 'fechaIngreso', width: 15 },
      { header: 'Fecha Venta', key: 'fechaVenta', width: 15 },
      { header: 'Vendedor', key: 'vendedor', width: 20 },
      { header: 'Registrado Por', key: 'registradoPor', width: 20 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    vehicles.forEach((vehicle) => {
      // Calcular gastos totales (generales + inversionistas)
      const gastosGenerales =
        (vehicle.gastos?.pintura || 0) +
        (vehicle.gastos?.mecanica || 0) +
        (vehicle.gastos?.traspaso || 0) +
        (vehicle.gastos?.alistamiento || 0) +
        (vehicle.gastos?.tapiceria || 0) +
        (vehicle.gastos?.transporte || 0) +
        (vehicle.gastos?.varios || 0);
      
      const gastosInversionistas = (vehicle.inversionistas || []).reduce((sum: number, inv: any) => {
        const totalInv = (inv.gastos || []).reduce((acc: number, g: any) => acc + (g.monto || 0), 0);
        return sum + totalInv;
      }, 0);
      
      const gastosTotales = gastosGenerales + gastosInversionistas;
      const comisionVendedor = vehicle.datosVenta?.comision?.monto || 0;
      const gananciaNeta = vehicle.precioVenta - vehicle.precioCompra - gastosTotales - comisionVendedor;
      
      worksheet.addRow({
        placa: vehicle.placa,
        marca: vehicle.marca,
        modelo: vehicle.modelo,
        año: vehicle.año,
        color: vehicle.color,
        vin: vehicle.vin || '',
        kilometraje: vehicle.kilometraje,
        precioCompra: vehicle.precioCompra,
        precioVenta: vehicle.precioVenta,
        gastosTotales: gastosTotales,
        comision: comisionVendedor,
        gananciaNeta: gananciaNeta,
        estado: vehicle.estado.replace('_', ' ').toUpperCase(),
        soat: vehicle.documentacion?.soat?.tiene ? 'Sí' : 'No',
        tecnomecanica: vehicle.documentacion?.tecnomecanica?.tiene ? 'Sí' : 'No',
        prenda: vehicle.documentacion?.prenda?.tiene ? 'Sí' : 'No',
        fechaIngreso: vehicle.fechaIngreso ? new Date(vehicle.fechaIngreso).toLocaleDateString('es-CO') : '',
        fechaVenta: vehicle.fechaVenta ? new Date(vehicle.fechaVenta).toLocaleDateString('es-CO') : '',
        vendedor: vehicle.datosVenta?.vendedor?.nombre || '',
        registradoPor: (vehicle.registradoPor as any)?.nombre || 'N/A',
      });
    });

    worksheet.getColumn('precioCompra').numFmt = '"$"#,##0.00';
    worksheet.getColumn('precioVenta').numFmt = '"$"#,##0.00';
    worksheet.getColumn('gastosTotales').numFmt = '"$"#,##0.00';
    worksheet.getColumn('comision').numFmt = '"$"#,##0.00';
    worksheet.getColumn('gananciaNeta').numFmt = '"$"#,##0.00';

    const fileName = `inventario-vehiculos-${Date.now()}.xlsx`;
    const filePath = path.join(ensureUploadsDir(), fileName);

    await workbook.xlsx.writeFile(filePath);

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error al descargar archivo:', err);
      }
      fs.unlinkSync(filePath);
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al exportar a Excel', error: error.message });
  }
};

// Subir fotos
export const uploadPhotos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { tipo } = req.body;

    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      res.status(404).json({ message: 'Vehículo no encontrado' });
      return;
    }

    const files = (req.files || []) as Array<{ filename?: string; path?: string }>;
    const useCloudinary = isUsingCloudinary();

    // Obtener las URLs de las fotos (de Cloudinary o nombre de archivo local)
    let fileUrls: string[];
    if (useCloudinary) {
      // Cloudinary devuelve la URL en 'path'
      fileUrls = files.map((file) => file.path as string);
    } else {
      // Almacenamiento local guarda solo el nombre de archivo
      fileUrls = files.map((file) => file.filename as string);
    }

    if (tipo === 'exteriores') {
      vehicle.fotos.exteriores.push(...fileUrls);
    } else if (tipo === 'interiores') {
      vehicle.fotos.interiores.push(...fileUrls);
    } else if (tipo === 'detalles') {
      vehicle.fotos.detalles.push(...fileUrls);
    } else if (tipo === 'documentos') {
      vehicle.fotos.documentos.push(...fileUrls);
    }

    await vehicle.save();

    res.json({
      message: 'Fotos subidas exitosamente',
      fotos: fileUrls,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al subir fotos', error: error.message });
  }
};

// Obtener vehículos con documentos próximos a vencer y vencidos
export const getVehiclesWithExpiringDocuments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const diasAlerta = 30;
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + diasAlerta);
    const fechaActual = new Date();

    // Buscar vehículos con documentos vencidos O próximos a vencer (en los próximos 30 días)
    const vehicles = await Vehicle.find({
      $or: [
        {
          // Documentos ya vencidos (fechaVencimiento < fecha actual)
          'documentacion.soat.fechaVencimiento': {
            $lt: fechaActual,
          },
        },
        {
          // SOAT próximo a vencer (entre ahora y 30 días)
          'documentacion.soat.fechaVencimiento': {
            $lte: fechaLimite,
            $gte: fechaActual,
          },
        },
        {
          // Documentos de tecnomecánica ya vencidos
          'documentacion.tecnomecanica.fechaVencimiento': {
            $lt: fechaActual,
          },
        },
        {
          // Tecnomecánica próxima a vencer (entre ahora y 30 días)
          'documentacion.tecnomecanica.fechaVencimiento': {
            $lte: fechaLimite,
            $gte: fechaActual,
          },
        },
      ],
    }).populate('registradoPor', 'nombre email');

    res.json(vehicles);
  } catch (error: any) {
    res.status(500).json({
      message: 'Error al obtener vehículos con documentos por vencer',
      error: error.message,
    });
  }
};

// Guardar datos de venta
export const saveSaleData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const datosVentaInput = req.body;

    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      res.status(404).json({ message: 'Vehículo no encontrado' });
      return;
    }

    const datosVenta = resolveVehicleSaleData(vehicle, datosVentaInput);
    vehicle.datosVenta = datosVenta;
    vehicle.estado = 'vendido';
    
    if (!vehicle.fechaVenta) {
      vehicle.fechaVenta = new Date();
    }

    await vehicle.save();

    res.json({
      message: 'Datos de venta guardados exitosamente',
      vehicle,
    });
  } catch (error: any) {
    console.error('Error en saveSaleData:', error);
    res.status(500).json({
      message: 'Error al guardar datos de venta',
      error: error.message,
    });
  }
};

// Guardar datos de separación
export const saveSeparationData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const datosSeparacion = req.body;

    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      res.status(404).json({ message: 'Vehículo no encontrado' });
      return;
    }

    vehicle.datosSeparacion = datosSeparacion;
    vehicle.estado = 'separado';

    await vehicle.save();

    res.json({
      message: 'Datos de separación guardados exitosamente',
      vehicle,
    });
  } catch (error: any) {
    console.error('Error en saveSeparationData:', error);
    res.status(500).json({
      message: 'Error al guardar datos de separación',
      error: error.message,
    });
  }
};

// Actualizar datos de separación
export const updateSeparationData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const datosSeparacion = req.body;

    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      res.status(404).json({ message: 'Vehículo no encontrado' });
      return;
    }

    vehicle.datosSeparacion = datosSeparacion;

    await vehicle.save();

    res.json({
      message: 'Datos de separación actualizados exitosamente',
      vehicle,
    });
  } catch (error: any) {
    console.error('Error en updateSeparationData:', error);
    res.status(500).json({
      message: 'Error al actualizar datos de separación',
      error: error.message,
    });
  }
};

// Generar contrato de compraventa en PDF
export const generateContract = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      res.status(404).json({ message: 'Vehículo no encontrado' });
      return;
    }

    const datosVenta = resolveVehicleSaleData(vehicle);
    const vehicleInfo = resolveVehicleDocumentInfo(vehicle, datosVenta);
    datosVenta.transaccion.domicilioContractual =
      datosVenta.transaccion.domicilioContractual ||
      datosVenta.transaccion.lugarCelebracion;
    vehicle.datosVenta = datosVenta;
    if (!datosVenta.comprador?.nombre ||
        !datosVenta.comprador?.identificacion ||
        !datosVenta.vendedor?.nombre ||
        !datosVenta.transaccion?.lugarCelebracion) {
      res.status(400).json({ 
        message: 'El vehículo no tiene datos de venta completos.' 
      });
      return;
    }

    const fechaCelebracion = datosVenta.transaccion.fechaCelebracion
      ? new Date(datosVenta.transaccion.fechaCelebracion)
      : new Date();
    
    const fechaEntrega = datosVenta.transaccion.fechaEntrega
      ? new Date(datosVenta.transaccion.fechaEntrega)
      : new Date();

    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const mesNombre = meses[fechaCelebracion.getMonth()];

    const doc = new PDFDocument({ 
      size: 'LETTER',
      margins: { top: 50, bottom: 50, left: 60, right: 60 }
    });

    const fileName = `contrato-${vehicle.placa}-${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    doc.pipe(res);

    // TÍTULO
    doc.fontSize(14).font('Helvetica-Bold')
       .text('CONTRATO DE COMPRAVENTA DE VEHICULO AUTOMOTOR', { align: 'center' });
    doc.moveDown(2);

    // LUGAR Y FECHA
    doc.fontSize(11).font('Helvetica-Bold').text('LUGAR Y FECHA DE CELEBRACION DEL CONTRATO:');
    doc.fontSize(10).font('Helvetica')
       .text(`${vehicle.datosVenta.transaccion.lugarCelebracion}, ${fechaCelebracion.getDate()} de ${mesNombre} de ${fechaCelebracion.getFullYear()}`);
    doc.moveDown();

    // VENDEDOR
    doc.fontSize(11).font('Helvetica-Bold').text('VENDEDOR(ES):');
    doc.fontSize(10).font('Helvetica')
       .text(`Nombre e Identificación: ${vehicle.datosVenta.vendedor.nombre} - ${vehicle.datosVenta.vendedor.identificacion}`)
       .text(`Dirección: ${vehicle.datosVenta.vendedor.direccion}`)
       .text(`Teléfono: ${vehicle.datosVenta.vendedor.telefono}`);
    doc.moveDown();

    // COMPRADOR
    doc.fontSize(11).font('Helvetica-Bold').text('COMPRADOR(ES):');
    doc.fontSize(10).font('Helvetica')
       .text(`Nombre e Identificación: ${vehicle.datosVenta.comprador.nombre} - ${vehicle.datosVenta.comprador.identificacion}`)
       .text(`Dirección: ${vehicle.datosVenta.comprador.direccion}`)
       .text(`Teléfono: ${vehicle.datosVenta.comprador.telefono}`)
       .text(`Correo electrónico: ${vehicle.datosVenta.comprador.email}`);
    doc.moveDown();

    // DOMICILIO CONTRACTUAL
    doc.fontSize(11).font('Helvetica-Bold').text('DOMICILIO CONTRACTUAL:');
    doc.fontSize(10).font('Helvetica')
       .text(vehicle.datosVenta.transaccion.domicilioContractual);
    doc.moveDown();

    // INTRODUCCIÓN
    doc.fontSize(10).font('Helvetica')
       .text('Las partes convienen celebrar el presente contrato de compraventa, que se regirá por las siguientes cláusulas:', { align: 'justify' });
    doc.moveDown();

    // CLÁUSULAS
    doc.fontSize(10).font('Helvetica-Bold').text('PRIMERA.-OBJETO DEL CONTRATO: ', { continued: true })
       .font('Helvetica').text('mediante el presente contrato EL VENDEDOR transfiere a título de venta y EL COMPRADOR adquiere la propiedad del vehículo automotor que a continuación se identifica:', { align: 'justify' });
    doc.moveDown(0.5);
    
    doc.fontSize(10).font('Helvetica')
       .text(`MARCA: ${vehicle.marca}                    MODELO: ${vehicle.año}`)
       .text(`LINEA: ${vehicleInfo.linea || 'N/A'}        CLASE: ${vehicleInfo.claseVehiculo || 'N/A'}`)
       .text(`COLOR: ${vehicle.color}        PLACA: ${vehicle.placa}`)
       .text(`VIN/CHASIS: ${vehicleInfo.numeroChasis || vehicleInfo.vin || 'N/A'}`)
       .text(`MOTOR: ${vehicleInfo.numeroMotor || 'N/A'}        CILINDRADA: ${vehicleInfo.cilindrada || 'N/A'}`)
       .text(`SERVICIO: ${vehicleInfo.tipoServicio || 'N/A'}        CARROCERIA: ${vehicleInfo.tipoCarroceria || 'N/A'}`)
       .text(`CAPACIDAD: ${vehicleInfo.capacidad || 'N/A'}`);
    doc.moveDown();

    doc.fontSize(10).font('Helvetica')
       .text(
         `Titular segun tarjeta de propiedad: ${vehicleInfo.propietario || 'N/A'} (${vehicleInfo.identificacionPropietario || 'N/A'}). Prenda: ${vehicleInfo.prenda}.`,
         { align: 'justify' }
       );
    doc.moveDown();

    // PRECIO
    doc.fontSize(10).font('Helvetica-Bold').text('SEGUNDA.- PRECIO: ', { continued: true })
       .font('Helvetica').text(`como precio del automotor descrito las partes acuerdan la suma de $${vehicle.precioVenta.toLocaleString('es-CO')}.`, { align: 'justify' });
    doc.moveDown();

    // FORMA DE PAGO
    doc.fontSize(10).font('Helvetica-Bold').text('TERCERA.- FORMA DE PAGO: ', { continued: true })
       .font('Helvetica').text(`EL COMPRADOR se compromete a pagar el precio de la siguiente forma: ${vehicle.datosVenta.transaccion.formaPago}`, { align: 'justify' });
    doc.moveDown();

    // ENTREGA
    const horaEntrega = vehicle.datosVenta.transaccion.horaEntrega || '[HORA]';
    doc.fontSize(10).font('Helvetica-Bold').text('CUARTA.- ENTREGA: ', { continued: true })
       .font('Helvetica').text(`En la fecha ${fechaEntrega.toLocaleDateString('es-CO')} y hora ${horaEntrega} EL VENDEDOR hace entrega real y material del vehículo a EL COMPRADOR.`, { align: 'justify' });
    doc.moveDown();

    // FIRMAS
    doc.moveDown(3);
    const signatureY = doc.y;
    
    doc.fontSize(10).font('Helvetica-Bold')
       .text('VENDEDOR', 60, signatureY, { width: 220, align: 'center' });
    doc.moveTo(60, signatureY + 30).lineTo(280, signatureY + 30).stroke();
    doc.fontSize(9).font('Helvetica')
       .text(`C.C. ${vehicle.datosVenta.vendedor.identificacion}`, 60, signatureY + 35, { width: 220, align: 'center' });

    doc.fontSize(10).font('Helvetica-Bold')
       .text('COMPRADOR', 320, signatureY, { width: 220, align: 'center' });
    doc.moveTo(320, signatureY + 30).lineTo(540, signatureY + 30).stroke();
    doc.fontSize(9).font('Helvetica')
       .text(`C.C. ${vehicle.datosVenta.comprador.identificacion}`, 320, signatureY + 35, { width: 220, align: 'center' });

    doc.end();

  } catch (error: any) {
    console.error('Error al generar contrato:', error);
    res.status(500).json({ 
      message: 'Error al generar contrato', 
      error: error.message 
    });
  }
};

// Generar formulario de traspaso en PDF
export const generateTransferForm = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      res.status(404).json({ message: 'Vehículo no encontrado' });
      return;
    }

    const datosVenta = resolveVehicleSaleData(vehicle);
    const vehicleInfo = resolveVehicleDocumentInfo(vehicle, datosVenta);
    vehicle.datosVenta = datosVenta;
    if (!vehicle.datosVenta.comprador?.nombre ||
        !vehicle.datosVenta.comprador?.identificacion ||
        !vehicle.datosVenta.vendedor?.nombre) {
      res.status(400).json({ 
        message: 'El vehículo no tiene datos de venta completos.' 
      });
      return;
    }

    const fechaCelebracion = vehicle.datosVenta.transaccion.fechaCelebracion 
      ? new Date(vehicle.datosVenta.transaccion.fechaCelebracion)
      : new Date();

    const doc = new PDFDocument({ 
      size: 'LEGAL',
      margins: { top: 30, bottom: 30, left: 40, right: 40 }
    });

    const fileName = `formulario-traspaso-${vehicle.placa}-${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    doc.pipe(res);

    // ENCABEZADO
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('MINISTERIO DE TRANSPORTE - FORMULARIO DE TRASPASO', 40, 40, { align: 'center' });
    doc.moveDown();

    // Información básica del vehículo
    doc.fontSize(9).font('Helvetica');
    doc.text(`Placa: ${vehicle.placa} | Marca: ${vehicle.marca} | Modelo: ${vehicle.año} | Color: ${vehicle.color}`);
    doc.moveDown();

    // VENDEDOR
    doc.fontSize(10).font('Helvetica-Bold').text('DATOS DEL VENDEDOR:');
    doc.fontSize(9).font('Helvetica')
       .text(`Nombre: ${vehicle.datosVenta.vendedor.nombre}`)
       .text(`Identificación: ${vehicle.datosVenta.vendedor.identificacion}`)
       .text(`Dirección: ${vehicle.datosVenta.vendedor.direccion}`)
       .text(`Teléfono: ${vehicle.datosVenta.vendedor.telefono}`);
    doc.moveDown();

    // COMPRADOR
    doc.fontSize(10).font('Helvetica-Bold').text('DATOS DEL COMPRADOR:');
    doc.fontSize(9).font('Helvetica')
       .text(`Nombre: ${vehicle.datosVenta.comprador.nombre}`)
       .text(`Identificación: ${vehicle.datosVenta.comprador.identificacion}`)
       .text(`Dirección: ${vehicle.datosVenta.comprador.direccion}`)
       .text(`Teléfono: ${vehicle.datosVenta.comprador.telefono}`)
       .text(`Email: ${vehicle.datosVenta.comprador.email}`);
    doc.moveDown();

    // VEHÍCULO
    doc.fontSize(10).font('Helvetica-Bold').text('DATOS DEL VEHÍCULO:');
    doc.fontSize(9).font('Helvetica')
       .text(`VIN: ${vehicleInfo.vin || 'N/A'}`)
       .text(`Chasis: ${vehicleInfo.numeroChasis || 'N/A'}`)
       .text(`Motor: ${vehicleInfo.numeroMotor || 'N/A'}`)
       .text(`Carrocería: ${vehicle.datosVenta.vehiculoAdicional?.tipoCarroceria || 'N/A'}`)
       .text(`Capacidad: ${vehicleInfo.capacidad || 'N/A'}`)
       .text(`Linea: ${vehicleInfo.linea || 'N/A'}`)
       .text(`Clase: ${vehicleInfo.claseVehiculo || 'N/A'}`)
       .text(`Servicio: ${vehicleInfo.tipoServicio || 'N/A'}`)
       .text(`Cilindrada: ${vehicleInfo.cilindrada || 'N/A'}`)
       .text(`Propietario: ${vehicleInfo.propietario || 'N/A'}`)
       .text(`Identificacion propietario: ${vehicleInfo.identificacionPropietario || 'N/A'}`)
       .text(`Prenda: ${vehicleInfo.prenda}`);
    doc.moveDown();

    // Fecha y lugar
    doc.fontSize(10).font('Helvetica-Bold').text('LUGAR Y FECHA:');
    doc.fontSize(9).font('Helvetica')
       .text(`${vehicle.datosVenta.transaccion.lugarCelebracion}, ${fechaCelebracion.toLocaleDateString('es-CO')}`);
    doc.moveDown(2);

    // Firmas
    const signatureY = doc.y;
    doc.fontSize(9).font('Helvetica')
       .text('_______________________', 40, signatureY)
       .text('Firma Vendedor', 40, signatureY + 15)
       .text(`C.C. ${vehicle.datosVenta.vendedor.identificacion}`, 40, signatureY + 30);

    doc.text('_______________________', 300, signatureY)
       .text('Firma Comprador', 300, signatureY + 15)
       .text(`C.C. ${vehicle.datosVenta.comprador.identificacion}`, 300, signatureY + 30);

    doc.end();

  } catch (error: any) {
    console.error('Error al generar formulario:', error);
    res.status(500).json({ 
      message: 'Error al generar formulario de traspaso', 
      error: error.message 
    });
  }
};

// Exportar reporte individual de vehículo a Excel
export const exportVehicleReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findById(id).populate('registradoPor', 'nombre email');

    if (!vehicle) {
      res.status(404).json({ message: 'Vehículo no encontrado' });
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Detalle del Vehículo');

    worksheet.columns = [
      { width: 30 },
      { width: 40 },
      { width: 20 },
      { width: 15 },
    ];

    // Título
    worksheet.mergeCells('A1:D1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `REPORTE - ${vehicle.marca} ${vehicle.modelo} (${vehicle.placa})`;
    titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 30;

    let currentRow = 3;

    const addSection = (title: string) => {
      worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
      const cell = worksheet.getCell(`A${currentRow}`);
      cell.value = title;
      cell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF5B9BD5' },
      };
      currentRow++;
    };

    const addDataRow = (label: string, value: any, extra: string = '') => {
      worksheet.getCell(`A${currentRow}`).value = label;
      worksheet.getCell(`A${currentRow}`).font = { bold: true };
      worksheet.getCell(`B${currentRow}`).value = extra;
      worksheet.getCell(`C${currentRow}`).value = value;
      currentRow++;
    };

    // Información Básica
    addSection('INFORMACIÓN BÁSICA');
    addDataRow('Marca', vehicle.marca);
    addDataRow('Modelo', vehicle.modelo);
    addDataRow('Año', vehicle.año);
    addDataRow('Placa', vehicle.placa);
    addDataRow('Color', vehicle.color);
    addDataRow('Kilometraje', vehicle.kilometraje.toLocaleString('es-CO') + ' km');
    addDataRow('Estado', vehicle.estado.replace('_', ' ').toUpperCase());
    addDataRow('Fecha de Ingreso', vehicle.fechaIngreso.toLocaleDateString('es-CO'));
    currentRow++;

    // Información Financiera
    addSection('RESUMEN FINANCIERO');
    const costoTotal = vehicle.precioCompra + vehicle.gastos.total;
    const utilidad = vehicle.precioVenta - costoTotal;
    const margen = costoTotal > 0 ? ((utilidad / costoTotal) * 100).toFixed(2) : '0';

    addDataRow('Precio de Compra', `$${vehicle.precioCompra.toLocaleString('es-CO')}`);
    addDataRow('Total de Gastos', `$${vehicle.gastos.total.toLocaleString('es-CO')}`);
    addDataRow('COSTO TOTAL', `$${costoTotal.toLocaleString('es-CO')}`, 'Compra + Gastos');
    addDataRow('Precio de Venta', `$${vehicle.precioVenta.toLocaleString('es-CO')}`);
    addDataRow('UTILIDAD', `$${utilidad.toLocaleString('es-CO')}`, `${margen}% margen`);
    currentRow++;

    // Inversionistas
    if (vehicle.inversionistas && vehicle.inversionistas.length > 0) {
      addSection('INVERSIONISTAS');
      
      const totalInversion = vehicle.inversionistas.reduce((sum, inv) => sum + inv.montoInversion, 0);
      
      vehicle.inversionistas.forEach((inv) => {
        const porcentaje = totalInversion > 0 ? (inv.montoInversion / totalInversion) * 100 : 0;
        addDataRow(inv.nombre, `$${inv.montoInversion.toLocaleString('es-CO')}`, `${porcentaje.toFixed(2)}%`);
      });
      currentRow++;
    }

    // Generar archivo
    const fileName = `vehiculo-${vehicle.placa}-${Date.now()}.xlsx`;
    const filePath = path.join(ensureUploadsDir(), fileName);

    await workbook.xlsx.writeFile(filePath);

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error al descargar archivo:', err);
      }
      fs.unlinkSync(filePath);
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al exportar reporte del vehículo', error: error.message });
  }
};

// Exportar reporte mensual de ventas a Excel
export const exportMonthlyReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { year } = req.query;
    const selectedYear = year ? parseInt(year as string) : new Date().getFullYear();

    const startDate = new Date(selectedYear, 0, 1);
    const endDate = new Date(selectedYear, 11, 31, 23, 59, 59);

    const vehiculosVendidos = await Vehicle.find({
      estado: 'vendido',
      fechaVenta: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ fechaVenta: 1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Ventas ${selectedYear}`);

    // Título
    worksheet.mergeCells('A1:I1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `REPORTE DE VENTAS - AÑO ${selectedYear}`;
    titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 30;

    // Encabezados
    worksheet.columns = [
      { header: 'Fecha Venta', key: 'fechaVenta', width: 15 },
      { header: 'Mes', key: 'mes', width: 12 },
      { header: 'Placa', key: 'placa', width: 12 },
      { header: 'Marca', key: 'marca', width: 15 },
      { header: 'Modelo', key: 'modelo', width: 15 },
      { header: 'Año', key: 'año', width: 10 },
      { header: 'Precio Venta', key: 'precioVenta', width: 15 },
      { header: 'Costo Total', key: 'costoTotal', width: 15 },
      { header: 'Utilidad', key: 'utilidad', width: 15 },
    ];

    const headerRow = worksheet.getRow(3);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF5B9BD5' },
    };

    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    let totalVentas = 0;
    let totalGastos = 0;
    let totalUtilidad = 0;

    vehiculosVendidos.forEach((vehiculo) => {
      if (!vehiculo.fechaVenta) return;

      const fecha = new Date(vehiculo.fechaVenta);
      const mesNombre = meses[fecha.getMonth()];
      const costoTotal = vehiculo.precioCompra + vehiculo.gastos.total;
      const utilidad = vehiculo.precioVenta - costoTotal;

      totalVentas += vehiculo.precioVenta;
      totalGastos += costoTotal;
      totalUtilidad += utilidad;

      worksheet.addRow({
        fechaVenta: fecha.toLocaleDateString('es-CO'),
        mes: mesNombre,
        placa: vehiculo.placa,
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        año: vehiculo.año,
        precioVenta: vehiculo.precioVenta,
        costoTotal: costoTotal,
        utilidad: utilidad,
      });
    });

    // Formato de moneda
    worksheet.getColumn('precioVenta').numFmt = '"$"#,##0';
    worksheet.getColumn('costoTotal').numFmt = '"$"#,##0';
    worksheet.getColumn('utilidad').numFmt = '"$"#,##0';

    // Fila de totales
    const lastRow = worksheet.lastRow!.number + 2;
    worksheet.mergeCells(`A${lastRow}:F${lastRow}`);
    const totalLabelCell = worksheet.getCell(`A${lastRow}`);
    totalLabelCell.value = 'TOTALES';
    totalLabelCell.font = { bold: true, size: 12 };
    totalLabelCell.alignment = { horizontal: 'right' };

    worksheet.getCell(`G${lastRow}`).value = totalVentas;
    worksheet.getCell(`G${lastRow}`).numFmt = '"$"#,##0';
    worksheet.getCell(`G${lastRow}`).font = { bold: true };

    worksheet.getCell(`H${lastRow}`).value = totalGastos;
    worksheet.getCell(`H${lastRow}`).numFmt = '"$"#,##0';
    worksheet.getCell(`H${lastRow}`).font = { bold: true };

    worksheet.getCell(`I${lastRow}`).value = totalUtilidad;
    worksheet.getCell(`I${lastRow}`).numFmt = '"$"#,##0';
    worksheet.getCell(`I${lastRow}`).font = { bold: true, color: { argb: totalUtilidad >= 0 ? 'FF00B050' : 'FFFF0000' } };

    // Generar archivo
    const fileName = `reporte-ventas-${selectedYear}-${Date.now()}.xlsx`;
    const filePath = path.join(ensureUploadsDir(), fileName);

    await workbook.xlsx.writeFile(filePath);

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error al descargar archivo:', err);
      }
      fs.unlinkSync(filePath);
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al exportar reporte mensual', error: error.message });
  }
};

// Obtener reportes mensuales de ventas y gastos
export const getMonthlyReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { year } = req.query;
    const selectedYear = year ? parseInt(year as string) : new Date().getFullYear();

    const startDate = new Date(selectedYear, 0, 1);
    const endDate = new Date(selectedYear, 11, 31, 23, 59, 59);

    const vehiculosVendidos = await Vehicle.find({
      estado: 'vendido',
      fechaVenta: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ fechaVenta: 1 });

    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const reportesPorMes: any = {};

    vehiculosVendidos.forEach((vehiculo) => {
      if (!vehiculo.fechaVenta) return;

      const fecha = new Date(vehiculo.fechaVenta);
      const mesIndex = fecha.getMonth();
      const mesNombre = meses[mesIndex];

      if (!reportesPorMes[mesNombre]) {
        reportesPorMes[mesNombre] = {
          mes: mesNombre,
          año: selectedYear,
          totalVentas: 0,
          totalGastos: 0,
          utilidad: 0,
          cantidadVehiculos: 0,
          vehiculos: [],
        };
      }

      const costoTotal = vehiculo.precioCompra + vehiculo.gastos.total;
      const utilidad = vehiculo.precioVenta - costoTotal;

      reportesPorMes[mesNombre].totalVentas += vehiculo.precioVenta;
      reportesPorMes[mesNombre].totalGastos += costoTotal;
      reportesPorMes[mesNombre].utilidad += utilidad;
      reportesPorMes[mesNombre].cantidadVehiculos += 1;
      reportesPorMes[mesNombre].vehiculos.push({
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        año: vehiculo.año,
        placa: vehiculo.placa,
        precioVenta: vehiculo.precioVenta,
        precioCompra: vehiculo.precioCompra,
        gastosTotal: vehiculo.gastos.total,
        utilidad: utilidad,
        fechaVenta: vehiculo.fechaVenta,
      });
    });

    const reportes = meses
      .map((mes) => reportesPorMes[mes])
      .filter((reporte) => reporte !== undefined);

    res.json(reportes);
  } catch (error: any) {
    res.status(500).json({
      message: 'Error al generar reportes mensuales',
      error: error.message,
    });
  }
};

// Consulta pública del estado de trámite por placa (sin autenticación)
export const consultarEstadoTramite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { placa } = req.params;

    if (!placa) {
      res.status(400).json({ message: 'La placa es requerida' });
      return;
    }

    const vehicle = await Vehicle.findOne({ 
      placa: placa.toUpperCase(),
      estado: 'vendido'
    }).select('marca modelo año placa color estado estadoTramite fechaVenta datosVenta');

    if (!vehicle) {
      res.status(404).json({ 
        message: 'No se encontró un vehículo vendido con esta placa',
        found: false
      });
      return;
    }

    const response = {
      found: true,
      vehiculo: {
        marca: vehicle.marca,
        modelo: vehicle.modelo,
        año: vehicle.año,
        placa: vehicle.placa,
        color: vehicle.color,
        fechaVenta: vehicle.fechaVenta,
        estadoTramite: vehicle.estadoTramite || 'firma_documentos',
        comprador: {
          nombre: vehicle.datosVenta?.comprador?.nombre || 'No especificado'
        }
      }
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error al consultar estado de trámite:', error);
    res.status(500).json({ 
      message: 'Error al consultar estado de trámite', 
      error: error.message 
    });
  }
};
