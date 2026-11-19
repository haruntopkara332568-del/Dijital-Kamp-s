import React, { useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Compass,
  Volume2,
  VolumeX,
  X,
  HelpCircle,
  DoorOpen,
  GraduationCap,
} from 'lucide-react';
import { useOptionalCampus } from '@/src/app/CampusProviders';
import { STUDENT_AVATARS } from '@/src/types/campus';
import type { InteractiveZone } from '../types';

interface WalkableControlsOverlayProps {
  activeZone: InteractiveZone | null;
  onTriggerInteraction: () => void;
  onVirtualDirection: (vx: number, vy: number) => void;
  onBackToMap?: () => void;
  onDirectEnterClassroom?: () => void;
  onExitClassroom?: () => void;
  unreachableMessage: string | null;
  currentScene: 'courtyard' | 'classroom' | 'sultanhani_square';
}

export function WalkableControlsOverlay({
  activeZone,
  onTriggerInteraction,
  onVirtualDirection,
  onExitClassroom,
  unreachableMessage,
  currentScene,
}: WalkableControlsOverlayProps) {
  const campus = useOptionalCampus();
  const selectedGrade = campus?.state.selectedGrade ?? null;
  const speechEnabled = campus?.state.speechEnabled ?? false;
  const activeProfile = campus?.activeProfile ?? null;
  const currentAvatar =
    STUDENT_AVATARS.find((a) => a.id === activeProfile?.avatarId) ?? STUDENT_AVATARS[0];

  const [guideMapOpen, setGuideMapOpen] = useState(false);

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
      {/* Üst Çubuk: Konum Rozeti, Ses Ayarı ve Rehber Harita (Sınıf seçimi avluda yer almaz) */}
      <header className="flex items-center justify-between gap-2">
        <div className="pointer-events-auto flex items-center gap-2 bg-[var(--campus-surface)]/95 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-[var(--campus-border)] shadow-xs">
          <Sparkles className="w-4 h-4 text-[var(--seljuk-teal)] shrink-0" aria-hidden="true" />
          <span className="text-xs sm:text-sm font-bold text-[var(--seljuk-navy)]">
            {currentScene === 'courtyard'
              ? 'Yürünebilir Kampüs Avlusu'
              : currentScene === 'classroom'
                ? 'İngilizce Sınıfı'
                : 'Aksaray Sultanhanı Kervansarayı — Dış Meydan'}
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          {/* Aktif Öğrenci Profili ve Değiştirme Düğmesi */}
          {activeProfile ? (
            <button
              type="button"
              onClick={() => campus?.openProfileModal()}
              aria-label={`Öğrenci Profili: ${activeProfile.alias}. Öğrenci değiştirmek için tıkla.`}
              title="Öğrenci Değiştir"
              className="min-h-[44px] px-3 py-1.5 rounded-xl border border-[var(--campus-border)] bg-[var(--campus-surface)]/95 backdrop-blur-xs hover:bg-[var(--stone-cream)] text-xs font-bold text-[var(--seljuk-navy)] inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <span className="text-base" aria-hidden="true">{currentAvatar.emoji}</span>
              <span className="truncate max-w-[80px] sm:max-w-[120px]">{activeProfile.alias}</span>
              <span className="text-[10px] font-bold text-[var(--seljuk-teal)] bg-[var(--seljuk-teal)]/10 px-1.5 py-0.5 rounded-md inline-block tabular-nums">
                {selectedGrade || activeProfile.selectedGrade}. Sınıf
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => campus?.openProfileModal()}
              className="min-h-[44px] px-3 py-1.5 rounded-xl border border-[var(--seljuk-teal)]/50 bg-[var(--seljuk-teal)]/10 text-xs font-bold text-[var(--seljuk-teal)] inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Öğrenci Seç</span>
            </button>
          )}

          {/* Sultanhanı Meydanındayken Hızlı Sınıfa Dönüş Düğmesi */}
          {currentScene === 'sultanhani_square' && onExitClassroom && (
            <button
              type="button"
              onClick={onExitClassroom}
              className="min-h-[44px] px-3.5 py-1.5 rounded-lg bg-[var(--stone-cream)] hover:bg-[var(--campus-surface-muted)] text-[var(--seljuk-navy)] border border-[var(--campus-border)] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              aria-label="Sınıfa dön"
            >
              <DoorOpen className="w-4 h-4 text-[var(--seljuk-teal)]" aria-hidden="true" />
              <span>Sınıfa Dön</span>
            </button>
          )}

          {/* Sınıf İçindeyken Aktif Düzey Göstergesi (Seçim tahta yanındaki fiziksel panodan yapılır) */}
          {currentScene === 'classroom' && (
            <div
              className={`min-h-[44px] px-3 py-1.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs ${
                selectedGrade
                  ? 'bg-[var(--stone-cream)] text-[var(--seljuk-navy)] border-[var(--campus-border)]'
                  : 'bg-amber-50 text-amber-900 border-amber-300'
              }`}
              title="Sınıf düzeyini tahtanın solundaki panodan değiştirebilirsin"
            >
              <GraduationCap className="w-4 h-4 text-[var(--seljuk-teal)]" aria-hidden="true" />
              <span className="tabular-nums font-bold">
                {selectedGrade ? `${selectedGrade}. Sınıf` : 'Sınıf Seçilmedi'}
              </span>
            </div>
          )}

          {/* Sınıf İçindeyken Hızlı Avluya Dönüş Düğmesi */}
          {currentScene === 'classroom' && onExitClassroom && (
            <button
              type="button"
              onClick={onExitClassroom}
              className="min-h-[44px] px-3.5 py-1.5 rounded-lg bg-[var(--stone-cream)] hover:bg-[var(--campus-surface-muted)] text-[var(--seljuk-navy)] border border-[var(--campus-border)] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              aria-label="Avluya dön"
            >
              <DoorOpen className="w-4 h-4 text-[var(--seljuk-teal)]" aria-hidden="true" />
              <span>Avluya Dön</span>
            </button>
          )}

          {/* Kampüs Rehberi / Yön Bulma Haritası Düğmesi (Yalnızca avluda) */}
          {currentScene === 'courtyard' && (
            <button
              type="button"
              onClick={() => {
                setGuideMapOpen((prev) => !prev);
              }}
              className={`min-h-[44px] px-3 py-1.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs ${
                guideMapOpen
                  ? 'bg-[var(--seljuk-teal)] text-white border-[var(--seljuk-teal)]'
                  : 'bg-[var(--stone-cream)] hover:bg-[var(--campus-surface-muted)] text-[var(--seljuk-navy)] border-[var(--campus-border)]'
              }`}
              aria-label="Kampüs binaları ve yön rehberi"
              aria-expanded={guideMapOpen}
            >
              <Compass className="w-4 h-4 text-[var(--seljuk-teal)]" aria-hidden="true" />
              <span className="hidden sm:inline">Kampüs Rehberi</span>
            </button>
          )}

          {/* Sesli Anlatım Açma / Kapatma */}
          <button
            type="button"
            onClick={() => campus?.setSpeechEnabled(!speechEnabled)}
            className="min-h-[44px] px-3 py-1.5 rounded-lg border border-[var(--campus-border)] bg-[var(--stone-cream)] hover:bg-[var(--campus-surface-muted)] text-xs font-semibold text-[var(--seljuk-navy)] inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            aria-label={speechEnabled ? 'Sesli anlatımı kapat' : 'Sesli anlatımı aç'}
          >
            {speechEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-[var(--seljuk-teal)]" />
                <span className="hidden md:inline">Ses Açık</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-[var(--alert-rose)]" />
                <span className="hidden md:inline">Ses Kapalı</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Açılır Kampüs Yön Rehberi Paneli (Işınlanma Yok — Sadece Yönlendirme) */}
      {guideMapOpen && currentScene === 'courtyard' && (
        <div className="pointer-events-auto self-end mt-2 max-w-sm w-full bg-[var(--campus-surface)]/95 backdrop-blur-md p-4 rounded-2xl border-2 border-[var(--seljuk-teal)] shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-[var(--campus-border)] pb-2">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[var(--seljuk-teal)]" />
              <h2 className="text-xs sm:text-sm font-bold text-[var(--seljuk-navy)]">Kampüs Yön Rehberi</h2>
            </div>
            <button
              type="button"
              onClick={() => setGuideMapOpen(false)}
              className="p-1 rounded-md hover:bg-[var(--campus-surface-muted)] text-[var(--campus-ink-muted)] cursor-pointer"
              aria-label="Rehberi kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-[var(--campus-ink-muted)]">
            Kampüste dilediğin binaya yürüyerek ulaşabilir, kapısına yaklaştığında <strong className="text-[var(--seljuk-navy)]">[E]</strong> tuşu veya düğmeyle giriş yapabilirsin:
          </p>

          <ul className="space-y-1.5 text-xs">
            <li className="flex items-start gap-2 p-1.5 rounded-lg bg-[var(--stone-cream)]">
              <span className="w-2 h-2 rounded-full bg-[var(--seljuk-teal)] mt-1 shrink-0" />
              <div>
                <strong className="text-[var(--seljuk-navy)]">İngilizce Öğreniyorum (Kuzeydoğu — AÇIK):</strong>
                <span className="text-[var(--campus-ink-muted)] block text-[11px]">Sınıf seçim panosu, akıllı tahta ve kelime eşleştirme.</span>
              </div>
            </li>
            <li className="flex items-start gap-2 p-1.5 rounded-lg bg-[var(--stone-cream)]">
              <span className="w-2 h-2 rounded-full bg-[var(--seljuk-gold)] mt-1 shrink-0" />
              <div>
                <strong className="text-[var(--seljuk-navy)]">Kampüs Taç Kapısı (Güney — ÇIKIŞ):</strong>
                <span className="text-[var(--campus-ink-muted)] block text-[11px]">Ana giriş kapısına dönerek kampüsten çıkış.</span>
              </div>
            </li>
            <li className="flex items-start gap-2 p-1.5 rounded-lg bg-[var(--stone-cream)]">
              <span className="w-2 h-2 rounded-full bg-slate-400 mt-1 shrink-0" />
              <div>
                <strong className="text-[var(--seljuk-navy)]">Diğer Binalar (Yakında):</strong>
                <span className="text-[var(--campus-ink-muted)] block text-[11px]">Hayalden Gerçeğe, Hikâyeden Hayata, Yolculuğum ve Görev Panosu.</span>
              </div>
            </li>
          </ul>
        </div>
      )}

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
