import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Lightbulb, Pause, Play, RotateCcw } from 'lucide-react';
import { useOptionalCampus } from '@/src/app/CampusProviders';
import { FullscreenButton } from '@/src/components/FullscreenButton';
import {
  ACTIVE_DISCOVERY_MISSION_ID,
  ACTIVE_DISCOVERY_MISSION_VERSION,
  ACTIVE_DISCOVERY_UI_COPY,
  ACTIVE_EXPERIMENTS,
  MOON_PHASES,
  TURKEY_COORDS,
  detectMoonPhaseAtAngle,
  projectSurfacePoint,
  type ActiveExperimentId,
  type MoonPhaseId,
} from '@/src/data/earthSunMoonExperiments';
import type { MissionProgress, MissionStageId, SupportedGrade } from '@/src/types/campus';
import {
  CelestialGlobeCanvas,
  type CelestialGlobeCanvasProps,
  type SurfaceClickHit,
  type SurfacePin,
} from './CelestialGlobeCanvas';

const EARTH_TILT_X = 0.22;
const INITIAL_DAY_NIGHT_ROT_Y = 0.58;

function normalizeAngleDeg(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

interface MoonOrbitCanvasProps {
  phaseAngleDeg: number;
  onChangeAngle: (nextDeg: number) => void;
}

function MoonOrbitCanvas({ phaseAngleDeg, onChangeAngle }: MoonOrbitCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef<number | null>(null);
  const { ref, width: availableWidth, height: availableHeight } = useModelSpace<HTMLDivElement>();

  const width = 320;
  const height = 252;
  const earthCx = 186;
  const earthCy = 126;
  const orbitR = 78;
  const displayWidth = Math.min(availableWidth, availableHeight * width / height);
  const displayHeight = displayWidth * height / width;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || displayWidth <= 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = Math.min(window.devicePixelRatio || 1, 1.5);
    const backingWidth = Math.round(displayWidth * scale);
    const backingHeight = Math.round(displayHeight * scale);
    if (canvas.width !== backingWidth) canvas.width = backingWidth;
    if (canvas.height !== backingHeight) canvas.height = backingHeight;
    ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
    ctx.clearRect(0, 0, width, height);

    // Uzay arka planı
    const bg = ctx.createRadialGradient(earthCx, earthCy, 14, earthCx, earthCy, 210);
    bg.addColorStop(0, '#12264f');
    bg.addColorStop(0.65, '#08142e');
    bg.addColorStop(1, '#040917');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // İnce yıldız noktaları
    for (let i = 0; i < 28; i++) {
      const sx = ((i * 67 + 29) % 100) * 0.01 * width;
      const sy = ((i * 43 + 17) % 100) * 0.01 * height;
      ctx.fillStyle = `rgba(255, 248, 224, ${0.25 + (i % 5) * 0.1})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 0.8 + (i % 3) * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    // Solda sabit Güneş ve paralel sağa yönlü güneş ışınları
    const sunGrad = ctx.createRadialGradient(-8, earthCy, 10, -8, earthCy, 74);
    sunGrad.addColorStop(0, '#fff7cc');
    sunGrad.addColorStop(0.42, '#fbbf24');
    sunGrad.addColorStop(0.75, 'rgba(249, 115, 22, 0.38)');
    sunGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(-8, earthCy, 74, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.arc(-16, earthCy, 42, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.fill();

    // Güneş etiketi
    ctx.save();
    ctx.fillStyle = '#fef3c7';
    ctx.font = '700 11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Güneş', 6, 20);
    ctx.restore();

    // Paralel ışık okları (soldan sağa)
    ctx.save();
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.42)';
    ctx.fillStyle = 'rgba(253, 224, 71, 0.58)';
    ctx.lineWidth = 1.4;
    for (const rayY of [42, 84, 126, 168, 210]) {
      ctx.beginPath();
      ctx.moveTo(34, rayY);
      ctx.lineTo(74, rayY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(78, rayY);
      ctx.lineTo(70, rayY - 3.5);
      ctx.lineTo(70, rayY + 3.5);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Ay yörünge çemberi
    ctx.save();
    ctx.strokeStyle = 'rgba(186, 214, 255, 0.38)';
    ctx.lineWidth = 1.6;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(earthCx, earthCy, orbitR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Dört temel evre rehber işaret noktası
    ctx.save();
    ctx.font = '600 10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const phase of MOON_PHASES) {
      const rad = (phase.phaseAngleDeg * Math.PI) / 180;
      const px = earthCx - Math.cos(rad) * orbitR;
      const py = earthCy + Math.sin(rad) * orbitR;

      ctx.fillStyle = 'rgba(246, 220, 155, 0.55)';
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fill();

      const labelOffsetX =
        phase.phaseAngleDeg === 0 ? -24 : phase.phaseAngleDeg === 180 ? 28 : 0;
      const labelOffsetY =
        phase.phaseAngleDeg === 90 ? 20 : phase.phaseAngleDeg === 270 ? -20 : 19;
      ctx.fillStyle = 'rgba(219, 234, 254, 0.78)';
      ctx.fillText(phase.label, px + labelOffsetX, py + labelOffsetY);
    }
    ctx.restore();

    // Dünya (merkezde: sol yarısı Güneş'e baktığı için aydınlık, sağ yarısı karanlık)
    const earthR = 23;
    ctx.save();
    ctx.beginPath();
    ctx.arc(earthCx, earthCy, earthR, 0, Math.PI * 2);
    ctx.clip();

    // Karanlık sağ yarı
    ctx.fillStyle = '#0f2247';
    ctx.fillRect(earthCx - earthR, earthCy - earthR, earthR * 2, earthR * 2);

    // Aydınlık sol yarı
    ctx.fillStyle = '#2589d8';
    ctx.fillRect(earthCx - earthR, earthCy - earthR, earthR, earthR * 2);
    // Küçük yeşil kara lekesi
    ctx.fillStyle = '#3ca66b';
    ctx.beginPath();
    ctx.arc(earthCx - 8, earthCy - 5, 7, 0, Math.PI * 2);
    ctx.arc(earthCx - 6, earthCy + 7, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = 'rgba(125, 211, 252, 0.75)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(earthCx, earthCy, earthR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#e0f2fe';
    ctx.font = '700 10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Dünya', earthCx, earthCy + earthR + 12);

    // Ay konumu (Güneş'e bakan SOL yarısı HER ZAMAN aydınlık — Dünya gölgesi YOK!)
    const alpha = (phaseAngleDeg * Math.PI) / 180;
    const moonX = earthCx - Math.cos(alpha) * orbitR;
    const moonY = earthCy + Math.sin(alpha) * orbitR;
    const moonR = 14;

    // Dünya -> Ay bakış çizgisi (ince kılavuz)
    ctx.save();
    ctx.strokeStyle = 'rgba(246, 220, 155, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(earthCx, earthCy);
    ctx.lineTo(moonX, moonY);
    ctx.stroke();
    ctx.restore();

    // Ay seçim halkası
    ctx.strokeStyle = '#f6dc9b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR + 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.clip();
    // Sağ yarı (karanlık)
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(moonX - moonR, moonY - moonR, moonR * 2, moonR * 2);
    // Sol yarı (Güneş'e dönük aydınlık yarım küre — her konumda sabit solda)
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(moonX - moonR, moonY - moonR, moonR, moonR * 2);
    ctx.restore();

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.stroke();
  }, [displayHeight, displayWidth, phaseAngleDeg]);

  const updateAngleFromPointer = (e: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = ((e.clientX - rect.left) / rect.width) * width;
    const y = ((e.clientY - rect.top) / rect.height) * height;
    const rad = Math.atan2(y - earthCy, -(x - earthCx));
    const deg = normalizeAngleDeg((rad * 180) / Math.PI);
    onChangeAngle(Math.round(deg));
  };

  return (
    <div ref={ref} className="flex min-h-0 w-full flex-1 items-center justify-center">
      <canvas
        ref={canvasRef}
        style={{ width: displayWidth, height: displayHeight }}
        role="slider"
        aria-label="Ay yörünge konumu"
        aria-valuemin={0}
        aria-valuemax={360}
        aria-valuenow={Math.round(phaseAngleDeg)}
        aria-valuetext={detectMoonPhaseAtAngle(phaseAngleDeg)?.label ?? 'Ara evre'}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            e.preventDefault();
            onChangeAngle(normalizeAngleDeg(phaseAngleDeg + 15));
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            e.preventDefault();
            onChangeAngle(normalizeAngleDeg(phaseAngleDeg - 15));
          }
        }}
        onPointerDown={(event) => {
          if (event.button !== 0 || pointerRef.current !== null) return;
          pointerRef.current = event.pointerId;
          event.currentTarget.setPointerCapture(event.pointerId);
          updateAngleFromPointer(event);
        }}
        onPointerMove={(event) => {
          if (pointerRef.current === event.pointerId) updateAngleFromPointer(event);
        }}
        onLostPointerCapture={(event) => {
          if (pointerRef.current === event.pointerId) pointerRef.current = null;
        }}
        className="shrink-0 touch-none cursor-grab rounded-xl active:cursor-grabbing focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sky-300"
      />
    </div>
  );
}

const BUTTON_LAYOUT = 'inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-2.5 py-1 text-center text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 disabled:cursor-default disabled:opacity-50 sm:px-3 sm:text-sm';
const BUTTON = BUTTON_LAYOUT + ' border-amber-100/25 bg-[#12264f] text-[#fff6df] hover:bg-[#1b366d]';
const PRIMARY_BUTTON = BUTTON_LAYOUT + ' border-amber-300 bg-amber-300 text-[#09152e] hover:bg-amber-200';
const MODEL_PANEL = 'min-h-0 overflow-hidden rounded-2xl border border-sky-200/15 bg-[#060e21]';

interface EarthSunMoonExperimentsViewProps {
  activeGrade: SupportedGrade;
  onBack: () => void;
}

function readProgress(saved: MissionProgress | null | undefined) {
  return {
    completed: (saved?.selections.selectedDoorIds ?? []).filter(
      (id): id is ActiveExperimentId => ACTIVE_EXPERIMENTS.some((experiment) => experiment.id === id),
    ),
    phases: (saved?.selections.matchedVocabularyIds ?? []).filter(
      (id): id is MoonPhaseId => MOON_PHASES.some((phase) => phase.id === id),
    ),
  };
}

export function EarthSunMoonExperimentsView({ activeGrade, onBack }: EarthSunMoonExperimentsViewProps) {
  const campus = useOptionalCampus();
  const [progress, setProgress] = useState(() =>
    readProgress(campus?.getMissionProgress(ACTIVE_DISCOVERY_MISSION_ID, activeGrade)),
  );
  const progressRef = useRef(progress);
  const [activeIndex, setActiveIndex] = useState(0);
  const [replay, setReplay] = useState(0);
  const active = ACTIVE_EXPERIMENTS[activeIndex];
  const backRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    backRef.current?.focus({ preventScroll: true });
  }, []);

  const recordObservation = useCallback((experiment: ActiveExperimentId, phase?: MoonPhaseId) => {
    const existing = campus?.getMissionProgress(ACTIVE_DISCOVERY_MISSION_ID, activeGrade);
    const stored = readProgress(existing);
    const current = progressRef.current;
    const phases = [...new Set([...current.phases, ...stored.phases])];
    const completed = [...new Set([...current.completed, ...stored.completed])];
    if (phase && !phases.includes(phase)) phases.push(phase);
    if ((experiment !== 'exp-moon-phases' || phases.length >= 2) && !completed.includes(experiment)) {
      completed.push(experiment);
    }
    if (phases.length === current.phases.length && completed.length === current.completed.length) return;

    const next = { completed, phases };
    progressRef.current = next;
    setProgress(next);

    const requiredDone = completed.includes('exp-sunlight') && completed.includes('exp-day-night') &&
      (activeGrade === 2 || completed.includes('exp-moon-phases'));
    const completedStages: MissionStageId[] = [];
    if (completed.length) completedStages.push('kesfet');
    if (requiredDone) completedStages.push('ogren');
    campus?.saveMissionProgress({
      missionId: ACTIVE_DISCOVERY_MISSION_ID,
      missionVersion: ACTIVE_DISCOVERY_MISSION_VERSION,
      grade: activeGrade,
      currentStage: requiredDone ? 'ogren' : 'kesfet',
      completedStages,
      selections: {
        selectedDoorIds: completed,
        inspectedCampusGate: requiredDone,
        observationNotes: existing?.selections.observationNotes ?? {},
        matchedVocabularyIds: phases,
        matchedExampleSentence: requiredDone,
        doorName: 'Dünya, Güneş ve Ay — Aktif Keşif',
        writtenText: existing?.selections.writtenText ?? '',
        usedEnglishWords: existing?.selections.usedEnglishWords ?? [],
      },
      draftArtifactId: existing?.draftArtifactId ?? null,
      selfEvaluation: existing?.selfEvaluation ?? null,
      completed: requiredDone,
      completedAt: requiredDone ? (existing?.completedAt ?? new Date().toISOString()) : null,
      updatedAt: new Date().toISOString(),
    });
  }, [activeGrade, campus]);

  return (
    <div
      data-testid="active-discovery-experiments"
      className="flex h-full min-h-0 flex-col gap-2 overflow-hidden bg-[#0b1834] pt-[max(0.375rem,env(safe-area-inset-top))] pr-[max(0.375rem,env(safe-area-inset-right))] pb-[max(0.375rem,env(safe-area-inset-bottom))] pl-[max(0.375rem,env(safe-area-inset-left))]"
    >
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-1.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <button ref={backRef} type="button" onClick={onBack} className={BUTTON}>
            <ArrowLeft className="size-4 shrink-0" aria-hidden="true" /> Geri Dön
          </button>
          <h2 id="active-experiments-title" className="sr-only md:not-sr-only md:text-sm md:font-extrabold md:text-amber-50">
            {ACTIVE_DISCOVERY_UI_COPY.sectionTabLabel}
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <FullscreenButton showText={false} />
          <button type="button" className={BUTTON} onClick={() => setReplay((value) => value + 1)}>
            <RotateCcw className="size-4 shrink-0" aria-hidden="true" /> {ACTIVE_DISCOVERY_UI_COPY.resetLabel}
          </button>
        </div>
      </header>

      <nav aria-label="Aktif keşif deneyleri" className="grid shrink-0 grid-cols-3 gap-1.5">
        {ACTIVE_EXPERIMENTS.map((experiment, index) => (
          <button
            key={experiment.id}
            type="button"
            data-testid={'experiment-tab-' + experiment.id}
            aria-pressed={activeIndex === index}
            onClick={() => setActiveIndex(index)}
            className={BUTTON_LAYOUT + ' leading-tight text-amber-50 ' + (activeIndex === index
              ? 'border-amber-200 bg-[#233c71]'
              : 'border-amber-100/25 bg-[#12264f] hover:bg-[#1b366d]')}
          >
            <span>{experiment.shortTitle}</span>
            {progress.completed.includes(experiment.id) && (
              <CheckCircle2 className="size-3.5 shrink-0 text-emerald-300" aria-label="Tamamlandı" />
            )}
          </button>
        ))}
      </nav>

      <section
        key={active.id + '-' + replay}
        aria-label={active.title}
        className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto overscroll-contain"
      >
        {active.id === 'exp-sunlight' && <SunlightExperiment onObserved={() => recordObservation('exp-sunlight')} />}
        {active.id === 'exp-day-night' && <DayNightExperiment onObserved={() => recordObservation('exp-day-night')} />}
        {active.id === 'exp-moon-phases' && (
          <MoonPhasesExperiment onObserved={(phase) => recordObservation('exp-moon-phases', phase)} />
        )}
      </section>
    </div>
  );
}

function useModelSpace<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [space, setSpace] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    function updateSize(width: number, height: number) {
      const w = Math.floor(width);
      const h = Math.floor(height);
      setSpace((previous) => previous.width === w && previous.height === h ? previous : { width: w, height: h });
    }

    if (typeof ResizeObserver === 'undefined') {
      const measure = () => updateSize(element.clientWidth, element.clientHeight);
      measure();
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }

    const observer = new ResizeObserver(([entry]) => {
      if (entry) updateSize(entry.contentRect.width, entry.contentRect.height);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, ...space };
}

function clampZoom(value: number) {
  return Math.max(0.76, Math.min(1.42, value));
}

function useExperimentZoom() {
  const [zoom, setZoom] = useState(1);
  const onPinchZoom = useCallback((scale: number) => setZoom((value) => clampZoom(value * scale)), []);
  const onZoomWheel = useCallback((amount: number) => setZoom((value) => clampZoom(value + amount)), []);
  return { zoom, onPinchZoom, onZoomWheel };
}

type EarthModelProps = Omit<CelestialGlobeCanvasProps, 'bodyId' | 'size' | 'className' | 'displaySize'>;

function SunEarthModels({ isLightOn, sunRotation, ...earth }: EarthModelProps & { sunRotation: number }) {
  const { ref, width, height } = useModelSpace<HTMLDivElement>();
  const earthSize = Math.min(width * 0.69, height - 6);
  const sunSize = Math.min(width * 0.18, earthSize * 0.42);
  return (
    <div ref={ref} className={MODEL_PANEL + ' flex min-h-36 flex-1 items-center justify-center gap-[2%] landscape:min-h-28'}>
      {earthSize > 0 && (
        <>
          <CelestialGlobeCanvas
            bodyId="sun"
            size={Math.max(1, Math.round(Math.min(256, sunSize)))}
            rotY={sunRotation}
            rotX={0.08}
            showStarfield={false}
            ariaLabel="Sabit Güneş modeli"
            className={'shrink-0 transition-opacity ' +
              (isLightOn ? 'drop-shadow-[0_0_24px_rgba(251,191,36,0.65)]' : 'opacity-45 grayscale-[35%]')}
            displaySize={sunSize}
          />
          <div aria-hidden="true" className={'flex w-[7%] shrink-0 flex-col justify-center gap-1.5 ' + (isLightOn ? '' : 'opacity-20')}>
            {[0, 1, 2].map((ray) => (
              <div key={ray} className="flex items-center">
                <div className="h-px flex-1 bg-amber-300" />
                <ArrowRight className="-ml-1 size-3 shrink-0 text-amber-300" />
              </div>
            ))}
          </div>
          <CelestialGlobeCanvas
            {...earth}
            bodyId="earth"
            size={Math.max(1, Math.round(Math.min(384, earthSize)))}
            displaySize={earthSize}
            isLightOn={isLightOn}
            className="shrink-0 rounded-2xl"
          />
        </>
      )}
    </div>
  );
}

function ExperimentDock({ hint, children }: { hint: string; children: ReactNode }) {
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 px-0.5">
      <div className="flex min-w-0 grow flex-wrap items-center gap-x-3 text-xs leading-tight text-[#d5e5fc] sm:text-sm">
        <p role="status" className="font-semibold">{hint}</p>
        <span className="text-[11px] text-sky-200/80">{ACTIVE_DISCOVERY_UI_COPY.representativeBadge}</span>
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-1.5">{children}</div>
    </div>
  );
}

function SunlightExperiment({ onObserved }: { onObserved: () => void }) {
  const [lightOn, setLightOn] = useState(false);
  const [viewAngle, setViewAngle] = useState(0);
  const [litPin, setLitPin] = useState<SurfacePin | null>(null);
  const [darkPin, setDarkPin] = useState<SurfacePin | null>(null);
  const [hint, setHint] = useState('Güneş ışığını aç ve Dünya’yı gözlemle.');
  const camera = useExperimentZoom();
  const pins = useMemo(() => [litPin, darkPin].filter((pin): pin is SurfacePin => pin !== null), [litPin, darkPin]);

  function handleSurfaceClick(hit: SurfaceClickHit) {
    if (!lightOn) {
      setHint('Önce Güneş ışığını aç.');
      return;
    }
    if (hit.dotLight > 0.08 && (!litPin || darkPin)) {
      setLitPin({ id: 'lit', lonDeg: hit.lonDeg, latDeg: hit.latDeg, label: 'Aydınlık', color: '#facc15' });
      setHint(darkPin ? 'Aydınlık bölge güncellendi.' : 'Şimdi karanlık bölgeye dokun.');
    } else if (hit.dotLight < -0.08 && litPin) {
      setDarkPin({ id: 'dark', lonDeg: hit.lonDeg, latDeg: hit.latDeg, label: 'Karanlık', color: '#60a5fa' });
      setHint(darkPin ? 'Karanlık bölge güncellendi.' : 'İki bölgeyi de işaretledin.');
      if (!darkPin) onObserved();
    } else if (!litPin) {
      setHint('Güneş’e bakan aydınlık bölgeye dokun.');
    } else if (!darkPin) {
      setHint('Işık almayan karanlık bölgeye dokun.');
    }
  }

  return (
    <>
      <SunEarthModels
        {...camera}
        sunRotation={0.2}
        rotY={-0.35 + viewAngle}
        rotX={0.14}
        interactive
        lightingMode="directional"
        lightDirection={{ x: -Math.cos(viewAngle), y: 0, z: -Math.sin(viewAngle) }}
        isLightOn={lightOn}
        surfacePins={pins}
        onRotate={(deltaY) => setViewAngle((value) => value + deltaY)}
        onSurfaceClick={handleSurfaceClick}
        ariaLabel="Dünya’da aydınlık ve karanlık bölgeler"
      />
      <ExperimentDock hint={hint}>
        {!lightOn ? (
          <button type="button" data-testid="exp1-turn-light-btn" className={PRIMARY_BUTTON} onClick={() => {
            setLightOn(true);
            setHint('Aydınlık bölgeye dokun.');
          }}>
            <Lightbulb className="size-4 shrink-0" aria-hidden="true" /> {ACTIVE_DISCOVERY_UI_COPY.turnOnLightLabel}
          </button>
        ) : (
          <>
            <button type="button" className={BUTTON} onClick={() => setViewAngle(-1.25)}>Güneş Yönü</button>
            <button type="button" className={BUTTON} onClick={() => setViewAngle(0)}>Önden Bak</button>
            <button type="button" className={BUTTON} onClick={() => setViewAngle(1.25)}>Karanlık Taraf</button>
          </>
        )}
      </ExperimentDock>
    </>
  );
}

const EARTH_SUN_DIRECTION = { x: -1, y: 0, z: 0 };
const TURKEY_PIN: readonly SurfacePin[] = [{
  id: 'turkey', lonDeg: TURKEY_COORDS.lonDeg, latDeg: TURKEY_COORDS.latDeg,
  label: TURKEY_COORDS.label, color: '#ef4444', showWhenBack: true,
}];

function getTurkeyLight(rotation: number) {
  return -projectSurfacePoint(TURKEY_COORDS.lonDeg, TURKEY_COORDS.latDeg, rotation, EARTH_TILT_X).nx;
}

function DayNightExperiment({ onObserved }: { onObserved: () => void }) {
  const [rotation, setRotation] = useState(INITIAL_DAY_NIGHT_ROT_Y);
  const [spinning, setSpinning] = useState(false);
  const rotationRef = useRef(INITIAL_DAY_NIGHT_ROT_Y);
  const observations = useRef({ day: false, night: false });
  const camera = useExperimentZoom();
  const turkeyLight = getTurkeyLight(rotation);
  const turkeyLabel = turkeyLight > 0.28 ? 'Türkiye’de gündüz' : turkeyLight < -0.28 ? 'Türkiye’de gece' : 'Türkiye’de alacakaranlık';

  const applyRotation = useCallback((next: number) => {
    rotationRef.current = next;
    setRotation(next);
    if (observations.current.day && observations.current.night) return;
    const light = getTurkeyLight(next);
    if (light > 0.28) observations.current.day = true;
    if (light < -0.28) observations.current.night = true;
    if (observations.current.day && observations.current.night) onObserved();
  }, [onObserved]);

  useEffect(() => {
    if (!spinning) return;
    let frameId = 0;
    let lastTime = performance.now();
    function tick(now: number) {
      const dt = Math.min(0.08, (now - lastTime) / 1000);
      lastTime = now;
      applyRotation(rotationRef.current - dt * 0.85);
      frameId = requestAnimationFrame(tick);
    }
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [applyRotation, spinning]);

  function rotateManually(deltaY: number) {
    setSpinning(false);
    applyRotation(rotationRef.current + deltaY);
  }

  return (
    <>
      <SunEarthModels
        {...camera}
        sunRotation={0.25}
        rotY={rotation}
        rotX={EARTH_TILT_X}
        interactive
        lightingMode="directional"
        lightDirection={EARTH_SUN_DIRECTION}
        isLightOn
        showAxisLine
        surfacePins={TURKEY_PIN}
        onRotate={rotateManually}
        ariaLabel="Kendi ekseni etrafında dönen Dünya ve Türkiye işareti"
      />
      <ExperimentDock hint={turkeyLabel}>
        <button type="button" data-testid="exp2-spin-btn" className={PRIMARY_BUTTON} onClick={() => setSpinning((value) => !value)}>
          {spinning ? <Pause className="size-4 shrink-0" aria-hidden="true" /> : <Play className="size-4 shrink-0" aria-hidden="true" />}
          {spinning ? ACTIVE_DISCOVERY_UI_COPY.pauseLabel : ACTIVE_DISCOVERY_UI_COPY.spinLabel}
        </button>
        <button type="button" className={BUTTON} onClick={() => rotateManually(-0.55)}>Adım Döndür</button>
      </ExperimentDock>
    </>
  );
}

function MoonPhasesExperiment({ onObserved }: { onObserved: (phase: MoonPhaseId) => void }) {
  const [angle, setAngle] = useState(38);
  const [observedHere, setObservedHere] = useState<MoonPhaseId[]>([]);
  const { ref, width, height } = useModelSpace<HTMLDivElement>();
  const camera = useExperimentZoom();
  const globeSize = Math.min(width, height);
  const phase = detectMoonPhaseAtAngle(angle);
  const alpha = angle * Math.PI / 180;
  const angleLabel = phase?.label ?? 'Ara evre';
  const saved = phase ? observedHere.includes(phase.id) : false;

  return (
    <>
      <div className="grid min-h-[260px] flex-1 grid-rows-[minmax(0,1.2fr)_minmax(0,1fr)] gap-1.5 md:min-h-28 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:grid-rows-1 landscape:min-h-28 landscape:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] landscape:grid-rows-1">
        <div className={MODEL_PANEL + ' flex flex-col items-center gap-1 p-1'}>
          <h3 className="shrink-0 text-center text-sm font-bold text-amber-100">Uzaydan Görünüm</h3>
          <MoonOrbitCanvas phaseAngleDeg={angle} onChangeAngle={(value) => setAngle(normalizeAngleDeg(value))} />
        </div>
        <div className={MODEL_PANEL + ' flex flex-col items-center gap-1 p-1'}>
          <h3 className="shrink-0 text-center text-sm font-bold text-sky-100">Dünya’dan Görünüm</h3>
          <div ref={ref} className="flex min-h-0 w-full flex-1 items-center justify-center">
            {globeSize > 0 && (
              <CelestialGlobeCanvas
                {...camera}
                bodyId="moon"
                size={Math.max(1, Math.round(Math.min(384, globeSize)))}
                displaySize={globeSize}
                rotY={0.22}
                rotX={0.05}
                lightingMode="directional"
                lightDirection={{ x: Math.sin(alpha), y: 0, z: -Math.cos(alpha) }}
                ariaLabel={'Dünya’dan Ay görünümü · ' + angleLabel}
                className="shrink-0 rounded-xl"
              />
            )}
          </div>
          <p data-testid="exp3-detected-phase" className="shrink-0 text-center text-sm font-extrabold leading-tight text-amber-50">{angleLabel}</p>
        </div>
      </div>
      <ExperimentDock hint="Ay’ı Dünya çevresinde sürükle.">
        <input
          type="range"
          min={0}
          max={359}
          value={angle}
          aria-label="Ay yörünge açısı"
          aria-valuetext={angleLabel}
          onChange={(event) => setAngle(Number(event.target.value))}
          className="h-11 w-32 max-w-full cursor-pointer accent-amber-300 sm:w-48"
        />
        {phase && (
          <button type="button" data-testid={'save-phase-' + phase.id} disabled={saved} onClick={() => {
            setObservedHere((values) => [...values, phase.id]);
            onObserved(phase.id);
          }} className={BUTTON}>
            {saved ? 'Evre kaydedildi' : 'Evreyi kaydet'}
          </button>
        )}
      </ExperimentDock>
    </>
  );
}
