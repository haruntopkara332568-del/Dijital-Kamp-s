import { useState } from 'react';
import { ArrowLeft, ArrowRight, Compass, Map as MapIcon, RotateCcw } from 'lucide-react';
import { useCampus } from '@/src/app/CampusProviders';
import { GRADE_LIST } from '@/src/data/gradeProfiles';
import {
  GUIDED_TOUR_STOPS,
  WELCOME_DIALOGUE,
  getTourDialogueForTier,
} from '@/src/data/dialogues';
import { getCampusAreaById } from '@/src/data/campusAreas';
import type { DiscoveryPreference, GradeLevel } from '@/src/types/campus';
import { GuideDialogueCard } from '@/src/features/guide/GuideDialogueCard';
import { CourtyardSceneSvg } from '@/src/components/svg/CourtyardSceneSvg';
import { CampusBuildingSvg } from '@/src/components/svg/CampusBuildingSvg';

type CourtyardPhase = 'welcome-choice' | 'grade-select' | 'guided-tour';

interface CourtyardWelcomeViewProps {
  initialPhase?: CourtyardPhase;
  onFinishToMap: () => void;
  onReplayGate: () => void;
}

export function CourtyardWelcomeView({
  initialPhase = 'welcome-choice',
  onFinishToMap,
  onReplayGate,
}: CourtyardWelcomeViewProps) {
  const {
    state,
    activeGradeProfile,
    setDiscoveryPreference,
    setGrade,
    completeGuidedTour,
    completeOnboarding,
  } = useCampus();

  const [phase, setPhase] = useState<CourtyardPhase>(initialPhase);
  const [tourIndex, setTourIndex] = useState(0);

  const handleChooseDiscovery = (pref: DiscoveryPreference) => {
    setDiscoveryPreference(pref);
    setPhase('grade-select');
  };

  const handleSelectGrade = (grade: GradeLevel) => {
    setGrade(grade);
    if (state.discoveryPreference === 'guided') {
      setTourIndex(0);
      setPhase('guided-tour');
    } else {
      completeOnboarding();
      onFinishToMap();
    }
  };

  const currentStop = GUIDED_TOUR_STOPS[tourIndex];
  const currentArea = currentStop ? getCampusAreaById(currentStop.areaId) : undefined;
  const currentTourDialogue = currentStop
    ? getTourDialogueForTier(currentStop, activeGradeProfile.tier)
    : null;

  return (
    <main className="min-h-dvh bg-gradient-to-b from-[var(--sky-warm-top)]/30 via-[var(--campus-canvas)] to-[var(--stone-light)]/40 px-4 py-6 sm:py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Avlu Sahnesi Üst Şeridi */}
        <section className="rounded-2xl bg-[var(--campus-surface)] border border-[var(--campus-border)] shadow-sm overflow-hidden">
          <div
            aria-hidden="true"
            className="h-1.5 w-full bg-gradient-to-r from-[var(--seljuk-navy)] via-[var(--seljuk-teal)] to-[var(--courtyard-sage)]"
          />
          <div className="p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-xs font-semibold text-[var(--courtyard-sage)]">
                  Karşılama Avlusu
                </p>
                <h1 className="text-xl sm:text-2xl font-bold text-[var(--seljuk-navy)]">
                  Kampüs Avlusuna Hoş Geldin
                </h1>
              </div>

              <button
                type="button"
                onClick={onReplayGate}
                className="min-h-[44px] px-3.5 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--stone-cream)] hover:bg-[var(--campus-surface-muted)] text-xs font-semibold text-[var(--seljuk-navy)] inline-flex items-center gap-2 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[var(--seljuk-teal)]" aria-hidden="true" />
                <span>Kapı Girişini Yeniden İzle</span>
              </button>
            </div>

            <CourtyardSceneSvg />
          </div>
        </section>

        {/* Aşama 1: Onaylı Karşılama ve Keşif Tercihi */}
        {phase === 'welcome-choice' && (
          <GuideDialogueCard dialogue={WELCOME_DIALOGUE} mood="welcoming">
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => handleChooseDiscovery('guided')}
                className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal-hover)] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Compass className="w-4 h-4" aria-hidden="true" />
                <span>Birlikte gezelim</span>
              </button>

              <button
                type="button"
                onClick={() => handleChooseDiscovery('independent')}
                className="min-h-[44px] px-5 py-2.5 rounded-lg border border-[var(--campus-border)] bg-[var(--stone-cream)] hover:bg-[var(--campus-surface-muted)] text-[var(--seljuk-navy)] text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <MapIcon className="w-4 h-4 text-[var(--seljuk-teal)]" aria-hidden="true" />
                <span>Kendim keşfedeceğim</span>
              </button>
            </div>
          </GuideDialogueCard>
        )}

        {/* Aşama 2: Sınıf Seçimi (2–7. Sınıflar) */}
        {phase === 'grade-select' && (
          <section
            aria-labelledby="grade-select-heading"
            className="rounded-xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-5 sm:p-6 shadow-sm space-y-5"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[var(--seljuk-teal)]">
                  Adım 2 · Sınıf Düzeyini Seç
                </p>
                <h2 id="grade-select-heading" className="text-xl font-bold text-[var(--seljuk-navy)]">
                  Kaçıncı sınıfa gidiyorsun?
                </h2>
                <p className="text-sm text-[var(--campus-ink-muted)] mt-1">
                  Görevlerin dili, ipuçları ve üretim seçenekleri sınıfına göre uyarlanır. İstediğin zaman
                  üst menüden değiştirebilirsin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPhase('welcome-choice')}
                className="min-h-[44px] px-3.5 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--stone-cream)] text-xs font-semibold text-[var(--seljuk-navy)] hover:bg-[var(--campus-surface-muted)] inline-flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Geri</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {GRADE_LIST.map((profile) => {
                const isSelected = state.selectedGrade === profile.grade;
                return (
                  <button
                    key={profile.grade}
                    type="button"
                    onClick={() => handleSelectGrade(profile.grade)}
                    className={`min-h-[78px] p-4 rounded-xl border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[var(--seljuk-teal)] bg-[var(--seljuk-teal-soft)]'
                        : 'border-[var(--campus-border)] bg-[var(--stone-cream)] hover:bg-[var(--campus-surface-muted)] hover:border-[var(--stone-dark)]'
                    }`}
                  >
                    <span className="text-lg font-bold text-[var(--seljuk-navy)] tabular-nums">
                      {profile.label}
                    </span>
                    <span className="text-xs font-medium text-[var(--campus-ink-muted)]">
                      {profile.tier === 'ilkokul' ? 'İlkokul Kampüsü' : 'Ortaokul Kampüsü'}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Aşama 3 (Birlikte Gezelim seçildiyse): Rehberli Tur */}
        {phase === 'guided-tour' && currentStop && currentTourDialogue && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--campus-ink-muted)]">
              <span className="tabular-nums">
                Rehberli Tanıtım Turu · Durak {tourIndex + 1} / {GUIDED_TOUR_STOPS.length}
              </span>
              <span className="tabular-nums text-[var(--seljuk-navy)]">{activeGradeProfile.label}</span>
            </div>

            <GuideDialogueCard dialogue={currentTourDialogue} mood="welcoming">
              {currentArea && (
                <div className="mt-2 p-4 rounded-xl bg-[var(--stone-cream)] border border-[var(--campus-border)] flex items-center gap-4">
                  <CampusBuildingSvg buildingId={currentArea.id} className="w-20 h-16 shrink-0" />
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-base font-bold text-[var(--seljuk-navy)]">{currentStop.title}</h3>
                    <p className="text-sm text-[var(--campus-ink-muted)]">{currentArea.summary}</p>
                  </div>
                </div>
              )}

              <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (tourIndex > 0) {
                      setTourIndex((i) => i - 1);
                    } else {
                      setPhase('grade-select');
                    }
                  }}
                  className="min-h-[44px] px-4 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--stone-cream)] text-sm font-semibold text-[var(--seljuk-navy)] hover:bg-[var(--campus-surface-muted)] inline-flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  <span>Önceki</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      completeGuidedTour();
                      onFinishToMap();
                    }}
                    className="min-h-[44px] px-4 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--campus-surface)] text-sm font-medium text-[var(--campus-ink-muted)] hover:text-[var(--seljuk-navy)] cursor-pointer"
                  >
                    Turu Bitir ve Haritaya Geç
                  </button>

                  {tourIndex < GUIDED_TOUR_STOPS.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setTourIndex((i) => i + 1)}
                      className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal-hover)] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                    >
                      <span>Sonraki Durak</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        completeGuidedTour();
                        onFinishToMap();
                      }}
                      className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[var(--courtyard-sage)] hover:opacity-90 text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                    >
                      <span>Kampüs Haritasına Geç</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            </GuideDialogueCard>
          </div>
        )}
      </div>
    </main>
  );
}
