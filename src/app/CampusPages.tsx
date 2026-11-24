import { Suspense, lazy, useCallback, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router';
import { useCampus } from '@/src/app/CampusProviders';
import { isSupportedGrade } from '@/src/types/campus';
import { CampusTopBar } from '@/src/components/CampusTopBar';
import { getStudentCharacter, type StudentCharacterId } from '@/src/data/studentCharacters';
import { CharacterSelectionView } from '@/src/features/walkable/CharacterSelectionView';

const CampusGateView = lazy(() =>
  import('@/src/features/entrance/CampusGateView').then((m) => ({ default: m.CampusGateView })),
);
const LearningAreaView = lazy(() =>
  import('@/src/features/learning-areas/LearningAreaView').then((m) => ({
    default: m.LearningAreaView,
  })),
);
const MissionRunnerView = lazy(() =>
  import('@/src/features/missions/MissionRunnerView').then((m) => ({
    default: m.MissionRunnerView,
  })),
);
const JourneyView = lazy(() =>
  import('@/src/features/journey/JourneyView').then((m) => ({ default: m.JourneyView })),
);
const DesignSystemPreviewView = lazy(() =>
  import('@/src/features/design-system/DesignSystemPreviewView').then((m) => ({
    default: m.DesignSystemPreviewView,
  })),
);
const WalkableCampusView = lazy(() =>
  import('@/src/features/walkable/WalkableCampusView').then((m) => ({
    default: m.WalkableCampusView,
  })),
);

function RouteLoadingFallback() {
  return (
    <main className="min-h-dvh flex items-center justify-center bg-[var(--campus-canvas)] p-6">
      <p className="text-sm font-medium text-[var(--campus-ink-muted)]">
        Kampüs bölümü yükleniyor...
      </p>
    </main>
  );
}

type CampusEntry =
  | { step: 'gate' | 'select' | 'arrived' }
  | { step: 'cinematic'; profileId: string; characterId: StudentCharacterId };

export function HomeRoutePage() {
  const {
    hydrated, activeProfile, enteredCourtyardProfileId, openProfileModal, updateProfile,
    markGateSeen, replayWelcomeFlow,
  } = useCampus();
  const [entry, setEntry] = useState<CampusEntry>({ step: 'gate' });
  const profileId = activeProfile?.id;
  const character = getStudentCharacter(activeProfile?.characterId);
  const hasSeenCinematic = activeProfile?.hasSeenEntranceCinematic === true;

  const startEntry = () => {
    setEntry({ step: 'select' });
    if (!profileId) openProfileModal();
  };

  const finishEntry = useCallback((playedCinematic: boolean) => {
    if (entry.step !== 'cinematic' || entry.profileId !== profileId) return;
    if (playedCinematic && !hasSeenCinematic) {
      updateProfile(entry.profileId, {
        characterId: entry.characterId,
        hasSeenEntranceCinematic: true,
      });
    }
    setEntry({ step: playedCinematic ? 'arrived' : 'gate' });
    markGateSeen();
  }, [entry, hasSeenCinematic, markGateSeen, profileId, updateProfile]);

  if (!hydrated) return <RouteLoadingFallback />;

  if (entry.step === 'select') {
    if (!profileId) return <RouteLoadingFallback />;
    return (
      <CharacterSelectionView
        key={profileId}
        initialCharacterId={character?.id}
        onConfirm={(characterId) => {
          updateProfile(profileId, { characterId });
          setEntry({ step: 'cinematic', profileId, characterId });
        }}
      />
    );
  }

  if (entry.step === 'cinematic' && entry.profileId === profileId) {
    return (
      <Suspense fallback={<RouteLoadingFallback />}>
        <CampusGateView
          key={profileId}
          characterId={entry.characterId}
          canSkipCinematic={hasSeenCinematic}
          onEnterCourtyard={finishEntry}
        />
      </Suspense>
    );
  }

  if (character && enteredCourtyardProfileId === profileId) {
    return (
      <Suspense fallback={<RouteLoadingFallback />}>
        <WalkableCampusView
          characterId={character.id}
          arrivedThroughGate={entry.step === 'arrived'}
          onExitToGate={replayWelcomeFlow}
        />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <CampusGateView onEnterCourtyard={startEntry} />
    </Suspense>
  );
}

export function CampusMapRoutePage() {
  // Eski /harita URL'si açıldığında yönlendirme döngüsü veya 404 olmadan doğrudan yürünebilir kampüse geç
  return <Navigate to="/" replace />;
}

export function LearningAreaRoutePage() {
  const { id } = useParams<{ id: string }>();
  const { state } = useCampus();
  if (!state.selectedGrade || !isSupportedGrade(state.selectedGrade)) {
    return <Navigate to="/" replace />;
  }
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <LearningAreaView areaId={id ?? ''} />
    </Suspense>
  );
}

export function MissionRoutePage() {
  const { id } = useParams<{ id: string }>();
  const { state } = useCampus();
  if (!state.selectedGrade || !isSupportedGrade(state.selectedGrade)) {
    return <Navigate to="/" replace />;
  }
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <MissionRunnerView missionId={id ?? ''} />
    </Suspense>
  );
}

export function JourneyRoutePage() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <JourneyView />
    </Suspense>
  );
}

export function DesignSystemRoutePage() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <DesignSystemPreviewView />
    </Suspense>
  );
}

export function WalkableCampusRoutePage() {
  return <HomeRoutePage />;
}

export function NotFoundRoutePage() {
  return (
    <>
      <CampusTopBar />
      <main className="max-w-3xl mx-auto px-4 py-12 text-center space-y-4">
        <h1 className="text-2xl font-bold text-[var(--campus-ink)]">Sayfa Bulunamadı</h1>
        <p className="text-sm text-[var(--campus-ink-muted)]">
          Aradığın kampüs bölümü bulunamadı. Kampüs avlusuna dönerek keşfe devam edebilirsin.
        </p>
        <Link
          to="/"
          className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[var(--seljuk-teal)] text-white text-sm font-semibold inline-flex items-center justify-center"
        >
          Kampüs Avlusuna Dön
        </Link>
      </main>
    </>
  );
}
