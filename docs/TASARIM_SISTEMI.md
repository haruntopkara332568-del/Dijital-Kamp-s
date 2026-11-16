# Tasarım Sistemi — Anadolu–Selçuklu Esintili Ortak Görsel Dil

Bu belge, **Dijital Eğitim Kampüsü** arayüzündeki ortak tasarım belirteçlerini, Türkçe yerel yazı tipi yapısını, temel arayüz bileşenlerini, yeniden kullanılabilir Anadolu motifli SVG gösterimini ve 2–7. sınıflar için yaşa uyarlanabilir görsel kuralları tanımlar.

## 1. Ortak Renk Belirteçleri (`src/styles/globals.css`)
- **Taş-Krem Yüzeyler**: `--campus-canvas` (`#f6f1e6`), `--campus-surface` (`#fffdf8`), `--campus-surface-muted` (`#eee6d5`), `--campus-border` (`#d7cab2`).
- **Metin Kontrastı**: `--campus-ink` (`#172b47`), `--campus-ink-muted` (`#4b5a6e`).
- **Anadolu–Selçuklu Vurguları**: `--seljuk-navy` (`#1b3152`), `--seljuk-teal` (`#0e768a`), `--terracotta` (`#b25938`), `--sandstone-gold` (`#a66414`), `--courtyard-sage` (`#2d7350`), `--alert-rose` (`#b81d3b`).
- Tüm özgün SVG bileşenleri sabit renk kodu yerine yalnızca bu CSS belirteçlerini kullanır.

## 2. Türkçe Destekli Yerel Yazı Tipi ve Tipografi
- `--font-sans` ve `--font-display`: `'Avenir Next', 'Segoe UI', 'SF Pro Text/Display', system-ui, -apple-system, BlinkMacSystemFont, sans-serif`.
- Harici CDN veya Google Fonts isteği gönderilmez; `ç, ğ, ı, İ, ö, ş, ü` karakterleri yerel işletim sistemi yazı tipiyle tam desteklenir.
- Başlıklarda `text-wrap: balance`, sayısal göstergelerde `.tabular-nums` uygulanır.

## 3. Yeniden Kullanılabilir Tasarım Bileşenleri (`src/components/ui/CampusDesignSystem.tsx`)
- **`CampusButton`**: `primary`, `secondary`, `outline`, `danger` varyantları; ilkokulda `min-h-[48px]`, ortaokulda `min-h-[44px]` dokunma alanı.
- **`CampusCard`**: `surface`, `stone`, `teal-soft`, `gold-soft` yüzeyleri ve isteğe bağlı Anadolu taç çizgisi (`showCrownAccent`).
- **`CampusSectionHeader`**: Kademeye göre ölçeklenen başlık, üst kategori etiketi ve açıklama.
- **`CampusProgressBar`**: Erişilebilir `role="progressbar"` çubuğu ve 4 aşamalı adım göstergesi.
- **`CampusBadge`** & **`CampusLabelTag`**: Sade durum rozetleri ve mimari yapı tabelaları.
- **`AnatolianMotifSvg`** (`src/components/svg/AnatolianMotifSvg.tsx`): `seljuk-star`, `stone-arch`, `brick-zigzag`, `tile-medallion` varyantları.

## 4. Mobil Kırılımlar, Erişilebilirlik ve Azaltılmış Hareket
- **Mobil kırılımlar**: `360 px` (küçük telefon), `390–640 px` (standart mobil), `768 px+` (tablet), `1024–1280 px` (masaüstü); tüm ekranlarda `0 px` yatay taşma ve minimum `44×44 px` dokunma hedefi.
- **Odak görünürlüğü**: Klavye ile gezinmede `:focus-visible` için `3 px solid var(--seljuk-teal)` dış halkası ve `2 px` aralık uygulanır.
- **Azaltılmış hareket**: `@media (prefers-reduced-motion: reduce)` ve `MotionConfig reducedMotion="user"` ile hareketler otomatik kapatılır.

## 5. Görsel Ön İzleme
- Canlı tasarım sistemi ön izleme ekranına `/tasarim-sistemi` adresinden ulaşılabilir.
