import { test, expect, type Page } from '@playwright/test';
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

    const touch = !!testInfo.project.use.hasTouch;
    if (!touch) await page.setViewportSize({ width: 1000, height: 650 });

    const walkableCanvas = page.locator('canvas[data-testid="walkable-canvas"]');
    await expect(walkableCanvas).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(600);

    const city = await readScene(page);
    if (city.width < 620) {
      await pointAtWorld(page, !!testInfo.project.use.hasTouch, 815, 470);
      await expect.poll(async () => (await readScene(page)).x).toBeGreaterThan(800);
    }
    await pointAtWorld(page, touch, 970, 350);
    const interaction = page.getByRole('button', { name: /Etkileşimi başlat/i });
    await expect(page.getByText('İngilizce Sınıfına Gir', { exact: true })).toBeVisible({ timeout: 12000 });
    await interaction.click();
    await expect(page.getByText('İngilizce Sınıfı', { exact: true })).toBeVisible();

    await expect(page.getByText('İngilizce Sınıfına Gir', { exact: true })).toBeHidden();
    await expect.poll(async () => (await readScene(page)).y).toBeGreaterThan(500);
    if (touch) {
      await pointAtWorld(page, true, 480, 220);
      await expect.poll(async () => (await readScene(page)).y).toBeLessThan(240);
    } else {
      await page.keyboard.down('ArrowUp');
      try {
        await expect.poll(async () => (await readScene(page)).y, { timeout: 15000 }).toBeLessThan(230);
      } finally {
        await page.keyboard.up('ArrowUp');
      }
    }
    await expect(page.getByText(/Büyük Görev: Kervansaray Macerası/)).toBeVisible();
    await interaction.click();

    const teleport = page.getByTestId('teleport-overlay');
    await expect(teleport).toContainText('Sultanhanı Kervansarayı');
    await expect(teleport).toBeHidden();
    await expect(page.getByText(/Sultanhanı Kervansarayı — Dış Meydan/)).toBeVisible();
    const arrival = await readScene(page);
    await page.waitForTimeout(550);
    expect(await readScene(page)).toEqual(arrival);

    await pointAtWorld(page, touch, arrival.x - 85, arrival.y - 75);
    await expect.poll(async () => (await readScene(page)).x).toBeLessThan(arrival.x - 70);

    if (!touch) {
      await page.keyboard.down('ArrowUp');
      try {
        await expect.poll(async () => (await readScene(page)).y).toBeLessThan(595);
        await page.waitForTimeout(350);
      } finally {
        await page.keyboard.up('ArrowUp');
      }
      const atWall = await readScene(page);
      expect(atWall.y).toBeGreaterThanOrEqual(585);
      await page.keyboard.down('ArrowDown');
      try {
        await expect.poll(async () => (await readScene(page)).y).toBeGreaterThan(atWall.y + 55);
      } finally {
        await page.keyboard.up('ArrowDown');
      }
      const stopped = await readScene(page);
      await page.waitForTimeout(350);
      expect(Math.abs((await readScene(page)).y - stopped.y)).toBeLessThan(4);
    }

    // 553 × 466 kaynak fotoğrafında kapı açıklığı x~298–327, eşik y~296.
    await pointAtWorld(page, touch, 625, touch ? 653 : 645);
    await expect.poll(async () => Math.abs((await readScene(page)).x - 625)).toBeLessThan(8);
    await pointAtWorld(page, touch, 625, 540);
    await expect.poll(async () => (await readScene(page)).y).toBeLessThan(556);

    const passage = await readScene(page);
    expect(passage.x).toBeGreaterThan(596);
    expect(passage.x).toBeLessThan(654);
    expect(passage.cameraX).toBeLessThanOrEqual(596);
    expect(passage.cameraX + passage.width).toBeGreaterThanOrEqual(654);
    expect(passage.cameraY).toBeLessThanOrEqual(486);
    expect(passage.cameraY + passage.height).toBeGreaterThanOrEqual(592);
    expect(passage.y + 18).toBeLessThan(592);

    await page.waitForTimeout(650);
    await page.getByRole('button', { name: /Sınıfa dön/i }).click();
    await expect(page.getByText('İngilizce Sınıfı', { exact: true })).toBeVisible();
    await page.waitForTimeout(1200);

    await page.close();
    const video = page.video();
    if (video) {
      const videosDir = path.resolve('docs/assets/videos');
      fs.mkdirSync(videosDir, { recursive: true });
      await video.saveAs(path.join(videosDir, touch
        ? 'grade3_sultanhani_walkable_mobile.webm'
        : 'grade3_sultanhani_walkable_desktop.webm'));
    }
  });
});

async function readScene(page: Page) {
  return page.getByTestId('walkable-canvas').evaluate((canvas: HTMLCanvasElement) => {
    const engine = (window as unknown as {
      __WALKABLE_ENGINE__: {
        getPosition: () => { x: number; y: number };
        camera: { x: number; y: number };
      };
    }).__WALKABLE_ENGINE__;
    return {
      ...engine.getPosition(),
      cameraX: Math.round(engine.camera.x),
      cameraY: Math.round(engine.camera.y),
      width: canvas.width,
      height: canvas.height,
    };
  });
}

async function pointAtWorld(page: Page, touch: boolean, worldX: number, worldY: number) {
  const scene = await readScene(page);
  const bounds = await page.getByTestId('walkable-canvas').boundingBox();
  if (!bounds) throw new Error('Sahne tuvali bulunamadı.');
  const x = bounds.x + (worldX - scene.cameraX) * bounds.width / scene.width;
  const y = bounds.y + (worldY - scene.cameraY) * bounds.height / scene.height;
  expect(x).toBeGreaterThan(bounds.x);
  expect(x).toBeLessThan(bounds.x + bounds.width);
  expect(y).toBeGreaterThan(bounds.y);
  expect(y).toBeLessThan(bounds.y + bounds.height);
  if (touch) await page.touchscreen.tap(x, y);
  else await page.mouse.click(x, y);
}
