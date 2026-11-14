import { SeljukStarMotif } from './SeljukStarMotif';

export type CampusBuildingId =
  | 'gezi-ve-kesif'
  | 'ingilizce-dunyasi'
  | 'kitap-ve-hikaye-dunyasi'
  | 'gorev-panosu'
  | 'kampus-yolculugum';

interface CampusBuildingSvgProps {
  buildingId: string;
  className?: string;
}

/**
 * Aynı Anadolu-Selçuklu modern mimari ailesine ait, ancak her biri silüet ve
 * cephe detaylarıyla ayırt edilebilen öğrenme binaları ve kampüs yapıları.
 * Yalnızca src/styles/globals.css renk belirteçlerini kullanır.
 */
export function CampusBuildingSvg({
  buildingId,
  className = 'w-16 h-14 shrink-0',
}: CampusBuildingSvgProps) {
  return (
    <svg
      viewBox="0 0 120 96"
      className={className}
      aria-hidden="true"
    >
      {/* Ortak Zemin Taş Kaide ve Yeşillik */}
      <rect x="6" y="82" width="108" height="8" rx="3" fill="var(--stone-light)" stroke="var(--stone-dark)" strokeWidth="1.4" />
      <circle cx="14" cy="76" r="7" fill="var(--courtyard-sage-mid)" />
      <circle cx="106" cy="76" r="7" fill="var(--courtyard-sage)" />

      {/* 1. GEZİ VE KEŞİF: Taş ve Toprak Tonlu Gözlem Köşkü + Yükseltilmiş Teras Kulesi */}
      {buildingId === 'gezi-ve-kesif' && (
        <g>
          {/* Yükseltilmiş Gözlem Kulesi */}
          <rect x="40" y="14" width="40" height="28" rx="2" fill="var(--stone-cream)" stroke="var(--stone-deep)" strokeWidth="1.6" />
          <path d="M 36 16 L 60 6 L 84 16 Z" fill="var(--terracotta)" stroke="var(--seljuk-navy)" strokeWidth="1.5" />
          {/* Gözlem Kemeri */}
          <path d="M 51 36 L 51 24 Q 60 18 69 24 L 69 36 Z" fill="var(--sky-warm-top)" stroke="var(--seljuk-navy)" strokeWidth="1.4" />

          {/* Ana Taş Köşk Gövdesi */}
          <rect x="20" y="38" width="80" height="44" rx="2" fill="var(--stone-light)" stroke="var(--stone-deep)" strokeWidth="1.8" />
          {/* Toprak Tonu Saçak Şeridi */}
          <rect x="18" y="36" width="84" height="7" rx="1.5" fill="var(--terracotta)" stroke="var(--seljuk-navy)" strokeWidth="1.3" />
          {/* Taş Derz Çizgileri */}
          <line x1="22" y1="54" x2="98" y2="54" stroke="var(--stone-mid)" strokeWidth="1" />
          <line x1="22" y1="68" x2="98" y2="68" stroke="var(--stone-mid)" strokeWidth="1" />

          {/* Sivri Kemerli Giriş Revakı */}
          <path d="M 48 82 L 48 56 Q 60 44 72 56 L 72 82 Z" fill="var(--wood-warm)" stroke="var(--seljuk-navy)" strokeWidth="1.6" />
          <path d="M 27 72 L 27 56 Q 34 50 41 56 L 41 72 Z" fill="var(--sandstone-gold-soft)" stroke="var(--stone-deep)" strokeWidth="1.4" />
          <path d="M 79 72 L 79 56 Q 86 50 93 56 L 93 72 Z" fill="var(--sandstone-gold-soft)" stroke="var(--stone-deep)" strokeWidth="1.4" />

          <SeljukStarMotif cx={60} cy={46} radius={5.5} fill="var(--sandstone-gold)" innerFill="var(--stone-cream)" />
        </g>
      )}

      {/* 2. İNGİLİZCE DÜNYASI: Turkuaz ve Lacivert Çini Taçlı Dil ve Kültür Konağı */}
      {buildingId === 'ingilizce-dunyasi' && (
        <g>
          {/* Yan Kanatlar */}
          <rect x="16" y="34" width="88" height="48" rx="2" fill="var(--stone-cream)" stroke="var(--seljuk-navy)" strokeWidth="1.8" />
          {/* Yükseltilmiş Orta Taç Cephe */}
          <rect x="38" y="16" width="44" height="66" rx="2" fill="var(--stone-light)" stroke="var(--seljuk-navy)" strokeWidth="1.8" />
          {/* Lacivert-Turkuaz Üst Çini Friz */}
          <rect x="38" y="16" width="44" height="12" fill="var(--seljuk-navy)" stroke="var(--seljuk-navy)" strokeWidth="1.4" />
          <rect x="42" y="20" width="36" height="4" rx="1" fill="var(--seljuk-teal)" />

          {/* Sivri Turkuaz Portal Kemeri */}
          <path d="M 48 82 L 48 48 Q 60 34 72 48 L 72 82 Z" fill="var(--seljuk-teal)" stroke="var(--seljuk-navy)" strokeWidth="1.6" />
          <path d="M 52 82 L 52 54 Q 60 44 68 54 L 68 82 Z" fill="var(--wood-warm)" stroke="var(--sandstone-gold-soft)" strokeWidth="1.2" />

          {/* İkiz Sivri Kütüphane Pencereleri */}
          <path d="M 23 68 L 23 48 Q 28 42 33 48 L 33 68 Z" fill="var(--seljuk-teal-soft)" stroke="var(--seljuk-navy)" strokeWidth="1.4" />
          <path d="M 87 68 L 87 48 Q 92 42 97 48 L 97 68 Z" fill="var(--seljuk-teal-soft)" stroke="var(--seljuk-navy)" strokeWidth="1.4" />

          <SeljukStarMotif cx={60} cy={31} radius={6} fill="var(--seljuk-teal)" innerFill="var(--sandstone-gold-soft)" />
        </g>
      )}

      {/* 3. KİTAP VE HİKÂYE DÜNYASI: Kubbeli-Tonozlu Krem ve Toprak Atölye Binası */}
      {buildingId === 'kitap-ve-hikaye-dunyasi' && (
        <g>
          {/* Modernize Edilmiş Anadolu Tonoz / Kubbe Çatı */}
          <path d="M 32 34 Q 60 8 88 34 Z" fill="var(--courtyard-sage)" stroke="var(--seljuk-navy)" strokeWidth="1.6" />
          <line x1="60" y1="14" x2="60" y2="34" stroke="var(--stone-cream)" strokeWidth="1.2" opacity="0.55" />
          <circle cx="60" cy="12" r="3" fill="var(--sandstone-gold)" stroke="var(--seljuk-navy)" strokeWidth="1.2" />

          {/* Krem Taş ve Toprak Detaylı Atölye Gövdesi */}
          <rect x="18" y="34" width="84" height="48" rx="2" fill="var(--stone-cream)" stroke="var(--stone-deep)" strokeWidth="1.8" />
          <rect x="18" y="34" width="84" height="6" fill="var(--stone-mid)" stroke="var(--stone-deep)" strokeWidth="1.2" />

          {/* Geniş Aydınlık Atölye Kemer Pencereleri */}
          <path d="M 24 70 L 24 50 Q 32 43 40 50 L 40 70 Z" fill="var(--sandstone-gold-soft)" stroke="var(--courtyard-sage)" strokeWidth="1.5" />
          <path d="M 80 70 L 80 50 Q 88 43 96 50 L 96 70 Z" fill="var(--sandstone-gold-soft)" stroke="var(--courtyard-sage)" strokeWidth="1.5" />

          {/* Orta Kemerli Atölye Kapısı */}
          <path d="M 48 82 L 48 52 Q 60 41 72 52 L 72 82 Z" fill="var(--terracotta-soft)" stroke="var(--terracotta)" strokeWidth="1.6" />
          <path d="M 52 82 L 52 57 Q 60 49 68 57 L 68 82 Z" fill="var(--wood-warm)" stroke="var(--wood-deep)" strokeWidth="1.3" />

          <SeljukStarMotif cx={60} cy={27} radius={5} fill="var(--sandstone-gold-soft)" accentFill="var(--terracotta)" />
        </g>
      )}

      {/* 4. KEŞİF GÖREVLERİ PANOSU: Taş Avlu Bilgi ve Görev Köşkü */}
      {buildingId === 'gorev-panosu' && (
        <g>
          {/* Taş Sütunlar */}
          <rect x="26" y="34" width="8" height="48" fill="var(--stone-mid)" stroke="var(--stone-deep)" strokeWidth="1.4" />
          <rect x="86" y="34" width="8" height="48" fill="var(--stone-mid)" stroke="var(--stone-deep)" strokeWidth="1.4" />
          {/* Üçgen Alınlıklı Gölgelik Çatı */}
          <path d="M 18 36 L 60 16 L 102 36 Z" fill="var(--seljuk-navy)" stroke="var(--seljuk-navy-deep)" strokeWidth="1.6" />
          {/* Pano Gövdesi */}
          <rect x="34" y="38" width="52" height="36" rx="2" fill="var(--stone-cream)" stroke="var(--seljuk-navy)" strokeWidth="1.6" />
          <rect x="40" y="44" width="18" height="12" rx="1.5" fill="var(--seljuk-teal-soft)" stroke="var(--seljuk-teal)" strokeWidth="1.2" />
          <rect x="62" y="44" width="18" height="12" rx="1.5" fill="var(--terracotta-soft)" stroke="var(--terracotta)" strokeWidth="1.2" />
          <rect x="40" y="60" width="40" height="8" rx="1.5" fill="var(--sandstone-gold-soft)" stroke="var(--sandstone-gold)" strokeWidth="1.2" />
          <SeljukStarMotif cx={60} cy={28} radius={5.5} fill="var(--seljuk-teal)" />
        </g>
      )}

      {/* 5. KAMPÜS YOLCULUĞUM: Kemerli Yolculuk ve Arşiv Pavilyonu */}
      {buildingId === 'kampus-yolculugum' && (
        <g>
          <rect x="24" y="32" width="72" height="50" rx="2" fill="var(--stone-light)" stroke="var(--seljuk-navy)" strokeWidth="1.8" />
          <rect x="20" y="28" width="80" height="8" rx="1.5" fill="var(--seljuk-navy)" stroke="var(--seljuk-navy-deep)" strokeWidth="1.4" />
          {/* İkiz Kemerli Arşiv Nişleri */}
          <path d="M 33 82 L 33 50 Q 44 40 55 50 L 55 82 Z" fill="var(--seljuk-navy-soft)" stroke="var(--seljuk-navy)" strokeWidth="1.5" />
          <path d="M 65 82 L 65 50 Q 76 40 87 50 L 87 82 Z" fill="var(--courtyard-sage-soft)" stroke="var(--courtyard-sage)" strokeWidth="1.5" />
          <rect x="39" y="56" width="10" height="14" rx="1.5" fill="var(--terracotta)" />
          <rect x="71" y="56" width="10" height="14" rx="1.5" fill="var(--seljuk-teal)" />
          <SeljukStarMotif cx={60} cy={22} radius={6} fill="var(--sandstone-gold)" innerFill="var(--stone-cream)" />
        </g>
      )}
    </svg>
  );
}
