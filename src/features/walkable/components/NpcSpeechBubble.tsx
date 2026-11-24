import { Volume2 } from 'lucide-react';
import {
  SULTANHANI_FEEDBACK_COPY,
  type SultanhaniDialogChoiceOption,
  type SultanhaniLearningNote,
  type SultanhaniSpeaker,
} from '@/src/data/sultanhaniDialogContent';
import type { Position } from '../types';

export interface ActiveSpeechBubbleState {
  speaker: SultanhaniSpeaker;
  speakerLabel: string;
  text: string;
}

export interface StudentChoicePromptState {
  stepId: string;
  options: readonly SultanhaniDialogChoiceOption[];
  wrongAttempts: number;
  hintTurkish?: string;
  learningNote?: SultanhaniLearningNote;
}

export interface NpcSpeechBubbleProps {
  activeBubble: ActiveSpeechBubbleState | null;
  anchorPos: Position | null;
  choicePrompt: StudentChoicePromptState | null;
  isSpeaking?: boolean;
  onSelectOption: (option: SultanhaniDialogChoiceOption) => void;
  onPreviewOption: (optionText: string) => void;
}

const studentPanelClassName =
  'pointer-events-auto absolute bottom-3 sm:bottom-5 left-1/2 z-30 w-[min(560px,calc(100%-24px))] -translate-x-1/2 rounded-2xl border-2 border-[var(--seljuk-teal)] bg-[var(--campus-surface)]/95 p-3 sm:p-4 shadow-2xl backdrop-blur-xs';

/**
 * Sultanhanı (dış meydan ve iç mekân) konuşma balonu ve öğrenci seçenek paneli.
 * Aynı anda yalnızca aktif konuşmacının balonu karakterin başı üzerinde açılır;
 * öğrenci sırası geldiğinde altta 44x44 px üzeri dokunma/klavye dostu seçenekler
 * ve önceden öğretilmemiş kalıplar için kısa Türkçe açıklama + İngilizce sesli örnek sunulur.
 */
export function NpcSpeechBubble({
  activeBubble,
  anchorPos,
  choicePrompt,
  isSpeaking = false,
  onSelectOption,
  onPreviewOption,
}: NpcSpeechBubbleProps) {
  if (!activeBubble && !choicePrompt) return null;

  const anchorX = anchorPos?.x ?? 480;
  const anchorY = anchorPos?.y ?? 320;
  const isStudentSpeaker = activeBubble?.speaker === 'student';

  return (
    <>
      {activeBubble && (
        <div
          role="dialog"
          aria-label={`${activeBubble.speakerLabel} konuşması`}
          data-testid="npc-speech-bubble"
          data-speaker={activeBubble.speaker}
          style={{
            left: `clamp(calc(min(270px, calc(100% - 24px)) / 2 + 12px), ${anchorX}px, calc(100% - min(270px, calc(100% - 24px)) / 2 - 12px))`,
            top: `clamp(175px, ${anchorY - 12}px, calc(100% - 92px))`,
            transform: 'translate(-50%, -100%)',
            width: 'min(270px, calc(100% - 24px))',
          }}
          className={`pointer-events-none absolute z-30 rounded-2xl border-2 p-3 text-left shadow-xl backdrop-blur-xs select-none ${
            isStudentSpeaker
              ? 'border-amber-500 bg-[var(--campus-surface)]/95'
              : 'border-[var(--seljuk-teal)] bg-[var(--campus-surface)]/95'
          }`}
        >
          <div className="mb-1 flex items-center justify-between gap-2">
            <span
              className={`text-xs font-bold ${
                isStudentSpeaker ? 'text-amber-700' : 'text-[var(--seljuk-teal)]'
              }`}
            >
              {activeBubble.speakerLabel}
            </span>
            {isSpeaking && (
              <Volume2
                className="h-3.5 w-3.5 text-[var(--seljuk-teal)] animate-pulse"
                aria-hidden="true"
              />
            )}
          </div>

          <p className="text-sm sm:text-base font-semibold leading-snug text-[var(--seljuk-navy)]">
            {activeBubble.text}
          </p>
        </div>
      )}

      {choicePrompt && (
        <section
          aria-label="İngilizce cevap seçenekleri"
          data-testid="student-choice-panel"
          className={studentPanelClassName}
        >
          {choicePrompt.learningNote && (
            <div
              data-testid="learning-note-card"
              className="mb-2.5 flex items-center justify-between gap-2 rounded-xl border border-[var(--seljuk-teal)]/35 bg-[var(--stone-cream)]/95 px-3 py-2 text-xs text-[var(--seljuk-navy)]"
            >
              <div className="min-w-0 flex-1">
                <span className="inline-block rounded-md bg-[var(--seljuk-teal)]/15 px-1.5 py-0.5 text-[11px] font-bold text-[var(--seljuk-teal)]">
                  {SULTANHANI_FEEDBACK_COPY.newPatternBadge}
                </span>{' '}
                <span lang="en" className="font-bold">
                  {choicePrompt.learningNote.phrase}
                </span>
                <span className="text-[var(--campus-ink-muted)]">
                  {' '}
                  — {choicePrompt.learningNote.explanationTr}
                </span>
                <p className="mt-0.5 text-[11px] text-[var(--campus-ink-muted)]">
                  Örnek:{' '}
                  <span lang="en" className="font-semibold text-[var(--seljuk-navy)]">
                    {choicePrompt.learningNote.exampleEn}
                  </span>
                </p>
              </div>
              <button
                type="button"
                aria-label={`${SULTANHANI_FEEDBACK_COPY.listenExampleAriaPrefix}: ${choicePrompt.learningNote.exampleEn}`}
                title="Örneği dinle"
                onClick={() => onPreviewOption(choicePrompt.learningNote!.exampleEn)}
                className="inline-flex min-h-[44px] min-w-[44px] shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[var(--seljuk-teal)]/40 bg-white/95 text-[var(--seljuk-teal)] transition-colors hover:bg-[var(--seljuk-teal)] hover:text-white active:scale-95"
              >
                <Volume2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}

          <p className="mb-2 text-xs font-bold text-[var(--seljuk-navy)]">
            {SULTANHANI_FEEDBACK_COPY.studentPromptLabel}
          </p>

          {choicePrompt.wrongAttempts > 0 && (
            <div
              role="status"
              data-testid="choice-feedback-banner"
              className="mb-2.5 rounded-xl border border-amber-300 bg-amber-50/95 px-3 py-2 text-xs text-amber-950"
            >
              <span className="font-bold">{SULTANHANI_FEEDBACK_COPY.tryAgain}</span>{' '}
              {choicePrompt.hintTurkish}
              {choicePrompt.wrongAttempts >= 2 && (
                <span className="block mt-0.5 font-semibold text-amber-800">
                  {SULTANHANI_FEEDBACK_COPY.highlightPrompt}
                </span>
              )}
            </div>
          )}

          <div className="grid gap-2">
            {choicePrompt.options.map((option) => {
              const isHighlighted = choicePrompt.wrongAttempts >= 2 && option.isCorrect;

              return (
                <div
                  key={option.id}
                  className={`flex items-stretch gap-2 rounded-xl border p-1 transition-all ${
                    isHighlighted
                      ? 'border-amber-500 bg-amber-50/95 ring-2 ring-amber-400 shadow-md'
                      : 'border-[var(--campus-border)] bg-[var(--stone-cream)]/70'
                  }`}
                >
                  <button
                    type="button"
                    data-highlighted={isHighlighted ? 'true' : 'false'}
                    data-option-text={option.text}
                    onClick={() => onSelectOption(option)}
                    className="min-h-[44px] flex-1 cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-bold text-[var(--seljuk-navy)] transition-colors hover:bg-white/80 active:scale-[0.99]"
                  >
                    {option.text}
                  </button>
                  <button
                    type="button"
                    aria-label={`${SULTANHANI_FEEDBACK_COPY.listenOptionAriaPrefix}: ${option.text}`}
                    title="Dinle"
                    onClick={() => onPreviewOption(option.text)}
                    className="inline-flex min-h-[44px] min-w-[44px] shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[var(--campus-border)] bg-white/90 text-[var(--seljuk-teal)] transition-colors hover:bg-[var(--seljuk-teal)] hover:text-white active:scale-95"
                  >
                    <Volume2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
