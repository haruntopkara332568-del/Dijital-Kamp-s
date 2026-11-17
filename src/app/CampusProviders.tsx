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
  type StorageStatus,
} from '@/src/services/storage';
import type {
  CampusStudentState,
  DiscoveryPreference,
  GradeLevel,
  MissionProgress,
} from '@/src/types/campus';
import { getGradeProfile } from '@/src/data/gradeProfiles';

interface CampusContextValue {
  hydrated: boolean;
  state: CampusStudentState;
  storageStatus: StorageStatus;
  activeGradeProfile: ReturnType<typeof getGradeProfile>;
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

  const [state, setState] = useState<CampusStudentState>(() =>
    typeof window !== 'undefined' ? loadStudentState() : createInitialStudentState(),
  );
  const [storageStatus, setStorageStatus] = useState<StorageStatus>(() =>
    typeof window !== 'undefined'
      ? getStorageStatus()
      : { mode: 'persistent', persisted: true, warningMessage: null },
  );

  const updateAndPersist = useCallback(
    (updater: (prev: CampusStudentState) => CampusStudentState) => {
      setState((prev) => {
        const next = updater(prev);
        const status = saveStudentState(next);
        setStorageStatus(status);
        return next;
      });
    },
    [],
  );

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
    },
    [updateAndPersist],
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
      <CampusContext.Provider value={value}>{children}</CampusContext.Provider>
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
