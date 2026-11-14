import { motion } from 'motion/react';

interface PeerGuideSvgProps {
  mood?: 'welcoming' | 'thinking' | 'celebrating';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Kampüs Arkadaşı: Çocuklara uygun, samimi, yaşa nötr özgün akran rehber SVG karakteri.
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

      {/* Yumuşak Avlu Çerçevesi */}
      <circle
        cx="70"
        cy="70"
        r="64"
        fill="var(--seljuk-teal-soft)"
        stroke="var(--seljuk-teal)"
        strokeWidth="2.5"
      />

      {/* Gövde ve Turkuaz-Sıcak Yelek */}
      <path
        d="M 34 128 Q 38 92 70 92 Q 102 92 106 128 Z"
        fill="var(--seljuk-teal)"
        stroke="var(--campus-ink)"
        strokeWidth="2"
      />
      {/* İç Yakalı Gömlek */}
      <path
        d="M 56 93 L 70 112 L 84 93 Z"
        fill="var(--campus-surface)"
        stroke="var(--campus-ink)"
        strokeWidth="1.8"
      />
      {/* Yelekte Küçük Anadolu Baklava Motifi */}
      <polygon
        points="49,112 54,106 59,112 54,118"
        fill="var(--sandstone-gold-soft)"
        stroke="var(--campus-ink)"
        strokeWidth="1.2"
      />
      <polygon
        points="81,112 86,106 91,112 86,118"
        fill="var(--sandstone-gold-soft)"
        stroke="var(--campus-ink)"
        strokeWidth="1.2"
      />

      {/* El Sallama Kolu */}
      <motion.g
        initial={false}
        animate={
          mood === 'welcoming'
            ? { rotate: [0, -8, 6, 0] }
            : mood === 'celebrating'
              ? { y: [0, -4, 0] }
              : { rotate: 0 }
        }
        transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2.5 }}
        style={{ originX: '100px', originY: '105px' }}
      >
        <path
          d="M 98 104 Q 114 92 117 76"
          fill="none"
          stroke="var(--seljuk-teal)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <circle
          cx="118"
          cy="73"
          r="6.5"
          fill="#f2c6a0"
          stroke="var(--campus-ink)"
          strokeWidth="1.8"
        />
      </motion.g>

      {/* Boyun ve Baş */}
      <rect x="63" y="80" width="14" height="14" rx="5" fill="#f2c6a0" />
      <circle
        cx="70"
        cy="58"
        r="26"
        fill="#f2c6a0"
        stroke="var(--campus-ink)"
        strokeWidth="2"
      />

      {/* Saç */}
      <path
        d="M 43 56 Q 43 27 70 27 Q 97 27 97 56 Q 89 43 72 44 Q 53 45 43 56 Z"
        fill="#2c3545"
        stroke="var(--campus-ink)"
        strokeWidth="1.8"
      />

      {/* Gözler ve Gülümseme */}
      <circle cx="60" cy="58" r="2.8" fill="var(--campus-ink)" />
      <circle cx="80" cy="58" r="2.8" fill="var(--campus-ink)" />
      <circle cx="53" cy="64" r="3.5" fill="#eab39b" opacity="0.65" />
      <circle cx="87" cy="64" r="3.5" fill="#eab39b" opacity="0.65" />

      {mood === 'thinking' ? (
        <path
          d="M 63 69 Q 70 72 77 68"
          fill="none"
          stroke="var(--campus-ink)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M 60 67 Q 70 76 80 67"
          fill="none"
          stroke="var(--campus-ink)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
