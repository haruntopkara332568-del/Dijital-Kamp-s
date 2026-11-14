# GEMINI.md — Proje Çalışma Kuralları

Bu dosya `AGENTS.md` ile tam uyumludur. Projede değişiklik yapmadan önce aşağıdaki kurallar uygulanır:

1. **Veri ve Bileşen Ayrımı**: Yeni görev, kelime, diyalog veya öğrenme alanı eklerken yalnızca `src/data/` altındaki dosyalar genişletilir; sınıf düzeyi farklılıkları `src/data/gradeProfiles.ts` üzerinden yönetilir.
2. **Dil ve İsimlendirme**: Kod tanımlayıcıları İngilizce, kullanıcı arayüzü metinleri ve `docs/` belgeleri TDK kurallarına uygun Türkçe yazılır.
3. **Gizlilik ve İzinler**: Öğrenciden kişisel veri istenmez; harici font/CDN/izleme isteği yapılmaz; ilk sürümde sunucu veya yapay zekâ çağrısı eklenmez.
4. **SVG Stil İlkesi**: Özgün SVG bileşenlerinde yalnızca `src/styles/globals.css` içindeki tasarım renk belirteçleri kullanılır.
5. **Doğrulama**: Her değişiklik sonunda `npm run typecheck`, `npm run lint`, `npm run test` ve `npm run build` çalıştırılıp gerçek sonuçlar `docs/DURUM.md` ve `docs/TEST_RAPORU.md` dosyalarına işlenir.
