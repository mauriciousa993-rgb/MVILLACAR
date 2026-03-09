import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  Save,
  Image,
  X,
  Plus,
  Trash2,
  Users,
  FileText,
} from 'lucide-react';
import Layout from '../components/Layout/Layout';
import api, {
  buildVehiclePhotoUrl,
  vehiclesAPI,
  VisionPropertyCardOcrResponse
} from '../services/api';
import {
  VehicleCardExtractedData,
  VehicleCardReaderResult
} from '../utils/vehicleCardReader';
import {
  autoProcessPropertyCardImage,
  buildPropertyCardPdfFile,
} from '../utils/propertyCardImageEditor';

const DEFAULT_VEHICLE_YEAR = new Date().getFullYear();

type PropertyCardApplyMode = 'overwrite' | 'fill-empty';

const hasText = (value: string | null | undefined) => Boolean(value && value.trim());

const pickCardTextValue = (
  incoming: string | null | undefined,
  current: string,
  mode: PropertyCardApplyMode
) => {
  if (!hasText(incoming)) return current;
  if (mode === 'overwrite') return incoming!.trim();
  return hasText(current) ? current : incoming!.trim();
};

const pickCardNumberValue = (
  incoming: number | null | undefined,
  current: number,
  mode: PropertyCardApplyMode
) => {
  if (typeof incoming !== 'number' || Number.isNaN(incoming) || incoming <= 0) return current;
  if (mode === 'overwrite') return incoming;
  return current > 0 && current !== DEFAULT_VEHICLE_YEAR ? current : incoming;
};

const normalizePlateValue = (value: string) => {
  const normalized = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const match = normalized.match(/[A-Z]{3}\d{3}|[A-Z]{3}\d{2}[A-Z]/);
  return (match?.[0] || normalized).slice(0, 6);
};

const normalizeVinValue = (value: string) =>
  value.toUpperCase().replace(/\s+/g, '');

const normalizeChassisValue = (value: string) => {
  const normalized = value.toUpperCase().replace(/\s+/g, '');

  if (
    !normalized ||
    normalized.length < 5 ||
    normalized.length > 25 ||
    !/\d/.test(normalized) ||
    /(REPUBLICA|COLOMBIA|MINISTERIO|TRANSPORTE|LICENCIA|TRANSITO)/.test(normalized)
  ) {
    return '';
  }

  return normalized;
};

const createEmptyPropertyCardDraft = (): VehicleCardExtractedData => ({
  placa: '',
  marca: '',
  modelo: '',
  año: null,
  color: '',
  vin: '',
  linea: '',
  cilindrada: '',
  claseVehiculo: '',
  servicio: '',
  tipoCarroceria: '',
  numeroMotor: '',
  capacidad: '',
  numeroChasis: '',
  propietario: '',
  identificacionPropietario: '',
  prenda: '',
  tipoVehiculo: null,
});

const normalizePropertyCardDraft = (
  draft: Partial<VehicleCardExtractedData> | null | undefined
): VehicleCardExtractedData => {
  const modelo = (draft?.modelo || draft?.linea || '').trim();
  const linea = (draft?.linea || modelo).trim();
  const vin = normalizeVinValue((draft?.vin || '').trim());
  const numeroChasis = normalizeChassisValue((draft?.numeroChasis || '').trim());
  const año =
    typeof draft?.año === 'number' && draft.año > 0
      ? draft.año
      : null;

  return {
    placa: normalizePlateValue((draft?.placa || '').trim()),
    marca: (draft?.marca || '').trim(),
    modelo,
    año,
    color: (draft?.color || '').trim(),
    vin,
    linea,
    cilindrada: (draft?.cilindrada || '').trim(),
    claseVehiculo: (draft?.claseVehiculo || '').trim(),
    servicio: (draft?.servicio || '').trim(),
    tipoCarroceria: (draft?.tipoCarroceria || '').trim(),
    numeroMotor: (draft?.numeroMotor || '').trim(),
    capacidad: (draft?.capacidad || '').trim(),
    numeroChasis,
    propietario: (draft?.propietario || '').trim(),
    identificacionPropietario: (draft?.identificacionPropietario || '').trim(),
    prenda: (draft?.prenda || '').trim(),
    tipoVehiculo: draft?.tipoVehiculo || null,
  };
};

const mapVisionAiExtractedToDraft = (
  extracted: Record<string, unknown> | undefined
): Partial<VehicleCardExtractedData> => {
  const rawType = typeof extracted?.tipoVehiculo === 'string' ? extracted.tipoVehiculo.toLowerCase() : '';
  const tipoVehiculo =
    rawType === 'suv' || rawType === 'pickup' || rawType === 'sedan' || rawType === 'hatchback'
      ? (rawType as VehicleCardExtractedData['tipoVehiculo'])
      : null;
  const anioCandidate =
    typeof extracted?.anio === 'number'
      ? extracted.anio
      : typeof extracted?.['año'] === 'number'
        ? extracted['año']
        : null;

  return {
    placa: typeof extracted?.placa === 'string' ? extracted.placa : '',
    marca: typeof extracted?.marca === 'string' ? extracted.marca : '',
    modelo: typeof extracted?.modelo === 'string' ? extracted.modelo : '',
    ['año']: anioCandidate,
    color: typeof extracted?.color === 'string' ? extracted.color : '',
    vin: typeof extracted?.vin === 'string' ? extracted.vin : '',
    linea: typeof extracted?.linea === 'string' ? extracted.linea : '',
    cilindrada: typeof extracted?.cilindrada === 'string' ? extracted.cilindrada : '',
    claseVehiculo:
      typeof extracted?.claseVehiculo === 'string' ? extracted.claseVehiculo : '',
    servicio: typeof extracted?.servicio === 'string' ? extracted.servicio : '',
    tipoCarroceria:
      typeof extracted?.tipoCarroceria === 'string' ? extracted.tipoCarroceria : '',
    numeroMotor: typeof extracted?.numeroMotor === 'string' ? extracted.numeroMotor : '',
    capacidad: typeof extracted?.capacidad === 'string' ? extracted.capacidad : '',
    numeroChasis:
      typeof extracted?.numeroChasis === 'string' ? extracted.numeroChasis : '',
    propietario: typeof extracted?.propietario === 'string' ? extracted.propietario : '',
    identificacionPropietario:
      typeof extracted?.identificacionPropietario === 'string'
        ? extracted.identificacionPropietario
        : '',
    prenda: typeof extracted?.prenda === 'string' ? extracted.prenda : '',
    tipoVehiculo,
  };
};

const countDetectedCardFields = (draft: VehicleCardExtractedData) =>
  Object.values(draft).filter((value) => {
    if (typeof value === 'number') {
      return Number.isFinite(value);
    }

    if (typeof value === 'string') {
      return value.trim().length > 0;
    }

    return Boolean(value);
  }).length;

const normalizeVisionAiPropertyCardResult = (
  payload: VisionPropertyCardOcrResponse
): VehicleCardReaderResult => {
  const extracted = normalizePropertyCardDraft(
    mapVisionAiExtractedToDraft(payload?.extracted)
  );
  const detectedFieldsFromPayload =
    typeof payload?.detectedFields === 'number' && Number.isFinite(payload.detectedFields)
      ? Math.max(0, Math.round(payload.detectedFields))
      : 0;
  const detectedFields = Math.max(detectedFieldsFromPayload, countDetectedCardFields(extracted));
  const confidence =
    typeof payload?.confidence === 'number' && Number.isFinite(payload.confidence)
      ? Math.max(0, Math.min(100, Math.round(payload.confidence)))
      : 0;

  return {
    rawText: typeof payload?.rawText === 'string' ? payload.rawText : '',
    confidence,
    detectedFields,
    extracted,
  };
};

type EditablePropertyCardField = Exclude<
  keyof VehicleCardExtractedData,
  'año' | 'tipoVehiculo' | 'linea' | 'numeroChasis'
>;

const VEHICLE_TYPE_OPTIONS = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'hatchback', label: 'Hatchback' },
] as const;

const PROPERTY_CARD_EDITABLE_FIELDS: Array<{
  field: EditablePropertyCardField;
  label: string;
  placeholder: string;
}> = [
  { field: 'placa', label: 'Placa', placeholder: 'Ej: ABC123' },
  { field: 'marca', label: 'Marca', placeholder: 'Ej: Toyota' },
  { field: 'modelo', label: 'Modelo / Linea', placeholder: 'Ej: Corolla' },
  { field: 'color', label: 'Color', placeholder: 'Ej: Blanco' },
  { field: 'vin', label: 'VIN / Numero de Chasis', placeholder: 'Ej: 1HGBH41JXMN109186' },
  { field: 'cilindrada', label: 'Cilindrada', placeholder: 'Ej: 1600' },
  { field: 'claseVehiculo', label: 'Clase de Vehiculo', placeholder: 'Ej: Automovil' },
  { field: 'servicio', label: 'Servicio', placeholder: 'Ej: Particular' },
  { field: 'tipoCarroceria', label: 'Tipo de Carroceria', placeholder: 'Ej: Sedan' },
  { field: 'numeroMotor', label: 'Numero de Motor', placeholder: 'Ej: 1NZ123456' },
  { field: 'capacidad', label: 'Capacidad Kg/Psj', placeholder: 'Ej: 5' },
  { field: 'propietario', label: 'Propietario', placeholder: 'Nombre del propietario' },
  { field: 'identificacionPropietario', label: 'Identificacion', placeholder: 'Cedula o NIT' },
  { field: 'prenda', label: 'Prenda', placeholder: 'Sin prenda o detalle de la limitacion' },
];

const VehicleForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    // Datos básicos
    marca: '',
    modelo: '',
    tipoVehiculo: 'sedan' as 'suv' | 'pickup' | 'sedan' | 'hatchback',
    año: new Date().getFullYear(),

    placa: '',
    vin: '',
    color: '',
    kilometraje: 0,
    
    // Fechas
    fechaIngreso: new Date().toISOString().split('T')[0],
    
    // Precios
    precioCompra: 0,
    precioVenta: 0,
    
    // Gastos
    gastos: {
      pintura: 0,
      mecanica: 0,
      traspaso: 0,
      alistamiento: 0,
      tapiceria: 0,
      transporte: 0,
      varios: 0,
      total: 0
    },
    
    // Inversionistas
    inversionistas: [] as Array<{
      usuario: string;
      nombre: string;
      montoInversion: number;
      gastos: Array<{
        categoria: 'pintura' | 'mecanica' | 'traspaso' | 'alistamiento' | 'tapiceria' | 'transporte' | 'varios';
        monto: number;
        descripcion: string;
        fecha: string;
      }>;
      porcentajeParticipacion: number;
      utilidadCorrespondiente: number;
    }>,
    tieneInversionistas: false,
    
    // Estado
    estado: 'en_proceso',
    estadoTramite: '',
    fechaVenta: '',
    datosTarjetaPropiedad: {
      linea: '',
      cilindrada: '',
      claseVehiculo: '',
      servicio: '',
      tipoCarroceria: '',
      numeroMotor: '',
      capacidad: '',
      numeroChasis: '',
      propietario: '',
      identificacionPropietario: ''
    },
    
    // Documentación
    documentacion: {
      prenda: {
        tiene: false,
        detalles: '',
        verificado: false
      },
      soat: {
        tiene: false,
        fechaVencimiento: '',
        verificado: false
      },
      tecnomecanica: {
        tiene: false,
        fechaVencimiento: '',
        verificado: false
      },
      tarjetaPropiedad: {
        tiene: false,
        verificado: false
      }
    },
    
    // Checklist
    checklist: {
      revisionMecanica: false,
      limpiezaDetailing: false,
      fotografiasCompletas: false,
      documentosCompletos: false,
      precioEstablecido: false
    },
    
    // Observaciones
    observaciones: '',
    
    // Fotos
    fotos: {
      exteriores: [] as string[],
      interiores: [] as string[],
      detalles: [] as string[],
      documentos: [] as string[]
    }
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [usuarios, setUsuarios] = useState<Array<{ id: string; nombre: string; email: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const propertyCardInputRef = useRef<HTMLInputElement | null>(null);
  const [propertyCardOriginalFile, setPropertyCardOriginalFile] = useState<File | null>(null);
  const [propertyCardOriginalPreview, setPropertyCardOriginalPreview] = useState('');
  const [propertyCardFile, setPropertyCardFile] = useState<File | null>(null);
  const [propertyCardDocumentFile, setPropertyCardDocumentFile] = useState<File | null>(null);
  const [propertyCardPreview, setPropertyCardPreview] = useState('');
  const [isApplyingPropertyCardEditor, setIsApplyingPropertyCardEditor] = useState(false);
  const [isReadingPropertyCard, setIsReadingPropertyCard] = useState(false);
  const [propertyCardProgress, setPropertyCardProgress] = useState(0);
  const [propertyCardError, setPropertyCardError] = useState('');
  const [propertyCardResult, setPropertyCardResult] = useState<VehicleCardReaderResult | null>(null);
  const [propertyCardDraft, setPropertyCardDraft] = useState<VehicleCardExtractedData>(
    createEmptyPropertyCardDraft
  );

  const getLastPhoto = (photos?: string[]): string => {
    if (!photos || photos.length === 0) return '';
    return photos[photos.length - 1];
  };

  const detectedCardData = propertyCardResult ? propertyCardDraft : null;
  const isPropertyCardBusy = isReadingPropertyCard || isApplyingPropertyCardEditor;

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string) || '');
      reader.onerror = () => reject(new Error('No se pudo leer el archivo seleccionado.'));
      reader.readAsDataURL(file);
    });
  
  // Formatear número con separador de miles
  const formatNumber = (value: number | string): string => {
    if (value === '' || value === 0 || value === '0') return '';
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
    if (isNaN(numValue)) return '';
    return numValue.toLocaleString('es-CO');
  };

  // Parsear número desde string formateado
  const parseFormattedNumber = (value: string): number => {
    if (!value || value === '') return 0;
    const cleaned = value.replace(/,/g, '').replace(/\./g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  // Cargar usuarios disponibles
  useEffect(() => {
    loadUsuarios();
  }, []);

  // Cargar datos del vehículo si estamos en modo edición
  useEffect(() => {
    if (isEditMode && id) {
      loadVehicleData(id);
    }
  }, [id, isEditMode]);

  const loadUsuarios = async () => {
    try {
      const response = await api.get('/auth/users');
      setUsuarios(response.data.map((user: any) => ({
        id: user._id || user.id,
        nombre: user.nombre,
        email: user.email
      })));
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    }
  };

  const loadVehicleData = async (vehicleId: string) => {
    setIsLoadingData(true);
    setError('');
    try {
      const response = await api.get(`/vehicles/${vehicleId}`);
      const vehicle = response.data;
      const modeloUnificado = vehicle.modelo || vehicle.datosTarjetaPropiedad?.linea || '';
      const vinUnificado = normalizeVinValue(
        vehicle.vin || vehicle.datosTarjetaPropiedad?.numeroChasis || ''
      );
      
      // Cargar los datos en el formulario
      setFormData({
        marca: vehicle.marca || '',
        modelo: modeloUnificado,
        tipoVehiculo: vehicle.tipoVehiculo || 'sedan',
        año: vehicle.año || new Date().getFullYear(),

        placa: normalizePlateValue(vehicle.placa || ''),
        vin: vinUnificado,
        color: vehicle.color || '',
        kilometraje: vehicle.kilometraje || 0,
        fechaIngreso: vehicle.fechaIngreso 
          ? new Date(vehicle.fechaIngreso).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        precioCompra: vehicle.precioCompra || 0,
        precioVenta: vehicle.precioVenta || 0,
        gastos: {
          pintura: vehicle.gastos?.pintura || 0,
          mecanica: vehicle.gastos?.mecanica || 0,
          traspaso: vehicle.gastos?.traspaso || 0,
          alistamiento: vehicle.gastos?.alistamiento || 0,
          tapiceria: vehicle.gastos?.tapiceria || 0,
          transporte: vehicle.gastos?.transporte || 0,
          varios: vehicle.gastos?.varios || 0,
          total: vehicle.gastos?.total || 0
        },
        inversionistas: vehicle.inversionistas || [],
        tieneInversionistas: vehicle.tieneInversionistas || false,
        estado: vehicle.estado || 'en_proceso',
        estadoTramite: vehicle.estadoTramite || '',
        fechaVenta: vehicle.fechaVenta 
          ? new Date(vehicle.fechaVenta).toISOString().split('T')[0]
          : '',
        datosTarjetaPropiedad: {
          linea: vehicle.datosTarjetaPropiedad?.linea || modeloUnificado,
          cilindrada: vehicle.datosTarjetaPropiedad?.cilindrada || '',
          claseVehiculo: vehicle.datosTarjetaPropiedad?.claseVehiculo || '',
          servicio: vehicle.datosTarjetaPropiedad?.servicio || '',
          tipoCarroceria: vehicle.datosTarjetaPropiedad?.tipoCarroceria || '',
          numeroMotor: vehicle.datosTarjetaPropiedad?.numeroMotor || '',
          capacidad: vehicle.datosTarjetaPropiedad?.capacidad || '',
          numeroChasis: vehicle.datosTarjetaPropiedad?.numeroChasis || '',
          propietario: vehicle.datosTarjetaPropiedad?.propietario || '',
          identificacionPropietario: vehicle.datosTarjetaPropiedad?.identificacionPropietario || ''
        },
        documentacion: {
          prenda: {
            tiene: vehicle.documentacion?.prenda?.tiene || false,
            detalles: vehicle.documentacion?.prenda?.detalles || '',
            verificado: vehicle.documentacion?.prenda?.verificado || false
          },
          soat: {
            tiene: vehicle.documentacion?.soat?.tiene || false,
            fechaVencimiento: vehicle.documentacion?.soat?.fechaVencimiento 
              ? new Date(vehicle.documentacion.soat.fechaVencimiento).toISOString().split('T')[0]
              : '',
            verificado: vehicle.documentacion?.soat?.verificado || false
          },
          tecnomecanica: {
            tiene: vehicle.documentacion?.tecnomecanica?.tiene || false,
            fechaVencimiento: vehicle.documentacion?.tecnomecanica?.fechaVencimiento
              ? new Date(vehicle.documentacion.tecnomecanica.fechaVencimiento).toISOString().split('T')[0]
              : '',
            verificado: vehicle.documentacion?.tecnomecanica?.verificado || false
          },
          tarjetaPropiedad: {
            tiene: vehicle.documentacion?.tarjetaPropiedad?.tiene || false,
            verificado: vehicle.documentacion?.tarjetaPropiedad?.verificado || false
          }
        },
        checklist: {
          revisionMecanica: vehicle.checklist?.revisionMecanica || false,
          limpiezaDetailing: vehicle.checklist?.limpiezaDetailing || false,
          fotografiasCompletas: vehicle.checklist?.fotografiasCompletas || false,
          documentosCompletos: vehicle.checklist?.documentosCompletos || false,
          precioEstablecido: vehicle.checklist?.precioEstablecido || false
        },
        observaciones: vehicle.observaciones || '',
        fotos: {
          exteriores: vehicle.fotos?.exteriores || [],
          interiores: vehicle.fotos?.interiores || [],
          detalles: vehicle.fotos?.detalles || [],
          documentos: vehicle.fotos?.documentos || []
        }
      });
      const mainPhoto =
        getLastPhoto(vehicle.fotos?.exteriores) ||
        getLastPhoto(vehicle.fotos?.interiores) ||
        getLastPhoto(vehicle.fotos?.detalles) ||
        '';
      setSelectedFile(null);
      setPhotoPreview(mainPhoto ? buildVehiclePhotoUrl(mainPhoto) : '');
      setPropertyCardFile(null);
      setPropertyCardPreview('');
      setPropertyCardResult(null);
      setPropertyCardError('');
      setPropertyCardProgress(0);
    } catch (err: any) {
      console.error('Error al cargar vehículo:', err);
      setError(err.response?.data?.message || 'Error al cargar los datos del vehículo');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      
      // Manejar checkboxes del checklist
      if (name.startsWith('checklist.')) {
        const field = name.split('.')[1];
        setFormData(prev => ({
          ...prev,
          checklist: { ...prev.checklist, [field]: checked }
        }));
      }
      // Manejar checkboxes de documentación
      else if (name.startsWith('doc.')) {
        const parts = name.split('.');
        const doc = parts[1];
        const field = parts[2];
        setFormData(prev => ({
          ...prev,
          documentacion: {
            ...prev.documentacion,
            [doc]: { ...prev.documentacion[doc as keyof typeof prev.documentacion], [field]: checked }
          }
        }));
      }
    } else if (type === 'date') {
      // Manejar fechas de documentación
      if (name.startsWith('doc.')) {
        const parts = name.split('.');
        const doc = parts[1];
        setFormData(prev => ({
          ...prev,
          documentacion: {
            ...prev.documentacion,
            [doc]: { ...prev.documentacion[doc as keyof typeof prev.documentacion], fechaVencimiento: value, tiene: true }
          }
        }));
      } else {
        // Manejar otros campos de fecha (como fechaVenta)
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else if (name === 'doc.prenda.detalles') {
      setFormData(prev => ({
        ...prev,
        documentacion: {
          ...prev.documentacion,
          prenda: { ...prev.documentacion.prenda, detalles: value }
        }
      }));
    } else if (name === 'tipoVehiculo') {
      const normalizedType =
        value === 'suv' || value === 'pickup' || value === 'hatchback' || value === 'sedan'
          ? value
          : 'sedan';
      setFormData(prev => ({
        ...prev,
        tipoVehiculo: normalizedType
      }));
    } else {
      const normalizedValue =
        name === 'placa'
          ? normalizePlateValue(value)
          : name === 'vin'
            ? normalizeVinValue(value)
            : type === 'number'
              ? Number(value) || 0
              : value;

      setFormData(prev => {
        const nextState = {
          ...prev,
          [name]: normalizedValue
        };

        if (name === 'modelo') {
          nextState.datosTarjetaPropiedad = {
            ...prev.datosTarjetaPropiedad,
            linea: String(normalizedValue)
          };
        }

        return nextState;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      readFileAsDataUrl(file)
        .then((preview) => setPhotoPreview(preview))
        .catch((err: Error) => setError(err.message));
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPhotoPreview('');
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const applyPropertyCardDataWithMode = (
    cardDraft: VehicleCardExtractedData,
    mode: PropertyCardApplyMode
  ) => {
    const extracted = normalizePropertyCardDraft(cardDraft);
    setPropertyCardDraft(extracted);

    setFormData((prev) => {
      const nextModelo = pickCardTextValue(
        extracted.modelo || extracted.linea,
        prev.modelo,
        mode
      );
      const nextVin = pickCardTextValue(extracted.vin, prev.vin, mode);
      const nextNumeroChasis = pickCardTextValue(
        extracted.numeroChasis,
        prev.datosTarjetaPropiedad.numeroChasis,
        mode
      );

      return {
        ...prev,
        marca: pickCardTextValue(extracted.marca, prev.marca, mode),
        modelo: nextModelo,
        tipoVehiculo:
          mode === 'overwrite'
            ? extracted.tipoVehiculo || prev.tipoVehiculo
            : prev.tipoVehiculo || extracted.tipoVehiculo || prev.tipoVehiculo,
        año: pickCardNumberValue(extracted.año, prev.año, mode),
        placa: pickCardTextValue(extracted.placa, prev.placa, mode),
        vin: nextVin,
        color: pickCardTextValue(extracted.color, prev.color, mode),
        datosTarjetaPropiedad: {
          ...prev.datosTarjetaPropiedad,
          linea: pickCardTextValue(
            extracted.linea || nextModelo,
            prev.datosTarjetaPropiedad.linea,
            mode
          ),
          cilindrada: pickCardTextValue(
            extracted.cilindrada,
            prev.datosTarjetaPropiedad.cilindrada,
            mode
          ),
          claseVehiculo: pickCardTextValue(
            extracted.claseVehiculo,
            prev.datosTarjetaPropiedad.claseVehiculo,
            mode
          ),
          servicio: pickCardTextValue(
            extracted.servicio,
            prev.datosTarjetaPropiedad.servicio,
            mode
          ),
          tipoCarroceria: pickCardTextValue(
            extracted.tipoCarroceria,
            prev.datosTarjetaPropiedad.tipoCarroceria,
            mode
          ),
          numeroMotor: pickCardTextValue(
            extracted.numeroMotor,
            prev.datosTarjetaPropiedad.numeroMotor,
            mode
          ),
          capacidad: pickCardTextValue(
            extracted.capacidad,
            prev.datosTarjetaPropiedad.capacidad,
            mode
          ),
          numeroChasis: nextNumeroChasis,
          propietario: pickCardTextValue(
            extracted.propietario,
            prev.datosTarjetaPropiedad.propietario,
            mode
          ),
          identificacionPropietario: pickCardTextValue(
            extracted.identificacionPropietario,
            prev.datosTarjetaPropiedad.identificacionPropietario,
            mode
          ),
        },
        documentacion: {
          ...prev.documentacion,
          prenda: {
            ...prev.documentacion.prenda,
            tiene:
              mode === 'overwrite'
                ? Boolean(extracted.prenda) || prev.documentacion.prenda.tiene
                : prev.documentacion.prenda.tiene || Boolean(extracted.prenda),
            detalles: pickCardTextValue(
              extracted.prenda,
              prev.documentacion.prenda.detalles || '',
              mode
            ),
          },
          tarjetaPropiedad: {
            ...prev.documentacion.tarjetaPropiedad,
            tiene: true,
          },
        },
      };
    });
  };

  const resetPropertyCardOcrState = () => {
    setPropertyCardError('');
    setPropertyCardResult(null);
    setPropertyCardDraft(createEmptyPropertyCardDraft());
    setPropertyCardProgress(0);
  };

  const readPropertyCardWithVisionAi = async (file: File) => {
    const response = await vehiclesAPI.readPropertyCardWithVisionAI(file);
    return normalizeVisionAiPropertyCardResult(response);
  };

  const runPropertyCardVisionAi = async (primaryFile: File, fallbackFile?: File) => {
    setIsReadingPropertyCard(true);
    setPropertyCardError('');
    setPropertyCardProgress(8);

    try {
      const primaryResult = await readPropertyCardWithVisionAi(primaryFile);
      let bestResult = primaryResult;

      setPropertyCardProgress(68);

      const shouldTryFallback =
        Boolean(fallbackFile) &&
        fallbackFile !== primaryFile &&
        primaryResult.detectedFields < 7;

      if (shouldTryFallback && fallbackFile) {
        const fallbackResult = await readPropertyCardWithVisionAi(fallbackFile);
        setPropertyCardProgress(90);

        if (
          fallbackResult.detectedFields > primaryResult.detectedFields ||
          (
            fallbackResult.detectedFields === primaryResult.detectedFields &&
            fallbackResult.confidence > primaryResult.confidence
          )
        ) {
          bestResult = fallbackResult;
        }
      }

      setPropertyCardResult(bestResult);
      setPropertyCardDraft(bestResult.extracted);
      applyPropertyCardDataWithMode(bestResult.extracted, 'fill-empty');
      setPropertyCardProgress(100);
    } catch (err: any) {
      const aiErrorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'No se pudo leer la tarjeta con IA.';
      setPropertyCardResult(null);
      setPropertyCardDraft(createEmptyPropertyCardDraft());
      setPropertyCardProgress(0);
      setPropertyCardError(aiErrorMessage);
    } finally {
      setIsReadingPropertyCard(false);
    }
  };

  const initializePropertyCardSelection = async (file: File) => {
    const preview = await readFileAsDataUrl(file);

    setPropertyCardOriginalFile(file);
    setPropertyCardOriginalPreview(preview);
    setPropertyCardFile(file);
    setPropertyCardDocumentFile(null);
    setPropertyCardPreview(preview);
    resetPropertyCardOcrState();
    await runAutomaticPropertyCardOptimization(file, preview);
  };

  const runAutomaticPropertyCardOptimization = async (
    sourceFileOverride?: File,
    sourcePreviewOverride?: string
  ) => {
    const sourceFile = sourceFileOverride || propertyCardOriginalFile;
    const sourcePreview = sourcePreviewOverride || propertyCardOriginalPreview;

    if (!sourceFile) return;

    setIsApplyingPropertyCardEditor(true);
    setPropertyCardError('');

    try {
      const automaticResult = await autoProcessPropertyCardImage(sourceFile);
      const nextFile = automaticResult.file;
      const nextDocumentFile = automaticResult.documentFile;
      const nextPreview = await readFileAsDataUrl(nextFile);

      setPropertyCardFile(nextFile);
      setPropertyCardDocumentFile(nextDocumentFile);
      setPropertyCardPreview(nextPreview);
      setPropertyCardResult(null);
      setPropertyCardDraft(createEmptyPropertyCardDraft());
      setPropertyCardProgress(0);
      await runPropertyCardVisionAi(sourceFile, nextFile);
    } catch (err: any) {
      setPropertyCardError(
        err?.message || 'No se pudo optimizar la foto de la tarjeta. Intenta con otra imagen.'
      );
      if (sourcePreview) {
        setPropertyCardPreview(sourcePreview);
      }
      await runPropertyCardVisionAi(sourceFile);
    } finally {
      setIsApplyingPropertyCardEditor(false);
    }
  };

  const ensurePropertyCardPdfFile = async () => {
    if (propertyCardDocumentFile) {
      return propertyCardDocumentFile;
    }

    if (!propertyCardFile) {
      return null;
    }

    const generatedDocumentFile = await buildPropertyCardPdfFile(propertyCardFile);
    setPropertyCardDocumentFile(generatedDocumentFile);
    return generatedDocumentFile;
  };

  const handlePropertyCardChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setFormData((prev) => ({
        ...prev,
        documentacion: {
          ...prev.documentacion,
          tarjetaPropiedad: {
            ...prev.documentacion.tarjetaPropiedad,
            tiene: true,
          },
        },
      }));
      await initializePropertyCardSelection(file);
    } catch (err: any) {
      setPropertyCardError(
        err?.message || 'No se pudo abrir la imagen de la tarjeta para procesarla automaticamente.'
      );
    }
  };

  const removePropertyCardFile = () => {
    setPropertyCardOriginalFile(null);
    setPropertyCardOriginalPreview('');
    setPropertyCardFile(null);
    setPropertyCardDocumentFile(null);
    setPropertyCardPreview('');
    setIsApplyingPropertyCardEditor(false);
    setIsReadingPropertyCard(false);
    setPropertyCardResult(null);
    setPropertyCardDraft(createEmptyPropertyCardDraft());
    setPropertyCardError('');
    setPropertyCardProgress(0);

    if (propertyCardInputRef.current) {
      propertyCardInputRef.current.value = '';
    }
  };

  const openPropertyCardPicker = () => {
    propertyCardInputRef.current?.click();
  };

  const updateCardData = (
    field:
      | 'linea'
      | 'cilindrada'
      | 'claseVehiculo'
      | 'servicio'
      | 'tipoCarroceria'
      | 'numeroMotor'
      | 'capacidad'
      | 'numeroChasis'
      | 'propietario'
      | 'identificacionPropietario',
    value: string
  ) => {
    const normalizedValue = field === 'numeroChasis' ? normalizeChassisValue(value) : value;

    setFormData((prev) => {
      const nextState = {
        ...prev,
        datosTarjetaPropiedad: {
          ...prev.datosTarjetaPropiedad,
          [field]: normalizedValue,
        },
      };

      if (field === 'linea') {
        nextState.modelo = normalizedValue;
      }

      return nextState;
    });
  };

  const updatePropertyCardDraft = (field: EditablePropertyCardField, value: string) => {
    const normalizedValue =
      field === 'placa'
        ? normalizePlateValue(value)
        : field === 'vin'
          ? normalizeVinValue(value)
          : value;

    setPropertyCardDraft((prev) => {
      const nextDraft = {
        ...prev,
        [field]: normalizedValue,
      };

      if (field === 'modelo') {
        nextDraft.linea = normalizedValue;
      }

      return nextDraft;
    });
  };

  const updatePropertyCardDraftYear = (value: string) => {
    setPropertyCardDraft((prev) => ({
      ...prev,
      año: value ? Number(value) || null : null,
    }));
  };

  const updatePropertyCardDraftVehicleType = (value: string) => {
    setPropertyCardDraft((prev) => ({
      ...prev,
      tipoVehiculo:
        value === 'sedan' || value === 'suv' || value === 'pickup' || value === 'hatchback'
          ? value
          : null,
    }));
  };

  // Funciones para manejar inversionistas
  const agregarInversionista = () => {
    setFormData(prev => ({
      ...prev,
      inversionistas: [
        ...prev.inversionistas,
        {
          usuario: '',
          nombre: '',
          montoInversion: 0,
          gastos: [],
          porcentajeParticipacion: 0,
          utilidadCorrespondiente: 0
        }
      ],
      tieneInversionistas: true
    }));
  };

  const eliminarInversionista = (index: number) => {
    setFormData(prev => ({
      ...prev,
      inversionistas: prev.inversionistas.filter((_, i) => i !== index),
      tieneInversionistas: prev.inversionistas.length > 1
    }));
  };

  const actualizarInversionista = (index: number, campo: 'usuario' | 'nombre' | 'montoInversion', valor: string | number) => {
    // Si se selecciona un usuario, autocompletar el nombre
    if (campo === 'usuario') {
      const usuarioSeleccionado = usuarios.find(u => u.id === valor);
      setFormData(prev => {
        const nuevosInversionistas = [...prev.inversionistas];
        nuevosInversionistas[index] = {
          ...nuevosInversionistas[index],
          usuario: valor as string,
          nombre: usuarioSeleccionado?.nombre || ''
        };
        return {
          ...prev,
          inversionistas: nuevosInversionistas
        };
      });
      return;
    }
    
    setFormData(prev => {
      const nuevosInversionistas = [...prev.inversionistas];
      nuevosInversionistas[index] = {
        ...nuevosInversionistas[index],
        [campo]: valor
      };
      
      return {
        ...prev,
        inversionistas: nuevosInversionistas
      };
    });
  };

  // Funciones para manejar gastos de inversionistas
  const agregarGastoInversionista = (inversionistaIndex: number) => {
    setFormData(prev => {
      const nuevosInversionistas = [...prev.inversionistas];
      if (!nuevosInversionistas[inversionistaIndex].gastos) {
        nuevosInversionistas[inversionistaIndex].gastos = [];
      }
      nuevosInversionistas[inversionistaIndex].gastos.push({
        categoria: 'varios',
        monto: 0,
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0]
      });
      return {
        ...prev,
        inversionistas: nuevosInversionistas
      };
    });
  };

  const eliminarGastoInversionista = (inversionistaIndex: number, gastoIndex: number) => {
    setFormData(prev => {
      const nuevosInversionistas = [...prev.inversionistas];
      nuevosInversionistas[inversionistaIndex].gastos.splice(gastoIndex, 1);
      return {
        ...prev,
        inversionistas: nuevosInversionistas
      };
    });
  };

  const actualizarGastoInversionista = (
    inversionistaIndex: number, 
    gastoIndex: number, 
    campo: 'categoria' | 'monto' | 'descripcion', 
    valor: string | number
  ) => {
    setFormData(prev => {
      const nuevosInversionistas = [...prev.inversionistas];
      nuevosInversionistas[inversionistaIndex].gastos[gastoIndex] = {
        ...nuevosInversionistas[inversionistaIndex].gastos[gastoIndex],
        [campo]: valor
      };
      return {
        ...prev,
        inversionistas: nuevosInversionistas
      };
    });
  };

  // Calcular totales de inversionistas
  const calcularTotalesInversionistas = () => {
    const totalInversion = formData.inversionistas.reduce((sum, inv) => sum + inv.montoInversion, 0);
    
    // Calcular total de gastos de todos los inversionistas
    const gastosInversionistas = formData.inversionistas.reduce((sum, inv) => {
      const totalGastosInv = inv.gastos?.reduce((s, g) => s + (g.monto || 0), 0) || 0;
      return sum + totalGastosInv;
    }, 0);
    
    // Gastos generales (sin incluir gastos de inversionistas)
    const gastosGenerales = formData.gastos.pintura + formData.gastos.mecanica + formData.gastos.traspaso + 
                           formData.gastos.alistamiento + formData.gastos.tapiceria + formData.gastos.transporte + 
                           formData.gastos.varios;
    
    // Utilidad bruta (sin considerar gastos de inversionistas)
    const utilidadBruta = formData.precioVenta - formData.precioCompra - gastosGenerales;
    
    // Utilidad neta a distribuir (después de restar gastos de inversionistas)
    const utilidadNeta = utilidadBruta - gastosInversionistas;
    
    return formData.inversionistas.map(inv => {
      const porcentaje = totalInversion > 0 ? (inv.montoInversion / totalInversion) * 100 : 0;
      
      // Calcular total de gastos del inversionista
      const totalGastosInv = inv.gastos?.reduce((s, g) => s + (g.monto || 0), 0) || 0;
      
      // Utilidad = (porcentaje × utilidad neta) + gastos del inversionista
      const utilidadPorParticipacion = (porcentaje / 100) * utilidadNeta;
      const utilidad = utilidadPorParticipacion + totalGastosInv;
      
      return {
        ...inv,
        porcentajeParticipacion: porcentaje,
        utilidadCorrespondiente: utilidad
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Iniciando submit...', { isEditMode, id });
    setError('');
    setSuccess(false);
    setIsLoading(true);
    let vehicleUpdated = false;

    try {
      let vehicleId = id;
      const modeloUnificado = formData.modelo.trim() || formData.datosTarjetaPropiedad.linea.trim();
      const vinUnificado = normalizeVinValue(
        formData.vin || formData.datosTarjetaPropiedad.numeroChasis || ''
      );
      const payload = {
        ...formData,
        marca: formData.marca.trim(),
        modelo: modeloUnificado,
        placa: normalizePlateValue(formData.placa),
        vin: vinUnificado,
        color: formData.color.trim(),
        tipoVehiculo:
          formData.tipoVehiculo === 'suv' ||
          formData.tipoVehiculo === 'pickup' ||
          formData.tipoVehiculo === 'hatchback'
            ? formData.tipoVehiculo
            : 'sedan',
        estadoTramite:
          formData.estado === 'vendido' && formData.estadoTramite
            ? formData.estadoTramite
            : undefined,
        datosTarjetaPropiedad: {
          ...formData.datosTarjetaPropiedad,
          linea: formData.datosTarjetaPropiedad.linea.trim() || modeloUnificado,
          numeroChasis: normalizeChassisValue(formData.datosTarjetaPropiedad.numeroChasis || ''),
          cilindrada: formData.datosTarjetaPropiedad.cilindrada.trim(),
          claseVehiculo: formData.datosTarjetaPropiedad.claseVehiculo.trim(),
          servicio: formData.datosTarjetaPropiedad.servicio.trim(),
          tipoCarroceria: formData.datosTarjetaPropiedad.tipoCarroceria.trim(),
          numeroMotor: formData.datosTarjetaPropiedad.numeroMotor.trim(),
          capacidad: formData.datosTarjetaPropiedad.capacidad.trim(),
          propietario: formData.datosTarjetaPropiedad.propietario.trim(),
          identificacionPropietario: formData.datosTarjetaPropiedad.identificacionPropietario.trim(),
        },
        documentacion: {
          ...formData.documentacion,
          prenda: {
            ...formData.documentacion.prenda,
            detalles: formData.documentacion.prenda.detalles.trim(),
          },
        },
      };

      console.log('📤 Enviando datos:', payload);

      if (isEditMode && id) {
        // Modo edición: usar PUT
        console.log('📝 Modo edición - PUT /vehicles/' + id);
        const response = await api.put(`/vehicles/${id}`, payload);
        console.log('✅ Respuesta edición:', response.data);
        vehicleUpdated = true;
      } else {
        // Modo creación: usar POST
        console.log('📝 Modo creación - POST /vehicles');
        const response = await api.post('/vehicles', payload);
        console.log('✅ Respuesta creación:', response.data);
        vehicleId = response.data.vehicle._id;
        vehicleUpdated = true;
      }

      // Si hay una foto seleccionada, subirla
      if (vehicleId) {
        if (selectedFile) {
        console.log('📸 Subiendo foto...');
        try {
          await vehiclesAPI.uploadPhotos(vehicleId, 'exteriores', [selectedFile]);
          console.log('✅ Foto subida exitosamente');
        } catch (photoErr: any) {
          console.error('❌ Error al subir foto:', photoErr);
          // Si la foto falla pero el vehículo se actualizó, mostrar advertencia
          if (vehicleUpdated) {
            setError(`Vehículo ${isEditMode ? 'actualizado' : 'creado'} correctamente, pero hubo un error al subir la foto: ${photoErr.message || 'Error desconocido'}`);
            setSuccess(true);
            setTimeout(() => {
              navigate('/dashboard');
            }, 3000);
            return;
          }
          throw photoErr;
        }
        }

        if (propertyCardDocumentFile || propertyCardFile) {
          try {
            const propertyCardUploadFile = await ensurePropertyCardPdfFile();

            if (!propertyCardUploadFile) {
              throw new Error('No se pudo generar el PDF de la tarjeta de propiedad.');
            }

            await vehiclesAPI.uploadPhotos(
              vehicleId,
              'documentos',
              [propertyCardUploadFile]
            );
          } catch (documentErr: any) {
            console.error('Error al subir tarjeta de propiedad:', documentErr);
            if (vehicleUpdated) {
              setError(
                `Vehiculo ${isEditMode ? 'actualizado' : 'creado'} correctamente, pero hubo un error al subir la tarjeta de propiedad: ${documentErr.message || 'Error desconocido'}`
              );
              setSuccess(true);
              setTimeout(() => {
                navigate('/dashboard');
              }, 3000);
              return;
            }
            throw documentErr;
          }
        }
      }

      console.log('🎉 Éxito! Redirigiendo...');
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err: any) {
      console.error('❌ Error completo:', err);
      console.error('❌ Error response:', err.response);
      console.error('❌ Error request:', err.request);
      console.error('❌ Error message:', err.message);
      
      // Manejar errores específicos del backend
      if (err.response?.data) {
        const { message, errors, field } = err.response.data;
        console.log('📄 Error data del backend:', { message, errors, field });
        
        // Si hay errores de validación específicos
        if (errors && Array.isArray(errors)) {
          setError(`Error de validación:\n${errors.join('\n')}`);
        } 
        // Si es un error de campo duplicado (placa o VIN)
        else if (field) {
          setError(`Error: ${message}. Por favor verifica el campo ${field}.`);
        }
        // Mensaje genérico del backend
        else if (message) {
          setError(message);
        } else {
          setError(`Error al ${isEditMode ? 'actualizar' : 'crear'} vehículo. Por favor intenta de nuevo.`);
        }
      } else if (err.request) {
        // Error de conexión
        setError('Error de conexión con el servidor. Por favor verifica tu conexión a internet.');
      } else {
        setError(`Error al ${isEditMode ? 'actualizar' : 'crear'} vehículo: ${err.message}`);
      }
    } finally {
      console.log('🏁 Finalizando submit, isLoading:', false);
      setIsLoading(false);
    }
  };


  // Mostrar loading mientras carga los datos del vehículo
  if (isLoadingData) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando datos del vehículo...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/vehicles')}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? 'Editar Vehículo' : 'Nuevo Vehículo'}
            </h1>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            ¡Vehículo {isEditMode ? 'actualizado' : 'creado'} exitosamente! Redirigiendo...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="mb-1 text-xl font-semibold text-gray-900">
                  <FileText className="mr-2 inline h-5 w-5" />
                  Tarjeta de Propiedad
                </h2>
                <p className="text-sm text-gray-600">
                  Sube una foto clara de la tarjeta. La app la recorta, la mejora y la adjunta al guardar el vehiculo.
                </p>
              </div>
              <button
                type="button"
                onClick={openPropertyCardPicker}
                className="btn-secondary whitespace-nowrap"
                disabled={isPropertyCardBusy}
              >
                {propertyCardFile ? 'Cambiar tarjeta' : 'Subir tarjeta'}
              </button>
            </div>

            <input
              ref={propertyCardInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePropertyCardChange}
            />

            {!propertyCardPreview ? (
              <button
                type="button"
                onClick={openPropertyCardPicker}
                className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center transition-colors hover:bg-gray-100"
                disabled={isPropertyCardBusy}
              >
                <Upload className="mb-3 h-10 w-10 text-gray-400" />
                <span className="text-sm font-semibold text-gray-700">Seleccionar imagen de la tarjeta</span>
                <span className="mt-1 text-xs text-gray-500">JPG o PNG. Entre mejor iluminada y centrada, mejor la lectura.</span>
              </button>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
                <div className="space-y-3">
                  <img
                    src={propertyCardPreview}
                    alt="Tarjeta de propiedad"
                    className="h-56 w-full rounded-lg border border-gray-200 object-cover"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={openPropertyCardPicker}
                      className="btn-secondary"
                      disabled={isPropertyCardBusy}
                    >
                      Cambiar imagen
                    </button>
                    <button
                      type="button"
                      onClick={removePropertyCardFile}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-red-700 hover:bg-red-50"
                      disabled={isPropertyCardBusy}
                    >
                      <X className="h-4 w-4" />
                      Quitar
                    </button>
                  </div>
                  {propertyCardFile && (
                    <div className="space-y-1 text-xs text-gray-500">
                      <p>
                        Imagen procesada: <strong>{propertyCardFile.name}</strong>
                      </p>
                      {propertyCardDocumentFile && (
                        <p>
                          Documento PDF a adjuntar: <strong>{propertyCardDocumentFile.name}</strong>
                        </p>
                      )}
                      <p>
                        Formato que se subira: <strong>{propertyCardDocumentFile ? 'PDF' : propertyCardFile.type || 'imagen'}</strong>
                      </p>
                      {propertyCardOriginalFile && propertyCardOriginalFile.name !== propertyCardFile.name && (
                        <p>
                          Original: <strong>{propertyCardOriginalFile.name}</strong>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
                    La foto se recorta y corrige automaticamente para adjuntarla al vehiculo. La app intenta aislar
                    solo el cuadro de la tarjeta, conservar detalle de la imagen, mejorar resolucion, ajustar contraste,
                    nitidez y luego leer los campos con IA para completar el formulario.
                  </div>

                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-blue-900">Estado de procesamiento</p>
                        <p className="text-sm text-blue-700">
                          {isApplyingPropertyCardEditor
                            ? 'Recortando la tarjeta y mejorando resolucion, contraste y nitidez...'
                            : isReadingPropertyCard
                              ? `Leyendo datos con IA... ${Math.max(1, propertyCardProgress)}%`
                              : propertyCardResult
                                ? `IA detecto ${propertyCardResult.detectedFields} campos (confianza ${propertyCardResult.confidence}%). Se completaron automaticamente los campos vacios.`
                            : propertyCardFile
                              ? 'Tarjeta lista para adjuntar al guardar el vehiculo.'
                              : 'El procesamiento comenzara al seleccionar una imagen.'}
                        </p>
                      </div>
                      {(isApplyingPropertyCardEditor || isReadingPropertyCard) && (
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
                      )}
                    </div>
                    {isReadingPropertyCard && (
                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-blue-100">
                        <div
                          className="h-2 rounded-full bg-blue-500 transition-all"
                          style={{ width: `${Math.max(6, Math.min(100, propertyCardProgress))}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {propertyCardError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      {propertyCardError}
                    </div>
                  )}

                  {propertyCardResult && (
                    <div className="space-y-4">
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                        Revisa y corrige la lectura antes de aplicarla. Los campos compartidos quedan unificados con la seccion de
                        identificacion del vehiculo.
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {PROPERTY_CARD_EDITABLE_FIELDS.map(({ field, label, placeholder }) => (
                          <div key={field}>
                            <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
                            <input
                              type="text"
                              value={detectedCardData?.[field] || ''}
                              onChange={(e) => updatePropertyCardDraft(field, e.target.value)}
                              className="input-field"
                              placeholder={placeholder}
                            />
                          </div>
                        ))}
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">Año</label>
                          <input
                            type="number"
                            value={detectedCardData?.año ?? ''}
                            onChange={(e) => updatePropertyCardDraftYear(e.target.value)}
                            className="input-field"
                            min="1900"
                            max={new Date().getFullYear() + 1}
                            placeholder="Ej: 2020"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">Tipo de Vehiculo Sugerido</label>
                          <select
                            value={detectedCardData?.tipoVehiculo || ''}
                            onChange={(e) => updatePropertyCardDraftVehicleType(e.target.value)}
                            className="input-field"
                          >
                            <option value="">Sin detectar</option>
                            {VEHICLE_TYPE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            applyPropertyCardDataWithMode(propertyCardDraft, 'fill-empty')
                          }
                          className="btn-primary"
                          disabled={isReadingPropertyCard || propertyCardResult.detectedFields === 0}
                        >
                          Completar faltantes
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            applyPropertyCardDataWithMode(propertyCardDraft, 'overwrite')
                          }
                          className="btn-secondary"
                          disabled={isReadingPropertyCard || propertyCardResult.detectedFields === 0}
                        >
                          Sobrescribir con lectura
                        </button>
                        <p className="self-center text-xs text-gray-500">
                          La tarjeta se adjuntara al guardar el vehiculo. Puedes completar solo campos vacios o volver a sobrescribir la lectura.
                        </p>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Texto detectado por IA</label>
                        <textarea
                          value={propertyCardResult.rawText}
                          readOnly
                          rows={6}
                          className="input-field text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Datos legales de la tarjeta</h2>
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              Marca, modelo o linea, placa, año, color y VIN o chasis se editan una sola vez en la seccion de identificacion del vehiculo.
              Aqui solo quedan los datos exclusivos de la tarjeta que luego usa la venta y el contrato.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cilindrada</label>
                <input
                  type="text"
                  value={formData.datosTarjetaPropiedad.cilindrada}
                  onChange={(e) => updateCardData('cilindrada', e.target.value)}
                  className="input-field"
                  placeholder="Ej: 1600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Clase de Vehiculo</label>
                <input
                  type="text"
                  value={formData.datosTarjetaPropiedad.claseVehiculo}
                  onChange={(e) => updateCardData('claseVehiculo', e.target.value)}
                  className="input-field"
                  placeholder="Ej: Automovil"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Servicio</label>
                <input
                  type="text"
                  value={formData.datosTarjetaPropiedad.servicio}
                  onChange={(e) => updateCardData('servicio', e.target.value)}
                  className="input-field"
                  placeholder="Ej: Particular"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Carroceria</label>
                <input
                  type="text"
                  value={formData.datosTarjetaPropiedad.tipoCarroceria}
                  onChange={(e) => updateCardData('tipoCarroceria', e.target.value)}
                  className="input-field"
                  placeholder="Ej: Sedan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad Kg/Psj</label>
                <input
                  type="text"
                  value={formData.datosTarjetaPropiedad.capacidad}
                  onChange={(e) => updateCardData('capacidad', e.target.value)}
                  className="input-field"
                  placeholder="Ej: 5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numero de Motor</label>
                <input
                  type="text"
                  value={formData.datosTarjetaPropiedad.numeroMotor}
                  onChange={(e) => updateCardData('numeroMotor', e.target.value)}
                  className="input-field"
                  placeholder="Ej: 1NZ123456"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Propietario</label>
                <input
                  type="text"
                  value={formData.datosTarjetaPropiedad.propietario}
                  onChange={(e) => updateCardData('propietario', e.target.value)}
                  className="input-field"
                  placeholder="Nombre del propietario"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Identificacion del Propietario</label>
                <input
                  type="text"
                  value={formData.datosTarjetaPropiedad.identificacionPropietario}
                  onChange={(e) => updateCardData('identificacionPropietario', e.target.value)}
                  className="input-field"
                  placeholder="Cedula o NIT"
                />
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Estos datos se sincronizan con la venta, el contrato y el formulario de traspaso.
            </p>
          </div>
          {/* Identificacion del vehiculo */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Identificacion del vehiculo</h2>
            <p className="mb-4 text-sm text-gray-600">
              Esta es la seccion unificada para editar lo que viene del inventario y de la tarjeta. Si cambias modelo o VIN aqui, tambien se sincronizan linea y chasis legales.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca *
                </label>
                <input
                  type="text"
                  name="marca"
                  value={formData.marca}
                  onChange={handleChange}
                  className="input-field"
                  required
                  placeholder="Ej: Toyota"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo / Linea *
                </label>
                <input
                  type="text"
                  name="modelo"
                  value={formData.modelo}
                  onChange={handleChange}
                  className="input-field"
                  required
                  placeholder="Ej: Corolla"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Vehículo
                </label>
                <select
                  name="tipoVehiculo"
                  value={formData.tipoVehiculo}
                  onChange={handleChange}
                  className="input-field"
                >
                  {VEHICLE_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Tipo de carrocería para el modelo 3D
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Año *
                </label>

                <input
                  type="number"
                  name="año"
                  value={formData.año}
                  onChange={handleChange}
                  className="input-field"
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Placa *
                </label>
                <input
                  type="text"
                  name="placa"
                  value={formData.placa}
                  onChange={handleChange}
                  className="input-field"
                  required
                  placeholder="Ej: ABC123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  VIN / Numero de Chasis
                </label>
                <input
                  type="text"
                  name="vin"
                  value={formData.vin}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ej: 1HGBH41JXMN109186 (Opcional)"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Número de identificación del vehículo (17 caracteres). Opcional.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ej: Blanco"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kilometraje
                </label>
                <input
                  type="text"
                  name="kilometraje"
                  value={formatNumber(formData.kilometraje)}
                  onChange={(e) => {
                    const numValue = parseFormattedNumber(e.target.value);
                    setFormData(prev => ({ ...prev, kilometraje: numValue }));
                  }}
                  className="input-field"
                  placeholder="Ej: 50,000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Ingreso *
                </label>
                <input
                  type="date"
                  name="fechaIngreso"
                  value={formData.fechaIngreso}
                  onChange={handleChange}
                  className="input-field"
                  required
                  max={new Date().toISOString().split('T')[0]}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Fecha en que el vehículo ingresó al inventario
                </p>
              </div>
            </div>
          </div>

          {/* Precios */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Precios</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio de Compra *
                </label>
                <input
                  type="text"
                  name="precioCompra"
                  value={formatNumber(formData.precioCompra)}
                  onChange={(e) => {
                    const numValue = parseFormattedNumber(e.target.value);
                    setFormData(prev => ({ ...prev, precioCompra: numValue }));
                  }}
                  className="input-field"
                  required
                  placeholder="Ej: 29,000,000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio de Venta *
                </label>
                <input
                  type="text"
                  name="precioVenta"
                  value={formatNumber(formData.precioVenta)}
                  onChange={(e) => {
                    const numValue = parseFormattedNumber(e.target.value);
                    setFormData(prev => ({ ...prev, precioVenta: numValue }));
                  }}
                  className="input-field"
                  required
                  placeholder="Ej: 37,500,000"
                />
              </div>
            </div>
          </div>

          {/* Gastos */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Gastos del Vehículo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gastos en Pintura
                </label>
                <input
                  type="text"
                  name="gastos.pintura"
                  value={formatNumber(formData.gastos.pintura)}
                  onChange={(e) => {
                    const numValue = parseFormattedNumber(e.target.value);
                    setFormData(prev => {
                      const newGastos = { ...prev.gastos, pintura: numValue };
                      newGastos.total = newGastos.pintura + newGastos.mecanica + newGastos.traspaso + 
                                       newGastos.alistamiento + newGastos.tapiceria + newGastos.transporte + newGastos.varios;
                      return { ...prev, gastos: newGastos };
                    });
                  }}
                  className="input-field"
                  placeholder="Ej: 2,000,000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gastos en Mecánica
                </label>
                <input
                  type="text"
                  name="gastos.mecanica"
                  value={formatNumber(formData.gastos.mecanica)}
                  onChange={(e) => {
                    const numValue = parseFormattedNumber(e.target.value);
                    setFormData(prev => {
                      const newGastos = { ...prev.gastos, mecanica: numValue };
                      newGastos.total = newGastos.pintura + newGastos.mecanica + newGastos.traspaso + 
                                       newGastos.alistamiento + newGastos.tapiceria + newGastos.transporte + newGastos.varios;
                      return { ...prev, gastos: newGastos };
                    });
                  }}
                  className="input-field"
                  placeholder="Ej: 1,500,000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gastos de Traspaso
                </label>
                <input
                  type="text"
                  name="gastos.traspaso"
                  value={formatNumber(formData.gastos.traspaso)}
                  onChange={(e) => {
                    const numValue = parseFormattedNumber(e.target.value);
                    setFormData(prev => {
                      const newGastos = { ...prev.gastos, traspaso: numValue };
                      newGastos.total = newGastos.pintura + newGastos.mecanica + newGastos.traspaso + 
                                       newGastos.alistamiento + newGastos.tapiceria + newGastos.transporte + newGastos.varios;
                      return { ...prev, gastos: newGastos };
                    });
                  }}
                  className="input-field"
                  placeholder="Ej: 800,000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gastos de Alistamiento
                </label>
                <input
                  type="text"
                  name="gastos.alistamiento"
                  value={formatNumber(formData.gastos.alistamiento)}
                  onChange={(e) => {
                    const numValue = parseFormattedNumber(e.target.value);
                    setFormData(prev => {
                      const newGastos = { ...prev.gastos, alistamiento: numValue };
                      newGastos.total = newGastos.pintura + newGastos.mecanica + newGastos.traspaso + 
                                       newGastos.alistamiento + newGastos.tapiceria + newGastos.transporte + newGastos.varios;
                      return { ...prev, gastos: newGastos };
                    });
                  }}
                  className="input-field"
                  placeholder="Ej: 300,000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gastos de Tapicería
                </label>
                <input
                  type="text"
                  name="gastos.tapiceria"
                  value={formatNumber(formData.gastos.tapiceria)}
                  onChange={(e) => {
                    const numValue = parseFormattedNumber(e.target.value);
                    setFormData(prev => {
                      const newGastos = { ...prev.gastos, tapiceria: numValue };
                      newGastos.total = newGastos.pintura + newGastos.mecanica + newGastos.traspaso + 
                                       newGastos.alistamiento + newGastos.tapiceria + newGastos.transporte + newGastos.varios;
                      return { ...prev, gastos: newGastos };
                    });
                  }}
                  className="input-field"
                  placeholder="Ej: 400,000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gastos de Transporte
                </label>
                <input
                  type="text"
                  name="gastos.transporte"
                  value={formatNumber(formData.gastos.transporte)}
                  onChange={(e) => {
                    const numValue = parseFormattedNumber(e.target.value);
                    setFormData(prev => {
                      const newGastos = { ...prev.gastos, transporte: numValue };
                      newGastos.total = newGastos.pintura + newGastos.mecanica + newGastos.traspaso + 
                                       newGastos.alistamiento + newGastos.tapiceria + newGastos.transporte + newGastos.varios;
                      return { ...prev, gastos: newGastos };
                    });
                  }}
                  className="input-field"
                  placeholder="Ej: 200,000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gastos Varios
                </label>
                <input
                  type="text"
                  name="gastos.varios"
                  value={formatNumber(formData.gastos.varios)}
                  onChange={(e) => {
                    const numValue = parseFormattedNumber(e.target.value);
                    setFormData(prev => {
                      const newGastos = { ...prev.gastos, varios: numValue };
                      newGastos.total = newGastos.pintura + newGastos.mecanica + newGastos.traspaso + 
                                       newGastos.alistamiento + newGastos.tapiceria + newGastos.transporte + newGastos.varios;
                      return { ...prev, gastos: newGastos };
                    });
                  }}
                  className="input-field"
                  placeholder="Ej: 500,000"
                />
              </div>

              <div className="md:col-span-2 space-y-3">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <label className="block text-sm font-medium text-blue-700 mb-1">
                    Gastos del Vehículo
                  </label>
                  <p className="text-2xl font-bold text-blue-900">
                    ${formData.gastos.total.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                
                {formData.inversionistas.length > 0 && (() => {
                  const gastosInversionistas = formData.inversionistas.reduce((sum, inv) => {
                    const totalGastosInv = inv.gastos?.reduce((s, g) => s + (g.monto || 0), 0) || 0;
                    return sum + totalGastosInv;
                  }, 0);
                  
                  return gastosInversionistas > 0 ? (
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <label className="block text-sm font-medium text-orange-700 mb-1">
                        Gastos de Inversionistas
                      </label>
                      <p className="text-2xl font-bold text-orange-900">
                        ${gastosInversionistas.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-orange-600 mt-1">
                        Suma de todos los gastos de inversionistas
                      </p>
                    </div>
                  ) : null;
                })()}
                
                {formData.inversionistas.length > 0 && (() => {
                  const gastosInversionistas = formData.inversionistas.reduce((sum, inv) => {
                    const totalGastosInv = inv.gastos?.reduce((s, g) => s + (g.monto || 0), 0) || 0;
                    return sum + totalGastosInv;
                  }, 0);
                  const totalGeneral = formData.gastos.total + gastosInversionistas;
                  
                  return gastosInversionistas > 0 ? (
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <label className="block text-sm font-medium text-purple-700 mb-1">
                        Total General de Gastos
                      </label>
                      <p className="text-2xl font-bold text-purple-900">
                        ${totalGeneral.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        Gastos del Vehículo + Gastos de Inversionistas
                      </p>
                    </div>
                  ) : null;
                })()}
              </div>
            </div>

            {/* Resumen Financiero */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Resumen Financiero</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Costo Total:</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${(formData.precioCompra + formData.gastos.total).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500">(Compra + Gastos)</p>
                </div>
                <div>
                  <p className="text-gray-600">Precio de Venta:</p>
                  <p className="text-lg font-semibold text-green-600">
                    ${formData.precioVenta.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Utilidad Estimada:</p>
                  <p className={`text-lg font-semibold ${
                    (formData.precioVenta - formData.precioCompra - formData.gastos.total) >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    ${(formData.precioVenta - formData.precioCompra - formData.gastos.total).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formData.precioCompra + formData.gastos.total > 0 
                      ? `(${(((formData.precioVenta - formData.precioCompra - formData.gastos.total) / (formData.precioCompra + formData.gastos.total)) * 100).toFixed(1)}%)`
                      : '(0%)'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Inversionistas */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Users className="inline h-5 w-5 mr-2" />
                Inversionistas
              </h2>
              <button
                type="button"
                onClick={agregarInversionista}
                className="btn-primary flex items-center text-sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar Inversionista
              </button>
            </div>

            {formData.inversionistas.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 mb-2">No hay inversionistas agregados</p>
                <p className="text-sm text-gray-500">
                  Haz clic en "Agregar Inversionista" para registrar socios en este vehículo
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.inversionistas.map((inv, index) => {
                  const inversionistasCalculados = calcularTotalesInversionistas();
                  const invCalculado = inversionistasCalculados[index];
                  
                  return (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-700">
                          Inversionista #{index + 1}
                        </h3>
                        <button
                          type="button"
                          onClick={() => eliminarInversionista(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Eliminar inversionista"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Usuario del Sistema *
                          </label>
                          <select
                            value={inv.usuario || ''}
                            onChange={(e) => actualizarInversionista(index, 'usuario', e.target.value)}
                            className="input-field"
                            required={formData.inversionistas.length > 0}
                          >
                            <option value="">Seleccionar usuario...</option>
                            {usuarios.map(user => (
                              <option key={user.id} value={user.id}>
                                {user.nombre} ({user.email})
                              </option>
                            ))}
                          </select>
                          <p className="mt-1 text-xs text-gray-500">
                            Selecciona el usuario que será inversionista. El nombre se autocompletará.
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre del Inversionista
                          </label>
                          <input
                            type="text"
                            value={inv.nombre}
                            onChange={(e) => actualizarInversionista(index, 'nombre', e.target.value)}
                            className="input-field bg-gray-100"
                            placeholder="Se autocompleta al seleccionar usuario"
                            readOnly
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Monto de Inversión *
                          </label>
                          <input
                            type="text"
                            value={formatNumber(inv.montoInversion)}
                            onChange={(e) => {
                              const numValue = parseFormattedNumber(e.target.value);
                              actualizarInversionista(index, 'montoInversion', numValue);
                            }}
                            className="input-field"
                            placeholder="Ej: 15,000,000"
                            required={formData.inversionistas.length > 0}
                          />
                        </div>

                      </div>

                      {/* Sección de Gastos Dinámicos del Inversionista */}
                      <div className="mt-4 bg-white p-4 rounded-lg border border-gray-300">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-700">
                            Gastos del Inversionista
                          </h4>
                          <button
                            type="button"
                            onClick={() => agregarGastoInversionista(index)}
                            className="flex items-center text-sm bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition-colors"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Agregar Gasto
                          </button>
                        </div>

                        {(!inv.gastos || inv.gastos.length === 0) ? (
                          <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded">
                            No hay gastos registrados. Haz clic en "Agregar Gasto" para añadir uno.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {inv.gastos.map((gasto, gastoIndex) => (
                              <div key={gastoIndex} className="bg-gray-50 p-3 rounded border border-gray-200">
                                <div className="flex items-start justify-between mb-2">
                                  <span className="text-xs font-medium text-gray-600">
                                    Gasto #{gastoIndex + 1}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => eliminarGastoInversionista(index, gastoIndex)}
                                    className="text-red-600 hover:text-red-800"
                                    title="Eliminar gasto"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Categoría *
                                    </label>
                                    <select
                                      value={gasto.categoria}
                                      onChange={(e) => actualizarGastoInversionista(index, gastoIndex, 'categoria', e.target.value)}
                                      className="input-field text-sm"
                                      required
                                    >
                                      <option value="pintura">Pintura</option>
                                      <option value="mecanica">Mecánica</option>
                                      <option value="traspaso">Traspaso</option>
                                      <option value="alistamiento">Alistamiento</option>
                                      <option value="tapiceria">Tapicería</option>
                                      <option value="transporte">Transporte</option>
                                      <option value="varios">Varios</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Monto *
                                    </label>
                                    <input
                                      type="text"
                                      value={formatNumber(gasto.monto)}
                                      onChange={(e) => {
                                        const numValue = parseFormattedNumber(e.target.value);
                                        actualizarGastoInversionista(index, gastoIndex, 'monto', numValue);
                                      }}
                                      className="input-field text-sm"
                                      placeholder="Ej: 500,000"
                                      required
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Descripción
                                    </label>
                                    <input
                                      type="text"
                                      value={gasto.descripcion}
                                      onChange={(e) => actualizarGastoInversionista(index, gastoIndex, 'descripcion', e.target.value)}
                                      className="input-field text-sm"
                                      placeholder="Ej: Cambio de motor"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}

                            {/* Total de gastos del inversionista */}
                            <div className="bg-blue-50 p-3 rounded border border-blue-200 mt-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-blue-700">
                                  Total Gastos del Inversionista:
                                </span>
                                <span className="text-lg font-bold text-blue-900">
                                  ${(inv.gastos?.reduce((s, g) => s + (g.monto || 0), 0) || 0).toLocaleString('es-CO')}
                                </span>
                              </div>
                              <p className="text-xs text-blue-600 mt-1">
                                Este monto será retribuido al inversionista además de su porcentaje de utilidad
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Mostrar cálculos */}
                      <div className="mt-3 grid grid-cols-3 gap-3">
                        <div className="bg-blue-50 p-3 rounded border border-blue-200">
                          <p className="text-xs text-blue-600 mb-1">Participación</p>
                          <p className="text-lg font-bold text-blue-900">
                            {invCalculado.porcentajeParticipacion.toFixed(2)}%
                          </p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded border border-orange-200">
                          <p className="text-xs text-orange-600 mb-1">Retorno de Gastos</p>
                          <p className="text-lg font-bold text-orange-900">
                            ${(inv.gastos?.reduce((s, g) => s + (g.monto || 0), 0) || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="bg-green-50 p-3 rounded border border-green-200">
                          <p className="text-xs text-green-600 mb-1">Utilidad Neta</p>
                          <p className="text-lg font-bold text-green-900">
                            ${(invCalculado.utilidadCorrespondiente - (inv.gastos?.reduce((s, g) => s + (g.monto || 0), 0) || 0)).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 bg-purple-50 p-3 rounded border border-purple-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-purple-700">
                            Total a Recibir:
                          </span>
                          <span className="text-xl font-bold text-purple-900">
                            ${invCalculado.utilidadCorrespondiente.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <p className="text-xs text-purple-600 mt-1">
                          = Utilidad Neta + Retorno de Gastos
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Resumen Total de Inversionistas */}
                {formData.inversionistas.length > 0 && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h3 className="text-sm font-semibold text-purple-900 mb-3">
                      Resumen de Inversiones
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-purple-700">Total Invertido:</p>
                        <p className="text-xl font-bold text-purple-900">
                          ${formData.inversionistas.reduce((sum, inv) => sum + inv.montoInversion, 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-purple-700">Número de Socios:</p>
                        <p className="text-xl font-bold text-purple-900">
                          {formData.inversionistas.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-purple-700">Utilidad Total a Distribuir:</p>
                        <p className="text-xl font-bold text-purple-900">
                          ${(formData.precioVenta - formData.precioCompra - formData.gastos.total).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Documentación */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Documentación</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="doc.prenda.tiene"
                  checked={formData.documentacion.prenda.tiene}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  ¿Tiene Prenda?
                </label>
              </div>

              {formData.documentacion.prenda.tiene && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Detalles de la Prenda
                  </label>
                  <textarea
                    name="doc.prenda.detalles"
                    value={formData.documentacion.prenda.detalles}
                    onChange={handleChange}
                    className="input-field"
                    rows={2}
                    placeholder="Detalles sobre la prenda..."
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SOAT (Vencimiento)
                  </label>
                  <input
                    type="date"
                    name="doc.soat.fechaVencimiento"
                    value={formData.documentacion.soat.fechaVencimiento}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tecnomecánica (Vencimiento)
                  </label>
                  <input
                    type="date"
                    name="doc.tecnomecanica.fechaVencimiento"
                    value={formData.documentacion.tecnomecanica.fechaVencimiento}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="doc.tarjetaPropiedad.tiene"
                  checked={formData.documentacion.tarjetaPropiedad.tiene}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Tarjeta de Propiedad
                </label>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Checklist de Ingreso</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="checklist.revisionMecanica"
                  checked={formData.checklist.revisionMecanica}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Revisión Mecánica Completa
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="checklist.limpiezaDetailing"
                  checked={formData.checklist.limpiezaDetailing}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Limpieza y Detailing
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="checklist.documentosCompletos"
                  checked={formData.checklist.documentosCompletos}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Documentos Completos
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="checklist.fotografiasCompletas"
                  checked={formData.checklist.fotografiasCompletas}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Fotos Completas
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="checklist.precioEstablecido"
                  checked={formData.checklist.precioEstablecido}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Precio Establecido
                </label>
              </div>
            </div>
          </div>

          {/* Estado */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Estado del Vehículo</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado *
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="en_proceso">En Proceso (Con pendientes)</option>
                  <option value="listo_venta">Listo para Venta</option>
                  <option value="en_negociacion">En Negociación</option>
                  <option value="vendido">Vendido</option>
                </select>
              </div>

              {/* Mostrar campo de fecha de venta solo si el estado es "vendido" */}
              {formData.estado === 'vendido' && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-1">
                      Fecha de Venta *
                    </label>
                    <input
                      type="date"
                      name="fechaVenta"
                      value={formData.fechaVenta || ''}
                      onChange={handleChange}
                      className="input-field"
                      required={formData.estado === 'vendido'}
                      min={formData.fechaIngreso}
                    />
                    <p className="mt-2 text-xs text-green-600">
                      Esta fecha se usará para generar informes de ventas mensuales
                    </p>
                    
                    {/* Calcular y mostrar días en inventario */}
                    {formData.fechaVenta && formData.fechaIngreso && (
                      <div className="mt-3 p-3 bg-white rounded border border-green-300">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Tiempo en Inventario
                        </p>
                        <p className="text-2xl font-bold text-green-700">
                          {Math.floor(
                            (new Date(formData.fechaVenta).getTime() - new Date(formData.fechaIngreso).getTime()) / 
                            (1000 * 60 * 60 * 24)
                          )} días
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Desde {new Date(formData.fechaIngreso).toLocaleDateString('es-CO')} hasta {new Date(formData.fechaVenta).toLocaleDateString('es-CO')}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-1">
                      Estado del Trámite
                    </label>
                    <select
                      name="estadoTramite"
                      value={formData.estadoTramite || ''}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="">Seleccionar estado...</option>
                      <option value="firma_documentos">Firma de Documentos</option>
                      <option value="radicacion">Radicación</option>
                      <option value="recepcion_tarjeta">Recepción de Tarjeta de Propiedad</option>
                      <option value="entrega_cliente">Entrega de Tarjeta al Cliente</option>
                    </select>
                    <p className="mt-2 text-xs text-green-600">
                      Seguimiento del proceso de traspaso del vehículo
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Foto del Vehiculo */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              <Image className="inline h-5 w-5 mr-2" />
              Foto del Vehiculo
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Sube una foto principal del vehiculo
            </p>

            {!photoPreview ? (
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-12 h-12 mb-4 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-700">
                      <span className="font-semibold">Click para subir</span> o arrastra la foto aqui
                    </p>
                    <p className="text-xs text-gray-500">PNG o JPG (MAX. 5MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                    onError={() => {
                      setPhotoPreview('');
                      setError('La foto guardada no esta disponible. Sube una nueva imagen.');
                    }}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={openFilePicker}
                    className="btn-secondary"
                  >
                    Cambiar foto
                  </button>
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={removeFile}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                      Quitar seleccion
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>

                {selectedFile ? (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Foto seleccionada:</strong> {selectedFile.name}
                    </p>
                  </div>
                ) : (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Foto guardada:</strong> usa "Cambiar foto" para reemplazarla.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Observaciones y Comentarios */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Observaciones y Comentarios</h2>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              className="input-field"
              rows={4}
              placeholder="Escribe aquí cualquier observación, comentario o detalle importante sobre el vehículo..."
            />
            <p className="mt-2 text-sm text-gray-500">
              Puedes incluir información sobre el estado general, historial, negociaciones, o cualquier detalle relevante.
            </p>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/vehicles')}
              className="btn-secondary"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center"
              disabled={isLoading || success}
            >
              <Save className="h-5 w-5 mr-2" />
              {isLoading 
                ? 'Guardando...' 
                : success 
                  ? '¡Guardado!' 
                  : isEditMode 
                    ? 'Actualizar Vehículo' 
                    : 'Guardar Vehículo'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default VehicleForm;
