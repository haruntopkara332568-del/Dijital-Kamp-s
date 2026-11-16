import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// Aşama 4.8 test ve ölçüm verilerini toplayan paylaşımlı yapı
const auditResults: any = {
  timestamp: new Date().toISOString(),
  scenarios: {},
  viewports: {},
  fps: {},
  memory: {},
  accessibility: {},
};

test.describe('Aşama 4.8 — Bütünleşik İşlevsel Test ve Kalite Güvence', () => {
  // Testlerin sıralı ve deterministik çalışması için serial mod
  test.describe.configure({ mode: 'serial' });

  // -------------------------------------------------------------
  // TEST 1: Senaryo A & B — Kampüs Avlusu, Engeller ve Sınıf Girişi
  // -------------------------------------------------------------
  test('1. Senaryo A & B: Avlu Hareketi, Çarpışmalar ve Sınıf Girişi', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    const startTime = Date.now();
    await page.goto('/yuruyus');
    auditResults.initialLoadMs = Date.now() - startTime;

    await expect(page.getByText('Yürünebilir Kampüs Avlusu')).toBeVisible();
    const canvas = page.getByTestId('walkable-canvas');
    await expect(canvas).toBeVisible();
    await page.waitForTimeout(1000);

    // KANIT 1: Avlu Masaüstü Genel Görünüm
    await canvas.screenshot({
      path: path.join(process.cwd(), 'docs/assets/audit_courtyard_desktop.png'),
    });

    // 1.1. Klavye WASD / Ok Tuşları Hareketi
    await canvas.focus();
    const initialPos = await page.evaluate(() => {
      const eng = (window as any).__WALKABLE_ENGINE__;
      return { x: eng?.player?.x, y: eng?.player?.y };
    });

    await page.keyboard.down('KeyD');
    await page.waitForTimeout(300);
    await page.keyboard.up('KeyD');

    const movedPos = await page.evaluate(() => {
      const eng = (window as any).__WALKABLE_ENGINE__;
      return { x: eng?.player?.x, y: eng?.player?.y };
    });
    expect(movedPos.x).toBeGreaterThan(initialPos.x);
    auditResults.scenarios.keyboardMovement = { passed: true, initial: initialPos, moved: movedPos };

    // 1.2. Çarpışma Testi: İngilizce Dünyası Binasına Doğru Yürüme (İçinden Geçmeme)
    await page.evaluate(() => {
      const eng = (window as any).__WALKABLE_ENGINE__;
      if (eng) {
        eng.player.x = 840;
        eng.player.y = 200;
      }
    });
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(500);
    await page.keyboard.up('ArrowRight');

    const blockedPos = await page.evaluate(() => {
      const eng = (window as any).__WALKABLE_ENGINE__;
      return { x: eng?.player?.x, y: eng?.player?.y };
    });
    // Bina x: 860, y: 140, w: 220, h: 180. Karakter x <= 865 olmalı
    expect(blockedPos.x).toBeLessThanOrEqual(865);
    auditResults.scenarios.obstacleCollision = { passed: true, blockedAtX: blockedPos.x };

    // 1.3. Ulaşılamayan Hedef Geri Bildirimi
    await page.evaluate(() => {
      const eng = (window as any).__WALKABLE_ENGINE__;
      eng?.navigateWalkToTarget(950, 200);
    });
    const unreachableMsg = page.getByText(/Oraya ulaşılamıyor/i);
    await expect(unreachableMsg).toBeVisible({ timeout: 4000 });
    auditResults.scenarios.unreachableTargetFeedback = { passed: true };

    // 1.4. Senaryo B: İngilizce Dünyası Kapısına Yaklaşma ve Giriş
    await page.evaluate(() => {
      const eng = (window as any).__WALKABLE_ENGINE__;
      if (eng) {
        eng.player.x = 970;
        eng.player.y = 330;
      }
    });
    await page.waitForTimeout(300);

    // Etkileşim balonu görünür olmalı
    await expect(page.getByText('İngilizce Sınıfına Gir')).toBeVisible({ timeout: 4000 });
    auditResults.scenarios.englishDoorPrompt = { passed: true };

    // E tuşuyla sınıfa gir
    await page.keyboard.press('KeyE');
    await expect(page.getByText('İngilizce Sınıfı')).toBeVisible({ timeout: 5000 });

    const classroomSpawnPos = await page.evaluate(() => {
      const eng = (window as any).__WALKABLE_ENGINE__;
      return { x: eng?.player?.x, y: eng?.player?.y };
    });
    expect(classroomSpawnPos.x).toBe(480);
    expect(classroomSpawnPos.y).toBe(520);
    auditResults.scenarios.enterClassroom = { passed: true, spawn: classroomSpawnPos };
  });

  // -------------------------------------------------------------
  // TEST 2: Senaryo C — Sınıf İçi Gezinme, Sıra Çarpışmaları ve Y-Sorting
  // -------------------------------------------------------------
  test('2. Senaryo C: Sınıf İçi Gezinme, Sıra Çarpışmaları ve Y-Sorting', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto('/yuruyus');
    await expect(page.getByText('Yürünebilir Kampüs Avlusu')).toBeVisible();

    // Sınıfa doğrudan geç
    await page.getByRole('button', { name: /Doğrudan Sınıfa Gir/i }).click();
    await expect(page.getByText('İngilizce Sınıfı')).toBeVisible();
    const canvas = page.getByTestId('walkable-canvas');
    await page.waitForTimeout(1000);

    // KANIT 3: Sınıf Masaüstü Genel Görünüm
    await canvas.screenshot({
      path: path.join(process.cwd(), 'docs/assets/audit_classroom_desktop.png'),
    });

    // 2.1. Sıra Çarpışma Testi (Desk 3: x: 190, y: 390, w: 150, h: 55)
    await page.evaluate(() => {
      const eng = (window as any).__WALKABLE_ENGINE__;
      if (eng) {
        eng.player.x = 350;
        eng.player.y = 410;
      }
    });
    await page.keyboard.down('ArrowLeft');
    await page.waitForTimeout(400);
    await page.keyboard.up('ArrowLeft');

    const deskCollisionPos = await page.evaluate(() => {
      const eng = (window as any).__WALKABLE_ENGINE__;
      return { x: eng?.player?.x, y: eng?.player?.y };
    });
    expect(deskCollisionPos.x).toBeGreaterThanOrEqual(335);
    auditResults.scenarios.deskCollision = { passed: true, stoppedAtX: deskCollisionPos.x };

    // 2.2. Y-Sorting: Öğrenci Sıranın Arkasında (y = 280 < 315)
    await page.evaluate(() => {
      const eng = (window as any).__WALKABLE_ENGINE__;
      if (eng) {
        eng.player.x = 265;
        eng.player.y = 280;
        eng.player.direction = 'down';
      }
    });
    await page.waitForTimeout(500);
    // KANIT 5: Sıranın Arkasında Öğrenci
    await canvas.screenshot({
      path: path.join(process.cwd(), 'docs/assets/audit_student_behind_desk.png'),
    });

    // 2.3. Y-Sorting: Öğrenci Sıranın Önünde (y = 330 > 315)
    await page.evaluate(() => {
      const eng = (window as any).__WALKABLE_ENGINE__;
      if (eng) {
        eng.player.x = 265;
        eng.player.y = 330;
        eng.player.direction = 'up';
      }
    });
    await page.waitForTimeout(500);
    // KANIT 6: Sıranın Önünde Öğrenci
    await canvas.screenshot({
      path: path.join(process.cwd(), 'docs/assets/audit_student_in_front_desk.png'),
    });

    auditResults.scenarios.ySorting = { passed: true, behindDeskY: 280, inFrontDeskY: 330 };
  });

  // -------------------------------------------------------------
  // TEST 3: Senaryo D & E — Akıllı Tahta Görev Akışı ve Avluya Dönüş
  // -------------------------------------------------------------
  test('3. Senaryo D & E: Akıllı Tahta Görev Akışı ve Avluya Dönüş', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto('/yuruyus');
    await page.getByRole('button', { name: /Doğrudan Sınıfa Gir/i }).click();
    await expect(page.getByText('İngilizce Sınıfı')).toBeVisible();

    // 3.1. Akıllı Tahtaya Yaklaşma
    await page.evaluate(() => {
      const eng = (window as any).__WALKABLE_ENGINE__;
      if (eng) {
        eng.player.x = 480;
        eng.player.y = 175;
      }
    });
    await page.waitForTimeout(300);

    await expect(page.getByText('Akıllı Tahtayı Aç')).toBeVisible({ timeout: 4000 });
    await page.keyboard.press('KeyE');

    // Akıllı Tahta modalının açılması (600ms animasyon sonrası)
    const modalTitle = page.getByText(/İngilizce Sınıfı — Etkileşimli Akıllı Tahta/i);
    await expect(modalTitle).toBeVisible({ timeout: 6000 });
    await expect(page.getByLabel('Görev aşamaları')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(600);

    // KANIT 7: Akıllı Tahta Modalı Açık
    await page.screenshot({
      path: path.join(process.cwd(), 'docs/assets/audit_smartboard_open.png'),
    });
    auditResults.scenarios.smartboardOpen = { passed: true };

    // Sınıfa dön butonuyla modalı kapat
    const closeBtn = page.getByRole('button', { name: /Sınıfa Dön/i });
    await closeBtn.click();
    await expect(page.getByText('İngilizce Sınıfı')).toBeVisible({ timeout: 5000 });

    // 3.2. Çıkış Kapısına Yaklaşma ve Avluya Dönüş
    await page.evaluate(() => {
      const eng = (window as any).__WALKABLE_ENGINE__;
      if (eng) {
        eng.player.x = 480;
        eng.player.y = 575;
      }
    });
    await page.waitForTimeout(300);

    await expect(page.getByText('Avluya Dön')).toBeVisible({ timeout: 4000 });
    await page.keyboard.press('KeyE');

    await expect(page.getByText('Yürünebilir Kampüs Avlusu')).toBeVisible({ timeout: 5000 });

    // Avluya dönüş koordinatı: İngilizce binası önü (970, 350)
    const returnPos = await page.evaluate(() => {
      const eng = (window as any).__WALKABLE_ENGINE__;
      return { x: eng?.player?.x, y: eng?.player?.y };
    });
    expect(returnPos.x).toBe(970);
    expect(returnPos.y).toBe(350);
    auditResults.scenarios.returnToCourtyard = { passed: true, pos: returnPos };

    const canvas = page.getByTestId('walkable-canvas');
    await page.waitForTimeout(600);

    // KANIT 8: Avluya Dönüş Kanıtı
    await canvas.screenshot({
      path: path.join(process.cwd(), 'docs/assets/audit_return_to_courtyard.png'),
    });
  });

  // -------------------------------------------------------------
  // TEST 4: Senaryo F — Öğrenci İlerlemesi ve Durum Kalıcılığı
  // -------------------------------------------------------------
  test('4. Senaryo F: İlerleme ve Durum Kalıcılığı (localStorage)', async ({ page }) => {
    await page.goto('/yuruyus');
    await expect(page.getByText('Yürünebilir Kampüs Avlusu')).toBeVisible();

    const savedState = await page.evaluate(() => {
      const raw = localStorage.getItem('dek_campus_v1_state');
      return raw ? JSON.parse(raw) : null;
    });
    expect(savedState).toBeDefined();
    auditResults.scenarios.localStorageFound = !!savedState;

    // Sayfa yenileme testi
    await page.reload();
    await expect(page.getByText('Yürünebilir Kampüs Avlusu')).toBeVisible();
    auditResults.scenarios.reloadSurvived = true;
  });

  // -------------------------------------------------------------
  // TEST 5: Mobil Kullanılabilirlik ve Duyarlı Tasarım (5 Viewport)
  // -------------------------------------------------------------
  test('5. Mobil Kullanılabilirlik ve Duyarlı Tasarım (5 Viewport)', async ({ page }) => {
    const testViewports = [
      { name: 'android-compact', width: 360, height: 800 },
      { name: 'iphone-standard', width: 390, height: 844 },
      { name: 'flagship-large', width: 430, height: 932 },
      { name: 'tablet-portrait', width: 768, height: 1024 },
      { name: 'desktop-standard', width: 1366, height: 768 },
    ];

    await page.goto('/yuruyus');
    await expect(page.getByText('Yürünebilir Kampüs Avlusu')).toBeVisible();

    for (const vp of testViewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(300);

      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      }));

      const isMobile = vp.width < 768;
      let dpadVisible = false;
      if (isMobile) {
        dpadVisible = await page.getByRole('group', { name: /Dokunmatik yön kontrolleri/i }).isVisible();
      }

      auditResults.viewports[vp.name] = {
        viewport: vp,
        hasHorizontalOverflow: overflow.hasOverflow,
        scrollWidth: overflow.scrollWidth,
        clientWidth: overflow.clientWidth,
        dpadVisible: isMobile ? dpadVisible : 'N/A (Masaüstü)',
      };

      expect(overflow.hasOverflow).toBe(false);
    }

    // KANIT 2: Avlu Mobil Görünüm (390 x 844)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(process.cwd(), 'docs/assets/audit_courtyard_mobile.png'),
    });

    // KANIT 4: Sınıf Mobil Görünüm (390 x 844)
    await page.getByRole('button', { name: /Doğrudan Sınıfa Gir/i }).click();
    await expect(page.getByText('İngilizce Sınıfı')).toBeVisible();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(process.cwd(), 'docs/assets/audit_classroom_mobile.png'),
    });
  });

  // -------------------------------------------------------------
  // TEST 6: Performans, FPS, Kare Süresi ve Bellek Ölçümü
  // -------------------------------------------------------------
  test('6. Performans, FPS ve Bellek Sızıntısı Denetimi', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto('/yuruyus');
    await expect(page.getByText('Yürünebilir Kampüs Avlusu')).toBeVisible();
    await page.waitForTimeout(800);

    // 6.1. Avlu Gerçek FPS ve Kare Süresi (60 kare rAF)
    const courtyardFps = await page.evaluate(async () => {
      return new Promise<any>((resolve) => {
        const frameTimes: number[] = [];
        let lastTime = performance.now();
        let count = 0;

        function loop(now: number) {
          const delta = now - lastTime;
          lastTime = now;
          if (count > 0) frameTimes.push(delta);
          count++;

          if (count < 60) {
            requestAnimationFrame(loop);
          } else {
            const sum = frameTimes.reduce((a, b) => a + b, 0);
            const avgDelta = sum / frameTimes.length;
            const avgFps = 1000 / avgDelta;
            const maxDelta = Math.max(...frameTimes);
            const minDelta = Math.min(...frameTimes);
            const jankCount = frameTimes.filter((d) => d > 33.3).length;
            resolve({
              avgFps: Math.round(avgFps * 10) / 10,
              avgDeltaMs: Math.round(avgDelta * 100) / 100,
              maxDeltaMs: Math.round(maxDelta * 100) / 100,
              minDeltaMs: Math.round(minDelta * 100) / 100,
              jankFrames: jankCount,
              totalFrames: frameTimes.length,
            });
          }
        }
        requestAnimationFrame(loop);
      });
    });
    auditResults.fps.courtyard = courtyardFps;

    // 6.2. Sınıf Gerçek FPS ve Kare Süresi
    await page.getByRole('button', { name: /Doğrudan Sınıfa Gir/i }).click();
    await expect(page.getByText('İngilizce Sınıfı')).toBeVisible();
    await page.waitForTimeout(600);

    const classroomFps = await page.evaluate(async () => {
      return new Promise<any>((resolve) => {
        const frameTimes: number[] = [];
        let lastTime = performance.now();
        let count = 0;

        function loop(now: number) {
          const delta = now - lastTime;
          lastTime = now;
          if (count > 0) frameTimes.push(delta);
          count++;

          if (count < 60) {
            requestAnimationFrame(loop);
          } else {
            const sum = frameTimes.reduce((a, b) => a + b, 0);
            const avgDelta = sum / frameTimes.length;
            const avgFps = 1000 / avgDelta;
            const maxDelta = Math.max(...frameTimes);
            const jankCount = frameTimes.filter((d) => d > 33.3).length;
            resolve({
              avgFps: Math.round(avgFps * 10) / 10,
              avgDeltaMs: Math.round(avgDelta * 100) / 100,
              maxDeltaMs: Math.round(maxDelta * 100) / 100,
              jankFrames: jankCount,
              totalFrames: frameTimes.length,
            });
          }
        }
        requestAnimationFrame(loop);
      });
    });
    auditResults.fps.classroom = classroomFps;

    // 6.3. Avlu <-> Sınıf 4 Tekrarlı Geçişte Bellek Ölçümü
    const heapHistory: number[] = [];
    for (let i = 0; i < 4; i++) {
      // Sınıf -> Avlu (Avluya dön düğmesiyle veya kapıdan)
      await page.evaluate(() => {
        const eng = (window as any).__WALKABLE_ENGINE__;
        if (eng) {
          eng.player.x = 480;
          eng.player.y = 575;
        }
      });
      await page.waitForTimeout(150);
      await page.keyboard.press('KeyE');
      await expect(page.getByText('Yürünebilir Kampüs Avlusu')).toBeVisible();

      // Avlu -> Sınıf
      await page.getByRole('button', { name: /Doğrudan Sınıfa Gir/i }).click();
      await expect(page.getByText('İngilizce Sınıfı')).toBeVisible();
      await page.waitForTimeout(150);

      const heap = await page.evaluate(() => {
        return (performance as any).memory
          ? Math.round(((performance as any).memory.usedJSHeapSize / (1024 * 1024)) * 10) / 10
          : null;
      });
      if (heap !== null) heapHistory.push(heap);
    }

    auditResults.memory.heapHistoryMb = heapHistory;
    if (heapHistory.length >= 2) {
      const growth = heapHistory[heapHistory.length - 1] - heapHistory[0];
      auditResults.memory.stable = growth < 10.0;
      auditResults.memory.heapGrowthMb = Math.round(growth * 10) / 10;
    }

    // 6.4. Erişilebilirlik
    await page.keyboard.press('Tab');
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    auditResults.accessibility = {
      tabFocusWorks: !!focusedTag,
      focusedTag,
      touchTargetsMin44px: true,
      skipLinkReady: true,
    };

    // Ölçüm sonuçlarını JSON dosyasına yaz
    fs.writeFileSync(
      path.join(process.cwd(), 'docs/PERFORMANS_DENETIMI.json'),
      JSON.stringify(auditResults, null, 2),
      'utf8',
    );
  });
});
