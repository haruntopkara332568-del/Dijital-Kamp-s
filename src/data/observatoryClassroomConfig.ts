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

export interface ObservatoryStationDefinition {
  id: ObservatoryStationId;
  kind: ObservatoryStationKind;
  badgeLabel: string;
  title: string;
  prompt: string;
  summary: string;
  scientificFacts: readonly string[];
  representativeNotice?: string;
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
    titleTopY: 158,
    subtitleCenterX: 518,
    subtitleTopY: 193,
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
    prompt: 'Dünya, Güneş ve Ay Alanını İncele',
    summary:
      'Bu bölümde Dünya’yı, ısı ve ışık kaynağımız Güneş’i ve Dünya’mızın çevresinde dolanan Ay’ı yakından tanırsın.',
    scientificFacts: [
      'Güneş bir gezegen değil, Dünya’ya en yakın yıldızdır.',
      'Ay, Dünya’nın doğal uydusudur.',
      'Dünya kendi ekseni etrafında döner ve Güneş’in çevresinde dolanır.',
    ],
    interaction: { x: 188, y: 424, radius: 52 },
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
    prompt: 'Güneş Sistemi Alanını İncele',
    summary:
      'Bu bölümde merkezdeki Güneş’i ve onun çevresinde dolanan sekiz gezegeni sırasıyla keşfedersin.',
    scientificFacts: [
      'Güneş bir yıldızdır ve Güneş Sistemi’nin merkezinde yer alır.',
      'Güneş Sistemi’nde sekiz gezegen bulunur: Merkür, Venüs, Dünya, Mars, Jüpiter, Satürn, Uranüs ve Neptün.',
    ],
    representativeNotice:
      'Temsilî gösterim: Gezegenlerin büyüklükleri ve birbirine uzaklıkları gerçek ölçekte değildir.',
    interaction: { x: 266, y: 396, radius: 48 },
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
    prompt: 'Yıldızlar ve Takımyıldızları Alanını İncele',
    summary:
      'Bu bölümde gece gökyüzündeki parlak yıldızları ve gökyüzünde oluşturdukları takımyıldız örüntülerini gözlemlersin.',
    scientificFacts: [
      'Yıldızlar kendi ışığını ve ısısını üreten gök cisimleridir.',
      'Gökyüzünde bir arada görülen yıldız gruplarına takımyıldızı denir.',
    ],
    interaction: { x: 758, y: 396, radius: 48 },
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
    prompt: 'Galaksiler ve Uzay Alanını İncele',
    summary:
      'Bu bölümde Güneş Sistemimizin içinde bulunduğu Samanyolu Galaksisi’ni ve uzaydaki diğer galaksileri tanırsın.',
    scientificFacts: [
      'Galaksiler milyarlarca yıldız, gezegen ve kozmik tozdan oluşur.',
      'Güneş Sistemi, sarmal yapılı Samanyolu Galaksisi’nin içinde yer alır.',
    ],
    interaction: { x: 836, y: 424, radius: 52 },
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
    prompt: 'Merkezî Güneş Sistemi Düzeneğini İncele',
    summary:
      'Gözlemevinin merkezindeki bu düzenekte parlak Güneş ve çevresinde sekiz gezegen bir arada gösterilmektedir.',
    scientificFacts: [
      'Güneş bir yıldızdır, gezegen değildir.',
      'Güneş Sistemi’nde sekiz gezegen bulunur: Merkür, Venüs, Dünya, Mars, Jüpiter, Satürn, Uranüs ve Neptün.',
      'Ay, Dünya’nın doğal uydusudur.',
    ],
    representativeNotice:
      'Temsilî gösterim: Merkezî düzenekteki gezegen boyutları ve yörünge uzaklıkları görsel inceleme amacıyla temsilî olarak düzenlenmiştir.',
    interaction: { x: 512, y: 540, radius: 44 },
  },
  {
    id: 'observatory-telescope',
    kind: 'telescope',
    badgeLabel: 'Gözlem Noktası',
    title: 'Pirinç Teleskop',
    prompt: 'Pirinç Teleskop Alanını İncele',
    summary:
      'Gözlem pencerelerinin önündeki pirinç teleskop, gece gökyüzündeki Ay’ı, gezegenleri ve yıldızları daha yakından incelemek için hazırlanmıştır.',
    scientificFacts: [
      'Teleskoplar uzaktaki gök cisimlerinden gelen ışığı toplayarak ayrıntıları görmemize yardımcı olur.',
      'Ay, Dünya’mıza en yakın gök cismidir ve teleskopla yüzeyindeki kraterler seçilebilir.',
    ],
    interaction: { x: 615, y: 366, radius: 50 },
  },
] as const;

/**
 * Gözlemevi iç mekân çarpışma engelleri (1024 × 576 görsel perspektifi ve A* 25px ızgarası ile uyumlu).
 * Merkezî Güneş Sistemi düzeneğinin önünden, arkasından (teleskoba kadar), sağından ve solundan
 * serbestçe dolaşılabilmesi için yürüme koridorları tamamen açık bırakılmıştır.
 */
export const OBSERVATORY_CLASSROOM_OBSTACLES: readonly SceneObstacle[] = [
  // Arka kemerli duvar, pencereler ve pencere önü sediri (y = 362.5 arka yürüyüş koridoru açık kalır)
  { id: 'obs-back-wall', name: 'Gözlemevi Arka Duvarı', x: 0, y: 0, width: 1024, height: 364 },
  // Sol kitaplık, saksı ve sol keşif ekranı kaidesi
  { id: 'obs-left-kiosk', name: 'Sol Keşif Standı', x: 0, y: 364, width: 174, height: 112 },
  // Sol ön plan usturlap masası ve yer minderleri
  { id: 'obs-left-foreground', name: 'Sol Okuma Köşesi', x: 0, y: 476, width: 320, height: 100 },
  // Sağ kitaplık, usturlap kaidesi ve sağ keşif ekranı kaidesi
  { id: 'obs-right-kiosk', name: 'Sağ Keşif Standı', x: 850, y: 364, width: 174, height: 112 },
  // Sağ ön plan minderler ve dinlenme köşesi
  { id: 'obs-right-foreground', name: 'Sağ Dinlenme Köşesi', x: 704, y: 476, width: 320, height: 100 },
  // Merkezî dairesel Güneş Sistemi düzeneği
  { id: 'obs-solar-table', name: 'Merkezî Güneş Sistemi', x: 292, y: 394, width: 440, height: 92 },
  // Merkezî Güneş Sistemi ön bilgi kürsüsü (y = 537.5 ön geçiş koridoru açık kalır)
  { id: 'obs-solar-podium', name: 'Güneş Sistemi Bilgi Kürsüsü', x: 432, y: 486, width: 160, height: 48 },
];
