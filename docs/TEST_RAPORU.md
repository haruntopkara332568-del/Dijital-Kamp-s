# Test ve Kalite Güvence Raporu

## 1. Çalıştırıldı ve Geçti
- **`npm run typecheck` (`tsc --noEmit`)**: Geçti — 0 hata (strict TypeScript).
- **`npm run lint` (`eslint .`)**: Geçti — 0 hata, 0 uyarı.
- **`npm run test` (`vitest run`)**: Geçti — `src/test/campus.test.tsx` (**29 / 29 test**, `1860 ms`, toplam `4.38 s`):
  - 2–7. sınıf başlangıç parametrelerinin (`gradeProfiles.ts`) doğrulaması
  - Onaylı karşılama metni, karma dil seslendirme segmentleri (`tr-TR` / `en-US` / `tr-TR`) ve rehber sorularının harfiyen korunması
  - Görev aşamalarının (`KEŞFET → ÖĞREN → ÜRET → PAYLAŞ`) doğrulanması
  - 3 öğrenme alanı + 2 yardımcı işlev ayrımı
  - Ortaokul İngilizce 5 kelime ve örnek cümle doğrulaması (`Kapıların Anlattığı Hikâye` ve `Aksaray Kültürel Miras Rotası`)
  - Aksaray Kültürel Miras Rotası için onaylı 4 durak (Sultanhanı Kervansarayı, Eğri Minare / Kızıl Minare, Zinciriye Medresesi, Ihlara Vadisi ve Melendiz Çayı), Ulu Cami kapsam dışılığı, 2. sınıf (`Arch` + tek şekil) ve 6. sınıf (5 kelime + yalnızca yazılı anlatım) tam akış testleri
  - Tasarım Sistemi belirteçleri, 2–7. sınıf yaşa uyarlanabilir görsel dil kuralları, yeniden kullanılabilir UI bileşenleri (`CampusButton`, `CampusCard`, `CampusProgressBar`, `CampusBadge`), `AnatolianMotifSvg` ve `/tasarim-sistemi` ön izleme doğrulamaları
  - Bozuk `localStorage` JSON verisinde çökmeme ve bellek yedeğine geçiş
  - Bilinmeyen/gelecek şema sürümünde mevcut veriyi silmeme
  - `clearAllCampusData()` işlevinin yalnızca `dek_` önekli anahtarları silmesi
  - `IndexedDB` yokluğunda `saveArtifact()` çağrısının `persisted: false` ve `storageLocation: 'session-only'` dönmesi
  - `evaluateOriginalProduction()` ile boş tuval / noktasız çizim / boşluk veya yalnız noktalama/rakam (`!!!`, `...`, `12345`) metin engelinin ve tek mod geçerliliğinin doğrulanması
  - `MissionRunnerView` içinde boş/yalnızca isim/yalnızca noktalama girişiyle `Paylaş` adımının engellenmesi, 2. ve 7. sınıf araç/cümle başlangıcı farkı, kaydetme ile tamamlamanın ayrılması ve IndexedDB başarısızlığında kaybolma uyarısı + belirgin PNG düğmesi gösterimi
  - `CampusMapView` içinde 5 merkez taş yolunun (`plaza-*`) render edilmesi ve `connectedToIds` verisinin korunması
  - `JourneyView` içinde Görevlerim, Öğrenme Yolculuğum ve Çalışmalarım bölümlerinin render edilmesi
  - `speechSynthesis` olmayan ortamda seslendirme servisinin çökmeden metin yedeği dönmesi
  - `GuideDialogueCard` ekrandaki metinle aynı karma dil segmentlerini seslendirme servisine göndermesi
  - Giriş kapısı, karşılama avlusu, iki adımlı "Verilerimi Sil" ve üst gezinme çubuğu testleri
- **`npm run build` (`vite build`)**: Geçti — Vite 8.3.8 ile `1.18 s` içinde derlendi (`2115` modül).
- **`npm run test:e2e` (`playwright test`)**: Geçti — `e2e/campus.spec.ts` **8 / 8** geçti (`39.6 s`):
  - `[chromium]` (`8.2 s`) ve `[mobile-chrome]` (`8.2 s`): Kapı → onaylı karşılama → 5. sınıf → rehberli tur → 5 yollu harita → keşfet → öğren (yönlendirici ve olumlu geri bildirim) → boş üretim engeli → alan gezintisinde ilerleme korunması → şekil/malzeme/gerekçeli anlatım üretimi → PNG indirmeden görevi tamamlama → Yolculuğum 3 bölüm ve eser inceleme penceresi → iki adımlı Verilerimi Sil ve boş durum doğrulaması.
  - `[chromium]` (`4.0 s`) ve `[mobile-chrome]` (`4.1 s`): 2. sınıf akışı (basit çizim araçları + fareyle serbest çizim + isteğe bağlı yazı), `360×740`, `390×844`, `768×1024`, `1280×840` ekranlarında `0` yatay taşma, `390 px` ekranda `44×44 px` altı hedef olmaması ve klavye yön tuşlarıyla şekil taşıma.
  - `[chromium]` (`5.5 s`) ve `[mobile-chrome]` (`4.5 s`): Aşama 2 Aksaray Kültürel Miras Rotası (`Gezi ve Keşif` 4 durak kontrolü, Ulu Cami'nin aktif rotada yer almayıp Yakında notunda kalması, 5. sınıf `KEŞFET → ÖĞREN → ÜRET → PAYLAŞ` akışı, tek yazılı üretimle tamamlama, `390×844` ve `1280×840` taşmasızlık kontrolü, `Yolculuğum` kaydı doğrulaması).
  - `[chromium]` (`1.2 s`) ve `[mobile-chrome]` (`1.2 s`): Tasarım Sistemi ön izlemesi (`/tasarim-sistemi`) sınıf uyarlama, motifler, ilerleme göstergesi, `390×844` / `1280×840` sıfır yatay taşma ve `44×44 px` altı hedef olmaması kontrolü.

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
- `dist/assets/index-BzqHAENj.css`: `53.88 kB` (`gzip: 8.71 kB`)
- `dist/assets/index-iOf0J4of.js`: `1,003.42 kB` (`gzip: 270.66 kB`)
- Harici yazı tipi, CDN, izleyici ve üçüncü taraf görsel isteği sıfırdır. Gerçek 4 yıllık Android cihazda açılış hızı henüz ölçülmemiştir.

