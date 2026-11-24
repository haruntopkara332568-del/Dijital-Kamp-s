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
 * Dış mekân durum makinesi adım durumları.
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
  | { type: 'SKIP_TOURIST_REPLY' }
  | { type: 'TOURIST_SPEECH_COMPLETE' }
  | { type: 'AFTER_TOURIST_PAUSE_COMPLETE' }
  | { type: 'REENTER_PORTAL' }
  | { type: 'ARRIVED_AT_DOOR' }
  | { type: 'FORCE_DOOR_WATCHDOG' }
  | { type: 'TRANSITION_COMPLETE' };

/**
 * Dış mekân durum makinesi için saf (pure) geçiş fonksiyonu.
 * Geçersiz veya çift tetiklenen olaylarda `null` döndürerek aynı adımın iki kez çalışmasını engeller.
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

    case 'SKIP_TOURIST_REPLY': {
      if (current.stepPhase !== 'WAIT_BEFORE_TOURIST') return null;
      const nextIndex = current.exchangeIndex + 1;
      if (nextIndex < totalExchanges) {
        return { stepPhase: 'STUDENT_CHOICE', exchangeIndex: nextIndex };
      }
      return { stepPhase: 'WALK_TO_DOOR', exchangeIndex: current.exchangeIndex };
    }

    case 'TOURIST_SPEECH_COMPLETE':
      if (current.stepPhase !== 'TOURIST_SPEAKING') return null;
      return { stepPhase: 'WAIT_AFTER_TOURIST', exchangeIndex: current.exchangeIndex };

    case 'AFTER_TOURIST_PAUSE_COMPLETE': {
      if (current.stepPhase !== 'WAIT_AFTER_TOURIST') return null;
      const nextIndex = current.exchangeIndex + 1;
      if (nextIndex < totalExchanges) {
        return { stepPhase: 'STUDENT_CHOICE', exchangeIndex: nextIndex };
      }
      return { stepPhase: 'WALK_TO_DOOR', exchangeIndex: current.exchangeIndex };
    }

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
    case 'WALK_TO_DOOR':
      return 'WALK_TO_DOOR';
    case 'TRANSITION':
      return 'TRANSITION';
    case 'DONE':
      return 'DONE';
  }
}

/**
 * İç mekân durum makinesi adım durumları.
 */
export type SultanhaniInnerFlowStepPhase =
  | 'WALK_IN'
  | 'FACING'
  | 'STUDENT_CHOICE'
  | 'STUDENT_SPEAKING'
  | 'WAIT_BEFORE_TOURIST'
  | 'TOURIST_SPEAKING'
  | 'WAIT_AFTER_TOURIST'
  | 'DONE';

export interface SultanhaniInnerFlowState {
  stepPhase: SultanhaniInnerFlowStepPhase;
  exchangeIndex: number;
}

export type SultanhaniInnerFlowEvent =
  | { type: 'INNER_WALK_COMPLETE' }
  | { type: 'FACING_COMPLETE' }
  | { type: 'STUDENT_OPTION_SELECTED' }
  | { type: 'STUDENT_SPEECH_COMPLETE' }
  | { type: 'START_TOURIST_REPLY' }
  | { type: 'SKIP_TOURIST_REPLY' }
  | { type: 'TOURIST_SPEECH_COMPLETE' }
  | { type: 'AFTER_TOURIST_PAUSE_COMPLETE' };

export function advanceSultanhaniInnerFlowState(
  current: SultanhaniInnerFlowState,
  event: SultanhaniInnerFlowEvent,
  totalExchanges: number,
): SultanhaniInnerFlowState | null {
  switch (event.type) {
    case 'INNER_WALK_COMPLETE':
      if (current.stepPhase !== 'WALK_IN') return null;
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

    case 'SKIP_TOURIST_REPLY': {
      if (current.stepPhase !== 'WAIT_BEFORE_TOURIST') return null;
      const nextIndex = current.exchangeIndex + 1;
      if (nextIndex < totalExchanges) {
        return { stepPhase: 'STUDENT_CHOICE', exchangeIndex: nextIndex };
      }
      return { stepPhase: 'DONE', exchangeIndex: current.exchangeIndex };
    }

    case 'TOURIST_SPEECH_COMPLETE':
      if (current.stepPhase !== 'TOURIST_SPEAKING') return null;
      return { stepPhase: 'WAIT_AFTER_TOURIST', exchangeIndex: current.exchangeIndex };

    case 'AFTER_TOURIST_PAUSE_COMPLETE': {
      if (current.stepPhase !== 'WAIT_AFTER_TOURIST') return null;
      const nextIndex = current.exchangeIndex + 1;
      if (nextIndex < totalExchanges) {
        return { stepPhase: 'STUDENT_CHOICE', exchangeIndex: nextIndex };
      }
      return { stepPhase: 'DONE', exchangeIndex: current.exchangeIndex };
    }

    default:
      return null;
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

export type SultanhaniVoiceGender = 'female' | 'male';

const STUDENT_CHARACTER_VOICE_GENDERS: Record<StudentCharacterId, SultanhaniVoiceGender> = {
  ece: 'female',
  deniz: 'male',
  elif: 'female',
  mert: 'male',
  zeynep: 'female',
  arda: 'male',
};

/**
 * Seçilen öğrenci karakterinin ses cinsiyetini döndürür; bilinmiyorsa kız sesi varsayılır.
 */
export function resolveStudentVoiceGender(
  characterId?: StudentCharacterId | null,
): SultanhaniVoiceGender {
  if (!characterId) return 'female';
  return STUDENT_CHARACTER_VOICE_GENDERS[characterId] ?? 'female';
}

export const SULTANHANI_TIMINGS = {
  facingPauseMs: 800,
  afterStudentLinePauseMs: 500,
  afterTouristLinePauseMs: 600,
  interLinePauseMs: 600,
  walkToDoorWatchdogMs: 12_000,
  innerWalkWatchdogMs: 6_000,
  transitionFadeMs: 550,
  reducedMotionTransitionMs: 250,
} as const;

export const SULTANHANI_VOICE_PITCH = {
  studentFemale: 1.6,
  studentFemaleSameVoice: 1.65,
  studentMale: 1.35,
  studentMaleSameVoice: 1.42,
  tourist: 0.9,
  touristSameVoice: 0.9,
  canFemale: 1.6,
  canFemaleSameVoice: 1.75,
  canMale: 1.35,
  canMaleSameVoice: 1.48,
  can: 1.35,
} as const;

export const SULTANHANI_SPEECH_RATES = {
  student: 0.85,
  tourist: 0.85,
  can: 0.85,
  'en-US': 0.85,
  'tr-TR': 0.85,
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

export type SultanhaniDialogPhase = 'DIALOG_1' | 'DIALOG_2' | 'INNER';
export type SultanhaniSpeaker = 'student' | 'tourist' | 'can';

export interface SultanhaniLearningNote {
  phrase: string;
  explanationTr: string;
  exampleEn: string;
}

export interface SultanhaniDialogChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface SultanhaniDialogExchange {
  id: string;
  phase: SultanhaniDialogPhase;
  studentText: string;
  touristText: string | null;
  distractors: readonly [string, string];
  options: readonly SultanhaniDialogChoiceOption[];
  hintTurkish: string;
  learningNote?: SultanhaniLearningNote;
}

export interface SultanhaniDialogStep {
  id: string;
  phase: SultanhaniDialogPhase;
  speaker: SultanhaniSpeaker;
  text: string;
  options?: readonly SultanhaniDialogChoiceOption[];
  hintTurkish?: string;
  learningNote?: SultanhaniLearningNote;
}

export const SULTANHANI_FEEDBACK_COPY = {
  tryAgain: 'Tekrar dene!',
  highlightPrompt: 'Parlayan seçeneğe dokunarak devam edebilirsin.',
  studentPromptLabel: 'Sen ne söylersin?',
  studentSpeakerLabel: 'Sen',
  listenOptionAriaPrefix: 'Seçeneği dinle',
  listenExampleAriaPrefix: 'İngilizce örneği dinle',
  newPatternBadge: 'Yeni Kalıp',
  wrongWordForbiddenCheck: true,
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
 * Dış mekân konuşma değişimleri:
 * 1) Hello! / Hello!
 * 2) Good morning! / Good morning!
 * 3) My name is [ad]. What's your name? / My name is Alex. Nice to meet you!
 * 4) Nice to meet you, too!
 */
export function buildSultanhaniDialogExchanges(
  shuffleSeed = 0,
  studentName = 'Ece',
): readonly SultanhaniDialogExchange[] {
  const cleanName = studentName.trim() || 'Ece';
  const nameLine = `My name is ${cleanName}. What's your name?`;

  const definitions: Array<{
    id: string;
    phase: SultanhaniDialogPhase;
    studentText: string;
    touristText: string | null;
    distractors: readonly [string, string];
    hintTurkish: string;
  }> = [
    {
      id: 'exchange-1-hello',
      phase: 'DIALOG_1',
      studentText: 'Hello!',
      touristText: 'Hello!',
      distractors: ["What's your name?", 'Nice to meet you, too!'],
      hintTurkish: 'Yeni karşılaştığın birine merhaba demek için "Hello!" dersin.',
    },
    {
      id: 'exchange-2-good-morning',
      phase: 'DIALOG_1',
      studentText: 'Good morning!',
      touristText: 'Good morning!',
      distractors: ["What's your name?", 'Nice to meet you, too!'],
      hintTurkish: 'Sabah günaydın demek için "Good morning!" ifadesini seç.',
    },
    {
      id: 'exchange-3-my-name-whats-yours',
      phase: 'DIALOG_2',
      studentText: nameLine,
      touristText: 'My name is Alex. Nice to meet you!',
      distractors: [
        "My name is Alex. What's your name?",
        'Good morning! Nice to meet you!',
      ],
      hintTurkish: `Kendi adını söyleyip Alex'in adını sormak için "${nameLine}" cümlesini seç.`,
    },
    {
      id: 'exchange-4-nice-to-meet-too',
      phase: 'DIALOG_2',
      studentText: 'Nice to meet you, too!',
      touristText: null,
      distractors: ['Good morning!', 'My name is Alex.'],
      hintTurkish: 'Tanıştığına memnun olduğunu söylemek için "Nice to meet you, too!" ifadesini seç.',
    },
  ];

  return definitions.map((def, index) => ({
    ...def,
    options: shuffleOptionsWithSeed(def.studentText, def.distractors, index, shuffleSeed),
  }));
}

export const SULTANHANI_ACTIVE_EXCHANGE_DEFINITIONS = buildSultanhaniDialogExchanges(0).filter(
  (ex): ex is SultanhaniDialogExchange & { touristText: string } => ex.touristText !== null,
);

/**
 * İç mekân konuşma değişimleri (Can sahnede mevcut olmadığı için Can bölümü atlanır).
 * Önceden öğretilmemiş kalıplar ("Where are we?", "It's very old.") için Türkçe açıklama ve sesli örnek içerir.
 */
export function buildSultanhaniInnerDialogExchanges(
  shuffleSeed = 0,
): readonly SultanhaniDialogExchange[] {
  const definitions: Array<{
    id: string;
    phase: SultanhaniDialogPhase;
    studentText: string;
    touristText: string | null;
    distractors: readonly [string, string];
    hintTurkish: string;
    learningNote?: SultanhaniLearningNote;
  }> = [
    {
      id: 'inner-1-welcome',
      phase: 'INNER',
      studentText: 'Welcome, Alex!',
      touristText: 'Thank you! Where are we?',
      distractors: ['Good morning, Alex!', 'Nice to meet you, Alex!'],
      hintTurkish: 'Alex’i içeri buyur etmek için "Welcome, Alex!" ifadesini seç.',
    },
    {
      id: 'inner-2-caravanserai',
      phase: 'INNER',
      studentText: 'This is Sultanhanı Caravanserai.',
      touristText: "Wow! It's beautiful!",
      distractors: ['This is my classroom.', 'My name is Alex.'],
      hintTurkish:
        'Alex "Where are we?" (Biz neredeyiz?) diye sordu. Buranın adını söylemek için "This is Sultanhanı Caravanserai." cümlesini seç.',
      learningNote: {
        phrase: 'Where are we?',
        explanationTr: '"Biz neredeyiz?" anlamına gelir.',
        exampleEn: 'Where are we? We are at Sultanhanı.',
      },
    },
    {
      id: 'inner-3-very-old',
      phase: 'INNER',
      studentText: "Yes! It's very old.",
      touristText: 'How old are you?',
      distractors: ['Yes! Good morning!', 'No, my name is Alex.'],
      hintTurkish: 'Kervansarayın çok eski olduğunu söylemek için "Yes! It\'s very old." cümlesini seç.',
      learningNote: {
        phrase: "It's very old.",
        explanationTr: '"Bu çok eski." anlamına gelir.',
        exampleEn: "Look! It's very old.",
      },
    },
    {
      id: 'inner-4-student-age',
      phase: 'INNER',
      studentText: "I'm nine years old.",
      touristText: null,
      distractors: ['My name is nine.', "I'm twenty-five years old."],
      hintTurkish: 'Dokuz yaşında olduğunu söylemek için "I\'m nine years old." cümlesini seç.',
    },
    {
      id: 'inner-5-ask-alex-age',
      phase: 'INNER',
      studentText: 'How old are you?',
      touristText: "I'm twenty-five years old.",
      distractors: ["What's your name?", 'Where are we?'],
      hintTurkish: 'Şimdi Alex’in yaşını sormak için "How old are you?" sorusunu seç.',
    },
  ];

  return definitions.map((def, index) => ({
    ...def,
    options: shuffleOptionsWithSeed(def.studentText, def.distractors, index + 10, shuffleSeed),
  }));
}

/**
 * Dış mekân değişim listesinden düz adım dizisi üreten yardımcı.
 */
export function buildSultanhaniDialogueSteps(
  studentName = 'Ece',
  shuffleSeed = 0,
): readonly SultanhaniDialogStep[] {
  const exchanges = buildSultanhaniDialogExchanges(shuffleSeed, studentName);
  const steps: SultanhaniDialogStep[] = [];

  for (const ex of exchanges) {
    steps.push({
      id: `${ex.id}-student`,
      phase: ex.phase,
      speaker: 'student',
      text: ex.studentText,
      options: ex.options,
      hintTurkish: ex.hintTurkish,
      learningNote: ex.learningNote,
    });
    if (ex.touristText) {
      steps.push({
        id: `${ex.id}-tourist`,
        phase: ex.phase,
        speaker: 'tourist',
        text: ex.touristText,
      });
    }
  }

  return steps;
}
