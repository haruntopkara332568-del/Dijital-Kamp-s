import type { CampusAreaRecord } from '@/src/types/campus';

/**
 * Kampüs haritası ve erişim noktaları tamamen veri temellidir.
 * İlk sürümde 3 öğrenme alanı ve 2 yardımcı kampüs işlevi bulunur.
 * Gelecekte yeni bir öğrenme alanı eklendiğinde bu listeye yeni kayıt eklenmesi yeterlidir.
 */
export const CAMPUS_AREAS: CampusAreaRecord[] = [
  {
    id: 'gezi-ve-kesif',
    title: 'Gezi ve Keşif',
    shortTitle: 'Gezi ve Keşif',
    type: 'learning-area',
    status: 'active',
    route: '/alan/gezi-ve-kesif',
    summary: 'Çevrendeki yapıları, doğal ortamları ve kültürel izleri gözlemleyerek keşfet.',
    detailNote:
      'Bu alan gözlem, karşılaştırma ve çıkarım yapmanı destekler. İlk örnek görev "Kapıların Anlattığı Hikâye" ile birlikte 4 duraklı tematik dijital öğrenme rotası "Aksaray Kültürel Miras Rotası" da burada kullanıma hazırdır.',
    accentToken: 'gold',
    mapPosition: { xPercent: 22, yPercent: 34 },
    connectedToIds: ['ingilizce-dunyasi', 'gorev-panosu'],
    upcomingTopics: [
      // TODO: kaynak doğrulanacak
      'Aksaray Merkez kültürel miras rotası — Ulu Cami ve yakın çevre (Yakında)',
      'Anadolu şehirlerinden diğer gözlem durakları (Yakında)',
    ],
    source: 'Proje Sahibi Tasarım Dokümanı v3.2 & Aksaray İl Kültür ve Turizm Müdürlüğü',
    verificationStatus: 'dogrulandi',
    targetGrades: [2, 3, 4, 5, 6, 7],
    contentVersion: '1.1.0',
  },
  {
    id: 'ingilizce-dunyasi',
    title: 'İngilizce Dünyası',
    shortTitle: 'İngilizce Dünyası',
    type: 'learning-area',
    status: 'active',
    route: '/alan/ingilizce-dunyasi',
    summary: 'Yaşına uygun İngilizce kelimeleri ve günlük ifadeleri görsel eşleşmelerle öğren.',
    detailNote:
      'İngilizce Dünyası, öğrendiğin yeni kelimeleri sesli destek ve bağlam içi örneklerle pekiştirir. Aktif görevlerin Öğren adımları bu alanla bağlantılıdır.',
    accentToken: 'teal',
    mapPosition: { xPercent: 50, yPercent: 24 },
    connectedToIds: ['gezi-ve-kesif', 'kitap-ve-hikaye-dunyasi', 'gorev-panosu'],
    upcomingTopics: [
      'Günlük selamlaşma ve sınıf içi ifadeler (Yakında)',
      'Sayılar ve doğa kelimeleri kartları (Yakında)',
    ],
    source: 'Proje Sahibi Tasarım Dokümanı v3.2',
    verificationStatus: 'dogrulandi',
    targetGrades: [2, 3, 4, 5, 6, 7],
    contentVersion: '1.1.0',
  },
  {
    id: 'kitap-ve-hikaye-dunyasi',
    title: 'Kitap ve Hikâye Dünyası',
    shortTitle: 'Kitap ve Hikâye',
    type: 'learning-area',
    status: 'active',
    route: '/alan/kitap-ve-hikaye-dunyasi',
    summary: 'Gözlemlerini ve öğrendiklerini çizim, tasarım ve kısa yazılarla özgün ürüne dönüştür.',
    detailNote:
      'Okuma, yaratıcı düşünme, çizim ve yazma çalışmaları burada buluşur. Aktif görevlerin Üret ve Paylaş adımları bu alanla bağlantılıdır.',
    accentToken: 'sage',
    mapPosition: { xPercent: 78, yPercent: 34 },
    connectedToIds: ['ingilizce-dunyasi', 'gorev-panosu'],
    upcomingTopics: [
      'Kısa okuma ve hikâye tamamlama atölyeleri (Yakında)',
      'Kendi resimli kartını oluşturma dizileri (Yakında)',
    ],
    source: 'Proje Sahibi Tasarım Dokümanı v3.2',
    verificationStatus: 'dogrulandi',
    targetGrades: [2, 3, 4, 5, 6, 7],
    contentVersion: '1.1.0',
  },
  {
    id: 'gorev-panosu',
    title: 'Keşif Görevleri Panosu',
    shortTitle: 'Görev Panosu',
    type: 'utility',
    status: 'active',
    route: '/alan/gorev-panosu',
    summary: 'Üç öğrenme alanını birleştiren görev yolculuklarını seç ve başlat.',
    detailNote:
      'Burada bütünleşik öğrenme görevlerini görebilirsin. "Kapıların Anlattığı Hikâye" ve "Aksaray Kültürel Miras Rotası" görevleri kullanıma hazırdır.',
    accentToken: 'teal',
    mapPosition: { xPercent: 36, yPercent: 72 },
    connectedToIds: ['gezi-ve-kesif', 'ingilizce-dunyasi', 'kitap-ve-hikaye-dunyasi', 'kampus-yolculugum'],
    source: 'Proje Sahibi Tasarım Dokümanı v3.2',
    verificationStatus: 'dogrulandi',
    targetGrades: [2, 3, 4, 5, 6, 7],
    contentVersion: '1.1.0',
  },
  {
    id: 'kampus-yolculugum',
    title: 'Kampüs Yolculuğum',
    shortTitle: 'Yolculuğum',
    type: 'utility',
    status: 'active',
    route: '/yolculugum',
    summary: 'Başladığın görevleri, kaydettiğin çizimleri ve öz değerlendirmelerini incele.',
    detailNote:
      'Tüm çalışmaların yalnızca bu cihazdaki tarayıcıda saklanır. Buradan yarım kalan görevine dönebilir, çalışmalarını PNG olarak indirebilir veya verilerini silebilirsin.',
    accentToken: 'slate',
    mapPosition: { xPercent: 64, yPercent: 72 },
    connectedToIds: ['gorev-panosu'],
    source: 'Proje Sahibi Tasarım Dokümanı v3.2',
    verificationStatus: 'dogrulandi',
    targetGrades: [2, 3, 4, 5, 6, 7],
    contentVersion: '1.0.0',
  },
];

export function getCampusAreaById(id: string): CampusAreaRecord | undefined {
  return CAMPUS_AREAS.find((area) => area.id === id);
}

export function getLearningAreas(): CampusAreaRecord[] {
  return CAMPUS_AREAS.filter((area) => area.type === 'learning-area');
}

export function getUtilityAreas(): CampusAreaRecord[] {
  return CAMPUS_AREAS.filter((area) => area.type === 'utility');
}
