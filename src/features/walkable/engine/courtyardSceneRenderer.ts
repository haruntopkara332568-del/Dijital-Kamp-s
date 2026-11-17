/**
 * Yürünebilir Kampüs Avlusu (Courtyard) Görsel Sahne Çizici — Aşama 4 Görsel Dönüşümü.
 * 2,5B Anadolu–Selçuklu mimari kimliğini animasyon filmi estetiği, katmanlı derinlik,
 * zarif ışık-gölge dengesi, su parıltısı ve çevre salınımı ile buluşturur.
 *
 * ÖNEMLİ KURAL:
 * Yürünebilir yollar, bina çarpışma sınırları (AABB) ve kapı koordinatları
 * mevcut motor ve testlerle %100 uyumlu olarak korunmuştur.
 */

import type { PlayerCharacter } from '../types';
import { drawCharacter } from './characterRenderer';
import {
  getEnglishBuildingAsset,
  getDiscoveryBuildingAsset,
  getLibraryBuildingAsset,
  getFountainAsset,
  getMissionsKioskAsset,
  getJourneyPavilionAsset,
  getCypressTreeAsset,
  getShadeTreeAsset,
} from './assetLoader';

export interface DepthEntity {
  id: string;
  baseY: number;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

/**
 * Katmanlı Zemin ve Arka Plan Çizimi:
 * Zemin taş dokusu, sur arkası zengin ağaç kuşağı, surlar, yeşil çim parterler,
 * Selçuklu sekiz köşeli yıldız taban mozaiği, yollar ve yönlendirici taş oklar.
 */
export function renderCourtyardLayeredBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const isReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const now = isReducedMotion ? 0 : typeof performance !== 'undefined' ? performance.now() : 0;

  // 1. ZEMİN (Katmanlı Sıcak Taş Meydan & Bahçe Dokusu)
  drawCourtyardGround(ctx, width, height);

  // 1b. ARKA PLAN AĞAÇ SİLUETİ (Giriş kapısı portalından görünen zengin ağaç kuşağı)
  drawPerimeterBackdropTrees(ctx, width);

  // 2. ARKA PLAN SINIR DUVARLARI (Selçuklu Taş Kemerli Surlar & Mazgallar)
  drawPerimeterWall(ctx, width);

  // 2b. YEŞİL ÇİM ALANLAR VE PARTERLER (Yürüme yollarının kenarlarında zengin peyzaj)
  drawCourtyardGrassParterres(ctx, width, height);

  // 3. MERKEZ SEKİZ KÖŞELİ YILDIZ MEYDANI ZEMİN MOZAİĞİ
  const centerX = width / 2; // 700
  const centerY = height / 2 + 30; // 480
  drawCentralStarPlazaGround(ctx, centerX, centerY);

  // 4. TAŞ DÖŞELİ BAĞLANTI YOLLARI (5 Ana Rota + Dış Kapı Çıkış Yolu)
  drawStonePathways(ctx, centerX, centerY);

  // 4a. KAMPÜS DIŞ KAPI ÇIKIŞ EŞİĞİ VE MASİF AHŞAP KANATLAR
  drawSouthEntrancePortal(ctx, centerX, 860, now);

  // 4b. YÖNLENDİRİCİ ZEMİN MOZAİK OKLARI (İngilizce Dünyasına yönlendiren taş kakmalar)
  drawPathwayGuidanceArrows(ctx);

  // 5. ZEMİN ÇİÇEK TARHLARI (Lavanta ve gül hatmi)
  drawFlowerPatch(ctx, 450, 680);
  drawFlowerPatch(ctx, 880, 680);
  drawFlowerPatch(ctx, 520, 480);
  drawFlowerPatch(ctx, 880, 480);
}

/**
 * Y-Sorting Derinlik Sıralı Varlıklar ve Öğrenci Karakteri Çizimi:
 * Tüm binalar, şadırvan haznesi ve fıskiye jeti, banklar, ağaçlar, yönlendirme totemi ve karakter
 * zemin temas noktasına (baseY) göre sıralanır; arkada kalan önce, önde kalan sonra çizilir.
 */
export function renderCourtyardEntities(
  ctx: CanvasRenderingContext2D,
  player: PlayerCharacter,
  width: number,
  height: number,
) {
  const isReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const now = isReducedMotion ? 0 : performance.now();

  const centerX = width / 2; // 700
  const centerY = height / 2 + 30; // 480

  const entities: DepthEntity[] = [
    // BİNALAR
    {
      id: 'bldg-library',
      baseY: 100 + 170, // 270
      draw: (c) => drawLibraryBuilding(c, 580, 100, 240, 170, now),
    },
    {
      id: 'bldg-discovery',
      baseY: 140 + 180, // 320
      draw: (c) => drawDiscoveryBuilding(c, 180, 140, 220, 180, now),
    },
    {
      id: 'bldg-english',
      baseY: 140 + 180, // 320
      draw: (c) => drawEnglishBuilding(c, 860, 140, 220, 180, now),
    },
    {
      id: 'pavilion-journey',
      baseY: 560 + 140, // 700
      draw: (c) => drawJourneyPavilion(c, 220, 560, 190, 140, now),
    },
    {
      id: 'kiosk-missions',
      baseY: 560 + 140, // 700
      draw: (c) => drawMissionsKiosk(c, 910, 560, 190, 140, now),
    },

    // MERKEZ MEYDAN YÖNLENDİRİCİ TOTEM (Çevresel Yönlendirme)
    {
      id: 'directional-signpost',
      baseY: 450,
      draw: (c) => drawDirectionalSignpost(c, 785, 435, now),
    },

    // MERKEZ ŞADIRVAN & FISKİYE (Merkez havuz mermer çanağı ve su jeti)
    {
      id: 'fountain',
      baseY: centerY + 10, // 490
      draw: (c) => drawCentralFountainEntity(c, centerX, centerY, now),
    },

    // BAHÇE BANKLARI
    {
      id: 'bench-left',
      baseY: 480 + 16, // 496
      draw: (c) => drawGardenBench(c, 420, 480),
    },
    {
      id: 'bench-right',
      baseY: 480 + 16, // 496
      draw: (c) => drawGardenBench(c, 980, 480),
    },

    // AĞAÇLAR (Geniş gölgeli ağaçlar ve zenginleştirilmiş peyzaj)
    {
      id: 'tree-nw-corner',
      baseY: 260,
      draw: (c) => drawLushTree(c, 80, 230, 0.9, now),
    },
    {
      id: 'tree-ne-corner',
      baseY: 260,
      draw: (c) => drawLushTree(c, 1320, 230, 0.9, now),
    },
    {
      id: 'tree-north-mid',
      baseY: 150,
      draw: (c) => drawLushTree(c, 480, 130, 0.85, now),
    },
    {
      id: 'tree-1',
      baseY: 380 + 34, // 414
      draw: (c) => drawLushTree(c, 120, 380, 1, now),
    },
    {
      id: 'tree-2',
      baseY: 520 + 34, // 554
      draw: (c) => drawLushTree(c, 120, 520, 0.95, now),
    },
    {
      id: 'tree-3',
      baseY: 290 + 34, // 324
      draw: (c) => drawLushTree(c, 500, 290, 0.9, now),
    },
    {
      id: 'tree-4',
      baseY: 380 + 34, // 414
      draw: (c) => drawLushTree(c, 1240, 380, 1, now),
    },
    {
      id: 'tree-5',
      baseY: 540 + 34, // 574
      draw: (c) => drawLushTree(c, 1240, 540, 0.95, now),
    },
    {
      id: 'tree-6',
      baseY: 760 + 34, // 794
      draw: (c) => drawLushTree(c, 700, 760, 1.05, now),
    },

    // SERVİ AĞAÇLARI (Selçuklu Avlu Konsept Görselindeki Zarif Serviler)
    {
      id: 'cypress-1',
      baseY: 270,
      draw: (c) => drawCypressTree(c, 380, 250, 1, now),
    },
    {
      id: 'cypress-2',
      baseY: 270,
      draw: (c) => drawCypressTree(c, 1040, 250, 1, now),
    },
    {
      id: 'cypress-mid-west',
      baseY: 460,
      draw: (c) => drawCypressTree(c, 240, 440, 0.95, now),
    },
    {
      id: 'cypress-mid-east',
      baseY: 460,
      draw: (c) => drawCypressTree(c, 1160, 440, 0.95, now),
    },
    {
      id: 'cypress-3',
      baseY: 720,
      draw: (c) => drawCypressTree(c, 160, 700, 1.1, now),
    },
    {
      id: 'cypress-4',
      baseY: 720,
      draw: (c) => drawCypressTree(c, 1260, 700, 1.1, now),
    },
    {
      id: 'cypress-gate-left',
      baseY: 790,
      draw: (c) => drawCypressTree(c, 580, 770, 1.05, now),
    },
    {
      id: 'cypress-gate-right',
      baseY: 790,
      draw: (c) => drawCypressTree(c, 820, 770, 1.05, now),
    },

    // ÖĞRENCİ KARAKTERİ (Y-Sorting ile derinlik sırasına dâhil edilir)
    {
      id: 'player-character',
      baseY: player.y + 18, // Ayak temas noktası
      draw: (c) => drawCharacter(c, player),
    },
  ];

  // Derinlik Sıralaması (Y-Sorting): baseY küçük olan (daha kuzeyde/arkada) önce çizilir
  entities.sort((a, b) => a.baseY - b.baseY);

  for (let i = 0; i < entities.length; i++) {
    entities[i].draw(ctx);
  }
}

/**
 * Ön Plan ve Sinematik Çerçeve Çizimi:
 * Üst köşelerden sarkan zengin yaprak saçağı ve yumuşak atmosferik güneş ışığı süzülmesi.
 */
export function renderCourtyardForeground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height?: number,
) {
  void height;
  // 1. Sol Üst Ön Plan Ağaç Dalı ve Yaprak Çerçevesi (Cinematic Foreground Branch)
  drawCanopyBranch(ctx, 0, 0, false);

  // 2. Sağ Üst Ön Plan Ağaç Dalı ve Yaprak Çerçevesi (Aynalanmış)
  drawCanopyBranch(ctx, width, 0, true);

  // 3. Atmosferik Sıcak Gün Işığı Demetleri (Cinematic Sunbeams)
  drawCinematicSunbeams(ctx, width);
}

/**
 * Geriye dönük uyumlu tam sahne çizicisi.
 */
export function renderCourtyardBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const isReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const now = isReducedMotion ? 0 : performance.now();

  // 1. Zemin ve Arka Plan
  renderCourtyardLayeredBackground(ctx, width, height);

  // 2. Binalar ve Peyzaj (Geleneksel tek katman çağrısı)
  const centerX = width / 2;
  const centerY = height / 2 + 30;

  drawCentralFountainEntity(ctx, centerX, centerY, now);
  drawEnglishBuilding(ctx, 860, 140, 220, 180, now);
  drawDiscoveryBuilding(ctx, 180, 140, 220, 180, now);
  drawLibraryBuilding(ctx, 580, 100, 240, 170, now);
  drawJourneyPavilion(ctx, 220, 560, 190, 140, now);
  drawMissionsKiosk(ctx, 910, 560, 190, 140, now);
  drawCourtyardLandscape(ctx, now);

  // 3. Ön Plan
  renderCourtyardForeground(ctx, width, height);
}

/**
 * Zemin: Sıcak taş plaka dokusu ve yumuşak vinyet / ışık süzülmesi.
 */
function drawCourtyardGround(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // Ana zemin degrade geçişi
  const groundGrad = ctx.createRadialGradient(
    width / 2,
    height / 2 + 30,
    120,
    width / 2,
    height / 2 + 30,
    width * 0.7,
  );
  groundGrad.addColorStop(0, '#f5edd9'); // Merkez aydınlık kumtaşı
  groundGrad.addColorStop(0.6, '#ede2cb'); // Yumuşak geçiş
  groundGrad.addColorStop(1, '#dfd2b5'); // Kenarlara doğru gölgeli taş

  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, 0, width, height);

  // Taş plaka çizgileri (Hafif, göz yormayan geometrik avlu ızgarası)
  ctx.strokeStyle = 'rgba(190, 176, 148, 0.35)';
  ctx.lineWidth = 1;

  for (let x = 40; x < width; x += 70) {
    ctx.beginPath();
    ctx.moveTo(x, 60);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 80; y < height; y += 70) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

/**
 * Arka Plan Sınır Duvarı: Selçuklu sur kemerleri, mazgal dişleri ve gölgeli derinlik.
 */
function drawPerimeterWall(ctx: CanvasRenderingContext2D, width: number) {
  ctx.save();

  // Sur ana gövdesi
  ctx.fillStyle = '#b7a88b';
  ctx.fillRect(0, 0, width, 58);

  // Sur alt gölgesi
  ctx.fillStyle = 'rgba(23, 43, 71, 0.15)';
  ctx.fillRect(0, 58, width, 8);

  // Mazgal kemerleri
  ctx.fillStyle = '#9e8d6e';
  ctx.strokeStyle = '#827153';
  ctx.lineWidth = 1.5;

  for (let x = 0; x < width; x += 44) {
    // Mazgal dişi
    ctx.fillRect(x + 6, 0, 32, 14);

    // Kemer oyuğu
    ctx.beginPath();
    ctx.arc(x + 22, 58, 16, Math.PI, 0);
    ctx.fill();
    ctx.stroke();

    // Kemer içi taş örgü çizgisi
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(x + 22, 58, 12, Math.PI, 0);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Merkez Sekiz Köşeli Selçuklu Yıldız Meydanı Zemin Mozaiği (Arka Plan Zemin Katmanı).
 */
function drawCentralStarPlazaGround(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
) {
  ctx.save();
  ctx.translate(cx, cy);

  // 1. Dış Mermer Halka ve Taş Bordür
  ctx.beginPath();
  ctx.arc(0, 0, 168, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(23, 43, 71, 0.08)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, 0, 162, 0, Math.PI * 2);
  ctx.fillStyle = '#faf5e8';
  ctx.fill();
  ctx.strokeStyle = '#cbb898';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Dış bordür geometrik noktaları
  ctx.fillStyle = '#0e768a';
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
    const bx = Math.cos(a) * 153;
    const by = Math.sin(a) * 153;
    ctx.beginPath();
    ctx.arc(bx, by, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Selçuklu Sekiz Köşeli Yıldız Taş Deseni (İki kare 45 derece dönük)
  ctx.fillStyle = '#eae0cb';
  ctx.strokeStyle = '#bda888';
  ctx.lineWidth = 2;

  for (let i = 0; i < 2; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 4);
    ctx.fillRect(-88, -88, 176, 176);
    ctx.strokeRect(-88, -88, 176, 176);
    ctx.restore();
  }

  // Yıldız İç Kademesi (Turkuaz Taş Mozaik)
  ctx.fillStyle = '#e2f0f2';
  for (let i = 0; i < 2; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 4);
    ctx.fillRect(-62, -62, 124, 124);
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Merkez Mermer Şadırvan ve Fıskiye Varlığı (Y-Sorting ile derinlik sıralı).
 */
function drawCentralFountainEntity(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  now: number,
) {
  const asset = getFountainAsset();
  if (asset) {
    ctx.save();
    // 1. Zemin Temas Gölgesi
    ctx.fillStyle = 'rgba(23, 43, 71, 0.22)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 8, 120, 48, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Yüksek Kaliteli 2,5B Görsel Varlık (drawImage)
    const renderW = 250;
    const renderH = 179;
    const renderX = cx - renderW / 2;
    const renderY = cy - renderH / 2 - 10;

    ctx.drawImage(asset, renderX, renderY, renderW, renderH);

    // 3. Su Parıltısı ve Kristal Su Jeti Animasyonu
    const wave1 = Math.sin(now / 480) * 2;
    const wave2 = Math.cos(now / 360) * 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(cx, cy - 8, 22 + wave1, 0.3, Math.PI * 1.2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy - 8, 14 + wave2, Math.PI * 0.8, Math.PI * 1.9);
    ctx.stroke();

    const sprayPulse = Math.sin(now / 300) * 2;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 42 + sprayPulse * 0.5, 3.5, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath();
    ctx.arc(cx - 4, cy - 46 + sprayPulse, 1.2, 0, Math.PI * 2);
    ctx.arc(cx + 4, cy - 45 - sprayPulse, 1.2, 0, Math.PI * 2);
    ctx.arc(cx, cy - 54, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    return;
  }

  ctx.save();
  ctx.translate(cx, cy);

  // 3. Merkez Mermer Şadırvan / Havuz Kaidesi
  // Havuz dış gölgesi
  ctx.beginPath();
  ctx.arc(0, 3, 49, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(23, 43, 71, 0.18)';
  ctx.fill();

  // Havuz mermer haznesi
  ctx.beginPath();
  ctx.arc(0, 0, 48, 0, Math.PI * 2);
  const poolRimGrad = ctx.createLinearGradient(-48, -48, 48, 48);
  poolRimGrad.addColorStop(0, '#ffffff');
  poolRimGrad.addColorStop(1, '#c5b597');
  ctx.fillStyle = poolRimGrad;
  ctx.fill();
  ctx.strokeStyle = '#0e768a';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Havuz İçi Berrak Su (Turkuaz derinlik)
  ctx.beginPath();
  ctx.arc(0, 0, 38, 0, Math.PI * 2);
  const waterGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 38);
  waterGrad.addColorStop(0, '#4fc3d9');
  waterGrad.addColorStop(0.7, '#1b8b9f');
  waterGrad.addColorStop(1, '#0c5c6b');
  ctx.fillStyle = waterGrad;
  ctx.fill();

  // Su Parıltısı ve Dalgalanma Animasyonu (Water Shimmer)
  const wave1 = Math.sin(now / 480) * 2;
  const wave2 = Math.cos(now / 360) * 1.5;

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, 0, 24 + wave1, 0.3, Math.PI * 1.2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, 15 + wave2, Math.PI * 0.8, Math.PI * 1.9);
  ctx.stroke();

  // Merkez Fıskiye Mermer Göbeği ve Işıltı
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#0e768a';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Yükselen Su Jeti ve Parıltı (Konsept görselindeki zarif fıskiye su spreyi)
  ctx.save();
  const sprayPulse = Math.sin(now / 300) * 2;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  ctx.ellipse(0, -14 + sprayPulse * 0.5, 3.5, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  // Kristal su damlaları
  ctx.fillStyle = '#e0f2fe';
  ctx.beginPath();
  ctx.arc(-4, -18 + sprayPulse, 1.2, 0, Math.PI * 2);
  ctx.arc(4, -17 - sprayPulse, 1.2, 0, Math.PI * 2);
  ctx.arc(0, -26, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

/**
 * Geriye dönük uyumluluk için birleşik meydan çizimi.
 */
export function drawCentralStarPlaza(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  now: number,
) {
  drawCentralStarPlazaGround(ctx, cx, cy);
  drawCentralFountainEntity(ctx, cx, cy, now);
}

/**
 * Ana Yürüyüş Yolları: Dokulu kesme taş döşeme, kumtaşı bordürler ve güney dış kapı rotası.
 */
function drawStonePathways(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const paths = [
    { x: 300, y: 310 }, // Gezi ve Keşif
    { x: 700, y: 270 }, // Kitap Dünyası
    { x: 960, y: 340 }, // İngilizce Dünyası
    { x: 340, y: 640 }, // Yolculuğum
    { x: 980, y: 640 }, // Görev Panosu
    { x: 700, y: 860 }, // Kampüs Dış Kapı Çıkışı
  ];

  ctx.save();
  ctx.lineCap = 'round';

  // 1. Yol Alt Tabanı (Gölge & Kenar Bordürü)
  ctx.strokeStyle = '#c7b494';
  ctx.lineWidth = 46;
  for (const p of paths) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  // 2. Yol Üst Taş Kaplaması (Sıcak Kumtaşı)
  ctx.strokeStyle = '#fbf2df';
  ctx.lineWidth = 38;
  for (const p of paths) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  // 3. Yol Yan Bordür Çizgileri
  ctx.strokeStyle = '#bca888';
  ctx.lineWidth = 2;
  for (const p of paths) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Kampüs Güney Giriş / Çıkış Kapısı Eşiği (700, 860).
 * Avludan dış kapıya dönüşü görsel ve işlevsel kılan Selçuklu taş kemer eşiği.
 */
function drawSouthEntrancePortal(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  now: number,
) {
  ctx.save();

  // 1. Zemin Temas ve Eşik Gölgesi
  ctx.fillStyle = 'rgba(23, 43, 71, 0.3)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 12, 110, 24, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Mermer Taş Eşik (Selçuklu Kesme Taş Kaide)
  ctx.fillStyle = '#ede3cf';
  ctx.strokeStyle = '#bda888';
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(cx - 90, cy - 8, 180, 28, 6);
  } else {
    ctx.rect(cx - 90, cy - 8, 180, 28);
  }
  ctx.fill();
  ctx.stroke();

  // Turkuaz Çini Kakma Eşik Şeridi
  ctx.fillStyle = '#0e768a';
  ctx.fillRect(cx - 75, cy - 2, 150, 6);

  // 3. Masif Ahşap Selçuklu Kapı Kanatları (İki yana açık kanatlar)
  // Sol Kapı Kanadı
  ctx.save();
  ctx.translate(cx - 85, cy - 10);
  ctx.rotate(-0.15);
  ctx.fillStyle = '#4a3319';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(0, -60, 24, 66, [4, 0, 0, 4]);
  } else {
    ctx.rect(0, -60, 24, 66);
  }
  ctx.fill();
  ctx.strokeStyle = '#d8972b';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Pirinç kabara çivileri
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(12, -45, 2, 0, Math.PI * 2);
  ctx.arc(12, -25, 2, 0, Math.PI * 2);
  ctx.arc(12, -5, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Sağ Kapı Kanadı
  ctx.save();
  ctx.translate(cx + 61, cy - 10);
  ctx.rotate(0.15);
  ctx.fillStyle = '#4a3319';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(0, -60, 24, 66, [0, 4, 4, 0]);
  } else {
    ctx.rect(0, -60, 24, 66);
  }
  ctx.fill();
  ctx.strokeStyle = '#d8972b';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Pirinç çiviler
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(12, -45, 2, 0, Math.PI * 2);
  ctx.arc(12, -25, 2, 0, Math.PI * 2);
  ctx.arc(12, -5, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 4. Eşik Etkileşim Işıltısı (Öğrenci yaklaşırken parıldayan dış kapı aurası)
  const pulse = Math.sin(now / 300) * 0.3 + 0.7;
  ctx.strokeStyle = `rgba(216, 151, 43, ${pulse})`;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.ellipse(cx, cy + 4, 75, 18, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // 5. Tabelacık / Rozet: KAMPÜSTEN ÇIK
  ctx.fillStyle = '#172b47';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(cx - 55, cy - 32, 110, 20, 4);
  } else {
    ctx.rect(cx - 55, cy - 32, 110, 20);
  }
  ctx.fill();
  ctx.strokeStyle = '#d8972b';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⇩ KAMPÜSTEN ÇIK', cx, cy - 22);

  // Yan Fenerler (Selçuklu Kandilleri)
  drawLantern(ctx, cx - 88, cy - 28, now);
  drawLantern(ctx, cx + 88, cy - 28, now);

  ctx.restore();
}

/**
 * Giriş kapısı portalından görünen ağaç kuşağını sur arkasına uzatan zengin ağaç atmosferi.
 */
function drawPerimeterBackdropTrees(ctx: CanvasRenderingContext2D, width: number) {
  ctx.save();
  // Gökyüzü / horizon hafif degrade
  const horizonGrad = ctx.createLinearGradient(0, 0, 0, 70);
  horizonGrad.addColorStop(0, '#7dd3fc');
  horizonGrad.addColorStop(1, '#bae6fd');
  ctx.fillStyle = horizonGrad;
  ctx.fillRect(0, 0, width, 55);

  // Yoğun servi ve çam tepe taçları
  const treeTops = [
    { x: 30, r: 28, color: '#14532d' },
    { x: 75, r: 24, color: '#166534' },
    { x: 120, r: 32, color: '#15803d' },
    { x: 170, r: 26, color: '#14532d' },
    { x: 230, r: 30, color: '#166534' },
    { x: 340, r: 25, color: '#15803d' },
    { x: 420, r: 28, color: '#166534' },
    { x: 510, r: 34, color: '#14532d' },
    { x: 800, r: 30, color: '#166534' },
    { x: 880, r: 26, color: '#15803d' },
    { x: 1010, r: 32, color: '#14532d' },
    { x: 1100, r: 28, color: '#166534' },
    { x: 1180, r: 34, color: '#15803d' },
    { x: 1260, r: 26, color: '#166534' },
    { x: 1330, r: 30, color: '#14532d' },
    { x: 1380, r: 28, color: '#15803d' },
  ];

  for (const t of treeTops) {
    ctx.fillStyle = t.color;
    ctx.beginPath();
    ctx.arc(t.x, 38, t.r, 0, Math.PI * 2);
    ctx.fill();

    // Üst aydınlık yaprak vurgusu
    ctx.fillStyle = 'rgba(187, 247, 208, 0.35)';
    ctx.beginPath();
    ctx.arc(t.x - 4, 38 - t.r * 0.4, t.r * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sivri servi tepeleri
  const cypresses = [50, 150, 260, 460, 840, 1060, 1220, 1350];
  for (const cx of cypresses) {
    ctx.fillStyle = '#0f3822';
    ctx.beginPath();
    ctx.moveTo(cx, 8);
    ctx.lineTo(cx + 8, 48);
    ctx.lineTo(cx - 8, 48);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Yürüme yollarının kenarlarında zengin yeşil çim alanlar ve parterler (Section 12).
 */
function drawCourtyardGrassParterres(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  void width;
  void height;
  ctx.save();

  // Parter bölgeleri tanımları
  const parterres = [
    // 1. Sol Üst Parter (Gezi ve Keşif binası çevresi & kütüphane arası)
    { x: 60, y: 340, w: 340, h: 90, r: 16 },
    // 2. Sağ Üst Parter (İngilizce binası altı & doğu sur boyu)
    { x: 990, y: 340, w: 350, h: 90, r: 16 },
    // 3. Sol Alt Parter (Yolculuğum köşkü önü & batı bahçe)
    { x: 90, y: 530, w: 350, h: 180, r: 18 },
    // 4. Sağ Alt Parter (Görev panosu önü & doğu bahçe)
    { x: 960, y: 530, w: 350, h: 180, r: 18 },
    // 5. Orta-Sol Ada Parteri (Gezi rotası ile merkez meydan arası)
    { x: 440, y: 360, w: 140, h: 80, r: 14 },
    // 6. Orta-Sağ Ada Parteri (İngilizce rotası ile merkez meydan arası)
    { x: 820, y: 360, w: 140, h: 80, r: 14 },
    // 7. Güney Giriş Parter Adaları (Giriş aksının sağı ve solu)
    { x: 490, y: 670, w: 160, h: 130, r: 16 },
    { x: 750, y: 670, w: 160, h: 130, r: 16 },
  ];

  for (const p of parterres) {
    // A. Zemin Çöküntü Gölgesi
    ctx.fillStyle = 'rgba(23, 43, 71, 0.12)';
    ctx.beginPath();
    ctx.roundRect(p.x + 3, p.y + 4, p.w, p.h, p.r);
    ctx.fill();

    // B. Taş Bordür Çerçevesi (Kumtaşı taş oyma kenarlık)
    ctx.fillStyle = '#ccb997';
    ctx.beginPath();
    ctx.roundRect(p.x, p.y, p.w, p.h, p.r);
    ctx.fill();

    // C. Yeşil Çim Dolgusu (Çok katmanlı bahçe çimi)
    const grassGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
    grassGrad.addColorStop(0, '#568b36'); // Güneş alan aydınlık taze çim
    grassGrad.addColorStop(0.6, '#3e6a24'); // Doğal adaçayı/zeytin yeşili
    grassGrad.addColorStop(1, '#2c4d19'); // Gölgede kalan koyu çim dip tonu

    ctx.fillStyle = grassGrad;
    ctx.beginPath();
    ctx.roundRect(p.x + 4, p.y + 4, p.w - 8, p.h - 8, Math.max(2, p.r - 4));
    ctx.fill();

    // D. Çim Doku Detayları ve Açık Ton Vurgusu
    ctx.strokeStyle = 'rgba(167, 243, 208, 0.22)';
    ctx.lineWidth = 1;
    for (let gx = p.x + 16; gx < p.x + p.w - 16; gx += 28) {
      for (let gy = p.y + 14; gy < p.y + p.h - 14; gy += 24) {
        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.lineTo(gx - 2, gy - 5);
        ctx.moveTo(gx + 4, gy);
        ctx.lineTo(gx + 6, gy - 6);
        ctx.stroke();
      }
    }
  }

  ctx.restore();
}

/**
 * Yollarda Yönlendirici Taş / Zemin Desenleri ve Oklar (Section 10).
 * Merkez Selçuklu yıldız meydanından aktif olan İngilizce Dünyasına uzanan kakma oklar.
 */
function drawPathwayGuidanceArrows(ctx: CanvasRenderingContext2D) {
  ctx.save();

  // Merkez meydan (700, 480) ile İngilizce Dünyası (960, 340) ve Güney Dış Kapı (700, 860) arasındaki yol oku noktaları
  const arrowPoints = [
    { x: 775, y: 440, angle: -0.49 },
    { x: 840, y: 405, angle: -0.49 },
    { x: 905, y: 370, angle: -0.49 },
    { x: 700, y: 660, angle: Math.PI / 2 },
    { x: 700, y: 770, angle: Math.PI / 2 },
  ];

  for (const pt of arrowPoints) {
    ctx.save();
    ctx.translate(pt.x, pt.y);
    ctx.rotate(pt.angle);

    // 1. Taş Oyuğu Gölgesi
    ctx.fillStyle = 'rgba(23, 43, 71, 0.25)';
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(-8, -10);
    ctx.lineTo(-4, 0);
    ctx.lineTo(-8, 10);
    ctx.closePath();
    ctx.fill();

    // 2. Turkuaz Çini Kakma Ok
    ctx.fillStyle = '#0e768a';
    ctx.strokeStyle = '#d8972b';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(-10, -9);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-10, 9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3. Ortada Selçuklu Yıldız Kakması
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  ctx.restore();
}

/**
 * Selçuklu Mimari Bina İsim Tabelası ve Durum Rozeti (AÇIK / YAKINDA).
 * Çevresel yönlendirme gereksinimini karşılar.
 */
function drawBuildingPlaque(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  y: number,
  title: string,
  status: 'AÇIK' | 'YAKINDA',
  now: number = 0,
) {
  ctx.save();
  const plaqueW = Math.max(140, title.length * 8.5 + 40);
  const plaqueH = 32;
  const plaqueX = centerX - plaqueW / 2;

  // 1. Zemin gölgesi
  ctx.fillStyle = 'rgba(23, 43, 71, 0.35)';
  ctx.beginPath();
  ctx.roundRect(plaqueX + 2, y + 2, plaqueW, plaqueH, 6);
  ctx.fill();

  // 2. Ana Tabela Gövdesi (Selçuklu Koyu Lacivert / Mermer Dokusu)
  ctx.fillStyle = '#0f1d30';
  ctx.beginPath();
  ctx.roundRect(plaqueX, y, plaqueW, plaqueH, 6);
  ctx.fill();

  // 3. Çerçeve ve Geometrik Bordür
  const isAvailable = status === 'AÇIK';
  ctx.strokeStyle = isAvailable ? '#22c55e' : '#d8972b';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // 4. Bina İsmi
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, centerX, y + 11);

  // 5. Durum Rozeti (Pill Badge)
  const badgeW = isAvailable ? 56 : 58;
  const badgeH = 14;
  const badgeX = centerX - badgeW / 2;
  const badgeY = y + 19;

  ctx.fillStyle = isAvailable ? 'rgba(34, 197, 94, 0.9)' : 'rgba(216, 151, 43, 0.85)';
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4);
  ctx.fill();

  // Canlı nabız ışığı (Açık olan bina için davetkâr parıltı)
  if (isAvailable) {
    const pulse = Math.sin(now / 250) * 0.3 + 0.7;
    ctx.strokeStyle = `rgba(187, 247, 208, ${pulse})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  ctx.fillStyle = isAvailable ? '#052e16' : '#1e1405';
  ctx.font = 'bold 9px sans-serif';
  ctx.fillText(isAvailable ? '● AÇIK' : 'YAKINDA', centerX, badgeY + 7);

  ctx.restore();
}

/**
 * Merkez Meydan Yönlendirici Totem / Tabela (Section 10).
 * Çevresel yönlendirme sağlar: İngilizce Dünyası'nı [AÇIK] olarak vurgular, diğerlerini [YAKINDA] belirtir.
 */
function drawDirectionalSignpost(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  now: number,
) {
  ctx.save();

  // 1. Zemin Temas Gölgesi
  ctx.fillStyle = 'rgba(23, 43, 71, 0.28)';
  ctx.beginPath();
  ctx.ellipse(x, y + 14, 22, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Selçuklu Mermer Kaide (Sekizgen Taş Taban)
  ctx.fillStyle = '#eae0cb';
  ctx.strokeStyle = '#bfa888';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x - 14, y + 2, 28, 14, 3);
  ctx.fill();
  ctx.stroke();

  // 3. Oyma Ahşap Direk (Sedir Ağacı)
  ctx.fillStyle = '#543b23';
  ctx.fillRect(x - 4, y - 76, 8, 80);
  ctx.fillStyle = '#7a5735';
  ctx.fillRect(x - 2, y - 76, 4, 80);

  // 4. Tepelik (Bakır / Pirinç Alem)
  ctx.fillStyle = '#d8972b';
  ctx.beginPath();
  ctx.arc(x, y - 80, 5, 0, Math.PI * 2);
  ctx.fill();

  // 5. Yön Levhası 1: İNGİLİZCE DÜNYASI [AÇIK] (Sağa / Kuzeydoğuya bakan tabela - AKTİF)
  const pulse = Math.sin(now / 260) * 0.25 + 0.75;
  ctx.save();
  ctx.translate(x + 2, y - 68);

  // Levha gölgesi
  ctx.fillStyle = 'rgba(23, 43, 71, 0.3)';
  ctx.beginPath();
  ctx.moveTo(2, 2);
  ctx.lineTo(132, 2);
  ctx.lineTo(142, 12);
  ctx.lineTo(132, 22);
  ctx.lineTo(2, 22);
  ctx.closePath();
  ctx.fill();

  // Levha ana gövdesi (Turkuaz & Zümrüt yeşili degrade)
  const signGrad = ctx.createLinearGradient(0, 0, 140, 20);
  signGrad.addColorStop(0, '#0e768a');
  signGrad.addColorStop(1, '#059669');
  ctx.fillStyle = signGrad;
  ctx.strokeStyle = `rgba(253, 224, 71, ${pulse})`;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(130, 0);
  ctx.lineTo(140, 10);
  ctx.lineTo(130, 20);
  ctx.lineTo(0, 20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Yazı ve Rozet
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('İngilizce Dünyası ➜', 8, 10);

  // Açık rozeti
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.roundRect(100, 3, 26, 14, 3);
  ctx.fill();
  ctx.fillStyle = '#052e16';
  ctx.font = 'bold 8px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('AÇIK', 113, 10);
  ctx.restore();

  // 6. Yön Levhası 2: Gezi ve Keşif [Yakında] (Sola bakan tabela)
  ctx.save();
  ctx.translate(x - 2, y - 46);

  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.4;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-120, 0);
  ctx.lineTo(-130, 9);
  ctx.lineTo(-120, 18);
  ctx.lineTo(0, 18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#cbd5e1';
  ctx.font = 'bold 8px sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText('⇦ Gezi ve Keşif', -8, 9);

  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.roundRect(-116, 2, 38, 14, 3);
  ctx.fill();
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 7px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('YAKINDA', -97, 9);
  ctx.restore();

  // 7. Yön Levhası 3: Kitap Dünyası [Yakında] (Kuzeye bakan levha)
  ctx.save();
  ctx.translate(x + 2, y - 26);

  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.4;

  ctx.beginPath();
  ctx.roundRect(0, 0, 106, 17, 3);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#cbd5e1';
  ctx.font = 'bold 8px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('⇧ Kitap Dünyası', 6, 8.5);

  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.roundRect(68, 2, 34, 13, 3);
  ctx.fill();
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 7px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('YAKINDA', 85, 8.5);
  ctx.restore();

  // 8. Yön Levhası 4: Dış Kapı [Çıkış] (Güneye bakan levha)
  ctx.save();
  ctx.translate(x - 2, y - 6);

  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.4;

  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(-92, 0, 92, 16, 3);
  } else {
    ctx.rect(-92, 0, 92, 16);
  }
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 8px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⇩ Dış Kapı (Çıkış)', -46, 8);
  ctx.restore();

  ctx.restore();
}

/**
 * A. İngilizce Dünyası Binası (860, 140, 220, 180)
 * 3D animasyon filmi estetiğinde bağımsız görsel varlık (building_english.png) ve drawImage ile çizilir.
 * Varlık yüklenene kadar veya test ortamlarında geriye dönük vektörel çizim yedeği devreye girer.
 */
function drawEnglishBuilding(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  now: number,
) {
  const asset = getEnglishBuildingAsset();

  if (asset) {
    ctx.save();

    // 1. Zemin Derinlik ve Temas Gölgesi
    ctx.fillStyle = 'rgba(23, 43, 71, 0.28)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 8, w / 2 + 18, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Yüksek Kaliteli 2,5B Görsel Varlık (drawImage)
    // Boyutlandırma ve hizalama: Zemin basamağı y + h (320px) ile hizalanır, kubbe yukarı uzanır.
    const renderW = 268;
    const renderH = 292;
    const renderX = x + (w - renderW) / 2; // 836 (Merkez: 970)
    const renderY = y + h - renderH + 12; // 40

    ctx.drawImage(asset, renderX, renderY, renderW, renderH);

    // 3. Etkileşimli Taç Kapı Işıltısı (Öğrenci yaklaşınca belirginleşen davetkâr portal aurası)
    const portalCenterX = x + w / 2; // 970
    const doorBottomY = y + h - 18; // 302
    const pulse = Math.sin(now / 320) * 0.35 + 0.65;

    ctx.save();
    ctx.strokeStyle = `rgba(36, 154, 176, ${pulse})`;
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.roundRect(portalCenterX - 28, doorBottomY - 70, 56, 70, [18, 18, 0, 0]);
    ctx.stroke();
    ctx.restore();

    // 4. Asılı Selçuklu Kandilinin Sıcak Işık Halesi
    const lanternGlow = Math.sin(now / 280) * 0.15 + 0.85;
    ctx.fillStyle = `rgba(254, 240, 138, ${0.35 * lanternGlow})`;
    ctx.beginPath();
    ctx.arc(portalCenterX, doorBottomY - 50, 24, 0, Math.PI * 2);
    ctx.fill();

    // 5. Giriş Basamağı Mermer Vurgusu
    ctx.fillStyle = 'rgba(36, 154, 176, 0.35)';
    ctx.beginPath();
    ctx.roundRect(portalCenterX - 45, y + h - 2, 90, 6, 2);
    ctx.fill();

    // 6. Mimari Bina İsim Tabelası ve Durum Rozeti [AÇIK]
    drawBuildingPlaque(ctx, portalCenterX, y + 26, 'İNGİLİZCE DÜNYASI', 'AÇIK', now);

    ctx.restore();
    return;
  }

  ctx.save();

  // 1. Zemin Derinlik Gölgesi
  ctx.fillStyle = 'rgba(23, 43, 71, 0.22)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2 + 12, y + h + 10, w / 2 + 18, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Ana Taş Gövde (Kesme taş bloklar)
  ctx.fillStyle = '#f6f0e3';
  ctx.strokeStyle = '#ccb997';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x, y + 42, w, h - 42, 8);
  ctx.fill();
  ctx.stroke();

  // Cephe taş derz çizgileri
  ctx.strokeStyle = 'rgba(204, 185, 151, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y + 80);
  ctx.lineTo(x + w, y + 80);
  ctx.moveTo(x, y + 120);
  ctx.lineTo(x + w, y + 120);
  ctx.stroke();

  // 3. Selçuklu Turkuaz Çini Saçak ve Bordür
  ctx.fillStyle = '#0e768a';
  ctx.beginPath();
  ctx.roundRect(x - 8, y + 32, w + 16, 20, 5);
  ctx.fill();

  // Çini üzerine altın sarısı geometrik friz
  ctx.strokeStyle = '#d8972b';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 6, y + 34, w + 12, 16);

  // 4. Taç Kümbet / Kubbe (Turkuaz kabartmalı dilimli kubbe)
  ctx.fillStyle = '#0a5969';
  ctx.beginPath();
  ctx.arc(x + w / 2, y + 32, 46, Math.PI, 0);
  ctx.fill();

  ctx.fillStyle = '#1791a8';
  ctx.beginPath();
  ctx.arc(x + w / 2 - 4, y + 32, 42, Math.PI, 0);
  ctx.fill();

  // Kubbe alemi (Hilal ve yıldız tepeliği)
  ctx.fillStyle = '#d8972b';
  ctx.fillRect(x + w / 2 - 2, y - 24, 4, 12);
  ctx.beginPath();
  ctx.arc(x + w / 2, y - 26, 5, 0, Math.PI * 2);
  ctx.fill();

  // 5. Selçuklu Mukarnaslı Anıtsal Taç Kapı (Portal)
  const portalW = 74;
  const portalH = 92;
  const portalX = x + (w - portalW) / 2;
  const portalY = y + h - portalH;

  // Taç kapı dış çerçeve bloğu
  ctx.fillStyle = '#eae0cb';
  ctx.beginPath();
  ctx.roundRect(portalX - 10, portalY - 18, portalW + 20, portalH + 18, 6);
  ctx.fill();
  ctx.strokeStyle = '#bfa888';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Sivri Kemer (Mukarnas kemer formu)
  ctx.fillStyle = '#0e768a';
  ctx.beginPath();
  ctx.moveTo(portalX, portalY + 28);
  ctx.quadraticCurveTo(portalX + portalW / 2, portalY - 12, portalX + portalW, portalY + 28);
  ctx.lineTo(portalX + portalW, portalY + portalH);
  ctx.lineTo(portalX, portalY + portalH);
  ctx.closePath();
  ctx.fill();

  // Kapı İçi Giriş Boşluğu (Karanlık derinlik)
  ctx.fillStyle = '#0f1d30';
  ctx.beginPath();
  ctx.roundRect(portalX + 6, portalY + 12, portalW - 12, portalH - 12, [18, 18, 0, 0]);
  ctx.fill();

  // Ahşap Selçuklu kapı kanatları
  ctx.fillStyle = '#5c4532';
  ctx.fillRect(portalX + 9, portalY + 28, portalW / 2 - 10, portalH - 28);
  ctx.fillRect(portalX + portalW / 2 + 1, portalY + 28, portalW / 2 - 10, portalH - 28);

  // Kapı tokmakları
  ctx.fillStyle = '#d8972b';
  ctx.beginPath();
  ctx.arc(portalX + portalW / 2 - 5, portalY + 54, 2.8, 0, Math.PI * 2);
  ctx.arc(portalX + portalW / 2 + 5, portalY + 54, 2.8, 0, Math.PI * 2);
  ctx.fill();

  // 6. Etkileşimli Kapı Işıltısı (Pulsing Entry Aura)
  const pulse = Math.sin(now / 320) * 0.35 + 0.65;
  ctx.save();
  ctx.strokeStyle = `rgba(36, 154, 176, ${pulse})`;
  ctx.lineWidth = 3;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.roundRect(portalX + 4, portalY + 10, portalW - 8, portalH - 10, [18, 18, 0, 0]);
  ctx.stroke();
  ctx.restore();

  // Giriş Mermer Basamağı ve Paspassı
  ctx.fillStyle = '#249ab0';
  ctx.beginPath();
  ctx.roundRect(portalX - 4, portalY + portalH - 4, portalW + 8, 8, 3);
  ctx.fill();

  // Giriş Yan Fenerleri (Selçuklu Kandilleri)
  drawLantern(ctx, portalX - 6, portalY + 22, now);
  drawLantern(ctx, portalX + portalW + 6, portalY + 22, now);

  // 7. Mimari Bina İsim Tabelası ve Durum Rozeti [AÇIK]
  drawBuildingPlaque(ctx, x + w / 2, y + 54, 'İNGİLİZCE DÜNYASI', 'AÇIK', now);

  ctx.restore();
}

/**
 * B. Gezi ve Keşif Binası (180, 140, 220, 180)
 * Pişmiş toprak rengi tuğla kubbeler, kervansaray taş kapısı ve Selçuklu kemerleri.
 */
function drawDiscoveryBuilding(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  now: number = 0,
) {
  const asset = getDiscoveryBuildingAsset();
  if (asset) {
    ctx.save();
    // 1. Zemin Temas ve Derinlik Gölgesi
    ctx.fillStyle = 'rgba(23, 43, 71, 0.28)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 8, w / 2 + 18, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Yüksek Kaliteli 2,5B Görsel Varlık (drawImage)
    const renderW = 284;
    const renderH = 232;
    const renderX = x + (w - renderW) / 2;
    const renderY = y + h - renderH + 12;

    ctx.drawImage(asset, renderX, renderY, renderW, renderH);

    // 3. Etkileşimli Kapı Işıltısı (Öğrenci yaklaşınca parıldayan aura)
    const portalCenterX = x + w / 2;
    const doorBottomY = y + h - 18;
    const pulse = Math.sin(now / 320) * 0.35 + 0.65;
    ctx.save();
    ctx.strokeStyle = `rgba(186, 87, 52, ${pulse})`;
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.roundRect(portalCenterX - 28, doorBottomY - 65, 56, 65, [16, 16, 0, 0]);
    ctx.stroke();
    ctx.restore();

    // 4. Selçuklu Mimari Bina İsim Tabelası ve Durum Rozeti [YAKINDA]
    drawBuildingPlaque(ctx, portalCenterX, y + 26, 'GEZİ VE KEŞİF', 'YAKINDA', now);

    ctx.restore();
    return;
  }

  ctx.save();

  // Zemin gölgesi
  ctx.fillStyle = 'rgba(23, 43, 71, 0.2)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2 + 10, y + h + 10, w / 2 + 16, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Gövde
  ctx.fillStyle = '#f5ede0';
  ctx.strokeStyle = '#cbb898';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x, y + 42, w, h - 42, 8);
  ctx.fill();
  ctx.stroke();

  // Pişmiş Toprak (Terracotta) Kubbe
  ctx.fillStyle = '#8f3b1e';
  ctx.beginPath();
  ctx.arc(x + w / 2, y + 36, 44, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#ba5734';
  ctx.beginPath();
  ctx.arc(x + w / 2 - 3, y + 36, 40, Math.PI, 0);
  ctx.fill();

  // Çatı Saçağı
  ctx.fillStyle = '#ba5734';
  ctx.beginPath();
  ctx.roundRect(x - 6, y + 32, w + 12, 18, 4);
  ctx.fill();

  // Taç Kapı
  const portalW = 66;
  const portalH = 82;
  const portalX = x + (w - portalW) / 2;
  const portalY = y + h - portalH;

  ctx.fillStyle = '#e5dbca';
  ctx.beginPath();
  ctx.roundRect(portalX - 6, portalY - 12, portalW + 12, portalH + 12, 5);
  ctx.fill();
  ctx.strokeStyle = '#bfa888';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Kapı Boşluğu
  ctx.fillStyle = '#172b47';
  ctx.beginPath();
  ctx.roundRect(portalX, portalY, portalW, portalH, [16, 16, 0, 0]);
  ctx.fill();

  // Tabela ve Durum Rozeti [YAKINDA]
  drawBuildingPlaque(ctx, x + w / 2, y + 54, 'GEZİ VE KEŞİF', 'YAKINDA', now);

  ctx.restore();
}

/**
 * C. Kitap ve Hikâye Dünyası Binası (580, 100, 240, 170)
 * Altın kumtaşı kümbet, sekizgen kasnak ve Selçuklu kütüphane silüeti.
 */
function drawLibraryBuilding(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  now: number = 0,
) {
  const asset = getLibraryBuildingAsset();
  if (asset) {
    ctx.save();
    // 1. Zemin Temas ve Derinlik Gölgesi
    ctx.fillStyle = 'rgba(23, 43, 71, 0.28)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 8, w / 2 + 18, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Yüksek Kaliteli 2,5B Görsel Varlık (drawImage)
    const renderW = 276;
    const renderH = 280;
    const renderX = x + (w - renderW) / 2;
    const renderY = y + h - renderH + 12;

    ctx.drawImage(asset, renderX, renderY, renderW, renderH);

    // 3. Etkileşimli Kapı Işıltısı (Öğrenci yaklaşınca parıldayan aura)
    const portalCenterX = x + w / 2;
    const doorBottomY = y + h - 18;
    const pulse = Math.sin(now / 320) * 0.35 + 0.65;
    ctx.save();
    ctx.strokeStyle = `rgba(166, 100, 20, ${pulse})`;
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.roundRect(portalCenterX - 28, doorBottomY - 65, 56, 65, [16, 16, 0, 0]);
    ctx.stroke();
    ctx.restore();

    // 4. Selçuklu Mimari Bina İsim Tabelası ve Durum Rozeti [YAKINDA]
    drawBuildingPlaque(ctx, portalCenterX, y + 24, 'KİTAP VE HİKÂYE DÜNYASI', 'YAKINDA', now);

    ctx.restore();
    return;
  }

  ctx.save();

  // Gölge
  ctx.fillStyle = 'rgba(23, 43, 71, 0.2)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2 + 10, y + h + 8, w / 2 + 18, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  // Gövde
  ctx.fillStyle = '#f8f3e8';
  ctx.strokeStyle = '#ccb997';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x, y + 42, w, h - 42, 8);
  ctx.fill();
  ctx.stroke();

  // Altın Kumtaşı Kümbet Külahı (Piramidal Selçuklu Çatısı)
  ctx.fillStyle = '#7a4e10';
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y - 18);
  ctx.lineTo(x + w / 2 + 55, y + 36);
  ctx.lineTo(x + w / 2 - 55, y + 36);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#b88126';
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y - 18);
  ctx.lineTo(x + w / 2 + 48, y + 36);
  ctx.lineTo(x + w / 2 - 48, y + 36);
  ctx.closePath();
  ctx.fill();

  // Saçak
  ctx.fillStyle = '#a66414';
  ctx.beginPath();
  ctx.roundRect(x - 6, y + 32, w + 12, 18, 4);
  ctx.fill();

  // Taç Kapı
  const portalW = 70;
  const portalH = 82;
  const portalX = x + (w - portalW) / 2;
  const portalY = y + h - portalH;

  ctx.fillStyle = '#eae0cb';
  ctx.beginPath();
  ctx.roundRect(portalX - 6, portalY - 12, portalW + 12, portalH + 12, 5);
  ctx.fill();
  ctx.strokeStyle = '#bfa888';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#172b47';
  ctx.beginPath();
  ctx.roundRect(portalX, portalY, portalW, portalH, [16, 16, 0, 0]);
  ctx.fill();

  // Tabela ve Durum Rozeti [YAKINDA]
  drawBuildingPlaque(ctx, x + w / 2, y + 54, 'KİTAP VE HİKÂYE DÜNYASI', 'YAKINDA', now);

  ctx.restore();
}

/**
 * D. Kampüs Yolculuğum Köşkü (220, 560, 190, 140)
 */
function drawJourneyPavilion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  now: number = 0,
) {
  const asset = getJourneyPavilionAsset();
  if (asset) {
    ctx.save();
    // 1. Zemin Temas Gölgesi
    ctx.fillStyle = 'rgba(23, 43, 71, 0.24)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 6, w / 2 + 14, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Yüksek Kaliteli 2,5B Görsel Varlık (drawImage)
    const renderW = 235;
    const renderH = 260;
    const renderX = x + (w - renderW) / 2;
    const renderY = y + h - renderH + 12;

    ctx.drawImage(asset, renderX, renderY, renderW, renderH);

    // 3. Etkileşimli Işıltı
    const portalCenterX = x + w / 2;
    const pulse = Math.sin(now / 320) * 0.3 + 0.7;
    ctx.save();
    ctx.strokeStyle = `rgba(45, 115, 80, ${pulse})`;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(portalCenterX, y + h - 45, 34, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 4. Selçuklu Mimari Bina İsim Tabelası ve Durum Rozeti [YAKINDA]
    drawBuildingPlaque(ctx, portalCenterX, y + 16, 'KAMPÜS YOLCULUĞUM', 'YAKINDA', now);

    ctx.restore();
    return;
  }

  ctx.save();

  // Gölge
  ctx.fillStyle = 'rgba(23, 43, 71, 0.18)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h + 6, w / 2 + 12, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Gövde
  ctx.fillStyle = '#f9f6ed';
  ctx.strokeStyle = '#ccb997';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(x, y + 26, w, h - 26, 8);
  ctx.fill();
  ctx.stroke();

  // Adaçayı Yeşili Çatı
  ctx.fillStyle = '#21573c';
  ctx.beginPath();
  ctx.roundRect(x - 6, y + 18, w + 12, 16, 4);
  ctx.fill();

  // Kemerli Revaklar
  ctx.fillStyle = '#172b47';
  for (let i = 0; i < 3; i++) {
    const rx = x + 16 + i * 56;
    ctx.beginPath();
    ctx.roundRect(rx, y + 54, 44, h - 56, [14, 14, 0, 0]);
    ctx.fill();
  }

  // Tabela ve Durum Rozeti [YAKINDA]
  drawBuildingPlaque(ctx, x + w / 2, y + 22, 'KAMPÜS YOLCULUĞUM', 'YAKINDA', now);

  ctx.restore();
}

/**
 * E. Keşif Görevleri Panosu (910, 560, 190, 140)
 */
function drawMissionsKiosk(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  now: number = 0,
) {
  const asset = getMissionsKioskAsset();
  if (asset) {
    ctx.save();
    // 1. Zemin Temas Gölgesi
    ctx.fillStyle = 'rgba(23, 43, 71, 0.24)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 6, w / 2 + 14, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Yüksek Kaliteli 2,5B Görsel Varlık (drawImage)
    const renderW = 210;
    const renderH = 270;
    const renderX = x + (w - renderW) / 2;
    const renderY = y + h - renderH + 12;

    ctx.drawImage(asset, renderX, renderY, renderW, renderH);

    // 3. Etkileşimli Işıltı
    const portalCenterX = x + w / 2;
    const pulse = Math.sin(now / 320) * 0.3 + 0.7;
    ctx.save();
    ctx.strokeStyle = `rgba(216, 151, 43, ${pulse})`;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.roundRect(portalCenterX - 45, y + h - 85, 90, 75, 6);
    ctx.stroke();
    ctx.restore();

    // 4. Selçuklu Mimari Bina İsim Tabelası ve Durum Rozeti [YAKINDA]
    drawBuildingPlaque(ctx, portalCenterX, y + 16, 'KEŞİF GÖREVLERİ', 'YAKINDA', now);

    ctx.restore();
    return;
  }

  ctx.save();

  // Gölge
  ctx.fillStyle = 'rgba(23, 43, 71, 0.18)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h + 6, w / 2 + 12, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Gövde
  ctx.fillStyle = '#f9f6ed';
  ctx.strokeStyle = '#ccb997';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(x, y + 26, w, h - 26, 8);
  ctx.fill();
  ctx.stroke();

  // Lacivert Selçuklu Saçağı
  ctx.fillStyle = '#1b3152';
  ctx.beginPath();
  ctx.roundRect(x - 6, y + 18, w + 12, 16, 4);
  ctx.fill();

  // Ahşap Görev Bülten Panoları
  ctx.fillStyle = '#8f6843';
  ctx.beginPath();
  ctx.roundRect(x + 14, y + 52, w - 28, h - 58, 4);
  ctx.fill();

  // Pano İçi Parşömen Notlar
  ctx.fillStyle = '#fcf8ec';
  ctx.fillRect(x + 22, y + 58, 44, 52);
  ctx.fillRect(x + 74, y + 58, 44, 52);
  ctx.fillRect(x + 126, y + 58, 44, 52);

  // Minik rozetler
  ctx.fillStyle = '#d8972b';
  ctx.fillRect(x + 40, y + 54, 8, 4);
  ctx.fillRect(x + 92, y + 54, 8, 4);
  ctx.fillRect(x + 144, y + 54, 8, 4);

  // Tabela ve Durum Rozeti [YAKINDA]
  drawBuildingPlaque(ctx, x + w / 2, y + 22, 'KEŞİF GÖREVLERİ', 'YAKINDA', now);

  ctx.restore();
}

/**
 * Peyzaj Unsurları: Çok katmanlı gölgeli ağaçlar, bahçe bankları ve çiçekler.
 */
function drawCourtyardLandscape(ctx: CanvasRenderingContext2D, now: number) {
  // Ağaçlar (Koordinatlar mevcut çarpışma düzeniyle tam uyumludur)
  const trees = [
    { x: 120, y: 380, scale: 1 },
    { x: 120, y: 520, scale: 0.95 },
    { x: 500, y: 290, scale: 0.9 },
    { x: 1240, y: 380, scale: 1 },
    { x: 1240, y: 540, scale: 0.95 },
    { x: 700, y: 760, scale: 1.05 },
  ];

  for (const t of trees) {
    drawLushTree(ctx, t.x, t.y, t.scale, now);
  }

  // Bahçe Bankları (Açık dinlenme alanlarında dekoratif)
  drawGardenBench(ctx, 420, 480);
  drawGardenBench(ctx, 980, 480);

  // Renkli Çiçek Tarhları (Lavanta, adaçayı, gül hatmi)
  drawFlowerPatch(ctx, 450, 680);
  drawFlowerPatch(ctx, 880, 680);
}

/**
 * Katmanlı, gölgeli ve rüzgârda hafif salınan Selçuklu bahçe ağacı.
 */
function drawLushTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  now: number,
) {
  const asset = getShadeTreeAsset();
  if (asset) {
    ctx.save();
    const isReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const sway = isReducedMotion ? 0 : Math.sin((now + x * 5) / 1200) * 2;

    // 1. Zemin Temas Gölgesi
    ctx.fillStyle = 'rgba(23, 43, 71, 0.24)';
    ctx.beginPath();
    ctx.ellipse(x, y + 34 * scale, 42 * scale, 14 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Geniş Gölgeli Akdeniz Ağacı (drawImage)
    const renderW = 200 * scale;
    const renderH = 185 * scale;
    const renderX = x - renderW / 2 + sway;
    const renderY = y + 34 * scale - renderH + 6;

    ctx.drawImage(asset, renderX, renderY, renderW, renderH);

    ctx.restore();
    return;
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Hafif rüzgâr salınımı
  const sway = Math.sin((now + x * 5) / 1100) * 1.8;

  // 1. Zemin Gölgesi
  ctx.fillStyle = 'rgba(23, 43, 71, 0.18)';
  ctx.beginPath();
  ctx.ellipse(0, 34, 28, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Ağaç Gövdesi ve Dallar
  ctx.fillStyle = '#54412f';
  ctx.beginPath();
  ctx.moveTo(-5, 34);
  ctx.lineTo(-4, 0);
  ctx.lineTo(4, 0);
  ctx.lineTo(6, 34);
  ctx.closePath();
  ctx.fill();

  // 3. Katmanlı Yaprak Tacı (Üç kademeli zengin gölgeli taç)
  ctx.save();
  ctx.translate(sway, 0);

  // Koyu alt yaprak katmanı (Derinlik)
  ctx.fillStyle = '#17402c';
  ctx.beginPath();
  ctx.arc(0, -6, 29, 0, Math.PI * 2);
  ctx.arc(-14, 2, 22, 0, Math.PI * 2);
  ctx.arc(14, 2, 22, 0, Math.PI * 2);
  ctx.fill();

  // Orta yeşil yaprak katmanı
  ctx.fillStyle = '#21573c';
  ctx.beginPath();
  ctx.arc(0, -12, 26, 0, Math.PI * 2);
  ctx.arc(-10, -4, 20, 0, Math.PI * 2);
  ctx.arc(10, -4, 20, 0, Math.PI * 2);
  ctx.fill();

  // Açık güneş alan üst yaprak vurgusu (Sol-üst ışık)
  ctx.fillStyle = '#2f7551';
  ctx.beginPath();
  ctx.arc(-6, -18, 19, 0, Math.PI * 2);
  ctx.arc(6, -16, 17, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  ctx.restore();
}

/**
 * Ahşap ve ferforje Selçuklu bahçe bankı.
 */
function drawGardenBench(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();

  // Bank gölgesi
  ctx.fillStyle = 'rgba(23, 43, 71, 0.14)';
  ctx.beginPath();
  ctx.ellipse(x + 22, y + 16, 24, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ahşap oturak çıtaları
  ctx.fillStyle = '#8f6843';
  ctx.beginPath();
  ctx.roundRect(x, y + 2, 44, 10, 2);
  ctx.fill();

  // Sırtlık
  ctx.fillStyle = '#735031';
  ctx.beginPath();
  ctx.roundRect(x, y - 6, 44, 7, 2);
  ctx.fill();

  // Demir döküm ayaklar
  ctx.fillStyle = '#172b47';
  ctx.fillRect(x + 4, y + 8, 3, 9);
  ctx.fillRect(x + 37, y + 8, 3, 9);

  ctx.restore();
}

/**
 * Çiçek Tarhı (Avluya renk katan küçük bitkiler).
 */
function drawFlowerPatch(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();

  // Toprak zemin
  ctx.fillStyle = '#d5c4a5';
  ctx.beginPath();
  ctx.ellipse(x, y, 22, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Çiçek tomurcukları (Mor lavanta, turuncu hatmi)
  const colors = ['#875fad', '#d87a32', '#249ab0', '#b54838'];
  for (let i = 0; i < 6; i++) {
    const fx = x - 14 + i * 5;
    const fy = y - 4 + (i % 2) * 5;
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Selçuklu Duvar / Kapı Feneri (Kandil).
 */
function drawLantern(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  now: number,
) {
  ctx.save();

  // Askı kolu
  ctx.fillStyle = '#172b47';
  ctx.fillRect(x - 1, y - 10, 3, 10);

  // Fener camı ve sarı ışık
  const glow = Math.sin(now / 280) * 0.15 + 0.85;
  ctx.fillStyle = `rgba(252, 219, 131, ${glow})`;
  ctx.beginPath();
  ctx.roundRect(x - 4, y, 9, 12, 2);
  ctx.fill();

  ctx.strokeStyle = '#d8972b';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(x - 4, y, 9, 12);

  // Üst pirinç külah
  ctx.fillStyle = '#172b47';
  ctx.beginPath();
  ctx.moveTo(x + 0.5, y - 4);
  ctx.lineTo(x + 6, y);
  ctx.lineTo(x - 5, y);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Zarif Servi Ağacı (Konsept görselindeki Selçuklu avlu servileri).
 */
function drawCypressTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  now: number,
) {
  const asset = getCypressTreeAsset();
  if (asset) {
    ctx.save();
    const isReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const sway = isReducedMotion ? 0 : Math.sin((now + x * 3) / 1400) * 1.5;

    // 1. Zemin Temas Gölgesi
    ctx.fillStyle = 'rgba(23, 43, 71, 0.22)';
    ctx.beginPath();
    ctx.ellipse(x, y + 26 * scale, 22 * scale, 8 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Servi Ağacı (drawImage)
    const renderW = 64 * scale;
    const renderH = 218 * scale;
    const renderX = x - renderW / 2 + sway;
    const renderY = y + 26 * scale - renderH;

    ctx.drawImage(asset, renderX, renderY, renderW, renderH);

    ctx.restore();
    return;
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const isReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const sway = isReducedMotion ? 0 : Math.sin((now + x * 3) / 1400) * 1.2;

  // Zemin gölgesi
  ctx.fillStyle = 'rgba(23, 43, 71, 0.22)';
  ctx.beginPath();
  ctx.ellipse(0, 26, 20, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Gövde
  ctx.fillStyle = '#3e2723';
  ctx.fillRect(-2, 10, 4, 16);

  // Servi Tacı Katmanları
  ctx.save();
  ctx.translate(sway, 0);

  // Alt katman
  ctx.fillStyle = '#14532d';
  ctx.beginPath();
  ctx.moveTo(0, -50);
  ctx.quadraticCurveTo(-14, -20, -10, 12);
  ctx.quadraticCurveTo(0, 16, 10, 12);
  ctx.quadraticCurveTo(14, -20, 0, -50);
  ctx.fill();

  // Orta aydınlık katman (Soldan güneş)
  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.moveTo(0, -52);
  ctx.quadraticCurveTo(-11, -22, -7, 10);
  ctx.quadraticCurveTo(0, 12, 6, 10);
  ctx.quadraticCurveTo(10, -22, 0, -52);
  ctx.fill();

  // Sol aydınlık güneş vurgusu
  ctx.strokeStyle = '#86efac';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-1, -48);
  ctx.quadraticCurveTo(-7, -20, -5, 6);
  ctx.stroke();

  ctx.restore();
  ctx.restore();
}

/**
 * Sinematik Ön Plan Ağaç Dalı ve Yaprak Saçağı.
 */
function drawCanopyBranch(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  mirrored: boolean,
) {
  ctx.save();
  ctx.translate(x, y);
  if (mirrored) {
    ctx.scale(-1, 1);
  }

  // Kalın Ana Dal (Koyu ahşap dokusu)
  ctx.fillStyle = '#2d1810';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(40, 12, 100, 28, 160, 24);
  ctx.bezierCurveTo(220, 20, 260, 48, 290, 78);
  ctx.bezierCurveTo(260, 68, 220, 52, 170, 42);
  ctx.bezierCurveTo(110, 32, 50, 36, 0, 26);
  ctx.closePath();
  ctx.fill();

  // Yan dal
  ctx.fillStyle = '#2d1810';
  ctx.beginPath();
  ctx.moveTo(130, 32);
  ctx.quadraticCurveTo(160, 60, 178, 102);
  ctx.lineTo(172, 104);
  ctx.quadraticCurveTo(154, 62, 126, 36);
  ctx.closePath();
  ctx.fill();

  // Sarkan Yaprak Kümeleri (Konsept görselindeki zengin ön plan hissi)
  const leafClusters = [
    { cx: 70, cy: 24, r: 30, color: '#14532d' },
    { cx: 120, cy: 38, r: 28, color: '#166534' },
    { cx: 170, cy: 42, r: 32, color: '#15803d' },
    { cx: 220, cy: 56, r: 28, color: '#16a34a' },
    { cx: 270, cy: 78, r: 26, color: '#22c55e' },
    { cx: 180, cy: 96, r: 22, color: '#16a34a' },
    { cx: 146, cy: 70, r: 24, color: '#15803d' },
  ];

  for (let i = 0; i < leafClusters.length; i++) {
    const leaf = leafClusters[i];
    ctx.fillStyle = leaf.color;
    ctx.beginPath();
    ctx.arc(leaf.cx, leaf.cy, leaf.r, 0, Math.PI * 2);
    ctx.fill();
    // Güneş Işığı Vurgusu
    ctx.fillStyle = 'rgba(187, 247, 208, 0.4)';
    ctx.beginPath();
    ctx.arc(leaf.cx - 5, leaf.cy - 6, leaf.r * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Atmosferik Sıcak Gün Işığı Demetleri (Cinematic Sunbeams).
 */
function drawCinematicSunbeams(ctx: CanvasRenderingContext2D, width: number) {
  ctx.save();
  const beamGrad = ctx.createLinearGradient(0, 0, width * 0.7, 700);
  beamGrad.addColorStop(0, 'rgba(254, 243, 199, 0.09)');
  beamGrad.addColorStop(0.4, 'rgba(253, 230, 138, 0.04)');
  beamGrad.addColorStop(1, 'rgba(253, 230, 138, 0)');

  ctx.fillStyle = beamGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(width * 0.5, 0);
  ctx.lineTo(width * 0.8, 900);
  ctx.lineTo(0, 700);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
