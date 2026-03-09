import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { DatosVenta, Vehicle } from '../types';
import { useAuth } from '../context/AuthContext';

interface SaleDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DatosVenta) => void;
  vehiclePlaca: string;
  vehicleData?: Vehicle | null;
  initialData?: DatosVenta;
  isEditMode?: boolean;
}

type PartialSaleData = {
  vendedor?: Partial<DatosVenta['vendedor']>;
  comprador?: Partial<DatosVenta['comprador']>;
  vehiculoAdicional?: Partial<DatosVenta['vehiculoAdicional']>;
  transaccion?: Partial<DatosVenta['transaccion']>;
  comision?: Partial<DatosVenta['comision']>;
};

const stripDiacritics = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const normalizeTipoServicio = (value?: string) => {
  const text = (value || '').trim();
  if (!text) return 'PARTICULAR';

  const normalized = stripDiacritics(text).toUpperCase();

  if (normalized.includes('PUBLIC')) return 'PUBLICO';
  if (normalized.includes('OFICIAL')) return 'OFICIAL';
  if (normalized.includes('DIPLO')) return 'DIPLOMATICO';
  if (normalized.includes('PARTIC')) return 'PARTICULAR';

  return normalized;
};

const createBaseSaleData = (sellerName: string): DatosVenta => ({
  vendedor: {
    nombre: sellerName,
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
    fechaCelebracion: new Date().toISOString().split('T')[0],
    precioLetras: '',
    formaPago: '',
    vendedorAnterior: '',
    cedulaVendedorAnterior: '',
    diasTraspaso: 30,
    fechaEntrega: new Date().toISOString().split('T')[0],
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

const mergeSaleData = (base: DatosVenta, override?: PartialSaleData): DatosVenta => ({
  ...base,
  ...override,
  vendedor: {
    ...base.vendedor,
    ...(override?.vendedor || {}),
  },
  comprador: {
    ...base.comprador,
    ...(override?.comprador || {}),
  },
  vehiculoAdicional: {
    ...base.vehiculoAdicional,
    ...(override?.vehiculoAdicional || {}),
  },
  transaccion: {
    ...base.transaccion,
    ...(override?.transaccion || {}),
  },
  comision: {
    ...base.comision,
    ...(override?.comision || {}),
  },
});

const buildSaleFormData = (
  sellerName: string,
  vehicleData?: Vehicle | null,
  initialData?: DatosVenta
): DatosVenta => {
  const baseData = createBaseSaleData(sellerName);
  const cardData = vehicleData?.datosTarjetaPropiedad;

  const cardDefaults: PartialSaleData = {
    vehiculoAdicional: {
      tipoCarroceria: cardData?.tipoCarroceria || '',
      capacidad: cardData?.capacidad || '',
      cilindrada: cardData?.cilindrada || '',
      claseVehiculo: cardData?.claseVehiculo || '',
      numeroPuertas: baseData.vehiculoAdicional.numeroPuertas,
      numeroMotor: cardData?.numeroMotor || '',
      numeroChasis: cardData?.numeroChasis || vehicleData?.vin || '',
      linea: cardData?.linea || '',
      actaManifiesto: '',
      sitioMatricula: '',
      tipoServicio: normalizeTipoServicio(cardData?.servicio),
    },
    transaccion: {
      vendedorAnterior: cardData?.propietario || '',
      cedulaVendedorAnterior: cardData?.identificacionPropietario || '',
    },
  };

  return mergeSaleData(mergeSaleData(baseData, cardDefaults), initialData);
};

const SaleDataModal: React.FC<SaleDataModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  vehiclePlaca,
  vehicleData,
  initialData,
  isEditMode = false,
}) => {
  const { user } = useAuth();
  const sellerName = user?.nombre || user?.email || '';
  const [formData, setFormData] = useState<DatosVenta>(() =>
    buildSaleFormData(sellerName, vehicleData, initialData)
  );

  useEffect(() => {
    if (!isOpen) return;
    setFormData(buildSaleFormData(sellerName, vehicleData, initialData));
  }, [initialData, isOpen, sellerName, vehicleData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedData: DatosVenta = {
      ...formData,
      vehiculoAdicional: {
        ...formData.vehiculoAdicional,
        tipoServicio: normalizeTipoServicio(formData.vehiculoAdicional.tipoServicio),
        numeroPuertas: Number.isFinite(formData.vehiculoAdicional.numeroPuertas)
          ? formData.vehiculoAdicional.numeroPuertas
          : 4,
      },
      transaccion: {
        ...formData.transaccion,
        diasTraspaso: Number.isFinite(formData.transaccion.diasTraspaso)
          ? formData.transaccion.diasTraspaso
          : 30,
      },
    };

    onSubmit(normalizedData);
  };

  const updateVendedor = (field: keyof DatosVenta['vendedor'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      vendedor: { ...prev.vendedor, [field]: value },
    }));
  };

  const updateComprador = (field: keyof DatosVenta['comprador'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      comprador: { ...prev.comprador, [field]: value },
    }));
  };

  const updateVehiculoAdicional = (
    field: keyof DatosVenta['vehiculoAdicional'],
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      vehiculoAdicional: { ...prev.vehiculoAdicional, [field]: value },
    }));
  };

  const updateTransaccion = (
    field: keyof DatosVenta['transaccion'],
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      transaccion: { ...prev.transaccion, [field]: value },
    }));
  };

  const updateComision = (field: keyof DatosVenta['comision'], value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      comision: { ...prev.comision, [field]: value },
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Editar' : 'Registrar'} Datos de Venta - {vehiclePlaca}
            </h2>
            {vehicleData?.datosTarjetaPropiedad && (
              <p className="text-sm text-gray-500 mt-1">
                Se precargaron datos de tarjeta de propiedad para evitar diligenciarlos de nuevo.
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Datos del Vendedor
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.vendedor.nombre}
                  onChange={(e) => updateVendedor('nombre', e.target.value)}
                  className="input"
                  placeholder="Ej: Juan Perez Garcia"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cedula/NIT *
                </label>
                <input
                  type="text"
                  required
                  value={formData.vendedor.identificacion}
                  onChange={(e) => updateVendedor('identificacion', e.target.value)}
                  className="input"
                  placeholder="Ej: 1234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Direccion *
                </label>
                <input
                  type="text"
                  required
                  value={formData.vendedor.direccion}
                  onChange={(e) => updateVendedor('direccion', e.target.value)}
                  className="input"
                  placeholder="Ej: Calle 123 #45-67"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefono *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.vendedor.telefono}
                  onChange={(e) => updateVendedor('telefono', e.target.value)}
                  className="input"
                  placeholder="Ej: 3001234567"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Comision del Vendedor
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto de Comision ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.comision.monto}
                  onChange={(e) => updateComision('monto', parseFloat(e.target.value) || 0)}
                  className="input"
                  placeholder="Ej: 500000"
                />
                <p className="text-xs text-gray-500 mt-1">Monto fijo a pagar al vendedor.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Porcentaje de Comision (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={formData.comision.porcentaje}
                  onChange={(e) => updateComision('porcentaje', parseFloat(e.target.value) || 0)}
                  className="input"
                  placeholder="Ej: 5"
                />
                <p className="text-xs text-gray-500 mt-1">% del precio de venta.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripcion
                </label>
                <input
                  type="text"
                  value={formData.comision.descripcion}
                  onChange={(e) => updateComision('descripcion', e.target.value)}
                  className="input"
                  placeholder="Ej: Comision por cierre de venta"
                />
                <p className="text-xs text-gray-500 mt-1">Concepto o nota adicional.</p>
              </div>
            </div>
            {formData.comision.porcentaje > 0 && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> si ingresas monto y porcentaje, se usara el monto fijo.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Datos del Comprador
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.comprador.nombre}
                  onChange={(e) => updateComprador('nombre', e.target.value)}
                  className="input"
                  placeholder="Ej: Maria Lopez Rodriguez"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cedula/NIT *
                </label>
                <input
                  type="text"
                  required
                  value={formData.comprador.identificacion}
                  onChange={(e) => updateComprador('identificacion', e.target.value)}
                  className="input"
                  placeholder="Ej: 9876543210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Direccion *
                </label>
                <input
                  type="text"
                  required
                  value={formData.comprador.direccion}
                  onChange={(e) => updateComprador('direccion', e.target.value)}
                  className="input"
                  placeholder="Ej: Carrera 45 #12-34"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefono *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.comprador.telefono}
                  onChange={(e) => updateComprador('telefono', e.target.value)}
                  className="input"
                  placeholder="Ej: 3109876543"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electronico *
                </label>
                <input
                  type="email"
                  required
                  value={formData.comprador.email}
                  onChange={(e) => updateComprador('email', e.target.value)}
                  className="input"
                  placeholder="Ej: comprador@email.com"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Datos Adicionales del Vehiculo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Carroceria
                </label>
                <input
                  type="text"
                  value={formData.vehiculoAdicional.tipoCarroceria}
                  onChange={(e) => updateVehiculoAdicional('tipoCarroceria', e.target.value)}
                  className="input"
                  placeholder="Ej: Sedan, SUV, Camioneta"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacidad
                </label>
                <input
                  type="text"
                  value={formData.vehiculoAdicional.capacidad}
                  onChange={(e) => updateVehiculoAdicional('capacidad', e.target.value)}
                  className="input"
                  placeholder="Ej: 5 pasajeros"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cilindrada
                </label>
                <input
                  type="text"
                  value={formData.vehiculoAdicional.cilindrada}
                  onChange={(e) => updateVehiculoAdicional('cilindrada', e.target.value)}
                  className="input"
                  placeholder="Ej: 1600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clase de Vehiculo
                </label>
                <input
                  type="text"
                  value={formData.vehiculoAdicional.claseVehiculo}
                  onChange={(e) => updateVehiculoAdicional('claseVehiculo', e.target.value)}
                  className="input"
                  placeholder="Ej: Automovil"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numero de Puertas
                </label>
                <input
                  type="number"
                  value={formData.vehiculoAdicional.numeroPuertas}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    updateVehiculoAdicional('numeroPuertas', Number.isFinite(value) ? value : 4);
                  }}
                  className="input"
                  min="2"
                  max="6"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numero de Motor
                </label>
                <input
                  type="text"
                  value={formData.vehiculoAdicional.numeroMotor}
                  onChange={(e) => updateVehiculoAdicional('numeroMotor', e.target.value)}
                  className="input"
                  placeholder="Ej: ABC123456"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numero de Chasis
                </label>
                <input
                  type="text"
                  value={formData.vehiculoAdicional.numeroChasis}
                  onChange={(e) => updateVehiculoAdicional('numeroChasis', e.target.value)}
                  className="input"
                  placeholder="Ej: 9BWZZZ377VT004251"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Linea
                </label>
                <input
                  type="text"
                  value={formData.vehiculoAdicional.linea}
                  onChange={(e) => updateVehiculoAdicional('linea', e.target.value)}
                  className="input"
                  placeholder="Ej: Sport, Luxury"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Acta/Manifiesto
                </label>
                <input
                  type="text"
                  value={formData.vehiculoAdicional.actaManifiesto}
                  onChange={(e) => updateVehiculoAdicional('actaManifiesto', e.target.value)}
                  className="input"
                  placeholder="Ej: 123456"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sitio de Matricula
                </label>
                <input
                  type="text"
                  value={formData.vehiculoAdicional.sitioMatricula}
                  onChange={(e) => updateVehiculoAdicional('sitioMatricula', e.target.value)}
                  className="input"
                  placeholder="Ej: Bogota"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Servicio
                </label>
                <select
                  value={normalizeTipoServicio(formData.vehiculoAdicional.tipoServicio)}
                  onChange={(e) => updateVehiculoAdicional('tipoServicio', e.target.value)}
                  className="input"
                >
                  <option value="PARTICULAR">Particular</option>
                  <option value="PUBLICO">Publico</option>
                  <option value="OFICIAL">Oficial</option>
                  <option value="DIPLOMATICO">Diplomatico</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Datos de la Transaccion
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lugar de Celebracion *
                </label>
                <input
                  type="text"
                  required
                  value={formData.transaccion.lugarCelebracion}
                  onChange={(e) => updateTransaccion('lugarCelebracion', e.target.value)}
                  className="input"
                  placeholder="Ej: Bogota D.C."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Celebracion *
                </label>
                <input
                  type="date"
                  required
                  value={formData.transaccion.fechaCelebracion}
                  onChange={(e) => updateTransaccion('fechaCelebracion', e.target.value)}
                  className="input"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio en Letras *
                </label>
                <input
                  type="text"
                  required
                  value={formData.transaccion.precioLetras}
                  onChange={(e) => updateTransaccion('precioLetras', e.target.value)}
                  className="input"
                  placeholder="Ej: CINCUENTA MILLONES DE PESOS COLOMBIANOS"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Forma de Pago *
                </label>
                <textarea
                  required
                  value={formData.transaccion.formaPago}
                  onChange={(e) => updateTransaccion('formaPago', e.target.value)}
                  className="input"
                  rows={3}
                  placeholder="Ej: Pago de contado / Transferencia bancaria / Cuotas..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Propietario / Vendedor Anterior
                </label>
                <input
                  type="text"
                  value={formData.transaccion.vendedorAnterior}
                  onChange={(e) => updateTransaccion('vendedorAnterior', e.target.value)}
                  className="input"
                  placeholder="Se precarga desde la tarjeta de propiedad"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Identificacion del Propietario
                </label>
                <input
                  type="text"
                  value={formData.transaccion.cedulaVendedorAnterior}
                  onChange={(e) => updateTransaccion('cedulaVendedorAnterior', e.target.value)}
                  className="input"
                  placeholder="Se precarga desde la tarjeta de propiedad"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dias para Traspaso *
                </label>
                <input
                  type="number"
                  required
                  value={formData.transaccion.diasTraspaso}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    updateTransaccion('diasTraspaso', Number.isFinite(value) ? value : 30);
                  }}
                  className="input"
                  min="1"
                  max="90"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Entrega *
                </label>
                <input
                  type="date"
                  required
                  value={formData.transaccion.fechaEntrega}
                  onChange={(e) => updateTransaccion('fechaEntrega', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora de Entrega
                </label>
                <input
                  type="time"
                  value={formData.transaccion.horaEntrega}
                  onChange={(e) => updateTransaccion('horaEntrega', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domicilio Contractual *
                </label>
                <input
                  type="text"
                  required
                  value={formData.transaccion.domicilioContractual}
                  onChange={(e) => updateTransaccion('domicilioContractual', e.target.value)}
                  className="input"
                  placeholder="Ej: Bogota D.C."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clausulas Adicionales
                </label>
                <textarea
                  value={formData.transaccion.clausulasAdicionales}
                  onChange={(e) => updateTransaccion('clausulasAdicionales', e.target.value)}
                  className="input"
                  rows={4}
                  placeholder="Clausulas adicionales del contrato (opcional)"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {isEditMode ? 'Actualizar Datos de Venta' : 'Guardar, Vender y Generar Documentos'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaleDataModal;
