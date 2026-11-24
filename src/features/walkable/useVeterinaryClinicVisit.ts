import { useCallback, useEffect, useRef, useState } from 'react';
import { VET_CLOSING, VET_DOG_REDUCED_REST_MS, VET_DOG_REST_MS, VET_INTRO, VET_REMAINING_ITEM, type VetCareItemId, type VetLine } from '@/src/data/veterinaryClinicContent';
import { getVeterinaryClinicProgressKey } from '@/src/services/storage';
import type { SupportedGrade } from '@/src/types/campus';
import type { Position } from './types';

type Visit = {
  profileId: string | null;
  grade: SupportedGrade;
  phase: 'intro' | 'care' | 'settling' | 'closing' | 'complete';
  introLine: 0 | 1;
  placed: Record<VetCareItemId, boolean>;
  dogMovedAt: number | null;
};

const idleVisit: Visit = {
  profileId: null,
  grade: 3,
  phase: 'intro',
  introLine: 0,
  placed: { mat: false, water: false },
  dogMovedAt: null,
};

function saveCareComplete(profileId: string | null, grade: SupportedGrade) {
  if (!profileId) return;
  try {
    const key = getVeterinaryClinicProgressKey(profileId);
    const stored: unknown = JSON.parse(localStorage.getItem(key) ?? '{}');
    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return;
    const progress = stored as Record<string, unknown>;
    // Önceki veteriner deneyiminde 5, tamamlanmış ziyaret anlamına gelir.
    const saved = progress[grade];
    if (typeof saved === 'number' && saved >= 5) return;
    localStorage.setItem(key, JSON.stringify({ ...progress, [grade]: 5 }));
  } catch {
    // Cihaz içi kayıt kapalıysa bakım deneyimi yine tamamlanır.
  }
}

function getLine(visit: Visit): VetLine | null {
  if (visit.phase === 'intro') return VET_INTRO[visit.introLine];
  if (visit.phase === 'care' && visit.placed.mat !== visit.placed.water) {
    return VET_REMAINING_ITEM[visit.placed.mat ? 'water' : 'mat'];
  }
  return visit.phase === 'closing' || visit.phase === 'complete' ? VET_CLOSING : null;
}

type NarrationStatus = 'playing' | 'played' | 'text';
type Narration = { line: VetLine; status: NarrationStatus };
type Playback = { source: AudioBufferSourceNode | null; timeout: number };
type VoiceAudio = {
  context: AudioContext;
  controller: AbortController;
  clips: Map<VetLine, Promise<AudioBuffer | null>>;
};

function loadClip(audio: VoiceAudio, line: VetLine) {
  const cached = audio.clips.get(line);
  if (cached) return cached;

  const { signal } = audio.controller;
  const clip = fetch(line.audioSrc, { signal })
    .then(async (response) => {
      if (!response.ok) return null;
      const data = await response.arrayBuffer();
      return signal.aborted ? null : audio.context.decodeAudioData(data);
    })
    .catch(() => null);
  audio.clips.set(line, clip);
  return clip;
}

export function useVeterinaryClinicVisit(
  active: boolean, speechEnabled: boolean, profileId: string | null, profileGrade: SupportedGrade,
) {
  const [visit, setVisit] = useState(idleVisit);
  const visitRef = useRef(visit);
  const dragging = useRef<{ item: VetCareItemId; position: Position } | null>(null);
  const audio = useRef<VoiceAudio | null>(null);
  const speaking = useRef<Playback | null>(null);
  const [narration, setNarration] = useState<Narration | null>(null);
  const narrationRef = useRef<Narration | null>(null);
  const speechEnabledRef = useRef(speechEnabled);
  const visualTalk = useRef<{ line: VetLine | null; since: number }>({ line: null, since: 0 });
  const line = getLine(visit);

  const update = useCallback((next: Visit) => {
    visitRef.current = next;
    setVisit(next);
  }, []);

  const showNarration = useCallback((next: Narration | null) => {
    narrationRef.current = next;
    setNarration(next);
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

  const openAudio = useCallback(() => {
    if (typeof AudioContext === 'undefined') return null;
    try {
      const output = audio.current ??= { context: new AudioContext(), controller: new AbortController(), clips: new Map() };
      const ready = output.context.state === 'running'
        ? Promise.resolve(true)
        : output.context.resume().then(() => true, () => false);
      return { output, ready };
    } catch {
      return null;
    }
  }, []);

  const prepareVoice = useCallback(() => {
    const session = openAudio();
    if (!session) return;
    for (const spokenLine of [...VET_INTRO, ...Object.values(VET_REMAINING_ITEM), VET_CLOSING]) {
      void loadClip(session.output, spokenLine);
    }
  }, [openAudio]);

  const cancel = useCallback(() => {
    stopVoice();
    const output = audio.current;
    audio.current = null;
    if (!output) return;
    output.controller.abort();
    if (output.context.state !== 'closed') void output.context.close().catch(() => {});
  }, [stopVoice]);

  useEffect(() => cancel, [cancel]);

  const begin = useCallback((owner: string | null, grade: SupportedGrade) => {
    stopVoice();
    dragging.current = null;
    visualTalk.current = { line: null, since: 0 };
    showNarration(null);
    update({ ...idleVisit, profileId: owner, grade });
  }, [showNarration, stopVoice, update]);

  useEffect(() => {
    if (active && (visit.profileId !== profileId || visit.grade !== profileGrade)) begin(profileId, profileGrade);
  }, [active, begin, profileGrade, profileId, visit.grade, visit.profileId]);

  useEffect(() => {
    speechEnabledRef.current = speechEnabled;
  }, [speechEnabled]);

  const isComplete = visit.phase === 'complete';
  useEffect(() => {
    if (!active || !speechEnabled || !line || isComplete) return;
    const current = narrationRef.current;
    if (current?.line === line && current.status !== 'playing') return;
    const session = openAudio();
    if (!session) {
      showNarration({ line, status: 'text' });
      return;
    }

    showNarration(null);
    const finish = (status: NarrationStatus) => {
      if (speaking.current !== request) return;
      stopVoice();
      showNarration({ line, status });
    };
    const request: Playback = { source: null, timeout: window.setTimeout(() => finish('text'), 4000) };
    speaking.current = request;

    const { context } = session.output;
    void Promise.all([session.ready, loadClip(session.output, line)])
      .then(([running, buffer]) => {
        if (speaking.current !== request) return;
        if (!running || !buffer || context.state !== 'running') {
          finish('text');
          return;
        }
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        source.onended = () => {
          source.disconnect();
          request.source = null;
          finish('played');
        };
        try {
          source.start();
        } catch {
          source.disconnect();
          finish('text');
          return;
        }
        request.source = source;
        window.clearTimeout(request.timeout);
        showNarration({ line, status: 'playing' });
      })
      .catch(() => finish('text'));

    return stopVoice;
  }, [active, isComplete, line, openAudio, showNarration, speechEnabled, stopVoice]);

  const status = narration?.line === line ? narration.status : undefined;
  const reading = speechEnabled && line && (status === undefined || status === 'playing');
  const played = speechEnabled && status === 'played';
  useEffect(() => {
    if (!active || reading || (visit.phase !== 'intro' && visit.phase !== 'closing')) return;
    const duration = played ? 0 : visit.phase === 'closing' ? 3850 : 3400;
    const timer = window.setTimeout(() => {
      if (visitRef.current !== visit) return;
      if (visit.phase === 'closing') update({ ...visit, phase: 'complete' });
      else if (visit.introLine === 0) update({ ...visit, introLine: 1 });
      else update({ ...visit, phase: 'care' });
    }, duration);
    return () => window.clearTimeout(timer);
  }, [active, played, reading, update, visit]);

  useEffect(() => {
    if (!active || visit.phase !== 'settling' || visit.dogMovedAt === null) return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const restTime = reduced ? VET_DOG_REDUCED_REST_MS : VET_DOG_REST_MS;
    const timer = window.setTimeout(() => {
      if (visitRef.current !== visit) return;
      saveCareComplete(visit.profileId, visit.grade);
      update({ ...visit, phase: 'closing' });
    }, Math.max(0, restTime - (performance.now() - visit.dogMovedAt)));
    return () => window.clearTimeout(timer);
  }, [active, update, visit]);

  const dragItem = useCallback((item: VetCareItemId, position: Position | null) => {
    const current = visitRef.current;
    dragging.current = position && current.phase === 'care' && !current.placed[item] ? { item, position } : null;
  }, []);

  const placeItem = useCallback((item: VetCareItemId) => {
    const current = visitRef.current;
    if (current.phase !== 'care' || current.placed[item]) return;
    dragging.current = null;
    const placed = { ...current.placed, [item]: true };
    update(placed.mat && placed.water
      ? { ...current, placed, phase: 'settling', dogMovedAt: performance.now() }
      : { ...current, placed });
  }, [update]);

  const readScene = useCallback(() => {
    const current = visitRef.current;
    const currentLine = getLine(current);
    const caption = !speechEnabledRef.current || current.phase === 'complete' || narrationRef.current?.line === currentLine
      ? currentLine : null;
    const now = performance.now();
    if (visualTalk.current.line !== caption) visualTalk.current = { line: caption, since: now };
    return {
      phase: current.phase,
      placed: current.placed,
      dragging: dragging.current,
      dogMovedAt: current.dogMovedAt,
      displaySpeaker: caption?.speaker,
      talkingSpeaker: speaking.current?.source || now - visualTalk.current.since < 1250 ? caption?.speaker : undefined,
    };
  }, []);

  return {
    begin, cancel, prepareVoice, readScene, dragItem, placeItem,
    phase: visit.phase,
    placed: visit.placed,
    bubble: !speechEnabled || isComplete || status ? line : null,
    dialogOpen: visit.phase === 'intro',
    canCare: active && visit.phase === 'care',
  };
}
