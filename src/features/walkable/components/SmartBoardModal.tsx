import { useEffect, useRef } from 'react';
import { Tv, ArrowLeft } from 'lucide-react';
import { MissionRunnerView } from '@/src/features/missions/MissionRunnerView';
import { Grade3SmartBoardAdventureView } from '@/src/features/missions/Grade3SmartBoardAdventureView';
import { useOptionalCampus } from '@/src/app/CampusProviders';

interface SmartBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  missionId?: string;
}

/**
 * Modal içindeki görünür ve etkin odaklanabilir öğeleri filtreler.
 * Devre dışı (disabled) veya gizli öğeleri hariç tutar.
 */
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

export function SmartBoardModal({
  isOpen,
  onClose,
  missionId = 'kapilarin-anlattigi-hikaye',
}: SmartBoardModalProps) {
  const campus = useOptionalCampus();
  const selectedGrade = campus?.state.selectedGrade ?? null;
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Modal açıldığında önceki odağı sakla ve ilk odaklanabilir öğeye odaklan; kapandığında odağı geri yükle
  useEffect(() => {
    if (!isOpen) return;

    previousActiveElementRef.current = document.activeElement as HTMLElement | null;

    // Modal açıldığında ilk odaklanabilir öğeye (kapat butonu vb.) odaklan
    const focusTimer = setTimeout(() => {
      const focusables = getFocusableElements(modalRef.current);
      if (focusables.length > 0) {
        focusables[0].focus();
      } else if (modalRef.current) {
        modalRef.current.focus();
      }
    }, 30);

    return () => {
      clearTimeout(focusTimer);
      // Modal kapandığında odağı önceki elemana veya canvas oyun alanına iade et
      if (
        previousActiveElementRef.current &&
        typeof previousActiveElementRef.current.focus === 'function' &&
        document.body.contains(previousActiveElementRef.current)
      ) {
        previousActiveElementRef.current.focus();
      } else {
        const canvas = document.querySelector('canvas');
        if (canvas && typeof canvas.focus === 'function') {
          canvas.focus();
        }
      }
    };
  }, [isOpen]);

  // Escape tuşu ile kapatma ve Tab / Shift+Tab odak tuzağı (Focus Trap)
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
          // Geriye sekme (Shift+Tab): İlk elemandaysa veya modal dışındaysa en son elemana dön
          if (currentActive === first || !modalRef.current?.contains(currentActive)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          // İleriye sekme (Tab): Son elemandaysa veya modal dışındaysa en ilk elemana dön
          if (currentActive === last || !modalRef.current?.contains(currentActive)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[var(--seljuk-navy-deep)]/85 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="smartboard-title"
      aria-describedby="smartboard-desc"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-6xl h-[94vh] max-h-[900px] flex flex-col bg-[var(--campus-surface)] rounded-2xl border-4 border-[#6b5a44] shadow-2xl overflow-hidden outline-none"
      >
        {/* Akıllı Tahta Üst Çerçevesi (Ahşap & Metal Kasa) */}
        <div className="bg-[#6b5a44] text-[#fbf0d9] px-4 py-2 flex items-center justify-between border-b-2 border-[#a66414]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--seljuk-teal)] text-white flex items-center justify-center">
              <Tv className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 id="smartboard-title" className="text-xs sm:text-sm font-bold tracking-wide">
                İngilizce Sınıfı — Etkileşimli Akıllı Tahta
              </h2>
              <p id="smartboard-desc" className="text-[10px] text-[var(--stone-cream)] opacity-90 hidden sm:block">
                Etkinlik tamamlandığında veya kapatıldığında doğrudan sınıfa döneceksin.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-3.5 py-1.5 rounded-lg bg-[var(--stone-cream)] hover:bg-[var(--campus-surface-muted)] text-[var(--seljuk-navy)] font-semibold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            aria-label="Akıllı tahtayı kapat ve sınıfa dön"
          >
            <ArrowLeft className="w-4 h-4 text-[var(--seljuk-teal)]" aria-hidden="true" />
            <span>Sınıfa Dön</span>
          </button>
        </div>

        {/* Akıllı Tahta Ekran İçi: 3. Sınıf için Sultanhanı Macerası, Diğerleri için Standart Görev */}
        <div className="flex-1 overflow-y-auto">
          {selectedGrade === 3 ? (
            <Grade3SmartBoardAdventureView onExitToClassroom={onClose} />
          ) : (
            <MissionRunnerView missionId={missionId} />
          )}
        </div>
      </div>
    </div>
  );
}
