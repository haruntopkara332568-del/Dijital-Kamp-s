import { test, expect } from '@playwright/test';

test.describe('Aşama 5.0.2 — Sınıf Seçim Panosu, Akıllı Tahta Kilidi ve Dış Kapı Çıkış Döngüsü', () => {
  test('Tam Döngü: Giriş Kapısı -> Avlu -> İngilizce Sınıfı -> Pano Seçimi -> Akıllı Tahta -> Avlu -> Dış Kapı -> Giriş Kapısı', async ({
    page,
  }) => {
    // 1. Temiz başlangıç
    await page.goto('/');
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();

    // 2. Giriş Kapısı görünür
    const gateHeading = page.getByRole('heading', { name: /Dijital Eğitim Kampüsü/i });
    await expect(gateHeading).toBeVisible();
    await page.screenshot({ path: 'docs/assets/stage502_1_gate_initial.png' });

    // 3. "Kapıyı Aç ve İçeri Gir" butonuna tıkla -> Avluya geç
    const openGateBtn = page.getByRole('button', { name: /Kapıyı Aç ve İçeri Gir/i });
    await expect(openGateBtn).toBeVisible();
    await openGateBtn.click();

    // 4. Avluda yürünebilir canvas açılır
    const walkableCanvas = page.locator('canvas[data-testid="walkable-canvas"]');
    await expect(walkableCanvas).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Yürünebilir Kampüs Avlusu/i)).toBeVisible();

    // KURAL KONTROLÜ: Avluda sınıf seçimi butonu ve menüsü KESİNLİKLE OLMAMALI
    await expect(page.getByLabel(/Sınıf seçimi ve kampüs ayarları/i)).toHaveCount(0);
    await page.screenshot({ path: 'docs/assets/stage502_2_courtyard_nograde.png' });

    // 5. Avludan İngilizce Dünyası binasına yürü ve gir
    await page.evaluate(() => {
      const engine = (window as unknown as { __WALKABLE_ENGINE__?: { setPosition: (p: { x: number; y: number }) => void; triggerActiveInteraction: () => void } }).__WALKABLE_ENGINE__;
      if (engine) {
        engine.setPosition({ x: 970, y: 335 });
      }
    });

    await page.waitForTimeout(300);
    // Etkileşim ipucu "İngilizce Sınıfına Gir" görünür
    await expect(page.getByText(/İngilizce Sınıfına Gir/i)).toBeVisible();
    await page.screenshot({ path: 'docs/assets/stage502_3_enter_english_prompt.png' });

    // Sınıfa gir
    await page.evaluate(() => {
      const engine = (window as unknown as { __WALKABLE_ENGINE__?: { triggerActiveInteraction: () => void } }).__WALKABLE_ENGINE__;
      engine?.triggerActiveInteraction();
    });

    // 6. İngilizce Sınıfındayız
    await expect(page.getByRole('button', { name: /Avluya dön/i })).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'docs/assets/stage502_4_classroom_initial.png' });

    // 7. Akıllı Tahtanın yanına git (Henüz sınıf seçilmedi)
    await page.evaluate(() => {
      const engine = (window as unknown as { __WALKABLE_ENGINE__?: { setPosition: (p: { x: number; y: number }) => void } }).__WALKABLE_ENGINE__;
      if (engine) {
        engine.setPosition({ x: 480, y: 160 });
      }
    });
    await page.waitForTimeout(300);

    // KURAL KONTROLÜ: Henüz sınıf seçilmediğinde ipucu "Önce Sınıfını Seç" olmalı
    await expect(page.getByText(/Önce Sınıfını Seç/i)).toBeVisible();

    // Akıllı tahtayı açmaya çalış -> "Önce sınıfını seç." uyarısı vermeli ve modal açılmamalı
    await page.evaluate(() => {
      const engine = (window as unknown as { __WALKABLE_ENGINE__?: { triggerActiveInteraction: () => void } }).__WALKABLE_ENGINE__;
      engine?.triggerActiveInteraction();
    });
    await expect(page.getByText(/Önce sınıfını seç\./i)).toBeVisible();
    await expect(page.getByRole('dialog', { name: /İngilizce Dünyası Akıllı Tahta/i })).toHaveCount(0);
    await page.screenshot({ path: 'docs/assets/stage502_5_smartboard_locked_warning.png' });

    // 8. Akıllı tahtanın SOLUNDAKİ Selçuklu Sınıf Seçim Panosu'na git (x: 270, y: 160)
    await page.evaluate(() => {
      const engine = (window as unknown as { __WALKABLE_ENGINE__?: { setPosition: (p: { x: number; y: number }) => void } }).__WALKABLE_ENGINE__;
      if (engine) {
        engine.setPosition({ x: 270, y: 160 });
      }
    });
    await page.waitForTimeout(300);

    // KURAL KONTROLÜ: Etkileşim ipucu "Sınıfını Seç / Değiştir" olmalı
    await expect(page.getByText(/Sınıfını Seç \/ Değiştir/i)).toBeVisible();
    await page.screenshot({ path: 'docs/assets/stage502_6_grade_board_prompt.png' });

    // Panoyla etkileşime gir -> Selçuklu Sınıf Seçim Panosu modalı açılır
    await page.evaluate(() => {
      const engine = (window as unknown as { __WALKABLE_ENGINE__?: { triggerActiveInteraction: () => void } }).__WALKABLE_ENGINE__;
      engine?.triggerActiveInteraction();
    });

    const gradeBoardDialog = page.getByRole('dialog');
    await expect(gradeBoardDialog).toBeVisible();
    await expect(page.getByRole('heading', { level: 2 })).toContainText(/SINIF SEÇİM PANOSU/i);
    await page.screenshot({ path: 'docs/assets/stage502_7_grade_board_modal.png' });

    // 5. Sınıfı seç
    const grade5Btn = page.getByRole('button', { name: /5\. Sınıf/i });
    await expect(grade5Btn).toBeVisible();
    await grade5Btn.click();

    // Başarı mesajı görünür ve modal kendiliğinden kapanır
    await expect(page.getByText(/Sınıfın başarıyla kaydedildi/i)).toBeVisible();
    await expect(gradeBoardDialog).toHaveCount(0, { timeout: 3000 });

    // 9. Sınıf seçildikten sonra tekrar Akıllı Tahtaya git (x: 480, y: 160)
    await page.evaluate(() => {
      const engine = (window as unknown as { __WALKABLE_ENGINE__?: { setPosition: (p: { x: number; y: number }) => void } }).__WALKABLE_ENGINE__;
      if (engine) {
        engine.setPosition({ x: 480, y: 160 });
      }
    });
    await page.waitForTimeout(300);

    // KURAL KONTROLÜ: Artık ipucu "Akıllı Tahtayı Aç" olmalı
    await expect(page.getByText(/Akıllı Tahtayı Aç/i)).toBeVisible();

    // Akıllı tahtayı aç
    await page.evaluate(() => {
      const engine = (window as unknown as { __WALKABLE_ENGINE__?: { triggerActiveInteraction: () => void } }).__WALKABLE_ENGINE__;
      engine?.triggerActiveInteraction();
    });

    // Akıllı tahta açılır (600ms powering-on animasyonu sonrası)
    const smartBoard = page.getByRole('dialog', { name: /İngilizce Sınıfı — Etkileşimli Akıllı Tahta/i });
    await expect(smartBoard).toBeVisible({ timeout: 6000 });
    await page.screenshot({ path: 'docs/assets/stage502_8_smartboard_opened.png' });

    // Akıllı tahtayı kapat
    const closeSmartBoardBtn = page.getByRole('button', { name: /Akıllı tahtayı kapat ve sınıfa dön/i });
    await closeSmartBoardBtn.click();
    await expect(smartBoard).toHaveCount(0);

    // 10. "Avluya Dön" butonuna tıkla ve Avluya çık
    const backToCourtyardBtn = page.getByRole('button', { name: /Avluya dön/i });
    await backToCourtyardBtn.click();
    await expect(page.getByText(/Yürünebilir Kampüs Avlusu/i)).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'docs/assets/stage502_9_back_in_courtyard.png' });

    // 11. Avluda güneye (x: 700, y: 840) dış kapıya doğru yürü
    await page.evaluate(() => {
      const engine = (window as unknown as { __WALKABLE_ENGINE__?: { setPosition: (p: { x: number; y: number }) => void } }).__WALKABLE_ENGINE__;
      if (engine) {
        engine.setPosition({ x: 700, y: 840 });
      }
    });
    await page.waitForTimeout(300);

    // KURAL KONTROLÜ: "Kampüsten Çık" etkileşim ipucu görünür
    await expect(page.getByText(/Kampüsten Çık/i)).toBeVisible();
    await page.screenshot({ path: 'docs/assets/stage502_10_exit_gate_prompt.png' });

    // Dış kapıdan çık
    await page.evaluate(() => {
      const engine = (window as unknown as { __WALKABLE_ENGINE__?: { triggerActiveInteraction: () => void } }).__WALKABLE_ENGINE__;
      engine?.triggerActiveInteraction();
    });

    // 12. KURAL KONTROLÜ: Giriş Kapısı sahnesine beyaz ekran olmadan ve tarayıcıdan çıkmadan dönülür!
    await expect(gateHeading).toBeVisible({ timeout: 5000 });
    await expect(openGateBtn).toBeVisible();
    await page.screenshot({ path: 'docs/assets/stage502_11_cycle_completed_at_gate.png' });
  });
});
