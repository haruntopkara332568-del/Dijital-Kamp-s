type Vector = readonly [number, number, number];

export interface MoonSceneBody {
  kind: 'moon' | 'earth' | 'sun';
  x: number;
  y: number;
  radius: number;
  yaw?: number;
  pitch?: number;
  light: Vector;
  ambient: number;
}

export interface MoonScene {
  draw: (width: number, height: number, bodies: readonly MoonSceneBody[]) => void;
  dispose: () => void;
}

const ASSETS = {
  surface: '/assets/walkable/moon/surface.webp',
  elevation: '/assets/walkable/moon/elevation.webp',
  earth: '/assets/walkable/earth/surface.webp',
} as const;

function loadImage(path: string) {
  const image = new Image();
  image.src = path;
  return image.decode().then(() => image);
}

type Textures = Awaited<ReturnType<typeof loadTextures>>;
function loadTextures() {
  return Promise.all([loadImage(ASSETS.surface), loadImage(ASSETS.elevation), loadImage(ASSETS.earth).catch(() => null)]);
}

let textureRequest: ReturnType<typeof loadTextures> | undefined;

export function getMoonSceneTextures() {
  textureRequest ??= loadTextures().catch((error: unknown) => {
    textureRequest = undefined;
    throw error;
  });
  return textureRequest;
}

function rotation(yaw = 0, pitch = 0): [number, number, number, number] {
  return [Math.cos(yaw), Math.sin(yaw), Math.cos(pitch), Math.sin(pitch)];
}

export function projectMoonPlace(longitude: number, latitude: number, yaw: number, pitch: number) {
  const lon = longitude * Math.PI / 180;
  const lat = latitude * Math.PI / 180;
  const [cy, sy, cp, sp] = rotation(yaw, pitch);
  const localX = Math.sin(lon) * Math.cos(lat);
  const localY = Math.sin(lat);
  const localZ = Math.cos(lon) * Math.cos(lat);
  const tiltedZ = sy * localX + cy * localZ;
  return {
    x: cy * localX - sy * localZ,
    y: -(cp * localY - sp * tiltedZ),
    depth: sp * localY + cp * tiltedZ,
  };
}

const VERTEX_SOURCE = `
attribute vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
`;

const FRAGMENT_SOURCE = `
precision highp float;

uniform sampler2D uMoon;
uniform sampler2D uElevation;
uniform sampler2D uEarth;
uniform vec3 uDisc;
uniform vec3 uLight;
uniform vec4 uRotation;
uniform float uAmbient;
uniform int uKind;
uniform bool uHasEarth;

const float PI = 3.14159265359;

vec3 toLocal(vec3 v) {
  float z = v.z * uRotation.z - v.y * uRotation.w;
  return vec3(
    v.x * uRotation.x + z * uRotation.y,
    v.y * uRotation.z + v.z * uRotation.w,
    z * uRotation.x - v.x * uRotation.y
  );
}

vec2 surfaceUV(vec3 n) {
  return vec2(atan(n.x, n.z) / (2.0 * PI) + 0.5, 0.5 - asin(clamp(n.y, -1.0, 1.0)) / PI);
}

float elevation(vec2 uv) {
  vec2 encodedHeight = texture2D(uElevation, uv).rg;
  return (dot(encodedHeight, vec2(65280.0, 255.0)) - 20000.0) * 0.0005;
}

void main() {
  vec2 xy = (gl_FragCoord.xy - uDisc.xy) / uDisc.z;
  float distanceSquared = dot(xy, xy);
  if (uKind == 2 && distanceSquared > 1.0) {
    float halo = exp(-13.0 * (sqrt(distanceSquared) - 1.0));
    gl_FragColor = vec4(1.0, 0.52, 0.12, halo * 0.58);
    return;
  }
  if (distanceSquared >= 1.0) discard;

  float z = sqrt(1.0 - distanceSquared);
  vec3 n = toLocal(vec3(xy, z));
  vec2 uv = surfaceUV(n);
  vec3 localLight = toLocal(uLight);

  if (uKind == 2) {
    float granulation = 0.5 + 0.22 * sin(n.x * 48.0 + 4.0 * sin(n.y * 24.0)) *
                    sin(n.y * 66.0 + n.z * 28.0) + 0.1 * sin(n.z * 121.0 + n.y * 65.0);
    vec3 color = mix(vec3(1.0, 0.38, 0.06), vec3(1.0, 0.95, 0.62), z * 0.36 + granulation * 0.63);
    gl_FragColor = vec4(color, 1.0);
    return;
  }

  float incidence = dot(n, localLight);
  float daylight = smoothstep(-0.012, 0.028, incidence);
  float diffuse = max(0.0, incidence);
  vec3 color;
  if (uKind == 0) {
    if (z > 0.22) {
      // Parallax from LOLA elevation. The smooth sphere keeps the phase silhouette clean.
      float dr = elevation(uv) * (2.0 / 1737.4);
      float displacedZ = sqrt(max(0.0, (1.0 + dr) * (1.0 + dr) - distanceSquared));
      n = toLocal(normalize(vec3(xy, mix(z, displacedZ, smoothstep(0.22, 0.45, z)))));
      uv = surfaceUV(n);
    }
    float stepUV = max(1.0 / 1024.0, 0.17 / uDisc.z);
    float eastSlope = elevation(uv + vec2(stepUV, 0.0)) - elevation(uv - vec2(stepUV, 0.0));
    float northSlope = elevation(uv - vec2(0.0, stepUV)) - elevation(uv + vec2(0.0, stepUV));
    float latitudeScale = max(0.12, length(n.xz));
    vec3 east = vec3(n.z, 0.0, -n.x) / max(0.0001, length(n.xz));
    vec3 north = cross(n, east);
    float relief = 2.7 / (1737.4 * 2.0 * PI * stepUV);
    vec3 terrainNormal = normalize(n - east * clamp(eastSlope * relief / (2.0 * latitudeScale), -0.85, 0.85)
                                     - north * clamp(northSlope * relief, -0.85, 0.85));
    float terrainLight = max(0.0, dot(terrainNormal, localLight));
    float brightness = uAmbient + daylight * (0.16 + 1.12 * pow(mix(diffuse, terrainLight, 0.65), 0.58));
    color = pow(texture2D(uMoon, uv).rgb, vec3(0.86)) * brightness;
  } else {
    vec3 earth = uHasEarth ? texture2D(uEarth, uv).rgb : vec3(0.12, 0.4, 0.68);
    color = earth * (uAmbient + daylight * (0.18 + 0.96 * pow(diffuse, 0.55)));
    color += vec3(0.10, 0.24, 0.42) * pow(1.0 - z, 5.0) * (0.16 + diffuse);
  }

  float alpha = clamp((1.0 - sqrt(distanceSquared)) * uDisc.z, 0.0, 1.0);
  gl_FragColor = vec4(color, alpha);
}
`;

function createShader(gl: WebGLRenderingContext, kind: number, source: string) {
  const shader = gl.createShader(kind);
  if (!shader) throw new Error('Ay çizim programı oluşturulamadı.');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(message ?? 'Ay çizim programı derlenemedi.');
  }
  return shader;
}

function createWebGLMoonScene(canvas: HTMLCanvasElement, gl: WebGLRenderingContext, images: Textures, textureLimit: number): MoonScene {
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  if (!program || !buffer) throw new Error('Ay çizim alanı oluşturulamadı.');

  const vertex = createShader(gl, gl.VERTEX_SHADER, VERTEX_SOURCE);
  const fragment = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SOURCE);
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? 'Ay çizim programı bağlanamadı.');
  }

  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'aPosition');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
  gl.clearColor(0, 0, 0, 0);

  const uniform = (name: string) => gl.getUniformLocation(program, name);
  const disc = uniform('uDisc');
  const light = uniform('uLight');
  const camera = uniform('uRotation');
  const kind = uniform('uKind');
  const ambient = uniform('uAmbient');
  const hasEarth = uniform('uHasEarth');
  gl.uniform1i(hasEarth, images[2] ? 1 : 0);
  const maxSize = Math.min(textureLimit, gl.getParameter(gl.MAX_TEXTURE_SIZE) as number);
  const textures = ['uMoon', 'uElevation', 'uEarth'].map((name, index) => {
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + index);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    const image = images[index] ?? images[0];
    // Keep coordinates and channel values unchanged on devices with a lower texture limit.
    const source = image.width <= maxSize ? image : resizeTexture(image, maxSize);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    const mipmapped = isPowerOfTwo(source.width) && isPowerOfTwo(source.height);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, mipmapped ? gl.REPEAT : gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mipmapped ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    if (mipmapped) gl.generateMipmap(gl.TEXTURE_2D);
    gl.uniform1i(uniform(name), index);
    return texture;
  });

  return {
    draw(width, height, bodies) {
      const scale = Math.min(window.devicePixelRatio || 1, 1.75, 2000 / Math.max(width, height));
      resizeCanvas(canvas, width * scale, height * scale);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.disable(gl.SCISSOR_TEST);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.SCISSOR_TEST);
      for (const body of bodies) {
        const x = body.x * scale;
        const y = (height - body.y) * scale;
        const radius = body.radius * scale;
        const extent = radius * (body.kind === 'sun' ? 1.42 : 1) + 1;
        const left = Math.max(0, Math.floor(x - extent));
        const bottom = Math.max(0, Math.floor(y - extent));
        const right = Math.min(canvas.width, Math.ceil(x + extent));
        const top = Math.min(canvas.height, Math.ceil(y + extent));
        if (right <= left || top <= bottom) continue;
        gl.scissor(left, bottom, right - left, top - bottom);
        gl.uniform3f(disc, x, y, radius);
        gl.uniform3f(light, ...body.light);
        gl.uniform4f(camera, ...rotation(body.yaw, body.pitch));
        gl.uniform1f(ambient, body.ambient);
        gl.uniform1i(kind, body.kind === 'moon' ? 0 : body.kind === 'earth' ? 1 : 2);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
    },
    dispose() {
      for (const texture of textures) gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}

function isPowerOfTwo(size: number) {
  return (size & (size - 1)) === 0;
}

function resizeCanvas(canvas: HTMLCanvasElement, width: number, height: number) {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
}

function resizeTexture(image: HTMLImageElement, width: number) {
  const canvas = document.createElement('canvas');
  resizeCanvas(canvas, width, width * image.height / image.width);
  canvas.getContext('2d')!.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function createCanvasMoonScene(canvas: HTMLCanvasElement, images: Textures): MoonScene {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Ay çizim alanı açılamadı.');

  const color = [images[0], images[2]].map((image) => {
    if (!image) return null;
    const texture = resizeTexture(image, 1024);
    return texture.getContext('2d')!.getImageData(0, 0, texture.width, texture.height);
  });

  const elevationSource = resizeTexture(images[1], 1024);
  const elevations = elevationSource.getContext('2d')!.getImageData(0, 0, elevationSource.width, elevationSource.height);
  const layer = document.createElement('canvas');
  const drawLayer = layer.getContext('2d')!;
  function heightAt(x: number, y: number) {
    const column = (x + elevations.width) % elevations.width;
    const row = Math.min(elevations.height - 1, Math.max(0, y));
    const index = (row * elevations.width + column) * 4;
    return (elevations.data[index] * 256 + elevations.data[index + 1]) * 0.0005;
  }

  return {
    draw(width, height, bodies) {
      const scale = Math.min(1, 650 / Math.max(width, height));
      resizeCanvas(canvas, width * scale, height * scale);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const body of bodies) {
        const x = body.x * scale;
        const y = body.y * scale;
        const radius = body.radius * scale;
        if (body.kind === 'sun') {
          const halo = ctx.createRadialGradient(x, y, radius * 0.25, x, y, radius * 1.4);
          halo.addColorStop(0, '#ffffce');
          halo.addColorStop(0.62, '#ffc25c');
          halo.addColorStop(0.66, '#eb8a27');
          halo.addColorStop(0.73, '#fa8e4f49');
          halo.addColorStop(1, '#fa8e4f00');
          ctx.fillStyle = halo;
          ctx.fillRect(x - 1.4 * radius, y - 1.4 * radius, radius * 2.8, radius * 2.8);
          continue;
        }

        const left = Math.max(0, Math.floor(x - radius));
        const top = Math.max(0, Math.floor(y - radius));
        const w = Math.min(canvas.width, Math.ceil(x + radius)) - left;
        const h = Math.min(canvas.height, Math.ceil(y + radius)) - top;
        if (w <= 0 || h <= 0) continue;
        const disc = ctx.createImageData(w, h);
        const isMoon = body.kind === 'moon';
        const texture = color[isMoon ? 0 : 1];
        const [cy, sy, cp, sp] = rotation(body.yaw, body.pitch);
        const [lx, ly, lz] = body.light;
        const tiltedLightZ = lz * cp - ly * sp;
        const localLightX = lx * cy + tiltedLightZ * sy;
        const localLightY = ly * cp + lz * sp;
        const localLightZ = tiltedLightZ * cy - lx * sy;
        for (let row = 0; row < h; row++) {
          const ny = (y - top - row - 0.5) / radius;
          for (let col = 0; col < w; col++) {
            const nx = (left + col + 0.5 - x) / radius;
            const depthSquared = 1 - nx * nx - ny * ny;
            if (depthSquared <= 0) continue;
            const nz = Math.sqrt(depthSquared);
            const tiltedZ = nz * cp - ny * sp;
            const localX = nx * cy + tiltedZ * sy;
            const localY = ny * cp + nz * sp;
            const localZ = tiltedZ * cy - nx * sy;
            const u = Math.atan2(localX, localZ) / (2 * Math.PI) + 0.5;
            const v = 0.5 - Math.asin(Math.max(-1, Math.min(1, localY))) / Math.PI;
            let incidence = Math.max(0, nx * lx + ny * ly + nz * lz);
            if (isMoon && incidence > 0) {
              const sampleX = Math.floor(u * elevations.width) % elevations.width;
              const sampleY = Math.min(elevations.height - 1, Math.floor(v * elevations.height));
              const eastDifference = heightAt(sampleX + 2, sampleY) - heightAt(sampleX - 2, sampleY);
              const northDifference = heightAt(sampleX, sampleY - 2) - heightAt(sampleX, sampleY + 2);
              const latitudeScale = Math.max(0.12, Math.hypot(localX, localZ));
              const eastLight = (localZ * localLightX - localX * localLightZ) / latitudeScale;
              const northLight = latitudeScale * localLightY - localY *
                (localX * localLightX + localZ * localLightZ) / latitudeScale;
              const relief = eastDifference * 0.047 * eastLight / latitudeScale + northDifference * 0.047 * northLight;
              incidence = Math.max(0, Math.min(1, incidence - relief * Math.min(incidence * 7, 1)));
            }
            const shade = body.ambient + Math.sqrt(incidence) * 1.15;
            const i = (row * w + col) * 4;
            if (texture) {
              const tx = Math.floor(u * texture.width) % texture.width;
              const ty = Math.min(texture.height - 1, Math.floor(v * texture.height));
              const p = (ty * texture.width + tx) * 4;
              for (let c = 0; c < 3; c++) disc.data[i + c] = texture.data[p + c] * shade;
            } else {
              disc.data[i] = 30 * shade;
              disc.data[i + 1] = 100 * shade;
              disc.data[i + 2] = 175 * shade;
            }
            disc.data[i + 3] = 255;
          }
        }
        resizeCanvas(layer, w, h);
        drawLayer.putImageData(disc, 0, 0);
        ctx.drawImage(layer, left, top);
      }
    },
    dispose() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
  };
}

export function createMoonScene(canvas: HTMLCanvasElement, images: Textures, textureLimit: number) {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false });
  return gl ? createWebGLMoonScene(canvas, gl, images, textureLimit) : createCanvasMoonScene(canvas, images);
}
