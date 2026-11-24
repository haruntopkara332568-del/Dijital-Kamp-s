/** Hayalden Gerçeğe sınıfının perspektifli iç mekânı ve yürünebilir alanı. */
import { getLoadedAsset } from './assetLoader';
import { drawCharacter } from './characterRenderer';
import type { PlayerCharacter, SceneObstacle } from '../types';

export const DISCOVERY_ROOM_ASSET_URL = '/assets/walkable/discovery-career-room.jpg';

const ART_SCALE = 0.625; // 1536 × 1024 görsel, 960 × 640 oyun dünyasına eşlenir.
const WALL_BASE_Y = 382;

function roomRect(left: number, top: number, width: number, height: number) {
  return { left: left * ART_SCALE, top: top * ART_SCALE, width: width * ART_SCALE, height: height * ART_SCALE };
}

type CareerWall = 'left' | 'back' | 'right';

function wallSlot(
  wall: CareerWall,
  panel: [left: number, top: number, width: number, height: number],
  label: [left: number, top: number, width: number, height: number],
  floorX: number,
  floorY: number,
) {
  return { wall, portrait: roomRect(...panel), plaque: roomRect(...label), approach: { x: floorX, y: floorY } };
}

export const DISCOVERY_NICHE_LAYOUT = [
  wallSlot('left',  [79, 345, 63, 119],  [76, 468, 70, 33],   69, 470),
  wallSlot('left',  [163, 352, 58, 112], [156, 468, 71, 32],  121, 458),
  wallSlot('left',  [241, 360, 56, 104], [235, 468, 69, 32],  170, 447),
  wallSlot('left',  [318, 366, 52, 98],  [309, 468, 70, 32],  221, 428),
  wallSlot('back',  [415, 368, 73, 96],  [410, 468, 84, 30],  285, 516),
  wallSlot('back',  [527, 368, 79, 96],  [523, 468, 88, 30],  362, 516),
  wallSlot('back',  [926, 368, 78, 96],  [921, 468, 88, 30],  601, 516),
  wallSlot('back',  [1046, 368, 72, 96], [1040, 468, 84, 30], 678, 516),
  wallSlot('right', [1165, 366, 52, 98], [1154, 468, 74, 32], 738, 428),
  wallSlot('right', [1240, 360, 54, 104],[1232, 468, 72, 32], 789, 447),
  wallSlot('right', [1315, 352, 58, 112],[1309, 468, 71, 32], 839, 458),
  wallSlot('right', [1395, 345, 61, 119],[1389, 468, 73, 33], 891, 470),
] as const;

export const DISCOVERY_TITLE_LAYOUT = roomRect(642, 246, 252, 113);
export const DISCOVERY_PREVIEW_LAYOUT = roomRect(628, 424, 280, 137);

export const DISCOVERY_CLASSROOM = {
  width: 960,
  height: 640,
  playerSpawn: { x: 425, y: 554 },
  exitDoor: { x: 480, y: 590, radius: 65 },
  pedestal: {
    obstacle: {
      id: 'vr-display-pedestal',
      name: 'VR Gözlüğü Sergileme Masası',
      x: 301,
      y: 384,
      width: 358,
      height: 102,
    } satisfies SceneObstacle,
    centerX: 480,
    topSurfaceY: 397,
    baseY: 489,
    approach: { x: 480, y: 516 },
  },
  // Eski sahne API'siyle uyumluluk için tutulan koordinatlar.
  wallMounts: [
    { id: 'vr-wall-mount-1', centerX: 384, centerY: 110 },
    { id: 'vr-wall-mount-2', centerX: 480, centerY: 110 },
    { id: 'vr-wall-mount-3', centerX: 576, centerY: 110 },
  ],
} as const;

export const DISCOVERY_CLASSROOM_OBSTACLES: SceneObstacle[] = [
  { id: 'discovery-north-wall', name: 'Arka Taş Duvarı', x: 0, y: 0, width: 960, height: WALL_BASE_Y },
  { id: 'discovery-west-bench', name: 'Sol Oturma Alanı', x: 0, y: WALL_BASE_Y, width: 132, height: 58 },
  { id: 'discovery-west-bench-end', name: 'Sol Oturma Alanı', x: 132, y: WALL_BASE_Y, width: 150, height: 28 },
  { id: 'discovery-east-bench', name: 'Sağ Oturma Alanı', x: 828, y: WALL_BASE_Y, width: 132, height: 58 },
  { id: 'discovery-east-bench-end', name: 'Sağ Oturma Alanı', x: 678, y: WALL_BASE_Y, width: 150, height: 28 },
  DISCOVERY_CLASSROOM.pedestal.obstacle,
];

const tableSilhouette = [
  [618, 449], [636, 423], [700, 410], [860, 415], [899, 430], [916, 457], [916, 572],
  [944, 561], [991, 556], [1027, 580], [1032, 607], [1068, 627], [1066, 735],
  [1016, 761], [882, 779], [652, 781], [524, 765], [470, 741], [464, 629],
  [510, 605], [511, 576], [550, 557], [588, 560], [620, 574],
] as const;

export function preloadDiscoveryClassroom() {
  getLoadedAsset(DISCOVERY_ROOM_ASSET_URL);
}

function drawDiscoveryExitDoor(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const x = width / 2 - 48;
  const y = height - 36;
  ctx.save();
  ctx.fillStyle = '#5a3920';
  ctx.strokeStyle = '#d8972b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x - 4, y, 104, 36, [10, 10, 0, 0]);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#172b47';
  ctx.beginPath();
  ctx.roundRect(x, y + 4, 96, 32, [8, 8, 0, 0]);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Avluya Çıkış [E]', width / 2, y + 24);
  ctx.restore();
}

export function renderDiscoveryClassroomLayeredBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const room = getLoadedAsset(DISCOVERY_ROOM_ASSET_URL);
  if (room) {
    ctx.drawImage(room, 0, 0, width, height);
  } else {
    ctx.fillStyle = '#d8a674';
    ctx.fillRect(0, 0, width, WALL_BASE_Y);
    ctx.fillStyle = '#e4be8b';
    ctx.fillRect(0, WALL_BASE_Y, width, height - WALL_BASE_Y);
    ctx.fillStyle = '#172436';
    ctx.beginPath();
    const { left, top, width: screenWidth, height: screenHeight } = DISCOVERY_PREVIEW_LAYOUT;
    ctx.roundRect(left, top, screenWidth, screenHeight, 7);
    ctx.fill();
    const { x, y, width: tableWidth, height: tableHeight } = DISCOVERY_CLASSROOM.pedestal.obstacle;
    ctx.fillStyle = '#8c5232';
    ctx.beginPath();
    ctx.roundRect(x, y, tableWidth, tableHeight, 26);
    ctx.fill();
  }
  drawDiscoveryExitDoor(ctx, width, height);
}

export function renderDiscoveryClassroomEntities(
  ctx: CanvasRenderingContext2D,
  player: PlayerCharacter,
  width: number = DISCOVERY_CLASSROOM.width,
  height: number = DISCOVERY_CLASSROOM.height,
) {
  drawCharacter(ctx, player);
  if (player.y + 18 >= DISCOVERY_CLASSROOM.pedestal.baseY) return;
  const room = getLoadedAsset(DISCOVERY_ROOM_ASSET_URL);
  if (!room) return;

  // Arka plandaki masanın silüetini karakterin üstüne geçirerek derinliği koru.
  ctx.save();
  ctx.beginPath();
  tableSilhouette.forEach(([x, y], index) => {
    if (index === 0) ctx.moveTo(x * ART_SCALE, y * ART_SCALE);
    else ctx.lineTo(x * ART_SCALE, y * ART_SCALE);
  });
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(room, 0, 0, width, height);
  ctx.restore();
}

export const renderDiscoveryClassroomBackground = renderDiscoveryClassroomLayeredBackground;
