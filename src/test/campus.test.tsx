import { describe, expect, it, beforeEach, vi } from 'vitest';
import { act, render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { GRADE_PROFILES, getGradeProfile } from '@/src/data/gradeProfiles';
import { APPROVED_WELCOME_TEXT, MISSION_GUIDE_PROMPTS, WELCOME_DIALOGUE } from '@/src/data/dialogues';
import { CAMPUS_AREAS, getLearningAreas, getUtilityAreas } from '@/src/data/campusAreas';
import { getMissionById } from '@/src/data/missions';
import {
  LOCAL_STORAGE_KEY,
  clearAllCampusData,
  getStorageStatus,
  loadStudentState,
  saveStudentState,
  createInitialStudentState,
} from '@/src/services/storage';
import { speakSegments } from '@/src/services/speech';
import { CampusProviders } from '@/src/app/CampusProviders';
import { CampusGateView } from '@/src/features/entrance/CampusGateView';
import { CourtyardWelcomeView } from '@/src/features/courtyard/CourtyardWelcomeView';
import { DeleteDataModal } from '@/src/components/DeleteDataModal';
import { CampusTopBar } from '@/src/components/CampusTopBar';
import { GuideDialogueCard } from '@/src/features/guide/GuideDialogueCard';

const EXPECTED_WELCOME_TEXT =
  'Merhaba! Welcome! Kampüsümüze hoş geldin. Ben senin kampüs arkadaşınım. İstersen birlikte gezebiliriz, istersen sen kendin keşfedebilirsin.';

describe('Sınıf Düzeyi Başlangıç Parametreleri (gradeProfiles)', () => {
  it('2–7. sınıflar için dokümandaki başlangıç değerlerini eksiksiz taşır', () => {
    expect(GRADE_PROFILES[2].maxInstructionWords).toBe(8);
    expect(GRADE_PROFILES[3].maxInstructionWords).toBe(10);
    expect(GRADE_PROFILES[4].maxInstructionWords).toBe(12);
    expect(GRADE_PROFILES[5].maxInstructionWords).toBe(15);
    expect(GRADE_PROFILES[6].maxInstructionWords).toBe(20);
    expect(GRADE_PROFILES[7].maxInstructionWords).toBe(25);

    expect(GRADE_PROFILES[2].newEnglishWordsCount).toBe(1);
    expect(GRADE_PROFILES[4].newEnglishWordsCount).toBe(1);
    expect(GRADE_PROFILES[5].newEnglishWordsCount).toBe(5);
    expect(GRADE_PROFILES[7].newEnglishWordsCount).toBe(5);

    expect(getGradeProfile(null).grade).toBe(2);
  });
});

describe('Onaylanmış Metinler ve Veri Modeli Bütünlüğü', () => {
  it('onaylanmış karşılama metnini harfiyen korur ve karma dil segmentlerini saklar', () => {
    const joined = WELCOME_DIALOGUE.segments.map((s) => s.text).join(' ');

    expect(APPROVED_WELCOME_TEXT === EXPECTED_WELCOME_TEXT).toBe(true);
    expect(joined === EXPECTED_WELCOME_TEXT).toBe(true);
    expect(APPROVED_WELCOME_TEXT).toBe(EXPECTED_WELCOME_TEXT);
    expect(joined).toBe(EXPECTED_WELCOME_TEXT);
    expect(WELCOME_DIALOGUE.segments).toEqual([
      { text: 'Merhaba!', lang: 'tr-TR' },
      { text: 'Welcome!', lang: 'en-US' },
      {
        text: 'Kampüsümüze hoş geldin. Ben senin kampüs arkadaşınım. İstersen birlikte gezebiliriz, istersen sen kendin keşfedebilirsin.',
        lang: 'tr-TR',
      },
    ]);

    expect(MISSION_GUIDE_PROMPTS.ilkokulKesfet.segments[0].text).toBe(
      'Bu kapılardan hangilerini daha önce gördün?',
    );
    expect(MISSION_GUIDE_PROMPTS.ilkokulUret.segments[0].text).toBe(
      'Bu kapıdan geçince ne gördün?',
    );
    expect(MISSION_GUIDE_PROMPTS.ortaokulKesfet.segments[0].text).toBe(
      'Sence geçmişte yapılan kapılarla bugün kullandığımız kapılar arasında hangi farklılıklar var?',
    );
  });

  it('görev aşamalarını yalnızca Keşfet → Öğren → Üret → Paylaş olarak korur', () => {
    const mission = getMissionById('kapilarin-anlattigi-hikaye');
    expect(mission?.steps.map((s) => s.title)).toEqual(['Keşfet', 'Öğren', 'Üret', 'Paylaş']);
  });

  it('3 öğrenme alanı ve 2 yardımcı kampüs işlevi ayrımını veri modelinde korur', () => {
    expect(CAMPUS_AREAS).toHaveLength(5);
    expect(getLearningAreas()).toHaveLength(3);
    expect(getUtilityAreas()).toHaveLength(2);
  });

  it('Kapıların Anlattığı Hikâye görevinde ortaokul için yalnızca belirtilen 5 İngilizce kelimeyi içerir', () => {
    const mission = getMissionById('kapilarin-anlattigi-hikaye');
    expect(mission).toBeDefined();
    const words = mission?.contentRefs.ortaokulVocabulary.map((v) => v.word);
    expect(words).toEqual(['Door', 'Gate', 'Wood', 'Stone', 'Pattern']);
    expect(mission?.contentRefs.ortaokulExampleSentence.english).toBe(
      'This door is made of wood.',
    );
  });
});

describe('Depolama Güvenliği, Bozuk Veri ve Silme', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('bozuk JSON verisinde çökmez ve bellek yedeğine geçer', () => {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, '{bozuk-json');
    const loaded = loadStudentState();
    expect(loaded.schemaVersion).toBe(1);
    expect(getStorageStatus().mode).toBe('memory-fallback');
  });

  it('geçersiz gelecek şema sürümünde mevcut veriyi silmez', () => {
    const futureData = JSON.stringify({ schemaVersion: 99, selectedGrade: 5 });
    window.localStorage.setItem(LOCAL_STORAGE_KEY, futureData);
    const loaded = loadStudentState();
    expect(loaded.schemaVersion).toBe(1);
    expect(window.localStorage.getItem(LOCAL_STORAGE_KEY)).toBe(futureData);
  });

  it('Verilerimi Sil yalnızca dek_ önekli uygulama anahtarlarını temizler', async () => {
    window.localStorage.setItem('baska_uygulama_anahtari', 'korunmali');
    const initial = createInitialStudentState();
    initial.selectedGrade = 4;
    saveStudentState(initial);

    expect(window.localStorage.getItem(LOCAL_STORAGE_KEY)).not.toBeNull();
    await clearAllCampusData();
    expect(window.localStorage.getItem(LOCAL_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem('baska_uygulama_anahtari')).toBe('korunmali');
  });
});

describe('Seslendirme Servisi Yedek Davranışı ve Karma Dil Desteği', () => {
  it('speechSynthesis yoksa çökmeden sade metin yedeği döner', async () => {
    const res = await speakSegments([{ text: 'Door', lang: 'en-US' }]);
    expect(res.spoken).toBe(false);
    expect(res.fallbackReason).toContain('kullanılamıyor');
  });

  it('GuideDialogueCard ekrandaki metinle aynı karma dil segmentlerini seslendirme servisine gönderir', async () => {
    const spokenUtterances: Array<{ text: string; lang: string }> = [];
    const originalUtterance = globalThis.SpeechSynthesisUtterance;
    const originalSynth = window.speechSynthesis;

    class MockUtterance {
      text: string;
      lang = '';
      voice: SpeechSynthesisVoice | null = null;
      rate = 1;
      pitch = 1;
      onend: ((ev: Event) => void) | null = null;
      onerror: ((ev: Event) => void) | null = null;
      constructor(text: string) {
        this.text = text;
      }
    }

    Object.defineProperty(globalThis, 'SpeechSynthesisUtterance', {
      configurable: true,
      writable: true,
      value: MockUtterance,
    });
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      writable: true,
      value: {
        getVoices: () => [
          { lang: 'tr-TR', name: 'TR' } as SpeechSynthesisVoice,
          { lang: 'en-US', name: 'EN' } as SpeechSynthesisVoice,
        ],
        speak: (utt: MockUtterance) => {
          spokenUtterances.push({ text: utt.text, lang: utt.lang });
          utt.onend?.(new Event('end'));
        },
        cancel: vi.fn(),
      },
    });

    try {
      render(<GuideDialogueCard dialogue={WELCOME_DIALOGUE} />);
      const displayedEl = screen.getByText(EXPECTED_WELCOME_TEXT);
      expect(displayedEl.textContent === EXPECTED_WELCOME_TEXT).toBe(true);

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Sesli Dinle/i }));
      });
      expect(spokenUtterances).toEqual([
        { text: 'Merhaba!', lang: 'tr-TR' },
        { text: 'Welcome!', lang: 'en-US' },
        {
          text: 'Kampüsümüze hoş geldin. Ben senin kampüs arkadaşınım. İstersen birlikte gezebiliriz, istersen sen kendin keşfedebilirsin.',
          lang: 'tr-TR',
        },
      ]);
    } finally {
      Object.defineProperty(globalThis, 'SpeechSynthesisUtterance', {
        configurable: true,
        writable: true,
        value: originalUtterance,
      });
      Object.defineProperty(window, 'speechSynthesis', {
        configurable: true,
        writable: true,
        value: originalSynth,
      });
    }
  });
});

describe('Arayüz Akışları ve İki Adımlı Silme Onayı', () => {
  it('Giriş kapısı animasyonu atlama düğmesi ile doğrudan avluya geçer', () => {
    const onEnter = vi.fn();
    render(<CampusGateView onEnterCourtyard={onEnter} />);
    fireEvent.click(screen.getByRole('button', { name: /Animasyonu Atla/i }));
    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  it('Karşılama avlusunda onaylı metni gösterir ve tercih sonrası sınıf seçimine geçer', () => {
    const onFinish = vi.fn();
    const onReplay = vi.fn();
    render(
      <MemoryRouter>
        <CampusProviders>
          <CourtyardWelcomeView onFinishToMap={onFinish} onReplayGate={onReplay} />
        </CampusProviders>
      </MemoryRouter>,
    );

    const welcomeMatches = screen.getAllByText(EXPECTED_WELCOME_TEXT);
    expect(welcomeMatches.length).toBeGreaterThan(0);
    expect(welcomeMatches[0].textContent === EXPECTED_WELCOME_TEXT).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: /Kendim keşfedeceğim/i }));
    expect(screen.getByText(/Kaçıncı sınıfa gidiyorsun/i)).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: /5\. Sınıf/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /6\. Sınıf/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /7\. Sınıf/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /3\. Sınıf/i }));
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('Verilerimi Sil penceresi iki adımlı onay ve Vazgeç seçeneği sunar', async () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <CampusProviders>
          <DeleteDataModal open={true} onClose={onClose} />
        </CampusProviders>
      </MemoryRouter>,
    );

    expect(screen.getByText(/Verilerini Silmek İstiyor musun/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Vazgeç/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Devam Et/i }));
    expect(screen.getByText(/Son Onay/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Evet, hepsini sil/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Vazgeç/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Üst gezinme çubuğu React Router bağlantılarını doğru adreslerle sunar', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <CampusProviders>
          <CampusTopBar />
        </CampusProviders>
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /Dijital Eğitim Kampüsü/i })).toHaveAttribute('href', '/');
    expect(screen.getAllByRole('link', { name: /Kampüs Avlusu/i })[0]).toHaveAttribute('href', '/');
    expect(screen.getAllByRole('link', { name: /Görev Panosu/i })[0]).toHaveAttribute('href', '/alan/gorev-panosu');
    expect(screen.getAllByRole('link', { name: /Yolculuğum/i })[0]).toHaveAttribute('href', '/yolculugum');
  });
});

import { evaluateOriginalProduction } from '@/src/utils/missionValidation';
import { createEmptyDrawing } from '@/src/features/drawing/DrawingCanvasStudio';
import { MissionRunnerView } from '@/src/features/missions/MissionRunnerView';
import { CampusMapView } from '@/src/features/campus-map/CampusMapView';
import { JourneyView } from '@/src/features/journey/JourneyView';
import { HomeRoutePage, CampusMapRoutePage } from '@/src/app/CampusPages';
import { LearningAreaView } from '@/src/features/learning-areas/LearningAreaView';
import { saveArtifact, listArtifacts } from '@/src/services/storage';
import type { SavedArtifact } from '@/src/types/campus';

describe('Özgün Üretim Doğrulama Kuralları (missionValidation)', () => {
  it('boş tuval, noktasız çizim, boşluk veya yalnızca noktalama/rakam içeren metin üretim sayılmaz', () => {
    const empty = createEmptyDrawing();
    expect(evaluateOriginalProduction(empty, '').isValid).toBe(false);
    expect(evaluateOriginalProduction(empty, '   \n\t  ').isValid).toBe(false);
    expect(evaluateOriginalProduction(empty, '!!!').isValid).toBe(false);
    expect(evaluateOriginalProduction(empty, '... ??? ---').isValid).toBe(false);
    expect(evaluateOriginalProduction(empty, '12345').isValid).toBe(false);
    expect(evaluateOriginalProduction(empty, 'a').isValid).toBe(false);
    expect(evaluateOriginalProduction(empty, 'Ev').isValid).toBe(true);
    expect(evaluateOriginalProduction(empty, 'Kapı 1').isValid).toBe(true);
    expect(
      evaluateOriginalProduction({ ...empty, strokes: [{ id: 's1', color: '#000', size: 4, points: [] }] }, '').isValid,
    ).toBe(false);
  });

  it('serbest çizim, hazır şekil veya yazılı anlatımdan yalnız biri geçerli üretim için yeterlidir', () => {
    const empty = createEmptyDrawing();

    const freeDraw = {
      ...empty,
      strokes: [{ id: 's1', color: '#0e7490', size: 6, points: [{ x: 10, y: 10 }] }],
    };
    expect(evaluateOriginalProduction(freeDraw, '')).toEqual({
      hasFreeDrawing: true,
      hasShapeDesign: false,
      hasWrittenNarrative: false,
      isValid: true,
      activeModeCount: 1,
    });

    const shapeOnly = {
      ...empty,
      shapes: [
        {
          id: 'sh1',
          type: 'arch' as const,
          x: 20,
          y: 20,
          width: 80,
          height: 100,
          color: '#0e7490',
          label: 'Kemer',
        },
      ],
    };
    expect(evaluateOriginalProduction(shapeOnly, '')).toEqual({
      hasFreeDrawing: false,
      hasShapeDesign: true,
      hasWrittenNarrative: false,
      isValid: true,
      activeModeCount: 1,
    });

    expect(evaluateOriginalProduction(empty, 'Taş kemerli bir avlu kapısı tasarladım.')).toEqual({
      hasFreeDrawing: false,
      hasShapeDesign: false,
      hasWrittenNarrative: true,
      isValid: true,
      activeModeCount: 1,
    });
  });
});

describe('IndexedDB Hata / Yokluk Durumunda Dürüst Depolama Davranışı', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await clearAllCampusData();
  });

  it('IndexedDB yoksa persisted=false döner ve eseri session-only işaretler', async () => {
    const originalIdb = window.indexedDB;
    Object.defineProperty(window, 'indexedDB', {
      configurable: true,
      value: undefined,
    });

    try {
      const sample: SavedArtifact = {
        id: 'art-test-no-idb',
        missionId: 'kapilarin-anlattigi-hikaye',
        missionVersion: '1.0.0',
        grade: 5,
        title: 'Kapıların Anlattığı Hikâye',
        doorName: 'Deneme Kapısı',
        writtenText: 'Ahşap ve taş bir arada.',
        selectedDoorIds: [],
        observations: {},
        usedEnglishWords: [],
        drawingData: createEmptyDrawing(),
        pngDataUrl: 'data:image/png;base64,iVBORw0KGgo=',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const status = await saveArtifact(sample);
      expect(status.persisted).toBe(false);
      expect(status.mode).toBe('memory-fallback');
      expect(status.warningMessage).toMatch(/kaydedilemedi/i);

      const items = await listArtifacts();
      expect(items[0]?.storageLocation).toBe('session-only');
    } finally {
      Object.defineProperty(window, 'indexedDB', {
        configurable: true,
        value: originalIdb,
      });
    }
  });
});

describe('Görev Akışı, Sınıf Düzeyi Farkları ve Kampüs Yolculuğum', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await clearAllCampusData();
  });

  it('Üret adımında boş bırakılan veya yalnızca isim girilen çalışmayla Paylaş adımına geçilmez', () => {
    const st = createInitialStudentState();
    st.selectedGrade = 4;
    st.hasSeenGate = true;
    st.hasCompletedOnboarding = true;
    saveStudentState(st);

    render(
      <MemoryRouter>
        <CampusProviders>
          <MissionRunnerView missionId="kapilarin-anlattigi-hikaye" />
        </CampusProviders>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /3\. Üret/i }));
    fireEvent.change(screen.getByLabelText(/Kapına Kısa Bir Ad Ver/i), {
      target: { value: 'Yalnızca İsim' },
    });
    fireEvent.change(screen.getByLabelText(/Kapıdan geçince ne gördüğünü kısaca yaz/i), {
      target: { value: '   ' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Kaydet ve Paylaş Adımına Geç/i }));

    expect(screen.getAllByText(/Paylaş adımına geçmeden önce/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Çalışman Hazır!/i)).not.toBeInTheDocument();
  });

  it('2. sınıf ile 4. sınıf arasında araçlar, cümle başlangıçları ve öz değerlendirme farklılaşır', () => {
    const st2 = createInitialStudentState();
    st2.selectedGrade = 2;
    st2.hasSeenGate = true;
    st2.hasCompletedOnboarding = true;
    saveStudentState(st2);

    const { unmount } = render(
      <MemoryRouter>
        <CampusProviders>
          <MissionRunnerView missionId="kapilarin-anlattigi-hikaye" />
        </CampusProviders>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /3\. Üret/i }));
    expect(screen.getByRole('button', { name: /Daha Fazla Araç ve Şekil/i })).toBeInTheDocument();
    expect(screen.getByText(/Çizim veya Şekil Yeterlidir/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+ Kapıdan geçince \.\.\. gördüm\./i })).toBeInTheDocument();
    unmount();

    const st4 = createInitialStudentState();
    st4.selectedGrade = 4;
    st4.hasSeenGate = true;
    st4.hasCompletedOnboarding = true;
    saveStudentState(st4);

    render(
      <MemoryRouter>
        <CampusProviders>
          <MissionRunnerView missionId="kapilarin-anlattigi-hikaye" />
        </CampusProviders>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /3\. Üret/i }));
    expect(screen.queryByRole('button', { name: /Daha Fazla Araç ve Şekil/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+ Seçtiğim kapının arkasında \.\.\. var\./i })).toBeInTheDocument();
  });

  it('Yalnızca yazılı anlatım ile Paylaş adımına geçilebilir ve Görevi Tamamla olmadan tamamlandı sayılmaz', async () => {
    const st = createInitialStudentState();
    st.selectedGrade = 4;
    st.hasSeenGate = true;
    st.hasCompletedOnboarding = true;
    saveStudentState(st);

    render(
      <MemoryRouter>
        <CampusProviders>
          <MissionRunnerView missionId="kapilarin-anlattigi-hikaye" />
        </CampusProviders>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /3\. Üret/i }));
    fireEvent.change(screen.getByLabelText(/Kapıdan geçince ne gördüğünü kısaca yaz/i), {
      target: { value: 'Taş malzeme kullandım çünkü uzun yıllar dayanır ve avluyu korur.' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Kaydet ve Paylaş Adımına Geç/i }));
    });

    expect(screen.getByText(/Çalışman Hazır!/i)).toBeInTheDocument();
    expect(loadStudentState().missionProgressByKey['kapilarin-anlattigi-hikaye::grade-4']?.completed).toBe(
      false,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Görevi Tamamla/i }));
    });

    expect(screen.getByText(/Görev Tamamlandı \(Çalışman Geçici Tutuluyor\)/i)).toBeInTheDocument();
    expect(loadStudentState().missionProgressByKey['kapilarin-anlattigi-hikaye::grade-4']?.completed).toBe(
      true,
    );
  });

  it('Kampüs Haritası 5 yapıyı ve çapraz karmaşasız 5 merkez yolunu render eder', () => {
    const st = createInitialStudentState();
    st.selectedGrade = 4;
    saveStudentState(st);

    const { container } = render(
      <MemoryRouter>
        <CampusProviders>
          <CampusMapView />
        </CampusProviders>
      </MemoryRouter>,
    );

    const pathLines = container.querySelectorAll('line[data-path-id^="plaza-"]');
    expect(pathLines).toHaveLength(5);
    expect(CAMPUS_AREAS.find((a) => a.id === 'gezi-ve-kesif')?.connectedToIds).toEqual([
      'ingilizce-dunyasi',
      'gorev-panosu',
    ]);
  });

  it('Kampüs Yolculuğum sayfası Görevlerim, Öğrenme Yolculuğum ve Çalışmalarım bölümlerini gösterir', async () => {
    const st = createInitialStudentState();
    st.selectedGrade = 4;
    st.missionProgressByKey['kapilarin-anlattigi-hikaye::grade-4'] = {
      missionId: 'kapilarin-anlattigi-hikaye',
      missionVersion: '1.0.0',
      grade: 4,
      currentStage: 'paylas',
      completedStages: ['kesfet', 'ogren', 'uret', 'paylas'],
      selections: {
        selectedDoorIds: [],
        inspectedCampusGate: true,
        observationNotes: {},
        matchedVocabularyIds: [],
        matchedExampleSentence: false,
        doorName: 'Selçuklu Taç Kapısı',
        writtenText: 'Geometrik yıldız desenli kapı.',
        materialChoice: 'Taş',
        usedEnglishWords: ['Stone'],
      },
      draftArtifactId: 'art-kapilarin-anlattigi-hikaye-g4',
      savedArtifactId: 'art-kapilarin-anlattigi-hikaye-g4',
      artifactSavedAt: new Date().toISOString(),
      selfEvaluation: { selectedOptionId: 'learned', note: '' },
      completed: true,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveStudentState(st);

    render(
      <MemoryRouter>
        <CampusProviders>
          <JourneyView />
        </CampusProviders>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Görevlerim' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Öğrenme Yolculuğum' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Çalışmalarım' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Tamamlanan Görevi İncele/i })).toBeInTheDocument();
    expect(await screen.findByText(/Henüz kaydedilmiş bir çizim/i)).toBeInTheDocument();
  });

  it('2. sınıfta yalnızca noktalama işareti engellenir ve IndexedDB başarısızlığında kaybolma uyarısı + belirgin PNG düğmesi gösterilir', async () => {
    const originalIdb = window.indexedDB;
    Object.defineProperty(window, 'indexedDB', {
      configurable: true,
      value: undefined,
    });

    try {
      const st = createInitialStudentState();
      st.selectedGrade = 2;
      st.hasSeenGate = true;
      st.hasCompletedOnboarding = true;
      saveStudentState(st);

      render(
        <MemoryRouter>
          <CampusProviders>
            <MissionRunnerView missionId="kapilarin-anlattigi-hikaye" />
          </CampusProviders>
        </MemoryRouter>,
      );

      fireEvent.click(screen.getByRole('button', { name: /3\. Üret/i }));
      fireEvent.change(screen.getByLabelText(/İstersen Kısaca Yaz/i), {
        target: { value: '!!!' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Kaydet ve Paylaş Adımına Geç/i }));
      expect(screen.getAllByText(/Yalnızca noktalama işareti yerine/i).length).toBeGreaterThan(0);

      fireEvent.click(screen.getByRole('button', { name: /\+ Kemer/i }));
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Kaydet ve Paylaş Adımına Geç/i }));
      });

      expect(screen.getByRole('alert')).toHaveTextContent(/Sayfayı kapattığında çalışman kaybolabilir/i);
      expect(screen.getByRole('button', { name: /Çalışmamı Şimdi PNG Olarak İndir/i })).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Görevi Tamamla/i }));
      });
      expect(screen.getByText(/Görev Adımlarını Bitirdin — Çalışmanı PNG İle Sakla!/i)).toBeInTheDocument();
    } finally {
      Object.defineProperty(window, 'indexedDB', {
        configurable: true,
        value: originalIdb,
      });
    }
  });
});

describe('Aşama 2 — Aksaray Kültürel Miras Rotası Veri ve Akış Doğrulaması', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await clearAllCampusData();
  });

  it('4 onaylı durağı ve KEŞFET → ÖĞREN → ÜRET → PAYLAŞ akışını içerir, Aksaray Ulu Cami içermez', () => {
    const mission = getMissionById('aksaray-kulturel-miras-rotasi');
    expect(mission).toBeDefined();
    expect(mission?.status).toBe('active');
    expect(mission?.routeKind).toBe('thematic-digital-route');
    expect(mission?.verificationStatus).toBe('dogrulandi');
    expect(mission?.steps.map((s) => s.title)).toEqual(['Keşfet', 'Öğren', 'Üret', 'Paylaş']);

    const stopTitles = mission?.contentRefs.ilkokulDoors.map((d) => d.title) ?? [];
    expect(stopTitles).toEqual([
      'Sultanhanı Kervansarayı',
      'Eğri Minare (Kızıl Minare)',
      'Zinciriye Medresesi',
      'Ihlara Vadisi ve Melendiz Çayı',
    ]);
    expect(stopTitles.join(' ')).not.toMatch(/Ulu Cami/i);

    expect(mission?.contentRefs.ilkokulVocabulary.map((v) => `${v.word}:${v.turkishMeaning}`)).toEqual([
      'Arch:Kemer',
    ]);
    expect(mission?.contentRefs.ortaokulVocabulary.map((v) => `${v.word}:${v.turkishMeaning}`)).toEqual([
      'Arch:Kemer',
      'Brick:Tuğla',
      'Courtyard:Avlu',
      'Valley:Vadi',
      'Heritage:Miras / Kültürel Miras',
    ]);
    expect(mission?.contentRefs.ortaokulExampleSentence.english).toBe(
      'This courtyard has a stone arch and red brick walls.',
    );
  });

  it('2. sınıfta Aksaray rotasını tek geçerli şekil üretimiyle ve Arch eşleştirmesiyle tamamlar', async () => {
    const st = createInitialStudentState();
    st.selectedGrade = 2;
    st.hasSeenGate = true;
    st.hasCompletedOnboarding = true;
    saveStudentState(st);

    render(
      <MemoryRouter>
        <CampusProviders>
          <MissionRunnerView missionId="aksaray-kulturel-miras-rotasi" />
        </CampusProviders>
      </MemoryRouter>,
    );

    expect(screen.getAllByText('Sultanhanı Kervansarayı').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Eğri Minare (Kızıl Minare)').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Zinciriye Medresesi').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ihlara Vadisi ve Melendiz Çayı').length).toBeGreaterThan(0);
    expect(screen.getByText(/Tematik Dijital Öğrenme Rotası Notu/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /2\. Öğren/i }));
    expect(screen.getByText(/"Arch" kelimesinin Türkçe karşılığı hangisidir\?/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^Kemer/i }));
    expect(screen.getByText(/Harika! "Arch", taş kapılarda/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /3\. Üret/i }));
    fireEvent.click(screen.getByRole('button', { name: /\+ Kemer/i }));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Kaydet ve Paylaş Adımına Geç/i }));
    });
    expect(screen.getByText(/Çalışman Hazır!/i)).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Görevi Tamamla/i }));
    });
    expect(
      loadStudentState().missionProgressByKey['aksaray-kulturel-miras-rotasi::grade-2']?.completed,
    ).toBe(true);
  });

  it('4. sınıfta Aksaray rotasını kemer eşleştirmesi ve yazılı anlatımla tamamlar', async () => {
    const st = createInitialStudentState();
    st.selectedGrade = 4;
    st.hasSeenGate = true;
    st.hasCompletedOnboarding = true;
    saveStudentState(st);

    render(
      <MemoryRouter>
        <CampusProviders>
          <MissionRunnerView missionId="aksaray-kulturel-miras-rotasi" />
        </CampusProviders>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /2\. Öğren/i }));
    expect(screen.getByText(/Yeni Kelimemiz: Arch — Kemer/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Kemer Kapı veya avlu/i }));
    expect(
      screen.getByText(/Harika! "Arch", taş kapılarda ve medrese girişlerinde/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /3\. Üret/i }));
    fireEvent.change(
      screen.getByLabelText(/Seçtiğin durak hakkında gördüklerini kısaca yaz/i),
      {
        target: {
          value:
            'Sultanhanı Kervansarayı taş taç kapısıyla, Eğri Minare kırmızı tuğla gövdesiyle öne çıkar.',
        },
      },
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Kaydet ve Paylaş Adımına Geç/i }));
    });
    expect(screen.getByText(/Çalışman Hazır!/i)).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Görevi Tamamla/i }));
    });
    expect(
      loadStudentState().missionProgressByKey['aksaray-kulturel-miras-rotasi::grade-4']?.completed,
    ).toBe(true);
  });
});

import {
  DESIGN_COLOR_GROUPS,
  TURKISH_FONT_STACK,
  getVisualLanguageSpec,
} from '@/src/data/designSystem';
import {
  CampusBadge,
  CampusButton,
  CampusCard,
  CampusProgressBar,
} from '@/src/components/ui/CampusDesignSystem';
import { AnatolianMotifSvg } from '@/src/components/svg/AnatolianMotifSvg';
import { DesignSystemPreviewView } from '@/src/features/design-system/DesignSystemPreviewView';

describe('Tasarım Sistemi Belirteçleri, Bileşenler ve Ön İzleme', () => {
  it('ortak renk belirteçleri, Türkçe yerel yazı tipi ve ilkokul 2–4. sınıf uyarlanabilir görsel dilini tanımlar', () => {
    expect(DESIGN_COLOR_GROUPS.flatMap((g) => g.tokens).length).toBe(12);
    expect(TURKISH_FONT_STACK).toContain('system-ui');
    expect(TURKISH_FONT_STACK).not.toMatch(/fonts\.googleapis|https?:\/\//i);

    const g2 = getVisualLanguageSpec(2);
    const g4 = getVisualLanguageSpec(4);
    expect(g2.tier).toBe('ilkokul');
    expect(g2.touchMinHeightClass).toBe('min-h-[48px]');
    expect(g4.tier).toBe('ilkokul');
    expect(g4.touchMinHeightClass).toBe('min-h-[48px]');

    // Desteklenmeyen veya eski sınıflar güvenle 2. sınıf ferah düzenine yedeklenir
    const legacyFall = getVisualLanguageSpec(7);
    expect(legacyFall.tier).toBe('ilkokul');
    expect(legacyFall.grade).toBe(2);
  });

  it('yeniden kullanılabilir düğme, kart, ilerleme göstergesi, rozet ve Anadolu motif SVG bileşenlerini render eder', () => {
    const { container } = render(
      <CampusCard tone="stone" tier="ilkokul" showCrownAccent>
        <CampusBadge tone="sage">Aktif</CampusBadge>
        <CampusProgressBar label="Test İlerlemesi" current={2} total={4} />
        <CampusButton tier="ilkokul">Deneme Düğmesi</CampusButton>
        <AnatolianMotifSvg variant="seljuk-star" title="Selçuklu Yıldızı" />
      </CampusCard>,
    );

    expect(screen.getByRole('progressbar', { name: 'Test İlerlemesi' })).toHaveAttribute(
      'aria-valuenow',
      '2',
    );
    expect(screen.getByRole('button', { name: 'Deneme Düğmesi' }).className).toContain(
      'min-h-[48px]',
    );
    expect(screen.getByRole('img', { name: 'Selçuklu Yıldızı' })).toBeInTheDocument();
    expect(container.innerHTML).not.toMatch(/#[0-9a-f]{3,6}/i);
  });

  it('Tasarım Sistemi Görsel Ön İzleme sayfası 2. ve 7. sınıf arasında görsel dili uyarlar', () => {
    render(
      <MemoryRouter initialEntries={['/tasarim-sistemi']}>
        <CampusProviders>
          <DesignSystemPreviewView />
        </CampusProviders>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: 'Dijital Eğitim Kampüsü Tasarım Sistemi' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Sınıf Düzeyi Görsel Dil Ön İzlemesi \(2\. Sınıf\)/i)).toBeInTheDocument();

    const previewGroup = screen.getByRole('group', { name: 'Sınıf düzeyi görsel dil ön izlemesi' });
    expect(within(previewGroup).queryByRole('button', { name: /^5\. Sınıf$/ })).not.toBeInTheDocument();
    expect(within(previewGroup).queryByRole('button', { name: /^7\. Sınıf$/ })).not.toBeInTheDocument();

    const grade4Btn = within(previewGroup).getByRole('button', { name: /^4\. Sınıf$/ });
    fireEvent.click(grade4Btn);
    expect(screen.getByText(/Sınıf Düzeyi Görsel Dil Ön İzlemesi \(4\. Sınıf\)/i)).toBeInTheDocument();
    expect(screen.getByText(/En çok 12 sözcüklü yönerge/i)).toBeInTheDocument();
  });
});

describe('Aşama 5.0 — Tek Girişli Yürünebilir Kampüs Deneyimi ve Navigasyon Bütünlüğü', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await clearAllCampusData();

    // Canvas 2D context mock for WalkableCampusView
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      clip: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      arc: vi.fn(),
      ellipse: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      roundRect: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      bezierCurveTo: vi.fn(),
      setLineDash: vi.fn(),
      drawImage: vi.fn(),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      createRadialGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
      createLinearGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
      textAlign: 'left',
      textBaseline: 'top',
      measureText: vi.fn().mockReturnValue({ width: 50 }),
    } as unknown as CanvasRenderingContext2D);

    HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
      left: 0,
      top: 0,
      width: 800,
      height: 600,
    });
  });

  it('1. Sinematik Taç Kapı Giriş Sahnesi: Aksaray Sultanhanı esinli görsel ve animasyonu atla düğmesi içerir', () => {
    const onEnter = vi.fn();
    render(<CampusGateView onEnterCourtyard={onEnter} />);

    expect(screen.getByRole('heading', { name: /Dijital Eğitim Kampüsü/i })).toBeInTheDocument();
    expect(screen.getByText(/Anadolu–Selçuklu Mimarisinden Esinlenen/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kapıyı Aç ve İçeri Gir/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Animasyonu Atla/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Kapıyı Aç ve İçeri Gir/i }));
    fireEvent.click(screen.getByRole('button', { name: /Animasyonu Atla/i }));
    expect(onEnter).toHaveBeenCalled();
  });

  it('2. Tek Giriş Akışı: İlk girişte Taç Kapı -> Kapı açılınca doğrudan Yürünebilir Kampüs Avlusu', async () => {
    // A: Henüz kapı görülmedi -> Taç Kapı görünür
    const { unmount } = render(
      <MemoryRouter initialEntries={['/']}>
        <CampusProviders>
          <HomeRoutePage />
        </CampusProviders>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: /Dijital Eğitim Kampüsü/i })).toBeInTheDocument();
    unmount();

    // B: Kapı görüldü -> Rehbersiz ve modalsız doğrudan Yürünebilir Kampüs yüklenir
    const st2 = createInitialStudentState();
    st2.hasSeenGate = true;
    saveStudentState(st2);

    const { unmount: unmount2 } = render(
      <MemoryRouter initialEntries={['/']}>
        <CampusProviders>
          <HomeRoutePage />
        </CampusProviders>
      </MemoryRouter>,
    );

    // Modal karşılama veya rehberli tur ekranı değil, doğrudan walkable-canvas açılır
    expect(await screen.findByTestId('walkable-canvas')).toBeInTheDocument();
    expect(screen.queryByText(/Rehber Eşliğinde Gez/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Kuşbakışı Harita/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Doğrudan Sınıfa Gir/i)).not.toBeInTheDocument();
    unmount2();

    // C: Karakteriyle avluda serbestçe dolaşabilir
    const st3 = createInitialStudentState();
    st3.hasSeenGate = true;
    st3.hasCompletedOnboarding = true;
    st3.selectedGrade = 4;
    saveStudentState(st3);

    render(
      <MemoryRouter initialEntries={['/']}>
        <CampusProviders>
          <HomeRoutePage />
        </CampusProviders>
      </MemoryRouter>,
    );

    expect(await screen.findByTestId('walkable-canvas')).toBeInTheDocument();
    // Kuşbakışı harita veya doğrudan sınıfa gir gibi eski çift giriş butonları yoktur
    expect(screen.queryByText(/Kuşbakışı Harita/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Doğrudan Sınıfa Gir/i)).not.toBeInTheDocument();
  });

  it('3. /harita adresi yönlendirme döngüsü veya 404 olmadan doğrudan anasayfaya (/) yönlendirir', () => {
    render(
      <MemoryRouter initialEntries={['/harita']}>
        <CampusProviders>
          <CampusMapRoutePage />
        </CampusProviders>
      </MemoryRouter>,
    );

    expect(screen.queryByText(/Sayfa Bulunamadı/i)).not.toBeInTheDocument();
  });

  it('4. Öğrenme alanları ve gezinme bileşenlerindeki geri dönüş düğmeleri "Kampüs Avlusuna Dön" hedefini korur', () => {
    render(
      <MemoryRouter initialEntries={['/alan/gezi-ve-kesif']}>
        <CampusProviders>
          <LearningAreaView areaId="gezi-ve-kesif" />
        </CampusProviders>
      </MemoryRouter>,
    );

    const backLink = screen.getByRole('link', { name: /Kampüs Avlusuna Dön/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/');
  });
});




