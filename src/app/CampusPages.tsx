import { Link, useNavigate, useParams } from 'react-router';
import { useCampus } from '@/src/app/CampusProviders';
import { CampusTopBar } from '@/src/components/CampusTopBar';
import { CampusGateView } from '@/src/features/entrance/CampusGateView';
import { CourtyardWelcomeView } from '@/src/features/courtyard/CourtyardWelcomeView';
import { CampusMapView } from '@/src/features/campus-map/CampusMapView';
import { LearningAreaView } from '@/src/features/learning-areas/LearningAreaView';
import { MissionRunnerView } from '@/src/features/missions/MissionRunnerView';
import { JourneyView } from '@/src/features/journey/JourneyView';
import { DesignSystemPreviewView } from '@/src/features/design-system/DesignSystemPreviewView';

export function HomeRoutePage() {
  const navigate = useNavigate();
  const { hydrated, state, markGateSeen, replayWelcomeFlow } = useCampus();

  if (!hydrated) {
    return (
      <main className="min-h-dvh flex items-center justify-center bg-[var(--campus-canvas)] p-6">
        <p className="text-sm font-medium text-[var(--campus-ink-muted)]">
          Kampüs hazırlanıyor...
        </p>
      </main>
    );
  }

  if (state.hasCompletedOnboarding && state.selectedGrade !== null) {
    return (
      <>
        <CampusTopBar />
        <CampusMapView />
      </>
    );
  }

  if (!state.hasSeenGate) {
    return <CampusGateView onEnterCourtyard={markGateSeen} />;
  }

  const initialPhase =
    state.discoveryPreference === 'guided' &&
    state.selectedGrade !== null &&
    !state.hasCompletedGuidedTour
      ? 'guided-tour'
      : 'welcome-choice';

  return (
    <CourtyardWelcomeView
      initialPhase={initialPhase}
      onFinishToMap={() => navigate('/harita')}
      onReplayGate={replayWelcomeFlow}
    />
  );
}

export function CampusMapRoutePage() {
  return (
    <>
      <CampusTopBar />
      <CampusMapView />
    </>
  );
}

export function LearningAreaRoutePage() {
  const { id } = useParams<{ id: string }>();
  return <LearningAreaView areaId={id ?? ''} />;
}

export function MissionRoutePage() {
  const { id } = useParams<{ id: string }>();
  return <MissionRunnerView missionId={id ?? ''} />;
}

export function JourneyRoutePage() {
  return <JourneyView />;
}

export function DesignSystemRoutePage() {
  return <DesignSystemPreviewView />;
}

export function NotFoundRoutePage() {
  return (
    <>
      <CampusTopBar />
      <main className="max-w-3xl mx-auto px-4 py-12 text-center space-y-4">
        <h1 className="text-2xl font-bold text-[var(--campus-ink)]">Sayfa Bulunamadı</h1>
        <p className="text-sm text-[var(--campus-ink-muted)]">
          Aradığın kampüs bölümü bulunamadı. Haritaya dönerek devam edebilirsin.
        </p>
        <Link
          to="/harita"
          className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[var(--seljuk-teal)] text-white text-sm font-semibold inline-flex items-center justify-center"
        >
          Kampüs Haritasına Dön
        </Link>
      </main>
    </>
  );
}
