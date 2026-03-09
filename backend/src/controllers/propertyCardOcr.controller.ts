import { Response } from 'express';
import axios from 'axios';
import { AuthRequest } from '../types';

type VisionExtractedPayload = {
  placa?: string;
  marca?: string;
  modelo?: string;
  anio?: number | string | null;
  color?: string;
  vin?: string;
  linea?: string;
  cilindrada?: string;
  claseVehiculo?: string;
  servicio?: string;
  tipoCarroceria?: string;
  numeroMotor?: string;
  capacidad?: string;
  numeroChasis?: string;
  propietario?: string;
  identificacionPropietario?: string;
  prenda?: string;
  tipoVehiculo?: 'suv' | 'pickup' | 'sedan' | 'hatchback' | '' | null;
  rawText?: string;
  confidence?: number;
};

type VisionCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
};

type UploadedImageFile = {
  mimetype: string;
  buffer: Buffer;
};

const VEHICLE_TYPE_SET = new Set(['suv', 'pickup', 'sedan', 'hatchback']);
const OPENAI_VISION_MODEL = process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini';
const OPENAI_API_BASE_URL = process.env.OPENAI_API_BASE_URL || 'https://api.openai.com/v1';

const toTrimmedUpper = (value: unknown) =>
  typeof value === 'string' ? value.trim().toUpperCase() : '';

const normalizePlate = (value: unknown) => {
  const normalized = toTrimmedUpper(value).replace(/[^A-Z0-9]/g, '');
  const match = normalized.match(/[A-Z]{3}\d{3}|[A-Z]{3}\d{2}[A-Z]/);
  return match?.[0] || '';
};

const normalizeAlphanumeric = (value: unknown, minLength: number, maxLength: number) => {
  const normalized = toTrimmedUpper(value).replace(/[^A-Z0-9-]/g, '');
  if (normalized.length < minLength || normalized.length > maxLength) {
    return '';
  }
  return normalized;
};

const normalizeDigits = (value: unknown, minLength: number, maxLength: number) => {
  const normalized = typeof value === 'string' ? value.replace(/\D/g, '') : '';
  if (normalized.length < minLength || normalized.length > maxLength) {
    return '';
  }
  return normalized;
};

const normalizeText = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

const normalizeYear = (value: unknown) => {
  const currentYear = new Date().getFullYear() + 1;
  const parsed = typeof value === 'number' ? value : Number(String(value || '').replace(/[^\d]/g, ''));
  if (!Number.isFinite(parsed) || parsed < 1900 || parsed > currentYear) {
    return null;
  }
  return Math.round(parsed);
};

const normalizeVehicleType = (value: unknown) => {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return VEHICLE_TYPE_SET.has(normalized) ? normalized : null;
};

const parseJsonFromModelContent = (content: string) => {
  const trimmed = content.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');

  try {
    return JSON.parse(trimmed);
  } catch {
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new Error('La respuesta del modelo no contiene JSON valido.');
    }

    return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
  }
};

const getMessageContentAsText = (responseData: VisionCompletionResponse) => {
  const content = responseData?.choices?.[0]?.message?.content;
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => (typeof item?.text === 'string' ? item.text : ''))
      .join('\n')
      .trim();
  }

  return '';
};

const countDetectedFields = (payload: Record<string, unknown>) =>
  Object.values(payload).filter((value) => {
    if (typeof value === 'number') return Number.isFinite(value);
    if (typeof value === 'string') return value.trim().length > 0;
    return false;
  }).length;

export const ocrPropertyCardWithVisionAI = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      res.status(503).json({
        message: 'OCR con IA no configurado en el servidor. Falta OPENAI_API_KEY.',
        missingEnv: ['OPENAI_API_KEY'],
      });
      return;
    }

    const file = req.file as UploadedImageFile | undefined;
    if (!file) {
      res.status(400).json({ message: 'Debes adjuntar una imagen de la tarjeta en el campo file.' });
      return;
    }

    if (!file.mimetype.startsWith('image/')) {
      res.status(400).json({ message: 'Solo se permiten imagenes para OCR con IA.' });
      return;
    }

    const base64 = file.buffer.toString('base64');
    const imageUrl = `data:${file.mimetype};base64,${base64}`;

    const prompt = [
      'Extrae los datos de una tarjeta de propiedad de vehiculo colombiana.',
      'Responde SOLO JSON valido con esta estructura:',
      '{',
      '  "placa": string,',
      '  "marca": string,',
      '  "modelo": string,',
      '  "anio": number|null,',
      '  "color": string,',
      '  "vin": string,',
      '  "linea": string,',
      '  "cilindrada": string,',
      '  "claseVehiculo": string,',
      '  "servicio": string,',
      '  "tipoCarroceria": string,',
      '  "numeroMotor": string,',
      '  "capacidad": string,',
      '  "numeroChasis": string,',
      '  "propietario": string,',
      '  "identificacionPropietario": string,',
      '  "prenda": string,',
      '  "tipoVehiculo": "suv"|"pickup"|"sedan"|"hatchback"|null,',
      '  "confidence": number,',
      '  "rawText": string',
      '}',
      'Si un campo no es legible, devuelve cadena vacia o null.',
      'No inventes datos.',
    ].join('\n');

    const completion = await axios.post<VisionCompletionResponse>(
      `${OPENAI_API_BASE_URL}/chat/completions`,
      {
        model: OPENAI_VISION_MODEL,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'Eres un OCR experto en tarjetas de propiedad de vehiculos de Colombia. Debes responder solo JSON.',
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const rawModelContent = getMessageContentAsText(completion.data);
    if (!rawModelContent) {
      throw new Error('La IA no devolvio contenido util.');
    }

    const parsed = parseJsonFromModelContent(rawModelContent) as VisionExtractedPayload;

    const extracted = {
      placa: normalizePlate(parsed.placa),
      marca: normalizeText(parsed.marca),
      modelo: normalizeText(parsed.modelo),
      anio: normalizeYear(parsed.anio),
      color: normalizeText(parsed.color),
      vin: normalizeAlphanumeric(parsed.vin, 6, 20),
      linea: normalizeText(parsed.linea),
      cilindrada: normalizeDigits(parsed.cilindrada, 2, 5),
      claseVehiculo: normalizeText(parsed.claseVehiculo),
      servicio: normalizeText(parsed.servicio),
      tipoCarroceria: normalizeText(parsed.tipoCarroceria),
      numeroMotor: normalizeAlphanumeric(parsed.numeroMotor, 4, 25),
      capacidad: normalizeDigits(parsed.capacidad, 1, 4),
      numeroChasis: normalizeAlphanumeric(parsed.numeroChasis, 4, 25),
      propietario: normalizeText(parsed.propietario),
      identificacionPropietario: normalizeDigits(parsed.identificacionPropietario, 5, 15),
      prenda: normalizeText(parsed.prenda),
      tipoVehiculo: normalizeVehicleType(parsed.tipoVehiculo),
    };

    const detectedFields = countDetectedFields(extracted);
    const modelConfidence =
      typeof parsed.confidence === 'number' && Number.isFinite(parsed.confidence)
        ? Math.max(0, Math.min(99, Math.round(parsed.confidence)))
        : null;
    const fallbackConfidence = Math.max(35, Math.min(97, Math.round(38 + detectedFields * 3.2)));

    res.json({
      source: 'vision_ai',
      confidence: modelConfidence ?? fallbackConfidence,
      detectedFields,
      rawText: normalizeText(parsed.rawText),
      extracted,
    });
  } catch (error: any) {
    const status = error?.response?.status;
    const providerError = error?.response?.data?.error?.message || error?.response?.data?.message;

    res.status(status && status >= 400 && status < 600 ? status : 500).json({
      message: 'No se pudo procesar OCR con IA.',
      error: providerError || error?.message || 'Error desconocido',
    });
  }
};
