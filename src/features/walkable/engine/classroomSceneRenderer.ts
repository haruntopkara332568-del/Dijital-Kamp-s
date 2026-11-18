/**
 * İngilizce Dünyası Sınıfı (Classroom) Görsel Sahne Çizici — Aşama 4.7 Sinematik Dönüşümü.
 * Onaylanmış konsept görselindeki (digital_campus_english_classroom_concept.png)
 * Selçuklu mukarnas kemerli mimari, sıcak ahşap parke zemin, akıllı tahta,
 * öğrenci sıraları, öğretmen kürsüsü ve kitaplık bağımsız görsel varlıklarla
 * ve Y-Sorting derinlik sıralamasıyla render edilir.
 *
 * ÖNEMLİ KURAL:
 * Mevcut çarpışma kutuları (AABB), akıllı tahta (480, 160, r:80) ve çıkış kapısı
 * (480, 590, r:65) etkileşim koordinatları testler ve motorla %100 uyumludur.
 */

import type { PlayerCharacter } from '../types';
import { drawCharacter } from './characterRenderer';
import {
  getClassroomBackgroundAsset,
  getClassroomDeskAsset,
  getClassroomDeskMirroredAsset,
  getClassroomTeacherPodiumAsset,
  getClassroomBookshelfAsset,
  getSmartBoardScreenOffAsset,
  getSmartBoardScreenPoweringAsset,
  getSmartBoardScreenActiveAsset,
} from './assetLoader';

/**
 * Katman 1: Sınıf Arka Planı (Duvarlar, zemin, pencereler, akıllı tahta ve çıkış kapısı)
 */
export function renderClassroomLayeredBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  isSmartBoardActive: boolean,
  isSmartBoardPoweringOn: boolean,
  selectedGrade?: number | null,
  completedStages?: string[],
) {
  const isReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const now = isReducedMotion ? 0 : performance.now();

  const isSmartBoardReady =
    selectedGrade === 3 &&
    Array.isArray(completedStages) &&
    completedStages.includes('kesfet') &&
    completedStages.includes('ogren') &&
    completedStages.includes('uret') &&
    completedStages.includes('paylas');

  const bgAsset = getClassroomBackgroundAsset();
  if (bgAsset) {
    ctx.drawImage(bgAsset, 0, 0, width, height);
  } else {
    // Vektör Çizim Fallback
    // 1. ZEMİN (Sıcak Ahşap Parke Dokusu)
    drawParquetFloor(ctx, width, height);

    // 2. KUZEY ÖN DUVARI (Ahşap Lambri, Selçuklu Çini Bordürü ve Posterler)
    drawClassroomWall(ctx, width);

    // 3. KEMERLİ AYDINLIK PENCERELER VE GÜNEŞ IŞIĞI HUZMELERİ
    drawSunlitArchedWindow(ctx, 110, 26, 88, 92, now);
    drawSunlitArchedWindow(ctx, 762, 26, 88, 92, now);
  }

  // 4. AKILLI TAHTA (Smart Board — Sınıfın Odak Noktası, 3 Farklı Durum)
  drawSmartBoard(
    ctx,
    350,
    25,
    260,
    120,
    isSmartBoardActive,
    isSmartBoardPoweringOn,
    now,
    isSmartBoardReady,
  );

  // 4b. SELÇUKLU SINIF SEÇİM PANOSU (Akıllı Tahtanın Solunda Fiziksel Pano)
  drawClassroomGradeBoard(ctx, 215, 26, 110, 118, selectedGrade ?? null, now);

  // 5. AVLUYA ÇIKIŞ KAPISI (Güney Duvarı — 480, 590 Etkileşim Noktası)
  drawExitDoor(ctx, width, height);
}

/**
 * Katman 2: Derinlik Sıralı Varlıklar (Y-Sorting Entities: Kürsü, Kitaplık, Sıralar ve Karakter)
 */
export interface ClassroomEntity {
  id: string;
  baseY: number;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

export function renderClassroomEntities(
  ctx: CanvasRenderingContext2D,
  player: PlayerCharacter,
  width?: number,
  height?: number,
  completedStages?: string[],
) {
  void width;
  void height;

  const now = typeof performance !== 'undefined' ? performance.now() : 0;
  const podiumAsset = getClassroomTeacherPodiumAsset();
  const bookshelfAsset = getClassroomBookshelfAsset();
  const deskAsset = getClassroomDeskAsset();
  const deskMirroredAsset = getClassroomDeskMirroredAsset();

  const entities: ClassroomEntity[] = [
    // 1. ÖĞRETMEN KÜRSÜSÜ VE MASASI (Engel: 670, 160, 100, 50 -> alt taban baseY: 210)
    {
      id: 'teacher-podium',
      baseY: 210,
      draw: (c) => {
        if (podiumAsset) {
          c.save();
          c.fillStyle = 'rgba(23, 43, 71, 0.22)';
          c.beginPath();
          c.ellipse(720, 212, 60, 14, 0, 0, Math.PI * 2);
          c.fill();
          c.drawImage(podiumAsset, 655, 125, 130, 95);
          c.restore();
        } else {
          drawTeacherPodium(c, 670, 160);
        }
      },
    },

    // 2. KİTAPLIK VE MATERYAL DOLABI (Engel: 40, 150, 60, 85 -> alt taban baseY: 235)
    {
      id: 'bookshelf',
      baseY: 235,
      draw: (c) => {
        if (bookshelfAsset) {
          c.save();
          c.fillStyle = 'rgba(23, 43, 71, 0.2)';
          c.beginPath();
          c.ellipse(75, 236, 38, 12, 0, 0, Math.PI * 2);
          c.fill();
          c.drawImage(bookshelfAsset, 30, 125, 85, 115);
          c.restore();
        } else {
          drawBookshelf(c, 40, 150);
        }
      },
    },

    // 3. 1. KEŞFET MASASI — Sol Ön (Engel: 190, 260, 150, 55 -> alt taban baseY: 315)
    {
      id: 'desk-1',
      baseY: 315,
      draw: (c) => {
        if (deskAsset) {
          c.save();
          c.fillStyle = 'rgba(23, 43, 71, 0.2)';
          c.beginPath();
          c.ellipse(265, 318, 85, 16, 0, 0, Math.PI * 2);
          c.fill();
          c.drawImage(deskAsset, 175, 210, 180, 115);
          c.restore();
        } else {
          drawStudentDesk(c, 190, 260, '1. Keşfet Masası', '#0e768a');
        }
        drawTablePlaque(
          c,
          265,
          246,
          '1. KEŞFET MASASI',
          completedStages?.includes('kesfet'),
          !completedStages?.includes('kesfet'),
          now,
        );
      },
    },

    // 4. 2. ÖĞREN MASASI — Sağ Ön (Engel: 590, 260, 150, 55 -> alt taban baseY: 315)
    {
      id: 'desk-2',
      baseY: 315,
      draw: (c) => {
        const sprite = deskMirroredAsset || deskAsset;
        if (sprite) {
          c.save();
          c.fillStyle = 'rgba(23, 43, 71, 0.2)';
          c.beginPath();
          c.ellipse(665, 318, 85, 16, 0, 0, Math.PI * 2);
          c.fill();
          c.drawImage(sprite, 575, 210, 180, 115);
          c.restore();
        } else {
          drawStudentDesk(c, 590, 260, '2. Öğren Masası', '#249ab0');
        }
        drawTablePlaque(
          c,
          665,
          246,
          '2. ÖĞREN MASASI',
          completedStages?.includes('ogren'),
          completedStages?.includes('kesfet') && !completedStages?.includes('ogren'),
          now,
        );
      },
    },

    // 5. 3. ÜRET MASASI — Sol Arka (Engel: 190, 390, 150, 55 -> alt taban baseY: 445)
    {
      id: 'desk-3',
      baseY: 445,
      draw: (c) => {
        if (deskAsset) {
          c.save();
          c.fillStyle = 'rgba(23, 43, 71, 0.2)';
          c.beginPath();
          c.ellipse(265, 448, 85, 16, 0, 0, Math.PI * 2);
          c.fill();
          c.drawImage(deskAsset, 175, 340, 180, 115);
          c.restore();
        } else {
          drawStudentDesk(c, 190, 390, '3. Üret Masası', '#d97706');
        }
        drawTablePlaque(
          c,
          265,
          376,
          '3. ÜRET MASASI',
          completedStages?.includes('uret'),
          completedStages?.includes('ogren') && !completedStages?.includes('uret'),
          now,
        );
      },
    },

    // 6. 4. PAYLAŞ MASASI — Sağ Arka (Engel: 590, 390, 150, 55 -> alt taban baseY: 445)
    {
      id: 'desk-4',
      baseY: 445,
      draw: (c) => {
        const sprite = deskMirroredAsset || deskAsset;
        if (sprite) {
          c.save();
          c.fillStyle = 'rgba(23, 43, 71, 0.2)';
          c.beginPath();
          c.ellipse(665, 448, 85, 16, 0, 0, Math.PI * 2);
          c.fill();
          c.drawImage(sprite, 575, 340, 180, 115);
          c.restore();
        } else {
          drawStudentDesk(c, 590, 390, '4. Paylaş Masası', '#059669');
        }
        drawTablePlaque(
          c,
          665,
          376,
          '4. PAYLAŞ MASASI',
          completedStages?.includes('paylas'),
          completedStages?.includes('uret') && !completedStages?.includes('paylas'),
          now,
        );
      },
    },

    // 7. ÖĞRENCİ KARAKTERİ (Y-Sorting: ayak temas noktası)
    {
      id: 'player-character',
      baseY: player.y + 18,
      draw: (c) => drawCharacter(c, player),
    },
  ];

  // Derinlik Sıralaması: baseY küçük olan (daha kuzeyde) önce çizilir
  entities.sort((a, b) => a.baseY - b.baseY);

  for (let i = 0; i < entities.length; i++) {
    entities[i].draw(ctx);
  }
}

/**
 * Katman 3: Ön Plan ve Atmosferik Işıklandırma (Ceiling Lamps, Dust Motes)
 */
export function renderClassroomForeground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height?: number,
) {
  void width;
  void height;
  const isReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const now = isReducedMotion ? 0 : performance.now();

  ctx.save();

  // 1. Tavandan Sarkan Selçuklu Pirinç Fenerleri / Avizeler (Sol ve Sağ)
  drawHangingCeilingLamp(ctx, 230, 0, 48, now);
  drawHangingCeilingLamp(ctx, 730, 0, 48, now);

  // 2. Güneş Işığı Huzmesinde Uçuşan Minik Toz / Işık Tanecikleri (Ambient Dust Motes)
  if (!isReducedMotion) {
    ctx.fillStyle = 'rgba(255, 245, 210, 0.45)';
    for (let i = 0; i < 10; i++) {
      const moteX = 130 + ((i * 57 + now * 0.02) % 200);
      const moteY = 120 + ((i * 37 + now * 0.015) % 400);
      const radius = 1 + (i % 3) * 0.6;
      ctx.beginPath();
      ctx.arc(moteX, moteY, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 10; i++) {
      const moteX = 740 + ((i * 49 + now * 0.022) % 200);
      const moteY = 120 + ((i * 41 + now * 0.018) % 400);
      const radius = 1 + (i % 3) * 0.6;
      ctx.beginPath();
      ctx.arc(moteX, moteY, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

/**
 * Geriye Dönük Uyumluluk (Legacy / Test Renderer)
 */
export function renderClassroomBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  isSmartBoardActive: boolean,
  isSmartBoardPoweringOn: boolean,
  selectedGrade?: number | null,
  completedStages?: string[],
) {
  renderClassroomLayeredBackground(
    ctx,
    width,
    height,
    isSmartBoardActive,
    isSmartBoardPoweringOn,
    selectedGrade,
    completedStages,
  );

  const dummyPlayer: PlayerCharacter = {
    x: -999,
    y: -999,
    width: 46,
    height: 58,
    direction: 'down',
    state: 'idle',
    speed: 3,
    walkFrame: 0,
    grade: 4,
  };
  renderClassroomEntities(ctx, dummyPlayer, width, height);
}

/**
 * Zemin: Sıcak lamine ahşap parke döşeme ve güneş ışığı yansıması.
 */
function drawParquetFloor(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = '#f4ede1';
  ctx.fillRect(0, 130, width, height - 130);

  const plankH = 34;
  const plankW = 75;

  ctx.strokeStyle = '#e6dcce';
  ctx.lineWidth = 1.2;

  let row = 0;
  for (let y = 130; y < height; y += plankH) {
    row++;
    const xShift = (row % 2) * (plankW / 2);

    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();

    for (let x = -plankW + xShift; x < width + plankW; x += plankW) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + plankH);
      ctx.stroke();
    }
  }

  ctx.save();
  ctx.fillStyle = 'rgba(255, 248, 225, 0.18)';

  ctx.beginPath();
  ctx.moveTo(110, 118);
  ctx.lineTo(198, 118);
  ctx.lineTo(310, height);
  ctx.lineTo(150, height);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(762, 118);
  ctx.lineTo(850, 118);
  ctx.lineTo(950, height);
  ctx.lineTo(790, height);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Kuzey Ön Duvarı: Selçuklu çinili bordür, ahşap lambri ve eğitim posterleri.
 */
function drawClassroomWall(ctx: CanvasRenderingContext2D, width: number) {
  ctx.save();

  ctx.fillStyle = '#eee6d5';
  ctx.fillRect(0, 0, width, 130);

  ctx.fillStyle = '#c7b494';
  ctx.fillRect(0, 118, width, 12);

  ctx.fillStyle = '#0e768a';
  ctx.fillRect(0, 112, width, 6);

  ctx.fillStyle = '#d8972b';
  ctx.fillRect(0, 110, width, 2);

  drawWallPoster(ctx, 230, 36, 80, 58, 'World Map', '#0e768a');
  drawWallPoster(ctx, 650, 36, 80, 58, 'Vocabulary', '#b25938');

  ctx.restore();
}

/**
 * Duvar Posteri / Eğitim Tablosu.
 */
function drawWallPoster(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  accentColor: string,
) {
  ctx.save();

  ctx.fillStyle = 'rgba(23, 43, 71, 0.08)';
  ctx.fillRect(x + 2, y + 2, w, h);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, w, h);

  ctx.strokeStyle = '#8a6f4e';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = accentColor;
  ctx.fillRect(x + 2, y + 2, w - 4, 14);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 8.5px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, x + w / 2, y + 12);

  ctx.fillStyle = '#dfd6c4';
  ctx.fillRect(x + 8, y + 22, w - 16, 8);
  ctx.fillRect(x + 8, y + 34, w - 16, 8);
  ctx.fillRect(x + 8, y + 46, (w - 16) * 0.7, 6);

  ctx.restore();
}

/**
 * Selçuklu Kemerli Pencere: Bahçe manzarası, vitray bölmeleri ve cam parıltısı.
 */
function drawSunlitArchedWindow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  now: number,
) {
  ctx.save();

  ctx.fillStyle = '#cfbe9f';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x - 4, y + 28, w + 8, h - 24, [0, 0, 4, 4]);
  } else {
    ctx.rect(x - 4, y + 28, w + 8, h - 24);
  }
  ctx.arc(x + w / 2, y + 28, w / 2 + 4, Math.PI, 0);
  ctx.fill();
  ctx.strokeStyle = '#9e8b6b';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y + 28, w, h - 28, [0, 0, 2, 2]);
  } else {
    ctx.rect(x, y + 28, w, h - 28);
  }
  ctx.arc(x + w / 2, y + 28, w / 2, Math.PI, 0);
  ctx.clip();

  if (typeof ctx.createLinearGradient === 'function') {
    const skyGrad = ctx.createLinearGradient(x, y, x, y + h);
    skyGrad.addColorStop(0, '#c7ebf2');
    skyGrad.addColorStop(0.65, '#e4f6f8');
    skyGrad.addColorStop(1, '#8bc998');
    ctx.fillStyle = skyGrad;
  } else {
    ctx.fillStyle = '#c7ebf2';
  }
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = '#2d7350';
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h + 10, 32, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  ctx.strokeStyle = '#6b5438';
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x + w / 2, y + h);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x, y + 42);
  ctx.lineTo(x + w, y + 42);
  ctx.stroke();

  const shimmer = Math.sin(now / 700) * 0.05 + 0.15;
  ctx.fillStyle = `rgba(255, 255, 255, ${shimmer})`;
  ctx.beginPath();
  ctx.moveTo(x + 4, y + 42);
  ctx.lineTo(x + 28, y + 10);
  ctx.lineTo(x + 36, y + 10);
  ctx.lineTo(x + 12, y + 42);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Akıllı Tahta (Smart Board): Sınıfın odak noktası, Selçuklu ahşap-metal kakma kasa,
 * 3 bağımsız ekran durumu (Off, Powering On, Active) görsel varlıkları ve fallback'leri.
 */
function drawSmartBoard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  isActive: boolean,
  isPoweringOn: boolean,
  now: number,
  isReady: boolean = false,
) {
  ctx.save();

  // 0. Dört masa tamamlandığında davetkâr parıldayan dış aura (Aşama 6.5)
  if (isReady && !isActive && !isPoweringOn) {
    const auraPulse = Math.sin(now / 320) * 0.25 + 0.75;
    ctx.save();
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 18 * auraPulse;
    ctx.strokeStyle = `rgba(245, 158, 11, ${auraPulse})`;
    ctx.lineWidth = 3;
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x - 12, y - 12, w + 24, h + 24, 10);
    } else {
      ctx.strokeRect(x - 12, y - 12, w + 24, h + 24);
    }
    ctx.stroke();
    ctx.restore();
  }

  // 1. Tahta Duvar Askı Gölgesi
  ctx.fillStyle = 'rgba(23, 43, 71, 0.22)';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x - 6, y - 4, w + 16, h + 16, 10);
  } else if (typeof ctx.rect === 'function') {
    ctx.rect(x - 6, y - 4, w + 16, h + 16);
  }
  ctx.fill();

  // 2. Ahşap & Metal Selçuklu Çerçeve
  ctx.fillStyle = '#523e2b';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x - 10, y - 10, w + 20, h + 20, 8);
  } else if (typeof ctx.rect === 'function') {
    ctx.rect(x - 10, y - 10, w + 20, h + 20);
  }
  ctx.fill();

  // Pirinç / Altın Kakma Köşe Süsleri
  ctx.strokeStyle = '#d8972b';
  ctx.lineWidth = 2.2;
  ctx.strokeRect(x - 8, y - 8, w + 16, h + 16);

  // 3. Ekran Yüzeyi (Görsel varlık veya vektör fallback)
  if (isPoweringOn) {
    const pwrAsset = getSmartBoardScreenPoweringAsset();
    if (pwrAsset) {
      ctx.drawImage(pwrAsset, x, y, w, h);
      const pulse = Math.sin(now / 150) * 0.15 + 0.15;
      ctx.fillStyle = `rgba(45, 194, 221, ${pulse})`;
      ctx.fillRect(x, y, w, h);
    } else {
      drawVectorPoweringScreen(ctx, x, y, w, h, now);
    }
  } else if (isActive) {
    const actAsset = getSmartBoardScreenActiveAsset();
    if (actAsset) {
      ctx.drawImage(actAsset, x, y, w, h);
      const glow = Math.sin(now / 300) * 0.2 + 0.8;
      ctx.strokeStyle = `rgba(45, 194, 221, ${glow})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);
    } else {
      drawVectorActiveScreen(ctx, x, y, w, h, now);
    }
  } else {
    const offAsset = getSmartBoardScreenOffAsset();
    if (offAsset) {
      ctx.drawImage(offAsset, x, y, w, h);
      const ledGlow = Math.sin(now / 450) * 0.3 + 0.7;
      ctx.fillStyle = isReady ? `rgba(245, 158, 11, ${ledGlow})` : `rgba(36, 154, 176, ${ledGlow})`;
      ctx.beginPath();
      ctx.arc(x + w - 16, y + h - 14, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Hazır durumunda varlık üzerine parıltılı davet etiketi
      if (isReady) {
        ctx.save();
        const pulse = Math.sin(now / 280) * 0.2 + 0.8;
        ctx.fillStyle = `rgba(15, 23, 42, ${0.75 * pulse})`;
        ctx.fillRect(x + 20, y + h / 2 - 20, w - 40, 40);
        ctx.strokeStyle = `rgba(245, 158, 11, ${pulse})`;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x + 20, y + h / 2 - 20, w - 40, 40);

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 11px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('★ BÜYÜK GÖREV HAZIR ★', x + w / 2, y + h / 2 - 4);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '600 10px Inter, system-ui, sans-serif';
        ctx.fillText('Kervansaray Macerası [E]', x + w / 2, y + h / 2 + 12);
        ctx.restore();
      }
    } else {
      drawVectorOffScreen(ctx, x, y, w, h, now, isReady);
    }
  }

  ctx.restore();
}

/**
 * Selçuklu Mimari Sınıf Seçim Panosu (Akıllı Tahtanın Sol Tarafında Fiziksel Pano).
 * Ahşap oymalı, sivri kemerli, turkuaz çinili ve Selçuklu yıldız bezemeli fiziksel pano.
 */
export function drawClassroomGradeBoard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  selectedGrade: number | null,
  now: number = 0,
) {
  ctx.save();

  // 1. Zemin Derinlik Gölgesi
  ctx.fillStyle = 'rgba(23, 43, 71, 0.35)';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x + 3, y + 4, w, h, 6);
  } else {
    ctx.rect(x + 3, y + 4, w, h);
  }
  ctx.fill();

  // 2. Taş / Ahşap Kaide Çerçevesi (Ceviz Ahşap & Kumtaşı)
  ctx.fillStyle = '#2f1f14';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, 6);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.fill();
  ctx.strokeStyle = '#bca888';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // 3. Selçuklu Sivri Kemer Tepeliği (Mukarnas Taç)
  ctx.fillStyle = '#0e768a';
  ctx.beginPath();
  ctx.moveTo(x + 8, y + 24);
  if (ctx.quadraticCurveTo) {
    ctx.quadraticCurveTo(x + w / 2, y - 10, x + w - 8, y + 24);
  } else {
    ctx.lineTo(x + w / 2, y - 10);
    ctx.lineTo(x + w - 8, y + 24);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#d8972b';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Kemer Tepesinde Selçuklu Sekiz Köşeli Yıldız / Rozet
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(x + w / 2, y + 8, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // 4. Turkuaz Çini Bordür Çizgisi
  ctx.strokeStyle = '#249ab0';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(x + 5, y + 24, w - 10, h - 29);

  // 5. Pano Başlık Levhası (Pirinç Plaka)
  ctx.fillStyle = '#172b47';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x + 10, y + 27, w - 20, 18, 4);
  } else {
    ctx.rect(x + 10, y + 27, w - 20, 18);
  }
  ctx.fill();
  ctx.strokeStyle = '#d8972b';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 8.5px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SINIF PANOSU', x + w / 2, y + 36);

  // 6. Pano İç Levhası (Taş Oyma Doku)
  ctx.fillStyle = '#1b120c';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x + 10, y + 48, w - 20, h - 55, 4);
  } else {
    ctx.rect(x + 10, y + 48, w - 20, h - 55);
  }
  ctx.fill();
  ctx.strokeStyle = '#5c4532';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 7. Seçili Sınıf Durumu veya Seçim Çağrısı
  if (selectedGrade) {
    // Sınıf Seçili Durum
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 15px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${selectedGrade}. SINIF`, x + w / 2, y + 68);

    // Yeşil onay rozeti
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x + w / 2 - 28, y + 84, 56, 14, 3);
    } else {
      ctx.rect(x + w / 2 - 28, y + 84, 56, 14);
    }
    ctx.fill();

    ctx.fillStyle = '#052e16';
    ctx.font = 'bold 7.5px sans-serif';
    ctx.fillText('● AKTİF', x + w / 2, y + 91);
  } else {
    // Sınıf Henüz Seçilmedi — Dikkat Çeken Canlı Davet
    const pulse = Math.sin(now / 280) * 0.35 + 0.65;
    ctx.fillStyle = `rgba(239, 68, 68, ${pulse * 0.25 + 0.15})`;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x + 12, y + 52, w - 24, 32, 4);
    } else {
      ctx.rect(x + 12, y + 52, w - 24, 32);
    }
    ctx.fill();

    ctx.fillStyle = '#fca5a5';
    ctx.font = 'bold 8.5px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SEÇİM YAPIN', x + w / 2, y + 64);

    ctx.fillStyle = `rgba(254, 240, 138, ${pulse})`;
    ctx.font = 'bold 8px sans-serif';
    ctx.fillText('➜ Sınıfını Seç', x + w / 2, y + 78);

    // Dışarıya doğru yanıp sönen altın aura
    ctx.strokeStyle = `rgba(216, 151, 43, ${pulse})`;
    ctx.lineWidth = 1.8;
    ctx.strokeRect(x + 8, y + 25, w - 16, h - 31);
  }

  // 8. Altın Asılı Kandil / Fener (Panonun solunda)
  const lampGlow = Math.sin(now / 320) * 0.2 + 0.8;
  ctx.fillStyle = `rgba(253, 230, 138, ${0.4 * lampGlow})`;
  ctx.beginPath();
  ctx.arc(x - 5, y + 50, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#d8972b';
  ctx.fillRect(x - 7, y + 36, 4, 16);
  ctx.beginPath();
  ctx.arc(x - 5, y + 54, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Akıllı Tahta Vektör Fallback: Açılış Animasyonu
 */
function drawVectorPoweringScreen(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  now: number,
) {
  if (typeof ctx.createRadialGradient === 'function') {
    const glowRad = ((now % 600) / 600) * (w / 1.5) + 20;
    const powerGrad = ctx.createRadialGradient(
      x + w / 2,
      y + h / 2,
      5,
      x + w / 2,
      y + h / 2,
      glowRad,
    );
    powerGrad.addColorStop(0, '#ffffff');
    powerGrad.addColorStop(0.35, '#2dc2dd');
    powerGrad.addColorStop(0.8, '#0e768a');
    powerGrad.addColorStop(1, '#093a44');
    ctx.fillStyle = powerGrad;
  } else {
    ctx.fillStyle = '#0e768a';
  }

  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, 4);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12.5px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('AKILLI TAHTA BAŞLATILIYOR...', x + w / 2, y + h / 2 + 5);
}

/**
 * Akıllı Tahta Vektör Fallback: Aktif Ekran
 */
function drawVectorActiveScreen(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  now: number,
) {
  ctx.fillStyle = '#0f243c';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, 4);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.fill();

  ctx.fillStyle = '#0e768a';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x + 8, y + 8, w - 16, 26, 4);
  } else {
    ctx.rect(x + 8, y + 8, w - 16, 26);
  }
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DİJİTAL EĞİTİM KAMPÜSÜ — İNGİLİZCE DÜNYASI', x + w / 2, y + 25);

  ctx.fillStyle = '#172b47';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x + 18, y + 42, w - 36, 68, 6);
  } else {
    ctx.rect(x + 18, y + 42, w - 36, 68);
  }
  ctx.fill();
  ctx.strokeStyle = '#d8972b';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#fbf2df';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('Etkinlik: Kapıların Anlattığı Hikâye', x + w / 2, y + 66);

  const btnPulse = Math.sin(now / 350) * 0.2 + 0.8;
  ctx.fillStyle = `rgba(36, 154, 176, ${btnPulse})`;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x + w / 2 - 80, y + 80, 160, 22, 11);
  } else {
    ctx.rect(x + w / 2 - 80, y + 80, 160, 22);
  }
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('BAŞLATMAK İÇİN [E] TUŞUNA BAS', x + w / 2, y + 94);
}

/**
 * Akıllı Tahta Vektör Fallback: Kapalı Ekran
 */
function drawVectorOffScreen(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  now: number,
  isReady: boolean = false,
) {
  ctx.fillStyle = '#101a27';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, 4);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w * 0.55, y);
  ctx.lineTo(x + w * 0.25, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fill();

  if (isReady) {
    const pulse = Math.sin(now / 300) * 0.2 + 0.8;
    // Parıldayan Selçuklu Yıldızı
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2 - 14);
    ctx.fillStyle = `rgba(245, 158, 11, ${0.85 * pulse})`;
    for (let i = 0; i < 2; i++) {
      ctx.rotate((Math.PI / 4) * i);
      ctx.fillRect(-13, -13, 26, 26);
    }
    ctx.restore();

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ BÜYÜK GÖREV HAZIR ★', x + w / 2, y + h / 2 + 12);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('Kervansaray Macerası [E]', x + w / 2, y + h / 2 + 28);

    const ledGlow = Math.sin(now / 300) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(245, 158, 11, ${ledGlow})`;
    ctx.beginPath();
    ctx.arc(x + w - 16, y + h - 14, 4, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  ctx.save();
  ctx.translate(x + w / 2, y + h / 2 - 12);
  ctx.fillStyle = 'rgba(14, 118, 138, 0.4)';
  for (let i = 0; i < 2; i++) {
    ctx.rotate((Math.PI / 4) * i);
    ctx.fillRect(-12, -12, 24, 24);
  }
  ctx.restore();

  ctx.fillStyle = '#249ab0';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ETKİLEŞİMLİ AKILLI TAHTA', x + w / 2, y + h / 2 + 14);

  ctx.fillStyle = '#bfae95';
  ctx.font = '10px sans-serif';
  ctx.fillText('Yaklaş ve [E] ile aç', x + w / 2, y + h / 2 + 30);

  const ledGlow = Math.sin(now / 450) * 0.3 + 0.7;
  ctx.fillStyle = `rgba(36, 154, 176, ${ledGlow})`;
  ctx.beginPath();
  ctx.arc(x + w - 16, y + h - 14, 3.5, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Öğretmen Masası ve Kürsüsü Vektör Fallback (670, 160, 100, 50).
 */
function drawTeacherPodium(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();

  ctx.fillStyle = 'rgba(23, 43, 71, 0.16)';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x + 4, y + 42, 96, 14, 4);
  } else {
    ctx.rect(x + 4, y + 42, 96, 14);
  }
  ctx.fill();

  ctx.fillStyle = '#9e805e';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, 100, 48, 5);
  } else {
    ctx.rect(x, y, 100, 48);
  }
  ctx.fill();
  ctx.strokeStyle = '#6e5439';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#826545';
  ctx.fillRect(x + 6, y + 14, 88, 30);

  ctx.fillStyle = '#fbf7ee';
  ctx.fillRect(x + 14, y + 8, 26, 20);
  ctx.fillStyle = '#0e768a';
  ctx.fillRect(x + 50, y + 10, 18, 6);

  ctx.fillStyle = '#d8972b';
  ctx.beginPath();
  ctx.arc(x + 84, y + 12, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Kitaplık ve Materyal Dolabı Vektör Fallback (40, 150, 60, 85).
 */
function drawBookshelf(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();

  ctx.fillStyle = 'rgba(23, 43, 71, 0.16)';
  ctx.fillRect(x + 4, y + 82, 56, 10);

  ctx.fillStyle = '#6b5037';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, 60, 85, 4);
  } else {
    ctx.rect(x, y, 60, 85);
  }
  ctx.fill();
  ctx.strokeStyle = '#4a3521';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#9e805e';
  ctx.fillRect(x + 5, y + 26, 50, 4);
  ctx.fillRect(x + 5, y + 54, 50, 4);

  const bookColors = ['#0e768a', '#ba5734', '#21573c', '#d8972b', '#172b47'];

  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = bookColors[i % bookColors.length];
    ctx.fillRect(x + 8 + i * 9.5, y + 8, 7.5, 18);
  }

  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = bookColors[(i + 2) % bookColors.length];
    ctx.fillRect(x + 8 + i * 9.5, y + 34, 7.5, 20);
  }

  ctx.fillStyle = '#249ab0';
  ctx.beginPath();
  ctx.arc(x + 30, y + 69, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d8972b';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}

/**
 * Dört Öğrenme Masası Selçuklu Ahşap & Çini İsim Levhası:
 * Ahşap oyma kaide, sivri Selçuklu kemeri, turkuaz çini bordür, altın yaldızlı başlık ve durum rozeti.
 */
export function drawTablePlaque(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  topY: number,
  title: string,
  isCompleted: boolean = false,
  isNext: boolean = false,
  now: number = 0,
) {
  const w = 118;
  const h = 26;
  const x = centerX - w / 2;
  const y = topY;

  ctx.save();

  // 1. Zemin Yumuşak Masa Üstü Gölgesi
  ctx.fillStyle = 'rgba(23, 43, 71, 0.28)';
  ctx.beginPath();
  ctx.ellipse(centerX, y + h + 2, w / 2 + 4, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Selçuklu Masif Ahşap Kaide / Pano Gövdesi
  ctx.fillStyle = '#2b1b11';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, 5);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.fill();

  // 3. Selçuklu Altın Yaldızlı Ahşap Çerçeve
  ctx.strokeStyle = isNext ? '#f59e0b' : '#a67c52';
  ctx.lineWidth = isNext ? 2 : 1.5;
  ctx.stroke();

  // 4. Turkuaz Çini İç Bordür
  ctx.strokeStyle = '#0e768a';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);

  // 5. Üst Sivri Kemer Mukarnas Süsü
  ctx.fillStyle = '#0e768a';
  ctx.beginPath();
  ctx.moveTo(centerX - 16, y);
  if (ctx.quadraticCurveTo) {
    ctx.quadraticCurveTo(centerX, y - 7, centerX + 16, y);
  } else {
    ctx.lineTo(centerX, y - 7);
    ctx.lineTo(centerX + 16, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#d8972b';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Mini Selçuklu rozeti
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(centerX, y - 2, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // 6. Masa İsim Yazısı (Altın Yaldızlı & Okunaklı)
  ctx.fillStyle = isCompleted ? '#86efac' : isNext ? '#fef08a' : '#fbf2df';
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 1;
  ctx.fillText(title, centerX, y + h / 2 + 1);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // 7. Durum Rozeti (Sağ üst köşe)
  if (isCompleted) {
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(x + w - 6, y + 6, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 7px sans-serif';
    ctx.fillText('✓', x + w - 6, y + 6.5);
  } else if (isNext) {
    const pulse = Math.sin(now / 220) * 0.35 + 0.65;
    ctx.fillStyle = `rgba(245, 158, 11, ${pulse})`;
    ctx.beginPath();
    ctx.arc(x + w - 6, y + 6, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Öğrenci Sıraları Vektör Fallback (150 x 55 px).
 */
function drawStudentDesk(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  accentColor: string,
) {
  const w = 150;
  const h = 55;

  ctx.save();

  ctx.fillStyle = 'rgba(23, 43, 71, 0.16)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h + 8, w / 2 + 8, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#7a5e42';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x + 18, y - 10, 42, 12, 3);
    ctx.roundRect(x + 90, y - 10, 42, 12, 3);
  } else {
    ctx.rect(x + 18, y - 10, 42, 12);
    ctx.rect(x + 90, y - 10, 42, 12);
  }
  ctx.fill();

  ctx.fillStyle = '#c7b494';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, 6);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.fill();
  ctx.strokeStyle = '#947e60';
  ctx.lineWidth = 2.2;
  ctx.stroke();

  ctx.fillStyle = '#b5a181';
  ctx.fillRect(x + 6, y + 6, w - 12, 4);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 20, y + 16, 32, 26);
  ctx.fillStyle = accentColor;
  ctx.fillRect(x + 35, y + 16, 2, 26);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 98, y + 16, 32, 26);
  ctx.fillStyle = '#0e768a';
  ctx.fillRect(x + 113, y + 16, 2, 26);

  ctx.fillStyle = '#5c4532';
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, x + w / 2, y + 36);

  ctx.restore();
}

/**
 * Avluya Dönüş Kapısı (Güney Duvarı — width/2 - 45, height - 35).
 */
function drawExitDoor(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const doorX = width / 2 - 45;
  const doorY = height - 35;

  ctx.save();

  ctx.fillStyle = '#5a422e';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(doorX - 4, doorY, 98, 35, [10, 10, 0, 0]);
  } else {
    ctx.rect(doorX - 4, doorY, 98, 35);
  }
  ctx.fill();
  ctx.strokeStyle = '#d8972b';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#172b47';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(doorX, doorY + 4, 90, 31, [8, 8, 0, 0]);
  } else {
    ctx.rect(doorX, doorY + 4, 90, 31);
  }
  ctx.fill();

  ctx.fillStyle = '#d8972b';
  ctx.beginPath();
  ctx.arc(doorX + 38, doorY + 18, 3, 0, Math.PI * 2);
  ctx.arc(doorX + 52, doorY + 18, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Avluya Çıkış [E]', width / 2, doorY + 24);

  ctx.restore();
}

/**
 * Tavandan Sarkan Selçuklu Feneri
 */
function drawHangingCeilingLamp(
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

  const pulse = Math.sin(now / 500) * 0.08 + 0.22;
  if (typeof ctx.createRadialGradient === 'function') {
    const glowGrad = ctx.createRadialGradient(x, lampY + 12, 4, x, lampY + 12, 45);
    glowGrad.addColorStop(0, `rgba(255, 220, 130, ${pulse * 1.5})`);
    glowGrad.addColorStop(1, 'rgba(255, 220, 130, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(x, lampY + 12, 45, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#b8893b';
  ctx.beginPath();
  ctx.moveTo(x - 9, lampY);
  ctx.lineTo(x + 9, lampY);
  ctx.lineTo(x + 13, lampY + 14);
  ctx.lineTo(x, lampY + 26);
  ctx.lineTo(x - 13, lampY + 14);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#5a3d16';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.fillStyle = '#fff4ce';
  ctx.beginPath();
  ctx.arc(x, lampY + 12, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
