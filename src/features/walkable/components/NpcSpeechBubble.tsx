import { useEffect } from 'react';
import type { Position } from '../types';

export interface NpcSpeechBubbleProps {
  isOpen: boolean;
  speakerName: string;
  lines: readonly string[];
  currentIndex: number;
  anchorPos: Position | null;
  onAdvance: () => void;
}

/**
 * Sahne içi NPC üzerinde açılan sade, erişilebilir konuşma balonu.
 * Ekran sınırlarını aşmaz; fare, dokunma ve klavye (Enter / Boşluk) ile ilerler.
 */
export function NpcSpeechBubble({
  isOpen,
  speakerName,
  lines,
  currentIndex,
  anchorPos,
  onAdvance,
}: NpcSpeechBubbleProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        onAdvance();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, onAdvance]);

  if (!isOpen || lines.length === 0) return null;

  const safeIndex = Math.max(0, Math.min(lines.length - 1, currentIndex));
  const isLastLine = safeIndex >= lines.length - 1;
  const currentText = lines[safeIndex];
  const buttonLabel = isLastLine ? 'Tamam' : 'Devam';

  const anchorX = anchorPos?.x ?? 480;
  const anchorY = anchorPos?.y ?? 320;

  return (
    <div
      role="dialog"
      aria-label={`${speakerName} konuşması`}
      data-testid="npc-speech-bubble"
      onClick={onAdvance}
      style={{
        left: `clamp(calc(min(300px, calc(100% - 24px)) / 2 + 12px), ${anchorX}px, calc(100% - min(300px, calc(100% - 24px)) / 2 - 12px))`,
        top: `clamp(235px, ${anchorY - 12}px, calc(100% - 76px))`,
        transform: 'translate(-50%, -100%)',
        width: 'min(300px, calc(100% - 24px))',
      }}
      className="pointer-events-auto absolute z-30 rounded-2xl border-2 border-[var(--seljuk-teal)] bg-[var(--campus-surface)]/95 p-3.5 text-left shadow-xl backdrop-blur-xs select-none"
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-[var(--seljuk-teal)]">{speakerName}</span>
        <span className="text-[11px] font-semibold tabular-nums text-[var(--campus-ink-muted)]">
          {safeIndex + 1} / {lines.length}
        </span>
      </div>

      <p className="text-xs sm:text-sm font-medium leading-snug text-[var(--seljuk-navy)]">
        {currentText}
      </p>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAdvance();
          }}
          className="min-h-[44px] min-w-[88px] cursor-pointer rounded-xl bg-[var(--seljuk-teal)] px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-xs transition-colors hover:bg-[var(--seljuk-teal-hover)] active:scale-95"
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
