import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Volume2,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  ArrowLeft,
  Sun,
  Moon,
  Clock,
  Check,
  Award,
  HelpCircle,
} from 'lucide-react';
import { useOptionalCampus } from '@/src/app/CampusProviders';

export interface Grade3SmartBoardAdventureViewProps {
  onExitToClassroom: () => void;
}

type SceneId = 'scene1_arrival' | 'scene2_friend' | 'scene3_farewell' | 'scene4_night' | 'adventure_completed';

interface SceneStepConfig {
  id: SceneId;
  sceneTitle: string;
  timeLabel: string;
  timeOfDay: 'morning' | 'afternoon' | 'golden_hour' | 'night';
  speakerName: string;
  speakerRole: 'friend1' | 'friend2' | 'student';
  speakerExpression: string;
  speakerTurkish: string;
  promptText: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  correctFeedback: string;
  wrongHint: string;
}

const SCENE_CONFIGS: SceneStepConfig[] = [
  // SAHNE 1: Kervansaraya Varış (Sabah Vakti)
  {
    id: 'scene1_arrival',
    sceneTitle: '1. Sahne — Kervansaraya Varış',
    timeLabel: 'Sabah Vakti • Güneşli Gün',
    timeOfDay: 'morning',
    speakerName: 'Kerem',
    speakerRole: 'friend1',
    speakerExpression: 'Good morning!',
    speakerTurkish: 'Günaydın!',
    promptText: 'Kerem kervansarayın önünde seni gördü ve el salladı. Sen de ona sabah selamı ver:',
    options: [
      { id: 'gm', text: 'Good morning!', isCorrect: true },
      { id: 'gn', text: 'Good night!', isCorrect: false },
    ],
    correctFeedback: 'Harika! "Good morning!" diyerek Kerem\'e sabah selamı verdin. ☀️',
    wrongHint: 'Sabah saatlerinde güne başlarken "Good morning!" (Günaydın) deriz. "Good night!" ise gece yatarken söylenir.',
  },
  // SAHNE 2: Yeni Bir Arkadaş (Gündüz Keşfi)
  {
    id: 'scene2_friend',
    sceneTitle: '2. Sahne — Yeni Bir Arkadaş',
    timeLabel: 'Öğle Vakti • Kervansaray Avlusu',
    timeOfDay: 'afternoon',
    speakerName: 'Zeynep',
    speakerRole: 'friend2',
    speakerExpression: 'Hello!',
    speakerTurkish: 'Merhaba! Hoş geldin!',
    promptText: 'Zeynep yanınıza geldi. Yeni arkadaşınla tanışmak için konuşmayı sen başlat:',
    options: [
      { id: 'hello', text: 'Hello!', isCorrect: true },
      { id: 'goodbye', text: 'Goodbye!', isCorrect: false },
    ],
    correctFeedback: 'Çok güzel! "Hello!" diyerek konuşmayı başlattın ve Zeynep de sana selam verdi. 👋',
    wrongHint: 'Yeni bir arkadaşla karşılaştığımızda "Hello!" (Merhaba) diyerek konuşmayı başlatırız. "Goodbye!" ayrılırken söylenir.',
  },
  // SAHNE 3: Vedalaşma (İkindi Vakti)
  {
    id: 'scene3_farewell',
    sceneTitle: '3. Sahne — Vedalaşma',
    timeLabel: 'İkindi Vakti • Gün Batımı Öncesi',
    timeOfDay: 'golden_hour',
    speakerName: 'Kerem',
    speakerRole: 'friend1',
    speakerExpression: 'Goodbye!',
    speakerTurkish: 'Hoşça kal! Görüşmek üzere!',
    promptText: 'Gezinin sonuna gelindi ve Kerem ayrılmaya hazırlanıyor. Ona İngilizce veda et:',
    options: [
      { id: 'hello_opt', text: 'Hello!', isCorrect: false },
      { id: 'goodbye_opt', text: 'Goodbye!', isCorrect: true },
    ],
    correctFeedback: 'Harika! "Goodbye!" diyerek arkadaşınla vedalaştın. Kerem sana el salladı. 🎒',
    wrongHint: 'Ayrılırken ve vedalaşırken "Goodbye!" (Hoşça kal) demeliyiz. "Hello!" karşılaşınca söylenir.',
  },
  // SAHNE 4: Günün Sonu (Gece Vakti)
  {
    id: 'scene4_night',
    sceneTitle: '4. Sahne — Günün Sonu',
    timeLabel: 'Gece Vakti • Yıldızlı Gökyüzü',
    timeOfDay: 'night',
    speakerName: 'Uyku Vakti',
    speakerRole: 'friend2',
    speakerExpression: 'Good night!',
    speakerTurkish: 'İyi geceler! Tatlı rüyalar!',
    promptText: 'Güzel bir günün ardından evde uyuma vakti geldi. Ailene ve arkadaşlarına iyi uykular dile:',
    options: [
      { id: 'gm_night', text: 'Good morning!', isCorrect: false },
      { id: 'gn_night', text: 'Good night!', isCorrect: true },
    ],
    correctFeedback: 'Tebrikler! "Good night!" diyerek günü huzurla tamamladın. 🌙⭐',
    wrongHint: 'Gece uyumadan önce iyi uykular dilemek için "Good night!" (İyi geceler) deriz.',
  },
];

export function Grade3SmartBoardAdventureView({ onExitToClassroom }: Grade3SmartBoardAdventureViewProps) {
  const campus = useOptionalCampus();

  // Sahne İndeksi
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const isLockedRef = useRef(false);

  // Ses Durumu
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingSpeaker, setSpeakingSpeaker] = useState<'friend' | 'student' | null>(null);

  // Karakter Animasyon Durumları
  const [studentAction, setStudentAction] = useState<'walk_in' | 'idle' | 'speaking' | 'cheer'>('walk_in');
  const [friendAction, setFriendAction] = useState<'wave' | 'idle' | 'speaking' | 'leave'>('wave');
  const [friend2Visible, setFriend2Visible] = useState(false);

  // Zamanlayıcı referansı
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  const currentConfig = SCENE_CONFIGS[currentSceneIndex] ?? SCENE_CONFIGS[0];
  const isCompletedScene = currentSceneIndex >= SCENE_CONFIGS.length;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimer();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [clearTimer]);

  /**
   * Doğal Web Speech API ile İngilizce seslendirme.
   * Karakterlere göre farklı pitch/rate verilir.
   */
  const playSpeech = useCallback(
    (text: string, speakerType: 'friend' | 'student', speed: 'normal' | 'slow' = 'normal') => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      try {
        window.speechSynthesis.cancel();
      } catch {
        // Hata durumunda yut
      }

      setIsSpeaking(true);
      setSpeakingSpeaker(speakerType);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = speed === 'slow' ? 0.62 : 0.82;

      // Karakter ses tonları:
      if (speakerType === 'student') {
        utterance.pitch = 1.1;
      } else {
        // Kerem veya Zeynep
        utterance.pitch = currentConfig.speakerRole === 'friend2' ? 1.25 : 0.95;
      }

      const voices = window.speechSynthesis.getVoices();
      const englishVoice =
        voices.find((v) => v.lang.toLowerCase() === 'en-us') ||
        voices.find((v) => v.lang.toLowerCase().startsWith('en'));

      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      utterance.onend = () => {
        setIsSpeaking(false);
        setSpeakingSpeaker(null);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setSpeakingSpeaker(null);
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch {
        setIsSpeaking(false);
        setSpeakingSpeaker(null);
      }
    },
    [currentConfig.speakerRole],
  );

  // Sahne Başlangıç Etkileri ve Giriş Animasyonu
  useEffect(() => {
    if (isCompletedScene) return;

    clearTimer();

    // Sahneye göre karakterlerin görünürlüğü ve eylemleri
    if (currentConfig.id === 'scene1_arrival') {
      const tInit = setTimeout(() => {
        setStudentAction('walk_in');
        setFriendAction('wave');
        setFriend2Visible(false);
      }, 0);

      const tSpeech = setTimeout(() => {
        setStudentAction('idle');
        playSpeech(currentConfig.speakerExpression, 'friend', 'normal');
      }, 1000);

      return () => {
        clearTimeout(tInit);
        clearTimeout(tSpeech);
      };
    } else if (currentConfig.id === 'scene2_friend') {
      const tInit = setTimeout(() => {
        setStudentAction('idle');
        setFriendAction('idle');
        setFriend2Visible(true);
      }, 0);

      const tWave = setTimeout(() => {
        setFriendAction('wave');
      }, 400);

      return () => {
        clearTimeout(tInit);
        clearTimeout(tWave);
      };
    } else if (currentConfig.id === 'scene3_farewell') {
      const tInit = setTimeout(() => {
        setStudentAction('idle');
        setFriendAction('wave');
        setFriend2Visible(true);
      }, 0);

      const tSpeech = setTimeout(() => {
        playSpeech(currentConfig.speakerExpression, 'friend', 'normal');
      }, 500);

      return () => {
        clearTimeout(tInit);
        clearTimeout(tSpeech);
      };
    } else if (currentConfig.id === 'scene4_night') {
      const tInit = setTimeout(() => {
        setStudentAction('idle');
        setFriendAction('idle');
        setFriend2Visible(false);
      }, 0);

      const tSpeech = setTimeout(() => {
        playSpeech(currentConfig.speakerExpression, 'friend', 'normal');
      }, 600);

      return () => {
        clearTimeout(tInit);
        clearTimeout(tSpeech);
      };
    }
  }, [currentSceneIndex, currentConfig, isCompletedScene, playSpeech, clearTimer]);

  /**
   * Öğrencinin Cevap Seçimi
   */
  const handleSelectOption = (option: { id: string; text: string; isCorrect: boolean }) => {
    if (isLockedRef.current) return;

    setSelectedOptionId(option.id);

    if (option.isCorrect) {
      // Doğru Seçim!
      isLockedRef.current = true;
      setIsLocked(true);
      clearTimer();

      setFeedback({
        text: currentConfig.correctFeedback,
        isError: false,
      });

      // Öğrencinin konuşması ve sevinci
      setStudentAction('cheer');
      playSpeech(option.text, 'student', 'normal');

      // Sahneye göre geçiş gecikmesi
      timerRef.current = setTimeout(() => {
        if (currentConfig.id === 'scene2_friend') {
          // Zeynep cevap verir: "Hello!"
          setFriendAction('speaking');
          playSpeech('Hello!', 'friend', 'normal');

          timerRef.current = setTimeout(() => {
            advanceToNextScene();
          }, 1400);
        } else if (currentConfig.id === 'scene3_farewell') {
          // Kerem el sallar ve sahneden ayrılır
          setFriendAction('leave');
          timerRef.current = setTimeout(() => {
            advanceToNextScene();
          }, 1400);
        } else {
          advanceToNextScene();
        }
      }, 1300);
    } else {
      // Yanlış Seçim: Cezasız pedagojik ipucu
      setFeedback({
        text: currentConfig.wrongHint,
        isError: true,
      });

      playSpeech(option.text, 'student', 'slow');

      // 2 saniye sonra otomatik temizle veya öğrencinin hemen yeni seçim yapmasına izin ver
      timerRef.current = setTimeout(() => {
        setSelectedOptionId(null);
        setFeedback(null);
      }, 2400);
    }
  };

  /**
   * Sonraki Sahneye Geçiş
   */
  const advanceToNextScene = () => {
    clearTimer();
    setSelectedOptionId(null);
    setFeedback(null);
    setIsLocked(false);
    isLockedRef.current = false;
    const nextIdx = currentSceneIndex + 1;
    setCurrentSceneIndex(nextIdx);

    if (nextIdx >= SCENE_CONFIGS.length) {
      // Macerayı Tamamla! State üzerine tamamlandı olarak kaydet (4 masanın aşamalarını koruyarak)
      if (campus && campus.state.selectedGrade === 3) {
        const existingProgress = campus.getMissionProgress('kapilarin-anlattigi-hikaye', 3);
        if (existingProgress) {
          campus.saveMissionProgress({
            ...existingProgress,
            completed: true,
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }
  };

  /**
   * Macerayı Baştan Başlat
   */
  const handleRestart = () => {
    clearTimer();
    setCurrentSceneIndex(0);
    setSelectedOptionId(null);
    setFeedback(null);
    setIsLocked(false);
    isLockedRef.current = false;
    setStudentAction('walk_in');
    setFriendAction('wave');
    setFriend2Visible(false);
  };

  return (
    <div
      ref={modalContainerRef}
      className="relative w-full h-full min-h-[580px] flex flex-col bg-[#111e33] text-white select-none overflow-hidden"
    >
      {/* ÜST BİLGİ VE KONTROL ÇUBUĞU */}
      <div className="shrink-0 px-4 py-2.5 bg-[#0b1424]/90 border-b border-amber-500/30 flex items-center justify-between gap-3 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-amber-200" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-950/70 px-2 py-0.5 rounded border border-amber-600/40">
                Büyük Görev • 3. Sınıf
              </span>
              <span className="text-xs sm:text-sm font-bold text-amber-100 hidden sm:inline">
                Kervansarayın Gölgesinde Macera
              </span>
            </div>
            <p className="text-[10px] text-amber-200/80">
              Aksaray Sultanhanı Kervansarayı • Greetings (Selamlaşma)
            </p>
          </div>
        </div>

        {/* Sahne Adım Göstergesi */}
        {!isCompletedScene && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-xs">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-200 font-bold">{currentConfig.sceneTitle}</span>
            <span className="text-slate-400 mx-1 hidden sm:inline">•</span>
            <span className="text-amber-100/90 font-medium hidden sm:inline">{currentConfig.timeLabel}</span>
            <span className="text-slate-400 mx-1">|</span>
            <span className="font-bold text-white">
              {currentSceneIndex + 1} / {SCENE_CONFIGS.length}
            </span>
          </div>
        )}

        {/* Sınıfa Dön Butonu */}
        <button
          type="button"
          onClick={onExitToClassroom}
          className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-amber-200 border border-amber-500/30 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          aria-label="Kervansaray macerasından çık ve sınıfa dön"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" aria-hidden="true" />
          <span>Sınıfa Dön</span>
        </button>
      </div>

      {/* SİNEMATİK SAHNE VE GÖRSEL ALAN */}
      <div className="relative flex-1 flex flex-col justify-between overflow-hidden">
        {/* ARKA PLAN KATMANI: SULTANHANI KERVANSARAYI MİMARİSİ VE ATMOSFERİ */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Gökyüzü ve Atmosferik Işıklandırma */}
          <div
            className={`absolute inset-0 transition-colors duration-1000 ${
              isCompletedScene || currentConfig.timeOfDay === 'night'
                ? 'bg-gradient-to-b from-[#060c18] via-[#0f1d38] to-[#18294a]'
                : currentConfig.timeOfDay === 'golden_hour'
                  ? 'bg-gradient-to-b from-[#d97706]/40 via-[#f59e0b]/20 to-[#fed7aa]/30'
                  : 'bg-gradient-to-b from-[#7dd3fc]/40 via-[#bae6fd]/25 to-[#fef08a]/20'
            }`}
          />

          {/* Sultanhanı Kervansarayı Arka Plan Görseli (Referans görsel) */}
          <img
            src="/assets/walkable/sultanhani_caravanserai.jpg"
            alt="Aksaray Sultanhanı Kervansarayı Taç Kapısı ve Avlusu"
            className={`w-full h-full object-cover object-center transition-all duration-1000 ${
              isCompletedScene || currentConfig.timeOfDay === 'night'
                ? 'brightness-45 contrast-110 saturate-70 hue-rotate-210'
                : currentConfig.timeOfDay === 'golden_hour'
                  ? 'brightness-90 contrast-105 saturate-130 sepia-25'
                  : 'brightness-100 contrast-100'
            }`}
          />

          {/* Gece Vakti Yıldız ve Ay Katmanı (Sahne 4) */}
          {(isCompletedScene || currentConfig.timeOfDay === 'night') && (
            <div className="absolute inset-0 z-1 pointer-events-none animate-in fade-in duration-700">
              {/* Parlayan Hilal Ay */}
              <div className="absolute top-6 right-16 w-12 h-12 rounded-full bg-amber-200/90 shadow-[0_0_35px_#fde68a] flex items-center justify-center">
                <Moon className="w-8 h-8 text-amber-50 fill-amber-100" />
              </div>

              {/* Işıltılı Yıldızlar */}
              <div className="absolute top-10 left-12 w-2 h-2 rounded-full bg-white animate-ping opacity-75" />
              <div className="absolute top-16 left-1/4 w-1.5 h-1.5 rounded-full bg-amber-200 animate-pulse" />
              <div className="absolute top-8 left-1/2 w-2 h-2 rounded-full bg-white opacity-80" />
              <div className="absolute top-20 right-1/3 w-1.5 h-1.5 rounded-full bg-sky-200 animate-ping opacity-60" />
              <div className="absolute top-14 right-28 w-2 h-2 rounded-full bg-amber-100 animate-pulse" />
            </div>
          )}

          {/* Sabah Güneşi Işık Huzmesi Katmanı (Sahne 1 & 2) */}
          {currentConfig.timeOfDay === 'morning' && !isCompletedScene && (
            <div className="absolute inset-0 pointer-events-none bg-radial from-amber-300/15 via-transparent to-transparent opacity-80" />
          )}

          {/* Ön Plan Canlı Çiçek ve Lavanta Gölgesi (Hareketli Çevre) */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10" />
        </div>

        {/* 2.5D KARAKTER VE DİYALOG SAHNESİ KATMANI */}
        {!isCompletedScene ? (
          <div className="relative z-20 flex-1 flex flex-col justify-between p-3 sm:p-6">
            {/* ÜST KONUŞMA BALONLARI ALANI (Taç Kapıyı Kapatmayacak Şekilde Sağ ve Sola Yerleşim) */}
            <div className="w-full flex items-start justify-between gap-4 pt-2">
              {/* SOL: ÖĞRENCİ (DENİZ) KONUŞMA BALONU (Cevap verildiğinde görünür) */}
              <div className="w-1/2 max-w-xs sm:max-w-sm">
                {selectedOptionId && feedback && !feedback.isError && (
                  <div className="p-3 sm:p-4 rounded-2xl bg-white/95 text-slate-900 border-2 border-emerald-500 shadow-xl animate-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-1.5 pb-1 border-b border-emerald-100">
                      <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider">
                        🎒 Deniz (Sen):
                      </span>
                    </div>
                    <p className="text-xl sm:text-2xl font-extrabold text-emerald-950 font-serif pt-1">
                      "{currentConfig.options.find((o) => o.id === selectedOptionId)?.text}"
                    </p>
                  </div>
                )}
              </div>

              {/* SAĞ: KARAKTERİN KONUŞMA BALONU (Kerem / Zeynep) */}
              <div className="w-1/2 max-w-xs sm:max-w-sm ml-auto">
                <div
                  className={`p-3 sm:p-4 rounded-2xl bg-white/95 text-slate-900 border-2 shadow-xl transition-all duration-300 ${
                    isSpeaking && speakingSpeaker === 'friend'
                      ? 'border-amber-500 ring-4 ring-amber-400/30 scale-102'
                      : 'border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-200">
                    <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider">
                      {currentConfig.speakerRole === 'friend1' ? '👦 Kerem:' : '👧 Zeynep:'}
                    </span>
                    {/* Ses Dinleme Butonları */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => playSpeech(currentConfig.speakerExpression, 'friend', 'normal')}
                        className="px-2 py-0.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-xs cursor-pointer"
                        aria-label={`${currentConfig.speakerName} konuşmasını dinle`}
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Dinle</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => playSpeech(currentConfig.speakerExpression, 'friend', 'slow')}
                        className="px-1.5 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] inline-flex items-center gap-0.5 shadow-xs cursor-pointer"
                        aria-label={`${currentConfig.speakerName} konuşmasını yavaş dinle`}
                      >
                        <span>🐢</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-1.5">
                    <p className="text-xl sm:text-2xl font-extrabold text-slate-900 font-serif">
                      "{currentConfig.speakerExpression}"
                    </p>
                    <p className="text-xs font-semibold text-slate-600 italic mt-0.5">
                      Türkçe: {currentConfig.speakerTurkish}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ORTA KATMAN: CANLI 2.5D KARAKTER SPRITE'LARI (Taç Kapının Önünde Dengeli Konum) */}
            <div className="w-full flex items-end justify-between px-4 sm:px-12 pb-2 pointer-events-none">
              {/* SOL KARAKTER: ÖĞRENCİ (DENİZ) */}
              <div
                className={`transition-all duration-700 flex flex-col items-center ${
                  studentAction === 'walk_in'
                    ? 'translate-x-0 opacity-100'
                    : studentAction === 'cheer'
                      ? 'scale-110 -translate-y-2'
                      : 'translate-x-0 opacity-100'
                }`}
              >
                {/* Karakter Adı Rozeti */}
                <span className="mb-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white shadow-md border border-emerald-300">
                  🎒 Deniz
                </span>

                {/* Deniz 2.5D SVG Çizimi */}
                <div className="w-24 h-36 sm:w-28 sm:h-40 drop-shadow-2xl">
                  <svg viewBox="0 0 100 140" className="w-full h-full">
                    {/* Zemin Gölgesi */}
                    <ellipse cx="50" cy="134" rx="28" ry="6" fill="rgba(0,0,0,0.35)" />

                    {/* Ayaklar ve Ayakkabılar */}
                    <rect x="36" y="112" width="10" height="18" rx="4" fill="#334155" />
                    <rect x="54" y="112" width="10" height="18" rx="4" fill="#334155" />
                    <ellipse cx="40" cy="130" rx="7" ry="4" fill="#0f172a" />
                    <ellipse cx="58" cy="130" rx="7" ry="4" fill="#0f172a" />

                    {/* Pantolon */}
                    <rect x="34" y="90" width="32" height="26" rx="4" fill="#d97706" />

                    {/* Gövde: Selçuklu Turkuazı Yelek ve Gömlek */}
                    <rect x="32" y="52" width="36" height="42" rx="6" fill="#0e768a" />
                    <rect x="42" y="52" width="16" height="42" fill="#f8fafc" />
                    {/* Selçuklu Sekiz Köşeli Rozet */}
                    <circle cx="44" cy="65" r="3" fill="#f59e0b" />

                    {/* Sırt Çantası Askıları */}
                    <path d="M 36,54 L 38,90" stroke="#78350f" strokeWidth="3" />
                    <path d="M 64,54 L 62,90" stroke="#78350f" strokeWidth="3" />

                    {/* Kollar: El Sallayan veya Normal Duruş */}
                    {studentAction === 'cheer' ? (
                      <g className="animate-pulse">
                        <path d="M 32,56 Q 20,40 24,28" stroke="#0e768a" strokeWidth="7" strokeLinecap="round" fill="none" />
                        <path d="M 68,56 Q 80,40 76,28" stroke="#0e768a" strokeWidth="7" strokeLinecap="round" fill="none" />
                        <circle cx="24" cy="28" r="4.5" fill="#fbcfe8" />
                        <circle cx="76" cy="28" r="4.5" fill="#fbcfe8" />
                      </g>
                    ) : (
                      <g>
                        <path d="M 32,56 Q 26,72 28,88" stroke="#0e768a" strokeWidth="6" strokeLinecap="round" fill="none" />
                        <path d="M 68,56 Q 78,65 76,78" stroke="#0e768a" strokeWidth="6" strokeLinecap="round" fill="none" />
                        <circle cx="28" cy="88" r="4" fill="#fbcfe8" />
                        <circle cx="76" cy="78" r="4" fill="#fbcfe8" />
                      </g>
                    )}

                    {/* Boyun ve Baş */}
                    <rect x="44" y="44" width="12" height="10" fill="#fbcfe8" />
                    <circle cx="50" cy="32" r="18" fill="#fbcfe8" />

                    {/* Kahverengi Sevimli Saç */}
                    <path d="M 32,30 Q 50,10 68,30 Q 50,22 32,30 Z" fill="#451a03" />
                    <circle cx="34" cy="26" r="6" fill="#451a03" />
                    <circle cx="66" cy="26" r="6" fill="#451a03" />

                    {/* Yüz: Gülen Gözler ve Gülümseme */}
                    <circle cx="44" cy="32" r="2.2" fill="#0f172a" />
                    <circle cx="56" cy="32" r="2.2" fill="#0f172a" />
                    <path d="M 45,39 Q 50,44 55,39" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" fill="none" />
                    <ellipse cx="40" cy="36" rx="3" ry="1.5" fill="#f43f5e" opacity="0.4" />
                    <ellipse cx="60" cy="36" rx="3" ry="1.5" fill="#f43f5e" opacity="0.4" />
                  </svg>
                </div>
              </div>

              {/* SAĞ KARAKTER: ARKADAŞLAR (KEREM & ZEYNEP) */}
              <div className="flex items-end gap-3 sm:gap-6">
                {/* 1. ARKADAŞ: KEREM */}
                <div
                  className={`transition-all duration-700 flex flex-col items-center ${
                    friendAction === 'leave'
                      ? 'translate-x-12 opacity-0'
                      : 'translate-x-0 opacity-100'
                  }`}
                >
                  <span className="mb-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-600 text-white shadow-md border border-amber-300">
                    👦 Kerem
                  </span>

                  {/* Kerem 2.5D SVG Çizimi (Gezgin Şapkalı) */}
                  <div className="w-24 h-36 sm:w-28 sm:h-40 drop-shadow-2xl">
                    <svg viewBox="0 0 100 140" className="w-full h-full">
                      <ellipse cx="50" cy="134" rx="28" ry="6" fill="rgba(0,0,0,0.35)" />

                      {/* Ayakkabılar ve Pantolon */}
                      <rect x="36" y="112" width="10" height="18" rx="4" fill="#475569" />
                      <rect x="54" y="112" width="10" height="18" rx="4" fill="#475569" />
                      <ellipse cx="40" cy="130" rx="7" ry="4" fill="#1e293b" />
                      <ellipse cx="58" cy="130" rx="7" ry="4" fill="#1e293b" />
                      <rect x="34" y="90" width="32" height="26" rx="4" fill="#0284c7" />

                      {/* Gövde: Sarı/Turuncu Macera Tişörtü */}
                      <rect x="32" y="52" width="36" height="42" rx="6" fill="#f59e0b" />
                      <path d="M 46,52 L 50,62 L 54,52" stroke="#d97706" strokeWidth="2" fill="none" />

                      {/* Kollar: El Sallayan Sağ Kol */}
                      {friendAction === 'wave' || friendAction === 'speaking' ? (
                        <g className="animate-pulse">
                          <path d="M 32,56 Q 22,65 24,78" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" fill="none" />
                          <circle cx="24" cy="78" r="4" fill="#fed7aa" />
                          {/* El Sallayan Kol */}
                          <path d="M 68,56 Q 84,40 82,24" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" fill="none" />
                          <circle cx="82" cy="24" r="4.5" fill="#fed7aa" />
                        </g>
                      ) : (
                        <g>
                          <path d="M 32,56 Q 22,68 24,84" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" fill="none" />
                          <path d="M 68,56 Q 78,68 76,84" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" fill="none" />
                          <circle cx="24" cy="84" r="4" fill="#fed7aa" />
                          <circle cx="76" cy="84" r="4" fill="#fed7aa" />
                        </g>
                      )}

                      {/* Boyun ve Baş */}
                      <rect x="44" y="44" width="12" height="10" fill="#fed7aa" />
                      <circle cx="50" cy="32" r="18" fill="#fed7aa" />

                      {/* Hasır Kâşif Şapkası */}
                      <ellipse cx="50" cy="22" rx="24" ry="7" fill="#fde047" stroke="#ca8a04" strokeWidth="2" />
                      <path d="M 36,22 Q 50,6 64,22" fill="#eab308" />

                      {/* Yüz */}
                      <circle cx="44" cy="32" r="2.2" fill="#0f172a" />
                      <circle cx="56" cy="32" r="2.2" fill="#0f172a" />
                      <path d="M 45,39 Q 50,44 55,39" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" fill="none" />
                      <ellipse cx="40" cy="36" rx="3" ry="1.5" fill="#f43f5e" opacity="0.4" />
                      <ellipse cx="60" cy="36" rx="3" ry="1.5" fill="#f43f5e" opacity="0.4" />
                    </svg>
                  </div>
                </div>

                {/* 2. ARKADAŞ: ZEYNEP (Sahne 2 ve 3'te görünür) */}
                {friend2Visible && (
                  <div className="flex flex-col items-center animate-in fade-in slide-in-from-right-8 duration-500">
                    <span className="mb-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-600 text-white shadow-md border border-teal-300">
                      👧 Zeynep
                    </span>

                    {/* Zeynep 2.5D SVG Çizimi (Örgülü Saçlı) */}
                    <div className="w-22 h-34 sm:w-26 sm:h-38 drop-shadow-2xl">
                      <svg viewBox="0 0 100 140" className="w-full h-full">
                        <ellipse cx="50" cy="134" rx="26" ry="6" fill="rgba(0,0,0,0.35)" />

                        {/* Ayakkabılar ve Etek */}
                        <ellipse cx="42" cy="130" rx="6" ry="3.5" fill="#831843" />
                        <ellipse cx="58" cy="130" rx="6" ry="3.5" fill="#831843" />
                        <path d="M 32,88 L 68,88 L 74,116 L 26,116 Z" fill="#db2777" />

                        {/* Hırka / Üst */}
                        <rect x="32" y="52" width="36" height="38" rx="6" fill="#0d9488" />
                        <path d="M 50,52 L 50,88" stroke="#042f2e" strokeWidth="2" />

                        {/* Kollar */}
                        <path d="M 32,56 Q 22,68 24,80" stroke="#0d9488" strokeWidth="6" strokeLinecap="round" fill="none" />
                        <path d="M 68,56 Q 80,48 76,34" stroke="#0d9488" strokeWidth="6" strokeLinecap="round" fill="none" />
                        <circle cx="24" cy="80" r="4" fill="#fde68a" />
                        <circle cx="76" cy="34" r="4.5" fill="#fde68a" />

                        {/* Baş ve İkili Örgülü Saç */}
                        <rect x="44" y="44" width="12" height="10" fill="#fde68a" />
                        <circle cx="50" cy="32" r="17" fill="#fde68a" />
                        <path d="M 32,28 Q 50,12 68,28" fill="#713f12" />
                        <path d="M 33,30 L 26,56" stroke="#713f12" strokeWidth="5" strokeLinecap="round" />
                        <path d="M 67,30 L 74,56" stroke="#713f12" strokeWidth="5" strokeLinecap="round" />
                        <circle cx="26" cy="56" r="3" fill="#db2777" />
                        <circle cx="74" cy="56" r="3" fill="#db2777" />

                        {/* Yüz */}
                        <circle cx="44" cy="32" r="2.2" fill="#0f172a" />
                        <circle cx="56" cy="32" r="2.2" fill="#0f172a" />
                        <path d="M 45,39 Q 50,44 55,39" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" fill="none" />
                        <ellipse cx="40" cy="36" rx="3" ry="1.5" fill="#f43f5e" opacity="0.4" />
                        <ellipse cx="60" cy="36" rx="3" ry="1.5" fill="#f43f5e" opacity="0.4" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ALT ETKİLEŞİM VE SEÇİM KARTI ALANI */}
            <div className="w-full max-w-2xl mx-auto rounded-2xl bg-slate-950/90 border-2 border-amber-500/50 p-4 sm:p-5 shadow-2xl backdrop-blur-md">
              {/* Durum Açıklaması ve Öğrenci Yönergesi */}
              <div className="flex items-center gap-2 mb-2 text-xs sm:text-sm font-bold text-amber-200">
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{currentConfig.promptText}</span>
              </div>

              {/* Seçenek Düğmeleri (2 Büyük Seçenek) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {currentConfig.options.map((option) => {
                  const isSelected = selectedOptionId === option.id;
                  const isCorrect = isSelected && option.isCorrect;
                  const isWrong = isSelected && !option.isCorrect;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelectOption(option)}
                      disabled={isLocked}
                      className={`min-h-[52px] sm:min-h-[60px] p-3 rounded-xl border-2 font-serif font-black text-lg sm:text-xl transition-all cursor-pointer shadow-md flex items-center justify-between gap-2 ${
                        isCorrect
                          ? 'border-emerald-500 bg-emerald-700 text-white ring-4 ring-emerald-400/40 scale-102'
                          : isWrong
                            ? 'border-rose-500 bg-rose-700 text-white animate-shake'
                            : 'border-amber-400/60 bg-slate-900/90 text-amber-100 hover:bg-slate-800 hover:border-amber-300 active:scale-98'
                      }`}
                      aria-label={`"${option.text}" seçeneğini yanıtla`}
                    >
                      <span>"{option.text}"</span>
                      {isCorrect && <Check className="w-6 h-6 text-white shrink-0" />}
                      {isWrong && <HelpCircle className="w-6 h-6 text-amber-200 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Geri Bildirim ve İpucu Paneli */}
              {feedback && (
                <div
                  className={`mt-3 p-3 rounded-xl border flex items-center gap-2.5 text-xs sm:text-sm font-semibold animate-in fade-in duration-200 ${
                    feedback.isError
                      ? 'bg-amber-950/80 border-amber-500 text-amber-200'
                      : 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                  }`}
                >
                  {feedback.isError ? (
                    <HelpCircle className="w-5 h-5 text-amber-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  <span>{feedback.text}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* MACERA TAMAMLAMA VE BAŞARI EKRANI */
          <div className="relative z-30 flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center animate-in zoom-in-95 duration-500">
            <div className="max-w-xl w-full bg-slate-950/95 border-3 border-amber-500 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-lg">
              {/* Başarı Rozeti */}
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center shadow-xl border-2 border-amber-200 mb-4 animate-bounce">
                <Award className="w-12 h-12" aria-hidden="true" />
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-400/40">
                Büyük Görev Başarıyla Tamamlandı 🏆
              </span>

              <h2 className="text-xl sm:text-2xl font-black text-amber-100 font-serif mt-3 mb-2">
                "Tebrikler! Öğrendiğin İngilizce ifadeleri günlük yaşamda başarıyla kullandın."
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 mb-6">
                Aksaray Sultanhanı Kervansarayı'nda yeni arkadaşlar edindin, selamlaştın ve günü başarıyla tamamladın!
              </p>

              {/* Dört İfadenin Özet Mini Kartları */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6 text-left">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/40">
                  <span className="text-[10px] font-bold text-amber-400">Sabah</span>
                  <p className="text-sm font-extrabold text-white font-serif">Good morning!</p>
                  <p className="text-[10px] text-slate-400">Günaydın!</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/40">
                  <span className="text-[10px] font-bold text-amber-400">Tanışma</span>
                  <p className="text-sm font-extrabold text-white font-serif">Hello!</p>
                  <p className="text-[10px] text-slate-400">Merhaba!</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/40">
                  <span className="text-[10px] font-bold text-amber-400">Veda</span>
                  <p className="text-sm font-extrabold text-white font-serif">Goodbye!</p>
                  <p className="text-[10px] text-slate-400">Hoşça kal!</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/40">
                  <span className="text-[10px] font-bold text-amber-400">Gece</span>
                  <p className="text-sm font-extrabold text-white font-serif">Good night!</p>
                  <p className="text-[10px] text-slate-400">İyi geceler!</p>
                </div>
              </div>

              {/* Aksiyon Butonları */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="w-full sm:w-auto min-h-[48px] px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-200 border border-amber-500/40 font-bold text-sm inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  <span>Tekrar Oyna</span>
                </button>

                <button
                  type="button"
                  onClick={onExitToClassroom}
                  className="w-full sm:w-auto min-h-[48px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm inline-flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-950" />
                  <span>Sınıfa Dön</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
