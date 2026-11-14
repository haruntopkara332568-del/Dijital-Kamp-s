import { Link } from 'react-router';
import {
  ArrowRight,
  BookOpen,
  Compass,
  FolderHeart,
  Languages,
  LayoutGrid,
  Play,
  RotateCcw,
} from 'lucide-react';
import { CAMPUS_AREAS, getLearningAreas, getUtilityAreas } from '@/src/data/campusAreas';
import { getActiveMissions } from '@/src/data/missions';
import { useCampus } from '@/src/app/CampusProviders';
import { PeerGuideSvg } from '@/src/components/svg/PeerGuideSvg';
import type { CampusAreaRecord } from '@/src/types/campus';

function renderAreaIcon(id: string) {
  switch (id) {
    case 'gezi-ve-kesif':
      return <Compass className="w-5 h-5" aria-hidden="true" />;
    case 'ingilizce-dunyasi':
      return <Languages className="w-5 h-5" aria-hidden="true" />;
    case 'kitap-ve-hikaye-dunyasi':
      return <BookOpen className="w-5 h-5" aria-hidden="true" />;
    case 'gorev-panosu':
      return <LayoutGrid className="w-5 h-5" aria-hidden="true" />;
    default:
      return <FolderHeart className="w-5 h-5" aria-hidden="true" />;
  }
}

function accentClasses(token: CampusAreaRecord['accentToken']) {
  switch (token) {
    case 'gold':
      return 'bg-[var(--sandstone-gold-soft)] text-[var(--sandstone-gold)] border-[var(--sandstone-gold)]/25';
    case 'teal':
      return 'bg-[var(--seljuk-teal-soft)] text-[var(--seljuk-teal)] border-[var(--seljuk-teal)]/25';
    case 'sage':
      return 'bg-[var(--courtyard-sage-soft)] text-[var(--courtyard-sage)] border-[var(--courtyard-sage)]/25';
    default:
      return 'bg-[var(--campus-surface-muted)] text-[var(--campus-ink)] border-[var(--campus-border)]';
  }
}

export function CampusMapView() {
  const {
    state,
    activeGradeProfile,
    getLatestUnfinishedMission,
    replayGuidedTour,
  } = useCampus();

  const learningAreas = getLearningAreas();
  const utilityAreas = getUtilityAreas();
  const unfinished = getLatestUnfinishedMission();
  const activeMissions = getActiveMissions();
  const primaryMission = activeMissions[0];

  // Bağlantı yolları veri modelinden otomatik çizilir
  const connectionSegments: Array<{ from: CampusAreaRecord; to: CampusAreaRecord; key: string }> = [];
  const seenPairs = new Set<string>();
  for (const area of CAMPUS_AREAS) {
    for (const targetId of area.connectedToIds) {
      const target = CAMPUS_AREAS.find((a) => a.id === targetId);
      if (!target) continue;
      const pairKey = [area.id, target.id].sort().join('--');
      if (seenPairs.has(pairKey)) continue;
      seenPairs.add(pairKey);
      connectionSegments.push({ from: area, to: target, key: pairKey });
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Üst Karşılama & Kaldığım Yerden Devam Et Alanı */}
      <section className="rounded-2xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <PeerGuideSvg size="sm" mood="welcoming" />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--campus-ink-muted)]">
                <span className="font-semibold text-[var(--seljuk-teal)] tabular-nums">
                  {activeGradeProfile.label}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {activeGradeProfile.tier === 'ilkokul' ? 'İlkokul Kampüsü' : 'Ortaokul Kampüsü'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--campus-ink)]">
                Kampüs Haritası ve Keşif Alanları
              </h1>
              <p className="text-sm sm:text-base text-[var(--campus-ink-muted)] max-w-2xl">
                İstersen üç öğrenme alanını birleştiren örnek görevle yola çık, istersen tek tek
                binaları ziyaret ederek serbestçe keşfet.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {unfinished ? (
              <Link
                to={`/gorev/${unfinished.missionId}`}
                className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal-hover)] text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors"
              >
                <Play className="w-4 h-4" aria-hidden="true" />
                <span>Kaldığım Yerden Devam Et</span>
              </Link>
            ) : (
              primaryMission && (
                <Link
                  to={`/gorev/${primaryMission.id}`}
                  className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal-hover)] text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors"
                >
                  <Play className="w-4 h-4" aria-hidden="true" />
                  <span>{primaryMission.title} Görevine Başla</span>
                </Link>
              )
            )}

            <button
              type="button"
              onClick={replayGuidedTour}
              className="min-h-[44px] px-4 py-2.5 rounded-lg border border-[var(--campus-border)] bg-[var(--campus-canvas)] hover:bg-[var(--campus-surface-muted)] text-sm font-medium text-[var(--campus-ink)] inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-[var(--seljuk-teal)]" aria-hidden="true" />
              <span>Rehberli Tur</span>
            </button>
          </div>
        </div>
      </section>

      {/* Etkileşimli Yerleşke Haritası (Masaüstü ve Mobilde Okunaklı Veri Temelli Görünüm) */}
      <section aria-labelledby="interactive-map-title" className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="interactive-map-title" className="text-lg sm:text-xl font-bold text-[var(--campus-ink)]">
            Etkileşimli Kampüs Yerleşkesi
          </h2>
          <p className="text-xs text-[var(--campus-ink-muted)]">
            3 Öğrenme Alanı · 2 Kampüs İşlevi · Her yapıya dokunarak veya klavyeyle seçerek gidebilirsin
          </p>
        </div>

        {/* Masaüstü ve Tablet Etkileşimli Harita Tuvali */}
        <div className="hidden md:block relative rounded-2xl border border-[var(--campus-border)] bg-[#eef5f8] overflow-hidden min-h-[430px] shadow-xs">
          {/* Arka Plan Yerleşke Çizimi ve Bağlantı Yolları */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            {/* Yeşil Kampüs Alanları */}
            <ellipse cx="50" cy="50" rx="44" ry="40" fill="var(--courtyard-sage-soft)" opacity="0.55" />
            <circle cx="14" cy="60" r="5" fill="var(--courtyard-sage)" opacity="0.35" />
            <circle cx="86" cy="58" r="5" fill="var(--courtyard-sage)" opacity="0.35" />
            <circle cx="50" cy="50" r="7" fill="var(--stone-light)" stroke="var(--stone-mid)" strokeWidth="0.6" />

            {/* Veri Temelli Bağlantı Yolları */}
            {connectionSegments.map((seg) => (
              <line
                key={seg.key}
                x1={seg.from.mapPosition.xPercent}
                y1={seg.from.mapPosition.yPercent}
                x2={seg.to.mapPosition.xPercent}
                y2={seg.to.mapPosition.yPercent}
                stroke="var(--stone-light)"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
            ))}
            {connectionSegments.map((seg) => (
              <line
                key={`${seg.key}-inner`}
                x1={seg.from.mapPosition.xPercent}
                y1={seg.from.mapPosition.yPercent}
                x2={seg.to.mapPosition.xPercent}
                y2={seg.to.mapPosition.yPercent}
                stroke="var(--stone-mid)"
                strokeWidth="0.5"
                strokeDasharray="1.5 1.5"
                strokeLinecap="round"
              />
            ))}
          </svg>

          {/* Etkileşimli Harita Erişim Noktaları */}
          {CAMPUS_AREAS.map((area) => (
            <Link
              key={area.id}
              to={area.route}
              style={{
                left: `${area.mapPosition.xPercent}%`,
                top: `${area.mapPosition.yPercent}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-56 rounded-xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-3.5 shadow-sm hover:border-[var(--seljuk-teal)] hover:shadow-md transition-all focus-visible:outline-3 focus-visible:outline-[var(--seljuk-teal)] group"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${accentClasses(
                    area.accentToken,
                  )}`}
                >
                  {renderAreaIcon(area.id)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[var(--campus-ink-muted)]">
                    {area.type === 'learning-area' ? 'Öğrenme Alanı' : 'Kampüs İşlevi'}
                  </p>
                  <p className="text-sm font-bold text-[var(--campus-ink)] group-hover:text-[var(--seljuk-teal)] transition-colors">
                    {area.title}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobil ve Ekran Okuyucu Dostu Liste / Kart Yerleşimi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:hidden">
          {CAMPUS_AREAS.map((area) => (
            <Link
              key={area.id}
              to={area.route}
              className="rounded-xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-4 flex items-start gap-3.5 hover:border-[var(--seljuk-teal)] transition-colors min-h-[76px]"
            >
              <div
                className={`w-11 h-11 rounded-lg border flex items-center justify-center shrink-0 ${accentClasses(
                  area.accentToken,
                )}`}
              >
                {renderAreaIcon(area.id)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[var(--campus-ink-muted)]">
                  {area.type === 'learning-area' ? 'Öğrenme Alanı' : 'Kampüs İşlevi'}
                </p>
                <p className="text-base font-bold text-[var(--campus-ink)]">{area.title}</p>
                <p className="text-xs text-[var(--campus-ink-muted)] mt-1">{area.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Öğrenme Alanları ve Yardımcı İşlevler Ayrımı */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-bold text-[var(--campus-ink)]">Üç Temel Öğrenme Alanı</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {learningAreas.map((area) => (
              <Link
                key={area.id}
                to={area.route}
                className="rounded-xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-4 hover:border-[var(--seljuk-teal)] transition-colors flex flex-col justify-between gap-3"
              >
                <div className="space-y-2">
                  <div
                    className={`w-10 h-10 rounded-lg border flex items-center justify-center ${accentClasses(
                      area.accentToken,
                    )}`}
                  >
                    {renderAreaIcon(area.id)}
                  </div>
                  <h3 className="text-base font-bold text-[var(--campus-ink)]">{area.title}</h3>
                  <p className="text-xs text-[var(--campus-ink-muted)] leading-relaxed">
                    {area.summary}
                  </p>
                </div>
                <span className="text-xs font-semibold text-[var(--seljuk-teal)] inline-flex items-center gap-1">
                  <span>Alanı İncele</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-[var(--campus-ink)]">Kampüs İşlevleri</h2>
          <div className="space-y-3">
            {utilityAreas.map((area) => (
              <Link
                key={area.id}
                to={area.route}
                className="rounded-xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-4 hover:border-[var(--seljuk-teal)] transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${accentClasses(
                      area.accentToken,
                    )}`}
                  >
                    {renderAreaIcon(area.id)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[var(--campus-ink)]">{area.title}</h3>
                    <p className="text-xs text-[var(--campus-ink-muted)] truncate">{area.summary}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--seljuk-teal)] shrink-0" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Gizlilik ve Cihaz İçi Saklama Bildirimi */}
      <footer className="rounded-xl bg-[var(--campus-surface-muted)] border border-[var(--campus-border)] px-4 py-3 text-xs text-[var(--campus-ink-muted)] flex flex-wrap items-center justify-between gap-2">
        <span>
          Bilgilerin yalnızca kullandığın bu cihaz ve tarayıcıda tutulur; tarayıcı verileri silindiğinde
          çalışmaların kaybolabilir.
        </span>
        {state.selectedGrade && (
          <Link to="/yolculugum" className="font-semibold text-[var(--seljuk-teal)] hover:underline">
            Çalışmalarımı ve veri ayarlarını gör
          </Link>
        )}
      </footer>
    </main>
  );
}
