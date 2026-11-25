export type SunPose = { yaw: number; pitch: number; zoom: number; offsetX: number; offsetY: number };
type SunFrame = SunPose & { width: number; height: number; time: number };
export type SunRenderer = { draw: (frame: SunFrame) => void; dispose: () => void };
type Vector = readonly [number, number, number];

const vertexSource = 'attribute vec2 a_position; void main() { gl_Position = vec4(a_position, 0.0, 1.0); }';
const fragmentSource = [
  '#ifdef GL_FRAGMENT_PRECISION_HIGH',
  'precision highp float;',
  '#else',
  'precision mediump float;',
  '#endif',
  'uniform vec2 u_center;',
  'uniform vec4 u_rotation;',
  'uniform float u_radius, u_time;',
  'float hash(vec3 p) {',
  '  p = fract(p * 0.1031);',
  '  p += dot(p, p.yzx + 33.33);',
  '  return fract((p.x + p.y) * p.z);',
  '}',
  'float noise(vec3 p) {',
  '  vec3 i = floor(p);',
  '  vec3 f = fract(p);',
  '  f = f*f*(3.0-2.0*f);',
  '  vec2 low = vec2(mix(hash(i), hash(i+vec3(1,0,0)), f.x), mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x));',
  '  i.z += 1.0;',
  '  vec2 high = vec2(mix(hash(i), hash(i+vec3(1,0,0)), f.x), mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x));',
  '  return mix(mix(low.x,low.y,f.y), mix(high.x,high.y,f.y), f.z);',
  '}',
  'vec3 solarPoint(vec3 view) {',
  '  float y = view.y*u_rotation.x + view.z*u_rotation.y;',
  '  float z = view.z*u_rotation.x - view.y*u_rotation.y;',
  '  return vec3(view.x*u_rotation.z + z*u_rotation.w, y, z*u_rotation.z - view.x*u_rotation.w);',
  '}',
  'vec3 photosphere(vec3 position, float facing) {',
  '  vec3 p = position;',
  '  float large = noise(p*6.3 + vec3(3.1, -4.8, 1.1));',
  '  float streams = noise(p*17.0 + vec3(0.0, 0.0, u_time*0.055));',
  '  vec3 flow = p + 0.046*vec3(large-0.5, streams-0.5, noise(p*9.0+4.2)-0.5);',
  '  float medium = noise(flow*57.0 + vec3(u_time*0.17, -u_time*0.073, 1.3));',
  '  float fine = noise(flow*131.0 + vec3(2.4, u_time*0.21, -u_time*0.13));',
  '  float cells = mix(medium, fine, smoothstep(75.0, 290.0, u_radius)*0.62);',
  '  float lanes = smoothstep(0.28, 0.67, cells);',
  '  float sharpness = smoothstep(166.0, 435.0, u_radius);',
  '  float heat = lanes*0.57 + streams*0.22 + large*0.21;',
  '  if (sharpness > 0.0) {',
  '    float threads = noise(flow*239.0 + vec3(u_time*0.24, 3.8, -u_time*0.11));',
  '    heat += (threads-0.5)*0.21*sharpness;',
  '  }',
  '  float belt = 1.0 - smoothstep(0.28, 0.76, abs(p.y));',
  '  float active = smoothstep(0.47, 0.83, large*0.74 + streams*0.26) * belt;',
  '  float kernels = smoothstep(0.48, 0.78, cells + 0.20*active);',
  '  float filament = (1.0-smoothstep(0.04,0.12,abs(streams-0.56))) * smoothstep(0.49,0.76,large);',
  '  vec3 copper = vec3(0.83, 0.24, 0.027);',
  '  vec3 amber = vec3(1.0, 0.68, 0.17);',
  '  vec3 color = mix(copper, amber, clamp(0.13 + heat*1.26, 0.0, 1.0));',
  '  color = mix(color, vec3(1.0,0.92,0.61), clamp(active*0.49+kernels*0.23+filament*0.11,0.0,0.79));',
  '  float pores = smoothstep(0.64,0.86,noise(flow*31.0+5.1)) * (1.0-smoothstep(0.22,0.43,medium)) * (0.6-belt*0.26);',
  '  color *= (0.73+0.27*pow(facing,0.32)) * (1.0 - 0.38*pores);',
  '  float rim = pow(1.0-facing, 3.6);',
  '  return color + rim*vec3(0.16,0.087,0.015);',
  '}',
  'void main() {',
  '  vec2 point = (gl_FragCoord.xy - u_center) / u_radius;',
  '  float d = length(point);',
  '  if (d > 1.42) discard;',
  '  if (d <= 1.0) {',
  '    float facing = sqrt(max(0.0, 1.0-dot(point,point)));',
  '    vec3 color = photosphere(solarPoint(vec3(point,facing)),facing);',
  '    gl_FragColor = vec4(color,1.0);',
  '    return;',
  '  }',
  '  float h = d-1.0;',
  '  vec3 limb = solarPoint(vec3(point/d,0.0));',
  '  float flow = noise(limb*13.0 + vec3(0.0,u_time*0.11,0.3));',
  '  float stream = noise(limb*38.0 + vec3(u_time*0.085,0.0,h*6.0));',
  '  float tongue = pow(max(0.0,flow*0.54+stream*0.46),3.1);',
  '  float hotRim = exp(-71.0*h);',
  '  float glow = exp(-13.0*h) * (0.40+0.22*flow);',
  '  float filament = exp(-20.0*h) * tongue * 0.62;',
  '  float edge = smoothstep(0.25,0.42,h);',
  '  gl_FragColor = vec4(1.0, 0.38+0.42*hotRim+flow*0.06, 0.04+0.24*hotRim, min(1.0,(glow+filament+hotRim*0.38)*(1.0-edge)));',
  '}',
].join('\n');

function rotation({ pitch, yaw }: SunPose): [number, number, number, number] {
  return [Math.cos(pitch), Math.sin(pitch), Math.cos(yaw), Math.sin(yaw)];
}

function diskRadius(width: number, height: number, zoom: number) {
  return Math.min(width, height) * 0.406 * zoom;
}

function diskCenter(width: number, height: number, pose: SunPose) {
  const unit = Math.min(width, height);
  return { x: width / 2 + pose.offsetX * unit, y: height / 2 + pose.offsetY * unit };
}

function resizeCanvas(canvas: HTMLCanvasElement, width: number, height: number, scale: number) {
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
}

export function createWebGlSun(canvas: HTMLCanvasElement): SunRenderer | null {
  const gl = canvas.getContext('webgl', {
    alpha: true, antialias: false, premultipliedAlpha: false,
  });
  if (!gl) return null;
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  const dispose = () => {
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
  };
  if (!vertex || !fragment || !program || !buffer) {
    dispose();
    return null;
  }

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    dispose();
    return null;
  }
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const center = gl.getUniformLocation(program, 'u_center');
  const spin = gl.getUniformLocation(program, 'u_rotation');
  const radius = gl.getUniformLocation(program, 'u_radius');
  const time = gl.getUniformLocation(program, 'u_time');

  return {
    draw: (frame) => {
      const scale = Math.min(window.devicePixelRatio || 1, 1.65, 2050 / Math.max(frame.width, frame.height));
      resizeCanvas(canvas, frame.width, frame.height, scale);
      gl.viewport(0, 0, canvas.width, canvas.height);
      const origin = diskCenter(canvas.width, canvas.height, frame);
      gl.uniform2f(center, origin.x, origin.y);
      gl.uniform4fv(spin, rotation(frame));
      gl.uniform1f(radius, diskRadius(canvas.width, canvas.height, frame.zoom));
      gl.uniform1f(time, frame.time);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose,
  };
}

// A sampled surface keeps rotation and zoom available when WebGL is unavailable.
const mapWidth = 1024;
const mapHeight = 512;
let cachedMap: Uint8ClampedArray | null = null;

function lattice(x: number, y: number, salt: number) {
  const n = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(salt, 69069);
  return ((Math.imul(n ^ (n >>> 13), 1274126177) >>> 8) & 0xffffff) / 0xffffff;
}

function mapNoise(u: number, v: number, cells: number, salt: number) {
  const x = u * cells * 2;
  const y = v * cells;
  const i = Math.floor(x);
  const j = Math.floor(y);
  const dx = x - i;
  const dy = y - j;
  const s = dx * dx * (3 - 2 * dx);
  const t = dy * dy * (3 - 2 * dy);
  const column = i % (cells * 2);
  const next = (i + 1) % (cells * 2);
  const low = lattice(column, j, salt) * (1 - s) + lattice(next, j, salt) * s;
  const high = lattice(column, j + 1, salt) * (1 - s) + lattice(next, j + 1, salt) * s;
  return low * (1 - t) + high * t;
}

function sunlightMap() {
  if (cachedMap) return cachedMap;
  const data = new Uint8ClampedArray(mapWidth * mapHeight * 3);
  for (let y = 0; y < mapHeight; y++) {
    const v = y / mapHeight;
    const belt = 1 - Math.min(1, Math.abs(v - 0.5) * 2.7);
    for (let x = 0; x < mapWidth; x++) {
      const u = x / mapWidth;
      const broad = mapNoise(u, v, 11, 2);
      const cell = mapNoise(u, v, 97, 11);
      const mid = mapNoise(u, v, 40, 6);
      const flare = Math.max(0, broad * 0.7 + mid * 0.3 - 0.52) * 2.7 * belt;
      const texture = broad * 0.25 + mid * 0.37 + cell * 0.38;
      const index = (y * mapWidth + x) * 3;
      data[index] = 208 + 58 * texture;
      data[index + 1] = 69 + 146 * texture + 75 * flare;
      data[index + 2] = 15 + 56 * texture + 100 * flare;
    }
  }
  cachedMap = data;
  return data;
}

export function createCanvasSun(canvas: HTMLCanvasElement): SunRenderer | null {
  const context = canvas.getContext('2d');
  if (!context) return null;
  const map = sunlightMap();
  let image: ImageData | null = null;
  return {
    draw: (frame) => {
      resizeCanvas(canvas, frame.width, frame.height, Math.min(1, 480 / Math.max(frame.width, frame.height)));
      const w = canvas.width;
      const h = canvas.height;
      if (!image || image.width !== w || image.height !== h) image = context.createImageData(w, h);
      const pixels = image.data;
      pixels.fill(0);
      const r = diskRadius(w, h, frame.zoom);
      const center = diskCenter(w, h, frame);
      const centerY = h - center.y;
      const extent = r * 1.4;
      const [cp, sp, cy, sy] = rotation(frame);
      for (let y = Math.max(0, Math.floor(centerY - extent)); y < Math.min(h, centerY + extent); y++) {
        const ny = (centerY - y - 0.5) / r;
        for (let x = Math.max(0, Math.floor(center.x - extent)); x < Math.min(w, center.x + extent); x++) {
          const nx = (x + 0.5 - center.x) / r;
          const d2 = nx * nx + ny * ny;
          if (d2 > 1.96) continue;
          const idx = (y * w + x) * 4;
          if (d2 > 1) {
            const altitude = Math.sqrt(d2) - 1;
            const ray = 0.83 + 0.17 * Math.sin(Math.atan2(ny, nx) * 17 + frame.time * 0.15);
            pixels[idx] = 255;
            pixels[idx + 1] = 107 + 94 * Math.exp(-39 * altitude);
            pixels[idx + 2] = 21;
            pixels[idx + 3] = 203 * Math.exp(-15 * altitude) * ray;
            continue;
          }
          const z = Math.sqrt(1 - d2);
          const localY = ny * cp + z * sp;
          const localZ = z * cp - ny * sp;
          const lon = Math.atan2(nx * cy + localZ * sy, localZ * cy - nx * sy);
          const u = lon / (2 * Math.PI) + 0.5 + frame.time * 0.00045;
          const v = 0.5 - Math.asin(Math.max(-1, Math.min(1, localY))) / Math.PI;
          const tx = Math.floor((u - Math.floor(u)) * mapWidth);
          const ty = Math.min(mapHeight - 1, Math.floor(v * mapHeight));
          const sample = (ty * mapWidth + tx) * 3;
          const glow = (1 - z) ** 3;
          const pulse = Math.sin(lon * 18 + localY * 31 + frame.time * 0.31) * 0.025;
          const light = 0.76 + z * 0.24 + pulse;
          pixels[idx] = map[sample] * light + 35 * glow;
          pixels[idx + 1] = map[sample + 1] * light + 24 * glow;
          pixels[idx + 2] = map[sample + 2] * light + 7 * glow;
          pixels[idx + 3] = 255;
        }
      }
      context.putImageData(image, 0, 0);
    },
    dispose: () => { image = null; },
  };
}

const prominences = [
  [0.87, -0.24, 0.10, 0.086, 0.23],
  [-1.43, 0.24, 0.072, 0.067, -0.94],
  [1.76, 0.32, 0.083, 0.077, 0.84],
  [-2.21, -0.15, 0.102, 0.071, -0.28],
  [2.65, -0.36, 0.067, 0.066, 0.95],
  [0.47, 0.60, 0.052, 0.064, 0.53],
  [-0.84, -0.56, 0.062, 0.069, 0.02],
  [3.01, 0.21, 0.094, 0.089, -0.71],
  [-2.93, 0.49, 0.056, 0.061, 0.56],
  [1.41, -0.57, 0.057, 0.064, -0.31],
].map(([lon, lat, halfWidth, height, angle]) => {
  const c = Math.cos(lat);
  const base: Vector = [Math.sin(lon) * c, Math.sin(lat), Math.cos(lon) * c];
  const east: Vector = [Math.cos(lon), 0, -Math.sin(lon)];
  const north: Vector = [-Math.sin(lon) * Math.sin(lat), c, -Math.cos(lon) * Math.sin(lat)];
  const tangent: Vector = [
    east[0] * Math.cos(angle) + north[0] * Math.sin(angle),
    north[1] * Math.sin(angle),
    east[2] * Math.cos(angle) + north[2] * Math.sin(angle),
  ];
  return { base, tangent, halfWidth, height };
});

export function createSunProminences(canvas: HTMLCanvasElement): SunRenderer | null {
  const context = canvas.getContext('2d');
  if (!context) return null;
  return {
    draw: (frame) => {
      resizeCanvas(canvas, frame.width, frame.height, Math.min(window.devicePixelRatio || 1, 1.5));
      const w = canvas.width;
      const h = canvas.height;
      const r = diskRadius(w, h, frame.zoom);
      const center = diskCenter(w, h, frame);
      const [cp, sp, cy, sy] = rotation(frame);
      context.clearRect(0, 0, w, h);
      context.lineCap = 'round';

      prominences.forEach(({ base, tangent, halfWidth, height }, index) => {
        const baseDepth = base[1] * sp + (base[0] * sy + base[2] * cy) * cp;
        if (Math.abs(baseDepth) > 0.53) return;
        const strength = 1 - Math.abs(baseDepth) / 0.56;
        for (let strand = 0; strand < 3; strand++) {
          let lastVisible = false;
          context.beginPath();
          for (let step = 0; step <= 22; step++) {
            const t = step / 22;
            const bend = (t * 2 - 1) * (halfWidth + strand * 0.012);
            const wave = Math.sin(frame.time * 0.52 + t * 4.2 + index) * 0.009;
            const altitude = 1 + (height + wave - strand * 0.015) * Math.sin(Math.PI * t) ** 1.13;
            const aim = Math.cos(bend) * altitude;
            const sweep = Math.sin(bend) * altitude;
            const lx = base[0] * aim + tangent[0] * sweep;
            const ly = base[1] * aim + tangent[1] * sweep;
            const lz = base[2] * aim + tangent[2] * sweep;
            const z = lx * sy + lz * cy;
            const x = lx * cy - lz * sy;
            const y = ly * cp - z * sp;
            const depth = ly * sp + z * cp;
            const visible = depth >= 0 || x * x + y * y >= 1;
            if (visible) {
              const px = center.x + x * r;
              const py = h - center.y - y * r;
              if (lastVisible) context.lineTo(px, py);
              else context.moveTo(px, py);
            }
            lastVisible = visible;
          }
          context.shadowColor = '#ff751c';
          context.shadowBlur = Math.max(2, r * 0.016);
          context.strokeStyle = '#ff8b27';
          context.lineWidth = Math.max(1, r * 0.0075);
          context.globalAlpha = strength * 0.50;
          context.stroke();
          context.shadowBlur = 0;
          context.strokeStyle = '#ffe7ac';
          context.lineWidth = Math.max(0.65, r * 0.0022);
          context.globalAlpha = strength * 0.62;
          context.stroke();
        }
      });
      context.globalAlpha = 1;
    },
    dispose: () => {},
  };
}
