const TUMBLER_WIDTH = 2790; // 9.3 in * 300 DPI
const TUMBLER_HEIGHT = 2460; // 8.2 in * 300 DPI
const TAPER_BOTTOM_WIDTH = 2610; // ~8.7 in * 300 DPI
const ARC_SAG_PX = 24;

export type HorizontalRepeats = 1 | 2 | 3 | 4;
export type CrestOverlayMode = 'none' | 'cream-gold' | 'burgundy-ribbon';

export interface TumblerConversionOptions {
  horizontalRepeats: HorizontalRepeats;
  crestOverlay: CrestOverlayMode;
  baseFilename: string;
}

export interface TumblerConversionResult {
  straightBlob: Blob;
  taperedBlob: Blob;
  straightFilename: string;
  taperedFilename: string;
  straightPreviewUrl: string;
  taperedPreviewUrl: string;
  backSeamPreviewUrl: string;
  width: number;
  height: number;
  dpi: number;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makePngChunk(type: string, data: Uint8Array): Uint8Array {
  const chunk = new Uint8Array(12 + data.length);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, data.length, false);
  for (let i = 0; i < 4; i++) {
    chunk[4 + i] = type.charCodeAt(i);
  }
  chunk.set(data, 8);
  const crc = crc32(chunk.subarray(4, 8 + data.length));
  view.setUint32(8 + data.length, crc, false);
  return chunk;
}

/**
 * Injects sRGB (Perceptual) and pHYs (300 DPI = 11811 px/m) chunks into a PNG binary.
 */
export function injectPng300DpiAndSrgb(pngBytes: Uint8Array): Uint8Array {
  const PNG_SIG = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let i = 0; i < 8; i++) {
    if (pngBytes[i] !== PNG_SIG[i]) {
      return pngBytes;
    }
  }

  const view = new DataView(pngBytes.buffer, pngBytes.byteOffset, pngBytes.byteLength);
  const chunks: Uint8Array[] = [pngBytes.subarray(0, 8)];
  let offset = 8;
  let insertedMeta = false;

  // 300 DPI in pixels per meter: round(300 / 0.0254) = 11811
  const pxPerMeter = 11811;
  const physData = new Uint8Array(9);
  const physView = new DataView(physData.buffer);
  physView.setUint32(0, pxPerMeter, false);
  physView.setUint32(4, pxPerMeter, false);
  physData[8] = 1; // unit: meter
  const physChunk = makePngChunk('pHYs', physData);
  const srgbChunk = makePngChunk('sRGB', new Uint8Array([0])); // Perceptual

  while (offset + 8 <= pngBytes.length) {
    const length = view.getUint32(offset, false);
    const type = String.fromCharCode(
      pngBytes[offset + 4],
      pngBytes[offset + 5],
      pngBytes[offset + 6],
      pngBytes[offset + 7]
    );
    const totalLen = 12 + length;
    if (offset + totalLen > pngBytes.length) break;

    if (type !== 'pHYs' && type !== 'sRGB') {
      chunks.push(pngBytes.subarray(offset, offset + totalLen));
    }

    if (type === 'IHDR' && !insertedMeta) {
      chunks.push(srgbChunk, physChunk);
      insertedMeta = true;
    }

    offset += totalLen;
    if (type === 'IEND') break;
  }

  const totalSize = chunks.reduce((acc, c) => acc + c.length, 0);
  const result = new Uint8Array(totalSize);
  let pos = 0;
  for (const c of chunks) {
    result.set(c, pos);
    pos += c.length;
  }
  return result;
}

function drawBlankCrestOverlay(
  ctx: CanvasRenderingContext2D,
  mode: CrestOverlayMode
): void {
  if (mode === 'none') return;

  const cx = TUMBLER_WIDTH / 2;
  const cy = TUMBLER_HEIGHT / 2;

  ctx.save();

  if (mode === 'burgundy-ribbon') {
    // Full-width horizontal velvet ribbon band behind the central crest
    const bandH = 190;
    const grad = ctx.createLinearGradient(0, cy - bandH / 2, 0, cy + bandH / 2);
    grad.addColorStop(0, '#5B1118');
    grad.addColorStop(0.5, '#7A1621');
    grad.addColorStop(1, '#4C0D13');
    ctx.fillStyle = grad;
    ctx.fillRect(0, cy - bandH / 2, TUMBLER_WIDTH, bandH);

    // Subtle gold trim hairlines along the ribbon
    ctx.strokeStyle = '#C8A66A';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, cy - bandH / 2 + 16);
    ctx.lineTo(TUMBLER_WIDTH, cy - bandH / 2 + 16);
    ctx.moveTo(0, cy + bandH / 2 - 16);
    ctx.lineTo(TUMBLER_WIDTH, cy + bandH / 2 - 16);
    ctx.stroke();
  }

  // Heritage oval crest frame for monogram / name personalization
  const rx = 460;
  const ry = 310;

  ctx.shadowColor = 'rgba(28, 25, 23, 0.22)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 10;

  ctx.fillStyle = '#FAF6F0';
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#B89758';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx - 18, ry - 18, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#2C2520';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx - 36, ry - 36, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

async function canvasTo300DpiPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  const rawBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Impossible de générer le PNG.'))),
      'image/png'
    );
  });
  const buf = new Uint8Array(await rawBlob.arrayBuffer());
  const withDpi = injectPng300DpiAndSrgb(buf);
  return new Blob([withDpi.buffer as ArrayBuffer], { type: 'image/png' });
}

export async function loadImageFromUrlOrFile(source: string | File): Promise<HTMLImageElement> {
  let blobToLoad: Blob;

  if (typeof source === 'string') {
    const response = await fetch(source, { credentials: 'include' });
    if (!response.ok) {
      throw new Error(`Impossible de charger l’image (${response.status}).`);
    }
    const fetchedBlob = await response.blob();
    if (!fetchedBlob.type.startsWith('image/') && fetchedBlob.size < 1000) {
      throw new Error('Réponse image invalide depuis le serveur.');
    }
    blobToLoad = fetchedBlob;
  } else {
    blobToLoad = source;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(blobToLoad);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Impossible de décoder l’image source.'));
    };

    img.src = objectUrl;
  });
}

export async function generateTumblerWrap20oz(
  img: HTMLImageElement,
  options: TumblerConversionOptions
): Promise<TumblerConversionResult> {
  // 1. Render Straight 20oz Wrap (2790 x 2460) with integer horizontal tile count
  // so x=0 aligns seamlessly with x=2790 around the back of the tumbler.
  const straightCanvas = document.createElement('canvas');
  straightCanvas.width = TUMBLER_WIDTH;
  straightCanvas.height = TUMBLER_HEIGHT;
  const sCtx = straightCanvas.getContext('2d');
  if (!sCtx) throw new Error('Contexte Canvas 2D indisponible.');

  sCtx.imageSmoothingEnabled = true;
  sCtx.imageSmoothingQuality = 'high';

  const tileW = TUMBLER_WIDTH / options.horizontalRepeats;
  const aspect = img.naturalHeight / Math.max(1, img.naturalWidth);
  const tileH = tileW * aspect;
  const verticalRepeats = Math.ceil(TUMBLER_HEIGHT / tileH);

  for (let row = 0; row < verticalRepeats; row++) {
    for (let col = 0; col < options.horizontalRepeats; col++) {
      sCtx.drawImage(
        img,
        col * tileW,
        row * tileH,
        tileW + 0.5, // prevent subpixel hairline between tiles
        tileH + 0.5
      );
    }
  }

  drawBlankCrestOverlay(sCtx, options.crestOverlay);

  // 2. Render Conical Tapered 20oz Wrap (2790 x 2460 transparent RGBA PNG)
  const taperedCanvas = document.createElement('canvas');
  taperedCanvas.width = TUMBLER_WIDTH;
  taperedCanvas.height = TUMBLER_HEIGHT;
  const tCtx = taperedCanvas.getContext('2d');
  if (!tCtx) throw new Error('Contexte Canvas Tapered indisponible.');

  const srcData = sCtx.getImageData(0, 0, TUMBLER_WIDTH, TUMBLER_HEIGHT).data;
  const dstImgData = tCtx.createImageData(TUMBLER_WIDTH, TUMBLER_HEIGHT);
  const dstData = dstImgData.data;

  const halfTop = TUMBLER_WIDTH / 2;
  const halfBot = TAPER_BOTTOM_WIDTH / 2;
  const cx = halfTop;
  const maxYBotAtCenter = TUMBLER_HEIGHT - ARC_SAG_PX;

  for (let py = 0; py < TUMBLER_HEIGHT; py++) {
    for (let px = 0; px < TUMBLER_WIDTH; px++) {
      const dx = px - cx;
      const nx = dx / halfTop; // [-1, 1]
      const sag = ARC_SAG_PX * nx * nx;
      const yTop = sag;
      const yBot = maxYBotAtCenter + sag;

      if (py < yTop - 1.5 || py > yBot + 1.5) continue;

      const spanY = yBot - yTop;
      const v = (py - yTop) / spanY;
      const vClamped = v < 0 ? 0 : v > 1 ? 1 : v;

      const halfW = halfTop - (halfTop - halfBot) * vClamped;
      const absDx = dx < 0 ? -dx : dx;
      if (absDx > halfW + 1.5) continue;

      // Smooth 1.5px anti-aliased edge mask
      let alpha = 1.0;
      const distTop = py - yTop;
      const distBot = yBot - py;
      const distSide = halfW - absDx;
      if (distTop < 1.5) alpha = Math.min(alpha, Math.max(0, (distTop + 0.5) / 1.5));
      if (distBot < 1.5) alpha = Math.min(alpha, Math.max(0, (distBot + 0.5) / 1.5));
      if (distSide < 1.5) alpha = Math.min(alpha, Math.max(0, (distSide + 0.5) / 1.5));
      if (alpha <= 0.01) continue;

      const u = dx / halfW; // [-1, 1]
      const sxFloat = (u + 1) * 0.5 * (TUMBLER_WIDTH - 1);
      const syFloat = vClamped * (TUMBLER_HEIGHT - 1);

      const x0 = Math.floor(sxFloat);
      const y0 = Math.floor(syFloat);
      const x1 = x0 + 1 < TUMBLER_WIDTH ? x0 + 1 : x0;
      const y1 = y0 + 1 < TUMBLER_HEIGHT ? y0 + 1 : y0;
      const fx = sxFloat - x0;
      const fy = syFloat - y0;

      const i00 = (y0 * TUMBLER_WIDTH + x0) * 4;
      const i10 = (y0 * TUMBLER_WIDTH + x1) * 4;
      const i01 = (y1 * TUMBLER_WIDTH + x0) * 4;
      const i11 = (y1 * TUMBLER_WIDTH + x1) * 4;

      const di = (py * TUMBLER_WIDTH + px) * 4;
      for (let c = 0; c < 3; c++) {
        const topMix = srcData[i00 + c] * (1 - fx) + srcData[i10 + c] * fx;
        const botMix = srcData[i01 + c] * (1 - fx) + srcData[i11 + c] * fx;
        dstData[di + c] = Math.round(topMix * (1 - fy) + botMix * fy);
      }
      dstData[di + 3] = Math.round(255 * alpha);
    }
  }
  tCtx.putImageData(dstImgData, 0, 0);

  // 3. Build Back-Seam Verification Crop (right 360px + left 360px side by side)
  const seamCanvas = document.createElement('canvas');
  seamCanvas.width = 720;
  seamCanvas.height = 720;
  const seamCtx = seamCanvas.getContext('2d');
  if (!seamCtx) throw new Error('Contexte Seam Preview indisponible.');
  const cropY = Math.floor((TUMBLER_HEIGHT - 720) / 2);
  seamCtx.drawImage(straightCanvas, TUMBLER_WIDTH - 360, cropY, 360, 720, 0, 0, 360, 720);
  seamCtx.drawImage(straightCanvas, 0, cropY, 360, 720, 360, 0, 360, 720);

  // 4. Web preview thumbnails (downscaled so browser preview stays lightweight)
  const makeThumb = (src: HTMLCanvasElement, w: number, h: number): string => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx?.drawImage(src, 0, 0, w, h);
    return c.toDataURL('image/png');
  };

  const [straightBlob, taperedBlob] = await Promise.all([
    canvasTo300DpiPngBlob(straightCanvas),
    canvasTo300DpiPngBlob(taperedCanvas),
  ]);

  const cleanBase =
    options.baseFilename
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'PLUME_Tumbler_Wrap';

  return {
    straightBlob,
    taperedBlob,
    straightFilename: `${cleanBase}_20oz_Straight_2790x2460_300DPI.png`,
    taperedFilename: `${cleanBase}_20oz_Tapered_2790x2460_300DPI.png`,
    straightPreviewUrl: makeThumb(straightCanvas, 930, 820),
    taperedPreviewUrl: makeThumb(taperedCanvas, 930, 820),
    backSeamPreviewUrl: seamCanvas.toDataURL('image/png'),
    width: TUMBLER_WIDTH,
    height: TUMBLER_HEIGHT,
    dpi: 300,
  };
}

export type MultiProductFormatId =
  | 'mug11'
  | 'mug15'
  | 'glass16'
  | 'coaster4'
  | 'cushion12'
  | 'pen'
  | 'wallpaper'
  | 'wrapping';

export interface MultiProductFormatSpec {
  id: MultiProductFormatId;
  label: string;
  dimensionsLabel: string;
  width: number;
  height: number;
  defaultRepeats: HorizontalRepeats;
  roundCutout?: boolean;
  filenameTag: string;
  recommendedPrice: string;
}

export const MULTI_PRODUCT_FORMATS: MultiProductFormatSpec[] = [
  {
    id: 'mug11',
    label: 'Mug 11 oz Wrap',
    dimensionsLabel: '2550×1050 px (8.5×3.5 in)',
    width: 2550,
    height: 1050,
    defaultRepeats: 3,
    filenameTag: '11oz_Mug_Wrap_2550x1050_300DPI',
    recommendedPrice: '$3.90–$5.90',
  },
  {
    id: 'mug15',
    label: 'Mug 15 oz Wrap',
    dimensionsLabel: '2700×1200 px (9×4 in)',
    width: 2700,
    height: 1200,
    defaultRepeats: 3,
    filenameTag: '15oz_Mug_Wrap_2700x1200_300DPI',
    recommendedPrice: '$3.90–$5.90',
  },
  {
    id: 'glass16',
    label: '16 oz Glass Can Wrap',
    dimensionsLabel: '2820×1290 px (9.4×4.3 in)',
    width: 2820,
    height: 1290,
    defaultRepeats: 3,
    filenameTag: '16oz_Glass_Can_2820x1290_300DPI',
    recommendedPrice: '$4.50–$6.50',
  },
  {
    id: 'coaster4',
    label: 'Ornement / Sous-verre Rond',
    dimensionsLabel: '1200×1200 px (4×4 in Transparent)',
    width: 1200,
    height: 1200,
    defaultRepeats: 1,
    roundCutout: true,
    filenameTag: '4in_Round_Coaster_Ornament_300DPI',
    recommendedPrice: '$3.50–$4.90',
  },
  {
    id: 'cushion12',
    label: 'Tissu / Coussin Seamless',
    dimensionsLabel: '3600×3600 px (12×12 in)',
    width: 3600,
    height: 3600,
    defaultRepeats: 2,
    filenameTag: 'Cushion_Fabric_3600x3600_300DPI',
    recommendedPrice: '$4.90–$7.90',
  },
  {
    id: 'wrapping',
    label: 'Papier Cadeau (US Letter)',
    dimensionsLabel: '2550×3300 px (8.5×11 in)',
    width: 2550,
    height: 3300,
    defaultRepeats: 3,
    filenameTag: 'Wrapping_Paper_Letter_2550x3300_300DPI',
    recommendedPrice: '$3.50–$5.50',
  },
  {
    id: 'wallpaper',
    label: 'Fond d’écran Téléphone',
    dimensionsLabel: '1290×2796 px (Lockscreen)',
    width: 1290,
    height: 2796,
    defaultRepeats: 2,
    filenameTag: 'Phone_Wallpaper_1290x2796_300DPI',
    recommendedPrice: '$2.90–$3.90',
  },
  {
    id: 'pen',
    label: 'Pen Wrap Sublimation',
    dimensionsLabel: '1425×450 px (4.75×1.5 in)',
    width: 1425,
    height: 450,
    defaultRepeats: 3,
    filenameTag: 'Pen_Wrap_1425x450_300DPI',
    recommendedPrice: '$2.90–$4.50',
  },
];

export async function generateMultiProductFormatPng(
  img: HTMLImageElement,
  formatId: MultiProductFormatId,
  horizontalRepeats: HorizontalRepeats,
  baseFilename: string
): Promise<{ blob: Blob; filename: string }> {
  const spec = MULTI_PRODUCT_FORMATS.find((f) => f.id === formatId);
  if (!spec) {
    throw new Error('Format produit inconnu.');
  }

  const canvas = document.createElement('canvas');
  canvas.width = spec.width;
  canvas.height = spec.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Contexte Canvas 2D indisponible.');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (spec.roundCutout) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(spec.width / 2, spec.height / 2, spec.width / 2 - 4, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
  }

  const tileW = spec.width / horizontalRepeats;
  const aspect = img.naturalHeight / Math.max(1, img.naturalWidth);
  const tileH = tileW * aspect;
  const rows = Math.ceil(spec.height / tileH);

  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < horizontalRepeats; col++) {
      ctx.drawImage(img, col * tileW, r * tileH, tileW + 0.5, tileH + 0.5);
    }
  }

  if (spec.roundCutout) {
    ctx.restore();
  }

  const blob = await canvasTo300DpiPngBlob(canvas);
  const cleanBase =
    baseFilename
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'PLUME_Design';

  return {
    blob,
    filename: `${cleanBase}_${spec.filenameTag}.png`,
  };
}

