import React, { useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  Compass,
  Volume2,
  VolumeX,
  X,
  HelpCircle,
  DoorOpen,
} from 'lucide-react';
import { useOptionalCampus } from '@/src/app/CampusProviders';
import { GRADE_LIST } from '@/src/data/gradeProfiles';
import type { GradeLevel } from '@/src/types/campus';
import type { InteractiveZone } from '../types';

interface WalkableControlsOverlayProps {
  activeZone: InteractiveZone | null;
  onTriggerInteraction: () => void;
  onVirtualDirection: (vx: number, vy: number) => void;
  onBackToMap?: () => void;
  onDirectEnterClassroom?: () => void;
  onExitClassroom?: () => void;
  unreachableMessage: string | null;
  currentScene: 'courtyard' | 'classroom';
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
  const selectedGrade = campus?.state.selectedGrade ?? 5;
  const speechEnabled = campus?.state.speechEnabled ?? false;

  const [settingsOpen, setSettingsOpen] = useState(false);
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

  const handleSelectGrade = (grade: GradeLevel) => {
    campus?.setGrade(grade);
    setSettingsOpen(false);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none z-20">
      {/* Üst Çubuk: Konum Rozeti, Sınıf Seçimi / Ayarlar ve Rehber Harita */}
      <header className="flex items-center justify-between gap-2">
        <div className="pointer-events-auto flex items-center gap-2 bg-[var(--campus-surface)]/95 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-[var(--campus-border)] shadow-xs">
          <Sparkles className="w-4 h-4 text-[var(--seljuk-teal)] shrink-0" aria-hidden="true" />
          <span className="text-xs sm:text-sm font-bold text-[var(--seljuk-navy)]">
            {currentScene === 'courtyard' ? 'Yürünebilir Kampüs Avlusu' : 'İngilizce Sınıfı'}
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
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

          {/* Kampüs Rehberi / Yön Bulma Haritası Düğmesi (Işınlanma yapmaz, binaları tanıtır) */}
          {currentScene === 'courtyard' && (
            <button
              type="button"
              onClick={() => {
                setGuideMapOpen((prev) => !prev);
                setSettingsOpen(false);
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

          {/* Sınıf Seçimi ve Ayarlar Düğmesi (Kampüsten çıkmadan sınıf değiştirme) */}
          <button
            type="button"
            onClick={() => {
              setSettingsOpen((prev) => !prev);
              setGuideMapOpen(false);
            }}
            className={`min-h-[44px] px-3.5 py-1.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs ${
              settingsOpen
                ? 'bg-[var(--seljuk-teal)] text-white border-[var(--seljuk-teal)]'
                : 'bg-[var(--stone-cream)] hover:bg-[var(--campus-surface-muted)] text-[var(--seljuk-navy)] border-[var(--campus-border)]'
            }`}
            aria-label="Sınıf seçimi ve kampüs ayarları"
            aria-expanded={settingsOpen}
          >
            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
            <span className="tabular-nums font-bold">
              {selectedGrade ? `${selectedGrade}. Sınıf` : 'Sınıf'}
            </span>
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
                <strong className="text-[var(--seljuk-navy)]">İngilizce Dünyası (Kuzeydoğu):</strong>
                <span className="text-[var(--campus-ink-muted)] block text-[11px]">Akıllı tahta ve kelime eşleştirme sınıfı.</span>
              </div>
            </li>
            <li className="flex items-start gap-2 p-1.5 rounded-lg bg-[var(--stone-cream)]">
              <span className="w-2 h-2 rounded-full bg-[var(--sandstone-gold)] mt-1 shrink-0" />
              <div>
                <strong className="text-[var(--seljuk-navy)]">Gezi ve Keşif (Kuzeybatı):</strong>
                <span className="text-[var(--campus-ink-muted)] block text-[11px]">Kapıların Hikâyesi ve Aksaray Kültürel Miras Rotası.</span>
              </div>
            </li>
            <li className="flex items-start gap-2 p-1.5 rounded-lg bg-[var(--stone-cream)]">
              <span className="w-2 h-2 rounded-full bg-[var(--courtyard-sage)] mt-1 shrink-0" />
              <div>
                <strong className="text-[var(--seljuk-navy)]">Kitap ve Hikâye Dünyası (Kuzey):</strong>
                <span className="text-[var(--campus-ink-muted)] block text-[11px]">Özgün okuma ve hikâye üretim alanı.</span>
              </div>
            </li>
            <li className="flex items-start gap-2 p-1.5 rounded-lg bg-[var(--stone-cream)]">
              <span className="w-2 h-2 rounded-full bg-[var(--terracotta)] mt-1 shrink-0" />
              <div>
                <strong className="text-[var(--seljuk-navy)]">Kampüs Yolculuğum (Güneybatı Köşk):</strong>
                <span className="text-[var(--campus-ink-muted)] block text-[11px]">Çalışmaların ve kazanılan rozetler.</span>
              </div>
            </li>
            <li className="flex items-start gap-2 p-1.5 rounded-lg bg-[var(--stone-cream)]">
              <span className="w-2 h-2 rounded-full bg-[var(--seljuk-teal)] mt-1 shrink-0" />
              <div>
                <strong className="text-[var(--seljuk-navy)]">Keşif Görevleri Panosu (Güneydoğu Kiosk):</strong>
                <span className="text-[var(--campus-ink-muted)] block text-[11px]">Bütünleşik öğrenme görevleri listesi.</span>
              </div>
            </li>
          </ul>
        </div>
      )}

      {/* Açılır Sınıf Değiştirme ve Ayarlar Paneli */}
      {settingsOpen && (
        <div className="pointer-events-auto self-end mt-2 max-w-xs w-full bg-[var(--campus-surface)]/95 backdrop-blur-md p-4 rounded-2xl border-2 border-[var(--seljuk-teal)] shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-[var(--campus-border)] pb-2">
            <h2 className="text-xs sm:text-sm font-bold text-[var(--seljuk-navy)]">Sınıf Düzeyi ve Ayarlar</h2>
            <button
              type="button"
              onClick={() => setSettingsOpen(false)}
              className="p-1 rounded-md hover:bg-[var(--campus-surface-muted)] text-[var(--campus-ink-muted)] cursor-pointer"
              aria-label="Ayarları kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[var(--campus-ink-muted)]">Sınıfını Değiştir:</label>
            <div className="grid grid-cols-3 gap-1.5">
              {GRADE_LIST.map((profile) => {
                const isSelected = selectedGrade === profile.grade;
                return (
                  <button
                    key={profile.grade}
                    type="button"
                    onClick={() => handleSelectGrade(profile.grade)}
                    className={`min-h-[40px] px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--seljuk-teal)] text-white shadow-xs'
                        : 'bg-[var(--stone-cream)] hover:bg-[var(--campus-surface-muted)] text-[var(--seljuk-navy)] border border-[var(--campus-border)]'
                    }`}
                  >
                    {profile.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--campus-border)] flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => campus?.setSpeechEnabled(!speechEnabled)}
              className="min-h-[38px] px-3 py-1.5 rounded-lg border border-[var(--campus-border)] bg-[var(--stone-cream)] hover:bg-[var(--campus-surface-muted)] text-xs font-semibold text-[var(--seljuk-navy)] inline-flex items-center gap-1.5 cursor-pointer"
              aria-label={speechEnabled ? 'Sesli anlatımı kapat' : 'Sesli anlatımı aç'}
            >
              {speechEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[var(--seljuk-teal)]" />
                  <span>Ses Açık</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-[var(--alert-rose)]" />
                  <span>Ses Kapalı</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setSettingsOpen(false);
                campus?.replayWelcomeFlow();
              }}
              className="min-h-[38px] px-3 py-1.5 rounded-lg border border-[var(--campus-border)] bg-[var(--stone-cream)] hover:bg-[var(--campus-surface-muted)] text-[11px] font-medium text-[var(--campus-ink-muted)] hover:text-[var(--seljuk-navy)] cursor-pointer"
            >
              Kapıyı İzle
            </button>
          </div>
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
