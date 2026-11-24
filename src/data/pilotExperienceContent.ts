import type { SupportedGrade } from '@/src/types/campus';
import type { Position } from '@/src/features/walkable/types';

export const PILOT_TITLE = 'Gökyüzünde İlk Görevim';

export const PILOT_APRON = {
  width: 960,
  height: 640,
  spawn: { x: 472, y: 485 },
  captainSpawn: { x: 532, y: 460 },
  exit: { x: 480, y: 608, radius: 30 },
  stairs: { x: 616, y: 396 },
  boardingStudent: { x: 615, y: 362 },
  boardingCaptain: { x: 644, y: 373 },
};

export type PilotLine = { speaker: 'captain' | 'student'; text: string };

export const PILOT_WELCOME = {
  opener: 'Hoş geldin! Bugün birlikte bir eğitim uçuşu yapacağız.',
  question: 'Kaptana ne söylersin?',
  options: ['Hazırım kaptan! Önce ne yapacağız?', 'Hazırlık yapmadan hemen havalanalım.'],
  hint: 'Birlikte yapacağımız hazırlığı kaptana sor.',
  reply: 'Önce uçağımızı tanıyacak ve uçuş için hazırlık yapacağız.',
};

type PilotPart = { id: string; name: string; action: string; position: Position; explanation: string };
export const PILOT_PARTS: readonly PilotPart[] = [
  { id: 'body', name: 'Gövde', action: 'Gövdeyi İncele', position: { x: 510, y: 406 }, explanation: 'Bu, uçağın gövdesi. Yolcuların oturduğu bölüm ve yük bölümü gövdenin içindedir.' },
  { id: 'wing', name: 'Kanatlar', action: 'Kanatları İncele', position: { x: 206, y: 393 }, explanation: 'Kanatlar uçağın havada kalmasına yardımcı olur. Uçağımıza park alanındaki işaretli çizginin gerisinden bakıyoruz.' },
  { id: 'engine', name: 'Motorlar', action: 'Motorları İncele', position: { x: 414, y: 393 }, explanation: 'Motorlar uçağı ileri iter. Havaalanında bir uçağa her zaman yetkilinin yanında ve güvenli alandan yaklaşırız.' },
  { id: 'cockpit', name: 'Kokpit', action: 'Kokpiti İncele', position: { x: 737, y: 392 }, explanation: 'Öndeki pencereler kokpite ait. Pilotlar dışarıyı ve göstergeleri buradan izler.' },
];

export const PILOT_PREPARATION = [
  { id: 'belt', label: 'Emniyet kemeri', line: 'Kokpite hoş geldin. Yan yana oturduk. Önce emniyet kemerini bağla.', action: 'Kemerimi Bağla' },
  { id: 'gauges', label: 'Göstergeler', line: 'Önündeki göstergelerden biri yönümüzü, diğeri ne kadar yüksekte olduğumuzu gösterir. İkisini de incele.' },
  { id: 'weather', label: 'Hava durumu', line: 'Hava haberini inceleyelim. Bugün açık ve sakin. Yarınsa fırtına bekleniyor. Fırtınada uçuşu ertelemek daha güvenli.' },
  { id: 'decision', label: 'Uçuş koşulu', line: 'Bu eğitim uçuşu için hangi havayı seçmeliyiz?' },
  { id: 'checklist', label: 'Hazırlık listesi', line: 'Kemer, göstergeler ve hava. Uçuşa çıkmadan önce üçünü de hazırlık listesinde doğrula.' },
] as const;

export const PILOT_GAUGES = [
  { id: 'heading', label: 'Yön göstergesi', explanation: 'Sağa ya da sola yöneldiğimizde işaret hareket eder.' },
  { id: 'altitude', label: 'Yükseklik göstergesi', explanation: 'Yükseldiğimizde işaret yukarı, alçaldığımızda aşağı gider.' },
] as const;

export const PILOT_WEATHER = [
  { id: 'clear', label: 'Açık ve sakin hava', report: 'Görüş açık, rüzgâr sakin.' },
  { id: 'storm', label: 'Fırtınalı hava', report: 'Görüş azalabilir, rüzgâr kuvvetlenebilir.' },
] as const;

export const PILOT_WEATHER_ANSWERS = {
  2: ['Güneşli ve sakin havada uçarım.', 'Fırtınalı havada uçarım.'],
  3: ['Açık hava eğitim uçuşu için daha uygun. Fırtına bekleniyorsa uçuşu erteleriz.', 'Fırtına bekleniyorsa görüşe bakmadan yola çıkarız.'],
  4: ['Fırtınada işaretleri görmek zorlaşabilir. Açık ve sakin koşulları seçer, koşullar değişirse uçuşu ertelerim.', 'Hazırlık listesini bitirince hava koşullarının önemi kalmaz.'],
} as const;

export type PilotCheckpoint = { x: number; height: number; z: number; label: string; guidance: string };
export const PILOT_COURSES: Record<SupportedGrade, {
  tolerance: number;
  drift: number;
  points: readonly PilotCheckpoint[];
}> = {
  2: {
    tolerance: 31,
    drift: 0,
    points: [
      { x: 73, height: 102, z: 275, label: 'Sağdaki halka', guidance: 'Şimdi uçağımızı yavaşça sağa yönlendir. İlk halkanın ortasına yaklaş.' },
      { x: 73, height: 167, z: 550, label: 'Yüksekteki halka', guidance: 'Güzel, ilk noktayı geçtin! Şimdi yukarı tuşuyla yüksekteki halkaya yaklaş.' },
      { x: -13, height: 167, z: 825, label: 'Soldaki halka', guidance: 'Son halka solda. Uçağımızı yavaşça sola yönlendir.' },
    ],
  },
  3: {
    tolerance: 24,
    drift: 0,
    points: [
      { x: 81, height: 102, z: 290, label: 'Vadi girişi', guidance: 'Sağa yönelip haritadaki ilk kontrol noktasından geç.' },
      { x: 50, height: 171, z: 590, label: 'Bulut hizası', guidance: 'İlk nokta tamam. Haritadaki ikinci halkayı bul ve yükseklik göstergeni izle.' },
      { x: -64, height: 119, z: 890, label: 'Vadi çıkışı', guidance: 'Son işarete ulaşmak için yön ve yüksekliğini birlikte ayarla.' },
    ],
  },
  4: {
    tolerance: 17,
    drift: 7,
    points: [
      { x: 86, height: 124, z: 300, label: 'Vadi girişi', guidance: 'Haritada ilk noktayı bul. Hafifçe kayan rotayı küçük yön ve yükseklik düzeltmeleriyle hizala.' },
      { x: 19, height: 179, z: 630, label: 'Sırt geçidi', guidance: 'İkinci kontrol noktasına ilerle. Yön ve yükseklik göstergelerindeki değişimi karşılaştır.' },
      { x: -90, height: 127, z: 970, label: 'Vadi çıkışı', guidance: 'Son halkada sıralamayı sen belirle. Ön camdaki işareti ve rota haritasını birlikte kullan.' },
    ],
  },
};

export const PILOT_LANDING = {
  line: 'Üç kontrol noktası tamam! Pisti önümüzde görebiliyoruz. Pist çizgileriyle hizalanan yaklaşmayı seçelim.',
  feedback: 'Önündeki pistin orta çizgisi ile yaklaşma okunun hizalanmasına bak.',
  reason: 'Pistten yana doğru uzaklaşırsak neye bakarız?',
  reasons: ['Ön camdaki orta çizgiyi ve yön göstergesini izler, küçük bir düzeltme yaparız.', 'Yönümüz değişse de aynı şekilde devam ederiz.'],
  approach: 'Ok ile pistin orta çizgisini hizala. Sonra aşağı tuşuyla yavaşça alçal.',
  flare: 'Pistle hizalandık. Şimdi birlikte yumuşakça iniyoruz.',
  complete: 'Uçuş hazırlığını yaptın, üç kontrol noktasını geçtin ve kaptanla güvenli bir iniş tamamladın.',
};
