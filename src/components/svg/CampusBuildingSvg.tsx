import { SeljukStarMotif } from './SeljukStarMotif';

export type CampusBuildingId =
  | 'gezi-ve-kesif'
  | 'ingilizce-dunyasi'
  | 'kitap-ve-hikaye-dunyasi'
  | 'gorev-panosu'
  | 'kampus-yolculugum';

interface CampusBuildingGraphicProps {
  buildingId: string;
}

/**
 * 2,5B izometrik açıya sahip, sol-üst aydınlatmalı ve sağ-alt gölgeli öğrenme binası grafiği.
 * Hem bağımsız CampusBuildingSvg hem de CourtyardSceneSvg içinde doğrudan <g> olarak kullanılır.
 * Yalnızca src/styles/globals.css renk belirteçlerini kullanır.
 */
export function CampusBuildingGraphic({ buildingId }: CampusBuildingGraphicProps) {
  return (
    <g aria-hidden="true">
      {/* Sağ-Alta Uzanan Yumuşak 2,5B Zemin Gölgesi */}
      <polygon
        points="28,116 96,144 166,112 104,88"
        fill="var(--iso-shadow)"
        opacity="0.13"
      />

      {/* Ortak İzometrik Taş Kaide Platformu */}
      <polygon
        points="20,108 90,138 156,108 86,78"
        fill="var(--stone-light)"
        stroke="var(--stone-dark)"
        strokeWidth="1.4"
      />
      <polygon
        points="20,108 90,138 90,144 20,114"
        fill="var(--stone-mid)"
        stroke="var(--stone-dark)"
        strokeWidth="1.2"
      />
      <polygon
        points="90,138 156,108 156,114 90,144"
        fill="var(--stone-shade)"
        stroke="var(--stone-dark)"
        strokeWidth="1.2"
      />

      {/* 1. GEZİ VE KEŞİF: Gözlem Teraslı, Taş ve Toprak Tonlu Keşif Köşkü */}
      {buildingId === 'gezi-ve-kesif' && (
        <g>
          {/* Açık Ön Avlu Eşiği ve Rota Levhası */}
          <polygon
            points="44,119 72,130 88,123 60,112"
            fill="var(--iso-ground-plaza)"
            stroke="var(--stone-dark)"
            strokeWidth="1"
          />

          {/* Ana Köşk Sol Aydınlık Cephe */}
          <polygon
            points="32,64 90,90 90,130 32,104"
            fill="var(--stone-cream)"
            stroke="var(--stone-deep)"
            strokeWidth="1.6"
          />
          {/* Sağ Gölge Cephe */}
          <polygon
            points="90,90 144,64 144,104 90,130"
            fill="var(--stone-shade)"
            stroke="var(--stone-deep)"
            strokeWidth="1.6"
          />
          {/* İnce Taş Derzleri */}
          <line x1="34" y1="84" x2="88" y2="108" stroke="var(--stone-mid)" strokeWidth="1" />
          <line x1="92" y1="108" x2="142" y2="84" stroke="var(--stone-dark)" strokeWidth="1" />

          {/* Üst Teras Çatı Tablası ve Toprak Tonu Saçak */}
          <polygon
            points="28,60 88,34 148,60 90,88"
            fill="var(--stone-light)"
            stroke="var(--stone-deep)"
            strokeWidth="1.5"
          />
          <polygon
            points="28,60 90,88 90,94 28,66"
            fill="var(--terracotta)"
            stroke="var(--seljuk-navy)"
            strokeWidth="1.2"
          />
          <polygon
            points="90,88 148,60 148,66 90,94"
            fill="var(--terracotta-shade)"
            stroke="var(--seljuk-navy)"
            strokeWidth="1.2"
          />

          {/* Yükseltilmiş Gözlem Kulesi */}
          <polygon
            points="64,34 90,46 90,72 64,60"
            fill="var(--stone-cream)"
            stroke="var(--stone-deep)"
            strokeWidth="1.5"
          />
          <polygon
            points="90,46 116,34 116,60 90,72"
            fill="var(--stone-shade)"
            stroke="var(--stone-deep)"
            strokeWidth="1.5"
          />
          {/* Gözlem Kulesi Piramit Toprak Çatı */}
          <polygon
            points="60,34 90,14 90,46"
            fill="var(--terracotta)"
            stroke="var(--seljuk-navy)"
            strokeWidth="1.4"
          />
          <polygon
            points="90,14 120,34 90,46"
            fill="var(--terracotta-shade)"
            stroke="var(--seljuk-navy)"
            strokeWidth="1.4"
          />
          {/* Gözlem Penceresi */}
          <path d="M 72 58 L 72 47 Q 77 43 82 47 L 82 58 Z" fill="var(--sky-warm-top)" stroke="var(--seljuk-navy)" strokeWidth="1.2" />

          {/* Sivri Kemerli Giriş ve Pencereler */}
          <path d="M 54 114 L 54 88 Q 62 81 70 88 L 70 118 Z" fill="var(--wood-warm)" stroke="var(--seljuk-navy)" strokeWidth="1.5" />
          <path d="M 38 98 L 38 82 Q 43 78 48 82 L 48 102 Z" fill="var(--sandstone-gold-soft)" stroke="var(--stone-deep)" strokeWidth="1.2" />
          <path d="M 106 116 L 106 94 Q 112 88 118 92 L 118 112 Z" fill="var(--sandstone-gold-soft)" stroke="var(--stone-deep)" strokeWidth="1.2" />

          {/* Küçük Rota Levhası (Buradan Yola Çıkılıyor) */}
          <rect x="26" y="96" width="3" height="22" fill="var(--wood-deep)" />
          <path d="M 16 97 L 36 97 L 40 101 L 36 105 L 16 105 Z" fill="var(--sandstone-gold-soft)" stroke="var(--terracotta)" strokeWidth="1.2" />

          <SeljukStarMotif cx={90} cy={78} radius={5.5} fill="var(--sandstone-gold)" innerFill="var(--stone-cream)" />
        </g>
      )}

      {/* 2. İNGİLİZCE DÜNYASI: Çini Taçlı, Turkuaz-Lacivert Vurgulu Aydınlık Konak */}
      {buildingId === 'ingilizce-dunyasi' && (
        <g>
          {/* Ana Konak Sol Aydınlık Cephe */}
          <polygon
            points="28,54 90,82 90,130 28,102"
            fill="var(--campus-surface)"
            stroke="var(--seljuk-navy)"
            strokeWidth="1.7"
          />
          {/* Sağ Gölge Cephe */}
          <polygon
            points="90,82 148,54 148,102 90,130"
            fill="var(--stone-light)"
            stroke="var(--seljuk-navy)"
            strokeWidth="1.7"
          />

          {/* Çatı Düzlemi + Lacivert-Turkuaz Çini Friz */}
          <polygon
            points="26,52 88,24 150,52 90,80"
            fill="var(--stone-cream)"
            stroke="var(--seljuk-navy)"
            strokeWidth="1.5"
          />
          <polygon
            points="28,52 90,80 90,90 28,62"
            fill="var(--seljuk-navy)"
            stroke="var(--seljuk-navy-deep)"
            strokeWidth="1.2"
          />
          <polygon
            points="90,80 148,52 148,62 90,90"
            fill="var(--seljuk-navy-shade)"
            stroke="var(--seljuk-navy-deep)"
            strokeWidth="1.2"
          />
          <line x1="34" y1="60" x2="84" y2="82" stroke="var(--seljuk-teal)" strokeWidth="2.5" />

          {/* Yükseltilmiş Orta Taç Portal Kütlesi */}
          <polygon
            points="48,38 78,52 78,124 48,110"
            fill="var(--stone-light)"
            stroke="var(--seljuk-navy)"
            strokeWidth="1.6"
          />
          <polygon
            points="78,52 96,44 96,116 78,124"
            fill="var(--stone-shade)"
            stroke="var(--seljuk-navy)"
            strokeWidth="1.4"
          />
          <polygon
            points="48,38 66,30 96,44 78,52"
            fill="var(--seljuk-teal)"
            stroke="var(--seljuk-navy)"
            strokeWidth="1.3"
          />

          {/* Turkuaz Çini Portal Kemeri ve Ahşap Kapı */}
          <path d="M 54 113 L 54 78 Q 63 66 72 78 L 72 121 Z" fill="var(--seljuk-teal)" stroke="var(--seljuk-navy)" strokeWidth="1.5" />
          <path d="M 58 115 L 58 84 Q 63 75 68 84 L 68 119 Z" fill="var(--wood-warm)" stroke="var(--sandstone-gold-soft)" strokeWidth="1.1" />

          {/* İkiz Aydınlık Kemer Pencereler */}
          <path d="M 33 96 L 33 75 Q 38 70 43 75 L 43 100 Z" fill="var(--seljuk-teal-soft)" stroke="var(--seljuk-navy)" strokeWidth="1.3" />
          <path d="M 104 114 L 104 88 Q 111 81 118 86 L 118 108 Z" fill="var(--seljuk-teal-soft)" stroke="var(--seljuk-navy)" strokeWidth="1.3" />
          <path d="M 126 104 L 126 78 Q 133 71 140 76 L 140 98 Z" fill="var(--seljuk-teal-soft)" stroke="var(--seljuk-navy)" strokeWidth="1.3" />

          <SeljukStarMotif cx={63} cy={56} radius={6.5} fill="var(--seljuk-teal)" innerFill="var(--sandstone-gold-soft)" />
        </g>
      )}

      {/* 3. KİTAP VE HİKÂYE DÜNYASI: Yumuşak Tonoz Kubbeli, Adaçayı Yeşili Vurgulu Atölye */}
      {buildingId === 'kitap-ve-hikaye-dunyasi' && (
        <g>
          {/* Sol Aydınlık Krem Duvar */}
          <polygon
            points="30,62 90,90 90,130 30,102"
            fill="var(--stone-cream)"
            stroke="var(--stone-deep)"
            strokeWidth="1.6"
          />
          {/* Sağ Gölge Duvar */}
          <polygon
            points="90,90 148,62 148,102 90,130"
            fill="var(--stone-shade)"
            stroke="var(--stone-deep)"
            strokeWidth="1.6"
          />
          {/* Üst Çatı Terası ve Adaçayı Saçak */}
          <polygon
            points="28,60 88,34 150,60 90,88"
            fill="var(--stone-light)"
            stroke="var(--stone-deep)"
            strokeWidth="1.5"
          />
          <polygon
            points="28,60 90,88 90,94 28,66"
            fill="var(--courtyard-sage)"
            stroke="var(--seljuk-navy)"
            strokeWidth="1.1"
          />
          <polygon
            points="90,88 150,60 150,66 90,94"
            fill="var(--courtyard-sage-shade)"
            stroke="var(--seljuk-navy)"
            strokeWidth="1.1"
          />

          {/* Yumuşak Tonoz / Kubbe Çatı (Sol Aydınlık, Sağ Gölgede) */}
          <ellipse cx="90" cy="54" rx="33" ry="13" fill="var(--stone-mid)" stroke="var(--stone-deep)" strokeWidth="1.3" />
          <path d="M 57 54 Q 90 12 123 54 Z" fill="var(--courtyard-sage)" stroke="var(--seljuk-navy)" strokeWidth="1.6" />
          <path d="M 90 25 Q 114 34 123 54 L 90 54 Z" fill="var(--courtyard-sage-shade)" opacity="0.45" />
          <line x1="90" y1="25" x2="90" y2="54" stroke="var(--stone-cream)" strokeWidth="1.1" opacity="0.55" />
          <circle cx="90" cy="23" r="3.4" fill="var(--sandstone-gold)" stroke="var(--seljuk-navy)" strokeWidth="1.2" />

          {/* Geniş Kemerli Aydınlık Okuma Pencereleri ve Davetkâr Kapı */}
          <path d="M 38 99 L 38 78 Q 45 71 52 78 L 52 105 Z" fill="var(--sandstone-gold-soft)" stroke="var(--courtyard-sage)" strokeWidth="1.4" />
          <path d="M 60 116 L 60 86 Q 70 76 80 86 L 80 125 Z" fill="var(--terracotta-soft)" stroke="var(--terracotta)" strokeWidth="1.5" />
          <path d="M 64 118 L 64 91 Q 70 84 76 91 L 76 123 Z" fill="var(--wood-warm)" stroke="var(--wood-deep)" strokeWidth="1.2" />
          <path d="M 104 114 L 104 88 Q 116 78 128 86 L 128 104 Z" fill="var(--sandstone-gold-soft)" stroke="var(--courtyard-sage)" strokeWidth="1.4" />

          <SeljukStarMotif cx={90} cy={43} radius={5.5} fill="var(--sandstone-gold-soft)" accentFill="var(--terracotta)" />
        </g>
      )}

      {/* 4. KEŞİF GÖREVLERİ PANOSU: Açık Hava Duyuru Köşkü (2,5B Gölgelik + Pano Yüzeyi) */}
      {buildingId === 'gorev-panosu' && (
        <g>
          {/* Taş Kaide ve Sütunlar */}
          <rect x="44" y="64" width="7" height="52" fill="var(--stone-mid)" stroke="var(--stone-deep)" strokeWidth="1.3" />
          <rect x="128" y="60" width="7" height="50" fill="var(--stone-shade)" stroke="var(--stone-deep)" strokeWidth="1.3" />

          {/* Pano Gövdesi (İzometrik Açılı) */}
          <polygon
            points="48,62 126,48 126,96 48,110"
            fill="var(--campus-surface)"
            stroke="var(--seljuk-navy)"
            strokeWidth="1.7"
          />
          {/* Pano Sağ Kalınlığı */}
          <polygon
            points="126,48 134,52 134,100 126,96"
            fill="var(--stone-shade)"
            stroke="var(--seljuk-navy)"
            strokeWidth="1.3"
          />
          {/* Pano Üstü Renkli Görev Kartları */}
          <polygon points="56,70 84,65 84,84 56,89" fill="var(--seljuk-teal-soft)" stroke="var(--seljuk-teal)" strokeWidth="1.2" />
          <polygon points="90,64 118,59 118,78 90,83" fill="var(--terracotta-soft)" stroke="var(--terracotta)" strokeWidth="1.2" />
          <polygon points="56,93 118,82 118,91 56,102" fill="var(--sandstone-gold-soft)" stroke="var(--sandstone-gold)" strokeWidth="1.1" />

          {/* Eğimli Lacivert-Toprak Selçuklu Gölgelik Çatısı */}
          <polygon
            points="36,56 90,30 144,44 92,68"
            fill="var(--seljuk-navy)"
            stroke="var(--seljuk-navy-deep)"
            strokeWidth="1.6"
          />
          <polygon
            points="36,56 92,68 92,74 36,62"
            fill="var(--terracotta)"
            stroke="var(--seljuk-navy-deep)"
            strokeWidth="1.2"
          />
          <polygon
            points="92,68 144,44 144,50 92,74"
            fill="var(--seljuk-navy-shade)"
            stroke="var(--seljuk-navy-deep)"
            strokeWidth="1.2"
          />
          <SeljukStarMotif cx={90} cy={49} radius={6.5} fill="var(--seljuk-teal)" stroke="var(--stone-cream)" />
        </g>
      )}

      {/* 5. KAMPÜS YOLCULUĞUM: İkiz Kemerli Düzenli Arşiv Pavilyonu */}
      {buildingId === 'kampus-yolculugum' && (
        <g>
          {/* Sol Aydınlık Cephe */}
          <polygon
            points="32,58 90,84 90,128 32,102"
            fill="var(--stone-cream)"
            stroke="var(--seljuk-navy)"
            strokeWidth="1.6"
          />
          {/* Sağ Gölge Cephe */}
          <polygon
            points="90,84 144,58 144,102 90,128"
            fill="var(--stone-shade)"
            stroke="var(--seljuk-navy)"
            strokeWidth="1.6"
          />

          {/* Düzenli Lacivert Taç Saçak ve Teras */}
          <polygon
            points="30,56 88,30 146,56 90,82"
            fill="var(--stone-light)"
            stroke="var(--seljuk-navy)"
            strokeWidth="1.5"
          />
          <polygon
            points="30,56 90,82 90,90 30,64"
            fill="var(--seljuk-navy)"
            stroke="var(--seljuk-navy-deep)"
            strokeWidth="1.2"
          />
          <polygon
            points="90,82 146,56 146,64 90,90"
            fill="var(--seljuk-navy-shade)"
            stroke="var(--seljuk-navy-deep)"
            strokeWidth="1.2"
          />

          {/* İkiz Kemerli Arşiv Nişleri */}
          <path d="M 40 105 L 40 78 Q 48 70 56 78 L 56 112 Z" fill="var(--seljuk-navy-soft)" stroke="var(--seljuk-navy)" strokeWidth="1.4" />
          <path d="M 64 116 L 64 88 Q 72 80 80 88 L 80 123 Z" fill="var(--courtyard-sage-soft)" stroke="var(--courtyard-sage)" strokeWidth="1.4" />
          <rect x="44" y="84" width="8" height="14" rx="1.5" fill="var(--terracotta)" />
          <rect x="68" y="94" width="8" height="14" rx="1.5" fill="var(--seljuk-teal)" />

          {/* Sağ Yüz Kemer Pencere */}
          <path d="M 108 112 L 108 88 Q 116 80 124 88 L 124 104 Z" fill="var(--seljuk-navy-soft)" stroke="var(--seljuk-navy)" strokeWidth="1.3" />

          <SeljukStarMotif cx={90} cy={69} radius={6} fill="var(--sandstone-gold)" innerFill="var(--stone-cream)" />
        </g>
      )}
    </g>
  );
}

interface CampusBuildingSvgProps {
  buildingId: string;
  className?: string;
}

export function CampusBuildingSvg({
  buildingId,
  className = 'w-20 h-16 shrink-0',
}: CampusBuildingSvgProps) {
  return (
    <svg viewBox="0 0 180 148" className={className} aria-hidden="true">
      <CampusBuildingGraphic buildingId={buildingId} />
    </svg>
  );
}
