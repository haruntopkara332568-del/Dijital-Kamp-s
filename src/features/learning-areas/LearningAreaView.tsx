import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, ArrowRight, Play, Volume2 } from 'lucide-react';
import { getCampusAreaById } from '@/src/data/campusAreas';
import { MISSIONS, getMissionById } from '@/src/data/missions';
import { useCampus } from '@/src/app/CampusProviders';
import { speakSegments } from '@/src/services/speech';
import { CampusTopBar } from '@/src/components/CampusTopBar';
import { DoorIllustrationSvg } from '@/src/components/svg/DoorIllustrationSvg';
import { CampusBuildingSvg } from '@/src/components/svg/CampusBuildingSvg';

interface LearningAreaViewProps {
  areaId: string;
}

export function LearningAreaView({ areaId }: LearningAreaViewProps) {
  const { activeGradeProfile } = useCampus();
  const area = getCampusAreaById(areaId);
  const sampleMission = getMissionById('kapilarin-anlattigi-hikaye');
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);

  if (!area) {
    return (
      <>
        <CampusTopBar />
        <main className="max-w-3xl mx-auto px-4 py-12 text-center space-y-4">
          <h1 className="text-2xl font-bold text-[var(--seljuk-navy)]">Alan Bulunamadı</h1>
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

  const isPrimary = activeGradeProfile.tier === 'ilkokul';

  const handleSpeak = async (text: string) => {
    setSpeechNotice(null);
    const result = await speakSegments([{ text, lang: 'en-US' }]);
    if (!result.spoken && result.fallbackReason) {
      setSpeechNotice(result.fallbackReason);
    }
  };

  return (
    <>
      <CampusTopBar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/harita"
            className="min-h-[44px] px-3.5 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--campus-surface)] hover:bg-[var(--campus-surface-muted)] text-xs font-semibold text-[var(--seljuk-navy)] inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Kampüs Haritasına Dön</span>
          </Link>

          <span className="text-xs font-semibold text-[var(--campus-ink-muted)] tabular-nums">
            {activeGradeProfile.label} · {area.type === 'learning-area' ? 'Öğrenme Alanı' : 'Kampüs İşlevi'}
          </span>
        </div>

        {/* Alan Tanıtım Kartı (Bina Mimari Kimliğiyle) */}
        <section className="rounded-2xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-28 h-24 rounded-xl border border-[var(--campus-border)] bg-[var(--stone-cream)] flex items-center justify-center shrink-0">
            <CampusBuildingSvg buildingId={area.id} className="w-24 h-20" />
          </div>

          <div className="space-y-3 flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--seljuk-navy)]">{area.title}</h1>
            <p className="text-sm sm:text-base text-[var(--campus-ink-muted)] leading-relaxed">
              {area.detailNote}
            </p>

            {sampleMission && area.id !== 'gorev-panosu' && (
              <div className="pt-1">
                <Link
                  to={`/gorev/${sampleMission.id}`}
                  className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal-hover)] text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors"
                >
                  <Play className="w-4 h-4" aria-hidden="true" />
                  <span>{sampleMission.title} Görevine Başla</span>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Serbest Keşif İçerikleri */}
        {area.id === 'gezi-ve-kesif' && sampleMission && (
          <section className="rounded-2xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-5 sm:p-6 space-y-4">
            <h2 className="text-lg font-bold text-[var(--seljuk-navy)]">
              Serbest Gözlem: Çevremizdeki Kapılar
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {sampleMission.contentRefs.ilkokulDoors.map((door) => (
                <div
                  key={door.id}
                  className="rounded-xl border border-[var(--campus-border)] bg-[var(--stone-cream)] p-3 space-y-2"
                >
                  <DoorIllustrationSvg variant={door.illustration} title={door.title} />
                  <p className="text-sm font-bold text-[var(--seljuk-navy)]">{door.title}</p>
                  <p className="text-xs text-[var(--campus-ink-muted)]">{door.shortDescription}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {area.id === 'ingilizce-dunyasi' && sampleMission && (
          <section className="rounded-2xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-[var(--seljuk-navy)]">
                Serbest Keşif: İngilizce Kelime Kartları ({activeGradeProfile.label})
              </h2>
              {speechNotice && (
                <p role="status" className="text-xs font-medium text-[var(--sandstone-gold)]">
                  {speechNotice}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(isPrimary
                ? sampleMission.contentRefs.ilkokulVocabulary
                : sampleMission.contentRefs.ortaokulVocabulary
              ).map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-[var(--campus-border)] bg-[var(--stone-cream)] p-4 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-lg font-bold text-[var(--seljuk-navy)]">{item.word}</p>
                    <p className="text-xs font-medium text-[var(--seljuk-teal)]">
                      {item.turkishMeaning}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleSpeak(item.word)}
                    aria-label={`${item.word} kelimesini sesli dinle`}
                    className="min-h-[44px] px-3 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--campus-surface)] hover:bg-[var(--campus-surface-muted)] text-xs font-semibold text-[var(--seljuk-navy)] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4 text-[var(--seljuk-teal)]" aria-hidden="true" />
                    <span>Dinle</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {area.id === 'kitap-ve-hikaye-dunyasi' && sampleMission && (
          <section className="rounded-2xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-5 sm:p-6 space-y-3">
            <h2 className="text-lg font-bold text-[var(--seljuk-navy)]">
              Yaratıcı Üretim Atölyesi
            </h2>
            <p className="text-sm text-[var(--campus-ink-muted)]">
              Çizim ve yazı atölyesi, bütünleşik görevlerin Üret ve Paylaş aşamalarında çalışır.
              Kaydettiğin tüm eserlere ise Kampüs Yolculuğum bölümünden ulaşabilirsin.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                to={`/gorev/${sampleMission.id}`}
                className="min-h-[44px] px-4 py-2 rounded-lg bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal-hover)] text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors"
              >
                <span>Örnek Göreve Katıl</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                to="/yolculugum"
                className="min-h-[44px] px-4 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--stone-cream)] hover:bg-[var(--campus-surface-muted)] text-sm font-semibold text-[var(--seljuk-navy)] inline-flex items-center gap-2 transition-colors"
              >
                <span>Kayıtlı Çalışmalarımı Gör</span>
              </Link>
            </div>
          </section>
        )}

        {/* Keşif Görevleri Panosu */}
        {area.id === 'gorev-panosu' && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-[var(--seljuk-navy)]">Tüm Keşif Görevleri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MISSIONS.map((m) => {
                const isReady = m.status === 'active';
                return (
                  <div
                    key={m.id}
                    className="rounded-xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-5 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span
                          className={`font-semibold ${
                            isReady ? 'text-[var(--courtyard-sage)]' : 'text-[var(--terracotta)]'
                          }`}
                        >
                          {isReady ? 'Hazır · Bütünleşik Görev' : 'Yakında'}
                        </span>
                        <span className="text-[var(--campus-ink-muted)] tabular-nums">
                          {m.gradeRange[0]}–{m.gradeRange[m.gradeRange.length - 1]}. Sınıflar
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[var(--seljuk-navy)]">{m.title}</h3>
                      <p className="text-xs text-[var(--campus-ink-muted)]">
                        {isReady
                          ? 'Keşfet (Gezi ve Keşif) → Öğren (İngilizce Dünyası) → Üret & Paylaş (Kitap ve Hikâye Dünyası)'
                          : 'Bu görev kaynak ve içerik doğrulama sürecindedir.'}
                      </p>
                    </div>

                    {isReady ? (
                      <Link
                        to={`/gorev/${m.id}`}
                        className="min-h-[44px] px-4 py-2 rounded-lg bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal-hover)] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                      >
                        <Play className="w-4 h-4" aria-hidden="true" />
                        <span>Göreve Başla</span>
                      </Link>
                    ) : (
                      <span className="min-h-[44px] px-4 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--stone-cream)] text-xs font-semibold text-[var(--campus-ink-muted)] inline-flex items-center justify-center">
                        Yakında Açılacak
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Dürüst "Yakında" Bölümü */}
        {area.upcomingTopics && area.upcomingTopics.length > 0 && (
          <section className="rounded-xl bg-[var(--stone-cream)] border border-[var(--campus-border)] p-5 space-y-2">
            <h2 className="text-sm font-bold text-[var(--seljuk-navy)]">
              Sonraki Sürümlerde Eklenecek Başlıklar (Yakında)
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-[var(--campus-ink-muted)]">
              {area.upcomingTopics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
}
