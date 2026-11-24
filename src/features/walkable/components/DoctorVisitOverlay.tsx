import { useCallback, useEffect, useRef, useState, type Ref } from 'react';
import { Activity, Thermometer, Volume2 } from 'lucide-react';
import {
  DOCTOR_SPEAKER_NAMES,
  DOCTOR_VISIT_STEPS,
  type ClinicDemo,
  type DoctorChoice,
  type DoctorLine,
} from '@/src/data/doctorVisitContent';
import { getSpeechVoices, speakSegments, stopSpeaking } from '@/src/services/speech';

type VisitState = {
  stepIndex: number;
  turnIndex: number | null;
  reply?: DoctorLine;
  feedback?: string;
};

const initialVisit: VisitState = { stepIndex: 0, turnIndex: null };

function getTurn(visit: VisitState) {
  return visit.turnIndex === null ? undefined : DOCTOR_VISIT_STEPS[visit.stepIndex]?.turns[visit.turnIndex];
}

function getReadingLine(visit: VisitState) {
  const turn = getTurn(visit);
  return visit.reply ?? (turn?.kind === 'line' ? turn : undefined);
}

function getDisplayLine(visit: VisitState) {
  const reading = getReadingLine(visit);
  if (reading || visit.turnIndex === null || visit.turnIndex === 0) return reading;
  const previous = DOCTOR_VISIT_STEPS[visit.stepIndex]?.turns[visit.turnIndex - 1];
  return previous?.kind === 'line' ? previous : undefined;
}

async function playClinicDemo(demo: ClinicDemo, signal: AbortSignal) {
  if (signal.aborted || typeof AudioContext === 'undefined') return;
  let audio: AudioContext | undefined;
  try {
    audio = new AudioContext();
    if (audio.state !== 'running') return;
    const beats = demo === 'heartbeat' ? [0, 0.17] : [0];
    for (const delay of beats) {
      const tone = audio.createOscillator();
      const volume = audio.createGain();
      const start = audio.currentTime + delay;
      tone.type = 'sine';
      tone.frequency.value = demo === 'heartbeat' ? 68 : 545;
      volume.gain.setValueAtTime(0, start);
      volume.gain.linearRampToValueAtTime(demo === 'heartbeat' ? 0.20 : 0.065, start + 0.026);
      volume.gain.exponentialRampToValueAtTime(0.001, start + 0.13);
      tone.connect(volume);
      volume.connect(audio.destination);
      tone.start(start);
      tone.stop(start + 0.14);
    }

    await new Promise<void>((resolve) => {
      const finish = () => {
        window.clearTimeout(timer);
        signal.removeEventListener('abort', finish);
        resolve();
      };
      const timer = window.setTimeout(finish, 420);
      signal.addEventListener('abort', finish, { once: true });
    });
  } catch {
    // Metin ve hareketli eğitim işareti kullanılabilir kalır.
  } finally {
    if (audio && audio.state !== 'closed') void audio.close().catch(() => {});
  }
}

export function useDoctorVisit(active: boolean, speechEnabled: boolean) {
  const [visit, setVisit] = useState<VisitState>(() => active ? { stepIndex: 0, turnIndex: 0 } : initialVisit);
  const visitRef = useRef(visit);
  const speechRef = useRef<AbortController | null>(null);
  const speakingRef = useRef(false);
  const motionRef = useRef<{ line?: DoctorLine; startedAt: number }>({ startedAt: 0 });
  const [replay, setReplay] = useState(0);
  const [settled, setSettled] = useState<{ line: DoctorLine; replay: number; spoken: boolean } | null>(null);
  const line = getReadingLine(visit);

  const update = useCallback((next: VisitState) => {
    visitRef.current = next;
    setVisit(next);
  }, []);

  const cancel = useCallback(() => {
    const request = speechRef.current;
    if (!request) return;
    speechRef.current = null;
    speakingRef.current = false;
    request.abort();
    stopSpeaking();
  }, []);

  const begin = useCallback(() => {
    cancel();
    setSettled(null);
    motionRef.current = { startedAt: 0 };
    update({ stepIndex: 0, turnIndex: 0 });
  }, [cancel, update]);

  const openStation = useCallback((stepIndex: number) => {
    const current = visitRef.current;
    if (current.turnIndex !== null || current.stepIndex !== stepIndex || !DOCTOR_VISIT_STEPS[stepIndex]?.station) return;
    update({ stepIndex, turnIndex: 0 });
  }, [update]);

  const read = useCallback(() => visitRef.current, []);

  const readAnimation = useCallback(() => {
    const now = performance.now();
    const activeLine = getReadingLine(visitRef.current);
    if (motionRef.current.line !== activeLine) motionRef.current = { line: activeLine, startedAt: now };
    return {
      speaker: activeLine && (speakingRef.current || now - motionRef.current.startedAt < 1250) ? activeLine.speaker : undefined,
      displaySpeaker: getDisplayLine(visitRef.current)?.speaker,
      demo: activeLine?.demo,
      demoElapsed: now - motionRef.current.startedAt,
      station: visitRef.current.turnIndex === null ? DOCTOR_VISIT_STEPS[visitRef.current.stepIndex]?.station : undefined,
    };
  }, []);

  useEffect(() => {
    if (!active || !line || !speechEnabled) return;
    const controller = new AbortController();
    speechRef.current = controller;
    const { signal } = controller;

    void (async () => {
      let spoken = false;
      try {
        if (line.demo) await playClinicDemo(line.demo, signal);
        if (signal.aborted) return;
        const voices = await getSpeechVoices(signal);
        if (signal.aborted || !voices?.['tr-TR']) return;
        speakingRef.current = true;
        ({ spoken } = await speakSegments([{ text: line.text, lang: 'tr-TR' }], {
          queued: {
            signal,
            voices,
            rates: { 'tr-TR': 0.90, 'en-US': 0.9 },
            pitch: line.speaker === 'guide' ? 1.01 : 1.12,
            onTimeoutFallback: stopSpeaking,
          },
        }));
      } catch {
        // Ses yoksa öğrenci yazılı balonla devam edebilir.
      } finally {
        if (speechRef.current === controller && !signal.aborted) {
          speakingRef.current = false;
          speechRef.current = null;
          setSettled({ line, replay, spoken });
        }
      }
    })();

    return () => {
      if (speechRef.current === controller) cancel();
    };
  }, [active, cancel, line, replay, speechEnabled]);

  const reading = active && Boolean(line) && speechEnabled && (settled?.line !== line || settled?.replay !== replay);

  const advance = () => {
    if (reading) return;
    const current = visitRef.current;
    if (current.turnIndex === null || !getReadingLine(current)) return;
    const nextTurn = current.turnIndex + 1;
    const step = DOCTOR_VISIT_STEPS[current.stepIndex];
    update(nextTurn < step.turns.length
      ? { stepIndex: current.stepIndex, turnIndex: nextTurn }
      : { stepIndex: current.stepIndex + 1, turnIndex: null });
  };

  const choose = (option: DoctorChoice) => {
    const current = visitRef.current;
    const turn = getTurn(current);
    if (turn?.kind !== 'choice' || current.reply) return;
    update(option.correct
      ? { ...current, reply: { kind: 'line', speaker: 'student', text: option.text }, feedback: undefined }
      : { ...current, feedback: turn.hint });
  };

  const turn = getTurn(visit);
  return {
    begin,
    openStation,
    cancel,
    read,
    readAnimation,
    stepIndex: visit.stepIndex,
    isDialogOpen: visit.turnIndex !== null,
    displayedLine: getDisplayLine(visit),
    choice: turn?.kind === 'choice' && !visit.reply ? turn : undefined,
    feedback: visit.feedback,
    complete: visit.stepIndex >= DOCTOR_VISIT_STEPS.length,
    reading,
    noVoice: Boolean(speechEnabled && settled && settled.line === line && !settled.spoken),
    demo: line?.demo,
    advance,
    choose,
    replay: () => setReplay((value) => value + 1),
  };
}

const buttonClass = 'pointer-events-auto min-h-[44px] rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm font-semibold text-sky-950 hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 disabled:opacity-50';
const primaryClass = 'pointer-events-auto min-h-[44px] rounded-lg bg-sky-800 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 disabled:opacity-65';

export function DoctorVisitOverlay({ visit, bubbleRef, speechEnabled, showInstruction, onExit }: {
  visit: ReturnType<typeof useDoctorVisit>;
  bubbleRef: Ref<HTMLDivElement>;
  speechEnabled: boolean;
  showInstruction: boolean;
  onExit: () => void;
}) {
  const line = visit.displayedLine;
  const step = DOCTOR_VISIT_STEPS[visit.stepIndex];
  const DemoIcon = visit.demo === 'heartbeat' ? Activity : Thermometer;

  if (visit.complete) {
    return (
      <aside role="status" className="pointer-events-auto absolute bottom-[10.75rem] left-1/2 z-30 w-[min(400px,calc(100%-24px))] -translate-x-1/2 rounded-2xl border border-sky-200 bg-white/95 p-4 text-center text-sky-950 shadow-lg">
        <p className="font-bold">Muayene odası keşfini tamamladın!</p>
        <button type="button" className={primaryClass + ' mt-3'} onClick={onExit}>Sınıfa Dön</button>
      </aside>
    );
  }

  if (!visit.isDialogOpen) {
    if (!showInstruction) return null;
    return (
      <p role="status" className="pointer-events-none absolute bottom-[10.75rem] left-3 z-20 max-w-[calc(100%-24px)] rounded-lg border border-sky-100 bg-white/95 px-3 py-2 text-sm font-semibold text-sky-950 shadow-sm sm:bottom-16 sm:left-5">
        {step?.instruction}
      </p>
    );
  }

  return (
    <>
      {line && (
        <div
          ref={bubbleRef}
          role="status"
          aria-live="polite"
          className="pointer-events-none absolute z-30 w-[min(302px,calc(100%-24px))] -translate-x-1/2 -translate-y-full rounded-2xl border-2 border-sky-200 bg-white/95 p-3 text-left text-sky-950 shadow-lg"
          style={{
            left: 'clamp(min(163px,50%), var(--doctor-bubble-x, 50%), max(calc(100% - 163px),50%))',
            top: 'clamp(185px, var(--doctor-bubble-y, 48%), calc(100% - 224px))',
          }}
        >
          <p className="text-xs font-bold text-sky-800">{DOCTOR_SPEAKER_NAMES[line.speaker]}</p>
          <p className="mt-1 text-sm font-semibold leading-snug">{line.text}</p>
        </div>
      )}
      <section aria-label="Muayene odası konuşması" className="pointer-events-auto absolute bottom-3 left-1/2 z-30 w-[min(500px,calc(100%-24px))] -translate-x-1/2 space-y-2 rounded-2xl border border-sky-200 bg-white/95 p-3 text-sky-950 shadow-lg sm:bottom-5">
        {visit.demo && (
          <p className="flex items-center gap-2 text-sm font-semibold text-sky-800">
            <DemoIcon className="size-5 motion-safe:animate-pulse" aria-hidden="true" />
            {visit.demo === 'heartbeat' ? 'Temsili kalp sesi' : 'Temsili ölçüm tamamlandı'}
          </p>
        )}
        {visit.choice ? (
          <>
            <p className="text-sm font-bold">{visit.choice.prompt}</p>
            {visit.feedback && <p role="status" className="text-sm text-amber-900">{visit.feedback}</p>}
            <div className="grid gap-2">
              {visit.choice.options.map((option) => (
                <button key={option.text} type="button" className={buttonClass + ' text-left'} onClick={() => visit.choose(option)}>{option.text}</button>
              ))}
            </div>
          </>
        ) : (
          <>
            {visit.noVoice && <p className="text-xs text-slate-600">Ses kullanılamıyor. Konuşma balonundan devam edebilirsin.</p>}
            <div className="flex flex-wrap justify-end gap-2">
              {speechEnabled && (
                <button type="button" className={buttonClass + ' inline-flex items-center gap-1.5'} onClick={visit.replay} disabled={visit.reading}>
                  <Volume2 className="size-4" aria-hidden="true" /> Tekrar Dinle
                </button>
              )}
              <button type="button" className={primaryClass} onClick={visit.advance} disabled={visit.reading}>
                {visit.reading ? 'Dinleniyor…' : 'Devam Et'}
              </button>
            </div>
          </>
        )}
      </section>
    </>
  );
}
