import { GRADE_3_STAGE_4, type SultanhanıLabel, type SultanhanıSentence } from '@/src/data/grade3Stage4Content';
import { SULTANHANI_VIEWS, sultanhaniSlots, type SultanhanıViewId } from '@/src/data/sultanhaniStageFourAssets';
import type { MissionStageId } from '@/src/types/campus';
import { getMissionProgressKey, getProfileStateKey } from './storage';

export interface SultanhanıCard {
  version: 1;
  viewId: SultanhanıViewId;
  labels: { wordId: SultanhanıLabel; slotId: SultanhanıLabel }[];
  sentenceIds: SultanhanıSentence[];
}

interface StageFourRecord {
  completed: Partial<Record<MissionStageId, true>>;
  card?: SultanhanıCard;
}
interface StageFourProgress extends StageFourRecord {
  persistent: boolean;
}

const version = 1;
const session = new Map<string, StageFourRecord>();

export function getGrade3StageFourKey(profileId: string) {
  return getProfileStateKey(profileId) + ':' + getMissionProgressKey(GRADE_3_STAGE_4.id, GRADE_3_STAGE_4.grade);
}

export function isSultanhaniCard(value: unknown): value is SultanhanıCard {
  if (!value || typeof value !== 'object') return false;
  const card = value as Partial<SultanhanıCard>;
  const view = SULTANHANI_VIEWS.find(({ id }) => id === card.viewId);
  if (!view || card.version !== version || !Array.isArray(card.labels) || !Array.isArray(card.sentenceIds)) return false;
  const slots = sultanhaniSlots(view);
  if (card.labels.length < 3 || card.labels.length > slots.length || card.sentenceIds.length < 1 || card.sentenceIds.length > 2) return false;
  return new Set(card.labels.map((label) => label?.wordId)).size === card.labels.length &&
    card.labels.every((label) => label?.wordId === label?.slotId && slots.some(({ id }) => id === label?.slotId)) &&
    new Set(card.sentenceIds).size === card.sentenceIds.length &&
    card.sentenceIds.every((value) => GRADE_3_STAGE_4.sentences.some(({ id }) => id === value));
}

function decodeProgress(raw: string): StageFourRecord {
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object') throw new Error('Geçersiz 4. aşama kaydı');
  const record = value as Partial<StageFourRecord> & { version?: number };
  if (record.version !== version || !record.completed || typeof record.completed !== 'object' ||
      Array.isArray(record.completed) ||
      Object.entries(record.completed).some(([id, done]) => !Object.hasOwn(GRADE_3_STAGE_4.titles, id) || done !== true) ||
      (record.card !== undefined && !isSultanhaniCard(record.card))) throw new Error('Geçersiz 4. aşama kaydı');
  return { completed: record.completed, ...(record.card ? { card: record.card } : {}) };
}

export function loadGrade3StageFourProgress(profileId: string | null): StageFourProgress {
  if (!profileId || typeof window === 'undefined') return { completed: {}, persistent: false };
  const key = getGrade3StageFourKey(profileId);
  const memory = session.get(key);
  try {
    const raw = localStorage.getItem(key);
    const saved = raw === null ? { completed: {} } : decodeProgress(raw);
    return { ...saved, ...memory, completed: { ...saved.completed, ...memory?.completed }, persistent: true };
  } catch {
    return { ...(memory ?? { completed: {} }), persistent: false };
  }
}

export function completeGrade3StageFourTable(
  profileId: string | null,
  previous: StageFourProgress,
  table: MissionStageId,
  card?: SultanhanıCard,
): StageFourProgress {
  const current = loadGrade3StageFourProgress(profileId);
  const recipe = card ?? current.card ?? previous.card;
  const record: StageFourRecord = {
    completed: { ...current.completed, ...previous.completed, [table]: true },
    ...(recipe ? { card: recipe } : {}),
  };
  if (!profileId || typeof window === 'undefined') return { ...record, persistent: false };
  const key = getGrade3StageFourKey(profileId);
  session.set(key, record);
  if (!current.persistent) return { ...record, persistent: false };
  try {
    localStorage.setItem(key, JSON.stringify({ version, ...record }));
    session.delete(key);
    return { ...record, persistent: true };
  } catch {
    return { ...record, persistent: false };
  }
}
