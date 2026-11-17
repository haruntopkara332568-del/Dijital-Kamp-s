import { useState, useEffect } from 'react';
import {
  Volume2,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Hand,
  HelpCircle,
  ArrowLeft,
} from 'lucide-react';
import { useOptionalCampus } from '@/src/app/CampusProviders';
import type { MissionProgress, MissionStageId } from '@/src/types/campus';

export interface HelloGardenViewProps {
  missionId?: string;
  onExitToClassroom: () => void;
  onAdvanceToNextTable?: (stage: MissionStageId) => void;
}

type CharacterId = 'ali' | 'ece' | 'can';

type InteractionStep =
  | 'choose_character'
  | 'step1_greeting'
  | 'step2_name_ask'
  | 'step2_name_introduce'
  | 'step3_age_ask'
  | 'step3_age_number'
  | 'step4_farewell'
  | 'completed';

export function HelloGardenView({
  missionId = 'kapilarin-anlattigi-hikaye',
  onExitToClassroom,
}: HelloGardenViewProps) {
  const campus = useOptionalCampus();

  // Animasyon ve kamera yaklaşma durumu
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window !== 'undefined' && 'matchMedia' in window) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  // Karakter ve etkileşim durumları
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterId | null>('ali');
  const [currentStep, setCurrentStep] = useState<InteractionStep>('step1_greeting');
  const [completedInteractions, setCompletedInteractions] = useState<{
    greeting: boolean;
    name: boolean;
    age: boolean;
    farewell: boolean;
  }>({
    greeting: false,
    name: false,
    age: false,
    farewell: false,
  });

  // Hata ve geri bildirim durumu
  const [feedbackMessage, setFeedbackMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  // Ses durumu
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeechSpeed, setActiveSpeechSpeed] = useState<'normal' | 'slow' | null>(null);
  const [currentSpokenText, setCurrentSpokenText] = useState<string>('');

  // Karakter animasyon tepkisi ('idle' | 'wave' | 'nod' | 'cheer' | 'confused')
  const [characterAction, setCharacterAction] = useState<
    'idle' | 'wave' | 'nod' | 'cheer' | 'confused'
  >('wave');

  // Sayı seçimi durumu
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);

  // İndirgenmiş hareket tercihi dinleyicisi
  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Kamera yaklaşma animasyonu (Masaya ve minyatür bahçeye sinematik odak)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsZoomedIn(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Bileşen kapandığında veya sayfa değiştiğinde sesi durdur
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /**
   * Web Speech API ile İngilizce seslendirme:
   * - normal: rate 0.85
   * - slow: rate 0.65
   */
  const playSpeech = (text: string, speed: 'normal' | 'slow' = 'normal') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    setCurrentSpokenText(text);
    setActiveSpeechSpeed(speed);
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = speed === 'slow' ? 0.65 : 0.85;
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice =
      voices.find((v) => v.lang.toLowerCase() === 'en-us') ||
      voices.find((v) => v.lang.toLowerCase().startsWith('en'));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
      setActiveSpeechSpeed(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setActiveSpeechSpeed(null);
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  };

  /**
   * Karakter seçimi
   */
  const handleSelectCharacter = (charId: CharacterId) => {
    setFeedbackMessage(null);
    setSelectedCharacter(charId);

    if (charId === 'ali') {
      if (!completedInteractions.greeting) {
        setCurrentStep('step1_greeting');
        setCharacterAction('wave');
        playSpeech('Hello!', 'normal');
      }
    } else if (charId === 'ece') {
      if (!completedInteractions.greeting) {
        setFeedbackMessage({
          text: 'Önce bahçe kapısındaki Ali ile selamlaşalım!',
          isError: true,
        });
        setCharacterAction('confused');
        return;
      }
      if (!completedInteractions.name) {
        setCurrentStep('step2_name_ask');
        setCharacterAction('wave');
      }
    } else if (charId === 'can') {
      if (!completedInteractions.name) {
        setFeedbackMessage({
          text: 'Önce çiçeklerin yanındaki Ece ile tanışalım!',
          isError: true,
        });
        setCharacterAction('confused');
        return;
      }
      if (!completedInteractions.age) {
        setCurrentStep('step3_age_ask');
        setCharacterAction('wave');
      }
    }
  };

  /**
   * 1. ETKİLEŞİM: Selamlaşma (Ali)
   */
  const handleGreetingAnswer = (answer: 'Hello!' | 'Hi!' | 'Goodbye!') => {
    if (answer === 'Goodbye!') {
      setCharacterAction('confused');
      setFeedbackMessage({
        text: 'Henüz yeni karşılaştık! Ayrılmıyoruz. Selamlaşmak için "Hello!" veya "Hi!" demelisin.',
        isError: true,
      });
      return;
    }

    // Doğru cevap: Hello! veya Hi!
    setCharacterAction('cheer');
    setFeedbackMessage({
      text: 'Harika! Ali ile selamlaştın. Şimdi Ece ile tanışabilirsin!',
      isError: false,
    });
    playSpeech(answer, 'normal');

    setCompletedInteractions((prev) => ({ ...prev, greeting: true }));

    setTimeout(() => {
      setSelectedCharacter('ece');
      setCurrentStep('step2_name_ask');
      setCharacterAction('idle');
      setFeedbackMessage(null);
    }, 300);
  };

  /**
   * 2. ETKİLEŞİM - A: Ad Sorma (Ece)
   */
  const handleNameAsk = (question: "What's your name?" | 'How old are you?') => {
    if (question === 'How old are you?') {
      setCharacterAction('confused');
      setFeedbackMessage({
        text: 'Önce adını öğrenelim! "What\'s your name?" diye sorabilirsin.',
        isError: true,
      });
      return;
    }

    setCharacterAction('nod');
    setFeedbackMessage(null);
    playSpeech("What's your name?", 'normal');

    setTimeout(() => {
      setCurrentStep('step2_name_introduce');
      setCharacterAction('wave');
      playSpeech('My name is Ece.', 'normal');
    }, 300);
  };

  /**
   * 2. ETKİLEŞİM - B: Kendini Tanıtma (Deniz)
   */
  const handleNameIntroduce = (answer: 'My name is Deniz.' | 'My name is Ali.') => {
    if (answer === 'My name is Ali.') {
      setCharacterAction('confused');
      setFeedbackMessage({
        text: 'Ali bahçe kapısındaki arkadaşımızdı! Kendi hazır kâşif adını söylemelisin: "My name is Deniz."',
        isError: true,
      });
      return;
    }

    setCharacterAction('cheer');
    playSpeech('Nice to meet you!', 'normal');
    setFeedbackMessage({
      text: 'Harika! Ece ile tanıştın. Şimdi Can\'ın yaşını öğrenebilirsin!',
      isError: false,
    });

    setCompletedInteractions((prev) => ({ ...prev, name: true }));

    setTimeout(() => {
      setSelectedCharacter('can');
      setCurrentStep('step3_age_ask');
      setCharacterAction('idle');
      setFeedbackMessage(null);
    }, 300);
  };

  /**
   * 3. ETKİLEŞİM - A: Yaş Sorma (Can)
   */
  const handleAgeAsk = (question: 'How old are you?' | "What's your name?") => {
    if (question === "What's your name?") {
      setCharacterAction('confused');
      setFeedbackMessage({
        text: 'Can\'ın adını zaten biliyoruz! Yaşını sormak için "How old are you?" demelisin.',
        isError: true,
      });
      return;
    }

    setCharacterAction('nod');
    setFeedbackMessage(null);
    playSpeech('How old are you?', 'normal');

    setTimeout(() => {
      setCurrentStep('step3_age_number');
      setCharacterAction('wave');
      playSpeech("I'm nine.", 'normal');
    }, 300);
  };

  /**
   * 3. ETKİLEŞİM - B: Bahçedeki Sayıyı Belirleme (9)
   */
  const handleSelectNumber = (num: number) => {
    setSelectedNumber(num);

    if (num !== 9) {
      setCharacterAction('confused');
      setFeedbackMessage({
        text: `Can "I'm nine." dedi. Nine = 9 demektir! (${num} değil). Tekrar dene!`,
        isError: true,
      });
      return;
    }

    setCharacterAction('cheer');
    playSpeech("I'm nine.", 'normal');
    setFeedbackMessage({
      text: 'Tebrikler! 9 sayısını doğru buldun. Can 9 yaşında!',
      isError: false,
    });

    setCompletedInteractions((prev) => ({ ...prev, age: true }));

    setTimeout(() => {
      setCurrentStep('step4_farewell');
      setCharacterAction('wave');
      setFeedbackMessage(null);
    }, 300);
  };

  /**
   * 4. ETKİLEŞİM: Vedalaşma (Tüm Arkadaşlar)
   */
  const handleFarewell = (choice: 'Goodbye!' | 'Hello!') => {
    if (choice === 'Hello!') {
      setCharacterAction('confused');
      setFeedbackMessage({
        text: 'Ayrılırken ve vedalaşırken "Goodbye!" demeliyiz.',
        isError: true,
      });
      return;
    }

    setCharacterAction('cheer');
    playSpeech('Goodbye!', 'normal');
    setCompletedInteractions((prev) => ({ ...prev, farewell: true }));

    // Dört etkileşim de tamamlandığında kaydet!
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
          writtenText: "Hello! What's your name? I'm nine. Goodbye!",
          usedEnglishWords: ['Hello', 'Name', 'Nine', 'Goodbye'],
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

    setTimeout(() => {
      setCurrentStep('completed');
      setFeedbackMessage(null);
    }, 300);
  };

  const handleResetSimulation = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCompletedInteractions({
      greeting: false,
      name: false,
      age: false,
      farewell: false,
    });
    setSelectedCharacter('ali');
    setCurrentStep('step1_greeting');
    setCharacterAction('wave');
    setFeedbackMessage(null);
    setSelectedNumber(null);
  };

  return (
    <div className="w-full h-full flex flex-col p-2 sm:p-4 bg-gradient-to-b from-[#eaf4f7] via-[#f8faf7] to-[#f4ebe1] select-none overflow-x-hidden">
      {/* Üst Bilgilendirme Çubuğu */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-[#c8dcd9]">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">
            🌿
          </span>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-[var(--seljuk-navy)] flex items-center gap-1.5 font-serif">
              <span>Hello! Tanışma Bahçesi</span>
              <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-sans font-medium">
                3. Sınıf Keşfet Masası Minyatür Simülasyonu
              </span>
            </h1>
            <p className="text-[11px] text-[var(--campus-ink-muted)]">
              Masanın üzerindeki canlı bahçeyi keşfet, arkadaşlarınla konuş ve 4 görevi tamamla.
            </p>
          </div>
        </div>

        {/* Görev İlerleme Rozetleri */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-[11px]">
          <span
            className={`px-2 py-1 rounded-md font-semibold flex items-center gap-1 transition-all ${
              completedInteractions.greeting
                ? 'bg-emerald-100 text-emerald-800'
                : currentStep === 'step1_greeting'
                  ? 'bg-amber-100 text-amber-900 ring-2 ring-amber-400'
                  : 'bg-gray-100 text-gray-500'
            }`}
          >
            {completedInteractions.greeting ? '✓' : '1'} Selamlaşma
          </span>
          <span
            className={`px-2 py-1 rounded-md font-semibold flex items-center gap-1 transition-all ${
              completedInteractions.name
                ? 'bg-emerald-100 text-emerald-800'
                : currentStep.startsWith('step2')
                  ? 'bg-teal-100 text-teal-900 ring-2 ring-teal-400'
                  : 'bg-gray-100 text-gray-500'
            }`}
          >
            {completedInteractions.name ? '✓' : '2'} Tanışma
          </span>
          <span
            className={`px-2 py-1 rounded-md font-semibold flex items-center gap-1 transition-all ${
              completedInteractions.age
                ? 'bg-emerald-100 text-emerald-800'
                : currentStep.startsWith('step3')
                  ? 'bg-indigo-100 text-indigo-900 ring-2 ring-indigo-400'
                  : 'bg-gray-100 text-gray-500'
            }`}
          >
            {completedInteractions.age ? '✓' : '3'} Yaş (9)
          </span>
          <span
            className={`px-2 py-1 rounded-md font-semibold flex items-center gap-1 transition-all ${
              completedInteractions.farewell
                ? 'bg-emerald-100 text-emerald-800'
                : currentStep === 'step4_farewell'
                  ? 'bg-purple-100 text-purple-900 ring-2 ring-purple-400'
                  : 'bg-gray-100 text-gray-500'
            }`}
          >
            {completedInteractions.farewell ? '✓' : '4'} Vedalaşma
          </span>
        </div>
      </div>

      {/* Masaüstü Minyatür Bahçe Çerçevesi (Sinematik Masa Odaklı 2.5D Sahne) */}
      <div
        className={`relative flex-1 rounded-2xl overflow-hidden border-4 border-[#8c5f34] bg-[#2d1b0f] shadow-2xl transition-all duration-700 ${
          isZoomedIn && !prefersReducedMotion ? 'scale-100 opacity-100' : 'scale-95 opacity-90'
        }`}
      >
        {/* Ahşap Masa Dokusu & Selçuklu Çini Bordürü */}
        <div className="absolute inset-0 pointer-events-none border-[6px] border-[#a06830]/80 rounded-xl z-20 shadow-inner" />

        {/* 2.5D Minyatür Bahçe Sahnesi (SVG + Canlı Etkileşim Katmanı) */}
        <div className="relative w-full h-[320px] sm:h-[380px] md:h-[420px] overflow-hidden bg-gradient-to-b from-[#c3e6ed] via-[#d6eedb] to-[#b8dfbe]">
          {/* Gökyüzü ve Güneş Işığı Huzmeleri */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1000 500"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="gardenSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#fef9c3" stopOpacity="0.5" />
              </linearGradient>
              <linearGradient id="gardenLawn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#86efac" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#4ade80" stopOpacity="0.95" />
              </linearGradient>
              <radialGradient id="sunGlowGrad" cx="0.85" cy="0.15" r="0.4">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Gökyüzü */}
            <rect width="1000" height="200" fill="url(#gardenSky)" />
            {/* Güneş Işıltısı */}
            <circle cx="850" cy="70" r="160" fill="url(#sunGlowGrad)" />

            {/* Uzak Selçuklu Sivri Kemerli Taş Duvar Silüeti */}
            <path
              d="M 0,200 L 120,200 L 120,165 Q 160,135 200,165 L 200,200 L 450,200 L 450,170 Q 480,145 510,170 L 510,200 L 1000,200 L 1000,500 L 0,500 Z"
              fill="#e2d6c3"
              opacity="0.85"
            />
            {/* Taş Duvar Süsleme Çizgisi */}
            <line x1="0" y1="180" x2="1000" y2="180" stroke="#c4b59f" strokeWidth="2" strokeDasharray="8 4" />

            {/* Arka Plan Servi ve Zeytin Ağaçları */}
            {/* Servi 1 */}
            <path d="M 80,200 C 65,150 75,70 85,40 C 95,70 105,150 90,200 Z" fill="#1e3a2f" />
            {/* Servi 2 */}
            <path d="M 120,200 C 105,160 115,100 125,70 C 135,100 145,160 130,200 Z" fill="#2d5543" />
            {/* Geniş Yapraklı Meyve/Zeytin Ağacı (Sağ taraf) */}
            <rect x="880" y="160" width="18" height="60" fill="#78350f" rx="3" />
            <circle cx="890" cy="140" r="50" fill="#15803d" opacity="0.9" />
            <circle cx="860" cy="130" r="35" fill="#16a34a" opacity="0.95" />
            <circle cx="915" cy="135" r="35" fill="#22c55e" opacity="0.9" />

            {/* Bahçe Çimenliği (2.5D Zemin) */}
            <path
              d="M 0,200 Q 500,185 1000,200 L 1000,500 L 0,500 Z"
              fill="url(#gardenLawn)"
            />

            {/* Kıvrımlı Taş Yürüyüş Yolu (Stepping Stone Path) */}
            {/* Kapıdan içeri kıvrılan patika */}
            <path
              d="M 120,500 C 160,400 240,360 380,330 C 520,300 650,310 820,260 L 860,285 C 680,340 550,335 400,370 C 260,400 190,460 160,500 Z"
              fill="#d6c7b2"
              stroke="#b5a48d"
              strokeWidth="2"
            />
            {/* Adım Taşları Detayları */}
            <ellipse cx="150" cy="460" rx="32" ry="14" fill="#eee4d5" stroke="#9ca3af" strokeWidth="1.5" />
            <ellipse cx="230" cy="410" rx="30" ry="13" fill="#f3eae0" stroke="#9ca3af" strokeWidth="1.5" />
            <ellipse cx="330" cy="365" rx="28" ry="12" fill="#eee4d5" stroke="#9ca3af" strokeWidth="1.5" />
            <ellipse cx="440" cy="335" rx="26" ry="11" fill="#f3eae0" stroke="#9ca3af" strokeWidth="1.5" />
            <ellipse cx="570" cy="315" rx="25" ry="10" fill="#eee4d5" stroke="#9ca3af" strokeWidth="1.5" />
            <ellipse cx="700" cy="290" rx="24" ry="9" fill="#f3eae0" stroke="#9ca3af" strokeWidth="1.5" />
            <ellipse cx="810" cy="275" rx="22" ry="8" fill="#eee4d5" stroke="#9ca3af" strokeWidth="1.5" />

            {/* Minyatür Ahşap Bahçe Kapısı (Sol Giriş) */}
            <g transform="translate(60, 360)">
              {/* Sol ve Sağ Direk */}
              <rect x="0" y="0" width="14" height="120" rx="2" fill="#854d0e" stroke="#58310c" strokeWidth="2" />
              <rect x="90" y="0" width="14" height="120" rx="2" fill="#854d0e" stroke="#58310c" strokeWidth="2" />
              {/* Üst Kemer */}
              <path d="M 0,10 Q 52,-25 104,10" fill="none" stroke="#854d0e" strokeWidth="8" strokeLinecap="round" />
              {/* Sarı Fener */}
              <circle cx="52" cy="0" r="7" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
              <line x1="52" y1="-10" x2="52" y2="-6" stroke="#58310c" strokeWidth="2" />
              {/* Çit Parmaklıkları */}
              <path d="M 14,50 L 90,50 M 14,85 L 90,85" stroke="#a16207" strokeWidth="4" />
            </g>

            {/* Çiçek Tarhları (Renkli laleler ve papatyalar) */}
            <g transform="translate(420, 370)">
              <ellipse cx="0" cy="0" rx="45" ry="15" fill="#854d0e" opacity="0.3" />
              <circle cx="-25" cy="-8" r="6" fill="#f43f5e" />
              <circle cx="-10" cy="-14" r="7" fill="#eab308" />
              <circle cx="8" cy="-10" r="6" fill="#a855f7" />
              <circle cx="24" cy="-8" r="7" fill="#f43f5e" />
              <circle cx="0" cy="-6" r="5" fill="#38bdf8" />
            </g>
          </svg>

          {/* Bahçedeki Canlı Karakterler (Doğrudan Seçilebilir ve Canlı Tepki Veren) */}
          <div className="absolute inset-0 z-10 flex items-center justify-around px-4 pointer-events-none">
            {/* 1. KARAKTER: ALİ (Kapı Yanı / Selamlaşma İstasyonu) */}
            <div className="pointer-events-auto flex flex-col items-center">
              <button
                type="button"
                onClick={() => handleSelectCharacter('ali')}
                className={`relative group flex flex-col items-center transition-all cursor-pointer focus:outline-none ${
                  selectedCharacter === 'ali' ? 'scale-105 sm:scale-110' : 'hover:scale-105'
                }`}
                aria-label="Ali ile konuş"
              >
                {/* Karakter Durum Rozeti */}
                <div
                  className={`px-2 py-0.5 mb-1 rounded-full text-[10px] font-bold shadow-md flex items-center gap-1 transition-all ${
                    completedInteractions.greeting
                      ? 'bg-emerald-600 text-white'
                      : selectedCharacter === 'ali'
                        ? 'bg-amber-500 text-white ring-2 ring-amber-300 animate-bounce'
                        : 'bg-white/90 text-gray-800'
                  }`}
                >
                  {completedInteractions.greeting ? (
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  ) : (
                    <span>👋 1. Ali</span>
                  )}
                  <span>{completedInteractions.greeting ? 'Ali ✓' : 'Ali'}</span>
                </div>

                {/* Ali SVG Çizimi (Hareketli El Sallama & Selamlaşma) */}
                <div className="relative w-20 h-28 sm:w-24 sm:h-32 drop-shadow-lg">
                  {/* Seçili Aydınlatma Halkası */}
                  {selectedCharacter === 'ali' && (
                    <div className="absolute -bottom-2 inset-x-0 h-6 bg-amber-400/40 rounded-full blur-xs animate-pulse" />
                  )}

                  <svg viewBox="0 0 100 130" className="w-full h-full">
                    {/* Gövde ve Tişört (Turuncu ve Turkuaz) */}
                    <path d="M 28,130 L 32,80 Q 50,75 68,80 L 72,130 Z" fill="#ea580c" />
                    <rect x="42" y="80" width="16" height="50" fill="#0284c7" />

                    {/* El Sallayan Sağ Kol (Karakter aksiyonuna göre hareketli) */}
                    <g
                      className={`origin-top-left transition-transform duration-300 ${
                        selectedCharacter === 'ali' && characterAction === 'wave'
                          ? 'animate-pulse -rotate-12'
                          : ''
                      }`}
                    >
                      <path d="M 70,82 Q 88,60 85,45" stroke="#ea580c" strokeWidth="10" strokeLinecap="round" fill="none" />
                      <circle cx="85" cy="45" r="7" fill="#fed7aa" />
                      {/* El Sallama Çizgileri */}
                      <path d="M 90,38 Q 95,44 92,50" stroke="#f59e0b" strokeWidth="2" fill="none" />
                    </g>

                    {/* Sol Kol (Sakin Yan Tarafta) */}
                    <path d="M 30,82 Q 18,100 24,115" stroke="#ea580c" strokeWidth="9" strokeLinecap="round" fill="none" />
                    <circle cx="24" cy="115" r="6" fill="#fed7aa" />

                    {/* Baş ve Yüz */}
                    <rect x="45" y="65" width="10" height="15" rx="3" fill="#fed7aa" />
                    <circle cx="50" cy="50" r="22" fill="#fed7aa" />

                    {/* Saç (Kahverengi ve Sevimli) */}
                    <path d="M 28,50 Q 50,22 72,50 Q 50,35 28,50 Z" fill="#78350f" />
                    <path d="M 32,40 Q 50,18 68,40" stroke="#78350f" strokeWidth="8" strokeLinecap="round" fill="none" />

                    {/* Yüz İfadesi: Gözler ve Gülümseme */}
                    <circle cx="43" cy="50" r="2.5" fill="#1e293b" />
                    <circle cx="57" cy="50" r="2.5" fill="#1e293b" />
                    {selectedCharacter === 'ali' && characterAction === 'confused' ? (
                      /* Şaşkın / Düşünceli Ağız */
                      <path d="M 46,62 Q 50,58 54,62" stroke="#9a3412" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    ) : (
                      /* Neşeli Gülümseme */
                      <path d="M 44,58 Q 50,66 56,58" stroke="#9a3412" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    )}
                  </svg>
                </div>
              </button>
            </div>

            {/* 2. KARAKTER: ECE (Çiçekler Yanı / Tanışma İstasyonu) */}
            <div className="pointer-events-auto flex flex-col items-center">
              <button
                type="button"
                onClick={() => handleSelectCharacter('ece')}
                className={`relative group flex flex-col items-center transition-all cursor-pointer focus:outline-none ${
                  selectedCharacter === 'ece' ? 'scale-105 sm:scale-110' : 'hover:scale-105'
                }`}
                aria-label="Ece ile konuş"
              >
                {/* Karakter Durum Rozeti */}
                <div
                  className={`px-2 py-0.5 mb-1 rounded-full text-[10px] font-bold shadow-md flex items-center gap-1 transition-all ${
                    completedInteractions.name
                      ? 'bg-emerald-600 text-white'
                      : selectedCharacter === 'ece'
                        ? 'bg-teal-500 text-white ring-2 ring-teal-300 animate-bounce'
                        : 'bg-white/90 text-gray-800'
                  }`}
                >
                  {completedInteractions.name ? (
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  ) : (
                    <span>🌸 2. Ece</span>
                  )}
                  <span>{completedInteractions.name ? 'Ece ✓' : 'Ece'}</span>
                </div>

                {/* Ece SVG Çizimi (İkili Örgülü, Turkuaz Elbiseli) */}
                <div className="relative w-20 h-28 sm:w-24 sm:h-32 drop-shadow-lg">
                  {selectedCharacter === 'ece' && (
                    <div className="absolute -bottom-2 inset-x-0 h-6 bg-teal-400/40 rounded-full blur-xs animate-pulse" />
                  )}

                  <svg viewBox="0 0 100 130" className="w-full h-full">
                    {/* Elbise (Turkuaz & Çiçek Sarı Kuşak) */}
                    <path d="M 30,130 L 35,82 Q 50,78 65,82 L 70,130 Z" fill="#0d9488" />
                    <rect x="36" y="98" width="28" height="6" fill="#facc15" rx="2" />

                    {/* Sağ Kol (Nazik Karşılama) */}
                    <path d="M 68,85 Q 82,98 80,112" stroke="#0d9488" strokeWidth="8" strokeLinecap="round" fill="none" />
                    <circle cx="80" cy="112" r="5.5" fill="#fed7aa" />

                    {/* Sol Kol (El Sallayan veya Çiçek Tutan) */}
                    <g
                      className={`origin-top-right transition-transform duration-300 ${
                        selectedCharacter === 'ece' && characterAction === 'wave'
                          ? 'animate-pulse rotate-6'
                          : ''
                      }`}
                    >
                      <path d="M 32,85 Q 16,70 18,52" stroke="#0d9488" strokeWidth="8" strokeLinecap="round" fill="none" />
                      <circle cx="18" cy="52" r="5.5" fill="#fed7aa" />
                      <circle cx="18" cy="46" r="3" fill="#f43f5e" />
                    </g>

                    {/* Boyun ve Baş */}
                    <rect x="46" y="66" width="8" height="14" rx="2" fill="#fed7aa" />
                    <circle cx="50" cy="50" r="21" fill="#fed7aa" />

                    {/* Saç ve İki Yan Örgü (Koyu Kestane Saç) */}
                    <path d="M 28,50 Q 50,25 72,50 Q 50,38 28,50 Z" fill="#451a03" />
                    {/* Sol ve Sağ Örgü */}
                    <path d="M 28,52 Q 18,65 20,80" stroke="#451a03" strokeWidth="6" strokeLinecap="round" fill="none" />
                    <circle cx="20" cy="80" r="3" fill="#f43f5e" />
                    <path d="M 72,52 Q 82,65 80,80" stroke="#451a03" strokeWidth="6" strokeLinecap="round" fill="none" />
                    <circle cx="80" cy="80" r="3" fill="#f43f5e" />

                    {/* Yüz İfadesi */}
                    <circle cx="44" cy="50" r="2.5" fill="#1e293b" />
                    <circle cx="56" cy="50" r="2.5" fill="#1e293b" />
                    {selectedCharacter === 'ece' && characterAction === 'confused' ? (
                      <path d="M 46,61 Q 50,57 54,61" stroke="#9a3412" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    ) : (
                      <path d="M 45,58 Q 50,65 55,58" stroke="#9a3412" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    )}
                  </svg>
                </div>
              </button>
            </div>

            {/* 3. KARAKTER: CAN (Ağaçlar Yanı / Yaş ve Sayı İstasyonu) */}
            <div className="pointer-events-auto flex flex-col items-center">
              <button
                type="button"
                onClick={() => handleSelectCharacter('can')}
                className={`relative group flex flex-col items-center transition-all cursor-pointer focus:outline-none ${
                  selectedCharacter === 'can' ? 'scale-105 sm:scale-110' : 'hover:scale-105'
                }`}
                aria-label="Can ile konuş"
              >
                {/* Karakter Durum Rozeti */}
                <div
                  className={`px-2 py-0.5 mb-1 rounded-full text-[10px] font-bold shadow-md flex items-center gap-1 transition-all ${
                    completedInteractions.age
                      ? 'bg-emerald-600 text-white'
                      : selectedCharacter === 'can'
                        ? 'bg-indigo-500 text-white ring-2 ring-indigo-300 animate-bounce'
                        : 'bg-white/90 text-gray-800'
                  }`}
                >
                  {completedInteractions.age ? (
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  ) : (
                    <span>🎂 3. Can</span>
                  )}
                  <span>{completedInteractions.age ? 'Can (9) ✓' : 'Can'}</span>
                </div>

                {/* Can SVG Çizimi (Kâşif Şapkalı, Dürbünlü ve 9 Yaşında) */}
                <div className="relative w-20 h-28 sm:w-24 sm:h-32 drop-shadow-lg">
                  {selectedCharacter === 'can' && (
                    <div className="absolute -bottom-2 inset-x-0 h-6 bg-indigo-400/40 rounded-full blur-xs animate-pulse" />
                  )}

                  <svg viewBox="0 0 100 130" className="w-full h-full">
                    {/* Pantolon ve Kâşif Yeleği */}
                    <path d="M 30,130 L 33,82 Q 50,78 67,82 L 70,130 Z" fill="#4338ca" />
                    <rect x="42" y="82" width="16" height="48" fill="#38bdf8" />
                    {/* Dürbün Askısı */}
                    <path d="M 38,82 Q 50,105 62,82" stroke="#1e1b4b" strokeWidth="3" fill="none" />
                    <circle cx="50" cy="104" r="5" fill="#f59e0b" />

                    {/* Sağ Kol */}
                    <path d="M 68,85 Q 82,100 78,114" stroke="#4338ca" strokeWidth="8" strokeLinecap="round" fill="none" />
                    <circle cx="78" cy="114" r="5.5" fill="#fed7aa" />

                    {/* Sol Kol (Canlı El Sallama) */}
                    <g
                      className={`origin-top-left transition-transform duration-300 ${
                        selectedCharacter === 'can' && characterAction === 'wave'
                          ? 'animate-pulse -rotate-10'
                          : ''
                      }`}
                    >
                      <path d="M 32,85 Q 16,65 20,48" stroke="#4338ca" strokeWidth="8" strokeLinecap="round" fill="none" />
                      <circle cx="20" cy="48" r="5.5" fill="#fed7aa" />
                    </g>

                    {/* Boyun ve Baş */}
                    <rect x="46" y="66" width="8" height="14" rx="2" fill="#fed7aa" />
                    <circle cx="50" cy="52" r="21" fill="#fed7aa" />

                    {/* Kâşif Şapkası */}
                    <path d="M 22,46 Q 50,26 78,46 L 76,40 Q 50,22 24,40 Z" fill="#0e768a" />
                    <ellipse cx="50" cy="44" rx="28" ry="6" fill="#0e768a" />
                    <circle cx="50" cy="38" r="3.5" fill="#facc15" />

                    {/* Gözler ve Gülümseme */}
                    <circle cx="43" cy="52" r="2.5" fill="#1e293b" />
                    <circle cx="57" cy="52" r="2.5" fill="#1e293b" />
                    {selectedCharacter === 'can' && characterAction === 'confused' ? (
                      <path d="M 45,62 Q 50,58 55,62" stroke="#9a3412" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    ) : (
                      <path d="M 45,60 Q 50,67 55,60" stroke="#9a3412" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    )}
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* CANLI DİYALOG VE ETKİLEŞİM ALANI (Masanın Alt Paneli) */}
        <div className="relative z-30 p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t-2 border-[#8c5f34] flex flex-col gap-2.5 min-h-[220px]">
          {/* Hata veya Yönlendirme Geri Bildirimi */}
          {feedbackMessage && (
            <div
              className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-between gap-2 shadow-xs transition-all ${
                feedbackMessage.isError
                  ? 'bg-rose-50 text-rose-800 border border-rose-200 animate-pulse'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
              role="alert"
            >
              <div className="flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>{feedbackMessage.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackMessage(null)}
                className="text-[11px] underline cursor-pointer text-gray-600 hover:text-black"
              >
                Kapat
              </button>
            </div>
          )}

          {/* 1. ETKİLEŞİM: SELAMLAŞMA AKIŞI */}
          {currentStep === 'step1_greeting' && (
            <div className="space-y-2 animate-in fade-in duration-300">
              {/* Konuşma Balonu */}
              <div
                className={`p-3 rounded-xl border-2 transition-all ${
                  isSpeaking && currentSpokenText === 'Hello!'
                    ? 'border-teal-500 ring-4 ring-teal-500/20 bg-teal-50/50'
                    : 'border-gray-200 bg-gray-50/80'
                }`}
              >
                <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-gray-200">
                  <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                    <span>👋 Ali seni karşılıyor:</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => playSpeech('Hello!', 'normal')}
                      className="px-2.5 py-1 rounded-md text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white inline-flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                      aria-label="Ali'nin selamını dinle"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isSpeaking && activeSpeechSpeed === 'normal' ? 'Dinleniyor...' : 'Dinle'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => playSpeech('Hello!', 'slow')}
                      className="px-2 py-1 rounded-md text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 inline-flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                      aria-label="Ali'nin selamını yavaş dinle"
                    >
                      <span>🐢</span>
                      <span>{isSpeaking && activeSpeechSpeed === 'slow' ? 'Yavaş...' : 'Yavaş Dinle'}</span>
                    </button>
                  </div>
                </div>

                <div className="py-2">
                  <p className="text-2xl sm:text-3xl font-extrabold text-[var(--seljuk-navy)] font-serif">
                    "Hello!"
                  </p>
                  <p className="text-xs text-gray-500 italic mt-0.5">Türkçe anlamı: Merhaba!</p>
                </div>
              </div>

              {/* Öğrenci Seçenekleri (İlgili Etkileşim Sırasında Görünür) */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-700">Ali'ye uygun şekilde karşılık ver:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleGreetingAnswer('Hello!')}
                    className="p-3 rounded-xl border-2 border-teal-200 hover:border-teal-500 bg-white hover:bg-teal-50/50 shadow-sm text-left transition-all active:scale-[0.98] cursor-pointer group"
                  >
                    <p className="text-base font-bold text-[var(--seljuk-navy)] group-hover:text-teal-700">
                      "Hello!"
                    </p>
                    <p className="text-[11px] text-gray-500">Merhaba!</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGreetingAnswer('Hi!')}
                    className="p-3 rounded-xl border-2 border-teal-200 hover:border-teal-500 bg-white hover:bg-teal-50/50 shadow-sm text-left transition-all active:scale-[0.98] cursor-pointer group"
                  >
                    <p className="text-base font-bold text-[var(--seljuk-navy)] group-hover:text-teal-700">
                      "Hi!"
                    </p>
                    <p className="text-[11px] text-gray-500">Selam!</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGreetingAnswer('Goodbye!')}
                    className="p-3 rounded-xl border-2 border-gray-200 hover:border-rose-400 bg-white hover:bg-rose-50/40 shadow-sm text-left transition-all active:scale-[0.98] cursor-pointer group"
                  >
                    <p className="text-base font-bold text-gray-700 group-hover:text-rose-700">
                      "Goodbye!"
                    </p>
                    <p className="text-[11px] text-gray-500">Hoşça kal! (Ayrılırken)</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. ETKİLEŞİM - A: AD SORMA (ECE) */}
          {currentStep === 'step2_name_ask' && (
            <div className="space-y-2 animate-in fade-in duration-300">
              <div className="p-3 rounded-xl border-2 border-teal-200 bg-teal-50/40">
                <p className="text-xs font-bold text-teal-800 pb-1">
                  🌸 2. Adım: Ece ile karşılaştın. Şimdi onun adını sor:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleNameAsk("What's your name?")}
                    className="p-3 rounded-xl border-2 border-teal-300 hover:border-teal-600 bg-white shadow-sm text-left transition-all active:scale-[0.98] cursor-pointer group"
                  >
                    <p className="text-base font-bold text-[var(--seljuk-navy)] group-hover:text-teal-700">
                      "What's your name?"
                    </p>
                    <p className="text-[11px] text-gray-500">Senin adın ne?</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNameAsk('How old are you?')}
                    className="p-3 rounded-xl border-2 border-gray-200 hover:border-rose-400 bg-white shadow-sm text-left transition-all active:scale-[0.98] cursor-pointer group"
                  >
                    <p className="text-base font-bold text-gray-700 group-hover:text-rose-700">
                      "How old are you?"
                    </p>
                    <p className="text-[11px] text-gray-500">Kaç yaşındasın? (Henüz adını sormadık)</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. ETKİLEŞİM - B: ECE CEVAP VERİR VE SEN KENDİNİ TANITIRSIN */}
          {currentStep === 'step2_name_introduce' && (
            <div className="space-y-2 animate-in fade-in duration-300">
              {/* Ece'nin Konuşma Balonu */}
              <div
                className={`p-3 rounded-xl border-2 transition-all ${
                  isSpeaking && currentSpokenText === 'My name is Ece.'
                    ? 'border-teal-500 ring-4 ring-teal-500/20 bg-teal-50/50'
                    : 'border-gray-200 bg-gray-50/80'
                }`}
              >
                <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-gray-200">
                  <span className="text-xs font-bold text-teal-800">
                    🌸 Ece cevap verdi:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => playSpeech('My name is Ece.', 'normal')}
                      className="px-2.5 py-1 rounded-md text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white inline-flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                      aria-label="Ece'nin cevabını dinle"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isSpeaking && activeSpeechSpeed === 'normal' ? 'Dinleniyor...' : 'Dinle'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => playSpeech('My name is Ece.', 'slow')}
                      className="px-2 py-1 rounded-md text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 inline-flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                      aria-label="Ece'nin cevabını yavaş dinle"
                    >
                      <span>🐢</span>
                      <span>{isSpeaking && activeSpeechSpeed === 'slow' ? 'Yavaş...' : 'Yavaş Dinle'}</span>
                    </button>
                  </div>
                </div>

                <div className="py-2">
                  <p className="text-2xl sm:text-3xl font-extrabold text-[var(--seljuk-navy)] font-serif">
                    "My name is Ece."
                  </p>
                  <p className="text-xs text-gray-500 italic mt-0.5">Türkçe anlamı: Benim adım Ece.</p>
                </div>
              </div>

              {/* Öğrenci Kendini Tanıtır */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-700">Şimdi sen de kendi adını söyle:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleNameIntroduce('My name is Deniz.')}
                    className="p-3 rounded-xl border-2 border-teal-200 hover:border-teal-500 bg-white hover:bg-teal-50/50 shadow-sm text-left transition-all active:scale-[0.98] cursor-pointer group"
                  >
                    <p className="text-base font-bold text-[var(--seljuk-navy)] group-hover:text-teal-700">
                      "My name is Deniz."
                    </p>
                    <p className="text-[11px] text-gray-500">Benim adım Deniz. (Kâşif kimliğin)</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNameIntroduce('My name is Ali.')}
                    className="p-3 rounded-xl border-2 border-gray-200 hover:border-rose-400 bg-white shadow-sm text-left transition-all active:scale-[0.98] cursor-pointer group"
                  >
                    <p className="text-base font-bold text-gray-700 group-hover:text-rose-700">
                      "My name is Ali."
                    </p>
                    <p className="text-[11px] text-gray-500">Benim adım Ali. (Ali kapıdaki arkadaşımızdı)</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. ETKİLEŞİM - A: YAŞ SORMA (CAN) */}
          {currentStep === 'step3_age_ask' && (
            <div className="space-y-2 animate-in fade-in duration-300">
              <div className="p-3 rounded-xl border-2 border-indigo-200 bg-indigo-50/40">
                <p className="text-xs font-bold text-indigo-800 pb-1">
                  🎂 3. Adım: Can'ın yanındasın. Şimdi onun yaşını sor:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleAgeAsk('How old are you?')}
                    className="p-3 rounded-xl border-2 border-indigo-300 hover:border-indigo-600 bg-white shadow-sm text-left transition-all active:scale-[0.98] cursor-pointer group"
                  >
                    <p className="text-base font-bold text-[var(--seljuk-navy)] group-hover:text-indigo-700">
                      "How old are you?"
                    </p>
                    <p className="text-[11px] text-gray-500">Kaç yaşındasın?</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAgeAsk("What's your name?")}
                    className="p-3 rounded-xl border-2 border-gray-200 hover:border-rose-400 bg-white shadow-sm text-left transition-all active:scale-[0.98] cursor-pointer group"
                  >
                    <p className="text-base font-bold text-gray-700 group-hover:text-rose-700">
                      "What's your name?"
                    </p>
                    <p className="text-[11px] text-gray-500">Senin adın ne? (Adını zaten biliyoruz)</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. ETKİLEŞİM - B: CAN YAŞINI SÖYLER VE ÖĞRENCİ SAHNEDE 9 SAYISINI BELİRLER */}
          {currentStep === 'step3_age_number' && (
            <div className="space-y-2 animate-in fade-in duration-300">
              {/* Can'ın Konuşma Balonu */}
              <div
                className={`p-3 rounded-xl border-2 transition-all ${
                  isSpeaking && currentSpokenText === "I'm nine."
                    ? 'border-indigo-500 ring-4 ring-indigo-500/20 bg-indigo-50/50'
                    : 'border-gray-200 bg-gray-50/80'
                }`}
              >
                <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-gray-200">
                  <span className="text-xs font-bold text-indigo-800">
                    🎂 Can yaşını söyledi:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => playSpeech("I'm nine.", 'normal')}
                      className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white inline-flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                      aria-label="Can'ın yaşını dinle"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isSpeaking && activeSpeechSpeed === 'normal' ? 'Dinleniyor...' : 'Dinle'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => playSpeech("I'm nine.", 'slow')}
                      className="px-2 py-1 rounded-md text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 inline-flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                      aria-label="Can'ın yaşını yavaş dinle"
                    >
                      <span>🐢</span>
                      <span>{isSpeaking && activeSpeechSpeed === 'slow' ? 'Yavaş...' : 'Yavaş Dinle'}</span>
                    </button>
                  </div>
                </div>

                <div className="py-2">
                  <p className="text-2xl sm:text-3xl font-extrabold text-[var(--seljuk-navy)] font-serif">
                    "I'm nine."
                  </p>
                  <p className="text-xs text-gray-500 italic mt-0.5">Türkçe anlamı: Dokuz yaşındayım.</p>
                </div>
              </div>

              {/* Bahçedeki Sayı Etkileşimi: 9 Sayısını Belirle */}
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-300/80 space-y-1.5">
                <p className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Can kaç yaşında olduğunu söyledi? Bahçedeki doğru sayıyı seç:</span>
                </p>
                <div className="grid grid-cols-4 gap-2 pt-0.5">
                  {[7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleSelectNumber(num)}
                      className={`min-h-[48px] py-2 px-3 rounded-xl border-2 font-mono text-xl sm:text-2xl font-black shadow-sm transition-all cursor-pointer active:scale-95 ${
                        selectedNumber === num
                          ? num === 9
                            ? 'bg-emerald-600 text-white border-emerald-700 ring-4 ring-emerald-300'
                            : 'bg-rose-100 text-rose-800 border-rose-400'
                          : 'bg-white hover:bg-amber-100 text-amber-900 border-amber-300 hover:border-amber-500'
                      }`}
                      aria-label={`Sayı ${num}`}
                    >
                      <span>{num}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. ETKİLEŞİM: VEDALAŞMA */}
          {currentStep === 'step4_farewell' && (
            <div className="space-y-2 animate-in fade-in duration-300">
              <div className="p-3 rounded-xl border-2 border-purple-200 bg-purple-50/40">
                <div className="flex items-center justify-between gap-2 pb-1 border-b border-purple-200">
                  <span className="text-xs font-bold text-purple-900 flex items-center gap-1">
                    <Hand className="w-4 h-4 text-purple-600" />
                    <span>4. Adım: Tüm arkadaşlarınla vedalaş ve sınıfa dön:</span>
                  </span>
                </div>

                <div className="py-2 text-center">
                  <p className="text-xs text-purple-800 font-medium">
                    Bahçedeki üç arkadaşın (Ali, Ece, Can) sana el sallıyor. Şimdi onlara İngilizce vedalaş:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleFarewell('Goodbye!')}
                    className="p-3.5 rounded-xl border-2 border-purple-300 hover:border-purple-600 bg-white hover:bg-purple-50 shadow-sm text-left transition-all active:scale-[0.98] cursor-pointer group"
                  >
                    <p className="text-lg font-bold text-[var(--seljuk-navy)] group-hover:text-purple-700">
                      "Goodbye!"
                    </p>
                    <p className="text-xs text-gray-500">Hoşça kalın! 👋</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFarewell('Hello!')}
                    className="p-3.5 rounded-xl border-2 border-gray-200 hover:border-rose-400 bg-white shadow-sm text-left transition-all active:scale-[0.98] cursor-pointer group"
                  >
                    <p className="text-lg font-bold text-gray-700 group-hover:text-rose-700">
                      "Hello!"
                    </p>
                    <p className="text-xs text-gray-500">Merhaba! (Ayrılırken söylenmez)</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAMAMLAMA EKRANI (Pedagojik Özet ve Sınıfa Dönüş) */}
          {currentStep === 'completed' && (
            <div className="space-y-3 py-2 text-center animate-in zoom-in-95 duration-300">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-0.5">
                <h2 className="text-lg sm:text-xl font-bold text-emerald-900 font-serif">
                  🎉 Harika! Tanışma Bahçesi Simülasyonunu Tamamladın!
                </h2>
                <p className="text-xs text-[var(--campus-ink-muted)]">
                  Dört öğrenme etkileşimini başarıyla tamamladın. Artık sınıfa dönüp karakterini 2. Öğren Masası'na yürütebilirsin.
                </p>
              </div>

              {/* Pedagojik Özet Kartı */}
              <div className="p-3 rounded-xl bg-white border border-emerald-200 text-left space-y-1.5 text-xs shadow-xs max-w-lg mx-auto">
                <p className="font-bold text-[var(--seljuk-navy)] flex items-center gap-1.5 pb-1 border-b border-gray-100">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Öğrendiğin 4 Temel İfade:</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-gray-800">
                  <div className="p-1.5 rounded-md bg-emerald-50/70 border border-emerald-100">
                    <span className="font-bold text-emerald-900">1. Selamlaşma:</span>
                    <p className="text-[11px] text-gray-600">"Hello!" / "Hi!"</p>
                  </div>
                  <div className="p-1.5 rounded-md bg-teal-50/70 border border-teal-100">
                    <span className="font-bold text-teal-900">2. Tanışma:</span>
                    <p className="text-[11px] text-gray-600">"What's your name?" — "My name is Ece." / "Nice to meet you!"</p>
                  </div>
                  <div className="p-1.5 rounded-md bg-indigo-50/70 border border-indigo-100">
                    <span className="font-bold text-indigo-900">3. Yaş Sorma:</span>
                    <p className="text-[11px] text-gray-600">"How old are you?" — "I'm nine." (9)</p>
                  </div>
                  <div className="p-1.5 rounded-md bg-purple-50/70 border border-purple-100">
                    <span className="font-bold text-purple-900">4. Vedalaşma:</span>
                    <p className="text-[11px] text-gray-600">"Goodbye!" 👋</p>
                  </div>
                </div>
              </div>

              {/* EYLEM DÜĞMELERİ: KESİNLİKLE "Öğren Masasına Git" düğmesi YOK! Öğrenci sınıfa döner ve kendisi yürür. */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={onExitToClassroom}
                  className="min-h-[44px] px-6 py-2 rounded-xl bg-[var(--seljuk-navy)] hover:bg-[#1a3848] text-[#fef08a] font-bold text-sm inline-flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
                  aria-label="Masadan kalk ve sınıfa dön"
                >
                  <ArrowLeft className="w-4 h-4 text-[#fef08a]" />
                  <span>Masadan Kalk / Sınıfa Dön</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetSimulation}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Bahçeyi Tekrar Canlandır</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
