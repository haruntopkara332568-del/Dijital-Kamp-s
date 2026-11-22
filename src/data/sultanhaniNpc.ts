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
  scene: 'sultanhani_square' | 'sultanhani_inner';
  atlasUrl: string;
  width: number;
  height: number;
  startPosition: {
    x: number;
    y: number;
  };
  patrol?: SceneNpcPatrolConfig;
  speed: number;
  interactionEnterRadius: number;
  interactionExitRadius: number;
}

// Öğrenci karakterinin tuvaldeki referans boyutu (CHARACTER_SCALES.scale15: 53x67 px) ve hızı (160 px/sn)
export const STUDENT_REFERENCE_WIDTH_PX = 53;
export const STUDENT_REFERENCE_HEIGHT_PX = 67;
export const STUDENT_REFERENCE_SPEED_PX = 160;
const PATROL_HALF_SPAN_PX = 100; // <= 2 * STUDENT_REFERENCE_HEIGHT_PX (134 px)
const START_X = 880;
const START_Y = 645; // Doğuş noktasına (625, 760) uzaklık ~280 px (~4.18 öğrenci boyu)

export const SULTANHANI_TOURIST_NPC: SceneNpcConfig = {
  id: 'turist-sultanhani',
  name: 'Alex',
  scene: 'sultanhani_square',
  atlasUrl: '/assets/walkable/npc_tourist_atlas.png',
  width: STUDENT_REFERENCE_WIDTH_PX,
  height: STUDENT_REFERENCE_HEIGHT_PX,
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
  speed: STUDENT_REFERENCE_SPEED_PX * 0.5,
  interactionEnterRadius: Math.round(STUDENT_REFERENCE_HEIGHT_PX * 1.5), // ~101 px
  interactionExitRadius: Math.round(STUDENT_REFERENCE_HEIGHT_PX * 2.0), // 134 px
};
