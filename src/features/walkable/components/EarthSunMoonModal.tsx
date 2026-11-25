import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FlaskConical,
  Globe2,
  RotateCcw,
  RotateCw,
  Sparkles,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
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

const MIN_ZOOM = 1;
const MAX_ZOOM = 2.2;

function clampZoom(value: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(value.toFixed(2))));
}

function clampRotX(value: number): number {
  return Math.min(0.88, Math.max(-0.88, value));
}

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
  const [rotY, setRotY] = useState<number>(DEFAULT_ROTATION.earth.rotY);
  const [rotX, setRotX] = useState<number>(DEFAULT_ROTATION.earth.rotX);
  const [zoom, setZoom] = useState<number>(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);

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

  const speechRunIdRef = useRef(0);
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

  const speakTurkishText = useCallback(
    async (text: string) => {
      const runId = ++speechRunIdRef.current;
      stopSpeaking();
      setSpeechNotice(null);

      if (!speechEnabled) {
        setIsSpeaking(false);
        setSpeechNotice(EARTH_SUN_MOON_UI_COPY.speechFallbackNote);
        return;
      }

      setIsSpeaking(true);
      try {
        const result = await speakSegments([{ text, lang: 'tr-TR' }]);
        if (speechRunIdRef.current !== runId) return;
        if (!result.spoken) {
          setSpeechNotice(result.fallbackReason ?? EARTH_SUN_MOON_UI_COPY.speechFallbackNote);
        }
      } catch {
        if (speechRunIdRef.current === runId) {
          setSpeechNotice(EARTH_SUN_MOON_UI_COPY.speechFallbackNote);
        }
      } finally {
        if (speechRunIdRef.current === runId) {
          setIsSpeaking(false);
        }
      }
    },
    [speechEnabled],
  );

  const stopAllNarration = useCallback(() => {
    speechRunIdRef.current += 1;
    stopSpeaking();
    setIsSpeaking(false);
  }, []);

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
        stopAllNarration();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, stopAllNarration]);

  useEffect(() => {
    return () => {
      speechRunIdRef.current += 1;
      stopSpeaking();
    };
  }, []);

  const showEarth = workspaceTab === 'learn' && mode === 'explore' && selectedBodyId === 'earth';
  const activeBody = getCelestialBodyDefinition(selectedBodyId);
  const gradeContent = activeBody.byGrade[activeGrade];
  const allBodiesInspected = CELESTIAL_BODY_ORDER.every((id) => inspectedIds.includes(id));
  const allMatched = CELESTIAL_BODY_ORDER.every((id) => matchedIds.includes(id));
  const isActivityCompleted = allBodiesInspected && allMatched;

  const handleSelectBody = (bodyId: CelestialBodyId) => {
    stopAllNarration();
    setMode('explore');
    setSelectedBodyId(bodyId);
    setRotY(DEFAULT_ROTATION[bodyId].rotY);
    setRotX(DEFAULT_ROTATION[bodyId].rotX);
    setZoom(1);
    setSpeechNotice(null);

    const nextInspected = inspectedIds.includes(bodyId)
      ? inspectedIds
      : [...inspectedIds, bodyId];
    setInspectedIds(nextInspected);
    persistProgress(nextInspected, matchedIds);

    if (bodyId !== 'earth' && speechEnabled) {
      const nextContent = getCelestialBodyDefinition(bodyId).byGrade[activeGrade];
      void speakTurkishText(nextContent.spokenText);
    }
  };

  const handleNextBody = () => {
    const currentIndex = CELESTIAL_BODY_ORDER.indexOf(selectedBodyId);
    const nextUninspected = CELESTIAL_BODY_ORDER.find(
      (id, idx) => idx > currentIndex && !inspectedIds.includes(id),
    );
    if (nextUninspected) {
      handleSelectBody(nextUninspected);
      return;
    }
    const nextIndex = (currentIndex + 1) % CELESTIAL_BODY_ORDER.length;
    handleSelectBody(CELESTIAL_BODY_ORDER[nextIndex]);
  };

  const handleOpenReinforcement = () => {
    stopAllNarration();
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
    stopAllNarration();
    setSpeechNotice(null);
    setWorkspaceTab(nextTab);
  };

  const handleCloseModal = () => {
    stopAllNarration();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="earth-sun-moon-title"
      data-testid="earth-sun-moon-modal"
      className={'fixed inset-0 z-50 flex items-center justify-center bg-[#060f24]/85 backdrop-blur-sm' + (showEarth ? '' : ' p-2 sm:p-4')}
    >
      <div className={'relative flex w-full flex-col overflow-hidden bg-[#0c1b3a] text-[#f8f1dd] shadow-2xl' + (showEarth
        ? ' h-dvh border-0'
        : ' max-h-[96dvh] max-w-5xl rounded-3xl border-2 border-[#d8a94c]')}>
        {/* Üst Başlık Çubuğu */}
        <header className={'flex flex-wrap items-center justify-between gap-2 border-b border-[#d8a94c]/30 bg-[#09152e]/95' + (showEarth
          ? ' px-3 py-2 sm:px-5'
          : ' px-4 py-3 sm:px-6')}>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className={'h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#f3cc7a]/45 bg-[#162d5c] text-[#f6dc9b]' + (showEarth ? ' hidden sm:flex' : ' flex')}>
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="earth-sun-moon-title"
                  className="text-base font-extrabold text-[#fff7e2] sm:text-xl"
                >
                  {EARTH_SUN_MOON_UI_COPY.modalTitle}
                </h2>
                <span className="rounded-full border border-[#f3cc7a]/40 bg-[#183061] px-2.5 py-0.5 text-[11px] font-bold text-[#fbe4a8]">
                  {activeGrade}. Sınıf
                </span>
                {!showEarth && (
                  <span className="rounded-full border border-sky-300/35 bg-sky-950/80 px-2.5 py-0.5 text-[11px] font-semibold text-sky-200">
                    {EARTH_SUN_MOON_UI_COPY.representativeBadge}
                  </span>
                )}
              </div>
              {!showEarth && (
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
            {showEarth && <FullscreenButton />}
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
            aria-selected={workspaceTab === 'learn'}
            data-testid="workspace-tab-learn"
            onClick={() => handleSwitchWorkspaceTab('learn')}
            className={`inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-extrabold transition-all sm:text-sm ${
              workspaceTab === 'learn'
                ? 'border-[#f6dc9b] bg-[#1a3469] text-[#fff8e6] shadow-md'
                : 'border-[#d8a94c]/25 bg-[#0e1e40]/80 text-[#c5d5f2] hover:border-[#f3cc7a]/55 hover:bg-[#142b59]'
            }`}
          >
            <Globe2 className="h-4 w-4 shrink-0 text-[#f6dc9b]" aria-hidden="true" />
            <span>{ACTIVE_DISCOVERY_UI_COPY.learnTabLabel}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={workspaceTab === 'experiments'}
            data-testid="workspace-tab-experiments"
            onClick={() => handleSwitchWorkspaceTab('experiments')}
            className={`inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-extrabold transition-all sm:text-sm ${
              workspaceTab === 'experiments'
                ? 'border-amber-300 bg-amber-500/25 text-[#fff8e6] shadow-md ring-1 ring-amber-300/40'
                : 'border-amber-400/45 bg-amber-500/10 text-[#ffe8ad] hover:border-amber-300 hover:bg-amber-500/20'
            }`}
          >
            <FlaskConical className="h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
            <span>{ACTIVE_DISCOVERY_UI_COPY.sectionTabLabel} (3 Deney)</span>
          </button>
        </div>

        {/* Üç Gök Cismi Seçim Çubuğu ve Kısa Pekiştirme Sekmesi (yalnızca Gök Cisimlerini Tanı bölümünde) */}
        {workspaceTab === 'learn' && (
          <nav
            aria-label="Gök cismi seçimi"
            className={'grid gap-2 border-b border-[#d8a94c]/20 bg-[#0b1834]' + (showEarth
              ? ' grid-cols-4 px-2 py-2 sm:px-4'
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
                  className={`flex cursor-pointer items-center rounded-2xl border py-1.5 transition-all ${showEarth
                    ? 'min-h-11 justify-center px-1.5 text-center'
                    : 'min-h-[56px] gap-2.5 px-3 text-left'} ${
                    isSelected
                      ? 'border-[#f6dc9b] bg-[#1a3469] shadow-lg ring-2 ring-[#f6dc9b]/35'
                      : 'border-[#d8a94c]/25 bg-[#102247]/80 hover:border-[#f3cc7a]/60 hover:bg-[#152c5a]'
                  }`}
                >
                  {!showEarth && (
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
                    <div className={'flex items-center gap-1.5' + (showEarth ? ' justify-center' : '')}>
                      <span className="truncate text-sm font-extrabold text-[#fff8e6]">
                        {body.name}
                      </span>
                      {isInspected && !showEarth && (
                        <CheckCircle2
                          className="h-4 w-4 shrink-0 text-emerald-400"
                          aria-label="İncelendi"
                        />
                      )}
                    </div>
                    {!showEarth && <span className="block truncate text-[11px] text-[#bfd0ee]">{body.categoryLabel}</span>}
                  </div>
                </button>
              );
            })}

            <button
              type="button"
              data-testid="celestial-tab-reinforce"
              onClick={handleOpenReinforcement}
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-2xl border py-1.5 text-center transition-all ${showEarth
                ? 'min-h-11 px-1'
                : 'min-h-[56px] px-3'} ${
                mode === 'reinforce'
                  ? 'border-emerald-300 bg-emerald-900/70 text-emerald-100 shadow-lg ring-2 ring-emerald-400/35'
                  : allBodiesInspected
                    ? 'border-[#f6dc9b] bg-amber-500/20 text-[#fff4cf] hover:bg-amber-500/30'
                    : 'border-[#d8a94c]/25 bg-[#102247]/80 text-[#d3e0f7] hover:border-[#f3cc7a]/60'
              }`}
            >
              {!showEarth && <Sparkles className="h-4 w-4 shrink-0 text-[#f6dc9b]" aria-hidden="true" />}
              <div className={showEarth ? 'text-center' : 'text-left'}>
                <span className="block text-xs font-extrabold sm:text-sm">
                  {EARTH_SUN_MOON_UI_COPY.reinforcementTabLabel}
                </span>
                {!showEarth && (
                  <span className="block text-[11px] opacity-85">
                    {allMatched ? '3/3 Tamamlandı' : `${matchedIds.length}/3 Eşleştirme`}
                  </span>
                )}
              </div>
            </button>
          </nav>
        )}

        {/* Ana İçerik Gövdesi */}
        <div className={'min-h-0 flex-1 overflow-y-auto' + (showEarth ? ' p-2 sm:p-3' : ' p-4 sm:p-6')}>
          {workspaceTab === 'experiments' ? (
            <EarthSunMoonExperimentsView
              activeGrade={activeGrade}
              speechEnabled={speechEnabled}
              isSpeaking={isSpeaking}
              speechNotice={speechNotice}
              onSpeak={(text) => void speakTurkishText(text)}
              onStopSpeech={stopAllNarration}
              onBackToObservatory={handleCloseModal}
            />
          ) : showEarth ? (
            <EarthExplorerView />
          ) : mode === 'explore' ? (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              {/* Sol / Merkez: Büyük Etkileşimli 3B Küre Görünümü */}
              <section
                aria-label={`${activeBody.name} etkileşimli modeli`}
                className="flex flex-col items-center justify-between rounded-3xl border border-[#d8a94c]/30 bg-[#071229] p-4 lg:col-span-6"
              >
                <div className="mb-2 flex w-full items-center justify-between gap-2 text-xs text-[#c7d6f2]">
                  <span>{EARTH_SUN_MOON_UI_COPY.dragHint}</span>
                  <span className="rounded-md bg-[#11254d] px-2 py-0.5 font-mono text-[11px] font-bold text-[#f7df9d]">
                    %{Math.round(zoom * 100)}
                  </span>
                </div>

                <div className="relative my-1 flex items-center justify-center overflow-hidden rounded-2xl border border-[#f6dc9b]/20 shadow-inner">
                  <CelestialGlobeCanvas
                    bodyId={activeBody.id}
                    size={304}
                    rotY={rotY}
                    rotX={rotX}
                    zoom={zoom}
                    interactive
                    showStarfield
                    ariaLabel={`${activeBody.name} — ${activeBody.visualFeatureLabel}`}
                    onRotate={(dY, dX) => {
                      setRotY((prev) => prev + dY);
                      setRotX((prev) => clampRotX(prev + dX));
                    }}
                    onZoomWheel={(dZoom) => setZoom((prev) => clampZoom(prev + dZoom))}
                    className="h-[256px] w-[256px] sm:h-[304px] sm:w-[304px]"
                  />
                </div>

                {/* Döndürme ve Yakınlaştırma Denetimleri */}
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    aria-label="Modeli sola döndür"
                    onClick={() => setRotY((prev) => prev - 0.5)}
                    className="inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-xl border border-[#d8a94c]/35 bg-[#12264f] px-3 text-xs font-bold text-[#f8f1dd] hover:bg-[#1b366d]"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label="Modeli sağa döndür"
                    onClick={() => setRotY((prev) => prev + 0.5)}
                    className="inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-xl border border-[#d8a94c]/35 bg-[#12264f] px-3 text-xs font-bold text-[#f8f1dd] hover:bg-[#1b366d]"
                  >
                    <RotateCw className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label="Modeli uzaklaştır"
                    disabled={zoom <= MIN_ZOOM}
                    onClick={() => setZoom((prev) => clampZoom(prev - 0.25))}
                    className="inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-xl border border-[#d8a94c]/35 bg-[#12264f] px-3 text-xs font-bold text-[#f8f1dd] hover:bg-[#1b366d] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <ZoomOut className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label="Modeli yakınlaştır"
                    disabled={zoom >= MAX_ZOOM}
                    onClick={() => setZoom((prev) => clampZoom(prev + 0.25))}
                    className="inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-xl border border-[#d8a94c]/35 bg-[#12264f] px-3 text-xs font-bold text-[#f8f1dd] hover:bg-[#1b366d] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <ZoomIn className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRotY(DEFAULT_ROTATION[activeBody.id].rotY);
                      setRotX(DEFAULT_ROTATION[activeBody.id].rotX);
                      setZoom(1);
                    }}
                    className="min-h-[44px] cursor-pointer rounded-xl border border-[#d8a94c]/35 bg-[#12264f] px-3.5 text-xs font-bold text-[#f7df9d] hover:bg-[#1b366d]"
                  >
                    Görünümü Sıfırla
                  </button>
                </div>

                <p className="mt-2.5 text-center text-[11px] text-[#a9bce0]">
                  {EARTH_SUN_MOON_UI_COPY.representativeFootnote}
                </p>
              </section>

              {/* Sağ: Yaşa Uygun Bilimsel Açıklama ve Kontroller */}
              <section className="flex flex-col justify-between gap-4 rounded-3xl border border-[#d8a94c]/30 bg-[#102247]/90 p-5 lg:col-span-6">
                <div className="space-y-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span
                        className="inline-block rounded-full px-2.5 py-0.5 text-xs font-extrabold text-[#0b1834]"
                        style={{ backgroundColor: activeBody.accentHex }}
                      >
                        {activeBody.categoryLabel}
                      </span>
                      <h3 className="mt-1 text-2xl font-extrabold text-[#fff8e6] sm:text-3xl">
                        {activeBody.name}
                      </h3>
                    </div>
                    <span className="rounded-xl border border-[#f3cc7a]/35 bg-[#0a1733] px-3 py-1.5 text-xs font-bold text-[#f7df9d]">
                      {EARTH_SUN_MOON_UI_COPY.gradeFocusTitle[activeGrade]}
                    </span>
                  </div>

                  {/* Temel Bilimsel Gerçek Vurgusu */}
                  <div className="rounded-2xl border border-[#f6dc9b]/45 bg-[#173063] px-4 py-3">
                    <p className="text-base font-extrabold text-[#fff5d4] sm:text-lg">
                      {activeBody.coreFact}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[#cde0ff]">
                      {gradeContent.focusBadge}
                    </p>
                  </div>

                  {/* Sınıf Düzeyine Özel Kısa Açıklama */}
                  <p className="text-sm leading-relaxed text-[#eef3fc] sm:text-base">
                    {gradeContent.summary}
                  </p>

                  {/* Özellik / Karşılaştırma / İlişki Maddeleri */}
                  <ul className="space-y-2 rounded-2xl border border-[#d8a94c]/25 bg-[#091632]/85 p-3.5 text-xs sm:text-sm text-[#e8effc]">
                    {gradeContent.keyPoints.map((point) => (
                      <li key={point} className="flex items-start gap-2">
                        <span
                          className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#f3cc7a]"
                          aria-hidden="true"
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Ses Durumu / Yedek Bilgi */}
                  {speechNotice && (
                    <div
                      role="status"
                      className="flex items-center gap-2 rounded-xl border border-amber-400/35 bg-amber-950/50 px-3 py-2 text-xs text-amber-100"
                    >
                      <VolumeX className="h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
                      <span>{speechNotice}</span>
                    </div>
                  )}
                </div>

                {/* Alt Eylem Düğmeleri: Tekrar Dinle, Sonraki Gök Cismi, Kısa Pekiştirme */}
                <div className="flex flex-wrap items-center gap-2.5 border-t border-[#d8a94c]/25 pt-4">
                  <button
                    type="button"
                    onClick={() => void speakTurkishText(gradeContent.spokenText)}
                    className="inline-flex min-h-[46px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#f6dc9b]/50 bg-[#19356b] px-4 py-2 text-xs font-bold text-[#fff5d6] transition-colors hover:bg-[#23488f] sm:text-sm"
                  >
                    <Volume2
                      className={`h-4 w-4 text-[#f6dc9b] ${isSpeaking ? 'animate-pulse' : ''}`}
                      aria-hidden="true"
                    />
                    <span>{EARTH_SUN_MOON_UI_COPY.listenAgainLabel}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextBody}
                    className="inline-flex min-h-[46px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#d8a94c] px-4 py-2 text-xs font-extrabold text-[#0b1834] transition-colors hover:bg-[#e8be66] sm:text-sm"
                  >
                    <span>{EARTH_SUN_MOON_UI_COPY.nextBodyLabel}</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>

                  {allBodiesInspected && (
                    <button
                      type="button"
                      onClick={handleOpenReinforcement}
                      className="inline-flex min-h-[46px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-emerald-400/60 bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white transition-colors hover:bg-emerald-500 sm:text-sm"
                    >
                      <Sparkles className="h-4 w-4" aria-hidden="true" />
                      <span>{EARTH_SUN_MOON_UI_COPY.startReinforcementLabel}</span>
                    </button>
                  )}
                </div>
              </section>
            </div>
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
