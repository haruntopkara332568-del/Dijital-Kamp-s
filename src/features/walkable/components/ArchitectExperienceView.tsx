import { useEffect, useRef, useState, type PointerEvent } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  DoorOpen,
  RotateCcw,
} from 'lucide-react';
import {
  ARCHITECT_ASSETS,
  ARCHITECT_INTERIOR,
  ARCHITECT_STEP_INSTRUCTIONS,
  ARCHITECT_UI_LABELS,
  DOOR_OPTIONS,
  ORNAMENT_OPTIONS,
  ROOF_OPTIONS,
  WINDOW_OPTIONS,
  isBuildStep,
  isKoskDebugEnabled,
  type ArchitectBuildStep,
  type BuildOptionSpec,
} from '@/src/data/architectExperienceConfig';
import type { StudentCharacterId } from '@/src/data/studentCharacters';
import type { GradeLevel } from '@/src/types/campus';
import type { CharacterDirection, PlayerCharacter, Position } from '../types';
import {
  clampToWalkablePolygon,
  preloadArchitectAssets,
  renderArchitectExteriorScene,
  renderArchitectInteriorScene,
  renderOptionCardCrop,
  type InteriorOffscreenIndicator,
  type InteriorRenderMetrics,
} from '../engine/architectPavilionRenderer';
import { useArchitectExperience } from '../useArchitectExperience';

export interface ArchitectExperienceViewProps {
  characterId?: StudentCharacterId;
  grade: GradeLevel;
  speechEnabled: boolean;
  suspended: boolean;
  onExit: () => void;
}

function getOptionsForStep(step: ArchitectBuildStep): readonly BuildOptionSpec[] {
  switch (step) {
    case 'STEP_DOOR':
      return DOOR_OPTIONS;
    case 'STEP_WINDOW':
      return WINDOW_OPTIONS;
    case 'STEP_ROOF':
      return ROOF_OPTIONS;
    case 'STEP_ORNAMENT':
      return ORNAMENT_OPTIONS;
  }
}

function OptionPreviewThumb({
  step,
  optionId,
  assetVersion,
}: {
  step: ArchitectBuildStep;
  optionId: string;
  assetVersion: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    renderOptionCardCrop(canvas, step, optionId);
  }, [assetVersion, optionId, step]);

  return (
    <canvas
      ref={ref}
      width={156}
      height={84}
      aria-hidden="true"
      className="h-[58px] w-full rounded-lg border border-[#c9b086] object-cover sm:h-[72px]"
    />
  );
}

const DIRECTION_KEYS: Partial<Record<string, { vx: number; vy: number }>> = {
  arrowup: { vx: 0, vy: -1 },
  w: { vx: 0, vy: -1 },
  arrowdown: { vx: 0, vy: 1 },
  s: { vx: 0, vy: 1 },
  arrowleft: { vx: -1, vy: 0 },
  a: { vx: -1, vy: 0 },
  arrowright: { vx: 1, vy: 0 },
  d: { vx: 1, vy: 0 },
};

export function ArchitectExperienceView({
  characterId,
  grade,
  speechEnabled,
  suspended,
  onExit,
}: ArchitectExperienceViewProps) {
  const experience = useArchitectExperience(!suspended, speechEnabled);
  const {
    flowState,
    previewValue,
    speechBubbleText,
    isControlsLocked,
    restartBuild,
    cleanup,
    selectPreviewOption,
    confirmPlacement,
    reachInteriorMarker,
    readSnapshot,
  } = experience;

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const offscreenArrowRef = useRef<HTMLDivElement>(null);
  const debugSlotsRef = useRef<boolean>(isKoskDebugEnabled());

  // İç mekân gerçek karakter hareketi ve kamera durumu (tek rAF döngüsünde güncellenir)
  const interiorStudentRef = useRef<PlayerCharacter>({
    characterId,
    x: ARCHITECT_INTERIOR.entrySpawn.x,
    y: ARCHITECT_INTERIOR.entrySpawn.y,
    width: 53,
    height: 67,
    direction: 'right',
    state: 'idle',
    speed: ARCHITECT_INTERIOR.studentSpeedPx,
    walkFrame: 0,
    grade,
  });
  const interiorCameraRef = useRef<Position>({
    x: ARCHITECT_INTERIOR.entrySpawn.x,
    y: ARCHITECT_INTERIOR.entrySpawn.y,
  });
  const interiorMetricsRef = useRef<InteriorRenderMetrics>({
    worldOffsetX: 0,
    worldOffsetY: 0,
    scale: 1,
    offscreenMarker: null,
  });
  const heldKeysRef = useRef<Set<string>>(new Set());
  const virtualDirRef = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });
  const clickTargetRef = useRef<Position | null>(null);
  const markerInsideRangeRef = useRef(false);
  const suspendedRef = useRef(suspended);
  const characterIdRef = useRef(characterId);
  const gradeRef = useRef(grade);

  useEffect(() => {
    suspendedRef.current = suspended;
    if (suspended) {
      heldKeysRef.current.clear();
      virtualDirRef.current = { vx: 0, vy: 0 };
      clickTargetRef.current = null;
    }
  }, [suspended]);

  useEffect(() => {
    characterIdRef.current = characterId;
    gradeRef.current = grade;
    interiorStudentRef.current.characterId = characterId;
    interiorStudentRef.current.grade = grade;
  }, [characterId, grade]);

  // Görseller yüklendikçe seçenek kartlarının kırpmasını tazele
  const [assetVersion, setAssetVersion] = useState(0);
  useEffect(() => {
    preloadArchitectAssets();
    const timer1 = window.setTimeout(() => setAssetVersion((v) => v + 1), 250);
    const timer2 = window.setTimeout(() => setAssetVersion((v) => v + 1), 900);
    return () => {
      window.clearTimeout(timer1);
      window.clearTimeout(timer2);
    };
  }, []);

  // İç mekâna geçişte basılı kalan tuşları, dokunmatik yönü, hedefi ve doğuş noktasını sıfırla
  useEffect(() => {
    if (flowState === 'INTERIOR_WALK') {
      heldKeysRef.current.clear();
      virtualDirRef.current = { vx: 0, vy: 0 };
      clickTargetRef.current = null;
      markerInsideRangeRef.current = false;
      interiorStudentRef.current = {
        characterId: characterIdRef.current,
        x: ARCHITECT_INTERIOR.entrySpawn.x,
        y: ARCHITECT_INTERIOR.entrySpawn.y,
        width: 53,
        height: 67,
        direction: 'right',
        state: 'idle',
        speed: ARCHITECT_INTERIOR.studentSpeedPx,
        walkFrame: 0,
        grade: gradeRef.current,
      };
      interiorCameraRef.current = {
        x: ARCHITECT_INTERIOR.entrySpawn.x,
        y: ARCHITECT_INTERIOR.entrySpawn.y,
      };
    } else if (flowState === 'CLOSING' || flowState === 'DONE' || flowState === 'STEP_DOOR') {
      heldKeysRef.current.clear();
      virtualDirRef.current = { vx: 0, vy: 0 };
      clickTargetRef.current = null;
      interiorStudentRef.current.state = 'idle';
    }
  }, [flowState]);

  // Klavye dinleyicisi: Escape her durumda çıkış, yön/WASD tuşları yalnızca INTERIOR_WALK sırasında
  useEffect(() => {
    const clearHeld = () => {
      heldKeysRef.current.clear();
      virtualDirRef.current = { vx: 0, vy: 0 };
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        clearHeld();
        cleanup();
        onExit();
        return;
      }
      if (flowState !== 'INTERIOR_WALK' || suspendedRef.current) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const key = event.key.toLowerCase();
      if (DIRECTION_KEYS[key]) {
        event.preventDefault();
        clickTargetRef.current = null;
        heldKeysRef.current.add(key);
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      heldKeysRef.current.delete(event.key.toLowerCase());
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearHeld);
    document.addEventListener('visibilitychange', clearHeld);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearHeld);
      document.removeEventListener('visibilitychange', clearHeld);
      clearHeld();
    };
  }, [cleanup, flowState, onExit]);

  // Tek animasyon döngüsü (requestAnimationFrame): hem dış mekân hem iç mekân yürüyüşü
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion =
      typeof window !== 'undefined' &&
      (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);

    let cssWidth = Math.max(320, container.clientWidth);
    let cssHeight = Math.max(320, container.clientHeight);
    let dpr = Math.min(2, window.devicePixelRatio || 1);

    const syncCanvasSize = () => {
      cssWidth = Math.max(320, container.clientWidth);
      cssHeight = Math.max(320, container.clientHeight);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const targetW = Math.round(cssWidth * dpr);
      const targetH = Math.round(cssHeight * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
    };

    syncCanvasSize();
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncCanvasSize) : null;
    resizeObserver?.observe(container);
    window.addEventListener('resize', syncCanvasSize);
    window.addEventListener('orientationchange', syncCanvasSize);

    let rafId = 0;
    let lastTime = 0;

    const renderFrame = (now: number) => {
      const dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 0.016;
      lastTime = now;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const snapshot = readSnapshot(now);
      const isInteriorScene =
        snapshot.flowState === 'INTERIOR_WALK' ||
        snapshot.flowState === 'CLOSING' ||
        snapshot.flowState === 'DONE';

      if (!isInteriorScene) {
        const anchors = renderArchitectExteriorScene(
          ctx,
          cssWidth,
          cssHeight,
          snapshot,
          debugSlotsRef.current,
          {
            characterId: characterIdRef.current,
            grade: gradeRef.current,
            now,
          },
        );

        const bubbleEl = bubbleRef.current;
        if (bubbleEl) {
          bubbleEl.style.left = `${Math.round(anchors.architectBubbleX)}px`;
          bubbleEl.style.top = `${Math.round(anchors.architectBubbleY)}px`;
        }
        if (offscreenArrowRef.current) {
          offscreenArrowRef.current.style.opacity = '0';
        }
      } else {
        const student = interiorStudentRef.current;

        if (snapshot.flowState === 'INTERIOR_WALK' && !suspendedRef.current) {
          // 1. Klavye + dokunmatik D-pad vektörü
          let vx = virtualDirRef.current.vx;
          let vy = virtualDirRef.current.vy;
          for (const key of heldKeysRef.current) {
            const vec = DIRECTION_KEYS[key];
            if (vec) {
              vx += vec.vx;
              vy += vec.vy;
            }
          }

          if (Math.hypot(vx, vy) > 0.01) {
            clickTargetRef.current = null;
          } else if (clickTargetRef.current) {
            const dx = clickTargetRef.current.x - student.x;
            const dy = clickTargetRef.current.y - student.y;
            const dist = Math.hypot(dx, dy);
            if (dist <= 8) {
              clickTargetRef.current = null;
            } else {
              vx = dx / dist;
              vy = dy / dist;
            }
          }

          const len = Math.hypot(vx, vy);
          if (len > 0.01) {
            const nx = vx / len;
            const ny = vy / len;
            const stepDist = student.speed * dt;
            const nextPos = clampToWalkablePolygon(
              student.x + nx * stepDist,
              student.y + ny * stepDist,
            );
            const movedDist = Math.hypot(nextPos.x - student.x, nextPos.y - student.y);
            student.x = nextPos.x;
            student.y = nextPos.y;

            let dir: CharacterDirection = student.direction;
            if (Math.abs(nx) >= Math.abs(ny)) dir = nx >= 0 ? 'right' : 'left';
            else dir = ny >= 0 ? 'down' : 'up';
            student.direction = dir;
            student.state = movedDist > 0.25 ? 'walk' : 'idle';
            if (student.state === 'walk') {
              student.walkFrame = (student.walkFrame + dt * 6.5) % 4;
            } else {
              clickTargetRef.current = null;
            }
          } else {
            student.state = 'idle';
            student.walkFrame = 0;
          }

          // Hedef yıldıza yaklaşma histerezisi (giriş 1.5, çıkış 2.0 öğrenci boyu)
          const marker = ARCHITECT_INTERIOR.targetMarker;
          const distToMarker = Math.hypot(student.x - marker.x, student.y - marker.y);
          const enterR = ARCHITECT_INTERIOR.studentHeightPx * ARCHITECT_INTERIOR.markerEnterHeightRatio;
          const exitR = ARCHITECT_INTERIOR.studentHeightPx * ARCHITECT_INTERIOR.markerExitHeightRatio;

          if (!markerInsideRangeRef.current && distToMarker <= enterR) {
            markerInsideRangeRef.current = true;
            student.state = 'idle';
            clickTargetRef.current = null;
            heldKeysRef.current.clear();
            virtualDirRef.current = { vx: 0, vy: 0 };
            reachInteriorMarker();
          } else if (markerInsideRangeRef.current && distToMarker > exitR) {
            markerInsideRangeRef.current = false;
          }
        } else {
          student.state = 'idle';
        }

        // Kamera yumuşak takibi
        const cam = interiorCameraRef.current;
        const lerpRate = reducedMotion ? 1 : ARCHITECT_INTERIOR.cameraLerp;
        cam.x += (student.x - cam.x) * lerpRate;
        cam.y += (student.y - cam.y) * lerpRate;

        const metrics = renderArchitectInteriorScene(
          ctx,
          cssWidth,
          cssHeight,
          snapshot,
          student,
          cam,
          now,
          debugSlotsRef.current,
          reducedMotion,
        );
        interiorMetricsRef.current = metrics;

        // Ekran dışı hedef yön oku DOM güncellemesi (sıfır React yeniden çizimi)
        const arrowEl = offscreenArrowRef.current;
        if (arrowEl) {
          const indicator: InteriorOffscreenIndicator | null = metrics.offscreenMarker;
          if (indicator?.visible) {
            arrowEl.style.opacity = '1';
            arrowEl.style.left = `${Math.round(indicator.edgeX)}px`;
            arrowEl.style.top = `${Math.round(indicator.edgeY)}px`;
            const deg = Math.round((indicator.angleRad * 180) / Math.PI);
            arrowEl.style.transform = `translate(-50%, -50%) rotate(${deg}deg)`;
          } else {
            arrowEl.style.opacity = '0';
          }
        }
      }

      rafId = window.requestAnimationFrame(renderFrame);
    };

    rafId = window.requestAnimationFrame(renderFrame);

    return () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', syncCanvasSize);
      window.removeEventListener('orientationchange', syncCanvasSize);
    };
  }, [reachInteriorMarker, readSnapshot]);

  // İç mekânda zemine tıklayarak / dokunarak yürüme
  const handleCanvasPointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    if (flowState !== 'INTERIOR_WALK' || suspended) return;
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    const { worldOffsetX, worldOffsetY, scale } = interiorMetricsRef.current;
    const worldX = (screenX - worldOffsetX) / Math.max(0.01, scale);
    const worldY = (screenY - worldOffsetY) / Math.max(0.01, scale);
    clickTargetRef.current = clampToWalkablePolygon(worldX, worldY);
  };

  const handleDpadDown = (event: PointerEvent<HTMLButtonElement>, vx: number, vy: number) => {
    event.preventDefault();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Tarayıcı emniyeti
    }
    clickTargetRef.current = null;
    virtualDirRef.current = { vx, vy };
  };

  const handleDpadUp = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Emniyet
    }
    virtualDirRef.current = { vx: 0, vy: 0 };
  };

  const handleReturnToClass = () => {
    heldKeysRef.current.clear();
    virtualDirRef.current = { vx: 0, vy: 0 };
    clickTargetRef.current = null;
    cleanup();
    onExit();
  };

  const activeBuildStep: ArchitectBuildStep | null = isBuildStep(flowState) ? flowState : null;
  const stepOptions = activeBuildStep ? getOptionsForStep(activeBuildStep) : [];
  const isInteriorWalking = flowState === 'INTERIOR_WALK';
  const isClosingOrDone = flowState === 'CLOSING' || flowState === 'DONE';

  const topInstruction = activeBuildStep
    ? ARCHITECT_STEP_INSTRUCTIONS[activeBuildStep]
    : flowState === 'BUILD_DONE'
      ? ARCHITECT_UI_LABELS.completedStatus
      : isInteriorWalking
        ? ARCHITECT_UI_LABELS.interiorWalkInstruction
        : null;

  return (
    <div
      ref={containerRef}
      data-testid="architect-experience-view"
      data-architect-state={flowState}
      className="absolute inset-0 z-10 overflow-hidden bg-[#a9d7f0]"
    >
      {/* Ana Tuval (Dış Mekân Köşk + Kapıdan Giriş + 2.5D İç Mekân) */}
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={
          isInteriorWalking || isClosingOrDone
            ? 'Selçuklu köşkünün iç mekânı'
            : 'Selçuklu esintili sekizgen köşk tasarım sahnesi'
        }
        onPointerDown={handleCanvasPointerDown}
        className={`block h-full w-full touch-none ${isInteriorWalking ? 'cursor-pointer' : ''}`}
      />

      {/* Tek Satır Üst Yönerge */}
      {topInstruction && (
        <div
          role="status"
          aria-live="polite"
          data-testid="architect-instruction"
          className="pointer-events-none absolute left-1/2 top-[4.4rem] z-30 w-max max-w-[calc(100%-24px)] -translate-x-1/2 rounded-xl border border-[#c7a169] bg-[#fffaf0]/95 px-4 py-2 text-center text-sm font-extrabold text-[#362314] shadow-md sm:top-[4.75rem] sm:text-base"
        >
          {topInstruction}
        </div>
      )}

      {/* Ekran Dışı Hedef Yön Oku (Yalnızca INTERIOR_WALK sırasında hedef görünmüyorsa) */}
      <div
        ref={offscreenArrowRef}
        aria-hidden="true"
        data-testid="interior-offscreen-arrow"
        className="pointer-events-none absolute z-30 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#fff3cb] bg-[#d99626]/95 text-white shadow-lg transition-opacity duration-150"
        style={{ opacity: 0, left: '50%', top: '50%' }}
      >
        <ArrowRight className="h-5 w-5" />
      </div>

      {/* Dış Mekân Giriş Konuşma Balonu (Kadın Mimar karakterinin yanında) */}
      {flowState === 'MIMAR_INTRO' && speechBubbleText && (
        <div
          ref={bubbleRef}
          role="status"
          aria-live="polite"
          data-testid="architect-speech-bubble"
          className="pointer-events-none absolute z-30 w-[min(276px,calc(100%-24px))] -translate-x-1/2 -translate-y-full rounded-2xl border-2 border-[#b98a4a] bg-[#fffaf0]/98 px-3.5 py-2.5 text-[#332011] shadow-xl"
          style={{ left: '28%', top: '42%' }}
        >
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#0f766e]">
            {ARCHITECT_UI_LABELS.architectSpeaker}
          </p>
          <p className="mt-0.5 text-sm font-bold leading-snug">{speechBubbleText}</p>
        </div>
      )}

      {/* Kapanış Konuşma Balonu (Mimar sahnede görünmeden, küçük yuvarlak portre kırpmasıyla) */}
      {isClosingOrDone && speechBubbleText && (
        <div
          role="status"
          aria-live="polite"
          data-testid="architect-closing-bubble"
          className="pointer-events-none absolute left-1/2 top-[4.5rem] z-30 flex w-[min(420px,calc(100%-24px))] -translate-x-1/2 items-center gap-3 rounded-2xl border-2 border-[#b98a4a] bg-[#fffaf0]/98 px-3.5 py-2.5 text-[#332011] shadow-xl sm:top-[5rem]"
        >
          <img
            src={ARCHITECT_ASSETS.architect}
            alt="Mimar"
            className="h-12 w-12 shrink-0 rounded-full border-2 border-[#c69c5b] bg-[#d9eef8] object-cover object-top"
          />
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#0f766e]">
              {ARCHITECT_UI_LABELS.architectSpeaker}
            </p>
            <p className="mt-0.5 text-sm font-bold leading-snug">{speechBubbleText}</p>
          </div>
        </div>
      )}

      {/* Mobil Dokunmatik D-Pad (Yalnızca INTERIOR_WALK sırasında dar/dokunmatik ekranda) */}
      {isInteriorWalking && !suspended && (
        <div
          role="group"
          aria-label="İç mekân yön kontrolleri"
          data-testid="interior-dpad"
          className="pointer-events-auto absolute bottom-20 left-3 z-30 grid w-36 grid-cols-3 gap-1.5 rounded-2xl border border-[#c69c5b] bg-[#fffaf0]/90 p-2 shadow-lg sm:hidden touch-none"
        >
          <div />
          <button
            type="button"
            aria-label="Yukarı"
            onPointerDown={(e) => handleDpadDown(e, 0, -1)}
            onPointerUp={handleDpadUp}
            onPointerCancel={handleDpadUp}
            onLostPointerCapture={handleDpadUp}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[#c9b086] bg-white text-[#332011] active:bg-[#0f766e] active:text-white touch-none"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
          <div />
          <button
            type="button"
            aria-label="Sola"
            onPointerDown={(e) => handleDpadDown(e, -1, 0)}
            onPointerUp={handleDpadUp}
            onPointerCancel={handleDpadUp}
            onLostPointerCapture={handleDpadUp}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[#c9b086] bg-white text-[#332011] active:bg-[#0f766e] active:text-white touch-none"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div />
          <button
            type="button"
            aria-label="Sağa"
            onPointerDown={(e) => handleDpadDown(e, 1, 0)}
            onPointerUp={handleDpadUp}
            onPointerCancel={handleDpadUp}
            onLostPointerCapture={handleDpadUp}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[#c9b086] bg-white text-[#332011] active:bg-[#0f766e] active:text-white touch-none"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
          <div />
          <button
            type="button"
            aria-label="Aşağı"
            onPointerDown={(e) => handleDpadDown(e, 0, 1)}
            onPointerUp={handleDpadUp}
            onPointerCancel={handleDpadUp}
            onLostPointerCapture={handleDpadUp}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[#c9b086] bg-white text-[#332011] active:bg-[#0f766e] active:text-white touch-none"
          >
            <ArrowDown className="h-5 w-5" />
          </button>
          <div />
        </div>
      )}

      {/* Alt Kontrol Paneli — Yalnızca izin verilen kontroller: Seçenek Kartları, Yerleştir, Yeniden Başla, Sınıfa Dön */}
      <section
        aria-label="Köşk kontrolleri"
        className={`pointer-events-auto absolute inset-x-2 bottom-2 z-30 mx-auto rounded-2xl border-2 border-[#c69c5b] bg-[#fffaf0]/96 p-2.5 text-[#332011] shadow-2xl backdrop-blur-xs sm:bottom-4 sm:p-3.5 ${
          activeBuildStep ? 'max-w-[640px]' : 'w-max max-w-[calc(100%-16px)]'
        }`}
      >
        {activeBuildStep && (
          <div
            role="radiogroup"
            aria-label={ARCHITECT_STEP_INSTRUCTIONS[activeBuildStep]}
            className="grid grid-cols-3 gap-2"
          >
            {stepOptions.map((option) => {
              const isSelected = previewValue === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={isControlsLocked}
                  data-testid={`architect-option-${option.id}`}
                  onClick={() => selectPreviewOption(option.id)}
                  className={`flex min-h-[44px] cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 p-1.5 text-center transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f766e] disabled:cursor-not-allowed disabled:opacity-60 sm:p-2 ${
                    isSelected
                      ? 'border-[#0f766e] bg-[#e6f7f5] shadow-md ring-2 ring-[#0f766e]/25'
                      : 'border-[#d6bd92] bg-white hover:border-[#b98d4b] hover:bg-[#fdf3df]'
                  }`}
                >
                  <OptionPreviewThumb
                    step={activeBuildStep}
                    optionId={option.id}
                    assetVersion={assetVersion}
                  />
                  <span className="text-xs font-extrabold leading-tight text-[#2e1c0e] sm:text-sm">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div
          className={`flex flex-wrap items-center justify-between gap-2 ${
            activeBuildStep ? 'mt-2.5' : ''
          }`}
        >
          <div className="flex items-center gap-2">
            {flowState !== 'MIMAR_INTRO' && flowState !== 'ENTER_WALK' && (
              <button
                type="button"
                data-testid="architect-restart-btn"
                disabled={isControlsLocked}
                onClick={restartBuild}
                className={`inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f766e] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm ${
                  flowState === 'DONE'
                    ? 'border-[#0f766e] bg-white text-[#0f766e] hover:bg-[#e6f7f5]'
                    : 'border-[#b89259] bg-white text-[#3f2816] hover:bg-[#f7e9cc]'
                }`}
              >
                <RotateCcw className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{ARCHITECT_UI_LABELS.restart}</span>
              </button>
            )}

            <button
              type="button"
              data-testid="architect-return-btn"
              onClick={handleReturnToClass}
              className={`inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f766e] sm:text-sm ${
                flowState === 'DONE'
                  ? 'border-[#0b5c56] bg-[#0f766e] text-white shadow-md hover:bg-[#0b5c56]'
                  : 'border-[#966a3d] bg-[#f4e4c5] text-[#362213] hover:bg-[#ebd3a6]'
              }`}
            >
              <DoorOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{ARCHITECT_UI_LABELS.returnToClass}</span>
            </button>
          </div>

          {activeBuildStep && (
            <button
              type="button"
              data-testid="architect-place-btn"
              disabled={!previewValue || isControlsLocked}
              onClick={confirmPlacement}
              className="inline-flex min-h-[44px] min-w-[116px] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#0f766e] px-4 py-2 text-sm font-extrabold text-white shadow-md transition-colors hover:bg-[#0b5c56] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f766e] disabled:cursor-not-allowed disabled:bg-[#9fb5b2] disabled:shadow-none sm:flex-none sm:px-6"
            >
              <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{ARCHITECT_UI_LABELS.place}</span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
