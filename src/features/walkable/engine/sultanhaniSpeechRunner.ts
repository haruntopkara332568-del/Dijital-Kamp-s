import {
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

const TURKISH_PHONETIC_DICTIONARY: Record<string, string> = {
  Ece: 'Eh-jeh',
  Can: 'Jahn',
  Sultanhanı: 'Sool-tahn-hah-nuh',
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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function clampPitch(pitch: number): number {
  return Math.min(2, Math.max(0.5, pitch));
}

/**
 * Sözlükte bulunmayan Türkçe isim/kelimeler için İngilizce fonetik dönüşüm uygular:
 * ç→ch, ş→sh, ğ→sessiz, ı→uh, ö→uh, ü→oo, c→j.
 */
export function transliterateTurkishWordForEnglish(word: string): string {
  let result = '';
  for (const ch of word) {
    switch (ch) {
      case 'ç':
        result += 'ch';
        break;
      case 'Ç':
        result += 'Ch';
        break;
      case 'ş':
        result += 'sh';
        break;
      case 'Ş':
        result += 'Sh';
        break;
      case 'ğ':
      case 'Ğ':
        // sessiz
        break;
      case 'ı':
        result += 'uh';
        break;
      case 'I':
        result += 'Uh';
        break;
      case 'ö':
        result += 'uh';
        break;
      case 'Ö':
        result += 'Uh';
        break;
      case 'ü':
        result += 'oo';
        break;
      case 'Ü':
        result += 'Oo';
        break;
      case 'c':
        result += 'j';
        break;
      case 'C':
        result += 'J';
        break;
      case 'İ':
        result += 'I';
        break;
      default:
        result += ch;
        break;
    }
  }
  return result;
}

/**
 * Ekrandaki konuşma balonu metnini değiştirmeden yalnızca seslendirmeye giden metindeki
 * Türkçe isim ve yer adlarını tek dil/tek ses (en-US) ile okunacak İngilizce telaffuza çevirir.
 */
export function convertTurkishNamesForEnglishSpeech(
  text: string,
  extraTurkishName?: string,
): string {
  let converted = text;

  // 1. Önceden tanımlı Türkçe isim/yer sözlüğü (büyük/küçük harf duyarlı: "Can" ↔ "can" karışmaz)
  for (const [turkishWord, englishPronunciation] of Object.entries(TURKISH_PHONETIC_DICTIONARY)) {
    const pattern = new RegExp(
      `(?<![\\p{L}\\p{M}\\p{N}_])${escapeRegExp(turkishWord)}(?![\\p{L}\\p{M}\\p{N}_])`,
      'gu',
    );
    converted = converted.replace(pattern, englishPronunciation);
  }

  // 2. Sözlükte olmayan öğrenci takma adı/ismi varsa genel fonetik dönüşümü uygula
  const cleanExtra = extraTurkishName?.trim();
  if (
    cleanExtra &&
    cleanExtra !== 'Alex' &&
    !(cleanExtra in TURKISH_PHONETIC_DICTIONARY)
  ) {
    const extraPronunciation = transliterateTurkishWordForEnglish(cleanExtra);
    const pattern = new RegExp(
      `(?<![\\p{L}\\p{M}\\p{N}_])${escapeRegExp(cleanExtra)}(?![\\p{L}\\p{M}\\p{N}_])`,
      'gu',
    );
    converted = converted.replace(pattern, extraPronunciation);
  }

  // 3. Metinde kalan Türkçe karakterli (ç, ğ, ı, ö, ş, ü) kelimeleri genel kural ile dönüştür
  converted = converted.replace(
    /[\p{L}\p{M}]*[çğıöşüÇĞÖŞÜ][\p{L}\p{M}]*/gu,
    (match) => transliterateTurkishWordForEnglish(match),
  );

  return converted;
}

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
  pitch: number;
  englishRate: number;
}

export type SultanhaniSceneVoiceMap = Record<SultanhaniSpeaker, SultanhaniResolvedVoiceProfile>;

/**
 * Yalnızca İngilizce (en-US ve en-GB) sesleri seçer; Türkçe veya başka dil seslerini asla döndürmez.
 */
function getEnglishOnlyVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  const usVoices: SpeechSynthesisVoice[] = [];
  const gbVoices: SpeechSynthesisVoice[] = [];

  for (const voice of voices) {
    const lang = normalizeLang(voice.lang);
    if (lang === 'en-us') {
      usVoices.push(voice);
    } else if (lang === 'en-gb') {
      gbVoices.push(voice);
    }
  }

  return [...usVoices, ...gbVoices];
}

const ANA_CHILD_VOICE_PATTERN = /\bana\b/i;
const PREFERRED_NATURAL_FEMALE_PATTERN = /\b(aria|jenny|samantha)\b|\bgoogle us english\b/i;
const NATURAL_VOICE_TAG_PATTERN = /\b(natural|online|neural)\b/i;
const ROBOTIC_OR_COMPACT_VOICE_PATTERN =
  /\b(compact|espeak|festival|mbrola|sapi|desktop|legacy|eloquence|zira|hazel|susan|heera|reed|shelley|sandy|flo|grandma|grandpa|trinoids|zarvox|whisper|bells|bubbles|boing|albert|bad news|bahh|cellos|good news|jester|organ|superstar|wobble)\b/i;

function getFemaleChildVoicePriority(
  voice: Pick<SpeechSynthesisVoice, 'name' | 'voiceURI'>,
): number {
  const haystack = `${voice.name ?? ''} ${voice.voiceURI ?? ''}`;
  const isRoboticOrCompact = ROBOTIC_OR_COMPACT_VOICE_PATTERN.test(haystack);

  if (ANA_CHILD_VOICE_PATTERN.test(haystack) && !isRoboticOrCompact) {
    return 0;
  }
  if (isRoboticOrCompact) {
    return 5;
  }
  const isPreferredNamed = PREFERRED_NATURAL_FEMALE_PATTERN.test(haystack);
  const isNaturalTagged = NATURAL_VOICE_TAG_PATTERN.test(haystack);

  if (isPreferredNamed && (isNaturalTagged || /\b(samantha|google us english)\b/i.test(haystack))) {
    return 1;
  }
  if (isNaturalTagged) {
    return 2;
  }
  if (isPreferredNamed) {
    return 3;
  }
  return 4;
}

function sortFemaleChildVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  return [...voices].sort(
    (a, b) => getFemaleChildVoicePriority(a) - getFemaleChildVoicePriority(b),
  );
}

function clampFemaleChildPitch(pitch: number): number {
  return Math.min(1.25, Math.max(1.15, pitch));
}

/**
 * Sahne başında bir kez çağrılmak üzere öğrenci, Alex ve Can için kilitli İngilizce (en-US/en-GB)
 * ses haritasını oluşturur. Konuşmacılar farklı seslerle, aynı ses çıkarsa pitch farkıyla ayrılır.
 */
export function buildSultanhaniSceneVoiceMap(
  voices: SpeechSynthesisVoice[],
  studentGender: SultanhaniVoiceGender = 'female',
  canGender: SultanhaniVoiceGender = 'male',
): SultanhaniSceneVoiceMap {
  const englishVoices = getEnglishOnlyVoices(voices);

  if (englishVoices.length === 0) {
    return {
      student: {
        englishVoice: null,
        pitch:
          studentGender === 'female'
            ? clampFemaleChildPitch(SULTANHANI_VOICE_PITCH.studentFemale)
            : clampPitch(SULTANHANI_VOICE_PITCH.studentMale),
        englishRate:
          studentGender === 'female'
            ? SULTANHANI_SPEECH_RATES.studentFemale
            : SULTANHANI_SPEECH_RATES.student,
      },
      tourist: {
        englishVoice: null,
        pitch: clampPitch(SULTANHANI_VOICE_PITCH.tourist),
        englishRate: SULTANHANI_SPEECH_RATES.tourist,
      },
      can: {
        englishVoice: null,
        pitch:
          canGender === 'female'
            ? clampFemaleChildPitch(SULTANHANI_VOICE_PITCH.canFemale)
            : clampPitch(SULTANHANI_VOICE_PITCH.canMale),
        englishRate:
          canGender === 'female'
            ? SULTANHANI_SPEECH_RATES.canFemale
            : SULTANHANI_SPEECH_RATES.can,
      },
    };
  }

  const femaleVoices = sortFemaleChildVoices(
    englishVoices.filter((v) => classifyVoiceGender(v) === 'female'),
  );
  const maleVoices = englishVoices.filter((v) => classifyVoiceGender(v) === 'male');
  const unknownVoices = englishVoices.filter((v) => classifyVoiceGender(v) === 'unknown');

  // Alex: yetişkin erkek sesi, pitch ≈ 0.9, rate ≈ 0.85
  const alexVoice = maleVoices[0] ?? unknownVoices[0] ?? englishVoices[0] ?? null;

  // Öğrenci: kız → doğal çocuk/kadın sesi (pitch 1.15–1.25), erkek → erkek sesi (pitch ≈ 1.35)
  const studentVoice =
    studentGender === 'female'
      ? (femaleVoices.find((v) => v !== alexVoice) ??
        femaleVoices[0] ??
        unknownVoices.find((v) => v !== alexVoice) ??
        englishVoices.find((v) => v !== alexVoice) ??
        alexVoice)
      : (maleVoices.find((v) => v !== alexVoice) ??
        maleVoices[0] ??
        unknownVoices.find((v) => v !== alexVoice) ??
        alexVoice);

  const studentSharesAlexVoice = Boolean(studentVoice && alexVoice && studentVoice === alexVoice);
  const studentPitch =
    studentGender === 'female'
      ? clampFemaleChildPitch(
          studentSharesAlexVoice
            ? SULTANHANI_VOICE_PITCH.studentFemaleSameVoice
            : SULTANHANI_VOICE_PITCH.studentFemale,
        )
      : clampPitch(
          studentSharesAlexVoice
            ? SULTANHANI_VOICE_PITCH.studentMaleSameVoice
            : SULTANHANI_VOICE_PITCH.studentMale,
        );

  // Can: cinsiyetine göre üçüncü ayrı ses, aynı ses çıkarsa öğrenci ve Alex'ten ayrı çocuk pitch'i
  const canVoice =
    canGender === 'female'
      ? (femaleVoices.find((v) => v !== alexVoice && v !== studentVoice) ??
        femaleVoices.find((v) => v !== alexVoice) ??
        femaleVoices[0] ??
        unknownVoices.find((v) => v !== alexVoice && v !== studentVoice) ??
        englishVoices.find((v) => v !== alexVoice && v !== studentVoice) ??
        studentVoice)
      : (maleVoices.find((v) => v !== alexVoice && v !== studentVoice) ??
        maleVoices.find((v) => v !== alexVoice) ??
        maleVoices[0] ??
        unknownVoices.find((v) => v !== alexVoice && v !== studentVoice) ??
        englishVoices.find((v) => v !== alexVoice && v !== studentVoice) ??
        studentVoice);

  const canSharesStudentVoice = Boolean(canVoice && studentVoice && canVoice === studentVoice);
  const canPitch =
    canGender === 'female'
      ? clampFemaleChildPitch(
          canSharesStudentVoice
            ? SULTANHANI_VOICE_PITCH.canFemaleSameVoice
            : SULTANHANI_VOICE_PITCH.canFemale,
        )
      : clampPitch(
          canSharesStudentVoice
            ? SULTANHANI_VOICE_PITCH.canMaleSameVoice
            : SULTANHANI_VOICE_PITCH.canMale,
        );

  return {
    student: {
      englishVoice: studentVoice,
      pitch: studentPitch,
      englishRate:
        studentGender === 'female'
          ? SULTANHANI_SPEECH_RATES.studentFemale
          : SULTANHANI_SPEECH_RATES.student,
    },
    tourist: {
      englishVoice: alexVoice,
      pitch: clampPitch(SULTANHANI_VOICE_PITCH.tourist),
      englishRate: SULTANHANI_SPEECH_RATES.tourist,
    },
    can: {
      englishVoice: canVoice,
      pitch: canPitch,
      englishRate:
        canGender === 'female' ? SULTANHANI_SPEECH_RATES.canFemale : SULTANHANI_SPEECH_RATES.can,
    },
  };
}

export function resolveSultanhaniSpeakerVoice(
  voices: SpeechSynthesisVoice[],
  speaker: SultanhaniSpeaker,
  studentGender: SultanhaniVoiceGender = 'female',
  canGender: SultanhaniVoiceGender = 'male',
): SultanhaniResolvedVoiceProfile {
  return buildSultanhaniSceneVoiceMap(voices, studentGender, canGender)[speaker];
}

async function loadSpeechSynthesisVoices(signal?: AbortSignal): Promise<SpeechSynthesisVoice[]> {
  if (
    typeof window === 'undefined' ||
    !('speechSynthesis' in window) ||
    typeof SpeechSynthesisUtterance === 'undefined' ||
    signal?.aborted
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
      signal?.removeEventListener('abort', finish);
      resolve();
    };
    const timer = window.setTimeout(finish, 1000);
    synth.addEventListener?.('voiceschanged', finish, { once: true });
    signal?.addEventListener('abort', finish, { once: true });
  });

  if (signal?.aborted) return [];
  try {
    return synth.getVoices();
  } catch {
    return [];
  }
}

interface LockedSceneVoicesCache {
  synth: SpeechSynthesis;
  studentGender: SultanhaniVoiceGender;
  canGender: SultanhaniVoiceGender;
  map: SultanhaniSceneVoiceMap | null;
  pending: Promise<SultanhaniSceneVoiceMap> | null;
}

let lockedSceneVoices: LockedSceneVoicesCache | null = null;

/**
 * Sultanhanı sahnesi açıldığında ses seçimini BİR KEZ yapar ve konuşmacı anahtarına göre kilitler.
 * Tüm sahne boyunca aynı sesler kullanılır; her replikte yeniden seçim yapılmaz.
 */
export async function initSultanhaniSceneVoices(options?: {
  studentGender?: SultanhaniVoiceGender;
  canGender?: SultanhaniVoiceGender;
  signal?: AbortSignal;
}): Promise<SultanhaniSceneVoiceMap> {
  const studentGender = options?.studentGender ?? 'female';
  const canGender = options?.canGender ?? 'male';

  if (
    typeof window === 'undefined' ||
    !('speechSynthesis' in window) ||
    typeof SpeechSynthesisUtterance === 'undefined'
  ) {
    return buildSultanhaniSceneVoiceMap([], studentGender, canGender);
  }

  const synth = window.speechSynthesis;
  if (
    lockedSceneVoices &&
    lockedSceneVoices.synth === synth &&
    lockedSceneVoices.studentGender === studentGender &&
    lockedSceneVoices.canGender === canGender
  ) {
    if (lockedSceneVoices.map) {
      return lockedSceneVoices.map;
    }
    if (lockedSceneVoices.pending) {
      return lockedSceneVoices.pending;
    }
  }

  const entry: LockedSceneVoicesCache = {
    synth,
    studentGender,
    canGender,
    map: null,
    pending: null,
  };

  entry.pending = loadSpeechSynthesisVoices(options?.signal).then((voices) => {
    const resolvedMap = buildSultanhaniSceneVoiceMap(voices, studentGender, canGender);
    if (lockedSceneVoices === entry) {
      if (options?.signal?.aborted) {
        lockedSceneVoices = null;
      } else {
        // Sesler yüklenip harita oluşturulduysa sahne boyunca kilitle
        entry.map = resolvedMap;
        entry.pending = null;
      }
    }
    return resolvedMap;
  });

  lockedSceneVoices = entry;
  return entry.pending;
}

/**
 * Sultanhanı sahnesinden çıkıldığında kilitli ses haritasını temizler.
 */
export function resetSultanhaniSceneVoices(): void {
  lockedSceneVoices = null;
}

export interface SpeakSultanhaniLineParams {
  text: string;
  speaker: SultanhaniSpeaker;
  studentGender?: SultanhaniVoiceGender;
  canGender?: SultanhaniVoiceGender;
  extraTurkishName?: string;
  speechEnabled: boolean;
  signal: AbortSignal;
  cancelPrevious?: boolean;
  waitWhenSilent?: boolean;
  onSpeakingChange?: (speaking: boolean) => void;
}

/**
 * Tek bir İngilizce repliği sahne başında kilitlenen konuşmacı sesiyle ve sabit en-US diliyle
 * tek parça hâlinde seslendirir. Türkçe isimler yalnızca ses metninde İngilizce okunuşa çevrilir.
 */
export async function playSultanhaniSpeechLine({
  text,
  speaker,
  studentGender = 'female',
  canGender = 'male',
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

  const sceneVoiceMap = await initSultanhaniSceneVoices({
    studentGender,
    canGender,
    signal,
  });
  if (signal.aborted) return false;

  const profile = sceneVoiceMap[speaker];
  if (!profile.englishVoice) {
    return waitFallbackIfNeeded();
  }

  // Tüm cümle tek ses ve sabit en-US diliyle okunur; Türkçe ses (tr-TR) asla seçilmez.
  const spokenText = convertTurkishNamesForEnglishSpeech(text, extraTurkishName);
  const segments = [{ text: spokenText, lang: 'en-US' as const }];

  let timeoutWarned = false;
  const queued: QueuedSpeech = {
    signal,
    voices: {
      'en-US': profile.englishVoice,
      'tr-TR': null,
    },
    rates: {
      'en-US': profile.englishRate,
      'tr-TR': profile.englishRate,
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
