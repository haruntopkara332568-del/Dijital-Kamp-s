import { splitForSpeech } from '@/src/data/grade3Stage2Content';
import { getStudentCharacter, type StudentCharacterId } from '@/src/data/studentCharacters';
import type { DialogueSegment } from '@/src/types/campus';

export type SultanhaniEncounterPhase =
  | 'ARRIVAL'
  | 'APPROACH'
  | 'FACING'
  | 'DIALOG_1'
  | 'DIALOG_2'
  | 'WALK_TO_DOOR'
  | 'TRANSITION'
  | 'DONE';

export const SULTANHANI_NEXT_PHASE: Record<
  SultanhaniEncounterPhase,
  SultanhaniEncounterPhase | null
> = {
  ARRIVAL: 'APPROACH',
  APPROACH: 'FACING',
  FACING: 'DIALOG_1',
  DIALOG_1: 'DIALOG_2',
  DIALOG_2: 'WALK_TO_DOOR',
  WALK_TO_DOOR: 'TRANSITION',
  TRANSITION: 'DONE',
  DONE: null,
};

export function canTransitionSultanhaniPhase(
  current: SultanhaniEncounterPhase,
  next: SultanhaniEncounterPhase,
): boolean {
  return SULTANHANI_NEXT_PHASE[current] === next;
}

/**
 * Tek durum makinesi adım durumları (Aşama B hata önleme mimarisi).
 */
export type SultanhaniFlowStepPhase =
  | 'ARRIVAL'
  | 'APPROACH'
  | 'FACING'
  | 'STUDENT_CHOICE'
  | 'STUDENT_SPEAKING'
  | 'WAIT_BEFORE_TOURIST'
  | 'TOURIST_SPEAKING'
  | 'WAIT_AFTER_TOURIST'
  | 'TOURIST_ASKING_NAME'
  | 'STUDENT_INTRODUCTION'
  | 'WALK_TO_DOOR'
  | 'TRANSITION'
  | 'DONE';

export interface SultanhaniFlowState {
  stepPhase: SultanhaniFlowStepPhase;
  exchangeIndex: number;
}

export type SultanhaniFlowEvent =
  | { type: 'SCENE_READY' }
  | { type: 'ENTER_PROXIMITY' }
  | { type: 'FACING_COMPLETE' }
  | { type: 'STUDENT_OPTION_SELECTED' }
  | { type: 'STUDENT_SPEECH_COMPLETE' }
  | { type: 'START_TOURIST_REPLY' }
  | { type: 'TOURIST_SPEECH_COMPLETE' }
  | { type: 'AFTER_TOURIST_PAUSE_COMPLETE' }
  | { type: 'TOURIST_NAME_QUESTION_COMPLETE' }
  | { type: 'STUDENT_INTRODUCTION_CONFIRMED' }
  | { type: 'REENTER_PORTAL' }
  | { type: 'ARRIVED_AT_DOOR' }
  | { type: 'FORCE_DOOR_WATCHDOG' }
  | { type: 'TRANSITION_COMPLETE' };

/**
 * Durum makinesi için saf (pure) geçiş fonksiyonu.
 * Geçersiz veya çift tetiklenen olaylarda `null` döndürerek aynı adımın iki kez çalışmasını engeller.
 * Değişim sayısını sabit sayı yerine `totalExchanges` (liste uzunluğu) parametresinden alır.
 */
export function advanceSultanhaniFlowState(
  current: SultanhaniFlowState,
  event: SultanhaniFlowEvent,
  totalExchanges: number,
): SultanhaniFlowState | null {
  switch (event.type) {
    case 'SCENE_READY':
      if (current.stepPhase !== 'ARRIVAL') return null;
      return { stepPhase: 'APPROACH', exchangeIndex: 0 };

    case 'ENTER_PROXIMITY':
      if (current.stepPhase !== 'ARRIVAL' && current.stepPhase !== 'APPROACH') return null;
      return { stepPhase: 'FACING', exchangeIndex: 0 };

    case 'FACING_COMPLETE':
      if (current.stepPhase !== 'FACING') return null;
      return { stepPhase: 'STUDENT_CHOICE', exchangeIndex: 0 };

    case 'STUDENT_OPTION_SELECTED':
      if (current.stepPhase !== 'STUDENT_CHOICE') return null;
      return { stepPhase: 'STUDENT_SPEAKING', exchangeIndex: current.exchangeIndex };

    case 'STUDENT_SPEECH_COMPLETE':
      if (current.stepPhase !== 'STUDENT_SPEAKING') return null;
      return { stepPhase: 'WAIT_BEFORE_TOURIST', exchangeIndex: current.exchangeIndex };

    case 'START_TOURIST_REPLY':
      if (current.stepPhase !== 'WAIT_BEFORE_TOURIST') return null;
      return { stepPhase: 'TOURIST_SPEAKING', exchangeIndex: current.exchangeIndex };

    case 'TOURIST_SPEECH_COMPLETE':
      if (current.stepPhase !== 'TOURIST_SPEAKING') return null;
      return { stepPhase: 'WAIT_AFTER_TOURIST', exchangeIndex: current.exchangeIndex };

    case 'AFTER_TOURIST_PAUSE_COMPLETE': {
      if (current.stepPhase !== 'WAIT_AFTER_TOURIST') return null;
      const nextIndex = current.exchangeIndex + 1;
      if (nextIndex < totalExchanges) {
        return { stepPhase: 'STUDENT_CHOICE', exchangeIndex: nextIndex };
      }
      return { stepPhase: 'TOURIST_ASKING_NAME', exchangeIndex: current.exchangeIndex };
    }

    case 'TOURIST_NAME_QUESTION_COMPLETE':
      if (current.stepPhase !== 'TOURIST_ASKING_NAME') return null;
      return { stepPhase: 'STUDENT_INTRODUCTION', exchangeIndex: current.exchangeIndex };

    case 'STUDENT_INTRODUCTION_CONFIRMED':
      if (current.stepPhase !== 'STUDENT_INTRODUCTION') return null;
      return { stepPhase: 'WALK_TO_DOOR', exchangeIndex: current.exchangeIndex };

    case 'REENTER_PORTAL':
      if (current.stepPhase !== 'DONE') return null;
      return { stepPhase: 'WALK_TO_DOOR', exchangeIndex: current.exchangeIndex };

    case 'ARRIVED_AT_DOOR':
    case 'FORCE_DOOR_WATCHDOG':
      if (current.stepPhase !== 'WALK_TO_DOOR') return null;
      return { stepPhase: 'TRANSITION', exchangeIndex: current.exchangeIndex };

    case 'TRANSITION_COMPLETE':
      if (current.stepPhase !== 'TRANSITION') return null;
      return { stepPhase: 'DONE', exchangeIndex: current.exchangeIndex };

    default:
      return null;
  }
}

export function mapFlowStateToEncounterPhase(
  state: SultanhaniFlowState,
): SultanhaniEncounterPhase {
  switch (state.stepPhase) {
    case 'ARRIVAL':
      return 'ARRIVAL';
    case 'APPROACH':
      return 'APPROACH';
    case 'FACING':
      return 'FACING';
    case 'STUDENT_CHOICE':
    case 'STUDENT_SPEAKING':
    case 'WAIT_BEFORE_TOURIST':
    case 'TOURIST_SPEAKING':
    case 'WAIT_AFTER_TOURIST':
      return state.exchangeIndex >= 2 ? 'DIALOG_2' : 'DIALOG_1';
    case 'TOURIST_ASKING_NAME':
    case 'STUDENT_INTRODUCTION':
      return 'DIALOG_2';
    case 'WALK_TO_DOOR':
      return 'WALK_TO_DOOR';
    case 'TRANSITION':
      return 'TRANSITION';
    case 'DONE':
      return 'DONE';
  }
}

/**
 * Yalnızca geliştirme modunda çalışan tek satırlık durum günlüğü (üretimde sessiz).
 */
export function logSultanhaniFlow(detail: string): void {
  const isDev = (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV === true;
  if (isDev) {
    console.log(`[akış] DURUM → ${detail}`);
  }
}

export const SULTANHANI_READY_STUDENT_NAMES = ['Ali', 'Elif', 'Mert', 'Zeynep'] as const;

export const SULTANHANI_TIMINGS = {
  facingPauseMs: 800,
  afterStudentLinePauseMs: 500,
  afterTouristLinePauseMs: 600,
  interLinePauseMs: 600,
  walkToDoorWatchdogMs: 12_000,
  transitionFadeMs: 550,
  reducedMotionTransitionMs: 250,
} as const;

export const SULTANHANI_VOICE_PITCH = {
  student: 1.1,
  tourist: 0.95,
} as const;

export const SULTANHANI_SPEECH_RATES = {
  'en-US': 0.85,
  'tr-TR': 0.9,
} as const;

export function estimateLineDurationMs(text: string): number {
  return Math.max(2000, text.length * 90);
}

export function getSpeechTimeoutMs(text: string): number {
  return Math.round(estimateLineDurationMs(text) * 1.5);
}

export function resolveSultanhaniStudentName(
  profileAlias?: string | null,
  characterId?: StudentCharacterId | null,
  fallbackIndex = 0,
): string {
  const cleanAlias = profileAlias?.trim();
  if (cleanAlias) return cleanAlias;

  const character = getStudentCharacter(characterId);
  if (character?.label) return character.label;

  const safeIndex = Math.abs(fallbackIndex) % SULTANHANI_READY_STUDENT_NAMES.length;
  return SULTANHANI_READY_STUDENT_NAMES[safeIndex];
}

const TURKISH_NAME_FALLBACKS: Record<string, string> = {
  Ece: 'Eh-jeh',
  Can: 'Jahn',
  Elif: 'Eh-leef',
  Mert: 'Mehrt',
  Zeynep: 'Zay-nep',
  Ali: 'Ah-lee',
  Deniz: 'Deh-neez',
  Arda: 'Ahr-dah',
  Gezgin: 'Gehz-geen',
  Bilgin: 'Beel-geen',
  Kâşif: 'Kah-sheef',
  Kaşif: 'Kah-sheef',
  Kaan: 'Kahn',
  Ayşe: 'Eye-sheh',
  Emre: 'Em-reh',
  Yusuf: 'Yoo-soof',
  Defne: 'Def-neh',
  Kerem: 'Keh-rem',
  Beren: 'Beh-ren',
};

function isStandaloneTurkishName(candidate?: string): candidate is string {
  if (!candidate) return false;
  const trimmed = candidate.trim();
  if (!trimmed || trimmed === 'Alex') return false;
  return /^[\p{Lu}][\p{L}\p{M}]*$/u.test(trimmed);
}

export function buildSultanhaniSpeechSegments(
  text: string,
  options: { hasTurkishVoice: boolean; extraTurkishName?: string },
): DialogueSegment[] {
  const names = new Set(Object.keys(TURKISH_NAME_FALLBACKS));
  if (isStandaloneTurkishName(options.extraTurkishName)) {
    names.add(options.extraTurkishName.trim());
  }
  const nameList = [...names];
  const parts = splitForSpeech(text, nameList);
  const isValidSplit = parts.length > 0 && parts.map((part) => part.text).join('') === text;

  if (options.hasTurkishVoice && isValidSplit) {
    const hasEnglishPart = parts.some((part) => part.lang === 'en');
    if (hasEnglishPart) {
      return parts.map((part) => ({
        text: part.text,
        lang: part.lang === 'tr' ? 'tr-TR' : 'en-US',
      }));
    }
  }

  if (!isValidSplit) {
    return [{ text, lang: 'en-US' }];
  }

  const spokenFallbackText = parts
    .map((part) => {
      if (part.lang === 'en') return part.text;
      let replaced = part.text;
      for (const name of nameList) {
        const fallback = TURKISH_NAME_FALLBACKS[name];
        if (!fallback) continue;
        const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        replaced = replaced.replace(
          new RegExp(`(?<![\\p{L}\\p{M}\\p{N}_])${escaped}(?![\\p{L}\\p{M}\\p{N}_])`, 'gu'),
          fallback,
        );
      }
      return replaced;
    })
    .join('');

  return [{ text: spokenFallbackText, lang: 'en-US' }];
}

export type SultanhaniDialogPhase = 'DIALOG_1' | 'DIALOG_2';
export type SultanhaniSpeaker = 'student' | 'tourist';

export interface SultanhaniDialogChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface SultanhaniDialogExchange {
  id: string;
  phase: SultanhaniDialogPhase;
  studentText: string;
  touristText: string;
  distractors: readonly [string, string];
  options: readonly SultanhaniDialogChoiceOption[];
  hintTurkish: string;
}

export interface SultanhaniDialogStep {
  id: string;
  phase: SultanhaniDialogPhase;
  speaker: SultanhaniSpeaker;
  text: string;
  options?: readonly SultanhaniDialogChoiceOption[];
  hintTurkish?: string;
}

export const SULTANHANI_FEEDBACK_COPY = {
  tryAgain: 'Tekrar dene!',
  highlightPrompt: 'Parlayan seçeneğe dokunarak devam edebilirsin.',
  studentPromptLabel: 'Sen ne söylersin?',
  studentSpeakerLabel: 'Sen',
  listenOptionAriaPrefix: 'Seçeneği dinle',
  wrongWordForbiddenCheck: true,
} as const;

export const SULTANHANI_SELF_INTRODUCTION = {
  question: 'What is your name?',
  sentenceStem: 'My name is …',
  instruction: 'Şimdi kendi adını söyle.',
  confirmLabel: 'Söyledim',
} as const;

function shuffleOptionsWithSeed(
  correctText: string,
  distractors: readonly [string, string],
  stepIndex: number,
  seed: number,
): SultanhaniDialogChoiceOption[] {
  const base: SultanhaniDialogChoiceOption[] = [
    { id: `step-${stepIndex}-correct`, text: correctText, isCorrect: true },
    { id: `step-${stepIndex}-d1`, text: distractors[0], isCorrect: false },
    { id: `step-${stepIndex}-d2`, text: distractors[1], isCorrect: false },
  ];

  const targetSlot = (Math.abs(seed) + stepIndex * 2 + 1) % 3;
  const swapOrder = stepIndex % 2 === 0;
  const ordered: SultanhaniDialogChoiceOption[] = [base[1], base[2]];
  if (swapOrder) ordered.reverse();
  ordered.splice(targetSlot, 0, base[0]);
  return ordered;
}

/**
 * Aktif dış mekân konuşma değişimleri (Bölüm 5 Hedef Akış: 3 sıralı değişim).
 * Değişim sayısı doğrudan bu listenin uzunluğundan okunur.
 */
export const SULTANHANI_ACTIVE_EXCHANGE_DEFINITIONS = [
  {
    id: 'exchange-1-hello',
    phase: 'DIALOG_1' as const,
    studentText: 'Hello!',
    touristText: 'Hello!',
    distractors: ["What's your name?", 'Nice to meet you.'] as const,
    hintTurkish: 'Yeni karşılaştığın birine merhaba demek için "Hello!" dersin.',
  },
  {
    id: 'exchange-2-good-morning',
    phase: 'DIALOG_1' as const,
    studentText: 'Good morning!',
    touristText: 'Good morning!',
    distractors: ["What's your name?", 'Nice to meet you.'] as const,
    hintTurkish: 'Sabah günaydın demek için "Good morning!" ifadesini seç.',
  },
  {
    id: 'exchange-3-whats-your-name',
    phase: 'DIALOG_2' as const,
    studentText: "What's your name?",
    touristText: 'My name is Alex.',
    distractors: ['Good morning!', 'Nice to meet you.'] as const,
    hintTurkish: 'Arkadaşının adını sormak için "What\'s your name?" sorusunu kullan.',
  },
] as const;

export function buildSultanhaniDialogExchanges(
  shuffleSeed = 0,
): readonly SultanhaniDialogExchange[] {
  return SULTANHANI_ACTIVE_EXCHANGE_DEFINITIONS.map((def, index) => ({
    ...def,
    options: shuffleOptionsWithSeed(def.studentText, def.distractors, index, shuffleSeed),
  }));
}

/**
 * Bölüm 5 kuralı gereği aktif akıştan çıkarılan ancak silinmeyip ayrı bir listede korunan
 * ek tanışma adımları ("Turist: What's your name?", "My name is [ad].", "Nice to meet you").
 * Aktif dış mekân akışı bu listeyi KULLANMAZ.
 */
export function buildSultanhaniUnusedExtendedSteps(
  studentName: string,
  shuffleSeed = 0,
): readonly SultanhaniDialogStep[] {
  const myNameLine = `My name is ${studentName}.`;
  const niceToMeetNamedLine = `Nice to meet you, ${studentName}!`;

  return [
    {
      id: 'unused-d2-tourist-ask-name',
      phase: 'DIALOG_2',
      speaker: 'tourist',
      text: "What's your name?",
    },
    {
      id: 'unused-d2-student-my-name',
      phase: 'DIALOG_2',
      speaker: 'student',
      text: myNameLine,
      options: shuffleOptionsWithSeed(myNameLine, ['Hello!', 'Nice to meet you.'], 3, shuffleSeed),
      hintTurkish: `Kendi adını söylemek için "${myNameLine}" cümlesini seç.`,
    },
    {
      id: 'unused-d2-tourist-nice-to-meet',
      phase: 'DIALOG_2',
      speaker: 'tourist',
      text: niceToMeetNamedLine,
    },
    {
      id: 'unused-d2-student-nice-too',
      phase: 'DIALOG_2',
      speaker: 'student',
      text: 'Nice to meet you, too!',
      options: shuffleOptionsWithSeed(
        'Nice to meet you, too!',
        ['Good morning!', "What's your name?"],
        4,
        shuffleSeed,
      ),
      hintTurkish: 'Tanıştığına memnun olduğunu belirten karşılık için "Nice to meet you, too!" seç.',
    },
  ] as const;
}

/**
 * Aktif değişim listesinden düz adım dizisi üreten yardımcı.
 */
export function buildSultanhaniDialogueSteps(
  studentName = 'Ali',
  shuffleSeed = 0,
): readonly SultanhaniDialogStep[] {
  void studentName;
  const exchanges = buildSultanhaniDialogExchanges(shuffleSeed);
  const steps: SultanhaniDialogStep[] = [];

  for (const ex of exchanges) {
    steps.push({
      id: `${ex.id}-student`,
      phase: ex.phase,
      speaker: 'student',
      text: ex.studentText,
      options: ex.options,
      hintTurkish: ex.hintTurkish,
    });
    steps.push({
      id: `${ex.id}-tourist`,
      phase: ex.phase,
      speaker: 'tourist',
      text: ex.touristText,
    });
  }

  return steps;
}
