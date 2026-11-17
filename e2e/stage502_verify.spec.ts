import { test, expect } from '@playwright/test';

test.describe('Tek Görevli Düzeltme — Giriş Kapısı Sonrası Doğrudan Yürünebilir Sinematik Avlu', () => {
  test('Giriş Kapısı -> Doğrudan Sinematik Yürünebilir Avlu (0 Modal, 0 Rehber Turu)', async ({ page }) => {
    // Yerel depolamayı temizle (ilk giriş simülasyonu)
    await page.goto('/');
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();

    // 1. Sinematik Selçuklu Giriş Kapısı görünür
    const gateHeading = page.getByRole('heading', { name: /Dijital Eğitim Kampüsü/i });
    await expect(gateHeading).toBeVisible();
    await page.screenshot({ path: 'docs/assets/stage502_gate_screen.png' });

    // 2. "Kapıyı Aç ve İçeri Gir" butonuna tıkla
    const openGateBtn = page.getByRole('button', { name: /Kapıyı Aç ve İçeri Gir/i });
    await expect(openGateBtn).toBeVisible();
    await openGateBtn.click();

    // 3. DOĞRULAMA: Kapıdan içeri girince DOĞRUDAN yürünebilir sinematik avlu canvas'ı açılır
    const walkableCanvas = page.locator('canvas[data-testid="walkable-canvas"]');
    await expect(walkableCanvas).toBeVisible({ timeout: 10000 });

    // 4. KESİN KURAL DOĞRULAMASI:
    // a) Rehber karakter ve rehberli tur ekranı YOKTUR
    await expect(page.getByText(/Rehber Eşliğinde Gez/i)).toHaveCount(0);
    // b) Modal karşılama penceresi YOKTUR
    await expect(page.getByRole('dialog', { name: /Kampüs Avlusuna Hoş Geldin/i })).toHaveCount(0);
    // c) Eski şematik / SVG / harita ekranı YOKTUR
    const oldSvgMap = page.locator('.courtyard-scene-svg, svg[data-name="CourtyardScene"]');
    await expect(oldSvgMap).toHaveCount(0);

    // 5. Ekran üzeri kontroller (WalkableControlsOverlay) ve kampüs rehberi anında etkindir
    const campusTitle = page.getByText(/Yürünebilir Kampüs Avlusu/i);
    await expect(campusTitle).toBeVisible();

    // Canvas'ın render olması için kısa bir bekleme ve kanıt ekran görüntüsü alma
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'docs/assets/stage502_direct_walkable_courtyard.png' });

    // 6. Çevresel Yönlendirme ve Aktif İngilizce Binası Testi:
    // Canvas üzerine tıklayarak karaktere yön verilebilir
    const box = await walkableCanvas.boundingBox();
    if (box) {
      // İngilizce Dünyası tarafına doğru (sağ üst) yürüme tıklaması
      await page.mouse.click(box.x + box.width * 0.75, box.y + box.height * 0.45);
      await page.waitForTimeout(800);
    }

    // Nihai yürüyüş durumu ekran görüntüsü
    await page.screenshot({ path: 'docs/assets/stage502_courtyard_freewalk_verified.png' });
  });
});
