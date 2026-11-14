import { useEffect, useState } from 'react';
import { ArrowRight, SkipForward } from 'lucide-react';
import { CampusPortalGateSvg } from '@/src/components/svg/CampusPortalGateSvg';

interface CampusGateViewProps {
  onEnterCourtyard: () => void;
}

export function CampusGateView({ onEnterCourtyard }: CampusGateViewProps) {
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    if (!isOpening) return;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const delay = prefersReduced ? 120 : 760;
    const timer = window.setTimeout(() => {
      onEnterCourtyard();
    }, delay);
    return () => window.clearTimeout(timer);
  }, [isOpening, onEnterCourtyard]);

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-3 sm:px-6 py-4 sm:py-6 bg-gradient-to-b from-[var(--sky-warm-top)]/50 via-[var(--campus-canvas)] to-[var(--stone-light)]/55">
      <div className="w-full max-w-3xl space-y-3.5 text-center">
        {/* Taç Kapı Ana Sahne Kartı: Kapı ekranın odak noktası, başlık ve düğmeler dengeli hizada */}
        <div className="rounded-2xl bg-[var(--campus-surface)] border border-[var(--campus-border)] shadow-sm overflow-hidden">
          <div
            aria-hidden="true"
            className="h-1.5 w-full bg-gradient-to-r from-[var(--seljuk-navy)] via-[var(--seljuk-teal)] to-[var(--terracotta)]"
          />

          <div className="px-3.5 pt-4 pb-5 sm:px-6 sm:pt-5 sm:pb-6 space-y-3.5">
            <header className="space-y-1 max-w-xl mx-auto">
              <p className="text-[11px] sm:text-xs font-semibold text-[var(--seljuk-teal)] tracking-wide">
                Anadolu–Selçuklu Mimarisinden Esinlenen Dijital Yerleşke
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--seljuk-navy)]">
                Dijital Eğitim Kampüsü
              </h1>
              <p className="text-xs sm:text-sm text-[var(--campus-ink-muted)]">
                Taç kapıya dokunarak veya aşağıdaki düğmeyi kullanarak aydınlık keşif avlusuna adım atabilirsin.
              </p>
            </header>

            <button
              type="button"
              onClick={() => setIsOpening(true)}
              disabled={isOpening}
              aria-label="Kampüs kapısını aç ve içeri gir"
              className="w-full rounded-xl focus-visible:outline-3 focus-visible:outline-[var(--seljuk-teal)] cursor-pointer group block"
            >
              <CampusPortalGateSvg isOpen={isOpening} />
            </button>

            <div className="pt-0.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setIsOpening(true)}
                disabled={isOpening}
                className="sm:flex-1 min-h-[46px] px-6 py-2.5 rounded-lg bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal-hover)] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-70 whitespace-nowrap"
              >
                <span>{isOpening ? 'Kapı Açılıyor...' : 'Kapıyı Aç ve İçeri Gir'}</span>
                <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onEnterCourtyard}
                className="min-h-[46px] px-5 py-2.5 rounded-lg border border-[var(--campus-border)] bg-[var(--stone-cream)] hover:bg-[var(--campus-surface-muted)] text-sm font-semibold text-[var(--seljuk-navy)] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <SkipForward className="w-4 h-4 text-[var(--campus-ink-muted)] shrink-0" aria-hidden="true" />
                <span>Animasyonu Atla</span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs text-[var(--campus-ink-muted)] max-w-lg mx-auto">
          Bu kampüste ad, soyad, numara veya konum gibi kişisel bilgiler istenmez. Çalışmaların yalnızca
          kullandığın bu cihaz ve tarayıcıda saklanır.
        </p>
      </div>
    </main>
  );
}
