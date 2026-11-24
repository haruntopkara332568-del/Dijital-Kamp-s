/** Hayalden Gerçeğe Selçuklu VR sınıfının yürünebilir sahne çizimi. */
import type { PlayerCharacter, SceneObstacle } from '../types';
import { drawCharacter } from './characterRenderer';

const WALL_BASE_Y = 246;
const STONE_EDGE = 54;

export const DISCOVERY_NICHE_LAYOUT = {
  top: 76,
  width: 100,
  artTop: 113,
  artSize: 83,
  nameTop: 202,
  nameHeight: 36,
  slots: [57, 163, 269, 591, 697, 803],
  interactionY: 273,
} as const;

export const DISCOVERY_PREVIEW_LAYOUT = { left: 420, top: 107, size: 120 } as const;

export const DISCOVERY_CLASSROOM = {
  width: 960,
  height: 640,
  playerSpawn: { x: 480, y: 470 },
  exitDoor: { x: 480, y: 590, radius: 65 },
  pedestal: {
    /** Sehpa çarpışma kutusu (AABB): öğrenci içinden geçemez, dört bir yanından yaklaşabilir */
    obstacle: {
      id: 'vr-display-pedestal',
      name: 'VR Gözlüğü Sergileme Sehpası',
      x: 424,
      y: 262,
      width: 112,
      height: 54,
    } satisfies SceneObstacle,
    centerX: 480,
    baseY: 316,
    topSurfaceY: 254,
  },
  // Eski sahne API'sini kullanan çağrılar için koordinatlar korunur.
  wallMounts: [
    { id: 'vr-wall-mount-1', centerX: 384, centerY: 110 },
    { id: 'vr-wall-mount-2', centerX: 480, centerY: 110 },
    { id: 'vr-wall-mount-3', centerX: 576, centerY: 110 },
  ],
} as const;

export const DISCOVERY_CLASSROOM_OBSTACLES: SceneObstacle[] = [
  { id: 'discovery-north-wall', name: 'Kuzey Taş Duvarı', x: 0, y: 0, width: DISCOVERY_CLASSROOM.width, height: WALL_BASE_Y },
  { id: 'discovery-west-wall', name: 'Batı Kemerli Duvar', x: 0, y: WALL_BASE_Y, width: STONE_EDGE, height: DISCOVERY_CLASSROOM.height - WALL_BASE_Y },
  { id: 'discovery-east-wall', name: 'Doğu Kemerli Duvar', x: DISCOVERY_CLASSROOM.width - STONE_EDGE, y: WALL_BASE_Y, width: STONE_EDGE, height: DISCOVERY_CLASSROOM.height - WALL_BASE_Y },
  DISCOVERY_CLASSROOM.pedestal.obstacle,
];

export interface DiscoveryDepthEntity {
  id: string;
  baseY: number;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

/**
 * Sekiz köşeli Selçuklu yıldızı (Rub el Hizb) çizim yardımcısı.
 */
function drawSeljukEightPointStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerRadius: number,
  fillStyle: string,
  strokeStyle?: string,
  lineWidth: number = 1.2,
) {
  ctx.save();
  ctx.translate(cx, cy);

  const rIn = outerRadius * 0.74;
  ctx.beginPath();
  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI) / 8 - Math.PI / 2;
    const r = i % 2 === 0 ? outerRadius : rIn;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();

  ctx.fillStyle = fillStyle;
  ctx.fill();

  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }

  ctx.restore();
}

let classroomBackdrop: HTMLCanvasElement | null = null;

function drawClassroomBackdrop(ctx: CanvasRenderingContext2D, width: number, height: number) {
  drawDiscoveryFloor(ctx, width, height);
  drawSeljukStoneWallsAndNiches(ctx, width, height);
  drawDiscoveryExitDoor(ctx, width, height);
}

export function renderDiscoveryClassroomLayeredBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  if (typeof document === 'undefined') {
    drawClassroomBackdrop(ctx, width, height);
    return;
  }
  if (!classroomBackdrop || classroomBackdrop.width !== width || classroomBackdrop.height !== height) {
    const surface = document.createElement('canvas');
    surface.width = width;
    surface.height = height;
    const drawingContext = surface.getContext('2d');
    if (!drawingContext) {
      drawClassroomBackdrop(ctx, width, height);
      return;
    }
    drawClassroomBackdrop(drawingContext, width, height);
    classroomBackdrop = surface;
  }
  ctx.drawImage(classroomBackdrop, 0, 0);
}

/**
 * Katman 2: Y-Sorting Derinlik Sıralı Varlıklar (Ahşap Sergileme Sehpası + Tek VR Gözlüğü + Öğrenci Karakteri)
 */
export function renderDiscoveryClassroomEntities(
  ctx: CanvasRenderingContext2D,
  player: PlayerCharacter,
  width?: number,
  height?: number,
) {
  void width;
  void height;

  const isReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const now = isReducedMotion ? 0 : typeof performance !== 'undefined' ? performance.now() : 0;

  const entities: DiscoveryDepthEntity[] = [
    {
      id: 'vr-display-pedestal-and-headset',
      baseY: DISCOVERY_CLASSROOM.pedestal.baseY,
      draw: (c) => drawVrPedestalWithSingleHeadset(c, now),
    },
    {
      id: 'player-character',
      baseY: player.y + 18,
      draw: (c) => drawCharacter(c, player),
    },
  ];

  entities.sort((a, b) => a.baseY - b.baseY);

  for (let i = 0; i < entities.length; i++) {
    entities[i].draw(ctx);
  }
}

/**
 * Katman 3: Ön Plan Atmosferik Işıklandırma (Sade Selçuklu tavan kandilleri ve yumuşak gün ışığı)
 */
export function renderDiscoveryClassroomForeground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height?: number,
) {
  void height;
  const isReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const now = isReducedMotion ? 0 : typeof performance !== 'undefined' ? performance.now() : 0;

  drawSeljukChandelier(ctx, width / 2, now);
}

/**
 * Testler ve tek katmanlı çağrılar için birleşik sahne çizicisi.
 */
export function renderDiscoveryClassroomBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  renderDiscoveryClassroomLayeredBackground(ctx, width, height);
  const dummyPlayer: PlayerCharacter = {
    x: -999,
    y: -999,
    width: 53,
    height: 67,
    direction: 'up',
    state: 'idle',
    speed: 160,
    walkFrame: 0,
    grade: 3,
  };
  renderDiscoveryClassroomEntities(ctx, dummyPlayer, width, height);
}

/**
 * Aydınlık Sıcak Taş ve Ahşap Bordürlü Sınıf Zemini.
 * Girişten sehpaya uzanan açık yürüyüş aksı ve sehpa önünde tek bir belirgin Selçuklu yıldız göbeği.
 */
function drawDiscoveryFloor(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();

  // Ana zemin sıcak krem-bej taş/ahşap tonu
  const floorGrad = ctx.createLinearGradient(0, WALL_BASE_Y, 0, height);
  floorGrad.addColorStop(0, '#efd2a7');
  floorGrad.addColorStop(0.55, '#ead3b1');
  floorGrad.addColorStop(1, '#d6b18a');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, WALL_BASE_Y, width, height - WALL_BASE_Y);

  // Zarif büyük kesme taş derz ızgarası (göz yormayan düşük kontrast)
  ctx.strokeStyle = 'rgba(184, 163, 130, 0.32)';
  ctx.lineWidth = 1;
  const tileW = 80;
  const tileH = 54;
  for (let y = WALL_BASE_Y; y <= height; y += tileH) {
    ctx.beginPath();
    ctx.moveTo(54, y);
    ctx.lineTo(width - 54, y);
    ctx.stroke();

    const rowIdx = Math.round((y - WALL_BASE_Y) / tileH);
    const shift = (rowIdx % 2) * (tileW / 2);
    for (let x = 54 + shift; x < width - 54; x += tileW) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, Math.min(height, y + tileH));
      ctx.stroke();
    }
  }

  // Sınıfı çevreleyen kündekâri ahşap ve turkuaz ince yer bordürü
  ctx.strokeStyle = '#9a7144';
  ctx.lineWidth = 4;
  ctx.strokeRect(76, WALL_BASE_Y + 13, width - 152, height - WALL_BASE_Y - 62);

  ctx.strokeStyle = 'rgba(14, 118, 138, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(82, WALL_BASE_Y + 19, width - 164, height - WALL_BASE_Y - 74);

  // Girişten VR sehpasına uzanan açık, davetkâr zemin halı/taş aksı
  const runnerGrad = ctx.createLinearGradient(480, 320, 480, 565);
  runnerGrad.addColorStop(0, 'rgba(216, 151, 43, 0.14)');
  runnerGrad.addColorStop(1, 'rgba(14, 118, 138, 0.08)');
  ctx.fillStyle = runnerGrad;
  ctx.fillRect(422, 316, 116, 250);

  stoneGrain(ctx, STONE_EDGE, WALL_BASE_Y, width - STONE_EDGE * 2, height - WALL_BASE_Y, 1200);

  ctx.beginPath();
  ctx.ellipse(480, 305, 160, 48, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#704b41';
  ctx.strokeStyle = '#d29b5d';
  ctx.lineWidth = 4;
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(480, 305, 148, 40, 0, 0, Math.PI * 2);
  ctx.strokeStyle = '#d9b989';
  ctx.lineWidth = 2;
  ctx.stroke();
  for (const x of [350, 382, 578, 610]) {
    drawSeljukEightPointStar(ctx, x, 305, 11, '#0e6270', '#d29b5d', .8);
  }

  // Sekiz köşeli Selçuklu zemin madalyonu
  drawSeljukEightPointStar(
    ctx,
    480,
    305,
    40,
    'rgba(232, 178, 105, 0.25)',
    'rgba(154, 113, 68, 0.48)',
    1.8,
  );
  drawSeljukEightPointStar(
    ctx,
    480,
    305,
    29,
    'rgba(14, 118, 138, 0.12)',
    'rgba(14, 118, 138, 0.42)',
    1.4,
  );

  // Sol ve sağ kemerli pencerelerden zemine süzülen yumuşak gün ışığı
  ctx.fillStyle = 'rgba(255, 249, 224, 0.25)';
  ctx.beginPath();
  ctx.moveTo(155, WALL_BASE_Y);
  ctx.lineTo(255, WALL_BASE_Y);
  ctx.lineTo(340, height - 40);
  ctx.lineTo(185, height - 40);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(705, WALL_BASE_Y);
  ctx.lineTo(805, WALL_BASE_Y);
  ctx.lineTo(775, height - 40);
  ctx.lineTo(620, height - 40);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function tracePointedArch(ctx: CanvasRenderingContext2D, x: number, top: number, width: number, bottom: number) {
  const mid = x + width / 2;
  const shoulder = top + 38;
  ctx.beginPath();
  ctx.moveTo(x, bottom);
  ctx.lineTo(x, shoulder);
  ctx.bezierCurveTo(x, top + 22, mid - 16, top + 10, mid, top);
  ctx.bezierCurveTo(mid + 16, top + 10, x + width, top + 22, x + width, shoulder);
  ctx.lineTo(x + width, bottom);
  ctx.closePath();
}

function stoneGrain(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, count: number) {
  let seed = 4423;
  const next = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = i % 3 === 0 ? 'rgba(255, 245, 218, .14)' : 'rgba(100, 57, 26, .08)';
    ctx.fillRect(x + next() * width, y + next() * height, 0.6 + next() * 2.4, 0.55 + next() * 0.85);
  }
}

function drawCareerNiche(ctx: CanvasRenderingContext2D, x: number) {
  const { top, width, nameTop, nameHeight } = DISCOVERY_NICHE_LAYOUT;
  const bottom = nameTop + nameHeight + 2;
  const mid = x + width / 2;
  const frame = ctx.createLinearGradient(x, top, x + width, bottom);
  frame.addColorStop(0, '#ffe1aa');
  frame.addColorStop(0.42, '#b87943');
  frame.addColorStop(0.68, '#edbd81');
  frame.addColorStop(1, '#855030');

  ctx.save();
  ctx.shadowColor = 'rgba(63, 31, 15, .3)';
  ctx.shadowBlur = 7;
  ctx.shadowOffsetY = 4;
  tracePointedArch(ctx, x, top, width, bottom);
  ctx.fillStyle = frame;
  ctx.fill();
  ctx.shadowColor = 'transparent';

  const recess = ctx.createLinearGradient(mid, top, mid, bottom);
  recess.addColorStop(0, '#6b4229');
  recess.addColorStop(0.3, '#aa7041');
  recess.addColorStop(0.68, '#452a20');
  recess.addColorStop(1, '#6f4027');
  tracePointedArch(ctx, x + 6, top + 7, width - 12, bottom - 4);
  ctx.fillStyle = recess;
  ctx.fill();

  tracePointedArch(ctx, x + 8, top + 10, width - 16, bottom - 6);
  ctx.strokeStyle = '#f9cd82';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  drawSeljukEightPointStar(ctx, mid, top + 24, 7, '#eac083', '#855030', .9);

  ctx.fillStyle = '#39281f';
  ctx.beginPath();
  ctx.roundRect(x + 5, nameTop, width - 10, nameHeight, 5);
  ctx.fill();
  ctx.strokeStyle = '#d19960';
  ctx.stroke();
  ctx.restore();
}

function drawSeljukStoneWallsAndNiches(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  const wall = ctx.createLinearGradient(0, 0, 0, WALL_BASE_Y);
  wall.addColorStop(0, '#ad7850');
  wall.addColorStop(0.38, '#edc394');
  wall.addColorStop(0.8, '#d9a573');
  wall.addColorStop(1, '#c78d5a');
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, width, WALL_BASE_Y);

  for (let y = 16, row = 0; y < WALL_BASE_Y; y += 37, row++) {
    for (let x = row % 2 === 0 ? -42 : 0, column = 0; x < width; x += 84, column++) {
      const stone = ['#f4d4a8', '#c88e60', '#dca87e', '#f0bd87'][(row * 3 + column * 7) % 4];
      ctx.globalAlpha = 0.27;
      ctx.fillStyle = stone;
      ctx.fillRect(x + 1, y + 1, 82, Math.min(35, WALL_BASE_Y - y));
    }
  }
  ctx.globalAlpha = 1;
  stoneGrain(ctx, 0, 10, width, WALL_BASE_Y - 10, 1250);

  const outerBeam = ctx.createLinearGradient(0, 0, 0, 29);
  outerBeam.addColorStop(0, '#493021');
  outerBeam.addColorStop(0.6, '#755033');
  outerBeam.addColorStop(1, '#503622');
  ctx.fillStyle = outerBeam;
  ctx.fillRect(0, 0, width, 25);
  ctx.fillStyle = '#ba8651';
  ctx.fillRect(0, 22, width, 3);

  for (let x = 24; x < width; x += 25) {
    drawSeljukEightPointStar(ctx, x, 12, 7, '#956435', '#e4b779', 0.65);
  }

  const side = ctx.createLinearGradient(0, 0, STONE_EDGE, 0);
  side.addColorStop(0, '#99603c');
  side.addColorStop(1, '#cc9b68');
  ctx.fillStyle = side;
  ctx.fillRect(0, WALL_BASE_Y, STONE_EDGE, height - WALL_BASE_Y);
  ctx.save();
  ctx.translate(width, 0);
  ctx.scale(-1, 1);
  ctx.fillStyle = side;
  ctx.fillRect(0, WALL_BASE_Y, STONE_EDGE, height - WALL_BASE_Y);
  ctx.restore();
  ctx.strokeStyle = 'rgba(113, 72, 41, .65)';
  for (let y = WALL_BASE_Y + 28; y < height; y += 38) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(STONE_EDGE, y);
    ctx.moveTo(width - STONE_EDGE, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  const center = width / 2;
  const glow = ctx.createRadialGradient(center, 91, 12, center, 119, 138);
  glow.addColorStop(0, 'rgba(255, 236, 183, .9)');
  glow.addColorStop(1, 'rgba(236, 172, 97, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(center - 166, 25, 332, 213);

  tracePointedArch(ctx, center - 104, 34, 208, WALL_BASE_Y - 5);
  ctx.fillStyle = '#deac79';
  ctx.fill();
  ctx.strokeStyle = '#98633c';
  ctx.lineWidth = 3;
  ctx.stroke();
  tracePointedArch(ctx, center - 94, 44, 188, WALL_BASE_Y - 9);
  ctx.fillStyle = '#efd0a3';
  ctx.fill();
  ctx.strokeStyle = '#fff1cb';
  ctx.lineWidth = 2;
  ctx.stroke();

  for (const bandX of [43, 380, 580, width - 43]) {
    ctx.fillStyle = bandX === 380 || bandX === 580 ? '#b17a4e' : '#956242';
    ctx.fillRect(bandX - 6, 47, 12, WALL_BASE_Y - 54);
    ctx.fillStyle = '#e9be89';
    ctx.fillRect(bandX - 6, 47, 2, WALL_BASE_Y - 54);
    for (let y = 57; y < 232; y += 18) {
      drawSeljukEightPointStar(ctx, bandX, y, 4, '#935b3b', '#e4b575', 0.65);
    }
  }


  // Yan duvar kanatlarında geçme kafesli iki küçük ışıklık.
  for (const x of [width * 0.224, width * 0.776]) {
    tracePointedArch(ctx, x - 11, 28, 22, 68);
    ctx.fillStyle = '#735036';
    ctx.fill();
    ctx.strokeStyle = '#f1c48b';
    ctx.lineWidth = 2;
    ctx.stroke();
    for (const y of [51, 61]) {
      drawSeljukEightPointStar(ctx, x, y, 4.2, '#ffe0a6', '#b27748', .72);
    }
  }

  for (const x of DISCOVERY_NICHE_LAYOUT.slots) drawCareerNiche(ctx, x);

  ctx.fillStyle = '#744a31';
  ctx.fillRect(STONE_EDGE, WALL_BASE_Y - 5, width - 2 * STONE_EDGE, 5);
  ctx.fillStyle = '#dfad72';
  ctx.fillRect(STONE_EDGE, WALL_BASE_Y - 7, width - 2 * STONE_EDGE, 2);
  ctx.restore();
}

/**
 * 3. ÇOCUK BOYUNA UYGUN AHŞAP SERGİLEME SEHPASI VE ÜZERİNDEKİ TEK VR GÖZLÜĞÜ
 *
 * Ölçek Karşılaştırması:
 * - Öğrenci karakteri: 53 × 67 px (`CHARACTER_SCALES.scale15`).
 * - Ahşap Sergileme Sehpası: genişlik 92 px, derinlik 44 px, yükseklik ~52 px (üst yüzey y=254, taban y=312;
 *   öğrencinin bel–göğüs hizasında, çocuk boyuna tam uygun).
 * - Tek VR Gözlüğü: ~46 × 26 px boyutunda (öğrencinin baş genişliğiyle ~36-42 px uyumlu,
 *   hem masaüstünde hem dar mobil ekranda tüm parçalarıyla net seçilir).
 */
function drawVrPedestalWithSingleHeadset(ctx: CanvasRenderingContext2D, now: number) {
  const cx = DISCOVERY_CLASSROOM.pedestal.centerX; // 480
  const baseY = DISCOVERY_CLASSROOM.pedestal.baseY; // 316
  const topY = DISCOVERY_CLASSROOM.pedestal.topSurfaceY; // 254

  ctx.save();

  // 1. Sehpa Zemin Gölgesi
  ctx.fillStyle = 'rgba(23, 43, 71, 0.26)';
  ctx.beginPath();
  ctx.ellipse(cx, baseY + 2, 58, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Sehpa Alt Ahşap Kaidesi (Pahlı Selçuklu ahşap ayak)
  ctx.fillStyle = '#5a3920';
  ctx.strokeStyle = '#3d2512';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(cx - 46, baseY - 12, 92, 12, 4);
  ctx.fill();
  ctx.stroke();

  // 3. Sehpa Gövdesi (Kündekâri geometrik ahşap ön yüz ve yan pahlar)
  const bodyGrad = ctx.createLinearGradient(cx - 42, topY + 12, cx + 42, baseY - 12);
  bodyGrad.addColorStop(0, '#865934');
  bodyGrad.addColorStop(0.5, '#6e4728');
  bodyGrad.addColorStop(1, '#54351c');
  ctx.fillStyle = bodyGrad;
  ctx.strokeStyle = '#3d2512';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(cx - 42, topY + 12, 84, baseY - topY - 24, 4);
  ctx.fill();
  ctx.stroke();

  // Sehpa ön yüzeyinde sade geometrik ahşap çerçeve ve merkez sekiz köşeli yıldız kakması
  ctx.strokeStyle = '#cfa06c';
  ctx.lineWidth = 1.1;
  ctx.strokeRect(cx - 34, topY + 18, 68, baseY - topY - 36);

  drawSeljukEightPointStar(
    ctx,
    cx,
    topY + 12 + (baseY - topY - 24) / 2,
    10,
    '#0e768a',
    '#eab308',
    1.1,
  );

  // 4. Sehpa Üst Sergileme Tablası (2.5D İzometrik Perspektif Üst Yüzey)
  const tableTopGrad = ctx.createLinearGradient(cx, topY - 10, cx, topY + 14);
  tableTopGrad.addColorStop(0, '#d8b483');
  tableTopGrad.addColorStop(1, '#a97c4c');
  ctx.fillStyle = tableTopGrad;
  ctx.strokeStyle = '#4b2f18';
  ctx.lineWidth = 1.8;

  ctx.beginPath();
  ctx.moveTo(cx - 42, topY - 8);
  ctx.lineTo(cx + 42, topY - 8);
  ctx.lineTo(cx + 50, topY + 10);
  ctx.lineTo(cx - 50, topY + 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Üst tabla ön kalınlık kenarı (turkuaz ve pirinç kakma şeritli)
  ctx.fillStyle = '#634022';
  ctx.fillRect(cx - 50, topY + 10, 100, 6);
  ctx.fillStyle = '#0e768a';
  ctx.fillRect(cx - 44, topY + 12, 88, 2.2);

  // Üst tabla üzerinde gözlüğün durduğu kadife/keçe sergileme pedi
  ctx.fillStyle = '#2d4b56';
  ctx.strokeStyle = '#d8972b';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(cx, topY + 1, 34, 9.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 5. TEK FİZİKSEL VR GÖZLÜĞÜ (Hafif Çapraz / 3/4 İzometrik Açıda)
  drawSingleSeljukVrHeadset(ctx, cx, topY - 5, now);

  ctx.restore();
}

/**
 * Selçuklu Motifleriyle Tasarlanmış Tek VR Gözlüğü (Hafif Çapraz 3/4 Görünüm).
 *
 * Görsel Bileşenler:
 * 1. Baş bandı (arka ve üst ergonomik kafa bandı, sağ-arkaya doğru uzanan halka).
 * 2. Yüzle temas eden koyu renkli yastıklı bölüm (dark facial interface cushion, sağ-arka kenarda seçilir).
 * 3. Ön gövde (fildişi/kumtaşı ve turkuaz çerçeveli vizör, hafif sola-öne dönük 3/4 çapraz açı).
 * 4. Ön gövdede turkuaz tonlu sekiz köşeli Selçuklu yıldızı motifi (gövdenin kavisini takip eder).
 * 5. Yan yüzlerde ince bir geometrik geçme şeridi (Selçuklu zencirek/geçme bandı).
 */
function drawSingleSeljukVrHeadset(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  now: number,
) {
  ctx.save();
  ctx.translate(cx, cy);

  // Gözlüğün sehpa üzerindeki yumuşak temas gölgesi
  ctx.fillStyle = 'rgba(15, 23, 42, 0.42)';
  ctx.beginPath();
  ctx.ellipse(1, 7, 25, 6.5, -0.08, 0, Math.PI * 2);
  ctx.fill();

  // A. BAŞ BANDI (Ergonomik arka ve üst kayış — sağ arkaya doğru 3/4 çapraz uzanır)
  // Arka yatay kafa bandı halkası
  ctx.strokeStyle = '#263545';
  ctx.lineWidth = 5.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(8, -6);
  ctx.bezierCurveTo(28, -11, 30, 3, 12, 5);
  ctx.stroke();

  // Baş bandı iç açık gri/krem destek katmanı (kontrast ile baş bandının net seçilmesini sağlar)
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(9, -6);
  ctx.bezierCurveTo(26, -10, 27, 2, 12, 4.5);
  ctx.stroke();

  // Üst kafa bandı kemeri
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(-4, -12);
  ctx.quadraticCurveTo(13, -19, 23, -4);
  ctx.stroke();

  // B. YÜZLE TEMAS EDEN KOYU RENKLİ YASTIKLI BÖLÜM (Facial Cushion)
  // Gözlük hafif sola-öne çapraz durduğu için sağ-arka kısımda koyu antrasit yüz yastığı net seçilir
  ctx.fillStyle = '#111827';
  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.roundRect(-14, -12, 33, 18, [7, 9, 9, 7]);
  ctx.fill();
  ctx.stroke();

  // Yastık burun oyuğu ve yumuşak sünger kıvrım vurgusu
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(14, -10);
  ctx.quadraticCurveTo(19, -3, 14, 4);
  ctx.stroke();

  // C. YAN YÜZ (Sağ yan gövde — ince geometrik Selçuklu geçme şeridi ile)
  ctx.fillStyle = '#dfd1b8';
  ctx.strokeStyle = '#47301c';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(4, -12);
  ctx.lineTo(15, -10);
  ctx.lineTo(15, 4);
  ctx.lineTo(4, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Yan yüzde ince geometrik geçme şeridi (Selçuklu zencirek motifi — gövde eğimini takip eder)
  ctx.fillStyle = '#0e768a';
  ctx.beginPath();
  ctx.moveTo(5, -5.5);
  ctx.lineTo(14.5, -4);
  ctx.lineTo(14.5, 0.5);
  ctx.lineTo(5, -1);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(5.5, -3.5);
  ctx.lineTo(8.5, -1.5);
  ctx.lineTo(11.5, -3.2);
  ctx.lineTo(14, -1.2);
  ctx.moveTo(5.5, -1.8);
  ctx.lineTo(8.5, -3.6);
  ctx.lineTo(11.5, -1.5);
  ctx.lineTo(14, -3.0);
  ctx.stroke();

  // D. ÖN GÖVDE (Vizör — hafif çapraz 3/4 açıda, sıcak sedefli fildişi ve turkuaz Selçuklu bordürlü)
  const visorGrad = ctx.createLinearGradient(-22, -13, 6, 7);
  visorGrad.addColorStop(0, '#fbf6ec');
  visorGrad.addColorStop(0.55, '#efe4ce');
  visorGrad.addColorStop(1, '#d5c2a0');
  ctx.fillStyle = visorGrad;
  ctx.strokeStyle = '#0e768a';
  ctx.lineWidth = 2.2;

  ctx.beginPath();
  ctx.roundRect(-22, -13, 28, 19, [8, 6, 6, 8]);
  ctx.fill();
  ctx.stroke();

  // Ön gövde üst/alt kavis çizgisi (gövde biçimini takip eden altın-turkuaz ince kontur)
  ctx.strokeStyle = '#d8972b';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.roundRect(-19.5, -10.5, 23, 14, [6, 4, 4, 6]);
  ctx.stroke();

  // Sol yan yüzeyde de görünen ince geometrik geçme şeridi başlangıcı
  ctx.fillStyle = '#0e768a';
  ctx.fillRect(-22, -4.5, 3.5, 3.5);
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 0.9;
  ctx.strokeRect(-21.5, -4, 2.5, 2.5);

  // E. ÖN GÖVDEDE TURKUAZ TONLU SEKİZ KÖŞELİ SELÇUKLU YILDIZI MOTİFİ
  // Hafif çapraz perspektife uyum sağlaması için yatayda 0.94 ölçekli
  ctx.save();
  ctx.translate(-8, -3.5);
  ctx.scale(0.94, 1);

  const starPulse = Math.sin(now / 420) * 0.08 + 0.92;
  drawSeljukEightPointStar(
    ctx,
    0,
    0,
    7.2,
    '#0e768a',
    `rgba(216, 151, 43, ${starPulse})`,
    1.3,
  );
  drawSeljukEightPointStar(ctx, 0, 0, 3.8, '#22d3ee', '#ffffff', 0.8);
  ctx.restore();

  // Ön vizör cam/parlaklık yansıması
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.beginPath();
  ctx.ellipse(-15, -8.5, 4.5, 1.6, -0.25, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Avluya Dönüş Kapısı (Güney Duvarı — 480, 590).
 */
function drawDiscoveryExitDoor(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const doorX = width / 2 - 48;
  const doorY = height - 36;

  ctx.save();

  ctx.fillStyle = '#5a3920';
  ctx.beginPath();
  ctx.roundRect(doorX - 4, doorY, 104, 36, [10, 10, 0, 0]);
  ctx.fill();
  ctx.strokeStyle = '#d8972b';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#172b47';
  ctx.beginPath();
  ctx.roundRect(doorX, doorY + 4, 96, 32, [8, 8, 0, 0]);
  ctx.fill();

  ctx.fillStyle = '#d8972b';
  ctx.beginPath();
  ctx.arc(doorX + 41, doorY + 18, 2.8, 0, Math.PI * 2);
  ctx.arc(doorX + 55, doorY + 18, 2.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Avluya Çıkış [E]', width / 2, doorY + 24);

  ctx.restore();
}

function drawSeljukChandelier(ctx: CanvasRenderingContext2D, center: number, now: number) {
  ctx.save();
  ctx.translate(center, 38);
  const spread = ctx.createRadialGradient(0, 0, 5, 0, 0, 88);
  spread.addColorStop(0, 'rgba(255, 228, 166, .46)');
  spread.addColorStop(1, 'rgba(255, 212, 130, 0)');
  ctx.fillStyle = spread;
  ctx.fillRect(-88, -38, 176, 104);

  ctx.strokeStyle = '#714725';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-39, -38);
  ctx.lineTo(-57, -4);
  ctx.moveTo(39, -38);
  ctx.lineTo(57, -4);
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(0, 3, 71, 10, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#744220';
  ctx.strokeStyle = '#e6a75b';
  ctx.lineWidth = 3;
  ctx.fill();
  ctx.stroke();

  const shimmer = (0.83 + Math.sin(now / 700) * 0.04).toFixed(3);
  ctx.beginPath();
  ctx.ellipse(0, 3, 63, 6, 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 225, 155, ' + shimmer + ')';
  ctx.lineWidth = 2;
  ctx.stroke();
  for (const x of [-48, -32, -16, 0, 16, 32, 48]) {
    drawSeljukEightPointStar(ctx, x, 6, 3.5, '#ffdda0', '#b4763b', 0.65);
  }
  ctx.restore();
}
