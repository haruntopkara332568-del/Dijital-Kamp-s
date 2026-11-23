import {
  buildSultanhaniSpeechSegments,
  estimateLineDurationMs,
  getSpeechTimeoutMs,
  SULTANHANI_SPEECH_RATES,
  SULTANHANI_VOICE_PITCH,
  type SultanhaniSpeaker,
} from '@/src/data/sultanhaniDialogContent';
import { getSpeechVoices, speakSegments, stopSpeaking, type QueuedSpeech } from '@/src/services/speech';

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

export interface SpeakSultanhaniLineParams {
  text: string;
  speaker: SultanhaniSpeaker;
  speechEnabled: boolean;
  signal: AbortSignal;
  cancelPrevious?: boolean;
  waitWhenSilent?: boolean;
  onSpeakingChange?: (speaking: boolean) => void;
}

/**
 * Tek bir İngilizce repliği (gerektiğinde Türkçe isim parçasını tr-TR sesiyle bölerek)
 * yeni bir generationId (AbortSignal) altında sırayla seslendirir.
 * speechSynthesis.cancel() yalnızca yeni bir konuşma/önizleme başlarken (cancelPrevious=true) çağrılır;
 * turistin cevabı başlamadan önce önceki sesi iptal etmez.
 */
export async function playSultanhaniSpeechLine({
  text,
  speaker,
  speechEnabled,
  signal,
  cancelPrevious = false,
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

  const voices = await getSpeechVoices(signal);
  if (signal.aborted) return false;

  if (!voices?.['en-US']) {
    return waitFallbackIfNeeded();
  }

  const segments = buildSultanhaniSpeechSegments(text, {
    hasTurkishVoice: Boolean(voices['tr-TR']),
  });

  if (!segments.some((segment) => segment.lang === 'en-US')) {
    return waitFallbackIfNeeded();
  }

  let timeoutWarned = false;
  const queued: QueuedSpeech = {
    signal,
    voices,
    rates: { ...SULTANHANI_SPEECH_RATES },
    pitch: speaker === 'student' ? SULTANHANI_VOICE_PITCH.student : SULTANHANI_VOICE_PITCH.tourist,
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
