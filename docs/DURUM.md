# Proje Durum Raporu — Sürüm 3.2 (Aşama 1: Vite Mimari Geçişi)

## Tamamlanan Bölümler
- **Mimari Dönüşüm (Vite + React + TypeScript + Tailwind CSS v4 + React Router)**:
  - Next.js 15 App Router altyapısı kaldırıldı; Vite 8 (`@vitejs/plugin-react`), `@tailwindcss/vite` v4 ve `react-router` (`createBrowserRouter`) tabanlı tek sayfalık (SPA) yapıya geçildi.
  - `@google/genai` ve kullanılmayan şablon bağımlılıkları kaldırıldı; temiz `package.json` ve `package-lock.json` oluşturuldu.
  - Herkese açık dizindeki ham prompt dosyası dağıtım kapsamından çıkarıldı.
- **Kampüs Giriş Kapısı**: Anadolu taş işçiliği ve Selçuklu geometrik motiflerinden esinlenen özgün SVG kapı (`CampusPortalGateSvg`), açılma animasyonu, "Animasyonu Atla" düğmesi, `prefers-reduced-motion` desteği ve sonraki ziyaretlerde doğrudan haritaya geçiş korundu.
- **Karşılama Avlusu ve Akran Rehber**: Onaylanmış karşılama metni (`APPROVED_WELCOME_TEXT`), `"Birlikte gezelim"` / `"Kendim keşfedeceğim"` tercihleri, `2–7. sınıf` seçimi ve sınıf düzeyine uyarlı rehberli tanıtım turu korundu.
- **Veri Temelli Sınıf Profilleri (`src/data/gradeProfiles.ts`)**: 2–7. sınıfların tüm tasarım parametreleri tek merkezde korundu.
- **Etkileşimli Kampüs Haritası ve Öğrenme Alanları**: 3 öğrenme alanı (`Gezi ve Keşif`, `İngilizce Dünyası`, `Kitap ve Hikâye Dünyası`) ve 2 yardımcı işlev (`Keşif Görevleri Panosu`, `Kampüs Yolculuğum`) korundu.
- **İlk Bütünleşik Görev — "Kapıların Anlattığı Hikâye"**:
  - `KEŞFET → ÖĞREN → ÜRET → PAYLAŞ` aşamalarıyla İlkokul (2–4) ve Ortaokul (5–7) düzeyleri, Çizim Stüdyosu, tarayıcı seslendirme (`speech.ts`) ve tek PNG dışa aktarma (`pngExport.ts`) korundu.
- **Depolama ve Veri Güvenliği**: `localStorage` (`dek_campus_v1_state`, `schemaVersion: 1`), `IndexedDB` (`dek_campus_db`), bellek yedeği ve iki adımlı `"Verilerimi Sil"` penceresi korundu. Kayıtlar tarayıcı Eş Kaynak Politikası gereği alan adına bağlıdır; alan adı değiştiğinde otomatik taşınmaz (`docs/MIMARI.md` içinde belgelendi).

## Doğrulama Durumu ve Sonraki Adım
- Tüm doğrulama komutları (`npm run build`, `npm run typecheck`, `npm run lint`, `npm run test` [12/12] ve `npm run test:e2e` [2/2 Chromium + Mobile Chrome]) çalıştırıldı ve geçti.
- Sonraki geliştirme aşamasına geçmeden önce proje sahibinin Aşama 1 son doğrulama onayı beklenmektedir.
