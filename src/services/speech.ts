import type { DialogueSegment, SpeechLang } from '@/src/types/campus';

export interface SpeechCapability {
  supported: boolean;
  hasTurkishVoice: boolean;
  hasEnglishVoice: boolean;
  voicesLoaded: boolean;
}

export interface SpeechResult {
  spoken: boolean;
  fallbackReason?: string;
}

function getSynthesis(): SpeechSynthesis | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }
  return window.speechSynthesis;
}

function findBestVoice(voices: SpeechSynthesisVoice[], lang: SpeechLang): SpeechSynthesisVoice | null {
  const primaryPrefix = lang.split('-')[0].toLowerCase();
  const exact = voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase());
  if (exact) return exact;

  if (lang === 'en-US') {
    const british = voices.find((v) => v.lang.toLowerCase() === 'en-gb');
    if (british) return british;
  }

  return voices.find((v) => v.lang.toLowerCase().startsWith(primaryPrefix)) ?? null;
}

type SpeechVoices = Record<SpeechLang, SpeechSynthesisVoice | null>;
const cachedVoices = new WeakMap<SpeechSynthesis, SpeechVoices>();

export async function getSpeechVoices(signal: AbortSignal): Promise<SpeechVoices | null> {
  const synth = getSynthesis();
  if (!synth || typeof SpeechSynthesisUtterance === 'undefined' || signal.aborted) return null;

  const cached = cachedVoices.get(synth);
  if (cached) return cached;

  let voices = synth.getVoices();
  if (!voices.length) {
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
    if (signal.aborted) return null;
    voices = synth.getVoices();
  }

  if (!voices.length) return null;
  const selected = {
    'en-US': findBestVoice(voices, 'en-US'),
    'tr-TR': findBestVoice(voices, 'tr-TR'),
  };
  cachedVoices.set(synth, selected);
  return selected;
}

export function inspectSpeechCapability(): SpeechCapability {
  const synth = getSynthesis();
  if (!synth) {
    return {
      supported: false,
      hasTurkishVoice: false,
      hasEnglishVoice: false,
      voicesLoaded: true,
    };
  }

  const voices = synth.getVoices();
  if (voices.length === 0) {
    // Bazı tarayıcılarda ses listesi asenkron yüklenir; yine de API desteklidir.
    return {
      supported: true,
      hasTurkishVoice: true,
      hasEnglishVoice: true,
      voicesLoaded: false,
    };
  }

  return {
    supported: true,
    hasTurkishVoice: Boolean(findBestVoice(voices, 'tr-TR')),
    hasEnglishVoice: Boolean(findBestVoice(voices, 'en-US')),
    voicesLoaded: true,
  };
}

let activeAudioElement: HTMLAudioElement | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let activeCancelFlag = false;

export function stopSpeaking(): void {
  activeCancelFlag = true;
  activeUtterance = null;
  if (activeAudioElement) {
    activeAudioElement.pause();
    activeAudioElement.currentTime = 0;
    activeAudioElement = null;
  }
  const synth = getSynthesis();
  if (synth) {
    try {
      synth.cancel();
    } catch {
      // Tarayıcı ses motoru hatasında sessizce devam et
    }
  }
}

function playAudioFile(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const audio = new Audio(src);
      activeAudioElement = audio;
      audio.onended = () => {
        if (activeAudioElement === audio) activeAudioElement = null;
        resolve(true);
      };
      audio.onerror = () => {
        if (activeAudioElement === audio) activeAudioElement = null;
        resolve(false);
      };
      void audio.play().catch(() => {
        if (activeAudioElement === audio) activeAudioElement = null;
        resolve(false);
      });
    } catch {
      resolve(false);
    }
  });
}

export interface QueuedSpeech {
  signal: AbortSignal;
  voices: SpeechVoices;
  rates: Record<SpeechLang, number>;
  pitch?: number;
  timeoutMs?: (text: string) => number;
  onTimeoutFallback?: (text: string) => void;
}

function speakUtterance(segment: DialogueSegment, queued?: QueuedSpeech): Promise<boolean> {
  return new Promise((resolve) => {
    const synth = getSynthesis();
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined' || queued?.signal.aborted) {
      resolve(false);
      return;
    }

    const voices = queued ? [] : synth.getVoices();
    const matchedVoice = queued ? queued.voices[segment.lang] : findBestVoice(voices, segment.lang);
    if (!matchedVoice && (queued || voices.length > 0)) {
      resolve(false);
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(segment.text);
      utterance.lang = queued ? segment.lang : matchedVoice?.lang ?? segment.lang;
      if (matchedVoice) utterance.voice = matchedVoice;
      utterance.rate = queued?.rates[segment.lang] ?? (segment.lang === 'en-US' ? 0.92 : 0.98);
      utterance.pitch = queued?.pitch ?? 1.02;

      let settled = false;
      const abort = () => finish(false);
      const finish = (played: boolean) => {
        if (settled) return;
        settled = true;
        if (activeUtterance === utterance) {
          activeUtterance = null;
        }
        window.clearTimeout(timer);
        queued?.signal.removeEventListener('abort', abort);
        utterance.onend = null;
        utterance.onerror = null;
        resolve(played);
      };
      const waitMs = queued?.timeoutMs
        ? queued.timeoutMs(segment.text)
        : Math.max(3500, segment.text.length * 110);
      const timer = window.setTimeout(() => {
        if (!settled && queued?.onTimeoutFallback) {
          queued.onTimeoutFallback(segment.text);
          finish(true);
          return;
        }
        finish(!queued);
      }, waitMs);

      utterance.onend = () => finish(true);
      utterance.onerror = () => finish(false);
      queued?.signal.addEventListener('abort', abort, { once: true });
      try {
        activeUtterance = utterance;
        synth.speak(utterance);
      } catch {
        finish(false);
      }
    } catch {
      resolve(false);
    }
  });
}

export async function speakSegments(
  segments: DialogueSegment[],
  options?: {
    onStart?: () => void;
    onEnd?: () => void;
    onSegmentStart?: (index: number) => void;
    queued?: QueuedSpeech;
  },
): Promise<SpeechResult> {
  const queued = options?.queued;
  if (queued?.signal.aborted) return { spoken: false };
  if (!queued) {
    stopSpeaking();
    activeCancelFlag = false;
  }
  const isCanceled = () => queued ? queued.signal.aborted : activeCancelFlag;

  const synth = getSynthesis();
  const hasAnyAudioSrc = segments.some((s) => Boolean(s.audioSrc));

  if (!synth && !hasAnyAudioSrc) {
    options?.onEnd?.();
    return {
      spoken: false,
      fallbackReason: 'Bu cihazda sesli okuma kullanılamıyor. Ekrandaki metinden devam edebilirsin.',
    };
  }

  options?.onStart?.();
  let spokeAtLeastOne = false;

  for (const [index, segment] of segments.entries()) {
    if (isCanceled()) break;
    options?.onSegmentStart?.(index);

    if (segment.audioSrc) {
      const played = await playAudioFile(segment.audioSrc);
      if (played) {
        spokeAtLeastOne = true;
        continue;
      }
    }

    const spoken = await speakUtterance(segment, queued);
    if (spoken) {
      spokeAtLeastOne = true;
    }
  }

  options?.onEnd?.();

  if (!spokeAtLeastOne && !isCanceled()) {
    return {
      spoken: false,
      fallbackReason: 'Bu cihazda uygun dil sesi bulunamadı. Ekrandaki metinle güvenle devam edebilirsin.',
    };
  }

  return { spoken: spokeAtLeastOne };
}
