import { motion } from 'motion/react';
import { SeljukStarMotif } from './SeljukStarMotif';

interface CampusPortalGateSvgProps {
  isOpen: boolean;
  compact?: boolean;
}

/**
 * Anadolu ve Selçuklu taç kapılarından esinlenen özgün kampüs giriş kapısı SVG bileşeni.
 * Tarihî bir yapıyı birebir kopyalamaz; geometrik motifler ve aydınlık kampüs manzarasını birleştirir.
 */
export function CampusPortalGateSvg({ isOpen, compact = false }: CampusPortalGateSvgProps) {
  return (
    <svg
      viewBox="0 0 640 420"
      className={compact ? 'w-full h-auto max-w-md mx-auto' : 'w-full h-auto max-w-2xl mx-auto'}
      role="img"
      aria-label="Anadolu taş işçiliğinden esinlenen kemerli kampüs giriş kapısı ve ardındaki yeşil kampüs avlusu"
    >
      <title>Dijital Eğitim Kampüsü Giriş Kapısı</title>

      {/* Gökyüzü ve Avlu Arka Planı (Kapı açılınca görünür) */}
      <defs>
        <linearGradient id="gateSkyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dff1f7" />
          <stop offset="100%" stopColor="#f6f8fa" />
        </linearGradient>
        <clipPath id="portalInnerArch">
          <path d="M 214 356 L 214 210 Q 214 142 320 120 Q 426 142 426 210 L 426 356 Z" />
        </clipPath>
      </defs>

      {/* Kapı Ardı Kampüs Sahnesi */}
      <g clipPath="url(#portalInnerArch)">
        <rect x="200" y="110" width="240" height="255" fill="url(#gateSkyGrad)" />
        {/* Uzaktaki Modern Kampüs Binaları */}
        <rect
          x="235"
          y="222"
          width="54"
          height="64"
          rx="4"
          fill="var(--campus-surface)"
          stroke="var(--campus-border)"
          strokeWidth="2"
        />
        <rect x="246" y="236" width="12" height="14" rx="2" fill="var(--seljuk-teal-soft)" />
        <rect x="266" y="236" width="12" height="14" rx="2" fill="var(--seljuk-teal-soft)" />
        <rect
          x="348"
          y="214"
          width="62"
          height="72"
          rx="4"
          fill="var(--campus-surface)"
          stroke="var(--campus-border)"
          strokeWidth="2"
        />
        <rect x="362" y="230" width="34" height="12" rx="2" fill="var(--sandstone-gold-soft)" />
        {/* Yeşil Avlu ve Ağaçlar */}
        <ellipse cx="320" cy="316" rx="125" ry="42" fill="var(--courtyard-sage-soft)" />
        <circle cx="242" cy="282" r="18" fill="var(--courtyard-sage)" />
        <circle cx="398" cy="278" r="20" fill="var(--courtyard-sage)" />
        {/* Avlu Yürüyüş Yolu */}
        <path
          d="M 284 356 Q 305 310 320 284 Q 335 310 356 356 Z"
          fill="var(--stone-light)"
          stroke="var(--stone-mid)"
          strokeWidth="1.5"
        />
        {/* Parlak Avlu Işığı */}
        <circle cx="320" cy="176" r="20" fill="var(--sandstone-gold-soft)" />
      </g>

      {/* Açılır Sağ ve Sol Kapı Kanatları */}
      <g clipPath="url(#portalInnerArch)">
        <motion.g
          initial={false}
          animate={{
            x: isOpen ? -98 : 0,
            opacity: isOpen ? 0.18 : 1,
          }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <rect
            x="214"
            y="120"
            width="106"
            height="236"
            fill="var(--wood-warm)"
            stroke="var(--wood-deep)"
            strokeWidth="2.5"
          />
          <rect
            x="230"
            y="196"
            width="72"
            height="58"
            rx="4"
            fill="var(--wood-deep)"
            fillOpacity="0.35"
            stroke="var(--sandstone-gold-soft)"
            strokeWidth="1.5"
          />
          <rect
            x="230"
            y="272"
            width="72"
            height="62"
            rx="4"
            fill="var(--wood-deep)"
            fillOpacity="0.35"
            stroke="var(--sandstone-gold-soft)"
            strokeWidth="1.5"
          />
          <circle cx="305" cy="264" r="6" fill="var(--sandstone-gold-soft)" stroke="var(--wood-deep)" strokeWidth="1.5" />
        </motion.g>

        <motion.g
          initial={false}
          animate={{
            x: isOpen ? 98 : 0,
            opacity: isOpen ? 0.18 : 1,
          }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <rect
            x="320"
            y="120"
            width="106"
            height="236"
            fill="var(--wood-warm)"
            stroke="var(--wood-deep)"
            strokeWidth="2.5"
          />
          <rect
            x="338"
            y="196"
            width="72"
            height="58"
            rx="4"
            fill="var(--wood-deep)"
            fillOpacity="0.35"
            stroke="var(--sandstone-gold-soft)"
            strokeWidth="1.5"
          />
          <rect
            x="338"
            y="272"
            width="72"
            height="62"
            rx="4"
            fill="var(--wood-deep)"
            fillOpacity="0.35"
            stroke="var(--sandstone-gold-soft)"
            strokeWidth="1.5"
          />
          <circle cx="335" cy="264" r="6" fill="var(--sandstone-gold-soft)" stroke="var(--wood-deep)" strokeWidth="1.5" />
        </motion.g>
      </g>

      {/* Taç Kapı Dış Taş Çerçevesi (Anadolu Taş İşçiliği Esintili) */}
      <rect
        x="128"
        y="36"
        width="384"
        height="320"
        rx="8"
        fill="none"
        stroke="var(--stone-dark)"
        strokeWidth="3"
      />
      {/* Sol ve Sağ Taş Sütun/Bordür Blokları */}
      <path
        d="M 128 356 L 128 36 L 512 36 L 512 356 L 426 356 L 426 210 Q 426 142 320 120 Q 214 142 214 210 L 214 356 Z"
        fill="var(--stone-light)"
        stroke="var(--stone-dark)"
        strokeWidth="2.5"
      />

      {/* İç Kemer Taş Silmesi */}
      <path
        d="M 192 356 L 192 204 Q 192 122 320 96 Q 448 122 448 204 L 448 356"
        fill="none"
        stroke="var(--stone-dark)"
        strokeWidth="2.5"
      />
      <path
        d="M 214 356 L 214 210 Q 214 142 320 120 Q 426 142 426 210 L 426 356"
        fill="none"
        stroke="var(--sandstone-gold)"
        strokeWidth="2.5"
      />

      {/* Üst Friz Geometrik Bandı */}
      <rect
        x="144"
        y="48"
        width="352"
        height="34"
        rx="4"
        fill="var(--stone-mid)"
        stroke="var(--stone-dark)"
        strokeWidth="1.5"
      />
      <SeljukStarMotif cx={180} cy={65} radius={12} />
      <SeljukStarMotif cx={250} cy={65} radius={12} fill="var(--sandstone-gold)" />
      <SeljukStarMotif cx={320} cy={65} radius={14} />
      <SeljukStarMotif cx={390} cy={65} radius={12} fill="var(--sandstone-gold)" />
      <SeljukStarMotif cx={460} cy={65} radius={12} />

      {/* Yan Bordür Yıldızları */}
      <SeljukStarMotif cx={160} cy={145} radius={13} fill="var(--seljuk-teal)" />
      <SeljukStarMotif cx={160} cy={225} radius={13} fill="var(--sandstone-gold)" />
      <SeljukStarMotif cx={160} cy={305} radius={13} fill="var(--seljuk-teal)" />

      <SeljukStarMotif cx={480} cy={145} radius={13} fill="var(--seljuk-teal)" />
      <SeljukStarMotif cx={480} cy={225} radius={13} fill="var(--sandstone-gold)" />
      <SeljukStarMotif cx={480} cy={305} radius={13} fill="var(--seljuk-teal)" />

      {/* Zemin Avlu Basamakları */}
      <rect
        x="104"
        y="356"
        width="432"
        height="16"
        rx="3"
        fill="var(--stone-mid)"
        stroke="var(--stone-dark)"
        strokeWidth="2"
      />
      <rect
        x="82"
        y="372"
        width="476"
        height="18"
        rx="3"
        fill="var(--stone-light)"
        stroke="var(--stone-dark)"
        strokeWidth="2"
      />
      {/* Avlu Çim Kenarları */}
      <rect x="24" y="390" width="592" height="12" rx="6" fill="var(--courtyard-sage-soft)" />
    </svg>
  );
}
