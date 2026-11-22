export const STUDENT_ATLAS_FRAME = { width: 140, height: 180, columns: 4, rows: 4 } as const;

export const STUDENT_CHARACTERS = [
  { id: 'ece', label: 'Ece', atlasUrl: '/assets/walkable/character_student_atlas.png' },
  { id: 'deniz', label: 'Deniz', atlasUrl: '/assets/walkable/character_deniz_atlas.png' },
  { id: 'elif', label: 'Elif', atlasUrl: '/assets/walkable/character_elif_atlas.png' },
  { id: 'mert', label: 'Mert', atlasUrl: '/assets/walkable/character_mert_atlas.png' },
  { id: 'zeynep', label: 'Zeynep', atlasUrl: '/assets/walkable/character_zeynep_atlas.png' },
  { id: 'arda', label: 'Arda', atlasUrl: '/assets/walkable/character_arda_atlas.png' },
] as const;

export type StudentCharacterId = (typeof STUDENT_CHARACTERS)[number]['id'];

export function getStudentCharacter(id: unknown) {
  return STUDENT_CHARACTERS.find((character) => character.id === id);
}
