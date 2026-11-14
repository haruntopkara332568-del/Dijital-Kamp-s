# AGENTS.md — Dijital Eğitim Kampüsü Mimari ve Geliştirme Kuralları

Bu belge, projede çalışan tüm geliştiriciler ve yapay zekâ kodlama araçları için bağlayıcı kuralları içerir.

## 1. Proje Amacı ve Kapsamı
- **Hedef Kitle**: Türkiye'deki 2, 3, 4, 5, 6 ve 7. sınıf öğrencileri (İlkokul ve Ortaokul tek altyapıda).
- **Yaklaşım**: KEŞFET → ÖĞREN → ÜRET → PAYLAŞ (görev aşamaları) ve ROTA → KEŞİF → İNGİLİZCE → ÖZGÜN ÜRETİM (alan geçişleri).
- **Kişisel Veri İlkesi**: Öğrenciden ad, soyad, e-posta, telefon, adres, fotoğraf, konum, mikrofon veya kamera izni istenmez.

## 2. Klasör ve Modül Yapısı
- `index.html` ve `src/main.tsx`: Vite SPA giriş noktası.
- `src/app/`: Uygulama sağlayıcıları (`CampusProviders.tsx`), `createBrowserRouter` yönlendirme yapısı (`router.tsx`) ve sayfa kabukları (`/`, `/harita`, `/alan/:id`, `/gorev/:id`, `/yolculugum`).
- `src/data/`: Tüm eğitim içerikleri, sınıf profilleri (`gradeProfiles.ts`), kampüs alanları (`campusAreas.ts`), diyaloglar (`dialogues.ts`) ve görev tanımları (`missions.ts`). İçerikler bileşen içine gömülmez.
- `src/features/`: Özellik modülleri (`entrance`, `courtyard`, `guide`, `campus-map`, `learning-areas`, `missions`, `drawing`, `journey`).
- `src/components/`: Ortak arayüz ve özgün SVG bileşenleri (`src/components/svg/`).
- `src/services/`: Tarayıcı seslendirme (`speech.ts`) ve cihaz içi depolama (`storage.ts`).
- `src/utils/`: Tek PNG dışa aktarma oluşturucu (`pngExport.ts`).
- `docs/`: Mimari, durum, içerik rehberi, lisanslar ve test raporu belgeleri.
- `e2e/`: Playwright uçtan uca test senaryoları.

## 3. Mimari ve Güvenlik Kuralları
1. **Çalışma Zamanı Ağ Kısıtı**: Uygulama yalnızca kendi alan adından yüklenir. Google Fonts, harici CDN, analitik veya üçüncü taraf izleyici eklenmez.
2. **İstemci Tarafı Depolama**: Küçük tercih ve ilerlemeler sürüm numaralı `localStorage` (`dek_campus_v1_state`) içinde, çizimler `IndexedDB` (`dek_campus_db`) içinde tutulur.
3. **Verilerimi Sil**: Yalnızca `dek_` önekli anahtarları ve `dek_campus_db` veritabanını temizler; iki adımlı ve vazgeçilebilir onay gerektirir.
4. **Onaylı Metinler**: Karşılama metni ve örnek görev rehber soruları veri dosyalarında tanımlandığı biçimiyle korunur.
5. **Doğrulama Durumu**: Kaynağı doğrulanmamış tarihî/kültürel bilgi kullanıcıya sunulmaz; `TODO: kaynak doğrulanacak` ile işaretlenir.

## 4. Yapılmayacaklar
- Öğretmen paneli, üyelik/hesap sistemi, herkese açık galeri, sıralama tablosu, mesajlaşma veya reklam/takip ekleme.
- İlk sürümde yapay zekâ API'si (`@google/genai` vb.) veya sunucu veritabanı bağlama.
- İşlevsiz düğme veya tamamlanmış gibi gösterilen sahte "Yakında" etkileşimleri ekleme.
- Test edilmemiş komutu geçmiş gibi raporlama.
