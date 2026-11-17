import { useState, useEffect, useCallback, useRef, useId } from 'react';
import {
  Volume2,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  ArrowLeft,
  PenTool,
  HelpCircle,
  Play,
  Check,
  Undo2,
} from 'lucide-react';
import { useOptionalCampus } from '@/src/app/CampusProviders';
import type { MissionProgress, MissionStageId } from '@/src/types/campus';
import {
  GREETINGS_DATA,
  type GreetingId,
} from './greetingsData';
import { GreetingIllustration } from './GreetingIllustration';

export interface Grade3UretStationViewProps {
  missionId?: string;
  onExitToClassroom: () => void;
  onAdvanceToNextTable?: (stage: MissionStageId) => void;
}

// Etkinlik A: Kelimeleri Birleştir (Cümlemi Oluştur) Görev Tanımı
interface SentenceBuildTask {
  id: GreetingId;
  visualTitle: string;
  availableCards: string[];
  expectedWords: string[];
  finalSentence: string;
  hint: string;
}

const BUILD_TASKS: SentenceBuildTask[] = [
  // Görev 1: Sabah güneşi ve uyanan çocuk -> Good morning!
  {
    id: 'good_morning',
    visualTitle: 'Sabah Güneşi ve Uyanan Çocuk',
    availableCards: ['morning', 'Good'],
    expectedWords: ['Good', 'morning'],
    finalSentence: 'Good morning!',
    hint: 'Sabah uyanınca güne başlarken "Good" ile başlarız: "Good morning!"',
  },
  // Görev 2: Gece, ay ve uykuya hazırlanan çocuk -> Good night!
  {
    id: 'good_night',
    visualTitle: 'Gece, Ay ve Uyuyan Çocuk',
    availableCards: ['night', 'Good'],
    expectedWords: ['Good', 'night'],
    finalSentence: 'Good night!',
    hint: 'Gece uyumadan önce iyi uykular dilemek için "Good" ile başlarız: "Good night!"',
  },
  // Görev 3: Karşılaşan ve el sallayan çocuk -> Hello!
  {
    id: 'hello',
    visualTitle: 'Karşılaşan ve Selam Veren Çocuk',
    availableCards: ['Goodbye!', 'Hello!'],
    expectedWords: ['Hello!'],
    finalSentence: 'Hello!',
    hint: 'Arkadaşınla karşılaştığında ve selam verirken "Hello!" dersin.',
  },
  // Görev 4: Vedalaşan ve ayrılan çocuk -> Goodbye!
  {
    id: 'goodbye',
    visualTitle: 'Ayrılan ve Vedalaşan Çocuk',
    availableCards: ['Hello!', 'Goodbye!'],
    expectedWords: ['Goodbye!'],
    finalSentence: 'Goodbye!',
    hint: 'Okuldan çıkarken ve vedalaşırken "Goodbye!" dersin.',
  },
];

// Etkinlik B: Görsele Uygun İfadeyi Seç Görev Tanımı (En fazla 2 seçenek)
interface VisualChoiceRound {
  id: GreetingId;
  visualTitle: string;
  targetExpression: string;
  targetTurkish: string;
  options: { id: GreetingId; text: string; isCorrect: boolean }[];
  hint: string;
}

const VISUAL_CHOICE_ROUNDS: VisualChoiceRound[] = [
  {
    id: 'good_morning',
    visualTitle: 'Sabah Karşılaşması',
    targetExpression: 'Good morning!',
    targetTurkish: 'Günaydın!',
    options: [
      { id: 'good_morning', text: 'Good morning!', isCorrect: true },
      { id: 'good_night', text: 'Good night!', isCorrect: false },
    ],
    hint: 'Bu görsel sabah güneşini anlatıyor. Sabahları "Good morning!" deriz.',
  },
  {
    id: 'hello',
    visualTitle: 'Arkadaşla Karşılaşma',
    targetExpression: 'Hello!',
    targetTurkish: 'Merhaba!',
    options: [
      { id: 'hello', text: 'Hello!', isCorrect: true },
      { id: 'goodbye', text: 'Goodbye!', isCorrect: false },
    ],
    hint: 'Karşılaşınca neşeyle selam vermek için "Hello!" seçmelisin.',
  },
  {
    id: 'goodbye',
    visualTitle: 'Okul Çıkışında Vedalaşma',
    targetExpression: 'Goodbye!',
    targetTurkish: 'Hoşça kal!',
    options: [
      { id: 'hello', text: 'Hello!', isCorrect: false },
      { id: 'goodbye', text: 'Goodbye!', isCorrect: true },
    ],
    hint: 'Ayrılırken ve el sallarken veda etmek için "Goodbye!" seçmelisin.',
  },
  {
    id: 'good_night',
    visualTitle: 'Gece Yatmaya Hazırlanma',
    targetExpression: 'Good night!',
    targetTurkish: 'İyi geceler!',
    options: [
      { id: 'good_night', text: 'Good night!', isCorrect: true },
      { id: 'good_morning', text: 'Good morning!', isCorrect: false },
    ],
    hint: 'Gece yatarken ve uyku dilerken "Good night!" seçmelisin.',
  },
];

export function Grade3UretStationView({
  missionId = 'kapilarin-anlattigi-hikaye',
  onExitToClassroom,
}: Grade3UretStationViewProps) {
  const campus = useOptionalCampus();
  const titleId = useId();

  // Etkinlik Akışı: 'activityA' (Cümlemi Oluştur) -> 'transition' -> 'activityB' (Doğru Cümleyi Bul) -> 'completed'
  const [activeStep, setActiveStep] = useState<'activityA' | 'transition' | 'activityB' | 'completed'>('activityA');

  // ETKİNLİK A DURUMU: Cümlemi Oluştur (4 görev)
  const [taskIndexA, setTaskIndexA] = useState<number>(0);
  const [selectedWordIndicesA, setSelectedWordIndicesA] = useState<number[]>([]);
  const [feedbackA, setFeedbackA] = useState<{ text: string; isError: boolean } | null>(null);
  const [isTaskLockedA, setIsTaskLockedA] = useState(false);

  // ETKİNLİK B DURUMU: Doğru Cümleyi Bul (4 tur)
  const [roundIndexB, setRoundIndexB] = useState<number>(0);
  const [selectedOptionB, setSelectedOptionB] = useState<GreetingId | null>(null);
  const [feedbackB, setFeedbackB] = useState<{ text: string; isError: boolean } | null>(null);
  const [isRoundLockedB, setIsRoundLockedB] = useState(false);

  // Seslendirme durumu
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeed, setActiveSpeed] = useState<'normal' | 'slow' | null>(null);

  // Zamanlayıcı ve kilit referansları (çift tıklama ve güvenli temizleme için)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTaskLockedRef = useRef(false);
  const isRoundLockedRef = useRef(false);

  const clearPendingTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Sayfa kapandığında sesi ve bekleyen zamanlayıcıları durdur
  useEffect(() => {
    return () => {
      clearPendingTimer();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [clearPendingTimer]);

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

  // Aktif Görev (Etkinlik A)
  const currentTaskA = BUILD_TASKS[taskIndexA] ?? BUILD_TASKS[0];

  // Aktif Tur (Etkinlik B)
  const currentRoundB = VISUAL_CHOICE_ROUNDS[roundIndexB] ?? VISUAL_CHOICE_ROUNDS[0];

  /**
   * ETKİNLİK A: Seçilen Kelimeleri Değerlendir ve Kontrol Et
   */
  const checkSelectionA = useCallback((selection: number[]) => {
    const builtWords = selection.map((idx) => currentTaskA.availableCards[idx]);
    const isCorrect = builtWords.every((w, i) => w === currentTaskA.expectedWords[i]);

    if (isCorrect) {
      // Doğru Cümle Oluşturuldu!
      isTaskLockedRef.current = true;
      setIsTaskLockedA(true);
      clearPendingTimer();

      setFeedbackA({
        text: `Harika! "${currentTaskA.finalSentence}" doğru oluşturuldu! 🎉`,
        isError: false,
      });

      playSpeech(currentTaskA.finalSentence, 'normal');

      timerRef.current = setTimeout(() => {
        isTaskLockedRef.current = false;
        setIsTaskLockedA(false);
        setSelectedWordIndicesA([]);
        setFeedbackA(null);

        setTaskIndexA((prevIndex) => {
          const nextIndex = prevIndex + 1;
          if (nextIndex < BUILD_TASKS.length) {
            return nextIndex;
          } else {
            // Etkinlik A bitti, ara geçişe geç
            setActiveStep('transition');
            return prevIndex;
          }
        });
      }, 1200);
    } else {
      // Yanlış Sıralama: Kısa ve net uyarı + hangi kelimeyle başlanması gerektiği ipucu
      setFeedbackA({
        text: `Kelimelerin sırası karıştı. Bir daha deneyelim! İpucu: ${currentTaskA.hint}`,
        isError: true,
      });

      playSpeech(currentTaskA.finalSentence, 'slow');

      // Yanlış seçilmiş kelimeleri 1800ms sonra otomatik temizle (öğrenci takılmasın)
      clearPendingTimer();
      timerRef.current = setTimeout(() => {
        setSelectedWordIndicesA([]);
        setFeedbackA(null);
        isTaskLockedRef.current = false;
        setIsTaskLockedA(false);
      }, 1800);
    }
  }, [currentTaskA, clearPendingTimer, playSpeech]);

  /**
   * ETKİNLİK A: Kelime Kartına Tıklama
   */
  const handleSelectWordA = (cardIndex: number) => {
    // Doğru cevap onaylanmış ve sonraki göreve geçiş bekleniyorsa tıklamayı anında engelle
    if (isTaskLockedRef.current) return;

    // Eğer önceki deneme hatalıysa veya seçim sayısı zaten beklenen sayıya ulaşmışsa,
    // yeni karta tıklandığında eski hatalı seçimi sıfırlayıp yeni tıklamayla başlat
    if (feedbackA?.isError || selectedWordIndicesA.length >= currentTaskA.expectedWords.length) {
      clearPendingTimer();
      setFeedbackA(null);
      isTaskLockedRef.current = false;
      setIsTaskLockedA(false);

      const newSelection = [cardIndex];
      setSelectedWordIndicesA(newSelection);

      // Eğer görev tek kelimelikse (Hello! veya Goodbye!) hemen kontrol et
      if (currentTaskA.expectedWords.length === 1) {
        checkSelectionA(newSelection);
      }
      return;
    }

    // Eğer zaten seçilmişse seçimden kaldır (Geri Al / Toggle)
    if (selectedWordIndicesA.includes(cardIndex)) {
      clearPendingTimer();
      setSelectedWordIndicesA((prev) => prev.filter((idx) => idx !== cardIndex));
      setFeedbackA(null);
      return;
    }

    const nextSelection = [...selectedWordIndicesA, cardIndex];
    setSelectedWordIndicesA(nextSelection);
    setFeedbackA(null);

    // Eğer beklenen kelime sayısına ulaşıldıysa kontrol et!
    if (nextSelection.length === currentTaskA.expectedWords.length) {
      checkSelectionA(nextSelection);
    }
  };

  /**
   * ETKİNLİK A: Seçimi Temizle / Yeniden Dene
   */
  const handleClearSelectionA = () => {
    // Doğru cevap geçiş sürecinde temizlemeye izin verme
    if (isTaskLockedRef.current) return;

    clearPendingTimer();
    setSelectedWordIndicesA([]);
    setFeedbackA(null);
    isTaskLockedRef.current = false;
    setIsTaskLockedA(false);
  };

  /**
   * ETKİNLİK B: Görsele Uygun İfadeyi Seç
   */
  const handleSelectOptionB = (option: { id: GreetingId; text: string; isCorrect: boolean }) => {
    if (isRoundLockedRef.current) return;
    setSelectedOptionB(option.id);

    if (option.isCorrect) {
      // Doğru Seçim!
      isRoundLockedRef.current = true;
      setIsRoundLockedB(true);
      clearPendingTimer();

      setFeedbackB({
        text: `Tebrikler! "${option.text}" doğru ifade! 🌟`,
        isError: false,
      });

      playSpeech(option.text, 'normal');

      timerRef.current = setTimeout(() => {
        setRoundIndexB((prevIndex) => {
          const nextIndex = prevIndex + 1;
          if (nextIndex < VISUAL_CHOICE_ROUNDS.length) {
            setSelectedOptionB(null);
            setFeedbackB(null);
            isRoundLockedRef.current = false;
            setIsRoundLockedB(false);
            return nextIndex;
          } else {
            // ETKİNLİK B BİTTİ — ÜRET AŞAMASINI KAYDET
            if (campus) {
              const existing = campus.getMissionProgress(missionId, 3);
              const prev = existing?.completedStages ?? [];
              const completedStages: MissionStageId[] = prev.includes('uret')
                ? prev
                : [...prev, 'uret'];

              const nextProgress: MissionProgress = {
                missionId,
                missionVersion: existing?.missionVersion ?? '1.0.0',
                grade: 3,
                currentStage: 'paylas',
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
            setSelectedOptionB(null);
            setFeedbackB(null);
            isRoundLockedRef.current = false;
            setIsRoundLockedB(false);
            return prevIndex;
          }
        });
      }, 1200);
    } else {
      // Yanlış Seçim: Cezasız ipucu ver ve tekrar denet
      setFeedbackB({
        text: `Farklı bir ifade seçtin. İpucu: ${currentRoundB.hint}`,
        isError: true,
      });
      playSpeech(currentRoundB.targetExpression, 'slow');
    }
  };

  /**
   * Baştan Başla / Tekrar Oyna
   */
  const handleRestart = () => {
    clearPendingTimer();
    setActiveStep('activityA');
    setTaskIndexA(0);
    setSelectedWordIndicesA([]);
    setFeedbackA(null);
    isTaskLockedRef.current = false;
    setIsTaskLockedA(false);

    setRoundIndexB(0);
    setSelectedOptionB(null);
    setFeedbackB(null);
    isRoundLockedRef.current = false;
    setIsRoundLockedB(false);
  };

  return (
    <div className="w-full h-full flex flex-col bg-linear-to-b from-[#f0fdf4] via-[#dcfce7] to-[#bbf7d0] p-3 sm:p-6 overflow-y-auto">
      {/* 1. Üst Süreç ve İstasyon Göstergesi (Üret Masası - Yeşil / Zümrüt Teması) */}
      <div className="max-w-4xl mx-auto w-full mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border-2 border-emerald-300 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-inner border border-emerald-400">
              <PenTool className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 font-serif">
                  3. ÜRET MASASI
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300">
                  3. Sınıf İngilizce
                </span>
              </div>
              <h1 id={titleId} className="text-sm sm:text-base font-extrabold text-[#064e3b]">
                {activeStep === 'activityA' && 'Etkinlik A — Cümlemi Oluştur'}
                {activeStep === 'transition' && 'Etkinlik A Tamamlandı!'}
                {activeStep === 'activityB' && 'Etkinlik B — Doğru Cümleyi Bul'}
                {activeStep === 'completed' && 'Tebrikler! Üret Masası Görevi Tamamlandı'}
              </h1>
            </div>
          </div>

          {/* İlerleme Adım Rozeti */}
          <div className="flex items-center gap-2">
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                activeStep === 'activityA'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}
            >
              {activeStep === 'activityA' ? `Cümlemi Oluştur (${taskIndexA + 1}/4)` : '1. Etkinlik ✓'}
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                activeStep === 'activityB'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : activeStep === 'completed'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-emerald-100/60 text-emerald-700'
              }`}
            >
              {activeStep === 'activityB'
                ? `Doğru Cümleyi Bul (${roundIndexB + 1}/4)`
                : activeStep === 'completed'
                  ? '2. Etkinlik ✓'
                  : '2. Etkinlik'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. ETKİNLİK A: KELİMELERİ BİRLEŞTİR (CÜMLEMİ OLUŞTUR) */}
      {activeStep === 'activityA' && (
        <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col gap-4 animate-in fade-in duration-300">
          {/* Soru ve Hedef Görsel Alanı */}
          <div className="bg-white/95 rounded-2xl p-4 sm:p-5 border-2 border-emerald-300 shadow-md flex flex-col sm:flex-row items-center gap-4">
            {/* Görsel Kart */}
            <div className="w-full sm:w-48 h-36 sm:h-40 shrink-0 rounded-xl overflow-hidden bg-emerald-50/50 border border-emerald-200 p-2 flex items-center justify-center">
              <GreetingIllustration id={currentTaskA.id} />
            </div>

            {/* Yönerge ve Cümle Oluşturma Kutusu */}
            <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left gap-3 w-full">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-semibold">
                <PenTool className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
                <span>Görsele uygun kelimeleri seçerek ifadeyi oluştur:</span>
              </div>

              {/* Oluşturulan Cümle Göstergesi */}
              <div className="w-full min-h-[56px] px-4 py-2.5 rounded-xl bg-emerald-50/80 border-2 border-dashed border-emerald-300 flex items-center justify-center sm:justify-start flex-wrap gap-2">
                {selectedWordIndicesA.length === 0 ? (
                  <span className="text-xs text-emerald-600 font-medium italic">
                    Aşağıdaki kelime kartlarına dokun...
                  </span>
                ) : (
                  selectedWordIndicesA.map((cardIndex) => (
                    <span
                      key={cardIndex}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-sm shadow-xs animate-in zoom-in-95 duration-150"
                    >
                      {currentTaskA.availableCards[cardIndex]}
                    </span>
                  ))
                )}
                {/* Otomatik Ünlem Eki */}
                {selectedWordIndicesA.length === currentTaskA.expectedWords.length && (
                  <span className="text-lg font-black text-emerald-700">!</span>
                )}
              </div>

              {/* Ses Dinleme Butonları (Tamamlandığında veya istendiğinde) */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => playSpeech(currentTaskA.finalSentence, 'normal')}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeSpeed === 'normal' && isSpeaking
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-300 scale-105'
                      : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 active:scale-95'
                  }`}
                  aria-label={`"${currentTaskA.finalSentence}" ifadesini dinle`}
                >
                  <Volume2 className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                  <span>Dinle</span>
                </button>
                <button
                  type="button"
                  onClick={() => playSpeech(currentTaskA.finalSentence, 'slow')}
                  className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-all cursor-pointer ${
                    activeSpeed === 'slow' && isSpeaking
                      ? 'bg-emerald-200 text-emerald-950 ring-2 ring-emerald-300 scale-105'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 active:scale-95'
                  }`}
                  aria-label={`"${currentTaskA.finalSentence}" ifadesini yavaş dinle`}
                >
                  <span>🐢</span>
                  <span>Yavaş Dinle</span>
                </button>

                {(selectedWordIndicesA.length > 0 || feedbackA?.isError) && !isTaskLockedA && (
                  <button
                    type="button"
                    onClick={handleClearSelectionA}
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ml-auto ${
                      feedbackA?.isError
                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold shadow-xs'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                    }`}
                    aria-label="Kelimeleri temizle"
                  >
                    <Undo2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{feedbackA?.isError ? 'Yeniden Dene' : 'Geri Al'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Geri Bildirim veya İpucu */}
          {feedbackA && (
            <div
              className={`p-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border animate-in zoom-in-95 duration-200 ${
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

          {/* Sunulan Kelime Kartları (Büyük Seçim Butonları) */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-2">
            {currentTaskA.availableCards.map((cardText, index) => {
              const isSelected = selectedWordIndicesA.includes(index);

              return (
                <button
                  key={`${currentTaskA.id}-${index}`}
                  type="button"
                  onClick={() => handleSelectWordA(index)}
                  disabled={isTaskLockedA}
                  className={`min-h-[70px] sm:min-h-[85px] p-4 rounded-2xl border-3 font-serif font-black text-xl sm:text-2xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-600 text-white ring-4 ring-emerald-200 scale-102'
                      : 'border-emerald-300 bg-white text-emerald-950 hover:border-emerald-500 hover:bg-emerald-50/70 active:scale-98'
                  }`}
                  aria-label={`"${cardText}" kelimesini seç`}
                >
                  <span>{cardText}</span>
                  {isSelected && <Check className="w-5 h-5 text-white" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ARA GEÇİŞ EKRANI: Etkinlik A Tamamlandı -> Etkinlik B'ye Başla */}
      {activeStep === 'transition' && (
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col items-center justify-center text-center p-6 bg-white/95 rounded-3xl border-3 border-emerald-400 shadow-xl animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg border-2 border-emerald-300 mb-4 animate-bounce">
            <CheckCircle2 className="w-9 h-9" aria-hidden="true" />
          </div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
            1. Etkinlik Tamamlandı
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-emerald-950 mt-1 mb-2 font-serif">
            Cümlelerini Başarıyla Oluşturdun! ✏️
          </h2>
          <p className="text-xs sm:text-sm text-emerald-900 mb-6">
            Dört selamlaşma ifadesini kelime kartlarıyla eksiksiz birleştirdin. Şimdi görsellere en uygun ifadeyi seçme zamanı!
          </p>

          <button
            type="button"
            onClick={() => {
              setActiveStep('activityB');
              setRoundIndexB(0);
              setSelectedOptionB(null);
              setFeedbackB(null);
            }}
            className="w-full min-h-[48px] px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <span>2. Etkinliğe Başla (Doğru Cümleyi Bul)</span>
            <Play className="w-4 h-4 fill-white" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* 3. ETKİNLİK B: GÖRSELE UYGUN İFADEYİ SEÇ */}
      {activeStep === 'activityB' && (
        <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col gap-4 animate-in fade-in duration-300">
          {/* Görsel Kart ve Yönerge */}
          <div className="bg-white/95 rounded-2xl p-5 border-2 border-emerald-300 shadow-md flex flex-col items-center gap-3 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-semibold">
              <PenTool className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
              <span>Görseli incele, uygun İngilizce ifadeyi iki seçenek arasından seç:</span>
            </div>

            {/* Görsel */}
            <div className="w-48 h-36 rounded-xl overflow-hidden bg-emerald-50/50 border border-emerald-200 p-2 flex items-center justify-center">
              <GreetingIllustration id={currentRoundB.id} />
            </div>

            <span className="text-xs sm:text-sm font-bold text-emerald-950">
              {currentRoundB.visualTitle}
            </span>

            {/* Ses Dinleme Butonları */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => playSpeech(currentRoundB.targetExpression, 'normal')}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeSpeed === 'normal' && isSpeaking
                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-300 scale-105'
                    : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 active:scale-95'
                }`}
                aria-label={`"${currentRoundB.targetExpression}" ifadesini dinle`}
              >
                <Volume2 className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                <span>Dinle</span>
              </button>
              <button
                type="button"
                onClick={() => playSpeech(currentRoundB.targetExpression, 'slow')}
                className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-all cursor-pointer ${
                  activeSpeed === 'slow' && isSpeaking
                    ? 'bg-emerald-200 text-emerald-950 ring-2 ring-emerald-300 scale-105'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 active:scale-95'
                }`}
                aria-label={`"${currentRoundB.targetExpression}" ifadesini yavaş dinle`}
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

          {/* İki Seçenek Kartı */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 items-center">
            {currentRoundB.options.map((option) => {
              const isSelected = selectedOptionB === option.id;
              const isCorrectTarget = isRoundLockedB && option.isCorrect;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelectOptionB(option)}
                  disabled={isRoundLockedB}
                  className={`w-full min-h-[110px] sm:min-h-[130px] p-4 rounded-2xl border-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer shadow-md hover:shadow-lg ${
                    isCorrectTarget
                      ? 'border-emerald-600 bg-emerald-50 ring-4 ring-emerald-300 scale-105'
                      : isSelected && feedbackB?.isError
                        ? 'border-rose-400 bg-rose-50'
                        : isSelected
                          ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300'
                          : 'border-emerald-300 bg-white hover:border-emerald-500 hover:bg-emerald-50/50'
                  }`}
                  aria-label={`"${option.text}" ifadesini seç`}
                >
                  <span className="text-xl sm:text-2xl font-black text-emerald-950 font-serif tracking-wide block mb-1">
                    {option.text}
                  </span>

                  {isCorrectTarget && (
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      <Check className="w-3.5 h-3.5" aria-hidden="true" /> Doğru İfade
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. TAMAMLANDI EKRANI (Üret Masası Başarısı) */}
      {activeStep === 'completed' && (
        <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col items-center justify-center text-center p-6 bg-white/95 rounded-3xl border-3 border-emerald-400 shadow-xl animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg border-2 border-emerald-300 mb-3 animate-bounce">
            <Sparkles className="w-9 h-9" aria-hidden="true" />
          </div>

          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
            3. MASA BAŞARIYLA TAMAMLANDI
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-emerald-950 mt-1 mb-2 font-serif">
            Tebrikler! Üret Masası Görevini Tamamladın! 🏆
          </h2>
          <p className="text-xs sm:text-sm text-emerald-900 max-w-lg mb-6">
            Dört selamlaşma ifadesini kelimeleri birleştirerek başarıyla ürettin ve görsellerle eşleştirdin. İlerlemen kaydedildi!
          </p>

          {/* Dört Temel İfade Özeti */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full mb-6 text-left">
            {GREETINGS_DATA.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 flex flex-col items-center text-center"
              >
                <div className="w-12 h-10 mb-1 flex items-center justify-center">
                  <GreetingIllustration id={item.id} />
                </div>
                <span className="text-xs font-bold text-emerald-950 font-serif">{item.english}</span>
                <span className="text-[10px] text-emerald-800">{item.turkish}</span>
              </div>
            ))}
          </div>

          {/* Aksiyon Butonları (YALNIZCA Masadan Kalk / Sınıfa Dön ve Tekrar Oyna) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
            <button
              type="button"
              onClick={onExitToClassroom}
              className="w-full min-h-[48px] px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
              aria-label="Masadan kalk ve sınıfa dön"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Masadan Kalk / Sınıfa Dön</span>
            </button>

            <button
              type="button"
              onClick={handleRestart}
              className="w-full sm:w-auto min-h-[48px] px-4 py-3 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs inline-flex items-center justify-center gap-1.5 border border-emerald-300 transition-colors cursor-pointer"
              aria-label="Üret masası etkinliğini tekrar oyna"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-800" aria-hidden="true" />
              <span>Tekrar Oyna</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
