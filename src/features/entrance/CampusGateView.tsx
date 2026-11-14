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
    <main className="min-h-dvh flex flex-col items-center justify-center px-4 py-6 sm:py-10 bg-gradient-to-b from-[var(--sky-warm-top)]/50 via-[var(--campus-canvas)] to-[var(--stone-light)]/55">
      <div className="w-full max-w-4xl space-y-5 text-center">
        {/* Taç Kapı Ana Sahne Kartı: Başlık, sahne ve eylemler tek bütüncül kampüs girişinde */}
        <div className="rounded-2xl bg-[var(--campus-surface)] border border-[var(--campus-border)] shadow-sm overflow-hidden">
          <div
            aria-hidden="true"
            className="h-1.5 w-full bg-gradient-to-r from-[var(--seljuk-navy)] via-[var(--seljuk-teal)] to-[var(--terracotta)]"
          />

          <div className="px-4 pt-5 pb-6 sm:px-8 sm:pt-6 sm:pb-7 space-y-4">
            <header className="space-y-1.5 max-w-2xl mx-auto">
              <p className="text-xs font-semibold text-[var(--seljuk-teal)] tracking-wide">
                Anadolu–Selçuklu Mimarisinden Esinlenen Dijital Yerleşke
              </p>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--seljuk-navy)]">
                Dijital Eğitim Kampüsü
              </h1>
              <p className="text-sm text-[var(--campus-ink-muted)]">
                Taş işçiliği ve geometrik yıldızlarla çerçevelenen kampüs kapısına dokunarak keşif
                avlusuna adım atabilirsin.
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

            <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsOpening(true)}
                disabled={isOpening}
                className="w-full sm:w-auto min-h-[46px] px-7 py-2.5 rounded-lg bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal-hover)] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-70"
              >
                <span>{isOpening ? 'Kapı Açılıyor...' : 'Kapıyı Aç ve İçeri Gir'}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onEnterCourtyard}
                className="w-full sm:w-auto min-h-[46px] px-5 py-2.5 rounded-lg border border-[var(--campus-border)] bg-[var(--stone-cream)] hover:bg-[var(--campus-surface-muted)] text-sm font-semibold text-[var(--seljuk-navy)] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <SkipForward className="w-4 h-4 text-[var(--campus-ink-muted)]" aria-hidden="true" />
                <span>Animasyonu Atla</span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs text-[var(--campus-ink-muted)] max-w-lg mx-auto pb-1">
          Bu kampüste ad, soyad, numara veya konum gibi kişisel bilgiler istenmez. Çalışmaların yalnızca
          kullandığın bu cihaz ve tarayıcıda saklanır.
        </p>
      </div>
    </main>
  );
}
