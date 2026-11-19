import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import {
  SUPPORTED_GRADES,
  LEGACY_GRADES,
  isSupportedGrade,
  isLegacyGrade,
} from '@/src/types/campus';
import { GRADE_LIST, getGradeProfile } from '@/src/data/gradeProfiles';
import {
  createInitialStudentState,
  loadStudentState,
  saveStudentState,
  clearAllCampusData,
  LOCAL_STORAGE_KEY,
} from '@/src/services/storage';
import { CampusProviders } from '@/src/app/CampusProviders';
import { GradeBoardModal } from '@/src/features/walkable/components/GradeBoardModal';
import { CampusTopBar } from '@/src/components/CampusTopBar';
import { JourneyView } from '@/src/features/journey/JourneyView';
import { MissionRoutePage, LearningAreaRoutePage } from '@/src/app/CampusPages';

describe('ONARIM 01 — İlkokul Kapsamı (2, 3, 4. Sınıflar) Doğrulaması', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await clearAllCampusData();
  });

  it('1. Merkezi Sınıf Yapılandırması: SUPPORTED_GRADES yalnızca 2, 3 ve 4 değerlerini içerir', () => {
    expect(SUPPORTED_GRADES).toEqual([2, 3, 4]);
    expect(LEGACY_GRADES).toEqual([2, 3, 4, 5, 6, 7]);

    // isSupportedGrade
    expect(isSupportedGrade(2)).toBe(true);
    expect(isSupportedGrade(3)).toBe(true);
    expect(isSupportedGrade(4)).toBe(true);
    expect(isSupportedGrade(1)).toBe(false);
    expect(isSupportedGrade(5)).toBe(false);
    expect(isSupportedGrade(6)).toBe(false);
    expect(isSupportedGrade(7)).toBe(false);
    expect(isSupportedGrade(null)).toBe(false);
    expect(isSupportedGrade(undefined)).toBe(false);
    expect(isSupportedGrade('3')).toBe(false);
    expect(isSupportedGrade(99)).toBe(false);

    // isLegacyGrade
    expect(isLegacyGrade(5)).toBe(true);
    expect(isLegacyGrade(6)).toBe(true);
    expect(isLegacyGrade(7)).toBe(true);
    expect(isLegacyGrade(1)).toBe(false);
    expect(isLegacyGrade(8)).toBe(false);
  });

  it('2. GRADE_LIST yalnızca 2, 3 ve 4. sınıf profillerini barındırır', () => {
    expect(GRADE_LIST.map((g) => g.grade)).toEqual([2, 3, 4]);
    expect(GRADE_LIST.every((g) => g.tier === 'ilkokul')).toBe(true);

    // getGradeProfile desteklenmeyen sınıflarda güvenle 2. sınıfa döner
    expect(getGradeProfile(5).grade).toBe(2);
    expect(getGradeProfile(7).grade).toBe(2);
    expect(getGradeProfile(null).grade).toBe(2);
    expect(getGradeProfile(3).grade).toBe(3);
  });

  it('3. Sınıf Seçim Panosu (GradeBoardModal) yalnızca 2, 3 ve 4 seçeneklerini sunar', () => {
    const handleSelect = vi.fn();
    render(
      <GradeBoardModal
        isOpen={true}
        onClose={vi.fn()}
        selectedGrade={null}
        onSelectGrade={handleSelect}
      />,
    );

    // Yalnızca İlkokul Kademesi başlığı
    expect(screen.getByText(/İlkokul Kademesi/i)).toBeInTheDocument();
    expect(screen.queryByText(/Ortaokul Kademesi/i)).not.toBeInTheDocument();

    // 2, 3, 4 sınıfları var
    expect(screen.getByRole('button', { name: /2\. Sınıf/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /3\. Sınıf/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /4\. Sınıf/i })).toBeInTheDocument();

    // 5, 6, 7 kesinlikle yok
    expect(screen.queryByRole('button', { name: /5\. Sınıf/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /6\. Sınıf/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /7\. Sınıf/i })).not.toBeInTheDocument();

    // Seçim yapılmamışken bilgilendirme mesajı
    expect(
      screen.getByText(/Kampüsümüz artık 2, 3 ve 4\. sınıflara yönelik çalışmalar sunuyor/i),
    ).toBeInTheDocument();

    // 3. sınıfı seçip kaydetme
    fireEvent.click(screen.getByRole('button', { name: /3\. Sınıf/i }));
    expect(handleSelect).toHaveBeenCalledWith(3);
  });

  it('4. Üst Gezinme Çubuğu (CampusTopBar) menüsünde yalnızca 2, 3 ve 4 seçenekleri sunulur', () => {
    render(
      <MemoryRouter>
        <CampusProviders>
          <CampusTopBar />
        </CampusProviders>
      </MemoryRouter>,
    );

    // Menü çekmecesini aç
    const openDrawerBtn = screen.getByRole('button', { name: /Sınıf Seç|Sınıf/i });
    fireEvent.click(openDrawerBtn);

    const gradeGroup = screen.getByRole('group', { name: 'Sınıf seçimi' });
    expect(gradeGroup).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /^2\. Sınıf$/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^3\. Sınıf$/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^4\. Sınıf$/ })).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: /^5\. Sınıf$/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^6\. Sınıf$/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^7\. Sınıf$/ })).not.toBeInTheDocument();
  });

  it('5. Senaryo 6, 7, 8: Eski 5, 6, 7. sınıf verisiyle giriş yapan öğrencinin selectedGrade değeri null olur', () => {
    for (const legacyGrade of [5, 6, 7]) {
      const rawState = {
        schemaVersion: 1,
        selectedGrade: legacyGrade,
        hasSeenGate: true,
        hasCompletedOnboarding: true,
        speechEnabled: true,
        discoveryPreference: 'free',
        missionProgressByKey: {},
        updatedAt: new Date().toISOString(),
      };
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rawState));

      const loaded = loadStudentState();
      expect(loaded.selectedGrade).toBeNull();
    }
  });

  it('6. Senaryo 9: Eski 5, 6, 7. sınıf öğrencinin geçmiş ilerleme kayıtları ASLA silinmez', () => {
    const rawState = {
      schemaVersion: 1,
      selectedGrade: 5,
      hasSeenGate: true,
      hasCompletedOnboarding: true,
      speechEnabled: true,
      discoveryPreference: 'free',
      missionProgressByKey: {
        'kapilarin-anlattigi-hikaye::grade-5': {
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
            doorName: 'Tarihi Kervansaray Kapısı',
            writtenText: 'Eski ortaokul çalışmam',
            materialChoice: 'Taş',
            usedEnglishWords: ['Door', 'Stone'],
          },
          completed: true,
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rawState));

    const loaded = loadStudentState();
    // Sınıf seçimi sıfırlandı ancak geçmiş kayıt korundu
    expect(loaded.selectedGrade).toBeNull();
    expect(loaded.missionProgressByKey['kapilarin-anlattigi-hikaye::grade-5']).toBeDefined();
    expect(
      loaded.missionProgressByKey['kapilarin-anlattigi-hikaye::grade-5'].completed,
    ).toBe(true);
  });

  it('7. Senaryo 10: Bozuk veya geçersiz sınıf verisi (-1, 99, "abc") uygulamanın çökmesini engeller ve null yapar', () => {
    const invalidInputs = [-1, 0, 1, 99, 'abc', {}, []];
    for (const invalid of invalidInputs) {
      const rawState = {
        schemaVersion: 1,
        selectedGrade: invalid,
        hasSeenGate: true,
        hasCompletedOnboarding: true,
        speechEnabled: true,
        discoveryPreference: 'free',
        missionProgressByKey: {},
        updatedAt: new Date().toISOString(),
      };
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rawState));

      const loaded = loadStudentState();
      expect(loaded.selectedGrade).toBeNull();
    }
  });

  it('8. Senaryo 11: Desteklenen sınıf seçilmemişse doğrudan görev (/gorev/...) veya alan (/alan/...) URL erişimi ana sayfaya yönlendirir', () => {
    // Sınıf seçilmemiş durum
    const st = createInitialStudentState();
    st.selectedGrade = null;
    saveStudentState(st);

    const { unmount } = render(
      <MemoryRouter initialEntries={['/gorev/kapilarin-anlattigi-hikaye']}>
        <CampusProviders>
          <Routes>
            <Route path="/" element={<div data-testid="courtyard-home">Anasayfa Avlu</div>} />
            <Route path="/gorev/:id" element={<MissionRoutePage />} />
          </Routes>
        </CampusProviders>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('courtyard-home')).toBeInTheDocument();
    expect(screen.queryByText(/1\. Keşfet/i)).not.toBeInTheDocument();
    unmount();

    // Alan URL'si için doğrudan erişim kontrolü
    render(
      <MemoryRouter initialEntries={['/alan/ingilizce-dunyasi']}>
        <CampusProviders>
          <Routes>
            <Route path="/" element={<div data-testid="courtyard-home">Anasayfa Avlu</div>} />
            <Route path="/alan/:id" element={<LearningAreaRoutePage />} />
          </Routes>
        </CampusProviders>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('courtyard-home')).toBeInTheDocument();
  });

  it('9. Yolculuğum Sayfası: Eski ortaokul kayıtlarını Arşiv Kaydı olarak gösterir ve ortaokul görevini başlatmaz', () => {
    const st = createInitialStudentState();
    st.selectedGrade = 3;
    st.missionProgressByKey['kapilarin-anlattigi-hikaye::grade-5'] = {
      missionId: 'kapilarin-anlattigi-hikaye',
      missionVersion: '1.0.0',
      grade: 5,
      currentStage: 'paylas',
      completedStages: ['kesfet', 'ogren'],
      selections: {
        selectedDoorIds: [],
        inspectedCampusGate: true,
        observationNotes: {},
        matchedVocabularyIds: [],
        matchedExampleSentence: false,
        doorName: 'Selçuklu Kapısı',
        writtenText: 'Eski kayıt',
        materialChoice: 'Taş',
        usedEnglishWords: [],
      },
      completed: false,
      draftArtifactId: null,
      savedArtifactId: null,
      selfEvaluation: null,
      updatedAt: new Date().toISOString(),
    };
    saveStudentState(st);

    render(
      <MemoryRouter initialEntries={['/yolculugum']}>
        <CampusProviders>
          <JourneyView />
        </CampusProviders>
      </MemoryRouter>,
    );

    expect(screen.getByText(/Arşiv Kaydı \(5\. Sınıf\)/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Kaldığım Yerden Devam Et/i })).not.toBeInTheDocument();
  });
});
