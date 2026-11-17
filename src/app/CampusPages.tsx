import { Suspense, lazy } from 'react';
import { Link, Navigate, useParams } from 'react-router';
import { useCampus } from '@/src/app/CampusProviders';
import { CampusTopBar } from '@/src/components/CampusTopBar';

const CampusGateView = lazy(() =>
  import('@/src/features/entrance/CampusGateView').then((m) => ({ default: m.CampusGateView })),
);
const CourtyardWelcomeView = lazy(() =>
  import('@/src/features/courtyard/CourtyardWelcomeView').then((m) => ({
    default: m.CourtyardWelcomeView,
  })),
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

export function HomeRoutePage() {
  const { hydrated, state, markGateSeen, replayWelcomeFlow, completeOnboarding } = useCampus();

  if (!hydrated) {
    return (
      <main className="min-h-dvh flex items-center justify-center bg-[var(--campus-canvas)] p-6">
        <p className="text-sm font-medium text-[var(--campus-ink-muted)]">
          Kampüs hazırlanıyor...
        </p>
      </main>
    );
  }

  // 1. Henüz kapıyı görmediyse: Sinematik Taç Kapı Giriş Sahnesi
  if (!state.hasSeenGate) {
    return (
      <Suspense fallback={<RouteLoadingFallback />}>
        <CampusGateView onEnterCourtyard={markGateSeen} />
      </Suspense>
    );
  }

  // 2. Kapı görüldü ancak sınıf seçilmediyse veya karşılama tamamlanmadıysa: Karşılama & Sınıf Seçimi
  if (!state.hasCompletedOnboarding || state.selectedGrade === null) {
    const initialPhase =
      state.discoveryPreference === 'guided' &&
      state.selectedGrade !== null &&
      !state.hasCompletedGuidedTour
        ? 'guided-tour'
        : 'welcome-choice';

    return (
      <Suspense fallback={<RouteLoadingFallback />}>
        <CourtyardWelcomeView
          initialPhase={initialPhase}
          onFinishToMap={() => {
            completeOnboarding();
          }}
          onReplayGate={replayWelcomeFlow}
        />
      </Suspense>
    );
  }

  // 3. Karşılama ve sınıf seçimi tamamlandı: Tek Girişli Yürünebilir Kampüs Avlusu
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <WalkableCampusView />
    </Suspense>
  );
}

export function CampusMapRoutePage() {
  // Eski /harita URL'si açıldığında yönlendirme döngüsü veya 404 olmadan doğrudan yürünebilir kampüse geç
  return <Navigate to="/" replace />;
}

export function LearningAreaRoutePage() {
  const { id } = useParams<{ id: string }>();
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <LearningAreaView areaId={id ?? ''} />
    </Suspense>
  );
}

export function MissionRoutePage() {
  const { id } = useParams<{ id: string }>();
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
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <WalkableCampusView />
    </Suspense>
  );
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
