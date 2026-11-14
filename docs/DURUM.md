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

## Son Görsel Düzenleme ve Kullanılabilirlik İyileştirmeleri (2,5B İzometrik Sürüm)
- **Kampüs Giriş Kapısı**: Taç kapı sahnesi `max-w-[660px]` oranında dengelendi; kart dış boşlukları ve alt düğme hizalaması (`46 px` yükseklik) `360×740`, `390×844`, `768×1024` ve `1280×840` ekranlarda dikey kaydırma veya taşma olmadan tek ekrana oturacak şekilde sıkılaştırıldı.
- **Karşılama Avlusu**: `360–639 px` mobil ekranlarda yakınlaştırılmış izometrik görünüm (`viewBox="66 10 748 390"`) ve okunaklı HTML öğrenme alanı şeridi eklendi; yön levhası kolları ve sahne içi `"Kampüs Arkadaşın"` etiketi ayrıştırılarak tüm ekranlarda `0` metin çakışması sağlandı.
- **Kampüs Haritası ve Erişilebilirlik**: Masaüstü/tablet etkileşimli harita sahnesi `aspect-[16/10]` (`1000×625`) oranına alındı; aktif/devam eden görevin karşılık geldiği bina görsel hale ve açık durum etiketiyle (`Devam Eden Görev` / `Önerilen Başlangıç`) vurgulandı. Dekoratif zemin/gölge katmanları `aria-hidden="true"` ile ekran okuyucudan ayrıldı; üst gezinme, harita ve alt bağlantılardaki tüm etkileşimli hedefler en az `44×44 px` yapıldı.

## Doğrulama Durumu ve Sonraki Adım
- Tüm doğrulama komutları (`npm run typecheck`, `npm run lint`, `npm run test` [14/14], `npm run build` ve `npm run test:e2e` [2/2 Chromium + Mobile Chrome]) çalıştırıldı ve geçti.
- Çoklu ekran boyutu denetiminde (`360×740`, `390×844`, `768×1024`, `1280×840`) giriş kapısı, karşılama avlusu, harita, öğrenme alanı ve yolculuğum sayfalarında `0` yatay taşma, `0` kırpılma, `0` düğüm/SVG metin çakışması ve `0` küçük dokunma hedefi (`< 44 px`) doğrulandı.

