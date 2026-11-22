import type { MissionStageId } from '@/src/types/campus';
export { getEnglishNameSpeech as getGrade3StageTwoSpeech, splitForSpeech } from '@/src/services/englishNameSpeech';

const hello = 'Hello!';
const question = "What's your name?";
const fullNamePrefix = 'My name is ';
const shortNamePrefix = "I'm ";
const greetingPrefix = 'Nice to meet you, ';
const sayName = (name: string) => `${fullNamePrefix}${name}.`;
const eceName = sayName('Ece');
const canName = sayName('Can');
const eceShortName = `${shortNamePrefix}Ece.`;
const meet = 'Nice to meet you.';
const meetToo = 'Nice to meet you, too.';
const meetExclamation = 'Nice to meet you!';
const meetTooExclamation = 'Nice to meet you, too!';

export const GRADE_3_STAGE_2 = {
  id: 'my-name-is',
  grade: 3,
  firstStageLabel: '1. Aşama · Hello Garden',
  secondStageLabel: '2. Aşama · My Name Is…',
  stageHint: 'Tanışmayı keşfet, öğren, kendi diyaloğunu kur ve paylaş.',
  tables: [
    { id: 'kesfet', label: 'Keşfet', title: 'Yeni Arkadaşımla Tanışıyorum' },
    { id: 'ogren', label: 'Öğren', title: 'Adımı Söylemeyi Öğreniyorum' },
    { id: 'uret', label: 'Üret', title: 'Kendi Tanışma Diyaloğumu Oluşturuyorum' },
    { id: 'paylas', label: 'Paylaş', title: 'Benimle Tanışır Mısın?' },
  ],
  common: {
    tableMenu: 'Masa menüsü',
    tableList: '2. Aşama masaları',
    locked: 'Önce önceki masayı tamamla.',
    finished: 'Tamamlandı',
    listen: 'Dinle',
    replay: 'Konuşmayı dinle',
    audioUnavailable: 'Ses bu cihazda kullanılamıyor.',
    audioOff: 'Ses kapalı. Metinden devam edebilirsin.',
    taskDone: 'Bu adımı tamamladın.',
    tryAgain: 'Tekrar dene!',
    reveal: 'Vurgulanan seçeneğe dokunarak devam et.',
    check: 'Sırayı kontrol et',
    orderHelp: 'Örnek sırayı uygula',
    nextTable: 'Sonraki masaya geç',
    sessionOnly: 'İlerleme bu oturumda tutuluyor.',
    activityError: 'Bu etkinlik şu an açılmadı. Masa menüsüne dönebilirsin.',
  },
  discover: {
    scene: [
      { speaker: 'Ece', text: `${hello} ${question}` },
      { speaker: 'Can', text: canName },
      { speaker: 'Ece', text: meetExclamation },
      { speaker: 'Can', text: meetTooExclamation },
    ],
    speakerPrompt: 'Bu soruyu kim söylüyor?',
    question,
    speakers: ['Can', 'Ece'],
    speakerHint: 'İlk konuşma balonunu oku, sonra konuşan arkadaşına dokun.',
    questionPrompt: 'Can’ın cevabından önce hangi soru gelir?',
    answer: canName,
    questionOptions: [meetExclamation, question],
    questionHint: 'Can adını söyledi. Adını soran ifadeyi bul.',
  },
  learn: {
    groups: [
      { title: 'Ad sorma', description: 'Bir arkadaşının adını öğrenmek için sor.', phrases: [question] },
      { title: 'Adını söyleme', description: 'Adını söylemenin iki yolunu dinle.', phrases: [eceName, eceShortName] },
      { title: 'Tanışma', description: 'Tanıştığına sevindiğini söyle ya da karşılık ver.', phrases: [meet, meetToo] },
    ],
    matchPrompt: 'Soru kartını seç, sonra cevabına dokun.',
    question,
    answerOptions: [meetToo, eceShortName],
    matchHint: 'Soruda ad isteniyor. Arkadaşının adını söylediği kartı seç.',
    scenePrompt: 'İfadeyi dinle veya oku. Hangi sahneye ait?',
    sceneText: meetToo,
    scenes: ['Bir arkadaş adını soruyor.', 'Bir arkadaş tanışmaya karşılık veriyor.'],
    sceneHint: 'Bu cümle bir soruya değil, tanışma sözlerine verilen karşılıktır.',
  },
  produce: {
    sentenceTitle: 'Kelime kartlarından cümle kur.',
    sentence: eceName,
    sentenceHint: 'Önce “My” ile başla. Ad en sona gelir.',
    guidedTitle: '1. Tur · Örnekle diyaloğu sırala',
    independentTitle: '2. Tur · Can ile örneksiz sırala',
    reordering: 'Kartı eklemek için dokun. Sıradan çıkarmak için tekrar dokun.',
    guided: [`${hello} ${question}`, eceName, meetExclamation, meetTooExclamation],
    independent: [`${hello} ${question}`, canName, meetExclamation, meetTooExclamation],
    orderHint: 'Önce selam ve soru, sonra ad, en sonda tanışma sözleri gelir.',
    orderReveal: 'Doğru sıraya bak ya da örnek sırayı kartlara uygula.',
    sample: 'Soluk örnek',
    correctOrder: 'Vurgulanan sıra',
    mixedSentence: [2, 0, 3, 1],
    mixedGuided: [2, 0, 3, 1],
    mixedIndependent: [3, 1, 0, 2],
  },
  share: {
    names: ['Ali', 'Elif', 'Mert', 'Zeynep'],
    chooseName: 'Bir takma ad seç.',
    participant: 'Sen',
    rounds: [
      { speaker: 'Ece', title: '1. Tur · Ece ile tanış' },
      { speaker: 'Can', title: '2. Tur · Can ile tanış' },
    ],
    greeting: `${hello} ${question}`,
    introductionPrompt: 'Sıra sende. Adını söyle.',
    frame: 'My name is ___.',
    introduce: sayName,
    introduceDistractors: [question, meetTooExclamation],
    extraDistractor: hello,
    partnerReply: (name: string) => `${greetingPrefix}${name}!`,
    replyPrompt: 'Şimdi tanışma sözüne karşılık ver.',
    reply: meetTooExclamation,
    replyDistractors: [question, eceName],
    introductionHint: 'Adını söylediğin cümleyi bul.',
    replyHint: 'Arkadaşın tanıştığına sevindi. Aynı duyguyu paylaşan karşılığı seç.',
    hintButton: 'İpucu',
    badge: 'I Can Introduce Myself!',
    badgeText: 'İki tanışma konuşmasını da tamamladın!',
  },
} as const;

export const GRADE_3_STAGE_2_TASKS = {
  kesfet: ['speaker', 'question'],
  ogren: ['match', 'scene'],
  uret: ['sentence', 'guidedDialogue', 'independentDialogue'],
  paylas: ['eceIntroduction', 'eceReply', 'canIntroduction', 'canReply'],
} as const satisfies Record<MissionStageId, readonly string[]>;

export type Grade3StageTwoTask = (typeof GRADE_3_STAGE_2_TASKS)[MissionStageId][number];
export type Grade3StageTwoCompleted = Partial<Record<Grade3StageTwoTask, true>>;

export function isGrade3StageTwoTableComplete(table: MissionStageId, done: Grade3StageTwoCompleted): boolean {
  if (table === 'uret') return !!(done.sentence && (done.guidedDialogue || done.independentDialogue));
  return GRADE_3_STAGE_2_TASKS[table].every((task) => done[task] === true);
}
