# Proje Durum Raporu — Sürüm 3.2 (Aşama 1: Vite Mimari Geçişi)

## Tamamlanan Bölümler
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

## Son Pedagojik ve İşlevsel İyileştirmeler (Aşama 1 Finali)
- **Üret, Paylaş ve Kampüs Yolculuğum Tutarlılığı (`missionValidation.ts`, `MissionRunnerView.tsx`, `storage.ts`)**:
  - `evaluateOriginalProduction` ile boş tuval, yalnızca renk/araç seçimi, yalnızca boşluk karakteri ve yalnızca kapı adı girişi özgün ürün sayılmaz; Paylaş adımına geçiş, kaydetme ve görevi tamamlama engellenir. Serbest çizim, hazır şekil veya yazılı anlatımdan yalnız biri yeterlidir.
  - `Cihaza Kaydet`, `Tek PNG Olarak İndir (İsteğe Bağlı)` ve `Görevi Tamamla` işlevleri birbirinden ayrıldı; kaydetmek veya PNG indirmek görevi kendiliğinden tamamlanmış saymaz, PNG indirmeden de görev tamamlanabilir.
  - IndexedDB başarısız olduğunda veya kullanılamadığında `persisted: false` ve `storageLocation: 'session-only'` döner; hatalı biçimde "başarıyla kaydedildi" denmez, dürüst oturum uyarısı ve PNG indirme önerisi gösterilir.
- **Kampüs Haritası Sadeleştirmesi (`CampusMapView.tsx`)**: Merkez yıldız meydanından beş yapıya uzanan 5 açık ana taş yol bırakılarak 11 çapraz bağlantı çizgisinin oluşturduğu görsel karmaşa kaldırıldı; `CAMPUS_AREAS.connectedToIds` veri modeli ise korundu.
- **Sınıf Düzeyine Göre Uyarlı Arayüz (`DrawingCanvasStudio.tsx`, `MissionRunnerView.tsx`)**: 2–3. sınıflarda temel çizim araçlarıyla sade başlangıç ve açılabilir `"Daha Fazla Araç ve Şekil"` paneli, `44×44 px` üzeri dokunma hedefleri ve ikon destekli 3 seçenekli öz değerlendirme sunuldu; 5–7. sınıflarda malzeme seçimi ve gerekçeli açıklama alanı güçlendirildi, 7. sınıfta cümle başlangıçları kapalı tutuldu.
- **Kampüs Yolculuğum (`JourneyView.tsx`)**: Sayfa **Görevlerim**, **Öğrenme Yolculuğum** (`1. Keşfet → 2. Öğren → 3. Üret → 4. Paylaş`) ve **Çalışmalarım** (`Cihaza Kayıtlı` vs `Oturum Belleğinde (Geçici)`) bölümlerine ayrıldı; tamamlanan görev inceleme ve ayrıntılı eser ön izleme penceresi eklendi.
- **Türkçe Yazım ve Geri Bildirim Denetimi**: Yönlendirici/yargılayıcı olmayan geri bildirimler ve TDK uyumlu soru/etiket ifadeleri (`"Door" kelimesinin Türkçe karşılığı hangisidir?`) düzeltildi.

## Doğrulama Durumu ve Sonraki Adım
- Tüm doğrulama komutları (`npm run typecheck`, `npm run lint`, `npm run test` [22/22], `npm run build` ve `npm run test:e2e` [4/4 Chromium + Mobile Chrome]) çalıştırıldı ve geçti.
- Çoklu ekran boyutu denetiminde (`360×740`, `390×844`, `768×1024`, `1280×840`) yatay taşma (`0`) ve mobil `390×844` görünümünde `44×44 px` altı etkileşimli hedef (`0`) doğrulandı.
- Aşama 1 tamamlanmış olup bu noktada durulmuştur; Aşama 2 / yeni modüllere geçilmemiştir.

