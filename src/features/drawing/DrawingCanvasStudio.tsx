import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Eraser,
  Move,
  Palette,
  RotateCcw,
  Shapes,
  Trash2,
  Undo2,
} from 'lucide-react';
import type {
  DrawingDocument,
  DrawingShapeItem,
  DrawingShapeType,
  GradeLevel,
} from '@/src/types/campus';
import { renderDrawingToCanvas } from '@/src/utils/pngExport';

interface DrawingCanvasStudioProps {
  value: DrawingDocument;
  onChange: (next: DrawingDocument) => void;
  grade?: GradeLevel;
}

const PALETTE_COLORS = [
  { name: 'Koyu Arduvaz', hex: '#162231' },
  { name: 'Selçuklu Turkuazı', hex: '#0e7490' },
  { name: 'Anadolu Taşı', hex: '#8c7b62' },
  { name: 'Ahşap Kahvesi', hex: '#8a5634' },
  { name: 'Güneş Altını', hex: '#b45309' },
  { name: 'Avlu Yeşili', hex: '#15803d' },
];

const SHAPE_PRESETS: Array<{
  type: DrawingShapeType;
  label: string;
  defaultW: number;
  defaultH: number;
}> = [
  { type: 'arch', label: 'Kemer', defaultW: 110, defaultH: 130 },
  { type: 'rectangle', label: 'Kapı Kanadı', defaultW: 90, defaultH: 130 },
  { type: 'star-motif', label: 'Yıldız Motifi', defaultW: 54, defaultH: 54 },
  { type: 'handle', label: 'Kapı Kolu', defaultW: 34, defaultH: 34 },
  { type: 'window', label: 'Pencere', defaultW: 56, defaultH: 56 },
  { type: 'column', label: 'Sütun', defaultW: 36, defaultH: 120 },
  { type: 'tree', label: 'Avlu Ağacı', defaultW: 66, defaultH: 92 },
];

const BRUSH_SIZES = [
  { label: 'İnce', size: 3 },
  { label: 'Orta', size: 6 },
  { label: 'Kalın', size: 11 },
];

export function createEmptyDrawing(): DrawingDocument {
  return {
    width: 640,
    height: 380,
    backgroundColor: '#ffffff',
    strokes: [],
    shapes: [],
  };
}

export function DrawingCanvasStudio({
  value,
  onChange,
  grade = 4,
}: DrawingCanvasStudioProps) {
  const isEarlyPrimary = grade === 2 || grade === 3;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [toolMode, setToolMode] = useState<'draw' | 'move'>('draw');
  const [selectedColor, setSelectedColor] = useState<string>(PALETTE_COLORS[1].hex);
  const [brushSize, setBrushSize] = useState<number>(6);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [showAdvancedTools, setShowAdvancedTools] = useState(!isEarlyPrimary);

  const activeStrokeIdRef = useRef<string | null>(null);
  const draggingShapeRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const idCounterRef = useRef<number>(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderDrawingToCanvas(ctx, value);

    // Seçili şekil varsa kesik çizgili odak çerçevesi göster
    if (selectedShapeId) {
      const target = value.shapes.find((s) => s.id === selectedShapeId);
      if (target) {
        ctx.save();
        ctx.strokeStyle = '#0e7490';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(target.x - 4, target.y - 4, target.width + 8, target.height + 8);
        ctx.restore();
      }
    }
  }, [value, selectedShapeId]);

  const toCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = value.width / rect.width;
    const scaleY = value.height / rect.height;
    return {
      x: Math.max(0, Math.min(value.width, (e.clientX - rect.left) * scaleX)),
      y: Math.max(0, Math.min(value.height, (e.clientY - rect.top) * scaleY)),
    };
  };

  const findShapeAtPoint = (x: number, y: number): DrawingShapeItem | undefined => {
    for (let i = value.shapes.length - 1; i >= 0; i--) {
      const s = value.shapes[i];
      if (x >= s.x && x <= s.x + s.width && y >= s.y && y <= s.y + s.height) {
        return s;
      }
    }
    return undefined;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const pt = toCanvasCoords(e);

    if (toolMode === 'move') {
      const hit = findShapeAtPoint(pt.x, pt.y);
      if (hit) {
        setSelectedShapeId(hit.id);
        draggingShapeRef.current = {
          id: hit.id,
          offsetX: pt.x - hit.x,
          offsetY: pt.y - hit.y,
        };
      } else {
        setSelectedShapeId(null);
      }
      return;
    }

    // Serbest çizim modu
    const newStrokeId = `stroke-${idCounterRef.current++}`;
    activeStrokeIdRef.current = newStrokeId;
    onChange({
      ...value,
      strokes: [
        ...value.strokes,
        {
          id: newStrokeId,
          color: selectedColor,
          size: brushSize,
          points: [pt],
        },
      ],
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pt = toCanvasCoords(e);

    if (toolMode === 'move' && draggingShapeRef.current) {
      const drag = draggingShapeRef.current;
      onChange({
        ...value,
        shapes: value.shapes.map((shape) => {
          if (shape.id !== drag.id) return shape;
          const nextX = Math.max(0, Math.min(value.width - shape.width, pt.x - drag.offsetX));
          const nextY = Math.max(0, Math.min(value.height - shape.height, pt.y - drag.offsetY));
          return { ...shape, x: Math.round(nextX), y: Math.round(nextY) };
        }),
      });
      return;
    }

    if (toolMode === 'draw' && activeStrokeIdRef.current) {
      const strokeId = activeStrokeIdRef.current;
      onChange({
        ...value,
        strokes: value.strokes.map((s) =>
          s.id === strokeId ? { ...s, points: [...s.points, pt] } : s,
        ),
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    activeStrokeIdRef.current = null;
    draggingShapeRef.current = null;
  };

  const handleAddShape = (preset: (typeof SHAPE_PRESETS)[number]) => {
    const id = `shape-${idCounterRef.current++}`;
    const offset = (value.shapes.length % 5) * 14;
    const newShape: DrawingShapeItem = {
      id,
      type: preset.type,
      label: preset.label,
      x: Math.round(value.width / 2 - preset.defaultW / 2 + offset),
      y: Math.round(value.height / 2 - preset.defaultH / 2 + offset),
      width: preset.defaultW,
      height: preset.defaultH,
      color: selectedColor,
    };
    onChange({
      ...value,
      shapes: [...value.shapes, newShape],
    });
    setSelectedShapeId(id);
    setToolMode('move');
    if (isEarlyPrimary) {
      setShowAdvancedTools(true);
    }
  };

  const nudgeSelectedShape = (dx: number, dy: number) => {
    if (!selectedShapeId) return;
    onChange({
      ...value,
      shapes: value.shapes.map((shape) => {
        if (shape.id !== selectedShapeId) return shape;
        return {
          ...shape,
          x: Math.max(0, Math.min(value.width - shape.width, shape.x + dx)),
          y: Math.max(0, Math.min(value.height - shape.height, shape.y + dy)),
        };
      }),
    });
  };

  const handleUndoStroke = () => {
    if (value.strokes.length > 0) {
      onChange({
        ...value,
        strokes: value.strokes.slice(0, -1),
      });
    } else if (value.shapes.length > 0) {
      const removed = value.shapes[value.shapes.length - 1];
      if (removed.id === selectedShapeId) setSelectedShapeId(null);
      onChange({
        ...value,
        shapes: value.shapes.slice(0, -1),
      });
    }
  };

  const handleDeleteSelectedShape = () => {
    if (!selectedShapeId) return;
    onChange({
      ...value,
      shapes: value.shapes.filter((s) => s.id !== selectedShapeId),
    });
    setSelectedShapeId(null);
  };

  const handleClearCanvas = () => {
    onChange(createEmptyDrawing());
    setSelectedShapeId(null);
    setConfirmClearOpen(false);
  };

  const handleCanvasKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (!selectedShapeId) return;
    const step = e.shiftKey ? 20 : 8;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      nudgeSelectedShape(-step, 0);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nudgeSelectedShape(step, 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      nudgeSelectedShape(0, -step);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      nudgeSelectedShape(0, step);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      handleDeleteSelectedShape();
    }
  };

  const selectedShape = value.shapes.find((s) => s.id === selectedShapeId) ?? null;
  const visibleColors = isEarlyPrimary && !showAdvancedTools ? PALETTE_COLORS.slice(0, 4) : PALETTE_COLORS;
  const visibleShapes = isEarlyPrimary && !showAdvancedTools ? SHAPE_PRESETS.slice(0, 3) : SHAPE_PRESETS;

  return (
    <div className="space-y-4">
      {/* Araç Çubuğu */}
      <div className="rounded-xl bg-[var(--campus-canvas)] border border-[var(--campus-border)] p-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Çizim / Taşıma Modu */}
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Çizim araç modu">
            <button
              type="button"
              onClick={() => setToolMode('draw')}
              className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors ${
                toolMode === 'draw'
                  ? 'bg-[var(--seljuk-teal)] text-white'
                  : 'bg-[var(--campus-surface)] border border-[var(--campus-border)] text-[var(--campus-ink)]'
              }`}
            >
              <Palette className="w-4 h-4" aria-hidden="true" />
              <span>{isEarlyPrimary ? 'Çiz' : 'Serbest Çizim'}</span>
            </button>

            {(!isEarlyPrimary || showAdvancedTools || value.shapes.length > 0) && (
              <button
                type="button"
                onClick={() => setToolMode('move')}
                className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors ${
                  toolMode === 'move'
                    ? 'bg-[var(--seljuk-teal)] text-white'
                    : 'bg-[var(--campus-surface)] border border-[var(--campus-border)] text-[var(--campus-ink)]'
                }`}
              >
                <Move className="w-4 h-4" aria-hidden="true" />
                <span>Şekil Seç ve Taşı</span>
              </button>
            )}

            {isEarlyPrimary && (
              <button
                type="button"
                aria-expanded={showAdvancedTools}
                onClick={() => setShowAdvancedTools((prev) => !prev)}
                className="min-h-[44px] px-3.5 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--campus-surface)] hover:bg-[var(--campus-surface-muted)] text-xs font-semibold text-[var(--seljuk-navy)] cursor-pointer transition-colors"
              >
                {showAdvancedTools ? 'Temel Araçlara Dön' : 'Daha Fazla Araç ve Şekil'}
              </button>
            )}
          </div>

          {/* Geri Al & Temizle */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleUndoStroke}
              disabled={value.strokes.length === 0 && value.shapes.length === 0}
              className="min-h-[44px] px-3.5 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--campus-surface)] hover:bg-[var(--campus-surface-muted)] disabled:opacity-45 text-xs font-semibold text-[var(--campus-ink)] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Undo2 className="w-4 h-4" aria-hidden="true" />
              <span>Geri Al</span>
            </button>

            {!confirmClearOpen ? (
              <button
                type="button"
                onClick={() => setConfirmClearOpen(true)}
                disabled={value.strokes.length === 0 && value.shapes.length === 0}
                className="min-h-[44px] px-3.5 py-2 rounded-lg border border-[var(--alert-rose)]/40 bg-[var(--campus-surface)] hover:bg-[var(--alert-rose-soft)] disabled:opacity-45 text-xs font-semibold text-[var(--alert-rose)] inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Eraser className="w-4 h-4" aria-hidden="true" />
                <span>Temizle</span>
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2 bg-[var(--alert-rose-soft)] px-2.5 py-1.5 rounded-lg border border-[var(--alert-rose)]/30">
                <span className="text-xs font-semibold text-[var(--alert-rose)]">Çizim silinsin mi?</span>
                <button
                  type="button"
                  onClick={handleClearCanvas}
                  className="min-h-[44px] px-3 py-1 rounded bg-[var(--alert-rose)] text-white text-xs font-semibold cursor-pointer"
                >
                  Evet, temizle
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClearOpen(false)}
                  className="min-h-[44px] px-3 py-1 rounded bg-[var(--campus-surface)] text-[var(--campus-ink)] text-xs font-semibold cursor-pointer"
                >
                  Vazgeç
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Renk ve Fırça Kalınlığı */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[var(--campus-border)]">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Renk seçimi">
            <span className="text-xs font-semibold text-[var(--campus-ink-muted)] mr-1">Renk:</span>
            {visibleColors.map((color) => {
              const active = selectedColor === color.hex;
              return (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => setSelectedColor(color.hex)}
                  aria-label={color.name}
                  aria-pressed={active}
                  title={color.name}
                  style={{ backgroundColor: color.hex }}
                  className={`w-11 h-11 rounded-lg border-2 cursor-pointer transition-transform ${
                    active ? 'border-[var(--campus-ink)] scale-105 ring-2 ring-[var(--seljuk-teal)]' : 'border-white'
                  }`}
                />
              );
            })}
          </div>

          {(!isEarlyPrimary || showAdvancedTools) && (
            <div className="flex items-center gap-2" role="group" aria-label="Fırça boyutu">
              <span className="text-xs font-semibold text-[var(--campus-ink-muted)]">Fırça:</span>
              {BRUSH_SIZES.map((b) => (
                <button
                  key={b.size}
                  type="button"
                  onClick={() => setBrushSize(b.size)}
                  aria-pressed={brushSize === b.size}
                  className={`min-h-[44px] px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    brushSize === b.size
                      ? 'bg-[var(--campus-ink)] text-white'
                      : 'bg-[var(--campus-surface)] border border-[var(--campus-border)] text-[var(--campus-ink)]'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Hazır Şekiller (Klavye ve dokunmatik ile kolay tasarım) */}
        <div className="pt-2 border-t border-[var(--campus-border)] space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--campus-ink-muted)]">
            <Shapes className="w-4 h-4 text-[var(--seljuk-teal)]" aria-hidden="true" />
            <span>
              {isEarlyPrimary
                ? 'Hazır Şekil Ekle:'
                : 'Hazır Şekil Ekle (dokunarak ekle ve taşı):'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {visibleShapes.map((preset) => (
              <button
                key={preset.type}
                type="button"
                onClick={() => handleAddShape(preset)}
                className="min-h-[44px] px-3.5 py-2 rounded-lg border border-[var(--campus-border)] bg-[var(--campus-surface)] hover:border-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal-soft)] text-xs font-semibold text-[var(--campus-ink)] cursor-pointer transition-colors"
              >
                + {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Çizim Yüzeyi (touch-action: none yalnızca tuval üzerinde etkin) */}
      <div className="rounded-xl border-2 border-[var(--campus-border)] bg-white overflow-hidden">
        <canvas
          ref={canvasRef}
          width={value.width}
          height={value.height}
          tabIndex={0}
          aria-label="Kapı tasarım ve çizim alanı. Şekil seçiliyken yön tuşları ile taşıyabilirsin."
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={handleCanvasKeyDown}
          style={{ touchAction: 'none' }}
          className="w-full h-auto block cursor-crosshair focus-visible:outline-3 focus-visible:outline-[var(--seljuk-teal)]"
        />
      </div>

      {/* Seçili Şekil İçin Klavye / Düğme Taşıma Denetimleri */}
      {selectedShape && (
        <div className="rounded-xl bg-[var(--seljuk-teal-soft)] border border-[var(--seljuk-teal)]/30 p-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-semibold text-[var(--campus-ink)]">
            Seçili şekil: {selectedShape.label} (sürükleyebilir veya yön düğmeleriyle taşıyabilirsin)
          </span>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => nudgeSelectedShape(-12, 0)}
              aria-label="Seçili şekli sola taşı"
              className="min-h-[44px] min-w-[44px] rounded-lg bg-white border border-[var(--campus-border)] flex items-center justify-center cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => nudgeSelectedShape(0, -12)}
              aria-label="Seçili şekli yukarı taşı"
              className="min-h-[44px] min-w-[44px] rounded-lg bg-white border border-[var(--campus-border)] flex items-center justify-center cursor-pointer"
            >
              <ArrowUp className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => nudgeSelectedShape(0, 12)}
              aria-label="Seçili şekli aşağı taşı"
              className="min-h-[44px] min-w-[44px] rounded-lg bg-white border border-[var(--campus-border)] flex items-center justify-center cursor-pointer"
            >
              <ArrowDown className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => nudgeSelectedShape(12, 0)}
              aria-label="Seçili şekli sağa taşı"
              className="min-h-[44px] min-w-[44px] rounded-lg bg-white border border-[var(--campus-border)] flex items-center justify-center cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleDeleteSelectedShape}
              className="min-h-[44px] px-3 rounded-lg bg-[var(--alert-rose)] text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer ml-1"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Şekli Sil</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedShapeId(null)}
              className="min-h-[44px] px-3 rounded-lg bg-white border border-[var(--campus-border)] text-xs font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 inline mr-1" aria-hidden="true" />
              Seçimi Bırak
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
