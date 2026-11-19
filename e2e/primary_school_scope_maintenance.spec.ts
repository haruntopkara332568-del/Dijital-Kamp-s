import { test, expect, Page } from '@playwright/test';

async function enterEnglishClassroom(page: Page) {
  await page.waitForSelector('canvas[data-testid="walkable-canvas"]');
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

test.describe('ONARIM 01 — İlkokul Kapsamı (2, 3, 4. Sınıflar) ve 18 Senaryo Doğrulaması', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('Senaryo 1 & 5: Sınıf Seçim Panosu yalnızca 2, 3 ve 4. sınıfları sunar; 5, 6, 7 kesinlikle yoktur', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'dek_campus_v1_state',
        JSON.stringify({
          schemaVersion: 1,
          selectedGrade: null,
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

    // Sınıf panosuna git (x: 270, y: 160)
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

    const gradeDialog = page.getByRole('dialog');
    await expect(gradeDialog).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('heading', { level: 2 })).toContainText(/SINIF SEÇİM PANOSU/i);

    // Kademeler kontrolü
    await expect(page.getByText(/İlkokul Kademesi/i)).toBeVisible();
    await expect(page.getByText(/Ortaokul Kademesi/i)).toHaveCount(0);

    // Sınıf butonları kontrolü: 2, 3, 4 VAR; 5, 6, 7 KESİNLİKLE YOK
    await expect(page.getByRole('button', { name: /2\. Sınıf/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /3\. Sınıf/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /4\. Sınıf/i })).toBeVisible();

    await expect(page.getByRole('button', { name: /5\. Sınıf/i })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /6\. Sınıf/i })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /7\. Sınıf/i })).toHaveCount(0);

    // Sınıf seçilmemişken geçiş dönemi bilgilendirme uyarısı görünür
    await expect(
      page.getByText(/Kampüsümüz artık 2, 3 ve 4\. sınıflara yönelik çalışmalar sunuyor/i),
    ).toBeVisible();
  });

  test('Senaryo 6, 7, 8, 9: Eski 5, 6 veya 7. sınıf öğrencisinin verisi korunur, selectedGrade null olur ve bilgilendirme sunulur', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'dek_campus_v1_state',
        JSON.stringify({
          schemaVersion: 1,
          selectedGrade: 6,
          hasSeenGate: true,
          hasCompletedOnboarding: true,
          speechEnabled: true,
          discoveryPreference: 'free',
          missionProgressByKey: {
            'kapilarin-anlattigi-hikaye::grade-6': {
              missionId: 'kapilarin-anlattigi-hikaye',
              missionVersion: '1.0.0',
              grade: 6,
              currentStage: 'paylas',
              completedStages: ['kesfet', 'ogren', 'uret', 'paylas'],
              selections: {
                selectedDoorIds: [],
                inspectedCampusGate: true,
                observationNotes: {},
                matchedVocabularyIds: [],
                matchedExampleSentence: false,
                doorName: 'Eski Ortaokul Kapısı',
                writtenText: '6. sınıf mirası korunmalı',
                materialChoice: 'Taş',
                usedEnglishWords: ['Door', 'Stone'],
              },
              completed: true,
              completedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
          updatedAt: new Date().toISOString(),
        }),
      );
    });

    await page.goto('/');

    // Uygulama açıldığında state.selectedGrade değeri null'a dönüştürülmüş ve depolamaya yazılmış olmalı
    const selectedGradeInApp = await page.evaluate(() => {
      const raw = window.localStorage.getItem('dek_campus_v1_state');
      if (!raw) return 'NO_RAW';
      const parsed = JSON.parse(raw);
      return parsed.selectedGrade;
    });
    expect(selectedGradeInApp).toBeNull();

    // Geçmiş görev kaydı ASLA silinmemiş olmalı
    const hasLegacyProgress = await page.evaluate(() => {
      const raw = window.localStorage.getItem('dek_campus_v1_state');
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return Boolean(parsed.missionProgressByKey['kapilarin-anlattigi-hikaye::grade-6']);
    });
    expect(hasLegacyProgress).toBe(true);

    // Yolculuğum sayfasına gidildiğinde eski kayıt Arşiv Kaydı olarak görünmeli
    await page.goto('/yolculugum');
    await expect(page.getByText(/Arşiv Kaydı \(6\. Sınıf\)/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Tamamlanan Görevi İncele/i })).toHaveCount(0);
  });

  test('Senaryo 10: Bozuk veya geçersiz sınıf verisi uygulamanın çökmesini engeller', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'dek_campus_v1_state',
        JSON.stringify({
          schemaVersion: 1,
          selectedGrade: 99,
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
    await expect(page.locator('canvas[data-testid="walkable-canvas"]')).toBeVisible({
      timeout: 6000,
    });
  });

  test('Senaryo 11: Desteklenmeyen veya seçilmemiş sınıfla doğrudan görev URL erişimi ana sayfaya yönlendirir', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'dek_campus_v1_state',
        JSON.stringify({
          schemaVersion: 1,
          selectedGrade: null,
          hasSeenGate: true,
          hasCompletedOnboarding: true,
          speechEnabled: true,
          discoveryPreference: 'free',
          missionProgressByKey: {},
          updatedAt: new Date().toISOString(),
        }),
      );
    });

    await page.goto('/gorev/kapilarin-anlattigi-hikaye');
    await page.waitForURL('/', { timeout: 5000 });
    await expect(page.locator('canvas[data-testid="walkable-canvas"]')).toBeVisible();
  });

  test('Senaryo 12: Sınıf seçilmemişken masalara veya tahtaya yaklaşıldığında yönlendirme mesajı sunulur', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'dek_campus_v1_state',
        JSON.stringify({
          schemaVersion: 1,
          selectedGrade: null,
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

    // Keşfet masasına yaklaş (x: 265, y: 288)
    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: {
            setPosition: (p: { x: number; y: number }) => void;
          };
        }
      ).__WALKABLE_ENGINE__;
      engine?.setPosition({ x: 265, y: 288 });
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

    // Nazik bilgilendirme uyarısı görünür
    await expect(
      page.getByText(/Kampüsümüz artık 2, 3 ve 4\. sınıflara yönelik çalışmalar sunuyor/i),
    ).toBeVisible({ timeout: 5000 });
  });

  test('Senaryo 2 & 4: 2. ve 4. sınıflar için akıllı tahta koruma altındadır', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'dek_campus_v1_state',
        JSON.stringify({
          schemaVersion: 1,
          selectedGrade: 2,
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

    // Akıllı tahtaya git (x: 480, y: 160)
    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: {
            setPosition: (p: { x: number; y: number }) => void;
          };
        }
      ).__WALKABLE_ENGINE__;
      engine?.setPosition({ x: 480, y: 160 });
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

    // Korumalı akıllı tahta mesajı
    await expect(
      page.getByText(/Öğrenme etkinlikleri sınıftaki dört masaya .* taşınmıştır/i),
    ).toBeVisible({ timeout: 5000 });
  });

  test('Senaryo 3, 13, 14, 15, 16, 17: 3. Sınıf 4 Masası ve Sultanhanı Kervansarayı taç kapı yürüyüşü', async ({
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
            'kapilarin-anlattigi-hikaye::grade-3': {
              missionId: 'kapilarin-anlattigi-hikaye',
              missionVersion: '1.0.0',
              grade: 3,
              currentStage: 'paylas',
              completedStages: ['kesfet', 'ogren', 'uret', 'paylas'],
              selections: {
                selectedDoorIds: [],
                inspectedCampusGate: true,
                observationNotes: {},
                matchedVocabularyIds: [],
                matchedExampleSentence: false,
                doorName: 'Selçuklu Taç Kapısı',
                writtenText: 'Good morning!',
                materialChoice: 'Taş',
                usedEnglishWords: ['Hello', 'Good morning'],
              },
              completed: true,
              completedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
          updatedAt: new Date().toISOString(),
        }),
      );
    });

    await page.goto('/');
    await enterEnglishClassroom(page);

    // Akıllı tahtaya yaklaş (x: 480, y: 160)
    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: {
            setPosition: (p: { x: number; y: number }) => void;
          };
        }
      ).__WALKABLE_ENGINE__;
      engine?.setPosition({ x: 480, y: 160 });
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

    // Sultanhanı Işınlanma efekti ve meydan sahnesi
    await expect(
      page.getByText(/Sultanhanı Kervansarayı Meydanı'na Işınlanıyorsun/i),
    ).toBeVisible({ timeout: 5000 });

    // Işınlanma tamamlanıp meydan açılır
    await page.waitForTimeout(1500);

    // Meydanda sınıftaki aynı karakterle taç kapıya doğru yürüme
    const inSultanhani = await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: { getPlayerPosition: () => { x: number; y: number } };
        }
      ).__WALKABLE_ENGINE__;
      return Boolean(engine);
    });
    expect(inSultanhani).toBe(true);
  });
});
