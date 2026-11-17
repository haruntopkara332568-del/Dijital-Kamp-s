import { useEffect, useRef } from 'react';
import { Compass, BookOpen, Palette, Share2, ArrowLeft } from 'lucide-react';
import { MissionRunnerView } from '@/src/features/missions/MissionRunnerView';
import { HelloGardenView } from '@/src/features/missions/HelloGardenView';
import { Grade3OgrenStationView } from '@/src/features/missions/Grade3OgrenStationView';
import { Grade3UretStationView } from '@/src/features/missions/Grade3UretStationView';
import { useOptionalCampus } from '@/src/app/CampusProviders';
import type { MissionStageId } from '@/src/types/campus';

export interface TableStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  stage: MissionStageId;
  missionId?: string;
  onAdvanceToStage?: (nextStage: MissionStageId) => void;
}

const STAGE_CONFIG: Record<
  MissionStageId,
  {
    title: string;
    subtitle: string;
    icon: typeof Compass;
    badgeColor: string;
    headerBg: string;
    borderColor: string;
  }
> = {
  kesfet: {
    title: '1. KEŞFET MASASI',
    subtitle: 'Kapıları İncele, Tarihî ve Kültürel Miras Rotalarını Keşfet',
    icon: Compass,
    badgeColor: 'bg-[#0e768a]',
    headerBg: 'bg-[#1b2b32]',
    borderColor: 'border-[#0e768a]',
  },
  ogren: {
    title: '2. ÖĞREN MASASI',
    subtitle: 'İngilizce Kelimeleri Dinle, Anlamlarını Eşleştir ve Keşfet',
    icon: BookOpen,
    badgeColor: 'bg-[#1d6b8a]',
    headerBg: 'bg-[#182830]',
    borderColor: 'border-[#1d6b8a]',
  },
  uret: {
    title: '3. ÜRET MASASI',
    subtitle: 'Kendi Özgün Kapını Çiz, Şekiller Ekle ve Tasarımını Açıkla',
    icon: Palette,
    badgeColor: 'bg-[#b45309]',
    headerBg: 'bg-[#2b1f14]',
    borderColor: 'border-[#d97706]',
  },
  paylas: {
    title: '4. PAYLAŞ MASASI',
    subtitle: 'Tasarladığın Kapıyı Değerlendir, PNG Olarak İndir ve Tamamla',
    icon: Share2,
    badgeColor: 'bg-[#047857]',
    headerBg: 'bg-[#13271f]',
    borderColor: 'border-[#10b981]',
  },
};

function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  const candidates = Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );

  return candidates.filter((el) => {
    if (el.hasAttribute('disabled') || el.getAttribute('aria-hidden') === 'true') {
      return false;
    }
    if (typeof window !== 'undefined' && window.getComputedStyle) {
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') {
        return false;
      }
    }
    return true;
  });
}

export function TableStationModal({
  isOpen,
  onClose,
  stage,
  missionId = 'kapilarin-anlattigi-hikaye',
  onAdvanceToStage,
}: TableStationModalProps) {
  const campus = useOptionalCampus();
  const selectedGrade = campus?.state.selectedGrade ?? null;
  const isGrade3HelloGarden = selectedGrade === 3 && stage === 'kesfet';
  const isGrade3OgrenStation = selectedGrade === 3 && stage === 'ogren';
  const isGrade3UretStation = selectedGrade === 3 && stage === 'uret';

  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previousActiveElementRef.current = document.activeElement as HTMLElement | null;

    const focusTimer = setTimeout(() => {
      const focusables = getFocusableElements(modalRef.current);
      if (focusables.length > 0) {
        focusables[0].focus();
      } else if (modalRef.current) {
        modalRef.current.focus();
      }
    }, 40);

    return () => {
      clearTimeout(focusTimer);
      if (
        previousActiveElementRef.current &&
        typeof previousActiveElementRef.current.focus === 'function' &&
        document.body.contains(previousActiveElementRef.current)
      ) {
        previousActiveElementRef.current.focus();
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusables = getFocusableElements(modalRef.current);
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const currentActive = document.activeElement;

        if (e.shiftKey) {
          if (currentActive === first || !modalRef.current?.contains(currentActive)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (currentActive === last || !modalRef.current?.contains(currentActive)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentConfig = STAGE_CONFIG[stage] ?? STAGE_CONFIG.kesfet;
  const StageIcon = currentConfig.icon;

  const headerTitle = isGrade3HelloGarden
    ? '1. KEŞFET MASASI — GREETINGS (SELAMLAŞMA)'
    : isGrade3OgrenStation
      ? '2. ÖĞREN MASASI — GREETINGS (DİNLE VE ANLA)'
      : isGrade3UretStation
        ? '3. ÜRET MASASI — GREETINGS (CÜMLEMİ OLUŞTUR)'
        : currentConfig.title;
  const headerSubtitle = isGrade3HelloGarden
    ? 'Dört Temel Selamlaşma İfadesini Keşfet, Dinle ve Görselleriyle Eşleştir'
    : isGrade3OgrenStation
      ? 'Dört Temel Selamlaşma İfadesini Dinle, Görseli Bul ve Sesleri Ayırt Et'
      : isGrade3UretStation
        ? 'Dört Temel Selamlaşma İfadesini Kartlarla Oluştur ve Görsellerle Pekiştir'
        : currentConfig.subtitle;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="table-station-title"
      aria-describedby="table-station-desc"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`relative w-full max-w-6xl h-[94vh] max-h-[920px] flex flex-col bg-[var(--campus-surface)] rounded-2xl border-4 ${currentConfig.borderColor} shadow-2xl overflow-hidden outline-none`}
      >
        {/* Selçuklu Masif Ahşap ve Çini Üst Çerçeve */}
        <div
          className={`${currentConfig.headerBg} text-[#fbf0d9] px-4 py-2.5 flex items-center justify-between border-b-2 border-[#a66414] shadow-sm`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg ${currentConfig.badgeColor} text-white flex items-center justify-center shadow-inner border border-white/20`}
            >
              <StageIcon className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="table-station-title"
                  className="text-xs sm:text-sm font-bold tracking-wide text-[#fef08a] font-serif"
                >
                  {headerTitle}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/20 hidden sm:inline-block">
                  {isGrade3HelloGarden ? 'Özel Prototip' : 'Öğrenme İstasyonu'}
                </span>
              </div>
              <p
                id="table-station-desc"
                className="text-[10px] text-[var(--stone-cream)] opacity-90 hidden sm:block"
              >
                {headerSubtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-3.5 py-1.5 rounded-lg bg-[var(--stone-cream)] hover:bg-[var(--campus-surface-muted)] text-[var(--seljuk-navy)] font-semibold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
            aria-label="Masadan kalk ve sınıfa dön"
          >
            <ArrowLeft className="w-4 h-4 text-[var(--seljuk-teal)]" aria-hidden="true" />
            <span>Masadan Kalk / Sınıfa Dön</span>
          </button>
        </div>

        {/* Görev İstasyonu İçeriği */}
        <div className="flex-1 overflow-y-auto">
          {isGrade3HelloGarden ? (
            <HelloGardenView
              missionId={missionId}
              onExitToClassroom={onClose}
              onAdvanceToNextTable={onAdvanceToStage}
            />
          ) : isGrade3OgrenStation ? (
            <Grade3OgrenStationView
              missionId={missionId}
              onExitToClassroom={onClose}
              onAdvanceToNextTable={onAdvanceToStage}
            />
          ) : isGrade3UretStation ? (
            <Grade3UretStationView
              missionId={missionId}
              onExitToClassroom={onClose}
              onAdvanceToNextTable={onAdvanceToStage}
            />
          ) : (
            <MissionRunnerView
              missionId={missionId}
              focusedStage={stage}
              onExitToClassroom={onClose}
              onAdvanceToNextTable={onAdvanceToStage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
