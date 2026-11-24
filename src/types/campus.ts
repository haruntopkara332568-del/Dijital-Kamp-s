import type { StudentCharacterId } from '@/src/data/studentCharacters';

export const SUPPORTED_GRADES = [2, 3, 4] as const;
export type SupportedGrade = (typeof SUPPORTED_GRADES)[number];

export const LEGACY_GRADES = [2, 3, 4, 5, 6, 7] as const;
export type LegacyGradeLevel = (typeof LEGACY_GRADES)[number];

/**
 * Onarım 03A: Cihaz Tabanlı Yerel Öğrenci Profil Modeli
 * Kişisel veri (ad, soyad, e-posta, şifre) içermeyen, takma ad ve avatar odaklı yerel profil.
 */
export interface StudentProfile {
  id: string; // crypto.randomUUID() veya benzersiz teknik kimlik
  alias: string; // Takma ad (Gezgin, Bilgin, Kâşif vb.)
  avatarId: string; // Seçilen profil rozeti
  characterId?: StudentCharacterId;
  hasSeenEntranceCinematic?: boolean;
  selectedGrade: SupportedGrade; // Yalnızca 2, 3 veya 4. sınıf
  createdAt: string; // ISO
  lastUsedAt: string; // ISO
}

export const STUDENT_ALIASES = [
  'Gezgin',
  'Bilgin',
  'Kâşif',
  'Yıldız',
  'Pusula',
  'Deniz',
  'Atlas',
  'Çınar',
] as const;

export const STUDENT_AVATARS = [
  { id: 'avatar_1', label: 'Gezgin', color: '#0e768a', emoji: '🧭', bgGradient: 'from-[#0e768a] to-[#0a5969]' },
  { id: 'avatar_2', label: 'Bilgin', color: '#b88126', emoji: '📜', bgGradient: 'from-[#b88126] to-[#7a4e10]' },
  { id: 'avatar_3', label: 'Kâşif', color: '#257448', emoji: '🌿', bgGradient: 'from-[#257448] to-[#1c5535]' },
  { id: 'avatar_4', label: 'Yıldız', color: '#172b47', emoji: '✨', bgGradient: 'from-[#172b47] to-[#0f1d30]' },
  { id: 'avatar_5', label: 'Sanatçı', color: '#a6442e', emoji: '🎨', bgGradient: 'from-[#a6442e] to-[#7d2f1f]' },
  { id: 'avatar_6', label: 'Doğa Dostu', color: '#3b7a57', emoji: '🌱', bgGradient: 'from-[#3b7a57] to-[#2b593f]' },
  { id: 'avatar_7', label: 'Kitap Kurdu', color: '#684534', emoji: '📚', bgGradient: 'from-[#684534] to-[#4c3124]' },
  { id: 'avatar_8', label: 'Güneş', color: '#d8972b', emoji: '☀️', bgGradient: 'from-[#d8972b] to-[#b37517]' },
] as const;

/**
 * Aktif kullanıcı deneyiminde ve sınıf seçiminde geçerli sınıf seviyesi (Yalnızca İlkokul: 2, 3, 4).
 */
export type GradeLevel = SupportedGrade;

export function isSupportedGrade(grade: unknown): grade is SupportedGrade {
  return typeof grade === 'number' && (SUPPORTED_GRADES as readonly number[]).includes(grade);
}

export function isLegacyGrade(grade: unknown): grade is LegacyGradeLevel {
  return typeof grade === 'number' && (LEGACY_GRADES as readonly number[]).includes(grade);
}

export type GradeTier = 'ilkokul' | 'ortaokul';

export type VerificationStatus = 'dogrulandi' | 'taslak' | 'TODO: kaynak doğrulanacak';

export interface ContentProvenance {
  source: string;
  verificationStatus: VerificationStatus;
  targetGrades: LegacyGradeLevel[];
  contentVersion: string;
}

export interface GradeProfile {
  grade: LegacyGradeLevel;
  tier: GradeTier;
  label: string;
  maxInstructionWords: number;
  textComplexity: string;
  newEnglishWordsCount: number;
  supportLevel: string;
  hintPolicy: string;
  maxHintTiers: number;
  alwaysShowHint: boolean;
  writingExpectation: string;
  minSentencesSuggested: number;
  maxSentencesSuggested: number;
  taskComplexity: string;
  productionOptions: string[];
  allowsSentenceStarters: boolean;
  encouragesJustification: boolean;
  allowsOptionalEnglishInText: boolean;
  selfEvaluationFormat: string;
  selfEvaluationStyle: 'icons' | 'statements' | 'statements-with-note' | 'statements-with-justified-note';
  selfEvaluationNoteRequired: boolean;
}

export type SupportedGradeProfile = Omit<GradeProfile, 'grade'> & {
  grade: SupportedGrade;
};

export type CampusNodeType = 'learning-area' | 'utility';

export type AreaStatus = 'active' | 'coming-soon';

export interface CampusAreaRecord extends ContentProvenance {
  id: string;
  title: string;
  shortTitle: string;
  type: CampusNodeType;
  status: AreaStatus;
  route: string;
  summary: string;
  detailNote: string;
  accentToken: 'teal' | 'gold' | 'sage' | 'slate';
  mapPosition: {
    xPercent: number;
    yPercent: number;
  };
  connectedToIds: string[];
  upcomingTopics?: string[];
}

export type SpeechLang = 'tr-TR' | 'en-US';

export interface DialogueSegment {
  text: string;
  lang: SpeechLang;
  audioSrc?: string;
}

export interface DialogueRecord extends ContentProvenance {
  id: string;
  speaker: string;
  segments: DialogueSegment[];
  visualSupportNote?: string;
}

export type MissionStageId = 'kesfet' | 'ogren' | 'uret' | 'paylas';

export interface MissionStepDefinition {
  id: MissionStageId;
  title: string;
  areaId: string;
  areaLabel: string;
  journeyStepLabel: string;
}

export type DoorIllustrationKey =
  | 'ev'
  | 'okul'
  | 'bahce'
  | 'anadolu'
  | 'campus-gate'
  | 'indoor-door'
  | 'courtyard-gate'
  | 'sultanhani'
  | 'egri-minare'
  | 'zinciriye'
  | 'ihlara';

export interface DoorCardOption {
  id: string;
  title: string;
  illustration: DoorIllustrationKey;
  shortDescription: string;
  materialHint: string;
  periodBadge?: string;
  sourceNote?: string;
}

export interface VocabularyItem {
  id: string;
  word: string;
  turkishMeaning: string;
  exampleSentence?: string;
  exampleTurkish?: string;
  illustration?: DoorIllustrationKey;
  contrastNote?: string;
}

export interface ObservationDimension {
  id: 'malzeme' | 'bicim' | 'islev' | 'susleme';
  title: string;
  prompt: string;
  choices: string[];
}

export interface SelfEvaluationOption {
  id: string;
  label: string;
  iconKey: 'learned' | 'curious' | 'completed';
}

export interface MissionMatchOption {
  id: string;
  label: string;
  isCorrect: boolean;
  desc: string;
}

export interface MissionUiCopy {
  kesfetPrimaryBadge: string;
  kesfetPrimaryHeading: string;
  kesfetPrimaryEarlyDesc: string;
  kesfetPrimaryDesc: string;
  kesfetMiddleBadge: string;
  kesfetMiddleHeading: string;
  kesfetMiddleDesc: string;
  selectedCarryoverLabel: string;
  ogrenPrimaryHeading: string;
  ogrenMiddleHeading: string;
  ogrenPrimaryMatchQuestion: string;
  ogrenPrimaryCorrectFeedback: string;
  ogrenPrimaryMatchOptions: MissionMatchOption[];
  ogrenPrimaryContextPrefix: string;
  ogrenMiddleComparePair: [
    { word: string; meaning: string; desc: string; illustration: DoorIllustrationKey },
    { word: string; meaning: string; desc: string; illustration: DoorIllustrationKey },
  ];
  uretHeadingEarly: string;
  uretHeadingPrimary: string;
  uretHeadingMiddle: string;
  uretHintPrimary: string;
  uretHintMiddle: string;
  uretNameLabelPrimary: string;
  uretNameLabelMiddle: string;
  uretNamePlaceholderPrimary: string;
  uretNamePlaceholderMiddle: string;
  uretTextLabelPrimary: string;
  uretTextLabelMiddle: string;
  uretTextPlaceholderEarly: string;
  uretTextPlaceholderPrimary: string;
  uretTextPlaceholderMiddle: string;
  uretTextPlaceholderGrade7: string;
  artifactDefaultNamePrimary: string;
  artifactDefaultNameMiddle: string;
  materialChoices: string[];
}

export interface MissionDefinition extends ContentProvenance {
  id: string;
  title: string;
  version: string;
  status: AreaStatus;
  gradeRange: LegacyGradeLevel[];
  relatedAreaIds: string[];
  routeKind?: 'thematic-digital-route' | 'observation-mission';
  guidePromptGroup?: 'door' | 'aksaray';
  learningObjectives: {
    ilkokul: string[];
    ortaokul: string[];
  };
  steps: MissionStepDefinition[];
  contentRefs: {
    ilkokulDoors: DoorCardOption[];
    ilkokulVocabulary: VocabularyItem[];
    ortaokulDimensions: ObservationDimension[];
    ortaokulVocabulary: VocabularyItem[];
    ortaokulExampleSentence: {
      english: string;
      turkish: string;
    };
    sentenceStartersByGrade: Partial<Record<LegacyGradeLevel, string[]>>;
  };
  uiCopy?: MissionUiCopy;
  options: {
    allowFreeDrawing: boolean;
    allowShapeStamps: boolean;
    allowWrittenDesign: boolean;
    allowPngExport: boolean;
  };
  startConditions: string;
  completionConditions: string;
  selfEvaluation: {
    options: SelfEvaluationOption[];
  };
}

export type DiscoveryPreference = 'guided' | 'independent';

export type DrawingShapeType =
  | 'arch'
  | 'rectangle'
  | 'star-motif'
  | 'handle'
  | 'window'
  | 'column'
  | 'tree';

export interface DrawingStroke {
  id: string;
  color: string;
  size: number;
  points: Array<{ x: number; y: number }>;
}

export interface DrawingShapeItem {
  id: string;
  type: DrawingShapeType;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface DrawingDocument {
  width: number;
  height: number;
  backgroundColor: string;
  strokes: DrawingStroke[];
  shapes: DrawingShapeItem[];
}

export interface MissionSelections {
  selectedDoorIds: string[];
  inspectedCampusGate: boolean;
  observationNotes: Partial<Record<'malzeme' | 'bicim' | 'islev' | 'susleme', string>>;
  matchedVocabularyIds: string[];
  matchedExampleSentence: boolean;
  doorName: string;
  writtenText: string;
  materialChoice?: string;
  usedEnglishWords: string[];
}

export interface SelfEvaluationRecord {
  selectedOptionId: string | null;
  note: string;
}

export interface MissionProgress {
  missionId: string;
  missionVersion: string;
  grade: LegacyGradeLevel;
  currentStage: MissionStageId;
  completedStages: MissionStageId[];
  selections: MissionSelections;
  draftArtifactId: string | null;
  savedArtifactId?: string | null;
  artifactSavedAt?: string | null;
  selfEvaluation: SelfEvaluationRecord | null;
  completed: boolean;
  completedAt?: string | null;
  updatedAt: string;
}

export interface SavedArtifact {
  id: string;
  profileId?: string; // Öğrenci profil izolasyonu kimliği (Onarım 03A)
  missionId: string;
  missionVersion: string;
  grade: LegacyGradeLevel;
  title: string;
  doorName: string;
  writtenText: string;
  selectedDoorIds: string[];
  observations: Partial<Record<'malzeme' | 'bicim' | 'islev' | 'susleme', string>>;
  materialChoice?: string;
  usedEnglishWords: string[];
  drawingData: DrawingDocument;
  pngDataUrl: string;
  storageLocation?: 'device' | 'session-only';
  createdAt: string;
  updatedAt: string;
}

export interface CampusStudentState {
  schemaVersion: number;
  hasSeenGate: boolean;
  hasCompletedOnboarding: boolean;
  discoveryPreference: DiscoveryPreference | null;
  selectedGrade: GradeLevel | null;
  hasCompletedGuidedTour: boolean;
  speechEnabled: boolean;
  missionProgressByKey: Record<string, MissionProgress>;
  lastActiveMissionKey: string | null;
  updatedAt: string;
}
