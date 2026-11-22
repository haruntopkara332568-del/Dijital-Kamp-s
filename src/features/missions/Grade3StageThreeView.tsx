import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useOptionalCampus } from '@/src/app/CampusProviders';
import { getEnglishNameSpeech } from '@/src/services/englishNameSpeech';
import { GRADE_3_STAGE_3 as content, isGrade3StageThreeTableComplete, type Grade3StageThreeTask, type StageThreeAge } from '@/src/data/grade3Stage3Content';
import { completeGrade3StageThreeTask, loadGrade3StageThreeProgress } from '@/src/services/grade3Stage3Progress';
import { getSpeechVoices, speakSegments, stopSpeaking } from '@/src/services/speech';
import type { MissionStageId } from '@/src/types/campus';
import {
  DiscoverStageThree,
  LearnStageThree,
  ProduceStageThree,
  ShareStageThree,
  stageThreeButton,
  type StageThreeListen,
} from './Grade3StageThreeActivities';

const knownMaleVoice = /\b(?:daniel|david|mark|tolga|male)\b/i;
let reportedNarrator = false;
let warnedUnavailable = false;

class StageThreeActivityBoundary extends Component<{ children: ReactNode; returnToMenu: () => void }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="space-y-3 rounded-xl border border-[var(--campus-border)] p-4">
        <p>{content.common.activityError}</p>
        <button type="button" className={stageThreeButton} onClick={this.props.returnToMenu}>
          {content.common.tableMenu}
        </button>
      </div>
    );
  }
}

export function Grade3StageThreeView({ entryTable }: { entryTable: MissionStageId }) {
  const campus = useOptionalCampus();
  const profile = campus?.activeProfile;
  const profileId = profile?.id ?? null;
  const speechEnabled = campus?.state.speechEnabled ?? true;
  const [progress, setProgress] = useState(() => loadGrade3StageThreeProgress(profileId));
  const complete = (table: MissionStageId) => isGrade3StageThreeTableComplete(table, progress.completed);
  const [showTable, setShowTable] = useState(true);
  const tableIndex = content.tables.findIndex(({ id }) => id === entryTable);
  const table = showTable ? content.tables[tableIndex] : undefined;
  const locked = tableIndex > 0 && !complete(content.tables[tableIndex - 1].id);
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

  const listen: StageThreeListen = (lines, onLine) => {
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
        const narrator = voices?.['en-US'];
        if (!narrator || knownMaleVoice.test(narrator.name)) {
          if (!warnedUnavailable) {
            warnedUnavailable = true;
            console.warn('[ses] en: uygun ses yok, tr: kullanılmıyor');
          }
          setAudioNotice(content.common.audioUnavailable);
          return;
        }

        if (!reportedNarrator) {
          reportedNarrator = true;
          console.info(`[ses] en: ${narrator.name}, tr: ${narrator.name} (adlar için aynı ses)`);
        }

        const { spoken } = await speakSegments(lines.map((line) => getEnglishNameSpeech(line)), {
          onSegmentStart: onLine,
          queued: {
            signal,
            voices: { 'en-US': narrator, 'tr-TR': null },
            rates: { 'en-US': 0.85, 'tr-TR': 0.9 },
          },
        });
        if (isCurrent() && !spoken) setAudioNotice(content.common.audioUnavailable);
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

  const finish = (task: Grade3StageThreeTask, dialogueAge?: StageThreeAge) => {
    cancelSpeech();
    setAudioNotice('');
    setProgress(completeGrade3StageThreeTask(profileId, progress.completed, task, dialogueAge));
  };

  const activityProps = {
    completed: progress.completed,
    finish,
    listen,
    showText: Boolean(audioNotice) || !speechEnabled,
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-3 text-[var(--campus-ink)] sm:p-5">
      {!progress.persistent && <p role="status">{content.common.sessionOnly}</p>}
      {audioNotice && <p role="status" className="rounded-lg bg-[var(--stone-cream)] p-2">{audioNotice}</p>}
      {table ? (
        <>
          <h3 className="text-xl font-bold text-[var(--seljuk-navy)]">{table.title}</h3>
          {locked ? (
            <>
              <p role="status">{content.common.locked}</p>
              {table.id === 'paylas' && <p>{content.share.noDialogue}</p>}
            </>
          ) : (
            <>
              <StageThreeActivityBoundary key={table.id} returnToMenu={returnToMenu}>
                {table.id === 'kesfet' && <DiscoverStageThree {...activityProps} />}
                {table.id === 'ogren' && <LearnStageThree {...activityProps} />}
                {table.id === 'uret' && (
                  <ProduceStageThree {...activityProps} dialogueAge={progress.dialogueAge}
                    saveDialogue={(age) => finish('independent', age)} />
                )}
                {table.id === 'paylas' && (
                  <ShareStageThree {...activityProps} dialogueAge={progress.dialogueAge} characterId={profile?.characterId} />
                )}
              </StageThreeActivityBoundary>
              {complete(table.id) && (
                <p role="status" className="font-bold text-[var(--seljuk-teal)]">{content.common.finished}</p>
              )}
            </>
          )}
        </>
      ) : <h3 className="font-bold text-[var(--seljuk-navy)]">{content.common.tableMenu}</h3>}
    </div>
  );
}
