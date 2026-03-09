import React from 'react';
import { X, User, FileText, Calendar, MapPin } from 'lucide-react';
import { DatosVenta } from '../types';

interface ViewSaleDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  datosVenta: DatosVenta | undefined;
  vehiclePlaca: string;
}

const ViewSaleDataModal: React.FC<ViewSaleDataModalProps> = ({
  isOpen,
  onClose,
  datosVenta,
  vehiclePlaca,
}) => {
  if (!isOpen) return null;

  const formatDate = (date: string | undefined) => {
    if (!date) return 'No especificado';
    return new Date(date).toLocaleDateString('es-CO');
  };

  const checkValue = (value: any) => {
    if (value === undefined || value === null || value === '') {
      return <span className="text-red-600 font-semibold">❌ VACÍO</span>;
    }
    return <span className="text-green-600">✓ {value}</span>;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Datos de Venta - {vehiclePlaca}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Verifica que todos los campos requeridos (*) tengan valores
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!datosVenta ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-800 font-semibold text-lg mb-2">
                ❌ Este vehículo NO tiene datos de venta registrados
              </p>
              <p className="text-red-600 text-sm">
                Usa el botón "Vender Vehículo" para registrar los datos del comprador
              </p>
            </div>
          ) : (
            <>
              {/* Datos del Vendedor */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-900">Datos del Vendedor</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nombre *</label>
                    <div className="mt-1">{checkValue(datosVenta.vendedor?.nombre)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Identificación *</label>
                    <div className="mt-1">{checkValue(datosVenta.vendedor?.identificacion)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Dirección</label>
                    <div className="mt-1">{checkValue(datosVenta.vendedor?.direccion)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Teléfono</label>
                    <div className="mt-1">{checkValue(datosVenta.vendedor?.telefono)}</div>
                  </div>
                </div>
              </div>

              {/* Sección de Comisión */}
              {(datosVenta.comision?.monto > 0 || datosVenta.comision?.porcentaje > 0) && (
                <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="text-md font-semibold text-purple-900 mb-3">Comisión del Vendedor</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Monto</label>
                      <div className="mt-1 font-semibold text-purple-700">
                        ${(datosVenta.comision?.monto || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Porcentaje</label>
                      <div className="mt-1 font-semibold text-purple-700">
                        {datosVenta.comision?.porcentaje || 0}%
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Descripción</label>
                      <div className="mt-1 text-gray-600">
                        {datosVenta.comision?.descripcion || 'Sin descripción'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Datos del Comprador */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-900">Datos del Comprador</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nombre *</label>
                    <div className="mt-1">{checkValue(datosVenta.comprador?.nombre)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Identificación *</label>
                    <div className="mt-1">{checkValue(datosVenta.comprador?.identificacion)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Dirección</label>
                    <div className="mt-1">{checkValue(datosVenta.comprador?.direccion)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Teléfono</label>
                    <div className="mt-1">{checkValue(datosVenta.comprador?.telefono)}</div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <div className="mt-1">{checkValue(datosVenta.comprador?.email)}</div>
                  </div>
                </div>
              </div>

              {/* Datos de la Transacción */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-purple-900">Datos de la Transacción</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Lugar de Celebración *</label>
                    <div className="mt-1">{checkValue(datosVenta.transaccion?.lugarCelebracion)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Fecha de Celebración</label>
                    <div className="mt-1">{checkValue(formatDate(datosVenta.transaccion?.fechaCelebracion))}</div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Precio en Letras</label>
                    <div className="mt-1">{checkValue(datosVenta.transaccion?.precioLetras)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Forma de Pago</label>
                    <div className="mt-1">{checkValue(datosVenta.transaccion?.formaPago)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Días de Traspaso</label>
                    <div className="mt-1">{checkValue(datosVenta.transaccion?.diasTraspaso)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Fecha de Entrega</label>
                    <div className="mt-1">{checkValue(formatDate(datosVenta.transaccion?.fechaEntrega))}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Hora de Entrega</label>
                    <div className="mt-1">{checkValue(datosVenta.transaccion?.horaEntrega)}</div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Domicilio Contractual</label>
                    <div className="mt-1">{checkValue(datosVenta.transaccion?.domicilioContractual)}</div>
                  </div>
                </div>
              </div>

              {/* Datos Adicionales del Vehículo */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-orange-900">Datos Adicionales del Vehículo</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Tipo de Carrocería</label>
                    <div className="mt-1">{checkValue(datosVenta.vehiculoAdicional?.tipoCarroceria)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Capacidad</label>
                    <div className="mt-1">{checkValue(datosVenta.vehiculoAdicional?.capacidad)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Número de Puertas</label>
                    <div className="mt-1">{checkValue(datosVenta.vehiculoAdicional?.numeroPuertas)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Número de Motor</label>
                    <div className="mt-1">{checkValue(datosVenta.vehiculoAdicional?.numeroMotor)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Línea</label>
                    <div className="mt-1">{checkValue(datosVenta.vehiculoAdicional?.linea)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Tipo de Servicio</label>
                    <div className="mt-1">{checkValue(datosVenta.vehiculoAdicional?.tipoServicio)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Sitio de Matrícula</label>
                    <div className="mt-1">{checkValue(datosVenta.vehiculoAdicional?.sitioMatricula)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Acta/Manifiesto</label>
                    <div className="mt-1">{checkValue(datosVenta.vehiculoAdicional?.actaManifiesto)}</div>
                  </div>
                </div>
              </div>

              {/* Resumen de Validación */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Resumen de Validación</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Nombre del Comprador:</span>
                    {datosVenta.comprador?.nombre ? (
                      <span className="text-green-600 font-semibold">✓ Completo</span>
                    ) : (
                      <span className="text-red-600 font-semibold">❌ Falta</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Cédula del Comprador:</span>
                    {datosVenta.comprador?.identificacion ? (
                      <span className="text-green-600 font-semibold">✓ Completo</span>
                    ) : (
                      <span className="text-red-600 font-semibold">❌ Falta</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Nombre del Vendedor:</span>
                    {datosVenta.vendedor?.nombre ? (
                      <span className="text-green-600 font-semibold">✓ Completo</span>
                    ) : (
                      <span className="text-red-600 font-semibold">❌ Falta</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Lugar de Celebración:</span>
                    {datosVenta.transaccion?.lugarCelebracion ? (
                      <span className="text-green-600 font-semibold">✓ Completo</span>
                    ) : (
                      <span className="text-red-600 font-semibold">❌ Falta</span>
                    )}
                  </div>
                </div>
                
                {(!datosVenta.comprador?.nombre || !datosVenta.comprador?.identificacion || 
                  !datosVenta.vendedor?.nombre || !datosVenta.transaccion?.lugarCelebracion) && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-sm text-red-800 font-semibold">
                      ⚠️ Faltan campos requeridos. No se puede generar el contrato.
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Edita el vehículo, cambia el estado a "Listo para Venta" y usa el botón "Vender Vehículo" para completar los datos.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewSaleDataModal;
