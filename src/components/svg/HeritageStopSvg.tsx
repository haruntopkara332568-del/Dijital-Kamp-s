import { SeljukStarMotif } from './SeljukStarMotif';

export type HeritageStopVariant = 'sultanhani' | 'egri-minare' | 'zinciriye' | 'ihlara';

interface HeritageStopSvgProps {
  variant: HeritageStopVariant;
  title?: string;
  className?: string;
}

/**
 * Aksaray Kültürel Miras Rotası için sadeleştirilmiş özgün SVG durak çizimleri.
 * Yalnızca src/styles/globals.css içindeki tasarım renk belirteçlerini kullanır.
 */
export function HeritageStopSvg({
  variant,
  title,
  className = 'w-full h-40',
}: HeritageStopSvgProps) {
  const defaultTitle =
    variant === 'sultanhani'
      ? 'Sultanhanı Kervansarayı'
      : variant === 'egri-minare'
        ? 'Eğri Minare'
        : variant === 'zinciriye'
          ? 'Zinciriye Medresesi'
          : 'Ihlara Vadisi ve Melendiz Çayı';

  const label = title ?? defaultTitle;

  return (
    <svg viewBox="0 0 220 180" className={className} role="img" aria-label={label}>
      <title>{label}</title>

      {variant === 'sultanhani' && (
        <g>
          {/* Gökyüzü ve taş zemin */}
          <rect x="12" y="12" width="196" height="156" rx="10" fill="var(--sky-warm-top)" />
          <rect x="12" y="138" width="196" height="30" rx="4" fill="var(--stone-light)" />
          {/* Dış taş sur duvarı ve payandalar */}
          <rect
            x="24"
            y="64"
            width="172"
            height="78"
            rx="3"
            fill="var(--stone-cream)"
            stroke="var(--stone-deep)"
            strokeWidth="2"
          />
          <rect x="30" y="58" width="14" height="84" rx="2" fill="var(--stone-mid)" stroke="var(--stone-deep)" strokeWidth="1.5" />
          <rect x="176" y="58" width="14" height="84" rx="2" fill="var(--stone-mid)" stroke="var(--stone-deep)" strokeWidth="1.5" />
          {/* Avlu içi köşk mescit silueti (arka planda) */}
          <rect x="92" y="34" width="36" height="22" rx="2" fill="var(--stone-light)" stroke="var(--stone-deep)" strokeWidth="1.4" />
          <polygon points="88,34 110,20 132,34" fill="var(--seljuk-navy)" />
          {/* Anıtsal Selçuklu Taç Kapısı */}
          <rect
            x="66"
            y="42"
            width="88"
            height="100"
            rx="3"
            fill="var(--stone-light)"
            stroke="var(--stone-deep)"
            strokeWidth="2.2"
          />
          <rect x="72" y="48" width="76" height="14" fill="var(--seljuk-navy)" />
          <SeljukStarMotif cx={86} cy={55} radius={4.5} fill="var(--seljuk-teal)" stroke="var(--stone-cream)" />
          <SeljukStarMotif cx={110} cy={55} radius={5.5} fill="var(--sandstone-gold)" stroke="var(--stone-cream)" />
          <SeljukStarMotif cx={134} cy={55} radius={4.5} fill="var(--seljuk-teal)" stroke="var(--stone-cream)" />
          {/* Sivri kemerli derin giriş nişi */}
          <path
            d="M 86 142 L 86 96 Q 86 74 110 66 Q 134 74 134 96 L 134 142 Z"
            fill="var(--wood-warm)"
            stroke="var(--terracotta)"
            strokeWidth="2.4"
          />
          <line x1="110" y1="68" x2="110" y2="142" stroke="var(--wood-deep)" strokeWidth="1.8" />
          <SeljukStarMotif cx={79} cy={106} radius={4.8} fill="var(--terracotta)" />
          <SeljukStarMotif cx={141} cy={106} radius={4.8} fill="var(--terracotta)" />
          <rect x="58" y="142" width="104" height="8" rx="2" fill="var(--stone-mid)" stroke="var(--stone-deep)" strokeWidth="1.5" />
        </g>
      )}

      {variant === 'egri-minare' && (
        <g>
          <rect x="12" y="12" width="196" height="156" rx="10" fill="var(--sky-warm-top)" />
          <rect x="12" y="138" width="196" height="30" rx="4" fill="var(--stone-light)" />
          {/* Uzak tepe ve avlu duvarı */}
          <path d="M 12 138 Q 62 118 112 138 Z" fill="var(--courtyard-sage-soft)" />
          <rect x="28" y="122" width="56" height="22" rx="2" fill="var(--stone-cream)" stroke="var(--stone-deep)" strokeWidth="1.5" />
          {/* Dört köşe taş kaide */}
          <rect
            x="92"
            y="112"
            width="40"
            height="34"
            rx="2"
            fill="var(--stone-mid)"
            stroke="var(--stone-deep)"
            strokeWidth="2"
          />
          {/* Hafif eğimli kırmızı tuğla gövde */}
          <g transform="rotate(-4.5 112 114)">
            <rect
              x="96"
              y="40"
              width="32"
              height="74"
              rx="3"
              fill="var(--terracotta)"
              stroke="var(--terracotta-shade)"
              strokeWidth="2"
            />
            {/* Alt zikzak tuğla bandı ve üst çini mozaik bandı */}
            <polyline
              points="98,96 105,88 112,96 119,88 126,96"
              fill="none"
              stroke="var(--sandstone-gold-soft)"
              strokeWidth="2"
            />
            <rect x="96" y="48" width="32" height="12" fill="var(--seljuk-teal)" stroke="var(--seljuk-navy)" strokeWidth="1.2" />
            <SeljukStarMotif cx={112} cy={54} radius={4.2} fill="var(--stone-cream)" />
            {/* Şerefe ve petek */}
            <rect x="90" y="34" width="44" height="8" rx="2" fill="var(--stone-cream)" stroke="var(--stone-deep)" strokeWidth="1.6" />
            <rect x="100" y="20" width="24" height="14" rx="2" fill="var(--terracotta-shade)" stroke="var(--stone-deep)" strokeWidth="1.4" />
            <polygon points="99,20 112,8 125,20" fill="var(--seljuk-navy)" />
          </g>
        </g>
      )}

      {variant === 'zinciriye' && (
        <g>
          <rect x="12" y="12" width="196" height="156" rx="10" fill="var(--stone-cream)" />
          <rect x="12" y="138" width="196" height="30" rx="4" fill="var(--stone-light)" />
          {/* Dendaneli (dişli) dış cephe ve avlu yapısı */}
          <rect
            x="24"
            y="60"
            width="172"
            height="82"
            rx="3"
            fill="var(--stone-light)"
            stroke="var(--stone-deep)"
            strokeWidth="2"
          />
          {/* Üst dendaneler (kale görünümü veren taş dişler) */}
          <rect x="28" y="50" width="14" height="10" fill="var(--stone-mid)" stroke="var(--stone-deep)" strokeWidth="1.4" />
          <rect x="48" y="50" width="14" height="10" fill="var(--stone-mid)" stroke="var(--stone-deep)" strokeWidth="1.4" />
          <rect x="158" y="50" width="14" height="10" fill="var(--stone-mid)" stroke="var(--stone-deep)" strokeWidth="1.4" />
          <rect x="178" y="50" width="14" height="10" fill="var(--stone-mid)" stroke="var(--stone-deep)" strokeWidth="1.4" />
          {/* Yan revak kemerleri */}
          <path d="M 38 142 L 38 100 Q 50 86 62 100 L 62 142 Z" fill="var(--stone-cream)" stroke="var(--stone-deep)" strokeWidth="1.8" />
          <path d="M 158 142 L 158 100 Q 170 86 182 100 L 182 142 Z" fill="var(--stone-cream)" stroke="var(--stone-deep)" strokeWidth="1.8" />
          {/* Merkez taç kapı ve eyvan kemeri */}
          <rect x="74" y="38" width="72" height="104" rx="3" fill="var(--stone-mid)" stroke="var(--stone-deep)" strokeWidth="2" />
          <rect x="78" y="42" width="64" height="13" fill="var(--seljuk-navy)" />
          <SeljukStarMotif cx={110} cy={48.5} radius={5} fill="var(--sandstone-gold)" stroke="var(--stone-cream)" />
          <path
            d="M 88 142 L 88 90 Q 110 66 132 90 L 132 142 Z"
            fill="var(--seljuk-teal-soft)"
            stroke="var(--seljuk-teal)"
            strokeWidth="2.2"
          />
          {/* Kapı kemeri üzerindeki simgesel zincir motifi */}
          <path
            d="M 94 94 Q 110 105 126 94"
            fill="none"
            stroke="var(--seljuk-navy)"
            strokeWidth="2"
            strokeDasharray="3 2"
          />
          <rect x="98" y="104" width="24" height="38" rx="2" fill="var(--wood-warm)" stroke="var(--wood-deep)" strokeWidth="1.6" />
        </g>
      )}

      {variant === 'ihlara' && (
        <g>
          <rect x="12" y="12" width="196" height="156" rx="10" fill="var(--sky-warm-top)" />
          {/* Uzak volkanik dağ silueti */}
          <polygon points="74,98 112,34 150,98" fill="var(--stone-mid)" stroke="var(--stone-deep)" strokeWidth="1.5" />
          {/* Sol ve sağ dik kanyon kayalıkları */}
          <polygon
            points="12,56 76,68 92,140 12,152"
            fill="var(--terracotta-soft)"
            stroke="var(--terracotta)"
            strokeWidth="2"
          />
          <polygon
            points="208,52 142,68 128,140 208,152"
            fill="var(--stone-light)"
            stroke="var(--stone-deep)"
            strokeWidth="2"
          />
          {/* Kayaya oyulmuş tarihi açıklıklar / nişler */}
          <path d="M 38 112 L 38 96 Q 46 88 54 96 L 54 112 Z" fill="var(--seljuk-navy)" />
          <path d="M 164 114 L 164 98 Q 172 90 180 98 L 180 114 Z" fill="var(--seljuk-navy)" />
          {/* Yeşil vadi tabanı ve ağaçlar */}
          <path d="M 68 142 Q 110 124 152 142 L 170 168 L 50 168 Z" fill="var(--courtyard-sage-soft)" />
          <circle cx="72" cy="134" r="11" fill="var(--courtyard-sage)" />
          <circle cx="152" cy="132" r="12" fill="var(--courtyard-sage-mid)" />
          {/* Kıvrılarak akan Melendiz Çayı */}
          <path
            d="M 106 108 Q 118 122 102 138 Q 92 152 114 168 L 136 168 Q 114 152 122 138 Q 134 122 118 108 Z"
            fill="var(--seljuk-teal)"
            stroke="var(--seljuk-navy)"
            strokeWidth="1.2"
          />
        </g>
      )}
    </svg>
  );
}
