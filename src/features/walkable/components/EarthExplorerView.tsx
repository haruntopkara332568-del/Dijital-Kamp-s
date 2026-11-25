import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Check, Eye, EyeOff, Globe2, Layers, LocateFixed, RotateCcw, Sun, ZoomIn, ZoomOut } from 'lucide-react';
import { EARTH_LAYERS, EARTH_TURKEY_POINT, isInTurkey } from '@/src/data/earthExplorer';
import { projectSurfacePoint } from '@/src/data/earthSunMoonExperiments';
import {
  TO_RADIANS, createCanvasEarth, createWebGlEarth, earthInteriorRadius, earthPointAt, earthRadius,
  loadEarthMaps, type EarthPoint, type EarthPose,
} from '../engine/earthExplorerScene';
import { earthLayerAxis, traceEarthLayers, type LayerHit } from '../engine/earthLayerGeometry';

const startPose: EarthPose = { rotY: -16 * TO_RADIANS, rotX: 19 * TO_RADIANS, zoom: 1 };
const interiorStart: EarthPose = { rotY: -0.47, rotX: 0.17, zoom: 1 };
const turkeyPose: EarthPose = {
  rotY: EARTH_TURKEY_POINT.lonDeg * TO_RADIANS,
  rotX: EARTH_TURKEY_POINT.latDeg * TO_RADIANS,
  zoom: 2.16,
};

const control = 'inline-flex min-h-13 cursor-pointer items-center justify-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-extrabold outline-offset-2 focus-visible:outline-2 focus-visible:outline-sky-200 lg:min-h-14';
const secondary = control + ' border-sky-200/25 bg-[#102545] text-sky-50 hover:bg-[#1a365b]';
const starfield = [
  'radial-gradient(1px 1px at 10% 20%, #d9efff 94%, transparent)',
  'radial-gradient(1px 1px at 21% 78%, #a2b5d7 94%, transparent)',
  'radial-gradient(1.3px 1.3px at 42% 16%, #f1e8d3 94%, transparent)',
  'radial-gradient(1px 1px at 74% 24%, #b3d1ff 94%, transparent)',
  'radial-gradient(1.2px 1.2px at 82% 65%, #c3d7fa 94%, transparent)',
  'radial-gradient(1px 1px at 90% 87%, #d5e9ff 94%, transparent)',
  'radial-gradient(ellipse at 42% 46%, #102847, #050a17 77%)',
].join(', ');

type Point = { x: number; y: number };
type Gesture = { mode: 'rotate' | 'pinch'; origin: Point; moved: boolean };

function wrapAngle(angle: number) {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

function pinchDistance(points: Map<number, Point>) {
  const [first, second] = points.values();
  return first && second ? Math.hypot(first.x - second.x, first.y - second.y) : 0;
}

function placeMarker(element: HTMLDivElement | null, point: EarthPoint | null, pose: EarthPose, width: number, height: number, radius: number) {
  if (!element) return;
  const projection = point && projectSurfacePoint(point.lonDeg, point.latDeg, pose.rotY, pose.rotX);
  const x = projection ? width / 2 + projection.nx * radius : -100;
  const y = projection ? height / 2 + projection.ny * radius : -100;
  element.hidden = !(projection && projection.nz > 0.005 && x > 0 && x < width && y > 0 && y < height);
  if (!element.hidden) element.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
}

export function EarthExplorerView() {
  const viewport = useRef<HTMLDivElement>(null);
  const webgl = useRef<HTMLCanvasElement>(null);
  const fallback = useRef<HTMLCanvasElement>(null);
  const marker = useRef<HTMLDivElement>(null);
  const foundMarker = useRef<HTMLDivElement>(null);
  const renderer = useRef<ReturnType<typeof createWebGlEarth>>(null);
  const pose = useRef({ ...startPose });
  const layerPose = useRef({ ...interiorStart });
  const display = useRef({ inside: false, separation: 0, showMarker: true, layer: -1, found: null as EarthPoint | null });
  const pointerPositions = useRef(new Map<number, Point>());
  const gesture = useRef<Gesture | null>(null);
  const frame = useRef(0);
  const animation = useRef(0);
  const openingAnimation = useRef(0);
  const foundTimer = useRef(0);
  const hintId = useId();
  const [loading, setLoading] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [inside, setInside] = useState(false);
  const [showMarker, setShowMarker] = useState(true);
  const [layer, setLayer] = useState(-1);
  const [found, setFound] = useState(false);

  const draw = useCallback(() => {
    const target = viewport.current;
    if (!target || !renderer.current) return;
    const { clientWidth: width, clientHeight: height } = target;
    if (!width || !height) return;
    const current = display.current;
    renderer.current.draw({
      width, height, pose: current.inside ? layerPose.current : pose.current,
      cutaway: current.inside, separation: current.separation, layer: current.layer,
    });
    const radius = earthRadius(width, height, pose.current.zoom);
    placeMarker(marker.current, current.showMarker && !current.inside ? EARTH_TURKEY_POINT : null, pose.current, width, height, radius);
    placeMarker(foundMarker.current, current.inside ? null : current.found, pose.current, width, height, radius);
  }, []);

  const requestDraw = useCallback(() => {
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      draw();
    });
  }, [draw]);

  useEffect(() => {
    const element = viewport.current;
    const gpu = webgl.current;
    const backup = fallback.current;
    if (!element || !gpu || !backup) return;
    let closed = false;
    let maps: Awaited<ReturnType<typeof loadEarthMaps>> = null;
    let usingFallback = false;

    function useFallback(event?: Event) {
      event?.preventDefault();
      if (closed || usingFallback || !maps || !gpu || !backup) return;
      usingFallback = true;
      renderer.current?.dispose();
      gpu.hidden = true;
      backup.hidden = false;
      renderer.current = createCanvasEarth(backup, maps);
      setLoading(renderer.current ? 'ready' : 'failed');
      requestDraw();
    }

    gpu.addEventListener('webglcontextlost', useFallback);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(requestDraw);
    observer?.observe(element);
    window.addEventListener('resize', requestDraw);
    void loadEarthMaps().then((images) => {
      if (closed) return;
      maps = images;
      if (!maps) {
        setLoading('failed');
        return;
      }
      renderer.current = createWebGlEarth(gpu, maps);
      if (!renderer.current) {
        useFallback();
        return;
      }
      setLoading('ready');
      requestDraw();
    });

    return () => {
      closed = true;
      observer?.disconnect();
      window.removeEventListener('resize', requestDraw);
      gpu.removeEventListener('webglcontextlost', useFallback);
      cancelAnimationFrame(frame.current);
      cancelAnimationFrame(animation.current);
      cancelAnimationFrame(openingAnimation.current);
      frame.current = 0;
      animation.current = 0;
      window.clearTimeout(foundTimer.current);
      renderer.current?.dispose();
      renderer.current = null;
    };
  }, [requestDraw]);

  const stopAnimation = useCallback(() => {
    cancelAnimationFrame(animation.current);
    animation.current = 0;
  }, []);

  const zoomBy = useCallback((factor: number) => {
    stopAnimation();
    const current = display.current.inside ? layerPose.current : pose.current;
    current.zoom = Math.max(0.72, Math.min(2.8, current.zoom * factor));
    requestDraw();
  }, [requestDraw, stopAnimation]);

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    function wheel(event: WheelEvent) {
      event.preventDefault();
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 320 : 1);
      zoomBy(Math.exp(-delta * 0.0014));
    }
    element.addEventListener('wheel', wheel, { passive: false });
    return () => element.removeEventListener('wheel', wheel);
  }, [zoomBy]);

  function rotate(dx: number, dy: number) {
    stopAnimation();
    const tiltLimit = 89 * TO_RADIANS;
    const current = display.current.inside ? layerPose.current : pose.current;
    current.rotY = wrapAngle(current.rotY + dx);
    current.rotX = Math.max(-tiltLimit, Math.min(tiltLimit, current.rotX + dy));
    requestDraw();
  }

  function moveTo(target: EarthPose) {
    stopAnimation();
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      pose.current = { ...target };
      requestDraw();
      return;
    }
    const from = { ...pose.current };
    const turn = wrapAngle(target.rotY - from.rotY);
    const start = performance.now();
    function animate(now: number) {
      const progress = Math.min(1, (now - start) / 660);
      const t = 1 - (1 - progress) ** 3;
      pose.current = {
        rotY: wrapAngle(from.rotY + turn * t),
        rotX: from.rotX + (target.rotX - from.rotX) * t,
        zoom: from.zoom + (target.zoom - from.zoom) * t,
      };
      requestDraw();
      animation.current = progress < 1 ? requestAnimationFrame(animate) : 0;
    }
    animation.current = requestAnimationFrame(animate);
  }

  function clearFound() {
    window.clearTimeout(foundTimer.current);
    display.current.found = null;
    setFound(false);
    requestDraw();
  }

  function changeMarker(visible: boolean) {
    clearFound();
    display.current.showMarker = visible;
    setShowMarker(visible);
    requestDraw();
  }

  function changeLayer(next: number) {
    if (next === display.current.layer) return;
    display.current.layer = next;
    setLayer(next);
    requestDraw();
  }

  function changeInterior(next: boolean) {
    const current = display.current;
    if (!next && !current.inside) return;
    cancelAnimationFrame(openingAnimation.current);
    if (next && !current.inside) layerPose.current = { ...interiorStart };
    current.inside = true;
    setInside(next);
    changeLayer(-1);
    clearFound();

    const from = current.separation;
    const to = Number(next);
    const finish = () => {
      current.inside = next;
      current.separation = to;
      openingAnimation.current = 0;
      requestDraw();
    };
    if (Math.abs(from - to) < 0.001 || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      finish();
      return;
    }

    const start = performance.now();
    function animate(now: number) {
      const progress = Math.min(1, (now - start) / 540);
      if (progress === 1) {
        finish();
        return;
      }
      current.separation = from + (to - from) * progress * progress * (3 - 2 * progress);
      requestDraw();
      openingAnimation.current = requestAnimationFrame(animate);
    }
    openingAnimation.current = requestAnimationFrame(animate);
  }

  function findTurkey() {
    changeInterior(false);
    changeMarker(true);
    moveTo(turkeyPose);
  }

  function resetEarth() {
    changeInterior(false);
    changeMarker(true);
    moveTo(startPose);
  }

  function toggleInterior() {
    stopAnimation();
    changeInterior(!inside);
  }

  function coordinates(point: Point) {
    const bounds = viewport.current?.getBoundingClientRect();
    if (!bounds?.width || !bounds.height) return null;
    const current = display.current;
    const radius = current.inside
      ? earthInteriorRadius(bounds.width, bounds.height, layerPose.current, current.separation)
      : earthRadius(bounds.width, bounds.height, pose.current.zoom);
    return {
      x: (point.x - bounds.left - bounds.width / 2) / radius,
      y: (bounds.top + bounds.height / 2 - point.y) / radius,
    };
  }

  function inspectPoint(x: number, y: number) {
    if (!display.current.inside) {
      confirmTurkey(x, y);
      return;
    }
    if (!inside) return;
    const hit: LayerHit = { index: -1, depth: 0, localZ: 0, face: 'outer' };
    const { rotX, rotY } = layerPose.current;
    traceEarthLayers(x, y, earthLayerAxis(rotX, rotY), display.current.separation, hit);
    if (hit.index >= 0) changeLayer(hit.index);
  }

  function confirmTurkey(x: number, y: number) {
    if (display.current.inside || display.current.showMarker || loading !== 'ready') return;
    const point = earthPointAt(x, y, pose.current);
    if (!point || !isInTurkey(point.lonDeg, point.latDeg)) return;
    window.clearTimeout(foundTimer.current);
    display.current.found = point;
    setFound(true);
    foundTimer.current = window.setTimeout(clearFound, 1650);
    requestDraw();
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || loading !== 'ready') return;
    stopAnimation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = { x: event.clientX, y: event.clientY };
    const points = pointerPositions.current;
    points.set(event.pointerId, point);
    if (points.size === 1) {
      gesture.current = { mode: 'rotate', origin: point, moved: false };
    } else if (gesture.current) {
      gesture.current.mode = 'pinch';
      gesture.current.moved = true;
    }
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const points = pointerPositions.current;
    const previous = points.get(event.pointerId);
    const active = gesture.current;
    if (!previous || !active) return;
    const point = { x: event.clientX, y: event.clientY };
    const oldDistance = active.mode === 'pinch' ? pinchDistance(points) : 0;
    points.set(event.pointerId, point);

    if (active.mode === 'pinch') {
      const distance = pinchDistance(points);
      if (oldDistance > 0 && distance > 0) zoomBy(distance / oldDistance);
    } else {
      if (!active.moved) {
        active.moved = Math.hypot(point.x - active.origin.x, point.y - active.origin.y) > 5;
        if (!active.moved) return;
      }
      const view = event.currentTarget;
      const scale = Math.PI / Math.max(140, Math.min(view.clientWidth, view.clientHeight) * 0.78);
      rotate((previous.x - point.x) * scale, (point.y - previous.y) * scale);
    }
  }

  function releasePointer(event: PointerEvent<HTMLDivElement>) {
    const points = pointerPositions.current;
    if (!points.delete(event.pointerId) || points.size > 0) return;
    const active = gesture.current;
    gesture.current = null;
    if (event.type !== 'pointerup' || active?.mode !== 'rotate' || active.moved) return;
    const hit = coordinates({ x: event.clientX, y: event.clientY });
    if (hit) inspectPoint(hit.x, hit.y);
  }

  function handleKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (loading !== 'ready') return;
    const turn = 12 * TO_RADIANS;
    switch (event.key) {
      case 'ArrowLeft': rotate(-turn, 0); break;
      case 'ArrowRight': rotate(turn, 0); break;
      case 'ArrowUp': rotate(0, turn); break;
      case 'ArrowDown': rotate(0, -turn); break;
      case '+':
      case '=': zoomBy(1.25); break;
      case '-': zoomBy(0.8); break;
      case 'Home': resetEarth(); break;
      case 'Enter': inspectPoint(0, 0); break;
      default: return;
    }
    event.preventDefault();
  }

  const currentLayer = EARTH_LAYERS[layer];
  return (
    <section aria-label="Etkileşimli Dünya modeli" className="grid h-full min-h-[26rem] grid-rows-[minmax(min(43dvh,19rem),1fr)_auto] gap-2 md:min-h-0 md:grid-cols-[minmax(0,1fr)_13rem] md:grid-rows-[minmax(0,1fr)] lg:gap-3 lg:grid-cols-[minmax(0,1fr)_15rem]">
      <div className="relative isolate min-h-[min(43dvh,19rem)] overflow-hidden rounded-2xl border border-sky-200/25 shadow-[0_15px_40px_-22px_#02050c] md:min-h-0">
        <div
          ref={viewport}
          role="group"
          tabIndex={0}
          aria-label="Dünya küresi"
          aria-describedby={hintId}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={releasePointer}
          onPointerCancel={releasePointer}
          onLostPointerCapture={releasePointer}
          onKeyDown={handleKeys}
          className="absolute inset-0 touch-none cursor-grab overflow-hidden focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-sky-200 active:cursor-grabbing"
          style={{ backgroundImage: starfield }}
        >
          <canvas ref={webgl} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
          <canvas ref={fallback} hidden aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
          <div ref={marker} hidden aria-hidden="true" className="pointer-events-none absolute left-0 top-0">
            <div className="relative -translate-x-1/2 -translate-y-1/2">
              <span className="block size-4 rounded-full border-2 border-white bg-amber-400 shadow-[0_0_13px_5px_#fbbf2480]" />
              <span className="absolute bottom-[calc(100%+0.45rem)] left-1/2 -translate-x-1/2 rounded-lg border border-amber-100/50 bg-[#101d34]/95 px-2.5 py-1 text-sm font-extrabold text-amber-100">Türkiye</span>
            </div>
          </div>
          <div ref={foundMarker} hidden aria-hidden="true" className="pointer-events-none absolute left-0 top-0">
            {found && (
              <div className="relative flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-emerald-400 text-emerald-950 shadow-[0_0_16px_#6ee7b7]">
                <div className="absolute inset-0 rounded-full border-2 border-emerald-200 motion-safe:animate-ping" />
                <Check size={16} strokeWidth={3} />
              </div>
            )}
          </div>
          {loading !== 'ready' && (
            <div role="status" className="pointer-events-none absolute inset-0 grid place-items-center px-16 text-center text-sm text-sky-100">
              {loading === 'loading' ? 'Dünya yükleniyor…' : 'Dünya modeli yüklenemedi. Alanı yeniden açabilirsin.'}
            </div>
          )}
        </div>
        {loading === 'ready' && (
          <>
            {!inside && (
              <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-lg bg-[#071427]/85 px-2.5 py-1.5 text-xs text-amber-100">
                <Sun size={15} className="text-amber-300" aria-hidden="true" />
                Güneş ışığı
              </div>
            )}
            <div className="absolute right-3 top-3 flex flex-col gap-2">
              <button type="button" aria-label="Yakınlaştır" onClick={() => zoomBy(1.25)} className={secondary + ' min-w-13 px-0'}>
                <ZoomIn size={21} aria-hidden="true" />
              </button>
              <button type="button" aria-label="Uzaklaştır" onClick={() => zoomBy(0.8)} className={secondary + ' min-w-13 px-0'}>
                <ZoomOut size={21} aria-hidden="true" />
              </button>
            </div>
          </>
        )}
        {found && (
          <p role="status" className="pointer-events-none absolute inset-x-0 bottom-4 mx-auto w-max rounded-full border border-emerald-200/60 bg-emerald-950/95 px-3.5 py-1.5 text-sm font-extrabold text-emerald-100">
            Türkiye’yi buldun!
          </p>
        )}
      </div>
      {loading === 'ready' && (
        <aside aria-label="Dünya modelinin kontrolleri" className="flex min-h-0 min-w-0 flex-col gap-3 rounded-2xl border border-sky-200/20 bg-[#0c1b35] p-2.5 md:overflow-y-auto md:p-3">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
            {!inside && (
              <>
                <button type="button" onClick={findTurkey} className={control + ' border-amber-200 bg-amber-300 text-slate-950 hover:bg-amber-200'}>
                  <LocateFixed size={17} aria-hidden="true" /> Türkiye’yi Bul
                </button>
                <button type="button" onClick={() => changeMarker(!showMarker)} className={secondary}>
                  {showMarker ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                  {showMarker ? 'İşareti Gizle' : 'İşareti Göster'}
                </button>
              </>
            )}
            <button type="button" onClick={toggleInterior} className={secondary}>
              {inside ? <Globe2 size={17} aria-hidden="true" /> : <Layers size={17} aria-hidden="true" />}
              {inside ? 'Yüzeye Dön' : 'Dünya’nın İçini Gör'}
            </button>
            <button type="button" onClick={resetEarth} className={secondary}>
              <RotateCcw size={16} aria-hidden="true" /> Başa Dön
            </button>
          </div>
          <p id={hintId} className="px-1 text-sm leading-snug text-sky-100/85">
            {inside ? 'Modeli döndürmek için sürükle. İncelemek için bir katmana dokun.' : showMarker
              ? 'Döndürmek için sürükle. Yakınlaşmak için tekerleği veya iki parmağını kullan.'
              : 'Türkiye’yi bulduğunda haritadaki yerine dokun.'}
          </p>
          {inside && (
            <div className="border-t border-sky-200/15 pt-3">
              <div role="group" aria-label="Dünya’nın katmanları" className="grid grid-cols-2 gap-2 md:grid-cols-1">
                {EARTH_LAYERS.map((item, index) => (
                  <button
                    type="button"
                    key={item.name}
                    aria-pressed={index === layer}
                    onClick={() => changeLayer(index)}
                    className={control + ' justify-start' + (index === layer ? ' border-amber-200 bg-[#32233c] text-amber-50' : ' border-sky-200/25 bg-[#102545] text-sky-50 hover:bg-[#1a365b]')}
                  >
                    <span className="size-3 rounded-full border border-white/35" style={{ backgroundColor: item.color }} aria-hidden="true" />
                    {item.name}
                  </button>
                ))}
              </div>
              {currentLayer && <p aria-live="polite" className="mt-2.5 px-1 text-sm font-semibold text-amber-100">{currentLayer.description}</p>}
              <p className="mt-2.5 px-1 text-xs text-sky-100/75">Renkler temsilîdir, kabuk kalınlaştırılmıştır.</p>
            </div>
          )}
        </aside>
      )}
    </section>
  );
}
