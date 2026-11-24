import type { SceneObstacle } from '@/src/features/walkable/types';

export type ObservatoryStationId =
  | 'observatory-area-earth-sun-moon'
  | 'observatory-area-solar-system'
  | 'observatory-area-stars-constellations'
  | 'observatory-area-galaxies-space'
  | 'observatory-center-solar-system'
  | 'observatory-telescope';

export type ObservatoryStationKind =
  | 'discovery-area'
  | 'center-solar-system'
  | 'telescope';

export interface ObservatoryCloseUpCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ObservatoryStationDefinition {
  id: ObservatoryStationId;
  kind: ObservatoryStationKind;
  badgeLabel: string;
  title: string;
  prompt: string;
  hasActivity?: boolean;
  comingSoon?: boolean;
  summary: string;
  scientificFacts: readonly string[];
  representativeNotice?: string;
  closeUpCrop?: ObservatoryCloseUpCrop;
  interaction: {
    x: number;
    y: number;
    radius: number;
  };
  archLabel?: {
    x: number;
    y: number;
    width: number;
    lines: readonly string[];
    fontSize: number;
  };
}

export const OBSERVATORY_CLASSROOM = {
  width: 1024,
  height: 576,
  title: 'Yerden Göklere',
  titleLines: ['Yerden', 'Göklere'] as const,
  subtitle: 'Uzayı Keşfediyorum',
  playerSpawn: { x: 375, y: 500 },
  courtyardReturnPos: { x: 342, y: 722 },
  exitDoor: {
    id: 'observatory-exit-door',
    name: 'Avluya Dönüş Kapısı',
    prompt: 'Avluya Dön',
    x: 375,
    y: 554,
    radius: 32,
  },
  solarTableOverlay: {
    x: 272,
    y: 320,
    width: 480,
    height: 218,
    depthSplitY: 455,
  },
  headerPlacement: {
    titleCenterX: 518,
    titleTopY: 149,
    subtitleCenterX: 518,
    subtitleTopY: 194,
  },
  centerPodiumPlacement: {
    titleCenterX: 512,
    titleTopY: 414,
    representativeCenterX: 512,
    representativeTopY: 453,
    representativeLabel: 'Temsilî gösterim',
  },
} as const;

/**
 * Yerden Göklere gözlemevi sınıfındaki dört keşif alanı, merkezî Güneş Sistemi
 * ve pirinç teleskop gözlem noktası (her biri ileride bağımsız etkinlikler eklenebilecek
 * ayrı içerik kimlikleriyle tanımlıdır).
 */
export const OBSERVATORY_STATIONS: readonly ObservatoryStationDefinition[] = [
  {
    id: 'observatory-area-earth-sun-moon',
    kind: 'discovery-area',
    badgeLabel: 'Keşif Alanı 1',
    title: 'Dünya, Güneş ve Ay',
    prompt: 'Dünya, Güneş ve Ay — Keşfet [E]',
    hasActivity: true,
    summary:
      'Bu bölümde Dünya’yı, ısı ve ışık kaynağımız Güneş’i ve Dünya’mızın çevresinde dolanan Ay’ı yakından tanırsın.',
    scientificFacts: [
      'Güneş bir gezegen değil, Dünya’ya en yakın yıldızdır.',
      'Ay, Dünya’nın doğal uydusudur.',
      'Dünya kendi ekseni etrafında döner ve Güneş’in çevresinde dolanır.',
    ],
    closeUpCrop: { x: 38, y: 210, width: 148, height: 168 },
    interaction: { x: 178, y: 422, radius: 66 },
    archLabel: {
      x: 111,
      y: 228,
      width: 88,
      lines: ['Dünya,', 'Güneş ve Ay'],
      fontSize: 12.5,
    },
  },
  {
    id: 'observatory-area-solar-system',
    kind: 'discovery-area',
    badgeLabel: 'Keşif Alanı 2',
    title: 'Güneş Sistemi',
    prompt: 'Güneş Sistemi — Keşfet [E]',
    comingSoon: true,
    summary:
      'Bu bölümde merkezdeki Güneş’i ve onun çevresinde dolanan sekiz gezegeni sırasıyla keşfedersin.',
    scientificFacts: [
      'Güneş bir yıldızdır ve Güneş Sistemi’nin merkezinde yer alır.',
      'Güneş Sistemi’nde sekiz gezegen bulunur: Merkür, Venüs, Dünya, Mars, Jüpiter, Satürn, Uranüs ve Neptün.',
    ],
    representativeNotice:
      'Temsilî gösterim: Gezegenlerin büyüklükleri ve birbirine uzaklıkları gerçek ölçekte değildir.',
    closeUpCrop: { x: 204, y: 226, width: 142, height: 142 },
    interaction: { x: 278, y: 384, radius: 62 },
    archLabel: {
      x: 282,
      y: 249,
      width: 72,
      lines: ['Güneş', 'Sistemi'],
      fontSize: 12,
    },
  },
  {
    id: 'observatory-area-stars-constellations',
    kind: 'discovery-area',
    badgeLabel: 'Keşif Alanı 3',
    title: 'Yıldızlar ve Takımyıldızları',
    prompt: 'Yıldızlar ve Takımyıldızları — Keşfet [E]',
    comingSoon: true,
    summary:
      'Bu bölümde gece gökyüzündeki parlak yıldızları ve gökyüzünde oluşturdukları takımyıldız örüntülerini gözlemlersin.',
    scientificFacts: [
      'Yıldızlar kendi ışığını ve ısısını üreten gök cisimleridir.',
      'Gökyüzünde bir arada görülen yıldız gruplarına takımyıldızı denir.',
    ],
    closeUpCrop: { x: 678, y: 226, width: 140, height: 142 },
    interaction: { x: 746, y: 384, radius: 62 },
    archLabel: {
      x: 744,
      y: 248,
      width: 96,
      lines: ['Yıldızlar', 've Takımyıldızları'],
      fontSize: 10.5,
    },
  },
  {
    id: 'observatory-area-galaxies-space',
    kind: 'discovery-area',
    badgeLabel: 'Keşif Alanı 4',
    title: 'Galaksiler ve Uzay',
    prompt: 'Galaksiler ve Uzay — Keşfet [E]',
    comingSoon: true,
    summary:
      'Bu bölümde Güneş Sistemimizin içinde bulunduğu Samanyolu Galaksisi’ni ve uzaydaki diğer galaksileri tanırsın.',
    scientificFacts: [
      'Galaksiler milyarlarca yıldız, gezegen ve kozmik tozdan oluşur.',
      'Güneş Sistemi, sarmal yapılı Samanyolu Galaksisi’nin içinde yer alır.',
    ],
    closeUpCrop: { x: 842, y: 204, width: 144, height: 170 },
    interaction: { x: 846, y: 422, radius: 66 },
    archLabel: {
      x: 912,
      y: 224,
      width: 90,
      lines: ['Galaksiler', 've Uzay'],
      fontSize: 12.5,
    },
  },
  {
    id: 'observatory-center-solar-system',
    kind: 'center-solar-system',
    badgeLabel: 'Merkezî Düzenek',
    title: 'Güneş Sistemi',
    prompt: 'Merkezî Güneş Sistemi — Keşfet [E]',
    summary:
      'Gözlemevinin merkezindeki bu düzenekte parlak Güneş ve çevresinde sekiz gezegen bir arada gösterilmektedir.',
    scientificFacts: [
      'Güneş bir yıldızdır, gezegen değildir.',
      'Güneş Sistemi’nde sekiz gezegen bulunur: Merkür, Venüs, Dünya, Mars, Jüpiter, Satürn, Uranüs ve Neptün.',
      'Ay, Dünya’nın doğal uydusudur.',
    ],
    representativeNotice:
      'Temsilî gösterim: Merkezî düzenekteki gezegen boyutları ve yörünge uzaklıkları görsel inceleme amacıyla temsilî olarak düzenlenmiştir.',
    closeUpCrop: { x: 280, y: 324, width: 464, height: 176 },
    interaction: { x: 512, y: 540, radius: 52 },
  },
  {
    id: 'observatory-telescope',
    kind: 'telescope',
    badgeLabel: 'Gözlem Noktası',
    title: 'Pirinç Teleskop',
    prompt: 'Pirinç Teleskop — Keşfet [E]',
    summary:
      'Gözlem pencerelerinin önündeki pirinç teleskop, gece gökyüzündeki Ay’ı, gezegenleri ve yıldızları daha yakından incelemek için hazırlanmıştır.',
    scientificFacts: [
      'Teleskoplar uzaktaki gök cisimlerinden gelen ışığı toplayarak ayrıntıları görmemize yardımcı olur.',
      'Ay, Dünya’mıza en yakın gök cismidir ve teleskopla yüzeyindeki kraterler seçilebilir.',
    ],
    closeUpCrop: { x: 546, y: 256, width: 120, height: 112 },
    interaction: { x: 608, y: 366, radius: 58 },
  },
] as const;

/**
 * Gözlemevi iç mekân çarpışma engelleri (1024 × 576 gerçek zemin geometrisi ve A* 25px ızgarası ile tam uyumlu).
 * Merkezî oval Güneş Sistemi düzeneği iki kademeli AABB ile sarılarak ön-sol ve ön-sağ geçişler
 * tamamen açık bırakılmıştır; öğrenci dört panoya, teleskoba ve düzenek çevresine kesintisiz ulaşabilir.
 */
export const OBSERVATORY_CLASSROOM_OBSTACLES: readonly SceneObstacle[] = [
  // Arka kemerli duvar, pencereler ve pencere önü sediri (y = 362.5 arka koridoru tamamen açık kalır)
  { id: 'obs-back-wall', name: 'Gözlemevi Arka Duvarı', x: 0, y: 0, width: 1024, height: 356 },
  // Sol kenar kitaplık ve saksı
  { id: 'obs-left-wall', name: 'Sol Kitaplık', x: 0, y: 356, width: 112, height: 132 },
  // Sol alt okuma masası ve yer minderleri (ön-sol geçiş yolu açık bırakılır)
  { id: 'obs-left-table', name: 'Sol Okuma Masası', x: 0, y: 488, width: 210, height: 88 },
  { id: 'obs-left-poufs', name: 'Sol Minderler', x: 210, y: 508, width: 96, height: 68 },
  // Sağ kenar kitaplık ve usturlap kaidesi
  { id: 'obs-right-wall', name: 'Sağ Kitaplık', x: 912, y: 356, width: 112, height: 132 },
  // Sağ alt minderler ve dinlenme köşesi (ön-sağ geçiş yolu açık bırakılır)
  { id: 'obs-right-poufs', name: 'Sağ Minderler', x: 718, y: 508, width: 102, height: 68 },
  { id: 'obs-right-sofa', name: 'Sağ Dinlenme Köşesi', x: 820, y: 488, width: 204, height: 88 },
  // Merkezî oval Güneş Sistemi düzeneği (oval eğime uygun iki kademeli çarpışma alanı)
  { id: 'obs-solar-table-mid', name: 'Merkezî Güneş Sistemi', x: 296, y: 408, width: 432, height: 50 },
  { id: 'obs-solar-table-core', name: 'Merkezî Güneş Sistemi Kaidesi', x: 344, y: 394, width: 336, height: 84 },
  // Merkezî Güneş Sistemi ön bilgi kürsüsü (y = 537.5 ön geçiş koridoru tamamen açık kalır)
  { id: 'obs-solar-podium', name: 'Güneş Sistemi Bilgi Kürsüsü', x: 434, y: 478, width: 156, height: 52 },
];
