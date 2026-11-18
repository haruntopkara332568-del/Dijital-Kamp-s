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

type SceneId = 'scene1_meeting' | 'scene2_farewell' | 'adventure_completed';

interface SceneStepConfig {
  id: SceneId;
  sceneTitle: string;
  timeLabel: string;
  timeOfDay: 'morning' | 'daylight' | 'night';
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
  // 1. SAHNE: Taç Kapının Önünde Karşılaşma (Meydanda Yürüyüş, Kapıda Duruş, "Hello!" ve Taş Eşik Geçişi)
  {
    id: 'scene1_meeting',
    sceneTitle: '1. Sahne — Taç Kapının Önünde Karşılaşma',
    timeLabel: 'Sabah Vakti • Selçuklu Taç Kapısı',
    timeOfDay: 'daylight',
    speakerName: 'Leo (Gezgin Arkadaş)',
    speakerExpression: 'Hello!',
    speakerTurkish: 'Merhaba!',
    narrationText:
      "Aksaray Sultanhanı Kervansarayı'na hoş geldin! Görkemli Selçuklu Taç Kapısı'nın önünde tek başına gezen arkadaşın Leo haritadan başını kaldırıp sana gülümsedi ve el sallayarak 'Hello!' dedi.",
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

  // 2. SAHNE: Avluda Vedalaşma (Gece Işığı, "Good night!", Görünür El Sallama ve Ayrı Yönlere Ayrılış)
  {
    id: 'scene2_farewell',
    sceneTitle: '2. Sahne — Avluda Vedalaşma',
    timeLabel: 'Gece Vakti • Yıldızlı Selçuklu Avlusu',
    timeOfDay: 'night',
    speakerName: 'Leo (Gezgin Arkadaş)',
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
  isWavingProminently?: boolean;
}

/**
 * Kampüs Öğrencisi (Deniz)
 * Görünüm: Mevcut kampüs karakteriyle birebir uyumlu
 * (Turkuaz yelek, Selçuklu sekizgen yıldız rozeti, beyaz gömlek, mavi pantolon, sırt çantası, kahverengi saç)
 */
function DenizCharacter({ action, isSpeaking, isWavingProminently }: DenizCharacterProps) {
  const isWalking =
    action === 'walk_square' ||
    action === 'walk_threshold' ||
    action === 'walk_away_left';

  const isBackView = action === 'walk_threshold';
  const isWaving = action === 'greet_hello' || action === 'farewell_night' || isWavingProminently;
  const isFacingRight = action === 'turn_to_leo';
  const isFacingLeft = action === 'walk_away_left';

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* Karakter İsim Rozeti */}
      <span className="mb-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-700 text-white shadow-md border border-emerald-300">
        🎒 Deniz (Kampüs Öğrencisi)
      </span>

      {/* SVG Karakter Gövdesi */}
      <div className="w-24 h-36 sm:w-28 sm:h-42 drop-shadow-2xl">
        <svg
          viewBox="0 0 100 140"
          className={`w-full h-full ${isFacingRight ? 'scale-x-[-1]' : isFacingLeft ? 'scale-x-[1]' : ''}`}
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

          {/* Ayaklar ve Ayakkabılar (Zemine basan belirgin yürüyüş adımları) */}
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
              {/* Kırmızı Kravat */}
              <path d="M 48,50 L 50,62 L 52,50 Z" fill="#b91c1c" />
              {/* Selçuklu Sekizgen Altın Yıldız Rozeti */}
              <circle cx="40" cy="62" r="3.5" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
              {/* Sırt Çantası Ön Askıları */}
              <path d="M 36,49 L 37,88" stroke="#78350f" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M 64,49 L 63,88" stroke="#78350f" strokeWidth="2.8" strokeLinecap="round" />
            </g>
          )}

          {/* Kollar: Görünür El Sallama veya Yürüme Hareketi */}
          {isWaving ? (
            <g>
              {/* Sol Kol Dinlenmede */}
              <path
                d="M 32,54 Q 22,68 24,82"
                stroke="#0e768a"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="24" cy="82" r="4" fill="#fbcfe8" />
              {/* Sağ Kol: Görünür Biçimde Sallanan El */}
              <g className="deniz-wave-arm">
                <path
                  d="M 68,54 Q 84,36 82,18"
                  stroke="#0e768a"
                  strokeWidth="6.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <g className="deniz-wave-hand">
                  <circle cx="82" cy="18" r="5" fill="#fbcfe8" />
                  <path d="M 80,16 L 80,11 M 82,16 L 83,10 M 85,17 L 87,12" stroke="#fbcfe8" strokeWidth="1.8" strokeLinecap="round" />
                </g>
              </g>
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
              {/* Duruş Hali */}
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
            <path d="M 32,28 Q 50,8 68,28 Q 50,42 32,28 Z" fill="#451a03" />
          ) : (
            <g>
              <path d="M 32,26 Q 50,8 68,26 Q 50,18 32,26 Z" fill="#451a03" />
              <circle cx="34" cy="24" r="5" fill="#451a03" />
              <circle cx="66" cy="24" r="5" fill="#451a03" />
            </g>
          )}

          {/* Yüz Hatları */}
          {!isBackView && (
            <g>
              <circle cx="44" cy="28" r="2.2" fill="#0f172a" />
              <circle cx="56" cy="28" r="2.2" fill="#0f172a" />
              {isSpeaking ? (
                <ellipse cx="50" cy="35" rx="3.5" ry="3" fill="#b91c1c" className="animate-pulse" />
              ) : (
                <path d="M 45,34 Q 50,39 55,34" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" fill="none" />
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

interface TouristKidProps {
  action: 'stand_with_map' | 'greet_hello' | 'walk_threshold' | 'farewell_night' | 'walk_away_right' | 'idle';
  isSpeaking: boolean;
  isWavingProminently?: boolean;
}

/**
 * Yabancı Turist Çocuk (Leo)
 * Görünüm: Yaşıt yabancı turist çocuk, kâşif şapkası, bej/turuncu gezgin kıyafeti,
 * elinde katlanmış gezi haritası tutar.
 */
function TouristKid({ action, isSpeaking, isWavingProminently }: TouristKidProps) {
  const isWalking =
    action === 'walk_threshold' || action === 'walk_away_right';

  const isBackView = action === 'walk_threshold';
  const isWaving = action === 'greet_hello' || action === 'farewell_night' || isWavingProminently;
  const isFacingRight = action === 'walk_away_right';

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* Karakter İsim Rozeti */}
      <span className="mb-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-600 text-white shadow-md border border-amber-300 flex items-center gap-1">
        <Compass className="w-2.5 h-2.5 text-amber-200" />
        <span>Leo (Gezgin Arkadaş)</span>
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

          {/* Ayaklar ve Ayakkabılar (Zemine basan belirgin adımlar) */}
          <g className={isWalking ? 'leo-walk-legs' : ''}>
            <rect x="36" y="108" width="10" height="20" rx="4" fill="#475569" className={isWalking ? 'leo-left-leg' : ''} />
            <ellipse cx="40" cy="129" rx="7" ry="4" fill="#1e293b" />
            <rect x="54" y="108" width="10" height="20" rx="4" fill="#475569" className={isWalking ? 'leo-right-leg' : ''} />
            <ellipse cx="58" cy="129" rx="7" ry="4" fill="#1e293b" />
          </g>

          {/* Gezgin Şortu */}
          <rect x="34" y="86" width="32" height="26" rx="4" fill="#78716c" />
          <path d="M 50,96 L 50,112" stroke="#44403c" strokeWidth="1.5" />

          {/* Gövde ve Kıyafet (Turuncu Macera Tişörtü ve Bej Yelek) */}
          {isBackView ? (
            <g>
              <rect x="32" y="48" width="36" height="42" rx="6" fill="#d6d3d1" />
              <rect x="38" y="52" width="24" height="28" rx="4" fill="#a8a29e" />
              <path d="M 44,52 L 44,80 M 56,52 L 56,80" stroke="#78716c" strokeWidth="2" />
            </g>
          ) : (
            <g>
              <rect x="32" y="48" width="36" height="42" rx="6" fill="#f97316" />
              <path d="M 32,48 L 42,48 L 40,90 L 32,90 Z" fill="#d6d3d1" />
              <path d="M 68,48 L 58,48 L 60,90 L 68,90 Z" fill="#d6d3d1" />
              <path d="M 50,48 L 50,90" stroke="#ea580c" strokeWidth="1.5" />
            </g>
          )}

          {/* Sol Kol: ELİNDE GEZİ HARİTASI TUTAR */}
          <g>
            <path
              d="M 32,54 Q 20,68 28,76"
              stroke="#f97316"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="28" cy="76" r="3.8" fill="#fed7aa" />

            {/* AÇIK GEZİ HARİTASI */}
            {!isBackView && (
              <g transform="translate(14, 66) rotate(-12)">
                <rect x="0" y="0" width="18" height="14" rx="1.5" fill="#f8fafc" stroke="#0284c7" strokeWidth="1.2" />
                <path d="M 3,4 Q 9,2 15,4 M 3,7 Q 9,9 15,7 M 3,10 Q 9,8 15,10" stroke="#38bdf8" strokeWidth="1" fill="none" />
                <circle cx="8" cy="7" r="1.5" fill="#ef4444" />
                <circle cx="13" cy="5" r="1" fill="#f59e0b" />
              </g>
            )}
          </g>

          {/* Sağ Kol: Görünür El Sallama */}
          {isWaving ? (
            <g className="leo-wave-arm">
              <path
                d="M 68,54 Q 84,36 82,18"
                stroke="#f97316"
                strokeWidth="6.5"
                strokeLinecap="round"
                fill="none"
              />
              <g className="leo-wave-hand">
                <circle cx="82" cy="18" r="5" fill="#fed7aa" />
                <path d="M 80,16 L 80,11 M 82,16 L 83,10 M 85,17 L 87,12" stroke="#fed7aa" strokeWidth="1.8" strokeLinecap="round" />
              </g>
            </g>
          ) : isWalking ? (
            <g>
              <path
                d="M 68,54 Q 78,70 74,86"
                stroke="#f97316"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
                className="leo-right-arm"
              />
              <circle cx="74" cy="86" r="4" fill="#fed7aa" />
            </g>
          ) : (
            <g>
              <path
                d="M 68,54 Q 76,70 74,84"
                stroke="#f97316"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="74" cy="84" r="4" fill="#fed7aa" />
            </g>
          )}

          {/* Boyun ve Baş */}
          <rect x="44" y="40" width="12" height="10" fill="#fed7aa" />
          <circle cx="50" cy="28" r="17" fill="#fed7aa" />

          {/* KÂŞİF VE SAFARİ ŞAPKASI */}
          <g>
            <ellipse cx="50" cy="22" rx="23" ry="5.5" fill="#b45309" />
            <path d="M 33,22 Q 50,7 67,22 Z" fill="#d97706" />
            <rect x="36" y="18" width="28" height="4" fill="#92400e" rx="1" />
            <circle cx="50" cy="19" r="1.5" fill="#fef08a" />
          </g>

          {/* Sarı/Kumral Çocuk Saçı Uçları */}
          <path d="M 31,24 Q 28,32 33,36" stroke="#ca8a04" strokeWidth="2.5" fill="none" />
          <path d="M 69,24 Q 72,32 67,36" stroke="#ca8a04" strokeWidth="2.5" fill="none" />

          {/* Yüz Hatları */}
          {!isBackView && (
            <g>
              <circle cx="44" cy="30" r="2.2" fill="#0f172a" />
              <circle cx="56" cy="30" r="2.2" fill="#0f172a" />
              {isSpeaking ? (
                <ellipse cx="50" cy="37" rx="3.5" ry="3" fill="#ea580c" className="animate-pulse" />
              ) : (
                <path d="M 45,36 Q 50,40 55,36" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" fill="none" />
              )}
              <ellipse cx="40" cy="33" rx="2.5" ry="1.2" fill="#f97316" opacity="0.3" />
              <ellipse cx="60" cy="33" rx="2.5" ry="1.2" fill="#f97316" opacity="0.3" />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                 SELÇUKLU TAÇ KAPI ANITSAL TAŞ EŞİĞİ                       */
/* -------------------------------------------------------------------------- */

function SeljukStoneThreshold({ isCrossing }: { isCrossing: boolean }) {
  return (
    <div
      className={`absolute left-1/2 -translate-x-1/2 bottom-6 sm:bottom-8 z-10 flex flex-col items-center pointer-events-none transition-all duration-1000 ${
        isCrossing ? 'opacity-100 scale-105' : 'opacity-85 scale-100'
      }`}
    >
      {/* Selçuklu Taç Kapı Portal Açıklığı (Arched Doorway Passage) */}
      <div className="relative flex flex-col items-center">
        {/* Portal Açıklığı (Açıklığın derinliği & gölgesi) */}
        <div className="w-36 sm:w-44 h-40 sm:h-48 rounded-t-full bg-gradient-to-b from-[#090b10] via-[#121620] to-[#1e1b18] border-t-2 border-x-2 border-amber-900/60 shadow-[inset_0_20px_40px_rgba(0,0,0,0.95)] opacity-95 flex items-center justify-center overflow-hidden">
          {/* İç Avluya Doğru Açılan Aydınlık Koridor Hüzmesi */}
          <div className="w-14 h-24 rounded-t-full bg-amber-400/15 blur-xs mb-3" />
        </div>

        {/* Taş Eşik Bilgi Rozeti */}
        <div className="absolute top-2 px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-amber-950/90 text-amber-300 border border-amber-500/60 shadow-lg backdrop-blur-xs flex items-center gap-1.5 z-20">
          <Footprints className="w-3.5 h-3.5 text-amber-400" />
          <span>Selçuklu Taç Kapı Taş Eşiği</span>
        </div>

        {/* 3D Taş Eşik Çizimi (Portal Açıklığının Tabanında & Meydan Zemin Perspektifinde) */}
        <svg
          viewBox="0 0 280 40"
          className="w-52 sm:w-64 -mt-5 z-20 drop-shadow-[0_15px_25px_rgba(0,0,0,0.9)]"
        >
          {/* Eşik Altı Zemin Gölgesi */}
          <rect x="6" y="28" width="268" height="12" rx="3" fill="rgba(0,0,0,0.75)" />

          {/* Taş Eşik Ön Yüzü (Yükselti - Meydan Zeminine Basan Taş Basamak) */}
          <polygon
            points="10,16 270,16 264,32 16,32"
            fill="#78552b"
            stroke="#452a0d"
            strokeWidth="1.2"
          />

          {/* Taş Eşik Üst Basma Yüzeyi (Top Sill - Ayakların Bastığı ve Aştığı Taş Zemin) */}
          <polygon
            points="24,4 256,4 270,16 10,16"
            fill="#d4b584"
            stroke="#8c6836"
            strokeWidth="1.5"
          />

          {/* Taş Eşik Üst Kenar Işık Yansıması */}
          <line
            x1="12"
            y1="16"
            x2="268"
            y2="16"
            stroke="#fef3c7"
            strokeWidth="2.4"
            strokeLinecap="round"
          />

          {/* Selçuklu Taş Derzleri ve Geometrik Çizgiler */}
          <line x1="70" y1="4" x2="65" y2="32" stroke="#5c3d18" strokeWidth="1.2" opacity="0.65" />
          <line x1="140" y1="4" x2="140" y2="32" stroke="#5c3d18" strokeWidth="1.5" opacity="0.75" />
          <line x1="210" y1="4" x2="215" y2="32" stroke="#5c3d18" strokeWidth="1.2" opacity="0.65" />

          {/* Tarihi Aşınma İzi */}
          <ellipse cx="140" cy="11" rx="50" ry="3.5" fill="#fae8b4" opacity="0.6" />
        </svg>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                         ANA MACERA BİLEŞENİ                                */
/* -------------------------------------------------------------------------- */

export function Grade3SmartBoardAdventureView({ onExitToClassroom }: Grade3SmartBoardAdventureViewProps) {
  const campus = useOptionalCampus();

  // Sahne ve Akış Durumları
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [subPhase, setSubPhase] = useState<'approach' | 'dialogue' | 'threshold_crossing' | 'waving' | 'departing'>('approach');
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const isLockedRef = useRef<boolean>(false);

  // Karakter Eylemleri
  const [denizAction, setDenizAction] = useState<DenizCharacterProps['action']>('walk_square');
  const [leoAction, setLeoAction] = useState<TouristKidProps['action']>('stand_with_map');

  // Seslendirme
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speakingRole, setSpeakingRole] = useState<'deniz' | 'leo' | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const isCompletedScene = currentSceneIndex >= SCENE_CONFIGS.length;
  const currentConfig = !isCompletedScene ? SCENE_CONFIGS[currentSceneIndex] : SCENE_CONFIGS[0];

  // Web Speech API ile İngilizce Doğal Seslendirme
  const playSpeech = useCallback(
    (text: string, role: 'deniz' | 'leo', speed: 'normal' | 'slow' = 'normal') => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = speed === 'slow' ? 0.65 : 0.85;
        utterance.pitch = role === 'deniz' ? 1.15 : 1.1;

        setIsSpeaking(true);
        setSpeakingRole(role);

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

  // Sahne 1 Açılışı: Deniz Meydandan Yürür, Kapının Önünde Durup Leo'ya Döner
  useEffect(() => {
    if (isCompletedScene) return;
    clearTimer();

    if (currentSceneIndex === 0) {
      // 1. Aşama: Meydanda Belirgin Adımlarla Taç Kapıya Yürüyüş
      const tInit = setTimeout(() => {
        setSubPhase('approach');
        setDenizAction('walk_square');
        setLeoAction('stand_with_map');
      }, 0);

      // 2.2 saniye sonra kapının önüne varış, duruş ve Leo'ya dönüş
      const tArrival = setTimeout(() => {
        setSubPhase('dialogue');
        setDenizAction('turn_to_leo');
        setLeoAction('greet_hello');

        // Leo'nun "Hello!" konuşması
        const tLeo = setTimeout(() => {
          playSpeech('Hello!', 'leo', 'normal');
        }, 400);

        timerRef.current = tLeo;
      }, 2200);

      return () => {
        clearTimeout(tInit);
        clearTimeout(tArrival);
        clearTimer();
      };
    } else if (currentSceneIndex === 1) {
      // 2. Sahne Açılışı: Avluda Vedalaşma (Gece Işığı)
      const tInit = setTimeout(() => {
        setSubPhase('dialogue');
        setDenizAction('idle');
        setLeoAction('farewell_night');
      }, 0);

      const tLeoNight = setTimeout(() => {
        playSpeech('Good night!', 'leo', 'normal');
      }, 600);

      return () => {
        clearTimeout(tInit);
        clearTimeout(tLeoNight);
        clearTimer();
      };
    }
  }, [currentSceneIndex, isCompletedScene, playSpeech, clearTimer]);

  // Öğrencinin Cevap Seçimi (Yalnızca Konuşma Anlarında Aktif)
  const handleSelectOption = (option: { id: string; text: string; isCorrect: boolean }) => {
    if (isLockedRef.current) return;

    setSelectedOptionId(option.id);

    if (option.isCorrect) {
      // DOĞRU SEÇİM
      isLockedRef.current = true;
      setIsLocked(true);
      clearTimer();

      setFeedback({
        text: currentConfig.correctFeedback,
        isError: false,
      });

      if (currentSceneIndex === 0) {
        // --- 1. SAHNE: "Hello!" Karşılaşması ve Taş Eşik Geçişi ---
        setDenizAction('greet_hello');
        playSpeech('Hello!', 'deniz', 'normal');
        setLeoAction('greet_hello');

        // Konuşma bittikten sonra: Kamera ikisini takip eder, taş eşiği ayaklarıyla geçerler ve açıklığın içinden yürürler
        timerRef.current = setTimeout(() => {
          setFeedback(null);
          setSelectedOptionId(null);
          setSubPhase('threshold_crossing');
          setDenizAction('walk_threshold');
          setLeoAction('walk_threshold');

          // İki çocuk da eşiğin öte tarafına ulaştıktan sonra (3.8s) avlu görüntüsü açılır
          timerRef.current = setTimeout(() => {
            advanceToNextScene();
          }, 3800);
        }, 1500);
      } else if (currentSceneIndex === 1) {
        // --- 2. SAHNE: "Good night!" Vedalaşması, Görünür El Sallama ve Kadrajın Kenarına Doğru Ayrılış ---
        setDenizAction('farewell_night');
        playSpeech('Good night!', 'deniz', 'normal');

        // Karşılıklı "Good night!" dedikten sonra elleri görünür biçimde sallanır
        timerRef.current = setTimeout(() => {
          setSubPhase('waving');
          setDenizAction('farewell_night');
          setLeoAction('farewell_night');

          // Görünür el sallama sonrası: İki çocuk belirgin adımlarla kadrajın kenarına kadar yürür
          timerRef.current = setTimeout(() => {
            setFeedback(null);
            setSelectedOptionId(null);
            setSubPhase('departing');
            setDenizAction('walk_away_left');
            setLeoAction('walk_away_right');

            // Başarı ekranı ikisi de kadrajdan tamamen çıktıktan sonra açılır (3.2s)
            timerRef.current = setTimeout(() => {
              advanceToNextScene();
            }, 3200);
          }, 1500);
        }, 1200);
      }
    } else {
      // YANLIŞ SEÇİM: Cezasız pedagojik ipucu
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

  // Sonraki Sahneye veya Başarı Ekranına Geçiş
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
    setSubPhase('approach');
    setSelectedOptionId(null);
    setFeedback(null);
    setIsLocked(false);
    isLockedRef.current = false;
    setDenizAction('walk_square');
    setLeoAction('stand_with_map');
  };

  // Sayfadan çıkışta temizlik
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
      {/* İÇ CSS ANİMASYONLARI (Gerçekçi Yürüme, Taş Eşik Geçişi ve El Sallama Döngüleri) */}
      <style>{`
        @keyframes denizLegLeft {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(24deg) translateY(-3px); }
        }
        @keyframes denizLegRight {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-24deg) translateY(-3px); }
        }
        @keyframes denizArmSwing {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(24deg); }
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
        @keyframes leoLegLeft {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-22deg) translateY(-3px); }
        }
        @keyframes leoLegRight {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(22deg) translateY(-3px); }
        }
        .leo-left-leg {
          transform-origin: 41px 108px;
          animation: leoLegLeft 0.5s ease-in-out infinite;
        }
        .leo-right-leg {
          transform-origin: 59px 108px;
          animation: leoLegRight 0.5s ease-in-out infinite;
        }
        .leo-right-arm {
          transform-origin: 68px 54px;
          animation: denizArmSwing 0.5s ease-in-out infinite;
        }
        @keyframes waveArmMotion {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-32deg); }
        }
        @keyframes waveHandMotion {
          0%, 100% { transform: rotate(-20deg); }
          50% { transform: rotate(25deg); }
        }
        .deniz-wave-arm {
          transform-origin: 68px 54px;
          animation: waveArmMotion 0.65s ease-in-out infinite;
        }
        .deniz-wave-hand {
          transform-origin: 82px 18px;
          animation: waveHandMotion 0.32s ease-in-out infinite;
        }
        .leo-wave-arm {
          transform-origin: 68px 54px;
          animation: waveArmMotion 0.65s ease-in-out infinite;
        }
        .leo-wave-hand {
          transform-origin: 82px 18px;
          animation: waveHandMotion 0.32s ease-in-out infinite;
        }
        @keyframes cameraZoomPortal {
          0% { transform: scale(1); }
          100% { transform: scale(1.22) translateY(5%); }
        }
        .camera-zoom-portal-active {
          animation: cameraZoomPortal 3.8s ease-out forwards;
        }
        @keyframes walkAcrossSquare {
          0% { transform: translateX(-160px); }
          100% { transform: translateX(0px); }
        }
        .deniz-walk-across {
          animation: walkAcrossSquare 2.2s ease-out forwards;
        }
        @keyframes stepThroughThreshold {
          0% {
            transform: translateY(45px) scale(0.95);
          }
          35% {
            transform: translateY(2px) scale(0.88);
          }
          65% {
            transform: translateY(-28px) scale(0.78);
            filter: brightness(0.92);
          }
          100% {
            transform: translateY(-62px) scale(0.66);
            filter: brightness(0.60);
          }
        }
        .children-cross-threshold {
          animation: stepThroughThreshold 3.7s ease-in-out forwards;
        }
      `}</style>

      {/* ÜST BAŞLIK VE ADIM BİLGİSİ BARI */}
      <div className="shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#080e1a]/95 border-b border-amber-500/30 flex items-center justify-between gap-2 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
            <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-600/40">
                Büyük Görev • 3. Sınıf
              </span>
              <span className="text-xs sm:text-sm font-bold text-amber-100 hidden md:inline">
                Kervansarayın Gölgesinde Macera
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-amber-200/80 truncate max-w-[200px] sm:max-w-none">
              Aksaray Sultanhanı Kervansarayı • Greetings (Selamlaşma)
            </p>
          </div>
        </div>

        {/* Sahne Adım Göstergesi */}
        {!isCompletedScene && (
          <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-[11px] sm:text-xs">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
            <span className="text-amber-200 font-bold">{currentConfig.sceneTitle}</span>
            <span className="text-slate-400 mx-1 hidden sm:inline">•</span>
            <span className="text-amber-100/90 font-medium hidden sm:inline">{currentConfig.timeLabel}</span>
            <span className="text-slate-400 mx-0.5 sm:mx-1">|</span>
            <span className="font-bold text-white">
              {currentSceneIndex + 1} / {SCENE_CONFIGS.length}
            </span>
          </div>
        )}

        {/* Sınıfa Dön Butonu */}
        <button
          type="button"
          onClick={onExitToClassroom}
          className="hidden sm:inline-flex min-h-[44px] px-3.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-amber-200 border border-amber-500/30 font-bold text-xs items-center gap-1.5 transition-colors cursor-pointer"
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
                : 'bg-gradient-to-b from-[#7dd3fc]/40 via-[#bae6fd]/25 to-[#fef08a]/20'
            }`}
          />

          {/* Sultanhanı Kervansarayı Arka Plan Görseli (Dış Cephe & Eşik Geçişi Sonrası İç Avlu) */}
          <img
            src={
              currentSceneIndex === 1 || isCompletedScene
                ? '/assets/walkable/sultanhani_inner_courtyard.jpg'
                : '/assets/walkable/sultanhani_caravanserai.jpg'
            }
            alt="Aksaray Sultanhanı Kervansarayı Taç Kapısı ve Avlusu"
            className={`w-full h-full object-cover object-[center_55%] transition-all duration-1000 ${
              subPhase === 'threshold_crossing'
                ? 'camera-zoom-portal-active'
                : currentSceneIndex === 1 || isCompletedScene
                  ? 'brightness-50 contrast-110 saturate-80'
                  : 'brightness-95 contrast-105'
            }`}
          />

          {/* Gece Vakti Parlayan Ay ve Yıldızlar (2. Sahne) */}
          {(isCompletedScene || currentConfig.timeOfDay === 'night') && (
            <div className="absolute inset-0 z-1 pointer-events-none animate-in fade-in duration-700">
              <div className="absolute top-6 right-16 w-12 h-12 rounded-full bg-amber-200/90 shadow-[0_0_35px_#fde68a] flex items-center justify-center">
                <Moon className="w-8 h-8 text-amber-50 fill-amber-100" />
              </div>
              <div className="absolute top-10 left-12 w-2 h-2 rounded-full bg-white animate-ping opacity-75" />
              <div className="absolute top-16 left-1/4 w-1.5 h-1.5 rounded-full bg-amber-200 animate-pulse" />
              <div className="absolute top-8 left-1/2 w-2 h-2 rounded-full bg-white opacity-80" />
              <div className="absolute top-20 right-1/3 w-1.5 h-1.5 rounded-full bg-sky-200 animate-ping opacity-60" />
              <div className="absolute top-14 right-28 w-2 h-2 rounded-full bg-amber-100 animate-pulse" />
            </div>
          )}

          {/* Sabah Güneşi Işık Huzmesi (1. Sahne) */}
          {currentConfig.timeOfDay === 'daylight' && !isCompletedScene && (
            <div className="absolute inset-0 pointer-events-none bg-radial from-amber-300/15 via-transparent to-transparent opacity-80" />
          )}

          {/* Ön Plan Zemin Gölgesi */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/70 to-transparent pointer-events-none z-10" />
        </div>

        {/* 2.5D KARAKTER VE DİYALOG SAHNESİ KATMANI */}
        {!isCompletedScene ? (
          <div className="relative z-20 flex-1 flex flex-col justify-between p-3 sm:p-5">
            {/* ÜST KONUŞMA BALONLARI ALANI */}
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

              {/* SAĞ: LEO'NUN KONUŞMA BALONU */}
              <div className="w-1/2 max-w-xs sm:max-w-sm ml-auto">
                {subPhase !== 'threshold_crossing' && subPhase !== 'departing' && (
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

                      {/* Ses Dinleme Düğmeleri (Normal ve Yavaş) */}
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

            {/* ORTA KATMAN: CANLI 2.5D KARAKTERLER VE TAŞ EŞİK */}
            {currentSceneIndex === 0 && subPhase === 'threshold_crossing' ? (
              /* EŞİK GEÇİŞİ ANİMASYONU: Kamera takip eder, ayaklarıyla aynı taş eşiği geçerler ve açıklığın içinden yürürler */
              <div className="relative w-full flex-1 flex flex-col items-center justify-end pb-6 sm:pb-8 pointer-events-none">
                {/* SELÇUKLU TAÇ KAPI ANITSAL TAŞ EŞİĞİ VE AÇIKLIĞI */}
                <SeljukStoneThreshold isCrossing={true} />

                {/* İKİ ÇOCUK YAN YANA EŞİĞE DOĞRU YÜRÜR, AYAKLARIYLA EŞİĞİ AŞAR VE AÇIKLIĞIN İÇİNDEN YÜRÜR */}
                <div className="flex items-end justify-center gap-8 sm:gap-12 children-cross-threshold z-30">
                  <DenizCharacter
                    action="walk_threshold"
                    isSpeaking={false}
                  />
                  <TouristKid
                    action="walk_threshold"
                    isSpeaking={false}
                  />
                </div>
              </div>
            ) : (
              /* NORMAL SAHNE: Meydanda yürüyüş, kapının önünde duruş veya avluda duruş / ayrılış */
              <div className="w-full flex items-end justify-between px-6 sm:px-16 pb-2 pointer-events-none">
                {/* SOL: DENİZ (KAMPÜS ÖĞRENCİSİ) */}
                <div
                  className={
                    subPhase === 'approach' && currentSceneIndex === 0
                      ? 'deniz-walk-across'
                      : ''
                  }
                  style={{
                    transform:
                      subPhase === 'departing'
                        ? 'translateX(-120vw)'
                        : undefined,
                    transition:
                      subPhase === 'departing'
                        ? 'transform 3000ms linear'
                        : undefined,
                  }}
                >
                  <DenizCharacter
                    action={denizAction}
                    isSpeaking={isSpeaking && speakingRole === 'deniz'}
                    isWavingProminently={subPhase === 'waving'}
                  />
                </div>

                {/* SAĞ: LEO (GEZGİN ÇOCUK) */}
                <div
                  style={{
                    transform:
                      subPhase === 'departing'
                        ? 'translateX(120vw)'
                        : undefined,
                    transition:
                      subPhase === 'departing'
                        ? 'transform 3000ms linear'
                        : undefined,
                  }}
                >
                  <TouristKid
                    action={leoAction}
                    isSpeaking={isSpeaking && speakingRole === 'leo'}
                    isWavingProminently={subPhase === 'waving'}
                  />
                </div>
              </div>
            )}

            {/* ALT KATMAN: HİKÂYE ANLATIMI VE DİYALOG SEÇİM PANELİ */}
            <div className="relative z-30 w-full max-w-3xl mx-auto flex flex-col gap-2.5">
              {/* Hikâye Anlatım ve İpucu Kartı */}
              <div
                className={`bg-slate-950/90 border-2 border-amber-500/50 rounded-2xl shadow-2xl backdrop-blur-md transition-all duration-300 ${
                  subPhase === 'threshold_crossing'
                    ? 'p-2 sm:p-2.5 max-w-xl mx-auto border-amber-500/30'
                    : 'p-3 sm:p-4'
                }`}
              >
                <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-amber-500/20">
                  <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold">
                    <Footprints className="w-4 h-4 text-amber-400" />
                    <span>{currentConfig.sceneTitle}</span>
                  </div>
                  <span className="text-[10px] text-amber-200/70">{currentConfig.timeLabel}</span>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 font-medium pt-2 leading-relaxed">
                  {subPhase === 'threshold_crossing'
                    ? "İki arkadaş anıtsal Selçuklu Taç Kapısı'nın asırlık taş eşiğinden ayaklarıyla yan yana geçerek açıklığın içinden avluya doğru yürüyor..."
                    : subPhase === 'approach'
                      ? "Deniz, Sultanhanı Kervansarayı'nın önündeki meydanda belirgin adımlarla taç kapıya doğru yaklaşıyor..."
                      : subPhase === 'departing'
                        ? "İki arkadaş karşılıklı el sallayarak kervansarayın avlusundan ayrı yönlere doğru belirgin adımlarla uğurlanıyor..."
                        : currentConfig.narrationText}
                </p>

                {subPhase === 'dialogue' && (
                  <p className="text-xs sm:text-sm font-bold text-amber-300 mt-2">
                    👉 {currentConfig.promptText}
                  </p>
                )}
              </div>

              {/* Karar / Konuşma Seçenekleri Butonları (Yalnızca Konuşma Anlarında Aktif) */}
              {subPhase === 'dialogue' && (
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
              )}

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
          /* MACERA TAMAMLAMA VE BAŞARI EKRANI (İkisi de Kadrajdan Çıktıktan Sonra Açılır) */
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
                Aksaray Sultanhanı Kervansarayı'nda turist arkadaşın Leo ile karşılaştın, Taç Kapı'nın taş eşiğinden geçip avluyu keşfettiniz ve gece vedasını yaptınız!
              </p>

              {/* Öğrenilen 4 İfade Özet Kartları */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/40 flex flex-col items-center">
                  <span className="text-lg">👋</span>
                  <span className="text-xs font-black text-amber-300 mt-1">Hello!</span>
                  <span className="text-[10px] text-slate-400">Merhaba!</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/40 flex flex-col items-center">
                  <span className="text-lg">🌅</span>
                  <span className="text-xs font-black text-amber-300 mt-1">Good morning!</span>
                  <span className="text-[10px] text-slate-400">Günaydın!</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/40 flex flex-col items-center">
                  <span className="text-lg">🚪</span>
                  <span className="text-xs font-black text-amber-300 mt-1">Goodbye!</span>
                  <span className="text-[10px] text-slate-400">Hoşça kal!</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/40 flex flex-col items-center">
                  <span className="text-lg">🌙</span>
                  <span className="text-xs font-black text-amber-300 mt-1">Good night!</span>
                  <span className="text-[10px] text-slate-400">İyi geceler!</span>
                </div>
              </div>

              {/* Eylem Düğmeleri */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="min-h-[48px] w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-200 border border-amber-500/40 font-bold text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  <span>Tekrar Oyna</span>
                </button>

                <button
                  type="button"
                  onClick={onExitToClassroom}
                  className="min-h-[48px] w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl inline-flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
                >
                  <span>Sınıfa Dön</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
