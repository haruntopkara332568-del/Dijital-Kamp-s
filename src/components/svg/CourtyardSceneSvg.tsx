import { SeljukStarMotif } from './SeljukStarMotif';

/**
 * Karşılama Avlusu SVG Sahnesi:
 * Taş döşeli zemin, merkezi yıldızlı meydan, yeşil alanlar, yürüyüş yolları,
 * yön levhaları ve aynı Anadolu-Selçuklu mimari ailesinden üç ayırt edilebilir öğrenme binası.
 * Yalnızca src/styles/globals.css içindeki renk belirteçlerini kullanır.
 */
export function CourtyardSceneSvg() {
  return (
    <svg
      viewBox="0 0 800 260"
      className="w-full h-auto rounded-xl border border-[var(--campus-border)]"
      role="img"
      aria-label="Taş zeminli meydan, yeşil alanlar, yürüyüş yolları, yön levhaları ve üç öğrenme binasının yer aldığı Anadolu-Selçuklu esintili kampüs avlusu"
    >
      <title>Dijital Eğitim Kampüsü Karşılama Avlusu</title>

      <defs>
        <linearGradient id="courtyardSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--sky-warm-top)" />
          <stop offset="100%" stopColor="var(--sky-warm-bottom)" />
        </linearGradient>
        <linearGradient id="stonePlazaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--stone-cream)" />
          <stop offset="100%" stopColor="var(--stone-light)" />
        </linearGradient>
      </defs>

      {/* Gökyüzü ve Uzak Anadolu Tepeleri */}
      <rect x="0" y="0" width="800" height="145" fill="url(#courtyardSky)" />
      <circle cx="694" cy="44" r="24" fill="var(--sandstone-gold-soft)" opacity="0.9" />
      <path
        d="M 0 132 Q 160 100 320 124 Q 520 94 800 128 L 800 260 L 0 260 Z"
        fill="var(--courtyard-sage-soft)"
      />

      {/* Avlu Arka Taş Bahçe Duvarı */}
      <rect x="18" y="114" width="764" height="22" fill="var(--stone-light)" stroke="var(--stone-dark)" strokeWidth="1.4" />
      <rect x="18" y="110" width="764" height="6" fill="var(--stone-mid)" />

      {/* Yeşil Avlu Çim Alanları (Sağ ve Sol) */}
      <path
        d="M 0 136 L 800 136 L 800 260 L 0 260 Z"
        fill="var(--courtyard-sage-soft)"
      />
      <ellipse cx="145" cy="198" rx="135" ry="44" fill="var(--courtyard-sage-mid)" opacity="0.22" />
      <ellipse cx="655" cy="198" rx="135" ry="44" fill="var(--courtyard-sage-mid)" opacity="0.22" />

      {/* BİNA 1 (SOL): Gezi ve Keşif — Taş ve Toprak Tonlu Gözlem Köşkü */}
      <g>
        {/* Gözlem Terası Kulesi */}
        <rect x="96" y="34" width="66" height="36" rx="2" fill="var(--stone-cream)" stroke="var(--stone-deep)" strokeWidth="1.7" />
        <path d="M 90 36 L 129 18 L 168 36 Z" fill="var(--terracotta)" stroke="var(--seljuk-navy)" strokeWidth="1.5" />
        <path d="M 116 64 L 116 46 Q 129 38 142 46 L 142 64 Z" fill="var(--sky-warm-top)" stroke="var(--seljuk-navy)" strokeWidth="1.4" />

        {/* Ana Köşk Gövdesi */}
        <rect x="54" y="66" width="150" height="64" rx="2" fill="var(--stone-light)" stroke="var(--stone-deep)" strokeWidth="1.8" />
        <rect x="50" y="62" width="158" height="8" rx="1.5" fill="var(--terracotta)" stroke="var(--seljuk-navy)" strokeWidth="1.3" />
        {/* Taş Derzleri */}
        <line x1="56" y1="86" x2="202" y2="86" stroke="var(--stone-mid)" strokeWidth="1" />
        <line x1="56" y1="106" x2="202" y2="106" stroke="var(--stone-mid)" strokeWidth="1" />
        {/* Sivri Kemerli Pencereler ve Kapı */}
        <path d="M 68 114 L 68 90 Q 77 82 86 90 L 86 114 Z" fill="var(--sandstone-gold-soft)" stroke="var(--stone-deep)" strokeWidth="1.4" />
        <path d="M 115 130 L 115 90 Q 129 76 143 90 L 143 130 Z" fill="var(--wood-warm)" stroke="var(--seljuk-navy)" strokeWidth="1.7" />
        <path d="M 172 114 L 172 90 Q 181 82 190 90 L 190 114 Z" fill="var(--sandstone-gold-soft)" stroke="var(--stone-deep)" strokeWidth="1.4" />
        <SeljukStarMotif cx={129} cy={76} radius={6.5} fill="var(--sandstone-gold)" innerFill="var(--stone-cream)" />
        {/* Tabela */}
        <rect x="78" y="132" width="102" height="17" rx="3" fill="var(--campus-surface)" stroke="var(--terracotta)" strokeWidth="1.4" />
        <text x="129" y="143.5" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="var(--seljuk-navy)">
          Gezi ve Keşif
        </text>
      </g>

      {/* BİNA 2 (ORTA): İngilizce Dünyası — Turkuaz & Lacivert Çini Taçlı Konak */}
      <g>
        <rect x="316" y="54" width="168" height="76" rx="2" fill="var(--stone-cream)" stroke="var(--seljuk-navy)" strokeWidth="1.8" />
        {/* Yükseltilmiş Orta Taç Kapı Cephesi */}
        <rect x="358" y="28" width="84" height="102" rx="2" fill="var(--stone-light)" stroke="var(--seljuk-navy)" strokeWidth="1.8" />
        <rect x="358" y="28" width="84" height="16" fill="var(--seljuk-navy)" stroke="var(--seljuk-navy-deep)" strokeWidth="1.4" />
        <rect x="366" y="33" width="68" height="6" rx="1" fill="var(--seljuk-teal)" />

        {/* Sivri Turkuaz Portal Kemeri */}
        <path d="M 378 130 L 378 78 Q 400 58 422 78 L 422 130 Z" fill="var(--seljuk-teal)" stroke="var(--seljuk-navy)" strokeWidth="1.8" />
        <path d="M 385 130 L 385 86 Q 400 71 415 86 L 415 130 Z" fill="var(--wood-warm)" stroke="var(--sandstone-gold-soft)" strokeWidth="1.3" />

        {/* İkiz Kütüphane Pencereleri */}
        <path d="M 328 110 L 328 76 Q 337 68 346 76 L 346 110 Z" fill="var(--seljuk-teal-soft)" stroke="var(--seljuk-navy)" strokeWidth="1.4" />
        <path d="M 454 110 L 454 76 Q 463 68 472 76 L 472 110 Z" fill="var(--seljuk-teal-soft)" stroke="var(--seljuk-navy)" strokeWidth="1.4" />

        <SeljukStarMotif cx={400} cy={53} radius={7.5} fill="var(--seljuk-teal)" innerFill="var(--sandstone-gold-soft)" />
        {/* Tabela */}
        <rect x="342" y="132" width="116" height="17" rx="3" fill="var(--campus-surface)" stroke="var(--seljuk-teal)" strokeWidth="1.4" />
        <text x="400" y="143.5" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="var(--seljuk-navy)">
          İngilizce Dünyası
        </text>
      </g>

      {/* BİNA 3 (SAĞ): Kitap ve Hikâye Dünyası — Tonoz Kubbeli Krem Atölye */}
      <g>
        {/* Yumuşak Tonoz Kubbe */}
        <path d="M 622 58 Q 671 20 720 58 Z" fill="var(--courtyard-sage)" stroke="var(--seljuk-navy)" strokeWidth="1.7" />
        <line x1="671" y1="28" x2="671" y2="58" stroke="var(--stone-cream)" strokeWidth="1.2" opacity="0.55" />
        <circle cx="671" cy="24" r="3.5" fill="var(--sandstone-gold)" stroke="var(--seljuk-navy)" strokeWidth="1.2" />

        {/* Ana Krem Atölye Gövdesi */}
        <rect x="596" y="58" width="150" height="72" rx="2" fill="var(--stone-cream)" stroke="var(--stone-deep)" strokeWidth="1.8" />
        <rect x="596" y="58" width="150" height="8" fill="var(--stone-mid)" stroke="var(--stone-deep)" strokeWidth="1.2" />

        {/* Aydınlık Atölye Kemer Pencereleri */}
        <path d="M 610 112 L 610 82 Q 623 72 636 82 L 636 112 Z" fill="var(--sandstone-gold-soft)" stroke="var(--courtyard-sage)" strokeWidth="1.5" />
        <path d="M 706 112 L 706 82 Q 719 72 732 82 L 732 112 Z" fill="var(--sandstone-gold-soft)" stroke="var(--courtyard-sage)" strokeWidth="1.5" />

        {/* Orta Atölye Kapısı */}
        <path d="M 655 130 L 655 86 Q 671 72 687 86 L 687 130 Z" fill="var(--terracotta-soft)" stroke="var(--terracotta)" strokeWidth="1.6" />
        <path d="M 660 130 L 660 92 Q 671 81 682 92 L 682 130 Z" fill="var(--wood-warm)" stroke="var(--wood-deep)" strokeWidth="1.3" />
        <SeljukStarMotif cx={671} cy={47} radius={6} fill="var(--sandstone-gold-soft)" accentFill="var(--terracotta)" />
        {/* Tabela */}
        <rect x="615" y="132" width="112" height="17" rx="3" fill="var(--campus-surface)" stroke="var(--courtyard-sage)" strokeWidth="1.4" />
        <text x="671" y="143.5" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="var(--seljuk-navy)">
          Kitap ve Hikâye
        </text>
      </g>

      {/* Taş Zeminli Yürüyüş Yolları ve Merkezi Yıldızlı Avlu Meydanı */}
      <g>
        {/* Ana Yürüyüş Yolu (Ön Kapıdan Meydana ve Binalara) */}
        <path
          d="M 129 149 Q 210 184 352 194 L 448 194 Q 590 184 671 149"
          fill="none"
          stroke="var(--stone-dark)"
          strokeWidth="24"
          strokeLinecap="round"
        />
        <path
          d="M 129 149 Q 210 184 352 194 L 448 194 Q 590 184 671 149"
          fill="none"
          stroke="var(--stone-light)"
          strokeWidth="20"
          strokeLinecap="round"
        />
        <path
          d="M 400 260 L 400 149"
          fill="none"
          stroke="var(--stone-dark)"
          strokeWidth="36"
        />
        <path
          d="M 400 260 L 400 149"
          fill="none"
          stroke="url(#stonePlazaGrad)"
          strokeWidth="31"
        />

        {/* Merkezi Taş Döşeli Avlu Meydanı */}
        <ellipse
          cx="400"
          cy="196"
          rx="74"
          ry="28"
          fill="url(#stonePlazaGrad)"
          stroke="var(--stone-dark)"
          strokeWidth="2"
        />
        <ellipse
          cx="400"
          cy="196"
          rx="58"
          ry="20"
          fill="none"
          stroke="var(--stone-mid)"
          strokeWidth="1.2"
          strokeDasharray="6 4"
        />
        {/* Taş Derz İzleri */}
        <line x1="385" y1="234" x2="415" y2="234" stroke="var(--stone-mid)" strokeWidth="1.4" />
        <line x1="386" y1="248" x2="414" y2="248" stroke="var(--stone-mid)" strokeWidth="1.4" />

        <SeljukStarMotif
          cx={400}
          cy={196}
          radius={14}
          fill="var(--seljuk-teal)"
          stroke="var(--seljuk-navy)"
          innerFill="var(--sandstone-gold-soft)"
          accentFill="var(--terracotta)"
          variant="medallion"
        />
      </g>

      {/* Avlu Ağaçları ve Yeşil Çevre Düzenlemesi */}
      <g>
        {/* Sol Bahçe Grubu */}
        <rect x="249" y="142" width="5" height="22" fill="var(--wood-deep)" />
        <ellipse cx="251.5" cy="118" rx="11" ry="26" fill="var(--courtyard-sage)" />
        <circle cx="272" cy="144" r="14" fill="var(--courtyard-sage-mid)" />
        <circle cx="28" cy="148" r="16" fill="var(--courtyard-sage)" />
        <circle cx="222" cy="222" r="15" fill="var(--courtyard-sage-mid)" />
        <circle cx="242" cy="230" r="11" fill="var(--courtyard-sage)" />

        {/* Sağ Bahçe Grubu */}
        <rect x="546" y="142" width="5" height="22" fill="var(--wood-deep)" />
        <ellipse cx="548.5" cy="118" rx="11" ry="26" fill="var(--courtyard-sage)" />
        <circle cx="528" cy="144" r="14" fill="var(--courtyard-sage-mid)" />
        <circle cx="772" cy="148" r="16" fill="var(--courtyard-sage)" />
        <circle cx="584" cy="224" r="15" fill="var(--courtyard-sage-mid)" />
        <circle cx="604" cy="232" r="10" fill="var(--courtyard-sage)" />
      </g>

      {/* Yönlendirme Levhası (Ahşap ve Krem Taş Gövdeli Kampüs Tabelası) */}
      <g>
        <rect x="488" y="172" width="6" height="58" rx="1" fill="var(--wood-deep)" />
        <rect x="482" y="226" width="18" height="6" rx="2" fill="var(--stone-mid)" stroke="var(--stone-deep)" strokeWidth="1.2" />

        {/* Üst Levha Oku (Sola) */}
        <path d="M 426 174 L 494 174 L 494 188 L 426 188 L 418 181 Z" fill="var(--campus-surface)" stroke="var(--seljuk-navy)" strokeWidth="1.4" />
        <text x="458" y="184" textAnchor="middle" fontSize="8" fontWeight="700" fill="var(--seljuk-navy)">
          ← Keşif Alanı
        </text>

        {/* Orta Levha Oku (Sağa) */}
        <path d="M 488 192 L 560 192 L 568 199 L 560 206 L 488 206 Z" fill="var(--seljuk-teal-soft)" stroke="var(--seljuk-teal)" strokeWidth="1.4" />
        <text x="526" y="202" textAnchor="middle" fontSize="8" fontWeight="700" fill="var(--seljuk-navy)">
          Atölyeler →
        </text>

        {/* Alt Levha (Keşif Avlusu) */}
        <rect x="462" y="210" width="58" height="14" rx="2" fill="var(--sandstone-gold-soft)" stroke="var(--terracotta)" strokeWidth="1.2" />
        <text x="491" y="220" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="var(--terracotta-deep)">
          Keşif Avlusu
        </text>
      </g>
    </svg>
  );
}
