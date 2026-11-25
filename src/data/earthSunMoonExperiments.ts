export type ActiveExperimentId = 'exp-sunlight' | 'exp-day-night' | 'exp-moon-phases';

export type MoonPhaseId = 'new-moon' | 'first-quarter' | 'full-moon' | 'last-quarter';

export const ACTIVE_DISCOVERY_MISSION_ID = 'yerden-goklere-aktif-kesif-dga';
export const ACTIVE_DISCOVERY_MISSION_VERSION = '1.0';

export interface MoonPhaseDefinition {
  id: MoonPhaseId;
  label: string;
  /**
   * Yörünge açısı (derece): Güneş solda (180°) sabit iken, Kuzey Kutbu üstünden
   * saat yönünün tersine:
   * 0° = Yeni ay (Güneş ile Dünya arasında, solda)
   * 90° = İlk dördün (altta, sağ yarısı aydınlık)
   * 180° = Dolunay (sağda, tam aydınlık)
   * 270° = Son dördün (üstte, sol yarısı aydınlık)
   */
  phaseAngleDeg: number;
  earthViewSummary: string;
  shortDescription: string;
}

export const MOON_PHASES: readonly MoonPhaseDefinition[] = [
  {
    id: 'new-moon',
    label: 'Yeni ay',
    phaseAngleDeg: 0,
    earthViewSummary: 'Dünya’dan bakan yüzü karanlık görünür.',
    shortDescription:
      'Ay, Güneş ile Dünya arasında kaldığında aydınlanan yarısı Güneş’e bakar; Dünya’dan karanlık görünür.',
  },
  {
    id: 'first-quarter',
    label: 'İlk dördün',
    phaseAngleDeg: 90,
    earthViewSummary: 'Dünya’dan sağ yarısı aydınlık (D biçiminde) görünür.',
    shortDescription:
      'Ay yörüngesinde çeyrek tur ilerlediğinde Güneş’in aydınlattığı yarısının yarısını (sağ yarısını) görürüz.',
  },
  {
    id: 'full-moon',
    label: 'Dolunay',
    phaseAngleDeg: 180,
    earthViewSummary: 'Dünya’dan tamamı parlak ve yuvarlak görünür.',
    shortDescription:
      'Ay, Dünya’nın Güneş’e göre karşı tarafındayken Güneş’in aydınlattığı yüzün tamamı Dünya’ya döner.',
  },
  {
    id: 'last-quarter',
    label: 'Son dördün',
    phaseAngleDeg: 270,
    earthViewSummary: 'Dünya’dan sol yarısı aydınlık (ters D biçiminde) görünür.',
    shortDescription:
      'Ay yörüngesinin son çeyreğindeyken Güneş’in aydınlattığı bölümün sol yarısı Dünya’dan görünür.',
  },
] as const;

export const TURKEY_COORDS = {
  lonDeg: 35,
  latDeg: 39,
  label: 'Türkiye',
} as const;

export const ACTIVE_DISCOVERY_UI_COPY = {
  sectionTabLabel: 'Aktif Keşif Deneyleri',
  learnTabLabel: 'Gök Cisimlerini Tanı',
  representativeBadge: 'Temsilî gösterim',
  turnOnLightLabel: 'Işığı Aç',
  spinLabel: 'Döndür',
  pauseLabel: 'Durdur',
  resetLabel: 'Başa Dön',
} as const;

export const ACTIVE_EXPERIMENTS = [
  { id: 'exp-sunlight', shortTitle: 'Güneş’in Işığı', title: 'Güneş’in Işığını Keşfediyorum' },
  { id: 'exp-day-night', shortTitle: 'Gündüz ve Gece', title: 'Gündüzü ve Geceyi Oluşturuyorum' },
  { id: 'exp-moon-phases', shortTitle: 'Ay’ın Evreleri', title: 'Ay’ın Evrelerini Keşfediyorum' },
] as const;

export function detectMoonPhaseAtAngle(phaseAngleDeg: number): MoonPhaseDefinition | null {
  const normalized = ((phaseAngleDeg % 360) + 360) % 360;
  for (const phase of MOON_PHASES) {
    let diff = Math.abs(normalized - phase.phaseAngleDeg);
    if (diff > 180) diff = 360 - diff;
    if (diff <= 16) return phase;
  }
  return null;
}

/**
 * Küre üzerindeki yerel boylam/enlem noktasını geçerli rotY / rotX
 * görünüm koordinatlarına (nx, ny, nz) dönüştürür.
 */
export function projectSurfacePoint(
  lonDeg: number,
  latDeg: number,
  rotY: number,
  rotX: number,
): { nx: number; ny: number; nz: number } {
  const lon = (lonDeg * Math.PI) / 180;
  const lat = (latDeg * Math.PI) / 180;
  const cosLat = Math.cos(lat);
  const lx = Math.sin(lon) * cosLat;
  const ly = Math.sin(lat);
  const lz = Math.cos(lon) * cosLat;

  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);

  const nx = lx * cosY - lz * sinY;
  const z1 = lx * sinY + lz * cosY;
  const y1 = -ly;
  const ny = y1 * cosX + z1 * sinX;
  const nz = -y1 * sinX + z1 * cosX;

  return { nx, ny, nz };
}
