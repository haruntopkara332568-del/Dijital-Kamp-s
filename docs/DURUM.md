# Proje Durum Raporu — Sürüm 6.5.2 (Aşama 6.5: Akıllı Tahta — Sultanhanı Kervansarayı Macerası / Görsel Akış ve Taş Eşik Düzeltmesi)

## 3. Sınıf Akıllı Tahta — Sultanhanı Kervansarayı 2.5D Sinematik Macerası (`feat/english-four-learning-tables`)
- **Kapsam İzolasyonu ve Dokunulmayan Sistemler**:
  - `main` dalı ve üretim ortamı, Selçuklu Taç Kapı, yürünebilir avlu mimarisi, karakter ve kamera kontrol altyapısı, İngilizce sınıfı mimarisi, 4 öğrenme masası (Keşfet, Öğren, Üret, Paylaş), Sınıf Panosu, diğer sınıf düzeyleri (2, 4, 5, 6, 7), veri modeli ve depolama anahtarları (`dek_campus_v1_state`) %100 korunmuştur.
- **1. Akıllı Tahta Etkileşimi ve Kilit Sistemi**:
  - Dört öğrenme masası (`kesfet`, `ogren`, `uret`, `paylas`) tamamlanmadan Büyük Görev kilitli kalır.
  - Kilitliyken tıklandığında veya yaklaşıldığında: `"Büyük Görev için önce sınıftaki dört masadaki (Keşfet, Öğren, Üret, Paylaş) görevleri tamamlamalısın."` uyarısı gösterilir.
  - Dört masa tamamlandığında: Akıllı tahta üzerinde davetkâr parıldayan dış ışık aurası (`#38bdf8` gölge ve altın çerçeve), "★ BÜYÜK GÖREV HAZIR ★" etiketi ve `Büyük Görev: Kervansaray Macerası [E]` istemi belirir.
  - Etkileşimde doğrudan Aksaray Sultanhanı Kervansarayı tam ekran sinematik öğrenme simülasyonu açılır.
- **2. Mekân, Karakterler ve Görsel Akış**:
  - **Meydanda Belirgin Yürüyüş ve Kapıda Duruş**: Deniz, Sultanhanı Kervansarayı önündeki taş meydanda belirgin yürüyüş adımlarıyla (bacak, kol, gölge döngüsü) taç kapıya yaklaşır. Kapının önünde durup tek başına gezen turist çocuk Leo'ya döner ve `"Hello!"` konuşması orada gerçekleşir.
  - **Kamera Takibi ve Aynı Taş Eşiğin Geçilişi**: Konuşma bittikten sonra kamera ikisini takip eder. Her iki çocuğun da ayaklarıyla aynı Selçuklu taş eşiğini geçtiği görülene kadar taç kapı kadrajda tutulur. Çocuklar eşiği geçtikten sonra kervansarayın revaklı iç avlusu gösterilir.
  - **Gece Vedası, Görünür El Sallama ve Ayrılış**: Avluda gece vedasında karşılıklı `"Good night!"` dedikten sonra elleri görünür biçimde sallanır (`deniz-wave-arm`, `leo-wave-arm`). İki çocuk adım atarak zıt yönlerden kadrajdan çıkar. Başarı ekranı ayrılış tamamlanınca açılır.
- **3. Pedagojik Konuşma Anları ve Doğal Süre**:
  - Öğrenci seçimleri yalnızca konuşma anlarında tutulmuş, aradaki yapay bekleme butonları kaldırılmıştır.
  - 1. Konuşma: Taç kapıda Leo `"Hello!"` der ➔ Öğrenci `"Hello!"` (veya cezasız ipuçlu `"Goodbye!"`) seçer.
  - 2. Konuşma: Avluda gece Leo `"Good night!"` der ➔ Öğrenci `"Good night!"` (veya cezasız ipuçlu `"Good morning!"`) seçer.
  - Hedef süre: Normal konuşma, dinleme ve seçimlerle doğal 2–2.5 dakikalık akış.
- **4. Web Speech API & Cezasız Hata Toleransı**:
  - Tüm İngilizce diyaloglar için doğal Web Speech API seslendirmesi, 🔊 Dinle (0.85x) ve 🐢 Yavaş Dinle (0.65x) seçenekleri.
  - Hatalı yanıtlarda puan kırma, can hakkı veya başarısızlık hissi yoktur; yumuşak Türkçe ipucu verilir ve öğrenci hemen doğru cevaba yönlendirilir.
- **5. Başarı Ekranı ve Sınıfa Dönüş**:
  - Ayrılış tamamlandıktan sonra açılan kesin kutlama başlığı: `"Tebrikler! Öğrendiğin İngilizce ifadeleri günlük yaşamda başarıyla kullandın."`
  - 🏆 Büyük Görev Başarı Rozeti ve 4 ifadenin özet mini kartları (Hello!, Good morning!, Goodbye!, Good night!).
  - **[Tekrar Oyna]** ve **[Sınıfa Dön]** aksiyonları.
  - Sınıfa dönüldüğünde öğrenci tahtanın hemen önünde (`x: 480, y: 180`) sınıfta kalır, 4 masanın tamamlanma durumu ve rozetleri eksiksiz korunur.
- **6. Kalite Güvencesi ve Doğrulama**:
  - `npm run typecheck`: 0 hata (strict TypeScript).
  - `npm run lint`: 0 hata, 0 uyarı.
  - `npm run test`: 107 / 107 test geçti (74 walkable + 33 campus).
  - Playwright E2E (`e2e/grade3_smartboard_adventure.spec.ts`): 4 / 4 test geçti (Chromium [26.4s] + Mobile Chrome [29.3s]).
  - Kesintisiz ekran kayıtları: `docs/assets/videos/grade3_smartboard_desktop_continuous.webm` (3.4 MB) ve `grade3_smartboard_mobile_continuous.webm` (3.7 MB).
  - `npm run build`: 889ms içinde hatasız üretim derlemesi üretildi.

# Proje Durum Raporu — Sürüm 6.3.1 (Aşama 6.3.1: 3. Sınıf Üret Masası Hata Düzeltmesi — Kelime Seçim ve İlerleme)

## 3. Sınıf Üret Masası — Kelime Seçim ve İlerleme Hata Düzeltmesi (`feat/english-four-learning-tables`)
- **Tespit Edilen Kök Neden ve Çözüm**:
  - **Sorun 1 (Yanlış Sıralamada Kilitlenme)**: `BUILD_TASKS` ilk görevinde kartlar `['morning', 'Good']` şeklinde sunulurken öğrenci yanlışlıkla `morning` ardından `Good` seçtiğinde seçimler ekranda kalıyor, 8 yaşındaki öğrenci geri almayı veya düzeltmeyi bilemediği için takılıyordu.
    - *Çözüm*: Yanlış sıralamada öğrenciye açık, anlaşılır bir uyarı ve pedagojik ipucu (`"Kelimelerin sırası karıştı. Bir daha deneyelim! İpucu: ...'Good' ile başlarız: 'Good morning!'"`) gösterilir, telaffuz yavaş çalışır; 1800ms sonra seçimler otomatik temizlenir ve öğrenci yeni bir kelime kartına bastığında hatalı seçim anında temizlenerek yeni seçimle başlanır.
  - **Sorun 2 (Yeniden Dene Düğmesi)**: Geri alma butonunun adı ve amacı çocuk dostu hale getirilerek belirgin bir `[Yeniden Dene]` butonu (`aria-label="Kelimeleri temizle"`) eklenmiş, hatalı durumda tek tıkla seçimi sıfırlama imkânı sağlanmıştır.
  - **Sorun 3 (Tek Kelimelik Görev Kilitlenmesi - Görev 3 & 4)**: Görev 3 (`Hello!`) ve Görev 4 (`Goodbye!`) tek kelimelik görevlerken öğrenci yanlış karta bastığında, ikinci bir karta basıldığında seçim uzunluğu 2 olup hedef uzunluk 1 ile uyuşmadığı için doğrulama tetiklenemiyordu.
    - *Çözüm*: `handleSelectWordA` içinde hata durumunda veya seçim sayısı ulaştığında yeni karta tıklama anında eski seçimi silip tek tıklamayla yeni seçimi doğrulamaktadır.
  - **Sorun 4 (Asenkron State ve Çift Tıklama Koruması)**: Geçiş sırasında `useRef` tabanlı senkron kilit (`isTaskLockedRef.current = true`) devreye sokulmuş, setTimeout React setState pure fonksiyonu dışına çıkarılarak temiz DOM döngüsü sağlanmıştır.
- **Kapsam İzolasyonu ve Dokunulmayan Sistemler**:
  - `main` dalı ve canlı sürüm, Selçuklu Taç Kapı, yürünebilir avlu mimarisi, İngilizce sınıfı mimarisi, akıllı tahta kilit ve senaryoları, Keşfet, Öğren ve Paylaş masaları, diğer sınıf düzeyleri (2, 4, 5, 6, 7), veri modelleri ve depolama anahtarları %100 korunmuştur.
- **Değiştirilen Dosyalar**:
  - `src/features/missions/Grade3UretStationView.tsx`: `handleSelectWordA`, `checkSelectionA`, `handleClearSelectionA`, `isTaskLockedRef`, `timerRef` ve remounting kart anahtarları.
  - `src/test/walkable.test.tsx`: Test 71 (Senaryo A, B, C tam kapsamlı doğrulama).
  - `e2e/grade3_uret_table.spec.ts`: Senaryo A, B, C, hızlı tıklama koruması, ara geçiş ve sınıfta kalma E2E testi.
- **Kalite Güvencesi ve Doğrulama**:
  - `npm run typecheck`: 0 hata (strict TypeScript).
  - `npm run lint`: 0 hata, 0 uyarı.
  - `npm run test`: 104 / 104 test geçti (71 walkable + 33 campus).
  - Playwright E2E (`e2e/grade3_uret_table.spec.ts`): 2 / 2 test geçti (Chromium [30.7s] + Mobile Chrome [30.5s]).
  - Regresyon E2E (`e2e/grade3_hello_garden.spec.ts`, `e2e/grade3_ogren_table.spec.ts`, `e2e/grade3_paylas_table.spec.ts`): 6 / 6 test geçti (1.5m).
  - `npm run build`: 853ms içinde hatasız üretim derlemesi üretildi.

# Proje Durum Raporu — Sürüm 6.4.0 (Aşama 6.4: 3. Sınıf Paylaş Masası — "Greetings / Birlikte Konuşalım" Karşılık Ver & Sen Başlat)

## 3. Sınıf Paylaş Masası — Karşılıklı Konuşma ve Konuşmayı Başlatma Etkinliği (`feat/english-four-learning-tables`)
- **Kapsam İzolasyonu ve Dokunulmayan Sistemler**:
  - `main` dalı ve üretim ortamı, Selçuklu Taç Kapı, yürünebilir avlu mimarisi, karakter ve kamera kontrol altyapısı, İngilizce sınıfı mimarisi, 4 masanın yerleşimi, Sınıf Panosu, onaylanan Aşama 6.1 Keşfet Masası, Aşama 6.2 Öğren Masası, Aşama 6.3 Üret Masası, Akıllı Tahta koruma sistemi, diğer sınıf düzeyleri (2, 4, 5, 6, 7), veri modeli ve depolama anahtarları (`dek_campus_v1_state`) %100 korunmuştur.
- **1. Pedagojik Öğrenme İçeriği (Yalnızca 4 Temel İfade)**:
  - **Hello!** (Merhaba!) — Karşılaşan ve el sallayarak selam veren çocuk illüstrasyonu.
  - **Good morning!** (Günaydın!) — Sabah güneşi ve uyanan çocuk illüstrasyonu.
  - **Goodbye!** (Hoşça kal!) — Ayrılan ve vedalaşan çocuk illüstrasyonu.
  - **Good night!** (İyi geceler!) — Gece, ay ve uykuya hazırlanan çocuk illüstrasyonu.
  - Yeni kelime listesi, gramer anlatımı veya yazılı sınav mantığı eklenmemiştir.
- **2. İki Aşamalı İletişimsel Öğrenme Akışı**:
  - **Etkinlik A — Arkadaşım Ne Söylüyor? / Karşılık Ver (4 Durum)**:
    - Durum 1: Sabah okul bahçesinde karşılaşma — Ali "Good morning!" diyor. Öğrenci "Good morning!" ile karşılık verir. (Yanlış seçenek: "Good night!").
    - Durum 2: Bahçede karşılaşma — Zeynep "Hello!" diyor. Öğrenci "Hello!" ile karşılık verir. (Yanlış seçenek: "Goodbye!").
    - Durum 3: Okul çıkışında vedalaşma — Emir "Goodbye!" diyor. Öğrenci "Goodbye!" ile karşılık verir. (Yanlış seçenek: "Hello!").
    - Durum 4: Gece uyku vakti — Annesi "Good night!" diyor. Öğrenci "Good night!" ile karşılık verir. (Yanlış seçenek: "Good morning!").
    - Karakter konuşma balonu ve çift hızlı [Dinle] (0.85x) / [Yavaş Dinle] (0.65x) desteği.
    - Yanlış cevapta cezasız pedagojik Türkçe ipucu ve anında yeniden deneme imkânı.
  - **Ara Geçiş Ekranı**: 1. Etkinlik bitiminde tebrik ve 2. etkinliğe geçiş butonu sunulur (`"Karşılıklı Konuşmaları Başarıyla Tamamladın! 💬 / 2. Etkinliğe Başla (Şimdi Sen Konuş!)"`).
  - **Etkinlik B — Şimdi Sen Konuş! / Sen Başlat (4 Tur)**:
    - Tur 1: Sabah güneşi altında arkadaşını gördün -> Öğrenci durumu değerlendirir ve konuşmayı "Good morning!" ile başlatır; arkadaşı sevinçle karşılık verir.
    - Tur 2: Bahçede oyun alanında arkadaşını gördün -> Öğrenci konuşmayı "Hello!" ile başlatır.
    - Tur 3: Dersler bitti, eve dönerken arkadaşına veda -> Öğrenci "Goodbye!" ile başlatır.
    - Tur 4: Gece uyku saati geldiğinde ailene iyi uykular dile -> Öğrenci "Good night!" ile başlatır.
    - İletişimsel bağlam odaklı, 2 net seçenek kartı ve her seçimde sesli geri bildirim.
- **3. Çocuk Dostu Pembe/Gül İstasyon Tasarımı & Telaffuz**:
  - Pembe / gül rengi (`rose-600` / `rose-100`) ve Selçuklu masif ahşap çerçeveli 4. istasyon teması (soru ve onay konuşma balonları motifleri).
  - Doğal Web Speech API (`en-US`/`en-GB`) telaffuz desteği.
  - Mikrofon, kamera veya klavye girişi zorunluluğu yoktur; çocuk dostu dokunmatik/tıklamalı seçenekler.
- **4. Dört İstasyonun Tamamlanması ve Sınıfta Kalma**:
  - Her iki etkinlik de tamamlandığında `dek_campus_v1_state` içinde öğrencinin ilerlemesi kalıcı olarak güncellenir:
    `completedStages: ['kesfet', 'ogren', 'uret', 'paylas']`, `completed: true`.
  - Başarı ekranında tam talimat metni yer alır: `"Harika! Dört öğrenme masasını da tamamladın. Artık Büyük Görev'e hazırsın! 🏆"`
  - 4 selamlaşma ifadesinin mini sözlük kartları ve rozeti sergilenir.
  - **Akıllı tahtaya otomatik ışınlanma YOKTUR.**
  - Aksiyonlar: **[Masadan Kalk / Sınıfa Dön]** ve **[Tekrar Oyna]**.
  - Masadan kalkıldığında öğrenci sınıfta, 4. Paylaş Masası'nın yanında (`desk-4`, `x: 665, y: 418`) kalır.
- **Kalite Güvencesi ve Doğrulama**:
  - `npm run typecheck`: 0 hata (strict TypeScript).
  - `npm run lint`: 0 hata, 0 uyarı.
  - `npm run test`: 103 / 103 test geçti (70 walkable + 33 campus).
  - Playwright E2E (`e2e/grade3_paylas_table.spec.ts`): 2 / 2 test geçti (Desktop Chromium [19.2s] ve Mobile Chrome [19.6s]).
  - Regresyon E2E (`grade3_hello_garden.spec.ts`, `grade3_ogren_table.spec.ts`, `grade3_uret_table.spec.ts`): 6 / 6 test geçti (1.5m).
  - `npm run build`: 1.00s içinde hatasız üretim derlemesi üretildi.

# Proje Durum Raporu — Sürüm 6.3.0 (Aşama 6.3: 3. Sınıf Üret Masası — "Greetings / Cümlemi Oluştur" Kelimeleri Birleştir & Doğru Cümleyi Bul)

## 3. Sınıf Üret Masası — Cümlemi Oluştur ve Doğru Cümleyi Bul Etkinliği (`feat/english-four-learning-tables`)
- **Kapsam İzolasyonu ve Dokunulmayan Sistemler**:
  - `main` dalı ve üretim ortamı, Selçuklu Taç Kapı, yürünebilir avlu mimarisi, karakter ve kamera kontrol altyapısı, İngilizce sınıfı mimarisi, 4 masanın yerleşimi, Sınıf Panosu, onaylanan Aşama 6.1 Keşfet Masası ve Aşama 6.2 Öğren Masası, Paylaş Masası, Akıllı Tahta koruma sistemi, diğer sınıf düzeyleri (2, 4, 5, 6, 7), veri modeli ve depolama anahtarları (`dek_campus_v1_state`) %100 korunmuştur.
- **1. Pedagojik Öğrenme İçeriği (Yalnızca 4 Temel İfade)**:
  - **Hello!** (Merhaba!) — Karşılaşan ve selam veren çocuk illüstrasyonu.
  - **Good morning!** (Günaydın!) — Sabah güneşi ve uyanan çocuk illüstrasyonu.
  - **Goodbye!** (Hoşça kal!) — Ayrılan ve vedalaşan çocuk illüstrasyonu.
  - **Good night!** (İyi geceler!) — Gece, ay ve uykuya hazırlanan çocuk illüstrasyonu.
  - Yeni ifade, yabancı gramer veya sınav mantığı eklenmemiştir.
- **2. İki Aşamalı Öğrenme ve Üretim Akışı**:
  - **Etkinlik A — Kelimeleri Birleştir / Cümlemi Oluştur (4 Görev)**: Öğrenci ekrandaki sevimli durum görselini inceler ve alttaki karışık kelime kartlarına dokunarak ifadeyi oluşturur (Örn: `[Good]` + `[morning]` -> `Good morning!`). Kartlara tıklandığında üst kutuya sırayla yerleşir, cümle bitiminde ünlem (!) otomatik eklenir. Geri al / temizle butonu cezasızdır. Yanlış sırada cezasız rehber ipucu verilir. Doğru oluşturulduğunda İngilizce seslendirme otomatik çalışır, yeşil ışıma ile onaylanır.
  - **Ara Geçiş Ekranı**: 1. Etkinlik bitiminde tebrik ve 2. etkinliğe geçiş butonu sunulur (`"Cümlelerini Başarıyla Oluşturdun! ✏️ / 2. Etkinliğe Başla"`).
  - **Etkinlik B — Görsele Uygun İfadeyi Seç / Doğru Cümleyi Bul (4 Tur)**: Ekranda durum görseli ve başlığı gösterilir. Öğrenci en fazla 2 büyük seçenek kartı arasından görsele uyan ifadeyi seçer. Yanlış seçimde pedagojik ipucu verilir ve ifade sesli hatırlatılır. Doğru seçimde onay ve sesli pekiştirme sağlanır.
- **3. Telaffuz ve Çocuk Dostu Yeşil İstasyon Tasarımı**:
  - Zümrüt yeşili / nane yeşili ve Selçuklu ahşap bordürlü masa kimliği (kalem ve defter motifleri).
  - Her aşamada [Dinle] (0.85x) ve [Yavaş Dinle] (0.65x) telaffuz butonları.
  - Web Speech API ile `en-US` / `en-GB` doğal telaffuz; yapay Türkçe okunuş kılavuzu eklenmemiştir.
  - Mikrofon veya ses kaydı izni istenmez.
- **4. İlerleme Kaydı ve Sınıfta Kalma**:
  - Her iki etkinlik tamamlandığında `uret` aşaması `dek_campus_v1_state` üzerine kalıcı olarak işlenir (`completedStages: ['kesfet', 'ogren', 'uret']`, `currentStage: 'paylas'`).
  - Tamamlama ekranında 4 ifadenin görsel mini sözlük kartları ve tebrik rozeti yer alır.
  - **"Paylaş Masasına Git" doğrudan ışınlanma butonu kaldırılmıştır.**
  - Tek aksiyon olarak **[Masadan Kalk / Sınıfa Dön]** butonu ve **[Tekrar Oyna]** seçeneği sunulur. Öğrenci masadan kalktığında sınıfta, 3. Üret Masası'nın yanında kalır.
- **Kalite Güvencesi ve Doğrulama**:
  - `npm run typecheck`: 0 hata.
  - `npm run lint`: 0 hata, 0 uyarı.
  - `npm run test`: 101 / 101 test geçti (68 walkable + 33 campus).
  - Playwright E2E (`e2e/grade3_uret_table.spec.ts`): 2 / 2 test geçti (Desktop Chromium ve Mobile Chrome dokunmatik).
  - `npm run build`: 1.16s içinde hatasız üretim derlemesi üretildi.

# Proje Durum Raporu — Sürüm 6.2.0 (Aşama 6.2: 3. Sınıf Öğren Masası — "Greetings / Dinle ve Anla" Dinle-Bul & Sesleri Ayırt Et)

## 3. Sınıf Öğren Masası — Dinle-Bul ve Sesleri Ayırt Et Etkinliği (`feat/english-four-learning-tables`)
- **Kapsam İzolasyonu ve Dokunulmayan Sistemler**:
  - `main` dalı ve üretim ortamı, Selçuklu Taç Kapı, yürünebilir avlu mimarisi, karakter ve kamera kontrol altyapısı, İngilizce sınıfı mimarisi, 4 masanın yerleşimi, Sınıf Panosu, onaylanan Aşama 6.1 Keşfet Masası, Üret ve Paylaş masaları, Akıllı Tahta koruma sistemi, diğer sınıf düzeyleri (2, 4, 5, 6, 7), veri modeli ve depolama anahtarları (`dek_campus_v1_state`) %100 korunmuştur.
- **1. Pedagojik Öğrenme İçeriği (Yalnızca 4 Temel İfade)**:
  - **Hello!** (Merhaba!)
  - **Good morning!** (Günaydın!)
  - **Goodbye!** (Hoşça kal!)
  - **Good night!** (İyi geceler!)
  - Yeni ifade, yabancı gramer veya sınav mantığı eklenmemiştir.
- **2. İki Aşamalı Öğrenme Akışı**:
  - **Etkinlik A — Dinle ve Bul (4 Tur)**: Öğrenci [Dinle] (0.85x) ve [Yavaş Dinle] (0.65x) düğmeleriyle ifadeyi dinler; 4 büyük çocuk dostu görsel arasından duyduğu ifadeye karşılık geleni seçer. Yanlış cevapta cezalandırmadan pedagojik ipucu (`"Tekrar dene! İpucu: Bu ifade..."`) gösterilir, sınırsız yeniden deneme hakkı tanınır; doğru cevapta yeşil onay rozetiyle tebrik edilir.
  - **Ara Geçiş Ekranı**: 1. Etkinlik bitiminde tebrik ve 2. etkinliğe geçiş butonu sunulur.
  - **Etkinlik B — Sesleri Ayırt Et (4 Tur)**: İngilizce ifade seslendirilir; öğrenci iki büyük yazılı seçenek kartı arasından duyduğunu seçer. Yanlış cevapta doğru ifade sesli ve görsel olarak hatırlatılır.
- **3. Telaffuz ve Çocuk Dostu Tasarım**:
  - Sarı / altın sarısı ve Selçuklu ahşap bordürlü masa kimliği (kulaklık ve tablet motifleri).
  - Web Speech API ile `en-US` / `en-GB` doğal telaffuz; Türkçe okunuş kılavuzu eklenmemiştir.
  - Mikrofon veya ses kaydı izni istenmez; ses desteği olmayan cihazlarda yazılı/görsel olarak %100 çalışır.
- **4. İlerleme Kaydı ve Sınıfta Kalma**:
  - Her iki etkinlik tamamlandığında `ogren` aşaması `dek_campus_v1_state` üzerine kalıcı olarak işlenir (`completedStages: ['kesfet', 'ogren']`, `currentStage: 'uret'`).
  - Tamamlama ekranında 4 ifadenin görsel mini sözlük kartları ve tebrik rozeti yer alır.
  - **"Üret Masasına Git" doğrudan ışınlanma butonu kaldırılmıştır.**
  - Tek aksiyon olarak **[Masadan Kalk / Sınıfa Dön]** butonu ve **[Tekrar Oyna]** seçeneği sunulur. Öğrenci masadan kalktığında sınıfta, 2. Öğren Masası'nın yanında kalır.
- **Kalite Güvencesi ve Doğrulama**:
  - `npm run typecheck`: 0 hata.
  - `npm run lint`: 0 hata, 0 uyarı.
  - `npm run test`: 99 / 99 test geçti (66 walkable + 33 campus).
  - Playwright E2E (`e2e/grade3_ogren_table.spec.ts` & `e2e/grade3_hello_garden.spec.ts`): 4 / 4 test geçti (Desktop Chromium ve Mobile Chrome dokunmatik).
  - `npm run build`: 855ms içinde hatasız üretim derlemesi üretildi.

# Proje Durum Raporu — Sürüm 6.1.0 (Aşama 6.1: 3. Sınıf Keşfet Masası — "Greetings / Selamlaşma" Görsel Destekli Öğrenme ve Eşleştirme)

## 3. Sınıf Keşfet Masası — Görsel Destekli Öğrenme ve Eşleştirme Etkinliği (`feat/english-four-learning-tables`)
- **Kapsam İzolasyonu ve Dokunulmayan Sistemler**:
  - `main` dalı, üretim ortamı, Selçuklu Taç Kapı, yürünebilir avlu mimarisi, karakter ve kamera kontrol altyapısı, İngilizce sınıfı mimarisi, 4 masanın yerleşimi, Sınıf Panosu, Akıllı Tahta kilidi ve koruma mantığı, diğer masalar (Öğren, Üret, Paylaş), diğer sınıf seviyeleri (2, 4, 5, 6, 7), veri modeli ve depolama anahtarları (`dek_campus_v1_state`) %100 korunmuştur.
- **1. Pedagojik Öğrenme İçeriği (Yalnızca 4 Temel İfade)**:
  - **Hello!** (Merhaba!): El sallayarak neşeyle selam veren çocuk illüstrasyonu.
  - **Good morning!** (Günaydın!): Sabah güneşi, pırıl pırıl gökyüzü ve güne başlayan çocuk illüstrasyonu.
  - **Goodbye!** (Hoşça kal!): Ayrılırken el sallayan çocuk illüstrasyonu.
  - **Good night!** (İyi geceler!): Gece göğü, hilal ay, yıldızlar ve uykuya hazırlanan sevimli çocuk illüstrasyonu.
  - Müfredat dışı hiçbir yabancı ifade veya karmaşık gramer kuralı eklenmemiştir.
- **2. İki Aşamalı Etkileşim Akışı**:
  - **Bölüm A — Keşfet & Dinle**: 4 büyük, canlı, çocuk dostu kart. Tıklandığında kart öne çıkar; İngilizce ifade, Türkçe anlam desteği ve iki ayrı seslendirme butonu (**[🔊 Dinle]** 0.85x ve **[🐢 Yavaş Dinle]** 0.65x) sunulur. 4 ifadenin tamamı dinlenip keşfedilmeden Bölüm B kilidi açılmaz (ilerleme göstergesi: `x / 4 Keşfedildi`).
  - **Bölüm B — Eşleştir**: 4 görsel kart solda, 4 karışık İngilizce ifade sağda yer alır. Sürükle-bırak zorunluluğu olmadan tıklayarak eşleştirme sağlanır. Doğru eşleşmede yeşil ışıma, başarı onayı ve kilitlenme; yanlış eşleşmede pedagojik ipucu (`"Bu görsel günaydın selamını anlatıyor..."`), Türkçe anlam hatırlatması ve anında cezasız yeniden deneme imkânı sunulur.
- **3. Tamamlama ve Sınıfta Kalma Bütünlüğü**:
  - Eşleştirmeler tamamlandığında tebrik rozeti ve 4 ifadenin mini sözlük özeti gösterilir.
  - Öğrencinin `kesfet` aşaması `dek_campus_v1_state` üzerine kalıcı olarak kaydedilir.
  - **"Öğren Masasına Git" doğrudan ışınlanma butonu kaldırılmıştır.**
  - Tek aksiyon olarak **[Masadan Kalk / Sınıfa Dön]** butonu sunulur. Öğrenci masadan kalktığında Keşfet Masası'nın yanında, sınıfta kalır; klavye ve dokunmatik hareket kontrolleri yeniden etkinleşir.
- **Kalite Güvencesi ve Doğrulama**:
  - `npm run typecheck`: 0 hata.
  - `npm run lint`: 0 hata, 0 uyarı.
  - `npm run test`: 97 / 97 birim testi geçti (64 walkable + 33 campus).
  - Playwright E2E (`e2e/grade3_hello_garden.spec.ts`): Hem Chromium (Masaüstü) hem Mobile Chrome (Dokunmatik) geçti (2 / 2).
  - `npm run build`: 1.19s içinde hatasız üretim derlemesi üretildi.

# Proje Durum Raporu — Sürüm 5.1.3 (Aşama 5.1.3: 3. Sınıf Keşfet Masası — Gerçek Sinematik 2.5D Canlı Bahçe Simülasyonu)

## 3. Sınıf Keşfet Masası — "Hello! Tanışma Bahçesi" Canlı Minyatür Simülasyonu (`feat/english-four-learning-tables`)
- **Kapsam İzolasyonu ve Değiştirilmeyen Sistemler**:
  - `main` dalı, üretim dağıtımı, Taç Kapı, avlu mimarisi, yürünebilir karakter ve kamera altyapısı, İngilizce sınıfı mimarisi, 4 masanın konumu ve isimleri, Sınıf Panosu, Akıllı Tahta açılış animasyonu ve koruma sistemi, Öğren/Üret/Paylaş masaları, diğer sınıf seviyeleri (2, 4, 5, 6, 7), veri modeli ve depolama anahtarları (`CampusStudentState`) %100 korunmuştur.
- **1. Gerçek Sinematik 2.5D Minyatür Bahçe Simülasyonu**:
  - Statik modal veya düz diyalog formu kaldırıldı. Masaya yaklaşıldığında kameranın sinematik biçimde masaya odaklandığı (`perspective-1200`, yumuşak ölçeklenme) canlı bir 2.5D minyatür bahçe sahnesi inşa edildi.
  - Sahnede masif ahşap masa çerçevesi, Selçuklu çini bordürü, kıvrımlı taş yürüyüş yolu (`stepping stones`), minyatür ahşap bahçe kapısı, servi ve zeytin ağaçları, çiçek tarhları ve doğrudan seçilebilir 3 çocuk karakter bulunmaktadır.
- **2. Yaşayan ve Canlı Tepki Veren Karakterler**:
  - Karakterler yalnızca sabit SVG çizimi değildir; öğrenci tıklayarak doğrudan konuşmak istediği karakteri seçebilir.
  - Karakter seçildiğinde öğrenciye döner, canlı el sallama/selamlama animasyonu sergiler ve konuşur.
  - Cevaplara göre karakterin duygu ve davranışı değişir (doğru cevapta neşeli tebrik/zıplama, yanlış cevapta baş eğme ve hafif şaşkınlık animasyonu).
- **3. Dört Pedagojik Etkileşim ve Hata Geri Bildirimi**:
  - **1. Selamlaşma (Ali)**: Ali kapı yanında karşılar: *"Hello!"*. Öğrenci selamlaşır (`"Hello!"` / `"Hi!"`). Yanlış cevapta (`"Goodbye!"`) görev ilerlemez, nazik geri bildirim verilir ve tekrar denetilir.
  - **2. Tanışma (Ece)**: Ece çiçeklerin yanında bekler. Öğrenci adını sorar (`"What's your name?"`). Ece *"My name is Ece."* der. Öğrenci hazır kâşif kimliğini tanıtır (`"My name is Deniz."`). Ece *"Nice to meet you!"* der.
  - **3. Yaş Sorma ve Sayı Etkileşimi (Can)**: Öğrenci Can'ın yaşını sorar (`"How old are you?"`). Can *"I'm nine."* der. Öğrenci bahçe zeminindeki interaktif ahşap tabelalardan 9 sayısını bularak tıklar. Yanlış sayıda (7, 8, 10) ipucu verilir; 9 seçildiğinde Can sevinçle kutlar.
  - **4. Vedalaşma (Tüm Arkadaşlar)**: Üç arkadaş bir araya gelir. Öğrenci *"Goodbye!"* der; üç karakter birden el sallayarak uğurlar.
- **4. Telaffuz ve Ses Kalitesi Düzenlemesi**:
  - Türkçe harflerle yazılmış uydurma fonetik kılavuzlar (`he-LO` vb.) tamamen kaldırıldı; doğru İngilizce yazım korundu.
  - **[🔊 Dinle]** (doğal hız: 0.85) ve **[🐢 Yavaş Dinle]** (kelime anlaşılırlığı: 0.65) butonları korundu.
  - `en-US` / `en-GB` sesleri önceliklendirildi. Konuşma sırasında balon turkuaz ışımayla vurgulanır. Ses kapatıldığında veya modal kapandığında ses durdurulur. Ses motoru olmasa dahi simülasyon %100 yazılı olarak çalışır.
- **5. Sınıfa Dönüş ve Masa İlerleme Kuralı**:
  - Dört etkileşim bitmeden ilerleme kaydedilmez; tamamlandığında `kesfet` aşaması kalıcı olarak kaydedilir.
  - **"Öğren Masasına Git" butonu kesinlikle kaldırılmıştır.** Öğrenci otomatik başka masaya ışınlanmaz.
  - "Masadan Kalk / Sınıfa Dön" butonuyla öğrenci Keşfet Masası'nın hemen yanında sınıfa döner; yürüyüş kontrolü yeniden etkinleşir ve öğrenci 2. Öğren Masası'na kendi karakterini yürüterek gider.
- **Kalite Güvencesi ve Doğrulama**:
  - `npm run typecheck`: 0 hata.
  - `npm run lint`: 0 hata, 0 uyarı.
  - `npm run test`: 97 / 97 birim testi geçti (64 walkable + 33 campus).
  - Playwright E2E (`e2e/grade3_hello_garden.spec.ts` & `e2e/stage51_tables.spec.ts`): Geçti. Hem Masaüstü (Chromium) hem Mobil (Mobile Chrome) kanıt ekran görüntüleri üretildi.
  - `npm run build`: Başarılı (1.37s).

# Proje Durum Raporu — Sürüm 5.1.2 (3. Sınıf Keşfet Masası: Sinematik "Hello! Tanışma Bahçesi" Görsel, Konuşma Dili ve Çift Hızlı Telaffuz İyileştirmesi)

## 3. Sınıf Keşfet Masası — "Hello! Tanışma Bahçesi" Kapsamlı Düzeltme (`feat/english-four-learning-tables`)
- **Kapsam ve İzolasyon Kuralı**:
  - Yalnızca 3. sınıf Keşfet Masası ("Hello! Tanışma Bahçesi") iyileştirildi.
  - `main` dalı, diğer sınıf düzeyleri (2, 4, 5, 6, 7), diğer masalar (Öğren, Üret, Paylaş), akıllı tahta koruması, avlu mimarisi, giriş kapısı, veri modeli ve `localStorage` / `IndexedDB` anahtarları kesinlikle değiştirilmedi.
- **1. Görsel Düzeltmeler (Sinematik 2.5D Sahne)**:
  - Basit modal görünümü bütünüyle kaldırıldı. Yerine 2.5D animasyon filmi estetiğinde, sıcak, çocuk dostu bir açık hava bahçe sahnesi entegre edildi.
  - Güneş ışıkları huzmesi (`sunGlow`), sabah gökyüzü degradeleri, uzakta Selçuklu sivri taş kemer silüeti, servi ve zeytin ağaçları, kıvrımlı taş yol ve renkli çiçek detayları eklendi.
  - Sahne üzerinde 3 karakter (Elif, Can, Sen) stilize ve canlı vektör çizimleriyle yerleştirildi; konuşan karaktere aktif dalga animasyonu ve odak vurgusu verildi.
- **2. Konuşma Dili Düzeltmeleri (3. Sınıf Seviyesine İndirgeme)**:
  - Karmaşık veya yetişkin üslubundaki ifadeler temizlendi; MEB 3. sınıf İngilizce müfredatına birebir uygun, 3 adımlı doğal tanışma akışı kurgulandı:
    - **1. Adım**: Elif karşılar: *"Hello!"* (he-LO) — Öğrenci seçenekleri: *"Hello!"* veya *"Good morning!"*.
    - **2. Adım**: Can adını sorar: *"What is your name?"* (UOT iz yor NEYM) — Öğrenci seçenekleri: *"I am Deniz."*, *"I am a student."*, *"I am an Explorer."*.
    - **3. Adım**: Elif & Can memnun olur: *"Nice to meet you."* (NAYS tu MİT yu) — Öğrenci seçenekleri: *"Nice to meet you."*, *"Let's explore!"*.
    - **Tamamlama Ekranı**: Sade özet kartı (`Hello!`, `What is your name?`, `Nice to meet you.`), *"Öğren Masasına Git (2. Masa)"* ve *"Masadan Kalk / Sınıfa Dön"* butonları. Öğrenci masadan kalktığında sınıfta masanın yanında kalır.
- **3. Telaffuz Ayarları ve Çift Hızlı Dinleme Desteği**:
  - Web Speech API tabanlı iki ayrı dinleme butonu konuşma balonuna yerleştirildi:
    - **[🔊 Dinle]**: 3. sınıf çocuk pedagojisine uygun `rate: 0.82`, `pitch: 1.06` doğal konuşma hızı.
    - **[🐢 Yavaş Dinle]**: Hece vurgularını kaçırmayan, net ve yavaş `rate: 0.62`, `pitch: 1.0` çalışma hızı.
  - Ses çalarken konuşma balonuna turkuaz ışıma ve aktif durum halkası (`isCurrentSentenceSpeaking`) eklendi.
  - Karmaşık IPA alfabeleri yerine 3. sınıf öğrencisinin rahat okuyacağı sade heceleme kılavuzu eklendi (`he-LO`, `UOT iz yor NEYM`, `NAYS tu MİT yu`).
- **Kalite Güvencesi ve Doğrulama**:
  - `npm run typecheck`: 0 hata.
  - `npm run lint`: 0 hata, 0 uyarı.
  - `npm run test`: 97 / 97 birim testi geçti (64 walkable + 33 campus).
  - `npm run build`: Başarılı (1.49s).
  - Playwright E2E (`e2e/grade3_hello_garden.spec.ts`): Chromium ve Mobile-Chrome başarıyla geçti (18.2s).

# Proje Durum Raporu — Sürüm 5.1.1 (3. Sınıf Keşfet Masası: "Hello! Tanışma Bahçesi" Prototipi)

## 3. Sınıf Keşfet Masası — "Hello! Tanışma Bahçesi" Prototipi (`feat/english-four-learning-tables`)
- **Kapsam İzolasyonu**: Yalnızca 3. sınıf Keşfet Masası için sinematik "Hello! Tanışma Bahçesi" prototipi geliştirildi. Diğer sınıflar (2, 4, 5, 6, 7), diğer masalar (Öğren, Üret, Paylaş), akıllı tahta, mimari, karakter hareketleri ve depolama kayıt sistemi (`CampusStudentState`) kesinlikle değiştirilmedi.
- **Karakter ve Sahne Kuralı**:
  - En fazla 3 karakter yer alır: **Elif** (Akran öğrenci), **Can** (Meraklı kampüs arkadaşı) ve **Sen** (Öğrenci / Kâşif).
  - Görsel olarak Selçuklu kemer silüeti, servi ağaçları ve güneşli kampüs avlu bahçesi atmosferi sunulur.
- **Diyalog ve Bilgi Yükü İlkesi**:
  - Bilgi yığını oluşturulmadan, 3. sınıf düzeyine tam uygun (en çok 10 kelimelik kısa cümleler, TDK onaylı Türkçe ipuçları, Web Speech API sesli dinleme desteği):
    - **1. Adım**: Elif karşılar: *"Hello! Welcome to our garden."* -> 2 sade seçenek (`Hello! I am glad to be here.` / `Good morning!`).
    - **2. Adım**: Can adını sorar: *"What is your name?"* -> 3 hazır seçenek (`I am Deniz.` / `I am a student.` / `I am an Explorer.`) — *kişisel veri istenmez*.
    - **3. Adım**: Elif & Can ortak neşeyle yanıtlar: *"Nice to meet you! Let's explore together."* -> 2 sade seçenek (`Nice to meet you too!` / `Thank you! Let's explore!`).
  - **Tamamlama Ekranı**:
    - Öğrenilen üç temel kalıp (`Hello!`, `What is your name?`, `Nice to meet you!`) kısa özet kartında pekiştirilir.
    - `kesfet` aşaması mevcut kayıt API'si üzerinden tamamlandı olarak kaydedilir.
    - Düğmeler: *"Öğren Masasına Git (2. Masa)"* veya *"Masadan Kalk / Sınıfa Dön"*.
    - Masadan kalkıldığında öğrenci doğrudan sınıfta, masanın yanında kalır.
- **Kalite Güvencesi ve Doğrulama**:
  - `npm run typecheck`: 0 hata.
  - `npm run lint`: 0 hata, 0 uyarı.
  - `npm run test`: 97 / 97 birim testi geçti (64 walkable + 33 campus).
  - `npm run build`: Başarılı (1.10s).
  - Playwright E2E (`e2e/grade3_hello_garden.spec.ts` & `e2e/stage51_tables.spec.ts`): 4 / 4 test geçti.

# Proje Durum Raporu — Sürüm 5.1.0 (Aşama 5.1: İngilizce Sınıfında Dört Etkileşimli Masa ve Akıllı Tahta Koruması)

## Aşama 5.1 — İngilizce Sınıfında Dört Etkileşimli Masa (`feat/english-four-learning-tables`)
- **1. Dört Etkileşimli Masaya Taşınan Öğrenme İstasyonları**:
  - Mevcut "Kapıların Anlattığı Hikâye" 4 aşamalı öğrenme akışı, sınıftaki dört fiziksel öğrenci masasına taşındı:
    1. **1. KEŞFET MASASI (Sol Ön / Kuzeybatı)**: Görevin "Keşfet" aşaması (`table-kesfet`).
    2. **2. ÖĞREN MASASI (Sağ Ön / Kuzeydoğu)**: Görevin "Öğren" aşaması (`table-ogren`).
    3. **3. ÜRET MASASI (Sol Arka / Güneybatı)**: Görevin "Üret" aşaması (`table-uret`).
    4. **4. PAYLAŞ MASASI (Sağ Arka / Güneydoğu)**: Görevin "Paylaş" aşaması (`table-paylas`).
  - Görev içerikleri, diyaloglar, sınıf düzeyine göre farklılaşan kelime/görev yapıları (`gradeProfiles.ts`) ve depolama mekanizması (`dek_campus_v1_state`) %100 korundu; yeni içerik veya gereksiz bağımlılık eklenmedi.
- **2. Masa Tasarımı ve Selçuklu Levhaları**:
  - Mevcut dört masanın konumu, boyutları (150x55) ve sinematik 3B sprite görünümleri korundu.
  - Masaların üzerine Selçuklu mimarisine uygun masif sedir ağacı kaide, sivri kemerli mukarnas formu, turkuaz çini bordürü (`#0e768a`) ve altın varak süslemeli okunaklı isim levhaları (`drawTablePlaque`) işlendi:
    `1. KEŞFET MASASI`, `2. ÖĞREN MASASI`, `3. ÜRET MASASI`, `4. PAYLAŞ MASASI`.
  - Masalara yaklaşıldığında aşama durumuna göre dinamik etkileşim ipucu açılır: `Keşfet Masası'na Otur [E]`.
- **3. Sıralı İlerleme ve Sınıf Seçimi Koruması (Gating)**:
  - Henüz sınıf seçilmemişse masalara yaklaşıldığında etkileşim ipucu `Önce Sınıfını Seç` olarak görünür; etkileşime girildiğinde `Önce Sınıf Seçim Panosu'ndan sınıfını seç.` uyarısı verilir.
  - Önceki aşamalar tamamlanmadan sonraki masaya oturulamaz:
    - Keşfet tamamlanmadan Öğren masasına gidildiğinde: `Önce Keşfet Masası'ndaki etkinliği tamamlamalısın.`
    - Öğren tamamlanmadan Üret masasına gidildiğinde: `Önce Öğren Masası'ndaki etkinliği tamamlamalısın.`
    - Üret tamamlanmadan Paylaş masasına gidildiğinde: `Önce Üret Masası'ndaki etkinliği tamamlamalısın.`
- **4. İstasyon Modalı (`TableStationModal`) ve Sınıfa Dönüş**:
  - Her masa yalnızca kendisine ait aşamayı izole biçimde açar (`TableStationModal`).
  - Masadan kalkıldığında (Escape tuşu veya "Masadan Kalk / Sınıfa Dön" düğmesi) öğrenci doğrudan sınıfta, masanın hemen yanında kalır.
  - Aşama tamamlandığında sonraki masaya yönlendiren butonlar yer alır: `Keşfet Adımını Tamamla (Öğren Masasına Git)`.
- **5. Akıllı Tahta Koruması**:
  - Akıllı tahtanın görsel tasarımı, konumu ve 600ms açılış ışığı/güç animasyonu eksiksiz korundu.
  - Akıllı tahtaya etkileşime girildiğinde eski görev akışı açılmaz; etkinliklerin 4 masaya taşındığı ve tahtanın yakında gerçek yaşam uygulama alanı olarak açılacağı rehber mesajı gösterilir:
    `Öğrenme etkinlikleri sınıftaki dört masaya (Keşfet, Öğren, Üret, Paylaş) taşınmıştır. Akıllı tahta yakında gerçek yaşam uygulama alanı olarak açılacaktır.`
  - `SmartBoardModal` teknik kodu korunmuştur.
- **6. Kalite Güvencesi ve Doğrulama**:
  - `npm run typecheck`: 0 hata.
  - `npm run lint`: 0 hata, 0 uyarı.
  - `npm run test`: 94 / 94 test başarıyla geçti (`walkable.test.tsx` [61 test] + `campus.test.tsx` [33 test]).
  - `npm run build`: Başarılı (902ms).
  - Playwright E2E (`e2e/stage51_tables.spec.ts`): Chromium ve Mobile-Chrome tam döngüyü doğruladı (8 adet kanıt ekran görüntüsü `docs/assets/stage51_*.png`).

# Proje Durum Raporu — Sürüm 5.0.4 (Tek Görevli Düzeltme: Sınıf Seçim Panosu, Akıllı Tahta Kilidi ve Dış Kapı Çıkış Döngüsü)

## Tek Görevli Düzeltme — Sınıf Seçim Panosu, Akıllı Tahta Kilidi ve Dış Kapı Çıkışı (`feat/single-entry-walkable-campus`)
- **1. Sınıf Seçimi — Yalnızca İngilizce Sınıfının İçinde**:
  - Sınıf seçimi avludan ve avlu ekran üstü kontrollerinden tamamen kaldırıldı. Avlu kontrollerinde sınıf seçici ve ayar butonu yer almaz; avlu bütünüyle serbest keşfe odaklıdır.
  - Sınıf seçimi yalnızca İngilizce Dünyası sınıfının içine taşındı: Akıllı tahtanın sol tarafına Selçuklu mimarisine uygun taş ve ahşap dokulu, sivri kemerli mukarnas taçlı, turkuaz bordürlü ve pirinç levhalı "Sınıf Seçim Panosu" (`drawClassroomGradeBoard`) yerleştirildi.
  - Panonun yanına gelindiğinde `Sınıfını Seç / Değiştir` etkileşim ipucu açılır.
  - Etkileşime girildiğinde Selçuklu mimari ahşap/taş dokulu `GradeBoardModal` modal penceresi açılır. Modal yalnızca 2., 3., 4. (İlkokul) ve 5., 6., 7. (Ortaokul) sınıf seviyelerini listeler.
  - Seçilen sınıf durumu (`CampusStudentState.selectedGrade`) kalıcı olarak güncellenir ve öğrenci istediğinde panoya dönerek sınıfını değiştirebilir.
  - **Akıllı Tahta Kilidi**: Akıllı tahtanın yanına gidildiğinde, henüz sınıf seçilmediyse etkileşim ipucu `Önce Sınıfını Seç` olarak görünür; tıklandığında veya boşluk/E tuşuna basıldığında `Önce sınıfını seç.` uyarısı verilir ve tahta açılmaz. Sınıf seçildikten sonra akıllı tahta (`Akıllı Tahtayı Aç`) normal şekilde açılır ve etkinlikler başlar.
- **2. Dış Kapıya Çıkış — Avluda**:
  - Avludan güneye (giriş kapısına doğru) uzanan taş yol ve Selçuklu dış kapı portali (`drawSouthEntrancePortal`) görünür ve mimari olarak inşa edildi.
  - Öğrenci avludayken güneye yürüdüğünde portal eşiğinde `Kampüsten Çık` etkileşim ipucu açılır.
  - Etkileşim tetiklendiğinde öğrenci ilk giriş kapısı sahnesine (`CampusGateView`) döner.
  - Akış döngüsel ve kesintisiz çalışır: **Giriş Kapısı -> Avlu -> İngilizce Sınıfı -> Avlu -> Dış Kapı -> Giriş Kapısı**.
  - Tarayıcıdan çıkılmaz, beyaz ekran oluşmaz, yönlendirme bozulmaz.
- **Kalite Güvencesi ve Doğrulama**:
  - `npm run typecheck`: 0 hata.
  - `npm run lint`: 0 hata, 0 uyarı.
  - `npm run test`: 90 / 90 test başarıyla geçti (`walkable.test.tsx` [57 test], `campus.test.tsx` [33 test]).
  - `npm run build`: Başarılı (886ms).
  - Playwright E2E (`e2e/stage502_verify.spec.ts`): Chromium ve Mobile-Chrome testleri tam döngüyü doğruladı (11 adet kanıt ekran görüntüsü `docs/assets/` altında saklandı).

## Tek Görevli Düzeltme — Giriş Sonrası Doğrudan Yürünebilir Sinematik Avlu (`feat/single-entry-walkable-campus`)
- **Doğrudan Avlu Geçişi ve Rehbersiz/Modalsız Giriş**:
  - Giriş kapısında "Kapıyı Aç ve İçeri Gir" tıklandığında öğrenci hiçbir modal, rehber karakter, rehberli tur veya ara seçim ekranı ile karşılaşmadan **doğrudan yürünebilir sinematik avluya** geçiş yapar.
  - Avluda yürüyen karakter öğrenci karakteridir; rehber karakter veya yönlendirici diyaloglar giriş akışından tamamen arındırılmıştır.
  - Sınıf seçimi varsayılan (5. sınıf) olarak ayarlanmış olup öğrenci dilediğinde ekran üzeri ayar düğmesinden değiştirebilir.
- **Tek Aktif Sınıf İlkesi**:
  - Bu aşamada yalnızca **İngilizce Dünyası** sınıfı aktiftir (kapı hizasına gelindiğinde "İngilizce Sınıfına Gir" etkileşimi açılır ve yürünebilir sinematik sınıfa geçilir).
  - Diğer binalar (Gezi ve Keşif, Kitap Dünyası, Kampüs Yolculuğum, Görev Panosu) görsel olarak avluda korunmuş olup yaklaşıldığında "Yakında Açılacak" geri bildirimi sunar.
- **Çevresel Yönlendirme (Environmental Orientation)**:
  - **Mimari Bina Tabelaları ve Durum Rozetleri**: İngilizce Dünyası üzerinde yeşil parıltılı `İNGİLİZCE DÜNYASI [● AÇIK]` tabelası; diğer binalar üzerinde `[YAKINDA]` rozetli Selçuklu mimari tabelaları konumlandırıldı.
  - **Merkez Meydan Yönlendirici Totemi**: Sekiz köşeli yıldız meydanının doğu kenarında sedir ağacından oyma, Selçuklu pirinç alemli yön levhası yerleştirildi. İngilizce Dünyası'na giden yönü (`➜ İngilizce Dünyası [AÇIK]`) canlı parıltıyla vurgularken, diğer kolları (`⇦ Gezi ve Keşif [YAKINDA]`, `⇧ Kitap Dünyası [YAKINDA]`) net biçimde gösterir.
  - **Zemin Mozaik Kakma Okları**: Merkez meydandan İngilizce Dünyası'na uzanan taş yolda turkuaz çinili ve altın kakmalı yönlendirici ok motifleri zemin döşemesine işlendi.
- **Doğal Çevre ve Zenginleştirilmiş Ağaç Atmosferi**:
  - Giriş kapısı portalından görünen ağaç atmosferi avlunun kuzey sur duvarı ardına ufuk ağaç kuşağı olarak yansıtıldı (`drawPerimeterBackdropTrees`).
  - Avlu içerisine köşe, yan bahçe ve giriş aksı servi ve gölgeli ağaçları eklenerek Y-sorting derinlik sıralamasına bağlandı.
  - Yürüme yollarının kenarlarına kumtaşı bordürlü ve dokulu yeşil çim parterler (`drawCourtyardGrassParterres`) entegre edildi.
- **Kalite Güvencesi ve Doğrulama**:
  - `npm run typecheck`: 0 hata.
  - `npm run lint`: 0 hata, 0 uyarı.
  - `npm run test`: 88 / 88 test başarıyla geçti.
  - `npm run build`: Başarılı (1.15s).
  - Playwright E2E (`e2e/stage502_verify.spec.ts`): Chromium ve Mobile-Chrome testleri 0 modal ve 0 rehber ile doğrudan yürünebilir avlu açılışını doğruladı (`stage502_direct_walkable_courtyard.png`, `stage502_courtyard_freewalk_verified.png`).

## Aşama 5.0.2 — Giriş Sonrası Yanlış Ekran Hatasının Kesin Çözümü (`feat/single-entry-walkable-campus`)
- **Hata Teşhisi ve Kesin Çözümü**:
  - Giriş kapısında "Kapıyı Aç ve İçeri Gir" tıklandığında, `CampusPages.tsx` içindeki ara yönlendirme (`!hasCompletedOnboarding`) nedeniyle eski SVG sahnesini barındıran `CourtyardWelcomeView` bağımsız bir sayfa olarak açılıyor ve içindeki `CourtyardSceneSvg` eski şematik haritayı çiziyordu.
  - `CourtyardSceneSvg` aktif giriş akışından ve `CourtyardWelcomeView` içinden tamamen çıkarıldı.
  - `CampusPages.tsx` içerisindeki ara sayfa katmanı kaldırıldı; kapı aralandığı andan itibaren **doğrudan onaylı sinematik `WalkableCampusView` avlusunun açılması** sağlandı: **GİRİŞ KAPISI → SİNEMATİK YÜRÜNEBİLİR AVLU → KARŞILAMA VE SINIF SEÇİMİ → SERBEST YÜRÜYÜŞ**.
  - Karşılama, akran rehber diyalog kartı ve sınıf seçimi adımları gerçek sinematik avlu üzerinde hafif yarı saydam (`bg-black/30 backdrop-blur-[2px]`) bir modal pencere olarak sunuldu.
  - Karşılama ve sınıf seçimi tamamlanana kadar öğrenci hareketi (`engine.setInputDisabled(true)`) ve bina etkileşimleri güvenle devre dışı bırakıldı; arka planda 60fps render döngüsü çalışarak sinematik avlunun tüm bağımsız 2,5B varlıklarıyla yüklenmesi sağlandı.
  - Sınıf seçimi tamamlandığında panel kapandı, hareket serbest bırakıldı (`engine.setInputDisabled(false)`) ve öğrenci aynı avluda kesintisiz yürümeye başladı.
- **Görsel Doğrulama ve Ekran Görüntüleri (`docs/assets/`)**:
  - `stage502_gate_screen.png`: Sinematik Selçuklu Taç Kapı.
  - `stage502_desktop_welcome_overlay.png` ve `stage502_mobile_welcome_overlay.png`: Sinematik avlu üzerinde karşılama modalı (arka planda Selçuklu binaları ve avlu görünür).
  - `stage502_desktop_free_walk.png` ve `stage502_mobile_free_walk.png`: Karşılama sonrası serbest yürüyüş görünümü (Selçuklu yıldız havuzu, binalar, pavyon, kiosk, karakter).

## Aşama 5.0 — Tek Girişli Yürünebilir Kampüs Deneyimi (`feat/single-entry-walkable-campus`)
- **Giriş ve Navigasyon Sadeleştirmesi (Tek Giriş Akışı)**:
  - Eski iki başlı gezinme yöntemi (kuşbakışı SVG harita `/harita` ve doğrudan sınıf kısayolları) kaldırılarak öğrencinin kampüse giriş ve öğrenme alanlarına erişim yöntemi tek ve bütünleşik yürünebilir kampüs deneyimine dönüştürüldü.
  - Doğrusal ve kesintisiz akış: **GİRİŞ KAPISI → KARŞILAMA → SINIF SEÇİMİ → YÜRÜNEBİLİR KAMPÜS → BİNA GİRİŞİ → ÖĞRENME ETKİNLİĞİ**.
  - Eski `/harita` rotası doğrudan anasayfaya (`/`) yönlendirildi (`<Navigate to="/" replace />`); 404 hatası ve yönlendirme döngüleri engellendi.
- **Sinematik 3D Selçuklu Taç Kapı Görseli (`CampusGateView`)**:
  - Aksaray Sultanhanı Kervansarayı monumental taç kapısı ve onaylı kampüs avlusu estetiğine uygun sinematik 3D görsel varlık üretildi ve entegre edildi (`public/assets/entrance/campus_portal_gate.jpg` ve `docs/assets/campus_portal_gate_concept.jpg`).
  - Mukarnas, taş oyma kabartma ve geometrik rozet detaylarıyla donatılmış taç kapı aralanarak güneş ışığı huzmeleriyle kampüs avlusuna adım atma animasyonu sağlandı.
  - "Kapıyı Aç ve İçeri Gir", "Animasyonu Atla", `prefers-reduced-motion` desteği, odaklanabilir klavye kontrolleri ve sıfır kişisel veri gizlilik güvencesi korundu.
- **Bütünleşik Avlu Etkileşimi (3 Öğrenme Alanı + 2 Yardımcı İşlev + Şadırvan)**:
  - Kampüs avlusundaki tüm mimari öğeler yürünebilir ve etkileşimli hale getirildi:
    1. **İngilizce Dünyası**: Kapı etkileşimi yürünebilir sınıfa (`classroom`) geçiş yapar; akıllı tahta üzerinden "Kapıların Anlattığı Hikâye" görevine bağlanır.
    2. **Gezi ve Keşif**: Kapı etkileşimi `/alan/gezi-ve-kesif` sayfasına yönlendirir; Aksaray Kültürel Miras Rotası ve Kapıların Hikâyesi keşfedilir.
    3. **Kitap ve Hikâye Dünyası**: Kapı etkileşimi `/alan/kitap-ve-hikaye-dunyasi` sayfasına yönlendirir.
    4. **Kampüs Yolculuğum (Güneybatı Köşk)**: Etkileşim `/yolculugum` sayfasına yönlendirir; öğrencinin görev ilerlemesi ve çizimleri listelenir.
    5. **Keşif Görevleri Panosu (Güneydoğu Kiosk)**: Etkileşim `/alan/gorev-panosu` sayfasına yönlendirir.
    6. **Selçuklu Yıldız Havuzu (Şadırvan)**: Etkileşim alanında dinlenme ve bilgilendirici akran rehber diyalog kartı açılır.
- **Konum Sürekliliği (Spatial Persistence)**:
  - Öğrenci bir binaya girdiğinde veya bir öğrenme alanına yöneldiğinde avludaki son koordinatı saklanır. Geri dönüş bağlantısına ("Kampüs Avlusuna Dön") tıklandığında öğrenci doğrudan ayrıldığı binanın kapı hizasında yeniden konumlanır.
- **Kampüs İçi Sınıf Değiştirme ve Ayarlar Paneli**:
  - `WalkableControlsOverlay` içinden "Doğrudan Sınıfa Gir" ve "Kuşbakışı Harita" butonları tamamen kaldırıldı.
  - Yerine kampüsten çıkmadan sınıf seviyesini (2., 3., 4., 5., 6., 7. sınıf) değiştirebilen, seslendirmeyi açıp kapatabilen ve taç kapıyı yeniden izletebilen `SlidersHorizontal` ayarlar paneli eklendi.
  - Işınlanma yapmayan bilgilendirici "Kampüs Rehberi" pusula kartı eklendi.
  - Sınıf içindeyken tek tıkla avluya dönmeyi sağlayan "Avluya Dön" hızlı çıkış butonu eklendi.
- **Geri Dönüş Bağlantılarının Sadeleştirilmesi**:
  - `LearningAreaView`, `MissionRunnerView`, `JourneyView` ve `CampusTopBar` bileşenlerindeki eski `/harita` bağlantıları `/` ("Kampüs Avlusu") olarak güncellendi.
- **Kalite Güvencesi ve Doğrulama**:
  - `npm run typecheck` (0 hata), `npm run lint` (0 hata, 0 uyarı), `npm run test` (88 / 88 test geçti), `npm run build` (başarılı).

## Tamamlanan Bölümler (Geçmiş Aşamalar)
- **Mimari Dönüşüm (Vite + React + TypeScript + Tailwind CSS v4 + React Router)**:
  - Next.js 15 App Router altyapısı kaldırıldı; Vite 8 (`@vitejs/plugin-react`), `@tailwindcss/vite` v4 ve `react-router` (`createBrowserRouter`) tabanlı tek sayfalık (SPA) yapıya geçildi.
  - `@google/genai` ve kullanılmayan şablon bağımlılıkları kaldırıldı; temiz `package.json` ve `package-lock.json` oluşturuldu.
  - Herkese açık dizindeki ham prompt dosyası dağıtım kapsamından çıkarıldı.
- **Kampüs Giriş Kapısı**: Hafif izometrik derinliğe sahip Anadolu-Selçuklu taç kapısı (`CampusPortalGateSvg`), sağ yan gölge duvarı, ön meydan zemini, basamaklar, alçak taş duvarlar, ağaçlar, çok katmanlı açılış animasyonu, "Animasyonu Atla" düğmesi, `prefers-reduced-motion` desteği ve sonraki ziyaretlerde doğrudan haritaya geçiş uygulandı.
- **2,5B İzometrik Karşılama Avlusu ve Akran Rehber**: Ortak izometrik zemin/sekiz köşeli yıldız meydan (`IsometricGroundSvg`), taş döşeli yol bantları (`IsometricPathSvg`), gölgeli peyzaj ağaçları ve yön levhası (`LandscapeElementsSvg`), büyütülmüş 2,5B yapılar (`CourtyardSceneSvg`), hem sahne içi figür hem de kemer madalyonlu portre sunan akran rehber (`PeerGuideSvg`), taş-krem diyalog kartı (`GuideDialogueCard`), onaylı karşılama metni (`APPROVED_WELCOME_TEXT`), `"Birlikte gezelim"` / `"Kendim keşfedeceğim"` tercihleri, `2–7. sınıf` seçimi ve rehberli tanıtım turu uygulandı.
- **Görsel Kimlik ve Renk Sistemi (`src/styles/globals.css`)**: Taş beji, krem, turkuaz, lacivert, toprak tonları, yumuşak adaçayı yeşili ve sol-üst ışık / sağ-alt gölge belirteçleri yalnızca merkezi tasarım belirteçleri üzerinden uygulandı; özgün SVG bileşenlerinde sabit renk kodu kullanılmadı.
- **Veri Temelli Sınıf Profilleri (`src/data/gradeProfiles.ts`)**: 2–7. sınıfların tüm tasarım parametreleri tek merkezde korundu.
- **Etkileşimli 2,5B Kampüs Haritası ve Öğrenme Alanları**: Aynı mimari aileye ait ama silüet, cephe ve çatı karakteriyle birbirinden ayrışan 2,5B binalar (`CampusBuildingSvg`), tıklanabilir bina kabuğu (`BuildingInteractiveShell`), kompakt mimari tabelalar (`CampusLabelTag`) ve normal/hover/seçili/yakında durumlarıyla 3 öğrenme alanı (`Gezi ve Keşif`, `İngilizce Dünyası`, `Kitap ve Hikâye Dünyası`) ile 2 yardımcı işlev (`Keşif Görevleri Panosu`, `Kampüs Yolculuğum`) sunuldu.
- **İlk Bütünleşik Görev — "Kapıların Anlattığı Hikâye"**:
  - `KEŞFET → ÖĞREN → ÜRET → PAYLAŞ` aşamalarıyla İlkokul (2–4) ve Ortaokul (5–7) düzeyleri, Çizim Stüdyosu, tarayıcı seslendirme (`speech.ts`) ve tek PNG dışa aktarma (`pngExport.ts`) korundu.
- **Depolama ve Veri Güvenliği**: `localStorage` (`dek_campus_v1_state`, `schemaVersion: 1`), `IndexedDB` (`dek_campus_db`), bellek yedeği ve iki adımlı `"Verilerimi Sil"` penceresi korundu. Kayıtlar tarayıcı Eş Kaynak Politikası gereği alan adına bağlıdır; alan adı değiştiğinde otomatik taşınmaz (`docs/MIMARI.md` içinde belgelendi).

## Aşama 4.7 — Sinematik Sınıf Entegrasyonu (`feat/campus-visual-upgrade`)
- **Bağımsız 2,5B Görsel Varlık Mimarisi**:
  - Onaylanan İngilizce Dünyası sınıf konsept sanatı (`docs/assets/digital_campus_english_classroom_concept.png`) referans alınarak prosedürel düz Canvas çiziminden katmanlı, bağımsız PNG varlıklarına geçildi.
  - Hazırlanan ve önbelleğe alınan varlıklar (`public/assets/walkable/` ve `src/features/walkable/assets/`):
    1. `classroom_background.png` (960 × 640 px): Selçuklu mukarnas kemerli duvarlar, pencereler, tavan kirişleri, Selçuklu sekiz köşeli yıldız kakmalı parke zemin ve halı dokusu.
    2. `classroom_teacher_podium.png` (902 × 641 px): Oyma ahşap öğretmen masası ve kürsüsü, açık defter ve kitap detayları.
    3. `classroom_bookshelf.png` (882 × 983 px): Selçuklu kemerli kitaplık, renkli dünya hikâye kitapları ve küre.
    4. `classroom_desk.png` ve `classroom_desk_mirrored.png` (868 × 553 px): İki kişilik öğrenci sıraları, sandalyeler, defterler ve öğrenci gereçleri.
    5. `smartboard_screen_off.png` (260 × 120 px): Yansımalı obsidyen cam, Selçuklu yıldızı filigranı ve bekleme LED göstergesi.
    6. `smartboard_screen_powering.png` (260 × 120 px): Turkuaz enerji ışıması, Selçuklu yıldızı ve açılış yükleme çubuğu.
    7. `smartboard_screen_active.png` (260 × 120 px): Konsept tasarımına uygun "Welcome! Let's Explore!" aktif eğitim arayüzü.
- **3 Katmanlı Render Mimarisi ve Y-Sorting Derinlik Sıralaması**:
  - **Katman 1 (Arka Plan)**: `renderClassroomLayeredBackground` ile zemin, duvarlar, pencereler, akıllı tahta (aktif duruma göre ilgili doku) ve avluya çıkış kapısı çizilir.
  - **Katman 2 (Varlıklar & Y-Sorting)**: `renderClassroomEntities` ile öğretmen kürsüsü (`baseY: 210`), kitaplık (`baseY: 235`), 1. & 2. sıralar (`baseY: 315`), 3. & 4. sıralar (`baseY: 445`) ve öğrenci karakteri (`baseY: player.y + 18`) ayak temas noktalarına göre artan sırada sıralanarak çizilir.
    - Karakter sıranın kuzeyindeyken sıranın arkasında kalır; güneyine geçtiğinde sıranın önünde çizilir.
  - **Katman 3 (Ön Plan & Atmosfer)**: `renderClassroomForeground` ile tavandan sarkan iki pirinç Selçuklu feneri (kehribar ışık halesi) ve sabah güneşi huzmelerinde süzülen ortam toz tanecikleri çizilir.
- **Dünya Koordinatları ve Etkileşim Bütünlüğü**:
  - Sınıf boyutları (`960 × 640 px`), AABB engelleri ve geniş orta koridor (`x: 340 - 590`) tamamen korundu.
  - Akıllı Tahta etkileşimi `(480, 160, r: 80)` ve avluya çıkış kapısı `(480, 590, r: 65)` korunarak kesintisiz etkileşim sağlandı.
- **Aşama 4.7 Görsel Kanıtları (`docs/assets/`)**:
  - `classroom_overview_before.png` (Eski prosedürel sınıf görünümü)
  - `classroom_overview_after.png` (Sinematik 2,5B yeni sınıf genel görünümü)
  - `classroom_student_at_board.png` (Akıllı tahta önünde öğrenci ve etkileşim butonu)
  - `classroom_smartboard_active.png` (Akıllı tahta aktif durumu ve açılan etkinlik modalı)
  - `classroom_student_behind_desk.png` (Y-Sorting: Öğrenci sıranın arkasında)
  - `classroom_student_in_front_desk.png` (Y-Sorting: Öğrenci sıranın önünde)
  - `classroom_mobile_view.png` (390 × 844 mobil dikey görünüm ve dokunmatik kontroller)

## Aşama 4.5 — Karakter Ölçeği, Animasyon ve Görsel Uyum (`feat/campus-visual-upgrade`)
- **Karakter Ölçeği İncelemesi ve Seçimi**:
  - Başlangıç boyutu olan 46 × 58 px, %10 (51 × 64 px), %15 (53 × 67 px) ve %20 (55 × 70 px) büyütme seçenekleri gerçek avlu sahnelerinde karşılaştırıldı.
  - %20 ölçek (55 × 70 px) kapı kemer açıklığına (48–52 px) göre fazla geniş kaldığı ve çocuğu yetişkin mimarisine kıyasla aşırı iri gösterdiği için elendi.
  - %10 ölçek (51 × 64 px) geniş avluda halen hafif minyatür kaldı.
  - **%15 Büyütme (53 × 67 px)** en dengeli ve doğal oran olarak seçildi: İngilizce Dünyası taç kapısı portal yüksekliğinin yaklaşık %85'ine oturur, 72–80 px'lik taş yollar üzerinde rahat boşluk bırakır ve 10 yaşındaki ilkokul/ortaokul öğrencisi silüetini mimari çevreyle tam uyumlu kılar.
- **Zemin Hizalama ve Çarpışma Bütünlüğü**:
  - Karakterin ayak basma çizgisi tam olarak `y + 18` zemin çizgisine ve temas gölgesi elipsine oturur (`renderY = 18 - 67 + 3 = -46 px`; `renderY + renderH - 3 = 18 px`).
  - Mevcut AABB çarpışma kutusu (`DEFAULT_HITBOX`: 22 × 28 px) ve A* yol bulma sistemi değiştirilmeden %100 oranında korundu; 53 px'lik görsel genişlik gövde merkezinde 22 px'lik hitbox ile harika bir tampon sağlayarak koridor ve kapılarda takılmasız geçişi sürdürdü.
- **Animasyon Senkronizasyonu ve Akıcılık**:
  - `WalkableCanvasEngine.ts` ve `characterRenderer.ts` arasındaki adım ritmi senkronize edildi (`walkFrame += delta * 6.5`). Mismatched frekanslar ve `walkFrame * 1.2` çarpanı kaldırılarak sabit 153 ms'lik pürüzsüz adım kadansı sağlandı.
  - 3D sprite kareleri anatomik dikey adımı halihazırda içerdiğinden, yürüyüş esnasındaki aşırı dış gövde sekmesi (`bobY = -2.2 px`) ve omuz sallantısı sıfırlanarak gereksiz zıplama/hoplatma etkisi tamamen giderildi.
  - Durma anında `player.state = 'idle'` ve `col = 0` ile bakılan yöndeki dinlenme duruşuna pürüzsüz geçiş sağlandı. `prefers-reduced-motion` desteği korundu.
  - Çapraz yön hareketlerinde 1.15 eşikli histerezis (ölü bölge) getirilerek yön satırları arasındaki titreşim (flicker) giderildi.
- **Görsel Bütünlük, Sabah Işığı ve Zemin Teması**:
  - **Çok Katmanlı Yönlü Temas Gölgesi**: Sabah güneşi sol-üstten geldiği için sağ-alta hafif yatık dış ortam gölgesi (`(1.8, 19)`, `18.5 × 7.8 px`), orta gövde gölgesi (`(1.0, 18.5)`, `12.5 × 5.0 px`) ve taban temas gölgesi (`(0, 18)`, `8.0 × 2.8 px`, `%48` koyuluk) uygulandı. Ayakların zemine basma hissi kuvvetlendirildi.
  - **Sabah Işığı ve Ambiyans Uyum Tonlaması**: Sprite üzerine `source-atop` kompozit katmanı ile sol-üstten gelen hafif sıcak altın sabah ışıması (`rgba(255, 246, 214, 0.08)`) ve sağ-alt yumuşak gölge tonu uygulandı; karakterin avlu atmosferine "sonradan yapıştırılmış" hissi kaldırıldı.
  - `ctx.imageSmoothingEnabled = true` ve `imageSmoothingQuality = 'high'` ile ölçeklenen piksellerin pürüzsüz çizimi sağlandı.
  - Y-Sorting derinlik sıralaması (`baseY = player.y + 18`) şadırvan ve binalar çevresinde korundu.
- **Aşama 4.5 Görsel Kanıtları (`docs/assets/`)**:
  - `student_scale_before_46x58.png` (Orijinal 46 × 58 px ölçek)
  - `student_scale_10pct_51x64.png` (%10 büyütülmüş ölçek)
  - `student_scale_after_53x67.png` (%15 büyütülmüş seçilen ölçek)
  - `student_scale_20pct_55x70.png` (%20 büyütülmüş ölçek)
  - `student_scale_comparison_options.png` (4 ölçeğin yan yana karşılaştırma paneli)
  - `student_walk_4directions_cycle.png` (4 yönde yürüyüş döngüsü matrisi)
  - `student_at_english_door.png` (İngilizce Dünyası kapısı önünde ölçek uyumu)
  - `student_in_front_of_fountain.png` (Şadırvan önünde Y-Sorting kanıtı)
  - `student_behind_fountain.png` (Şadırvan arkasında Y-Sorting kanıtı)
  - `student_walk_in_game.png` (Avlu içi akıcı yürüyüş karesi)
  - `student_mobile_view.png` (Mobil 390 × 844 görünümü)

## Aşama 4.4 — Öğrenci Karakterinin Sinematik Dönüşümü (`feat/campus-visual-upgrade`)
- **Bağımsız Karakter Varlığı ve 3D Animasyon Estetiği**:
  - Onaylanmış konsept sanatı referansındaki (`docs/assets/digital_campus_courtyard_concept.jpg`) kız öğrenci esas alınarak, geometrik Canvas 2D çiziminden yüksek kaliteli 3D animasyon estetiğine sahip gerçek bir öğrenci karakteri üretildi ve entegre edildi.
  - Karakter özellikleri: Mercan kırmızısı kapüşonlu hırka, Selçuklu 8 köşeli altın yıldız rozetli sarı tişört, mavi kot pantolon, kırmızı-beyaz spor ayakkabılar, turkuaz sırt çantası, çift örgülü koyu kahverengi saçlar ve sıcak, canlı yüz ifadesi.
- **4 Yönlü ve 4 Kareli Sprite Atlas Mimarisi (`character_student_atlas.png`)**:
  - `public/assets/walkable/character_student_atlas.png`, `src/features/walkable/assets/character_student_atlas.png` ve `docs/assets/character_student_atlas.png` (560×720 px, 4 sütun × 4 satır, hücre boyutu 140×180 px).
  - Satır düzeni: 0 = Down (Ön), 1 = Up (Arka), 2 = Right (Sağ Profil), 3 = Left (Sol Profil).
  - Sütun düzeni: 0 = Idle (Durma), 1 = Step 1 (Sol Adım), 2 = Passing (Geçiş), 3 = Step 2 (Sağ Adım). Yürüme döngüsü `[1, 2, 3, 2]` akışıyla pürüzsüzleştirildi.
- **Ayak Hizalama, Çarpışma ve Y-Sorting Derinliği**:
  - Karakterin görsel ayak basma noktası `y + 18` zemin koordinatına ve mevcut AABB çarpışma kutusu sınırlarına (`DEFAULT_HITBOX`: genişlik 22, yükseklik 28) tam olarak oturtuldu.
  - Şadırvan, binalar ve ağaçlar arasında derinlik sıralaması (Y-Sorting): Karakter kuzeydeyken nesnelerin arkasında, güneydeyken nesnelerin önünde doğal olarak çizilir.
- **Önbellek ve Geriye Dönük Çizim Yedeği (Fallback)**:
  - `assetLoader.ts` içinde `preloadWalkableAssets` ve `getStudentCharacterAtlas()` ile sahne öncesi önbelleğe alındı. Görsel yüklenemediğinde veya headless test ortamlarında kusursuz vektörel çizim yedeği (`drawVectorFallbackCharacter`) devreye girer.
- **Görsel Kabul Kanıtları (`docs/assets/`)**:
  - `student_character_before.png` (Önceki geometrik Canvas karakteri)
  - `student_character_after.png` (Yeni 3D animasyon filmi kalitesinde öğrenci karakteri)
  - `student_directions_4views.png` (Dört yön yan yana ön izleme)
  - `student_turnaround_4views.png` (Saydam arka planlı 4 yön inceleme tablosu)
  - `character_student_atlas.png` (560×720 px tam sprite atlası)
  - `student_walk_in_game.png` (Yürünebilir kampüs içinde yürüme karesi)
  - `student_behind_fountain.png` (Şadırvanın arkasında çizim — Y-Sorting testi)
  - `student_in_front_of_fountain.png` (Şadırvanın önünde çizim — Y-Sorting testi)

## Aşama 4.3 — Sinematik Avlu Dönüşümü (`feat/campus-visual-upgrade`)
- **Bağımsız Yüksek Kaliteli 2,5B Görsel Varlıklar ve `drawImage` Entegrasyonu**:
  - Onaylanmış 3D animasyon filmi konsept sanatı referansına (`docs/assets/digital_campus_courtyard_concept.jpg`) sadık kalınarak kampüs avlusunun tüm temel unsurları geometrik Canvas 2D çizimlerinden bağımsız, şeffaf arka planlı PNG görsel varlıklara dönüştürüldü:
    1. **İngilizce Dünyası Binası** (`public/assets/walkable/building_english.png` - 268×292 px render).
    2. **Gezi ve Keşif Binası** (`public/assets/walkable/building_discovery.png` - 284×232 px render).
    3. **Kitap ve Hikâye Dünyası Binası** (`public/assets/walkable/building_library.png` - 276×280 px render).
    4. **Kampüs Yolculuğum Köşkü** (`public/assets/walkable/pavilion_journey.png` - 235×260 px render).
    5. **Keşif Görevleri Panosu** (`public/assets/walkable/kiosk_missions.png` - 210×270 px render).
    6. **Merkez Şadırvan & Fıskiye Havuzu** (`public/assets/walkable/plaza_star_fountain.png` - 250×179 px render).
    7. **Zarif Servi Ağaçları** (`public/assets/walkable/tree_cypress.png` - 64×218 px render).
    8. **Geniş Gölgeli Akdeniz Ağaçları** (`public/assets/walkable/tree_shade.png` - 200×185 px render).
- **Varlık Önbellekleme ve Yükleyici Mimarisi (`assetLoader.ts`)**:
  - `preloadWalkableAssets` sahne başlangıcında tüm görsel varlıkları tarayıcıda önceden belleğe alır.
  - Varlıkların yüklenemediği veya headless test durumlarında geriye dönük kusursuz vektörel çizim yedeği (fallback) devreye girer.
- **Y-Sorting ve Zemin Temas Hizalaması (`courtyardSceneRenderer.ts`)**:
  - Tüm varlıkların ayak basma/zemin koordinatları (`baseY`) ve AABB çarpışma sınırları korunmuş; görseller tam basamak ve yol hizasına oturtulmuştur.
  - Karakter yapıların ve ağaçların arkasındayken arkada, önündeyken önünde doğal olarak çizilir.
  - Etkileşimli kapı ve pano ışımaları (pulsing aura) drawImage üzerine canlı katman olarak bindirilmiştir.
- **Çarpışma Kutuları (AABB) ve Etkileşim Bütünlüğü**:
  - Mevcut 6 engel, 1 etkileşim noktası, 5 ana taş yürüyüş yolu ve A* yol bulma sistemi %100 oranında korunmuştur.
- **Görsel Kabul Kanıtları (`docs/assets/`)**:
  - `courtyard_overview_before.png` vs `courtyard_overview_after.png`
  - `building_library_before.png` vs `building_library_after.png`
  - `building_discovery_before.png` vs `building_discovery_after.png`
  - `fountain_plaza_before.png` vs `fountain_plaza_after.png`
  - `kiosk_missions_before.png` vs `kiosk_missions_after.png`
  - `english_building_before.png` vs `english_building_after.png`

## Doğrulama Durumu ve Sonraki Adım
- Tüm doğrulama komutları (`npm run typecheck`, `npm run lint`, `npm run test` [74/74], `npm run build` ve `npm run test:e2e` [10/10 Chromium + Mobile Chrome]) çalıştırıldı ve geçti.
- Çoklu ekran boyutu denetiminde (`360×740`, `390×844`, `768×1024`, `1280×840`) yatay taşma (`0`) ve mobil `390×844` görünümünde `44×44 px` altı etkileşimli hedef (`0`) doğrulandı.
- Geliştirmeler `feat/campus-visual-upgrade` dalında tamamlanmış olup kullanıcı onayı için hazırdır.

## Son Pedagojik ve İşlevsel İyileştirmeler (Aşama 1 Finali)
- **Üret, Paylaş ve Kampüs Yolculuğum Tutarlılığı (`missionValidation.ts`, `MissionRunnerView.tsx`, `storage.ts`)**:
  - `evaluateOriginalProduction` ile boş tuval, yalnızca renk/araç seçimi, yalnızca boşluk karakteri ve yalnızca kapı adı girişi özgün ürün sayılmaz; Paylaş adımına geçiş, kaydetme ve görevi tamamlama engellenir. Serbest çizim, hazır şekil veya yazılı anlatımdan yalnız biri yeterlidir.
  - `Cihaza Kaydet`, `Tek PNG Olarak İndir (İsteğe Bağlı)` ve `Görevi Tamamla` işlevleri birbirinden ayrıldı; kaydetmek veya PNG indirmek görevi kendiliğinden tamamlanmış saymaz, PNG indirmeden de görev tamamlanabilir.
  - IndexedDB başarısız olduğunda veya kullanılamadığında `persisted: false` ve `storageLocation: 'session-only'` döner; hatalı biçimde "başarıyla kaydedildi" denmez, dürüst oturum uyarısı ve PNG indirme önerisi gösterilir.
- **Kampüs Haritası Sadeleştirmesi (`CampusMapView.tsx`)**: Merkez yıldız meydanından beş yapıya uzanan 5 açık ana taş yol bırakılarak 11 çapraz bağlantı çizgisinin oluşturduğu görsel karmaşa kaldırıldı; `CAMPUS_AREAS.connectedToIds` veri modeli ise korundu.
- **Sınıf Düzeyine Göre Uyarlı Arayüz (`DrawingCanvasStudio.tsx`, `MissionRunnerView.tsx`)**: 2–3. sınıflarda temel çizim araçlarıyla sade başlangıç ve açılabilir `"Daha Fazla Araç ve Şekil"` paneli, `44×44 px` üzeri dokunma hedefleri ve ikon destekli 3 seçenekli öz değerlendirme sunuldu; 5–7. sınıflarda malzeme seçimi ve gerekçeli açıklama alanı güçlendirildi, 7. sınıfta cümle başlangıçları kapalı tutuldu.
- **Kampüs Yolculuğum (`JourneyView.tsx`)**: Sayfa **Görevlerim**, **Öğrenme Yolculuğum** (`1. Keşfet → 2. Öğren → 3. Üret → 4. Paylaş`) ve **Çalışmalarım** (`Cihaza Kayıtlı` vs `Oturum Belleğinde (Geçici)`) bölümlerine ayrıldı; tamamlanan görev inceleme ve ayrıntılı eser ön izleme penceresi eklendi.
- **Türkçe Yazım ve Geri Bildirim Denetimi**: Yönlendirici/yargılayıcı olmayan geri bildirimler ve TDK uyumlu soru/etiket ifadeleri (`"Door" kelimesinin Türkçe karşılığı hangisidir?`) düzeltildi.
- **Üret / Paylaş ve Yazılı Ürün Doğrulaması**: Yalnızca noktalama işareti veya rakam içeren (`!!!`, `...`, `123`) metinler yazılı ürün sayılmayacak biçimde en az 2 harf şartı eklendi (`src/utils/missionValidation.ts`). Kalıcı kayıt başarısız olduğunda (`persisted: false`), 2–3. sınıflara özel sadeleştirilmiş geçicilik uyarısı, sayfa kapatıldığında çalışmanın kaybolabileceği uyarısı ve belirgin PNG indirme çağrısı (`Çalışmamı Şimdi PNG Olarak İndir`) eklendi.

## Aşama 2 — Gezi ve Keşif: Aksaray Kültürel Miras Öğrenme Rotası
- **Eğitim Senaryosu ve Resmî Kaynak Belgelendirmesi (`docs/ASAMA2_AKSARAY_ROTASI.md`)**:
  - İlk rota onaylı **4 durakla** sınırlandırıldı: **Sultanhanı Kervansarayı**, **Eğri Minare (Kızıl Minare)**, **Zinciriye Medresesi** ve **Ihlara Vadisi ve Melendiz Çayı** (`Aksaray Ulu Cami` sonraki Aksaray Merkez rotası için kapsam dışı tutuldu).
  - Rota fiziksel ulaşım güzergâhı değil, **tematik dijital öğrenme rotası** olarak tanımlandı; doğrudan resmî `.gov.tr` kaynakları (`aksaray.ktb.gov.tr`, `aksaray.gov.tr`, `okuldisiogrenme.eba.gov.tr`, `muze.gov.tr`) doğrulandı ve belgelendi.
  - Bütün belgelerde ve arayüzde `KEŞFET → ÖĞREN → ÜRET → PAYLAŞ` akışı standartlaştırıldı.
- **Özgün Görsel Varlıklar (`HeritageStopSvg.tsx`, `DoorIllustrationSvg.tsx`)**: 4 durak için yalnızca `src/styles/globals.css` belirteçlerini kullanan sadeleştirilmiş Anadolu–Selçuklu geometrik SVG çizimleri üretildi.
- **Görev Entegrasyonu (`missions.ts`, `dialogues.ts`, `campusAreas.ts`, `LearningAreaView.tsx`, `MissionRunnerView.tsx`)**:
  - Mevcut 2,5B kampüs tasarımı, `dek_` depolama anahtarları ve ilk görev (`kapilarin-anlattigi-hikaye`) bozulmadan `aksaray-kulturel-miras-rotasi` aktif görevi eklendi.
  - İlkokul (2–4) için `Arch` (*Kemer*), ortaokul (5–7) için 5 kelime (`Arch`, `Brick`, `Courtyard`, `Valley`, `Heritage`) + örnek cümle (`"This courtyard has a stone arch and red brick walls."`) ve 4 gözlem boyutu bağlandı; tüm sınıf düzeylerinde tek bir geçerli özgün üretim biçimiyle tamamlama ilkesi korundu.
- **Belgelendirme Güncellemesi (`README.md`, `docs/ICERIK_REHBERI.md`, `docs/LISANSLAR.md`)**: GitHub/Vercel süreçleri, hukuki değerlendirme başlıkları ve varlık kredileri güncellendi.

## Aşama 3 — Yürünebilir Kampüs ve Son Teknik Düzeltmeler (`feat/walkable-campus-prototype`)
- **Otomatik Yol Bulma ve Köşe Denetimi (`pathfinding.ts`)**:
  - A* ızgara araması ve string-pulling (ışın izleme ile yol pürüzsüzleştirme) geliştirildi.
  - Çapraz komşu denetiminde `side1Blocked || side2Blocked` kuralı uygulanarak engelli köşelerin kesilerek aşılması kesin olarak engellendi.
  - Işın tarama adım aralığı 6 px seviyesine çekilerek alt karakter çözünürlüğünde keskin köşe güvenliği sağlandı.
  - Karakter genişliğinden (18 px) dar koridorların geçilmez olduğu, geniş koridorlardan ise güvenle geçildiği birim testlerle doğrulandı.
  - Başlangıç ve hedef aynı nokta olduğunda gereksiz hesaplama yapmadan doğrudan dönen koruma eklendi.
  - Engelin içine tıklandığında karakter takılmadan doğrudan `onUnreachableTarget` uyarısı verir; yürüyüş sırasında klavye veya mobil D-Pad girdisi geldiğinde otomatik rota anında iptal edilir.
- **Animasyon Döngüsü ve Yaşam Döngüsü Yönetimi (`WalkableCanvasEngine.ts`)**:
  - `pause()` çağrıldığında animasyon döngüsü tamamen durdurulur (`cancelAnimationFrame`), `animFrameId` sıfırlanır ve modal açıkken hiçbir yeni kare planlanmaz.
  - `resume()` çağrıldığında döngü güvenle yeniden başlatılır; `lastTime = performance.now()` ile delta zaman sıçraması (delta spike) ve çift döngü oluşumu önlenir.
  - `visibilitychange` dinleyicisi ile tarayıcı sekmesi arka plana alındığında döngü durdurulur; sekme öne geldiğinde yeniden başlatılarak gereksiz CPU ve pil tüketimi sıfırlanır.
- **Karakter Konumunun Korunması**:
  - React durum güncellemeleri (`isSmartBoardActive`, `isSmartBoardPoweringOn`) ref üzerinden aktarılarak motorun gereksiz yeniden oluşturulması engellendi.
  - Karakterin sınıf içi ve avlu konumları saklanarak etkinliklerden sonra aynı koordinata dönmesi sağlandı.
- **Akıllı Tahta Modalı Erişilebilirliği (`SmartBoardModal.tsx`)**:
  - Açılışta ilk etkileşimli elemana otomatik odaklanma, `Tab` ve `Shift+Tab` ile döngüsel odak tuzağı (Focus Trap) sağlandı.
  - `Escape` tuşu ile kapatma ve modal kapandığında önceki aktif elemana (bulunamazsa canvas/oyun alanına) odak iadesi yapıldı.
  - Devre dışı (`disabled`) veya gizli (`display: none` / `visibility: hidden`) elemanlar odak döngüsünden hariç tutuldu.
- **Mobil Dokunmatik Kontroller (`WalkableControlsOverlay.tsx`)**:
  - `pointercancel` ve pointer capture desteği eklendi; parmak kaldırıldığında veya kaydırıldığında karakterin sonsuz yürümesi engellendi.
  - `44×44 px` üzeri dokunma alanları sağlandı.
- **Canvas ve Responsive Koordinat Ölçekleme**:
  - `canvas.getBoundingClientRect()` ve gerçek piksel genişliği arasındaki `scaleX / scaleY` oranları entegre edildi.
  - `updateDimensions` ile pencere yeniden boyutlandırmalarında kamera ve karakter sahne sınırları içinde kenetlendi.
- **Genişletilmiş Test Paketi**:
  - Toplam **60 Vitest** birim/entegrasyon testi (`src/test/walkable.test.tsx` [31 test] + `src/test/campus.test.tsx` [29 test]) ve **10 Playwright E2E** testi eksiksiz geçti.

## Aşama 4 — Görsel Dünya, Karakter Animasyonu ve Sınıf Tasarımı (`feat/campus-visual-upgrade`)
- **Öğrenci Karakterinin Yeniden Tasarımı (`characterRenderer.ts`)**:
  - Animasyon filmi estetiğinde, sevimli, sıcak ve çocuk yaş grubuna uygun özgün ana karakter geliştirildi.
  - Canlı badem gözler, ışıltılı çift catchlight, sevimli yanak allığı (blush), dinamik göz kırpma (blink) ve sıcak gülümseme mimikleri eklendi.
  - Anadolu–Selçuklu turkuazı yelek, altın sarısı kenar bordürleri, göğüste minik sekiz köşeli Selçuklu yıldız rozeti ve deri sırt çantası detaylandırıldı.
  - 4 yönde (`down`, `up`, `left`, `right`) tam tutarlı gövde ve baş perspektifi sağlandı.
  - İki katmanlı eliptik zemin gölgesi (ortam + ayak altı temas gölgesi) ile zemine basış hissi güçlendirildi.
  - Yürürken doğal kol-bacak salınımı, dikey gövde esnemesi (bobbing); beklemede nazik nefes alma salınımı sağlandı.
- **Kampüs Avlusunun Görsel Dönüşümü (`courtyardSceneRenderer.ts`)**:
  - Sıcak taş dokulu zemin, Selçuklu sekiz köşeli yıldız meydanı ve merkez şadırvanda animasyonlu su dalgalanması (`water shimmer`) uygulandı.
  - İngilizce Dünyası binası anıtsal mukarnas taç kapı, Selçuklu çinili kubbe, giriş kandilleri ve yaklaşınca belirginleşen davetkâr kapı ışıltısıyla güçlendirildi.
  - Gezi ve Keşif ile Kitap Dünyası binalarına özgün mimari cepheler kazandırıldı.
  - Katmanlı gölgeli bahçe ağaçları (rüzgâr salınımlı), ahşap park bankları ve çiçek tarhları eklendi.
  - Yürünebilir yollar, kapı koordinatları ve bina AABB çarpışma sınırları %100 korundu.
- **İngilizce Sınıfının Görsel Dönüşümü (`classroomSceneRenderer.ts`)**:
  - Sıcak ahşap parke zemin, Selçuklu sivri kemerli vitray pencereler ve zemine vuran açılı güneş ışığı huzmeleri (sunbeams) uygulandı.
  - Akıllı Tahta: Anadolu–Selçuklu ahşap-pirinç kakma çerçeve, kapalıyken cam yansıması ve bekleme LED'i, açılırken radyal ışık dalgalanması, açıkken canlı eğitim arayüzü sunuldu.
  - Ahşap öğretmen kürsüsü, kitaplık (dünya küresi ve ciltli kitaplar), sandalyeli öğrenci sıraları ve Selçuklu kemerli çıkış kapısı detaylandırıldı.
- **Erişilebilirlik ve Performans**:
  - Bütün çevre animasyonları (su parıltısı, yaprak salınımı, karakter nefes alma) `prefers-reduced-motion` tercihine tam uyumludur.
  - Canvas 2D performansı korunmuş, paket boyutu yalnızca `48.09 kB` (gzip: `13.06 kB`) seviyesinde tutulmuştur.

## Doğrulama Durumu ve Sonraki Adım
- Tüm doğrulama komutları (`npm run typecheck`, `npm run lint`, `npm run test` [69/69], `npm run build` ve `npm run test:e2e` [10/10 Chromium + Mobile Chrome]) çalıştırıldı ve geçti.
- İngilizce Dünyası binası 3D animasyon filmi estetiğinde bağımsız şeffaf PNG varlığı (`building_english.png`) olarak üretilmiş ve `drawImage` render motoruna entegre edilmiştir.
- Öncesi ve sonrası ekran görüntüleri (`docs/assets/english_building_before.png` ve `docs/assets/english_building_after.png`) kaydedilmiştir.
- Çoklu ekran boyutu denetiminde (`360×740`, `390×844`, `768×1024`, `1280×840`) yatay taşma (`0`) ve mobil `390×844` görünümünde `44×44 px` altı etkileşimli hedef (`0`) doğrulandı.
- Geliştirmeler `feat/campus-visual-upgrade` dalında tamamlanmış olup kullanıcı onayı için hazırdır.



