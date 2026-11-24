import {
  VETERINARY_CLINIC, VET_CARE_ITEMS, VET_DOG_DRINK_END_MS, VET_DOG_REDUCED_REST_MS,
  VET_DOG_REST_MS, VET_DOG_WALK_MS, VET_ITEM_REACH, type VetCareItemId,
} from '@/src/data/veterinaryClinicContent';
import type { useVeterinaryClinicVisit } from '../useVeterinaryClinicVisit';
import type { NpcCharacter, PlayerCharacter, Position, SceneObstacle } from '../types';
import { getLoadedAsset } from './assetLoader';
import { drawCharacter } from './characterRenderer';

const clinicUrl = '/assets/walkable/veterinary-clinic.jpg';
export const VETERINARY_ADULTS_ATLAS = '/assets/walkable/veterinary-adults-atlas.png';
const BONCUK_ATLAS_URL = '/assets/walkable/boncuk-atlas.png';
const adultHeight = 112;
type SceneState = ReturnType<ReturnType<typeof useVeterinaryClinicVisit>['readScene']>;

export const VETERINARY_CLINIC_OBSTACLES: SceneObstacle[] = [
  { id: 'vet-wall', name: 'Klinik duvarı', x: 0, y: 0, width: 960, height: 268 },
  { id: 'vet-counter', name: 'Tezgâh', x: 0, y: 268, width: 126, height: 135 },
  { id: 'vet-counter-side', name: 'Tezgâhın yanı', x: 126, y: 268, width: 35, height: 99 },
  { id: 'vet-counter-rear', name: 'Tezgâhın arkası', x: 161, y: 268, width: 32, height: 65 },
  { id: 'vet-left-cupboard', name: 'Sol dolaplar', x: 193, y: 268, width: 35, height: 35 },
  { id: 'vet-exam-table', name: 'Muayene masası', x: 290, y: 268, width: 363, height: 133 },
  { id: 'vet-right-cupboard', name: 'Sağ dolaplar', x: 653, y: 268, width: 69, height: 38 },
  { id: 'vet-floor-scale', name: 'Hayvan tartısı', x: 730, y: 268, width: 91, height: 50 },
  { id: 'vet-right-wall', name: 'Sağ duvar', x: 821, y: 268, width: 139, height: 37 },
  { id: 'vet-guide', name: 'Veteriner Hekim', x: VETERINARY_CLINIC.veterinarian.x - 14, y: VETERINARY_CLINIC.veterinarian.y + 8, width: 28, height: 17 },
  { id: 'vet-care-bed', name: 'Dinlenme alanı', x: 828, y: 341, width: 99, height: 43 },
];

export function preloadVeterinaryClinic() {
  getLoadedAsset(clinicUrl);
  getLoadedAsset(VETERINARY_ADULTS_ATLAS);
  getLoadedAsset(BONCUK_ATLAS_URL);
}

function drawCareItem(ctx: CanvasRenderingContext2D, item: VetCareItemId, position: Position, ripple = 0) {
  ctx.save();
  ctx.translate(position.x, position.y);
  if (item === 'mat') {
    ctx.beginPath();
    ctx.roundRect(-47, -16, 94, 37, 14);
    ctx.fillStyle = '#1c414728';
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(-47, -19, 94, 37, 14);
    ctx.fillStyle = '#4d9c9e';
    ctx.fill();
    ctx.strokeStyle = '#c7e6df';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(-42, -16, 84, 28, 13);
    ctx.fillStyle = '#77bcbc';
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.ellipse(0, 3, 18, 7, 0, 0, 2 * Math.PI);
    ctx.fillStyle = '#1c414734';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, 0, 17, 7, 0, 0, 2 * Math.PI);
    ctx.fillStyle = '#286789';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, -4, 15, 5, 0, 0, 2 * Math.PI);
    ctx.fillStyle = '#a6e4ef';
    ctx.fill();
    ctx.strokeStyle = '#458bab';
    ctx.stroke();
    if (ripple > 0) {
      ctx.globalAlpha = 1 - ripple;
      ctx.beginPath();
      ctx.ellipse(-2, -4, 2 + ripple * 9, 1 + ripple * 2.5, 0, 0, 2 * Math.PI);
      ctx.strokeStyle = '#f5feff';
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawCareObjects(ctx: CanvasRenderingContext2D, state: SceneState, ripple: number) {
  for (const { id, source, target, width, height } of VET_CARE_ITEMS) {
    if (state.phase === 'care' && !state.placed[id]) {
      const receiving = state.dragging?.item === id;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(target.x - width / 2, target.y - height / 2, width, height, 13);
      ctx.fillStyle = receiving ? '#b4e9d5b0' : '#ffedcc73';
      ctx.strokeStyle = receiving ? '#166963' : '#8b6b53';
      ctx.lineWidth = receiving ? 2.6 : 1.6;
      ctx.setLineDash([5, 4]);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    if (state.dragging?.item === id) continue;
    drawCareItem(ctx, id, state.placed[id] ? target : source, id === 'water' ? ripple : 0);
  }
}

export function renderVeterinaryClinicBackground(ctx: CanvasRenderingContext2D) {
  const { width, height } = VETERINARY_CLINIC;
  const clinic = getLoadedAsset(clinicUrl);
  if (clinic) {
    ctx.drawImage(clinic, 0, 0, width, height);
  } else {
    ctx.fillStyle = '#eaf1ef';
    ctx.fillRect(0, 0, width, 268);
    ctx.fillStyle = '#f4d5ae';
    ctx.fillRect(0, 268, width, height - 268);
  }
}

function drawShadow(ctx: CanvasRenderingContext2D, position: Position, width: number, height: number) {
  ctx.beginPath();
  ctx.ellipse(position.x, position.y + 11, width, height, 0, 0, 2 * Math.PI);
  ctx.fillStyle = '#233b4934';
  ctx.fill();
}

function drawAdult(ctx: CanvasRenderingContext2D, position: Position, row: number, frame: number, flip: boolean, motion: number) {
  const atlas = getLoadedAsset(VETERINARY_ADULTS_ATLAS);
  if (!atlas) return;
  const frameWidth = atlas.width / 4;
  const frameHeight = atlas.height / 2;
  drawShadow(ctx, position, 17, 5);
  ctx.save();
  ctx.translate(position.x, position.y + 13 - motion);
  ctx.scale(flip ? -1 : 1, 1);
  ctx.drawImage(atlas, frameWidth * frame, frameHeight * row, frameWidth, frameHeight,
    -adultHeight / 2, -adultHeight, adultHeight, adultHeight);
  ctx.restore();
}

type DogPose = { position: Position; frame: number; lift: number; breath: number };

function moveBetween(from: Position, to: Position, t: number): Position {
  return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
}

function getDogPose(state: SceneState, now: number, reducedMotion: boolean): DogPose {
  const { dogOnTable, dogOnFloor, dogAtWater, careBed } = VETERINARY_CLINIC;
  if (state.dogMovedAt === null) {
    const attentive = state.phase === 'care' && !reducedMotion && now % 4600 < 700;
    return { position: dogOnTable, frame: attentive ? 5 : 0, lift: 0, breath: reducedMotion ? 0 : Math.sin(now / 460) * 0.022 };
  }

  const elapsed = now - state.dogMovedAt;
  const restAt = reducedMotion ? VET_DOG_REDUCED_REST_MS : VET_DOG_REST_MS;
  if (elapsed >= restAt) {
    return { position: careBed, frame: 4, lift: 0, breath: reducedMotion ? 0 : Math.sin(elapsed / 570) * 0.028 };
  }
  if (reducedMotion || (elapsed >= VET_DOG_WALK_MS && elapsed < VET_DOG_DRINK_END_MS)) {
    const lap = reducedMotion ? 0 : Math.sin((elapsed - VET_DOG_WALK_MS) / 90) * 1.9;
    return { position: dogAtWater, frame: 2, lift: -5 + lap, breath: 0 };
  }
  if (elapsed >= VET_DOG_DRINK_END_MS) {
    const settle = (elapsed - VET_DOG_DRINK_END_MS) / (VET_DOG_REST_MS - VET_DOG_DRINK_END_MS);
    const position = moveBetween(dogAtWater, careBed, settle);
    return { position, frame: settle > 0.7 ? 4 : 3, lift: 0, breath: 0 };
  }
  if (elapsed < 680) {
    const t = elapsed / 680;
    return { position: moveBetween(dogOnTable, dogOnFloor, t), frame: 3, lift: Math.sin(Math.PI * t) * 22, breath: 0 };
  }

  const aroundTable = { x: 681, y: 435 };
  const turnAt = 2180;
  const position = elapsed < turnAt
    ? moveBetween(dogOnFloor, aroundTable, (elapsed - 680) / (turnAt - 680))
    : moveBetween(aroundTable, dogAtWater, (elapsed - turnAt) / (VET_DOG_WALK_MS - turnAt));
  return { position, frame: 3, lift: Math.abs(Math.sin(elapsed / 125)) * 2.7, breath: 0 };
}

function drawDog(ctx: CanvasRenderingContext2D, { position, frame, lift, breath }: DogPose) {
  const atlas = getLoadedAsset(BONCUK_ATLAS_URL);
  if (!atlas) return;
  const width = atlas.width / 3;
  const height = atlas.height / 2;
  const pawBaseline = [0.858, 0.862, 0.842, 0.80, 0.765, 0.762][frame];
  const size = 106;
  drawShadow(ctx, { x: position.x, y: position.y - 10 }, 31, 4.5);
  ctx.drawImage(atlas, (frame % 3) * width, Math.floor(frame / 3) * height, width, height,
    position.x - size / 2, position.y - lift - size * (1 + breath) * pawBaseline, size, size * (1 + breath));
}

export function renderVeterinaryClinicEntities(
  ctx: CanvasRenderingContext2D,
  player: PlayerCharacter,
  father: NpcCharacter | null | undefined,
  state: SceneState,
  bubble: HTMLDivElement | null,
  careLayer: HTMLDivElement | null,
  scaleX: number,
  scaleY: number,
  reducedMotion: boolean,
) {
  const now = performance.now();
  const { veterinarian } = VETERINARY_CLINIC;
  const dog = getDogPose(state, now, reducedMotion);
  const elapsed = state.dogMovedAt === null ? -1 : now - state.dogMovedAt;
  const drinking = !reducedMotion && elapsed >= VET_DOG_WALK_MS && elapsed < VET_DOG_DRINK_END_MS;
  const ripple = drinking ? ((elapsed - VET_DOG_WALK_MS) % 480) / 480 : 0;
  drawCareObjects(ctx, state, ripple);

  const transform = ctx.getTransform();
  if (careLayer) {
    const cssTransform = 'matrix(' + [transform.a * scaleX, 0, 0, transform.d * scaleY, transform.e * scaleX, transform.f * scaleY].join(',') + ')';
    if (careLayer.style.transform !== cssTransform) careLayer.style.transform = cssTransform;
    if (careLayer.style.visibility !== 'visible') careLayer.style.visibility = 'visible';
    for (const item of VET_CARE_ITEMS) {
      const button = careLayer.querySelector<HTMLButtonElement>('[data-vet-pickup="' + item.id + '"]');
      const tabIndex = Math.hypot(player.x - item.source.x, player.y - item.source.y) <= VET_ITEM_REACH ? 0 : -1;
      if (button && button.tabIndex !== tabIndex) button.tabIndex = tabIndex;
    }
  }

  const blink = !reducedMotion && now % 4200 < 140;
  const vetFrame = state.talkingSpeaker === 'veterinarian' ? (now % 740 < 490 ? 2 : 3) : blink ? 1 : 0;
  const entities = [
    { y: dog.position.y, draw: () => drawDog(ctx, dog) },
    { y: veterinarian.y, draw: () => drawAdult(ctx, veterinarian, 1, vetFrame, false, reducedMotion ? 0 : Math.sin(now / 670) * 0.7) },
    { y: player.y, draw: () => drawCharacter(ctx, player, 'idle') },
  ];
  if (father?.visible) {
    const speaking = state.talkingSpeaker === 'father';
    const sideways = father.direction === 'right' || father.direction === 'left';
    const frame = speaking ? (now % 760 < 520 ? 3 : 0) : father.direction === 'up' ? 2 : sideways ? 1 : 0;
    const bounce = !reducedMotion && father.state === 'walk' ? Math.abs(Math.sin(father.walkFrame * Math.PI)) * 3.2 : 0;
    entities.push({ y: father.y, draw: () => drawAdult(ctx, father, 0, frame, !speaking && father.direction === 'left', bounce) });
  }
  entities.sort((a, b) => a.y - b.y);
  entities.forEach(({ draw }) => draw());
  if (state.dragging) drawCareItem(ctx, state.dragging.item, state.dragging.position);

  if (!bubble || !state.displaySpeaker) return;
  const speaker = state.displaySpeaker;
  const anchor = speaker === 'veterinarian' ? veterinarian : speaker === 'father' ? father : player;
  if (!anchor) return;
  const height = speaker === 'student' ? 68 : adultHeight;
  const px = Math.round((anchor.x * transform.a + transform.e) * scaleX);
  const py = Math.round(((anchor.y + 10 - height) * transform.d + transform.f) * scaleY);
  const x = px + 'px';
  const y = py + 'px';
  if (bubble.style.getPropertyValue('--vet-bubble-x') !== x) bubble.style.setProperty('--vet-bubble-x', x);
  if (bubble.style.getPropertyValue('--vet-bubble-y') !== y) bubble.style.setProperty('--vet-bubble-y', y);
}
