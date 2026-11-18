import { test, expect } from '@playwright/test';

test.describe('3. Sınıf Keşfet Masası — "Greetings (Selamlaşma)" Görsel Destekli Öğrenme ve Eşleştirme', () => {
  test('3. Sınıf Seçimi -> Keşfet Masasına Otur -> Bölüm A (4 Kartı Dinle) -> Bölüm B (Eşleştir) -> Hata İpucu -> Tamamlama -> Sınıfta Kalma', async ({
    page,
    isMobile,
  }) => {
    // 1. Temiz başlangıç
    await page.goto('/');
    await page.evaluate(() => window.localStorage.clear());
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
            triggerActiveInteraction: () => void;
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

    // 5. Sınıf Panosuna Git (x: 270, y: 160) ve 3. SINIFI SEÇ
    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: {
            setPosition: (p: { x: number; y: number }) => void;
            triggerActiveInteraction: () => void;
          };
        }
      ).__WALKABLE_ENGINE__;
      if (engine) {
        engine.setPosition({ x: 270, y: 160 });
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

    const gradeBoardDialog = page.getByRole('dialog');
    await expect(gradeBoardDialog).toBeVisible();

    // 3. Sınıf butonuna tıkla
    const grade3Btn = page.getByRole('button', { name: /3\. Sınıf/i });
    await expect(grade3Btn).toBeVisible();
    await grade3Btn.click();
    await page.waitForTimeout(400);

    // 6. 1. KEŞFET MASASI'na Yürü (x: 265, y: 240)
    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: {
            setPosition: (p: { x: number; y: number }) => void;
            triggerActiveInteraction: () => void;
          };
        }
      ).__WALKABLE_ENGINE__;
      if (engine) {
        engine.setPosition({ x: 265, y: 240 });
      }
    });
    await page.waitForTimeout(300);
    await expect(page.getByText(/Keşfet Masası'na Otur/i)).toBeVisible();

    // Masaya Otur -> Keşfet Masası Modalı Açılır
    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: { triggerActiveInteraction: () => void };
        }
      ).__WALKABLE_ENGINE__;
      engine?.triggerActiveInteraction();
    });

    const tableDialog = page.getByRole('dialog');
    await expect(tableDialog).toBeVisible();

    // KURAL KONTROLÜ: 3. Sınıf Keşfet Masasında Selamlaşma başlığı olmalı
    await expect(tableDialog.locator('#table-station-title')).toHaveText(
      /GREETINGS \(SELAMLAŞMA\)/i,
    );

    // KURAL KONTROLÜ: 4 Görsel Kart Bölüm A'da mevcut olmalı
    await expect(page.getByText('Hello!')).toBeVisible();
    await expect(page.getByText('Good morning!')).toBeVisible();
    await expect(page.getByText('Goodbye!')).toBeVisible();
    await expect(page.getByText('Good night!')).toBeVisible();

    // Ekran Görüntüsü — Bölüm A (Masaüstü ve Mobil)
    const prefix = isMobile ? 'grade3_greetings_mobile' : 'grade3_greetings_desktop';
    await page.screenshot({ path: `docs/assets/${prefix}_modal.png` });
    if (!isMobile) {
      await page.screenshot({ path: 'docs/assets/grade3_hello_garden_modal.png' });
    }

    // 7. BÖLÜM A: Dört kartın dinleme butonlarına basılır
    const playHello = page.getByRole('button', { name: /"Hello!" ifadesini dinle/i });
    const playMorning = page.getByRole('button', { name: /"Good morning!" ifadesini dinle/i });
    const playGoodbye = page.getByRole('button', { name: /"Goodbye!" ifadesini dinle/i });
    const playNight = page.getByRole('button', { name: /"Good night!" ifadesini dinle/i });

    await playHello.click();
    await playMorning.click();
    await playGoodbye.click();
    await playNight.click();

    // 8. "Eşleştirme Bölümüne Geç" düğmesine tıklanır
    const startMatchBtn = page.getByRole('button', { name: /Bölüm B Eşleştirme aşamasına geç/i });
    await expect(startMatchBtn).toBeEnabled();
    await startMatchBtn.click();

    // 9. BÖLÜM B: EŞLEŞTİRME EKRANI
    await expect(page.getByText(/1\. Görseller/i)).toBeVisible();
    await expect(page.getByText(/2\. İngilizce İfadeler/i)).toBeVisible();

    // 10. Hatalı Eşleştirme Testi: Sabah Güneşi görseli seçilip "Goodbye!" seçilirse ipucu verir
    const morningVisual = page.getByRole('button', { name: /Sabah Güneşi ve Çocuk görselini seç/i });
    await morningVisual.click();
    const goodbyePhrase = page.getByRole('button', { name: /"Goodbye!" ifadesini seç/i });
    await goodbyePhrase.click();

    // İpucu uyarısının çıktığı doğrulanır
    await expect(page.getByRole('alert')).toContainText(/Tekrar dene!/i);

    // 11. Doğru Eşleştirmeler:
    // A) Good morning
    await morningVisual.click();
    const morningPhrase = page.getByRole('button', { name: /"Good morning!" ifadesini seç/i });
    await morningPhrase.click();

    // B) Hello
    const helloVisual = page.getByRole('button', { name: /Selam Veren Çocuk görselini seç/i });
    await helloVisual.click();
    const helloPhrase = page.getByRole('button', { name: /"Hello!" ifadesini seç/i });
    await helloPhrase.click();

    // C) Goodbye
    const goodbyeVisual = page.getByRole('button', { name: /Ayrılan Çocuk görselini seç/i });
    await goodbyeVisual.click();
    await goodbyePhrase.click();

    // D) Good night
    const nightVisual = page.getByRole('button', { name: /Gece ve Uyuyan Çocuk görselini seç/i });
    await nightVisual.click();
    const nightPhrase = page.getByRole('button', { name: /"Good night!" ifadesini seç/i });
    await nightPhrase.click();

    // 12. TAMAMLAMA EKRANI VE ÖZET
    await expect(
      page.getByRole('heading', { name: /Harika! 4 Selamlaşma İfadesini Başarıyla Eşleştirdin!/i }),
    ).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Öğrendiğin Selamlaşma İfadeleri:/i)).toBeVisible();

    // KESİN KURAL: "Öğren Masasına Git" butonu bulunmamalıdır!
    await expect(page.getByRole('button', { name: /Öğren Masasına Git/i })).not.toBeVisible();

    // Ekran Görüntüsü — Tamamlama Ekranı
    await page.screenshot({ path: `docs/assets/${prefix}_completed.png` });
    if (!isMobile) {
      await page.screenshot({ path: 'docs/assets/grade3_hello_garden_completed.png' });
    }

    // 13. Masadan Kalk / Sınıfa Dön
    const exitBtn = tableDialog.getByRole('button', { name: /Masadan kalk/i }).first();
    await expect(exitBtn).toBeVisible();
    await exitBtn.click();

    // KURAL KONTROLÜ: Öğrenci masadan kalkınca sınıfta, masanın yanında kalmalıdır!
    await expect(tableDialog).not.toBeVisible();
    await expect(page.getByRole('button', { name: /Avluya dön/i })).toBeVisible();

    // Ekran Görüntüsü — Sınıfa Dönüş
    await page.screenshot({ path: `docs/assets/${prefix}_return_classroom.png` });
    if (!isMobile) {
      await page.screenshot({ path: 'docs/assets/grade3_hello_garden_return_classroom.png' });
    }
  });
});
