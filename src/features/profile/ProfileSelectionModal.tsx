import React, { useState, useEffect, useRef } from 'react';
import { UserPlus, Check, X, Trash2, ArrowLeft, Sparkles, ShieldCheck } from 'lucide-react';
import { useCampus } from '@/src/app/CampusProviders';
import {
  STUDENT_ALIASES,
  STUDENT_AVATARS,
  type StudentProfile,
  type SupportedGrade,
  SUPPORTED_GRADES,
} from '@/src/types/campus';

interface ProfileSelectionModalProps {
  open: boolean;
  onClose: () => void;
  initialMode?: 'select' | 'create';
}

export function ProfileSelectionModal({
  open,
  onClose,
  initialMode = 'select',
}: ProfileSelectionModalProps) {
  const {
    profiles,
    activeProfile,
    createProfile,
    switchProfile,
    deleteProfile,
  } = useCampus();

  const [mode, setMode] = useState<'select' | 'create' | 'confirm-delete'>(() => {
    return profiles.length === 0 || initialMode === 'create' ? 'create' : 'select';
  });
  const [selectedAlias, setSelectedAlias] = useState<string>('Gezgin');
  const [customAlias, setCustomAlias] = useState<string>('');
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>('avatar_1');
  const [selectedGrade, setSelectedGrade] = useState<SupportedGrade>(3);
  const [profileToDelete, setProfileToDelete] = useState<StudentProfile | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  // Modal açıldığında veya profil listesi durumuna göre başlangıç modunu ayarla (React render-phase reset)
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    setMode(profiles.length === 0 || initialMode === 'create' ? 'create' : 'select');
    setFormError(null);
    setCustomAlias('');
    setSelectedAlias('Gezgin');
    setSelectedAvatarId('avatar_1');
    setSelectedGrade(3);
    setProfileToDelete(null);
  }

  // Escape tuşu ile kapatma (aktif profil varsa kapatılabilir)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        if (mode === 'confirm-delete') {
          setMode('select');
          setProfileToDelete(null);
        } else if (mode === 'create' && profiles.length > 0) {
          setMode('select');
        } else if (activeProfile) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, mode, profiles.length, activeProfile, onClose]);

  if (!open) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAlias = (customAlias.trim() || selectedAlias).trim();
    if (!finalAlias) {
      setFormError('Lütfen bir takma ad seç veya yaz.');
      return;
    }
    if (finalAlias.length > 24) {
      setFormError('Takma ad en fazla 24 karakter olabilir.');
      return;
    }

    try {
      createProfile(finalAlias, selectedAvatarId, selectedGrade);
      onClose();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Profil oluşturulurken hata oluştu.');
    }
  };

  const handleSelectProfile = (profileId: string) => {
    switchProfile(profileId);
    onClose();
  };

  const handleDeletePrompt = (e: React.MouseEvent, profile: StudentProfile) => {
    e.stopPropagation();
    setProfileToDelete(profile);
    setMode('confirm-delete');
  };

  const handleConfirmDelete = async () => {
    if (!profileToDelete) return;
    await deleteProfile(profileToDelete.id);
    setProfileToDelete(null);
    if (profiles.length <= 1) {
      setMode('create');
    } else {
      setMode('select');
    }
  };

  const canClose = Boolean(activeProfile && profiles.length > 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg rounded-2xl bg-[var(--campus-surface)] border border-[var(--campus-border)] shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]"
      >
        {/* Üst Mimari Selçuklu Bordürü */}
        <div
          aria-hidden="true"
          className="h-1.5 w-full bg-gradient-to-r from-[var(--seljuk-navy)] via-[var(--seljuk-teal)] to-[var(--terracotta)]"
        />

        {/* Modal Başlığı */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-[var(--campus-border)] bg-[var(--stone-cream)]">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">🏛️</span>
            <div>
              <h2 id="profile-modal-title" className="text-base sm:text-lg font-bold text-[var(--seljuk-navy)] leading-tight">
                {mode === 'select' && 'Külliyemize Hoş Geldin!'}
                {mode === 'create' && 'Yeni Öğrenci Profili Ekle'}
                {mode === 'confirm-delete' && 'Öğrenci Profilini Sil'}
              </h2>
              <p className="text-xs text-[var(--campus-ink-muted)]">
                {mode === 'select' && 'Bugün kim öğrenmek istiyor?'}
                {mode === 'create' && 'Kendi takma adını ve avatarını seçerek başla'}
                {mode === 'confirm-delete' && 'Bu işlem geri alınamaz'}
              </p>
            </div>
          </div>

          {canClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              className="min-h-[44px] min-w-[44px] p-2 rounded-lg text-[var(--campus-ink-muted)] hover:text-[var(--seljuk-navy)] hover:bg-[var(--campus-surface-muted)] inline-flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Modal Gövdesi */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* ================= MOD 1: PROFİL SEÇİM LİSTESİ ================= */}
          {mode === 'select' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="group" aria-label="Kayıtlı Öğrenci Profilleri">
                {profiles.map((p) => {
                  const avatar = STUDENT_AVATARS.find((a) => a.id === p.avatarId) ?? STUDENT_AVATARS[0];
                  const isActive = activeProfile?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      data-testid={`profile-card-${p.alias}`}
                      onClick={() => handleSelectProfile(p.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectProfile(p.id);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-pressed={isActive}
                      className={`group relative p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 focus-visible:outline-2 focus-visible:outline-[var(--seljuk-teal)] ${
                        isActive
                          ? 'border-[var(--seljuk-teal)] bg-[var(--seljuk-teal)]/8 shadow-sm'
                          : 'border-[var(--campus-border)] bg-[var(--campus-surface)] hover:border-[var(--seljuk-teal)]/60 hover:bg-[var(--stone-cream)]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar İkonu */}
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-xs bg-gradient-to-br ${avatar.bgGradient} text-white`}
                        >
                          <span aria-hidden="true">{avatar.emoji}</span>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-[var(--seljuk-navy)] truncate">
                              {p.alias}
                            </span>
                            {isActive && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--seljuk-teal)] text-white shrink-0">
                                Aktif
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-semibold text-[var(--campus-ink-muted)] block">
                            {p.selectedGrade}. Sınıf
                          </span>
                        </div>
                      </div>

                      {/* Silme Düğmesi */}
                      <button
                        type="button"
                        data-testid={`delete-btn-${p.alias}`}
                        onClick={(e) => handleDeletePrompt(e, p)}
                        aria-label={`${p.alias} profilini sil`}
                        title="Profili Sil"
                        className="min-h-[44px] min-w-[44px] p-2 rounded-lg text-[var(--campus-ink-muted)] hover:text-[var(--alert-rose)] hover:bg-[var(--alert-rose-soft)] inline-flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Yeni Öğrenci Ekle Düğmesi */}
              <button
                type="button"
                data-testid="add-student-btn"
                onClick={() => setMode('create')}
                className="w-full min-h-[48px] py-3 px-4 rounded-xl border-2 border-dashed border-[var(--campus-border)] hover:border-[var(--seljuk-teal)] bg-[var(--stone-cream)]/60 hover:bg-[var(--stone-cream)] text-sm font-bold text-[var(--seljuk-navy)] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-[var(--seljuk-teal)]" aria-hidden="true" />
                <span>+ Yeni Öğrenci Ekle</span>
              </button>
            </div>
          )}

          {/* ================= MOD 2: YENİ PROFİL OLUŞTURMA ================= */}
          {mode === 'create' && (
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {formError && (
                <div role="alert" className="p-3 rounded-lg bg-[var(--alert-rose-soft)] text-[var(--alert-rose)] text-xs font-semibold border border-[var(--alert-rose)]/30">
                  {formError}
                </div>
              )}

              {/* Bilgilendirme Notu */}
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[var(--stone-cream)] border border-[var(--campus-border)] text-xs text-[var(--campus-ink-muted)]">
                <ShieldCheck className="w-4 h-4 text-[var(--seljuk-teal)] shrink-0" aria-hidden="true" />
                <span>Bu külliyede ad, soyad veya şifre istenmez. Çalışmaların yalnızca bu cihazda saklanır.</span>
              </div>

              {/* 1. Takma Ad Seçimi */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--seljuk-navy)] block">
                  1. Takma Adını Seç veya Kendin Yaz
                </label>
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Önerilen takma adlar">
                  {STUDENT_ALIASES.map((alias) => {
                    const isSelected = !customAlias && selectedAlias === alias;
                    return (
                      <button
                        key={alias}
                        type="button"
                        data-testid={`alias-chip-${alias}`}
                        onClick={() => {
                          setSelectedAlias(alias);
                          setCustomAlias('');
                        }}
                        className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[var(--seljuk-teal)] text-white shadow-xs'
                            : 'bg-[var(--stone-cream)] text-[var(--seljuk-navy)] border border-[var(--campus-border)] hover:bg-[var(--campus-surface-muted)]'
                        }`}
                      >
                        {alias}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-1">
                  <input
                    type="text"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                    placeholder="Veya istediğin başka bir takma ad yaz..."
                    maxLength={24}
                    aria-label="Özel takma ad"
                    data-testid="custom-alias-input"
                    className="w-full min-h-[44px] px-3 py-2 text-xs sm:text-sm rounded-lg border border-[var(--campus-border)] bg-white text-[var(--campus-ink)] focus:outline-2 focus:outline-[var(--seljuk-teal)]"
                  />
                </div>
              </div>

              {/* 2. Avatar Seçimi */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--seljuk-navy)] block">
                  2. Avatarını Seç
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2" role="group" aria-label="Avatar seçenekleri">
                  {STUDENT_AVATARS.map((av) => {
                    const isSelected = selectedAvatarId === av.id;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        data-testid={`avatar-option-${av.id}`}
                        onClick={() => setSelectedAvatarId(av.id)}
                        aria-label={`Avatar ${av.label}`}
                        aria-pressed={isSelected}
                        className={`relative min-h-[48px] p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[var(--seljuk-teal)] ring-2 ring-[var(--seljuk-teal)] bg-[var(--seljuk-teal)]/10 scale-105'
                            : 'border-[var(--campus-border)] bg-[var(--stone-cream)] hover:scale-102'
                        }`}
                      >
                        <span className="text-xl" aria-hidden="true">{av.emoji}</span>
                        {isSelected && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--seljuk-teal)] text-white flex items-center justify-center text-[9px]">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Sınıf Düzeyi Seçimi (Yalnızca 2, 3, 4) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--seljuk-navy)] block">
                  3. Sınıf Düzeyini Seç
                </label>
                <div className="grid grid-cols-3 gap-2" role="group" aria-label="Sınıf seçimi">
                  {SUPPORTED_GRADES.map((grade) => {
                    const isSelected = selectedGrade === grade;
                    return (
                      <button
                        key={grade}
                        type="button"
                        data-testid={`grade-btn-${grade}`}
                        onClick={() => setSelectedGrade(grade)}
                        aria-pressed={isSelected}
                        className={`min-h-[48px] py-2.5 px-3 rounded-xl border text-sm font-bold tabular-nums transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-[var(--seljuk-navy)] text-white border-[var(--seljuk-navy)] shadow-xs scale-102'
                            : 'bg-[var(--stone-cream)] text-[var(--seljuk-navy)] border-[var(--campus-border)] hover:bg-[var(--campus-surface-muted)]'
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4 text-[var(--sandstone-gold)]" aria-hidden="true" />}
                        <span>{grade}. Sınıf</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Eylem Düğmeleri */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-[var(--campus-border)]">
                {profiles.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setMode('select')}
                    className="min-h-[44px] px-4 py-2 rounded-lg border border-[var(--campus-border)] text-xs font-bold text-[var(--seljuk-navy)] hover:bg-[var(--campus-surface-muted)] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Geri Dön</span>
                  </button>
                ) : <div />}

                <button
                  type="submit"
                  data-testid="start-learning-btn"
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal)]/90 text-white font-bold text-xs sm:text-sm shadow-md inline-flex items-center gap-2 cursor-pointer ml-auto"
                >
                  <Sparkles className="w-4 h-4 text-[var(--sandstone-gold)]" aria-hidden="true" />
                  <span>Öğrenmeye Başla</span>
                </button>
              </div>
            </form>
          )}

          {/* ================= MOD 3: PROFİL SİLME ONAYI ================= */}
          {mode === 'confirm-delete' && profileToDelete && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[var(--alert-rose-soft)] border border-[var(--alert-rose)]/40 text-[var(--alert-rose)] space-y-2">
                <p className="font-bold text-sm">
                  Dikkat: &ldquo;{profileToDelete.alias}&rdquo; adlı öğrencinin tüm ders ilerlemesi, akıllı tahta durumu ve çizimleri bu cihazdan silinecektir.
                </p>
                <p className="text-xs leading-relaxed text-[var(--campus-ink)]">
                  Diğer öğrencilerin profilleri ve verileri kesinlikle korunacaktır. Bu işlemi onaylıyor musun?
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('select');
                    setProfileToDelete(null);
                  }}
                  className="min-h-[44px] px-4 py-2 rounded-lg border border-[var(--campus-border)] text-xs sm:text-sm font-semibold text-[var(--campus-ink)] hover:bg-[var(--campus-surface-muted)] cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  data-testid="confirm-delete-btn"
                  onClick={handleConfirmDelete}
                  className="min-h-[44px] px-5 py-2 rounded-lg bg-[var(--alert-rose)] hover:bg-[var(--alert-rose)]/90 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer inline-flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                  <span>Evet, Profili Sil</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
