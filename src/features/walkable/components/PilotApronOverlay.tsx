import { useEffect, useRef, type Ref } from 'react';
import { Check } from 'lucide-react';
import { PILOT_PARTS, PILOT_TITLE, PILOT_WELCOME } from '@/src/data/pilotExperienceContent';
import type { usePilotExperience } from '../usePilotExperience';

const button = 'min-h-[44px] rounded-lg bg-sky-900 px-4 py-2 text-sm font-bold text-white hover:bg-sky-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-900 disabled:opacity-55';

export function PilotApronOverlay({ visit, bubbleRef, showInstruction }: {
  visit: ReturnType<typeof usePilotExperience>;
  bubbleRef: Ref<HTMLDivElement>;
  showInstruction: boolean;
}) {
  const panel = useRef<HTMLElement>(null);
  useEffect(() => {
    if (visit.state.dialogue) panel.current?.focus({ preventScroll: true });
  }, [visit.state.dialogue]);
  const { state, line } = visit;
  if (state.dialogue && line) {
    return (
      <>
        <div
          ref={bubbleRef}
          role="status"
          className="pointer-events-none absolute z-30 w-[min(285px,calc(100%-24px))] -translate-x-1/2 -translate-y-full rounded-2xl border border-sky-300 bg-white p-3 text-sky-950 shadow-lg"
          style={{ left: 'clamp(min(154px,50%), var(--pilot-bubble-x, 50%), max(calc(100% - 154px),50%))', top: 'clamp(205px, var(--pilot-bubble-y, 46%), max(205px, calc(100% - 200px)))' }}
        >
          <p className="text-xs font-bold text-sky-800">{line.speaker === 'captain' ? 'Kaptan Pilot' : 'Sen'}</p>
          <p className="mt-1 text-sm font-semibold leading-snug">{line.text}</p>
        </div>
        <section ref={panel} tabIndex={-1} aria-label={PILOT_TITLE} className="pointer-events-auto absolute bottom-4 left-1/2 z-30 w-[min(470px,calc(100%-24px))] max-h-[46dvh] -translate-x-1/2 space-y-2 overflow-auto rounded-2xl border border-sky-200 bg-white p-4 text-sky-950 shadow-lg">
          <h2 className="font-bold">{state.part === null ? PILOT_TITLE : PILOT_PARTS[state.part].name}</h2>
          {state.dialogue === 'answer' ? (
            <fieldset className="space-y-1.5">
              <legend className="text-sm font-semibold">{PILOT_WELCOME.question}</legend>
              {PILOT_WELCOME.options.map((option, index) => (
                <button type="button" key={option} onClick={() => visit.choose(index)} className="block min-h-[44px] w-full rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-left text-sm font-semibold hover:bg-sky-100">
                  {option}
                </button>
              ))}
              {state.hint && <p role="status" className="text-sm font-semibold text-amber-900">{PILOT_WELCOME.hint}</p>}
            </fieldset>
          ) : (
            <>
              {visit.unavailable && <p className="text-xs">Türkçe ses kullanılamıyor. Balondaki yazıyla devam edebilirsin.</p>}
              <div className="flex justify-end">
                <button type="button" className={button} onClick={visit.advance} disabled={visit.reading}>
                  {visit.reading ? 'Dinleniyor…' : state.part === null ? 'Devam Et' : 'Keşfi Kaydet'}
                </button>
              </div>
            </>
          )}
        </section>
      </>
    );
  }

  if (!showInstruction && !state.boarding) return null;
  return (
    <aside className="pointer-events-none absolute bottom-[10.5rem] left-3 z-20 max-w-[calc(100%-24px)] rounded-xl border border-sky-200 bg-white/95 p-2.5 text-sm text-sky-950 shadow-sm sm:bottom-16 sm:left-5">
      <p role="status" className="font-bold">
        {state.boarding ? 'Kaptanla birlikte uçağa biniyorsun…' : state.visited.length === PILOT_PARTS.length ? 'Kaptanla birlikte merdivene git.' : 'İşaretli noktalara yaklaş ve uçağı tanı.'}
      </p>
      {!state.boarding && (
        <ul aria-label="Uçak bölümleri" className="mt-1 flex flex-wrap gap-1.5">
          {PILOT_PARTS.map((part, index) => (
            <li key={part.id} className="flex items-center gap-1 rounded-md bg-sky-100 px-1.5 py-1 text-xs">
              {state.visited.includes(index) && <Check className="size-3.5 text-sky-900" aria-label="Keşfedildi" />}
              {part.name}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
