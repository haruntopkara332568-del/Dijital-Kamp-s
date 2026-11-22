import type { StudentCharacterId } from '@/src/data/studentCharacters';
import type { GradeLevel } from '@/src/types/campus';

export type CharacterDirection = 'down' | 'up' | 'left' | 'right';
export type CharacterState = 'idle' | 'walk';

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
  targetScene?: 'courtyard' | 'classroom' | 'smart-board';
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
