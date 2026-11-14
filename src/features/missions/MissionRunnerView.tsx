import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  Eye,
  HelpCircle,
  Lightbulb,
  Save,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { useCampus } from '@/src/app/CampusProviders';
import { getMissionById } from '@/src/data/missions';
import { MISSION_GUIDE_PROMPTS } from '@/src/data/dialogues';
import { getArtifactById, saveArtifact } from '@/src/services/storage';
import { speakSegments } from '@/src/services/speech';
import { composeArtifactPngDataUrl } from '@/src/utils/pngExport';
import type {
  DrawingDocument,
  MissionProgress,
  MissionSelections,
  MissionStageId,
  SavedArtifact,
  SelfEvaluationRecord,
} from '@/src/types/campus';
import { CampusTopBar } from '@/src/components/CampusTopBar';
import { GuideDialogueCard } from '@/src/features/guide/GuideDialogueCard';
import { DoorIllustrationSvg } from '@/src/components/svg/DoorIllustrationSvg';
import { CampusPortalGateSvg } from '@/src/components/svg/CampusPortalGateSvg';
import {
  DrawingCanvasStudio,
  createEmptyDrawing,
} from '@/src/features/drawing/DrawingCanvasStudio';

interface MissionRunnerViewProps {
  missionId: string;
}

function createEmptySelections(): MissionSelections {
  return {
    selectedDoorIds: [],
    inspectedCampusGate: false,
    observationNotes: {},
    matchedVocabularyIds: [],
    matchedExampleSentence: false,
    doorName: '',
    writtenText: '',
    usedEnglishWords: [],
  };
}

export function MissionRunnerView({ missionId }: MissionRunnerViewProps) {
  const { hydrated, state, activeGradeProfile, getMissionProgress } = useCampus();
  const mission = getMissionById(missionId);
  const effectiveGrade = state.selectedGrade ?? 2;
  const initialProgress = hydrated && mission ? getMissionProgress(mission.id, effectiveGrade) : null;

  return (
    <MissionRunnerInner
      key={`${missionId}-${effectiveGrade}-${hydrated ? 'ready' : 'init'}`}
      missionId={missionId}
      effectiveGrade={effectiveGrade}
      initialProgress={initialProgress}
      defaultHintTier={activeGradeProfile.alwaysShowHint ? 1 : 0}
    />
  );
}

function MissionRunnerInner({
  missionId,
  effectiveGrade,
  initialProgress,
  defaultHintTier,
}: {
  missionId: string;
  effectiveGrade: 2 | 3 | 4 | 5 | 6 | 7;
  initialProgress: MissionProgress | null;
  defaultHintTier: number;
}) {
  const navigate = useNavigate();
  const { activeGradeProfile, saveMissionProgress } = useCampus();

  const mission = getMissionById(missionId);
  const isPrimary = activeGradeProfile.tier === 'ilkokul';

  const [stage, setStage] = useState<MissionStageId>(
    () => initialProgress?.currentStage ?? 'kesfet',
  );
  const [completedStages, setCompletedStages] = useState<MissionStageId[]>(
    () => initialProgress?.completedStages ?? [],
  );
  const [selections, setSelections] = useState<MissionSelections>(
    () => initialProgress?.selections ?? createEmptySelections(),
  );
  const [drawing, setDrawing] = useState<DrawingDocument>(createEmptyDrawing);
  const [draftArtifactId, setDraftArtifactId] = useState<string | null>(
    () => initialProgress?.draftArtifactId ?? null,
  );
  const [selfEval, setSelfEval] = useState<SelfEvaluationRecord>(
    () => initialProgress?.selfEvaluation ?? { selectedOptionId: null, note: '' },
  );
  const [completed, setCompleted] = useState(() => initialProgress?.completed ?? false);

  // Etkileşim durumları
  const [inspectGateOpen, setInspectGateOpen] = useState(false);
  const [hintTierShown, setHintTierShown] = useState(defaultHintTier);
  const [vocabFeedback, setVocabFeedback] = useState<{ type: 'ok' | 'hint'; message: string } | null>(null);
  const [activeMatchWordId, setActiveMatchWordId] = useState<string | null>(null);
  const [hasUnsavedWork, setHasUnsavedWork] = useState(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);
  const [savedPngUrl, setSavedPngUrl] = useState<string | null>(null);
  const [exitPromptOpen, setExitPromptOpen] = useState(false);
  const [pendingExitUrl, setPendingExitUrl] = useState<string | null>(null);

  // IndexedDB'deki çizim taslağını asenkron geri yükle
  useEffect(() => {
    const artifactId = initialProgress?.draftArtifactId;
    if (!artifactId) return;
    let active = true;
    void getArtifactById(artifactId).then((artifact) => {
      if (active && artifact) {
        setDrawing(artifact.drawingData);
        setSavedPngUrl(artifact.pngDataUrl);
      }
    });
    return () => {
      active = false;
    };
  }, [initialProgress?.draftArtifactId]);

  const persistProgress = (overrides?: Partial<MissionProgress>) => {
    if (!mission) return;
    const nextProgress: MissionProgress = {
      missionId: mission.id,
      missionVersion: mission.version,
      grade: effectiveGrade,
      currentStage: overrides?.currentStage ?? stage,
      completedStages: overrides?.completedStages ?? completedStages,
      selections: overrides?.selections ?? selections,
      draftArtifactId: overrides?.draftArtifactId ?? draftArtifactId,
      selfEvaluation: overrides?.selfEvaluation ?? selfEval,
      completed: overrides?.completed ?? completed,
      updatedAt: new Date().toISOString(),
    };
    saveMissionProgress(nextProgress);
  };

  const handleSpeakEnglish = async (text: string) => {
    setSpeechNotice(null);
    const res = await speakSegments([{ text, lang: 'en-US' }]);
    if (!res.spoken && res.fallbackReason) {
      setSpeechNotice(res.fallbackReason);
    }
  };

  const handleSaveArtifactAndDraft = async (markMissionCompleted: boolean): Promise<SavedArtifact | null> => {
    if (!mission) return null;
    const artifactId = draftArtifactId ?? `art-${mission.id}-g${effectiveGrade}`;
    const pngDataUrl = composeArtifactPngDataUrl({
      missionTitle: mission.title,
      grade: effectiveGrade,
      doorName: selections.doorName || (isPrimary ? 'Kapı Hikâyem' : 'Özgün Kapı Tasarımım'),
      writtenText: selections.writtenText,
      usedEnglishWords: selections.usedEnglishWords,
      drawingData: drawing,
    });

    const now = new Date().toISOString();
    const artifact: SavedArtifact = {
      id: artifactId,
      missionId: mission.id,
      missionVersion: mission.version,
      grade: effectiveGrade,
      title: mission.title,
      doorName: selections.doorName || (isPrimary ? 'Kapı Hikâyem' : 'Özgün Kapı Tasarımım'),
      writtenText: selections.writtenText,
      selectedDoorIds: selections.selectedDoorIds,
      observations: selections.observationNotes,
      usedEnglishWords: selections.usedEnglishWords,
      drawingData: drawing,
      pngDataUrl,
      createdAt: now,
      updatedAt: now,
    };

    const status = await saveArtifact(artifact);
    setDraftArtifactId(artifactId);
    setSavedPngUrl(pngDataUrl);
    setHasUnsavedWork(false);

    const nextCompletedStages: MissionStageId[] = Array.from(
      new Set<MissionStageId>([
        ...completedStages,
        'uret',
        ...(markMissionCompleted ? (['paylas'] as MissionStageId[]) : []),
      ]),
    );
    setCompletedStages(nextCompletedStages);
    if (markMissionCompleted) setCompleted(true);

    persistProgress({
      draftArtifactId: artifactId,
      completedStages: nextCompletedStages,
      completed: markMissionCompleted || completed,
    });

    setStatusBanner(
      status.warningMessage ??
        'Çalışman cihazına kaydedildi. Dilersen PNG olarak da indirebilirsin.',
    );
    return artifact;
  };

  const handleDownloadPng = async () => {
    const artifact = await handleSaveArtifactAndDraft(true);
    const url = artifact?.pngDataUrl ?? savedPngUrl;
    if (!url) return;

    const link = document.createElement('a');
    link.href = url;
    const slug = (selections.doorName || 'kapi-calismam')
      .toLowerCase()
      .replace(/[^a-z0-9ğüşıöç\s-]/gi, '')
      .trim()
      .replace(/\s+/g, '-');
    link.download = `${slug || 'kapi-calismam'}-${effectiveGrade}-sinif.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBeforeNavigate = () => {
    if (!hasUnsavedWork) return true;
    setPendingExitUrl('/harita');
    setExitPromptOpen(true);
    return false;
  };

  const goToStage = (target: MissionStageId, markCurrentDone = false) => {
    const nextCompleted = markCurrentDone
      ? Array.from(new Set<MissionStageId>([...completedStages, stage]))
      : completedStages;
    setCompletedStages(nextCompleted);
    setStage(target);
    setStatusBanner(null);
    persistProgress({
      currentStage: target,
      completedStages: nextCompleted,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectedDoorCards = mission
    ? mission.contentRefs.ilkokulDoors.filter((d) =>
        selections.selectedDoorIds.includes(d.id),
      )
    : [];

  if (!mission) {
    return (
      <>
        <CampusTopBar />
        <main className="max-w-3xl mx-auto px-4 py-12 text-center space-y-4">
          <h1 className="text-2xl font-bold">Görev Bulunamadı</h1>
          <Link
            to="/harita"
            className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[var(--seljuk-teal)] text-white text-sm font-semibold inline-flex items-center gap-2"
          >
            Kampüs Haritasına Dön
          </Link>
        </main>
      </>
    );
  }

  if (mission.status === 'coming-soon') {
    return (
      <>
        <CampusTopBar />
        <main className="max-w-3xl mx-auto px-4 py-12 space-y-6">
          <div className="rounded-2xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-6 space-y-4">
            <p className="text-xs font-semibold text-[var(--sandstone-gold)]">Yakında</p>
            <h1 className="text-2xl font-bold text-[var(--campus-ink)]">{mission.title}</h1>
            <p className="text-sm text-[var(--campus-ink-muted)]">
              Bu görev içerik doğrulama sürecindedir ve sonraki sürümde açılacaktır. Şu anda
              &ldquo;Kapıların Anlattığı Hikâye&rdquo; görevini tamamlayabilirsin.
            </p>
            <Link
              to="/alan/gorev-panosu"
              className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[var(--seljuk-teal)] text-white text-sm font-semibold inline-flex items-center gap-2"
            >
              Görev Panosuna Dön
            </Link>
          </div>
        </main>
      </>
    );
  }

  const currentStageIndex = mission.steps.findIndex((s) => s.id === stage);
  const progressPercent = Math.round((completedStages.length / mission.steps.length) * 100);
  const hasAnyProduction =
    drawing.strokes.length > 0 ||
    drawing.shapes.length > 0 ||
    selections.writtenText.trim().length > 0 ||
    selections.doorName.trim().length > 0;

  return (
    <>
      <CampusTopBar onBeforeNavigate={handleBeforeNavigate} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Görev Üst Başlığı ve Bütünleşik Alan Bağlantısı */}
        <section className="rounded-2xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--campus-ink-muted)]">
                <span className="font-semibold text-[var(--seljuk-teal)] tabular-nums">
                  {activeGradeProfile.label}
                </span>
                <span aria-hidden="true">·</span>
                <span>{isPrimary ? 'İlkokul Yolculuğu' : 'Ortaokul Yolculuğu'}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">Geçilen aşama: %{progressPercent}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--campus-ink)] mt-0.5">
                {mission.title}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  void handleSaveArtifactAndDraft(false);
                }}
                className="min-h-[44px] px-4 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--campus-canvas)] hover:bg-[var(--campus-surface-muted)] text-xs font-semibold text-[var(--campus-ink)] inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4 text-[var(--seljuk-teal)]" aria-hidden="true" />
                <span>Taslağı Kaydet</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (hasUnsavedWork) {
                    setPendingExitUrl('/harita');
                    setExitPromptOpen(true);
                  } else {
                    navigate('/harita');
                  }
                }}
                className="min-h-[44px] px-4 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--campus-surface)] hover:bg-[var(--campus-surface-muted)] text-xs font-semibold text-[var(--campus-ink)] cursor-pointer"
              >
                Güvenle Haritaya Dön
              </button>
            </div>
          </div>

          {/* 4 Aşamalı İlerleme Göstergesi (KEŞFET → ÖĞREN → ÜRET → PAYLAŞ) */}
          <nav aria-label="Görev aşamaları" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {mission.steps.map((step, index) => {
              const isCurrent = step.id === stage;
              const isDone = completedStages.includes(step.id);
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => goToStage(step.id)}
                  className={`min-h-[54px] px-3 py-2 rounded-xl border text-left transition-colors cursor-pointer ${
                    isCurrent
                      ? 'border-[var(--seljuk-teal)] bg-[var(--seljuk-teal-soft)]'
                      : isDone
                        ? 'border-[var(--courtyard-sage)]/40 bg-[var(--courtyard-sage-soft)]/50'
                        : 'border-[var(--campus-border)] bg-[var(--campus-canvas)] hover:bg-[var(--campus-surface-muted)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 text-xs">
                    <span className="font-bold text-[var(--campus-ink)] tabular-nums">
                      {index + 1}. {step.title}
                    </span>
                    {isDone && (
                      <CheckCircle2 className="w-4 h-4 text-[var(--courtyard-sage)] shrink-0" aria-hidden="true" />
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--campus-ink-muted)] truncate mt-0.5">
                    {step.areaLabel}
                  </p>
                </button>
              );
            })}
          </nav>

          {statusBanner && (
            <div
              role="status"
              className="rounded-lg bg-[var(--courtyard-sage-soft)] border border-[var(--courtyard-sage)]/30 px-4 py-2.5 text-xs sm:text-sm font-medium text-[var(--campus-ink)]"
            >
              {statusBanner}
            </div>
          )}
        </section>

        {/* ==================== 1. AŞAMA: KEŞFET ==================== */}
        {stage === 'kesfet' && (
          <div className="space-y-6">
            <GuideDialogueCard
              dialogue={
                isPrimary
                  ? MISSION_GUIDE_PROMPTS.ilkokulKesfet
                  : MISSION_GUIDE_PROMPTS.ortaokulKesfet
              }
              mood="thinking"
            />

            {isPrimary ? (
              <section className="rounded-2xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-5 sm:p-6 space-y-6">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-[var(--sandstone-gold)]">
                    Gezi ve Keşif Bağlantısı
                  </p>
                  <h2 className="text-lg font-bold text-[var(--campus-ink)]">
                    Gördüğün Kapıları Seç
                  </h2>
                  <p className="text-sm text-[var(--campus-ink-muted)]">
                    {activeGradeProfile.grade === 2
                      ? 'Tanıdığın kapılara dokun.'
                      : 'Daha önce gördüğün kapıları seç; seçimin sonraki adımlarda kullanılacak.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {mission.contentRefs.ilkokulDoors.map((door) => {
                    const selected = selections.selectedDoorIds.includes(door.id);
                    return (
                      <button
                        key={door.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => {
                          setSelections((prev) => {
                            const exists = prev.selectedDoorIds.includes(door.id);
                            return {
                              ...prev,
                              selectedDoorIds: exists
                                ? prev.selectedDoorIds.filter((id) => id !== door.id)
                                : [...prev.selectedDoorIds, door.id],
                            };
                          });
                        }}
                        className={`rounded-xl border p-3 text-left transition-colors cursor-pointer flex flex-col gap-2.5 ${
                          selected
                            ? 'border-[var(--seljuk-teal)] bg-[var(--seljuk-teal-soft)] ring-2 ring-[var(--seljuk-teal)]/30'
                            : 'border-[var(--campus-border)] bg-[var(--campus-canvas)] hover:bg-[var(--campus-surface-muted)]'
                        }`}
                      >
                        <DoorIllustrationSvg variant={door.illustration} title={door.title} />
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-[var(--campus-ink)]">
                              {door.title}
                            </span>
                            {selected && (
                              <CheckCircle2 className="w-4 h-4 text-[var(--seljuk-teal)] shrink-0" aria-hidden="true" />
                            )}
                          </div>
                          <p className="text-xs text-[var(--campus-ink-muted)]">
                            {door.shortDescription}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Kampüs Kapısını Yeniden İnceleme */}
                <div className="rounded-xl bg-[var(--campus-canvas)] border border-[var(--campus-border)] p-4 sm:p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-[var(--campus-ink)]">
                        Kampüs Kapısını Yeniden İncele
                      </h3>
                      <p className="text-xs text-[var(--campus-ink-muted)]">
                        Taş kemerine ve yıldız desenlerine yakından bak.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setInspectGateOpen((v) => !v);
                        setSelections((prev) => ({ ...prev, inspectedCampusGate: true }));
                      }}
                      className="min-h-[44px] px-4 py-2 rounded-lg bg-[var(--campus-surface)] border border-[var(--campus-border)] hover:border-[var(--seljuk-teal)] text-xs font-semibold text-[var(--campus-ink)] inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-[var(--seljuk-teal)]" aria-hidden="true" />
                      <span>{inspectGateOpen ? 'Kapıyı Kapat' : 'Kapıyı Açıp Bak'}</span>
                    </button>
                  </div>
                  <CampusPortalGateSvg isOpen={inspectGateOpen} compact />
                </div>
              </section>
            ) : (
              /* ORTAOKUL KEŞFET: Karşılaştırma ve 4 Gözlem Boyutu */
              <section className="rounded-2xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-5 sm:p-6 space-y-6">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-[var(--sandstone-gold)]">
                    Gezi ve Keşif · Karşılaştırmalı Gözlem
                  </p>
                  <h2 className="text-lg font-bold text-[var(--campus-ink)]">
                    Günlük Kapılar ile Kampüs Kapısını Karşılaştır
                  </h2>
                  <p className="text-sm text-[var(--campus-ink-muted)]">
                    İki görseli incele ve aşağıdaki dört gözlem alanında dikkatini çeken özellikleri seç.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[var(--campus-border)] bg-[var(--campus-canvas)] p-4 space-y-2">
                    <p className="text-xs font-semibold text-[var(--campus-ink-muted)]">
                      Günlük Yaşam Kapısı (Okul / Ev)
                    </p>
                    <DoorIllustrationSvg variant="okul" title="Günlük okul kapısı" className="w-full h-44" />
                    <p className="text-xs text-[var(--campus-ink-muted)]">
                      Düz hatlar, sade yüzey, cam ve metal çerçeve ile hızlı giriş-çıkışa odaklı yapı.
                    </p>
                  </div>

                  <div className="rounded-xl border border-[var(--campus-border)] bg-[var(--campus-canvas)] p-4 space-y-2">
                    <p className="text-xs font-semibold text-[var(--sandstone-gold)]">
                      Anadolu Esintili Kampüs Kapısı
                    </p>
                    <CampusPortalGateSvg isOpen={inspectGateOpen} compact />
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <p className="text-xs text-[var(--campus-ink-muted)]">
                        Taş kemer, ahşap kanatlar ve sekiz köşeli geometrik motifli dış çerçeve.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setInspectGateOpen((v) => !v);
                          setSelections((prev) => ({ ...prev, inspectedCampusGate: true }));
                        }}
                        className="min-h-[40px] px-3 py-1 rounded-lg border border-[var(--campus-border)] bg-white text-xs font-semibold shrink-0 cursor-pointer"
                      >
                        {inspectGateOpen ? 'Kapat' : 'Aralayıp Bak'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mission.contentRefs.ortaokulDimensions.map((dim) => {
                    const currentChoice = selections.observationNotes[dim.id] ?? '';
                    return (
                      <div
                        key={dim.id}
                        className="rounded-xl border border-[var(--campus-border)] bg-[var(--campus-canvas)] p-4 space-y-2.5"
                      >
                        <h3 className="text-sm font-bold text-[var(--campus-ink)]">{dim.title}</h3>
                        <p className="text-xs text-[var(--campus-ink-muted)]">{dim.prompt}</p>
                        <div className="space-y-1.5">
                          {dim.choices.map((choice) => {
                            const selected = currentChoice === choice;
                            return (
                              <button
                                key={choice}
                                type="button"
                                aria-pressed={selected}
                                onClick={() =>
                                  setSelections((prev) => ({
                                    ...prev,
                                    observationNotes: {
                                      ...prev.observationNotes,
                                      [dim.id]: choice,
                                    },
                                  }))
                                }
                                className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                                  selected
                                    ? 'border-[var(--seljuk-teal)] bg-[var(--seljuk-teal-soft)] font-semibold text-[var(--campus-ink)]'
                                    : 'border-[var(--campus-border)] bg-[var(--campus-surface)] text-[var(--campus-ink)] hover:bg-[var(--campus-surface-muted)]'
                                }`}
                              >
                                {choice}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => goToStage('ogren', true)}
                className="min-h-[44px] px-6 py-2.5 rounded-lg bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal-hover)] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Öğren Aşamasına Geç (İngilizce Dünyası)</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* ==================== 2. AŞAMA: ÖĞREN ==================== */}
        {stage === 'ogren' && (
          <div className="space-y-6">
            <section className="rounded-2xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-5 sm:p-6 space-y-5">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-[var(--seljuk-teal)]">
                  İngilizce Dünyası Bağlantısı
                </p>
                <h2 className="text-xl font-bold text-[var(--campus-ink)]">
                  {isPrimary
                    ? 'Yeni Kelimemiz: Door — Kapı'
                    : 'Kapı ve Malzeme Kelimelerini Keşfet'}
                </h2>
                <p className="text-sm text-[var(--campus-ink-muted)]">
                  {isPrimary
                    ? 'Görsele bak, kelimeyi dinle ve doğru eşleştirmeyi bul.'
                    : 'Her kelimenin okunuşunu dinleyebilir, ardından eşleştirme etkinliğini tamamlayabilirsin.'}
                </p>
              </div>

              {speechNotice && (
                <p role="status" className="text-xs font-medium text-[var(--sandstone-gold)]">
                  {speechNotice}
                </p>
              )}

              {selectedDoorCards.length > 0 && isPrimary && (
                <div className="rounded-xl bg-[var(--campus-canvas)] border border-[var(--campus-border)] p-3.5 text-xs text-[var(--campus-ink-muted)]">
                  Keşfet adımında seçtiğin kapılar:{' '}
                  <strong className="text-[var(--campus-ink)]">
                    {selectedDoorCards.map((d) => d.title).join(', ')}
                  </strong>
                  . Şimdi İngilizcede kapıya ne dendiğini öğrenelim.
                </div>
              )}

              {isPrimary ? (
                /* İLKOKUL ÖĞREN: Door — Kapı + Basit Görsel Eşleştirme */
                <div className="space-y-6">
                  <div className="rounded-xl border border-[var(--seljuk-teal)]/30 bg-[var(--seljuk-teal-soft)]/50 p-5 flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-44 shrink-0">
                      <DoorIllustrationSvg
                        variant={selectedDoorCards[0]?.illustration ?? 'ev'}
                        title="Door — Kapı"
                        className="w-full h-36"
                      />
                    </div>
                    <div className="space-y-3 text-center sm:text-left">
                      <div>
                        <p className="text-3xl font-bold text-[var(--campus-ink)]">Door</p>
                        <p className="text-lg font-semibold text-[var(--seljuk-teal)]">Kapı</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleSpeakEnglish('Door')}
                        className="min-h-[44px] px-4 py-2 rounded-lg bg-[var(--seljuk-teal)] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Volume2 className="w-4 h-4" aria-hidden="true" />
                        <span>İngilizce Dinle (Door)</span>
                      </button>
                    </div>
                  </div>

                  {/* Görsel Eşleştirme */}
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-[var(--campus-ink)]">
                      Eşleştirme: Hangisi &ldquo;Door&rdquo; kelimesini gösterir?
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'match-door', label: 'Kapı', isCorrect: true, desc: 'İçeri girdiğimiz kapı' },
                        { id: 'match-window', label: 'Pencere', isCorrect: false, desc: 'Dışarıya baktığımız cam açıklık' },
                        { id: 'match-tree', label: 'Ağaç', isCorrect: false, desc: 'Avludaki yeşil bitki' },
                      ].map((opt) => {
                        const matched =
                          opt.isCorrect && selections.matchedVocabularyIds.includes('vocab-door');
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              if (opt.isCorrect) {
                                setSelections((prev) => ({
                                  ...prev,
                                  matchedVocabularyIds: ['vocab-door'],
                                }));
                                setVocabFeedback({
                                  type: 'ok',
                                  message: 'Harika! Door kelimesi Kapı anlamına gelir.',
                                });
                              } else {
                                setVocabFeedback({
                                  type: 'hint',
                                  message:
                                    'İpucu: "Door", bir eve veya okula girerken açtığımız kapıdır. Tekrar deneyebilirsin.',
                                });
                              }
                            }}
                            className={`min-h-[72px] p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                              matched
                                ? 'border-[var(--courtyard-sage)] bg-[var(--courtyard-sage-soft)]'
                                : 'border-[var(--campus-border)] bg-[var(--campus-canvas)] hover:bg-[var(--campus-surface-muted)]'
                            }`}
                          >
                            <p className="text-base font-bold text-[var(--campus-ink)]">{opt.label}</p>
                            <p className="text-xs text-[var(--campus-ink-muted)] mt-0.5">{opt.desc}</p>
                          </button>
                        );
                      })}
                    </div>

                    {vocabFeedback && (
                      <div
                        role="status"
                        className={`rounded-lg p-3 text-sm font-medium ${
                          vocabFeedback.type === 'ok'
                            ? 'bg-[var(--courtyard-sage-soft)] text-[var(--campus-ink)]'
                            : 'bg-[var(--sandstone-gold-soft)] text-[var(--campus-ink)]'
                        }`}
                      >
                        {vocabFeedback.message}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* ORTAOKUL ÖĞREN: 5 Kelime + Door/Gate Karşılaştırması + Örnek Cümle */
                <div className="space-y-6">
                  {/* Door vs Gate Görsel Karşılaştırma */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-[var(--campus-border)] bg-[var(--campus-canvas)] p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-bold text-[var(--campus-ink)]">Door — Kapı</p>
                          <p className="text-xs text-[var(--campus-ink-muted)]">
                            Genellikle oda veya bina girişindeki kapı
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleSpeakEnglish('Door')}
                          aria-label="Door kelimesini dinle"
                          className="min-h-[44px] min-w-[44px] rounded-lg border border-[var(--campus-border)] bg-white flex items-center justify-center cursor-pointer"
                        >
                          <Volume2 className="w-4 h-4 text-[var(--seljuk-teal)]" aria-hidden="true" />
                        </button>
                      </div>
                      <DoorIllustrationSvg variant="indoor-door" title="Door — İç mekân kapısı" className="w-full h-36" />
                    </div>

                    <div className="rounded-xl border border-[var(--campus-border)] bg-[var(--campus-canvas)] p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-bold text-[var(--campus-ink)]">
                            Gate — Giriş kapısı / Büyük kapı
                          </p>
                          <p className="text-xs text-[var(--campus-ink-muted)]">
                            Avlu, bahçe veya geniş yerleşkeye açılan büyük kapı
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleSpeakEnglish('Gate')}
                          aria-label="Gate kelimesini dinle"
                          className="min-h-[44px] min-w-[44px] rounded-lg border border-[var(--campus-border)] bg-white flex items-center justify-center cursor-pointer"
                        >
                          <Volume2 className="w-4 h-4 text-[var(--seljuk-teal)]" aria-hidden="true" />
                        </button>
                      </div>
                      <DoorIllustrationSvg variant="courtyard-gate" title="Gate — Büyük avlu giriş kapısı" className="w-full h-36" />
                    </div>
                  </div>

                  {/* 5 Kelime Kartları */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {mission.contentRefs.ortaokulVocabulary.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-[var(--campus-border)] bg-[var(--campus-canvas)] p-3.5 flex flex-col justify-between gap-2"
                      >
                        <div>
                          <p className="text-base font-bold text-[var(--campus-ink)]">{item.word}</p>
                          <p className="text-xs font-medium text-[var(--seljuk-teal)]">
                            {item.turkishMeaning}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleSpeakEnglish(item.word)}
                          className="min-h-[40px] px-2.5 py-1 rounded-lg border border-[var(--campus-border)] bg-white hover:bg-[var(--campus-surface-muted)] text-xs font-semibold text-[var(--campus-ink)] inline-flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-[var(--seljuk-teal)]" aria-hidden="true" />
                          <span>Dinle</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Örnek Cümle */}
                  <div className="rounded-xl border border-[var(--seljuk-teal)]/30 bg-[var(--seljuk-teal-soft)]/50 p-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-[var(--seljuk-teal)]">Örnek Cümle</p>
                      <p className="text-base font-bold text-[var(--campus-ink)]">
                        &ldquo;{mission.contentRefs.ortaokulExampleSentence.english}&rdquo;
                      </p>
                      <p className="text-xs text-[var(--campus-ink-muted)]">
                        {mission.contentRefs.ortaokulExampleSentence.turkish}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        void handleSpeakEnglish(mission.contentRefs.ortaokulExampleSentence.english)
                      }
                      className="min-h-[44px] px-4 py-2 rounded-lg bg-[var(--seljuk-teal)] text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" aria-hidden="true" />
                      <span>Cümleyi Dinle</span>
                    </button>
                  </div>

                  {/* Etkileşimli Kelime Eşleştirme */}
                  <div className="rounded-xl border border-[var(--campus-border)] bg-[var(--campus-canvas)] p-4 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-[var(--campus-ink)]">
                        Kelime Eşleştirme ({selections.matchedVocabularyIds.length} / 5)
                      </h3>
                      <p className="text-xs text-[var(--campus-ink-muted)]">
                        Önce bir İngilizce kelime seç, sonra Türkçe karşılığına dokun.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        {mission.contentRefs.ortaokulVocabulary.map((item) => {
                          const matched = selections.matchedVocabularyIds.includes(item.id);
                          const selected = activeMatchWordId === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              disabled={matched}
                              onClick={() => {
                                setActiveMatchWordId(item.id);
                                setVocabFeedback(null);
                              }}
                              className={`w-full min-h-[44px] px-3.5 py-2 rounded-lg border text-left text-sm font-semibold flex items-center justify-between cursor-pointer ${
                                matched
                                  ? 'border-[var(--courtyard-sage)] bg-[var(--courtyard-sage-soft)] text-[var(--campus-ink)]'
                                  : selected
                                    ? 'border-[var(--seljuk-teal)] bg-[var(--seljuk-teal-soft)] text-[var(--campus-ink)]'
                                    : 'border-[var(--campus-border)] bg-white text-[var(--campus-ink)]'
                              }`}
                            >
                              <span>{item.word}</span>
                              {matched && <CheckCircle2 className="w-4 h-4 text-[var(--courtyard-sage)]" aria-hidden="true" />}
                            </button>
                          );
                        })}
                      </div>

                      <div className="space-y-2">
                        {[
                          mission.contentRefs.ortaokulVocabulary[2],
                          mission.contentRefs.ortaokulVocabulary[0],
                          mission.contentRefs.ortaokulVocabulary[4],
                          mission.contentRefs.ortaokulVocabulary[1],
                          mission.contentRefs.ortaokulVocabulary[3],
                        ].map((target) => {
                          const matched = selections.matchedVocabularyIds.includes(target.id);
                          return (
                            <button
                              key={`tr-${target.id}`}
                              type="button"
                              disabled={matched || !activeMatchWordId}
                              onClick={() => {
                                if (!activeMatchWordId) return;
                                if (activeMatchWordId === target.id) {
                                  setSelections((prev) => ({
                                    ...prev,
                                    matchedVocabularyIds: Array.from(
                                      new Set([...prev.matchedVocabularyIds, target.id]),
                                    ),
                                  }));
                                  setActiveMatchWordId(null);
                                  setVocabFeedback({
                                    type: 'ok',
                                    message: `Doğru eşleşme: ${target.word} — ${target.turkishMeaning}`,
                                  });
                                } else {
                                  setVocabFeedback({
                                    type: 'hint',
                                    message:
                                      'Bu eşleşme farklı görünüyor. Yukarıdaki kelime kartlarına bakıp yeniden deneyebilirsin.',
                                  });
                                }
                              }}
                              className={`w-full min-h-[44px] px-3.5 py-2 rounded-lg border text-left text-sm cursor-pointer ${
                                matched
                                  ? 'border-[var(--courtyard-sage)] bg-[var(--courtyard-sage-soft)] font-semibold'
                                  : 'border-[var(--campus-border)] bg-white hover:bg-[var(--campus-surface-muted)] disabled:opacity-60'
                              }`}
                            >
                              {target.turkishMeaning}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {vocabFeedback && (
                      <div
                        role="status"
                        className={`rounded-lg p-3 text-xs sm:text-sm font-medium ${
                          vocabFeedback.type === 'ok'
                            ? 'bg-[var(--courtyard-sage-soft)] text-[var(--campus-ink)]'
                            : 'bg-[var(--sandstone-gold-soft)] text-[var(--campus-ink)]'
                        }`}
                      >
                        {vocabFeedback.message}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => goToStage('kesfet')}
                className="min-h-[44px] px-4 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--campus-surface)] text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Önceki Adım (Keşfet)</span>
              </button>

              <button
                type="button"
                onClick={() => goToStage('uret', true)}
                className="min-h-[44px] px-6 py-2.5 rounded-lg bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal-hover)] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Üret Aşamasına Geç (Kitap ve Hikâye Dünyası)</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* ==================== 3. AŞAMA: ÜRET ==================== */}
        {stage === 'uret' && (
          <div className="space-y-6">
            {isPrimary && (
              <GuideDialogueCard dialogue={MISSION_GUIDE_PROMPTS.ilkokulUret} mood="welcoming" />
            )}

            <section className="rounded-2xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-5 sm:p-6 space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-[var(--courtyard-sage)]">
                    Kitap ve Hikâye Dünyası Bağlantısı
                  </p>
                  <h2 className="text-xl font-bold text-[var(--campus-ink)]">
                    {isPrimary ? 'Kendi Kapını ve Hikâyeni Oluştur' : 'Özgün Kapını Tasarla ve Gerekçelendir'}
                  </h2>
                  <p className="text-sm text-[var(--campus-ink-muted)]">
                    {isPrimary
                      ? `Üretim seçeneklerin (${activeGradeProfile.label}): ${activeGradeProfile.productionOptions.join(', ')}.`
                      : `Yazma beklentisi (${activeGradeProfile.label}): ${activeGradeProfile.writingExpectation}.`}
                  </p>
                </div>

                {/* Sınıf Düzeyine Göre Kademeli İpucu Düğmesi */}
                {!activeGradeProfile.alwaysShowHint && activeGradeProfile.maxHintTiers > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setHintTierShown((prev) =>
                        prev < activeGradeProfile.maxHintTiers ? prev + 1 : 0,
                      )
                    }
                    className="min-h-[44px] px-3.5 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--campus-canvas)] text-xs font-semibold text-[var(--campus-ink)] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-[var(--sandstone-gold)]" aria-hidden="true" />
                    <span>
                      {hintTierShown > 0 ? 'İpucunu Gizle' : 'İpucu Göster'}
                    </span>
                  </button>
                )}
              </div>

              {/* İpucu Kutusu */}
              {(activeGradeProfile.alwaysShowHint || hintTierShown > 0) && (
                <div className="rounded-xl bg-[var(--sandstone-gold-soft)]/70 border border-[var(--sandstone-gold)]/30 p-3.5 flex items-start gap-2.5 text-xs sm:text-sm text-[var(--campus-ink)]">
                  <Lightbulb className="w-4 h-4 text-[var(--sandstone-gold)] shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="space-y-1">
                    {isPrimary ? (
                      <p>
                        İstersen önce &ldquo;Hazır Şekil Ekle&rdquo; düğmeleriyle bir kemer ve kapı kanadı
                        ekle, sonra serbest fırçayla kapının ardında gördüklerini çiz.
                      </p>
                    ) : (
                      <p>
                        Tasarıma bir isim ver. Açıklamanda malzeme (wood/stone), biçim veya desen
                        (pattern) tercihini neden seçtiğini yazabilirsin.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Keşfet Adımından Taşınan Seçimler */}
              {(selectedDoorCards.length > 0 || Object.keys(selections.observationNotes).length > 0) && (
                <div className="rounded-xl bg-[var(--campus-canvas)] border border-[var(--campus-border)] p-3.5 text-xs text-[var(--campus-ink-muted)] space-y-1">
                  <p className="font-semibold text-[var(--campus-ink)]">
                    Önceki Adımdan Taşınan İlham Notların:
                  </p>
                  {selectedDoorCards.length > 0 && (
                    <p>Seçtiğin kapılar: {selectedDoorCards.map((d) => d.title).join(', ')}</p>
                  )}
                  {Object.entries(selections.observationNotes).map(([k, val]) => (
                    <p key={k}>• {val}</p>
                  ))}
                </div>
              )}

              {/* Çizim ve Hazır Şekil Stüdyosu */}
              <DrawingCanvasStudio
                value={drawing}
                onChange={(nextDoc) => {
                  setDrawing(nextDoc);
                  setHasUnsavedWork(true);
                }}
              />

              {/* Kapı İsmi ve Yazma Alanı */}
              <div className="grid grid-cols-1 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label htmlFor="door-name-input" className="block text-sm font-semibold text-[var(--campus-ink)]">
                    {isPrimary ? 'Kapına veya Çalışmana Kısa Bir Ad Ver (İsteğe Bağlı)' : 'Tasarladığın Kapının Adı'}
                  </label>
                  <input
                    id="door-name-input"
                    type="text"
                    value={selections.doorName}
                    onChange={(e) => {
                      setSelections((prev) => ({ ...prev, doorName: e.target.value }));
                      setHasUnsavedWork(true);
                    }}
                    placeholder={isPrimary ? 'Örneğin: Bahçe Kapısı' : 'Örneğin: Yıldızlı Avlu Kapısı'}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--campus-canvas)] text-sm text-[var(--campus-ink)]"
                  />
                </div>

                {/* Cümle Başlangıçları (Yalnızca gradeProfile izin veriyorsa) */}
                {activeGradeProfile.allowsSentenceStarters &&
                  mission.contentRefs.sentenceStartersByGrade[effectiveGrade] && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-[var(--campus-ink-muted)]">
                        İstersen bir başlangıç cümlesine dokunarak ekle:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {mission.contentRefs.sentenceStartersByGrade[effectiveGrade]?.map((starter) => (
                          <button
                            key={starter}
                            type="button"
                            onClick={() => {
                              setSelections((prev) => ({
                                ...prev,
                                writtenText: prev.writtenText
                                  ? `${prev.writtenText.trim()} ${starter}`
                                  : starter,
                              }));
                              setHasUnsavedWork(true);
                            }}
                            className="min-h-[40px] px-3 py-1.5 rounded-lg border border-[var(--campus-border)] bg-[var(--campus-canvas)] hover:border-[var(--seljuk-teal)] text-xs text-[var(--campus-ink)] cursor-pointer"
                          >
                            + {starter}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Ortaokul için öğrenilen İngilizce kelimelerden ekleme */}
                {activeGradeProfile.allowsOptionalEnglishInText && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-[var(--campus-ink-muted)]">
                      İstersen öğrendiğin İngilizce kelimeleri çalışmana ekle:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {mission.contentRefs.ortaokulVocabulary.map((vocab) => {
                        const used = selections.usedEnglishWords.includes(vocab.word);
                        return (
                          <button
                            key={vocab.id}
                            type="button"
                            aria-pressed={used}
                            onClick={() => {
                              setSelections((prev) => {
                                const exists = prev.usedEnglishWords.includes(vocab.word);
                                return {
                                  ...prev,
                                  usedEnglishWords: exists
                                    ? prev.usedEnglishWords.filter((w) => w !== vocab.word)
                                    : [...prev.usedEnglishWords, vocab.word],
                                };
                              });
                              setHasUnsavedWork(true);
                            }}
                            className={`min-h-[40px] px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                              used
                                ? 'border-[var(--seljuk-teal)] bg-[var(--seljuk-teal-soft)] text-[var(--campus-ink)]'
                                : 'border-[var(--campus-border)] bg-[var(--campus-canvas)] text-[var(--campus-ink)]'
                            }`}
                          >
                            {vocab.word} ({vocab.turkishMeaning})
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="written-text-input" className="block text-sm font-semibold text-[var(--campus-ink)]">
                    {effectiveGrade === 2
                      ? 'İstersen bir kelime yaz (çizim ve şekil tek başına yeterlidir)'
                      : isPrimary
                        ? 'Kapıdan geçince ne gördüğünü kısaca yaz'
                        : 'Kapı Tasarımını ve Seçim Gerekçeni Açıkla'}
                  </label>
                  <textarea
                    id="written-text-input"
                    rows={isPrimary ? 3 : 5}
                    value={selections.writtenText}
                    onChange={(e) => {
                      setSelections((prev) => ({ ...prev, writtenText: e.target.value }));
                      setHasUnsavedWork(true);
                    }}
                    placeholder={
                      effectiveGrade === 2
                        ? 'Örneğin: Bahçe, Ağaç, Door...'
                        : isPrimary
                          ? 'Kapıdan geçince yeşil bir avlu gördüm...'
                          : 'Bu kapıyı tasarlarken ahşap ve taş dokuyu birlikte kullandım çünkü...'
                    }
                    className="w-full p-3.5 rounded-lg border border-[var(--campus-border)] bg-[var(--campus-canvas)] text-sm text-[var(--campus-ink)]"
                  />
                </div>
              </div>
            </section>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => goToStage('ogren')}
                className="min-h-[44px] px-4 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--campus-surface)] text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Önceki Adım (Öğren)</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  await handleSaveArtifactAndDraft(false);
                  goToStage('paylas', true);
                }}
                className="min-h-[44px] px-6 py-2.5 rounded-lg bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal-hover)] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Kaydet ve Paylaş Adımına Geç</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* ==================== 4. AŞAMA: PAYLAŞ ==================== */}
        {stage === 'paylas' && (
          <div className="space-y-6">
            <section className="rounded-2xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-5 sm:p-6 space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-[var(--courtyard-sage)]">
                    Paylaşım ve Cihaza Kaydetme
                  </p>
                  <h2 className="text-xl font-bold text-[var(--campus-ink)]">
                    Çalışman Hazır!
                  </h2>
                  <p className="text-sm text-[var(--campus-ink-muted)]">
                    Bu kampüste çalışmalar herkese açık paylaşılmaz; yalnızca cihazına kaydedebilir ve
                    istersen ailene gösterebilirsin.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void handleSaveArtifactAndDraft(true)}
                    className="min-h-[44px] px-4 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--campus-canvas)] hover:bg-[var(--campus-surface-muted)] text-sm font-semibold text-[var(--campus-ink)] inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-[var(--seljuk-teal)]" aria-hidden="true" />
                    <span>Cihaza Kaydet</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleDownloadPng()}
                    className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal-hover)] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" aria-hidden="true" />
                    <span>Tek PNG Olarak İndir</span>
                  </button>
                </div>
              </div>

              {!hasAnyProduction && (
                <div className="rounded-lg bg-[var(--sandstone-gold-soft)] p-3 text-xs sm:text-sm text-[var(--campus-ink)]">
                  Henüz bir çizim veya metin eklemedin. Önceki adıma dönüp çizim veya yazı ekleyebilirsin.
                </div>
              )}

              {/* PNG Ön İzleme */}
              {savedPngUrl && (
                <div className="rounded-xl border border-[var(--campus-border)] bg-[var(--campus-canvas)] p-4 space-y-2">
                  <p className="text-xs font-semibold text-[var(--campus-ink-muted)]">
                    Dışa Aktarılacak PNG Ön İzlemesi (Çizim + Başlık + Metin Birlikte)
                  </p>
                  <img
                    src={savedPngUrl}
                    alt={`${selections.doorName || 'Kapı çalışması'} PNG ön izlemesi`}
                    className="w-full max-w-2xl mx-auto rounded-lg border border-[var(--campus-border)]"
                  />
                </div>
              )}

              {/* Yaşa Uygun İsteğe Bağlı Öz Değerlendirme */}
              <div className="rounded-xl border border-[var(--campus-border)] bg-[var(--campus-canvas)] p-4 sm:p-5 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-[var(--campus-ink)]">
                    Kısa Öz Değerlendirme (İsteğe Bağlı)
                  </h3>
                  <p className="text-xs text-[var(--campus-ink-muted)]">
                    Burada doğru veya yanlış cevap yoktur; kendi öğrenme deneyimini işaretleyebilirsin.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {mission.selfEvaluation.options.map((opt) => {
                    const selected = selfEval.selectedOptionId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => {
                          const nextEval: SelfEvaluationRecord = { ...selfEval, selectedOptionId: opt.id };
                          setSelfEval(nextEval);
                          persistProgress({
                            selfEvaluation: nextEval,
                            completed: true,
                            completedStages: Array.from(new Set([...completedStages, 'paylas'])),
                          });
                        }}
                        className={`min-h-[60px] p-3.5 rounded-xl border text-left transition-colors cursor-pointer flex items-center gap-3 ${
                          selected
                            ? 'border-[var(--seljuk-teal)] bg-[var(--seljuk-teal-soft)] font-semibold'
                            : 'border-[var(--campus-border)] bg-[var(--campus-surface)] hover:bg-[var(--campus-surface-muted)]'
                        }`}
                      >
                        <Sparkles className="w-4 h-4 text-[var(--seljuk-teal)] shrink-0" aria-hidden="true" />
                        <span className="text-xs sm:text-sm text-[var(--campus-ink)]">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>

                {(activeGradeProfile.selfEvaluationStyle === 'statements-with-note' ||
                  activeGradeProfile.selfEvaluationStyle === 'statements-with-justified-note') && (
                  <div className="space-y-1.5">
                    <label htmlFor="self-eval-note" className="block text-xs font-semibold text-[var(--campus-ink)]">
                      {activeGradeProfile.selfEvaluationStyle === 'statements-with-justified-note'
                        ? 'Kısa Gerekçeli Notun (İsteğe Bağlı)'
                        : 'Kısa Notun (İsteğe Bağlı)'}
                    </label>
                    <textarea
                      id="self-eval-note"
                      rows={2}
                      value={selfEval.note}
                      onChange={(e) => {
                        const nextEval: SelfEvaluationRecord = { ...selfEval, note: e.target.value };
                        setSelfEval(nextEval);
                        persistProgress({ selfEvaluation: nextEval });
                      }}
                      placeholder="Bugünkü çalışmanda en çok dikkatini çeken şey neydi?"
                      className="w-full p-3 rounded-lg border border-[var(--campus-border)] bg-[var(--campus-surface)] text-sm text-[var(--campus-ink)]"
                    />
                  </div>
                )}
              </div>
            </section>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => goToStage('uret')}
                className="min-h-[44px] px-4 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--campus-surface)] text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Önceki Adım (Üret)</span>
              </button>

              <Link
                to="/yolculugum"
                onClick={() => {
                  persistProgress({
                    completed: true,
                    completedStages: Array.from(new Set([...completedStages, 'paylas'])),
                  });
                }}
                className="min-h-[44px] px-6 py-2.5 rounded-lg bg-[var(--courtyard-sage)] hover:opacity-90 text-white text-sm font-semibold inline-flex items-center gap-2"
              >
                <span>Kampüs Yolculuğumda Gör</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}

        {/* Aşama Altı Bilgi Satırı */}
        <p className="text-xs text-[var(--campus-ink-muted)] text-center tabular-nums">
          Adım {currentStageIndex + 1} / {mission.steps.length} · İçerik sürümü {mission.contentVersion}
        </p>
      </main>

      {/* Kaydedilmemiş Değişiklik Çıkış Uyarısı */}
      {exitPromptOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="unsaved-exit-title"
        >
          <div className="w-full max-w-md rounded-xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-6 space-y-4 shadow-lg">
            <h2 id="unsaved-exit-title" className="text-lg font-bold text-[var(--campus-ink)]">
              Kaydedilmemiş Çalışman Var
            </h2>
            <p className="text-sm text-[var(--campus-ink-muted)]">
              Çıkmadan önce çizimini ve yazdıklarını cihazına kaydetmek ister misin?
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setExitPromptOpen(false)}
                className="min-h-[44px] px-4 py-2 rounded-lg border border-[var(--campus-border)] text-sm font-semibold cursor-pointer"
              >
                Çalışmaya Dön
              </button>
              <button
                type="button"
                onClick={async () => {
                  await handleSaveArtifactAndDraft(false);
                  setExitPromptOpen(false);
                  if (pendingExitUrl) navigate(pendingExitUrl);
                }}
                className="min-h-[44px] px-4 py-2 rounded-lg bg-[var(--seljuk-teal)] text-white text-sm font-semibold cursor-pointer"
              >
                Kaydet ve Çık
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
