import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout/Layout';
import { commissionsAPI, ResumenComisiones } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  DollarSign,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Printer,
  RefreshCw,
  User,
} from 'lucide-react';

const CommissionLiquidation: React.FC = () => {
  const { user } = useAuth();
  const [resumen, setResumen] = useState<ResumenComisiones[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVendedor, setSelectedVendedor] = useState<string | null>(null);
  const [filtroVendedor, setFiltroVendedor] = useState<string>('');
  const [año, setAño] = useState(new Date().getFullYear());
  const [mes, setMes] = useState<number | null>(null);

  const isAdmin = user?.rol === 'admin';

  const meses = [
    { value: null, label: 'Todos los meses' },
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
  ];

  const años = [2024, 2025, 2026, 2027, 2028];

  useEffect(() => {
    loadResumen();
  }, [año, mes]);

  const loadResumen = async () => {
    try {
      setIsLoading(true);
      const data = await commissionsAPI.getResumen(año, mes || undefined);
      setResumen(data);
    } catch (error) {
      console.error('Error al cargar resumen de comisiones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-CO');
  };

  const handleLiquidar = async (vendedor: ResumenComisiones) => {
    if (!vendedor.liquidacionId) {
      // Crear liquidación primero
      try {
        await commissionsAPI.create({
          vendedor: vendedor.vendedor,
          mes: mes || new Date().getMonth() + 1,
          año,
          Liquidaciones: vendedor.ventas.map((v) => ({
            placa: v.placa,
            comision: v.comision,
            fechaVenta: v.fechaVenta,
            liquidada: true,
          })),
        });
        alert('Liquidación creada y marcada como pagada');
        loadResumen();
      } catch (error) {
        console.error('Error al crear liquidación:', error);
        alert('Error al crear liquidación');
      }
    } else {
      // Ya existe, mostrar info
      alert('Esta liquidación ya fue registrada. Use el botón de marcar como pagado en cada venta.');
    }
  };

  // Obtener lista de vendedores únicos para el filtro
  const vendedores = resumen.map((r) => r.vendedor).sort();

  // Filtrar resumen por vendedor seleccionado
  const resumenFiltrado = filtroVendedor
    ? resumen.filter((r) => r.vendedor === filtroVendedor)
    : resumen;

  const totalComisiones = resumenFiltrado.reduce((sum, r) => sum + r.totalComisiones, 0);
  const totalPagadas = resumenFiltrado.reduce((sum, r) => sum + r.comisionesPagadas, 0);
  const totalPendientes = resumenFiltrado.reduce((sum, r) => sum + r.comisionesPendientes, 0);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Liquidación de Comisiones</h1>
            <p className="text-gray-600">Gestiona el pago de comisiones a vendedores</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadResumen}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <RefreshCw size={18} />
              Actualizar
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              <Printer size={18} />
              Imprimir
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-end gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-1">
                  <User size={14} />
                  Vendedor
                </span>
              </label>
              <select
                value={filtroVendedor}
                onChange={(e) => setFiltroVendedor(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 min-w-[200px]"
              >
                <option value="">Todos los vendedores</option>
                {vendedores.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            {filtroVendedor && (
              <button
                onClick={() => setFiltroVendedor('')}
                className="px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                title="Limpiar filtro de vendedor"
              >
                ✕
              </button>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
            <select
              value={año}
              onChange={(e) => setAño(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900"
            >
              {años.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
            <select
              value={mes ?? ''}
              onChange={(e) => setMes(e.target.value ? parseInt(e.target.value) : null)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900"
            >
              {meses.map((m) => (
                <option key={m.value ?? 'all'} value={m.value ?? ''}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Resumen Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Comisiones</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalComisiones)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pagadas</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPagadas)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totalPendientes)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Vendedores */}
        <div className="space-y-4">
          {resumenFiltrado.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {filtroVendedor
                  ? `No hay ventas con comisiones para el vendedor seleccionado`
                  : 'No hay ventas con comisiones en el período seleccionado'}
              </p>
            </div>
          ) : (
            resumenFiltrado.map((vendedor) => (
              <div
                key={vendedor.vendedor}
                className="bg-white rounded-lg shadow-sm border overflow-hidden"
              >
                {/* Accordion Header */}
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                  onClick={() =>
                    setSelectedVendedor(
                      selectedVendedor === vendedor.vendedor ? null : vendedor.vendedor
                    )
                  }
                >
                  <div className="flex items-center gap-4">
                    {selectedVendedor === vendedor.vendedor ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{vendedor.vendedor}</h3>
                      <p className="text-sm text-gray-500">
                        {vendedor.cantidadVentas} venta{vendedor.cantidadVentas !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(vendedor.totalComisiones)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Pendiente</p>
                      <p className="font-semibold text-yellow-600">
                        {formatCurrency(vendedor.comisionesPendientes)}
                      </p>
                    </div>
                    {vendedor.liquidado ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        Liquidado
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        Pendiente
                      </span>
                    )}
                  </div>
                </div>

                {/* Accordion Content */}
                {selectedVendedor === vendedor.vendedor && (
                  <div className="border-t">
                    <div className="p-4 bg-gray-50">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-sm text-gray-600">
                            <th className="pb-2">Placa</th>
                            <th className="pb-2">Vehículo</th>
                            <th className="pb-2">Fecha Venta</th>
                            <th className="pb-2 text-right">Precio Venta</th>
                            <th className="pb-2 text-right">Comisión</th>
                            <th className="pb-2 text-center">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {vendedor.ventas.map((venta, idx) => (
                            <tr key={idx} className="text-sm">
                              <td className="py-2 font-medium">{venta.placa}</td>
                              <td className="py-2">{venta.vehiculo}</td>
                              <td className="py-2">{formatDate(venta.fechaVenta)}</td>
                              <td className="py-2 text-right">{formatCurrency(venta.precioVenta)}</td>
                              <td className="py-2 text-right font-semibold">
                                {formatCurrency(venta.comision)}
                              </td>
                              <td className="py-2 text-center">
                                {venta.liquidada ? (
                                  <span className="inline-flex items-center gap-1 text-green-600">
                                    <CheckCircle size={16} />
                                    Pagado
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-yellow-600">
                                    <Clock size={16} />
                                    Pendiente
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="font-semibold">
                            <td className="pt-2" colSpan={4}>
                              Total
                            </td>
                            <td className="pt-2 text-right">
                              {formatCurrency(vendedor.totalComisiones)}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Acciones */}
                    {isAdmin && vendedor.comisionesPendientes > 0 && (
                      <div className="p-4 border-t bg-white">
                        <button
                          onClick={() => handleLiquidar(vendedor)}
                          className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          Marcar todas las comisiones como pagadas
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CommissionLiquidation;
