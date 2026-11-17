import { test, expect } from '@playwright/test';

test.describe('3. Sınıf Keşfet Masası — Sinematik "Hello! Tanışma Bahçesi" Prototipi', () => {
  test('3. Sınıf Seçimi -> Keşfet Masasına Otur -> Tanışma Bahçesi 3 Karakter Diyaloğu -> Tamamlama -> Sınıfa Dönüş', async ({
    page,
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

    // Masaya Otur -> "Hello! Tanışma Bahçesi" Prototip Modalı Açılır
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
    await expect(page.getByText(/3\. Sınıf Keşfet Masası • Özel Prototip/i)).toBeVisible();

    // KURAL KONTROLÜ: En fazla 3 karakter bulunmalı (Elif, Can, Sen)
    await expect(page.getByText('Elif', { exact: true })).toBeVisible();
    await expect(page.getByText('Can', { exact: true })).toBeVisible();
    await expect(page.getByText('Sen', { exact: true })).toBeVisible();
    await expect(page.getByText(/Karakterler: Elif, Can, Sen \(3 kişi\)/i)).toBeVisible();

    // KURAL KONTROLÜ: Telaffuz butonları ve okunuş kılavuzu
    const listenNormalBtn = page.getByRole('button', { name: /İngilizce cümleyi dinle/i });
    const listenSlowBtn = page.getByRole('button', { name: /İngilizce cümleyi yavaş ve hece vurgulu dinle/i });
    await expect(listenNormalBtn).toBeVisible();
    await expect(listenSlowBtn).toBeVisible();
    await expect(page.getByText('he-LO', { exact: true })).toBeVisible();

    await page.screenshot({ path: 'docs/assets/grade3_hello_garden_modal.png' });

    // 7. Adım 1: Elif'in Selamlaşmasına Karşılık Ver ("Hello!")
    await expect(page.getByText('"Hello!"').first()).toBeVisible();
    const opt1 = page.getByRole('button', { name: /"Hello!"/i });
    await expect(opt1).toBeVisible();
    await opt1.click();

    // 8. Adım 2: Can Adını Sorar ("What is your name?")
    await expect(page.getByText('"What is your name?"', { exact: true })).toBeVisible();
    await expect(page.getByText('UOT iz yor NEYM', { exact: true })).toBeVisible();
    const opt2 = page.getByRole('button', { name: /"I am Deniz\."/i });
    await expect(opt2).toBeVisible();
    await opt2.click();

    // 9. Adım 3: Elif & Can Memnun Olur ("Nice to meet you.")
    await expect(page.getByText('"Nice to meet you."').first()).toBeVisible();
    await expect(page.getByText('NAYS tu MİT yu', { exact: true })).toBeVisible();
    const opt3 = page.getByRole('button', { name: /"Nice to meet you\."/i });
    await expect(opt3).toBeVisible();
    await opt3.click();

    // 10. Tamamlama Ekranı
    await expect(
      page.getByRole('heading', { name: /Harika! Tanışma Bahçesi'ni Keşfettin!/i }),
    ).toBeVisible();
    await expect(page.getByText(/Öğrendiğin Tanışma Kalıpları/i)).toBeVisible();
    await page.screenshot({ path: 'docs/assets/grade3_hello_garden_completed.png' });

    // 11. Masadan Kalk / Sınıfa Dön
    const exitBtn = tableDialog.getByRole('button', { name: /Masadan Kalk \/ Sınıfa Dön/i });
    await expect(exitBtn).toBeVisible();
    await exitBtn.click();

    // KURAL KONTROLÜ: Öğrenci masadan kalkınca sınıfta, masanın yanında kalmalıdır!
    await expect(tableDialog).not.toBeVisible();
    await expect(page.getByRole('button', { name: /Avluya dön/i })).toBeVisible();
    await page.screenshot({ path: 'docs/assets/grade3_hello_garden_return_classroom.png' });
  });
});
