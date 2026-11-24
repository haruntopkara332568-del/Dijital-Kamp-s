import { useCallback, useEffect, useRef, useState, type PointerEvent, type Ref, type RefObject } from 'react';
import { Volume2 } from 'lucide-react';
import {
  DOCTOR_FEEDBACK, DOCTOR_HEARTBEAT_MS, DOCTOR_INTRO, DOCTOR_LISTEN_MS, DOCTOR_ROOM,
  DOCTOR_SPEAKER_NAMES, DOCTOR_STETHOSCOPE, type DoctorLine,
} from '@/src/data/doctorVisitContent';
import type { Position } from '../types';

type Visit = {
  stage: 'intro' | 'pickup' | 'listen';
  introLine: 0 | 1;
  contactAt: number | null;
  heard: boolean;
};

const initialVisit: Visit = { stage: 'intro', introLine: 0, contactAt: null, heard: false };

function getLine(visit: Visit) {
  if (visit.stage === 'intro') return DOCTOR_INTRO[visit.introLine];
  return visit.heard && visit.contactAt === null ? DOCTOR_FEEDBACK : null;
}

type SpeechStatus = 'playing' | 'played' | 'text' | 'retry';
type LineSpeech = { line: DoctorLine; status: SpeechStatus };
type NarrationPlayback = { source: AudioBufferSourceNode | null; timeout: number };
type NarrationAssets = { controller: AbortController; clips: Map<string, Promise<AudioBuffer | null>> };

function playHeartbeat(context: AudioContext, elapsed: number) {
  const bus = context.createGain();
  bus.connect(context.destination);
  function beat(at: number) {
    for (const [delay, frequency, loudness] of [[0, 93, 0.23], [0.17, 74, 0.16]]) {
      const start = at + delay;
      if (start < context.currentTime) continue;
      const tone = context.createOscillator();
      const amplitude = context.createGain();
      tone.type = 'triangle';
      tone.frequency.setValueAtTime(frequency, start);
      tone.frequency.exponentialRampToValueAtTime(frequency * 0.68, start + 0.105);
      amplitude.gain.setValueAtTime(0.001, start);
      amplitude.gain.linearRampToValueAtTime(loudness, start + 0.018);
      amplitude.gain.exponentialRampToValueAtTime(0.001, start + 0.135);
      tone.connect(amplitude);
      amplitude.connect(bus);
      tone.start(start);
      tone.stop(start + 0.145);
    }
  }
  const period = DOCTOR_HEARTBEAT_MS / 1000;
  let nextBeat = context.currentTime + 0.025 - (elapsed % DOCTOR_HEARTBEAT_MS) / 1000;
  function schedule() {
    if (context.state !== 'running') return;
    if (nextBeat < context.currentTime - period) nextBeat = context.currentTime + 0.025;
    while (nextBeat <= context.currentTime + 0.18) {
      beat(nextBeat);
      nextBeat += period;
    }
  }
  schedule();
  const loop = window.setInterval(schedule, 75);
  return () => {
    window.clearInterval(loop);
    bus.disconnect();
  };
}

export function useDoctorVisit(active: boolean, speechEnabled: boolean) {
  const [visit, setVisit] = useState(initialVisit);
  const visitRef = useRef(visit);
  const tip = useRef<Position | null>(null);
  const audio = useRef<AudioContext | null>(null);
  const sound = useRef<(() => void) | null>(null);
  const audioSettings = useRef({ active, speechEnabled });
  const narrationAssets = useRef<NarrationAssets | null>(null);
  const speaking = useRef<NarrationPlayback | null>(null);
  const [lineSpeech, setLineSpeech] = useState<LineSpeech | null>(null);
  const lineSpeechRef = useRef<LineSpeech | null>(null);
  const motion = useRef<{ line: DoctorLine | null; start: number }>({ line: null, start: 0 });
  const line = getLine(visit);

  const update = useCallback((next: Visit) => {
    visitRef.current = next;
    setVisit(next);
  }, []);

  const showSpeech = useCallback((next: LineSpeech | null) => {
    lineSpeechRef.current = next;
    setLineSpeech(next);
  }, []);

  const stopVoice = useCallback(() => {
    const request = speaking.current;
    if (!request) return;
    speaking.current = null;
    window.clearTimeout(request.timeout);
    if (request.source) {
      request.source.onended = null;
      request.source.stop();
      request.source.disconnect();
    }
  }, []);

  const loadNarration = useCallback((context: AudioContext, line: DoctorLine) => {
    const assets = narrationAssets.current ??= { controller: new AbortController(), clips: new Map() };
    const cached = assets.clips.get(line.audioSrc);
    if (cached) return cached;

    const { signal } = assets.controller;
    const clip = fetch(line.audioSrc, { signal })
      .then(async (response) => {
        if (!response.ok) return null;
        const data = await response.arrayBuffer();
        return signal.aborted ? null : context.decodeAudioData(data);
      })
      .catch(() => null);
    assets.clips.set(line.audioSrc, clip);
    return clip;
  }, []);

  const stopHeartbeat = useCallback(() => {
    sound.current?.();
    sound.current = null;
  }, []);

  const startHeartbeat = useCallback(() => {
    const context = audio.current;
    const { active, speechEnabled } = audioSettings.current;
    const contactAt = visitRef.current.contactAt;
    if (!active || !speechEnabled || contactAt === null || context?.state !== 'running' || sound.current) return;
    sound.current = playHeartbeat(context, performance.now() - contactAt);
  }, []);

  const prepareAudio = useCallback(() => {
    if (typeof AudioContext === 'undefined') return null;
    try {
      const context = audio.current ??= new AudioContext();
      const ready = context.state === 'running'
        ? Promise.resolve(true)
        : context.resume().then(() => true, () => false);
      void ready.then((running) => { if (running) startHeartbeat(); });
      return { context, ready };
    } catch {
      return null;
    }
  }, [startHeartbeat]);

  const playLine = useCallback((spokenLine: DoctorLine) => {
    const output = prepareAudio();
    if (!output) {
      showSpeech({ line: spokenLine, status: 'text' });
      return;
    }

    showSpeech(null);
    const finish = (status: SpeechStatus) => {
      if (speaking.current !== request) return;
      stopVoice();
      showSpeech({ line: spokenLine, status });
    };
    const request: NarrationPlayback = {
      source: null,
      timeout: window.setTimeout(() => finish('retry'), 4000),
    };
    speaking.current = request;

    const { context, ready } = output;
    void Promise.all([ready, loadNarration(context, spokenLine)])
      .then(([running, buffer]) => {
        if (speaking.current !== request) return;
        if (!buffer) {
          finish('text');
          return;
        }
        if (!running || context.state !== 'running') {
          finish('retry');
          return;
        }
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        source.onended = () => finish('played');
        try {
          source.start();
        } catch {
          source.disconnect();
          finish('retry');
          return;
        }
        request.source = source;
        window.clearTimeout(request.timeout);
        showSpeech({ line: spokenLine, status: 'playing' });
      })
      .catch(() => finish('retry'));
  }, [loadNarration, prepareAudio, showSpeech, stopVoice]);

  const cancel = useCallback(() => {
    stopVoice();
    stopHeartbeat();
    narrationAssets.current?.controller.abort();
    narrationAssets.current = null;
    const context = audio.current;
    audio.current = null;
    if (context && context.state !== 'closed') void context.close().catch(() => {});
    tip.current = null;
  }, [stopHeartbeat, stopVoice]);

  useEffect(() => cancel, [cancel]);

  const begin = useCallback(() => {
    cancel();
    motion.current = { line: null, start: 0 };
    showSpeech(null);
    update(initialVisit);

    if (!audioSettings.current.speechEnabled) return;
    // VR gözlüğü etkileşimi sırasında ses çıkışını aç ve ilk replikleri hazırla.
    const output = prepareAudio();
    if (!output) return;
    for (const spokenLine of [...DOCTOR_INTRO, DOCTOR_FEEDBACK]) {
      void loadNarration(output.context, spokenLine);
    }
  }, [cancel, loadNarration, prepareAudio, showSpeech, update]);

  const pickUp = useCallback(() => {
    const current = visitRef.current;
    if (current.stage !== 'pickup') return;
    prepareAudio();
    update({ ...current, stage: 'listen' });
  }, [prepareAudio, update]);

  const moveTip = useCallback((point: Position | null) => {
    const current = visitRef.current;
    if (current.stage !== 'listen') return;
    tip.current = point;
    const { chest, contactRadius } = DOCTOR_STETHOSCOPE;
    const touches = point !== null && Math.hypot(point.x - chest.x, point.y - chest.y) <= contactRadius;
    if (touches === (current.contactAt !== null)) return;
    if (touches) stopVoice();
    else stopHeartbeat();
    update({ ...current, contactAt: touches ? performance.now() : null });
    if (touches) startHeartbeat();
  }, [startHeartbeat, stopHeartbeat, stopVoice, update]);

  useEffect(() => {
    audioSettings.current = { active, speechEnabled };
    if (!active) moveTip(null);
    if (active && speechEnabled) startHeartbeat();
    else stopHeartbeat();
  }, [active, moveTip, speechEnabled, startHeartbeat, stopHeartbeat]);

  useEffect(() => {
    if (!active || !speechEnabled || !line) return;
    const previous = lineSpeechRef.current;
    if (previous?.line !== line || previous.status === 'playing') playLine(line);
    return stopVoice;
  }, [active, line, playLine, speechEnabled, stopVoice]);

  const replay = () => {
    if (active && speechEnabled && line && !speaking.current) playLine(line);
  };

  const status = lineSpeech?.line === line ? lineSpeech.status : undefined;
  const reading = speechEnabled && line && (status === undefined || status === 'playing');
  const played = speechEnabled && status === 'played';
  useEffect(() => {
    if (!active || visit.stage !== 'intro' || reading) return;
    const timer = window.setTimeout(() => {
      if (visitRef.current !== visit) return;
      update(visit.introLine === 0 ? { ...visit, introLine: 1 } : { ...visit, stage: 'pickup' });
    }, played ? 0 : visit.introLine === 0 ? 3400 : 4000);
    return () => window.clearTimeout(timer);
  }, [active, played, reading, update, visit]);

  useEffect(() => {
    if (!active || visit.contactAt === null || visit.heard) return;
    const timer = window.setTimeout(() => {
      if (visitRef.current === visit) update({ ...visit, heard: true });
    }, Math.max(0, DOCTOR_LISTEN_MS - (performance.now() - visit.contactAt)));
    return () => window.clearTimeout(timer);
  }, [active, update, visit]);

  const read = useCallback(() => visitRef.current, []);
  const readAnimation = useCallback(() => {
    const current = visitRef.current;
    const currentLine = getLine(current);
    const status = lineSpeechRef.current;
    const caption = !audioSettings.current.speechEnabled || status?.line === currentLine ? currentLine : null;
    const now = performance.now();
    if (motion.current.line !== caption) motion.current = { line: caption, start: now };
    return {
      stage: current.stage,
      tip: tip.current,
      contactAt: current.contactAt,
      speaker: speaking.current?.source || now - motion.current.start < 1250 ? caption?.speaker : undefined,
      displaySpeaker: caption?.speaker,
    };
  }, []);

  return {
    begin, cancel, read, readAnimation, pickUp, moveTip, prepareAudio,
    bubble: !speechEnabled || status ? line : null,
    retrySpeech: speechEnabled && status === 'retry' ? replay : undefined,
    canPickUp: active && visit.stage === 'pickup',
    stage: visit.stage,
    isDialogOpen: visit.stage === 'intro',
    canUseTool: active && visit.stage === 'listen',
    contact: visit.contactAt !== null,
    heard: visit.heard,
  };
}

type VisitController = ReturnType<typeof useDoctorVisit>;
type ToolGesture = { kind: 'keyboard' } | { kind: 'pointer'; id: number; offset: Position };
const target = DOCTOR_STETHOSCOPE.chest;

function StethoscopeControl({ layerRef, canReach, prepareAudio, moveTip }: {
  layerRef: RefObject<HTMLDivElement | null>;
  canReach: () => boolean;
  prepareAudio: VisitController['prepareAudio'];
  moveTip: VisitController['moveTip'];
}) {
  const gesture = useRef<ToolGesture | null>(null);

  useEffect(() => {
    function release() {
      gesture.current = null;
      moveTip(null);
    }
    function keyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== 'e' || event.ctrlKey || event.metaKey || event.altKey || !canReach()) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.repeat || gesture.current) return;
      gesture.current = { kind: 'keyboard' };
      prepareAudio();
      moveTip(target);
    }
    function keyUp(event: KeyboardEvent) {
      if (event.key.toLowerCase() === 'e' && gesture.current?.kind === 'keyboard') release();
    }
    window.addEventListener('keydown', keyDown, true);
    window.addEventListener('keyup', keyUp, true);
    window.addEventListener('blur', release);
    document.addEventListener('visibilitychange', release);
    return () => {
      window.removeEventListener('keydown', keyDown, true);
      window.removeEventListener('keyup', keyUp, true);
      window.removeEventListener('blur', release);
      document.removeEventListener('visibilitychange', release);
      release();
    };
  }, [canReach, moveTip, prepareAudio]);

  function worldPoint(event: PointerEvent<HTMLButtonElement>): Position | null {
    const bounds = layerRef.current?.getBoundingClientRect();
    if (!bounds?.width || !bounds.height) return null;
    return {
      x: (event.clientX - bounds.left) * DOCTOR_ROOM.width / bounds.width,
      y: (event.clientY - bounds.top) * DOCTOR_ROOM.height / bounds.height,
    };
  }

  function grab(event: PointerEvent<HTMLButtonElement>, onChest: boolean) {
    if (event.button !== 0 || gesture.current || !canReach()) return;
    const point = worldPoint(event);
    if (!point) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const offset = onChest ? { x: target.x - point.x, y: target.y - point.y } : { x: 0, y: 0 };
    gesture.current = { kind: 'pointer', id: event.pointerId, offset };
    prepareAudio();
    moveTip(onChest ? target : point);
  }

  function move(event: PointerEvent<HTMLButtonElement>) {
    const current = gesture.current;
    if (current?.kind !== 'pointer' || current.id !== event.pointerId) return;
    const point = worldPoint(event);
    moveTip(point && canReach() ? { x: point.x + current.offset.x, y: point.y + current.offset.y } : null);
  }

  function releasePointer(event: PointerEvent<HTMLButtonElement>) {
    const current = gesture.current;
    if (current?.kind !== 'pointer' || current.id !== event.pointerId) return;
    gesture.current = null;
    moveTip(null);
  }

  const pointerHandlers = {
    onPointerMove: move, onPointerUp: releasePointer, onPointerCancel: releasePointer, onLostPointerCapture: releasePointer,
  };
  const hitArea = 'pointer-events-auto absolute size-11 -translate-x-1/2 -translate-y-1/2 touch-none rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-800';

  return (
    <div
      ref={layerRef}
      className="pointer-events-none invisible absolute left-0 top-0 z-10 origin-top-left"
      style={{ width: DOCTOR_ROOM.width, height: DOCTOR_ROOM.height }}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Stetoskobu sürükle"
        className={hitArea + ' cursor-grab active:cursor-grabbing'}
        style={{ left: 'var(--doctor-grip-x)', top: 'var(--doctor-grip-y)' }}
        onPointerDown={(event) => grab(event, false)}
        {...pointerHandlers}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label="Kalp sesini dinlemek için işareti basılı tut"
        className={hitArea + ' cursor-pointer'}
        style={{ left: target.x, top: target.y }}
        onPointerDown={(event) => grab(event, true)}
        {...pointerHandlers}
      />
    </div>
  );
}

export function DoctorVisitOverlay({ visit, bubbleRef, layerRef, canReach, onPickUp, showInstruction, onExit }: {
  visit: VisitController;
  bubbleRef: Ref<HTMLDivElement>;
  layerRef: RefObject<HTMLDivElement | null>;
  canReach: () => boolean;
  onPickUp: () => void;
  showInstruction: boolean;
  onExit: () => void;
}) {
  const line = visit.bubble;
  const instruction = visit.contact ? (visit.heard ? 'Kalbi dinledin. Şimdi stetoskobu çek.' : 'Temsilî kalp atışı')
    : visit.stage === 'listen' && !visit.heard ? 'Deniz’e yaklaş. Stetoskobu işarete sürükle ya da işareti veya E tuşunu basılı tut.'
      : null;

  return (
    <>
      {visit.canPickUp && (
        <div
          ref={layerRef}
          className="pointer-events-none invisible absolute left-0 top-0 z-10 origin-top-left"
          style={{ width: DOCTOR_ROOM.width, height: DOCTOR_ROOM.height }}
        >
          <button
            type="button"
            aria-label="Stetoskobu al"
            onClick={onPickUp}
            className="pointer-events-auto absolute h-[52px] w-[104px] -translate-x-1/2 -translate-y-1/2 touch-manipulation cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
            style={{ left: DOCTOR_STETHOSCOPE.counter.x, top: DOCTOR_STETHOSCOPE.counter.y }}
          />
        </div>
      )}
      {visit.canUseTool && (
        <StethoscopeControl layerRef={layerRef} canReach={canReach} prepareAudio={visit.prepareAudio} moveTip={visit.moveTip} />
      )}
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
          {visit.retrySpeech && (
            <button
              type="button"
              aria-label="Doktoru dinle"
              onClick={visit.retrySpeech}
              className="pointer-events-auto mt-1 inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-sky-800 hover:bg-sky-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
            >
              <Volume2 size={20} aria-hidden="true" />
            </button>
          )}
        </div>
      )}
      {instruction && showInstruction && (
        <p role="status" className="pointer-events-none absolute bottom-[10.75rem] left-3 z-20 max-w-[calc(100%-24px)] rounded-lg border border-sky-100 bg-white/95 px-3 py-2 text-sm font-semibold text-sky-950 shadow-sm sm:bottom-16 sm:left-5">
          {instruction}
        </p>
      )}
      {visit.heard && !visit.contact && (
        <button
          type="button"
          className="pointer-events-auto absolute bottom-[10.75rem] right-3 z-30 min-h-[44px] rounded-lg bg-sky-800 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-sky-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 sm:bottom-5 sm:right-5"
          onClick={onExit}
        >
          Sınıfa Dön
        </button>
      )}
    </>
  );
}
