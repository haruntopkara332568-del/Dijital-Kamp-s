# Test ve Kalite Güvence Raporu

## 1. Çalıştırıldı ve Geçti
- **`npm ci`**: Geçti — `package-lock.json` ile 265 paket temiz kuruldu.
- **`npm run typecheck` (`tsc --noEmit`)**: Geçti — 0 hata (strict TypeScript).
- **`npm run lint` (`eslint .`)**: Geçti — 0 hata, 0 uyarı.
- **`npm run test` (`vitest run`)**: Geçti — `src/test/campus.test.tsx` (14 / 14 test, 711 ms):
  - 2–7. sınıf başlangıç parametrelerinin (`gradeProfiles.ts`) doğrulaması
  - Onaylı karşılama metni, karma dil seslendirme segmentleri (`tr-TR` / `en-US` / `tr-TR`) ve rehber sorularının harfiyen korunması
  - Görev aşamalarının (`Keşfet → Öğren → Üret → Paylaş`) doğrulanması
  - 3 öğrenme alanı + 2 yardımcı işlev ayrımı
  - Ortaokul İngilizce 5 kelime ve örnek cümle doğrulaması
  - Bozuk `localStorage` JSON verisinde çökmeme ve bellek yedeğine geçiş
  - Bilinmeyen/gelecek şema sürümünde mevcut veriyi silmeme
  - `clearAllCampusData()` işlevinin yalnızca `dek_` önekli anahtarları silmesi
  - `speechSynthesis` olmayan ortamda seslendirme servisinin çökmeden metin yedeği dönmesi
  - `GuideDialogueCard` ekrandaki metinle aynı karma dil segmentlerini seslendirme servisine göndermesi
  - Giriş kapısı "Animasyonu Atla" akışı
  - Karşılama avlusunda onaylı metin + tercih + 5. sınıf seçimi
  - İki adımlı "Verilerimi Sil" penceresi ve "Vazgeç" davranışı
  - Üst gezinme çubuğunun React Router bağlantılarını (`/harita`, `/alan/gorev-panosu`, `/yolculugum`) doğru üretmesi
- **`npm run build` (`vite build`)**: Geçti — Vite 8.3.8 ile derlendi.
- **`npm run test:e2e` (`playwright test`)**: Geçti — `e2e/campus.spec.ts` **2 / 2** geçti (17.6 s):
  - `[chromium]` (Masaüstü Chrome, 8.0 s): İlk ziyaret kapı → karşılama metni → 5. sınıf → rehberli tur → harita → Kapıların Anlattığı Hikâye → PNG/Kayıt → Yolculuğum → iki adımlı Verilerimi Sil.
  - `[mobile-chrome]` (`Pixel 5`, 6.7 s): Aynı uçtan uca senaryo mobil görünümde geçti.
- **Çoklu Ekran Boyutu Denetimi (`1280×840`, `768×1024`, `390×844`)**: Geçti — Giriş kapısı, karşılama avlusu ve harita sayfalarında yatay taşma yok, masaüstü/tablet haritada `0` düğüm çakışması ve `0` kırpılma.

## 2. Çalıştırılamayan Testler
- Yok. Birim/entegrasyon (`vitest`) ve uçtan uca tarayıcı (`playwright`) testlerinin tamamı çalıştırıldı ve geçti.

## 3. Gerçek Cihazda Elle Denenecekler
- 4 yıllık giriş seviyesi Android telefon ve tablet üzerinde dokunmatik çizim, kaydırma ve 44×44 px dokunma hedefleri.
- Gerçek cihaz tarayıcılarında `speechSynthesis` ile `tr-TR` ve `en-US` ses kalitesi ve ses bulunmadığında gösterilen yedek mesaj.
- İndirilen tek PNG çıktısında uzun Türkçe metinlerin (`ç, ğ, ı, İ, ö, ş, ü`) kesilmeden satır kaydırma ve görsel bütünlük kontrolü.
- Ekran okuyucu (TalkBack / VoiceOver / NVDA) ile klavye gezinmesi ve WCAG 2.2 AA kontrast/odak kontrolü.
- İlkokul ve ortaokul görevlerinde her ekranın görsel olarak adım adım gezilmesi.

## 4. Çizim Bileşeninin Erişilebilirlik Sınırları
- `DrawingCanvasStudio` içindeki `<canvas>` serbest el çizim yüzeyi doğası gereği görsel/işaretçi odaklıdır; ekran okuyucu kullanıcılarına çizim alanı içindeki pikseller tek tek okunamaz.
- Bu sınırı azaltmak için her kullanıcıya **Hazır Şekil Ekle**, klavye yön tuşlarıyla (`ArrowLeft/Right/Up/Down`) ve düğmelerle şekil taşıma, `Delete`/`Backspace` ile silme ve yazılı tasarım (`textarea`) alternatifleri açık tutulmuştur.

## 5. Paket Boyutu Ölçümü (Vite Derleme Çıktısı)
- `dist/index.html`: `0.90 kB` (`gzip: 0.43 kB`)
- `dist/assets/index-CbUrLnID.css`: `48.10 kB` (`gzip: 7.94 kB`)
- `dist/assets/index-9WBQJDbA.js`: `909.33 kB` (`gzip: 251.46 kB`)
- Harici yazı tipi, CDN, izleyici ve üçüncü taraf görsel isteği sıfırdır. Gerçek 4 yıllık Android cihazda açılış hızı henüz ölçülmemiştir.
