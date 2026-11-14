import { motion } from 'motion/react';
import { SeljukStarMotif } from './SeljukStarMotif';

interface CampusPortalGateSvgProps {
  isOpen: boolean;
  compact?: boolean;
}

/**
 * Anadolu ve Selçuklu taç kapılarından esinlenen modern eğitim kampüsü giriş kapısı.
 * Tarihî yapıları birebir kopyalamaz; taş işçiliği, kademeli kemer, geometrik yıldız
 * bordürleri ve aydınlık kampüs avlusunu yalın bir mimari dille birleştirir.
 * Yalnızca src/styles/globals.css içindeki renk belirteçlerini kullanır.
 */
export function CampusPortalGateSvg({ isOpen, compact = false }: CampusPortalGateSvgProps) {
  return (
    <svg
      viewBox="0 0 680 440"
      className={compact ? 'w-full h-auto max-w-md mx-auto' : 'w-full h-auto max-w-2xl mx-auto'}
      role="img"
      aria-label="Anadolu-Selçuklu taş işçiliğinden esinlenen taç kapı ve ardında uzanan aydınlık kampüs avlusu"
    >
      <title>Dijital Eğitim Kampüsü Taç Kapısı</title>

      <defs>
        <linearGradient id="portalSkyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--sky-warm-top)" />
          <stop offset="68%" stopColor="var(--sky-warm-bottom)" />
          <stop offset="100%" stopColor="var(--stone-cream)" />
        </linearGradient>

        <linearGradient id="innerCourtyardSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--sky-warm-top)" />
          <stop offset="100%" stopColor="var(--stone-cream)" />
        </linearGradient>

        <linearGradient id="stoneFacadeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--stone-cream)" />
          <stop offset="55%" stopColor="var(--stone-light)" />
          <stop offset="100%" stopColor="var(--stone-mid)" />
        </linearGradient>

        <linearGradient id="stoneRecessGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--stone-mid)" />
          <stop offset="50%" stopColor="var(--stone-light)" />
          <stop offset="100%" stopColor="var(--stone-mid)" />
        </linearGradient>

        <linearGradient id="walnutDoorGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--wood-warm)" />
          <stop offset="100%" stopColor="var(--wood-deep)" />
        </linearGradient>

        <clipPath id="portalArchOpening">
          <path d="M 226 374 L 226 226 Q 226 146 340 116 Q 454 146 454 226 L 454 374 Z" />
        </clipPath>
      </defs>

      {/* Dış Gökyüzü ve Uzak Anadolu Ufku */}
      <rect x="0" y="0" width="680" height="440" rx="14" fill="url(#portalSkyGrad)" />
      <circle cx="576" cy="76" r="34" fill="var(--sandstone-gold-soft)" opacity="0.85" />
      <path
        d="M 0 344 Q 130 302 260 330 Q 430 296 680 338 L 680 415 L 0 415 Z"
        fill="var(--courtyard-sage-soft)"
      />
      <path
        d="M 0 374 Q 180 352 340 364 Q 520 348 680 372 L 680 440 L 0 440 Z"
        fill="var(--stone-cream)"
      />

      {/* Yan Avlu Duvarları ve Yumuşak Yeşillikler */}
      <rect
        x="22"
        y="314"
        width="106"
        height="66"
        rx="2"
        fill="var(--stone-light)"
        stroke="var(--stone-dark)"
        strokeWidth="1.8"
      />
      <rect x="18" y="308" width="114" height="9" rx="2" fill="var(--stone-mid)" stroke="var(--stone-dark)" strokeWidth="1.4" />
      <rect
        x="552"
        y="314"
        width="106"
        height="66"
        rx="2"
        fill="var(--stone-light)"
        stroke="var(--stone-dark)"
        strokeWidth="1.8"
      />
      <rect x="548" y="308" width="114" height="9" rx="2" fill="var(--stone-mid)" stroke="var(--stone-dark)" strokeWidth="1.4" />

      {/* Avlu Dış Ağaçları */}
      <g>
        <rect x="64" y="294" width="6" height="24" fill="var(--wood-deep)" />
        <ellipse cx="67" cy="264" rx="14" ry="34" fill="var(--courtyard-sage)" />
        <ellipse cx="44" cy="288" rx="16" ry="18" fill="var(--courtyard-sage-mid)" />
        <rect x="610" y="294" width="6" height="24" fill="var(--wood-deep)" />
        <ellipse cx="613" cy="264" rx="14" ry="34" fill="var(--courtyard-sage)" />
        <ellipse cx="636" cy="288" rx="16" ry="18" fill="var(--courtyard-sage-mid)" />
      </g>

      {/* Taç Kapı Ana Taş Kütlesi (Üst Taç ve Yan Pilonlar) */}
      <g>
        {/* Yükseltilmiş Modern Selçuklu Taç Tepeliği */}
        <path
          d="M 150 42 L 182 42 L 182 26 L 246 26 L 246 16 L 434 16 L 434 26 L 498 26 L 498 42 L 530 42 L 530 56 L 150 56 Z"
          fill="var(--stone-mid)"
          stroke="var(--stone-deep)"
          strokeWidth="2"
        />
        <rect x="262" y="22" width="156" height="12" rx="2" fill="var(--seljuk-navy)" />
        <rect x="274" y="25" width="132" height="6" rx="1" fill="var(--seljuk-teal)" />

        {/* Ana Taç Kapı Taş Blok Çerçevesi (İç Kemer Boşluğu Hariç) */}
        <path
          d="M 124 374 L 124 44 L 556 44 L 556 374 L 454 374 L 454 226 Q 454 146 340 116 Q 226 146 226 226 L 226 374 Z"
          fill="url(#stoneFacadeGrad)"
          stroke="var(--stone-deep)"
          strokeWidth="2.4"
        />

        {/* Yatay Taş İşçiliği Derz Çizgileri */}
        <g stroke="var(--stone-mid)" strokeWidth="1.1" opacity="0.85">
          <line x1="126" y1="98" x2="554" y2="98" />
          <line x1="126" y1="142" x2="275" y2="142" />
          <line x1="405" y1="142" x2="554" y2="142" />
          <line x1="126" y1="186" x2="232" y2="186" />
          <line x1="448" y1="186" x2="554" y2="186" />
          <line x1="126" y1="230" x2="225" y2="230" />
          <line x1="455" y1="230" x2="554" y2="230" />
          <line x1="126" y1="276" x2="225" y2="276" />
          <line x1="455" y1="276" x2="554" y2="276" />
          <line x1="126" y1="322" x2="225" y2="322" />
          <line x1="455" y1="322" x2="554" y2="322" />
        </g>

        {/* Üst Lacivert ve Turkuaz Geometrik Friz Kuşağı */}
        <rect
          x="136"
          y="54"
          width="408"
          height="36"
          rx="3"
          fill="var(--seljuk-navy)"
          stroke="var(--seljuk-navy-deep)"
          strokeWidth="1.8"
        />
        <rect
          x="142"
          y="59"
          width="396"
          height="26"
          rx="2"
          fill="none"
          stroke="var(--seljuk-teal)"
          strokeWidth="1.4"
        />
        <SeljukStarMotif cx={178} cy={72} radius={11} fill="var(--seljuk-teal)" stroke="var(--stone-cream)" />
        <SeljukStarMotif cx={256} cy={72} radius={11} fill="var(--terracotta)" stroke="var(--stone-cream)" />
        <SeljukStarMotif cx={340} cy={72} radius={13} fill="var(--sandstone-gold)" stroke="var(--stone-cream)" variant="medallion" />
        <SeljukStarMotif cx={424} cy={72} radius={11} fill="var(--terracotta)" stroke="var(--stone-cream)" />
        <SeljukStarMotif cx={502} cy={72} radius={11} fill="var(--seljuk-teal)" stroke="var(--stone-cream)" />

        {/* Sol ve Sağ Dikey Taş Bordür Şeritleri ve Yan Nişler */}
        <rect
          x="138"
          y="102"
          width="44"
          height="260"
          rx="2"
          fill="var(--stone-light)"
          stroke="var(--stone-dark)"
          strokeWidth="1.6"
        />
        <rect
          x="498"
          y="102"
          width="44"
          height="260"
          rx="2"
          fill="var(--stone-light)"
          stroke="var(--stone-dark)"
          strokeWidth="1.6"
        />

        {/* Sol Niş */}
        <path
          d="M 146 270 L 146 196 Q 160 180 174 196 L 174 270 Z"
          fill="var(--stone-mid)"
          stroke="var(--stone-deep)"
          strokeWidth="1.5"
        />
        <path
          d="M 150 266 L 150 202 Q 160 190 170 202 L 170 266 Z"
          fill="var(--seljuk-navy-soft)"
          stroke="var(--seljuk-navy)"
          strokeWidth="1.2"
        />
        <SeljukStarMotif cx={160} cy={138} radius={12} fill="var(--seljuk-teal)" />
        <SeljukStarMotif cx={160} cy={230} radius={9} fill="var(--terracotta)" />
        <SeljukStarMotif cx={160} cy={318} radius={12} fill="var(--sandstone-gold)" />

        {/* Sağ Niş */}
        <path
          d="M 506 270 L 506 196 Q 520 180 534 196 L 534 270 Z"
          fill="var(--stone-mid)"
          stroke="var(--stone-deep)"
          strokeWidth="1.5"
        />
        <path
          d="M 510 266 L 510 202 Q 520 190 530 202 L 530 266 Z"
          fill="var(--seljuk-navy-soft)"
          stroke="var(--seljuk-navy)"
          strokeWidth="1.2"
        />
        <SeljukStarMotif cx={520} cy={138} radius={12} fill="var(--seljuk-teal)" />
        <SeljukStarMotif cx={520} cy={230} radius={9} fill="var(--terracotta)" />
        <SeljukStarMotif cx={520} cy={318} radius={12} fill="var(--sandstone-gold)" />

        {/* Kemer Köşelikleri (Turkuaz-Toprak Çini Üçgen Alanlar) */}
        <path
          d="M 192 184 L 192 102 L 318 102 Q 222 126 192 184 Z"
          fill="var(--seljuk-teal-soft)"
          stroke="var(--seljuk-teal)"
          strokeWidth="1.5"
        />
        <path
          d="M 488 184 L 488 102 L 362 102 Q 458 126 488 184 Z"
          fill="var(--seljuk-teal-soft)"
          stroke="var(--seljuk-teal)"
          strokeWidth="1.5"
        />
        <SeljukStarMotif cx={224} cy={126} radius={10} fill="var(--seljuk-navy)" stroke="var(--stone-cream)" />
        <SeljukStarMotif cx={456} cy={126} radius={10} fill="var(--seljuk-navy)" stroke="var(--stone-cream)" />

        {/* Kademeli Sivri Kemer Nişi (Dıştan İçe Perspektif Katmanları) */}
        <path
          d="M 192 374 L 192 216 Q 192 122 340 94 Q 488 122 488 216 L 488 374"
          fill="none"
          stroke="var(--stone-deep)"
          strokeWidth="3"
        />
        <path
          d="M 204 374 L 204 220 Q 204 134 340 104 Q 476 134 476 220 L 476 374"
          fill="none"
          stroke="var(--terracotta)"
          strokeWidth="3.2"
        />
        <path
          d="M 215 374 L 215 224 Q 215 140 340 110 Q 465 140 465 224 L 465 374"
          fill="none"
          stroke="var(--seljuk-navy)"
          strokeWidth="2.4"
        />

        {/* Kemer Tepe Kilit Taşı */}
        <polygon
          points="331,90 349,90 345,114 335,114"
          fill="var(--sandstone-gold-soft)"
          stroke="var(--seljuk-navy)"
          strokeWidth="1.6"
        />
      </g>

      {/* Kapı Ardı Aydınlık Kampüs Avlusu (Kemer Açıldığında Görünür) */}
      <g clipPath="url(#portalArchOpening)">
        <rect x="220" y="110" width="240" height="268" fill="url(#innerCourtyardSky)" />

        {/* Aydınlık Güneş Halesi */}
        <circle cx="340" cy="176" r="24" fill="var(--sandstone-gold-soft)" opacity="0.95" />

        {/* Avlu Arka Tepeleri */}
        <path
          d="M 215 292 Q 280 264 340 282 Q 400 262 465 292 L 465 376 L 215 376 Z"
          fill="var(--courtyard-sage-soft)"
        />

        {/* İçerideki Öğrenme Binaları Silüetleri */}
        <g>
          {/* Sol: Taş Köşk */}
          <rect x="236" y="232" width="58" height="58" rx="2" fill="var(--stone-cream)" stroke="var(--stone-deep)" strokeWidth="1.6" />
          <path d="M 232 232 L 265 212 L 298 232 Z" fill="var(--terracotta)" stroke="var(--seljuk-navy)" strokeWidth="1.3" />
          <path d="M 256 290 L 256 260 Q 265 252 274 260 L 274 290 Z" fill="var(--wood-warm)" />

          {/* Sağ: Turkuaz Kemerli Bina */}
          <rect x="386" y="222" width="60" height="68" rx="2" fill="var(--stone-light)" stroke="var(--seljuk-navy)" strokeWidth="1.6" />
          <rect x="386" y="222" width="60" height="10" fill="var(--seljuk-navy)" />
          <path d="M 398 264 L 398 244 Q 404 238 410 244 L 410 264 Z" fill="var(--seljuk-teal-soft)" stroke="var(--seljuk-teal)" strokeWidth="1.2" />
          <path d="M 422 264 L 422 244 Q 428 238 434 244 L 434 264 Z" fill="var(--seljuk-teal-soft)" stroke="var(--seljuk-teal)" strokeWidth="1.2" />
        </g>

        {/* Avlu Yeşil Alan ve Ağaçlar */}
        <ellipse cx="340" cy="336" rx="128" ry="44" fill="var(--courtyard-sage-soft)" />
        <circle cx="242" cy="296" r="16" fill="var(--courtyard-sage)" />
        <circle cx="436" cy="296" r="18" fill="var(--courtyard-sage-mid)" />

        {/* Taş Döşeli Avlu Yolu */}
        <path
          d="M 294 374 Q 318 324 334 288 L 346 288 Q 362 324 386 374 Z"
          fill="var(--stone-light)"
          stroke="var(--stone-dark)"
          strokeWidth="1.4"
        />
        <line x1="310" y1="350" x2="370" y2="350" stroke="var(--stone-mid)" strokeWidth="1.2" />
        <line x1="322" y1="326" x2="358" y2="326" stroke="var(--stone-mid)" strokeWidth="1.2" />
      </g>

      {/* Açılır Çift Kanatlı Ahşap Taç Kapı Kanatları */}
      <g clipPath="url(#portalArchOpening)">
        {/* Sol Kanat */}
        <motion.g
          initial={false}
          animate={{
            x: isOpen ? -108 : 0,
            opacity: isOpen ? 0.12 : 1,
          }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <rect
            x="226"
            y="116"
            width="114"
            height="258"
            fill="url(#walnutDoorGrad)"
            stroke="var(--wood-deep)"
            strokeWidth="2.4"
          />
          <rect
            x="244"
            y="196"
            width="78"
            height="72"
            rx="3"
            fill="var(--wood-deep)"
            fillOpacity="0.34"
            stroke="var(--sandstone-gold-soft)"
            strokeWidth="1.5"
          />
          <SeljukStarMotif cx={283} cy={232} radius={17} fill="var(--terracotta)" stroke="var(--sandstone-gold-soft)" innerFill="var(--stone-cream)" />
          <rect
            x="244"
            y="282"
            width="78"
            height="72"
            rx="3"
            fill="var(--wood-deep)"
            fillOpacity="0.34"
            stroke="var(--sandstone-gold-soft)"
            strokeWidth="1.5"
          />
          {/* Kapı Tokmağı Halkası */}
          <circle cx="322" cy="274" r="7" fill="none" stroke="var(--sandstone-gold-soft)" strokeWidth="2.4" />
          <circle cx="322" cy="268" r="3.5" fill="var(--sandstone-gold)" stroke="var(--wood-deep)" strokeWidth="1.2" />
        </motion.g>

        {/* Sağ Kanat */}
        <motion.g
          initial={false}
          animate={{
            x: isOpen ? 108 : 0,
            opacity: isOpen ? 0.12 : 1,
          }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <rect
            x="340"
            y="116"
            width="114"
            height="258"
            fill="url(#walnutDoorGrad)"
            stroke="var(--wood-deep)"
            strokeWidth="2.4"
          />
          <rect
            x="358"
            y="196"
            width="78"
            height="72"
            rx="3"
            fill="var(--wood-deep)"
            fillOpacity="0.34"
            stroke="var(--sandstone-gold-soft)"
            strokeWidth="1.5"
          />
          <SeljukStarMotif cx={397} cy={232} radius={17} fill="var(--terracotta)" stroke="var(--sandstone-gold-soft)" innerFill="var(--stone-cream)" />
          <rect
            x="358"
            y="282"
            width="78"
            height="72"
            rx="3"
            fill="var(--wood-deep)"
            fillOpacity="0.34"
            stroke="var(--sandstone-gold-soft)"
            strokeWidth="1.5"
          />
          {/* Kapı Tokmağı Halkası */}
          <circle cx="358" cy="274" r="7" fill="none" stroke="var(--sandstone-gold-soft)" strokeWidth="2.4" />
          <circle cx="358" cy="268" r="3.5" fill="var(--sandstone-gold)" stroke="var(--wood-deep)" strokeWidth="1.2" />
        </motion.g>
      </g>

      {/* İç Kemer Altın-Taş Silmesi (Kanatların Üzerinde Temiz Çerçeve) */}
      <path
        d="M 226 374 L 226 226 Q 226 146 340 116 Q 454 146 454 226 L 454 374"
        fill="none"
        stroke="var(--sandstone-gold)"
        strokeWidth="2.6"
      />

      {/* Ön Avlu Taş Basamakları ve Zemin Döşemesi */}
      <rect
        x="104"
        y="374"
        width="472"
        height="16"
        rx="2"
        fill="var(--stone-mid)"
        stroke="var(--stone-deep)"
        strokeWidth="1.8"
      />
      <rect
        x="78"
        y="390"
        width="524"
        height="18"
        rx="2"
        fill="var(--stone-light)"
        stroke="var(--stone-deep)"
        strokeWidth="1.8"
      />
      {/* Taş Döşeme Çizgileri */}
      <line x1="196" y1="390" x2="188" y2="408" stroke="var(--stone-dark)" strokeWidth="1.2" />
      <line x1="340" y1="390" x2="340" y2="408" stroke="var(--stone-dark)" strokeWidth="1.2" />
      <line x1="484" y1="390" x2="492" y2="408" stroke="var(--stone-dark)" strokeWidth="1.2" />

      {/* Ön Yeşil Avlu Şeridi */}
      <rect x="24" y="410" width="632" height="14" rx="7" fill="var(--courtyard-sage-soft)" stroke="var(--courtyard-sage-mid)" strokeWidth="1.2" />
    </svg>
  );
}
