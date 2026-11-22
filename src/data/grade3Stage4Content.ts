import type { MissionStageId } from '@/src/types/campus';

export const SULTANHANI_WORDS = ['gate', 'door', 'wall', 'courtyard', 'stone'] as const;
export type SultanhanıWord = (typeof SULTANHANI_WORDS)[number];
export type SultanhanıLabel = Exclude<SultanhanıWord, 'stone'>;

export const GRADE_3_STAGE_4 = {
  id: 'welcome-to-sultanhani',
  grade: 3,
  title: 'Welcome to Sultanhanı!',
  stageLabel: '4. Aşama · Welcome to Sultanhanı!',
  stageHint: 'Aksaray Sultanhanı Kervansarayı’nın bölümlerini İngilizce keşfet.',
  place: 'Aksaray Sultanhanı Kervansarayı',
  titles: {
    kesfet: 'Find and Discover — Bul ve Keşfet',
    ogren: 'Look and Learn — Bak ve Öğren',
    uret: 'My Sultanhanı Card — Sultanhanı Kartım',
    paylas: 'Share My Card — Miras Kartımı Paylaş',
  } satisfies Record<MissionStageId, string>,
  words: { gate: 'Taç kapı çerçevesi', door: 'Giriş açıklığı', wall: 'Yan duvar', courtyard: 'Avlu zemini', stone: 'Taş yüzeyi' },
  sentences: [
    { id: 'gate', text: 'This is a gate.', description: 'Bu bir taç kapı.' },
    { id: 'door', text: 'This is a door.', description: 'Bu bir kapı.' },
    { id: 'wall', text: 'This is a wall.', description: 'Bu bir duvar.' },
    { id: 'courtyard', text: 'This is a courtyard.', description: 'Bu bir avlu.' },
    { id: 'stone-wall', text: 'This is a stone wall.', description: 'Bu bir taş duvar.' },
    { id: 'sultanhani', text: 'This is Sultanhanı.', description: 'Burası Sultanhanı.' },
  ],
  listen: 'Dinle',
  retry: 'Tekrar dene!',
  choiceHint: 'Görseldeki bölüme dikkat et.',
  slotHint: 'Kelimenin anlattığı bölgeyi düşün.',
  highlight: 'Vurgulanan seçeneğe bak.',
  audioUnavailable: 'Ses bu cihazda kullanılamıyor.',
  empty: 'Bu masanın etkinliği şu anda açılamıyor.',
  error: 'Etkinlik şu anda açılamadı.',
  menu: 'Sınıfa dön',
  locked: 'Önce önceki masanın etkinliğini tamamla.',
  finished: 'Tamamlandı',
  session: 'İlerleme bu oturumda tutuluyor.',
  placeholder: 'GÖRSEL BEKLENİYOR',
  illustrationNote: 'Görsel: illüstrasyon',
  views: { exterior: 'Dış cephe', courtyard: 'İç avlu' },
  mapOptions: 'Bölge seçenekleri',
  discover: {
    inspect: 'Bir bölgeye dokun ve kelimesini öğren.',
    beginFinding: 'Bulmaya başla',
    find: 'Duyduğun kelimenin yerini bul.',
    // A different order from the visual tour, with each target appearing once.
    sequence: ['courtyard', 'wall', 'door', 'stone', 'gate'] as const,
  },
  learn: {
    choose: 'Görsele uygun cümleyi seç.',
    fill: 'Cümleyi uygun kelimeyle tamamla.',
    match: 'Bir cümleye, sonra uygun görsele dokun.',
    review: 'Kısa tekrar',
    fillPattern: 'This is a ___.',
    choices: [
      { target: 'gate', options: ['door', 'gate', 'wall'] },
      { target: 'door', options: ['door', 'courtyard', 'gate'] },
      { target: 'wall', options: ['stone-wall', 'door', 'wall'] },
      { target: 'courtyard', options: ['wall', 'courtyard', 'stone-wall'] },
    ],
    fills: [
      { target: 'door', options: ['gate', 'wall', 'door'] },
      { target: 'courtyard', options: ['courtyard', 'gate', 'door'] },
      { target: 'wall', options: ['door', 'wall', 'courtyard'] },
    ],
    matchSentences: ['stone-wall', 'courtyard', 'gate', 'sultanhani'],
    matchImages: ['exterior', 'gate', 'stone', 'courtyard'],
    matchTargets: { 'stone-wall': 'stone', courtyard: 'courtyard', gate: 'gate', sultanhani: 'exterior' },
  },
  produce: {
    chooseView: 'Bir görünüm seç.',
    placeLabels: 'Bir kelimeye ve sonra görseldeki yuvasına dokun. Etikete tekrar dokunarak çıkar.',
    chooseSentences: 'Kartın için bir veya iki cümle seç.',
    ready: 'Kartım hazır',
    saved: 'Kartın bu profilde kaydedildi. Paylaş masasında açabilirsin.',
  },
  share: {
    empty: 'Önce Üret masasında kartını hazırla.',
    download: 'PNG indir',
    filename: 'welcome-to-sultanhani.png',
    saveError: 'Kart şu anda kaydedilemedi, tekrar dene.',
    touchSave: 'Resmi basılı tutup kaydet.',
  },
} as const;
export type SultanhanıSentence = (typeof GRADE_3_STAGE_4.sentences)[number]['id'];

export function sultanhaniSentence(id: SultanhanıSentence) {
  return GRADE_3_STAGE_4.sentences.find((sentence) => sentence.id === id)!;
}
