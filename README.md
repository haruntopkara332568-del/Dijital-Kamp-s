# Dijital Eğitim Kampüsü (Sürüm 1.0 — Örnek Daireli Altyapı)

Türkiye'deki 2–7. sınıf öğrencilerine yönelik, Anadolu'nun kültürel mirasından esinlenen, güvenli, cihaz içi çalışan ve genişletilebilir dijital öğrenme kampüsü.

## Temel Özellikler (İlk Sürüm)
- **Kampüs Giriş Kapısı**: Anadolu taş işçiliği ve Selçuklu geometrik motiflerinden esinlenen özgün SVG kapı, açılma animasyonu, animasyonu atlama seçeneği ve `prefers-reduced-motion` desteği.
- **Karşılama Avlusu ve Akran Rehber**: Onaylanmış karşılama metni, "Birlikte gezelim" / "Kendim keşfedeceğim" seçimi, `2–7. sınıf` seçimi ve sınıf düzeyine uyarlanan rehberli tur.
- **Etkileşimli Kampüs Haritası**: Veri temelli 3 öğrenme alanı (`Gezi ve Keşif`, `İngilizce Dünyası`, `Kitap ve Hikâye Dünyası`) ve 2 yardımcı işlev (`Keşif Görevleri Panosu`, `Kampüs Yolculuğum`).
- **Örnek Bütünleşik Görev — Kapıların Anlattığı Hikâye**: `KEŞFET → ÖĞREN → ÜRET → PAYLAŞ` aşamalarıyla İlkokul (2–4) ve Ortaokul (5–7) düzeylerine uyarlanmış görev akışı.
- **Çizim ve Tasarım Stüdyosu**: Pointer Events tabanlı serbest çizim, hazır şekiller, klavyeyle şekil taşıma, geri alma ve tek PNG dosyasına Türkçe karakter destekli dışa aktarma.
- **Gizlilik ve Veri Güvenliği**: Kişisel veri toplamaz, harici ağ isteği yapmaz; tüm kayıtlar tarayıcıda (`localStorage` + `IndexedDB`) tutulur ve iki adımlı "Verilerimi Sil" ile temizlenebilir.

## Kurulum ve Komutlar
```bash
npm ci
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:e2e
```

## GitHub Üzerinden Sürüm Yönetimi ve Güncelleme Süreci
- **Depo Yapısı ve Sürüm Sabitleme**: Proje kaynak kodları, çalışma zamanı Node.js sürümü (`.nvmrc` içinde `22`, `package.json` `engines` alanında `>=22.0.0 <23.0.0`) ve bağımlılık kilidi (`package-lock.json`) GitHub deposunda sürüm denetimi altında tutulur. `node_modules/`, `dist/`, `.env*` ve geçici test çıktıları `.gitignore` ile depo dışında bırakılır.
- **Güncelleme Akışı**:
  1. Yeni içerik, hata düzeltmesi veya iyileştirme çalışmaları ayrı bir geliştirme dalında (`branch`) yapılır.
  2. Eğitim içerikleri `src/data/` altında, görsel bileşenler `src/components/svg/` altında ve mimari/durum belgeleri `docs/` altında güncellenir.
  3. Onaylanmış karşılama metni, görev aşamaları (`KEŞFET → ÖĞREN → ÜRET → PAYLAŞ`) ve cihaz içi depolama anahtarları (`dek_campus_v1_state`, `dek_campus_db`) korunur.
  4. Öğrenci geçerli bir özgün ürün oluşturduğunda cihaz depolama hatası yaşansa bile öğrenme görevinden başarısız sayılmaması; ancak çalışmanın kalıcı kaydedilemediğinin açıkça bildirilip PNG indirme seçeneğinin sunulması ilkesi sürdürülür.
- **Birleştirme Öncesi Doğrulama**: Değişiklikler `main` dalına alınmadan önce yerel ortamda veya CI üzerinde aşağıdaki kontrollerin eksiksiz geçmesi gerekir:
  - `npm run typecheck` (`tsc --noEmit`)
  - `npm run lint` (`eslint .`)
  - `npm run test` (`vitest run`)
  - `npm run build` (`vite build`)
  - `npm run test:e2e` (`playwright test`)
  - Gerçek komut çıktılarının `docs/DURUM.md` ve `docs/TEST_RAPORU.md` dosyalarına işlenmesi.

## Vercel Üzerinden Derleme ve Yayımlama Süreci
- **Statik SPA Yapılandırması (`vercel.json`)**:
  - **Framework**: `vite`
  - **Derleme Komutu (`buildCommand`)**: `npm run build`
  - **Çıktı Dizini (`outputDirectory`)**: `dist`
  - **Node.js Sürümü**: `.nvmrc` (`22`) ve `package.json` `engines` tanımı ile uyumlu `22.x`.
  - **İstemci Yönlendirme (`rewrites`)**: Tüm alt rotaların (`/harita`, `/alan/:id`, `/gorev/:id`, `/yolculugum`) doğrudan tarayıcıdan açıldığında hata vermemesi için `/(.*) -> /index.html` kuralı tanımlıdır.
  - **Güvenlik Başlıkları (`headers`)**: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` ve `Permissions-Policy: camera=(), microphone=(), geolocation=()` başlıkları `vercel.json` içinde yapılandırılmıştır.
- **Yayımlama Adımları**:
  1. GitHub deposu Vercel projesine bağlanır ve kök dizin proje kökü olarak bırakılır.
  2. İlk sürüm tamamen istemci tarafında çalıştığı için zorunlu bir sunucu ortam değişkeni veya API anahtarı bulunmaz (referans şablon: `.env.example`).
  3. Özellik dallarına açılan her Pull Request için Vercel otomatik önizleme yayımı (*Preview Deployment*) üretir; görsel ve rota kontrolleri bu önizleme üzerinden doğrulanır.
  4. `main` dalına yapılan birleştirmeler üretim ortamına (*Production Deployment*) aktarılır. Yayım sonrası giriş ekranı, doğrudan rota erişimleri ve PNG dışa aktarma akışı kontrol edilir.

## Hukuki Değerlendirme Gerektiren Konular
> **Not:** Bu bölüm, uygulamanın kamuya açık yayımı öncesinde ilgili alan uzmanları ve hukuk danışmanları tarafından incelenmesi gereken başlıkları listelemek amacıyla hazırlanmıştır. Burada yer alan maddeler kesinleşmiş bir hukuki uygunluk beyanı, resmî onay iddiası veya bağlayıcı mevzuat yorumu niteliği taşımaz.

1. **Kişisel Verilerin Korunması**:
   - Uygulama tasarım gereği öğrenci adı, soyadı, okul numarası, e-posta, telefon, adres, konum, kamera veya mikrofon verisi istemez; tercihler ve çalışmalar tarayıcı içinde (`localStorage` / `IndexedDB`) tutulur ve iki adımlı "Verilerimi Sil" işleviyle temizlenebilir.
   - Buna karşın kamuya açık bir eğitim platformu yayını öncesinde; cihaz içi saklanan verilerin uygulanacak kişisel veri mevzuatı kapsamındaki durumu, aydınlatma metni gereksinimi ve ebeveyn/okul bilgilendirme süreçleri hukuk uzmanlarınca değerlendirilmelidir.
2. **Çocukların Dijital Ortamda Güvenliği**:
   - Hedef kitle Türkiye'deki 2–7. sınıf öğrencileri olduğundan; yaş grubuna uygunluk, reklamsız ve izleyicisiz yapı, herkese açık paylaşım/mesajlaşma kanallarının kapalı tutulması, cihaz içi seslendirme (`speechSynthesis`) kullanımının erişilebilirlik ve güvenlik boyutu ile veli/öğretmen yönlendirme metinlerinin çocukların çevrim içi güvenliği ilkeleri açısından gözden geçirilmesi gerekir.
3. **İçerik ve Görsel Telif Hakları**:
   - İlk sürümdeki SVG çizimler (`src/components/svg/`) proje kapsamında özgün olarak üretilmiş, tarihî yapılar birebir kopyalanmamış ve açık kaynak bağımlılıkların lisans bilgileri `docs/LISANSLAR.md` dosyasında belgelenmiştir.
   - İlerleyen aşamalarda eklenecek yeni eğitim içerikleri, kültürel anlatımlar, görseller veya örnek metinler için kaynak doğrulaması, alıntı/atıf kuralları ve fikrî mülkiyet hakları ayrıca incelenmelidir.
4. **Vercel Hizmetinin Veri İşleme ve Günlük Tutma Süreçleri**:
   - Uygulama arka uç veritabanı kullanmasa da statik dosyaların dağıtımı sırasında barındırma ve CDN sağlayıcısı olan Vercel altyapısında IP adresi, istek zamanı veya HTTP erişim günlükleri gibi teknik bağlantı verilerinin işlenip işlenmediği, günlük saklama süreleri, sunucu konumları ve hizmet sağlayıcı sözleşme/veri işleme ekleri yayım öncesinde değerlendirilmelidir.

