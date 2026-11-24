import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Compass,
  Lightbulb,
  Moon,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Sun,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useOptionalCampus } from '@/src/app/CampusProviders';
import {
  ACTIVE_DISCOVERY_MISSION_ID,
  ACTIVE_DISCOVERY_MISSION_VERSION,
  ACTIVE_DISCOVERY_UI_COPY,
  ACTIVE_EXPERIMENTS,
  INQUIRY_STEPS,
  MOON_PHASES,
  TURKEY_COORDS,
  detectMoonPhaseAtAngle,
  getActiveExperiment,
  projectSurfacePoint,
  type ActiveExperimentId,
  type ExperimentChoiceOption,
  type InquiryStageId,
  type MoonPhaseId,
} from '@/src/data/earthSunMoonExperiments';
import type { MissionProgress, MissionStageId, SupportedGrade } from '@/src/types/campus';
import {
  CelestialGlobeCanvas,
  type SurfaceClickHit,
  type SurfacePin,
} from './CelestialGlobeCanvas';

export interface EarthSunMoonExperimentsViewProps {
  activeGrade: SupportedGrade;
  speechEnabled: boolean;
  isSpeaking: boolean;
  speechNotice: string | null;
  onSpeak: (text: string) => void;
  onStopSpeech: () => void;
  onBackToObservatory: () => void;
}

const EARTH_TILT_X = 0.22;
const INITIAL_DAY_NIGHT_ROT_Y = 0.58; // Türkiye ön ortada alacakaranlık çizgisinde başlar

function isValidExperimentId(id: string): id is ActiveExperimentId {
  return id === 'exp-sunlight' || id === 'exp-day-night' || id === 'exp-moon-phases';
}

function isValidMoonPhaseId(id: string): id is MoonPhaseId {
  return (
    id === 'new-moon' ||
    id === 'first-quarter' ||
    id === 'full-moon' ||
    id === 'last-quarter'
  );
}

function normalizeAngleDeg(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

interface MarkedRegionPin {
  lonDeg: number;
  latDeg: number;
}

interface MoonOrbitCanvasProps {
  phaseAngleDeg: number;
  onChangeAngle: (nextDeg: number) => void;
}

function MoonOrbitCanvas({ phaseAngleDeg, onChangeAngle }: MoonOrbitCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const draggingRef = useRef(false);

  const width = 320;
  const height = 252;
  const earthCx = 186;
  const earthCy = 126;
  const orbitR = 78;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Uzay arka planı
    const bg = ctx.createRadialGradient(earthCx, earthCy, 14, earthCx, earthCy, 210);
    bg.addColorStop(0, '#12264f');
    bg.addColorStop(0.65, '#08142e');
    bg.addColorStop(1, '#040917');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // İnce yıldız noktaları
    for (let i = 0; i < 28; i++) {
      const sx = ((i * 67 + 29) % 100) * 0.01 * width;
      const sy = ((i * 43 + 17) % 100) * 0.01 * height;
      ctx.fillStyle = `rgba(255, 248, 224, ${0.25 + (i % 5) * 0.1})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 0.8 + (i % 3) * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    // Solda sabit Güneş ve paralel sağa yönlü güneş ışınları
    const sunGrad = ctx.createRadialGradient(-8, earthCy, 10, -8, earthCy, 74);
    sunGrad.addColorStop(0, '#fff7cc');
    sunGrad.addColorStop(0.42, '#fbbf24');
    sunGrad.addColorStop(0.75, 'rgba(249, 115, 22, 0.38)');
    sunGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(-8, earthCy, 74, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.arc(-16, earthCy, 42, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.fill();

    // Güneş etiketi
    ctx.save();
    ctx.fillStyle = '#fef3c7';
    ctx.font = '700 11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Güneş', 6, 20);
    ctx.restore();

    // Paralel ışık okları (soldan sağa)
    ctx.save();
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.42)';
    ctx.fillStyle = 'rgba(253, 224, 71, 0.58)';
    ctx.lineWidth = 1.4;
    for (const rayY of [42, 84, 126, 168, 210]) {
      ctx.beginPath();
      ctx.moveTo(34, rayY);
      ctx.lineTo(74, rayY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(78, rayY);
      ctx.lineTo(70, rayY - 3.5);
      ctx.lineTo(70, rayY + 3.5);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Ay yörünge çemberi
    ctx.save();
    ctx.strokeStyle = 'rgba(186, 214, 255, 0.38)';
    ctx.lineWidth = 1.6;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(earthCx, earthCy, orbitR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Dört temel evre rehber işaret noktası
    ctx.save();
    ctx.font = '600 10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const phase of MOON_PHASES) {
      const rad = (phase.phaseAngleDeg * Math.PI) / 180;
      const px = earthCx - Math.cos(rad) * orbitR;
      const py = earthCy + Math.sin(rad) * orbitR;

      ctx.fillStyle = 'rgba(246, 220, 155, 0.55)';
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fill();

      const labelOffsetX =
        phase.phaseAngleDeg === 0 ? -24 : phase.phaseAngleDeg === 180 ? 28 : 0;
      const labelOffsetY =
        phase.phaseAngleDeg === 90 ? 20 : phase.phaseAngleDeg === 270 ? -20 : 19;
      ctx.fillStyle = 'rgba(219, 234, 254, 0.78)';
      ctx.fillText(phase.label, px + labelOffsetX, py + labelOffsetY);
    }
    ctx.restore();

    // Dünya (merkezde: sol yarısı Güneş'e baktığı için aydınlık, sağ yarısı karanlık)
    const earthR = 23;
    ctx.save();
    ctx.beginPath();
    ctx.arc(earthCx, earthCy, earthR, 0, Math.PI * 2);
    ctx.clip();

    // Karanlık sağ yarı
    ctx.fillStyle = '#0f2247';
    ctx.fillRect(earthCx - earthR, earthCy - earthR, earthR * 2, earthR * 2);

    // Aydınlık sol yarı
    ctx.fillStyle = '#2589d8';
    ctx.fillRect(earthCx - earthR, earthCy - earthR, earthR, earthR * 2);
    // Küçük yeşil kara lekesi
    ctx.fillStyle = '#3ca66b';
    ctx.beginPath();
    ctx.arc(earthCx - 8, earthCy - 5, 7, 0, Math.PI * 2);
    ctx.arc(earthCx - 6, earthCy + 7, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = 'rgba(125, 211, 252, 0.75)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(earthCx, earthCy, earthR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#e0f2fe';
    ctx.font = '700 10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Dünya', earthCx, earthCy + earthR + 12);

    // Ay konumu (Güneş'e bakan SOL yarısı HER ZAMAN aydınlık — Dünya gölgesi YOK!)
    const alpha = (phaseAngleDeg * Math.PI) / 180;
    const moonX = earthCx - Math.cos(alpha) * orbitR;
    const moonY = earthCy + Math.sin(alpha) * orbitR;
    const moonR = 14;

    // Dünya -> Ay bakış çizgisi (ince kılavuz)
    ctx.save();
    ctx.strokeStyle = 'rgba(246, 220, 155, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(earthCx, earthCy);
    ctx.lineTo(moonX, moonY);
    ctx.stroke();
    ctx.restore();

    // Ay seçim halkası
    ctx.strokeStyle = '#f6dc9b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR + 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.clip();
    // Sağ yarı (karanlık)
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(moonX - moonR, moonY - moonR, moonR * 2, moonR * 2);
    // Sol yarı (Güneş'e dönük aydınlık yarım küre — her konumda sabit solda)
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(moonX - moonR, moonY - moonR, moonR, moonR * 2);
    ctx.restore();

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.stroke();
  }, [phaseAngleDeg]);

  const updateAngleFromPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = ((e.clientX - rect.left) / rect.width) * width;
    const y = ((e.clientY - rect.top) / rect.height) * height;
    const rad = Math.atan2(y - earthCy, -(x - earthCx));
    const deg = normalizeAngleDeg((rad * 180) / Math.PI);
    onChangeAngle(Math.round(deg));
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      role="slider"
      aria-label="Ay yörünge konumu"
      aria-valuemin={0}
      aria-valuemax={360}
      aria-valuenow={Math.round(phaseAngleDeg)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          e.preventDefault();
          onChangeAngle(normalizeAngleDeg(phaseAngleDeg + 15));
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          e.preventDefault();
          onChangeAngle(normalizeAngleDeg(phaseAngleDeg - 15));
        }
      }}
      onPointerDown={(e) => {
        draggingRef.current = true;
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // Tarayıcı emniyeti
        }
        updateAngleFromPointer(e);
      }}
      onPointerMove={(e) => {
        if (!draggingRef.current) return;
        updateAngleFromPointer(e);
      }}
      onPointerUp={(e) => {
        draggingRef.current = false;
        try {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
        } catch {
          // Emniyet
        }
      }}
      onPointerCancel={() => {
        draggingRef.current = false;
      }}
      className="h-[220px] w-full max-w-[320px] cursor-grab rounded-2xl border border-[#f6dc9b]/25 shadow-inner active:cursor-grabbing touch-none sm:h-[252px]"
    />
  );
}

export function EarthSunMoonExperimentsView({
  activeGrade,
  speechEnabled,
  isSpeaking,
  speechNotice,
  onSpeak,
  onStopSpeech,
  onBackToObservatory,
}: EarthSunMoonExperimentsViewProps) {
  const campus = useOptionalCampus();

  // Yerel öğrenci profilinden kayıtlı deney ilerlemesini yükle
  const [completedExperiments, setCompletedExperiments] = useState<ActiveExperimentId[]>(() => {
    const saved = campus?.getMissionProgress(ACTIVE_DISCOVERY_MISSION_ID, activeGrade);
    return (saved?.selections.selectedDoorIds ?? []).filter(isValidExperimentId);
  });

  const [activeExpId, setActiveExpId] = useState<ActiveExperimentId>('exp-sunlight');

  // --- DENEY 1 DURUMU (Güneş'in Işığı) ---
  const [exp1Predicted, setExp1Predicted] = useState(false);
  const [exp1PredictFeedback, setExp1PredictFeedback] = useState<{
    text: string;
    isCorrect: boolean;
  } | null>(null);
  const [exp1LightOn, setExp1LightOn] = useState(false);
  const [exp1ViewAngle, setExp1ViewAngle] = useState(0); // 0 = Önden/Yandan
  const [exp1LitPin, setExp1LitPin] = useState<MarkedRegionPin | null>(null);
  const [exp1DarkPin, setExp1DarkPin] = useState<MarkedRegionPin | null>(null);
  const [exp1MarkFeedback, setExp1MarkFeedback] = useState<string | null>(null);
  const [exp1ExplainFeedback, setExp1ExplainFeedback] = useState<{
    text: string;
    isCorrect: boolean;
  } | null>(null);
  const [exp1Explained, setExp1Explained] = useState(false);

  // --- DENEY 2 DURUMU (Gündüz ve Gece) ---
  const [exp2Predicted, setExp2Predicted] = useState(false);
  const [exp2PredictFeedback, setExp2PredictFeedback] = useState<{
    text: string;
    isCorrect: boolean;
  } | null>(null);
  const [exp2RotY, setExp2RotY] = useState(INITIAL_DAY_NIGHT_ROT_Y);
  const [exp2Spinning, setExp2Spinning] = useState(false);
  const [exp2CreatedDay, setExp2CreatedDay] = useState(false);
  const [exp2CreatedNight, setExp2CreatedNight] = useState(false);
  const [exp2ExplainFeedback, setExp2ExplainFeedback] = useState<{
    text: string;
    isCorrect: boolean;
  } | null>(null);
  const [exp2Explained, setExp2Explained] = useState(false);

  // --- DENEY 3 DURUMU (Ay'ın Evreleri) ---
  const [exp3Predicted, setExp3Predicted] = useState(false);
  const [exp3PredictFeedback, setExp3PredictFeedback] = useState<{
    text: string;
    isCorrect: boolean;
  } | null>(null);
  const [exp3PhaseAngleDeg, setExp3PhaseAngleDeg] = useState(38); // Ara konumda başlar; öğrenci hareket ettirir
  const [exp3HasMovedMoon, setExp3HasMovedMoon] = useState(false);
  const [exp3ObservedPhases, setExp3ObservedPhases] = useState<MoonPhaseId[]>(() => {
    const saved = campus?.getMissionProgress(ACTIVE_DISCOVERY_MISSION_ID, activeGrade);
    return (saved?.selections.matchedVocabularyIds ?? []).filter(isValidMoonPhaseId);
  });
  const [exp3ExplainFeedback, setExp3ExplainFeedback] = useState<{
    text: string;
    isCorrect: boolean;
  } | null>(null);
  const [exp3Explained, setExp3Explained] = useState(false);

  const persistProgress = useCallback(
    (nextCompleted: ActiveExperimentId[], nextPhases: MoonPhaseId[]) => {
      if (!campus) return;
      const exp1Done = nextCompleted.includes('exp-sunlight');
      const exp2Done = nextCompleted.includes('exp-day-night');
      const exp3Done = nextCompleted.includes('exp-moon-phases');
      const requiredDone =
        activeGrade === 2 ? exp1Done && exp2Done : exp1Done && exp2Done && exp3Done;

      const completedStages: MissionStageId[] = [];
      if (nextCompleted.length > 0) completedStages.push('kesfet');
      if (requiredDone) completedStages.push('ogren');

      const existing = campus.getMissionProgress(ACTIVE_DISCOVERY_MISSION_ID, activeGrade);
      const progress: MissionProgress = {
        missionId: ACTIVE_DISCOVERY_MISSION_ID,
        missionVersion: ACTIVE_DISCOVERY_MISSION_VERSION,
        grade: activeGrade,
        currentStage: requiredDone ? 'ogren' : 'kesfet',
        completedStages,
        selections: {
          selectedDoorIds: nextCompleted,
          inspectedCampusGate: requiredDone,
          observationNotes: {},
          matchedVocabularyIds: nextPhases,
          matchedExampleSentence: requiredDone,
          doorName: 'Dünya, Güneş ve Ay — Aktif Keşif',
          writtenText: '',
          usedEnglishWords: [],
        },
        draftArtifactId: null,
        selfEvaluation: null,
        completed: requiredDone,
        completedAt: requiredDone ? (existing?.completedAt ?? new Date().toISOString()) : null,
        updatedAt: new Date().toISOString(),
      };
      campus.saveMissionProgress(progress);
    },
    [campus, activeGrade],
  );

  const markExperimentCompleted = useCallback(
    (expId: ActiveExperimentId, phasesOverride?: MoonPhaseId[]) => {
      setCompletedExperiments((prev) => {
        const next = prev.includes(expId) ? prev : [...prev, expId];
        persistProgress(next, phasesOverride ?? exp3ObservedPhases);
        return next;
      });
    },
    [exp3ObservedPhases, persistProgress],
  );

  // Deney 2 dönme güncellemesi (sürükleme, düğmeler ve sürekli dönme için tek fonksiyon)
  const exp2RotRef = useRef(INITIAL_DAY_NIGHT_ROT_Y);

  const applyExp2Rotation = useCallback((nextRotY: number) => {
    exp2RotRef.current = nextRotY;
    setExp2RotY(nextRotY);
    const proj = projectSurfacePoint(
      TURKEY_COORDS.lonDeg,
      TURKEY_COORDS.latDeg,
      nextRotY,
      EARTH_TILT_X,
    );
    const dotLight = -proj.nx; // Güneş solda (-1, 0, 0)
    if (dotLight > 0.28) {
      setExp2CreatedDay(true);
    } else if (dotLight < -0.28) {
      setExp2CreatedNight(true);
    }
  }, []);

  // Deney 2 sürekli eksen dönüşü (requestAnimationFrame)
  useEffect(() => {
    if (!exp2Spinning || activeExpId !== 'exp-day-night') return;
    let rafId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.08, (now - lastTime) / 1000);
      lastTime = now;
      // Dünya batıdan doğuya döner (ön yüz soldan sağa doğru ilerler)
      const nextRot = exp2RotRef.current - dt * 0.85;
      applyExp2Rotation(nextRot);
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [activeExpId, applyExp2Rotation, exp2Spinning]);

  const activeExperiment = getActiveExperiment(activeExpId);
  const gradePack = activeExperiment.byGrade[activeGrade];

  const handleSelectExperiment = (id: ActiveExperimentId) => {
    onStopSpeech();
    setExp2Spinning(false);
    setActiveExpId(id);
  };

  const handleRetryCurrentExperiment = () => {
    onStopSpeech();
    if (activeExpId === 'exp-sunlight') {
      setExp1Predicted(false);
      setExp1PredictFeedback(null);
      setExp1LightOn(false);
      setExp1ViewAngle(0);
      setExp1LitPin(null);
      setExp1DarkPin(null);
      setExp1MarkFeedback(null);
      setExp1ExplainFeedback(null);
      setExp1Explained(false);
    } else if (activeExpId === 'exp-day-night') {
      setExp2Predicted(false);
      setExp2PredictFeedback(null);
      setExp2Spinning(false);
      exp2RotRef.current = INITIAL_DAY_NIGHT_ROT_Y;
      setExp2RotY(INITIAL_DAY_NIGHT_ROT_Y);
      setExp2CreatedDay(false);
      setExp2CreatedNight(false);
      setExp2ExplainFeedback(null);
      setExp2Explained(false);
    } else {
      setExp3Predicted(false);
      setExp3PredictFeedback(null);
      setExp3PhaseAngleDeg(38);
      setExp3HasMovedMoon(false);
      setExp3ObservedPhases([]);
      setExp3ExplainFeedback(null);
      setExp3Explained(false);
    }
  };

  const speakIfEnabled = useCallback(
    (text: string) => {
      if (speechEnabled) {
        onSpeak(text);
      }
    },
    [onSpeak, speechEnabled],
  );

  // Mevcut deneyin aktif aşamasını hesapla
  const currentInquiryStage: InquiryStageId = useMemo(() => {
    if (activeExpId === 'exp-sunlight') {
      if (!exp1Predicted) return 'predict';
      if (!exp1LightOn) return 'experiment';
      if (!exp1LitPin || !exp1DarkPin) return 'observe';
      return 'explain';
    }
    if (activeExpId === 'exp-day-night') {
      if (!exp2Predicted) return 'predict';
      if (!exp2CreatedDay || !exp2CreatedNight) return 'experiment';
      return 'explain';
    }
    if (!exp3Predicted) return 'predict';
    if (!exp3HasMovedMoon) return 'experiment';
    if (exp3ObservedPhases.length < 2) return 'observe';
    return 'explain';
  }, [
    activeExpId,
    exp1DarkPin,
    exp1LightOn,
    exp1LitPin,
    exp1Predicted,
    exp2CreatedDay,
    exp2CreatedNight,
    exp2Predicted,
    exp3HasMovedMoon,
    exp3ObservedPhases.length,
    exp3Predicted,
  ]);

  const currentStageIndex = INQUIRY_STEPS.findIndex((s) => s.id === currentInquiryStage);
  const isCurrentExpDone =
    (activeExpId === 'exp-sunlight' && exp1Explained) ||
    (activeExpId === 'exp-day-night' && exp2Explained) ||
    (activeExpId === 'exp-moon-phases' && exp3Explained) ||
    completedExperiments.includes(activeExpId);

  // --- DENEY 1 ETKİLEŞİMLERİ ---
  const exp1LightDirection = useMemo(
    () => ({
      x: -Math.cos(exp1ViewAngle),
      y: 0,
      z: -Math.sin(exp1ViewAngle),
    }),
    [exp1ViewAngle],
  );

  const exp1SurfacePins = useMemo<SurfacePin[]>(() => {
    const pins: SurfacePin[] = [];
    if (exp1LitPin) {
      pins.push({
        id: 'lit',
        lonDeg: exp1LitPin.lonDeg,
        latDeg: exp1LitPin.latDeg,
        label: 'Aydınlık',
        color: '#facc15',
      });
    }
    if (exp1DarkPin) {
      pins.push({
        id: 'dark',
        lonDeg: exp1DarkPin.lonDeg,
        latDeg: exp1DarkPin.latDeg,
        label: 'Karanlık',
        color: '#60a5fa',
      });
    }
    return pins;
  }, [exp1DarkPin, exp1LitPin]);

  const handleExp1SurfaceClick = (hit: SurfaceClickHit) => {
    if (!exp1Predicted) {
      setExp1MarkFeedback('Önce 1. adımda tahminini seç.');
      return;
    }
    if (!exp1LightOn) {
      setExp1MarkFeedback("Önce 'Işığı Aç' düğmesine basarak Güneş ışığını aç.");
      return;
    }

    if (!exp1LitPin) {
      if (hit.dotLight > 0.08) {
        setExp1LitPin({ lonDeg: hit.lonDeg, latDeg: hit.latDeg });
        const msg = 'Harika! Aydınlık bölgeyi işaretledin. Şimdi karanlık (gölgeli) bölgeye dokun.';
        setExp1MarkFeedback(msg);
        speakIfEnabled(msg);
      } else {
        const msg =
          'Dokunduğun yer karanlık bölgede kaldı. Güneş’e bakan parlak tarafa dokunmayı dene!';
        setExp1MarkFeedback(msg);
        speakIfEnabled(msg);
      }
      return;
    }

    if (!exp1DarkPin) {
      if (hit.dotLight < -0.08) {
        setExp1DarkPin({ lonDeg: hit.lonDeg, latDeg: hit.latDeg });
        const msg =
          'Süper! Hem aydınlık hem karanlık bölgeyi doğru işaretledin. Şimdi 4. adımda gözlemini açıkla.';
        setExp1MarkFeedback(msg);
        speakIfEnabled(msg);
      } else {
        const msg =
          'Burası aydınlık tarafta. Güneş ışığı almayan koyu (karanlık) bölgeye dokunmayı dene!';
        setExp1MarkFeedback(msg);
        speakIfEnabled(msg);
      }
      return;
    }

    // Her ikisi de işaretlendiyse öğrenci tıkladığı bölgeyi güncelleyebilir
    if (hit.dotLight > 0.08) {
      setExp1LitPin({ lonDeg: hit.lonDeg, latDeg: hit.latDeg });
      setExp1MarkFeedback('Aydınlık bölge işareti güncellendi.');
    } else if (hit.dotLight < -0.08) {
      setExp1DarkPin({ lonDeg: hit.lonDeg, latDeg: hit.latDeg });
      setExp1MarkFeedback('Karanlık bölge işareti güncellendi.');
    }
  };

  // --- DENEY 2 HESAPLAMALARI ---
  const turkeyProj = projectSurfacePoint(
    TURKEY_COORDS.lonDeg,
    TURKEY_COORDS.latDeg,
    exp2RotY,
    EARTH_TILT_X,
  );
  const turkeyDotLight = -turkeyProj.nx;
  const turkeyStatus: 'day' | 'night' | 'twilight' =
    turkeyDotLight > 0.28 ? 'day' : turkeyDotLight < -0.28 ? 'night' : 'twilight';

  const exp2SurfacePins = useMemo<SurfacePin[]>(
    () => [
      {
        id: 'turkey',
        lonDeg: TURKEY_COORDS.lonDeg,
        latDeg: TURKEY_COORDS.latDeg,
        label: TURKEY_COORDS.label,
        color: '#ef4444',
        showWhenBack: true,
      },
    ],
    [],
  );

  // --- DENEY 3 HESAPLAMALARI ---
  const detectedPhase = detectMoonPhaseAtAngle(exp3PhaseAngleDeg);
  const moonPhaseAlpha = (exp3PhaseAngleDeg * Math.PI) / 180;
  const moonEarthViewLightDir = useMemo(
    () => ({
      x: Math.sin(moonPhaseAlpha),
      y: 0,
      z: -Math.cos(moonPhaseAlpha),
    }),
    [moonPhaseAlpha],
  );

  const handleMoveMoonAngle = (nextDeg: number) => {
    setExp3PhaseAngleDeg(normalizeAngleDeg(nextDeg));
    setExp3HasMovedMoon(true);
  };

  const handleSaveDetectedPhase = () => {
    if (!detectedPhase) return;
    if (exp3ObservedPhases.includes(detectedPhase.id)) return;
    const next = [...exp3ObservedPhases, detectedPhase.id];
    setExp3ObservedPhases(next);
    persistProgress(completedExperiments, next);
    speakIfEnabled(`${detectedPhase.label} kaydedildi. ${detectedPhase.earthViewSummary}`);
  };

  const handlePredictOption = (option: ExperimentChoiceOption) => {
    speakIfEnabled(option.feedback);
    if (activeExpId === 'exp-sunlight') {
      setExp1PredictFeedback({ text: option.feedback, isCorrect: option.isCorrect });
      if (option.isCorrect) setExp1Predicted(true);
    } else if (activeExpId === 'exp-day-night') {
      setExp2PredictFeedback({ text: option.feedback, isCorrect: option.isCorrect });
      if (option.isCorrect) setExp2Predicted(true);
    } else {
      setExp3PredictFeedback({ text: option.feedback, isCorrect: option.isCorrect });
      if (option.isCorrect) setExp3Predicted(true);
    }
  };

  const handleExplainOption = (option: ExperimentChoiceOption) => {
    if (activeExpId === 'exp-sunlight') {
      setExp1ExplainFeedback({ text: option.feedback, isCorrect: option.isCorrect });
      if (option.isCorrect) {
        setExp1Explained(true);
        markExperimentCompleted('exp-sunlight');
        speakIfEnabled(activeExperiment.completionFeedback);
      } else {
        speakIfEnabled(option.feedback);
      }
    } else if (activeExpId === 'exp-day-night') {
      setExp2ExplainFeedback({ text: option.feedback, isCorrect: option.isCorrect });
      if (option.isCorrect) {
        setExp2Spinning(false);
        setExp2Explained(true);
        markExperimentCompleted('exp-day-night');
        speakIfEnabled(activeExperiment.completionFeedback);
      } else {
        speakIfEnabled(option.feedback);
      }
    } else {
      setExp3ExplainFeedback({ text: option.feedback, isCorrect: option.isCorrect });
      if (option.isCorrect) {
        setExp3Explained(true);
        markExperimentCompleted('exp-moon-phases', exp3ObservedPhases);
        speakIfEnabled(activeExperiment.completionFeedback);
      } else {
        speakIfEnabled(option.feedback);
      }
    }
  };

  const activePredictDone =
    activeExpId === 'exp-sunlight'
      ? exp1Predicted
      : activeExpId === 'exp-day-night'
        ? exp2Predicted
        : exp3Predicted;

  const activePredictFeedback =
    activeExpId === 'exp-sunlight'
      ? exp1PredictFeedback
      : activeExpId === 'exp-day-night'
        ? exp2PredictFeedback
        : exp3PredictFeedback;

  const activeExplainUnlocked =
    activeExpId === 'exp-sunlight'
      ? exp1Predicted && exp1LightOn && Boolean(exp1LitPin) && Boolean(exp1DarkPin)
      : activeExpId === 'exp-day-night'
        ? exp2Predicted && exp2CreatedDay && exp2CreatedNight
        : exp3Predicted && exp3HasMovedMoon && exp3ObservedPhases.length >= 2;

  const activeExplainDone =
    activeExpId === 'exp-sunlight'
      ? exp1Explained
      : activeExpId === 'exp-day-night'
        ? exp2Explained
        : exp3Explained;

  const activeExplainFeedback =
    activeExpId === 'exp-sunlight'
      ? exp1ExplainFeedback
      : activeExpId === 'exp-day-night'
        ? exp2ExplainFeedback
        : exp3ExplainFeedback;

  const allRequiredDone =
    activeGrade === 2
      ? completedExperiments.includes('exp-sunlight') &&
        completedExperiments.includes('exp-day-night')
      : ACTIVE_EXPERIMENTS.every((e) => completedExperiments.includes(e.id));

  const nextExperimentId: ActiveExperimentId | null =
    activeExpId === 'exp-sunlight'
      ? 'exp-day-night'
      : activeExpId === 'exp-day-night'
        ? 'exp-moon-phases'
        : null;

  return (
    <div data-testid="active-discovery-experiments" className="space-y-4">
      {/* Üç Aktif Deney Seçim Çubuğu */}
      <nav
        aria-label="Aktif keşif deneyleri"
        className="grid grid-cols-1 gap-2 sm:grid-cols-3"
      >
        {ACTIVE_EXPERIMENTS.map((exp) => {
          const isSelected = exp.id === activeExpId;
          const isCompleted = completedExperiments.includes(exp.id);
          const isOptional = Boolean(exp.byGrade[activeGrade].optionalForGrade);

          return (
            <button
              key={exp.id}
              type="button"
              data-testid={`experiment-tab-${exp.id}`}
              onClick={() => handleSelectExperiment(exp.id)}
              className={`flex min-h-[54px] cursor-pointer items-center justify-between gap-2 rounded-2xl border px-3.5 py-2 text-left transition-all ${
                isSelected
                  ? 'border-[#f6dc9b] bg-[#1a3469] shadow-lg ring-2 ring-[#f6dc9b]/35'
                  : 'border-[#d8a94c]/30 bg-[#0d1d3f]/90 hover:border-[#f3cc7a]/60 hover:bg-[#142b59]'
              }`}
            >
              <div className="min-w-0">
                <span className="block truncate text-xs font-extrabold text-[#fff7e2] sm:text-sm">
                  {exp.shortTitle}
                </span>
                <span className="block truncate text-[11px] text-[#bfd0ee]">
                  {isOptional ? ACTIVE_DISCOVERY_UI_COPY.optionalGrade2Badge : exp.title}
                </span>
              </div>
              {isCompleted ? (
                <CheckCircle2
                  className="h-5 w-5 shrink-0 text-emerald-400"
                  aria-label="Tamamlandı"
                />
              ) : (
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#f3cc7a]/40 bg-[#0a1733] text-xs font-bold text-[#f7df9d]">
                  {exp.order}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Üst Rehber Çubuğu + Aşama İzleyici */}
      <div className="rounded-2xl border border-[#d8a94c]/35 bg-[#102247]/95 p-3.5 sm:p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-extrabold text-[#fff8e6] sm:text-lg">
                {activeExperiment.order}. {activeExperiment.title}
              </h3>
              {gradePack.optionalForGrade && (
                <span className="rounded-full border border-sky-300/40 bg-sky-950/80 px-2.5 py-0.5 text-[11px] font-bold text-sky-200">
                  İsteğe Bağlı
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-[#f7df9d] sm:text-sm">
              Merak Sorusu: {activeExperiment.curiosityQuestion}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onSpeak(activeExperiment.voiceGuide)}
              className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-xl border border-[#f6dc9b]/50 bg-[#19356b] px-3 py-1.5 text-xs font-bold text-[#fff5d6] hover:bg-[#23488f]"
            >
              <Volume2
                className={`h-4 w-4 text-[#f6dc9b] ${isSpeaking ? 'animate-pulse' : ''}`}
                aria-hidden="true"
              />
              <span>{ACTIVE_DISCOVERY_UI_COPY.listenGuideLabel}</span>
            </button>

            <button
              type="button"
              onClick={handleRetryCurrentExperiment}
              className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-xl border border-[#d8a94c]/40 bg-[#0c1c3d] px-3 py-1.5 text-xs font-bold text-[#f7df9d] hover:bg-[#173063]"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{ACTIVE_DISCOVERY_UI_COPY.retryExperimentLabel}</span>
            </button>
          </div>
        </div>

        {/* Tahmin Et -> Deney Yap -> Gözlemle -> Açıkla Adım Çubuğu */}
        <ol className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {INQUIRY_STEPS.map((step, idx) => {
            const done = isCurrentExpDone || idx < currentStageIndex;
            const current = !isCurrentExpDone && idx === currentStageIndex;
            return (
              <li
                key={step.id}
                className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-1.5 text-center text-[11px] font-bold sm:text-xs ${
                  done
                    ? 'border-emerald-400/50 bg-emerald-950/60 text-emerald-200'
                    : current
                      ? 'border-[#f6dc9b] bg-[#1b3870] text-[#fff8e6]'
                      : 'border-[#d8a94c]/20 bg-[#09152e]/80 text-[#9cb2da]'
                }`}
              >
                {done && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />}
                <span>{step.label}</span>
              </li>
            );
          })}
        </ol>

        {speechNotice && (
          <div
            role="status"
            className="mt-2.5 flex items-center gap-2 rounded-xl border border-amber-400/35 bg-amber-950/50 px-3 py-1.5 text-xs text-amber-100"
          >
            <VolumeX className="h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
            <span>{speechNotice}</span>
          </div>
        )}
      </div>

      {/* Ana Deney Çalışma Alanı (Sol: Etkileşimli Bilimsel Model, Sağ: Yönergeler & Sorular) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* SOL PANEL: ETKİLEŞİMLİ DENEY MODELİ */}
        <section
          aria-label={`${activeExperiment.title} etkileşimli modeli`}
          className="flex flex-col justify-between rounded-3xl border border-[#d8a94c]/30 bg-[#071229] p-4 lg:col-span-7"
        >
          {/* DENEY 1 MODELİ */}
          {activeExpId === 'exp-sunlight' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-[#f7df9d]">
                  {!exp1LightOn
                    ? 'Güneş ışığı henüz kapalı — Işığı Aç düğmesini kullan'
                    : !exp1LitPin
                      ? 'Adım: Dünya üzerinde AYDINLIK (parlak) bölgeye dokun'
                      : !exp1DarkPin
                        ? 'Adım: Şimdi KARANLIK (gölgeli) bölgeye dokun'
                        : 'Aydınlık ve karanlık bölgeler işaretlendi!'}
                </span>
                <span className="rounded-full border border-sky-300/30 bg-sky-950/75 px-2.5 py-0.5 text-[11px] font-semibold text-sky-200">
                  {ACTIVE_DISCOVERY_UI_COPY.representativeBadge}
                </span>
              </div>

              {/* Sabit Güneş + Işık Işınları + 3B Dünya */}
              <div className="relative flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#f6dc9b]/20 bg-[#050d20] p-3 sm:flex-row sm:gap-4">
                {/* Sabit Güneş */}
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`rounded-full transition-all duration-300 ${
                      exp1LightOn
                        ? 'opacity-100 drop-shadow-[0_0_24px_rgba(251,191,36,0.75)]'
                        : 'opacity-45 grayscale-[35%]'
                    }`}
                  >
                    <CelestialGlobeCanvas
                      bodyId="sun"
                      size={92}
                      rotY={0.2}
                      rotX={0.08}
                      showStarfield={false}
                      ariaLabel="Sabit Güneş modeli"
                    />
                  </div>
                  <span className="text-xs font-extrabold text-amber-200">Güneş (Sabit)</span>
                </div>

                {/* Yönlü Işık Işınları */}
                <div
                  aria-hidden="true"
                  className={`flex flex-row items-center gap-1 transition-opacity duration-300 sm:flex-col sm:gap-2 ${
                    exp1LightOn ? 'opacity-100' : 'opacity-15'
                  }`}
                >
                  {[0, 1, 2].map((ray) => (
                    <div key={ray} className="flex items-center">
                      <div className="h-0.5 w-8 bg-gradient-to-r from-amber-300 to-yellow-200 sm:w-10" />
                      <ArrowRight className="-ml-1 h-4 w-4 text-amber-300" />
                    </div>
                  ))}
                </div>

                {/* Etkileşimli 3B Dünya (Yönlü Işık + Tıklayarak İşaretleme) */}
                <div className="flex flex-col items-center">
                  <CelestialGlobeCanvas
                    bodyId="earth"
                    size={240}
                    rotY={-0.35 + exp1ViewAngle}
                    rotX={0.14}
                    interactive
                    showStarfield
                    lightingMode="directional"
                    lightDirection={exp1LightDirection}
                    isLightOn={exp1LightOn}
                    surfacePins={exp1SurfacePins}
                    onRotate={(dY) => setExp1ViewAngle((prev) => prev + dY)}
                    onSurfaceClick={handleExp1SurfaceClick}
                    ariaLabel="Güneş ışığını alan Dünya modeli — aydınlık veya karanlık bölgeye dokun"
                    className="h-[220px] w-[220px] rounded-2xl border border-[#f6dc9b]/25 sm:h-[240px] sm:w-[240px]"
                  />
                  <span className="mt-1.5 text-[11px] text-[#bfd0ee]">
                    Bakış açısını değiştirmek için sürükle; işaretlemek için Dünya’ya dokun
                  </span>
                </div>
              </div>

              {/* Işığı Aç ve Bakış Açısı Kontrolleri */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  data-testid="exp1-turn-light-btn"
                  disabled={!exp1Predicted || exp1LightOn}
                  onClick={() => {
                    setExp1LightOn(true);
                    setExp1MarkFeedback(
                      'Güneş ışığı açıldı! Şimdi Dünya üzerinde önce aydınlık, sonra karanlık bölgeye dokun.',
                    );
                    speakIfEnabled(activeExperiment.voiceGuide);
                  }}
                  className={`inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition-all sm:text-sm ${
                    exp1LightOn
                      ? 'border border-emerald-400/50 bg-emerald-900/60 text-emerald-200'
                      : exp1Predicted
                        ? 'bg-amber-400 text-[#09152e] shadow-lg hover:bg-amber-300'
                        : 'cursor-not-allowed border border-[#d8a94c]/25 bg-[#12244a] text-[#8fa5cf] opacity-60'
                  }`}
                >
                  <Lightbulb className="h-4 w-4" aria-hidden="true" />
                  <span>
                    {exp1LightOn ? 'Güneş Işığı Açık ✓' : ACTIVE_DISCOVERY_UI_COPY.turnOnLightLabel}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setExp1ViewAngle(0)}
                  className="inline-flex min-h-[42px] cursor-pointer items-center gap-1.5 rounded-xl border border-[#d8a94c]/35 bg-[#12264f] px-3 text-xs font-bold text-[#f8f1dd] hover:bg-[#1b366d]"
                >
                  <Compass className="h-3.5 w-3.5 text-[#f6dc9b]" aria-hidden="true" />
                  <span>Önden Bak</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExp1ViewAngle(-1.25)}
                  className="inline-flex min-h-[42px] cursor-pointer items-center gap-1.5 rounded-xl border border-[#d8a94c]/35 bg-[#12264f] px-3 text-xs font-bold text-[#f8f1dd] hover:bg-[#1b366d]"
                >
                  <Sun className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
                  <span>Güneş Tarafından</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExp1ViewAngle(1.25)}
                  className="inline-flex min-h-[42px] cursor-pointer items-center gap-1.5 rounded-xl border border-[#d8a94c]/35 bg-[#12264f] px-3 text-xs font-bold text-[#f8f1dd] hover:bg-[#1b366d]"
                >
                  <Moon className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" />
                  <span>Karanlık Taraftan</span>
                </button>
              </div>

              {/* İşaretleme Durum Çubuğu */}
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                <span
                  className={`rounded-full border px-3 py-1 font-bold ${
                    exp1LitPin
                      ? 'border-amber-300/60 bg-amber-500/20 text-amber-100'
                      : 'border-[#d8a94c]/25 bg-[#0e1e40] text-[#9fb5dc]'
                  }`}
                >
                  {exp1LitPin ? '✓ Aydınlık Bölge İşaretlendi' : '○ Aydınlık Bölge Bekleniyor'}
                </span>
                <span
                  className={`rounded-full border px-3 py-1 font-bold ${
                    exp1DarkPin
                      ? 'border-sky-300/60 bg-sky-500/20 text-sky-100'
                      : 'border-[#d8a94c]/25 bg-[#0e1e40] text-[#9fb5dc]'
                  }`}
                >
                  {exp1DarkPin ? '✓ Karanlık Bölge İşaretlendi' : '○ Karanlık Bölge Bekleniyor'}
                </span>
              </div>

              {exp1MarkFeedback && (
                <p
                  role="status"
                  className="rounded-xl border border-[#f6dc9b]/35 bg-[#11254d] px-3 py-2 text-center text-xs font-semibold text-[#fff4d4]"
                >
                  {exp1MarkFeedback}
                </p>
              )}
            </div>
          )}

          {/* DENEY 2 MODELİ (Gündüz ve Gece) */}
          {activeExpId === 'exp-day-night' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span
                  data-testid="exp2-turkey-status"
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-extrabold ${
                    turkeyStatus === 'day'
                      ? 'border-amber-300/70 bg-amber-500/25 text-amber-100'
                      : turkeyStatus === 'night'
                        ? 'border-indigo-300/70 bg-indigo-900/70 text-indigo-100'
                        : 'border-orange-300/60 bg-orange-950/70 text-orange-100'
                  }`}
                >
                  {turkeyStatus === 'day' ? (
                    <>
                      <Sun className="h-4 w-4 text-amber-300" />
                      <span>Türkiye’de Gündüz</span>
                    </>
                  ) : turkeyStatus === 'night' ? (
                    <>
                      <Moon className="h-4 w-4 text-sky-300" />
                      <span>Türkiye’de Gece</span>
                    </>
                  ) : (
                    <span>Türkiye: Alacakaranlık Sınırında (Dünya’yı döndür)</span>
                  )}
                </span>

                <span className="rounded-full border border-sky-300/30 bg-sky-950/75 px-2.5 py-0.5 text-[11px] font-semibold text-sky-200">
                  {ACTIVE_DISCOVERY_UI_COPY.representativeBadge}
                </span>
              </div>

              {/* Sabit Güneş + Kendi Ekseni Etrafında Dönen 3B Dünya + Türkiye İşareti */}
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#f6dc9b]/20 bg-[#050d20] p-3 sm:flex-row sm:gap-4">
                <div className="flex flex-col items-center gap-1">
                  <CelestialGlobeCanvas
                    bodyId="sun"
                    size={90}
                    rotY={0.25}
                    rotX={0.08}
                    showStarfield={false}
                    ariaLabel="Sabit Güneş modeli"
                  />
                  <span className="text-xs font-extrabold text-amber-200">Güneş (Sabit)</span>
                </div>

                <div aria-hidden="true" className="flex flex-row items-center gap-1 sm:flex-col sm:gap-2">
                  {[0, 1, 2].map((ray) => (
                    <div key={ray} className="flex items-center">
                      <div className="h-0.5 w-8 bg-gradient-to-r from-amber-300 to-yellow-200 sm:w-10" />
                      <ArrowRight className="-ml-1 h-4 w-4 text-amber-300" />
                    </div>
                  ))}
                </div>

                <div className="flex flex-col items-center">
                  <CelestialGlobeCanvas
                    bodyId="earth"
                    size={240}
                    rotY={exp2RotY}
                    rotX={EARTH_TILT_X}
                    interactive={exp2Predicted}
                    showStarfield
                    lightingMode="directional"
                    lightDirection={{ x: -1, y: 0, z: 0 }}
                    isLightOn
                    showAxisLine
                    surfacePins={exp2SurfacePins}
                    onRotate={(dY) => {
                      if (!exp2Predicted) return;
                      setExp2Spinning(false);
                      applyExp2Rotation(exp2RotY + dY);
                    }}
                    ariaLabel="Kendi ekseni etrafında dönen Dünya modeli ve Türkiye işareti"
                    className="h-[220px] w-[220px] rounded-2xl border border-[#f6dc9b]/25 sm:h-[240px] sm:w-[240px]"
                  />
                  <span className="mt-1.5 text-[11px] text-[#bfd0ee]">
                    Dünya’yı sürükleyerek veya düğmelerle kendi ekseni etrafında döndür
                  </span>
                </div>
              </div>

              {/* Döndür / Durdur / Başa Dön Denetimleri */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  data-testid="exp2-spin-btn"
                  disabled={!exp2Predicted}
                  onClick={() => {
                    setExp2Spinning((prev) => !prev);
                    if (!exp2Spinning) {
                      speakIfEnabled(activeExperiment.voiceGuide);
                    }
                  }}
                  className={`inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold sm:text-sm ${
                    !exp2Predicted
                      ? 'cursor-not-allowed border border-[#d8a94c]/25 bg-[#12244a] text-[#8fa5cf] opacity-60'
                      : exp2Spinning
                        ? 'bg-rose-500 text-white hover:bg-rose-400'
                        : 'bg-amber-400 text-[#09152e] hover:bg-amber-300'
                  }`}
                >
                  {exp2Spinning ? (
                    <>
                      <Pause className="h-4 w-4" aria-hidden="true" />
                      <span>{ACTIVE_DISCOVERY_UI_COPY.pauseLabel}</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" aria-hidden="true" />
                      <span>{ACTIVE_DISCOVERY_UI_COPY.spinLabel}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={!exp2Predicted}
                  onClick={() => {
                    setExp2Spinning(false);
                    applyExp2Rotation(exp2RotY - 0.55);
                  }}
                  className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 rounded-xl border border-[#d8a94c]/35 bg-[#12264f] px-3 text-xs font-bold text-[#f8f1dd] hover:bg-[#1b366d] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>Adım Döndür →</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setExp2Spinning(false);
                    exp2RotRef.current = INITIAL_DAY_NIGHT_ROT_Y;
                    setExp2RotY(INITIAL_DAY_NIGHT_ROT_Y);
                  }}
                  className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-xl border border-[#d8a94c]/35 bg-[#12264f] px-3.5 text-xs font-bold text-[#f7df9d] hover:bg-[#1b366d]"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{ACTIVE_DISCOVERY_UI_COPY.resetLabel}</span>
                </button>
              </div>

              {/* Görev Kontrol Listesi: Gündüz + Gece */}
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                <span
                  className={`rounded-full border px-3 py-1 font-bold ${
                    exp2CreatedDay
                      ? 'border-emerald-400/60 bg-emerald-900/50 text-emerald-100'
                      : 'border-[#d8a94c]/25 bg-[#0e1e40] text-[#9fb5dc]'
                  }`}
                >
                  {exp2CreatedDay
                    ? '✓ Türkiye’de Gündüz Oluşturuldu'
                    : '○ Türkiye’de Gündüz Oluştur'}
                </span>
                <span
                  className={`rounded-full border px-3 py-1 font-bold ${
                    exp2CreatedNight
                      ? 'border-emerald-400/60 bg-emerald-900/50 text-emerald-100'
                      : 'border-[#d8a94c]/25 bg-[#0e1e40] text-[#9fb5dc]'
                  }`}
                >
                  {exp2CreatedNight
                    ? '✓ Türkiye’de Gece Oluşturuldu'
                    : '○ Türkiye’de Gece Oluştur'}
                </span>
              </div>
            </div>
          )}

          {/* DENEY 3 MODELİ (Ay'ın Evreleri: Uzaydan + Dünya'dan Eş Zamanlı Görünüm) */}
          {activeExpId === 'exp-moon-phases' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-[#f7df9d]">
                  Ay’ı Dünya çevresinde sürükle veya kaydırıcıyla hareket ettir
                </span>
                <span className="rounded-full border border-sky-300/30 bg-sky-950/75 px-2.5 py-0.5 text-[11px] font-semibold text-sky-200">
                  {ACTIVE_DISCOVERY_UI_COPY.representativeBadge}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                {/* Uzaydan Görünüm (Üstten yörünge modeli) */}
                <div className="flex flex-col items-center rounded-2xl border border-[#f6dc9b]/20 bg-[#050d20] p-2.5 sm:col-span-7">
                  <span className="mb-1.5 text-[11px] font-extrabold uppercase tracking-wide text-[#f6dc9b]">
                    Uzaydan Görünüm
                  </span>
                  <MoonOrbitCanvas
                    phaseAngleDeg={exp3PhaseAngleDeg}
                    onChangeAngle={(deg) => {
                      if (!exp3Predicted) return;
                      handleMoveMoonAngle(deg);
                    }}
                  />
                  <span className="mt-1.5 text-center text-[11px] text-[#bfd0ee]">
                    Ay’ın Güneş’e bakan yarısı her konumda aydınlıktır.
                  </span>
                </div>

                {/* Dünya'dan Görünüm (Ayrı eş zamanlı pencere) */}
                <div className="flex flex-col items-center justify-between rounded-2xl border border-sky-300/35 bg-[#061229] p-2.5 sm:col-span-5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wide text-sky-200">
                    Dünya’dan Görünüm
                  </span>

                  <CelestialGlobeCanvas
                    bodyId="moon"
                    size={168}
                    rotY={0.22}
                    rotX={0.05}
                    showStarfield
                    lightingMode="directional"
                    lightDirection={moonEarthViewLightDir}
                    isLightOn
                    ariaLabel={
                      detectedPhase
                        ? `Dünya'dan Ay görünümü: ${detectedPhase.label}`
                        : "Dünya'dan Ay görünümü"
                    }
                    className="my-1.5 h-[156px] w-[156px] rounded-2xl border border-[#f6dc9b]/25"
                  />

                  <div className="w-full space-y-1.5 text-center">
                    <p
                      data-testid="exp3-detected-phase"
                      className="text-sm font-extrabold text-[#fff6db]"
                    >
                      {detectedPhase ? detectedPhase.label : 'Ara Evre Konumu'}
                    </p>
                    <p className="text-[11px] leading-snug text-[#c7d6f2]">
                      {detectedPhase
                        ? detectedPhase.earthViewSummary
                        : 'Ana evrelerden birini yakalamak için Ay’ı biraz daha ilerlet.'}
                    </p>

                    {detectedPhase && exp3Predicted && (
                      <button
                        type="button"
                        data-testid={`save-phase-${detectedPhase.id}`}
                        disabled={exp3ObservedPhases.includes(detectedPhase.id)}
                        onClick={handleSaveDetectedPhase}
                        className={`mt-1 min-h-[38px] w-full cursor-pointer rounded-xl px-3 py-1.5 text-xs font-extrabold transition-colors ${
                          exp3ObservedPhases.includes(detectedPhase.id)
                            ? 'border border-emerald-400/50 bg-emerald-900/60 text-emerald-200'
                            : 'bg-amber-400 text-[#09152e] hover:bg-amber-300'
                        }`}
                      >
                        {exp3ObservedPhases.includes(detectedPhase.id)
                          ? `${detectedPhase.label} Kaydedildi ✓`
                          : `Bu Evreyi Kaydet (${detectedPhase.label})`}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Yörünge Konum Kontrolleri */}
              <div className="space-y-2 rounded-2xl border border-[#d8a94c]/25 bg-[#0b1936] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    disabled={!exp3Predicted}
                    onClick={() => handleMoveMoonAngle(exp3PhaseAngleDeg - 30)}
                    className="min-h-[38px] cursor-pointer rounded-xl border border-[#d8a94c]/35 bg-[#12264f] px-3 text-xs font-bold text-[#f8f1dd] hover:bg-[#1b366d] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    ◀ Geri Al
                  </button>

                  <input
                    type="range"
                    min={0}
                    max={359}
                    value={Math.round(exp3PhaseAngleDeg)}
                    disabled={!exp3Predicted}
                    aria-label="Ay yörünge açısı"
                    onChange={(e) => handleMoveMoonAngle(Number(e.target.value))}
                    className="h-2 flex-1 cursor-pointer accent-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                  />

                  <button
                    type="button"
                    disabled={!exp3Predicted}
                    onClick={() => handleMoveMoonAngle(exp3PhaseAngleDeg + 30)}
                    className="min-h-[38px] cursor-pointer rounded-xl border border-[#d8a94c]/35 bg-[#12264f] px-3 text-xs font-bold text-[#f8f1dd] hover:bg-[#1b366d] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    İleri Al ▶
                  </button>
                </div>

                {/* Gözlemlenen Evreler ve Karşılaştırma */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                  {MOON_PHASES.map((phase) => {
                    const recorded = exp3ObservedPhases.includes(phase.id);
                    return (
                      <span
                        key={phase.id}
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                          recorded
                            ? 'border-emerald-400/60 bg-emerald-900/55 text-emerald-100'
                            : 'border-[#d8a94c]/25 bg-[#09152e] text-[#9eb4db]'
                        }`}
                      >
                        {recorded ? `✓ ${phase.label}` : `○ ${phase.label}`}
                      </span>
                    );
                  })}
                </div>

                {exp3ObservedPhases.length >= 2 && (
                  <div className="rounded-xl border border-emerald-400/35 bg-emerald-950/40 p-2.5 text-xs text-emerald-100">
                    <p className="font-extrabold text-emerald-200">
                      Gözlem Karşılaştırması ({exp3ObservedPhases.length}/4 evre kaydedildi):
                    </p>
                    <ul className="mt-1 space-y-1 text-[11px]">
                      {exp3ObservedPhases.slice(0, 2).map((pid) => {
                        const def = MOON_PHASES.find((p) => p.id === pid);
                        if (!def) return null;
                        return (
                          <li key={pid}>
                            <strong>{def.label}:</strong> {def.earthViewSummary}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>

              {/* Bilimsel Doğruluk Notu (Dünya gölgesi kuralı) */}
              <p className="rounded-xl border border-sky-300/30 bg-sky-950/50 px-3 py-2 text-[11px] leading-relaxed text-sky-100">
                {ACTIVE_DISCOVERY_UI_COPY.moonShadowRuleNote}
              </p>
            </div>
          )}

          <p className="mt-3 text-center text-[11px] text-[#a9bce0]">
            {ACTIVE_DISCOVERY_UI_COPY.representativeNote}
          </p>
        </section>

        {/* SAĞ PANEL: TAHMİN ET -> DENEY YAP / GÖZLEMLE -> AÇIKLA */}
        <section className="flex flex-col justify-between gap-3.5 rounded-3xl border border-[#d8a94c]/30 bg-[#102247]/90 p-4 lg:col-span-5">
          <div className="space-y-3.5">
            {/* 1. TAHMİN ET */}
            <div
              className={`rounded-2xl border p-3.5 ${
                activePredictDone
                  ? 'border-emerald-400/45 bg-emerald-950/30'
                  : 'border-[#f6dc9b]/55 bg-[#162e60]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wide text-[#f6dc9b]">
                  1. Tahmin Et
                </h4>
                {activePredictDone && (
                  <span className="text-[11px] font-bold text-emerald-300">✓ Tamam</span>
                )}
              </div>
              <p className="mt-1.5 text-sm font-bold text-[#fff8e6]">{gradePack.predictPrompt}</p>

              <div className="mt-2.5 space-y-2">
                {gradePack.predictOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    disabled={activePredictDone}
                    onClick={() => handlePredictOption(option)}
                    className={`min-h-[42px] w-full cursor-pointer rounded-xl border px-3 py-2 text-left text-xs font-bold transition-colors sm:text-sm ${
                      activePredictDone && option.isCorrect
                        ? 'border-emerald-400 bg-emerald-900/60 text-emerald-100'
                        : activePredictDone
                          ? 'cursor-default border-[#d8a94c]/15 bg-[#0b1936]/60 text-[#8ea5ce] opacity-60'
                          : 'border-[#d8a94c]/40 bg-[#0e2046] text-[#fff5d6] hover:border-[#f6dc9b] hover:bg-[#1c3973]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {activePredictFeedback && (
                <p
                  role="status"
                  className={`mt-2 rounded-xl border px-3 py-2 text-xs leading-snug ${
                    activePredictFeedback.isCorrect
                      ? 'border-emerald-400/45 bg-emerald-950/60 text-emerald-100'
                      : 'border-amber-400/45 bg-amber-950/65 text-amber-100'
                  }`}
                >
                  {activePredictFeedback.text}
                </p>
              )}
            </div>

            {/* 2 & 3. DENEY YAP VE GÖZLEMLE YÖNERGESİ */}
            <div
              className={`rounded-2xl border p-3.5 ${
                activeExplainUnlocked
                  ? 'border-emerald-400/45 bg-emerald-950/30'
                  : activePredictDone
                    ? 'border-[#f6dc9b]/55 bg-[#162e60]'
                    : 'border-[#d8a94c]/20 bg-[#0a1733]/75 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wide text-[#f6dc9b]">
                  2–3. Deney Yap ve Gözlemle
                </h4>
                {activeExplainUnlocked && (
                  <span className="text-[11px] font-bold text-emerald-300">✓ Gözlem Tamam</span>
                )}
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-[#e8effc] sm:text-sm">
                {gradePack.experimentInstruction}
              </p>
            </div>

            {/* 4. AÇIKLA */}
            <div
              className={`rounded-2xl border p-3.5 ${
                activeExplainDone
                  ? 'border-emerald-400/60 bg-emerald-950/45'
                  : activeExplainUnlocked
                    ? 'border-[#f6dc9b]/60 bg-[#162e60]'
                    : 'border-[#d8a94c]/20 bg-[#0a1733]/70 opacity-65'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wide text-[#f6dc9b]">
                  4. Sonucu Açıkla
                </h4>
                {activeExplainDone && (
                  <span className="text-[11px] font-bold text-emerald-300">✓ Deney Tamamlandı</span>
                )}
              </div>

              {!activeExplainUnlocked ? (
                <p className="mt-1.5 text-xs text-[#b5c7e8]">
                  Önce soldaki modelde deney adımlarını tamamla; ardından gözlemini burada açıkla.
                </p>
              ) : (
                <>
                  <p className="mt-1.5 text-sm font-bold text-[#fff8e6]">
                    {gradePack.explainPrompt}
                  </p>
                  <div className="mt-2.5 space-y-2">
                    {gradePack.explainOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        disabled={activeExplainDone}
                        onClick={() => handleExplainOption(option)}
                        className={`min-h-[42px] w-full cursor-pointer rounded-xl border px-3 py-2 text-left text-xs font-bold transition-colors sm:text-sm ${
                          activeExplainDone && option.isCorrect
                            ? 'border-emerald-400 bg-emerald-900/65 text-emerald-100'
                            : activeExplainDone
                              ? 'cursor-default border-[#d8a94c]/15 bg-[#0b1936]/60 text-[#8ea5ce] opacity-60'
                              : 'border-[#d8a94c]/40 bg-[#0e2046] text-[#fff5d6] hover:border-[#f6dc9b] hover:bg-[#1c3973]'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {activeExplainFeedback && (
                <p
                  role="status"
                  className={`mt-2 rounded-xl border px-3 py-2 text-xs leading-snug ${
                    activeExplainFeedback.isCorrect
                      ? 'border-emerald-400/50 bg-emerald-950/70 text-emerald-100'
                      : 'border-amber-400/50 bg-amber-950/70 text-amber-100'
                  }`}
                >
                  {activeExplainFeedback.text}
                </p>
              )}
            </div>
          </div>

          {/* Alt Geçiş ve Tamamlama Çubuğu */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#d8a94c]/25 pt-3">
            {activeExplainDone && nextExperimentId ? (
              <button
                type="button"
                onClick={() => handleSelectExperiment(nextExperimentId)}
                className="inline-flex min-h-[44px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#d8a94c] px-4 py-2 text-xs font-extrabold text-[#0b1834] hover:bg-[#e8be66] sm:text-sm"
              >
                <span>Sonraki Deneye Geç</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : allRequiredDone ? (
              <button
                type="button"
                onClick={onBackToObservatory}
                className="inline-flex min-h-[44px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-extrabold text-[#061c14] hover:bg-emerald-400 sm:text-sm"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span>Keşif Tamamlandı — Gözlemevine Dön</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onBackToObservatory}
                className="inline-flex min-h-[42px] cursor-pointer items-center gap-1.5 rounded-xl border border-[#d8a94c]/35 bg-[#0c1c3d] px-3.5 text-xs font-bold text-[#f7df9d] hover:bg-[#173063]"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Gözlemevine Dön</span>
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
