import { useCallback, useEffect, useRef, useState, type PointerEvent, type Ref, type RefObject } from 'react';
import {
  DOCTOR_FEEDBACK, DOCTOR_HEARTBEAT_MS, DOCTOR_INTRO, DOCTOR_LISTEN_MS, DOCTOR_ROOM,
  DOCTOR_SPEAKER_NAMES, DOCTOR_STETHOSCOPE, type DoctorLine,
} from '@/src/data/doctorVisitContent';
import type { StudentCharacterId } from '@/src/data/studentCharacters';
import { getSpeechVoices, speakSegments, stopSpeaking } from '@/src/services/speech';
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

type VoiceIdentity = 'guide' | 'patient' | StudentCharacterId;
const voiceProfiles: Record<VoiceIdentity, { name: RegExp; pitch: number }> = {
  guide: { name: /\b(emel(?:neural)?|yelda|filiz)\b/i, pitch: 1 },
  patient: { name: /\bboy\b|\b(?:male|erkek)[ -](?:child|çocuk)\b|\b(?:child|çocuk)[ -](?:male|erkek)\b/i, pitch: 1 },
  ece: { name: /\btr-tr-(?:standard|wavenet)-a\b/i, pitch: 1.25 },
  deniz: { name: /\b(aydın|aydin|tr-tr-(?:standard|wavenet)-b)\b/i, pitch: 1.18 },
  elif: { name: /\b(elif|tr-tr-(?:standard|wavenet)-c)\b/i, pitch: 1.21 },
  mert: { name: /\btr-tr-(?:standard|wavenet)-e\b/i, pitch: 1.24 },
  zeynep: { name: /\btr-tr-(?:standard|wavenet)-d\b/i, pitch: 1.29 },
  arda: { name: /\btr-tr-chirp3-hd-achird\b/i, pitch: 1.16 },
};

function assignDoctorVoices(voices: SpeechSynthesisVoice[]) {
  const turkish = voices.filter((voice) => /^tr(?:[-_]|$)/i.test(voice.lang))
    .sort((first, second) => Number(second.localService) - Number(first.localService) || first.voiceURI.localeCompare(second.voiceURI));
  const used = new Set<string>();
  const assignments = new Map<VoiceIdentity, SpeechSynthesisVoice>();
  for (const identity of Object.keys(voiceProfiles) as VoiceIdentity[]) {
    const voice = turkish.find((candidate) =>
      !used.has(candidate.voiceURI || candidate.name) && voiceProfiles[identity].name.test(candidate.name + ' ' + candidate.voiceURI),
    );
    if (voice) {
      assignments.set(identity, voice);
      used.add(voice.voiceURI || voice.name);
    }
  }
  return assignments;
}

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

export function useDoctorVisit(active: boolean, speechEnabled: boolean, characterId?: StudentCharacterId) {
  const [visit, setVisit] = useState(initialVisit);
  const visitRef = useRef(visit);
  const tip = useRef<Position | null>(null);
  const audio = useRef<AudioContext | null>(null);
  const sound = useRef<(() => void) | null>(null);
  const audioSettings = useRef({ active, speechEnabled });
  const voices = useRef<ReturnType<typeof assignDoctorVoices> | null>(null);
  const speaking = useRef<{ controller: AbortController; started: boolean } | null>(null);
  const [settled, setSettled] = useState<{ line: DoctorLine; played: boolean } | null>(null);
  const motion = useRef<{ line: DoctorLine | null; start: number }>({ line: null, start: 0 });
  const line = getLine(visit);

  const update = useCallback((next: Visit) => {
    visitRef.current = next;
    setVisit(next);
  }, []);

  const stopVoice = useCallback(() => {
    const request = speaking.current;
    if (!request) return;
    speaking.current = null;
    request.controller.abort();
    if (request.started) stopSpeaking();
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
    if (typeof AudioContext === 'undefined') return;
    try {
      audio.current ??= new AudioContext();
      if (audio.current.state !== 'running') void audio.current.resume().then(startHeartbeat).catch(() => {});
      else startHeartbeat();
    } catch {
      // Temsili kalp animasyonu ses desteği olmadan da çalışır.
    }
  }, [startHeartbeat]);

  const cancel = useCallback(() => {
    stopVoice();
    stopHeartbeat();
    const context = audio.current;
    audio.current = null;
    if (context && context.state !== 'closed') void context.close().catch(() => {});
    tip.current = null;
  }, [stopHeartbeat, stopVoice]);

  useEffect(() => cancel, [cancel]);

  const begin = useCallback(() => {
    cancel();
    voices.current = null;
    motion.current = { line: null, start: 0 };
    setSettled(null);
    update(initialVisit);
  }, [cancel, update]);

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
    if (!active || !speechEnabled || !line || settled?.line === line) return;
    const request = { controller: new AbortController(), started: false };
    speaking.current = request;
    const { signal } = request.controller;
    void (async () => {
      let played = false;
      try {
        const identity = line.speaker === 'student' ? characterId : line.speaker;
        if (!identity) return;
        if (!voices.current) {
          const available = await getSpeechVoices(signal);
          if (!available || signal.aborted) return;
          voices.current = assignDoctorVoices(window.speechSynthesis.getVoices());
        }
        const voice = voices.current.get(identity);
        if (!voice || signal.aborted) return;
        let timedOut = false;
        request.started = true;
        const result = await speakSegments([{ text: line.text, lang: 'tr-TR' }], {
          queued: {
            signal,
            voices: { 'tr-TR': voice, 'en-US': null },
            rates: { 'tr-TR': 0.93, 'en-US': 0.92 },
            pitch: voiceProfiles[identity].pitch,
            onTimeoutFallback: () => {
              timedOut = true;
              stopSpeaking();
            },
          },
        });
        played = result.spoken && !timedOut;
      } catch {
        // Uygun ses yoksa konuşma balonu gösterilir.
      } finally {
        if (speaking.current === request && !signal.aborted) {
          speaking.current = null;
          setSettled({ line, played });
        }
      }
    })();
    return () => {
      if (speaking.current === request) stopVoice();
    };
  }, [active, characterId, line, settled?.line, speechEnabled, stopVoice]);

  const reading = speechEnabled && line && settled?.line !== line;
  const played = speechEnabled && settled?.line === line && settled?.played;
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
    const caption = getLine(current);
    const now = performance.now();
    if (motion.current.line !== caption) motion.current = { line: caption, start: now };
    return {
      stage: current.stage,
      tip: tip.current,
      contactAt: current.contactAt,
      speaker: speaking.current?.started || now - motion.current.start < 1250 ? caption?.speaker : undefined,
      displaySpeaker: caption?.speaker,
    };
  }, []);

  return {
    begin, cancel, read, readAnimation, pickUp, moveTip, prepareAudio,
    bubble: line,
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

export function DoctorVisitOverlay({ visit, bubbleRef, layerRef, canReach, showInstruction, onExit }: {
  visit: VisitController;
  bubbleRef: Ref<HTMLDivElement>;
  layerRef: RefObject<HTMLDivElement | null>;
  canReach: () => boolean;
  showInstruction: boolean;
  onExit: () => void;
}) {
  const line = visit.bubble;
  const instruction = visit.stage === 'pickup' ? 'Sol tezgahtaki stetoskoba yaklaş.'
    : visit.contact ? (visit.heard ? 'Kalbi dinledin. Şimdi stetoskobu çek.' : 'Temsilî kalp atışı')
      : visit.stage === 'listen' && !visit.heard ? 'Deniz’e yaklaş. Stetoskobu işarete sürükle ya da işareti veya E tuşunu basılı tut.'
        : null;

  return (
    <>
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
