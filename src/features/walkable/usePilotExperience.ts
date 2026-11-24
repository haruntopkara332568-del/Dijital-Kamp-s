import { useCallback, useEffect, useRef, useState } from 'react';
import { PILOT_PARTS, PILOT_WELCOME, type PilotLine } from '@/src/data/pilotExperienceContent';
import { getSpeechVoices, speakSegments, stopSpeaking } from '@/src/services/speech';
import { getPilotExperienceProgressKey } from '@/src/services/storage';
import type { SupportedGrade } from '@/src/types/campus';

export type PilotMilestone = 0 | 1 | 2 | 3 | 4;
type Progress = Partial<Record<SupportedGrade, PilotMilestone>>;
type ApronState = {
  profileId: string | null;
  grade: SupportedGrade;
  milestone: PilotMilestone;
  visited: number[];
  dialogue: 'greeting' | 'answer' | 'student' | 'briefing' | 'part' | null;
  part: number | null;
  boarding: boolean;
  hint: boolean;
};

const idle: ApronState = {
  profileId: null, grade: 3, milestone: 0, visited: [],
  dialogue: null, part: null, boarding: false, hint: false,
};

function readProgress(profileId: string | null): Progress {
  if (!profileId) return {};
  try {
    const value: unknown = JSON.parse(localStorage.getItem(getPilotExperienceProgressKey(profileId)) ?? '{}');
    if (!value || typeof value !== 'object') return {};
    const result: Progress = {};
    for (const grade of [2, 3, 4] as const) {
      const stage = (value as Record<string, unknown>)[grade];
      if (stage === 1 || stage === 2 || stage === 3 || stage === 4) result[grade] = stage;
    }
    return result;
  } catch {
    return {};
  }
}

const PITCH = { captain: 0.94, student: 1.16 } as const;

export function usePilotSpeech(active: boolean, enabled: boolean, line: PilotLine | null, studentGender: 'male' | 'female') {
  const speaker = line?.speaker;
  const phrase = line?.text;
  const key = phrase && speaker ? speaker + ':' + phrase : null;
  const [result, setResult] = useState<{ key: string; silent: boolean } | null>(null);
  const pending = useRef<{ controller: AbortController; running: boolean } | null>(null);
  const cancel = useCallback(() => {
    const request = pending.current;
    if (!request) return;
    pending.current = null;
    request.controller.abort();
    if (request.running) stopSpeaking();
  }, []);

  const reset = useCallback(() => {
    cancel();
    setResult(null);
  }, [cancel]);

  useEffect(() => {
    if (!active || !enabled || !key || !phrase || !speaker || result?.key === key) return;
    const controller = new AbortController();
    const request = { controller, running: false };
    pending.current = request;
    const { signal } = controller;
    void (async () => {
      let silent = true;
      try {
        const voices = await getSpeechVoices(signal);
        if (!voices?.['tr-TR'] || signal.aborted) return;
        const male = speaker === 'captain' || studentGender === 'male';
        const pattern = male ? /ahmet|tolga|burak|kerem|erkek|\bmale\b/i : /filiz|emel|seda|yelda|kadın|\bfemale\b/i;
        const preferred = window.speechSynthesis.getVoices().find((voice) => /^tr(?:[-_]|$)/i.test(voice.lang) && pattern.test(voice.name));
        request.running = true;
        const playback = await speakSegments([{ lang: 'tr-TR', text: phrase }], {
          queued: {
            voices: { ...voices, 'tr-TR': preferred ?? voices['tr-TR'] },
            signal,
            rates: { 'tr-TR': 0.93, 'en-US': 0.92 },
            pitch: PITCH[speaker],
            onTimeoutFallback: stopSpeaking,
          },
        });
        silent = !playback.spoken;
      } catch {
        // Türkçe ses yoksa öğrenci balondan okuyabilir.
      } finally {
        if (pending.current === request && !signal.aborted) {
          pending.current = null;
          setResult({ key, silent });
        }
      }
    })();
    return () => {
      if (pending.current === request) cancel();
    };
  }, [active, cancel, enabled, key, phrase, result?.key, speaker, studentGender]);

  return {
    reset,
    cancel,
    reading: Boolean(active && enabled && key && result?.key !== key),
    unavailable: Boolean(enabled && key && result?.key === key && result.silent),
  };
}

function caption(state: ApronState): PilotLine | null {
  switch (state.dialogue) {
    case 'greeting':
    case 'answer':
      return { speaker: 'captain', text: PILOT_WELCOME.opener };
    case 'student':
      return { speaker: 'student', text: PILOT_WELCOME.options[0] };
    case 'briefing':
      return { speaker: 'captain', text: PILOT_WELCOME.reply };
    case 'part': {
      const part = state.part === null ? undefined : PILOT_PARTS[state.part];
      return part ? { speaker: 'captain', text: part.explanation } : null;
    }
    default:
      return null;
  }
}

export function usePilotExperience(active: boolean, speechEnabled: boolean, studentGender: 'male' | 'female', profileId: string | null, grade: SupportedGrade) {
  const [state, setState] = useState(idle);
  const stateRef = useRef(state);
  const line = caption(state);
  const speech = usePilotSpeech(active && state.milestone === 0 && state.dialogue !== 'answer', speechEnabled, line, studentGender);
  const { reset, cancel } = speech;

  const update = useCallback((next: ApronState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const begin = useCallback((owner: string | null, level: SupportedGrade) => {
    reset();
    const milestone = readProgress(owner)[level] ?? 0;
    update({ ...idle, profileId: owner, grade: level, milestone, dialogue: milestone === 0 ? 'greeting' : null });
  }, [reset, update]);

  useEffect(() => {
    if (active && (state.profileId !== profileId || state.grade !== grade)) begin(profileId, grade);
  }, [active, begin, grade, profileId, state.grade, state.profileId]);

  const read = useCallback(() => stateRef.current, []);
  const readSpeaker = useCallback(() => {
    const current = stateRef.current;
    return caption(current)?.speaker;
  }, []);

  const openPart = useCallback((index: number) => {
    const current = stateRef.current;
    if (current.dialogue || current.boarding || current.visited.includes(index) || !PILOT_PARTS[index]) return;
    reset();
    update({ ...current, dialogue: 'part', part: index });
  }, [reset, update]);

  const boarding = useCallback(() => {
    const current = stateRef.current;
    if (current.visited.length !== PILOT_PARTS.length || current.dialogue || current.boarding) return false;
    update({ ...current, boarding: true });
    return true;
  }, [update]);

  const saveCheckpoint = useCallback((milestone: PilotMilestone) => {
    const current = stateRef.current;
    if (!current.profileId) return;
    try {
      const progress = readProgress(current.profileId);
      const saved = progress[current.grade] ?? 0;
      if (milestone > saved) {
        progress[current.grade] = milestone;
        localStorage.setItem(getPilotExperienceProgressKey(current.profileId), JSON.stringify(progress));
      }
    } catch {
      // Depolama bu cihazda kapalıysa uçuş açık kalır.
    }
  }, []);

  const enterCockpit = useCallback(() => {
    const current = stateRef.current;
    if (!current.boarding) return;
    saveCheckpoint(1);
    update({ ...current, boarding: false, milestone: 1 });
  }, [saveCheckpoint, update]);

  function advance() {
    const current = stateRef.current;
    if (speech.reading) return;
    switch (current.dialogue) {
      case 'greeting':
        update({ ...current, dialogue: 'answer' });
        break;
      case 'student':
        update({ ...current, dialogue: 'briefing' });
        break;
      case 'briefing':
        update({ ...current, dialogue: null });
        break;
      case 'part': {
        if (current.part === null) return;
        update({ ...current, visited: [...current.visited, current.part], dialogue: null, part: null });
        break;
      }
    }
  }

  function choose(index: number) {
    const current = stateRef.current;
    if (current.dialogue !== 'answer') return;
    update(index === 0 ? { ...current, dialogue: 'student', hint: false } : { ...current, hint: true });
  }

  return {
    state, line, begin, cancel, read, readSpeaker, openPart, boarding, enterCockpit, saveCheckpoint, advance, choose,
    reading: speech.reading, unavailable: speech.unavailable,
  };
}
