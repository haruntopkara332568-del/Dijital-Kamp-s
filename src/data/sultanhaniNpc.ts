import type { CharacterDirection } from '@/src/features/walkable/types';

export interface SceneNpcPatrolConfig {
  minX: number;
  maxX: number;
  endpointPauseMs: number;
  initialDirection: CharacterDirection;
}

export interface SceneNpcConfig {
  id: string;
  name: string;
  scene: 'sultanhani_square';
  atlasUrl: string;
  width: number;
  height: number;
  startPosition: {
    x: number;
    y: number;
  };
  patrol: SceneNpcPatrolConfig;
  speed: number;
  interactionEnterRadius: number;
  interactionExitRadius: number;
  cooldownMs: number;
  dialogueLines: readonly string[];
}

// Öğrenci karakterinin tuvaldeki referans boyutu (CHARACTER_SCALES.scale15: 53x67 px) ve hızı (160 px/sn)
const STUDENT_WIDTH_PX = 53;
const STUDENT_HEIGHT_PX = 67;
const STUDENT_SPEED_PX = 160;
const PATROL_HALF_SPAN_PX = 100; // <= 2 * STUDENT_HEIGHT_PX (134 px)
const START_X = 880;
const START_Y = 645;

export const SULTANHANI_TOURIST_NPC: SceneNpcConfig = {
  id: 'turist-sultanhani',
  name: 'Turist',
  scene: 'sultanhani_square',
  atlasUrl: '/assets/walkable/npc_tourist_atlas.png',
  width: STUDENT_WIDTH_PX,
  height: STUDENT_HEIGHT_PX,
  startPosition: {
    x: START_X,
    y: START_Y,
  },
  patrol: {
    minX: START_X - PATROL_HALF_SPAN_PX,
    maxX: START_X + PATROL_HALF_SPAN_PX,
    endpointPauseMs: 1750,
    initialDirection: 'left',
  },
  speed: STUDENT_SPEED_PX * 0.5,
  interactionEnterRadius: Math.round(STUDENT_HEIGHT_PX * 1.5), // ~101 px
  interactionExitRadius: Math.round(STUDENT_HEIGHT_PX * 2.0), // 134 px
  cooldownMs: 10_000,
  dialogueLines: [
    'Merhaba! Ben bu güzel şehri gezmeye gelen bir turistim.',
    'Burası Sultanhanı Kervansarayı. Selçuklular döneminde yapılmış, çok büyük ve görkemli bir yapı.',
    'Eskiden yolcular ve tüccarlar burada dinlenir, hayvanlarını ve eşyalarını güvende tutardı.',
    'İstersen kapıdan içeri girip çevreyi keşfedebilirsin!',
  ],
};
