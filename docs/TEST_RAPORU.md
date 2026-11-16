# Test ve Kalite Güvence Raporu

## 1. Çalıştırıldı ve Geçti
- **`npm run typecheck` (`tsc --noEmit`)**: Geçti — 0 hata (strict TypeScript).
- **`npm run lint` (`eslint .`)**: Geçti — 0 hata, 0 uyarı.
- **`npm run test` (`vitest run`)**: Geçti — **65 / 65 test** (`src/test/walkable.test.tsx` [36 test] + `src/test/campus.test.tsx` [29 test], toplam `3.94 s`):
  - **Aşama 3 & 4 Yürünebilir Kampüs ve Görsel Dünya Testleri (`walkable.test.tsx` — 36 Test)**:
    1. Karakter yön tuşlarıyla ve W, A, S, D ile doğru yönde hareket eder
    2. Çapraz hareket hızı normal hareket hızından fazla olamaz (Normalizasyon)
    3. Karakter bina ve engel sınırlarının içinden geçemez (Çarpışma algılama)
    4. Tıklanan ulaşılabilir noktaya otomatik yürür ve manuel hareket otomatik yürümeyi iptal eder
    5. Ulaşılamayan bir engel içine tıklandığında hata geri bildirimi verir
    6. İngilizce Dünyası kapısına yaklaşıldığında etkileşim bölgesi tetiklenir ve E tuşuyla eylem çalışır
    7. Mobil dokunmatik sanal yön kontrolleri (`setVirtualDirection`) çalışır
    8. Kamera sınırların dışına taşmaz ve karakteri takip eder
    9. Engel arkasındaki ulaşılabilir hedefe A* yol bulma rotası ve ara noktalar oluşturma
    10. Ulaşılamayan hedef (engelin içi) doğrudan reddedilir ve `onUnreachableTarget` tetiklenir
    11. Otomatik yürürken klavye yön tuşuna basıldığında rota derhal iptal edilir
    12. Otomatik yürürken mobil D-Pad ile yön verildiğinde rota derhal iptal edilir
    13. Akıllı tahta modalı açıkken (`pause`) karakter klavye tuşlarına tepki vermez
    14. Akıllı tahta modalı kapandığında (`resume`) karakter önceki konumunu korur
    15. SmartBoardModal Escape tuşu ile güvenli biçimde kapanır
    16. SmartBoardModal odak yönetimi (Focus Trap) ve Tab döngüsü sağlar
    17. Mobilde pointercancel ve pointerleave sonrasında hareket tamamen durur
    18. Farklı Canvas ve CSS boyutlarında (Responsive scale) tıklama koordinatları doğru hesaplanır
    19. Ekran boyutu değiştiğinde `updateDimensions` karakter ve kamerayı sahne sınırında tutar
    20. Mevcut iki öğrenme görevi ve sınıf düzeyleri veri bütünlüğünü korur
    21. A* Tek taraflı engelli çapraz köşe geçişi testi (Köşe kesme engellenmelidir)
    22. A* İki tarafı engelli çapraz köşe geçişi testi (Köşegen geçiş engellenmelidir)
    23. Karakter genişliğinden (18px) daha dar koridor testi (Geçiş engellenmelidir)
    24. Karakter genişliğinden (18px) geniş güvenli koridor testi (Geçişe izin verilmelidir)
    25. Başlangıç ve hedef aynı nokta olduğunda gereksiz hesaplama yapmadan doğrudan döner
    26. Yol pürüzsüzleştirme (smoothPath) engelleri kesmeyen geçerli rotalar üretir
    27. Karakter ara noktaları sırayla takip ederek hedefe ulaşır ve hedefe varınca durur
    28. Animasyon döngüsü duraklatma (pause): rAF çağrısı durur, animFrameId sıfırlanır ve sıfır yeni kare planlanır
    29. Animasyon döngüsü devam ettirme (resume): rAF çağrısı yeniden başlar ve delta sıçraması olmaz
    30. Akıllı tahta modalı Shift+Tab ile ilk elemandan son elemana döner ve kapatıldığında önceki aktif elemana odak iade edilir
    31. Tarayıcı sekmesi arka plana alındığında (visibilitychange) döngü durur, öne gelince yeniden başlar
    32. **Aşama 4: Karakterin dört yönde (down, up, left, right) çizimi ve yürüme/bekleme durumları hatasız çalışır**
    33. **Aşama 4: prefers-reduced-motion aktifken karakter ve çevre animasyonları güvenle çizilir**
    34. **Aşama 4: Kampüs avlusu zemin, Selçuklu yıldız meydanı, binalar ve peyzaj unsurları hatasız çizilir**
    35. **Aşama 4: İngilizce sınıfı zemin, pencereler, akıllı tahta (kapalı, açılıyor, açık) ve sıralar hatasız çizilir**
    36. **Aşama 4: Karakterin görsel temas noktası AABB çarpışma kutusu sınırlarıyla (DEFAULT_HITBOX) uyumludur**
  - **Mevcut Kampüs ve Pedagoji Testleri (`campus.test.tsx` — 29 Test)**:
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
- **`npm run build` (`vite build`)**: Geçti — Vite 8.3.8 ile `860 ms` içinde derlendi (`2122` modül, dinamik `React.lazy` kod bölme etkin; `WalkableCampusView` parça boyutu A* ve Aşama 4 görsel çizicileri dahil yalnızca `48.09 kB` / `gzip: 13.06 kB`).
- **`npm run test:e2e` (`playwright test`)**: Geçti — `e2e/campus.spec.ts` **10 / 10** geçti (`16.4 s`, Chromium + Mobile Chrome):
  - `[chromium]` (`10.0 s`) ve `[mobile-chrome]` (`11.1 s`): Kapı → onaylı karşılama → 5. sınıf → rehberli tur → 5 yollu harita → keşfet → öğren (yönlendirici ve olumlu geri bildirim) → boş üretim engeli → alan gezintisinde ilerleme korunması → şekil/malzeme/gerekçeli anlatım üretimi → PNG indirmeden görevi tamamlama → Yolculuğum 3 bölüm ve eser inceleme penceresi → iki adımlı Verilerimi Sil ve boş durum doğrulaması.
  - `[chromium]` (`5.9 s`) ve `[mobile-chrome]` (`5.5 s`): 2. sınıf akışı (basit çizim araçları + fareyle serbest çizim + isteğe bağlı yazı), `360×740`, `390×844`, `768×1024`, `1280×840` ekranlarında `0` yatay taşma, `390 px` ekranda `44×44 px` altı hedef olmaması ve klavye yön tuşlarıyla şekil taşıma.
  - `[chromium]` (`8.5 s`) ve `[mobile-chrome]` (`7.3 s`): Aşama 2 Aksaray Kültürel Miras Rotası (`Gezi ve Keşif` 4 durak kontrolü, Ulu Cami'nin aktif rotada yer almayıp Yakında notunda kalması, 5. sınıf `KEŞFET → ÖĞREN → ÜRET → PAYLAŞ` akışı, tek yazılı üretimle tamamlama, `390×844` ve `1280×840` taşmasızlık kontrolü, `Yolculuğum` kaydı doğrulaması).
  - `[chromium]` (`2.2 s`) ve `[mobile-chrome]` (`1.7 s`): Tasarım Sistemi ön izlemesi (`/tasarim-sistemi`) sınıf uyarlama, motifler, ilerleme göstergesi, `390×844` / `1280×840` sıfır yatay taşma ve `44×44 px` altı hedef olmaması kontrolü.
  - `[chromium]` (`6.5 s`) ve `[mobile-chrome]` (`5.1 s`): **Aşama 3 Yürünebilir Kampüs ve Akıllı Tahta Entegrasyonu**: `/yuruyus` başlangıç görünümü ve canvas doğrulaması, `Doğrudan Sınıfa Gir` ile İngilizce sınıfına geçiş, sınıf içinde akıllı tahtaya yürüme, `[E] Etkileşimi Başlat` ile akıllı tahta açılış animasyonu, modal içinde `Kapıların Anlattığı Hikâye` görevinin açılması, **Escape tuşuyla güvenle modal kapatma**, `Kuşbakışı Harita` butonuna basılarak haritaya geçiş, haritadan `Yürüyerek Keşfet` ile avluya dönüş, mobil `390×844` ekranında dokunmatik D-Pad görünürlüğü.

## 2. Çalıştırılamayan Testler
- Yok. Birim/entegrasyon (`vitest`) ve uçtan uca tarayıcı (`playwright`) testlerinin tamamı çalıştırıldı ve geçti.

## 3. Gerçek Cihazda Elle Denenecekler
- 4 yıllık giriş seviyesi Android telefon ve tablet üzerinde dokunmatik yön tuşları (D-Pad), tıklayarak yürüme ve 44×44 px dokunma hedefleri.
- Gerçek cihaz tarayıcılarında `speechSynthesis` ile `tr-TR` ve `en-US` ses kalitesi ve ses bulunmadığında gösterilen yedek mesaj.
- İndirilen tek PNG çıktısında uzun Türkçe metinlerin (`ç, ğ, ı, İ, ö, ş, ü`) kesilmeden satır kaydırma ve görsel bütünlük kontrolü.
- Ekran okuyucu (TalkBack / VoiceOver / NVDA) ile klavye gezinmesi ve WCAG 2.2 AA kontrast/odak kontrolü.
- Akıllı tahta modalı açılış animasyonunun düşük donanımlı cihazlarda kare atlamadan (60fps) oynatılması.

## 4. Çizim ve Oyun Yüzeyinin Erişilebilirlik Sınırları
- `DrawingCanvasStudio` ve `WalkableCanvasEngine` içindeki `<canvas>` yüzeyleri doğası gereği grafik odaklıdır; pikseller ekran okuyucuya doğrudan metin olarak aktarılamaz.
- Bu sınırı aşmak amacıyla:
  - Yürünebilir sahnede ekran okuyucu ve klavyeyle yönlendirme yapamayan öğrenciler için `Doğrudan Sınıfa Gir` ve `Kuşbakışı Harita` gibi erişilebilir HTML buton alternatifleri sunulmuştur.
  - Akıllı tahta modalı `role="dialog"` ve `aria-modal="true"`, `aria-labelledby`, `aria-describedby`, Focus Trap ve Escape desteği ile erişilebilir kılınmıştır.
  - Çizim stüdyosunda hazır şekiller, klavyeyle taşıma ve metin tabanlı gerekçeli anlatım alanları korunmaktadır.

## 5. Paket Boyutu Ölçümü (Vite Derleme Çıktısı — Kod Bölme Sonrası)
- `dist/index.html`: `1.01 kB` (`gzip: 0.47 kB`)
- `dist/assets/index-XN61vt9h.css`: `56.95 kB` (`gzip: 9.20 kB`)
- `dist/assets/index-Bg2oYn_I.js` (ana giriş paketi): `333.72 kB` (`gzip: 104.47 kB`) — sayfa bazlı dinamik `React.lazy` kod bölme ile başlangıç paketi son derece hafiftir.
- **Yürünebilir Sahne Paketi (`WalkableCampusView-BJjd90Vt.js`)**: Yalnızca **32.09 kB** (`gzip: 9.31 kB`) — A* yol bulma ve string-pulling dahil Phaser'a (1.28 MB) kıyasla ~35 kat daha küçüktür ve yalnızca `/yuruyus` rotasına girildiğinde yüklenir.
- İsteğe bağlı diğer sayfa parçaları: `MissionRunnerView` (`71.85 kB` / `gzip: 16.61 kB`), `DesignSystemPreviewView` (`23.55 kB` / `gzip: 7.03 kB`), `JourneyView` (`19.01 kB` / `gzip: 4.67 kB`), `CourtyardWelcomeView` (`13.97 kB` / `gzip: 3.68 kB`), `LearningAreaView` (`12.47 kB` / `gzip: 2.89 kB`), `CampusMapView` (`13.28 kB` / `gzip: 3.90 kB`), `CampusGateView` (`3.63 kB` / `gzip: 1.58 kB`).
- Harici yazı tipi, CDN, üçüncü taraf izleyici ve harici API isteği sıfırdır.
