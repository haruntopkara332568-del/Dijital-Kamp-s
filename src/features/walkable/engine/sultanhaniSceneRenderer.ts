import type { NpcCharacter, PlayerCharacter, SceneObstacle } from '../types';
import { getSultanhaniCaravanseraiAsset } from './assetLoader';
import { drawCharacter, drawTouristNpc } from './characterRenderer';

// 553 × 466 kaynak görselinin iki katı. Kapı koordinatları bu görsele aittir.
const SCENE_WIDTH = 1106;
const SCENE_HEIGHT = 932;
const PORTAL = {
  left: 596,
  right: 654,
  top: 486,
  threshold: 592,
  passageEnd: 530,
};

export const SULTANHANI_SQUARE = {
  width: SCENE_WIDTH,
  height: SCENE_HEIGHT,
  spawn: { x: (PORTAL.left + PORTAL.right) / 2, y: 760 },
  obstacles: [
    { id: 'caravanserai-wall-left', name: 'Sol cephe', x: 0, y: 0, width: PORTAL.left, height: PORTAL.threshold },
    { id: 'caravanserai-wall-right', name: 'Sağ cephe', x: PORTAL.right, y: 0, width: SCENE_WIDTH - PORTAL.right, height: PORTAL.threshold },
    { id: 'passage-end', name: 'Koridor sonu', x: PORTAL.left, y: 0, width: PORTAL.right - PORTAL.left, height: PORTAL.passageEnd },
    { id: 'bushes-left', name: 'Meydan yeşilliği', x: 0, y: 800, width: 140, height: 132 },
    { id: 'sign-right', name: 'Tanıtım panosu', x: 960, y: 780, width: 146, height: 152 },
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
