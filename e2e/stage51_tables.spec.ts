import { finishWalkableEntry } from './walkableEntry';
import { test, expect } from '@playwright/test';

test.describe('Aşama 5.1 — İngilizce Sınıfında Dört Etkileşimli Masa ve Akıllı Tahta Koruması', () => {
  test('Tam Döngü: Giriş Kapısı -> Avlu -> İngilizce Sınıfı -> Sınıf Panosu -> 4 Masa Kontrolü -> Akıllı Tahta Koruması -> Avluya Dönüş', async ({
    page,
  }) => {
    // 1. Temiz başlangıç ve yerel durum sıfırlama
    await page.goto('/');
    await page.evaluate(() => window.localStorage.clear());
    await page.evaluate(() => localStorage.removeItem('dek_campus_migrated_v1'));
    await page.reload();
    await finishWalkableEntry(page);

    // 2. Giriş Kapısı Sahnesi
    const gateHeading = page.getByRole('heading', { name: /Dijital Eğitim Kampüsü/i });
    await expect(gateHeading).toBeVisible();
    await page.screenshot({ path: 'docs/assets/stage51_1_gate.png' });

    // 3. "Kapıyı Aç ve İçeri Gir" -> Avluya geç
    const openGateBtn = page.getByRole('button', { name: /Kapıyı Aç ve İçeri Gir/i });
    await expect(openGateBtn).toBeVisible();
    await openGateBtn.click();

    // 4. Avluda yürünebilir canvas açılır
    const walkableCanvas = page.locator('canvas[data-testid="walkable-canvas"]');
    await expect(walkableCanvas).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'docs/assets/stage51_2_courtyard.png' });

    // 5. Avludan İngilizce Dünyası binasına yürü ve sınıfa gir
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
    await expect(page.getByText(/İngilizce Sınıfına Gir/i)).toBeVisible();

    // Sınıfa gir
    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: { triggerActiveInteraction: () => void };
        }
      ).__WALKABLE_ENGINE__;
      engine?.triggerActiveInteraction();
    });

    // 6. İngilizce Sınıfı sahnesindeyiz
    await expect(page.getByRole('button', { name: /Avluya dön/i })).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'docs/assets/stage51_3_classroom_tables.png' });

    // 7. Sınıf seçimi yapılmadan önce Keşfet Masası'na (Sol Ön: x:265, y:288) yaklaş
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

    // Etkileşime girmeyi dene -> "Önce Sınıf Seçim Panosu'ndan sınıfını seç." uyarısı verilmeli
    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: { triggerActiveInteraction: () => void };
        }
      ).__WALKABLE_ENGINE__;
      engine?.triggerActiveInteraction();
    });
    await expect(page.getByText(/Önce Sınıf Seçim Panosu'ndan sınıfını seç/i)).toBeVisible();

    // 8. Sınıf Seçim Panosuna git (x: 270, y: 160) ve 2. sınıfı seç
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
    await expect(page.getByText(/Sınıfını Seç \/ Değiştir/i)).toBeVisible();

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
    await page.getByRole('button', { name: /2\. Sınıf/i }).click();
    await page.waitForTimeout(400);

    // 9. KEŞFET MASASI (x: 265, y: 240)
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

    // Masaya otur -> TableStationModal açılır
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
    await expect(tableDialog.locator('#table-station-title')).toHaveText(/1\. KEŞFET MASASI/i);
    await page.screenshot({ path: 'docs/assets/stage51_4_table_kesfet.png' });

    // Masadan Kalk / Sınıfa Dön düğmesine tıkla
    const exitTableBtn = tableDialog.getByRole('button', { name: /Masadan kalk ve sınıfa dön/i });
    await expect(exitTableBtn).toBeVisible();
    await exitTableBtn.click();
    await expect(tableDialog).not.toBeVisible();

    // 10. ÖĞREN MASASI (Sağ Ön: x: 665, y: 240)
    // Keşfet tamamlanmadığı için "Önce Keşfet Masası'ndaki etkinliği tamamlamalısın." uyarısı vermelidir
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
        engine.setPosition({ x: 665, y: 240 });
      }
    });
    await page.waitForTimeout(300);
    // Keşfet henüz bitmediği için ipucu "Önce Keşfet Masası" olmalıdır
    await expect(page.getByText(/Önce Keşfet Masası/i)).toBeVisible();

    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: { triggerActiveInteraction: () => void };
        }
      ).__WALKABLE_ENGINE__;
      engine?.triggerActiveInteraction();
    });
    await expect(page.getByText(/Önce Keşfet Masası'ndaki etkinliği tamamlamalısın/i)).toBeVisible();
    await page.screenshot({ path: 'docs/assets/stage51_5_table_ogren_gated.png' });

    // 11. AKILLI TAHTA KORUMASI (x: 480, y: 160)
    // Akıllı tahtaya yaklaş -> Etkileşime gir -> Masalara yönlendiren bilgi mesajı görünür, eski görev modalı AÇILMAZ
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
        engine.setPosition({ x: 480, y: 160 });
      }
    });
    await page.waitForTimeout(400);
    await expect(page.getByText(/Akıllı Tahta/i)).toBeVisible();

    const interactSmartBoardBtn = page.getByRole('button', { name: /Etkileşimi Başlat/i });
    if (await interactSmartBoardBtn.isVisible()) {
      await interactSmartBoardBtn.click();
    } else {
      await page.keyboard.press('KeyE');
    }

    // Görev modalı açılmamalı, sınıftaki masalara yönlendirme uyarısı görünmeli
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByText(/dört masaya.*taşınmıştır/i)).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'docs/assets/stage51_6_smartboard_protected.png' });

    // 12. Sınıftan Avluya Dönüş ve Dış Kapı Tamamlanması
    const exitToCourtyardBtn = page.getByRole('button', { name: /Avluya dön/i });
    await expect(exitToCourtyardBtn).toBeVisible();
    await exitToCourtyardBtn.click();

    // Tekrar avludayız
    await expect(page.getByText(/Yürünebilir Kampüs Avlusu/i)).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'docs/assets/stage51_7_return_courtyard.png' });

    // Dış kapıya yürü ve kampüsten çıkış döngüsünü doğrula
    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: { setPosition: (p: { x: number; y: number }) => void };
        }
      ).__WALKABLE_ENGINE__;
      if (engine) {
        engine.setPosition({ x: 700, y: 840 });
      }
    });
    await page.waitForTimeout(300);
    await expect(page.getByText(/Kampüsten Çık/i)).toBeVisible();

    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: { triggerActiveInteraction: () => void };
        }
      ).__WALKABLE_ENGINE__;
      engine?.triggerActiveInteraction();
    });

    // Giriş kapısı sahnesine dönülür
    await expect(gateHeading).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'docs/assets/stage51_8_full_cycle_at_gate.png' });
  });
});
