/**
 * Selçuklu Esintili Ortak Geometrik Desen Üreteci
 * Hem dış köşkte (Parça 1) hem iç mekânda (Parça 2) aynı desen modülü kullanılır.
 */

export type DoorPatternId = 'yildizli-kafes' | 'gecmeli-kafes' | 'cizgili-kafes';
export type WindowPatternId = 'yildizli' | 'cicekli' | 'gecmeli';
export type OrnamentPatternId = 'yildiz-dizisi' | 'gecme-serit' | 'zikzak-serit';

export interface PatternPoint {
  x: number;
  y: number;
}

/** 4 köşeli eğik bant: [solÜst, sağÜst, sağAlt, solAlt] */
export type PatternQuad = readonly [PatternPoint, PatternPoint, PatternPoint, PatternPoint];

function clipPolygon(ctx: CanvasRenderingContext2D, points: readonly PatternPoint[]) {
  if (points.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.clip();
}

function getBounds(points: readonly PatternPoint[]) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return {
    x: minX,
    y: minY,
    w: Math.max(1, maxX - minX),
    h: Math.max(1, maxY - minY),
  };
}

function traceEightPointStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerRatio = 0.44,
) {
  const innerR = outerR * innerRatio;
  ctx.beginPath();
  for (let i = 0; i < 16; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / 8 - Math.PI / 2;
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

/**
 * Kapı açıklığına koyu ahşap geometrik kafes kapı çizer.
 */
export function drawDoorLatticeInPolygon(
  ctx: CanvasRenderingContext2D,
  polygon: readonly PatternPoint[],
  patternId: DoorPatternId,
  options?: { alpha?: number },
) {
  if (polygon.length < 3) return;
  const b = getBounds(polygon);
  ctx.save();
  if (options?.alpha !== undefined) ctx.globalAlpha *= options.alpha;
  clipPolygon(ctx, polygon);

  // Koyu iç gölge arka planı (kafes arkasındaki derinlik)
  const depthGrad = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
  depthGrad.addColorStop(0, '#1f150e');
  depthGrad.addColorStop(0.55, '#2b1d13');
  depthGrad.addColorStop(1, '#3a271a');
  ctx.fillStyle = depthGrad;
  ctx.fillRect(b.x, b.y, b.w, b.h);

  const woodDark = '#3f2414';
  const woodMain = '#633a20';
  const woodHighlight = '#8f5d38';
  const brass = '#c89b4b';

  // Çift kanat ahşap çerçeve dolgusu (yarı açık kafes)
  const frameThickness = Math.max(4, b.w * 0.095);

  if (patternId === 'yildizli-kafes') {
    const cell = Math.max(16, b.w * 0.28);
    ctx.strokeStyle = woodMain;
    ctx.lineWidth = Math.max(2, cell * 0.14);

    for (let y = b.y - cell * 0.3; y <= b.y + b.h + cell * 0.5; y += cell) {
      for (let x = b.x - cell * 0.2; x <= b.x + b.w + cell * 0.5; x += cell) {
        const cx = x + cell * 0.5;
        const cy = y + cell * 0.5;

        // Çapraz ahşap bağlantı çubukları
        ctx.strokeStyle = woodDark;
        ctx.lineWidth = Math.max(2.2, cell * 0.13);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + cell, y + cell);
        ctx.moveTo(x + cell, y);
        ctx.lineTo(x, y + cell);
        ctx.stroke();

        ctx.strokeStyle = woodMain;
        ctx.lineWidth = Math.max(1.5, cell * 0.085);
        ctx.stroke();

        // Sekiz köşeli ahşap yıldız göbeği
        traceEightPointStar(ctx, cx, cy, cell * 0.36, 0.46);
        ctx.fillStyle = woodMain;
        ctx.fill();
        ctx.strokeStyle = woodHighlight;
        ctx.lineWidth = Math.max(1, cell * 0.05);
        ctx.stroke();

        // Küçük pirinç kabara
        ctx.fillStyle = brass;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(1.4, cell * 0.06), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (patternId === 'gecmeli-kafes') {
    // Kündekâri geçmeli sekizgen ve baklava ahşap kafes
    const step = Math.max(15, b.w * 0.25);
    for (let row = -1; row <= Math.ceil(b.h / step) + 1; row++) {
      for (let col = -1; col <= Math.ceil(b.w / step) + 1; col++) {
        const cx = b.x + col * step + (row % 2 === 0 ? 0 : step * 0.5);
        const cy = b.y + row * step;
        const r = step * 0.46;

        ctx.beginPath();
        ctx.moveTo(cx, cy - r);
        ctx.lineTo(cx + r, cy);
        ctx.lineTo(cx, cy + r);
        ctx.lineTo(cx - r, cy);
        ctx.closePath();
        ctx.strokeStyle = woodDark;
        ctx.lineWidth = Math.max(3.2, step * 0.19);
        ctx.stroke();
        ctx.strokeStyle = woodMain;
        ctx.lineWidth = Math.max(2.1, step * 0.12);
        ctx.stroke();
        ctx.strokeStyle = woodHighlight;
        ctx.lineWidth = Math.max(0.8, step * 0.04);
        ctx.stroke();

        // İç düğüm karesi
        const ir = r * 0.34;
        ctx.fillStyle = woodMain;
        ctx.fillRect(cx - ir, cy - ir, ir * 2, ir * 2);
        ctx.strokeStyle = woodHighlight;
        ctx.lineWidth = 1;
        ctx.strokeRect(cx - ir, cy - ir, ir * 2, ir * 2);
      }
    }
  } else {
    // Çizgili kafes: düşey kayıtlar, yatay kuşaklar ve diyagonal çıtalar
    const vCols = 6;
    const hRows = 8;
    const dx = b.w / vCols;
    const dy = b.h / hRows;

    // İnce çapraz kafes
    ctx.strokeStyle = woodDark;
    ctx.lineWidth = Math.max(1.8, b.w * 0.025);
    for (let i = -hRows; i <= vCols + hRows; i++) {
      ctx.beginPath();
      ctx.moveTo(b.x + i * dx, b.y);
      ctx.lineTo(b.x + (i + 2) * dx, b.y + b.h);
      ctx.moveTo(b.x + i * dx, b.y);
      ctx.lineTo(b.x + (i - 2) * dx, b.y + b.h);
      ctx.stroke();
    }

    // Düşey ahşap çıtalar
    for (let c = 1; c < vCols; c++) {
      const vx = b.x + c * dx;
      ctx.strokeStyle = woodMain;
      ctx.lineWidth = Math.max(2.4, b.w * 0.04);
      ctx.beginPath();
      ctx.moveTo(vx, b.y);
      ctx.lineTo(vx, b.y + b.h);
      ctx.stroke();
      ctx.strokeStyle = woodHighlight;
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(vx - 1, b.y);
      ctx.lineTo(vx - 1, b.y + b.h);
      ctx.stroke();
    }

    // Yatay kuşaklar ve pirinç çiviler
    for (let r = 1; r < hRows; r++) {
      const hy = b.y + r * dy;
      ctx.strokeStyle = woodDark;
      ctx.lineWidth = Math.max(3, b.w * 0.045);
      ctx.beginPath();
      ctx.moveTo(b.x, hy);
      ctx.lineTo(b.x + b.w, hy);
      ctx.stroke();
      ctx.strokeStyle = woodHighlight;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(b.x, hy - 1);
      ctx.lineTo(b.x + b.w, hy - 1);
      ctx.stroke();
    }
  }

  // Orta çift kanat birleşim dikmesi ve ahşap kapı halkaları
  const midX = b.x + b.w * 0.5;
  ctx.fillStyle = woodDark;
  ctx.fillRect(midX - frameThickness * 0.45, b.y, frameThickness * 0.9, b.h);
  ctx.fillStyle = woodMain;
  ctx.fillRect(midX - frameThickness * 0.28, b.y, frameThickness * 0.56, b.h);

  // Pirinç kapı halkaları
  const ringY = b.y + b.h * 0.62;
  const ringR = Math.max(2.5, b.w * 0.042);
  ctx.strokeStyle = brass;
  ctx.lineWidth = Math.max(1.5, b.w * 0.018);
  ctx.beginPath();
  ctx.arc(midX - frameThickness * 1.05, ringY, ringR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(midX + frameThickness * 1.05, ringY, ringR, 0, Math.PI * 2);
  ctx.stroke();

  // Dış ahşap kasa konturu
  ctx.beginPath();
  ctx.moveTo(polygon[0].x, polygon[0].y);
  for (let i = 1; i < polygon.length; i++) ctx.lineTo(polygon[i].x, polygon[i].y);
  ctx.closePath();
  ctx.strokeStyle = woodDark;
  ctx.lineWidth = frameThickness * 1.4;
  ctx.stroke();
  ctx.strokeStyle = woodHighlight;
  ctx.lineWidth = Math.max(1.2, frameThickness * 0.22);
  ctx.stroke();

  ctx.restore();
}

/**
 * Tek bir pencere yuvasına beyaz/krem Selçuklu dantel geometrik süslemesi çizer.
 */
export function drawWindowTraceryInPolygon(
  ctx: CanvasRenderingContext2D,
  polygon: readonly PatternPoint[],
  patternId: WindowPatternId,
  options?: { alpha?: number; interiorLight?: boolean },
) {
  if (polygon.length < 3) return;
  const b = getBounds(polygon);
  ctx.save();
  if (options?.alpha !== undefined) ctx.globalAlpha *= options.alpha;
  clipPolygon(ctx, polygon);

  // Pencere boşluğu arka planı (dışta koyu derinlik, iç mekânda yumuşak gün ışığı)
  const bgGrad = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
  if (options?.interiorLight) {
    bgGrad.addColorStop(0, '#9bd0e8');
    bgGrad.addColorStop(1, '#dceff8');
  } else {
    bgGrad.addColorStop(0, '#2a3748');
    bgGrad.addColorStop(0.55, '#3b4c60');
    bgGrad.addColorStop(1, '#263140');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(b.x, b.y, b.w, b.h);

  const cream = '#f8f2e4';
  const creamShadow = '#c9bca5';
  const strokeMain = Math.max(1.3, Math.min(b.w, b.h) * 0.048);

  if (patternId === 'yildizli') {
    const cell = Math.max(11, b.w * 0.42);
    for (let y = b.y; y <= b.y + b.h + cell * 0.5; y += cell * 0.85) {
      for (let x = b.x; x <= b.x + b.w + cell * 0.5; x += cell * 0.85) {
        const cx = x + cell * 0.25;
        const cy = y + cell * 0.25;
        traceEightPointStar(ctx, cx, cy, cell * 0.42, 0.42);
        ctx.strokeStyle = creamShadow;
        ctx.lineWidth = strokeMain * 1.45;
        ctx.stroke();
        ctx.strokeStyle = cream;
        ctx.lineWidth = strokeMain;
        ctx.stroke();

        // İnce merkez noktası
        ctx.fillStyle = cream;
        ctx.beginPath();
        ctx.arc(cx, cy, strokeMain * 0.85, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (patternId === 'cicekli') {
    const cell = Math.max(13, b.w * 0.46);
    for (let y = b.y + cell * 0.35; y <= b.y + b.h + cell * 0.35; y += cell * 0.92) {
      for (let x = b.x + cell * 0.35; x <= b.x + b.w + cell * 0.35; x += cell * 0.92) {
        const pr = cell * 0.36;
        // 6 yapraklı Selçuklu rozet çiçeği
        ctx.strokeStyle = cream;
        ctx.lineWidth = strokeMain;
        for (let k = 0; k < 6; k++) {
          const ang = (k * Math.PI) / 3;
          const px = x + Math.cos(ang) * pr * 0.55;
          const py = y + Math.sin(ang) * pr * 0.55;
          ctx.beginPath();
          ctx.arc(px, py, pr * 0.45, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(x, y, pr * 0.24, 0, Math.PI * 2);
        ctx.fillStyle = cream;
        ctx.fill();
      }
    }
  } else {
    // Geçmeli dantel şebeke (çapraz ızgara + iç içe halkalar)
    const step = Math.max(10, b.w * 0.34);
    ctx.strokeStyle = creamShadow;
    ctx.lineWidth = strokeMain * 1.4;
    for (let x = b.x - b.h; x <= b.x + b.w + b.h; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, b.y);
      ctx.lineTo(x + b.h, b.y + b.h);
      ctx.moveTo(x, b.y);
      ctx.lineTo(x - b.h, b.y + b.h);
      ctx.stroke();
    }
    ctx.strokeStyle = cream;
    ctx.lineWidth = strokeMain;
    for (let x = b.x - b.h; x <= b.x + b.w + b.h; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, b.y);
      ctx.lineTo(x + b.h, b.y + b.h);
      ctx.moveTo(x, b.y);
      ctx.lineTo(x - b.h, b.y + b.h);
      ctx.stroke();
    }
    // Bağlantı halkaları
    for (let y = b.y + step * 0.5; y <= b.y + b.h; y += step) {
      for (let x = b.x + step * 0.5; x <= b.x + b.w; x += step) {
        ctx.beginPath();
        ctx.arc(x, y, step * 0.24, 0, Math.PI * 2);
        ctx.strokeStyle = cream;
        ctx.lineWidth = strokeMain;
        ctx.stroke();
      }
    }
  }

  // Krem alçı dış çerçeve
  ctx.beginPath();
  ctx.moveTo(polygon[0].x, polygon[0].y);
  for (let i = 1; i < polygon.length; i++) ctx.lineTo(polygon[i].x, polygon[i].y);
  ctx.closePath();
  ctx.strokeStyle = creamShadow;
  ctx.lineWidth = Math.max(2.6, strokeMain * 2.2);
  ctx.stroke();
  ctx.strokeStyle = cream;
  ctx.lineWidth = Math.max(1.4, strokeMain * 1.2);
  ctx.stroke();

  ctx.restore();
}

/**
 * Eğik (affine) dönüşümlü taş kabartma korniş friz şeridi çizer.
 * Quad sırası: [solÜst, sağÜst, sağAlt, solAlt]
 */
export function drawFriezeBandInQuad(
  ctx: CanvasRenderingContext2D,
  quad: PatternQuad,
  patternId: OrnamentPatternId,
  options?: { alpha?: number },
) {
  const [tl, tr, br, bl] = quad;
  const bandLen = Math.hypot(tr.x - tl.x, tr.y - tl.y);
  const bandH = Math.hypot(bl.x - tl.x, bl.y - tl.y);
  if (bandLen < 4 || bandH < 2) return;

  ctx.save();
  if (options?.alpha !== undefined) ctx.globalAlpha *= options.alpha;

  // Önce dörtgene kırp
  clipPolygon(ctx, [tl, tr, br, bl]);

  // Birim (0..bandLen, 0..bandH) uzayından eğik dörtgene affine matris
  const ax = (tr.x - tl.x) / bandLen;
  const ay = (tr.y - tl.y) / bandLen;
  const bx = (bl.x - tl.x) / bandH;
  const by = (bl.y - tl.y) / bandH;
  ctx.transform(ax, ay, bx, by, tl.x, tl.y);

  // Oyulmuş sıcak bej taş friz zemini
  const baseGrad = ctx.createLinearGradient(0, 0, 0, bandH);
  baseGrad.addColorStop(0, '#a98a5e');
  baseGrad.addColorStop(0.2, '#ccb085');
  baseGrad.addColorStop(0.82, '#dfc79e');
  baseGrad.addColorStop(1, '#9c7d52');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, bandLen, bandH);

  // Üst ve alt kabartma bordür çizgileri
  ctx.fillStyle = '#f6ebd3';
  ctx.fillRect(0, 1, bandLen, Math.max(1.2, bandH * 0.1));
  ctx.fillStyle = '#8b6d45';
  ctx.fillRect(0, bandH - Math.max(1.4, bandH * 0.12), bandLen, Math.max(1.4, bandH * 0.12));

  const reliefLight = '#f7ecd4';
  const reliefMid = '#e5cfab';
  const reliefShadow = '#8e6f46';

  if (patternId === 'yildiz-dizisi') {
    const step = Math.max(10, bandH * 1.15);
    const cy = bandH * 0.5;
    const r = bandH * 0.34;
    for (let x = step * 0.5; x < bandLen + step * 0.5; x += step) {
      // Yatay birleştirici taş şerit
      ctx.strokeStyle = reliefShadow;
      ctx.lineWidth = Math.max(1.5, bandH * 0.14);
      ctx.beginPath();
      ctx.moveTo(x - step * 0.5, cy);
      ctx.lineTo(x + step * 0.5, cy);
      ctx.stroke();

      // Gölge ofsetli kabartma yıldız
      traceEightPointStar(ctx, x + 0.8, cy + 0.9, r, 0.44);
      ctx.fillStyle = reliefShadow;
      ctx.fill();

      traceEightPointStar(ctx, x, cy, r, 0.44);
      ctx.fillStyle = reliefLight;
      ctx.fill();
      ctx.strokeStyle = reliefShadow;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.fillStyle = reliefMid;
      ctx.beginPath();
      ctx.arc(x, cy, r * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (patternId === 'gecme-serit') {
    // Selçuklu zencerek / geçme kabartma şerit
    const step = Math.max(12, bandH * 1.35);
    const topY = bandH * 0.26;
    const botY = bandH * 0.74;
    const strokeW = Math.max(1.6, bandH * 0.16);

    for (let pass = 0; pass < 2; pass++) {
      const offsetY = pass === 0 ? 0.9 : 0;
      ctx.strokeStyle = pass === 0 ? reliefShadow : reliefLight;
      ctx.lineWidth = pass === 0 ? strokeW * 1.25 : strokeW * 0.85;
      ctx.lineJoin = 'miter';

      ctx.beginPath();
      for (let x = -step; x <= bandLen + step; x += step) {
        ctx.moveTo(x, botY + offsetY);
        ctx.lineTo(x + step * 0.28, topY + offsetY);
        ctx.lineTo(x + step * 0.72, topY + offsetY);
        ctx.lineTo(x + step, botY + offsetY);
      }
      ctx.stroke();

      ctx.beginPath();
      for (let x = -step * 0.5; x <= bandLen + step; x += step) {
        ctx.moveTo(x, topY + offsetY);
        ctx.lineTo(x + step * 0.28, botY + offsetY);
        ctx.lineTo(x + step * 0.72, botY + offsetY);
        ctx.lineTo(x + step, topY + offsetY);
      }
      ctx.stroke();
    }
  } else {
    // Zikzak taş kabartma şeridi
    const step = Math.max(9, bandH * 0.95);
    const topY = bandH * 0.22;
    const botY = bandH * 0.78;
    const strokeW = Math.max(1.8, bandH * 0.18);

    // Üçgen gölge oyukları
    ctx.fillStyle = 'rgba(118, 90, 54, 0.38)';
    for (let x = 0; x < bandLen + step; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, botY);
      ctx.lineTo(x + step * 0.5, topY);
      ctx.lineTo(x + step, botY);
      ctx.closePath();
      ctx.fill();
    }

    // Kabartma zikzak çizgisi
    ctx.beginPath();
    ctx.moveTo(0, botY + 0.8);
    for (let x = 0; x <= bandLen + step; x += step) {
      ctx.lineTo(x + step * 0.5, topY + 0.8);
      ctx.lineTo(x + step, botY + 0.8);
    }
    ctx.strokeStyle = reliefShadow;
    ctx.lineWidth = strokeW * 1.3;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, botY);
    for (let x = 0; x <= bandLen + step; x += step) {
      ctx.lineTo(x + step * 0.5, topY);
      ctx.lineTo(x + step, botY);
    }
    ctx.strokeStyle = reliefLight;
    ctx.lineWidth = strokeW * 0.85;
    ctx.stroke();
  }

  ctx.restore();
}
