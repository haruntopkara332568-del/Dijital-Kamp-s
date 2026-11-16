# İçerik ve Genişletme Rehberi

Bu belge, yazılıma yeni bir öğrenme alanı, diyalog veya görev eklemek isteyen geliştiriciler ve içerik sorumluları için hazırlanmıştır.

## 1. Yeni Öğrenme Alanı Ekleme
`src/data/campusAreas.ts` dosyasındaki `CAMPUS_AREAS` dizisine yeni bir kayıt eklemeniz yeterlidir. Harita bağlantıları ve yönlendirme kartları otomatik oluşur:

```ts
{
  id: 'bilim-atolyesi',
  title: 'Bilim ve Gözlem Atölyesi',
  shortTitle: 'Bilim Atölyesi',
  type: 'learning-area',
  status: 'coming-soon', // Hazır olunca 'active' yapılır
  route: '/alan/bilim-atolyesi',
  summary: 'Doğadaki olayları gözlem ve deneylerle incele.',
  detailNote: 'Alan açıklaması...',
  accentToken: 'teal',
  mapPosition: { xPercent: 50, yPercent: 52 },
  connectedToIds: ['gezi-ve-kesif'],
  source: 'TODO: kaynak doğrulanacak',
  verificationStatus: 'TODO: kaynak doğrulanacak',
  targetGrades: [2, 3, 4, 5, 6, 7],
  contentVersion: '0.1.0',
}
```

## 2. Yeni Görev Ekleme
`src/data/missions.ts` içindeki `MISSIONS` dizisine `MissionDefinition` tipine uygun yeni bir görev eklenir:
- `id`, `title`, `version`, `status`
- `gradeRange` ve `relatedAreaIds`
- `learningObjectives` (`ilkokul` ve `ortaokul` gözlenebilir hedefler)
- `steps` (`KEŞFET → ÖĞREN → ÜRET → PAYLAŞ` sırasıyla `kesfet`, `ogren`, `uret`, `paylas`)
- `contentRefs`, `options`, `startConditions`, `completionConditions`, `selfEvaluation`
- `source` ve `verificationStatus`

## 3. Doğrulama Kuralı
Doğrulanmamış tarihî, kültürel veya bilimsel bilgi kesinlikle eklenmez. Kaynağı henüz kesinleşmeyen içeriklerde `verificationStatus: 'TODO: kaynak doğrulanacak'` alanı kullanılır ve son kullanıcıya gösterilmez.

