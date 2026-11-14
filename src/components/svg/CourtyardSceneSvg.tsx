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
  { id: 'entry-to-plaza', x1: 440, y1: 386, x2: 440, y2: 264, width: 30 },
  // Merkez Meydandan Sol Üst: Gezi ve Keşif
  { id: 'plaza-to-gezi', x1: 392, y1: 222, x2: 204, y2: 162, width: 22 },
  // Merkez Meydandan Orta Üst: İngilizce Dünyası
  { id: 'plaza-to-eng', x1: 440, y1: 206, x2: 440, y2: 126, width: 24 },
  // Merkez Meydandan Sağ Üst: Kitap ve Hikâye Dünyası
  { id: 'plaza-to-kitap', x1: 488, y1: 222, x2: 676, y2: 162, width: 22 },
  // Merkez Meydandan Alt Yanlar: Görev Panosu ve Yolculuğum
  { id: 'plaza-to-pano', x1: 394, y1: 258, x2: 266, y2: 312, width: 20 },
  { id: 'plaza-to-yolculuk', x1: 486, y1: 258, x2: 614, y2: 312, width: 20 },
];

/**
 * 2,5B İzometrik Karşılama Avlusu Ana Sahnesi (Stage C):
 * - Ortada sekiz köşeli yıldızlı taş meydan
 * - Taş döşeli geniş izometrik yürüyüş yolları
 * - Sol üst (Gezi ve Keşif), orta üst (İngilizce Dünyası), sağ üst (Kitap ve Hikâye),
 *   alt yanlarda Görev Panosu ve Yolculuğum köşkleri
 * - Sahne içi akran rehber ("Kampüs Arkadaşın") ve okunaklı yön levhası
 * Yalnızca src/styles/globals.css renk belirteçlerini kullanır.
 */
export function CourtyardSceneSvg() {
  return (
    <svg
      viewBox="0 0 880 420"
      className="w-full h-auto rounded-xl border border-[var(--campus-border)]"
      role="img"
      aria-label="Merkezinde sekiz köşeli yıldızlı meydan, taş yürüyüş yolları, üç öğrenme binası, görev köşkleri, yön levhası ve kampüs arkadaşının yer aldığı 2,5B izometrik kampüs avlusu"
    >
      <title>2,5B İzometrik Kampüs Karşılama Avlusu</title>

      <defs>
        <linearGradient id="isoCourtyardSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--sky-warm-top)" />
          <stop offset="100%" stopColor="var(--sky-warm-bottom)" />
        </linearGradient>
      </defs>

      {/* Açık Gökyüzü ve Hafif Anadolu Tepeleri */}
      <rect x="0" y="0" width="880" height="420" fill="url(#isoCourtyardSky)" />
      <circle cx="772" cy="48" r="24" fill="var(--sandstone-gold-soft)" opacity="0.88" />
      <path
        d="M 0 198 Q 180 156 360 184 Q 600 144 880 194 L 880 420 L 0 420 Z"
        fill="var(--courtyard-sage-soft)"
        opacity="0.55"
      />

      {/* İzometrik Avlu Zemini ve Sekiz Köşeli Merkez Yıldız Meydanı */}
      <IsometricGroundSvg plazaCx={440} plazaCy={242} width={880} height={420} />

      {/* Geniş Taş Döşeli İzometrik Yürüyüş Yolları */}
      <IsometricPathSvg segments={COURTYARD_PATHS} />

      {/* Arka Plan Ağaçları */}
      <IsometricCypressTree x={324} y={136} scale={0.9} />
      <IsometricRoundTree x={556} y={136} scale={0.9} />

      {/* ÜST ORTA: İNGİLİZCE DÜNYASI (Büyük 2,5B İzometrik Yapı) */}
      <g transform="translate(350, 24) scale(1)">
        <CampusBuildingGraphic buildingId="ingilizce-dunyasi" />
      </g>
      <g transform="translate(440, 166)">
        <rect x="-58" y="-11" width="116" height="20" rx="4" fill="var(--campus-surface)" stroke="var(--seljuk-teal)" strokeWidth="1.5" />
        <text x="0" y="2.5" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--seljuk-navy)">
          İngilizce Dünyası
        </text>
      </g>

      {/* SOL ÜST: GEZİ VE KEŞİF */}
      <g transform="translate(106, 74) scale(0.98)">
        <CampusBuildingGraphic buildingId="gezi-ve-kesif" />
      </g>
      <g transform="translate(194, 212)">
        <rect x="-52" y="-11" width="104" height="20" rx="4" fill="var(--campus-surface)" stroke="var(--terracotta)" strokeWidth="1.5" />
        <text x="0" y="2.5" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--seljuk-navy)">
          Gezi ve Keşif
        </text>
      </g>

      {/* SAĞ ÜST: KİTAP VE HİKÂYE DÜNYASI */}
      <g transform="translate(594, 74) scale(0.98)">
        <CampusBuildingGraphic buildingId="kitap-ve-hikaye-dunyasi" />
      </g>
      <g transform="translate(684, 212)">
        <rect x="-56" y="-11" width="112" height="20" rx="4" fill="var(--campus-surface)" stroke="var(--courtyard-sage)" strokeWidth="1.5" />
        <text x="0" y="2.5" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--seljuk-navy)">
          Kitap ve Hikâye
        </text>
      </g>

      {/* Avlu İçi Ağaçlar ve Peyzaj */}
      <IsometricCypressTree x={112} y={248} scale={0.95} />
      <IsometricRoundTree x={294} y={222} scale={0.85} />
      <IsometricRoundTree x={586} y={222} scale={0.85} />
      <IsometricCypressTree x={768} y={248} scale={0.95} />

      {/* ALT SOL: KEŞİF GÖREVLERİ PANOSU */}
      <g transform="translate(186, 238) scale(0.84)">
        <CampusBuildingGraphic buildingId="gorev-panosu" />
      </g>
      <g transform="translate(262, 358)">
        <rect x="-52" y="-10" width="104" height="19" rx="4" fill="var(--campus-surface)" stroke="var(--seljuk-navy)" strokeWidth="1.3" />
        <text x="0" y="2.5" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="var(--seljuk-navy)">
          Görev Panosu
        </text>
      </g>

      {/* ALT SAĞ: KAMPÜS YOLCULUĞUM */}
      <g transform="translate(544, 238) scale(0.84)">
        <CampusBuildingGraphic buildingId="kampus-yolculugum" />
      </g>
      <g transform="translate(620, 358)">
        <rect x="-52" y="-10" width="104" height="19" rx="4" fill="var(--campus-surface)" stroke="var(--seljuk-navy)" strokeWidth="1.3" />
        <text x="0" y="2.5" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="var(--seljuk-navy)">
          Yolculuğum
        </text>
      </g>

      {/* Okunaklı İzometrik Yönlendirme Levhası */}
      <IsometricSignpost x={534} y={272} />

      {/* KATMAN 1 — SAHNE İÇİ AKRAN REHBER (Merkez Yıldızlı Meydanda Karşılıyor) */}
      <g transform="translate(364, 198)">
        <g transform="scale(0.6)">
          <PeerGuideInSceneGraphic mood="welcoming" />
        </g>
        <rect
          x="-28"
          y="-18"
          width="110"
          height="17"
          rx="4"
          fill="var(--campus-surface)"
          stroke="var(--seljuk-teal)"
          strokeWidth="1.3"
        />
        <text x="27" y="-6.5" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="var(--seljuk-navy)">
          Kampüs Arkadaşın
        </text>
      </g>
    </svg>
  );
}
