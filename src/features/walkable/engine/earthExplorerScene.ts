import { EARTH_LAYERS } from '@/src/data/earthExplorer';
import {
  earthLayerAxis, earthLayersGlsl, layerCenters, layerRadii, traceEarthLayers, type LayerHit,
} from './earthLayerGeometry';

export const TO_RADIANS = Math.PI / 180;

export type EarthPose = { rotX: number; rotY: number; zoom: number };
export type EarthPoint = { lonDeg: number; latDeg: number };
type EarthFrame = {
  width: number;
  height: number;
  pose: EarthPose;
  cutaway: boolean;
  separation: number;
  layer: number;
};

type Maps = { surface: HTMLImageElement; clouds: HTMLImageElement | null; night: HTMLImageElement | null };
type Renderer = { draw: (frame: EarthFrame) => void; dispose: () => void };

const light = [-0.82, 0.24, 0.58] as const;
const colors = EARTH_LAYERS.map(({ color }) => [1, 3, 5].map((start) => parseInt(color.slice(start, start + 2), 16) / 255));

export function earthRadius(width: number, height: number, zoom: number) {
  return Math.min(width, height) * 0.435 * zoom;
}

export function earthInteriorRadius(width: number, height: number, pose: EarthPose, separation: number) {
  const [ax, ay] = earthLayerAxis(pose.rotX, pose.rotY);
  const xExtent = 1 + layerCenters[0] * Math.abs(ax) * separation;
  const yExtent = 1 + layerCenters[0] * Math.abs(ay) * separation;
  return Math.min(width * 0.47 / xExtent, height * 0.44 / yExtent) * pose.zoom;
}

function getRotation({ rotX, rotY }: EarthPose): [number, number, number, number] {
  return [Math.cos(rotX), Math.sin(rotX), Math.cos(rotY), Math.sin(rotY)];
}

export function earthPointAt(x: number, y: number, pose: EarthPose): EarthPoint | null {
  const z2 = 1 - x * x - y * y;
  if (z2 < 0) return null;
  const [cx, sx, cy, sy] = getRotation(pose);
  const z = Math.sqrt(z2);
  const localY = y * cx + z * sx;
  const tiltedZ = z * cx - y * sx;
  return {
    lonDeg: Math.atan2(x * cy + tiltedZ * sy, tiltedZ * cy - x * sy) / TO_RADIANS,
    latDeg: Math.asin(Math.max(-1, Math.min(1, localY))) / TO_RADIANS,
  };
}

function loadMap(name: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = '/assets/walkable/earth/' + name + '.webp';
  });
}

export async function loadEarthMaps(): Promise<Maps | null> {
  const [surface, clouds, night] = await Promise.all([loadMap('surface'), loadMap('clouds'), loadMap('night')]);
  return surface ? { surface, clouds, night } : null;
}

const vertex = 'attribute vec2 a_point; void main() { gl_Position = vec4(a_point, 0.0, 1.0); }';

const fragment = [
  '#ifdef GL_FRAGMENT_PRECISION_HIGH',
  'precision highp float;',
  '#else',
  'precision mediump float;',
  '#endif',
  'uniform vec2 u_size;',
  'uniform float u_radius;',
  'uniform vec4 u_rotation;',
  'uniform sampler2D u_surface, u_clouds, u_night;',
  'uniform bool u_cutaway;',
  'uniform int u_selected;',
  'uniform vec3 u_light;',
  'vec3 modelPoint(vec3 point) {',
  '  float localY = point.y * u_rotation.x + point.z * u_rotation.y;',
  '  float tiltedZ = point.z * u_rotation.x - point.y * u_rotation.y;',
  '  return vec3(point.x * u_rotation.z + tiltedZ * u_rotation.w, localY, tiltedZ * u_rotation.z - point.x * u_rotation.w);',
  '}',
  'vec2 uvAt(vec3 point) {',
  '  vec3 local = modelPoint(point);',
  '  return vec2(atan(local.x, local.z) / 6.2831853 + 0.5, 0.5 - asin(clamp(local.y, -1.0, 1.0)) / 3.1415927);',
  '}',
  earthLayersGlsl,
  'void main() {',
  '  vec2 point = (gl_FragCoord.xy - 0.5 * u_size) / u_radius;',
  '  if (u_cutaway) { gl_FragColor = drawLayers(point); return; }',
  '  float distance = length(point);',
  '  if (distance > 1.07) discard;',
  '  vec3 light = normalize(u_light);',
  '  if (distance >= 1.0) {',
  '    float glow = exp(-60.0 * (distance - 1.0)) * (0.17 + 0.54 * max(dot(normalize(vec3(point, 0.0)), light), 0.0));',
  '    gl_FragColor = vec4(0.30, 0.68, 1.0, glow);',
  '    return;',
  '  }',

  '    vec3 normal = vec3(point, sqrt(max(0.0, 1.0 - dot(point, point))));',
  '    vec2 uv = uvAt(normal);',
  '    vec3 ground = texture2D(u_surface, uv).rgb;',
  '    vec2 cloudPoint = point / 1.014;',
  '    vec2 cloudUV = uvAt(vec3(cloudPoint, sqrt(1.0 - dot(cloudPoint, cloudPoint))));',
  '    float cloud = smoothstep(0.09, 0.93, texture2D(u_clouds, cloudUV).r);',
  '    float solar = dot(normal, light);',
  '    float day = smoothstep(-0.075, 0.11, solar);',
  '    vec3 lit = mix(ground, vec3(0.85, 0.90, 0.96), cloud * 0.70);',
  '    lit *= 0.43 + 0.62 * pow(max(0.0, solar), 0.62);',
  '    float lamps = pow(texture2D(u_night, uv).r, 1.5) * (1.0 - cloud * 0.60);',
  '    vec3 night = ground * vec3(0.09, 0.14, 0.25) + vec3(0.009, 0.016, 0.039) + lamps * vec3(0.92, 0.68, 0.27);',
  '    float atmosphere = pow(1.0 - normal.z, 4.0);',
  '    vec3 color = mix(night, lit, day) + atmosphere * vec3(0.08, 0.28, 0.48) * (0.12 + 0.72 * day);',
  '  gl_FragColor = vec4(color, smoothstep(0.0, 1.0, (1.0 - distance) * u_radius));',
  '}',
].join('\n');

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('WebGL shader');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(message ?? 'WebGL shader');
  }
  return shader;
}

function createTexture(gl: WebGLRenderingContext, image: HTMLImageElement | null, index: number) {
  const texture = gl.createTexture();
  if (!texture) throw new Error('WebGL texture');
  gl.activeTexture(gl.TEXTURE0 + index);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  if (image) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
  } else {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
    gl.generateMipmap(gl.TEXTURE_2D);
  }
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return texture;
}

function resizeCanvas(canvas: HTMLCanvasElement, width: number, height: number, scale: number) {
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
}

export function createWebGlEarth(canvas: HTMLCanvasElement, maps: Maps): Renderer | null {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false });
  if (!gl) return null;
  const program = gl.createProgram();
  if (!program) return null;
  const vertices = gl.createBuffer();
  const shaders: WebGLShader[] = [];
  const textures: WebGLTexture[] = [];
  const dispose = () => {
    textures.forEach((texture) => gl.deleteTexture(texture));
    shaders.forEach((shader) => gl.deleteShader(shader));
    gl.deleteBuffer(vertices);
    gl.deleteProgram(program);
  };

  try {
    shaders.push(compileShader(gl, gl.VERTEX_SHADER, vertex));
    shaders.push(compileShader(gl, gl.FRAGMENT_SHADER, fragment));
    shaders.forEach((shader) => gl.attachShader(program, shader));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('WebGL program');
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const point = gl.getAttribLocation(program, 'a_point');
    gl.enableVertexAttribArray(point);
    gl.vertexAttribPointer(point, 2, gl.FLOAT, false, 0, 0);

    const uniform = (name: string) => gl.getUniformLocation(program, 'u_' + name);
    [maps.surface, maps.clouds, maps.night].forEach((image, index) => {
      textures.push(createTexture(gl, image, index));
      gl.uniform1i(uniform(['surface', 'clouds', 'night'][index]), index);
    });
    gl.uniform3fv(uniform('light'), new Float32Array(light));
    gl.uniform4fv(uniform('layerCenters'), new Float32Array(layerCenters));
    gl.uniform4fv(uniform('layerRadii'), layerRadii);
    const size = uniform('size');
    const radius = uniform('radius');
    const rotation = uniform('rotation');
    const cutaway = uniform('cutaway');
    const selected = uniform('selected');
    const separation = uniform('separation');
    const axis = uniform('axis');

    return {
      draw: (frame) => {
        const scale = Math.min(window.devicePixelRatio || 1, frame.cutaway ? 1.55 : 1.8);
        resizeCanvas(canvas, frame.width, frame.height, scale);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(size, canvas.width, canvas.height);
        gl.uniform1f(radius, frame.cutaway
          ? earthInteriorRadius(canvas.width, canvas.height, frame.pose, frame.separation)
          : earthRadius(canvas.width, canvas.height, frame.pose.zoom));
        gl.uniform4fv(rotation, getRotation(frame.pose));
        gl.uniform1i(cutaway, Number(frame.cutaway));
        gl.uniform1i(selected, frame.layer);
        if (frame.cutaway) {
          gl.uniform1f(separation, frame.separation);
          gl.uniform3fv(axis, earthLayerAxis(frame.pose.rotX, frame.pose.rotY));
        }
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      },
      dispose,
    };
  } catch {
    dispose();
    return null;
  }
}

function pixelsFor(image: HTMLImageElement) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return context.getImageData(0, 0, canvas.width, canvas.height).data;
}

export function createCanvasEarth(canvas: HTMLCanvasElement, maps: Maps): Renderer | null {
  const context = canvas.getContext('2d');
  const surface = pixelsFor(maps.surface);
  if (!context || !surface) return null;
  const clouds = maps.clouds ? pixelsFor(maps.clouds) : null;
  const night = maps.night ? pixelsFor(maps.night) : null;
  let image: ImageData | null = null;
  const hit: LayerHit = { index: -1, depth: 0, localZ: 0, face: 'outer' };

  return {
    draw: ({ width, height, pose, cutaway, separation, layer }) => {
      resizeCanvas(canvas, width, height, Math.min(1, (cutaway ? 448 : 544) / Math.max(width, height)));
      const w = canvas.width;
      const h = canvas.height;
      if (!image || image.width !== w || image.height !== h) image = context.createImageData(w, h);
      const r = cutaway ? earthInteriorRadius(w, h, pose, separation) : earthRadius(w, h, pose.zoom);
      const axis = earthLayerAxis(pose.rotX, pose.rotY);
      const [cx, sx, cy, sy] = getRotation(pose);
      const out = image.data;
      out.fill(0);

      const extentX = r * (cutaway ? 1 + layerCenters[0] * Math.abs(axis[0]) * separation : 1);
      const extentY = r * (cutaway ? 1 + layerCenters[0] * Math.abs(axis[1]) * separation : 1);
      for (let py = Math.max(0, Math.floor(h / 2 - extentY)); py < Math.min(h, h / 2 + extentY); py++) {
        const y = (h / 2 - py - 0.5) / r;
        for (let px = Math.max(0, Math.floor(w / 2 - extentX)); px < Math.min(w, w / 2 + extentX); px++) {
          const x = (px + 0.5 - w / 2) / r;
          const d2 = x * x + y * y;
          const at = (py * w + px) * 4;
          if (cutaway) {
            traceEarthLayers(x, y, axis, separation, hit);
            if (hit.index === -1) continue;
            const offset = layerCenters[hit.index] * separation;
            const dx = x - axis[0] * offset;
            const dy = y - axis[1] * offset;
            const z = hit.localZ;
            const length = Math.hypot(dx, dy, z) || 1;
            const sign = hit.face === 'inner' ? -1 : 1;
            const incident = hit.face === 'rim'
              ? axis[0] * 0.5 - axis[1] * 0.62 - axis[2] * 0.66
              : (-dx * 0.5 + dy * 0.62 + z * 0.66) * sign / length;
            const shade = 0.52 + 0.53 * Math.max(0, incident) + (hit.index === layer ? 0.17 : 0);
            const localY = dy * cx + z * sx;
            const tiltedZ = z * cx - dy * sx;
            const lx = dx * cy + tiltedZ * sy;
            const lz = tiltedZ * cy - dx * sy;
            if (hit.index === 0 && hit.face === 'outer') {
              const u = Math.atan2(lx, lz) / (2 * Math.PI) + 0.5;
              const v = 0.5 - Math.asin(Math.max(-1, Math.min(1, localY / length))) / Math.PI;
              const texture = (Math.min(511, Math.floor(v * 512)) * 1024 + (Math.floor(u * 1024) % 1024)) * 4;
              const cloud = (clouds?.[texture] ?? 0) * 0.0024;
              for (let c = 0; c < 3; c++) out[at + c] = (surface[texture + c] * (1 - cloud) + 228 * cloud) * shade;
            } else {
              const band = 0.12 * Math.sin(24 * localY + 4 * Math.sin(19 * lx)) + 0.11 * Math.sin(70 * lz + 15 * lx);
              for (let c = 0; c < 3; c++) out[at + c] = 255 * colors[hit.index][c] * (shade + band);
            }
            out[at + 3] = 255;
            continue;
          }

          if (d2 >= 1) continue;
          {
            const z = Math.sqrt(1 - d2);
            const localY = y * cx + z * sx;
            const tiltedZ = z * cx - y * sx;
            const u = Math.atan2(x * cy + tiltedZ * sy, tiltedZ * cy - x * sy) / (2 * Math.PI) + 0.5;
            const v = 0.5 - Math.asin(Math.max(-1, Math.min(1, localY))) / Math.PI;
            const texture = (Math.min(511, Math.floor(v * 512)) * 1024 + (Math.floor(u * 1024) % 1024)) * 4;
            const solar = x * light[0] + y * light[1] + z * light[2];
            const day = Math.min(1, Math.max(0, (solar + 0.075) / 0.185));
            const cloud = (clouds?.[texture] ?? 0) * 0.0025;
            const lamps = (night?.[texture] ?? 0) ** 1.5 / 16;
            const illumination = 0.43 + 0.62 * Math.max(0, solar) ** 0.62;
            for (let c = 0; c < 3; c++) {
              const ground = surface[texture + c];
              const lit = (ground * (1 - cloud) + 225 * cloud) * illumination;
              const dark = ground * (0.09 + c * 0.07) + lamps * (0.9 - c * 0.32) * (1 - cloud * 0.6) + c * 4;
              out[at + c] = lit * day + dark * (1 - day);
            }
          }
          out[at + 3] = Math.min(255, 255 * (1 - Math.sqrt(d2)) * r);
        }
      }
      context.putImageData(image, 0, 0);
    },
    dispose: () => { image = null; },
  };
}
