import { test, expect } from '@playwright/test';

test.describe('Dijital Eğitim Kampüsü Uçtan Uca Yolculuk', () => {
  test('İlk ziyaret: kapı → karşılama → 5. sınıf → rehberli tur → harita → örnek görev ve silme', async ({
    page,
  }) => {
    await page.goto('/');

    // 1. Kampüs Giriş Kapısı
    await expect(page.getByRole('heading', { name: 'Dijital Eğitim Kampüsü' })).toBeVisible();
    await page.getByRole('button', { name: /Animasyonu Atla/i }).click();

    // 2. Karşılama Avlusu ve Onaylı Metin
    await expect(
      page.getByText(
        'Merhaba! Welcome! Kampüsümüze hoş geldin. Ben senin kampüs arkadaşınım. İstersen birlikte gezebiliriz, istersen sen kendin keşfedebilirsin.',
      ).first(),
    ).toBeVisible();

    await page.getByRole('button', { name: /Birlikte gezelim/i }).click();

    // 3. Sınıf Seçimi (5. Sınıf)
    await expect(page.getByText(/Kaçıncı sınıfa gidiyorsun/i)).toBeVisible();
    await page.getByRole('button', { name: /5\. Sınıf/i }).click();

    // 4. Rehberli Tur Durakları
    await expect(page.getByText(/1\. Durak: Gezi ve Keşif/i)).toBeVisible();
    await page.getByRole('button', { name: /Turu Bitir ve Haritaya Geç/i }).click();

    // 5. Kampüs Haritası ve Görev Başlangıcı
    await expect(page.getByRole('heading', { name: /Kampüs Haritası/i })).toBeVisible();
    await page.getByRole('link', { name: /Kapıların Anlattığı Hikâye/i }).first().click();

    // 6. Ortaokul Keşfet → Öğren → Üret → Paylaş
    await expect(
      page.getByText(
        /Sence geçmişte yapılan kapılarla bugün kullandığımız kapılar arasında hangi farklılıklar var/i,
      ),
    ).toBeVisible();
    await page.getByRole('button', { name: /Öğren Aşamasına Geç/i }).click();

    await expect(page.getByText(/This door is made of wood\./i)).toBeVisible();
    await page.getByRole('button', { name: /Üret Aşamasına Geç/i }).click();

    await page.getByRole('button', { name: /\+ Kemer/i }).click();
    await page.getByLabel(/Tasarladığın Kapının Adı/i).fill('Yıldızlı Taş Kapı');
    await page.getByLabel(/Kapı Tasarımını ve Seçim Gerekçeni Açıkla/i).fill(
      'Bu kapıyı taş ve ahşap dokuyu birleştirmek için tasarladım.',
    );

    await page.getByRole('button', { name: /Kaydet ve Paylaş Adımına Geç/i }).click();
    await expect(page.getByText(/Çalışman Hazır!/i)).toBeVisible();

    // 7. Yolculuğum sayfası ve İki Adımlı Verilerimi Sil
    await page.getByRole('link', { name: /Kampüs Yolculuğumda Gör/i }).click();
    await expect(page.getByText('Yıldızlı Taş Kapı').first()).toBeVisible();

    await page.getByRole('button', { name: /Verilerimi Sil/i }).first().click();
    await page.getByRole('button', { name: /Devam Et/i }).click();
    await page.getByRole('button', { name: /Evet, hepsini sil/i }).click();

    await expect(page.getByRole('button', { name: /Kapıyı Aç ve İçeri Gir/i })).toBeVisible();
  });
});
