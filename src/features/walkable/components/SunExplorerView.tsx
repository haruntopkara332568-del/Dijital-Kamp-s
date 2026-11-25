import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { createCanvasSun, createSunProminences, createWebGlSun, type SunPose } from '../engine/sunExplorerScene';

const initialPose: SunPose = { yaw: 0.18, pitch: 0.13, zoom: 1, offsetX: 0, offsetY: 0 };
const minZoom = 0.62;
const maxZoom = 2.9;
const tiltLimit = Math.PI * 0.49;
const turn = 0.33;
const zoomStep = 1.25;

const starfield = [
  'radial-gradient(1px 1px at 9% 27%, #e3ebfc 85%, transparent)',
  'radial-gradient(1.3px 1.3px at 19% 72%, #b4c9e8 85%, transparent)',
  'radial-gradient(0.8px 0.8px at 31% 15%, #b8b5ad 84%, transparent)',
  'radial-gradient(1px 1px at 43% 85%, #ffeece 85%, transparent)',
  'radial-gradient(0.9px 0.9px at 62% 19%, #f7d8a1 85%, transparent)',
  'radial-gradient(1.4px 1.4px at 76% 29%, #c5d9f8 85%, transparent)',
  'radial-gradient(0.8px 0.8px at 82% 74%, #c5d9f8 85%, transparent)',
  'radial-gradient(1px 1px at 92% 52%, #dce6f9 85%, transparent)',
  'radial-gradient(ellipse at center, #251b1b 0%, #101723 55%, #070c17 92%)',
].join(', ');

type Position = { x: number; y: number };

function pointDistance(points: Map<number, Position>) {
  const [first, second] = points.values();
  return first && second ? Math.hypot(first.x - second.x, first.y - second.y) : 0;
}

function toSurfaceAnchor(element: HTMLElement, clientX: number, clientY: number) {
  const bounds = element.getBoundingClientRect();
  const unit = Math.min(bounds.width, bounds.height) || 1;
  return {
    x: (clientX - bounds.left - bounds.width / 2) / unit,
    y: (bounds.top + bounds.height / 2 - clientY) / unit,
  };
}

function wrap(angle: number) {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

const buttonClass = [
  'inline-flex min-h-12 min-w-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border',
  'border-sky-200/25 bg-[#102545] px-1.5 py-2 text-center text-[11px] font-extrabold leading-tight text-sky-50',
  'outline-offset-2 hover:bg-[#1a365b] focus-visible:outline-2 focus-visible:outline-sky-200',
  'disabled:cursor-default disabled:opacity-45 sm:min-h-13 sm:flex-row sm:px-4 sm:text-sm',
].join(' ');

export function SunExplorerView() {
  const stage = useRef<HTMLDivElement>(null);
  const webgl = useRef<HTMLCanvasElement>(null);
  const fallback = useRef<HTMLCanvasElement>(null);
  const prominences = useRef<HTMLCanvasElement>(null);
  const view = useRef({ ...initialPose });
  const target = useRef({ ...initialPose });
  const requestDraw = useRef<() => void>(() => {});
  const pointers = useRef(new Map<number, Position>());
  const hintId = useId();
  const [available, setAvailable] = useState(true);
  const [zoomLimit, setZoomLimit] = useState<'near' | 'far' | null>(null);

  useEffect(() => {
    const element = stage.current;
    const gpu = webgl.current;
    const canvas = fallback.current;
    const glow = prominences.current;
    if (!element || !gpu || !canvas || !glow) return;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    let software = false;
    let renderer = createWebGlSun(gpu);
    const arcs = createSunProminences(glow);
    let frame = 0;
    let lastDraw = 0;
    let time = 0;

    function schedule() {
      if (!frame && renderer && !document.hidden) frame = requestAnimationFrame(paint);
    }

    function paint(now: number) {
      frame = 0;
      if (!renderer || !element || document.hidden) return;
      const current = view.current;
      const next = target.current;
      const deltaYaw = wrap(next.yaw - current.yaw);
      const deltaPitch = next.pitch - current.pitch;
      const deltaZoom = next.zoom - current.zoom;
      const deltaX = next.offsetX - current.offsetX;
      const deltaY = next.offsetY - current.offsetY;
      const moving = Math.hypot(deltaYaw, deltaPitch, deltaZoom, deltaX, deltaY) > 0.0015;
      const interval = software ? 33 : moving ? 15 : 24;
      if (lastDraw && now - lastDraw < interval) {
        schedule();
        return;
      }
      const elapsed = lastDraw ? Math.min(64, now - lastDraw) : 24;
      lastDraw = now;
      const reduced = Boolean(reducedMotion?.matches);
      if (!reduced) time += elapsed / 1000;

      if (moving && !reduced) {
        const ease = 1 - Math.exp(-elapsed / 62);
        current.yaw = wrap(current.yaw + deltaYaw * ease);
        current.pitch += deltaPitch * ease;
        current.zoom += deltaZoom * ease;
        current.offsetX += deltaX * ease;
        current.offsetY += deltaY * ease;
      } else {
        view.current = { ...next };
      }

      const { clientWidth: width, clientHeight: height } = element;
      if (width && height) {
        const settings = { ...view.current, width, height, time: reduced ? 0 : time };
        renderer.draw(settings);
        arcs?.draw(settings);
      }
      if (!reduced) schedule();
    }

    function useFallback(event?: Event) {
      event?.preventDefault();
      if (software || !gpu || !canvas) return;
      software = true;
      renderer?.dispose();
      gpu.hidden = true;
      canvas.hidden = false;
      renderer = createCanvasSun(canvas);
      setAvailable(Boolean(renderer));
      schedule();
    }

    function refresh() {
      lastDraw = 0;
      schedule();
    }

    requestDraw.current = schedule;
    if (!renderer) useFallback();
    gpu.addEventListener('webglcontextlost', useFallback);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(refresh);
    observer?.observe(element);
    window.addEventListener('resize', refresh);
    document.addEventListener('visibilitychange', refresh);
    reducedMotion?.addEventListener?.('change', refresh);
    schedule();

    return () => {
      cancelAnimationFrame(frame);
      requestDraw.current = () => {};
      observer?.disconnect();
      gpu.removeEventListener('webglcontextlost', useFallback);
      window.removeEventListener('resize', refresh);
      document.removeEventListener('visibilitychange', refresh);
      reducedMotion?.removeEventListener?.('change', refresh);
      renderer?.dispose();
      arcs?.dispose();
    };
  }, []);

  function rotate(yaw: number, pitch = 0) {
    const next = target.current;
    next.yaw = wrap(next.yaw + yaw);
    next.pitch = Math.min(tiltLimit, Math.max(-tiltLimit, next.pitch + pitch));
    requestDraw.current();
  }

  const zoomBy = useCallback((factor: number, anchor?: Position) => {
    const next = target.current;
    const zoom = Math.max(minZoom, Math.min(maxZoom, next.zoom * factor));
    const scale = zoom / next.zoom;
    const maxOffset = Math.max(0, zoom - 0.78) * 0.46;
    const x = anchor?.x ?? 0;
    const y = anchor?.y ?? 0;
    next.offsetX = Math.max(-maxOffset, Math.min(maxOffset, x + (next.offsetX - x) * scale));
    next.offsetY = Math.max(-maxOffset, Math.min(maxOffset, y + (next.offsetY - y) * scale));
    next.zoom = zoom;
    setZoomLimit(zoom === minZoom ? 'far' : zoom === maxZoom ? 'near' : null);
    requestDraw.current();
  }, []);

  function reset() {
    target.current = { ...initialPose };
    setZoomLimit(null);
    requestDraw.current();
  }

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    function handleWheel(event: WheelEvent) {
      event.preventDefault();
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 320 : 1);
      if (element) zoomBy(Math.exp(-delta * 0.0015), toSurfaceAnchor(element, event.clientX, event.clientY));
    }
    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => element.removeEventListener('wheel', handleWheel);
  }, [zoomBy]);

  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!available || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
  }

  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    const tracked = pointers.current;
    const previous = tracked.get(event.pointerId);
    if (!previous) return;
    const oldDistance = tracked.size > 1 ? pointDistance(tracked) : 0;
    tracked.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (tracked.size > 1) {
      const distance = pointDistance(tracked);
      const [first, second] = tracked.values();
      if (oldDistance && distance && first && second) {
        const anchor = toSurfaceAnchor(event.currentTarget, (first.x + second.x) / 2, (first.y + second.y) / 2);
        zoomBy(distance / oldDistance, anchor);
      }
      return;
    }
    const bounds = event.currentTarget;
    const sensitivity = Math.PI / Math.max(180, Math.min(bounds.clientWidth, bounds.clientHeight) * 0.78);
    rotate((previous.x - event.clientX) * sensitivity, (event.clientY - previous.y) * sensitivity);
  }

  function releasePointer(event: PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
  }

  function handleKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (!available) return;
    switch (event.key) {
      case 'ArrowLeft': rotate(turn); break;
      case 'ArrowRight': rotate(-turn); break;
      case 'ArrowUp': rotate(0, turn); break;
      case 'ArrowDown': rotate(0, -turn); break;
      case '+':
      case '=': zoomBy(zoomStep); break;
      case '-': zoomBy(1 / zoomStep); break;
      case 'Home': reset(); break;
      default: return;
    }
    event.preventDefault();
  }

  return (
    <section aria-label="Etkileşimli Güneş modeli" className="grid h-full min-h-[18rem] grid-rows-[minmax(0,1fr)_auto] gap-2">
      <div
        ref={stage}
        role="group"
        tabIndex={0}
        aria-label="Güneş küresi"
        aria-describedby={available ? hintId : undefined}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={releasePointer}
        onPointerCancel={releasePointer}
        onLostPointerCapture={releasePointer}
        onKeyDown={handleKeys}
        className="relative isolate min-h-0 touch-none cursor-grab overflow-hidden rounded-2xl border border-sky-200/25 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-amber-200 active:cursor-grabbing"
        style={{ backgroundImage: starfield }}
      >
        <canvas ref={webgl} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
        <canvas ref={fallback} hidden aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
        <canvas ref={prominences} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
        {!available && (
          <p role="status" className="absolute inset-0 grid place-items-center px-4 text-center text-sm text-sky-100">
            Güneş modeli bu cihazda açılamadı.
          </p>
        )}
      </div>

      {available && (
        <div className="rounded-2xl border border-sky-200/20 bg-[#0c1b35] px-2 pb-2 pt-1.5 sm:pt-2">
          <div role="group" aria-label="Güneş modelinin kontrolleri" className="mx-auto grid max-w-3xl grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,1.23fr)] gap-1.5 sm:gap-2">
            <button type="button" aria-label="Güneş’i sola döndür" onClick={() => rotate(turn)} className={buttonClass}>
              <ArrowLeft size={20} aria-hidden="true" /><span>Sola</span>
            </button>
            <button type="button" aria-label="Güneş’i sağa döndür" onClick={() => rotate(-turn)} className={buttonClass}>
              <ArrowRight size={20} aria-hidden="true" /><span>Sağa</span>
            </button>
            <button type="button" onClick={() => zoomBy(zoomStep)} disabled={zoomLimit === 'near'} className={buttonClass}>
              <ZoomIn size={20} aria-hidden="true" /><span>Yakınlaş</span>
            </button>
            <button type="button" onClick={() => zoomBy(1 / zoomStep)} disabled={zoomLimit === 'far'} className={buttonClass}>
              <ZoomOut size={20} aria-hidden="true" /><span>Uzaklaş</span>
            </button>
            <button type="button" onClick={reset} className={buttonClass + ' !border-amber-200/55 !bg-[#352a24] !text-amber-100 hover:!bg-[#483524]'}>
              <RotateCcw size={19} aria-hidden="true" /><span>Başa Dön</span>
            </button>
          </div>
          <p id={hintId} className="mt-1.5 text-center text-[11px] text-sky-100/80 sm:text-xs">
            Sürükleyerek döndür. Tekerlekle veya iki parmakla yakınlaş.
          </p>
        </div>
      )}
    </section>
  );
}
