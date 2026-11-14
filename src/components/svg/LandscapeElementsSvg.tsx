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
      <rect x="-2.5" y="-52" width="5" height="52" rx="1" fill="var(--wood-deep)" />

      {/* Sol Üst Ok: Gezi ve Keşif */}
      <path
        d="M -62 -46 L 2 -46 L 2 -33 L -62 -33 L -69 -39.5 Z"
        fill="var(--campus-surface)"
        stroke="var(--terracotta)"
        strokeWidth="1.4"
      />
      <text x="-32" y="-36.5" textAnchor="middle" fontSize="8.2" fontWeight="700" fill="var(--seljuk-navy)">
        ← Gezi ve Keşif
      </text>

      {/* Sağ Orta Ok: Kitap ve Hikâye */}
      <path
        d="M -2 -30 L 66 -30 L 73 -23.5 L 66 -17 L -2 -17 Z"
        fill="var(--seljuk-teal-soft)"
        stroke="var(--seljuk-teal)"
        strokeWidth="1.4"
      />
      <text x="34" y="-20.5" textAnchor="middle" fontSize="8.2" fontWeight="700" fill="var(--seljuk-navy)">
        Kitap ve Hikâye →
      </text>

      {/* Alt Plaka: Yıldızlı Meydan */}
      <rect
        x="-30"
        y="-14"
        width="60"
        height="13"
        rx="2"
        fill="var(--sandstone-gold-soft)"
        stroke="var(--sandstone-gold)"
        strokeWidth="1.2"
      />
      <text x="0" y="-4.8" textAnchor="middle" fontSize="7.4" fontWeight="700" fill="var(--terracotta-deep)">
        Merkez Meydan
      </text>
    </g>
  );
}
