import type { Ref, RefObject } from 'react';
import { VET_SPEAKERS } from '@/src/data/veterinaryClinicContent';
import type { useVeterinaryClinicVisit } from '../useVeterinaryClinicVisit';
import type { Position } from '../types';
import { VeterinaryClinicActivities } from './VeterinaryClinicActivities';

export function VeterinaryClinicOverlay({ visit, bubbleRef, layerRef, reachItem, showInstruction, onExit }: {
  visit: ReturnType<typeof useVeterinaryClinicVisit>;
  bubbleRef: Ref<HTMLDivElement>;
  layerRef: RefObject<HTMLDivElement | null>;
  reachItem: (position: Position) => boolean;
  showInstruction: boolean;
  onExit: () => void;
}) {
  const { bubble, phase } = visit;
  const instruction = visit.canCare
    ? 'Sağdaki su kabı ve mindere yaklaş. İkisini bakım alanına sürükle.'
    : null;

  return (
    <>
      {visit.canCare && (
        <VeterinaryClinicActivities
          layerRef={layerRef}
          placed={visit.placed}
          reachItem={reachItem}
          moveItem={visit.dragItem}
          placeItem={visit.placeItem}
        />
      )}

      {bubble && (
        <div
          ref={bubbleRef}
          role="status"
          aria-live="polite"
          className="pointer-events-none absolute z-30 w-[min(284px,calc(100%-24px))] -translate-x-1/2 -translate-y-full rounded-2xl border border-teal-300 bg-white/95 p-3 text-teal-950 shadow-lg"
          style={{
            left: 'clamp(min(154px,50%), var(--vet-bubble-x, 50%), max(calc(100% - 154px),50%))',
            top: 'clamp(217px, var(--vet-bubble-y, 47%), max(217px, calc(100% - 198px)))',
          }}
        >
          <p className="text-xs font-bold text-teal-800">{VET_SPEAKERS[bubble.speaker]}</p>
          <p className="mt-1 text-sm font-semibold leading-snug">{bubble.text}</p>
        </div>
      )}

      {instruction && showInstruction && (
        <p role="status" className="pointer-events-none absolute bottom-[10.75rem] left-3 z-20 max-w-[calc(100%-24px)] rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm font-semibold text-teal-950 shadow-sm sm:bottom-16 sm:left-5">
          {instruction}
        </p>
      )}

      {phase === 'complete' && (
        <button
          type="button"
          className="pointer-events-auto absolute bottom-[10.75rem] right-3 z-30 min-h-[44px] rounded-lg bg-teal-800 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-teal-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800 sm:bottom-5 sm:right-5"
          onClick={onExit}
        >
          Sınıfa Dön
        </button>
      )}
    </>
  );
}
