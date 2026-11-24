import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type RefObject } from 'react';
import { VETERINARY_CLINIC, VET_CARE_ITEMS, type VetCareItemId } from '@/src/data/veterinaryClinicContent';
import type { Position } from '../types';

type CareItem = (typeof VET_CARE_ITEMS)[number];
type Drag = { item: CareItem; pointerId: number; clientX: number; clientY: number; offset: Position };

const stopSpace = (event: KeyboardEvent<HTMLButtonElement>) => {
  if (event.key === ' ') event.stopPropagation();
};

export function VeterinaryClinicActivities({ layerRef, placed, reachItem, moveItem, placeItem }: {
  layerRef: RefObject<HTMLDivElement | null>;
  placed: Readonly<Record<VetCareItemId, boolean>>;
  reachItem: (position: Position) => boolean;
  moveItem: (item: VetCareItemId, position: Position | null) => void;
  placeItem: (item: VetCareItemId) => void;
}) {
  const drag = useRef<Drag | null>(null);
  const [selected, setSelected] = useState<{ item: CareItem; keyboard: boolean } | null>(null);
  const targetRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (selected?.keyboard) targetRef.current?.focus({ preventScroll: true });
  }, [selected]);

  useEffect(() => () => {
    if (drag.current) moveItem(drag.current.item.id, null);
  }, [moveItem]);

  function getWorldPoint(event: PointerEvent<HTMLButtonElement>): Position | null {
    const bounds = layerRef.current?.getBoundingClientRect();
    if (!bounds?.width || !bounds.height) return null;
    return {
      x: (event.clientX - bounds.left) * VETERINARY_CLINIC.width / bounds.width,
      y: (event.clientY - bounds.top) * VETERINARY_CLINIC.height / bounds.height,
    };
  }

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>, item: CareItem) {
    if (event.button !== 0 || drag.current) return;
    event.preventDefault();
    if (!reachItem(item.source)) return;
    const point = getWorldPoint(event);
    if (!point) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelected(null);
    drag.current = {
      item, pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY,
      offset: { x: item.source.x - point.x, y: item.source.y - point.y },
    };
    moveItem(item.id, item.source);
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    const current = drag.current;
    if (current?.pointerId !== event.pointerId) return;
    const point = getWorldPoint(event);
    if (point) moveItem(current.item.id, { x: point.x + current.offset.x, y: point.y + current.offset.y });
  }

  function endDrag(event: PointerEvent<HTMLButtonElement>, drop: boolean) {
    const current = drag.current;
    if (current?.pointerId !== event.pointerId) return;
    drag.current = null;
    const { item, offset } = current;
    moveItem(item.id, null);
    if (!drop) return;

    if (Math.hypot(event.clientX - current.clientX, event.clientY - current.clientY) < 6) {
      setSelected({ item, keyboard: false });
      return;
    }

    const point = getWorldPoint(event);
    if (point
      && Math.abs(point.x + offset.x - item.target.x) <= item.width / 2 + 12
      && Math.abs(point.y + offset.y - item.target.y) <= item.height / 2 + 12) {
      placeItem(item.id);
    }
  }

  return (
    <div
      ref={layerRef}
      className="pointer-events-none invisible absolute left-0 top-0 z-10 origin-top-left"
      style={{ width: VETERINARY_CLINIC.width, height: VETERINARY_CLINIC.height }}
    >
      {VET_CARE_ITEMS.filter(({ id }) => !placed[id]).map((item) => (
        <button
          key={item.id}
          type="button"
          aria-label={item.label + ' al'}
          data-vet-pickup={item.id}
          tabIndex={-1}
          aria-pressed={selected?.item.id === item.id}
          className="pointer-events-auto absolute touch-none cursor-grab rounded-xl outline-offset-2 focus-visible:outline-2 focus-visible:outline-teal-900 active:cursor-grabbing"
          style={{ left: item.source.x - item.width / 2, top: item.source.y - item.height / 2, width: item.width, height: item.height }}
          onPointerDown={(event) => handlePointerDown(event, item)}
          onPointerMove={handlePointerMove}
          onPointerUp={(event) => endDrag(event, true)}
          onPointerCancel={(event) => endDrag(event, false)}
          onLostPointerCapture={(event) => endDrag(event, false)}
          onKeyDown={stopSpace}
          onClick={(event) => {
            if (event.detail === 0 && reachItem(item.source)) setSelected({ item, keyboard: true });
          }}
        >
          <span className="pointer-events-none absolute left-1/2 top-full mt-0.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-white/95 px-1.5 py-0.5 text-[11px] font-bold text-teal-950 shadow-sm">
            {item.label}
          </span>
        </button>
      ))}
      {selected && (
        <button
          ref={targetRef}
          type="button"
          aria-label={selected.item.label + ' bakım alanına yerleştir'}
          className="pointer-events-auto absolute rounded-xl border-2 border-teal-800 bg-teal-100/60 font-bold text-teal-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
          style={{
            left: selected.item.target.x - selected.item.width / 2,
            top: selected.item.target.y - selected.item.height / 2,
            width: selected.item.width, height: selected.item.height,
          }}
          onKeyDown={stopSpace}
          onClick={() => {
            if (reachItem(selected.item.source)) {
              placeItem(selected.item.id);
              setSelected(null);
            }
          }}
        >
          <span className="text-[11px]">Bırak</span>
        </button>
      )}
    </div>
  );
}
