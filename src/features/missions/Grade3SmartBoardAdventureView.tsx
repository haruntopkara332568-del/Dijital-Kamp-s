import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Volume2,
  CheckCircle2,
  RotateCcw,
  ArrowLeft,
  Moon,
  Clock,
  Award,
  HelpCircle,
  Compass,
  Footprints,
} from 'lucide-react';
import { useOptionalCampus } from '@/src/app/CampusProviders';

export interface Grade3SmartBoardAdventureViewProps {
  onExitToClassroom: () => void;
}

type SceneId =
  | 'scene1_arrival'
  | 'scene2_meeting'
  | 'scene3_entry'
  | 'scene4_farewell'
  | 'adventure_completed';

interface SceneStepConfig {
  id: SceneId;
  sceneTitle: string;
  timeLabel: string;
  timeOfDay: 'morning' | 'daylight' | 'golden_hour' | 'night';
  speakerName: string;
  speakerExpression: string;
  speakerTurkish: string;
  narrationText: string;
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
  // 1. SAHNE: Sultanhanı Kervansarayı'nın Önü (Meydandan Kapıya Yürüyüş)
  {
    id: 'scene1_arrival',
    sceneTitle: '1. Sahne — Kervansaraya Varış',
    timeLabel: 'Sabah Vakti • Güneşli Taş Meydan',
    timeOfDay: 'morning',
    speakerName: 'Anlatıcı',
    speakerExpression: 'Welcome to Sultanhani!',
    speakerTurkish: "Sultanhanı'na Hoş Geldin!",
    narrationText:
      "Aksaray Sultanhanı Kervansarayı'na hoş geldin! Görkemli Selçuklu Taç Kapısı'na doğru yaklaşıyorsun. Kapının yanında elinde gezi haritası tutan bir arkadaşın var.",
    promptText: "Kapıya doğru yürü ve gezi haritasını inceleyen arkadaşa yaklaş:",
    options: [
      { id: 'approach_btn', text: 'Arkadaşa Yaklaş', isCorrect: true },
    ],
    correctFeedback: "Kapının önüne geldin! Arkadaşın haritadan başını kaldırdı ve seninle göz teması kurdu.",
    wrongHint: "Arkadaşa yaklaşmak için 'Arkadaşa Yaklaş' düğmesine dokun.",
  },

  // 2. SAHNE: Taç Kapının Önünde Karşılaşma (Turist Çocuk ile Tanışma)
  {
    id: 'scene2_meeting',
    sceneTitle: '2. Sahne — Taç Kapının Önünde Karşılaşma',
    timeLabel: 'Öğle Vakti • Selçuklu Taç Kapısı',
    timeOfDay: 'daylight',
    speakerName: 'Leo (Gezgin Çocuk)',
    speakerExpression: 'Hello!',
    speakerTurkish: 'Merhaba!',
    narrationText:
      "Kapının yanında tek başına duran turist arkadaşın Leo, haritadan başını kaldırıp sana gülümsedi ve el sallayarak 'Hello!' dedi.",
    promptText: "Leo sana 'Hello!' dedi. Sen de ona İngilizce merhaba de:",
    options: [
      { id: 'opt_hello', text: 'Hello!', isCorrect: true },
      { id: 'opt_goodbye', text: 'Goodbye!', isCorrect: false },
    ],
    correctFeedback:
      'Harika! "Hello!" diyerek tanışma selamı verdin. Leo neşeyle gülümsedi ve haritasıyla kervansarayı birlikte gezmeye davet etti! 👋🗺️',
    wrongHint:
      'Yeni karşılaştığımız bir arkadaşa selam vermek için "Hello!" (Merhaba) deriz. "Goodbye!" ise ayrılırken söylenir.',
  },

  // 3. SAHNE: Kapıdan İçeri Giriş (Birlikte Eşik Aşıp Avluya Geçiş)
  {
    id: 'scene3_entry',
    sceneTitle: '3. Sahne — Kapıdan İçeri Giriş',
    timeLabel: 'Öğle Vakti • Anıtsal Portal ve Eşik',
    timeOfDay: 'daylight',
    speakerName: 'Anlatıcı',
    speakerExpression: 'Let’s explore together!',
    speakerTurkish: 'Birlikte keşfedelim!',
    narrationText:
      "İki yeni arkadaş, asırlık Selçuklu Taç Kapısı'nın taş eşiğinden geçerek kervansarayın geniş ve tarihi avlusuna birlikte adım atıyor...",
    promptText: "Leo ile yan yana yürüyerek taç kapının eşiğini aş ve iç avluya adım at:",
    options: [
      { id: 'enter_btn', text: 'Eşiği Aş ve Avluya Geç', isCorrect: true },
    ],
    correctFeedback:
      "Muhteşem! İki arkadaş taç kapının serin gölgesinden geçip Sultanhanı'nın geniş revaklı iç avlusuna ulaştı.",
    wrongHint: "Avluya geçmek için 'Eşiği Aş ve Avluya Geç' düğmesine dokun.",
  },

  // 4. SAHNE: Avluda Vedalaşma (Akşam/Gece Işığı ve Ayrılış)
  {
    id: 'scene4_farewell',
    sceneTitle: '4. Sahne — Avluda Vedalaşma',
    timeLabel: 'Gece Vakti • Yıldızlı Selçuklu Avlusu',
    timeOfDay: 'night',
    speakerName: 'Leo (Gezgin Çocuk)',
    speakerExpression: 'Good night!',
    speakerTurkish: 'İyi geceler!',
    narrationText:
      "Gezinin sonuna gelindi ve kervansarayın avlusunda akşam ışığı yerini yıldızlı geceye bıraktı. Leo durup sana döndü ve 'Good night!' diyerek el salladı.",
    promptText: "Gezi sona erdi ve gece oldu. Leo'ya İngilizce iyi geceler dile:",
    options: [
      { id: 'opt_night', text: 'Good night!', isCorrect: true },
      { id: 'opt_morning', text: 'Good morning!', isCorrect: false },
    ],
    correctFeedback:
      'Tebrikler! "Good night!" diyerek arkadaşınla gece vedasını yaptın. İki arkadaş el sallayarak ayrı yönlere uğurlandı. 🌙⭐',
    wrongHint:
      'Gece ayrılırken ve uyku vakti geldiğinde "Good night!" (İyi geceler) deriz. "Good morning!" ise sabah söylenir.',
  },
];

/* -------------------------------------------------------------------------- */
/*                        2.5D KARAKTER SPRITE'LARI                          */
/* -------------------------------------------------------------------------- */

interface DenizCharacterProps {
  action: 'walk_square' | 'turn_to_leo' | 'greet_hello' | 'walk_threshold' | 'farewell_night' | 'walk_away_left' | 'idle';
  isSpeaking: boolean;
}

/**
 * Kampüs Öğrencisi (Deniz)
 * Görünüm: Mevcut kampüs karakteriyle birebir uyumlu
 * (Turkuaz yelek, Selçuklu sekizgen yıldız rozeti, beyaz gömlek, mavi pantolon, sırt çantası, kahverengi saç)
 */
function DenizCharacter({ action, isSpeaking }: DenizCharacterProps) {
  const isWalking =
    action === 'walk_square' ||
    action === 'walk_threshold' ||
    action === 'walk_away_left';

  const isBackView = action === 'walk_threshold';
  const isWaving = action === 'greet_hello' || action === 'farewell_night';
  const isFacingRight = action === 'turn_to_leo';

  return (
    <div
      className={`relative flex flex-col items-center select-none transition-transform duration-700 ${
        action === 'walk_square'
          ? 'translate-x-0'
          : action === 'walk_away_left'
            ? '-translate-x-32 opacity-0'
            : 'translate-x-0'
      }`}
    >
      {/* Karakter İsim Rozeti */}
      <span className="mb-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-700 text-white shadow-md border border-emerald-300">
        🎒 Deniz (Kampüs Öğrencisi)
      </span>

      {/* SVG Karakter Gövdesi */}
      <div className="w-24 h-36 sm:w-28 sm:h-42 drop-shadow-2xl">
        <svg
          viewBox="0 0 100 140"
          className={`w-full h-full ${isFacingRight ? 'scale-x-[-1]' : ''}`}
        >
          {/* Zemin Gölgesi */}
          <ellipse
            cx="50"
            cy="134"
            rx={isWalking ? 24 : 28}
            ry="6"
            fill="rgba(0,0,0,0.35)"
            className={isWalking ? 'animate-pulse' : ''}
          />

          {/* Ayaklar ve Ayakkabılar (Yürüme adımları veya sabit duruş) */}
          <g className={isWalking ? 'deniz-walk-legs' : ''}>
            {/* Sol Bacak & Ayak */}
            <rect
              x="36"
              y="108"
              width="10"
              height="20"
              rx="4"
              fill="#1e3a8a"
              className={isWalking ? 'deniz-left-leg' : ''}
            />
            <ellipse
              cx="40"
              cy="129"
              rx="7"
              ry="4"
              fill="#0f172a"
              className={isWalking ? 'deniz-left-foot' : ''}
            />

            {/* Sağ Bacak & Ayak */}
            <rect
              x="54"
              y="108"
              width="10"
              height="20"
              rx="4"
              fill="#1e3a8a"
              className={isWalking ? 'deniz-right-leg' : ''}
            />
            <ellipse
              cx="58"
              cy="129"
              rx="7"
              ry="4"
              fill="#0f172a"
              className={isWalking ? 'deniz-right-foot' : ''}
            />
          </g>

          {/* Pantolon Gövdesi */}
          <rect x="34" y="86" width="32" height="26" rx="4" fill="#1e3a8a" />
          <path d="M 50,96 L 50,112" stroke="#0f172a" strokeWidth="1.5" />

          {/* Gövde ve Kıyafet */}
          {isBackView ? (
            /* ARKA GÖRÜNÜM: Taş Kapıdan Geçerken */
            <g>
              {/* Yelek Sırtı */}
              <rect x="32" y="48" width="36" height="42" rx="6" fill="#0e768a" />
              {/* Kahverengi Sırt Çantası */}
              <rect x="34" y="52" width="32" height="34" rx="6" fill="#78350f" stroke="#451a03" strokeWidth="2" />
              <rect x="38" y="60" width="24" height="18" rx="3" fill="#92400e" />
              <path d="M 44,52 L 44,86 M 56,52 L 56,86" stroke="#451a03" strokeWidth="2.5" />
            </g>
          ) : (
            /* ÖN GÖRÜNÜM: Turkuaz Yelek ve Beyaz Gömlek */
            <g>
              <rect x="32" y="48" width="36" height="42" rx="6" fill="#0e768a" />
              {/* Beyaz Gömlek Orta Şeridi */}
              <rect x="42" y="48" width="16" height="42" fill="#f8fafc" />
              <path d="M 50,48 L 50,90" stroke="#cbd5e1" strokeWidth="1.5" />
              {/* Kırmızı/Bordo Kravat & Yaka İpi */}
              <path d="M 48,50 L 50,62 L 52,50 Z" fill="#b91c1c" />
              {/* Selçuklu Sekizgen Altın Yıldız Rozeti */}
              <circle cx="40" cy="62" r="3.5" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
              {/* Sırt Çantası Ön Askıları */}
              <path d="M 36,49 L 37,88" stroke="#78350f" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M 64,49 L 63,88" stroke="#78350f" strokeWidth="2.8" strokeLinecap="round" />
            </g>
          )}

          {/* Kollar: El Sallama veya Yürüme Hareketi */}
          {isWaving ? (
            <g className="animate-pulse">
              <path
                d="M 32,54 Q 20,68 22,82"
                stroke="#0e768a"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="22" cy="82" r="4" fill="#fbcfe8" />
              {/* Havaya Kalkan ve Sallanan Kol */}
              <path
                d="M 68,54 Q 84,36 82,20"
                stroke="#0e768a"
                strokeWidth="6.5"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="82" cy="20" r="4.5" fill="#fbcfe8" />
            </g>
          ) : isWalking ? (
            <g>
              {/* Yürürken Salınan Kollar */}
              <path
                d="M 32,54 Q 22,70 26,86"
                stroke="#0e768a"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
                className="deniz-left-arm"
              />
              <circle cx="26" cy="86" r="4" fill="#fbcfe8" />
              <path
                d="M 68,54 Q 78,70 74,86"
                stroke="#0e768a"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
                className="deniz-right-arm"
              />
              <circle cx="74" cy="86" r="4" fill="#fbcfe8" />
            </g>
          ) : (
            <g>
              {/* Bekleme / Duruş Hali */}
              <path
                d="M 32,54 Q 24,70 26,84"
                stroke="#0e768a"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="26" cy="84" r="4" fill="#fbcfe8" />
              <path
                d="M 68,54 Q 76,70 74,84"
                stroke="#0e768a"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="74" cy="84" r="4" fill="#fbcfe8" />
            </g>
          )}

          {/* Boyun ve Baş */}
          <rect x="44" y="40" width="12" height="10" fill="#fbcfe8" />
          <circle cx="50" cy="28" r="17" fill="#fbcfe8" />

          {/* Saç: Kahverengi Çocuk Saçı */}
          {isBackView ? (
            <path
              d="M 32,28 Q 50,8 68,28 Q 50,42 32,28 Z"
              fill="#451a03"
            />
          ) : (
            <g>
              <path
                d="M 32,26 Q 50,8 68,26 Q 50,18 32,26 Z"
                fill="#451a03"
              />
              <circle cx="34" cy="24" r="5" fill="#451a03" />
              <circle cx="66" cy="24" r="5" fill="#451a03" />
            </g>
          )}

          {/* Yüz Hatları (Sadece ön ve yan görüşte) */}
          {!isBackView && (
            <g>
              {/* Gözler */}
              <circle cx="44" cy="28" r="2.2" fill="#0f172a" />
              <circle cx="56" cy="28" r="2.2" fill="#0f172a" />
              {/* Ağız (Konuşurken hareketli) */}
              {isSpeaking ? (
                <ellipse cx="50" cy="35" rx="3.5" ry="3" fill="#b91c1c" className="animate-pulse" />
              ) : (
                <path
                  d="M 45,34 Q 50,39 55,34"
                  stroke="#b91c1c"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              )}
              {/* Gülümseyen Yanak Parıltıları */}
              <ellipse cx="40" cy="32" rx="3" ry="1.5" fill="#f43f5e" opacity="0.35" />
              <ellipse cx="60" cy="32" rx="3" ry="1.5" fill="#f43f5e" opacity="0.35" />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}

interface TouristKidProps {
  action: 'stand_with_map' | 'greet_hello' | 'walk_threshold' | 'farewell_night' | 'walk_away_right' | 'idle';
  isSpeaking: boolean;
}

/**
 * Yabancı Turist Çocuk (Leo)
 * Görünüm: Yaşıt yabancı turist çocuk, kâşif şapkası, bej/turuncu gezgin kıyafeti,
 * ve elinde küçük mavi-beyaz katlanmış gezi haritası tutar.
 */
function TouristKid({ action, isSpeaking }: TouristKidProps) {
  const isWalking =
    action === 'walk_threshold' || action === 'walk_away_right';

  const isBackView = action === 'walk_threshold';
  const isWaving = action === 'greet_hello' || action === 'farewell_night';

  return (
    <div
      className={`relative flex flex-col items-center select-none transition-transform duration-700 ${
        action === 'walk_away_right' ? 'translate-x-32 opacity-0' : 'translate-x-0'
      }`}
    >
      {/* Karakter İsim Rozeti */}
      <span className="mb-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-600 text-white shadow-md border border-amber-300 flex items-center gap-1">
        <Compass className="w-2.5 h-2.5 text-amber-200" />
        <span>Leo (Gezgin Arkadaş)</span>
      </span>

      {/* SVG Karakter Gövdesi */}
      <div className="w-24 h-36 sm:w-28 sm:h-42 drop-shadow-2xl">
        <svg viewBox="0 0 100 140" className="w-full h-full">
          {/* Zemin Gölgesi */}
          <ellipse
            cx="50"
            cy="134"
            rx={isWalking ? 24 : 28}
            ry="6"
            fill="rgba(0,0,0,0.35)"
            className={isWalking ? 'animate-pulse' : ''}
          />

          {/* Ayaklar ve Ayakkabılar */}
          <g className={isWalking ? 'leo-walk-legs' : ''}>
            <rect x="36" y="108" width="10" height="20" rx="4" fill="#475569" />
            <ellipse cx="40" cy="129" rx="7" ry="4" fill="#1e293b" />
            <rect x="54" y="108" width="10" height="20" rx="4" fill="#475569" />
            <ellipse cx="58" cy="129" rx="7" ry="4" fill="#1e293b" />
          </g>

          {/* Gezgin Şortu / Pantolonu */}
          <rect x="34" y="86" width="32" height="26" rx="4" fill="#78716c" />
          <path d="M 50,96 L 50,112" stroke="#44403c" strokeWidth="1.5" />

          {/* Gövde ve Kıyafet (Turuncu Macera Tişörtü ve Bej Yelek) */}
          <rect x="32" y="48" width="36" height="42" rx="6" fill="#f97316" />
          {/* Bej Yelek Yanları */}
          <path d="M 32,48 L 42,48 L 40,90 L 32,90 Z" fill="#d6d3d1" />
          <path d="M 68,48 L 58,48 L 60,90 L 68,90 Z" fill="#d6d3d1" />
          <path d="M 50,48 L 50,90" stroke="#ea580c" strokeWidth="1.5" />

          {/* Sol Kol: ELİNDE GEZİ HARİTASI TUTAR 🗺️ */}
          <g>
            <path
              d="M 32,54 Q 20,68 28,76"
              stroke="#f97316"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="28" cy="76" r="3.8" fill="#fed7aa" />

            {/* AÇIK GEZİ HARİTASI (Illustrated Travel Map) */}
            <g transform="translate(14, 66) rotate(-12)">
              {/* Harita Kağıdı */}
              <rect
                x="0"
                y="0"
                width="20"
                height="15"
                rx="1.5"
                fill="#f8fafc"
                stroke="#0284c7"
                strokeWidth="1.2"
              />
              {/* Harita Katlama ve Rota Çizgileri */}
              <path d="M 7,0 L 7,15 M 13,0 L 13,15" stroke="#bae6fd" strokeWidth="0.8" />
              <path
                d="M 3,4 Q 8,10 16,5"
                stroke="#e11d48"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
              />
              {/* Minik Pusula / Yıldız İkonu */}
              <circle cx="16" cy="11" r="2" fill="#f59e0b" />
            </g>
          </g>

          {/* Sağ Kol: El Sallama veya Normal Duruş */}
          {isWaving ? (
            <g className="animate-pulse">
              <path
                d="M 68,54 Q 84,36 82,18"
                stroke="#f97316"
                strokeWidth="6.5"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="82" cy="18" r="4.5" fill="#fed7aa" />
            </g>
          ) : isWalking ? (
            <g>
              <path
                d="M 68,54 Q 78,70 72,86"
                stroke="#f97316"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="72" cy="86" r="4" fill="#fed7aa" />
            </g>
          ) : (
            <g>
              <path
                d="M 68,54 Q 76,68 74,82"
                stroke="#f97316"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="74" cy="82" r="4" fill="#fed7aa" />
            </g>
          )}

          {/* Boyun ve Baş */}
          <rect x="44" y="40" width="12" height="10" fill="#fed7aa" />
          <circle cx="50" cy="28" r="17" fill="#fed7aa" />

          {/* Sarı / Kumral Saç */}
          <path d="M 32,26 Q 50,8 68,26 Q 50,16 32,26 Z" fill="#d97706" />

          {/* Kâşif Gezgin Şapkası (Safari Sun Hat) */}
          <ellipse
            cx="50"
            cy="18"
            rx="24"
            ry="7"
            fill="#fde047"
            stroke="#ca8a04"
            strokeWidth="1.8"
          />
          <path d="M 36,18 Q 50,2 64,18 Z" fill="#eab308" />
          <rect x="36" y="16" width="28" height="3" fill="#b45309" />

          {/* Yüz Hatları (Gözler, gülümseme) */}
          {!isBackView && (
            <g>
              <circle cx="44" cy="28" r="2.2" fill="#0f172a" />
              <circle cx="56" cy="28" r="2.2" fill="#0f172a" />
              {isSpeaking ? (
                <ellipse cx="50" cy="35" rx="3.5" ry="3" fill="#b91c1c" className="animate-pulse" />
              ) : (
                <path
                  d="M 45,34 Q 50,39 55,34"
                  stroke="#b91c1c"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              )}
              <ellipse cx="40" cy="32" rx="3" ry="1.5" fill="#f43f5e" opacity="0.35" />
              <ellipse cx="60" cy="32" rx="3" ry="1.5" fill="#f43f5e" opacity="0.35" />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                       ANA MACERA GÖRÜNÜM BİLEŞENİ                          */
/* -------------------------------------------------------------------------- */

export function Grade3SmartBoardAdventureView({
  onExitToClassroom,
}: Grade3SmartBoardAdventureViewProps) {
  const campus = useOptionalCampus();

  // Sahne Adımı (0: Meydandan Kapıya, 1: Karşılaşma, 2: Kapıdan Giriş, 3: Avluda Vedalaşma, 4: Tamamlandı)
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const isLockedRef = useRef(false);

  // Ses Durumu
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingRole, setSpeakingRole] = useState<'leo' | 'deniz' | null>(null);

  // Animasyon Durumları
  const [denizAction, setDenizAction] = useState<DenizCharacterProps['action']>('walk_square');
  const [leoAction, setLeoAction] = useState<TouristKidProps['action']>('stand_with_map');

  // Zamanlayıcı referansı
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentConfig = SCENE_CONFIGS[currentSceneIndex] ?? SCENE_CONFIGS[0];
  const isCompletedScene = currentSceneIndex >= SCENE_CONFIGS.length;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Web Speech API ile Çocuk Dostu Telaffuz Sentezi
  const playSpeech = useCallback(
    (text: string, speaker: 'leo' | 'deniz', speed: 'normal' | 'slow' = 'normal') => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = speed === 'slow' ? 0.65 : speaker === 'leo' ? 0.85 : 0.9;
        utterance.pitch = speaker === 'leo' ? 1.25 : 1.15;

        setIsSpeaking(true);
        setSpeakingRole(speaker);

        utterance.onend = () => {
          setIsSpeaking(false);
          setSpeakingRole(null);
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
          setSpeakingRole(null);
        };

        window.speechSynthesis.speak(utterance);
      } catch {
        setIsSpeaking(false);
        setSpeakingRole(null);
      }
    },
    [],
  );

  // Sahne Başlangıç Animasyonları ve Karakter Davranışları
  useEffect(() => {
    if (isCompletedScene) return;

    clearTimer();

    if (currentConfig.id === 'scene1_arrival') {
      const tInit = setTimeout(() => {
        setDenizAction('walk_square');
        setLeoAction('stand_with_map');
      }, 0);

      const tWalk = setTimeout(() => {
        setDenizAction('turn_to_leo');
      }, 1500);

      return () => {
        clearTimeout(tInit);
        clearTimeout(tWalk);
      };
    } else if (currentConfig.id === 'scene2_meeting') {
      const tInit = setTimeout(() => {
        setDenizAction('turn_to_leo');
        setLeoAction('greet_hello');
      }, 0);

      const tLeoGreet = setTimeout(() => {
        playSpeech('Hello!', 'leo', 'normal');
      }, 600);

      return () => {
        clearTimeout(tInit);
        clearTimeout(tLeoGreet);
      };
    } else if (currentConfig.id === 'scene3_entry') {
      const tInit = setTimeout(() => {
        setDenizAction('walk_threshold');
        setLeoAction('walk_threshold');
      }, 0);

      return () => {
        clearTimeout(tInit);
      };
    } else if (currentConfig.id === 'scene4_farewell') {
      const tInit = setTimeout(() => {
        setDenizAction('idle');
        setLeoAction('farewell_night');
      }, 0);

      const tLeoNight = setTimeout(() => {
        playSpeech('Good night!', 'leo', 'normal');
      }, 700);

      return () => {
        clearTimeout(tInit);
        clearTimeout(tLeoNight);
      };
    }
  }, [currentSceneIndex, currentConfig.id, isCompletedScene, playSpeech, clearTimer]);

  // Öğrencinin Cevap / Aksiyon Seçimi
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

      // Sahneye göre seslendirme ve karakter jesti
      if (currentConfig.id === 'scene1_arrival') {
        setDenizAction('turn_to_leo');
        timerRef.current = setTimeout(() => {
          advanceToNextScene();
        }, 1200);
      } else if (currentConfig.id === 'scene2_meeting') {
        setDenizAction('greet_hello');
        playSpeech('Hello!', 'deniz', 'normal');
        setLeoAction('greet_hello');

        timerRef.current = setTimeout(() => {
          advanceToNextScene();
        }, 1800);
      } else if (currentConfig.id === 'scene3_entry') {
        setDenizAction('walk_threshold');
        setLeoAction('walk_threshold');

        timerRef.current = setTimeout(() => {
          advanceToNextScene();
        }, 1600);
      } else if (currentConfig.id === 'scene4_farewell') {
        setDenizAction('farewell_night');
        playSpeech('Good night!', 'deniz', 'normal');

        timerRef.current = setTimeout(() => {
          // İki çocuk ayrı yönlere yürüyerek sahneden ayrılır
          setDenizAction('walk_away_left');
          setLeoAction('walk_away_right');

          timerRef.current = setTimeout(() => {
            advanceToNextScene();
          }, 1800);
        }, 1400);
      }
    } else {
      // Yanlış Seçim: Cezasız pedagojik ipucu
      setFeedback({
        text: currentConfig.wrongHint,
        isError: true,
      });

      playSpeech(option.text, 'deniz', 'slow');

      timerRef.current = setTimeout(() => {
        setSelectedOptionId(null);
        setFeedback(null);
      }, 2400);
    }
  };

  // Sonraki Sahneye Geçiş
  const advanceToNextScene = () => {
    clearTimer();
    setSelectedOptionId(null);
    setFeedback(null);
    setIsLocked(false);
    isLockedRef.current = false;

    const nextIdx = currentSceneIndex + 1;
    setCurrentSceneIndex(nextIdx);

    if (nextIdx >= SCENE_CONFIGS.length) {
      // Macerayı Tamamla! 4 masanın aşamalarını koruyarak completed: true kaydet
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

  // Macerayı Baştan Başlat
  const handleRestart = () => {
    clearTimer();
    setCurrentSceneIndex(0);
    setSelectedOptionId(null);
    setFeedback(null);
    setIsLocked(false);
    isLockedRef.current = false;
    setDenizAction('walk_square');
    setLeoAction('stand_with_map');
  };

  // Sayfadan çıkışta sesi durdur
  useEffect(() => {
    return () => {
      clearTimer();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [clearTimer]);

  return (
    <div className="relative w-full h-full min-h-[600px] flex flex-col bg-[#0b1424] text-white select-none overflow-hidden font-sans">
      {/* İÇ CSS ANİMASYONLARI (Gerçekçi Yürüme ve El Sallama Döngüleri) */}
      <style>{`
        @keyframes denizLegLeft {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(18deg) translateY(-2px); }
        }
        @keyframes denizLegRight {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-18deg) translateY(-2px); }
        }
        @keyframes denizArmSwing {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(20deg); }
        }
        .deniz-left-leg {
          transform-origin: 41px 108px;
          animation: denizLegLeft 0.5s ease-in-out infinite;
        }
        .deniz-right-leg {
          transform-origin: 59px 108px;
          animation: denizLegRight 0.5s ease-in-out infinite;
        }
        .deniz-left-arm {
          transform-origin: 32px 54px;
          animation: denizArmSwing 0.5s ease-in-out infinite;
        }
        .deniz-right-arm {
          transform-origin: 68px 54px;
          animation: denizArmSwing 0.5s ease-in-out infinite reverse;
        }
        @keyframes cameraZoomThreshold {
          0% { transform: scale(1); }
          100% { transform: scale(1.08) translateY(2%); }
        }
        .camera-zoom-active {
          animation: cameraZoomThreshold 4s ease-out forwards;
        }
      `}</style>

      {/* ÜST BAŞLIK VE ADIM BİLGİSİ BARI */}
      <div className="shrink-0 px-4 py-2.5 bg-[#080e1a]/95 border-b border-amber-500/30 flex items-center justify-between gap-3 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
            <Compass className="w-5 h-5 text-amber-400" />
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

      {/* SİNEMATİK SAHNE VE GÖRSEL KATMAN */}
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

          {/* Sultanhanı Kervansarayı Arka Plan Görseli (Dış Cephe & İç Avlu Geçişi) */}
          <img
            src={
              currentConfig.id === 'scene3_entry' || currentConfig.id === 'scene4_farewell' || isCompletedScene
                ? '/assets/walkable/sultanhani_inner_courtyard.jpg'
                : '/assets/walkable/sultanhani_caravanserai.jpg'
            }
            alt="Aksaray Sultanhanı Kervansarayı Taç Kapısı ve Avlusu"
            className={`w-full h-full object-cover object-center transition-all duration-1000 ${
              currentConfig.id === 'scene3_entry'
                ? 'camera-zoom-active'
                : currentConfig.id === 'scene4_farewell' || isCompletedScene
                  ? 'brightness-50 contrast-110 saturate-80'
                  : 'brightness-95 contrast-105'
            }`}
          />

          {/* Gece Vakti Parlayan Ay ve Yıldızlar (4. Sahne) */}
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
          {(currentConfig.timeOfDay === 'morning' || currentConfig.timeOfDay === 'daylight') && !isCompletedScene && (
            <div className="absolute inset-0 pointer-events-none bg-radial from-amber-300/15 via-transparent to-transparent opacity-80" />
          )}

          {/* Ön Plan Canlı Çiçek ve Lavanta Gölgesi */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/70 to-transparent pointer-events-none z-10" />
        </div>

        {/* 2.5D KARAKTER VE DİYALOG SAHNESİ KATMANI */}
        {!isCompletedScene ? (
          <div className="relative z-20 flex-1 flex flex-col justify-between p-3 sm:p-6">
            {/* ÜST KONUŞMA VE ANLATIM BALONLARI ALANI (Taç Kapıyı Kapatmayacak Şekilde Yerleşim) */}
            <div className="w-full flex items-start justify-between gap-4 pt-1">
              {/* SOL: ÖĞRENCİ (DENİZ) KONUŞMA BALONU */}
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

              {/* SAĞ: LEO'NUN KONUŞMA BALONU (2. ve 4. Sahnede Aktif) */}
              <div className="w-1/2 max-w-xs sm:max-w-sm ml-auto">
                {(currentConfig.id === 'scene2_meeting' || currentConfig.id === 'scene4_farewell') && (
                  <div
                    className={`p-3 sm:p-4 rounded-2xl bg-white/95 text-slate-900 border-2 shadow-xl transition-all duration-300 ${
                      isSpeaking && speakingRole === 'leo'
                        ? 'border-amber-500 scale-102 ring-4 ring-amber-400/40'
                        : 'border-amber-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 pb-1 border-b border-amber-100">
                      <div className="flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-[11px] font-extrabold text-amber-900 uppercase tracking-wider">
                          {currentConfig.speakerName}:
                        </span>
                      </div>

                      {/* Ses Dinleme Düğmeleri (Normal ve Yavaş Telaffuz) */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => playSpeech(currentConfig.speakerExpression, 'leo', 'normal')}
                          className="px-2 py-0.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-xs cursor-pointer"
                          aria-label={`${currentConfig.speakerName} konuşmasını dinle`}
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Dinle</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => playSpeech(currentConfig.speakerExpression, 'leo', 'slow')}
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
                )}
              </div>
            </div>

            {/* ORTA KATMAN: CANLI 2.5D KARAKTER SPRITE'LARI (Taç Kapının ve Meydanın Önünde) */}
            <div className="w-full flex items-end justify-between px-6 sm:px-16 pb-2 pointer-events-none">
              {/* SOL: DENİZ (KAMPÜS ÖĞRENCİSİ) */}
              <DenizCharacter
                action={denizAction}
                isSpeaking={isSpeaking && speakingRole === 'deniz'}
              />

              {/* SAĞ: LEO (GEZGİN TURİST ÇOCUK VE HARİTASI) */}
              <TouristKid
                action={leoAction}
                isSpeaking={isSpeaking && speakingRole === 'leo'}
              />
            </div>

            {/* ALT KATMAN: HİKÂYE ANLATIMI VE ETKİLEŞİM PANELİ */}
            <div className="relative z-30 w-full max-w-3xl mx-auto flex flex-col gap-2.5">
              {/* Hikâye Anlatım ve İpucu Kartı */}
              <div className="bg-slate-950/90 border-2 border-amber-500/50 rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-amber-500/20">
                  <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold">
                    <Footprints className="w-4 h-4 text-amber-400" />
                    <span>{currentConfig.sceneTitle}</span>
                  </div>
                  <span className="text-[10px] text-amber-200/70">{currentConfig.timeLabel}</span>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 font-medium pt-2 leading-relaxed">
                  {currentConfig.narrationText}
                </p>

                <p className="text-xs sm:text-sm font-bold text-amber-300 mt-2">
                  👉 {currentConfig.promptText}
                </p>
              </div>

              {/* Karar / Cevap Seçenekleri Butonları */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentConfig.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectOption(option)}
                    disabled={isLocked}
                    className={`min-h-[52px] p-3 rounded-2xl font-black text-base sm:text-lg border-2 shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                      selectedOptionId === option.id
                        ? option.isCorrect
                          ? 'border-emerald-400 bg-emerald-700 text-white scale-102 ring-4 ring-emerald-500/40'
                          : 'border-amber-400 bg-amber-800 text-amber-100 ring-4 ring-amber-500/40'
                        : 'border-amber-400/60 bg-slate-900/90 text-amber-100 hover:bg-slate-800 hover:border-amber-300 active:scale-98'
                    }`}
                    aria-label={`"${option.text}" seçeneğini yanıtla`}
                  >
                    <span>"{option.text}"</span>
                    {selectedOptionId === option.id && option.isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-200 animate-in zoom-in" />
                    )}
                  </button>
                ))}
              </div>

              {/* Geri Bildirim veya Pedagojik İpucu Çubuğu */}
              {feedback && (
                <div
                  className={`p-3 rounded-xl border flex items-center gap-2 text-xs sm:text-sm font-bold shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                    feedback.isError
                      ? 'bg-amber-950/85 border-amber-500 text-amber-200'
                      : 'bg-emerald-950/85 border-emerald-500 text-emerald-200'
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
                Aksaray Sultanhanı Kervansarayı'nda turist arkadaşın Leo ile karşılaştın, Taç Kapı'nın eşiğinden geçip avluyu keşfettiniz ve gece vedasını yaptınız!
              </p>

              {/* Dört İfadenin Özet Mini Kartları */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6 text-left">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/40">
                  <span className="text-[10px] font-bold text-amber-400">Tanışma</span>
                  <p className="text-sm font-extrabold text-white font-serif">Hello!</p>
                  <p className="text-[10px] text-slate-400">Merhaba!</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/40">
                  <span className="text-[10px] font-bold text-amber-400">Sabah</span>
                  <p className="text-sm font-extrabold text-white font-serif">Good morning!</p>
                  <p className="text-[10px] text-slate-400">Günaydın!</p>
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
                  className="w-full sm:w-auto min-h-[46px] px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-200 border border-amber-500/40 font-bold text-sm inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Tekrar Oyna</span>
                </button>
                <button
                  type="button"
                  onClick={onExitToClassroom}
                  className="w-full sm:w-auto min-h-[46px] px-8 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm inline-flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
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
