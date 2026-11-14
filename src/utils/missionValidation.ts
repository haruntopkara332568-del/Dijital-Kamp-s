import type { DrawingDocument } from '@/src/types/campus';

export interface ProductionCheckResult {
  hasFreeDrawing: boolean;
  hasShapeDesign: boolean;
  hasWrittenNarrative: boolean;
  isValid: boolean;
  activeModeCount: number;
}

/**
 * Öğrencinin özgün bir ürün oluşturup oluşturmadığını doğrular.
 * Geçerli üretim seçenekleri:
 * 1. Serbest çizim (en az bir gerçek çizgi noktası)
 * 2. Hazır şekillerle oluşturulmuş tasarım (en az bir şekil)
 * 3. Boşluklardan oluşmayan özgün yazılı anlatım
 *
 * Yalnızca renk/araç seçmek veya yalnızca başlık yazmak tek başına ürün sayılmaz.
 */
export function evaluateOriginalProduction(
  drawing: DrawingDocument,
  writtenText: string,
): ProductionCheckResult {
  const hasFreeDrawing = drawing.strokes.some((stroke) => stroke.points.length > 0);
  const hasShapeDesign = drawing.shapes.length > 0;
  const hasWrittenNarrative = writtenText.trim().length > 0;

  const activeModeCount =
    Number(hasFreeDrawing) + Number(hasShapeDesign) + Number(hasWrittenNarrative);

  return {
    hasFreeDrawing,
    hasShapeDesign,
    hasWrittenNarrative,
    isValid: hasFreeDrawing || hasShapeDesign || hasWrittenNarrative,
    activeModeCount,
  };
}
