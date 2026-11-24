import { useEffect, useRef, type Ref } from 'react';
import { X } from 'lucide-react';
import { CAREER_ATLAS, CAREER_LIST, type CareerDefinition } from '@/src/data/discoveryCareerConfig';
import {
  DISCOVERY_CLASSROOM,
  DISCOVERY_NICHE_LAYOUT,
  DISCOVERY_PREVIEW_LAYOUT,
  DISCOVERY_TITLE_LAYOUT,
} from '../engine/discoveryClassroomSceneRenderer';

function CareerPortrait({ career, className }: { career: CareerDefinition; className: string }) {
  const column = career.portrait % CAREER_ATLAS.columns;
  const row = Math.floor(career.portrait / CAREER_ATLAS.columns);
  return (
    <span
      aria-hidden="true"
      className={'block aspect-square bg-[#473831] bg-no-repeat ' + className}
      style={{
        backgroundImage: 'url(' + CAREER_ATLAS.url + ')',
        backgroundSize: CAREER_ATLAS.columns * 100 + '% ' + CAREER_ATLAS.rows * 100 + '%',
        backgroundPosition: column * 100 / (CAREER_ATLAS.columns - 1) + '% ' + row * 100 / (CAREER_ATLAS.rows - 1) + '%',
      }}
    />
  );
}

export function DiscoveryCareerLayer({ activeSlot, onSelectSlot, layerRef }: {
  activeSlot: number;
  onSelectSlot: (slot: number) => void;
  layerRef: Ref<HTMLDivElement>;
}) {
  const selected = CAREER_LIST[activeSlot];
  return (
    <div
      ref={layerRef}
      className="pointer-events-none invisible absolute left-0 top-0 origin-top-left"
      style={{ width: DISCOVERY_CLASSROOM.width, height: DISCOVERY_CLASSROOM.height }}
    >
      <header className="absolute flex flex-col justify-center text-center text-[#442615]" style={DISCOVERY_TITLE_LAYOUT}>
        <h2 className="font-serif text-[20px] font-bold leading-tight">Hayalden Gerçeğe</h2>
        <p className="mt-2 text-[11.5px] font-bold leading-tight">Büyüyünce ne olabilirim?</p>
      </header>

      {DISCOVERY_NICHE_LAYOUT.map(({ portrait, plaque }, slot) => {
        const career = CAREER_LIST[slot];
        if (!career) return null;
        return (
          <button
            type="button"
            key={career.id}
            tabIndex={-1}
            aria-pressed={slot === activeSlot}
            onClick={() => onSelectSlot(slot)}
            className="group pointer-events-auto absolute text-[#fff4dd] outline-offset-2 focus-visible:outline-2 focus-visible:outline-[#fff0a4]"
            style={{
              left: plaque.left,
              top: portrait.top,
              width: plaque.width,
              height: plaque.top + plaque.height - portrait.top,
            }}
          >
            <span
              className="absolute top-0 isolate flex items-center overflow-hidden rounded-[2px] bg-[#3e2b20] ring-1 ring-[#d3a26b] transition-shadow group-hover:ring-[#fff0b6] group-aria-pressed:ring-2 group-aria-pressed:ring-[#ffe9a8] group-aria-pressed:shadow-[0_0_13px_#ffc571]"
              style={{ left: portrait.left - plaque.left, width: portrait.width, height: portrait.height }}
            >
              <CareerPortrait career={career} className="absolute inset-0 -z-10 h-full w-full opacity-45 blur-sm" />
              <CareerPortrait career={career} className="w-full shrink-0" />
            </span>
            <span
              className="absolute inset-x-0 flex items-center justify-center rounded-[2px] bg-[#33221bea] px-0.5 text-center text-[9.5px] font-bold leading-[1.05] shadow-[0_1px_3px_#452411] group-aria-pressed:text-[#ffedae]"
              style={{ top: plaque.top - portrait.top, height: plaque.height }}
            >
              {career.title}
            </span>
          </button>
        );
      })}

      {selected && (
        <section
          aria-label={selected.title}
          aria-live="polite"
          className="absolute flex items-center justify-center gap-2 overflow-hidden rounded-lg p-1.5 text-[#fff1cc]"
          style={DISCOVERY_PREVIEW_LAYOUT}
        >
          <CareerPortrait career={selected} className="w-[71px] shrink-0 rounded-md ring-1 ring-[#c89557]" />
          {!selected.sceneId && <p className="text-[12px] font-semibold">Yakında</p>}
        </section>
      )}
    </div>
  );
}

export function DiscoveryCareerModal({ isOpen, career, onStartCareer, onClose }: {
  isOpen: boolean;
  career: CareerDefinition | undefined;
  onStartCareer: (career: CareerDefinition) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLButtonElement>(null);
  const canLaunch = isOpen && career?.sceneId === 'discovery_moon';

  useEffect(() => {
    if (!canLaunch) return;
    const previousFocus = document.activeElement;
    const dialog = dialogRef.current;
    startRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
      if (event.key !== 'Tab' || !dialog) return;
      const buttons = dialog.querySelectorAll('button');
      const first = buttons.item(0);
      const last = buttons.item(buttons.length - 1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, [canLaunch, onClose]);

  if (!canLaunch || !career) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="career-modal-title" className="fixed inset-0 z-50 flex items-center justify-center bg-[#352218]/85 p-4 backdrop-blur-sm">
      <div ref={dialogRef} className="w-full max-w-xs space-y-4 rounded-2xl border-2 border-[#bc8d56] bg-[#f5d7ac] p-4 text-[#43281c] shadow-2xl">
        <header className="flex items-center justify-between">
          <h2 id="career-modal-title" className="font-serif text-xl font-bold">{career.title}</h2>
          <button type="button" onClick={onClose} aria-label="Kapat" className="flex size-11 items-center justify-center rounded-lg border border-[#ad764a] bg-[#fff2d8] focus-visible:outline-2 focus-visible:outline-[var(--seljuk-teal)]">
            <X aria-hidden="true" className="size-5" />
          </button>
        </header>
        <CareerPortrait career={career} className="mx-auto w-[min(100%,11rem)] rounded-lg ring-1 ring-[#ad764a]" />
        <button ref={startRef} type="button" onClick={() => onStartCareer(career)} className="min-h-[44px] w-full rounded-lg bg-[#70492e] px-3 py-2 font-semibold text-[#fff2d8] hover:bg-[#533722] focus-visible:outline-2 focus-visible:outline-[var(--seljuk-teal)]">
          {career.buttonText}
        </button>
      </div>
    </div>
  );
}
