interface SeljukStarMotifProps {
  cx: number;
  cy: number;
  radius: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  innerFill?: string;
  accentFill?: string;
  variant?: 'classic' | 'medallion';
}

/**
 * Anadolu-Selçuklu taş ve çini işçiliğinden esinlenen sekiz köşeli geometrik yıldız motifi.
 * Tüm SVG bileşenlerinde yalnızca globals.css renk belirteçleriyle kullanılır.
 */
export function SeljukStarMotif({
  cx,
  cy,
  radius,
  fill = 'var(--seljuk-teal)',
  stroke = 'var(--seljuk-navy)',
  strokeWidth = 1.4,
  innerFill = 'var(--sandstone-gold-soft)',
  accentFill = 'var(--terracotta)',
  variant = 'classic',
}: SeljukStarMotifProps) {
  const half = radius * 0.72;
  const innerHalf = radius * 0.44;
  const centerDot = radius * 0.19;

  return (
    <g aria-hidden="true">
      {variant === 'medallion' && (
        <circle
          cx={cx}
          cy={cy}
          r={radius * 1.15}
          fill="var(--stone-cream)"
          stroke={stroke}
          strokeWidth={strokeWidth * 0.85}
        />
      )}

      {/* İki iç içe döndürülmüş kare ile 8 köşeli Selçuklu yıldızı */}
      <rect
        x={cx - half}
        y={cy - half}
        width={half * 2}
        height={half * 2}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        rx={0.8}
      />
      <rect
        x={cx - half}
        y={cy - half}
        width={half * 2}
        height={half * 2}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        rx={0.8}
        transform={`rotate(45 ${cx} ${cy})`}
      />

      {/* İç sekizgen rozet katmanı */}
      <rect
        x={cx - innerHalf}
        y={cy - innerHalf}
        width={innerHalf * 2}
        height={innerHalf * 2}
        fill={innerFill}
        stroke={stroke}
        strokeWidth={strokeWidth * 0.75}
        rx={0.6}
      />
      <rect
        x={cx - innerHalf}
        y={cy - innerHalf}
        width={innerHalf * 2}
        height={innerHalf * 2}
        fill={innerFill}
        stroke={stroke}
        strokeWidth={strokeWidth * 0.75}
        rx={0.6}
        transform={`rotate(45 ${cx} ${cy})`}
      />

      {/* Merkez çekirdek */}
      <circle
        cx={cx}
        cy={cy}
        r={centerDot}
        fill={accentFill}
        stroke={stroke}
        strokeWidth={strokeWidth * 0.7}
      />
    </g>
  );
}
