import { test, expect } from '@playwright/test';

test.describe('Aşama 5.0.2 — Giriş Sonrası Doğru Ekran Akışı Doğrulaması', () => {
  test('Giriş Kapısı -> Sinematik Avlu + Karşılama Modalı -> Serbest Yürüyüş', async ({ page }) => {
    // Yerel depolamayı temizle (ilk giriş simülasyonu)
    await page.goto('/');
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();

    // 1. Sinematik Giriş Kapısı görünür
    const gateHeading = page.getByRole('heading', { name: /Dijital Eğitim Kampüsü/i });
    await expect(gateHeading).toBeVisible();
    await page.screenshot({ path: 'docs/assets/stage502_gate_screen.png' });

    // 2. "Kapıyı Aç ve İçeri Gir" butonuna tıkla
    const openGateBtn = page.getByRole('button', { name: /Kapıyı Aç ve İçeri Gir/i });
    await expect(openGateBtn).toBeVisible();
    await openGateBtn.click();

    // 3. DOĞRULAMA: Eski SVG haritası hiçbir aşamada gösterilmez!
    // Gerçek WalkableCanvasEngine Canvas elementi görünür olmalı
    const walkableCanvas = page.locator('canvas[data-testid="walkable-canvas"]');
    await expect(walkableCanvas).toBeVisible({ timeout: 10000 });

    // Eski CourtyardSceneSvg sahnede ASLA bulunmamalıdır
    const oldSvgMap = page.locator('.courtyard-scene-svg, svg[data-name="CourtyardScene"]');
    await expect(oldSvgMap).toHaveCount(0);

    // 4. Karşılama ve sınıf seçimi paneli, gerçek sinematik avlunun üzerinde modal olarak açılır
    const welcomeDialog = page.getByRole('dialog', { name: /Kampüs Avlusuna Hoş Geldin/i });
    await expect(welcomeDialog).toBeVisible();
    await expect(page.getByText(/Merhaba! Welcome! Kampüsümüze hoş geldin/i)).toBeVisible();

    const isMobile = (page.viewportSize()?.width ?? 1280) < 640;
    const overlayPath = isMobile
      ? 'docs/assets/stage502_mobile_welcome_overlay.png'
      : 'docs/assets/stage502_desktop_welcome_overlay.png';
    const freewalkPath = isMobile
      ? 'docs/assets/stage502_mobile_free_walk.png'
      : 'docs/assets/stage502_desktop_free_walk.png';

    // Sinematik avlu üzerinde karşılama modalının ekran görüntüsünü al
    await page.waitForTimeout(600);
    await page.screenshot({ path: overlayPath });

    // 5. "Kendim keşfedeceğim" butonuna tıkla -> Sınıf seçimi adımı
    const independentBtn = page.getByRole('button', { name: /Kendim keşfedeceğim/i });
    await independentBtn.click();
    await expect(page.getByRole('heading', { name: /Kaçıncı sınıfa gidiyorsun\?/i })).toBeVisible();

    // 6. "5. Sınıf" butonuna tıkla -> Karşılama modalı kapanır
    const grade5Btn = page.getByRole('button', { name: /^5\. Sınıf/i });
    await grade5Btn.click();
    await expect(welcomeDialog).not.toBeVisible();

    // 7. Serbest yürüyüş modunda ekran kontrolleri açılır ve karakter serbestçe yürüyebilir
    const settingsBtn = page.getByLabel(/Sınıf seçimi ve kampüs ayarları/i);
    await expect(settingsBtn).toBeVisible();
    await expect(page.getByText(/5\. Sınıf/i).first()).toBeVisible();
    await page.waitForTimeout(600);

    // Serbest yürüyüş durumunun ekran görüntüsünü al
    await page.screenshot({ path: freewalkPath });
  });
});
