import type { DialogueRecord, GradeTier } from '@/src/types/campus';

/**
 * Onaylanmış Karşılama Metni (Bölüm 11):
 * Aşağıdaki metin hiçbir şekilde değiştirilmemelidir.
 */
export const APPROVED_WELCOME_TEXT =
  'Merhaba! Welcome! Kampüsümüze hoş geldin. Ben senin kampüs arkadaşınım. İstersen birlikte gezebiliriz, istersen sen kendin keşfedebilirsin.';

export const WELCOME_DIALOGUE: DialogueRecord = {
  id: 'courtyard-welcome',
  speaker: 'Kampüs Arkadaşı',
  visualSupportNote: 'Welcome = Hoş geldin',
  segments: [
    { text: 'Merhaba!', lang: 'tr-TR' },
    { text: 'Welcome!', lang: 'en-US' },
    {
      text: 'Kampüsümüze hoş geldin. Ben senin kampüs arkadaşınım. İstersen birlikte gezebiliriz, istersen sen kendin keşfedebilirsin.',
      lang: 'tr-TR',
    },
  ],
  source: 'Proje Sahibi Onaylı Metin — Bölüm 11',
  verificationStatus: 'dogrulandi',
  targetGrades: [2, 3, 4, 5, 6, 7],
  contentVersion: '1.0.0',
};

export interface GuidedTourStop {
  id: string;
  areaId: string;
  title: string;
  ilkokulDialogue: DialogueRecord;
  ortaokulDialogue: DialogueRecord;
}

export const GUIDED_TOUR_STOPS: GuidedTourStop[] = [
  {
    id: 'tour-gezi',
    areaId: 'gezi-ve-kesif',
    title: '1. Durak: Hayalden Gerçeğe',
    ilkokulDialogue: {
      id: 'tour-gezi-ilkokul',
      speaker: 'Kampüs Arkadaşı',
      segments: [
        {
          text: 'Burada çevremizdeki kapıları ve yapıları inceleyeceğiz. Gözlem yaparak keşfe başlayacağız.',
          lang: 'tr-TR',
        },
      ],
      source: 'Proje Sahibi Tasarım Dokümanı v3.2',
      verificationStatus: 'dogrulandi',
      targetGrades: [2, 3, 4],
      contentVersion: '1.0.0',
    },
    ortaokulDialogue: {
      id: 'tour-gezi-ortaokul',
      speaker: 'Kampüs Arkadaşı',
      segments: [
        {
          text: 'Hayalden Gerçeğe alanında farklı yapıları malzeme, biçim, işlev ve süsleme yönünden karşılaştırıyoruz.',
          lang: 'tr-TR',
        },
      ],
      source: 'Proje Sahibi Tasarım Dokümanı v3.2',
      verificationStatus: 'dogrulandi',
      targetGrades: [5, 6, 7],
      contentVersion: '1.0.0',
    },
  },
  {
    id: 'tour-ingilizce',
    areaId: 'ingilizce-dunyasi',
    title: '2. Durak: İngilizce Öğreniyorum',
    ilkokulDialogue: {
      id: 'tour-ingilizce-ilkokul',
      speaker: 'Kampüs Arkadaşı',
      segments: [
        {
          text: 'Keşfettiğimiz kavramların İngilizce karşılıklarını burada eğlenceli eşleştirmelerle öğreniyoruz.',
          lang: 'tr-TR',
        },
      ],
      source: 'Proje Sahibi Tasarım Dokümanı v3.2',
      verificationStatus: 'dogrulandi',
      targetGrades: [2, 3, 4],
      contentVersion: '1.0.0',
    },
    ortaokulDialogue: {
      id: 'tour-ingilizce-ortaokul',
      speaker: 'Kampüs Arkadaşı',
      segments: [
        {
          text: 'İngilizce Öğreniyorum bölümünde gözlemlerinle bağlantılı kelimeleri ve örnek cümleleri bağlam içinde inceliyoruz.',
          lang: 'tr-TR',
        },
      ],
      source: 'Proje Sahibi Tasarım Dokümanı v3.2',
      verificationStatus: 'dogrulandi',
      targetGrades: [5, 6, 7],
      contentVersion: '1.0.0',
    },
  },
  {
    id: 'tour-kitap',
    areaId: 'kitap-ve-hikaye-dunyasi',
    title: '3. Durak: Hikâyeden Hayata',
    ilkokulDialogue: {
      id: 'tour-kitap-ilkokul',
      speaker: 'Kampüs Arkadaşı',
      segments: [
        {
          text: 'Burada çizim yapıp hazır şekillerle kendi eserimizi oluşturuyoruz ve cihazımıza kaydediyoruz.',
          lang: 'tr-TR',
        },
      ],
      source: 'Proje Sahibi Tasarım Dokümanı v3.2',
      verificationStatus: 'dogrulandi',
      targetGrades: [2, 3, 4],
      contentVersion: '1.0.0',
    },
    ortaokulDialogue: {
      id: 'tour-kitap-ortaokul',
      speaker: 'Kampüs Arkadaşı',
      segments: [
        {
          text: 'Hikâyeden Hayata alanında tasarımını gerekçeli anlatımla birleştirip tek bir PNG çalışmasına dönüştürebilirsin.',
          lang: 'tr-TR',
        },
      ],
      source: 'Proje Sahibi Tasarım Dokümanı v3.2',
      verificationStatus: 'dogrulandi',
      targetGrades: [5, 6, 7],
      contentVersion: '1.0.0',
    },
  },
];

export const MISSION_GUIDE_PROMPTS: Record<
  'ilkokulKesfet' | 'ilkokulUret' | 'ortaokulKesfet',
  DialogueRecord
> = {
  ilkokulKesfet: {
    id: 'mission-door-ilkokul-kesfet',
    speaker: 'Kampüs Arkadaşı',
    segments: [{ text: 'Bu kapılardan hangilerini daha önce gördün?', lang: 'tr-TR' }],
    source: 'Proje Sahibi Tasarım Dokümanı v3.2 — Bölüm 15.1',
    verificationStatus: 'dogrulandi',
    targetGrades: [2, 3, 4],
    contentVersion: '1.0.0',
  },
  ilkokulUret: {
    id: 'mission-door-ilkokul-uret',
    speaker: 'Kampüs Arkadaşı',
    segments: [{ text: 'Bu kapıdan geçince ne gördün?', lang: 'tr-TR' }],
    source: 'Proje Sahibi Tasarım Dokümanı v3.2 — Bölüm 15.1',
    verificationStatus: 'dogrulandi',
    targetGrades: [2, 3, 4],
    contentVersion: '1.0.0',
  },
  ortaokulKesfet: {
    id: 'mission-door-ortaokul-kesfet',
    speaker: 'Kampüs Arkadaşı',
    segments: [
      {
        text: 'Sence geçmişte yapılan kapılarla bugün kullandığımız kapılar arasında hangi farklılıklar var?',
        lang: 'tr-TR',
      },
    ],
    source: 'Proje Sahibi Tasarım Dokümanı v3.2 — Bölüm 15.2',
    verificationStatus: 'dogrulandi',
    targetGrades: [5, 6, 7],
    contentVersion: '1.0.0',
  },
};

export const AKSARAY_MISSION_GUIDE_PROMPTS: Record<
  'ilkokulKesfet' | 'ilkokulUret' | 'ortaokulKesfet',
  DialogueRecord
> = {
  ilkokulKesfet: {
    id: 'mission-aksaray-ilkokul-kesfet',
    speaker: 'Kampüs Arkadaşı',
    segments: [
      {
        text: 'Aksaray dijital öğrenme rotamızda dört durağımız var. Hangileri taş veya tuğladan yapılmış, hangisi doğal bir vadi? Birlikte bakalım!',
        lang: 'tr-TR',
      },
    ],
    source: 'T.C. Kültür ve Turizm Bakanlığı / Aksaray İl Kültür ve Turizm Müdürlüğü Kaynakları',
    verificationStatus: 'dogrulandi',
    targetGrades: [2, 3, 4],
    contentVersion: '1.0.0',
  },
  ilkokulUret: {
    id: 'mission-aksaray-ilkokul-uret',
    speaker: 'Kampüs Arkadaşı',
    segments: [
      {
        text: 'Seçtiğin Aksaray durağından ilham alarak çizim yapabilir, hazır şekil ekleyebilir ya da kısa bir not yazabilirsin.',
        lang: 'tr-TR',
      },
    ],
    source: 'T.C. Kültür ve Turizm Bakanlığı / Aksaray İl Kültür ve Turizm Müdürlüğü Kaynakları',
    verificationStatus: 'dogrulandi',
    targetGrades: [2, 3, 4],
    contentVersion: '1.0.0',
  },
  ortaokulKesfet: {
    id: 'mission-aksaray-ortaokul-kesfet',
    speaker: 'Kampüs Arkadaşı',
    segments: [
      {
        text: 'Aksaray duraklarını malzeme, biçim, işlev ve çevre uyumu açısından karşılaştırarak gözlemlerini not edebilirsin.',
        lang: 'tr-TR',
      },
    ],
    source: 'T.C. Kültür ve Turizm Bakanlığı / Aksaray İl Kültür ve Turizm Müdürlüğü Kaynakları',
    verificationStatus: 'dogrulandi',
    targetGrades: [5, 6, 7],
    contentVersion: '1.0.0',
  },
};

export function getTourDialogueForTier(stop: GuidedTourStop, tier: GradeTier): DialogueRecord {
  return tier === 'ilkokul' ? stop.ilkokulDialogue : stop.ortaokulDialogue;
}
