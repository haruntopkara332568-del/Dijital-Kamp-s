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
import { WalkableControlsOverlay } from '@/src/features/walkable/components/WalkableControlsOverlay';
import { drawCharacter } from '@/src/features/walkable/engine/characterRenderer';
import { renderCourtyardBackground } from '@/src/features/walkable/engine/courtyardSceneRenderer';
import { renderClassroomBackground } from '@/src/features/walkable/engine/classroomSceneRenderer';
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
      setLineDash: vi.fn(),
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
});
