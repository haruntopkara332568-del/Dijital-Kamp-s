import React, { useEffect, useRef } from 'react';
import { CAREER_LIST, type CareerDefinition } from '@/src/data/discoveryCareerConfig';

interface DiscoveryCareerModalProps {
  isOpen: boolean;
  onSelectCareer: (career: CareerDefinition) => void;
  onClose: () => void;
}

export const DiscoveryCareerModal: React.FC<DiscoveryCareerModalProps> = ({
  isOpen,
  onSelectCareer,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);
  const isActionTakenRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      isActionTakenRef.current = false;
      return;
    }

    // Ekran açılınca odak birincil eylem düğmesine / karta gider
    const timer = setTimeout(() => {
      primaryButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Tab döngüsünün modal içinde kalmasını sağla (Focus Trap)
      if (e.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleStartMission = (career: CareerDefinition) => {
    // Çift tıklamayı engelle
    if (isActionTakenRef.current) return;
    isActionTakenRef.current = true;
    onSelectCareer(career);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="career-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-lg bg-stone-900 border-2 border-amber-600/60 rounded-3xl p-6 sm:p-8 shadow-2xl text-stone-100 flex flex-col items-center"
      >
        {/* Üst Kısım: Başlık ve Kapat (Gözlüğü Çıkar) */}
        <div className="w-full flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-semibold tracking-wider uppercase text-cyan-300">
              Sanal Gerçeklik Deneyimi
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-300 bg-stone-800/90 hover:bg-stone-700 hover:text-white border border-stone-700 transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
            title="Gözlüğü Çıkar (Esc)"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Gözlüğü Çıkar</span>
          </button>
        </div>

        {/* Ana Soru */}
        <h2
          id="career-modal-title"
          className="text-xl sm:text-2xl font-bold text-center text-amber-100 mt-5 mb-6"
        >
          Hangi mesleği keşfetmek istersin?
        </h2>

        {/* Meslek Kartları Listesi (Tek meslek: Astronot) */}
        <div className="w-full flex justify-center">
          {CAREER_LIST.map((career) => (
            <div
              key={career.id}
              className="w-full max-w-sm bg-stone-950/90 border border-stone-700/80 rounded-2xl p-4 sm:p-5 flex flex-col items-center shadow-lg transition-transform hover:scale-[1.01]"
            >
              {/* Kart Görseli */}
              <div className="relative w-full h-44 sm:h-48 rounded-xl overflow-hidden bg-stone-900 border border-stone-800 mb-4 flex items-center justify-center">
                <img
                  src={career.imageUrl}
                  alt={career.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Görsel yüklenemezse yer tutucu göster
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                {/* Yedek yer tutucu (görsel henüz yoksa veya yüklenemezse) */}
                <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center bg-gradient-to-b from-stone-800 to-stone-900 text-stone-300">
                  <div className="w-16 h-16 rounded-full bg-cyan-900/60 border border-cyan-500/50 flex items-center justify-center mb-2">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <span className="text-sm font-semibold">{career.title}</span>
                </div>
              </div>

              {/* Meslek Başlığı */}
              <h3 className="text-lg font-bold text-white mb-1">
                {career.title}
              </h3>
              <p className="text-xs text-stone-400 mb-5 text-center">
                Ay yüzeyine in ve ilk keşif adımlarını at!
              </p>

              {/* Başlama Düğmesi (En az 44x44 dokunma alanı) */}
              <button
                ref={primaryButtonRef}
                type="button"
                onClick={() => handleStartMission(career)}
                className="w-full min-h-[48px] px-6 py-3 rounded-xl font-bold text-stone-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-md transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{career.buttonText}</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          ))}
        </div>

        {/* Alt Bilgi */}
        <p className="text-[11px] text-stone-400 mt-5 text-center">
          İstediğin zaman sınıfa dönmek için klavyede <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-300">Esc</kbd> tuşuna veya yukarıdaki düğmeye basabilirsin.
        </p>
      </div>
    </div>
  );
};
