import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Volume2, VolumeX, SlidersHorizontal, Trash2, Compass, Footprints } from 'lucide-react';
import { useCampus } from '@/src/app/CampusProviders';
import { GRADE_LIST } from '@/src/data/gradeProfiles';
import type { GradeLevel } from '@/src/types/campus';
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
            Dijital Eğitim Kampüsü
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

          {/* Bölge 3: Tek birincil eylem düğmesi (Sınıf ve Ayarlar paneli) */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setDrawerOpen((prev) => !prev)}
              aria-expanded={drawerOpen}
              className="min-h-[44px] px-3.5 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--stone-cream)] hover:bg-[var(--campus-surface-muted)] text-sm font-semibold text-[var(--seljuk-navy)] inline-flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-[var(--seljuk-teal)]" aria-hidden="true" />
              <span className="tabular-nums">
                {state.selectedGrade ? `${state.selectedGrade}. Sınıf` : 'Sınıf Seç'}
              </span>
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

        {/* Açılır Sınıf & Ses & Veri Yönetimi Paneli */}
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

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--seljuk-navy)]">
                    Sınıf Düzeyin
                  </p>
                  <p className="text-xs text-[var(--campus-ink-muted)]">
                    Sınıfını değiştirdiğinde önceki çalışmaların silinmez; ilgili sınıf düzeyiyle saklanır.
                  </p>
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
