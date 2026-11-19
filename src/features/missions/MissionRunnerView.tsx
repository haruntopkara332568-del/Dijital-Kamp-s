import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  Eye,
  HelpCircle,
  Lightbulb,
  Save,
  Volume2,
} from 'lucide-react';
import { useCampus } from '@/src/app/CampusProviders';
import { getMissionById } from '@/src/data/missions';
import { AKSARAY_MISSION_GUIDE_PROMPTS, MISSION_GUIDE_PROMPTS } from '@/src/data/dialogues';
import { getArtifactById, saveArtifact } from '@/src/services/storage';
import { speakSegments } from '@/src/services/speech';
import { evaluateOriginalProduction } from '@/src/utils/missionValidation';
import { composeArtifactPngDataUrl } from '@/src/utils/pngExport';
import {
  isSupportedGrade,
  type DrawingDocument,
  type GradeLevel,
  type MissionProgress,
  type MissionSelections,
  type MissionStageId,
  type SavedArtifact,
  type SelfEvaluationRecord,
} from '@/src/types/campus';
import { CampusTopBar } from '@/src/components/CampusTopBar';
import { GuideDialogueCard } from '@/src/features/guide/GuideDialogueCard';
import { DoorIllustrationSvg } from '@/src/components/svg/DoorIllustrationSvg';
import { CampusPortalGateSvg } from '@/src/components/svg/CampusPortalGateSvg';
import {
  DrawingCanvasStudio,
  createEmptyDrawing,
} from '@/src/features/drawing/DrawingCanvasStudio';

export interface MissionRunnerViewProps {
  missionId: string;
  focusedStage?: MissionStageId;
  onExitToClassroom?: () => void;
  onAdvanceToNextTable?: (nextStage: MissionStageId) => void;
}

const MIDDLE_SCHOOL_MATERIALS = [
  'Taş',
  'Ahşap',
  'Taş ve Ahşap',
  'Çini ve Taş',
  'Metal ve Cam',
];

const DEFAULT_DOOR_UI_COPY = {
  kesfetPrimaryBadge: 'Hayalden Gerçeğe Bağlantısı',
  kesfetPrimaryHeading: 'Gördüğün Kapıları Seç',
  kesfetPrimaryEarlyDesc: 'Tanıdığın kapılara dokun.',
  kesfetPrimaryDesc: 'Daha önce gördüğün kapıları seç; seçimin sonraki adımlarda kullanılacak.',
  kesfetMiddleBadge: 'Hayalden Gerçeğe · Karşılaştırmalı Gözlem',
  kesfetMiddleHeading: 'Günlük Kapılar ile Kampüs Kapısını Karşılaştır',
  kesfetMiddleDesc:
    'İki görseli incele ve aşağıdaki dört gözlem alanında dikkatini çeken özellikleri seç.',
  selectedCarryoverLabel: 'Seçtiğin kapılar',
  ogrenPrimaryHeading: 'Yeni Kelimemiz: Door — Kapı',
  ogrenMiddleHeading: 'Kapı ve Malzeme Kelimelerini Keşfet',
  ogrenPrimaryMatchQuestion: 'Eşleştirme: "Door" kelimesinin Türkçe karşılığı hangisidir?',
  ogrenPrimaryCorrectFeedback: 'Harika! "Door", içeri girip çıktığımız kapı anlamına gelir.',
  ogrenPrimaryMatchOptions: [
    { id: 'match-door', label: 'Kapı', isCorrect: true, desc: 'İçeri girdiğimiz kapı' },
    { id: 'match-window', label: 'Pencere', isCorrect: false, desc: 'Dışarıya baktığımız cam açıklık' },
    { id: 'match-tree', label: 'Ağaç', isCorrect: false, desc: 'Avludaki yeşil bitki' },
  ],
  ogrenPrimaryContextPrefix: 'Keşfet adımında seçtiğin kapılar',
  ogrenMiddleComparePair: [
    {
      word: 'Door',
      meaning: 'Kapı',
      desc: 'Genellikle oda veya bina girişindeki kapı',
      illustration: 'indoor-door' as const,
    },
    {
      word: 'Gate',
      meaning: 'Giriş kapısı / Büyük kapı',
      desc: 'Avlu, bahçe veya geniş yerleşkeye açılan büyük kapı',
      illustration: 'courtyard-gate' as const,
    },
  ],
  uretHeadingEarly: 'Kendi Kapını Çiz veya Şekil Ekle',
  uretHeadingPrimary: 'Kendi Kapını ve Hikâyeni Oluştur',
  uretHeadingMiddle: 'Özgün Kapını Tasarla ve Gerekçelendir',
  uretHintPrimary:
    'İstersen önce "Hazır Şekil Ekle" düğmeleriyle bir kemer ve kapı kanadı ekle, sonra serbest fırçayla kapının ardında gördüklerini çiz.',
  uretHintMiddle:
    'Malzeme seçip tasarımına bir isim ver. Açıklamanda malzeme (wood/stone), biçim veya desen (pattern) tercihini neden seçtiğini karşılaştırarak yazabilirsin.',
  uretNameLabelPrimary: 'Kapına Kısa Bir Ad Ver (İsteğe Bağlı)',
  uretNameLabelMiddle: 'Tasarladığın Kapının Adı',
  uretNamePlaceholderPrimary: 'Örneğin: Bahçe Kapısı',
  uretNamePlaceholderMiddle: 'Örneğin: Yıldızlı Avlu Kapısı',
  uretTextLabelPrimary: 'Kapıdan geçince ne gördüğünü kısaca yaz (isteğe bağlı)',
  uretTextLabelMiddle: 'Kapı Tasarımını ve Seçim Gerekçeni Açıkla',
  uretTextPlaceholderEarly: 'Örneğin: Bahçe, Ağaç, Door...',
  uretTextPlaceholderPrimary: 'Kapıdan geçince yeşil bir avlu gördüm...',
  uretTextPlaceholderMiddle: 'Bu kapıyı tasarlarken ahşap ve taş dokuyu birlikte kullandım çünkü...',
  uretTextPlaceholderGrade7:
    'Seçtiğin malzemeyi, günlük kapılarla farkını ve tasarım gerekçeni 4–6 cümleyle açıkla...',
  artifactDefaultNamePrimary: 'Kapı Hikâyem',
  artifactDefaultNameMiddle: 'Özgün Kapı Tasarımım',
  materialChoices: MIDDLE_SCHOOL_MATERIALS,
};

function createEmptySelections(): MissionSelections {
  return {
    selectedDoorIds: [],
    inspectedCampusGate: false,
    observationNotes: {},
    matchedVocabularyIds: [],
    matchedExampleSentence: false,
    doorName: '',
    writtenText: '',
    materialChoice: '',
    usedEnglishWords: [],
  };
}

export function MissionRunnerView({
  missionId,
  focusedStage,
  onExitToClassroom,
  onAdvanceToNextTable,
}: MissionRunnerViewProps) {
  const { hydrated, state, activeGradeProfile, getMissionProgress } = useCampus();
  const mission = getMissionById(missionId);
  const effectiveGrade: GradeLevel = isSupportedGrade(state.selectedGrade) ? state.selectedGrade : 2;
  const initialProgress = hydrated && mission ? getMissionProgress(mission.id, effectiveGrade) : null;

  return (
    <MissionRunnerInner
      key={`${missionId}-${effectiveGrade}-${focusedStage ?? 'all'}-${hydrated ? 'ready' : 'init'}`}
      missionId={missionId}
      effectiveGrade={effectiveGrade}
      initialProgress={initialProgress}
      defaultHintTier={activeGradeProfile.alwaysShowHint ? 1 : 0}
      focusedStage={focusedStage}
      onExitToClassroom={onExitToClassroom}
      onAdvanceToNextTable={onAdvanceToNextTable}
    />
  );
}

function MissionRunnerInner({
  missionId,
  effectiveGrade,
  initialProgress,
  defaultHintTier,
  focusedStage,
  onExitToClassroom,
  onAdvanceToNextTable,
}: {
  missionId: string;
  effectiveGrade: GradeLevel;
  initialProgress: MissionProgress | null;
  defaultHintTier: number;
  focusedStage?: MissionStageId;
  onExitToClassroom?: () => void;
  onAdvanceToNextTable?: (nextStage: MissionStageId) => void;
}) {
  const navigate = useNavigate();
  const { activeGradeProfile, saveMissionProgress } = useCampus();

  const mission = getMissionById(missionId);
  const isPrimary = activeGradeProfile.tier === 'ilkokul';
  const isEarlyPrimary = effectiveGrade === 2 || effectiveGrade === 3;
  const uiCopy = mission?.uiCopy ?? DEFAULT_DOOR_UI_COPY;
  const guidePrompts =
    mission?.guidePromptGroup === 'aksaray' ? AKSARAY_MISSION_GUIDE_PROMPTS : MISSION_GUIDE_PROMPTS;
  const isAksarayRoute = mission?.routeKind === 'thematic-digital-route';
  const primaryVocab = mission?.contentRefs.ilkokulVocabulary[0];

  const [stage, setStage] = useState<MissionStageId>(
    () => focusedStage ?? initialProgress?.currentStage ?? 'kesfet',
  );
  const [completedStages, setCompletedStages] = useState<MissionStageId[]>(
    () => initialProgress?.completedStages ?? [],
  );
  const [selections, setSelections] = useState<MissionSelections>(
    () => initialProgress?.selections ?? createEmptySelections(),
  );
  const [drawing, setDrawing] = useState<DrawingDocument>(createEmptyDrawing);
  const [draftArtifactId, setDraftArtifactId] = useState<string | null>(
    () => initialProgress?.savedArtifactId ?? initialProgress?.draftArtifactId ?? null,
  );
  const [artifactSavedAt, setArtifactSavedAt] = useState<string | null>(
    () => initialProgress?.artifactSavedAt ?? null,
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
  const [saveFailedSessionOnly, setSaveFailedSessionOnly] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{
    tone: 'success' | 'warning' | 'error';
    message: string;
  } | null>(null);
  const [productionNotice, setProductionNotice] = useState<string | null>(null);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);
  const [savedPngUrl, setSavedPngUrl] = useState<string | null>(null);
  const [exitPromptOpen, setExitPromptOpen] = useState(false);
  const [pendingExitUrl, setPendingExitUrl] = useState<string | null>(null);

  // IndexedDB'deki çizim taslağını asenkron geri yükle
  useEffect(() => {
    const artifactId = initialProgress?.savedArtifactId ?? initialProgress?.draftArtifactId;
    if (!artifactId) return;
    let active = true;
    void getArtifactById(artifactId).then((artifact) => {
      if (active && artifact) {
        setDrawing(artifact.drawingData);
        setSavedPngUrl(artifact.pngDataUrl);
        if (artifact.storageLocation === 'session-only') {
          setSaveFailedSessionOnly(true);
        }
      }
    });
    return () => {
      active = false;
    };
  }, [initialProgress?.savedArtifactId, initialProgress?.draftArtifactId]);

  const productionCheck = evaluateOriginalProduction(drawing, selections.writtenText);
  const hasValidProduction = productionCheck.isValid;

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
      savedArtifactId: overrides?.savedArtifactId ?? draftArtifactId,
      artifactSavedAt: overrides?.artifactSavedAt ?? artifactSavedAt,
      selfEvaluation: overrides?.selfEvaluation ?? selfEval,
      completed: overrides?.completed ?? completed,
      completedAt: overrides?.completedAt ?? initialProgress?.completedAt ?? null,
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

  const buildArtifactPayload = (artifactId: string): { artifact: SavedArtifact; pngDataUrl: string } | null => {
    if (!mission) return null;
    const resolvedName =
      selections.doorName.trim() ||
      (isPrimary ? uiCopy.artifactDefaultNamePrimary : uiCopy.artifactDefaultNameMiddle);
    const pngDataUrl = composeArtifactPngDataUrl({
      missionTitle: mission.title,
      grade: effectiveGrade,
      doorName: resolvedName,
      writtenText: selections.writtenText,
      materialChoice: selections.materialChoice,
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
      doorName: resolvedName,
      writtenText: selections.writtenText,
      selectedDoorIds: selections.selectedDoorIds,
      observations: selections.observationNotes,
      materialChoice: selections.materialChoice,
      usedEnglishWords: selections.usedEnglishWords,
      drawingData: drawing,
      pngDataUrl,
      createdAt: now,
      updatedAt: now,
    };

    return { artifact, pngDataUrl };
  };

  const saveArtifactToDevice = async (options?: {
    silentIfSaved?: boolean;
  }): Promise<{ ok: boolean; persisted: boolean; pngDataUrl: string | null }> => {
    if (!mission) return { ok: false, persisted: false, pngDataUrl: null };
    if (!hasValidProduction) {
      setStatusBanner({
        tone: 'warning',
        message: isEarlyPrimary
          ? 'Kaydetmeden önce bir çizim yap, hazır şekil ekle ya da kısa bir kelime yaz.'
          : 'Kaydetmeden önce serbest çizim yapabilir, hazır şekil ekleyebilir veya özgün anlatımını yazabilirsin.',
      });
      return { ok: false, persisted: false, pngDataUrl: null };
    }

    const artifactId = draftArtifactId ?? `art-${mission.id}-g${effectiveGrade}`;
    const built = buildArtifactPayload(artifactId);
    if (!built) return { ok: false, persisted: false, pngDataUrl: null };

    try {
      const status = await saveArtifact(built.artifact);
      setSavedPngUrl(built.pngDataUrl);

      if (status.persisted) {
        const savedAt = new Date().toISOString();
        setDraftArtifactId(artifactId);
        setArtifactSavedAt(savedAt);
        setHasUnsavedWork(false);
        setSaveFailedSessionOnly(false);

        const nextCompletedStages: MissionStageId[] = Array.from(
          new Set<MissionStageId>([...completedStages, 'uret']),
        );
        setCompletedStages(nextCompletedStages);
        persistProgress({
          draftArtifactId: artifactId,
          savedArtifactId: artifactId,
          artifactSavedAt: savedAt,
          completedStages: nextCompletedStages,
        });

        if (!options?.silentIfSaved) {
          setStatusBanner({
            tone: 'success',
            message: 'Çalışman bu cihaza başarıyla kaydedildi.',
          });
        }
        return { ok: true, persisted: true, pngDataUrl: built.pngDataUrl };
      }

      // Cihaz depolamasına yazılamadıysa (session-only / IndexedDB hatası) dürüst uyarı ver
      setSaveFailedSessionOnly(true);
      setStatusBanner({
        tone: 'warning',
        message: isEarlyPrimary
          ? 'Çizimin ve yazın bu cihaza kaydedilemedi, şu an geçici olarak tutuluyor. Sayfayı kapattığında çalışman kaybolabilir; saklamak için PNG indir.'
          : (status.warningMessage ??
            'Çalışman cihaz depolamasına kaydedilemedi; yalnızca bu oturumda geçici olarak tutuluyor. Sayfayı kapattığında kaybolabileceği için PNG olarak indirmeni öneririz.'),
      });
      return { ok: false, persisted: false, pngDataUrl: built.pngDataUrl };
    } catch {
      setSaveFailedSessionOnly(true);
      setStatusBanner({
        tone: 'error',
        message: isEarlyPrimary
          ? 'Kaydetme sırasında hata oluştu ve çalışman cihaza kaydedilemedi. Sayfayı kapattığında kaybolmaması için PNG indir.'
          : 'Kaydetme sırasında beklenmeyen bir hata oluştu; çalışman cihazına kaydedilemedi. Sayfayı kapattığında kaybolabilir; lütfen tekrar dene veya PNG olarak indir.',
      });
      return { ok: false, persisted: false, pngDataUrl: built.pngDataUrl };
    }
  };

  const handleDownloadPngOnly = () => {
    if (!mission) return;
    if (!hasValidProduction) {
      setStatusBanner({
        tone: 'warning',
        message: 'PNG indirmeden önce çizim, hazır şekil veya yazılı anlatım oluşturmalısın.',
      });
      return;
    }

    const built = buildArtifactPayload(draftArtifactId ?? `art-${mission.id}-g${effectiveGrade}`);
    const url = built?.pngDataUrl || savedPngUrl;
    if (!url) {
      setStatusBanner({
        tone: 'error',
        message: 'PNG görseli oluşturulamadı. Lütfen tekrar dene.',
      });
      return;
    }

    setSavedPngUrl(url);
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

    setStatusBanner({
      tone: 'success',
      message: 'PNG dosyası cihazına indirildi. (PNG indirmek isteğe bağlıdır.)',
    });
  };

  const handleCompleteMission = async () => {
    if (!mission) return;
    if (!hasValidProduction) {
      setStatusBanner({
        tone: 'warning',
        message:
          'Görevi tamamlamak için önce Üret adımında en az bir çizim, hazır şekil veya özgün anlatım oluşturmalısın.',
      });
      return;
    }

    let persistedDevice = Boolean(draftArtifactId && !hasUnsavedWork);
    if (!draftArtifactId || hasUnsavedWork) {
      const saveRes = await saveArtifactToDevice({ silentIfSaved: true });
      persistedDevice = saveRes.persisted;
    }

    const now = new Date().toISOString();
    const nextCompletedStages: MissionStageId[] = Array.from(
      new Set<MissionStageId>([...completedStages, 'uret', 'paylas']),
    );
    setCompletedStages(nextCompletedStages);
    setCompleted(true);

    persistProgress({
      completed: true,
      completedAt: now,
      completedStages: nextCompletedStages,
    });

    if (persistedDevice) {
      setStatusBanner({
        tone: 'success',
        message: 'Tebrikler! Çalışman cihaza kaydedildi ve görevin başarıyla tamamlandı.',
      });
    } else {
      setSaveFailedSessionOnly(true);
      setStatusBanner({
        tone: 'warning',
        message: isEarlyPrimary
          ? 'Görev adımlarını bitirdin ama çalışman cihaza kaydedilemedi. Sayfayı kapattığında çizimin ve yazın kaybolabilir; saklamak için PNG olarak indir.'
          : 'Görev adımlarını tamamladın ancak çalışman kalıcı cihaz depolamasına kaydedilemedi. Sayfayı kapattığında çalışman kaybolabilir; eserini korumak için PNG olarak indirmeni öneririz.',
      });
    }
  };

  const handleBeforeNavigate = (targetHref = '/') => {
    if (!hasUnsavedWork) return true;
    setPendingExitUrl(targetHref);
    setExitPromptOpen(true);
    return false;
  };

  const goToStage = (target: MissionStageId, markCurrentDone = false) => {
    const nextCompleted = markCurrentDone
      ? Array.from(new Set<MissionStageId>([...completedStages, stage]))
      : completedStages;
    setCompletedStages(nextCompleted);
    setStage(target);
    setProductionNotice(null);
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
            to="/"
            className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[var(--seljuk-teal)] text-white text-sm font-semibold inline-flex items-center gap-2"
          >
            Kampüs Avlusuna Dön
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
                  void saveArtifactToDevice();
                }}
                className="min-h-[44px] px-4 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--campus-canvas)] hover:bg-[var(--campus-surface-muted)] text-xs font-semibold text-[var(--campus-ink)] inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4 text-[var(--seljuk-teal)]" aria-hidden="true" />
                <span>Taslağı Kaydet</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onExitToClassroom) {
                    onExitToClassroom();
                  } else if (hasUnsavedWork) {
                    setPendingExitUrl('/');
                    setExitPromptOpen(true);
                  } else {
                    navigate('/');
                  }
                }}
                className="min-h-[44px] px-4 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--campus-surface)] hover:bg-[var(--campus-surface-muted)] text-xs font-semibold text-[var(--campus-ink)] cursor-pointer"
              >
                {onExitToClassroom ? 'Masadan Kalk / Sınıfa Dön' : 'Güvenle Kampüse Dön'}
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
              className={`rounded-lg border px-4 py-2.5 text-xs sm:text-sm font-medium ${
                statusBanner.tone === 'error'
                  ? 'bg-[var(--alert-rose-soft)] border-[var(--alert-rose)]/35 text-[var(--alert-rose)]'
                  : statusBanner.tone === 'warning'
                    ? 'bg-[var(--sandstone-gold-soft)] border-[var(--sandstone-gold)]/35 text-[var(--campus-ink)]'
                    : 'bg-[var(--courtyard-sage-soft)] border-[var(--courtyard-sage)]/30 text-[var(--campus-ink)]'
              }`}
            >
              {statusBanner.message}
            </div>
          )}
        </section>

        {/* ==================== 1. AŞAMA: KEŞFET ==================== */}
        {stage === 'kesfet' && (
          <div className="space-y-6">
            <GuideDialogueCard
              dialogue={
                isPrimary
                  ? guidePrompts.ilkokulKesfet
                  : guidePrompts.ortaokulKesfet
              }
              mood="thinking"
            />

            {isPrimary ? (
              <section className="rounded-2xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-5 sm:p-6 space-y-6">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-[var(--sandstone-gold)]">
                    {uiCopy.kesfetPrimaryBadge}
                  </p>
                  <h2 className="text-lg font-bold text-[var(--campus-ink)]">
                    {uiCopy.kesfetPrimaryHeading}
                  </h2>
                  <p className="text-sm text-[var(--campus-ink-muted)]">
                    {activeGradeProfile.grade === 2
                      ? uiCopy.kesfetPrimaryEarlyDesc
                      : uiCopy.kesfetPrimaryDesc}
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
                        <div className="space-y-1">
                          {door.periodBadge && (
                            <p className="text-[11px] font-semibold text-[var(--seljuk-teal)]">
                              {door.periodBadge}
                            </p>
                          )}
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
                          {door.sourceNote && (
                            <p className="text-[11px] text-[var(--campus-ink-muted)] pt-0.5">
                              Kaynak: {door.sourceNote}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {isAksarayRoute ? (
                  <div className="rounded-xl bg-[var(--campus-canvas)] border border-[var(--campus-border)] p-4 sm:p-5 space-y-2">
                    <h3 className="text-base font-bold text-[var(--campus-ink)]">
                      Tematik Dijital Öğrenme Rotası Notu
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--campus-ink-muted)]">
                      Bu rota bir yolculuk veya ulaşım planı değildir; Sultanhanı Kervansarayı, Eğri
                      Minare, Zinciriye Medresesi ve Ihlara Vadisi’ni taş, tuğla ve doğal kaya
                      özellikleriyle yakından gözlemlemen için hazırlanmıştır.
                    </p>
                    {selectedDoorCards.length > 0 && (
                      <p className="text-xs font-semibold text-[var(--seljuk-teal)]">
                        Seçilen duraklar: {selectedDoorCards.map((d) => `${d.title} (${d.materialHint})`).join(' · ')}
                      </p>
                    )}
                  </div>
                ) : (
                  /* Kampüs Kapısını Yeniden İnceleme */
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
                )}
              </section>
            ) : (
              /* ORTAOKUL KEŞFET: Karşılaştırma ve 4 Gözlem Boyutu */
              <section className="rounded-2xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-5 sm:p-6 space-y-6">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-[var(--sandstone-gold)]">
                    {uiCopy.kesfetMiddleBadge}
                  </p>
                  <h2 className="text-lg font-bold text-[var(--campus-ink)]">
                    {uiCopy.kesfetMiddleHeading}
                  </h2>
                  <p className="text-sm text-[var(--campus-ink-muted)]">
                    {uiCopy.kesfetMiddleDesc}
                  </p>
                </div>

                {isAksarayRoute ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {mission.contentRefs.ilkokulDoors.map((stop) => (
                      <div
                        key={stop.id}
                        className="rounded-xl border border-[var(--campus-border)] bg-[var(--campus-canvas)] p-3.5 space-y-2 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <DoorIllustrationSvg variant={stop.illustration} title={stop.title} className="w-full h-36" />
                          {stop.periodBadge && (
                            <p className="text-[11px] font-semibold text-[var(--seljuk-teal)]">
                              {stop.periodBadge}
                            </p>
                          )}
                          <h3 className="text-sm font-bold text-[var(--campus-ink)]">{stop.title}</h3>
                          <p className="text-xs text-[var(--campus-ink-muted)]">{stop.shortDescription}</p>
                        </div>
                        {stop.sourceNote && (
                          <p className="text-[11px] text-[var(--campus-ink-muted)] border-t border-[var(--campus-border)] pt-1.5">
                            Kaynak: {stop.sourceNote}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
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
                          className="min-h-[44px] px-3.5 py-1.5 rounded-lg border border-[var(--campus-border)] bg-white text-xs font-semibold shrink-0 cursor-pointer"
                        >
                          {inspectGateOpen ? 'Kapat' : 'Aralayıp Bak'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

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

            <div className="flex justify-end gap-3 items-center">
              {focusedStage ? (
                <button
                  type="button"
                  onClick={() => {
                    const nextCompleted = Array.from(new Set<MissionStageId>([...completedStages, 'kesfet']));
                    setCompletedStages(nextCompleted);
                    persistProgress({
                      currentStage: 'ogren',
                      completedStages: nextCompleted,
                    });
                    if (onAdvanceToNextTable) {
                      onAdvanceToNextTable('ogren');
                    } else if (onExitToClassroom) {
                      onExitToClassroom();
                    } else {
                      goToStage('ogren', true);
                    }
                  }}
                  className="min-h-[44px] px-6 py-2.5 rounded-lg bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal-hover)] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Keşfet Adımını Tamamla (Öğren Masasına Git)</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => goToStage('ogren', true)}
                  className="min-h-[44px] px-6 py-2.5 rounded-lg bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal-hover)] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Öğren Aşamasına Geç (İngilizce Öğreniyorum)</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ==================== 2. AŞAMA: ÖĞREN ==================== */}
        {stage === 'ogren' && (
          <div className="space-y-6">
            <section className="rounded-2xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-5 sm:p-6 space-y-5">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-[var(--seljuk-teal)]">
                  İngilizce Öğreniyorum Bağlantısı
                </p>
                <h2 className="text-xl font-bold text-[var(--campus-ink)]">
                  {isPrimary ? uiCopy.ogrenPrimaryHeading : uiCopy.ogrenMiddleHeading}
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
                  {uiCopy.ogrenPrimaryContextPrefix}:{' '}
                  <strong className="text-[var(--campus-ink)]">
                    {selectedDoorCards.map((d) => d.title).join(', ')}
                  </strong>
                  . Şimdi odak İngilizce kelimemizi öğrenelim.
                </div>
              )}

              {isPrimary ? (
                /* İLKOKUL ÖĞREN: Tek Odak Kelime + Basit Görsel Eşleştirme */
                <div className="space-y-6">
                  <div className="rounded-xl border border-[var(--seljuk-teal)]/30 bg-[var(--seljuk-teal-soft)]/50 p-5 flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-44 shrink-0">
                      <DoorIllustrationSvg
                        variant={
                          selectedDoorCards[0]?.illustration ??
                          primaryVocab?.illustration ??
                          'ev'
                        }
                        title={`${primaryVocab?.word ?? 'Door'} — ${primaryVocab?.turkishMeaning ?? 'Kapı'}`}
                        className="w-full h-36"
                      />
                    </div>
                    <div className="space-y-3 text-center sm:text-left">
                      <div>
                        <p className="text-3xl font-bold text-[var(--campus-ink)]">
                          {primaryVocab?.word ?? 'Door'}
                        </p>
                        <p className="text-lg font-semibold text-[var(--seljuk-teal)]">
                          {primaryVocab?.turkishMeaning ?? 'Kapı'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleSpeakEnglish(primaryVocab?.word ?? 'Door')}
                        className="min-h-[44px] px-4 py-2 rounded-lg bg-[var(--seljuk-teal)] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Volume2 className="w-4 h-4" aria-hidden="true" />
                        <span>İngilizce Dinle ({primaryVocab?.word ?? 'Door'})</span>
                      </button>
                    </div>
                  </div>

                  {/* Görsel Eşleştirme */}
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-[var(--campus-ink)]">
                      {uiCopy.ogrenPrimaryMatchQuestion}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {uiCopy.ogrenPrimaryMatchOptions.map((opt) => {
                        const targetVocabId = primaryVocab?.id ?? 'vocab-door';
                        const matched =
                          opt.isCorrect && selections.matchedVocabularyIds.includes(targetVocabId);
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              if (opt.isCorrect) {
                                setSelections((prev) => ({
                                  ...prev,
                                  matchedVocabularyIds: [targetVocabId],
                                }));
                                setVocabFeedback({
                                  type: 'ok',
                                  message: uiCopy.ogrenPrimaryCorrectFeedback,
                                });
                              } else {
                                setVocabFeedback({
                                  type: 'hint',
                                  message: `Yaklaştın! ${opt.label} farklı bir kavramdır. "${primaryVocab?.word ?? 'Door'}" kelimesi "${primaryVocab?.turkishMeaning ?? 'Kapı'}" anlamına gelir; tekrar deneyebilirsin.`,
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
                /* ORTAOKUL ÖĞREN: 5 Kelime + İkili Görsel Karşılaştırma + Örnek Cümle */
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {uiCopy.ogrenMiddleComparePair.map((pair) => (
                      <div
                        key={pair.word}
                        className="rounded-xl border border-[var(--campus-border)] bg-[var(--campus-canvas)] p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold text-[var(--campus-ink)]">
                              {pair.word} — {pair.meaning}
                            </p>
                            <p className="text-xs text-[var(--campus-ink-muted)]">{pair.desc}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => void handleSpeakEnglish(pair.word)}
                            aria-label={`${pair.word} kelimesini dinle`}
                            className="min-h-[44px] min-w-[44px] rounded-lg border border-[var(--campus-border)] bg-white flex items-center justify-center cursor-pointer"
                          >
                            <Volume2 className="w-4 h-4 text-[var(--seljuk-teal)]" aria-hidden="true" />
                          </button>
                        </div>
                        <DoorIllustrationSvg
                          variant={pair.illustration}
                          title={`${pair.word} — ${pair.meaning}`}
                          className="w-full h-36"
                        />
                      </div>
                    ))}
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
                          className="min-h-[44px] px-2.5 py-1.5 rounded-lg border border-[var(--campus-border)] bg-white hover:bg-[var(--campus-surface-muted)] text-xs font-semibold text-[var(--campus-ink)] inline-flex items-center justify-center gap-1.5 cursor-pointer"
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
                              disabled={matched}
                              onClick={() => {
                                if (!activeMatchWordId) {
                                  setVocabFeedback({
                                    type: 'hint',
                                    message:
                                      'Önce sol sütundan bir İngilizce kelime seç, sonra Türkçe karşılığına dokun.',
                                  });
                                  return;
                                }
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
                                    message: `Doğru eşleşme! "${target.word}", "${target.turkishMeaning}" anlamına gelir.`,
                                  });
                                } else {
                                  setVocabFeedback({
                                    type: 'hint',
                                    message:
                                      'Bu iki kart farklı anlamlara sahip. Yukarıdaki kelime kartlarına göz atıp yeniden deneyebilirsin.',
                                  });
                                }
                              }}
                              className={`w-full min-h-[44px] px-3.5 py-2 rounded-lg border text-left text-sm cursor-pointer ${
                                matched
                                  ? 'border-[var(--courtyard-sage)] bg-[var(--courtyard-sage-soft)] font-semibold'
                                  : 'border-[var(--campus-border)] bg-white hover:bg-[var(--campus-surface-muted)]'
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
                onClick={() => {
                  if (focusedStage && onExitToClassroom) {
                    onExitToClassroom();
                  } else {
                    goToStage('kesfet');
                  }
                }}
                className="min-h-[44px] px-4 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--campus-surface)] text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>{focusedStage ? 'Sınıfa Dön' : 'Önceki Adım (Keşfet)'}</span>
              </button>

              {focusedStage ? (
                <button
                  type="button"
                  onClick={() => {
                    const nextCompleted = Array.from(new Set<MissionStageId>([...completedStages, 'ogren']));
                    setCompletedStages(nextCompleted);
                    persistProgress({
                      currentStage: 'uret',
                      completedStages: nextCompleted,
                    });
                    if (onAdvanceToNextTable) {
                      onAdvanceToNextTable('uret');
                    } else if (onExitToClassroom) {
                      onExitToClassroom();
                    } else {
                      goToStage('uret', true);
                    }
                  }}
                  className="min-h-[44px] px-6 py-2.5 rounded-lg bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal-hover)] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Öğren Adımını Tamamla (Üret Masasına Git)</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => goToStage('uret', true)}
                  className="min-h-[44px] px-6 py-2.5 rounded-lg bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal-hover)] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Üret Aşamasına Geç (Hikâyeden Hayata)</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ==================== 3. AŞAMA: ÜRET ==================== */}
        {stage === 'uret' && (
          <div className="space-y-6">
            {isPrimary && (
              <GuideDialogueCard dialogue={guidePrompts.ilkokulUret} mood="welcoming" />
            )}

            <section className="rounded-2xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-5 sm:p-6 space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-[var(--courtyard-sage)]">
                    Hikâyeden Hayata Bağlantısı
                  </p>
                  <h2 className="text-xl font-bold text-[var(--campus-ink)]">
                    {isEarlyPrimary
                      ? uiCopy.uretHeadingEarly
                      : isPrimary
                        ? uiCopy.uretHeadingPrimary
                        : uiCopy.uretHeadingMiddle}
                  </h2>
                  <p className="text-sm text-[var(--campus-ink-muted)]">
                    {isEarlyPrimary
                      ? 'Çizim yap, hazır şekil ekle ya da kısa bir kelime yaz. Bunlardan biri yeterlidir.'
                      : isPrimary
                        ? `Üretim seçeneklerin (${activeGradeProfile.label}): ${activeGradeProfile.productionOptions.join(', ')}. Bunlardan en az birini tamamlaman yeterlidir.`
                        : `Yazma beklentisi (${activeGradeProfile.label}): ${activeGradeProfile.writingExpectation}. Görsel tasarım veya yazılı anlatımdan en az biriyle ürün oluşturabilirsin.`}
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
                    {isEarlyPrimary ? (
                      <p>Önce bir şekil seç veya serbest çiz. İstersen altına kısa bir kelime yaz.</p>
                    ) : isPrimary ? (
                      <p>{uiCopy.uretHintPrimary}</p>
                    ) : (
                      <p>{uiCopy.uretHintMiddle}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Keşfet Adımından Taşınan Seçimler */}
              {(selectedDoorCards.length > 0 || Object.keys(selections.observationNotes).length > 0) && (
                <div className="rounded-xl bg-[var(--campus-canvas)] border border-[var(--campus-border)] p-3.5 text-xs text-[var(--campus-ink-muted)] space-y-1">
                  <p className="font-semibold text-[var(--campus-ink)]">
                    Önceki Adımdan Taşınan Gözlemlerin:
                  </p>
                  {selectedDoorCards.length > 0 && (
                    <p>
                      {uiCopy.selectedCarryoverLabel}:{' '}
                      {selectedDoorCards.map((d) => d.title).join(', ')}
                    </p>
                  )}
                  {Object.entries(selections.observationNotes).map(([k, val]) => (
                    <p key={k}>• {val}</p>
                  ))}
                </div>
              )}

              {/* Çizim ve Hazır Şekil Stüdyosu (Sınıf Düzeyine Uyarlı) */}
              <DrawingCanvasStudio
                value={drawing}
                grade={effectiveGrade}
                onChange={(nextDoc) => {
                  setDrawing(nextDoc);
                  setHasUnsavedWork(true);
                  setProductionNotice(null);
                }}
              />

              {/* Çalışma İsmi, Malzeme (5–7. Sınıf) ve Yazma Alanı */}
              <div className="grid grid-cols-1 gap-4 pt-2">
                {!isPrimary && (
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold text-[var(--campus-ink)]">
                      Tasarım Malzemesi Seç (İsteğe Bağlı)
                    </p>
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Tasarım malzemesi">
                      {uiCopy.materialChoices.map((mat) => {
                        const selected = selections.materialChoice === mat;
                        return (
                          <button
                            key={mat}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => {
                              setSelections((prev) => ({
                                ...prev,
                                materialChoice: prev.materialChoice === mat ? '' : mat,
                              }));
                              setHasUnsavedWork(true);
                            }}
                            className={`min-h-[44px] px-3.5 py-2 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                              selected
                                ? 'border-[var(--seljuk-teal)] bg-[var(--seljuk-teal-soft)] text-[var(--campus-ink)]'
                                : 'border-[var(--campus-border)] bg-[var(--campus-canvas)] text-[var(--campus-ink)] hover:bg-[var(--campus-surface-muted)]'
                            }`}
                          >
                            {mat}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="door-name-input" className="block text-sm font-semibold text-[var(--campus-ink)]">
                    {isPrimary ? uiCopy.uretNameLabelPrimary : uiCopy.uretNameLabelMiddle}
                  </label>
                  <input
                    id="door-name-input"
                    type="text"
                    value={selections.doorName}
                    onChange={(e) => {
                      setSelections((prev) => ({ ...prev, doorName: e.target.value }));
                      setHasUnsavedWork(true);
                    }}
                    placeholder={
                      isPrimary ? uiCopy.uretNamePlaceholderPrimary : uiCopy.uretNamePlaceholderMiddle
                    }
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
                              setProductionNotice(null);
                            }}
                            className="min-h-[44px] px-3.5 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--campus-canvas)] hover:border-[var(--seljuk-teal)] text-xs text-[var(--campus-ink)] cursor-pointer"
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
                            className={`min-h-[44px] px-3.5 py-2 rounded-lg border text-xs font-semibold cursor-pointer ${
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
                    {isEarlyPrimary
                      ? 'İstersen Kısaca Yaz (Çizim veya Şekil Yeterlidir)'
                      : isPrimary
                        ? uiCopy.uretTextLabelPrimary
                        : uiCopy.uretTextLabelMiddle}
                  </label>
                  <textarea
                    id="written-text-input"
                    rows={isPrimary ? 3 : 5}
                    value={selections.writtenText}
                    onChange={(e) => {
                      setSelections((prev) => ({ ...prev, writtenText: e.target.value }));
                      setHasUnsavedWork(true);
                      setProductionNotice(null);
                    }}
                    placeholder={
                      isEarlyPrimary
                        ? uiCopy.uretTextPlaceholderEarly
                        : uiCopy.uretTextPlaceholderPrimary
                    }
                    className="w-full p-3.5 rounded-lg border border-[var(--campus-border)] bg-[var(--campus-canvas)] text-sm text-[var(--campus-ink)]"
                  />
                </div>
              </div>

              {productionNotice && (
                <div
                  role="status"
                  className="rounded-xl bg-[var(--sandstone-gold-soft)] border border-[var(--sandstone-gold)]/40 p-3.5 text-sm font-medium text-[var(--campus-ink)]"
                >
                  {productionNotice}
                </div>
              )}
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
                  if (!hasValidProduction) {
                    const hasOnlySymbols = selections.writtenText.trim().length > 0;
                    const msg = hasOnlySymbols
                      ? isEarlyPrimary
                        ? 'Yalnızca noktalama işareti yerine anlamlı bir kelime yazabilir, çizim yapabilir ya da şekil ekleyebilirsin.'
                        : 'Yalnızca noktalama işaretleri yazılı anlatım sayılmaz; anlamlı en az bir kelime yazabilir, serbest çizim yapabilir veya şekil ekleyebilirsin.'
                      : isEarlyPrimary
                        ? 'Devam etmek için önce bir çizim yap, hazır şekil ekle ya da kısa bir kelime yaz.'
                        : 'Paylaş adımına geçmeden önce serbest çizim yapabilir, hazır şekil ekleyebilir ya da tasarımını yazıyla anlatabilirsin.';
                    setProductionNotice(msg);
                    setStatusBanner({ tone: 'warning', message: msg });
                    return;
                  }
                  const saveRes = await saveArtifactToDevice({ silentIfSaved: true });
                  const nextCompleted = Array.from(new Set<MissionStageId>([...completedStages, 'uret']));
                  setCompletedStages(nextCompleted);
                  persistProgress({
                    currentStage: 'paylas',
                    completedStages: nextCompleted,
                  });
                  if (saveRes.persisted) {
                    setStatusBanner({
                      tone: 'success',
                      message:
                        'Çalışman taslak olarak cihaza kaydedildi. Şimdi çalışmanı gözden geçirip görevini tamamlayabilirsin.',
                    });
                  } else {
                    setStatusBanner({
                      tone: 'warning',
                      message: isEarlyPrimary
                        ? 'Çizimin ve yazın cihaza kaydedilemedi, şu an geçici olarak tutuluyor. Sayfayı kapattığında çalışman kaybolabilir; aşağıdan PNG olarak indirebilirsin.'
                        : 'Çalışman cihaz depolamasına kaydedilemedi; yalnızca bu oturumda geçici olarak tutuluyor. Sayfayı kapattığında kaybolabileceği için PNG olarak indirmeni öneririz.',
                    });
                  }
                  if (focusedStage) {
                    if (onAdvanceToNextTable) {
                      onAdvanceToNextTable('paylas');
                    } else if (onExitToClassroom) {
                      onExitToClassroom();
                    } else {
                      goToStage('paylas', true);
                    }
                  } else {
                    goToStage('paylas', true);
                  }
                }}
                className="min-h-[44px] px-6 py-2.5 rounded-lg bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal-hover)] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>{focusedStage ? 'Üretimi Kaydet (Paylaş Masasına Git)' : 'Kaydet ve Paylaş Adımına Geç'}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* ==================== 4. AŞAMA: PAYLAŞ ==================== */}
        {stage === 'paylas' && (
          <div className="space-y-6">
            <section className="rounded-2xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-5 sm:p-6 space-y-5">
              {!hasValidProduction ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-[var(--sandstone-gold)]">
                      Ürün Kontrolü
                    </p>
                    <h2 className="text-xl font-bold text-[var(--campus-ink)]">
                      Henüz Özgün Bir Ürün Oluşturulmadı
                    </h2>
                    <p className="text-sm text-[var(--campus-ink-muted)]">
                      Görevi tamamlayabilmen için serbest çizim, hazır şekil veya özgün yazılı
                      anlatımdan en az birini oluşturmalısın.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => goToStage('uret')}
                    className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal-hover)] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                    <span>Üret Adımına Dön ve Ürün Oluştur</span>
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-[var(--courtyard-sage)]">
                        Gözden Geçir, Kaydet ve Tamamla
                      </p>
                      <h2 className="text-xl font-bold text-[var(--campus-ink)]">
                        {completed
                          ? saveFailedSessionOnly
                            ? isEarlyPrimary
                              ? 'Görev Adımlarını Bitirdin — Çalışmanı PNG İle Sakla!'
                              : 'Görev Tamamlandı (Çalışman Geçici Tutuluyor)'
                            : 'Görevin Tamamlandı!'
                          : 'Çalışman Hazır!'}
                      </h2>
                      <p className="text-sm text-[var(--campus-ink-muted)]">
                        Bu kampüste çalışmalar herkese açık paylaşılmaz; çalışmanı cihazına kaydedebilir,
                        istersen PNG olarak indirebilir ve görevi tamamlayabilirsin.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void saveArtifactToDevice()}
                        className="min-h-[44px] px-4 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--campus-canvas)] hover:bg-[var(--campus-surface-muted)] text-sm font-semibold text-[var(--campus-ink)] inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Save className="w-4 h-4 text-[var(--seljuk-teal)]" aria-hidden="true" />
                        <span>Cihaza Kaydet</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadPngOnly}
                        className="min-h-[44px] px-4 py-2 rounded-lg border border-[var(--seljuk-teal)]/45 bg-[var(--campus-surface)] hover:bg-[var(--seljuk-teal-soft)] text-sm font-semibold text-[var(--seljuk-navy)] inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-[var(--seljuk-teal)]" aria-hidden="true" />
                        <span>Tek PNG Olarak İndir (İsteğe Bağlı)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleCompleteMission()}
                        className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[var(--courtyard-sage)] hover:opacity-90 text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                        <span>{completed ? 'Görev Tamamlandı' : 'Görevi Tamamla'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Kalıcı kayıt başarısız olduğunda geçicilik uyarısı ve belirgin PNG indirme çağrısı */}
                  {saveFailedSessionOnly && (
                    <div
                      role="alert"
                      className="rounded-xl border border-[var(--sandstone-gold)] bg-[var(--sandstone-gold-soft)] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle
                          className="w-5 h-5 text-[var(--terracotta)] shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <div className="space-y-1 text-xs sm:text-sm text-[var(--campus-ink)]">
                          <p className="font-bold">
                            {isEarlyPrimary
                              ? 'Dikkat: Çalışman bu cihaza kaydedilemedi!'
                              : 'Dikkat: Çalışman kalıcı olarak kaydedilemedi (yalnızca geçici)!'}
                          </p>
                          <p className="text-[var(--campus-ink-muted)]">
                            {isEarlyPrimary
                              ? 'Görev adımlarını tamamlamış olsan bile çizimin ve yazın geçici olarak tutuluyor. Sayfayı kapattığında çalışman kaybolabilir. Saklamak için aşağıdaki PNG düğmesine dokun.'
                              : 'Görev adımlarını tamamlamış olsan bile ürünün yalnızca bu oturumda geçici olarak tutuluyor. Sayfayı veya tarayıcıyı kapattığında çalışman kaybolabilir; hemen PNG olarak indirmeni öneririz.'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleDownloadPngOnly}
                        className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal-hover)] text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                      >
                        <Download className="w-4 h-4" aria-hidden="true" />
                        <span>Çalışmamı Şimdi PNG Olarak İndir</span>
                      </button>
                    </div>
                  )}

                  {/* Çalışmanı Gözden Geçir Özeti + PNG Ön İzleme */}
                  <div className="rounded-xl border border-[var(--campus-border)] bg-[var(--campus-canvas)] p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-[var(--campus-ink)]">
                        Çalışmanı Gözden Geçir:{' '}
                        {selections.doorName.trim() ||
                          (isPrimary ? uiCopy.artifactDefaultNamePrimary : uiCopy.artifactDefaultNameMiddle)}
                      </p>
                      <span className="text-xs font-medium text-[var(--campus-ink-muted)]">
                        {saveFailedSessionOnly
                          ? 'Durum: Cihaza kaydedilemedi (yalnızca bu oturumda geçici)'
                          : draftArtifactId && !hasUnsavedWork
                            ? 'Durum: Cihaza kaydedildi'
                            : 'Durum: Henüz kalıcı kaydedilmedi'}
                      </span>
                    </div>

                    {selections.materialChoice && (
                      <p className="text-xs text-[var(--campus-ink-muted)]">
                        Seçilen malzeme: <strong className="text-[var(--campus-ink)]">{selections.materialChoice}</strong>
                      </p>
                    )}
                    {selections.writtenText.trim() && (
                      <p className="text-xs sm:text-sm text-[var(--campus-ink)] bg-[var(--campus-surface)] rounded-lg p-3 border border-[var(--campus-border)]">
                        {selections.writtenText}
                      </p>
                    )}

                    {(() => {
                      const displayPngUrl =
                        !hasUnsavedWork && savedPngUrl
                          ? savedPngUrl
                          : (buildArtifactPayload(draftArtifactId ?? `preview-${mission.id}`)?.pngDataUrl ?? savedPngUrl);
                      if (!displayPngUrl) return null;
                      return (
                        <div className="space-y-1.5 pt-1">
                          <p className="text-xs font-semibold text-[var(--campus-ink-muted)]">
                            Dışa Aktarılacak PNG Ön İzlemesi (Çizim + Başlık + Metin Birlikte)
                          </p>
                          <img
                            src={displayPngUrl}
                            alt={`${selections.doorName || uiCopy.artifactDefaultNamePrimary} PNG ön izlemesi`}
                            className="w-full max-w-2xl mx-auto rounded-lg border border-[var(--campus-border)]"
                          />
                        </div>
                      );
                    })()}
                  </div>

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
                        const OptionIcon =
                          opt.iconKey === 'learned'
                            ? Lightbulb
                            : opt.iconKey === 'curious'
                              ? HelpCircle
                              : CheckCircle2;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => {
                              const nextEval: SelfEvaluationRecord = { ...selfEval, selectedOptionId: opt.id };
                              setSelfEval(nextEval);
                              persistProgress({ selfEvaluation: nextEval });
                            }}
                            className={`min-h-[60px] p-3.5 rounded-xl border text-left transition-colors cursor-pointer flex items-center gap-3 ${
                              selected
                                ? 'border-[var(--seljuk-teal)] bg-[var(--seljuk-teal-soft)] font-semibold'
                                : 'border-[var(--campus-border)] bg-[var(--campus-surface)] hover:bg-[var(--campus-surface-muted)]'
                            }`}
                          >
                            <OptionIcon
                              className={`shrink-0 ${
                                activeGradeProfile.selfEvaluationStyle === 'icons'
                                  ? 'w-6 h-6 text-[var(--seljuk-teal)]'
                                  : 'w-4 h-4 text-[var(--seljuk-teal)]'
                              }`}
                              aria-hidden="true"
                            />
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
                </>
              )}
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

              {onExitToClassroom ? (
                <button
                  type="button"
                  onClick={onExitToClassroom}
                  className="min-h-[44px] px-6 py-2.5 rounded-lg bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal-hover)] text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  <span>Görevi Tamamla ve Sınıfa Dön</span>
                </button>
              ) : (
                <Link
                  to="/yolculugum"
                  className="min-h-[44px] px-6 py-2.5 rounded-lg bg-[var(--seljuk-navy)] hover:bg-[var(--seljuk-navy-shade)] text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors"
                >
                  <span>Kampüs Yolculuğumda Gör</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              )}
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
                onClick={() => {
                  setExitPromptOpen(false);
                  if (pendingExitUrl) navigate(pendingExitUrl);
                }}
                className="min-h-[44px] px-4 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--stone-cream)] text-sm font-semibold cursor-pointer"
              >
                Kaydetmeden Çık
              </button>
              <button
                type="button"
                onClick={async () => {
                  await saveArtifactToDevice({ silentIfSaved: true });
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
