import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useOptionalCampus } from '@/src/app/CampusProviders';
import { GRADE_3_STAGE_4 as lesson } from '@/src/data/grade3Stage4Content';
import { getEnglishNameSpeech, splitForSpeech } from '@/src/services/englishNameSpeech';
import { completeGrade3StageFourTable, loadGrade3StageFourProgress, type SultanhanıCard } from '@/src/services/grade3Stage4Progress';
import { getSpeechVoices, speakSegments, stopSpeaking, type QueuedSpeech } from '@/src/services/speech';
import type { MissionStageId } from '@/src/types/campus';
import {
  DiscoverStageFour, LearnStageFour, ProduceStageFour, stageFourButton, type StageFourListen,
} from './Grade3StageFourActivities';
import { ShareStageFour } from './Grade3StageFourShare';

export const GRADE_3_STAGE_FOUR_TABLES = {
  '4:kesfet': DiscoverStageFour,
  '4:ogren': LearnStageFour,
  '4:uret': ProduceStageFour,
  '4:paylas': ShareStageFour,
} satisfies Record<`4:${MissionStageId}`, React.ComponentType<{
  listen: StageFourListen;
  finish: (recipe?: SultanhanıCard) => void;
  card?: SultanhanıCard;
  completed: boolean;
}>>;

const order: MissionStageId[] = ['kesfet', 'ogren', 'uret', 'paylas'];
const knownMaleVoice = /\b(?:daniel|david|mark|tolga|male)\b/i;
const availableTurkishVoice = /yelda|emel|google türkçe/i;

class StageFourBoundary extends Component<{ children: ReactNode; returnToMenu: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="space-y-3">
        <p>{lesson.error}</p>
        <button type="button" className={stageFourButton} onClick={this.props.returnToMenu}>{lesson.menu}</button>
      </div>
    );
  }
}

async function playPhrase(text: string, queued: QueuedSpeech) {
  const parts = splitForSpeech(text, ['Sultanhanı']);
  const valid = parts.map((part) => part.text).join('') === text;
  if (valid && queued.voices['tr-TR'] && parts[0]?.lang === 'en' && parts.some((part) => part.lang === 'tr')) {
    for (const part of parts) {
      if (queued.signal.aborted) return false;
      const { spoken } = await speakSegments([{ text: part.text, lang: part.lang === 'en' ? 'en-US' : 'tr-TR' }], { queued });
      if (!spoken) {
        return (await speakSegments([getEnglishNameSpeech(text)], { queued })).spoken;
      }
    }
    return true;
  }

  return (await speakSegments([getEnglishNameSpeech(text)], { queued })).spoken;
}

export function Grade3StageFourView({ entryTable, onClose }: { entryTable: MissionStageId; onClose: () => void }) {
  const campus = useOptionalCampus();
  const profileId = campus?.activeProfile?.id ?? null;
  const speechEnabled = campus?.state.speechEnabled ?? true;
  const [progress, setProgress] = useState(() => loadGrade3StageFourProgress(profileId));
  const [notice, setNotice] = useState('');
  const request = useRef<AbortController | null>(null);
  const tableIndex = order.indexOf(entryTable);
  const Activity = GRADE_3_STAGE_FOUR_TABLES[`4:${entryTable}`];
  const locked = tableIndex > 0 && !progress.completed[order[tableIndex - 1]];

  const cancelSpeech = useCallback(() => {
    if (!request.current) return;
    request.current.abort();
    request.current = null;
    stopSpeaking();
  }, []);
  useEffect(() => cancelSpeech, [cancelSpeech]);
  useEffect(() => { if (!speechEnabled) cancelSpeech(); }, [cancelSpeech, speechEnabled]);
  useEffect(() => {
    if (!Activity) console.error('4. aşama masa kaydı bulunamadı', entryTable);
  }, [Activity, entryTable]);

  const listen: StageFourListen = (text) => {
    cancelSpeech();
    if (!speechEnabled) { setNotice(lesson.audioUnavailable); return; }
    setNotice('');
    const generationId = new AbortController();
    request.current = generationId;
    const { signal } = generationId;
    const current = () => request.current === generationId && !signal.aborted;
    void (async () => {
      try {
        const voices = await getSpeechVoices(signal);
        if (!current()) return;
        const english = voices?.['en-US'];
        const turkish = voices?.['tr-TR'];
        if (!english || knownMaleVoice.test(english.name)) {
          setNotice(lesson.audioUnavailable);
          return;
        }
        const spoken = await playPhrase(text, {
          signal,
          voices: {
            'en-US': english,
            'tr-TR': turkish && !knownMaleVoice.test(turkish.name) && availableTurkishVoice.test(turkish.name) ? turkish : null,
          },
          rates: { 'en-US': 0.85, 'tr-TR': 0.9 },
          timeoutMs: (phrase) => Math.max(1200, phrase.trim().split(/\s+/).length * 550) * 1.5,
          onTimeoutFallback: () => {},
        });
        if (current() && !spoken) setNotice(lesson.audioUnavailable);
      } catch {
        if (current()) setNotice(lesson.audioUnavailable);
      }
    })();
  };

  if (!Activity) return <p role="status" className="p-4">{lesson.empty}</p>;
  const finish = (recipe?: SultanhanıCard) => {
    cancelSpeech();
    setProgress(completeGrade3StageFourTable(profileId, progress, entryTable, recipe));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-3 text-[var(--campus-ink)] sm:p-5">
      <h3 className="text-xl font-bold text-[var(--seljuk-navy)]">{lesson.titles[entryTable]}</h3>
      {!progress.persistent && <p role="status">{lesson.session}</p>}
      {notice && <p role="status">{notice}</p>}
      {locked ? (
        <p role="status">{entryTable === 'paylas' && !progress.card ? lesson.share.empty : lesson.locked}</p>
      ) : (
        <StageFourBoundary key={entryTable} returnToMenu={onClose}>
          <Activity listen={listen} finish={finish} card={progress.card} completed={Boolean(progress.completed[entryTable])} />
          {progress.completed[entryTable] && <p role="status" className="font-semibold">{lesson.finished}</p>}
        </StageFourBoundary>
      )}
    </div>
  );
}
