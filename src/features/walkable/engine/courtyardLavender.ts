// ELLE DOĞRULANACAK: Fotoğraf kırpımları, renk tonları ve şeritlerin
// çim bordürlerine, yollara ve yön levhalarına göre açıklığı.
export const USE_LAVENDER = true;

const LAVENDER_IMAGE_URL = '/assets/walkable/lavanta_1.jpg';
const LAVENDER_FILTER = 'saturate(0.88) brightness(1.28) contrast(0.90)';
const SPRITE_SCALE = 2;
const MAX_SOURCE_UPSCALE = 2;

export const COURTYARD_GRASS_PLOTS = {
  upperWest: { x: 60, y: 340, w: 340, h: 90, r: 16 },
  upperEast: { x: 990, y: 340, w: 350, h: 90, r: 16 },
  lowerWest: { x: 90, y: 530, w: 350, h: 180, r: 18 },
  lowerEast: { x: 960, y: 530, w: 350, h: 180, r: 18 },
  middleWest: { x: 440, y: 360, w: 140, h: 80, r: 14 },
  middleEast: { x: 820, y: 360, w: 140, h: 80, r: 14 },
  southWest: { x: 490, y: 670, w: 160, h: 130, r: 16 },
  southEast: { x: 750, y: 670, w: 160, h: 130, r: 16 },
} as const;

// Fotoğraf 500 × 500. Gökyüzü ve ufuk bu alanların üstünde kalır.
const LAVENDER_CROPS = [
  { x: 12, y: 190, w: 300, h: 170, rowAngle: 45 },
  { x: 174, y: 187, w: 308, h: 191, rowAngle: 61 },
  { x: 38, y: 274, w: 371, h: 200, rowAngle: 39 },
] as const;

interface LavenderBed {
  plot: keyof typeof COURTYARD_GRASS_PLOTS;
  left: number;
  top: number;
  width: number;
  height: number;
  crop: 0 | 1 | 2;
  mirror?: boolean;
  vertical?: boolean;
}

const LAVENDER_BEDS: readonly LavenderBed[] = [
  { plot: 'upperWest', left: 220, top: 47, width: 100, height: 31, crop: 0 },
  { plot: 'upperEast', left: 43, top: 49, width: 100, height: 29, crop: 1, mirror: true },
  { plot: 'middleWest', left: 92, top: 8, width: 30, height: 13, crop: 1 },
  { plot: 'middleEast', left: 65, top: 62, width: 45, height: 12, crop: 2, mirror: true },
  { plot: 'southWest', left: 18, top: 22, width: 40, height: 88, crop: 2, vertical: true },
  { plot: 'southEast', left: 102, top: 22, width: 42, height: 88, crop: 0, mirror: true, vertical: true },
];

interface BedSprite {
  canvas: HTMLCanvasElement;
  x: number;
  y: number;
  width: number;
  height: number;
  sourceScale: number;
}

export interface CourtyardLavenderLayer {
  draw: (ctx: CanvasRenderingContext2D) => void;
  dispose: () => void;
}

function createCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width * SPRITE_SCALE;
  canvas.height = height * SPRITE_SCALE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.scale(SPRITE_SCALE, SPRITE_SCALE);
  return { canvas, ctx };
}

function drawLavenderRow(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  ctx.scale(width, height);
  ctx.beginPath();
  ctx.moveTo(0.045, 0.51);
  ctx.bezierCurveTo(0.056, 0.12, 0.18, 0.12, 0.27, 0.15);
  ctx.bezierCurveTo(0.41, 0.02, 0.52, 0.19, 0.66, 0.12);
  ctx.bezierCurveTo(0.82, 0.09, 0.94, 0.17, 0.956, 0.47);
  ctx.bezierCurveTo(0.96, 0.77, 0.85, 0.90, 0.71, 0.82);
  ctx.bezierCurveTo(0.57, 0.92, 0.45, 0.76, 0.30, 0.90);
  ctx.bezierCurveTo(0.15, 0.92, 0.054, 0.76, 0.045, 0.51);
  ctx.fill();
  ctx.restore();
}

function createBedSprite(photo: HTMLImageElement, bed: LavenderBed, debug: boolean): BedSprite | null {
  const plot = COURTYARD_GRASS_PLOTS[bed.plot];
  const crop = LAVENDER_CROPS[bed.crop];
  if (crop.x + crop.w > photo.naturalWidth || crop.y + crop.h > photo.naturalHeight) return null;

  const width = bed.vertical ? bed.height : bed.width;
  const height = bed.vertical ? bed.width : bed.height;
  const surface = createCanvas(width, height);
  const mask = createCanvas(width, height);
  if (!surface || !mask) return null;
  const { ctx } = surface;

  const angle = crop.rowAngle * Math.PI / 180;
  const sourceScale = Math.max(
    (width * Math.cos(angle) + height * Math.sin(angle)) / crop.w,
    (width * Math.sin(angle) + height * Math.cos(angle)) / crop.h,
  );
  const photoWidth = crop.w * sourceScale;
  const photoHeight = crop.h * sourceScale;

  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(bed.mirror ? -angle : angle);
  if (bed.mirror) ctx.scale(-1, 1);
  ctx.filter = LAVENDER_FILTER;
  ctx.drawImage(photo, crop.x, crop.y, crop.w, crop.h, -photoWidth / 2, -photoHeight / 2, photoWidth, photoHeight);
  ctx.restore();

  mask.ctx.filter = 'blur(1.8px)';
  if (height >= 25) {
    const rowWidth = width * 0.93;
    const rowHeight = height * 0.48;
    drawLavenderRow(mask.ctx, rowWidth, rowHeight);
    mask.ctx.translate(width - rowWidth, height - rowHeight);
    drawLavenderRow(mask.ctx, rowWidth, rowHeight);
  } else {
    drawLavenderRow(mask.ctx, width, height);
  }
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(mask.canvas, 0, 0, width, height);

  if (debug) {
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = 'rgba(43, 220, 247, 0.44)';
    ctx.fillRect(0, 0, width, height);
  }

  ctx.globalCompositeOperation = 'destination-over';
  ctx.translate(width / 2, height * 0.54);
  ctx.scale(width / 2, height / 2);
  const shadow = ctx.createRadialGradient(0, 0, 0.43, 0, 0, 1);
  shadow.addColorStop(0, 'rgba(43, 32, 41, 0.30)');
  shadow.addColorStop(1, 'rgba(43, 32, 41, 0)');
  ctx.fillStyle = shadow;
  ctx.fillRect(-1, -1, 2, 2);

  const sprite = createCanvas(bed.width, bed.height);
  if (!sprite) return null;
  const paint = sprite.ctx;

  // Çim verisiyle aynı bordürü kullan, yaprak ve gölge payını çim içinde tut.
  paint.beginPath();
  paint.roundRect(8 - bed.left, 8 - bed.top, plot.w - 16, plot.h - 16, Math.max(2, plot.r - 8));
  paint.clip();
  paint.translate(bed.width / 2, bed.height / 2);
  if (bed.vertical) paint.rotate(Math.PI / 2);
  paint.drawImage(surface.canvas, -width / 2, -height / 2, width, height);

  return { canvas: sprite.canvas, x: plot.x + bed.left, y: plot.y + bed.top, width: bed.width, height: bed.height, sourceScale };
}

export function createCourtyardLavenderLayer(): CourtyardLavenderLayer | undefined {
  if (!USE_LAVENDER || typeof window === 'undefined') return undefined;

  const debug = import.meta.env.DEV && new URLSearchParams(window.location.search).get('debug') === 'lavanta';
  const photo = new Image();
  let beds: BedSprite[] = [];
  photo.onload = () => {
    beds = LAVENDER_BEDS.flatMap(bed => {
      const sprite = createBedSprite(photo, bed, debug);
      return sprite ? [sprite] : [];
    });
  };
  photo.src = LAVENDER_IMAGE_URL;

  return {
    draw(ctx) {
      if (beds.length === 0) return;
      const transform = ctx.getTransform();
      const screenScale = Math.hypot(transform.a, transform.b) * (window.devicePixelRatio || 1);
      for (const bed of beds) {
        if (bed.sourceScale * screenScale <= MAX_SOURCE_UPSCALE) {
          ctx.drawImage(bed.canvas, bed.x, bed.y, bed.width, bed.height);
        }
      }
    },
    dispose() {
      photo.onload = null;
      photo.removeAttribute('src');
      beds = [];
    },
  };
}
