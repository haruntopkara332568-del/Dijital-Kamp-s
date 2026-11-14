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
let activeCancelFlag = false;

export function stopSpeaking(): void {
  activeCancelFlag = true;
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

function speakUtterance(segment: DialogueSegment): Promise<boolean> {
  return new Promise((resolve) => {
    const synth = getSynthesis();
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') {
      resolve(false);
      return;
    }

    const voices = synth.getVoices();
    const matchedVoice = findBestVoice(voices, segment.lang);

    // Eğer ses listesi yüklü ve bu dil için hiç ses yoksa, yanlış dille telaffuz etme!
    if (voices.length > 0 && !matchedVoice) {
      resolve(false);
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(segment.text);
      utterance.lang = matchedVoice?.lang ?? segment.lang;
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
      utterance.rate = segment.lang === 'en-US' ? 0.92 : 0.98;
      utterance.pitch = 1.02;

      let settled = false;
      const finish = (ok: boolean) => {
        if (!settled) {
          settled = true;
          resolve(ok);
        }
      };

      utterance.onend = () => finish(true);
      utterance.onerror = () => finish(false);

      // Güvenlik zaman aşımı (uzun cümlede tarayıcı eventi gelmezse kilitlemesin)
      const fallbackTimer = window.setTimeout(() => finish(true), Math.max(3500, segment.text.length * 110));

      const originalOnEnd = utterance.onend;
      utterance.onend = (ev) => {
        window.clearTimeout(fallbackTimer);
        originalOnEnd?.call(utterance, ev);
      };
      utterance.onerror = () => {
        window.clearTimeout(fallbackTimer);
        finish(false);
      };

      synth.speak(utterance);
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
  },
): Promise<SpeechResult> {
  stopSpeaking();
  activeCancelFlag = false;

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

  for (const segment of segments) {
    if (activeCancelFlag) break;

    if (segment.audioSrc) {
      const played = await playAudioFile(segment.audioSrc);
      if (played) {
        spokeAtLeastOne = true;
        continue;
      }
    }

    const spoken = await speakUtterance(segment);
    if (spoken) {
      spokeAtLeastOne = true;
    }
  }

  options?.onEnd?.();

  if (!spokeAtLeastOne && !activeCancelFlag) {
    return {
      spoken: false,
      fallbackReason: 'Bu cihazda uygun dil sesi bulunamadı. Ekrandaki metinle güvenle devam edebilirsin.',
    };
  }

  return { spoken: spokeAtLeastOne };
}
