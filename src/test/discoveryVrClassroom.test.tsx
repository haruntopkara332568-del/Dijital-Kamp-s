import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { CampusProviders } from '@/src/app/CampusProviders';
import { WalkableCampusView } from '@/src/features/walkable/WalkableCampusView';
import { WalkableCanvasEngine } from '@/src/features/walkable/engine/WalkableCanvasEngine';
import {
  DISCOVERY_DOOR_PORTAL,
  renderCourtyardEntities,
} from '@/src/features/walkable/engine/courtyardSceneRenderer';
import {
  DISCOVERY_CLASSROOM,
  DISCOVERY_CLASSROOM_OBSTACLES,
  renderDiscoveryClassroomBackground,
} from '@/src/features/walkable/engine/discoveryClassroomSceneRenderer';
import { isPositionBlocked } from '@/src/features/walkable/engine/pathfinding';
import {
  DISCOVERY_BUILDING_ASSET_URL,
  setCachedAssetForTesting,
} from '@/src/features/walkable/engine/assetLoader';

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

describe('Hayalden Gerçeğe Binası Kapısı ve Selçuklu VR Sınıfı Doğrulaması', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. Bina kapı sınırları building_discovery.png üzerindeki gerçek kapı açıklığıyla örtüşür ve açılma efekti yalnız bu bölgeye uygulanır', () => {
    expect(DISCOVERY_DOOR_PORTAL.sourceWidth).toBe(930);
    expect(DISCOVERY_DOOR_PORTAL.sourceHeight).toBe(761);
    expect(DISCOVERY_DOOR_PORTAL.doorLeftPx).toBe(545);
    expect(DISCOVERY_DOOR_PORTAL.doorRightPx).toBe(621);
    expect(DISCOVERY_DOOR_PORTAL.doorArchApexYPx).toBe(528);
    expect(DISCOVERY_DOOR_PORTAL.doorBottomYPx).toBe(686);

    const fakeImg = { complete: true, naturalWidth: 930, naturalHeight: 761 } as HTMLImageElement;
    setCachedAssetForTesting(DISCOVERY_BUILDING_ASSET_URL, fakeImg);

    const ctxClosed = createMockCanvasContext();
    renderCourtyardEntities(
      ctxClosed,
      {
        x: 290,
        y: 340,
        width: 22,
        height: 28,
        direction: 'up',
        state: 'idle',
        speed: 160,
        walkFrame: 0,
        grade: 3,
      },
      1400,
      900,
      0,
    );
    expect(ctxClosed.clip).not.toHaveBeenCalled();

    const ctxOpening = createMockCanvasContext();
    renderCourtyardEntities(
      ctxOpening,
      {
        x: 290,
        y: 340,
        width: 22,
        height: 28,
        direction: 'up',
        state: 'idle',
        speed: 160,
        walkFrame: 0,
        grade: 3,
      },
      1400,
      900,
      0.65,
    );
    expect(ctxOpening.clip).toHaveBeenCalled();
  });

  it('2. VR sınıfında 1 adet sergileme sehpası ve duvarda tam 3 adet boş askı bulunur; askılarda numara veya "Yakında" yazısı yoktur', () => {
    expect(DISCOVERY_CLASSROOM.wallMounts).toHaveLength(3);
    // Askılar arasındaki boşluk (96 px), sergilenen VR gözlüğünün genişliğine (~48 px) göre dengelidir
    expect(
      DISCOVERY_CLASSROOM.wallMounts[1].centerX - DISCOVERY_CLASSROOM.wallMounts[0].centerX,
    ).toBe(96);
    expect(
      DISCOVERY_CLASSROOM.wallMounts[2].centerX - DISCOVERY_CLASSROOM.wallMounts[1].centerX,
    ).toBe(96);

    const ctx = createMockCanvasContext();
    renderDiscoveryClassroomBackground(
      ctx,
      DISCOVERY_CLASSROOM.width,
      DISCOVERY_CLASSROOM.height,
    );

    const renderedTexts = (ctx.fillText as ReturnType<typeof vi.fn>).mock.calls.map(
      (call) => String(call[0]),
    );
    // Yalnızca çıkış kapısındaki "Avluya Çıkış [E]" metni çizilir; askılarda numara veya "Yakında" yazısı bulunmaz
    expect(renderedTexts).toEqual(['Avluya Çıkış [E]']);
    for (const txt of renderedTexts) {
      expect(txt).not.toMatch(/yakında|1|2|3|kilit/i);
    }
  });

  it('3. Öğrenci sehpanın içinden geçemez (çarpışma aktif), gözlüğe yaklaşabilir ve çıkış kapısına dönebilir', () => {
    const checkBlocked = (x: number, y: number) =>
      isPositionBlocked(
        x,
        y,
        DISCOVERY_CLASSROOM_OBSTACLES,
        DISCOVERY_CLASSROOM.width,
        DISCOVERY_CLASSROOM.height,
      );

    // Giriş noktası ve sehpanın hemen önü/yanları yürünebilirdir
    expect(
      checkBlocked(DISCOVERY_CLASSROOM.playerSpawn.x, DISCOVERY_CLASSROOM.playerSpawn.y),
    ).toBe(false);
    expect(checkBlocked(480, 326)).toBe(false);
    expect(checkBlocked(395, 290)).toBe(false);
    expect(checkBlocked(565, 290)).toBe(false);

    // Sehpanın içi çarpışma kutusuyla engellenmiştir
    expect(checkBlocked(480, 285)).toBe(true);
  });

  it('4. Avluda kapıya yaklaşınca "Hayalden Gerçeğe Sınıfına Gir" görünür, art arda basılması ikinci geçiş başlatmaz, çıkışta aynı binanın önünde doğar (2 kez tekrarlanır)', async () => {
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
          <WalkableCampusView initialScene="courtyard" />
        </CampusProviders>
      </MemoryRouter>,
    );

    for (let cycle = 1; cycle <= 2; cycle++) {
      const courtyardEngine = (
        window as unknown as { __WALKABLE_ENGINE__?: WalkableCanvasEngine }
      ).__WALKABLE_ENGINE__!;
      expect(courtyardEngine).toBeDefined();
      expect(document.querySelector('[data-scene]')?.getAttribute('data-scene')).toBe('courtyard');

      // Öğrenci Hayalden Gerçeğe binasının kapısına yaklaşır (290, 335)
      await act(async () => {
        courtyardEngine.setPosition({ x: 290, y: 335 });
        (courtyardEngine as unknown as { update: (delta: number) => void }).update(0.05);
      });

      expect(screen.getByText('Hayalden Gerçeğe Sınıfına Gir')).toBeInTheDocument();

      // Kapı açılırken art arda E tuşuna / etkileşime basılması ikinci bir geçiş başlatmamalı
      await act(async () => {
        courtyardEngine.triggerActiveInteraction();
        courtyardEngine.triggerActiveInteraction();
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }));
      });

      // Kapı açılma hareketi sırasında öğrenci kontrolü kilitlidir ve henüz sahne değişmemiştir
      expect(courtyardEngine.getInputDisabled()).toBe(true);
      expect(document.querySelector('[data-scene]')?.getAttribute('data-scene')).toBe('courtyard');

      // Kapı açılma süresi tamamlanınca VR sınıfına geçilir
      await act(async () => {
        vi.advanceTimersByTime(850);
      });
      expect(document.querySelector('[data-scene]')?.getAttribute('data-scene')).toBe(
        'discovery_classroom',
      );
      expect(screen.getByText('Hayalden Gerçeğe — VR Sınıfı')).toBeInTheDocument();

      const vrEngine = (
        window as unknown as { __WALKABLE_ENGINE__?: WalkableCanvasEngine }
      ).__WALKABLE_ENGINE__!;
      expect(vrEngine.getPosition()).toEqual(DISCOVERY_CLASSROOM.playerSpawn);

      // Çıkış kapısına yürüyüp (480, 590) E ile avluya dönülür
      await act(async () => {
        vrEngine.setPosition({ x: 480, y: 590 });
        (vrEngine as unknown as { update: (delta: number) => void }).update(0.05);
      });
      expect(screen.getAllByText('Avluya Dön').length).toBeGreaterThanOrEqual(2);

      await act(async () => {
        vrEngine.triggerActiveInteraction();
      });

      expect(document.querySelector('[data-scene]')?.getAttribute('data-scene')).toBe('courtyard');
      const returnedEngine = (
        window as unknown as { __WALKABLE_ENGINE__?: WalkableCanvasEngine }
      ).__WALKABLE_ENGINE__!;
      // Öğrenci dönüşte aynı binanın (Hayalden Gerçeğe: x=290, y=350) önünde belirir
      expect(returnedEngine.getPosition()).toEqual({ x: 290, y: 350 });
    }

    vi.useRealTimers();
  });
});
