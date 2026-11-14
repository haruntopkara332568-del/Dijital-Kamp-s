export interface IsometricPathSegment {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width?: number;
}

interface IsometricPathSvgProps {
  segments: IsometricPathSegment[];
}

/**
 * Yalnızca ince çizgi değil; taş bordürlü, derinlikli 2,5B taş döşeli yürüyüş yolları.
 * Yalnızca src/styles/globals.css renk belirteçlerini kullanır.
 */
export function IsometricPathSvg({ segments }: IsometricPathSvgProps) {
  return (
    <g aria-hidden="true">
      {/* Alt Taş Bordür Gölgesi */}
      {segments.map((seg) => (
        <line
          key={`${seg.id}-curb`}
          x1={seg.x1}
          y1={seg.y1 + 2}
          x2={seg.x2}
          y2={seg.y2 + 2}
          stroke="var(--stone-dark)"
          strokeWidth={(seg.width ?? 24) + 5}
          strokeLinecap="round"
        />
      ))}

      {/* Krem-Bej Taş Döşeli Yol Yüzeyi */}
      {segments.map((seg) => (
        <line
          key={`${seg.id}-surface`}
          data-path-id={seg.id}
          x1={seg.x1}
          y1={seg.y1}
          x2={seg.x2}
          y2={seg.y2}
          stroke="var(--stone-light)"
          strokeWidth={seg.width ?? 24}
          strokeLinecap="round"
        />
      ))}

      {/* Orta Taş Derz ve Yön İzleri */}
      {segments.map((seg) => (
        <line
          key={`${seg.id}-joint`}
          x1={seg.x1}
          y1={seg.y1}
          x2={seg.x2}
          y2={seg.y2}
          stroke="var(--stone-mid)"
          strokeWidth="2.2"
          strokeDasharray="6 7"
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}
