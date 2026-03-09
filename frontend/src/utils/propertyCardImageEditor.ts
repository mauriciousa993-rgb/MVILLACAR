export interface PropertyCardImageAdjustments {
  rotation: 0 | 90 | 180 | 270;
  brightness: number;
  contrast: number;
  saturation: number;
  grayscale: number;
  sharpen: number;
  upscale: number;
  binarizeThreshold: number | null;
}

export const DEFAULT_PROPERTY_CARD_IMAGE_ADJUSTMENTS: PropertyCardImageAdjustments = {
  rotation: 0,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  grayscale: 0,
  sharpen: 0,
  upscale: 1,
  binarizeThreshold: null,
};

export const OCR_PROPERTY_CARD_IMAGE_PRESET: PropertyCardImageAdjustments = {
  rotation: 0,
  brightness: 102,
  contrast: 136,
  saturation: 112,
  grayscale: 0,
  sharpen: 26,
  upscale: 1.05,
  binarizeThreshold: null,
};

export const OCR_HIGH_CONTRAST_PROPERTY_CARD_IMAGE_PRESET: PropertyCardImageAdjustments = {
  rotation: 0,
  brightness: 104,
  contrast: 154,
  saturation: 106,
  grayscale: 0,
  sharpen: 34,
  upscale: 1.1,
  binarizeThreshold: null,
};

export const OCR_GRAYSCALE_PROPERTY_CARD_IMAGE_PRESET: PropertyCardImageAdjustments = {
  rotation: 0,
  brightness: 103,
  contrast: 166,
  saturation: 108,
  grayscale: 0,
  sharpen: 32,
  upscale: 1.14,
  binarizeThreshold: null,
};

export const OCR_SOFT_COLOR_PROPERTY_CARD_IMAGE_PRESET: PropertyCardImageAdjustments = {
  rotation: 0,
  brightness: 100,
  contrast: 126,
  saturation: 114,
  grayscale: 0,
  sharpen: 18,
  upscale: 1.02,
  binarizeThreshold: null,
};

export const OCR_SOFT_GRAYSCALE_PROPERTY_CARD_IMAGE_PRESET: PropertyCardImageAdjustments = {
  rotation: 0,
  brightness: 101,
  contrast: 144,
  saturation: 114,
  grayscale: 0,
  sharpen: 24,
  upscale: 1.08,
  binarizeThreshold: null,
};

export const OCR_DETAIL_GRAYSCALE_PROPERTY_CARD_IMAGE_PRESET: PropertyCardImageAdjustments = {
  rotation: 0,
  brightness: 103,
  contrast: 165,
  saturation: 106,
  grayscale: 0,
  sharpen: 32,
  upscale: 1.14,
  binarizeThreshold: null,
};

export interface PropertyCardAutoEnhancementResult {
  file: File;
  documentFile: File;
  adjustments: PropertyCardImageAdjustments;
  presetKey: string;
  score: number;
}

type PropertyCardImagePresetOption = {
  key: string;
  adjustments: PropertyCardImageAdjustments;
};

type CropBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type DrawableSource = HTMLCanvasElement | HTMLImageElement;

const MAX_OUTPUT_EDGE = 4800;
const CARD_PREPARE_MAX_EDGE = 1800;
const MAX_CROPPED_SOURCE_EDGE = 4200;
const MAX_AUTO_UPSCALE = 3.4;
const UPSCALE_STEP_FACTOR = 1.35;
const MIN_TARGET_OCR_EDGE = 3600;
const OCR_IMAGE_MIME_TYPE = 'image/jpeg';
const OCR_IMAGE_INITIAL_QUALITY = 0.9;
const OCR_IMAGE_MIN_QUALITY = 0.62;
const OCR_IMAGE_MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const OCR_IMAGE_REDUCE_SCALE = 0.88;
const OCR_IMAGE_MIN_LONG_EDGE = 1500;
const PROPERTY_CARD_TARGET_ASPECT_RATIO = 1.58;
const PROPERTY_CARD_MIN_ASPECT_RATIO = 1.18;
const PROPERTY_CARD_MAX_ASPECT_RATIO = 2.15;
const REFERENCE_SAFE_MARGIN_X_RATIO = 0.014;
const REFERENCE_SAFE_MARGIN_Y_RATIO = 0.018;
const REFERENCE_CALIBRATION_MIN_AREA_RATIO = 0.68;
const REFERENCE_ADAPTIVE_MIN_AREA_RATIO = 0.46;
const REFERENCE_EDGE_NEAR_RATIO = 0.03;

const loadImage = (file: Blob): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('No se pudo preparar la imagen seleccionada.'));
    };

    image.src = objectUrl;
  });

const createCanvas = (width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  mimeType = 'image/jpeg',
  quality?: number
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error('No se pudo generar la imagen mejorada.'));
      },
      mimeType,
      quality
    );
  });

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const getSourceDimensions = (source: DrawableSource) =>
  source instanceof HTMLCanvasElement
    ? { width: source.width, height: source.height }
    : {
        width: source.naturalWidth || source.width,
        height: source.naturalHeight || source.height,
      };

const drawSourceToCanvas = (
  source: DrawableSource,
  outputWidth: number,
  outputHeight: number,
  cropBox?: CropBox
) => {
  const targetCanvas = createCanvas(outputWidth, outputHeight);
  const context = targetCanvas.getContext('2d');

  if (!context) {
    throw new Error('No se pudo preparar la imagen seleccionada.');
  }

  const sourceDimensions = getSourceDimensions(source);
  const x = cropBox?.x ?? 0;
  const y = cropBox?.y ?? 0;
  const width = cropBox?.width ?? sourceDimensions.width;
  const height = cropBox?.height ?? sourceDimensions.height;

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(source, x, y, width, height, 0, 0, targetCanvas.width, targetCanvas.height);

  return targetCanvas;
};

const buildUploadFriendlyOcrBlob = async (canvas: HTMLCanvasElement): Promise<Blob> => {
  let workingCanvas = canvas;
  let quality = OCR_IMAGE_INITIAL_QUALITY;
  let blob = await canvasToBlob(workingCanvas, OCR_IMAGE_MIME_TYPE, quality);

  for (let attempt = 0; attempt < 10 && blob.size > OCR_IMAGE_MAX_UPLOAD_BYTES; attempt += 1) {
    const canLowerQuality = quality > OCR_IMAGE_MIN_QUALITY + 0.01;

    if (canLowerQuality) {
      quality = Math.max(OCR_IMAGE_MIN_QUALITY, quality - 0.08);
    } else {
      const currentLongEdge = Math.max(workingCanvas.width, workingCanvas.height);
      if (currentLongEdge <= OCR_IMAGE_MIN_LONG_EDGE) {
        break;
      }

      const nextWidth = Math.max(1, Math.round(workingCanvas.width * OCR_IMAGE_REDUCE_SCALE));
      const nextHeight = Math.max(1, Math.round(workingCanvas.height * OCR_IMAGE_REDUCE_SCALE));
      workingCanvas = drawSourceToCanvas(workingCanvas, nextWidth, nextHeight);
      quality = Math.max(OCR_IMAGE_MIN_QUALITY, quality - 0.03);
    }

    blob = await canvasToBlob(workingCanvas, OCR_IMAGE_MIME_TYPE, quality);
  }

  return blob;
};

const progressivelyUpscaleCanvas = (
  sourceCanvas: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number
) => {
  if (targetWidth <= sourceCanvas.width && targetHeight <= sourceCanvas.height) {
    return sourceCanvas;
  }

  let workingCanvas = sourceCanvas;

  while (workingCanvas.width < targetWidth || workingCanvas.height < targetHeight) {
    const nextWidth = Math.min(
      targetWidth,
      Math.max(workingCanvas.width + 1, Math.round(workingCanvas.width * UPSCALE_STEP_FACTOR))
    );
    const nextHeight = Math.min(
      targetHeight,
      Math.max(workingCanvas.height + 1, Math.round(workingCanvas.height * UPSCALE_STEP_FACTOR))
    );

    workingCanvas = drawSourceToCanvas(workingCanvas, nextWidth, nextHeight);
  }

  return workingCanvas;
};

const estimateAdaptiveUpscale = (width: number, height: number) => {
  const longEdge = Math.max(width, height);

  if (longEdge <= 720) return 3.1;
  if (longEdge <= 900) return 2.7;
  if (longEdge <= 1150) return 2.35;
  if (longEdge <= 1450) return 2;
  if (longEdge <= 1850) return 1.7;
  if (longEdge <= 2400) return 1.4;
  return 1.18;
};

const estimateCanvasMeanLuma = (canvas: HTMLCanvasElement) => {
  const context = canvas.getContext('2d');
  if (!context) return 160;

  const { width, height } = canvas;
  const imageData = context.getImageData(0, 0, width, height).data;
  const step = Math.max(1, Math.round(Math.max(width, height) / 900));
  let total = 0;
  let count = 0;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const index = (y * width + x) * 4;
      const luma =
        imageData[index] * 0.299 +
        imageData[index + 1] * 0.587 +
        imageData[index + 2] * 0.114;
      total += luma;
      count += 1;
    }
  }

  return count ? total / count : 160;
};

const tuneBrightnessForSource = (
  adjustments: PropertyCardImageAdjustments,
  sourceMeanLuma: number
): PropertyCardImageAdjustments => {
  let brightnessOffset = 0;

  if (sourceMeanLuma > 195) {
    brightnessOffset = -11;
  } else if (sourceMeanLuma > 182) {
    brightnessOffset = -8;
  } else if (sourceMeanLuma > 170) {
    brightnessOffset = -5;
  } else if (sourceMeanLuma > 160) {
    brightnessOffset = -2;
  } else if (sourceMeanLuma < 105) {
    brightnessOffset = 6;
  } else if (sourceMeanLuma < 120) {
    brightnessOffset = 3;
  }

  return {
    ...adjustments,
    brightness: clamp(Math.round(adjustments.brightness + brightnessOffset), 92, 108),
  };
};

const buildAutoPropertyCardImagePresets = (
  preparedCanvas: HTMLCanvasElement
): PropertyCardImagePresetOption[] => {
  const sourceMeanLuma = estimateCanvasMeanLuma(preparedCanvas);
  const longEdge = Math.max(preparedCanvas.width, preparedCanvas.height);
  const maxAllowedUpscale = clamp(
    MAX_OUTPUT_EDGE / Math.max(1, longEdge),
    1,
    MAX_AUTO_UPSCALE
  );
  const targetResolutionUpscale = clamp(
    MIN_TARGET_OCR_EDGE / Math.max(1, longEdge),
    1,
    maxAllowedUpscale
  );
  const baseUpscale = clamp(
    Math.max(
      estimateAdaptiveUpscale(preparedCanvas.width, preparedCanvas.height),
      targetResolutionUpscale
    ),
    1,
    maxAllowedUpscale
  );
  const withUpscale = (
    adjustments: PropertyCardImageAdjustments,
    factor: number
  ): PropertyCardImageAdjustments => ({
    ...tuneBrightnessForSource(adjustments, sourceMeanLuma),
    upscale: clamp(adjustments.upscale * baseUpscale * factor, 1, maxAllowedUpscale),
  });

  return [
    {
      key: 'ocr-color-soft',
      adjustments: withUpscale(OCR_SOFT_GRAYSCALE_PROPERTY_CARD_IMAGE_PRESET, 1.02),
    },
    {
      key: 'ocr-color-balanced',
      adjustments: withUpscale(OCR_GRAYSCALE_PROPERTY_CARD_IMAGE_PRESET, 1.08),
    },
    {
      key: 'ocr-color-contrast',
      adjustments: withUpscale(OCR_DETAIL_GRAYSCALE_PROPERTY_CARD_IMAGE_PRESET, 1.1),
    },
    {
      key: 'ocr-color-high-contrast',
      adjustments: withUpscale(
        {
          ...OCR_HIGH_CONTRAST_PROPERTY_CARD_IMAGE_PRESET,
          saturation: 102,
          grayscale: 0,
          binarizeThreshold: null,
        },
        1.06
      ),
    },
  ];
};

const applySharpen = (canvas: HTMLCanvasElement, amount: number) => {
  if (amount <= 0) return;

  const context = canvas.getContext('2d');
  if (!context) return;

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const source = imageData.data;
  const target = new Uint8ClampedArray(source);
  const width = canvas.width;
  const height = canvas.height;
  const weight = clamp(amount / 100, 0, 1) * 0.45;

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = (y * width + x) * 4;

      for (let channel = 0; channel < 3; channel += 1) {
        const center = source[index + channel];
        const top = source[index + channel - width * 4];
        const bottom = source[index + channel + width * 4];
        const left = source[index + channel - 4];
        const right = source[index + channel + 4];
        const sharpened =
          center * (1 + weight * 4) -
          top * weight -
          bottom * weight -
          left * weight -
          right * weight;

        target[index + channel] = clamp(Math.round(sharpened), 0, 255);
      }
    }
  }

  context.putImageData(new ImageData(target, width, height), 0, 0);
};

const applyBinarization = (canvas: HTMLCanvasElement, threshold: number | null) => {
  if (threshold === null) return;

  const context = canvas.getContext('2d');
  if (!context) return;

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  const normalizedThreshold = clamp(threshold, 64, 220);
  const width = canvas.width;
  const height = canvas.height;
  const lumaValues = new Float32Array(width * height);

  let globalSum = 0;

  for (let index = 0; index < pixels.length; index += 4) {
    const luma =
      pixels[index] * 0.299 +
      pixels[index + 1] * 0.587 +
      pixels[index + 2] * 0.114;
    lumaValues[index / 4] = luma;
    globalSum += luma;
  }

  const globalMean = globalSum / Math.max(1, width * height);
  const integral = buildIntegralImage(lumaValues, width, height);
  const radius = clamp(Math.round(Math.min(width, height) * 0.028), 18, 52);
  const adaptiveOffset = clamp((200 - normalizedThreshold) * 0.34, 7, 22);
  const softness = clamp(Math.round((220 - normalizedThreshold) * 0.09), 10, 24);
  const blackValue = 14;
  const whiteValue = 246;

  for (let y = 0; y < height; y += 1) {
    const y0 = Math.max(0, y - radius);
    const y1 = Math.min(height, y + radius + 1);

    for (let x = 0; x < width; x += 1) {
      const x0 = Math.max(0, x - radius);
      const x1 = Math.min(width, x + radius + 1);
      const localMean = getRectangleMeanScore(integral, width, height, x0, y0, x1, y1);
      const stabilizedMean = localMean + (globalMean - localMean) * 0.18;
      let adaptiveThreshold = stabilizedMean - adaptiveOffset;

      if (stabilizedMean < 92) {
        adaptiveThreshold -= 6;
      } else if (stabilizedMean > 210) {
        adaptiveThreshold += 4;
      }

      adaptiveThreshold = adaptiveThreshold * 0.72 + normalizedThreshold * 0.28;

      const pixelIndex = (y * width + x) * 4;
      const luma = lumaValues[y * width + x];
      const diff = luma - adaptiveThreshold;

      let value = whiteValue;
      if (diff <= -softness) {
        value = blackValue;
      } else if (diff < softness) {
        const ratio = (diff + softness) / (softness * 2);
        value = Math.round(blackValue + ratio * (whiteValue - blackValue));
      }

      pixels[pixelIndex] = value;
      pixels[pixelIndex + 1] = value;
      pixels[pixelIndex + 2] = value;
    }
  }

  context.putImageData(imageData, 0, 0);
};

const smoothSeries = (values: number[], radius: number) =>
  values.map((_, index) => {
    let total = 0;
    let count = 0;

    for (
      let cursor = Math.max(0, index - radius);
      cursor <= Math.min(values.length - 1, index + radius);
      cursor += 1
    ) {
      total += values[cursor];
      count += 1;
    }

    return count ? total / count : values[index];
  });

const sampleBorderColor = (
  pixels: Uint8ClampedArray,
  width: number,
  height: number
) => {
  const border = Math.max(4, Math.round(Math.min(width, height) * 0.025));
  let red = 0;
  let green = 0;
  let blue = 0;
  let count = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (
        x >= border &&
        x < width - border &&
        y >= border &&
        y < height - border
      ) {
        continue;
      }

      const index = (y * width + x) * 4;
      red += pixels[index];
      green += pixels[index + 1];
      blue += pixels[index + 2];
      count += 1;
    }
  }

  if (!count) {
    return { red: 255, green: 255, blue: 255 };
  }

  return {
    red: red / count,
    green: green / count,
    blue: blue / count,
  };
};

const detectProjectionBounds = (
  projection: number[],
  thresholdRatio: number,
  minCoverage: number
) => {
  const smoothed = smoothSeries(projection, 6);
  const maxValue = Math.max(...smoothed, 0);
  const meanValue =
    smoothed.reduce((total, value) => total + value, 0) /
    Math.max(1, smoothed.length);
  const threshold = Math.max(maxValue * thresholdRatio, meanValue * 1.18);

  let start = smoothed.findIndex((value) => value >= threshold);
  let end = -1;

  for (let index = smoothed.length - 1; index >= 0; index -= 1) {
    if (smoothed[index] >= threshold) {
      end = index;
      break;
    }
  }

  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  const coverage = (end - start + 1) / Math.max(1, smoothed.length);
  if (coverage < minCoverage) {
    return null;
  }

  return { start, end };
};

const buildIntegralImage = (values: Float32Array, width: number, height: number) => {
  const stride = width + 1;
  const integral = new Float64Array((width + 1) * (height + 1));

  for (let y = 1; y <= height; y += 1) {
    let rowTotal = 0;

    for (let x = 1; x <= width; x += 1) {
      rowTotal += values[(y - 1) * width + (x - 1)];
      integral[y * stride + x] = integral[(y - 1) * stride + x] + rowTotal;
    }
  }

  return integral;
};

const getRectangleScore = (
  integral: Float64Array,
  width: number,
  height: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number
) => {
  const stride = width + 1;
  const left = clamp(Math.round(Math.min(x0, x1)), 0, width);
  const right = clamp(Math.round(Math.max(x0, x1)), 0, width);
  const top = clamp(Math.round(Math.min(y0, y1)), 0, height);
  const bottom = clamp(Math.round(Math.max(y0, y1)), 0, height);

  if (right <= left || bottom <= top) {
    return 0;
  }

  return (
    integral[bottom * stride + right] -
    integral[top * stride + right] -
    integral[bottom * stride + left] +
    integral[top * stride + left]
  );
};

const getRectangleMeanScore = (
  integral: Float64Array,
  width: number,
  height: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number
) => {
  const left = clamp(Math.round(Math.min(x0, x1)), 0, width);
  const right = clamp(Math.round(Math.max(x0, x1)), 0, width);
  const top = clamp(Math.round(Math.min(y0, y1)), 0, height);
  const bottom = clamp(Math.round(Math.max(y0, y1)), 0, height);
  const area = Math.max(1, (right - left) * (bottom - top));

  return getRectangleScore(integral, width, height, left, top, right, bottom) / area;
};

const getCropBoxArea = (cropBox: CropBox) => Math.max(1, cropBox.width * cropBox.height);

const expandCropBox = (
  cropBox: CropBox,
  width: number,
  height: number,
  paddingX: number,
  paddingY: number
): CropBox => {
  const x = clamp(cropBox.x - paddingX, 0, width - 1);
  const y = clamp(cropBox.y - paddingY, 0, height - 1);
  const x1 = clamp(cropBox.x + cropBox.width + paddingX, x + 1, width);
  const y1 = clamp(cropBox.y + cropBox.height + paddingY, y + 1, height);

  return {
    x,
    y,
    width: x1 - x,
    height: y1 - y,
  };
};

const calculatePropertyCardAspectScore = (aspectRatio: number) => {
  const logDistance = Math.abs(Math.log(aspectRatio / PROPERTY_CARD_TARGET_ASPECT_RATIO));
  return Math.max(0, 1 - logDistance / 0.42);
};

const isPlausiblePropertyCardCropBox = (
  cropBox: CropBox,
  width: number,
  height: number
) => {
  const cropWidth = cropBox.width;
  const cropHeight = cropBox.height;
  const aspectRatio = cropWidth / Math.max(1, cropHeight);
  const areaRatio = getCropBoxArea(cropBox) / Math.max(1, width * height);

  if (
    cropWidth < width * 0.24 ||
    cropHeight < height * 0.16 ||
    cropWidth > width * 0.995 ||
    cropHeight > height * 0.995
  ) {
    return false;
  }

  if (areaRatio < 0.12 || areaRatio > 0.992) {
    return false;
  }

  return (
    aspectRatio >= PROPERTY_CARD_MIN_ASPECT_RATIO &&
    aspectRatio <= PROPERTY_CARD_MAX_ASPECT_RATIO
  );
};

const alignCropBoxToTargetAspect = (
  cropBox: CropBox,
  width: number,
  height: number
): CropBox => {
  const aspectRatio = cropBox.width / Math.max(1, cropBox.height);
  const aspectDistance = Math.abs(Math.log(aspectRatio / PROPERTY_CARD_TARGET_ASPECT_RATIO));

  if (aspectDistance <= 0.12) {
    return cropBox;
  }

  if (aspectRatio > PROPERTY_CARD_TARGET_ASPECT_RATIO) {
    const desiredHeight = Math.max(1, Math.round(cropBox.width / PROPERTY_CARD_TARGET_ASPECT_RATIO));
    const deltaHeight = Math.max(0, desiredHeight - cropBox.height);

    if (!deltaHeight) {
      return cropBox;
    }

    return expandCropBox(cropBox, width, height, 0, Math.ceil(deltaHeight / 2));
  }

  const desiredWidth = Math.max(1, Math.round(cropBox.height * PROPERTY_CARD_TARGET_ASPECT_RATIO));
  const deltaWidth = Math.max(0, desiredWidth - cropBox.width);

  if (!deltaWidth) {
    return cropBox;
  }

  return expandCropBox(cropBox, width, height, Math.ceil(deltaWidth / 2), 0);
};

const mergeCropBoxes = (a: CropBox, b: CropBox, width: number, height: number): CropBox => {
  const x = clamp(Math.min(a.x, b.x), 0, width - 1);
  const y = clamp(Math.min(a.y, b.y), 0, height - 1);
  const x1 = clamp(
    Math.max(a.x + a.width, b.x + b.width),
    x + 1,
    width
  );
  const y1 = clamp(
    Math.max(a.y + a.height, b.y + b.height),
    y + 1,
    height
  );

  return {
    x,
    y,
    width: x1 - x,
    height: y1 - y,
  };
};

const getEdgeTouchCount = (cropBox: CropBox, width: number, height: number) => {
  const thresholdX = Math.max(6, Math.round(width * REFERENCE_EDGE_NEAR_RATIO));
  const thresholdY = Math.max(6, Math.round(height * REFERENCE_EDGE_NEAR_RATIO));

  return (
    (cropBox.x <= thresholdX ? 1 : 0) +
    (cropBox.y <= thresholdY ? 1 : 0) +
    (cropBox.x + cropBox.width >= width - thresholdX ? 1 : 0) +
    (cropBox.y + cropBox.height >= height - thresholdY ? 1 : 0)
  );
};

const getAdaptiveReferenceMarginRatios = (
  areaRatio: number,
  edgeTouchCount: number
) => {
  let marginXRatio = REFERENCE_SAFE_MARGIN_X_RATIO;
  let marginYRatio = REFERENCE_SAFE_MARGIN_Y_RATIO;

  if (areaRatio >= 0.86) {
    marginXRatio *= 0.72;
    marginYRatio *= 0.72;
  } else if (areaRatio >= 0.72) {
    marginXRatio *= 0.9;
    marginYRatio *= 0.9;
  } else if (areaRatio >= 0.58) {
    marginXRatio = 0.02;
    marginYRatio = 0.026;
  } else {
    marginXRatio = 0.026;
    marginYRatio = 0.033;
  }

  if (edgeTouchCount >= 2) {
    marginXRatio *= 1.14;
    marginYRatio *= 1.14;
  }

  return {
    marginXRatio: clamp(marginXRatio, 0.008, 0.038),
    marginYRatio: clamp(marginYRatio, 0.01, 0.046),
  };
};

const applyReferenceCalibratedMargins = (
  cropBox: CropBox,
  width: number,
  height: number
): CropBox => {
  const areaRatio = getCropBoxArea(cropBox) / Math.max(1, width * height);

  if (areaRatio < REFERENCE_ADAPTIVE_MIN_AREA_RATIO) {
    return cropBox;
  }

  const edgeTouchCount = getEdgeTouchCount(cropBox, width, height);
  const forceReferenceSafeFrame =
    areaRatio >= REFERENCE_CALIBRATION_MIN_AREA_RATIO || edgeTouchCount >= 2;
  const { marginXRatio, marginYRatio } = getAdaptiveReferenceMarginRatios(areaRatio, edgeTouchCount);
  const marginX = Math.max(8, Math.round(width * marginXRatio));
  const marginY = Math.max(8, Math.round(height * marginYRatio));
  const referenceSafeBox: CropBox = {
    x: marginX,
    y: marginY,
    width: Math.max(1, width - marginX * 2),
    height: Math.max(1, height - marginY * 2),
  };
  const merged = forceReferenceSafeFrame
    ? mergeCropBoxes(cropBox, referenceSafeBox, width, height)
    : cropBox;
  const aspectAlignedMerged = alignCropBoxToTargetAspect(merged, width, height);

  if (isPlausiblePropertyCardCropBox(aspectAlignedMerged, width, height)) {
    return aspectAlignedMerged;
  }

  return isPlausiblePropertyCardCropBox(merged, width, height) ? merged : cropBox;
};

const buildConservativeDetectedCropBox = (
  cropBox: CropBox,
  width: number,
  height: number
): CropBox | null => {
  const areaRatio = getCropBoxArea(cropBox) / Math.max(1, width * height);

  if (areaRatio < 0.12) {
    return null;
  }

  const paddingXRatio =
    areaRatio >= 0.8 ? 0.055 :
    areaRatio >= 0.62 ? 0.072 :
    areaRatio >= 0.5 ? 0.086 :
    0.1;
  const paddingYRatio =
    areaRatio >= 0.8 ? 0.062 :
    areaRatio >= 0.62 ? 0.078 :
    areaRatio >= 0.5 ? 0.094 :
    0.11;
  const paddingX = Math.max(12, Math.round(cropBox.width * paddingXRatio));
  const paddingY = Math.max(12, Math.round(cropBox.height * paddingYRatio));
  const expanded = expandCropBox(cropBox, width, height, paddingX, paddingY);
  const alignedExpanded = alignCropBoxToTargetAspect(expanded, width, height);

  if (isPlausiblePropertyCardCropBox(alignedExpanded, width, height)) {
    return applyReferenceCalibratedMargins(alignedExpanded, width, height);
  }

  if (isPlausiblePropertyCardCropBox(expanded, width, height)) {
    return applyReferenceCalibratedMargins(expanded, width, height);
  }

  if (isPlausiblePropertyCardCropBox(cropBox, width, height)) {
    return applyReferenceCalibratedMargins(
      alignCropBoxToTargetAspect(cropBox, width, height),
      width,
      height
    );
  }

  return null;
};

const getCropBoxOutsideMeanScore = (
  integral: Float64Array,
  width: number,
  height: number,
  cropBox: CropBox,
  paddingX: number,
  paddingY: number
) => {
  const expanded = expandCropBox(cropBox, width, height, paddingX, paddingY);
  const expandedScore = getRectangleScore(
    integral,
    width,
    height,
    expanded.x,
    expanded.y,
    expanded.x + expanded.width,
    expanded.y + expanded.height
  );
  const innerScore = getRectangleScore(
    integral,
    width,
    height,
    cropBox.x,
    cropBox.y,
    cropBox.x + cropBox.width,
    cropBox.y + cropBox.height
  );
  const outsideArea = Math.max(1, getCropBoxArea(expanded) - getCropBoxArea(cropBox));

  return Math.max(0, expandedScore - innerScore) / outsideArea;
};

const scoreDetectedPropertyCardCropBox = (
  integral: Float64Array,
  width: number,
  height: number,
  cropBox: CropBox
) => {
  if (!isPlausiblePropertyCardCropBox(cropBox, width, height)) {
    return Number.NEGATIVE_INFINITY;
  }

  const aspectRatio = cropBox.width / Math.max(1, cropBox.height);
  const aspectScore = calculatePropertyCardAspectScore(aspectRatio);
  const borderWidth = Math.max(4, Math.round(cropBox.width * 0.032));
  const borderHeight = Math.max(4, Math.round(cropBox.height * 0.036));
  const coreInsetX = Math.max(borderWidth + 2, Math.round(cropBox.width * 0.11));
  const coreInsetY = Math.max(borderHeight + 2, Math.round(cropBox.height * 0.11));
  const insideMean = getRectangleMeanScore(
    integral,
    width,
    height,
    cropBox.x,
    cropBox.y,
    cropBox.x + cropBox.width,
    cropBox.y + cropBox.height
  );
  const coreMean = getRectangleMeanScore(
    integral,
    width,
    height,
    cropBox.x + coreInsetX,
    cropBox.y + coreInsetY,
    cropBox.x + cropBox.width - coreInsetX,
    cropBox.y + cropBox.height - coreInsetY
  );
  const leftBorderMean = getRectangleMeanScore(
    integral,
    width,
    height,
    cropBox.x,
    cropBox.y,
    cropBox.x + borderWidth,
    cropBox.y + cropBox.height
  );
  const rightBorderMean = getRectangleMeanScore(
    integral,
    width,
    height,
    cropBox.x + cropBox.width - borderWidth,
    cropBox.y,
    cropBox.x + cropBox.width,
    cropBox.y + cropBox.height
  );
  const topBorderMean = getRectangleMeanScore(
    integral,
    width,
    height,
    cropBox.x,
    cropBox.y,
    cropBox.x + cropBox.width,
    cropBox.y + borderHeight
  );
  const bottomBorderMean = getRectangleMeanScore(
    integral,
    width,
    height,
    cropBox.x,
    cropBox.y + cropBox.height - borderHeight,
    cropBox.x + cropBox.width,
    cropBox.y + cropBox.height
  );
  const borderMean =
    (leftBorderMean + rightBorderMean + topBorderMean + bottomBorderMean) / 4;
  const outsideMean = getCropBoxOutsideMeanScore(
    integral,
    width,
    height,
    cropBox,
    Math.max(6, Math.round(cropBox.width * 0.05)),
    Math.max(6, Math.round(cropBox.height * 0.05))
  );
  const cropCenterX = cropBox.x + cropBox.width / 2;
  const cropCenterY = cropBox.y + cropBox.height / 2;
  const centerDistance =
    Math.hypot(cropCenterX - width / 2, cropCenterY - height / 2) /
    Math.max(1, Math.hypot(width / 2, height / 2));

  return (
    borderMean * 1.35 +
    insideMean * 0.72 +
    coreMean * 0.38 -
    outsideMean * 0.62 +
    aspectScore * 78 -
    centerDistance * 24
  );
};

const detectConnectedPropertyCardCropBox = (
  integral: Float64Array,
  width: number,
  height: number
): CropBox | null => {
  const step = clamp(Math.round(Math.max(width, height) / 420), 2, 6);
  const windowRadius = Math.max(6, step * 2);
  const gridWidth = Math.max(1, Math.ceil(width / step));
  const gridHeight = Math.max(1, Math.ceil(height / step));
  const densities = new Float32Array(gridWidth * gridHeight);
  let densityTotal = 0;
  let maxDensity = 0;

  for (let gy = 0; gy < gridHeight; gy += 1) {
    const centerY = Math.min(height - 1, gy * step + Math.floor(step / 2));

    for (let gx = 0; gx < gridWidth; gx += 1) {
      const centerX = Math.min(width - 1, gx * step + Math.floor(step / 2));
      const density = getRectangleMeanScore(
        integral,
        width,
        height,
        centerX - windowRadius,
        centerY - windowRadius,
        centerX + windowRadius,
        centerY + windowRadius
      );
      const densityIndex = gy * gridWidth + gx;
      densities[densityIndex] = density;
      densityTotal += density;
      maxDensity = Math.max(maxDensity, density);
    }
  }

  if (maxDensity <= 0) {
    return null;
  }

  const meanDensity = densityTotal / Math.max(1, densities.length);
  const activeThreshold = Math.max(meanDensity * 1.28, maxDensity * 0.24);
  const active = new Uint8Array(densities.length);

  for (let index = 0; index < densities.length; index += 1) {
    active[index] = densities[index] >= activeThreshold ? 1 : 0;
  }

  const visited = new Uint8Array(densities.length);
  const queueX: number[] = [];
  const queueY: number[] = [];
  let bestCropBox: CropBox | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (let startY = 0; startY < gridHeight; startY += 1) {
    for (let startX = 0; startX < gridWidth; startX += 1) {
      const startIndex = startY * gridWidth + startX;
      if (!active[startIndex] || visited[startIndex]) {
        continue;
      }

      visited[startIndex] = 1;
      queueX.length = 0;
      queueY.length = 0;
      queueX.push(startX);
      queueY.push(startY);

      let head = 0;
      let minX = startX;
      let maxX = startX;
      let minY = startY;
      let maxY = startY;
      let cellCount = 0;
      let densitySum = 0;

      while (head < queueX.length) {
        const currentX = queueX[head];
        const currentY = queueY[head];
        head += 1;

        const currentIndex = currentY * gridWidth + currentX;
        cellCount += 1;
        densitySum += densities[currentIndex];
        minX = Math.min(minX, currentX);
        maxX = Math.max(maxX, currentX);
        minY = Math.min(minY, currentY);
        maxY = Math.max(maxY, currentY);

        const neighbors = [
          [currentX - 1, currentY],
          [currentX + 1, currentY],
          [currentX, currentY - 1],
          [currentX, currentY + 1],
        ] as const;

        for (const [nextX, nextY] of neighbors) {
          if (
            nextX < 0 ||
            nextX >= gridWidth ||
            nextY < 0 ||
            nextY >= gridHeight
          ) {
            continue;
          }

          const nextIndex = nextY * gridWidth + nextX;
          if (!active[nextIndex] || visited[nextIndex]) {
            continue;
          }

          visited[nextIndex] = 1;
          queueX.push(nextX);
          queueY.push(nextY);
        }
      }

      if (cellCount < 6) {
        continue;
      }

      const componentCropBox = expandCropBox(
        {
          x: minX * step,
          y: minY * step,
          width: Math.min(width, (maxX + 1) * step) - minX * step,
          height: Math.min(height, (maxY + 1) * step) - minY * step,
        },
        width,
        height,
        step * 2,
        step * 2
      );

      if (!isPlausiblePropertyCardCropBox(componentCropBox, width, height)) {
        continue;
      }

      const densityRatio = (densitySum / Math.max(1, cellCount)) / Math.max(1, maxDensity);
      const areaRatio = getCropBoxArea(componentCropBox) / Math.max(1, width * height);
      const aspectScore = calculatePropertyCardAspectScore(
        componentCropBox.width / Math.max(1, componentCropBox.height)
      );
      const centerDistance =
        Math.hypot(
          componentCropBox.x + componentCropBox.width / 2 - width / 2,
          componentCropBox.y + componentCropBox.height / 2 - height / 2
        ) / Math.max(1, Math.hypot(width / 2, height / 2));
      const touchesEdgeCount =
        (componentCropBox.x <= step ? 1 : 0) +
        (componentCropBox.y <= step ? 1 : 0) +
        (componentCropBox.x + componentCropBox.width >= width - step ? 1 : 0) +
        (componentCropBox.y + componentCropBox.height >= height - step ? 1 : 0);
      const componentScore =
        densityRatio * 105 +
        aspectScore * 95 +
        Math.sqrt(areaRatio) * 82 -
        centerDistance * 62 -
        touchesEdgeCount * 9;

      if (componentScore > bestScore) {
        bestScore = componentScore;
        bestCropBox = componentCropBox;
      }
    }
  }

  return bestCropBox;
};

const refineVerticalBoundary = (
  integral: Float64Array,
  width: number,
  height: number,
  roughX: number,
  y0: number,
  y1: number,
  direction: 'left' | 'right',
  searchRadius: number,
  bandWidth: number
) => {
  const minX = clamp(roughX - searchRadius, 1, width - 1);
  const maxX = clamp(roughX + searchRadius, 1, width - 1);
  let bestX = roughX;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (let candidate = minX; candidate <= maxX; candidate += 1) {
    const edgeMean = getRectangleMeanScore(
      integral,
      width,
      height,
      candidate - 1,
      y0,
      candidate + 1,
      y1
    );
    const insideMean =
      direction === 'left'
        ? getRectangleMeanScore(integral, width, height, candidate, y0, candidate + bandWidth, y1)
        : getRectangleMeanScore(integral, width, height, candidate - bandWidth, y0, candidate, y1);
    const outsideMean =
      direction === 'left'
        ? getRectangleMeanScore(integral, width, height, candidate - bandWidth, y0, candidate, y1)
        : getRectangleMeanScore(integral, width, height, candidate, y0, candidate + bandWidth, y1);
    const centerBias = 1 - Math.abs(candidate - roughX) / Math.max(1, searchRadius + 1);
    const score =
      edgeMean * 1.25 +
      insideMean * 0.95 -
      outsideMean * 0.82 +
      centerBias * 3.5;

    if (score > bestScore) {
      bestScore = score;
      bestX = candidate;
    }
  }

  return bestX;
};

const refineHorizontalBoundary = (
  integral: Float64Array,
  width: number,
  height: number,
  roughY: number,
  x0: number,
  x1: number,
  direction: 'top' | 'bottom',
  searchRadius: number,
  bandHeight: number
) => {
  const minY = clamp(roughY - searchRadius, 1, height - 1);
  const maxY = clamp(roughY + searchRadius, 1, height - 1);
  let bestY = roughY;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (let candidate = minY; candidate <= maxY; candidate += 1) {
    const edgeMean = getRectangleMeanScore(
      integral,
      width,
      height,
      x0,
      candidate - 1,
      x1,
      candidate + 1
    );
    const insideMean =
      direction === 'top'
        ? getRectangleMeanScore(integral, width, height, x0, candidate, x1, candidate + bandHeight)
        : getRectangleMeanScore(integral, width, height, x0, candidate - bandHeight, x1, candidate);
    const outsideMean =
      direction === 'top'
        ? getRectangleMeanScore(integral, width, height, x0, candidate - bandHeight, x1, candidate)
        : getRectangleMeanScore(integral, width, height, x0, candidate, x1, candidate + bandHeight);
    const centerBias = 1 - Math.abs(candidate - roughY) / Math.max(1, searchRadius + 1);
    const score =
      edgeMean * 1.25 +
      insideMean * 0.95 -
      outsideMean * 0.82 +
      centerBias * 3.5;

    if (score > bestScore) {
      bestScore = score;
      bestY = candidate;
    }
  }

  return bestY;
};

const refinePropertyCardCropBox = (
  integral: Float64Array,
  width: number,
  height: number,
  roughCropBox: CropBox
): CropBox => {
  const roughRight = roughCropBox.x + roughCropBox.width;
  const roughBottom = roughCropBox.y + roughCropBox.height;
  const searchRadiusX = Math.max(8, Math.round(roughCropBox.width * 0.09));
  const searchRadiusY = Math.max(8, Math.round(roughCropBox.height * 0.1));
  const bandWidth = Math.max(6, Math.round(roughCropBox.width * 0.045));
  const bandHeight = Math.max(6, Math.round(roughCropBox.height * 0.05));
  const verticalTop = clamp(roughCropBox.y + Math.round(roughCropBox.height * 0.08), 0, height);
  const verticalBottom = clamp(roughBottom - Math.round(roughCropBox.height * 0.08), 0, height);

  let left = refineVerticalBoundary(
    integral,
    width,
    height,
    roughCropBox.x,
    verticalTop,
    verticalBottom,
    'left',
    searchRadiusX,
    bandWidth
  );
  let right = refineVerticalBoundary(
    integral,
    width,
    height,
    roughRight,
    verticalTop,
    verticalBottom,
    'right',
    searchRadiusX,
    bandWidth
  );

  if (right - left < roughCropBox.width * 0.45) {
    left = roughCropBox.x;
    right = roughRight;
  }

  const horizontalLeft = clamp(left + Math.round((right - left) * 0.06), 0, width);
  const horizontalRight = clamp(right - Math.round((right - left) * 0.06), 0, width);
  let top = refineHorizontalBoundary(
    integral,
    width,
    height,
    roughCropBox.y,
    horizontalLeft,
    horizontalRight,
    'top',
    searchRadiusY,
    bandHeight
  );
  let bottom = refineHorizontalBoundary(
    integral,
    width,
    height,
    roughBottom,
    horizontalLeft,
    horizontalRight,
    'bottom',
    searchRadiusY,
    bandHeight
  );

  if (bottom - top < roughCropBox.height * 0.45) {
    top = roughCropBox.y;
    bottom = roughBottom;
  }

  const finalPaddingX = Math.max(6, Math.round((right - left) * 0.024));
  const finalPaddingY = Math.max(6, Math.round((bottom - top) * 0.028));
  const x = clamp(left - finalPaddingX, 0, width - 1);
  const y = clamp(top - finalPaddingY, 0, height - 1);
  const x1 = clamp(right + finalPaddingX, x + 1, width);
  const y1 = clamp(bottom + finalPaddingY, y + 1, height);

  return {
    x,
    y,
    width: x1 - x,
    height: y1 - y,
  };
};

const detectPropertyCardCropBox = (canvas: HTMLCanvasElement): CropBox | null => {
  const context = canvas.getContext('2d');
  if (!context) return null;

  const { width, height } = canvas;
  const imageData = context.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const background = sampleBorderColor(pixels, width, height);
  const scoreMap = new Float32Array(width * height);
  const rowProjection = new Array<number>(height).fill(0);
  const colProjection = new Array<number>(width).fill(0);

  const colorDistance = (index: number) =>
    Math.abs(pixels[index] - background.red) +
    Math.abs(pixels[index + 1] - background.green) +
    Math.abs(pixels[index + 2] - background.blue);

  const luma = (index: number) =>
    pixels[index] * 0.299 +
    pixels[index + 1] * 0.587 +
    pixels[index + 2] * 0.114;

  for (let y = 0; y < height - 1; y += 1) {
    for (let x = 0; x < width - 1; x += 1) {
      const index = (y * width + x) * 4;
      const rightIndex = index + 4;
      const bottomIndex = index + width * 4;
      const distance = colorDistance(index);
      const edgeStrength =
        Math.abs(luma(index) - luma(rightIndex)) +
        Math.abs(luma(index) - luma(bottomIndex));
      const score =
        distance > 46 || edgeStrength > 36
          ? distance * 0.42 + edgeStrength
          : 0;

      if (score <= 0) continue;

      scoreMap[y * width + x] = score;
      rowProjection[y] += score;
      colProjection[x] += score;
    }
  }

  const scoreIntegral = buildIntegralImage(scoreMap, width, height);
  const candidateCropBoxes: CropBox[] = [];
  const rowBounds = detectProjectionBounds(rowProjection, 0.22, 0.34);
  const colBounds = detectProjectionBounds(colProjection, 0.24, 0.42);

  if (rowBounds && colBounds) {
    const paddingX = Math.max(8, Math.round(width * 0.025));
    const paddingY = Math.max(8, Math.round(height * 0.025));
    candidateCropBoxes.push({
      x: Math.max(0, colBounds.start - paddingX),
      y: Math.max(0, rowBounds.start - paddingY),
      width:
        Math.min(width, colBounds.end + paddingX) - Math.max(0, colBounds.start - paddingX),
      height:
        Math.min(height, rowBounds.end + paddingY) - Math.max(0, rowBounds.start - paddingY),
    });
  }

  const connectedCropBox = detectConnectedPropertyCardCropBox(scoreIntegral, width, height);
  if (connectedCropBox) {
    candidateCropBoxes.push(connectedCropBox);
  }

  if (!candidateCropBoxes.length) {
    return null;
  }

  let bestCropBox: CropBox | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const roughCropBox of candidateCropBoxes) {
    const refinedCropBox = refinePropertyCardCropBox(
      scoreIntegral,
      width,
      height,
      roughCropBox
    );
    const candidateScore = scoreDetectedPropertyCardCropBox(
      scoreIntegral,
      width,
      height,
      refinedCropBox
    );

    if (candidateScore > bestScore) {
      bestScore = candidateScore;
      bestCropBox = refinedCropBox;
    }
  }

  if (!bestCropBox || !isPlausiblePropertyCardCropBox(bestCropBox, width, height)) {
    return null;
  }

  return bestCropBox;
};

const preparePropertyCardBaseCanvas = async (file: Blob) => {
  const image = await loadImage(file);
  const { width: imageWidth, height: imageHeight } = getSourceDimensions(image);
  const detectionScale = Math.min(1, CARD_PREPARE_MAX_EDGE / Math.max(imageWidth, imageHeight));
  const detectionWidth = Math.max(1, Math.round(imageWidth * detectionScale));
  const detectionHeight = Math.max(1, Math.round(imageHeight * detectionScale));
  const detectionCanvas = drawSourceToCanvas(image, detectionWidth, detectionHeight);
  const detectedCropBox = detectPropertyCardCropBox(detectionCanvas);

  if (detectedCropBox) {
    const cropBox: CropBox = {
      x: clamp(Math.round(detectedCropBox.x / detectionScale), 0, imageWidth - 1),
      y: clamp(Math.round(detectedCropBox.y / detectionScale), 0, imageHeight - 1),
      width: clamp(
        Math.round(detectedCropBox.width / detectionScale),
        1,
        imageWidth
      ),
      height: clamp(
        Math.round(detectedCropBox.height / detectionScale),
        1,
        imageHeight
      ),
    };
    const conservativeCropBox = buildConservativeDetectedCropBox(cropBox, imageWidth, imageHeight);

    if (!conservativeCropBox) {
      const fallbackScale = Math.min(1, MAX_CROPPED_SOURCE_EDGE / Math.max(imageWidth, imageHeight));
      return drawSourceToCanvas(
        image,
        Math.max(1, Math.round(imageWidth * fallbackScale)),
        Math.max(1, Math.round(imageHeight * fallbackScale))
      );
    }

    const safeCropWidth = clamp(conservativeCropBox.width, 1, imageWidth - conservativeCropBox.x);
    const safeCropHeight = clamp(conservativeCropBox.height, 1, imageHeight - conservativeCropBox.y);
    const cropScale = Math.min(
      1,
      MAX_CROPPED_SOURCE_EDGE / Math.max(safeCropWidth, safeCropHeight)
    );

    return drawSourceToCanvas(
      image,
      Math.max(1, Math.round(safeCropWidth * cropScale)),
      Math.max(1, Math.round(safeCropHeight * cropScale)),
      {
        ...conservativeCropBox,
        width: safeCropWidth,
        height: safeCropHeight,
      }
    );
  }

  const fallbackScale = Math.min(1, MAX_CROPPED_SOURCE_EDGE / Math.max(imageWidth, imageHeight));
  return drawSourceToCanvas(
    image,
    Math.max(1, Math.round(imageWidth * fallbackScale)),
    Math.max(1, Math.round(imageHeight * fallbackScale))
  );
};

const getFileExtensionForMimeType = (mimeType: string) =>
  mimeType === 'image/png' ? 'png' : 'jpg';

const buildEditedFileName = (fileName: string, mimeType = 'image/jpeg') => {
  const extension = getFileExtensionForMimeType(mimeType);
  const dotIndex = fileName.lastIndexOf('.');
  if (dotIndex <= 0) {
    return `${fileName}-editada.${extension}`;
  }

  return `${fileName.slice(0, dotIndex)}-editada.${extension}`;
};

const buildEditedFileNameWithKey = (
  fileName: string,
  key: string,
  mimeType = 'image/jpeg'
) => {
  const extension = getFileExtensionForMimeType(mimeType);
  const safeKey = key.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
  const dotIndex = fileName.lastIndexOf('.');
  if (dotIndex <= 0) {
    return `${fileName}-${safeKey}.${extension}`;
  }

  return `${fileName.slice(0, dotIndex)}-${safeKey}.${extension}`;
};

const buildPdfFileName = (fileName: string) => {
  const dotIndex = fileName.lastIndexOf('.');
  if (dotIndex <= 0) {
    return `${fileName}.pdf`;
  }

  return `${fileName.slice(0, dotIndex)}.pdf`;
};

export const buildPropertyCardPdfFile = async (file: File): Promise<File> => {
  const { jsPDF } = await import('jspdf');
  const image = await loadImage(file);
  const width = Math.max(1, image.width);
  const height = Math.max(1, image.height);
  const orientation = width >= height ? 'landscape' : 'portrait';
  const pdf = new jsPDF({
    orientation,
    unit: 'px',
    format: [width, height],
    compress: true,
  });
  const pdfCanvas = drawSourceToCanvas(image, width, height);
  const imageDataUrl = pdfCanvas.toDataURL('image/jpeg', 0.9);

  pdf.addImage(imageDataUrl, 'JPEG', 0, 0, width, height, undefined, 'FAST');

  const pdfBlob = pdf.output('blob');
  return new File([pdfBlob], buildPdfFileName(file.name), {
    type: 'application/pdf',
    lastModified: Date.now(),
  });
};

export const buildPropertyCardPreviewFilter = (
  adjustments: PropertyCardImageAdjustments
) =>
  [
    `brightness(${adjustments.brightness}%)`,
    `contrast(${adjustments.contrast}%)`,
    `saturate(${adjustments.saturation}%)`,
    `grayscale(${adjustments.grayscale}%)`,
  ].join(' ');

export const rotatePropertyCardAdjustments = (
  adjustments: PropertyCardImageAdjustments,
  direction: 'left' | 'right'
): PropertyCardImageAdjustments => {
  const step = direction === 'right' ? 90 : -90;
  const rotation = (((adjustments.rotation + step) % 360) + 360) % 360 as
    | 0
    | 90
    | 180
    | 270;

  return {
    ...adjustments,
    rotation,
  };
};

const renderAdjustedPropertyCardCanvas = async (
  source: Blob | HTMLCanvasElement,
  adjustments: PropertyCardImageAdjustments
): Promise<HTMLCanvasElement> => {
  const imageCanvas =
    source instanceof HTMLCanvasElement
      ? source
      : await preparePropertyCardBaseCanvas(source);
  const sourceWidth = imageCanvas.width;
  const sourceHeight = imageCanvas.height;
  const scale = Math.min(
    Math.max(adjustments.upscale, 0.1),
    MAX_OUTPUT_EDGE / Math.max(sourceWidth, sourceHeight)
  );
  const drawWidth = Math.max(1, Math.round(sourceWidth * scale));
  const drawHeight = Math.max(1, Math.round(sourceHeight * scale));
  const preparedDrawCanvas =
    scale > 1.02
      ? progressivelyUpscaleCanvas(imageCanvas, drawWidth, drawHeight)
      : scale < 0.98
        ? drawSourceToCanvas(imageCanvas, drawWidth, drawHeight)
        : imageCanvas;
  const rotateRightAngle =
    adjustments.rotation === 90 || adjustments.rotation === 270;
  const canvas = createCanvas(
    rotateRightAngle ? preparedDrawCanvas.height : preparedDrawCanvas.width,
    rotateRightAngle ? preparedDrawCanvas.width : preparedDrawCanvas.height
  );
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('No se pudo abrir el editor de imagen.');
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.filter = buildPropertyCardPreviewFilter(adjustments);
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate((adjustments.rotation * Math.PI) / 180);
  context.drawImage(
    preparedDrawCanvas,
    -preparedDrawCanvas.width / 2,
    -preparedDrawCanvas.height / 2,
    preparedDrawCanvas.width,
    preparedDrawCanvas.height
  );
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.filter = 'none';

  applySharpen(canvas, adjustments.sharpen);
  applyBinarization(canvas, adjustments.binarizeThreshold);

  return canvas;
};

const calculatePropertyCardLegibilityScore = (canvas: HTMLCanvasElement): number => {
  const context = canvas.getContext('2d');
  if (!context) return 0;

  const { width, height } = canvas;
  const imageData = context.getImageData(0, 0, width, height).data;
  const step = Math.max(1, Math.round(Math.max(width, height) / 900));

  let count = 0;
  let sum = 0;
  let sumSq = 0;
  let edgeSum = 0;
  let clippedPixels = 0;
  let textLikePixels = 0;
  let darkTextPixels = 0;

  const getLuma = (offset: number) =>
    imageData[offset] * 0.299 +
    imageData[offset + 1] * 0.587 +
    imageData[offset + 2] * 0.114;

  for (let y = 0; y < height - step; y += step) {
    for (let x = 0; x < width - step; x += step) {
      const index = (y * width + x) * 4;
      const luma = getLuma(index);
      const right = getLuma(index + step * 4);
      const bottom = getLuma(index + step * width * 4);

      sum += luma;
      sumSq += luma * luma;
      edgeSum += Math.abs(luma - right) + Math.abs(luma - bottom);
      clippedPixels += luma < 18 || luma > 236 ? 1 : 0;
      textLikePixels += luma > 35 && luma < 215 ? 1 : 0;
      darkTextPixels += luma >= 8 && luma <= 138 ? 1 : 0;
      count += 1;
    }
  }

  if (!count) return 0;

  const mean = sum / count;
  const variance = Math.max(0, sumSq / count - mean * mean);
  const contrast = Math.sqrt(variance);
  const edge = edgeSum / (count * 2);
  const clippedRatio = clippedPixels / count;
  const textRatio = textLikePixels / count;
  const darkTextRatio = darkTextPixels / count;
  const exposureBalance = 255 - Math.abs(mean - 172);
  const resolutionBonus =
    Math.min(28, Math.max(0, (Math.max(width, height) - 1350) / 65)) +
    Math.min(18, Math.max(0, (Math.min(width, height) - 760) / 48));
  const binaryBalance = 1 - Math.min(1, Math.abs(darkTextRatio - 0.22) / 0.22);
  const binaryFriendlyBonus = edge > 20 ? binaryBalance * 18 : 0;
  const clippingPenalty = clippedRatio * (darkTextRatio > 0.08 && edge > 18 ? 46 : 85);
  const overExposurePenalty =
    Math.max(0, mean - 186) * 1.35 +
    Math.max(0, mean - 204) * 2.1;

  return (
    edge * 1.8 +
    contrast * 1.45 +
    exposureBalance * 0.35 +
    textRatio * 45 -
    clippingPenalty +
    overExposurePenalty * -1 +
    resolutionBonus +
    binaryFriendlyBonus
  );
};

export const processPropertyCardImage = async (
  file: File,
  adjustments: PropertyCardImageAdjustments
): Promise<File> => {
  const preparedCanvas = await preparePropertyCardBaseCanvas(file);
  const canvas = await renderAdjustedPropertyCardCanvas(preparedCanvas, adjustments);
  const blob = await buildUploadFriendlyOcrBlob(canvas);
  return new File([blob], buildEditedFileName(file.name, OCR_IMAGE_MIME_TYPE), {
    type: OCR_IMAGE_MIME_TYPE,
    lastModified: Date.now(),
  });
};

export const autoProcessPropertyCardImage = async (
  file: File
): Promise<PropertyCardAutoEnhancementResult> => {
  const preparedCanvas = await preparePropertyCardBaseCanvas(file);
  const presets = buildAutoPropertyCardImagePresets(preparedCanvas);
  let bestCandidate: Omit<PropertyCardAutoEnhancementResult, 'documentFile'> | null = null;

  for (const preset of presets) {
    const canvas = await renderAdjustedPropertyCardCanvas(preparedCanvas, preset.adjustments);
    const score = calculatePropertyCardLegibilityScore(canvas);
    const blob = await buildUploadFriendlyOcrBlob(canvas);
    const processedFile = new File(
      [blob],
      buildEditedFileNameWithKey(file.name, preset.key, OCR_IMAGE_MIME_TYPE),
      {
        type: OCR_IMAGE_MIME_TYPE,
        lastModified: Date.now(),
      }
    );

    const candidate: Omit<PropertyCardAutoEnhancementResult, 'documentFile'> = {
      file: processedFile,
      adjustments: preset.adjustments,
      presetKey: preset.key,
      score,
    };

    if (!bestCandidate || candidate.score > bestCandidate.score) {
      bestCandidate = candidate;
    }
  }

  if (!bestCandidate) {
    throw new Error('No se pudo optimizar la imagen automaticamente.');
  }

  return {
    ...bestCandidate,
    documentFile: await buildPropertyCardPdfFile(bestCandidate.file),
  };
};
