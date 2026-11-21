/**
 * Yeni Nesil Külliye — Merkezî Marka ve Mimari İsim Yapılandırması (Aşama: Onarım 02)
 *
 * Bu dosya projenin tek ve güvenilir marka kaynağıdır (Single Source of Truth).
 * Tüm aktif kullanıcı arayüzleri, başlıklar, Canvas kitabeleri ve SVG çizimleri
 * marka ve bina isimlerini bu yapılandırmadan tüketir.
 */

export const CAMPUS_BRAND = {
  /** Ana marka adı */
  name: 'Yeni Nesil Külliye',
  /** Alt başlık */
  subtitle: 'Dijital Öğrenme Kampüsü',
  /** Slogan (virgülü ve kelime sırası kesin) */
  slogan: 'Geçmişin bilgeliği, geleceğin öğrenme dünyası',
} as const;

export const CAMPUS_BUILDING_NAMES = {
  /** İngilizce öğrenme binası */
  english: 'İngilizce Öğreniyorum',
  /** Gezi ve keşif binası */
  discovery: 'Hayalden Gerçeğe',
  /** Kitap ve hikâye binası */
  library: 'Hikâyeden Hayata',
  observatory: 'Yerden Göklere',
  missions: 'Kızıl Minare Camii',
} as const;

export const CAMPUS_INSCRIPTION_NAMES = {
  /** Taç kapı üstü anıtsal kitabe ana adı (Büyük Harf) */
  brand: 'YENİ NESİL KÜLLİYE',
  /** İngilizce binası mimari kitabesi (Büyük Harf) */
  english: 'İNGİLİZCE ÖĞRENİYORUM',
  /** Gezi binası mimari kitabesi (Büyük Harf) */
  discovery: 'HAYALDEN GERÇEĞE',
  /** Hikâye binası mimari kitabesi */
  library: CAMPUS_BUILDING_NAMES.library,
} as const;

/**
 * Onarım 03A — Doğrudan Mimari Taş Duvar Yazıları (İki Satırlı Doğal Tipografi)
 * Levha/kutu/tabela olmaksızın, doğrudan bina cephe taşlarına kazınan isimler.
 */
export const CAMPUS_ARCHITECTURAL_INSCRIPTIONS = {
  english: ['İngilizce', 'Öğreniyorum'],
  discovery: ['Hayalden', 'Gerçeğe'],
  library: ['Hikâyeden', 'Hayata'],
  journey: ['Kampüs', 'Yolculuğum'],
  missions: ['Keşif', 'Görevleri'],
} as const;
