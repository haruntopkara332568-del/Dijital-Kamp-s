import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FolderOpen,
  Play,
  Trash2,
} from 'lucide-react';
import { useCampus } from '@/src/app/CampusProviders';
import { getMissionById } from '@/src/data/missions';
import { listArtifacts } from '@/src/services/storage';
import type { SavedArtifact } from '@/src/types/campus';
import { CampusTopBar } from '@/src/components/CampusTopBar';
import { DeleteDataModal } from '@/src/components/DeleteDataModal';
import { CampusBuildingSvg } from '@/src/components/svg/CampusBuildingSvg';

export function JourneyView() {
  const { state, activeGradeProfile } = useCampus();
  const [artifacts, setArtifacts] = useState<SavedArtifact[]>([]);
  const [loadingArtifacts, setLoadingArtifacts] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

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

  const handleDownloadArtifact = (artifact: SavedArtifact) => {
    if (!artifact.pngDataUrl) return;
    const link = document.createElement('a');
    link.href = artifact.pngDataUrl;
    link.download = `${artifact.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <CampusTopBar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/harita"
            className="min-h-[44px] px-3.5 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--campus-surface)] hover:bg-[var(--campus-surface-muted)] text-xs font-semibold text-[var(--seljuk-navy)] inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Kampüs Haritasına Dön</span>
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
            <div className="space-y-1.5 min-w-0">
              <p className="text-xs font-semibold text-[var(--seljuk-teal)] tabular-nums">
                {activeGradeProfile.label} · Kişisel Öğrenme Kayıtların
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--seljuk-navy)]">
                Kampüs Yolculuğum
              </h1>
              <p className="text-sm text-[var(--campus-ink-muted)]">
                Buradaki görev durumların ve kaydettiğin çizimler yalnızca bu cihazdaki tarayıcıda tutulur.
                Tarayıcı verileri temizlendiğinde bu kayıtlar silinebilir; önemli çalışmalarını PNG olarak
                indirebilirsin.
              </p>
            </div>
          </div>
        </section>

        {/* Görev Durumları */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[var(--seljuk-navy)]">Görevlerin</h2>

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
                return (
                  <div
                    key={`${entry.missionId}-${entry.grade}`}
                    className="rounded-xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[var(--terracotta)]">Devam Ediyor</span>
                      <span className="text-[var(--campus-ink-muted)] tabular-nums">
                        {entry.grade}. Sınıf · Geçilen aşama: %{stagePercent}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[var(--seljuk-navy)]">
                      {mission?.title ?? entry.missionId}
                    </h3>
                    <Link
                      to={`/gorev/${entry.missionId}`}
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
                return (
                  <div
                    key={`${entry.missionId}-${entry.grade}`}
                    className="rounded-xl bg-[var(--campus-surface)] border border-[var(--courtyard-sage)]/40 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
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
                    {entry.selfEvaluation?.selectedOptionId && (
                      <p className="text-xs text-[var(--campus-ink-muted)]">
                        Öz değerlendirme kaydedildi
                        {entry.selfEvaluation.note ? `: "${entry.selfEvaluation.note}"` : '.'}
                      </p>
                    )}
                    <Link
                      to={`/gorev/${entry.missionId}`}
                      className="min-h-[44px] px-4 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--stone-cream)] hover:bg-[var(--campus-surface-muted)] text-xs font-semibold text-[var(--seljuk-navy)] inline-flex items-center gap-2 transition-colors"
                    >
                      <span>Çalışmaya Yeniden Bak</span>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Cihazda Kayıtlı Ürünler (IndexedDB) */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[var(--seljuk-navy)]">Cihazda Kayıtlı Çalışmalarım</h2>

          {loadingArtifacts ? (
            <p className="text-sm text-[var(--campus-ink-muted)]">Kayıtlı çalışmalar yükleniyor...</p>
          ) : artifacts.length === 0 ? (
            <div className="rounded-xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-5 text-sm text-[var(--campus-ink-muted)]">
              Henüz kaydedilmiş bir çizim veya yazılı tasarımın yok. Bir görevin &ldquo;Üret&rdquo; veya
              &ldquo;Paylaş&rdquo; adımında çalışmanı kaydettiğinde burada görünecektir.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {artifacts.map((art) => (
                <article
                  key={art.id}
                  className="rounded-xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-[var(--campus-ink-muted)]">
                    <span className="font-semibold text-[var(--seljuk-teal)] tabular-nums">
                      {art.grade}. Sınıf
                    </span>
                    <span>{art.title}</span>
                  </div>

                  <h3 className="text-base font-bold text-[var(--seljuk-navy)]">{art.doorName}</h3>

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
                      onClick={() => handleDownloadArtifact(art)}
                      className="min-h-[44px] px-4 py-2 rounded-lg bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal-hover)] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>PNG İndir</span>
                    </button>

                    <Link
                      to={`/gorev/${art.missionId}`}
                      className="min-h-[44px] px-4 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--stone-cream)] hover:bg-[var(--campus-surface-muted)] text-xs font-semibold text-[var(--seljuk-navy)] inline-flex items-center transition-colors"
                    >
                      <span>Göreve Git</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <DeleteDataModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} />
    </>
  );
}
