/**
 * Hayalden Gerçeğe — Mimar Deneyimi: Köşkü Tamamla (Sürüm 2) Yapılandırma Dosyası
 *
 * Tüm sayısal ayarlar (süreler, ölçekler, yuva çokgenleri, kırpma bölgeleri) burada toplanmıştır.
 * İnce ayar noktaları "ELLE AYARLANACAK" veya "ELLE DOĞRULANACAK" yorumu ile işaretlenmiştir.
 */

import type {
  DoorPatternId,
  OrnamentPatternId,
  WindowPatternId,
} from '@/src/features/walkable/engine/seljukPatternGenerator';

/** Tüm Mimar deneyimi (Parça 1 + Parça 2) için tek durum makinesi */
export type ArchitectFlowState =
  | 'MIMAR_INTRO'
  | 'STEP_DOOR'
  | 'STEP_WINDOW'
  | 'STEP_ROOF'
  | 'STEP_ORNAMENT'
  | 'BUILD_DONE'
  | 'ENTER_WALK'
  | 'INTERIOR_WALK'
  | 'CLOSING'
  | 'DONE';

export type ArchitectBuildStep = 'STEP_DOOR' | 'STEP_WINDOW' | 'STEP_ROOF' | 'STEP_ORNAMENT';

export type RoofOptionId = 'kubbe' | 'konik-kulah' | 'piramit-cati';

export interface PercentPoint {
  /** Gövde tuval genişliğine göre yüzde (0..100) */
  x: number;
  /** Gövde tuval yüksekliğine göre yüzde (0..100) */
  y: number;
}

export type PercentQuad = readonly [PercentPoint, PercentPoint, PercentPoint, PercentPoint];

export interface CropRegionPercent {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ArchitectSelections {
  door: DoorPatternId | null;
  window: WindowPatternId | null;
  roof: RoofOptionId | null;
  ornament: OrnamentPatternId | null;
}

export interface BuildOptionSpec<T extends string = string> {
  id: T;
  label: string;
  /** Seçenek kartı önizlemesinde gösterilecek gövde tuvali kırpma bölgesi (%) — ELLE AYARLANACAK */
  crop: CropRegionPercent;
}

export const ARCHITECT_ASSETS = {
  body: '/assets/walkable/architect/pavilion-body.webp',
  roofs: {
    kubbe: '/assets/walkable/architect/roof-dome.webp',
    'konik-kulah': '/assets/walkable/architect/roof-kumbet.webp',
    'piramit-cati': '/assets/walkable/architect/roof-pyramid.webp',
  } as Record<RoofOptionId, string>,
  architect: '/assets/walkable/architect/mimar-character.webp',
  interiorBg: '/assets/walkable/architect/pavilion-interior-bg.webp',
  audio: {
    intro: '/assets/walkable/architect/mimar-intro.mp3',
    closing: '/assets/walkable/architect/mimar-closing.mp3',
  },
} as const;

export const ARCHITECT_DIALOGUE = {
  introText: 'Merhaba, ben mimarım! Eksik parçaları sen seç, köşkü birlikte tamamlayalım.',
  closingText: 'Köşkü sen tamamladın! Bir mimar gibi düşündün.',
} as const;

export const ARCHITECT_STEP_INSTRUCTIONS: Record<ArchitectBuildStep, string> = {
  STEP_DOOR: '1/4 — Giriş kapısını seç.',
  STEP_WINDOW: '2/4 — Pencere desenini seç.',
  STEP_ROOF: '3/4 — Çatıyı seç.',
  STEP_ORNAMENT: '4/4 — Süsleme desenini seç.',
} as const;

export const ARCHITECT_UI_LABELS = {
  place: 'Yerleştir',
  restart: 'Yeniden Başla',
  returnToClass: 'Sınıfa Dön',
  architectSpeaker: 'Mimar',
  sceneHeader: 'Mimar · Köşkü Tamamla',
  completedStatus: 'Köşk tamamlandı!',
  interiorWalkInstruction: 'İşaretli noktaya yürü.',
} as const;

export const ARCHITECT_TIMINGS = {
  /** Parça yerleştirme oturma animasyonu (ms, 300 ms altı) — ELLE AYARLANACAK */
  partSettleDurationMs: 250,
  /** Hareketi azaltma açıkken oturma animasyonu (ms) — ELLE AYARLANACAK */
  partSettleReducedMs: 80,
  /** Parça oturma bekçi zamanlayıcısı (ms) — ELLE AYARLANACAK */
  partSettleWatchdogMs: 1200,
  /** Köşk tamamlanınca sol-sağ ışık geçişi süresi (ms) — ELLE AYARLANACAK */
  buildDoneSweepMs: 2500,
  /** Hareketi azaltma açıkken tamamlama parlama süresi (ms) — ELLE AYARLANACAK */
  buildDoneSweepReducedMs: 450,
  /** Işık geçişi bekçi zamanlayıcısı (ms) — ELLE AYARLANACAK */
  buildDoneWatchdogMs: 4500,
  /** Kapıdan içeri otomatik yürüyüş süresi (ms, en fazla 6000 ms) — ELLE AYARLANACAK */
  enterWalkDurationMs: 4200,
  /** Hareketi azaltma açıkken kapıdan giriş süresi (ms) — ELLE AYARLANACAK */
  enterWalkReducedMs: 750,
  /** Kapıdan giriş bekçi zamanlayıcısı (ms, 10 sn) — ELLE AYARLANACAK */
  enterWalkWatchdogMs: 10000,
  /** İç mekân sahne giriş aydınlanma süresi (ms) — ELLE AYARLANACAK */
  interiorFadeInMs: 420,
  /** Ses tahmini okuma hızı: karakter başına ms — ELLE AYARLANACAK */
  speechMsPerChar: 90,
  /** Ses tahmini en az bekleme süresi (ms) — ELLE AYARLANACAK */
  speechMinDurationMs: 2000,
  /** `onend` gelmezse bekçi çarpanı (1.5×) — ELLE AYARLANACAK */
  speechWatchdogMultiplier: 1.5,
  /** Kapı yüksekliği / öğrenci boyu oranı (2.2–2.5 arası) — ELLE AYARLANACAK */
  doorToStudentHeightRatio: 2.35,
  /** Kapıya yürürken en fazla derinlik küçülme oranı (%10) — ELLE AYARLANACAK */
  enterWalkMaxShrink: 0.10,
} as const;

/**
 * Gövde tuvali (1200×1200) üzerinde yüzde koordinatlı yuva çokgenleri.
 * Geliştirme modunda `?debug=kosk` ile yarı saydam olarak doğrulanabilir.
 */
export const PAVILION_SLOTS = {
  /** Ana giriş kapısı açıklığı (%) — ELLE DOĞRULANACAK */
  doorPolygon: [
    { x: 45.3, y: 76.2 },
    { x: 54.6, y: 76.2 },
    { x: 54.6, y: 92.3 },
    { x: 45.3, y: 92.3 },
  ] as readonly PercentPoint[],

  /** Tamburdaki görünen 3 sivri kemerli pencere yuvası (%) — ELLE DOĞRULANACAK */
  windowPolygons: [
    // Sol tambur penceresi
    [
      { x: 32.3, y: 57.1 },
      { x: 32.3, y: 50.8 },
      { x: 33.1, y: 48.7 },
      { x: 34.1, y: 47.9 },
      { x: 35.1, y: 49.0 },
      { x: 35.6, y: 51.0 },
      { x: 35.6, y: 57.1 },
    ],
    // Orta tambur penceresi
    [
      { x: 47.2, y: 56.6 },
      { x: 47.2, y: 50.2 },
      { x: 48.3, y: 48.0 },
      { x: 50.0, y: 46.9 },
      { x: 51.7, y: 48.0 },
      { x: 52.8, y: 50.2 },
      { x: 52.8, y: 56.6 },
    ],
    // Sağ tambur penceresi
    [
      { x: 64.4, y: 57.1 },
      { x: 64.4, y: 51.0 },
      { x: 64.9, y: 49.0 },
      { x: 65.9, y: 47.9 },
      { x: 66.9, y: 48.7 },
      { x: 67.6, y: 50.8 },
      { x: 67.6, y: 57.1 },
    ],
  ] as readonly (readonly PercentPoint[])[],

  /** Üst korniş friz şeritleri ([solÜst, sağÜst, sağAlt, solAlt], %) — ELLE DOĞRULANACAK */
  friezeQuads: [
    // Sol eğik cephe frizi
    [
      { x: 22.3, y: 61.9 },
      { x: 35.1, y: 60.5 },
      { x: 35.1, y: 62.6 },
      { x: 22.3, y: 63.9 },
    ],
    // Orta ön cephe frizi
    [
      { x: 36.1, y: 60.5 },
      { x: 63.9, y: 60.5 },
      { x: 63.9, y: 62.6 },
      { x: 36.1, y: 62.6 },
    ],
    // Sağ eğik cephe frizi
    [
      { x: 64.9, y: 60.5 },
      { x: 77.7, y: 61.9 },
      { x: 77.7, y: 63.9 },
      { x: 64.9, y: 62.6 },
    ],
  ] as readonly PercentQuad[],

  /** Tambur üst kenarı çatı oturuş referans bandı (%) — ELLE DOĞRULANACAK */
  roofSeatBox: {
    x: 28.4,
    y: 41.9,
    w: 43.1,
    h: 4.5,
  },
} as const;

export const ARCHITECT_SCENE_LAYOUT = {
  /** Gövde görselinin dış mekân sahnesinde kaplayacağı yükseklik oranları — ELLE AYARLANACAK */
  desktopPavilionHeightRatio: 0.68,
  mobilePavilionHeightRatio: 0.44,
  /** Masaüstü ve mobilde köşkün dikey orta noktası — ELLE AYARLANACAK */
  desktopPavilionCenterYRatio: 0.48,
  mobilePavilionCenterYRatio: 0.43,
  /** Mimar karakterinin köşk yüksekliğine göre boy oranı — ELLE AYARLANACAK */
  architectHeightToPavilionRatio: 0.36,
  /** Mimar karakterinin köşk merkezine göre yatay konumu (köşk genişliği çarpanı) — ELLE AYARLANACAK */
  architectOffsetXFactor: -0.44,
  /** Zemin ufuk çizgisi oranı — ELLE AYARLANACAK */
  horizonRatioDesktop: 0.72,
  horizonRatioMobile: 0.62,
} as const;

/**
 * Parça 2 — İç Mekân (2.5D Göz Hizası Sekizgen Hacim) Yapılandırması
 * Dünya ölçüleri: 1280×720 px (`pavilion-interior-bg.webp` ile birebir oran)
 */
export const ARCHITECT_INTERIOR = {
  /** İç mekân dünya genişliği ve yüksekliği (px) — ELLE AYARLANACAK */
  worldWidth: 1280,
  worldHeight: 720,
  /** Giriş doğuş noktası (kapı iç tarafı, önü açık) — ELLE AYARLANACAK */
  entrySpawn: { x: 245, y: 646 },
  /** Zemin yıldız mozaik hedef noktası — ELLE AYARLANACAK */
  targetMarker: { x: 770, y: 632, radius: 34 },
  /** İç mekân öğrenci karakter boyutu ve yürüyüş hızı — ELLE AYARLANACAK */
  studentWidthPx: 74,
  studentHeightPx: 94,
  studentSpeedPx: 215,
  /** Hedef yaklaşma histerezisi (öğrenci boyu katı: giriş 1.5, çıkış 2.0) — ELLE AYARLANACAK */
  markerEnterHeightRatio: 1.5,
  markerExitHeightRatio: 2.0,
  /** Kamera yumuşak takip katsayısı ve sınırları — ELLE AYARLANACAK */
  cameraLerp: 0.12,
  cameraBounds: { minX: 0, minY: 0, maxX: 1280, maxY: 720 },

  /** Yürünebilir zemin çokgeni (dünya px, saat yönünde konveks sekizgen taban) — ELLE DOĞRULANACAK */
  walkablePolygon: [
    { x: 78, y: 618 },
    { x: 432, y: 568 },
    { x: 848, y: 568 },
    { x: 1202, y: 618 },
    { x: 1230, y: 696 },
    { x: 50, y: 696 },
  ] as readonly PercentPoint[],

  /** İç mekân 3 üst pencere yuvası (1280×720 görsele göre %) — ELLE DOĞRULANACAK */
  windowPolygons: [
    // Sol üst pencere
    [
      { x: 16.5, y: 27.6 },
      { x: 16.5, y: 11.4 },
      { x: 17.6, y: 6.4 },
      { x: 19.5, y: 4.3 },
      { x: 22.1, y: 7.4 },
      { x: 23.6, y: 13.8 },
      { x: 23.6, y: 29.0 },
    ],
    // Orta üst pencere
    [
      { x: 45.6, y: 32.3 },
      { x: 45.6, y: 18.0 },
      { x: 46.8, y: 13.0 },
      { x: 50.0, y: 10.2 },
      { x: 53.2, y: 13.0 },
      { x: 54.4, y: 18.0 },
      { x: 54.4, y: 32.3 },
    ],
    // Sağ üst pencere
    [
      { x: 76.4, y: 29.0 },
      { x: 76.4, y: 13.8 },
      { x: 77.9, y: 7.4 },
      { x: 80.5, y: 4.3 },
      { x: 82.4, y: 6.4 },
      { x: 83.5, y: 11.4 },
      { x: 83.5, y: 27.6 },
    ],
  ] as readonly (readonly PercentPoint[])[],

  /** İç mekân 3 korniş friz şeridi ([solÜst, sağÜst, sağAlt, solAlt], %) — ELLE DOĞRULANACAK */
  friezeQuads: [
    // Sol duvar frizi
    [
      { x: 7.4, y: 27.8 },
      { x: 33.1, y: 33.4 },
      { x: 33.1, y: 44.0 },
      { x: 7.4, y: 40.2 },
    ],
    // Orta duvar frizi
    [
      { x: 36.8, y: 34.4 },
      { x: 63.2, y: 34.4 },
      { x: 63.2, y: 44.2 },
      { x: 36.8, y: 44.2 },
    ],
    // Sağ duvar frizi
    [
      { x: 66.9, y: 33.4 },
      { x: 92.6, y: 27.8 },
      { x: 92.6, y: 40.2 },
      { x: 66.9, y: 44.0 },
    ],
  ] as readonly PercentQuad[],
} as const;

export const DOOR_OPTIONS: readonly BuildOptionSpec<DoorPatternId>[] = [
  {
    id: 'yildizli-kafes',
    label: 'Yıldızlı kafes',
    crop: { x: 40, y: 68, w: 20, h: 27 }, // ELLE AYARLANACAK
  },
  {
    id: 'gecmeli-kafes',
    label: 'Geçmeli kafes',
    crop: { x: 40, y: 68, w: 20, h: 27 }, // ELLE AYARLANACAK
  },
  {
    id: 'cizgili-kafes',
    label: 'Çizgili kafes',
    crop: { x: 40, y: 68, w: 20, h: 27 }, // ELLE AYARLANACAK
  },
] as const;

export const WINDOW_OPTIONS: readonly BuildOptionSpec<WindowPatternId>[] = [
  {
    id: 'yildizli',
    label: 'Yıldızlı',
    crop: { x: 43, y: 44, w: 14, h: 15 }, // ELLE AYARLANACAK
  },
  {
    id: 'cicekli',
    label: 'Çiçekli',
    crop: { x: 43, y: 44, w: 14, h: 15 }, // ELLE AYARLANACAK
  },
  {
    id: 'gecmeli',
    label: 'Geçmeli',
    crop: { x: 43, y: 44, w: 14, h: 15 }, // ELLE AYARLANACAK
  },
] as const;

export const ROOF_OPTIONS: readonly BuildOptionSpec<RoofOptionId>[] = [
  {
    id: 'kubbe',
    label: 'Kubbe',
    crop: { x: 25, y: 6, w: 50, h: 48 }, // ELLE AYARLANACAK
  },
  {
    id: 'konik-kulah',
    label: 'Konik külah',
    crop: { x: 24, y: 4, w: 52, h: 50 }, // ELLE AYARLANACAK
  },
  {
    id: 'piramit-cati',
    label: 'Piramit çatı',
    crop: { x: 24, y: 12, w: 52, h: 44 }, // ELLE AYARLANACAK
  },
] as const;

export const ORNAMENT_OPTIONS: readonly BuildOptionSpec<OrnamentPatternId>[] = [
  {
    id: 'yildiz-dizisi',
    label: 'Yıldız dizisi',
    crop: { x: 35, y: 56, w: 30, h: 11 }, // ELLE AYARLANACAK
  },
  {
    id: 'gecme-serit',
    label: 'Geçme şerit',
    crop: { x: 35, y: 56, w: 30, h: 11 }, // ELLE AYARLANACAK
  },
  {
    id: 'zikzak-serit',
    label: 'Zikzak şerit',
    crop: { x: 35, y: 56, w: 30, h: 11 }, // ELLE AYARLANACAK
  },
] as const;

export function createEmptySelections(): ArchitectSelections {
  return {
    door: null,
    window: null,
    roof: null,
    ornament: null,
  };
}

export function isBuildStep(state: ArchitectFlowState): state is ArchitectBuildStep {
  return (
    state === 'STEP_DOOR' ||
    state === 'STEP_WINDOW' ||
    state === 'STEP_ROOF' ||
    state === 'STEP_ORNAMENT'
  );
}

export function getNextState(state: ArchitectFlowState): ArchitectFlowState | null {
  switch (state) {
    case 'MIMAR_INTRO':
      return 'STEP_DOOR';
    case 'STEP_DOOR':
      return 'STEP_WINDOW';
    case 'STEP_WINDOW':
      return 'STEP_ROOF';
    case 'STEP_ROOF':
      return 'STEP_ORNAMENT';
    case 'STEP_ORNAMENT':
      return 'BUILD_DONE';
    case 'BUILD_DONE':
      return 'ENTER_WALK';
    case 'ENTER_WALK':
      return 'INTERIOR_WALK';
    case 'INTERIOR_WALK':
      return 'CLOSING';
    case 'CLOSING':
      return 'DONE';
    case 'DONE':
      return null;
  }
}

export function estimateSpeechDurationMs(text: string): number {
  return Math.max(
    ARCHITECT_TIMINGS.speechMinDurationMs,
    text.length * ARCHITECT_TIMINGS.speechMsPerChar,
  );
}

/** Geliştirme modunda `?debug=kosk` kontrolü */
export function isKoskDebugEnabled(): boolean {
  if (!import.meta.env.DEV || typeof window === 'undefined') return false;
  try {
    return new URLSearchParams(window.location.search).get('debug') === 'kosk';
  } catch {
    return false;
  }
}
