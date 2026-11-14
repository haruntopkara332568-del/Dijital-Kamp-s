import type { DoorIllustrationKey } from '@/src/types/campus';
import { SeljukStarMotif } from './SeljukStarMotif';

interface DoorIllustrationSvgProps {
  variant: DoorIllustrationKey;
  title?: string;
  className?: string;
}

/**
 * Örnek görev için özgün SVG kapı çizimleri:
 * ev, okul, bahçe, Anadolu motifli kapı ve Door/Gate karşılaştırma çizimleri.
 */
export function DoorIllustrationSvg({
  variant,
  title,
  className = 'w-full h-40',
}: DoorIllustrationSvgProps) {
  const label = title ?? 'Kapı çizimi';

  return (
    <svg
      viewBox="0 0 220 180"
      className={className}
      role="img"
      aria-label={label}
    >
      <title>{label}</title>

      {variant === 'ev' && (
        <g>
          <rect x="16" y="16" width="188" height="148" rx="10" fill="var(--campus-surface-muted)" />
          {/* Ev Duvarı ve Çatı Çizgisi */}
          <rect x="44" y="28" width="132" height="124" rx="4" fill="var(--stone-light)" stroke="var(--stone-dark)" strokeWidth="2" />
          {/* Ahşap Ev Kapısı */}
          <rect x="76" y="48" width="68" height="104" rx="4" fill="var(--wood-warm)" stroke="var(--wood-deep)" strokeWidth="2.5" />
          {/* Üst Küçük Pencere */}
          <rect x="92" y="60" width="36" height="24" rx="3" fill="var(--seljuk-teal-soft)" stroke="var(--wood-deep)" strokeWidth="2" />
          <line x1="110" y1="60" x2="110" y2="84" stroke="var(--wood-deep)" strokeWidth="1.5" />
          {/* Alt Kapı Paneli ve Kolu */}
          <rect x="90" y="96" width="40" height="40" rx="2" fill="var(--wood-deep)" fillOpacity="0.28" stroke="var(--wood-deep)" strokeWidth="1.5" />
          <circle cx="134" cy="102" r="4" fill="var(--sandstone-gold-soft)" stroke="var(--wood-deep)" strokeWidth="1.5" />
          {/* Kapı Önü Basamağı */}
          <rect x="64" y="152" width="92" height="10" rx="2" fill="var(--stone-mid)" stroke="var(--stone-dark)" strokeWidth="1.5" />
        </g>
      )}

      {variant === 'okul' && (
        <g>
          <rect x="16" y="16" width="188" height="148" rx="10" fill="var(--campus-surface-muted)" />
          {/* Okul Cephesi */}
          <rect x="30" y="34" width="160" height="118" rx="4" fill="var(--campus-surface)" stroke="var(--campus-border)" strokeWidth="2" />
          {/* Üst Sundurma */}
          <rect x="48" y="44" width="124" height="20" rx="3" fill="var(--seljuk-teal)" stroke="var(--campus-ink)" strokeWidth="1.8" />
          {/* Okul Saati */}
          <circle cx="110" cy="30" r="12" fill="var(--campus-surface)" stroke="var(--campus-ink)" strokeWidth="2" />
          <line x1="110" y1="30" x2="110" y2="23" stroke="var(--campus-ink)" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="110" y1="30" x2="116" y2="32" stroke="var(--campus-ink)" strokeWidth="1.8" strokeLinecap="round" />
          {/* Çift Kanatlı Okul Kapısı */}
          <rect x="62" y="66" width="46" height="86" fill="var(--seljuk-teal-soft)" stroke="var(--seljuk-teal)" strokeWidth="2.5" />
          <rect x="112" y="66" width="46" height="86" fill="var(--seljuk-teal-soft)" stroke="var(--seljuk-teal)" strokeWidth="2.5" />
          <rect x="70" y="76" width="30" height="44" rx="2" fill="var(--campus-surface)" stroke="var(--seljuk-teal)" strokeWidth="1.5" />
          <rect x="120" y="76" width="30" height="44" rx="2" fill="var(--campus-surface)" stroke="var(--seljuk-teal)" strokeWidth="1.5" />
          <rect x="102" y="106" width="4" height="18" rx="2" fill="var(--campus-ink)" />
          <rect x="114" y="106" width="4" height="18" rx="2" fill="var(--campus-ink)" />
          <rect x="50" y="152" width="120" height="10" rx="2" fill="var(--stone-mid)" />
        </g>
      )}

      {variant === 'bahce' && (
        <g>
          <rect x="16" y="16" width="188" height="148" rx="10" fill="#eef7f1" />
          {/* Taş Bahçe Duvarı */}
          <rect x="26" y="88" width="46" height="64" rx="3" fill="var(--stone-mid)" stroke="var(--stone-dark)" strokeWidth="2" />
          <rect x="148" y="88" width="46" height="64" rx="3" fill="var(--stone-mid)" stroke="var(--stone-dark)" strokeWidth="2" />
          {/* Yeşil Çalı ve Yapraklar */}
          <circle cx="48" cy="74" r="18" fill="var(--courtyard-sage)" />
          <circle cx="172" cy="74" r="18" fill="var(--courtyard-sage)" />
          <circle cx="66" cy="82" r="12" fill="var(--courtyard-sage)" opacity="0.85" />
          <circle cx="154" cy="82" r="12" fill="var(--courtyard-sage)" opacity="0.85" />
          {/* Kemerli Ahşap Bahçe Kapısı */}
          <path
            d="M 74 152 L 74 84 Q 110 52 146 84 L 146 152 Z"
            fill="var(--wood-warm)"
            stroke="var(--wood-deep)"
            strokeWidth="2.5"
          />
          <line x1="92" y1="74" x2="92" y2="152" stroke="var(--wood-deep)" strokeWidth="1.5" />
          <line x1="110" y1="68" x2="110" y2="152" stroke="var(--wood-deep)" strokeWidth="1.8" />
          <line x1="128" y1="74" x2="128" y2="152" stroke="var(--wood-deep)" strokeWidth="1.5" />
          <circle cx="102" cy="116" r="4" fill="var(--sandstone-gold-soft)" stroke="var(--wood-deep)" strokeWidth="1.5" />
          <rect x="66" y="152" width="88" height="10" rx="2" fill="var(--stone-light)" />
        </g>
      )}

      {(variant === 'anadolu' || variant === 'campus-gate' || variant === 'courtyard-gate') && (
        <g>
          <rect x="16" y="16" width="188" height="148" rx="10" fill="var(--campus-surface-muted)" />
          {/* Taş İşçilikli Dış Çerçeve */}
          <rect x="44" y="24" width="132" height="128" rx="4" fill="var(--stone-light)" stroke="var(--stone-dark)" strokeWidth="2" />
          {/* İç Kemer */}
          <path
            d="M 72 152 L 72 86 Q 72 58 110 48 Q 148 58 148 86 L 148 152 Z"
            fill="var(--wood-warm)"
            stroke="var(--sandstone-gold)"
            strokeWidth="2.5"
          />
          <line x1="110" y1="48" x2="110" y2="152" stroke="var(--wood-deep)" strokeWidth="2" />
          {/* Geometrik Yıldız Motifleri */}
          <SeljukStarMotif cx={60} cy={46} radius={8} />
          <SeljukStarMotif cx={110} cy={36} radius={8} fill="var(--sandstone-gold)" />
          <SeljukStarMotif cx={160} cy={46} radius={8} />
          <SeljukStarMotif cx={58} cy={110} radius={7} />
          <SeljukStarMotif cx={162} cy={110} radius={7} />
          {/* Kapı Kanat Halkaları */}
          <circle cx="101" cy="108" r="4" fill="var(--sandstone-gold-soft)" stroke="var(--wood-deep)" strokeWidth="1.5" />
          <circle cx="119" cy="108" r="4" fill="var(--sandstone-gold-soft)" stroke="var(--wood-deep)" strokeWidth="1.5" />
          <rect x="34" y="152" width="152" height="10" rx="2" fill="var(--stone-mid)" stroke="var(--stone-dark)" strokeWidth="1.5" />
        </g>
      )}

      {variant === 'indoor-door' && (
        <g>
          <rect x="16" y="16" width="188" height="148" rx="10" fill="var(--campus-surface-muted)" />
          {/* İç Mekân Duvarı */}
          <rect x="34" y="26" width="152" height="126" rx="4" fill="var(--campus-surface)" stroke="var(--campus-border)" strokeWidth="2" />
          {/* Tek Kanatlı İç Kapı (Door) */}
          <rect x="80" y="42" width="60" height="110" rx="3" fill="var(--wood-warm)" stroke="var(--wood-deep)" strokeWidth="2.5" />
          <rect x="90" y="54" width="40" height="36" rx="2" fill="var(--wood-deep)" fillOpacity="0.25" stroke="var(--wood-deep)" strokeWidth="1.5" />
          <rect x="90" y="100" width="40" height="38" rx="2" fill="var(--wood-deep)" fillOpacity="0.25" stroke="var(--wood-deep)" strokeWidth="1.5" />
          <rect x="128" y="96" width="8" height="4" rx="2" fill="var(--sandstone-gold-soft)" stroke="var(--wood-deep)" strokeWidth="1.2" />
          <line x1="34" y1="152" x2="186" y2="152" stroke="var(--stone-dark)" strokeWidth="2.5" />
        </g>
      )}
    </svg>
  );
}
