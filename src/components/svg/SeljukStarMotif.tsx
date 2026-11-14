interface SeljukStarMotifProps {
  cx: number;
  cy: number;
  radius: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  innerFill?: string;
}

/**
 * Selçuklu taş ve ahşap işçiliğinden esinlenen sekiz köşeli geometrik yıldız motifi.
 * Tüm SVG bileşenlerinde yeniden kullanılabilir temel geometrik bileşen olarak kullanılır.
 */
export function SeljukStarMotif({
  cx,
  cy,
  radius,
  fill = 'var(--seljuk-teal)',
  stroke = 'var(--campus-ink)',
  strokeWidth = 1.5,
  innerFill = 'var(--sandstone-gold-soft)',
}: SeljukStarMotifProps) {
  const half = radius * 0.72;
  const innerRadius = radius * 0.36;

  return (
    <g aria-hidden="true">
      <rect
        x={cx - half}
        y={cy - half}
        width={half * 2}
        height={half * 2}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        rx={1}
      />
      <rect
        x={cx - half}
        y={cy - half}
        width={half * 2}
        height={half * 2}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        rx={1}
        transform={`rotate(45 ${cx} ${cy})`}
      />
      <circle
        cx={cx}
        cy={cy}
        r={innerRadius}
        fill={innerFill}
        stroke={stroke}
        strokeWidth={strokeWidth * 0.8}
      />
    </g>
  );
}
