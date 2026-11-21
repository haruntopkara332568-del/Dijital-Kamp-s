import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Volume2, VolumeX, SlidersHorizontal, Trash2, Compass, Footprints, UserCheck } from 'lucide-react';
import { useCampus } from '@/src/app/CampusProviders';
import { GRADE_LIST } from '@/src/data/gradeProfiles';
import { CAMPUS_BRAND } from '@/src/data/brandConfig';
import { STUDENT_AVATARS, type GradeLevel } from '@/src/types/campus';
import { FullscreenButton } from './FullscreenButton';
import { DeleteDataModal } from './DeleteDataModal';

interface CampusTopBarProps {
  onBeforeNavigate?: (targetHref: string) => boolean;
}

export function CampusTopBar({ onBeforeNavigate }: CampusTopBarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const {
    state,
    storageStatus,
    setGrade,
    setSpeechEnabled,
    replayWelcomeFlow,
    activeProfile,
    openProfileModal,
  } = useCampus();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (onBeforeNavigate && !onBeforeNavigate(href)) {
      e.preventDefault();
      return;
    }
    if (href === '/') {
      return;
    }
  };

  const handleReplayWelcome = () => {
    if (onBeforeNavigate && !onBeforeNavigate('/')) return;
    setDrawerOpen(false);
    replayWelcomeFlow();
    navigate('/');
  };

  const handleGradeSelect = (grade: GradeLevel) => {
    setGrade(grade);
    setDrawerOpen(false);
  };

  const navItems = [
    { href: '/', label: 'Kampüs Avlusu' },
    { href: '/alan/gorev-panosu', label: 'Görev Panosu' },
    { href: '/yolculugum', label: 'Yolculuğum' },
  ];

  const currentAvatar = STUDENT_AVATARS.find((a) => a.id === activeProfile?.avatarId) ?? STUDENT_AVATARS[0];

  return (
    <>
      <header className="sticky top-0 z-30 bg-[var(--campus-surface)]/95 backdrop-blur-sm border-b border-[var(--campus-border)]">
        {/* İnce Anadolu-Selçuklu Mimari Taç Çizgisi */}
        <div
          aria-hidden="true"
          className="h-1 w-full bg-gradient-to-r from-[var(--seljuk-navy)] via-[var(--seljuk-teal)] to-[var(--terracotta)]"
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Bölge 1: Tek satırlık başlık */}
          <Link
            to="/"
            onClick={(e) => handleNavClick(e, '/')}
            className="min-h-[44px] inline-flex items-center text-base sm:text-lg font-bold tracking-tight text-[var(--seljuk-navy)] whitespace-nowrap shrink-0 hover:text-[var(--seljuk-teal)] transition-colors"
          >
            {CAMPUS_BRAND.name}
          </Link>

          {/* Bölge 2: Tek satırlık temiz gezinme bağlantıları */}
          <nav
            aria-label="Ana kampüs gezinmesi"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--campus-ink-muted)]"
          >
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`min-h-[44px] inline-flex items-center whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                    active
                      ? 'text-[var(--seljuk-teal)] border-[var(--seljuk-teal)] font-semibold'
                      : 'border-transparent hover:text-[var(--seljuk-navy)] hover:border-[var(--campus-border)]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Bölge 3: Aktif Öğrenci Profili ve Ayarlar Paneli */}
          <div className="flex items-center gap-2 shrink-0">
            {activeProfile ? (
              <button
                type="button"
                onClick={openProfileModal}
                aria-label={`Öğrenci Profili: ${activeProfile.alias}. Öğrenci değiştirmek için tıkla.`}
                title="Öğrenci Değiştir"
                className="min-h-[44px] px-3 py-1.5 rounded-lg border border-[var(--campus-border)] bg-[var(--stone-cream)] hover:bg-[var(--campus-surface-muted)] text-xs sm:text-sm font-bold text-[var(--seljuk-navy)] inline-flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
              >
                <span className="text-base" aria-hidden="true">
                  {currentAvatar.emoji}
                </span>
                <span className="truncate max-w-[90px] sm:max-w-[130px]">{activeProfile.alias}</span>
                <span className="text-[11px] font-bold text-[var(--seljuk-teal)] bg-[var(--seljuk-teal)]/10 px-1.5 py-0.5 rounded-md inline-block tabular-nums">
                  {state.selectedGrade || activeProfile.selectedGrade}. Sınıf
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={openProfileModal}
                className="min-h-[44px] px-3 py-1.5 rounded-lg border border-[var(--seljuk-teal)]/50 bg-[var(--seljuk-teal)]/10 text-xs sm:text-sm font-bold text-[var(--seljuk-teal)] inline-flex items-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" aria-hidden="true" />
                <span>Öğrenci Seç</span>
              </button>
            )}

            <FullscreenButton variant="header" />

            <button
              type="button"
              onClick={() => setDrawerOpen((prev) => !prev)}
              aria-expanded={drawerOpen}
              aria-label="Kampüs ayarları ve sınıf paneli"
              className="min-h-[44px] px-3 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--stone-cream)] hover:bg-[var(--campus-surface-muted)] text-sm font-semibold text-[var(--seljuk-navy)] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-[var(--seljuk-teal)]" aria-hidden="true" />
              <span className="hidden sm:inline">Ayarlar</span>
            </button>
          </div>
        </div>

        {/* Mobil alt gezinme satırı (yalnızca küçük ekranlarda) */}
        <nav
          aria-label="Mobil kampüs gezinmesi"
          className="md:hidden border-t border-[var(--campus-border)] px-4 py-1.5 flex items-center justify-around gap-2 bg-[var(--stone-cream)]"
        >
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`min-h-[44px] px-2 flex items-center text-xs font-semibold whitespace-nowrap shrink-0 ${
                  active ? 'text-[var(--seljuk-teal)] underline underline-offset-4' : 'text-[var(--campus-ink-muted)]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Açılır Sınıf & Ses & Profil & Veri Yönetimi Paneli */}
        {drawerOpen && (
          <div className="border-t border-[var(--campus-border)] bg-[var(--campus-surface)] shadow-sm">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 space-y-4">
              {storageStatus.warningMessage && (
                <div
                  role="status"
                  className="p-3 rounded-lg bg-[var(--sandstone-gold-soft)] text-[var(--campus-ink)] text-sm border border-[var(--sandstone-gold)]/30"
                >
                  {storageStatus.warningMessage}
                </div>
              )}

              {/* Aktif Öğrenci Kartı ve Değiştirme */}
              <div className="p-3.5 rounded-xl bg-[var(--stone-cream)] border border-[var(--campus-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--seljuk-teal)] to-[var(--seljuk-navy)] text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
                    <span aria-hidden="true">{currentAvatar.emoji}</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--campus-ink-muted)]">Aktif Öğrenci Profili</p>
                    <p className="text-sm font-bold text-[var(--seljuk-navy)]">
                      {activeProfile?.alias || 'Gezgin'} •{' '}
                      <span className="tabular-nums">
                        {state.selectedGrade || activeProfile?.selectedGrade || 3}. Sınıf
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    openProfileModal();
                  }}
                  className="min-h-[44px] px-4 py-2 rounded-lg bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal)]/90 text-white text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <UserCheck className="w-4 h-4" aria-hidden="true" />
                  <span>Öğrenci Değiştir</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--seljuk-navy)]">
                    Sınıf Düzeyin
                  </p>
                  <p className="text-xs text-[var(--campus-ink-muted)]">
                    Sınıfını değiştirdiğinde önceki çalışmaların silinmez; ilgili sınıf düzeyiyle saklanır.
                  </p>
                  {!state.selectedGrade && (
                    <p className="mt-2 text-xs text-[var(--seljuk-navy)] bg-[var(--seljuk-teal)]/10 border border-[var(--seljuk-teal)]/20 p-2.5 rounded-lg font-medium leading-relaxed">
                      Kampüsümüz artık 2, 3 ve 4. sınıflara yönelik çalışmalar sunuyor. Devam etmek için sınıfını seçebilirsin.
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2" role="group" aria-label="Sınıf seçimi">
                  {GRADE_LIST.map((profile) => {
                    const selected = state.selectedGrade === profile.grade;
                    return (
                      <button
                        key={profile.grade}
                        type="button"
                        onClick={() => handleGradeSelect(profile.grade)}
                        className={`min-h-[44px] min-w-[64px] px-3 py-1.5 rounded-lg text-sm font-semibold tabular-nums transition-colors cursor-pointer ${
                          selected
                            ? 'bg-[var(--seljuk-teal)] text-white'
                            : 'bg-[var(--stone-cream)] text-[var(--seljuk-navy)] border border-[var(--campus-border)] hover:bg-[var(--campus-surface-muted)]'
                        }`}
                      >
                        {profile.grade}. Sınıf
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--campus-border)] flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSpeechEnabled(!state.speechEnabled)}
                    className="min-h-[44px] px-3.5 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--stone-cream)] text-sm font-medium text-[var(--seljuk-navy)] hover:bg-[var(--campus-surface-muted)] inline-flex items-center gap-2 cursor-pointer"
                  >
                    {state.speechEnabled ? (
                      <>
                        <Volume2 className="w-4 h-4 text-[var(--seljuk-teal)]" aria-hidden="true" />
                        <span>Sesli Destek Açık</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-4 h-4 text-[var(--campus-ink-muted)]" aria-hidden="true" />
                        <span>Sesli Destek Kapalı</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleReplayWelcome}
                    className="min-h-[44px] px-3.5 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--stone-cream)] text-sm font-medium text-[var(--seljuk-navy)] hover:bg-[var(--campus-surface-muted)] inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Compass className="w-4 h-4 text-[var(--seljuk-teal)]" aria-hidden="true" />
                    <span>Kapı ve Karşılamayı Yeniden İzle</span>
                  </button>

                  <Link
                    to="/yuruyus"
                    onClick={() => setDrawerOpen(false)}
                    className="min-h-[44px] px-3.5 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--stone-cream)] text-sm font-medium text-[var(--seljuk-navy)] hover:bg-[var(--campus-surface-muted)] inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Footprints className="w-4 h-4 text-[var(--seljuk-teal)]" aria-hidden="true" />
                    <span>Yürünebilir Kampüs Avlusu</span>
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    setDeleteModalOpen(true);
                  }}
                  className="min-h-[44px] px-3.5 py-2 rounded-lg border border-[var(--alert-rose)]/40 text-sm font-semibold text-[var(--alert-rose)] hover:bg-[var(--alert-rose-soft)] inline-flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                  <span>Verilerimi Sil</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <DeleteDataModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} />
    </>
  );
}
