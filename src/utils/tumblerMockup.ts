export interface MockupBundleTile {
  id: string;
  label: string;
  img: HTMLImageElement;
  thumbUrl?: string;
}

export interface TumblerMockupResult {
  soloStudioUrl: string;
  soloStudioBlob: Blob;
  soloTransparentUrl: string;
  soloTransparentBlob: Blob;
  frontBackUrl: string;
  frontBackBlob: Blob;
}

export interface BundleCoverResult {
  coverUrl: string;
  coverBlob: Blob;
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(x + rad, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
}

/**
 * Prepares a tiled wrap canvas (2790x2460) from a seamless square tile
 * so 3D cylinder projection samples an accurate 360° wrap.
 */
export function buildWrapSourceCanvas(
  tileImg: HTMLImageElement,
  horizontalRepeats: 1 | 2 | 3 | 4 = 2
): HTMLCanvasElement {
  const W = 1395; // Fast high-res source (half of 2790, plenty for 2000px mockups)
  const H = 1230;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D indisponible.');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const tileW = W / horizontalRepeats;
  const aspect = tileImg.naturalHeight / Math.max(1, tileImg.naturalWidth);
  const tileH = tileW * aspect;
  const rows = Math.ceil(H / tileH);

  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < horizontalRepeats; col++) {
      ctx.drawImage(tileImg, col * tileW, r * tileH, tileW + 0.5, tileH + 0.5);
    }
  }
  return c;
}

/**
 * Renders a photorealistic 3D 20oz Skinny Tumbler directly onto targetCtx
 * centered horizontally at cx, with top of lid at topY and body height bodyH.
 * angleOffsetRad = 0 shows Front (u = 0.25..0.75); Math.PI shows Back Seam (u = 0.75..0.25).
 */
export function draw3DTumbler(
  targetCtx: CanvasRenderingContext2D,
  wrapCanvas: HTMLCanvasElement,
  cx: number,
  topY: number,
  bodyH: number,
  angleOffsetRad: number = 0,
  includeShadow: boolean = true
): void {
  const bodyW = Math.round(bodyH * (2.92 / 8.2)); // True 20oz Skinny Tumbler proportions
  const R = bodyW / 2;
  const strawH = Math.round(bodyH * 0.14);
  const lidH = Math.round(bodyH * 0.042);
  const rimH = Math.round(bodyH * 0.015);
  const bodyTopY = topY + strawH + lidH;
  const sag = Math.max(6, Math.round(bodyW * 0.055));

  const srcW = wrapCanvas.width;
  const srcH = wrapCanvas.height;
  const srcCtx = wrapCanvas.getContext('2d');
  if (!srcCtx) return;

  targetCtx.save();

  // 1. Contact floor shadow
  if (includeShadow) {
    const shY = bodyTopY + bodyH + sag * 0.7;
    const shGrad = targetCtx.createRadialGradient(
      cx + bodyW * 0.06,
      shY,
      bodyW * 0.08,
      cx + bodyW * 0.06,
      shY,
      bodyW * 0.72
    );
    shGrad.addColorStop(0, 'rgba(28, 25, 23, 0.34)');
    shGrad.addColorStop(0.55, 'rgba(28, 25, 23, 0.14)');
    shGrad.addColorStop(1, 'rgba(28, 25, 23, 0)');
    targetCtx.save();
    targetCtx.translate(cx + bodyW * 0.06, shY);
    targetCtx.scale(1, 0.22);
    targetCtx.beginPath();
    targetCtx.arc(0, 0, bodyW * 0.72, 0, Math.PI * 2);
    targetCtx.fillStyle = shGrad;
    targetCtx.fill();
    targetCtx.restore();
  }

  // 2. Reusable stainless-steel straw (slightly tilted)
  const strawW = Math.max(8, Math.round(bodyW * 0.055));
  const strawX = cx - strawW / 2;
  const strawTop = topY;
  const strawGrad = targetCtx.createLinearGradient(strawX, 0, strawX + strawW, 0);
  strawGrad.addColorStop(0, '#8A857E');
  strawGrad.addColorStop(0.32, '#EAE6DF');
  strawGrad.addColorStop(0.55, '#B7B1A8');
  strawGrad.addColorStop(0.85, '#F5F2EB');
  strawGrad.addColorStop(1, '#757069');
  targetCtx.fillStyle = strawGrad;
  drawRoundedRectPath(targetCtx, strawX, strawTop, strawW, strawH + lidH * 0.5, strawW * 0.35);
  targetCtx.fill();

  // Straw top ellipse opening
  targetCtx.fillStyle = '#57534E';
  targetCtx.beginPath();
  targetCtx.ellipse(cx, strawTop + 2, strawW * 0.42, strawW * 0.16, 0, 0, Math.PI * 2);
  targetCtx.fill();

  // 3. Clear / Frosted Acrylic Lid
  const lidW = bodyW * 0.96;
  const lidLeft = cx - lidW / 2;
  const lidGrad = targetCtx.createLinearGradient(lidLeft, 0, lidLeft + lidW, 0);
  lidGrad.addColorStop(0, 'rgba(180, 176, 170, 0.85)');
  lidGrad.addColorStop(0.25, 'rgba(248, 246, 242, 0.95)');
  lidGrad.addColorStop(0.55, 'rgba(220, 216, 210, 0.88)');
  lidGrad.addColorStop(0.82, 'rgba(255, 253, 250, 0.96)');
  lidGrad.addColorStop(1, 'rgba(165, 160, 154, 0.85)');
  targetCtx.fillStyle = lidGrad;
  drawRoundedRectPath(targetCtx, lidLeft, bodyTopY - lidH, lidW, lidH + sag * 0.4, 8);
  targetCtx.fill();
  targetCtx.strokeStyle = 'rgba(120, 113, 108, 0.35)';
  targetCtx.lineWidth = 1.5;
  targetCtx.stroke();

  // Lid straw gasket collar
  targetCtx.fillStyle = '#D6D1C9';
  targetCtx.beginPath();
  targetCtx.ellipse(cx, bodyTopY - lidH * 0.85, strawW * 0.95, strawW * 0.32, 0, 0, Math.PI * 2);
  targetCtx.fill();

  // 4. Cylindrical Body (column-by-column curved wrap projection)
  const leftX = Math.round(cx - R);
  const rightX = Math.round(cx + R);
  const step = 1;

  for (let px = leftX; px <= rightX; px += step) {
    const dx = px - cx;
    const nx = Math.max(-1, Math.min(1, dx / R));
    const theta = Math.asin(nx); // [-pi/2, +pi/2]

    // Map angle onto wrap [0, 1): 0 rad = center (0.5), pi rad = seam (0.0/1.0)
    let u = (0.5 + (angleOffsetRad + theta) / (2 * Math.PI)) % 1;
    if (u < 0) u += 1;
    const sx = Math.min(srcW - 1, Math.max(0, Math.floor(u * srcW)));

    const curveDrop = Math.cos(theta) * sag;
    const colTop = bodyTopY + rimH * 0.4 + curveDrop;
    const colH = bodyH;

    targetCtx.drawImage(wrapCanvas, sx, 0, 1, srcH, px, colTop, step + 0.4, colH);
  }

  // 5. Photorealistic Cylindrical Lighting & Gloss Overlay
  const bodyClip = () => {
    targetCtx.beginPath();
    for (let px = leftX; px <= rightX; px += 4) {
      const nx = Math.max(-1, Math.min(1, (px - cx) / R));
      const drop = Math.cos(Math.asin(nx)) * sag;
      const y = bodyTopY + rimH * 0.4 + drop;
      if (px === leftX) targetCtx.moveTo(px, y);
      else targetCtx.lineTo(px, y);
    }
    for (let px = rightX; px >= leftX; px -= 4) {
      const nx = Math.max(-1, Math.min(1, (px - cx) / R));
      const drop = Math.cos(Math.asin(nx)) * sag;
      const y = bodyTopY + rimH * 0.4 + bodyH + drop;
      targetCtx.lineTo(px, y);
    }
    targetCtx.closePath();
  };

  targetCtx.save();
  bodyClip();
  targetCtx.clip();

  // Horizontal cylindrical ambient + specular gloss gradient
  const cylLight = targetCtx.createLinearGradient(leftX, 0, rightX, 0);
  cylLight.addColorStop(0.0, 'rgba(18, 14, 12, 0.42)');
  cylLight.addColorStop(0.14, 'rgba(28, 22, 18, 0.14)');
  cylLight.addColorStop(0.28, 'rgba(255, 252, 245, 0.22)'); // crisp studio reflection
  cylLight.addColorStop(0.36, 'rgba(255, 255, 255, 0.04)');
  cylLight.addColorStop(0.66, 'rgba(24, 20, 16, 0.06)');
  cylLight.addColorStop(0.84, 'rgba(255, 250, 242, 0.14)'); // soft rim bounce light
  cylLight.addColorStop(1.0, 'rgba(18, 14, 12, 0.44)');
  targetCtx.fillStyle = cylLight;
  targetCtx.fillRect(leftX, bodyTopY, bodyW + 2, bodyH + sag * 2);

  // Subtle top & bottom lip shading
  const vertShade = targetCtx.createLinearGradient(0, bodyTopY, 0, bodyTopY + bodyH + sag);
  vertShade.addColorStop(0.0, 'rgba(28, 25, 23, 0.18)');
  vertShade.addColorStop(0.06, 'rgba(28, 25, 23, 0)');
  vertShade.addColorStop(0.94, 'rgba(28, 25, 23, 0)');
  vertShade.addColorStop(1.0, 'rgba(28, 25, 23, 0.24)');
  targetCtx.fillStyle = vertShade;
  targetCtx.fillRect(leftX, bodyTopY, bodyW + 2, bodyH + sag * 2);

  targetCtx.restore();

  // 6. Brushed Stainless-Steel Top Rim
  targetCtx.beginPath();
  for (let px = leftX; px <= rightX; px += 4) {
    const nx = Math.max(-1, Math.min(1, (px - cx) / R));
    const drop = Math.cos(Math.asin(nx)) * sag;
    const y = bodyTopY + drop;
    if (px === leftX) targetCtx.moveTo(px, y);
    else targetCtx.lineTo(px, y);
  }
  for (let px = rightX; px >= leftX; px -= 4) {
    const nx = Math.max(-1, Math.min(1, (px - cx) / R));
    const drop = Math.cos(Math.asin(nx)) * sag;
    const y = bodyTopY + rimH + drop;
    targetCtx.lineTo(px, y);
  }
  targetCtx.closePath();

  const rimGrad = targetCtx.createLinearGradient(leftX, 0, rightX, 0);
  rimGrad.addColorStop(0, '#7B7670');
  rimGrad.addColorStop(0.28, '#F0EDE6');
  rimGrad.addColorStop(0.55, '#BDB7AE');
  rimGrad.addColorStop(0.82, '#E9E5DD');
  rimGrad.addColorStop(1, '#6E6963');
  targetCtx.fillStyle = rimGrad;
  targetCtx.fill();

  // Subtle stainless bottom foot edge
  targetCtx.beginPath();
  for (let px = leftX; px <= rightX; px += 4) {
    const nx = Math.max(-1, Math.min(1, (px - cx) / R));
    const drop = Math.cos(Math.asin(nx)) * sag;
    const y = bodyTopY + rimH * 0.4 + bodyH - 4 + drop;
    if (px === leftX) targetCtx.moveTo(px, y);
    else targetCtx.lineTo(px, y);
  }
  targetCtx.strokeStyle = 'rgba(235, 230, 222, 0.65)';
  targetCtx.lineWidth = 3;
  targetCtx.stroke();

  targetCtx.restore();
}

async function canvasToBlob(c: HTMLCanvasElement, mime: 'image/png' | 'image/jpeg', q = 0.94): Promise<Blob> {
  return new Promise((resolve, reject) => {
    c.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Export mockup impossible.'))),
      mime,
      q
    );
  });
}

export async function generateSingleTumblerMockups(
  tileImg: HTMLImageElement,
  repeats: 1 | 2 | 3 | 4 = 2
): Promise<TumblerMockupResult> {
  const wrapCanvas = buildWrapSourceCanvas(tileImg, repeats);

  // A. Solo Studio Mockup (2000x2000 warm cream editorial studio)
  const studio = document.createElement('canvas');
  studio.width = 2000;
  studio.height = 2000;
  const sCtx = studio.getContext('2d');
  if (!sCtx) throw new Error('Canvas Studio indisponible.');

  const bgGrad = sCtx.createRadialGradient(1000, 900, 120, 1000, 1000, 1250);
  bgGrad.addColorStop(0, '#FAF6F0');
  bgGrad.addColorStop(1, '#EDE4D5');
  sCtx.fillStyle = bgGrad;
  sCtx.fillRect(0, 0, 2000, 2000);

  // Subtle horizon studio table surface
  sCtx.fillStyle = '#E5DAC8';
  sCtx.fillRect(0, 1520, 2000, 480);
  sCtx.strokeStyle = '#D6C8B4';
  sCtx.lineWidth = 2;
  sCtx.beginPath();
  sCtx.moveTo(0, 1520);
  sCtx.lineTo(2000, 1520);
  sCtx.stroke();

  draw3DTumbler(sCtx, wrapCanvas, 1000, 210, 1340, 0, true);

  // B. Solo Transparent Mockup (1200x1800 RGBA PNG for Canva/ChatGPT backgrounds)
  const transp = document.createElement('canvas');
  transp.width = 1200;
  transp.height = 1800;
  const tCtx = transp.getContext('2d');
  if (!tCtx) throw new Error('Canvas Transparent indisponible.');
  draw3DTumbler(tCtx, wrapCanvas, 600, 110, 1340, 0, false);

  // C. Front + Back 360° Seamless Proof Mockup (2000x2000 Photo #2 Etsy)
  const fb = document.createElement('canvas');
  fb.width = 2000;
  fb.height = 2000;
  const fCtx = fb.getContext('2d');
  if (!fCtx) throw new Error('Canvas Front+Back indisponible.');

  const fbGrad = fCtx.createRadialGradient(1000, 920, 120, 1000, 1000, 1250);
  fbGrad.addColorStop(0, '#FAF6F0');
  fbGrad.addColorStop(1, '#EAE0CF');
  fCtx.fillStyle = fbGrad;
  fCtx.fillRect(0, 0, 2000, 2000);

  fCtx.fillStyle = '#E3D7C4';
  fCtx.fillRect(0, 1560, 2000, 440);

  // Top Header Text
  fCtx.fillStyle = '#7A1621';
  fCtx.font = '600 28px "Plus Jakarta Sans", sans-serif';
  fCtx.textAlign = 'center';
  fCtx.fillText('TRUE 360° SEAMLESS WRAP  ·  ZERO BACK SEAM LINE', 1000, 140);

  fCtx.fillStyle = '#1C1917';
  fCtx.font = '600 58px "Cormorant Garamond", Georgia, serif';
  fCtx.fillText('Front & Back View Comparison', 1000, 210);

  draw3DTumbler(fCtx, wrapCanvas, 650, 310, 1140, 0, true);
  draw3DTumbler(fCtx, wrapCanvas, 1350, 310, 1140, Math.PI, true);

  // Subtle labels under Front & Back
  fCtx.fillStyle = '#1C1917';
  fCtx.font = '600 26px "Plus Jakarta Sans", sans-serif';
  fCtx.fillText('FRONT VIEW (0°)', 650, 1745);
  fCtx.fillText('BACK SEAM VIEW (180°)', 1350, 1745);

  fCtx.fillStyle = '#57534E';
  fCtx.font = '500 22px "Plus Jakarta Sans", sans-serif';
  fCtx.fillText('20oz Skinny Tumbler  ·  9.3 × 8.2 in (2790 × 2460 px)  ·  300 DPI PNG', 1000, 1880);

  const [soloStudioBlob, soloTransparentBlob, frontBackBlob] = await Promise.all([
    canvasToBlob(studio, 'image/jpeg', 0.94),
    canvasToBlob(transp, 'image/png'),
    canvasToBlob(fb, 'image/jpeg', 0.94),
  ]);

  return {
    soloStudioUrl: studio.toDataURL('image/jpeg', 0.88),
    soloStudioBlob,
    soloTransparentUrl: transp.toDataURL('image/png'),
    soloTransparentBlob,
    frontBackUrl: fb.toDataURL('image/jpeg', 0.88),
    frontBackBlob,
  };
}

/**
 * Generates a 2000x2000 Etsy Listing Cover showing up to 12 3D Tumblers (2 rows x 6 cols)
 * numbered 01..12 with Plume Digital Shop editorial masthead and specs footer bar.
 */
export async function generateBundle12CoverMockup(
  tiles: MockupBundleTile[],
  repeats: 1 | 2 | 3 | 4 = 2,
  collectionTitle = 'Heritage Christmas'
): Promise<BundleCoverResult> {
  const W = 2000;
  const H = 2000;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('Canvas Cover indisponible.');

  // Warm luxury wood-parchment studio background
  const bg = ctx.createRadialGradient(1000, 820, 150, 1000, 1000, 1400);
  bg.addColorStop(0, '#FAF6F0');
  bg.addColorStop(0.65, '#F0E7D8');
  bg.addColorStop(1, '#DFD2BD');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle gold & burgundy luxury frame
  ctx.strokeStyle = '#B89758';
  ctx.lineWidth = 4;
  ctx.strokeRect(36, 36, W - 72, H - 72);
  ctx.strokeStyle = '#D6C8B4';
  ctx.lineWidth = 2;
  ctx.strokeRect(52, 52, W - 104, H - 104);

  // Top Editorial Crest Banner
  ctx.fillStyle = '#FAF6F0';
  ctx.strokeStyle = '#B89758';
  ctx.lineWidth = 4;
  drawRoundedRectPath(ctx, 430, 80, 1140, 320, 28);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#7A1621';
  ctx.fillRect(580, 330, 840, 52);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#1C1917';
  ctx.font = '600 32px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('P L U M E   ·   D I G I T A L   S H O P', 1000, 142);

  ctx.fillStyle = '#1C1917';
  ctx.font = 'italic 700 84px "Cormorant Garamond", Georgia, serif';
  ctx.fillText(collectionTitle, 1000, 232);

  ctx.fillStyle = '#2C2520';
  ctx.font = '600 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    tiles.length === 1 ? '20OZ SKINNY TUMBLER WRAP' : '20OZ SKINNY TUMBLER WRAP BUNDLE',
    1000,
    292
  );

  ctx.fillStyle = '#FAF6F0';
  ctx.font = '700 25px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    `${tiles.length} SEAMLESS DESIGN${tiles.length > 1 ? 'S' : ''}  ·  STRAIGHT & TAPERED`,
    1000,
    365
  );

  // Adaptive centered layout for 1-4 (Mini-Pack), 5-8 (2x4), or 9-12 (2x6) tumblers
  const count = Math.min(12, tiles.length);
  let maxCols = 6;
  let colStep = 314;
  let bodyH = 470;
  let rowTops = [445, 1105];

  if (count <= 4) {
    maxCols = Math.max(1, count);
    if (count === 1) {
      bodyH = 920;
      colStep = 0;
      rowTops = [495];
    } else if (count === 2) {
      bodyH = 880;
      colStep = 540;
      rowTops = [520];
    } else if (count === 3) {
      bodyH = 820;
      colStep = 450;
      rowTops = [560];
    } else {
      bodyH = 800;
      colStep = 400;
      rowTops = [575];
    }
  } else if (count <= 8) {
    maxCols = 4;
    colStep = 380;
    bodyH = 490;
    rowTops = [445, 1110];
  }

  const bodyW = Math.round(bodyH * (2.92 / 8.2));
  const strawAndLidH = Math.round(bodyH * 0.14) + Math.round(bodyH * 0.042);
  const sag = Math.max(6, Math.round(bodyW * 0.055));
  const badgeRadius = count <= 4 ? 34 : 28;
  const badgeFont = count <= 4 ? '700 28px "JetBrains Mono", monospace' : '700 24px "JetBrains Mono", monospace';

  for (let i = 0; i < count; i++) {
    const tile = tiles[i];
    const row = Math.floor(i / maxCols);
    const col = i % maxCols;
    const itemsInRow = Math.min(maxCols, count - row * maxCols);
    const rowStartX = 1000 - ((itemsInRow - 1) * colStep) / 2;
    const cx = rowStartX + col * colStep;
    const topY = rowTops[row] ?? rowTops[0];

    const wrap = buildWrapSourceCanvas(tile.img, repeats);
    draw3DTumbler(ctx, wrap, cx, topY, bodyH, 0, true);

    // Numbered badge cleanly positioned beneath tumbler bottom + contact shadow
    const badgeY = topY + strawAndLidH + bodyH + sag + badgeRadius + 24;
    ctx.fillStyle = '#FAF6F0';
    ctx.strokeStyle = '#B89758';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, badgeY, badgeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1C1917';
    ctx.font = badgeFont;
    ctx.textAlign = 'center';
    ctx.fillText(String(i + 1).padStart(2, '0'), cx, badgeY + (count <= 4 ? 10 : 8));
  }

  // Bottom Specs Footer Bar
  ctx.fillStyle = '#FAF6F0';
  ctx.strokeStyle = '#B89758';
  ctx.lineWidth = 3;
  drawRoundedRectPath(ctx, 110, 1790, 1780, 126, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#1C1917';
  ctx.font = '600 27px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    `${tiles.length * 2} PNG Files (Straight + Tapered)   |   9.3 × 8.2 in (2790 × 2460 px)   |   300 DPI   |   True 360° Seamless`,
    1000,
    1862
  );

  const coverBlob = await canvasToBlob(c, 'image/jpeg', 0.94);
  return {
    coverUrl: c.toDataURL('image/jpeg', 0.88),
    coverBlob,
  };
}
