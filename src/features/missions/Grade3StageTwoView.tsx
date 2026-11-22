import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useOptionalCampus } from '@/src/app/CampusProviders';
import {
  GRADE_3_STAGE_2 as content,
  getGrade3StageTwoSpeech,
  isGrade3StageTwoTableComplete,
  type Grade3StageTwoTask,
} from '@/src/data/grade3Stage2Content';
import { completeGrade3StageTwoTask, loadGrade3StageTwoProgress } from '@/src/services/grade3Stage2Progress';
import { getSpeechVoices, speakSegments, stopSpeaking } from '@/src/services/speech';
import type { MissionStageId } from '@/src/types/campus';
import {
  DiscoverStageTwo,
  LearnStageTwo,
  ProduceStageTwo,
  ShareStageTwo,
  stageTwoButton,
  type StageTwoListen,
} from './Grade3StageTwoActivities';

class StageTwoActivityBoundary extends Component<{ children: ReactNode; returnToMenu: () => void }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="space-y-3 rounded-xl border border-[var(--campus-border)] p-4" role="alert">
        <p>{content.common.activityError}</p>
        <button type="button" className={stageTwoButton} onClick={this.props.returnToMenu}>
          {content.common.tableMenu}
        </button>
      </div>
    );
  }
}

export function Grade3StageTwoView({ entryTable }: { entryTable: MissionStageId }) {
  const campus = useOptionalCampus();
  const profile = campus?.activeProfile;
  const profileId = profile?.id ?? null;
  const speechEnabled = campus?.state.speechEnabled ?? true;
  const [progress, setProgress] = useState(() => loadGrade3StageTwoProgress(profileId));
  const isComplete = (table: MissionStageId) => isGrade3StageTwoTableComplete(table, progress.completed);
  const [showTable, setShowTable] = useState(true);
  const tableIndex = content.tables.findIndex(({ id }) => id === entryTable);
  const table = showTable ? content.tables[tableIndex] : undefined;
  const locked = tableIndex > 0 && !isComplete(content.tables[tableIndex - 1].id);
  const [audioNotice, setAudioNotice] = useState('');
  const speech = useRef<AbortController | null>(null);

  const cancelSpeech = useCallback(() => {
    if (!speech.current) return;
    speech.current.abort();
    speech.current = null;
    stopSpeaking();
  }, []);

  useEffect(() => cancelSpeech, [cancelSpeech]);
  useEffect(() => {
    if (!speechEnabled) cancelSpeech();
  }, [cancelSpeech, speechEnabled]);

  const listen: StageTwoListen = (texts, onLine, personalGreeting) => {
    cancelSpeech();
    if (!speechEnabled) {
      setAudioNotice(content.common.audioOff);
      return;
    }

    setAudioNotice('');
    const generationId = new AbortController();
    speech.current = generationId;
    const { signal } = generationId;
    const isCurrent = () => speech.current === generationId && !signal.aborted;

    void (async () => {
      try {
        const voices = await getSpeechVoices(signal);
        if (!isCurrent()) return;
        if (!voices?.['en-US']) {
          setAudioNotice(content.common.audioUnavailable);
          return;
        }

        const queued = {
          signal,
          voices: { 'en-US': voices['en-US'], 'tr-TR': null },
          rates: { 'en-US': 0.85, 'tr-TR': 0.9 },
        };
        let unavailable = false;
        for (const [index, text] of texts.entries()) {
          if (!isCurrent()) return;
          onLine?.(index);
          const line = getGrade3StageTwoSpeech(text, personalGreeting);
          const { spoken } = await speakSegments([line], { queued });
          if (!spoken) unavailable = true;
        }
        if (unavailable && isCurrent()) setAudioNotice(content.common.audioUnavailable);
      } catch {
        if (isCurrent()) setAudioNotice(content.common.audioUnavailable);
      }
    })();
  };

  const returnToMenu = () => {
    cancelSpeech();
    setAudioNotice('');
    setShowTable(false);
  };

  const activityProps = {
    completed: progress.completed,
    finish: (task: Grade3StageTwoTask) => {
      cancelSpeech();
      setProgress(completeGrade3StageTwoTask(profileId, progress.completed, task));
    },
    listen,
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-3 text-[var(--campus-ink)] sm:p-5">
      {!progress.persistent && <p role="status" className="text-sm font-medium">{content.common.sessionOnly}</p>}
      {audioNotice && <p role="status" className="rounded-lg bg-[var(--stone-cream)] p-2 text-sm">{audioNotice}</p>}
      {table ? (
        <>
          <h3 className="text-lg font-bold text-[var(--seljuk-navy)] sm:text-xl">{table.title}</h3>
          {locked ? <p role="status">{content.common.locked}</p> : (
            <>
              <StageTwoActivityBoundary key={table.id} returnToMenu={returnToMenu}>
                {table.id === 'kesfet' && <DiscoverStageTwo {...activityProps} />}
                {table.id === 'ogren' && <LearnStageTwo {...activityProps} />}
                {table.id === 'uret' && <ProduceStageTwo {...activityProps} />}
                {table.id === 'paylas' && (
                  <ShareStageTwo {...activityProps} profileName={profile?.alias} characterId={profile?.characterId} />
                )}
              </StageTwoActivityBoundary>
              {isComplete(table.id) && (
                <p role="status" className="font-bold text-[var(--seljuk-teal)]">{content.common.finished}</p>
              )}
            </>
          )}
        </>
      ) : <h3 className="font-bold text-[var(--seljuk-navy)]">{content.common.tableMenu}</h3>}
    </div>
  );
}
