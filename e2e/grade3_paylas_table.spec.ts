import { test, expect } from '@playwright/test';

test.describe('3. Sınıf Paylaş Masası — "Greetings (Birlikte Konuşalım)" Karşılık Ver & Sen Başlat', () => {
  test('3. Sınıf Seçimi -> Keşfet, Öğren ve Üret Tamamlanmış -> Paylaş Masasına Yürüyüş -> Etkinlik A -> Etkinlik B -> Tamamlama -> Sınıfta Kalma', async ({
    page,
    isMobile,
  }) => {
    console.log('>>> [E2E] Step 1: Navigating to home and seeding state...');
    // 1. Temiz başlangıç ve 3. Sınıf Keşfet, Öğren, Üret Masaları Tamamlanmış Başlangıç Durumu
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

    console.log('>>> [E2E] Step 2: Opening entrance gate...');
    // 2. Giriş Kapısını Aç -> Avluya Gir
    const openGateBtn = page.getByRole('button', { name: /Kapıyı Aç ve İçeri Gir/i });
    await expect(openGateBtn).toBeVisible();
    await openGateBtn.click();

    const walkableCanvas = page.locator('canvas[data-testid="walkable-canvas"]');
    await expect(walkableCanvas).toBeVisible({ timeout: 10000 });

    console.log('>>> [E2E] Step 3: Entering English building...');
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

    console.log('>>> [E2E] Step 4: Arrived in classroom, walking to Paylas table (x: 665, y: 418)...');
    // 4. İngilizce Sınıfındayız
    await expect(page.getByRole('button', { name: /Avluya dön/i })).toBeVisible({ timeout: 5000 });

    // 5. 4. PAYLAŞ MASASINA DOĞRU YÜRÜ (x: 665, y: 418)
    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: {
            setPosition: (p: { x: number; y: number }) => void;
          };
        }
      ).__WALKABLE_ENGINE__;
      if (engine) {
        engine.setPosition({ x: 665, y: 418 });
      }
    });
    await page.waitForTimeout(300);

    console.log('>>> [E2E] Step 5: Triggering interaction at Paylas table...');
    // 6. 4. Paylaş Masası ile Etkileşime Geç
    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: { triggerActiveInteraction: () => void };
        }
      ).__WALKABLE_ENGINE__;
      engine?.triggerActiveInteraction();
    });

    // 7. Paylaş Masası Modalının Açıldığını Doğrula
    const tableDialog = page.getByRole('dialog');
    await expect(tableDialog).toBeVisible({ timeout: 5000 });

    const modalTitle = tableDialog.locator('#table-station-title');
    await expect(modalTitle).toBeVisible({ timeout: 5000 });
    await expect(modalTitle).toContainText(/4\. PAYLAŞ MASASI — GREETINGS \(BİRLİKTE KONUŞALIM\)/i);

    console.log('>>> [E2E] Step 6: Modal opened, taking modal screenshot...');
    // Ekran Görüntüsü Kaydı: Modal Açılışı
    const prefix = isMobile ? 'grade3_paylas_mobile' : 'grade3_paylas_desktop';
    await page.screenshot({ path: `docs/assets/${prefix}_modal.png` });

    console.log('>>> [E2E] Step 7: Starting Etkinlik A...');
    // ==========================================
    // 8. ETKİNLİK A — ARKADAŞIM NE SÖYLÜYOR?
    // ==========================================
    await expect(tableDialog.getByText(/Etkinlik A — Arkadaşım Ne Söylüyor\?/i)).toBeVisible();
    await expect(tableDialog.getByText(/Karşılık Ver \(1\/4\)/i)).toBeVisible();

    // Dinle butonları
    const listenBtn = tableDialog.getByRole('button', { name: /ifadesini dinle/i }).first();
    const slowListenBtn = tableDialog.getByRole('button', { name: /ifadesini yavaş dinle/i }).first();
    await expect(listenBtn).toBeVisible();
    await expect(slowListenBtn).toBeVisible();
    await listenBtn.click();
    await page.waitForTimeout(200);
    await slowListenBtn.click();
    await page.waitForTimeout(200);

    // Yanlış seçeneği dene ("Good night!")
    const wrongOptA1 = tableDialog.getByRole('button', { name: /"Good night!" ifadesini seç/i });
    await wrongOptA1.click();

    // Pedagojik ipucu mesajı
    await expect(tableDialog.getByText(/Farklı bir karşılık seçtin\. İpucu:/i)).toBeVisible();

    // Doğru seçeneği seç ("Good morning!")
    const correctOptA1 = tableDialog.getByRole('button', { name: /"Good morning!" ifadesini seç/i });
    await correctOptA1.click();
    await page.waitForTimeout(1600);

    // Durum 2 (Zeynep -> Hello!)
    await expect(tableDialog.getByText(/Karşılık Ver \(2\/4\)/i)).toBeVisible({ timeout: 5000 });
    const correctOptA2 = tableDialog.getByRole('button', { name: /"Hello!" ifadesini seç/i });
    await correctOptA2.click();
    await page.waitForTimeout(1600);

    // Durum 3 (Emir -> Goodbye!)
    await expect(tableDialog.getByText(/Karşılık Ver \(3\/4\)/i)).toBeVisible({ timeout: 5000 });
    const correctOptA3 = tableDialog.getByRole('button', { name: /"Goodbye!" ifadesini seç/i });
    await correctOptA3.click();
    await page.waitForTimeout(1600);

    // Durum 4 (Annesi -> Good night!)
    await expect(tableDialog.getByText(/Karşılık Ver \(4\/4\)/i)).toBeVisible({ timeout: 5000 });
    const correctOptA4 = tableDialog.getByRole('button', { name: /"Good night!" ifadesini seç/i });
    await correctOptA4.click();
    await page.waitForTimeout(1600);

    console.log('>>> [E2E] Step 8: Intermediate transition screen...');
    // ==========================================
    // 9. ARA GEÇİŞ EKRANI
    // ==========================================
    await expect(tableDialog.getByText(/Karşılıklı Konuşmaları Başarıyla Tamamladın!/i)).toBeVisible({ timeout: 5000 });
    await expect(tableDialog.getByText(/Arkadaşlarının selamlarına doğru karşılıklar verdin\./i)).toBeVisible();

    const startEtkinlikBBtn = tableDialog.getByRole('button', { name: /2\. Etkinliğe Başla/i });
    await expect(startEtkinlikBBtn).toBeVisible();
    await startEtkinlikBBtn.click();
    await page.waitForTimeout(400);

    console.log('>>> [E2E] Step 9: Starting Etkinlik B...');
    // ==========================================
    // 10. ETKİNLİK B — ŞİMDİ SEN KONUŞ!
    // ==========================================
    await expect(tableDialog.getByText(/Etkinlik B — Şimdi Sen Konuş!/i)).toBeVisible({ timeout: 5000 });
    await expect(tableDialog.getByText(/Sen Başlat \(1\/4\)/i)).toBeVisible();

    // Yanlış seçeneği dene ("Good night!")
    const wrongOptB1 = tableDialog.getByRole('button', { name: /"Good night!" ifadesini seç/i });
    await wrongOptB1.click();
    await expect(tableDialog.getByText(/Farklı bir ifade seçtin\. İpucu:/i)).toBeVisible();

    // Doğru seçeneği seç ("Good morning!")
    const correctOptB1 = tableDialog.getByRole('button', { name: /"Good morning!" ifadesini seç/i });
    await correctOptB1.click();
    await page.waitForTimeout(1600);

    // Tur 2 (Bahçede selamlaşma -> Hello!)
    await expect(tableDialog.getByText(/Sen Başlat \(2\/4\)/i)).toBeVisible({ timeout: 5000 });
    const correctOptB2 = tableDialog.getByRole('button', { name: /"Hello!" ifadesini seç/i });
    await correctOptB2.click();
    await page.waitForTimeout(1600);

    // Tur 3 (Okul çıkışı veda -> Goodbye!)
    await expect(tableDialog.getByText(/Sen Başlat \(3\/4\)/i)).toBeVisible({ timeout: 5000 });
    const correctOptB3 = tableDialog.getByRole('button', { name: /"Goodbye!" ifadesini seç/i });
    await correctOptB3.click();
    await page.waitForTimeout(1600);

    // Tur 4 (Gece uyku vakti -> Good night!)
    await expect(tableDialog.getByText(/Sen Başlat \(4\/4\)/i)).toBeVisible({ timeout: 5000 });
    const correctOptB4 = tableDialog.getByRole('button', { name: /"Good night!" ifadesini seç/i });
    await correctOptB4.click();
    await page.waitForTimeout(1600);

    console.log('>>> [E2E] Step 10: Completion screen...');
    // ==========================================
    // 11. TAMAMLAMA EKRANI & VERİ KONTROLÜ
    // ==========================================
    await expect(
      tableDialog.getByText(/Harika! Dört öğrenme masasını da tamamladın\. Artık Büyük Görev'e hazırsın! 🏆/i),
    ).toBeVisible({ timeout: 5000 });

    // Dört ifadenin özetinin göründüğü doğrulanır
    await expect(tableDialog.getByText('Hello!').first()).toBeVisible();
    await expect(tableDialog.getByText('Good morning!').first()).toBeVisible();
    await expect(tableDialog.getByText('Goodbye!').first()).toBeVisible();
    await expect(tableDialog.getByText('Good night!').first()).toBeVisible();

    // Ekran Görüntüsü Kaydı: Tamamlama
    await page.screenshot({ path: `docs/assets/${prefix}_completed.png` });

    // LocalStorage verisini kontrol et: paylas tamamlanmış olmalı
    const studentState = await page.evaluate(() => {
      const raw = window.localStorage.getItem('dek_campus_v1_state');
      return raw ? JSON.parse(raw) : null;
    });
    const missionProg = studentState?.missionProgressByKey?.['kapilarin-anlattigi-hikaye::grade-3'];
    expect(missionProg?.completedStages).toContain('paylas');
    expect(missionProg?.completedStages).toEqual(expect.arrayContaining(['kesfet', 'ogren', 'uret', 'paylas']));
    expect(missionProg?.completed).toBe(true);

    console.log('>>> [E2E] Step 11: Leaving table and checking classroom return...');
    // ==========================================
    // 12. MASADAN KALK / SINIFTA KALMA KONTROLÜ
    // ==========================================
    const exitBtn = tableDialog.getByRole('button', { name: /Masadan kalk ve sınıfa dön/i }).first();
    await expect(exitBtn).toBeVisible();
    await exitBtn.click();

    // Modal kapanmalı
    await expect(tableDialog).not.toBeVisible({ timeout: 5000 });

    // Öğrenci sınıfta kalmalı: "Avluya dön" butonu görünür olmalı
    await expect(page.getByRole('button', { name: /Avluya dön/i })).toBeVisible();

    // Ekran Görüntüsü Kaydı: Sınıfta Kalma
    await page.screenshot({ path: `docs/assets/${prefix}_return_classroom.png` });

    console.log('>>> [E2E] Test successfully finished!');
  });
});
