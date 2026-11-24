import { STUDENT_ATLAS_FRAME, type StudentCharacterId } from '@/src/data/studentCharacters';
import type { PilotCheckpoint, PilotLine } from '@/src/data/pilotExperienceContent';
import { getLoadedAsset, getStudentCharacterAtlas } from './assetLoader';
import { PILOT_CAPTAIN_ATLAS, PILOT_COCKPIT_ART, PILOT_VALLEY_ART } from './pilotApronSceneRenderer';
import type { FlightState, PilotMode } from './pilotFlightEngine';

export const PILOT_COCKPIT_FRAME = { width: 960, height: 640 };
type ViewPoint = { x: number; y: number };
type Project = (x: number, height: number, z: number) => ViewPoint;
const center = 480;
let cockpitFrame: HTMLCanvasElement | null = null;
let seatMask: Path2D | null = null;

function getCockpitFrame() {
  if (cockpitFrame) return cockpitFrame;
  const art = getLoadedAsset(PILOT_COCKPIT_ART);
  if (!art) return null;
  const canvas = document.createElement('canvas');
  canvas.width = PILOT_COCKPIT_FRAME.width;
  canvas.height = PILOT_COCKPIT_FRAME.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(art, 0, 0, canvas.width, canvas.height);
  const paneRows = Math.round(canvas.height * 0.55);
  const pane = ctx.getImageData(0, 0, canvas.width, paneRows);
  const pixels = pane.data;
  for (let i = 0; i < pixels.length; i += 4) {
    const spill = pixels[i + 1] - Math.max(pixels[i], pixels[i + 2]);
    if (spill > 28) {
      pixels[i + 3] = Math.round(255 * (1 - Math.min(1, (spill - 28) / 110)));
      pixels[i + 1] = Math.min(pixels[i + 1], Math.max(pixels[i], pixels[i + 2]) + 16);
    }
  }
  ctx.putImageData(pane, 0, 0);
  cockpitFrame = canvas;
  return canvas;
}

function polygon(ctx: CanvasRenderingContext2D, points: readonly ViewPoint[], fill: string) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let index = 1; index < points.length; index++) ctx.lineTo(points[index].x, points[index].y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function elevation(x: number, z: number) {
  const slope = Math.min(310, Math.max(0, (Math.abs(x) - 210) * 0.81));
  return Math.max(0, slope * (0.56 + Math.sin(x * 0.007 + z * 0.004) * 0.24 + Math.cos(z * 0.011 + x * 0.002) * 0.13));
}

function terrain(ctx: CanvasRenderingContext2D, state: FlightState, project: Project, nearAirfield: boolean) {
  const size = 210;
  const far = Math.floor(state.z / size) * size + size * 13;
  for (let z = far; z > state.z + 45; z -= size) {
    const near = Math.max(state.z + 40, z - size);
    const haze = Math.min(0.7, (near - state.z) / 3900);
    for (let x = -2600; x < 2600; x += size) {
      const a = nearAirfield ? 0 : elevation(x, near);
      const b = nearAirfield ? 0 : elevation(x + size, near);
      const c = nearAirfield ? 0 : elevation(x + size, z);
      const d = nearAirfield ? 0 : elevation(x, z);
      const swatch = Math.sin(x * 0.017 + z * 0.009) * 8 + Math.cos(x * 0.004 - z * 0.003) * 5;
      const mountain = a + b + c + d > 180;
      const l = (mountain ? 30 : nearAirfield ? 47 : 39) + swatch;
      const tone = mountain ? 206 : nearAirfield ? 76 : 139;
      const alpha = (mountain ? 0.44 : 0.27) * (1 - haze);
      polygon(ctx, [project(x, d, z), project(x + size, c, z), project(x + size, b, near), project(x, a, near)], 'hsla(' + tone + ',24%,' + l + '%,' + alpha + ')');
    }
  }
}

function runway(ctx: CanvasRenderingContext2D, state: FlightState, project: Project) {
  const threshold = state.runwayStart;
  const finish = threshold + 760;
  const nearest = Math.max(state.z + 34, threshold);
  if (nearest >= finish) return;
  polygon(ctx, [project(-55, 0, nearest), project(55, 0, nearest), project(55, 0, finish), project(-55, 0, finish)], '#3d4651');
  for (const side of [-1, 1]) {
    const x = side * 50;
    polygon(ctx, [project(x - 1.5, 0, nearest), project(x + 1.5, 0, nearest), project(x + 1.5, 0, finish), project(x - 1.5, 0, finish)], '#d1e7ec');
  }
  for (let z = threshold + 24; z < finish; z += 62) {
    if (z + 30 <= nearest) continue;
    const start = Math.max(z, nearest);
    polygon(ctx, [project(-2.9, 0, start), project(2.9, 0, start), project(2.9, 0, z + 30), project(-2.9, 0, z + 30)], '#f5f5e8');
  }
  if (nearest === threshold) {
    for (let x = -42; x <= 42; x += 12) {
      polygon(ctx, [project(x - 2.7, 0, threshold + 1), project(x + 2.7, 0, threshold + 1),
        project(x + 2.7, 0, threshold + 16), project(x - 2.7, 0, threshold + 16)], '#f5f5e8');
    }
  }
}

function gate(ctx: CanvasRenderingContext2D, state: FlightState, project: Project, point: PilotCheckpoint, index: number, tolerance: number) {
  const pos = project(point.x, point.height, point.z);
  const radius = Math.max(23, Math.min(73, 36 * 335 / Math.max(53, point.z - state.z)));
  const x = Math.min(821, Math.max(139, pos.x));
  const y = Math.min(240, Math.max(102, pos.y));
  const aligned = Math.abs(point.x - state.x) < tolerance && Math.abs(point.height - state.height) < tolerance * 0.82;
  ctx.beginPath();
  ctx.ellipse(x, y, radius, radius * 0.77, 0, 0, 2 * Math.PI);
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#153d5b8a';
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.strokeStyle = aligned ? '#87ffbb' : '#ffdf84';
  ctx.stroke();
  ctx.fillStyle = '#102e48dd';
  ctx.fillRect(x - 15, y - 13, 30, 24);
  ctx.fillStyle = '#fff9dc';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 17px sans-serif';
  ctx.fillText(String(index + 1), x, y);
}

function windowView(ctx: CanvasRenderingContext2D, state: FlightState, mode: PilotMode, target: PilotCheckpoint | undefined, index: number, tolerance: number, reducedMotion: boolean) {
  const atAirport = mode !== 'course';
  const horizon = 183 + (state.height - 95) * 0.27 + state.pitch;
  const offset = state.x * 0.10 + state.lateral * 0.05;
  const look: Project = (x, height, z) => {
    const depth = Math.max(31, z - state.z);
    const viewpoint = state.height + (atAirport ? 14 : 0);
    return { x: center + (x - state.x) * 410 / depth - offset, y: horizon + (viewpoint - height) * 410 / depth };
  };
  ctx.save();
  ctx.translate(center, horizon);
  ctx.rotate(reducedMotion ? -state.bank * 0.27 : -state.bank);
  ctx.translate(-center, -horizon);

  const sky = ctx.createLinearGradient(0, 10, 0, horizon + 200);
  sky.addColorStop(0, '#146ba4');
  sky.addColorStop(0.60, '#94c9df');
  sky.addColorStop(1, '#456c71');
  ctx.fillStyle = sky;
  ctx.fillRect(-230, -220, 1440, 1120);

  const panorama = getLoadedAsset(PILOT_VALLEY_ART);
  if (panorama) {
    const scale = 1 + Math.min(0.12, state.z / 7500);
    const width = 1120 * scale;
    const height = 460 * scale;
    ctx.drawImage(panorama, center - width / 2 - state.x * 0.31 - state.lateral * 0.14, horizon - height * 0.66, width, height);
  }

  if (atAirport) {
    const grass = ctx.createLinearGradient(0, horizon + 10, 0, horizon + 190);
    grass.addColorStop(0, '#a1b8a0');
    grass.addColorStop(0.09, '#7c936a');
    grass.addColorStop(1, '#637d4f');
    ctx.fillStyle = grass;
    ctx.fillRect(-230, horizon + 13, 1440, 710);
    terrain(ctx, state, look, true);
    runway(ctx, state, look);
  } else {
    terrain(ctx, state, look, false);
  }
  if (mode === 'course' && target) gate(ctx, state, look, target, index, tolerance);
  ctx.restore();
}

function drawHeading(ctx: CanvasRenderingContext2D, state: FlightState, x: number, y: number, w: number) {
  ctx.fillStyle = '#122b43';
  ctx.fillRect(x, y, w, 51);
  const centerX = x + w / 2;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 3, y + 3, w - 6, 45);
  ctx.clip();
  ctx.lineWidth = 1.3;
  ctx.strokeStyle = '#a1d8f4';
  for (let i = -5; i <= 5; i++) {
    const tick = centerX + i * 16 - state.x * 0.37 - state.lateral * 0.12;
    ctx.beginPath();
    ctx.moveTo(tick, y + 15);
    ctx.lineTo(tick, y + (i % 2 === 0 ? 34 : 27));
    ctx.stroke();
  }
  polygon(ctx, [{ x: centerX, y: y + 31 }, { x: centerX - 7, y: y + 43 }, { x: centerX + 7, y: y + 43 }], '#7aeec2');
  ctx.restore();
}

function drawAttitude(ctx: CanvasRenderingContext2D, state: FlightState) {
  const x = 428, y = 325, width = 105, height = 76;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate(-state.bank * 1.5);
  const horizon = state.pitch * 0.37 + (state.height - 100) * 0.045;
  ctx.fillStyle = '#3386ba';
  ctx.fillRect(-83, -67, 166, 134);
  ctx.fillStyle = '#84614b';
  ctx.fillRect(-83, horizon, 166, 87);
  ctx.fillStyle = '#d7edf1';
  ctx.fillRect(-83, horizon, 166, 1.7);
  ctx.restore();
  ctx.strokeStyle = '#ffd884';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(449, 363);
  ctx.lineTo(468, 363);
  ctx.lineTo(480, 369);
  ctx.lineTo(492, 363);
  ctx.lineTo(512, 363);
  ctx.stroke();
}

function drawHeight(ctx: CanvasRenderingContext2D, state: FlightState) {
  const x = 607, y = 325, width = 132;
  ctx.fillStyle = '#102a43';
  ctx.fillRect(x, y, width, 51);
  const baseline = y + 42;
  const fill = Math.max(2, Math.min(33, state.height * 0.15));
  ctx.fillStyle = '#214c6a';
  ctx.fillRect(x + 16, baseline - 34, 13, 35);
  ctx.fillStyle = '#76e3c2';
  ctx.fillRect(x + 16, baseline - fill, 13, fill);
  ctx.strokeStyle = '#8cc0de';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let tick = 0; tick < 4; tick++) {
    ctx.moveTo(x + 33, y + 10 + tick * 10);
    ctx.lineTo(x + 45, y + 10 + tick * 10);
  }
  ctx.stroke();
  ctx.fillStyle = '#c9f0ea';
  ctx.textAlign = 'right';
  ctx.font = 'bold 23px sans-serif';
  ctx.fillText(String(Math.round(state.height)), x + width - 10, y + 34);
}

function seatedCrew(ctx: CanvasRenderingContext2D, characterId: StudentCharacterId | undefined, talking: PilotLine['speaker'] | undefined) {
  const captain = getLoadedAsset(PILOT_CAPTAIN_ATLAS);
  if (captain) {
    const cellW = captain.width / 4;
    const cellH = captain.height / 2;
    const frame = talking === 'captain' ? 1 : 0;
    ctx.drawImage(captain, cellW * frame, cellH, cellW, cellH * 0.53, 52, 389, 182, 96);
  }

  const student = getStudentCharacterAtlas(characterId);
  const { width, height } = STUDENT_ATLAS_FRAME;
  if (student) {
    const row = talking === 'student' ? 3 : 1;
    ctx.drawImage(student, 0, row * height, width, height * 0.62, 735, 406, 124, 99);
  }
}

export function renderPilotCockpit(
  ctx: CanvasRenderingContext2D, state: FlightState, mode: PilotMode, point: PilotCheckpoint | undefined,
  index: number, tolerance: number, characterId: StudentCharacterId | undefined,
  talking: PilotLine['speaker'] | undefined, reducedMotion: boolean,
) {
  const { width, height } = PILOT_COCKPIT_FRAME;
  ctx.fillStyle = '#0c2241';
  ctx.fillRect(0, 0, width, height);
  windowView(ctx, state, mode, point, index, tolerance, reducedMotion);
  const cockpit = getCockpitFrame();
  if (cockpit) ctx.drawImage(cockpit, 0, 0);
  else {
    ctx.fillStyle = '#1c3149';
    ctx.fillRect(0, 321, width, 319);
  }
  drawHeading(ctx, state, 220, 325, 135);
  drawAttitude(ctx, state);
  drawHeight(ctx, state);
  seatedCrew(ctx, characterId, talking);
  if (cockpit) {
    ctx.save();
    seatMask ??= new Path2D('M0 478 Q165 460 200 578 L230 640 H0 Z M960 473 Q803 463 768 579 L748 640 H960 Z');
    ctx.clip(seatMask);
    ctx.drawImage(cockpit, 0, 0);
    ctx.restore();
  }
}
