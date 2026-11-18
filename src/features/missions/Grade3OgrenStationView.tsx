import { useState, useEffect, useCallback, useId } from 'react';
import {
  Volume2,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  ArrowLeft,
  Headphones,
  HelpCircle,
  Play,
  Check,
} from 'lucide-react';
import { useOptionalCampus } from '@/src/app/CampusProviders';
import type { MissionProgress, MissionStageId } from '@/src/types/campus';
import {
  GREETINGS_DATA,
  type GreetingId,
  type GreetingItem,
} from './greetingsData';
import { GreetingIllustration } from './GreetingIllustration';

export interface Grade3OgrenStationViewProps {
  missionId?: string;
  onExitToClassroom: () => void;
  onAdvanceToNextTable?: (stage: MissionStageId) => void;
}

// Etkinlik B için 4 turluk ikili seçenek listesi (Hedef vs Çeldirici)
interface DistinguishRound {
  targetId: GreetingId;
  distractorId: GreetingId;
  options: GreetingId[];
}

const DISTINGUISH_ROUNDS: DistinguishRound[] = [
  {
    targetId: 'good_morning',
    distractorId: 'good_night',
    options: ['good_morning', 'good_night'],
  },
  {
    targetId: 'hello',
    distractorId: 'goodbye',
    options: ['hello', 'goodbye'],
  },
  {
    targetId: 'good_night',
    distractorId: 'good_morning',
    options: ['good_morning', 'good_night'],
  },
  {
    targetId: 'goodbye',
    distractorId: 'hello',
    options: ['goodbye', 'hello'],
  },
];

export function Grade3OgrenStationView({
  missionId = 'kapilarin-anlattigi-hikaye',
  onExitToClassroom,
}: Grade3OgrenStationViewProps) {
  const campus = useOptionalCampus();
  const titleId = useId();

  // Etkinlik Akışı: 'activityA' (Dinle ve Bul) -> 'transition' -> 'activityB' (Sesleri Ayırt Et) -> 'completed'
  const [activeStep, setActiveStep] = useState<'activityA' | 'transition' | 'activityB' | 'completed'>('activityA');

  // ETKİNLİK A DURUMU: Dinle ve Bul (4 tur)
  const [roundA, setRoundA] = useState<number>(0);
  const [feedbackA, setFeedbackA] = useState<{ text: string; isError: boolean } | null>(null);
  const [selectedVisualA, setSelectedVisualA] = useState<GreetingId | null>(null);
  const [isAnswerLockedA, setIsAnswerLockedA] = useState(false);

  // ETKİNLİK B DURUMU: Sesleri Ayırt Et (4 tur)
  const [roundB, setRoundB] = useState<number>(0);
  const [feedbackB, setFeedbackB] = useState<{ text: string; isError: boolean } | null>(null);
  const [selectedOptionB, setSelectedOptionB] = useState<GreetingId | null>(null);
  const [isAnswerLockedB, setIsAnswerLockedB] = useState(false);

  // Seslendirme durumu
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeed, setActiveSpeed] = useState<'normal' | 'slow' | null>(null);

  // Sayfa kapandığında sesi durdur
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /**
   * Web Speech API ile doğal İngilizce telaffuz
   */
  const playSpeech = useCallback((text: string, speed: 'normal' | 'slow' = 'normal') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    setActiveSpeed(speed);
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
      setActiveSpeed(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setActiveSpeed(null);
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  }, []);

  // Hedef öğe (Etkinlik A)
  const currentTargetA: GreetingItem = GREETINGS_DATA[roundA] ?? GREETINGS_DATA[0];

  // Hedef öğe (Etkinlik B)
  const currentRoundB = DISTINGUISH_ROUNDS[roundB] ?? DISTINGUISH_ROUNDS[0];
  const currentTargetB: GreetingItem =
    GREETINGS_DATA.find((g) => g.id === currentRoundB.targetId) ?? GREETINGS_DATA[0];

  // Tur değiştiğinde otomatik seslendir (Etkinlik A)
  useEffect(() => {
    if (activeStep === 'activityA') {
      const timer = setTimeout(() => {
        playSpeech(currentTargetA.english, 'normal');
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [activeStep, roundA, currentTargetA.english, playSpeech]);

  // Tur değiştiğinde otomatik seslendir (Etkinlik B)
  useEffect(() => {
    if (activeStep === 'activityB') {
      const timer = setTimeout(() => {
        playSpeech(currentTargetB.english, 'normal');
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [activeStep, roundB, currentTargetB.english, playSpeech]);

  /**
   * ETKİNLİK A: Görsel seçildiğinde kontrol et
   */
  const handleSelectVisualA = (id: GreetingId) => {
    if (isAnswerLockedA) return;
    setSelectedVisualA(id);

    if (id === currentTargetA.id) {
      // Doğru görsel!
      setIsAnswerLockedA(true);
      setFeedbackA({
        text: `Harika! "${currentTargetA.english}" görselini doğru buldun! 🎉`,
        isError: false,
      });

      playSpeech(currentTargetA.english, 'normal');

      setTimeout(() => {
        if (roundA < GREETINGS_DATA.length - 1) {
          setRoundA((prev) => prev + 1);
          setSelectedVisualA(null);
          setFeedbackA(null);
          setIsAnswerLockedA(false);
        } else {
          // Etkinlik A bitti, ara geçişe geç
          setActiveStep('transition');
          setFeedbackA(null);
          setIsAnswerLockedA(false);
        }
      }, 1100);
    } else {
      // Yanlış görsel: Ceza vermeden nazik ipucu ver ve tekrar denemesini sağla
      setFeedbackA({
        text: `Tekrar dene! İpucu: ${currentTargetA.hint}`,
        isError: true,
      });
      // Tekrar dinlet
      playSpeech(currentTargetA.english, 'slow');
    }
  };

  /**
   * ETKİNLİK B: Yazılı ifade seçildiğinde kontrol et
   */
  const handleSelectOptionB = (id: GreetingId) => {
    if (isAnswerLockedB) return;
    setSelectedOptionB(id);

    if (id === currentTargetB.id) {
      // Doğru ifade!
      setIsAnswerLockedB(true);
      setFeedbackB({
        text: `Tebrikler! Doğru ifade: "${currentTargetB.english}" (${currentTargetB.turkish}) 🌟`,
        isError: false,
      });

      playSpeech(currentTargetB.english, 'normal');

      setTimeout(() => {
        if (roundB < DISTINGUISH_ROUNDS.length - 1) {
          setRoundB((prev) => prev + 1);
          setSelectedOptionB(null);
          setFeedbackB(null);
          setIsAnswerLockedB(false);
        } else {
          // ETKİNLİK B BİTTİ — ÖĞREN AŞAMASINI KAYDET
          if (campus) {
            const existing = campus.getMissionProgress(missionId, 3);
            const prev = existing?.completedStages ?? [];
            const completedStages: MissionStageId[] = prev.includes('ogren')
              ? prev
              : [...prev, 'ogren'];

            const nextProgress: MissionProgress = {
              missionId,
              missionVersion: existing?.missionVersion ?? '1.0.0',
              grade: 3,
              currentStage: 'uret',
              completedStages,
              selections: existing?.selections ?? {
                selectedDoorIds: ['greetings-table'],
                inspectedCampusGate: true,
                observationNotes: {},
                matchedVocabularyIds: ['vocab-hello', 'vocab-morning', 'vocab-goodbye', 'vocab-night'],
                matchedExampleSentence: true,
                doorName: 'Selamlaşma Masası',
                writtenText: 'Hello! Good morning! Goodbye! Good night!',
                usedEnglishWords: ['Hello', 'Good morning', 'Goodbye', 'Good night'],
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

          setActiveStep('completed');
          setFeedbackB(null);
          setIsAnswerLockedB(false);
        }
      }, 1100);
    } else {
      // Yanlış seçenek: Doğru ifadeyi sesli ve görsel olarak göster, tekrar denet
      setFeedbackB({
        text: `Farklı bir ifade seçtin. Hedef ifadeyi tekrar dinle ve eşleştir: "${currentTargetB.english}"`,
        isError: true,
      });
      playSpeech(currentTargetB.english, 'slow');
    }
  };

  /**
   * Baştan Başla / Tekrar Oyna
   */
  const handleRestart = () => {
    setActiveStep('activityA');
    setRoundA(0);
    setSelectedVisualA(null);
    setFeedbackA(null);
    setIsAnswerLockedA(false);

    setRoundB(0);
    setSelectedOptionB(null);
    setFeedbackB(null);
    setIsAnswerLockedB(false);
  };

  return (
    <div className="w-full h-full flex flex-col bg-linear-to-b from-[#fefce8] via-[#fef9c3] to-[#fef08a] p-3 sm:p-6 overflow-y-auto">
      {/* 1. Üst Süreç ve İstasyon Göstergesi (Öğren Masası - Sarı / Altın Teması) */}
      <div className="max-w-4xl mx-auto w-full mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border-2 border-amber-300 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-inner border border-amber-400">
              <Headphones className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 font-serif">
                  2. ÖĞREN MASASI
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold border border-amber-300">
                  3. Sınıf İngilizce
                </span>
              </div>
              <h1 id={titleId} className="text-sm sm:text-base font-extrabold text-[#78350f]">
                {activeStep === 'activityA' && 'Etkinlik A — Dinle ve Bul'}
                {activeStep === 'transition' && 'Etkinlik A Tamamlandı!'}
                {activeStep === 'activityB' && 'Etkinlik B — Sesleri Ayırt Et'}
                {activeStep === 'completed' && 'Tebrikler! Öğren Masası Görevi Tamamlandı'}
              </h1>
            </div>
          </div>

          {/* İlerleme Adım Rozeti */}
          <div className="flex items-center gap-2">
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                activeStep === 'activityA'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}
            >
              {activeStep === 'activityA' ? `Dinle ve Bul (${roundA + 1}/4)` : '1. Etkinlik ✓'}
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                activeStep === 'activityB'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : activeStep === 'completed'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-700'
              }`}
            >
              {activeStep === 'activityB'
                ? `Sesleri Ayırt Et (${roundB + 1}/4)`
                : activeStep === 'completed'
                  ? '2. Etkinlik ✓'
                  : '2. Etkinlik'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. ETKİNLİK A: DİNLE VE BUL */}
      {activeStep === 'activityA' && (
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col gap-4 animate-in fade-in duration-300">
          {/* Dinleme Paneli / Tablet Kutusu */}
          <div className="bg-white/95 rounded-2xl p-4 sm:p-5 border-2 border-amber-300 shadow-md text-center flex flex-col items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
              <Headphones className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
              <span>İngilizce ifadeyi dinle, duyduğun ifadeye uygun görseli seç!</span>
            </div>

            {/* Ses Çalma Kontrolleri */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
              <button
                type="button"
                onClick={() => playSpeech(currentTargetA.english, 'normal')}
                className={`min-h-[48px] px-5 py-2.5 rounded-xl font-bold text-sm inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
                  activeSpeed === 'normal' && isSpeaking
                    ? 'bg-amber-600 text-white ring-4 ring-amber-300 scale-105'
                    : 'bg-amber-500 hover:bg-amber-600 text-white active:scale-95'
                }`}
                aria-label={`"${currentTargetA.english}" ifadesini normal hızda dinle`}
              >
                <Volume2 className="w-5 h-5 text-white" aria-hidden="true" />
                <span>Dinle</span>
              </button>

              <button
                type="button"
                onClick={() => playSpeech(currentTargetA.english, 'slow')}
                className={`min-h-[48px] px-4 py-2.5 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                  activeSpeed === 'slow' && isSpeaking
                    ? 'bg-amber-200 text-amber-900 ring-4 ring-amber-300 scale-105'
                    : 'bg-amber-100 hover:bg-amber-200 text-amber-900 active:scale-95'
                }`}
                aria-label={`"${currentTargetA.english}" ifadesini yavaş hızda dinle`}
              >
                <span>🐢</span>
                <span>Yavaş Dinle</span>
              </button>
            </div>

            {/* Geri Bildirim veya İpucu Mesajı */}
            {feedbackA && (
              <div
                className={`w-full max-w-md mx-auto p-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border animate-in zoom-in-95 duration-200 ${
                  feedbackA.isError
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                }`}
                role="status"
              >
                {feedbackA.isError ? (
                  <HelpCircle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                )}
                <span>{feedbackA.text}</span>
              </div>
            )}
          </div>

          {/* Dört Büyük Görsel Kart (Seçenekler) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 flex-1">
            {GREETINGS_DATA.map((item) => {
              const isSelected = selectedVisualA === item.id;
              const isCorrectTarget = isAnswerLockedA && item.id === currentTargetA.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectVisualA(item.id)}
                  disabled={isAnswerLockedA}
                  className={`relative p-3 rounded-2xl border-3 flex flex-col items-center justify-between text-left transition-all cursor-pointer shadow-sm hover:shadow-md min-h-[190px] sm:min-h-[220px] ${
                    isCorrectTarget
                      ? 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-300 scale-[1.02]'
                      : isSelected && feedbackA?.isError
                        ? 'border-rose-400 bg-rose-50'
                        : isSelected
                          ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-300'
                          : 'border-amber-200 bg-white hover:border-amber-400 hover:bg-amber-50/50'
                  }`}
                  aria-label={`${item.visualTitle} görselini seç`}
                >
                  {/* Başarı Onay İkonu */}
                  {isCorrectTarget && (
                    <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md animate-bounce">
                      <Check className="w-4 h-4" aria-hidden="true" />
                    </div>
                  )}

                  {/* SVG Görseli */}
                  <div className="w-full flex-1 max-h-[130px] sm:max-h-[150px] flex items-center justify-center overflow-hidden rounded-xl bg-amber-50/40 p-1">
                    <GreetingIllustration id={item.id} />
                  </div>

                  {/* Görsel Başlığı */}
                  <div className="w-full mt-2 pt-2 border-t border-amber-100 text-center">
                    <span className="text-xs sm:text-sm font-bold text-amber-950 block">
                      {item.visualTitle}
                    </span>
                    <span className="text-[10px] text-amber-800 line-clamp-1 block">
                      {item.visualDetail}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ARA GEÇİŞ EKRANI: Etkinlik A Tamamlandı -> Etkinlik B'ye Başla */}
      {activeStep === 'transition' && (
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col items-center justify-center text-center p-6 bg-white/95 rounded-3xl border-3 border-amber-400 shadow-xl animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg border-2 border-amber-300 mb-4 animate-bounce">
            <CheckCircle2 className="w-9 h-9" aria-hidden="true" />
          </div>
          <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
            1. Etkinlik Tamamlandı
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-amber-950 mt-1 mb-2 font-serif">
            Harika Başardın! 🎉
          </h2>
          <p className="text-xs sm:text-sm text-amber-900 mb-6">
            Dört görseli de duyduğun seslerle başarıyla eşleştirdin. Şimdi duyduğun sesleri iki yazılı ifade arasından ayırt etme zamanı!
          </p>

          <button
            type="button"
            onClick={() => {
              setActiveStep('activityB');
              setRoundB(0);
              setSelectedOptionB(null);
              setFeedbackB(null);
            }}
            className="w-full min-h-[48px] px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <span>2. Etkinliğe Başla (Sesleri Ayırt Et)</span>
            <Play className="w-4 h-4 fill-white" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* 3. ETKİNLİK B: SESLERİ AYIRT ET */}
      {activeStep === 'activityB' && (
        <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col gap-4 animate-in fade-in duration-300">
          {/* Dinleme Paneli */}
          <div className="bg-white/95 rounded-2xl p-5 sm:p-6 border-2 border-amber-300 shadow-md text-center flex flex-col items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
              <Headphones className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
              <span>Sesi dinle, duyduğun İngilizce ifadeyi iki seçenek arasından seç!</span>
            </div>

            {/* Dinleme Düğmeleri */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
              <button
                type="button"
                onClick={() => playSpeech(currentTargetB.english, 'normal')}
                className={`min-h-[48px] px-5 py-2.5 rounded-xl font-bold text-sm inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
                  activeSpeed === 'normal' && isSpeaking
                    ? 'bg-amber-600 text-white ring-4 ring-amber-300 scale-105'
                    : 'bg-amber-500 hover:bg-amber-600 text-white active:scale-95'
                }`}
                aria-label={`"${currentTargetB.english}" ifadesini normal hızda dinle`}
              >
                <Volume2 className="w-5 h-5 text-white" aria-hidden="true" />
                <span>Dinle</span>
              </button>

              <button
                type="button"
                onClick={() => playSpeech(currentTargetB.english, 'slow')}
                className={`min-h-[48px] px-4 py-2.5 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                  activeSpeed === 'slow' && isSpeaking
                    ? 'bg-amber-200 text-amber-900 ring-4 ring-amber-300 scale-105'
                    : 'bg-amber-100 hover:bg-amber-200 text-amber-900 active:scale-95'
                }`}
                aria-label={`"${currentTargetB.english}" ifadesini yavaş hızda dinle`}
              >
                <span>🐢</span>
                <span>Yavaş Dinle</span>
              </button>
            </div>

            {/* İpucu ve Geri Bildirim */}
            {feedbackB && (
              <div
                className={`w-full max-w-md mx-auto p-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border animate-in zoom-in-95 duration-200 ${
                  feedbackB.isError
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                }`}
                role="status"
              >
                {feedbackB.isError ? (
                  <HelpCircle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                )}
                <span>{feedbackB.text}</span>
              </div>
            )}
          </div>

          {/* İki Büyük Yazılı Seçenek Kartı */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 items-center">
            {currentRoundB.options.map((optionId) => {
              const optionItem = GREETINGS_DATA.find((g) => g.id === optionId);
              if (!optionItem) return null;

              const isSelected = selectedOptionB === optionId;
              const isCorrectTarget = isAnswerLockedB && optionId === currentTargetB.id;

              return (
                <button
                  key={optionId}
                  type="button"
                  onClick={() => handleSelectOptionB(optionId)}
                  disabled={isAnswerLockedB}
                  className={`w-full min-h-[120px] sm:min-h-[140px] p-5 rounded-2xl border-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer shadow-md hover:shadow-lg ${
                    isCorrectTarget
                      ? 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-300 scale-105'
                      : isSelected && feedbackB?.isError
                        ? 'border-rose-400 bg-rose-50'
                        : isSelected
                          ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-300'
                          : 'border-amber-300 bg-white hover:border-amber-500 hover:bg-amber-50/50'
                  }`}
                  aria-label={`"${optionItem.english}" ifadesini seç`}
                >
                  <span className="text-xl sm:text-2xl font-black text-amber-950 font-serif tracking-wide block mb-1">
                    {optionItem.english}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-amber-700 block">
                    {optionItem.turkish}
                  </span>

                  {isCorrectTarget && (
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      <Check className="w-3.5 h-3.5" aria-hidden="true" /> Doğru Seçenek
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. TAMAMLANDI EKRANI (Öğren Masası Başarısı) */}
      {activeStep === 'completed' && (
        <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col items-center justify-center text-center p-6 bg-white/95 rounded-3xl border-3 border-amber-400 shadow-xl animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg border-2 border-amber-300 mb-3 animate-bounce">
            <Sparkles className="w-9 h-9" aria-hidden="true" />
          </div>

          <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
            2. MASA BAŞARIYLA TAMAMLANDI
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-amber-950 mt-1 mb-2 font-serif">
            Tebrikler! Öğren Masası Görevini Tamamladın! 🏆
          </h2>
          <p className="text-xs sm:text-sm text-amber-900 max-w-lg mb-6">
            Dört selamlaşma ifadesini dinleyerek tanıdın, görsellerle eşleştirdin ve sesleri başarıyla ayırt ettin. İlerlemen kaydedildi!
          </p>

          {/* Dört Temel İfade Özeti */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full mb-6 text-left">
            {GREETINGS_DATA.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 flex flex-col items-center text-center"
              >
                <div className="w-12 h-10 mb-1 flex items-center justify-center">
                  <GreetingIllustration id={item.id} />
                </div>
                <span className="text-xs font-bold text-amber-950 font-serif">{item.english}</span>
                <span className="text-[10px] text-amber-800">{item.turkish}</span>
              </div>
            ))}
          </div>

          {/* Aksiyon Butonları (YALNIZCA Masadan Kalk / Sınıfa Dön ve Tekrar Oyna) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
            <button
              type="button"
              onClick={onExitToClassroom}
              className="w-full min-h-[48px] px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
              aria-label="Masadan kalk ve sınıfa dön"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Masadan Kalk / Sınıfa Dön</span>
            </button>

            <button
              type="button"
              onClick={handleRestart}
              className="w-full sm:w-auto min-h-[48px] px-4 py-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs inline-flex items-center justify-center gap-1.5 border border-amber-300 transition-colors cursor-pointer"
              aria-label="Öğren masası etkinliğini tekrar oyna"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-800" aria-hidden="true" />
              <span>Tekrar Oyna</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
