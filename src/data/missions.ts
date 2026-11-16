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
    id: 'aksaray-kulturel-miras-rotasi',
    title: 'Aksaray Kültürel Miras Rotası',
    version: '1.0.0',
    status: 'active',
    gradeRange: [2, 3, 4, 5, 6, 7],
    relatedAreaIds: ['gezi-ve-kesif', 'ingilizce-dunyasi', 'kitap-ve-hikaye-dunyasi'],
    routeKind: 'thematic-digital-route',
    guidePromptGroup: 'aksaray',
    learningObjectives: {
      ilkokul: [
        'Aksaray tematik dijital öğrenme rotasındaki dört durağı malzeme ve biçim özellikleriyle ayırt etmek.',
        'İngilizce "Arch" kelimesinin "Kemer" anlamıyla eşleşmesini görsel üzerinden göstermek.',
        'Serbest çizim, hazır şekil veya kısa yazıyla seçtiği duraktan esinlenen özgün bir çalışma üretmek.',
      ],
      ortaokul: [
        'Sultanhanı Kervansarayı, Eğri Minare, Zinciriye Medresesi ve Ihlara Vadisi duraklarını malzeme, biçim, işlev ve süsleme boyutlarında karşılaştırmak.',
        'Arch, Brick, Courtyard, Valley ve Heritage kelimelerini bağlam içinde ayırt etmek ve örnek cümlede kullanmak.',
        'Seçtiği duraklardan yola çıkarak özgün bir tasarım veya karşılaştırmalı gezi anlatımı üretip tek PNG çalışmasında bütünleştirmek.',
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
          id: 'sultanhani',
          title: 'Sultanhanı Kervansarayı',
          illustration: 'sultanhani',
          periodBadge: '1229 · Anadolu Selçuklu',
          shortDescription:
            'I. Alâeddin Keykubad döneminde yapılan, yazlık açık avlulu ve kışlık kapalı hollü büyük taş kervansaray.',
          materialHint: 'Kesme taş',
          sourceNote: 'Aksaray İl Kültür ve Turizm Müdürlüğü & Aksaray Valiliği',
        },
        {
          id: 'egri-minare',
          title: 'Eğri Minare (Kızıl Minare)',
          illustration: 'egri-minare',
          periodBadge: '13. Yüzyıl · Anadolu Selçuklu',
          shortDescription:
            'Taş kaide üzerinde yükselen, kırmızı tuğla gövdeli, zikzak örgülü ve çini mozaik süslemeli eğik minare.',
          materialHint: 'Kırmızı tuğla ve çini',
          sourceNote: 'Aksaray İl Kültür ve Turizm Müdürlüğü',
        },
        {
          id: 'zinciriye',
          title: 'Zinciriye Medresesi',
          illustration: 'zinciriye',
          periodBadge: '1336 · Karamanoğulları',
          shortDescription:
            'Yahşi Bey tarafından yaptırılan, dört eyvanlı, açık avlulu ve dış duvarları dendaneli tarihî eğitim yapısı.',
          materialHint: 'Tüf kesme taş ve tuğla',
          sourceNote: 'MEB EBA & Aksaray İl Kültür ve Turizm Müdürlüğü',
        },
        {
          id: 'ihlara',
          title: 'Ihlara Vadisi ve Melendiz Çayı',
          illustration: 'ihlara',
          periodBadge: 'Doğal Kanyon ve Kaya Oyma Miras',
          shortDescription:
            'Hasan Dağı volkanik tabakalarının Melendiz Çayı ile aşınmasıyla oluşan 14 km kanyon ve kaya oyma mekânlar.',
          materialHint: 'Doğal kaya ve akarsu',
          sourceNote: 'T.C. Kültür ve Turizm Bakanlığı & Müze Portalı',
        },
      ],
      ilkokulVocabulary: [
        {
          id: 'vocab-arch',
          word: 'Arch',
          turkishMeaning: 'Kemer',
          exampleSentence: 'Look at the stone arch.',
          exampleTurkish: 'Taş kemere bak.',
          illustration: 'sultanhani',
        },
      ],
      ortaokulDimensions: [
        {
          id: 'malzeme',
          title: 'Malzeme',
          prompt: 'Duraklarda insan yapımı taş-tuğla ile doğal kaya nasıl farklılaşıyor?',
          choices: [
            'Sultanhanı kesme taş, Eğri Minare kırmızı tuğla ve çini, Zinciriye taş-tuğla birlikte kullanır.',
            'Ihlara Vadisi’nde yapılar dışarıdan örülmek yerine doğal volkanik kayaçlara oyulmuştur.',
            'Her durak çevresindeki yerel taş, kil ve kayaç imkânlarından yararlanmıştır.',
          ],
        },
        {
          id: 'bicim',
          title: 'Biçim',
          prompt: 'Durakların plan düzeni ve yükseliş biçimi nasıl ayrışıyor?',
          choices: [
            'Sultanhanı yazlık avlu ve kışlık hol düzenine, Zinciriye dört eyvanlı açık avluya sahiptir.',
            'Eğri Minare dört köşe kaide üstünde yükselen eğimli silindirik gövdelidir.',
            'Ihlara Vadisi dik kanyon duvarları boyunca uzanan doğal bir geçit biçimindedir.',
          ],
        },
        {
          id: 'islev',
          title: 'İşlev',
          prompt: 'Bu dört durak geçmişte ve günümüzde hangi amaçlara hizmet etmiştir?',
          choices: [
            'Sultanhanı İpek Yolu yolcularının konaklaması, Zinciriye Medresesi ise eğitim için yapılmıştır.',
            'Eğri Minare ibadet çağrısı ve şehir simgesi olarak öne çıkar.',
            'Ihlara Vadisi erken dönem kaya yerleşimlerine ve günümüzde doğa-kültür yürüyüşlerine ev sahipliği yapar.',
          ],
        },
        {
          id: 'susleme',
          title: 'Süsleme',
          prompt: 'Yüzey detaylarında ve çevre dokusunda neler göze çarpıyor?',
          choices: [
            'Sultanhanı taç kapısında taş kabartma ve geometrik bezemeler dikkat çeker.',
            'Eğri Minare’de zikzak tuğla örgü ve çini mozaik kuşaklar görülür.',
            'Zinciriye’de kale görünümü veren dendaneler, Ihlara’da kaya oyma nişler ve fresk izleri yer alır.',
          ],
        },
      ],
      ortaokulVocabulary: [
        {
          id: 'vocab-arch',
          word: 'Arch',
          turkishMeaning: 'Kemer',
          illustration: 'sultanhani',
          contrastNote: 'Taş taç kapılarda ve medrese eyvanlarında üst açıklığı taşıyan kavisli mimari öğedir.',
        },
        {
          id: 'vocab-brick',
          word: 'Brick',
          turkishMeaning: 'Tuğla',
          illustration: 'egri-minare',
          contrastNote: 'Pişmiş kilden yapılan yapı malzemesidir; Eğri Minare kırmızı tuğlasıyla tanınır.',
        },
        {
          id: 'vocab-courtyard',
          word: 'Courtyard',
          turkishMeaning: 'Avlu',
          illustration: 'zinciriye',
          contrastNote: 'Yapıların ortasında yer alan üstü açık toplanma ve geçiş alanıdır.',
        },
        {
          id: 'vocab-valley',
          word: 'Valley',
          turkishMeaning: 'Vadi',
          illustration: 'ihlara',
          contrastNote: 'Akarsuyun aşındırmasıyla oluşan iki yamaç arasındaki uzun çukur yeryüzü şeklidir.',
        },
        {
          id: 'vocab-heritage',
          word: 'Heritage',
          turkishMeaning: 'Miras / Kültürel Miras',
          contrastNote: 'Geçmişten günümüze ulaşan ve korunması gereken tarihî, mimari ve doğal değerlerdir.',
        },
      ],
      ortaokulExampleSentence: {
        english: 'This courtyard has a stone arch and red brick walls.',
        turkish: 'Bu avluda taş bir kemer ve kırmızı tuğla duvarlar vardır.',
      },
      sentenceStartersByGrade: {
        2: ['Aksaray durağında ... gördüm.'],
        3: ['Seçtiğim durakta ... kullanılmış.'],
        4: ['Aksaray rotasında en çok ... ilgimi çekti. Burada ...'],
        5: [
          'Bu Aksaray durağında ... malzemesi öne çıkıyor çünkü ...',
          'Tasarladığım gezi kartında ... ve ... bölümlerini birleştirdim.',
        ],
        6: [
          'Seçtiğim yapıyı Ihlara Vadisi ile karşılaştırdığımda ... farkını gözlemledim çünkü ...',
        ],
      },
    },
    uiCopy: {
      kesfetPrimaryBadge: 'Gezi ve Keşif · Tematik Dijital Öğrenme Rotası',
      kesfetPrimaryHeading: 'Aksaray Duraklarını Keşfet',
      kesfetPrimaryEarlyDesc:
        'Bu dijital öğrenme rotasında beğendiğin duraklara dokun. (Fiziksel yol tarifi değildir.)',
      kesfetPrimaryDesc:
        'Aksaray tematik dijital öğrenme rotasındaki dört durağı incele ve sonraki adımda kullanacağın durakları seç.',
      kesfetMiddleBadge: 'Gezi ve Keşif · Tematik Dijital Öğrenme Rotası',
      kesfetMiddleHeading: 'Aksaray Duraklarını Malzeme ve Çevre Açısından Karşılaştır',
      kesfetMiddleDesc:
        'Bu rota fiziksel ulaşım güzergâhı değil, dijital gözlem yolculuğudur. Dört durağı inceleyip aşağıdaki boyutlarda gözlemlerini seç.',
      selectedCarryoverLabel: 'Seçtiğin Aksaray durakları',
      ogrenPrimaryHeading: 'Yeni Kelimemiz: Arch — Kemer',
      ogrenMiddleHeading: 'Mimari ve Miras Kelimelerini Keşfet',
      ogrenPrimaryMatchQuestion: 'Eşleştirme: "Arch" kelimesinin Türkçe karşılığı hangisidir?',
      ogrenPrimaryCorrectFeedback:
        'Harika! "Arch", taş kapılarda ve medrese girişlerinde gördüğümüz kemer anlamına gelir.',
      ogrenPrimaryMatchOptions: [
        { id: 'match-arch', label: 'Kemer', isCorrect: true, desc: 'Kapı veya avlu üstündeki kavisli taş açıklık' },
        { id: 'match-valley', label: 'Vadi', isCorrect: false, desc: 'Akarsuyun aşındırdığı derin yeryüzü alanı' },
        { id: 'match-brick', label: 'Tuğla', isCorrect: false, desc: 'Pişmiş kilden yapılan kırmızı yapı malzemesi' },
      ],
      ogrenPrimaryContextPrefix: 'Keşfet adımında seçtiğin duraklar',
      ogrenMiddleComparePair: [
        {
          word: 'Arch',
          meaning: 'Kemer',
          desc: 'Taç kapı ve revak açıklıklarında kullanılan kavisli taş öğe',
          illustration: 'sultanhani',
        },
        {
          word: 'Courtyard',
          meaning: 'Avlu',
          desc: 'Kervansaray veya medresenin ortasındaki açık taş alan',
          illustration: 'zinciriye',
        },
      ],
      uretHeadingEarly: 'Aksaray Çalışmanı Çiz veya Şekil Ekle',
      uretHeadingPrimary: 'Kendi Aksaray Gezi Kartını Oluştur',
      uretHeadingMiddle: 'Aksaray Tasarımını Oluştur ve Gerekçelendir',
      uretHintPrimary:
        'İstersen "Hazır Şekil Ekle" düğmeleriyle bir kemer, sütun ve avlu ağacı ekle; istersen Ihlara Vadisi veya Eğri Minare’yi fırçayla çiz.',
      uretHintMiddle:
        'Malzeme seçip çalışmana ad ver. Seçtiğin Aksaray durağındaki stone/brick/arch özelliklerini neden tercih ettiğini karşılaştırarak yazabilirsin.',
      uretNameLabelPrimary: 'Çalışmana Kısa Bir Ad Ver (İsteğe Bağlı)',
      uretNameLabelMiddle: 'Aksaray Çalışmanın Adı',
      uretNamePlaceholderPrimary: 'Örneğin: Sultanhanı Kemeri',
      uretNamePlaceholderMiddle: 'Örneğin: Taş Avlu ve Kemer Tasarımı',
      uretTextLabelPrimary: 'Seçtiğin durak hakkında gördüklerini kısaca yaz (isteğe bağlı)',
      uretTextLabelMiddle: 'Aksaray Gözlemini ve Tasarım Gerekçeni Açıkla',
      uretTextPlaceholderEarly: 'Örneğin: Kemer, Taş, Arch...',
      uretTextPlaceholderPrimary: 'Sultanhanı avlusunda taş bir kemer gördüm...',
      uretTextPlaceholderMiddle: 'Zinciriye Medresesi ve Eğri Minare’yi karşılaştırırken...',
      uretTextPlaceholderGrade7:
        'Dört Aksaray durağının malzeme, biçim ve çevre uyumunu gerekçeleriyle 4–6 cümlede değerlendir...',
      artifactDefaultNamePrimary: 'Aksaray Keşif Kartım',
      artifactDefaultNameMiddle: 'Aksaray Miras Çalışmam',
      materialChoices: [
        'Kesme Taş',
        'Kırmızı Tuğla ve Çini',
        'Taş ve Tuğla',
        'Doğal Kaya ve Su',
        'Ahşap ve Taş',
      ],
    },
    options: {
      allowFreeDrawing: true,
      allowShapeStamps: true,
      allowWrittenDesign: true,
      allowPngExport: true,
    },
    startConditions: 'Öğrencinin sınıf düzeyi seçilmiş olmalıdır.',
    completionConditions:
      'Tüm sınıf düzeylerinde serbest çizim, hazır şekil veya anlamlı yazılı anlatımdan yalnız biri yeterlidir.',
    selfEvaluation: {
      options: [
        { id: 'learned', label: 'Bugün yeni bir şey öğrendim.', iconKey: 'learned' },
        { id: 'curious', label: 'Bir şeyi daha iyi anlamak istiyorum.', iconKey: 'curious' },
        { id: 'completed', label: 'Çalışmamı tamamladım.', iconKey: 'completed' },
      ],
    },
    source:
      'https://aksaray.ktb.gov.tr/TR-63658/hanlar-ve-kervansaraylar.html | https://aksaray.ktb.gov.tr/TR-232485/egri-minare.html | https://okuldisiogrenme.eba.gov.tr/mekan-detay/zinciriye-medresesi-5892 | https://aksaray.ktb.gov.tr/TR-243212/ihlara-vadisi.html',
    verificationStatus: 'dogrulandi',
    targetGrades: [2, 3, 4, 5, 6, 7],
    contentVersion: '1.0.0',
  },
];

export function getMissionById(id: string): MissionDefinition | undefined {
  return MISSIONS.find((mission) => mission.id === id);
}

export function getActiveMissions(): MissionDefinition[] {
  return MISSIONS.filter((mission) => mission.status === 'active');
}
