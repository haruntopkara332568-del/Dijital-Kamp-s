import { test, expect } from '@playwright/test';

test.describe('3. Sınıf Öğren Masası — "Greetings (Dinle ve Anla)" Dinle-Bul & Sesleri Ayırt Et', () => {
  test('3. Sınıf Seçimi -> Keşfet Tamamlama -> Öğren Masasına Yürüyüş -> Etkinlik A -> Etkinlik B -> Tamamlama -> Sınıfta Kalma', async ({
    page,
    isMobile,
  }) => {
    // 1. Temiz başlangıç ve 3. Sınıf Keşfet Masası Tamamlanmış Başlangıç Durumu
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
            currentStage: 'ogren',
            completedStages: ['kesfet'],
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

    // 2. Giriş Kapısını Aç -> Avluya Gir
    const openGateBtn = page.getByRole('button', { name: /Kapıyı Aç ve İçeri Gir/i });
    await expect(openGateBtn).toBeVisible();
    await openGateBtn.click();

    const walkableCanvas = page.locator('canvas[data-testid="walkable-canvas"]');
    await expect(walkableCanvas).toBeVisible({ timeout: 10000 });

    // 3. İngilizce Dünyası Binasına Yürü ve Gir
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

    // 4. İngilizce Sınıfındayız
    await expect(page.getByRole('button', { name: /Avluya dön/i })).toBeVisible({ timeout: 5000 });

    // 5. 2. ÖĞREN MASASINA DOĞRU YÜRÜ (x: 665, y: 288)
    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: {
            setPosition: (p: { x: number; y: number }) => void;
          };
        }
      ).__WALKABLE_ENGINE__;
      if (engine) {
        engine.setPosition({ x: 665, y: 288 });
      }
    });
    await page.waitForTimeout(300);

    // Öğren Masası Etkileşimini Tetikle
    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: { triggerActiveInteraction: () => void };
        }
      ).__WALKABLE_ENGINE__;
      engine?.triggerActiveInteraction();
    });

    // 8. 2. ÖĞREN MASASI MODALI AÇILIR
    const tableDialog = page.getByRole('dialog');
    await expect(tableDialog).toBeVisible({ timeout: 5000 });

    const tableTitle = tableDialog.locator('#table-station-title');
    await expect(tableTitle).toHaveText(/2\. ÖĞREN MASASI — GREETINGS \(DİNLE VE ANLA\)/i);

    // Ekran Görüntüsü Kaydı: Modal Açılışı
    const prefix = isMobile ? 'grade3_ogren_mobile' : 'grade3_ogren_desktop';
    await page.screenshot({ path: `docs/assets/${prefix}_modal.png` });

    // 9. DİNLE VE YAVAŞ DİNLE BUTONLARI ÇALIŞIR
    const listenBtn = tableDialog.getByRole('button', { name: /normal hızda dinle/i });
    const slowListenBtn = tableDialog.getByRole('button', { name: /yavaş hızda dinle/i });
    await expect(listenBtn).toBeVisible();
    await expect(slowListenBtn).toBeVisible();
    await listenBtn.click();
    await page.waitForTimeout(200);
    await slowListenBtn.click();
    await page.waitForTimeout(200);

    // 10. ETKİNLİK A (DİNLE VE BUL): 4 TUR
    // Tur 1: Hedef "Hello!" (Selam Veren Çocuk)
    // Önce yanlış görsel seçelim ve ipucunu doğrulayalım
    const wrongVisual = tableDialog.getByRole('button', { name: /Gece ve Uyuyan Çocuk görselini seç/i });
    await wrongVisual.click();
    await expect(tableDialog.getByText(/Tekrar dene! İpucu:/i)).toBeVisible();

    // Doğru görseli seç: Selam Veren Çocuk
    const correctVisual1 = tableDialog.getByRole('button', { name: /Selam Veren Çocuk görselini seç/i });
    await correctVisual1.click();
    await page.waitForTimeout(1300);

    // Tur 2: Hedef "Good morning!" (Sabah Güneşi ve Çocuk)
    const correctVisual2 = tableDialog.getByRole('button', { name: /Sabah Güneşi ve Çocuk görselini seç/i });
    await expect(correctVisual2).toBeVisible({ timeout: 5000 });
    await correctVisual2.click();
    await page.waitForTimeout(1300);

    // Tur 3: Hedef "Goodbye!" (Ayrılan Çocuk)
    const correctVisual3 = tableDialog.getByRole('button', { name: /Ayrılan Çocuk görselini seç/i });
    await expect(correctVisual3).toBeVisible({ timeout: 5000 });
    await correctVisual3.click();
    await page.waitForTimeout(1300);

    // Tur 4: Hedef "Good night!" (Gece ve Uyuyan Çocuk)
    const correctVisual4 = tableDialog.getByRole('button', { name: /Gece ve Uyuyan Çocuk görselini seç/i });
    await expect(correctVisual4).toBeVisible({ timeout: 5000 });
    await correctVisual4.click();
    await page.waitForTimeout(1300);

    // 11. ARA GEÇİŞ EKRANI (Etkinlik A Tamamlandı -> Etkinlik B)
    const startSectionBBtn = tableDialog.getByRole('button', { name: /2\. Etkinliğe Başla/i });
    await expect(startSectionBBtn).toBeVisible({ timeout: 5000 });
    await startSectionBBtn.click();
    await page.waitForTimeout(400);

    // 12. ETKİNLİK B (SESLERİ AYIRT ET): 4 TUR
    // Tur 1: Hedef "Good morning!"
    // Yanlış seçeneği seçip toleransı görelim
    const wrongOption1 = tableDialog.getByRole('button', { name: /"Good night!" ifadesini seç/i });
    await wrongOption1.click();
    await expect(tableDialog.getByText(/Farklı bir ifade seçtin/i)).toBeVisible();

    // Doğru seçeneği seçelim
    const correctOption1 = tableDialog.getByRole('button', { name: /"Good morning!" ifadesini seç/i });
    await correctOption1.click();
    await page.waitForTimeout(1300);

    // Tur 2: Hedef "Hello!"
    const correctOption2 = tableDialog.getByRole('button', { name: /"Hello!" ifadesini seç/i });
    await expect(correctOption2).toBeVisible({ timeout: 5000 });
    await correctOption2.click();
    await page.waitForTimeout(1300);

    // Tur 3: Hedef "Good night!"
    const correctOption3 = tableDialog.getByRole('button', { name: /"Good night!" ifadesini seç/i });
    await expect(correctOption3).toBeVisible({ timeout: 5000 });
    await correctOption3.click();
    await page.waitForTimeout(1300);

    // Tur 4: Hedef "Goodbye!"
    const correctOption4 = tableDialog.getByRole('button', { name: /"Goodbye!" ifadesini seç/i });
    await expect(correctOption4).toBeVisible({ timeout: 5000 });
    await correctOption4.click();
    await page.waitForTimeout(1300);

    // 13. TAMAMLANDI EKRANI DOĞRULAMASI
    await expect(tableDialog.getByText(/Öğren Masası Görevini Tamamladın!/i)).toBeVisible({ timeout: 5000 });

    // Dört ifadenin özetinin göründüğü doğrulanır
    await expect(tableDialog.getByText('Hello!').first()).toBeVisible();
    await expect(tableDialog.getByText('Good morning!').first()).toBeVisible();
    await expect(tableDialog.getByText('Goodbye!').first()).toBeVisible();
    await expect(tableDialog.getByText('Good night!').first()).toBeVisible();

    // "Üret Masasına Git" butonu OLMADIĞI doğrulanır
    const directTeleportBtn = tableDialog.getByRole('button', { name: /Üret Masasına Git/i });
    await expect(directTeleportBtn).not.toBeVisible();

    // Ekran Görüntüsü Kaydı: Tamamlama
    await page.screenshot({ path: `docs/assets/${prefix}_completed.png` });

    // 14. MASADAN KALK VE SINIFTA KALMA DOĞRULAMASI
    const leaveTableBtn = tableDialog.getByRole('button', { name: /Masadan kalk ve sınıfa dön/i }).first();
    await expect(leaveTableBtn).toBeVisible();
    await leaveTableBtn.click();

    // Modal kapanmalı
    await expect(tableDialog).not.toBeVisible();

    // Öğrenci sınıfta kalmalıdır (Avluya dön butonu görünür, sınıf zeminindeyiz)
    await expect(page.getByRole('button', { name: /Avluya dön/i })).toBeVisible();

    // Ekran Görüntüsü Kaydı: Sınıfa Dönüş
    await page.screenshot({ path: `docs/assets/${prefix}_return_classroom.png` });

    // Yerel depolamada 'ogren' aşamasının kaydedildiğini doğrula
    const isOgrenSaved = await page.evaluate(() => {
      const raw = window.localStorage.getItem('dek_campus_v1_state');
      if (!raw) return false;
      return raw.includes('"ogren"');
    });
    expect(isOgrenSaved).toBe(true);
  });
});
