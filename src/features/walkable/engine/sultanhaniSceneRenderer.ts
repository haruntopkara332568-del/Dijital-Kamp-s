import type { NpcCharacter, PlayerCharacter, SceneObstacle } from '../types';
import { getSultanhaniCaravanseraiAsset, getSultanhaniInnerWalkableAsset } from './assetLoader';
import { drawCharacter, drawTouristNpc } from './characterRenderer';

// 553 × 466 kaynak görselinin iki katı. Kapı koordinatları bu görsele aittir.
const SCENE_WIDTH = 1106;
const SCENE_HEIGHT = 932;
export const PORTAL = {
  left: 596,
  right: 654,
  top: 486,
  threshold: 592,
  passageEnd: 530,
  centerX: (596 + 654) / 2,
  triggerY: 572,
  triggerRadius: 56,
  doorWalkTarget: { x: (596 + 654) / 2, y: 552 },
} as const;

export const SULTANHANI_SQUARE = {
  width: SCENE_WIDTH,
  height: SCENE_HEIGHT,
  spawn: { x: PORTAL.centerX, y: 760 },
  portalExit: {
    player: { x: PORTAL.centerX, y: 638 },
    alex: { x: PORTAL.centerX + 54, y: 622 },
  },
  obstacles: [
    { id: 'caravanserai-wall-left', name: 'Sol cephe', x: 0, y: 0, width: PORTAL.left, height: PORTAL.threshold },
    { id: 'caravanserai-wall-right', name: 'Sağ cephe', x: PORTAL.right, y: 0, width: SCENE_WIDTH - PORTAL.right, height: PORTAL.threshold },
    { id: 'passage-end', name: 'Koridor sonu', x: PORTAL.left, y: 0, width: PORTAL.right - PORTAL.left, height: PORTAL.passageEnd },
    { id: 'bushes-left', name: 'Meydan yeşilliği', x: 0, y: 800, width: 140, height: 132 },
    { id: 'sign-right', name: 'Tanıtım panosu', x: 960, y: 780, width: 146, height: 152 },
  ] satisfies SceneObstacle[],
};

// Kullanıcının yüklediği iç avlu görseli (1024 × 585)
const INNER_SCENE_WIDTH = 1024;
const INNER_SCENE_HEIGHT = 585;

export const SULTANHANI_INNER = {
  width: INNER_SCENE_WIDTH,
  height: INNER_SCENE_HEIGHT,
  playerSpawn: { x: 472, y: 492 },
  touristSpawn: { x: 544, y: 492 },
  exit: { x: 512, y: 545, radius: 38 },
  obstacles: [
    // 1024 × 585 görselinde zeminin başladığı çizgi. Kamera merkez aksından içeri bakıyor.
    { id: 'inner-horizon', name: 'Avlu gerisindeki cepheler', x: 0, y: 0, width: INNER_SCENE_WIDTH, height: 334 },
    { id: 'inner-left-wall-1', name: 'Sol taş duvar', x: 0, y: 334, width: 110, height: 42 },
    { id: 'inner-left-wall-2', name: 'Sol taş duvar', x: 110, y: 334, width: 90, height: 35 },
    { id: 'inner-left-wall-3', name: 'Sol taş duvar', x: 200, y: 334, width: 95, height: 24 },
    { id: 'inner-left-wall-4', name: 'Sol taş duvar', x: 295, y: 334, width: 103, height: 15 },
    { id: 'inner-mosque', name: 'Köşk mescit', x: 398, y: 334, width: 191, height: 20 },
    { id: 'inner-arcade-1', name: 'Revak ayakları', x: 589, y: 334, width: 76, height: 11 },
    { id: 'inner-arcade-2', name: 'Revak ayakları', x: 665, y: 334, width: 90, height: 18 },
    { id: 'inner-arcade-3', name: 'Revak ayakları', x: 755, y: 334, width: 85, height: 26 },
    { id: 'inner-arcade-4', name: 'Revak ayakları', x: 840, y: 334, width: 90, height: 31 },
    { id: 'inner-arcade-5', name: 'Sağ revak duvarı', x: 930, y: 334, width: 94, height: 44 },
    // Avlunun üstünde duran taş sıraları ve merkezdeki tek blok.
    { id: 'inner-west-stones-1', name: 'Sol taş sırası', x: 154, y: 379, width: 64, height: 32 },
    { id: 'inner-west-stones-2', name: 'Sol taş sırası', x: 218, y: 366, width: 70, height: 28 },
    { id: 'inner-west-stones-3', name: 'Sol taş sırası', x: 288, y: 351, width: 73, height: 32 },
    { id: 'inner-west-stones-4', name: 'Sol taş sırası', x: 361, y: 340, width: 62, height: 29 },
    { id: 'inner-central-stone', name: 'Avludaki taş blok', x: 430, y: 362, width: 50, height: 42 },
    { id: 'inner-mosque-stones', name: 'Mescit önündeki taşlar', x: 478, y: 334, width: 114, height: 33 },
    { id: 'inner-east-stones-1', name: 'Sağ taş sırası', x: 613, y: 339, width: 42, height: 35 },
    { id: 'inner-east-stones-2', name: 'Sağ taş sırası', x: 655, y: 350, width: 55, height: 38 },
    { id: 'inner-east-stones-3', name: 'Sağ taş sırası', x: 710, y: 364, width: 58, height: 32 },
    { id: 'inner-east-stones-4', name: 'Sağ taş sırası', x: 768, y: 365, width: 49, height: 42 },
  ] satisfies SceneObstacle[],
};

export function renderSultanhaniBackground(ctx: CanvasRenderingContext2D) {
  const background = getSultanhaniCaravanseraiAsset();
  if (background) {
    ctx.drawImage(background, 0, 0, SCENE_WIDTH, SCENE_HEIGHT);
  } else {
    ctx.fillStyle = '#c8b295';
    ctx.fillRect(0, 0, SCENE_WIDTH, SCENE_HEIGHT);
  }
}

export function renderSultanhaniInnerBackground(ctx: CanvasRenderingContext2D) {
  const background = getSultanhaniInnerWalkableAsset();
  if (background) {
    ctx.drawImage(background, 0, 0, INNER_SCENE_WIDTH, INNER_SCENE_HEIGHT);
  } else {
    ctx.fillStyle = '#d7cbb9';
    ctx.fillRect(0, 0, INNER_SCENE_WIDTH, INNER_SCENE_HEIGHT);
  }
}

function drawPlayerWithPortalClip(ctx: CanvasRenderingContext2D, player: PlayerCharacter) {
  const feetY = player.y + 18;
  if (feetY >= PORTAL.threshold) {
    drawCharacter(ctx, player);
    return;
  }

  // Fotoğraftaki taş söveler ve kemer, öğrenci eşiği aştığında onun önünde kalır.
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(PORTAL.left, PORTAL.threshold);
  ctx.lineTo(PORTAL.left, 515);
  ctx.bezierCurveTo(PORTAL.left, 499, 610, 490, 626, PORTAL.top);
  ctx.bezierCurveTo(643, 489, PORTAL.right, 499, PORTAL.right, 515);
  ctx.lineTo(PORTAL.right, PORTAL.threshold);
  ctx.closePath();
  ctx.clip();
  drawCharacter(ctx, player);
  ctx.restore();
}

export function renderSultanhaniEntities(
  ctx: CanvasRenderingContext2D,
  player: PlayerCharacter,
  npc?: NpcCharacter | null,
) {
  if (!npc || !npc.visible) {
    drawPlayerWithPortalClip(ctx, player);
    return;
  }

  // Ayak temas noktasına (y + 18) göre derinlik sıralaması (Y-Sorting)
  if (npc.y <= player.y) {
    drawTouristNpc(ctx, npc);
    drawPlayerWithPortalClip(ctx, player);
  } else {
    drawPlayerWithPortalClip(ctx, player);
    drawTouristNpc(ctx, npc);
  }
}

export function renderSultanhaniInnerEntities(
  ctx: CanvasRenderingContext2D,
  player: PlayerCharacter,
  npc?: NpcCharacter | null,
) {
  if (!npc || !npc.visible) {
    drawCharacter(ctx, player);
    return;
  }

  if (npc.y <= player.y) {
    drawTouristNpc(ctx, npc);
    drawCharacter(ctx, player);
  } else {
    drawCharacter(ctx, player);
    drawTouristNpc(ctx, npc);
  }
}
