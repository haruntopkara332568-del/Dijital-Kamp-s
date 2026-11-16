import { Tv, ArrowLeft } from 'lucide-react';
import { MissionRunnerView } from '@/src/features/missions/MissionRunnerView';

interface SmartBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  missionId?: string;
}

export function SmartBoardModal({
  isOpen,
  onClose,
  missionId = 'kapilarin-anlattigi-hikaye',
}: SmartBoardModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[var(--seljuk-navy-deep)]/85 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="smartboard-title"
    >
      <div className="relative w-full max-w-6xl h-[94vh] max-h-[900px] flex flex-col bg-[var(--campus-surface)] rounded-2xl border-4 border-[#6b5a44] shadow-2xl overflow-hidden">
        {/* Akıllı Tahta Üst Çerçevesi (Ahşap & Metal Kasa) */}
        <div className="bg-[#6b5a44] text-[#fbf0d9] px-4 py-2 flex items-center justify-between border-b-2 border-[#a66414]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--seljuk-teal)] text-white flex items-center justify-center">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <h2 id="smartboard-title" className="text-xs sm:text-sm font-bold tracking-wide">
                İngilizce Sınıfı — Etkileşimli Akıllı Tahta
              </h2>
              <p className="text-[10px] text-[var(--stone-cream)] opacity-90 hidden sm:block">
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
            <ArrowLeft className="w-4 h-4 text-[var(--seljuk-teal)]" />
            <span>Sınıfa Dön</span>
          </button>
        </div>

        {/* Akıllı Tahta Ekran İçi: Mevcut Görev Motoru */}
        <div className="flex-1 overflow-y-auto">
          <MissionRunnerView missionId={missionId} />
        </div>
      </div>
    </div>
  );
}
