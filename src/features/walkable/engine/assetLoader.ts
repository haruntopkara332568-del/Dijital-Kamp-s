/**
 * Yürünebilir Kampüs Görsel Varlık Yükleyicisi (Asset Loader & Cache)
 * 2,5B yüksek kaliteli görselleri tarayıcıda önceden yükler ve Canvas 2D render motoruna sunar.
 */

const assetCache: Map<string, HTMLImageElement> = new Map();

/**
 * Belirtilen URL'deki görseli önbellekten alır veya yeni yükleme başlatır.
 */
export function getLoadedAsset(url: string): HTMLImageElement | null {
  if (typeof window === 'undefined') return null;

  let img = assetCache.get(url);
  if (!img) {
    img = new Image();
    img.src = url;
    assetCache.set(url, img);
  }

  // Görsel tamamen yüklendiyse ve geçerli bir boyutu varsa döndür
  return img.complete && img.naturalWidth > 0 ? img : null;
}

/**
 * İngilizce Dünyası Binası yüksek kaliteli görselini döner.
 */
export const ENGLISH_BUILDING_ASSET_URL = '/assets/walkable/building_english.png';

export function getEnglishBuildingAsset(): HTMLImageElement | null {
  return getLoadedAsset(ENGLISH_BUILDING_ASSET_URL);
}

/**
 * Test veya özel durumlar için önbelleğe doğrudan görsel nesnesi ekleme.
 */
export function setCachedAssetForTesting(url: string, img: HTMLImageElement) {
  assetCache.set(url, img);
}

/**
 * Yürünebilir sahne varlıklarını arka planda erkenden önbelleğe alır.
 */
export function preloadWalkableAssets() {
  if (typeof window === 'undefined') return;
  getLoadedAsset(ENGLISH_BUILDING_ASSET_URL);
}

// Modül yüklendiğinde otomatik ön yükleme başlat
preloadWalkableAssets();
