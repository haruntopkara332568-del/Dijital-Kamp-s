/**
 * Hayalden Gerçeğe — Ay Yüzeyi Görsel Sahne ve İniş Animasyonu Çizici (Parça 2)
 *
 * Parça 2 Kapsamı:
 * - Ay yüzeyi arka planı (koyu uzay, yıldızlar, Dünya, kraterler ve regolit).
 * - İniş Aracı (Lander):
 *   1. Yukarıdan alçalma hareketi.
 *   2. Zemindeki gölge: araç yaklaştıkça küçülür ve koyulaşır.
 *   3. İniş ayaklarının yüzeye teması, hafif süspansiyon esnemesi, motor alevinin sönmesi ve toz bulutu.
 *   4. Kabin kapağının açılması ve iç kabin ışığı.
 *   5. Merdiven ve astronotun merdivenden inerek iki ayağıyla yüzeye basması.
 * - Astronot Karakteri:
 *   Öğrenci karakteriyle birebir aynı ölçek (53x67 px), aynı çapa noktası; cinsiyetsiz beyaz uzay tulumu,
 *   altın rengi siperlik ve sırt yaşam destek ünitesi.
 * - Performans ve Hata Toleransı:
 *   Canvas 2D üzerinde 60 FPS prosedürel çizim; hiçbir harici ağ veya resim bağımlılığı olmadan %100 çalışır.
 */

import { DISCOVERY_VR_CONFIG, type DiscoveryVrState } from '@/src/data/discoveryCareerConfig';
import { getMoonSurfacePhotoAsset, getAstronautRealAsset, getTurkeyFlagAsset } from './assetLoader';
import type { PlayerCharacter, SceneObstacle } from '../types';

export const MOON_SCENE = {
  width: DISCOVERY_VR_CONFIG.part3Mission.worldWidth,   // 1340
  height: DISCOVERY_VR_CONFIG.part3Mission.worldHeight, // 680
  horizonY: DISCOVERY_VR_CONFIG.part3Mission.horizonY,  // 260
} as const;

/**
 * Parça 3 — Ay Sahnesi Çarpışma ve Sınır Engelleri
 * Kural: Aracın gövdesi ve büyük kayalar geçişi engeller. Merdiven tarafı ve görev yolu açık kalır.
 */
export const DISCOVERY_MOON_OBSTACLES: SceneObstacle[] = [
  // 1. İniş aracı gövdesi (ayaklar ve merdiven dibi x: 330..340 açık kalır)
  {
    id: 'moon-lander-obstacle',
    name: 'İniş Modülü Gövdesi',
    x: 210,
    y: 250,
    width: 115,
    height: 120,
  },
  // 2. Hedef kaya fiziksel engeli (öğrenci içine giremez, yanında durur)
  {
    id: 'moon-target-rock-obstacle',
    name: 'Hedef Ay Kayası',
    x: DISCOVERY_VR_CONFIG.part3Mission.targetRock.x - 18,
    y: DISCOVERY_VR_CONFIG.part3Mission.targetRock.y - 14,
    width: 36,
    height: 28,
  },
  // 3. Dekoratif büyük kayalar (3-5 adet, yol koridoru Y: 380..520 engelsiz)
  ...DISCOVERY_VR_CONFIG.part3Mission.decorativeBoulders.map((b) => ({
    id: b.id,
    name: b.name,
    x: b.x,
    y: b.y,
    width: b.width,
    height: b.height,
  })),
  // 4. Doğal sınır: Kuzey ufuk dağ hattı
  {
    id: 'moon-north-boundary',
    name: 'Kuzey Dağ Sırası',
    x: 0,
    y: 0,
    width: DISCOVERY_VR_CONFIG.part3Mission.worldWidth,
    height: DISCOVERY_VR_CONFIG.part3Mission.walkableBounds.minY,
  },
  // 5. Doğal sınır: Güney krater uçurumu
  {
    id: 'moon-south-boundary',
    name: 'Güney Krater Kenarı',
    x: 0,
    y: DISCOVERY_VR_CONFIG.part3Mission.walkableBounds.maxY,
    width: DISCOVERY_VR_CONFIG.part3Mission.worldWidth,
    height:
      DISCOVERY_VR_CONFIG.part3Mission.worldHeight -
      DISCOVERY_VR_CONFIG.part3Mission.walkableBounds.maxY,
  },
  // 6. Doğal sınır: Batı krater sırtı
  {
    id: 'moon-west-boundary',
    name: 'Batı Krater Sırtı',
    x: 0,
    y: 0,
    width: DISCOVERY_VR_CONFIG.part3Mission.walkableBounds.minX,
    height: DISCOVERY_VR_CONFIG.part3Mission.worldHeight,
  },
  // 7. Doğal sınır: Doğu ufuk hattı
  {
    id: 'moon-east-boundary',
    name: 'Doğu Ufuk Hattı',
    x: DISCOVERY_VR_CONFIG.part3Mission.walkableBounds.maxX,
    y: 0,
    width:
      DISCOVERY_VR_CONFIG.part3Mission.worldWidth -
      DISCOVERY_VR_CONFIG.part3Mission.walkableBounds.maxX,
    height: DISCOVERY_VR_CONFIG.part3Mission.worldHeight,
  },
];

/**
 * Belirlenmiş sabit tohumla yıldız dağılımı (her karede yeniden hesaplanmaz)
 */
interface Star {
  x: number;
  y: number;
  radius: number;
  alpha: number;
}

const STATIC_STARS: Star[] = (() => {
  const stars: Star[] = [];
  let seed = 42;
  const pseudoRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let i = 0; i < 90; i++) {
    stars.push({
      x: Math.round(pseudoRandom() * 960),
      y: Math.round(pseudoRandom() * 230),
      radius: pseudoRandom() > 0.85 ? 1.5 : 0.8,
      alpha: 0.35 + pseudoRandom() * 0.65,
    });
  }
  return stars;
})();

/**
 * Ay Sahnesi Arka Plan Çizimi
 */
export function renderDiscoveryMoonBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const photo = getMoonSurfacePhotoAsset();
  if (photo && photo.complete && photo.naturalWidth > 0) {
    ctx.drawImage(photo, 0, 0, width, height);
    return;
  }

  ctx.save();

  // 1. Derin Uzay Gökyüzü (Gradyan)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, MOON_SCENE.horizonY);
  skyGrad.addColorStop(0, '#040711');
  skyGrad.addColorStop(0.6, '#080d1c');
  skyGrad.addColorStop(1, '#0e162b');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, MOON_SCENE.horizonY + 20);

  // 2. Yıldızlar
  ctx.fillStyle = '#ffffff';
  for (const star of STATIC_STARS) {
    ctx.globalAlpha = star.alpha;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;

  // 3. Uzaktaki Dünya (Sağ üst ufuk üstünde)
  const earthX = 810;
  const earthY = 90;
  const earthR = 34;

  // Dünya atmosfer parıltısı
  const earthGlow = ctx.createRadialGradient(earthX, earthY, earthR * 0.8, earthX, earthY, earthR * 1.5);
  earthGlow.addColorStop(0, 'rgba(80, 160, 255, 0.45)');
  earthGlow.addColorStop(1, 'rgba(80, 160, 255, 0)');
  ctx.fillStyle = earthGlow;
  ctx.beginPath();
  ctx.arc(earthX, earthY, earthR * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Dünya diski
  const earthGrad = ctx.createRadialGradient(earthX - 10, earthY - 10, 5, earthX, earthY, earthR);
  earthGrad.addColorStop(0, '#7ec8ff');
  earthGrad.addColorStop(0.35, '#2f6fc8');
  earthGrad.addColorStop(0.7, '#1b3f7f');
  earthGrad.addColorStop(1, '#071536');
  ctx.fillStyle = earthGrad;
  ctx.beginPath();
  ctx.arc(earthX, earthY, earthR, 0, Math.PI * 2);
  ctx.fill();

  // Dünya üzerindeki kıta / bulut girdapları
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.ellipse(earthX - 6, earthY - 8, 14, 7, -0.3, 0, Math.PI * 2);
  ctx.ellipse(earthX + 8, earthY + 5, 12, 6, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // 4. Uzak Ay Tepeleri / Ufuk Dalgaları
  const horizonGrad = ctx.createLinearGradient(0, MOON_SCENE.horizonY - 50, 0, MOON_SCENE.horizonY + 30);
  horizonGrad.addColorStop(0, '#2e3342');
  horizonGrad.addColorStop(1, '#474d5d');
  ctx.fillStyle = horizonGrad;
  ctx.beginPath();
  ctx.moveTo(0, MOON_SCENE.horizonY);
  ctx.bezierCurveTo(180, MOON_SCENE.horizonY - 28, 320, MOON_SCENE.horizonY - 15, 500, MOON_SCENE.horizonY - 24);
  ctx.bezierCurveTo(680, MOON_SCENE.horizonY - 35, 840, MOON_SCENE.horizonY - 10, width, MOON_SCENE.horizonY - 20);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  // 5. Ay Yüzeyi (Regolit Tabanı)
  const groundGrad = ctx.createLinearGradient(0, MOON_SCENE.horizonY, 0, height);
  groundGrad.addColorStop(0, '#596071');
  groundGrad.addColorStop(0.3, '#757d90');
  groundGrad.addColorStop(0.7, '#8891a5');
  groundGrad.addColorStop(1, '#677083');
  ctx.fillStyle = groundGrad;
  ctx.beginPath();
  ctx.moveTo(0, MOON_SCENE.horizonY);
  ctx.bezierCurveTo(240, MOON_SCENE.horizonY + 8, 480, MOON_SCENE.horizonY - 5, 720, MOON_SCENE.horizonY + 6);
  ctx.lineTo(width, MOON_SCENE.horizonY);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  // 6. Kraterler ve Yüzey Detayları
  drawLunarCrater(ctx, 220, 310, 85, 34, 0.1);
  drawLunarCrater(ctx, 640, 370, 110, 42, -0.05);
  drawLunarCrater(ctx, 430, 480, 140, 52, 0.08);
  drawLunarCrater(ctx, 130, 490, 95, 38, -0.12);
  drawLunarCrater(ctx, 810, 490, 105, 40, 0.04);
  drawLunarCrater(ctx, 510, 275, 45, 18, 0.0);
  drawLunarCrater(ctx, 350, 360, 40, 16, 0.15);

  // 7. Yüzey Taş ve Kaya Parçaları
  drawLunarStone(ctx, 290, 410, 16, 10);
  drawLunarStone(ctx, 570, 440, 22, 14);
  drawLunarStone(ctx, 740, 320, 14, 9);
  drawLunarStone(ctx, 180, 380, 12, 8);
  drawLunarStone(ctx, 880, 430, 18, 11);

  // 8. Türk Bayrağı (Prosedürel yedek sahnede varlık yüklüyse çizilir)
  const flagImg = getTurkeyFlagAsset();
  if (flagImg && flagImg.complete && flagImg.naturalWidth > 0) {
    const flagConfig = DISCOVERY_VR_CONFIG.part3Mission.flag;
    const targetW = Math.round(34 * flagConfig.FLAG_SCALE * (width / 1024));
    const targetH = Math.round((targetW * flagImg.naturalHeight) / flagImg.naturalWidth);
    const worldX = Math.round(flagConfig.poleBaseX * (width / 1024));
    const worldY = Math.round(flagConfig.poleBaseY * (height / 571));
    ctx.drawImage(flagImg, worldX, worldY - targetH, targetW, targetH);
  }

  ctx.restore();
}

/**
 * Krater Çizici
 */
function drawLunarCrater(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rotation: number,
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  ctx.fillStyle = 'rgba(40, 44, 54, 0.65)';
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(25, 28, 36, 0.75)';
  ctx.beginPath();
  ctx.ellipse(-rx * 0.15, -ry * 0.15, rx * 0.8, ry * 0.75, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(215, 223, 238, 0.45)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(0, ry * 0.15, rx * 0.98, ry * 0.9, 0, 0.1 * Math.PI, 0.95 * Math.PI);
  ctx.stroke();

  ctx.restore();
}

/**
 * Ay Taşı Çizici
 */
function drawLunarStone(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  ctx.save();
  ctx.fillStyle = 'rgba(20, 24, 32, 0.5)';
  ctx.beginPath();
  ctx.ellipse(x + 2, y + h * 0.5, w * 0.65, h * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#616777';
  ctx.beginPath();
  ctx.moveTo(x - w * 0.5, y);
  ctx.lineTo(x - w * 0.2, y - h * 0.5);
  ctx.lineTo(x + w * 0.3, y - h * 0.4);
  ctx.lineTo(x + w * 0.5, y + h * 0.2);
  ctx.lineTo(x, y + h * 0.5);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(220, 228, 245, 0.35)';
  ctx.beginPath();
  ctx.moveTo(x - w * 0.5, y);
  ctx.lineTo(x - w * 0.2, y - h * 0.5);
  ctx.lineTo(x + w * 0.3, y - h * 0.4);
  ctx.lineTo(x, y);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/* =========================================================================================
 * PARÇA 2 — İNİŞ ANİMASYONU VE VARLIK ÇİZİCİLERİ
 * ========================================================================================= */

export interface MoonLandingCalculation {
  stage: 'descent' | 'touchdown' | 'hatch' | 'ladder' | 'landed';
  currentLanderY: number;
  altitudeFactor: number; // 1 = en tepede (uzak), 0 = zeminde
  thrusterFlameAlpha: number;
  hatchProgress: number; // 0 = kapalı, 1 = tam açık
  dustProgress: number;  // 0 = yok, 1 = dağılmış
  suspensionOffset: number;
  astronautVisible: boolean;
  astronautPos: { x: number; y: number };
  astronautPose: 'climbing_ladder' | 'ground_idle';
  isComplete: boolean;
}

/**
 * İniş animasyonunun anlık matematiksel durumunu hesaplar
 */
export function calculateMoonLandingState(
  elapsedMs: number,
  isSkipped: boolean,
  isReducedMotion: boolean,
): MoonLandingCalculation {
  const cfg = DISCOVERY_VR_CONFIG;
  const tCfg = cfg.landingTimeline;
  const lander = cfg.lander;
  const astro = cfg.astronautLanding;

  // "Geç" basılmışsa veya hareketi azaltma süresi (600ms) dolmuşsa doğrudan son duruma geç
  if (isSkipped || (isReducedMotion && elapsedMs >= tCfg.motionReducedDurationMs) || elapsedMs >= tCfg.totalAnimationDurationMs) {
    return {
      stage: 'landed',
      currentLanderY: lander.targetY,
      altitudeFactor: 0,
      thrusterFlameAlpha: 0,
      hatchProgress: 1,
      dustProgress: 1,
      suspensionOffset: 0,
      astronautVisible: true,
      astronautPos: astro.surfacePosition,
      astronautPose: 'ground_idle',
      isComplete: true,
    };
  }

  const t1 = tCfg.descentDurationMs; // 4200
  const t2 = t1 + tCfg.touchdownDurationMs; // 5600
  const t3 = t2 + tCfg.hatchOpenDurationMs; // 6400

  // 1. AŞAMA: Alçalma (0..4.2s)
  if (elapsedMs < t1) {
    const p = elapsedMs / t1;
    // Yumuşak frenleme (ease-out cubic benzeri)
    const eased = 1 - Math.pow(1 - p, 2.5);
    const currentY = lander.startAltitudeY + (lander.targetY - lander.startAltitudeY) * eased;
    const altitudeFactor = 1 - eased;

    return {
      stage: 'descent',
      currentLanderY: currentY,
      altitudeFactor,
      thrusterFlameAlpha: 0.6 + Math.sin(elapsedMs * 0.03) * 0.35,
      hatchProgress: 0,
      dustProgress: 0,
      suspensionOffset: 0,
      astronautVisible: false,
      astronautPos: astro.ladderTop,
      astronautPose: 'climbing_ladder',
      isComplete: false,
    };
  }

  // 2. AŞAMA: Temas, Yaylanma ve Toz Bulutu (4.2s..5.6s)
  if (elapsedMs < t2) {
    const p = (elapsedMs - t1) / tCfg.touchdownDurationMs;
    // Hafif süspansiyon yaylanması: sinüs dalgası sönümü
    const suspensionOffset = Math.sin(p * Math.PI) * 7 * (1 - p);

    return {
      stage: 'touchdown',
      currentLanderY: lander.targetY + suspensionOffset,
      altitudeFactor: 0,
      thrusterFlameAlpha: 0, // Motor söndü
      hatchProgress: 0,
      dustProgress: p,
      suspensionOffset,
      astronautVisible: false,
      astronautPos: astro.ladderTop,
      astronautPose: 'climbing_ladder',
      isComplete: false,
    };
  }

  // 3. AŞAMA: Kapak Açılması (5.6s..6.4s)
  if (elapsedMs < t3) {
    const p = (elapsedMs - t2) / tCfg.hatchOpenDurationMs;
    return {
      stage: 'hatch',
      currentLanderY: lander.targetY,
      altitudeFactor: 0,
      thrusterFlameAlpha: 0,
      hatchProgress: Math.min(1, p),
      dustProgress: 1,
      suspensionOffset: 0,
      astronautVisible: p > 0.4,
      astronautPos: astro.ladderTop,
      astronautPose: 'climbing_ladder',
      isComplete: false,
    };
  }

  // 4. AŞAMA: Astronotun Merdivenden İnmesi (6.4s..8.0s)
  const p = Math.min(1, (elapsedMs - t3) / tCfg.exitLadderDurationMs);
  const currentAstroY = astro.ladderTop.y + (astro.surfacePosition.y - astro.ladderTop.y) * p;
  const currentAstroX = astro.ladderTop.x + (astro.surfacePosition.x - astro.ladderTop.x) * p;

  return {
    stage: 'ladder',
    currentLanderY: lander.targetY,
    altitudeFactor: 0,
    thrusterFlameAlpha: 0,
    hatchProgress: 1,
    dustProgress: 1,
    suspensionOffset: 0,
    astronautVisible: true,
    astronautPos: { x: currentAstroX, y: currentAstroY },
    astronautPose: p >= 0.95 ? 'ground_idle' : 'climbing_ladder',
    isComplete: p >= 1,
  };
}

/**
 * İniş Aracı Gölgesi Çizici
 * Kural: "zemindeki gölgesi araca yaklaştıkça küçülüp koyulaşır (gölge boyutu ve opaklığı araç yüksekliğine bağlı)"
 */
export function drawMoonLanderShadow(
  ctx: CanvasRenderingContext2D,
  altitudeFactor: number,
) {
  const lander = DISCOVERY_VR_CONFIG.lander;
  const shadowX = lander.targetX + lander.width * 0.48;
  const shadowY = lander.shadowBaseY;

  // Araç yüksekteyken gölge daha geniş (yayılmış) ve çok siliktir
  // Araç zemine indikçe gölge tam ayak hizasına daralır ve koyulaşır
  const scale = 1.0 + altitudeFactor * 0.8;
  const rx = lander.shadowRadiusX * scale;
  const ry = lander.shadowRadiusY * scale;
  const alpha = 0.78 * (1 - altitudeFactor * 0.85);

  ctx.save();
  ctx.fillStyle = `rgba(18, 20, 28, ${Math.max(0.05, alpha).toFixed(3)})`;
  ctx.beginPath();
  ctx.ellipse(shadowX, shadowY, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Ay Toz Bulutu Çizici (Temas anında iki yana dağılır)
 */
export function drawTouchdownDust(
  ctx: CanvasRenderingContext2D,
  dustProgress: number,
) {
  if (dustProgress <= 0 || dustProgress >= 1) return;

  const lander = DISCOVERY_VR_CONFIG.lander;
  const footY = lander.shadowBaseY - 2;
  const leftFootX = lander.targetX + 16;
  const rightFootX = lander.targetX + lander.width - 24;

  const alpha = Math.sin(dustProgress * Math.PI) * 0.65;
  const spread = dustProgress * 42;

  ctx.save();
  ctx.fillStyle = `rgba(180, 190, 210, ${alpha.toFixed(3)})`;

  // Sol ayak tozu
  ctx.beginPath();
  ctx.ellipse(leftFootX - spread * 0.7, footY - spread * 0.2, 18 + spread * 0.4, 7 + spread * 0.2, -0.15, 0, Math.PI * 2);
  ctx.ellipse(leftFootX - spread * 0.3, footY - spread * 0.3, 14 + spread * 0.3, 8 + spread * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sağ ayak tozu
  ctx.beginPath();
  ctx.ellipse(rightFootX + spread * 0.7, footY - spread * 0.2, 18 + spread * 0.4, 7 + spread * 0.2, 0.15, 0, Math.PI * 2);
  ctx.ellipse(rightFootX + spread * 0.3, footY - spread * 0.3, 14 + spread * 0.3, 8 + spread * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * İniş Aracı (Lander) Çizimi
 */
export function drawMoonLander(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  calc: MoonLandingCalculation,
) {
  const w = DISCOVERY_VR_CONFIG.lander.width;  // 180
  const h = DISCOVERY_VR_CONFIG.lander.height; // 190

  ctx.save();
  ctx.translate(x, y);

  // 1. Motor Alevi / İtiş Parıltısı (Yalnızca alçalma aşamasında yanar)
  if (calc.thrusterFlameAlpha > 0.05) {
    const flameAlpha = calc.thrusterFlameAlpha;
    const nozzleX = w * 0.48;
    const nozzleY = h * 0.88;

    ctx.save();
    // Dış alev ışıması
    const flameGrad = ctx.createRadialGradient(nozzleX, nozzleY, 4, nozzleX, nozzleY + 35, 45);
    flameGrad.addColorStop(0, `rgba(255, 230, 150, ${flameAlpha})`);
    flameGrad.addColorStop(0.4, `rgba(255, 120, 40, ${flameAlpha * 0.7})`);
    flameGrad.addColorStop(1, 'rgba(255, 80, 0, 0)');
    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.moveTo(nozzleX - 16, nozzleY);
    ctx.lineTo(nozzleX, nozzleY + 45 + Math.sin(Date.now() * 0.04) * 8);
    ctx.lineTo(nozzleX + 16, nozzleY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 2. İniş Ayakları ve Destek Kirişleri (Descent Stage Legs)
  const baseY = h * 0.78;
  const footY = h * 0.98;

  ctx.strokeStyle = '#d4af37'; // Altın folyo destek kaplaması
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';

  // Sol ön ayak
  ctx.beginPath();
  ctx.moveTo(w * 0.28, baseY);
  ctx.lineTo(w * 0.06, footY);
  ctx.stroke();

  // Sol iç payanda
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#9ca3af';
  ctx.beginPath();
  ctx.moveTo(w * 0.36, baseY + 6);
  ctx.lineTo(w * 0.12, footY - 8);
  ctx.stroke();

  // Sağ ön ayak
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#d4af37';
  ctx.beginPath();
  ctx.moveTo(w * 0.68, baseY);
  ctx.lineTo(w * 0.90, footY);
  ctx.stroke();

  // Sağ iç payanda
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#9ca3af';
  ctx.beginPath();
  ctx.moveTo(w * 0.60, baseY + 6);
  ctx.lineTo(w * 0.84, footY - 8);
  ctx.stroke();

  // Arka ayaklar (perspektif derinliği için daha koyu)
  ctx.strokeStyle = '#785b1a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(w * 0.42, baseY - 6);
  ctx.lineTo(w * 0.22, footY - 14);
  ctx.moveTo(w * 0.54, baseY - 6);
  ctx.lineTo(w * 0.74, footY - 14);
  ctx.stroke();

  // Ayak Taban Pabuçları (Yuvarlak diskler)
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.ellipse(w * 0.06, footY, 12, 4.5, 0, 0, Math.PI * 2);
  ctx.ellipse(w * 0.90, footY, 12, 4.5, 0, 0, Math.PI * 2);
  ctx.ellipse(w * 0.22, footY - 14, 8, 3.5, 0, 0, Math.PI * 2);
  ctx.ellipse(w * 0.74, footY - 14, 8, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 3. Alt İniş Aşaması Gövdesi (Altın Termal Mylar Folyo Kaplama)
  const descentStageY = h * 0.52;
  const descentStageH = h * 0.28;

  // Altın folyo çokgen gövde
  ctx.fillStyle = '#b47818';
  ctx.beginPath();
  ctx.moveTo(w * 0.25, descentStageY);
  ctx.lineTo(w * 0.71, descentStageY);
  ctx.lineTo(w * 0.77, descentStageY + descentStageH);
  ctx.lineTo(w * 0.19, descentStageY + descentStageH);
  ctx.closePath();
  ctx.fill();

  // Ön yansıtıcı paneller
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(w * 0.32, descentStageY + 2);
  ctx.lineTo(w * 0.64, descentStageY + 2);
  ctx.lineTo(w * 0.68, descentStageY + descentStageH - 3);
  ctx.lineTo(w * 0.28, descentStageY + descentStageH - 3);
  ctx.closePath();
  ctx.fill();

  // Mylar folyo kırışık panelleri (detay)
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(w * 0.48, descentStageY);
  ctx.lineTo(w * 0.48, descentStageY + descentStageH);
  ctx.moveTo(w * 0.28, descentStageY + descentStageH * 0.5);
  ctx.lineTo(w * 0.68, descentStageY + descentStageH * 0.5);
  ctx.stroke();

  // Merkez roket motoru çanı
  ctx.fillStyle = '#374151';
  ctx.beginPath();
  ctx.moveTo(w * 0.42, descentStageY + descentStageH);
  ctx.lineTo(w * 0.45, descentStageY + descentStageH + 16);
  ctx.lineTo(w * 0.51, descentStageY + descentStageH + 16);
  ctx.lineTo(w * 0.54, descentStageY + descentStageH);
  ctx.closePath();
  ctx.fill();

  // 4. Üst Çıkış Aşaması Kabini (Ascent Stage)
  const ascentY = h * 0.18;
  const ascentH = h * 0.36;

  // Kabin ana dış kabuğu (krem / gümüş-beyaz fasetli gövde)
  ctx.fillStyle = '#e5e7eb';
  ctx.beginPath();
  ctx.moveTo(w * 0.33, ascentY);
  ctx.lineTo(w * 0.63, ascentY);
  ctx.lineTo(w * 0.72, ascentY + ascentH * 0.45);
  ctx.lineTo(w * 0.68, ascentY + ascentH);
  ctx.lineTo(w * 0.28, ascentY + ascentH);
  ctx.lineTo(w * 0.24, ascentY + ascentH * 0.45);
  ctx.closePath();
  ctx.fill();

  // Faset ışık/gölge panelleri
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(w * 0.36, ascentY + 3);
  ctx.lineTo(w * 0.60, ascentY + 3);
  ctx.lineTo(w * 0.56, ascentY + ascentH - 2);
  ctx.lineTo(w * 0.40, ascentY + ascentH - 2);
  ctx.closePath();
  ctx.fill();

  // Ön Üçgen Gözlem Pencereleri
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  // Sol pencere
  ctx.moveTo(w * 0.38, ascentY + 14);
  ctx.lineTo(w * 0.44, ascentY + 14);
  ctx.lineTo(w * 0.43, ascentY + 28);
  ctx.closePath();
  // Sağ pencere
  ctx.moveTo(w * 0.52, ascentY + 14);
  ctx.lineTo(w * 0.58, ascentY + 14);
  ctx.lineTo(w * 0.53, ascentY + 28);
  ctx.closePath();
  ctx.fill();

  // Pencere camı parıltısı
  ctx.fillStyle = 'rgba(125, 211, 252, 0.65)';
  ctx.beginPath();
  ctx.moveTo(w * 0.39, ascentY + 16);
  ctx.lineTo(w * 0.43, ascentY + 16);
  ctx.lineTo(w * 0.41, ascentY + 22);
  ctx.closePath();
  ctx.fill();

  // Üst radar / iletişim anteni
  ctx.strokeStyle = '#9ca3af';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.48, ascentY);
  ctx.lineTo(w * 0.48, ascentY - 18);
  ctx.stroke();

  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.ellipse(w * 0.48, ascentY - 18, 10, 4, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // RCS Yönlendirme İticileri (Dört köşede)
  ctx.fillStyle = '#4b5563';
  ctx.fillRect(w * 0.22, ascentY + 18, 5, 5);
  ctx.fillRect(w * 0.69, ascentY + 18, 5, 5);

  // 5. Kabin Kapağı ve Çıkış Merdiveni
  const hatchX = w * 0.38;
  const hatchY = ascentY + 34;
  const hatchW = 28;
  const hatchH = 34;

  // Kapak açıklığı / çerçevesi
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(hatchX, hatchY, hatchW, hatchH);

  // İç kabin aydınlık parıltısı (kapak açılınca içerideki sıcak kehribar ışık)
  if (calc.hatchProgress > 0) {
    ctx.fillStyle = `rgba(254, 240, 138, ${(calc.hatchProgress * 0.85).toFixed(2)})`;
    ctx.fillRect(hatchX + 2, hatchY + 2, hatchW - 4, hatchH - 4);
  }

  // Menteşeli kapak (dışa doğru açılma açısı)
  if (calc.hatchProgress < 1) {
    const doorAngle = calc.hatchProgress * (Math.PI * 0.55);
    const doorW = hatchW * Math.cos(doorAngle);
    ctx.fillStyle = '#d1d5db';
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.rect(hatchX, hatchY, Math.max(2, doorW), hatchH);
    ctx.fill();
    ctx.stroke();
  }

  // Merdiven (Kabin kapısından zemine kadar inen basamaklar)
  const ladderX = hatchX + 8;
  const ladderTopY = hatchY + hatchH;
  const ladderBottomY = footY;

  ctx.strokeStyle = '#9ca3af';
  ctx.lineWidth = 2;

  // Merdiven yan rayları
  ctx.beginPath();
  ctx.moveTo(ladderX, ladderTopY);
  ctx.lineTo(ladderX, ladderBottomY);
  ctx.moveTo(ladderX + 16, ladderTopY);
  ctx.lineTo(ladderX + 16, ladderBottomY);
  ctx.stroke();

  // Merdiven basamakları (Rungs)
  const rungsCount = 7;
  const rungStep = (ladderBottomY - ladderTopY) / rungsCount;
  for (let i = 1; i <= rungsCount; i++) {
    const ry = ladderTopY + i * rungStep;
    ctx.beginPath();
    ctx.moveTo(ladderX, ry);
    ctx.lineTo(ladderX + 16, ry);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Astronot Karakteri Çizimi
 * Kural: Öğrenci karakteriyle AYNI ölçek (53×67 px), AYNI çapa noktası (ayak taban merkezi).
 * Cinsiyetsiz, miğferli, beyaz tulumlu astronot.
 */
export function drawAstronautCharacter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  pose: 'climbing_ladder' | 'ground_idle',
) {
  const w = DISCOVERY_VR_CONFIG.astronautLanding.width;  // 53
  const h = DISCOVERY_VR_CONFIG.astronautLanding.height; // 67

  ctx.save();
  ctx.translate(x, y);

  // Fotoğrafik gerçek astronot görseli yüklendiyse öncelikli olarak onu çiz
  const astroImg = getAstronautRealAsset();
  if (astroImg && astroImg.complete && astroImg.naturalWidth > 0) {
    if (pose === 'ground_idle') {
      ctx.fillStyle = 'rgba(20, 24, 32, 0.65)';
      ctx.beginPath();
      ctx.ellipse(w * 0.5, h - 2, 22, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    const drawH = 72; // Anten dahil toplam ölçek yüksekliği
    const drawW = Math.round(drawH * (astroImg.naturalWidth / astroImg.naturalHeight));
    const drawX = Math.round(w / 2 - drawW / 2);
    const drawY = h - drawH + 2;

    if (pose === 'climbing_ladder') {
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(-0.06);
      ctx.drawImage(astroImg, -drawW / 2, drawY - h / 2, drawW, drawH);
      ctx.restore();
    } else {
      ctx.drawImage(astroImg, drawX, drawY, drawW, drawH);
    }

    ctx.restore();
    return;
  }

  // Zemin gölgesi (Yalnızca zemindeyken)
  if (pose === 'ground_idle') {
    ctx.fillStyle = 'rgba(20, 24, 32, 0.65)';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h - 2, 20, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 1. Yaşam Destek Sırt Çantası (PLSS Backpack)
  ctx.fillStyle = '#d1d5db';
  ctx.strokeStyle = '#9ca3af';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(w * 0.22, h * 0.22, w * 0.56, h * 0.42, 5);
  ctx.fill();
  ctx.stroke();

  // 2. Bacaklar ve Botlar
  const legW = 12;
  const legH = 22;
  const legY = h * 0.64;

  ctx.fillStyle = '#f3f4f6';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;

  if (pose === 'climbing_ladder') {
    // Merdivenden iniş basamak pozu: bir bacak hafif yukarıda
    ctx.beginPath();
    ctx.roundRect(w * 0.26, legY - 4, legW, legH - 2, 4);
    ctx.roundRect(w * 0.54, legY, legW, legH, 4);
    ctx.fill();
    ctx.stroke();
  } else {
    // Zeminde iki ayağıyla sağlam duruş (idle)
    ctx.beginPath();
    ctx.roundRect(w * 0.22, legY, legW, legH, 4);
    ctx.roundRect(w * 0.56, legY, legW, legH, 4);
    ctx.fill();
    ctx.stroke();
  }

  // Lunar Ay Botları (Mavi/gri kalın tabanlar)
  ctx.fillStyle = '#475569';
  if (pose === 'climbing_ladder') {
    ctx.fillRect(w * 0.24, legY + legH - 8, legW + 3, 6);
    ctx.fillRect(w * 0.53, legY + legH - 2, legW + 3, 6);
  } else {
    ctx.fillRect(w * 0.20, h - 6, legW + 4, 6);
    ctx.fillRect(w * 0.54, h - 6, legW + 4, 6);
  }

  // 3. Gövde (Beyaz Uzay Tulumu)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(w * 0.20, h * 0.26, w * 0.60, h * 0.42, 8);
  ctx.fill();
  ctx.stroke();

  // Göğüs Kontrol Ünitesi (RDM Göğüs Kutusu - amblemsiz)
  ctx.fillStyle = '#e2e8f0';
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(w * 0.32, h * 0.34, w * 0.36, h * 0.20, 3);
  ctx.fill();
  ctx.stroke();

  // Küçük kontrol tuşları
  ctx.fillStyle = '#38bdf8'; // Açık mavi buton
  ctx.fillRect(w * 0.36, h * 0.38, 4, 4);
  ctx.fillStyle = '#fbbf24'; // Sarı buton
  ctx.fillRect(w * 0.44, h * 0.38, 4, 4);
  ctx.fillStyle = '#f87171'; // Kırmızı buton
  ctx.fillRect(w * 0.52, h * 0.38, 4, 4);

  // 4. Kollar ve Eldivenler
  ctx.fillStyle = '#f3f4f6';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;

  if (pose === 'climbing_ladder') {
    // Merdiveni tutuş pozu
    ctx.beginPath();
    ctx.roundRect(w * 0.12, h * 0.28, 10, 20, 4);
    ctx.roundRect(w * 0.78, h * 0.24, 10, 20, 4);
    ctx.fill();
    ctx.stroke();

    // Mavi kauçuk parmaklı eldivenler
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(w * 0.17, h * 0.48, 5, 0, Math.PI * 2);
    ctx.arc(w * 0.83, h * 0.44, 5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Yanlarda rahat duruş
    ctx.beginPath();
    ctx.roundRect(w * 0.10, h * 0.30, 9, 22, 4);
    ctx.roundRect(w * 0.81, h * 0.30, 9, 22, 4);
    ctx.fill();
    ctx.stroke();

    // Eldivenler
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(w * 0.14, h * 0.52, 5, 0, Math.PI * 2);
    ctx.arc(w * 0.86, h * 0.52, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Kask ve Yansıtıcı Altın Siperlik (Visor)
  // Kask dış çemberi
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(w * 0.50, h * 0.17, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Altın / kehribar tonlu yansıtıcı güneş siperliği
  const visorGrad = ctx.createLinearGradient(w * 0.40, h * 0.08, w * 0.60, h * 0.24);
  visorGrad.addColorStop(0, '#fef08a');
  visorGrad.addColorStop(0.3, '#f59e0b');
  visorGrad.addColorStop(0.7, '#d97706');
  visorGrad.addColorStop(1, '#78350f');
  ctx.fillStyle = visorGrad;
  ctx.beginPath();
  ctx.ellipse(w * 0.50, h * 0.17, 10, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Siperlikte uzay parıltısı (yıldız yansıması)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.beginPath();
  ctx.arc(w * 0.46, h * 0.14, 2.5, 0, Math.PI * 2);
  ctx.arc(w * 0.52, h * 0.18, 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Ay Sahnesi Katmanlı Varlık Çizimi (İniş Aracı + Astronot)
 */
export function renderDiscoveryMoonEntities(
  ctx: CanvasRenderingContext2D,
  elapsedMs: number,
  isSkipped: boolean,
  isReducedMotion: boolean,
) {
  const calc = calculateMoonLandingState(elapsedMs, isSkipped, isReducedMotion);
  const lander = DISCOVERY_VR_CONFIG.lander;

  // 1. Aracın zemindeki gölgesi
  drawMoonLanderShadow(ctx, calc.altitudeFactor);

  // 2. Temas anında toz bulutu
  drawTouchdownDust(ctx, calc.dustProgress);

  // 3. İniş Aracı Gövdesi
  drawMoonLander(ctx, lander.targetX, calc.currentLanderY, calc);

  // 4. Astronot (Merdivenden inerken veya zemine bastığında)
  if (calc.astronautVisible) {
    drawAstronautCharacter(ctx, calc.astronautPos.x, calc.astronautPos.y, calc.astronautPose);
  }

  return calc;
}

/**
 * Parça 3 — İşaretli Ay Kayası Çizimi
 * Kural: Üstünde net bir işaret (ışıldayan halka veya elmas/rozet simgesi).
 * Örnek alındıktan sonra işaret kalkar, kayada çekirdek numunesi izi kalır.
 */
export function drawTargetMoonRock(
  ctx: CanvasRenderingContext2D,
  rock: { x: number; y: number; radius: number },
  isSampleTaken: boolean,
) {
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const { x, y, radius } = rock;

  ctx.save();
  ctx.translate(x, y);

  // 1. Zemin gölgesi (hafif yayvan ay regoliti gölgesi)
  ctx.fillStyle = 'rgba(12, 16, 24, 0.7)';
  ctx.beginPath();
  ctx.ellipse(3, radius * 0.55, radius * 1.3, radius * 0.5, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // 2. Fasetli Ay Kayası Gövdesi (Bazalt / Anortozit kütlesi)
  ctx.fillStyle = '#475569';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-radius * 0.9, radius * 0.3);
  ctx.lineTo(-radius * 0.7, -radius * 0.65);
  ctx.lineTo(-radius * 0.2, -radius * 0.95);
  ctx.lineTo(radius * 0.6, -radius * 0.75);
  ctx.lineTo(radius * 1.05, -radius * 0.1);
  ctx.lineTo(radius * 0.85, radius * 0.65);
  ctx.lineTo(-radius * 0.1, radius * 0.85);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Açık gri mineral fasetleri
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.moveTo(-radius * 0.7, -radius * 0.65);
  ctx.lineTo(-radius * 0.2, -radius * 0.95);
  ctx.lineTo(0, -radius * 0.2);
  ctx.lineTo(-radius * 0.45, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.moveTo(-radius * 0.2, -radius * 0.95);
  ctx.lineTo(radius * 0.6, -radius * 0.75);
  ctx.lineTo(radius * 0.2, -radius * 0.2);
  ctx.lineTo(0, -radius * 0.2);
  ctx.closePath();
  ctx.fill();

  // 3. Örnek durumu ve göstergeler
  if (isSampleTaken) {
    // Örnek alındı: Çekirdek oyuğu (numune alındığını belirtir)
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, -4, 6, 4, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    // Örnek alınmadı: Parlayan halka ve süzülen elmas işaretçi
    const pulse = 1 + Math.sin(now / 240) * 0.18;
    const ringRadius = radius * 1.5 * pulse;

    // Parlayan kesikli zemin halkası
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.ellipse(0, radius * 0.3, ringRadius, ringRadius * 0.45, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Halka iç ışıltısı
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.beginPath();
    ctx.ellipse(0, radius * 0.3, ringRadius, ringRadius * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Üstte süzülen parlak hedef elması
    const hoverY = -radius * 1.5 - Math.sin(now / 300) * 5;
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, hoverY - 14);
    ctx.lineTo(10, hoverY);
    ctx.lineTo(0, hoverY + 14);
    ctx.lineTo(-10, hoverY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, hoverY, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Parça 3 — Çevredeki Dekoratif Büyük Kayalar
 */
export function drawDecorativeBoulders(
  ctx: CanvasRenderingContext2D,
  boulders: readonly { id: string; x: number; y: number; width: number; height: number }[],
) {
  for (const b of boulders) {
    ctx.save();
    ctx.translate(b.x + b.width / 2, b.y + b.height / 2);

    // Zemin gölgesi
    ctx.fillStyle = 'rgba(12, 16, 24, 0.6)';
    ctx.beginPath();
    ctx.ellipse(3, b.height * 0.3, b.width * 0.58, b.height * 0.35, 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Fasetli kaya
    ctx.fillStyle = '#4b5563';
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const rx = b.width * 0.5;
    const ry = b.height * 0.45;
    ctx.moveTo(-rx * 0.9, ry * 0.4);
    ctx.lineTo(-rx * 0.7, -ry * 0.7);
    ctx.lineTo(0, -ry * 0.95);
    ctx.lineTo(rx * 0.8, -ry * 0.6);
    ctx.lineTo(rx * 0.95, ry * 0.3);
    ctx.lineTo(rx * 0.5, ry * 0.9);
    ctx.lineTo(-rx * 0.4, ry * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Güneş alan açık yüzey
    ctx.fillStyle = '#6b7280';
    ctx.beginPath();
    ctx.moveTo(-rx * 0.7, -ry * 0.7);
    ctx.lineTo(0, -ry * 0.95);
    ctx.lineTo(rx * 0.2, -ry * 0.1);
    ctx.lineTo(-rx * 0.3, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

/**
 * Parça 3 — Yürüyen Astronot Karakteri Çizimi
 * Kural 6: Kampüsün 2.5D mantığı ve animasyon yöntemiyle aynı (hafif ay adımı sekmesi,
 * sola dönüşte yatay çevirme, eğilme hareketi).
 */
export function drawAstronautPlayer(
  ctx: CanvasRenderingContext2D,
  player: PlayerCharacter,
  isCollectingSample: boolean = false,
) {
  const { x, y, direction, state, walkFrame } = player;
  const w = DISCOVERY_VR_CONFIG.astronautLanding.width; // 53
  const h = DISCOVERY_VR_CONFIG.astronautLanding.height; // 67
  const isWalking = state === 'walk';

  ctx.save();
  ctx.translate(x, y);

  // 1. Zemin gölgesi (hafif yayvan ay regoliti temas gölgesi)
  ctx.fillStyle = 'rgba(15, 20, 28, 0.62)';
  ctx.beginPath();
  const shadowRadiusX = isCollectingSample ? 24 : 20;
  const shadowRadiusY = isCollectingSample ? 7.5 : 6;
  ctx.ellipse(w * 0.5 + (direction === 'left' ? -3 : 3), h - 2, shadowRadiusX, shadowRadiusY, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // 2. Yürüme adımı yaylanması (hafif ay yerçekimi salınımı: aşırı sekme yok)
  const bobY = isWalking ? Math.abs(Math.sin(walkFrame * Math.PI)) * -3.2 : 0;
  const swayAngle = isWalking ? Math.sin(walkFrame * Math.PI) * 0.04 : 0;

  ctx.translate(w / 2, h / 2 + bobY);
  ctx.rotate(swayAngle);

  // 3. Eğilme / Örnek Alma Animasyonu (Diz çöküp kayaya uzanma açısı)
  if (isCollectingSample) {
    ctx.translate(0, 8);
    ctx.rotate(direction === 'left' ? 0.32 : -0.32);
  }

  // Yön çevirme: Sola hareket ederken yatay çevirme (flip)
  if (direction === 'left') {
    ctx.scale(-1, 1);
  }

  // Fotoğrafik gerçek astronot görseli yüklendiyse öncelikli olarak onu çiz
  const astroImg = getAstronautRealAsset();
  if (astroImg && astroImg.complete && astroImg.naturalWidth > 0) {
    const drawH = 72;
    const drawW = Math.round(drawH * (astroImg.naturalWidth / astroImg.naturalHeight));
    const drawX = -drawW / 2;
    const drawY = -h / 2 + (h - drawH + 2);
    ctx.drawImage(astroImg, drawX, drawY, drawW, drawH);
    ctx.restore();
    return;
  }

  // Prosedürel yedek tulum çizimi
  ctx.translate(-w / 2, -h / 2);
  drawAstronautCharacter(ctx, 0, 0, 'ground_idle');
  ctx.restore();
}

/**
 * Parça 3 — Geliştirici Modu ?debug=ay Çizimi
 * Kural: Yalnızca geliştirme modunda (?debug=ay) yürünebilir alan, çarpışmalar ve etkileşim bölgeleri çizilir.
 */
export function drawMoonDebugOverlay(
  ctx: CanvasRenderingContext2D,
  player: { x: number; y: number },
  vrState: string,
) {
  if (typeof window === 'undefined') return;
  if (!import.meta.env.DEV) return;
  const isDebug = new URLSearchParams(window.location.search).get('debug') === 'ay';
  if (!isDebug) return;

  const mission = DISCOVERY_VR_CONFIG.part3Mission;
  ctx.save();

  // 1. Yürünebilir alan sınır kutusu (yarı saydam yeşil)
  const b = mission.walkableBounds;
  ctx.fillStyle = 'rgba(34, 197, 94, 0.16)';
  ctx.strokeStyle = 'rgba(34, 197, 94, 0.85)';
  ctx.lineWidth = 2;
  ctx.fillRect(b.minX, b.minY, b.maxX - b.minX, b.maxY - b.minY);
  ctx.strokeRect(b.minX, b.minY, b.maxX - b.minX, b.maxY - b.minY);

  // 2. Engeller (yarı saydam kırmızı)
  ctx.fillStyle = 'rgba(239, 68, 68, 0.32)';
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.88)';
  for (const obs of DISCOVERY_MOON_OBSTACLES) {
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
  }

  // 3. Etkileşim bölgeleri (yarı saydam camgöbeği & kehribar)
  // Hedef kaya bölgesi
  ctx.fillStyle = 'rgba(6, 182, 212, 0.22)';
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.85)';
  ctx.beginPath();
  ctx.arc(mission.targetRock.x, mission.targetRock.y, mission.targetRock.interactionRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Araca dönüş bölgesi
  ctx.fillStyle = 'rgba(245, 158, 11, 0.22)';
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)';
  ctx.beginPath();
  ctx.arc(mission.landerReturn.x, mission.landerReturn.y, mission.landerReturn.interactionRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 4. Bilgi metni
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px monospace';
  ctx.fillText(
    `[DEBUG AY] Durum: ${vrState} | Konum: (${Math.round(player.x)}, ${Math.round(player.y)})`,
    85,
    335,
  );

  ctx.restore();
}

/**
 * Parça 3 — Ay Yüzeyinde Yürüme Sahnesi Tam Çizimi
 */
export function renderDiscoveryMoonWalkableScene(
  ctx: CanvasRenderingContext2D,
  player: PlayerCharacter,
  vrState: DiscoveryVrState,
  isCollectingSample: boolean,
  isSampleTaken: boolean,
) {
  const lander = DISCOVERY_VR_CONFIG.lander;
  const mission = DISCOVERY_VR_CONFIG.part3Mission;

  // 1. Zemin gölgesi (iniş tamamlanmış, altitudeFactor = 0)
  drawMoonLanderShadow(ctx, 0);

  // 2. İniş aracı gövdesi (kapak açık, merdiven kurulu, astronot yok çünkü player çiziyor)
  const landedState: MoonLandingCalculation = {
    stage: 'landed',
    currentLanderY: lander.targetY,
    altitudeFactor: 0,
    thrusterFlameAlpha: 0,
    dustProgress: 0,
    suspensionOffset: 0,
    hatchProgress: 1,
    astronautVisible: false,
    astronautPos: { x: 0, y: 0 },
    astronautPose: 'ground_idle',
    isComplete: true,
  };
  drawMoonLander(ctx, lander.targetX, lander.targetY, landedState);

  // 3. Dekoratif büyük kayalar
  drawDecorativeBoulders(ctx, mission.decorativeBoulders);

  // 4. Hedef Ay Kayası
  drawTargetMoonRock(ctx, mission.targetRock, isSampleTaken);

  // 5. Yürüyen / Örnek Alan Astronot Karakteri
  drawAstronautPlayer(ctx, player, isCollectingSample);

  // 6. Geliştirici modu debug katmanı
  drawMoonDebugOverlay(ctx, player, vrState);
}
