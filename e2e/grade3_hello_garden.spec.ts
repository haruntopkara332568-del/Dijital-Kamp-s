import { test, expect } from '@playwright/test';

test.describe('3. Sınıf Keşfet Masası — "Hello! Tanışma Bahçesi" 2.5D Canlı Bahçe Simülasyonu', () => {
  test('3. Sınıf Seçimi -> Keşfet Masasına Otur -> 4 Etkileşimli Canlı Bahçe -> Hata Geri Bildirimi -> Sayı Etkileşimi -> Tamamlama -> Sınıfta Kalma', async ({
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

    // Masaya Otur -> "Hello! Tanışma Bahçesi" Minyatür Simülasyonu Açılır
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

    // KURAL KONTROLÜ: 3. Sınıf Keşfet Masasında özel Tanışma Bahçesi başlığı olmalı
    await expect(tableDialog.locator('#table-station-title')).toHaveText(
      /HELLO! TANIŞMA BAHÇESİ/i,
    );
    await expect(page.getByText(/3\. Sınıf Keşfet Masası Minyatür Simülasyonu/i)).toBeVisible();

    // KURAL KONTROLÜ: Bahçede 3 çocuk karakter bulunmalı (Ali, Ece, Can)
    await expect(page.getByRole('button', { name: /Ali ile konuş/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Ece ile konuş/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Can ile konuş/i })).toBeVisible();

    // KURAL KONTROLÜ: Telaffuz butonları (Dinle + Yavaş Dinle)
    const listenNormalBtn = page.getByRole('button', { name: /Ali'nin selamını dinle/i });
    const listenSlowBtn = page.getByRole('button', { name: /Ali'nin selamını yavaş dinle/i });
    await expect(listenNormalBtn).toBeVisible();
    await expect(listenSlowBtn).toBeVisible();

    const prefix = isMobile ? 'grade3_hello_garden_mobile' : 'grade3_hello_garden_desktop';
    await page.screenshot({ path: `docs/assets/${prefix}_modal.png` });
    if (!isMobile) {
      await page.screenshot({ path: 'docs/assets/grade3_hello_garden_modal.png' });
    }

    // 7. ETKİLEŞİM 1: SELAMLAŞMA (ALİ)
    // Yanlış cevap ("Goodbye!") verilirse ilerlememeli ve geri bildirim sunulmalı
    const wrongGoodbyeBtn = page.getByRole('button', { name: /"Goodbye!"/i });
    await expect(wrongGoodbyeBtn).toBeVisible();
    await wrongGoodbyeBtn.click();
    await expect(page.getByRole('alert')).toContainText(/Henüz yeni karşılaştık/i);

    // Doğru cevap ("Hello!") ile selamlaşılır
    const correctHelloBtn = page.getByRole('button', { name: /"Hello!"/i });
    await expect(correctHelloBtn).toBeVisible();
    await correctHelloBtn.click();

    // 8. ETKİLEŞİM 2: TANIŞMA (ECE)
    // Ece'nin adını sorma ("What's your name?")
    const askNameBtn = page.getByRole('button', { name: /"What's your name\?"/i });
    await expect(askNameBtn).toBeVisible({ timeout: 5000 });
    await askNameBtn.click();

    // Ece "My name is Ece." cevabını verir -> Öğrenci kendini tanıtır ("My name is Deniz.")
    const introduceBtn = page.getByRole('button', { name: /"My name is Deniz\."/i });
    await expect(introduceBtn).toBeVisible({ timeout: 5000 });
    await introduceBtn.click();

    // 9. ETKİLEŞİM 3: YAŞ SORMA (CAN)
    // Can'ın yaşını sorma ("How old are you?")
    const askAgeBtn = page.getByRole('button', { name: /"How old are you\?"/i });
    await expect(askAgeBtn).toBeVisible({ timeout: 5000 });
    await askAgeBtn.click();

    // Can "I'm nine." der -> Bahçedeki interaktif sayı tabelasından 9 sayısı seçilir
    const number9Btn = page.getByRole('button', { name: /Sayı 9/i });
    await expect(number9Btn).toBeVisible({ timeout: 5000 });
    await number9Btn.click();

    // 10. ETKİLEŞİM 4: VEDALAŞMA (TÜM ARKADAŞLAR)
    const farewellBtn = page.getByRole('button', { name: /"Goodbye!"/i });
    await expect(farewellBtn).toBeVisible({ timeout: 5000 });
    await farewellBtn.click();

    // 11. TAMAMLAMA EKRANI VE PEDAGOJİK ÖZET
    await expect(
      page.getByRole('heading', { name: /Harika! Tanışma Bahçesi Simülasyonunu Tamamladın!/i }),
    ).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Öğrendiğin 4 Temel İfade/i)).toBeVisible();

    // KESİN KURAL: "Öğren Masasına Git" butonu kesinlikle olmamalıdır!
    await expect(page.getByRole('button', { name: /Öğren Masasına Git/i })).not.toBeVisible();

    await page.screenshot({ path: `docs/assets/${prefix}_completed.png` });
    if (!isMobile) {
      await page.screenshot({ path: 'docs/assets/grade3_hello_garden_completed.png' });
    }

    // 12. Masadan Kalk / Sınıfa Dön
    const exitBtn = tableDialog.getByRole('button', { name: /Masadan kalk/i }).first();
    await expect(exitBtn).toBeVisible();
    await exitBtn.click();

    // KURAL KONTROLÜ: Öğrenci masadan kalkınca sınıfta, masanın yanında kalmalıdır!
    await expect(tableDialog).not.toBeVisible();
    await expect(page.getByRole('button', { name: /Avluya dön/i })).toBeVisible();
    await page.screenshot({ path: `docs/assets/${prefix}_return_classroom.png` });
    if (!isMobile) {
      await page.screenshot({ path: 'docs/assets/grade3_hello_garden_return_classroom.png' });
    }
  });
});
