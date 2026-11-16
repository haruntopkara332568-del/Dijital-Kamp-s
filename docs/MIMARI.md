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
- **Oyun Motoru Duraklatma (`pause / resume`)**: Akıllı tahta açıldığında motor duraklatılır, basılı tuşlar ve rotalar temizlenir; böylece görev ekranındaki klavye ve fare etkileşimleri arka plandaki karakteri hareket ettirmez. Sürüm 1.2 ile `pause()` çağrıldığında animasyon döngüsü (`cancelAnimationFrame`) tamamen durdurulur ve duraklatılmış durumda hiçbir yeni kare planlanmaz (`animFrameId = null`).
- **Süreklilik ve Konum Koruma**: React durum güncellemeleri motorun yeniden oluşturulmasına yol açmaz. Sınıf ve avlu konumları `lastClassroomPosRef` ve `lastCourtyardPosRef` içinde saklanarak etkinliklerden sonra aynı koordinata dönülmesi garanti edilir.
- **Akıllı Tahta Erişilebilirliği (Focus Trap)**: `SmartBoardModal`, açılışta odağı içine hapseder; `Tab` ve `Shift+Tab` ile döngüsel gezinme sağlar; `Escape` tuşuyla güvenle kapanır ve kapanışta odağı önceki aktif elemana geri devreder. Devre dışı (`disabled`) veya görünmeyen öğeler odak döngüsüne dâhil edilmez; önceki eleman bulunamazsa canvas oyun alanına odak iade edilir.
- **Duyarlı Koordinat Ölçekleme**: `canvas.getBoundingClientRect()` genişlik ve yükseklik oranları (`scaleX`, `scaleY`) hesaba katılarak CSS boyutu ile gerçek piksel boyutu arasındaki farklarda kusursuz hedefleme sağlanır.

### 6.7. Aşama 3 Sürüm 1.2 Teknik İyileştirmeleri ve Güvenilirlik
- **Köşe Kesmeyi Kesinlikle Önleyen A* Çapraz Komşu Denetimi**: Çapraz komşuya geçiş sırasında her iki komşu eksen yönü ayrı ayrı denetlenir (`side1Blocked || side2Blocked`). Biri bile engelli olan köşelerden geçiş engellenerek karakter çarpışma kutusuyla (18×12 px) uyumlu güvenli rotalar üretilir.
- **Alt Karakter Çözünürlüğünde Görüş Hattı (Raycast) ve Dar Koridorlar**: `hasLineOfSight` ve `smoothPath` içindeki ışın tarama adım aralığı 6 px seviyesine çekilerek engellerin keskin uçlarının atlanması engellenmiştir. Karakter genişliğinden (18 px) dar koridorlar geçilmez olarak işaretlenirken, geniş koridorlardan güvenli geçişe izin verilir.
- **Sekme Yaşam Döngüsü (`visibilitychange`) ve Çift Döngü Engeli**: Tarayıcı sekmesi arka plana alındığında (`document.hidden`) rAF döngüsü durdurularak CPU ve pil tüketimi sıfırlanır; sekme öne geldiğinde `performance.now()` ile delta zaman sıçraması (delta spike) olmadan güvenle yeniden başlatılır. Çoklu `resume` çağrılarında çift döngü oluşumu kesin olarak engellenir.

### 6.8. Aşama 4 Görsel Dünya, Karakter Animasyonu ve Sınıf Tasarımı
- **Özgün Öğrenci Karakteri**: Çocuk yaş grubuna uygun, animasyon filmi estetiğinde karakter çizimi (`characterRenderer.ts`). Canlı çift catchlight'lı badem gözler, sevimli yanak allığı, periyodik göz kırpma (blink) ve sıcak tebessüm. Selçuklu turkuazı yelek üzerinde sekiz köşeli altın yıldız rozeti ve deri sırt çantası. İki katmanlı eliptik zemin gölgesi (ortam + temas) ile tam zemin teması; yürümede doğal kol-bacak salınımı, beklemede ise yumuşak nefes alma animasyonu.
- **Kampüs Avlusunun Mimari Dönüşümü**: `courtyardSceneRenderer.ts` ile Selçuklu mukarnaslı anıtsal taç kapısı, çinili dilimli kubbeler, merkez sekiz köşeli yıldız meydanı, şadırvan havuzunda animasyonlu su parıltısı ve dalgalanma (`water shimmer`), rüzgârda salınan çok katmanlı selviler/bahçe ağaçları, Selçuklu sokak kandilleri, taş oturma bankları ve çiçek tarhları.
- **İngilizce Sınıfının Mekân Kurgusu**: `classroomSceneRenderer.ts` ile sıcak ahşap parke zemin, kemerli vitray pencerelerden vuran güneş ışığı huzmeleri (sunbeams), Selçuklu çinili duvar bordürü, İngilizce dünya haritası ve kelime posterleri, ahşap-pirinç kakma akıllı tahta (açılış radyal ışık dalgalanması, kapalıyken cam yansıması ve bekleme LED'i), öğretmen kürsüsü, kitaplık ve öğrenci sıraları.
- **Erişilebilirlik ve Sıfır Ek Bağımlılık**: Bütün çevresel animasyonlar `prefers-reduced-motion` tercihine duyarlıdır; harici ağır oyun motorları (Phaser vb.) yerine hafif Canvas 2D motoru sürdürülmüş ve parça boyutu yalnızca `48.09 kB` (gzip: `13.06 kB`) seviyesinde tutulmuştur. AABB çarpışma sınırları ve kapı koordinatları %100 korunmuştur.

## 7. Aşama 4.2 — Sinematik Görsel Entegrasyon ve Katmanlı Derinlik (Y-Sorting) Mimarisi

### 7.1. Katmanlı Çizim ve Derinlik Sıralaması (Y-Sorting)
Tek perspektif bir görselin tuvale gerilip üzerine karakter gezdirilmesini engelleyen; gerçek 2,5B animasyon filmi derinliği sunan 3 aşamalı katman mimarisi (`WalkableCanvasEngine.ts`, `courtyardSceneRenderer.ts`):
1. **Arka Plan Katmanı (`onRenderBackground`)**:
   - Geometrik taş zemin ızgarası ve degrade ışık geçişi.
   - Kuzey sınırı Selçuklu taş kemerli surları ve mazgalları.
   - 5 ana taş döşeli yürüyüş yolu.
   - Sekiz köşeli Selçuklu yıldız taban mozaiği ve dış mermer bordür.
   - Zemin çiçek tarhları (lavanta ve gül hatmi).
2. **Navigasyon Yolu Katmanı (`drawPathOverlay`)**:
   - Tıklayarak yürümede A* rotası zemin üzerine, fakat dikey varlıkların altına çizilir.
3. **Varlık ve Karakter Derinlik Sıralaması Katmanı (`onRenderEntities`)**:
   - Tüm binalar, merkez şadırvan mermer haznesi ve fıskiye su jeti, bahçe bankları, servi ağaçları ve öğrenci karakteri zemin temas çizgilerine (`baseY`) göre anlık olarak sıralanır (`entities.sort((a, b) => a.baseY - b.baseY)`).
   - Karakter bir şadırvanın veya ağacın kuzeyindeyken (`player.baseY < entity.baseY`) varlığın arkasında, güneyine geçtiğinde ise önünde çizilir.
4. **Ön Plan ve Sinematik Çerçeve Katmanı (`onRenderForeground`)**:
   - Tuvalin sol-üst ve sağ-üst köşelerinden sarkan sinematik yaprak saçağı (`drawCanopyBranch`).
   - Sol-üstten avluya vuran yumuşak gün ışığı demetleri (`drawCinematicSunbeams`).

### 7.2. Konsept Sanatına Tam Uyumlu Karakter Tasarımı
Onaylanan konsept görseli (`digital_campus_courtyard_concept.jpg`) referans alınarak:
- Mercan kırmızı fermuarlı kapüşonlu ceket (`#dc2626`, `#ef4444`, `#b91c1c`).
- Güneş sarısı iç tişört (`#fde047`) üzerinde altın rengi Selçuklu sekiz köşeli yıldız rozeti.
- Koyu indigo denim kot pantolon (`#2563eb`).
- Kırmızı-beyaz spor ayakkabılar (temiz beyaz burun ve kauçuk taban).
- Turkuaz/mavi çocuk okul sırt çantası (`#0284c7`).
- İki yandan sarkan kırmızı tokalı sevimli örgüler / atkuyrukları.
- 4 yönlü yürüyüş salınımı ve 3.8 saniyede bir göz kırpan canlı badem gözler.

### 7.3. Modüler Varlık Kütüphanesi (`public/assets/walkable/`)
SVG formatında üretilen 9 ana varlık dosyası:
- `building_english.svg` (220×180)
- `building_library.svg` (240×170)
- `building_discovery.svg` (220×180)
- `pavilion_journey.svg` (190×140)
- `kiosk_missions.svg` (190×140)
- `plaza_star_fountain.svg` (340×340)
- `tree_cypress.svg` (70×180)
- `tree_shade.svg` (120×150)
- `foliage_canopy.svg` (320×160)

### 7.4. Aşama 4.3 — Sinematik Avlu Dönüşümü ve Bağımsız Görsel Varlık Mimarisi
Aşama 4.3 kapsamında, konsept görseli (`digital_campus_courtyard_concept.jpg`) referans alınarak kampüs avlusunun tüm temel unsurları 3D animasyon filmi estetiğinde bağımsız, şeffaf arka planlı PNG görsel varlıklarına dönüştürülmüş ve Canvas 2D render motoruna `drawImage` ile entegre edilmiştir:
1. **Bağımsız PNG Varlıkları (`public/assets/walkable/` ve `src/features/walkable/assets/`)**:
   - `building_english.png` (268×292 px render; Selçuklu turkuaz çinili dilimli kubbe, mukarnas taç kapı, asılı fener ve pirinç tokmaklı kapı).
   - `building_discovery.png` (284×232 px render; Pişmiş toprak kiremit kubbe, Selçuklu zencerek kabartmalı portal ve sancak).
   - `building_library.png` (276×280 px render; Altın kumtaşı sekizgen kümbet, piramidal külah, vitray pencereler ve mukarnas portal).
   - `pavilion_journey.png` (235×260 px render; Açık Selçuklu çalışma köşkü, mermer sütunlar ve açık el yazması defter).
   - `kiosk_missions.png` (210×270 px render; Oyma taş ayaklı, ahşap saçaklı görev bülten panosu ve balmumu mühürlü parşömenler).
   - `plaza_star_fountain.png` (250×179 px render; Sekiz köşeli Selçuklu yıldız mermer havuzu, turkuaz çini bordürler ve kademeli şadırvan).
   - `tree_cypress.png` (64×218 px render; Zengin katmanlı zümrüt serviler, sol kenar güneş vurgusu ve gölge).
   - `tree_shade.png` (200×185 px render; Geniş gölgeli Akdeniz çınarı/ıhlamuru, hacimli yaprak öbekleri ve organik gövde).
2. **Asset Loader & Önbellek Mimarisi (`assetLoader.ts`)**:
   - `preloadWalkableAssets` fonksiyonu tüm varlıkları uygulama açılışında `new Image()` ile arka planda belleğe alır.
   - `getLoadedAsset` görselin `img.complete && img.naturalWidth > 0` durumunu denetleyerek tuvalde yarım/bozuk çizimi önler.
   - Varlık yüklenene kadar veya JSDOM test ortamlarında mevcut Canvas 2D vektör çizim kodu yedek (fallback) olarak çalışmaya devam eder.
3. **Y-Sorting ve Çarpışma Bütünlüğü**:
   - Tüm binalar, yapılar ve ağaçlar mevcut AABB çarpışma sınırları (`SceneObstacle`), A* yol bulma ızgarası ve etkileşim yarıçapları (`InteractiveZone`) ile milimetrik olarak hizalanmıştır.

### 7.5. Aşama 4.4 — Öğrenci Karakterinin Sinematik Dönüşümü ve Sprite Atlas Mimarisi
Aşama 4.4 kapsamında, avludaki görsel devrime paralel olarak öğrenci karakteri de geometrik Canvas 2D çizimlerinden konsept sanatındaki (`digital_campus_courtyard_concept.jpg`) 10 yaşındaki kız öğrenci karakterine tam uyumlu, 3D animasyon estetiğinde bağımsız bir Sprite Atlas sistemine dönüştürülmüştür:
1. **Sprite Atlas Mimarisi (`character_student_atlas.png`)**:
   - Dosya konumları: `public/assets/walkable/character_student_atlas.png` ve `src/features/walkable/assets/character_student_atlas.png`.
   - Çözünürlük: 560×720 piksel. 4 sütun × 4 satır ızgara; her hücre 140×180 pikseldir.
   - Saydam arka plan (RGBA) ve pürüzsüz kenar yumuşatma (anti-aliasing) ile üretilmiştir.
   - **Satır Düzeni (Yönler)**:
     - `Satır 0 (y: 0 - 179)`: Down (Güney / Ön Bakış)
     - `Satır 1 (y: 180 - 359)`: Up (Kuzey / Arka Bakış)
     - `Satır 2 (y: 360 - 539)`: Right (Doğu / Sağ Profil)
     - `Satır 3 (y: 540 - 719)`: Left (Batı / Sol Profil)
   - **Sütun Düzeni (Animasyon Kareleri)**:
     - `Sütun 0 (x: 0 - 139)`: Idle (Bekleme duruşu)
     - `Sütun 1 (x: 140 - 279)`: Step 1 (Sol ayak adım)
     - `Sütun 2 (x: 280 - 419)`: Passing (Geçiş duruşu)
     - `Sütun 3 (x: 420 - 559)`: Step 2 (Sağ ayak adım)
     - Yürüme esnasında kare akışı `[1, 2, 3, 2]` döngüsüyle 140 ms'de bir güncellenerek organik adım salınımı sağlanır.
2. **Ayak Hizalaması ve AABB Çarpışma Uyumu (`characterRenderer.ts`)**:
   - Karakter tuval üzerinde `renderW: 46 px, renderH: 58 px` boyutlarında çizilir.
   - Karakterin görsel ayak tabanı tam olarak `y + 18` zemin çizgisine ve temas gölgesi elipsine oturur (`renderY = y + 18 - renderH + 3 + bobY`).
   - Bu hizalama mevcut AABB çarpışma kutusu (`DEFAULT_HITBOX`: genişlik 22, yükseklik 28, ofset `y - 14` / `y + 14`) ve A* yol bulma sistemiyle %100 örtüşür.
3. **Y-Sorting Derinliği**:
   - Karakterin `baseY` koordinatı (`player.y + 18`), sahnede yer alan binalar, şadırvan haznesi ve peyzaj ağaçlarının `baseY` değerleriyle dinamik olarak karşılaştırılır. Karakter nesnelerin kuzeyindeyken arkada, güneyindeyken önde çizilir.
4. **Varlık Önbellekleme ve Fallback**:
   - Atlas, sahne başlangıcında `preloadWalkableAssets` ve `getStudentCharacterAtlas()` ile taranır. Atlas yüklenene kadar veya headless test ortamlarında vektörel yedek (`drawVectorFallbackCharacter`) kesintisiz devreye girer.

### 7.6. Aşama 4.5 — Karakter Ölçeği, Animasyon ve Görsel Uyum Mimarisi
Aşama 4.5 kapsamında, 3D animasyon karakterinin kampüsün mimari unsurları, ışıklandırması ve yürüyüş akışıyla bütünleşmesi için aşağıdaki teknik iyileştirmeler uygulanmıştır:
1. **Mimari Ölçek Optimizasyonu (`CHARACTER_SCALES`)**:
   - `original`: 46 × 58 px (taban başlangıç ölçüsü).
   - `scale10`: 51 × 64 px (%10 büyütme).
   - `scale15`: 53 × 67 px (%15 büyütme — seçilen en doğal oran).
   - `scale20`: 55 × 70 px (%20 büyütme — kapı açıklıklarına göre aşırı iri).
   - Seçilen `scale15` (53 × 67 px), Selçuklu taç kapısı kemer yüksekliğinin yaklaşık %85'ine oturur, 72–80 px genişliğindeki taş yollarda ferah geçiş sağlar ve mevcut 22 × 28 px AABB çarpışma kutusuyla milimetrik uyumunu sürdürür.
2. **Animasyon Senkronizasyonu ve Ritim Akıcılığı**:
   - `WalkableCanvasEngine.ts` ve `characterRenderer.ts` arasındaki `walkFrame` frekansı senkronize edilerek sabit `6.5` fps adım kadansı (`~153 ms/kare`) sağlandı.
   - 3D sprite atlası anatomik adım salınımını zaten içerdiğinden, dışarıdan uygulanan aşırı zıplama (`bobY = -2.2 px`) ve sallantı etkisi kaldırılarak ayakların zemine sağlam ve doğal basması sağlandı.
   - Çapraz hareketlerde yön satırları arasında titreşimi önlemek için 1.15 eşikli histerezis ölü bölgesi (`absX > absY * 1.15`) uygulandı.
3. **Çok Katmanlı Yönlü Temas Gölgesi ve Sabah Ambiyansı**:
   - **Gölge Katmanları**: Sol-üst sabah güneşi açısıyla sağ-alta hafifçe uzanan dış ortam gölgesi (`(1.8, 19)`, `18.5 × 7.8 px`), orta gövde gölgesi (`(1.0, 18.5)`, `12.5 × 5.0 px`) ve ayak tabanı koyu temas gölgesi (`(0, 18)`, `8.0 × 2.8 px`).
   - **Sabah Işığı Uyum Tonlaması**: Sprite üzerine `source-atop` ile uygulanan hafif altın sabah ışıması gradyanı (`rgba(255, 246, 214, 0.08)`) ile karakter sahneyle organik olarak bütünleştirildi.



