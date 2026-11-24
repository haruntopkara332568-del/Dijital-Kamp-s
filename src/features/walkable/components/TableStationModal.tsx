import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Compass, BookOpen, Palette, Share2, ArrowLeft } from 'lucide-react';
import { MissionRunnerView } from '@/src/features/missions/MissionRunnerView';
import { HelloGardenView } from '@/src/features/missions/HelloGardenView';
import { Grade3OgrenStationView } from '@/src/features/missions/Grade3OgrenStationView';
import { Grade3UretStationView } from '@/src/features/missions/Grade3UretStationView';
import { Grade3PaylasStationView } from '@/src/features/missions/Grade3PaylasStationView';
import { useOptionalCampus } from '@/src/app/CampusProviders';
import { GRADE_3_STAGE_2 } from '@/src/data/grade3Stage2Content';
import { GRADE_3_STAGE_3 } from '@/src/data/grade3Stage3Content';
import { GRADE_3_STAGE_4 } from '@/src/data/grade3Stage4Content';
import { GRADE_3_STAGE_5 } from '@/src/data/grade3Stage5Content';
import { Grade3StageTwoView } from '@/src/features/missions/Grade3StageTwoView';
import { Grade3StageThreeView } from '@/src/features/missions/Grade3StageThreeView';
import { Grade3StageFourView } from '@/src/features/missions/Grade3StageFourView';
import type { MissionStageId } from '@/src/types/campus';

const Grade3StageFiveView = lazy(() =>
  import('@/src/features/missions/Grade3StageFiveView').then(({ Grade3StageFiveView }) => ({ default: Grade3StageFiveView })),
);

export interface TableStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  stage: MissionStageId;
  missionId?: string;
  enableGrade3StageTwo?: boolean;
  enableGrade3StageThree?: boolean;
  enableGrade3StageFour?: boolean;
  enableGrade3StageFive?: boolean;
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
  enableGrade3StageTwo = false,
  enableGrade3StageThree = false,
  enableGrade3StageFour = false,
  enableGrade3StageFive = false,
}: TableStationModalProps) {
  const campus = useOptionalCampus();
  const selectedGrade = campus?.state.selectedGrade ?? null;
  const [selectedStage, setSelectedStage] = useState<1 | 2 | 3 | 4 | 5>(1);
  const canSelectStageTwo = enableGrade3StageTwo && selectedGrade === 3;
  const canSelectStageThree = enableGrade3StageThree && selectedGrade === 3;
  const showStageTwo = canSelectStageTwo && selectedStage === 2;
  const showStageThree = canSelectStageThree && selectedStage === 3;
  const canSelectStageFour = enableGrade3StageFour && selectedGrade === 3;
  const showStageFour = canSelectStageFour && selectedStage === 4;
  const canSelectStageFive = enableGrade3StageFive && selectedGrade === 3;
  const showStageFive = canSelectStageFive && selectedStage === 5;
  const stageChoices = [
    { id: 1, label: GRADE_3_STAGE_2.firstStageLabel, enabled: true },
    { id: 2, label: GRADE_3_STAGE_2.secondStageLabel, enabled: canSelectStageTwo },
    { id: 3, label: GRADE_3_STAGE_3.stageLabel, enabled: canSelectStageThree },
    { id: 4, label: GRADE_3_STAGE_4.stageLabel, enabled: canSelectStageFour },
    { id: 5, label: GRADE_3_STAGE_5.stageLabel, enabled: canSelectStageFive },
  ] as const;
  const isGrade3HelloGarden = selectedGrade === 3 && stage === 'kesfet';
  const isGrade3OgrenStation = selectedGrade === 3 && stage === 'ogren';
  const isGrade3UretStation = selectedGrade === 3 && stage === 'uret';
  const isGrade3PaylasStation = selectedGrade === 3 && stage === 'paylas';

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
        : isGrade3PaylasStation
          ? '4. PAYLAŞ MASASI — GREETINGS (BİRLİKTE KONUŞALIM)'
          : currentConfig.title;
  const headerSubtitle = isGrade3HelloGarden
    ? 'Dört Temel Selamlaşma İfadesini Keşfet, Dinle ve Görselleriyle Eşleştir'
    : isGrade3OgrenStation
      ? 'Dört Temel Selamlaşma İfadesini Dinle, Görseli Bul ve Sesleri Ayırt Et'
      : isGrade3UretStation
        ? 'Dört Temel Selamlaşma İfadesini Kartlarla Oluştur ve Görsellerle Pekiştir'
        : isGrade3PaylasStation
          ? 'Selamlaşma İfadelerini Günlük Durumlarda Kullan ve Karşılıklı Konuş'
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
                  {showStageFive ? GRADE_3_STAGE_5.stageLabel : showStageFour ? GRADE_3_STAGE_4.stageLabel : showStageThree ? GRADE_3_STAGE_3.stageLabel : showStageTwo ? GRADE_3_STAGE_2.secondStageLabel : headerTitle}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/20 hidden sm:inline-block">
                  {isGrade3HelloGarden && !showStageTwo && !showStageThree && !showStageFour && !showStageFive ? 'Özel Prototip' : 'Öğrenme İstasyonu'}
                </span>
              </div>
              <p
                id="table-station-desc"
                className="text-[10px] text-[var(--stone-cream)] opacity-90 hidden sm:block"
              >
                {showStageFive ? GRADE_3_STAGE_5.stageHint : showStageFour ? GRADE_3_STAGE_4.stageHint : showStageThree ? GRADE_3_STAGE_3.stageHint : showStageTwo ? GRADE_3_STAGE_2.stageHint : headerSubtitle}
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
          {(canSelectStageTwo || canSelectStageThree || canSelectStageFour || canSelectStageFive) && (
            <div role="group" aria-label="3. sınıf aşamaları" className="flex flex-wrap gap-2 border-b border-[var(--campus-border)] px-3 py-2 sm:px-5">
              {stageChoices.filter(({ enabled }) => enabled).map(({ id, label }) => (
                <button type="button" key={id} aria-pressed={id === (showStageFive ? 5 : showStageFour ? 4 : showStageThree ? 3 : showStageTwo ? 2 : 1)}
                  className="min-h-[44px] rounded-lg border border-[var(--campus-border)] bg-[var(--campus-surface)] px-3 py-2 text-sm font-semibold text-[var(--seljuk-navy)] aria-pressed:border-[var(--seljuk-teal)] aria-pressed:bg-[var(--seljuk-teal-soft)] focus-visible:outline-2 focus-visible:outline-[var(--seljuk-teal)]"
                  onClick={() => setSelectedStage(id)}>
                  {label}
                </button>
              ))}
            </div>
          )}
          {showStageFive ? (
            <Suspense fallback={<p role="status" className="p-4">Etkinlik hazırlanıyor…</p>}>
              <Grade3StageFiveView key={campus?.activeProfile?.id + ":" + stage} entryTable={stage} />
            </Suspense>
          ) : showStageFour ? (
            <Grade3StageFourView key={`${campus?.activeProfile?.id ?? ''}:${stage}`} entryTable={stage} onClose={onClose} />
          ) : showStageThree ? (
            <Grade3StageThreeView key={`${campus?.activeProfile?.id ?? ''}:${stage}`} entryTable={stage} />
          ) : showStageTwo ? (
            <Grade3StageTwoView key={`${campus?.activeProfile?.id ?? ''}:${stage}`} entryTable={stage} />
          ) : isGrade3HelloGarden ? (
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
          ) : isGrade3PaylasStation ? (
            <Grade3PaylasStationView
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
