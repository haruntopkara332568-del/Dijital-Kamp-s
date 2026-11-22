import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { CampusProviders } from '@/src/app/CampusProviders';
import { WalkableCampusView } from '@/src/features/walkable/WalkableCampusView';
import { WalkableCanvasEngine } from '@/src/features/walkable/engine/WalkableCanvasEngine';
import { SULTANHANI_SQUARE, renderSultanhaniEntities } from '@/src/features/walkable/engine/sultanhaniSceneRenderer';
import { CHARACTER_SCALES, drawTouristNpc } from '@/src/features/walkable/engine/characterRenderer';
import { isPositionBlocked } from '@/src/features/walkable/engine/pathfinding';
import {
  SULTANHANI_CARAVANSERAI_ASSET_URL,
  SULTANHANI_TOURIST_ATLAS_URL,
  clearCachedAssetForTesting,
  setCachedAssetForTesting,
  triggerAssetLoadErrorForTesting,
  getSultanhaniTouristAtlas,
} from '@/src/features/walkable/engine/assetLoader';
import { SULTANHANI_TOURIST_NPC } from '@/src/data/sultanhaniNpc';
import { NpcSpeechBubble } from '@/src/features/walkable/components/NpcSpeechBubble';
import { clearAllCampusData, saveStudentState, loadStudentState, createInitialStudentState } from '@/src/services/storage';
import type { WalkableSceneConfig } from '@/src/features/walkable/types';

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
    textAlign: 'left',
    textBaseline: 'top',
    measureText: vi.fn().mockReturnValue({ width: 50 }),
  } as unknown as CanvasRenderingContext2D;
}

describe('Sultanhanı Dış Meydan Turist NPC Doğrulaması', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await clearAllCampusData();
    clearCachedAssetForTesting(SULTANHANI_TOURIST_ATLAS_URL);
    const mockImg = { complete: true, naturalWidth: 560, naturalHeight: 720 } as unknown as HTMLImageElement;
    setCachedAssetForTesting(SULTANHANI_TOURIST_ATLAS_URL, mockImg);
    setCachedAssetForTesting(
      SULTANHANI_CARAVANSERAI_ASSET_URL,
      { complete: true, naturalWidth: 553, naturalHeight: 466 } as unknown as HTMLImageElement,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('1. NPC veri yapılandırması kuralları eksiksiz sağlar (id, boyut, konum, devriye, hız, eşik, metin)', () => {
    expect(SULTANHANI_TOURIST_NPC.id).toBe('turist-sultanhani');
    expect(SULTANHANI_TOURIST_NPC.scene).toBe('sultanhani_square');

    // Öğrenci boyutuyla aynı (%0 fark <= ±%10)
    expect(SULTANHANI_TOURIST_NPC.width).toBe(CHARACTER_SCALES.scale15.width);
    expect(SULTANHANI_TOURIST_NPC.height).toBe(CHARACTER_SCALES.scale15.height);

    // Başlangıç konumu yürünebilir alan içinde ve öğrenci doğuş noktasından en az 3 öğrenci boyu uzakta
    const distFromSpawn = Math.hypot(
      SULTANHANI_TOURIST_NPC.startPosition.x - SULTANHANI_SQUARE.spawn.x,
      SULTANHANI_TOURIST_NPC.startPosition.y - SULTANHANI_SQUARE.spawn.y,
    );
    expect(distFromSpawn).toBeGreaterThanOrEqual(CHARACTER_SCALES.scale15.height * 3);
    expect(
      isPositionBlocked(
        SULTANHANI_TOURIST_NPC.startPosition.x,
        SULTANHANI_TOURIST_NPC.startPosition.y,
        SULTANHANI_SQUARE.obstacles,
        SULTANHANI_SQUARE.width,
        SULTANHANI_SQUARE.height,
      ),
    ).toBe(false);

    // Yatay devriye <= ±2 öğrenci boyu ve uç noktalar engellere çarpmaz
    expect(SULTANHANI_TOURIST_NPC.startPosition.x - SULTANHANI_TOURIST_NPC.patrol.minX).toBeLessThanOrEqual(
      CHARACTER_SCALES.scale15.height * 2,
    );
    expect(SULTANHANI_TOURIST_NPC.patrol.maxX - SULTANHANI_TOURIST_NPC.startPosition.x).toBeLessThanOrEqual(
      CHARACTER_SCALES.scale15.height * 2,
    );
    expect(
      isPositionBlocked(
        SULTANHANI_TOURIST_NPC.patrol.minX,
        SULTANHANI_TOURIST_NPC.startPosition.y,
        SULTANHANI_SQUARE.obstacles,
        SULTANHANI_SQUARE.width,
        SULTANHANI_SQUARE.height,
      ),
    ).toBe(false);
    expect(
      isPositionBlocked(
        SULTANHANI_TOURIST_NPC.patrol.maxX,
        SULTANHANI_TOURIST_NPC.startPosition.y,
        SULTANHANI_SQUARE.obstacles,
        SULTANHANI_SQUARE.width,
        SULTANHANI_SQUARE.height,
      ),
    ).toBe(false);

    // Hız öğrenci hızının yarısı (160 * 0.5 = 80), bekleme 1.5-2 sn, cooldown 10 sn
    expect(SULTANHANI_TOURIST_NPC.speed).toBe(80);
    expect(SULTANHANI_TOURIST_NPC.patrol.endpointPauseMs).toBeGreaterThanOrEqual(1500);
    expect(SULTANHANI_TOURIST_NPC.patrol.endpointPauseMs).toBeLessThanOrEqual(2000);
    expect(SULTANHANI_TOURIST_NPC.interactionEnterRadius).toBe(
      Math.round(CHARACTER_SCALES.scale15.height * 1.5),
    );
    expect(SULTANHANI_TOURIST_NPC.interactionExitRadius).toBe(
      Math.round(CHARACTER_SCALES.scale15.height * 2.0),
    );
    expect(SULTANHANI_TOURIST_NPC.cooldownMs).toBe(10_000);

    // Onaylı 4 cümlelik metin
    expect(SULTANHANI_TOURIST_NPC.dialogueLines).toEqual([
      'Merhaba! Ben bu güzel şehri gezmeye gelen bir turistim.',
      'Burası Sultanhanı Kervansarayı. Selçuklular döneminde yapılmış, çok büyük ve görkemli bir yapı.',
      'Eskiden yolcular ve tüccarlar burada dinlenir, hayvanlarını ve eşyalarını güvende tutardı.',
      'İstersen kapıdan içeri girip çevreyi keşfedebilirsin!',
    ]);
  });

  it('2. Devriye döngüsü: sol uç -> bekle (1.75 sn) -> sağ uç -> bekle çalışır ve taşma yapmaz', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    vi.spyOn(canvas, 'getContext').mockReturnValue(createMockCanvasContext());

    const config: WalkableSceneConfig = {
      width: SULTANHANI_SQUARE.width,
      height: SULTANHANI_SQUARE.height,
      playerSpawn: SULTANHANI_SQUARE.spawn,
      obstacles: SULTANHANI_SQUARE.obstacles,
      interactiveZones: [],
      npc: SULTANHANI_TOURIST_NPC,
      isNpcVisible: () => true,
    };

    const engine = new WalkableCanvasEngine(canvas, config, { onActiveZoneChange: vi.fn() });
    expect(engine.npc).not.toBeNull();
    expect(engine.npc!.x).toBe(SULTANHANI_TOURIST_NPC.startPosition.x);

    const step = (dt: number) =>
      (engine as unknown as { update: (delta: number) => void }).update(dt);

    // Sola doğru yürüyüş -> minX ucuna ulaşmalı
    for (let i = 0; i < 20; i++) step(0.1);
    expect(engine.npc!.x).toBe(SULTANHANI_TOURIST_NPC.patrol.minX);
    expect(engine.npc!.state).toBe('idle');
    expect(engine.npc!.direction).toBe('left');

    // 1.75 sn bekleme süresinin bir kısmı (1.0 sn) -> halen sabit beklemeli
    for (let i = 0; i < 10; i++) step(0.1);
    expect(engine.npc!.x).toBe(SULTANHANI_TOURIST_NPC.patrol.minX);
    expect(engine.npc!.state).toBe('idle');

    // Bekleme tamamlanınca (+0.9 sn) sağa dönüp yürümeye başlamalı
    for (let i = 0; i < 10; i++) step(0.1);
    expect(engine.npc!.x).toBeGreaterThan(SULTANHANI_TOURIST_NPC.patrol.minX);
    expect(engine.npc!.direction).toBe('right');
    expect(engine.npc!.state).toBe('walk');

    // Sağ uca (maxX) kadar yürüyüp orada durmalı
    for (let i = 0; i < 30; i++) step(0.1);
    expect(engine.npc!.x).toBe(SULTANHANI_TOURIST_NPC.patrol.maxX);
    expect(engine.npc!.state).toBe('idle');

    engine.destroy();
  });

  it('3. Histerezis eşiği (1.5 giriş / 2.0 çıkış) ve konuşma sırasında durup öğrenciye dönme çalışır', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    vi.spyOn(canvas, 'getContext').mockReturnValue(createMockCanvasContext());

    const onNpcProximityChange = vi.fn();
    const config: WalkableSceneConfig = {
      width: SULTANHANI_SQUARE.width,
      height: SULTANHANI_SQUARE.height,
      playerSpawn: SULTANHANI_SQUARE.spawn,
      obstacles: SULTANHANI_SQUARE.obstacles,
      interactiveZones: [],
      npc: SULTANHANI_TOURIST_NPC,
      isNpcVisible: () => true,
    };

    const engine = new WalkableCanvasEngine(canvas, config, {
      onActiveZoneChange: vi.fn(),
      onNpcProximityChange,
    });
    const step = (dt: number) =>
      (engine as unknown as { update: (delta: number) => void }).update(dt);

    // 115 px mesafede (1.5 < d < 2.0) iken henüz açılmamalı
    engine.player.x = engine.npc!.x - 115;
    engine.player.y = engine.npc!.y;
    step(0.05);
    expect(onNpcProximityChange).not.toHaveBeenCalledWith(expect.objectContaining({ inRange: true }));

    // 90 px mesafeye (<= 101 px) girince açılmalı
    engine.player.x = engine.npc!.x - 90;
    step(0.05);
    expect(onNpcProximityChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ inRange: true }),
    );

    // Konuşma aktifleşince NPC durur ve öğrenciye (sola) döner
    engine.setNpcTalking(true);
    const frozenX = engine.npc!.x;
    step(0.5);
    expect(engine.npc!.x).toBe(frozenX);
    expect(engine.npc!.state).toBe('idle');
    expect(engine.npc!.direction).toBe('left');

    // Öğrenci 120 px mesafeye (1.5 < 120 <= 2.0) çekilse bile titreme olmaz, açık kalır
    engine.player.x = engine.npc!.x - 120;
    step(0.05);
    expect(onNpcProximityChange).not.toHaveBeenLastCalledWith(
      expect.objectContaining({ inRange: false }),
    );

    // 145 px (> 134 px = 2.0 boy) dışına çıkınca kapanır
    engine.player.x = engine.npc!.x - 145;
    step(0.05);
    expect(onNpcProximityChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ inRange: false }),
    );

    // Konuşma bitince devriye kaldığı yerden devam eder
    engine.setNpcTalking(false);
    step(0.5);
    expect(engine.npc!.x).not.toBe(frozenX);

    engine.destroy();
  });

  it('4. Konuşma balonu (NpcSpeechBubble) dokunma, fare ve klavye (Enter/Boşluk) ile ilerler ve kapanır', () => {
    const onAdvance = vi.fn();
    const { rerender } = render(
      <NpcSpeechBubble
        isOpen={true}
        speakerName="Turist"
        lines={SULTANHANI_TOURIST_NPC.dialogueLines}
        currentIndex={0}
        anchorPos={{ x: 640, y: 360 }}
        onAdvance={onAdvance}
      />,
    );

    expect(
      screen.getByText('Merhaba! Ben bu güzel şehri gezmeye gelen bir turistim.'),
    ).toBeInTheDocument();
    const continueBtn = screen.getByRole('button', { name: 'Devam' });
    expect(continueBtn.className).toContain('min-h-[44px]');

    // Fare/dokunma ile ilerle
    fireEvent.click(continueBtn);
    expect(onAdvance).toHaveBeenCalledTimes(1);

    // Enter ve Boşluk ile ilerle
    fireEvent.keyDown(window, { key: 'Enter' });
    fireEvent.keyDown(window, { key: ' ' });
    expect(onAdvance).toHaveBeenCalledTimes(3);

    // Son cümlede "Tamam" düğmesi görünür
    rerender(
      <NpcSpeechBubble
        isOpen={true}
        speakerName="Turist"
        lines={SULTANHANI_TOURIST_NPC.dialogueLines}
        currentIndex={3}
        anchorPos={{ x: 640, y: 360 }}
        onAdvance={onAdvance}
      />,
    );
    expect(
      screen.getByText('İstersen kapıdan içeri girip çevreyi keşfedebilirsin!'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tamam' })).toBeInTheDocument();
  });

  it('5. prefers-reduced-motion açıkken NPC sabit durur ama konuşma çalışmaya devam eder', () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    vi.spyOn(canvas, 'getContext').mockReturnValue(createMockCanvasContext());

    const onNpcProximityChange = vi.fn();
    const engine = new WalkableCanvasEngine(
      canvas,
      {
        width: SULTANHANI_SQUARE.width,
        height: SULTANHANI_SQUARE.height,
        playerSpawn: SULTANHANI_SQUARE.spawn,
        obstacles: SULTANHANI_SQUARE.obstacles,
        interactiveZones: [],
        npc: SULTANHANI_TOURIST_NPC,
        isNpcVisible: () => true,
      },
      { onActiveZoneChange: vi.fn(), onNpcProximityChange },
    );

    const step = (dt: number) =>
      (engine as unknown as { update: (delta: number) => void }).update(dt);

    const initialX = engine.npc!.x;
    for (let i = 0; i < 10; i++) step(0.1);
    expect(engine.npc!.x).toBe(initialX);
    expect(engine.npc!.state).toBe('idle');

    // Yaklaşınca konuşma yine tetiklenir
    engine.player.x = engine.npc!.x - 60;
    engine.player.y = engine.npc!.y;
    step(0.05);
    expect(onNpcProximityChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ inRange: true }),
    );

    engine.destroy();
    window.matchMedia = originalMatchMedia;
  });

  it('6. Görsel yüklenemezse NPC sessizce gizlenir, konsola tek uyarı yazılır ve sahne bozulmadan çalışır', () => {
    clearCachedAssetForTesting(SULTANHANI_TOURIST_ATLAS_URL);
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    triggerAssetLoadErrorForTesting(SULTANHANI_TOURIST_ATLAS_URL);
    triggerAssetLoadErrorForTesting(SULTANHANI_TOURIST_ATLAS_URL);

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(getSultanhaniTouristAtlas()).toBeNull();

    const mockCtx = createMockCanvasContext();
    renderSultanhaniEntities(
      mockCtx,
      {
        x: 625,
        y: 760,
        width: 22,
        height: 28,
        direction: 'up',
        state: 'idle',
        speed: 160,
        walkFrame: 0,
        grade: 3,
      },
      {
        id: SULTANHANI_TOURIST_NPC.id,
        name: SULTANHANI_TOURIST_NPC.name,
        x: 880,
        y: 645,
        width: 53,
        height: 67,
        direction: 'left',
        state: 'idle',
        speed: 80,
        walkFrame: 0,
        visible: false,
      },
    );

    // drawTouristNpc atlas yokken hiçbir görsel çizmez
    drawTouristNpc(mockCtx, {
      id: SULTANHANI_TOURIST_NPC.id,
      name: SULTANHANI_TOURIST_NPC.name,
      x: 880,
      y: 645,
      width: 53,
      height: 67,
      direction: 'left',
      state: 'idle',
      speed: 80,
      walkFrame: 0,
      visible: true,
    });
    expect(mockCtx.drawImage).not.toHaveBeenCalled();
  });

  it('7. WalkableCampusView entegrasyonu: yaklaşma -> konuşma -> uzaklaşınca kapanma -> 10 sn cooldown -> yeniden çıkış/girişte tek NPC', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-22T17:00:00Z'));

    const st = createInitialStudentState();
    st.selectedGrade = 3;
    saveStudentState(st);

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(createMockCanvasContext());
    HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
      left: 0,
      top: 0,
      width: 1280,
      height: 720,
    });

    const { unmount } = render(
      <MemoryRouter initialEntries={['/']}>
        <CampusProviders>
          <WalkableCampusView initialScene="sultanhani_square" />
        </CampusProviders>
      </MemoryRouter>,
    );

    const engine = (window as unknown as { __WALKABLE_ENGINE__?: WalkableCanvasEngine })
      .__WALKABLE_ENGINE__!;
    expect(engine).toBeDefined();
    expect(engine.npc?.id).toBe('turist-sultanhani');

    // Yaklaşma -> konuşma balonu açılır
    await act(async () => {
      engine.setPosition({ x: engine.npc!.x - 80, y: engine.npc!.y });
      (engine as unknown as { update: (delta: number) => void }).update(0.05);
    });

    expect(screen.getByTestId('npc-speech-bubble')).toBeInTheDocument();
    expect(
      screen.getByText('Merhaba! Ben bu güzel şehri gezmeye gelen bir turistim.'),
    ).toBeInTheDocument();

    // Diyalog bitmeden uzaklaşınca (x: 500 -> devriye alanından kesinlikle > 2.0 boy uzakta) balon kapanır
    await act(async () => {
      engine.setPosition({ x: 500, y: engine.npc!.y });
      (engine as unknown as { update: (delta: number) => void }).update(0.05);
    });
    expect(screen.queryByTestId('npc-speech-bubble')).not.toBeInTheDocument();

    // 10 sn geçmeden tekrar yaklaşırsa hemen açılmaz
    await act(async () => {
      vi.advanceTimersByTime(5000);
      engine.setPosition({ x: engine.npc!.x - 80, y: engine.npc!.y });
      (engine as unknown as { update: (delta: number) => void }).update(0.05);
    });
    expect(screen.queryByTestId('npc-speech-bubble')).not.toBeInTheDocument();

    // Uzaklaşıp 10 sn bekleme süresi geçtikten sonra yaklaşınca tekrar açılır
    await act(async () => {
      engine.setPosition({ x: 500, y: engine.npc!.y });
      (engine as unknown as { update: (delta: number) => void }).update(0.05);
      vi.advanceTimersByTime(6000);
      engine.setPosition({ x: engine.npc!.x - 80, y: engine.npc!.y });
      (engine as unknown as { update: (delta: number) => void }).update(0.05);
    });
    expect(screen.getByTestId('npc-speech-bubble')).toBeInTheDocument();

    // 4 cümleyi tamamla (Devam x3 -> Tamam)
    for (let i = 0; i < 4; i++) {
      await act(async () => {
        fireEvent.keyDown(window, { key: 'Enter' });
      });
    }
    expect(screen.queryByTestId('npc-speech-bubble')).not.toBeInTheDocument();

    // Kayıtlı ilerleme şeması değişmeden korunur
    expect(loadStudentState().selectedGrade).toBe(3);

    // Sahneyi kapatıp tekrar girince tek NPC vardır
    unmount();
    render(
      <MemoryRouter initialEntries={['/']}>
        <CampusProviders>
          <WalkableCampusView initialScene="sultanhani_square" />
        </CampusProviders>
      </MemoryRouter>,
    );
    const engineReentered = (window as unknown as { __WALKABLE_ENGINE__?: WalkableCanvasEngine })
      .__WALKABLE_ENGINE__!;
    expect(engineReentered.npc?.id).toBe('turist-sultanhani');
    expect(screen.queryAllByTestId('npc-speech-bubble').length).toBeLessThanOrEqual(1);
  });
});
