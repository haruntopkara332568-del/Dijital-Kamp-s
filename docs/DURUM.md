# Proje Durum Raporu — Sürüm 3.3 (Aşama 1 + Aşama 2: Aksaray Kültürel Miras Rotası)

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

## Tasarım Sistemi ve Görsel Ön İzleme (`src/styles/globals.css`, `src/data/designSystem.ts`, `/tasarim-sistemi`)
- **Ortak Renk, Tipografi ve Hareket Belirteçleri**: Merkezi CSS renk ve yerel Türkçe yazı tipi belirteçleri (`--font-sans`, `--font-display`, `--focus-ring-color`), sayısal hizalama (`.tabular-nums`), mobil kırılımlar (`360/390/768/1024+ px`) ve `prefers-reduced-motion` kuralları tek yapıda toplandı (`docs/TASARIM_SISTEMI.md`).
- **Yeniden Kullanılabilir UI ve Anadolu Motif Bileşenleri (`CampusDesignSystem.tsx`, `AnatolianMotifSvg.tsx`)**: `CampusButton`, `CampusCard`, `CampusSectionHeader`, `CampusBadge`, `CampusProgressBar` ve 4 sadeleştirilmiş Anadolu motif SVG varyantı (`seljuk-star`, `stone-arch`, `brick-zigzag`, `tile-medallion`) eklendi.
- **2–7. Sınıflar İçin Ortak Ama Yaşa Uyarlanabilir Görsel Dil (`getVisualLanguageSpec`)**: İlkokulda (`2–4`) `48 px` ferah dokunma yüksekliği ve açık kısa yönerge yoğunluğu; ortaokulda (`5–7`) `44 px` dengeli yoğunluk ve karşılaştırmalı gösterge dili uygulandı.
- **Canlı Görsel Ön İzleme (`/tasarim-sistemi`)**: Öğrenci ana gezinme çubuğuna kalabalık eklemeden doğrudan ön izleme ve erişilebilirlik/sınıf uyarlama denetimi için `/tasarim-sistemi` rotası sunuldu.
- **Sayfa Bazlı Kod Bölme (`CampusPages.tsx`)**: Tüm sayfa görünümleri (`CampusGateView`, `CourtyardWelcomeView`, `CampusMapView`, `LearningAreaView`, `MissionRunnerView`, `JourneyView`, `DesignSystemPreviewView`) `React.lazy` + `Suspense` ile ayrıştırılarak ana başlangıç JS paketi `1.003 kB` (`270.66 kB` gzip) düzeyinden `528.34 kB` (`160.31 kB` gzip) düzeyine düşürüldü.

## Doğrulama Durumu ve Sonraki Adım
- Tüm doğrulama komutları (`npm run typecheck`, `npm run lint`, `npm run test` [29/29], `npm run build` ve `npm run test:e2e` [8/8 Chromium + Mobile Chrome]) çalıştırıldı ve geçti.
- Çoklu ekran boyutu denetiminde (`360×740`, `390×844`, `768×1024`, `1280×840`) yatay taşma (`0`) ve mobil `390×844` görünümünde `44×44 px` altı etkileşimli hedef (`0`) doğrulandı.
- Tasarım Sistemi ön izlemesi, kod bölme optimizasyonu ve ilgili testler tamamlanmış olup görsel sahne yönü konusunda onay beklenmektedir.



