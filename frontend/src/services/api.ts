import axios from 'axios';
import {
  AuthResponse,
  User,
  Vehicle,
  Statistics,
  DatosVenta,
  DatosSeparacion,
  FixedExpense,
  VehicleInspectionChecklist,
  VehicleInspectionChecklistPayload,
} from '../types';

// Detectar URL API para desarrollo y produccion
const getAPIURL = (): string => {
  const normalizeApiBase = (url: string): string => {
    const clean = url.trim().replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  };

  const env = (import.meta as any).env || {};
  const viteApiUrl = env.VITE_API_URL;
  const isProduction = Boolean(env.PROD);

  if (viteApiUrl) {
    const apiBase = normalizeApiBase(viteApiUrl);
    console.log('API URL (env):', apiBase);
    return apiBase;
  }

  if (isProduction) {
    const sameOriginApi = normalizeApiBase(window.location.origin);
    console.warn(
      'VITE_API_URL no esta configurada en produccion. Usando fallback de mismo dominio:',
      sameOriginApi
    );
    return sameOriginApi;
  }

  const hostname = window.location.hostname;
  const apiURL = `http://${hostname}:5000/api`;
  console.log('API URL (desarrollo):', apiURL);
  return apiURL;
};

const API_URL = getAPIURL();

const getPhotoFileName = (photoPath: string): string => {
  const cleanPath = photoPath.split('?')[0].split('#')[0].trim();
  const parts = cleanPath.split('/').filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : '';
};

export const buildVehiclePhotoUrl = (photoPath?: string): string => {
  if (!photoPath) return '';

  // Si ya es una URL absoluta (Cloudinary, etc.), devolverla directamente
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    return photoPath;
  }

  // Si es una ruta local
  const fileName = getPhotoFileName(photoPath);
  if (!fileName) return '';

  return `${API_URL}/vehicles/photo/${encodeURIComponent(fileName)}`;
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    // Registrar errores de conexión para debugging en móviles
    if (!error.response) {
      console.error('❌ Error de conexión:', error.message);
      console.log('API URL intentada:', API_URL);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get<User>('/auth/profile');
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get<User[]>('/auth/users');
    return response.data;
  },

  createUser: async (data: { nombre: string; email: string; password: string; rol: string }) => {
    const response = await api.post('/auth/users/create', data);
    return response.data;
  },

  updateUser: async (id: string, data: Partial<User>) => {
    const response = await api.put(`/auth/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/auth/users/${id}`);
    return response.data;
  },
};

export interface VisionPropertyCardOcrResponse {
  source?: string;
  confidence: number;
  detectedFields: number;
  rawText: string;
  extracted: Record<string, unknown>;
}

// Vehicles API
export const vehiclesAPI = {
  getAll: async (filters?: { estado?: string; marca?: string; modelo?: string; año?: number }) => {
    const response = await api.get<Vehicle[]>('/vehicles', { params: filters });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Vehicle>(`/vehicles/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post<{ message: string; vehicle: Vehicle }>('/vehicles', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    try {
      const response = await api.put<{ message: string; vehicle: Vehicle }>(`/vehicles/${id}`, data);
      return response.data;
    } catch (error: any) {
      // Re-lanzar el error con información detallada para que el componente pueda manejarlo
      if (error.response) {
        // El servidor respondió con un código de error
        console.error('Error de respuesta del servidor:', error.response.data);
        throw error;
      } else if (error.request) {
        // La petición fue hecha pero no se recibió respuesta
        console.error('Error de conexión:', error.request);
        throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      } else {
        // Algo pasó al configurar la petición
        console.error('Error:', error.message);
        throw error;
      }
    }
  },

  delete: async (id: string) => {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },

  getStatistics: async () => {
    const response = await api.get<Statistics>('/vehicles/statistics');
    return response.data;
  },

  exportToExcel: async (estado?: string) => {
    const response = await api.get('/vehicles/export', {
      params: { estado },
      responseType: 'blob',
    });
    
    // Crear un enlace de descarga
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `inventario-vehiculos-${Date.now()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  uploadPhotos: async (id: string, tipo: string, files: File[]) => {
    const formData = new FormData();
    formData.append('tipo', tipo);
    files.forEach((file) => {
      formData.append('fotos', file);
    });

    const response = await api.post(`/vehicles/${id}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  readPropertyCardWithVisionAI: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<VisionPropertyCardOcrResponse>('/vehicles/ocr/property-card', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  getExpiringDocuments: async () => {
    const response = await api.get<Vehicle[]>('/vehicles/expiring-documents');
    return response.data;
  },

  getVehiclesWithExpiringDocuments: async () => {
    const response = await api.get<Vehicle[]>('/vehicles/expiring-documents');
    return response.data;
  },

  saveSaleData: async (id: string, data: DatosVenta) => {
    const response = await api.post(`/vehicles/${id}/sale-data`, data);
    return response.data;
  },

  saveSeparationData: async (id: string, data: DatosSeparacion) => {
    const response = await api.post(`/vehicles/${id}/separation-data`, data);
    return response.data;
  },

  updateSeparationData: async (id: string, data: DatosSeparacion) => {
    const response = await api.put(`/vehicles/${id}/separation-data`, data);
    return response.data;
  },

  updateSaleData: async (id: string, data: DatosVenta) => {
    const response = await api.put(`/vehicles/${id}/sale-data`, data);
    return response.data;
  },

  generateContract: async (id: string) => {
    const response = await api.get(`/vehicles/${id}/contract`, {
      responseType: 'blob',
    });
    
    // Crear un enlace de descarga con extensión PDF
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `contrato-${id}-${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  generateTransferForm: async (id: string) => {
    const response = await api.get(`/vehicles/${id}/transfer-form`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `formulario-traspaso-${id}-${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  getInspectionChecklist: async (id: string) => {
    const response = await api.get<VehicleInspectionChecklist>(`/vehicles/${id}/inspection-checklist`);
    return response.data;
  },

  saveInspectionChecklist: async (id: string, data: VehicleInspectionChecklistPayload) => {
    const response = await api.put<{ message: string; checklist: VehicleInspectionChecklist }>(
      `/vehicles/${id}/inspection-checklist`,
      data
    );
    return response.data;
  },
};

// Fixed expenses API
export const fixedExpensesAPI = {
  getAll: async (params?: { includeInactive?: boolean; categoria?: string }) => {
    const response = await api.get<FixedExpense[]>('/fixed-expenses', { params });
    return response.data;
  },

  create: async (data: Partial<FixedExpense>) => {
    const response = await api.post<{ message: string; expense: FixedExpense }>('/fixed-expenses', data);
    return response.data;
  },

  update: async (id: string, data: Partial<FixedExpense>) => {
    const response = await api.put<{ message: string; expense: FixedExpense }>(`/fixed-expenses/${id}`, data);
    return response.data;
  },

  archive: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/fixed-expenses/${id}`);
    return response.data;
  },
};

// Commission Liquidation API
export interface VentaComision {
  placa: string;
  vehiculo: string;
  precioVenta: number;
  fechaVenta: Date;
  comision: number;
  porcentaje: number;
  descripcion: string;
  liquidada: boolean;
  fechaLiquidacion?: Date;
}

export interface ResumenComisiones {
  vendedor: string;
  totalComisiones: number;
  cantidadVentas: number;
  comisionesPagadas: number;
  comisionesPendientes: number;
  ventas: VentaComision[];
  liquidado: boolean;
  liquidacionId?: string;
}

export interface LiquidacionComision {
  _id: string;
  vendedor: string;
  mes: number;
  año: number;
  totalComisiones: number;
  comisionesPendientes: number;
  comisionesPagadas: number;
  estado: 'pendiente' | 'parcial' | 'liquidado';
  notas: string;
  Liquidaciones: {
    placa: string;
    comision: number;
    liquidada: boolean;
    fechaLiquidacion?: Date;
  }[];
}

export const commissionsAPI = {
  getResumen: async (año?: number, mes?: number) => {
    const params = new URLSearchParams();
    if (año) params.append('año', año.toString());
    if (mes) params.append('mes', mes.toString());
    const response = await api.get<ResumenComisiones[]>('/commissions/resumen', { params });
    return response.data;
  },

  getVendedores: async (año?: number) => {
    const params = new URLSearchParams();
    if (año) params.append('año', año.toString());
    const response = await api.get<string[]>('/commissions/vendedores', { params });
    return response.data;
  },

  getAll: async (params?: { año?: number; mes?: number; vendedor?: string }) => {
    const response = await api.get<LiquidacionComision[]>('/commissions', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<LiquidacionComision>(`/commissions/${id}`);
    return response.data;
  },

  create: async (data: {
    vendedor: string;
    mes: number;
    año: number;
    Liquidaciones: { placa: string; comision: number; fechaVenta?: Date; liquidada: boolean }[];
    notas?: string;
  }) => {
    const response = await api.post<LiquidacionComision>('/commissions', data);
    return response.data;
  },

  liquidar: async (liquidacionId: string, placa: string) => {
    const response = await api.post<LiquidacionComision>('/commissions/liquidar', {
      liquidacionId,
      placa,
    });
    return response.data;
  },
};

export default api;

