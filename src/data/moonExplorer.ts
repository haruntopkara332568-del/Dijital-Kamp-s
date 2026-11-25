// Feature centers and diameters: IAU / USGS Gazetteer of Planetary Nomenclature.
export const MOON_PLACES = [
  { id: 'tycho', name: 'Tycho Krateri', latitude: -43.31, longitude: -11.36, detail: 'Yaklaşık 86 km genişliğinde.' },
  { id: 'copernicus', name: 'Copernicus Krateri', latitude: 9.62, longitude: -20.08, detail: 'Yaklaşık 96 km genişliğinde.' },
  { id: 'imbrium', name: 'Yağmurlar Denizi', latitude: 34.72, longitude: -14.91, detail: 'Koyu renkli, geniş bir lav düzlüğü.' },
] as const;

export const MOON_ORBIT_START = 45;

export function getMoonPhase(angle: number) {
  const offsetFromQuarter = ((angle + 45) % 90) - 45;
  if (Math.abs(offsetFromQuarter) <= 4) {
    const quarter = Math.round(angle / 90) % 4;
    return ['Yeni ay', 'İlk dördün', 'Dolunay', 'Son dördün'][quarter];
  }

  if (angle < 90) return 'Büyüyen hilal';
  if (angle < 180) return 'Büyüyen şişkin ay';
  if (angle < 270) return 'Küçülen şişkin ay';
  return 'Küçülen hilal';
}
