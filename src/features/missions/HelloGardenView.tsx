import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Volume2,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
} from 'lucide-react';
import { useOptionalCampus } from '@/src/app/CampusProviders';
import type { MissionProgress, MissionStageId } from '@/src/types/campus';
import {
  GREETINGS_DATA,
  type GreetingId,
  type GreetingItem,
} from './greetingsData';
import { GreetingIllustration } from './GreetingIllustration';

export interface HelloGardenViewProps {
  missionId?: string;
  onExitToClassroom: () => void;
  onAdvanceToNextTable?: (stage: MissionStageId) => void;
}

export type { GreetingId, GreetingItem };

export function HelloGardenView({
  missionId = 'kapilarin-anlattigi-hikaye',
  onExitToClassroom,
}: HelloGardenViewProps) {
  const campus = useOptionalCampus();

  // Aktif Bölüm: 'sectionA' (Keşfet) veya 'sectionB' (Eşleştir) veya 'completed' (Tamamlandı)
  const [activeSection, setActiveSection] = useState<'sectionA' | 'sectionB' | 'completed'>('sectionA');

  // Bölüm A: Kart keşif durumu (Her kart dinlendi mi?)
  const [exploredCards, setExploredCards] = useState<Record<GreetingId, boolean>>({
    hello: false,
    good_morning: false,
    goodbye: false,
    good_night: false,
  });

  // Seçili aktif dinleme kartı
  const [selectedCardId, setSelectedCardId] = useState<GreetingId | null>('hello');

  // Ses durumu
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeechSpeed, setActiveSpeechSpeed] = useState<'normal' | 'slow' | null>(null);

  // Bölüm B (Eşleştirme) Durumları
  const [selectedVisualId, setSelectedVisualId] = useState<GreetingId | null>(null);
  const [selectedPhraseId, setSelectedPhraseId] = useState<GreetingId | null>(null);
  const [matchedIds, setMatchedIds] = useState<GreetingId[]>([]);
  const [matchFeedback, setMatchFeedback] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  // Sayfa kapandığında sesi durdur
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
  const playSpeech = useCallback((text: string, speed: 'normal' | 'slow' = 'normal') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
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
  }, []);

  // Bölüm A: Karta tıklama ve dinleme
  const handleCardClick = (id: GreetingId, autoPlay = true) => {
    setSelectedCardId(id);
    setExploredCards((prev) => ({ ...prev, [id]: true }));
    const item = GREETINGS_DATA.find((g) => g.id === id);
    if (item && autoPlay) {
      playSpeech(item.english, 'normal');
    }
  };

  // Tüm 4 kart dinlendi mi?
  const allExplored = useMemo(() => {
    return Object.values(exploredCards).every(Boolean);
  }, [exploredCards]);

  // Bölüm B'ye geçiş
  const handleStartMatching = () => {
    setActiveSection('sectionB');
    setSelectedVisualId(null);
    setSelectedPhraseId(null);
    setMatchFeedback(null);
  };

  // Eşleştirme Bölümü için Karışık Sıralama (Sabit ama karışık pedagojik dizilim)
  const visualCards = useMemo(() => {
    // Karışık görsel sıralaması: Good morning, Good night, Hello, Goodbye
    return [
      GREETINGS_DATA[1],
      GREETINGS_DATA[3],
      GREETINGS_DATA[0],
      GREETINGS_DATA[2],
    ];
  }, []);

  const phraseCards = useMemo(() => {
    // Karışık ifade sıralaması: Goodbye, Hello, Good night, Good morning
    return [
      GREETINGS_DATA[2],
      GREETINGS_DATA[0],
      GREETINGS_DATA[3],
      GREETINGS_DATA[1],
    ];
  }, []);

  // Eşleştirme Seçim Mantığı
  const checkMatch = useCallback((visualId: GreetingId, phraseId: GreetingId) => {
    if (visualId === phraseId) {
      // Doğru eşleşme!
      const item = GREETINGS_DATA.find((g) => g.id === visualId);
      const newMatches = [...matchedIds, visualId];
      setMatchedIds(newMatches);
      setSelectedVisualId(null);
      setSelectedPhraseId(null);
      setMatchFeedback({
        text: `Tebrikler! "${item?.english}" = "${item?.turkish}" doğru eşleşti! 🎉`,
        isError: false,
      });

      if (item) {
        playSpeech(item.english, 'normal');
      }

      // 4 eşleşme de tamamlandı mı?
      if (newMatches.length === 4) {
        // İlerlemeyi kaydet
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

        setTimeout(() => {
          setActiveSection('completed');
          setMatchFeedback(null);
        }, 350);
      }
    } else {
      // Yanlış eşleşme! İpucu ver ve seçimi sıfırla
      const phraseItem = GREETINGS_DATA.find((g) => g.id === phraseId);
      setMatchFeedback({
        text: `Tekrar dene! İpucu: ${phraseItem?.hint}`,
        isError: true,
      });
      setSelectedVisualId(null);
      setSelectedPhraseId(null);
    }
  }, [campus, missionId, matchedIds, playSpeech]);

  // Görsel kart seçimi
  const handleSelectVisual = (id: GreetingId) => {
    if (matchedIds.includes(id)) return;
    setMatchFeedback(null);

    if (selectedPhraseId) {
      // Zaten bir ifade seçilmişti, şimdi kontrol et!
      checkMatch(id, selectedPhraseId);
    } else {
      setSelectedVisualId(id);
    }
  };

  // İfade kart seçimi
  const handleSelectPhrase = (id: GreetingId) => {
    if (matchedIds.includes(id)) return;
    setMatchFeedback(null);

    if (selectedVisualId) {
      // Zaten bir görsel seçilmişti, şimdi kontrol et!
      checkMatch(selectedVisualId, id);
    } else {
      setSelectedPhraseId(id);
      const item = GREETINGS_DATA.find((g) => g.id === id);
      if (item) {
        playSpeech(item.english, 'normal');
      }
    }
  };

  // Etkinliği baştan başlat
  const handleRestart = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setActiveSection('sectionA');
    setExploredCards({
      hello: false,
      good_morning: false,
      goodbye: false,
      good_night: false,
    });
    setSelectedCardId('hello');
    setMatchedIds([]);
    setSelectedVisualId(null);
    setSelectedPhraseId(null);
    setMatchFeedback(null);
  };

  return (
    <div className="w-full h-full flex flex-col p-2 sm:p-5 bg-gradient-to-b from-[#eaf4f7] via-[#f7faf8] to-[#f4ebe1] select-none overflow-x-hidden">
      {/* Üst Başlık & Aşama Göstergesi */}
      <header className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b-2 border-[#b5d5d3]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md">
            <span className="text-xl" aria-hidden="true">👋</span>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-[var(--seljuk-navy)] flex items-center gap-2 font-serif">
              <span>1. KEŞFET MASASI: GREETINGS (SELAMLAŞMA)</span>
              <span className="text-[10px] bg-sky-100 text-sky-800 border border-sky-300 px-2 py-0.5 rounded-full font-sans font-semibold">
                3. Sınıf
              </span>
            </h1>
            <p className="text-xs text-[var(--campus-ink-muted)]">
              {activeSection === 'sectionA'
                ? 'Dört temel selamlaşma ifadesini dinle ve görsellerini incele.'
                : activeSection === 'sectionB'
                  ? 'Görseller ile doğru İngilizce selamlaşma ifadelerini eşleştir.'
                  : 'Tebrikler! Selamlaşma etkinliğini başarıyla tamamladın.'}
            </p>
          </div>
        </div>

        {/* Adım Durumu Rozetleri */}
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-xs ${
              activeSection === 'sectionA'
                ? 'bg-sky-500 text-white ring-2 ring-sky-300'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}
          >
            A. Keşfet & Dinle {allExplored ? '✓' : `(${Object.values(exploredCards).filter(Boolean).length}/4)`}
          </span>
          <span
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-xs ${
              activeSection === 'sectionB'
                ? 'bg-amber-500 text-white ring-2 ring-amber-300'
                : activeSection === 'completed'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-gray-100 text-gray-500 border border-gray-200'
            }`}
          >
            B. Eşleştir {matchedIds.length === 4 ? '✓' : `(${matchedIds.length}/4)`}
          </span>
        </div>
      </header>

      {/* BÖLÜM A: KEŞFET & DİNLE (4 BÜYÜK GÖRSEL KART) */}
      {activeSection === 'sectionA' && (
        <div className="flex-1 flex flex-col gap-4 max-w-5xl mx-auto w-full">
          {/* 4 Renkli Görsel Kart Izgarası */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 flex-1">
            {GREETINGS_DATA.map((item) => {
              const isSelected = selectedCardId === item.id;
              const isExplored = exploredCards[item.id];

              return (
                <div
                  key={item.id}
                  onClick={() => handleCardClick(item.id)}
                  className={`group relative flex flex-col rounded-2xl overflow-hidden border-3 bg-white shadow-md transition-all cursor-pointer active:scale-[0.98] ${
                    item.borderColor
                  } ${
                    isSelected
                      ? 'ring-4 ring-sky-400 shadow-xl scale-[1.02]'
                      : 'hover:shadow-lg'
                  }`}
                >
                  {/* Kart Görsel Alanı */}
                  <div className={`relative h-40 sm:h-44 p-3 bg-gradient-to-b ${item.bgGradient} flex items-center justify-center overflow-hidden`}>
                    <GreetingIllustration id={item.id} />

                    {/* İncelendi Rozeti */}
                    {isExplored && (
                      <div className="absolute top-2.5 right-2.5 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                        <span>Dinlendi</span>
                      </div>
                    )}

                    {/* Aktif Dinleme Işıması */}
                    {isSelected && isSpeaking && (
                      <div className="absolute inset-0 bg-sky-400/20 pointer-events-none animate-pulse" />
                    )}
                  </div>

                  {/* Kart Metin ve Anlam Alanı */}
                  <div className="p-3.5 flex flex-col justify-between flex-1 bg-white border-t border-gray-100 space-y-2">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        {item.visualTitle}
                      </p>
                      <h2 className="text-xl sm:text-2xl font-black text-[var(--seljuk-navy)] font-serif tracking-wide pt-0.5">
                        {item.english}
                      </h2>
                      <p className="text-xs font-semibold text-sky-800">
                        Türkçe: <strong className="text-gray-900 font-bold">{item.turkish}</strong>
                      </p>
                    </div>

                    {/* Kart Dinleme Butonları */}
                    <div className="pt-2 border-t border-gray-100 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCardId(item.id);
                          setExploredCards((prev) => ({ ...prev, [item.id]: true }));
                          playSpeech(item.english, 'normal');
                        }}
                        className={`flex-1 min-h-[38px] px-2.5 py-1.5 rounded-xl font-bold text-xs inline-flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95 ${
                          isSelected && isSpeaking && activeSpeechSpeed === 'normal'
                            ? 'bg-sky-600 text-white ring-2 ring-sky-300'
                            : 'bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200'
                        }`}
                        aria-label={`"${item.english}" ifadesini dinle`}
                      >
                        <Volume2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Dinle</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCardId(item.id);
                          setExploredCards((prev) => ({ ...prev, [item.id]: true }));
                          playSpeech(item.english, 'slow');
                        }}
                        className={`min-h-[38px] px-2.5 py-1.5 rounded-xl font-bold text-xs inline-flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-all active:scale-95 ${
                          isSelected && isSpeaking && activeSpeechSpeed === 'slow'
                            ? 'bg-amber-600 text-white ring-2 ring-amber-300'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                        }`}
                        aria-label={`"${item.english}" ifadesini yavaş dinle`}
                      >
                        <span aria-hidden="true">🐢</span>
                        <span>Yavaş</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bölüm A Alt Çubuğu: Eşleştirmeye Geçiş */}
          <div className="p-3 sm:p-4 rounded-2xl bg-white border-2 border-[#b5d5d3] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-xs sm:text-sm font-semibold text-gray-800">
                {allExplored
                  ? '🎉 Dört selamlaşma kartını da keşfettin! Şimdi eşleştirme bölümüne geçebilirsin.'
                  : 'Lütfen yukarıdaki 4 kartın tamamına dokunup İngilizce seslerini dinle.'}
              </p>
            </div>

            <button
              type="button"
              disabled={!allExplored}
              onClick={handleStartMatching}
              className={`min-h-[46px] px-6 py-2.5 rounded-xl font-bold text-sm inline-flex items-center gap-2 shadow-md transition-all active:scale-95 ${
                allExplored
                  ? 'bg-sky-600 hover:bg-sky-700 text-white ring-4 ring-sky-200 cursor-pointer animate-pulse'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
              }`}
              aria-label="Bölüm B Eşleştirme aşamasına geç"
            >
              <span>Eşleştirme Bölümüne Geç</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* BÖLÜM B: EŞLEŞTİRME (GÖRSEL - İNGİLİZCE İFADE EŞLEŞTİRMESİ) */}
      {activeSection === 'sectionB' && (
        <div className="flex-1 flex flex-col gap-4 max-w-5xl mx-auto w-full animate-in fade-in duration-300">
          {/* Geri Bildirim ve İpucu Çubuğu */}
          {matchFeedback && (
            <div
              role="alert"
              className={`p-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-between gap-2 shadow-sm transition-all ${
                matchFeedback.isError
                  ? 'bg-rose-50 text-rose-800 border-2 border-rose-300 animate-pulse'
                  : 'bg-emerald-50 text-emerald-800 border-2 border-emerald-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>{matchFeedback.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setMatchFeedback(null)}
                className="text-xs underline text-gray-600 hover:text-black cursor-pointer"
              >
                Kapat
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            {/* SOL SÜTUN: 4 GÖRSEL KART */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-gray-200">
                <h3 className="text-xs font-bold text-[var(--seljuk-navy)] uppercase tracking-wider flex items-center gap-1.5">
                  <span>1. Görseller</span>
                  <span className="text-[10px] text-gray-500 font-normal">(Dokun ve seç)</span>
                </h3>
                <span className="text-xs text-sky-700 font-semibold">
                  {matchedIds.length} / 4 Eşleşti
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {visualCards.map((item) => {
                  const isMatched = matchedIds.includes(item.id);
                  const isSelected = selectedVisualId === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={isMatched}
                      onClick={() => handleSelectVisual(item.id)}
                      className={`relative flex flex-col rounded-xl overflow-hidden border-3 bg-white p-2 shadow-sm transition-all text-left cursor-pointer outline-none active:scale-95 ${
                        isMatched
                          ? 'border-emerald-500 opacity-60 bg-emerald-50/50 cursor-default'
                          : isSelected
                            ? 'border-sky-500 ring-4 ring-sky-300 shadow-md scale-[1.02]'
                            : 'border-gray-200 hover:border-sky-400 hover:shadow-md'
                      }`}
                      aria-label={`${item.visualTitle} görselini seç`}
                    >
                      {/* Görsel */}
                      <div className={`w-full h-24 sm:h-28 rounded-lg bg-gradient-to-b ${item.bgGradient} flex items-center justify-center p-1.5 overflow-hidden`}>
                        <GreetingIllustration id={item.id} />
                      </div>

                      <div className="pt-2 text-center">
                        <p className="text-xs font-bold text-gray-800 line-clamp-1">
                          {item.visualTitle}
                        </p>
                      </div>

                      {/* Eşleşti Rozeti */}
                      {isMatched && (
                        <div className="absolute inset-0 bg-emerald-900/20 backdrop-blur-2xs flex items-center justify-center">
                          <div className="bg-emerald-600 text-white rounded-full p-1.5 shadow-lg">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SAĞ SÜTUN: 4 İNGİLİZCE İFADE KARTI */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-gray-200">
                <h3 className="text-xs font-bold text-[var(--seljuk-navy)] uppercase tracking-wider flex items-center gap-1.5">
                  <span>2. İngilizce İfadeler</span>
                  <span className="text-[10px] text-gray-500 font-normal">(Dokun ve eşleştir)</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {phraseCards.map((item) => {
                  const isMatched = matchedIds.includes(item.id);
                  const isSelected = selectedPhraseId === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={isMatched}
                      onClick={() => handleSelectPhrase(item.id)}
                      aria-label={`"${item.english}" ifadesini seç`}
                      className={`relative w-full min-h-[58px] sm:min-h-[64px] p-3 sm:p-3.5 rounded-xl border-3 bg-white shadow-sm flex items-center justify-between gap-3 transition-all cursor-pointer outline-none active:scale-95 text-left ${
                        isMatched
                          ? 'border-emerald-500 bg-emerald-50/60 opacity-60 cursor-default'
                          : isSelected
                            ? 'border-sky-500 ring-4 ring-sky-300 shadow-md bg-sky-50/70 scale-[1.01]'
                            : 'border-gray-200 hover:border-sky-400 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${item.badgeBg} text-white flex items-center justify-center font-bold text-sm shadow-inner`}>
                          {isMatched ? '✓' : 'Aa'}
                        </div>
                        <div>
                          <p className="text-lg sm:text-xl font-black text-[var(--seljuk-navy)] font-serif">
                            "{item.english}"
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {isMatched ? item.turkish : 'Anlamı eşleştirince açılacak'}
                          </p>
                        </div>
                      </div>

                      {/* Ses Dinleme Rozeti */}
                      <div className="flex items-center gap-1">
                        <div
                          className="min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-100 text-sky-900 inline-flex items-center gap-1"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Dinle</span>
                        </div>
                      </div>

                      {/* Eşleşti Rozeti */}
                      {isMatched && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BÖLÜM C: ETKİNLİK BAŞARIYLA TAMAMLANDI EKRANI */}
      {activeSection === 'completed' && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-xl mx-auto w-full text-center space-y-4 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-emerald-900 font-serif">
              🎉 Harika! 4 Selamlaşma İfadesini Başarıyla Eşleştirdin!
            </h2>
            <p className="text-xs sm:text-sm text-[var(--campus-ink-muted)]">
              "Greetings" konusunu tamamladın. Keşfet Masası görevi başarıyla kaydedildi.
            </p>
          </div>

          {/* 4 İfadenin Özeti */}
          <div className="w-full p-3.5 rounded-2xl bg-white border border-emerald-200 shadow-xs text-left space-y-2">
            <p className="text-xs font-bold text-[var(--seljuk-navy)] flex items-center gap-1.5 pb-1 border-b border-gray-100">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Öğrendiğin Selamlaşma İfadeleri:</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {GREETINGS_DATA.map((item) => (
                <div key={item.id} className="p-2 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-gray-900">{item.english}</span>
                    <p className="text-[11px] text-gray-500">{item.turkish}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => playSpeech(item.english, 'normal')}
                    className="p-1.5 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-800 transition-colors"
                    aria-label={`"${item.english}" dinle`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Eylem Düğmeleri: KESİNLİKLE "Öğren Masasına Git" butonu YOKTUR! */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onExitToClassroom}
              className="min-h-[46px] px-6 py-2.5 rounded-xl bg-[var(--seljuk-navy)] hover:bg-[#1a3848] text-[#fef08a] font-bold text-sm inline-flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
              aria-label="Masadan kalk ve sınıfa dön"
            >
              <ArrowLeft className="w-4 h-4 text-[#fef08a]" />
              <span>Masadan Kalk / Sınıfa Dön</span>
            </button>

            <button
              type="button"
              onClick={handleRestart}
              className="min-h-[46px] px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Etkinliği Tekrar Oyna</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
