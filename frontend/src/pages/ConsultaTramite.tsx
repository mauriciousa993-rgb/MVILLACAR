import React, { useEffect, useRef, useState } from 'react';
import { Search, Package, Calendar, CheckCircle2, FileText, UserCheck, TrendingUp } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import api from '../services/api';

type TramiteStatus =
  | 'firma_documentos'
  | 'radicacion'
  | 'recepcion_tarjeta'
  | 'entrega_cliente'
  | 'completado';

interface FirmaEntregaCliente {
  nombre: string;
  firmaDataUrl: string;
  fechaFirma?: string;
}

interface ConsultaResponse {
  found: boolean;
  vehiculo?: {
    marca: string;
    modelo: string;
    año: number;
    placa: string;
    color: string;
    fechaVenta?: string;
    estadoTramite?: TramiteStatus;
    firmaEntregaCliente?: FirmaEntregaCliente | null;
    comprador: {
      nombre: string;
    };
  };
  message?: string;
}

interface SignaturePoint {
  x: number;
  y: number;
}

const ConsultaTramite: React.FC = () => {
  const [placa, setPlaca] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<ConsultaResponse | null>(null);
  const [error, setError] = useState('');

  const [firmaNombre, setFirmaNombre] = useState('');
  const [firmaDataUrl, setFirmaDataUrl] = useState('');
  const [firmaError, setFirmaError] = useState('');
  const [guardandoFirma, setGuardandoFirma] = useState(false);

  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const signatureLastPointRef = useRef<SignaturePoint | null>(null);
  const [isDrawingSignature, setIsDrawingSignature] = useState(false);

  const getCanvasPoint = (event: React.PointerEvent<HTMLCanvasElement>): SignaturePoint => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const getSignatureContext = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return null;

    const context = canvas.getContext('2d');
    if (!context) return null;

    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = 3;
    context.strokeStyle = '#111827';

    return { canvas, context };
  };

  const clearSignatureCanvas = (keepSignatureState = false) => {
    const signatureCanvas = getSignatureContext();
    if (!signatureCanvas) return;

    const { canvas, context } = signatureCanvas;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);

    signatureLastPointRef.current = null;
    if (!keepSignatureState) {
      setFirmaDataUrl('');
    }
  };

  const drawSignatureFromDataUrl = (dataUrl: string) => {
    if (!dataUrl) {
      clearSignatureCanvas(true);
      return;
    }

    const signatureCanvas = getSignatureContext();
    if (!signatureCanvas) return;

    const { canvas, context } = signatureCanvas;
    const image = new Image();

    image.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = '#FFFFFF';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
    };

    image.src = dataUrl;
  };

  const startSignatureStroke = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const signatureCanvas = getSignatureContext();
    if (!signatureCanvas) return;

    const { context } = signatureCanvas;
    const point = getCanvasPoint(event);

    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDrawingSignature(true);
    signatureLastPointRef.current = point;

    context.beginPath();
    context.moveTo(point.x, point.y);
    context.lineTo(point.x + 0.1, point.y + 0.1);
    context.stroke();
  };

  const moveSignatureStroke = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingSignature) return;

    const signatureCanvas = getSignatureContext();
    if (!signatureCanvas) return;

    const { context } = signatureCanvas;
    const point = getCanvasPoint(event);
    const lastPoint = signatureLastPointRef.current;

    if (!lastPoint) {
      signatureLastPointRef.current = point;
      return;
    }

    context.beginPath();
    context.moveTo(lastPoint.x, lastPoint.y);
    context.lineTo(point.x, point.y);
    context.stroke();

    signatureLastPointRef.current = point;
  };

  const endSignatureStroke = () => {
    if (!isDrawingSignature) return;

    setIsDrawingSignature(false);
    signatureLastPointRef.current = null;

    const canvas = signatureCanvasRef.current;
    if (canvas) {
      setFirmaDataUrl(canvas.toDataURL('image/png'));
    }
  };

  useEffect(() => {
    clearSignatureCanvas(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    clearSignatureCanvas(true);
    if (firmaDataUrl) {
      drawSignatureFromDataUrl(firmaDataUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firmaDataUrl]);

  useEffect(() => {
    const firmaGuardada = resultado?.vehiculo?.firmaEntregaCliente;
    if (firmaGuardada?.firmaDataUrl) {
      setFirmaNombre(firmaGuardada.nombre || '');
      setFirmaDataUrl(firmaGuardada.firmaDataUrl);
      return;
    }

    setFirmaNombre('');
    setFirmaDataUrl('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultado]);

  const handleConsultar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!placa.trim()) {
      setError('Por favor ingrese un numero de placa');
      return;
    }

    setLoading(true);
    setError('');
    setFirmaError('');
    setResultado(null);

    try {
      const response = await api.get(`/vehicles/consulta/${placa.toUpperCase()}`);
      setResultado(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setResultado({ found: false, message: 'No se encontro un vehiculo vendido con esta placa' });
      } else {
        setError('Error al consultar. Por favor intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarFirma = async () => {
    if (!resultado?.vehiculo?.placa) {
      setFirmaError('Primero consulta una placa valida');
      return;
    }

    if (!firmaNombre.trim()) {
      setFirmaError('Ingresa el nombre de quien recibe el vehiculo');
      return;
    }

    if (!firmaDataUrl) {
      setFirmaError('Debes firmar en el recuadro antes de guardar');
      return;
    }

    setGuardandoFirma(true);
    setFirmaError('');

    try {
      const response = await api.post(`/vehicles/consulta/${resultado.vehiculo.placa}/firma-entrega`, {
        nombre: firmaNombre.trim(),
        firmaDataUrl,
      });
      setResultado(response.data);
    } catch (err: any) {
      setFirmaError(err?.response?.data?.message || 'No se pudo guardar la firma de entrega');
    } finally {
      setGuardandoFirma(false);
    }
  };

  const getEstadoInfo = (estado?: TramiteStatus) => {
    const estados = {
      firma_documentos: {
        label: 'Firma de Documentos',
        icon: FileText,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        description: 'Los documentos estan siendo firmados por las partes',
      },
      radicacion: {
        label: 'Radicacion',
        icon: TrendingUp,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        description: 'Los documentos han sido radicados ante la autoridad de transito',
      },
      recepcion_tarjeta: {
        label: 'Recepcion de Tarjeta de Propiedad',
        icon: Package,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/30',
        description: 'La tarjeta de propiedad ha sido recibida de transito',
      },
      entrega_cliente: {
        label: 'Entrega de Tarjeta al Cliente',
        icon: UserCheck,
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
        description: 'La tarjeta esta lista para ser entregada al cliente',
      },
      completado: {
        label: 'Completado',
        icon: CheckCircle2,
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        description: 'El proceso de traspaso ha sido completado exitosamente',
      },
    };

    return estados[estado || 'firma_documentos'];
  };

  const estadoInfo = resultado?.vehiculo?.estadoTramite
    ? getEstadoInfo(resultado.vehiculo.estadoTramite)
    : null;

  const firmaGuardada = resultado?.vehiculo?.firmaEntregaCliente;
  const puedeFirmarEntrega =
    resultado?.vehiculo?.estadoTramite === 'entrega_cliente' ||
    resultado?.vehiculo?.estadoTramite === 'completado';

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Consulta de Estado de Tramite</h1>
          <p className="text-ink-300">
            Verifica el estado del traspaso de tu vehiculo ingresando el numero de placa
          </p>
        </div>

        <div className="card mb-6">
          <form onSubmit={handleConsultar} className="space-y-4">
            <div>
              <label htmlFor="placa" className="block text-sm font-medium text-ink-100 mb-2">
                Numero de Placa
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

        {resultado && (
          <div className="card">
            {resultado.found && resultado.vehiculo ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Package className="h-6 w-6 text-primary-400" />
                    Informacion del Vehiculo
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-surface-800 rounded-lg border border-[#2f3238]">
                      <p className="text-sm text-ink-300 mb-1">Vehiculo</p>
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
                            day: 'numeric',
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

                {estadoInfo && (
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Calendar className="h-6 w-6 text-primary-400" />
                      Estado del Tramite
                    </h2>
                    <div className={`p-6 rounded-lg border ${estadoInfo.bgColor} ${estadoInfo.borderColor}`}>
                      <div className="flex items-start gap-4">
                        {React.createElement(estadoInfo.icon, {
                          className: `h-12 w-12 ${estadoInfo.color}`,
                        })}
                        <div className="flex-1">
                          <h3 className={`text-2xl font-bold mb-2 ${estadoInfo.color}`}>{estadoInfo.label}</h3>
                          <p className="text-ink-200">{estadoInfo.description}</p>
                        </div>
                      </div>

                      <div className="mt-6">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-ink-300">Progreso del tramite</span>
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
                                resultado.vehiculo.estadoTramite === 'firma_documentos'
                                  ? '25%'
                                  : resultado.vehiculo.estadoTramite === 'radicacion'
                                    ? '50%'
                                    : resultado.vehiculo.estadoTramite === 'recepcion_tarjeta'
                                      ? '75%'
                                      : resultado.vehiculo.estadoTramite === 'entrega_cliente'
                                        ? '90%'
                                        : '100%',
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-2">
                        <div
                          className={`text-center p-2 rounded ${resultado.vehiculo.estadoTramite === 'firma_documentos' ? 'bg-blue-500/20' : 'bg-surface-800'}`}
                        >
                          <FileText
                            className={`h-5 w-5 mx-auto mb-1 ${['firma_documentos', 'radicacion', 'recepcion_tarjeta', 'entrega_cliente', 'completado'].includes(resultado.vehiculo.estadoTramite || '') ? 'text-blue-400' : 'text-ink-400'}`}
                          />
                          <p className="text-xs text-ink-300">Firma</p>
                        </div>
                        <div
                          className={`text-center p-2 rounded ${resultado.vehiculo.estadoTramite === 'radicacion' ? 'bg-yellow-500/20' : 'bg-surface-800'}`}
                        >
                          <TrendingUp
                            className={`h-5 w-5 mx-auto mb-1 ${['radicacion', 'recepcion_tarjeta', 'entrega_cliente', 'completado'].includes(resultado.vehiculo.estadoTramite || '') ? 'text-yellow-400' : 'text-ink-400'}`}
                          />
                          <p className="text-xs text-ink-300">Radicacion</p>
                        </div>
                        <div
                          className={`text-center p-2 rounded ${resultado.vehiculo.estadoTramite === 'recepcion_tarjeta' ? 'bg-purple-500/20' : 'bg-surface-800'}`}
                        >
                          <Package
                            className={`h-5 w-5 mx-auto mb-1 ${['recepcion_tarjeta', 'entrega_cliente', 'completado'].includes(resultado.vehiculo.estadoTramite || '') ? 'text-purple-400' : 'text-ink-400'}`}
                          />
                          <p className="text-xs text-ink-300">Recepcion</p>
                        </div>
                        <div
                          className={`text-center p-2 rounded ${resultado.vehiculo.estadoTramite === 'entrega_cliente' ? 'bg-orange-500/20' : 'bg-surface-800'}`}
                        >
                          <UserCheck
                            className={`h-5 w-5 mx-auto mb-1 ${['entrega_cliente', 'completado'].includes(resultado.vehiculo.estadoTramite || '') ? 'text-orange-400' : 'text-ink-400'}`}
                          />
                          <p className="text-xs text-ink-300">Entrega</p>
                        </div>
                        <div
                          className={`text-center p-2 rounded ${resultado.vehiculo.estadoTramite === 'completado' ? 'bg-green-500/20' : 'bg-surface-800'}`}
                        >
                          <CheckCircle2
                            className={`h-5 w-5 mx-auto mb-1 ${resultado.vehiculo.estadoTramite === 'completado' ? 'text-green-400' : 'text-ink-400'}`}
                          />
                          <p className="text-xs text-ink-300">Completado</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {puedeFirmarEntrega && (
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <UserCheck className="h-6 w-6 text-primary-400" />
                      Firma de Entrega
                    </h2>
                    <div className="p-6 rounded-lg border border-[#2f3238] bg-surface-900/60 space-y-4">
                      <p className="text-ink-200 text-sm">
                        Firma digital de quien recibe el vehiculo. Esta firma se usa tambien en los PDFs del proceso.
                      </p>

                      {firmaGuardada?.firmaDataUrl ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-surface-800 rounded-lg border border-[#2f3238]">
                            <p className="text-sm text-ink-300 mb-1">Firma registrada por</p>
                            <p className="text-lg font-semibold text-white">{firmaGuardada.nombre}</p>
                            {firmaGuardada.fechaFirma && (
                              <p className="text-xs text-ink-300 mt-2">
                                Fecha de firma:{' '}
                                {new Date(firmaGuardada.fechaFirma).toLocaleDateString('es-CO', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>
                            )}
                          </div>
                          <div className="p-4 bg-surface-800 rounded-lg border border-[#2f3238]">
                            <p className="text-sm text-ink-300 mb-2">Firma</p>
                            <img
                              src={firmaGuardada.firmaDataUrl}
                              alt="Firma del cliente"
                              className="w-full h-28 bg-white rounded-lg border border-[#2f3238] object-contain"
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <label htmlFor="firmaNombre" className="block text-sm font-medium text-ink-100 mb-2">
                              Nombre de quien recibe el vehiculo
                            </label>
                            <input
                              id="firmaNombre"
                              type="text"
                              value={firmaNombre}
                              onChange={(event) => setFirmaNombre(event.target.value)}
                              placeholder="Nombre completo"
                              className="input-field"
                              maxLength={120}
                              disabled={guardandoFirma}
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-sm font-medium text-ink-100">Firma en pantalla</label>
                              <button
                                type="button"
                                className="text-xs text-primary-300 hover:text-primary-200"
                                onClick={() => {
                                  clearSignatureCanvas();
                                  setFirmaError('');
                                }}
                                disabled={guardandoFirma}
                              >
                                Limpiar firma
                              </button>
                            </div>
                            <canvas
                              ref={signatureCanvasRef}
                              width={560}
                              height={180}
                              className="w-full h-44 bg-white rounded-lg border border-[#2f3238] touch-none"
                              onPointerDown={startSignatureStroke}
                              onPointerMove={moveSignatureStroke}
                              onPointerUp={endSignatureStroke}
                              onPointerLeave={endSignatureStroke}
                              onPointerCancel={endSignatureStroke}
                            />
                          </div>

                          {firmaError && (
                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                              <p className="text-red-400 text-sm">{firmaError}</p>
                            </div>
                          )}

                          <button
                            type="button"
                            className="btn-primary disabled:opacity-50"
                            onClick={handleGuardarFirma}
                            disabled={guardandoFirma}
                          >
                            {guardandoFirma ? 'Guardando firma...' : 'Guardar firma de entrega'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-ink-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Vehiculo no encontrado</h3>
                <p className="text-ink-300">
                  No se encontro un vehiculo vendido con la placa{' '}
                  <span className="font-mono font-bold">{placa}</span>
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

