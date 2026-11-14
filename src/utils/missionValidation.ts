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
 * 3. Yalnızca boşluk veya noktalama işaretlerinden oluşmayan, en az 2 harf içeren yazılı anlatım
 *
 * Yalnızca renk/araç seçmek, yalnızca noktalama işareti yazmak veya yalnızca başlık yazmak
 * tek başına özgün ürün sayılmaz.
 */
export function evaluateOriginalProduction(
  drawing: DrawingDocument,
  writtenText: string,
): ProductionCheckResult {
  const hasFreeDrawing = drawing.strokes.some((stroke) => stroke.points.length > 0);
  const hasShapeDesign = drawing.shapes.length > 0;

  const trimmedText = writtenText.trim();
  const letterMatches = trimmedText.match(/\p{L}/gu) ?? [];
  const hasWrittenNarrative = letterMatches.length >= 2;

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
