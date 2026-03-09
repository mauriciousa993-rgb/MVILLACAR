import React, { useState } from 'react';
import { Search, Package, Calendar, CheckCircle2, FileText, UserCheck, TrendingUp } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import api from '../services/api';

interface ConsultaResponse {
  found: boolean;
  vehiculo?: {
    marca: string;
    modelo: string;
    año: number;
    placa: string;
    color: string;
    fechaVenta?: string;
    estadoTramite?: 'firma_documentos' | 'radicacion' | 'recepcion_tarjeta' | 'entrega_cliente' | 'completado';
    comprador: {
      nombre: string;
    };
  };
  message?: string;
}

const ConsultaTramite: React.FC = () => {
  const [placa, setPlaca] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<ConsultaResponse | null>(null);
  const [error, setError] = useState('');

  const handleConsultar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!placa.trim()) {
      setError('Por favor ingrese un número de placa');
      return;
    }

    setLoading(true);
    setError('');
    setResultado(null);

    try {
      const response = await api.get(`/vehicles/consulta/${placa.toUpperCase()}`);
      setResultado(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setResultado({ found: false, message: 'No se encontró un vehículo vendido con esta placa' });
      } else {
        setError('Error al consultar. Por favor intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getEstadoInfo = (estado?: string) => {
    const estados = {
      firma_documentos: {
        label: 'Firma de Documentos',
        icon: FileText,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        description: 'Los documentos están siendo firmados por las partes'
      },
      radicacion: {
        label: 'Radicación',
        icon: TrendingUp,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        description: 'Los documentos han sido radicados ante la autoridad de tránsito'
      },
      recepcion_tarjeta: {
        label: 'Recepción de Tarjeta de Propiedad',
        icon: Package,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/30',
        description: 'La tarjeta de propiedad ha sido recibida de tránsito'
      },
      entrega_cliente: {
        label: 'Entrega de Tarjeta al Cliente',
        icon: UserCheck,
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
        description: 'La tarjeta está lista para ser entregada al cliente'
      },
      completado: {
        label: 'Completado',
        icon: CheckCircle2,
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        description: 'El proceso de traspaso ha sido completado exitosamente'
      }
    };

    return estados[estado as keyof typeof estados] || estados.firma_documentos;
  };

  const estadoInfo = resultado?.vehiculo?.estadoTramite 
    ? getEstadoInfo(resultado.vehiculo.estadoTramite)
    : null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Consulta de Estado de Trámite</h1>
          <p className="text-ink-300">
            Verifica el estado del traspaso de tu vehículo ingresando el número de placa
          </p>
        </div>

        {/* Formulario de Consulta */}
        <div className="card mb-6">
          <form onSubmit={handleConsultar} className="space-y-4">
            <div>
              <label htmlFor="placa" className="block text-sm font-medium text-ink-100 mb-2">
                Número de Placa
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  id="placa"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                  placeholder="Ej: ABC123"
                  className="input-field flex-1 uppercase"
                  maxLength={6}
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary px-8 flex items-center gap-2 disabled:opacity-50"
                >
                  <Search className="h-5 w-5" />
                  {loading ? 'Consultando...' : 'Consultar'}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </form>
        </div>

        {/* Resultado de la Consulta */}
        {resultado && (
          <div className="card">
            {resultado.found && resultado.vehiculo ? (
              <div className="space-y-6">
                {/* Información del Vehículo */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Package className="h-6 w-6 text-primary-400" />
                    Información del Vehículo
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-surface-800 rounded-lg border border-[#2f3238]">
                      <p className="text-sm text-ink-300 mb-1">Vehículo</p>
                      <p className="text-lg font-semibold text-white">
                        {resultado.vehiculo.marca} {resultado.vehiculo.modelo}
                      </p>
                    </div>
                    <div className="p-4 bg-surface-800 rounded-lg border border-[#2f3238]">
                      <p className="text-sm text-ink-300 mb-1">Año</p>
                      <p className="text-lg font-semibold text-white">{resultado.vehiculo.año}</p>
                    </div>
                    <div className="p-4 bg-surface-800 rounded-lg border border-[#2f3238]">
                      <p className="text-sm text-ink-300 mb-1">Placa</p>
                      <p className="text-lg font-semibold text-white">{resultado.vehiculo.placa}</p>
                    </div>
                    <div className="p-4 bg-surface-800 rounded-lg border border-[#2f3238]">
                      <p className="text-sm text-ink-300 mb-1">Color</p>
                      <p className="text-lg font-semibold text-white">{resultado.vehiculo.color}</p>
                    </div>
                    {resultado.vehiculo.fechaVenta && (
                      <div className="p-4 bg-surface-800 rounded-lg border border-[#2f3238]">
                        <p className="text-sm text-ink-300 mb-1">Fecha de Venta</p>
                        <p className="text-lg font-semibold text-white">
                          {new Date(resultado.vehiculo.fechaVenta).toLocaleDateString('es-CO', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                    <div className="p-4 bg-surface-800 rounded-lg border border-[#2f3238]">
                      <p className="text-sm text-ink-300 mb-1">Comprador</p>
                      <p className="text-lg font-semibold text-white">{resultado.vehiculo.comprador.nombre}</p>
                    </div>
                  </div>
                </div>

                {/* Estado del Trámite */}
                {estadoInfo && (
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Calendar className="h-6 w-6 text-primary-400" />
                      Estado del Trámite
                    </h2>
                    <div className={`p-6 rounded-lg border ${estadoInfo.bgColor} ${estadoInfo.borderColor}`}>
                      <div className="flex items-start gap-4">
                        {React.createElement(estadoInfo.icon, {
                          className: `h-12 w-12 ${estadoInfo.color}`
                        })}
                        <div className="flex-1">
                          <h3 className={`text-2xl font-bold mb-2 ${estadoInfo.color}`}>
                            {estadoInfo.label}
                          </h3>
                          <p className="text-ink-200">
                            {estadoInfo.description}
                          </p>
                        </div>
                      </div>

                      {/* Barra de Progreso */}
                      <div className="mt-6">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-ink-300">Progreso del trámite</span>
                          <span className="text-sm font-medium text-white">
                            {resultado.vehiculo.estadoTramite === 'firma_documentos' && '25%'}
                            {resultado.vehiculo.estadoTramite === 'radicacion' && '50%'}
                            {resultado.vehiculo.estadoTramite === 'recepcion_tarjeta' && '75%'}
                            {resultado.vehiculo.estadoTramite === 'entrega_cliente' && '90%'}
                            {resultado.vehiculo.estadoTramite === 'completado' && '100%'}
                          </span>
                        </div>
                        <div className="w-full bg-surface-800 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${estadoInfo.color.replace('text-', 'bg-')}`}
                            style={{
                              width:
                                resultado.vehiculo.estadoTramite === 'firma_documentos' ? '25%' :
                                resultado.vehiculo.estadoTramite === 'radicacion' ? '50%' :
                                resultado.vehiculo.estadoTramite === 'recepcion_tarjeta' ? '75%' :
                                resultado.vehiculo.estadoTramite === 'entrega_cliente' ? '90%' :
                                '100%'
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Etapas */}
                      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-2">
                        <div className={`text-center p-2 rounded ${resultado.vehiculo.estadoTramite === 'firma_documentos' ? 'bg-blue-500/20' : 'bg-surface-800'}`}>
                          <FileText className={`h-5 w-5 mx-auto mb-1 ${['firma_documentos', 'radicacion', 'recepcion_tarjeta', 'entrega_cliente', 'completado'].includes(resultado.vehiculo.estadoTramite || '') ? 'text-blue-400' : 'text-ink-400'}`} />
                          <p className="text-xs text-ink-300">Firma</p>
                        </div>
                        <div className={`text-center p-2 rounded ${resultado.vehiculo.estadoTramite === 'radicacion' ? 'bg-yellow-500/20' : 'bg-surface-800'}`}>
                          <TrendingUp className={`h-5 w-5 mx-auto mb-1 ${['radicacion', 'recepcion_tarjeta', 'entrega_cliente', 'completado'].includes(resultado.vehiculo.estadoTramite || '') ? 'text-yellow-400' : 'text-ink-400'}`} />
                          <p className="text-xs text-ink-300">Radicación</p>
                        </div>
                        <div className={`text-center p-2 rounded ${resultado.vehiculo.estadoTramite === 'recepcion_tarjeta' ? 'bg-purple-500/20' : 'bg-surface-800'}`}>
                          <Package className={`h-5 w-5 mx-auto mb-1 ${['recepcion_tarjeta', 'entrega_cliente', 'completado'].includes(resultado.vehiculo.estadoTramite || '') ? 'text-purple-400' : 'text-ink-400'}`} />
                          <p className="text-xs text-ink-300">Recepción</p>
                        </div>
                        <div className={`text-center p-2 rounded ${resultado.vehiculo.estadoTramite === 'entrega_cliente' ? 'bg-orange-500/20' : 'bg-surface-800'}`}>
                          <UserCheck className={`h-5 w-5 mx-auto mb-1 ${['entrega_cliente', 'completado'].includes(resultado.vehiculo.estadoTramite || '') ? 'text-orange-400' : 'text-ink-400'}`} />
                          <p className="text-xs text-ink-300">Entrega</p>
                        </div>
                        <div className={`text-center p-2 rounded ${resultado.vehiculo.estadoTramite === 'completado' ? 'bg-green-500/20' : 'bg-surface-800'}`}>
                          <CheckCircle2 className={`h-5 w-5 mx-auto mb-1 ${resultado.vehiculo.estadoTramite === 'completado' ? 'text-green-400' : 'text-ink-400'}`} />
                          <p className="text-xs text-ink-300">Completado</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-ink-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Vehículo no encontrado
                </h3>
                <p className="text-ink-300">
                  No se encontró un vehículo vendido con la placa <span className="font-mono font-bold">{placa}</span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ConsultaTramite;
