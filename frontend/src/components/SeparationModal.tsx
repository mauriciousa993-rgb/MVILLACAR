import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { DatosSeparacion } from '../types';

interface SeparationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DatosSeparacion) => Promise<void> | void;
  vehiclePlaca: string;
  vehiclePrecioVenta: number;
  initialData?: DatosSeparacion;
  isEditMode?: boolean;
  isSubmitting?: boolean;
}

const createEmptyFormData = (): DatosSeparacion => ({
  cliente: {
    nombre: '',
    identificacion: '',
    direccion: '',
    telefono: '',
    email: '',
  },
  valorSeparacion: 0,
  fechaSeparacion: new Date().toISOString().split('T')[0],
  notas: '',
});

const getDateInputValue = (value?: string | Date): string => {
  if (!value) return new Date().toISOString().split('T')[0];

  if (typeof value === 'string') {
    return value.includes('T') ? value.split('T')[0] : value;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return new Date().toISOString().split('T')[0];
  }

  return parsedDate.toISOString().split('T')[0];
};

const getInitialFormData = (initialData?: DatosSeparacion): DatosSeparacion => {
  if (!initialData) return createEmptyFormData();

  return {
    ...initialData,
    cliente: {
      nombre: initialData.cliente?.nombre || '',
      identificacion: initialData.cliente?.identificacion || '',
      direccion: initialData.cliente?.direccion || '',
      telefono: initialData.cliente?.telefono || '',
      email: initialData.cliente?.email || '',
    },
    valorSeparacion: initialData.valorSeparacion || 0,
    fechaSeparacion: getDateInputValue(initialData.fechaSeparacion),
    notas: initialData.notas || '',
  };
};

const SeparationModal: React.FC<SeparationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  vehiclePlaca,
  vehiclePrecioVenta,
  initialData,
  isEditMode = false,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<DatosSeparacion>(() => getInitialFormData(initialData));

  useEffect(() => {
    if (!isOpen) return;
    setFormData(getInitialFormData(initialData));
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    const normalizedData: DatosSeparacion = {
      ...formData,
      fechaSeparacion: getDateInputValue(formData.fechaSeparacion),
    };

    await Promise.resolve(onSubmit(normalizedData));
  };

  const updateCliente = (field: string, value: string) => {
    setFormData({
      ...formData,
      cliente: { ...formData.cliente, [field]: value },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="modal-light max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditMode ? 'Editar Separacion' : 'Separacion de Vehiculo'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 transition-colors hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-800">
              Vehiculo: <span className="font-bold">{vehiclePlaca}</span>
            </p>
            <p className="text-sm text-blue-600">
              Precio de venta: ${vehiclePrecioVenta.toLocaleString('es-CO')}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="border-b pb-2 text-lg font-medium text-gray-900">Datos del Cliente</h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nombre completo *</label>
                <input
                  type="text"
                  required
                  value={formData.cliente.nombre}
                  onChange={(e) => updateCliente('nombre', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                  placeholder="Nombre del cliente"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Identificacion *</label>
                <input
                  type="text"
                  required
                  value={formData.cliente.identificacion}
                  onChange={(e) => updateCliente('identificacion', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                  placeholder="Numero de identificacion"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Telefono *</label>
                <input
                  type="tel"
                  required
                  value={formData.cliente.telefono}
                  onChange={(e) => updateCliente('telefono', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                  placeholder="Numero de telefono"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.cliente.email}
                  onChange={(e) => updateCliente('email', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Direccion</label>
                <input
                  type="text"
                  value={formData.cliente.direccion}
                  onChange={(e) => updateCliente('direccion', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                  placeholder="Direccion de residencia"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="border-b pb-2 text-lg font-medium text-gray-900">Detalles de la Separacion</h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Valor de Separacion *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={formData.valorSeparacion}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      valorSeparacion: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                  placeholder="0"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Precio de venta: ${vehiclePrecioVenta.toLocaleString('es-CO')}
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Fecha de Separacion *</label>
                <input
                  type="date"
                  required
                  value={getDateInputValue(formData.fechaSeparacion)}
                  onChange={(e) => setFormData({ ...formData, fechaSeparacion: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Notas adicionales</label>
                <textarea
                  value={formData.notas || ''}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                  placeholder="Observaciones o notas sobre la separacion..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary-500 px-4 py-2 text-white transition-colors hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Guardar Separacion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SeparationModal;
