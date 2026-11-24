import { useCallback, useEffect, useRef, useState } from 'react';
import { VET_CLOSING, VET_DOG_REDUCED_REST_MS, VET_DOG_REST_MS, VET_INTRO, VET_REMAINING_ITEM, type VetCareItemId, type VetLine } from '@/src/data/veterinaryClinicContent';
import type { StudentCharacterId } from '@/src/data/studentCharacters';
import { getSpeechVoices, speakSegments, stopSpeaking } from '@/src/services/speech';
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

type VoiceIdentity = 'veterinarian' | 'father' | StudentCharacterId;
const voiceProfiles: Record<VoiceIdentity, { name: RegExp; pitch: number }> = {
  veterinarian: { name: /\b(emel(?:neural)?|yelda|filiz)\b/i, pitch: 1 },
  father: { name: /\b(tolga|ahmet(?:neural)?)\b/i, pitch: 0.92 },
  ece: { name: /\btr-tr-(?:standard|wavenet)-a\b/i, pitch: 1.25 },
  deniz: { name: /\b(aydın|aydin|tr-tr-(?:standard|wavenet)-b)\b/i, pitch: 1.18 },
  elif: { name: /\b(elif|tr-tr-(?:standard|wavenet)-c)\b/i, pitch: 1.21 },
  mert: { name: /\btr-tr-(?:standard|wavenet)-e\b/i, pitch: 1.24 },
  zeynep: { name: /\btr-tr-(?:standard|wavenet)-d\b/i, pitch: 1.29 },
  arda: { name: /\btr-tr-chirp3-hd-achird\b/i, pitch: 1.16 },
};

function assignVoices(voices: SpeechSynthesisVoice[]) {
  const turkish = voices
    .filter((voice) => /^tr(?:[-_]|$)/i.test(voice.lang))
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

export function useVeterinaryClinicVisit(
  active: boolean, speechEnabled: boolean, characterId: StudentCharacterId | undefined,
  profileId: string | null, profileGrade: SupportedGrade,
) {
  const [visit, setVisit] = useState(idleVisit);
  const visitRef = useRef(visit);
  const dragging = useRef<{ item: VetCareItemId; position: Position } | null>(null);
  const voices = useRef<ReturnType<typeof assignVoices> | null>(null);
  const speaking = useRef<{ controller: AbortController; started: boolean } | null>(null);
  const [settled, setSettled] = useState<{ line: VetLine; played: boolean } | null>(null);
  const visualTalk = useRef<{ line: VetLine | null; since: number }>({ line: null, since: 0 });
  const line = getLine(visit);

  const update = useCallback((next: Visit) => {
    visitRef.current = next;
    setVisit(next);
  }, []);

  const cancel = useCallback(() => {
    const request = speaking.current;
    if (!request) return;
    speaking.current = null;
    request.controller.abort();
    if (request.started) stopSpeaking();
  }, []);

  const begin = useCallback((owner: string | null, grade: SupportedGrade) => {
    cancel();
    dragging.current = null;
    voices.current = null;
    visualTalk.current = { line: null, since: 0 };
    setSettled(null);
    update({ ...idleVisit, profileId: owner, grade });
  }, [cancel, update]);

  useEffect(() => {
    if (active && (visit.profileId !== profileId || visit.grade !== profileGrade)) begin(profileId, profileGrade);
  }, [active, begin, profileGrade, profileId, visit.grade, visit.profileId]);

  useEffect(() => {
    if (!active || !speechEnabled || !line || visit.phase === 'complete' || settled?.line === line) return;
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
          voices.current = assignVoices(window.speechSynthesis.getVoices());
        }
        const voice = voices.current.get(identity);
        if (!voice || signal.aborted) return;

        let timedOut = false;
        request.started = true;
        const result = await speakSegments([{ lang: 'tr-TR', text: line.text }], {
          queued: {
            voices: { 'tr-TR': voice, 'en-US': null },
            signal,
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
        // Uygun ses bulunmadığında yalnızca konuşma balonu kullanılır.
      } finally {
        if (speaking.current === request && !signal.aborted) {
          speaking.current = null;
          setSettled({ line, played });
        }
      }
    })();
    return () => {
      if (speaking.current === request) cancel();
    };
  }, [active, cancel, characterId, line, settled?.line, speechEnabled, visit.phase]);

  const reading = speechEnabled && line && settled?.line !== line;
  const played = speechEnabled && settled?.line === line && settled?.played;
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
    const caption = getLine(current);
    const now = performance.now();
    if (visualTalk.current.line !== caption) visualTalk.current = { line: caption, since: now };
    return {
      phase: current.phase,
      placed: current.placed,
      dragging: dragging.current,
      dogMovedAt: current.dogMovedAt,
      displaySpeaker: caption?.speaker,
      talkingSpeaker: speaking.current?.started || now - visualTalk.current.since < 1250 ? caption?.speaker : undefined,
    };
  }, []);

  return {
    begin, cancel, readScene, dragItem, placeItem,
    phase: visit.phase,
    placed: visit.placed,
    bubble: line,
    dialogOpen: visit.phase === 'intro',
    canCare: active && visit.phase === 'care',
  };
}
