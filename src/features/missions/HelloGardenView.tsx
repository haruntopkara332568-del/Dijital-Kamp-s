import { useState, useEffect } from 'react';
import {
  Volume2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Compass,
  RotateCcw,
} from 'lucide-react';
import { useOptionalCampus } from '@/src/app/CampusProviders';
import { speakSegments } from '@/src/services/speech';
import type { MissionProgress, MissionStageId } from '@/src/types/campus';

export interface HelloGardenViewProps {
  missionId?: string;
  onExitToClassroom: () => void;
  onAdvanceToNextTable?: (stage: MissionStageId) => void;
}

interface DialogueStep {
  stepNumber: number;
  speaker: 'Elif' | 'Can' | 'Elif & Can';
  speakerRole: string;
  englishText: string;
  phoneticGuide: string;
  turkishHint: string;
  options: Array<{
    id: string;
    text: string;
    phoneticGuide: string;
    turkishMeaning: string;
    icon: string;
  }>;
}

const DIALOGUE_STEPS: DialogueStep[] = [
  {
    stepNumber: 1,
    speaker: 'Elif',
    speakerRole: '3. Sınıf Arkadaşın',
    englishText: 'Hello!',
    phoneticGuide: 'he-LO',
    turkishHint: 'Merhaba!',
    options: [
      {
        id: 'opt-hello',
        text: 'Hello!',
        phoneticGuide: 'he-LO',
        turkishMeaning: 'Merhaba!',
        icon: '👋',
      },
      {
        id: 'opt-goodmorning',
        text: 'Good morning!',
        phoneticGuide: 'gud MOR-ning',
        turkishMeaning: 'Günaydın!',
        icon: '☀️',
      },
    ],
  },
  {
    stepNumber: 2,
    speaker: 'Can',
    speakerRole: '3. Sınıf Arkadaşın',
    englishText: 'What is your name?',
    phoneticGuide: 'UOT iz yor NEYM',
    turkishHint: 'Senin adın ne?',
    options: [
      {
        id: 'opt-deniz',
        text: 'I am Deniz.',
        phoneticGuide: 'ay em De-niz',
        turkishMeaning: 'Ben Deniz.',
        icon: '⭐',
      },
      {
        id: 'opt-student',
        text: 'I am a student.',
        phoneticGuide: 'ay em e STU-dınt',
        turkishMeaning: 'Ben bir öğrenciyim.',
        icon: '🎒',
      },
      {
        id: 'opt-explorer',
        text: 'I am an Explorer.',
        phoneticGuide: 'ay em eks-PLO-rır',
        turkishMeaning: 'Ben bir kâşifim.',
        icon: '🔍',
      },
    ],
  },
  {
    stepNumber: 3,
    speaker: 'Elif & Can',
    speakerRole: 'Bahçe Arkadaşların',
    englishText: 'Nice to meet you.',
    phoneticGuide: 'NAYS tu MİT yu',
    turkishHint: 'Tanıştığıma memnun oldum.',
    options: [
      {
        id: 'opt-nicetomeet',
        text: 'Nice to meet you.',
        phoneticGuide: 'NAYS tu MİT yu',
        turkishMeaning: 'Tanıştığıma memnun oldum.',
        icon: '🤝',
      },
      {
        id: 'opt-explore',
        text: "Let's explore!",
        phoneticGuide: 'LETS eks-PLOR',
        turkishMeaning: 'Haydi keşfedelim!',
        icon: '✨',
      },
    ],
  },
];

export function HelloGardenView({
  missionId = 'kapilarin-anlattigi-hikaye',
  onExitToClassroom,
  onAdvanceToNextTable,
}: HelloGardenViewProps) {
  const campus = useOptionalCampus();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [activeSpeechText, setActiveSpeechText] = useState<string | null>(null);
  const [activeSpeechSpeed, setActiveSpeechSpeed] = useState<'normal' | 'slow' | null>(null);

  const currentStep = DIALOGUE_STEPS[currentStepIndex];

  // Sayfa değiştiğinde önceki sesi durdur
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentStepIndex, isCompleted]);

  /**
   * 3. Sınıf Seviyesine Özel Çocuk Dostu Telaffuz Çalar:
   * - Varsayılan Hız (normal): 0.82 (net, akıcı, çocuk kulağına uygun)
   * - Yavaş Hız (slow): 0.62 (ayrıntılı, hece vurgulu, güven verici)
   */
  const handlePlaySpeech = (text: string, speed: 'normal' | 'slow') => {
    setActiveSpeechText(text);
    setActiveSpeechSpeed(speed);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = speed === 'slow' ? 0.62 : 0.82;
      utterance.pitch = 1.06;

      const voices = window.speechSynthesis.getVoices();
      const englishVoice =
        voices.find((v) => v.lang.toLowerCase() === 'en-us') ||
        voices.find((v) => v.lang.toLowerCase().startsWith('en'));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      utterance.onend = () => {
        setActiveSpeechText(null);
        setActiveSpeechSpeed(null);
      };
      utterance.onerror = () => {
        setActiveSpeechText(null);
        setActiveSpeechSpeed(null);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // API desteği yoksa mevcut servise güvenle devret
      speakSegments([{ text, lang: 'en-US' }]).finally(() => {
        setActiveSpeechText(null);
        setActiveSpeechSpeed(null);
      });
    }
  };

  const handleSelectOption = (optionId: string) => {
    const updated = { ...selectedAnswers, [currentStepIndex]: optionId };
    setSelectedAnswers(updated);

    if (currentStepIndex < DIALOGUE_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      if (campus) {
        const existing = campus.getMissionProgress(missionId, 3);
        const prev = existing?.completedStages ?? [];
        const completedStages: MissionStageId[] = prev.includes('kesfet')
          ? prev
          : [...prev, 'kesfet'];
        const nextProgress: MissionProgress = {
          missionId,
          missionVersion: existing?.missionVersion ?? '1.0.0',
          grade: 3,
          currentStage: 'ogren',
          completedStages,
          selections: existing?.selections ?? {
            selectedDoorIds: ['bahce'],
            inspectedCampusGate: true,
            observationNotes: {},
            matchedVocabularyIds: ['vocab-door'],
            matchedExampleSentence: true,
            doorName: 'Tanışma Bahçesi Kapısı',
            writtenText: 'Hello! What is your name? Nice to meet you.',
            usedEnglishWords: ['Hello', 'Name'],
          },
          draftArtifactId: existing?.draftArtifactId ?? null,
          savedArtifactId: existing?.savedArtifactId ?? null,
          artifactSavedAt: existing?.artifactSavedAt ?? null,
          selfEvaluation: existing?.selfEvaluation ?? null,
          completed: existing?.completed ?? false,
          completedAt: existing?.completedAt ?? null,
          updatedAt: new Date().toISOString(),
        };
        campus.saveMissionProgress(nextProgress);
      }
    }
  };

  const handleReset = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentStepIndex(0);
    setSelectedAnswers({});
    setIsCompleted(false);
    setActiveSpeechText(null);
    setActiveSpeechSpeed(null);
  };

  const isCurrentSentenceSpeaking = activeSpeechText === currentStep?.englishText;

  return (
    <div className="w-full max-w-4xl mx-auto p-3 sm:p-5 space-y-4 select-none">
      {/* Üst Başlık ve İlerleme Çubuğu */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-3 border-b border-[var(--campus-border)]">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--seljuk-teal)]/10 text-[var(--seljuk-teal)] text-[11px] font-semibold">
            <Compass className="w-3.5 h-3.5" aria-hidden="true" />
            <span>3. Sınıf Keşfet Masası • Özel Prototip</span>
          </div>
          <h1 className="text-lg sm:text-2xl font-bold text-[var(--seljuk-navy)] flex items-center gap-2">
            <span>🌿 Hello! Tanışma Bahçesi</span>
          </h1>
          <p className="text-xs text-[var(--campus-ink-muted)]">
            Bahçedeki arkadaşların Elif ve Can ile tanış, kelimeleri dinle ve İngilizce selam ver.
          </p>
        </div>

        {/* Adım Göstergesi (3 Küçük Adım) */}
        {!isCompleted && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 border border-[var(--campus-border)] shadow-xs">
            <span className="text-xs font-semibold text-[var(--seljuk-navy)]">
              Adım {currentStepIndex + 1} / {DIALOGUE_STEPS.length}
            </span>
            <div className="flex gap-1" aria-hidden="true">
              {DIALOGUE_STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-3 h-2 rounded-full transition-all duration-300 ${
                    idx === currentStepIndex
                      ? 'bg-[var(--seljuk-teal)] w-6'
                      : idx < currentStepIndex
                        ? 'bg-emerald-500'
                        : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Sinematik 2.5D Mini Bahçe Sahnesi */}
      <div className="relative rounded-2xl overflow-hidden border border-[#b2d5d8] bg-gradient-to-b from-[#eaf6f7] via-[#f7faf8] to-[#f4eee1] shadow-md p-4 sm:p-7">
        {/* Sinematik 2.5D Stilize Bahçe Arka Planı (Göz yormayan, Selçuklu kemerli avlu bahçesi) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <svg className="w-full h-full" viewBox="0 0 900 480" preserveAspectRatio="none">
            <defs>
              <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d9f0f7" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#fefce8" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="grassGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#86efac" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#4ade80" stopOpacity="0.65" />
              </linearGradient>
              <linearGradient id="sunGlow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Gökyüzü ve Güneş Işığı Halesi */}
            <rect width="900" height="480" fill="url(#skyGrad)" />
            <circle cx="820" cy="50" r="140" fill="url(#sunGlow)" />

            {/* Arka Plan: Uzak Selçuklu Taş Duvarı ve Sivri Kemerli Bahçe Kapısı */}
            <path
              d="M 0,220 L 260,220 Q 320,130 380,220 L 520,220 Q 580,130 640,220 L 900,220 L 900,280 L 0,280 Z"
              fill="#d6c6ac"
              opacity="0.28"
            />
            {/* Kemer Süs Çizgileri */}
            <path
              d="M 320,220 Q 350,165 380,220 M 580,220 Q 610,165 640,220"
              stroke="#0e768a"
              strokeWidth="2.5"
              fill="none"
              opacity="0.3"
            />

            {/* Bahçe Ağaçları (Servi ve Çınar Gölgeleri) */}
            <path d="M 80,260 Q 60,140 80,70 Q 100,140 80,260 Z" fill="#0f766e" opacity="0.35" />
            <path d="M 820,260 Q 805,150 820,90 Q 835,150 820,260 Z" fill="#0f766e" opacity="0.35" />
            <circle cx="160" cy="180" r="65" fill="#22c55e" opacity="0.25" />
            <circle cx="740" cy="190" r="60" fill="#16a34a" opacity="0.25" />

            {/* Zemin: Yumuşak Çim Tepecikleri ve Kıvrımlı Taş Yol */}
            <path
              d="M 0,260 Q 450,230 900,260 L 900,480 L 0,480 Z"
              fill="url(#grassGrad)"
            />
            {/* Taş Yürüme Yolu */}
            <path
              d="M 390,480 Q 440,360 450,260 Q 460,360 510,480 Z"
              fill="#e2d8c3"
              opacity="0.65"
            />
            <path
              d="M 395,480 Q 440,360 450,260 M 505,480 Q 460,360 450,260"
              stroke="#cbbca0"
              strokeWidth="1.5"
              fill="none"
              strokeDasharray="4 6"
              opacity="0.7"
            />

            {/* Minik Çiçekler (Papatya ve Lavanta Detayları) */}
            <circle cx="220" cy="340" r="3.5" fill="#facc15" />
            <circle cx="280" cy="380" r="3" fill="#ec4899" opacity="0.6" />
            <circle cx="620" cy="360" r="3" fill="#a855f7" opacity="0.6" />
            <circle cx="680" cy="330" r="3.5" fill="#facc15" />
          </svg>
        </div>

        {/* Karakterler Sahnesi (En fazla 3 Karakter Kuralı: Elif, Can, Sen) */}
        <div className="relative z-10 flex items-end justify-center gap-4 sm:gap-10 pb-3 pt-1">
          {/* 1. Karakter: Elif */}
          <div
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
              currentStep?.speaker.includes('Elif')
                ? 'scale-105 drop-shadow-lg'
                : 'opacity-70 scale-95'
            }`}
          >
            <div className="relative w-20 h-24 sm:w-24 sm:h-28 flex items-center justify-center">
              {/* Konuşurken Işık Halesi */}
              {currentStep?.speaker.includes('Elif') && (
                <div className="absolute inset-0 rounded-full bg-emerald-400/25 blur-md animate-pulse" />
              )}
              {/* Stilize Elif Karakter Çizimi */}
              <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-sm">
                {/* Gövde / Mercan-Turkuaz Yelek */}
                <path d="M 30,120 L 32,80 Q 50,75 68,80 L 70,120 Z" fill="#0e768a" />
                <path d="M 38,80 L 40,115 L 60,115 L 62,80 Z" fill="#fb7185" />
                <circle cx="50" cy="95" r="2" fill="#ffffff" />
                {/* Boyun ve Baş */}
                <rect x="45" y="65" width="10" height="15" rx="3" fill="#fbd5b5" />
                <circle cx="50" cy="52" r="22" fill="#fbd5b5" />
                {/* Saç ve Turkuaz Toka */}
                <path d="M 28,48 Q 50,22 72,48 Q 62,32 38,34 Z" fill="#451a03" />
                <path d="M 26,48 Q 22,70 32,75 Q 30,60 30,50 Z" fill="#451a03" />
                <circle cx="70" cy="46" r="5" fill="#0e768a" />
                {/* Gözler ve Gülümseme */}
                <circle cx="43" cy="51" r="2.5" fill="#1e293b" />
                <circle cx="57" cy="51" r="2.5" fill="#1e293b" />
                <circle cx="44" cy="50" r="0.8" fill="#ffffff" />
                <circle cx="58" cy="50" r="0.8" fill="#ffffff" />
                <path d="M 44,58 Q 50,64 56,58" stroke="#991b1b" strokeWidth="2" fill="none" strokeLinecap="round" />
                {/* Yanak Pembeliği */}
                <circle cx="39" cy="56" r="3" fill="#f43f5e" opacity="0.35" />
                <circle cx="61" cy="56" r="3" fill="#f43f5e" opacity="0.35" />
                {/* El Sallama Jestı */}
                <path d="M 68,84 Q 82,72 82,60" stroke="#fbd5b5" strokeWidth="6" strokeLinecap="round" fill="none" />
                <circle cx="82" cy="58" r="5" fill="#fbd5b5" />
              </svg>
            </div>
            <div className="text-center">
              <span className="block text-xs sm:text-sm font-bold text-[var(--seljuk-navy)]">Elif</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded-full font-medium">
                Öğrenci
              </span>
            </div>
          </div>

          {/* 2. Karakter: Can */}
          <div
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
              currentStep?.speaker.includes('Can')
                ? 'scale-105 drop-shadow-lg'
                : 'opacity-70 scale-95'
            }`}
          >
            <div className="relative w-20 h-24 sm:w-24 sm:h-28 flex items-center justify-center">
              {/* Konuşurken Işık Halesi */}
              {currentStep?.speaker.includes('Can') && (
                <div className="absolute inset-0 rounded-full bg-amber-400/25 blur-md animate-pulse" />
              )}
              {/* Stilize Can Karakter Çizimi */}
              <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-sm">
                {/* Gövde / Lacivert-Amber Ceket */}
                <path d="M 28,120 L 30,80 Q 50,75 70,80 L 72,120 Z" fill="#1e3a5f" />
                <path d="M 40,80 L 42,115 L 58,115 L 60,80 Z" fill="#f59e0b" />
                {/* Sırt Çantası Askısı */}
                <line x1="34" y1="82" x2="38" y2="120" stroke="#d97706" strokeWidth="3" />
                <line x1="66" y1="82" x2="62" y2="120" stroke="#d97706" strokeWidth="3" />
                {/* Boyun ve Baş */}
                <rect x="45" y="65" width="10" height="15" rx="3" fill="#fcd34d" />
                <circle cx="50" cy="52" r="22" fill="#fcd34d" />
                {/* Kısa Dalgalı Saç */}
                <path d="M 28,48 Q 50,22 72,46 Q 64,32 50,30 Q 36,32 28,48 Z" fill="#361a07" />
                {/* Gözler ve Gülümseme */}
                <circle cx="43" cy="51" r="2.5" fill="#1e293b" />
                <circle cx="57" cy="51" r="2.5" fill="#1e293b" />
                <circle cx="44" cy="50" r="0.8" fill="#ffffff" />
                <circle cx="58" cy="50" r="0.8" fill="#ffffff" />
                <path d="M 44,59 Q 50,65 56,59" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round" />
                {/* Yanak Pembeliği */}
                <circle cx="39" cy="57" r="3" fill="#f87171" opacity="0.3" />
                <circle cx="61" cy="57" r="3" fill="#f87171" opacity="0.3" />
                {/* Meraklı Selam Jestı */}
                <path d="M 30,85 Q 18,75 20,62" stroke="#fcd34d" strokeWidth="6" strokeLinecap="round" fill="none" />
                <circle cx="20" cy="60" r="5" fill="#fcd34d" />
              </svg>
            </div>
            <div className="text-center">
              <span className="block text-xs sm:text-sm font-bold text-[var(--seljuk-navy)]">Can</span>
              <span className="text-[10px] text-amber-700 bg-amber-100/70 px-1.5 py-0.2 rounded-full font-medium">
                Öğrenci
              </span>
            </div>
          </div>

          {/* 3. Karakter: Sen (Öğrenci / Kâşif) */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="relative w-20 h-24 sm:w-24 sm:h-28 flex items-center justify-center">
              {/* Stilize Öğrenci / Sen Çizimi */}
              <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-sm">
                <path d="M 30,120 L 32,82 Q 50,78 68,82 L 70,120 Z" fill="#4338ca" />
                <path d="M 42,82 L 44,115 L 56,115 L 58,82 Z" fill="#38bdf8" />
                {/* Boyun ve Baş */}
                <rect x="45" y="65" width="10" height="15" rx="3" fill="#fed7aa" />
                <circle cx="50" cy="52" r="22" fill="#fed7aa" />
                {/* Kâşif Şapkası */}
                <path d="M 22,46 Q 50,26 78,46 L 76,40 Q 50,22 24,40 Z" fill="#0e768a" />
                <ellipse cx="50" cy="44" rx="28" ry="6" fill="#0e768a" />
                <circle cx="50" cy="38" r="3.5" fill="#facc15" />
                {/* Gözler ve Gülümseme */}
                <circle cx="43" cy="52" r="2.5" fill="#1e293b" />
                <circle cx="57" cy="52" r="2.5" fill="#1e293b" />
                <path d="M 45,60 Q 50,65 55,60" stroke="#9a3412" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <div className="text-center">
              <span className="block text-xs sm:text-sm font-bold text-[var(--seljuk-navy)]">Sen</span>
              <span className="text-[10px] text-indigo-700 bg-indigo-100/70 px-1.5 py-0.2 rounded-full font-medium">
                Kâşif
              </span>
            </div>
          </div>
        </div>

        {/* Diyalog Balonu ve Etkileşim Alanı */}
        {!isCompleted ? (
          <div className="relative z-10 max-w-xl mx-auto space-y-3 pt-1">
            {/* Konuşma Balonu (Beyaz, sivri kuyruklu, okunaklı) */}
            <div
              className={`relative bg-white/95 backdrop-blur-xs rounded-2xl p-4 sm:p-5 border-2 shadow-md transition-all duration-300 ${
                isCurrentSentenceSpeaking
                  ? 'border-[var(--seljuk-teal)] ring-4 ring-[var(--seljuk-teal)]/15'
                  : 'border-[var(--campus-border)]'
              }`}
            >
              {/* Balon Üst Çubuğu: Konuşan Kişi + Dinle & Yavaş Dinle Düğmeleri */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--seljuk-teal)] animate-ping" />
                  <span className="text-xs font-bold text-[var(--seljuk-teal)] uppercase tracking-wider">
                    {currentStep.speaker} konuşuyor
                  </span>
                  <span className="text-[11px] text-[var(--campus-ink-muted)]">
                    ({currentStep.speakerRole})
                  </span>
                </div>

                {/* İkili Telaffuz Desteği: [🔊 Dinle] + [🐢 Yavaş Dinle] */}
                <div className="flex items-center gap-1.5">
                  {/* 1. Dinle (Normal çocuk hızı: 0.82) */}
                  <button
                    type="button"
                    onClick={() => handlePlaySpeech(currentStep.englishText, 'normal')}
                    className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 ${
                      isCurrentSentenceSpeaking && activeSpeechSpeed === 'normal'
                        ? 'bg-[var(--seljuk-teal)] text-white ring-2 ring-[var(--seljuk-teal)]/40'
                        : 'bg-[var(--seljuk-teal)]/10 hover:bg-[var(--seljuk-teal)]/20 text-[var(--seljuk-teal)]'
                    }`}
                    aria-label="İngilizce cümleyi dinle"
                  >
                    <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>
                      {isCurrentSentenceSpeaking && activeSpeechSpeed === 'normal'
                        ? 'Dinleniyor...'
                        : 'Dinle'}
                    </span>
                  </button>

                  {/* 2. Yavaş Dinle (Pedagojik yavaş hız: 0.62) */}
                  <button
                    type="button"
                    onClick={() => handlePlaySpeech(currentStep.englishText, 'slow')}
                    className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 ${
                      isCurrentSentenceSpeaking && activeSpeechSpeed === 'slow'
                        ? 'bg-amber-600 text-white ring-2 ring-amber-400/50'
                        : 'bg-amber-100/70 hover:bg-amber-200/70 text-amber-900 border border-amber-300/60'
                    }`}
                    aria-label="İngilizce cümleyi yavaş ve hece vurgulu dinle"
                  >
                    <span aria-hidden="true">🐢</span>
                    <span>
                      {isCurrentSentenceSpeaking && activeSpeechSpeed === 'slow'
                        ? 'Yavaş Okunuyor...'
                        : 'Yavaş Dinle'}
                    </span>
                  </button>
                </div>
              </div>

              {/* İngilizce Hedef Cümle (Büyük, Doğal, Vurgulu) */}
              <div className="py-2 space-y-1">
                <p
                  className={`text-2xl sm:text-3xl font-extrabold tracking-wide transition-colors ${
                    isCurrentSentenceSpeaking
                      ? 'text-[var(--seljuk-teal)]'
                      : 'text-[var(--seljuk-navy)]'
                  }`}
                >
                  "{currentStep.englishText}"
                </p>

                {/* Sade Okunuş Yardımı (Aşırı IPA yok, çocuk dostu fonetik) */}
                <div className="inline-flex items-center gap-1.5 bg-amber-50/90 text-amber-900 border border-amber-200/80 px-2.5 py-0.5 rounded-md text-xs font-medium">
                  <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">
                    Okunuş:
                  </span>
                  <span className="font-mono font-semibold tracking-wide">
                    {currentStep.phoneticGuide}
                  </span>
                </div>
              </div>

              {/* Türkçe Anlamı */}
              <p className="text-xs text-gray-500 italic pt-0.5 border-t border-gray-100">
                Türkçe anlamı: <strong className="text-gray-700 font-medium">{currentStep.turkishHint}</strong>
              </p>
            </div>

            {/* Öğrencinin Cevap Seçenekleri (2 veya en fazla 3 sade seçenek) */}
            <div className="space-y-1.5 pt-1">
              <p className="text-xs font-semibold text-center text-[var(--campus-ink-muted)]">
                Şimdi sen de karşılık ver: Seç ve devam et 👇
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentStep.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectOption(option.id)}
                    className="p-3 sm:p-3.5 rounded-xl bg-white hover:bg-[var(--seljuk-teal)]/5 border-2 border-[var(--campus-border)] hover:border-[var(--seljuk-teal)] shadow-sm text-left transition-all active:scale-[0.98] cursor-pointer group flex items-start gap-3"
                  >
                    <span className="text-2xl pt-0.5" aria-hidden="true">
                      {option.icon}
                    </span>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <p className="text-base font-bold text-[var(--seljuk-navy)] group-hover:text-[var(--seljuk-teal)] transition-colors">
                        "{option.text}"
                      </p>
                      {/* Okunuş ve Türkçe İpucu */}
                      <p className="text-[11px] text-amber-800 font-mono font-medium">
                        Okunuş: {option.phoneticGuide}
                      </p>
                      <p className="text-[11px] text-[var(--campus-ink-muted)]">
                        {option.turkishMeaning}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Görev Tamamlama Ekranı (Temiz, Güven Verici, Pedagojik Özet) */
          <div className="relative z-10 max-w-lg mx-auto text-center space-y-3.5 py-3 animate-in fade-in duration-300">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-emerald-800">
                🎉 Harika! Tanışma Bahçesi'ni Keşfettin!
              </h2>
              <p className="text-xs sm:text-sm text-[var(--campus-ink-muted)]">
                Arkadaşların Elif ve Can ile tanıştın. İlk İngilizce kalıplarını güvenle öğrendin.
              </p>
            </div>

            {/* Kısa Özet Kartı: Öğrenilen Kalıplar ve Okunuşları */}
            <div className="p-3.5 rounded-xl bg-white/95 border border-emerald-200 text-left space-y-2 text-xs shadow-xs">
              <p className="font-bold text-[var(--seljuk-navy)] flex items-center gap-1.5 pb-1 border-b border-gray-100">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Öğrendiğin Tanışma Kalıpları:</span>
              </p>
              <div className="space-y-1.5 text-gray-800">
                <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-emerald-50/60">
                  <div>
                    <span className="font-bold text-emerald-900">Hello!</span>
                    <span className="text-[10px] text-amber-800 font-mono ml-2">(he-LO)</span>
                  </div>
                  <span className="text-gray-600 text-[11px]">Merhaba!</span>
                </div>

                <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-amber-50/60">
                  <div>
                    <span className="font-bold text-amber-900">What is your name?</span>
                    <span className="text-[10px] text-amber-800 font-mono ml-2">(UOT iz yor NEYM)</span>
                  </div>
                  <span className="text-gray-600 text-[11px]">Senin adın ne?</span>
                </div>

                <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-teal-50/60">
                  <div>
                    <span className="font-bold text-teal-900">Nice to meet you.</span>
                    <span className="text-[10px] text-amber-800 font-mono ml-2">(NAYS tu MİT yu)</span>
                  </div>
                  <span className="text-gray-600 text-[11px]">Tanıştığıma memnun oldum.</span>
                </div>
              </div>
            </div>

            {/* Aksiyon Düğmeleri */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5">
              {onAdvanceToNextTable && (
                <button
                  type="button"
                  onClick={() => onAdvanceToNextTable('ogren')}
                  className="px-5 py-2.5 rounded-xl bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal-hover)] text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <span>Öğren Masasına Git (2. Masa)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onExitToClassroom}
                className="px-5 py-2.5 rounded-xl bg-[var(--stone-cream)] hover:bg-[var(--campus-surface-muted)] text-[var(--seljuk-navy)] text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 border border-[var(--campus-border)] transition-colors cursor-pointer active:scale-95"
              >
                <span>Masadan Kalk / Sınıfa Dön</span>
              </button>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-[11px] text-[var(--campus-ink-muted)] hover:text-[var(--seljuk-navy)] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Tekrar Oyna</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Alt Bilgi Çubuğu */}
      <footer className="flex items-center justify-between text-xs text-[var(--campus-ink-muted)] pt-1">
        <span>Karakterler: Elif, Can, Sen (3 kişi)</span>
        <button
          type="button"
          onClick={onExitToClassroom}
          className="text-[var(--seljuk-teal)] font-semibold hover:underline cursor-pointer"
        >
          Masadan Kalk
        </button>
      </footer>
    </div>
  );
}
