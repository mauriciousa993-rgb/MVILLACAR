import React, { useEffect, useMemo, useState } from 'react';
import { Archive, Edit2, Plus, Receipt, RotateCcw } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import { fixedExpensesAPI } from '../services/api';
import { FixedExpense, FixedExpenseCategory } from '../types';
import { useAuth } from '../context/AuthContext';

type FixedExpenseFormData = {
  nombre: string;
  categoria: FixedExpenseCategory;
  monto: string;
  diaPago: string;
  proveedor: string;
  metodoPago: string;
  fechaInicio: string;
  fechaFin: string;
  observaciones: string;
  activo: boolean;
};

const CATEGORY_OPTIONS: Array<{ value: FixedExpenseCategory; label: string }> = [
  { value: 'arriendo', label: 'Arriendo' },
  { value: 'nomina', label: 'Nomina' },
  { value: 'servicios', label: 'Servicios' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'software', label: 'Software' },
  { value: 'impuestos', label: 'Impuestos' },
  { value: 'seguros', label: 'Seguros' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'otros', label: 'Otros' },
];

const PAYMENT_METHODS = [
  'transferencia',
  'efectivo',
  'tarjeta',
  'debito_automatico',
  'otro',
];

const getInitialFormData = (): FixedExpenseFormData => ({
  nombre: '',
  categoria: 'servicios',
  monto: '',
  diaPago: '5',
  proveedor: '',
  metodoPago: 'transferencia',
  fechaInicio: new Date().toISOString().split('T')[0],
  fechaFin: '',
  observaciones: '',
  activo: true,
});

const FixedExpenses: React.FC = () => {
  const { user } = useAuth();
  const canManage = user?.rol === 'admin' || user?.rol === 'vendedor';

  const [expenses, setExpenses] = useState<FixedExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [editingExpense, setEditingExpense] = useState<FixedExpense | null>(null);
  const [formData, setFormData] = useState<FixedExpenseFormData>(getInitialFormData());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadExpenses();
  }, [showInactive, canManage]);

  const loadExpenses = async () => {
    try {
      setIsLoading(true);
      const data = await fixedExpensesAPI.getAll({
        includeInactive: canManage ? showInactive : false,
      });
      setExpenses(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar gastos fijos');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);

  const formatDate = (value?: string) => {
    if (!value) return 'No definida';
    return new Date(value).toLocaleDateString('es-CO');
  };

  const activeExpenses = useMemo(() => expenses.filter((expense) => expense.activo), [expenses]);
  const monthlyTotal = useMemo(
    () => activeExpenses.reduce((sum, expense) => sum + (expense.monto || 0), 0),
    [activeExpenses]
  );

  const resetForm = () => {
    setFormData(getInitialFormData());
    setEditingExpense(null);
  };

  const openCreateModal = () => {
    setError('');
    setSuccess('');
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (expense: FixedExpense) => {
    setError('');
    setSuccess('');
    setEditingExpense(expense);
    setFormData({
      nombre: expense.nombre || '',
      categoria: expense.categoria || 'servicios',
      monto: `${expense.monto || 0}`,
      diaPago: `${expense.diaPago || 1}`,
      proveedor: expense.proveedor || '',
      metodoPago: expense.metodoPago || 'transferencia',
      fechaInicio: expense.fechaInicio ? new Date(expense.fechaInicio).toISOString().split('T')[0] : '',
      fechaFin: expense.fechaFin ? new Date(expense.fechaFin).toISOString().split('T')[0] : '',
      observaciones: expense.observaciones || '',
      activo: expense.activo,
    });
    setShowModal(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canManage) return;

    setError('');
    setSuccess('');

    const amount = Number(formData.monto);
    const paymentDay = Number(formData.diaPago);

    if (!formData.nombre.trim()) {
      setError('El nombre del gasto es obligatorio.');
      return;
    }

    if (Number.isNaN(amount) || amount < 0) {
      setError('El monto debe ser un numero valido mayor o igual a 0.');
      return;
    }

    if (Number.isNaN(paymentDay) || paymentDay < 1 || paymentDay > 31) {
      setError('El dia de pago debe estar entre 1 y 31.');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        nombre: formData.nombre.trim(),
        categoria: formData.categoria,
        monto: amount,
        diaPago: paymentDay,
        proveedor: formData.proveedor.trim(),
        metodoPago: formData.metodoPago,
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin || undefined,
        observaciones: formData.observaciones.trim(),
        activo: formData.activo,
      };

      if (editingExpense) {
        await fixedExpensesAPI.update(editingExpense._id, payload);
        setSuccess('Gasto fijo actualizado exitosamente.');
      } else {
        await fixedExpensesAPI.create(payload);
        setSuccess('Gasto fijo creado exitosamente.');
      }

      setShowModal(false);
      resetForm();
      await loadExpenses();
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudo guardar el gasto fijo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const archiveExpense = async (expense: FixedExpense) => {
    if (!canManage) return;
    if (!window.confirm(`Se archivara el gasto fijo "${expense.nombre}". Deseas continuar?`)) {
      return;
    }

    try {
      await fixedExpensesAPI.archive(expense._id);
      setSuccess('Gasto fijo archivado.');
      await loadExpenses();
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudo archivar el gasto fijo.');
    }
  };

  const reactivateExpense = async (expense: FixedExpense) => {
    if (!canManage) return;

    try {
      await fixedExpensesAPI.update(expense._id, { activo: true });
      setSuccess('Gasto fijo reactivado.');
      await loadExpenses();
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudo reactivar el gasto fijo.');
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Receipt className="h-8 w-8 text-primary-400" />
              Gastos Fijos
            </h1>
            <p className="mt-2 text-ink-200">
              Registra costos operativos recurrentes para alimentar reportes y plantillas automaticamente.
            </p>
          </div>
          {canManage && (
            <button type="button" onClick={openCreateModal} className="btn-primary inline-flex items-center justify-center">
              <Plus className="h-5 w-5 mr-2" />
              Nuevo Gasto Fijo
            </button>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-primary-700 bg-[#2b1215] px-4 py-3 text-primary-200">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-[#2f5a44] bg-[#14271f] px-4 py-3 text-[#95d8b5]">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card border-[#2f3238]">
            <p className="text-sm text-ink-300">Gastos Activos</p>
            <p className="text-3xl font-bold text-white mt-2">{activeExpenses.length}</p>
          </div>
          <div className="card border-[#2f3238]">
            <p className="text-sm text-ink-300">Costo Fijo Mensual</p>
            <p className="text-3xl font-bold text-signal mt-2">{formatCurrency(monthlyTotal)}</p>
          </div>
          <div className="card border-[#2f3238]">
            <p className="text-sm text-ink-300">Registros Totales</p>
            <p className="text-3xl font-bold text-white mt-2">{expenses.length}</p>
          </div>
        </div>

        {canManage && (
          <div className="card border-[#2f3238]">
            <label className="inline-flex items-center gap-2 text-sm text-ink-100">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(event) => setShowInactive(event.target.checked)}
                className="rounded border-[#32353d] bg-[#16181c] text-primary-500 focus:ring-primary-500"
              />
              Mostrar gastos archivados
            </label>
          </div>
        )}

        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#32353d]">
              <thead className="bg-[#171a20]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-ink-300">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-ink-300">Categoria</th>
                  <th className="px-4 py-3 text-right text-xs uppercase tracking-wide text-ink-300">Monto</th>
                  <th className="px-4 py-3 text-center text-xs uppercase tracking-wide text-ink-300">Dia Pago</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-ink-300">Proveedor</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-ink-300">Inicio</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-ink-300">Estado</th>
                  {canManage && (
                    <th className="px-4 py-3 text-right text-xs uppercase tracking-wide text-ink-300">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#32353d]">
                {isLoading ? (
                  <tr>
                    <td colSpan={canManage ? 8 : 7} className="px-4 py-10 text-center text-ink-300">
                      Cargando gastos fijos...
                    </td>
                  </tr>
                ) : expenses.length === 0 ? (
                  <tr>
                    <td colSpan={canManage ? 8 : 7} className="px-4 py-10 text-center text-ink-300">
                      No hay gastos fijos registrados.
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense) => (
                    <tr key={expense._id} className="hover:bg-[#1a1d23]">
                      <td className="px-4 py-3 text-sm text-white">
                        <p className="font-semibold">{expense.nombre}</p>
                        {expense.observaciones && (
                          <p className="text-ink-300 text-xs mt-1">{expense.observaciones}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-ink-100 capitalize">{expense.categoria}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-signal">
                        {formatCurrency(expense.monto || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-ink-200">{expense.diaPago || 1}</td>
                      <td className="px-4 py-3 text-sm text-ink-200">{expense.proveedor || 'No definido'}</td>
                      <td className="px-4 py-3 text-sm text-ink-200">{formatDate(expense.fechaInicio)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                            expense.activo
                              ? 'border-[#2f5a44] bg-[#15241d] text-[#95d8b5]'
                              : 'border-[#5a3b3e] bg-[#291618] text-[#f1a3a8]'
                          }`}
                        >
                          {expense.activo ? 'Activo' : 'Archivado'}
                        </span>
                      </td>
                      {canManage && (
                        <td className="px-4 py-3 text-sm text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(expense)}
                              className="p-2 rounded-md border border-[#32353d] text-ink-100 hover:text-white hover:bg-[#23252a]"
                              title="Editar gasto fijo"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            {expense.activo ? (
                              <button
                                type="button"
                                onClick={() => archiveExpense(expense)}
                                className="p-2 rounded-md border border-primary-700 text-primary-300 hover:text-white hover:bg-[#2b1215]"
                                title="Archivar gasto fijo"
                              >
                                <Archive className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => reactivateExpense(expense)}
                                className="p-2 rounded-md border border-[#2f5a44] text-[#95d8b5] hover:text-white hover:bg-[#1b2a23]"
                                title="Reactivar gasto fijo"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-[#2f3238] bg-[#17191f] p-6 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.9)]">
            <h2 className="text-2xl font-bold text-white mb-4">
              {editingExpense ? 'Editar Gasto Fijo' : 'Nuevo Gasto Fijo'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink-100 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(event) => setFormData({ ...formData, nombre: event.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-100 mb-1">Categoria</label>
                  <select
                    value={formData.categoria}
                    onChange={(event) =>
                      setFormData({ ...formData, categoria: event.target.value as FixedExpenseCategory })
                    }
                    className="input-field"
                  >
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-100 mb-1">Monto Mensual</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.monto}
                    onChange={(event) => setFormData({ ...formData, monto: event.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-100 mb-1">Dia de Pago</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.diaPago}
                    onChange={(event) => setFormData({ ...formData, diaPago: event.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-100 mb-1">Proveedor</label>
                  <input
                    type="text"
                    value={formData.proveedor}
                    onChange={(event) => setFormData({ ...formData, proveedor: event.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-100 mb-1">Metodo de Pago</label>
                  <select
                    value={formData.metodoPago}
                    onChange={(event) => setFormData({ ...formData, metodoPago: event.target.value })}
                    className="input-field"
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method.replace('_', ' ').replace(/^\w/, (char) => char.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-100 mb-1">Fecha de Inicio</label>
                  <input
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(event) => setFormData({ ...formData, fechaInicio: event.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-100 mb-1">Fecha Fin (Opcional)</label>
                  <input
                    type="date"
                    value={formData.fechaFin}
                    onChange={(event) => setFormData({ ...formData, fechaFin: event.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-100 mb-1">Observaciones</label>
                <textarea
                  value={formData.observaciones}
                  onChange={(event) => setFormData({ ...formData, observaciones: event.target.value })}
                  className="input-field min-h-[96px]"
                  placeholder="Ejemplo: contrato anual, ajustes por IPC, condiciones especiales."
                />
              </div>

              {editingExpense && (
                <label className="inline-flex items-center gap-2 text-sm text-ink-100">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(event) => setFormData({ ...formData, activo: event.target.checked })}
                    className="rounded border-[#32353d] bg-[#16181c] text-primary-500 focus:ring-primary-500"
                  />
                  Gasto activo
                </label>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 disabled:opacity-60">
                  {isSubmitting ? 'Guardando...' : editingExpense ? 'Actualizar Gasto' : 'Crear Gasto'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default FixedExpenses;
