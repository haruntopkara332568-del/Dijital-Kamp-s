import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import {
  loadStudentProfiles,
  getActiveProfileId,
  setActiveProfileId,
  createStudentProfile,
  updateStudentProfile,
  deleteStudentProfile,
  loadStudentStateForProfile,
  saveStudentStateForProfile,
  runLegacyMigrationIfNeeded,
  saveArtifact,
  listArtifacts,
  clearAllCampusData,
  LOCAL_STORAGE_KEY,
  LOCAL_STORAGE_MIGRATED_KEY,
  getProfileStateKey,
} from '@/src/services/storage';
import { CampusProviders, useCampus } from '@/src/app/CampusProviders';
import { CampusTopBar } from '@/src/components/CampusTopBar';
import { SUPPORTED_GRADES, type SavedArtifact } from '@/src/types/campus';

function TestProfileConsumer() {
  const {
    profiles,
    activeProfile,
    state,
    createProfile,
    switchProfile,
    saveMissionProgress,
    getMissionProgress,
    openProfileModal,
  } = useCampus();

  return (
    <div>
      <div data-testid="active-alias">{activeProfile?.alias ?? 'NO_ACTIVE_ALIAS'}</div>
      <div data-testid="active-grade">{state.selectedGrade ?? 'NO_GRADE'}</div>
      <div data-testid="profiles-count">{profiles.length}</div>
      <button
        onClick={() => createProfile('Bilgin', 'avatar_2', 4)}
        data-testid="create-bilgin-btn"
      >
        Create Bilgin 4
      </button>
      <button
        onClick={() => {
          const gezgin = profiles.find((p) => p.alias === 'Gezgin');
          if (gezgin) switchProfile(gezgin.id);
        }}
        data-testid="switch-gezgin-btn"
      >
        Switch Gezgin
      </button>
      <button
        onClick={() => {
          const bilgin = profiles.find((p) => p.alias === 'Bilgin');
          if (bilgin) switchProfile(bilgin.id);
        }}
        data-testid="switch-bilgin-btn"
      >
        Switch Bilgin
      </button>
      <button
        onClick={() => {
          saveMissionProgress({
            missionId: 'english-smartboard-station-1',
            missionVersion: '1.0.0',
            grade: 3,
            currentStage: 'ogren',
            completedStages: ['kesfet', 'ogren'],
            selections: {
              selectedDoorIds: [],
              inspectedCampusGate: true,
              observationNotes: {},
              matchedVocabularyIds: ['hello', 'good-morning'],
              matchedExampleSentence: true,
              doorName: '',
              writtenText: '',
              usedEnglishWords: [],
            },
            draftArtifactId: null,
            selfEvaluation: null,
            completed: true,
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }}
        data-testid="complete-table-1-btn"
      >
        Complete Table 1
      </button>
      <div data-testid="table-1-status">
        {getMissionProgress('english-smartboard-station-1', 3)?.completed ? 'COMPLETED' : 'INCOMPLETE'}
      </div>
      <button onClick={openProfileModal} data-testid="open-modal-btn">
        Open Profile Modal
      </button>
    </div>
  );
}

describe('ONARIM 03A — Cihaz Tabanlı Öğrenci Profil Altyapısı ve Doğrulama Senaryoları', () => {
  beforeEach(async () => {
    await clearAllCampusData();
    window.localStorage.clear();
  });

  afterEach(async () => {
    await clearAllCampusData();
    window.localStorage.clear();
  });

  describe('Grup 1: Profil Veri Modeli ve Oluşturma (Senaryo 1-6)', () => {
    it('Senaryo 1: Başlangıçta kayıtlı profil yoksa boş liste döner', () => {
      const profiles = loadStudentProfiles();
      expect(profiles).toEqual([]);
      expect(getActiveProfileId()).toBeNull();
    });

    it('Senaryo 2: Geçerli takma ad (Gezgin), avatar ve 3. sınıf ile profil başarıyla oluşturulur', () => {
      const p = createStudentProfile('Gezgin', 'avatar_1', 3);
      expect(p.id).toMatch(/^prof_/);
      expect(p.alias).toBe('Gezgin');
      expect(p.avatarId).toBe('avatar_1');
      expect(p.selectedGrade).toBe(3);
      expect(p.createdAt).toBeDefined();

      const list = loadStudentProfiles();
      expect(list.length).toBe(1);
      expect(list[0].alias).toBe('Gezgin');
      expect(getActiveProfileId()).toBe(p.id);
    });

    it('Senaryo 3 & 4: Yalnızca ilkokul 2, 3 ve 4. sınıf kabul edilir; 1 veya 5-7 reddedilir', () => {
      expect(SUPPORTED_GRADES).toEqual([2, 3, 4]);

      // 2, 3, 4 geçerlidir
      expect(() => createStudentProfile('Öğrenci 2', 'avatar_1', 2)).not.toThrow();
      expect(() => createStudentProfile('Öğrenci 3', 'avatar_2', 3)).not.toThrow();
      expect(() => createStudentProfile('Öğrenci 4', 'avatar_3', 4)).not.toThrow();

      // 1. sınıf veya ortaokul geçersizdir
      // @ts-expect-error test invalid grade
      expect(() => createStudentProfile('Hatalı 1', 'avatar_1', 1)).toThrow();
      // @ts-expect-error test invalid grade
      expect(() => createStudentProfile('Hatalı 5', 'avatar_1', 5)).toThrow();
    });

    it('Senaryo 5: Özel takma ad serbestçe yazılabilir', () => {
      const p = createStudentProfile('Yıldız Kâşif', 'avatar_4', 3);
      expect(p.alias).toBe('Yıldız Kâşif');
      const loaded = loadStudentProfiles();
      expect(loaded.find((x) => x.alias === 'Yıldız Kâşif')).toBeDefined();
    });

    it('Senaryo 6: Boş veya yalnızca boşluktan oluşan takma ada izin verilmez', () => {
      expect(() => createStudentProfile('', 'avatar_1', 3)).toThrow();
      expect(() => createStudentProfile('   ', 'avatar_1', 3)).toThrow();
    });
  });

  describe('Grup 2: KRİTİK 2 ÖĞRENCİ SENARYOSU ve Profil İzolasyonu (Senaryo 7-14)', () => {
    it('KRİTİK TEST: Gezgin (3. Sınıf) ve Bilgin (4. Sınıf) masa ilerlemesi ve sınıf izolasyonu tamdır', () => {
      // 1. Öğrenci: Gezgin (3. Sınıf) oluştur
      const gezgin = createStudentProfile('Gezgin', 'avatar_1', 3);
      expect(gezgin.alias).toBe('Gezgin');
      expect(getActiveProfileId()).toBe(gezgin.id);

      // Gezgin için İngilizce Masası 1 ilerlemesi kaydet
      const gezginState = loadStudentStateForProfile(gezgin.id);
      gezginState.missionProgressByKey['english-station-1::grade-3'] = {
        missionId: 'english-station-1',
        missionVersion: '1.0.0',
        grade: 3,
        currentStage: 'paylas',
        completedStages: ['kesfet', 'ogren', 'uret', 'paylas'],
        selections: {
          selectedDoorIds: [],
          inspectedCampusGate: true,
          observationNotes: {},
          matchedVocabularyIds: ['hello', 'hi'],
          matchedExampleSentence: true,
          doorName: '',
          writtenText: '',
          usedEnglishWords: [],
        },
        draftArtifactId: null,
        selfEvaluation: null,
        completed: true,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveStudentStateForProfile(gezginState, gezgin.id);

      // Doğrula: Gezgin'de masa 1 tamamlandı
      expect(loadStudentStateForProfile(gezgin.id).missionProgressByKey['english-station-1::grade-3'].completed).toBe(true);

      // 2. Öğrenci: Bilgin (4. Sınıf) oluştur
      const bilgin = createStudentProfile('Bilgin', 'avatar_2', 4);
      expect(bilgin.alias).toBe('Bilgin');
      expect(getActiveProfileId()).toBe(bilgin.id);

      // Bilgin'in durumunu kontrol et:
      const bilginState = loadStudentStateForProfile(bilgin.id);
      expect(bilginState.selectedGrade).toBe(4);
      // İZOLASYON: Gezgin'in masa 1 ilerlemesi Bilgin'de KESİNLİKLE YOKTUR!
      expect(bilginState.missionProgressByKey['english-station-1::grade-3']).toBeUndefined();
      expect(Object.keys(bilginState.missionProgressByKey).length).toBe(0);

      // 3. Tekrar Gezgin'e geçiş yap
      setActiveProfileId(gezgin.id);
      expect(getActiveProfileId()).toBe(gezgin.id);

      // Gezgin'in verisi aynen korunmuştur!
      const reloadedGezginState = loadStudentStateForProfile(gezgin.id);
      expect(reloadedGezginState.selectedGrade).toBe(3);
      expect(reloadedGezginState.missionProgressByKey['english-station-1::grade-3'].completed).toBe(true);
    });

    it('Senaryo 13 & 14: Üçüncü bir öğrenci (Kâşif, 2. Sınıf) bağımsız olarak eklenir ve yönetilir', () => {
      createStudentProfile('Gezgin', 'avatar_1', 3);
      createStudentProfile('Bilgin', 'avatar_2', 4);
      const kasif = createStudentProfile('Kâşif', 'avatar_3', 2);

      const profiles = loadStudentProfiles();
      expect(profiles.length).toBe(3);
      expect(getActiveProfileId()).toBe(kasif.id);
      expect(loadStudentStateForProfile(kasif.id).selectedGrade).toBe(2);
    });
  });

  describe('Grup 3: Çizim ve Eser İzolasyonu (Senaryo 15-18)', () => {
    it('Senaryo 15-18: Öğrenci çizimleri yalnızca kendi profiline aittir; diğer öğrenci göremez', async () => {
      const gezgin = createStudentProfile('Gezgin', 'avatar_1', 3);
      const bilgin = createStudentProfile('Bilgin', 'avatar_2', 4);

      // Gezgin için çizim kaydet
      setActiveProfileId(gezgin.id);
      const gezginArtifact: SavedArtifact = {
        id: 'art_gezgin_1',
        profileId: gezgin.id,
        missionId: 'seljuk-arch',
        missionVersion: '1.0.0',
        grade: 3,
        title: 'Gezgin Kemer Çizimi',
        doorName: 'Gezgin Kapısı',
        writtenText: 'Selçuklu taş kemeri',
        selectedDoorIds: [],
        observations: {},
        usedEnglishWords: [],
        drawingData: { width: 400, height: 300, backgroundColor: '#fff', strokes: [], shapes: [] },
        pngDataUrl: 'data:image/png;base64,sample',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await saveArtifact(gezginArtifact, gezgin.id);

      // Gezgin kendi çizimini görür
      const gezginList = await listArtifacts(gezgin.id);
      expect(gezginList.length).toBe(1);
      expect(gezginList[0].title).toBe('Gezgin Kemer Çizimi');

      // Bilgin Gezgin'in çizimini GÖRMEZ (boş liste döner)
      setActiveProfileId(bilgin.id);
      const bilginList = await listArtifacts(bilgin.id);
      expect(bilginList.length).toBe(0);

      // Bilgin kendi çizimini kaydeder
      const bilginArtifact: SavedArtifact = {
        id: 'art_bilgin_1',
        profileId: bilgin.id,
        missionId: 'seljuk-star',
        missionVersion: '1.0.0',
        grade: 4,
        title: 'Bilgin Yıldız Çizimi',
        doorName: 'Bilgin Kapısı',
        writtenText: 'Sekiz köşeli yıldız',
        selectedDoorIds: [],
        observations: {},
        usedEnglishWords: [],
        drawingData: { width: 400, height: 300, backgroundColor: '#fff', strokes: [], shapes: [] },
        pngDataUrl: 'data:image/png;base64,sample2',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await saveArtifact(bilginArtifact, bilgin.id);

      // Bilgin yalnızca kendi çizimini görür
      const bilginListAfter = await listArtifacts(bilgin.id);
      expect(bilginListAfter.length).toBe(1);
      expect(bilginListAfter[0].title).toBe('Bilgin Yıldız Çizimi');

      // Gezgin de yalnızca kendi çizimini görür
      const gezginListAfter = await listArtifacts(gezgin.id);
      expect(gezginListAfter.length).toBe(1);
      expect(gezginListAfter[0].title).toBe('Gezgin Kemer Çizimi');
    });
  });

  describe('Grup 4: Güvenli Göç (Legacy Migration) (Senaryo 19-24)', () => {
    it('Senaryo 19-21: Eski dek_campus_v1_state otomatik olarak Gezgin profiline aktarılır ve döngüye girmez', () => {
      // Eski tekil sistem simülasyonu
      const oldState = {
        schemaVersion: 1,
        selectedGrade: 3,
        hasSeenGate: true,
        hasCompletedOnboarding: true,
        speechEnabled: true,
        discoveryPreference: 'independent',
        missionProgressByKey: {
          'mission-gate::grade-3': {
            missionId: 'mission-gate',
            grade: 3,
            completed: true,
            completedStages: ['kesfet', 'ogren'],
          },
        },
        updatedAt: '2026-01-01T10:00:00.000Z',
      };
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(oldState));

      // Göçü çalıştır
      runLegacyMigrationIfNeeded();

      // Bayrak set edilmiş olmalıdır
      expect(window.localStorage.getItem(LOCAL_STORAGE_MIGRATED_KEY)).toBe('true');

      // Gezgin profili oluşturulmuş olmalıdır
      const profiles = loadStudentProfiles();
      expect(profiles.length).toBe(1);
      expect(profiles[0].id).toBe('prof_legacy_student');
      expect(profiles[0].alias).toBe('Gezgin');
      expect(profiles[0].selectedGrade).toBe(3);

      // Gezgin'in izole durumunda eski ilerleme yer almalıdır
      const migratedState = loadStudentStateForProfile('prof_legacy_student');
      expect(migratedState.selectedGrade).toBe(3);
      expect(migratedState.missionProgressByKey['mission-gate::grade-3'].completed).toBe(true);

      // Göç ikinci kez çalıştırıldığında veriyi ezmez
      runLegacyMigrationIfNeeded();
      expect(loadStudentProfiles().length).toBe(1);
    });

    it('Senaryo 22: Eski 5, 6 veya 7. sınıf kaydı varsa güvenli default atanır', () => {
      const oldStateGrade5 = {
        schemaVersion: 1,
        selectedGrade: 5,
        hasSeenGate: true,
        missionProgressByKey: {},
        updatedAt: '2026-01-01T10:00:00.000Z',
      };
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(oldStateGrade5));

      runLegacyMigrationIfNeeded();

      const profiles = loadStudentProfiles();
      expect(profiles[0].selectedGrade).toBe(3); // Güvenli ilkokul varsayılanı
    });
  });

  describe('Grup 5: Profil Düzenleme ve Sınıf Değişimi (Senaryo 25-28)', () => {
    it('Senaryo 25-28: Öğrencinin sınıfını veya takma adını güncellemesi diğer profilleri etkilemez', () => {
      const p1 = createStudentProfile('Gezgin', 'avatar_1', 3);
      const p2 = createStudentProfile('Bilgin', 'avatar_2', 4);

      // Gezgin'in sınıfını 2 yap
      updateStudentProfile(p1.id, { selectedGrade: 2, alias: 'Süper Gezgin' });

      const reloadedP1 = loadStudentProfiles().find((p) => p.id === p1.id);
      expect(reloadedP1?.selectedGrade).toBe(2);
      expect(reloadedP1?.alias).toBe('Süper Gezgin');

      // Bilgin kesinlikle etkilenmez
      const reloadedP2 = loadStudentProfiles().find((p) => p.id === p2.id);
      expect(reloadedP2?.selectedGrade).toBe(4);
      expect(reloadedP2?.alias).toBe('Bilgin');
    });
  });

  describe('Grup 6: Profil Silme ve Veri Temizliği (Senaryo 29-32)', () => {
    it('Senaryo 29-32: Bir profil silindiğinde yalnızca onun verileri temizlenir; diğer profiller kalır', async () => {
      const gezgin = createStudentProfile('Gezgin', 'avatar_1', 3);
      const bilgin = createStudentProfile('Bilgin', 'avatar_2', 4);

      // Gezgin'in çizimini kaydet
      await saveArtifact({
        id: 'art_gezgin_del',
        profileId: gezgin.id,
        missionId: 'm1',
        missionVersion: '1.0.0',
        grade: 3,
        title: 'Silinecek Çizim',
        doorName: '',
        writtenText: '',
        selectedDoorIds: [],
        observations: {},
        usedEnglishWords: [],
        drawingData: { width: 100, height: 100, backgroundColor: '#fff', strokes: [], shapes: [] },
        pngDataUrl: '',
        createdAt: '',
        updatedAt: '',
      }, gezgin.id);

      // Gezgin profilini sil
      const result = await deleteStudentProfile(gezgin.id);

      // Kalan profillerde yalnızca Bilgin olmalı
      expect(result.remainingProfiles.length).toBe(1);
      expect(result.remainingProfiles[0].id).toBe(bilgin.id);
      expect(result.nextActiveProfileId).toBe(bilgin.id);

      // Gezgin'in state'i localStorage'dan silinmiş olmalı
      expect(window.localStorage.getItem(getProfileStateKey(gezgin.id))).toBeNull();

      // Gezgin'in çizimleri silinmiş olmalı
      const gezginArts = await listArtifacts(gezgin.id);
      expect(gezginArts.length).toBe(0);

      // Bilgin ve verileri sapasağlam duruyor
      const bilginState = loadStudentStateForProfile(bilgin.id);
      expect(bilginState.selectedGrade).toBe(4);
    });
  });

  describe('Grup 7: UI Entegrasyonu ve React Context (Senaryo 33-36)', () => {
    it('React CampusProviders: Profil oluşturma, profil değiştirme ve arayüz durumu reaktif çalışır', async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <CampusProviders>
            <TestProfileConsumer />
          </CampusProviders>
        </MemoryRouter>,
      );

      // İlk başta profil yok veya migration ile 0
      const createBtn = screen.getByTestId('create-bilgin-btn');
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(screen.getByTestId('active-alias').textContent).toBe('Bilgin');
        expect(screen.getByTestId('active-grade').textContent).toBe('4');
        expect(screen.getByTestId('profiles-count').textContent).toBe('1');
      });
    });

    it('CampusTopBar: Aktif öğrenci adını ve sınıfını gösterir ve Öğrenci Değiştir düğmesi sunar', async () => {
      // Bir profil oluştur
      createStudentProfile('Gezgin', 'avatar_1', 3);

      render(
        <MemoryRouter initialEntries={['/']}>
          <CampusProviders>
            <CampusTopBar />
          </CampusProviders>
        </MemoryRouter>,
      );

      // Üst barda aktif öğrencinin takma adı yer alır
      expect(screen.getByText('Gezgin')).toBeInTheDocument();
      expect(screen.getByText('3. Sınıf')).toBeInTheDocument();

      // Ayarlar / Drawer düğmesi açıldığında Öğrenci Değiştir butonu bulunur
      const settingsBtn = screen.getByRole('button', { name: /Kampüs ayarları ve sınıf paneli/i });
      fireEvent.click(settingsBtn);

      expect(screen.getAllByRole('button', { name: /Öğrenci Değiştir/i }).length).toBeGreaterThanOrEqual(1);
    });
  });
});
