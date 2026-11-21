import { useEffect, useState } from 'react';
import { ArrowRight, SkipForward, Sparkles } from 'lucide-react';
import { CAMPUS_BRAND } from '@/src/data/brandConfig';
import { FullscreenButton } from '@/src/components/FullscreenButton';

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

  const handleOpenGate = () => {
    if (!isOpening) {
      setIsOpening(true);
    }
  };

  return (
    <main className="min-h-dvh w-full flex flex-col items-center justify-center px-2 sm:px-5 py-2 sm:py-3 bg-gradient-to-b from-[var(--sky-warm-top)]/40 via-[var(--campus-canvas)] to-[var(--stone-light)]/45 select-none">
      <div className="w-full max-w-[min(98vw,calc((100dvh-165px)*16/9+40px))] flex flex-col space-y-2 text-center">
        <FullscreenButton className="self-end" showText={false} />
        {/* Taç Kapı Ana Sahne Kartı: Sinematik 3D Animasyon Taç Kapı */}
        <div className="rounded-2xl bg-[var(--campus-surface)] border border-[var(--campus-border)] shadow-md overflow-hidden">
          <div
            aria-hidden="true"
            className="h-1.5 w-full bg-gradient-to-r from-[var(--seljuk-navy)] via-[var(--seljuk-teal)] to-[var(--terracotta)]"
          />

          <div className="px-3 pt-2.5 pb-3.5 sm:px-5 sm:pt-3.5 sm:pb-4 space-y-2.5">
            <header className="mx-auto max-w-2xl space-y-0.5 px-1">
              <h1 className="sr-only">{CAMPUS_BRAND.name}</h1>
              <p className="text-sm sm:text-base font-semibold leading-snug text-[var(--seljuk-navy)]">
                {CAMPUS_BRAND.subtitle}
              </p>
              <p className="text-sm font-normal leading-relaxed text-[var(--campus-ink-muted)]">
                {CAMPUS_BRAND.slogan}.
              </p>
            </header>

            {/* Sinematik 3D Taç Kapı Görsel Çerçevesi */}
            <div className="relative rounded-xl overflow-hidden border border-[var(--campus-border)] shadow-inner w-full max-w-[min(100%,calc((100dvh-215px)*16/9))] mx-auto bg-[var(--stone-cream)]">
              <button
                type="button"
                onClick={handleOpenGate}
                disabled={isOpening}
                aria-label="Kampüs kapısını aç ve içeri gir"
                className="group relative w-full block cursor-pointer focus-visible:outline-3 focus-visible:outline-[var(--seljuk-teal)]"
              >
                <img
                  src="/assets/entrance/campus_portal_gate.jpg"
                  alt="Anadolu-Selçuklu mimarisinden esinlenen, üzerinde Yeni Nesil Külliye kitabesi yer alan mukarnaslı Taç Kapı"
                  className={`w-full h-auto aspect-[16/9] object-cover saturate-[.88] contrast-[1.07] motion-safe:transition-transform duration-700 ease-out ${
                    isOpening ? 'motion-safe:scale-105 brightness-105' : 'motion-safe:group-hover:scale-[1.01]'
                  }`}
                  loading="eager"
                  decoding="sync"
                />

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_54%,transparent_31%,rgba(55,38,24,.24)_100%)]"
                />

                {/* Açılış Işıması Katmanı (Aura / Işık Patlaması) */}
                <div
                  aria-hidden="true"
                  className={`absolute inset-0 bg-radial from-[var(--stone-cream)]/35 to-transparent motion-safe:transition-opacity duration-700 pointer-events-none ${
                    isOpening ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                {/* Kapı Üstü Etkileşim İpucu Rozeti */}
                {!isOpening && (
                  <div className="absolute bottom-3 left-1/2 w-max max-w-[calc(100%-1rem)] -translate-x-1/2 pointer-events-none hidden sm:flex items-center gap-1.5 bg-[var(--seljuk-navy)]/90 text-[var(--stone-cream)] text-xs font-semibold px-3 py-1 rounded-full border border-white/20 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 shrink-0 text-[var(--sandstone-gold)]" aria-hidden="true" />
                    <span>Kapıya Dokun veya Aşağıdaki Düğmeyi Kullan</span>
                  </div>
                )}
              </button>
            </div>

            {/* Aksiyon Düğmeleri */}
            <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 max-w-md mx-auto">
              <button
                type="button"
                onClick={handleOpenGate}
                disabled={isOpening}
                className="sm:flex-1 min-h-[46px] px-6 py-2.5 rounded-lg bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal-hover)] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-70 whitespace-nowrap shadow-sm"
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
