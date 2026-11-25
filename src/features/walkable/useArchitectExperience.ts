import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ARCHITECT_ASSETS,
  ARCHITECT_DIALOGUE,
  ARCHITECT_TIMINGS,
  createEmptySelections,
  estimateSpeechDurationMs,
  getNextState,
  isBuildStep,
  type ArchitectBuildStep,
  type ArchitectFlowState,
  type ArchitectSelections,
  type RoofOptionId,
} from '@/src/data/architectExperienceConfig';
import type {
  DoorPatternId,
  OrnamentPatternId,
  WindowPatternId,
} from '@/src/features/walkable/engine/seljukPatternGenerator';
import { getSpeechVoices, speakSegments, stopSpeaking } from '@/src/services/speech';

/**
 * Mimar kadın bir karakterdir: öncelikle doğal kadın ses kaydını (`mimar-intro.mp3` / `mimar-closing.mp3`)
 * ortak `speakSegments` motoru üzerinden oynatır; kayıt yüklenemezse yalnızca doğrulanmış Türkçe kadın
 * tarayıcı sesini seçer (erkek sesi kesinlikle seçilmez).
 */
const FEMALE_TR_VOICE_RE = /\b(emel(?:neural)?|filiz|yelda|elif|seda|ayse|ayşe|google\s*t[üu]rk[çc]e|tr-tr-(?:standard|wavenet)-[acd]|female|kadın)\b/i;
const MALE_TR_VOICE_RE = /\b(tolga|ahmet(?:neural)?|aydın|aydin|mehmet|murat|kemal|tr-tr-(?:standard|wavenet)-[be]|chirp3-hd-achird|male|erkek)\b/i;

function pickFemaleTurkishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const turkish = voices
    .filter((v) => /^tr(?:[-_]|$)/i.test(v.lang))
    .sort((a, b) => Number(b.localService) - Number(a.localService) || a.voiceURI.localeCompare(b.voiceURI));

  for (const voice of turkish) {
    const label = `${voice.name} ${voice.voiceURI}`;
    if (MALE_TR_VOICE_RE.test(label)) continue;
    if (FEMALE_TR_VOICE_RE.test(label)) return voice;
  }
  return null;
}

export interface ArchitectVisualAnimationState {
  /** Aktif oturma animasyonu (0..1, 1 = yerleşmiş) */
  settlingStep: ArchitectBuildStep | null;
  settleProgress: number;
  /** BUILD_DONE soldan sağa ışık geçişi (0..1, -1 = aktif değil) */
  sweepProgress: number;
  sweepCompleted: boolean;
  /** ENTER_WALK kapıya yürüyüş ilerlemesi (0..1) */
  enterWalkProgress: number;
  /** Sahne geçiş kararma/aydınlanma örtüsü (0..1) */
  fadeOverlayAlpha: number;
}

export interface ArchitectRuntimeSnapshot {
  flowState: ArchitectFlowState;
  selections: ArchitectSelections;
  previewValue: string | null;
  speechBubbleText: string | null;
  isLocked: boolean;
  anim: ArchitectVisualAnimationState;
}

export function useArchitectExperience(active: boolean, speechEnabled: boolean) {
  const [flowState, setFlowState] = useState<ArchitectFlowState>('MIMAR_INTRO');
  const [selections, setSelections] = useState<ArchitectSelections>(() => createEmptySelections());
  const [previewValue, setPreviewValue] = useState<string | null>(null);
  const [isSettling, setIsSettling] = useState(false);
  const [speechBubbleText, setSpeechBubbleText] = useState<string | null>(
    ARCHITECT_DIALOGUE.introText,
  );

  // Çift geçiş ve yarış durumu kilidi
  const flowStateRef = useRef<ArchitectFlowState>('MIMAR_INTRO');
  const selectionsRef = useRef<ArchitectSelections>(selections);
  const previewValueRef = useRef<string | null>(null);
  const transitionLockRef = useRef(false);
  const sessionTokenRef = useRef(0);
  const animStateRef = useRef<ArchitectVisualAnimationState>({
    settlingStep: null,
    settleProgress: 1,
    sweepProgress: -1,
    sweepCompleted: false,
    enterWalkProgress: 0,
    fadeOverlayAlpha: 0,
  });

  const settleTimerRef = useRef<number | null>(null);
  const settleWatchdogRef = useRef<number | null>(null);
  const sweepTimerRef = useRef<number | null>(null);
  const sweepWatchdogRef = useRef<number | null>(null);
  const enterWalkTimerRef = useRef<number | null>(null);
  const enterWalkWatchdogRef = useRef<number | null>(null);
  const speechAbortRef = useRef<AbortController | null>(null);

  const sweepStartRef = useRef(0);
  const sweepDurationRef = useRef<number>(ARCHITECT_TIMINGS.buildDoneSweepMs);
  const settleStartRef = useRef(0);
  const settleDurationRef = useRef<number>(ARCHITECT_TIMINGS.partSettleDurationMs);
  const enterWalkStartRef = useRef(0);
  const enterWalkDurationRef = useRef<number>(ARCHITECT_TIMINGS.enterWalkDurationMs);
  const interiorFadeStartRef = useRef(0);

  const clearAllTimers = useCallback(() => {
    for (const ref of [
      settleTimerRef,
      settleWatchdogRef,
      sweepTimerRef,
      sweepWatchdogRef,
      enterWalkTimerRef,
      enterWalkWatchdogRef,
    ]) {
      if (ref.current !== null) {
        window.clearTimeout(ref.current);
        ref.current = null;
      }
    }
  }, []);

  const cancelSpeechOnly = useCallback(() => {
    if (speechAbortRef.current) {
      speechAbortRef.current.abort();
      speechAbortRef.current = null;
    }
    stopSpeaking();
  }, []);

  const advanceToState = useCallback(
    (expectedCurrent: ArchitectFlowState, targetState: ArchitectFlowState) => {
      if (flowStateRef.current !== expectedCurrent) return false;
      flowStateRef.current = targetState;
      if (targetState === 'INTERIOR_WALK') {
        interiorFadeStartRef.current = performance.now();
        animStateRef.current.fadeOverlayAlpha = 1;
      } else if (targetState === 'CLOSING') {
        setSpeechBubbleText(ARCHITECT_DIALOGUE.closingText);
      } else if (targetState !== 'MIMAR_INTRO') {
        setSpeechBubbleText(null);
      }
      setFlowState(targetState);
      return true;
    },
    [],
  );

  const resetToInitial = useCallback(
    (targetState: 'MIMAR_INTRO' | 'STEP_DOOR') => {
      sessionTokenRef.current += 1;
      clearAllTimers();
      cancelSpeechOnly();
      transitionLockRef.current = false;

      const fresh = createEmptySelections();
      selectionsRef.current = fresh;
      previewValueRef.current = null;
      flowStateRef.current = targetState;
      interiorFadeStartRef.current = 0;
      animStateRef.current = {
        settlingStep: null,
        settleProgress: 1,
        sweepProgress: -1,
        sweepCompleted: false,
        enterWalkProgress: 0,
        fadeOverlayAlpha: 0,
      };

      setSelections(fresh);
      setPreviewValue(null);
      setIsSettling(false);
      setSpeechBubbleText(targetState === 'MIMAR_INTRO' ? ARCHITECT_DIALOGUE.introText : null);
      setFlowState(targetState);
    },
    [cancelSpeechOnly, clearAllTimers],
  );

  /** Sahneye her girişte temiz başlangıç (`MIMAR_INTRO`) */
  const begin = useCallback(() => {
    resetToInitial('MIMAR_INTRO');
  }, [resetToInitial]);

  /** "Yeniden Başla": yalnızca Mimar deneyimini sıfırlar ve doğrudan STEP_DOOR'a geçer */
  const restartBuild = useCallback(() => {
    resetToInitial('STEP_DOOR');
  }, [resetToInitial]);

  /** Sahneden çıkışta tüm kaynakları temizle */
  const cleanup = useCallback(() => {
    sessionTokenRef.current += 1;
    clearAllTimers();
    cancelSpeechOnly();
    transitionLockRef.current = false;
  }, [cancelSpeechOnly, clearAllTimers]);

  // MIMAR_INTRO ve CLOSING konuşma akışı: doğal kadın sesi (MP3 -> kadın tr-TR TTS yedek) + balon + bekçi
  useEffect(() => {
    if (!active || (flowState !== 'MIMAR_INTRO' && flowState !== 'CLOSING')) return;

    const currentSpeechState = flowState;
    const nextAfterSpeech: ArchitectFlowState =
      currentSpeechState === 'MIMAR_INTRO' ? 'STEP_DOOR' : 'DONE';
    const text =
      currentSpeechState === 'MIMAR_INTRO'
        ? ARCHITECT_DIALOGUE.introText
        : ARCHITECT_DIALOGUE.closingText;
    const audioSrc =
      currentSpeechState === 'MIMAR_INTRO'
        ? ARCHITECT_ASSETS.audio.intro
        : ARCHITECT_ASSETS.audio.closing;

    const token = sessionTokenRef.current;
    const estimatedMs = estimateSpeechDurationMs(text);
    const watchdogMs = Math.round(estimatedMs * ARCHITECT_TIMINGS.speechWatchdogMultiplier);

    const controller = new AbortController();
    speechAbortRef.current = controller;
    const { signal } = controller;

    let finished = false;
    let fallbackTimer: number | null = null;
    let hardWatchdogTimer: number | null = null;
    let watchdogWarned = false;

    const completeSpeech = () => {
      if (finished || signal.aborted || sessionTokenRef.current !== token) return;
      finished = true;
      if (fallbackTimer !== null) {
        window.clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
      if (hardWatchdogTimer !== null) {
        window.clearTimeout(hardWatchdogTimer);
        hardWatchdogTimer = null;
      }
      if (currentSpeechState === 'MIMAR_INTRO') {
        setSpeechBubbleText(null);
      }
      advanceToState(currentSpeechState, nextAfterSpeech);
    };

    void (async () => {
      if (!speechEnabled) {
        fallbackTimer = window.setTimeout(completeSpeech, estimatedMs);
        return;
      }

      // Ses onend/ended gelmezse tahmini süre × 1.5 dolunca akışı ilerleten bekçi
      hardWatchdogTimer = window.setTimeout(() => {
        if (!finished && !signal.aborted && sessionTokenRef.current === token) {
          if (!watchdogWarned) {
            watchdogWarned = true;
            console.warn(
              `[Mimar] ${currentSpeechState} konuşması beklenen sürede bitmedi; bekçi zamanlayıcı akışı sürdürdü.`,
            );
          }
          stopSpeaking();
          completeSpeech();
        }
      }, watchdogMs);

      try {
        // Önce anında yerel doğal kadın ses kaydını (MP3) başlat; yalnızca oynatılamazsa kadın tarayıcı TTS'ine düş
        const loadedVoices =
          typeof window !== 'undefined' && 'speechSynthesis' in window
            ? window.speechSynthesis.getVoices()
            : [];
        let femaleVoice = pickFemaleTurkishVoice(loadedVoices);

        stopSpeaking();
        let result = await speakSegments([{ lang: 'tr-TR', text, audioSrc }], {
          queued: {
            voices: { 'tr-TR': femaleVoice, 'en-US': null },
            signal,
            rates: { 'tr-TR': 0.96, 'en-US': 0.94 },
            pitch: 1.04,
            timeoutMs: () => watchdogMs,
            onTimeoutFallback: () => {
              if (!watchdogWarned) {
                watchdogWarned = true;
                console.warn(
                  `[Mimar] ${currentSpeechState} konuşması onend gecikti; bekçi zamanlayıcı akışı sürdürdü.`,
                );
              }
              stopSpeaking();
            },
          },
        });

        // MP3 oynatılamadıysa ve sesler henüz yüklenmemişse kadın tarayıcı sesini bir kez daha dene
        if (!result.spoken && !femaleVoice && !signal.aborted && sessionTokenRef.current === token) {
          const available = await getSpeechVoices(signal);
          if (!signal.aborted && sessionTokenRef.current === token && available) {
            femaleVoice = pickFemaleTurkishVoice(window.speechSynthesis.getVoices());
            if (femaleVoice) {
              result = await speakSegments([{ lang: 'tr-TR', text }], {
                queued: {
                  voices: { 'tr-TR': femaleVoice, 'en-US': null },
                  signal,
                  rates: { 'tr-TR': 0.96, 'en-US': 0.94 },
                  pitch: 1.04,
                  timeoutMs: () => watchdogMs,
                  onTimeoutFallback: () => {
                    if (!watchdogWarned) {
                      watchdogWarned = true;
                      console.warn(
                        `[Mimar] ${currentSpeechState} konuşması onend gecikti; bekçi zamanlayıcı akışı sürdürdü.`,
                      );
                    }
                    stopSpeaking();
                  },
                },
              });
            }
          }
        }

        if (signal.aborted || sessionTokenRef.current !== token) return;
        if (!result.spoken) {
          fallbackTimer = window.setTimeout(completeSpeech, estimatedMs);
          return;
        }
        completeSpeech();
      } catch {
        if (!signal.aborted && sessionTokenRef.current === token) {
          fallbackTimer = window.setTimeout(completeSpeech, estimatedMs);
        }
      }
    })();

    return () => {
      controller.abort();
      if (speechAbortRef.current === controller) {
        speechAbortRef.current = null;
      }
      if (fallbackTimer !== null) {
        window.clearTimeout(fallbackTimer);
      }
      if (hardWatchdogTimer !== null) {
        window.clearTimeout(hardWatchdogTimer);
      }
      stopSpeaking();
    };
  }, [active, advanceToState, flowState, speechEnabled]);

  // BUILD_DONE: yumuşak ~2.5 sn ışık geçişi -> otomatik ENTER_WALK
  useEffect(() => {
    if (!active || flowState !== 'BUILD_DONE') return;

    const token = sessionTokenRef.current;
    const reduced =
      typeof window !== 'undefined' &&
      (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
    const sweepDuration = reduced
      ? ARCHITECT_TIMINGS.buildDoneSweepReducedMs
      : ARCHITECT_TIMINGS.buildDoneSweepMs;

    animStateRef.current.sweepProgress = 0;
    animStateRef.current.sweepCompleted = false;
    sweepStartRef.current = performance.now();
    sweepDurationRef.current = sweepDuration;

    let done = false;
    const finishSweep = (fromWatchdog: boolean) => {
      if (done || sessionTokenRef.current !== token) return;
      done = true;
      if (fromWatchdog) {
        console.warn('[Mimar] BUILD_DONE ışık geçişi bekçi zamanlayıcı ile tamamlandı.');
      }
      animStateRef.current.sweepProgress = 1;
      animStateRef.current.sweepCompleted = true;
      if (sweepTimerRef.current !== null) {
        window.clearTimeout(sweepTimerRef.current);
        sweepTimerRef.current = null;
      }
      if (sweepWatchdogRef.current !== null) {
        window.clearTimeout(sweepWatchdogRef.current);
        sweepWatchdogRef.current = null;
      }
      advanceToState('BUILD_DONE', 'ENTER_WALK');
    };

    sweepTimerRef.current = window.setTimeout(() => finishSweep(false), sweepDuration);
    sweepWatchdogRef.current = window.setTimeout(
      () => finishSweep(true),
      ARCHITECT_TIMINGS.buildDoneWatchdogMs,
    );

    return () => {
      if (sweepTimerRef.current !== null) {
        window.clearTimeout(sweepTimerRef.current);
        sweepTimerRef.current = null;
      }
      if (sweepWatchdogRef.current !== null) {
        window.clearTimeout(sweepWatchdogRef.current);
        sweepWatchdogRef.current = null;
      }
    };
  }, [active, advanceToState, flowState]);

  // ENTER_WALK: öğrencinin kendi karakteri kapıya yürür, eşikte solar, fade ile INTERIOR_WALK'a geçer
  useEffect(() => {
    if (!active || flowState !== 'ENTER_WALK') return;

    const token = sessionTokenRef.current;
    const reduced =
      typeof window !== 'undefined' &&
      (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
    const walkDuration = reduced
      ? ARCHITECT_TIMINGS.enterWalkReducedMs
      : ARCHITECT_TIMINGS.enterWalkDurationMs;

    animStateRef.current.enterWalkProgress = 0;
    animStateRef.current.fadeOverlayAlpha = 0;
    enterWalkStartRef.current = performance.now();
    enterWalkDurationRef.current = walkDuration;

    let done = false;
    const finishEnterWalk = (fromWatchdog: boolean) => {
      if (done || sessionTokenRef.current !== token) return;
      done = true;
      if (fromWatchdog) {
        console.warn('[Mimar] ENTER_WALK 10 sn bekçi zamanlayıcı ile iç mekâna geçirildi.');
      }
      animStateRef.current.enterWalkProgress = 1;
      animStateRef.current.fadeOverlayAlpha = 1;
      if (enterWalkTimerRef.current !== null) {
        window.clearTimeout(enterWalkTimerRef.current);
        enterWalkTimerRef.current = null;
      }
      if (enterWalkWatchdogRef.current !== null) {
        window.clearTimeout(enterWalkWatchdogRef.current);
        enterWalkWatchdogRef.current = null;
      }
      advanceToState('ENTER_WALK', 'INTERIOR_WALK');
    };

    enterWalkTimerRef.current = window.setTimeout(() => finishEnterWalk(false), walkDuration);
    enterWalkWatchdogRef.current = window.setTimeout(
      () => finishEnterWalk(true),
      ARCHITECT_TIMINGS.enterWalkWatchdogMs,
    );

    return () => {
      if (enterWalkTimerRef.current !== null) {
        window.clearTimeout(enterWalkTimerRef.current);
        enterWalkTimerRef.current = null;
      }
      if (enterWalkWatchdogRef.current !== null) {
        window.clearTimeout(enterWalkWatchdogRef.current);
        enterWalkWatchdogRef.current = null;
      }
    };
  }, [active, advanceToState, flowState]);

  // Seçenek kartına tıklandığında anında köşk üzerinde önizleme güncelle
  const selectPreviewOption = useCallback((optionId: string) => {
    if (transitionLockRef.current) return;
    if (!isBuildStep(flowStateRef.current)) return;
    previewValueRef.current = optionId;
    setPreviewValue(optionId);
  }, []);

  // "Yerleştir": seçimi kilitle, <300ms oturma animasyonu oynat, sonraki adıma tek kez geç
  const confirmPlacement = useCallback(() => {
    const current = flowStateRef.current;
    const chosen = previewValueRef.current;
    if (!isBuildStep(current) || !chosen || transitionLockRef.current) return;

    const nextState = getNextState(current);
    if (!nextState) return;

    transitionLockRef.current = true;
    const token = sessionTokenRef.current;

    const updated: ArchitectSelections = { ...selectionsRef.current };
    if (current === 'STEP_DOOR') updated.door = chosen as DoorPatternId;
    else if (current === 'STEP_WINDOW') updated.window = chosen as WindowPatternId;
    else if (current === 'STEP_ROOF') updated.roof = chosen as RoofOptionId;
    else if (current === 'STEP_ORNAMENT') updated.ornament = chosen as OrnamentPatternId;

    selectionsRef.current = updated;
    setSelections(updated);
    setIsSettling(true);

    const reduced =
      typeof window !== 'undefined' &&
      (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
    const settleDuration = reduced
      ? ARCHITECT_TIMINGS.partSettleReducedMs
      : ARCHITECT_TIMINGS.partSettleDurationMs;

    settleStartRef.current = performance.now();
    settleDurationRef.current = settleDuration;
    animStateRef.current.settlingStep = current;
    animStateRef.current.settleProgress = 0;

    let completed = false;
    const finishSettle = (fromWatchdog: boolean) => {
      if (completed || sessionTokenRef.current !== token) return;
      completed = true;
      if (fromWatchdog) {
        console.warn(`[Mimar] ${current} oturma animasyonu bekçi zamanlayıcı ile tamamlandı.`);
      }
      if (settleTimerRef.current !== null) {
        window.clearTimeout(settleTimerRef.current);
        settleTimerRef.current = null;
      }
      if (settleWatchdogRef.current !== null) {
        window.clearTimeout(settleWatchdogRef.current);
        settleWatchdogRef.current = null;
      }
      animStateRef.current.settlingStep = null;
      animStateRef.current.settleProgress = 1;
      previewValueRef.current = null;
      setPreviewValue(null);
      setIsSettling(false);
      transitionLockRef.current = false;
      advanceToState(current, nextState);
    };

    settleTimerRef.current = window.setTimeout(() => finishSettle(false), settleDuration);
    settleWatchdogRef.current = window.setTimeout(
      () => finishSettle(true),
      ARCHITECT_TIMINGS.partSettleWatchdogMs,
    );
  }, [advanceToState]);

  /** İç mekânda öğrenci işaretli yıldıza yaklaşınca tek kez CLOSING durumuna geçer */
  const reachInteriorMarker = useCallback(() => {
    advanceToState('INTERIOR_WALK', 'CLOSING');
  }, [advanceToState]);

  /** Tek rAF döngüsünden her karede güncel görsel anlık görüntüsünü hesaplar */
  const readSnapshot = useCallback((now: number): ArchitectRuntimeSnapshot => {
    const anim = animStateRef.current;
    if (anim.settlingStep) {
      const elapsed = Math.max(0, now - settleStartRef.current);
      anim.settleProgress = Math.min(1, elapsed / Math.max(1, settleDurationRef.current));
    }
    if (flowStateRef.current === 'BUILD_DONE' && !anim.sweepCompleted && sweepStartRef.current > 0) {
      const elapsed = Math.max(0, now - sweepStartRef.current);
      anim.sweepProgress = Math.min(1, elapsed / Math.max(1, sweepDurationRef.current));
    }
    if (flowStateRef.current === 'ENTER_WALK' && enterWalkStartRef.current > 0) {
      const elapsed = Math.max(0, now - enterWalkStartRef.current);
      const p = Math.min(1, elapsed / Math.max(1, enterWalkDurationRef.current));
      anim.enterWalkProgress = p;
      // Son %15 dilimde yumuşak kararma (fade)
      anim.fadeOverlayAlpha = p > 0.84 ? Math.min(1, (p - 0.84) / 0.16) : 0;
    } else if (
      (flowStateRef.current === 'INTERIOR_WALK' ||
        flowStateRef.current === 'CLOSING' ||
        flowStateRef.current === 'DONE') &&
      interiorFadeStartRef.current > 0
    ) {
      const elapsed = Math.max(0, now - interiorFadeStartRef.current);
      anim.fadeOverlayAlpha = Math.max(0, 1 - elapsed / ARCHITECT_TIMINGS.interiorFadeInMs);
    } else {
      anim.fadeOverlayAlpha = 0;
    }

    return {
      flowState: flowStateRef.current,
      selections: selectionsRef.current,
      previewValue: previewValueRef.current,
      speechBubbleText:
        flowStateRef.current === 'MIMAR_INTRO'
          ? ARCHITECT_DIALOGUE.introText
          : flowStateRef.current === 'CLOSING' || flowStateRef.current === 'DONE'
            ? ARCHITECT_DIALOGUE.closingText
            : null,
      isLocked:
        flowStateRef.current === 'MIMAR_INTRO' ||
        flowStateRef.current === 'BUILD_DONE' ||
        flowStateRef.current === 'ENTER_WALK' ||
        flowStateRef.current === 'CLOSING' ||
        transitionLockRef.current,
      anim: { ...anim },
    };
  }, []);

  // Bileşen ayrıldığında temizlik
  useEffect(() => cleanup, [cleanup]);

  const isControlsLocked =
    flowState === 'MIMAR_INTRO' ||
    isSettling ||
    flowState === 'BUILD_DONE' ||
    flowState === 'ENTER_WALK' ||
    flowState === 'CLOSING';

  return {
    flowState,
    selections,
    previewValue,
    speechBubbleText,
    isControlsLocked,
    begin,
    restartBuild,
    cleanup,
    selectPreviewOption,
    confirmPlacement,
    reachInteriorMarker,
    readSnapshot,
  };
}

export type ArchitectExperienceState = ReturnType<typeof useArchitectExperience>;
