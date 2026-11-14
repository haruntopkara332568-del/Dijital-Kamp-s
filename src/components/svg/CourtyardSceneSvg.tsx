import { IsometricGroundSvg } from './IsometricGroundSvg';
import { IsometricPathSvg, type IsometricPathSegment } from './IsometricPathSvg';
import {
  IsometricCypressTree,
  IsometricRoundTree,
  IsometricSignpost,
} from './LandscapeElementsSvg';
import { CampusBuildingGraphic } from './CampusBuildingSvg';
import { PeerGuideInSceneGraphic } from './PeerGuideSvg';

const COURTYARD_PATHS: IsometricPathSegment[] = [
  // Giriş Kapısından Merkez Yıldızlı Meydana
  { id: 'entry-to-plaza', x1: 440, y1: 392, x2: 440, y2: 266, width: 32 },
  // Merkez Meydandan Sol Üst: Gezi ve Keşif
  { id: 'plaza-to-gezi', x1: 390, y1: 226, x2: 190, y2: 162, width: 24 },
  // Merkez Meydandan Orta Üst: İngilizce Dünyası
  { id: 'plaza-to-eng', x1: 440, y1: 206, x2: 440, y2: 122, width: 26 },
  // Merkez Meydandan Sağ Üst: Kitap ve Hikâye Dünyası
  { id: 'plaza-to-kitap', x1: 490, y1: 226, x2: 690, y2: 162, width: 24 },
  // Merkez Meydandan Alt Yanlar: Görev Panosu ve Yolculuğum
  { id: 'plaza-to-pano', x1: 386, y1: 262, x2: 220, y2: 324, width: 20 },
  { id: 'plaza-to-yolculuk', x1: 494, y1: 262, x2: 668, y2: 324, width: 20 },
];

function CourtyardSvgArtwork({ compactViewBox = false }: { compactViewBox?: boolean }) {
  return (
    <svg
      viewBox={compactViewBox ? '66 10 748 390' : '0 0 880 420'}
      className="w-full h-auto rounded-xl border border-[var(--campus-border)] block"
      role="img"
      aria-label="Merkezinde sekiz köşeli yıldızlı meydan, taş yürüyüş yolları, üç öğrenme binası, görev köşkleri, yön levhası ve kampüs arkadaşının yer aldığı 2,5B izometrik kampüs avlusu"
    >
      <title>2,5B İzometrik Kampüs Karşılama Avlusu</title>

      <defs>
        <linearGradient id={compactViewBox ? 'isoCourtyardSkySm' : 'isoCourtyardSky'} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--sky-warm-top)" />
          <stop offset="100%" stopColor="var(--sky-warm-bottom)" />
        </linearGradient>
      </defs>

      {/* Açık Gökyüzü ve Hafif Anadolu Tepeleri */}
      <rect
        x="0"
        y="0"
        width="880"
        height="420"
        fill={`url(#${compactViewBox ? 'isoCourtyardSkySm' : 'isoCourtyardSky'})`}
      />
      <circle cx="772" cy="48" r="24" fill="var(--sandstone-gold-soft)" opacity="0.88" />
      <path
        d="M 0 198 Q 180 156 360 184 Q 600 144 880 194 L 880 420 L 0 420 Z"
        fill="var(--courtyard-sage-soft)"
        opacity="0.55"
      />

      {/* İzometrik Avlu Zemini ve Sekiz Köşeli Merkez Yıldız Meydanı */}
      <IsometricGroundSvg plazaCx={440} plazaCy={246} width={880} height={420} />

      {/* Geniş Taş Döşeli İzometrik Yürüyüş Yolları */}
      <IsometricPathSvg segments={COURTYARD_PATHS} />

      {/* Arka Plan Ağaçları */}
      <IsometricCypressTree x={312} y={134} scale={0.9} />
      <IsometricRoundTree x={568} y={134} scale={0.9} />

      {/* ÜST ORTA: İNGİLİZCE DÜNYASI (Büyük 2,5B İzometrik Yapı) */}
      <g transform="translate(340, 12) scale(1.1)">
        <CampusBuildingGraphic buildingId="ingilizce-dunyasi" />
      </g>
      <g transform="translate(440, 166)">
        <rect x="-70" y="-12" width="140" height="23" rx="5" fill="var(--campus-surface)" stroke="var(--seljuk-teal)" strokeWidth="1.6" />
        <text x="0" y="3.5" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--seljuk-navy)">
          İngilizce Dünyası
        </text>
      </g>

      {/* SOL ÜST: GEZİ VE KEŞİF */}
      <g transform="translate(88, 62) scale(1.06)">
        <CampusBuildingGraphic buildingId="gezi-ve-kesif" />
      </g>
      <g transform="translate(184, 212)">
        <rect x="-62" y="-12" width="124" height="23" rx="5" fill="var(--campus-surface)" stroke="var(--terracotta)" strokeWidth="1.6" />
        <text x="0" y="3.5" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--seljuk-navy)">
          Gezi ve Keşif
        </text>
      </g>

      {/* SAĞ ÜST: KİTAP VE HİKÂYE DÜNYASI */}
      <g transform="translate(600, 62) scale(1.06)">
        <CampusBuildingGraphic buildingId="kitap-ve-hikaye-dunyasi" />
      </g>
      <g transform="translate(696, 212)">
        <rect x="-64" y="-12" width="128" height="23" rx="5" fill="var(--campus-surface)" stroke="var(--courtyard-sage)" strokeWidth="1.6" />
        <text x="0" y="3.5" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--seljuk-navy)">
          Kitap ve Hikâye
        </text>
      </g>

      {/* Avlu İçi Ağaçlar */}
      <IsometricCypressTree x={102} y={258} scale={0.95} />
      <IsometricRoundTree x={286} y={226} scale={0.85} />
      <IsometricRoundTree x={594} y={226} scale={0.85} />
      <IsometricCypressTree x={778} y={258} scale={0.95} />

      {/* ALT SOL: KEŞİF GÖREVLERİ PANOSU (Çakışmasız Ayrılmış Konum) */}
      <g transform="translate(132, 246) scale(0.88)">
        <CampusBuildingGraphic buildingId="gorev-panosu" />
      </g>
      <g transform="translate(212, 376)">
        <rect x="-60" y="-11" width="120" height="22" rx="5" fill="var(--campus-surface)" stroke="var(--seljuk-navy)" strokeWidth="1.4" />
        <text x="0" y="3.5" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--seljuk-navy)">
          Görev Panosu
        </text>
      </g>

      {/* ALT SAĞ: KAMPÜS YOLCULUĞUM */}
      <g transform="translate(596, 246) scale(0.88)">
        <CampusBuildingGraphic buildingId="kampus-yolculugum" />
      </g>
      <g transform="translate(676, 376)">
        <rect x="-58" y="-11" width="116" height="22" rx="5" fill="var(--campus-surface)" stroke="var(--seljuk-navy)" strokeWidth="1.4" />
        <text x="0" y="3.5" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--seljuk-navy)">
          Yolculuğum
        </text>
      </g>

      {/* Okunaklı İzometrik Yönlendirme Levhası (Açık Meydan Sağ Kenarında, Yapılardan Uzak) */}
      <g transform="translate(562, 298) scale(0.9)">
        <IsometricSignpost x={0} y={0} />
      </g>

      {/* SAHNE İÇİ AKRAN REHBER (Merkez Yıldızlı Meydanda Belirgin Boyutta) */}
      <g transform="translate(354, 184)">
        <g transform="scale(0.74)">
          <PeerGuideInSceneGraphic mood="welcoming" />
        </g>
        <rect
          x="-29"
          y="92"
          width="124"
          height="20"
          rx="5"
          fill="var(--campus-surface)"
          stroke="var(--seljuk-teal)"
          strokeWidth="1.5"
        />
        <text x="33" y="105.5" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--seljuk-navy)">
          Kampüs Arkadaşın
        </text>
      </g>
    </svg>
  );
}

/**
 * 2,5B İzometrik Karşılama Avlusu Ana Sahnesi:
 * Masaüstü/tablette tam genişlikli izometrik sahne;
 * küçük mobil ekranlarda (360-390px) daha yakın odaklı izometrik görünüm + okunaklı bina şeridi sunar.
 */
export function CourtyardSceneSvg() {
  return (
    <div className="space-y-2.5">
      {/* Masaüstü ve Tablet Görünüm */}
      <div className="hidden sm:block">
        <CourtyardSvgArtwork />
      </div>

      {/* Mobil Görünüm: Yakınlaştırılmış İzometrik Sahne + Net Okunabilir HTML Alan Etiketleri */}
      <div className="sm:hidden space-y-2.5">
        <CourtyardSvgArtwork compactViewBox />
        <div
          aria-label="Avludaki öğrenme alanları"
          className="grid grid-cols-3 gap-1.5 text-center"
        >
          <div className="rounded-lg border border-[var(--terracotta)]/35 bg-[var(--stone-cream)] px-1.5 py-1.5">
            <span className="block text-[11px] font-bold text-[var(--seljuk-navy)] leading-tight">
              Gezi ve Keşif
            </span>
          </div>
          <div className="rounded-lg border border-[var(--seljuk-teal)]/40 bg-[var(--seljuk-teal-soft)]/55 px-1.5 py-1.5">
            <span className="block text-[11px] font-bold text-[var(--seljuk-navy)] leading-tight">
              İngilizce Dünyası
            </span>
          </div>
          <div className="rounded-lg border border-[var(--courtyard-sage)]/35 bg-[var(--courtyard-sage-soft)]/60 px-1.5 py-1.5">
            <span className="block text-[11px] font-bold text-[var(--seljuk-navy)] leading-tight">
              Kitap ve Hikâye
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
