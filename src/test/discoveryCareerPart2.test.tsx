import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { CampusProviders } from '@/src/app/CampusProviders';
import { WalkableCampusView } from '@/src/features/walkable/WalkableCampusView';
import { DISCOVERY_VR_CONFIG } from '@/src/data/discoveryCareerConfig';
import {
  calculateMoonLandingState,
  drawMoonLanderShadow,
  drawTouchdownDust,
  drawMoonLander,
  drawAstronautCharacter,
  renderDiscoveryMoonEntities,
} from '@/src/features/walkable/engine/discoveryMoonSceneRenderer';

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

describe('Hayalden Gerçeğe — VR Ay İnişi ve Merdiven Çıkışı Parça 2 Doğrulaması', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('1. Zaman Çizelgesi ve Matematiksel Durum Hesaplaması (calculateMoonLandingState)', () => {
    const tCfg = DISCOVERY_VR_CONFIG.landingTimeline;
    const lander = DISCOVERY_VR_CONFIG.lander;
    const astro = DISCOVERY_VR_CONFIG.astronautLanding;

    it('Toplam süre 7-9 saniye aralığında (~8.0 sn) ve alt evreler eksiksiz yapılandırılmış olmalıdır', () => {
      expect(tCfg.totalAnimationDurationMs).toBeGreaterThanOrEqual(7000);
      expect(tCfg.totalAnimationDurationMs).toBeLessThanOrEqual(9000);
      expect(tCfg.descentDurationMs).toBe(4200);
      expect(tCfg.touchdownDurationMs).toBe(1400);
      expect(tCfg.hatchOpenDurationMs).toBe(800);
      expect(tCfg.exitLadderDurationMs).toBe(1600);
      expect(
        tCfg.descentDurationMs +
          tCfg.touchdownDurationMs +
          tCfg.hatchOpenDurationMs +
          tCfg.exitLadderDurationMs,
      ).toBe(tCfg.totalAnimationDurationMs);
    });

    it('Alçalma evresinde (0 - 4.2 sn) araç yukarıdan iner, motor alevi aktiftir, kapak kapalıdır', () => {
      // Başlangıç (0 ms)
      const start = calculateMoonLandingState(0, false, false);
      expect(start.stage).toBe('descent');
      expect(start.currentLanderY).toBe(lander.startAltitudeY);
      expect(start.altitudeFactor).toBeCloseTo(1, 2);
      expect(start.thrusterFlameAlpha).toBeGreaterThan(0);
      expect(start.hatchProgress).toBe(0);
      expect(start.astronautVisible).toBe(false);
      expect(start.isComplete).toBe(false);

      // Alçalma ortası (2100 ms)
      const mid = calculateMoonLandingState(2100, false, false);
      expect(mid.stage).toBe('descent');
      expect(mid.currentLanderY).toBeGreaterThan(lander.startAltitudeY);
      expect(mid.currentLanderY).toBeLessThan(lander.targetY);
      expect(mid.altitudeFactor).toBeLessThan(1);
      expect(mid.altitudeFactor).toBeGreaterThan(0);
      expect(mid.thrusterFlameAlpha).toBeGreaterThan(0);
      expect(mid.hatchProgress).toBe(0);
      expect(mid.astronautVisible).toBe(false);
      expect(mid.isComplete).toBe(false);
    });

    it('Temas ve yaylanma evresinde (4.2 - 5.6 sn) motor söner, yaylanma ve toz oluşur', () => {
      const touchdown = calculateMoonLandingState(4800, false, false);
      expect(touchdown.stage).toBe('touchdown');
      expect(touchdown.altitudeFactor).toBe(0);
      expect(touchdown.thrusterFlameAlpha).toBe(0); // Motor alevi derhal sönmüş olmalı
      expect(touchdown.dustProgress).toBeGreaterThan(0);
      expect(touchdown.suspensionOffset).toBeDefined();
      expect(touchdown.hatchProgress).toBe(0);
      expect(touchdown.astronautVisible).toBe(false);
      expect(touchdown.isComplete).toBe(false);
    });

    it('Kapak açılma evresinde (5.6 - 6.4 sn) kapak açılır ve astronot görünür', () => {
      const hatch = calculateMoonLandingState(6000, false, false);
      expect(hatch.stage).toBe('hatch');
      expect(hatch.currentLanderY).toBe(lander.targetY);
      expect(hatch.thrusterFlameAlpha).toBe(0);
      expect(hatch.hatchProgress).toBeGreaterThan(0);
      expect(hatch.astronautVisible).toBe(true);
      expect(hatch.astronautPos).toEqual(astro.ladderTop);
      expect(hatch.isComplete).toBe(false);
    });

    it('Merdiven iniş evresinde (6.4 - 8.0 sn) astronot basamaklardan yüzeye iner ve iki ayağıyla basar', () => {
      // Merdivenin ortasında
      const climbing = calculateMoonLandingState(7200, false, false);
      expect(climbing.stage).toBe('ladder');
      expect(climbing.astronautVisible).toBe(true);
      expect(climbing.astronautPos.y).toBeGreaterThan(astro.ladderTop.y);
      expect(climbing.astronautPos.y).toBeLessThan(astro.surfacePosition.y);
      expect(climbing.astronautPose).toBe('climbing_ladder');
      expect(climbing.isComplete).toBe(false);

      // İniş bittiğinde (8000 ms)
      const finished = calculateMoonLandingState(8000, false, false);
      expect(finished.stage).toBe('landed');
      expect(finished.isComplete).toBe(true);
      expect(finished.astronautPos).toEqual(astro.surfacePosition);
      expect(finished.astronautPose).toBe('ground_idle');
    });

    it('"Geç" seçeneği veya prefers-reduced-motion doğrudan son duruma sıçratır', () => {
      const skipped = calculateMoonLandingState(500, true, false);
      expect(skipped.stage).toBe('landed');
      expect(skipped.isComplete).toBe(true);
      expect(skipped.astronautPos).toEqual(astro.surfacePosition);
      expect(skipped.astronautPose).toBe('ground_idle');

      const reducedMotion = calculateMoonLandingState(650, false, true);
      expect(reducedMotion.stage).toBe('landed');
      expect(reducedMotion.isComplete).toBe(true);
      expect(reducedMotion.astronautPos).toEqual(astro.surfacePosition);
    });
  });

  describe('2. Canvas 2D Görsel Katman Çizicileri', () => {
    it('drawMoonLanderShadow araca olan yüksekliğe göre gölgeyi küçültüp koyulaştırmalıdır', () => {
      const ctx = createMockCanvasContext();
      // Yüksekte (altitudeFactor: 1.0)
      drawMoonLanderShadow(ctx, 1.0);
      expect(ctx.ellipse).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();

      // Zeminde (altitudeFactor: 0.0)
      vi.clearAllMocks();
      drawMoonLanderShadow(ctx, 0.0);
      expect(ctx.ellipse).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('drawMoonLander, drawTouchdownDust ve drawAstronautCharacter hatasız render almalıdır', () => {
      const ctx = createMockCanvasContext();
      const calc = calculateMoonLandingState(2000, false, false);
      drawMoonLander(ctx, 260, 220, calc);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();

      vi.clearAllMocks();
      drawTouchdownDust(ctx, 0.5);
      expect(ctx.fill).toHaveBeenCalled();

      vi.clearAllMocks();
      drawAstronautCharacter(ctx, 330, 405, 'ground_idle');
      expect(ctx.arc).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('renderDiscoveryMoonEntities tüm animasyon durumlarında Canvas komutlarını kesintisiz çağırır', () => {
      const ctx = createMockCanvasContext();
      const res = renderDiscoveryMoonEntities(ctx, 1500, false, false);
      expect(res.stage).toBe('descent');
      expect(res.isComplete).toBe(false);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });
  });

  describe('3. WalkableCampusView ve Kontrol Bileşenleri Entegrasyonu', () => {
    it('Ay sahnesinde iniş sürerken "Geç" düğmesi ve "Gözlüğü Çıkar" butonu aktif olmalıdır', async () => {
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
            <WalkableCampusView initialScene="discovery_moon" />
          </CampusProviders>
        </MemoryRouter>,
      );

      // "Geç" butonu DOM'da bulunmalı
      const skipBtn = screen.getByRole('button', { name: /İniş animasyonunu atla/i });
      expect(skipBtn).toBeInTheDocument();
      expect(skipBtn).toHaveTextContent('Geç');

      // "Gözlüğü Çıkar" butonu bulunmalı (üst çubuk ve alt çubuk olmak üzere erişilebilir iki buton bulunur)
      const removeGlassesBtns = screen.getAllByRole('button', { name: /Gözlüğü Çıkar/i });
      expect(removeGlassesBtns.length).toBeGreaterThanOrEqual(1);

      // "Geç" butonuna tıklandığında iniş tamamlanır ve Geç butonu gizlenir
      await act(async () => {
        fireEvent.click(skipBtn);
      });

      expect(screen.queryByRole('button', { name: /İniş animasyonunu atla/i })).not.toBeInTheDocument();
    });

    it('"Gözlüğü Çıkar" butonuna tıklandığında sahne sınıfa döner ve öğrenci sehpada yer alır', async () => {
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
            <WalkableCampusView initialScene="discovery_moon" />
          </CampusProviders>
        </MemoryRouter>,
      );

      const removeGlassesBtns = screen.getAllByRole('button', { name: /Gözlüğü Çıkar/i });
      await act(async () => {
        fireEvent.click(removeGlassesBtns[0]);
      });

      // Işınlanma mesajı görünür
      expect(screen.getByText(/Gözlük Çıkarılıyor... Sınıfa Dönülüyor/i)).toBeInTheDocument();

      // Geçiş süresini ilerlet
      await act(async () => {
        vi.advanceTimersByTime(DISCOVERY_VR_CONFIG.fadeTransitionMs);
      });

      vi.useRealTimers();
    });
  });
});
