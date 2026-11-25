import { EARTH_LAYERS } from '@/src/data/earthExplorer';

export const layerCenters = [0.66, 0.03, -0.58, -1.22] as const;
export const layerRadii = EARTH_LAYERS.map(({ radius }) => radius);
export type LayerAxis = [number, number, number];
export type LayerHit = { index: number; depth: number; localZ: number; face: 'outer' | 'inner' | 'rim' };

export function earthLayerAxis(rotX: number, rotY: number): LayerAxis {
  const z = Math.sin(rotY);
  return [Math.cos(rotY), -z * Math.sin(rotX), z * Math.cos(rotX)];
}

function sphereDepth(r: number, d2: number, plane: number, axisZ: number, half: boolean) {
  if (d2 >= r * r) return -Infinity;
  const z = Math.sqrt(r * r - d2);
  if (!half || plane + axisZ * z >= 0) return z;
  return plane - axisZ * z >= 0 ? -z : -Infinity;
}

export function traceEarthLayers(x: number, y: number, axis: LayerAxis, separation: number, hit: LayerHit) {
  hit.index = -1;
  hit.depth = -Infinity;
  const [ax, ay, az] = axis;

  for (let i = 0; i < layerRadii.length; i++) {
    const offset = layerCenters[i] * separation;
    const dx = x - ax * offset;
    const dy = y - ay * offset;
    const d2 = dx * dx + dy * dy;
    const outer = layerRadii[i];
    if (d2 >= outer * outer) continue;
    const inner = layerRadii[i + 1] ?? 0;
    const half = inner > 0;
    const plane = dx * ax + dy * ay;
    let z = sphereDepth(outer, d2, plane, az, half);
    let face: LayerHit['face'] = 'outer';

    if (half) {
      const innerZ = sphereDepth(inner, d2, plane, az, true);
      if (innerZ > z) {
        z = innerZ;
        face = 'inner';
      }
      if (Math.abs(az) > 0.0002) {
        const rimZ = -plane / az;
        const rimD2 = d2 + rimZ * rimZ;
        if (rimZ > z && rimD2 >= inner * inner && rimD2 <= outer * outer) {
          z = rimZ;
          face = 'rim';
        }
      }
    }

    const depth = z + az * offset;
    if (depth <= hit.depth) continue;
    hit.index = i;
    hit.depth = depth;
    hit.localZ = z;
    hit.face = face;
  }
}

// The orthographic ray uses the same sphere and clipping plane as the picking code.
export const earthLayersGlsl = [
  'uniform float u_separation;',
  'uniform vec4 u_layerCenters, u_layerRadii;',
  'uniform vec3 u_axis;',
  'float sphereDepth(float radius, float d2, float plane, bool halfShell) {',
  '  if (d2 >= radius * radius) return -100.0;',
  '  float depth = sqrt(radius * radius - d2);',
  '  if (!halfShell || plane + u_axis.z * depth >= 0.0) return depth;',
  '  return plane - u_axis.z * depth >= 0.0 ? -depth : -100.0;',
  '}',
  'void rayLayer(inout vec4 hit, vec2 point, float centerOffset, float outer, float inner, float index) {',
  '  vec3 center = u_axis * (centerOffset * u_separation);',
  '  vec2 relative = point - center.xy;',
  '  float d2 = dot(relative, relative);',
  '  if (d2 >= outer * outer) return;',
  '  float plane = dot(relative, u_axis.xy);',
  '  float z = sphereDepth(outer, d2, plane, inner > 0.0);',
  '  float face = 0.0;',
  '  if (inner > 0.0) {',
  '    float innerDepth = sphereDepth(inner, d2, plane, true);',
  '    if (innerDepth > z) { z = innerDepth; face = 1.0; }',
  '    if (abs(u_axis.z) > 0.0002) {',
  '      float rim = -plane / u_axis.z;',
  '      float lip = d2 + rim * rim;',
  '      if (rim > z && lip >= inner * inner && lip <= outer * outer) { z = rim; face = 2.0; }',
  '    }',
  '  }',
  '  if (z > -99.0 && z + center.z > hit.x) hit = vec4(z + center.z, index, face, centerOffset);',
  '}',
  'float textureHash(vec3 p) {',
  '  p = fract(p * 0.1031);',
  '  p += dot(p, p.yzx + 33.33);',
  '  return fract((p.x + p.y) * p.z);',
  '}',
  'float rockTexture(vec3 p) {',
  '  vec3 i = floor(p);',
  '  vec3 s = fract(p);',
  '  s = s * s * (3.0 - 2.0 * s);',
  '  vec2 low = vec2(mix(textureHash(i), textureHash(i + vec3(1,0,0)), s.x), mix(textureHash(i + vec3(0,1,0)), textureHash(i + vec3(1,1,0)), s.x));',
  '  i.z += 1.0;',
  '  vec2 high = vec2(mix(textureHash(i), textureHash(i + vec3(1,0,0)), s.x), mix(textureHash(i + vec3(0,1,0)), textureHash(i + vec3(1,1,0)), s.x));',
  '  return mix(mix(low.x, low.y, s.y), mix(high.x, high.y, s.y), s.z);',
  '}',
  'vec4 drawLayers(vec2 point) {',
  '  vec4 hit = vec4(-100.0, -1.0, 0.0, 0.0);',
  '  rayLayer(hit, point, u_layerCenters.x, u_layerRadii.x, u_layerRadii.y, 0.0);',
  '  rayLayer(hit, point, u_layerCenters.y, u_layerRadii.y, u_layerRadii.z, 1.0);',
  '  rayLayer(hit, point, u_layerCenters.z, u_layerRadii.z, u_layerRadii.w, 2.0);',
  '  rayLayer(hit, point, u_layerCenters.w, u_layerRadii.w, 0.0, 3.0);',
  '  if (hit.y < 0.0) return vec4(0.0);',
  '  vec3 offset = u_axis * (hit.w * u_separation);',
  '  vec3 relative = vec3(point, hit.x) - offset;',
  '  vec3 radial = relative / max(length(relative), 0.0001);',
  '  vec3 normal = hit.z < 0.5 ? radial : hit.z < 1.5 ? -radial : -u_axis;',
  '  vec3 key = normalize(vec3(-0.5, 0.62, 0.66));',
  '  float diffuse = max(0.0, dot(normal, key));',
  '  float reflection = pow(max(0.0, dot(normal, normalize(key + vec3(0.0,0.0,1.0)))), 20.0);',
  '  float rimLight = pow(1.0 - abs(normal.z), 2.4);',
  '  vec3 grainPos = modelPoint(relative);',
  '  float broad = rockTexture(grainPos * 11.0);',
  '  float grit = rockTexture(grainPos * 54.0);',
  '  vec3 color;',
  '  if (hit.y < 0.5 && hit.z < 0.5) {',
  '    vec2 uv = uvAt(radial);',
  '    vec3 ground = texture2D(u_surface, uv).rgb;',
  '    float clouds = smoothstep(0.14, 0.97, texture2D(u_clouds, uv).r);',
  '    color = mix(ground, vec3(0.90, 0.95, 1.0), clouds * 0.57) * (0.49 + diffuse * 0.64);',
  '    color += rimLight * vec3(0.025, 0.11, 0.32);',
  '  } else if (hit.y < 0.5) {',
  '    color = mix(vec3(0.25, 0.15, 0.11), vec3(0.76, 0.52, 0.32), broad * 0.7 + grit * 0.3);',
  '    color *= 0.54 + diffuse * 0.62;',
  '  } else if (hit.y < 1.5) {',
  '    float veinField = broad * 0.79 + rockTexture(grainPos * 22.0) * 0.21;',
  '    float streak = 1.0 - smoothstep(0.014, 0.067, abs(veinField - 0.56));',
  '    vec3 basalt = mix(vec3(0.09, 0.029, 0.035), vec3(0.42, 0.19, 0.14), 0.4 * broad + 0.6 * grit);',
  '    color = basalt * (0.54 + diffuse * 0.8) + streak * vec3(0.64, 0.14, 0.024) * (0.52 + grit * 0.46);',
  '    color += (reflection + rimLight * 0.2) * vec3(0.19, 0.07, 0.04);',
  '  } else if (hit.y < 2.5) {',
  '    float stream = 0.5 + 0.5 * sin(46.0 * grainPos.y + 6.0 * broad + 3.0 * sin(20.0 * grainPos.z));',
  '    color = mix(vec3(0.65, 0.19, 0.033), vec3(1.0, 0.67, 0.20), stream * 0.52 + broad * 0.34 + grit * 0.14);',
  '    color *= 0.57 + diffuse * 0.43;',
  '    color += (reflection * 0.16 + 0.08 * rimLight) * vec3(1.0, 0.57, 0.22);',
  '  } else {',
  '    float granules = 0.54 * broad + 0.46 * grit;',
  '    color = mix(vec3(0.88, 0.41, 0.11), vec3(1.0, 0.88, 0.48), granules);',
  '    color *= 0.73 + diffuse * 0.31;',
  '    color += (reflection * 0.19 + rimLight * 0.08) * vec3(1.0, 0.79, 0.38);',
  '  }',
  '  if (abs(float(u_selected) - hit.y) < 0.1) color = color * 1.15 + 0.06 * vec3(1.0, 0.80, 0.55);',
  '  return vec4(color, 1.0);',
  '}',
].join('\n');
