import { motion } from 'motion/react';

interface PeerGuideSvgProps {
  mood?: 'welcoming' | 'thinking' | 'celebrating';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Kampüs Arkadaşı: Anadolu-Selçuklu kemer madalyonu içinde yer alan,
 * ilkokul ve ortaokul öğrencileriyle uyumlu, samimi ama çocuksu olmayan akran rehber SVG karakteri.
 * Yalnızca src/styles/globals.css renk belirteçlerini kullanır.
 */
export function PeerGuideSvg({ mood = 'welcoming', size = 'md' }: PeerGuideSvgProps) {
  const dimensions =
    size === 'sm' ? 'w-14 h-14' : size === 'lg' ? 'w-32 h-32 sm:w-36 sm:h-36' : 'w-24 h-24';

  return (
    <svg
      viewBox="0 0 140 140"
      className={`${dimensions} shrink-0`}
      role="img"
      aria-label="Kampüs Arkadaşı rehber karakteri"
    >
      <title>Kampüs Arkadaşı</title>

      <defs>
        <clipPath id="guideMedallionClip">
          <circle cx="70" cy="70" r="61" />
        </clipPath>
      </defs>

      {/* Lacivert-Turkuaz Çift Halkalı Mimari Madalyon Çerçevesi */}
      <circle
        cx="70"
        cy="70"
        r="65"
        fill="var(--stone-cream)"
        stroke="var(--seljuk-navy)"
        strokeWidth="2.8"
      />
      <circle
        cx="70"
        cy="70"
        r="60"
        fill="var(--seljuk-teal-soft)"
        stroke="var(--seljuk-teal)"
        strokeWidth="1.6"
      />

      {/* Arka Planda Zarif Sivri Kemer Niş Silüeti */}
      <g clipPath="url(#guideMedallionClip)">
        <path
          d="M 28 136 L 28 60 Q 70 22 112 60 L 112 136 Z"
          fill="var(--stone-cream)"
          stroke="var(--stone-mid)"
          strokeWidth="1.6"
        />

        {/* Gövde: Lacivert ve Turkuaz Katmanlı Modern Yelek */}
        <path
          d="M 32 134 Q 37 92 70 92 Q 103 92 108 134 Z"
          fill="var(--seljuk-navy)"
          stroke="var(--seljuk-navy-deep)"
          strokeWidth="2"
        />
        <path
          d="M 46 95 L 66 132 L 74 132 L 94 95"
          fill="none"
          stroke="var(--seljuk-teal)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* İç Krem Gömlek Yaka */}
        <path
          d="M 55 93 L 70 114 L 85 93 Z"
          fill="var(--campus-surface)"
          stroke="var(--seljuk-navy)"
          strokeWidth="1.6"
        />

        {/* Toprak Tonu Anadolu Baklava Rozetleri */}
        <polygon
          points="48,112 53,106 58,112 53,118"
          fill="var(--terracotta)"
          stroke="var(--sandstone-gold-soft)"
          strokeWidth="1.1"
        />
        <polygon
          points="82,112 87,106 92,112 87,118"
          fill="var(--terracotta)"
          stroke="var(--sandstone-gold-soft)"
          strokeWidth="1.1"
        />

        {/* El Sallama / Kutlama Kolu */}
        <motion.g
          initial={false}
          animate={
            mood === 'welcoming'
              ? { rotate: [0, -7, 5, 0] }
              : mood === 'celebrating'
                ? { y: [0, -4, 0] }
                : { rotate: 0 }
          }
          transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2.5 }}
          style={{ originX: '98px', originY: '104px' }}
        >
          <path
            d="M 98 104 Q 113 92 116 76"
            fill="none"
            stroke="var(--seljuk-navy)"
            strokeWidth="9.5"
            strokeLinecap="round"
          />
          <circle
            cx="117"
            cy="73"
            r="6.2"
            fill="var(--skin-warm)"
            stroke="var(--seljuk-navy)"
            strokeWidth="1.7"
          />
        </motion.g>

        {/* Boyun ve Baş */}
        <rect x="63" y="80" width="14" height="14" rx="5" fill="var(--skin-warm)" />
        <circle
          cx="70"
          cy="58"
          r="25"
          fill="var(--skin-warm)"
          stroke="var(--seljuk-navy)"
          strokeWidth="2"
        />

        {/* Saç */}
        <path
          d="M 44 56 Q 44 27 70 27 Q 96 27 96 56 Q 88 43 72 44 Q 54 45 44 56 Z"
          fill="var(--hair-navy)"
          stroke="var(--seljuk-navy)"
          strokeWidth="1.8"
        />

        {/* İfade: Gözler ve Gülümseme */}
        <circle cx="60.5" cy="58" r="2.7" fill="var(--seljuk-navy)" />
        <circle cx="79.5" cy="58" r="2.7" fill="var(--seljuk-navy)" />
        <circle cx="53" cy="64" r="3.3" fill="var(--skin-blush)" opacity="0.6" />
        <circle cx="87" cy="64" r="3.3" fill="var(--skin-blush)" opacity="0.6" />

        {mood === 'thinking' ? (
          <path
            d="M 63 69 Q 70 72 77 68"
            fill="none"
            stroke="var(--seljuk-navy)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M 60 67 Q 70 75 80 67"
            fill="none"
            stroke="var(--seljuk-navy)"
            strokeWidth="2.3"
            strokeLinecap="round"
          />
        )}
      </g>
    </svg>
  );
}
