import type { Position } from '@/src/features/walkable/types';

export type DoctorSpeaker = 'guide' | 'patient' | 'student';
export type ClinicDemo = 'heartbeat' | 'thermometer';

export type DoctorLine = {
  kind: 'line';
  speaker: DoctorSpeaker;
  text: string;
  demo?: ClinicDemo;
};

export type DoctorChoice = { text: string; correct: boolean };
export type DoctorTurn = DoctorLine | {
  kind: 'choice';
  prompt: string;
  hint: string;
  options: readonly DoctorChoice[];
};

type DoctorStation = {
  name: string;
  prompt: string;
  position: Position;
  marker: Position;
};

export const DOCTOR_ROOM = {
  width: 960,
  height: 640,
  playerSpawn: { x: 472, y: 514 },
  guide: { x: 397, y: 402 },
  patient: { x: 690, y: 437 },
  exit: { x: 480, y: 608, radius: 34 },
} as const;

const stations = {
  stethoscope: {
    name: 'Stetoskop', prompt: 'Stetoskobu İncele',
    position: { x: 86, y: 496 }, marker: { x: 82, y: 309 },
  },
  thermometer: {
    name: 'Termometre', prompt: 'Termometreyi İncele',
    position: { x: 173, y: 454 }, marker: { x: 169, y: 303 },
  },
  patient: {
    name: 'Deniz', prompt: 'Deniz ile Konuş',
    position: { x: 660, y: 451 }, marker: { x: 690, y: 389 },
  },
  heartModel: {
    name: 'Kalp sesi modeli', prompt: 'Kalp Sesi Örneğini Dinle',
    position: { x: 755, y: 444 }, marker: { x: 798, y: 228 },
  },
  temperatureModel: {
    name: 'Sıcaklık modeli', prompt: 'Örnek Ölçümü Başlat',
    position: { x: 755, y: 444 }, marker: { x: 798, y: 228 },
  },
  guide: {
    name: 'Rehber Doktor', prompt: 'Gözlemlerini Paylaş',
    position: { x: 425, y: 421 }, marker: { x: 397, y: 335 },
  },
} satisfies Record<string, DoctorStation>;

export const DOCTOR_SPEAKER_NAMES: Record<DoctorSpeaker, string> = {
  guide: 'Rehber Doktor',
  patient: 'Deniz',
  student: 'Sen',
};

const say = (speaker: DoctorSpeaker, text: string, demo?: ClinicDemo): DoctorLine => ({ kind: 'line', speaker, text, demo });

export const DOCTOR_VISIT_STEPS: readonly {
  station?: DoctorStation;
  instruction: string;
  turns: readonly DoctorTurn[];
}[] = [
  {
    instruction: 'Rehber doktoru dinle.',
    turns: [
      say('guide', 'Hoş geldin! Bugün bir çocuk doktorunun muayene odasını keşfedeceğiz.'),
      say('guide', 'Önce sol tezgahtaki stetoskoba, sonra yanındaki termometreye yaklaş. Parlayan işaret sana yolu gösterecek.'),
    ],
  },
  {
    station: stations.stethoscope,
    instruction: 'Sol tezgahtaki stetoskoba yaklaş.',
    turns: [
      say('guide', 'Bu alet stetoskop. Doktorlar onunla kalp ve solunum seslerini dinler.'),
    ],
  },
  {
    station: stations.thermometer,
    instruction: 'Tezgahta stetoskopun yanındaki termometreye yaklaş.',
    turns: [
      say('guide', 'Termometre sıcaklığı ölçen bir araçtır. Buradaki araçları eğitim modelinde deneyeceğiz.'),
    ],
  },
  {
    station: stations.patient,
    instruction: 'Muayene yatağının önünde bekleyen Deniz’e yaklaş.',
    turns: [
      say('patient', 'Merhaba, ben Deniz. Biraz heyecanlıyım.'),
      {
        kind: 'choice',
        prompt: 'Deniz’e ne söylemek istersin?',
        hint: 'Deniz’in hazır olup olmadığını nazikçe sorabilirsin.',
        options: [
          { text: 'Hemen başlayalım.', correct: false },
          { text: 'Merhaba Deniz! Hazır olduğunda birlikte deneyelim.', correct: true },
        ],
      },
      say('patient', 'Teşekkür ederim. Şimdi hazırım!'),
      say('guide', 'Deniz’in yanındaki eğitim cihazında önce kalp sesi örneğini, sonra temsili sıcaklık ölçümünü açabilirsin.'),
    ],
  },
  {
    station: stations.heartModel,
    instruction: 'Deniz’in sağındaki eğitim cihazında kalp sesi örneğini aç.',
    turns: [
      say('guide', 'Eğitim modelinde iki vuruşluk bir kalp sesi örneği var. Ekrandaki işareti de izleyebilirsin.', 'heartbeat'),
    ],
  },
  {
    station: stations.temperatureModel,
    instruction: 'Aynı eğitim cihazında örnek ölçümü başlat.',
    turns: [
      say('guide', 'Eğitim modelinin sıcaklık ölçümü tamamlandı. Cihaz, ölçümün bittiğini bir işaretle bildiriyor.', 'thermometer'),
    ],
  },
  {
    station: stations.guide,
    instruction: 'Rehber doktora dön ve gözlemlerini anlat.',
    turns: [
      say('guide', 'Eğitim cihazında iki aracı da denedin. Araçların ne işe yaradığını nasıl anlatırsın?'),
      {
        kind: 'choice',
        prompt: 'Gözlemini seç.',
        hint: 'Hangi araç sesleri dinlemek, hangisi sıcaklığı ölçmek için kullanılır?',
        options: [
          { text: 'Stetoskopla sesleri dinleriz, termometreyle sıcaklığı ölçeriz.', correct: true },
          { text: 'Termometreyle sesleri dinleriz, stetoskopla sıcaklığı ölçeriz.', correct: false },
        ],
      },
      say('guide', 'Gözlemlerini açıkça anlattın. Muayene odası keşfini tamamladın!'),
    ],
  },
];
