import {
  GRADE_3_STAGE_3,
  GRADE_3_STAGE_3_TASKS,
  type Grade3StageThreeCompleted,
  type Grade3StageThreeTask,
  type StageThreeAge,
} from '@/src/data/grade3Stage3Content';
import { getMissionProgressKey, getProfileStateKey } from './storage';

interface StageThreeRecord {
  completed: Grade3StageThreeCompleted;
  dialogueAge?: StageThreeAge;
}

interface StageThreeProgress extends StageThreeRecord {
  persistent: boolean;
}

const version = 1;
const taskIds = new Set<string>(Object.values(GRADE_3_STAGE_3_TASKS).flat());
const sessionProgress = new Map<string, StageThreeRecord>();

export function getGrade3StageThreeKey(profileId: string): string {
  return `${getProfileStateKey(profileId)}:${getMissionProgressKey(GRADE_3_STAGE_3.id, GRADE_3_STAGE_3.grade)}`;
}

function decodeProgress(raw: string): StageThreeRecord {
  const record: unknown = JSON.parse(raw);
  if (!record || typeof record !== 'object' || !('version' in record) || record.version !== version ||
    !('completed' in record) || !record.completed || typeof record.completed !== 'object' || Array.isArray(record.completed)) {
    throw new Error('Geçersiz 3. Aşama kaydı');
  }

  for (const [id, value] of Object.entries(record.completed)) {
    if (!taskIds.has(id) || value !== true) throw new Error('Geçersiz 3. Aşama görevi');
  }
  const age = 'dialogueAge' in record ? record.dialogueAge : undefined;
  const dialogueAge = GRADE_3_STAGE_3.ages.find(({ value }) => value === age)?.value;
  return {
    completed: record.completed as Grade3StageThreeCompleted,
    ...(dialogueAge === undefined ? {} : { dialogueAge }),
  };
}

export function loadGrade3StageThreeProgress(profileId: string | null): StageThreeProgress {
  if (!profileId || typeof window === 'undefined') return { completed: {}, persistent: false };
  const key = getGrade3StageThreeKey(profileId);
  const memory = sessionProgress.get(key) ?? { completed: {} };
  try {
    const raw = window.localStorage.getItem(key);
    const saved = raw === null ? { completed: {} } : decodeProgress(raw);
    return {
      ...saved,
      ...memory,
      completed: { ...saved.completed, ...memory.completed },
      persistent: true,
    };
  } catch {
    return { ...memory, persistent: false };
  }
}

export function completeGrade3StageThreeTask(
  profileId: string | null,
  previous: Grade3StageThreeCompleted,
  task: Grade3StageThreeTask,
  dialogueAge?: StageThreeAge,
): StageThreeProgress {
  const current = loadGrade3StageThreeProgress(profileId);
  const age = dialogueAge ?? current.dialogueAge;
  const record: StageThreeRecord = {
    completed: { ...current.completed, ...previous, [task]: true },
    ...(age === undefined ? {} : { dialogueAge: age }),
  };
  if (!profileId || typeof window === 'undefined') return { ...record, persistent: false };

  const key = getGrade3StageThreeKey(profileId);
  sessionProgress.set(key, record);
  if (!current.persistent) return { ...record, persistent: false };

  try {
    window.localStorage.setItem(key, JSON.stringify({ version, ...record }));
    sessionProgress.delete(key);
    return { ...record, persistent: true };
  } catch {
    return { ...record, persistent: false };
  }
}
