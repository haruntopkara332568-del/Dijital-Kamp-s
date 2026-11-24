// Boncuk sesi: “Tiny Dog Bark”, qubodup, CC0 — https://freesound.org/people/qubodup/sounds/813120/
import { useCallback, useEffect, useRef, useState } from 'react';
import { VET_DOG_WALK_MS, VET_SECTIONS, VET_TASK_TITLES, getVetTurns, type VetLine, type VetTurn } from '@/src/data/veterinaryClinicContent';
import { getSpeechVoices, speakSegments, stopSpeaking } from '@/src/services/speech';
import { getVeterinaryClinicProgressKey } from '@/src/services/storage';
import type { SupportedGrade } from '@/src/types/campus';

type SpokenTurn = VetLine | Extract<VetTurn, { kind: 'dog' }>;
type Visit = {
  profileId: string | null;
  grade: SupportedGrade;
  section: number;
  turns: readonly VetTurn[];
  turnIndex: number | null;
  reply?: VetLine;
  feedback?: string;
  careCount: number;
  dogMovedAt: number | null;
  dogObservedAt: number | null;
};

const idleVisit: Visit = {
  profileId: null,
  grade: 3,
  section: 0,
  turns: [],
  turnIndex: null,
  careCount: 0,
  dogMovedAt: null,
  dogObservedAt: null,
};

function readProgress(profileId: string | null): Partial<Record<SupportedGrade, number>> {
  if (!profileId) return {};
  try {
    const data: unknown = JSON.parse(localStorage.getItem(getVeterinaryClinicProgressKey(profileId)) ?? '{}');
    if (!data || typeof data !== 'object') return {};
    const completed: Partial<Record<SupportedGrade, number>> = {};
    for (const grade of [2, 3, 4] as const) {
      const value = (data as Record<string, unknown>)[grade];
      if (typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= VET_TASK_TITLES.length) {
        completed[grade] = value;
      }
    }
    return completed;
  } catch {
    return {};
  }
}

function saveProgress(profileId: string, grade: SupportedGrade, task: number) {
  try {
    const completed = readProgress(profileId);
    completed[grade] = Math.max(completed[grade] ?? 0, task);
    localStorage.setItem(getVeterinaryClinicProgressKey(profileId), JSON.stringify(completed));
  } catch {
    // Tarayıcı cihaz içi kaydı engellese de etkinlik tamamlanabilir.
  }
}

function getTurn(visit: Visit) {
  return visit.turnIndex === null ? undefined : visit.turns[visit.turnIndex];
}

function getSpokenTurn(visit: Visit): SpokenTurn | undefined {
  const turn = getTurn(visit);
  return visit.reply ?? (turn?.kind === 'line' || turn?.kind === 'dog' ? turn : undefined);
}

function getBubble(visit: Visit): SpokenTurn | undefined {
  const line = getSpokenTurn(visit);
  if (line || visit.turnIndex === null || getTurn(visit)?.kind !== 'choice') return line;
  const previous = visit.turns[visit.turnIndex - 1];
  return previous?.kind === 'line' ? previous : undefined;
}

const dogAudioUrl = '/assets/walkable/boncuk-bark.mp3';

function playBoncuk(signal: AbortSignal): Promise<void> {
  if (signal.aborted) return Promise.resolve();
  return new Promise((resolve) => {
    const sound = new Audio(dogAudioUrl);
    sound.volume = 0.24;
    const finish = () => {
      window.clearTimeout(timer);
      signal.removeEventListener('abort', finish);
      sound.onended = null;
      sound.onerror = null;
      sound.pause();
      resolve();
    };
    const timer = window.setTimeout(finish, 1350);
    signal.addEventListener('abort', finish, { once: true });
    sound.onended = finish;
    sound.onerror = finish;
    void sound.play().catch(finish);
  });
}

function turkishVoiceFor(gender: 'male' | 'female', fallback: SpeechSynthesisVoice) {
  const preferred = gender === 'male'
    ? /ahmet|tolga|burak|kerem|erkek|male(?!.*female)/i
    : /filiz|emel|seda|yelda|kadın|female/i;
  return window.speechSynthesis.getVoices().find((voice) =>
    /^tr(?:[-_]|$)/i.test(voice.lang) && preferred.test(voice.name),
  ) ?? fallback;
}

export function useVeterinaryClinicVisit(active: boolean, speechEnabled: boolean, studentGender: 'male' | 'female', profileId: string | null, profileGrade: SupportedGrade) {
  const [visit, setVisit] = useState(idleVisit);
  const visitRef = useRef(visit);
  const voiceRef = useRef<{ controller: AbortController; speaking: boolean } | null>(null);
  const [settled, setSettled] = useState<{ turn: SpokenTurn; unavailable: boolean } | null>(null);
  const [dogResting, setDogResting] = useState(false);
  const visualTalkRef = useRef<{ turn?: SpokenTurn; since: number }>({ since: 0 });
  const spokenTurn = getSpokenTurn(visit);

  const update = useCallback((next: Visit) => {
    visitRef.current = next;
    setVisit(next);
  }, []);

  const cancel = useCallback(() => {
    const voice = voiceRef.current;
    if (!voice) return;
    voiceRef.current = null;
    voice.controller.abort();
    if (voice.speaking) stopSpeaking();
  }, []);

  const begin = useCallback((owner: string | null, grade: SupportedGrade) => {
    cancel();
    setSettled(null);
    visualTalkRef.current = { since: 0 };
    const nextTask = readProgress(owner)[grade] ?? 0;
    const found = VET_SECTIONS.findIndex((section) => section.task === nextTask);
    const section = found < 0 ? VET_SECTIONS.length : found;
    const returnedAfterCare = nextTask >= 4;
    setDogResting(returnedAfterCare);
    update({
      profileId: owner,
      grade,
      section,
      turns: getVetTurns(section, grade),
      turnIndex: section === 0 ? 0 : null,
      careCount: returnedAfterCare ? 3 : 0,
      dogMovedAt: returnedAfterCare ? performance.now() - 12000 : null,
      dogObservedAt: null,
    });
  }, [cancel, update]);

  useEffect(() => {
    if (active && (visit.profileId !== profileId || visit.grade !== profileGrade)) {
      begin(profileId, profileGrade);
    }
  }, [active, begin, profileGrade, profileId, visit.grade, visit.profileId]);

  useEffect(() => {
    if (!active || visit.dogMovedAt === null || dogResting) return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const duration = reduced ? 0 : Math.max(0, VET_DOG_WALK_MS - (performance.now() - visit.dogMovedAt));
    const timer = window.setTimeout(() => setDogResting(true), duration);
    return () => window.clearTimeout(timer);
  }, [active, dogResting, visit.dogMovedAt]);

  const openStation = useCallback((section: number) => {
    const current = visitRef.current;
    if (current.section !== section || current.turnIndex !== null || !VET_SECTIONS[section]?.station) return;
    update({ ...current, turnIndex: 0, dogObservedAt: section === 1 ? performance.now() : current.dogObservedAt });
  }, [update]);

  const read = useCallback(() => visitRef.current, []);
  const readScene = useCallback(() => {
    const current = visitRef.current;
    const line = getSpokenTurn(current);
    const display = getBubble(current);
    const now = performance.now();
    if (visualTalkRef.current.turn !== line) visualTalkRef.current = { turn: line, since: now };
    const gestures = voiceRef.current?.speaking || now - visualTalkRef.current.since < 1250;
    return {
      station: current.turnIndex === null ? VET_SECTIONS[current.section]?.station : undefined,
      displaySpeaker: display?.kind === 'line' ? display.speaker : display ? 'dog' as const : undefined,
      talkingSpeaker: gestures && line?.kind === 'line' ? line.speaker : undefined,
      careCount: current.careCount,
      dogMovedAt: current.dogMovedAt,
      dogObservedAt: current.dogObservedAt,
    };
  }, []);

  useEffect(() => {
    if (!active || !spokenTurn || !speechEnabled || settled?.turn === spokenTurn) return;
    const controller = new AbortController();
    const request = { controller, speaking: false };
    voiceRef.current = request;
    const { signal } = controller;

    void (async () => {
      let unavailable = false;
      try {
        if (spokenTurn.kind === 'dog') {
          await playBoncuk(signal);
        } else {
          const voices = await getSpeechVoices(signal);
          if (signal.aborted) return;
          const fallback = voices?.['tr-TR'];
          if (!voices || !fallback) {
            unavailable = true;
            return;
          }
          const { speaker } = spokenTurn;
          const gender = speaker === 'father' ? 'male' : speaker === 'student' ? studentGender : 'female';
          request.speaking = true;
          const result = await speakSegments([{ lang: 'tr-TR', text: spokenTurn.text }], {
            queued: {
              signal,
              voices: { ...voices, 'tr-TR': turkishVoiceFor(gender, fallback) },
              rates: { 'tr-TR': 0.91, 'en-US': 0.92 },
              pitch: speaker === 'father' ? 0.87 : speaker === 'student' ? 1.19 : 1.03,
              onTimeoutFallback: stopSpeaking,
            },
          });
          unavailable = !result.spoken;
        }
      } catch {
        unavailable = spokenTurn.kind === 'line';
      } finally {
        if (voiceRef.current === request && !signal.aborted) {
          voiceRef.current = null;
          setSettled({ turn: spokenTurn, unavailable });
        }
      }
    })();

    return () => {
      if (voiceRef.current === request) cancel();
    };
  }, [active, cancel, settled?.turn, speechEnabled, spokenTurn, studentGender]);

  const speaking = active && speechEnabled && Boolean(spokenTurn) && settled?.turn !== spokenTurn;

  function advance() {
    const current = visitRef.current;
    if (speaking || current.turnIndex === null || current.profileId !== profileId || current.grade !== profileGrade) return;
    const turn = getTurn(current);
    if (turn?.kind === 'activity' && turn.activity === 'care' && !dogResting) return;
    const nextTurn = current.turnIndex + 1;
    if (nextTurn < current.turns.length) {
      update({ ...current, turnIndex: nextTurn, reply: undefined, feedback: undefined });
      return;
    }

    const section = current.section + 1;
    const task = VET_SECTIONS[section]?.task ?? VET_TASK_TITLES.length;
    if (current.profileId && task !== VET_SECTIONS[current.section]?.task) {
      saveProgress(current.profileId, current.grade, task);
    }
    update({
      ...current, section, turns: getVetTurns(section, current.grade), turnIndex: null, reply: undefined, feedback: undefined,
    });
  }

  function choose(index: number) {
    const current = visitRef.current;
    const turn = getTurn(current);
    if (turn?.kind !== 'choice' || current.reply || !turn.options[index]) return;
    if (index !== turn.answer) {
      update({ ...current, feedback: turn.hint });
      return;
    }
    update({ ...current, reply: { kind: 'line', speaker: 'student', text: turn.options[index] }, feedback: undefined });
  }

  function prepareCare(item: number) {
    const current = visitRef.current;
    const turn = getTurn(current);
    if (turn?.kind !== 'activity' || turn.activity !== 'care' || current.careCount !== item || item >= 3) return;
    update({ ...current, careCount: item + 1, dogMovedAt: item === 2 ? performance.now() : null });
  }

  const turn = getTurn(visit);
  return {
    begin, cancel, openStation, read, readScene,
    grade: visit.grade,
    section: visit.section,
    complete: visit.section >= VET_SECTIONS.length,
    dialogOpen: visit.turnIndex !== null,
    choice: turn?.kind === 'choice' && !visit.reply ? turn : undefined,
    activity: turn?.kind === 'activity' ? turn.activity : undefined,
    bubble: getBubble(visit),
    feedback: visit.feedback,
    speaking,
    voiceUnavailable: Boolean(speechEnabled && settled?.turn === spokenTurn && settled?.unavailable),
    careCount: visit.careCount,
    dogResting,
    advance, choose, prepareCare,
  };
}
