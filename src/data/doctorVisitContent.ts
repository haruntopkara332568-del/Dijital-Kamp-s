import type { PlayerCharacter, Position } from '@/src/features/walkable/types';

export const DOCTOR_ROOM = {
  width: 960,
  height: 640,
  playerSpawn: { x: 472, y: 514 },
  guide: { x: 397, y: 402 },
  patient: { x: 690, y: 437 },
  exit: { x: 480, y: 608, radius: 34 },
} as const;

export const DOCTOR_STETHOSCOPE = {
  pickup: { x: 86, y: 496 },
  counter: { x: 82, y: 309 },
  approach: { x: 682, y: 462 },
  chest: { x: 690, y: 416 },
  reach: 61,
  contactRadius: 14,
} as const;

export const DOCTOR_HEARTBEAT_MS = 860;
export const DOCTOR_LISTEN_MS = 1950;

export function canReachDoctorPatient(position: Position) {
  const { approach, reach } = DOCTOR_STETHOSCOPE;
  return Math.hypot(position.x - approach.x, position.y - approach.y) <= reach;
}

export function doctorStethoscopeGrip({ x, y, direction }: Pick<PlayerCharacter, 'x' | 'y' | 'direction'>): Position {
  return { x: x + (direction === 'left' ? -15 : 15), y: y - 9 };
}

export type DoctorSpeaker = 'guide' | 'patient' | 'student';
export type DoctorLine = { speaker: DoctorSpeaker; text: string };

export const DOCTOR_SPEAKER_NAMES: Record<DoctorSpeaker, string> = {
  guide: 'Doktor',
  patient: 'Deniz',
  student: 'Sen',
};

export const DOCTOR_INTRO: readonly [DoctorLine, DoctorLine] = [
  { speaker: 'guide', text: 'Hoş geldin! Ben doktorum. İnsanların sağlığını korumak için çalışırım.' },
  { speaker: 'guide', text: 'Bu bir stetoskop. Kalp seslerini dinlememize yardımcı olur. Haydi, birlikte deneyelim!' },
];

export const DOCTOR_FEEDBACK: DoctorLine = {
  speaker: 'guide',
  text: 'Harika! Kalbimizin atışını dinledin. Doktorlar hastalarını dikkatle muayene eder.',
};
