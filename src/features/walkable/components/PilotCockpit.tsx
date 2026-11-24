import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Award, Check, Compass, Gauge, Navigation } from 'lucide-react';
import {
  PILOT_COURSES, PILOT_INTRO, PILOT_LANDING, PILOT_TITLE, type PilotCheckpoint, type PilotLine,
} from '@/src/data/pilotExperienceContent';
import type { StudentCharacterId } from '@/src/data/studentCharacters';
import type { SupportedGrade } from '@/src/types/campus';
import {
  initialFlightState, pilotCorrection, prepareLanding, stepPilotFlight,
  PILOT_LANDING_TOLERANCE, type PilotAxes, type PilotMode,
} from '../engine/pilotFlightEngine';
import { PILOT_COCKPIT_FRAME, renderPilotCockpit } from '../engine/pilotCockpitSceneRenderer';
import { usePilotSpeech, type PilotMilestone } from '../usePilotExperience';

type Stage = 'intro' | 'course' | 'landing-preview' | 'approach' | 'flare' | 'landed';
type FlightEvent = 'checkpoint' | 'aligned' | 'landed';
type Direction = 'left' | 'right' | 'up' | 'down';
const keys: Partial<Record<string, Direction>> = {
  ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
  a: 'left', d: 'right', w: 'up', s: 'down',
};
const directionButtons = [
  { id: 'up', label: 'Yüksel', icon: ArrowUp, placement: 'col-start-2 row-start-1' },
  { id: 'left', label: 'Sola yönel', icon: ArrowLeft, placement: 'col-start-1 row-start-2' },
  { id: 'down', label: 'Alçal', icon: ArrowDown, placement: 'col-start-2 row-start-2' },
  { id: 'right', label: 'Sağa yönel', icon: ArrowRight, placement: 'col-start-3 row-start-2' },
] as const;
const primary = 'min-h-[44px] rounded-lg bg-sky-800 px-3 py-2 text-sm font-bold text-white hover:bg-sky-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-900 disabled:opacity-55';
const option = 'min-h-[44px] rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-left text-sm font-semibold hover:bg-sky-100 focus-visible:outline-2 focus-visible:outline-sky-900 disabled:opacity-55';
const panel = 'pointer-events-auto absolute inset-x-3 bottom-3 z-30 mx-auto max-h-[43dvh] max-w-[525px] space-y-2 overflow-auto overscroll-contain rounded-2xl border border-sky-200 bg-white p-3 text-sky-950 shadow-2xl sm:bottom-5 sm:p-4';

function getInitialStage(mark: PilotMilestone): Stage {
  if (mark === 4) return 'landed';
  if (mark === 3) return 'landing-preview';
  return mark === 2 ? 'course' : 'intro';
}

function getCaptainLine(stage: Stage, introLine: 0 | 1, point: number, grade: SupportedGrade): PilotLine {
  const text = stage === 'intro' ? PILOT_INTRO[introLine]
    : stage === 'course' ? PILOT_COURSES[grade].points[point]?.guidance ?? PILOT_LANDING.line
      : stage === 'landing-preview' ? PILOT_LANDING.line
        : stage === 'approach' ? PILOT_LANDING.approach
          : stage === 'flare' ? PILOT_LANDING.flare : PILOT_LANDING.complete;
  return { speaker: 'captain', text };
}

function FlightControls({ onPress, onRelease, onActivate }: {
  onPress: (direction: Direction) => void;
  onRelease: () => void;
  onActivate: (direction: Direction) => void;
}) {
  const grab = (event: PointerEvent<HTMLButtonElement>, direction: Direction) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    onPress(direction);
  };
  return (
    <div aria-label="Uçuş kumandası" role="group" className="pointer-events-auto absolute bottom-3 left-3 z-30 grid touch-none grid-cols-[repeat(3,46px)] gap-1 rounded-2xl border border-white/25 bg-slate-950/90 p-2 text-white sm:bottom-5 sm:left-5 sm:grid-cols-[repeat(3,52px)]">
      {directionButtons.map(({ id, label, icon: Icon, placement }) => (
        <button
          key={id}
          type="button"
          title={label}
          aria-label={label}
          className={placement + ' grid min-h-[46px] place-items-center rounded-lg bg-sky-800 hover:bg-sky-700 active:bg-sky-500 focus-visible:outline-2 focus-visible:outline-white'}
          onPointerDown={(event) => grab(event, id)}
          onPointerUp={onRelease}
          onPointerCancel={onRelease}
          onLostPointerCapture={onRelease}
          onClick={(event) => { if (event.detail === 0) onActivate(id); }}
        >
          <Icon aria-hidden="true" className="size-5" />
        </button>
      ))}
    </div>
  );
}

function RouteMap({ points, point, side }: { points: readonly PilotCheckpoint[]; point: number; side: number }) {
  const markerX = (lateral: number) => 50 + lateral * 0.27;
  return (
    <div
      role="img"
      aria-label={'Rota haritası, sıradaki nokta ' + (point + 1)}
      className="relative mt-1 h-14 overflow-hidden rounded-md border border-sky-500/45 bg-sky-950"
    >
      <span className="absolute inset-y-0 left-1/2 border-l border-dashed border-sky-500/60" />
      {points.map((gate, index) => (
        <span
          key={gate.label}
          className={'absolute grid size-4 -translate-x-1/2 place-items-center rounded-full text-[10px] font-bold ' + (index === point ? 'bg-amber-300 text-slate-950' : index < point ? 'bg-emerald-700 text-white' : 'bg-slate-700 text-white')}
          style={{ left: markerX(gate.x) + '%', top: 4 + (points.length - index - 1) * 12 }}
        >
          {index + 1}
        </span>
      ))}
      <Navigation aria-hidden="true" className="absolute bottom-0.5 size-3 -translate-x-1/2 -rotate-45 text-sky-300" style={{ left: markerX(side) + '%' }} />
    </div>
  );
}

function RunwayChoice({ centered }: { centered: boolean }) {
  return (
    <div aria-hidden="true" className="relative mx-auto my-1 h-12 w-20 overflow-hidden rounded bg-sky-100">
      <span className="absolute inset-x-1/4 bottom-0 top-2 bg-slate-700 [clip-path:polygon(35%_0,65%_0,100%_100%,0_100%)]" />
      <span className="absolute bottom-0.5 left-1/2 h-9 border-l-2 border-dashed border-white" />
      <ArrowUp className={'absolute bottom-1 size-5 text-amber-300 ' + (centered ? 'left-[31px]' : 'left-0 -rotate-12')} />
    </div>
  );
}

export function PilotCockpit({ milestone, grade, characterId, speechEnabled, suspended, onMilestone, onExit }: {
  milestone: PilotMilestone;
  grade: SupportedGrade;
  characterId?: StudentCharacterId;
  speechEnabled: boolean;
  suspended: boolean;
  onMilestone: (milestone: PilotMilestone) => void;
  onExit: () => void;
}) {
  const [stage, setStage] = useState<Stage>(() => getInitialStage(milestone));
  const [introLine, setIntroLine] = useState<0 | 1>(0);
  const [point, setPoint] = useState(0);
  const [reply, setReply] = useState<PilotLine | null>(null);
  const [feedback, setFeedback] = useState('');
  const [runwaySelected, setRunwaySelected] = useState(false);
  const [reasonSelected, setReasonSelected] = useState(false);
  const [hud, setHud] = useState({ height: 0, side: 0, horizontal: '', vertical: '' });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsRef = useRef<HTMLElement>(null);
  const flightRef = useRef(initialFlightState(milestone));
  const touch = useRef<Direction | null>(null);
  const tap = useRef<{ direction: Direction; until: number } | null>(null);
  const held = useRef(new Set<string>());
  const line = reply ?? getCaptainLine(stage, introLine, point, grade);
  const speech = usePilotSpeech(!suspended, speechEnabled, line, characterId);
  const course = PILOT_COURSES[grade];
  const target = stage === 'course' ? course.points[point] : undefined;
  const flying = stage === 'course' || stage === 'approach';
  const status = stage === 'course' ? 'Uçuş rotası' : stage === 'landing-preview' || stage === 'approach' || stage === 'flare' ? 'İniş' : stage === 'landed' ? 'Uçuş tamamlandı' : 'Kokpit hazırlığı';

  const receive = useCallback((event: FlightEvent) => {
    if (event === 'checkpoint') {
      if (point < course.points.length - 1) {
        setPoint(point + 1);
      } else {
        prepareLanding(flightRef.current);
        setStage('landing-preview');
        onMilestone(3);
      }
    } else if (event === 'aligned') {
      setStage('flare');
    } else {
      setStage('landed');
      onMilestone(4);
    }
  }, [course.points.length, onMilestone, point]);

  const runtime = useRef({
    mode: 'parked' as PilotMode, target, point, course, canAdvance: false, suspended, speaker: line.speaker, receive,
  });
  useEffect(() => {
    const mode: PilotMode = stage === 'intro' ? 'parked' : stage;
    runtime.current = { mode, target, point, course, canAdvance: !speech.reading, suspended, speaker: line.speaker, receive };
    if (suspended || (mode !== 'course' && mode !== 'approach')) {
      held.current.clear();
      touch.current = null;
      tap.current = null;
    }
  }, [course, line.speaker, point, receive, speech.reading, stage, suspended, target]);

  useEffect(() => {
    if (stage !== 'intro' || suspended || speech.reading) return;
    const readingTime = introLine === 0 ? 3200 : 2300;
    const timer = window.setTimeout(() => {
      if (introLine === 0) {
        setIntroLine(1);
      } else {
        flightRef.current = initialFlightState(2);
        setStage('course');
        onMilestone(2);
      }
    }, speech.played ? 0 : readingTime);
    return () => window.clearTimeout(timer);
  }, [introLine, onMilestone, speech.played, speech.reading, stage, suspended]);

  useEffect(() => {
    if (stage === 'landing-preview' || stage === 'landed') controlsRef.current?.focus({ preventScroll: true });
  }, [stage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const isControlled = () => !runtime.current.suspended && (runtime.current.mode === 'course' || runtime.current.mode === 'approach');
    const keydown = (event: KeyboardEvent) => {
      if (!keys[event.key] || !isControlled() || event.altKey || event.ctrlKey || event.metaKey) return;
      event.preventDefault();
      held.current.add(event.key);
    };
    const keyup = (event: KeyboardEvent) => held.current.delete(event.key);
    const release = () => {
      held.current.clear();
      touch.current = null;
      tap.current = null;
    };
    window.addEventListener('keydown', keydown);
    window.addEventListener('keyup', keyup);
    window.addEventListener('blur', release);
    document.addEventListener('visibilitychange', release);

    let frame = 0;
    let last = 0;
    let hudTime = 0;
    let lastPaint = 0;
    let delivered = '';
    const update = (time: number) => {
      const current = runtime.current;
      const state = flightRef.current;
      const dt = last ? Math.min(0.045, (time - last) / 1000) : 0;
      last = time;
      const trigger = touch.current ?? (tap.current && tap.current.until > time ? tap.current.direction : null);
      const active = (direction: Direction) => trigger === direction || [...held.current].some((key) => keys[key] === direction);
      const axes: PilotAxes = { side: Number(active('right')) - Number(active('left')), lift: Number(active('up')) - Number(active('down')) };
      const token = current.mode + ':' + current.point;
      if (!current.suspended && token !== delivered) {
        const event = stepPilotFlight(state, current.mode, axes, dt, current.target, current.course.tolerance, current.course.drift, current.canAdvance);
        if (event) {
          delivered = token;
          current.receive(event);
        }
      }
      const paintInterval = current.mode === 'parked' || current.mode === 'landed' ? 95 : 29;
      if (time - lastPaint > paintInterval) {
        lastPaint = time;
        renderPilotCockpit(ctx, state, current.mode, current.target, current.point, current.course.tolerance, characterId, current.canAdvance ? undefined : current.speaker, reduced);
      }
      if (time - hudTime > 125) {
        hudTime = time;
        const landing = current.mode === 'approach';
        const correction = pilotCorrection(state, current.target, landing ? PILOT_LANDING_TOLERANCE : current.course.tolerance, landing);
        const next = { height: Math.round(state.height), side: Math.round(state.x), ...correction };
        setHud((old) => old.height === next.height && old.side === next.side && old.horizontal === next.horizontal && old.vertical === next.vertical ? old : next);
      }
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('keyup', keyup);
      window.removeEventListener('blur', release);
      document.removeEventListener('visibilitychange', release);
      release();
    };
  }, [characterId]);

  function startApproach() {
    setReply(null);
    setFeedback('');
    setStage('approach');
  }

  function selectRunway(centered: boolean) {
    if (!centered) {
      setFeedback(PILOT_LANDING.feedback);
      return;
    }
    setFeedback('');
    setRunwaySelected(true);
    if (grade !== 4) setReply({ speaker: 'student', text: 'Pistin orta çizgisiyle hizalanan yaklaşmayı seçiyorum.' });
  }

  return (
    <div className="absolute inset-0 z-10 bg-[#0c2138]" data-pilot-stage={stage}>
      <div className="pointer-events-none absolute inset-x-0 top-[8.25rem] mx-auto aspect-[3/2] max-w-[150dvh] sm:top-1/2 sm:-translate-y-1/2">
        <canvas ref={canvasRef} width={PILOT_COCKPIT_FRAME.width} height={PILOT_COCKPIT_FRAME.height} aria-label="Kokpitten görünen vadi, uçuş göstergeleri ve pist" className="block h-full w-full" />
        <div
          role="status"
          className={'absolute top-[96%] max-h-[25dvh] w-[min(240px,calc(100%-24px))] sm:w-[300px] -translate-y-full overflow-auto rounded-xl border border-sky-200 bg-white/95 p-2.5 text-sky-950 shadow-md sm:top-[62%] ' + (line.speaker === 'captain' ? 'left-3 sm:left-[5%]' : 'right-3 sm:right-[5%]')}
        >
          <p className="text-xs font-bold text-sky-800">{line.speaker === 'captain' ? 'Kaptan Pilot' : 'Sen'}</p>
          <p className="mt-0.5 text-sm font-semibold leading-snug">{line.text}</p>
        </div>
      </div>

      {stage !== 'intro' && stage !== 'landed' && (
        <aside className="pointer-events-none absolute right-3 top-[52%] z-20 flex max-w-[calc(100%-24px)] flex-wrap items-center gap-2 rounded-xl border border-white/25 bg-slate-950/90 px-3 py-2 text-xs text-white sm:right-5 sm:top-[5.5rem]" aria-label="Uçuş göstergeleri">
          <span className="font-bold">{status}</span>
          {stage === 'course' && (
            <span className="flex items-center gap-1" aria-label={'Kontrol noktası ' + (point + 1) + ' / ' + course.points.length}>
              {course.points.map((item, index) => (
                <span key={item.label} className={'grid size-5 place-items-center rounded-full font-bold ' + (index < point ? 'bg-emerald-700' : index === point ? 'bg-amber-300 text-slate-950' : 'bg-slate-700')}>
                  {index < point ? <Check aria-hidden="true" size={13} /> : index + 1}
                </span>
              ))}
            </span>
          )}
          <span title="Eğitim göstergesi" className="flex items-center gap-1"><Gauge size={14} aria-hidden="true" /> Yükseklik {hud.height}</span>
          <span className="flex items-center gap-1"><Compass size={14} aria-hidden="true" /> {hud.side < -15 ? 'Sol' : hud.side > 15 ? 'Sağ' : 'Orta'}</span>
        </aside>
      )}

      {flying && !suspended && (
        <>
          <FlightControls
            onPress={(direction) => { touch.current = direction; tap.current = { direction, until: performance.now() + 155 }; }}
            onRelease={() => { touch.current = null; }}
            onActivate={(direction) => { tap.current = { direction, until: performance.now() + 250 }; }}
          />
          <section aria-label="Rota yardımı" className="pointer-events-none absolute bottom-3 right-3 z-20 w-[min(11rem,calc(100%-190px))] space-y-1 rounded-xl border border-white/25 bg-slate-950/90 p-2.5 text-xs text-white sm:bottom-5 sm:right-5 sm:w-[258px] sm:p-3">
            <p className="font-bold">{stage === 'approach' ? 'Pist orta çizgisi' : target?.label}</p>
            {(grade < 4 || stage === 'approach' || Math.abs(hud.side - (target?.x ?? 0)) > 55) && (
              <p className="flex items-center gap-1"><Navigation className="size-3.5 shrink-0" aria-hidden="true" /> {[hud.horizontal, hud.vertical].filter(Boolean).join(' · ') || 'Hizayı koru.'}</p>
            )}
            {grade === 4 && stage === 'course' && <p>Halka yeşil olana kadar küçük rota düzeltmeleri yap.</p>}
            {grade >= 3 && stage === 'course' && <RouteMap points={course.points} point={point} side={hud.side} />}
            <p className="hidden text-slate-200 sm:block">Yön tuşlarını kullan veya kumandaya dokun.</p>
          </section>
        </>
      )}

      {stage === 'landing-preview' && (
        <section ref={controlsRef} tabIndex={-1} className={panel} aria-label="İniş yaklaşması">
          <h2 className="font-bold">Piste nasıl yaklaşalım?</h2>
          {!runwaySelected ? (
            <div className="grid grid-cols-2 gap-2">
              <button type="button" disabled={speech.reading} className={option + ' text-center'} onClick={() => selectRunway(false)}><RunwayChoice centered={false} /> Orta çizginin dışında</button>
              <button type="button" disabled={speech.reading} className={option + ' text-center'} onClick={() => selectRunway(true)}><RunwayChoice centered /> Orta çizgiyle hizalı</button>
            </div>
          ) : grade === 4 && !reasonSelected ? (
            <fieldset className="grid gap-1.5">
              <legend className="text-sm font-semibold">{PILOT_LANDING.reason}</legend>
              {PILOT_LANDING.reasons.map((answer, index) => (
                <button type="button" key={answer} className={option} onClick={() => {
                  if (index === 0) {
                    setReply({ speaker: 'student', text: answer });
                    setReasonSelected(true);
                    setFeedback('');
                  } else setFeedback('Bir sonraki düzeltmende pistin orta çizgisine bak.');
                }}>{answer}</button>
              ))}
            </fieldset>
          ) : <button type="button" disabled={speech.reading} className={primary} onClick={startApproach}>Piste Yaklaş</button>}
          {feedback && <p role="status" className="text-sm font-semibold text-amber-900">{feedback}</p>}
        </section>
      )}

      {stage === 'flare' && <p role="status" className={panel + ' text-center font-bold'}>Uçak piste iniyor…</p>}

      {stage === 'landed' && (
        <section ref={controlsRef} tabIndex={-1} aria-labelledby="pilot-achievement" className={panel + ' text-center'}>
          <Award className="mx-auto size-9 text-amber-700" aria-hidden="true" />
          <h2 id="pilot-achievement" className="text-xl font-bold">{PILOT_TITLE}</h2>
          <button type="button" className={primary} onClick={onExit}>Sınıfa Dön</button>
        </section>
      )}
    </div>
  );
}
