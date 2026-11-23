/**
 * Hayalden Gerçeğe — Selçuklu VR Sınıfı Görsel Sahne Çizici.
 *
 * Mimari ve Pedagojik İlkeler:
 * - Sıcak bej kesme taş duvarlar, sivri kemerli duvar nişleri ve geometrik ahşap (kündekâri) işçiliği.
 * - Sekiz köşeli Selçuklu yıldızı ve geçme motifleri yalnızca birkaç belirgin odak noktasında kullanılır;
 *   duvarlar yoğun desenle doldurulmaz, öğrencinin dikkati doğrudan VR gözlüğüne yönelir.
 * - Sahne Dağılımı (Kesin Kural):
 *   1. Çocuk boyuna uygun, sade ahşap sergileme sehpasının üzerinde YALNIZCA 1 adet fiziksel VR gözlüğü
 *      (hafif çapraz açıda; ön gövdesi, yüzle temas eden koyu yastıklı bölümü, baş bandı, ön gövdede
 *      turkuaz tonlu sekiz köşeli yıldız motifi ve yan yüzlerde ince geometrik geçme şeridi seçilebilir).
 *   2. Sehpanın arkasındaki duvarda aynı tasarım dilini taşıyan 3 adet BOŞ gözlük askısı
 *      (her birinde ahşap arka plaka ve ileride bir gözlüğün baş bandını taşıyabilecek kısa çıkıntılı destek;
 *      askılarda gözlük resmi, silüet, kilit simgesi, numara veya "Yakında" yazısı YOKTUR).
 */

import type { PlayerCharacter, SceneObstacle } from '../types';
import { drawCharacter } from './characterRenderer';

export const DISCOVERY_CLASSROOM = {
  width: 960,
  height: 640,
  /** Sınıf girişinde öğrencinin önü açık; hem VR gözlüğünü hem arkasındaki 3 boş askıyı ilk kadrajda görür */
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
  /** Duvardaki 3 boş askı: aralarındaki boşluk sergilenen VR gözlüğünün genişliğine (~48 px) göre ayarlıdır */
  wallMounts: [
    { id: 'vr-wall-mount-1', centerX: 384, centerY: 110 },
    { id: 'vr-wall-mount-2', centerX: 480, centerY: 110 },
    { id: 'vr-wall-mount-3', centerX: 576, centerY: 110 },
  ] as const,
} as const;

export const DISCOVERY_CLASSROOM_OBSTACLES: SceneObstacle[] = [
  { id: 'discovery-north-wall', name: 'Kuzey Taş Duvarı', x: 0, y: 0, width: 960, height: 158 },
  { id: 'discovery-west-wall', name: 'Batı Kemerli Duvar', x: 0, y: 158, width: 54, height: 482 },
  { id: 'discovery-east-wall', name: 'Doğu Kemerli Duvar', x: 906, y: 158, width: 54, height: 482 },
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

/**
 * Katman 1: Selçuklu VR Sınıfı Arka Planı
 * Sıcak bej kesme taş duvarlar, sivri kemerli duvar nişleri, 3 boş ahşap duvar askısı,
 * aydınlık ahşap/taş zemin, merkez yıldız göbek mozaiği ve avluya çıkış kapısı.
 */
export function renderDiscoveryClassroomLayeredBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const isReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const now = isReducedMotion ? 0 : typeof performance !== 'undefined' ? performance.now() : 0;

  // 1. ZEMİN (Aydınlık, sıcak kesme taş ve ahşap çerçeveli sınıf zemini)
  drawDiscoveryFloor(ctx, width, height);

  // 2. KUZEY VE YAN KESME TAŞ DUVARLAR + SİVRİ KEMERLİ DUVAR NİŞLERİ
  drawSeljukStoneWallsAndNiches(ctx, width, height, now);

  // 3. SEHPANIN ARKASINDAKİ DUVARDA 3 ADET BOŞ GÖZLÜK ASKISI
  drawEmptyVrWallMounts(ctx);

  // 4. AVLUYA ÇIKIŞ KAPISI (Güney Duvarı — 480, 590)
  drawDiscoveryExitDoor(ctx, width, height);
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
  void width;
  void height;
  const isReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const now = isReducedMotion ? 0 : typeof performance !== 'undefined' ? performance.now() : 0;

  ctx.save();
  drawSeljukPendantLamp(ctx, 210, 0, 44, now);
  drawSeljukPendantLamp(ctx, 750, 0, 44, now);
  ctx.restore();
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
  const floorGrad = ctx.createLinearGradient(0, 158, 0, height);
  floorGrad.addColorStop(0, '#f3ead8');
  floorGrad.addColorStop(0.55, '#efe4ce');
  floorGrad.addColorStop(1, '#e4d5b7');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, 158, width, height - 158);

  // Zarif büyük kesme taş derz ızgarası (göz yormayan düşük kontrast)
  ctx.strokeStyle = 'rgba(184, 163, 130, 0.32)';
  ctx.lineWidth = 1;
  const tileW = 80;
  const tileH = 54;
  for (let y = 158; y <= height; y += tileH) {
    ctx.beginPath();
    ctx.moveTo(54, y);
    ctx.lineTo(width - 54, y);
    ctx.stroke();

    const rowIdx = Math.round((y - 158) / tileH);
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
  ctx.strokeRect(76, 178, width - 152, height - 224);

  ctx.strokeStyle = 'rgba(14, 118, 138, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(82, 184, width - 164, height - 236);

  // Girişten VR sehpasına uzanan açık, davetkâr zemin halı/taş aksı
  const runnerGrad = ctx.createLinearGradient(480, 320, 480, 565);
  runnerGrad.addColorStop(0, 'rgba(216, 151, 43, 0.14)');
  runnerGrad.addColorStop(1, 'rgba(14, 118, 138, 0.08)');
  ctx.fillStyle = runnerGrad;
  ctx.fillRect(422, 316, 116, 250);

  // Sehpa altında odaklayıcı büyük sekiz köşeli Selçuklu zemin madalyonu
  drawSeljukEightPointStar(
    ctx,
    480,
    294,
    82,
    'rgba(216, 151, 43, 0.14)',
    'rgba(154, 113, 68, 0.48)',
    1.8,
  );
  drawSeljukEightPointStar(
    ctx,
    480,
    294,
    60,
    'rgba(14, 118, 138, 0.12)',
    'rgba(14, 118, 138, 0.42)',
    1.4,
  );

  // Sol ve sağ kemerli pencerelerden zemine süzülen yumuşak gün ışığı
  ctx.fillStyle = 'rgba(255, 249, 224, 0.25)';
  ctx.beginPath();
  ctx.moveTo(155, 158);
  ctx.lineTo(255, 158);
  ctx.lineTo(340, height - 40);
  ctx.lineTo(185, height - 40);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(705, 158);
  ctx.lineTo(805, 158);
  ctx.lineTo(775, height - 40);
  ctx.lineTo(620, height - 40);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Sıcak Bej Kesme Taş Duvarlar, Sivri Kemerli Duvar Nişleri ve Geometrik Ahşap İşçiliği.
 */
function drawSeljukStoneWallsAndNiches(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  now: number,
) {
  void now;
  ctx.save();

  // 1. Kuzey Ana Kesme Taş Duvarı (0..158 Y)
  const wallGrad = ctx.createLinearGradient(0, 0, 0, 158);
  wallGrad.addColorStop(0, '#e8dcc4');
  wallGrad.addColorStop(0.75, '#f2e8d5');
  wallGrad.addColorStop(1, '#dfd0b4');
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, width, 158);

  // Sıcak kesme taş blok derzleri (sade, göz yormayan)
  ctx.strokeStyle = 'rgba(176, 152, 116, 0.34)';
  ctx.lineWidth = 1;
  for (let y = 28; y < 146; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();

    const offset = ((y / 30) % 2) * 48;
    for (let x = offset; x < width; x += 96) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 30);
      ctx.stroke();
    }
  }

  // Üst Tavan Kündekâri Ahşap Kiriş ve Geometrik Geçme Bordürü
  ctx.fillStyle = '#5c3c22';
  ctx.fillRect(0, 0, width, 18);
  ctx.fillStyle = '#7a5230';
  ctx.fillRect(0, 18, width, 6);

  // Üst kirişte sade geometrik geçme şeridi
  ctx.strokeStyle = '#d8972b';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let x = 24; x < width - 24; x += 48) {
    ctx.moveTo(x, 6);
    ctx.lineTo(x + 12, 14);
    ctx.lineTo(x + 24, 6);
    ctx.lineTo(x + 36, 14);
    ctx.lineTo(x + 48, 6);
  }
  ctx.stroke();

  // Duvar alt süpürgelik (Ahşap lambri kaide + ince turkuaz çini şerit)
  ctx.fillStyle = '#6d492a';
  ctx.fillRect(0, 146, width, 12);
  ctx.fillStyle = '#0e768a';
  ctx.fillRect(0, 141, width, 5);
  ctx.fillStyle = '#d8972b';
  ctx.fillRect(0, 139, width, 2);

  // 2. Yan Kesme Taş Duvarlar (Perspektif Sol ve Sağ Duvar)
  ctx.fillStyle = '#e5d7bc';
  ctx.fillRect(0, 158, 54, height - 158);
  ctx.fillRect(width - 54, 158, 54, height - 158);

  ctx.strokeStyle = '#7a5230';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(54, 158);
  ctx.lineTo(54, height);
  ctx.moveTo(width - 54, 158);
  ctx.lineTo(width - 54, height);
  ctx.stroke();

  // Yan duvarlarda gömme sivri kemerli taş nişler (Sol ve Sağ)
  drawSideWallPointedNiche(ctx, 14, 230, 28, 95, 'left');
  drawSideWallPointedNiche(ctx, 14, 380, 28, 95, 'left');
  drawSideWallPointedNiche(ctx, width - 42, 230, 28, 95, 'right');
  drawSideWallPointedNiche(ctx, width - 42, 380, 28, 95, 'right');

  // 3. KUZEY DUVARI MERKEZ SİVRİ KEMERLİ NİŞ (3 Boş Askıyı Çerçeveleyen Selçuklu Taş Kemer Nişi)
  drawCentralPointedArchNiche(ctx, 314, 24, 332, 117);

  // 4. KUZEY DUVARI SOL VE SAĞ SİVRİ KEMERLİ AYDINLIK NİŞLER (Sade Selçuklu Yıldız Madalyonlu)
  drawFlankingPointedArchNiche(ctx, 140, 32, 120, 108);
  drawFlankingPointedArchNiche(ctx, 700, 32, 120, 108);

  ctx.restore();
}

/**
 * Merkez Sivri Kemerli Büyük Taş Niş (x=314, y=24, w=332, h=117).
 * Sehpanın arkasındaki 3 boş VR gözlüğü askısını mimari olarak çerçeveler.
 */
function drawCentralPointedArchNiche(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const cx = x + w / 2; // 480
  const archShoulderY = y + 32;
  const bottomY = y + h;

  ctx.save();

  // Dış kesme taş söve ve kündekâri ahşap çerçeve
  ctx.fillStyle = '#d9c7a7';
  ctx.strokeStyle = '#8b643b';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - 8, bottomY);
  ctx.lineTo(x - 8, archShoulderY);
  ctx.quadraticCurveTo(x - 8, y + 2, cx, y - 6);
  ctx.quadraticCurveTo(x + w + 8, y + 2, x + w + 8, archShoulderY);
  ctx.lineTo(x + w + 8, bottomY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Niş iç girinti yüzeyi (sıcak gölgeli taş derinliği)
  const recessGrad = ctx.createLinearGradient(cx, y, cx, bottomY);
  recessGrad.addColorStop(0, '#cbb692');
  recessGrad.addColorStop(0.35, '#decba8');
  recessGrad.addColorStop(1, '#e8d9bc');
  ctx.fillStyle = recessGrad;

  ctx.beginPath();
  ctx.moveTo(x, bottomY);
  ctx.lineTo(x, archShoulderY + 4);
  ctx.quadraticCurveTo(x + 6, y + 10, cx, y + 3);
  ctx.quadraticCurveTo(x + w - 6, y + 10, x + w, archShoulderY + 4);
  ctx.lineTo(x + w, bottomY);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#0e768a';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Kemer kilit taşında tek bir zarif Selçuklu sekiz köşeli yıldız rozeti
  drawSeljukEightPointStar(ctx, cx, y + 17, 9.5, '#0e768a', '#d8972b', 1.2);

  // Kemer omuzlarında ince geometrik ahşap geçme çıtası
  ctx.strokeStyle = 'rgba(122, 82, 48, 0.55)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x + 14, y + 36);
  ctx.lineTo(x + w - 14, y + 36);
  ctx.stroke();

  ctx.restore();
}

/**
 * Yan Sivri Kemerli Duvar Nişleri (Sol: x=140, Sağ: x=700).
 * İçlerinde yoğun desen yerine gün ışığı ve tek bir sekiz köşeli yıldız kabartması bulunur.
 */
function drawFlankingPointedArchNiche(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const cx = x + w / 2;
  const shoulderY = y + 34;
  const bottomY = y + h;

  ctx.save();

  // Taş kemer kasası
  ctx.fillStyle = '#d8c5a3';
  ctx.strokeStyle = '#9a7144';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, bottomY);
  ctx.lineTo(x, shoulderY);
  ctx.quadraticCurveTo(x + 4, y + 6, cx, y);
  ctx.quadraticCurveTo(x + w - 4, y + 6, x + w, shoulderY);
  ctx.lineTo(x + w, bottomY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Niş içi aydınlık taş yüzey
  ctx.fillStyle = '#e7d9be';
  ctx.beginPath();
  ctx.moveTo(x + 7, bottomY - 4);
  ctx.lineTo(x + 7, shoulderY + 3);
  ctx.quadraticCurveTo(x + 11, y + 13, cx, y + 7);
  ctx.quadraticCurveTo(x + w - 11, y + 13, x + w - 7, shoulderY + 3);
  ctx.lineTo(x + w - 7, bottomY - 4);
  ctx.closePath();
  ctx.fill();

  // Ahşap kafesli üst ışık penceresi ve altında tek bir Selçuklu yıldız madalyonu
  drawSeljukEightPointStar(ctx, cx, y + 48, 16, 'rgba(14, 118, 138, 0.22)', '#8b643b', 1.4);
  drawSeljukEightPointStar(ctx, cx, y + 48, 8, '#0e768a', '#d8972b', 1);

  // Niş alt ahşap raf tablası
  ctx.fillStyle = '#6d492a';
  ctx.fillRect(x + 4, bottomY - 8, w - 8, 6);

  ctx.restore();
}

function drawSideWallPointedNiche(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  side: 'left' | 'right',
) {
  ctx.save();
  ctx.fillStyle = '#d3c09d';
  ctx.strokeStyle = '#8b643b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, side === 'left' ? [12, 4, 4, 12] : [4, 12, 12, 4]);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#bfa982';
  ctx.beginPath();
  ctx.roundRect(x + 4, y + 8, w - 8, h - 16, 6);
  ctx.fill();
  ctx.restore();
}

/**
 * 4. GELECEKTEKİ GÖZLÜKLER İÇİN 3 ADET BOŞ DUVAR ASKISI
 *
 * Kurallar:
 * - Sehpanın arkasındaki duvarda 3 adet boş gözlük askısı (x = 384, 480, 576; merkez aralığı 96 px,
 *   sergilenen VR gözlüğünün ~48 px genişliğine göre dengeli boşluklu).
 * - Her askıda ahşap bir arka plaka ve ileride bir gözlüğün baş bandını taşıyabilecek kısa,
 *   çıkıntılı bir destek (peg/cradle) bulunur.
 * - Askılarda gözlük resmi, gözlük silüeti, kilit simgesi, numara veya "Yakında" yazısı KESİNLİKLE YOKTUR.
 */
function drawEmptyVrWallMounts(ctx: CanvasRenderingContext2D) {
  for (const mount of DISCOVERY_CLASSROOM.wallMounts) {
    drawSingleEmptyWallMount(ctx, mount.centerX, mount.centerY);
  }
}

function drawSingleEmptyWallMount(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const plaqueW = 50;
  const plaqueH = 62;
  const left = cx - plaqueW / 2;
  const top = cy - plaqueH / 2;

  ctx.save();

  // 1. Duvar Üzerindeki Yumuşak Derinlik Gölgesi
  ctx.fillStyle = 'rgba(23, 43, 71, 0.24)';
  ctx.beginPath();
  ctx.roundRect(left + 2, top + 4, plaqueW, plaqueH, [16, 16, 7, 7]);
  ctx.fill();

  // 2. Ahşap Arka Plaka (Selçuklu sivri kemer tepeli ceviz/meşe plaka)
  const woodGrad = ctx.createLinearGradient(left, top, left + plaqueW, top + plaqueH);
  woodGrad.addColorStop(0, '#7c5330');
  woodGrad.addColorStop(0.5, '#634022');
  woodGrad.addColorStop(1, '#4b2f18');
  ctx.fillStyle = woodGrad;
  ctx.strokeStyle = '#d8972b';
  ctx.lineWidth = 1.8;

  ctx.beginPath();
  ctx.roundRect(left, top, plaqueW, plaqueH, [16, 16, 7, 7]);
  ctx.fill();
  ctx.stroke();

  // Ahşap arka plaka üzerinde ince geometrik kakma iç çerçeve
  ctx.strokeStyle = 'rgba(239, 219, 182, 0.55)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(left + 4.5, top + 4.5, plaqueW - 9, plaqueH - 9, [13, 13, 4, 4]);
  ctx.stroke();

  // Plaka üst alınlığında küçük turkuaz kakma nokta (numara veya simge değil, saf ahşap kakma çivisi)
  ctx.fillStyle = '#0e768a';
  ctx.beginPath();
  ctx.arc(cx, top + 13, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // 3. İleride Bir Gözlüğün Baş Bandını Taşıyabilecek Kısa, Çıkıntılı Destek (3D Peg / Cradle)
  const pegY = cy + 4;

  // Desteğin plaka ve duvar üzerine düşen alt gölgesi (çıkıntı hissini verir)
  ctx.fillStyle = 'rgba(15, 23, 42, 0.38)';
  ctx.beginPath();
  ctx.ellipse(cx + 2, pegY + 13, 13, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Arka metal/pirinç bağlantı bileziği
  ctx.fillStyle = '#b88632';
  ctx.strokeStyle = '#4b2f18';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(cx - 11, pegY - 5, 22, 10, 3);
  ctx.fill();
  ctx.stroke();

  // Öne doğru uzanan kısa ahşap boyun (gövde)
  const stemGrad = ctx.createLinearGradient(cx, pegY - 3, cx, pegY + 9);
  stemGrad.addColorStop(0, '#a57548');
  stemGrad.addColorStop(1, '#5e3c1e');
  ctx.fillStyle = stemGrad;
  ctx.beginPath();
  ctx.roundRect(cx - 8, pegY - 2, 16, 10, 3);
  ctx.fill();
  ctx.strokeStyle = '#3b2310';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Baş bandını kavrayacak kavisli ön dudak / çıkıntılı destek ucu (boş olduğu net seçilir)
  const tipGrad = ctx.createLinearGradient(cx - 13, pegY + 3, cx + 13, pegY + 11);
  tipGrad.addColorStop(0, '#cfa06c');
  tipGrad.addColorStop(0.5, '#e8c391');
  tipGrad.addColorStop(1, '#8c5e34');
  ctx.fillStyle = tipGrad;
  ctx.strokeStyle = '#3b2310';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(cx - 13, pegY + 3, 26, 7, [3, 3, 5, 5]);
  ctx.fill();
  ctx.stroke();

  // Ön destek ucunda parlak ahşap pah çizgisi
  ctx.strokeStyle = 'rgba(255, 248, 231, 0.75)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 10, pegY + 5);
  ctx.lineTo(cx + 10, pegY + 5);
  ctx.stroke();

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

function drawSeljukPendantLamp(
  ctx: CanvasRenderingContext2D,
  x: number,
  yTop: number,
  chainLength: number,
  now: number,
) {
  ctx.save();

  ctx.strokeStyle = '#8a6836';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(x, yTop);
  ctx.lineTo(x, yTop + chainLength);
  ctx.stroke();

  const lampY = yTop + chainLength;
  const pulse = Math.sin(now / 520) * 0.06 + 0.2;
  if (typeof ctx.createRadialGradient === 'function') {
    const glowGrad = ctx.createRadialGradient(x, lampY + 12, 4, x, lampY + 12, 44);
    glowGrad.addColorStop(0, `rgba(255, 224, 140, ${pulse * 1.4})`);
    glowGrad.addColorStop(1, 'rgba(255, 224, 140, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(x, lampY + 12, 44, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#b8893b';
  ctx.beginPath();
  ctx.moveTo(x - 9, lampY);
  ctx.lineTo(x + 9, lampY);
  ctx.lineTo(x + 12, lampY + 13);
  ctx.lineTo(x, lampY + 24);
  ctx.lineTo(x - 12, lampY + 13);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#5a3d16';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.fillStyle = '#fff4ce';
  ctx.beginPath();
  ctx.arc(x, lampY + 11, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
