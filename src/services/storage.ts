import {
  type CampusStudentState,
  type DiscoveryPreference,
  type GradeLevel,
  type LegacyGradeLevel,
  type MissionProgress,
  type SavedArtifact,
  isSupportedGrade,
  isLegacyGrade,
} from '@/src/types/campus';

export const STORAGE_SCHEMA_VERSION = 1;
export const LOCAL_STORAGE_KEY = 'dek_campus_v1_state';
export const INDEXED_DB_NAME = 'dek_campus_db';
export const INDEXED_DB_VERSION = 1;
export const ARTIFACTS_STORE = 'artifacts';

export interface StorageStatus {
  mode: 'persistent' | 'memory-fallback';
  persisted: boolean;
  warningMessage: string | null;
}

export function createInitialStudentState(): CampusStudentState {
  return {
    schemaVersion: STORAGE_SCHEMA_VERSION,
    hasSeenGate: false,
    hasCompletedOnboarding: false,
    discoveryPreference: null,
    selectedGrade: null,
    hasCompletedGuidedTour: false,
    speechEnabled: true,
    missionProgressByKey: {},
    lastActiveMissionKey: null,
    updatedAt: new Date().toISOString(),
  };
}

let inMemoryState: CampusStudentState | null = null;
let inMemoryArtifacts: Record<string, SavedArtifact> = {};
let lastStorageStatus: StorageStatus = { mode: 'persistent', persisted: true, warningMessage: null };

export function getStorageStatus(): StorageStatus {
  return lastStorageStatus;
}

export function getMissionProgressKey(missionId: string, grade: GradeLevel | LegacyGradeLevel): string {
  return `${missionId}::grade-${grade}`;
}

export function isValidGrade(value: unknown): value is GradeLevel {
  return isSupportedGrade(value);
}

function isValidPreference(value: unknown): value is DiscoveryPreference {
  return value === 'guided' || value === 'independent';
}

function migrateOrValidateState(raw: unknown): { ok: true; state: CampusStudentState } | { ok: false } {
  if (!raw || typeof raw !== 'object') {
    return { ok: false };
  }

  const candidate = raw as Partial<CampusStudentState>;
  if (typeof candidate.schemaVersion !== 'number' || candidate.schemaVersion > STORAGE_SCHEMA_VERSION) {
    // Bilinmeyen veya gelecek sürüme ait veri sessizce silinmez.
    return { ok: false };
  }

  const base = createInitialStudentState();
  // Durum A (2, 3, 4): Sınıf korunur.
  // Durum B (5, 6, 7): Otomatik atanmaz; güvenli biçimde null yapılır, öğrenci 2-4 arasında seçim yapar.
  // Durum D (bozuk/geçersiz): null yapılır; diğer veriler silinmez.
  const safeGrade = isSupportedGrade(candidate.selectedGrade) ? candidate.selectedGrade : null;
  const safePref = isValidPreference(candidate.discoveryPreference) ? candidate.discoveryPreference : null;

  const progressMap: Record<string, MissionProgress> = {};
  if (candidate.missionProgressByKey && typeof candidate.missionProgressByKey === 'object') {
    for (const [k, v] of Object.entries(candidate.missionProgressByKey)) {
      // Eski 5, 6, 7 ilerleme kayıtları da silinmez, depolamada korunur.
      if (v && typeof v === 'object' && typeof v.missionId === 'string' && isLegacyGrade(v.grade)) {
        const legacySavedId =
          typeof v.savedArtifactId === 'string'
            ? v.savedArtifactId
            : typeof v.draftArtifactId === 'string'
              ? v.draftArtifactId
              : null;
        progressMap[k] = {
          ...v,
          draftArtifactId: typeof v.draftArtifactId === 'string' ? v.draftArtifactId : null,
          savedArtifactId: legacySavedId,
          artifactSavedAt: typeof v.artifactSavedAt === 'string' ? v.artifactSavedAt : null,
          completed: Boolean(v.completed),
          completedAt: typeof v.completedAt === 'string' ? v.completedAt : null,
          completedStages: Array.isArray(v.completedStages) ? v.completedStages : [],
          selections: {
            selectedDoorIds: Array.isArray(v.selections?.selectedDoorIds) ? v.selections.selectedDoorIds : [],
            inspectedCampusGate: Boolean(v.selections?.inspectedCampusGate),
            observationNotes:
              v.selections?.observationNotes && typeof v.selections.observationNotes === 'object'
                ? v.selections.observationNotes
                : {},
            matchedVocabularyIds: Array.isArray(v.selections?.matchedVocabularyIds)
              ? v.selections.matchedVocabularyIds
              : [],
            matchedExampleSentence: Boolean(v.selections?.matchedExampleSentence),
            doorName: typeof v.selections?.doorName === 'string' ? v.selections.doorName : '',
            writtenText: typeof v.selections?.writtenText === 'string' ? v.selections.writtenText : '',
            materialChoice:
              typeof v.selections?.materialChoice === 'string' ? v.selections.materialChoice : '',
            usedEnglishWords: Array.isArray(v.selections?.usedEnglishWords)
              ? v.selections.usedEnglishWords
              : [],
          },
        };
      }
    }
  }

  return {
    ok: true,
    state: {
      ...base,
      schemaVersion: STORAGE_SCHEMA_VERSION,
      hasSeenGate: Boolean(candidate.hasSeenGate),
      hasCompletedOnboarding: Boolean(candidate.hasCompletedOnboarding),
      discoveryPreference: safePref,
      selectedGrade: safeGrade,
      hasCompletedGuidedTour: Boolean(candidate.hasCompletedGuidedTour),
      speechEnabled: candidate.speechEnabled !== false,
      missionProgressByKey: progressMap,
      lastActiveMissionKey:
        typeof candidate.lastActiveMissionKey === 'string' ? candidate.lastActiveMissionKey : null,
      updatedAt: typeof candidate.updatedAt === 'string' ? candidate.updatedAt : base.updatedAt,
    },
  };
}

export function loadStudentState(): CampusStudentState {
  if (typeof window === 'undefined') {
    return createInitialStudentState();
  }

  try {
    const rawText = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!rawText) {
      const fresh = inMemoryState ?? createInitialStudentState();
      inMemoryState = fresh;
      return fresh;
    }

    const parsed: unknown = JSON.parse(rawText);
    const migrated = migrateOrValidateState(parsed);
    if (!migrated.ok) {
      lastStorageStatus = {
        mode: 'memory-fallback',
        persisted: false,
        warningMessage:
          'Önceki tarayıcı verisi okunamadı. Mevcut veriler silinmedi; bu oturum geçici bellekte sürdürülüyor.',
      };
      inMemoryState = createInitialStudentState();
      return inMemoryState;
    }

    inMemoryState = migrated.state;
    if ((parsed as { selectedGrade?: unknown })?.selectedGrade !== migrated.state.selectedGrade) {
      saveStudentState(migrated.state);
    }
    lastStorageStatus = { mode: 'persistent', persisted: true, warningMessage: null };
    return migrated.state;
  } catch {
    lastStorageStatus = {
      mode: 'memory-fallback',
      persisted: false,
      warningMessage:
        'Tarayıcı depolamasına erişilemedi. Çalışmaların bu oturum boyunca geçici bellekte tutulacak.',
    };
    inMemoryState = inMemoryState ?? createInitialStudentState();
    return inMemoryState;
  }
}

export function saveStudentState(state: CampusStudentState): StorageStatus {
  const nextState: CampusStudentState = {
    ...state,
    schemaVersion: STORAGE_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
  };
  inMemoryState = nextState;

  if (typeof window === 'undefined') {
    return lastStorageStatus;
  }

  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextState));
    lastStorageStatus = { mode: 'persistent', persisted: true, warningMessage: null };
  } catch {
    lastStorageStatus = {
      mode: 'memory-fallback',
      persisted: false,
      warningMessage:
        'Depolama alanı dolu veya kapalı olduğu için ilerlemen yalnızca bu oturumda tutulabiliyor.',
    };
  }

  return lastStorageStatus;
}

function openArtifactsDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      resolve(null);
      return;
    }

    try {
      const request = window.indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(ARTIFACTS_STORE)) {
          db.createObjectStore(ARTIFACTS_STORE, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function saveArtifact(artifact: SavedArtifact): Promise<StorageStatus> {
  const db = await openArtifactsDb();

  if (!db) {
    const sessionArtifact: SavedArtifact = { ...artifact, storageLocation: 'session-only' };
    inMemoryArtifacts[artifact.id] = sessionArtifact;
    lastStorageStatus = {
      mode: 'memory-fallback',
      persisted: false,
      warningMessage:
        'Çalışman cihaz depolamasına kaydedilemedi; yalnızca bu oturum belleğinde geçici olarak tutuluyor. PNG olarak indirmeni öneririz.',
    };
    return lastStorageStatus;
  }

  return new Promise((resolve) => {
    try {
      const deviceArtifact: SavedArtifact = { ...artifact, storageLocation: 'device' };
      const tx = db.transaction(ARTIFACTS_STORE, 'readwrite');
      const store = tx.objectStore(ARTIFACTS_STORE);
      store.put(deviceArtifact);
      tx.oncomplete = () => {
        db.close();
        inMemoryArtifacts[artifact.id] = deviceArtifact;
        lastStorageStatus = { mode: 'persistent', persisted: true, warningMessage: null };
        resolve(lastStorageStatus);
      };
      tx.onerror = () => {
        db.close();
        inMemoryArtifacts[artifact.id] = { ...artifact, storageLocation: 'session-only' };
        lastStorageStatus = {
          mode: 'memory-fallback',
          persisted: false,
          warningMessage:
            'Çalışman cihaz depolamasına yazılamadı; yalnızca bu oturumda geçici olarak tutuluyor. PNG olarak indirerek cihazına saklayabilirsin.',
        };
        resolve(lastStorageStatus);
      };
    } catch {
      db.close();
      inMemoryArtifacts[artifact.id] = { ...artifact, storageLocation: 'session-only' };
      lastStorageStatus = {
        mode: 'memory-fallback',
        persisted: false,
        warningMessage:
          'Depolama hatası nedeniyle çalışman cihazına kaydedilemedi; yalnızca bu oturumda geçici olarak tutuluyor.',
      };
      resolve(lastStorageStatus);
    }
  });
}

export async function listArtifacts(): Promise<SavedArtifact[]> {
  const db = await openArtifactsDb();
  if (!db) {
    return Object.values(inMemoryArtifacts).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(ARTIFACTS_STORE, 'readonly');
      const store = tx.objectStore(ARTIFACTS_STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        db.close();
        const dbItems = Array.isArray(req.result) ? (req.result as SavedArtifact[]) : [];
        const mergedMap = new Map<string, SavedArtifact>();
        for (const item of Object.values(inMemoryArtifacts)) {
          mergedMap.set(item.id, {
            ...item,
            storageLocation: item.storageLocation ?? 'session-only',
          });
        }
        for (const item of dbItems) {
          mergedMap.set(item.id, {
            ...item,
            storageLocation: 'device',
          });
        }
        const sorted = Array.from(mergedMap.values()).sort((a, b) =>
          b.updatedAt.localeCompare(a.updatedAt),
        );
        resolve(sorted);
      };
      req.onerror = () => {
        db.close();
        resolve(Object.values(inMemoryArtifacts).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
      };
    } catch {
      db.close();
      resolve(Object.values(inMemoryArtifacts));
    }
  });
}

export async function getArtifactById(id: string): Promise<SavedArtifact | null> {
  const all = await listArtifacts();
  return all.find((item) => item.id === id) ?? null;
}

export async function clearAllCampusData(): Promise<void> {
  inMemoryState = createInitialStudentState();
  inMemoryArtifacts = {};

  if (typeof window === 'undefined') return;

  try {
    // Yalnızca bu uygulamanın kendi anahtarlarını temizle
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith('dek_')) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Sessizce devam et
  }

  if ('indexedDB' in window) {
    await new Promise<void>((resolve) => {
      try {
        const deleteReq = window.indexedDB.deleteDatabase(INDEXED_DB_NAME);
        deleteReq.onsuccess = () => resolve();
        deleteReq.onerror = () => resolve();
        deleteReq.onblocked = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  lastStorageStatus = { mode: 'persistent', persisted: true, warningMessage: null };
}
