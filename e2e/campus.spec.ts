import { test, expect } from '@playwright/test';

test.describe('Dijital Eğitim Kampüsü Uçtan Uca Yolculuk', () => {
  test('İlk ziyaret: kapı → karşılama → 5. sınıf → rehberli tur → harita → boş üretim engeli → üretim/kaydet/tamamla → yolculuğum → silme', async ({
    page,
  }) => {
    await page.goto('/');

    // 1. Kampüs Giriş Kapısı
    await expect(page.getByRole('heading', { name: 'Dijital Eğitim Kampüsü' })).toBeVisible();
    await page.getByRole('button', { name: /Animasyonu Atla/i }).click();

    // 2. Karşılama Avlusu ve Onaylı Metin
    await expect(
      page
        .getByText(
          'Merhaba! Welcome! Kampüsümüze hoş geldin. Ben senin kampüs arkadaşınım. İstersen birlikte gezebiliriz, istersen sen kendin keşfedebilirsin.',
        )
        .first(),
    ).toBeVisible();

    await page.getByRole('button', { name: /Birlikte gezelim/i }).click();

    // 3. Sınıf Seçimi (5. Sınıf)
    await expect(page.getByText(/Kaçıncı sınıfa gidiyorsun/i)).toBeVisible();
    await page.getByRole('button', { name: /5\. Sınıf/i }).click();

    // 4. Rehberli Tur Durakları
    await expect(page.getByText(/1\. Durak: Gezi ve Keşif/i)).toBeVisible();
    await page.getByRole('button', { name: /Turu Bitir ve Haritaya Geç/i }).click();

    // 5. Kampüs Haritası: 5 yapı ve çapraz karmaşasız 5 ana taş yol
    await expect(page.getByRole('heading', { name: /Kampüs Haritası/i })).toBeVisible();
    const pathCount = await page.locator('line[data-path-id^="plaza-"]').count();
    expect(pathCount).toBe(5);
    await page.getByRole('link', { name: /Kapıların Anlattığı Hikâye/i }).first().click();

    // 6. Ortaokul Keşfet → Öğren
    await expect(
      page.getByText(
        /Sence geçmişte yapılan kapılarla bugün kullandığımız kapılar arasında hangi farklılıklar var/i,
      ),
    ).toBeVisible();
    await page.getByRole('button', { name: /Öğren Aşamasına Geç/i }).click();

    await expect(page.getByText(/This door is made of wood\./i)).toBeVisible();
    // Önce sol sütun seçilmeden Türkçe karta basınca yönlendirici geri bildirim vermeli
    await page.getByRole('button', { name: 'Ahşap', exact: true }).click();
    await expect(page.getByText(/Önce sol sütundan bir İngilizce kelime seç/i)).toBeVisible();

    // Doğru eşleştirme geri bildirimi
    await page.getByRole('button', { name: 'Wood', exact: true }).click();
    await page.getByRole('button', { name: 'Ahşap', exact: true }).click();
    await expect(page.getByText(/Doğru eşleşme!/i)).toBeVisible();

    await page.getByRole('button', { name: /Üret Aşamasına Geç/i }).click();

    // 7. Boş veya yalnızca noktalama işareti içeren üretim engeli
    await page.getByRole('button', { name: 'Selçuklu Turkuazı' }).click();
    await page.getByLabel(/Tasarladığın Kapının Adı/i).fill('Yalnızca İsim Denemesi');
    await page.getByLabel(/Kapı Tasarımını ve Seçim Gerekçeni Açıkla/i).fill('!!!');
    await page.getByRole('button', { name: /Kaydet ve Paylaş Adımına Geç/i }).click();
    await expect(page.getByText(/Yalnızca noktalama işaretleri yazılı anlatım sayılmaz/i).first()).toBeVisible();
    await expect(page.getByText(/Çalışman Hazır!/i)).not.toBeVisible();

    // 8. Alan gezintisi görev ilerlemesini silmemeli (Kaydedilmemiş değişiklik uyarısından çıkış)
    await page.getByRole('link', { name: /Görev Panosu/i }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: /Kaydetmeden Çık/i }).click();
    await expect(page.getByRole('heading', { name: /Keşif Görevleri Panosu/i })).toBeVisible();
    await page.getByRole('link', { name: /Göreve Başla/i }).first().click();
    // Geri dönüldüğünde Üret adımı ve önceki Öğren eşleştirmesi korunmalı
    await expect(page.getByLabel(/Tasarladığın Kapının Adı/i)).toBeVisible();
    await page.getByRole('button', { name: /2\. Öğren/i }).click();
    await expect(page.getByText(/Kelime Eşleştirme \(1 \/ 5\)/i)).toBeVisible();
    await page.getByRole('button', { name: /3\. Üret/i }).click();

    // 9. Geçerli özgün üretim (hazır şekil + malzeme + ad + gerekçeli anlatım)
    await page.getByRole('button', { name: /\+ Kemer/i }).click();
    await page.getByRole('button', { name: 'Taş ve Ahşap', exact: true }).click();
    await page.getByLabel(/Tasarladığın Kapının Adı/i).fill('Yıldızlı Taş Kapı');
    await page.getByLabel(/Kapı Tasarımını ve Seçim Gerekçeni Açıkla/i).fill(
      'Bu kapıyı taş ve ahşap dokuyu birleştirmek için tasarladım.',
    );

    await page.getByRole('button', { name: /Kaydet ve Paylaş Adımına Geç/i }).click();
    await expect(page.getByText(/Çalışman Hazır!/i)).toBeVisible();

    // Yalnızca kaydetmek görevi tamamlamaz; "Görevi Tamamla" ile tamamlanır (PNG indirmeden!)
    await page.getByRole('button', { name: /Görevi Tamamla/i }).click();
    await expect(page.getByText(/Görevin Tamamlandı!/i)).toBeVisible();

    // 10. Yolculuğum sayfası: Görevlerim, Öğrenme Yolculuğum, Çalışmalarım + Eser İnceleme + Verilerimi Sil
    await page.getByRole('link', { name: /Kampüs Yolculuğumda Gör/i }).click();
    await expect(page.getByRole('heading', { name: 'Görevlerim' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Öğrenme Yolculuğum' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Çalışmalarım' })).toBeVisible();
    await expect(page.getByText('Yıldızlı Taş Kapı').first()).toBeVisible();
    await expect(page.getByText('Cihaza Kayıtlı').first()).toBeVisible();

    await page.getByRole('button', { name: /Çalışmayı İncele/i }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Kapat', exact: true }).click();

    await page.getByRole('button', { name: /Verilerimi Sil/i }).first().click();
    await page.getByRole('button', { name: /Devam Et/i }).click();
    await page.getByRole('button', { name: /Evet, hepsini sil/i }).click();

    await expect(page.getByRole('button', { name: /Kapıyı Aç ve İçeri Gir/i })).toBeVisible();
    await page.goto('/yolculugum');
    await expect(page.getByText(/Henüz Başladığın Bir Görev Yok/i)).toBeVisible();
  });

  test('2. sınıf akışı (basit çizim + serbest çizim + isteğe bağlı yazı), klavye erişimi ve 4 ekran boyutunda taşmasızlık', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/');
    await page.getByRole('button', { name: /Animasyonu Atla/i }).click();
    await page.getByRole('button', { name: /Kendim keşfedeceğim/i }).click();
    await page.getByRole('button', { name: /2\. Sınıf/i }).click();

    await expect(page.getByRole('heading', { name: /Kampüs Haritası/i })).toBeVisible();

    // 4 ekran boyutunda yatay taşma kontrolü (Kampüs Haritası + dokunmatik hedef boyutu)
    for (const vp of [
      { width: 360, height: 740 },
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 1280, height: 840 },
    ]) {
      await page.setViewportSize(vp);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow).toBe(false);
    }

    // 390px mobil boyutta görünür butonların minimum 44x44 dokunmatik alan kontrolü
    await page.setViewportSize({ width: 390, height: 844 });
    const smallButtons = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('main button, main a'));
      return els
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44);
        })
        .map((el) => ({ text: el.textContent?.trim(), w: el.getBoundingClientRect().width, h: el.getBoundingClientRect().height }));
    });
    expect(smallButtons).toEqual([]);

    await page.setViewportSize({ width: 1280, height: 840 });
    await page.getByRole('link', { name: /Kapıların Anlattığı Hikâye/i }).first().click();

    // 2. sınıf Öğren aşamasında doğru soru biçimi
    await page.getByRole('button', { name: /Öğren Aşamasına Geç/i }).click();
    await expect(page.getByText(/[“"]Door[”"] kelimesinin Türkçe karşılığı hangisidir\?/i)).toBeVisible();

    // 2. sınıf Üret aşamasında başlangıçta sade araçlar + genişletilebilir panel
    await page.getByRole('button', { name: /Üret Aşamasına Geç/i }).click();
    await expect(page.getByRole('button', { name: /Daha Fazla Araç ve Şekil/i })).toBeVisible();

    // Serbest çizim yaparak üretim (yazı yazmadan!)
    const canvas = page.getByLabel(/Kapı tasarım ve çizim alanı/i);
    await canvas.scrollIntoViewIfNeeded();
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      await page.mouse.move(box.x + 80, box.y + 80);
      await page.mouse.down();
      await page.mouse.move(box.x + 180, box.y + 150);
      await page.mouse.up();
    }

    await page.getByRole('button', { name: /Kaydet ve Paylaş Adımına Geç/i }).click();
    await expect(page.getByText(/Çalışman Hazır!/i)).toBeVisible();

    // Klavyeyle şekil hareket ettirme kontrolü
    await page.getByRole('button', { name: /Önceki Adım \(Üret\)/i }).click();
    await page.getByRole('button', { name: /\+ Kemer/i }).click();
    await canvas.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByText(/Seçili şekil:/i)).toBeVisible();
  });

  test('Aşama 2: Aksaray Kültürel Miras Rotası (4 durak, 5. sınıf KEŞFET → ÖĞREN → ÜRET → PAYLAŞ ve taşmasızlık)', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Animasyonu Atla/i }).click();
    await page.getByRole('button', { name: /Kendim keşfedeceğim/i }).click();
    await page.getByRole('button', { name: /5\. Sınıf/i }).click();

    // Gezi ve Keşif alanından 4 Aksaray durağını kontrol et ve rotayı başlat
    await page.getByRole('link', { name: /Gezi ve Keşif/i }).first().click();
    await expect(page.getByRole('heading', { name: /Aksaray Kültürel Miras Durakları/i })).toBeVisible();
    await expect(page.locator('p', { hasText: /^Sultanhanı Kervansarayı$/ })).toBeVisible();
    await expect(page.locator('p', { hasText: /^Eğri Minare \(Kızıl Minare\)$/ })).toBeVisible();
    await expect(page.locator('p', { hasText: /^Zinciriye Medresesi$/ })).toBeVisible();
    await expect(page.locator('p', { hasText: /^Ihlara Vadisi ve Melendiz Çayı$/ })).toBeVisible();
    // Aksaray Ulu Cami ilk rotada yer almaz, yalnızca Yakında notunda belirtilir
    await expect(page.getByText(/Aksaray Merkez kültürel miras rotası — Ulu Cami/i)).toBeVisible();

    await page.getByRole('link', { name: /Aksaray Rotasını Başlat/i }).click();

    // Keşfet (Ortaokul): 4 durak ve 4 gözlem boyutu
    await expect(page.getByRole('heading', { name: /Aksaray Kültürel Miras Rotası/i })).toBeVisible();
    await page.getByRole('button', { name: /Sultanhanı kesme taş, Eğri Minare kırmızı tuğla/i }).click();
    await page.getByRole('button', { name: /Öğren Aşamasına Geç/i }).click();

    // Öğren: 5 kelime + örnek cümle
    await expect(page.getByText(/This courtyard has a stone arch and red brick walls\./i)).toBeVisible();
    await page.getByRole('button', { name: 'Heritage', exact: true }).click();
    await page.getByRole('button', { name: 'Miras / Kültürel Miras', exact: true }).click();
    await expect(page.getByText(/Doğru eşleşme!/i)).toBeVisible();
    await page.getByRole('button', { name: /Üret Aşamasına Geç/i }).click();

    // Üret: tek geçerli üretim biçimi (yazılı anlatım) ile tamamlama
    await page.getByLabel(/Aksaray Çalışmanın Adı/i).fill('Aksaray Taş ve Tuğla Rotam');
    await page.getByRole('button', { name: 'Kırmızı Tuğla ve Çini', exact: true }).click();
    await page.getByRole('button', { name: 'Brick (Tuğla)' }).click();
    await page.getByLabel(/Aksaray Gözlemini ve Tasarım Gerekçeni Açıkla/i).fill(
      'Eğri Minare kırmızı brick gövdesiyle, Sultanhanı ise taş avlusuyla dikkat çekiyor.',
    );

    // Mobil ve masaüstü yatay taşma kontrolü
    for (const vp of [
      { width: 390, height: 844 },
      { width: 1280, height: 840 },
    ]) {
      await page.setViewportSize(vp);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow).toBe(false);
    }

    await page.getByRole('button', { name: /Kaydet ve Paylaş Adımına Geç/i }).click();
    await expect(page.getByText(/Çalışman Hazır!/i)).toBeVisible();

    await page.getByRole('button', { name: /Görevi Tamamla/i }).click();
    await expect(page.getByText(/Görevin Tamamlandı!/i)).toBeVisible();

    await page.getByRole('link', { name: /Kampüs Yolculuğumda Gör/i }).click();
    await expect(page.getByText('Aksaray Taş ve Tuğla Rotam').first()).toBeVisible();
  });

  test('Tasarım Sistemi ön izlemesi (/tasarim-sistemi): sınıf uyarlama, motifler ve mobil dokunma/taşma denetimi', async ({
    page,
  }) => {
    await page.goto('/tasarim-sistemi');

    await expect(
      page.getByRole('heading', { name: 'Dijital Eğitim Kampüsü Tasarım Sistemi' }),
    ).toBeVisible();
    await expect(page.getByRole('progressbar', { name: 'Görev Aşama İlerlemesi' })).toBeVisible();

    await page.getByRole('button', { name: /^7\. Sınıf$/ }).click();
    await expect(page.getByText(/En çok 25 sözcüklü yönerge/i)).toBeVisible();

    for (const vp of [
      { width: 390, height: 844 },
      { width: 1280, height: 840 },
    ]) {
      await page.setViewportSize(vp);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow).toBe(false);
    }

    await page.setViewportSize({ width: 390, height: 844 });
    const smallButtons = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('main button, main a'));
      return els
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44);
        })
        .map((el) => ({ text: el.textContent?.trim(), w: el.getBoundingClientRect().width, h: el.getBoundingClientRect().height }));
    });
    expect(smallButtons).toEqual([]);
  });

  test('Aşama 3: Yürünebilir kampüs avlusu, İngilizce sınıfı, akıllı tahta ve harita geçişi', async ({
    page,
  }) => {
    await page.goto('/yuruyus');

    // 1. Yürünebilir kampüs avlusu başlangıç görünümü
    await expect(page.getByText('Yürünebilir Kampüs Avlusu')).toBeVisible();
    const canvas = page.getByTestId('walkable-canvas');
    await expect(canvas).toBeVisible();

    // 2. Doğrudan sınıfa geçiş butonu ile İngilizce sınıfına gir
    await page.getByRole('button', { name: /Doğrudan Sınıfa Gir/i }).click();
    await expect(page.getByText('İngilizce Sınıfı')).toBeVisible();

    // 3. Sınıf içinde akıllı tahtaya doğru yürü (klavye ile yukarı hareket)
    await canvas.focus();
    await page.keyboard.down('ArrowUp');
    await page.waitForTimeout(2600);
    await page.keyboard.up('ArrowUp');

    // Akıllı tahta etkileşim butonu görünür olmalı ve tıklanmalı
    const interactBtn = page.getByRole('button', { name: /Etkileşimi Başlat \[E\]/i });
    await expect(interactBtn).toBeVisible({ timeout: 6000 });
    await interactBtn.click();

    // 4. Akıllı Tahta modalı açılır ve mevcut Kapıların Anlattığı Hikâye etkinliği görünür
    await expect(page.getByText(/İngilizce Sınıfı — Etkileşimli Akıllı Tahta/i)).toBeVisible();
    await expect(page.getByText(/Kapıların Anlattığı Hikâye/i).first()).toBeVisible();

    // 5. Escape tuşu ile modalı güvenli biçimde kapat ve sınıfa dön
    await page.keyboard.press('Escape');
    await expect(page.getByText(/İngilizce Sınıfı — Etkileşimli Akıllı Tahta/i)).not.toBeVisible();
    await expect(page.getByText('İngilizce Sınıfı')).toBeVisible();

    // 6. Kuşbakışı haritaya dön
    await page.getByRole('button', { name: /Kuşbakışı Harita/i }).click();
    await expect(page.getByRole('heading', { name: /Kampüs Haritası/i })).toBeVisible();

    // 7. Harita üzerinden tekrar yürüyüşe geç
    await page.getByRole('link', { name: /Yürüyerek Keşfet/i }).click();
    await expect(page.getByText('Yürünebilir Kampüs Avlusu')).toBeVisible();

    // 8. Mobil boyut (390x844) ve D-Pad kontrolü
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole('group', { name: /Dokunmatik yön kontrolleri/i })).toBeVisible();
  });
});


