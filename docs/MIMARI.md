# Mimari Tasarım Belgesi

## 1. Teknoloji Yığını ve Sabit Sürümler
Bu proje **Vite + React + TypeScript** altyapısı üzerine kurulmuş, ilk sürümde tamamen istemci tarafında çalışan tek sayfalık (SPA) bir web uygulamasıdır:

- **Node.js**: v22 (`.nvmrc` içinde `22`, `package.json` `engines`: `>=22.0.0 <23.0.0`)
- **Vite**: `^8.0.0` (`@vitejs/plugin-react` ile derleme ve geliştirme sunucusu)
- **React & React DOM**: `^19.2.1`
- **React Router**: `^7.6.2` (`createBrowserRouter` ile istemci yönlendirmesi)
- **TypeScript**: `^5.9.3` (`strict: true`)
- **Tailwind CSS**: `^4.3.5` (`@tailwindcss/vite` v4 eklentisi ve `src/styles/globals.css` içinde CSS tabanlı yapılandırma)
- **Animasyon**: `motion` (`^12.23.24`, `MotionConfig reducedMotion="user"` ile)
- **Simgeler**: `lucide-react` (`^0.553.0`, yerelde paketlenir)
- **Test Araçları**: `vitest` (`^5.1.0`), `@testing-library/react` (`^16.3.3`), `jsdom` (`^31.0.1`), `@playwright/test` (`^1.65.1`)

## 2. Yönlendirme Modeli
Tüm uygulama sayfaları React Router (`src/app/router.tsx`) üzerinden tek bir tutarlı yönlendirme modeliyle çalışır:
- `/` — İlk ziyarette Kapı → Avlu Karşılama → Tercih → Sınıf Seçimi → Rehberli Tur akışını; sonraki ziyaretlerde doğrudan Kampüs Haritasını açar.
- `/harita` — Etkileşimli Kampüs Haritası.
- `/alan/:id` — Veri temelli Öğrenme Alanları ve Keşif Görevleri Panosu.
- `/gorev/:id` — Genişletilebilir Görev Motoru.
- `/yolculugum` — Öğrencinin cihazındaki görev durumu ve kayıtlı eserleri.

## 3. Genişletilebilir Veri Mimarisi
- **Sınıf Profilleri (`src/data/gradeProfiles.ts`)**: 2–7. sınıflar için yönerge uzunluğu, kelime sayısı, destek düzeyi, ipucu kademesi, yazma beklentisi ve öz değerlendirme biçimini tek kaynakta tanımlar.
- **Kampüs Alanları (`src/data/campusAreas.ts`)**: `learning-area` ve `utility` ayrımıyla harita koordinatları ve bağlantıları veri olarak tutulur.
- **Görev Motoru (`src/data/missions.ts`, `src/features/missions/MissionRunnerView.tsx`)**: Görev üst verisi, hedefler, aşamalar, içerik referansları ve doğrulama durumu ayrı tutulur.

## 4. Depolama ve Mahremiyet Mimarisi
- **localStorage (`dek_campus_v1_state`)**: `schemaVersion: 1` ile sınıf seçimi, ses ayarı ve görev ilerleme durumları saklanır (`CampusStudentState`). Bilinmeyen veya gelecek sürüme ait şema durumunda veri sessizce silinmez; bellek içi oturum yedeğine geçilir.
- **IndexedDB (`dek_campus_db`, `artifacts` deposu)**: Çizim verileri (`DrawingDocument`) ve üretilen PNG görselleri (`SavedArtifact`) cihaz üzerinde saklanır.
- **Alan Adı (Origin) Bağlılığı ve Taşınmama Kısıtı**: Tarayıcıların Eş Kaynak Politikası (Same-Origin Policy) gereği `localStorage` ve `IndexedDB` kayıtları yalnızca uygulamanın çalıştığı alan adına (protokol + alan adı + port) bağlıdır. Uygulama farklı bir alan adına veya alt alan adına taşındığında (örneğin ön izleme adresinden özel alan adına geçişte) mevcut cihaz içi veriler **otomatik olarak taşınmaz**; öğrencinin saklamak istediği çalışmalarını PNG olarak indirmesi gerekir.
- **Seslendirme (`src/services/speech.ts`)**: Tarayıcı `speechSynthesis` API'sini `tr-TR` ve `en-US` segmentlerine ayırarak yönetir; gelecekte profesyonel ses dosyaları eklenebilmesi için `audioSrc` alanını destekler.

## 5. Hukuki Değerlendirme Başlıkları (6698 Sayılı KVKK ve Mevzuat)
Teknik önlemler hukuki uygunluğu tek başına otomatik olarak sağlamaz; yayın öncesinde aşağıdaki başlıklar hukuk/KVKK danışmanlığı ile ayrıca değerlendirilmelidir:
1. **Barındırma Sunucu Kayıtları vs. Uygulama Verisi**: Uygulama kodunun kendisi öğrenci verisi toplamaz ve sunucuya göndermez; ancak Vercel gibi barındırma sağlayıcılarının HTTP erişim/IP günlükleri (teknik sunucu kayıtları) ayrı bir veri işleme faaliyeti olarak değerlendirilmelidir.
2. **Çocuklara Yönelik Aydınlatma Metni**: 2–7. sınıf öğrencileri ve velileri için sade, yaşa uygun bilgilendirme ve veli rızası gereksinimlerinin hukuken gözden geçirilmesi.
3. **Gelecek Sürümlerde İçerik Yönetim Sistemi**: Yalnızca yetkili proje yöneticisinin erişebileceği yönetim altyapısı eklendiğinde kimlik doğrulama ve yetkilendirme güvenliğinin ayrıca tasarlanması.
