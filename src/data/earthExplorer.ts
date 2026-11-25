import turkeyPolygons from './turkeyNaturalEarth.json';

export const EARTH_TURKEY_POINT = { lonDeg: 32.79259107, latDeg: 39.9070700722 } as const;

export const EARTH_LAYERS = [
  { name: 'Yer kabuğu', color: '#c79268', radius: 1, description: 'Dıştaki ince, katı kaya katmanı.' },
  { name: 'Manto', color: '#d35a39', radius: 0.965, description: 'En kalın katman. Büyük ölçüde katı, sıcak kayadan oluşur.' },
  { name: 'Dış çekirdek', color: '#ffad3b', radius: (6371 - 2900) / 6371, description: 'Sıvı metalden oluşur.' },
  { name: 'İç çekirdek', color: '#ffe39e', radius: (6371 - 5155) / 6371, description: 'Dünya’nın merkezindeki katı metal katmanı.' },
] as const;

function isInsideRing(lon: number, lat: number, ring: readonly number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[j];
    if ((y1 > lat) !== (y2 > lat) && lon < x1 + (x2 - x1) * (lat - y1) / (y2 - y1)) {
      inside = !inside;
    }
  }
  return inside;
}

export function isInTurkey(lon: number, lat: number): boolean {
  return turkeyPolygons.some(([outer, ...holes]) =>
    isInsideRing(lon, lat, outer) && !holes.some((hole) => isInsideRing(lon, lat, hole)),
  );
}
