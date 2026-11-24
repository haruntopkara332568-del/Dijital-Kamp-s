import { STAGE_FIVE_TASKS, type StageFiveTaskId } from '@/src/data/grade3Stage5Content';
import { getGrade3StageFiveProgressKey } from './storage';

interface StageFiveProgress {
  completed: StageFiveTaskId[];
  persistent: boolean;
}

const validTasks = new Set<string>(Object.values(STAGE_FIVE_TASKS).flat());
const session = new Map<string, StageFiveTaskId[]>();

function isTask(id: unknown): id is StageFiveTaskId {
  return typeof id === 'string' && validTasks.has(id);
}

export function loadStageFiveProgress(profileId: string): StageFiveProgress {
  const key = getGrade3StageFiveProgressKey(profileId);
  const unsaved = session.get(key) ?? [];
  try {
    const raw = window.localStorage.getItem(key);
    const stored = raw ? JSON.parse(raw) as { version?: number; completed?: unknown } : null;
    const completed = stored?.version === 1 && Array.isArray(stored.completed)
      ? stored.completed.filter(isTask)
      : [];
    return { completed: [...new Set([...completed, ...unsaved])], persistent: true };
  } catch {
    return { completed: unsaved, persistent: false };
  }
}

export function completeStageFiveTask(profileId: string, previous: StageFiveTaskId[], task: StageFiveTaskId): StageFiveProgress {
  const key = getGrade3StageFiveProgressKey(profileId);
  const { completed } = loadStageFiveProgress(profileId);
  const next = [...new Set([...completed, ...previous, task])];
  try {
    window.localStorage.setItem(key, JSON.stringify({ version: 1, completed: next }));
    session.delete(key);
    return { completed: next, persistent: true };
  } catch {
    session.set(key, next);
    return { completed: next, persistent: false };
  }
}
