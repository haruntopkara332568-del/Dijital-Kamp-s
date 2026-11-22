import type { SultanhanıLabel, SultanhanıWord } from './grade3Stage4Content';

type PercentPoint = readonly [number, number];
export type CropRect = { x: number; y: number; width: number; height: number };
export const FULL_RECT: CropRect = { x: 0, y: 0, width: 100, height: 100 };
const rect = (x: number, y: number, width: number, height: number): CropRect => ({ x, y, width, height });

export const SULTANHANI_IMAGES = {
  exterior: { url: '/assets/walkable/sultanhani_caravanserai.jpg', width: 553, height: 466 },
  courtyard: { url: '/assets/walkable/sultanhani_inner_courtyard.jpg', width: 1376, height: 768 },
} as const;
export type SultanhanıImageId = keyof typeof SULTANHANI_IMAGES;
export const SHOW_SULTANHANI_ILLUSTRATION_NOTE = false;

export type SultanhanıHotspot = {
  id: SultanhanıLabel;
  polygon: readonly PercentPoint[];
};

const corners = (x: number, y: number, right: number, bottom: number): PercentPoint[] => [
  [x, y], [right, y], [right, bottom], [x, bottom],
];

// ELLE DOĞRULANACAK. Kapının koyu açıklığı taç kapı çokgeninin dışında bırakılır.
export const SULTANHANI_HOTSPOTS: Record<SultanhanıImageId, readonly SultanhanıHotspot[]> = {
  exterior: [
    { id: 'gate', polygon: [[44, 29], [70, 28], [70, 63], [60.8, 63], [60.8, 51], [53, 51], [53, 63], [44, 63]] },
    { id: 'door', polygon: [[54, 63], [54, 55.5], [56, 52.3], [58, 52.3], [60, 55.5], [60, 63]] },
    { id: 'wall', polygon: corners(72, 40, 84, 61) },
  ],
  courtyard: [
    { id: 'gate', polygon: [[17, 24], [33.5, 28], [33.5, 71], [29.5, 71], [29.5, 55], [22, 55], [22, 71], [17, 72]] },
    { id: 'door', polygon: corners(22.5, 56, 29, 69) },
    { id: 'wall', polygon: corners(77, 35, 91, 46) },
    { id: 'courtyard', polygon: corners(21, 81, 77, 97) },
  ],
};

// ELLE DOĞRULANACAK. Taş, duvarın ayrı bir yakın çekimidir.
export const SULTANHANI_CROPS: Record<SultanhanıWord | 'exterior', { image: SultanhanıImageId; crop: CropRect }> = {
  gate: { image: 'exterior', crop: rect(42, 26, 30, 40) },
  door: { image: 'exterior', crop: rect(52.5, 50, 9, 15) },
  wall: { image: 'exterior', crop: rect(71, 39, 15, 24) },
  courtyard: { image: 'courtyard', crop: rect(17, 79, 68, 20) },
  stone: { image: 'exterior', crop: rect(74, 44, 8, 12) },
  exterior: { image: 'exterior', crop: FULL_RECT },
};

export const SULTANHANI_VIEWS = [
  { id: 'exterior', image: 'exterior', crop: FULL_RECT },
  { id: 'courtyard', image: 'courtyard', crop: FULL_RECT },
] as const;

export type SultanhanıView = (typeof SULTANHANI_VIEWS)[number];
export type SultanhanıViewId = SultanhanıView['id'];

export function hotspotCenter(polygon: readonly PercentPoint[]): PercentPoint {
  const xs = polygon.map(([x]) => x);
  const ys = polygon.map(([, y]) => y);
  return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
}

export function sultanhaniSlots(view: SultanhanıView) {
  const { x, y, width, height } = view.crop;
  return SULTANHANI_HOTSPOTS[view.image].flatMap(({ id, polygon }) => {
    const [cx, cy] = hotspotCenter(polygon);
    if (cx < x || cx > x + width || cy < y || cy > y + height) return [];
    return [{ id, x: (cx - x) / width * 100, y: (cy - y) / height * 100 }];
  });
}

export function polygonArea(points: readonly PercentPoint[]) {
  return Math.abs(points.reduce((area, [x, y], index) => {
    const [nextX, nextY] = points[(index + 1) % points.length];
    return area + x * nextY - y * nextX;
  }, 0)) / 2;
}
