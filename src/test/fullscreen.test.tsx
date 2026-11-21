import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { FullscreenButton } from '@/src/components/FullscreenButton';
import { CampusGateView } from '@/src/features/entrance/CampusGateView';
import { WalkableControlsOverlay } from '@/src/features/walkable/components/WalkableControlsOverlay';
import { WalkableCanvasEngine } from '@/src/features/walkable/engine/WalkableCanvasEngine';
import {
  isFullscreenSupported,
  getIsFullscreen,
  requestAppFullscreen,
} from '@/src/services/fullscreen';

describe('Tam Ekran Deneyimi ve Sahne Ölçeklendirme Doğrulaması', () => {
  let originalFullscreenEnabled: PropertyDescriptor | undefined;
  let originalFullscreenElement: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalFullscreenEnabled = Object.getOwnPropertyDescriptor(document, 'fullscreenEnabled');
    originalFullscreenElement = Object.getOwnPropertyDescriptor(document, 'fullscreenElement');
  });

  afterEach(() => {
    if (originalFullscreenEnabled) {
      Object.defineProperty(document, 'fullscreenEnabled', originalFullscreenEnabled);
    } else {
      delete (document as unknown as Record<string, unknown>).fullscreenEnabled;
    }
    if (originalFullscreenElement) {
      Object.defineProperty(document, 'fullscreenElement', originalFullscreenElement);
    } else {
      delete (document as unknown as Record<string, unknown>).fullscreenElement;
    }
    vi.restoreAllMocks();
  });

  it('1. Desteklenmeyen ortamlarda (ör. iOS Safari) çalışmayan düğme gösterilmez (özellik denetimi)', () => {
    Object.defineProperty(document, 'fullscreenEnabled', {
      value: false,
      configurable: true,
    });
    delete (document.documentElement as unknown as Record<string, unknown>).requestFullscreen;

    expect(isFullscreenSupported()).toBe(false);

    const { container } = render(<FullscreenButton />);
    expect(container.firstChild).toBeNull();
  });

  it('2. Desteklenen tarayıcılarda kapı önünde "Tam ekrana geç" düğmesi erişilebilirdir', () => {
    Object.defineProperty(document, 'fullscreenEnabled', {
      value: true,
      configurable: true,
    });
    let currentFullscreen: Element | null = null;
    Object.defineProperty(document, 'fullscreenElement', {
      get: () => currentFullscreen,
      configurable: true,
    });

    const mockRequest = vi.fn().mockImplementation(async () => {
      currentFullscreen = document.documentElement;
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    document.documentElement.requestFullscreen = mockRequest;

    render(<CampusGateView onEnterCourtyard={() => {}} />);

    const enterBtn = screen.getByRole('button', { name: /Kapıyı Aç ve İçeri Gir/i });
    expect(enterBtn).toBeInTheDocument();

    const fsBtn = screen.getByRole('button', { name: /Tam ekrana geç/i });
    expect(fsBtn).toBeInTheDocument();
  });

  it('3. Tam ekrana geçildiğinde düğmenin metni "Tam ekrandan çık" olarak güncellenir', async () => {
    Object.defineProperty(document, 'fullscreenEnabled', {
      value: true,
      configurable: true,
    });
    let currentFullscreen: Element | null = null;
    Object.defineProperty(document, 'fullscreenElement', {
      get: () => currentFullscreen,
      configurable: true,
    });

    const mockRequest = vi.fn().mockImplementation(async () => {
      currentFullscreen = document.documentElement;
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    document.documentElement.requestFullscreen = mockRequest;

    render(<FullscreenButton variant="prominent" />);

    const fsBtn = screen.getByRole('button', { name: /Tam ekrana geç/i });
    expect(fsBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(fsBtn);
    });

    expect(mockRequest).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /Tam ekrandan çık/i })).toBeInTheDocument();
  });

  it('4. ESC tuşu veya tarayıcı çıkışında (fullscreenchange) düğme otomatik "Tam ekrana geç" olur', async () => {
    Object.defineProperty(document, 'fullscreenEnabled', {
      value: true,
      configurable: true,
    });
    let currentFullscreen: Element | null = document.documentElement;
    Object.defineProperty(document, 'fullscreenElement', {
      get: () => currentFullscreen,
      configurable: true,
    });

    render(<FullscreenButton variant="header" />);

    expect(screen.getByRole('button', { name: /Tam ekrandan çık/i })).toBeInTheDocument();

    await act(async () => {
      currentFullscreen = null;
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    expect(screen.getByRole('button', { name: /Tam ekrana geç/i })).toBeInTheDocument();
  });

  it('5. Tam ekran isteği kök öğeden (document.documentElement) tetiklenir ve sahne geçişlerinde kesilmez', async () => {
    Object.defineProperty(document, 'fullscreenEnabled', {
      value: true,
      configurable: true,
    });
    let currentFullscreen: Element | null = null;
    Object.defineProperty(document, 'fullscreenElement', {
      get: () => currentFullscreen,
      configurable: true,
    });

    const mockDocElRequest = vi.fn().mockImplementation(async () => {
      currentFullscreen = document.documentElement;
    });
    document.documentElement.requestFullscreen = mockDocElRequest;

    const success = await requestAppFullscreen();
    expect(success).toBe(true);
    expect(mockDocElRequest).toHaveBeenCalled();
    expect(getIsFullscreen()).toBe(true);
    expect(document.fullscreenElement).toBe(document.documentElement);
  });

  it('6. Avlu ve Sınıf sahnelerinde tam ekran düğmesi WalkableControlsOverlay başlığında mevcuttur', () => {
    Object.defineProperty(document, 'fullscreenEnabled', {
      value: true,
      configurable: true,
    });
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      configurable: true,
    });

    const { unmount } = render(
      <WalkableControlsOverlay
        activeZone={null}
        onTriggerInteraction={() => {}}
        onVirtualDirection={() => {}}
        unreachableMessage={null}
        currentScene="courtyard"
      />,
    );

    expect(screen.getByRole('button', { name: /Tam ekrana geç/i })).toBeInTheDocument();
    unmount();

    render(
      <WalkableControlsOverlay
        activeZone={null}
        onTriggerInteraction={() => {}}
        onVirtualDirection={() => {}}
        unreachableMessage={null}
        currentScene="classroom"
      />,
    );

    expect(screen.getByRole('button', { name: /Tam ekrana geç/i })).toBeInTheDocument();
  });

  it('7. İngilizce sınıfı (960x640) geniş ekran ve tam ekranda (1280x720, 1920x1080) sağ/alt boşluk bırakmadan ölçeklenir ve kritik yapıları kadrajda tutar', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;

    const mockCtx = {
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      ellipse: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      setLineDash: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
    vi.spyOn(canvas, 'getContext').mockReturnValue(mockCtx);

    const classroomConfig = {
      width: 960,
      height: 640,
      playerSpawn: { x: 480, y: 520 },
      obstacles: [],
      interactiveZones: [],
    };

    const engine = new WalkableCanvasEngine(canvas, classroomConfig, {
      onActiveZoneChange: vi.fn(),
    });

    expect(engine.zoom).toBeCloseTo(2.0, 4);
    expect(classroomConfig.width * engine.zoom).toBeGreaterThanOrEqual(canvas.width);
    expect(classroomConfig.height * engine.zoom).toBeGreaterThanOrEqual(canvas.height);

    const visibleTop = engine.camera.y;
    const visibleBottom = engine.camera.y + canvas.height / engine.zoom;
    expect(visibleTop).toBeLessThanOrEqual(25);
    expect(visibleBottom).toBeGreaterThanOrEqual(555);

    engine.destroy();
  });

  it('8. Kampüs avlusu (1400x900) tam ekran geçişinde (1280x720 -> 1920x1080) kenar boşluğu bırakmaz ve karakter konumunu sıfırlamaz', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;

    const mockCtx = {
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      ellipse: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      setLineDash: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
    vi.spyOn(canvas, 'getContext').mockReturnValue(mockCtx);

    const courtyardConfig = {
      width: 1400,
      height: 900,
      playerSpawn: { x: 700, y: 560 },
      obstacles: [],
      interactiveZones: [],
    };

    const engine = new WalkableCanvasEngine(canvas, courtyardConfig, {
      onActiveZoneChange: vi.fn(),
    });

    engine.setPosition({ x: 920, y: 360 });
    expect(engine.getPosition()).toEqual({ x: 920, y: 360 });

    engine.updateDimensions(1920, 1080);

    expect(engine.getPosition()).toEqual({ x: 920, y: 360 });
    expect(courtyardConfig.width * engine.zoom).toBeGreaterThanOrEqual(1920);
    expect(courtyardConfig.height * engine.zoom).toBeGreaterThanOrEqual(1080);

    engine.destroy();
  });

  it('9. Tam ekran ölçeklendirmesi (zoom) aktifken fare tıklama koordinatları dünya koordinatlarıyla birebir eşleşir', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;

    const mockCtx = {
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      ellipse: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      setLineDash: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
    vi.spyOn(canvas, 'getContext').mockReturnValue(mockCtx);

    const classroomConfig = {
      width: 960,
      height: 640,
      playerSpawn: { x: 480, y: 520 },
      obstacles: [{ id: 'blocked-test', name: 'Test Engel', x: 300, y: 200, width: 100, height: 100 }],
      interactiveZones: [],
    };

    const onUnreachableTarget = vi.fn();
    const engine = new WalkableCanvasEngine(canvas, classroomConfig, {
      onActiveZoneChange: vi.fn(),
      onUnreachableTarget,
    });

    canvas.getBoundingClientRect = vi.fn().mockReturnValue({
      left: 0,
      top: 0,
      width: 1920,
      height: 1080,
    });

    const screenX = (350 - engine.camera.x) * engine.zoom;
    const screenY = (250 - engine.camera.y) * engine.zoom;

    canvas.dispatchEvent(
      new PointerEvent('pointerdown', { clientX: screenX, clientY: screenY, button: 0 }),
    );

    expect(onUnreachableTarget).toHaveBeenCalledWith({ x: 350, y: 250 });

    engine.destroy();
  });
});
