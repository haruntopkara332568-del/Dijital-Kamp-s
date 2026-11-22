import { finishWalkableEntry } from './walkableEntry';
import { test, expect, Page } from '@playwright/test';
import path from 'path';

async function enterEnglishClassroom(page: Page) {
  await finishWalkableEntry(page);
  await page.evaluate(() => {
    const engine = (
      window as unknown as {
        __WALKABLE_ENGINE__?: {
          setPosition: (p: { x: number; y: number }) => void;
        };
      }
    ).__WALKABLE_ENGINE__;
    engine?.setPosition({ x: 970, y: 335 });
  });

  await page.waitForTimeout(400);
  await expect(page.getByText(/İngilizce Sınıfına Gir/i)).toBeVisible({ timeout: 6000 });

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

  await expect(page.getByRole('button', { name: /Avluya dön/i })).toBeVisible({ timeout: 6000 });
}

test.describe('ONARIM 02 — Marka Kimliği, Mimari Kitabeler ve 20 Senaryo Doğrulaması', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('Senaryo 1 & 15: Ana Giriş Ekranı ve Tarayıcı Başlığı yeni marka kimliğini doğru sunar', async ({
    page,
  }, testInfo) => {
    await page.goto('/');

    // 1. Tarayıcı Başlığı
    await expect(page).toHaveTitle(/Yeni Nesil Külliye — Dijital Öğrenme Kampüsü/i);

    // 2. Ana Başlık ve Alt Başlık
    await expect(page.getByRole('heading', { level: 1, name: 'Yeni Nesil Külliye' })).toBeVisible();
    await expect(page.getByText('Dijital Öğrenme Kampüsü').first()).toBeVisible();

    // 3. Mimari Taş Kitabe Katmanı
    await expect(page.getByText('YENİ NESİL KÜLLİYE')).toBeVisible();
    await expect(page.getByText('Geçmişin bilgeliği, geleceğin öğrenme dünyası')).toBeVisible();

    // Ekran Görüntüsü Kaydı: Ana giriş
    const isMobile = testInfo.project.name.includes('mobile');
    const screenshotPath = isMobile
      ? path.join('docs', 'assets', 'brand_gate_mobile.png')
      : path.join('docs', 'assets', 'brand_gate_desktop.png');
    await page.screenshot({ path: screenshotPath });
  });

  test('Senaryo 2: Kapı geçiş animasyonu ve avluya adım atma kesintisiz çalışır', async ({
    page,
  }) => {
    await page.goto('/');
    const openBtn = page.getByRole('button', { name: /Kapıyı Aç ve İçeri Gir/i });
    await expect(openBtn).toBeVisible();
    await openBtn.click();

    await finishWalkableEntry(page);
  });

  test('Senaryo 3, 4, 18: Kampüs Avlusu, Bina Kitabeleri ve Kamera Hareketi', async ({
    page,
  }, testInfo) => {
    // Doğrudan avlu durumunda başlat
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'dek_campus_v1_state',
        JSON.stringify({
          schemaVersion: 1,
          selectedGrade: 3,
          hasSeenGate: true,
          hasCompletedOnboarding: true,
          speechEnabled: true,
          discoveryPreference: 'free',
          missionProgressByKey: {},
          updatedAt: new Date().toISOString(),
        }),
      );
    });

    await page.goto('/');
    await finishWalkableEntry(page);
    await page.waitForTimeout(600);

    const isMobile = testInfo.project.name.includes('mobile');

    // 1. Avlu Genel Görünüm Ekran Görüntüsü
    const generalScreenshotPath = isMobile
      ? path.join('docs', 'assets', 'brand_courtyard_mobile.png')
      : path.join('docs', 'assets', 'brand_courtyard_desktop.png');
    await page.screenshot({ path: generalScreenshotPath });

    if (!isMobile) {
      // 2. İngilizce Öğreniyorum Binası Yakın Görünüm
      await page.evaluate(() => {
        const engine = (
          window as unknown as {
            __WALKABLE_ENGINE__?: {
              setPosition: (p: { x: number; y: number }) => void;
            };
          }
        ).__WALKABLE_ENGINE__;
        engine?.setPosition({ x: 970, y: 250 });
      });
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join('docs', 'assets', 'brand_english_building_close.png') });

      // 3. Hayalden Gerçeğe Binası Yakın Görünüm
      await page.evaluate(() => {
        const engine = (
          window as unknown as {
            __WALKABLE_ENGINE__?: {
              setPosition: (p: { x: number; y: number }) => void;
            };
          }
        ).__WALKABLE_ENGINE__;
        engine?.setPosition({ x: 290, y: 240 });
      });
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join('docs', 'assets', 'brand_discovery_building_close.png') });

      // 4. Hikâyeden Hayata Binası Yakın Görünüm
      await page.evaluate(() => {
        const engine = (
          window as unknown as {
            __WALKABLE_ENGINE__?: {
              setPosition: (p: { x: number; y: number }) => void;
            };
          }
        ).__WALKABLE_ENGINE__;
        engine?.setPosition({ x: 700, y: 200 });
      });
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join('docs', 'assets', 'brand_library_building_close.png') });
    }
  });

  test('Senaryo 5, 6: İngilizce Öğreniyorum binasına giriş ve Sınıf Seçim Panosu', async ({
    page,
  }, testInfo) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'dek_campus_v1_state',
        JSON.stringify({
          schemaVersion: 1,
          selectedGrade: 3,
          hasSeenGate: true,
          hasCompletedOnboarding: true,
          speechEnabled: true,
          discoveryPreference: 'free',
          missionProgressByKey: {},
          updatedAt: new Date().toISOString(),
        }),
      );
    });

    await page.goto('/');
    await enterEnglishClassroom(page);

    // Sınıf seçim panosuna yaklaş ve aç (x: 270, y: 160)
    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: {
            setPosition: (p: { x: number; y: number }) => void;
          };
        }
      ).__WALKABLE_ENGINE__;
      engine?.setPosition({ x: 270, y: 160 });
    });

    await page.waitForTimeout(400);
    await expect(page.getByText(/Sınıfını Seç \/ Değiştir/i)).toBeVisible({ timeout: 5000 });

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

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('heading', { level: 2 })).toContainText(/SINIF SEÇİM PANOSU/i);

    // Yalnızca 2, 3, 4 aktif
    await expect(modal.getByRole('button', { name: /^2\. Sınıf/ })).toBeVisible();
    await expect(modal.getByRole('button', { name: /^3\. Sınıf/ })).toBeVisible();
    await expect(modal.getByRole('button', { name: /^4\. Sınıf/ })).toBeVisible();
    expect(await modal.getByRole('button', { name: /^[567]\. Sınıf/ }).count()).toBe(0);

    if (!testInfo.project.name.includes('mobile')) {
      await page.screenshot({ path: path.join('docs', 'assets', 'brand_classroom_grade_board.png') });
    }
  });

  test('Senaryo 13, 14: Yakında açılacak binalara yaklaşıldığında yeni isimlerle bildirim verilir', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'dek_campus_v1_state',
        JSON.stringify({
          schemaVersion: 1,
          selectedGrade: 3,
          hasSeenGate: true,
          hasCompletedOnboarding: true,
          speechEnabled: true,
          discoveryPreference: 'free',
          missionProgressByKey: {},
          updatedAt: new Date().toISOString(),
        }),
      );
    });

    await page.goto('/');
    await finishWalkableEntry(page);

    // Hayalden Gerçeğe binası etkileşimi
    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: {
            setPosition: (p: { x: number; y: number }) => void;
            triggerActiveInteraction: () => void;
          };
        }
      ).__WALKABLE_ENGINE__;
      engine?.setPosition({ x: 290, y: 335 });
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

    await expect(page.getByText(/Hayalden Gerçeğe binası yakında açılacak/i)).toBeVisible({ timeout: 5000 });
  });

  test('Senaryo 16, 20: Eski öğrenci kayıtları ve sayfa yenileme bütünlüğü korunur', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'dek_campus_v1_state',
        JSON.stringify({
          schemaVersion: 1,
          selectedGrade: 3,
          hasSeenGate: true,
          hasCompletedOnboarding: true,
          speechEnabled: true,
          discoveryPreference: 'free',
          missionProgressByKey: {
            'kapilarin-anlattigi-hikaye::grade-5': {
              missionId: 'kapilarin-anlattigi-hikaye',
              grade: 5,
              currentStage: 'paylas',
              isCompleted: true,
              completedAt: '2026-11-01T10:00:00.000Z',
            },
          },
          updatedAt: new Date().toISOString(),
        }),
      );
    });

    await page.goto('/yolculugum');
    await expect(page.getByText(/Arşiv Kaydı \(5\. Sınıf\)/i)).toBeVisible();

    // Sayfa yenileme
    await page.reload();
    await expect(page.getByText(/Arşiv Kaydı \(5\. Sınıf\)/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Yeni Nesil Külliye/i })).toBeVisible();
  });
});
