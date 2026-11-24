import type { SupportedGrade } from '@/src/types/campus';

export type CelestialBodyId = 'sun' | 'earth' | 'moon';
export type CelestialCategoryId = 'star' | 'planet' | 'natural-satellite';

export const EARTH_SUN_MOON_ACTIVITY_ID = 'yerden-goklere-dunya-gunes-ay';
export const EARTH_SUN_MOON_ACTIVITY_VERSION = '1.0';

export const CELESTIAL_BODY_ORDER: readonly CelestialBodyId[] = ['sun', 'earth', 'moon'] as const;

export interface CelestialGradeContent {
  summary: string;
  keyPoints: readonly string[];
  focusBadge: string;
  spokenText: string;
}

export interface CelestialBodyDefinition {
  id: CelestialBodyId;
  name: string;
  categoryId: CelestialCategoryId;
  categoryLabel: string;
  coreFact: string;
  visualFeatureLabel: string;
  accentHex: string;
  matchHint: string;
  matchSuccess: string;
  byGrade: Record<SupportedGrade, CelestialGradeContent>;
}

export interface EarthSunMoonMatchOption {
  id: CelestialCategoryId;
  label: string;
}

export const EARTH_SUN_MOON_MATCH_OPTIONS: readonly EarthSunMoonMatchOption[] = [
  { id: 'star', label: 'Yıldız' },
  { id: 'planet', label: 'Gezegen' },
  { id: 'natural-satellite', label: 'Doğal uydu' },
] as const;

export const EARTH_SUN_MOON_UI_COPY = {
  modalTitle: "Dünya, Güneş ve Ay'ı Tanıyorum",
  representativeBadge: 'Temsilî gösterim',
  representativeFootnote:
    'Temsilî gösterim: Modellerin büyüklükleri ve aralarındaki uzaklıklar gerçek ölçekte değildir.',
  dragHint: 'Sürükleyerek döndür, düğmelerle yakınlaştır',
  listenAgainLabel: 'Tekrar Dinle',
  backLabel: 'Geri Dön',
  nextBodyLabel: 'Sonraki Gök Cismi',
  startReinforcementLabel: 'Kısa Pekiştirmeye Geç',
  reinforcementTabLabel: 'Kısa Pekiştirme',
  reinforcementTitle: 'Kısa Pekiştirme: Hangisi Nedir?',
  reinforcementInstruction:
    'Güneş, Dünya ve Ay görsellerini doğru tanımlarla eşleştir. Yanlış seçimde ipucuna bakıp tekrar deneyebilirsin.',
  completedBannerTitle: "Tebrikler! Etkinliği Tamamladın",
  completedBannerText:
    "Güneş, Dünya ve Ay'ı inceledin ve üç gök cismini doğru özellikleriyle eşleştirdin. İlerleme yerel profiline kaydedildi.",
  inspectAllFirstNote:
    'Etkinliğin tamamlanması için üç gök cismini de (Güneş, Dünya, Ay) incelemeyi unutma.',
  speechFallbackNote:
    'Sesli anlatım şu an kapalı veya bu cihazda desteklenmiyor. Yazılı açıklamalarla güvenle devam edebilirsin.',
  gradeFocusTitle: {
    2: '2. Sınıf Keşif Notu',
    3: '3. Sınıf Karşılaştırma Notu',
    4: '4. Sınıf İlişki ve Özellik Notu',
  } as Record<SupportedGrade, string>,
} as const;

export const CELESTIAL_BODIES: readonly CelestialBodyDefinition[] = [
  {
    id: 'sun',
    name: 'Güneş',
    categoryId: 'star',
    categoryLabel: 'Yıldız',
    coreFact: 'Güneş bir yıldızdır.',
    visualFeatureLabel: 'Parlak, sıcak ve kendi ışığını yayan yıldız',
    accentHex: '#f59e0b',
    matchHint:
      'İpucu: Güneş kendi ışığını ve ısısını üreten çok sıcak bir gök cismidir. Bu tür gök cisimlerine ne denir? Tekrar dene!',
    matchSuccess: 'Harika! Güneş bir yıldızdır.',
    byGrade: {
      2: {
        focusBadge: 'Temel Özellik: Işık ve Isı Kaynağı',
        summary:
          "Güneş bir yıldızdır. Dünya'mızı aydınlatan ve ısıtan temel ışık ve ısı kaynağımızdır.",
        keyPoints: [
          'Güneş bir gezegen değildir; çok parlak bir yıldızdır.',
          "Güneş, Dünya'mıza her gün ısı ve ışık verir.",
        ],
        spokenText:
          "Güneş bir yıldızdır. Dünya'mızı aydınlatan ve ısıtan temel ışık ve ısı kaynağımızdır.",
      },
      3: {
        focusBadge: 'Karşılaştırma: Kendi Işığını Üreten Yıldız',
        summary:
          "Güneş bir yıldızdır; Dünya ve Ay'dan farklı olarak kendi ışığını ve ısısını üretir. Dünya için temel ısı ve ışık kaynağıdır.",
        keyPoints: [
          'Yıldız olduğu için kendi ışığını yayar; Dünya ve Ay ise kendi ışığını üretmez.',
          "Dünya'daki yaşam için gerekli ısı ve ışığı Güneş sağlar.",
          "Dünya'dan ve Ay'dan çok daha büyüktür.",
        ],
        spokenText:
          "Güneş bir yıldızdır. Dünya ve Ay'dan farklı olarak kendi ışığını ve ısısını üretir. Dünya için temel ışık ve ısı kaynağıdır.",
      },
      4: {
        focusBadge: 'Özellik ve İlişki: Sistemin Merkezindeki Yıldız',
        summary:
          "Güneş, Dünya'ya en yakın yıldızdır ve kendi enerjisiyle ısı ile ışık yayar. Dünya ve Ay, Güneş'in çevresinde birlikte dolanır.",
        keyPoints: [
          'Güneş bir yıldızdır; sıcak gazlardan oluşur ve çok yüksek enerji üretir.',
          "Dünya için temel ısı ve ışık kaynağıdır; yeryüzündeki yaşamı destekler.",
          "İlişki: Dünya bir gezegen olarak Güneş'in çevresinde, Ay da Dünya'nın çevresinde dolanır.",
        ],
        spokenText:
          "Güneş bir yıldızdır ve Dünya'ya en yakın yıldızdır. Kendi ürettiği ısı ve ışık enerjisiyle Dünya'daki yaşamı destekler. Dünya ve Ay, Güneş'in çevresinde birlikte dolanır.",
      },
    },
  },
  {
    id: 'earth',
    name: 'Dünya',
    categoryId: 'planet',
    categoryLabel: 'Gezegen',
    coreFact: 'Dünya, üzerinde yaşadığımız gezegendir.',
    visualFeatureLabel: 'Mavi denizler ve yeşil-kahverengi karalar',
    accentHex: '#38bdf8',
    matchHint:
      "İpucu: Dünya kendi ışığını üretmez ve Güneş'in çevresinde dolanır. Üzerinde yaşadığımız bu gök cismine ne denir? Tekrar dene!",
    matchSuccess: 'Doğru! Dünya, üzerinde yaşadığımız gezegendir.',
    byGrade: {
      2: {
        focusBadge: 'Temel Özellik: Denizler ve Karalar',
        summary:
          'Dünya, üzerinde yaşadığımız gezegendir. Yüzeyinde geniş mavi denizler ve karalar bulunur.',
        keyPoints: [
          'Dünya bir gezegendir; insanların, hayvanların ve bitkilerin evidir.',
          'Modeli döndürdüğünde mavi denizleri ve karaları kolayca ayırt edebilirsin.',
        ],
        spokenText:
          'Dünya, üzerinde yaşadığımız gezegendir. Yüzeyinde geniş mavi denizler ve karalar bulunur.',
      },
      3: {
        focusBadge: "Karşılaştırma: Güneş'in Çevresindeki Gezegen",
        summary:
          "Dünya, üzerinde yaşadığımız gezegendir. Güneş gibi kendi ışığını üretmez; Güneş'ten gelen ışık ve ısıyla aydınlanır.",
        keyPoints: [
          'Dünya bir yıldız veya uydu değil, bir gezegendir.',
          'Yüzeyinin büyük bölümü denizlerle ve okyanuslarla kaplıdır; geri kalanı karalardır.',
          "Güneş'ten küçük, Ay'dan ise büyüktür.",
        ],
        spokenText:
          "Dünya, üzerinde yaşadığımız gezegendir. Kendi ışığını üretmez, Güneş'ten gelen ışık ve ısıyla aydınlanır. Yüzeyinde geniş denizler ve karalar vardır.",
      },
      4: {
        focusBadge: 'Özellik ve İlişki: Yaşamı Barındıran Gezegen',
        summary:
          "Dünya, üzerinde yaşadığımız gezegendir. Okyanusları, kıtaları ve yaşamı koruyan atmosferiyle Güneş'in çevresinde dolanır; doğal uydusu Ay'dır.",
        keyPoints: [
          'Kıtalar (karalar) ve okyanuslar (denizler) yüzeyinde belirgin biçimde ayrılır.',
          "Kendi ışığını üretmez; ısı ve ışığını yıldızımız olan Güneş'ten alır.",
          "İlişki: Güneş'in çevresinde dolanır ve doğal uydusu Ay'ı kendi çevresinde tutar.",
        ],
        spokenText:
          "Dünya, üzerinde yaşadığımız gezegendir. Geniş okyanusları, kıtaları ve atmosferiyle yaşamı barındırır. Güneş'in çevresinde dolanır ve doğal uydusu Ay'dır.",
      },
    },
  },
  {
    id: 'moon',
    name: 'Ay',
    categoryId: 'natural-satellite',
    categoryLabel: 'Doğal uydu',
    coreFact: "Ay, Dünya'nın doğal uydusudur.",
    visualFeatureLabel: 'Kraterlerle kaplı kayalık yüzey',
    accentHex: '#cbd5e1',
    matchHint:
      "İpucu: Ay bir gezegenin (Dünya'mızın) çevresinde dolanan gök cismidir. Gezegenlerin çevresinde dolanan bu gök cisimlerine ne denir? Tekrar dene!",
    matchSuccess: "Çok güzel! Ay, Dünya'nın doğal uydusudur.",
    byGrade: {
      2: {
        focusBadge: 'Temel Özellik: Kraterli Yüzey',
        summary:
          "Ay, Dünya'nın doğal uydusudur. Kayalık yüzeyinde çukur biçiminde birçok krater bulunur.",
        keyPoints: [
          "Ay, Dünya'mızın çevresinde dolanan doğal uydusudur.",
          'Modeli yakınlaştırıp döndürdüğünde yüzeyindeki kraterleri görebilirsin.',
        ],
        spokenText:
          "Ay, Dünya'nın doğal uydusudur. Kayalık yüzeyinde çukur biçiminde birçok krater bulunur.",
      },
      3: {
        focusBadge: "Karşılaştırma: Dünya'nın Doğal Uydusu",
        summary:
          "Ay, Dünya'nın doğal uydusudur. Yıldız ya da gezegen değildir; kendi ışığı yoktur, Güneş'ten aldığı ışığı yansıtır.",
        keyPoints: [
          "Doğal uydu olduğu için Dünya'nın çevresinde dolanır.",
          "Güneş'ten ve Dünya'dan küçüktür.",
          'Yüzeyinde gök taşlarının oluşturduğu çok sayıda krater ayırt edilir.',
        ],
        spokenText:
          "Ay, Dünya'nın doğal uydusudur. Kendi ışığı yoktur, Güneş'ten aldığı ışığı yansıtır. Yüzeyinde çok sayıda krater bulunur.",
      },
      4: {
        focusBadge: 'Özellik ve İlişki: Kraterli Doğal Uydu',
        summary:
          "Ay, Dünya'nın tek doğal uydusudur ve Dünya'ya en yakın gök cismidir. İnce atmosferi neredeyse olmadığı için yüzeyindeki kraterler uzun süre korunur.",
        keyPoints: [
          "Kendi ışığını üretmez; gece gökyüzünde Güneş'ten aldığı ışığı yansıtarak görünür.",
          'Yüzeyindeki koyu düzlükler ve yuvarlak kraterler teleskopla ve yakından açıkça seçilir.',
          "İlişki: Dünya'nın çevresinde dolanır ve Dünya ile birlikte Güneş'in çevresinde hareket eder.",
        ],
        spokenText:
          "Ay, Dünya'nın doğal uydusudur ve Dünya'ya en yakın gök cismidir. Kendi ışığı yoktur, Güneş'ten gelen ışığı yansıtır. Yüzeyinde gök taşlarının açtığı çok sayıda krater görülür.",
      },
    },
  },
] as const;

export function getCelestialBodyDefinition(id: CelestialBodyId): CelestialBodyDefinition {
  return CELESTIAL_BODIES.find((item) => item.id === id) ?? CELESTIAL_BODIES[0];
}
