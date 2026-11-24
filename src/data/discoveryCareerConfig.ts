/**
 * Hayalden Gerçeğe — VR Meslek Keşfi ve Astronot Deneyimi Yapılandırma Dosyası
 *
 * Tüm sayısal ayarlar (süreler, mesafeler, ölçekler) burada toplanmıştır.
 * İleride yapılacak ince ayarlar için "ELLE AYARLANACAK" yorumları ile işaretlenmiştir.
 */

import { DISCOVERY_CLASSROOM } from '../features/walkable/engine/discoveryClassroomSceneRenderer';

/**
 * Durum Makinesi Durumları (Tüm akış için tek tip)
 * Sıralama:
 * CLASS_IDLE -> GLASSES_PROMPT -> CAREER_SELECT -> LANDING -> EXIT_LANDER -> GO_TO_ROCK -> SAMPLE_TAKEN -> COMPLETE -> CLASS_RETURN
 */
export type DiscoveryVrState =
  | 'CLASS_IDLE'
  | 'GLASSES_PROMPT'
  | 'CAREER_SELECT'
  | 'LANDING'
  | 'EXIT_LANDER'
  | 'GO_TO_ROCK'
  | 'SAMPLE_TAKEN'
  | 'COMPLETE'
  | 'CLASS_RETURN'
  | 'DOCTOR_VISIT'
  | 'VETERINARY_VISIT';

/**
 * Meslek Tanım Arayüzü
 * Yeni meslek eklemek yalnızca listeye bir kayıt eklemekten ibarettir.
 */
export interface CareerDefinition {
  id: string;
  title: string;
  portrait: number;
  sceneId?: 'discovery_moon' | 'discovery_doctor' | 'discovery_vet';
  buttonText?: string;
}

/**
 * Öğrenci referans boyu (Standart kampüs karakteri yüksekliği)
 */
export const STUDENT_HEIGHT_PX = 67; /* ELLE AYARLANACAK: Karakter yüksekliği (px) */
export const STUDENT_WIDTH_PX = 53;  /* ELLE AYARLANACAK: Karakter genişliği (px) */

/**
 * Gözlük ve Sehpa Etkileşim Ayarları
 */
export const DISCOVERY_VR_CONFIG = {
  /** Gözlük eylemi, masanın güneyindeki açık zemine yaklaşınca belirir. */
  pedestalInteraction: DISCOVERY_CLASSROOM.pedestal.approach,
  interactionEnterRadius: 42,
  interactionExitRadius: 54,

  /** Sahne geçiş (fade) süresi (ms) */
  fadeTransitionMs: 400, /* ELLE AYARLANACAK: Sahneler arası karar / aydınlan süresi */

  /** Bekçi zamanlayıcı aşım süresi (ms) */
  watchdogTimeoutMs: 15000, /* ELLE AYARLANACAK: Donma durumunda son duruma geçiren bekçi süresi */

  /** Sınıfa dönüşte öğrencinin sehpa önündeki doğuş noktası */
  returnClassroomSpawn: {
    x: 480,
    y: 530,
  },

  /** Ay Sahnesi Dünya Ölçüleri */
  moonScene: {
    width: 960,  /* ELLE AYARLANACAK: Ay sahnesi canvas genişliği */
    height: 640, /* ELLE AYARLANACAK: Ay sahnesi canvas yüksekliği */
  },

  /**
   * Parça 2 — İniş Animasyonu Zamanlama ve Süreleri (Toplam ~8 sn)
   */
  landingTimeline: {
    /** 1. Aşama: Aracın gökyüzünden yüzeye alçalması (ms) */
    descentDurationMs: 4200, /* ELLE AYARLANACAK: Alçalma süresi */
    /** 2. Aşama: Ayakların yüzeye teması, hafif sıkışma ve toz bulutunun dağılması (ms) */
    touchdownDurationMs: 1400, /* ELLE AYARLANACAK: Temas ve toz bulutu süresi */
    /** 3. Aşama: Kabin kapağının açılması (ms) */
    hatchOpenDurationMs: 800, /* ELLE AYARLANACAK: Kapak açılma süresi */
    /** 4. Aşama: Astronotun merdivenden inmesi ve zemine basması (ms) */
    exitLadderDurationMs: 1600, /* ELLE AYARLANACAK: Merdiven iniş süresi */
    /** Toplam süre: 4200 + 1400 + 800 + 1600 = 8000 ms (~8 sn) */
    totalAnimationDurationMs: 8000, /* ELLE AYARLANACAK: Toplam animasyon süresi */
    /** Hareketi azaltma (prefers-reduced-motion) geçiş süresi (ms) */
    motionReducedDurationMs: 600, /* ELLE AYARLANACAK: Hareketi azaltmada doğrudan geçiş süresi */
  },

  /**
   * İniş Aracı (Lander) Fiziksel ve Görsel Ölçüleri
   */
  lander: {
    width: 180,           /* ELLE AYARLANACAK: İniş aracı genişliği (px) */
    height: 190,          /* ELLE AYARLANACAK: İniş aracı yüksekliği (px) */
    targetX: 260,         /* ELLE AYARLANACAK: İndiği zemin X konumu */
    targetY: 220,         /* ELLE AYARLANACAK: İndiği zemin Y konumu */
    startAltitudeY: -220, /* ELLE AYARLANACAK: Başlangıç gökyüzü tepe Y konumu */
    shadowBaseY: 405,     /* ELLE AYARLANACAK: Zemindeki gölge Y konumu */
    shadowRadiusX: 85,    /* ELLE AYARLANACAK: Maksimum gölge genişlik yarıçapı */
    shadowRadiusY: 26,    /* ELLE AYARLANACAK: Maksimum gölge basıklık yarıçapı */
  },

  /**
   * Astronot Başlangıç ve Merdiven Konumu (Aynı görsel, aynı ölçek, aynı çapa)
   */
  astronautLanding: {
    width: STUDENT_WIDTH_PX,   /* 53 px */
    height: STUDENT_HEIGHT_PX, /* 67 px */
    /** Merdiven tepesi (kabin çıkış noktası) */
    ladderTop: { x: 326, y: 310 },     /* ELLE AYARLANACAK: Merdiven üst noktası */
    /** Merdiven dibi (yüzeye ayak basma noktası) */
    surfacePosition: { x: 330, y: 405 }, /* ELLE AYARLANACAK: Merdiven dibinde zemine basış konumu */
  },

  /**
   * Parça 3 — Ay Yüzeyi Görevi ve Kaya Örneği Yapılandırması
   */
  part3Mission: {
    /** Dünya ve Yürünebilir Alan Boyutları (~30 AB x 18 AB ölçeğine uyumlu) */
    worldWidth: 1340,  /* ELLE AYARLANACAK: Ay sahnesi dünya genişliği (px) */
    worldHeight: 680,  /* ELLE AYARLANACAK: Ay sahnesi dünya yüksekliği (px) */
    horizonY: 260,     /* ELLE AYARLANACAK: Kuzey ufuk çizgisi Y sınırı (px) */

    /** Yürünebilir Alan Sınır Kutuları */
    walkableBounds: {
      minX: 75,   /* ELLE AYARLANACAK: Batı sınırı */
      maxX: 1255, /* ELLE AYARLANACAK: Doğu sınırı */
      minY: 345,  /* ELLE AYARLANACAK: Kuzey sınırı (dağ eteği) */
      maxY: 645,  /* ELLE AYARLANACAK: Güney sınırı */
    },

    /**
     * İşaretli Ay Kayası (Lander'dan yaklaşık 8.5 AB mesafede)
     * Lander çıkışı: { x: 330, y: 405 } -> Kaya: { x: 900, y: 440 }
     * Mesafe = √((900-330)² + (440-405)²) = 571 px = ~8.52 AB (Kural: 8-10 AB)
     */
    targetRock: {
      x: 900,            /* ELLE AYARLANACAK: Hedef kaya X konumu */
      y: 440,            /* ELLE AYARLANACAK: Hedef kaya Y konumu */
      radius: 28,        /* ELLE AYARLANACAK: Kaya görsel yarıçapı */
      interactionRadius: Math.round(STUDENT_HEIGHT_PX * 1.5), /* ELLE AYARLANACAK: Giriş eşiği 1.5 AB (~101 px) */
      exitRadius: Math.round(STUDENT_HEIGHT_PX * 2.0),        /* ELLE AYARLANACAK: Çıkış eşiği 2.0 AB (~134 px) */
    },

    /**
     * Araca Dönüş Etkileşimi (İniş aracı merdiven dibi)
     */
    landerReturn: {
      x: 330,            /* ELLE AYARLANACAK: Araca dönüş etkileşim merkezi X */
      y: 405,            /* ELLE AYARLANACAK: Araca dönüş etkileşim merkezi Y */
      interactionRadius: Math.round(STUDENT_HEIGHT_PX * 1.5), /* ELLE AYARLANACAK: Giriş eşiği (~101 px) */
      exitRadius: Math.round(STUDENT_HEIGHT_PX * 2.0),        /* ELLE AYARLANACAK: Çıkış eşiği (~134 px) */
    },

    /** Örnek alma eğilme animasyonu süresi (ms) */
    sampleCollectDurationMs: 1000, /* ELLE AYARLANACAK: Astronotun kayaya eğilme süresi (~1 sn) */

    /**
     * Çevre Çeşitlendirme Büyük Kayaları (3-5 büyük kaya; yol üstünde engel teşkil etmez)
     * Araçtan kayaya giden yol (Y: 380..500) en az 2 AB genişliğinde tamamen açıktır.
     */
    decorativeBoulders: [
      { id: 'moon-boulder-1', x: 130, y: 360, width: 50, height: 35, name: 'Kuzeybatı Krater Kayası' },
      { id: 'moon-boulder-2', x: 170, y: 570, width: 62, height: 42, name: 'Güneybatı Bazalt Kayası' },
      { id: 'moon-boulder-3', x: 620, y: 335, width: 56, height: 38, name: 'Kuzey Sırt Kayası' },
      { id: 'moon-boulder-4', x: 610, y: 585, width: 58, height: 40, name: 'Güney Krater Yamacı' },
      { id: 'moon-boulder-5', x: 1090, y: 490, width: 66, height: 44, name: 'Doğu Volkanik Blok' },
    ],

    /**
     * Ay Yüzeyi Türk Bayrağı Yapılandırması
     * Eski bayraktan çok az büyük (FLAG_SCALE = 1.25)
     */
    flag: {
      FLAG_SCALE: 1.25,        /* ELLE AYARLANACAK: Eski bayraktan çok az büyük ölçek çarpanı */
      poleBaseX: 708,          /* ELLE AYARLANACAK: Direk tabanı X koordinatı (arka plan fotoğrafında) */
      poleBaseY: 182,          /* ELLE AYARLANACAK: Direk tabanı Y koordinatı (arka plan fotoğrafında) */
      assetUrl: '/assets/walkable/flag_turkey.png',
    },

    /**
     * Görev Yönergeleri ve Bildirim Metinleri (Tek cümle, kısa ve net)
     */
    instructions: {
      goToRock: 'İşaretli Ay kayasına yürü ve bir örnek al.',
      sampleTaken: 'Örneği aldın. Şimdi aracına dön.',
      complete: 'Ay yüzeyinden bir kaya örneği alıp aracına getirdin.',
      earlyLanderHint: 'Önce işaretli kayadan örnek al.',
    },
  },
} as const;

export const CAREER_ATLAS = { url: '/assets/walkable/career-portraits.png', columns: 4, rows: 3 } as const;

export const CAREER_LIST: readonly CareerDefinition[] = [
  { id: 'astronaut', title: 'Astronot', portrait: 0, sceneId: 'discovery_moon', buttonText: 'Ay Görevine Başla' },
  { id: 'doctor', title: 'Doktor', portrait: 1, sceneId: 'discovery_doctor' },
  { id: 'veterinarian', title: 'Veteriner Hekim', portrait: 2, sceneId: 'discovery_vet' },
  { id: 'pilot', title: 'Pilot', portrait: 3 },
  { id: 'architect', title: 'Mimar', portrait: 4 },
  { id: 'firefighter', title: 'İtfaiyeci', portrait: 5 },
  { id: 'traffic-officer', title: 'Trafik Polisi', portrait: 6 },
  { id: 'archaeologist', title: 'Arkeolog', portrait: 7 },
  { id: 'software-developer', title: 'Yazılım Geliştirici', portrait: 8 },
  { id: 'scientist', title: 'Bilim İnsanı', portrait: 9 },
  { id: 'agricultural-engineer', title: 'Ziraat Mühendisi', portrait: 10 },
  { id: 'marine-biologist', title: 'Deniz Biyoloğu', portrait: 11 },
];
