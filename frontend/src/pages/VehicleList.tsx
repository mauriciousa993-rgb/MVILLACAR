﻿import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, Car, Edit, Trash2, FileDown, X, ChevronDown, ChevronUp, FileText, DollarSign, Edit2, ClipboardCheck } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import api from '../services/api';
import { Vehicle, DatosVenta, DatosSeparacion } from '../types';
import SaleDataModal from '../components/SaleDataModal';
import SeparationModal from '../components/SeparationModal';
import { vehiclesAPI } from '../services/api';

const VehicleList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [expandedVehicles, setExpandedVehicles] = useState<Set<string>>(new Set());
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [separationModalOpen, setSeparationModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isSavingSeparation, setIsSavingSeparation] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    const estadoParam = searchParams.get('estado');
    setFilterEstado(estadoParam || 'todos');
  }, [searchParams]);

  useEffect(() => {
    filterVehicles();
  }, [searchTerm, filterEstado, vehicles]);

  const loadVehicles = async () => {
    try {
      const response = await api.get('/vehicles');
      setVehicles(response.data);
    } catch (error) {
      console.error('Error al cargar vehiculos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const normalizeEstado = (estado?: string) => (estado || '').trim().toLowerCase();

  const isListoParaVenta = (estado?: string) => normalizeEstado(estado) === 'listo_venta';

  const filterVehicles = () => {
    let filtered = vehicles;

    if (filterEstado !== 'todos') {
      filtered = filtered.filter(v => normalizeEstado(v.estado) === filterEstado);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(v =>
        v.marca.toLowerCase().includes(term) ||
        v.modelo.toLowerCase().includes(term) ||
        v.placa.toLowerCase().includes(term) ||
        v.año.toString().includes(term)
      );
    }

    setFilteredVehicles(filtered);
  };

  const toggleVehicle = (id: string) => {
    const newExpanded = new Set(expandedVehicles);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedVehicles(newExpanded);
  };

  const clearFilters = () => {
    setFilterEstado('todos');
    setSearchTerm('');
    setSearchParams({});
  };

  const getEstadoLabel = (estado: string) => {
    const labels: Record<string, string> = {
      listo_venta: 'Listos para Venta',
      en_proceso: 'En Proceso',
      en_negociacion: 'En Negociacion',
      vendido: 'Vendidos',
      retirado: 'Retirados'
    };
    return labels[estado] || estado;
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Estas seguro de eliminar este vehiculo?')) return;

    try {
      await api.delete(`/vehicles/${id}`);
      loadVehicles();
    } catch (error) {
      console.error('Error al eliminar vehiculo:', error);
      alert('Error al eliminar el vehiculo');
    }
  };

  const handleOpenSaleModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setSaleModalOpen(true);
  };

  const handleSaveSaleData = async (data: DatosVenta) => {
    if (!selectedVehicle) return;

    try {
      if (selectedVehicle.estado === 'vendido' && selectedVehicle.datosVenta) {
        await vehiclesAPI.updateSaleData(selectedVehicle._id, data);
        alert('Datos de venta actualizados exitosamente.');
      } else {
        await vehiclesAPI.saveSaleData(selectedVehicle._id, data);

        const documentErrors: string[] = [];

        try {
          await vehiclesAPI.generateContract(selectedVehicle._id);
        } catch (error) {
          console.error('Error al generar contrato en venta:', error);
          documentErrors.push('contrato de compraventa');
        }

        try {
          await vehiclesAPI.generateTransferForm(selectedVehicle._id);
        } catch (error) {
          console.error('Error al generar formulario de traspaso en venta:', error);
          documentErrors.push('formulario de traspaso');
        }

        if (documentErrors.length === 0) {
          alert('Datos de venta guardados exitosamente. El vehiculo fue marcado como vendido y se descargaron contrato + formulario de traspaso.');
        } else {
          alert(`Datos de venta guardados y vehiculo marcado como vendido, pero no se pudo descargar: ${documentErrors.join(', ')}.`);
        }
      }

      setSaleModalOpen(false);
      setSelectedVehicle(null);
      loadVehicles();
    } catch (error: any) {
      console.error('Error al guardar datos de venta:', error);
      
      // Mostrar mensaje de error más específico si está disponible
      let errorMessage = 'Error al guardar los datos de venta';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = `Error de validación:\n${error.response.data.errors.join('\n')}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  };


  const handleEditSaleData = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setSaleModalOpen(true);
  };

  const handleGenerateContract = async (vehicleId: string) => {
    try {
      await vehiclesAPI.generateContract(vehicleId);
    } catch (error) {
      console.error('Error al generar contrato:', error);
      alert('Error al generar el contrato. Asegurate de que el vehiculo tenga datos de venta registrados.');
    }
  };

  const handleGenerateTransferForm = async (vehicleId: string) => {
    try {
      await vehiclesAPI.generateTransferForm(vehicleId);
    } catch (error) {
      console.error('Error al generar formulario de traspaso:', error);
      alert('Error al generar el formulario de traspaso. Asegurate de que el vehiculo tenga datos de venta completos.');
    }
  };

  const handleOpenSeparationModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setSeparationModalOpen(true);
  };

  const handleSaveSeparationData = async (data: DatosSeparacion) => {
    if (!selectedVehicle) return;

    setIsSavingSeparation(true);

    try {
      if (selectedVehicle.estado === 'separado' && selectedVehicle.datosSeparacion) {
        await vehiclesAPI.updateSeparationData(selectedVehicle._id, data);
        alert('Datos de separación actualizados exitosamente.');
      } else {
        await vehiclesAPI.saveSeparationData(selectedVehicle._id, data);
        alert('Vehículo separado exitosamente. El cliente ha separado este vehículo.');
      }

      setSeparationModalOpen(false);
      setSelectedVehicle(null);
      await loadVehicles();
    } catch (error: any) {
      console.error('Error al guardar datos de separación:', error);
      
      let errorMessage = 'Error al guardar los datos de separación';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = `Error de validación:\n${error.response.data.errors.join('\n')}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsSavingSeparation(false);
    }
  };

  const handleEditSeparationData = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setSeparationModalOpen(true);
  };

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, { class: string; text: string }> = {
      en_proceso: { class: 'badge-warning', text: 'En Proceso' },
      listo_venta: { class: 'badge-success', text: 'Listo para Venta' },
      en_negociacion: { class: 'badge-info', text: 'En Negociación' },
      separado: { class: 'badge-warning', text: 'Separado' },
      vendido: { class: 'badge-gray', text: 'Vendido' },
      retirado: { class: 'badge-danger', text: 'Retirado' }
    };
    const badge = badges[normalizeEstado(estado)] || badges.en_proceso;
    return <span className={`badge ${badge.class}`}>{badge.text}</span>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const totalVehiculosListos = vehicles.filter(v => isListoParaVenta(v.estado)).length;
  const totalVehiculosEnNegociacion = vehicles.filter(
    v => normalizeEstado(v.estado) === 'en_negociacion'
  ).length;
  const totalVehiculosEnProceso = vehicles.filter(
    v => normalizeEstado(v.estado) === 'en_proceso'
  ).length;
  const totalVehiculosVendidos = vehicles.filter(
    v => normalizeEstado(v.estado) === 'vendido'
  ).length;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-ink-200">Cargando vehículos...</p>

          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Inventario de Vehículos
            </h1>

            {filterEstado !== 'todos' && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-ink-200">
                  Mostrando: <span className="font-semibold">{getEstadoLabel(filterEstado)}</span>
                </span>
                <button
                  onClick={clearFilters}
                  className="text-xs text-primary-300 hover:text-primary-200 flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => navigate('/vehicles/new')}
            className="btn-primary flex items-center justify-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nuevo Vehículo

          </button>
        </div>

        {/* Filtros y Búsqueda */}

        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-ink-300" />
                <input
                  type="text"
                  placeholder="Buscar por marca, modelo, placa o año..."

                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="input-field"
              >
                <option value="todos">Todos los Estados</option>
                <option value="listo_venta">Listos para Venta</option>
                <option value="en_proceso">Con Pendientes</option>
                <option value="en_negociacion">En Negociación</option>

                <option value="vendido">Vendidos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Estadísticas Rápidas */}

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <button
            onClick={() => {
              setFilterEstado('todos');
              setSearchParams({});
            }}
            className={`card transition-all ${
              filterEstado === 'todos'
                ? 'bg-[#2b1215] border-primary-500 ring-2 ring-primary-500'
                : 'bg-[#1c1f26] border-[#30343d] hover:border-primary-700'
            }`}
          >
            <p className="text-sm text-ink-200 font-medium">Total Vehículos</p>

            <p className="text-2xl font-bold text-white">{vehicles.length}</p>
          </button>
          <button
            onClick={() => {
              setFilterEstado('listo_venta');
              setSearchParams({ estado: 'listo_venta' });
            }}
            className={`card transition-all ${
              filterEstado === 'listo_venta'
                ? 'bg-[#1d242b] border-[#8f9aa8] ring-2 ring-[#8f9aa8]'
                : 'bg-[#1c2027] border-[#30343d] hover:border-[#7f8a98]'
            }`}
          >
            <p className="text-sm text-ink-200 font-medium">Listos para Venta</p>
            <p className="text-2xl font-bold text-silver">
              {totalVehiculosListos}
            </p>
          </button>
          <button
            onClick={() => {
              setFilterEstado('en_negociacion');
              setSearchParams({ estado: 'en_negociacion' });
            }}
            className={`card transition-all ${
              filterEstado === 'en_negociacion'
                ? 'bg-[#16242c] border-[#4e8896] ring-2 ring-[#4e8896]'
                : 'bg-[#152027] border-[#2d3f47] hover:border-[#4e8896]'
            }`}
          >
            <p className="text-sm font-medium text-[#8fd5e5]">En Negociacion</p>
            <p className="text-2xl font-bold text-[#8fd5e5]">
              {totalVehiculosEnNegociacion}
            </p>
          </button>
          <button
            onClick={() => {
              setFilterEstado('en_proceso');
              setSearchParams({ estado: 'en_proceso' });
            }}
            className={`card transition-all ${
              filterEstado === 'en_proceso'
                ? 'bg-[#2b2116] border-[#7e6642] ring-2 ring-[#7e6642]'
                : 'bg-[#221a12] border-[#3b3125] hover:border-[#7e6642]'
            }`}
          >
            <p className="text-sm text-[#f4c26b] font-medium">Con Pendientes</p>
            <p className="text-2xl font-bold text-[#f4c26b]">
              {totalVehiculosEnProceso}
            </p>
          </button>
          <button
            onClick={() => {
              setFilterEstado('vendido');
              setSearchParams({ estado: 'vendido' });
            }}
            className={`card transition-all ${
              filterEstado === 'vendido'
                ? 'bg-[#351418] border-primary-500 ring-2 ring-primary-500'
                : 'bg-[#251317] border-[#412228] hover:border-primary-600'
            }`}
          >
            <p className="text-sm text-primary-300 font-medium">Vendidos</p>
            <p className="text-2xl font-bold text-signal">
              {totalVehiculosVendidos}
            </p>
          </button>
        </div>
      </div>

        {/* Lista de Vehículos */}

      {filteredVehicles.length === 0 ? (
        <div className="card text-center py-12">
          <Car className="h-16 w-16 text-ink-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            {searchTerm || filterEstado !== 'todos' 
              ? 'No se encontraron vehículos' 
              : 'No hay vehículos registrados'}
          </h3>
          <p className="text-ink-200 mb-4">
            {searchTerm || filterEstado !== 'todos'
              ? 'Intenta con otros filtros de búsqueda'
              : 'Comienza agregando tu primer vehículo al inventario'}

          </p>
          {!searchTerm && filterEstado === 'todos' && (
            <button
              onClick={() => navigate('/vehicles/new')}
              className="btn-primary inline-flex items-center"
            >
            <Plus className="h-5 w-5 mr-2" />
            Agregar Primer Vehículo

            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredVehicles.map((vehicle) => {
            const isExpanded = expandedVehicles.has(vehicle._id);
            const utilidad = vehicle.precioVenta - vehicle.precioCompra - (vehicle.gastos?.total || 0);
            
            return (
              <div key={vehicle._id} className="card hover:shadow-md transition-all">
                {/* Encabezado Compacto - Siempre Visible */}
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleVehicle(vehicle._id)}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">
                          {vehicle.marca} {vehicle.modelo}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          vehicle.estado === 'vendido' 
                            ? 'bg-[#311418] text-primary-300 border border-primary-700/60' 
                            : vehicle.estado === 'en_proceso'
                              ? 'bg-[#2b2116] text-[#f4c26b] border border-[#7e6642]'
                              : 'bg-[#1a2129] text-silver border border-[#4d5663]'
                        }`}>
                          {(() => {
                            // Vehículos en proceso: tiempo desde fechaIngreso hasta ahora
                            if (vehicle.estado === 'en_proceso') {
                              const fechaIngreso = new Date(vehicle.fechaIngreso);
                              const fechaFinal = new Date();
                              const diasEnProceso = Math.floor((fechaFinal.getTime() - fechaIngreso.getTime()) / (1000 * 60 * 60 * 24));
                              return `${diasEnProceso} día${diasEnProceso !== 1 ? 's' : ''} en proceso`;
                            }
                            
                            // Vehículos listos para venta, en negociación o vendidos: tiempo en vitrina
                            // Usar fechaListoVenta si está disponible, si no, usar fechaIngreso
                            const fechaInicioVitrina = vehicle.fechaListoVenta 
                              ? new Date(vehicle.fechaListoVenta) 
                              : new Date(vehicle.fechaIngreso);
                            const fechaFinal = vehicle.estado === 'vendido' && vehicle.fechaVenta 
                              ? new Date(vehicle.fechaVenta) 
                              : new Date();
                            const diasEnVitrina = Math.floor((fechaFinal.getTime() - fechaInicioVitrina.getTime()) / (1000 * 60 * 60 * 24));
                            
                            if (vehicle.estado === 'vendido') {
                              return `${diasEnVitrina} día${diasEnVitrina !== 1 ? 's' : ''} en vitrina`;
                            }
                            return `${diasEnVitrina} día${diasEnVitrina !== 1 ? 's' : ''} en vitrina`;
                          })()}
                        </span>

                      </div>
                      <p className="text-sm text-ink-200">
                        {vehicle.año} • <span className="font-medium">{vehicle.placa}</span>
                      </p>

                    </div>
                    <div className="hidden md:flex items-center space-x-4">
                      {getEstadoBadge(vehicle.estado)}
                      <div className="text-right">
                        <p className="text-xs text-ink-300">Precio Venta</p>
                        <p className="text-sm font-semibold text-white">
                          {formatCurrency(vehicle.precioVenta)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-ink-300">Utilidad</p>
                        <p className={`text-sm font-semibold ${
                          utilidad >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(utilidad)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button className="ml-4 p-2 hover:bg-[#252930] rounded-lg transition-colors">
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-ink-200" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-ink-200" />
                    )}
                  </button>
                </div>

                {/* Información Detallada - Desplegable */}

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-[#32353d] space-y-4">
                    {/* InformaciÃ³n Financiera */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-ink-200 mb-2">Información Financiera</h4>

                        <div className="flex justify-between text-sm">
                          <span className="text-ink-200">Precio Compra:</span>
                          <span className="font-medium text-white">
                            {formatCurrency(vehicle.precioCompra)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-ink-200">Gastos Totales:</span>
                          <span className="font-medium text-orange-600">
                            {formatCurrency((() => {
                              const gastosVehiculo = vehicle.gastos?.total || 0;
                              const gastosInversionistas = vehicle.inversionistas?.reduce((sum, inv) => {
                                const totalGastosInv = inv.gastos?.reduce((s, g) => s + (g.monto || 0), 0) || 0;
                                return sum + totalGastosInv;
                              }, 0) || 0;
                              return gastosVehiculo + gastosInversionistas;
                            })())}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm border-t pt-2">
                          <span className="text-ink-200 font-semibold">Costo Total:</span>
                          <span className="font-semibold text-white">
                            {formatCurrency(vehicle.precioCompra + (vehicle.gastos?.total || 0))}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-ink-200">Precio Venta:</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(vehicle.precioVenta)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm border-t pt-2">
                          <span className="text-ink-200 font-semibold">Utilidad:</span>
                          <span className={`font-semibold ${
                            utilidad >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(utilidad)}
                          </span>
                        </div>
                        {/* Mostrar comisión si existe */}
                        {vehicle.datosVenta?.comision && (vehicle.datosVenta.comision.monto > 0 || vehicle.datosVenta.comision.porcentaje > 0) && (
                          <div className="flex justify-between text-sm pt-2 border-t">
                            <span className="text-ink-200 font-semibold">Comisión Vendedor:</span>
                            <span className="font-semibold text-purple-600">
                              {formatCurrency(vehicle.datosVenta.comision.monto)}
                              {vehicle.datosVenta.comision.porcentaje > 0 && (
                                <span className="text-xs text-purple-500 ml-1">
                                  ({vehicle.datosVenta.comision.porcentaje}%)
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-ink-200 font-semibold">Margen de Ganancia:</span>
                          <span className={`font-semibold ${
                            utilidad >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {(() => {
                              const costoTotal = vehicle.precioCompra + (vehicle.gastos?.total || 0);
                              const margen = costoTotal > 0 ? ((utilidad / costoTotal) * 100).toFixed(2) : '0.00';
                              return `${margen}%`;
                            })()}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-ink-200 mb-2">Detalles del Vehículo</h4>

                        <div className="flex justify-between text-sm">
                          <span className="text-ink-200">Color:</span>
                          <span className="font-medium text-white">{vehicle.color}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-ink-200">Kilometraje:</span>
                          <span className="font-medium text-white">
                            {vehicle.kilometraje.toLocaleString()} km
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-ink-200">VIN:</span>
                          <span className="font-medium text-white text-xs">{vehicle.vin}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-ink-200">Estado:</span>
                          {getEstadoBadge(vehicle.estado)}
                        </div>
                      </div>
                    </div>

                    {/* Desglose de Gastos */}
                    {vehicle.gastos && (vehicle.gastos.pintura > 0 || vehicle.gastos.mecanica > 0 || vehicle.gastos.traspaso > 0 || 
                                        vehicle.gastos.alistamiento > 0 || vehicle.gastos.tapiceria > 0 || vehicle.gastos.transporte > 0 || vehicle.gastos.varios > 0) && (
                      <div>
                        <h4 className="text-sm font-semibold text-ink-200 mb-2">Desglose de Gastos</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {vehicle.gastos.pintura > 0 && (
                            <div className="bg-[#2b1d16] p-2 rounded">
                              <p className="text-xs text-ink-200">Pintura</p>
                              <p className="text-sm font-medium text-orange-600">
                                {formatCurrency(vehicle.gastos.pintura)}
                              </p>
                            </div>
                          )}
                          {vehicle.gastos.mecanica > 0 && (
                            <div className="bg-[#17212f] p-2 rounded">
                              <p className="text-xs text-ink-200">Mecánica</p>

                              <p className="text-sm font-medium text-blue-600">
                                {formatCurrency(vehicle.gastos.mecanica)}
                              </p>
                            </div>
                          )}
                          {vehicle.gastos.traspaso > 0 && (
                            <div className="bg-[#241828] p-2 rounded">
                              <p className="text-xs text-ink-200">Traspaso</p>
                              <p className="text-sm font-medium text-purple-600">
                                {formatCurrency(vehicle.gastos.traspaso)}
                              </p>
                            </div>
                          )}
                          {vehicle.gastos.alistamiento > 0 && (
                            <div className="bg-[#16251f] p-2 rounded">
                              <p className="text-xs text-ink-200">Alistamiento</p>
                              <p className="text-sm font-medium text-green-600">
                                {formatCurrency(vehicle.gastos.alistamiento)}
                              </p>
                            </div>
                          )}
                          {vehicle.gastos.tapiceria > 0 && (
                            <div className="bg-[#2b1823] p-2 rounded">
                              <p className="text-xs text-ink-200">Tapicería</p>

                              <p className="text-sm font-medium text-pink-600">
                                {formatCurrency(vehicle.gastos.tapiceria)}
                              </p>
                            </div>
                          )}
                          {vehicle.gastos.transporte > 0 && (
                            <div className="bg-[#14242b] p-2 rounded">
                              <p className="text-xs text-ink-200">Transporte</p>
                              <p className="text-sm font-medium text-cyan-600">
                                {formatCurrency(vehicle.gastos.transporte)}
                              </p>
                            </div>
                          )}
                          {vehicle.gastos.varios > 0 && (
                            <div className="bg-[#1a1d23] p-2 rounded">
                              <p className="text-xs text-ink-200">Varios</p>
                              <p className="text-sm font-medium text-ink-200">
                                {formatCurrency(vehicle.gastos.varios)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Documentación */}

                    <div>
                      <h4 className="text-sm font-semibold text-ink-200 mb-2">DocumentaciÃ³n</h4>
                      <div className="flex flex-wrap gap-2">
                        {vehicle.documentacion?.prenda?.tiene && (
                          <span className="text-xs bg-[#311418] text-primary-300 px-3 py-1 rounded-full border border-primary-700/60">
                            ⚠️ Prenda
                          </span>
                        )}
                        {vehicle.documentacion?.soat?.tiene && (
                          <span className="text-xs bg-[#1a2129] text-silver px-3 py-1 rounded-full border border-[#4d5663]">
                            ✓ SOAT
                          </span>
                        )}

                        {vehicle.documentacion?.tecnomecanica?.tiene && (
                          <span className="text-xs bg-[#17212f] text-[#83b3e5] px-3 py-1 rounded-full border border-[#33577f]">
                            ✓ Tecnomecánica
                          </span>
                        )}

                        {vehicle.documentacion?.tarjetaPropiedad?.tiene && (
                          <span className="text-xs bg-[#2b1215] text-primary-300 px-3 py-1 rounded-full border border-primary-700/60">
                            ✓ Tarjeta Propiedad
                          </span>
                        )}

                      </div>
                    </div>

                    {/* Inversionistas */}
                    {vehicle.inversionistas && vehicle.inversionistas.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-ink-200 mb-2">Inversionistas</h4>
                        <div className="space-y-2">
                          {vehicle.inversionistas.map((inv, idx) => {
                            const totalGastosInv = inv.gastos?.reduce((s, g) => s + (g.monto || 0), 0) || 0;
                            return (
                              <div key={idx} className="bg-[#18212d] p-3 rounded border border-[#2f455f]">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-sm font-medium text-ink-200">{inv.nombre}</span>
                                  <span className="text-sm font-semibold text-[#83b3e5]">
                                    {formatCurrency(inv.montoInversion)}
                                  </span>
                                </div>
                                {totalGastosInv > 0 && (
                                  <div className="mt-2 pt-2 border-t border-[#2f455f]">
                                    <div className="flex justify-between items-start text-xs mb-2">
                                      <span className="text-ink-200">Total Gastos:</span>
                                      <span className="font-medium text-orange-600">
                                        {formatCurrency(totalGastosInv)}
                                      </span>
                                    </div>
                                    {inv.gastos && inv.gastos.length > 0 && (
                                      <div className="space-y-1">
                                        {inv.gastos.map((gasto, gIdx) => (
                                          <div key={gIdx} className="text-xs text-ink-200 flex justify-between">
                                            <span className="capitalize">{gasto.categoria}:</span>
                                            <span className="font-medium">{formatCurrency(gasto.monto)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Observaciones */}

                    {vehicle.observaciones && (
                      <div>
                        <h4 className="text-sm font-semibold text-ink-200 mb-2">Observaciones</h4>
                        <p className="text-sm text-ink-200 bg-[#1a1d23] p-3 rounded">
                          {vehicle.observaciones}
                        </p>
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="flex flex-wrap justify-end gap-2 pt-2 border-t">
                      {/* Botones para vehículos NO vendidos ni separados */}

                      {vehicle.estado !== 'vendido' && vehicle.estado !== 'separado' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenSeparationModal(vehicle);
                            }}
                            className="px-4 py-2 text-sm bg-amber-500 text-white hover:bg-amber-400 rounded-lg transition-colors border border-amber-400 flex items-center gap-2"
                          >
                            <DollarSign className="h-4 w-4" />
                            Separar Vehículo
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenSaleModal(vehicle);
                            }}
                            className="px-4 py-2 text-sm bg-primary-500 text-white hover:bg-primary-400 rounded-lg transition-colors border border-primary-400 flex items-center gap-2"
                          >
                            <DollarSign className="h-4 w-4" />
                            Vender Vehículo
                          </button>
                        </>
                      )}

                      {/* Botones para vehículos separados */}

                      {vehicle.estado === 'separado' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditSeparationData(vehicle);
                            }}
                            className="px-4 py-2 text-sm bg-amber-600 text-white hover:bg-amber-500 rounded-lg transition-colors border border-amber-500 flex items-center gap-2"
                          >
                            <Edit2 className="h-4 w-4" />
                            Editar Separación
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenSaleModal(vehicle);
                            }}
                            className="px-4 py-2 text-sm bg-primary-500 text-white hover:bg-primary-400 rounded-lg transition-colors border border-primary-400 flex items-center gap-2"
                          >
                            <DollarSign className="h-4 w-4" />
                            Finalizar Venta
                          </button>
                        </>
                      )}
                      
                      {/* Botones para vehículos vendidos */}

                      {vehicle.estado === 'vendido' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditSaleData(vehicle);
                            }}
                            className="px-4 py-2 text-sm bg-[#2a2d34] text-white hover:bg-[#333740] rounded-lg transition-colors border border-[#3d434e] flex items-center gap-2"
                          >
                            <Edit2 className="h-4 w-4" />
                            Editar Datos de Venta
                          </button>
                          
                          {vehicle.datosVenta && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGenerateContract(vehicle._id);
                                }}
                                className="px-4 py-2 text-sm bg-[#15253a] text-white hover:bg-[#1c314c] rounded-lg transition-colors border border-[#325278] flex items-center gap-2"
                              >
                                <FileText className="h-4 w-4" />
                                Generar Contrato
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGenerateTransferForm(vehicle._id);
                                }}
                                className="px-4 py-2 text-sm bg-[#2b1b12] text-white hover:bg-[#352217] rounded-lg transition-colors border border-[#6a4530] flex items-center gap-2"
                              >
                                <FileText className="h-4 w-4" />
                                Formulario Traspaso
                              </button>
                            </>
                          )}
                        </>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/vehicles/inspection?vehicle=${vehicle._id}`);
                        }}
                        className="px-4 py-2 text-sm text-[#f3c679] hover:bg-[#2a2215] rounded-lg transition-colors flex items-center gap-2 border border-[#6b542d]"
                      >
                        <ClipboardCheck className="h-4 w-4" />
                        Checklist Ingreso
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const response = await api.get(`/vehicles/${vehicle._id}/export`, {
                              responseType: 'blob'
                            });
                            const url = window.URL.createObjectURL(new Blob([response.data]));
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', `vehiculo-${vehicle.placa}-${Date.now()}.xlsx`);
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                          } catch (error) {
                            console.error('Error al exportar:', error);
                            alert('Error al exportar el vehículo');
                          }

                        }}
                        className="px-4 py-2 text-sm text-silver hover:bg-[#1f252c] rounded-lg transition-colors flex items-center gap-2"
                      >
                        <FileDown className="h-4 w-4" />
                        Reporte Completo
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/vehicles/${vehicle._id}/edit`);
                        }}
                        className="px-4 py-2 text-sm text-[#83b3e5] hover:bg-[#17212f] rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Editar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(vehicle._id);
                        }}
                        className="px-4 py-2 text-sm text-primary-300 hover:bg-[#2a1114] rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Datos de Venta */}
      {selectedVehicle && (
        <>
          <SaleDataModal
            isOpen={saleModalOpen}
            onClose={() => {
              setSaleModalOpen(false);
              setSelectedVehicle(null);
            }}
            onSubmit={handleSaveSaleData}
            vehiclePlaca={selectedVehicle.placa}
            vehicleData={selectedVehicle}
            initialData={selectedVehicle.datosVenta}
            isEditMode={selectedVehicle.estado === 'vendido' && !!selectedVehicle.datosVenta}
          />
        </>
      )}

      {/* Modal de Separación */}
      {selectedVehicle && (
        <SeparationModal
          isOpen={separationModalOpen}
          onClose={() => {
            setSeparationModalOpen(false);
            setSelectedVehicle(null);
          }}
          onSubmit={handleSaveSeparationData}
          vehiclePlaca={selectedVehicle.placa}
          vehiclePrecioVenta={selectedVehicle.precioVenta}
          initialData={selectedVehicle.datosSeparacion}
          isEditMode={selectedVehicle.estado === 'separado' && !!selectedVehicle.datosSeparacion}
          isSubmitting={isSavingSeparation}
        />
      )}
    </Layout>
  );
};

export default VehicleList;
