import { useEffect, useState } from 'react';
import { ArrowRight, SkipForward, Sparkles } from 'lucide-react';
import { CAMPUS_BRAND, CAMPUS_INSCRIPTION_NAMES } from '@/src/data/brandConfig';
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
      <div className="w-full max-w-[min(98vw,calc((100dvh-155px)*16/9+40px))] space-y-2 text-center">
        {/* Taç Kapı Ana Sahne Kartı: Sinematik 3D Animasyon Taç Kapı */}
        <div className="rounded-2xl bg-[var(--campus-surface)] border border-[var(--campus-border)] shadow-md overflow-hidden">
          <div
            aria-hidden="true"
            className="h-1.5 w-full bg-gradient-to-r from-[var(--seljuk-navy)] via-[var(--seljuk-teal)] to-[var(--terracotta)]"
          />

          <div className="px-3 pt-2.5 pb-3.5 sm:px-5 sm:pt-3.5 sm:pb-4 space-y-2.5">
            <header className="space-y-0.5 max-w-2xl mx-auto">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[var(--seljuk-navy)]">
                {CAMPUS_BRAND.name}
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-[var(--seljuk-teal)]">
                {CAMPUS_BRAND.subtitle}
              </p>
              <p className="text-xs sm:text-sm font-medium text-[var(--campus-ink-muted)]">
                {CAMPUS_BRAND.slogan}
              </p>
            </header>

            {/* Sinematik 3D Taç Kapı Görsel Çerçevesi */}
            <div className="relative rounded-xl overflow-hidden border border-[var(--campus-border)] shadow-inner w-full max-w-[min(100%,calc((100dvh-205px)*16/9))] mx-auto bg-[var(--stone-cream)]">
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
                  className={`w-full h-auto aspect-[16/9] object-cover transition-transform duration-700 ease-out ${
                    isOpening ? 'scale-105 filter brightness-110' : 'group-hover:scale-[1.01]'
                  }`}
                  loading="eager"
                  decoding="sync"
                />

                {/* Kapı görseli üzerindeki anıtsal taş kitabe bilgisi (ekran okuyucu ve erişilebilirlik) */}
                <span className="sr-only">{CAMPUS_INSCRIPTION_NAMES.brand}</span>

                {/* Açılış Işıması Katmanı (Aura / Işık Patlaması) */}
                <div
                  aria-hidden="true"
                  className={`absolute inset-0 bg-radial from-[var(--sandstone-gold-soft)]/50 via-[var(--sky-warm-top)]/30 to-transparent transition-opacity duration-700 pointer-events-none ${
                    isOpening ? 'opacity-100' : 'opacity-0 group-hover:opacity-30'
                  }`}
                />

                {/* Kapı Üstü Etkileşim İpucu Rozeti */}
                {!isOpening && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none flex items-center gap-1.5 bg-[var(--seljuk-navy)]/80 text-[var(--stone-cream)] text-[11px] sm:text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-xs border border-white/20 shadow-sm opacity-90 group-hover:opacity-100 transition-opacity">
                    <Sparkles className="w-3.5 h-3.5 text-[var(--sandstone-gold)]" aria-hidden="true" />
                    <span>Kapıya Dokun veya Aşağıdaki Düğmeyi Kullan</span>
                  </div>
                )}
              </button>
            </div>

            {/* Aksiyon Düğmeleri */}
            <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 max-w-xl mx-auto">
              <button
                type="button"
                onClick={handleOpenGate}
                disabled={isOpening}
                className="sm:flex-1 min-h-[46px] px-6 py-2.5 rounded-lg bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal-hover)] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-70 whitespace-nowrap shadow-sm"
              >
                <span>{isOpening ? 'Kapı Açılıyor...' : 'Kapıyı Aç ve İçeri Gir'}</span>
                <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </button>

              <FullscreenButton variant="prominent" />

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
