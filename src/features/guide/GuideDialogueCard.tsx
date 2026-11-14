import React, { useEffect, useState } from 'react';
import { Volume2, Square } from 'lucide-react';
import type { DialogueRecord } from '@/src/types/campus';
import { speakSegments, stopSpeaking } from '@/src/services/speech';
import { PeerGuideSvg } from '@/src/components/svg/PeerGuideSvg';

interface GuideDialogueCardProps {
  dialogue: DialogueRecord;
  mood?: 'welcoming' | 'thinking' | 'celebrating';
  children?: React.ReactNode;
}

export function GuideDialogueCard({
  dialogue,
  mood = 'welcoming',
  children,
}: GuideDialogueCardProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);

  const fullText = dialogue.segments.map((s) => s.text).join(' ');

  const handlePlaySpeech = async () => {
    setFallbackNotice(null);
    const result = await speakSegments(dialogue.segments, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
    if (!result.spoken && result.fallbackReason) {
      setFallbackNotice(result.fallbackReason);
    }
  };

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [dialogue.id]);

  return (
    <section
      aria-label={`${dialogue.speaker} mesajı`}
      className="rounded-xl bg-[var(--stone-cream)] border border-[var(--campus-border)] border-t-2 border-t-[var(--seljuk-teal)]/60 p-5 sm:p-6 shadow-sm transition-all duration-200"
    >
      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
        <PeerGuideSvg mood={mood} size="md" />

        <div className="flex-1 space-y-3 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[var(--seljuk-teal)]">
              {dialogue.speaker}
            </span>

            <button
              type="button"
              onClick={() => {
                if (isSpeaking) {
                  stopSpeaking();
                  setIsSpeaking(false);
                } else {
                  void handlePlaySpeech();
                }
              }}
              className="min-h-[44px] px-3.5 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--campus-surface)] hover:bg-[var(--campus-surface-muted)] text-xs font-semibold text-[var(--seljuk-navy)] inline-flex items-center gap-2 cursor-pointer transition-colors"
            >
              {isSpeaking ? (
                <>
                  <Square className="w-3.5 h-3.5 text-[var(--alert-rose)]" aria-hidden="true" />
                  <span>Seslendirmeyi Durdur</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-[var(--seljuk-teal)]" aria-hidden="true" />
                  <span>Sesli Dinle</span>
                </>
              )}
            </button>
          </div>

          <p className="text-base sm:text-lg font-medium text-[var(--seljuk-navy)] leading-relaxed">
            {fullText}
          </p>

          {dialogue.visualSupportNote && (
            <p className="text-xs font-medium text-[var(--campus-ink-muted)]">
              Kelime desteği: {dialogue.visualSupportNote}
            </p>
          )}

          {fallbackNotice && (
            <p role="status" className="text-xs text-[var(--sandstone-gold)] font-medium">
              {fallbackNotice}
            </p>
          )}

          {children && <div className="pt-2">{children}</div>}
        </div>
      </div>
    </section>
  );
}
