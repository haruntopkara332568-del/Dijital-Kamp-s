# Lisanslar ve Varlık Kaynakları

## 1. Yazı Tipleri
Uygulama çalışma zamanında Google Fonts veya başka bir harici yazı tipi servisine istek göndermez. İşletim sistemi üzerinde yer alan standart sans-serif yazı tipi ailesi (`Avenir Next`, `Segoe UI`, `SF Pro`, `system-ui`) kullanılır. Ek yazı tipi lisansı gerektirmez.

## 2. Görseller ve Çizimler
- **Kampüs Giriş Kapısı, Avlu, Rehber Karakter ve Örnek Görev Kapıları**: Tamamı bu proje kapsamında özgün SVG bileşenleri (`src/components/svg/`) olarak üretilmiştir. Tarihî yapılar birebir kopyalanmamış, geometrik esinlenmeyle sadeleştirilmiş özgün çizimler oluşturulmuştur.
- Harici görsel CDN veya stok fotoğraf kullanılmamıştır.

## 3. Simge Seti ve Açık Kaynak Bağımlılıklar
- **Lucide React (`lucide-react`)**: ISC Lisansı (yerel npm paketi olarak derlenir, çalışma zamanında harici istek yapmaz).
- **Vite, React, React Router, Tailwind CSS, Motion, Vitest, Playwright**: MIT / Apache-2.0 açık kaynak lisanslı paketler (`package.json` ve `package-lock.json` içinde sabitlenmiştir).
