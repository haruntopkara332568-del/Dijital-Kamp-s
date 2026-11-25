import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Info, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { getMoonPhase, MOON_ORBIT_START, MOON_PLACES } from '@/src/data/moonExplorer';
import {
  createMoonScene,
  getMoonSceneTextures,
  projectMoonPlace,
  type MoonScene,
  type MoonSceneBody,
} from '../engine/moonExplorerScene';

const CONTROL = 'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-sky-200/30 bg-slate-950/90 px-3 text-sm font-bold text-sky-50 hover:border-sky-200/70 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200 disabled:cursor-default disabled:opacity-40';
const SPACE = 'relative isolate overflow-hidden rounded-2xl border border-sky-200/15 bg-[radial-gradient(ellipse_at_center,_#172942_0%,_#091325_57%,_#050a15_100%)]';
const DEFAULT_CAMERA = { yaw: -0.05, pitch: 0.04 };
const MIN_ZOOM = 1;
const MAX_ZOOM = 3.6;

function useMoonCanvas(textureLimit = 4096) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [scene, setScene] = useState<MoonScene | null>(null);
  const [failed, setFailed] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    let active = true;
    let renderer: MoonScene | undefined;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(element);
    const onContextLost = () => {
      if (!active) return;
      setScene(null);
      setFailed(true);
    };
    element.addEventListener('webglcontextlost', onContextLost);
    void getMoonSceneTextures().then((images) => {
      if (!active) return;
      renderer = createMoonScene(element, images, textureLimit);
      setScene(renderer);
    }).catch(() => {
      if (active) setFailed(true);
    });
    return () => {
      active = false;
      observer.disconnect();
      element.removeEventListener('webglcontextlost', onContextLost);
      renderer?.dispose();
    };
  }, [textureLimit]);

  return { canvas, scene, failed, ...size };
}

function useMoonDraw(target: ReturnType<typeof useMoonCanvas>, bodies: readonly MoonSceneBody[]) {
  const { scene, width, height } = target;
  useEffect(() => {
    if (!scene || width <= 0 || height <= 0) return;
    const frameId = requestAnimationFrame(() => scene.draw(width, height, bodies));
    return () => cancelAnimationFrame(frameId);
  }, [scene, width, height, bodies]);
}

function clampZoom(value: number) {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value));
}

function rotate(camera: typeof DEFAULT_CAMERA, yawDelta: number, pitchDelta: number) {
  return {
    yaw: (camera.yaw + yawDelta) % (2 * Math.PI),
    pitch: Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.pitch + pitchDelta)),
  };
}

function useAnimatedZoom(goal: number) {
  const [zoom, setZoom] = useState(goal);
  const current = useRef(goal);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frameId = 0;
    function frame() {
      const delta = goal - current.current;
      current.current = reduced || Math.abs(delta) < 0.008 ? goal : current.current + delta * 0.25;
      setZoom(current.current);
      if (current.current !== goal) frameId = requestAnimationFrame(frame);
    }
    frameId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
  }, [goal]);
  return zoom;
}

function SurfaceView() {
  const target = useMoonCanvas();
  const [camera, setCamera] = useState(DEFAULT_CAMERA);
  const [zoomGoal, setZoomGoal] = useState(MIN_ZOOM);
  const [showLabels, setShowLabels] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState<(typeof MOON_PLACES)[number]['id'] | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const zoom = useAnimatedZoom(zoomGoal);
  const radius = Math.min(target.width * 0.435, target.height * 0.44) * zoom;
  const centerX = target.width / 2;
  const centerY = target.height / 2;

  useMoonDraw(target, [{
    kind: 'moon',
    x: centerX,
    y: centerY,
    radius,
    yaw: camera.yaw,
    pitch: camera.pitch,
    light: [-0.62, 0.32, 0.716],
    ambient: 0.10,
  }]);

  useEffect(() => {
    const element = target.canvas.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaMode === 1 ? event.deltaY * 18 : event.deltaY;
      setZoomGoal((value) => clampZoom(value * Math.exp(-delta * 0.0015)));
    };
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => element.removeEventListener('wheel', onWheel);
  }, [target.canvas]);

  function reset() {
    setCamera(DEFAULT_CAMERA);
    setZoomGoal(MIN_ZOOM);
    setSelectedPlace(null);
  }

  function handlePointerDown(event: PointerEvent<HTMLCanvasElement>) {
    if (event.button !== 0 || pointers.current.size >= 2) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLCanvasElement>) {
    const before = pointers.current.get(event.pointerId);
    if (!before) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.current.size === 2) {
      const other = [...pointers.current].find(([id]) => id !== event.pointerId)?.[1];
      if (!other) return;
      const oldDistance = Math.hypot(before.x - other.x, before.y - other.y);
      const newDistance = Math.hypot(event.clientX - other.x, event.clientY - other.y);
      if (oldDistance > 8) setZoomGoal((value) => clampZoom(value * newDistance / oldDistance));
      return;
    }

    const sensitivity = 0.009 / Math.sqrt(zoom);
    const yaw = (before.x - event.clientX) * sensitivity;
    const pitch = (event.clientY - before.y) * sensitivity;
    setCamera((value) => rotate(value, yaw, pitch));
  }

  function endPointer(event: PointerEvent<HTMLCanvasElement>) {
    pointers.current.delete(event.pointerId);
  }

  function handleKeys(event: KeyboardEvent<HTMLCanvasElement>) {
    const delta: Record<string, [number, number]> = {
      ArrowLeft: [0.18, 0],
      ArrowRight: [-0.18, 0],
      ArrowUp: [0, -0.18],
      ArrowDown: [0, 0.18],
    };
    const move = delta[event.key];
    if (move) setCamera((value) => rotate(value, ...move));
    else if (event.key === '+' || event.key === '=') setZoomGoal((value) => clampZoom(value + 0.25));
    else if (event.key === '-') setZoomGoal((value) => clampZoom(value - 0.25));
    else if (event.key === 'Home') reset();
    else return;
    event.preventDefault();
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className={SPACE + ' min-h-[230px] flex-1'}>
        <canvas
          ref={target.canvas}
          tabIndex={0}
          aria-label="Ay modeli. Döndürmek için ok tuşlarını, yakınlaştırmak için artı ve eksi tuşlarını kullan."
          className="absolute inset-0 h-full w-full touch-none cursor-grab active:cursor-grabbing focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sky-300"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          onLostPointerCapture={endPointer}
          onKeyDown={handleKeys}
        />
        {!target.scene && (
          <p role="status" className="pointer-events-none absolute inset-0 grid place-items-center p-4 text-center text-sm text-sky-100">
            {target.failed ? 'Ay modeli açılamadı.' : 'Ay yükleniyor…'}
          </p>
        )}
        {target.scene && showLabels && zoom >= 1.32 && MOON_PLACES.map((place) => {
          const point = projectMoonPlace(place.longitude, place.latitude, camera.yaw, camera.pitch);
          const x = centerX + radius * point.x;
          const y = centerY + radius * point.y;
          if (point.depth < 0.28 || x < 23 || x > target.width - 23 || y < 24 || y > target.height - 24) return null;
          const open = selectedPlace === place.id;
          return (
            <div key={place.id} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2" style={{ left: x, top: y }}>
              <button
                type="button"
                aria-pressed={open}
                onClick={() => setSelectedPlace(open ? null : place.id)}
                className="pointer-events-auto grid h-11 min-w-11 cursor-pointer place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-sky-200"
              >
                <span className="rounded-full border border-sky-100/65 bg-slate-950/90 px-2.5 py-1 text-xs font-bold text-sky-50 shadow-md">
                  {place.name}
                </span>
              </button>
              {open && <p role="status" className="absolute left-1/2 top-full w-max max-w-40 -translate-x-1/2 rounded-lg border border-sky-100/30 bg-slate-950 px-2.5 py-1.5 text-center text-xs text-sky-100 shadow-lg">{place.detail}</p>}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button type="button" className={CONTROL} aria-label="Uzaklaştır" disabled={zoomGoal <= MIN_ZOOM} onClick={() => setZoomGoal((value) => clampZoom(value / 1.23))}><ZoomOut className="size-5" aria-hidden="true" /></button>
        <button type="button" className={CONTROL} aria-label="Yakınlaştır" disabled={zoomGoal >= MAX_ZOOM} onClick={() => setZoomGoal((value) => clampZoom(value * 1.23))}><ZoomIn className="size-5" aria-hidden="true" /></button>
        {zoomGoal >= 1.32 && <button type="button" className={CONTROL + (showLabels ? ' ring-1 ring-sky-300/70' : '')} aria-pressed={showLabels} onClick={() => setShowLabels((value) => !value)}>
          <Info className="size-4" aria-hidden="true" /> Yer adları
        </button>}
        <button type="button" className={CONTROL} onClick={reset}><RotateCcw className="size-4" aria-hidden="true" /> Başa Dön</button>
      </div>
    </div>
  );
}

function normalizeAngle(angle: number) {
  return (angle % 360 + 360) % 360;
}

function OrbitView() {
  const orbit = useMoonCanvas(1024);
  const observer = useMoonCanvas(2048);
  const drag = useRef<number | null>(null);
  const [angle, setAngle] = useState(MOON_ORBIT_START);
  const radians = angle * Math.PI / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const phase = getMoonPhase(angle);
  const light: MoonSceneBody['light'] = [-1, 0, 0];
  const centerX = orbit.width * 0.62;
  const centerY = orbit.height * 0.48;
  const radiusX = orbit.width * 0.275;
  const radiusY = Math.min(orbit.height * 0.30, orbit.width * 0.20);
  const sun: MoonSceneBody = { kind: 'sun', x: orbit.width * 0.16, y: centerY, radius: Math.min(orbit.width * 0.105, orbit.height * 0.17), light, ambient: 0 };
  const earth: MoonSceneBody = { kind: 'earth', x: centerX, y: centerY, radius: Math.min(orbit.width * 0.092, orbit.height * 0.14), yaw: 0.36, pitch: 0.25, light, ambient: 0.18 };
  const moon: MoonSceneBody = { kind: 'moon', x: centerX - radiusX * cos, y: centerY + radiusY * sin, radius: Math.min(orbit.width * 0.049, orbit.height * 0.083), yaw: -radians - Math.PI / 2, light, ambient: 0.23 };
  useMoonDraw(orbit, sin >= 0 ? [sun, earth, moon] : [sun, moon, earth]);
  useMoonDraw(observer, [{
    kind: 'moon',
    x: observer.width / 2,
    y: observer.height / 2,
    radius: Math.min(observer.width, observer.height) * 0.43,
    light: [sin, 0, -cos],
    ambient: 0.066,
  }]);

  function moveMoon(event: PointerEvent<HTMLDivElement>) {
    if (!radiusX || !radiusY) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - box.left - centerX) / radiusX;
    const y = (event.clientY - box.top - centerY) / radiusY;
    if (Math.hypot(x, y) < 0.17) return;
    setAngle(normalizeAngle(Math.atan2(y, -x) * 180 / Math.PI));
  }

  function handleKeys(event: KeyboardEvent<HTMLDivElement>) {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp': setAngle((value) => normalizeAngle(value + 5)); break;
      case 'ArrowLeft':
      case 'ArrowDown': setAngle((value) => normalizeAngle(value - 5)); break;
      case 'Home': setAngle(0); break;
      case 'End': setAngle(359); break;
      default: return;
    }
    event.preventDefault();
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_minmax(220px,32%)]">
        <div className={SPACE + ' flex min-h-0 flex-col'}>
          <div
            role="slider"
            tabIndex={0}
            aria-label="Ay’ın yörüngedeki konumu"
            aria-valuemin={0}
            aria-valuemax={359}
            aria-valuenow={Math.floor(angle)}
            aria-valuetext={phase}
            className="relative min-h-[clamp(208px,34dvh,310px)] flex-1 touch-none cursor-grab select-none rounded-t-2xl active:cursor-grabbing focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sky-300"
            onKeyDown={handleKeys}
            onPointerDown={(event) => {
              if (event.button !== 0 || drag.current !== null) return;
              drag.current = event.pointerId;
              event.currentTarget.setPointerCapture(event.pointerId);
              moveMoon(event);
            }}
            onPointerMove={(event) => { if (drag.current === event.pointerId) moveMoon(event); }}
            onLostPointerCapture={(event) => { if (drag.current === event.pointerId) drag.current = null; }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-dashed border-sky-100/50"
              style={{ left: centerX, top: centerY, width: radiusX * 2, height: radiusY * 2 }}
            />
            <canvas ref={orbit.canvas} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
            {orbit.scene && ([[sun, 'Güneş'], [earth, 'Dünya'], [moon, 'Ay']] as const).map(([body, name]) => (
              <span key={name} aria-hidden="true" className="pointer-events-none absolute -translate-x-1/2 rounded-lg bg-[#06111f]/90 px-2 py-0.5 text-xs font-bold text-sky-50 sm:text-sm" style={{ left: body.x, top: body.y + body.radius + 5 }}>
                {name}
              </span>
            ))}
            {orbit.failed && <p role="status" className="pointer-events-none absolute inset-0 grid place-items-center p-2 text-center text-sm text-sky-100">Yörünge görünümü açılamadı.</p>}
            {orbit.scene && <span aria-hidden="true" className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-200/70 shadow-[0_0_12px_#7dd3fc48]" style={{ left: moon.x, top: moon.y, width: moon.radius * 2 + 10, height: moon.radius * 2 + 10 }} />}
          </div>
          <p className="p-2 text-center text-xs text-sky-100 sm:text-sm">Ay’ı yörüngesinde sürükle.</p>
        </div>
        <section aria-label="Dünya’dan Görünüm" className={SPACE + ' flex min-h-[184px] flex-col p-2 sm:p-3'}>
          <h3 className="text-center text-sm font-bold text-sky-100 sm:text-base">Dünya’dan Görünüm</h3>
          <div className="relative min-h-28 flex-1">
            <canvas ref={observer.canvas} aria-hidden="true" className="absolute inset-0 h-full w-full" />
            {!observer.scene && <p role="status" className="absolute inset-0 grid place-items-center text-center text-sm text-sky-100">{observer.failed ? 'Ay modeli açılamadı.' : 'Ay yükleniyor…'}</p>}
          </div>
          <p className="text-center text-lg font-extrabold text-white sm:text-2xl">{phase}</p>
        </section>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="px-1 text-xs font-medium text-sky-100/80">Temsilî gösterim</span>
        <button type="button" className={CONTROL} onClick={() => setAngle(MOON_ORBIT_START)}><RotateCcw className="size-4" aria-hidden="true" /> Başa Dön</button>
      </div>
    </div>
  );
}

export function MoonExplorerView() {
  const [mode, setMode] = useState<'surface' | 'orbit'>('surface');

  return (
    <section aria-label="Ay keşfi" className="flex h-full min-h-[340px] flex-col gap-2">
      <div className="grid grid-cols-2 gap-2" role="group" aria-label="Ay keşif görünümü">
        <button type="button" aria-pressed={mode === 'surface'} onClick={() => setMode('surface')} className={CONTROL + (mode === 'surface' ? ' border-sky-200/75 bg-sky-900 shadow-[inset_0_0_0_1px_#7dd3fc44]' : '')}>Ay’ı Keşfet</button>
        <button type="button" aria-pressed={mode === 'orbit'} onClick={() => setMode('orbit')} className={CONTROL + (mode === 'orbit' ? ' border-sky-200/75 bg-sky-900 shadow-[inset_0_0_0_1px_#7dd3fc44]' : '')}>Ay’ın Evreleri</button>
      </div>
      {mode === 'surface' ? <SurfaceView /> : <OrbitView />}
    </section>
  );
}
