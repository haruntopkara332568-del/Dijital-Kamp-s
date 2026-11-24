import {
  buildSultanhaniSpeechSegments,
  estimateLineDurationMs,
  getSpeechTimeoutMs,
  SULTANHANI_SPEECH_RATES,
  SULTANHANI_VOICE_PITCH,
  type SultanhaniSpeaker,
  type SultanhaniVoiceGender,
} from '@/src/data/sultanhaniDialogContent';
import { speakSegments, stopSpeaking, type QueuedSpeech } from '@/src/services/speech';

export function waitAbortable(ms: number, signal: AbortSignal): Promise<boolean> {
  if (signal.aborted) return Promise.resolve(false);
  if (ms <= 0) return Promise.resolve(true);
  return new Promise((resolve) => {
    const finish = (completed: boolean) => {
      window.clearTimeout(timer);
      signal.removeEventListener('abort', onAbort);
      resolve(completed);
    };
    const onAbort = () => finish(false);
    const timer = window.setTimeout(() => finish(true), ms);
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

const FEMALE_VOICE_PATTERNS = [
  /\bfemale\b/i,
  /\bwoman\b/i,
  /\bgirl\b/i,
  /\b(zira|aria|jenny|sonia|libby|hazel|susan|clara|michelle|ana|samantha|victoria|karen|moira|tessa|serena|kate|martha|allison|ava|zoe|nicky|emma|amy|joanna|salli|kimberly|kendra|ivy|natasha|freya|fiona|veena|emily|sarah|olivia|maisie)\b/i,
  /\bgoogle us english\b/i,
];

const MALE_VOICE_PATTERNS = [
  /\bmale\b/i,
  /\bman\b/i,
  /\bboy\b/i,
  /\b(david|mark|guy|ryan|george|christopher|eric|steffan|andrew|brian|daniel|alex|fred|aaron|arthur|oliver|tom|nathan|ralph|gordon|lee|rishi|matthew|joey|justin|james|william|liam|thomas|davis|tony|jason|brandon)\b/i,
];

function normalizeLang(lang: string | undefined): string {
  return (lang ?? '').replace('_', '-').toLowerCase();
}

export function classifyVoiceGender(
  voice: Pick<SpeechSynthesisVoice, 'name' | 'voiceURI'>,
): SultanhaniVoiceGender | 'unknown' {
  const haystack = `${voice.name ?? ''} ${voice.voiceURI ?? ''}`;
  if (FEMALE_VOICE_PATTERNS.some((pattern) => pattern.test(haystack))) {
    return 'female';
  }
  if (MALE_VOICE_PATTERNS.some((pattern) => pattern.test(haystack))) {
    return 'male';
  }
  return 'unknown';
}

export interface SultanhaniResolvedVoiceProfile {
  englishVoice: SpeechSynthesisVoice | null;
  turkishVoice: SpeechSynthesisVoice | null;
  pitch: number;
  englishRate: number;
}

function getPreferredEnglishVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  const usVoices: SpeechSynthesisVoice[] = [];
  const gbVoices: SpeechSynthesisVoice[] = [];
  const otherEnVoices: SpeechSynthesisVoice[] = [];

  for (const voice of voices) {
    const lang = normalizeLang(voice.lang);
    if (lang === 'en-us') {
      usVoices.push(voice);
    } else if (lang === 'en-gb') {
      gbVoices.push(voice);
    } else if (lang === 'en' || lang.startsWith('en-')) {
      otherEnVoices.push(voice);
    }
  }

  // en-US ve en-GB öncelikli, yoksa diğer en-* sesleri
  return usVoices.length > 0 || gbVoices.length > 0
    ? [...usVoices, ...gbVoices]
    : otherEnVoices;
}

function findTurkishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  return (
    voices.find((v) => normalizeLang(v.lang) === 'tr-tr') ??
    voices.find((v) => normalizeLang(v.lang).startsWith('tr')) ??
    null
  );
}

/**
 * Öğrenci (kız/erkek), Alex (her zaman erkek) ve varsa Can için birbirinden mutlaka farklı
 * İngilizce (en-US/en-GB) ses veya ton (pitch + rate) profilleri seçer.
 */
export function resolveSultanhaniSpeakerVoice(
  voices: SpeechSynthesisVoice[],
  speaker: SultanhaniSpeaker,
  studentGender: SultanhaniVoiceGender = 'female',
): SultanhaniResolvedVoiceProfile {
  const englishVoices = getPreferredEnglishVoices(voices);
  const turkishVoice = findTurkishVoice(voices);

  if (englishVoices.length === 0) {
    return {
      englishVoice: null,
      turkishVoice,
      pitch: SULTANHANI_VOICE_PITCH.tourist,
      englishRate: SULTANHANI_SPEECH_RATES['en-US'],
    };
  }

  const femaleVoices = englishVoices.filter((v) => classifyVoiceGender(v) === 'female');
  const maleVoices = englishVoices.filter((v) => classifyVoiceGender(v) === 'male');
  const unknownVoices = englishVoices.filter((v) => classifyVoiceGender(v) === 'unknown');

  // Alex her zaman erkek sesi tercih eder
  const alexVoice = maleVoices[0] ?? unknownVoices[0] ?? englishVoices[0] ?? null;

  // Öğrenci cinsiyetine göre Alex'ten farklı bir ses arar
  let studentVoice: SpeechSynthesisVoice | null = null;
  if (studentGender === 'female') {
    studentVoice =
      femaleVoices.find((v) => v !== alexVoice) ??
      femaleVoices[0] ??
      unknownVoices.find((v) => v !== alexVoice) ??
      englishVoices.find((v) => v !== alexVoice) ??
      alexVoice;
  } else {
    studentVoice =
      maleVoices.find((v) => v !== alexVoice) ??
      maleVoices[0] ??
      unknownVoices.find((v) => v !== alexVoice) ??
      alexVoice;
  }

  const sameVoiceAsAlex = Boolean(studentVoice && alexVoice && studentVoice === alexVoice);

  if (speaker === 'tourist') {
    return {
      englishVoice: alexVoice,
      turkishVoice,
      pitch: sameVoiceAsAlex
        ? SULTANHANI_VOICE_PITCH.touristSameVoice
        : SULTANHANI_VOICE_PITCH.tourist,
      englishRate: SULTANHANI_SPEECH_RATES.tourist,
    };
  }

  if (speaker === 'can') {
    const canVoice =
      maleVoices.find((v) => v !== alexVoice && v !== studentVoice) ??
      unknownVoices.find((v) => v !== alexVoice && v !== studentVoice) ??
      englishVoices.find((v) => v !== alexVoice && v !== studentVoice) ??
      maleVoices[0] ??
      englishVoices[0] ??
      null;
    return {
      englishVoice: canVoice,
      turkishVoice,
      pitch: SULTANHANI_VOICE_PITCH.can,
      englishRate: SULTANHANI_SPEECH_RATES.can,
    };
  }

  const studentPitch =
    studentGender === 'female'
      ? sameVoiceAsAlex
        ? SULTANHANI_VOICE_PITCH.studentFemaleSameVoice
        : SULTANHANI_VOICE_PITCH.studentFemale
      : sameVoiceAsAlex
        ? SULTANHANI_VOICE_PITCH.studentMaleSameVoice
        : SULTANHANI_VOICE_PITCH.studentMale;

  return {
    englishVoice: studentVoice,
    turkishVoice,
    pitch: studentPitch,
    englishRate: SULTANHANI_SPEECH_RATES.student,
  };
}

async function loadSpeechSynthesisVoices(signal: AbortSignal): Promise<SpeechSynthesisVoice[]> {
  if (
    typeof window === 'undefined' ||
    !('speechSynthesis' in window) ||
    typeof SpeechSynthesisUtterance === 'undefined' ||
    signal.aborted
  ) {
    return [];
  }

  const synth = window.speechSynthesis;
  let voices: SpeechSynthesisVoice[] = [];
  try {
    voices = synth.getVoices();
  } catch {
    return [];
  }

  if (voices.length > 0) return voices;

  await new Promise<void>((resolve) => {
    const finish = () => {
      window.clearTimeout(timer);
      synth.removeEventListener?.('voiceschanged', finish);
      signal.removeEventListener('abort', finish);
      resolve();
    };
    const timer = window.setTimeout(finish, 1000);
    synth.addEventListener?.('voiceschanged', finish, { once: true });
    signal.addEventListener('abort', finish, { once: true });
  });

  if (signal.aborted) return [];
  try {
    return synth.getVoices();
  } catch {
    return [];
  }
}

export interface SpeakSultanhaniLineParams {
  text: string;
  speaker: SultanhaniSpeaker;
  studentGender?: SultanhaniVoiceGender;
  extraTurkishName?: string;
  speechEnabled: boolean;
  signal: AbortSignal;
  cancelPrevious?: boolean;
  waitWhenSilent?: boolean;
  onSpeakingChange?: (speaking: boolean) => void;
}

/**
 * Tek bir İngilizce repliği seçilen konuşmacının cinsiyetine ve ayrı ses/ton profiline göre
 * seslendirir. Yeni replik başlamadan önce speechSynthesis.cancel() çağrılarak çakışma önlenir.
 * Uygun ses bulunamazsa uygulama çökmeden konuşma balonu süresiyle devam eder.
 */
export async function playSultanhaniSpeechLine({
  text,
  speaker,
  studentGender = 'female',
  extraTurkishName,
  speechEnabled,
  signal,
  cancelPrevious = true,
  waitWhenSilent = true,
  onSpeakingChange,
}: SpeakSultanhaniLineParams): Promise<boolean> {
  if (signal.aborted) return false;

  if (cancelPrevious) {
    stopSpeaking();
  }

  const startedAt = Date.now();
  const targetSilentWaitMs =
    speaker === 'student'
      ? Math.min(1100, estimateLineDurationMs(text))
      : estimateLineDurationMs(text);

  const waitFallbackIfNeeded = async () => {
    if (!waitWhenSilent || signal.aborted) return false;
    const elapsed = Math.max(0, Date.now() - startedAt);
    const remaining = Math.max(0, targetSilentWaitMs - elapsed);
    if (remaining > 0) {
      await waitAbortable(remaining, signal);
    }
    return !signal.aborted;
  };

  if (!speechEnabled) {
    return waitFallbackIfNeeded();
  }

  const allVoices = await loadSpeechSynthesisVoices(signal);
  if (signal.aborted) return false;

  const profile = resolveSultanhaniSpeakerVoice(allVoices, speaker, studentGender);
  if (!profile.englishVoice) {
    return waitFallbackIfNeeded();
  }

  const segments = buildSultanhaniSpeechSegments(text, {
    hasTurkishVoice: Boolean(profile.turkishVoice),
    extraTurkishName,
  });

  if (!segments.some((segment) => segment.lang === 'en-US')) {
    return waitFallbackIfNeeded();
  }

  let timeoutWarned = false;
  const queued: QueuedSpeech = {
    signal,
    voices: {
      'en-US': profile.englishVoice,
      'tr-TR': profile.turkishVoice,
    },
    rates: {
      'en-US': profile.englishRate,
      'tr-TR': SULTANHANI_SPEECH_RATES['tr-TR'],
    },
    pitch: profile.pitch,
    timeoutMs: getSpeechTimeoutMs,
    onTimeoutFallback: () => {
      stopSpeaking();
      if (!timeoutWarned) {
        timeoutWarned = true;
        console.warn(
          `[akış-bekçi] ADIM: ONEND_KORUMA — Replik ses onend olayı gelmedi (1.5x süre doldu), sonraki adıma geçiliyor: "${text}"`,
        );
      }
    },
  };

  onSpeakingChange?.(true);
  try {
    const result = await speakSegments(segments, { queued });
    if (signal.aborted) return false;
    if (!result.spoken) {
      return waitFallbackIfNeeded();
    }
    return true;
  } catch {
    return waitFallbackIfNeeded();
  } finally {
    onSpeakingChange?.(false);
  }
}
