import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Sparkles, Map, HelpCircle } from 'lucide-react';
import type { InteractiveZone } from '../types';

interface WalkableControlsOverlayProps {
  activeZone: InteractiveZone | null;
  onTriggerInteraction: () => void;
  onVirtualDirection: (vx: number, vy: number) => void;
  onBackToMap: () => void;
  onDirectEnterClassroom?: () => void;
  unreachableMessage: string | null;
  currentScene: 'courtyard' | 'classroom';
}

export function WalkableControlsOverlay({
  activeZone,
  onTriggerInteraction,
  onVirtualDirection,
  onBackToMap,
  onDirectEnterClassroom,
  unreachableMessage,
  currentScene,
}: WalkableControlsOverlayProps) {
  const handlePointerDownDir = (e: React.PointerEvent<HTMLButtonElement>, vx: number, vy: number) => {
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Tarayıcı emniyet desteği
    }
    onVirtualDirection(vx, vy);
  };

  const handlePointerUpDir = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Emniyet
    }
    onVirtualDirection(0, 0);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none z-20">
      {/* Üst Çubuk: Bilgi Rozeti, Haritaya Dönüş ve Erişilebilir Kısayollar */}
      <header className="flex items-center justify-between gap-2">
        <div className="pointer-events-auto flex items-center gap-2 bg-[var(--campus-surface)]/95 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-[var(--campus-border)] shadow-xs">
          <Sparkles className="w-4 h-4 text-[var(--seljuk-teal)] shrink-0" aria-hidden="true" />
          <span className="text-xs sm:text-sm font-bold text-[var(--seljuk-navy)]">
            {currentScene === 'courtyard' ? 'Yürünebilir Kampüs Avlusu' : 'İngilizce Sınıfı'}
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          {currentScene === 'courtyard' && onDirectEnterClassroom && (
            <button
              type="button"
              onClick={onDirectEnterClassroom}
              className="min-h-[44px] px-3.5 py-1.5 rounded-lg bg-[var(--stone-cream)] hover:bg-[var(--campus-surface-muted)] text-[var(--seljuk-navy)] border border-[var(--campus-border)] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Klavyeyle yürümek yerine doğrudan sınıfa geç"
            >
              <span>Doğrudan Sınıfa Gir</span>
            </button>
          )}

          <button
            type="button"
            onClick={onBackToMap}
            className="min-h-[44px] px-3.5 py-1.5 rounded-lg bg-[var(--stone-cream)] hover:bg-[var(--campus-surface-muted)] text-[var(--seljuk-navy)] border border-[var(--campus-border)] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            aria-label="Kuşbakışı haritaya dön"
          >
            <Map className="w-4 h-4 text-[var(--seljuk-teal)]" aria-hidden="true" />
            <span className="hidden sm:inline">Kuşbakışı Harita</span>
          </button>
        </div>
      </header>

      {/* Orta Bildirim: Ulaşılamayan Nokta veya Etkileşim Bildirimi */}
      <div className="flex flex-col items-center gap-2">
        {unreachableMessage && (
          <div
            role="alert"
            className="pointer-events-auto animate-bounce bg-[var(--alert-rose-soft)] text-[var(--alert-rose)] text-xs font-bold px-4 py-2 rounded-full border border-[var(--alert-rose)]/40 shadow-md"
          >
            {unreachableMessage}
          </div>
        )}

        {/* Aktif Etkileşim Balonu (Örn: [E] İngilizce Sınıfına Gir / Akıllı Tahtayı Aç) */}
        {activeZone && (
          <div className="pointer-events-auto animate-pulse flex flex-col items-center gap-2 bg-[var(--campus-surface)]/95 backdrop-blur-md px-5 py-3 rounded-2xl border-2 border-[var(--seljuk-teal)] shadow-xl text-center">
            <p className="text-xs sm:text-sm font-bold text-[var(--seljuk-navy)]">
              {activeZone.prompt}
            </p>
            <button
              type="button"
              onClick={onTriggerInteraction}
              className="min-h-[48px] px-6 py-2 rounded-xl bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal-hover)] text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>Etkileşimi Başlat [E]</span>
            </button>
          </div>
        )}
      </div>

      {/* Alt Çubuk: Klavye Yardım İpucu ve Mobil Dokunmatik D-Pad */}
      <footer className="flex items-end justify-between gap-4">
        {/* Sol Alt: Mobil Dokunmatik D-Pad (Touch-friendly 44x44+ hedefler) */}
        <div
          className="pointer-events-auto grid grid-cols-3 gap-1.5 w-36 h-36 bg-[var(--campus-surface)]/90 backdrop-blur-xs p-2 rounded-2xl border border-[var(--campus-border)] shadow-md sm:hidden touch-none"
          role="group"
          aria-label="Dokunmatik yön kontrolleri"
        >
          <div />
          <button
            type="button"
            onPointerDown={(e) => handlePointerDownDir(e, 0, -1)}
            onPointerUp={handlePointerUpDir}
            onPointerLeave={handlePointerUpDir}
            onPointerCancel={handlePointerUpDir}
            onLostPointerCapture={handlePointerUpDir}
            className="min-h-[44px] min-w-[44px] rounded-xl bg-[var(--stone-cream)] active:bg-[var(--seljuk-teal)] active:text-white flex items-center justify-center text-[var(--seljuk-navy)] border border-[var(--campus-border)] cursor-pointer touch-none select-none"
            aria-label="Yukarı"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div />

          <button
            type="button"
            onPointerDown={(e) => handlePointerDownDir(e, -1, 0)}
            onPointerUp={handlePointerUpDir}
            onPointerLeave={handlePointerUpDir}
            onPointerCancel={handlePointerUpDir}
            onLostPointerCapture={handlePointerUpDir}
            className="min-h-[44px] min-w-[44px] rounded-xl bg-[var(--stone-cream)] active:bg-[var(--seljuk-teal)] active:text-white flex items-center justify-center text-[var(--seljuk-navy)] border border-[var(--campus-border)] cursor-pointer touch-none select-none"
            aria-label="Sol"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center justify-center text-[10px] font-bold text-[var(--campus-ink-muted)] select-none">
            D-PAD
          </div>
          <button
            type="button"
            onPointerDown={(e) => handlePointerDownDir(e, 1, 0)}
            onPointerUp={handlePointerUpDir}
            onPointerLeave={handlePointerUpDir}
            onPointerCancel={handlePointerUpDir}
            onLostPointerCapture={handlePointerUpDir}
            className="min-h-[44px] min-w-[44px] rounded-xl bg-[var(--stone-cream)] active:bg-[var(--seljuk-teal)] active:text-white flex items-center justify-center text-[var(--seljuk-navy)] border border-[var(--campus-border)] cursor-pointer touch-none select-none"
            aria-label="Sağ"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <div />
          <button
            type="button"
            onPointerDown={(e) => handlePointerDownDir(e, 0, 1)}
            onPointerUp={handlePointerUpDir}
            onPointerLeave={handlePointerUpDir}
            onPointerCancel={handlePointerUpDir}
            onLostPointerCapture={handlePointerUpDir}
            className="min-h-[44px] min-w-[44px] rounded-xl bg-[var(--stone-cream)] active:bg-[var(--seljuk-teal)] active:text-white flex items-center justify-center text-[var(--seljuk-navy)] border border-[var(--campus-border)] cursor-pointer touch-none select-none"
            aria-label="Aşağı"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <div />
        </div>

        {/* Sağ Alt / Masaüstü Yardımcı İpucu */}
        <div className="hidden sm:flex pointer-events-auto items-center gap-2 bg-[var(--campus-surface)]/90 backdrop-blur-xs px-4 py-2 rounded-xl border border-[var(--campus-border)] text-xs text-[var(--campus-ink-muted)]">
          <HelpCircle className="w-4 h-4 text-[var(--seljuk-teal)]" />
          <span>
            <strong className="text-[var(--seljuk-navy)]">Yön Tuşları</strong> veya{' '}
            <strong className="text-[var(--seljuk-navy)]">W-A-S-D</strong> ile yürü • Yere{' '}
            <strong className="text-[var(--seljuk-navy)]">tıkla</strong> • Yaklaşınca{' '}
            <strong className="text-[var(--seljuk-navy)]">[E]</strong> ile etkileşime gir
          </span>
        </div>
      </footer>
    </div>
  );
}
