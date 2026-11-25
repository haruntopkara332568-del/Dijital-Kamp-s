import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  FlaskConical,
  Globe2,
  Sparkles,
} from 'lucide-react';
import { useOptionalCampus } from '@/src/app/CampusProviders';
import { FullscreenButton } from '@/src/components/FullscreenButton';
import {
  CELESTIAL_BODIES,
  CELESTIAL_BODY_ORDER,
  EARTH_SUN_MOON_ACTIVITY_ID,
  EARTH_SUN_MOON_ACTIVITY_VERSION,
  EARTH_SUN_MOON_MATCH_OPTIONS,
  EARTH_SUN_MOON_UI_COPY,
  getCelestialBodyDefinition,
  type CelestialBodyId,
  type CelestialCategoryId,
} from '@/src/data/earthSunMoonActivity';
import { ACTIVE_DISCOVERY_UI_COPY } from '@/src/data/earthSunMoonExperiments';
import { speakSegments, stopSpeaking } from '@/src/services/speech';
import type { MissionProgress, MissionStageId, SupportedGrade } from '@/src/types/campus';
import { CelestialGlobeCanvas } from './CelestialGlobeCanvas';
import { EarthExplorerView } from './EarthExplorerView';
import { SunExplorerView } from './SunExplorerView';
import { MoonExplorerView } from './MoonExplorerView';
import { EarthSunMoonExperimentsView } from './EarthSunMoonExperimentsView';

export interface EarthSunMoonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type WorkspaceTab = 'learn' | 'experiments';
type ActivityMode = 'explore' | 'reinforce';

const DEFAULT_ROTATION: Record<CelestialBodyId, { rotY: number; rotX: number }> = {
  sun: { rotY: 0.2, rotX: 0.1 },
  earth: { rotY: -0.45, rotX: 0.28 }, // Avrupa, Anadolu ve Afrika ön planda
  moon: { rotY: 0.35, rotX: 0.08 },
};

function isValidBodyId(value: string): value is CelestialBodyId {
  return value === 'sun' || value === 'earth' || value === 'moon';
}

export function EarthSunMoonModal({ isOpen, onClose }: EarthSunMoonModalProps) {
  if (!isOpen) return null;
  return <EarthSunMoonModalInner onClose={onClose} />;
}

function EarthSunMoonModalInner({ onClose }: { onClose: () => void }) {
  const campus = useOptionalCampus();
  const activeGrade: SupportedGrade =
    campus?.state.selectedGrade ?? campus?.activeProfile?.selectedGrade ?? 3;
  const speechEnabled = campus?.state.speechEnabled ?? true;

  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>('learn');
  const [mode, setMode] = useState<ActivityMode>('explore');
  const [selectedBodyId, setSelectedBodyId] = useState<CelestialBodyId>('earth');

  const [inspectedIds, setInspectedIds] = useState<CelestialBodyId[]>(() => {
    const saved = campus?.getMissionProgress(EARTH_SUN_MOON_ACTIVITY_ID, activeGrade);
    const loaded = (saved?.selections.selectedDoorIds ?? []).filter(isValidBodyId);
    return loaded.includes('earth') ? loaded : [...loaded, 'earth'];
  });
  const [matchedIds, setMatchedIds] = useState<CelestialBodyId[]>(() => {
    const saved = campus?.getMissionProgress(EARTH_SUN_MOON_ACTIVITY_ID, activeGrade);
    return (saved?.selections.matchedVocabularyIds ?? []).filter(isValidBodyId);
  });
  const [wrongFeedbackByBody, setWrongFeedbackByBody] = useState<
    Partial<Record<CelestialBodyId, string>>
  >({});

  const experimentsTabRef = useRef<HTMLButtonElement>(null);
  const returningFromExperimentsRef = useRef(false);
  const initialMountSyncedRef = useRef(false);

  const persistProgress = useCallback(
    (nextInspected: CelestialBodyId[], nextMatched: CelestialBodyId[]) => {
      if (!campus) return;
      const allInspected = CELESTIAL_BODY_ORDER.every((id) => nextInspected.includes(id));
      const allMatched = CELESTIAL_BODY_ORDER.every((id) => nextMatched.includes(id));
      const completed = allInspected && allMatched;
      const completedStages: MissionStageId[] = [];
      if (allInspected) completedStages.push('kesfet');
      if (allMatched) completedStages.push('ogren');

      const existing = campus.getMissionProgress(EARTH_SUN_MOON_ACTIVITY_ID, activeGrade);
      const progress: MissionProgress = {
        missionId: EARTH_SUN_MOON_ACTIVITY_ID,
        missionVersion: EARTH_SUN_MOON_ACTIVITY_VERSION,
        grade: activeGrade,
        currentStage: completed ? 'ogren' : 'kesfet',
        completedStages,
        selections: {
          selectedDoorIds: nextInspected,
          inspectedCampusGate: allInspected,
          observationNotes: {},
          matchedVocabularyIds: nextMatched,
          matchedExampleSentence: allMatched,
          doorName: EARTH_SUN_MOON_UI_COPY.modalTitle,
          writtenText: '',
          usedEnglishWords: [],
        },
        draftArtifactId: null,
        selfEvaluation: null,
        completed,
        completedAt: completed ? (existing?.completedAt ?? new Date().toISOString()) : null,
        updatedAt: new Date().toISOString(),
      };
      campus.saveMissionProgress(progress);
    },
    [campus, activeGrade],
  );

  const speakTurkishText = useCallback((text: string) => {
    stopSpeaking();
    if (speechEnabled) void speakSegments([{ text, lang: 'tr-TR' }]).catch(() => undefined);
  }, [speechEnabled]);

  useEffect(() => {
    if (initialMountSyncedRef.current) return;
    initialMountSyncedRef.current = true;
    persistProgress(inspectedIds, matchedIds);
  }, [inspectedIds, matchedIds, persistProgress]);

  // Escape ile güvenli çıkış
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        stopSpeaking();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => stopSpeaking, []);

  const showExperiments = workspaceTab === 'experiments';
  useEffect(() => {
    if (showExperiments || !returningFromExperimentsRef.current) return;
    returningFromExperimentsRef.current = false;
    experimentsTabRef.current?.focus({ preventScroll: true });
  }, [showExperiments]);

  const isExploringBody = !showExperiments && mode === 'explore';
  const showEarth = isExploringBody && selectedBodyId === 'earth';
  const showSun = isExploringBody && selectedBodyId === 'sun';
  const showMoon = isExploringBody && selectedBodyId === 'moon';
  const showFullGlobe = showEarth || showSun || showMoon;
  const allBodiesInspected = CELESTIAL_BODY_ORDER.every((id) => inspectedIds.includes(id));
  const allMatched = CELESTIAL_BODY_ORDER.every((id) => matchedIds.includes(id));
  const isActivityCompleted = allBodiesInspected && allMatched;

  const handleSelectBody = (bodyId: CelestialBodyId) => {
    stopSpeaking();
    setMode('explore');
    setSelectedBodyId(bodyId);

    const nextInspected = inspectedIds.includes(bodyId)
      ? inspectedIds
      : [...inspectedIds, bodyId];
    setInspectedIds(nextInspected);
    persistProgress(nextInspected, matchedIds);
  };

  const handleOpenReinforcement = () => {
    stopSpeaking();
    setMode('reinforce');
  };

  const handleMatchChoice = (bodyId: CelestialBodyId, chosenCategory: CelestialCategoryId) => {
    if (matchedIds.includes(bodyId)) return;
    const body = getCelestialBodyDefinition(bodyId);

    if (body.categoryId === chosenCategory) {
      const nextMatched = [...matchedIds, bodyId];
      setMatchedIds(nextMatched);
      setWrongFeedbackByBody((prev) => {
        const next = { ...prev };
        delete next[bodyId];
        return next;
      });
      persistProgress(inspectedIds, nextMatched);
      if (speechEnabled) {
        void speakTurkishText(body.matchSuccess);
      }
    } else {
      setWrongFeedbackByBody((prev) => ({ ...prev, [bodyId]: body.matchHint }));
      if (speechEnabled) {
        void speakTurkishText(body.matchHint);
      }
    }
  };

  const handleSwitchWorkspaceTab = (nextTab: WorkspaceTab) => {
    stopSpeaking();
    setWorkspaceTab(nextTab);
  };

  const handleCloseModal = () => {
    stopSpeaking();
    onClose();
  };

  if (showExperiments) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="active-experiments-title"
        data-testid="earth-sun-moon-modal"
        className="fixed inset-0 z-50 h-dvh overflow-hidden bg-[#0b1834] text-[#f8f1dd]"
      >
        <EarthSunMoonExperimentsView
          key={(campus?.activeProfile?.id ?? 'visitor') + '-' + activeGrade}
          activeGrade={activeGrade}
          onBack={() => {
            returningFromExperimentsRef.current = true;
            handleSwitchWorkspaceTab('learn');
          }}
        />
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="earth-sun-moon-title"
      data-testid="earth-sun-moon-modal"
      className={'fixed inset-0 z-50 flex items-center justify-center bg-[#060f24]/85 backdrop-blur-sm' + (showFullGlobe ? '' : ' p-2 sm:p-4')}
    >
      <div className={'relative flex w-full flex-col overflow-hidden bg-[#0c1b3a] text-[#f8f1dd] shadow-2xl' + (showFullGlobe
        ? ' h-dvh border-0'
        : ' max-h-[96dvh] max-w-5xl rounded-3xl border-2 border-[#d8a94c]')}>
        {/* Üst Başlık Çubuğu */}
        <header className={'flex flex-wrap items-center justify-between gap-2 border-b border-[#d8a94c]/30 bg-[#09152e]/95' + (showFullGlobe
          ? ' px-3 py-2 sm:px-5'
          : ' px-4 py-3 sm:px-6')}>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className={'h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#f3cc7a]/45 bg-[#162d5c] text-[#f6dc9b]' + (showFullGlobe ? ' hidden sm:flex' : ' flex')}>
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="earth-sun-moon-title"
                  className="text-base font-extrabold text-[#fff7e2] sm:text-xl"
                >
                  {showSun ? 'Güneş’i Keşfediyorum' : showMoon ? 'Ay’ı Keşfediyorum' : EARTH_SUN_MOON_UI_COPY.modalTitle}
                </h2>
                <span className="rounded-full border border-[#f3cc7a]/40 bg-[#183061] px-2.5 py-0.5 text-[11px] font-bold text-[#fbe4a8]">
                  {activeGrade}. Sınıf
                </span>
                {!showFullGlobe && (
                  <span className="rounded-full border border-sky-300/35 bg-sky-950/80 px-2.5 py-0.5 text-[11px] font-semibold text-sky-200">
                    {EARTH_SUN_MOON_UI_COPY.representativeBadge}
                  </span>
                )}
              </div>
              {!showFullGlobe && (
                <p className="text-[11px] text-[#c7d4ec] sm:text-xs">
                  İncelenen: <strong className="text-[#f7df9d]">{inspectedIds.length}/3</strong> •
                  Eşleştirme: <strong className="text-[#f7df9d]">{matchedIds.length}/3</strong>
                  {isActivityCompleted && (
                    <span className="ml-2 font-bold text-emerald-300">✓ Tamamlandı</span>
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {showFullGlobe && <FullscreenButton />}
            <button
              type="button"
              onClick={handleCloseModal}
              className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-xl border border-[#f3cc7a]/45 bg-[#172e5c] px-4 py-2 text-xs font-bold text-[#fff5d6] transition-colors hover:bg-[#213f7a] sm:text-sm"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>{EARTH_SUN_MOON_UI_COPY.backLabel}</span>
            </button>
          </div>
        </header>

        {/* Ana Bölüm Geçişi: Gök Cisimlerini Tanı (Görev 02) / Aktif Keşif Deneyleri (Görev 03) */}
        <div
          role="tablist"
          aria-label="Dünya, Güneş ve Ay çalışma bölümleri"
          className="grid grid-cols-2 gap-2 border-b border-[#d8a94c]/25 bg-[#08132a] px-4 py-2 sm:px-6"
        >
          <button
            type="button"
            role="tab"
            aria-selected="true"
            data-testid="workspace-tab-learn"
            onClick={() => handleSwitchWorkspaceTab('learn')}
            className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-extrabold transition-all sm:text-sm border-[#f6dc9b] bg-[#1a3469] text-[#fff8e6] shadow-md"
          >
            <Globe2 className="h-4 w-4 shrink-0 text-[#f6dc9b]" aria-hidden="true" />
            <span>{ACTIVE_DISCOVERY_UI_COPY.learnTabLabel}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected="false"
            ref={experimentsTabRef}
            data-testid="workspace-tab-experiments"
            onClick={() => handleSwitchWorkspaceTab('experiments')}
            className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-extrabold transition-all sm:text-sm border-amber-400/45 bg-amber-500/10 text-[#ffe8ad] hover:border-amber-300 hover:bg-amber-500/20"
          >
            <FlaskConical className="h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
            <span>{ACTIVE_DISCOVERY_UI_COPY.sectionTabLabel} (3 Deney)</span>
          </button>
        </div>

        {/* Üç Gök Cismi Seçim Çubuğu ve Kısa Pekiştirme Sekmesi (yalnızca Gök Cisimlerini Tanı bölümünde) */}
        <nav
          aria-label="Gök cismi seçimi"
          className={'grid gap-2 border-b border-[#d8a94c]/20 bg-[#0b1834]' + (showFullGlobe
            ? (showSun || showMoon ? ' grid-cols-3 px-2 py-2 sm:px-4' : ' grid-cols-4 px-2 py-2 sm:px-4')
            : ' grid-cols-2 px-4 py-2.5 sm:grid-cols-4 sm:px-6')}
        >
          {CELESTIAL_BODIES.map((body) => {
            const isSelected = mode === 'explore' && selectedBodyId === body.id;
            const isInspected = inspectedIds.includes(body.id);

            return (
              <button
                key={body.id}
                type="button"
                data-testid={`celestial-tab-${body.id}`}
                onClick={() => handleSelectBody(body.id)}
                className={`flex cursor-pointer items-center rounded-2xl border py-1.5 transition-all ${showFullGlobe
                  ? 'min-h-11 justify-center px-1.5 text-center'
                  : 'min-h-[56px] gap-2.5 px-3 text-left'} ${
                  isSelected
                    ? 'border-[#f6dc9b] bg-[#1a3469] shadow-lg ring-2 ring-[#f6dc9b]/35'
                    : 'border-[#d8a94c]/25 bg-[#102247]/80 hover:border-[#f3cc7a]/60 hover:bg-[#152c5a]'
                }`}
              >
                {!showFullGlobe && (
                  <CelestialGlobeCanvas
                    bodyId={body.id}
                    size={44}
                    rotY={DEFAULT_ROTATION[body.id].rotY}
                    rotX={DEFAULT_ROTATION[body.id].rotX}
                    showStarfield={false}
                    className="shrink-0 rounded-full"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className={'flex items-center gap-1.5' + (showFullGlobe ? ' justify-center' : '')}>
                    <span className="truncate text-sm font-extrabold text-[#fff8e6]">
                      {body.name}
                    </span>
                    {isInspected && !showFullGlobe && (
                      <CheckCircle2
                        className="h-4 w-4 shrink-0 text-emerald-400"
                        aria-label="İncelendi"
                      />
                    )}
                  </div>
                  {!showFullGlobe && <span className="block truncate text-[11px] text-[#bfd0ee]">{body.categoryLabel}</span>}
                </div>
              </button>
            );
          })}

          {!showSun && !showMoon && <button
            type="button"
            data-testid="celestial-tab-reinforce"
            onClick={handleOpenReinforcement}
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-2xl border py-1.5 text-center transition-all ${showFullGlobe
              ? 'min-h-11 px-1'
              : 'min-h-[56px] px-3'} ${
              mode === 'reinforce'
                ? 'border-emerald-300 bg-emerald-900/70 text-emerald-100 shadow-lg ring-2 ring-emerald-400/35'
                : allBodiesInspected
                  ? 'border-[#f6dc9b] bg-amber-500/20 text-[#fff4cf] hover:bg-amber-500/30'
                  : 'border-[#d8a94c]/25 bg-[#102247]/80 text-[#d3e0f7] hover:border-[#f3cc7a]/60'
            }`}
          >
            {!showFullGlobe && <Sparkles className="h-4 w-4 shrink-0 text-[#f6dc9b]" aria-hidden="true" />}
            <div className={showFullGlobe ? 'text-center' : 'text-left'}>
              <span className="block text-xs font-extrabold sm:text-sm">
                {EARTH_SUN_MOON_UI_COPY.reinforcementTabLabel}
              </span>
              {!showFullGlobe && (
                <span className="block text-[11px] opacity-85">
                  {allMatched ? '3/3 Tamamlandı' : `${matchedIds.length}/3 Eşleştirme`}
                </span>
              )}
            </div>
          </button>}
        </nav>

        {/* Ana İçerik Gövdesi */}
        <div className={'min-h-0 flex-1 overflow-y-auto' + (showFullGlobe ? ' p-2 sm:p-3' : ' p-4 sm:p-6')}>
          {showEarth ? (
            <EarthExplorerView />
          ) : showSun ? (
            <SunExplorerView />
          ) : showMoon ? (
            <MoonExplorerView />
          ) : (
            /* Kısa Pekiştirme Etkinliği: 3 Görseli Doğru Adlarla Eşleştirme */
            <section
              aria-label={EARTH_SUN_MOON_UI_COPY.reinforcementTitle}
              data-testid="earth-sun-moon-reinforcement"
              className="mx-auto max-w-4xl space-y-4"
            >
              <div className="rounded-2xl border border-[#d8a94c]/35 bg-[#102247] p-4">
                <h3 className="text-lg font-extrabold text-[#fff7e2] sm:text-xl">
                  {EARTH_SUN_MOON_UI_COPY.reinforcementTitle}
                </h3>
                <p className="mt-1 text-xs text-[#d0dcf4] sm:text-sm">
                  {EARTH_SUN_MOON_UI_COPY.reinforcementInstruction}
                </p>
                {!allBodiesInspected && (
                  <p className="mt-2 text-xs font-semibold text-amber-200">
                    {EARTH_SUN_MOON_UI_COPY.inspectAllFirstNote}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {CELESTIAL_BODIES.map((body) => {
                  const isMatched = matchedIds.includes(body.id);
                  const wrongHint = wrongFeedbackByBody[body.id];

                  return (
                    <div
                      key={body.id}
                      data-testid={`match-card-${body.id}`}
                      className={`flex flex-col items-center rounded-3xl border-2 p-4 text-center transition-all ${
                        isMatched
                          ? 'border-emerald-400/75 bg-emerald-950/35'
                          : 'border-[#d8a94c]/30 bg-[#0d1d3f]'
                      }`}
                    >
                      <CelestialGlobeCanvas
                        bodyId={body.id}
                        size={112}
                        rotY={DEFAULT_ROTATION[body.id].rotY}
                        rotX={DEFAULT_ROTATION[body.id].rotX}
                        showStarfield
                        ariaLabel={`${body.name} modeli`}
                        className="rounded-2xl border border-[#f6dc9b]/25 shadow-md"
                      />

                      <h4 className="mt-3 text-lg font-extrabold text-[#fff7e2]">{body.name}</h4>

                      {isMatched ? (
                        <div className="mt-3 flex w-full flex-col items-center gap-1.5 rounded-2xl border border-emerald-400/50 bg-emerald-900/50 px-3 py-3">
                          <CheckCircle2 className="h-6 w-6 text-emerald-300" aria-hidden="true" />
                          <span className="text-sm font-extrabold text-emerald-100">
                            {body.categoryLabel}
                          </span>
                          <p className="text-xs text-emerald-200">{body.matchSuccess}</p>
                        </div>
                      ) : (
                        <div className="mt-3 flex w-full flex-col gap-2">
                          {EARTH_SUN_MOON_MATCH_OPTIONS.map((option) => (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => handleMatchChoice(body.id, option.id)}
                              className="min-h-[44px] w-full cursor-pointer rounded-xl border border-[#d8a94c]/40 bg-[#162d5c] px-3 py-2 text-sm font-bold text-[#fff5d6] transition-colors hover:border-[#f6dc9b] hover:bg-[#204080]"
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {wrongHint && !isMatched && (
                        <p
                          role="status"
                          className="mt-2.5 rounded-xl border border-amber-400/45 bg-amber-950/70 px-3 py-2 text-left text-xs leading-snug text-amber-100"
                        >
                          {wrongHint}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {isActivityCompleted && (
                <div
                  role="status"
                  data-testid="earth-sun-moon-completed"
                  className="flex flex-col items-center justify-between gap-3 rounded-3xl border-2 border-emerald-400/75 bg-emerald-950/60 p-5 text-center sm:flex-row sm:text-left"
                >
                  <div>
                    <h4 className="text-lg font-extrabold text-emerald-200">
                      {EARTH_SUN_MOON_UI_COPY.completedBannerTitle}
                    </h4>
                    <p className="mt-1 text-xs text-emerald-100 sm:text-sm">
                      {EARTH_SUN_MOON_UI_COPY.completedBannerText}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSwitchWorkspaceTab('experiments')}
                      className="inline-flex min-h-[46px] shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-amber-400 px-5 py-2 text-sm font-extrabold text-[#0b1834] transition-colors hover:bg-amber-300"
                    >
                      <FlaskConical className="h-4 w-4" aria-hidden="true" />
                      <span>Aktif Keşif Deneylerine Geç</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="inline-flex min-h-[46px] shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2 text-sm font-extrabold text-[#061c14] transition-colors hover:bg-emerald-400"
                    >
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                      <span>Gözlemevine Dön</span>
                    </button>
                  </div>
                </div>
              )}

              <p className="text-center text-[11px] text-[#a9bce0]">
                {EARTH_SUN_MOON_UI_COPY.representativeFootnote}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
