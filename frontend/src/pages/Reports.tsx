import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Calendar,
  FileDown,
  Package,
  Wallet,
  ClipboardList,
  Gauge,
  Receipt,
  ChevronDown,
} from 'lucide-react';
import Layout from '../components/Layout/Layout';
import api from '../services/api';

interface MonthlyVehicle {
  marca: string;
  modelo: string;
  anio?: number;
  ['año']?: number;
  ['aÃ±o']?: number;
  placa: string;
  precioVenta: number;
  precioCompra: number;
  gastosTotal: number;
  costoTotal?: number;
  utilidad: number;
  fechaVenta: string;
}

interface MonthlyReport {
  mes: string;
  anio?: number;
  ['año']?: number;
  ['aÃ±o']?: number;
  totalVentas: number;
  totalCostosVenta?: number;
  totalGastosFijos?: number;
  totalGastos: number;
  utilidadBruta?: number;
  utilidad: number;
  cantidadVehiculos: number;
  ticketPromedio?: number;
  margenNeto?: number;
  vehiculos: MonthlyVehicle[];
}

type TemplateType =
  | 'inventario'
  | 'ventas'
  | 'gastos'
  | 'flujo-caja'
  | 'kpi-gerencial'
  | 'cuentas-cobrar-pagar';

type ReportType =
  | 'reporte-ejecutivo'
  | 'vehiculos-listos'
  | 'vehiculos-proceso'
  | 'vehiculos-vendidos'
  | 'plantilla-inventario'
  | 'plantilla-ventas'
  | 'plantilla-gastos'
  | 'plantilla-flujo-caja'
  | 'plantilla-kpi-gerencial'
  | 'plantilla-cuentas-cobrar-pagar';

const REPORT_OPTIONS: Array<{
  id: ReportType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'reportes' | 'plantillas';
}> = [
  {
    id: 'reporte-ejecutivo',
    title: 'Reporte Ejecutivo Mensual',
    description: 'Análisis completo de ventas, costos y utilidades por mes',
    icon: BarChart3,
    category: 'reportes',
  },
  {
    id: 'vehiculos-listos',
    title: 'Vehículos Listos para Venta',
    description: 'Listado completo de vehículos listos para comercializar',
    icon: Package,
    category: 'reportes',
  },
  {
    id: 'vehiculos-proceso',
    title: 'Vehículos en Proceso',
    description: 'Inventario de vehículos en alistamiento',
    icon: ClipboardList,
    category: 'reportes',
  },
  {
    id: 'vehiculos-vendidos',
    title: 'Vehículos Vendidos',
    description: 'Historial completo de ventas realizadas',
    icon: TrendingUp,
    category: 'reportes',
  },
  {
    id: 'plantilla-inventario',
    title: 'Inventario Maestro',
    description: 'Control por unidad, costos, estado, días en inventario',
    icon: Package,
    category: 'plantillas',
  },
  {
    id: 'plantilla-ventas',
    title: 'Registro de Ventas',
    description: 'Seguimiento comercial por canal, asesor, comisión',
    icon: FileDown,
    category: 'plantillas',
  },
  {
    id: 'plantilla-gastos',
    title: 'Control de Gastos',
    description: 'Gastos fijos y variables por centro de costo',
    icon: ClipboardList,
    category: 'plantillas',
  },
  {
    id: 'plantilla-flujo-caja',
    title: 'Flujo de Caja',
    description: 'Liquidez semanal con saldo y meta mínima',
    icon: Wallet,
    category: 'plantillas',
  },
  {
    id: 'plantilla-kpi-gerencial',
    title: 'KPI Gerencial',
    description: 'Indicadores clave: rotación, margen, cumplimiento',
    icon: Gauge,
    category: 'plantillas',
  },
  {
    id: 'plantilla-cuentas-cobrar-pagar',
    title: 'CxC / CxP',
    description: 'Cuentas por cobrar y pagar con vencimientos',
    icon: Receipt,
    category: 'plantillas',
  },
];

const Reports: React.FC = () => {
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedReport, setSelectedReport] = useState<ReportType>('reporte-ejecutivo');
  const [isExporting, setIsExporting] = useState(false);

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  useEffect(() => {
    loadReports();
  }, [selectedYear]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/vehicles/reports/monthly?year=${selectedYear}`);
      setReports(response.data || []);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
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

  const getYears = () => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let i = currentYear; i >= currentYear - 8; i -= 1) {
      years.push(i);
    }
    return years;
  };

  const filteredReports = useMemo(
    () => (selectedMonth ? reports.filter((r) => r.mes === selectedMonth) : reports),
    [reports, selectedMonth]
  );

  const totales = useMemo(
    () =>
      filteredReports.reduce(
        (acc, report) => ({
          ventas: acc.ventas + (report.totalVentas || 0),
          costosVenta: acc.costosVenta + (report.totalCostosVenta || 0),
          gastosFijos: acc.gastosFijos + (report.totalGastosFijos || 0),
          gastos: acc.gastos + (report.totalGastos || 0),
          utilidadBruta: acc.utilidadBruta + (report.utilidadBruta || 0),
          utilidad: acc.utilidad + (report.utilidad || 0),
          vehiculos: acc.vehiculos + (report.cantidadVehiculos || 0),
        }),
        { ventas: 0, costosVenta: 0, gastosFijos: 0, gastos: 0, utilidadBruta: 0, utilidad: 0, vehiculos: 0 }
      ),
    [filteredReports]
  );

  const getReportYear = (report: MonthlyReport): number | string => {
    return report['año'] ?? report.anio ?? report['aÃ±o'] ?? '';
  };

  const getVehicleYear = (vehicle: MonthlyVehicle): number | string => {
    return vehicle['año'] ?? vehicle.anio ?? vehicle['aÃ±o'] ?? '';
  };

  const downloadBlob = (blob: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleExportReport = async () => {
    setIsExporting(true);
    try {
      if (selectedReport === 'reporte-ejecutivo') {
        const monthParam = selectedMonth ? `&month=${encodeURIComponent(selectedMonth)}` : '';
        const response = await api.get(`/vehicles/reports/monthly/export?year=${selectedYear}${monthParam}`, {
          responseType: 'blob',
        });
        downloadBlob(response.data, `reporte-ejecutivo-${selectedYear}-${Date.now()}.xlsx`);
      } else if (selectedReport === 'vehiculos-listos') {
        const response = await api.get(`/vehicles/export?estado=listo_venta`, {
          responseType: 'blob',
        });
        downloadBlob(response.data, `vehiculos-listos-venta-${Date.now()}.xlsx`);
      } else if (selectedReport === 'vehiculos-proceso') {
        const response = await api.get(`/vehicles/export?estado=en_proceso`, {
          responseType: 'blob',
        });
        downloadBlob(response.data, `vehiculos-en-proceso-${Date.now()}.xlsx`);
      } else if (selectedReport === 'vehiculos-vendidos') {
        const response = await api.get(`/vehicles/export?estado=vendido`, {
          responseType: 'blob',
        });
        downloadBlob(response.data, `vehiculos-vendidos-${Date.now()}.xlsx`);
      } else if (selectedReport.startsWith('plantilla-')) {
        const templateType = selectedReport.replace('plantilla-', '') as TemplateType;
        const monthParam = selectedMonth ? `&month=${encodeURIComponent(selectedMonth)}` : '';
        const response = await api.get(`/vehicles/reports/templates/${templateType}?year=${selectedYear}${monthParam}`, {
          responseType: 'blob',
        });
        downloadBlob(response.data, `plantilla-${templateType}-${Date.now()}.xlsx`);
      }
    } catch (error) {
      console.error('Error al exportar reporte:', error);
      alert('Error al exportar el reporte.');
    } finally {
      setIsExporting(false);
    }
  };

  const selectedReportData = REPORT_OPTIONS.find(r => r.id === selectedReport);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary-400" />
            Reportes y Plantillas
          </h1>
          <p className="mt-2 text-ink-200">
            Descarga reportes ejecutivos, inventarios y plantillas profesionales
          </p>
        </div>

        <div className="card">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6">
              <label className="block text-sm font-medium text-ink-100 mb-1">
                Tipo de Reporte
              </label>
              <div className="relative">
                <select
                  value={selectedReport}
                  onChange={(e) => setSelectedReport(e.target.value as ReportType)}
                  className="input-field appearance-none pr-10"
                >
                  <optgroup label="📊 Reportes">
                    {REPORT_OPTIONS.filter(r => r.category === 'reportes').map((report) => (
                      <option key={report.id} value={report.id}>
                        {report.title}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="📋 Plantillas Profesionales">
                    {REPORT_OPTIONS.filter(r => r.category === 'plantillas').map((report) => (
                      <option key={report.id} value={report.id}>
                        {report.title}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-300 pointer-events-none" />
              </div>
              {selectedReportData && (
                <p className="mt-2 text-sm text-ink-300">{selectedReportData.description}</p>
              )}
            </div>

            {selectedReport === 'reporte-ejecutivo' && (
              <>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-ink-100 mb-1">Año</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                    className="input-field"
                  >
                    {getYears().map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-ink-100 mb-1">Mes</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Todos</option>
                    {meses.map((mes) => (
                      <option key={mes} value={mes}>{mes}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className={`flex items-end ${selectedReport === 'reporte-ejecutivo' ? 'lg:col-span-2' : 'lg:col-span-6'}`}>
              <button
                onClick={handleExportReport}
                disabled={isExporting}
                className="btn-primary w-full flex items-center justify-center disabled:opacity-60"
              >
                <FileDown className="h-5 w-5 mr-2" />
                {isExporting ? 'Exportando...' : 'Descargar'}
              </button>
            </div>
          </div>
        </div>

        {selectedReport === 'reporte-ejecutivo' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="card border-[#304669] bg-[#162235]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#9bb6de] font-medium">Total Ventas</p>
                    <p className="text-2xl font-bold text-white mt-1">{formatCurrency(totales.ventas)}</p>
                  </div>
                  <DollarSign className="h-10 w-10 text-[#9bb6de] opacity-80" />
                </div>
              </div>

              <div className="card border-[#4f2b30] bg-[#2a1518]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-primary-300 font-medium">Costos Venta + Fijos</p>
                    <p className="text-2xl font-bold text-white mt-1">{formatCurrency(totales.gastos)}</p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-primary-300 opacity-80" />
                </div>
              </div>

              <div className="card border-[#2e4e40] bg-[#152820]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#8dd6ae] font-medium">Utilidad Neta</p>
                    <p className="text-2xl font-bold text-white mt-1">{formatCurrency(totales.utilidad)}</p>
                  </div>
                  <BarChart3 className="h-10 w-10 text-[#8dd6ae] opacity-80" />
                </div>
              </div>

              <div className="card border-[#3f3554] bg-[#201a2e]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#bca8ed] font-medium">Vehículos Vendidos</p>
                    <p className="text-2xl font-bold text-white mt-1">{totales.vehiculos}</p>
                  </div>
                  <Calendar className="h-10 w-10 text-[#bca8ed] opacity-80" />
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                  <p className="mt-4 text-ink-200">Cargando reportes...</p>
                </div>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="card text-center py-12">
                <BarChart3 className="h-16 w-16 text-ink-300 mx-auto mb-4" />
                <p className="text-ink-200 text-lg">No hay movimientos registrados para este filtro.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredReports.map((report, index) => (
                  <div key={`${report.mes}-${index}`} className="card">
                    <div className="border-b border-[#32353d] pb-4 mb-4">
                      <h2 className="text-xl font-bold text-white">{report.mes} {getReportYear(report)}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-ink-300">Ventas</p>
                          <p className="text-lg font-semibold text-[#9bb6de]">{formatCurrency(report.totalVentas)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-ink-300">Costos de Venta</p>
                          <p className="text-lg font-semibold text-primary-300">
                            {formatCurrency(report.totalCostosVenta || 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-ink-300">Gastos Fijos</p>
                          <p className="text-lg font-semibold text-primary-300">
                            {formatCurrency(report.totalGastosFijos || 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-ink-300">Utilidad Neta</p>
                          <p className={`text-lg font-semibold ${report.utilidad >= 0 ? 'text-[#8dd6ae]' : 'text-primary-300'}`}>
                            {formatCurrency(report.utilidad)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-ink-300">Vehículos</p>
                          <p className="text-lg font-semibold text-[#bca8ed]">{report.cantidadVehiculos}</p>
                        </div>
                        <div>
                          <p className="text-sm text-ink-300">Margen Neto</p>
                          <p className={`text-lg font-semibold ${(report.margenNeto || 0) >= 0 ? 'text-[#8dd6ae]' : 'text-primary-300'}`}>
                            {((report.margenNeto || 0) * 100).toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-[#32353d]">
                        <thead className="bg-[#1a1d23]">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-ink-300 uppercase">Vehículo</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-ink-300 uppercase">Fecha Venta</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-ink-300 uppercase">Precio Venta</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-ink-300 uppercase">Costo Total</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-ink-300 uppercase">Utilidad</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#32353d]">
                          {report.vehiculos.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-4 py-6 text-sm text-ink-300 text-center">
                                No hubo ventas en este mes.
                              </td>
                            </tr>
                          ) : (
                            report.vehiculos.map((vehiculo, vIndex) => (
                              <tr key={`${vehiculo.placa}-${vIndex}`} className="hover:bg-[#1a1d23]">
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="text-sm font-medium text-white">
                                    {vehiculo.marca} {vehiculo.modelo}
                                  </div>
                                  <div className="text-sm text-ink-300">
                                    {getVehicleYear(vehiculo)} - {vehiculo.placa}
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-ink-200">
                                  {new Date(vehiculo.fechaVenta).toLocaleDateString('es-CO')}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-[#9bb6de]">
                                  {formatCurrency(vehiculo.precioVenta)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-ink-200">
                                  {formatCurrency(vehiculo.costoTotal || ((vehiculo.precioCompra || 0) + (vehiculo.gastosTotal || 0)))}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                                  <span className={`font-semibold ${vehiculo.utilidad >= 0 ? 'text-[#8dd6ae]' : 'text-primary-300'}`}>
                                    {formatCurrency(vehiculo.utilidad)}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {selectedReport !== 'reporte-ejecutivo' && (
          <div className="card text-center py-12">
            {selectedReportData && (
              <>
                {React.createElement(selectedReportData.icon, {
                  className: 'h-16 w-16 text-primary-400 mx-auto mb-4'
                })}
                <h3 className="text-xl font-semibold text-white mb-2">
                  {selectedReportData.title}
                </h3>
                <p className="text-ink-300 mb-6 max-w-md mx-auto">
                  {selectedReportData.description}
                </p>
                <p className="text-sm text-ink-400">
                  Haz clic en el botón "Descargar" para exportar este reporte en formato Excel
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Reports;
