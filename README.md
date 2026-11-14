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
