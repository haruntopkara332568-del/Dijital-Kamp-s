import type { SupportedGrade } from '@/src/types/campus';

export const PILOT_TITLE = 'Gökyüzünde İlk Görevim';

export const PILOT_APRON = {
  width: 960,
  height: 640,
  spawn: { x: 472, y: 485 },
  captainSpawn: { x: 532, y: 460 },
  boardingStudent: { x: 615, y: 362 },
  boardingCaptain: { x: 644, y: 373 },
};

export type PilotLine = { speaker: 'captain' | 'student'; text: string };

export const PILOT_INTRO = [
  'Merhaba! Ben kaptan pilotum. Uçağı güvenli bir şekilde yönetirim.',
  'Şimdi sıra sende! Uçağımızı birlikte uçuralım.',
] as const;

export type PilotCheckpoint = { x: number; height: number; z: number; label: string; guidance: string };
export const PILOT_COURSES: Record<SupportedGrade, {
  tolerance: number;
  drift: number;
  points: readonly PilotCheckpoint[];
}> = {
  2: {
    tolerance: 31,
    drift: 0,
    points: [
      { x: 73, height: 102, z: 275, label: 'Sağdaki halka', guidance: 'Sağa yönel ve ilk halkadan geç.' },
      { x: 73, height: 167, z: 550, label: 'Yüksekteki halka', guidance: 'Yukarı tuşuyla ikinci halkaya yüksel.' },
      { x: -13, height: 167, z: 825, label: 'Soldaki halka', guidance: 'Sola yönel ve son halkadan geç.' },
    ],
  },
  3: {
    tolerance: 24,
    drift: 0,
    points: [
      { x: 81, height: 102, z: 290, label: 'Vadi girişi', guidance: 'Sağa dön ve ilk halkadan geç.' },
      { x: 50, height: 171, z: 590, label: 'Bulut hizası', guidance: 'Yüksel ve haritadaki ikinci halkayı izle.' },
      { x: -64, height: 119, z: 890, label: 'Vadi çıkışı', guidance: 'Son halka için sola yönel ve alçal.' },
    ],
  },
  4: {
    tolerance: 17,
    drift: 7,
    points: [
      { x: 86, height: 124, z: 300, label: 'Vadi girişi', guidance: 'İlk halkaya küçük düzeltmelerle hizalan.' },
      { x: 19, height: 179, z: 630, label: 'Sırt geçidi', guidance: 'Yönünü ve yüksekliğini ikinci halkaya göre ayarla.' },
      { x: -90, height: 127, z: 970, label: 'Vadi çıkışı', guidance: 'Haritayı izle ve son halkaya hizalan.' },
    ],
  },
};

export const PILOT_LANDING = {
  line: 'Pistin orta çizgisiyle hizalanan yaklaşmayı seç.',
  feedback: 'Önündeki pistin orta çizgisi ile yaklaşma okunun hizalanmasına bak.',
  reason: 'Pistten yana doğru uzaklaşırsak neye bakarız?',
  reasons: ['Ön camdaki orta çizgiyi ve yön göstergesini izler, küçük bir düzeltme yaparız.', 'Yönümüz değişse de aynı şekilde devam ederiz.'],
  approach: 'Pistle hizalan ve yavaşça alçal.',
  flare: 'Pistle hizalandık. Şimdi iniyoruz.',
  complete: 'Tebrikler! İlk uçuşunu güvenli bir inişle tamamladın.',
};
