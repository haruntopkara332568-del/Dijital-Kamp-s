import type { DrawingDocument, DrawingShapeItem, GradeLevel } from '@/src/types/campus';

const FONT_STACK = "'Avenir Next', 'Segoe UI', system-ui, -apple-system, sans-serif";

function drawShapeOnContext(ctx: CanvasRenderingContext2D, shape: DrawingShapeItem): void {
  ctx.save();
  ctx.fillStyle = shape.color;
  ctx.strokeStyle = '#162231';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  const { x, y, width, height } = shape;

  switch (shape.type) {
    case 'arch': {
      const r = width / 2;
      const rectHeight = Math.max(0, height - r);
      ctx.beginPath();
      ctx.moveTo(x, y + height);
      ctx.lineTo(x, y + r);
      ctx.arc(x + r, y + r, r, Math.PI, 0, false);
      ctx.lineTo(x + width, y + height);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // İç kemer çizgisi
      if (width > 30 && rectHeight > 10) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255,255,255,0.45)';
        ctx.lineWidth = 2;
        ctx.arc(x + r, y + r, Math.max(6, r - 10), Math.PI, 0, false);
        ctx.stroke();
      }
      break;
    }
    case 'rectangle': {
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, 6);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'star-motif': {
      const cx = x + width / 2;
      const cy = y + height / 2;
      const outerR = Math.min(width, height) / 2;
      const innerR = outerR * 0.48;
      ctx.beginPath();
      for (let i = 0; i < 16; i++) {
        const angle = (Math.PI / 8) * i - Math.PI / 2;
        const rad = i % 2 === 0 ? outerR : innerR;
        const px = cx + Math.cos(angle) * rad;
        const py = cy + Math.sin(angle) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'handle': {
      const cx = x + width / 2;
      const cy = y + height / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(width, height) / 2.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy + 4, Math.min(width, height) / 4.2, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'window': {
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, 8);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + width / 2, y);
      ctx.lineTo(x + width / 2, y + height);
      ctx.moveTo(x, y + height / 2);
      ctx.lineTo(x + width, y + height / 2);
      ctx.stroke();
      break;
    }
    case 'column': {
      ctx.beginPath();
      ctx.roundRect(x + width * 0.15, y + 10, width * 0.7, height - 20, 4);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(x, y, width, 12, 3);
      ctx.roundRect(x, y + height - 12, width, 12, 3);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'tree': {
      ctx.fillStyle = '#8a5634';
      ctx.fillRect(x + width * 0.4, y + height * 0.58, width * 0.2, height * 0.42);
      ctx.strokeRect(x + width * 0.4, y + height * 0.58, width * 0.2, height * 0.42);
      ctx.fillStyle = shape.color;
      ctx.beginPath();
      ctx.arc(x + width / 2, y + height * 0.4, Math.min(width, height) * 0.38, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
  }
  ctx.restore();
}

export function renderDrawingToCanvas(
  ctx: CanvasRenderingContext2D,
  doc: DrawingDocument,
  offsetX = 0,
  offsetY = 0,
  scale = 1,
): void {
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  ctx.fillStyle = doc.backgroundColor;
  ctx.fillRect(0, 0, doc.width, doc.height);

  for (const shape of doc.shapes) {
    drawShapeOnContext(ctx, shape);
  }

  for (const stroke of doc.strokes) {
    if (stroke.points.length === 0) continue;
    ctx.save();
    ctx.strokeStyle = stroke.color;
    ctx.fillStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (stroke.points.length === 1) {
      ctx.beginPath();
      ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  ctx.restore();
}

export function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const normalized = text.trim();
  if (!normalized) return [];

  const paragraphs = normalized.split(/\r?\n/);
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push('');
      continue;
    }
    let currentLine = '';
    for (const word of words) {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxWidth) {
        currentLine = candidate;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        // Çok uzun tek kelime varsa karakter bazında böl
        if (ctx.measureText(word).width > maxWidth) {
          let chunk = '';
          for (const ch of word) {
            if (ctx.measureText(chunk + ch).width <= maxWidth) {
              chunk += ch;
            } else {
              if (chunk) lines.push(chunk);
              chunk = ch;
            }
          }
          currentLine = chunk;
        } else {
          currentLine = word;
        }
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return lines;
}

export function composeArtifactPngDataUrl(params: {
  missionTitle: string;
  grade: GradeLevel;
  doorName: string;
  writtenText: string;
  materialChoice?: string;
  usedEnglishWords: string[];
  drawingData: DrawingDocument;
}): string {
  const canvasWidth = 1000;
  const padding = 48;
  const contentWidth = canvasWidth - padding * 2;

  const measureCanvas = document.createElement('canvas');
  const mCtx = measureCanvas.getContext('2d');
  if (!mCtx) return '';

  mCtx.font = `400 22px ${FONT_STACK}`;
  const bodyText =
    params.writtenText.trim() || 'Öğrenci çizimi ve hazır şekillerle oluşturulan özgün kapı çalışması.';
  const wrappedLines = wrapCanvasText(mCtx, bodyText, contentWidth - 40);

  mCtx.font = `700 32px ${FONT_STACK}`;
  const titleText = params.doorName.trim() || 'Özgün Kapı Tasarımım';
  const wrappedTitleLines = wrapCanvasText(mCtx, titleText, contentWidth);

  const headerHeight = 84;
  const titleHeight = wrappedTitleLines.length * 40 + 16;
  const drawingScale = contentWidth / params.drawingData.width;
  const drawingDisplayHeight = Math.round(params.drawingData.height * drawingScale);
  const materialBlockHeight = params.materialChoice ? 34 : 0;
  const wordsBlockHeight = params.usedEnglishWords.length > 0 ? 44 : 0;
  const textBoxPadding = 28;
  const textHeight = wrappedLines.length * 32 + textBoxPadding * 2;
  const footerHeight = 56;

  const totalHeight =
    padding +
    headerHeight +
    titleHeight +
    drawingDisplayHeight +
    28 +
    materialBlockHeight +
    wordsBlockHeight +
    textHeight +
    footerHeight +
    padding;

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = totalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Arka plan
  ctx.fillStyle = '#f6f8fa';
  ctx.fillRect(0, 0, canvasWidth, totalHeight);

  // Üst ince Selçuklu turkuaz şerit
  ctx.fillStyle = '#0e7490';
  ctx.fillRect(0, 0, canvasWidth, 10);

  // Üst bilgi satırı
  let cursorY = padding + 14;
  ctx.fillStyle = '#0e7490';
  ctx.font = `600 18px ${FONT_STACK}`;
  ctx.fillText(`Dijital Eğitim Kampüsü · ${params.grade}. Sınıf · ${params.missionTitle}`, padding, cursorY);

  cursorY += 46;
  ctx.fillStyle = '#162231';
  ctx.font = `700 32px ${FONT_STACK}`;
  for (const tLine of wrappedTitleLines) {
    ctx.fillText(tLine, padding, cursorY);
    cursorY += 40;
  }

  cursorY += 12;

  // Çizim çerçevesi
  ctx.save();
  ctx.strokeStyle = '#d5dee8';
  ctx.lineWidth = 2;
  ctx.strokeRect(padding - 1, cursorY - 1, contentWidth + 2, drawingDisplayHeight + 2);
  renderDrawingToCanvas(ctx, params.drawingData, padding, cursorY, drawingScale);
  ctx.restore();

  cursorY += drawingDisplayHeight + 28;

  // Seçilen malzeme varsa ekle
  if (params.materialChoice) {
    ctx.fillStyle = '#1b3152';
    ctx.font = `600 18px ${FONT_STACK}`;
    ctx.fillText(`Seçilen Malzeme: ${params.materialChoice}`, padding, cursorY + 14);
    cursorY += materialBlockHeight;
  }

  // Seçilen İngilizce kelimeler varsa ekle
  if (params.usedEnglishWords.length > 0) {
    ctx.fillStyle = '#0e7490';
    ctx.font = `600 18px ${FONT_STACK}`;
    ctx.fillText(`Kullanılan İngilizce Kelimeler: ${params.usedEnglishWords.join(' · ')}`, padding, cursorY + 14);
    cursorY += wordsBlockHeight;
  }

  // Metin kutusu (kesilmeyi önleyen dinamik yükseklik)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#d5dee8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(padding, cursorY, contentWidth, textHeight, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#162231';
  ctx.font = `400 22px ${FONT_STACK}`;
  let textY = cursorY + textBoxPadding + 20;
  for (const line of wrappedLines) {
    ctx.fillText(line, padding + 20, textY);
    textY += 32;
  }

  cursorY += textHeight + 34;
  ctx.fillStyle = '#4b5b6e';
  ctx.font = `400 15px ${FONT_STACK}`;
  const formattedDate = new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'long',
  }).format(new Date());
  ctx.fillText(`Bu çalışma cihazında oluşturuldu · ${formattedDate}`, padding, cursorY);

  return canvas.toDataURL('image/png');
}
