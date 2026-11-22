import {
  GRADE_3_STAGE_2,
  GRADE_3_STAGE_2_TASKS,
  type Grade3StageTwoCompleted,
  type Grade3StageTwoTask,
} from '@/src/data/grade3Stage2Content';
import { getMissionProgressKey, getProfileStateKey } from './storage';

interface StageTwoProgress {
  completed: Grade3StageTwoCompleted;
  persistent: boolean;
}

const progressVersion = 1;
const taskIds = new Set<string>(Object.values(GRADE_3_STAGE_2_TASKS).flat());
const sessionProgress = new Map<string, Grade3StageTwoCompleted>();

export function getGrade3StageTwoKey(profileId: string): string {
  return `${getProfileStateKey(profileId)}:${getMissionProgressKey(GRADE_3_STAGE_2.id, GRADE_3_STAGE_2.grade)}`;
}

function decodeProgress(raw: string): Grade3StageTwoCompleted {
  const record: unknown = JSON.parse(raw);
  if (!record || typeof record !== 'object' || !('version' in record) || record.version !== progressVersion ||
    !('completed' in record) || !record.completed || typeof record.completed !== 'object' || Array.isArray(record.completed)) {
    throw new Error('Invalid 3. sınıf 2. aşama kaydı');
  }

  for (const [id, value] of Object.entries(record.completed)) {
    if (!taskIds.has(id) || value !== true) throw new Error('Invalid 3. sınıf 2. aşama görevi');
  }
  return record.completed as Grade3StageTwoCompleted;
}

export function loadGrade3StageTwoProgress(profileId: string | null): StageTwoProgress {
  if (!profileId || typeof window === 'undefined') return { completed: {}, persistent: false };
  const key = getGrade3StageTwoKey(profileId);
  const memory = sessionProgress.get(key) ?? {};
  try {
    const raw = window.localStorage.getItem(key);
    return { completed: { ...(raw === null ? {} : decodeProgress(raw)), ...memory }, persistent: true };
  } catch {
    return { completed: memory, persistent: false };
  }
}

export function completeGrade3StageTwoTask(
  profileId: string | null,
  previous: Grade3StageTwoCompleted,
  task: Grade3StageTwoTask,
): StageTwoProgress {
  const current = loadGrade3StageTwoProgress(profileId);
  const completed: Grade3StageTwoCompleted = { ...current.completed, ...previous, [task]: true };
  if (!profileId || typeof window === 'undefined') return { completed, persistent: false };

  const key = getGrade3StageTwoKey(profileId);
  sessionProgress.set(key, completed);
  if (!current.persistent) return { completed, persistent: false };

  try {
    window.localStorage.setItem(key, JSON.stringify({ version: progressVersion, completed }));
    sessionProgress.delete(key);
    return { completed, persistent: true };
  } catch {
    return { completed, persistent: false };
  }
}
