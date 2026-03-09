export type ExtractedVehicleType = 'suv' | 'pickup' | 'sedan' | 'hatchback';

export interface VehicleCardExtractedData {
  placa: string;
  marca: string;
  modelo: string;
  año: number | null;
  color: string;
  vin: string;
  linea: string;
  cilindrada: string;
  claseVehiculo: string;
  servicio: string;
  tipoCarroceria: string;
  numeroMotor: string;
  capacidad: string;
  numeroChasis: string;
  propietario: string;
  identificacionPropietario: string;
  prenda: string;
  tipoVehiculo: ExtractedVehicleType | null;
}

export interface VehicleCardReaderResult {
  rawText: string;
  confidence: number;
  extracted: VehicleCardExtractedData;
  detectedFields: number;
}

type ExtractedTextField = Exclude<keyof VehicleCardExtractedData, 'año' | 'tipoVehiculo'>;

const LABEL_ALIASES = {
  placa: ['PLACA'],
  marca: ['MARCA', 'FABRICANTE'],
  modelo: ['LINEA', 'LINEA REFERENCIA', 'REFERENCIA', 'VERSION'],
  año: ['MODELO', 'ANO', 'ANO MODELO'],
  color: ['COLOR', 'COLOR PRINCIPAL'],
  cilindrada: ['CILINDRAJE', 'CILINDRADA', 'CILINDRAJE CC', 'CILINDRADA CC'],
  claseVehiculo: ['CLASE', 'CLASE VEHICULO', 'CLASE DE VEHICULO'],
  servicio: ['SERVICIO', 'TIPO SERVICIO'],
  numeroMotor: ['NUMERO DE MOTOR', 'NUMERO MOTOR', 'NO MOTOR', 'NO. MOTOR', 'NRO MOTOR', 'MOTOR'],
  capacidad: ['CAPACIDAD', 'CAPACIDAD KG PSJ', 'CAPACIDAD PSJ', 'CAPACIDAD PASAJEROS'],
  vin: ['VIN', 'NUMERO VIN', 'NO VIN', 'NO. VIN', 'NRO VIN'],
  numeroChasis: ['CHASIS', 'NUMERO DE CHASIS', 'NO CHASIS', 'NO. CHASIS', 'NRO CHASIS', 'SERIE', 'NRO SERIE'],
  carroceria: ['CARROCERIA', 'TIPO CARROCERIA', 'TIPO DE CARROCERIA'],
  propietario: [
    'PROPIETARIO',
    'NOMBRE PROPIETARIO',
    'TITULAR',
    'APELLIDOS Y NOMBRES',
    'APELLIDOS NOMBRES',
    'APELLIDO S Y NOMBRE S',
    'APELLIDO S Y NOMBRES',
    'NOMBRES Y APELLIDOS',
    'RAZON SOCIAL',
  ],
  identificacion: [
    'IDENTIFICACION',
    'NO IDENTIFICACION',
    'NO. IDENTIFICACION',
    'NRO IDENTIFICACION',
    'CEDULA',
    'NIT',
    'DOCUMENTO',
    'DOCUMENTO IDENTIDAD',
  ],
  prenda: ['PRENDA', 'LIMITACION A LA PROPIEDAD', 'PIGNORACION'],
} as const;

const ALL_LABELS = Array.from(
  new Set(Object.values(LABEL_ALIASES).flat().sort((a, b) => b.length - a.length))
);

const orderLabelsByLength = (labels: readonly string[]) =>
  [...labels].sort((a, b) => b.length - a.length);

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const KNOWN_BRANDS = [
  'AUDI',
  'BMW',
  'BYD',
  'CHEVROLET',
  'CHERY',
  'CITROEN',
  'DFSK',
  'FIAT',
  'FORD',
  'FOTON',
  'HONDA',
  'HYUNDAI',
  'ISUZU',
  'JAC',
  'JEEP',
  'KIA',
  'MAZDA',
  'MERCEDES BENZ',
  'MG',
  'MITSUBISHI',
  'NISSAN',
  'PEUGEOT',
  'RENAULT',
  'SEAT',
  'SKODA',
  'SUBARU',
  'SUZUKI',
  'TOYOTA',
  'VOLKSWAGEN',
  'VOLVO',
];

const COLOR_ALIASES: Record<string, string> = {
  BLANCO: 'Blanco',
  NEGRO: 'Negro',
  GRIS: 'Gris',
  PLATA: 'Plata',
  'GRIS PLATA': 'Gris Plata',
  AZUL: 'Azul',
  ROJO: 'Rojo',
  VERDE: 'Verde',
  AMARILLO: 'Amarillo',
  BEIGE: 'Beige',
  DORADO: 'Dorado',
  MARRON: 'Marron',
  CAFE: 'Cafe',
  NARANJA: 'Naranja',
  VINOTINTO: 'Vinotinto',
  CHAMPAGNE: 'Champagne',
  TITANIO: 'Titanio',
};

const SERVICE_ALIASES: Record<string, string> = {
  PARTICULAR: 'Particular',
  PUBLICO: 'Publico',
  OFICIAL: 'Oficial',
  DIPLOMATICO: 'Diplomatico',
  ESPECIAL: 'Especial',
};

const KNOWN_VEHICLE_CLASSES = [
  'AUTOMOVIL',
  'CAMIONETA',
  'CAMPERO',
  'MICROBUS',
  'BUS',
  'BUSETA',
  'PICKUP',
  'VOLQUETA',
  'TRACTOCAMION',
  'MOTOCICLETA',
  'REMOLQUE',
  'SEMIREMOLQUE',
];

const OCR_DOCUMENT_BASE_WIDTH = 1654;
const OCR_DOCUMENT_BASE_HEIGHT = 2339;
const OCR_DOCUMENT_MARGIN = 96;
const OCR_DOCUMENT_MAX_EDGE = 3000;
const OCR_CARD_BASE_WIDTH = 2200;
const OCR_CARD_BASE_HEIGHT = 1400;
const OCR_CARD_MARGIN = 36;
const OCR_REGION_SCALE = 1.75;
const OCR_PSM_SPARSE_TEXT = 11;
const OCR_PSM_SINGLE_BLOCK = 6;
const OCR_PSM_SINGLE_LINE = 7;
const OCR_PSM_SINGLE_WORD = 8;

const emptyExtractedData = (): VehicleCardExtractedData => ({
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

const stripAccents = (value: string): string =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const normalizeForSearch = (value: string): string =>
  stripAccents(value)
    .toUpperCase()
    .replace(/[|()[\]{}]/g, ' ')
    .replace(/[.,;=_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeLine = (value: string): string =>
  normalizeForSearch(value.replace(/[:\-]+/g, ' '));

const cleanCandidate = (value: string): string => {
  const normalized = normalizeForSearch(value)
    .replace(/^[\s:.-]+/, '')
    .replace(/\b(?:LICENCIA DE TRANSITO|REPUBLICA DE COLOMBIA|MINISTERIO DE TRANSPORTE)\b/g, '')
    .trim();

  return normalized;
};

const trimAtNextLabel = (candidate: string): string => {
  let trimmed = candidate;

  for (const label of ALL_LABELS) {
    const labelIndex = trimmed.indexOf(` ${label} `);
    if (labelIndex > 0) {
      trimmed = trimmed.slice(0, labelIndex).trim();
    }
  }

  return trimmed.trim();
};

const stripFieldLabels = (value: string, labels: readonly string[]): string => {
  const normalizedLabels = orderLabelsByLength(
    Array.from(new Set(labels.map((label) => normalizeLine(label)).filter(Boolean)))
  );

  let candidate = cleanCandidate(value);

  for (const label of normalizedLabels) {
    candidate = candidate.replace(new RegExp(`\\b${escapeRegExp(label)}\\b`, 'g'), ' ');
  }

  return candidate.replace(/\s+/g, ' ').trim();
};

const findNextUsefulLine = (lines: string[], startIndex: number): string => {
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const candidate = cleanCandidate(lines[index]);
    if (!candidate) continue;

    const isOnlyLabel = ALL_LABELS.some((label) => candidate === label);
    if (!isOnlyLabel) {
      return candidate;
    }
  }

  return '';
};

const extractLabeledValue = (lines: string[], labels: readonly string[]): string => {
  const orderedLabels = orderLabelsByLength(labels);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    for (const label of orderedLabels) {
      const labelIndex = line.indexOf(label);
      if (labelIndex === -1) continue;

      const remainder = cleanCandidate(line.slice(labelIndex + label.length));
      const sameLineValue = trimAtNextLabel(remainder);
      if (sameLineValue && sameLineValue !== label) {
        return sameLineValue;
      }

      const nextLineValue = trimAtNextLabel(findNextUsefulLine(lines, index));
      if (nextLineValue && nextLineValue !== label) {
        return nextLineValue;
      }
    }
  }

  return '';
};

type OcrBoundingBox = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
};

type OcrRecognitionWord = {
  text: string;
  bbox: OcrBoundingBox;
};

type OcrRecognitionLine = {
  text: string;
  bbox: OcrBoundingBox;
  words: OcrRecognitionWord[];
};

type OcrRecognitionParagraph = {
  lines: OcrRecognitionLine[];
};

type OcrRecognitionBlock = {
  paragraphs: OcrRecognitionParagraph[];
};

type OcrLayoutWord = {
  text: string;
  normalized: string;
  bbox: OcrBoundingBox;
};

type OcrLayoutLine = {
  text: string;
  normalized: string;
  words: OcrLayoutWord[];
  bbox: OcrBoundingBox;
};

const getBoxHeight = (bbox: OcrBoundingBox) =>
  Math.max(1, bbox.y1 - bbox.y0);

const buildLayoutLines = (blocks?: OcrRecognitionBlock[] | null): OcrLayoutLine[] => {
  if (!blocks?.length) {
    return [];
  }

  return blocks
    .flatMap((block) => block.paragraphs || [])
    .flatMap((paragraph) => paragraph.lines || [])
    .map((line) => ({
      text: line.text || '',
      normalized: normalizeLine(line.text || ''),
      words: (line.words || [])
        .map((word) => ({
          text: word.text || '',
          normalized: normalizeLine(word.text || ''),
          bbox: word.bbox,
        }))
        .filter((word) => word.normalized),
      bbox: line.bbox,
    }))
    .filter((line) => line.normalized && line.words.length > 0)
    .sort((left, right) => {
      const yDiff = left.bbox.y0 - right.bbox.y0;
      return Math.abs(yDiff) <= 12
        ? left.bbox.x0 - right.bbox.x0
        : yDiff;
    });
};

const findLabelMatchInWords = (words: OcrLayoutWord[], label: string) => {
  const labelTokens = label.split(' ');

  for (let index = 0; index <= words.length - labelTokens.length; index += 1) {
    const candidate = words
      .slice(index, index + labelTokens.length)
      .map((word) => word.normalized)
      .join(' ');

    if (candidate === label) {
      return {
        start: index,
        end: index + labelTokens.length - 1,
      };
    }
  }

  return null;
};

const findNextLabelStartInWords = (words: OcrLayoutWord[], startIndex: number) => {
  for (let index = startIndex; index < words.length; index += 1) {
    const startsLabel = ALL_LABELS.some((label) => findLabelMatchInWords(words.slice(index), label)?.start === 0);
    if (startsLabel) {
      return index;
    }
  }

  return -1;
};

const findNextUsefulLayoutLine = (
  lines: OcrLayoutLine[],
  startIndex: number,
  sourceBox: OcrBoundingBox
): string => {
  const sourceHeight = getBoxHeight(sourceBox);

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const candidateLine = lines[index];
    const verticalDistance = candidateLine.bbox.y0 - sourceBox.y1;

    if (verticalDistance <= sourceHeight * 0.15) {
      continue;
    }

    if (verticalDistance > sourceHeight * 3.5) {
      break;
    }

    const hasHorizontalAffinity =
      candidateLine.bbox.x0 <= sourceBox.x1 + sourceHeight * 5 &&
      candidateLine.bbox.x1 >= sourceBox.x0 - sourceHeight * 1.5;

    if (!hasHorizontalAffinity) {
      continue;
    }

    const candidate = trimAtNextLabel(cleanCandidate(candidateLine.text));
    if (!candidate) continue;

    const isOnlyLabel = ALL_LABELS.some((label) => candidate === label);
    if (!isOnlyLabel) {
      return candidate;
    }
  }

  return '';
};

const extractLabeledValueFromLayout = (
  layoutLines: OcrLayoutLine[],
  labels: readonly string[]
): string => {
  const orderedLabels = orderLabelsByLength(labels);

  for (let lineIndex = 0; lineIndex < layoutLines.length; lineIndex += 1) {
    const line = layoutLines[lineIndex];

    for (const label of orderedLabels) {
      const match = findLabelMatchInWords(line.words, label);
      if (!match) continue;

      const nextLabelStart = findNextLabelStartInWords(line.words, match.end + 1);
      const sameLineWords = line.words.slice(
        match.end + 1,
        nextLabelStart === -1 ? undefined : nextLabelStart
      );
      const sameLineValue = trimAtNextLabel(
        cleanCandidate(sameLineWords.map((word) => word.text).join(' '))
      );

      if (sameLineValue && sameLineValue !== label) {
        return sameLineValue;
      }

      const nextLineValue = findNextUsefulLayoutLine(layoutLines, lineIndex, line.bbox);
      if (nextLineValue && nextLineValue !== label) {
        return nextLineValue;
      }
    }
  }

  return '';
};

const extractValueBelowLabel = (
  layoutLines: OcrLayoutLine[],
  lines: string[],
  labels: readonly string[]
): string => {
  const orderedLabels = orderLabelsByLength(labels);

  for (let lineIndex = 0; lineIndex < layoutLines.length; lineIndex += 1) {
    const line = layoutLines[lineIndex];

    for (const label of orderedLabels) {
      if (!line.normalized.includes(label)) {
        continue;
      }

      const nextLineValue = findNextUsefulLayoutLine(layoutLines, lineIndex, line.bbox);
      if (nextLineValue && nextLineValue !== label) {
        return nextLineValue;
      }
    }
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    for (const label of orderedLabels) {
      if (!line.includes(label)) {
        continue;
      }

      const nextLineValue = trimAtNextLabel(findNextUsefulLine(lines, index));
      if (nextLineValue && nextLineValue !== label) {
        return nextLineValue;
      }
    }
  }

  return '';
};

const extractPlate = (text: string): string => {
  const match = text.match(/\b[A-Z]{3}\s?\d{3}\b|\b[A-Z]{3}\s?\d{2}[A-Z]\b/);
  return match ? match[0].replace(/\s+/g, '') : '';
};

const extractVin = (text: string): string => {
  const match = text.match(/\b[A-HJ-NPR-Z0-9]{17}\b/);
  return match ? match[0] : '';
};

const extractIdentification = (text: string): string => {
  const matches = text.match(/\b\d{5,15}\b/g) || [];
  return matches[matches.length - 1] || '';
};

const extractYear = (text: string): number | null => {
  const match = text.match(/\b(19\d{2}|20\d{2})\b/);
  return match ? parseInt(match[1], 10) : null;
};

const OCR_DIGIT_TO_LETTER: Record<string, string> = {
  '0': 'O',
  '1': 'I',
  '2': 'Z',
  '4': 'A',
  '5': 'S',
  '6': 'G',
  '7': 'T',
  '8': 'B',
};

const OCR_LETTER_TO_DIGIT: Record<string, string> = {
  O: '0',
  Q: '0',
  D: '0',
  I: '1',
  L: '1',
  Z: '2',
  S: '5',
  G: '6',
  B: '8',
};

const ADMINISTRATIVE_NOISE_REGEX =
  /\b(?:REPUBLICA|COLOMBIA|MINISTERIO|TRANSPORTE|LICENCIA|TRANSITO|SERVICIO|PUBLICO|PARTICULAR)\b/;
const VIN_NOISE_FRAGMENT_REGEX = /(REPUBL|COLOMB|MINIST|TRANSI|LICENC|SERVIC|PUBLIC)/;

const normalizeNumericCandidate = (
  value: string,
  minDigits: number,
  maxDigits: number
): string => {
  const normalized = normalizeForSearch(value)
    .replace(/[A-Z]/g, (char) => OCR_LETTER_TO_DIGIT[char] || char)
    .replace(/[^A-Z0-9]/g, '');

  const matches = normalized.match(new RegExp(`\\d{${minDigits},${maxDigits}}`, 'g')) || [];
  return matches.sort((a, b) => b.length - a.length)[0] || '';
};

const countLetters = (value: string) => (value.match(/[A-Z]/g) || []).length;

const countDigits = (value: string) => (value.match(/\d/g) || []).length;

const pickBestExtractedValue = (
  primary: string,
  secondary: string,
  strategy: 'text' | 'numeric' | 'name' | 'alphanumeric' = 'text'
): string => {
  const first = trimAtNextLabel(cleanCandidate(primary));
  const second = trimAtNextLabel(cleanCandidate(secondary));

  if (!first) return second;
  if (!second) return first;

  const score = (value: string) => {
    switch (strategy) {
      case 'numeric':
        return countDigits(value) * 10 + value.length;
      case 'name':
        return countLetters(value) * 4 + value.split(' ').filter(Boolean).length * 8 - countDigits(value) * 10;
      case 'alphanumeric':
        return (countLetters(value) + countDigits(value)) * 4 + value.length;
      case 'text':
      default:
        return countLetters(value) * 3 + value.length;
    }
  };

  return score(second) > score(first) ? second : first;
};

const normalizePlateWindow = (value: string): { value: string; score: number } | null => {
  const normalized = normalizeForSearch(value).replace(/[^A-Z0-9]/g, '');
  if (normalized.length !== 6) {
    return null;
  }

  const letterScore = (char: string) => {
    if (/^[A-Z]$/.test(char)) return { value: char, score: 2 };
    const mapped = OCR_DIGIT_TO_LETTER[char];
    return mapped ? { value: mapped, score: 1 } : null;
  };

  const digitScore = (char: string) => {
    if (/^\d$/.test(char)) return { value: char, score: 2 };
    const mapped = OCR_LETTER_TO_DIGIT[char];
    return mapped ? { value: mapped, score: 1 } : null;
  };

  const buildCandidate = (tailPattern: Array<'digit' | 'letter'>) => {
    let score = 0;
    let candidate = '';

    for (let index = 0; index < 3; index += 1) {
      const result = letterScore(normalized[index]);
      if (!result) return null;
      candidate += result.value;
      score += result.score;
    }

    for (let index = 0; index < tailPattern.length; index += 1) {
      const char = normalized[index + 3];
      const result =
        tailPattern[index] === 'digit'
          ? digitScore(char)
          : letterScore(char);

      if (!result) return null;
      candidate += result.value;
      score += result.score;
    }

    return { value: candidate, score };
  };

  const candidates = [
    buildCandidate(['digit', 'digit', 'digit']),
    buildCandidate(['digit', 'digit', 'letter']),
  ].filter(Boolean) as Array<{ value: string; score: number }>;

  if (!candidates.length) {
    return null;
  }

  return candidates.sort((a, b) => b.score - a.score)[0];
};

const extractPlateLoose = (...values: string[]): string => {
  let bestMatch: { value: string; score: number } | null = null;

  for (const value of values) {
    const normalized = normalizeForSearch(value).replace(/[^A-Z0-9]/g, '');

    for (let index = 0; index <= normalized.length - 6; index += 1) {
      const window = normalized.slice(index, index + 6);
      const candidate = normalizePlateWindow(window);

      if (!candidate) continue;

      if (!bestMatch || candidate.score > bestMatch.score) {
        bestMatch = candidate;
      }
    }
  }

  return bestMatch?.value || '';
};

const extractPreferredPlate = (preferredValue: string, ...fallbackValues: string[]): string => {
  const normalizedPreferred = normalizeForSearch(preferredValue);
  const strictPreferred = extractPlate(normalizedPreferred) || extractPlate(preferredValue);
  if (strictPreferred) {
    return strictPreferred;
  }

  const loosePreferred = extractPlateLoose(preferredValue);
  if (loosePreferred) {
    return loosePreferred;
  }

  for (const value of fallbackValues) {
    const strictCandidate = extractPlate(normalizeForSearch(value)) || extractPlate(value);
    if (strictCandidate) {
      return strictCandidate;
    }
  }

  return extractPlateLoose(...fallbackValues);
};

const extractVinLoose = (...values: string[]): string => {
  for (const value of values) {
    const normalized = normalizeForSearch(value)
      .replace(/[OQ]/g, '0')
      .replace(/I/g, '1')
      .replace(/[^A-Z0-9]/g, '');
    const match = normalized.match(/[A-HJ-NPR-Z0-9]{17}/);
    if (match && !VIN_NOISE_FRAGMENT_REGEX.test(match[0])) {
      return match[0];
    }
  }

  return '';
};

const isLikelyMechanicalCode = (value: string) => {
  const normalized = cleanCandidate(value).replace(/[^A-Z0-9-]/g, '');

  if (
    !normalized ||
    normalized.length < 5 ||
    normalized.length > 25 ||
    !/\d/.test(normalized) ||
    ADMINISTRATIVE_NOISE_REGEX.test(normalized)
  ) {
    return false;
  }

  return /^[A-Z0-9-]+$/.test(normalized);
};

const findKnownPhrase = (value: string, candidates: readonly string[]): string => {
  const normalized = normalizeForSearch(value);

  for (const candidate of orderLabelsByLength(candidates)) {
    const matcher = new RegExp(`(^|\\s)${escapeRegExp(candidate)}(?=\\s|$)`);
    if (matcher.test(normalized)) {
      return candidate;
    }
  }

  return '';
};

const extractNumericGroups = (value: string): string[] => {
  const normalized = normalizeForSearch(value)
    .replace(/[OQD]/g, '0')
    .replace(/[IL]/g, '1');

  const separatedMatches = Array.from(
    normalized.matchAll(/\b(\d{1,2})[\s.](\d{2,3})\b/g),
    (match) => `${match[1]}${match[2]}`
  );
  const compactMatches = normalized.match(/\b\d{1,5}\b/g) || [];

  return Array.from(new Set([...separatedMatches, ...compactMatches]));
};

const normalizeBrand = (value: string, fallbackText: string): string => {
  const candidate = cleanCandidate(value);
  if (candidate) {
    const looksLikeColor = Object.keys(COLOR_ALIASES).some((color) => candidate.includes(color));
    if (!looksLikeColor) {
      return candidate;
    }
  }

  return KNOWN_BRANDS.find((brand) => fallbackText.includes(brand)) || '';
};

const normalizeColor = (value: string, fallbackText: string): string => {
  const candidate = cleanCandidate(value);
  if (candidate) {
    if (KNOWN_BRANDS.includes(candidate)) {
      const fallbackColor = Object.entries(COLOR_ALIASES).find(([key]) => fallbackText.includes(key));
      return fallbackColor ? fallbackColor[1] : '';
    }

    const colorMatch = Object.entries(COLOR_ALIASES).find(([key]) => candidate.includes(key));
    return colorMatch ? colorMatch[1] : candidate;
  }

  const fallbackColor = Object.entries(COLOR_ALIASES).find(([key]) => fallbackText.includes(key));
  return fallbackColor ? fallbackColor[1] : '';
};

const normalizeService = (value: string, fallbackText: string): string => {
  const candidate = cleanCandidate(value);
  if (candidate) {
    const serviceMatch = Object.entries(SERVICE_ALIASES).find(([key]) => candidate.includes(key));
    if (serviceMatch) {
      return serviceMatch[1];
    }

    if (!/^\d{2,5}$/.test(candidate)) {
      return candidate;
    }
  }

  const fallbackService = Object.entries(SERVICE_ALIASES).find(([key]) => fallbackText.includes(key));
  return fallbackService ? fallbackService[1] : '';
};

const normalizeMechanicalValue = (value: string): string => {
  const candidate = cleanCandidate(value)
    .replace(
      /\b(?:NUMERO|NRO|NO|DE|MOTOR|VIN|CHASIS|SERIE|IDENTIFICACION|PLACA|PROPIETARIO)\b/g,
      ' '
    )
    .replace(/\bREG\b/g, ' ')
    .replace(/\bCC\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!candidate) {
    return '';
  }

  const tokenMatches = candidate
    .split(/\s+/)
    .map((token) => token.replace(/[^A-Z0-9-]/g, ''))
    .filter((token) => isLikelyMechanicalCode(token));

  if (tokenMatches.length) {
    return tokenMatches.sort((left, right) => right.length - left.length)[0];
  }

  const compact = candidate.replace(/[^A-Z0-9-]/g, '');
  if (isLikelyMechanicalCode(compact)) {
    return compact;
  }

  return '';
};

const normalizeCilindrada = (value: string): string => {
  const candidates = extractNumericGroups(value)
    .filter((candidate) => candidate.length >= 3 && candidate.length <= 4)
    .sort((left, right) => right.length - left.length);

  if (candidates.length) {
    return candidates[0];
  }

  return normalizeNumericCandidate(value, 2, 4);
};

const normalizeVehicleClass = (value: string, fallbackText = ''): string => {
  const candidate = cleanCandidate(value)
    .replace(/\b(?:CLASE|DE VEHICULO|VEHICULO)\b/g, '')
    .trim();
  const normalizedFallbackText = normalizeForSearch(fallbackText);
  const matchedCandidate = findKnownPhrase(candidate, KNOWN_VEHICLE_CLASSES);

  if (matchedCandidate) {
    return matchedCandidate;
  }

  if (!candidate) {
    const fallback = findKnownPhrase(normalizedFallbackText, KNOWN_VEHICLE_CLASSES);
    return fallback || '';
  }

  if (candidate === 'DE' || candidate === 'VEHICULO') {
    const fallback = findKnownPhrase(normalizedFallbackText, KNOWN_VEHICLE_CLASSES);
    return fallback || '';
  }

  return candidate;
};

const normalizeCapacity = (value: string): string => {
  const candidates = extractNumericGroups(value).filter((candidate) => candidate.length >= 1 && candidate.length <= 3);

  if (candidates.length) {
    return candidates[candidates.length - 1];
  }

  return normalizeNumericCandidate(value, 1, 3);
};

const normalizeOwner = (value: string): string => {
  const candidate = cleanCandidate(value)
    .replace(
      /\b(?:APELLIDOS Y NOMBRES|APELLIDO S Y NOMBRE S|APELLIDO S Y NOMBRES|NOMBRES Y APELLIDOS|RAZON SOCIAL|PROPIETARIO|TITULAR)\b/g,
      ''
    )
    .replace(/\b(?:IDENTIFICACION|CEDULA|DOCUMENTO|C C|CC|NO)\b/g, ' ')
    .replace(/\b\d{5,15}\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!candidate) {
    return '';
  }

  return candidate;
};

const inferVehicleType = (text: string): ExtractedVehicleType | null => {
  if (text.includes('PICK UP') || text.includes('PICKUP')) return 'pickup';
  if (text.includes('HATCHBACK') || text.includes('HB')) return 'hatchback';
  if (text.includes('SUV') || text.includes('CAMPERO') || text.includes('CAMIONETA')) return 'suv';
  if (text.includes('SEDAN') || text.includes('AUTOMOVIL')) return 'sedan';
  return null;
};

type StructuredScanField =
  | 'placa'
  | 'marca'
  | 'linea'
  | 'a\u00f1o'
  | 'color'
  | 'cilindrada'
  | 'claseVehiculo'
  | 'servicio'
  | 'tipoCarroceria'
  | 'capacidad'
  | 'numeroMotor'
  | 'vin'
  | 'numeroChasis'
  | 'propietario'
  | 'identificacionPropietario';

type StructuredCardScanZone = {
  field: StructuredScanField;
  x: number;
  y: number;
  width: number;
  height: number;
  scale?: number;
};

type StructuredZoneOcrConfig = {
  psm: number;
  whitelist?: string;
  preserveSpaces?: boolean;
  dpi?: number;
};

const STRUCTURED_CARD_SCAN_ZONES: StructuredCardScanZone[] = [
  { field: 'placa', x: 0.015, y: 0.268, width: 0.135, height: 0.082, scale: 2.4 },
  { field: 'marca', x: 0.195, y: 0.275, width: 0.16, height: 0.07, scale: 2 },
  { field: 'linea', x: 0.49, y: 0.275, width: 0.29, height: 0.07, scale: 1.95 },
  { field: 'a\u00f1o', x: 0.855, y: 0.275, width: 0.1, height: 0.07, scale: 2.1 },
  { field: 'cilindrada', x: 0.02, y: 0.405, width: 0.13, height: 0.07, scale: 2.1 },
  { field: 'color', x: 0.195, y: 0.405, width: 0.31, height: 0.07, scale: 1.95 },
  { field: 'servicio', x: 0.73, y: 0.405, width: 0.22, height: 0.07, scale: 2 },
  { field: 'claseVehiculo', x: 0.02, y: 0.53, width: 0.22, height: 0.07, scale: 2.05 },
  { field: 'tipoCarroceria', x: 0.3, y: 0.53, width: 0.16, height: 0.07, scale: 2 },
  { field: 'capacidad', x: 0.805, y: 0.53, width: 0.08, height: 0.07, scale: 2.25 },
  { field: 'numeroMotor', x: 0.015, y: 0.648, width: 0.295, height: 0.082, scale: 2.35 },
  { field: 'vin', x: 0.575, y: 0.648, width: 0.305, height: 0.082, scale: 2.35 },
  { field: 'numeroChasis', x: 0.555, y: 0.768, width: 0.335, height: 0.082, scale: 2.35 },
  { field: 'propietario', x: 0.015, y: 0.902, width: 0.67, height: 0.075, scale: 2.4 },
  { field: 'identificacionPropietario', x: 0.685, y: 0.902, width: 0.245, height: 0.075, scale: 2.4 },
];

const getStructuredZoneOcrConfig = (field: StructuredScanField): StructuredZoneOcrConfig => {
  switch (field) {
    case 'placa':
      return {
        psm: OCR_PSM_SINGLE_WORD,
        whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        preserveSpaces: false,
        dpi: 420,
      };
    case 'año':
    case 'cilindrada':
    case 'capacidad':
    case 'identificacionPropietario':
      return {
        psm: OCR_PSM_SINGLE_WORD,
        whitelist: '0123456789.',
        preserveSpaces: false,
        dpi: 430,
      };
    case 'vin':
    case 'numeroMotor':
    case 'numeroChasis':
      return {
        psm: OCR_PSM_SINGLE_LINE,
        whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-',
        preserveSpaces: false,
        dpi: 430,
      };
    case 'propietario':
      return {
        psm: OCR_PSM_SINGLE_LINE,
        whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ .-',
        preserveSpaces: true,
        dpi: 380,
      };
    case 'marca':
    case 'linea':
    case 'color':
    case 'claseVehiculo':
    case 'servicio':
    case 'tipoCarroceria':
      return {
        psm: OCR_PSM_SINGLE_LINE,
        whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .-',
        preserveSpaces: true,
        dpi: 390,
      };
    default:
      return {
        psm: OCR_PSM_SINGLE_BLOCK,
        preserveSpaces: true,
        dpi: 360,
      };
  }
};

const parseVehicleCardText = (rawText: string, confidence: number): VehicleCardReaderResult => {
  const normalizedText = normalizeForSearch(rawText);
  const lines = rawText
    .split(/\r?\n/)
    .map(normalizeLine)
    .filter(Boolean);
  const joinedLines = lines.join(' ');

  const placa = extractPreferredPlate(extractLabeledValue(lines, LABEL_ALIASES.placa), ...lines);
  const marca = normalizeBrand(extractLabeledValue(lines, LABEL_ALIASES.marca), normalizedText);
  const linea = cleanCandidate(extractLabeledValue(lines, LABEL_ALIASES.modelo));
  const modelo = linea;
  const año =
    extractYear(extractLabeledValue(lines, LABEL_ALIASES.año)) ||
    extractYear(normalizedText) ||
    null;
  const color = normalizeColor(extractLabeledValue(lines, LABEL_ALIASES.color), normalizedText);
  const cilindrada = cleanCandidate(extractLabeledValue(lines, LABEL_ALIASES.cilindrada));
  const claseVehiculo = cleanCandidate(extractLabeledValue(lines, LABEL_ALIASES.claseVehiculo));
  const servicio = cleanCandidate(extractLabeledValue(lines, LABEL_ALIASES.servicio));
  const numeroMotor = cleanCandidate(extractLabeledValue(lines, LABEL_ALIASES.numeroMotor));
  const capacidad = cleanCandidate(extractLabeledValue(lines, LABEL_ALIASES.capacidad));
  const vin =
    extractVin(normalizedText) ||
    extractVin(extractLabeledValue(lines, LABEL_ALIASES.vin).replace(/\s+/g, '')) ||
    '';
  const numeroChasis = normalizeMechanicalValue(
    extractLabeledValue(lines, LABEL_ALIASES.numeroChasis)
  );
  const tipoCarroceria = cleanCandidate(extractLabeledValue(lines, LABEL_ALIASES.carroceria));
  const propietario = cleanCandidate(extractLabeledValue(lines, LABEL_ALIASES.propietario));
  const identificacionLabeled = cleanCandidate(
    extractLabeledValue(lines, LABEL_ALIASES.identificacion)
  );
  const identificacionPropietario =
    extractIdentification(identificacionLabeled) ||
    extractIdentification(normalizedText) ||
    '';
  const prenda = cleanCandidate(extractLabeledValue(lines, LABEL_ALIASES.prenda));
  const tipoVehiculo = inferVehicleType(`${tipoCarroceria} ${claseVehiculo} ${normalizedText}`);

  const extracted: VehicleCardExtractedData = {
    ...emptyExtractedData(),
    placa,
    marca,
    modelo,
    año,
    color,
    vin,
    linea,
    cilindrada,
    claseVehiculo,
    servicio,
    tipoCarroceria,
    numeroMotor,
    capacidad,
    numeroChasis,
    propietario,
    identificacionPropietario,
    prenda,
    tipoVehiculo,
  };

  const detectedFields = [
    extracted.placa,
    extracted.marca,
    extracted.modelo,
    extracted.año,
    extracted.color,
    extracted.vin,
    extracted.linea,
    extracted.cilindrada,
    extracted.claseVehiculo,
    extracted.servicio,
    extracted.tipoCarroceria,
    extracted.numeroMotor,
    extracted.capacidad,
    extracted.numeroChasis,
    extracted.propietario,
    extracted.identificacionPropietario,
    extracted.prenda,
    extracted.tipoVehiculo,
  ].filter(Boolean).length;

  return {
    rawText,
    confidence: calculateVehicleCardConfidence(extracted, confidence),
    extracted,
    detectedFields,
  };
};

const parseVehicleCardRecognition = (
  rawText: string,
  confidence: number,
  blocks?: OcrRecognitionBlock[] | null
): VehicleCardReaderResult => {
  const normalizedText = normalizeForSearch(rawText);
  const lines = rawText
    .split(/\r?\n/)
    .map(normalizeLine)
    .filter(Boolean);
  const joinedLines = lines.join(' ');
  const layoutLines = buildLayoutLines(blocks);

  const resolveFieldValue = (
    labels: readonly string[],
    strategy: 'text' | 'numeric' | 'name' | 'alphanumeric' = 'text',
    preferBelow = false
  ) => {
    const inlineValue =
      extractLabeledValueFromLayout(layoutLines, labels) || extractLabeledValue(lines, labels);
    const belowValue = extractValueBelowLabel(layoutLines, lines, labels);

    if (preferBelow) {
      return pickBestExtractedValue(belowValue, inlineValue, strategy);
    }

    return pickBestExtractedValue(inlineValue, belowValue, strategy);
  };

  const placa = extractPreferredPlate(
    resolveFieldValue(LABEL_ALIASES.placa, 'alphanumeric'),
    ...lines
  );
  const marca = normalizeBrand(resolveFieldValue(LABEL_ALIASES.marca), normalizedText);
  const linea = cleanCandidate(resolveFieldValue(LABEL_ALIASES.modelo));
  const modelo = linea;
  const yearValue =
    extractYear(resolveFieldValue(LABEL_ALIASES['a\u00f1o'], 'numeric')) ||
    extractYear(normalizedText) ||
    null;
  const color = normalizeColor(resolveFieldValue(LABEL_ALIASES.color), normalizedText);
  const cilindrada = normalizeCilindrada(resolveFieldValue(LABEL_ALIASES.cilindrada, 'numeric'));
  const claseVehiculo = normalizeVehicleClass(
    resolveFieldValue(LABEL_ALIASES.claseVehiculo),
    normalizedText
  );
  const servicio = normalizeService(resolveFieldValue(LABEL_ALIASES.servicio), normalizedText);
  const numeroMotor = normalizeMechanicalValue(
    resolveFieldValue(LABEL_ALIASES.numeroMotor, 'alphanumeric')
  );
  const capacidad = normalizeCapacity(resolveFieldValue(LABEL_ALIASES.capacidad, 'numeric'));
  const vinLabeled = cleanCandidate(resolveFieldValue(LABEL_ALIASES.vin, 'alphanumeric')).replace(/\s+/g, '');
  const numeroChasisLabeled = normalizeMechanicalValue(
    resolveFieldValue(LABEL_ALIASES.numeroChasis, 'alphanumeric')
  );
  const vin = extractVinLoose(
    vinLabeled,
    numeroChasisLabeled,
    normalizedText,
    joinedLines,
    ...lines
  );
  const numeroChasis = numeroChasisLabeled;
  const tipoCarroceria = cleanCandidate(resolveFieldValue(LABEL_ALIASES.carroceria));
  const propietario =
    normalizeOwner(resolveFieldValue(LABEL_ALIASES.propietario, 'name', true)) ||
    normalizeOwner(resolveFieldValue(LABEL_ALIASES.propietario, 'name'));
  const identificacionLabeled = cleanCandidate(
    resolveFieldValue(LABEL_ALIASES.identificacion, 'numeric')
  );
  const identificacionPropietario =
    extractIdentification(identificacionLabeled) ||
    extractIdentification(normalizedText) ||
    '';
  const prenda = cleanCandidate(resolveFieldValue(LABEL_ALIASES.prenda));
  const tipoVehiculo = inferVehicleType(`${tipoCarroceria} ${claseVehiculo} ${normalizedText}`);

  const extracted: VehicleCardExtractedData = {
    ...emptyExtractedData(),
    placa,
    marca,
    modelo,
    ['a\u00f1o']: yearValue,
    color,
    vin,
    linea,
    cilindrada,
    claseVehiculo,
    servicio,
    tipoCarroceria,
    numeroMotor,
    capacidad,
    numeroChasis,
    propietario,
    identificacionPropietario,
    prenda,
    tipoVehiculo,
  };

  const detectedFields = [
    extracted.placa,
    extracted.marca,
    extracted.modelo,
    extracted['a\u00f1o'],
    extracted.color,
    extracted.vin,
    extracted.linea,
    extracted.cilindrada,
    extracted.claseVehiculo,
    extracted.servicio,
    extracted.tipoCarroceria,
    extracted.numeroMotor,
    extracted.capacidad,
    extracted.numeroChasis,
    extracted.propietario,
    extracted.identificacionPropietario,
    extracted.prenda,
    extracted.tipoVehiculo,
  ].filter(Boolean).length;

  return {
    rawText,
    confidence,
    extracted,
    detectedFields,
  };
};

const loadImageElement = (file: Blob): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('No se pudo cargar la imagen de la tarjeta.'));
    };

    image.src = objectUrl;
  });

const createCanvas = (width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  return canvas;
};

type CanvasBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type PreparedCardOcrImage = {
  canvas: HTMLCanvasElement;
  blob: Blob;
  contentBox: CanvasBox;
};

const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error('No se pudo preparar la imagen para OCR.'));
    }, 'image/png');
  });

const renderBlobToCanvas = async (file: Blob, scaleFactor = 1): Promise<HTMLCanvasElement> => {
  const image = await loadImageElement(file);
  const canvas = createCanvas(
    Math.max(1, Math.round(image.width * scaleFactor)),
    Math.max(1, Math.round(image.height * scaleFactor))
  );
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('No se pudo preparar la imagen de la tarjeta.');
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  return canvas;
};

const renderBlobToLandscapeCanvas = async (file: Blob): Promise<HTMLCanvasElement> => {
  const image = await loadImageElement(file);
  const sourceWidth = Math.max(1, image.width);
  const sourceHeight = Math.max(1, image.height);
  const rotate = sourceHeight > sourceWidth;
  const canvas = createCanvas(rotate ? sourceHeight : sourceWidth, rotate ? sourceWidth : sourceHeight);
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('No se pudo preparar la imagen de la tarjeta.');
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';

  if (rotate) {
    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate(Math.PI / 2);
    context.drawImage(image, -sourceWidth / 2, -sourceHeight / 2, sourceWidth, sourceHeight);
  } else {
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
  }

  return canvas;
};

const prepareCardImageForOcr = async (file: Blob): Promise<PreparedCardOcrImage> => {
  const sourceCanvas = await renderBlobToLandscapeCanvas(file);
  const canvas = createCanvas(OCR_CARD_BASE_WIDTH, OCR_CARD_BASE_HEIGHT);
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('No se pudo preparar la tarjeta para OCR.');
  }

  const maxWidth = canvas.width - OCR_CARD_MARGIN * 2;
  const maxHeight = canvas.height - OCR_CARD_MARGIN * 2;
  const fitScale = Math.min(maxWidth / sourceCanvas.width, maxHeight / sourceCanvas.height);
  const drawWidth = Math.max(1, Math.round(sourceCanvas.width * fitScale));
  const drawHeight = Math.max(1, Math.round(sourceCanvas.height * fitScale));
  const offsetX = Math.round((canvas.width - drawWidth) / 2);
  const offsetY = Math.round((canvas.height - drawHeight) / 2);

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(sourceCanvas, offsetX, offsetY, drawWidth, drawHeight);

  return {
    canvas,
    blob: await canvasToBlob(canvas),
    contentBox: {
      x: offsetX,
      y: offsetY,
      width: drawWidth,
      height: drawHeight,
    },
  };
};

const scaleCanvasBox = (box: CanvasBox, scaleX: number, scaleY: number): CanvasBox => ({
  x: Math.round(box.x * scaleX),
  y: Math.round(box.y * scaleY),
  width: Math.round(box.width * scaleX),
  height: Math.round(box.height * scaleY),
});

const cropCardScanZone = (
  sourceCanvas: HTMLCanvasElement,
  contentBox: CanvasBox,
  zone: StructuredCardScanZone
): HTMLCanvasElement => {
  const left = Math.max(0, Math.round(contentBox.x + contentBox.width * zone.x));
  const top = Math.max(0, Math.round(contentBox.y + contentBox.height * zone.y));
  const width = Math.max(1, Math.round(contentBox.width * zone.width));
  const height = Math.max(1, Math.round(contentBox.height * zone.height));
  const scale = zone.scale || OCR_REGION_SCALE;
  const padding = Math.max(12, Math.round(14 * scale));
  const canvas = createCanvas(
    Math.max(1, Math.round(width * scale)) + padding * 2,
    Math.max(1, Math.round(height * scale)) + padding * 2
  );
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('No se pudo recortar una zona de la tarjeta.');
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(
    sourceCanvas,
    left,
    top,
    width,
    height,
    padding,
    padding,
    canvas.width - padding * 2,
    canvas.height - padding * 2
  );

  return canvas;
};

const getDocumentCanvasSize = (imageWidth: number, imageHeight: number) => {
  const baseWidth = OCR_DOCUMENT_BASE_HEIGHT;
  const baseHeight = OCR_DOCUMENT_BASE_WIDTH;
  const usableWidth = baseWidth - OCR_DOCUMENT_MARGIN * 2;
  const usableHeight = baseHeight - OCR_DOCUMENT_MARGIN * 2;
  const fitScale = Math.min(usableWidth / imageWidth, usableHeight / imageHeight);
  const upscaleFactor = fitScale < 1 ? 1 / fitScale : 1;
  const maxScale = OCR_DOCUMENT_MAX_EDGE / Math.max(baseWidth, baseHeight);
  const pageScale = Math.min(upscaleFactor, maxScale);

  return {
    width: Math.max(1, Math.round(baseWidth * pageScale)),
    height: Math.max(1, Math.round(baseHeight * pageScale)),
    margin: Math.max(24, Math.round(OCR_DOCUMENT_MARGIN * pageScale)),
  };
};

const createPdfPageImageForOcr = async (file: Blob): Promise<Blob> => {
  const image = await loadImageElement(file);
  const pageSize = getDocumentCanvasSize(image.width, image.height);
  const canvas = createCanvas(pageSize.width, pageSize.height);
  const context = canvas.getContext('2d');

  if (!context) {
    return file;
  }

  const maxWidth = pageSize.width - pageSize.margin * 2;
  const maxHeight = pageSize.height - pageSize.margin * 2;
  const fitScale = Math.min(maxWidth / image.width, maxHeight / image.height);
  const drawWidth = Math.max(1, Math.round(image.width * fitScale));
  const drawHeight = Math.max(1, Math.round(image.height * fitScale));
  const offsetX = Math.round((pageSize.width - drawWidth) / 2);
  const offsetY = Math.round((pageSize.height - drawHeight) / 2);

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, pageSize.width, pageSize.height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

  return canvasToBlob(canvas);
};

const applyCanvasOcrEnhancement = (canvas: HTMLCanvasElement) => {
  const context = canvas.getContext('2d');

  if (!context) {
    return;
  }

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  for (let index = 0; index < pixels.length; index += 4) {
    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];
    const grayscale = 0.299 * red + 0.587 * green + 0.114 * blue;
    const contrasted = Math.max(0, Math.min(255, (grayscale - 128) * 1.7 + 128));
    const boosted = contrasted > 182 ? 255 : contrasted < 68 ? 0 : contrasted;

    pixels[index] = boosted;
    pixels[index + 1] = boosted;
    pixels[index + 2] = boosted;
  }

  context.putImageData(imageData, 0, 0);
};

const enhanceImageForOcr = async (file: Blob): Promise<Blob> => {
  const image = await loadImageElement(file);
  const scaleFactor = image.width < 1500 ? 2 : 1.35;
  const canvas = await renderBlobToCanvas(file, scaleFactor);

  applyCanvasOcrEnhancement(canvas);
  return canvasToBlob(canvas);
};

const renderBlobWithFilter = async (
  file: Blob,
  filter: string,
  scaleFactor = 1
): Promise<HTMLCanvasElement> => {
  const image = await loadImageElement(file);
  const canvas = createCanvas(
    Math.max(1, Math.round(image.width * scaleFactor)),
    Math.max(1, Math.round(image.height * scaleFactor))
  );
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('No se pudo preparar una zona de la tarjeta para OCR.');
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.filter = filter;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  context.filter = 'none';

  return canvas;
};

const enhanceStructuredZoneForOcr = async (
  file: Blob,
  field: StructuredScanField
): Promise<Blob> => {
  switch (field) {
    case 'placa':
    case 'vin':
    case 'numeroMotor':
    case 'numeroChasis':
    case 'identificacionPropietario':
    case 'año':
    case 'cilindrada':
    case 'capacidad': {
      const canvas = await renderBlobWithFilter(
        file,
        'grayscale(100%) contrast(205%) brightness(112%)',
        1.28
      );
      applyCanvasOcrEnhancement(canvas);
      return canvasToBlob(canvas);
    }
    case 'propietario': {
      const canvas = await renderBlobWithFilter(
        file,
        'grayscale(100%) contrast(170%) brightness(108%)',
        1.18
      );
      return canvasToBlob(canvas);
    }
    default: {
      const canvas = await renderBlobWithFilter(
        file,
        'grayscale(100%) contrast(182%) brightness(107%)',
        1.18
      );
      return canvasToBlob(canvas);
    }
  }
};

type OcrProgressState = {
  start: number;
  end: number;
  onProgress?: (progress: number) => void;
};

const buildProgressLogger = (state: OcrProgressState) => {
  return (message: { status?: string; progress?: number }) => {
    if (message.status === 'recognizing text' && typeof message.progress === 'number') {
      const span = state.end - state.start;
      state.onProgress?.(Math.round(state.start + message.progress * span));
    }
  };
};

const createOcrWorker = async (progressState: OcrProgressState) => {
  const { createWorker, OEM, PSM } = await import('tesseract.js');
  const worker = await createWorker('spa+eng', OEM.LSTM_ONLY, {
    logger: buildProgressLogger(progressState),
  });

  await worker.setParameters({
    tessedit_pageseg_mode: PSM.SPARSE_TEXT,
    preserve_interword_spaces: '1',
    user_defined_dpi: '300',
    tessedit_char_whitelist: '',
  });

  return worker;
};

type OcrWorker = Awaited<ReturnType<typeof createOcrWorker>>;

const runRecognition = async (
  worker: OcrWorker,
  progressState: OcrProgressState,
  file: File | Blob,
  startProgress: number,
  endProgress: number,
  onProgress?: (progress: number) => void
) => {
  progressState.start = startProgress;
  progressState.end = endProgress;
  progressState.onProgress = onProgress;
  onProgress?.(startProgress);
  await worker.setParameters({
    tessedit_pageseg_mode: OCR_PSM_SPARSE_TEXT as never,
    preserve_interword_spaces: '1',
    user_defined_dpi: '300',
    tessedit_char_whitelist: '',
  });

  const recognition = await worker.recognize(file, {
    rotateAuto: true,
  }, {
    blocks: true,
  });
  onProgress?.(endProgress);

  return parseVehicleCardRecognition(
    recognition.data.text || '',
    recognition.data.confidence || 0,
    recognition.data.blocks as OcrRecognitionBlock[] | null | undefined
  );
};

const isValidPlate = (value: string) =>
  /\b[A-Z]{3}\d{3}\b|\b[A-Z]{3}\d{2}[A-Z]\b/.test(value);

const isValidVin = (value: string) =>
  /^[A-HJ-NPR-Z0-9]{17}$/.test(value);

const isValidIdentification = (value: string) =>
  /^\d{5,15}$/.test(value);

const scoreExtractedText = (field: ExtractedTextField, value: string): number => {
  const candidate = cleanCandidate(value);
  if (!candidate) return 0;

  switch (field) {
    case 'placa':
      return isValidPlate(candidate) ? 100 : 10;
    case 'vin':
      if (VIN_NOISE_FRAGMENT_REGEX.test(candidate)) return 0;
      if (isValidVin(candidate)) return 100;
      return /^[A-Z0-9]{6,20}$/.test(candidate) ? 45 : 5;
    case 'numeroChasis':
      if (!isLikelyMechanicalCode(candidate)) return 0;
      if (/^(?=.*\d)(?=.*[A-Z])[A-Z0-9-]{5,25}$/.test(candidate)) {
        return 82 + Math.min(candidate.length, 10);
      }
      if (isValidVin(candidate)) return 72;
      return /^[A-Z0-9-]{5,25}$/.test(candidate) ? 48 : 0;
    case 'marca':
      if (KNOWN_BRANDS.includes(candidate)) return 95;
      return /^[A-Z ]{2,20}$/.test(candidate) ? 40 : 5;
    case 'identificacionPropietario':
      if (isValidIdentification(candidate)) {
        return candidate.length <= 10 ? 92 : 78;
      }
      return 5;
    case 'numeroMotor':
      if (/^(?=.*[A-Z])(?=.*\d)[A-Z0-9-]{4,25}$/.test(candidate)) return 74 + candidate.length;
      return /^[A-Z0-9-]{4,25}$/.test(candidate) ? 48 + candidate.length : 5;
    case 'propietario':
      if (/\d/.test(candidate)) return 5;
      return candidate.split(' ').length >= 2 && candidate.length <= 60 ? 82 : 24;
    case 'color':
      return Object.keys(COLOR_ALIASES).some((color) => candidate.includes(color)) ? 70 : 25;
    case 'cilindrada':
      return /^\d{2,5}$/.test(candidate) ? 65 : 10;
    case 'capacidad':
      return /^\d{1,4}(?:\s+\d{1,4})?$/.test(candidate) ? 55 : 10;
    case 'modelo':
    case 'linea':
      if (candidate.length > 40) return 10;
      return candidate.length >= 2 ? 58 : 10;
    case 'claseVehiculo':
      if (KNOWN_VEHICLE_CLASSES.includes(candidate)) return 75;
      return candidate.length <= 30 ? 20 : 10;
    case 'servicio':
      return Object.keys(SERVICE_ALIASES).some((service) => candidate.includes(service)) ? 70 : 20;
    case 'tipoCarroceria':
    case 'prenda':
      return candidate.length <= 30 ? 45 : 10;
    default:
      return candidate.length <= 40 ? 35 : 5;
  }
};

const pickFieldTieBreaker = (
  field: ExtractedTextField,
  primary: string,
  secondary: string
) => {
  switch (field) {
    case 'placa':
      return isValidPlate(primary) ? primary : secondary;
    case 'propietario':
    case 'numeroMotor':
      return secondary.length >= primary.length ? secondary : primary;
    case 'identificacionPropietario':
      return secondary.length <= primary.length ? secondary : primary;
    case 'capacidad':
      return secondary.length <= primary.length ? secondary : primary;
    case 'cilindrada':
      if (secondary.length >= 3 && primary.length < 3) return secondary;
      return secondary.length >= primary.length ? secondary : primary;
    case 'claseVehiculo':
      return KNOWN_VEHICLE_CLASSES.includes(secondary) ? secondary : primary;
    default:
      return primary;
  }
};

const calculateYearConfidence = (value: number | null): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0;
  }

  const currentYear = new Date().getFullYear() + 1;
  return value >= 1900 && value <= currentYear ? 85 : 10;
};

const calculateVehicleCardConfidence = (
  extracted: VehicleCardExtractedData,
  ocrConfidence: number
) => {
  const fieldScores: number[] = [
    scoreExtractedText('placa', extracted.placa),
    scoreExtractedText('marca', extracted.marca),
    scoreExtractedText('modelo', extracted.modelo),
    calculateYearConfidence(extracted['a\u00f1o']),
    scoreExtractedText('color', extracted.color),
    scoreExtractedText('vin', extracted.vin),
    scoreExtractedText('linea', extracted.linea),
    scoreExtractedText('cilindrada', extracted.cilindrada),
    scoreExtractedText('claseVehiculo', extracted.claseVehiculo),
    scoreExtractedText('servicio', extracted.servicio),
    scoreExtractedText('tipoCarroceria', extracted.tipoCarroceria),
    scoreExtractedText('numeroMotor', extracted.numeroMotor),
    scoreExtractedText('capacidad', extracted.capacidad),
    scoreExtractedText('numeroChasis', extracted.numeroChasis),
    scoreExtractedText('propietario', extracted.propietario),
    scoreExtractedText('identificacionPropietario', extracted.identificacionPropietario),
    scoreExtractedText('prenda', extracted.prenda),
  ];
  const qualityAverage = fieldScores.reduce((sum, score) => sum + score, 0) / fieldScores.length;
  const completeness = (countDetectedFields(extracted) / 18) * 100;
  const normalizedOcrConfidence = Math.max(0, Math.min(100, ocrConfidence));
  const finalScore =
    qualityAverage * 0.55 +
    completeness * 0.3 +
    normalizedOcrConfidence * 0.15;

  return Math.round(Math.max(0, Math.min(99, finalScore)));
};

const pickPreferredText = (
  field: ExtractedTextField,
  primary: string,
  secondary: string
) => {
  const primaryScore = scoreExtractedText(field, primary);
  const secondaryScore = scoreExtractedText(field, secondary);

  if (secondaryScore > primaryScore) {
    return secondary;
  }

  if (secondaryScore === primaryScore && secondary && primary && secondary !== primary) {
    return pickFieldTieBreaker(field, primary, secondary);
  }

  return primary;
};

const pickPreferredStructuredText = (
  field: ExtractedTextField,
  primary: string,
  secondary: string
) => {
  const primaryScore = scoreExtractedText(field, primary);
  const secondaryScore = scoreExtractedText(field, secondary);

  if (!secondaryScore) {
    return primaryScore ? primary : '';
  }

  if (secondaryScore >= primaryScore) {
    return secondary;
  }

  return primary;
};

const pickPreferredYear = (
  primary: number | null,
  secondary: number | null
) => {
  const currentYear = new Date().getFullYear() + 1;
  const isPrimaryValid = typeof primary === 'number' && primary >= 1900 && primary <= currentYear;
  const isSecondaryValid = typeof secondary === 'number' && secondary >= 1900 && secondary <= currentYear;

  if (!isPrimaryValid && isSecondaryValid) return secondary;
  return primary;
};

const countDetectedFields = (extracted: VehicleCardExtractedData) =>
  [
    extracted.placa,
    extracted.marca,
    extracted.modelo,
    extracted.año,
    extracted.color,
    extracted.vin,
    extracted.linea,
    extracted.cilindrada,
    extracted.claseVehiculo,
    extracted.servicio,
    extracted.tipoCarroceria,
    extracted.numeroMotor,
    extracted.capacidad,
    extracted.numeroChasis,
    extracted.propietario,
    extracted.identificacionPropietario,
    extracted.prenda,
    extracted.tipoVehiculo,
  ].filter(Boolean).length;

const extractStructuredZoneScoreValue = (
  field: StructuredScanField,
  rawText: string
): string | number | null => {
  const normalizedText = normalizeForSearch(rawText);

  switch (field) {
    case 'placa':
      return extractPreferredPlate(stripFieldLabels(rawText, LABEL_ALIASES.placa), rawText);
    case 'marca':
      return normalizeBrand(stripFieldLabels(rawText, LABEL_ALIASES.marca), normalizedText);
    case 'linea':
      return cleanCandidate(stripFieldLabels(rawText, LABEL_ALIASES.modelo));
    case 'año':
      return extractYear(stripFieldLabels(rawText, LABEL_ALIASES['año'])) || extractYear(normalizedText) || null;
    case 'color':
      return normalizeColor(stripFieldLabels(rawText, LABEL_ALIASES.color), normalizedText);
    case 'cilindrada':
      return normalizeCilindrada(stripFieldLabels(rawText, LABEL_ALIASES.cilindrada) || normalizedText);
    case 'claseVehiculo':
      return normalizeVehicleClass(stripFieldLabels(rawText, LABEL_ALIASES.claseVehiculo), normalizedText);
    case 'servicio':
      return normalizeService(stripFieldLabels(rawText, LABEL_ALIASES.servicio), normalizedText);
    case 'tipoCarroceria':
      return cleanCandidate(stripFieldLabels(rawText, LABEL_ALIASES.carroceria));
    case 'capacidad':
      return normalizeCapacity(stripFieldLabels(rawText, LABEL_ALIASES.capacidad) || normalizedText);
    case 'numeroMotor':
      return normalizeMechanicalValue(stripFieldLabels(rawText, LABEL_ALIASES.numeroMotor) || normalizedText);
    case 'vin':
      return extractVinLoose(stripFieldLabels(rawText, LABEL_ALIASES.vin), normalizedText);
    case 'numeroChasis':
      return normalizeMechanicalValue(
        stripFieldLabels(rawText, LABEL_ALIASES.numeroChasis) || normalizedText
      );
    case 'propietario':
      return normalizeOwner(stripFieldLabels(rawText, LABEL_ALIASES.propietario) || normalizedText);
    case 'identificacionPropietario':
      return (
        extractIdentification(stripFieldLabels(rawText, LABEL_ALIASES.identificacion)) ||
        extractIdentification(normalizedText) ||
        ''
      );
    default:
      return cleanCandidate(rawText);
  }
};

const scoreStructuredZoneTextCandidate = (
  field: StructuredScanField,
  rawText: string,
  confidence: number
) => {
  const normalizedText = cleanCandidate(rawText);
  if (!normalizedText) {
    return 0;
  }

  const extractedValue = extractStructuredZoneScoreValue(field, rawText);
  const fieldScore =
    field === 'año'
      ? calculateYearConfidence(
          typeof extractedValue === 'number'
            ? extractedValue
            : extractYear(String(extractedValue || ''))
        )
      : scoreExtractedText(field as ExtractedTextField, String(extractedValue || ''));

  return (
    fieldScore * 1.75 +
    Math.max(0, Math.min(100, confidence)) * 0.45 +
    Math.min(20, normalizedText.length * 0.4)
  );
};

const runStructuredZoneRecognition = async (
  worker: OcrWorker,
  field: StructuredScanField,
  zoneBlob: Blob
) => {
  const config = getStructuredZoneOcrConfig(field);
  const attemptBlobs = [zoneBlob];

  try {
    attemptBlobs.push(await enhanceStructuredZoneForOcr(zoneBlob, field));
  } catch {
    // Si la mejora puntual falla, continuamos con la zona original.
  }

  let bestText = '';
  let bestConfidence = 0;
  let bestScore = 0;

  for (const attemptBlob of attemptBlobs) {
    await worker.setParameters({
      tessedit_pageseg_mode: config.psm as never,
      preserve_interword_spaces: config.preserveSpaces ? '1' : '0',
      user_defined_dpi: String(config.dpi || 300),
      tessedit_char_whitelist: config.whitelist || '',
    });

    const recognition = await worker.recognize(attemptBlob, {
      rotateAuto: false,
    });
    const candidateText = (recognition.data.text || '').trim();
    const candidateConfidence = recognition.data.confidence || 0;
    const candidateScore = scoreStructuredZoneTextCandidate(
      field,
      candidateText,
      candidateConfidence
    );

    if (
      candidateScore > bestScore ||
      (!bestText && candidateText) ||
      (candidateScore === bestScore && candidateConfidence > bestConfidence)
    ) {
      bestText = candidateText;
      bestConfidence = candidateConfidence;
      bestScore = candidateScore;
    }
  }

  return {
    text: bestText,
    confidence: bestConfidence,
  };
};

const resolveFieldValueFromRegion = (
  rawText: string,
  labels: readonly string[],
  strategy: 'text' | 'numeric' | 'name' | 'alphanumeric' = 'text'
) => {
  const lines = rawText
    .split(/\r?\n/)
    .map(normalizeLine)
    .filter(Boolean);
  const labeledValue = extractLabeledValue(lines, labels);
  const strippedValue = stripFieldLabels(lines.join(' '), labels);

  return pickBestExtractedValue(labeledValue, strippedValue, strategy);
};

const extractStructuredFieldValue = (
  field: StructuredScanField,
  rawText: string,
  fullText: string
): string | number | null => {
  const normalizedRegionText = normalizeForSearch(rawText);
  const fallbackText = `${fullText} ${normalizedRegionText}`.trim();

  switch (field) {
    case 'placa':
      return extractPreferredPlate(
        resolveFieldValueFromRegion(rawText, LABEL_ALIASES.placa, 'alphanumeric'),
        rawText
      );
    case 'marca':
      return normalizeBrand(resolveFieldValueFromRegion(rawText, LABEL_ALIASES.marca), fallbackText);
    case 'linea':
      return cleanCandidate(
        resolveFieldValueFromRegion(rawText, LABEL_ALIASES.modelo) ||
          stripFieldLabels(rawText, LABEL_ALIASES.modelo)
      );
    case 'a\u00f1o':
      return (
        extractYear(resolveFieldValueFromRegion(rawText, LABEL_ALIASES['a\u00f1o'], 'numeric')) ||
        extractYear(normalizedRegionText) ||
        null
      );
    case 'color':
      return normalizeColor(resolveFieldValueFromRegion(rawText, LABEL_ALIASES.color), fallbackText);
    case 'cilindrada':
      return normalizeCilindrada(
        resolveFieldValueFromRegion(rawText, LABEL_ALIASES.cilindrada, 'numeric') ||
          normalizedRegionText
      );
    case 'claseVehiculo':
      return normalizeVehicleClass(
        resolveFieldValueFromRegion(rawText, LABEL_ALIASES.claseVehiculo),
        fallbackText
      );
    case 'servicio':
      return normalizeService(
        resolveFieldValueFromRegion(rawText, LABEL_ALIASES.servicio),
        fallbackText
      );
    case 'tipoCarroceria':
      return cleanCandidate(
        resolveFieldValueFromRegion(rawText, LABEL_ALIASES.carroceria) ||
          stripFieldLabels(rawText, LABEL_ALIASES.carroceria)
      );
    case 'capacidad':
      return normalizeCapacity(
        resolveFieldValueFromRegion(rawText, LABEL_ALIASES.capacidad, 'numeric') ||
          normalizedRegionText
      );
    case 'numeroMotor':
      return normalizeMechanicalValue(
        resolveFieldValueFromRegion(rawText, LABEL_ALIASES.numeroMotor, 'alphanumeric') ||
          normalizedRegionText
      );
    case 'vin':
      return extractVinLoose(
        resolveFieldValueFromRegion(rawText, LABEL_ALIASES.vin, 'alphanumeric'),
        normalizedRegionText
      );
    case 'numeroChasis': {
      const candidate =
        resolveFieldValueFromRegion(rawText, LABEL_ALIASES.numeroChasis, 'alphanumeric') ||
        stripFieldLabels(rawText, LABEL_ALIASES.numeroChasis);
      return normalizeMechanicalValue(candidate);
    }
    case 'propietario':
      return normalizeOwner(
        resolveFieldValueFromRegion(rawText, LABEL_ALIASES.propietario, 'name') ||
          normalizedRegionText
      );
    case 'identificacionPropietario':
      return (
        extractIdentification(
          resolveFieldValueFromRegion(rawText, LABEL_ALIASES.identificacion, 'numeric')
        ) ||
        extractIdentification(normalizedRegionText) ||
        ''
      );
    default:
      return '';
  }
};

const buildStructuredVehicleCardResult = (
  zoneTexts: Partial<Record<StructuredScanField, string>>,
  ocrConfidence: number
): VehicleCardReaderResult => {
  const mergedZoneText = Object.values(zoneTexts).filter(Boolean).join('\n');
  const normalizedZoneText = normalizeForSearch(mergedZoneText);
  const linea = String(extractStructuredFieldValue('linea', zoneTexts.linea || '', normalizedZoneText) || '');
  const claseVehiculo = String(
    extractStructuredFieldValue('claseVehiculo', zoneTexts.claseVehiculo || '', normalizedZoneText) || ''
  );
  const tipoCarroceria = String(
    extractStructuredFieldValue('tipoCarroceria', zoneTexts.tipoCarroceria || '', normalizedZoneText) || ''
  );

  const extracted: VehicleCardExtractedData = {
    ...emptyExtractedData(),
    placa: String(extractStructuredFieldValue('placa', zoneTexts.placa || '', normalizedZoneText) || ''),
    marca: String(extractStructuredFieldValue('marca', zoneTexts.marca || '', normalizedZoneText) || ''),
    modelo: linea,
    ['a\u00f1o']: extractStructuredFieldValue('a\u00f1o', zoneTexts['a\u00f1o'] || '', normalizedZoneText) as number | null,
    color: String(extractStructuredFieldValue('color', zoneTexts.color || '', normalizedZoneText) || ''),
    vin: String(extractStructuredFieldValue('vin', zoneTexts.vin || '', normalizedZoneText) || ''),
    linea,
    cilindrada: String(
      extractStructuredFieldValue('cilindrada', zoneTexts.cilindrada || '', normalizedZoneText) || ''
    ),
    claseVehiculo,
    servicio: String(
      extractStructuredFieldValue('servicio', zoneTexts.servicio || '', normalizedZoneText) || ''
    ),
    tipoCarroceria,
    numeroMotor: String(
      extractStructuredFieldValue('numeroMotor', zoneTexts.numeroMotor || '', normalizedZoneText) || ''
    ),
    capacidad: String(
      extractStructuredFieldValue('capacidad', zoneTexts.capacidad || '', normalizedZoneText) || ''
    ),
    numeroChasis: String(
      extractStructuredFieldValue('numeroChasis', zoneTexts.numeroChasis || '', normalizedZoneText) || ''
    ),
    propietario: String(
      extractStructuredFieldValue('propietario', zoneTexts.propietario || '', normalizedZoneText) || ''
    ),
    identificacionPropietario: String(
      extractStructuredFieldValue(
        'identificacionPropietario',
        zoneTexts.identificacionPropietario || '',
        normalizedZoneText
      ) || ''
    ),
    prenda: '',
    tipoVehiculo: inferVehicleType(`${tipoCarroceria} ${claseVehiculo} ${normalizedZoneText}`),
  };

  return {
    rawText: mergedZoneText,
    confidence: calculateVehicleCardConfidence(extracted, ocrConfidence),
    extracted,
    detectedFields: countDetectedFields(extracted),
  };
};

const runStructuredRecognition = async (
  worker: OcrWorker,
  progressState: OcrProgressState,
  preparedCard: PreparedCardOcrImage,
  startProgress: number,
  endProgress: number,
  onProgress?: (progress: number) => void
) => {
  const zoneTexts: Partial<Record<StructuredScanField, string>> = {};
  const zoneConfidences: number[] = [];
  const totalZones = STRUCTURED_CARD_SCAN_ZONES.length;

  onProgress?.(startProgress);
  await worker.setParameters({
    tessedit_pageseg_mode: OCR_PSM_SINGLE_BLOCK as never,
    preserve_interword_spaces: '1',
    user_defined_dpi: '300',
    tessedit_char_whitelist: '',
  });

  try {
    for (let index = 0; index < totalZones; index += 1) {
      const zone = STRUCTURED_CARD_SCAN_ZONES[index];
      const zoneStart = Math.round(startProgress + ((endProgress - startProgress) * index) / totalZones);
      const zoneEnd = Math.round(
        startProgress + ((endProgress - startProgress) * (index + 1)) / totalZones
      );
      const zoneCanvas = cropCardScanZone(preparedCard.canvas, preparedCard.contentBox, zone);
      const zoneBlob = await canvasToBlob(zoneCanvas);

      progressState.start = zoneStart;
      progressState.end = zoneEnd;
      progressState.onProgress = onProgress;

      const recognition = await runStructuredZoneRecognition(worker, zone.field, zoneBlob);
      const zoneText = recognition.text.trim();

      if (zoneText) {
        zoneTexts[zone.field] = zoneText;
      }

      zoneConfidences.push(recognition.confidence || 0);
    }
  } finally {
    await worker.setParameters({
      tessedit_pageseg_mode: OCR_PSM_SPARSE_TEXT as never,
      preserve_interword_spaces: '1',
      user_defined_dpi: '300',
      tessedit_char_whitelist: '',
    });
  }

  onProgress?.(endProgress);

  const averageConfidence = zoneConfidences.length
    ? zoneConfidences.reduce((sum, value) => sum + value, 0) / zoneConfidences.length
    : 0;

  return buildStructuredVehicleCardResult(zoneTexts, averageConfidence);
};

const mergeVehicleCardResults = (
  baseResult: VehicleCardReaderResult,
  enhancedResult: VehicleCardReaderResult,
  options?: { preferSecondaryFields?: ExtractedTextField[] }
): VehicleCardReaderResult => {
  const preferSecondaryFields = new Set(options?.preferSecondaryFields || []);
  const pickField = (field: ExtractedTextField, primary: string, secondary: string) =>
    preferSecondaryFields.has(field)
      ? pickPreferredStructuredText(field, primary, secondary)
      : pickPreferredText(field, primary, secondary);

  const extracted: VehicleCardExtractedData = {
    ...emptyExtractedData(),
    placa: pickField('placa', baseResult.extracted.placa, enhancedResult.extracted.placa),
    marca: pickField('marca', baseResult.extracted.marca, enhancedResult.extracted.marca),
    modelo: pickField('modelo', baseResult.extracted.modelo, enhancedResult.extracted.modelo),
    año: pickPreferredYear(baseResult.extracted.año, enhancedResult.extracted.año),
    color: pickField('color', baseResult.extracted.color, enhancedResult.extracted.color),
    vin: pickField('vin', baseResult.extracted.vin, enhancedResult.extracted.vin),
    linea: pickField('linea', baseResult.extracted.linea, enhancedResult.extracted.linea),
    cilindrada: pickField('cilindrada', baseResult.extracted.cilindrada, enhancedResult.extracted.cilindrada),
    claseVehiculo: pickField(
      'claseVehiculo',
      baseResult.extracted.claseVehiculo,
      enhancedResult.extracted.claseVehiculo
    ),
    servicio: pickField('servicio', baseResult.extracted.servicio, enhancedResult.extracted.servicio),
    tipoCarroceria: pickField(
      'tipoCarroceria',
      baseResult.extracted.tipoCarroceria,
      enhancedResult.extracted.tipoCarroceria
    ),
    numeroMotor: pickField(
      'numeroMotor',
      baseResult.extracted.numeroMotor,
      enhancedResult.extracted.numeroMotor
    ),
    capacidad: pickField('capacidad', baseResult.extracted.capacidad, enhancedResult.extracted.capacidad),
    numeroChasis: pickField(
      'numeroChasis',
      baseResult.extracted.numeroChasis,
      enhancedResult.extracted.numeroChasis
    ),
    propietario: pickField(
      'propietario',
      baseResult.extracted.propietario,
      enhancedResult.extracted.propietario
    ),
    identificacionPropietario: pickField(
      'identificacionPropietario',
      baseResult.extracted.identificacionPropietario,
      enhancedResult.extracted.identificacionPropietario
    ),
    prenda: pickField('prenda', baseResult.extracted.prenda, enhancedResult.extracted.prenda),
    tipoVehiculo: baseResult.extracted.tipoVehiculo || enhancedResult.extracted.tipoVehiculo,
  };

  return {
    rawText:
      enhancedResult.detectedFields > baseResult.detectedFields
        ? enhancedResult.rawText
        : baseResult.rawText,
    confidence: calculateVehicleCardConfidence(
      extracted,
      Math.max(baseResult.confidence, enhancedResult.confidence)
    ),
    extracted,
    detectedFields: countDetectedFields(extracted),
  };
};

const shouldRetryWithEnhancedPass = (result: VehicleCardReaderResult) =>
  result.detectedFields <= 6 ||
  (
    result.confidence < 68 &&
    (
      !result.extracted.placa ||
      !result.extracted.vin ||
      !result.extracted.numeroMotor ||
      !result.extracted.propietario
    )
  );

const STRUCTURED_PREFERRED_FIELDS: ExtractedTextField[] = [
  'placa',
  'vin',
  'numeroMotor',
  'numeroChasis',
  'propietario',
  'identificacionPropietario',
  'capacidad',
  'cilindrada',
  'claseVehiculo',
];

export const readVehicleCard = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<VehicleCardReaderResult> => {
  const progressState: OcrProgressState = {
    start: 0,
    end: 100,
    onProgress,
  };
  const worker = await createOcrWorker(progressState);

  try {
    // Tesseract.js no procesa PDF como entrada. Para aproximar ese flujo,
    // primero normalizamos la tarjeta en horizontal y luego generamos una pagina tipo documento.
    const preparedCard = await prepareCardImageForOcr(file);
    const documentImage = await createPdfPageImageForOcr(preparedCard.blob).catch(() => preparedCard.blob);
    const baseResult = await runRecognition(worker, progressState, documentImage, 0, 44, onProgress);
    const structuredResult = await runStructuredRecognition(
      worker,
      progressState,
      preparedCard,
      44,
      78,
      onProgress
    );
    const mergedBaseResult = mergeVehicleCardResults(baseResult, structuredResult, {
      preferSecondaryFields: STRUCTURED_PREFERRED_FIELDS,
    });

    if (!shouldRetryWithEnhancedPass(mergedBaseResult)) {
      onProgress?.(100);
      return mergedBaseResult;
    }

    try {
      const enhancedCardBlob = await enhanceImageForOcr(preparedCard.blob);
      const enhancedCardCanvas = await renderBlobToCanvas(enhancedCardBlob);
      const enhancedPreparedCard: PreparedCardOcrImage = {
        canvas: enhancedCardCanvas,
        blob: enhancedCardBlob,
        contentBox: scaleCanvasBox(
          preparedCard.contentBox,
          enhancedCardCanvas.width / preparedCard.canvas.width,
          enhancedCardCanvas.height / preparedCard.canvas.height
        ),
      };
      const enhancedDocumentImage = await createPdfPageImageForOcr(enhancedCardBlob).catch(
        () => enhancedCardBlob
      );
      const enhancedResult = await runRecognition(
        worker,
        progressState,
        enhancedDocumentImage,
        78,
        90,
        onProgress
      );
      const enhancedStructuredResult = await runStructuredRecognition(
        worker,
        progressState,
        enhancedPreparedCard,
        90,
        100,
        onProgress
      );
      onProgress?.(100);
      const mergedEnhancedResult = mergeVehicleCardResults(enhancedResult, enhancedStructuredResult, {
        preferSecondaryFields: STRUCTURED_PREFERRED_FIELDS,
      });
      const mergedResult = mergeVehicleCardResults(mergedBaseResult, mergedEnhancedResult);

      return mergedResult.detectedFields >= mergedBaseResult.detectedFields
        ? mergedResult
        : mergedBaseResult;
    } catch {
      onProgress?.(100);
      return mergedBaseResult;
    }
  } finally {
    await worker.terminate();
  }
};
