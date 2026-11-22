import type { MissionStageId } from '@/src/types/campus';

const numbers = [
  { value: 7, word: 'seven', task: 'seven' },
  { value: 8, word: 'eight', task: 'eight' },
  { value: 9, word: 'nine', task: 'nine' },
  { value: 10, word: 'ten', task: 'ten' },
] as const;

export type StageThreeAge = (typeof numbers)[number]['value'];
export type StageThreeSpeaker = 'Ece' | 'Can' | 'Sen';
export type StageThreeLine = { speaker?: StageThreeSpeaker; text: string };

const ageInEnglish = (age: StageThreeAge) => numbers.find(({ value }) => value === age)!.word;
const ageAnswer = (age: StageThreeAge) => `I'm ${ageInEnglish(age)} years old.`;
const shortAgeAnswer = (age: StageThreeAge) => `I'm ${ageInEnglish(age)}.`;
const hello = 'Hello!';
const question = 'How old are you?';
const nameQuestion = "What's your name?";
const ageFrame = "I'm ___ years old.";
const ece = { name: 'Ece', age: 8, characterId: 'ece' } as const;
const can = { name: 'Can', age: 9, characterId: 'deniz' } as const;
const discoverLines = [
  { speaker: ece.name, text: question },
  { speaker: can.name, text: ageAnswer(can.age) },
] as const;

export const GRADE_3_STAGE_3 = {
  id: 'how-old-are-you',
  grade: 3,
  stageLabel: '3. Aşama · How Old Are You?',
  stageHint: 'Sayıları dinle, yaş sor ve bir oyun karakterinin yaşını söyle.',
  tables: [
    { id: 'kesfet', label: 'Keşfet', title: 'Sayı Taşlarının Sırrı' },
    { id: 'ogren', label: 'Öğren', title: 'Yaşımı Söylüyorum' },
    { id: 'uret', label: 'Üret', title: 'Yaş Diyaloğumu Oluşturuyorum' },
    { id: 'paylas', label: 'Paylaş', title: 'Yeni Arkadaşım Kaç Yaşında?' },
  ],
  common: {
    tableList: '3. Aşama masaları',
    tableMenu: 'Masa menüsü',
    nextTable: 'Sonraki masaya geç',
    finished: 'Tamamlandı',
    locked: 'Önce önceki masayı tamamla.',
    taskDone: 'Bu adımı tamamladın.',
    tryAgain: 'Tekrar dene!',
    reveal: 'Vurgulanan seçeneğe dokunarak devam et.',
    read: 'Metni göster',
    listen: 'Dinle',
    replay: 'Tekrar dinle',
    dialogueListen: 'Konuşmayı dinle',
    audioUnavailable: 'Ses bu cihazda kullanılamıyor.',
    audioOff: 'Ses kapalı. Metinden devam edebilirsin.',
    sessionOnly: 'İlerleme bu oturumda tutuluyor.',
    activityError: 'Bu etkinlik şu an açılmadı. Masa menüsüne dönebilirsin.',
  },
  characters: { Ece: ece, Can: can },
  ages: numbers,
  discover: {
    rounds: [numbers[1], numbers[0], numbers[3], numbers[2]],
    narrator: ece.name,
    listenAndPick: 'Sayıyı dinle. Sonra sayı taşını seç.',
    numberListen: 'Sayıyı dinle',
    numberHint: 'Bir kez daha dinle veya sayı kelimesini oku.',
    lines: discoverLines,
    ageQuestion: 'Can kaç yaşında? Doğru taşı seç.',
    ageHint: 'Can’ın cümlesindeki sayıya dikkat et.',
  },
  learn: {
    cards: [
      { text: question, explanation: 'Bir arkadaşının yaşını öğrenmek için sor.' },
      { text: shortAgeAnswer(8), explanation: 'Yaşını kısaca söyle.' },
      { text: ageAnswer(9), explanation: 'Yaşını tam cümleyle söyle.' },
    ],
    question,
    pairPrompt: 'Soru kartına dokun, sonra cevabını seç.',
    pairOptions: [question, shortAgeAnswer(ece.age)],
    pairHint: 'Yaş sorusuna sayıyla cevap verilir.',
    agePrompt: 'Oyun karakterin için bir yaş seç.',
    ageFrame,
    ageAnswer,
    confirmAge: 'Cümleyi tamamla',
    identifyPrompt: 'Cümleyi dinle veya oku. Kim söylüyor?',
    identifyText: shortAgeAnswer(can.age),
    identifyHint: 'Ece 8, Can 9 yaşında. Cümledeki sayı hangisi?',
    people: [{ label: 'Ece · 8', speaker: ece.name }, { label: 'Can · 9', speaker: can.name }],
  },
  produce: {
    orderPrompt: 'Kartları sıraya koymak için dokun. Çıkarmak için tekrar dokun.',
    firstSentence: 'Yaş cevabını kur.',
    secondSentence: 'Yaş sorusunu kur.',
    guided: '1. Tur · Konuşmayı örnekle sırala',
    independent: '2. Tur · Konuşmayı örneksiz sırala',
    answer: ageAnswer(can.age),
    question,
    example: 'Soluk örnek',
    check: 'Sırayı kontrol et',
    applyOrder: 'Gösterilen sırayı kullan',
    orderReveal: 'Vurgulanan sıraya bakıp yeniden dene.',
    sentenceHint: 'İlk kelime büyük harfle başlar. Noktalama işareti en sonda kalır.',
    dialogueHint: 'Önce selamlaşma, ardından soru ve cevap gelir.',
    guidedLines: [
      { speaker: ece.name, text: hello },
      { speaker: can.name, text: hello },
      ...discoverLines,
    ],
    pickDialogueAge: 'Diyaloğundaki oyun karakteri için bir yaş seç.',
    savedDialogue: 'Kaydettiğin yaş diyaloğu',
    editDialogue: 'Yeni bir diyalog kur',
    dialogue: (age: StageThreeAge) => [
      { speaker: can.name, text: question },
      { speaker: 'Sen', text: ageAnswer(age) },
    ] as const,
  },
  share: {
    dialogueTitle: 'Üret masasında hazırladığın diyalog',
    noDialogue: 'Üret masasına dön. Bir sanal yaş seçip diyaloğunu kaydettiğinde burada görebilirsin.',
    downloadDialogue: 'Diyaloğu indir (.txt)',
    dialogueFilename: '3-asama-yas-diyalogum.txt',
    participant: 'Sen',
    rounds: [
      { speaker: ece.name, title: '1. Tur · Ece ile konuş', answer: shortAgeAnswer(ece.age),
        tasks: { greet: 'eceGreet', age: 'eceAge', ask: 'eceAsk', end: 'eceEnd' } },
      { speaker: can.name, title: '2. Tur · Can ile konuş', answer: shortAgeAnswer(can.age),
        tasks: { greet: 'canGreet', age: 'canAge', ask: 'canAsk', end: 'canEnd' } },
    ],
    greeting: hello,
    question,
    unrelated: nameQuestion,
    greetPrompt: 'Selama karşılık ver.',
    greetHint: 'Selamlaşmak için “Hello!” kullan.',
    agePrompt: 'Karakterinin sanal yaşını söyle.',
    ageFrame,
    ageAnswer,
    ageHint: 'Karakterinin yaşını söyleyen cümleyi seç.',
    askPrompt: 'Şimdi arkadaşının yaşını sor.',
    askHint: 'Arkadaşının yaşını sormak için “How old are you?” kullan.',
    hintButton: 'İpucu',
    endRound: 'Turu tamamla',
    badge: 'I Can Ask About Age!',
    badgeText: 'İki konuşmada da yaş sordun ve cevap verdin!',
  },
} as const;

export const GRADE_3_STAGE_3_TASKS = {
  kesfet: ['seven', 'eight', 'nine', 'ten', 'understandAge'],
  ogren: ['pair', 'buildAge', 'identify'],
  uret: ['orderAnswer', 'orderQuestion', 'guided', 'independent'],
  paylas: ['eceGreet', 'eceAge', 'eceAsk', 'eceEnd', 'canGreet', 'canAge', 'canAsk', 'canEnd'],
} as const satisfies Record<MissionStageId, readonly string[]>;

export type Grade3StageThreeTask = (typeof GRADE_3_STAGE_3_TASKS)[MissionStageId][number];
export type Grade3StageThreeCompleted = Partial<Record<Grade3StageThreeTask, true>>;

export function isGrade3StageThreeTableComplete(table: MissionStageId, done: Grade3StageThreeCompleted): boolean {
  if (table === 'uret') return Boolean(done.orderAnswer && done.orderQuestion && (done.guided || done.independent));
  return GRADE_3_STAGE_3_TASKS[table].every((task) => done[task] === true);
}
