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
    <main className="min-h-dvh bg-[var(--campus-canvas)] px-4 py-6 sm:py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Avlu Sahnesi Üst Şeridi */}
        <div className="rounded-2xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-4 sm:p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-xs font-semibold text-[var(--courtyard-sage)]">
                Karşılama Avlusu
              </p>
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--campus-ink)]">
                Kampüs Avlusuna Hoş Geldin
              </h1>
            </div>

            <button
              type="button"
              onClick={onReplayGate}
              className="min-h-[44px] px-3.5 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--campus-canvas)] hover:bg-[var(--campus-surface-muted)] text-xs font-semibold text-[var(--campus-ink)] inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[var(--seljuk-teal)]" aria-hidden="true" />
              <span>Kapı Girişini Yeniden İzle</span>
            </button>
          </div>

          {/* Özgün Avlu ve Yönlendirme Levhası SVG Sahnesi */}
          <svg
            viewBox="0 0 720 180"
            className="w-full h-auto rounded-xl border border-[var(--campus-border)] bg-[#edf6f9]"
            role="img"
            aria-label="Yeşil alanlar, yürüyüş yolları, üç öğrenme binası ve yönlendirme levhalarının yer aldığı kampüs avlusu"
          >
            <title>Kampüs Karşılama Avlusu</title>
            {/* Gökyüzü ve Uzak Tepeler */}
            <rect x="0" y="0" width="720" height="115" fill="#e6f4f8" />
            <path d="M 0 115 Q 180 86 360 110 Q 540 82 720 115 L 720 180 L 0 180 Z" fill="var(--courtyard-sage-soft)" />

            {/* Üç Modern Eğitim Binası Silüeti */}
            <g>
              <rect x="64" y="48" width="112" height="62" rx="4" fill="var(--campus-surface)" stroke="var(--stone-dark)" strokeWidth="2" />
              <path d="M 56 48 L 120 26 L 184 48 Z" fill="var(--sandstone-gold-soft)" stroke="var(--stone-dark)" strokeWidth="2" />
              <text x="120" y="84" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--campus-ink)">Gezi ve Keşif</text>
            </g>

            <g>
              <rect x="304" y="38" width="112" height="72" rx="4" fill="var(--campus-surface)" stroke="var(--seljuk-teal)" strokeWidth="2" />
              <rect x="320" y="52" width="24" height="18" rx="2" fill="var(--seljuk-teal-soft)" />
              <rect x="376" y="52" width="24" height="18" rx="2" fill="var(--seljuk-teal-soft)" />
              <text x="360" y="92" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--campus-ink)">İngilizce Dünyası</text>
            </g>

            <g>
              <rect x="544" y="48" width="112" height="62" rx="4" fill="var(--campus-surface)" stroke="var(--courtyard-sage)" strokeWidth="2" />
              <path d="M 544 48 Q 600 28 656 48 Z" fill="var(--courtyard-sage-soft)" stroke="var(--courtyard-sage)" strokeWidth="2" />
              <text x="600" y="84" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--campus-ink)">Kitap ve Hikâye</text>
            </g>

            {/* Yürüyüş Yolları */}
            <path d="M 360 180 L 360 110" stroke="var(--stone-light)" strokeWidth="28" strokeLinecap="round" />
            <path d="M 120 112 Q 240 132 360 142 Q 480 132 600 112" fill="none" stroke="var(--stone-light)" strokeWidth="18" strokeLinecap="round" />

            {/* Avlu Ağaçları */}
            <circle cx="242" cy="108" r="15" fill="var(--courtyard-sage)" />
            <circle cx="478" cy="108" r="15" fill="var(--courtyard-sage)" />

            {/* Yönlendirme Levhası */}
            <rect x="394" y="122" width="5" height="36" fill="var(--wood-deep)" />
            <rect x="398" y="124" width="66" height="16" rx="3" fill="var(--campus-surface)" stroke="var(--campus-ink)" strokeWidth="1.5" />
            <text x="431" y="135" textAnchor="middle" fontSize="9" fontWeight="600" fill="var(--campus-ink)">Keşif Avlusu</text>
          </svg>
        </div>

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
                className="min-h-[44px] px-5 py-2.5 rounded-lg border border-[var(--campus-border)] bg-[var(--campus-canvas)] hover:bg-[var(--campus-surface-muted)] text-[var(--campus-ink)] text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
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
            className="rounded-xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-5 sm:p-6 shadow-xs space-y-5"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[var(--seljuk-teal)]">
                  Adım 2 · Sınıf Düzeyini Seç
                </p>
                <h2 id="grade-select-heading" className="text-xl font-bold text-[var(--campus-ink)]">
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
                className="min-h-[44px] px-3.5 py-2 rounded-lg border border-[var(--campus-border)] text-xs font-semibold text-[var(--campus-ink)] hover:bg-[var(--campus-surface-muted)] inline-flex items-center gap-1.5 cursor-pointer shrink-0"
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
                    className={`min-h-[76px] p-4 rounded-xl border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[var(--seljuk-teal)] bg-[var(--seljuk-teal-soft)]'
                        : 'border-[var(--campus-border)] bg-[var(--campus-canvas)] hover:bg-[var(--campus-surface-muted)]'
                    }`}
                  >
                    <span className="text-lg font-bold text-[var(--campus-ink)] tabular-nums">
                      {profile.label}
                    </span>
                    <span className="text-xs text-[var(--campus-ink-muted)]">
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
              <span className="tabular-nums">{activeGradeProfile.label}</span>
            </div>

            <GuideDialogueCard dialogue={currentTourDialogue} mood="welcoming">
              {currentArea && (
                <div className="mt-2 p-4 rounded-lg bg-[var(--campus-canvas)] border border-[var(--campus-border)] space-y-1">
                  <h3 className="text-base font-bold text-[var(--campus-ink)]">{currentStop.title}</h3>
                  <p className="text-sm text-[var(--campus-ink-muted)]">{currentArea.summary}</p>
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
                  className="min-h-[44px] px-4 py-2 rounded-lg border border-[var(--campus-border)] text-sm font-semibold text-[var(--campus-ink)] hover:bg-[var(--campus-surface-muted)] inline-flex items-center gap-2 cursor-pointer"
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
                    className="min-h-[44px] px-4 py-2 rounded-lg border border-[var(--campus-border)] text-sm font-medium text-[var(--campus-ink-muted)] hover:text-[var(--campus-ink)] cursor-pointer"
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
