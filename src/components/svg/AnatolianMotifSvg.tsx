import { SeljukStarMotif } from './SeljukStarMotif';

export type AnatolianMotifVariant =
  | 'seljuk-star'
  | 'stone-arch'
  | 'brick-zigzag'
  | 'tile-medallion';

interface AnatolianMotifSvgProps {
  variant: AnatolianMotifVariant;
  title?: string;
  className?: string;
}

/**
 * Yeniden kullanılabilir Anadolu–Selçuklu geometrik motif SVG bileşeni.
 * Yalnızca src/styles/globals.css tasarım belirteçlerini kullanır; gereksiz süsleme eklemez.
 */
export function AnatolianMotifSvg({
  variant,
  title,
  className = 'w-full h-24',
}: AnatolianMotifSvgProps) {
  return (
    <svg
      viewBox="0 0 180 96"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={className}
    >
      {title && <title>{title}</title>}
      <rect
        x="2"
        y="2"
        width="176"
        height="92"
        rx="12"
        fill="var(--stone-cream)"
        stroke="var(--campus-border)"
        strokeWidth="1.5"
      />

      {variant === 'seljuk-star' && (
        <g>
          <path
            d="M 16 48 H 58 M 122 48 H 164"
            stroke="var(--stone-dark)"
            strokeWidth="1.6"
            strokeDasharray="4 4"
          />
          <SeljukStarMotif cx={90} cy={48} radius={26} variant="medallion" />
        </g>
      )}

      {variant === 'stone-arch' && (
        <g>
          {/* Taş kemer açıklığı ve sade kilit taşı */}
          <path
            d="M 38 82 V 48 C 38 22 142 22 142 48 V 82"
            fill="none"
            stroke="var(--seljuk-navy)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M 48 82 V 49 C 48 30 132 30 132 49 V 82"
            fill="var(--seljuk-teal-soft)"
            stroke="var(--seljuk-teal)"
            strokeWidth="2"
          />
          <polygon
            points="90,14 97,26 90,34 83,26"
            fill="var(--sandstone-gold-soft)"
            stroke="var(--sandstone-gold)"
            strokeWidth="1.5"
          />
          <line x1="24" y1="82" x2="156" y2="82" stroke="var(--stone-dark)" strokeWidth="2.5" />
        </g>
      )}

      {variant === 'brick-zigzag' && (
        <g>
          {/* Anadolu tuğla ve çini kuşak örüntüsü */}
          <rect x="20" y="20" width="140" height="56" rx="6" fill="var(--terracotta-soft)" stroke="var(--terracotta)" strokeWidth="1.5" />
          <path
            d="M 24 38 L 46 24 L 68 38 L 90 24 L 112 38 L 134 24 L 156 38"
            fill="none"
            stroke="var(--terracotta)"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M 24 58 L 46 44 L 68 58 L 90 44 L 112 58 L 134 44 L 156 58"
            fill="none"
            stroke="var(--seljuk-teal)"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <line x1="24" y1="70" x2="156" y2="70" stroke="var(--seljuk-navy)" strokeWidth="2" />
        </g>
      )}

      {variant === 'tile-medallion' && (
        <g>
          {/* Çini madalyon ve köşe üçgenleri */}
          <polygon points="14,14 34,14 14,34" fill="var(--seljuk-teal-soft)" stroke="var(--seljuk-teal)" strokeWidth="1.2" />
          <polygon points="166,14 146,14 166,34" fill="var(--seljuk-teal-soft)" stroke="var(--seljuk-teal)" strokeWidth="1.2" />
          <polygon points="14,82 34,82 14,62" fill="var(--courtyard-sage-soft)" stroke="var(--courtyard-sage)" strokeWidth="1.2" />
          <polygon points="166,82 146,82 166,62" fill="var(--courtyard-sage-soft)" stroke="var(--courtyard-sage)" strokeWidth="1.2" />
          <SeljukStarMotif
            cx={90}
            cy={48}
            radius={22}
            fill="var(--seljuk-navy-soft)"
            stroke="var(--seljuk-navy)"
            innerFill="var(--seljuk-teal-soft)"
            accentFill="var(--sandstone-gold)"
          />
        </g>
      )}
    </svg>
  );
}
