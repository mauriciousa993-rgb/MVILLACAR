import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { buildVehiclePhotoUrl } from '../services/api';
import autoTechLogo from '../assets/autotech-logo.png';

interface Vehicle {
  _id: string;
  marca: string;
  modelo: string;
  anio?: number;
  placa: string;
  color: string;
  kilometraje: number;
  precioVenta: number;
  fotos: {
    exteriores: string[];
    interiores: string[];
    detalles: string[];
  };
  observaciones: string;
}

const Marketplace: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/vehicles/marketplace');
      setVehicles(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error desconocido';
      setError(`Error al cargar los vehiculos: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = () => {
    navigate('/login');
  };

  const getLastPhoto = (photos?: string[]): string => {
    if (!photos || photos.length === 0) return '';
    return photos[photos.length - 1];
  };

  const getPrimaryPhoto = (vehicle: Vehicle): string => {
    return (
      getLastPhoto(vehicle.fotos?.exteriores) ||
      getLastPhoto(vehicle.fotos?.interiores) ||
      getLastPhoto(vehicle.fotos?.detalles) ||
      ''
    );
  };

  const hasValidImage = (vehicle: Vehicle): boolean => {
    return !!getPrimaryPhoto(vehicle) && !imageErrors[vehicle._id];
  };

  const getVehicleYear = (vehicle: Vehicle): number | string => {
    const fromUnicodeKey = (vehicle as any)['a\u00f1o'];
    const fromBrokenKey = (vehicle as any)['año'];
    return fromUnicodeKey ?? vehicle.anio ?? fromBrokenKey ?? '';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-ink-200">Cargando vehiculos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-900 px-4">
        <div className="text-center max-w-md mx-auto p-6 card">
          <p className="text-primary-300 mb-4">{error}</p>
          <button
            onClick={fetchVehicles}
            className="btn-primary"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-900 text-ink-100">
      <header className="border-b border-[#2f3238] bg-[#121212]/95 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 py-5">
            <div className="flex items-center gap-3">
              <img src={autoTechLogo} alt="AutoTech logo" className="h-12 w-12 object-contain" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Marketplace AutoTech</h1>
                <p className="text-ink-300">Encuentra el vehiculo ideal para ti</p>
              </div>
            </div>
            <button
              onClick={handleAdminLogin}
              className="btn-primary inline-flex items-center justify-center"
            >
              Iniciar Sesion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {vehicles.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-ink-300 text-lg">No hay vehiculos disponibles en este momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <div key={vehicle._id} className="card overflow-hidden p-0">
                <div className="h-52 bg-[#16181d] border-b border-[#2f3238]">
                  {hasValidImage(vehicle) ? (
                    <img
                      src={buildVehiclePhotoUrl(getPrimaryPhoto(vehicle))}
                      alt={`${vehicle.marca} ${vehicle.modelo}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        setImageErrors((prev) => ({ ...prev, [vehicle._id]: true }));
                        (e.currentTarget as HTMLImageElement).onerror = null;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink-300">
                      Sin imagen
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {vehicle.marca} {vehicle.modelo} {getVehicleYear(vehicle)}
                  </h3>

                  <div className="space-y-2 text-sm text-ink-200">
                    <p><span className="font-medium text-ink-100">Placa:</span> {vehicle.placa}</p>
                    <p><span className="font-medium text-ink-100">Color:</span> {vehicle.color}</p>
                    <p><span className="font-medium text-ink-100">Kilometraje:</span> {vehicle.kilometraje.toLocaleString('es-CO')} km</p>
                  </div>

                  <div className="mt-4">
                    <p className="text-2xl font-bold text-signal">
                      ${vehicle.precioVenta.toLocaleString('es-CO')}
                    </p>
                  </div>

                  {vehicle.observaciones && (
                    <div className="mt-4">
                      <p className="text-sm text-ink-300 line-clamp-2">
                        {vehicle.observaciones}
                      </p>
                    </div>
                  )}

                  <button className="mt-4 w-full btn-primary">
                    Contactar Vendedor
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-[#2f3238] mt-12 bg-[#111214]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-ink-300">
            <p>&copy; 2024 AutoTech Marketplace.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Marketplace;
