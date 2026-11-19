import {
  type CampusStudentState,
  type DiscoveryPreference,
  type GradeLevel,
  type LegacyGradeLevel,
  type MissionProgress,
  type SavedArtifact,
  type StudentProfile,
  type SupportedGrade,
  isSupportedGrade,
  isLegacyGrade,
} from '@/src/types/campus';

export const STORAGE_SCHEMA_VERSION = 1;
export const LOCAL_STORAGE_KEY = 'dek_campus_v1_state';
export const LOCAL_STORAGE_PROFILES_KEY = 'dek_campus_profiles_v1';
export const LOCAL_STORAGE_ACTIVE_PROFILE_KEY = 'dek_campus_active_profile_id_v1';
export const LOCAL_STORAGE_MIGRATED_KEY = 'dek_campus_migrated_v1';
export const PROFILE_STATE_KEY_PREFIX = 'dek_campus_profile_v1:';

export const INDEXED_DB_NAME = 'dek_campus_db';
export const INDEXED_DB_VERSION = 1;
export const ARTIFACTS_STORE = 'artifacts';

export interface StorageStatus {
  mode: 'persistent' | 'memory-fallback';
  persisted: boolean;
  warningMessage: string | null;
}

let inMemoryProfiles: StudentProfile[] = [];
let inMemoryActiveProfileId: string | null = null;
let inMemoryProfileStates: Record<string, CampusStudentState> = {};

export function getProfileStateKey(profileId: string): string {
  return `${PROFILE_STATE_KEY_PREFIX}${profileId}:state`;
}

export function generateProfileId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `prof_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
  }
  return `prof_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Onarım 03A: Eski Tekil Verinin Güvenli Göçü (Legacy Migration)
 * Eğer dek_campus_v1_state varsa ve henüz profil listesi oluşturulmamışsa,
 * mevcut veriyi koruyarak 'Gezgin' takma adlı bir geçiş profiline dönüştürür.
 * dek_campus_migrated_v1 bayrağı ile göçün tekrarlanması veya döngü engellenir.
 */
export function runLegacyMigrationIfNeeded(): void {
  if (typeof window === 'undefined') return;

  try {
    const isMigrated = window.localStorage.getItem(LOCAL_STORAGE_MIGRATED_KEY);
    if (isMigrated === 'true') {
      return;
    }

    const legacyRaw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    const existingProfilesRaw = window.localStorage.getItem(LOCAL_STORAGE_PROFILES_KEY);

    if (existingProfilesRaw) {
      window.localStorage.setItem(LOCAL_STORAGE_MIGRATED_KEY, 'true');
      return;
    }

    if (legacyRaw) {
      const parsed = JSON.parse(legacyRaw);
      const validated = migrateOrValidateState(parsed);
      if (validated.ok) {
        const legacyGrade: SupportedGrade = isSupportedGrade(validated.state.selectedGrade)
          ? validated.state.selectedGrade
          : 3;

        const legacyProfile: StudentProfile = {
          id: 'prof_legacy_student',
          alias: 'Gezgin',
          avatarId: 'avatar_1',
          selectedGrade: legacyGrade,
          createdAt: validated.state.updatedAt || new Date().toISOString(),
          lastUsedAt: new Date().toISOString(),
        };

        window.localStorage.setItem(LOCAL_STORAGE_PROFILES_KEY, JSON.stringify([legacyProfile]));
        window.localStorage.setItem(LOCAL_STORAGE_ACTIVE_PROFILE_KEY, legacyProfile.id);
        window.localStorage.setItem(
          getProfileStateKey(legacyProfile.id),
          JSON.stringify(validated.state),
        );
        // Eski tekil anahtarı da doğrulanmış/normalize edilmiş durumla güncelle
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(validated.state));
        inMemoryProfiles = [legacyProfile];
        inMemoryActiveProfileId = legacyProfile.id;
        inMemoryProfileStates[legacyProfile.id] = validated.state;
        inMemoryState = validated.state;

        // IndexedDB çizimlerine profileId ata
        void migrateIndexedDbDrawings(legacyProfile.id);
      }
    }

    window.localStorage.setItem(LOCAL_STORAGE_MIGRATED_KEY, 'true');
  } catch (err) {
    console.warn('runLegacyMigrationIfNeeded hata:', err);
  }
}

export function loadStudentProfiles(): StudentProfile[] {
  if (typeof window === 'undefined') {
    return inMemoryProfiles;
  }

  runLegacyMigrationIfNeeded();

  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_PROFILES_KEY);
    if (!raw) {
      return inMemoryProfiles;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return inMemoryProfiles;
    }

    const validProfiles: StudentProfile[] = [];
    for (const p of parsed) {
      if (
        p &&
        typeof p === 'object' &&
        typeof p.id === 'string' &&
        typeof p.alias === 'string' &&
        typeof p.avatarId === 'string' &&
        isSupportedGrade(p.selectedGrade)
      ) {
        validProfiles.push({
          id: p.id,
          alias: p.alias.trim(),
          avatarId: p.avatarId,
          selectedGrade: p.selectedGrade,
          createdAt: typeof p.createdAt === 'string' ? p.createdAt : new Date().toISOString(),
          lastUsedAt: typeof p.lastUsedAt === 'string' ? p.lastUsedAt : new Date().toISOString(),
        });
      }
    }
    inMemoryProfiles = validProfiles;
    return validProfiles;
  } catch {
    return inMemoryProfiles;
  }
}

export function saveStudentProfiles(profiles: StudentProfile[]): void {
  inMemoryProfiles = profiles;
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_STORAGE_PROFILES_KEY, JSON.stringify(profiles));
  } catch (err) {
    console.warn('saveStudentProfiles hata:', err);
  }
}

export function getActiveProfileId(): string | null {
  if (typeof window === 'undefined') {
    return inMemoryActiveProfileId;
  }

  try {
    const id = window.localStorage.getItem(LOCAL_STORAGE_ACTIVE_PROFILE_KEY);
    if (id) {
      inMemoryActiveProfileId = id;
      return id;
    }
    const profiles = loadStudentProfiles();
    if (profiles.length > 0) {
      const firstId = profiles[0].id;
      setActiveProfileId(firstId);
      return firstId;
    }
    return null;
  } catch {
    return inMemoryActiveProfileId;
  }
}

export function setActiveProfileId(profileId: string | null): void {
  inMemoryActiveProfileId = profileId;
  if (typeof window === 'undefined') return;

  try {
    if (profileId) {
      window.localStorage.setItem(LOCAL_STORAGE_ACTIVE_PROFILE_KEY, profileId);
      // Profilin lastUsedAt tarihini güncelle
      const profiles = loadStudentProfiles();
      const updated = profiles.map((p) =>
        p.id === profileId ? { ...p, lastUsedAt: new Date().toISOString() } : p,
      );
      saveStudentProfiles(updated);
    } else {
      window.localStorage.removeItem(LOCAL_STORAGE_ACTIVE_PROFILE_KEY);
    }
  } catch (err) {
    console.warn('setActiveProfileId hata:', err);
  }
}

export function createStudentProfile(
  alias: string,
  avatarId: string,
  selectedGrade: SupportedGrade,
): StudentProfile {
  if (!isSupportedGrade(selectedGrade)) {
    throw new Error('Yalnızca 2, 3 veya 4. sınıf düzeyleri seçilebilir.');
  }
  const cleanAlias = alias.trim();
  if (!cleanAlias) {
    throw new Error('Öğrenci takma adı boş bırakılamaz.');
  }

  const newProfile: StudentProfile = {
    id: generateProfileId(),
    alias: cleanAlias,
    avatarId,
    selectedGrade,
    createdAt: new Date().toISOString(),
    lastUsedAt: new Date().toISOString(),
  };

  const currentProfiles = loadStudentProfiles();
  const nextProfiles = [...currentProfiles, newProfile];
  saveStudentProfiles(nextProfiles);
  setActiveProfileId(newProfile.id);

  // Bu öğrenciye özel başlangıç durumu (izole)
  const initialState: CampusStudentState = {
    ...createInitialStudentState(),
    selectedGrade,
    hasSeenGate: true,
    hasCompletedOnboarding: true,
  };
  saveStudentStateForProfile(initialState, newProfile.id);

  return newProfile;
}

export function updateStudentProfile(
  profileId: string,
  updates: Partial<Pick<StudentProfile, 'alias' | 'avatarId' | 'selectedGrade'>>,
): StudentProfile | null {
  const profiles = loadStudentProfiles();
  const target = profiles.find((p) => p.id === profileId);
  if (!target) return null;

  const nextGrade =
    updates.selectedGrade && isSupportedGrade(updates.selectedGrade)
      ? updates.selectedGrade
      : target.selectedGrade;

  const updated: StudentProfile = {
    ...target,
    alias: updates.alias ? updates.alias.trim() : target.alias,
    avatarId: updates.avatarId ?? target.avatarId,
    selectedGrade: nextGrade,
    lastUsedAt: new Date().toISOString(),
  };

  const nextList = profiles.map((p) => (p.id === profileId ? updated : p));
  saveStudentProfiles(nextList);

  if (updates.selectedGrade) {
    const state = loadStudentStateForProfile(profileId);
    state.selectedGrade = nextGrade;
    saveStudentStateForProfile(state, profileId);
  }

  return updated;
}

export async function deleteStudentProfile(profileId: string): Promise<{
  remainingProfiles: StudentProfile[];
  nextActiveProfileId: string | null;
}> {
  // 1. Profil state kaydını sil
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(getProfileStateKey(profileId));
    } catch {
      // LocalStorage erişim engeli yoksayılır
    }
  }
  delete inMemoryProfileStates[profileId];

  // 2. Bu profile ait çizimleri IndexedDB ve bellekten sil
  await deleteArtifactsForProfile(profileId);

  // 3. Profil defterinden çıkar
  const currentProfiles = loadStudentProfiles();
  const remaining = currentProfiles.filter((p) => p.id !== profileId);
  saveStudentProfiles(remaining);

  // 4. Aktif profil silindiyse bir sonrakine geç
  let nextActive: string | null = null;
  const currentActive = getActiveProfileId();
  if (currentActive === profileId) {
    nextActive = remaining[0]?.id ?? null;
    setActiveProfileId(nextActive);
  } else {
    nextActive = currentActive;
  }

  return { remainingProfiles: remaining, nextActiveProfileId: nextActive };
}

export function loadStudentStateForProfile(profileId?: string | null): CampusStudentState {
  const activeId = profileId ?? getActiveProfileId();
  if (!activeId) {
    return loadStudentState();
  }

  if (typeof window === 'undefined') {
    return inMemoryProfileStates[activeId] ?? createInitialStudentState();
  }

  try {
    const rawText = window.localStorage.getItem(getProfileStateKey(activeId));
    if (!rawText) {
      const profiles = loadStudentProfiles();
      const prof = profiles.find((p) => p.id === activeId);
      const fresh: CampusStudentState = {
        ...createInitialStudentState(),
        selectedGrade: prof?.selectedGrade ?? null,
      };
      inMemoryProfileStates[activeId] = fresh;
      return fresh;
    }

    const parsed = JSON.parse(rawText);
    const validated = migrateOrValidateState(parsed);
    if (!validated.ok) {
      const fresh = createInitialStudentState();
      inMemoryProfileStates[activeId] = fresh;
      return fresh;
    }

    inMemoryProfileStates[activeId] = validated.state;
    return validated.state;
  } catch {
    return inMemoryProfileStates[activeId] ?? createInitialStudentState();
  }
}

export function saveStudentStateForProfile(
  state: CampusStudentState,
  profileId?: string | null,
): StorageStatus {
  const activeId = profileId ?? getActiveProfileId();
  const nextState: CampusStudentState = {
    ...state,
    schemaVersion: STORAGE_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
  };

  if (activeId) {
    inMemoryProfileStates[activeId] = nextState;
  }
  inMemoryState = nextState;

  if (typeof window === 'undefined') {
    return lastStorageStatus;
  }

  try {
    if (activeId) {
      window.localStorage.setItem(getProfileStateKey(activeId), JSON.stringify(nextState));
    }
    // Geriye dönük uyumluluk ve eski testler için ayna kayıt
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
  const activeId = getActiveProfileId();
  if (activeId) {
    return loadStudentStateForProfile(activeId);
  }

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
  const activeId = getActiveProfileId();
  if (activeId) {
    return saveStudentStateForProfile(state, activeId);
  }

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

async function migrateIndexedDbDrawings(targetProfileId: string): Promise<void> {
  const db = await openArtifactsDb();
  if (!db) return;
  try {
    const tx = db.transaction(ARTIFACTS_STORE, 'readwrite');
    const store = tx.objectStore(ARTIFACTS_STORE);
    const req = store.getAll();
    req.onsuccess = () => {
      const items = req.result as SavedArtifact[];
      for (const item of items) {
        if (!item.profileId) {
          item.profileId = targetProfileId;
          store.put(item);
        }
      }
    };
    tx.oncomplete = () => db.close();
    tx.onerror = () => db.close();
  } catch {
    db.close();
  }
}

export async function deleteArtifactsForProfile(profileId: string): Promise<void> {
  for (const [id, item] of Object.entries(inMemoryArtifacts)) {
    if (item.profileId === profileId || (!item.profileId && profileId === 'prof_legacy_student')) {
      delete inMemoryArtifacts[id];
    }
  }

  const db = await openArtifactsDb();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(ARTIFACTS_STORE, 'readwrite');
      const store = tx.objectStore(ARTIFACTS_STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        const items = req.result as SavedArtifact[];
        for (const item of items) {
          if (item.profileId === profileId || (!item.profileId && profileId === 'prof_legacy_student')) {
            store.delete(item.id);
          }
        }
      };
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        resolve();
      };
    } catch {
      db.close();
      resolve();
    }
  });
}

export async function saveArtifact(
  artifact: SavedArtifact,
  profileId?: string,
): Promise<StorageStatus> {
  const targetProfileId = profileId || artifact.profileId || getActiveProfileId() || 'prof_legacy_student';
  const targetArtifact: SavedArtifact = {
    ...artifact,
    profileId: targetProfileId,
  };
  const db = await openArtifactsDb();

  if (!db) {
    const sessionArtifact: SavedArtifact = { ...targetArtifact, storageLocation: 'session-only' };
    inMemoryArtifacts[targetArtifact.id] = sessionArtifact;
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
      const deviceArtifact: SavedArtifact = { ...targetArtifact, storageLocation: 'device' };
      const tx = db.transaction(ARTIFACTS_STORE, 'readwrite');
      const store = tx.objectStore(ARTIFACTS_STORE);
      store.put(deviceArtifact);
      tx.oncomplete = () => {
        db.close();
        inMemoryArtifacts[targetArtifact.id] = deviceArtifact;
        lastStorageStatus = { mode: 'persistent', persisted: true, warningMessage: null };
        resolve(lastStorageStatus);
      };
      tx.onerror = () => {
        db.close();
        inMemoryArtifacts[targetArtifact.id] = { ...targetArtifact, storageLocation: 'session-only' };
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
      inMemoryArtifacts[targetArtifact.id] = { ...targetArtifact, storageLocation: 'session-only' };
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

export async function listArtifacts(profileId?: string): Promise<SavedArtifact[]> {
  const activeProfile = profileId ?? getActiveProfileId();
  const db = await openArtifactsDb();
  if (!db) {
    const all = Object.values(inMemoryArtifacts);
    const filtered = activeProfile
      ? all.filter(
          (a) => a.profileId === activeProfile || (!a.profileId && activeProfile === 'prof_legacy_student'),
        )
      : all;
    return filtered.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
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
        const allItems = Array.from(mergedMap.values());
        const filtered = activeProfile
          ? allItems.filter(
              (a) =>
                a.profileId === activeProfile || (!a.profileId && activeProfile === 'prof_legacy_student'),
            )
          : allItems;
        const sorted = filtered.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        resolve(sorted);
      };
      req.onerror = () => {
        db.close();
        const all = Object.values(inMemoryArtifacts);
        const filtered = activeProfile
          ? all.filter(
              (a) => a.profileId === activeProfile || (!a.profileId && activeProfile === 'prof_legacy_student'),
            )
          : all;
        resolve(filtered.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
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
  inMemoryProfiles = [];
  inMemoryActiveProfileId = null;
  inMemoryProfileStates = {};

  if (typeof window === 'undefined') return;

  try {
    // Yalnızca dek_ önekli anahtarları temizle
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
