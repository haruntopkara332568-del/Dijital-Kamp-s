import { useEffect, useRef, type Ref } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { CAREER_ATLAS, CAREER_PAGE_COUNT, getCareerPage, type CareerDefinition } from '@/src/data/discoveryCareerConfig';
import { DISCOVERY_CLASSROOM, DISCOVERY_NICHE_LAYOUT, DISCOVERY_PREVIEW_LAYOUT } from '../engine/discoveryClassroomSceneRenderer';

interface CareerGalleryProps {
  page: number;
  activeSlot: number;
  onPageChange: (page: number) => void;
  onSelectSlot: (slot: number) => void;
}

const controlClass = 'inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-[#ad764a] bg-[#fff2d8] px-2.5 py-2 text-xs font-bold text-[#52321f] shadow-sm hover:bg-[#ffe1aa] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--seljuk-teal)] disabled:opacity-55 sm:px-3 sm:text-sm';

function CareerPortrait({ career, className }: { career: CareerDefinition; className: string }) {
  const column = career.portrait % CAREER_ATLAS.columns;
  const row = Math.floor(career.portrait / CAREER_ATLAS.columns);
  return (
    <span
      aria-hidden="true"
      className={'block aspect-square bg-[#72534a] bg-no-repeat ' + className}
      style={{
        backgroundImage: 'url(' + CAREER_ATLAS.url + ')',
        backgroundSize: CAREER_ATLAS.columns * 100 + '% ' + CAREER_ATLAS.rows * 100 + '%',
        backgroundPosition: column * 100 / (CAREER_ATLAS.columns - 1) + '% ' + row * 100 / (CAREER_ATLAS.rows - 1) + '%',
      }}
    />
  );
}

export function DiscoveryCareerPages({ page, onPageChange }: Pick<CareerGalleryProps, 'page' | 'onPageChange'>) {
  return (
    <div role="group" aria-label="Meslek sayfaları" className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
      <button type="button" className={controlClass} onClick={() => onPageChange(page - 1)} disabled={page === 0}>
        <ChevronLeft className="size-4 shrink-0" aria-hidden="true" /> Önceki Meslekler
      </button>
      <button type="button" className={controlClass} onClick={() => onPageChange(page + 1)} disabled={page >= CAREER_PAGE_COUNT - 1}>
        Sonraki Meslekler <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
      </button>
    </div>
  );
}

export function DiscoveryCareerLayer({ page, activeSlot, onSelectSlot, layerRef }: Omit<CareerGalleryProps, 'onPageChange'> & {
  layerRef: Ref<HTMLDivElement>;
}) {
  const careers = getCareerPage(page);
  const selected = careers[activeSlot];
  const { top, width, artTop, artSize, nameTop, nameHeight, slots } = DISCOVERY_NICHE_LAYOUT;
  return (
    <div
      ref={layerRef}
      className="pointer-events-none invisible absolute left-0 top-0 origin-top-left"
      style={{ width: DISCOVERY_CLASSROOM.width, height: DISCOVERY_CLASSROOM.height }}
    >
      <header className="absolute left-1/2 top-[64px] w-[192px] -translate-x-1/2 text-center text-[#492b1b]">
        <h2 className="font-serif text-[19px] font-bold leading-tight">Hayalden Gerçeğe</h2>
        <p className="text-[12px] font-bold leading-tight">Büyüyünce ne olabilirim?</p>
      </header>
      {slots.map((left, slot) => {
        const career = careers[slot];
        if (!career) return null;
        return (
          <button
            type="button"
            key={left}
            tabIndex={-1}
            aria-pressed={activeSlot === slot}
            onClick={() => onSelectSlot(slot)}
            className="group pointer-events-auto absolute isolate rounded-t-[46%] rounded-b-md outline-offset-2 focus-visible:outline-2 focus-visible:outline-[#fff1af]"
            style={{ top, left, width, height: nameTop + nameHeight - top }}
          >
            <span aria-hidden="true" className="pointer-events-none absolute inset-[3px] -z-10 rounded-t-[45%] rounded-b-md transition-shadow group-hover:shadow-[inset_0_0_14px_#ffe6a2] group-aria-pressed:shadow-[inset_0_0_18px_#ffdd8a,0_0_12px_#edb56c]" />
            <span
              className="absolute left-1/2 -translate-x-1/2 overflow-hidden rounded-[4px] ring-1 ring-[#cd9c60] group-aria-pressed:ring-2 group-aria-pressed:ring-[#ffe5a3]"
              style={{ top: artTop - top, width: artSize, height: artSize }}
            >
              <CareerPortrait career={career} className="w-full" />
            </span>
            <span className="absolute inset-x-1 flex items-center justify-center px-1 text-center font-serif text-[12.5px] font-bold leading-[1.1] text-[#fff3d8] group-aria-pressed:text-[#fff1a9]" style={{ top: nameTop - top, height: nameHeight }}>
              {career.title}
            </span>
          </button>
        );
      })}
      {selected && (
        <div
          role="img"
          aria-label={selected.title}
          className="absolute overflow-hidden rounded-xl border-2 border-[#69422d] bg-[#5c4536] shadow-[0_2px_8px_#915932]"
          style={{ left: DISCOVERY_PREVIEW_LAYOUT.left, top: DISCOVERY_PREVIEW_LAYOUT.top, width: DISCOVERY_PREVIEW_LAYOUT.size, height: DISCOVERY_PREVIEW_LAYOUT.size }}
        >
          <CareerPortrait career={selected} className="w-full" />
        </div>
      )}
    </div>
  );
}

interface DiscoveryCareerModalProps extends CareerGalleryProps {
  isOpen: boolean;
  allowLaunch: boolean;
  onStartCareer: (career: CareerDefinition) => void;
  onClose: () => void;
}

export function DiscoveryCareerModal({ isOpen, allowLaunch, page, activeSlot, onPageChange, onSelectSlot, onStartCareer, onClose }: DiscoveryCareerModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement;
    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLElement>('button[aria-pressed="true"]')?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
      if (event.key !== 'Tab' || !dialog) return;
      const buttons = dialog.querySelectorAll<HTMLButtonElement>('button:not([disabled])');
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  const careers = getCareerPage(page);
  const selected = careers[activeSlot];

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="career-modal-title" className="fixed inset-0 z-50 flex items-center justify-center bg-[#352218]/85 p-2 backdrop-blur-sm sm:p-4">
      <div ref={dialogRef} className="max-h-[94dvh] w-full max-w-3xl overflow-auto rounded-2xl border-2 border-[#c79059] bg-[#f5d7ac] p-3 text-[#43281c] shadow-2xl sm:p-5">
        <header className="mb-3 flex items-start justify-between gap-2">
          <div>
            <h2 id="career-modal-title" className="font-serif text-xl font-bold sm:text-2xl">Hayalden Gerçeğe</h2>
            <p className="text-sm font-medium">Büyüyünce ne olabilirim?</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Kapat" className={controlClass + ' min-w-[44px]'}>
            <X aria-hidden="true" className="size-5" />
          </button>
        </header>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
          {careers.map((career, slot) => (
            <button
              type="button"
              key={slot}
              aria-pressed={slot === activeSlot}
              onClick={() => onSelectSlot(slot)}
              className="group flex min-w-0 flex-col overflow-hidden rounded-t-[38%] rounded-b-lg border-2 border-[#b07a4c] bg-[#593b2a] text-[#fff6e2] shadow-sm hover:border-[#855636] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--seljuk-teal)] aria-pressed:border-[#ffda8d] aria-pressed:ring-2 aria-pressed:ring-[#855636]"
            >
              <CareerPortrait career={career} className="mx-auto mt-2 w-[76%] max-w-[112px] overflow-hidden rounded-md border border-[#d4a571]" />
              <span className="flex min-h-[42px] flex-1 items-center justify-center px-1.5 py-1 text-center font-serif text-sm font-bold leading-tight">{career.title}</span>
            </button>
          ))}
        </div>

        <footer className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-between">
          <DiscoveryCareerPages page={page} onPageChange={onPageChange} />
          {allowLaunch && selected?.sceneId === 'discovery_moon' && (
            <button type="button" onClick={() => onStartCareer(selected)} className={controlClass + ' bg-[#70492e] text-[#fff2d8] hover:bg-[#533722]'}>
              {selected.buttonText}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
