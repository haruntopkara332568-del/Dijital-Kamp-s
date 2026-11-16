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

## 6. Aşama 3 — Yürünebilir Kampüs ve Etkileşimli Sınıf Mimarisi

### 6.1. Ayrık Hibrit Mimari (React + Canvas 2D)
Aşama 3 kapsamında öğrencinin karakterini serbestçe yönlendirebildiği ve eğitim mekânlarıyla etkileşime girebildiği yürünebilir kampüs prototipi geliştirilmiştir:
- **React 19 Katmanı**: Görev motoru (`MissionRunnerView`), akıllı tahta arayüzü (`SmartBoardModal`), ekran üstü kontroller (`WalkableControlsOverlay`), öğrenci durumu/ilerlemesi ve erişilebilirlik bağlantıları.
- **Canvas 2D Oyun Motoru (`WalkableCanvasEngine`)**: Karakter hareketi, 60fps render döngüsü (`requestAnimationFrame`), AABB çarpışma kutuları, kamera lerp takibi, tıklayarak otomatik yürüme ve etkileşim yarıçapı denetimleri.
- **Tip Güvenliği (`src/features/walkable/types.ts`)**: Karakter yönü (`up`, `down`, `left`, `right`), durumlar (`idle`, `walk`), sahne nesneleri, engeller ve etkileşimli alanlar TypeScript strict modunda modellenmiştir.

### 6.2. Phaser 3 ve Canvas 2D Teknik Değerlendirmesi
Geliştirme öncesinde Phaser 3 oyun motoru paket boyutu, mobil uyumluluk ve mevcut SPA yapısıyla entegrasyon açısından değerlendirilmiştir:
1. **Paket Boyutu**: Phaser 3 minified haliyle **~1.28 MB** (gzip: **~310 kB**) ek yük getirmekte olup düşük donanımlı mobil cihazlarda ilk açılış süresini olumsuz etkilemektedir.
2. **Özel Canvas 2D Motoru**: Sıfır harici kütüphane bağımlılığıyla yazılan `WalkableCanvasEngine`, derleme çıktısında yalnızca **25.79 kB** (gzip: **7.42 kB**) yer kaplamakta ve Phaser'a kıyasla **~40 kat daha hafif** kalmaktadır.
3. **Bellek ve Test Kolaylığı**: WebGL bağlamı gerektirmeyen Canvas 2D altyapısı Vitest JSDOM test ortamında ve mobil tarayıcılarda sızıntısız çalışmakta; sekme arka plana geçtiğinde animasyon döngüsü duraklatılarak pil tasarrufu sağlanmaktadır.
4. **Kod Bölme (`React.lazy`)**: Yürünebilir sahne bileşenleri (`WalkableCampusView`) bağımsız bir dinamik parça (`chunk`) olarak ayrılmış; harita veya görev panosunu kullanan öğrencilere ek indirme maliyeti yüklenmemiştir.

### 6.3. Sahne Kurgusu ve Akıllı Tahta Entegrasyonu
- **Yürünebilir Kampüs Avlusu (`1400×900`)**: Selçuklu sekiz köşeli yıldız meydanı, mermer fıskiye, taş döşeli yollar, 5 bina silüeti ve ağaç engelleri yer alır. Karakter İngilizce Dünyası binasına yaklaştığında `[E] İngilizce Sınıfına Gir` etkileşimi etkinleşir.
- **İngilizce Sınıfı İç Mekânı (`960×640`)**: Ahşap parke zemin, Selçuklu kemerli pencereler, öğrenci sıraları, öğretmen kürsüsü, kitaplık ve çıkış kapısı bulunur.
- **Akıllı Tahta Etkileşimi**: Öğrenci tahtaya yaklaştığında `[E] Akıllı Tahtayı Aç` bildirimi belirir. Etkileşim tetiklendiğinde açılma animasyonu oynatılır ve mevcut `MissionRunnerView` bileşeni `kapilarin-anlattigi-hikaye` göreviyle akıllı tahta modal çerçevesi içinde açılır. Görev motorunun iç yapısı, sınıf profilleri ve depolama mekanizması değiştirilmemiştir. Etkinlikten çıkıldığında öğrenci doğrudan sınıfa, sınıftan çıkıldığında avluya geri döner.

### 6.4. Çoklu Kontrol ve Erişilebilirlik
- **Klavye**: Yön tuşları ve `W-A-S-D` desteği; normalize edilmiş çapraz hareket hızı; metin girişlerinde tuş dinleyicilerinin otomatik pasifleşmesi.
- **Tıklayarak Yürüme**: Sahne üzerinde tıklanan açık noktaya karakterin engelleri aşarak yürümesi; engel üzerine tıklandığında nazik geri bildirim (`Oraya ulaşılamıyor, lütfen açık bir yola tıkla.`).
- **Mobil Dokunmatik D-Pad**: Küçük ekranlarda `44×44 px` üzeri hedeflere sahip sanal yön tuşları.
- **Erişilebilir Kısayollar**: Klavyeyle yürümek istemeyen öğrenciler için `Doğrudan Sınıfa Gir` ve `Kuşbakışı Harita` butonları korunmuştur.

### 6.5. Otomatik Yol Bulma ve Pürüzsüzleştirme (`pathfinding.ts`)
Aşama 3 teknik iyileştirme sürümünde (Sürüm 1.1), karakterin engellerin çevresinden dolaşmasını sağlayan hafif bir A* algoritması ve string-pulling (doğrudan görüş hattı pürüzsüzleştirmesi) entegre edilmiştir:
- **Doğrudan Hat Denetimi (0ms Hızlı Yol)**: Hedef ile başlangıç arasında doğrudan görüş hattı varsa (`hasLineOfSight`), arama algoritması çalıştırılmadan doğrudan tek adımlı rota döner.
- **Engel Algılama**: Hedef nokta bir engelin içindeyse, karakter takılmadan doğrudan `onUnreachableTarget` geri bildirimi tetiklenir.
- **A* Izgara Araması**: 25 px hücre çözünürlüğü ve 8 yönlü hareketle (çapraz maliyet: 1.414) engellerin çevresinden en kısa yol bulunur.
- **String Pulling (Yol Pürüzsüzleştirme)**: Izgara basamakları arasındaki gereksiz kırılımlar doğrudan ışın denetimiyle elenerek doğal düz çizgi rotalarına dönüştürülür.
- **Manuel Müdahale Önceliği**: Otomatik yürüyüş esnasında klavyeden yön tuşuna basıldığında veya mobil D-Pad dokunuşu geldiğinde otomatik rota anında temizlenir.

### 6.6. Yaşam Döngüsü, Duraklatma ve Odak Güvenliği
- **Oyun Motoru Duraklatma (`pause / resume`)**: Akıllı tahta açıldığında motor duraklatılır, basılı tuşlar ve rotalar temizlenir; böylece görev ekranındaki klavye ve fare etkileşimleri arka plandaki karakteri hareket ettirmez.
- **Süreklilik ve Konum Koruma**: React durum güncellemeleri motorun yeniden oluşturulmasına yol açmaz. Sınıf ve avlu konumları `lastClassroomPosRef` ve `lastCourtyardPosRef` içinde saklanarak etkinliklerden sonra aynı koordinata dönülmesi garanti edilir.
- **Akıllı Tahta Erişilebilirliği (Focus Trap)**: `SmartBoardModal`, açılışta odağı içine hapseder; `Tab` ve `Shift+Tab` ile döngüsel gezinme sağlar; `Escape` tuşuyla güvenle kapanır ve kapanışta odağı önceki aktif elemana geri devreder.
- **Duyarlı Koordinat Ölçekleme**: `canvas.getBoundingClientRect()` genişlik ve yükseklik oranları (`scaleX`, `scaleY`) hesaba katılarak CSS boyutu ile gerçek piksel boyutu arasındaki farklarda kusursuz hedefleme sağlanır.
