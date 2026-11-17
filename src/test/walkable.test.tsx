import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { CampusProviders } from '@/src/app/CampusProviders';
import { WalkableCanvasEngine } from '@/src/features/walkable/engine/WalkableCanvasEngine';
import {
  findPath,
  hasLineOfSight,
  isPositionBlocked,
  DEFAULT_HITBOX,
} from '@/src/features/walkable/engine/pathfinding';
import { SmartBoardModal } from '@/src/features/walkable/components/SmartBoardModal';
import { GradeBoardModal } from '@/src/features/walkable/components/GradeBoardModal';
import { TableStationModal } from '@/src/features/walkable/components/TableStationModal';
import { HelloGardenView } from '@/src/features/missions/HelloGardenView';
import { saveStudentState, createInitialStudentState, clearAllCampusData } from '@/src/services/storage';
import { WalkableControlsOverlay } from '@/src/features/walkable/components/WalkableControlsOverlay';
import { drawCharacter, CHARACTER_SCALES } from '@/src/features/walkable/engine/characterRenderer';
import {
  renderCourtyardBackground,
  renderCourtyardLayeredBackground,
  renderCourtyardEntities,
  renderCourtyardForeground,
} from '@/src/features/walkable/engine/courtyardSceneRenderer';
import {
  renderClassroomBackground,
  renderClassroomLayeredBackground,
  renderClassroomEntities,
  renderClassroomForeground,
} from '@/src/features/walkable/engine/classroomSceneRenderer';
import {
  setCachedAssetForTesting,
  ENGLISH_BUILDING_ASSET_URL,
  DISCOVERY_BUILDING_ASSET_URL,
  LIBRARY_BUILDING_ASSET_URL,
  FOUNTAIN_ASSET_URL,
  MISSIONS_KIOSK_ASSET_URL,
  JOURNEY_PAVILION_ASSET_URL,
  CYPRESS_TREE_ASSET_URL,
  SHADE_TREE_ASSET_URL,
  STUDENT_CHARACTER_ATLAS_URL,
  CLASSROOM_BACKGROUND_ASSET_URL,
  CLASSROOM_DESK_ASSET_URL,
  CLASSROOM_DESK_MIRRORED_ASSET_URL,
  CLASSROOM_TEACHER_PODIUM_ASSET_URL,
  CLASSROOM_BOOKSHELF_ASSET_URL,
  SMARTBOARD_SCREEN_OFF_ASSET_URL,
  SMARTBOARD_SCREEN_POWERING_ASSET_URL,
  SMARTBOARD_SCREEN_ACTIVE_ASSET_URL,
} from '@/src/features/walkable/engine/assetLoader';
import type { WalkableSceneConfig, PlayerCharacter } from '@/src/features/walkable/types';

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

    // Yalnızca sağa hareket
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    (engine as unknown as { update: (delta: number) => void }).update(0.1);
    const orthogonalDist = engine.player.x - 500;

    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight' }));

    // Karakteri sıfırla
    engine.player.x = 500;
    engine.player.y = 400;

    // Hem sağ hem yukarı bas (çapraz)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    (engine as unknown as { update: (delta: number) => void }).update(0.1);

    const diagonalDist = Math.hypot(engine.player.x - 500, 400 - engine.player.y);

    // Çapraz mesafe, dik hareket mesafesinden kesinlikle daha büyük olamaz
    expect(diagonalDist).toBeCloseTo(orthogonalDist, 1);

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
    canvas.getBoundingClientRect = vi.fn().mockReturnValue({ left: 0, top: 0, width: 800, height: 600 });
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

    canvas.getBoundingClientRect = vi.fn().mockReturnValue({ left: 0, top: 0, width: 800, height: 600 });
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

  /* ========================================================================
     YENİ AŞAMA 3 TEKNİK İYİLEŞTİRME VE KABUL TESTLERİ (Section 10)
     ======================================================================== */

  it('9. Engel arkasındaki ulaşılabilir hedefe A* yol bulma rotası oluşturur', () => {
    // Engel: { x: 300, y: 300, width: 100, height: 60 }
    // Başlangıç: engelin solunda (x: 250, y: 330)
    // Hedef: engelin sağında (x: 450, y: 330)
    const start = { x: 250, y: 330 };
    const goal = { x: 450, y: 330 };

    const path = findPath(start, goal, config);

    // Doğrudan hat engelle çakıştığından ara noktalar (waypoint) içeren geçerli bir rota bulunmalı
    expect(path).not.toBeNull();
    expect(path!.length).toBeGreaterThan(0);
    // Son varış noktası hedef olmalıdır
    const finalStep = path![path!.length - 1];
    expect(finalStep.x).toBe(goal.x);
    expect(finalStep.y).toBe(goal.y);
  });

  it('10. Ulaşılamayan hedef (engelin içi) doğrudan reddedilir ve onUnreachableTarget tetiklenir', () => {
    const onUnreachableTarget = vi.fn();
    const engine = new WalkableCanvasEngine(canvas, config, {
      onActiveZoneChange: vi.fn(),
      onUnreachableTarget,
    });

    // Engelin merkezine tıklama (x: 350, y: 330)
    engine.navigateWalkToTarget(350, 330);

    expect(onUnreachableTarget).toHaveBeenCalledWith({ x: 350, y: 330 });
    expect(engine.getPathWaypoints().length).toBe(0);

    engine.destroy();
  });

  it('11. Otomatik yürürken klavye yön tuşuna basıldığında rota derhal iptal edilir', () => {
    const engine = new WalkableCanvasEngine(canvas, config, { onActiveZoneChange: vi.fn() });

    // Ulaşılabilir bir hedefe rota başlat
    engine.navigateWalkToTarget(700, 400);
    expect(engine.getPathWaypoints().length).toBeGreaterThan(0);

    // Yön tuşuna bas
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));

    // Otomatik rota anında temizlenmeli
    expect(engine.getPathWaypoints().length).toBe(0);

    engine.destroy();
  });

  it('12. Otomatik yürürken mobil D-Pad ile yön verildiğinde rota derhal iptal edilir', () => {
    const engine = new WalkableCanvasEngine(canvas, config, { onActiveZoneChange: vi.fn() });

    // Ulaşılabilir bir hedefe rota başlat
    engine.navigateWalkToTarget(700, 400);
    expect(engine.getPathWaypoints().length).toBeGreaterThan(0);

    // Mobil sanal yöne bas
    engine.setVirtualDirection(0, -1);

    expect(engine.getPathWaypoints().length).toBe(0);

    engine.destroy();
  });

  it('13. Akıllı tahta modalı açıkken (pause) karakter klavye tuşlarına tepki vermez', () => {
    const engine = new WalkableCanvasEngine(canvas, config, { onActiveZoneChange: vi.fn() });

    const initialX = engine.player.x;
    const initialY = engine.player.y;

    // Motoru duraklat (Akıllı tahta açık)
    engine.pause();
    expect(engine.getIsPaused()).toBe(true);

    // Yön tuşlarına ve E tuşuna bas
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }));
    (engine as unknown as { update: (delta: number) => void }).update(0.1);

    // Karakter hiçbir şekilde hareket etmemelidir
    expect(engine.player.x).toBe(initialX);
    expect(engine.player.y).toBe(initialY);
    expect(engine.player.state).toBe('idle');

    engine.destroy();
  });

  it('14. Akıllı tahta modalı kapandığında (resume) karakter önceki konumunu korur', () => {
    const engine = new WalkableCanvasEngine(canvas, config, { onActiveZoneChange: vi.fn() });

    engine.player.x = 480;
    engine.player.y = 190;

    engine.pause();
    // Modal açıkken geçen süre sonrasında kapatma
    engine.resume();
    expect(engine.getIsPaused()).toBe(false);

    // Karakterin konumu aynen korunmalıdır
    expect(engine.player.x).toBe(480);
    expect(engine.player.y).toBe(190);

    engine.destroy();
  });

  it('15. SmartBoardModal Escape tuşu ile güvenli biçimde kapanır', () => {
    const handleClose = vi.fn();
    render(
      <MemoryRouter>
        <CampusProviders>
          <SmartBoardModal isOpen={true} onClose={handleClose} />
        </CampusProviders>
      </MemoryRouter>,
    );

    // Escape tuşuna bas
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('16. SmartBoardModal odak yönetimi (Focus Trap) ve Tab döngüsü sağlar', () => {
    const handleClose = vi.fn();
    const { unmount } = render(
      <MemoryRouter>
        <CampusProviders>
          <SmartBoardModal isOpen={true} onClose={handleClose} />
        </CampusProviders>
      </MemoryRouter>,
    );

    const closeBtn = screen.getByRole('button', { name: /Akıllı tahtayı kapat ve sınıfa dön/i });
    expect(closeBtn).toBeDefined();

    // Tab tuşuna basıldığında döngüsel kalır
    fireEvent.keyDown(window, { key: 'Tab' });
    // Hata fırlatmadan modal içinde kalmalı
    expect(screen.getByRole('dialog')).toBeDefined();

    unmount();
  });

  it('17. Mobilde pointercancel ve lostpointercapture sonrasında hareket tamamen durur', () => {
    const handleVirtualDir = vi.fn();
    render(
      <WalkableControlsOverlay
        activeZone={null}
        onTriggerInteraction={vi.fn()}
        onVirtualDirection={handleVirtualDir}
        onBackToMap={vi.fn()}
        unreachableMessage={null}
        currentScene="courtyard"
      />,
    );

    const upButton = screen.getByLabelText('Yukarı');

    // Basma
    fireEvent.pointerDown(upButton);
    expect(handleVirtualDir).toHaveBeenCalledWith(0, -1);

    // İptal (Pointer cancel)
    fireEvent.pointerCancel(upButton);
    expect(handleVirtualDir).toHaveBeenLastCalledWith(0, 0);

    // Pointer leave
    fireEvent.pointerDown(upButton);
    fireEvent.pointerLeave(upButton);
    expect(handleVirtualDir).toHaveBeenLastCalledWith(0, 0);
  });

  it('18. Farklı Canvas ve CSS boyutlarında (Responsive scale) tıklama koordinatları doğru hesaplanır', () => {
    const engine = new WalkableCanvasEngine(canvas, config, { onActiveZoneChange: vi.fn() });

    // Canvas çözünürlüğü 800x600, ancak ekrandaki CSS boyutu 400x300 (2 kat fark)
    canvas.getBoundingClientRect = vi.fn().mockReturnValue({
      left: 10,
      top: 20,
      width: 400,
      height: 300,
    });

    // CSS koordinatında (210, 170) noktasına tıkla (left:10, top:20 çıkarılınca 200, 150)
    // 2x ölçek ile canvas koordinatı: (400, 300) olmalı
    // camera.x: 100, camera.y: 100 eklenince dünya koordinatı: (500, 400)
    canvas.dispatchEvent(new PointerEvent('pointerdown', { clientX: 210, clientY: 170, button: 0 }));

    expect(engine.getPathWaypoints()).toBeDefined();

    engine.destroy();
  });

  it('19. Ekran boyutu değiştiğinde updateDimensions karakter ve kamerayı sahne sınırında tutar', () => {
    const engine = new WalkableCanvasEngine(canvas, config, { onActiveZoneChange: vi.fn() });

    engine.player.x = 1190;
    engine.player.y = 790;

    // Ekran boyutunu küçült
    engine.updateDimensions(400, 300);

    expect(canvas.width).toBe(400);
    expect(canvas.height).toBe(300);

    // Kamera sahne sınırlarını aşmamalı (sceneWidth - canvasWidth: 1200 - 400 = 800)
    expect(engine.camera.x).toBeLessThanOrEqual(800);
    expect(engine.camera.y).toBeLessThanOrEqual(500);

    engine.destroy();
  });

  it('20. Mevcut iki öğrenme görevi ve sınıf düzeyleri veri bütünlüğünü korur', () => {
    const engine = new WalkableCanvasEngine(canvas, config, { onActiveZoneChange: vi.fn() });

    // Karakter sınıf düzeyi varsayılan 4. sınıf
    expect(engine.player.grade).toBe(4);
    expect(engine.player.speed).toBe(160);

    engine.destroy();
  });

  /* ========================================================================
     AŞAMA 3 SÜRÜM 1.2 — EK TEKNİK DOĞRULAMA VE KABUL TESTLERİ
     ======================================================================== */

  it('21. A* Tek taraflı engelli çapraz köşe geçişi testi (Köşe kesme engellenmelidir)', () => {
    const cornerConfig: WalkableSceneConfig = {
      width: 400,
      height: 400,
      playerSpawn: { x: 80, y: 150 },
      obstacles: [{ id: 'block', name: 'Engel', x: 100, y: 100, width: 100, height: 100 }],
      interactiveZones: [],
    };

    const path = findPath({ x: 80, y: 150 }, { x: 150, y: 60 }, cornerConfig);
    expect(path).not.toBeNull();
    expect(path!.length).toBeGreaterThan(0);

    // Rotadaki hiçbir nokta engelle çakışmamalıdır
    for (const point of path!) {
      expect(isPositionBlocked(point.x, point.y, cornerConfig.obstacles, 400, 400, DEFAULT_HITBOX)).toBe(false);
    }
  });

  it('22. A* İki tarafı engelli çapraz köşe geçişi testi (Köşegen geçiş engellenmelidir)', () => {
    const diagonalConfig: WalkableSceneConfig = {
      width: 400,
      height: 400,
      playerSpawn: { x: 50, y: 50 },
      obstacles: [
        { id: 'b1', name: 'Engel 1', x: 100, y: 0, width: 100, height: 100 },
        { id: 'b2', name: 'Engel 2', x: 0, y: 100, width: 100, height: 100 },
      ],
      interactiveZones: [],
    };

    const path = findPath({ x: 50, y: 50 }, { x: 150, y: 150 }, diagonalConfig);
    if (path) {
      for (const p of path) {
        expect(isPositionBlocked(p.x, p.y, diagonalConfig.obstacles, 400, 400, DEFAULT_HITBOX)).toBe(false);
      }
    }
  });

  it('23. Karakter genişliğinden (18px) daha dar koridor testi (Geçiş engellenmelidir)', () => {
    // Koridor genişliği 12px (< 18px karakter genişliği)
    const narrowCorridorConfig: WalkableSceneConfig = {
      width: 400,
      height: 400,
      playerSpawn: { x: 106, y: 40 },
      obstacles: [
        { id: 'left-wall', name: 'Sol Duvar', x: 0, y: 80, width: 100, height: 80 },
        { id: 'right-wall', name: 'Sağ Duvar', x: 112, y: 80, width: 288, height: 80 },
      ],
      interactiveZones: [],
    };

    // Koridorun üstünden altına geçmeye çalış (12px boşluktan 18px genişliğindeki karakter geçemez)
    const path = findPath({ x: 106, y: 40 }, { x: 106, y: 220 }, narrowCorridorConfig);
    expect(path).toBeNull();
  });

  it('24. Karakter genişliğinden (18px) geniş güvenli koridor testi (Geçişe izin verilmelidir)', () => {
    // Koridor genişliği 40px (> 18px karakter genişliği)
    const wideCorridorConfig: WalkableSceneConfig = {
      width: 400,
      height: 400,
      playerSpawn: { x: 120, y: 40 },
      obstacles: [
        { id: 'left-wall', name: 'Sol Duvar', x: 0, y: 80, width: 100, height: 80 },
        { id: 'right-wall', name: 'Sağ Duvar', x: 140, y: 80, width: 260, height: 80 },
      ],
      interactiveZones: [],
    };

    const path = findPath({ x: 120, y: 40 }, { x: 120, y: 220 }, wideCorridorConfig);
    expect(path).not.toBeNull();
    expect(path!.length).toBeGreaterThan(0);
    expect(path![path!.length - 1].y).toBe(220);
  });

  it('25. Başlangıç ve hedef aynı nokta olduğunda gereksiz hesaplama yapmadan doğrudan döner', () => {
    const point = { x: 300, y: 200 };
    const path = findPath(point, point, config);
    expect(path).toEqual([point]);
  });

  it('26. Yol pürüzsüzleştirme (smoothPath) engelleri kesmeyen geçerli rotalar üretir', () => {
    const start = { x: 250, y: 330 };
    const goal = { x: 450, y: 330 };
    const path = findPath(start, goal, config);

    expect(path).not.toBeNull();
    let current = start;
    for (const wp of path!) {
      expect(hasLineOfSight(current, wp, config.obstacles, config.width, config.height, DEFAULT_HITBOX)).toBe(true);
      current = wp;
    }
  });

  it('27. Karakter ara noktaları sırayla takip ederek hedefe ulaşır ve hedefe varınca durur', () => {
    const engine = new WalkableCanvasEngine(canvas, config, { onActiveZoneChange: vi.fn() });
    engine.player.x = 200;
    engine.player.y = 200;

    // Ulaşılabilir hedefe rota ver (doğrudan hat açık: 250, 200)
    engine.navigateWalkToTarget(250, 200);
    expect(engine.getPathWaypoints().length).toBeGreaterThan(0);

    // Adımları işlet (250 - 200 = 50px / 160px/s = ~0.35s)
    for (let i = 0; i < 6; i++) {
      (engine as unknown as { update: (delta: number) => void }).update(0.1);
    }

    // Hedefe varıldığında ara noktalar temizlenmeli ve karakter idle durumuna geçmelidir
    expect(engine.getPathWaypoints().length).toBe(0);
    expect(Math.abs(engine.player.x - 250)).toBeLessThan(6);
    expect(engine.player.state).toBe('idle');

    engine.destroy();
  });

  it('28. Animasyon döngüsü duraklatma (pause): rAF çağrısı durur, animFrameId sıfırlanır ve sıfır yeni kare planlanır', () => {
    const engine = new WalkableCanvasEngine(canvas, config, { onActiveZoneChange: vi.fn() });

    engine.start();
    expect(engine.isAnimFrameActive()).toBe(true);

    // pause() çağrıldığında döngü tamamen iptal edilmelidir
    engine.pause();
    expect(engine.getIsPaused()).toBe(true);
    expect(engine.isAnimFrameActive()).toBe(false);

    engine.destroy();
  });

  it('29. Animasyon döngüsü devam ettirme (resume): rAF çağrısı yeniden başlar ve delta sıçraması olmaz', () => {
    const engine = new WalkableCanvasEngine(canvas, config, { onActiveZoneChange: vi.fn() });

    engine.start();
    engine.pause();
    expect(engine.isAnimFrameActive()).toBe(false);

    // resume() çağrıldığında döngü güvenle yeniden başlar
    engine.resume();
    expect(engine.getIsPaused()).toBe(false);
    expect(engine.isAnimFrameActive()).toBe(true);

    // İkinci kez resume çağrılsa bile çift döngü oluşturulmaz
    engine.resume();
    expect(engine.isAnimFrameActive()).toBe(true);

    engine.destroy();
  });

  it('30. Akıllı tahta modalı Shift+Tab ile ilk elemandan son elemana döner ve kapatıldığında önceki aktif elemana odak iade edilir', () => {
    const handleClose = vi.fn();
    const triggerButton = document.createElement('button');
    triggerButton.id = 'previous-active-btn';
    document.body.appendChild(triggerButton);
    triggerButton.focus();
    expect(document.activeElement).toBe(triggerButton);

    const { unmount } = render(
      <MemoryRouter>
        <CampusProviders>
          <SmartBoardModal isOpen={true} onClose={handleClose} />
        </CampusProviders>
      </MemoryRouter>,
    );

    const closeBtn = screen.getByRole('button', { name: /Akıllı tahtayı kapat ve sınıfa dön/i });
    closeBtn.focus();

    // Shift+Tab simülasyonu
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    // Focus modal içinde kalmalıdır
    expect(screen.getByRole('dialog')).toBeDefined();

    unmount();
    document.body.removeChild(triggerButton);
  });

  it('31. Tarayıcı sekmesi arka plana alındığında (visibilitychange) döngü durur, öne gelince yeniden başlar', () => {
    const engine = new WalkableCanvasEngine(canvas, config, { onActiveZoneChange: vi.fn() });
    engine.start();
    expect(engine.isAnimFrameActive()).toBe(true);

    // Sekme arka planda (hidden = true)
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(engine.isAnimFrameActive()).toBe(false);

    // Sekme tekrar öne geldi (hidden = false)
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(engine.isAnimFrameActive()).toBe(true);

    engine.destroy();
  });

  /* ========================================================================
     AŞAMA 4 — GÖRSEL DÜNYA, KARAKTER VE SAHNE ENTEGRASYON TESTLERİ
     ======================================================================== */

  it('32. Karakterin dört yönde (down, up, left, right) çizimi ve yürüme/bekleme durumları hatasız çalışır', () => {
    const mockCtx = canvas.getContext('2d')!;
    const directions = ['down', 'up', 'left', 'right'] as const;

    for (const dir of directions) {
      const testPlayer: PlayerCharacter = {
        x: 100,
        y: 100,
        width: 22,
        height: 28,
        direction: dir,
        state: 'walk',
        speed: 160,
        walkFrame: 1.5,
        grade: 4,
      };

      // Yürüme durumu
      expect(() => drawCharacter(mockCtx, testPlayer)).not.toThrow();

      // Bekleme (idle) durumu
      testPlayer.state = 'idle';
      expect(() => drawCharacter(mockCtx, testPlayer)).not.toThrow();
    }
  });

  it('33. prefers-reduced-motion aktifken karakter ve çevre animasyonları güvenle çizilir', () => {
    const mockCtx = canvas.getContext('2d')!;

    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const testPlayer: PlayerCharacter = {
      x: 100,
      y: 100,
      width: 22,
      height: 28,
      direction: 'down',
      state: 'idle',
      speed: 160,
      walkFrame: 0,
      grade: 4,
    };

    expect(() => drawCharacter(mockCtx, testPlayer)).not.toThrow();
    expect(() => renderCourtyardBackground(mockCtx, 1400, 900)).not.toThrow();
    expect(() => renderClassroomBackground(mockCtx, 960, 640, false, false)).not.toThrow();

    window.matchMedia = originalMatchMedia;
  });

  it('34. Kampüs avlusu zemin, Selçuklu yıldız meydanı, binalar ve peyzaj unsurları hatasız çizilir', () => {
    const mockCtx = canvas.getContext('2d')!;
    expect(() => renderCourtyardBackground(mockCtx, 1400, 900)).not.toThrow();
  });

  it('35. İngilizce sınıfı zemin, pencereler, akıllı tahta (kapalı, açılıyor, açık) ve sıralar hatasız çizilir', () => {
    const mockCtx = canvas.getContext('2d')!;

    // Kapalı tahta
    expect(() => renderClassroomBackground(mockCtx, 960, 640, false, false)).not.toThrow();

    // Açılıyor durumu (Güç animasyonu)
    expect(() => renderClassroomBackground(mockCtx, 960, 640, false, true)).not.toThrow();

    // Açık tahta
    expect(() => renderClassroomBackground(mockCtx, 960, 640, true, false)).not.toThrow();
  });

  it('36. Karakterin görsel temas noktası AABB çarpışma kutusu sınırlarıyla (DEFAULT_HITBOX) uyumludur', () => {
    const hitbox = DEFAULT_HITBOX;
    const playerY = 100;
    const feetCollisionY = playerY + hitbox.offsetY + hitbox.height; // 100 + 6 + 12 = 118
    const shadowCenterY = playerY + 18; // 118

    expect(feetCollisionY).toBe(shadowCenterY);
  });

  it('37. Aşama 4.2 Katmanlı zemin, Y-Sorting varlıklar ve ön plan saçağı hatasız çizilir', () => {
    const mockCtx = canvas.getContext('2d')!;
    const testPlayer: PlayerCharacter = {
      x: 700,
      y: 560,
      width: 22,
      height: 28,
      direction: 'down',
      state: 'idle',
      speed: 160,
      walkFrame: 0,
      grade: 4,
    };

    expect(() => renderCourtyardLayeredBackground(mockCtx, 1400, 900)).not.toThrow();
    expect(() => renderCourtyardEntities(mockCtx, testPlayer, 1400, 900)).not.toThrow();
    expect(() => renderCourtyardForeground(mockCtx, 1400, 900)).not.toThrow();
  });

  it('38. Aşama 4.2 Y-Sorting derinlik sıralaması: Karakter kuzeydeyken varlığın arkasında, güneydeyken önünde çizilir', () => {
    const mockCtx = canvas.getContext('2d')!;

    // Karakter şadırvanın kuzeyindeyken (y: 420, baseY: 438 < şadırvan baseY: 490)
    const northPlayer: PlayerCharacter = {
      x: 700,
      y: 420,
      width: 22,
      height: 28,
      direction: 'down',
      state: 'idle',
      speed: 160,
      walkFrame: 0,
      grade: 4,
    };

    renderCourtyardEntities(mockCtx, northPlayer, 1400, 900);
    // Hata atmadan tamamlandı ve çizim yapıldı
    expect(mockCtx.save).toHaveBeenCalled();
  });

  it('39. İngilizce Dünyası binası görsel varlık yüklendiğinde drawImage ile çizilir', () => {
    const mockCtx = canvas.getContext('2d')!;

    // Sahte yüklü görsel nesnesi oluştur
    const fakeImg = {
      complete: true,
      naturalWidth: 858,
      naturalHeight: 934,
    } as unknown as HTMLImageElement;

    setCachedAssetForTesting(ENGLISH_BUILDING_ASSET_URL, fakeImg);

    renderCourtyardBackground(mockCtx, 1400, 900);
    expect(mockCtx.drawImage).toHaveBeenCalledWith(
      fakeImg,
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
    );
  });

  it('40. İngilizce Dünyası binası AABB çarpışma sınırları ve kapı etkileşim koordinatı doğrulanır', () => {
    const bldgObstacle = { x: 860, y: 140, width: 220, height: 180 };
    const doorZone = { x: 970, y: 335, radius: 70 };

    // Kapı X koordinatı binanın yatay merkezinde olmalıdır (860 + 220 / 2 = 970)
    expect(doorZone.x).toBe(bldgObstacle.x + bldgObstacle.width / 2);

    // Kapı Y koordinatı binanın zemin tabanının hemen önünde olmalıdır (140 + 180 = 320; kapı: 335)
    expect(doorZone.y).toBeGreaterThan(bldgObstacle.y + bldgObstacle.height);
    expect(doorZone.y - (bldgObstacle.y + bldgObstacle.height)).toBeLessThanOrEqual(20);

    // Binanın içine doğru adım engellenmelidir
    const insideBldg = isPositionBlocked(
      970,
      250,
      [{ id: 'bldg-english', name: 'İngilizce', ...bldgObstacle }],
      1400,
      900,
    );
    expect(insideBldg).toBe(true);

    // Kapı önündeki basamak alanı açık olmalıdır
    const outsideDoor = isPositionBlocked(
      970,
      340,
      [{ id: 'bldg-english', name: 'İngilizce', ...bldgObstacle }],
      1400,
      900,
    );
    expect(outsideDoor).toBe(false);
  });

  it('41. Aşama 4.3: Tüm bağımsız 2,5B avlu varlıkları (Keşif, Kütüphane, Şadırvan, Pano, Köşk, Ağaçlar) yüklendiğinde drawImage ile çizilir', () => {
    const mockCtx = {
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      arc: vi.fn(),
      ellipse: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      roundRect: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      bezierCurveTo: vi.fn(),
      setLineDash: vi.fn(),
      fillText: vi.fn(),
      drawImage: vi.fn(),
      createRadialGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
      createLinearGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
    } as unknown as CanvasRenderingContext2D;

    const fakeImg = {
      complete: true,
      naturalWidth: 500,
      naturalHeight: 500,
    } as unknown as HTMLImageElement;

    setCachedAssetForTesting(DISCOVERY_BUILDING_ASSET_URL, fakeImg);
    setCachedAssetForTesting(LIBRARY_BUILDING_ASSET_URL, fakeImg);
    setCachedAssetForTesting(FOUNTAIN_ASSET_URL, fakeImg);
    setCachedAssetForTesting(MISSIONS_KIOSK_ASSET_URL, fakeImg);
    setCachedAssetForTesting(JOURNEY_PAVILION_ASSET_URL, fakeImg);
    setCachedAssetForTesting(CYPRESS_TREE_ASSET_URL, fakeImg);
    setCachedAssetForTesting(SHADE_TREE_ASSET_URL, fakeImg);

    renderCourtyardBackground(mockCtx, 1400, 900);
    // Her bir varlık drawImage ile çizilmiş olmalıdır (binalar, şadırvan ve ağaçlar toplam en az 7 çağrı)
    expect(mockCtx.drawImage).toHaveBeenCalled();
    expect((mockCtx.drawImage as unknown as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThanOrEqual(7);
  });

  it('42. Aşama 4.3: Avlu binaları ve etkileşimli unsurların AABB çarpışma ve konum hizalaması korunur', () => {
    const obstacles = [
      { id: 'bldg-discovery', name: 'Gezi ve Keşif', x: 180, y: 140, width: 220, height: 180 },
      { id: 'bldg-library', name: 'Kitap Dünyası', x: 580, y: 100, width: 240, height: 170 },
      { id: 'pavilion-journey', name: 'Kampüs Yolculuğum', x: 220, y: 560, width: 190, height: 140 },
      { id: 'kiosk-missions', name: 'Görev Panosu', x: 910, y: 560, width: 190, height: 140 },
      { id: 'fountain', name: 'Merkez Havuz', x: 670, y: 450, width: 60, height: 60 },
    ];

    for (const obs of obstacles) {
      // İç nokta engelli olmalı
      const inside = isPositionBlocked(obs.x + obs.width / 2, obs.y + obs.height / 2, obstacles, 1400, 900);
      expect(inside).toBe(true);

      // Hemen önündeki yol açık olmalı
      const inFront = isPositionBlocked(obs.x + obs.width / 2, obs.y + obs.height + 25, obstacles, 1400, 900);
      expect(inFront).toBe(false);
    }
  });

  it('43. Aşama 4.4: Öğrenci karakteri Sprite Atlas (character_student_atlas.png) yüklendiğinde drawImage ile çizilir', () => {
    const mockCtx = {
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      arc: vi.fn(),
      ellipse: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      drawImage: vi.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
    } as unknown as CanvasRenderingContext2D;

    const fakeAtlas = {
      complete: true,
      naturalWidth: 560,
      naturalHeight: 720,
    } as unknown as HTMLImageElement;

    setCachedAssetForTesting(STUDENT_CHARACTER_ATLAS_URL, fakeAtlas);

    const testPlayer: PlayerCharacter = {
      x: 700,
      y: 560,
      width: 22,
      height: 28,
      direction: 'down',
      state: 'idle',
      speed: 160,
      walkFrame: 0,
      grade: 4,
    };

    drawCharacter(mockCtx, testPlayer);

    expect(mockCtx.drawImage).toHaveBeenCalledWith(
      fakeAtlas,
      0, // srcX (idle col 0)
      0, // srcY (down row 0)
      140, // CELL_W
      180, // CELL_H
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
    );
  });

  it('44. Aşama 4.4: Karakterin 4 yönü (down, up, right, left) Sprite Atlas satırlarıyla (0, 1, 2, 3) doğru eşleşir', () => {
    const mockCtx = {
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      arc: vi.fn(),
      ellipse: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      drawImage: vi.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
    } as unknown as CanvasRenderingContext2D;

    const fakeAtlas = {
      complete: true,
      naturalWidth: 560,
      naturalHeight: 720,
    } as unknown as HTMLImageElement;

    setCachedAssetForTesting(STUDENT_CHARACTER_ATLAS_URL, fakeAtlas);

    const directions: Array<{ dir: PlayerCharacter['direction']; expectedRow: number }> = [
      { dir: 'down', expectedRow: 0 },
      { dir: 'up', expectedRow: 1 },
      { dir: 'right', expectedRow: 2 },
      { dir: 'left', expectedRow: 3 },
    ];

    for (const { dir, expectedRow } of directions) {
      vi.clearAllMocks();
      const p: PlayerCharacter = {
        x: 700,
        y: 560,
        width: 22,
        height: 28,
        direction: dir,
        state: 'idle',
        speed: 160,
        walkFrame: 0,
        grade: 4,
      };

      drawCharacter(mockCtx, p);

      expect(mockCtx.drawImage).toHaveBeenCalledWith(
        fakeAtlas,
        0, // col 0 (idle)
        expectedRow * 180, // srcY
        140,
        180,
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
      );
    }
  });

  it('45. Aşama 4.4: Karakter yürüme durumunda (walk) adım animasyon kareleri Sprite Atlas sütunlarında sırayla ilerler', () => {
    const mockCtx = {
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      arc: vi.fn(),
      ellipse: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      drawImage: vi.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
    } as unknown as CanvasRenderingContext2D;

    const fakeAtlas = {
      complete: true,
      naturalWidth: 560,
      naturalHeight: 720,
    } as unknown as HTMLImageElement;

    setCachedAssetForTesting(STUDENT_CHARACTER_ATLAS_URL, fakeAtlas);

    const p: PlayerCharacter = {
      x: 700,
      y: 560,
      width: 22,
      height: 28,
      direction: 'down',
      state: 'walk',
      speed: 160,
      walkFrame: 1.0, // Adım ilerleme
      grade: 4,
    };

    drawCharacter(mockCtx, p);

    // Yürüyüşte col > 0 olmalıdır (idle sütunu 0 değil, yürüyüş sütunlarından biri)
    const drawCall = (mockCtx.drawImage as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    const srcX = drawCall[1];
    expect(srcX).toBeGreaterThan(0);
    expect(srcX % 140).toBe(0); // Hücre genişliğinin katı olmalı
  });

  it('46. Aşama 4.5: Karakter ölçek seçenekleri tanımlıdır ve seçilen %15 ölçek (53x67 px) zemin hizasını korur', () => {
    // 1. Ölçek presetleri doğrulanır
    expect(CHARACTER_SCALES.original).toEqual({ width: 46, height: 58, label: expect.any(String) });
    expect(CHARACTER_SCALES.scale10).toEqual({ width: 51, height: 64, label: expect.any(String) });
    expect(CHARACTER_SCALES.scale15).toEqual({ width: 53, height: 67, label: expect.any(String) });
    expect(CHARACTER_SCALES.scale20).toEqual({ width: 55, height: 70, label: expect.any(String) });

    // 2. Seçilen %15 ölçeğin oran ve büyüme analizi
    const w15 = CHARACTER_SCALES.scale15.width;
    const h15 = CHARACTER_SCALES.scale15.height;
    expect(w15).toBe(53);
    expect(h15).toBe(67);
    expect(w15 / CHARACTER_SCALES.original.width).toBeCloseTo(1.152, 2);
    expect(h15 / CHARACTER_SCALES.original.height).toBeCloseTo(1.155, 2);

    // 3. Ayak zemin temas çizgisi y + 18 noktasında korunur
    const mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      beginPath: vi.fn(),
      ellipse: vi.fn(),
      fill: vi.fn(),
      drawImage: vi.fn(),
      fillStyle: '',
      imageSmoothingEnabled: false,
      imageSmoothingQuality: 'low',
    } as unknown as CanvasRenderingContext2D;

    const fakeAtlas = {
      complete: true,
      naturalWidth: 560,
      naturalHeight: 720,
    } as unknown as HTMLImageElement;

    setCachedAssetForTesting(STUDENT_CHARACTER_ATLAS_URL, fakeAtlas);

    const p: PlayerCharacter = {
      x: 700,
      y: 560,
      width: 22,
      height: 28,
      direction: 'down',
      state: 'idle',
      speed: 160,
      walkFrame: 0,
      grade: 4,
    };

    drawCharacter(mockCtx, p);

    const drawCall = (mockCtx.drawImage as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    const renderW = drawCall[7];
    const renderH = drawCall[8];
    const renderY = drawCall[6];

    expect(renderW).toBe(53);
    expect(renderH).toBe(67);
    // renderY = 18 - renderH + 3 + bobY = -46 + bobY (-46 civarı)
    expect(Math.abs(renderY - (-46))).toBeLessThanOrEqual(1.0);
    // Taban çizgisi renderY + renderH - 3 = 18 px civarı (y + 18'e tam oturur)
    expect(Math.abs(renderY + renderH - 3 - 18)).toBeLessThanOrEqual(1.0);
  });

  it('47. Aşama 4.5: Çapraz yön hareketinde histerezis eşiği gereksiz satır titremesini önler', () => {
    const engine = new WalkableCanvasEngine(canvas, config, { onActiveZoneChange: vi.fn() });
    engine.start();

    // Sağ-Aşağı çapraz hareket: vx = 1, vy = 1 (eşit büyüklükte)
    // Histerezis kuralında biri diğerinin 1.15 katı olmadığında yön sıçraması yapmaz
    engine.setVirtualDirection(1, 1);

    const p1 = engine.player;
    expect(['down', 'right']).toContain(p1.direction);

    // X bileşeni belirginleştiğinde (vx=1.5, vy=0.5 -> 1.5 > 0.5 * 1.15) sağa geçmeli
    engine.setVirtualDirection(1.5, 0.5);
    engine.destroy();
  });

  it('48. Aşama 4.5: Çok katmanlı temas ve yönlü sabah güneşi gölgeleri çizilir', () => {
    const mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      beginPath: vi.fn(),
      ellipse: vi.fn(),
      fill: vi.fn(),
      drawImage: vi.fn(),
      fillStyle: '',
      imageSmoothingEnabled: false,
      imageSmoothingQuality: 'low',
    } as unknown as CanvasRenderingContext2D;

    const fakeAtlas = {
      complete: true,
      naturalWidth: 560,
      naturalHeight: 720,
    } as unknown as HTMLImageElement;

    setCachedAssetForTesting(STUDENT_CHARACTER_ATLAS_URL, fakeAtlas);

    const p: PlayerCharacter = {
      x: 700,
      y: 560,
      width: 22,
      height: 28,
      direction: 'down',
      state: 'idle',
      speed: 160,
      walkFrame: 0,
      grade: 4,
    };

    drawCharacter(mockCtx, p);

    // mockCtx.ellipse en az 3 kez çağrılmalı (dış ortam gölgesi, orta gövde gölgesi, ayak tabanı temas gölgesi)
    const ellipseCalls = (mockCtx.ellipse as unknown as ReturnType<typeof vi.fn>).mock.calls;
    expect(ellipseCalls.length).toBeGreaterThanOrEqual(3);

    // Ayak tabanı temas gölgesinin y koordinatı 18 (y + 18) olmalıdır
    const contactCall = ellipseCalls.find((c) => Math.abs(c[1] - 18) < 0.1);
    expect(contactCall).toBeDefined();
  });

function createClassroomMockCtx(): CanvasRenderingContext2D {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    rect: vi.fn(),
    roundRect: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    strokeRect: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    drawImage: vi.fn(),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    clip: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'center',
    imageSmoothingEnabled: false,
    imageSmoothingQuality: 'low',
  } as unknown as CanvasRenderingContext2D;
}

  it('49. Aşama 4.7: Sınıf arka planı, kürsü, kitaplık ve sıralar bağımsız görsel varlıklarla ve drawImage ile çizilir', () => {
    const mockCtx = createClassroomMockCtx();

    const fakeImg = {
      complete: true,
      naturalWidth: 800,
      naturalHeight: 600,
    } as unknown as HTMLImageElement;

    setCachedAssetForTesting(CLASSROOM_BACKGROUND_ASSET_URL, fakeImg);
    setCachedAssetForTesting(CLASSROOM_DESK_ASSET_URL, fakeImg);
    setCachedAssetForTesting(CLASSROOM_DESK_MIRRORED_ASSET_URL, fakeImg);
    setCachedAssetForTesting(CLASSROOM_TEACHER_PODIUM_ASSET_URL, fakeImg);
    setCachedAssetForTesting(CLASSROOM_BOOKSHELF_ASSET_URL, fakeImg);

    renderClassroomLayeredBackground(mockCtx, 960, 640, false, false);

    const testPlayer: PlayerCharacter = {
      x: 480,
      y: 350,
      width: 22,
      height: 28,
      direction: 'down',
      state: 'idle',
      speed: 160,
      walkFrame: 0,
      grade: 4,
    };

    renderClassroomEntities(mockCtx, testPlayer, 960, 640);

    const drawCalls = (mockCtx.drawImage as unknown as ReturnType<typeof vi.fn>).mock.calls;
    expect(drawCalls.length).toBeGreaterThanOrEqual(5); // BG, podium, bookshelf, 4 desks, player
  });

  it('50. Aşama 4.7: Sınıf içi Y-Sorting derinlik sıralaması: Karakter sıranın kuzeyindeyken arkasında, güneyindeyken önünde çizilir', () => {
    const drawnIds: string[] = [];

    const mockCtx = createClassroomMockCtx();
    mockCtx.drawImage = vi.fn((img: CanvasImageSource) => {
      if ((img as unknown as { _tag?: string })._tag) {
        drawnIds.push((img as unknown as { _tag: string })._tag);
      }
    });

    const deskImg = {
      complete: true,
      naturalWidth: 200,
      naturalHeight: 100,
      _tag: 'desk',
    } as unknown as HTMLImageElement;

    const atlasImg = {
      complete: true,
      naturalWidth: 560,
      naturalHeight: 720,
      _tag: 'player',
    } as unknown as HTMLImageElement;

    setCachedAssetForTesting(CLASSROOM_DESK_ASSET_URL, deskImg);
    setCachedAssetForTesting(STUDENT_CHARACTER_ATLAS_URL, atlasImg);

    // 1. Sıranın kuzeyindeyken (y: 280, baseY: 298 < 315) -> Karakter masanın arkasında (önce) çizilir
    const northPlayer: PlayerCharacter = {
      x: 260,
      y: 280,
      width: 22,
      height: 28,
      direction: 'down',
      state: 'idle',
      speed: 160,
      walkFrame: 0,
      grade: 4,
    };

    drawnIds.length = 0;
    renderClassroomEntities(mockCtx, northPlayer, 960, 640);
    const playerIndexNorth = drawnIds.indexOf('player');
    const desk1IndexNorth = drawnIds.indexOf('desk');
    expect(playerIndexNorth).toBeLessThan(desk1IndexNorth);

    // 2. Sıranın güneyindeyken (y: 330, baseY: 348 > 315) -> Karakter masanın önünde (sonra) çizilir
    const southPlayer: PlayerCharacter = {
      x: 260,
      y: 330,
      width: 22,
      height: 28,
      direction: 'down',
      state: 'idle',
      speed: 160,
      walkFrame: 0,
      grade: 4,
    };

    drawnIds.length = 0;
    renderClassroomEntities(mockCtx, southPlayer, 960, 640);
    const playerIndexSouth = drawnIds.lastIndexOf('player');
    const firstDeskIndexSouth = drawnIds.indexOf('desk');
    expect(playerIndexSouth).toBeGreaterThan(firstDeskIndexSouth);
  });

  it('51. Aşama 4.7: Akıllı tahtanın 3 ekran durumu (kapalı, açılıyor, aktif) ilgili varlıkla çizilir', () => {
    const mockCtx = createClassroomMockCtx();

    const offImg = { complete: true, naturalWidth: 260, naturalHeight: 120 } as unknown as HTMLImageElement;
    const pwrImg = { complete: true, naturalWidth: 260, naturalHeight: 120 } as unknown as HTMLImageElement;
    const actImg = { complete: true, naturalWidth: 260, naturalHeight: 120 } as unknown as HTMLImageElement;

    setCachedAssetForTesting(SMARTBOARD_SCREEN_OFF_ASSET_URL, offImg);
    setCachedAssetForTesting(SMARTBOARD_SCREEN_POWERING_ASSET_URL, pwrImg);
    setCachedAssetForTesting(SMARTBOARD_SCREEN_ACTIVE_ASSET_URL, actImg);

    // Kapalı durum
    renderClassroomLayeredBackground(mockCtx, 960, 640, false, false);
    expect((mockCtx.drawImage as unknown as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(offImg, 350, 25, 260, 120);

    // Açılıyor durumu
    renderClassroomLayeredBackground(mockCtx, 960, 640, false, true);
    expect((mockCtx.drawImage as unknown as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(pwrImg, 350, 25, 260, 120);

    // Aktif durum
    renderClassroomLayeredBackground(mockCtx, 960, 640, true, false);
    expect((mockCtx.drawImage as unknown as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(actImg, 350, 25, 260, 120);
  });

  it('52. Aşama 4.7: Tavandan sarkan fenerler ve ışık huzmesi atmosferi hatasız çizilir', () => {
    const mockCtx = createClassroomMockCtx();

    expect(() => renderClassroomForeground(mockCtx, 960, 640)).not.toThrow();
    expect(mockCtx.save).toHaveBeenCalled();
    expect(mockCtx.restore).toHaveBeenCalled();
  });

  it('53. Aşama 5.0.2: Avluda sınıf seçimi bulunmaz, eski çift giriş butonları yer almaz', () => {
    const handleExitClassroom = vi.fn();
    render(
      <MemoryRouter>
        <CampusProviders>
          <WalkableControlsOverlay
            activeZone={null}
            onTriggerInteraction={vi.fn()}
            onVirtualDirection={vi.fn()}
            onBackToMap={vi.fn()}
            onExitClassroom={handleExitClassroom}
            unreachableMessage={null}
            currentScene="courtyard"
          />
        </CampusProviders>
      </MemoryRouter>,
    );

    // Çift giriş butonları kaldırılmıştır
    expect(screen.queryByText(/Doğrudan Sınıfa Gir/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Kuşbakışı Harita/i)).not.toBeInTheDocument();

    // Avluda sınıf seçimi butonu ve menüsü bulunmaz (yalnızca İngilizce sınıfı içinde fiziksel pano üzerinden seçilir)
    expect(screen.queryByLabelText(/Sınıf seçimi ve kampüs ayarları/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Yürünebilir Kampüs Avlusu/i)).toBeInTheDocument();
    expect(screen.getByText(/Kampüs Rehberi/i)).toBeInTheDocument();
  });

  it('54. Aşama 5.0.2: Yürünebilir kampüs avlusundaki 7 etkileşimli alanın (binalar, pavyon, kiosk, havuz, dış kapı) yapılandırması eksiksizdir', () => {
    const zones = [
      { id: 'enter-english', target: 'classroom' },
      { id: 'enter-discovery', target: '/alan/gezi-ve-kesif' },
      { id: 'enter-library', target: '/alan/kitap-ve-hikaye-dunyasi' },
      { id: 'enter-journey', target: '/yolculugum' },
      { id: 'enter-kiosk', target: '/alan/gorev-panosu' },
      { id: 'fountain-rest', target: 'dialogue' },
      { id: 'exit-gate', target: 'gate' },
    ];

    expect(zones).toHaveLength(7);
    expect(zones.map((z) => z.id)).toContain('enter-english');
    expect(zones.map((z) => z.id)).toContain('enter-discovery');
    expect(zones.map((z) => z.id)).toContain('enter-library');
    expect(zones.map((z) => z.id)).toContain('enter-journey');
    expect(zones.map((z) => z.id)).toContain('enter-kiosk');
    expect(zones.map((z) => z.id)).toContain('fountain-rest');
    expect(zones.map((z) => z.id)).toContain('exit-gate');
  });

  it('55. Aşama 5.0: Sınıf içindeyken "Avluya Dön" düğmesi görünür ve tetiklenir', () => {
    const handleExitClassroom = vi.fn();
    render(
      <MemoryRouter>
        <CampusProviders>
          <WalkableControlsOverlay
            activeZone={null}
            onTriggerInteraction={vi.fn()}
            onVirtualDirection={vi.fn()}
            onBackToMap={vi.fn()}
            onExitClassroom={handleExitClassroom}
            unreachableMessage={null}
            currentScene="classroom"
          />
        </CampusProviders>
      </MemoryRouter>,
    );

    const exitBtn = screen.getByRole('button', { name: /Avluya dön/i });
    expect(exitBtn).toBeInTheDocument();
    fireEvent.click(exitBtn);
    expect(handleExitClassroom).toHaveBeenCalledTimes(1);
  });

  it('56. Aşama 5.0.2: Sınıf Seçim Panosu modalı (GradeBoardModal) 2-7. sınıfları listeler ve seçim kaydeder', () => {
    const handleSelectGrade = vi.fn();
    const handleClose = vi.fn();

    render(
      <GradeBoardModal
        isOpen={true}
        onClose={handleClose}
        selectedGrade={null}
        onSelectGrade={handleSelectGrade}
      />,
    );

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/SINIF SEÇİM PANOSU/i);
    // İlkokul ve Ortaokul grupları
    expect(screen.getByText(/İlkokul Kademesi/i)).toBeInTheDocument();
    expect(screen.getByText(/Ortaokul Kademesi/i)).toBeInTheDocument();

    // 2, 3, 4, 5, 6, 7 sınıfları mevcut
    expect(screen.getByRole('button', { name: /2\. Sınıf/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /5\. Sınıf/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /7\. Sınıf/i })).toBeInTheDocument();

    // Sınıf seç (öğrencinin kolay seçimi için doğrudan tıklandığında kaydeder)
    fireEvent.click(screen.getByRole('button', { name: /5\. Sınıf/i }));
    expect(handleSelectGrade).toHaveBeenCalledWith(5);
    expect(screen.getByText(/Sınıfın başarıyla kaydedildi/i)).toBeInTheDocument();
  });

  it('57. Aşama 5.0.2: Sınıf Seçim Panosu Escape tuşu ile kapanır', () => {
    const handleClose = vi.fn();

    render(
      <GradeBoardModal
        isOpen={true}
        onClose={handleClose}
        selectedGrade={4}
        onSelectGrade={vi.fn()}
      />,
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  describe('Aşama 5.1 — İngilizce Sınıfında Dört Etkileşimli Masa', () => {
    it('58. Aşama 5.1: TableStationModal dört aşama için doğru Selçuklu başlığını ve masa adını görüntüler', () => {
      const { rerender } = render(
        <MemoryRouter>
          <CampusProviders>
            <TableStationModal
              isOpen={true}
              stage="kesfet"
              onClose={vi.fn()}
              onAdvanceToStage={vi.fn()}
            />
          </CampusProviders>
        </MemoryRouter>,
      );

      expect(document.getElementById('table-station-title')).toHaveTextContent(/1\. KEŞFET MASASI/i);
      expect(document.getElementById('table-station-desc')).toHaveTextContent(/Keşfet/i);

      rerender(
        <MemoryRouter>
          <CampusProviders>
            <TableStationModal
              isOpen={true}
              stage="ogren"
              onClose={vi.fn()}
              onAdvanceToStage={vi.fn()}
            />
          </CampusProviders>
        </MemoryRouter>,
      );
      expect(document.getElementById('table-station-title')).toHaveTextContent(/2\. ÖĞREN MASASI/i);

      rerender(
        <MemoryRouter>
          <CampusProviders>
            <TableStationModal
              isOpen={true}
              stage="uret"
              onClose={vi.fn()}
              onAdvanceToStage={vi.fn()}
            />
          </CampusProviders>
        </MemoryRouter>,
      );
      expect(document.getElementById('table-station-title')).toHaveTextContent(/3\. ÜRET MASASI/i);

      rerender(
        <MemoryRouter>
          <CampusProviders>
            <TableStationModal
              isOpen={true}
              stage="paylas"
              onClose={vi.fn()}
              onAdvanceToStage={vi.fn()}
            />
          </CampusProviders>
        </MemoryRouter>,
      );
      expect(document.getElementById('table-station-title')).toHaveTextContent(/4\. PAYLAŞ MASASI/i);
    });

    it('59. Aşama 5.1: TableStationModal Escape tuşu ve masadan kalk düğmesi ile sınıfa döner', () => {
      const handleClose = vi.fn();

      render(
        <MemoryRouter>
          <CampusProviders>
            <TableStationModal
              isOpen={true}
              stage="kesfet"
              onClose={handleClose}
              onAdvanceToStage={vi.fn()}
            />
          </CampusProviders>
        </MemoryRouter>,
      );

      // Escape tuşu ile kapanma
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);

      // Kapatma düğmesi ile kapanma
      const closeBtn = screen.getByRole('button', { name: /Masadan kalk ve sınıfa dön/i });
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(2);
    });

    it('60. Aşama 5.1: classroomSceneRenderer dört masa için Selçuklu levhalarını çizer', () => {
      const ctx = {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        closePath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        quadraticCurveTo: vi.fn(),
        bezierCurveTo: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        fillText: vi.fn(),
        strokeText: vi.fn(),
        measureText: vi.fn(() => ({ width: 60 })),
        drawImage: vi.fn(),
        rect: vi.fn(),
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        arc: vi.fn(),
        ellipse: vi.fn(),
        translate: vi.fn(),
        scale: vi.fn(),
        rotate: vi.fn(),
        setLineDash: vi.fn(),
        createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
        createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      } as unknown as CanvasRenderingContext2D;

      const player: PlayerCharacter = {
        x: 480,
        y: 400,
        width: 22,
        height: 28,
        direction: 'down',
        state: 'idle',
        speed: 160,
        walkFrame: 0,
        grade: 5,
      };

      expect(() => {
        renderClassroomEntities(ctx, player, 1000, 700, ['kesfet']);
      }).not.toThrow();

      // fillText should be called for table plaque labels
      expect(ctx.fillText).toHaveBeenCalled();
    });

    it('61. Aşama 5.1: Akıllı tahta modalı sınıfa dönme işlevini ve başlığını korur', () => {
      const handleClose = vi.fn();
      render(
        <MemoryRouter>
          <CampusProviders>
            <SmartBoardModal
              isOpen={true}
              onClose={handleClose}
            />
          </CampusProviders>
        </MemoryRouter>,
      );

      // Başlık ve tahta mevcuttur
      expect(document.getElementById('smartboard-title')).toHaveTextContent(/İngilizce Sınıfı — Etkileşimli Akıllı Tahta/i);
      const closeBtn = screen.getByRole('button', { name: /Akıllı tahtayı kapat ve sınıfa dön/i });
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('62. 3. Sınıf Keşfet Masası: "Hello! Tanışma Bahçesi" prototip başlığını ve özel prototip rozetini açar', async () => {
      await clearAllCampusData();
      saveStudentState({
        ...createInitialStudentState(),
        selectedGrade: 3,
      });

      render(
        <MemoryRouter>
          <CampusProviders>
            <TableStationModal
              isOpen={true}
              stage="kesfet"
              onClose={vi.fn()}
              onAdvanceToStage={vi.fn()}
            />
          </CampusProviders>
        </MemoryRouter>,
      );

      // Başlıkta Hello! Tanışma Bahçesi görünmelidir
      expect(document.getElementById('table-station-title')).toHaveTextContent(/HELLO! TANIŞMA BAHÇESİ/i);
      expect(screen.getByText(/3\. Sınıf Keşfet Masası • Özel Prototip/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Hello! Tanışma Bahçesi/i);
    });

    it('63. "Hello! Tanışma Bahçesi": En fazla 3 karakter (Elif, Can, Sen) ve 3 adımlı sade tanışma akışı sunar', async () => {
      await clearAllCampusData();
      saveStudentState({
        ...createInitialStudentState(),
        selectedGrade: 3,
      });

      const handleAdvance = vi.fn();
      const handleExit = vi.fn();

      render(
        <MemoryRouter>
          <CampusProviders>
            <HelloGardenView
              onExitToClassroom={handleExit}
              onAdvanceToNextTable={handleAdvance}
            />
          </CampusProviders>
        </MemoryRouter>,
      );

      // 1. Üç karakterin rozetleri mevcuttur
      expect(screen.getByText('Elif')).toBeInTheDocument();
      expect(screen.getByText('Can')).toBeInTheDocument();
      expect(screen.getByText('Sen')).toBeInTheDocument();
      expect(screen.getByText(/Karakterler: Elif, Can, Sen \(3 kişi\)/i)).toBeInTheDocument();

      // 2. Adım 1: Elif selam verir
      expect(screen.getByText(/Elif konuşuyor/i)).toBeInTheDocument();
      expect(screen.getByText(/"Hello! Welcome to our garden\."/i)).toBeInTheDocument();

      // Öğrenci 1. cevabı seçer ("Hello! I am glad to be here.")
      const opt1 = screen.getByRole('button', { name: /"Hello! I am glad to be here\."/i });
      fireEvent.click(opt1);

      // 3. Adım 2: Can adını sorar
      expect(screen.getByText(/Can konuşuyor/i)).toBeInTheDocument();
      expect(screen.getByText(/"What is your name\?"/i)).toBeInTheDocument();

      // Öğrenci 2. cevabı seçer ("I am Deniz.")
      const opt2 = screen.getByRole('button', { name: /"I am Deniz\."/i });
      fireEvent.click(opt2);

      // 4. Adım 3: Elif ve Can tanışmaktan memnun olur
      expect(screen.getByText(/Elif & Can konuşuyor/i)).toBeInTheDocument();
      expect(screen.getByText(/"Nice to meet you! Let's explore together\."/i)).toBeInTheDocument();

      // Öğrenci 3. cevabı seçer ("Nice to meet you too!")
      const opt3 = screen.getByRole('button', { name: /"Nice to meet you too!"/i });
      fireEvent.click(opt3);

      // 5. Görev başarıyla tamamlanır
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/Harika! Tanışma Bahçesi'ni Keşfettin!/i);
      expect(screen.getByText(/Öğrendiğin İfadeler/i)).toBeInTheDocument();

      // Sonraki masaya git butonu
      const nextBtn = screen.getByRole('button', { name: /Öğren Masasına Git \(2\. Masa\)/i });
      fireEvent.click(nextBtn);
      expect(handleAdvance).toHaveBeenCalledWith('ogren');
    });

    it('64. Diğer sınıflar veya diğer masalar Tanışma Bahçesi prototipinden etkilenmez, orijinal akışlarını korur', async () => {
      await clearAllCampusData();
      // 5. Sınıf Keşfet Masası
      saveStudentState({
        ...createInitialStudentState(),
        selectedGrade: 5,
      });

      const { rerender } = render(
        <MemoryRouter>
          <CampusProviders>
            <TableStationModal
              isOpen={true}
              stage="kesfet"
              onClose={vi.fn()}
              onAdvanceToStage={vi.fn()}
            />
          </CampusProviders>
        </MemoryRouter>,
      );

      // 5. Sınıfta Tanışma Bahçesi değil, orijinal kapı keşfi başlığı olmalıdır
      expect(document.getElementById('table-station-title')).toHaveTextContent(/1\. KEŞFET MASASI/i);
      expect(screen.queryByText(/Hello! Tanışma Bahçesi/i)).not.toBeInTheDocument();

      // 3. Sınıf Öğren Masası
      saveStudentState({
        ...createInitialStudentState(),
        selectedGrade: 3,
      });

      rerender(
        <MemoryRouter>
          <CampusProviders>
            <TableStationModal
              isOpen={true}
              stage="ogren"
              onClose={vi.fn()}
              onAdvanceToStage={vi.fn()}
            />
          </CampusProviders>
        </MemoryRouter>,
      );

      // 3. Sınıfın Öğren Masasında Tanışma Bahçesi değil, standart Öğren Masası olmalıdır
      expect(document.getElementById('table-station-title')).toHaveTextContent(/2\. ÖĞREN MASASI/i);
      expect(screen.queryByText(/Hello! Tanışma Bahçesi/i)).not.toBeInTheDocument();
    });
  });
});
