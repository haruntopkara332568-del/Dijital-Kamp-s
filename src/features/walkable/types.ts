import type { StudentCharacterId } from '@/src/data/studentCharacters';
import type { SceneNpcConfig } from '@/src/data/sultanhaniNpc';
import type { GradeLevel } from '@/src/types/campus';

export type CharacterDirection = 'down' | 'up' | 'left' | 'right';
export type CharacterState = 'idle' | 'walk';
export type NpcPatrolPhase = 'moving_left' | 'pausing_left' | 'moving_right' | 'pausing_right';

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface InteractiveZone {
  id: string;
  name: string;
  prompt: string;
  x: number;
  y: number;
  radius: number;
  action: () => void;
  targetScene?: 'courtyard' | 'classroom' | 'smart-board' | 'sultanhani_inner' | 'sultanhani_square';
}

export interface SceneObstacle extends BoundingBox {
  id: string;
  name: string;
}

export interface WalkableSceneConfig {
  width: number;
  height: number;
  playerSpawn: Position;
  obstacles: SceneObstacle[];
  interactiveZones: InteractiveZone[];
  npc?: SceneNpcConfig;
  npcInitialDirection?: CharacterDirection;
  npcFollowsPlayer?: boolean;
  isNpcVisible?: () => boolean;
}

export interface PlayerCharacter {
  characterId?: StudentCharacterId;
  x: number;
  y: number;
  width: number;
  height: number;
  direction: CharacterDirection;
  state: CharacterState;
  speed: number;
  walkFrame: number;
  grade: GradeLevel;
}

export interface NpcCharacter {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  direction: CharacterDirection;
  state: CharacterState;
  speed: number;
  walkFrame: number;
  visible: boolean;
}
