import { useState } from 'react';
import {
  Volume2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Heart,
  Smile,
  Users,
  Compass,
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
  avatarColor: string;
  englishText: string;
  turkishHint: string;
  options: Array<{
    id: string;
    text: string;
    turkishMeaning: string;
    icon: string;
  }>;
}

const DIALOGUE_STEPS: DialogueStep[] = [
  {
    stepNumber: 1,
    speaker: 'Elif',
    speakerRole: '3. Sınıf Arkadaşın',
    avatarColor: 'bg-emerald-600',
    englishText: 'Hello! Welcome to our garden.',
    turkishHint: 'Merhaba! Bahçemize hoş geldin.',
    options: [
      {
        id: 'opt-hello',
        text: 'Hello! I am glad to be here.',
        turkishMeaning: 'Merhaba! Burada olduğuma sevindim.',
        icon: '👋',
      },
      {
        id: 'opt-goodmorning',
        text: 'Good morning!',
        turkishMeaning: 'Günaydın!',
        icon: '☀️',
      },
    ],
  },
  {
    stepNumber: 2,
    speaker: 'Can',
    speakerRole: 'Meraklı Kampüs Arkadaşın',
    avatarColor: 'bg-amber-600',
    englishText: 'What is your name?',
    turkishHint: 'Senin adın ne?',
    options: [
      {
        id: 'opt-deniz',
        text: 'I am Deniz.',
        turkishMeaning: 'Ben Deniz.',
        icon: '⭐',
      },
      {
        id: 'opt-student',
        text: 'I am a student.',
        turkishMeaning: 'Ben bir öğrenciyim.',
        icon: '🎒',
      },
      {
        id: 'opt-explorer',
        text: 'I am an Explorer.',
        turkishMeaning: 'Ben bir kâşifim.',
        icon: '🔍',
      },
    ],
  },
  {
    stepNumber: 3,
    speaker: 'Elif & Can',
    speakerRole: 'Bahçe Arkadaşların',
    avatarColor: 'bg-teal-600',
    englishText: "Nice to meet you! Let's explore together.",
    turkishHint: 'Tanıştığıma memnun oldum! Birlikte keşfedelim.',
    options: [
      {
        id: 'opt-nicetomeet',
        text: 'Nice to meet you too!',
        turkishMeaning: 'Ben de tanıştığıma çok memnun oldum!',
        icon: '🤝',
      },
      {
        id: 'opt-thanks',
        text: "Thank you! Let's explore!",
        turkishMeaning: 'Teşekkürler! Haydi keşfedelim!',
        icon: '🌿',
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
  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentStep = DIALOGUE_STEPS[currentStepIndex];

  const handleSpeak = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      await speakSegments([{ text, lang: 'en-US' }]);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleSelectOption = (optionId: string) => {
    const updated = { ...selectedAnswers, [currentStepIndex]: optionId };
    setSelectedAnswers(updated);

    if (currentStepIndex < DIALOGUE_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // 3. Adım tamamlandı, kaydı güncelle
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
            writtenText: 'Hello! What is your name? Nice to meet you!',
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
    setCurrentStepIndex(0);
    setSelectedAnswers({});
    setIsCompleted(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6 select-none">
      {/* Üst Bilgi Kartı */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[var(--campus-border)]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[var(--seljuk-teal)]/10 text-[var(--seljuk-teal)] text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" aria-hidden="true" />
            <span>3. Sınıf Keşfet Masası • Özel Prototip</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--seljuk-navy)] flex items-center gap-2">
            <span>🌿 Hello! Tanışma Bahçesi</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--campus-ink-muted)]">
            Bahçedeki arkadaşların Elif ve Can ile selamlaş, İngilizce tanışma ifadelerini dinle ve seç.
          </p>
        </div>

        {/* Adım Göstergesi */}
        {!isCompleted && (
          <div className="flex items-center gap-1.5 self-end sm:self-center px-3 py-1.5 rounded-xl bg-[var(--stone-light)]/60 text-xs font-medium text-[var(--seljuk-navy)]">
            <span>Adım {currentStepIndex + 1} / {DIALOGUE_STEPS.length}</span>
            <div className="flex gap-1 ml-1">
              {DIALOGUE_STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    idx === currentStepIndex
                      ? 'bg-[var(--seljuk-teal)]'
                      : idx < currentStepIndex
                        ? 'bg-emerald-500'
                        : 'bg-[var(--stone-light)] border border-[var(--campus-border)]'
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Bahçe Sahnesi ve Karakter Alanı */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-[var(--seljuk-teal)]/30 bg-gradient-to-b from-[#e0f2fe] via-[#f0fdf4] to-[#fefce8] p-4 sm:p-8 shadow-sm">
        {/* Dekoratif Selçuklu Bahçesi SVG Arka Planı */}
        <div className="absolute inset-0 pointer-events-none opacity-20" aria-hidden="true">
          <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="none">
            {/* Gökyüzü ve Güneş */}
            <circle cx="720" cy="60" r="45" fill="#facc15" />
            {/* Selçuklu Sivri Kemeri Silüeti */}
            <path
              d="M 50,400 L 50,200 Q 200,80 350,200 L 350,400 Z"
              fill="#0e768a"
              opacity="0.3"
            />
            {/* Ağaçlar ve Yeşillik */}
            <circle cx="120" cy="320" r="70" fill="#15803d" opacity="0.4" />
            <circle cx="680" cy="330" r="60" fill="#16a34a" opacity="0.4" />
            <path d="M 0,360 Q 400,320 800,360 L 800,400 L 0,400 Z" fill="#22c55e" opacity="0.25" />
          </svg>
        </div>

        {/* 3 Karakter Rozeti (En fazla 3 karakter kuralı) */}
        <div className="relative z-10 flex items-center justify-center gap-6 sm:gap-12 pb-4">
          {/* 1. Karakter: Elif */}
          <div
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
              currentStep?.speaker.includes('Elif') ? 'scale-110 drop-shadow-md' : 'opacity-65 scale-95'
            }`}
          >
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 shadow-md flex items-center justify-center text-white">
              <Smile className="w-10 h-10 sm:w-12 sm:h-12" aria-hidden="true" />
              {currentStep?.speaker.includes('Elif') && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white animate-ping" />
              )}
            </div>
            <span className="text-xs sm:text-sm font-bold text-[var(--seljuk-navy)]">Elif</span>
            <span className="text-[10px] text-[var(--campus-ink-muted)]">3. Sınıf</span>
          </div>

          {/* 2. Karakter: Can */}
          <div
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
              currentStep?.speaker.includes('Can') ? 'scale-110 drop-shadow-md' : 'opacity-65 scale-95'
            }`}
          >
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 p-1 shadow-md flex items-center justify-center text-white">
              <Users className="w-10 h-10 sm:w-12 sm:h-12" aria-hidden="true" />
              {currentStep?.speaker.includes('Can') && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white animate-ping" />
              )}
            </div>
            <span className="text-xs sm:text-sm font-bold text-[var(--seljuk-navy)]">Can</span>
            <span className="text-[10px] text-[var(--campus-ink-muted)]">3. Sınıf</span>
          </div>

          {/* 3. Karakter: Sen (Öğrenci) */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-400 p-1 shadow-md flex items-center justify-center text-white">
              <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-rose-200" aria-hidden="true" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-[var(--seljuk-navy)]">Sen</span>
            <span className="text-[10px] text-[var(--seljuk-teal)] font-medium">Kâşif</span>
          </div>
        </div>

        {/* Diyalog Balonu / Konuşma Sahnesi */}
        {!isCompleted ? (
          <div className="relative z-10 max-w-xl mx-auto space-y-4 pt-2">
            {/* Konuşan Kişinin Balonu */}
            <div className="bg-white/95 backdrop-blur-xs rounded-2xl p-4 sm:p-5 border-2 border-[var(--campus-border)] shadow-md space-y-2">
              <div className="flex items-center justify-between gap-2 pb-1 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--seljuk-teal)] uppercase tracking-wider">
                    {currentStep.speaker} konuşuyor
                  </span>
                  <span className="text-[11px] text-[var(--campus-ink-muted)]">({currentStep.speakerRole})</span>
                </div>
                {/* Sesli Dinleme Düğmesi */}
                <button
                  type="button"
                  onClick={() => handleSpeak(currentStep.englishText)}
                  disabled={isSpeaking}
                  className="px-2.5 py-1 rounded-lg bg-[var(--seljuk-teal)]/10 hover:bg-[var(--seljuk-teal)]/20 text-[var(--seljuk-teal)] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  aria-label="İngilizce cümleyi sesli dinle"
                >
                  <Volume2 className="w-4 h-4" aria-hidden="true" />
                  <span>{isSpeaking ? 'Dinleniyor...' : 'Dinle'}</span>
                </button>
              </div>

              {/* İngilizce Cümle (Büyük ve Okunaklı) */}
              <p className="text-lg sm:text-xl font-bold text-[var(--seljuk-navy)] font-serif">
                "{currentStep.englishText}"
              </p>

              {/* Türkçe İpucu */}
              <p className="text-xs text-gray-500 italic">
                Türkçe anlamı: {currentStep.turkishHint}
              </p>
            </div>

            {/* Öğrencinin Cevap Seçenekleri (2–3 sade seçenek, bilgi yükü sıfır) */}
            <div className="space-y-2 pt-2">
              <p className="text-xs font-semibold text-center text-[var(--campus-ink-muted)]">
                Şimdi sen de karşılık ver: Birini seç ve devam et 👇
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentStep.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectOption(option.id)}
                    className="p-3.5 rounded-xl bg-white hover:bg-[var(--seljuk-teal)]/5 border-2 border-[var(--campus-border)] hover:border-[var(--seljuk-teal)] shadow-sm text-left transition-all active:scale-[0.98] cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl" aria-hidden="true">{option.icon}</span>
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-[var(--seljuk-navy)] group-hover:text-[var(--seljuk-teal)] transition-colors">
                          "{option.text}"
                        </p>
                        <p className="text-[11px] text-[var(--campus-ink-muted)]">
                          {option.turkishMeaning}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Görev Tamamlama Ekranı (Kısa ve Sade Özet) */
          <div className="relative z-10 max-w-lg mx-auto text-center space-y-4 py-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" aria-hidden="true" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-emerald-800">
                🎉 Harika! Tanışma Bahçesi'ni Keşfettin!
              </h2>
              <p className="text-xs sm:text-sm text-[var(--campus-ink-muted)]">
                Elif ve Can ile selamlaştın, adını söyledin ve İngilizce tanışma kalıplarını öğrendin.
              </p>
            </div>

            {/* Kısa Özet Kartı */}
            <div className="p-4 rounded-xl bg-white/90 border border-emerald-200 text-left space-y-2 text-xs">
              <p className="font-bold text-[var(--seljuk-navy)] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Öğrendiğin İfadeler:</span>
              </p>
              <ul className="space-y-1 text-gray-700 list-disc list-inside">
                <li><strong>Hello!</strong> — Merhaba!</li>
                <li><strong>What is your name?</strong> — Senin adın ne?</li>
                <li><strong>Nice to meet you!</strong> — Tanıştığıma memnun oldum!</li>
              </ul>
            </div>

            {/* Aksiyon Düğmeleri */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              {onAdvanceToNextTable && (
                <button
                  type="button"
                  onClick={() => onAdvanceToNextTable('ogren')}
                  className="px-5 py-2.5 rounded-xl bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal-hover)] text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <span>Öğren Masasına Git (2. Masa)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onExitToClassroom}
                className="px-5 py-2.5 rounded-xl bg-[var(--stone-cream)] hover:bg-[var(--campus-surface-muted)] text-[var(--seljuk-navy)] text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 border border-[var(--campus-border)] transition-colors cursor-pointer"
              >
                <span>Masadan Kalk / Sınıfa Dön</span>
              </button>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] text-[var(--campus-ink-muted)] hover:text-[var(--seljuk-navy)] underline cursor-pointer"
              >
                Etkinliği Tekrar Oyna
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Alt Bilgi Çubuğu */}
      <footer className="flex items-center justify-between text-xs text-[var(--campus-ink-muted)] pt-2 border-t border-[var(--campus-border)]">
        <span>Karakterler: Elif, Can, Sen (3 kişi)</span>
        <button
          type="button"
          onClick={onExitToClassroom}
          className="text-[var(--seljuk-teal)] font-medium hover:underline cursor-pointer"
        >
          Masadan Kalk
        </button>
      </footer>
    </div>
  );
}
