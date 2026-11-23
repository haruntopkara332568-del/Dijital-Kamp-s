import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Sparkles, DoorOpen } from 'lucide-react';
import { WalkableCanvasEngine } from './engine/WalkableCanvasEngine';
import { createCourtyardLavenderLayer } from './engine/courtyardLavender';
import {
  renderCourtyardBackground,
  renderCourtyardLayeredBackground,
  renderCourtyardEntities,
  renderCourtyardForeground,
} from './engine/courtyardSceneRenderer';
import {
  renderClassroomBackground,
  renderClassroomLayeredBackground,
  renderClassroomEntities,
  renderClassroomForeground,
} from './engine/classroomSceneRenderer';
import {
  DISCOVERY_CLASSROOM,
  DISCOVERY_CLASSROOM_OBSTACLES,
  renderDiscoveryClassroomBackground,
  renderDiscoveryClassroomLayeredBackground,
  renderDiscoveryClassroomEntities,
  renderDiscoveryClassroomForeground,
} from './engine/discoveryClassroomSceneRenderer';
import {
  MOON_SCENE,
  DISCOVERY_MOON_OBSTACLES,
  renderDiscoveryMoonBackground,
  renderDiscoveryMoonEntities,
  renderDiscoveryMoonWalkableScene,
} from './engine/discoveryMoonSceneRenderer';
import {
  DISCOVERY_VR_CONFIG,
  type CareerDefinition,
  type DiscoveryVrState,
} from '@/src/data/discoveryCareerConfig';
import { DiscoveryCareerModal } from './components/DiscoveryCareerModal';
import {
  PORTAL,
  renderSultanhaniBackground,
  renderSultanhaniEntities,
  renderSultanhaniInnerBackground,
  renderSultanhaniInnerEntities,
  SULTANHANI_INNER,
  SULTANHANI_SQUARE,
} from './engine/sultanhaniSceneRenderer';
import { getSultanhaniTouristAtlas } from './engine/assetLoader';
import { WalkableControlsOverlay } from './components/WalkableControlsOverlay';
import {
  NpcSpeechBubble,
  type ActiveSpeechBubbleState,
  type StudentChoicePromptState,
} from './components/NpcSpeechBubble';
import { SmartBoardModal } from './components/SmartBoardModal';
import { GradeBoardModal } from './components/GradeBoardModal';
import { TableStationModal } from './components/TableStationModal';
import { CAMPUS_BUILDING_NAMES } from '@/src/data/brandConfig';
import { STUDENT_REFERENCE_SPEED_PX, SULTANHANI_TOURIST_NPC } from '@/src/data/sultanhaniNpc';
import {
  advanceSultanhaniFlowState,
  buildSultanhaniDialogExchanges,
  logSultanhaniFlow,
  mapFlowStateToEncounterPhase,
  SULTANHANI_FEEDBACK_COPY,
  SULTANHANI_SELF_INTRODUCTION,
  SULTANHANI_TIMINGS,
  type SultanhaniDialogChoiceOption,
  type SultanhaniDialogExchange,
  type SultanhaniEncounterPhase,
  type SultanhaniFlowEvent,
  type SultanhaniFlowState,
} from '@/src/data/sultanhaniDialogContent';
import { playSultanhaniSpeechLine, waitAbortable } from './engine/sultanhaniSpeechRunner';
import { stopSpeaking } from '@/src/services/speech';
import type { StudentCharacterId } from '@/src/data/studentCharacters';
import { useOptionalCampus } from '../../app/CampusProviders';
import type { InteractiveZone, Position, SceneObstacle, WalkableSceneConfig } from './types';
import type { MissionStageId } from '@/src/types/campus';

const REQUIRE_TABLE_COMPLETION_FOR_SMARTBOARD = false;

export interface WalkableCampusViewProps {
  characterId?: StudentCharacterId;
  initialScene?:
    | 'courtyard'
    | 'classroom'
    | 'discovery_classroom'
    | 'discovery_moon'
    | 'sultanhani_square'
    | 'sultanhani_inner';
  onBackToMap?: () => void;
  onExitToGate?: () => void;
}

export function WalkableCampusView({
  characterId,
  initialScene = 'courtyard',
  onBackToMap,
  onExitToGate,
}: WalkableCampusViewProps) {
  const navigate = useNavigate();
  const campus = useOptionalCampus();
  const selectedGrade = campus?.state.selectedGrade ?? null;
  const selectedGradeRef = useRef<number | null>(selectedGrade);
  const onExitToGateRef = useRef(onExitToGate);
  const campusRef = useRef(campus);

  const currentMissionProgress =
    campus && selectedGrade
      ? campus.getMissionProgress('kapilarin-anlattigi-hikaye', selectedGrade)
      : null;
  const completedStages = useMemo(
    () => currentMissionProgress?.completedStages ?? [],
    [currentMissionProgress?.completedStages],
  );
  const completedStagesRef = useRef<string[]>(completedStages);

  useEffect(() => {
    completedStagesRef.current = completedStages;
  }, [completedStages]);

  useEffect(() => {
    selectedGradeRef.current = selectedGrade;
  }, [selectedGrade]);

  useEffect(() => {
    onExitToGateRef.current = onExitToGate;
  }, [onExitToGate]);

  useEffect(() => {
    campusRef.current = campus;
  }, [campus]);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<WalkableCanvasEngine | null>(null);
  const characterIdRef = useRef(characterId);

  useEffect(() => {
    characterIdRef.current = characterId;
    if (engineRef.current) engineRef.current.player.characterId = characterId;
  }, [characterId]);
  const sceneTransitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sahne içi son konumları saklayarak geri dönüşlerde konumu koruma (Section 6)
  const lastCourtyardPosRef = useRef<Position>({ x: 700, y: 560 });
  const lastClassroomPosRef = useRef<Position>({ x: 480, y: 520 });
  const lastDiscoveryClassroomPosRef = useRef<Position>(DISCOVERY_CLASSROOM.playerSpawn);
  const lastSultanhaniPosRef = useRef<Position>(SULTANHANI_SQUARE.spawn);
  const sultanhaniSquareEntryRef = useRef<'initial' | 'smart-board' | 'courtyard-exit'>('initial');
  const discoveryDoorOpeningLockRef = useRef(false);
  const discoveryDoorProgressRef = useRef(0);
  const discoveryDoorAnimFrameRef = useRef<number | null>(null);
  const discoveryDoorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [currentScene, setCurrentScene] = useState<
    | 'courtyard'
    | 'classroom'
    | 'discovery_classroom'
    | 'discovery_moon'
    | 'sultanhani_square'
    | 'sultanhani_inner'
  >(initialScene);
  const [activeZone, setActiveZone] = useState<InteractiveZone | null>(null);
  const [unreachableMessage, setUnreachableMessage] = useState<string | null>(null);

  // Hayalden Gerçeğe — VR Meslek Keşfi Durum Makinesi
  const [vrState, setVrState] = useState<DiscoveryVrState>('CLASS_IDLE');
  const vrStateRef = useRef<DiscoveryVrState>('CLASS_IDLE');
  const [isCareerModalOpen, setIsCareerModalOpen] = useState(false);
  const vrTransitionLockRef = useRef(false);
  const [isMoonLandingComplete, setIsMoonLandingComplete] = useState(false);
  const isMoonLandingCompleteRef = useRef(false);
  const isMoonLandingSkippedRef = useRef(false);
  const moonAnimStartTimeRef = useRef(0);
  const moonWatchdogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotionRef = useRef(false);

  useEffect(() => {
    vrStateRef.current = vrState;
  }, [vrState]);

  // Parça 3 — Ay Yüzeyi Görevi ve Kaya Örneği Durumları
  const [isSampleTaken, setIsSampleTaken] = useState(false);
  const isSampleTakenRef = useRef(false);
  const [, setIsCollectingSample] = useState(false);
  const isCollectingSampleRef = useRef(false);
  const sampleCollectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isMissionCompletedModalOpen, setIsMissionCompletedModalOpen] = useState(false);
  const [landerEarlyHint, setLanderEarlyHint] = useState<string | null>(null);
  const landerEarlyHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [offScreenIndicator, setOffScreenIndicator] = useState<{
    visible: boolean;
    angle: number;
    targetName: string;
  } | null>(null);
  const [isSmartBoardModalOpen, setIsSmartBoardModalOpen] = useState(false);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [activeTableStage, setActiveTableStage] = useState<MissionStageId | null>(null);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isSmartBoardPoweringOn, setIsSmartBoardPoweringOn] = useState(false);
  const [isSmartBoardActive, setIsSmartBoardActive] = useState(false);
  const [isTeleporting, setIsTeleporting] = useState(false);
  const [teleportMessage, setTeleportMessage] = useState("Sultanhanı Kervansarayı Meydanı'na Işınlanıyorsun... 🏛️✨");

  // Sultanhanı Dış Meydan karşılaşma durum makinesi (tek kaynak)
  const [flowState, setFlowState] = useState<SultanhaniFlowState>({
    stepPhase: initialScene === 'sultanhani_inner' ? 'DONE' : 'ARRIVAL',
    exchangeIndex: 0,
  });
  const flowStateRef = useRef(flowState);
  const encounterPhase = mapFlowStateToEncounterPhase(flowState);
  const encounterPhaseRef = useRef(encounterPhase);
  const [activeBubble, setActiveBubble] = useState<ActiveSpeechBubbleState | null>(null);
  const [choicePrompt, setChoicePrompt] = useState<StudentChoicePromptState | null>(null);
  const [isSpeakingLine, setIsSpeakingLine] = useState(false);
  const [npcAnchorPos, setNpcAnchorPos] = useState<Position | null>(null);
  const [studentAnchorPos, setStudentAnchorPos] = useState<Position | null>(null);

  const speechEnabledRef = useRef(campus?.state.speechEnabled ?? true);
  useEffect(() => {
    speechEnabledRef.current = campus?.state.speechEnabled ?? true;
    if (!speechEnabledRef.current) {
      stopSpeaking();
    }
  }, [campus?.state.speechEnabled]);

  const encounterAbortRef = useRef<AbortController | null>(null);
  const speechAbortRef = useRef<AbortController | null>(null);
  const walkWatchdogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialogExchangesRef = useRef<readonly SultanhaniDialogExchange[]>(
    buildSultanhaniDialogExchanges(0),
  );
  const lastTouristLineRef = useRef<string | null>(null);
  const encounterSeedRef = useRef(0);

  // Akıllı tahta animasyon durumunu ref üzerinden aktararak motorun gereksiz sıfırlanmasını önle
  const smartBoardVisualStateRef = useRef({
    active: false,
    poweringOn: false,
  });

  useEffect(() => {
    smartBoardVisualStateRef.current = {
      active: isSmartBoardActive,
      poweringOn: isSmartBoardPoweringOn,
    };
  }, [isSmartBoardActive, isSmartBoardPoweringOn]);

  const handleBackToMap = useCallback(() => {
    if (onBackToMap) {
      onBackToMap();
    } else {
      navigate('/harita');
    }
  }, [onBackToMap, navigate]);

  const dispatchFlowEvent = useCallback((event: SultanhaniFlowEvent): SultanhaniFlowState | null => {
    const totalExchanges = Math.max(1, dialogExchangesRef.current.length);
    const next = advanceSultanhaniFlowState(flowStateRef.current, event, totalExchanges);
    if (!next) return null;
    flowStateRef.current = next;
    encounterPhaseRef.current = mapFlowStateToEncounterPhase(next);
    setFlowState(next);
    logSultanhaniFlow(`${next.stepPhase} (${next.exchangeIndex + 1}/${totalExchanges})`);
    return next;
  }, []);

  const cancelAllEncounterAsync = useCallback(() => {
    if (walkWatchdogTimerRef.current !== null) {
      clearTimeout(walkWatchdogTimerRef.current);
      walkWatchdogTimerRef.current = null;
    }
    if (encounterAbortRef.current) {
      encounterAbortRef.current.abort();
      encounterAbortRef.current = null;
    }
    if (speechAbortRef.current) {
      speechAbortRef.current.abort();
      speechAbortRef.current = null;
    }
    stopSpeaking();
  }, []);

  const resetEncounterState = useCallback(
    (targetPhase: SultanhaniEncounterPhase = 'ARRIVAL') => {
      cancelAllEncounterAsync();
      const initialFlow: SultanhaniFlowState = {
        stepPhase: targetPhase === 'DONE' ? 'DONE' : 'ARRIVAL',
        exchangeIndex: 0,
      };
      flowStateRef.current = initialFlow;
      encounterPhaseRef.current = targetPhase;
      setFlowState(initialFlow);
      lastTouristLineRef.current = null;
      setIsSpeakingLine(false);
      setActiveBubble(null);
      setChoicePrompt(null);
      setNpcAnchorPos(null);
      setStudentAnchorPos(null);
      engineRef.current?.stopEncounterControl();
    },
    [cancelAllEncounterAsync],
  );

  const clearDiscoveryDoorTimers = useCallback(() => {
    if (discoveryDoorAnimFrameRef.current !== null && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(discoveryDoorAnimFrameRef.current);
      discoveryDoorAnimFrameRef.current = null;
    }
    if (discoveryDoorTimerRef.current !== null) {
      clearTimeout(discoveryDoorTimerRef.current);
      discoveryDoorTimerRef.current = null;
    }
    discoveryDoorOpeningLockRef.current = false;
    discoveryDoorProgressRef.current = 0;
  }, []);

  useEffect(
    () => () => {
      if (sceneTransitionTimer.current !== null) clearTimeout(sceneTransitionTimer.current);
      clearDiscoveryDoorTimers();
      cancelAllEncounterAsync();
    },
    [cancelAllEncounterAsync, clearDiscoveryDoorTimers],
  );

  const speakEncounterLine = useCallback(
    async (
      text: string,
      speaker: 'student' | 'tourist',
      signal: AbortSignal,
      cancelPrevious = false,
    ) => {
      if (speechAbortRef.current) {
        speechAbortRef.current.abort();
      }
      const lineAbort = new AbortController();
      speechAbortRef.current = lineAbort;
      const onParentAbort = () => lineAbort.abort();
      signal.addEventListener('abort', onParentAbort, { once: true });

      try {
        return await playSultanhaniSpeechLine({
          text,
          speaker,
          speechEnabled: speechEnabledRef.current,
          signal: lineAbort.signal,
          cancelPrevious,
          waitWhenSilent: true,
          onSpeakingChange: setIsSpeakingLine,
        });
      } finally {
        signal.removeEventListener('abort', onParentAbort);
        if (speechAbortRef.current === lineAbort) {
          speechAbortRef.current = null;
        }
      }
    },
    [],
  );

  const triggerPortalTransition = useCallback(
    (fromWatchdog = false) => {
      const next = dispatchFlowEvent({
        type: fromWatchdog ? 'FORCE_DOOR_WATCHDOG' : 'ARRIVED_AT_DOOR',
      });
      if (!next) return;

      if (walkWatchdogTimerRef.current !== null) {
        clearTimeout(walkWatchdogTimerRef.current);
        walkWatchdogTimerRef.current = null;
      }
      if (sceneTransitionTimer.current !== null) {
        clearTimeout(sceneTransitionTimer.current);
        sceneTransitionTimer.current = null;
      }

      setActiveBubble(null);
      setChoicePrompt(null);
      setActiveZone(null);
      const reducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      const delay = reducedMotion
        ? SULTANHANI_TIMINGS.reducedMotionTransitionMs
        : SULTANHANI_TIMINGS.transitionFadeMs;

      setTeleportMessage('Sultanhanı İç Avlusuna Giriliyor... 🏛️✨');
      setIsTeleporting(true);
      sceneTransitionTimer.current = setTimeout(() => {
        sceneTransitionTimer.current = null;
        setIsTeleporting(false);
        dispatchFlowEvent({ type: 'TRANSITION_COMPLETE' });
        setCurrentScene('sultanhani_inner');
      }, delay);
    },
    [dispatchFlowEvent],
  );

  const beginWalkToDoorEngine = useCallback(() => {
    setActiveBubble(null);
    setChoicePrompt(null);

    const engine = engineRef.current;
    if (walkWatchdogTimerRef.current !== null) {
      clearTimeout(walkWatchdogTimerRef.current);
    }

    walkWatchdogTimerRef.current = setTimeout(() => {
      walkWatchdogTimerRef.current = null;
      if (flowStateRef.current.stepPhase === 'WALK_TO_DOOR') {
        console.warn(
          '[akış-bekçi] ADIM: TRANSITION — Kapıya yürüyüş 12 sn içinde tamamlanamadı; güvenli geçiş uygulanıyor.',
        );
        triggerPortalTransition(true);
      }
    }, SULTANHANI_TIMINGS.walkToDoorWatchdogMs);

    if (!engine) {
      triggerPortalTransition(false);
      return;
    }

    engine.startWalkToDoor(PORTAL.doorWalkTarget, PORTAL.threshold, () => {
      triggerPortalTransition(false);
    });
  }, [triggerPortalTransition]);

  const openExchangeChoice = useCallback((exchangeIndex: number) => {
    const exchange = dialogExchangesRef.current[exchangeIndex];
    if (!exchange) return;
    setActiveBubble(null);
    setChoicePrompt({
      stepId: exchange.id,
      options: exchange.options,
      wrongAttempts: 0,
      hintTurkish: exchange.hintTurkish,
    });
  }, []);

  const speakTouristLine = useCallback((text: string, signal: AbortSignal) => {
    const anchors = engineRef.current?.getEntityScreenPositions();
    if (anchors?.npc) setNpcAnchorPos(anchors.npc);
    if (anchors?.student) setStudentAnchorPos(anchors.student);

    setActiveBubble({ speaker: 'tourist', speakerLabel: SULTANHANI_TOURIST_NPC.name, text });
    lastTouristLineRef.current = text;
    return speakEncounterLine(text, 'tourist', signal);
  }, [speakEncounterLine]);

  const executeTouristReply = useCallback(
    async (exchangeIndex: number) => {
      const controller = encounterAbortRef.current;
      if (!controller || controller.signal.aborted) return;
      const { signal } = controller;
      const exchange = dialogExchangesRef.current[exchangeIndex];
      if (!exchange) return;

      setChoicePrompt(null);
      await speakTouristLine(exchange.touristText, signal);
      if (signal.aborted || !dispatchFlowEvent({ type: 'TOURIST_SPEECH_COMPLETE' })) return;
      setActiveBubble(null);

      const ok = await waitAbortable(SULTANHANI_TIMINGS.afterTouristLinePauseMs, signal);
      if (!ok || signal.aborted) return;
      const afterPause = dispatchFlowEvent({ type: 'AFTER_TOURIST_PAUSE_COMPLETE' });

      if (afterPause?.stepPhase === 'STUDENT_CHOICE') {
        openExchangeChoice(afterPause.exchangeIndex);
      } else if (afterPause?.stepPhase === 'TOURIST_ASKING_NAME') {
        await speakTouristLine(SULTANHANI_SELF_INTRODUCTION.question, signal);
        if (signal.aborted) return;
        setActiveBubble(null);
        dispatchFlowEvent({ type: 'TOURIST_NAME_QUESTION_COMPLETE' });
      }
    },
    [dispatchFlowEvent, openExchangeChoice, speakTouristLine],
  );

  const handleConfirmIntroduction = useCallback(() => {
    const signal = encounterAbortRef.current?.signal;
    if (!signal || signal.aborted) return;
    if (dispatchFlowEvent({ type: 'STUDENT_INTRODUCTION_CONFIRMED' })) {
      beginWalkToDoorEngine();
    }
  }, [beginWalkToDoorEngine, dispatchFlowEvent]);

  const handleSelectOption = useCallback(
    (option: SultanhaniDialogChoiceOption) => {
      const controller = encounterAbortRef.current;
      if (!controller || controller.signal.aborted) return;
      if (flowStateRef.current.stepPhase !== 'STUDENT_CHOICE') return;

      if (!option.isCorrect) {
        let shouldReplayLastTouristLine = false;
        setChoicePrompt((prev) => {
          if (!prev) return prev;
          const nextAttempts = prev.wrongAttempts + 1;
          shouldReplayLastTouristLine = nextAttempts === 1;
          return {
            ...prev,
            wrongAttempts: nextAttempts,
          };
        });
        if (shouldReplayLastTouristLine && lastTouristLineRef.current) {
          void speakEncounterLine(lastTouristLineRef.current, 'tourist', controller.signal, true);
        }
        return;
      }

      const studentSpeakingState = dispatchFlowEvent({ type: 'STUDENT_OPTION_SELECTED' });
      if (!studentSpeakingState) return;

      const currentExchangeIndex = studentSpeakingState.exchangeIndex;
      setChoicePrompt(null);
      const anchors = engineRef.current?.getEntityScreenPositions();
      if (anchors?.student) setStudentAnchorPos(anchors.student);

      setActiveBubble({
        speaker: 'student',
        speakerLabel: SULTANHANI_FEEDBACK_COPY.studentSpeakerLabel,
        text: option.text,
      });

      void (async () => {
        await speakEncounterLine(option.text, 'student', controller.signal, true);
        if (controller.signal.aborted) return;

        const waitBeforeTourist = dispatchFlowEvent({ type: 'STUDENT_SPEECH_COMPLETE' });
        if (!waitBeforeTourist) return;

        // Öğrenci repliği bitince öğrenci balonu kapanır, kısa bekleme (~500 ms)
        setActiveBubble(null);

        const ok = await waitAbortable(
          SULTANHANI_TIMINGS.afterStudentLinePauseMs,
          controller.signal,
        );
        if (!ok || controller.signal.aborted) return;

        const touristStart = dispatchFlowEvent({ type: 'START_TOURIST_REPLY' });
        if (!touristStart) return;
        void executeTouristReply(currentExchangeIndex);
      })();
    },
    [dispatchFlowEvent, executeTouristReply, speakEncounterLine],
  );

  const handlePreviewOption = useCallback((optionText: string) => {
    const parentSignal = encounterAbortRef.current?.signal;
    if (parentSignal?.aborted) return;
    if (speechAbortRef.current) {
      speechAbortRef.current.abort();
    }
    const previewController = new AbortController();
    speechAbortRef.current = previewController;
    const onParentAbort = () => previewController.abort();
    parentSignal?.addEventListener('abort', onParentAbort, { once: true });

    void playSultanhaniSpeechLine({
      text: optionText,
      speaker: 'student',
      speechEnabled: speechEnabledRef.current,
      signal: previewController.signal,
      cancelPrevious: true,
      waitWhenSilent: false,
      onSpeakingChange: setIsSpeakingLine,
    }).finally(() => {
      parentSignal?.removeEventListener('abort', onParentAbort);
      if (speechAbortRef.current === previewController) {
        speechAbortRef.current = null;
      }
    });
  }, []);

  const handleExitSultanhani = useCallback(() => {
    if (sceneTransitionTimer.current !== null) {
      clearTimeout(sceneTransitionTimer.current);
      sceneTransitionTimer.current = null;
    }
    sultanhaniSquareEntryRef.current = 'initial';
    resetEncounterState('ARRIVAL');
    engineRef.current?.setInputDisabled(true);
    setActiveZone(null);
    lastSultanhaniPosRef.current = SULTANHANI_SQUARE.spawn;
    setTeleportMessage("İngilizce Sınıfına Geri Dönülüyor... 🎒");
    setIsTeleporting(true);
    sceneTransitionTimer.current = setTimeout(() => {
      sceneTransitionTimer.current = null;
      setIsTeleporting(false);
      lastClassroomPosRef.current = { x: 480, y: 180 };
      setCurrentScene('classroom');
    }, 600);
  }, [resetEncounterState]);

  const handleExitInnerCourtyard = useCallback(() => {
    if (sceneTransitionTimer.current !== null) return;
    resetEncounterState('DONE');
    engineRef.current?.setInputDisabled(true);
    setActiveZone(null);
    setUnreachableMessage(null);
    setTeleportMessage('Sultanhanı Meydanı’na çıkılıyor…');
    setIsTeleporting(true);
    sceneTransitionTimer.current = setTimeout(() => {
      sceneTransitionTimer.current = null;
      sultanhaniSquareEntryRef.current = 'courtyard-exit';
      lastSultanhaniPosRef.current = SULTANHANI_SQUARE.portalExit.player;
      setIsTeleporting(false);
      setCurrentScene('sultanhani_square');
    }, SULTANHANI_TIMINGS.transitionFadeMs);
  }, [resetEncounterState]);

  const handleEnterDiscoveryClassroom = useCallback(() => {
    if (discoveryDoorOpeningLockRef.current) return;
    discoveryDoorOpeningLockRef.current = true;
    discoveryDoorProgressRef.current = 0;

    if (engineRef.current) {
      engineRef.current.setInputDisabled(true);
      engineRef.current.player.direction = 'up';
    }
    setActiveZone(null);

    const isReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const durationMs = isReducedMotion ? 160 : 620;
    const holdOpenMs = isReducedMotion ? 60 : 160;
    const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();

    const stepDoorAnimation = () => {
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const elapsed = Math.max(0, now - startedAt);
      const progress = Math.min(1, elapsed / durationMs);
      discoveryDoorProgressRef.current = progress;
      if (progress < 1 && typeof requestAnimationFrame === 'function') {
        discoveryDoorAnimFrameRef.current = requestAnimationFrame(stepDoorAnimation);
      } else {
        discoveryDoorAnimFrameRef.current = null;
      }
    };

    if (typeof requestAnimationFrame === 'function') {
      discoveryDoorAnimFrameRef.current = requestAnimationFrame(stepDoorAnimation);
    } else {
      discoveryDoorProgressRef.current = 1;
    }

    discoveryDoorTimerRef.current = setTimeout(() => {
      discoveryDoorTimerRef.current = null;
      if (discoveryDoorAnimFrameRef.current !== null && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(discoveryDoorAnimFrameRef.current);
        discoveryDoorAnimFrameRef.current = null;
      }
      discoveryDoorProgressRef.current = 0;
      discoveryDoorOpeningLockRef.current = false;
      lastDiscoveryClassroomPosRef.current = DISCOVERY_CLASSROOM.playerSpawn;
      setCurrentScene('discovery_classroom');
    }, durationMs + holdOpenMs);
  }, []);

  const handleExitDiscoveryClassroom = useCallback(() => {
    clearDiscoveryDoorTimers();
    lastCourtyardPosRef.current = { x: 290, y: 350 };
    setActiveZone(null);
    setCurrentScene('courtyard');
  }, [clearDiscoveryDoorTimers]);

  const handlePutOnGlasses = useCallback(() => {
    if (vrTransitionLockRef.current) return;
    engineRef.current?.stopMoving();
    setVrState('CAREER_SELECT');
    setIsCareerModalOpen(true);
  }, []);

  const handleSelectCareer = useCallback((career: CareerDefinition) => {
    void career;
    if (vrTransitionLockRef.current) return;
    vrTransitionLockRef.current = true;
    setActiveZone(null);
    setIsMoonLandingComplete(false);
    isMoonLandingCompleteRef.current = false;
    isMoonLandingSkippedRef.current = false;
    setIsCareerModalOpen(false);
    setVrState('LANDING');
    setIsTeleporting(true);
    setTeleportMessage('VR Başlığı Takılıyor... Ay Görevi Başlatılıyor 🚀🌕');
    setTimeout(() => {
      setCurrentScene('discovery_moon');
      setIsTeleporting(false);
      vrTransitionLockRef.current = false;
    }, DISCOVERY_VR_CONFIG.fadeTransitionMs);
  }, []);

  const handleRemoveGlasses = useCallback(() => {
    if (vrTransitionLockRef.current) return;
    vrTransitionLockRef.current = true;
    setActiveZone(null);
    if (moonWatchdogTimerRef.current) {
      clearTimeout(moonWatchdogTimerRef.current);
      moonWatchdogTimerRef.current = null;
    }
    if (sampleCollectTimerRef.current) {
      clearTimeout(sampleCollectTimerRef.current);
      sampleCollectTimerRef.current = null;
    }
    if (landerEarlyHintTimerRef.current) {
      clearTimeout(landerEarlyHintTimerRef.current);
      landerEarlyHintTimerRef.current = null;
    }
    moonAnimStartTimeRef.current = 0;
    isMoonLandingCompleteRef.current = false;
    isMoonLandingSkippedRef.current = false;
    setIsMoonLandingComplete(false);
    setIsCareerModalOpen(false);
    isSampleTakenRef.current = false;
    setIsSampleTaken(false);
    isCollectingSampleRef.current = false;
    setIsCollectingSample(false);
    setIsMissionCompletedModalOpen(false);
    setLanderEarlyHint(null);
    setOffScreenIndicator(null);
    setVrState('CLASS_RETURN');
    setIsTeleporting(true);
    setTeleportMessage('Gözlük Çıkarılıyor... Sınıfa Dönülüyor ✨');
    setTimeout(() => {
      lastDiscoveryClassroomPosRef.current = DISCOVERY_VR_CONFIG.returnClassroomSpawn;
      setCurrentScene('discovery_classroom');
      setVrState('CLASS_IDLE');
      setIsTeleporting(false);
      vrTransitionLockRef.current = false;
      if (engineRef.current) {
        engineRef.current.player.direction = 'up';
      }
    }, DISCOVERY_VR_CONFIG.fadeTransitionMs);
  }, []);

  const handleSkipLandingAnimation = useCallback(() => {
    isMoonLandingSkippedRef.current = true;
    isMoonLandingCompleteRef.current = true;
    setIsMoonLandingComplete(true);
    setVrState('GO_TO_ROCK');
    if (moonWatchdogTimerRef.current) {
      clearTimeout(moonWatchdogTimerRef.current);
      moonWatchdogTimerRef.current = null;
    }
    if (engineRef.current) {
      engineRef.current.setPosition(DISCOVERY_VR_CONFIG.astronautLanding.surfacePosition);
      engineRef.current.stopMoving();
      engineRef.current.setInputDisabled(false);
    }
  }, []);

  const handleTakeRockSample = useCallback(() => {
    if (isSampleTakenRef.current || isCollectingSampleRef.current) return;
    isCollectingSampleRef.current = true;
    setIsCollectingSample(true);
    setActiveZone(null);

    if (engineRef.current) {
      engineRef.current.setInputDisabled(true);
      engineRef.current.stopMoving();
    }

    if (sampleCollectTimerRef.current) clearTimeout(sampleCollectTimerRef.current);
    sampleCollectTimerRef.current = setTimeout(() => {
      sampleCollectTimerRef.current = null;
      isCollectingSampleRef.current = false;
      setIsCollectingSample(false);
      isSampleTakenRef.current = true;
      setIsSampleTaken(true);
      setVrState('SAMPLE_TAKEN');
      if (engineRef.current) {
        engineRef.current.setInputDisabled(false);
      }
    }, DISCOVERY_VR_CONFIG.part3Mission.sampleCollectDurationMs);
  }, []);

  const handleLanderEarlyHint = useCallback(() => {
    if (landerEarlyHintTimerRef.current) clearTimeout(landerEarlyHintTimerRef.current);
    setLanderEarlyHint(DISCOVERY_VR_CONFIG.part3Mission.instructions.earlyLanderHint);
    landerEarlyHintTimerRef.current = setTimeout(() => {
      landerEarlyHintTimerRef.current = null;
      setLanderEarlyHint(null);
    }, 2800);
  }, []);

  const handleCompleteMoonMission = useCallback(() => {
    if (!isSampleTakenRef.current) return;
    setActiveZone(null);
    if (engineRef.current) {
      engineRef.current.setInputDisabled(true);
      engineRef.current.stopMoving();
    }
    setVrState('COMPLETE');
    setIsMissionCompletedModalOpen(true);
  }, []);

  useEffect(() => {
    if (currentScene === 'discovery_moon') {
      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      prefersReducedMotionRef.current = prefersReduced;
      moonAnimStartTimeRef.current = performance.now();
      isMoonLandingCompleteRef.current = false;
      isMoonLandingSkippedRef.current = false;

      if (moonWatchdogTimerRef.current) clearTimeout(moonWatchdogTimerRef.current);
      moonWatchdogTimerRef.current = setTimeout(() => {
        if (!isMoonLandingCompleteRef.current) {
          console.warn('[MoonLanding] 15 sn bekçi zaman aşımı: iniş son duruma zorlandı.');
          isMoonLandingSkippedRef.current = true;
          isMoonLandingCompleteRef.current = true;
          setIsMoonLandingComplete(true);
          setVrState('GO_TO_ROCK');
          if (engineRef.current) {
            engineRef.current.setPosition(DISCOVERY_VR_CONFIG.astronautLanding.surfacePosition);
            engineRef.current.stopMoving();
            engineRef.current.setInputDisabled(false);
          }
        }
      }, DISCOVERY_VR_CONFIG.watchdogTimeoutMs);
    } else {
      if (moonWatchdogTimerRef.current) {
        clearTimeout(moonWatchdogTimerRef.current);
        moonWatchdogTimerRef.current = null;
      }
      if (sampleCollectTimerRef.current) {
        clearTimeout(sampleCollectTimerRef.current);
        sampleCollectTimerRef.current = null;
      }
      if (landerEarlyHintTimerRef.current) {
        clearTimeout(landerEarlyHintTimerRef.current);
        landerEarlyHintTimerRef.current = null;
      }
      moonAnimStartTimeRef.current = 0;
      isMoonLandingCompleteRef.current = false;
      isMoonLandingSkippedRef.current = false;
    }

    return () => {
      if (moonWatchdogTimerRef.current) {
        clearTimeout(moonWatchdogTimerRef.current);
        moonWatchdogTimerRef.current = null;
      }
      if (sampleCollectTimerRef.current) {
        clearTimeout(sampleCollectTimerRef.current);
        sampleCollectTimerRef.current = null;
      }
      if (landerEarlyHintTimerRef.current) {
        clearTimeout(landerEarlyHintTimerRef.current);
        landerEarlyHintTimerRef.current = null;
      }
    };
  }, [currentScene]);

  useEffect(() => {
    if (currentScene !== 'discovery_moon') return;
    const handleMoonKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleRemoveGlasses();
      }
    };
    window.addEventListener('keydown', handleMoonKeyDown);
    return () => window.removeEventListener('keydown', handleMoonKeyDown);
  }, [currentScene, handleRemoveGlasses]);

  // Sahneye göre konfigürasyon belirleme
  const getSceneConfig = useCallback(
    (
      scene:
        | 'courtyard'
        | 'classroom'
        | 'discovery_classroom'
        | 'discovery_moon'
        | 'sultanhani_square'
        | 'sultanhani_inner',
    ): WalkableSceneConfig => {
      if (scene === 'discovery_classroom') {
        const interactiveZones: InteractiveZone[] = [
          {
            id: 'discovery-exit-door',
            name: 'Avluya Dönüş Kapısı',
            prompt: 'Avluya Dön',
            x: DISCOVERY_CLASSROOM.exitDoor.x,
            y: DISCOVERY_CLASSROOM.exitDoor.y,
            radius: DISCOVERY_CLASSROOM.exitDoor.radius,
            action: handleExitDiscoveryClassroom,
          },
          {
            id: 'discovery-vr-glasses',
            name: 'VR Gözlüğü',
            prompt: 'VR Gözlüğünü Tak',
            x: DISCOVERY_VR_CONFIG.pedestalInteraction.x,
            y: DISCOVERY_VR_CONFIG.pedestalInteraction.y,
            radius: DISCOVERY_VR_CONFIG.interactionEnterRadius,
            exitRadius: DISCOVERY_VR_CONFIG.interactionExitRadius,
            action: handlePutOnGlasses,
          },
        ];

        return {
          width: DISCOVERY_CLASSROOM.width,
          height: DISCOVERY_CLASSROOM.height,
          playerSpawn: lastDiscoveryClassroomPosRef.current,
          obstacles: DISCOVERY_CLASSROOM_OBSTACLES,
          interactiveZones,
        };
      }
      if (scene === 'discovery_moon') {
        const mission = DISCOVERY_VR_CONFIG.part3Mission;
        return {
          width: MOON_SCENE.width,
          height: MOON_SCENE.height,
          playerSpawn: DISCOVERY_VR_CONFIG.astronautLanding.surfacePosition,
          obstacles: DISCOVERY_MOON_OBSTACLES,
          interactiveZones: [
            {
              id: 'moon-target-rock',
              name: 'İşaretli Ay Kayası',
              prompt: 'Kaya Örneği Al',
              x: mission.targetRock.x,
              y: mission.targetRock.y,
              radius: mission.targetRock.interactionRadius,
              exitRadius: mission.targetRock.exitRadius,
              action: handleTakeRockSample,
            },
            {
              id: 'moon-lander-station',
              name: 'Ay Modülü',
              prompt: isSampleTakenRef.current
                ? 'Görevi Tamamla'
                : 'Önce işaretli kayadan örnek al.',
              x: mission.landerReturn.x,
              y: mission.landerReturn.y,
              radius: mission.landerReturn.interactionRadius,
              exitRadius: mission.landerReturn.exitRadius,
              action: isSampleTakenRef.current
                ? handleCompleteMoonMission
                : handleLanderEarlyHint,
            },
          ],
        };
      }
      if (scene === 'sultanhani_inner') {
        return {
          width: SULTANHANI_INNER.width,
          height: SULTANHANI_INNER.height,
          playerSpawn: SULTANHANI_INNER.playerSpawn,
          obstacles: SULTANHANI_INNER.obstacles,
          interactiveZones: [{
            id: 'sultanhani-portal-exit',
            name: 'Sultanhanı Meydanı’na Çık',
            prompt: 'Sultanhanı Meydanı’na Çık',
            ...SULTANHANI_INNER.exit,
            targetScene: 'sultanhani_square',
            action: handleExitInnerCourtyard,
          }],
          npc: {
            ...SULTANHANI_TOURIST_NPC,
            scene: 'sultanhani_inner',
            patrol: undefined,
            startPosition: SULTANHANI_INNER.touristSpawn,
            speed: STUDENT_REFERENCE_SPEED_PX * 1.1,
          },
          npcInitialDirection: 'up',
          npcFollowsPlayer: true,
          isNpcVisible: () => getSultanhaniTouristAtlas() !== null,
        };
      }

      if (scene === 'sultanhani_square') {
        const returningFromInner = sultanhaniSquareEntryRef.current === 'courtyard-exit';
        const interactiveZones: InteractiveZone[] = [
          // Sultanhanı Taç Kapı geçiş bölgesi (Diyalog sonrası birlikte girilir)
          {
            id: 'sultanhani-portal-enter',
            name: 'Sultanhanı Taç Kapısı',
            prompt: 'Taç Kapıdan İçeri Gir',
            x: PORTAL.centerX,
            y: PORTAL.triggerY,
            radius: PORTAL.triggerRadius,
            targetScene: 'sultanhani_inner',
            action: () => {
              if (returningFromInner) {
                if (dispatchFlowEvent({ type: 'REENTER_PORTAL' })) beginWalkToDoorEngine();
                return;
              }
              const phase = encounterPhaseRef.current;
              if (phase !== 'ARRIVAL' && phase !== 'APPROACH') {
                return;
              }
              setUnreachableMessage('Önce meydandaki turist arkadaşın Alex ile tanışmalısın.');
              setTimeout(() => setUnreachableMessage(null), 3000);
            },
          },
          // Meydanın güney çıkış portalı: İngilizce sınıfına geri dönüş
          {
            id: 'return-classroom-portal',
            name: 'İngilizce Sınıfına Dönüş',
            prompt: 'Sınıfa Geri Dön [E]',
            x: SULTANHANI_SQUARE.spawn.x,
            y: 910,
            radius: 65,
            action: () => {
              const phase = encounterPhaseRef.current;
              if (phase !== 'ARRIVAL' && phase !== 'APPROACH' && phase !== 'DONE') {
                return;
              }
              handleExitSultanhani();
            },
          },
        ];

        return {
          width: SULTANHANI_SQUARE.width,
          height: SULTANHANI_SQUARE.height,
          playerSpawn: lastSultanhaniPosRef.current,
          obstacles: SULTANHANI_SQUARE.obstacles,
          interactiveZones,
          npc: returningFromInner ? {
            ...SULTANHANI_TOURIST_NPC,
            patrol: undefined,
            startPosition: SULTANHANI_SQUARE.portalExit.alex,
          } : SULTANHANI_TOURIST_NPC,
          npcInitialDirection: returningFromInner ? 'down' : undefined,
          isNpcVisible: () => getSultanhaniTouristAtlas() !== null,
        };
      }

      if (scene === 'classroom') {
        const canStartSmartBoardAdventure = () =>
          !REQUIRE_TABLE_COMPLETION_FOR_SMARTBOARD ||
          ['kesfet', 'ogren', 'uret', 'paylas'].every((stage) => completedStagesRef.current.includes(stage));

        const obstacles: SceneObstacle[] = [
          // Kuzey ön duvar ve akıllı tahta altı
          { id: 'north-wall', name: 'Ön Duvar', x: 0, y: 0, width: 960, height: 130 },
          // Öğretmen kürsüsü
          { id: 'podium', name: 'Öğretmen Kürsüsü', x: 670, y: 160, width: 100, height: 50 },
          // Kitaplık
          { id: 'bookshelf', name: 'Kitaplık', x: 40, y: 150, width: 60, height: 85 },
          // Öğrenci sıraları (Dört Öğrenme Masası)
          { id: 'desk-1', name: 'Keşfet Masası', x: 190, y: 260, width: 150, height: 55 },
          { id: 'desk-2', name: 'Öğren Masası', x: 590, y: 260, width: 150, height: 55 },
          { id: 'desk-3', name: 'Üret Masası', x: 190, y: 390, width: 150, height: 55 },
          { id: 'desk-4', name: 'Paylaş Masası', x: 590, y: 390, width: 150, height: 55 },
        ];

        const interactiveZones: InteractiveZone[] = [
          {
            id: 'grade-board',
            name: 'Sınıf Seçim Panosu',
            prompt: 'Sınıfını Seç / Değiştir',
            x: 270,
            y: 160,
            radius: 80,
            action: () => {
              setIsGradeModalOpen(true);
            },
          },
          {
            id: 'smart-board',
            name: 'Akıllı Tahta',
            prompt: !selectedGradeRef.current
              ? 'Önce Sınıfını Seç'
              : selectedGradeRef.current === 3
                ? (canStartSmartBoardAdventure()
                    ? 'Büyük Görev: Kervansaray Macerası [E]'
                    : 'Büyük Görev (Önce 4 Masayı Bitir)')
                : 'Akıllı Tahta (Yakında)',
            x: 480,
            y: 160,
            radius: 80,
            action: () => {
              if (!selectedGradeRef.current) {
                setUnreachableMessage(
                  'Kampüsümüz artık 2, 3 ve 4. sınıflara yönelik çalışmalar sunuyor. Devam etmek için sınıfını seçebilirsin.',
                );
                setTimeout(() => setUnreachableMessage(null), 3500);
                return;
              }

              if (selectedGradeRef.current === 3) {
                if (!canStartSmartBoardAdventure()) {
                  setUnreachableMessage(
                    'Büyük Görev için önce sınıftaki dört masadaki (Keşfet, Öğren, Üret, Paylaş) görevleri tamamlamalısın.',
                  );
                  setTimeout(() => setUnreachableMessage(null), 4000);
                  return;
                }

                // Açılış animasyonu ve ardından Sultanhanı Kervansarayı Meydanı'na ışınlanma
                if (sceneTransitionTimer.current !== null) return;
                engineRef.current?.setInputDisabled(true);
                setIsSmartBoardPoweringOn(true);
                sceneTransitionTimer.current = setTimeout(() => {
                  setIsSmartBoardPoweringOn(false);
                  setIsSmartBoardActive(true);
                  setTeleportMessage("Sultanhanı Kervansarayı Meydanı'na Işınlanıyorsun... 🏛️✨");
                  setActiveZone(null);
                  setIsTeleporting(true);
                  sceneTransitionTimer.current = setTimeout(() => {
                    sceneTransitionTimer.current = null;
                    setIsTeleporting(false);
                    lastClassroomPosRef.current = { x: 480, y: 180 };
                    lastSultanhaniPosRef.current = SULTANHANI_SQUARE.spawn;
                    resetEncounterState('ARRIVAL');
                    sultanhaniSquareEntryRef.current = 'smart-board';
                    setCurrentScene('sultanhani_square');
                  }, 650);
                }, 350);
                return;
              }

              // Diğer sınıflar için korunan mevcut davranış
              setIsSmartBoardPoweringOn(true);
              setTimeout(() => {
                setIsSmartBoardPoweringOn(false);
                setIsSmartBoardActive(true);
                setUnreachableMessage(
                  'Öğrenme etkinlikleri sınıftaki dört masaya (Keşfet, Öğren, Üret, Paylaş) taşınmıştır. Akıllı tahta yakında gerçek yaşam uygulama alanı olarak açılacaktır.',
                );
                setTimeout(() => setUnreachableMessage(null), 4000);
              }, 600);
            },
          },
          // 1. KEŞFET MASASI (Sol Ön)
          {
            id: 'table-kesfet',
            name: 'Keşfet Masası',
            prompt: !selectedGradeRef.current
              ? 'Önce Sınıfını Seç'
              : "Keşfet Masası'na Otur",
            x: 265,
            y: 288,
            radius: 75,
            action: () => {
              if (!selectedGradeRef.current) {
                setUnreachableMessage(
                  'Kampüsümüz artık 2, 3 ve 4. sınıflara yönelik çalışmalar sunuyor. Devam etmek için sınıfını seçebilirsin.',
                );
                setTimeout(() => setUnreachableMessage(null), 3500);
                return;
              }
              setActiveTableStage('kesfet');
              setIsTableModalOpen(true);
            },
          },
          // 2. ÖĞREN MASASI (Sağ Ön)
          {
            id: 'table-ogren',
            name: 'Öğren Masası',
            prompt: !selectedGradeRef.current
              ? 'Önce Sınıfını Seç'
              : !completedStagesRef.current.includes('kesfet')
                ? 'Önce Keşfet Masası'
                : "Öğren Masası'na Otur",
            x: 665,
            y: 288,
            radius: 75,
            action: () => {
              if (!selectedGradeRef.current) {
                setUnreachableMessage(
                  'Kampüsümüz artık 2, 3 ve 4. sınıflara yönelik çalışmalar sunuyor. Devam etmek için sınıfını seçebilirsin.',
                );
                setTimeout(() => setUnreachableMessage(null), 3500);
                return;
              }
              if (!completedStagesRef.current.includes('kesfet')) {
                setUnreachableMessage("Önce Keşfet Masası'ndaki etkinliği tamamlamalısın.");
                setTimeout(() => setUnreachableMessage(null), 3000);
                return;
              }
              setActiveTableStage('ogren');
              setIsTableModalOpen(true);
            },
          },
          // 3. ÜRET MASASI (Sol Arka)
          {
            id: 'table-uret',
            name: 'Üret Masası',
            prompt: !selectedGradeRef.current
              ? 'Önce Sınıfını Seç'
              : !completedStagesRef.current.includes('ogren')
                ? 'Önce Öğren Masası'
                : "Üret Masası'na Otur",
            x: 265,
            y: 418,
            radius: 75,
            action: () => {
              if (!selectedGradeRef.current) {
                setUnreachableMessage(
                  'Kampüsümüz artık 2, 3 ve 4. sınıflara yönelik çalışmalar sunuyor. Devam etmek için sınıfını seçebilirsin.',
                );
                setTimeout(() => setUnreachableMessage(null), 3500);
                return;
              }
              if (!completedStagesRef.current.includes('ogren')) {
                setUnreachableMessage("Önce Öğren Masası'ndaki etkinliği tamamlamalısın.");
                setTimeout(() => setUnreachableMessage(null), 3000);
                return;
              }
              setActiveTableStage('uret');
              setIsTableModalOpen(true);
            },
          },
          // 4. PAYLAŞ MASASI (Sağ Arka)
          {
            id: 'table-paylas',
            name: 'Paylaş Masası',
            prompt: !selectedGradeRef.current
              ? 'Önce Sınıfını Seç'
              : !completedStagesRef.current.includes('uret')
                ? 'Önce Üret Masası'
                : "Paylaş Masası'na Otur",
            x: 665,
            y: 418,
            radius: 75,
            action: () => {
              if (!selectedGradeRef.current) {
                setUnreachableMessage(
                  'Kampüsümüz artık 2, 3 ve 4. sınıflara yönelik çalışmalar sunuyor. Devam etmek için sınıfını seçebilirsin.',
                );
                setTimeout(() => setUnreachableMessage(null), 3500);
                return;
              }
              if (!completedStagesRef.current.includes('uret')) {
                setUnreachableMessage("Önce Üret Masası'ndaki etkinliği tamamlamalısın.");
                setTimeout(() => setUnreachableMessage(null), 3000);
                return;
              }
              setActiveTableStage('paylas');
              setIsTableModalOpen(true);
            },
          },
          {
            id: 'exit-door',
            name: 'Avluya Dönüş Kapısı',
            prompt: 'Avluya Dön',
            x: 480,
            y: 590,
            radius: 65,
            action: () => {
              // Avluya dönerken İngilizce binasının kapı önüne çık
              lastCourtyardPosRef.current = { x: 970, y: 350 };
              setCurrentScene('courtyard');
            },
          },
        ];

        return {
          width: 960,
          height: 640,
          playerSpawn: lastClassroomPosRef.current,
          obstacles,
          interactiveZones,
        };
      }

      // 'courtyard' (Kampüs Avlusu)
      const obstacles: SceneObstacle[] = [
        // İngilizce Öğreniyorum Binası
        { id: 'bldg-english', name: CAMPUS_BUILDING_NAMES.english, x: 860, y: 140, width: 220, height: 180 },
        // Hayalden Gerçeğe Binası
        { id: 'bldg-discovery', name: CAMPUS_BUILDING_NAMES.discovery, x: 180, y: 140, width: 220, height: 180 },
        // Hikâyeden Hayata Binası
        { id: 'bldg-library', name: CAMPUS_BUILDING_NAMES.library, x: 580, y: 100, width: 240, height: 170 },
        // Yerden Göklere gözlem evi
        { id: 'pavilion-journey', name: CAMPUS_BUILDING_NAMES.observatory, x: 220, y: 560, width: 190, height: 140 },
        // Keşif Görevleri Panosu
        { id: 'kiosk-missions', name: CAMPUS_BUILDING_NAMES.missions, x: 910, y: 560, width: 190, height: 140 },
        // Merkez Havuz / Fıskiye
        { id: 'fountain', name: 'Merkez Havuz', x: 670, y: 450, width: 60, height: 60 },
      ];

      const interactiveZones: InteractiveZone[] = [
        // 1. İngilizce Öğreniyorum Binası (Sinematik Sınıf ve Akıllı Tahta)
        {
          id: 'enter-english',
          name: CAMPUS_BUILDING_NAMES.english,
          prompt: 'İngilizce Sınıfına Gir',
          x: 970,
          y: 335,
          radius: 75,
          action: () => {
            lastClassroomPosRef.current = { x: 480, y: 520 };
            setActiveZone(null);
            setCurrentScene('classroom');
          },
        },
        // 2. Hayalden Gerçeğe Binası (Açılır Taç Kapı ve Selçuklu VR Sınıfı)
        {
          id: 'enter-discovery',
          name: CAMPUS_BUILDING_NAMES.discovery,
          prompt: 'Hayalden Gerçeğe Sınıfına Gir',
          x: 290,
          y: 335,
          radius: 75,
          action: handleEnterDiscoveryClassroom,
        },
        // 3. Hikâyeden Hayata Binası (Görsel olarak durur - Yakında)
        {
          id: 'enter-library',
          name: CAMPUS_BUILDING_NAMES.library,
          prompt: 'Yakında Açılacak',
          x: 700,
          y: 285,
          radius: 70,
          action: () => {
            setUnreachableMessage(
              'Hikâyeden Hayata binası yakında açılacak. Şu an İngilizce Öğreniyorum sınıfı aktiftir.',
            );
            setTimeout(() => setUnreachableMessage(null), 3500);
          },
        },
        // 4. Yerden Göklere gözlem evi
        {
          id: 'enter-journey',
          name: CAMPUS_BUILDING_NAMES.observatory,
          prompt: 'Yakında Açılacak',
          x: 315,
          y: 545,
          radius: 70,
          action: () => {
            setUnreachableMessage(
              `${CAMPUS_BUILDING_NAMES.observatory} gözlem evi yakında açılacak. Şu an İngilizce Öğreniyorum sınıfı aktiftir.`,
            );
            setTimeout(() => setUnreachableMessage(null), 3500);
          },
        },
        // 5. Keşif Görevleri Panosu (Görsel olarak durur - Yakında)
        {
          id: 'enter-kiosk',
          name: CAMPUS_BUILDING_NAMES.missions,
          prompt: 'Yakında Açılacak',
          x: 1005,
          y: 545,
          radius: 70,
          action: () => {
            setUnreachableMessage(
              'Görev panosu yakında açılacak. Şu an İngilizce Öğreniyorum sınıfı aktiftir.',
            );
            setTimeout(() => setUnreachableMessage(null), 3500);
          },
        },
        // 6. Selçuklu Yıldız Havuzu (Meydan Dinlenme Noktası)
        {
          id: 'fountain-rest',
          name: 'Selçuklu Yıldız Havuzu',
          prompt: 'Havuz Başında Dinlen',
          x: 700,
          y: 480,
          radius: 70,
          action: () => {
            setUnreachableMessage(
              'Selçuklu sekiz köşeli yıldız havuzunun şırıltısıyla kampüsün tüm yolları burada birleşiyor.',
            );
            setTimeout(() => setUnreachableMessage(null), 3500);
          },
        },
        // 7. Kampüs Giriş/Çıkış Kapısı (Dış Kapı Çıkışı)
        {
          id: 'exit-gate',
          name: 'Kampüs Giriş Kapısı',
          prompt: 'Kampüsten Çık',
          x: 700,
          y: 840,
          radius: 85,
          action: () => {
            if (onExitToGateRef.current) {
              onExitToGateRef.current();
            } else if (campusRef.current) {
              campusRef.current.replayWelcomeFlow();
            }
          },
        },
      ];

      return {
        width: 1400,
        height: 900,
        playerSpawn: lastCourtyardPosRef.current,
        obstacles,
        interactiveZones,
      };
    },
    [
      beginWalkToDoorEngine,
      dispatchFlowEvent,
      handleEnterDiscoveryClassroom,
      handleExitDiscoveryClassroom,
      handleExitInnerCourtyard,
      handleExitSultanhani,
      handlePutOnGlasses,
      handleTakeRockSample,
      handleCompleteMoonMission,
      handleLanderEarlyHint,
      resetEncounterState,
    ],
  );

  // Sınıf seçimi, aşama tamamlanma veya Ay görevi örnek alımı durumunda etkileşim bölgelerini dinamik güncelle
  useEffect(() => {
    selectedGradeRef.current = selectedGrade;
    completedStagesRef.current = completedStages;
    if (engineRef.current) {
      if (currentScene === 'classroom') {
        const config = getSceneConfig('classroom');
        engineRef.current.updateInteractiveZones(config.interactiveZones);
      } else if (currentScene === 'discovery_moon') {
        const config = getSceneConfig('discovery_moon');
        engineRef.current.updateInteractiveZones(config.interactiveZones);
      }
    }
  }, [selectedGrade, completedStages, currentScene, isSampleTaken, getSceneConfig]);

  // Motor başlatma ve sahne yükleme (Yalnızca sahne değiştiğinde çalışır, React durum güncellemelerinde motor sıfırlanmaz)
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const config = getSceneConfig(currentScene);
    const lavender = currentScene === 'courtyard' ? createCourtyardLavenderLayer() : undefined;

    // Canvas boyutunu container ve ekran alanına göre tam uyarla
    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      const rawW = rect.width || container.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 800);
      const rawH = rect.height || container.clientHeight || (typeof window !== 'undefined' ? window.innerHeight : 600);
      const newW = Math.max(320, Math.round(rawW));
      const newH = Math.max(240, Math.round(rawH));
      if (engineRef.current) {
        engineRef.current.updateDimensions(newW, newH);
      } else {
        canvas.width = newW;
        canvas.height = newH;
      }
    };

    updateCanvasSize();

    const spawnPos =
      currentScene === 'sultanhani_inner'
        ? SULTANHANI_INNER.playerSpawn
        : currentScene === 'sultanhani_square'
          ? lastSultanhaniPosRef.current
          : currentScene === 'discovery_classroom'
            ? lastDiscoveryClassroomPosRef.current
            : currentScene === 'discovery_moon'
              ? { x: 480, y: 320 }
              : currentScene === 'classroom'
                ? lastClassroomPosRef.current
                : lastCourtyardPosRef.current;

    if (currentScene !== 'courtyard') {
      clearDiscoveryDoorTimers();
    }

    if (currentScene === 'sultanhani_square' && sultanhaniSquareEntryRef.current !== 'courtyard-exit') {
      cancelAllEncounterAsync();
      flowStateRef.current = { stepPhase: 'ARRIVAL', exchangeIndex: 0 };
      encounterPhaseRef.current = 'ARRIVAL';
      lastTouristLineRef.current = null;
      encounterSeedRef.current += 1;
      const controller = new AbortController();
      encounterAbortRef.current = controller;
      dialogExchangesRef.current = buildSultanhaniDialogExchanges(encounterSeedRef.current);
    }

    const engine = new WalkableCanvasEngine(
      canvas,
      config,
      {
        onActiveZoneChange: (zone) => setActiveZone(zone),
        onPositionChange: (pos) => {
          if (currentScene === 'sultanhani_square') {
            lastSultanhaniPosRef.current = pos;
          } else if (currentScene === 'discovery_classroom') {
            lastDiscoveryClassroomPosRef.current = pos;
          } else if (currentScene === 'classroom') {
            lastClassroomPosRef.current = pos;
          } else if (currentScene === 'courtyard') {
            lastCourtyardPosRef.current = pos;
          }
        },
        onUnreachableTarget: () => {
          setUnreachableMessage('Oraya ulaşılamıyor, lütfen açık bir yola tıkla.');
          setTimeout(() => setUnreachableMessage(null), 2500);
        },
        onRenderBackground: (ctx) => {
          if (currentScene === 'sultanhani_inner') {
            renderSultanhaniInnerBackground(ctx);
          } else if (currentScene === 'sultanhani_square') {
            renderSultanhaniBackground(ctx);
          } else if (currentScene === 'discovery_classroom') {
            renderDiscoveryClassroomLayeredBackground(ctx, config.width, config.height);
          } else if (currentScene === 'discovery_moon') {
            renderDiscoveryMoonBackground(ctx, config.width, config.height);
          } else if (currentScene === 'classroom') {
            renderClassroomLayeredBackground(
              ctx,
              config.width,
              config.height,
              smartBoardVisualStateRef.current.active,
              smartBoardVisualStateRef.current.poweringOn,
              selectedGradeRef.current,
              completedStagesRef.current,
            );
          } else {
            renderCourtyardLayeredBackground(ctx, config.width, config.height, lavender);
          }
        },
        onRenderEntities: (ctx, player, _camera, npc) => {
          if (currentScene === 'sultanhani_inner') {
            renderSultanhaniInnerEntities(ctx, player, npc);
          } else if (currentScene === 'sultanhani_square') {
            renderSultanhaniEntities(ctx, player, npc);
          } else if (currentScene === 'discovery_classroom') {
            renderDiscoveryClassroomEntities(ctx, player, config.width, config.height);
          } else if (currentScene === 'discovery_moon') {
            if (!isMoonLandingCompleteRef.current) {
              const elapsed = moonAnimStartTimeRef.current > 0 ? performance.now() - moonAnimStartTimeRef.current : 0;
              const calc = renderDiscoveryMoonEntities(
                ctx,
                elapsed,
                isMoonLandingSkippedRef.current,
                prefersReducedMotionRef.current,
              );
              if (calc.isComplete && !isMoonLandingCompleteRef.current) {
                isMoonLandingCompleteRef.current = true;
                setIsMoonLandingComplete(true);
                setVrState('GO_TO_ROCK');
                if (engineRef.current) {
                  engineRef.current.setPosition(DISCOVERY_VR_CONFIG.astronautLanding.surfacePosition);
                  engineRef.current.stopMoving();
                  engineRef.current.setInputDisabled(false);
                }
              }
            } else {
              renderDiscoveryMoonWalkableScene(
                ctx,
                player,
                vrStateRef.current,
                isCollectingSampleRef.current,
                isSampleTakenRef.current,
              );

              // Ekran dışı yön oku hesaplaması (Kaya veya Araç yönü)
              const mission = DISCOVERY_VR_CONFIG.part3Mission;
              const target = isSampleTakenRef.current ? mission.landerReturn : mission.targetRock;
              const targetName = isSampleTakenRef.current ? 'Araç' : 'Kaya';

              if (containerRef.current) {
                const viewportW = containerRef.current.clientWidth;
                const viewportH = containerRef.current.clientHeight;
                const zoom = engineRef.current ? engineRef.current.zoom : 1;
                const camX = _camera.x;
                const camY = _camera.y;

                const screenTargetX = (target.x - camX) * zoom;
                const screenTargetY = (target.y - camY) * zoom;

                const padX = 65;
                const padY = 85;
                const isOffScreen =
                  screenTargetX < padX ||
                  screenTargetX > viewportW - padX ||
                  screenTargetY < padY ||
                  screenTargetY > viewportH - padY;

                if (isOffScreen && vrStateRef.current !== 'COMPLETE') {
                  const centerX = viewportW / 2;
                  const centerY = viewportH / 2;
                  const angle = Math.atan2(screenTargetY - centerY, screenTargetX - centerX);
                  setOffScreenIndicator({ visible: true, angle, targetName });
                } else {
                  setOffScreenIndicator((prev) => (prev ? null : prev));
                }
              }
            }
          } else if (currentScene === 'classroom') {
            renderClassroomEntities(
              ctx,
              player,
              config.width,
              config.height,
              completedStagesRef.current,
            );
          } else {
            renderCourtyardEntities(
              ctx,
              player,
              config.width,
              config.height,
              discoveryDoorProgressRef.current,
            );
          }
        },
        onNpcProximityChange: ({ inRange, screenPos, studentScreenPos }) => {
          setNpcAnchorPos(screenPos);
          if (studentScreenPos) {
            setStudentAnchorPos(studentScreenPos);
          }

          if (currentScene !== 'sultanhani_square') return;
          if (!inRange) return;

          const activeController = encounterAbortRef.current;
          if (!activeController || activeController.signal.aborted) return;

          const facingState = dispatchFlowEvent({ type: 'ENTER_PROXIMITY' });
          if (!facingState) return;
          engineRef.current?.startEncounterFacing();

          const anchors = engineRef.current?.getEntityScreenPositions();
          if (anchors?.npc) setNpcAnchorPos(anchors.npc);
          if (anchors?.student) setStudentAnchorPos(anchors.student);

          void (async () => {
            const ok = await waitAbortable(SULTANHANI_TIMINGS.facingPauseMs, activeController.signal);
            if (!ok || activeController.signal.aborted) return;
            const choiceState = dispatchFlowEvent({ type: 'FACING_COMPLETE' });
            if (!choiceState) return;
            openExchangeChoice(choiceState.exchangeIndex);
          })();
        },
        onRenderForeground: (ctx) => {
          if (currentScene === 'discovery_classroom') {
            renderDiscoveryClassroomForeground(ctx, config.width, config.height);
          } else if (currentScene === 'classroom') {
            renderClassroomForeground(ctx, config.width, config.height);
          } else if (currentScene === 'courtyard') {
            renderCourtyardForeground(ctx, config.width, config.height);
          }
        },
        onCustomRender: (ctx) => {
          if (currentScene === 'sultanhani_inner') {
            renderSultanhaniInnerBackground(ctx);
          } else if (currentScene === 'sultanhani_square') {
            renderSultanhaniBackground(ctx);
          } else if (currentScene === 'discovery_classroom') {
            renderDiscoveryClassroomBackground(ctx, config.width, config.height);
          } else if (currentScene === 'discovery_moon') {
            renderDiscoveryMoonBackground(ctx, config.width, config.height);
          } else if (currentScene === 'classroom') {
            renderClassroomBackground(
              ctx,
              config.width,
              config.height,
              smartBoardVisualStateRef.current.active,
              smartBoardVisualStateRef.current.poweringOn,
              selectedGradeRef.current,
              completedStagesRef.current,
            );
          } else {
            renderCourtyardBackground(
              ctx,
              config.width,
              config.height,
              discoveryDoorProgressRef.current,
            );
          }
        },
      },
      spawnPos,
    );

    engine.player.characterId = characterIdRef.current;
    engine.start();
    if (
      currentScene === 'discovery_classroom' ||
      (currentScene === 'sultanhani_square' && sultanhaniSquareEntryRef.current !== 'courtyard-exit') ||
      currentScene === 'sultanhani_inner'
    ) {
      engine.player.direction = 'up';
    }
    engineRef.current = engine;
    if (typeof window !== 'undefined') {
      (window as unknown as { __WALKABLE_ENGINE__?: WalkableCanvasEngine }).__WALKABLE_ENGINE__ = engine;
    }

    if (currentScene === 'sultanhani_square') {
      const controllerForScene = encounterAbortRef.current;
      queueMicrotask(() => {
        if (controllerForScene && !controllerForScene.signal.aborted) {
          const ready = dispatchFlowEvent({ type: 'SCENE_READY' });
          if (ready && sultanhaniSquareEntryRef.current === 'smart-board') engine.startEncounterApproach();
        }
      });
    }

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0 && engineRef.current) {
            engineRef.current.updateDimensions(Math.round(width), Math.round(height));
          }
        }
      });
      ro.observe(container);
    }

    window.addEventListener('resize', updateCanvasSize);
    document.addEventListener('fullscreenchange', updateCanvasSize);
    document.addEventListener('webkitfullscreenchange', updateCanvasSize);

    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', updateCanvasSize);
      document.removeEventListener('fullscreenchange', updateCanvasSize);
      document.removeEventListener('webkitfullscreenchange', updateCanvasSize);
      cancelAllEncounterAsync();
      setActiveBubble(null);
      setChoicePrompt(null);
      setNpcAnchorPos(null);
      setStudentAnchorPos(null);
      if (typeof window !== 'undefined') {
        delete (window as unknown as { __WALKABLE_ENGINE__?: WalkableCanvasEngine }).__WALKABLE_ENGINE__;
      }
      engine.destroy();
      lavender?.dispose();
      engineRef.current = null;
    };
  }, [
    cancelAllEncounterAsync,
    clearDiscoveryDoorTimers,
    currentScene,
    dispatchFlowEvent,
    getSceneConfig,
    openExchangeChoice,
    resetEncounterState,
  ]);

  // Sınıf seviyesi veya tamamlanan aşamalar değiştiğinde sınıf etkileşim bölgelerini güncelle
  useEffect(() => {
    if (engineRef.current && currentScene === 'classroom') {
      const config = getSceneConfig('classroom');
      engineRef.current.updateInteractiveZones(config.interactiveZones);
    }
  }, [currentScene, getSceneConfig, selectedGrade, completedStages]);

  // Modallar açıldığında motoru duraklat
  useEffect(() => {
    if (!engineRef.current) return;
    if (
      isSmartBoardModalOpen ||
      isGradeModalOpen ||
      isTableModalOpen ||
      isCareerModalOpen ||
      isMissionCompletedModalOpen
    ) {
      engineRef.current.pause();
    } else {
      engineRef.current.resume();
    }
  }, [
    isSmartBoardModalOpen,
    isGradeModalOpen,
    isTableModalOpen,
    isCareerModalOpen,
    isMissionCompletedModalOpen,
  ]);

  const handleVirtualDirection = (vx: number, vy: number) => {
    if (engineRef.current) {
      engineRef.current.setVirtualDirection(vx, vy);
    }
  };

  const handleTriggerInteraction = () => {
    if (engineRef.current) {
      engineRef.current.triggerActiveInteraction();
    }
  };

  const isEncounterLocked =
    currentScene === 'sultanhani_square' &&
    encounterPhase !== 'ARRIVAL' &&
    encounterPhase !== 'APPROACH' &&
    encounterPhase !== 'DONE';

  const activeBubbleAnchor =
    activeBubble?.speaker === 'student' ? studentAnchorPos : npcAnchorPos;

  return (
    <div
      ref={containerRef}
      data-scene={currentScene}
      data-encounter-phase={encounterPhase}
      data-vr-state={vrState}
      className="relative w-full h-dvh bg-[var(--campus-canvas)] overflow-hidden select-none"
    >
      <canvas
        ref={canvasRef}
        data-testid="walkable-canvas"
        className="w-full h-full block cursor-crosshair touch-none"
      />

      {/* Ekran Üstü Kontroller ve İpuçları */}
      <WalkableControlsOverlay
        activeZone={activeZone}
        onTriggerInteraction={handleTriggerInteraction}
        onVirtualDirection={handleVirtualDirection}
        onBackToMap={handleBackToMap}
        onExitClassroom={
          currentScene === 'discovery_moon'
            ? handleRemoveGlasses
            : currentScene === 'classroom'
              ? () => {
                  lastCourtyardPosRef.current = { x: 970, y: 350 };
                  setCurrentScene('courtyard');
                }
              : currentScene === 'discovery_classroom'
                ? handleExitDiscoveryClassroom
                : currentScene === 'sultanhani_square' || currentScene === 'sultanhani_inner'
                  ? handleExitSultanhani
                  : undefined
        }
        unreachableMessage={unreachableMessage}
        currentScene={currentScene}
        isEncounterLocked={isEncounterLocked}
      />

      {/* Sultanhanı Dış Meydan Turist NPC Konuşma Balonu ve Seçenek Paneli */}
      {currentScene === 'sultanhani_square' && (
        <NpcSpeechBubble
          activeBubble={activeBubble}
          anchorPos={activeBubbleAnchor}
          choicePrompt={choicePrompt}
          isSpeaking={isSpeakingLine}
          onSelectOption={handleSelectOption}
          onPreviewOption={handlePreviewOption}
          onConfirmIntroduction={flowState.stepPhase === 'STUDENT_INTRODUCTION' ? handleConfirmIntroduction : undefined}
        />
      )}

      {/* Işınlanma Geçiş Efekti (Portal Teleport Animation) */}
      {isTeleporting && (
        <div
          data-testid="teleport-overlay"
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[var(--seljuk-navy)]/80 backdrop-blur-md animate-fade-in transition-all duration-300 pointer-events-none"
        >
          <div className="relative flex flex-col items-center gap-4 text-center px-6 py-8 rounded-2xl bg-[var(--campus-surface)]/95 border border-[var(--campus-border)] shadow-2xl max-w-sm mx-4">
            <div className="w-16 h-16 rounded-full bg-[var(--seljuk-teal)]/15 border-2 border-[var(--seljuk-teal)] flex items-center justify-center animate-spin motion-reduce:animate-none">
              <Sparkles className="w-8 h-8 text-[var(--seljuk-teal)]" />
            </div>
            <p className="text-sm font-bold text-[var(--seljuk-navy)]">
              {teleportMessage}
            </p>
          </div>
        </div>
      )}

      {/* Akıllı Tahta Modal Penceresi */}
      <SmartBoardModal
        isOpen={isSmartBoardModalOpen}
        onClose={() => setIsSmartBoardModalOpen(false)}
        missionId="kapilarin-anlattigi-hikaye"
      />

      {/* Sınıf Seçim Panosu Modal Penceresi */}
      <GradeBoardModal
        isOpen={isGradeModalOpen}
        onClose={() => setIsGradeModalOpen(false)}
        selectedGrade={selectedGrade}
        onSelectGrade={(grade) => {
          campus?.setGrade(grade);
        }}
      />

      {/* Dört Öğrenme Masası İstasyon Modalı */}
      {activeTableStage && (
        <TableStationModal
          isOpen={isTableModalOpen}
          stage={activeTableStage}
          enableGrade3StageTwo
          enableGrade3StageThree
          enableGrade3StageFour
          missionId="kapilarin-anlattigi-hikaye"
          onClose={() => setIsTableModalOpen(false)}
          onAdvanceToStage={(nextStage) => {
            setActiveTableStage(nextStage);
          }}
        />
      )}

      {/* Meslek Seçim Modalı */}
      <DiscoveryCareerModal
        isOpen={isCareerModalOpen}
        onSelectCareer={handleSelectCareer}
        onClose={() => {
          setIsCareerModalOpen(false);
          setVrState('CLASS_IDLE');
        }}
      />

      {/* İniş Animasyonunu Atla ("Geç") Düğmesi */}
      {currentScene === 'discovery_moon' && !isMoonLandingComplete && (
        <div className="absolute top-16 right-4 sm:top-20 sm:right-6 z-30 pointer-events-auto animate-fade-in">
          <button
            type="button"
            onClick={handleSkipLandingAnimation}
            className="min-h-[44px] min-w-[44px] px-4 py-2 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-amber-200 hover:text-amber-100 border-2 border-amber-500/50 hover:border-amber-400 shadow-xl text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer backdrop-blur-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
            aria-label="İniş animasyonunu atla"
          >
            <span>Geç</span>
            <span aria-hidden="true">⏭</span>
          </button>
        </div>
      )}

      {/* Parça 3 — Ay Görevi Üst Yönerge Satırı */}
      {currentScene === 'discovery_moon' && isMoonLandingComplete && (
        <aside
          role="region"
          aria-label="Ay görevi yönergesi"
          className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none max-w-[90vw] sm:max-w-md animate-fade-in"
        >
          <div className="flex items-center gap-2.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-stone-950/90 border border-amber-500/60 shadow-2xl text-center backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
            <p className="text-xs sm:text-sm font-semibold text-amber-100 tracking-wide">
              {vrState === 'GO_TO_ROCK' && DISCOVERY_VR_CONFIG.part3Mission.instructions.goToRock}
              {vrState === 'SAMPLE_TAKEN' && DISCOVERY_VR_CONFIG.part3Mission.instructions.sampleTaken}
              {vrState === 'COMPLETE' && DISCOVERY_VR_CONFIG.part3Mission.instructions.complete}
            </p>
          </div>
        </aside>
      )}

      {/* Parça 3 — Ekran Dışı Hedefe Yönlendiren Ok Göstergesi */}
      {currentScene === 'discovery_moon' && isMoonLandingComplete && offScreenIndicator && (
        <div
          role="status"
          aria-label={`${offScreenIndicator.targetName} yönü`}
          className="fixed pointer-events-none z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900/95 border-2 border-amber-400 shadow-2xl text-amber-200 text-xs font-bold backdrop-blur-xs animate-pulse transition-all duration-150"
          style={{
            left: `calc(50% + ${Math.cos(offScreenIndicator.angle) * 42}vw)`,
            top: `calc(50% + ${Math.sin(offScreenIndicator.angle) * 38}vh)`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <span
            className="inline-block text-base leading-none text-cyan-300 transition-transform duration-150"
            style={{ transform: `rotate(${offScreenIndicator.angle}rad)` }}
          >
            ➔
          </span>
          <span>{offScreenIndicator.targetName}</span>
        </div>
      )}

      {/* Parça 3 — Örnek Almadan Araca Yaklaşınca Kısa İpucu */}
      {landerEarlyHint && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-28 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-bounce"
        >
          <div className="px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs sm:text-sm shadow-2xl border-2 border-amber-300">
            {landerEarlyHint}
          </div>
        </div>
      )}

      {/* Parça 3 — Ay Görevi Tamamlandı Kutlama Modalı */}
      {isMissionCompletedModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="mission-complete-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
        >
          <div className="relative w-full max-w-md bg-stone-900 border-2 border-amber-500 rounded-3xl p-6 sm:p-8 shadow-2xl text-stone-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-3xl mb-4 animate-bounce">
              🌕
            </div>
            <h2 id="mission-complete-title" className="text-xl sm:text-2xl font-bold text-amber-200 mb-2">
              Tebrikler! Ay Görevi Tamamlandı
            </h2>
            <p className="text-sm text-stone-300 leading-relaxed mb-6">
              {DISCOVERY_VR_CONFIG.part3Mission.instructions.complete}
            </p>
            <button
              type="button"
              onClick={handleRemoveGlasses}
              className="min-h-[48px] px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm sm:text-base border-2 border-amber-300 shadow-xl inline-flex items-center gap-2 cursor-pointer transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              <DoorOpen className="w-5 h-5 text-stone-950" />
              <span>Gözlüğü Çıkar</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] rounded bg-amber-600/30 border border-amber-700/50 text-stone-900 font-mono">
                Esc
              </kbd>
            </button>
          </div>
        </div>
      )}

      {/* Ay Sahnesinde Ekrandaki "Gözlüğü Çıkar" Düğmesi */}
      {currentScene === 'discovery_moon' && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <button
            type="button"
            onClick={handleRemoveGlasses}
            className="min-h-[48px] px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold border-2 border-amber-300 shadow-2xl text-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            <DoorOpen className="w-5 h-5 text-stone-950" aria-hidden="true" />
            <span>Gözlüğü Çıkar</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] rounded bg-amber-600/30 border border-amber-700/50 text-stone-900 font-mono">
              Esc
            </kbd>
          </button>
        </div>
      )}
    </div>
  );
}
