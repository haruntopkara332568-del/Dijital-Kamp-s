import {
  ARCHITECT_ASSETS,
  ARCHITECT_INTERIOR,
  ARCHITECT_SCENE_LAYOUT,
  ARCHITECT_TIMINGS,
  DOOR_OPTIONS,
  ORNAMENT_OPTIONS,
  PAVILION_SLOTS,
  ROOF_OPTIONS,
  WINDOW_OPTIONS,
  type ArchitectBuildStep,
  type ArchitectSelections,
  type CropRegionPercent,
  type PercentPoint,
  type PercentQuad,
  type RoofOptionId,
} from '@/src/data/architectExperienceConfig';
import type { StudentCharacterId } from '@/src/data/studentCharacters';
import type { GradeLevel } from '@/src/types/campus';
import type { ArchitectRuntimeSnapshot } from '../useArchitectExperience';
import type { PlayerCharacter, Position } from '../types';
import { getLoadedAsset } from './assetLoader';
import { drawCharacter } from './characterRenderer';
import {
  drawDoorLatticeInPolygon,
  drawFriezeBandInQuad,
  drawWindowTraceryInPolygon,
  type DoorPatternId,
  type OrnamentPatternId,
  type PatternPoint,
  type PatternQuad,
  type WindowPatternId,
} from './seljukPatternGenerator';

export function preloadArchitectAssets(): void {
  getLoadedAsset(ARCHITECT_ASSETS.body);
  getLoadedAsset(ARCHITECT_ASSETS.roofs.kubbe);
  getLoadedAsset(ARCHITECT_ASSETS.roofs['konik-kulah']);
  getLoadedAsset(ARCHITECT_ASSETS.roofs['piramit-cati']);
  getLoadedAsset(ARCHITECT_ASSETS.architect);
  getLoadedAsset(ARCHITECT_ASSETS.interiorBg);
}

function easeOutCubic(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - c, 3);
}

function mapPercentPointsRect(
  points: readonly PercentPoint[],
  boxX: number,
  boxY: number,
  boxW: number,
  boxH: number,
): PatternPoint[] {
  return points.map((p) => ({
    x: boxX + (p.x / 100) * boxW,
    y: boxY + (p.y / 100) * boxH,
  }));
}

function mapPercentQuadRect(
  quad: PercentQuad,
  boxX: number,
  boxY: number,
  boxW: number,
  boxH: number,
): PatternQuad {
  return [
    { x: boxX + (quad[0].x / 100) * boxW, y: boxY + (quad[0].y / 100) * boxH },
    { x: boxX + (quad[1].x / 100) * boxW, y: boxY + (quad[1].y / 100) * boxH },
    { x: boxX + (quad[2].x / 100) * boxW, y: boxY + (quad[2].y / 100) * boxH },
    { x: boxX + (quad[3].x / 100) * boxW, y: boxY + (quad[3].y / 100) * boxH },
  ];
}

/** Noktanın konveks yürünebilir zemin çokgeni içinde olup olmadığını kontrol eder */
export function isPointInWalkablePolygon(
  x: number,
  y: number,
  poly: readonly PercentPoint[] = ARCHITECT_INTERIOR.walkablePolygon,
): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x;
    const yi = poly[i].y;
    const xj = poly[j].x;
    const yj = poly[j].y;
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Noktayı en yakın yürünebilir çokgen kenarına güvenli biçimde kaydırır (duvardan çıkışı engeller) */
export function clampToWalkablePolygon(
  x: number,
  y: number,
  poly: readonly PercentPoint[] = ARCHITECT_INTERIOR.walkablePolygon,
): Position {
  if (isPointInWalkablePolygon(x, y, poly)) {
    return { x, y };
  }
  let bestX = x;
  let bestY = y;
  let bestDist2 = Infinity;

  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    const len2 = abx * abx + aby * aby;
    const t = len2 > 1e-6 ? Math.max(0, Math.min(1, ((x - a.x) * abx + (y - a.y) * aby) / len2)) : 0;
    const px = a.x + abx * t;
    const py = a.y + aby * t;
    const d2 = (x - px) * (x - px) + (y - py) * (y - py);
    if (d2 < bestDist2) {
      bestDist2 = d2;
      bestX = px;
      bestY = py;
    }
  }
  return { x: bestX, y: bestY };
}

/** Görsel yüklenemezse çökmeden çalışan sade yer tutucu gövde */
function drawBodyPlaceholder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
) {
  ctx.save();
  ctx.fillStyle = '#e7e2d8';
  ctx.strokeStyle = '#9b8d79';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.19, y + size * 0.91);
  ctx.lineTo(x + size * 0.34, y + size * 0.96);
  ctx.lineTo(x + size * 0.66, y + size * 0.96);
  ctx.lineTo(x + size * 0.81, y + size * 0.91);
  ctx.lineTo(x + size * 0.78, y + size * 0.88);
  ctx.lineTo(x + size * 0.22, y + size * 0.88);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#dfc69d';
  ctx.strokeStyle = '#8f724d';
  ctx.fillRect(x + size * 0.22, y + size * 0.60, size * 0.56, size * 0.32);
  ctx.strokeRect(x + size * 0.22, y + size * 0.60, size * 0.56, size * 0.32);

  ctx.fillStyle = '#e5cfa9';
  ctx.fillRect(x + size * 0.285, y + size * 0.42, size * 0.43, size * 0.18);
  ctx.strokeRect(x + size * 0.285, y + size * 0.42, size * 0.43, size * 0.18);

  const doorPts = mapPercentPointsRect(PAVILION_SLOTS.doorPolygon, x, y, size, size);
  ctx.fillStyle = '#1b120c';
  ctx.beginPath();
  ctx.moveTo(doorPts[0].x, doorPts[0].y);
  for (let i = 1; i < doorPts.length; i++) ctx.lineTo(doorPts[i].x, doorPts[i].y);
  ctx.closePath();
  ctx.fill();

  for (const winPoly of PAVILION_SLOTS.windowPolygons) {
    const pts = mapPercentPointsRect(winPoly, x, y, size, size);
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawRoofPlaceholder(
  ctx: CanvasRenderingContext2D,
  roofId: RoofOptionId,
  x: number,
  y: number,
  size: number,
) {
  const cx = x + size * 0.5;
  const baseY = y + size * 0.44;
  ctx.save();
  if (roofId === 'kubbe') {
    ctx.fillStyle = '#a34549';
    ctx.strokeStyle = '#efe2c8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(cx, baseY, size * 0.20, size * 0.24, 0, Math.PI, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (roofId === 'konik-kulah') {
    ctx.fillStyle = '#d9be92';
    ctx.strokeStyle = '#8f724d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.21, baseY);
    ctx.lineTo(cx, y + size * 0.10);
    ctx.lineTo(cx + size * 0.21, baseY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.fillStyle = '#c47451';
    ctx.strokeStyle = '#e7d5b4';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.22, baseY);
    ctx.lineTo(cx, y + size * 0.18);
    ctx.lineTo(cx + size * 0.22, baseY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function drawArchitectPlaceholder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  ctx.save();
  const cx = x + w * 0.5;
  ctx.fillStyle = '#c58435';
  ctx.beginPath();
  ctx.roundRect(cx - w * 0.26, y + h * 0.28, w * 0.52, h * 0.36, 12);
  ctx.fill();
  ctx.fillStyle = '#313742';
  ctx.fillRect(cx - w * 0.2, y + h * 0.62, w * 0.4, h * 0.34);
  ctx.fillStyle = '#f2c5a1';
  ctx.beginPath();
  ctx.arc(cx, y + h * 0.17, w * 0.19, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** İç mekân arka planı yüklenmezse göz hizası 2.5D taş oda yer tutucusu */
function drawInteriorPlaceholder(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  // Taş duvarlar
  const wallGrad = ctx.createLinearGradient(0, 0, 0, h * 0.78);
  wallGrad.addColorStop(0, '#d5b98e');
  wallGrad.addColorStop(1, '#e6d1aa');
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, w, h * 0.78);

  // Köşe payeleri
  ctx.fillStyle = '#c7a777';
  ctx.fillRect(w * 0.33, 0, w * 0.03, h * 0.77);
  ctx.fillRect(w * 0.64, 0, w * 0.03, h * 0.77);

  // Zemin
  const floorGrad = ctx.createLinearGradient(0, h * 0.76, 0, h);
  floorGrad.addColorStop(0, '#e3cea5');
  floorGrad.addColorStop(1, '#d1b586');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, h * 0.76, w, h * 0.24);
  ctx.restore();
}

function drawDebugPolygon(
  ctx: CanvasRenderingContext2D,
  pts: readonly PatternPoint[],
  fill: string,
  stroke: string,
  label: string,
) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 3]);
  ctx.stroke();
  ctx.setLineDash([]);

  const avgX = pts.reduce((s, p) => s + p.x, 0) / pts.length;
  const avgY = pts.reduce((s, p) => s + p.y, 0) / pts.length;
  ctx.fillStyle = '#0f172a';
  ctx.fillText(label, avgX, avgY);
  ctx.restore();
}

/** Gövde + aktif çatı + aktif geometrik desen katmanlarını tek tuvale çizer */
export function drawPavilionComposite(
  ctx: CanvasRenderingContext2D,
  boxX: number,
  boxY: number,
  boxSize: number,
  effective: ArchitectSelections,
  options?: {
    settlingStep?: ArchitectBuildStep | null;
    settleProgress?: number;
    sweepProgress?: number;
    debugSlots?: boolean;
  },
) {
  const settlingStep = options?.settlingStep ?? null;
  const settleEase = easeOutCubic(options?.settleProgress ?? 1);

  // 1. ÇATI (tamburu saran taş kornişin arkasına bina ile paralel oturur)
  if (effective.roof) {
    const roofOffsetY =
      settlingStep === 'STEP_ROOF' ? (1 - settleEase) * (-boxSize * 0.032) : 0;
    const roofAlpha = settlingStep === 'STEP_ROOF' ? 0.55 + 0.45 * settleEase : 1;
    const roofImg = getLoadedAsset(ARCHITECT_ASSETS.roofs[effective.roof]);
    ctx.save();
    ctx.globalAlpha = roofAlpha;
    if (roofImg) {
      ctx.drawImage(roofImg, boxX, boxY + roofOffsetY, boxSize, boxSize);
    } else {
      drawRoofPlaceholder(ctx, effective.roof, boxX, boxY + roofOffsetY, boxSize);
    }
    ctx.restore();
  }

  // 2. KÖŞK GÖVDESİ
  const bodyImg = getLoadedAsset(ARCHITECT_ASSETS.body);
  if (bodyImg) {
    ctx.drawImage(bodyImg, boxX, boxY, boxSize, boxSize);
  } else {
    drawBodyPlaceholder(ctx, boxX, boxY, boxSize);
  }

  // 3. KAPI KAFESİ
  if (effective.door) {
    const doorPoly = mapPercentPointsRect(PAVILION_SLOTS.doorPolygon, boxX, boxY, boxSize, boxSize);
    const doorAlpha = settlingStep === 'STEP_DOOR' ? 0.45 + 0.55 * settleEase : 1;
    drawDoorLatticeInPolygon(ctx, doorPoly, effective.door, { alpha: doorAlpha });
  }

  // 4. TAMBUR PENCERELERİ
  if (effective.window) {
    const winAlpha = settlingStep === 'STEP_WINDOW' ? 0.45 + 0.55 * settleEase : 1;
    for (const winPolyPct of PAVILION_SLOTS.windowPolygons) {
      const winPoly = mapPercentPointsRect(winPolyPct, boxX, boxY, boxSize, boxSize);
      drawWindowTraceryInPolygon(ctx, winPoly, effective.window, { alpha: winAlpha });
    }
  }

  // 5. KORNİŞ SÜSLEME FRİZLERİ
  if (effective.ornament) {
    const frizAlpha = settlingStep === 'STEP_ORNAMENT' ? 0.45 + 0.55 * settleEase : 1;
    for (const quadPct of PAVILION_SLOTS.friezeQuads) {
      const quad = mapPercentQuadRect(quadPct, boxX, boxY, boxSize, boxSize);
      drawFriezeBandInQuad(ctx, quad, effective.ornament, { alpha: frizAlpha });
    }
  }

  // 6. BUILD_DONE YUMUŞAK IŞIK GEÇİŞİ
  const sweep = options?.sweepProgress ?? -1;
  if (sweep >= 0 && sweep < 1) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(boxX + boxSize * 0.14, boxY + boxSize * 0.04, boxSize * 0.72, boxSize * 0.93);
    ctx.clip();

    const bandCenterX = boxX + boxSize * (0.05 + sweep * 0.9);
    const bandHalfW = boxSize * 0.16;
    const sheen = ctx.createLinearGradient(
      bandCenterX - bandHalfW,
      boxY,
      bandCenterX + bandHalfW,
      boxY + boxSize * 0.45,
    );
    sheen.addColorStop(0, 'rgba(255, 249, 224, 0)');
    sheen.addColorStop(0.5, 'rgba(255, 248, 220, 0.34)');
    sheen.addColorStop(1, 'rgba(255, 249, 224, 0)');
    ctx.fillStyle = sheen;
    ctx.fillRect(boxX, boxY, boxSize, boxSize);
    ctx.restore();
  }

  // 7. GELİŞTİRME MODU YUVA KONTROLÜ (`?debug=kosk`)
  if (options?.debugSlots) {
    ctx.save();
    ctx.font = `700 ${Math.max(10, Math.round(boxSize * 0.018))}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    drawDebugPolygon(
      ctx,
      mapPercentPointsRect(PAVILION_SLOTS.doorPolygon, boxX, boxY, boxSize, boxSize),
      'rgba(234, 88, 12, 0.32)',
      '#ea580c',
      'KAPI',
    );
    PAVILION_SLOTS.windowPolygons.forEach((wp, i) => {
      drawDebugPolygon(
        ctx,
        mapPercentPointsRect(wp, boxX, boxY, boxSize, boxSize),
        'rgba(14, 165, 233, 0.34)',
        '#0284c7',
        `P${i + 1}`,
      );
    });
    PAVILION_SLOTS.friezeQuads.forEach((fq, i) => {
      drawDebugPolygon(
        ctx,
        mapPercentQuadRect(fq, boxX, boxY, boxSize, boxSize),
        'rgba(16, 185, 129, 0.34)',
        '#059669',
        `F${i + 1}`,
      );
    });

    const rs = PAVILION_SLOTS.roofSeatBox;
    ctx.strokeStyle = '#9333ea';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(
      boxX + (rs.x / 100) * boxSize,
      boxY + (rs.y / 100) * boxSize,
      (rs.w / 100) * boxSize,
      (rs.h / 100) * boxSize,
    );
    ctx.setLineDash([]);
    ctx.restore();
  }
}

export interface RenderedSceneAnchors {
  architectBubbleX: number;
  architectBubbleY: number;
}

/**
 * Mimar dış mekân sahnesini (gökyüzü, taş avlu, köşk, Mimar ve ENTER_WALK öğrenci yürüyüşü) çizer.
 */
export function renderArchitectExteriorScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  snapshot: ArchitectRuntimeSnapshot,
  debugSlots: boolean,
  studentMeta?: { characterId?: StudentCharacterId; grade: GradeLevel; now: number },
): RenderedSceneAnchors {
  const isNarrow = width < 640;

  // 1. Açık mavi gökyüzü
  const horizonY = Math.round(
    height *
      (isNarrow
        ? ARCHITECT_SCENE_LAYOUT.horizonRatioMobile
        : ARCHITECT_SCENE_LAYOUT.horizonRatioDesktop),
  );
  const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
  skyGrad.addColorStop(0, '#5ea4d8');
  skyGrad.addColorStop(0.58, '#a9d7f0');
  skyGrad.addColorStop(1, '#f3e8d2');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, horizonY + 2);

  const sunGlow = ctx.createRadialGradient(
    width * 0.16,
    height * 0.14,
    10,
    width * 0.16,
    height * 0.14,
    Math.max(width, height) * 0.36,
  );
  sunGlow.addColorStop(0, 'rgba(255, 251, 232, 0.65)');
  sunGlow.addColorStop(0.5, 'rgba(255, 240, 198, 0.2)');
  sunGlow.addColorStop(1, 'rgba(255, 240, 198, 0)');
  ctx.fillStyle = sunGlow;
  ctx.fillRect(0, 0, width, horizonY);

  // 2. Sıcak taş zemin
  const groundGrad = ctx.createLinearGradient(0, horizonY, 0, height);
  groundGrad.addColorStop(0, '#e8d7b7');
  groundGrad.addColorStop(0.45, '#dcc49a');
  groundGrad.addColorStop(1, '#c8ab7d');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, horizonY, width, height - horizonY);

  ctx.fillStyle = 'rgba(176, 146, 102, 0.38)';
  ctx.fillRect(0, horizonY - 2, width, 4);

  ctx.save();
  ctx.strokeStyle = 'rgba(146, 118, 78, 0.22)';
  ctx.lineWidth = 1;
  const rows = 8;
  for (let i = 1; i <= rows; i++) {
    const t = Math.pow(i / rows, 1.55);
    const ry = horizonY + t * (height - horizonY);
    ctx.beginPath();
    ctx.moveTo(0, ry);
    ctx.lineTo(width, ry);
    ctx.stroke();
  }
  const vpX = width * 0.5;
  for (let i = -8; i <= 8; i++) {
    ctx.beginPath();
    ctx.moveTo(vpX + i * (width * 0.08), horizonY);
    ctx.lineTo(vpX + i * (width * 0.22), height);
    ctx.stroke();
  }
  ctx.restore();

  // 3. Köşk konumu ve ölçeği
  const pavSize = Math.min(
    width * (isNarrow ? 0.88 : 0.62),
    height *
      (isNarrow
        ? ARCHITECT_SCENE_LAYOUT.mobilePavilionHeightRatio
        : ARCHITECT_SCENE_LAYOUT.desktopPavilionHeightRatio),
  );
  const pavCenterX = width * (isNarrow ? 0.55 : 0.53);
  const pavCenterY =
    height *
    (isNarrow
      ? ARCHITECT_SCENE_LAYOUT.mobilePavilionCenterYRatio
      : ARCHITECT_SCENE_LAYOUT.desktopPavilionCenterYRatio);
  const pavX = pavCenterX - pavSize * 0.5;
  const pavY = pavCenterY - pavSize * 0.5;

  // Zemin temas gölgesi
  ctx.save();
  ctx.fillStyle = 'rgba(72, 54, 32, 0.22)';
  ctx.beginPath();
  ctx.ellipse(
    pavCenterX + pavSize * 0.04,
    pavY + pavSize * 0.945,
    pavSize * 0.34,
    pavSize * 0.045,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.restore();

  const effective: ArchitectSelections = { ...snapshot.selections };
  if (snapshot.previewValue) {
    if (snapshot.flowState === 'STEP_DOOR') effective.door = snapshot.previewValue as DoorPatternId;
    else if (snapshot.flowState === 'STEP_WINDOW') {
      effective.window = snapshot.previewValue as WindowPatternId;
    } else if (snapshot.flowState === 'STEP_ROOF') {
      effective.roof = snapshot.previewValue as RoofOptionId;
    } else if (snapshot.flowState === 'STEP_ORNAMENT') {
      effective.ornament = snapshot.previewValue as OrnamentPatternId;
    }
  }

  drawPavilionComposite(ctx, pavX, pavY, pavSize, effective, {
    settlingStep: snapshot.anim.settlingStep,
    settleProgress: snapshot.anim.settleProgress,
    sweepProgress: snapshot.anim.sweepProgress,
    debugSlots,
  });

  // 4. Kadın Mimar karakteri
  const archH = Math.max(
    112,
    Math.min(240, pavSize * ARCHITECT_SCENE_LAYOUT.architectHeightToPavilionRatio),
  );
  const archImg = getLoadedAsset(ARCHITECT_ASSETS.architect);
  const archAspect =
    archImg && archImg.naturalHeight > 0 ? archImg.naturalWidth / archImg.naturalHeight : 0.4;
  const archW = archH * archAspect;
  const archFeetY = pavY + pavSize * 0.955;
  const archCenterX = Math.max(
    archW * 0.62 + 12,
    pavCenterX + pavSize * (isNarrow ? -0.37 : ARCHITECT_SCENE_LAYOUT.architectOffsetXFactor),
  );
  const archX = archCenterX - archW * 0.5;
  const archY = archFeetY - archH;

  ctx.fillStyle = 'rgba(54, 40, 24, 0.24)';
  ctx.beginPath();
  ctx.ellipse(archCenterX + 3, archFeetY - 2, archW * 0.34, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  if (archImg) {
    ctx.drawImage(archImg, archX, archY, archW, archH);
  } else {
    drawArchitectPlaceholder(ctx, archX, archY, archW, archH);
  }

  // 5. Parça 2 — ENTER_WALK: Öğrencinin KENDİ kampüs karakteri kapıya yürür (2.2–2.5× kapı oranı, maks %10 küçülme)
  if (snapshot.flowState === 'ENTER_WALK') {
    const p = snapshot.anim.enterWalkProgress;
    const walkT = Math.min(1, p / 0.72);
    const fadeOutT = p > 0.72 ? Math.min(1, (p - 0.72) / 0.14) : 0;
    const charAlpha = Math.max(0, 1 - fadeOutT);

    // Kapı yüksekliği (pavSize'ın %16.1'i) / 2.35 oranı -> öğrenci başlangıç boyu
    const doorHeightPx = ((92.3 - 76.2) / 100) * pavSize;
    const baseStudentH = Math.max(38, doorHeightPx / ARCHITECT_TIMINGS.doorToStudentHeightRatio);
    const shrinkFactor = 1 - walkT * ARCHITECT_TIMINGS.enterWalkMaxShrink; // En fazla %10 küçülme
    const scaleRatio = (baseStudentH * shrinkFactor) / 67;

    const startX = pavCenterX;
    const startY = Math.min(height - 96, pavY + pavSize * 1.12);
    const doorThresholdY = pavY + pavSize * 0.905;
    const curY = startY + (doorThresholdY - startY) * walkT;

    const walkCycleFrame = ((studentMeta?.now ?? performance.now()) / 155) % 4;
    const walkingStudent: PlayerCharacter = {
      characterId: studentMeta?.characterId,
      x: 0,
      y: 0,
      width: 53,
      height: 67,
      direction: 'up',
      state: walkT < 0.98 ? 'walk' : 'idle',
      speed: 140,
      walkFrame: walkCycleFrame,
      grade: studentMeta?.grade ?? 3,
    };

    if (charAlpha > 0.01) {
      ctx.save();
      ctx.globalAlpha = charAlpha;
      ctx.translate(startX, curY);
      ctx.scale(scaleRatio, scaleRatio);
      drawCharacter(ctx, walkingStudent, 'idle');
      ctx.restore();
    }
  }

  // Geçiş karartma örtüsü (ENTER_WALK sonu -> INTERIOR_WALK)
  if (snapshot.anim.fadeOverlayAlpha > 0.005) {
    ctx.save();
    ctx.fillStyle = `rgba(38, 28, 18, ${snapshot.anim.fadeOverlayAlpha.toFixed(3)})`;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  return {
    architectBubbleX: Math.min(width - 150, Math.max(150, archCenterX + (isNarrow ? 65 : 22))),
    architectBubbleY: Math.max(76, archY - 12),
  };
}

export interface InteriorOffscreenIndicator {
  visible: boolean;
  edgeX: number;
  edgeY: number;
  angleRad: number;
}

export interface InteriorRenderMetrics {
  worldOffsetX: number;
  worldOffsetY: number;
  scale: number;
  offscreenMarker: InteriorOffscreenIndicator | null;
}

/** Parlayan 8 köşeli Selçuklu yıldız hedef mozaiğini iç mekân zeminine çizer */
function drawTargetStarMosaic(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  now: number,
  active: boolean,
  reducedMotion: boolean,
) {
  const pulse = active && !reducedMotion ? 0.5 + 0.5 * Math.sin(now / 360) : 0.4;
  ctx.save();
  ctx.translate(x, y);
  // 2.5D perspektif basıklığı (zemin düzlemi)
  ctx.scale(1, 0.42);

  // Dış yumuşak altın parıltı halkası
  const glowR = radius * (1.35 + pulse * 0.35);
  const glow = ctx.createRadialGradient(0, 0, radius * 0.25, 0, 0, glowR);
  glow.addColorStop(0, active ? 'rgba(250, 204, 21, 0.58)' : 'rgba(16, 185, 129, 0.35)');
  glow.addColorStop(1, 'rgba(250, 204, 21, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, glowR, 0, Math.PI * 2);
  ctx.fill();

  // Taş madalyon çerçevesi
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(246, 232, 198, 0.9)';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = active ? '#b7791f' : '#0f766e';
  ctx.stroke();

  // 8 köşeli Selçuklu yıldızı
  const innerR = radius * 0.44;
  const outerR = radius * 0.84;
  ctx.beginPath();
  for (let i = 0; i < 16; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / 8 - Math.PI / 2;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = active ? '#d99626' : '#158c84';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#fff5d6';
  ctx.stroke();

  ctx.restore();
}

/**
 * Parça 2 — 2.5D göz hizası sekizgen köşk iç mekân sahnesini çizer.
 * Öğrencinin seçtiği pencere ve süsleme desenleri aynı desen üreteciyle içeride görünür.
 */
export function renderArchitectInteriorScene(
  ctx: CanvasRenderingContext2D,
  viewW: number,
  viewH: number,
  snapshot: ArchitectRuntimeSnapshot,
  student: PlayerCharacter,
  cameraCenter: Position,
  now: number,
  debugSlots: boolean,
  reducedMotion: boolean,
): InteriorRenderMetrics {
  const worldW = ARCHITECT_INTERIOR.worldWidth;
  const worldH = ARCHITECT_INTERIOR.worldHeight;

  // Ekranı dolduran yumuşak 2.5D kamera ölçeği (dar telefonda yüksekliğe oturur, yatayda takip eder)
  const scale = Math.max(viewW / worldW, viewH / worldH);
  const visibleWorldW = viewW / scale;
  const visibleWorldH = viewH / scale;

  const minCamX = ARCHITECT_INTERIOR.cameraBounds.minX + visibleWorldW * 0.5;
  const maxCamX = ARCHITECT_INTERIOR.cameraBounds.maxX - visibleWorldW * 0.5;
  const minCamY = ARCHITECT_INTERIOR.cameraBounds.minY + visibleWorldH * 0.5;
  const maxCamY = ARCHITECT_INTERIOR.cameraBounds.maxY - visibleWorldH * 0.5;

  const camX =
    minCamX <= maxCamX
      ? Math.max(minCamX, Math.min(maxCamX, cameraCenter.x))
      : worldW * 0.5;
  const camY =
    minCamY <= maxCamY
      ? Math.max(minCamY, Math.min(maxCamY, cameraCenter.y))
      : worldH * 0.5;

  const worldOffsetX = viewW * 0.5 - camX * scale;
  const worldOffsetY = viewH * 0.5 - camY * scale;

  ctx.save();
  ctx.fillStyle = '#d9c298';
  ctx.fillRect(0, 0, viewW, viewH);

  ctx.translate(worldOffsetX, worldOffsetY);
  ctx.scale(scale, scale);

  // 1. İç mekân göz hizası arka planı (veya yer tutucu)
  const bgImg = getLoadedAsset(ARCHITECT_ASSETS.interiorBg);
  if (bgImg) {
    ctx.drawImage(bgImg, 0, 0, worldW, worldH);
  } else {
    drawInteriorPlaceholder(ctx, worldW, worldH);
  }

  // 2. Seçilen PENCERE DESENİ (aynı ortak desen üreteciyle 3 üst pencerede)
  if (snapshot.selections.window) {
    for (const winPolyPct of ARCHITECT_INTERIOR.windowPolygons) {
      const winPoly = mapPercentPointsRect(winPolyPct, 0, 0, worldW, worldH);
      drawWindowTraceryInPolygon(ctx, winPoly, snapshot.selections.window, {
        interiorLight: true,
      });
    }
  }

  // 3. Seçilen SÜSLEME FRİZİ (aynı ortak desen üreteciyle 3 iç korniş bandında)
  if (snapshot.selections.ornament) {
    for (const quadPct of ARCHITECT_INTERIOR.friezeQuads) {
      const quad = mapPercentQuadRect(quadPct, 0, 0, worldW, worldH);
      drawFriezeBandInQuad(ctx, quad, snapshot.selections.ornament);
    }
  }

  // 4. Zemin parlayan sekiz köşeli yıldız hedef mozaiği
  const marker = ARCHITECT_INTERIOR.targetMarker;
  drawTargetStarMosaic(
    ctx,
    marker.x,
    marker.y,
    marker.radius,
    now,
    snapshot.flowState === 'INTERIOR_WALK',
    reducedMotion,
  );

  // 5. Öğrencinin KENDİ kampüs karakteri (ölçekli gerçek iç mekân yürüyüşü)
  const charScale = ARCHITECT_INTERIOR.studentHeightPx / 67;
  ctx.save();
  ctx.translate(student.x, student.y);
  ctx.scale(charScale, charScale);
  drawCharacter(
    ctx,
    {
      ...student,
      x: 0,
      y: 0,
    },
    'idle',
  );
  ctx.restore();

  // 6. Geliştirme modu `?debug=kosk` iç mekân yuva ve yürünebilir çokgen kontrolü
  if (debugSlots) {
    ctx.save();
    ctx.font = '700 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ARCHITECT_INTERIOR.windowPolygons.forEach((wp, i) => {
      drawDebugPolygon(
        ctx,
        mapPercentPointsRect(wp, 0, 0, worldW, worldH),
        'rgba(14, 165, 233, 0.30)',
        '#0284c7',
        `İÇ-P${i + 1}`,
      );
    });
    ARCHITECT_INTERIOR.friezeQuads.forEach((fq, i) => {
      drawDebugPolygon(
        ctx,
        mapPercentQuadRect(fq, 0, 0, worldW, worldH),
        'rgba(16, 185, 129, 0.30)',
        '#059669',
        `İÇ-F${i + 1}`,
      );
    });
    drawDebugPolygon(
      ctx,
      ARCHITECT_INTERIOR.walkablePolygon,
      'rgba(234, 179, 8, 0.18)',
      '#ca8a04',
      'YÜRÜNEBİLİR ALAN',
    );
    ctx.restore();
  }

  ctx.restore();

  // 7. İç mekâna yumuşak aydınlanma (fade-in)
  if (snapshot.anim.fadeOverlayAlpha > 0.005) {
    ctx.save();
    ctx.fillStyle = `rgba(38, 28, 18, ${snapshot.anim.fadeOverlayAlpha.toFixed(3)})`;
    ctx.fillRect(0, 0, viewW, viewH);
    ctx.restore();
  }

  // 8. İşaretli yıldız ekran dışındaysa yön oku hesapla
  const markerScreenX = worldOffsetX + marker.x * scale;
  const markerScreenY = worldOffsetY + marker.y * scale;
  const margin = 36;
  const isOffscreen =
    snapshot.flowState === 'INTERIOR_WALK' &&
    (markerScreenX < margin ||
      markerScreenX > viewW - margin ||
      markerScreenY < margin ||
      markerScreenY > viewH - margin);

  let offscreenMarker: InteriorOffscreenIndicator | null = null;
  if (isOffscreen) {
    const cx = viewW * 0.5;
    const cy = viewH * 0.52;
    const angleRad = Math.atan2(markerScreenY - cy, markerScreenX - cx);
    const padX = Math.min(viewW * 0.42, viewW * 0.5 - 32);
    const padY = Math.min(viewH * 0.34, viewH * 0.5 - 88);
    const cosA = Math.cos(angleRad);
    const sinA = Math.sin(angleRad);
    const tx = Math.abs(cosA) > 1e-4 ? padX / Math.abs(cosA) : Infinity;
    const ty = Math.abs(sinA) > 1e-4 ? padY / Math.abs(sinA) : Infinity;
    const dist = Math.min(tx, ty);
    offscreenMarker = {
      visible: true,
      edgeX: cx + cosA * dist,
      edgeY: cy + sinA * dist,
      angleRad,
    };
  }

  return {
    worldOffsetX,
    worldOffsetY,
    scale,
    offscreenMarker,
  };
}

/**
 * Seçenek kartının önizleme tuvaline, ilgili katmanın yakın kırpmasını çizer.
 */
export function renderOptionCardCrop(
  canvas: HTMLCanvasElement,
  step: ArchitectBuildStep,
  optionId: string,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#c2e1f2');
  bg.addColorStop(1, '#ede1c8');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const list =
    step === 'STEP_DOOR'
      ? DOOR_OPTIONS
      : step === 'STEP_WINDOW'
        ? WINDOW_OPTIONS
        : step === 'STEP_ROOF'
          ? ROOF_OPTIONS
          : ORNAMENT_OPTIONS;
  const spec = list.find((item) => item.id === optionId) ?? list[0];
  const crop: CropRegionPercent = spec.crop;

  const scaleX = w / ((crop.w / 100) * 100);
  const scaleY = h / ((crop.h / 100) * 100);
  const virtualSize = Math.min(scaleX, scaleY) * 100;
  const cropPxW = (crop.w / 100) * virtualSize;
  const cropPxH = (crop.h / 100) * virtualSize;
  const boxX = (w - cropPxW) * 0.5 - (crop.x / 100) * virtualSize;
  const boxY = (h - cropPxH) * 0.5 - (crop.y / 100) * virtualSize;

  const previewSelections: ArchitectSelections = {
    door: step === 'STEP_DOOR' ? (optionId as DoorPatternId) : null,
    window: step === 'STEP_WINDOW' ? (optionId as WindowPatternId) : null,
    roof: step === 'STEP_ROOF' ? (optionId as RoofOptionId) : null,
    ornament: step === 'STEP_ORNAMENT' ? (optionId as OrnamentPatternId) : null,
  };

  drawPavilionComposite(ctx, boxX, boxY, virtualSize, previewSelections);
}
