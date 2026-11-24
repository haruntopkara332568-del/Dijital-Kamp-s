import type { SupportedGrade } from '@/src/types/campus';

export type ActiveExperimentId = 'exp-sunlight' | 'exp-day-night' | 'exp-moon-phases';

export type MoonPhaseId = 'new-moon' | 'first-quarter' | 'full-moon' | 'last-quarter';

export type InquiryStageId = 'predict' | 'experiment' | 'observe' | 'explain';

export const ACTIVE_DISCOVERY_MISSION_ID = 'yerden-goklere-aktif-kesif-dga';
export const ACTIVE_DISCOVERY_MISSION_VERSION = '1.0';

export interface ExperimentChoiceOption {
  id: string;
  label: string;
  isCorrect: boolean;
  feedback: string;
}

export interface ExperimentGradePack {
  predictPrompt: string;
  predictOptions: readonly ExperimentChoiceOption[];
  experimentInstruction: string;
  explainPrompt: string;
  explainOptions: readonly ExperimentChoiceOption[];
  optionalForGrade?: boolean;
}

export interface ActiveExperimentDefinition {
  id: ActiveExperimentId;
  order: 1 | 2 | 3;
  shortTitle: string;
  title: string;
  curiosityQuestion: string;
  voiceGuide: string;
  completionFeedback: string;
  byGrade: Record<SupportedGrade, ExperimentGradePack>;
}

export interface MoonPhaseDefinition {
  id: MoonPhaseId;
  label: string;
  /**
   * Yörünge açısı (derece): Güneş solda (180°) sabit iken, Kuzey Kutbu üstünden
   * saat yönünün tersine:
   * 0° = Yeni ay (Güneş ile Dünya arasında, solda)
   * 90° = İlk dördün (altta, sağ yarısı aydınlık)
   * 180° = Dolunay (sağda, tam aydınlık)
   * 270° = Son dördün (üstte, sol yarısı aydınlık)
   */
  phaseAngleDeg: number;
  earthViewSummary: string;
  shortDescription: string;
}

export const MOON_PHASES: readonly MoonPhaseDefinition[] = [
  {
    id: 'new-moon',
    label: 'Yeni ay',
    phaseAngleDeg: 0,
    earthViewSummary: 'Dünya’dan bakan yüzü karanlık görünür.',
    shortDescription:
      'Ay, Güneş ile Dünya arasında kaldığında aydınlanan yarısı Güneş’e bakar; Dünya’dan karanlık görünür.',
  },
  {
    id: 'first-quarter',
    label: 'İlk dördün',
    phaseAngleDeg: 90,
    earthViewSummary: 'Dünya’dan sağ yarısı aydınlık (D biçiminde) görünür.',
    shortDescription:
      'Ay yörüngesinde çeyrek tur ilerlediğinde Güneş’in aydınlattığı yarısının yarısını (sağ yarısını) görürüz.',
  },
  {
    id: 'full-moon',
    label: 'Dolunay',
    phaseAngleDeg: 180,
    earthViewSummary: 'Dünya’dan tamamı parlak ve yuvarlak görünür.',
    shortDescription:
      'Ay, Dünya’nın Güneş’e göre karşı tarafındayken Güneş’in aydınlattığı yüzün tamamı Dünya’ya döner.',
  },
  {
    id: 'last-quarter',
    label: 'Son dördün',
    phaseAngleDeg: 270,
    earthViewSummary: 'Dünya’dan sol yarısı aydınlık (ters D biçiminde) görünür.',
    shortDescription:
      'Ay yörüngesinin son çeyreğindeyken Güneş’in aydınlattığı bölümün sol yarısı Dünya’dan görünür.',
  },
] as const;

export const TURKEY_COORDS = {
  lonDeg: 35,
  latDeg: 39,
  label: 'Türkiye',
} as const;

export const INQUIRY_STEPS: readonly { id: InquiryStageId; label: string }[] = [
  { id: 'predict', label: '1. Tahmin Et' },
  { id: 'experiment', label: '2. Deney Yap' },
  { id: 'observe', label: '3. Gözlemle' },
  { id: 'explain', label: '4. Açıkla' },
] as const;

export const ACTIVE_DISCOVERY_UI_COPY = {
  sectionTabLabel: 'Aktif Keşif Deneyleri',
  learnTabLabel: 'Gök Cisimlerini Tanı',
  representativeBadge: 'Temsilî gösterim',
  representativeNote:
    'Temsilî gösterim: Güneş, Dünya ve Ay’ın büyüklükleri ile aralarındaki uzaklıklar gerçek ölçekte değildir.',
  retryExperimentLabel: 'Yeniden Dene',
  listenGuideLabel: 'Rehberi Dinle',
  turnOnLightLabel: 'Işığı Aç',
  spinLabel: 'Döndür',
  pauseLabel: 'Durdur',
  resetLabel: 'Başa Dön',
  optionalGrade2Badge: '2. Sınıf — İsteğe Bağlı Keşif',
  moonShadowRuleNote:
    'Bilimsel not: Ay’ın evreleri Dünya’nın gölgesiyle oluşmaz (Dünya’nın gölgesi Ay tutulmasıyla ilgilidir). Evreler, Güneş’in aydınlattığı yarının Dünya’dan farklı oranlarda görülmesiyle oluşur.',
} as const;

export const ACTIVE_EXPERIMENTS: readonly ActiveExperimentDefinition[] = [
  {
    id: 'exp-sunlight',
    order: 1,
    shortTitle: "Deney 1: Güneş'in Işığı",
    title: "Güneş'in Işığını Keşfediyorum",
    curiosityQuestion: "Dünya'nın her yeri aynı anda Güneş ışığı alır mı?",
    voiceGuide: "Güneş bir yıldızdır. Dünya'nın Güneş'e bakan tarafı ışık alır.",
    completionFeedback:
      "Harika! Güneş bir yıldızdır ve Dünya'nın yalnızca Güneş'e bakan tarafı aynı anda aydınlanır.",
    byGrade: {
      2: {
        predictPrompt:
          "Işığı açtığımızda Dünya'nın neresi aydınlık olur? Tahminini seç:",
        predictOptions: [
          {
            id: 'sun-facing',
            label: "Güneş'e bakan tarafı aydınlanır",
            isCorrect: true,
            feedback: "Güzel tahmin! Şimdi 'Işığı Aç' düğmesine basıp gözlemleyelim.",
          },
          {
            id: 'all-lit',
            label: "Dünya'nın her yeri aynı anda aydınlanır",
            isCorrect: false,
            feedback:
              "İpucu: Bir topa tek taraftan fener tuttuğunda arkası karanlık kalır. Tekrar tahmin et!",
          },
        ],
        experimentInstruction:
          "1) 'Işığı Aç' düğmesine bas. 2) Dünya'yı incele ve model üzerinde önce aydınlık tarafa, sonra karanlık tarafa dokun.",
        explainPrompt: 'Gözlemine göre doğru cümleyi seç:',
        explainOptions: [
          {
            id: 'exp1-g2-correct',
            label: "Dünya'nın Güneş'e bakan tarafı aydınlık, diğer tarafı karanlıktır.",
            isCorrect: true,
            feedback: 'Doğru gözlem! Güneş ışığı yalnızca kendine bakan yarım küreyi aydınlatır.',
          },
          {
            id: 'exp1-g2-wrong',
            label: "Dünya'nın iki tarafı da aynı anda aydınlıktır.",
            isCorrect: false,
            feedback: 'İpucu: İşaretlediğin koyu ve parlak bölgelere tekrar bakıp yeniden dene!',
          },
        ],
      },
      3: {
        predictPrompt:
          "Güneş ışığını açmadan önce tahmin et: Dünya'nın hangi bölgesi ışık alır?",
        predictOptions: [
          {
            id: 'sun-facing',
            label: "Yalnızca Güneş'e bakan yarım küresi aydınlanır",
            isCorrect: true,
            feedback: "Harika tahmin! Şimdi 'Işığı Aç' ile deneyip kendi gözünle doğrula.",
          },
          {
            id: 'all-lit',
            label: 'Bütün yüzeyi aynı anda aydınlanır',
            isCorrect: false,
            feedback:
              'İpucu: Dünya küre biçimindedir ve ışık tek bir yönden, Güneş’ten gelir. Tekrar dene!',
          },
          {
            id: 'far-side',
            label: "Güneş'ten uzak tarafı aydınlanır",
            isCorrect: false,
            feedback:
              'İpucu: Işık kaynağı olan Güneş hangi taraftaysa o yüz aydınlanır. Tekrar dene!',
          },
        ],
        experimentInstruction:
          "1) 'Işığı Aç' düğmesini kullan. 2) Bakış açısını değiştirerek Dünya'yı incele. 3) Model üzerinde aydınlık ve karanlık bölgeyi işaretle.",
        explainPrompt: 'Deney sonucunu en iyi açıklayan ifadeyi seç:',
        explainOptions: [
          {
            id: 'exp1-g3-correct',
            label:
              "Güneş bir yıldızdır; Dünya'nın Güneş'e dönük yarısı aydınlık, diğer yarısı karanlık olur.",
            isCorrect: true,
            feedback: 'Mükemmel açıklama! Aydınlık ve karanlık bölgeyi doğru ilişkilendirdin.',
          },
          {
            id: 'exp1-g3-wrong',
            label: "Dünya kendi ışığını ürettiği için her yeri aydınlıktır.",
            isCorrect: false,
            feedback:
              "İpucu: Dünya bir gezegendir, kendi ışığını üretmez; ışığını Güneş'ten alır. Tekrar dene!",
          },
        ],
      },
      4: {
        predictPrompt:
          "Güneş sabit bir konumdan ışık yayarken Dünya üzerindeki iki zıt konum aynı anda aydınlanabilir mi?",
        predictOptions: [
          {
            id: 'sun-facing',
            label: "Hayır, yalnızca Güneş'e dönük yarım küre aynı anda ışık alır",
            isCorrect: true,
            feedback: "Çok iyi tahmin! Şimdi 'Işığı Aç' diyerek farklı açılardan inceleyelim.",
          },
          {
            id: 'all-lit',
            label: 'Evet, bütün konumlar aynı anda ışık alır',
            isCorrect: false,
            feedback:
              'İpucu: Işık doğrusal yayılır; küre biçimindeki Dünya’nın arka yüzü doğrudan ışık alamaz. Tekrar dene!',
          },
          {
            id: 'random',
            label: 'Aydınlanma Güneş’in konumundan bağımsızdır',
            isCorrect: false,
            feedback:
              'İpucu: Işık yönü her zaman yıldızımız Güneş’in konumuna bağlıdır. Tekrar dene!',
          },
        ],
        experimentInstruction:
          "1) 'Işığı Aç' düğmesine bas. 2) Farklı bakış açılarıyla aydınlık ve karanlık yarım küreleri karşılaştır. 3) İki bölgeyi model üzerinde işaretle.",
        explainPrompt: 'Gözlemlerinden yola çıkarak doğru gerekçeyi seç:',
        explainOptions: [
          {
            id: 'exp1-g4-correct',
            label:
              "Dünya küresel olduğu ve ışığını yıldızımız Güneş'ten aldığı için aynı anda yalnızca bir yarım küresi aydınlanır.",
            isCorrect: true,
            feedback:
              'Harika bir bilimsel çıkarım! Farklı konumlardaki aydınlanma farkını net biçimde açıkladın.',
          },
          {
            id: 'exp1-g4-wrong',
            label: "Güneş ışığı Dünya'nın çevresinden dolaşarak iki tarafı da eşit aydınlatır.",
            isCorrect: false,
            feedback:
              'İpucu: Modeli çevirip gölgeli arka yarıya tekrar bak; ışık doğrudan bakan yüzü aydınlatır.',
          },
        ],
      },
    },
  },
  {
    id: 'exp-day-night',
    order: 2,
    shortTitle: 'Deney 2: Gündüz ve Gece',
    title: 'Gündüzü ve Geceyi Oluşturuyorum',
    curiosityQuestion: 'Yaşadığımız yerde gece nasıl gündüze dönüşür?',
    voiceGuide:
      'Dünya kendi ekseni etrafında döner. Bu dönüş sonucunda gece ve gündüz oluşur.',
    completionFeedback:
      'Tebrikler! Dünya’yı kendi ekseni etrafında döndürerek Türkiye’de hem gündüzü hem geceyi oluşturdun.',
    byGrade: {
      2: {
        predictPrompt: "Türkiye'de gece iken gündüz olması için hangisi döner?",
        predictOptions: [
          {
            id: 'earth-spins',
            label: 'Dünya kendi ekseni etrafında döner',
            isCorrect: true,
            feedback: "Doğru tahmin! Şimdi 'Döndür' veya sürükleme ile Türkiye'de gündüz ve gece oluştur.",
          },
          {
            id: 'sun-turns-off',
            label: 'Güneş akşamları ışığını kapatır',
            isCorrect: false,
            feedback: 'İpucu: Güneş bir yıldızdır ve ışığını hiç kapatmaz. Tekrar dene!',
          },
        ],
        experimentInstruction:
          "Dünya'yı döndürerek kırmızı işaretli Türkiye noktasında önce GÜNDÜZ, sonra GECE oluştur.",
        explainPrompt: 'Gece ve gündüz nasıl oluşur?',
        explainOptions: [
          {
            id: 'exp2-g2-correct',
            label: 'Dünya kendi ekseni etrafında döndüğü için gece ve gündüz oluşur.',
            isCorrect: true,
            feedback: 'Harika! Dünya döndükçe yaşadığımız yer sırayla gündüz ve gece olur.',
          },
          {
            id: 'exp2-g2-wrong',
            label: 'Güneş her akşam kaybolduğu için gece olur.',
            isCorrect: false,
            feedback: 'İpucu: Deneyde Güneş hep sabit kaldı, yalnızca Dünya döndü! Tekrar dene.',
          },
        ],
      },
      3: {
        predictPrompt:
          "Güneş sabit dururken Türkiye'de gece nasıl gündüze dönüşür?",
        predictOptions: [
          {
            id: 'earth-spins',
            label: "Dünya kendi ekseni etrafında dönerek Türkiye'yi Güneş'e çevirir",
            isCorrect: true,
            feedback: "Süper tahmin! Şimdi Dünya'yı döndürüp Türkiye'de hem gündüzü hem geceyi oluştur.",
          },
          {
            id: 'sun-moves',
            label: "Güneş bir günde Dünya'nın etrafında döner",
            isCorrect: false,
            feedback:
              'İpucu: Deneyde Güneş sabit duruyor; gündüz ve gece Dünya’nın kendi dönüşüyle oluşur. Tekrar dene!',
          },
          {
            id: 'moon-blocks',
            label: "Ay her gece Güneş'i kapatır",
            isCorrect: false,
            feedback: 'İpucu: Gece, bulunduğumuz yerin Güneş’e sırtını dönmesiyle oluşur. Tekrar dene!',
          },
        ],
        experimentInstruction:
          "Dünya'yı sürükleyerek veya 'Döndür / Durdur' kontrolleriyle çevir; Türkiye noktasında önce GÜNDÜZ, sonra GECE oluştur.",
        explainPrompt: 'Gündüz ve gece oluşumunun nedeni nedir?',
        explainOptions: [
          {
            id: 'exp2-g3-correct',
            label:
              "Dünya kendi ekseni etrafında döner; Güneş'e dönük yerlerde gündüz, diğer tarafta gece oluşur.",
            isCorrect: true,
            feedback: 'Çok güzel! Dünya’nın kendi ekseni etrafındaki dönüşünü doğru açıkladın.',
          },
          {
            id: 'exp2-g3-wrong',
            label: 'Güneş’in ışığı gün içinde azalıp çoğaldığı için gece ve gündüz oluşur.',
            isCorrect: false,
            feedback:
              'İpucu: Güneş hep aynı parlaklıktadır; değişen şey Dünya’nın dönerek hangi yüzünün Güneş’e baktığıdır.',
          },
        ],
      },
      4: {
        predictPrompt:
          "Türkiye'de gündüz yaşanırken Dünya'nın tam karşı tarafında ne yaşanır ve bu durum nasıl değişir?",
        predictOptions: [
          {
            id: 'earth-spins',
            label:
              'Karşı tarafta gece yaşanır; Dünya kendi ekseni etrafında döndükçe gündüz ve gece yer değiştirir',
            isCorrect: true,
            feedback: 'Harika çıkarım! Şimdi modeli döndürerek gözleminle doğrula.',
          },
          {
            id: 'sun-moves',
            label: 'Her yerde aynı anda gündüz olur, sonra Güneş uzaklaşır',
            isCorrect: false,
            feedback:
              'İpucu: Güneş sabit konumdadır; Dünya kendi ekseni etrafında dönerek farklı bölgeleri ışığa çevirir.',
          },
          {
            id: 'no-change',
            label: 'Türkiye her zaman gündüz kalır',
            isCorrect: false,
            feedback: 'İpucu: Dünya durmadan kendi ekseni etrafında döner. Tekrar dene!',
          },
        ],
        experimentInstruction:
          "Dünya'yı kendi ekseni etrafında döndür; Türkiye'yi önce aydınlık tarafa (Gündüz), ardından karanlık tarafa (Gece) getirip gözlemle.",
        explainPrompt: 'Kendi gözlemlerine göre en doğru açıklamayı seç:',
        explainOptions: [
          {
            id: 'exp2-g4-correct',
            label:
              "Güneş sabitken Dünya'nın kendi ekseni etrafında dönmesi, Türkiye'nin sırayla aydınlık (gündüz) ve karanlık (gece) bölgeye geçmesini sağlar.",
            isCorrect: true,
            feedback: 'Tebrikler! Gözlemlerini bilimsel neden-sonuç ilişkisiyle kusursuz açıkladın.',
          },
          {
            id: 'exp2-g4-wrong',
            label: "Dünya'nın Güneş'ten uzaklaşıp yaklaşması gece ve gündüzü oluşturur.",
            isCorrect: false,
            feedback:
              'İpucu: Gece-gündüz değişimi uzaklık farkıyla değil, Dünya’nın kendi ekseni etrafında dönmesiyle oluşur.',
          },
        ],
      },
    },
  },
  {
    id: 'exp-moon-phases',
    order: 3,
    shortTitle: "Deney 3: Ay'ın Evreleri",
    title: "Ay'ın Evrelerini Keşfediyorum",
    curiosityQuestion: 'Ay neden her gece aynı biçimde görünmez?',
    voiceGuide:
      "Ay'ın evreleri, Güneş'in aydınlattığı bölümünün Dünya'dan farklı oranlarda görülmesiyle oluşur.",
    completionFeedback:
      "Harika! Ay'ı Dünya çevresinde hareket ettirerek farklı evrelerin nasıl oluştuğunu keşfettin.",
    byGrade: {
      2: {
        optionalForGrade: true,
        predictPrompt:
          "(İsteğe bağlı keşif) Ay'ı Dünya çevresinde hareket ettirince görüntüsü değişir mi?",
        predictOptions: [
          {
            id: 'changes-by-pos',
            label: 'Evet, konumu değiştikçe aydınlık kısmı farklı görünür',
            isCorrect: true,
            feedback: "Süper! Şimdi Ay'ı yörüngesinde hareket ettirip Dünya'dan görünümüne bakalım.",
          },
          {
            id: 'shape-breaks',
            label: 'Ay gerçekten küçülüp yeniden büyür',
            isCorrect: false,
            feedback:
              'İpucu: Ay her zaman yuvarlak bir küredir; yalnızca aydınlık kısmını farklı oranlarda görürüz!',
          },
        ],
        experimentInstruction:
          "Ay'ı Dünya çevresinde sürükle veya düğmelerle taşı; sağdaki pencereden Dünya'dan nasıl göründüğünü izle ve en az iki farklı evreyi kaydet.",
        explainPrompt: 'Gözlemine göre hangisi doğrudur?',
        explainOptions: [
          {
            id: 'exp3-g2-correct',
            label: "Ay Dünya çevresinde dolandıkça aydınlık kısmını farklı biçimlerde görürüz.",
            isCorrect: true,
            feedback: 'Aferin! Ay hep küre biçimindedir, yalnızca aydınlık yüzünü farklı açılardan görürüz.',
          },
          {
            id: 'exp3-g2-wrong',
            label: "Ay'ın parçaları kopup tekrar birleşir.",
            isCorrect: false,
            feedback: 'İpucu: Uzaydan görünüme bak; Ay hep tam bir küre olarak kalır. Tekrar dene!',
          },
        ],
      },
      3: {
        predictPrompt: 'Ay neden her gece aynı biçimde görünmez? Tahminini seç:',
        predictOptions: [
          {
            id: 'changes-by-pos',
            label: "Ay Dünya çevresinde dolanırken aydınlık yüzünü farklı oranlarda görürüz",
            isCorrect: true,
            feedback: "Harika tahmin! Şimdi Ay'ı hareket ettirerek evreleri kendin oluştur.",
          },
          {
            id: 'earth-shadow',
            label: "Dünya'nın gölgesi her gece Ay'ın bir kısmını kapatır",
            isCorrect: false,
            feedback:
              "İpucu: Dünya'nın gölgesi Ay tutulmasında olur, Ay'ın evrelerini oluşturmaz. Güneş'in aydınlattığı yarının konumuna odaklanıp tekrar dene!",
          },
          {
            id: 'moon-own-light',
            label: 'Ay kendi ışığını açıp kapatır',
            isCorrect: false,
            feedback:
              "İpucu: Ay'ın kendi ışığı yoktur; Güneş'ten aldığı ışığı yansıtır. Tekrar dene!",
          },
        ],
        experimentInstruction:
          "Ay'ı Dünya çevresindeki farklı konumlara taşı, sağdaki 'Dünya'dan Görünüm' penceresini izle ve en az iki farklı evreyi oluşturup kaydet.",
        explainPrompt: 'Gözlemlediğin iki evreyi karşılaştırarak doğru açıklamayı seç:',
        explainOptions: [
          {
            id: 'exp3-g3-correct',
            label:
              "Ay'ın evreleri, Güneş'in aydınlattığı bölümünün Dünya'dan farklı oranlarda görülmesiyle oluşur.",
            isCorrect: true,
            feedback: 'Mükemmel! Ay’ın evrelerinin gerçek nedenini çok iyi kavradın.',
          },
          {
            id: 'exp3-g3-wrong',
            label: "Dünya'nın gölgesi Ay'ın üzerine düştüğü için evreler oluşur.",
            isCorrect: false,
            feedback:
              "İpucu: Dünya'nın gölgesi Ay tutulmasıyla ilgilidir; evreler Ay'ın konumuna göre aydınlık yüzünü farklı görmemizle oluşur.",
          },
        ],
      },
      4: {
        predictPrompt:
          "Güneş her zaman Ay'ın yarısını aydınlattığı hâlde Dünya'dan neden Yeni ay, İlk dördün, Dolunay ve Son dördün görürüz?",
        predictOptions: [
          {
            id: 'changes-by-pos',
            label:
              "Ay Dünya'nın çevresinde dolandıkça Güneş'in aydınlattığı yarısını farklı açılardan ve oranlarda görürüz",
            isCorrect: true,
            feedback: "Doğru bilimsel tahmin! Şimdi Ay'ı konumlandırıp temel evreleri oluştur ve karşılaştır.",
          },
          {
            id: 'earth-shadow',
            label: "Dünya'nın gölgesi her hafta Ay'ın farklı bir bölümünü örter",
            isCorrect: false,
            feedback:
              "Dikkat! Dünya'nın gölgesi Ay tutulmasıyla ilişkilidir; Ay'ın evreleri gölge değil, bakış açısı ve konum sonucudur. Tekrar dene!",
          },
          {
            id: 'clouds',
            label: "Gökyüzündeki bulutlar Ay'ı farklı şekillerde keser",
            isCorrect: false,
            feedback:
              'İpucu: Bulutsuz gecelerde de Ay düzenli olarak evre değiştirir. Konum ilişkisini düşün!',
          },
        ],
        experimentInstruction:
          "Ay'ı yörüngede taşıyarak temel evrelerden (Yeni ay, İlk dördün, Dolunay, Son dördün) en az ikisini oluştur, kaydet ve görünümlerini karşılaştır.",
        explainPrompt: 'Gözlemlerinden çıkarım yaparak doğru açıklamayı seç:',
        explainOptions: [
          {
            id: 'exp3-g4-correct',
            label:
              "Güneş her zaman Ay'ın kendine bakan yarısını aydınlatır; Ay Dünya çevresinde dolandıkça bu aydınlık yüzü Dünya'dan farklı oranlarda görürüz.",
            isCorrect: true,
            feedback: 'Harika çıkarım! Güneş–Dünya–Ay geometrisini bilimsel doğrulukla açıkladın.',
          },
          {
            id: 'exp3-g4-wrong',
            label: "Dünya'nın gölgesi Ay'ın yarısını kapattığı için İlk dördün ve Son dördün oluşur.",
            isCorrect: false,
            feedback:
              "İpucu: Dünya'nın gölgesi Ay tutulmasıyla ilgilidir; uzaydan görünüme bakarak Ay'ın Güneş'e dönük yarısının hep aydınlık olduğunu gör!",
          },
        ],
      },
    },
  },
] as const;

export function getActiveExperiment(id: ActiveExperimentId): ActiveExperimentDefinition {
  return ACTIVE_EXPERIMENTS.find((item) => item.id === id) ?? ACTIVE_EXPERIMENTS[0];
}

export function detectMoonPhaseAtAngle(phaseAngleDeg: number): MoonPhaseDefinition | null {
  const normalized = ((phaseAngleDeg % 360) + 360) % 360;
  for (const phase of MOON_PHASES) {
    let diff = Math.abs(normalized - phase.phaseAngleDeg);
    if (diff > 180) diff = 360 - diff;
    if (diff <= 16) return phase;
  }
  return null;
}

/**
 * Küre üzerindeki yerel boylam/enlem noktasını geçerli rotY / rotX
 * görünüm koordinatlarına (nx, ny, nz) dönüştürür.
 */
export function projectSurfacePoint(
  lonDeg: number,
  latDeg: number,
  rotY: number,
  rotX: number,
): { nx: number; ny: number; nz: number } {
  const lon = (lonDeg * Math.PI) / 180;
  const lat = (latDeg * Math.PI) / 180;
  const cosLat = Math.cos(lat);
  const lx = Math.sin(lon) * cosLat;
  const ly = Math.sin(lat);
  const lz = Math.cos(lon) * cosLat;

  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);

  const nx = lx * cosY - lz * sinY;
  const z1 = lx * sinY + lz * cosY;
  const y1 = -ly;
  const ny = y1 * cosX + z1 * sinX;
  const nz = -y1 * sinX + z1 * cosX;

  return { nx, ny, nz };
}
