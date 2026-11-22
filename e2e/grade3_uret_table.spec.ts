import { finishWalkableEntry } from './walkableEntry';
import { test, expect } from '@playwright/test';

test.describe('3. Sınıf Üret Masası — "Greetings (Cümlemi Oluştur)" Cümle Kurma & Doğru Cümleyi Bul', () => {
  test('3. Sınıf Seçimi -> Keşfet ve Öğren Tamamlanmış -> Üret Masasına Yürüyüş -> Senaryo A, B, C Doğrulama -> Etkinlik B -> Tekrar Oyna -> Tamamlama -> Sınıfta Kalma', async ({
    page,
    isMobile,
  }) => {
    test.setTimeout(60000);
    // 1. Temiz başlangıç ve 3. Sınıf Keşfet & Öğren Masaları Tamamlanmış Başlangıç Durumu
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
            currentStage: 'uret',
            completedStages: ['kesfet', 'ogren'],
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
    await page.evaluate(() => localStorage.removeItem('dek_campus_migrated_v1'));
    await page.reload();
    await finishWalkableEntry(page);

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

    // 5. 3. ÜRET MASASINA DOĞRU YÜRÜ (x: 265, y: 418)
    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: {
            setPosition: (p: { x: number; y: number }) => void;
          };
        }
      ).__WALKABLE_ENGINE__;
      if (engine) {
        engine.setPosition({ x: 265, y: 418 });
      }
    });
    await page.waitForTimeout(300);

    // Üret Masası Etkileşimini Tetikle
    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: { triggerActiveInteraction: () => void };
        }
      ).__WALKABLE_ENGINE__;
      engine?.triggerActiveInteraction();
    });

    // 6. 3. ÜRET MASASI MODALI AÇILIR
    const tableDialog = page.getByRole('dialog');
    await expect(tableDialog).toBeVisible({ timeout: 5000 });

    const tableTitle = tableDialog.locator('#table-station-title');
    await expect(tableTitle).toHaveText(/3\. ÜRET MASASI — GREETINGS \(CÜMLEMİ OLUŞTUR\)/i);

    // Ekran Görüntüsü Kaydı: Modal Açılışı
    const prefix = isMobile ? 'grade3_uret_mobile' : 'grade3_uret_desktop';
    await page.screenshot({ path: `docs/assets/${prefix}_modal.png` });

    // 7. DİNLE VE YAVAŞ DİNLE BUTONLARI ÇALIŞIR
    const listenBtn = tableDialog.getByRole('button', { name: /ifadesini dinle/i }).first();
    const slowListenBtn = tableDialog.getByRole('button', { name: /ifadesini yavaş dinle/i }).first();
    await expect(listenBtn).toBeVisible();
    await expect(slowListenBtn).toBeVisible();
    await listenBtn.click();
    await page.waitForTimeout(200);
    await slowListenBtn.click();
    await page.waitForTimeout(200);

    // ==========================================
    // 8. ETKİNLİK A (CÜMLEMİ OLUŞTUR) HATA VE GEÇİŞ TESTLERİ
    // ==========================================

    // --- SENARYO B: Görev 1 Yanlış Sıralama Testi ---
    // Kartlar: ['morning', 'Good']. Öğrenci önce 'morning' ardından 'Good' seçer.
    const morningBtn = tableDialog.getByRole('button', { name: /"morning" kelimesini seç/i });
    const goodBtn = tableDialog.getByRole('button', { name: /"Good" kelimesini seç/i });

    await morningBtn.click();
    await goodBtn.click();

    // 1. Yanlış sıralamanın doğru kabul edilmediğini ve açık uyarı gösterildiğini doğrula
    await expect(
      tableDialog.getByText(/Kelimelerin sırası karıştı\. Bir daha deneyelim! İpucu:/i),
    ).toBeVisible({ timeout: 5000 });

    // 2. "Yeniden Dene" butonunun görünür olduğunu ve tek tıkla temizlediğini doğrula
    const retryBtn = tableDialog.getByRole('button', { name: /Kelimeleri temizle/i });
    await expect(retryBtn).toBeVisible();
    await expect(retryBtn).toHaveText(/Yeniden Dene/i);
    await retryBtn.click();

    // Seçimlerin ve hatanın temizlendiğini doğrula
    await expect(tableDialog.getByText(/Aşağıdaki kelime kartlarına dokun/i)).toBeVisible();

    // --- SENARYO A: Görev 1 Doğru Sıralama Testi ---
    // Önce 'Good', ardından 'morning' seçilir
    await goodBtn.click();
    await morningBtn.click();

    // Hızlı çift tıklama testi (ikinci tıklama çift geçişe yol açmamalı)
    await morningBtn.click({ timeout: 200 }).catch(() => {});

    // Doğru kabul edildiğini ve öğrenci müdahalesi olmadan otomatik olarak 2. göreve geçildiğini doğrula
    const task2Heading = tableDialog.getByText(/Cümlemi Oluştur \(2\/4\)/i);
    await expect(task2Heading).toBeVisible({ timeout: 5000 });

    // --- Görev 2: Good night! (night, Good) ---
    const goodBtn2 = tableDialog.getByRole('button', { name: /"Good" kelimesini seç/i });
    const nightBtn = tableDialog.getByRole('button', { name: /"night" kelimesini seç/i });
    await goodBtn2.click();
    await nightBtn.click();

    // --- SENARYO C: Görev 3 Hello! (Goodbye!, Hello!) Tek Kelimelik Görevde Takılmama Testi ---
    const task3Heading = tableDialog.getByText(/Cümlemi Oluştur \(3\/4\)/i);
    await expect(task3Heading).toBeVisible({ timeout: 5000 });

    // Öğrenci yanlışlıkla "Goodbye!" seçer
    const goodbyeBtnInTask3 = tableDialog.getByRole('button', { name: /"Goodbye!" kelimesini seç/i });
    await goodbyeBtnInTask3.click();
    await expect(
      tableDialog.getByText(/Kelimelerin sırası karıştı\. Bir daha deneyelim!/i),
    ).toBeVisible();

    // Öğrenci doğrudan "Hello!" kartına bastığında takılmadan seçim sıfırlanıp doğru kabul edilmeli
    const helloBtn = tableDialog.getByRole('button', { name: /"Hello!" kelimesini seç/i });
    await helloBtn.click();

    // --- Görev 4: Goodbye! (Hello!, Goodbye!) ---
    const task4Heading = tableDialog.getByText(/Cümlemi Oluştur \(4\/4\)/i);
    await expect(task4Heading).toBeVisible({ timeout: 5000 });
    const goodbyeBtn = tableDialog.getByRole('button', { name: /"Goodbye!" kelimesini seç/i });
    await goodbyeBtn.click();

    // ==========================================
    // 9. ARA GEÇİŞ EKRANI (Etkinlik A Tamamlandı -> Etkinlik B)
    // ==========================================
    const startSectionBBtn = tableDialog.getByRole('button', { name: /2\. Etkinliğe Başla/i });
    await expect(startSectionBBtn).toBeVisible({ timeout: 5000 });
    await startSectionBBtn.click();
    await page.waitForTimeout(400);

    // ==========================================
    // 10. ETKİNLİK B (DOĞRU CÜMLEYİ BUL): 4 TUR
    // ==========================================
    // Tur 1: Hedef "Good morning!" vs "Good night!"
    const wrongOption1 = tableDialog.getByRole('button', { name: /"Good night!" ifadesini seç/i });
    await wrongOption1.click();
    await expect(tableDialog.getByText(/Farklı bir ifade seçtin/i)).toBeVisible();

    const correctOption1 = tableDialog.getByRole('button', { name: /"Good morning!" ifadesini seç/i });
    await correctOption1.click();
    await page.waitForTimeout(1400);

    // Tur 2: Hedef "Hello!" vs "Goodbye!"
    const correctOption2 = tableDialog.getByRole('button', { name: /"Hello!" ifadesini seç/i });
    await expect(correctOption2).toBeVisible({ timeout: 5000 });
    await correctOption2.click();
    await page.waitForTimeout(1400);

    // Tur 3: Hedef "Goodbye!" vs "Hello!"
    const correctOption3 = tableDialog.getByRole('button', { name: /"Goodbye!" ifadesini seç/i });
    await expect(correctOption3).toBeVisible({ timeout: 5000 });
    await correctOption3.click();
    await page.waitForTimeout(1400);

    // Tur 4: Hedef "Good night!" vs "Good morning!"
    const correctOption4 = tableDialog.getByRole('button', { name: /"Good night!" ifadesini seç/i });
    await expect(correctOption4).toBeVisible({ timeout: 5000 });
    await correctOption4.click();
    await page.waitForTimeout(1400);

    // ==========================================
    // 11. TAMAMLANDI EKRANI VE TEKRAR OYNA DOĞRULAMASI
    // ==========================================
    await expect(tableDialog.getByText(/Tebrikler! Üret Masası Görevini Tamamladın!/i)).toBeVisible({ timeout: 5000 });

    // Dört ifadenin özetinin göründüğü doğrulanır
    await expect(tableDialog.getByText('Hello!').first()).toBeVisible();
    await expect(tableDialog.getByText('Good morning!').first()).toBeVisible();
    await expect(tableDialog.getByText('Goodbye!').first()).toBeVisible();
    await expect(tableDialog.getByText('Good night!').first()).toBeVisible();

    // KESİN KURAL: "Paylaş Masasına Git" butonu OLMADIĞI doğrulanır
    const directTeleportBtn = tableDialog.getByRole('button', { name: /Paylaş Masasına Git/i });
    await expect(directTeleportBtn).not.toBeVisible();

    // Ekran Görüntüsü Kaydı: Tamamlama
    await page.screenshot({ path: `docs/assets/${prefix}_completed.png` });

    // "Tekrar Oyna" Butonunun Testi: Görevleri ve Kilitleri Sıfırlamalıdır
    const restartBtn = tableDialog.getByRole('button', { name: /Üret masası etkinliğini tekrar oyna/i });
    await expect(restartBtn).toBeVisible();
    await restartBtn.click();

    // Tekrar 1. Göreve dönüldüğünü doğrula
    await expect(tableDialog.getByText(/Cümlemi Oluştur \(1\/4\)/i)).toBeVisible({ timeout: 5000 });

    // Tekrar oynarken hızlıca çözerek tamamlamaya geri dön
    await tableDialog.getByRole('button', { name: /"Good" kelimesini seç/i }).click();
    await tableDialog.getByRole('button', { name: /"morning" kelimesini seç/i }).click();

    await expect(tableDialog.getByText(/Cümlemi Oluştur \(2\/4\)/i)).toBeVisible({ timeout: 5000 });
    await tableDialog.getByRole('button', { name: /"Good" kelimesini seç/i }).click();
    await tableDialog.getByRole('button', { name: /"night" kelimesini seç/i }).click();

    await expect(tableDialog.getByText(/Cümlemi Oluştur \(3\/4\)/i)).toBeVisible({ timeout: 5000 });
    await tableDialog.getByRole('button', { name: /"Hello!" kelimesini seç/i }).click();

    await expect(tableDialog.getByText(/Cümlemi Oluştur \(4\/4\)/i)).toBeVisible({ timeout: 5000 });
    await tableDialog.getByRole('button', { name: /"Goodbye!" kelimesini seç/i }).click();

    const startB2 = tableDialog.getByRole('button', { name: /2\. Etkinliğe Başla/i });
    await expect(startB2).toBeVisible({ timeout: 5000 });
    await startB2.click();

    // Etkinlik B turları
    await tableDialog.getByRole('button', { name: /"Good morning!" ifadesini seç/i }).click();
    await page.waitForTimeout(1400);
    await tableDialog.getByRole('button', { name: /"Hello!" ifadesini seç/i }).click();
    await page.waitForTimeout(1400);
    await tableDialog.getByRole('button', { name: /"Goodbye!" ifadesini seç/i }).click();
    await page.waitForTimeout(1400);
    await tableDialog.getByRole('button', { name: /"Good night!" ifadesini seç/i }).click();

    await expect(tableDialog.getByText(/Tebrikler! Üret Masası Görevini Tamamladın!/i)).toBeVisible({ timeout: 5000 });

    // ==========================================
    // 12. MASADAN KALK VE SINIFTA KALMA DOĞRULAMASI
    // ==========================================
    const leaveTableBtn = tableDialog.getByRole('button', { name: /Masadan kalk ve sınıfa dön/i }).first();
    await expect(leaveTableBtn).toBeVisible();
    await leaveTableBtn.click();

    // Modal kapanmalı
    await expect(tableDialog).not.toBeVisible();

    // Öğrenci sınıfta kalmalıdır (Avluya dön butonu görünür, sınıf zeminindeyiz)
    await expect(page.getByRole('button', { name: /Avluya dön/i })).toBeVisible();

    // Ekran Görüntüsü Kaydı: Sınıfa Dönüş
    await page.screenshot({ path: `docs/assets/${prefix}_return_classroom.png` });

    // Yerel depolamada 'uret' aşamasının kaydedildiğini ve currentStage'in 'paylas' olduğunu doğrula
    const isUretSaved = await page.evaluate(() => {
      const raw = window.localStorage.getItem('dek_campus_v1_state');
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      const progress = parsed.missionProgressByKey?.['kapilarin-anlattigi-hikaye::grade-3'];
      return progress?.completedStages?.includes('uret') && progress?.currentStage === 'paylas';
    });
    expect(isUretSaved).toBe(true);
  });
});
