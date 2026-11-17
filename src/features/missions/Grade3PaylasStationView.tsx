import { useState, useEffect, useCallback, useId } from 'react';
import {
  Volume2,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  ArrowLeft,
  MessageCircle,
  HelpCircle,
  Play,
  Check,
  User,
  Users,
} from 'lucide-react';
import { useOptionalCampus } from '@/src/app/CampusProviders';
import type { MissionProgress, MissionStageId } from '@/src/types/campus';
import {
  GREETINGS_DATA,
  type GreetingId,
} from './greetingsData';
import { GreetingIllustration } from './GreetingIllustration';

export interface Grade3PaylasStationViewProps {
  missionId?: string;
  onExitToClassroom: () => void;
  onAdvanceToNextTable?: (stage: MissionStageId) => void;
}

// Etkinlik A: Arkadaşım Ne Söylüyor? (Konuşma Balonunu Tamamla)
interface ConversationReplyTask {
  id: GreetingId;
  situationTitle: string;
  situationDescription: string;
  partnerName: string;
  partnerPrompt: string; // Karakterin söylediği İngilizce
  partnerTurkish: string;
  options: { id: GreetingId; text: string; isCorrect: boolean }[];
  partnerReaction: string; // Doğru cevap sonrası karakter tepkisi
  hint: string;
}

const CONVERSATION_REPLY_TASKS: ConversationReplyTask[] = [
  // Durum 1: Sabah okulda karşılaşma
  {
    id: 'good_morning',
    situationTitle: 'Sabah Okulda Karşılaşma',
    situationDescription: 'Sabah okul bahçesinde arkadaşınla karşılaştın. Arkadaşın sana sesleniyor:',
    partnerName: 'Ali',
    partnerPrompt: 'Good morning!',
    partnerTurkish: 'Günaydın!',
    options: [
      { id: 'good_morning', text: 'Good morning!', isCorrect: true },
      { id: 'good_night', text: 'Good night!', isCorrect: false },
    ],
    partnerReaction: 'Ali gülümsüyor ve günaydın selamını alıyor! ☀️',
    hint: 'Arkadaşın sana "Good morning!" (Günaydın!) dediğinde sen de ona "Good morning!" diyerek karşılık verirsin.',
  },
  // Durum 2: Arkadaşla selamlaşma
  {
    id: 'hello',
    situationTitle: 'Oyun Alanında Selamlaşma',
    situationDescription: 'Bahçede oyun alanında arkadaşın neşeyle yanına geliyor ve sana sesleniyor:',
    partnerName: 'Zeynep',
    partnerPrompt: 'Hello!',
    partnerTurkish: 'Merhaba!',
    options: [
      { id: 'hello', text: 'Hello!', isCorrect: true },
      { id: 'goodbye', text: 'Goodbye!', isCorrect: false },
    ],
    partnerReaction: 'Zeynep neşeyle el sallıyor ve merhaba selamını alıyor! 👋',
    hint: 'Arkadaşın sana "Hello!" (Merhaba!) dediğinde sen de neşeyle "Hello!" diyerek karşılık verirsin.',
  },
  // Durum 3: Okuldan ayrılma
  {
    id: 'goodbye',
    situationTitle: 'Okul Çıkışında Vedalaşma',
    situationDescription: 'Dersler bitti, okul kapısından çıkarken arkadaşın evine doğru yöneliyor:',
    partnerName: 'Emir',
    partnerPrompt: 'Goodbye!',
    partnerTurkish: 'Hoşça kal!',
    options: [
      { id: 'goodbye', text: 'Goodbye!', isCorrect: true },
      { id: 'hello', text: 'Hello!', isCorrect: false },
    ],
    partnerReaction: 'Emir el sallayarak sana iyi günler diliyor! 🎒',
    hint: 'Arkadaşın sana "Goodbye!" (Hoşça kal!) diyerek veda ettiğinde sen de "Goodbye!" ile karşılık verirsin.',
  },
  // Durum 4: Gece vedalaşma
  {
    id: 'good_night',
    situationTitle: 'Gece Uyumaya Hazırlanma',
    situationDescription: 'Gece oldu, uyku saati geldi. Ailen yatağına gelirken sana sesleniyor:',
    partnerName: 'Annesi',
    partnerPrompt: 'Good night!',
    partnerTurkish: 'İyi geceler!',
    options: [
      { id: 'good_night', text: 'Good night!', isCorrect: true },
      { id: 'good_morning', text: 'Good morning!', isCorrect: false },
    ],
    partnerReaction: 'Gülümseyerek sana tatlı rüyalar diliyor! 🌙',
    hint: 'Gece uyumadan önce "Good night!" (İyi geceler!) dendiğinde sen de "Good night!" diyerek karşılık verirsin.',
  },
];

// Etkinlik B: Şimdi Sen Konuş! (Benim Sıram!)
interface InitiateConversationTask {
  id: GreetingId;
  situationTitle: string;
  situationDescription: string;
  targetPrompt: string; // Öğrencinin başlatacağı İngilizce ifade
  targetTurkish: string;
  options: { id: GreetingId; text: string; isCorrect: boolean }[];
  partnerReply: string; // Öğrenci konuştuktan sonra karakterin yanıtı
  partnerReplyTurkish: string;
  hint: string;
}

const INITIATE_CONVERSATION_TASKS: InitiateConversationTask[] = [
  // Tur 1: Sabah güneşi altında arkadaşına Good morning! der
  {
    id: 'good_morning',
    situationTitle: 'Sabah Konuşmayı Sen Başlat',
    situationDescription: 'Sabah güneşi altında arkadaşını gördün. Güne başlarken konuşmayı sen başlat!',
    targetPrompt: 'Good morning!',
    targetTurkish: 'Günaydın!',
    options: [
      { id: 'good_morning', text: 'Good morning!', isCorrect: true },
      { id: 'good_night', text: 'Good night!', isCorrect: false },
    ],
    partnerReply: 'Good morning! Have a nice day!',
    partnerReplyTurkish: 'Günaydın! İyi günler!',
    hint: 'Sabah güne başlarken arkadaşına ilk selamı vermek için "Good morning!" (Günaydın!) demelisin.',
  },
  // Tur 2: Bahçede gördüğü arkadaşına Hello! der
  {
    id: 'hello',
    situationTitle: 'Bahçede Arkadaşını Selamla',
    situationDescription: 'Kampüs bahçesinde arkadaşını gördün ve yanına yaklaştın. İlk selamı sen ver!',
    targetPrompt: 'Hello!',
    targetTurkish: 'Merhaba!',
    options: [
      { id: 'hello', text: 'Hello!', isCorrect: true },
      { id: 'goodbye', text: 'Goodbye!', isCorrect: false },
    ],
    partnerReply: 'Hello! How are you?',
    partnerReplyTurkish: 'Merhaba! Nasılsın?',
    hint: 'Arkadaşını görünce neşeyle selam vermek için "Hello!" (Merhaba!) demelisin.',
  },
  // Tur 3: Ayrılırken arkadaşına Goodbye! der
  {
    id: 'goodbye',
    situationTitle: 'Ayrılırken Veda Et',
    situationDescription: 'Okul çıkışında arkadaşından ayrılıp eve dönüyorsun. Vedayı sen başlat!',
    targetPrompt: 'Goodbye!',
    targetTurkish: 'Hoşça kal!',
    options: [
      { id: 'goodbye', text: 'Goodbye!', isCorrect: true },
      { id: 'hello', text: 'Hello!', isCorrect: false },
    ],
    partnerReply: 'Goodbye! See you tomorrow!',
    partnerReplyTurkish: 'Hoşça kal! Yarın görüşürüz!',
    hint: 'Ayrılırken ve el sallarken veda etmek için "Goodbye!" (Hoşça kal!) demelisin.',
  },
  // Tur 4: Gece yatmadan önce ailesine Good night! der
  {
    id: 'good_night',
    situationTitle: 'Gece İyi Uykular Dile',
    situationDescription: 'Gece yatağına yatarken ailene iyi uykular dilemek istiyorsun. Konuşmayı sen başlat!',
    targetPrompt: 'Good night!',
    targetTurkish: 'İyi geceler!',
    options: [
      { id: 'good_night', text: 'Good night!', isCorrect: true },
      { id: 'good_morning', text: 'Good morning!', isCorrect: false },
    ],
    partnerReply: 'Good night! Sweet dreams!',
    partnerReplyTurkish: 'İyi geceler! Tatlı rüyalar!',
    hint: 'Gece yatarken ve iyi uykular dilerken "Good night!" (İyi geceler!) demelisin.',
  },
];

export function Grade3PaylasStationView({
  missionId = 'kapilarin-anlattigi-hikaye',
  onExitToClassroom,
}: Grade3PaylasStationViewProps) {
  const campus = useOptionalCampus();
  const titleId = useId();

  // Etkinlik Adımı: 'activityA' (Arkadaşım Ne Söylüyor?) -> 'transition' -> 'activityB' (Şimdi Sen Konuş!) -> 'completed'
  const [activeStep, setActiveStep] = useState<'activityA' | 'transition' | 'activityB' | 'completed'>('activityA');

  // ETKİNLİK A DURUMU: Karşılık Ver (4 durum)
  const [taskIndexA, setTaskIndexA] = useState<number>(0);
  const [selectedOptionA, setSelectedOptionA] = useState<GreetingId | null>(null);
  const [feedbackA, setFeedbackA] = useState<{ text: string; isError: boolean } | null>(null);
  const [isTaskLockedA, setIsTaskLockedA] = useState(false);

  // ETKİNLİK B DURUMU: Sen Başlat (4 tur)
  const [roundIndexB, setRoundIndexB] = useState<number>(0);
  const [selectedOptionB, setSelectedOptionB] = useState<GreetingId | null>(null);
  const [feedbackB, setFeedbackB] = useState<{ text: string; isError: boolean } | null>(null);
  const [isRoundLockedB, setIsRoundLockedB] = useState(false);

  // Ses Durumu
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeed, setActiveSpeed] = useState<'normal' | 'slow' | null>(null);

  const currentTaskA = CONVERSATION_REPLY_TASKS[taskIndexA];
  const currentRoundB = INITIATE_CONVERSATION_TASKS[roundIndexB];

  /**
   * Web Speech API Telaffuz Desteği
   */
  const playSpeech = useCallback((text: string, speed: 'normal' | 'slow' = 'normal') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = speed === 'slow' ? 0.65 : 0.85;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setActiveSpeed(speed);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setActiveSpeed(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setActiveSpeed(null);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // Masadan çıkıldığında veya bileşen kapandığında tüm sesleri iptal et
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /**
   * ETKİNLİK A: Öğrenci Seçeneğe Bastığında
   */
  const handleSelectOptionA = (option: { id: GreetingId; text: string; isCorrect: boolean }) => {
    if (isTaskLockedA) return;
    setSelectedOptionA(option.id);

    if (option.isCorrect) {
      // Doğru Karşılık!
      setIsTaskLockedA(true);
      setFeedbackA({
        text: `Harika! "${option.text}" çok uygun bir karşılık oldu! 👏`,
        isError: false,
      });

      playSpeech(option.text, 'normal');

      setTimeout(() => {
        if (taskIndexA < CONVERSATION_REPLY_TASKS.length - 1) {
          setTaskIndexA((prev) => prev + 1);
          setSelectedOptionA(null);
          setFeedbackA(null);
          setIsTaskLockedA(false);
        } else {
          // Etkinlik A bitti, ara geçiş ekranına geç
          setActiveStep('transition');
          setFeedbackA(null);
          setIsTaskLockedA(false);
        }
      }, 1400);
    } else {
      // Yanlış Seçim: Cezasız Türkçe ipucu ve tekrar deneme imkânı
      setFeedbackA({
        text: `Farklı bir karşılık seçtin. İpucu: ${currentTaskA.hint}`,
        isError: true,
      });
      playSpeech(currentTaskA.partnerPrompt, 'slow');
    }
  };

  /**
   * ETKİNLİK B: Öğrenci Konuşmayı Başlattığında
   */
  const handleSelectOptionB = (option: { id: GreetingId; text: string; isCorrect: boolean }) => {
    if (isRoundLockedB) return;
    setSelectedOptionB(option.id);

    if (option.isCorrect) {
      // Doğru Başlatma!
      setIsRoundLockedB(true);
      setFeedbackB({
        text: `Tebrikler! "${option.text}" ile konuşmayı harika başlattın! 🌟`,
        isError: false,
      });

      playSpeech(option.text, 'normal');

      setTimeout(() => {
        if (roundIndexB < INITIATE_CONVERSATION_TASKS.length - 1) {
          setRoundIndexB((prev) => prev + 1);
          setSelectedOptionB(null);
          setFeedbackB(null);
          setIsRoundLockedB(false);
        } else {
          // ETKİNLİK B BİTTİ — TÜM 4 MASAYI TAMAMLAYIP KAYDET
          if (campus) {
            const existing = campus.getMissionProgress(missionId, 3);
            const completedStages: MissionStageId[] = [
              'kesfet',
              'ogren',
              'uret',
              'paylas',
            ];

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
              completed: true, // Dört masa tamamlandı, Büyük Görev'e hazır!
              completedAt: existing?.completedAt ?? new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            campus.saveMissionProgress(nextProgress);
          }

          setActiveStep('completed');
          setFeedbackB(null);
          setIsRoundLockedB(false);
        }
      }, 1400);
    } else {
      // Yanlış Seçim: Cezasız ipucu
      setFeedbackB({
        text: `Farklı bir ifade seçtin. İpucu: ${currentRoundB.hint}`,
        isError: true,
      });
      playSpeech(currentRoundB.targetPrompt, 'slow');
    }
  };

  /**
   * Baştan Başla (Tekrar Oyna)
   */
  const handleRestart = () => {
    setActiveStep('activityA');
    setTaskIndexA(0);
    setSelectedOptionA(null);
    setFeedbackA(null);
    setIsTaskLockedA(false);

    setRoundIndexB(0);
    setSelectedOptionB(null);
    setFeedbackB(null);
    setIsRoundLockedB(false);
  };

  return (
    <div className="w-full h-full flex flex-col bg-linear-to-b from-[#fdf2f8] via-[#fce7f3] to-[#fbcfe8] p-3 sm:p-6 overflow-y-auto">
      {/* 1. Üst Rozet ve İlerleme Göstergesi */}
      <div className="max-w-4xl mx-auto w-full mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border-2 border-rose-300 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-inner border border-rose-400">
              <MessageCircle className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-900 font-serif">
                  4. PAYLAŞ MASASI
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold border border-rose-300">
                  3. Sınıf İngilizce
                </span>
              </div>
              <h1 id={titleId} className="text-sm sm:text-base font-extrabold text-[#831843]">
                {activeStep === 'activityA' && 'Etkinlik A — Arkadaşım Ne Söylüyor?'}
                {activeStep === 'transition' && 'Etkinlik A Tamamlandı!'}
                {activeStep === 'activityB' && 'Etkinlik B — Şimdi Sen Konuş!'}
                {activeStep === 'completed' && 'Harika! Dört Öğrenme Masasını Tamamladın!'}
              </h1>
            </div>
          </div>

          {/* İlerleme Rozetleri */}
          <div className="flex items-center gap-2">
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                activeStep === 'activityA'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}
            >
              {activeStep === 'activityA' ? `Karşılık Ver (${taskIndexA + 1}/4)` : '1. Etkinlik ✓'}
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                activeStep === 'activityB'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : activeStep === 'completed'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-rose-100/60 text-rose-700'
              }`}
            >
              {activeStep === 'activityB'
                ? `Sen Başlat (${roundIndexB + 1}/4)`
                : activeStep === 'completed'
                  ? '2. Etkinlik ✓'
                  : '2. Etkinlik'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. ETKİNLİK A: KONUŞMA BALONUNU TAMAMLA (ARKADAŞIM NE SÖYLÜYOR?) */}
      {activeStep === 'activityA' && (
        <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col gap-4 animate-in fade-in duration-300">
          {/* Durum Kartı ve Karakter Konuşma Balonu */}
          <div className="bg-white/95 rounded-2xl p-5 border-2 border-rose-300 shadow-md flex flex-col items-center gap-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-900 text-xs font-semibold">
              <Users className="w-3.5 h-3.5 text-rose-700" aria-hidden="true" />
              <span>{currentTaskA.situationTitle}</span>
            </div>

            <p className="text-xs sm:text-sm text-rose-950 font-medium max-w-lg">
              {currentTaskA.situationDescription}
            </p>

            {/* İllüstrasyon ve Karakter Balonu */}
            <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 bg-rose-50/50 p-4 rounded-xl border border-rose-200">
              <div className="w-40 h-32 shrink-0 rounded-lg overflow-hidden flex items-center justify-center">
                <GreetingIllustration id={currentTaskA.id} />
              </div>

              {/* Karakterin Konuşma Balonu */}
              <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left gap-2 w-full">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                  <User className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{currentTaskA.partnerName} diyor ki:</span>
                </div>

                {/* Konuşma Balonu */}
                <div className="relative bg-white px-5 py-3 rounded-2xl border-2 border-rose-400 shadow-sm max-w-sm">
                  <span className="text-xl sm:text-2xl font-black text-rose-950 font-serif tracking-wide block">
                    "{currentTaskA.partnerPrompt}"
                  </span>
                  <span className="text-xs text-rose-700 font-semibold block mt-0.5">
                    ({currentTaskA.partnerTurkish})
                  </span>
                </div>

                {/* Dinleme Butonları */}
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => playSpeech(currentTaskA.partnerPrompt, 'normal')}
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeSpeed === 'normal' && isSpeaking
                        ? 'bg-rose-600 text-white ring-2 ring-rose-300 scale-105'
                        : 'bg-rose-100 hover:bg-rose-200 text-rose-900 active:scale-95'
                    }`}
                    aria-label={`"${currentTaskA.partnerPrompt}" ifadesini dinle`}
                  >
                    <Volume2 className="w-4 h-4 text-rose-700" aria-hidden="true" />
                    <span>Dinle</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => playSpeech(currentTaskA.partnerPrompt, 'slow')}
                    className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-all cursor-pointer ${
                      activeSpeed === 'slow' && isSpeaking
                        ? 'bg-rose-200 text-rose-950 ring-2 ring-rose-300 scale-105'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-800 active:scale-95'
                    }`}
                    aria-label={`"${currentTaskA.partnerPrompt}" ifadesini yavaş dinle`}
                  >
                    <span>🐢</span>
                    <span>Yavaş Dinle</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tepki veya İpucu */}
            {feedbackA && (
              <div
                className={`w-full max-w-md mx-auto p-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border animate-in zoom-in-95 duration-200 ${
                  feedbackA.isError
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : 'bg-emerald-50 text-emerald-900 border-emerald-300'
                }`}
                role="status"
              >
                {feedbackA.isError ? (
                  <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                )}
                <span>{feedbackA.text}</span>
              </div>
            )}
          </div>

          {/* İki Cevap Seçeneği */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 items-center">
            {currentTaskA.options.map((option) => {
              const isSelected = selectedOptionA === option.id;
              const isCorrectTarget = isTaskLockedA && option.isCorrect;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelectOptionA(option)}
                  disabled={isTaskLockedA}
                  className={`w-full min-h-[105px] sm:min-h-[125px] p-4 rounded-2xl border-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer shadow-md hover:shadow-lg ${
                    isCorrectTarget
                      ? 'border-emerald-600 bg-emerald-50 ring-4 ring-emerald-300 scale-105'
                      : isSelected && feedbackA?.isError
                        ? 'border-amber-400 bg-amber-50'
                        : isSelected
                          ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-300'
                          : 'border-rose-300 bg-white hover:border-rose-500 hover:bg-rose-50/50'
                  }`}
                  aria-label={`"${option.text}" ifadesini seç`}
                >
                  <span className="text-xl sm:text-2xl font-black text-rose-950 font-serif tracking-wide block mb-1">
                    {option.text}
                  </span>

                  {isCorrectTarget && (
                    <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      <Check className="w-3.5 h-3.5" aria-hidden="true" /> Doğru Karşılık
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. ARA GEÇİŞ EKRANI: Etkinlik A Tamamlandı -> Etkinlik B'ye Başla */}
      {activeStep === 'transition' && (
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col items-center justify-center text-center p-6 bg-white/95 rounded-3xl border-3 border-rose-400 shadow-xl animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg border-2 border-rose-300 mb-4 animate-bounce">
            <CheckCircle2 className="w-9 h-9" aria-hidden="true" />
          </div>
          <span className="text-xs font-bold text-rose-700 uppercase tracking-widest">
            1. Etkinlik Tamamlandı
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-rose-950 mt-1 mb-2 font-serif">
            Karşılıklı Konuşmaları Başarıyla Tamamladın! 💬
          </h2>
          <p className="text-xs sm:text-sm text-rose-900 mb-6">
            Arkadaşlarının selamlarına doğru karşılıklar verdin. Şimdi durumu değerlendirip konuşmayı kendin başlatacaksın!
          </p>

          <button
            type="button"
            onClick={() => {
              setActiveStep('activityB');
              setRoundIndexB(0);
              setSelectedOptionB(null);
              setFeedbackB(null);
            }}
            className="w-full min-h-[48px] px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <span>2. Etkinliğe Başla (Şimdi Sen Konuş!)</span>
            <Play className="w-4 h-4 fill-white" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* 4. ETKİNLİK B: BENİM SIRAM! (ŞİMDİ SEN KONUŞ!) */}
      {activeStep === 'activityB' && (
        <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col gap-4 animate-in fade-in duration-300">
          {/* Durum Kartı ve Yönerge */}
          <div className="bg-white/95 rounded-2xl p-5 border-2 border-rose-300 shadow-md flex flex-col items-center gap-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-900 text-xs font-semibold">
              <MessageCircle className="w-3.5 h-3.5 text-rose-700" aria-hidden="true" />
              <span>{currentRoundB.situationTitle}</span>
            </div>

            <p className="text-xs sm:text-sm text-rose-950 font-medium max-w-lg">
              {currentRoundB.situationDescription}
            </p>

            {/* İllüstrasyon ve Karakter Yanıtı */}
            <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 bg-rose-50/50 p-4 rounded-xl border border-rose-200">
              <div className="w-40 h-32 shrink-0 rounded-lg overflow-hidden flex items-center justify-center">
                <GreetingIllustration id={currentRoundB.id} />
              </div>

              {/* Konuşmayı Başlatma Alanı */}
              <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left gap-2 w-full">
                <span className="text-xs font-bold text-rose-800">
                  Senin Başlatacağın İfade:
                </span>

                {/* Hedef İfade Önizleme Kutusu */}
                <div className="relative bg-white px-5 py-3 rounded-2xl border-2 border-dashed border-rose-400 shadow-sm max-w-sm w-full">
                  <span className="text-lg sm:text-xl font-black text-rose-950 font-serif block">
                    {selectedOptionB === currentRoundB.options.find((o) => o.isCorrect)?.id ? (
                      `"${currentRoundB.targetPrompt}"`
                    ) : (
                      <span className="text-xs text-rose-400 italic font-sans">
                        Aşağıdaki seçeneklerden uygun ifadeyi seç...
                      </span>
                    )}
                  </span>
                  {isRoundLockedB && (
                    <span className="text-xs text-emerald-700 font-bold block mt-1">
                      Arkadaşının yanıtı: "{currentRoundB.partnerReply}"
                    </span>
                  )}
                </div>

                {/* Dinleme Butonları */}
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => playSpeech(currentRoundB.targetPrompt, 'normal')}
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeSpeed === 'normal' && isSpeaking
                        ? 'bg-rose-600 text-white ring-2 ring-rose-300 scale-105'
                        : 'bg-rose-100 hover:bg-rose-200 text-rose-900 active:scale-95'
                    }`}
                    aria-label={`"${currentRoundB.targetPrompt}" ifadesini dinle`}
                  >
                    <Volume2 className="w-4 h-4 text-rose-700" aria-hidden="true" />
                    <span>Dinle</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => playSpeech(currentRoundB.targetPrompt, 'slow')}
                    className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-all cursor-pointer ${
                      activeSpeed === 'slow' && isSpeaking
                        ? 'bg-rose-200 text-rose-950 ring-2 ring-rose-300 scale-105'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-800 active:scale-95'
                    }`}
                    aria-label={`"${currentRoundB.targetPrompt}" ifadesini yavaş dinle`}
                  >
                    <span>🐢</span>
                    <span>Yavaş Dinle</span>
                  </button>
                </div>
              </div>
            </div>

            {/* İpucu ve Geri Bildirim */}
            {feedbackB && (
              <div
                className={`w-full max-w-md mx-auto p-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border animate-in zoom-in-95 duration-200 ${
                  feedbackB.isError
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : 'bg-emerald-50 text-emerald-900 border-emerald-300'
                }`}
                role="status"
              >
                {feedbackB.isError ? (
                  <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
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
                  className={`w-full min-h-[105px] sm:min-h-[125px] p-4 rounded-2xl border-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer shadow-md hover:shadow-lg ${
                    isCorrectTarget
                      ? 'border-emerald-600 bg-emerald-50 ring-4 ring-emerald-300 scale-105'
                      : isSelected && feedbackB?.isError
                        ? 'border-amber-400 bg-amber-50'
                        : isSelected
                          ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-300'
                          : 'border-rose-300 bg-white hover:border-rose-500 hover:bg-rose-50/50'
                  }`}
                  aria-label={`"${option.text}" ifadesini seç`}
                >
                  <span className="text-xl sm:text-2xl font-black text-rose-950 font-serif tracking-wide block mb-1">
                    {option.text}
                  </span>

                  {isCorrectTarget && (
                    <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      <Check className="w-3.5 h-3.5" aria-hidden="true" /> Doğru Başlatma
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. TAMAMLANDI EKRANI (Dört Masanın Tamamı Başarıyla Bitti) */}
      {activeStep === 'completed' && (
        <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col items-center justify-center text-center p-6 bg-white/95 rounded-3xl border-3 border-rose-400 shadow-xl animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg border-2 border-rose-300 mb-3 animate-bounce">
            <Sparkles className="w-9 h-9" aria-hidden="true" />
          </div>

          <span className="text-xs font-bold text-rose-700 uppercase tracking-widest">
            4. MASA VE TÜM İSTASYONLAR BAŞARIYLA TAMAMLANDI
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-rose-950 mt-1 mb-2 font-serif">
            Harika! Dört öğrenme masasını da tamamladın. Artık Büyük Görev'e hazırsın! 🏆
          </h2>
          <p className="text-xs sm:text-sm text-rose-900 max-w-lg mb-6">
            Dört selamlaşma ifadesini karşılıklı konuşmalarda kullandın ve konuşmaları başlattın. Tüm masalardaki başarıların kaydedildi!
          </p>

          {/* Dört Temel İfade Özeti */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full mb-6 text-left">
            {GREETINGS_DATA.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-rose-50/80 border border-rose-200 flex flex-col items-center text-center"
              >
                <div className="w-12 h-10 mb-1 flex items-center justify-center">
                  <GreetingIllustration id={item.id} />
                </div>
                <span className="text-xs font-bold text-rose-950 font-serif">{item.english}</span>
                <span className="text-[10px] text-rose-800">{item.turkish}</span>
              </div>
            ))}
          </div>

          {/* Aksiyon Butonları (YALNIZCA Masadan Kalk / Sınıfa Dön ve Tekrar Oyna) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
            <button
              type="button"
              onClick={onExitToClassroom}
              className="w-full min-h-[48px] px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
              aria-label="Masadan kalk ve sınıfa dön"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Masadan Kalk / Sınıfa Dön</span>
            </button>

            <button
              type="button"
              onClick={handleRestart}
              className="w-full sm:w-auto min-h-[48px] px-4 py-3 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold text-xs inline-flex items-center justify-center gap-1.5 border border-rose-300 transition-colors cursor-pointer"
              aria-label="Paylaş masası etkinliğini tekrar oyna"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-800" aria-hidden="true" />
              <span>Tekrar Oyna</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
