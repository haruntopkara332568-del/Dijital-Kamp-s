import type { MissionDefinition } from '@/src/types/campus';

/**
 * Genişletilebilir Görev Kataloğu.
 * İlk sürümde "Kapıların Anlattığı Hikâye" görevi tam çalışır durumdadır.
 * Hazır olmayan görevler dürüstçe "Yakında" olarak işaretlenir.
 */
export const MISSIONS: MissionDefinition[] = [
  {
    id: 'kapilarin-anlattigi-hikaye',
    title: 'Kapıların Anlattığı Hikâye',
    version: '1.0.0',
    status: 'active',
    gradeRange: [2, 3, 4, 5, 6, 7],
    relatedAreaIds: ['gezi-ve-kesif', 'ingilizce-dunyasi', 'kitap-ve-hikaye-dunyasi'],
    learningObjectives: {
      ilkokul: [
        'Günlük yaşamda ve çevrede karşılaşılan kapıları görsel özellikleriyle ayırt etmek.',
        'İngilizce "Door" kelimesinin "Kapı" anlamıyla eşleşmesini görsel üzerinden göstermek.',
        'Çizim, hazır şekil veya kısa ifadeyle özgün bir kapı ve ardındaki sahneyi oluşturmak.',
      ],
      ortaokul: [
        'Günlük yaşam kapıları ile Anadolu esintili kampüs kapısını malzeme, biçim, işlev ve süsleme boyutlarında karşılaştırmak.',
        'Door, Gate, Wood, Stone ve Pattern kelimelerini bağlam içinde ayırt etmek ve örnek cümlede kullanmak.',
        'Özgün bir kapı tasarlayıp seçilen isim ve gerekçeli açıklama ile tek bir PNG çalışmasında bütünleştirmek.',
      ],
    },
    steps: [
      {
        id: 'kesfet',
        title: 'Keşfet',
        areaId: 'gezi-ve-kesif',
        areaLabel: 'Gezi ve Keşif',
        journeyStepLabel: 'Rota ve Keşif',
      },
      {
        id: 'ogren',
        title: 'Öğren',
        areaId: 'ingilizce-dunyasi',
        areaLabel: 'İngilizce Dünyası',
        journeyStepLabel: 'İngilizce',
      },
      {
        id: 'uret',
        title: 'Üret',
        areaId: 'kitap-ve-hikaye-dunyasi',
        areaLabel: 'Kitap ve Hikâye Dünyası',
        journeyStepLabel: 'Özgün Üretim',
      },
      {
        id: 'paylas',
        title: 'Paylaş',
        areaId: 'kitap-ve-hikaye-dunyasi',
        areaLabel: 'Kampüs Yolculuğum',
        journeyStepLabel: 'Kayıt ve Dışa Aktarma',
      },
    ],
    contentRefs: {
      ilkokulDoors: [
        {
          id: 'ev',
          title: 'Ev Kapısı',
          illustration: 'ev',
          shortDescription: 'Pencereli, basamaklı sıcak bir ev girişi.',
          materialHint: 'Ahşap',
        },
        {
          id: 'okul',
          title: 'Okul Kapısı',
          illustration: 'okul',
          shortDescription: 'Geniş çift kanatlı, saatli okul girişi.',
          materialHint: 'Metal ve cam',
        },
        {
          id: 'bahce',
          title: 'Bahçe Kapısı',
          illustration: 'bahce',
          shortDescription: 'Taş sütunlar arasında yeşil yapraklı bahçe girişi.',
          materialHint: 'Taş ve ahşap',
        },
        {
          id: 'anadolu',
          title: 'Anadolu Motifli Kapı',
          illustration: 'anadolu',
          shortDescription: 'Taş kemerli, yıldız desenli geleneksel kapı.',
          materialHint: 'Taş ve ahşap',
        },
      ],
      ilkokulVocabulary: [
        {
          id: 'vocab-door',
          word: 'Door',
          turkishMeaning: 'Kapı',
          illustration: 'ev',
        },
      ],
      ortaokulDimensions: [
        {
          id: 'malzeme',
          title: 'Malzeme',
          prompt: 'Kapının yapımında hangi malzemeler öne çıkıyor?',
          choices: [
            'Günlük kapılarda cam ve metal sık görülür; kampüs kapısında taş ve ahşap öne çıkar.',
            'Her ikisinde de dayanıklı dış yüzey ve çerçeve kullanılır.',
            'Ahşap ve taş işçiliği ayrıntıları belirginleştirir.',
          ],
        },
        {
          id: 'bicim',
          title: 'Biçim',
          prompt: 'Kapıların yüksekliği ve üst formu nasıl farklılaşıyor?',
          choices: [
            'Günlük kapılar çoğunlukla düz dikdörtgen formdadır; kampüs kapısı yüksek kemerlidir.',
            'Çift kanatlı büyük girişler kalabalık geçişe uygundur.',
            'Kemerli yapı girişe anıtsal bir çerçeve kazandırır.',
          ],
        },
        {
          id: 'islev',
          title: 'İşlev',
          prompt: 'Bu kapılar hangi amaçlarla kullanılıyor?',
          choices: [
            'İç mekâna veya avluya güvenli ve düzenli geçiş sağlar.',
            'Büyük giriş kapıları (gate) geniş bir alanı karşılar.',
            'Günlük kapılar hız ve pratik açılıp kapanma sunar.',
          ],
        },
        {
          id: 'susleme',
          title: 'Süsleme',
          prompt: 'Yüzey detaylarında nasıl bir fark gözlemliyorsun?',
          choices: [
            'Günlük kapılar sade yüzeylidir; kampüs kapısında geometrik yıldız desenleri yer alır.',
            'Geometrik bordürler giriş çerçevesini vurgular.',
            'Sade tasarım modern yapılarda temiz çizgiler oluşturur.',
          ],
        },
      ],
      ortaokulVocabulary: [
        {
          id: 'vocab-door',
          word: 'Door',
          turkishMeaning: 'Kapı',
          illustration: 'indoor-door',
          contrastNote: 'Genellikle bir oda veya bina girişindeki kapıyı ifade eder.',
        },
        {
          id: 'vocab-gate',
          word: 'Gate',
          turkishMeaning: 'Giriş kapısı / Büyük kapı',
          illustration: 'courtyard-gate',
          contrastNote: 'Bir bahçeye, avluya veya geniş yerleşkeye açılan büyük giriş kapısıdır.',
        },
        {
          id: 'vocab-wood',
          word: 'Wood',
          turkishMeaning: 'Ahşap',
        },
        {
          id: 'vocab-stone',
          word: 'Stone',
          turkishMeaning: 'Taş',
        },
        {
          id: 'vocab-pattern',
          word: 'Pattern',
          turkishMeaning: 'Desen',
        },
      ],
      ortaokulExampleSentence: {
        english: 'This door is made of wood.',
        turkish: 'Bu kapı ahşaptan yapılmıştır.',
      },
      sentenceStartersByGrade: {
        2: ['Kapıdan geçince ... gördüm.'],
        3: ['Bu kapıdan geçince ... gördüm.'],
        4: ['Seçtiğim kapının arkasında ... var. Burada ...'],
        5: [
          'Tasarladığım kapıda ... malzemesini seçtim çünkü ...',
          'Bu kapının adı "..." ve ... için kullanılıyor.',
        ],
        6: [
          'Günlük kapılarla karşılaştırdığımda bu tasarımda ... tercih ettim çünkü ...',
        ],
      },
    },
    options: {
      allowFreeDrawing: true,
      allowShapeStamps: true,
      allowWrittenDesign: true,
      allowPngExport: true,
    },
    startConditions: 'Öğrencinin sınıf düzeyi seçilmiş olmalıdır.',
    completionConditions: 'En az bir özgün üretim (çizim, şekil veya metin) kaydedilmiş olmalıdır.',
    selfEvaluation: {
      options: [
        { id: 'learned', label: 'Bugün yeni bir şey öğrendim.', iconKey: 'learned' },
        { id: 'curious', label: 'Bir şeyi daha iyi anlamak istiyorum.', iconKey: 'curious' },
        { id: 'completed', label: 'Çalışmamı tamamladım.', iconKey: 'completed' },
      ],
    },
    source: 'Proje Sahibi Tasarım Dokümanı v3.2 — Bölüm 15',
    verificationStatus: 'dogrulandi',
    targetGrades: [2, 3, 4, 5, 6, 7],
    contentVersion: '1.0.0',
  },
  {
    id: 'aksaray-tas-isci-rotasi',
    title: 'Anadolu Avlularında Geometri Rotası',
    version: '0.1.0',
    status: 'coming-soon',
    gradeRange: [3, 4, 5, 6, 7],
    relatedAreaIds: ['gezi-ve-kesif', 'ingilizce-dunyasi', 'kitap-ve-hikaye-dunyasi'],
    learningObjectives: {
      ilkokul: ['Yakında eklenecek doğrulanmış gözlem hedefleri.'],
      ortaokul: ['Yakında eklenecek doğrulanmış karşılaştırma hedefleri.'],
    },
    steps: [
      {
        id: 'kesfet',
        title: 'Keşfet',
        areaId: 'gezi-ve-kesif',
        areaLabel: 'Gezi ve Keşif',
        journeyStepLabel: 'Rota ve Keşif',
      },
      {
        id: 'ogren',
        title: 'Öğren',
        areaId: 'ingilizce-dunyasi',
        areaLabel: 'İngilizce Dünyası',
        journeyStepLabel: 'İngilizce',
      },
      {
        id: 'uret',
        title: 'Üret',
        areaId: 'kitap-ve-hikaye-dunyasi',
        areaLabel: 'Kitap ve Hikâye Dünyası',
        journeyStepLabel: 'Özgün Üretim',
      },
      {
        id: 'paylas',
        title: 'Paylaş',
        areaId: 'kitap-ve-hikaye-dunyasi',
        areaLabel: 'Kampüs Yolculuğum',
        journeyStepLabel: 'Kayıt ve Dışa Aktarma',
      },
    ],
    contentRefs: {
      ilkokulDoors: [],
      ilkokulVocabulary: [],
      ortaokulDimensions: [],
      ortaokulVocabulary: [],
      ortaokulExampleSentence: { english: '', turkish: '' },
      sentenceStartersByGrade: {},
    },
    options: {
      allowFreeDrawing: true,
      allowShapeStamps: true,
      allowWrittenDesign: true,
      allowPngExport: true,
    },
    startConditions: 'Yakında açılacak.',
    completionConditions: 'Yakında açılacak.',
    selfEvaluation: {
      options: [
        { id: 'learned', label: 'Bugün yeni bir şey öğrendim.', iconKey: 'learned' },
        { id: 'curious', label: 'Bir şeyi daha iyi anlamak istiyorum.', iconKey: 'curious' },
        { id: 'completed', label: 'Çalışmamı tamamladım.', iconKey: 'completed' },
      ],
    },
    source: 'TODO: kaynak doğrulanacak',
    verificationStatus: 'TODO: kaynak doğrulanacak',
    targetGrades: [3, 4, 5, 6, 7],
    contentVersion: '0.1.0',
  },
];

export function getMissionById(id: string): MissionDefinition | undefined {
  return MISSIONS.find((mission) => mission.id === id);
}

export function getActiveMissions(): MissionDefinition[] {
  return MISSIONS.filter((mission) => mission.status === 'active');
}
