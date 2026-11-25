import React, { useEffect, useRef } from 'react';
import type { CelestialBodyId } from '@/src/data/earthSunMoonActivity';
import { projectSurfacePoint } from '@/src/data/earthSunMoonExperiments';

const TEX_W = 512;
const TEX_H = 256;

interface SurfaceTexture {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

const textureCache = new Map<CelestialBodyId, SurfaceTexture>();

function hash3(x: number, y: number, z: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453123;
  return n - Math.floor(n);
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function valueNoise3D(x: number, y: number, z: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fx = smoothstep(x - ix);
  const fy = smoothstep(y - iy);
  const fz = smoothstep(z - iz);

  const n000 = hash3(ix, iy, iz);
  const n100 = hash3(ix + 1, iy, iz);
  const n010 = hash3(ix, iy + 1, iz);
  const n110 = hash3(ix + 1, iy + 1, iz);
  const n001 = hash3(ix, iy, iz + 1);
  const n101 = hash3(ix + 1, iy, iz + 1);
  const n011 = hash3(ix, iy + 1, iz + 1);
  const n111 = hash3(ix + 1, iy + 1, iz + 1);

  const nx00 = lerp(n000, n100, fx);
  const nx10 = lerp(n010, n110, fx);
  const nx01 = lerp(n001, n101, fx);
  const nx11 = lerp(n011, n111, fx);

  const nxy0 = lerp(nx00, nx10, fy);
  const nxy1 = lerp(nx01, nx11, fy);

  return lerp(nxy0, nxy1, fz);
}

function fbm3D(x: number, y: number, z: number, octaves = 4): number {
  let value = 0;
  let amp = 0.5;
  let freq = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    value += amp * valueNoise3D(x * freq, y * freq, z * freq);
    norm += amp;
    amp *= 0.5;
    freq *= 2.04;
  }
  return value / norm;
}

interface BlobSpec {
  lonDeg: number;
  latDeg: number;
  rxDeg: number;
  ryDeg: number;
  weight: number;
}

const EARTH_CONTINENT_BLOBS: readonly BlobSpec[] = [
  // Avrupa & Anadolu
  { lonDeg: 18, latDeg: 48, rxDeg: 28, ryDeg: 14, weight: 1.0 },
  { lonDeg: 35, latDeg: 39, rxDeg: 16, ryDeg: 7, weight: 1.05 },
  // Afrika
  { lonDeg: 18, latDeg: 10, rxDeg: 26, ryDeg: 24, weight: 1.15 },
  { lonDeg: 28, latDeg: -16, rxDeg: 16, ryDeg: 20, weight: 1.05 },
  // Asya
  { lonDeg: 76, latDeg: 52, rxDeg: 48, ryDeg: 22, weight: 1.2 },
  { lonDeg: 104, latDeg: 34, rxDeg: 32, ryDeg: 18, weight: 1.1 },
  { lonDeg: 78, latDeg: 20, rxDeg: 15, ryDeg: 14, weight: 0.95 },
  { lonDeg: 48, latDeg: 25, rxDeg: 14, ryDeg: 11, weight: 0.95 },
  // Kuzey Amerika
  { lonDeg: -102, latDeg: 47, rxDeg: 36, ryDeg: 22, weight: 1.2 },
  { lonDeg: -96, latDeg: 23, rxDeg: 16, ryDeg: 12, weight: 0.9 },
  // Grönland
  { lonDeg: -42, latDeg: 72, rxDeg: 18, ryDeg: 10, weight: 1.0 },
  // Güney Amerika
  { lonDeg: -60, latDeg: -12, rxDeg: 20, ryDeg: 22, weight: 1.15 },
  { lonDeg: -66, latDeg: -37, rxDeg: 10, ryDeg: 18, weight: 1.0 },
  // Avustralya
  { lonDeg: 134, latDeg: -25, rxDeg: 20, ryDeg: 13, weight: 1.1 },
];

interface LunarCrater {
  x: number;
  y: number;
  z: number;
  radius: number;
  depth: number;
  hasRays: boolean;
}

function createLunarCraters(): LunarCrater[] {
  const craters: LunarCrater[] = [];
  let seed = 918273;
  const nextRand = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 0x100000000;
  };

  // Belirgin büyük kraterler (Tycho / Copernicus / Clavius benzeri)
  const featured = [
    { lon: -0.35, lat: -0.62, r: 0.2, d: 1.0, rays: true },
    { lon: 0.28, lat: 0.16, r: 0.18, d: 0.95, rays: true },
    { lon: -0.95, lat: 0.34, r: 0.22, d: 0.9, rays: false },
    { lon: 1.22, lat: -0.25, r: 0.19, d: 0.9, rays: true },
    { lon: 2.35, lat: 0.28, r: 0.21, d: 0.95, rays: false },
    { lon: -2.15, lat: -0.32, r: 0.17, d: 0.9, rays: true },
    { lon: 0.65, lat: -0.45, r: 0.14, d: 0.85, rays: false },
    { lon: -0.1, lat: 0.48, r: 0.15, d: 0.85, rays: false },
  ];

  for (const item of featured) {
    const clat = Math.cos(item.lat);
    craters.push({
      x: Math.sin(item.lon) * clat,
      y: Math.sin(item.lat),
      z: Math.cos(item.lon) * clat,
      radius: item.r,
      depth: item.d,
      hasRays: item.rays,
    });
  }

  for (let i = 0; i < 52; i++) {
    const lon = (nextRand() * 2 - 1) * Math.PI;
    const lat = (nextRand() * 2 - 1) * 1.32;
    const clat = Math.cos(lat);
    craters.push({
      x: Math.sin(lon) * clat,
      y: Math.sin(lat),
      z: Math.cos(lon) * clat,
      radius: 0.045 + nextRand() * 0.105,
      depth: 0.55 + nextRand() * 0.4,
      hasRays: i % 11 === 0,
    });
  }

  return craters;
}

const LUNAR_CRATERS = createLunarCraters();

function generateSunTexture(): SurfaceTexture {
  const data = new Uint8ClampedArray(TEX_W * TEX_H * 4);
  for (let py = 0; py < TEX_H; py++) {
    const v = (py + 0.5) / TEX_H;
    const lat = (0.5 - v) * Math.PI;
    const cosLat = Math.cos(lat);
    const sinLat = Math.sin(lat);

    for (let px = 0; px < TEX_W; px++) {
      const u = (px + 0.5) / TEX_W;
      const lon = (u - 0.5) * Math.PI * 2;
      const sx = Math.sin(lon) * cosLat;
      const sy = sinLat;
      const sz = Math.cos(lon) * cosLat;

      const gran = fbm3D(sx * 7.5 + 3.1, sy * 7.5 - 1.4, sz * 7.5 + 2.2, 4);
      const fine = fbm3D(sx * 18.0 - 4.2, sy * 18.0 + 2.7, sz * 18.0 - 1.1, 3);
      const flare = fbm3D(sx * 3.4 + 8.3, sy * 3.4 + 5.1, sz * 3.4 - 6.2, 3);

      // Güneş lekeleri (koyu çekirdek + parlak kenar)
      const spotNoise = fbm3D(sx * 4.8 + 11.4, sy * 4.8 - 7.3, sz * 4.8 + 4.9, 3);
      const spotFactor =
        Math.abs(sinLat) < 0.55 && spotNoise < 0.26 ? (0.26 - spotNoise) / 0.26 : 0;

      let heat = gran * 0.55 + fine * 0.25 + flare * 0.2;
      heat = Math.min(1, Math.max(0, (heat - 0.25) * 1.65 - spotFactor * 0.72));

      let r: number;
      let g: number;
      let b: number;
      if (heat < 0.35) {
        const t = heat / 0.35;
        r = lerp(165, 234, t);
        g = lerp(42, 92, t);
        b = lerp(10, 14, t);
      } else if (heat < 0.72) {
        const t = (heat - 0.35) / 0.37;
        r = lerp(234, 253, t);
        g = lerp(92, 206, t);
        b = lerp(14, 52, t);
      } else {
        const t = (heat - 0.72) / 0.28;
        r = lerp(253, 255, t);
        g = lerp(206, 250, t);
        b = lerp(52, 205, t);
      }

      const idx = (py * TEX_W + px) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }
  return { width: TEX_W, height: TEX_H, data };
}

function generateEarthTexture(): SurfaceTexture {
  const data = new Uint8ClampedArray(TEX_W * TEX_H * 4);
  for (let py = 0; py < TEX_H; py++) {
    const v = (py + 0.5) / TEX_H;
    const lat = (0.5 - v) * Math.PI;
    const latDeg = (lat * 180) / Math.PI;
    const cosLat = Math.cos(lat);
    const sinLat = Math.sin(lat);

    for (let px = 0; px < TEX_W; px++) {
      const u = (px + 0.5) / TEX_W;
      const lon = (u - 0.5) * Math.PI * 2;
      const lonDeg = (lon * 180) / Math.PI;
      const sx = Math.sin(lon) * cosLat;
      const sy = sinLat;
      const sz = Math.cos(lon) * cosLat;

      let landScore = 0;
      for (const blob of EARTH_CONTINENT_BLOBS) {
        let dLon = lonDeg - blob.lonDeg;
        if (dLon > 180) dLon -= 360;
        if (dLon < -180) dLon += 360;
        const dLat = latDeg - blob.latDeg;
        const dist2 = (dLon / blob.rxDeg) ** 2 + (dLat / blob.ryDeg) ** 2;
        if (dist2 < 2.2) {
          landScore += blob.weight * Math.exp(-dist2 * 1.35);
        }
      }

      // Antarktika buz kıtası
      if (latDeg < -67) {
        landScore += (-67 - latDeg) / 14;
      }

      const coastNoise = fbm3D(sx * 4.5 + 1.2, sy * 4.5 - 2.1, sz * 4.5 + 3.4, 4);
      const detailNoise = fbm3D(sx * 11.5 - 3.7, sy * 11.5 + 1.9, sz * 11.5 - 2.3, 3);
      const elevation = landScore + (coastNoise - 0.48) * 0.72 + (detailNoise - 0.5) * 0.16;

      let r: number;
      let g: number;
      let b: number;

      const isPolarIce = Math.abs(latDeg) > 74 + (coastNoise - 0.5) * 9;

      if (isPolarIce) {
        r = 236;
        g = 244;
        b = 250;
      } else if (elevation < 0.44) {
        // Derin okyanustan sığ kıyı denizine geçiş
        const depthT = Math.max(0, Math.min(1, elevation / 0.44));
        const shelf = Math.pow(depthT, 2.2);
        r = lerp(10, 32, shelf);
        g = lerp(52, 146, shelf);
        b = lerp(128, 206, shelf);
      } else {
        // Karalar: yeşil ovalar, çöller, dağlık alanlar
        const arid = fbm3D(sx * 3.8 - 5.2, sy * 3.8 + 4.4, sz * 3.8 + 1.8, 3);
        const desertNorm = (Math.abs(latDeg) - 24) / 14;
        const desertBand = Math.exp(-(desertNorm * desertNorm));
        const aridity = Math.min(1, Math.max(0, desertBand * 0.78 + (arid - 0.42) * 0.9));
        const mountain = Math.min(1, Math.max(0, (elevation - 0.85) * 2.2));

        // Yeşil kara ile sıcak çöl rengi karışımı
        r = lerp(42, 198, aridity);
        g = lerp(126, 168, aridity);
        b = lerp(64, 108, aridity);

        // Yüksek dağ ve karlı zirveler
        if (mountain > 0) {
          r = lerp(r, 142, mountain);
          g = lerp(g, 124, mountain);
          b = lerp(b, 98, mountain);
        }
      }

      // İnce yarı saydam beyaz bulut şeritleri (kara ve deniz ayrımını kapatmadan)
      const cloudNoise = fbm3D(sx * 5.2 + 9.1, sy * 6.8 - 3.3, sz * 5.2 + 7.6, 4);
      const cloudAlpha = cloudNoise > 0.62 ? Math.min(0.52, (cloudNoise - 0.62) * 2.1) : 0;
      if (cloudAlpha > 0) {
        r = lerp(r, 250, cloudAlpha);
        g = lerp(g, 252, cloudAlpha);
        b = lerp(b, 255, cloudAlpha);
      }

      const idx = (py * TEX_W + px) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }
  return { width: TEX_W, height: TEX_H, data };
}

function generateMoonTexture(): SurfaceTexture {
  const data = new Uint8ClampedArray(TEX_W * TEX_H * 4);
  for (let py = 0; py < TEX_H; py++) {
    const v = (py + 0.5) / TEX_H;
    const lat = (0.5 - v) * Math.PI;
    const cosLat = Math.cos(lat);
    const sinLat = Math.sin(lat);

    for (let px = 0; px < TEX_W; px++) {
      const u = (px + 0.5) / TEX_W;
      const lon = (u - 0.5) * Math.PI * 2;
      const sx = Math.sin(lon) * cosLat;
      const sy = sinLat;
      const sz = Math.cos(lon) * cosLat;

      // Ay düzlükleri (koyu bazalt maria) ve açık renkli yaylalar
      const mariaNoise = fbm3D(sx * 2.3 + 4.1, sy * 2.3 - 1.8, sz * 2.3 + 0.9, 4);
      const microGrain = fbm3D(sx * 16.0 - 2.4, sy * 16.0 + 5.6, sz * 16.0 - 3.1, 3);

      let tone = 0.72 + (microGrain - 0.5) * 0.16;
      if (mariaNoise < 0.47) {
        const mariaBlend = smoothstep((0.47 - mariaNoise) / 0.25);
        tone -= Math.min(0.28, mariaBlend * 0.28);
      }

      // Krater oyukları, yükseltilmiş parlak kenarlar ve gölgeli iç çeperler
      for (let c = 0; c < LUNAR_CRATERS.length; c++) {
        const crater = LUNAR_CRATERS[c];
        const dx = sx - crater.x;
        const dy = sy - crater.y;
        const dz = sz - crater.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist > crater.radius * 1.9) continue;

        const norm = dist / crater.radius;
        if (norm < 1.0) {
          // Krater çukuru içi + yönlü güneş ışığı kabartması (sol-üstten ışık)
          const bowl = (1 - norm * norm) * 0.16 * crater.depth;
          const rimDirectional = (dx * 0.65 - dy * 0.65) / Math.max(0.01, crater.radius);
          tone -= bowl;
          tone += rimDirectional * 0.18 * crater.depth * (1 - norm * 0.4);
          // Büyük kraterlerde merkez tepecik
          if (crater.radius > 0.15 && norm < 0.16) {
            tone += (1 - norm / 0.16) * 0.14;
          }
        } else if (norm < 1.28) {
          // Parlak yükseltilmiş krater kenarı
          const rimT = 1 - Math.abs(norm - 1.1) / 0.18;
          if (rimT > 0) {
            tone += rimT * 0.16 * crater.depth;
          }
        } else if (crater.hasRays && norm < 1.85) {
          const rayFade = 1 - (norm - 1.28) / 0.57;
          const rayWave = 0.5 + 0.5 * Math.sin(Math.atan2(dy, dx) * 9 + c * 1.7);
          tone += rayFade * rayWave * 0.08;
        }
      }

      const clamped = Math.min(0.95, Math.max(0.24, tone));
      const r = clamped * 230;
      const g = clamped * 233;
      const b = clamped * 240;

      const idx = (py * TEX_W + px) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }
  return { width: TEX_W, height: TEX_H, data };
}

function getSurfaceTexture(bodyId: CelestialBodyId): SurfaceTexture {
  const existing = textureCache.get(bodyId);
  if (existing) return existing;
  const generated =
    bodyId === 'sun'
      ? generateSunTexture()
      : bodyId === 'earth'
        ? generateEarthTexture()
        : generateMoonTexture();
  textureCache.set(bodyId, generated);
  return generated;
}

const BACKGROUND_STARS = Array.from({ length: 46 }, (_, i) => ({
  x: ((i * 73 + 19) % 100) / 100,
  y: ((i * 41 + 31) % 100) / 100,
  r: 0.7 + ((i * 17) % 10) * 0.11,
  a: 0.35 + ((i * 29) % 10) * 0.06,
}));

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface SurfacePin {
  id: string;
  lonDeg: number;
  latDeg: number;
  label: string;
  color: string;
  showWhenBack?: boolean;
}

export interface SurfaceClickHit {
  lonDeg: number;
  latDeg: number;
  dotLight: number;
}

function normalizeVec3(v: Vec3): Vec3 {
  const len = Math.hypot(v.x, v.y, v.z);
  if (len < 1e-6) return { x: -1, y: 0, z: 0 };
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

export interface CelestialGlobeCanvasProps {
  bodyId: CelestialBodyId;
  size: number;
  displaySize?: number;
  rotY?: number;
  rotX?: number;
  zoom?: number;
  interactive?: boolean;
  showStarfield?: boolean;
  lightingMode?: 'museum' | 'directional';
  lightDirection?: Vec3;
  isLightOn?: boolean;
  showAxisLine?: boolean;
  surfacePins?: readonly SurfacePin[];
  onRotate?: (deltaY: number, deltaX: number) => void;
  onZoomWheel?: (deltaZoom: number) => void;
  onPinchZoom?: (scale: number) => void;
  onSurfaceClick?: (hit: SurfaceClickHit) => void;
  ariaLabel?: string;
  className?: string;
}

export function CelestialGlobeCanvas({
  bodyId,
  size,
  displaySize,
  rotY = 0,
  rotX = 0.12,
  zoom = 1,
  interactive = false,
  showStarfield = true,
  lightingMode = 'museum',
  lightDirection = { x: -1, y: 0, z: 0 },
  isLightOn = true,
  showAxisLine = false,
  surfacePins,
  onRotate,
  onZoomWheel,
  onPinchZoom,
  onSurfaceClick,
  ariaLabel,
  className = '',
}: CelestialGlobeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    moved: boolean;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    moved: false,
  });

  const lightDirX = lightDirection.x;
  const lightDirY = lightDirection.y;
  const lightDirZ = lightDirection.z;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = size;
    const h = size;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;

    ctx.clearRect(0, 0, w, h);

    // Arka plan derin uzay ve yıldızlar
    if (showStarfield) {
      const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.45, w * 0.08, w * 0.5, h * 0.5, w * 0.68);
      bgGrad.addColorStop(0, '#102247');
      bgGrad.addColorStop(0.65, '#08132b');
      bgGrad.addColorStop(1, '#040917');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      for (const star of BACKGROUND_STARS) {
        ctx.fillStyle = `rgba(255, 248, 224, ${star.a})`;
        ctx.beginPath();
        ctx.arc(star.x * w, star.y * h, star.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const cx = w / 2;
    const cy = h / 2;
    const baseRadius = showStarfield ? w * 0.34 : w * 0.44;
    const radius = Math.min(w * 0.485, baseRadius * zoom);

    // İsteğe bağlı dönme ekseni çizgisi (arka yarım çubuk)
    if (showAxisLine) {
      ctx.save();
      ctx.strokeStyle = 'rgba(246, 220, 155, 0.58)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, cy - radius * 1.24);
      ctx.lineTo(cx, cy + radius * 1.24);
      ctx.stroke();
      ctx.restore();
    }

    // Dış atmosfer veya Güneş tacı parıltısı
    if (bodyId === 'sun') {
      const corona = ctx.createRadialGradient(cx, cy, radius * 0.88, cx, cy, radius * 1.42);
      corona.addColorStop(0, 'rgba(255, 226, 118, 0.82)');
      corona.addColorStop(0.45, 'rgba(249, 115, 22, 0.34)');
      corona.addColorStop(1, 'rgba(249, 115, 22, 0)');
      ctx.fillStyle = corona;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.42, 0, Math.PI * 2);
      ctx.fill();
    } else if (bodyId === 'earth') {
      const haloAlpha = lightingMode === 'directional' && !isLightOn ? 0.14 : 0.48;
      const atmo = ctx.createRadialGradient(cx, cy, radius * 0.93, cx, cy, radius * 1.15);
      atmo.addColorStop(0, `rgba(96, 189, 255, ${haloAlpha})`);
      atmo.addColorStop(0.6, `rgba(56, 189, 248, ${haloAlpha * 0.3})`);
      atmo.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = atmo;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3B Küre Ortografik Doku Eşleme
    const tex = getSurfaceTexture(bodyId);
    const texData = tex.data;
    const texW = tex.width;
    const texH = tex.height;

    const minX = Math.max(0, Math.floor(cx - radius - 1));
    const maxX = Math.min(w - 1, Math.ceil(cx + radius + 1));
    const minY = Math.max(0, Math.floor(cy - radius - 1));
    const maxY = Math.min(h - 1, Math.ceil(cy + radius + 1));
    const boxW = maxX - minX + 1;
    const boxH = maxY - minY + 1;
    if (boxW <= 0 || boxH <= 0) return;

    const imgData = ctx.getImageData(minX, minY, boxW, boxH);
    const out = imgData.data;

    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);

    const normLight =
      lightingMode === 'directional'
        ? normalizeVec3({ x: lightDirX, y: lightDirY, z: lightDirZ })
        : { x: -0.34, y: -0.28, z: 0.898 };
    const lightX = normLight.x;
    const lightY = normLight.y;
    const lightZ = normLight.z;

    const invR = 1 / radius;
    const invTwoPi = 1 / (Math.PI * 2);
    const invPi = 1 / Math.PI;

    for (let y = minY; y <= maxY; y++) {
      const ny = (y - cy) * invR;
      const ny2 = ny * ny;
      const rowOffset = (y - minY) * boxW;

      for (let x = minX; x <= maxX; x++) {
        const nx = (x - cx) * invR;
        const r2 = nx * nx + ny2;
        if (r2 > 1.0) continue;

        const nz = Math.sqrt(Math.max(0, 1 - r2));

        // Önce X (eğim), sonra Y (dönüş) rotasyonu
        const y1 = ny * cosX - nz * sinX;
        const z1 = ny * sinX + nz * cosX;
        const lx = nx * cosY + z1 * sinY;
        const lz = -nx * sinY + z1 * cosY;
        const ly = -y1;

        const u = Math.atan2(lx, lz) * invTwoPi + 0.5;
        const v = 0.5 - Math.asin(Math.max(-1, Math.min(1, ly))) * invPi;

        const tx = Math.min(texW - 1, Math.max(0, Math.floor(u * texW)));
        const ty = Math.min(texH - 1, Math.max(0, Math.floor(v * texH)));
        const tIdx = (ty * texW + tx) * 4;

        let r = texData[tIdx];
        let g = texData[tIdx + 1];
        let b = texData[tIdx + 2];

        if (bodyId === 'sun') {
          // Yıldız kenar kararması (limb darkening) — kendi ışığını yayan sıcak küre hacmi
          const limb = 0.62 + 0.38 * Math.pow(nz, 0.55);
          r = Math.min(255, r * limb + 10);
          g = Math.min(255, g * limb);
          b = Math.min(255, b * limb);
        } else if (lightingMode === 'directional') {
          const rawDot = nx * lightX + ny * lightY + nz * lightZ;
          if (!isLightOn) {
            const dim = 0.25 + 0.08 * nz;
            r = Math.min(255, r * dim);
            g = Math.min(255, g * dim + 4);
            b = Math.min(255, b * dim + 14);
          } else if (bodyId === 'earth') {
            const termT = Math.min(1, Math.max(0, (rawDot + 0.07) / 0.22));
            const dayFactor = smoothstep(termT);
            const litShade = 0.3 + 0.85 * Math.max(0, rawDot);
            const nightShade = 0.13;
            const shade = lerp(nightShade, litShade, dayFactor);
            const isLandPixel = g > b * 0.85 && r > 35;

            r = Math.min(255, r * shade);
            g = Math.min(255, g * shade + (1 - dayFactor) * 4);
            b = Math.min(255, b * shade + (1 - dayFactor) * 16);

            // Karanlık yarım kürede hafif gece yerleşim parıltısı
            if (dayFactor < 0.25 && isLandPixel) {
              const twinkle = ((tx * 37 + ty * 73) % 29 === 0) ? (1 - dayFactor * 4) : 0;
              if (twinkle > 0) {
                r = Math.min(255, r + 150 * twinkle);
                g = Math.min(255, g + 115 * twinkle);
                b = Math.min(255, b + 45 * twinkle);
              }
            }

            // İnce mavi atmosfer kenar parıltısı (aydınlık kenarda belirgin)
            const fresnel = Math.pow(1 - nz, 3.0) * (0.14 + 0.58 * dayFactor);
            r = Math.min(255, r + 64 * fresnel);
            g = Math.min(255, g + 168 * fresnel);
            b = Math.min(255, b + 255 * fresnel);
          } else {
            // Ay evreleri için keskin ve bilimsel aydınlanma sınırı (Dünya'dan görünüm)
            const termT = Math.min(1, Math.max(0, (rawDot + 0.035) / 0.13));
            const litFactor = smoothstep(termT);
            const litShade = 0.28 + 0.86 * Math.pow(Math.max(0, rawDot), 0.72);
            const earthshine = 0.09;
            const shade = lerp(earthshine, litShade, litFactor);
            r = Math.min(255, r * shade);
            g = Math.min(255, g * shade);
            b = Math.min(255, b * shade + (1 - litFactor) * 7);
          }
        } else {
          // Dengeli müze aydınlatması (Görev 02)
          const ndotl = Math.max(0, nx * lightX + ny * lightY + nz * lightZ);
          const shade = bodyId === 'earth' ? 0.42 + 0.64 * ndotl : 0.44 + 0.62 * ndotl;
          r = Math.min(255, r * shade);
          g = Math.min(255, g * shade);
          b = Math.min(255, b * shade);

          if (bodyId === 'earth') {
            const fresnel = Math.pow(1 - nz, 3.0) * 0.58;
            r = Math.min(255, r + 64 * fresnel);
            g = Math.min(255, g + 168 * fresnel);
            b = Math.min(255, b + 255 * fresnel);
          }
        }

        // Kenar yumuşatma (anti-aliasing)
        const distFromEdge = (1 - Math.sqrt(r2)) * radius;
        const edgeAlpha = distFromEdge < 1.2 ? Math.max(0, distFromEdge / 1.2) : 1;

        const oIdx = (rowOffset + (x - minX)) * 4;
        if (edgeAlpha >= 0.99) {
          out[oIdx] = r;
          out[oIdx + 1] = g;
          out[oIdx + 2] = b;
          out[oIdx + 3] = 255;
        } else {
          const invA = 1 - edgeAlpha;
          out[oIdx] = out[oIdx] * invA + r * edgeAlpha;
          out[oIdx + 1] = out[oIdx + 1] * invA + g * edgeAlpha;
          out[oIdx + 2] = out[oIdx + 2] * invA + b * edgeAlpha;
          out[oIdx + 3] = Math.min(255, out[oIdx + 3] + 255 * edgeAlpha);
        }
      }
    }

    ctx.putImageData(imgData, minX, minY);

    // Eksen kutup uç noktaları (isteğe bağlı)
    if (showAxisLine) {
      ctx.save();
      ctx.fillStyle = '#f6dc9b';
      ctx.beginPath();
      ctx.arc(cx, cy - radius * 1.24, 3.5, 0, Math.PI * 2);
      ctx.arc(cx, cy + radius * 1.24, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Yüzey işaretçileri (Türkiye, Aydınlık/Karanlık vb.)
    if (surfacePins && surfacePins.length > 0) {
      ctx.save();
      ctx.font = '700 11px system-ui, -apple-system, sans-serif';
      ctx.textBaseline = 'middle';

      for (const pin of surfacePins) {
        const proj = projectSurfacePoint(pin.lonDeg, pin.latDeg, rotY, rotX);
        const px = cx + proj.nx * radius;
        const py = cy + proj.ny * radius;
        const isFront = proj.nz > 0.02;

        if (!isFront && !pin.showWhenBack) continue;

        ctx.save();
        ctx.globalAlpha = isFront ? 1 : 0.45;

        // İşaretçi halkası ve merkezi
        ctx.beginPath();
        ctx.arc(px, py, isFront ? 7 : 5.5, 0, Math.PI * 2);
        ctx.fillStyle = isFront ? pin.color : 'rgba(15, 23, 42, 0.75)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = isFront ? '#ffffff' : pin.color;
        if (!isFront) ctx.setLineDash([2.5, 2]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Etiket kutusu (tuval sınırları içinde tut)
        const text = isFront ? pin.label : `${pin.label} (Arka)`;
        const textW = ctx.measureText(text).width;
        const padX = 7;
        const boxWLabel = textW + padX * 2;
        const boxHLabel = 20;
        let lxBox = px - boxWLabel / 2;
        let lyBox = py - 28;
        if (lyBox < 6) lyBox = py + 11;
        lxBox = Math.max(6, Math.min(w - boxWLabel - 6, lxBox));

        ctx.fillStyle = 'rgba(7, 17, 38, 0.9)';
        ctx.strokeStyle = pin.color;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.roundRect(lxBox, lyBox, boxWLabel, boxHLabel, 7);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fff9e8';
        ctx.textAlign = 'center';
        ctx.fillText(text, lxBox + boxWLabel / 2, lyBox + boxHLabel / 2 + 0.5);
        ctx.restore();
      }

      ctx.restore();
    }
  }, [
    bodyId,
    size,
    rotY,
    rotX,
    zoom,
    showStarfield,
    lightingMode,
    lightDirX,
    lightDirY,
    lightDirZ,
    isLightOn,
    showAxisLine,
    surfacePins,
  ]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!interactive && !onSurfaceClick && !onPinchZoom) return;
    const pointers = pointersRef.current;
    if (e.button !== 0 || pointers.size >= 2 || (pointers.size > 0 && (!onPinchZoom || e.pointerType !== 'touch'))) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      dragRef.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        lastX: e.clientX,
        lastY: e.clientY,
        moved: false,
      };
    } else {
      dragRef.current.active = false;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pointers = pointersRef.current;
    const previous = pointers.get(e.pointerId);
    if (!previous) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2 && onPinchZoom) {
      const other = [...pointers].find(([id]) => id !== e.pointerId)?.[1];
      if (!other) return;
      const before = Math.hypot(previous.x - other.x, previous.y - other.y);
      const after = Math.hypot(e.clientX - other.x, e.clientY - other.y);
      if (before >= 4 && after >= 4) onPinchZoom(after / before);
      return;
    }
    if (!dragRef.current.active) return;
    const totalMove = Math.hypot(
      e.clientX - dragRef.current.startX,
      e.clientY - dragRef.current.startY,
    );
    if (totalMove > 5) {
      dragRef.current.moved = true;
    }
    if (!interactive) return;
    const dx = e.clientX - dragRef.current.lastX;
    const dy = e.clientY - dragRef.current.lastY;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
    onRotate?.(dx * 0.012, dy * 0.01);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!pointersRef.current.delete(e.pointerId)) return;
    const wasClick = dragRef.current.active && !dragRef.current.moved;
    dragRef.current.active = false;

    if (wasClick && onSurfaceClick && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const sx = ((e.clientX - rect.left) / rect.width) * size;
      const sy = ((e.clientY - rect.top) / rect.height) * size;

      const cx = size / 2;
      const cy = size / 2;
      const baseRadius = showStarfield ? size * 0.34 : size * 0.44;
      const radius = Math.min(size * 0.485, baseRadius * zoom);

      const nx = (sx - cx) / radius;
      const ny = (sy - cy) / radius;
      const r2 = nx * nx + ny * ny;
      if (r2 > 1.0) return;

      const nz = Math.sqrt(Math.max(0, 1 - r2));
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      const y1 = ny * cosX - nz * sinX;
      const z1 = ny * sinX + nz * cosX;
      const lx = nx * cosY + z1 * sinY;
      const lz = -nx * sinY + z1 * cosY;
      const ly = -y1;

      const lonDeg = (Math.atan2(lx, lz) * 180) / Math.PI;
      const latDeg = (Math.asin(Math.max(-1, Math.min(1, ly))) * 180) / Math.PI;

      const normLight =
        lightingMode === 'directional'
          ? normalizeVec3({ x: lightDirX, y: lightDirY, z: lightDirZ })
          : { x: -0.34, y: -0.28, z: 0.898 };
      const dotLight = nx * normLight.x + ny * normLight.y + nz * normLight.z;

      onSurfaceClick({ lonDeg, latDeg, dotLight });
    }
  };

  const cancelPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (pointersRef.current.delete(e.pointerId)) dragRef.current.active = false;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !onZoomWheel) return;
    function handleWheel(event: WheelEvent) {
      event.preventDefault();
      if (event.deltaY !== 0) onZoomWheel?.(event.deltaY < 0 ? 0.15 : -0.15);
    }
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [onZoomWheel]);

  const pointerClass = interactive
    ? onSurfaceClick
      ? 'cursor-crosshair touch-none'
      : 'cursor-grab active:cursor-grabbing touch-none'
    : onSurfaceClick
      ? 'cursor-pointer'
      : onPinchZoom ? 'touch-none' : '';

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={displaySize === undefined ? undefined : { width: displaySize, height: displaySize }}
      role="img"
      aria-label={ariaLabel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={cancelPointer}
      onLostPointerCapture={cancelPointer}
      className={`${pointerClass} ${className}`}
    />
  );
}
