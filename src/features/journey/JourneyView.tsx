import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpenCheck,
  CheckCircle2,
  Compass,
  Download,
  Eye,
  FolderOpen,
  HardDrive,
  Play,
  Trash2,
  X,
} from 'lucide-react';
import { useCampus } from '@/src/app/CampusProviders';
import { getMissionById } from '@/src/data/missions';
import { listArtifacts } from '@/src/services/storage';
import type { GradeLevel, MissionStageId, SavedArtifact } from '@/src/types/campus';
import { CampusTopBar } from '@/src/components/CampusTopBar';
import { DeleteDataModal } from '@/src/components/DeleteDataModal';
import { CampusBuildingSvg } from '@/src/components/svg/CampusBuildingSvg';

const STAGE_ORDER: Array<{ id: MissionStageId; label: string }> = [
  { id: 'kesfet', label: '1. Keşfet' },
  { id: 'ogren', label: '2. Öğren' },
  { id: 'uret', label: '3. Üret' },
  { id: 'paylas', label: '4. Paylaş' },
];

export function JourneyView() {
  const { state, activeGradeProfile, storageStatus, setGrade } = useCampus();
  const [artifacts, setArtifacts] = useState<SavedArtifact[]>([]);
  const [loadingArtifacts, setLoadingArtifacts] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [inspectedArtifact, setInspectedArtifact] = useState<SavedArtifact | null>(null);

  useEffect(() => {
    let mounted = true;
    void listArtifacts().then((items) => {
      if (mounted) {
        setArtifacts(items);
        setLoadingArtifacts(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [state.updatedAt]);

  const progressEntries = Object.values(state.missionProgressByKey).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
  const inProgressEntries = progressEntries.filter((p) => !p.completed);
  const completedEntries = progressEntries.filter((p) => p.completed);
  const hasSessionOnlyArtifacts = artifacts.some((a) => a.storageLocation === 'session-only');

  const handleOpenMissionForGrade = (grade: GradeLevel) => {
    if (state.selectedGrade !== grade) {
      setGrade(grade);
    }
  };

  const handleDownloadArtifact = (artifact: SavedArtifact) => {
    if (!artifact.pngDataUrl) return;
    const link = document.createElement('a');
    link.href = artifact.pngDataUrl;
    const slug = (artifact.doorName || artifact.id)
      .toLowerCase()
      .replace(/[^a-z0-9ğüşıöç\s-]/gi, '')
      .trim()
      .replace(/\s+/g, '-');
    link.download = `${slug || artifact.id}-${artifact.grade}-sinif.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <CampusTopBar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className="min-h-[44px] px-3.5 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--campus-surface)] hover:bg-[var(--campus-surface-muted)] text-xs font-semibold text-[var(--seljuk-navy)] inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Kampüs Avlusuna Dön</span>
          </Link>

          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="min-h-[44px] px-4 py-2 rounded-lg border border-[var(--alert-rose)]/40 bg-[var(--campus-surface)] hover:bg-[var(--alert-rose-soft)] text-xs font-semibold text-[var(--alert-rose)] inline-flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            <span>Verilerimi Sil</span>
          </button>
        </div>

        {/* Başlık ve Arşiv Pavilyonu Kimliği */}
        <section className="rounded-2xl bg-[var(--campus-surface)] border border-[var(--campus-border)] shadow-sm overflow-hidden">
          <div
            aria-hidden="true"
            className="h-1.5 w-full bg-gradient-to-r from-[var(--seljuk-navy)] via-[var(--seljuk-teal)] to-[var(--courtyard-sage)]"
          />
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-28 h-24 rounded-xl border border-[var(--campus-border)] bg-[var(--stone-cream)] flex items-center justify-center shrink-0">
              <CampusBuildingSvg buildingId="kampus-yolculugum" className="w-24 h-20" />
            </div>
            <div className="space-y-1.5 min-w-0 flex-1">
              <p className="text-xs font-semibold text-[var(--seljuk-teal)] tabular-nums">
                {activeGradeProfile.label} · Kişisel Öğrenme Kayıtların
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--seljuk-navy)]">
                Kampüs Yolculuğum
              </h1>
              <p className="text-sm text-[var(--campus-ink-muted)]">
                Buradaki görev durumların ve kaydettiğin çalışmalar yalnızca bu cihazdaki tarayıcıda tutulur;
                herkese açık paylaşılmaz. Tarayıcı verileri temizlendiğinde kayıtlar silinebilir; önemli
                çalışmalarını PNG olarak indirebilirsin.
              </p>
            </div>
          </div>

          {(storageStatus.warningMessage || hasSessionOnlyArtifacts) && (
            <div
              role="status"
              className="mx-5 mb-5 sm:mx-6 sm:mb-6 rounded-xl bg-[var(--sandstone-gold-soft)] border border-[var(--sandstone-gold)]/40 p-3.5 flex items-start gap-2.5 text-xs sm:text-sm text-[var(--campus-ink)]"
            >
              <AlertTriangle className="w-4 h-4 text-[var(--sandstone-gold)] shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                {storageStatus.warningMessage ??
                  'Bazı çalışmalar kalıcı cihaz depolamasına yazılamadığı için yalnızca bu oturumda geçici olarak tutuluyor. Kalıcı saklamak için PNG olarak indirmeni öneririz.'}
              </span>
            </div>
          )}
        </section>

        {/* 1. BÖLÜM: GÖREVLERİM */}
        <section aria-labelledby="journey-missions-heading" className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="journey-missions-heading" className="text-lg font-bold text-[var(--seljuk-navy)]">
              Görevlerim
            </h2>
            <p className="text-xs text-[var(--campus-ink-muted)] tabular-nums">
              {inProgressEntries.length} devam eden · {completedEntries.length} tamamlanan
            </p>
          </div>

          {progressEntries.length === 0 ? (
            <div className="rounded-xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-6 text-center space-y-3">
              <FolderOpen className="w-8 h-8 text-[var(--seljuk-teal)] mx-auto" aria-hidden="true" />
              <h3 className="text-base font-bold text-[var(--seljuk-navy)]">
                Henüz Başladığın Bir Görev Yok
              </h3>
              <p className="text-sm text-[var(--campus-ink-muted)] max-w-md mx-auto">
                İlk örnek görev olan &ldquo;Kapıların Anlattığı Hikâye&rdquo; ile keşfe başlayabilir,
                çizim ve yazılarını cihazına kaydedebilirsin.
              </p>
              <Link
                to="/gorev/kapilarin-anlattigi-hikaye"
                className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal-hover)] text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors"
              >
                <Play className="w-4 h-4" aria-hidden="true" />
                <span>İlk Göreve Başla</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inProgressEntries.map((entry) => {
                const mission = getMissionById(entry.missionId);
                const stageCount = mission?.steps.length ?? 4;
                const stagePercent = Math.round((entry.completedStages.length / stageCount) * 100);
                const activeStageTitle =
                  STAGE_ORDER.find((s) => s.id === entry.currentStage)?.label ?? '1. Keşfet';
                return (
                  <div
                    key={`${entry.missionId}-${entry.grade}`}
                    className="rounded-xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs gap-2">
                      <span className="font-semibold text-[var(--terracotta)]">Devam Ediyor</span>
                      <span className="text-[var(--campus-ink-muted)] tabular-nums">
                        {entry.grade}. Sınıf · Geçilen aşama: %{stagePercent}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-[var(--seljuk-navy)]">
                        {mission?.title ?? entry.missionId}
                      </h3>
                      <p className="text-xs text-[var(--campus-ink-muted)]">
                        Şu anki adım: {activeStageTitle}
                      </p>
                    </div>
                    <Link
                      to={`/gorev/${entry.missionId}`}
                      onClick={() => handleOpenMissionForGrade(entry.grade)}
                      className="min-h-[44px] px-4 py-2 rounded-lg bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal-hover)] text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Kaldığım Yerden Devam Et</span>
                    </Link>
                  </div>
                );
              })}

              {completedEntries.map((entry) => {
                const mission = getMissionById(entry.missionId);
                const evalOption = mission?.selfEvaluation.options.find(
                  (o) => o.id === entry.selfEvaluation?.selectedOptionId,
                );
                return (
                  <div
                    key={`${entry.missionId}-${entry.grade}`}
                    className="rounded-xl bg-[var(--campus-surface)] border border-[var(--courtyard-sage)]/40 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs gap-2">
                      <span className="font-semibold text-[var(--courtyard-sage)] inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Tamamlandı</span>
                      </span>
                      <span className="text-[var(--campus-ink-muted)] tabular-nums">
                        {entry.grade}. Sınıf
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[var(--seljuk-navy)]">
                      {mission?.title ?? entry.missionId}
                    </h3>
                    {evalOption && (
                      <p className="text-xs text-[var(--campus-ink-muted)]">
                        Öz değerlendirme: <strong className="text-[var(--campus-ink)]">{evalOption.label}</strong>
                        {entry.selfEvaluation?.note ? ` — "${entry.selfEvaluation.note}"` : ''}
                      </p>
                    )}
                    <Link
                      to={`/gorev/${entry.missionId}`}
                      onClick={() => handleOpenMissionForGrade(entry.grade)}
                      className="min-h-[44px] px-4 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--stone-cream)] hover:bg-[var(--campus-surface-muted)] text-xs font-semibold text-[var(--seljuk-navy)] inline-flex items-center gap-2 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-[var(--seljuk-teal)]" aria-hidden="true" />
                      <span>Tamamlanan Görevi İncele</span>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 2. BÖLÜM: ÖĞRENME YOLCULUĞUM (Keşfet → Öğren → Üret → Paylaş Aşama İlerlemesi) */}
        <section aria-labelledby="journey-learning-heading" className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="journey-learning-heading" className="text-lg font-bold text-[var(--seljuk-navy)]">
              Öğrenme Yolculuğum
            </h2>
            <p className="text-xs text-[var(--campus-ink-muted)]">
              Keşfet → Öğren → Üret → Paylaş aşama ilerlemesi
            </p>
          </div>

          {progressEntries.length === 0 ? (
            <div className="rounded-xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-5 flex items-center gap-3 text-sm text-[var(--campus-ink-muted)]">
              <Compass className="w-5 h-5 text-[var(--seljuk-teal)] shrink-0" aria-hidden="true" />
              <span>
                Bir göreve başladığında dört aşamalı öğrenme yolculuğundaki ilerlemen burada adım adım görünecektir.
              </span>
            </div>
          ) : (
            <div className="space-y-4">
              {progressEntries.map((entry) => {
                const mission = getMissionById(entry.missionId);
                const linkedArtifactId = entry.savedArtifactId ?? entry.draftArtifactId;
                const linkedArtifact = linkedArtifactId
                  ? artifacts.find((a) => a.id === linkedArtifactId)
                  : undefined;

                return (
                  <div
                    key={`path-${entry.missionId}-${entry.grade}`}
                    className="rounded-xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-4 sm:p-5 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <BookOpenCheck className="w-4 h-4 text-[var(--seljuk-teal)] shrink-0" aria-hidden="true" />
                        <h3 className="text-sm sm:text-base font-bold text-[var(--seljuk-navy)]">
                          {mission?.title ?? entry.missionId} ({entry.grade}. Sınıf)
                        </h3>
                      </div>
                      <span className="text-xs font-medium text-[var(--campus-ink-muted)]">
                        {linkedArtifact
                          ? linkedArtifact.storageLocation === 'session-only'
                            ? 'Ürün yalnızca bu oturumda geçici tutuluyor'
                            : 'Özgün ürün cihaza kaydedildi'
                          : 'Henüz özgün ürün kaydedilmedi'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {STAGE_ORDER.map((step) => {
                        const isDone = entry.completedStages.includes(step.id);
                        const isCurrent = !entry.completed && entry.currentStage === step.id;
                        return (
                          <div
                            key={step.id}
                            className={`rounded-lg border px-3 py-2.5 text-xs ${
                              isDone
                                ? 'border-[var(--courtyard-sage)]/50 bg-[var(--courtyard-sage-soft)]/60 text-[var(--campus-ink)]'
                                : isCurrent
                                  ? 'border-[var(--seljuk-teal)] bg-[var(--seljuk-teal-soft)]/70 text-[var(--campus-ink)]'
                                  : 'border-[var(--campus-border)] bg-[var(--campus-canvas)] text-[var(--campus-ink-muted)]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 font-bold">
                              <span>{step.label}</span>
                              {isDone && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--courtyard-sage)] shrink-0" aria-hidden="true" />
                              )}
                            </div>
                            <p className="text-[11px] mt-0.5">
                              {isDone ? 'Geçildi' : isCurrent ? 'Şu anki adım' : 'Bekliyor'}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 3. BÖLÜM: ÇALIŞMALARIM */}
        <section aria-labelledby="journey-works-heading" className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="journey-works-heading" className="text-lg font-bold text-[var(--seljuk-navy)]">
              Çalışmalarım
            </h2>
            <p className="text-xs text-[var(--campus-ink-muted)] tabular-nums">
              {artifacts.length} kayıtlı çalışma
            </p>
          </div>

          {loadingArtifacts ? (
            <p className="text-sm text-[var(--campus-ink-muted)]">Kayıtlı çalışmalar yükleniyor...</p>
          ) : artifacts.length === 0 ? (
            <div className="rounded-xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-5 text-sm text-[var(--campus-ink-muted)]">
              Henüz kaydedilmiş bir çizim veya yazılı çalışman yok. Bir görevin &ldquo;Üret&rdquo; veya
              &ldquo;Paylaş&rdquo; adımında özgün ürününü oluşturup kaydettiğinde burada görünecektir.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {artifacts.map((art) => {
                const isSessionOnly = art.storageLocation === 'session-only';
                return (
                  <article
                    key={art.id}
                    className="rounded-xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--campus-ink-muted)]">
                      <span className="font-semibold text-[var(--seljuk-teal)] tabular-nums">
                        {art.grade}. Sınıf · {art.title}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          isSessionOnly ? 'text-[var(--terracotta)]' : 'text-[var(--courtyard-sage)]'
                        }`}
                      >
                        {isSessionOnly ? (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Oturum Belleğinde (Geçici)</span>
                          </>
                        ) : (
                          <>
                            <HardDrive className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Cihaza Kayıtlı</span>
                          </>
                        )}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[var(--seljuk-navy)]">{art.doorName}</h3>

                    {art.materialChoice && (
                      <p className="text-xs text-[var(--campus-ink-muted)]">
                        Malzeme: <strong className="text-[var(--campus-ink)]">{art.materialChoice}</strong>
                      </p>
                    )}

                    {art.pngDataUrl && (
                      <img
                        src={art.pngDataUrl}
                        alt={`${art.doorName} çalışması`}
                        className="w-full h-auto rounded-lg border border-[var(--campus-border)]"
                      />
                    )}

                    {art.writtenText && (
                      <p className="text-xs text-[var(--campus-ink-muted)] line-clamp-3">
                        {art.writtenText}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setInspectedArtifact(art)}
                        className="min-h-[44px] px-4 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--campus-canvas)] hover:bg-[var(--campus-surface-muted)] text-xs font-semibold text-[var(--seljuk-navy)] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-[var(--seljuk-teal)]" aria-hidden="true" />
                        <span>Çalışmayı İncele</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadArtifact(art)}
                        className="min-h-[44px] px-4 py-2 rounded-lg bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal-hover)] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>PNG İndir</span>
                      </button>

                      <Link
                        to={`/gorev/${art.missionId}`}
                        onClick={() => handleOpenMissionForGrade(art.grade)}
                        className="min-h-[44px] px-4 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--stone-cream)] hover:bg-[var(--campus-surface-muted)] text-xs font-semibold text-[var(--seljuk-navy)] inline-flex items-center transition-colors"
                      >
                        <span>Göreve Git</span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Kayıtlı Çalışmayı Ayrıntılı İnceleme Penceresi */}
      {inspectedArtifact && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="inspect-artifact-title"
        >
          <div className="w-full max-w-2xl max-h-[90dvh] overflow-y-auto rounded-xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-5 sm:p-6 shadow-lg space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[var(--seljuk-teal)] tabular-nums">
                  {inspectedArtifact.grade}. Sınıf · {inspectedArtifact.title}
                </p>
                <h2 id="inspect-artifact-title" className="text-xl font-bold text-[var(--seljuk-navy)]">
                  {inspectedArtifact.doorName}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setInspectedArtifact(null)}
                aria-label="İnceleme penceresini kapat"
                className="min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center text-[var(--campus-ink-muted)] hover:bg-[var(--campus-surface-muted)] cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {inspectedArtifact.pngDataUrl && (
              <img
                src={inspectedArtifact.pngDataUrl}
                alt={`${inspectedArtifact.doorName} tam ön izlemesi`}
                className="w-full h-auto rounded-lg border border-[var(--campus-border)]"
              />
            )}

            <div className="rounded-xl bg-[var(--campus-canvas)] border border-[var(--campus-border)] p-4 space-y-2 text-xs sm:text-sm text-[var(--campus-ink)]">
              <p>
                <strong>Saklama durumu:</strong>{' '}
                {inspectedArtifact.storageLocation === 'session-only'
                  ? 'Yalnızca bu oturumda geçici olarak tutuluyor (PNG olarak indirmen önerilir).'
                  : 'Bu cihazdaki tarayıcı depolamasında saklanıyor.'}
              </p>
              {inspectedArtifact.materialChoice && (
                <p>
                  <strong>Seçilen malzeme:</strong> {inspectedArtifact.materialChoice}
                </p>
              )}
              {inspectedArtifact.usedEnglishWords && inspectedArtifact.usedEnglishWords.length > 0 && (
                <p>
                  <strong>Kullanılan İngilizce kelimeler:</strong>{' '}
                  {inspectedArtifact.usedEnglishWords.join(', ')}
                </p>
              )}
              {inspectedArtifact.writtenText && (
                <div className="pt-1">
                  <p className="font-semibold mb-1">Yazılı Anlatım:</p>
                  <p className="whitespace-pre-wrap text-[var(--campus-ink-muted)]">
                    {inspectedArtifact.writtenText}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleDownloadArtifact(inspectedArtifact)}
                className="min-h-[44px] px-4 py-2 rounded-lg bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal-hover)] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                <span>PNG İndir</span>
              </button>
              <button
                type="button"
                onClick={() => setInspectedArtifact(null)}
                className="min-h-[44px] px-4 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--stone-cream)] text-xs sm:text-sm font-semibold text-[var(--seljuk-navy)] cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteDataModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} />
    </>
  );
}
