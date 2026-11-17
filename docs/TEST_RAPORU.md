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
