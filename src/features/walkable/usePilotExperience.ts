import { useCallback, useEffect, useRef, useState } from 'react';
import type { PilotLine } from '@/src/data/pilotExperienceContent';
import type { StudentCharacterId } from '@/src/data/studentCharacters';
import { getSpeechVoices, speakSegments, stopSpeaking } from '@/src/services/speech';
import { getPilotExperienceProgressKey } from '@/src/services/storage';
import type { SupportedGrade } from '@/src/types/campus';

export type PilotMilestone = 0 | 1 | 2 | 3 | 4;
type Progress = Partial<Record<SupportedGrade, PilotMilestone>>;
type ApronState = {
  profileId: string | null;
  grade: SupportedGrade;
  milestone: PilotMilestone;
  boarding: boolean;
};

const idle: ApronState = { profileId: null, grade: 3, milestone: 0, boarding: false };

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

type VoiceIdentity = 'captain' | StudentCharacterId;

// Sadece tarayıcının sunduğu, kimliği bilinen Türkçe sesler kullanılır.
const pilotVoices: Record<VoiceIdentity, { name: RegExp; pitch: number }> = {
  captain: { name: /\b(tolga|ahmet(?:neural)?)\b/i, pitch: 0.94 },
  ece: { name: /\b(emel(?:neural)?|tr-tr-(?:standard|wavenet)-a)\b/i, pitch: 1.25 },
  deniz: { name: /\b(aydın|aydin|tr-tr-(?:standard|wavenet)-b)\b/i, pitch: 1.18 },
  elif: { name: /\b(tr-tr-elif|tr-tr-(?:standard|wavenet)-c)\b/i, pitch: 1.21 },
  mert: { name: /\b(tr-tr-(?:standard|wavenet)-e)\b/i, pitch: 1.24 },
  zeynep: { name: /\b(filiz|yelda|tr-tr-(?:standard|wavenet)-d)\b/i, pitch: 1.29 },
  arda: { name: /\btr-tr-chirp3-hd-achird\b/i, pitch: 1.16 },
};

function assignPilotVoices(voices: SpeechSynthesisVoice[]) {
  const turkish = voices
    .filter((voice) => /^tr(?:[-_]|$)/i.test(voice.lang))
    .sort((a, b) => Number(b.localService) - Number(a.localService) || a.voiceURI.localeCompare(b.voiceURI));
  const used = new Set<string>();
  const assignments = new Map<VoiceIdentity, SpeechSynthesisVoice>();
  for (const identity of Object.keys(pilotVoices) as VoiceIdentity[]) {
    const match = turkish.find((voice) => {
      const key = voice.voiceURI || voice.name;
      return !used.has(key) && pilotVoices[identity].name.test(voice.name + ' ' + voice.voiceURI);
    });
    if (match) {
      assignments.set(identity, match);
      used.add(match.voiceURI || match.name);
    }
  }
  return assignments;
}

export function usePilotSpeech(active: boolean, enabled: boolean, line: PilotLine, characterId?: StudentCharacterId) {
  const { speaker, text: phrase } = line;
  const identity = speaker === 'captain' ? 'captain' : characterId;
  const key = speaker + ':' + (identity ?? '') + ':' + phrase;
  const voices = useRef<ReturnType<typeof assignPilotVoices> | null>(null);
  const [result, setResult] = useState<{ key: string; played: boolean } | null>(null);

  useEffect(() => {
    if (!active || !enabled || result?.key === key) return;
    const controller = new AbortController();
    const { signal } = controller;
    let running = false;
    void (async () => {
      let played = false;
      try {
        if (!identity) return;
        if (!voices.current) {
          const available = await getSpeechVoices(signal);
          if (!available || signal.aborted) return;
          voices.current = assignPilotVoices(window.speechSynthesis.getVoices());
        }
        const voice = voices.current.get(identity);
        if (!voice || signal.aborted) return;

        let timedOut = false;
        running = true;
        const playback = await speakSegments([{ lang: 'tr-TR', text: phrase }], {
          queued: {
            voices: { 'en-US': null, 'tr-TR': voice },
            signal,
            rates: { 'tr-TR': 0.93, 'en-US': 0.92 },
            pitch: pilotVoices[identity].pitch,
            onTimeoutFallback: () => {
              timedOut = true;
              stopSpeaking();
            },
          },
        });
        played = playback.spoken && !timedOut;
      } catch {
        // Konuşma balonu seslendirme olmadan da kullanılabilir.
      } finally {
        running = false;
        if (!signal.aborted) setResult({ key, played });
      }
    })();
    return () => {
      controller.abort();
      if (running) stopSpeaking();
    };
  }, [active, enabled, identity, key, phrase, result?.key]);

  return {
    reading: active && enabled && result?.key !== key,
    played: enabled && result?.key === key && result.played,
  };
}

export function usePilotExperience(active: boolean, profileId: string | null, grade: SupportedGrade) {
  const [state, setState] = useState(idle);
  const stateRef = useRef(state);

  const update = useCallback((next: ApronState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const begin = useCallback((owner: string | null, level: SupportedGrade) => {
    const milestone = readProgress(owner)[level] ?? 0;
    update({ ...idle, profileId: owner, grade: level, milestone });
  }, [update]);

  useEffect(() => {
    if (active && (state.profileId !== profileId || state.grade !== grade)) begin(profileId, grade);
  }, [active, begin, grade, profileId, state.grade, state.profileId]);

  const boarding = useCallback(() => {
    const current = stateRef.current;
    if (current.milestone !== 0) return false;
    if (!current.boarding) update({ ...current, boarding: true });
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

  return { state, begin, boarding, enterCockpit, saveCheckpoint };
}
