import type { Position } from '@/src/features/walkable/types';

export const VETERINARY_CLINIC = {
  width: 960,
  height: 640,
  playerSpawn: { x: 474, y: 454 },
  fatherSpawn: { x: 532, y: 471 },
  veterinarian: { x: 368, y: 414 },
  dogOnTable: { x: 472, y: 287 },
  dogOnFloor: { x: 457, y: 434 },
  dogAtWater: { x: 872, y: 392 },
  careBed: { x: 871, y: 352 },
  careWater: { x: 916, y: 376 },
  exit: { x: 480, y: 602, radius: 34 },
};

export const VET_DOG_WALK_MS = 3900;
export const VET_DOG_DRINK_END_MS = 5550;
export const VET_DOG_REST_MS = 6200;
export const VET_DOG_REDUCED_REST_MS = 1300;

export type VetCareItemId = 'mat' | 'water';

export const VET_CARE_ITEMS: readonly {
  id: VetCareItemId;
  label: string;
  source: Position;
  target: Position;
  width: number;
  height: number;
}[] = [
  { id: 'mat', label: 'Dinlenme minderi', source: { x: 842, y: 446 }, target: VETERINARY_CLINIC.careBed, width: 94, height: 42 },
  { id: 'water', label: 'Su kabı', source: { x: 912, y: 448 }, target: VETERINARY_CLINIC.careWater, width: 48, height: 42 },
];

export const VET_ITEM_REACH = 54;

export type VetSpeaker = 'father' | 'student' | 'veterinarian';
export type VetLine = { speaker: VetSpeaker; text: string; audioSrc: string };

export const VET_SPEAKERS: Record<VetSpeaker, string> = {
  father: 'Baba',
  student: 'Sen',
  veterinarian: 'Veteriner Hekim',
};

export const VET_INTRO: readonly [VetLine, VetLine] = [
  {
    speaker: 'veterinarian',
    text: 'Hoş geldin! Ben veteriner hekimim. Hayvanların sağlığını korumak için çalışırım.',
    audioSrc: '/assets/walkable/vet-voice/vet-welcome.wav',
  },
  {
    speaker: 'veterinarian',
    text: 'Boncuk biraz huzursuz. Haydi, ona rahat edebileceği bir yer hazırlayalım.',
    audioSrc: '/assets/walkable/vet-voice/vet-care.wav',
  },
];

export const VET_REMAINING_ITEM: Record<VetCareItemId, VetLine> = {
  mat: {
    speaker: 'father',
    text: 'Bir de minderi yerine koy.',
    audioSrc: '/assets/walkable/vet-voice/vet-father-mat.wav',
  },
  water: {
    speaker: 'father',
    text: 'Bir de su kabını yerine koy.',
    audioSrc: '/assets/walkable/vet-voice/vet-father-water.wav',
  },
};

export const VET_CLOSING: VetLine = {
  speaker: 'veterinarian',
  text: 'Harika! Boncuk artık daha rahat. Hayvanların bakımında güvenli ve temiz bir ortam çok önemlidir.',
  audioSrc: '/assets/walkable/vet-voice/vet-feedback.wav',
};
