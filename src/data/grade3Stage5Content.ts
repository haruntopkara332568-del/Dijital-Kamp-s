import { GRADE_3_STAGE_3, type StageThreeAge } from './grade3Stage3Content';
import { SULTANHANI_IMAGES } from './sultanhaniStageFourAssets';
import type { MissionStageId } from '@/src/types/campus';

const phrases = {
  welcome: 'Welcome!',
  welcomeAlex: 'Welcome, Alex!',
  thanks: 'Thank you!',
  where: 'Where are we?',
  place: 'This is Sultanhanı Caravanserai.',
  beautiful: "It's beautiful!",
  agree: 'Yes, it is!',
  askAge: 'How old are you?',
  introduce: 'This is my friend Can.',
  greetCan: 'Hello, Can! Nice to meet you!',
  meet: 'Nice to meet you, too!',
} as const;

export const STAGE_FIVE_AGES = GRADE_3_STAGE_3.ages;
export const STAGE_FIVE_CAN_ID = GRADE_3_STAGE_3.characters.Can.characterId;

export function stageFiveAgeLine(age: StageThreeAge): string {
  const example = STAGE_FIVE_AGES.find(({ value }) => value === age);
  return "I'm " + (example?.word ?? 'nine') + ' years old.';
}

export const GRADE_3_STAGE_5 = {
  stageLabel: '5. Aşama · Welcome to Sultanhanı!',
  stageHint: 'Sultanhanı’nı tanıt ve Alex ile konuşmaya hazırlan.',
  titles: {
    kesfet: 'Sultanhanı’nı Tanıyorum',
    ogren: 'Nerede Olduğumuzu Söylüyorum',
    uret: 'Turist İçin Konuşmamı Hazırlıyorum',
    paylas: 'Sultanhanı’nda Konuşmaya Hazırım!',
  } satisfies Record<MissionStageId, string>,
  images: SULTANHANI_IMAGES,
  discover: [
    { id: 'welcome', text: phrases.welcome, withAlex: phrases.welcomeAlex, label: 'Kapıda karşılama', meaning: 'Hoş geldin!' },
    { id: 'thanks', text: phrases.thanks, label: 'Teşekkür etme', meaning: 'Teşekkür ederim!' },
    { id: 'place', text: phrases.place, label: 'Sultanhanı Kervansarayı', meaning: 'Burası Sultanhanı Kervansarayı.' },
    { id: 'beautiful', text: phrases.beautiful, label: 'Güzel bir avlu', meaning: 'Çok güzel!' },
  ],
  learn: [
    { speaker: 'Alex', text: phrases.where, meaning: 'Neredeyiz?', note: 'Bulunduğun yeri öğrenmek için sor.' },
    { speaker: 'Sen', text: phrases.place, meaning: 'Burası Sultanhanı Kervansarayı.', note: 'Bulunduğun yeri tanıt.' },
    { speaker: 'Alex', text: phrases.beautiful, meaning: 'Çok güzel!', note: 'Beğendiğini söyle.' },
    { speaker: 'Sen', text: phrases.agree, meaning: 'Evet, öyle!', note: 'Aynı fikirde olduğunu söyle.' },
  ],
} as const;

export type StageFiveDiscoverItem = (typeof GRADE_3_STAGE_5.discover)[number];

export const STAGE_FIVE_DISCOVER_TASKS = [
  { id: 'match-welcome', phrase: 'welcome', hint: 'Biri geldiğinde onu karşıladığımız görseli düşün.' },
  { id: 'match-thanks', phrase: 'thanks', hint: 'Bu sözle birine teşekkür ederiz.' },
  { id: 'match-place', phrase: 'place', hint: 'Rehber, Sultanhanı Kervansarayı’nın adını söylüyor.' },
] as const;

export const STAGE_FIVE_LEARN_TASKS = [
  { id: 'learn-place', prompt: phrases.where, answer: phrases.place, choices: [phrases.agree, phrases.place, phrases.thanks], hint: 'Soruda nerede olduğunuzu öğrenmek istiyor.' },
  { id: 'learn-agree', prompt: phrases.beautiful, answer: phrases.agree, choices: [phrases.agree, phrases.welcomeAlex, phrases.place], hint: 'Alex güzelliğinden söz ediyor. Ona katıldığını söyle.' },
  { id: 'pair-place', prompt: phrases.where, answer: phrases.place, choices: [phrases.thanks, phrases.agree, phrases.place], hint: 'Mekânı tanıtan yanıtı ara.' },
  { id: 'pair-agree', prompt: phrases.beautiful, answer: phrases.agree, choices: [phrases.place, phrases.agree, phrases.welcomeAlex], hint: 'Beğeniye katıldığını söyle.' },
] as const;

const dialogue = [
  { speaker: 'Sen', text: phrases.welcomeAlex },
  { speaker: 'Alex', text: phrases.thanks + ' ' + phrases.where },
  { speaker: 'Sen', text: phrases.place },
  { speaker: 'Alex', text: phrases.beautiful },
  { speaker: 'Sen', text: phrases.agree },
] as const;

type StageFiveCard = { text: string; speaker?: 'Sen' | 'Alex' };

export const STAGE_FIVE_PRODUCE_TASKS = [
  { id: 'build-place', title: 'Mekânı tanıt', cards: [{ text: 'This' }, { text: 'is' }, { text: 'Sultanhanı' }, { text: 'Caravanserai.' }], order: [2, 0, 3, 1], hint: 'Cümle “This” ile başlıyor.' },
  { id: 'build-welcome', title: 'Alex’i karşıla', cards: [{ text: 'Welcome,' }, { text: 'Alex!' }], order: [1, 0], hint: 'Önce karşılama sözünü söyle.' },
  { id: 'build-dialogue', title: 'Konuşmayı sıraya koy', cards: dialogue, order: [3, 0, 4, 2, 1], hint: 'Konuşma bir karşılama ile başlıyor.' },
  { id: 'build-age', title: 'Örnek yaşı söyle', cards: [{ text: "I'm" }, { text: 'nine' }, { text: 'years old.' }], order: [1, 2, 0], hint: 'Önce “I’m”, sonra sayı geliyor.' },
  { id: 'build-friend', title: 'Can’ı tanıt', cards: [{ text: 'This is' }, { text: 'my friend' }, { text: 'Can.' }], order: [2, 0, 1], hint: 'Önce tanıtma kalıbını kullan.' },
  { id: 'build-meet', title: 'Tanışmaya karşılık ver', cards: [{ text: 'Nice to' }, { text: 'meet you,' }, { text: 'too!' }], order: [1, 2, 0], hint: '“Too!” cümlenin sonunda geliyor.' },
] as const satisfies readonly { id: string; title: string; cards: readonly StageFiveCard[]; order: readonly number[]; hint: string }[];

export type StageFiveSpeaker = 'Sen' | 'Alex' | 'Can';
export type StageFiveTurn = {
  speaker: StageFiveSpeaker;
  text: string;
  choices?: readonly string[];
  hint?: string;
};

export function stageFiveRehearsal(age: StageThreeAge, hasCan: boolean): StageFiveTurn[] {
  const ageLine = stageFiveAgeLine(age);
  const turns: StageFiveTurn[] = [
    { ...dialogue[0], choices: [phrases.thanks, phrases.welcomeAlex, phrases.agree], hint: 'Alex’i karşıla.' },
    dialogue[1],
    { ...dialogue[2], choices: [phrases.place, phrases.beautiful, phrases.agree], hint: 'Bulunduğunuz yeri tanıt.' },
    dialogue[3],
    { ...dialogue[4], choices: [phrases.place, phrases.welcomeAlex, phrases.agree], hint: 'Alex’in beğenisine katıldığını söyle.' },
    { speaker: 'Alex', text: phrases.askAge },
    { speaker: 'Sen', text: ageLine, choices: STAGE_FIVE_AGES.map(({ value }) => stageFiveAgeLine(value)), hint: `Seçtiğin örnek yaş ${age}.` },
  ];
  if (hasCan) turns.push(
    { speaker: 'Sen', text: phrases.introduce, choices: [phrases.agree, phrases.introduce, phrases.welcomeAlex], hint: 'Yanınızdaki Can’ı tanıt.' },
    { speaker: 'Alex', text: phrases.greetCan },
    { speaker: 'Can', text: phrases.meet },
  );
  return turns;
}

export const STAGE_FIVE_REHEARSALS = ['rehearsal-guided', 'rehearsal-independent'] as const;

export const STAGE_FIVE_TASKS = {
  kesfet: STAGE_FIVE_DISCOVER_TASKS.map(({ id }) => id),
  ogren: STAGE_FIVE_LEARN_TASKS.map(({ id }) => id),
  uret: STAGE_FIVE_PRODUCE_TASKS.map(({ id }) => id),
  paylas: STAGE_FIVE_REHEARSALS,
} satisfies Record<MissionStageId, readonly string[]>;

export type StageFiveTaskId = (typeof STAGE_FIVE_TASKS)[MissionStageId][number];
