import { describe, expect, it, beforeEach, vi } from 'vitest';
import { act, render, screen, fireEvent } from '@testing-library/react';
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
    initial.selectedGrade = 6;
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

    fireEvent.click(screen.getByRole('button', { name: /5\. Sınıf/i }));
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
      <MemoryRouter initialEntries={['/harita']}>
        <CampusProviders>
          <CampusTopBar />
        </CampusProviders>
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /Dijital Eğitim Kampüsü/i })).toHaveAttribute('href', '/harita');
    expect(screen.getAllByRole('link', { name: /Kampüs Haritası/i })[0]).toHaveAttribute('href', '/harita');
    expect(screen.getAllByRole('link', { name: /Görev Panosu/i })[0]).toHaveAttribute('href', '/alan/gorev-panosu');
    expect(screen.getAllByRole('link', { name: /Yolculuğum/i })[0]).toHaveAttribute('href', '/yolculugum');
  });
});

import { evaluateOriginalProduction } from '@/src/utils/missionValidation';
import { createEmptyDrawing } from '@/src/features/drawing/DrawingCanvasStudio';
import { MissionRunnerView } from '@/src/features/missions/MissionRunnerView';
import { CampusMapView } from '@/src/features/campus-map/CampusMapView';
import { JourneyView } from '@/src/features/journey/JourneyView';
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
    st.selectedGrade = 5;
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
    fireEvent.change(screen.getByLabelText(/Tasarladığın Kapının Adı/i), {
      target: { value: 'Yalnızca İsim' },
    });
    fireEvent.change(screen.getByLabelText(/Kapı Tasarımını ve Seçim Gerekçeni Açıkla/i), {
      target: { value: '   ' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Kaydet ve Paylaş Adımına Geç/i }));

    expect(screen.getAllByText(/Paylaş adımına geçmeden önce/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Çalışman Hazır!/i)).not.toBeInTheDocument();
  });

  it('2. sınıf ile 7. sınıf arasında araçlar, cümle başlangıçları ve öz değerlendirme farklılaşır', () => {
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

    const st7 = createInitialStudentState();
    st7.selectedGrade = 7;
    st7.hasSeenGate = true;
    st7.hasCompletedOnboarding = true;
    saveStudentState(st7);

    render(
      <MemoryRouter>
        <CampusProviders>
          <MissionRunnerView missionId="kapilarin-anlattigi-hikaye" />
        </CampusProviders>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /3\. Üret/i }));
    expect(screen.queryByRole('button', { name: /Daha Fazla Araç ve Şekil/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Tasarım Malzemesi Seç/i)).toBeInTheDocument();
    expect(screen.queryByText(/İstersen bir başlangıç cümlesine dokunarak ekle/i)).not.toBeInTheDocument();
  });

  it('Yalnızca yazılı anlatım ile Paylaş adımına geçilebilir ve Görevi Tamamla olmadan tamamlandı sayılmaz', async () => {
    const st = createInitialStudentState();
    st.selectedGrade = 6;
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
    fireEvent.change(screen.getByLabelText(/Kapı Tasarımını ve Seçim Gerekçeni Açıkla/i), {
      target: { value: 'Taş malzeme kullandım çünkü uzun yıllar dayanır ve avluyu korur.' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Kaydet ve Paylaş Adımına Geç/i }));
    });

    expect(screen.getByText(/Çalışman Hazır!/i)).toBeInTheDocument();
    expect(loadStudentState().missionProgressByKey['kapilarin-anlattigi-hikaye::grade-6']?.completed).toBe(
      false,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Görevi Tamamla/i }));
    });

    expect(screen.getByText(/Görev Tamamlandı \(Çalışman Geçici Tutuluyor\)/i)).toBeInTheDocument();
    expect(loadStudentState().missionProgressByKey['kapilarin-anlattigi-hikaye::grade-6']?.completed).toBe(
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
    st.selectedGrade = 5;
    st.missionProgressByKey['kapilarin-anlattigi-hikaye::grade-5'] = {
      missionId: 'kapilarin-anlattigi-hikaye',
      missionVersion: '1.0.0',
      grade: 5,
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
      draftArtifactId: 'art-kapilarin-anlattigi-hikaye-g5',
      savedArtifactId: 'art-kapilarin-anlattigi-hikaye-g5',
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

