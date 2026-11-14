import { SeljukStarMotif } from './SeljukStarMotif';

interface IsometricGroundSvgProps {
  /** Merkez yıldız meydanının koordinatı */
  plazaCx?: number;
  plazaCy?: number;
  /** Geniş avlu zemini gösterilsin mi */
  width?: number;
  height?: number;
}

/**
 * 2,5B izometrik kampüs avlu zemini, taş bordürlü yükseltilmiş platform,
 * yumuşak adaçayı çim adaları ve sekiz köşeli Selçuklu yıldızı merkez meydanı.
 * Yalnızca src/styles/globals.css renk belirteçlerini kullanır.
 */
export function IsometricGroundSvg({
  plazaCx = 440,
  plazaCy = 236,
  width = 880,
  height = 420,
}: IsometricGroundSvgProps) {
  return (
    <g aria-hidden="true">
      {/* Yükseltilmiş İzometrik Avlu Platformu (Alt Taş Kalınlık Kenarı + Üst Avlu Yüzeyi) */}
      <polygon
        points={`48,${height * 0.56} ${width * 0.5},${height * 0.94} ${width - 48},${height * 0.56} ${width - 48},${height * 0.59} ${width * 0.5},${height * 0.97} 48,${height * 0.59}`}
        fill="var(--stone-shade)"
        stroke="var(--stone-dark)"
        strokeWidth="1.4"
      />
      <polygon
        points={`48,${height * 0.56} ${width * 0.5},${height * 0.16} ${width - 48},${height * 0.56} ${width * 0.5},${height * 0.94}`}
        fill="var(--iso-ground-base)"
        stroke="var(--stone-dark)"
        strokeWidth="1.8"
      />

      {/* İç Avlu Taş Çerçeve Şeridi */}
      <polygon
        points={`88,${height * 0.56} ${width * 0.5},${height * 0.21} ${width - 88},${height * 0.56} ${width * 0.5},${height * 0.89}`}
        fill="none"
        stroke="var(--stone-mid)"
        strokeWidth="1.3"
        strokeDasharray="6 4"
      />

      {/* Yumuşak Adaçayı Yeşili Çim Adaları (İzometrik Elipsler) */}
      <ellipse
        cx={width * 0.26}
        cy={height * 0.55}
        rx={width * 0.11}
        ry={height * 0.095}
        fill="var(--courtyard-sage-soft)"
        stroke="var(--courtyard-sage-mid)"
        strokeWidth="1.2"
      />
      <ellipse
        cx={width * 0.74}
        cy={height * 0.55}
        rx={width * 0.11}
        ry={height * 0.095}
        fill="var(--courtyard-sage-soft)"
        stroke="var(--courtyard-sage-mid)"
        strokeWidth="1.2"
      />
      <ellipse
        cx={width * 0.5}
        cy={height * 0.31}
        rx={width * 0.17}
        ry={height * 0.09}
        fill="var(--courtyard-sage-soft)"
        opacity="0.72"
      />

      {/* Merkez Sekiz Köşeli Yıldız Taş Meydanı (2,5B Perspektif Basamaklı Kaide) */}
      <g>
        {/* Yumuşak Zemin Gölgesi */}
        <ellipse
          cx={plazaCx + 4}
          cy={plazaCy + 8}
          rx="86"
          ry="44"
          fill="var(--iso-shadow)"
          opacity="0.1"
        />
        {/* Dış Taş Basamak */}
        <ellipse
          cx={plazaCx}
          cy={plazaCy + 4}
          rx="84"
          ry="42"
          fill="var(--stone-mid)"
          stroke="var(--stone-dark)"
          strokeWidth="1.5"
        />
        {/* Ana Meydan Taş Yüzeyi */}
        <ellipse
          cx={plazaCx}
          cy={plazaCy}
          rx="80"
          ry="39"
          fill="var(--iso-ground-plaza)"
          stroke="var(--stone-dark)"
          strokeWidth="1.6"
        />
        <ellipse
          cx={plazaCx}
          cy={plazaCy}
          rx="62"
          ry="29"
          fill="none"
          stroke="var(--seljuk-teal)"
          strokeWidth="1.3"
          opacity="0.65"
        />

        {/* Perspektifte Hafif Yatırılmış Merkez Selçuklu Yıldızı */}
        <g transform={`translate(${plazaCx}, ${plazaCy}) scale(1, 0.56) translate(${-plazaCx}, ${-plazaCy})`}>
          <SeljukStarMotif
            cx={plazaCx}
            cy={plazaCy}
            radius={28}
            fill="var(--seljuk-teal)"
            stroke="var(--seljuk-navy)"
            innerFill="var(--sandstone-gold-soft)"
            accentFill="var(--terracotta)"
            variant="medallion"
          />
        </g>
      </g>
    </g>
  );
}
