import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { CampusProviders } from '@/src/app/CampusProviders';
import { WalkableCampusView } from '@/src/features/walkable/WalkableCampusView';
import { DISCOVERY_VR_CONFIG, STUDENT_HEIGHT_PX } from '@/src/data/discoveryCareerConfig';
import {
  MOON_SCENE,
  DISCOVERY_MOON_OBSTACLES,
  drawTargetMoonRock,
  drawDecorativeBoulders,
  drawAstronautPlayer,
  drawMoonDebugOverlay,
  renderDiscoveryMoonWalkableScene,
} from '@/src/features/walkable/engine/discoveryMoonSceneRenderer';
import type { WalkableCanvasEngine } from '@/src/features/walkable/engine/WalkableCanvasEngine';
import type { PlayerCharacter } from '@/src/features/walkable/types';

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

describe('Hayalden Gerçeğe — VR Ay Yüzeyinde Yürüme ve Kaya Örneği Parça 3 Doğrulaması', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(createMockCanvasContext());
    HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
      left: 0,
      top: 0,
      width: 1280,
      height: 720,
    });
  });

  describe('1. Dünya Ölçüleri ve Yapılandırma Doğrulaması (DISCOVERY_VR_CONFIG.part3Mission)', () => {
    const mission = DISCOVERY_VR_CONFIG.part3Mission;
    const astro = DISCOVERY_VR_CONFIG.astronautLanding;

    it('MOON_SCENE ölçüleri yapılandırmayla tam uyumlu olmalıdır', () => {
      expect(MOON_SCENE.width).toBe(mission.worldWidth);
      expect(MOON_SCENE.height).toBe(mission.worldHeight);
      expect(MOON_SCENE.horizonY).toBe(mission.horizonY);
    });

    it('Lander çıkışı ile hedef kaya arasındaki mesafe 8-10 AB aralığında olmalıdır', () => {
      const exitPos = astro.surfacePosition; // { x: 330, y: 405 }
      const rockPos = mission.targetRock;     // { x: 900, y: 440 }
      const dx = rockPos.x - exitPos.x;
      const dy = rockPos.y - exitPos.y;
      const distPx = Math.sqrt(dx * dx + dy * dy);
      const distAb = distPx / STUDENT_HEIGHT_PX;

      expect(distAb).toBeGreaterThanOrEqual(8.0);
      expect(distAb).toBeLessThanOrEqual(10.0);
    });

    it('Hedef kaya etkileşim giriş eşiği 1.5 AB ve çıkış eşiği 2.0 AB olmalıdır', () => {
      const enterRadius = mission.targetRock.interactionRadius;
      const exitRadius = mission.targetRock.exitRadius;

      expect(enterRadius).toBe(Math.round(STUDENT_HEIGHT_PX * 1.5));
      expect(exitRadius).toBe(Math.round(STUDENT_HEIGHT_PX * 2.0));
      expect(exitRadius).toBeGreaterThan(enterRadius);
    });

    it('Araç dönüş etkileşim giriş eşiği 1.5 AB ve çıkış eşiği 2.0 AB olmalıdır', () => {
      const enterRadius = mission.landerReturn.interactionRadius;
      const exitRadius = mission.landerReturn.exitRadius;

      expect(enterRadius).toBe(Math.round(STUDENT_HEIGHT_PX * 1.5));
      expect(exitRadius).toBe(Math.round(STUDENT_HEIGHT_PX * 2.0));
    });

    it('Araç ile kaya arasında en az 2 AB genişliğinde engelsiz bir yol koridoru bulunmalıdır', () => {
      // Araç (330, 405) ile Kaya (900, 440) arasındaki X aralığında bulunan kayalar yolun kuzey ve güneyindedir
      for (const b of mission.decorativeBoulders) {
        // Yol koridoru Y: 380 .. 500 aralığında engel olmamalıdır
        if (b.x > 330 && b.x < 900) {
          const isNorthOfPath = b.y + b.height < 380;
          const isSouthOfPath = b.y > 500;
          expect(isNorthOfPath || isSouthOfPath).toBe(true);
        }
      }
    });

    it('Görev yönergeleri ve metinleri eksiksiz tanımlanmış olmalıdır', () => {
      expect(mission.instructions.goToRock).toBe('İşaretli Ay kayasına yürü ve bir örnek al.');
      expect(mission.instructions.sampleTaken).toBe('Örneği aldın. Şimdi aracına dön.');
      expect(mission.instructions.complete).toBe('Ay yüzeyinden bir kaya örneği alıp aracına getirdin.');
      expect(mission.instructions.earlyLanderHint).toBe('Önce işaretli kayadan örnek al.');
    });
  });

  describe('2. Ay Sahnesi Çarpışma Engelleri (DISCOVERY_MOON_OBSTACLES)', () => {
    it('Lander gövdesi, hedef kaya, dekoratif kayalar ve sınır duvarları engellere dahil edilmelidir', () => {
      const obstacleIds = DISCOVERY_MOON_OBSTACLES.map((o) => o.id);
      expect(obstacleIds).toContain('moon-lander-obstacle');
      expect(obstacleIds).toContain('moon-target-rock-obstacle');
      expect(obstacleIds).toContain('moon-north-boundary');
      expect(obstacleIds).toContain('moon-south-boundary');
      expect(obstacleIds).toContain('moon-west-boundary');
      expect(obstacleIds).toContain('moon-east-boundary');

      // 5 dekoratif kaya
      for (let i = 1; i <= 5; i++) {
        expect(obstacleIds).toContain(`moon-boulder-${i}`);
      }
    });

    it('Astronotun iniş noktası ({ x: 330, y: 405 }) hiçbir engelin içinde kalmamalıdır', () => {
      const pos = DISCOVERY_VR_CONFIG.astronautLanding.surfacePosition;
      for (const obs of DISCOVERY_MOON_OBSTACLES) {
        const inside =
          pos.x >= obs.x &&
          pos.x <= obs.x + obs.width &&
          pos.y >= obs.y &&
          pos.y <= obs.y + obs.height;
        expect(inside).toBe(false);
      }
    });
  });

  describe('3. Çizim ve Render Fonksiyonları Doğrulaması', () => {
    it('drawTargetMoonRock örnek alınmadan ve alındıktan sonra hatasız çizilmelidir', () => {
      const ctx = createMockCanvasContext();
      const rock = DISCOVERY_VR_CONFIG.part3Mission.targetRock;

      // Örnek alınmamışken (işaretli, parlayan halka ile)
      drawTargetMoonRock(ctx, rock, false);
      expect(ctx.fill).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();

      // Örnek alındıktan sonra (işaretsiz, oyuklu)
      drawTargetMoonRock(ctx, rock, true);
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('drawDecorativeBoulders tüm kayaları çizmelidir', () => {
      const ctx = createMockCanvasContext();
      drawDecorativeBoulders(ctx, DISCOVERY_VR_CONFIG.part3Mission.decorativeBoulders);
      expect(ctx.save).toHaveBeenCalledTimes(5);
      expect(ctx.restore).toHaveBeenCalledTimes(5);
    });

    it('drawAstronautPlayer normal yürüme, sola dönüş ve örnek alma modlarında hatasız çizilmelidir', () => {
      const ctx = createMockCanvasContext();
      const dummyPlayer: PlayerCharacter = {
        x: 400,
        y: 420,
        width: 32,
        height: 67,
        direction: 'right',
        state: 'walk',
        speed: 120,
        walkFrame: 0.5,
        grade: 4,
      };

      // 1. Sağa yürüme
      drawAstronautPlayer(ctx, dummyPlayer, false);
      expect(ctx.translate).toHaveBeenCalled();

      // 2. Sola dönüş (yatay çevirme scale(-1, 1))
      const leftPlayer: PlayerCharacter = { ...dummyPlayer, direction: 'left' };
      drawAstronautPlayer(ctx, leftPlayer, false);
      expect(ctx.scale).toHaveBeenCalledWith(-1, 1);

      // 3. Örnek alma eğilme hareketi
      drawAstronautPlayer(ctx, dummyPlayer, true);
      expect(ctx.rotate).toHaveBeenCalled();
    });

    it('drawMoonDebugOverlay debug modunda hatasız çizilmelidir', () => {
      const originalSearch = window.location.search;
      window.history.pushState({}, '', '?debug=ay');
      try {
        const ctx = createMockCanvasContext();
        drawMoonDebugOverlay(ctx, { x: 400, y: 400 }, 'GO_TO_ROCK');
        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.restore).toHaveBeenCalled();
      } finally {
        window.history.pushState({}, '', originalSearch || '/');
      }
    });

    it('renderDiscoveryMoonWalkableScene tüm sahneyi tek seferde eksiksiz render almalıdır', () => {
      const ctx = createMockCanvasContext();
      const dummyPlayer: PlayerCharacter = {
        x: 500,
        y: 450,
        width: 32,
        height: 67,
        direction: 'down',
        state: 'idle',
        speed: 120,
        walkFrame: 0,
        grade: 4,
      };

      renderDiscoveryMoonWalkableScene(ctx, dummyPlayer, 'GO_TO_ROCK', false, false);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });
  });

  describe('4. Görev Akışı, Yönergeler ve Durum Makinesi Entegrasyonu', () => {
    it('Ay sahnesi açıldığında üstte yönerge çubuğu ve Gözlüğü Çıkar butonu görünmelidir', async () => {
      render(
        <MemoryRouter>
          <CampusProviders>
            <WalkableCampusView initialScene="discovery_moon" />
          </CampusProviders>
        </MemoryRouter>,
      );

      // İniş animasyonu atla
      const skipBtn = screen.getByText('Geç');
      expect(skipBtn).toBeInTheDocument();
      fireEvent.click(skipBtn);

      // Yönerge satırı görünmeli
      expect(
        screen.getByText('İşaretli Ay kayasına yürü ve bir örnek al.'),
      ).toBeInTheDocument();

      // "Gözlüğü Çıkar" butonu aktif olmalı
      const removeBtns = screen.getAllByRole('button', { name: /gözlüğü çıkar/i });
      expect(removeBtns.length).toBeGreaterThanOrEqual(1);
    });

    it('Örnek almadan araca yaklaşılınca "Görevi Tamamla" ÇIKMAMALI, ipucu görünmelidir', async () => {
      render(
        <MemoryRouter>
          <CampusProviders>
            <WalkableCampusView initialScene="discovery_moon" />
          </CampusProviders>
        </MemoryRouter>,
      );

      // İniş animasyonunu atla
      fireEvent.click(screen.getByText('Geç'));

      // "Görevi Tamamla" düğmesi kesinlikle bulunmamalı
      expect(screen.queryByText('Görevi Tamamla')).toBeNull();

      // Motor üzerindeki aktif bölgeyi araca taşı
      const engine = (window as unknown as { __WALKABLE_ENGINE__?: WalkableCanvasEngine }).__WALKABLE_ENGINE__;
      expect(engine).toBeDefined();
      if (!engine) throw new Error('Engine not found');

      act(() => {
        engine.setPosition({ x: 330, y: 405 });
      });

      // İpuçlu bölge promptu
      expect(screen.getByText('Önce işaretli kayadan örnek al.')).toBeInTheDocument();
    });

    it('Kayaya yaklaşıldığında "Kaya Örneği Al" çıkmalı, tıklanınca SAMPLE_TAKEN durumuna geçmelidir', async () => {
      vi.useFakeTimers();

      render(
        <MemoryRouter>
          <CampusProviders>
            <WalkableCampusView initialScene="discovery_moon" />
          </CampusProviders>
        </MemoryRouter>,
      );

      // İniş animasyonunu atla
      fireEvent.click(screen.getByText('Geç'));

      const engine = (window as unknown as { __WALKABLE_ENGINE__?: WalkableCanvasEngine }).__WALKABLE_ENGINE__;
      if (!engine) throw new Error('Engine not found');

      // Kayaya yaklaş
      act(() => {
        engine.setPosition({ x: 900, y: 440 });
      });

      // "Kaya Örneği Al" etkileşimi görünmeli
      expect(screen.getByText('Kaya Örneği Al')).toBeInTheDocument();

      // Etkileşimi başlat
      const interactBtn = screen.getByRole('button', { name: /etkileşimi başlat/i });
      fireEvent.click(interactBtn);

      // Örnek alma süresi (~1 sn)
      act(() => {
        vi.advanceTimersByTime(1100);
      });

      // Yeni yönerge belirmeli
      expect(screen.getByText('Örneği aldın. Şimdi aracına dön.')).toBeInTheDocument();

      vi.useRealTimers();
    });

    it('Örnek alındıktan sonra araca dönülünce "Görevi Tamamla" çıkmalı ve kutlama modalı açılmalıdır', async () => {
      vi.useFakeTimers();

      render(
        <MemoryRouter>
          <CampusProviders>
            <WalkableCampusView initialScene="discovery_moon" />
          </CampusProviders>
        </MemoryRouter>,
      );

      fireEvent.click(screen.getByText('Geç'));
      const engine = (window as unknown as { __WALKABLE_ENGINE__?: WalkableCanvasEngine }).__WALKABLE_ENGINE__;
      if (!engine) throw new Error('Engine not found');

      // 1. Kayaya git ve örnek al
      act(() => {
        engine.setPosition({ x: 900, y: 440 });
      });
      fireEvent.click(screen.getByRole('button', { name: /etkileşimi başlat/i }));
      act(() => {
        vi.advanceTimersByTime(1100);
      });

      // 2. Araca dön
      act(() => {
        engine.setPosition({ x: 330, y: 405 });
      });

      // Artık "Görevi Tamamla" görünmeli
      expect(screen.getByText('Görevi Tamamla')).toBeInTheDocument();

      // Tamamla butonuna bas
      fireEvent.click(screen.getByRole('button', { name: /etkileşimi başlat/i }));

      // Kutlama Modalı açılmalı
      expect(screen.getByText('Tebrikler! Ay Görevi Tamamlandı')).toBeInTheDocument();
      expect(
        screen.getAllByText('Ay yüzeyinden bir kaya örneği alıp aracına getirdin.').length,
      ).toBeGreaterThanOrEqual(1);

      vi.useRealTimers();
    });
  });
});
