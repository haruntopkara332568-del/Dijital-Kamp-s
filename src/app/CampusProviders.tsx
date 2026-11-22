import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import { MotionConfig } from 'motion/react';
import {
  clearAllCampusData,
  createInitialStudentState,
  getMissionProgressKey,
  getStorageStatus,
  loadStudentState,
  saveStudentState,
  loadStudentProfiles,
  getActiveProfileId,
  setActiveProfileId,
  createStudentProfile,
  updateStudentProfile,
  deleteStudentProfile,
  loadStudentStateForProfile,
  saveStudentStateForProfile,
  type StorageStatus,
} from '@/src/services/storage';
import type {
  CampusStudentState,
  DiscoveryPreference,
  GradeLevel,
  MissionProgress,
  StudentProfile,
  SupportedGrade,
} from '@/src/types/campus';
import { getGradeProfile } from '@/src/data/gradeProfiles';
import { ProfileSelectionModal } from '@/src/features/profile/ProfileSelectionModal';

interface CampusContextValue {
  hydrated: boolean;
  state: CampusStudentState;
  storageStatus: StorageStatus;
  activeGradeProfile: ReturnType<typeof getGradeProfile>;
  profiles: StudentProfile[];
  activeProfile: StudentProfile | null;
  createProfile: (alias: string, avatarId: string, grade: SupportedGrade) => StudentProfile;
  switchProfile: (profileId: string) => void;
  updateProfile: (
    profileId: string,
    updates: Partial<Pick<StudentProfile, 'alias' | 'avatarId' | 'selectedGrade' | 'characterId'>>,
  ) => void;
  deleteProfile: (profileId: string) => Promise<void>;
  isProfileModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  markGateSeen: () => void;
  setDiscoveryPreference: (pref: DiscoveryPreference) => void;
  setGrade: (grade: GradeLevel) => void;
  completeGuidedTour: () => void;
  completeOnboarding: () => void;
  replayWelcomeFlow: () => void;
  replayGuidedTour: () => void;
  setSpeechEnabled: (enabled: boolean) => void;
  saveMissionProgress: (progress: MissionProgress) => void;
  getMissionProgress: (missionId: string, grade?: GradeLevel) => MissionProgress | null;
  getLatestUnfinishedMission: () => MissionProgress | null;
  resetAllData: () => Promise<void>;
}

const CampusContext = createContext<CampusContextValue | null>(null);

const emptySubscribe = () => () => {};

export function CampusProviders({ children }: { children: React.ReactNode }) {
  const hydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const [profiles, setProfiles] = useState<StudentProfile[]>(() =>
    typeof window !== 'undefined' ? loadStudentProfiles() : [],
  );
  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(() =>
    typeof window !== 'undefined' ? getActiveProfileId() : null,
  );
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [state, setState] = useState<CampusStudentState>(() =>
    typeof window !== 'undefined' ? loadStudentState() : createInitialStudentState(),
  );
  const [storageStatus, setStorageStatus] = useState<StorageStatus>(() =>
    typeof window !== 'undefined'
      ? getStorageStatus()
      : { mode: 'persistent', persisted: true, warningMessage: null },
  );

  const activeProfile = useMemo<StudentProfile | null>(() => {
    if (!activeProfileId) return profiles[0] ?? null;
    return profiles.find((p) => p.id === activeProfileId) ?? profiles[0] ?? null;
  }, [profiles, activeProfileId]);

  const updateAndPersist = useCallback(
    (updater: (prev: CampusStudentState) => CampusStudentState) => {
      setState((prev) => {
        const next = updater(prev);
        const status = activeProfileId
          ? saveStudentStateForProfile(next, activeProfileId)
          : saveStudentState(next);
        setStorageStatus(status);
        return next;
      });
    },
    [activeProfileId],
  );

  const createProfile = useCallback(
    (alias: string, avatarId: string, grade: SupportedGrade): StudentProfile => {
      const newProf = createStudentProfile(alias, avatarId, grade);
      const updatedList = loadStudentProfiles();
      setProfiles(updatedList);
      setActiveProfileIdState(newProf.id);
      const newState = loadStudentStateForProfile(newProf.id);
      setState(newState);
      setIsProfileModalOpen(false);
      return newProf;
    },
    [],
  );

  const switchProfile = useCallback((profileId: string) => {
    setActiveProfileId(profileId);
    setActiveProfileIdState(profileId);
    setProfiles(loadStudentProfiles());
    const newState = loadStudentStateForProfile(profileId);
    setState(newState);
    setIsProfileModalOpen(false);
  }, []);

  const updateProfile = useCallback(
    (
      profileId: string,
      updates: Partial<Pick<StudentProfile, 'alias' | 'avatarId' | 'selectedGrade' | 'characterId'>>,
    ) => {
      const updated = updateStudentProfile(profileId, updates);
      if (updated) {
        setProfiles(loadStudentProfiles());
        if (profileId === activeProfileId && updates.selectedGrade) {
          setState((prev) => ({ ...prev, selectedGrade: updates.selectedGrade! }));
        }
      }
    },
    [activeProfileId],
  );

  const deleteProfile = useCallback(
    async (profileId: string) => {
      const { remainingProfiles, nextActiveProfileId } = await deleteStudentProfile(profileId);
      setProfiles(remainingProfiles);
      setActiveProfileIdState(nextActiveProfileId);
      if (nextActiveProfileId) {
        const newState = loadStudentStateForProfile(nextActiveProfileId);
        setState(newState);
      } else {
        setState(createInitialStudentState());
        setIsProfileModalOpen(true);
      }
    },
    [],
  );

  const openProfileModal = useCallback(() => setIsProfileModalOpen(true), []);
  const closeProfileModal = useCallback(() => setIsProfileModalOpen(false), []);

  const markGateSeen = useCallback(() => {
    updateAndPersist((prev) => ({
      ...prev,
      hasSeenGate: true,
      hasCompletedOnboarding: true,
      selectedGrade: prev.selectedGrade,
    }));
  }, [updateAndPersist]);

  const setDiscoveryPreference = useCallback(
    (pref: DiscoveryPreference) => {
      updateAndPersist((prev) => ({ ...prev, discoveryPreference: pref }));
    },
    [updateAndPersist],
  );

  const setGrade = useCallback(
    (grade: GradeLevel) => {
      // Sınıf değiştiğinde önceki çalışmalar silinmez; yalnızca aktif sınıf güncellenir.
      updateAndPersist((prev) => ({ ...prev, selectedGrade: grade }));
      if (activeProfileId) {
        const updated = updateStudentProfile(activeProfileId, { selectedGrade: grade });
        if (updated) {
          setProfiles((prev) => prev.map((p) => (p.id === activeProfileId ? updated : p)));
        }
      }
    },
    [activeProfileId, updateAndPersist],
  );

  const completeGuidedTour = useCallback(() => {
    updateAndPersist((prev) => ({
      ...prev,
      hasCompletedGuidedTour: true,
      hasCompletedOnboarding: true,
    }));
  }, [updateAndPersist]);

  const completeOnboarding = useCallback(() => {
    updateAndPersist((prev) => ({
      ...prev,
      hasCompletedOnboarding: true,
    }));
  }, [updateAndPersist]);

  const replayWelcomeFlow = useCallback(() => {
    updateAndPersist((prev) => ({
      ...prev,
      hasSeenGate: false,
      hasCompletedOnboarding: false,
    }));
  }, [updateAndPersist]);

  const replayGuidedTour = useCallback(() => {
    updateAndPersist((prev) => ({
      ...prev,
      hasSeenGate: true,
      discoveryPreference: 'guided',
      hasCompletedGuidedTour: false,
      hasCompletedOnboarding: false,
    }));
  }, [updateAndPersist]);

  const setSpeechEnabled = useCallback(
    (enabled: boolean) => {
      updateAndPersist((prev) => ({ ...prev, speechEnabled: enabled }));
    },
    [updateAndPersist],
  );

  const saveMissionProgress = useCallback(
    (progress: MissionProgress) => {
      const key = getMissionProgressKey(progress.missionId, progress.grade);
      updateAndPersist((prev) => ({
        ...prev,
        lastActiveMissionKey: key,
        missionProgressByKey: {
          ...prev.missionProgressByKey,
          [key]: {
            ...progress,
            updatedAt: new Date().toISOString(),
          },
        },
      }));
    },
    [updateAndPersist],
  );

  const getMissionProgress = useCallback(
    (missionId: string, grade?: GradeLevel): MissionProgress | null => {
      const targetGrade = grade ?? state.selectedGrade;
      if (!targetGrade) return null;
      const key = getMissionProgressKey(missionId, targetGrade);
      return state.missionProgressByKey[key] ?? null;
    },
    [state.missionProgressByKey, state.selectedGrade],
  );

  const getLatestUnfinishedMission = useCallback((): MissionProgress | null => {
    const entries = Object.values(state.missionProgressByKey).filter((m) => !m.completed);
    if (entries.length === 0) return null;
    return entries.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null;
  }, [state.missionProgressByKey]);

  const resetAllData = useCallback(async () => {
    await clearAllCampusData();
    setProfiles([]);
    setActiveProfileIdState(null);
    setState(createInitialStudentState());
    setStorageStatus(getStorageStatus());
  }, []);

  const activeGradeProfile = useMemo(
    () => getGradeProfile(state.selectedGrade),
    [state.selectedGrade],
  );

  const value = useMemo<CampusContextValue>(
    () => ({
      hydrated,
      state,
      storageStatus,
      activeGradeProfile,
      profiles,
      activeProfile,
      createProfile,
      switchProfile,
      updateProfile,
      deleteProfile,
      isProfileModalOpen,
      openProfileModal,
      closeProfileModal,
      markGateSeen,
      setDiscoveryPreference,
      setGrade,
      completeGuidedTour,
      completeOnboarding,
      replayWelcomeFlow,
      replayGuidedTour,
      setSpeechEnabled,
      saveMissionProgress,
      getMissionProgress,
      getLatestUnfinishedMission,
      resetAllData,
    }),
    [
      hydrated,
      state,
      storageStatus,
      activeGradeProfile,
      profiles,
      activeProfile,
      createProfile,
      switchProfile,
      updateProfile,
      deleteProfile,
      isProfileModalOpen,
      openProfileModal,
      closeProfileModal,
      markGateSeen,
      setDiscoveryPreference,
      setGrade,
      completeGuidedTour,
      completeOnboarding,
      replayWelcomeFlow,
      replayGuidedTour,
      setSpeechEnabled,
      saveMissionProgress,
      getMissionProgress,
      getLatestUnfinishedMission,
      resetAllData,
    ],
  );

  return (
    <MotionConfig reducedMotion="user">
      <CampusContext.Provider value={value}>
        {children}
        <ProfileSelectionModal open={isProfileModalOpen} onClose={closeProfileModal} />
      </CampusContext.Provider>
    </MotionConfig>
  );
}

export function useCampus(): CampusContextValue {
  const ctx = useContext(CampusContext);
  if (!ctx) {
    throw new Error('useCampus yalnızca CampusProviders içinde kullanılabilir.');
  }
  return ctx;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useOptionalCampus(): CampusContextValue | null {
  return useContext(CampusContext);
}
