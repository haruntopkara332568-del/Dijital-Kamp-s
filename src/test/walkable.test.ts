import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WalkableCanvasEngine } from '@/src/features/walkable/engine/WalkableCanvasEngine';
import type { WalkableSceneConfig } from '@/src/features/walkable/types';

describe('Aşama 3 — Yürünebilir Kampüs Motoru (WalkableCanvasEngine)', () => {
  let canvas: HTMLCanvasElement;
  let config: WalkableSceneConfig;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;

    // Canvas 2D context mock
    const mockCtx = {
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      arc: vi.fn(),
      ellipse: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillRect: vi.fn(),
      roundRect: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      setLineDash: vi.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
      textAlign: '',
      fillText: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    vi.spyOn(canvas, 'getContext').mockReturnValue(mockCtx);

    config = {
      width: 1200,
      height: 800,
      playerSpawn: { x: 500, y: 400 },
      obstacles: [
        // İngilizce Dünyası Binası
        { id: 'bldg-english', name: 'İngilizce Dünyası', x: 800, y: 100, width: 200, height: 160 },
        // Masa / Engel
        { id: 'obstacle-desk', name: 'Masa', x: 300, y: 300, width: 100, height: 60 },
      ],
      interactiveZones: [
        {
          id: 'enter-english',
          name: 'İngilizce Dünyası Kapısı',
          prompt: 'İngilizce Sınıfına Gir',
          x: 900,
          y: 280,
          radius: 60,
          action: vi.fn(),
        },
      ],
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('1. Karakter yön tuşlarıyla ve W, A, S, D ile doğru yönde hareket eder', () => {
    const onActiveZoneChange = vi.fn();
    const engine = new WalkableCanvasEngine(canvas, config, { onActiveZoneChange });

    expect(engine.player.x).toBe(500);
    expect(engine.player.y).toBe(400);

    // Sağ yön tuşuna basılması simülasyonu
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    // 100ms delta ile motor güncellemesi (update çağrısı)
    (engine as unknown as { update: (delta: number) => void }).update(0.1);

    expect(engine.player.x).toBeGreaterThan(500);
    expect(engine.player.direction).toBe('right');
    expect(engine.player.state).toBe('walk');

    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight' }));
    (engine as unknown as { update: (delta: number) => void }).update(0.1);
    expect(engine.player.state).toBe('idle');

    // W tuşuna basılması (Yukarı)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
    (engine as unknown as { update: (delta: number) => void }).update(0.1);

    expect(engine.player.y).toBeLessThan(400);
    expect(engine.player.direction).toBe('up');

    engine.destroy();
  });

  it('2. Çapraz hareket hızı normal hareket hızından fazla olamaz (Normalizasyon)', () => {
    const engine = new WalkableCanvasEngine(canvas, config, { onActiveZoneChange: vi.fn() });

    // Hem sağ hem aşağı aynı anda basılıyor
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));

    const initialX = engine.player.x;
    const initialY = engine.player.y;

    (engine as unknown as { update: (delta: number) => void }).update(1.0); // 1 saniye

    const dx = engine.player.x - initialX;
    const dy = engine.player.y - initialY;
    const totalDistance = Math.hypot(dx, dy);

    // 1 saniyede katedilen toplam mesafe player.speed (160) civarında olmalı, 160 * 1.414 = 226 olmamalı!
    expect(totalDistance).toBeCloseTo(engine.player.speed, 0);

    engine.destroy();
  });

  it('3. Karakter bina ve engel sınırlarının içinden geçemez (Çarpışma algılama)', () => {
    const engine = new WalkableCanvasEngine(canvas, config, { onActiveZoneChange: vi.fn() });

    // Karakteri engelin (x: 300, y: 300, w: 100, h: 60) hemen sağına yerleştir
    engine.player.x = 415;
    engine.player.y = 310;

    // Sola doğru (engelin içine doğru) yürümeye çalış
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));

    for (let i = 0; i < 10; i++) {
      (engine as unknown as { update: (delta: number) => void }).update(0.1);
    }

    // Karakter engelin sınırında durmalı, engelin içine (x < 400) girememelidir
    expect(engine.player.x).toBeGreaterThanOrEqual(405);

    engine.destroy();
  });

  it('4. Tıklanan ulaşılabilir noktaya otomatik yürür ve manuel hareket otomatik yürümeyi iptal eder', () => {
    const engine = new WalkableCanvasEngine(canvas, config, { onActiveZoneChange: vi.fn() });

    // Canvas üzerine sol tık simülasyonu
    canvas.getBoundingClientRect = vi.fn().mockReturnValue({ left: 0, top: 0 });
    canvas.dispatchEvent(new PointerEvent('pointerdown', { clientX: 600, clientY: 400, button: 0 }));

    (engine as unknown as { update: (delta: number) => void }).update(0.2);
    // Karakter sağdaki hedefe doğru yürümeye başlamış olmalı
    expect(engine.player.x).toBeGreaterThan(500);

    // Öğrenci klavyeye bastığında otomatik yürüme iptal edilir
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    (engine as unknown as { update: (delta: number) => void }).update(0.2);

    // Artık sola gidiyor
    expect(engine.player.direction).toBe('left');

    engine.destroy();
  });

  it('5. Ulaşılamayan bir engel içine tıklandığında hata geri bildirimi verir', () => {
    const onUnreachableTarget = vi.fn();
    const engine = new WalkableCanvasEngine(canvas, config, {
      onActiveZoneChange: vi.fn(),
      onUnreachableTarget,
    });

    canvas.getBoundingClientRect = vi.fn().mockReturnValue({ left: 0, top: 0 });
    // Engelin içine tıkla (canvas clientX: 850 + camera.x: 100 = 950)
    canvas.dispatchEvent(new PointerEvent('pointerdown', { clientX: 850, clientY: 150, button: 0 }));

    expect(onUnreachableTarget).toHaveBeenCalledWith({ x: 950, y: 250 });

    engine.destroy();
  });

  it('6. İngilizce Dünyası kapısına yaklaşıldığında etkileşim bölgesi tetiklenir ve E tuşuyla eylem çalışır', () => {
    const zoneAction = vi.fn();
    config.interactiveZones[0].action = zoneAction;

    const onActiveZoneChange = vi.fn();
    const engine = new WalkableCanvasEngine(canvas, config, { onActiveZoneChange });

    // Karakteri etkileşim alanının içine yerleştir (x: 900, y: 280, radius: 60)
    engine.player.x = 890;
    engine.player.y = 275;

    (engine as unknown as { update: (delta: number) => void }).update(0.05);

    expect(onActiveZoneChange).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'enter-english' }),
    );

    // E tuşuna basıldığında zoneAction tetiklenmeli
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }));
    expect(zoneAction).toHaveBeenCalledTimes(1);

    engine.destroy();
  });

  it('7. Mobil dokunmatik sanal yön kontrolleri (setVirtualDirection) çalışır', () => {
    const engine = new WalkableCanvasEngine(canvas, config, { onActiveZoneChange: vi.fn() });

    engine.setVirtualDirection(1, 0); // Sağa sanal hareket
    (engine as unknown as { update: (delta: number) => void }).update(0.2);

    expect(engine.player.x).toBeGreaterThan(500);
    expect(engine.player.direction).toBe('right');
    expect(engine.player.state).toBe('walk');

    engine.setVirtualDirection(0, 0); // Durdur
    (engine as unknown as { update: (delta: number) => void }).update(0.1);
    expect(engine.player.state).toBe('idle');

    engine.destroy();
  });

  it('8. Kamera sınırların dışına taşmaz ve karakteri takip eder', () => {
    const engine = new WalkableCanvasEngine(canvas, config, { onActiveZoneChange: vi.fn() });

    // Karakter sol-üst köşeye yakınken kamera negatif olamaz (min: 0)
    engine.player.x = 50;
    engine.player.y = 50;
    (engine as unknown as { updateCamera: (instant: boolean) => void }).updateCamera(true);

    expect(engine.camera.x).toBeGreaterThanOrEqual(0);
    expect(engine.camera.y).toBeGreaterThanOrEqual(0);

    // Karakter sağ-alt köşeye yakınken sahne sınırını aşamaz
    engine.player.x = config.width - 20;
    engine.player.y = config.height - 20;
    (engine as unknown as { updateCamera: (instant: boolean) => void }).updateCamera(true);

    expect(engine.camera.x).toBeLessThanOrEqual(config.width - canvas.width);
    expect(engine.camera.y).toBeLessThanOrEqual(config.height - canvas.height);

    engine.destroy();
  });
});
