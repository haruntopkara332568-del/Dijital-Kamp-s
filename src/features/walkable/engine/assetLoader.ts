import { getStudentCharacter, STUDENT_CHARACTERS, type StudentCharacterId } from '@/src/data/studentCharacters';

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
 * Varlık URL sabitleri
 */
export const ENGLISH_BUILDING_ASSET_URL = '/assets/walkable/building_english.png';
export const DISCOVERY_BUILDING_ASSET_URL = '/assets/walkable/building_discovery.png';
export const LIBRARY_BUILDING_ASSET_URL = '/assets/walkable/building_library.png';
export const FOUNTAIN_ASSET_URL = '/assets/walkable/plaza_star_fountain.png';
export const MISSIONS_KIOSK_ASSET_URL = '/assets/walkable/kizil_minare_camii_v2.png';
export const JOURNEY_PAVILION_ASSET_URL = '/assets/walkable/kampus_yolculugum_gozlem_evi.png';
export const CYPRESS_TREE_ASSET_URL = '/assets/walkable/tree_cypress.png';
export const SHADE_TREE_ASSET_URL = '/assets/walkable/tree_shade.png';
export const STUDENT_CHARACTER_ATLAS_URL = STUDENT_CHARACTERS[0].atlasUrl;
export const CLASSROOM_BACKGROUND_ASSET_URL = '/assets/walkable/classroom_background.png';
export const CLASSROOM_DESK_ASSET_URL = '/assets/walkable/classroom_desk.png';
export const CLASSROOM_DESK_MIRRORED_ASSET_URL = '/assets/walkable/classroom_desk_mirrored.png';
export const CLASSROOM_TEACHER_PODIUM_ASSET_URL = '/assets/walkable/classroom_teacher_podium.png';
export const CLASSROOM_BOOKSHELF_ASSET_URL = '/assets/walkable/classroom_bookshelf.png';
export const SMARTBOARD_SCREEN_OFF_ASSET_URL = '/assets/walkable/smartboard_screen_off.png';
export const SMARTBOARD_SCREEN_POWERING_ASSET_URL = '/assets/walkable/smartboard_screen_powering.png';
export const SMARTBOARD_SCREEN_ACTIVE_ASSET_URL = '/assets/walkable/smartboard_screen_active.png';
export const SULTANHANI_CARAVANSERAI_ASSET_URL = '/assets/walkable/sultanhani_caravanserai.jpg';
export const SULTANHANI_INNER_COURTYARD_ASSET_URL = '/assets/walkable/sultanhani_inner_courtyard.jpg';

/**
 * Varlık getter fonksiyonları
 */
export function getEnglishBuildingAsset(): HTMLImageElement | null {
  return getLoadedAsset(ENGLISH_BUILDING_ASSET_URL);
}

export function getDiscoveryBuildingAsset(): HTMLImageElement | null {
  return getLoadedAsset(DISCOVERY_BUILDING_ASSET_URL);
}

export function getLibraryBuildingAsset(): HTMLImageElement | null {
  return getLoadedAsset(LIBRARY_BUILDING_ASSET_URL);
}

export function getFountainAsset(): HTMLImageElement | null {
  return getLoadedAsset(FOUNTAIN_ASSET_URL);
}

export function getMissionsKioskAsset(): HTMLImageElement | null {
  return getLoadedAsset(MISSIONS_KIOSK_ASSET_URL);
}

export function getJourneyPavilionAsset(): HTMLImageElement | null {
  return getLoadedAsset(JOURNEY_PAVILION_ASSET_URL);
}

export function getCypressTreeAsset(): HTMLImageElement | null {
  return getLoadedAsset(CYPRESS_TREE_ASSET_URL);
}

export function getShadeTreeAsset(): HTMLImageElement | null {
  return getLoadedAsset(SHADE_TREE_ASSET_URL);
}

export function getStudentCharacterAtlas(characterId?: StudentCharacterId): HTMLImageElement | null {
  const character = characterId ? getStudentCharacter(characterId) : STUDENT_CHARACTERS[0];
  return character ? getLoadedAsset(character.atlasUrl) : null;
}

export function getClassroomBackgroundAsset(): HTMLImageElement | null {
  return getLoadedAsset(CLASSROOM_BACKGROUND_ASSET_URL);
}

export function getClassroomDeskAsset(): HTMLImageElement | null {
  return getLoadedAsset(CLASSROOM_DESK_ASSET_URL);
}

export function getClassroomDeskMirroredAsset(): HTMLImageElement | null {
  return getLoadedAsset(CLASSROOM_DESK_MIRRORED_ASSET_URL);
}

export function getClassroomTeacherPodiumAsset(): HTMLImageElement | null {
  return getLoadedAsset(CLASSROOM_TEACHER_PODIUM_ASSET_URL);
}

export function getClassroomBookshelfAsset(): HTMLImageElement | null {
  return getLoadedAsset(CLASSROOM_BOOKSHELF_ASSET_URL);
}

export function getSmartBoardScreenOffAsset(): HTMLImageElement | null {
  return getLoadedAsset(SMARTBOARD_SCREEN_OFF_ASSET_URL);
}

export function getSmartBoardScreenPoweringAsset(): HTMLImageElement | null {
  return getLoadedAsset(SMARTBOARD_SCREEN_POWERING_ASSET_URL);
}

export function getSmartBoardScreenActiveAsset(): HTMLImageElement | null {
  return getLoadedAsset(SMARTBOARD_SCREEN_ACTIVE_ASSET_URL);
}

export function getSultanhaniCaravanseraiAsset(): HTMLImageElement | null {
  return getLoadedAsset(SULTANHANI_CARAVANSERAI_ASSET_URL);
}

export function getSultanhaniInnerCourtyardAsset(): HTMLImageElement | null {
  return getLoadedAsset(SULTANHANI_INNER_COURTYARD_ASSET_URL);
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
  getLoadedAsset(DISCOVERY_BUILDING_ASSET_URL);
  getLoadedAsset(LIBRARY_BUILDING_ASSET_URL);
  getLoadedAsset(FOUNTAIN_ASSET_URL);
  getLoadedAsset(MISSIONS_KIOSK_ASSET_URL);
  getLoadedAsset(JOURNEY_PAVILION_ASSET_URL);
  getLoadedAsset(CYPRESS_TREE_ASSET_URL);
  getLoadedAsset(SHADE_TREE_ASSET_URL);
  getLoadedAsset(CLASSROOM_BACKGROUND_ASSET_URL);
  getLoadedAsset(CLASSROOM_DESK_ASSET_URL);
  getLoadedAsset(CLASSROOM_DESK_MIRRORED_ASSET_URL);
  getLoadedAsset(CLASSROOM_TEACHER_PODIUM_ASSET_URL);
  getLoadedAsset(CLASSROOM_BOOKSHELF_ASSET_URL);
  getLoadedAsset(SMARTBOARD_SCREEN_OFF_ASSET_URL);
  getLoadedAsset(SMARTBOARD_SCREEN_POWERING_ASSET_URL);
  getLoadedAsset(SMARTBOARD_SCREEN_ACTIVE_ASSET_URL);
  getLoadedAsset(SULTANHANI_CARAVANSERAI_ASSET_URL);
  getLoadedAsset(SULTANHANI_INNER_COURTYARD_ASSET_URL);
}

// Modül yüklendiğinde otomatik ön yükleme başlat
preloadWalkableAssets();
