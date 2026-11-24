import { PILOT_APRON, PILOT_PARTS, type PilotLine } from '@/src/data/pilotExperienceContent';
import type { NpcCharacter, PlayerCharacter, SceneObstacle } from '../types';
import { getLoadedAsset } from './assetLoader';
import { drawCharacter } from './characterRenderer';
import type { usePilotExperience } from '../usePilotExperience';

export const PILOT_CAPTAIN_ATLAS = '/assets/walkable/pilot-captain-atlas.png';
export const PILOT_COCKPIT_ART = '/assets/walkable/pilot-cockpit.jpg';
export const PILOT_VALLEY_ART = '/assets/walkable/pilot-valley.jpg';
const apronUrl = '/assets/walkable/pilot-apron.jpg';

export const PILOT_APRON_OBSTACLES: SceneObstacle[] = [
  { id: 'pilot-apron-line', name: 'Uçağın güvenlik sınırı', x: 0, y: 0, width: 960, height: 354 },
];

export function preloadPilotExperience() {
  getLoadedAsset(apronUrl);
  getLoadedAsset(PILOT_CAPTAIN_ATLAS);
  getLoadedAsset(PILOT_COCKPIT_ART);
  getLoadedAsset(PILOT_VALLEY_ART);
}

export function renderPilotApron(ctx: CanvasRenderingContext2D) {
  const image = getLoadedAsset(apronUrl);
  if (image) ctx.drawImage(image, 0, 0, PILOT_APRON.width, PILOT_APRON.height);
  else {
    ctx.fillStyle = '#c6dbec';
    ctx.fillRect(0, 0, PILOT_APRON.width, 354);
    ctx.fillStyle = '#e4d2a8';
    ctx.fillRect(0, 354, PILOT_APRON.width, PILOT_APRON.height - 354);
  }
}

function drawCaptain(ctx: CanvasRenderingContext2D, captain: NpcCharacter, speaking: boolean, reducedMotion: boolean) {
  const atlas = getLoadedAsset(PILOT_CAPTAIN_ATLAS);
  if (!atlas) return;
  const x = captain.x, y = captain.y + 15;
  const gesture = speaking && (reducedMotion || performance.now() % 880 < 560);
  const step = captain.state === 'walk';
  const side = captain.direction === 'right' || captain.direction === 'left';
  const cell = gesture ? 3 : captain.direction === 'up' ? 2 : side ? 1 : 0;
  const bob = !reducedMotion && step ? Math.abs(Math.sin(captain.walkFrame * Math.PI)) * 3.1 : 0;
  ctx.beginPath();
  ctx.ellipse(x, y, 16, 5, 0, 0, 2 * Math.PI);
  ctx.fillStyle = '#33364443';
  ctx.fill();

  ctx.save();
  ctx.translate(x, y - bob);
  ctx.scale(!gesture && captain.direction === 'left' ? -1 : 1, 1);
  ctx.drawImage(atlas, cell * (atlas.width / 4), 0, atlas.width / 4, atlas.height / 2, -48, -96, 96, 96);
  ctx.restore();
}

type ApronState = ReturnType<ReturnType<typeof usePilotExperience>['read']>;
export function renderPilotApronActors(
  ctx: CanvasRenderingContext2D, player: PlayerCharacter, captain: NpcCharacter | null | undefined,
  state: ApronState, speaker: PilotLine['speaker'] | undefined, bubble: HTMLDivElement | null,
  sx: number, sy: number, reducedMotion: boolean,
) {
  if (!state.dialogue && !state.boarding) {
    const indicators = state.visited.length === PILOT_PARTS.length
      ? [PILOT_APRON.stairs] : PILOT_PARTS.filter((_, index) => !state.visited.includes(index)).map((part) => part.position);
    for (const { x, y } of indicators) {
      ctx.beginPath();
      ctx.ellipse(x, y + 11, 15, 5.5, 0, 0, 2 * Math.PI);
      ctx.fillStyle = '#326ca865';
      ctx.fill();
      ctx.strokeStyle = '#fffdf4';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  if (captain?.visible && captain.y <= player.y) drawCaptain(ctx, captain, speaker === 'captain', reducedMotion);
  drawCharacter(ctx, player, 'idle');
  if (captain?.visible && captain.y > player.y) drawCaptain(ctx, captain, speaker === 'captain', reducedMotion);

  const subject = speaker === 'student' ? player : speaker === 'captain' ? captain : null;
  if (!subject || !bubble) return;
  const transform = ctx.getTransform();
  const x = Math.round((subject.x * transform.a + transform.e) * sx) + 'px';
  const y = Math.round(((subject.y + 12 - (speaker === 'student' ? 67 : 98)) * transform.d + transform.f) * sy) + 'px';
  if (bubble.style.getPropertyValue('--pilot-bubble-x') !== x) bubble.style.setProperty('--pilot-bubble-x', x);
  if (bubble.style.getPropertyValue('--pilot-bubble-y') !== y) bubble.style.setProperty('--pilot-bubble-y', y);
}
