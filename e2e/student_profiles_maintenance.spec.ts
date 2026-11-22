import { finishWalkableEntry } from './walkableEntry';
import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('ONARIM 03A — Cihaz Tabanlı Öğrenci Profil Altyapısı E2E Doğrulaması', () => {
  test.beforeEach(async ({ page }) => {
    // Tarayıcı depolamasını temiz başlat
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('Senaryo 1-3 & 34: İlk girişte profil oluşturma, taç kapı ve üst bar entegrasyonu', async ({
    page,
  }, testInfo) => {
    await page.goto('/');

    // 1. Taç kapı ekranı açılır
    const openGateBtn = page.getByRole('button', { name: /Kapıyı Aç ve İçeri Gir/i });
    await expect(openGateBtn).toBeVisible();
    await openGateBtn.click();

    // 2. Profil olmadığı için "Külliyemize Hoş Geldin!" modalı otomatik açılır
    const modalTitle = page.getByRole('heading', { name: /Yeni Öğrenci Profili Ekle|Külliyemize Hoş Geldin/i });
    await expect(modalTitle).toBeVisible({ timeout: 6000 });

    // 3. Takma ad olarak "Gezgin" seçilir
    const gezginChip = page.getByTestId('alias-chip-Gezgin');
    await expect(gezginChip).toBeVisible();
    await gezginChip.click();

    // 4. 3. Sınıf seçilir
    const grade3Btn = page.getByTestId('grade-btn-3');
    await expect(grade3Btn).toBeVisible();
    await grade3Btn.click();

    // Modal ekran görüntüsü
    if (!testInfo.project.name.includes('mobile')) {
      await page.screenshot({ path: path.join('docs', 'assets', 'profile_modal_create_desktop.png') });
    }

    // 5. "Öğrenmeye Başla" düğmesine basılır
    const startBtn = page.getByTestId('start-learning-btn');
    await expect(startBtn).toBeVisible();
    await startBtn.click();

    await finishWalkableEntry(page, 'Zeynep');

    // 7. Üst barda Gezgin ve 3. Sınıf görünür
    await expect(page.getByText('Gezgin').first()).toBeVisible();
    await expect(page.getByText('3. Sınıf').first()).toBeVisible();

    // Ekran görüntüsü kaydı
    const isMobile = testInfo.project.name.includes('mobile');
    const screenshotPath = isMobile
      ? path.join('docs', 'assets', 'profile_created_mobile.png')
      : path.join('docs', 'assets', 'profile_created_desktop.png');
    await page.screenshot({ path: screenshotPath });
  });

  test('Senaryo 7-12: İki Öğrenci (Gezgin & Bilgin) profil değişimi ve veri izolasyonu', async ({
    page,
  }, testInfo) => {
    // Gezgin profili hazır olarak başlat
    await page.addInitScript(() => {
      const gezginProfile = {
        id: 'prof_gezgin',
        alias: 'Gezgin',
        avatarId: 'avatar_1',
        selectedGrade: 3,
        createdAt: new Date().toISOString(),
        lastUsedAt: new Date().toISOString(),
      };
      const gezginState = {
        schemaVersion: 1,
        selectedGrade: 3,
        hasSeenGate: true,
        hasCompletedOnboarding: true,
        speechEnabled: true,
        discoveryPreference: 'independent',
        missionProgressByKey: {
          'english-smartboard-station-1::grade-3': {
            missionId: 'english-smartboard-station-1',
            grade: 3,
            completed: true,
            completedStages: ['kesfet', 'ogren'],
          },
        },
        updatedAt: new Date().toISOString(),
      };

      window.localStorage.setItem('dek_campus_profiles_v1', JSON.stringify([gezginProfile]));
      window.localStorage.setItem('dek_campus_active_profile_id_v1', 'prof_gezgin');
      window.localStorage.setItem('dek_campus_profile_v1:prof_gezgin:state', JSON.stringify(gezginState));
      window.localStorage.setItem('dek_campus_v1_state', JSON.stringify(gezginState));
    });

    await page.goto('/');
    await finishWalkableEntry(page);

    // 1. Üst barda Gezgin görünür
    const gezginBtn = page.getByRole('button', { name: /Gezgin/i }).first();
    await expect(gezginBtn).toBeVisible();

    // 2. Gezgin düğmesine tıklayarak profil modalını aç
    await gezginBtn.click();
    await expect(page.getByRole('heading', { name: /Külliyemize Hoş Geldin/i })).toBeVisible();

    if (!testInfo.project.name.includes('mobile')) {
      await page.screenshot({ path: path.join('docs', 'assets', 'profile_modal_select_desktop.png') });
    }

    // 3. "+ Yeni Öğrenci Ekle" düğmesine bas
    const addStudentBtn = page.getByTestId('add-student-btn');
    await expect(addStudentBtn).toBeVisible();
    await addStudentBtn.click();

    // 4. "Bilgin" ve 4. Sınıf seç
    const bilginChip = page.getByTestId('alias-chip-Bilgin');
    await expect(bilginChip).toBeVisible();
    await bilginChip.click();

    const grade4Btn = page.getByTestId('grade-btn-4');
    await expect(grade4Btn).toBeVisible();
    await grade4Btn.click();

    await page.getByTestId('start-learning-btn').click();
    await finishWalkableEntry(page, 'Deniz');

    // 5. Artık üst barda Bilgin ve 4. Sınıf görünür
    await expect(page.getByText('Bilgin').first()).toBeVisible();
    await expect(page.getByText('4. Sınıf').first()).toBeVisible();

    // Ekran görüntüsü kaydı: Bilgin aktifken
    const isMobile = testInfo.project.name.includes('mobile');
    const screenshotPath = isMobile
      ? path.join('docs', 'assets', 'profile_switch_bilgin_mobile.png')
      : path.join('docs', 'assets', 'profile_switch_bilgin_desktop.png');
    await page.screenshot({ path: screenshotPath });

    // 6. Tekrar Gezgin'e geçiş yap
    const bilginBtn = page.getByRole('button', { name: /Bilgin/i }).first();
    await bilginBtn.click();

    const gezginCard = page.getByTestId('profile-card-Gezgin');
    await expect(gezginCard).toBeVisible();
    await gezginCard.click();

    // 7. Tekrar Gezgin ve 3. Sınıf geri gelir
    await expect(page.getByText('Gezgin').first()).toBeVisible();
    await expect(page.getByText('3. Sınıf').first()).toBeVisible();
  });

  test('Senaryo 29-32: Profil Silme Onayı ve İzolasyonu', async ({ page }) => {
    // İki öğrenci hazırla
    await page.addInitScript(() => {
      const p1 = {
        id: 'prof_1',
        alias: 'Gezgin',
        avatarId: 'avatar_1',
        selectedGrade: 3,
        createdAt: new Date().toISOString(),
        lastUsedAt: new Date().toISOString(),
      };
      const p2 = {
        id: 'prof_2',
        alias: 'Bilgin',
        avatarId: 'avatar_2',
        selectedGrade: 4,
        createdAt: new Date().toISOString(),
        lastUsedAt: new Date().toISOString(),
      };

      window.localStorage.setItem('dek_campus_profiles_v1', JSON.stringify([p1, p2]));
      window.localStorage.setItem('dek_campus_active_profile_id_v1', 'prof_1');
      window.localStorage.setItem(
        'dek_campus_profile_v1:prof_1:state',
        JSON.stringify({ schemaVersion: 1, selectedGrade: 3, hasSeenGate: true }),
      );
      window.localStorage.setItem(
        'dek_campus_profile_v1:prof_2:state',
        JSON.stringify({ schemaVersion: 1, selectedGrade: 4, hasSeenGate: true }),
      );
    });

    await page.goto('/');
    await finishWalkableEntry(page);

    // Profil modalını aç
    await page.getByRole('button', { name: /Gezgin/i }).first().click();

    // Gezgin kartındaki çöp kutusu düğmesine tıkla
    const deleteGezginBtn = page.getByTestId('delete-btn-Gezgin');
    await expect(deleteGezginBtn).toBeVisible();
    await deleteGezginBtn.click();

    // İki adımlı onay modalı açılır
    await expect(page.getByRole('heading', { name: /Öğrenci Profilini Sil/i })).toBeVisible();
    await expect(page.getByText(/Gezgin.*adlı öğrencinin tüm ders ilerlemesi/i)).toBeVisible();

    // "Evet, Profili Sil" butonuna tıkla
    const confirmDeleteBtn = page.getByTestId('confirm-delete-btn');
    await expect(confirmDeleteBtn).toBeVisible();
    await confirmDeleteBtn.click();

    // Kalan profil listesinde sadece Bilgin görünür
    await expect(page.getByText('Bilgin').first()).toBeVisible();
    await expect(page.getByText('Gezgin')).not.toBeVisible();
  });
});

