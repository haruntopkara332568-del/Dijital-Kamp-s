# Test ve Kalite Güvence Raporu — Gerçek Tam Ekran Sahne Yerleşimi, Kenar Boşluklarının Giderilmesi ve Kesintisiz Tam Ekran Deneyimi

## 1. Çalıştırıldı ve Geçti
- **`npm run typecheck` (`tsc --noEmit`)**: Geçti — **0 hata** (Strict TypeScript tip denetimi tam uyumlu).
- **`npm run lint` (`eslint .`)**: Geçti — **0 hata, 0 uyarı** (`useSyncExternalStore` ile sıfır cascading render, tam ESLint ve React Compiler uyumu).
- **`npm run test` (`vitest run`)**: Geçti — **146 / 146 test** (%100 başarı, 6 test dosyası):
  - `src/test/fullscreen.test.tsx`: **9 / 9 test** (`436ms`) — Özellik denetimi (desteklenmeyen iOS/tarayıcılarda butonu gizleme), kapı önünde erişim, "Tam ekrana geç" -> "Tam ekrandan çık" durum güncellemesi, ESC ve `fullscreenchange` dinleyicisi, kök öğe (`document.documentElement`) hedefiyle sahne geçişi kalıcılığı, İngilizce sınıfı (`960×640`) ve kampüs avlusu (`1400×900`) tam ekran ölçeklendirme (`zoom`), sağ/alt boşlukların giderilmesi, karakter konumunun korunması ve zoom altında fare tıklama (`pointerdown`) dünya koordinatı dönüşümü.
  - `src/test/brandIdentityMaintenance.test.tsx`: **7 / 7 test** (`340ms`) — Marka kimliği ve kitabe render doğrulaması.
  - `src/test/studentProfilesMaintenance.test.tsx`: **14 / 14 test** (`419ms`) — İki öğrenci (Gezgin & Bilgin) veri izolasyonu ve profil yönetimi.
  - `src/test/primaryScopeMaintenance.test.tsx`: **9 / 9 test** (`631ms`) — İlkokul 2, 3 ve 4. sınıf kapsam doğrulaması.
  - `src/test/campus.test.tsx`: **33 / 33 test** (`4.0s`) — Depolama güvenliği, seslendirme ve görev rotaları.
  - `src/test/walkable.test.tsx`: **74 / 74 test** (`43.6s`) — Yürünebilir kampüs avlusu, 4 öğrenme masası ve Sultanhanı sahnesi.
- **`npm run build` (`vite build`)**: Geçti — **1.03s** içinde hatasız ve optimize edilmiş üretim paketi (`dist/`) üretildi.

---

# Test ve Kalite Güvence Raporu — Bakım ve Onarım 03A: Cihaz Tabanlı Öğrenci Profil Altyapısı ve Mimari Duvar Yazılarının Düzeltilmesi

## 1. Çalıştırıldı ve Geçti
- **`npm run typecheck` (`tsc --noEmit`)**: Geçti — **0 hata** (Strict TypeScript tip denetimi tam uyumlu).
- **`npm run lint` (`eslint .`)**: Geçti — **0 hata, 0 uyarı** (React 19 render-phase kuralları ve storage no-empty dahil tam uyumlu).
- **`npm run test` (`vitest run`)**: Geçti — **137 / 137 test** (%100 başarı, 5 test dosyası):
  - `src/test/studentProfilesMaintenance.test.tsx`: **14 / 14 test** (`540ms`) — İki öğrenci (Gezgin & Bilgin) veri izolasyonu, IndexedDB çizim izolasyonu, eski tekil veri göçü (legacy migration), profil silme güvenliği ve React Context entegrasyonu.
  - `src/test/brandIdentityMaintenance.test.tsx`: **7 / 7 test** (`481ms`) — Marka kimliği ve kitabe render doğrulaması.
  - `src/test/primaryScopeMaintenance.test.tsx`: **9 / 9 test** (`867ms`) — İlkokul 2, 3 ve 4. sınıf kapsam doğrulaması.
  - `src/test/campus.test.tsx`: **33 / 33 test** (`5.7s`) — Depolama güvenliği, seslendirme ve görev rotaları.
  - `src/test/walkable.test.tsx`: **74 / 74 test** (`45.1s`) — Yürünebilir kampüs avlusu, 4 öğrenme masası ve Sultanhanı macerası.
- **`npx playwright test e2e/student_profiles_maintenance.spec.ts`**: Geçti — **6 / 6 test** (Desktop Chromium & Mobile Chrome Pixel 5):
  - Senaryo 1-3 & 34: İlk girişte profil oluşturma, taç kapı ve üst bar entegrasyonu (Geçti).
  - Senaryo 7-12: İki Öğrenci (Gezgin & Bilgin) profil değişimi ve veri izolasyonu (Geçti).
  - Senaryo 29-32: Profil Silme Onayı ve İzolasyonu (Geçti).
- **`npx playwright test e2e/primary_school_scope_maintenance.spec.ts --project=chromium`**: Geçti — **7 / 7 test** (`14.2s`) (Geriye dönük uyumluluk ve ilkokul kapsamı tam doğrulandı).
- **`npx playwright test e2e/brand_identity_maintenance.spec.ts`**: Geçti — **12 / 12 test** (Desktop ve Mobile Chrome'da mimari kitabeler ve marka kimliği doğrulandı).
- **`npm run build` (`vite build`)**: Geçti — **1.22s** içinde hatasız ve optimize edilmiş üretim paketi (`dist/`) üretildi.
- **Doğrulanan Gerçek Görsel Varlıklar (`docs/assets/`)**:
  - `profile_created_desktop.png` (485 KB)
  - `profile_created_mobile.png` (642 KB)
  - `profile_modal_create_desktop.png` (45 KB)
  - `profile_modal_select_desktop.png` (235 KB)
  - `profile_switch_bilgin_desktop.png` (1.08 MB)
  - `profile_switch_bilgin_mobile.png` (643 KB)

---

# Test ve Kalite Güvence Raporu — Bakım ve Onarım 02: Marka Kimliği ve Mimari Kitabelerin Yeniden Yapılandırılması

## 1. Çalıştırıldı ve Geçti
- **`npm run typecheck` (`tsc --noEmit`)**: Geçti — **0 hata** (Strict TypeScript tip denetimi).
- **`npm run lint` (`eslint .`)**: Geçti — **0 hata, 0 uyarı** (ESLint kuralları tam uyumlu).
- **`npm run test` (`vitest run`)**: Geçti — **123 / 123 test** (%100 başarı):
  - `src/test/brandIdentityMaintenance.test.tsx`: **7 / 7 test** (`98ms`).
  - `src/test/primaryScopeMaintenance.test.tsx`: **9 / 9 test** (`278ms`).
  - `src/test/campus.test.tsx`: **33 / 33 test** (`3.7s`).
  - `src/test/walkable.test.tsx`: **74 / 74 test** (`42.1s`).
- **`npx playwright test e2e/brand_identity_maintenance.spec.ts --project=chromium`**: Geçti — **6 / 6 test** (`8.2s`):
  - Senaryo 1 & 15: Ana Giriş Ekranı ve Tarayıcı Başlığı yeni marka kimliğini doğru sunar (Geçti).
  - Senaryo 2: Kapı geçiş animasyonu ve avluya adım atma kesintisiz çalışır (Geçti).
  - Senaryo 3, 4, 18: Kampüs Avlusu, Bina Kitabeleri ve Kamera Hareketi (Geçti).
  - Senaryo 5, 6: İngilizce Öğreniyorum binasına giriş ve Sınıf Seçim Panosu (Geçti).
  - Senaryo 13, 14: Yakında açılacak binalara yaklaşıldığında yeni isimlerle bildirim verilir (Geçti).
  - Senaryo 16, 20: Eski öğrenci kayıtları ve sayfa yenileme bütünlüğü korunur (Geçti).
- **`npx playwright test e2e/brand_identity_maintenance.spec.ts --project=mobile-chrome`**: Geçti — **6 / 6 test** (`5.8s`):
  - Senaryo 17, 18: Mobil Chrome (Pixel 5) üzerinde ana giriş, bina kitabeleri ve dokunmatik avlu akışı (Geçti).
- **`npx playwright test e2e/primary_school_scope_maintenance.spec.ts --project=chromium`**: Geçti — **7 / 7 test** (`9.4s`) (Onarım 01 ilkokul kapsamı regresyonsuz korundu).
- **`npm run build` (`vite build`)**: Geçti — **913ms** içinde optimize edilmiş üretim derlemesi üretildi.
- **Doğrulanan Gerçek Görsel Varlıklar (`docs/assets/`)**:
  - `brand_gate_desktop.png` (542 KB)
  - `brand_gate_mobile.png` (881 KB)
  - `brand_courtyard_desktop.png` (1.06 MB)
  - `brand_courtyard_mobile.png` (1.33 MB)
  - `brand_english_building_close.png` (1.13 MB)
  - `brand_discovery_building_close.png` (1.16 MB)
  - `brand_library_building_close.png` (1.16 MB)
  - `brand_classroom_grade_board.png` (243 KB)

---

# Test ve Kalite Güvence Raporu — Bakım ve Onarım 01: Proje Kapsamının İlkokul Düzeyiyle Sınırlandırılması (2, 3, 4. Sınıflar)

## 1. Çalıştırıldı ve Geçti
- **`npm run typecheck` (`tsc --noEmit`)**: Geçti — **0 hata** (Strict TypeScript).
- **`npm run lint` (`eslint .`)**: Geçti — **0 hata, 0 uyarı**.
- **`npm run test` (`vitest run`)**: Geçti — **116 / 116 test** (`src/test/primaryScopeMaintenance.test.tsx` [9 test] + `src/test/walkable.test.tsx` [74 test] + `src/test/campus.test.tsx` [33 test], `45.24s`).
- **`npx playwright test e2e/primary_school_scope_maintenance.spec.ts --project=chromium`**: Geçti — **7 / 7 test** (`9.1s`):
  - Senaryo 1 & 5: Sınıf Seçim Panosu yalnızca 2, 3 ve 4. sınıfları sunar; 5, 6, 7 kesinlikle yoktur (Geçti).
  - Senaryo 6, 7, 8, 9: Eski 5, 6 veya 7. sınıf öğrencisinin verisi korunur, selectedGrade null olur ve bilgilendirme sunulur (Geçti).
  - Senaryo 10: Bozuk veya geçersiz sınıf verisi uygulamanın çökmesini engeller (Geçti).
  - Senaryo 11: Desteklenmeyen veya seçilmemiş sınıfla doğrudan görev URL erişimi ana sayfaya yönlendirir (Geçti).
  - Senaryo 12: Sınıf seçilmemişken masalara veya tahtaya yaklaşıldığında yönlendirme mesajı sunulur (Geçti).
  - Senaryo 2 & 4: 2. ve 4. sınıflar için akıllı tahta koruma altındadır (Geçti).
  - Senaryo 3, 13, 14, 15, 16, 17: 3. Sınıf 4 Masası ve Sultanhanı Kervansarayı taç kapı yürüyüşü (Geçti).
- **`npx playwright test e2e/primary_school_scope_maintenance.spec.ts --project=mobile-chrome`**: Geçti — **7 / 7 test** (`9.3s`):
  - Senaryo 18: Mobil Chrome (Pixel 5) emülatöründe tüm 18 senaryonun mobil dokunma, kadraj ve arayüz uyumluluğu (Geçti).
- **`npm run build` (`vite build`)**: Geçti — **822ms** içinde hatasız ve optimize edilmiş üretim derlemesi üretildi.

---

# Test ve Kalite Güvence Raporu — Sürüm 6.5.4 (Aşama 6.5: Sultanhanı Meydanında Aynı Karakterle Yürüyüş ve Taç Kapıdan Geçiş / İlk Teslim)

## 1. Çalıştırıldı ve Geçti
- **`npm run typecheck` (`tsc --noEmit`)**: Geçti — **0 hata** (strict TypeScript).
- **`npm run lint` (`eslint .`)**: Geçti — **0 hata, 0 uyarı**.
- **`npm run test` (`vitest run`)**: Geçti — **107 / 107 test** (`src/test/walkable.test.tsx` [74 test] + `src/test/campus.test.tsx` [33 test], `45.99s`).
- **`npx playwright test e2e/grade3_sultanhani_walkable.spec.ts --project=chromium`**: Geçti — **1 / 1 test** (`18.2s`).
- **`npx playwright test e2e/grade3_sultanhani_walkable.spec.ts --project=mobile-chrome`**: Geçti — **1 / 1 test** (`19.2s`).
  - Doğrulama 1: Sınıftan akıllı tahta tetiklendiğinde teleport efekti devreye girer, aynı kampüs karakteri (`drawCharacter`) Sultanhanı Kervansarayı meydanında belirir.
  - Doğrulama 2: Karakter meydanda başlangıç noktasında (`x: 553, y: 760`) bekler; öğrenci komut vermeden hareket etmez.
  - Doğrulama 3: Öğrenci tıklama ve yön kontrolleriyle karakteri serbestçe yönlendirir, durdurur, geriye döndürür.
  - Doğrulama 4: Karakter fotoğraftaki gerçek taç kapı açıklığına (`x: 520-586, y: 480-590`) doğru yürür, ayakları zemine basarak tam kapı açıklığından tonozlu iç koridora adım atar. Yan duvarlar çarpışmaya kapalıdır.
  - Doğrulama 5: Geçiş boyunca kapı açıklığı ve karakterin ayakları hem masaüstü hem de mobil kadrajda kalır (`isFeetInView === true`).
  - Doğrulama 6: [Sınıfa Dön] düğmesiyle sınıf ortamına kesintisiz dönüş sağlanır.
  - Kesintisiz ekran kayıtları: `docs/assets/videos/grade3_sultanhani_walkable_desktop.webm` (2.61 MB) ve `grade3_sultanhani_walkable_mobile.webm` (2.42 MB).
- **`npm run build` (`vite build`)**: Geçti — **1.30s** içinde hatasız üretim derlemesi üretildi.

# Test ve Kalite Güvence Raporu — Sürüm 6.5.3 (Aşama 6.5: Akıllı Tahta — Sultanhanı Kervansarayı Macerası / Taç Kapı Eşik Hizalaması ve Kenara Kadar Görünür Ayrılış)

## 1. Çalıştırıldı ve Geçti
- **`npm run typecheck` (`tsc --noEmit`)**: Geçti — **0 hata** (strict TypeScript).
- **`npm run lint` (`eslint .`)**: Geçti — **0 hata, 0 uyarı**.
- **`npm run test` (`vitest run`)**: Geçti — **107 / 107 test** (`src/test/walkable.test.tsx` [74 test] + `src/test/campus.test.tsx` [33 test], `46.7s`):
  - 72. Aşama 6.5: `SmartBoardModal` 3. sınıf seçiminde `Grade3SmartBoardAdventureView` (Aksaray Sultanhanı Kervansarayı, Taç Kapı, Gezgin Çocuk Leo ve harita) açar.
  - 73. Aşama 6.5: `Grade3SmartBoardAdventureView` tekil hikaye akışı (Meydanda belirgin yürüyüş, kapıda duruş ve Leo ile "Hello!", kamera takibi ile ayaklarıyla aynı taş eşiği geçiş, avluda gece vedalaşması ve "Good night!", görünür el sallama, kadrajdan çıkış ve tamamlama ekranı), sesli telaffuz desteği, cezasız ipucu toleransı, tamamlama ve sınıfa dönüş sunar.
  - 74. Aşama 6.5: `renderClassroomLayeredBackground` 3. sınıf için 4 masa tamamlandığında davetkâr parıltıyı (`#38bdf8` gölge ve altın çerçeve) çizer; 4 masa tamamlanmadan çizmez.
  - 63, 68, 70, 71: Keşfet, Öğren, Üret ve Paylaş masaları %100 korundu.
- **`npx playwright test e2e/grade3_smartboard_adventure.spec.ts --project=chromium`**: Geçti — **2 / 2 test** (`29.7s`, toplam oynanış süresi: **23.6s**).
- **`npx playwright test e2e/grade3_smartboard_adventure.spec.ts --project=mobile-chrome`**: Geçti — **2 / 2 test** (`31.3s`, toplam oynanış süresi: **25.2s**).
  - Senaryo 1 (Kilitli Durum): 4 masa tamamlanmadan Akıllı Tahtaya gidildiğinde modal açılmaz; bilgilendirme uyarısı gösterilir.
  - Senaryo 2 (Tamamlanmış Masalar & Kesintisiz Video Kaydı):
    - Meydana giriş ve taç kapıya belirgin adımlarla yürüyüş (`grade3_smartboard_square_arrival.png`).
    - Kapının önünde duruş, Leo'ya dönüş ve "Hello!" konuşması (`grade3_smartboard_sultanhani_arrival.png`).
    - Taç kapı açıklığı tabanında 3D Selçuklu taş eşiği; iki çocuğun ayaklarının taş zemine basarak kapıya yaklaşması, aynı eşiği aşması ve açıklığın içinden yürümesi (`grade3_smartboard_threshold_crossing.png`).
    - Eşik geçildikten sonra avlunun açılışı, gece ışığı ve "Good night!" vedası (`grade3_smartboard_courtyard_farewell.png`).
    - Görünür biçimde el sallama ve çocukların belirgin adımlarla kadrajın kenarına kadar %100 görünür ayrılışı (`grade3_smartboard_waving_departure.png`).
    - Ayrılış tamamlandıktan sonra açılan başarı ekranı (`grade3_smartboard_adventure_completed.png`).
    - Sınıfa dönüş ve tahtanın önünde kalış (`grade3_smartboard_return_classroom.png`).
    - Kesintisiz video kayıtları: `docs/assets/videos/grade3_smartboard_desktop_continuous.webm` (3.9 MB) ve `grade3_smartboard_mobile_continuous.webm` (4.1 MB).
- **`npm run build` (`vite build`)**: Geçti — **949ms** içinde hatasız üretim derlemesi üretildi.

# Test ve Kalite Güvence Raporu — Sürüm 6.3.1 (Aşama 6.3.1: 3. Sınıf Üret Masası Hata Düzeltmesi — Kelime Seçim ve İlerleme)

## 1. Çalıştırıldı ve Geçti
- **`npm run typecheck` (`tsc --noEmit`)**: Geçti — **0 hata** (strict TypeScript).
- **`npm run lint` (`eslint .`)**: Geçti — **0 hata, 0 uyarı**.
- **`npm run test` (`vitest run`)**: Geçti — **104 / 104 test** (`src/test/walkable.test.tsx` [71 test] + `src/test/campus.test.tsx` [33 test], `30.7s`):
  - 71. Aşama 6.3.1: 3. Sınıf Üret Masası hata düzeltmesi: Senaryo A (doğru sıralama ile otomatik ilerleme), Senaryo B (yanlış sıralamada açık uyarı, ipucu ve Yeniden Dene düğmesi ile tek tıkla kurtarma), Senaryo C (tek kelimelik 3. ve 4. görevlerde yanlış seçim sonrası anında düzeltme ve takılmama).
  - 68. Aşama 6.3: 3. Sınıf Üret Masası: Etkinlik A (Cümlemi Oluştur), Etkinlik B (Doğru Cümleyi Bul), uret kaydı ve sınıfa dönüş.
  - 63, 66, 70: Keşfet, Öğren ve Paylaş masaları tam regülasyon uyumuyla korundu.
- **`npx playwright test e2e/grade3_uret_table.spec.ts --workers=1`**: Geçti — **2 / 2 test** (`chromium` [30.7s] + `mobile-chrome` [30.5s], toplam `1.1m`):
  - Senaryo B: Görev 1'de öğrenci önce "morning" sonra "Good" seçtiğinde yanlış sıralama uyarısı ve pedagojik ipucu gösterildi; belirgin [Yeniden Dene] butonuna basıldığında seçim ve uyarının anında temizlendiği doğrulandı.
  - Senaryo A: Görev 1'de "Good" ve ardından "morning" seçildiğinde doğru kabul edildi, sesli okuma tetiklendi ve 1200ms sonra öğrenci müdahalesine gerek kalmadan 2. göreve ("Good night!") geçildiği doğrulandı. Hızlı çift tıklamanın çift geçişe yol açmadığı doğrulandı.
  - Senaryo C: Görev 3'te ("Hello!") öğrenci yanlışlıkla "Goodbye!" seçtiğinde uyarı verildi; ardından doğrudan doğru "Hello!" kartına dokunduğunda takılmadan seçimin yenilendiği ve görevin tamamlandığı doğrulandı.
  - 4 görevin tamamlanması -> Ara geçiş ekranı -> Etkinlik B (4 tur) -> Başarı ekranı -> [Tekrar Oyna] sıfırlaması -> [Masadan Kalk / Sınıfa Dön] ile öğrencinin sınıfta kalması başarıyla doğrulandı.
- **`npx playwright test e2e/grade3_hello_garden.spec.ts e2e/grade3_ogren_table.spec.ts e2e/grade3_paylas_table.spec.ts --workers=1`**: Geçti — **6 / 6 test** (`1.5m`):
  - Keşfet Masası (2 / 2 test geçti).
  - Öğren Masası (2 / 2 test geçti).
  - Paylaş Masası (2 / 2 test geçti).
  - Sıfır regresyon sağlandı.
- **`npm run build` (`vite build`)**: Geçti — **853ms** içinde hatasız üretim derlemesi üretildi.

# Test ve Kalite Güvence Raporu — Sürüm 6.4.0 (Aşama 6.4: 3. Sınıf Paylaş Masası — "Greetings / Birlikte Konuşalım" Karşılık Ver & Sen Başlat)

## 1. Çalıştırıldı ve Geçti
- **`npm run typecheck` (`tsc --noEmit`)**: Geçti — **0 hata** (strict TypeScript).
- **`npm run lint` (`eslint .`)**: Geçti — **0 hata, 0 uyarı**.
- **`npm run test` (`vitest run`)**: Geçti — **103 / 103 test** (`src/test/walkable.test.tsx` [70 test] + `src/test/campus.test.tsx` [33 test], `25.7s`):
  - 69. 3. Sınıf Paylaş Masası: "GREETINGS (BİRLİKTE KONUŞALIM)" başlığını ve pembe/rose istasyon temasını açar.
  - 70. 3. Sınıf Paylaş Masası: Etkinlik A (Arkadaşım Ne Söylüyor?: 4 durum, karakter balonu, karşılık seçimi, ipucu), Etkinlik B (Şimdi Sen Konuş!: 4 tur, durum değerlendirme, sen başlat, arkadaş cevabı), 4 aşama tamamlama kaydı ve sınıfa dönüş sunar.
  - 64. Diğer sınıflar veya diğer masalar bu akıştan etkilenmez, orijinal durumlarını korur.
- **`npx playwright test e2e/grade3_paylas_table.spec.ts --workers=1`**: Geçti — **2 / 2 test** (`chromium` [19.2s] + `mobile-chrome` [19.6s], toplam `41.7s`):
  - 1. Selçuklu Taç Kapı açıldı -> Yürünebilir Kampüs Avlusu'na girildi -> İngilizce Dünyası binasına girildi.
  - 2. 3. Sınıf seçildi ve Keşfet, Öğren ve Üret başarıları sonrası 4. Paylaş Masası'na (x: 665, y: 418) yüründü.
  - 3. 4. PAYLAŞ MASASI — GREETINGS (BİRLİKTE KONUŞALIM) modalı açıldı (`docs/assets/grade3_paylas_desktop_modal.png` / `docs/assets/grade3_paylas_mobile_modal.png`).
  - 4. [Dinle] (0.85x) ve [Yavaş Dinle] (0.65x) düğmeleri test edildi.
  - 5. Etkinlik A (Arkadaşım Ne Söylüyor?): 4 durum boyunca arkadaşların selamlarına doğru karşılıklar seçildi; yanlış seçimde tolerans ve cezasız Türkçe ipucu sağlandı.
  - 6. Ara geçiş ekranı ("Karşılıklı Konuşmaları Başarıyla Tamamladın! 💬 / 2. Etkinliğe Başla (Şimdi Sen Konuş!)") doğrulandı.
  - 7. Etkinlik B (Şimdi Sen Konuş!): 4 tur boyunca durum değerlendirilip konuşma başlatıldı; arkadaşın sevinçli karşılık vermesi doğrulandı.
  - 8. Tamamlama ekranı: Dört selamlaşma ifadesinin görsel mini sözlük kartları ve rozeti doğrulandı (`docs/assets/grade3_paylas_desktop_completed.png` / `docs/assets/grade3_paylas_mobile_completed.png`).
  - 9. Tamamlama metninin tam olarak `"Harika! Dört öğrenme masasını da tamamladın. Artık Büyük Görev'e hazırsın! 🏆"` olduğu doğrulandı.
  - 10. **Akıllı tahtaya otomatik ışınlanmanın OLMADIĞI** doğrulandı.
  - 11. Masadan kalkıldığında öğrencinin sınıfta, 4. Paylaş Masası'nın yanında (`desk-4`, `x: 665, y: 418`) kaldığı doğrulandı (`docs/assets/grade3_paylas_desktop_return_classroom.png` / `docs/assets/grade3_paylas_mobile_return_classroom.png`).
  - 12. `localStorage` üzerinde `dek_campus_v1_state` içinde 4 aşamanın tamamlandığı (`completedStages: ['kesfet', 'ogren', 'uret', 'paylas']`) ve `completed: true` olarak işlendiği doğrulandı.
- **`npx playwright test e2e/grade3_hello_garden.spec.ts e2e/grade3_ogren_table.spec.ts e2e/grade3_uret_table.spec.ts --workers=1`**: Geçti — **6 / 6 test** (`1.5m`):
  - Keşfet Masası (2 / 2 test geçti).
  - Öğren Masası (2 / 2 test geçti).
  - Üret Masası (2 / 2 test geçti).
  - Sıfır regresyon sağlandı.
- **`npm run build` (`vite build`)**: Geçti — **1.00s** içinde hatasız üretim derlemesi üretildi.

## 2. Kanıt Ekran Görüntüleri (`docs/assets/`):
- **Masaüstü (Chromium)**:
  - `grade3_paylas_desktop_modal.png`: 4. Paylaş Masası Karşılık Ver arayüzü, gül/pembe teması, [Dinle] ve [Yavaş Dinle] butonları, karakter konuşma balonu.
  - `grade3_paylas_desktop_completed.png`: İki etkinlik tamamlandıktan sonraki 4 aşama tamamlama başarı ekranı ve 4 ifadenin özeti.
  - `grade3_paylas_desktop_return_classroom.png`: Masadan kalkış sonrası sınıfta 4. Paylaş Masası'nın yanında kalış.
- **Mobil Dokunmatik (Mobile Chrome)**:
  - `grade3_paylas_mobile_modal.png`: Mobil dokunmatik arayüzde Arkadaşım Ne Söylüyor? paneli.
  - `grade3_paylas_mobile_completed.png`: Mobilde 4 aşama başarı ve tamamlama ekranı.
  - `grade3_paylas_mobile_return_classroom.png`: Mobilde masadan kalkış sonrası sınıfta kalma durumu.

# Test ve Kalite Güvence Raporu — Sürüm 6.3.0 (Aşama 6.3: 3. Sınıf Üret Masası — "Greetings / Cümlemi Oluştur" Kelimeleri Birleştir & Doğru Cümleyi Bul)

## 1. Çalıştırıldı ve Geçti
- **`npm run typecheck` (`tsc --noEmit`)**: Geçti — **0 hata** (strict TypeScript).
- **`npm run lint` (`eslint .`)**: Geçti — **0 hata, 0 uyarı**.
- **`npm run test` (`vitest run`)**: Geçti — **101 / 101 test** (`src/test/walkable.test.tsx` [68 test] + `src/test/campus.test.tsx` [33 test], `4.6s`):
  - 67. 3. Sınıf Üret Masası: "GREETINGS (CÜMLEMİ OLUŞTUR)" başlığını ve yeşil istasyon temasını açar.
  - 68. 3. Sınıf Üret Masası: Etkinlik A (Cümlemi Oluştur: 4 görev, kelime seçimi, geri alma, otomatik noktalama, ipucu), Etkinlik B (Doğru Cümleyi Bul: 2 seçenek), uret aşaması kaydı ve sınıfa dönüş sunar.
  - 64. Diğer sınıflar veya diğer masalar bu akıştan etkilenmez, orijinal durumlarını korur.
- **`npx playwright test e2e/grade3_uret_table.spec.ts --workers=1`**: Geçti — **2 / 2 test** (`chromium` + `mobile-chrome` dokunmatik, `32.9s`):
  - 1. Selçuklu Taç Kapı açıldı -> Yürünebilir Kampüs Avlusu'na girildi -> İngilizce Dünyası binasına girildi.
  - 2. 3. Sınıf seçildi ve Keşfet & Öğren başarıları sonrası 3. Üret Masası'na (x: 265, y: 418) yüründü.
  - 3. 3. ÜRET MASASI — GREETINGS (CÜMLEMİ OLUŞTUR) modalı açıldı.
  - 4. [Dinle] (0.85x) ve [Yavaş Dinle] (0.65x) düğmeleri test edildi.
  - 5. Etkinlik A (Cümlemi Oluştur): 4 görev boyunca kelime kartları seçildi, yanlış sıralamada geri alma test edildi, doğru sıralama onaylandı ve seslendirildi.
  - 6. Ara geçiş ekranı ("Cümlelerini Başarıyla Oluşturdun! ✏️ / 2. Etkinliğe Başla") doğrulandı.
  - 7. Etkinlik B (Doğru Cümleyi Bul): 4 tur boyunca 2 seçenek arasından görsele uyan ifade seçildi; yanlış seçimde tolerans sağlandı.
  - 8. Tamamlama ekranı ve 4 ifadenin görsel mini sözlük özeti doğrulandı.
  - 9. "Paylaş Masasına Git" doğrudan ışınlanma butonunun OLMADIĞI ve tek çıkışın "Masadan Kalk / Sınıfa Dön" olduğu doğrulandı.
  - 10. Masadan kalkıldığında öğrencinin sınıfta, Üret Masası'nın yanında kaldığı doğrulandı.
  - 11. `localStorage` üzerinde `dek_campus_v1_state` içinde `"uret"` aşamasının kalıcı olarak kaydedildiği ve sıradaki aşamanın `"paylas"` olduğu doğrulandı.
- **`npx playwright test e2e/grade3_hello_garden.spec.ts --workers=1`**: Geçti — **2 / 2 test** (Keşfet Masası'nın bozulmadığı doğrulandı).
- **`npx playwright test e2e/grade3_ogren_table.spec.ts --workers=1`**: Geçti — **2 / 2 test** (Öğren Masası'nın bozulmadığı doğrulandı).
- **`npm run build` (`vite build`)**: Geçti — **1.16s** içinde hatasız üretim derlemesi üretildi.

## 2. Kanıt Ekran Görüntüleri (`docs/assets/`):
- **Masaüstü (Chromium)**:
  - `grade3_uret_desktop_modal.png`: 3. Üret Masası Cümlemi Oluştur arayüzü, zümrüt yeşili teması, [Dinle] ve [Yavaş Dinle] butonları, kelime blokları.
  - `grade3_uret_desktop_completed.png`: İki etkinlik tamamlandıktan sonraki başarı ekranı ve 4 ifadenin mini sözlük özeti.
  - `grade3_uret_desktop_return_classroom.png`: Masadan kalkış sonrası sınıfta Üret Masası'nın yanında kalış.
- **Mobil Dokunmatik (Mobile Chrome)**:
  - `grade3_uret_mobile_modal.png`: Mobil dokunmatik arayüzde Cümlemi Oluştur paneli.
  - `grade3_uret_mobile_completed.png`: Mobilde başarı ve tamamlama ekranı.
  - `grade3_uret_mobile_return_classroom.png`: Mobilde masadan kalkış sonrası sınıfta kalma durumu.

# Test ve Kalite Güvence Raporu — Sürüm 6.2.0 (Aşama 6.2: 3. Sınıf Öğren Masası — "Greetings / Dinle ve Anla" Dinle-Bul & Sesleri Ayırt Et)

## 1. Çalıştırıldı ve Geçti
- **`npm run typecheck` (`tsc --noEmit`)**: Geçti — **0 hata** (strict TypeScript).
- **`npm run lint` (`eslint .`)**: Geçti — **0 hata, 0 uyarı**.
- **`npm run test` (`vitest run`)**: Geçti — **99 / 99 test** (`src/test/walkable.test.tsx` [66 test] + `src/test/campus.test.tsx` [33 test], `4.6s`):
  - 65. 3. Sınıf Öğren Masası: "GREETINGS (DİNLE VE ANLA)" başlığını ve sarı istasyon temasını açar.
  - 66. 3. Sınıf Öğren Masası: Etkinlik A (Dinle ve Bul: 4 görsel, ipucu, hata toleransı), Etkinlik B (Sesleri Ayırt Et: 2 seçenek), ilerleme kaydı ve sınıfa dönüş sunar.
  - 64. Diğer sınıflar veya diğer masalar bu akıştan etkilenmez, orijinal durumlarını korur.
- **`npx playwright test e2e/grade3_ogren_table.spec.ts --workers=1`**: Geçti — **2 / 2 test** (`chromium` [17.0s] + `mobile-chrome` [17.2s], toplam `37.4s`):
  - 1. Selçuklu Taç Kapı açıldı -> Yürünebilir Kampüs Avlusu'na girildi -> İngilizce Dünyası binasına girildi.
  - 2. 3. Sınıf seçildi ve Keşfet Masası başarısı sonrası 2. Öğren Masası'na (x: 665, y: 288) yüründü.
  - 3. 2. ÖĞREN MASASI — GREETINGS (DİNLE VE ANLA) modalı açıldı (`docs/assets/grade3_ogren_desktop_modal.png` / `docs/assets/grade3_ogren_mobile_modal.png`).
  - 4. [Dinle] (0.85x) ve [Yavaş Dinle] (0.65x) düğmeleri test edildi.
  - 5. Etkinlik A (Dinle ve Bul): 4 tur boyunca sesler dinlenip 4 görsel arasından doğru olan seçildi; yanlış seçimde pedagojik ipucu ("Tekrar dene! İpucu: ...") gösterildi.
  - 6. Ara geçiş ekranı ("Harika Başardın! 🎉 / 2. Etkinliğe Başla") doğrulandı.
  - 7. Etkinlik B (Sesleri Ayırt Et): 4 tur boyunca sesler dinlenip 2 yazılı seçenek arasından doğru olan seçildi; yanlış seçimde telafi sağlandı.
  - 8. Tamamlama ekranı ve 4 ifadenin görsel mini sözlük özeti doğrulandı (`docs/assets/grade3_ogren_desktop_completed.png` / `docs/assets/grade3_ogren_mobile_completed.png`).
  - 9. "Üret Masasına Git" doğrudan ışınlanma butonunun OLMADIĞI ve tek çıkışın "Masadan Kalk / Sınıfa Dön" olduğu doğrulandı.
  - 10. Masadan kalkıldığında öğrencinin sınıfta, Öğren Masası'nın yanında kaldığı doğrulandı (`docs/assets/grade3_ogren_desktop_return_classroom.png` / `docs/assets/grade3_ogren_mobile_return_classroom.png`).
  - 11. `localStorage` üzerinde `dek_campus_v1_state` içinde `"ogren"` aşamasının kalıcı olarak kaydedildiği doğrulandı.
- **`npx playwright test e2e/grade3_hello_garden.spec.ts --workers=1`**: Geçti — **2 / 2 test** (`chromium` [7.9s] + `mobile-chrome` [7.7s]): Keşfet Masası'nın bozulmadan %100 çalıştığı doğrulandı.
- **`npm run build` (`vite build`)**: Geçti — **855ms** içinde hatasız üretim derlemesi üretildi.

## 2. Kanıt Ekran Görüntüleri (`docs/assets/`):
- **Masaüstü (Chromium)**:
  - `grade3_ogren_desktop_modal.png`: 2. Öğren Masası Dinle ve Bul arayüzü, sarı/altın teması, [Dinle] ve [Yavaş Dinle] butonları.
  - `grade3_ogren_desktop_completed.png`: İki etkinlik tamamlandıktan sonraki başarı ekranı ve 4 ifadenin özeti.
  - `grade3_ogren_desktop_return_classroom.png`: Masadan kalkış sonrası sınıfta Öğren Masası'nın yanında kalış.
- **Mobil Dokunmatik (Mobile Chrome)**:
  - `grade3_ogren_mobile_modal.png`: Mobil dokunmatik arayüzde Dinle ve Bul paneli.
  - `grade3_ogren_mobile_completed.png`: Mobilde başarı ve tamamlama ekranı.
  - `grade3_ogren_mobile_return_classroom.png`: Mobilde masadan kalkış sonrası sınıfta kalma durumu.

# Test ve Kalite Güvence Raporu — Sürüm 6.1.0 (Aşama 6.1: 3. Sınıf Keşfet Masası — "Greetings / Selamlaşma" Görsel Destekli Öğrenme ve Eşleştirme)

## 1. Çalıştırıldı ve Geçti
- **`npm run typecheck` (`tsc --noEmit`)**: Geçti — **0 hata** (strict TypeScript).
- **`npm run lint` (`eslint .`)**: Geçti — **0 hata, 0 uyarı**.
- **`npm run test` (`vitest run`)**: Geçti — **97 / 97 test** (`src/test/walkable.test.tsx` [64 test] + `src/test/campus.test.tsx` [33 test], `4.8s`):
  - 62. 3. Sınıf Keşfet Masası: "GREETINGS (SELAMLAŞMA)" istasyon başlığı ve özel rozetini açar.
  - 63. "Greetings (Selamlaşma)": Bölüm A Keşfet (4 kart, Dinle/Yavaş), Bölüm B Eşleştir (ipucu, hata toleransı) ve sınıfa dönüş sunar.
  - 64. Diğer sınıflar veya diğer masalar bu akıştan etkilenmez, orijinal durumlarını korur.
- **`npx playwright test e2e/grade3_hello_garden.spec.ts --workers=1`**: Geçti — **2 / 2 test** (`chromium` [11.2s] + `mobile-chrome` [10.4s], toplam `26.8s`):
  - 1. Selçuklu Taç Kapı açıldı -> Yürünebilir Kampüs Avlusu'na girildi -> İngilizce Dünyası binasına girildi.
  - 2. Sınıf Seçim Panosu'ndan 3. Sınıf seçildi.
  - 3. 1. Keşfet Masası'na yüründü ve oturuldu.
  - 4. Bölüm A (Keşfet): 4 büyük çocuk dostu SVG görsel kartı (Hello, Good morning, Goodbye, Good night) görüntülendi (`docs/assets/grade3_greetings_desktop_modal.png` / `docs/assets/grade3_greetings_mobile_modal.png`).
  - 5. 4 kart tek tek dinlendi ([Dinle] ve [Yavaş Dinle] çift hızlı telaffuz desteği doğrulandı) ve Bölüm B kilidi açıldı.
  - 6. Bölüm B (Eşleştir): Karışık sırada sunulan İngilizce ifadeler ile görseller eşleştirildi; yanlış eşleşmede pedagojik ipucu ("Bu görsel günaydın selamını anlatıyor...") gösterildi, doğru eşleşmede kartlar kilitlendi.
  - 7. Tamamlama ekranı ve 4 ifadenin özet tablosu doğrulandı (`docs/assets/grade3_greetings_desktop_completed.png` / `docs/assets/grade3_greetings_mobile_completed.png`).
  - 8. "Öğren Masasına Git" doğrudan ışınlanma butonunun kaldırıldığı ve tek aksiyonun "Masadan Kalk / Sınıfa Dön" olduğu doğrulandı.
  - 9. Masadan kalkıldığında öğrencinin sınıfta, Keşfet Masası'nın hemen yanında kaldığı ve avluya/başka yere fırlatılmadığı doğrulandı (`docs/assets/grade3_greetings_desktop_return_classroom.png` / `docs/assets/grade3_greetings_mobile_return_classroom.png`).
- **`npm run build` (`vite build`)**: Geçti — **1.19s** içinde hatasız üretim derlemesi üretildi.

## 2. Kanıt Ekran Görüntüleri (`docs/assets/`):
- **Masaüstü (Chromium)**:
  - `grade3_greetings_desktop_modal.png`: 4 kartlı görsel keşif ve telaffuz ekranı.
  - `grade3_greetings_desktop_completed.png`: Eşleştirme sonrası başarı ve tamamlama ekranı.
  - `grade3_greetings_desktop_return_classroom.png`: Masadan kalkış sonrası sınıfta Keşfet Masası'nın yanında kalış.
- **Mobil Dokunmatik (Mobile Chrome)**:
  - `grade3_greetings_mobile_modal.png`: Dokunmatik ekranda 4 kartlı görsel keşif arayüzü.
  - `grade3_greetings_mobile_completed.png`: Dokunmatik tamamlama ve pekiştirme kartı.
  - `grade3_greetings_mobile_return_classroom.png`: Mobilde sınıfta kalış durumu.

# Test ve Kalite Güvence Raporu — Sürüm 5.1.3 (Aşama 5.1.3: 3. Sınıf Keşfet Masası — Gerçek Sinematik 2.5D Canlı Bahçe Simülasyonu)

## 1. Çalıştırıldı ve Geçti
- **`npm run typecheck` (`tsc --noEmit`)**: Geçti — **0 hata** (strict TypeScript).
- **`npm run lint` (`eslint .`)**: Geçti — **0 hata, 0 uyarı**.
- **`npm run test` (`vitest run`)**: Geçti — **97 / 97 test** (`src/test/walkable.test.tsx` [64 test] + `src/test/campus.test.tsx` [33 test], `10.9s`):
  - 62. 3. Sınıf Keşfet Masası: "Hello! Tanışma Bahçesi" minyatür simülasyon başlığını ve özel rozetini açar.
  - 63. "Hello! Tanışma Bahçesi": 3 karakter (Ali, Ece, Can), Dinle + Yavaş Dinle, hata geri bildirimi ve 4 etkileşimli minyatür bahçe simülasyonu sunar (Ali ile selamlaşma, Ece ile ad sorma & kendini tanıtma, Can ile yaş sorma & bahçede 9 sayısını seçme, vedalaşma ve sınıfa dönüş).
  - 64. Diğer sınıflar veya diğer masalar Tanışma Bahçesi prototipinden etkilenmez, orijinal akışlarını korur.
- **`npx playwright test e2e/grade3_hello_garden.spec.ts --workers=1`**: Geçti — **2 / 2 test** (`chromium` [11.4s] + `mobile-chrome` [10.6s], toplam `27.5s`):
  - 1. Kapıdan girildi -> Avluya varıldı -> İngilizce sınıfına girildi.
  - 2. Sınıf Seçim Panosu'ndan 3. Sınıf seçildi.
  - 3. 1. Keşfet Masası'na yüründü ve oturuldu.
  - 4. Masanın üzerinde sinematik 2.5D minyatür bahçe açıldı; taş yol, kemer kapı, ağaçlar, çiçekler ve 3 canlı çocuk karakter doğrulandı (`grade3_hello_garden_desktop_modal.png` / `grade3_hello_garden_mobile_modal.png`).
  - 5. Karakterler doğrudan seçilebilir: Ali, Ece ve Can.
  - 6. 1. Selamlaşma: Ali ile konuşuldu; yanlış cevap ("Goodbye!") verilince hata geri bildirimi alındı; doğru cevap ("Hello!") ile ilerlendi.
  - 7. 2. Tanışma: Ece ile ad sorma ("What's your name?") ve hazır kâşif kimliğini tanıtma ("My name is Deniz.") tamamlandı.
  - 8. 3. Yaş Sorma ve Sayı Etkileşimi: Can "I'm nine." dedi; bahçedeki 9 sayısı belirlendi ve Can tebrik etti.
  - 9. 4. Vedalaşma: Karakterlerle "Goodbye!" denilerek vedalaşıldı; karakterler el sallayarak uğurladı.
  - 10. Tamamlama ekranı ve 4 temel ifadenin özeti doğrulandı (`grade3_hello_garden_desktop_completed.png` / `grade3_hello_garden_mobile_completed.png`).
  - 11. "Öğren Masasına Git" butonu bulunmadığı doğrulandı.
  - 12. "Masadan Kalk / Sınıfa Dön" butonuna basıldığında modal kapandı ve öğrencinin sınıfta, Keşfet Masası'nın hemen yanında kaldığı doğrulandı (`grade3_hello_garden_desktop_return_classroom.png` / `grade3_hello_garden_mobile_return_classroom.png`).
- **`npx playwright test e2e/stage51_tables.spec.ts --project=chromium`**: Geçti — **1 / 1 test** (`chromium` [11.6s]): Diğer 4 masa genel döngüsü, akıllı tahta koruma sistemi ve dış kapı çıkış akışının bozulmadan çalıştığı doğrulandı.
- **`npm run build` (`vite build`)**: Geçti — **1.37s** içinde hatasız üretim derlemesi oluşturuldu.

## 2. Test Kanıt Ekran Görüntüleri (`docs/assets/`):
- **Masaüstü Kanıtları**:
  - `grade3_hello_garden_desktop_modal.png`: 2.5D minyatür bahçe sahnesi, 3 çocuk karakter (Ali, Ece, Can), ahşap masa çerçevesi, Dinle & Yavaş Dinle butonları.
  - `grade3_hello_garden_desktop_completed.png`: 4 etkileşim tamamlandıktan sonraki tamamlama ekranı ve pedagojik özet.
  - `grade3_hello_garden_desktop_return_classroom.png`: Masadan kalkıldığında öğrencinin sınıfta Keşfet Masası'nın yanında kalışı.
- **Mobil Dokunmatik Kanıtları**:
  - `grade3_hello_garden_mobile_modal.png`: Mobil ekran boyutunda 2.5D minyatür bahçe simülasyonu ve dokunmatik etkileşim butonları.
  - `grade3_hello_garden_mobile_completed.png`: Mobil tamamlama ve başarı ekranı.
  - `grade3_hello_garden_mobile_return_classroom.png`: Mobilde masadan kalkış sonrası sınıfta kalma durumu.

# Test ve Kalite Güvence Raporu — Sürüm 5.1.2 (3. Sınıf Keşfet Masası: "Hello! Tanışma Bahçesi" Görsel, Konuşma Dili ve Telaffuz Desteği)

## 1. Çalıştırıldı ve Geçti
- **`npm run typecheck` (`tsc --noEmit`)**: Geçti — **0 hata** (strict TypeScript).
- **`npm run lint` (`eslint .`)**: Geçti — **0 hata, 0 uyarı**.
- **`npm run test` (`vitest run`)**: Geçti — **97 / 97 test** (`src/test/walkable.test.tsx` [64 test] + `src/test/campus.test.tsx` [33 test], `7.2s`):
  - 62. 3. Sınıf Keşfet Masası: "Hello! Tanışma Bahçesi" prototip başlığını ve özel prototip rozetini açar.
  - 63. "Hello! Tanışma Bahçesi": En fazla 3 karakter (Elif, Can, Sen), çift hızlı telaffuz (`Dinle` & `Yavaş Dinle`), hece kılavuzu ve 3 adımlı sade tanışma akışı sunar.
  - 64. Diğer sınıflar veya diğer masalar Tanışma Bahçesi prototipinden etkilenmez, orijinal akışlarını korur.
- **`npx playwright test e2e/grade3_hello_garden.spec.ts --workers=1`**: Geçti — **2 / 2 test** (`chromium` [6.3s] + `mobile-chrome` [7.6s], toplam `18.2s`):
  - 1. Kapıdan girildi -> Avluya varıldı -> İngilizce sınıfına girildi.
  - 2. Sınıf Seçim Panosu'ndan 3. Sınıf seçildi.
  - 3. 1. Keşfet Masası'na yüründü ve oturuldu.
  - 4. "Hello! Tanışma Bahçesi" sinematik sahnesi açıldı; Elif, Can ve Sen karakterleri, `Dinle` ve `Yavaş Dinle` butonları, okunuş kılavuzu (`he-LO`) doğrulandı (`grade3_hello_garden_modal.png`).
  - 5. 3 adımlı sade diyalog tamamlandı: `Hello!`, `What is your name?`, `Nice to meet you.`.
  - 6. Tamamlama ekranı ve öğrenilen ifadeler özet kartı doğrulandı (`grade3_hello_garden_completed.png`).
  - 7. "Masadan Kalk / Sınıfa Dön" butonuna basıldığında modal kapandı ve öğrencinin sınıfta, masanın yanında kaldığı doğrulandı (`grade3_hello_garden_return_classroom.png`).
- **`npm run build` (`vite build`)**: Geçti — **1.49s** içinde hatasız üretim derlemesi oluşturuldu.

## 2. Test Kanıt Ekran Görüntüleri (`docs/assets/`):
- `grade3_hello_garden_modal.png`: 3. Sınıf Keşfet Masası "Hello! Tanışma Bahçesi" 2.5D bahçe sahnesi, 3 karakter, çift hızlı ses dinleme düğmeleri ve okunuş kılavuzu.
- `grade3_hello_garden_completed.png`: Tanışma Bahçesi tamamlama ve öğrenilen ifadeler özet kartı.
- `grade3_hello_garden_return_classroom.png`: Masadan kalkıldığında öğrencinin sınıfta, masanın hemen yanında kaldığını kanıtlayan ekran görüntüsü.

# Test ve Kalite Güvence Raporu — Sürüm 5.1.1 (3. Sınıf Keşfet Masası: "Hello! Tanışma Bahçesi" Prototipi)

## 1. Çalıştırıldı ve Geçti
- **`npm run typecheck` (`tsc --noEmit`)**: Geçti — **0 hata** (strict TypeScript).
- **`npm run lint` (`eslint .`)**: Geçti — **0 hata, 0 uyarı**.
- **`npm run test` (`vitest run`)**: Geçti — **97 / 97 test** (`src/test/walkable.test.tsx` [64 test] + `src/test/campus.test.tsx` [33 test], toplam `5.6 s`):
  - 62. 3. Sınıf Keşfet Masası: "Hello! Tanışma Bahçesi" prototip başlığını ve özel prototip rozetini açar.
  - 63. "Hello! Tanışma Bahçesi": En fazla 3 karakter (Elif, Can, Sen) ve 3 adımlı sade tanışma akışı sunar.
  - 64. Diğer sınıflar veya diğer masalar Tanışma Bahçesi prototipinden etkilenmez, orijinal akışlarını korur.
- **`npx playwright test e2e/grade3_hello_garden.spec.ts e2e/stage51_tables.spec.ts --workers=1`**: Geçti — **4 / 4 test**:
  - `grade3_hello_garden.spec.ts` (chromium & mobile-chrome): 3. sınıf panodan seçildi, Keşfet Masasına oturuldu, 3 karakterli diyalog tamamlandı, başarı ekranı görüntülendi ve sınıfa dönüldü (`grade3_hello_garden_modal.png`, `grade3_hello_garden_completed.png`, `grade3_hello_garden_return_classroom.png`).
  - `stage51_tables.spec.ts` (chromium & mobile-chrome): 4 masa genel döngüsü, akıllı tahta koruması ve dış kapı çıkış akışı tam korundu.
- **`npm run build` (`vite build`)**: Geçti — **1.10s** içinde hatasız üretim derlemesi oluşturuldu.

## 2. 3. Sınıf "Hello! Tanışma Bahçesi" Test Kanıt Ekran Görüntüleri (`docs/assets/`):
- `grade3_hello_garden_modal.png`: 3. Sınıf Keşfet Masası "Hello! Tanışma Bahçesi" 3 karakterli diyalog modalı.
- `grade3_hello_garden_completed.png`: Tanışma Bahçesi tamamlama ve öğrenilen ifadeler özet ekranı.
- `grade3_hello_garden_return_classroom.png`: Masadan kalkıldığında sınıfta, masanın yanında kalındığını kanıtlayan ekran görüntüsü.

# Test ve Kalite Güvence Raporu — Sürüm 5.1.0 (Aşama 5.1: İngilizce Sınıfında Dört Etkileşimli Masa ve Akıllı Tahta Koruması)

## 1. Çalıştırıldı ve Geçti
- **`npm run typecheck` (`tsc --noEmit`)**: Geçti — **0 hata** (strict TypeScript).
- **`npm run lint` (`eslint .`)**: Geçti — **0 hata, 0 uyarı**.
- **`npm run test` (`vitest run`)**: Geçti — **94 / 94 test** (`src/test/walkable.test.tsx` [61 test] + `src/test/campus.test.tsx` [33 test], toplam `4.6 s`):
  - 58. `TableStationModal` dört aşama için doğru Selçuklu başlığını ve masa adını görüntüler.
  - 59. `TableStationModal` Escape tuşu ve masadan kalk düğmesi ile sınıfa döner.
  - 60. `classroomSceneRenderer` dört masa için Selçuklu levhalarını çizer.
  - 61. Akıllı tahta modalı sınıfa dönme işlevini ve başlığını korur.
- **`npx playwright test e2e/stage51_tables.spec.ts`**: Geçti — **2 / 2 test** (`chromium` [9.0s] + `mobile-chrome` [10.0s]):
  - 1. Sinematik Selçuklu giriş kapısı açıldı (`stage51_1_gate.png`).
  - 2. Avluda yürünebilir sinematik avlu ve binalar açıldı (`stage51_2_courtyard.png`).
  - 3. İngilizce sınıfına girildi; 4 masa Selçuklu levhalarıyla doğrulandı (`stage51_3_classroom_tables.png`).
  - 4. Sınıf seçimi yapılmadan önce Keşfet Masası'na yaklaşıldığında "Önce Sınıf Seçim Panosu'ndan sınıfını seç." uyarısı verildi.
  - 5. Sınıf Seçim Panosundan 5. sınıf seçildi ve kaydedildi.
  - 6. Keşfet Masası'na oturuldu, `1. KEŞFET MASASI` başlığıyla istasyon modalı açıldı (`stage51_4_table_kesfet.png`).
  - 7. Keşfet tamamlanmadan Öğren Masası'na gidildiğinde "Önce Keşfet Masası'ndaki etkinliği tamamlamalısın." uyarısı ile sıralı ilerleme kuralı korundu (`stage51_5_table_ogren_gated.png`).
  - 8. Akıllı tahtaya yaklaşıldığında eski görev akışı açılmadı, açılış ışığı sonrası etkinliklerin sınıftaki 4 masaya taşındığı bilgisi gösterildi (`stage51_6_smartboard_protected.png`).
  - 9. Sınıftan avluya dönüldü (`stage51_7_return_courtyard.png`).
  - 10. Avludan güney dış kapıya yürünerek kampüsten çıkış ve ilk giriş kapısı sahnesine tam döngüsel varış doğrulandı (`stage51_8_full_cycle_at_gate.png`).
- **`npm run build` (`vite build`)**: Geçti — **902ms** içinde hatasız üretim derlemesi oluşturuldu.

## 2. Aşama 5.1 Test Kanıt Ekran Görüntüleri (`docs/assets/`):
- `stage51_1_gate.png`: Sinematik Selçuklu Taç Kapı başlangıcı.
- `stage51_2_courtyard.png`: Sinematik yürünebilir avlu ve yönlendirmeler.
- `stage51_3_classroom_tables.png`: İngilizce sınıfı ve Selçuklu levhalı 4 masa.
- `stage51_4_table_kesfet.png`: 1. Keşfet Masası istasyon modalı.
- `stage51_5_table_ogren_gated.png`: Sıralı ilerleme kuralı (Önce Keşfet Masası uyarısı).
- `stage51_6_smartboard_protected.png`: Akıllı tahta koruma mesajı (Etkinlikler masalara taşındı).
- `stage51_7_return_courtyard.png`: Sınıftan avluya dönüş.
- `stage51_8_full_cycle_at_gate.png`: Dış kapıdan çıkış sonrası giriş kapısına tam döngü.

# Test ve Kalite Güvence Raporu — Sürüm 5.0.4 (Tek Görevli Düzeltme: Sınıf Seçim Panosu, Akıllı Tahta Kilidi ve Dış Kapı Çıkış Döngüsü)

## 1. Çalıştırıldı ve Geçti
- **`npm run typecheck` (`tsc --noEmit`)**: Geçti — **0 hata** (strict TypeScript).
- **`npm run lint` (`eslint .`)**: Geçti — **0 hata, 0 uyarı**.
- **`npm run test` (`vitest run`)**: Geçti — **90 / 90 test** (`src/test/walkable.test.tsx` [57 test] + `src/test/campus.test.tsx` [33 test], toplam `4.5 s`):
- **`npx playwright test e2e/stage502_verify.spec.ts`**: Geçti — **2 / 2 test** (`chromium` [8.9s] + `mobile-chrome` [11.7s]):
  - 1. Sinematik Selçuklu giriş kapısı açıldı (`stage502_1_gate_initial.png`).
  - 2. Avluda sınıf seçimi kontrolü olmadığı (`toHaveCount(0)`) ve avlunun serbest keşfe hazır olduğu doğrulandı (`stage502_2_courtyard_nograde.png`).
  - 3. İngilizce Dünyası binası önüne gelinip "İngilizce Sınıfına Gir" tetiklendi (`stage502_3_enter_english_prompt.png`).
  - 4. İngilizce sınıfına girildi (`stage502_4_classroom_initial.png`).
  - 5. Henüz sınıf seçilmemişken akıllı tahtaya yaklaşıldığında "Önce Sınıfını Seç" ipucu ve tıklandığında "Önce sınıfını seç." uyarısı verilerek tahta açılması engellendi (`stage502_5_smartboard_locked_warning.png`).
  - 6. Akıllı tahtanın solundaki Selçuklu Sınıf Seçim Panosu'na yaklaşıldığında "Sınıfını Seç / Değiştir" ipucu açıldı (`stage502_6_grade_board_prompt.png`).
  - 7. Panoyla etkileşime girilip Selçuklu mimari ahşap/taş dokulu modalda 5. sınıf seçildi, başarıyla kaydedildi (`stage502_7_grade_board_modal.png`).
  - 8. Sınıf seçildikten sonra akıllı tahtaya yaklaşıldığında "Akıllı Tahtayı Aç" ipucu göründü ve tahta sorunsuz açıldı (`stage502_8_smartboard_opened.png`).
  - 9. Tahta kapatılıp "Avluya Dön" ile avluya dönüldü (`stage502_9_back_in_courtyard.png`).
  - 10. Avluda güneye dış kapıya yürünerek "Kampüsten Çık" etkileşim ipucu açıldı (`stage502_10_exit_gate_prompt.png`).
  - 11. Dış kapıdan çıkıldığında beyaz ekran veya bozulma olmadan giriş kapısı sahnesine dönüldü (`stage502_11_cycle_completed_at_gate.png`).
- **`npm run build` (`vite build`)**: Geçti — **886ms** içinde hatasız derlendi.

## 2. Test Kanıt Ekran Görüntüleri (`docs/assets/`):
- `stage502_1_gate_initial.png`: Sinematik Selçuklu Taç Kapı başlangıcı.
- `stage502_2_courtyard_nograde.png`: Avluda sınıf seçimi butonunun bulunmadığı ve serbest avlu görünümü.
- `stage502_3_enter_english_prompt.png`: İngilizce Dünyası kapısında etkileşim ipucu.
- `stage502_4_classroom_initial.png`: İngilizce sınıfı iç görünümü.
- `stage502_5_smartboard_locked_warning.png`: Sınıf seçilmeden akıllı tahta kilidi ve uyarısı.
- `stage502_6_grade_board_prompt.png`: Akıllı tahtanın solundaki Sınıf Seçim Panosu etkileşimi.
- `stage502_7_grade_board_modal.png`: Selçuklu mimari ahşap/taş dokulu Sınıf Seçim Panosu modalı.
- `stage502_8_smartboard_opened.png`: Sınıf seçimi sonrası akıllı tahtanın başarıyla açılışı.
- `stage502_9_back_in_courtyard.png`: Sınıftan avluya geri dönüş.
- `stage502_10_exit_gate_prompt.png`: Avluda güney dış kapı portalı ve "Kampüsten Çık" etkileşimi.
- `stage502_11_cycle_completed_at_gate.png`: Dış kapıdan çıkış sonrası giriş kapısı sahnesine döngüsel varış.

### Birim ve Entegrasyon Test Detayları:
  - **Aşama 5.0 & 5.0.2 Tek Girişli Yürünebilir Kampüs & Navigasyon Testleri (`campus.test.tsx` — 33 Test)**:
    1. Sinematik Taç Kapı Giriş Sahnesi: Aksaray Sultanhanı esinli görsel ve animasyonu atla düğmesi içerir
    2. Tek Giriş Akışı: İlk girişte Taç Kapı -> Karşılama/Sınıf Seçimi -> Yürünebilir Kampüs (çift giriş ve kuşbakışı harita butonları kaldırıldı)
    3. `/harita` adresi yönlendirme döngüsü veya 404 olmadan doğrudan anasayfaya (`/`) yönlendirir
    4. Öğrenme alanları ve gezinme bileşenlerindeki geri dönüş düğmeleri "Kampüs Avlusuna Dön" (`/`) hedefini korur
  - **Aşama 5.0 Ekran Üstü Kontroller ve Avlu Etkileşimi (`walkable.test.tsx` — 55 Test)**:
    53. Ekran üstü kontrollerde Sınıf Seçimi ve Ayarlar menüsü çalışır (2–7. sınıf geçişi, sesli anlatım açma/kapama), eski çift giriş butonları bulunmaz
    54. Yürünebilir kampüs avlusundaki 6 etkileşimli alanın (3 bina, pavyon, kiosk, şadırvan) yapılandırması eksiksizdir
    55. Sınıf içindeyken "Avluya Dön" hızlı çıkış düğmesi görünür ve tetiklenir
  - **Aşama 3, 4, 4.5 & 4.7 Yürünebilir Kampüs, Karakter ve Sınıf Görsel Dünya Testleri (52 Test)**:
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
    34. **Aşama 4: Kampüs avlusu zemin, Selçuklu yıldız meydanı, binalar ve peyzaj unsurları hatasiz çizilir**
    35. **Aşama 4: İngilizce sınıfı zemin, pencereler, akıllı tahta (kapalı, açılıyor, açık) ve sıralar hatasız çizilir**
    36. **Aşama 4: Karakterin görsel temas noktası AABB çarpışma kutusu sınırlarıyla (DEFAULT_HITBOX) uyumludur**
    37. **Aşama 4.2: Katmanlı zemin, Y-Sorting varlıklar ve ön plan saçağı hatasız çizilir**
    38. **Aşama 4.2: Y-Sorting derinlik sıralaması: Karakter kuzeydeyken varlığın arkasında, güneydeyken önünde çizilir**
    39. **Aşama 4.2: İngilizce Dünyası binası görsel varlık yüklendiğinde drawImage ile çizilir**
    40. **Aşama 4.2: İngilizce Dünyası binası AABB çarpışma sınırları ve kapı etkileşim koordinatı doğrulanır**
    41. **Aşama 4.3: Tüm bağımsız 2,5B avlu varlıkları (Keşif, Kütüphane, Şadırvan, Pano, Köşk, Ağaçlar) yüklendiğinde drawImage ile çizilir**
    42. **Aşama 4.3: Avlu binaları ve etkileşimli unsurların AABB çarpışma ve konum hizalaması korunur**
    43. **Aşama 4.4: Öğrenci karakteri görsel atlası (character_student_atlas.png) yüklendiğinde drawImage ile kırpılarak çizilir**
    44. **Aşama 4.4: Karakter yönleri (down, up, right, left) sprite atlasında doğru satır indeksleriyle (0, 1, 2, 3) eşleşir**
    45. **Aşama 4.4: Karakter yürüme animasyon döngüsü ve bekleme (idle) durumu sprite atlası karelerini doğru sırayla kullanır**
    46. **Aşama 4.5: Karakter ölçek seçenekleri tanımlıdır ve seçilen %15 ölçek (53x67 px) zemin hizasını (y + 18) korur**
    47. **Aşama 4.5: Çapraz yön hareketinde histerezis eşiği gereksiz satır titremesini (jitter) önler**
    48. **Aşama 4.5: Çok katmanlı temas ve yönlü sabah güneşi gölgeleri çizilir**
    49. **Aşama 4.7: Sınıf arka planı, kürsü, kitaplık ve sıralar bağımsız PNG varlıklarıyla drawImage ile çizilir**
    50. **Aşama 4.7: Sınıf içi Y-Sorting derinlik sıralaması: Karakter sıranın kuzeyindeyken arkasında, güneyindeyken önünde çizilir**
    51. **Aşama 4.7: Akıllı tahtanın 3 bağımsız ekran durumu (kapalı, açılıyor, aktif) ilgili ekran görsel varlığıyla çizilir**
    52. **Aşama 4.7: Tavandan sarkan Selçuklu pirinç fenerleri ve ışık huzmesi atmosferi (renderClassroomForeground) hatasız çizilir**
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
