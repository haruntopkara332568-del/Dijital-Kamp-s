import { useEffect, useState, useRef } from 'react';
import { X, Check, Sparkles, GraduationCap, School } from 'lucide-react';
import { GRADE_LIST } from '@/src/data/gradeProfiles';
import type { GradeLevel } from '@/src/types/campus';

export interface GradeBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGrade: GradeLevel | null;
  onSelectGrade: (grade: GradeLevel) => void;
}

export function GradeBoardModal(props: GradeBoardModalProps) {
  if (!props.isOpen) return null;
  return <GradeBoardDialog {...props} />;
}

function GradeBoardDialog({
  onClose,
  selectedGrade,
  onSelectGrade,
}: GradeBoardModalProps) {
  const [activeGrade, setActiveGrade] = useState<GradeLevel | null>(selectedGrade);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Escape tuşu ve odak yönetimi
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSave = (gradeToSave?: GradeLevel) => {
    const target = gradeToSave ?? activeGrade;
    if (!target) return;
    onSelectGrade(target);
    setSaveSuccess(true);
    setTimeout(() => {
      onClose();
    }, 450);
  };

  const primaryGrades = GRADE_LIST.filter((p) => p.tier === 'ilkokul');
  const middleGrades = GRADE_LIST.filter((p) => p.tier === 'ortaokul');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="grade-board-title"
    >
      {/* Selçuklu Mimari Ahşap / Taş Kemerli Pano Gövdesi */}
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-[#241a12] text-[#fbf2df] rounded-2xl border-4 border-[#bca888] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px rgba(216, 151, 43, 0.25)',
        }}
      >
        {/* Selçuklu Turkuaz Çini ve Altın Bordür Şeridi */}
        <div className="h-3 w-full bg-gradient-to-r from-[#0e768a] via-[#249ab0] to-[#0e768a] border-b border-[#d8972b]" />

        {/* Üst Kemer Başlığı */}
        <div className="relative px-5 pt-5 pb-3 border-b border-[#5c4532] bg-[#1a120b]/90 text-center">
          {/* Kapat Butonu */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-[#bca888] hover:text-white hover:bg-[#3d2b1d] transition-colors cursor-pointer"
            aria-label="Panoyu Kapat"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Selçuklu Sekiz Köşeli Yıldız Simgesi */}
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#0e768a]/30 border border-[#d8972b] text-[#fef08a] mb-2 shadow-inner">
            <Sparkles className="w-5 h-5 text-[#d8972b]" />
          </div>

          <h2
            id="grade-board-title"
            className="text-lg sm:text-xl font-bold tracking-wide text-[#fbf2df] font-serif"
          >
            SELÇUKLU SINIF SEÇİM PANOSU
          </h2>
          <p className="text-xs text-[#ccb997] mt-1 max-w-sm mx-auto">
            İngilizce dersi etkinlikleri ve akıllı tahta görevlerinin düzeyine uygun olması için sınıfını belirle.
          </p>
        </div>

        {/* Sınıf Kartları Listesi */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Başarı Mesajı */}
          {saveSuccess && (
            <div className="p-2.5 rounded-xl bg-[#065f46] text-[#ecfdf5] border border-[#10b981] flex items-center justify-center gap-2 text-xs font-bold animate-in fade-in">
              <Check className="w-4 h-4 text-[#34d399]" />
              <span>Sınıfın başarıyla kaydedildi! Akıllı tahta hazır.</span>
            </div>
          )}

          {/* 1. İlkokul Kademesi (2, 3, 4. Sınıf) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#fef08a] tracking-wider uppercase border-b border-[#5c4532] pb-1">
              <School className="w-4 h-4 text-[#d8972b]" />
              <span>İlkokul Kademesi</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {primaryGrades.map((profile) => {
                const isSelected = activeGrade === profile.grade;
                return (
                  <button
                    key={profile.grade}
                    type="button"
                    onClick={() => {
                      setActiveGrade(profile.grade);
                      handleSave(profile.grade);
                    }}
                    className={`relative p-3 rounded-xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 min-h-[72px] ${
                      isSelected
                        ? 'bg-[#0e768a] border-[#fef08a] text-white shadow-lg ring-2 ring-[#d8972b]'
                        : 'bg-[#2f2014] hover:bg-[#3d2b1d] border-[#5c4532] text-[#e2d5c0] hover:border-[#bca888]'
                    }`}
                  >
                    <span className="text-base sm:text-lg font-black tracking-tight font-serif">
                      {profile.grade}. Sınıf
                    </span>
                    <span className="text-[10px] text-[#e2d5c0]/80">
                      {profile.grade === 2 ? 'Temel Seviye' : profile.grade === 3 ? 'Gelişim' : 'Mezuniyet'}
                    </span>
                    {isSelected && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#10b981] border border-[#fef08a] flex items-center justify-center text-white">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Ortaokul Kademesi (5, 6, 7. Sınıf) */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#93c5fd] tracking-wider uppercase border-b border-[#5c4532] pb-1">
              <GraduationCap className="w-4 h-4 text-[#60a5fa]" />
              <span>Ortaokul Kademesi</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {middleGrades.map((profile) => {
                const isSelected = activeGrade === profile.grade;
                return (
                  <button
                    key={profile.grade}
                    type="button"
                    onClick={() => {
                      setActiveGrade(profile.grade);
                      handleSave(profile.grade);
                    }}
                    className={`relative p-3 rounded-xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 min-h-[72px] ${
                      isSelected
                        ? 'bg-[#0e768a] border-[#fef08a] text-white shadow-lg ring-2 ring-[#d8972b]'
                        : 'bg-[#2f2014] hover:bg-[#3d2b1d] border-[#5c4532] text-[#e2d5c0] hover:border-[#bca888]'
                    }`}
                  >
                    <span className="text-base sm:text-lg font-black tracking-tight font-serif">
                      {profile.grade}. Sınıf
                    </span>
                    <span className="text-[10px] text-[#e2d5c0]/80">
                      {profile.grade === 5 ? 'Ortaokul Giriş' : profile.grade === 6 ? 'Keşif' : 'İleri Seviye'}
                    </span>
                    {isSelected && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#10b981] border border-[#fef08a] flex items-center justify-center text-white">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Alt Butonlar */}
        <div className="px-5 py-3.5 border-t border-[#5c4532] bg-[#1a120b] flex items-center justify-between gap-3">
          <span className="text-xs text-[#ccb997]">
            {activeGrade ? `${activeGrade}. Sınıf Seçili` : 'Lütfen bir sınıf seç'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#2f2014] hover:bg-[#3d2b1d] text-[#e2d5c0] border border-[#5c4532] transition-colors cursor-pointer"
            >
              Kapat
            </button>
            <button
              type="button"
              disabled={!activeGrade}
              onClick={() => handleSave()}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0e768a] hover:bg-[#118fa6] disabled:opacity-50 disabled:cursor-not-allowed text-white border border-[#fef08a] shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Seçimi Onayla</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
