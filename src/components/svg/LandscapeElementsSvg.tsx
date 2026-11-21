/**
 * 2,5B izometrik kampüs peyzaj öğeleri:
 * Sol-üst ışığa göre sağ-alt gölgeli servi ve avlu ağaçları, taş çiçeklikler ve ahşap-taş yön levhası.
 * Yalnızca src/styles/globals.css renk belirteçlerini kullanır.
 */

export function IsometricCypressTree({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} aria-hidden="true">
      {/* Sağ-Alta Uzanan Zemin Gölgesi */}
      <ellipse cx="7" cy="2" rx="11" ry="5" fill="var(--iso-shadow)" opacity="0.14" />
      <rect x="-2.5" y="-12" width="5" height="14" rx="1" fill="var(--wood-deep)" />
      {/* Gövde / Yaprak (Sol Aydınlık, Sağ Koyu Yüz) */}
      <ellipse cx="0" cy="-32" rx="9" ry="23" fill="var(--courtyard-sage)" stroke="var(--courtyard-sage-shade)" strokeWidth="1.2" />
      <path d="M 0 -55 A 9 23 0 0 1 0 -9 Z" fill="var(--courtyard-sage-shade)" opacity="0.32" />
      <ellipse cx="-2.5" cy="-36" rx="3" ry="12" fill="var(--courtyard-sage-mid)" opacity="0.55" />
    </g>
  );
}

export function IsometricRoundTree({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} aria-hidden="true">
      <ellipse cx="7" cy="3" rx="15" ry="6.5" fill="var(--iso-shadow)" opacity="0.14" />
      <rect x="-2.5" y="-10" width="5" height="12" rx="1" fill="var(--wood-deep)" />
      <circle cx="0" cy="-22" r="14" fill="var(--courtyard-sage-mid)" stroke="var(--courtyard-sage)" strokeWidth="1.3" />
      <path d="M 0 -36 A 14 14 0 0 1 0 -8 Z" fill="var(--courtyard-sage)" opacity="0.55" />
      <circle cx="-4" cy="-26" r="5.5" fill="var(--courtyard-sage-soft)" opacity="0.35" />
    </g>
  );
}

export function IsometricSignpost({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`} aria-hidden="true">
      {/* Gölge ve Taş Kaide */}
      <ellipse cx="6" cy="4" rx="14" ry="6" fill="var(--iso-shadow)" opacity="0.14" />
      <polygon
        points="-10,0 0,-5 10,0 0,5"
        fill="var(--stone-mid)"
        stroke="var(--stone-deep)"
        strokeWidth="1.2"
      />
      <rect x="-2.5" y="-74" width="5" height="74" rx="1" fill="var(--wood-deep)" />

      {/* Sol Üst Ok: Hayalden Gerçeğe */}
      <path
        d="M -76 -68 L -1 -68 L -1 -53 L -76 -53 L -83 -60.5 Z"
        fill="var(--campus-surface)"
        stroke="var(--terracotta)"
        strokeWidth="1.4"
      />
      <text x="-40" y="-57.5" textAnchor="middle" fontSize="7.8" fontWeight="700" fill="var(--seljuk-navy)">
        ← Hayalden Gerçeğe
      </text>

      {/* Sağ Orta Ok: Hikâyeden Hayata */}
      <path
        d="M 1 -44 L 76 -44 L 83 -36.5 L 76 -29 L 1 -29 Z"
        fill="var(--seljuk-teal-soft)"
        stroke="var(--seljuk-teal)"
        strokeWidth="1.4"
      />
      <text x="40" y="-33.5" textAnchor="middle" fontSize="7.8" fontWeight="700" fill="var(--seljuk-navy)">
        Hikâyeden Hayata →
      </text>

      {/* Alt Plaka: Merkez Meydan */}
      <rect
        x="-34"
        y="-20"
        width="68"
        height="15"
        rx="2.5"
        fill="var(--sandstone-gold-soft)"
        stroke="var(--sandstone-gold)"
        strokeWidth="1.2"
      />
      <text x="0" y="-9.5" textAnchor="middle" fontSize="7.6" fontWeight="700" fill="var(--terracotta-deep)">
        Merkez Meydan
      </text>
    </g>
  );
}
