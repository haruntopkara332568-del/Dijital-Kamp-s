# Test ve Kalite Güvence Raporu

## 1. Çalıştırıldı ve Geçti
- **`npm ci`**: Geçti — `package-lock.json` ile 265 paket temiz kuruldu.
- **`npm run typecheck` (`tsc --noEmit`)**: Geçti — 0 hata (strict TypeScript).
- **`npm run lint` (`eslint .`)**: Geçti — 0 hata, 0 uyarı.
- **`npm run test` (`vitest run`)**: Geçti — `src/test/campus.test.tsx` (12 / 12 test, 307 ms):
  - 2–7. sınıf başlangıç parametrelerinin (`gradeProfiles.ts`) doğrulaması
  - Onaylı karşılama metni ve rehber sorularının harfiyen korunması
  - 3 öğrenme alanı + 2 yardımcı işlev ayrımı
  - Ortaokul İngilizce 5 kelime ve örnek cümle doğrulaması
  - Bozuk `localStorage` JSON verisinde çökmeme ve bellek yedeğine geçiş
  - Bilinmeyen/gelecek şema sürümünde mevcut veriyi silmeme
  - `clearAllCampusData()` işlevinin yalnızca `dek_` önekli anahtarları silmesi
  - `speechSynthesis` olmayan ortamda seslendirme servisinin çökmeden metin yedeği dönmesi
  - Giriş kapısı "Animasyonu Atla" akışı
  - Karşılama avlusunda onaylı metin + tercih + 5. sınıf seçimi
  - İki adımlı "Verilerimi Sil" penceresi ve "Vazgeç" davranışı
  - Üst gezinme çubuğunun React Router bağlantılarını (`/harita`, `/alan/gorev-panosu`, `/yolculugum`) doğru üretmesi
- **`npm run build` (`vite build`)**: Geçti — Vite 8.3.8 ile derlendi.
- **`npm run test:e2e` (`playwright test`)**: Geçti — `npx playwright install chromium` sonrası `e2e/campus.spec.ts` **2 / 2** geçti (15.0 s):
  - `[chromium]` (Masaüstü Chrome, 6.1 s): İlk ziyaret kapı → karşılama metni → 5. sınıf → rehberli tur → harita → Kapıların Anlattığı Hikâye → PNG/Kayıt → Yolculuğum → iki adımlı Verilerimi Sil.
  - `[mobile-chrome]` (`Pixel 5`, 6.2 s): Aynı uçtan uca senaryo mobil görünümde geçti.

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
- `dist/assets/index-ClX4adNt.css`: `32.16 kB` (`gzip: 6.13 kB`)
- `dist/assets/index-De9glu4N.js`: `856.21 kB` (`gzip: 241.93 kB`)
- Harici yazı tipi, CDN, izleyici ve üçüncü taraf görsel isteği sıfırdır. Gerçek 4 yıllık Android cihazda açılış hızı henüz ölçülmemiştir.
