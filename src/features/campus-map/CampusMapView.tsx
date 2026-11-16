import { Link } from 'react-router';
import { ArrowRight, Footprints, Play, RotateCcw } from 'lucide-react';
import { CAMPUS_AREAS, getLearningAreas, getUtilityAreas } from '@/src/data/campusAreas';
import { getActiveMissions } from '@/src/data/missions';
import { useCampus } from '@/src/app/CampusProviders';
import { PeerGuideSvg, PeerGuideInSceneGraphic } from '@/src/components/svg/PeerGuideSvg';
import { CampusBuildingSvg } from '@/src/components/svg/CampusBuildingSvg';
import { IsometricGroundSvg } from '@/src/components/svg/IsometricGroundSvg';
import { IsometricPathSvg, type IsometricPathSegment } from '@/src/components/svg/IsometricPathSvg';
import {
  IsometricCypressTree,
  IsometricRoundTree,
  IsometricSignpost,
} from '@/src/components/svg/LandscapeElementsSvg';
import { BuildingInteractiveShell } from '@/src/components/svg/BuildingInteractiveShell';
import { CampusLabelTag } from '@/src/components/CampusLabelTag';
import type { CampusAreaRecord } from '@/src/types/campus';

const ISO_VIEW_W = 1000;
const ISO_VIEW_H = 625;

function getAreaAccent(
  id: string,
  accentToken: CampusAreaRecord['accentToken'],
): 'terracotta' | 'teal' | 'sage' | 'navy' {
  if (id === 'gezi-ve-kesif' || accentToken === 'gold') return 'terracotta';
  if (id === 'kitap-ve-hikaye-dunyasi' || accentToken === 'sage') return 'sage';
  if (id === 'kampus-yolculugum' || accentToken === 'slate') return 'navy';
  return 'teal';
}

function getIsometricSlot(area: CampusAreaRecord): { xPercent: number; yPercent: number } {
  switch (area.id) {
    case 'gezi-ve-kesif':
      return { xPercent: 19, yPercent: 30 };
    case 'ingilizce-dunyasi':
      return { xPercent: 50, yPercent: 18 };
    case 'kitap-ve-hikaye-dunyasi':
      return { xPercent: 81, yPercent: 30 };
    case 'gorev-panosu':
      return { xPercent: 28, yPercent: 76 };
    case 'kampus-yolculugum':
      return { xPercent: 72, yPercent: 76 };
    default:
      return area.mapPosition;
  }
}

function areaCardClasses(accent: 'terracotta' | 'teal' | 'sage' | 'navy') {
  switch (accent) {
    case 'terracotta':
      return {
        border: 'border-[var(--terracotta)]/30 hover:border-[var(--terracotta)]',
        tag: 'text-[var(--terracotta)]',
        frame: 'bg-[var(--terracotta-soft)]/70 border-[var(--terracotta)]/25',
      };
    case 'sage':
      return {
        border: 'border-[var(--courtyard-sage)]/30 hover:border-[var(--courtyard-sage)]',
        tag: 'text-[var(--courtyard-sage)]',
        frame: 'bg-[var(--courtyard-sage-soft)]/70 border-[var(--courtyard-sage)]/25',
      };
    case 'navy':
      return {
        border: 'border-[var(--seljuk-navy)]/25 hover:border-[var(--seljuk-navy)]',
        tag: 'text-[var(--seljuk-navy)]',
        frame: 'bg-[var(--seljuk-navy-soft)]/70 border-[var(--seljuk-navy)]/20',
      };
    default:
      return {
        border: 'border-[var(--seljuk-teal)]/30 hover:border-[var(--seljuk-teal)]',
        tag: 'text-[var(--seljuk-teal)]',
        frame: 'bg-[var(--seljuk-teal-soft)]/70 border-[var(--seljuk-teal)]/25',
      };
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

  // Devam eden göreve veya önerilen ilk başlangıca göre seçili bina vurgusu
  const highlightedAreaId = unfinished
    ? unfinished.currentStage === 'kesfet'
      ? 'gezi-ve-kesif'
      : unfinished.currentStage === 'ogren'
        ? 'ingilizce-dunyasi'
        : 'kitap-ve-hikaye-dunyasi'
    : 'gorev-panosu';

  // Merkez yıldız meydanından beş yapıya uzanan açık ve çakışmasız ana taş yollar
  // Not: Öğrenme alanları arasındaki pedagojik bağlantılar CAMPUS_AREAS.connectedToIds verisinde korunur.
  const plazaX = 500;
  const plazaY = 326;
  const pathSegments: IsometricPathSegment[] = CAMPUS_AREAS.map((area) => {
    const slot = getIsometricSlot(area);
    const sx = (slot.xPercent / 100) * ISO_VIEW_W;
    const sy = (slot.yPercent / 100) * ISO_VIEW_H + 14;
    return {
      id: `plaza-${area.id}`,
      x1: plazaX,
      y1: plazaY,
      x2: sx,
      y2: sy,
      width: area.type === 'learning-area' ? 22 : 18,
    };
  });

  return (
    <main className="max-w-6xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 space-y-7">
      {/* Üst Karşılama & Kaldığım Yerden Devam Et Alanı */}
      <section className="rounded-2xl bg-[var(--campus-surface)] border border-[var(--campus-border)] shadow-sm overflow-hidden">
        <div
          aria-hidden="true"
          className="h-1.5 w-full bg-gradient-to-r from-[var(--seljuk-navy)] via-[var(--seljuk-teal)] to-[var(--terracotta)]"
        />
        <div className="p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-3.5 sm:gap-4">
            <PeerGuideSvg size="sm" mood="welcoming" />
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--campus-ink-muted)]">
                <span className="font-semibold text-[var(--seljuk-teal)] tabular-nums">
                  {activeGradeProfile.label}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {activeGradeProfile.tier === 'ilkokul' ? 'İlkokul Kampüsü' : 'Ortaokul Kampüsü'}
                </span>
              </div>
              <h1 className="text-xl sm:text-3xl font-bold text-[var(--seljuk-navy)]">
                Kampüs Haritası ve Keşif Alanları
              </h1>
              <p className="text-sm sm:text-base text-[var(--campus-ink-muted)] max-w-2xl">
                İstersen üç öğrenme alanını birleştiren örnek görevle yola çık, istersen izometrik
                yerleşkedeki binalara dokunarak serbestçe keşfet.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/yuruyus"
              className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[var(--seljuk-navy)] hover:bg-[var(--seljuk-navy-shade)] text-white text-sm font-semibold inline-flex items-center gap-2 transition-all active:scale-[0.99] shadow-xs"
            >
              <Footprints className="w-4 h-4 text-[var(--seljuk-teal)] shrink-0" aria-hidden="true" />
              <span>Yürüyerek Keşfet</span>
            </Link>

            {unfinished ? (
              <Link
                to={`/gorev/${unfinished.missionId}`}
                className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal-hover)] text-white text-sm font-semibold inline-flex items-center gap-2 transition-all active:scale-[0.99]"
              >
                <Play className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Kaldığım Yerden Devam Et</span>
              </Link>
            ) : (
              primaryMission && (
                <Link
                  to={`/gorev/${primaryMission.id}`}
                  className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal-hover)] text-white text-sm font-semibold inline-flex items-center gap-2 transition-all active:scale-[0.99]"
                >
                  <Play className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{primaryMission.title} Görevine Başla</span>
                </Link>
              )
            )}

            <button
              type="button"
              onClick={replayGuidedTour}
              className="min-h-[44px] px-4 py-2.5 rounded-lg border border-[var(--campus-border)] bg-[var(--stone-cream)] hover:bg-[var(--campus-surface-muted)] text-sm font-semibold text-[var(--seljuk-navy)] inline-flex items-center gap-2 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-[var(--seljuk-teal)] shrink-0" aria-hidden="true" />
              <span>Rehberli Tur</span>
            </button>
          </div>
        </div>
      </section>

      {/* Etkileşimli 2,5B İzometrik Kampüs Yerleşkesi */}
      <section aria-labelledby="interactive-map-title" className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="interactive-map-title" className="text-lg sm:text-xl font-bold text-[var(--seljuk-navy)]">
            Etkileşimli Kampüs Yerleşkesi
          </h2>
          <p className="text-xs text-[var(--campus-ink-muted)]">
            3 Öğrenme Alanı · 2 Kampüs İşlevi · İstediğin binaya tıklayarak veya klavyeyle seçerek girebilirsin
          </p>
        </div>

        {/* Masaüstü ve Tablet: 16:10 Oranlı 2,5B İzometrik Tıklanabilir Binalar Sahnesi */}
        <div className="hidden md:block relative rounded-2xl border border-[var(--campus-border)] bg-gradient-to-b from-[var(--sky-warm-top)]/40 via-[var(--iso-ground-base)] to-[var(--stone-light)]/55 overflow-hidden aspect-[16/10] shadow-sm">
          {/* Dekoratif İzometrik Zemin, Taş Yollar, Peyzaj ve Sahne İçi Rehber */}
          <svg
            viewBox={`0 0 ${ISO_VIEW_W} ${ISO_VIEW_H}`}
            className="w-full h-auto block pointer-events-none"
            aria-hidden="true"
          >
            {/* Uzak Anadolu Tepeleri */}
            <path
              d="M 0 200 Q 240 132 500 182 Q 760 128 1000 194 L 1000 625 L 0 625 Z"
              fill="var(--courtyard-sage-soft)"
              opacity="0.45"
            />

            <IsometricGroundSvg
              plazaCx={plazaX}
              plazaCy={plazaY}
              width={ISO_VIEW_W}
              height={ISO_VIEW_H}
            />

            <IsometricPathSvg segments={pathSegments} />

            {/* Çevre Ağaçları ve Peyzaj */}
            <IsometricCypressTree x={80} y={340} scale={1.08} />
            <IsometricRoundTree x={116} y={376} scale={0.95} />
            <IsometricCypressTree x={920} y={340} scale={1.08} />
            <IsometricRoundTree x={884} y={376} scale={0.95} />
            <IsometricRoundTree x={344} y={142} scale={0.85} />
            <IsometricRoundTree x={656} y={142} scale={0.85} />
            <IsometricCypressTree x={500} y={536} scale={0.92} />

            {/* Yönlendirme Levhası (Merkez Yıldız ve Binalardan Ayrık Sağ Kenar) */}
            <g transform="translate(652, 344) scale(0.84)">
              <IsometricSignpost x={0} y={0} />
            </g>

            {/* Sahne İçi Kampüs Arkadaşı */}
            <g transform="translate(418, 254) scale(0.64)">
              <PeerGuideInSceneGraphic mood="welcoming" />
            </g>
          </svg>

          {/* Etkileşimli 2,5B İzometrik Binalar (Dekoratif Katmandan Ayrılmış Link Öğeleri) */}
          {CAMPUS_AREAS.map((area) => {
            const slot = getIsometricSlot(area);
            const accent = getAreaAccent(area.id, area.accentToken);
            const isSelected = area.id === highlightedAreaId;
            const isDisabled = area.status !== 'active';

            const statusLabel = isDisabled
              ? 'Yakında'
              : isSelected
                ? unfinished
                  ? 'Devam Eden Görev'
                  : 'Önerilen Başlangıç'
                : area.type === 'learning-area'
                  ? 'Öğrenme Alanı'
                  : 'Kampüs İşlevi';

            return (
              <BuildingInteractiveShell
                key={area.id}
                buildingId={area.id}
                to={area.route}
                title={area.title}
                subtitle={statusLabel}
                accent={accent}
                selected={isSelected}
                disabled={isDisabled}
                leftPercent={slot.xPercent}
                topPercent={slot.yPercent}
                size={area.type === 'learning-area' ? 'lg' : 'md'}
              />
            );
          })}
        </div>

        {/* Mobil Görünüm (360-767px): Taşmasız, Okunabilir ve 44x44+ Dokunmatik Hedefli Bina Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
          {CAMPUS_AREAS.map((area) => {
            const accent = getAreaAccent(area.id, area.accentToken);
            const theme = areaCardClasses(accent);
            const isSelected = area.id === highlightedAreaId;
            const statusLabel = isSelected
              ? unfinished
                ? 'Devam Eden Görev'
                : 'Önerilen Başlangıç'
              : area.type === 'learning-area'
                ? 'Öğrenme Alanı'
                : 'Kampüs İşlevi';

            return (
              <Link
                key={area.id}
                to={area.route}
                className={`rounded-xl bg-[var(--campus-surface)] border p-3.5 flex items-center gap-3 transition-colors min-h-[84px] shadow-xs focus-visible:outline-3 focus-visible:outline-[var(--seljuk-navy)] ${
                  isSelected
                    ? 'border-[var(--seljuk-teal)] ring-2 ring-[var(--seljuk-teal)]/25'
                    : theme.border
                }`}
              >
                <div
                  className={`w-20 h-16 rounded-lg border flex items-center justify-center shrink-0 ${theme.frame}`}
                >
                  <CampusBuildingSvg buildingId={area.id} className="w-18 h-14" />
                </div>
                <div className="flex-1 min-w-0">
                  <CampusLabelTag
                    title={area.title}
                    subtitle={statusLabel}
                    accent={accent}
                    selected={isSelected}
                    className="border-0 shadow-none p-0 bg-transparent"
                  />
                  <p className="text-xs text-[var(--campus-ink-muted)] mt-1 line-clamp-2">
                    {area.summary}
                  </p>
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
              const accent = getAreaAccent(area.id, area.accentToken);
              const theme = areaCardClasses(accent);
              return (
                <Link
                  key={area.id}
                  to={area.route}
                  className={`rounded-xl bg-[var(--campus-surface)] border ${theme.border} p-4 transition-all hover:shadow-sm hover:-translate-y-0.5 flex flex-col justify-between gap-3 group`}
                >
                  <div className="space-y-3">
                    <div
                      className={`w-full h-24 rounded-lg border flex items-center justify-center ${theme.frame}`}
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
                  <span className={`text-xs font-semibold ${theme.tag} inline-flex items-center gap-1`}>
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
              const accent = getAreaAccent(area.id, area.accentToken);
              const theme = areaCardClasses(accent);
              return (
                <Link
                  key={area.id}
                  to={area.route}
                  className={`rounded-xl bg-[var(--campus-surface)] border ${theme.border} p-4 transition-all hover:shadow-sm hover:-translate-y-0.5 flex items-center justify-between gap-3 group`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-18 h-14 rounded-lg border flex items-center justify-center shrink-0 ${theme.frame}`}
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
      <footer className="rounded-xl bg-[var(--stone-cream)] border border-[var(--campus-border)] px-4 py-2 text-xs text-[var(--campus-ink-muted)] flex flex-wrap items-center justify-between gap-2">
        <span>
          Bilgilerin yalnızca kullandığın bu cihaz ve tarayıcıda tutulur; tarayıcı verileri silindiğinde
          çalışmaların kaybolabilir.
        </span>
        {state.selectedGrade && (
          <Link
            to="/yolculugum"
            className="min-h-[44px] inline-flex items-center font-semibold text-[var(--seljuk-teal)] hover:underline"
          >
            Çalışmalarımı ve veri ayarlarını gör
          </Link>
        )}
      </footer>
    </main>
  );
}
