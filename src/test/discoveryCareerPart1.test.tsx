import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { CampusProviders } from '@/src/app/CampusProviders';
import { WalkableCampusView } from '@/src/features/walkable/WalkableCampusView';
import { WalkableCanvasEngine } from '@/src/features/walkable/engine/WalkableCanvasEngine';
import {
  CAREER_LIST,
  DISCOVERY_VR_CONFIG,
} from '@/src/data/discoveryCareerConfig';

function createMockCanvasContext() {
  return {
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    clip: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    roundRect: vi.fn(),
    rect: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    setLineDash: vi.fn(),
    drawImage: vi.fn(),
    createRadialGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
    createLinearGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    font: '',
    textAlign: 'left',
    textBaseline: 'top',
    fillText: vi.fn(),
    strokeText: vi.fn(),
    measureText: vi.fn().mockReturnValue({ width: 50 }),
  } as unknown as CanvasRenderingContext2D;
}

describe('Hayalden Gerçeğe — VR Meslek Keşfi Parça 1 Doğrulaması', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('1. Yapılandırma ve meslek veri listesi: İlk sürümde tek Astronot kartı ve histerezis eşikleri (1.5x / 2.0x)', () => {
    expect(CAREER_LIST).toHaveLength(1);
    const astronaut = CAREER_LIST[0];
    expect(astronaut.id).toBe('astronaut');
    expect(astronaut.title).toBe('Astronot');
    expect(astronaut.buttonText).toBe('Ay Görevine Başla');
    expect(astronaut.sceneId).toBe('discovery_moon');

    // Histerezis eşikleri: Giriş 1.5 boy (~101 px), Çıkış 2.0 boy (~134 px)
    expect(DISCOVERY_VR_CONFIG.interactionEnterRadius).toBe(101);
    expect(DISCOVERY_VR_CONFIG.interactionExitRadius).toBe(134);
    expect(DISCOVERY_VR_CONFIG.interactionExitRadius).toBeGreaterThan(
      DISCOVERY_VR_CONFIG.interactionEnterRadius,
    );
  });

  it('2. Sehpaya yaklaşınca "VR Gözlüğünü Tak" görünür, uzaklaşınca kaybolur (histerezis eşikleri)', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(createMockCanvasContext());
    HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
      left: 0,
      top: 0,
      width: 1280,
      height: 720,
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <CampusProviders>
          <WalkableCampusView initialScene="discovery_classroom" />
        </CampusProviders>
      </MemoryRouter>,
    );

    const engine = (
      window as unknown as { __WALKABLE_ENGINE__?: WalkableCanvasEngine }
    ).__WALKABLE_ENGINE__!;
    expect(engine).toBeDefined();

    // 1. Öğrenci doğuş noktasında (480, 470) - sehpadan ~170 px uzakta, istem görünmez
    expect(screen.queryByText('VR Gözlüğünü Tak')).not.toBeInTheDocument();

    // 2. Öğrenci sehpaya yaklaşır (480, 340) - mesafe: |340 - 300| = 40 px <= 101 px
    await act(async () => {
      engine.setPosition({ x: 480, y: 340 });
      (engine as unknown as { update: (delta: number) => void }).update(0.05);
    });
    expect(screen.getByText('VR Gözlüğünü Tak')).toBeInTheDocument();

    // 3. Öğrenci biraz geri çekilir (480, 420) - mesafe 120 px. Giriş eşiğini (101) aştı ama çıkış eşiğinde (134) olduğu için açık kalır
    await act(async () => {
      engine.setPosition({ x: 480, y: 420 });
      (engine as unknown as { update: (delta: number) => void }).update(0.05);
    });
    expect(screen.getByText('VR Gözlüğünü Tak')).toBeInTheDocument();

    // 4. Öğrenci tamamen uzaklaşır (480, 470) - mesafe 170 px > 134 px, istem kapanır
    await act(async () => {
      engine.setPosition({ x: 480, y: 470 });
      (engine as unknown as { update: (delta: number) => void }).update(0.05);
    });
    expect(screen.queryByText('VR Gözlüğünü Tak')).not.toBeInTheDocument();
  });

  it('3. Meslek ekranında tek Astronot kartı, "Ay Görevine Başla" ve "Gözlüğü Çıkar/Esc" çalışır', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(createMockCanvasContext());
    HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
      left: 0,
      top: 0,
      width: 1280,
      height: 720,
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <CampusProviders>
          <WalkableCampusView initialScene="discovery_classroom" />
        </CampusProviders>
      </MemoryRouter>,
    );

    const engine = (
      window as unknown as { __WALKABLE_ENGINE__?: WalkableCanvasEngine }
    ).__WALKABLE_ENGINE__!;

    // Sehpaya yaklaş
    await act(async () => {
      engine.setPosition({ x: 480, y: 340 });
      (engine as unknown as { update: (delta: number) => void }).update(0.05);
    });

    // "VR Gözlüğünü Tak" eylemini tetikle
    await act(async () => {
      engine.triggerActiveInteraction();
    });

    // Meslek modalı açılır
    expect(screen.getByText('Hangi mesleği keşfetmek istersin?')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Astronot' })).toBeInTheDocument();
    expect(screen.getByText('Ay Görevine Başla')).toBeInTheDocument();
    expect(screen.getByText('Gözlüğü Çıkar')).toBeInTheDocument();

    // Esc tuşu ile çıkış
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(screen.queryByText('Hangi mesleği keşfetmek istersin?')).not.toBeInTheDocument();
  });

  it('4. Tam akış: Gözlüğü tak -> Mesleği seç -> Ay sahnesi iskeletine geç -> Gözlüğü çıkar -> Sehpa önüne dön (2 kez tekrarlanır)', async () => {
    vi.useFakeTimers();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(createMockCanvasContext());
    HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
      left: 0,
      top: 0,
      width: 1280,
      height: 720,
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <CampusProviders>
          <WalkableCampusView initialScene="discovery_classroom" />
        </CampusProviders>
      </MemoryRouter>,
    );

    for (let cycle = 1; cycle <= 2; cycle++) {
      const vrEngine = (
        window as unknown as { __WALKABLE_ENGINE__?: WalkableCanvasEngine }
      ).__WALKABLE_ENGINE__!;

      // Sehpaya yaklaş
      await act(async () => {
        vrEngine.setPosition({ x: 480, y: 340 });
        (vrEngine as unknown as { update: (delta: number) => void }).update(0.05);
      });

      // Gözlüğü tak
      await act(async () => {
        vrEngine.triggerActiveInteraction();
      });

      expect(screen.getByText('Hangi mesleği keşfetmek istersin?')).toBeInTheDocument();

      // "Ay Görevine Başla" düğmesine tıkla
      const startButton = screen.getByText('Ay Görevine Başla');
      await act(async () => {
        startButton.click();
      });

      // Geçiş süresini ilerlet
      await act(async () => {
        vi.advanceTimersByTime(DISCOVERY_VR_CONFIG.fadeTransitionMs + 50);
      });

      // Ay sahnesi aktif olmalıdır
      expect(document.querySelector('[data-scene]')?.getAttribute('data-scene')).toBe(
        'discovery_moon',
      );
      expect(screen.getByText('Hayalden Gerçeğe — Ay Görevi')).toBeInTheDocument();

      // Ay sahnesindeki "Gözlüğü Çıkar" düğmesine tıkla
      const removeButton = screen.getAllByText('Gözlüğü Çıkar')[0];
      await act(async () => {
        removeButton.click();
      });

      // Geçiş süresini ilerlet
      await act(async () => {
        vi.advanceTimersByTime(DISCOVERY_VR_CONFIG.fadeTransitionMs + 50);
      });

      // Sınıfa geri dönmüş olmalı ve öğrenci sehpanın önünde (480, 350) doğmalıdır
      expect(document.querySelector('[data-scene]')?.getAttribute('data-scene')).toBe(
        'discovery_classroom',
      );
      const returnedEngine = (
        window as unknown as { __WALKABLE_ENGINE__?: WalkableCanvasEngine }
      ).__WALKABLE_ENGINE__!;
      expect(returnedEngine.getPosition()).toEqual(DISCOVERY_VR_CONFIG.returnClassroomSpawn);
    }

    vi.useRealTimers();
  });
});
