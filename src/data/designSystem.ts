import type { GradeLevel, GradeTier } from '@/src/types/campus';
import { getGradeProfile } from '@/src/data/gradeProfiles';

export interface DesignColorToken {
  name: string;
  cssVar: string;
  hex: string;
  role: string;
}

export interface DesignColorGroup {
  id: string;
  title: string;
  tokens: DesignColorToken[];
}

export const DESIGN_COLOR_GROUPS: DesignColorGroup[] = [
  {
    id: 'surfaces',
    title: 'Taş-Krem Yüzeyler ve Metin Hiyerarşisi',
    tokens: [
      { name: 'Kampüs Zemini', cssVar: '--campus-canvas', hex: '#f6f1e6', role: 'Ana sayfa arka planı' },
      { name: 'Kart Yüzeyi', cssVar: '--campus-surface', hex: '#fffdf8', role: 'Birincil içerik ve görev kartları' },
      { name: 'Yumuşak Taş Yüzey', cssVar: '--campus-surface-muted', hex: '#eee6d5', role: 'Hover ve ikincil zemin' },
      { name: 'Taş Çerçeve', cssVar: '--campus-border', hex: '#d7cab2', role: 'Bölüm ve kart kenarlıkları' },
      { name: 'Ana Mürekkep', cssVar: '--campus-ink', hex: '#172b47', role: 'Yüksek kontrastlı başlık ve gövde metni' },
      { name: 'Yardımcı Mürekkep', cssVar: '--campus-ink-muted', hex: '#4b5a6e', role: 'İkincil açıklamalar ve etiketler' },
    ],
  },
  {
    id: 'seljuk',
    title: 'Anadolu–Selçuklu Mimari Vurgu Renkleri',
    tokens: [
      { name: 'Selçuklu Laciverti', cssVar: '--seljuk-navy', hex: '#1b3152', role: 'Başlık, mimari taç çizgisi ve güçlü vurgu' },
      { name: 'Selçuklu Turkuazı', cssVar: '--seljuk-teal', hex: '#0e768a', role: 'Birincil eylem düğmeleri ve odak halkası' },
      { name: 'Turkuaz Yumuşak', cssVar: '--seljuk-teal-soft', hex: '#dcf0f3', role: 'Seçili durum ve öğrenme kutuları' },
      { name: 'Toprak (Terracotta)', cssVar: '--terracotta', hex: '#b25938', role: 'Gezi ve keşif sıcak vurgu tonu' },
      { name: 'Kumtaşı Altını', cssVar: '--sandstone-gold', hex: '#a66414', role: 'İpucu, dikkat ve rehber vurgusu' },
      { name: 'Avlu Yeşili', cssVar: '--courtyard-sage', hex: '#2d7350', role: 'Tamamlandı durumu ve üretim onayı' },
    ],
  },
];

export const TURKISH_FONT_STACK =
  "'Avenir Next', 'Segoe UI', 'SF Pro Text', system-ui, -apple-system, BlinkMacSystemFont, sans-serif";

export interface TypographyScaleItem {
  id: string;
  label: string;
  className: string;
  spec: string;
  sample: string;
}

export const TYPOGRAPHY_SCALE: TypographyScaleItem[] = [
  {
    id: 'display',
    label: 'Kampüs Ana Başlık (H1)',
    className: 'text-2xl sm:text-3xl font-bold tracking-tight text-[var(--seljuk-navy)]',
    spec: '24–30 px · Kalın (700) · text-wrap: balance',
    sample: 'Anadolu–Selçuklu Esintili Dijital Öğrenme Kampüsü',
  },
  {
    id: 'section',
    label: 'Bölüm Başlığı (H2)',
    className: 'text-lg sm:text-xl font-bold text-[var(--seljuk-navy)]',
    spec: '18–20 px · Kalın (700) · Satır yüksekliği 1.35',
    sample: 'Keşfet → Öğren → Üret → Paylaş Akışı',
  },
  {
    id: 'card',
    label: 'Kart ve Etkinlik Başlığı (H3)',
    className: 'text-base font-bold text-[var(--campus-ink)]',
    spec: '16 px · Kalın (700)',
    sample: 'Sultanhanı Kervansarayı Taç Kapısı',
  },
  {
    id: 'body',
    label: 'Gövde Metni (Türkçe Karakter Testi)',
    className: 'text-sm sm:text-base text-[var(--campus-ink)] leading-relaxed',
    spec: '14–16 px · Normal (400) · Satır yüksekliği 1.6',
    sample: 'Çocuklar için açık, anlaşılır ve sıcak Türkçe arayüz: Ç, Ğ, İ, Ö, Ş, Ü / ç, ğ, ı, ö, ş, ü.',
  },
  {
    id: 'numeric',
    label: 'Sayısal Gösterge (Tabular Nums)',
    className: 'text-xs sm:text-sm font-semibold tabular-nums text-[var(--seljuk-teal)]',
    spec: '12–14 px · Yarı kalın (600) · font-variant-numeric: tabular-nums',
    sample: 'Adım 2 / 4 · 5. Sınıf · %75 İlerleme',
  },
];

export const BREAKPOINT_TOKENS = [
  {
    id: 'xs',
    name: 'Küçük Telefon',
    width: '360 px',
    layout: 'Tek sütun dikey akış, alt mobil gezinme çubuğu, tam genişlik düğmeler',
  },
  {
    id: 'sm',
    name: 'Standart Telefon',
    width: '390–640 px',
    layout: 'Tüm dokunma hedefleri en az 44×44 px, yatay taşma 0 px',
  },
  {
    id: 'md',
    name: 'Tablet (md)',
    width: '768 px+',
    layout: 'Üst yatay gezinme çubuğu açılır, kartlar 2 sütuna yerleşir',
  },
  {
    id: 'lg',
    name: 'Masaüstü (lg/xl)',
    width: '1024–1280 px',
    layout: 'Maksimum 1024–1152 px okuma genişliği, 2,5B kampüs haritası ve 4 sütun durak ızgarası',
  },
];

export const REDUCED_MOTION_RULES = [
  'CSS @media (prefers-reduced-motion: reduce) altında tüm geçiş ve animasyon süreleri 0.01ms değerine iner.',
  'İzometrik bina yükselme (.iso-building-trigger) ve yumuşak kaydırma hareketleri otomatik olarak kapatılır.',
  'Motion sağlayıcısı (MotionConfig reducedMotion="user") işletim sistemi ayarını doğrudan uygular.',
  'Giriş kapısında her kullanıcı için tek dokunuşluk "Animasyonu Atla" seçeneği daima etkindir.',
];

export interface VisualLanguageSpec {
  grade: GradeLevel;
  tier: GradeTier;
  label: string;
  touchMinHeightClass: string;
  cardPaddingClass: string;
  headingScaleClass: string;
  bodyScaleClass: string;
  visualDensityLabel: string;
  guidanceTone: string;
  motifRule: string;
}

/**
 * 2–7. sınıflar için ortak Anadolu–Selçuklu kimliği içinde yaşa uyarlanabilir görsel dil kuralları.
 */
export function getVisualLanguageSpec(grade: unknown): VisualLanguageSpec {
  const profile = getGradeProfile(grade);
  if (profile.tier === 'ilkokul') {
    return {
      grade: profile.grade as GradeLevel,
      tier: profile.tier,
      label: profile.label,
      touchMinHeightClass: 'min-h-[48px]',
      cardPaddingClass: 'p-5 sm:p-6',
      headingScaleClass: 'text-xl sm:text-2xl',
      bodyScaleClass: 'text-sm sm:text-base',
      visualDensityLabel:
        profile.grade === 2
          ? 'En ferah görünüm · Her adımda açık kısa ipucu ve geniş dokunma alanı'
          : 'Ferah ilkokul düzeni · Kısa yönerge, sade kartlar ve büyük eylem düğmeleri',
      guidanceTone: `En çok ${profile.maxInstructionWords} sözcüklü yönerge · ${profile.textComplexity}`,
      motifRule: 'Yalnızca yönlendirme ve görsel tanıma için tek odaklı Anadolu motifi kullanılır.',
    };
  }

  return {
    grade: profile.grade as GradeLevel,
    tier: profile.tier,
    label: profile.label,
    touchMinHeightClass: 'min-h-[44px]',
    cardPaddingClass: 'p-4 sm:p-5',
    headingScaleClass: 'text-lg sm:text-xl',
    bodyScaleClass: 'text-sm',
    visualDensityLabel: 'Dengeli ortaokul düzeni · Karşılaştırmalı kartlar, ölçütsel göstergeler ve aşama çubuğu',
    guidanceTone: `En çok ${profile.maxInstructionWords} sözcüklü yönerge · ${profile.textComplexity}`,
    motifRule: 'Başlık taç çizgisi ve bölüm rozetlerinde ölçülü Anadolu geometrik çizgisi korunur.',
  };
}
