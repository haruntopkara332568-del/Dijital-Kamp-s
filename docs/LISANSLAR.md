# Lisanslar ve Varlık Kaynakları

## 1. Yazı Tipleri
Uygulama çalışma zamanında Google Fonts veya başka bir harici yazı tipi servisine istek göndermez. İşletim sistemi üzerinde yer alan standart sans-serif yazı tipi ailesi (`Avenir Next`, `Segoe UI`, `SF Pro`, `system-ui`) kullanılır. Ek yazı tipi lisansı gerektirmez.

## 2. Görseller ve Çizimler
- **Kampüs Giriş Kapısı, Avlu, Rehber Karakter, Örnek Görev Kapıları, Aksaray Durakları (`HeritageStopSvg.tsx`) ve Anadolu Motif Gösterimi (`AnatolianMotifSvg.tsx`)**: Tamamı bu proje kapsamında özgün SVG bileşenleri (`src/components/svg/`) olarak üretilmiştir. Tarihî yapılar birebir kopyalanmamış, geometrik esinlenmeyle sadeleştirilmiş özgün çizimler oluşturulmuştur.
- Harici görsel CDN veya stok fotoğraf kullanılmamıştır.

## 3. Simge Seti ve Açık Kaynak Bağımlılıklar
- **Lucide React (`lucide-react`)**: ISC Lisansı (yerel npm paketi olarak derlenir, çalışma zamanında harici istek yapmaz).
- **Vite, React, React Router, Tailwind CSS, Motion, Vitest, Playwright**: MIT / Apache-2.0 açık kaynak lisanslı paketler (`package.json` ve `package-lock.json` içinde sabitlenmiştir).

## 4. Ses Kayıtları

- Doktorun üç Türkçe repliği, [Seslen TTS](https://huggingface.co/seslen-tr/seslen-tts/tree/1fcd865) 0.3.16 modelinin Ayşe kadın sesiyle üretilmiş sentetik kayıtlardır. Kayıtlara seviye ayarı ve hafif filtre uygulanmıştır. 24 kHz mono WAV dosyaları [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) ile sunulur ve uygulamanın kendi alan adından yüklenir.
- Veterinerin replikleri aynı modelin Selin sesiyle, babanın replikleri Ege sesiyle üretilmiştir. Seviye ayarı ve hafif filtre uygulanan 24 kHz mono WAV kayıtları [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) ile sunulur.
