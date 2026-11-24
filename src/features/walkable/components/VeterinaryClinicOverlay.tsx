import { useEffect, useRef, type Ref } from 'react';
import { Award } from 'lucide-react';
import { VET_COMPLETE, VET_SECTIONS, VET_SPEAKERS, VET_TASK_TITLES } from '@/src/data/veterinaryClinicContent';
import type { useVeterinaryClinicVisit } from '../useVeterinaryClinicVisit';
import { VeterinaryClinicActivities } from './VeterinaryClinicActivities';

const panelClass = 'pointer-events-auto absolute bottom-3 left-1/2 z-30 w-[min(480px,calc(100%-24px))] max-h-[min(54dvh,500px)] -translate-x-1/2 space-y-2 overflow-y-auto overscroll-contain rounded-2xl border border-teal-200 bg-white p-3 text-teal-950 shadow-lg sm:bottom-5 sm:p-4';
const buttonClass = 'min-h-[44px] rounded-lg bg-teal-800 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800 disabled:opacity-55';

export function VeterinaryClinicOverlay({ visit, bubbleRef, showInstruction, onExit }: {
  visit: ReturnType<typeof useVeterinaryClinicVisit>;
  bubbleRef: Ref<HTMLDivElement>;
  showInstruction: boolean;
  onExit: () => void;
}) {
  const panelRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (visit.dialogOpen || visit.complete) panelRef.current?.focus({ preventScroll: true });
  }, [visit.activity, visit.bubble?.text, visit.complete, visit.dialogOpen]);

  if (visit.complete) {
    return (
      <section ref={panelRef} tabIndex={-1} aria-labelledby="vet-achievement" className={panelClass + ' max-sm:bottom-[10.75rem] text-center'}>
        <Award aria-hidden="true" className="mx-auto size-10 text-amber-700" />
        <h2 id="vet-achievement" className="text-xl font-bold">{VET_COMPLETE.heading}</h2>
        <p className="text-sm leading-snug">{VET_COMPLETE.text}</p>
        <button type="button" className={buttonClass} onClick={onExit}>Sınıfa Dön</button>
      </section>
    );
  }

  const section = VET_SECTIONS[visit.section];
  const heading = VET_TASK_TITLES[section.task];
  if (!visit.dialogOpen) {
    if (!showInstruction) return null;
    return (
      <p role="status" className="pointer-events-none absolute bottom-[10.75rem] left-3 z-20 max-w-[calc(100%-24px)] rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm font-semibold text-teal-950 shadow-sm sm:bottom-16 sm:left-5">
        {section.instruction}
      </p>
    );
  }

  return (
    <>
      {visit.bubble && (
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
          <p className="text-xs font-bold text-teal-800">{VET_SPEAKERS[visit.bubble.kind === 'line' ? visit.bubble.speaker : 'dog']}</p>
          <p className="mt-1 text-sm font-semibold leading-snug">{visit.bubble.text}</p>
        </div>
      )}
      <section ref={panelRef} tabIndex={-1} aria-labelledby="vet-activity-heading" className={panelClass}>
        <p className="text-xs font-bold text-teal-800">Görev {section.task + 1}/{VET_TASK_TITLES.length}</p>
        <h2 id="vet-activity-heading" className="text-base font-bold">{heading}</h2>
        {visit.activity ? (
          <VeterinaryClinicActivities key={visit.activity} activity={visit.activity} grade={visit.grade} careCount={visit.careCount} dogResting={visit.dogResting} onPrepareCare={visit.prepareCare} onDone={visit.advance} />
        ) : visit.choice ? (
          <fieldset className="space-y-1.5">
            <legend className="text-sm font-semibold">{visit.choice.prompt}</legend>
            {visit.choice.options.map((option, index) => (
              <button
                type="button"
                key={option}
                className="min-h-[44px] w-full rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-left text-sm font-semibold hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-teal-800"
                onClick={() => visit.choose(index)}
              >
                {option}
              </button>
            ))}
            {visit.feedback && <p role="status" className="text-sm font-semibold text-amber-900">{visit.feedback}</p>}
          </fieldset>
        ) : (
          <>
            {visit.voiceUnavailable && <p className="text-xs text-teal-900">Türkçe ses kullanılamıyor. Balondaki yazıyla devam edebilirsin.</p>}
            <div className="flex justify-end">
              <button type="button" className={buttonClass} onClick={visit.advance} disabled={visit.speaking}>
                {visit.speaking ? 'Dinleniyor…' : 'Devam Et'}
              </button>
            </div>
          </>
        )}
      </section>
    </>
  );
}
