import type { SupportedGrade } from '@/src/types/campus';
import type { Position } from '@/src/features/walkable/types';

export const VETERINARY_CLINIC = {
  width: 960,
  height: 640,
  playerSpawn: { x: 474, y: 454 },
  fatherSpawn: { x: 532, y: 471 },
  veterinarian: { x: 368, y: 414 },
  dogOnTable: { x: 472, y: 287 },
  dogOnFloor: { x: 457, y: 434 },
  careBed: { x: 871, y: 352 },
  careWater: { x: 916, y: 376 },
  careToy: { x: 839, y: 355 },
  exit: { x: 480, y: 602, radius: 34 },
};

export const VET_DOG_WALK_MS = 3900;

export const VET_TASK_TITLES = [
  'Boncuk neden sessiz?',
  'Hayvanların dilini anlıyorum',
  'Boncuk’un ipuçlarını topluyorum',
  'Boncuk için güvenli bir ortam',
  'Bir günlük veteriner ekibi',
] as const;

export type VetSpeaker = 'father' | 'student' | 'veterinarian';
export const VET_SPEAKERS: Record<VetSpeaker | 'dog', string> = {
  father: 'Baba',
  student: 'Sen',
  veterinarian: 'Veteriner Hekim',
  dog: 'Boncuk',
};

type GradeText = string | Record<SupportedGrade, string>;
export function vetGradeText(text: GradeText, grade: SupportedGrade) {
  return typeof text === 'string' ? text : text[grade];
}

export type VetLine = { kind: 'line'; speaker: VetSpeaker; text: string };
export type VetChoice = { kind: 'choice'; prompt: string; options: readonly string[]; answer: number; hint: string };
export type VetActivityId = 'observe' | 'body-language' | 'evidence' | 'care';
export type VetTurn = VetLine | VetChoice | { kind: 'dog'; text: string } |
  { kind: 'activity'; activity: VetActivityId };
type GradedVetTurn = VetTurn | { kind: 'instruction'; text: GradeText };
type VetStation = { id: string; label: string; prompt: string; position: Position };
type VetSection = {
  task: number;
  station?: VetStation;
  instruction?: string;
  turns: readonly GradedVetTurn[];
};

const guide = (text: string): VetLine => ({ kind: 'line', speaker: 'veterinarian', text });
const father = (text: string): VetLine => ({ kind: 'line', speaker: 'father', text });
const choice = (prompt: string, options: readonly string[], answer: number, hint: string): VetChoice =>
  ({ kind: 'choice', prompt, options, answer, hint });
const activity = (id: VetActivityId): VetTurn => ({ kind: 'activity', activity: id });
const vetStation = (id: string, prompt: string): VetStation =>
  ({ id, label: 'Veteriner Hekim', prompt, position: { x: 364, y: 456 } });

export const VET_SECTIONS: readonly VetSection[] = [
  {
    task: 0,
    turns: [
      father('Bugün Boncuk’u veterinere getirdik. Hazır mısın?'),
      choice('Babana ne söylersin?', ['Hazırım baba! Boncuk’a ne olmuş?', 'Boncuk’u görmeden eve dönelim.'], 0, 'Boncuk’u görmek için hazırsan babana söyle.'),
      guide('Merhaba! Boncuk bugün biraz sessiz. Önce onu dikkatlice gözlemleyelim.'),
    ],
  },
  {
    task: 0,
    instruction: 'Ortadaki muayene masasına yaklaş ve Boncuk’u gözlemle.',
    station: { id: 'vet-observe', label: 'Boncuk', prompt: 'Boncuk’u Gözlemle', position: { x: 523, y: 445 } },
    turns: [
      { kind: 'dog', text: 'Boncuk başını hafifçe çevirip kısa bir ses çıkarıyor.' },
      { kind: 'instruction', text: {
        2: 'Boncuk’a bak. Pati ve göz ipuçlarını seç.',
        3: 'Boncuk’un nasıl durduğuna ve az önce ne yaptığına dikkat et. Gördüğün iki ipucunu seç.',
        4: 'Boncuk’a bak. Gördüklerin ile bu gördüklerinden çıkarabileceğin sonuçları birbirinden ayır.',
      } },
      activity('observe'),
    ],
  },
  {
    task: 1,
    instruction: 'Hayvanların beden dilini öğrenmek için veteriner hekime yaklaş.',
    station: vetStation('vet-body-language', 'Beden Dilini Öğren'),
    turns: [
      guide('Hayvanlar duruşları ve hareketleriyle iletişim kurar. Bu üç köpeği izle. Sence hangisi kendisini rahat hissediyor?'),
      activity('body-language'),
      guide('Çok güzel! Tek bir harekete bakmak yeterli değildir. Hayvanın bütün davranışlarını gözlemlemeliyiz.'),
      choice('Bir köpek geriye çekiliyorsa ne yaparsın?', ['Yanına koşup onu tutarım.', 'Olduğum yerde durur, ona alan bırakır ve bir yetişkine söylerim.'], 1, 'Geri çekilen bir köpeğe mesafe tanı. Yanına gitmeden yetişkine haber ver.'),
    ],
  },
  {
    task: 2,
    instruction: 'Babanla birlikte muayene masasının önündeki gözlem noktasına git.',
    station: { id: 'vet-evidence', label: 'Gözlem Noktası', prompt: 'İpuçlarını Dinle', position: { x: 477, y: 486 } },
    turns: [
      father('Boncuk bugün daha az hareket etti.'),
      guide('Peki, su içtiğini gözlemlediniz mi?'),
      father('Bugün çok az su içtiğini gördüm.'),
      guide('Bu bilgileri not edelim. Hayvanların sağlık durumunu değerlendirirken gözlemler önemlidir.'),
      { kind: 'instruction', text: {
        2: 'Babanın söylediği hareket ve su ipuçlarını gözlem kartına ekle.',
        3: 'Duyduğun bilgileri gözlem kartına ekle. Yalnızca babanın anlattıklarını seç.',
        4: 'Babanın anlattıklarıyla klinikte kendi gözünle gördüğün bilgiyi karşılaştır. Her kartın kaynağını seç.',
      } },
      activity('evidence'),
    ],
  },
  {
    task: 3,
    instruction: 'Bakım alanını nasıl hazırlayacağını öğrenmek için veterinere dön.',
    station: vetStation('vet-plan-care', 'Bakım İçin Plan Yap'),
    turns: [
      guide('Boncuk’un rahatlamasına yardımcı olmak için nasıl bir ortam hazırlayabiliriz?'),
      choice('Veteriner hekime ne önerirsin?', ['Sessiz bir yer ve temiz su hazırlayabiliriz.', 'Boncuk’un yanında gürültülü oyuncaklarla oynayabiliriz.'], 0, 'Boncuk’a rahatça dinlenebileceği bir yer düşün.'),
      guide('Pencerenin yanındaki bakım köşesine git. Minderi ve temiz suyu hazırla, ses çıkaran oyuncağı kaldır.'),
    ],
  },
  {
    task: 3,
    instruction: 'Pencerenin yanındaki bakım köşesine yürü.',
    station: { id: 'vet-care', label: 'Bakım Köşesi', prompt: 'Bakım Alanını Hazırla', position: { x: 844, y: 406 } },
    turns: [
      activity('care'),
      guide('Boncuk hazırladığın minderde dinleniyor. Bu köşe artık sessiz ve temiz.'),
    ],
  },
  {
    task: 4,
    instruction: 'Gözlemlerini anlatmak için veteriner hekime dön.',
    station: vetStation('vet-report', 'Gözlemlerini Paylaş'),
    turns: [
      guide('Boncuk hakkında neler öğrendik?'),
      choice('Hangi gözlemlerini paylaşabilirsin?', ['Daha az hareket ediyor ve bugün az su içmiş.', 'Neden sessiz olduğunu artık kesin olarak biliyorum.'], 0, 'Babanın gözlem kartına eklediğin hareket ve su bilgilerini hatırla.'),
      guide('Güzel gözlem yaptın. Bu bilgiler sağlık değerlendirmesinde önemlidir.'),
      father('Boncuk’un sağlığı için bundan sonra ne yapmalıyız?'),
      choice('Bundan sonra ne yapmak güvenli?', ['Ne yapılacağına kendi başımıza karar vermek.', 'Veteriner hekimin değerlendirmesine ve önerilerine uymak.'], 1, 'Sağlıkla ilgili değerlendirmeyi veteriner hekim yapar.'),
      guide('Harika! Hayvanları sevmek kadar onların ihtiyaçlarını anlamak ve gerektiğinde uzman yardımı almak da önemlidir.'),
    ],
  },
];

const gradeFourReason = choice(
  'Bakım köşesi Boncuk’a nasıl yardımcı oldu?',
  ['Sessiz köşe ve minder rahatça dinlenmesini sağlar, temiz suyu da yakınında tutar.', 'Boncuk’un sakinleşmesi için yanında oyuncakları daha yüksek sesle sallamak gerekir.'],
  0,
  'Sessizlik, temiz su ve rahat bir minderin Boncuk için neyi değiştirdiğini düşün.',
);

export function getVetTurns(section: number, grade: SupportedGrade): readonly VetTurn[] {
  const turns = VET_SECTIONS[section]?.turns ?? [];
  const ordered = section === 6 && grade === 4
    ? [...turns.slice(0, -1), gradeFourReason, ...turns.slice(-1)]
    : turns;
  return ordered.map((turn) => turn.kind === 'instruction' ? guide(vetGradeText(turn.text, grade)) : turn);
}

export const VET_BODY_EXAMPLES = [
  { pose: 'wary', label: 'Başını çeviriyor, gövdesi gergin.' },
  { pose: 'calm', label: 'Patilerini uzatmış, rahatça yatıyor.' },
  { pose: 'retreat', label: 'Kuyruğu aşağıda, geriye doğru çekiliyor.' },
] as const;

export const VET_EVIDENCE = [
  { text: 'Daha az hareket etti.', icon: 'paw', source: 'father' },
  { text: 'Bugün az su içti.', icon: 'water', source: 'father' },
  { text: 'Muayene masasında sakin duruyor.', icon: 'bed', source: 'seen' },
] as const;

export const VET_OBSERVATION = {
  2: {
    prompt: 'Boncuk’ta hangilerini görüyorsun?',
    clues: ['Patilerini masaya uzatmış.', 'Gözleri açık.', 'Koşuyor.'],
    correct: [0, 1],
  },
  3: {
    prompt: 'Gördüğün iki davranışı işaretle.',
    clues: ['Masada sakin duruyordu.', 'Başını hafifçe çevirdi.', 'Yerden su içti.'],
    correct: [0, 1],
  },
  4: {
    prompt: 'Yalnızca muayene masasında doğrulayabildiğin bilgileri seç.',
    clues: ['Patileri masanın üzerinde.', 'Başını çevirdi.', 'Gün boyu hiç koşmamış.', 'Neden sessiz kaldığını biliyorum.'],
    correct: [0, 1],
  },
} as const;

export const VET_CARE_ACTIONS = [
  { icon: 'bed', prompt: 'Boncuk’un dinlenme yerini seç.', choices: ['Yumuşak minder', 'Sert, boş kutu'], answer: 0, placed: 'Minder yerinde.', hint: 'Üzerinde rahatça yatabileceği bir yer seç.' },
  { icon: 'water', prompt: 'Bakım köşesine ne koyarsın?', choices: ['Temiz su kabı', 'Boş kap'], answer: 0, placed: 'Temiz su kabı yerinde.', hint: 'Boncuk’un kullanabileceği temiz su hazırla.' },
  { icon: 'sound', prompt: 'Ses çıkaran oyuncakla ne yaparsın?', choices: ['Boncuk’un yanında sallarım.', 'Oyuncağı bakım alanından uzaklaştırırım.'], answer: 1, placed: 'Köşe artık sessiz. Boncuk dinlenebilir.', hint: 'Dinlenme yerini sessiz tut.' },
] as const;

export const VET_COMPLETE = {
  heading: 'Hayvan Dostu Veteriner',
  text: 'Boncuk’u gözlemledin, doğru bilgileri paylaştın ve onun için güvenli bir dinlenme alanı hazırladın.',
};
