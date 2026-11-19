import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, CheckCircle2, Eye, HelpCircle, Sparkles } from 'lucide-react';
import { CampusTopBar } from '@/src/components/CampusTopBar';
import { CampusLabelTag } from '@/src/components/CampusLabelTag';
import { AnatolianMotifSvg, type AnatolianMotifVariant } from '@/src/components/svg/AnatolianMotifSvg';
import {
  CampusBadge,
  CampusButton,
  CampusCard,
  CampusProgressBar,
  CampusSectionHeader,
} from '@/src/components/ui/CampusDesignSystem';
import {
  BREAKPOINT_TOKENS,
  DESIGN_COLOR_GROUPS,
  REDUCED_MOTION_RULES,
  TURKISH_FONT_STACK,
  TYPOGRAPHY_SCALE,
  getVisualLanguageSpec,
} from '@/src/data/designSystem';
import { GRADE_LIST } from '@/src/data/gradeProfiles';
import { CAMPUS_BRAND } from '@/src/data/brandConfig';
import type { GradeLevel } from '@/src/types/campus';

const MOTIF_ITEMS: Array<{ variant: AnatolianMotifVariant; title: string; usage: string }> = [
  {
    variant: 'seljuk-star',
    title: 'Sekiz Köşeli Selçuklu Yıldızı',
    usage: 'Karşılama avlusu merkez meydanı ve taç kapı madalyonları',
  },
  {
    variant: 'stone-arch',
    title: 'Anadolu Taş Kemeri',
    usage: 'Öğrenme yapıları girişleri ve Sultanhanı gözlem kartları',
  },
  {
    variant: 'brick-zigzag',
    title: 'Tuğla ve Çini Zikzak Kuşağı',
    usage: 'Bölüm ayraçları ve Eğri Minare görsel kimliği',
  },
  {
    variant: 'tile-medallion',
    title: 'Turkuaz Çini Madalyon',
    usage: 'Başarı göstergeleri ve rehber portre çerçeveleri',
  },
];

export function DesignSystemPreviewView() {
  const [previewGrade, setPreviewGrade] = useState<GradeLevel>(2);
  const visualSpec = getVisualLanguageSpec(previewGrade);

  return (
    <>
      <CampusTopBar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/harita"
            className="min-h-[44px] px-3.5 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--campus-surface)] hover:bg-[var(--campus-surface-muted)] text-xs font-semibold text-[var(--seljuk-navy)] inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Kampüs Haritasına Dön</span>
          </Link>

          <CampusBadge tone="navy">Aşama 2 · Tasarım Sistemi Ön İzlemesi</CampusBadge>
        </div>

        {/* Üst Başlık ve 2–7. Sınıf Uyarlanabilir Görsel Dil Seçicisi */}
        <CampusCard tone="surface" tier={visualSpec.tier} showCrownAccent>
          <div className="space-y-4">
            <CampusSectionHeader
              eyebrow="Ortak Anadolu–Selçuklu Görsel Dili"
              title={`${CAMPUS_BRAND.name} Tasarım Sistemi`}
              description="Taş beji, krem, turkuaz, lacivert, toprak tonları ve adaçayı yeşili üzerine kurulu; 2–4. sınıflar için ortak ama yaş düzeyine uyarlanabilir sade bileşen kütüphanesi."
              headingLevel="h1"
              tier={visualSpec.tier}
            />

            <div className="rounded-xl border border-[var(--campus-border)] bg-[var(--stone-cream)] p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs sm:text-sm font-bold text-[var(--seljuk-navy)]">
                  Sınıf Düzeyi Görsel Dil Ön İzlemesi ({visualSpec.label})
                </p>
                <CampusBadge tone={visualSpec.tier === 'ilkokul' ? 'teal' : 'navy'}>
                  {visualSpec.tier === 'ilkokul' ? 'İlkokul (2–4)' : 'Ortaokul (5–7)'}
                </CampusBadge>
              </div>

              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label="Sınıf düzeyi görsel dil ön izlemesi"
              >
                {GRADE_LIST.map((profile) => {
                  const active = previewGrade === profile.grade;
                  return (
                    <CampusButton
                      key={profile.grade}
                      variant={active ? 'primary' : 'outline'}
                      tier={visualSpec.tier}
                      aria-pressed={active}
                      onClick={() => setPreviewGrade(profile.grade)}
                    >
                      {profile.label}
                    </CampusButton>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-[var(--campus-ink-muted)] pt-1">
                <div className="rounded-lg bg-[var(--campus-surface)] border border-[var(--campus-border)] p-3">
                  <p className="font-bold text-[var(--seljuk-navy)]">Yoğunluk ve Dokunma Alanı</p>
                  <p className="mt-1">{visualSpec.visualDensityLabel}</p>
                </div>
                <div className="rounded-lg bg-[var(--campus-surface)] border border-[var(--campus-border)] p-3">
                  <p className="font-bold text-[var(--seljuk-navy)]">Yönerge ve Tipografi Dili</p>
                  <p className="mt-1">{visualSpec.guidanceTone}</p>
                </div>
                <div className="rounded-lg bg-[var(--campus-surface)] border border-[var(--campus-border)] p-3">
                  <p className="font-bold text-[var(--seljuk-navy)]">Sade Motif İlkesi</p>
                  <p className="mt-1">{visualSpec.motifRule}</p>
                </div>
              </div>
            </div>
          </div>
        </CampusCard>

        {/* 1. Ortak Renk Belirteçleri */}
        <CampusCard tone="surface" tier={visualSpec.tier}>
          <div className="space-y-5">
            <CampusSectionHeader
              eyebrow="1. Renk Belirteçleri (globals.css)"
              title="Anadolu Taş ve Çini Renk Sistemi"
              description="Tüm arayüz ve özgün SVG bileşenleri sabit renk kodları yerine yalnızca merkezi CSS belirteçlerini kullanır."
              tier={visualSpec.tier}
            />

            <div className="space-y-5">
              {DESIGN_COLOR_GROUPS.map((group) => (
                <div key={group.id} className="space-y-2.5">
                  <h3 className="text-sm font-bold text-[var(--seljuk-navy)]">{group.title}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {group.tokens.map((token) => (
                      <div
                        key={token.cssVar}
                        className="rounded-xl border border-[var(--campus-border)] bg-[var(--campus-canvas)] p-3 flex items-center gap-3"
                      >
                        <span
                          aria-hidden="true"
                          className="w-11 h-11 rounded-lg border border-[var(--campus-border)] shrink-0"
                          style={{ backgroundColor: `var(${token.cssVar})` }}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[var(--campus-ink)]">{token.name}</p>
                          <p className="text-[11px] font-mono text-[var(--seljuk-teal)]">
                            {token.cssVar} · {token.hex}
                          </p>
                          <p className="text-[11px] text-[var(--campus-ink-muted)] truncate">
                            {token.role}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CampusCard>

        {/* 2. Türkçe Destekli Yerel Yazı Tipi ve Tipografi */}
        <CampusCard tone="surface" tier={visualSpec.tier}>
          <div className="space-y-4">
            <CampusSectionHeader
              eyebrow="2. Yerel Yazı Tipi ve Tipografi"
              title="Türkçe Karakter ve Okunabilirlik Ölçeği"
              description={`Harici yazı tipi veya CDN isteği olmadan yerel sistem ailesi (${TURKISH_FONT_STACK}) kullanılır.`}
              tier={visualSpec.tier}
            />

            <div className="space-y-3">
              {TYPOGRAPHY_SCALE.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-[var(--campus-border)] bg-[var(--campus-canvas)] p-4 space-y-1"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--campus-ink-muted)]">
                    <span className="font-semibold text-[var(--seljuk-teal)]">{item.label}</span>
                    <span className="tabular-nums">{item.spec}</span>
                  </div>
                  <p className={item.className}>{item.sample}</p>
                </div>
              ))}
            </div>
          </div>
        </CampusCard>

        {/* 3. Düğmeler, Kartlar, İlerleme Göstergesi ve Göstergeler */}
        <CampusCard tone="surface" tier={visualSpec.tier}>
          <div className="space-y-6">
            <CampusSectionHeader
              eyebrow="3. Etkileşimli Bileşenler ve Durum Göstergeleri"
              title="Düğmeler, Kartlar, İlerleme Çubuğu ve Odak Halkası"
              description="Sekme (Tab) tuşuyla gezinildiğinde her öğede 3 px yüksek kontrastlı Turkuaz odak halkası (:focus-visible) görünür."
              tier={visualSpec.tier}
            />

            <div className="space-y-2.5">
              <p className="text-xs font-bold text-[var(--seljuk-navy)]">
                Düğme Varyantları ({visualSpec.tier === 'ilkokul' ? '48 px İlkokul' : '44 px Ortaokul'} dokunma yüksekliği)
              </p>
              <div className="flex flex-wrap gap-3">
                <CampusButton variant="primary" tier={visualSpec.tier}>
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  <span>Birincil Eylem</span>
                </CampusButton>
                <CampusButton variant="secondary" tier={visualSpec.tier}>
                  <Eye className="w-4 h-4" aria-hidden="true" />
                  <span>İkincil Eylem</span>
                </CampusButton>
                <CampusButton variant="outline" tier={visualSpec.tier}>
                  <HelpCircle className="w-4 h-4 text-[var(--sandstone-gold)]" aria-hidden="true" />
                  <span>İpucu / Çerçeveli</span>
                </CampusButton>
                <CampusButton variant="danger" tier={visualSpec.tier}>
                  <span>Uyarı / Silme</span>
                </CampusButton>
                <CampusButton variant="primary" tier={visualSpec.tier} disabled>
                  <span>Pasif Durum</span>
                </CampusButton>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CampusCard tone="stone" tier={visualSpec.tier}>
                <CampusSectionHeader
                  eyebrow="Taş-Krem Kart"
                  title="Gözlem Kartı Örneği"
                  description="İçerik alanlarında yumuşak taş zemini dikkat dağıtmadan ayırır."
                  headingLevel="h3"
                  tier={visualSpec.tier}
                  action={<CampusBadge tone="sage"><CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />Doğrulandı</CampusBadge>}
                />
              </CampusCard>

              <CampusCard tone="teal-soft" tier={visualSpec.tier}>
                <CampusSectionHeader
                  eyebrow="Turkuaz Vurgu Kartı"
                  title="İngilizce Öğrenme Kartı"
                  description="Öğrenme adımlarında odak kelime ve dinleme düğmesini taşır."
                  headingLevel="h3"
                  tier={visualSpec.tier}
                  action={<CampusBadge tone="terracotta">4 Durak</CampusBadge>}
                />
              </CampusCard>
            </div>

            <div className="rounded-xl border border-[var(--campus-border)] bg-[var(--campus-canvas)] p-4 space-y-4">
              <CampusProgressBar
                label="Görev Aşama İlerlemesi"
                current={2}
                total={4}
                steps={[
                  { id: 'kesfet', label: '1. Keşfet', done: true },
                  { id: 'ogren', label: '2. Öğren', active: true },
                  { id: 'uret', label: '3. Üret' },
                  { id: 'paylas', label: '4. Paylaş' },
                ]}
              />

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <CampusBadge tone="teal">Aktif</CampusBadge>
                <CampusBadge tone="navy">Ortaokul 5–7</CampusBadge>
                <CampusBadge tone="sage">Tamamlandı</CampusBadge>
                <CampusBadge tone="gold">Geçici Oturum</CampusBadge>
                <CampusBadge tone="terracotta">Keşif</CampusBadge>
                <CampusBadge tone="neutral">Yakında</CampusBadge>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <CampusLabelTag title="Normal Tabela" subtitle="Örnek Alan" accent="teal" />
                <CampusLabelTag title="Seçili Tabela" subtitle="Aktif Durak" accent="terracotta" selected />
                <CampusLabelTag title="Yakında" subtitle="Hazırlanıyor" accent="navy" disabled />
              </div>
            </div>
          </div>
        </CampusCard>

        {/* 4. Yeniden Kullanılabilir Anadolu Motifli SVG Gösterimi */}
        <CampusCard tone="surface" tier={visualSpec.tier}>
          <div className="space-y-4">
            <CampusSectionHeader
              eyebrow="4. Anadolu Motifli SVG Gösterimi"
              title="Yeniden Kullanılabilir Sade Geometrik Motifler"
              description="Tarihî yapıları birebir kopyalamadan; sekiz köşeli yıldız, taş kemer, tuğla örüntüsü ve çini madalyon motiflerini sadeleştirir."
              tier={visualSpec.tier}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {MOTIF_ITEMS.map((motif) => (
                <div
                  key={motif.variant}
                  className="rounded-xl border border-[var(--campus-border)] bg-[var(--campus-canvas)] p-3.5 space-y-2.5"
                >
                  <AnatolianMotifSvg variant={motif.variant} title={motif.title} className="w-full h-24" />
                  <h3 className="text-sm font-bold text-[var(--seljuk-navy)]">{motif.title}</h3>
                  <p className="text-xs text-[var(--campus-ink-muted)]">{motif.usage}</p>
                </div>
              ))}
            </div>
          </div>
        </CampusCard>

        {/* 5. Mobil Kırılımlar ve Azaltılmış Hareket Ayarları */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CampusCard tone="surface" tier={visualSpec.tier}>
            <div className="space-y-3">
              <CampusSectionHeader
                eyebrow="5. Mobil Kırılımlar"
                title="Ekran Genişliği Davranışı"
                tier={visualSpec.tier}
              />
              <div className="space-y-2.5">
                {BREAKPOINT_TOKENS.map((bp) => (
                  <div
                    key={bp.id}
                    className="rounded-lg border border-[var(--campus-border)] bg-[var(--campus-canvas)] p-3 text-xs"
                  >
                    <p className="font-bold text-[var(--seljuk-navy)] tabular-nums">
                      {bp.name} ({bp.width})
                    </p>
                    <p className="text-[var(--campus-ink-muted)] mt-0.5">{bp.layout}</p>
                  </div>
                ))}
              </div>
            </div>
          </CampusCard>

          <CampusCard tone="surface" tier={visualSpec.tier}>
            <div className="space-y-3">
              <CampusSectionHeader
                eyebrow="6. Azaltılmış Hareket ve Erişilebilirlik"
                title="Hareket Hassasiyeti ve Odak Kuralları"
                tier={visualSpec.tier}
              />
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-[var(--campus-ink-muted)]">
                {REDUCED_MOTION_RULES.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </div>
          </CampusCard>
        </div>
      </main>
    </>
  );
}
