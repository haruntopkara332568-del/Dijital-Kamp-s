import { test, expect } from '@playwright/test';

test.describe('3. Sınıf Akıllı Tahta — Sultanhanı Kervansarayı Macerası (Aşama 6.5)', () => {
  test('Senaryo 1: 4 masa tamamlanmadan Akıllı Tahta kilitlidir ve bilgilendirme uyarısı verir', async ({ page }) => {
    // 1. Durum: 3 masa tamamlanmış (Keşfet, Öğren, Üret), Paylaş masası henüz tamamlanmamış
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
            completedStages: ['kesfet', 'ogren', 'uret'],
            selections: {
              selectedDoorIds: ['greetings-table'],
              inspectedCampusGate: true,
              observationNotes: {},
              matchedVocabularyIds: ['vocab-hello'],
              matchedExampleSentence: true,
              doorName: 'Selamlaşma Masası',
              writtenText: 'Hello!',
              usedEnglishWords: ['Hello'],
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
    await expect(openGateBtn).toBeVisible();
    await openGateBtn.click();

    const walkableCanvas = page.locator('canvas[data-testid="walkable-canvas"]');
    await expect(walkableCanvas).toBeVisible({ timeout: 10000 });

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
    await page.waitForTimeout(300);

    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: { triggerActiveInteraction: () => void };
        }
      ).__WALKABLE_ENGINE__;
      engine?.triggerActiveInteraction();
    });

    // Sınıftayız
    await expect(page.getByRole('button', { name: /Avluya dön/i })).toBeVisible({ timeout: 5000 });

    // Akıllı tahtanın önüne yürü (x: 480, y: 180) ve etkileşim tetikle
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
    await page.waitForTimeout(300);

    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: { triggerActiveInteraction: () => void };
        }
      ).__WALKABLE_ENGINE__;
      engine?.triggerActiveInteraction();
    });

    // Kilit uyarısının gösterildiğini doğrula
    await expect(
      page.getByText(/Büyük Görev için önce sınıftaki dört masadaki \(Keşfet, Öğren, Üret, Paylaş\) görevleri tamamlamalısın\./i),
    ).toBeVisible({ timeout: 4000 });

    // Sultanhanı modalının açılmadığını doğrula
    await expect(page.getByText(/Aksaray Sultanhanı Kervansarayı/i)).not.toBeVisible();
  });

  test('Senaryo 2: 4 masa tamamlandığında Akıllı Tahta açılır, Sultanhanı Kervansarayı macerası tamamlanır ve sınıfa dönülür', async ({ page }) => {
    // 1. Durum: Dört masanın tümü tamamlanmış
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
              writtenText: 'Hello! Good morning! Goodbye! Good night!',
              usedEnglishWords: ['Hello', 'Good morning', 'Goodbye', 'Good night'],
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
    await expect(openGateBtn).toBeVisible();
    await openGateBtn.click();

    const walkableCanvas = page.locator('canvas[data-testid="walkable-canvas"]');
    await expect(walkableCanvas).toBeVisible({ timeout: 10000 });

    // İngilizce Dünyası binasına gir
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
    await page.waitForTimeout(300);

    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: { triggerActiveInteraction: () => void };
        }
      ).__WALKABLE_ENGINE__;
      engine?.triggerActiveInteraction();
    });

    await expect(page.getByRole('button', { name: /Avluya dön/i })).toBeVisible({ timeout: 5000 });

    // Akıllı tahtanın önüne yürü (x: 480, y: 180) ve açılışı tetikle
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
    await page.waitForTimeout(300);

    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: { triggerActiveInteraction: () => void };
        }
      ).__WALKABLE_ENGINE__;
      engine?.triggerActiveInteraction();
    });

    // Akıllı Tahta modalı açılır: Sultanhanı Kervansarayı Sahnesi
    await expect(page.getByText(/Aksaray Sultanhanı Kervansarayı/i)).toBeVisible({ timeout: 6000 });
    await expect(page.getByText(/1\. Sahne — Kervansaraya Varış/i)).toBeVisible();

    // Ekran görüntüsü: Açılış Sahnesi
    await page.screenshot({ path: 'docs/assets/grade3_smartboard_sultanhani_arrival.png' });

    // --- 1. SAHNE: Kervansaraya Varış (Sabah) ---
    // Yanlış cevap testi: "Good night!" seçeneği
    await page.getByRole('button', { name: /"Good night!"/i }).click();
    await expect(
      page.getByText(/Sabah saatlerinde güne başlarken "Good morning!"/i),
    ).toBeVisible({ timeout: 3000 });

    // Doğru cevap: "Good morning!"
    await page.getByRole('button', { name: /"Good morning!"/i }).click();
    await expect(
      page.getByText(/Harika! "Good morning!" diyerek Kerem'e sabah selamı verdin/i),
    ).toBeVisible({ timeout: 4000 });

    // --- 2. SAHNE: Yeni Bir Arkadaş (Zeynep) ---
    await expect(page.getByText(/2\. Sahne — Yeni Bir Arkadaş/i)).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: /"Hello!"/i }).click();

    // --- 3. SAHNE: Vedalaşma (İkindi) ---
    await expect(page.getByText(/3\. Sahne — Vedalaşma/i)).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: /"Goodbye!"/i }).click();

    // --- 4. SAHNE: Günün Sonu (Gece) ---
    await expect(page.getByText(/4\. Sahne — Günün Sonu/i)).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: /"Good night!"/i }).click();

    // --- TAMAMLANMA EKRANI ---
    await expect(
      page.getByText(/Tebrikler! Öğrendiğin İngilizce ifadeleri günlük yaşamda başarıyla kullandın\./i),
    ).toBeVisible({ timeout: 5000 });

    // Rozet ve 4 kart özeti
    await expect(page.getByText(/Büyük Görev Başarıyla Tamamlandı 🏆/i)).toBeVisible();
    await expect(page.getByText(/Good morning!/i).first()).toBeVisible();
    await expect(page.getByText(/Hello!/i).first()).toBeVisible();
    await expect(page.getByText(/Goodbye!/i).first()).toBeVisible();
    await expect(page.getByText(/Good night!/i).first()).toBeVisible();

    // Ekran görüntüsü: Tamamlanma Ekranı
    await page.screenshot({ path: 'docs/assets/grade3_smartboard_adventure_completed.png' });

    // Sınıfa Dön butonuna tıkla
    const returnBtn = page.getByRole('button', { name: /Sınıfa Dön/i }).first();
    await returnBtn.click();

    // Sınıfta olduğumuzu ve masaların yerinde durduğunu doğrula
    await expect(page.getByRole('button', { name: /Avluya dön/i })).toBeVisible({ timeout: 5000 });

    // LocalStorage verisinde 4 masanın korunduğunu ve büyük görevin tamamlandığını doğrula
    const savedState = await page.evaluate(() => {
      const raw = window.localStorage.getItem('dek_campus_v1_state');
      return raw ? JSON.parse(raw) : null;
    });

    const progress = savedState?.missionProgressByKey?.['kapilarin-anlattigi-hikaye::grade-3'];
    expect(progress?.completedStages).toEqual(['kesfet', 'ogren', 'uret', 'paylas']);
    expect(progress?.completed).toBe(true);
  });
});
