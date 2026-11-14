import { Link } from 'react-router';
import {
  ArrowRight,
  Play,
  RotateCcw,
} from 'lucide-react';
import { CAMPUS_AREAS, getLearningAreas, getUtilityAreas } from '@/src/data/campusAreas';
import { getActiveMissions } from '@/src/data/missions';
import { useCampus } from '@/src/app/CampusProviders';
import { PeerGuideSvg } from '@/src/components/svg/PeerGuideSvg';
import { CampusBuildingSvg } from '@/src/components/svg/CampusBuildingSvg';
import { SeljukStarMotif } from '@/src/components/svg/SeljukStarMotif';
import type { CampusAreaRecord } from '@/src/types/campus';

function areaCardTheme(id: string, accentToken: CampusAreaRecord['accentToken']) {
  if (id === 'gezi-ve-kesif' || accentToken === 'gold') {
    return {
      border: 'border-[var(--terracotta)]/30 hover:border-[var(--terracotta)]',
      tagText: 'text-[var(--terracotta)]',
      iconFrame: 'bg-[var(--terracotta-soft)] border-[var(--terracotta)]/25',
    };
  }
  if (id === 'kitap-ve-hikaye-dunyasi' || accentToken === 'sage') {
    return {
      border: 'border-[var(--courtyard-sage)]/30 hover:border-[var(--courtyard-sage)]',
      tagText: 'text-[var(--courtyard-sage)]',
      iconFrame: 'bg-[var(--courtyard-sage-soft)] border-[var(--courtyard-sage)]/25',
    };
  }
  if (id === 'kampus-yolculugum' || accentToken === 'slate') {
    return {
      border: 'border-[var(--seljuk-navy)]/25 hover:border-[var(--seljuk-navy)]',
      tagText: 'text-[var(--seljuk-navy)]',
      iconFrame: 'bg-[var(--seljuk-navy-soft)] border-[var(--seljuk-navy)]/20',
    };
  }
  return {
    border: 'border-[var(--seljuk-teal)]/30 hover:border-[var(--seljuk-teal)]',
    tagText: 'text-[var(--seljuk-teal)]',
    iconFrame: 'bg-[var(--seljuk-teal-soft)] border-[var(--seljuk-teal)]/25',
  };
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
      <section className="rounded-2xl bg-[var(--campus-surface)] border border-[var(--campus-border)] shadow-sm overflow-hidden">
        <div
          aria-hidden="true"
          className="h-1.5 w-full bg-gradient-to-r from-[var(--seljuk-navy)] via-[var(--seljuk-teal)] to-[var(--terracotta)]"
        />
        <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
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
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--seljuk-navy)]">
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
              className="min-h-[44px] px-4 py-2.5 rounded-lg border border-[var(--campus-border)] bg-[var(--stone-cream)] hover:bg-[var(--campus-surface-muted)] text-sm font-medium text-[var(--seljuk-navy)] inline-flex items-center gap-2 cursor-pointer transition-colors"
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
          <h2 id="interactive-map-title" className="text-lg sm:text-xl font-bold text-[var(--seljuk-navy)]">
            Etkileşimli Kampüs Yerleşkesi
          </h2>
          <p className="text-xs text-[var(--campus-ink-muted)]">
            3 Öğrenme Alanı · 2 Kampüs İşlevi · Her yapıya dokunarak veya klavyeyle seçerek gidebilirsin
          </p>
        </div>

        {/* Masaüstü ve Tablet Etkileşimli Avlu Haritası Tuvali */}
        <div className="hidden md:block relative rounded-2xl border border-[var(--campus-border)] bg-[var(--stone-cream)] overflow-hidden min-h-[510px] shadow-sm">
          {/* Arka Plan Anadolu-Selçuklu Avlu Planı ve Taş Yürüyüş Yolları */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            {/* Dış Çevre Bahçe Yeşilliği ve Taş Avlu Zemini */}
            <rect x="0" y="0" width="100" height="100" fill="var(--courtyard-sage-soft)" opacity="0.55" />
            <rect
              x="4"
              y="5"
              width="92"
              height="90"
              rx="4"
              fill="var(--stone-cream)"
              stroke="var(--stone-mid)"
              strokeWidth="0.6"
            />
            {/* Yumuşak Yeşil Bahçe Adaları */}
            <ellipse cx="14" cy="56" rx="8" ry="18" fill="var(--courtyard-sage-soft)" />
            <ellipse cx="86" cy="56" rx="8" ry="18" fill="var(--courtyard-sage-soft)" />
            <ellipse cx="50" cy="49" rx="34" ry="28" fill="var(--courtyard-sage-soft)" opacity="0.45" />

            {/* Veri Temelli Taş Döşeli Yürüyüş Yolları */}
            {connectionSegments.map((seg) => (
              <line
                key={seg.key}
                x1={seg.from.mapPosition.xPercent}
                y1={seg.from.mapPosition.yPercent}
                x2={seg.to.mapPosition.xPercent}
                y2={seg.to.mapPosition.yPercent}
                stroke="var(--stone-dark)"
                strokeWidth="3.6"
                strokeLinecap="round"
              />
            ))}
            {connectionSegments.map((seg) => (
              <line
                key={`${seg.key}-surface`}
                x1={seg.from.mapPosition.xPercent}
                y1={seg.from.mapPosition.yPercent}
                x2={seg.to.mapPosition.xPercent}
                y2={seg.to.mapPosition.yPercent}
                stroke="var(--stone-light)"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
            ))}
            {connectionSegments.map((seg) => (
              <line
                key={`${seg.key}-joint`}
                x1={seg.from.mapPosition.xPercent}
                y1={seg.from.mapPosition.yPercent}
                x2={seg.to.mapPosition.xPercent}
                y2={seg.to.mapPosition.yPercent}
                stroke="var(--stone-mid)"
                strokeWidth="0.45"
                strokeDasharray="1.4 1.4"
                strokeLinecap="round"
              />
            ))}

            {/* Avlu Ağaçları */}
            <circle cx="11" cy="52" r="2.2" fill="var(--courtyard-sage)" opacity="0.7" />
            <circle cx="13" cy="60" r="1.8" fill="var(--courtyard-sage-mid)" opacity="0.8" />
            <circle cx="89" cy="52" r="2.2" fill="var(--courtyard-sage)" opacity="0.7" />
            <circle cx="87" cy="60" r="1.8" fill="var(--courtyard-sage-mid)" opacity="0.8" />
            <circle cx="50" cy="87" r="2" fill="var(--courtyard-sage)" opacity="0.65" />
          </svg>

          {/* Merkez Selçuklu Yıldızı Taş Meydan Madalyonu (Bozulmayan Kare Oran) */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center justify-center"
          >
            <svg viewBox="0 0 80 80" className="w-20 h-20">
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="var(--stone-light)"
                stroke="var(--stone-dark)"
                strokeWidth="2"
              />
              <circle
                cx="40"
                cy="40"
                r="29"
                fill="var(--stone-cream)"
                stroke="var(--stone-mid)"
                strokeWidth="1.2"
                strokeDasharray="4 3"
              />
              <SeljukStarMotif
                cx={40}
                cy={40}
                radius={17}
                fill="var(--seljuk-teal)"
                stroke="var(--seljuk-navy)"
                innerFill="var(--sandstone-gold-soft)"
                accentFill="var(--terracotta)"
              />
            </svg>
          </div>

          {/* Etkileşimli Harita Bina ve Alan Erişim Noktaları */}
          {CAMPUS_AREAS.map((area) => {
            const theme = areaCardTheme(area.id, area.accentToken);
            return (
              <Link
                key={area.id}
                to={area.route}
                style={{
                  left: `${area.mapPosition.xPercent}%`,
                  top: `${area.mapPosition.yPercent}%`,
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-60 rounded-xl bg-[var(--campus-surface)] border ${theme.border} p-3 shadow-sm hover:shadow-md hover:-translate-y-[53%] transition-all focus-visible:outline-3 focus-visible:outline-[var(--seljuk-teal)] group`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-16 h-14 rounded-lg border flex items-center justify-center shrink-0 overflow-hidden ${theme.iconFrame}`}
                  >
                    <CampusBuildingSvg buildingId={area.id} className="w-16 h-13" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[11px] font-semibold ${theme.tagText}`}>
                      {area.type === 'learning-area' ? 'Öğrenme Alanı' : 'Kampüs İşlevi'}
                    </p>
                    <p className="text-sm font-bold text-[var(--seljuk-navy)] group-hover:text-[var(--seljuk-teal)] transition-colors leading-snug">
                      {area.title}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Mobil ve Ekran Okuyucu Dostu Liste / Kart Yerleşimi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:hidden">
          {CAMPUS_AREAS.map((area) => {
            const theme = areaCardTheme(area.id, area.accentToken);
            return (
              <Link
                key={area.id}
                to={area.route}
                className={`rounded-xl bg-[var(--campus-surface)] border ${theme.border} p-4 flex items-center gap-3.5 transition-colors min-h-[76px] shadow-xs`}
              >
                <div
                  className={`w-16 h-14 rounded-lg border flex items-center justify-center shrink-0 ${theme.iconFrame}`}
                >
                  <CampusBuildingSvg buildingId={area.id} className="w-16 h-13" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold ${theme.tagText}`}>
                    {area.type === 'learning-area' ? 'Öğrenme Alanı' : 'Kampüs İşlevi'}
                  </p>
                  <p className="text-base font-bold text-[var(--seljuk-navy)]">{area.title}</p>
                  <p className="text-xs text-[var(--campus-ink-muted)] mt-1">{area.summary}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Öğrenme Alanları ve Yardımcı İşlevler Ayrımı */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-bold text-[var(--seljuk-navy)]">Üç Temel Öğrenme Alanı</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {learningAreas.map((area) => {
              const theme = areaCardTheme(area.id, area.accentToken);
              return (
                <Link
                  key={area.id}
                  to={area.route}
                  className={`rounded-xl bg-[var(--campus-surface)] border ${theme.border} p-4 transition-all hover:shadow-sm flex flex-col justify-between gap-3 group`}
                >
                  <div className="space-y-3">
                    <div
                      className={`w-full h-24 rounded-lg border flex items-center justify-center ${theme.iconFrame}`}
                    >
                      <CampusBuildingSvg buildingId={area.id} className="w-24 h-20" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-[var(--seljuk-navy)] group-hover:text-[var(--seljuk-teal)] transition-colors">
                        {area.title}
                      </h3>
                      <p className="text-xs text-[var(--campus-ink-muted)] leading-relaxed">
                        {area.summary}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold ${theme.tagText} inline-flex items-center gap-1`}>
                    <span>Alanı İncele</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-[var(--seljuk-navy)]">Kampüs İşlevleri</h2>
          <div className="space-y-3">
            {utilityAreas.map((area) => {
              const theme = areaCardTheme(area.id, area.accentToken);
              return (
                <Link
                  key={area.id}
                  to={area.route}
                  className={`rounded-xl bg-[var(--campus-surface)] border ${theme.border} p-4 transition-all hover:shadow-sm flex items-center justify-between gap-3 group`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-16 h-14 rounded-lg border flex items-center justify-center shrink-0 ${theme.iconFrame}`}
                    >
                      <CampusBuildingSvg buildingId={area.id} className="w-16 h-13" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[var(--seljuk-navy)] group-hover:text-[var(--seljuk-teal)] transition-colors">
                        {area.title}
                      </h3>
                      <p className="text-xs text-[var(--campus-ink-muted)] line-clamp-2">{area.summary}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[var(--seljuk-teal)] shrink-0" aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gizlilik ve Cihaz İçi Saklama Bildirimi */}
      <footer className="rounded-xl bg-[var(--stone-cream)] border border-[var(--campus-border)] px-4 py-3 text-xs text-[var(--campus-ink-muted)] flex flex-wrap items-center justify-between gap-2">
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
