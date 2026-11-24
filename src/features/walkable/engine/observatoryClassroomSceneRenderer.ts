import { OBSERVATORY_CLASSROOM } from '@/src/data/observatoryClassroomConfig';
import type { PlayerCharacter } from '../types';
import {
  getObservatoryClassroomBgAsset,
  getObservatorySolarTableAsset,
} from './assetLoader';
import { drawCharacter } from './characterRenderer';

const DOME_TWINKLE_STARS = [
  { x: 266, y: 48, phase: 0.2 },
  { x: 356, y: 86, phase: 1.4 },
  { x: 430, y: 58, phase: 2.3 },
  { x: 646, y: 74, phase: 0.9 },
  { x: 760, y: 44, phase: 3.1 },
  { x: 518, y: 129, phase: 0.5 },
  { x: 500, y: 244, phase: 1.9 },
  { x: 540, y: 262, phase: 2.8 },
] as const;

function drawFallbackBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#0d1b3e');
  grad.addColorStop(0.55, '#1d325e');
  grad.addColorStop(0.56, '#c8b28d');
  grad.addColorStop(1, '#dfd0b3');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

function drawSubtleAtmosphere(ctx: CanvasRenderingContext2D, now: number) {
  ctx.save();
  // Kubbe ve pencere yıldızlarında yumuşak parıltı
  for (const star of DOME_TWINKLE_STARS) {
    const alpha = 0.25 + 0.45 * (0.5 + 0.5 * Math.sin(now / 900 + star.phase));
    ctx.fillStyle = `rgba(255, 246, 206, ${alpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Avluya dönüş eşiği üzerinde hafif yönlendirici zemin ışığı
  const { exitDoor } = OBSERVATORY_CLASSROOM;
  const exitPulse = 0.22 + 0.1 * Math.sin(now / 800);
  ctx.fillStyle = `rgba(14, 118, 138, ${exitPulse.toFixed(3)})`;
  ctx.beginPath();
  ctx.ellipse(exitDoor.x, exitDoor.y + 8, 28, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(246, 220, 155, 0.72)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}

function drawSolarTableOcclusion(ctx: CanvasRenderingContext2D, now: number) {
  const tableAsset = getObservatorySolarTableAsset();
  const { solarTableOverlay } = OBSERVATORY_CLASSROOM;
  if (tableAsset) {
    ctx.drawImage(
      tableAsset,
      solarTableOverlay.x,
      solarTableOverlay.y,
      solarTableOverlay.width,
      solarTableOverlay.height,
    );
  }

  // Merkezdeki Güneş üzerinde hafif canlı parıltı halkası
  const glowAlpha = 0.08 + 0.06 * Math.sin(now / 700);
  const glow = ctx.createRadialGradient(512, 366, 18, 512, 366, 54);
  glow.addColorStop(0, `rgba(255, 232, 138, ${glowAlpha.toFixed(3)})`);
  glow.addColorStop(1, 'rgba(255, 190, 64, 0)');
  ctx.save();
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(512, 366, 54, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Yerden Göklere gözlemevi arka planı (1024 × 576 yazısız referans görseli + hafif atmosfer).
 */
export function renderObservatoryClassroomLayeredBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const isReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const now = isReducedMotion ? 0 : typeof performance !== 'undefined' ? performance.now() : 0;

  const bg = getObservatoryClassroomBgAsset();
  if (bg) {
    ctx.drawImage(bg, 0, 0, width, height);
  } else {
    drawFallbackBackground(ctx, width, height);
  }

  drawSubtleAtmosphere(ctx, now);
}

/**
 * 2,5B derinlik sıralı öğrenci karakteri ve merkezî Güneş Sistemi düzeneği.
 * Öğrenci düzeneğin arkasına (teleskoba veya arka kemerlere) yürüdüğünde Güneş Sistemi
 * masasının arkasında, önüne geldiğinde ise önünde görünür.
 */
export function renderObservatoryClassroomEntities(
  ctx: CanvasRenderingContext2D,
  player: PlayerCharacter,
) {
  const isReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const now = isReducedMotion ? 0 : typeof performance !== 'undefined' ? performance.now() : 0;

  const feetY = player.y + 18;
  const playerBehindSolarTable = feetY < OBSERVATORY_CLASSROOM.solarTableOverlay.depthSplitY;

  if (playerBehindSolarTable) {
    drawCharacter(ctx, player, 'idle');
    drawSolarTableOcclusion(ctx, now);
  } else {
    drawSolarTableOcclusion(ctx, now);
    drawCharacter(ctx, player, 'idle');
  }
}
