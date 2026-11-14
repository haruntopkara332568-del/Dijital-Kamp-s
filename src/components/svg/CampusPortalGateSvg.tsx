import { motion } from 'motion/react';
import { SeljukStarMotif } from './SeljukStarMotif';
import { IsometricCypressTree, IsometricRoundTree } from './LandscapeElementsSvg';

interface CampusPortalGateSvgProps {
  isOpen: boolean;
  compact?: boolean;
}

/**
 * 2,5B hafif izometrik perspektifle güçlendirilmiş Anadolu-Selçuklu esintili Taç Kapı sahnesi.
 * Sol-üstten gelen ışık, sağ yan taş derinliği, ön meydan zemini, basamaklar,
 * alçak taş duvarlar ve çok katmanlı açılış animasyonu içerir.
 * Yalnızca src/styles/globals.css içindeki renk belirteçlerini kullanır.
 */
export function CampusPortalGateSvg({ isOpen, compact = false }: CampusPortalGateSvgProps) {
  return (
    <svg
      viewBox="0 0 720 450"
      className={compact ? 'w-full h-auto max-w-md mx-auto' : 'w-full h-auto max-w-3xl mx-auto'}
      role="img"
      aria-label="Hafif izometrik perspektife sahip Anadolu-Selçuklu taç kapısı, ön meydan basamakları ve ardında açılan aydınlık kampüs avlusu"
    >
      <title>Dijital Eğitim Kampüsü Taç Kapısı</title>

      <defs>
        <linearGradient id="portalSkyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--sky-warm-top)" />
          <stop offset="72%" stopColor="var(--sky-warm-bottom)" />
          <stop offset="100%" stopColor="var(--stone-cream)" />
        </linearGradient>

        <linearGradient id="innerCourtyardSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--sky-warm-top)" />
          <stop offset="100%" stopColor="var(--stone-cream)" />
        </linearGradient>

        <linearGradient id="stoneFacadeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--stone-cream)" />
          <stop offset="60%" stopColor="var(--stone-light)" />
          <stop offset="100%" stopColor="var(--stone-mid)" />
        </linearGradient>

        <linearGradient id="walnutDoorGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--wood-warm)" />
          <stop offset="100%" stopColor="var(--wood-deep)" />
        </linearGradient>

        <clipPath id="portalArchOpening">
          <path d="M 226 356 L 226 216 Q 226 140 338 112 Q 450 140 450 216 L 450 356 Z" />
        </clipPath>
      </defs>

      {/* Arka Plan: Açık Gökyüzü ve Hafif Anadolu Peyzajı (Kapı açılınca yumuşak derinlik geçişi) */}
      <motion.g
        initial={false}
        animate={{ scale: isOpen ? 1.018 : 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ originX: '340px', originY: '220px' }}
      >
        <rect x="0" y="0" width="720" height="450" rx="14" fill="url(#portalSkyGrad)" />
        <circle cx="604" cy="72" r="34" fill="var(--sandstone-gold-soft)" opacity="0.88" />
        <path
          d="M 0 320 Q 150 282 310 306 Q 510 274 720 314 L 720 390 L 0 390 Z"
          fill="var(--courtyard-sage-soft)"
        />
      </motion.g>

      {/* Ön Avlu Meydan Zemini (2,5B Perspektif Taş Zemin ve Yumuşak Sağ-Alt Gölge) */}
      <polygon
        points="0,350 720,350 720,450 0,450"
        fill="var(--iso-ground-base)"
      />
      <polygon
        points="210,350 470,350 618,450 66,450"
        fill="var(--iso-ground-plaza)"
        stroke="var(--stone-mid)"
        strokeWidth="1.4"
      />
      {/* Meydan Taş Derzleri */}
      <line x1="158" y1="392" x2="528" y2="392" stroke="var(--stone-mid)" strokeWidth="1.2" />
      <line x1="112" y1="422" x2="574" y2="422" stroke="var(--stone-mid)" strokeWidth="1.2" />
      <line x1="340" y1="352" x2="340" y2="450" stroke="var(--stone-mid)" strokeWidth="1.1" strokeDasharray="6 5" />

      {/* Taç Kapı Sağ-Alta Düşen 2,5B Zemin Gölgesi */}
      <polygon
        points="550,356 592,334 654,378 594,404"
        fill="var(--iso-shadow)"
        opacity="0.12"
      />

      {/* Alçak İzometrik Yan Avlu Taş Duvarları (Sol ve Sağ) */}
      <g>
        {/* Sol Duvar */}
        <polygon
          points="16,322 126,296 126,356 16,374"
          fill="var(--stone-light)"
          stroke="var(--stone-deep)"
          strokeWidth="1.6"
        />
        <polygon
          points="12,316 126,290 132,296 18,322"
          fill="var(--stone-cream)"
          stroke="var(--stone-deep)"
          strokeWidth="1.3"
        />
        {/* Sağ Duvar (Hafif Gölgede) */}
        <polygon
          points="584,310 704,334 704,386 584,356"
          fill="var(--stone-shade)"
          stroke="var(--stone-deep)"
          strokeWidth="1.6"
        />
        <polygon
          points="578,306 704,328 708,334 584,312"
          fill="var(--stone-mid)"
          stroke="var(--stone-deep)"
          strokeWidth="1.3"
        />
      </g>

      {/* Sol ve Sağ Peyzaj Ağaçları */}
      <IsometricCypressTree x={68} y={346} scale={1.15} />
      <IsometricRoundTree x={102} y={368} scale={0.95} />
      <IsometricCypressTree x={644} y={356} scale={1.15} />
      <IsometricRoundTree x={612} y={380} scale={0.92} />

      {/* 2,5B TAÇ KAPI ANA MİMARİ KÜTLESİ */}
      <g>
        {/* Sağ Yan 2,5B Perspektif Derinlik Duvarı (Sağ-Alt Koyu Gölge Yüzü) */}
        <polygon
          points="546,42 586,62 586,336 546,356"
          fill="var(--stone-shade)"
          stroke="var(--stone-deep)"
          strokeWidth="2"
        />
        {/* Sağ Yan Üst Friz Uzantısı */}
        <polygon
          points="546,52 586,72 586,104 546,88"
          fill="var(--seljuk-navy-shade)"
          stroke="var(--seljuk-navy-deep)"
          strokeWidth="1.6"
        />
        {/* Sağ Yan Taş Derzleri */}
        <line x1="546" y1="146" x2="586" y2="164" stroke="var(--stone-dark)" strokeWidth="1.2" />
        <line x1="546" y1="208" x2="586" y2="224" stroke="var(--stone-dark)" strokeWidth="1.2" />
        <line x1="546" y1="272" x2="586" y2="286" stroke="var(--stone-dark)" strokeWidth="1.2" />

        {/* Üst Basamaklı Selçuklu Taç Tepeliği (2,5B Kalınlıklı) */}
        <polygon
          points="244,18 436,18 468,32 276,32"
          fill="var(--stone-cream)"
          stroke="var(--stone-deep)"
          strokeWidth="1.6"
        />
        <path
          d="M 152 42 L 182 42 L 182 28 L 244 28 L 244 18 L 436 18 L 436 28 L 498 28 L 498 42 L 546 42 L 546 54 L 130 54 L 130 42 Z"
          fill="var(--stone-mid)"
          stroke="var(--stone-deep)"
          strokeWidth="2"
        />
        <polygon
          points="546,42 586,62 586,74 546,54"
          fill="var(--stone-dark)"
          stroke="var(--stone-deep)"
          strokeWidth="1.5"
        />
        <rect x="262" y="24" width="156" height="11" rx="2" fill="var(--seljuk-navy)" />
        <rect x="276" y="27" width="128" height="5" rx="1" fill="var(--seljuk-teal)" />

        {/* Ana Taç Kapı Ön Taş Cephesi (İç Kemer Açıklığı Hariç) */}
        <path
          d="M 130 356 L 130 44 L 546 44 L 546 356 L 450 356 L 450 216 Q 450 140 338 112 Q 226 140 226 216 L 226 356 Z"
          fill="url(#stoneFacadeGrad)"
          stroke="var(--stone-deep)"
          strokeWidth="2.4"
        />

        {/* İnce Yatay Taş İşçiliği Derz Çizgileri */}
        <g stroke="var(--stone-mid)" strokeWidth="1.1" opacity="0.85">
          <line x1="132" y1="98" x2="544" y2="98" />
          <line x1="132" y1="140" x2="275" y2="140" />
          <line x1="401" y1="140" x2="544" y2="140" />
          <line x1="132" y1="184" x2="232" y2="184" />
          <line x1="444" y1="184" x2="544" y2="184" />
          <line x1="132" y1="228" x2="225" y2="228" />
          <line x1="451" y1="228" x2="544" y2="228" />
          <line x1="132" y1="274" x2="225" y2="274" />
          <line x1="451" y1="274" x2="544" y2="274" />
          <line x1="132" y1="316" x2="225" y2="316" />
          <line x1="451" y1="316" x2="544" y2="316" />
        </g>

        {/* Üst Lacivert-Turkuaz Geometrik Friz Kuşağı */}
        <rect
          x="140"
          y="54"
          width="396"
          height="34"
          rx="3"
          fill="var(--seljuk-navy)"
          stroke="var(--seljuk-navy-deep)"
          strokeWidth="1.8"
        />
        <rect
          x="146"
          y="59"
          width="384"
          height="24"
          rx="2"
          fill="none"
          stroke="var(--seljuk-teal)"
          strokeWidth="1.3"
        />
        <SeljukStarMotif cx={180} cy={71} radius={10.5} fill="var(--seljuk-teal)" stroke="var(--stone-cream)" />
        <SeljukStarMotif cx={256} cy={71} radius={10.5} fill="var(--terracotta)" stroke="var(--stone-cream)" />
        <SeljukStarMotif cx={338} cy={71} radius={12.5} fill="var(--sandstone-gold)" stroke="var(--stone-cream)" variant="medallion" />
        <SeljukStarMotif cx={420} cy={71} radius={10.5} fill="var(--terracotta)" stroke="var(--stone-cream)" />
        <SeljukStarMotif cx={496} cy={71} radius={10.5} fill="var(--seljuk-teal)" stroke="var(--stone-cream)" />

        {/* Sol ve Sağ Dikey Taş Bordür Pilonları + Nişler */}
        <rect x="142" y="100" width="42" height="246" rx="2" fill="var(--stone-light)" stroke="var(--stone-dark)" strokeWidth="1.5" />
        <rect x="492" y="100" width="42" height="246" rx="2" fill="var(--stone-light)" stroke="var(--stone-dark)" strokeWidth="1.5" />

        <path d="M 150 262 L 150 192 Q 163 176 176 192 L 176 262 Z" fill="var(--stone-mid)" stroke="var(--stone-deep)" strokeWidth="1.4" />
        <path d="M 154 258 L 154 198 Q 163 186 172 198 L 172 258 Z" fill="var(--seljuk-navy-soft)" stroke="var(--seljuk-navy)" strokeWidth="1.2" />
        <SeljukStarMotif cx={163} cy={136} radius={11.5} fill="var(--seljuk-teal)" />
        <SeljukStarMotif cx={163} cy={224} radius={8.5} fill="var(--terracotta)" />
        <SeljukStarMotif cx={163} cy={306} radius={11.5} fill="var(--sandstone-gold)" />

        <path d="M 500 262 L 500 192 Q 513 176 526 192 L 526 262 Z" fill="var(--stone-mid)" stroke="var(--stone-deep)" strokeWidth="1.4" />
        <path d="M 504 258 L 504 198 Q 513 186 522 198 L 522 258 Z" fill="var(--seljuk-navy-soft)" stroke="var(--seljuk-navy)" strokeWidth="1.2" />
        <SeljukStarMotif cx={513} cy={136} radius={11.5} fill="var(--seljuk-teal)" />
        <SeljukStarMotif cx={513} cy={224} radius={8.5} fill="var(--terracotta)" />
        <SeljukStarMotif cx={513} cy={306} radius={11.5} fill="var(--sandstone-gold)" />

        {/* Kemer Köşelikleri */}
        <path
          d="M 192 178 L 192 100 L 316 100 Q 222 122 192 178 Z"
          fill="var(--seljuk-teal-soft)"
          stroke="var(--seljuk-teal)"
          strokeWidth="1.5"
        />
        <path
          d="M 484 178 L 484 100 L 360 100 Q 454 122 484 178 Z"
          fill="var(--seljuk-teal-soft)"
          stroke="var(--seljuk-teal)"
          strokeWidth="1.5"
        />
        <SeljukStarMotif cx={224} cy={123} radius={9.5} fill="var(--seljuk-navy)" stroke="var(--stone-cream)" />
        <SeljukStarMotif cx={452} cy={123} radius={9.5} fill="var(--seljuk-navy)" stroke="var(--stone-cream)" />

        {/* Kademeli Sivri Kemer Nişi */}
        <path d="M 192 356 L 192 208 Q 192 118 338 92 Q 484 118 484 208 L 484 356" fill="none" stroke="var(--stone-deep)" strokeWidth="2.8" />
        <path d="M 204 356 L 204 212 Q 204 128 338 100 Q 472 128 472 212 L 472 356" fill="none" stroke="var(--terracotta)" strokeWidth="3" />
        <path d="M 215 356 L 215 214 Q 215 135 338 106 Q 461 135 461 214 L 461 356" fill="none" stroke="var(--seljuk-navy)" strokeWidth="2.4" />
        <polygon points="329,88 347,88 343,110 333,110" fill="var(--sandstone-gold-soft)" stroke="var(--seljuk-navy)" strokeWidth="1.5" />
      </g>

      {/* Kapı Ardı Aydınlık 2,5B Kampüs Avlusu (Açılışta İleri Doğru Belirir) */}
      <g clipPath="url(#portalArchOpening)">
        <motion.g
          initial={false}
          animate={{
            scale: isOpen ? 1.04 : 0.96,
            opacity: isOpen ? 1 : 0.85,
          }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          style={{ originX: '338px', originY: '260px' }}
        >
          <rect x="220" y="106" width="236" height="254" fill="url(#innerCourtyardSky)" />
          <circle cx="338" cy="172" r="24" fill="var(--sandstone-gold-soft)" opacity="0.95" />
          <path d="M 215 278 Q 278 250 338 268 Q 398 250 460 278 L 460 360 L 215 360 Z" fill="var(--courtyard-sage-soft)" />

          {/* İç Avludaki 2,5B Öğrenme Binaları Silüetleri */}
          <g>
            <rect x="238" y="218" width="52" height="54" rx="2" fill="var(--stone-cream)" stroke="var(--stone-deep)" strokeWidth="1.5" />
            <polygon points="290,218 302,224 302,272 290,272" fill="var(--stone-shade)" stroke="var(--stone-deep)" strokeWidth="1.2" />
            <path d="M 234 218 L 264 198 L 294 218 Z" fill="var(--terracotta)" stroke="var(--seljuk-navy)" strokeWidth="1.3" />

            <rect x="378" y="210" width="54" height="62" rx="2" fill="var(--stone-light)" stroke="var(--seljuk-navy)" strokeWidth="1.5" />
            <polygon points="432,210 444,216 444,272 432,272" fill="var(--stone-shade)" stroke="var(--seljuk-navy)" strokeWidth="1.2" />
            <rect x="378" y="210" width="54" height="9" fill="var(--seljuk-navy)" />
            <path d="M 390 250 L 390 232 Q 396 226 402 232 L 402 250 Z" fill="var(--seljuk-teal-soft)" stroke="var(--seljuk-teal)" strokeWidth="1.2" />
            <path d="M 412 250 L 412 232 Q 418 226 424 232 L 424 250 Z" fill="var(--seljuk-teal-soft)" stroke="var(--seljuk-teal)" strokeWidth="1.2" />
          </g>

          <ellipse cx="338" cy="316" rx="124" ry="42" fill="var(--courtyard-sage-soft)" />
          <circle cx="244" cy="280" r="15" fill="var(--courtyard-sage)" />
          <circle cx="432" cy="280" r="16" fill="var(--courtyard-sage-mid)" />

          {/* İç Avlu Taş Yolu */}
          <path d="M 294 356 Q 318 306 332 276 L 344 276 Q 358 306 382 356 Z" fill="var(--iso-ground-plaza)" stroke="var(--stone-dark)" strokeWidth="1.4" />
          <line x1="308" y1="334" x2="368" y2="334" stroke="var(--stone-mid)" strokeWidth="1.2" />
          <line x1="320" y1="312" x2="356" y2="312" stroke="var(--stone-mid)" strokeWidth="1.2" />
        </motion.g>
      </g>

      {/* Açılır Çift Kanatlı Ahşap Taç Kapı Kanatları */}
      <g clipPath="url(#portalArchOpening)">
        <motion.g
          initial={false}
          animate={{
            x: isOpen ? -104 : 0,
            opacity: isOpen ? 0.12 : 1,
          }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <rect x="226" y="112" width="112" height="244" fill="url(#walnutDoorGrad)" stroke="var(--wood-deep)" strokeWidth="2.4" />
          <rect x="244" y="188" width="76" height="68" rx="3" fill="var(--wood-deep)" fillOpacity="0.34" stroke="var(--sandstone-gold-soft)" strokeWidth="1.5" />
          <SeljukStarMotif cx={282} cy={222} radius={16} fill="var(--terracotta)" stroke="var(--sandstone-gold-soft)" innerFill="var(--stone-cream)" />
          <rect x="244" y="270" width="76" height="68" rx="3" fill="var(--wood-deep)" fillOpacity="0.34" stroke="var(--sandstone-gold-soft)" strokeWidth="1.5" />
          <circle cx="320" cy="264" r="7" fill="none" stroke="var(--sandstone-gold-soft)" strokeWidth="2.4" />
          <circle cx="320" cy="258" r="3.4" fill="var(--sandstone-gold)" stroke="var(--wood-deep)" strokeWidth="1.2" />
        </motion.g>

        <motion.g
          initial={false}
          animate={{
            x: isOpen ? 104 : 0,
            opacity: isOpen ? 0.12 : 1,
          }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <rect x="338" y="112" width="112" height="244" fill="url(#walnutDoorGrad)" stroke="var(--wood-deep)" strokeWidth="2.4" />
          <rect x="356" y="188" width="76" height="68" rx="3" fill="var(--wood-deep)" fillOpacity="0.34" stroke="var(--sandstone-gold-soft)" strokeWidth="1.5" />
          <SeljukStarMotif cx={394} cy={222} radius={16} fill="var(--terracotta)" stroke="var(--sandstone-gold-soft)" innerFill="var(--stone-cream)" />
          <rect x="356" y="270" width="76" height="68" rx="3" fill="var(--wood-deep)" fillOpacity="0.34" stroke="var(--sandstone-gold-soft)" strokeWidth="1.5" />
          <circle cx="356" cy="264" r="7" fill="none" stroke="var(--sandstone-gold-soft)" strokeWidth="2.4" />
          <circle cx="356" cy="258" r="3.4" fill="var(--sandstone-gold)" stroke="var(--wood-deep)" strokeWidth="1.2" />
        </motion.g>
      </g>

      {/* İç Kemer Altın-Taş Silmesi */}
      <path d="M 226 356 L 226 216 Q 226 140 338 112 Q 450 140 450 216 L 450 356" fill="none" stroke="var(--sandstone-gold)" strokeWidth="2.6" />

      {/* Ön Taş Basamaklar (2,5B Perspektif Yamuk Basamaklar + Kalınlık) */}
      <g>
        {/* Üst Basamak */}
        <polygon points="126,356 546,356 566,370 112,370" fill="var(--stone-cream)" stroke="var(--stone-deep)" strokeWidth="1.6" />
        <polygon points="112,370 566,370 566,378 112,378" fill="var(--stone-mid)" stroke="var(--stone-deep)" strokeWidth="1.5" />

        {/* Alt Basamak */}
        <polygon points="104,378 574,378 594,394 88,394" fill="var(--stone-light)" stroke="var(--stone-deep)" strokeWidth="1.6" />
        <polygon points="88,394 594,394 594,404 88,404" fill="var(--stone-shade)" stroke="var(--stone-deep)" strokeWidth="1.5" />

        <line x1="230" y1="356" x2="222" y2="394" stroke="var(--stone-dark)" strokeWidth="1.1" />
        <line x1="338" y1="356" x2="338" y2="394" stroke="var(--stone-dark)" strokeWidth="1.1" />
        <line x1="446" y1="356" x2="454" y2="394" stroke="var(--stone-dark)" strokeWidth="1.1" />
      </g>
    </svg>
  );
}
