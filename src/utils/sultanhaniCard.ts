import { GRADE_3_STAGE_4 as lesson, sultanhaniSentence } from '@/src/data/grade3Stage4Content';
import {
  SHOW_SULTANHANI_ILLUSTRATION_NOTE, SULTANHANI_VIEWS, sultanhaniSlots,
} from '@/src/data/sultanhaniStageFourAssets';
import type { SultanhanıCard } from '@/src/services/grade3Stage4Progress';

export const SULTANHANI_CARD_WIDTH = 1200;
export const SULTANHANI_CARD_HEIGHT = 800;
const font = "'Avenir Next', 'Segoe UI', system-ui, sans-serif";

export function renderSultanhaniCard(ctx: CanvasRenderingContext2D, recipe: SultanhanıCard, image: HTMLImageElement) {
  const view = SULTANHANI_VIEWS.find(({ id }) => id === recipe.viewId);
  if (!view || !image.naturalWidth || !image.naturalHeight) return false;
  const { x, y, width, height } = view.crop;
  const sx = image.naturalWidth * x / 100;
  const sy = image.naturalHeight * y / 100;
  const sw = image.naturalWidth * width / 100;
  const sh = image.naturalHeight * height / 100;
  const scale = Math.min(1080 / sw, 510 / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  const dx = (SULTANHANI_CARD_WIDTH - dw) / 2;
  const dy = 118 + (510 - dh) / 2;

  ctx.fillStyle = '#f8f2e7';
  ctx.fillRect(0, 0, SULTANHANI_CARD_WIDTH, SULTANHANI_CARD_HEIGHT);
  ctx.fillStyle = '#0e7490';
  ctx.fillRect(0, 0, SULTANHANI_CARD_WIDTH, 16);
  ctx.fillStyle = '#162231';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 44px ' + font;
  ctx.fillText(lesson.title, SULTANHANI_CARD_WIDTH / 2, 68);
  ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);

  ctx.font = '700 24px ' + font;
  const slots = sultanhaniSlots(view);
  for (const { wordId, slotId } of recipe.labels) {
    const slot = slots.find(({ id }) => id === slotId);
    if (!slot) continue;
    const cx = dx + slot.x / 100 * dw;
    const cy = dy + slot.y / 100 * dh;
    const w = ctx.measureText(wordId).width + 26;
    ctx.fillStyle = '#faf4e9';
    ctx.fillRect(cx - w / 2, cy - 17, w, 34);
    ctx.fillStyle = '#123038';
    ctx.fillText(wordId, cx, cy);
  }

  ctx.fillStyle = '#162231';
  ctx.font = '600 28px ' + font;
  recipe.sentenceIds.forEach((id, index) => {
    ctx.fillText(sultanhaniSentence(id).text, SULTANHANI_CARD_WIDTH / 2, 666 + index * 38);
  });
  ctx.fillStyle = '#31546a';
  ctx.font = '500 22px ' + font;
  ctx.fillText(lesson.place, SULTANHANI_CARD_WIDTH / 2, 759);
  if (SHOW_SULTANHANI_ILLUSTRATION_NOTE) {
    ctx.textAlign = 'right';
    ctx.font = '400 16px ' + font;
    ctx.fillText(lesson.illustrationNote, 1140, 779);
  }
  return true;
}
