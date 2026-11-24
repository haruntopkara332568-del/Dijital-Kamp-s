import { DOCTOR_ROOM, type ClinicDemo, type DoctorSpeaker } from '@/src/data/doctorVisitContent';
import { drawCharacter } from './characterRenderer';
import { getLoadedAsset } from './assetLoader';
import type { PlayerCharacter, Position, SceneObstacle } from '../types';

const roomUrl = '/assets/walkable/doctor-exam-room.jpg';
const guideUrl = '/assets/walkable/doctor-guide-atlas.png';
const guideHeight = 91;

export const DOCTOR_ROOM_OBSTACLES: SceneObstacle[] = [
  { id: 'doctor-wall', name: 'Oda duvarı', x: 0, y: 0, width: 960, height: 346 },
  { id: 'doctor-counter-front', name: 'Araç tezgâhı', x: 0, y: 346, width: 105, height: 135 },
  { id: 'doctor-counter-side', name: 'Araç tezgâhı', x: 105, y: 346, width: 114, height: 101 },
  { id: 'doctor-desk', name: 'Doktor masası ve sandalye', x: 219, y: 346, width: 162, height: 29 },
  { id: 'doctor-stools', name: 'Tabureler', x: 416, y: 346, width: 172, height: 16 },
  { id: 'doctor-bed', name: 'Muayene yatağı', x: 613, y: 346, width: 144, height: 45 },
  { id: 'doctor-monitor', name: 'Eğitim cihazı', x: 757, y: 346, width: 92, height: 54 },
  { id: 'doctor-cabinets', name: 'Dolaplar', x: 850, y: 346, width: 110, height: 94 },
  { id: 'doctor-guide', name: 'Rehber doktor', x: DOCTOR_ROOM.guide.x - 11, y: DOCTOR_ROOM.guide.y + 7, width: 22, height: 13 },
  { id: 'doctor-patient', name: 'Deniz', x: DOCTOR_ROOM.patient.x - 10, y: DOCTOR_ROOM.patient.y + 7, width: 20, height: 13 },
];

type DoctorAnimation = {
  speaker?: DoctorSpeaker;
  demo?: ClinicDemo;
  demoElapsed: number;
  station?: { position: Position; marker: Position };
};

export function preloadDoctorRoom() {
  getLoadedAsset(roomUrl);
  getLoadedAsset(guideUrl);
}

export function renderDoctorRoomBackground(ctx: CanvasRenderingContext2D) {
  const room = getLoadedAsset(roomUrl);
  if (room) {
    ctx.drawImage(room, 0, 0, DOCTOR_ROOM.width, DOCTOR_ROOM.height);
    return;
  }
  ctx.fillStyle = '#efb438';
  ctx.fillRect(0, 0, DOCTOR_ROOM.width, 346);
  ctx.fillStyle = '#f4eadb';
  ctx.fillRect(0, 346, DOCTOR_ROOM.width, DOCTOR_ROOM.height - 346);
}

function drawClinicCoat(ctx: CanvasRenderingContext2D, player: Pick<PlayerCharacter, 'x' | 'y' | 'direction' | 'state' | 'walkFrame'>) {
  const side = player.direction === 'right' || player.direction === 'left';
  const back = player.direction === 'up';
  const movement = player.state === 'walk' ? Math.sin(player.walkFrame * Math.PI / 2) * 0.65 : 0;

  ctx.save();
  ctx.translate(player.x + movement, player.y);
  if (player.direction === 'left') ctx.scale(-1, 1);
  if (side) ctx.scale(0.84, 1);

  const fabric = ctx.createLinearGradient(-12, -27, 13, 5);
  fabric.addColorStop(0, '#e3eef2');
  fabric.addColorStop(0.42, '#fffdf8');
  fabric.addColorStop(1, '#b0c9d4');
  ctx.fillStyle = fabric;
  ctx.strokeStyle = '#a4bbc5';
  ctx.lineWidth = 0.65;
  ctx.beginPath();
  ctx.moveTo(-5.2, -27.4);
  ctx.quadraticCurveTo(-10.8, -27, -12.4, -21.5);
  ctx.lineTo(-14.1, -9.7);
  ctx.lineTo(-10.4, -8.2);
  ctx.lineTo(-9.6, -12.6);
  ctx.lineTo(-11, 3);
  ctx.quadraticCurveTo(-6, 5.1, -1.2, 4.6);
  ctx.lineTo(0.6, 1.9);
  ctx.lineTo(2.1, 4.6);
  ctx.quadraticCurveTo(7.8, 5.1, 11.5, 2.7);
  ctx.lineTo(9.7, -12.4);
  ctx.lineTo(10.9, -8.8);
  ctx.lineTo(14, -10.1);
  ctx.lineTo(12, -21.5);
  ctx.quadraticCurveTo(10.8, -26.1, 5.5, -27.4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#8daebc';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  if (back) {
    ctx.moveTo(-6, -20);
    ctx.quadraticCurveTo(0.6, -17.8, 6, -20);
    ctx.moveTo(0.6, -18.8);
    ctx.lineTo(0.6, 1.7);
  } else {
    const seam = side ? 4.5 : 0.8;
    ctx.moveTo(-5, -26.1);
    ctx.lineTo(-2.8, -20.5);
    ctx.lineTo(seam, -14.5);
    ctx.lineTo(6, -25.9);
    ctx.moveTo(seam, -14.5);
    ctx.lineTo(seam, 1.8);
    ctx.moveTo(-7.5, -4.7);
    ctx.lineTo(-3.7, -4.7);
    ctx.lineTo(-3.7, -1.5);
    ctx.lineTo(-7.5, -1.5);
    ctx.moveTo(4.1, -4.7);
    ctx.lineTo(8, -4.7);
    ctx.lineTo(8, -1.5);
    ctx.lineTo(4.1, -1.5);
  }
  ctx.stroke();
  ctx.restore();
}

function drawGuide(ctx: CanvasRenderingContext2D, talking: boolean, motionTime: number) {
  const guide = getLoadedAsset(guideUrl);
  const { x, y } = DOCTOR_ROOM.guide;
  if (!guide) {
    drawCharacter(ctx, { characterId: 'elif', x, y, direction: 'down', state: 'idle', walkFrame: 0 }, 'idle');
    drawClinicCoat(ctx, { x, y, direction: 'down', state: 'idle', walkFrame: 0 });
    return;
  }

  ctx.save();
  ctx.fillStyle = 'rgba(23, 43, 71, .22)';
  ctx.beginPath();
  ctx.ellipse(x, y + 18, 17, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  const frameWidth = guide.width / 2;
  const drawWidth = guideHeight * frameWidth / guide.height;
  const gesture = talking && (motionTime === 0 || Math.floor(motionTime / 540) % 3 !== 2);
  const bob = Math.sin(motionTime / (talking ? 180 : 580)) * (talking ? 1.2 : 0.55);
  ctx.drawImage(guide, gesture ? frameWidth : 0, 0, frameWidth, guide.height,
    x - drawWidth / 2, y + 18 - guideHeight * 0.958 + bob, drawWidth, guideHeight);
  ctx.restore();
}

function drawPatient(ctx: CanvasRenderingContext2D, player: PlayerCharacter, talking: boolean, motionTime: number) {
  const { x, y } = DOCTOR_ROOM.patient;
  const nod = talking ? Math.sin(motionTime / 140) * 0.9 : 0;
  drawCharacter(ctx, {
    characterId: player.characterId === 'deniz' ? 'arda' : 'deniz',
    x, y: y + nod, direction: 'down', state: 'idle', walkFrame: 0,
  }, 'idle');
}

function drawStationMarkers(ctx: CanvasRenderingContext2D, station: NonNullable<DoctorAnimation['station']>, now: number) {
  ctx.save();
  ctx.strokeStyle = '#0b647e';
  ctx.fillStyle = 'rgba(177, 242, 251, .23)';
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.ellipse(station.position.x, station.position.y + 15, 19, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#d8fbff';
  ctx.strokeStyle = '#1b7388';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(station.marker.x, station.marker.y, 5 + Math.sin(now / 260) * 1.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawDemo(ctx: CanvasRenderingContext2D, demo: ClinicDemo, elapsed: number) {
  ctx.save();
  ctx.strokeStyle = '#9ff6ef';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  if (demo === 'heartbeat') {
    const pulse = elapsed < 420 ? 6 + Math.sin(elapsed / 28) * 4 : 7;
    ctx.moveTo(781, 231);
    ctx.lineTo(789, 231);
    ctx.lineTo(794, 231 - pulse);
    ctx.lineTo(800, 237);
    ctx.lineTo(806, 228);
    ctx.lineTo(812, 231);
    ctx.lineTo(820, 231);
  } else {
    ctx.moveTo(790, 231);
    ctx.lineTo(797, 237);
    ctx.lineTo(810, 222);
  }
  ctx.stroke();
  ctx.restore();
}

export function renderDoctorRoomEntities(ctx: CanvasRenderingContext2D, player: PlayerCharacter, animation: DoctorAnimation) {
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const now = reduce ? 0 : performance.now();

  if (animation.station) drawStationMarkers(ctx, animation.station, now);
  if (animation.demo) drawDemo(ctx, animation.demo, reduce ? 420 : animation.demoElapsed);

  const ordered = [
    { y: DOCTOR_ROOM.guide.y, draw: () => drawGuide(ctx, animation.speaker === 'guide', now) },
    { y: DOCTOR_ROOM.patient.y, draw: () => drawPatient(ctx, player, animation.speaker === 'patient', now) },
    { y: player.y, draw: () => {
      drawCharacter(ctx, player, 'idle');
      drawClinicCoat(ctx, player);
    } },
  ].sort((first, second) => first.y - second.y);
  ordered.forEach(({ draw }) => draw());
}

export function updateDoctorSpeechAnchor(ctx: CanvasRenderingContext2D, bubble: HTMLDivElement, player: PlayerCharacter, speaker: DoctorSpeaker, scaleX: number, scaleY: number) {
  const projection = ctx.getTransform?.();
  if (!projection) return;
  const actor = speaker === 'student' ? player : DOCTOR_ROOM[speaker];
  const height = speaker === 'guide' ? guideHeight : 67;
  const x = Math.round((actor.x * projection.a + projection.e) * scaleX);
  const y = Math.round(((actor.y + 10 - height) * projection.d + projection.f) * scaleY);
  const xPx = x + 'px';
  const yPx = y + 'px';
  if (bubble.style.getPropertyValue('--doctor-bubble-x') !== xPx) bubble.style.setProperty('--doctor-bubble-x', xPx);
  if (bubble.style.getPropertyValue('--doctor-bubble-y') !== yPx) bubble.style.setProperty('--doctor-bubble-y', yPx);
}
