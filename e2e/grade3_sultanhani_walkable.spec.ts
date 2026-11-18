import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

test.use({ video: 'on' });

test.describe('Aşama 6.5: Sultanhanı Meydanında Aynı Karakterle Yürüyüş ve Taç Kapıdan Geçiş', () => {

  test('Masaüstü ve Mobil: Sınıftan ışınlanma, öğrenci kontrollü yürüyüş ve taç kapıdan geçiş', async ({ page }, testInfo) => {
    test.setTimeout(90000);

    // 1. Dört masası tamamlanmış 3. sınıf öğrencisi durumu
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.clear();
      const state = {
        schemaVersion: 1,
        hasSeenGate: false,
        hasCompletedOnboarding: true,
        discoveryPreference: 'independent',
        selectedGrade: 3,
        hasCompletedGuidedTour: true,
        speechEnabled: true,
        missionProgressByKey: {
          'kapilarin-anlattigi-hikaye::grade-3': {
            missionId: 'kapilarin-anlattigi-hikaye',
            missionVersion: '1.0.0',
            grade: 3,
            currentStage: 'paylas',
            completedStages: ['kesfet', 'ogren', 'uret', 'paylas'],
            selections: {
              selectedDoorIds: ['greetings-table'],
              inspectedCampusGate: true,
              observationNotes: {},
              matchedVocabularyIds: ['vocab-hello', 'vocab-morning', 'vocab-goodbye', 'vocab-night'],
              matchedExampleSentence: true,
              doorName: 'Selamlaşma Masası',
              writtenText: 'Good morning!',
              usedEnglishWords: ['Good', 'morning'],
            },
            draftArtifactId: null,
            savedArtifactId: null,
            artifactSavedAt: null,
            selfEvaluation: null,
            completed: false,
            completedAt: null,
            updatedAt: new Date().toISOString(),
          },
        },
        lastActiveMissionKey: 'kapilarin-anlattigi-hikaye::grade-3',
        updatedAt: new Date().toISOString(),
      };
      window.localStorage.setItem('dek_campus_v1_state', JSON.stringify(state));
    });
    await page.reload();

    // Giriş kapısını aç -> Avluya gir
    const openGateBtn = page.getByRole('button', { name: /Kapıyı Aç ve İçeri Gir/i });
    await expect(openGateBtn).toBeVisible({ timeout: 10000 });
    await openGateBtn.click();

    const walkableCanvas = page.locator('canvas[data-testid="walkable-canvas"]');
    await expect(walkableCanvas).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(600);

    // İngilizce Dünyası binasına yürü ve sınıfa gir
    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: {
            setPosition: (p: { x: number; y: number }) => void;
          };
        }
      ).__WALKABLE_ENGINE__;
      if (engine) {
        engine.setPosition({ x: 970, y: 335 });
      }
    });
    await page.waitForTimeout(400);

    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: {
            triggerActiveInteraction: () => void;
          };
        }
      ).__WALKABLE_ENGINE__;
      engine?.triggerActiveInteraction();
    });

    // Sınıfta olduğumuzu doğrula
    await expect(page.getByRole('button', { name: /Avluya dön/i })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('İngilizce Sınıfı', { exact: true })).toBeVisible();
    await page.waitForTimeout(800);

    // Sınıfta akıllı tahtaya yaklaş (x: 480, y: 180)
    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: {
            setPosition: (p: { x: number; y: number }) => void;
          };
        }
      ).__WALKABLE_ENGINE__;
      if (engine) {
        engine.setPosition({ x: 480, y: 180 });
      }
    });
    await page.waitForTimeout(600);

    // Akıllı tahtayı tetikle (Büyük Görev: Kervansaray Macerası [E])
    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: {
            triggerActiveInteraction: () => void;
          };
        }
      ).__WALKABLE_ENGINE__;
      if (engine) {
        engine.triggerActiveInteraction();
      }
    });

    // Işınlanma efektinin belirdiğini doğrula
    const teleportOverlay = page.locator('[data-testid="teleport-overlay"]');
    await expect(teleportOverlay).toBeVisible({ timeout: 5000 });
    await expect(teleportOverlay).toContainText('Sultanhanı Kervansarayı');

    // Sultanhanı Meydanına varış (overlay kaybolur, başlık Aksaray Sultanhanı Kervansarayı olur)
    await expect(teleportOverlay).toBeHidden({ timeout: 10000 });
    await expect(page.getByText(/Aksaray Sultanhanı Kervansarayı — Dış Meydan/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /Sınıfa Dön/i })).toBeVisible();

    // 1. Doğrulama: Karakter meydanda başlangıç konumunda bekler (otomatik yürümez)
    const initialPos = await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: {
            player: { x: number; y: number; direction: string };
          };
        }
      ).__WALKABLE_ENGINE__;
      return engine ? { x: engine.player.x, y: engine.player.y } : null;
    });

    expect(initialPos).toBeTruthy();
    expect(initialPos?.x).toBe(553);
    expect(initialPos?.y).toBe(760);
    await page.waitForTimeout(1000);

    // 2. Doğrulama: Öğrenci kontrollü yürüyüş (Zemine hedef belirleme ve yürüme)
    // Karakter taç kapıya doğru adım atar
    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: {
            navigateWalkToTarget: (x: number, y: number) => void;
          };
        }
      ).__WALKABLE_ENGINE__;
      if (engine) {
        // Taç kapı hizasında ileri yürü
        engine.navigateWalkToTarget(553, 670);
      }
    });
    await page.waitForTimeout(1400);

    // 3. Doğrulama: Yön değiştirme, durma ve geriye dönme (Yön kontrolleri)
    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: {
            setVirtualDirection: (vx: number, vy: number) => void;
          };
        }
      ).__WALKABLE_ENGINE__;
      if (engine) {
        // Sağa ve geriye dönüş
        engine.setVirtualDirection(1, 0);
      }
    });
    await page.waitForTimeout(600);

    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: {
            setVirtualDirection: (vx: number, vy: number) => void;
          };
        }
      ).__WALKABLE_ENGINE__;
      if (engine) {
        // Dur ve sola dön
        engine.setVirtualDirection(-1, 0);
      }
    });
    await page.waitForTimeout(600);

    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: {
            setVirtualDirection: (vx: number, vy: number) => void;
          };
        }
      ).__WALKABLE_ENGINE__;
      if (engine) {
        engine.setVirtualDirection(0, 0);
      }
    });
    await page.waitForTimeout(500);

    // 4. Doğrulama: Fotoğraftaki taç kapı açıklığından tam geçiş
    // Hedef: x: 553, y: 530 (Taç kapı açıklığının tonozlu içi)
    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: {
            navigateWalkToTarget: (x: number, y: number) => void;
          };
        }
      ).__WALKABLE_ENGINE__;
      if (engine) {
        engine.navigateWalkToTarget(553, 530);
      }
    });

    // Karakter kapıdan geçerken adımları bekle
    await page.waitForTimeout(2500);

    // Karakterin taç kapı eşiğini aşıp iç koridora adım attığını doğrula
    const gatePos = await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: {
            player: { x: number; y: number };
            camera: { x: number; y: number };
            canvas: HTMLCanvasElement;
          };
        }
      ).__WALKABLE_ENGINE__;
      if (!engine) return null;
      return {
        playerX: engine.player.x,
        playerY: engine.player.y,
        feetY: engine.player.y + 18,
        cameraY: engine.camera.y,
        cameraH: engine.canvas.height,
      };
    });

    expect(gatePos).toBeTruthy();
    // Karakter kapı açıklığına (y <= 565) ulaşmıştır
    expect(gatePos!.playerY).toBeLessThanOrEqual(565);
    // Ayakları ve kapı açıklığı (y: 480-590) kadrajda yer almaktadır
    const isFeetInView =
      gatePos!.feetY >= gatePos!.cameraY &&
      gatePos!.feetY <= gatePos!.cameraY + gatePos!.cameraH;
    expect(isFeetInView).toBe(true);

    // Geçiş anının ekran görüntüsünü al
    await page.screenshot({
      path: `docs/assets/grade3_sultanhani_gate_crossing_${testInfo.project.name}.png`,
    });
    await page.waitForTimeout(1000);

    // 5. Doğrulama: "Sınıfa Dön" düğmesine tıkla ve sınıfa geri dön
    const exitBtn = page.getByRole('button', { name: /Sınıfa Dön/i });
    await expect(exitBtn).toBeVisible();
    await exitBtn.click();

    // Sınıfa dönüş ışınlanma geçişi
    await expect(teleportOverlay).toBeVisible({ timeout: 5000 });
    await expect(teleportOverlay).toContainText('İngilizce Sınıfına');

    // Sınıfa döndüğümüzü doğrula
    await expect(teleportOverlay).toBeHidden({ timeout: 10000 });
    await expect(page.getByText('İngilizce Sınıfı', { exact: true })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /Avluya dön/i })).toBeVisible();

    await page.waitForTimeout(1500);

    // Sınıfa dönüş anının ekran görüntüsünü al
    await page.screenshot({
      path: `docs/assets/grade3_sultanhani_return_classroom_${testInfo.project.name}.png`,
    });

    // Kesintisiz Ekran Kaydı Videosunu docs/assets/videos Klasörüne Kaydet
    await page.close();
    const video = page.video();
    if (video) {
      const videosDir = path.resolve('docs/assets/videos');
      if (!fs.existsSync(videosDir)) {
        fs.mkdirSync(videosDir, { recursive: true });
      }
      const videoPath = await video.path();
      const targetName =
        testInfo.project.name === 'mobile-chrome'
          ? 'grade3_sultanhani_walkable_mobile.webm'
          : 'grade3_sultanhani_walkable_desktop.webm';
      fs.copyFileSync(videoPath, path.join(videosDir, targetName));
    }
  });
});
