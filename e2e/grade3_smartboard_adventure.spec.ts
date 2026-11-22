import { finishWalkableEntry } from './walkableEntry';
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

test.use({ video: 'on' });

test.describe('3. Sınıf Akıllı Tahta — Sultanhanı Kervansarayı Macerası (Aşama 6.5)', () => {

  test('Senaryo 1: 4 masa tamamlanmadan Akıllı Tahta kilitlidir ve bilgilendirme uyarısı verir', async ({ page }) => {
    // 1. Durum: 3 masa tamamlanmış (Keşfet, Öğren, Üret), Paylaş masası henüz tamamlanmamış
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.clear();
      const state = {
        schemaVersion: 1,
        hasSeenGate: false,
        hasCompletedOnboarding: true,
        discoveryPreference: 'independent',
        selectedGrade: 3,
        hasCompletedGuidedTour: true,
        speechEnabled: true,
        missionProgressByKey: {
          'kapilarin-anlattigi-hikaye::grade-3': {
            missionId: 'kapilarin-anlattigi-hikaye',
            missionVersion: '1.0.0',
            grade: 3,
            currentStage: 'paylas',
            completedStages: ['kesfet', 'ogren', 'uret'],
            selections: {
              selectedDoorIds: ['greetings-table'],
              inspectedCampusGate: true,
              observationNotes: {},
              matchedVocabularyIds: ['vocab-hello'],
              matchedExampleSentence: true,
              doorName: 'Selamlaşma Masası',
              writtenText: 'Hello!',
              usedEnglishWords: ['Hello'],
            },
            draftArtifactId: null,
            savedArtifactId: null,
            artifactSavedAt: null,
            selfEvaluation: null,
            completed: false,
            completedAt: null,
            updatedAt: new Date().toISOString(),
          },
        },
        lastActiveMissionKey: 'kapilarin-anlattigi-hikaye::grade-3',
        updatedAt: new Date().toISOString(),
      };
      window.localStorage.setItem('dek_campus_v1_state', JSON.stringify(state));
    });
    await page.evaluate(() => localStorage.removeItem('dek_campus_migrated_v1'));
    await page.reload();
    await finishWalkableEntry(page);

    // Giriş kapısını aç -> Avluya gir
    const openGateBtn = page.getByRole('button', { name: /Kapıyı Aç ve İçeri Gir/i });
    await expect(openGateBtn).toBeVisible();
    await openGateBtn.click();

    const walkableCanvas = page.locator('canvas[data-testid="walkable-canvas"]');
    await expect(walkableCanvas).toBeVisible({ timeout: 10000 });

    // İngilizce Dünyası binasına yürü ve sınıfa gir
    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: {
            setPosition: (p: { x: number; y: number }) => void;
          };
        }
      ).__WALKABLE_ENGINE__;
      if (engine) {
        engine.setPosition({ x: 970, y: 335 });
      }
    });
    await page.waitForTimeout(300);

    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: { triggerActiveInteraction: () => void };
        }
      ).__WALKABLE_ENGINE__;
      engine?.triggerActiveInteraction();
    });

    // Sınıftayız
    await expect(page.getByRole('button', { name: /Avluya dön/i })).toBeVisible({ timeout: 5000 });

    // Akıllı tahtanın önüne yürü (x: 480, y: 180) ve etkileşim tetikle
    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: {
            setPosition: (p: { x: number; y: number }) => void;
          };
        }
      ).__WALKABLE_ENGINE__;
      if (engine) {
        engine.setPosition({ x: 480, y: 180 });
      }
    });
    await page.waitForTimeout(300);

    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: { triggerActiveInteraction: () => void };
        }
      ).__WALKABLE_ENGINE__;
      engine?.triggerActiveInteraction();
    });

    // Kilit uyarısının gösterildiğini doğrula
    await expect(
      page.getByText(/Büyük Görev için önce sınıftaki dört masadaki \(Keşfet, Öğren, Üret, Paylaş\) görevleri tamamlamalısın\./i),
    ).toBeVisible({ timeout: 4000 });

    // Sultanhanı modalının açılmadığını doğrula
    await expect(page.getByText(/Aksaray Sultanhanı Kervansarayı/i)).not.toBeVisible();
  });

  test('Senaryo 2: 4 masa tamamlandığında Akıllı Tahta açılır, Sultanhanı Kervansarayı macerası tamamlanır ve sınıfa dönülür', async ({ page }, testInfo) => {
    test.setTimeout(90000);
    // 1. Durum: Dört masanın tümü tamamlanmış
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.clear();
      const state = {
        schemaVersion: 1,
        hasSeenGate: false,
        hasCompletedOnboarding: true,
        discoveryPreference: 'independent',
        selectedGrade: 3,
        hasCompletedGuidedTour: true,
        speechEnabled: true,
        missionProgressByKey: {
          'kapilarin-anlattigi-hikaye::grade-3': {
            missionId: 'kapilarin-anlattigi-hikaye',
            missionVersion: '1.0.0',
            grade: 3,
            currentStage: 'paylas',
            completedStages: ['kesfet', 'ogren', 'uret', 'paylas'],
            selections: {
              selectedDoorIds: ['greetings-table'],
              inspectedCampusGate: true,
              observationNotes: {},
              matchedVocabularyIds: ['vocab-hello', 'vocab-morning', 'vocab-goodbye', 'vocab-night'],
              matchedExampleSentence: true,
              doorName: 'Selamlaşma Masası',
              writtenText: 'Hello! Good morning! Goodbye! Good night!',
              usedEnglishWords: ['Hello', 'Good morning', 'Goodbye', 'Good night'],
            },
            draftArtifactId: null,
            savedArtifactId: null,
            artifactSavedAt: null,
            selfEvaluation: null,
            completed: false,
            completedAt: null,
            updatedAt: new Date().toISOString(),
          },
        },
        lastActiveMissionKey: 'kapilarin-anlattigi-hikaye::grade-3',
        updatedAt: new Date().toISOString(),
      };
      window.localStorage.setItem('dek_campus_v1_state', JSON.stringify(state));
    });
    await page.evaluate(() => localStorage.removeItem('dek_campus_migrated_v1'));
    await page.reload();
    await finishWalkableEntry(page);

    // Giriş kapısını aç -> Avluya gir
    const openGateBtn = page.getByRole('button', { name: /Kapıyı Aç ve İçeri Gir/i });
    await expect(openGateBtn).toBeVisible();
    await openGateBtn.click();

    const walkableCanvas = page.locator('canvas[data-testid="walkable-canvas"]');
    await expect(walkableCanvas).toBeVisible({ timeout: 10000 });

    // İngilizce Dünyası binasına gir
    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: {
            setPosition: (p: { x: number; y: number }) => void;
          };
        }
      ).__WALKABLE_ENGINE__;
      if (engine) {
        engine.setPosition({ x: 970, y: 335 });
      }
    });
    await page.waitForTimeout(300);

    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: { triggerActiveInteraction: () => void };
        }
      ).__WALKABLE_ENGINE__;
      engine?.triggerActiveInteraction();
    });

    await expect(page.getByRole('button', { name: /Avluya dön/i })).toBeVisible({ timeout: 5000 });

    // Akıllı tahtanın önüne yürü (x: 480, y: 180) ve açılışı tetikle
    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: {
            setPosition: (p: { x: number; y: number }) => void;
          };
        }
      ).__WALKABLE_ENGINE__;
      if (engine) {
        engine.setPosition({ x: 480, y: 180 });
      }
    });
    await page.waitForTimeout(300);

    await page.evaluate(() => {
      const engine = (
        window as unknown as {
          __WALKABLE_ENGINE__?: { triggerActiveInteraction: () => void };
        }
      ).__WALKABLE_ENGINE__;
      engine?.triggerActiveInteraction();
    });

    // Akıllı Tahta modalı açılır: Sultanhanı Kervansarayı Sahnesi
    const adventureStartTime = Date.now();
    await expect(page.getByText(/Aksaray Sultanhanı Kervansarayı/i).first()).toBeVisible({ timeout: 6000 });
    await expect(page.getByText(/1\. Sahne — Taç Kapının Önünde Karşılaşma/i).first()).toBeVisible();

    // 1. Görsel Kayıt: Meydana Giriş ve Belirgin Yürüyüş Adımları
    await page.screenshot({ path: 'docs/assets/grade3_smartboard_square_arrival.png' });

    // Deniz taç kapının önünde durur ve konuşma seçenekleri belirir
    const wrongGoodbyeBtn = page.getByRole('button', { name: /"Goodbye!"/i });
    await expect(wrongGoodbyeBtn).toBeVisible({ timeout: 5000 });

    // 2. Görsel Kayıt: Taç Kapının Önünde Duruş ve Leo ile "Hello!" Karşılaşması
    await page.screenshot({ path: 'docs/assets/grade3_smartboard_sultanhani_arrival.png' });

    // Yanlış cevap testi: "Goodbye!" -> Cezasız pedagojik ipucu
    await wrongGoodbyeBtn.click();
    await expect(
      page.getByText(/Yeni karşılaştığımız bir arkadaşa selam vermek için "Hello!"/i),
    ).toBeVisible({ timeout: 4000 });

    // Doğru cevap: "Hello!"
    await page.waitForTimeout(2500); // ipucu temizlenme süresi
    const correctHelloBtn = page.getByRole('button', { name: /"Hello!"/i });
    await correctHelloBtn.click();
    await expect(
      page.getByText(/Harika! "Hello!" diyerek tanışma selamı verdin/i),
    ).toBeVisible({ timeout: 4000 });

    // 3. Görsel Kayıt: Kamera Takibi & Ayaklarıyla Aynı Taş Eşiği Geçiş
    await expect(page.getByText(/Selçuklu Taç Kapı Taş Eşiği/i)).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'docs/assets/grade3_smartboard_threshold_crossing.png' });

    // Eşik geçildikten sonra: 2. Sahne (Avluda Vedalaşma • Gece Işığı) açılır
    await expect(page.getByText(/2\. Sahne — Avluda Vedalaşma/i).first()).toBeVisible({ timeout: 8000 });

    // 4. Görsel Kayıt: Avluda Gece Vedalaşması ve "Good night!"
    const wrongMorningBtn = page.getByRole('button', { name: /"Good morning!"/i });
    await expect(wrongMorningBtn).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'docs/assets/grade3_smartboard_courtyard_farewell.png' });

    // Yanlış cevap testi: "Good morning!" -> İpucu
    await wrongMorningBtn.click();
    await expect(
      page.getByText(/Gece ayrılırken ve uyku vakti geldiğinde "Good night!"/i),
    ).toBeVisible({ timeout: 4000 });

    // Doğru cevap: "Good night!"
    await page.waitForTimeout(2500);
    const correctNightBtn = page.getByRole('button', { name: /"Good night!"/i });
    await correctNightBtn.click();
    await expect(
      page.getByText(/Tebrikler! "Good night!" diyerek arkadaşınla gece vedasını yaptın/i),
    ).toBeVisible({ timeout: 4000 });

    // 5. Görsel Kayıt: Görünür El Sallama ve Kadrajın Kenarına Doğru Ayrılış
    // Karakterler ellerini görünür biçimde sallayıp ayrılış adımlarına geçerken yakala
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'docs/assets/grade3_smartboard_waving_departure.png' });

    // --- TAMAMLANMA EKRANI (İki karakter de kadrajdan tamamen çıktıktan sonra açılır) ---
    await expect(
      page.getByText(/Tebrikler! Öğrendiğin İngilizce ifadeleri günlük yaşamda başarıyla kullandın\./i),
    ).toBeVisible({ timeout: 8000 });

    // Rozet ve 4 kart özeti
    await expect(page.getByText(/Büyük Görev Başarıyla Tamamlandı 🏆/i)).toBeVisible();
    await expect(page.getByText(/Hello!/i).first()).toBeVisible();
    await expect(page.getByText(/Good morning!/i).first()).toBeVisible();
    await expect(page.getByText(/Goodbye!/i).first()).toBeVisible();
    await expect(page.getByText(/Good night!/i).first()).toBeVisible();

    // 6. Görsel Kayıt: Tamamlanma Ekranı
    await page.screenshot({ path: 'docs/assets/grade3_smartboard_adventure_completed.png' });

    // Sınıfa Dön butonuna tıkla
    const returnBtn = page.getByRole('button', { name: /Sınıfa Dön/i }).first();
    await returnBtn.click();

    // Sınıfta olduğumuzu ve masaların yerinde durduğunu doğrula
    await expect(page.getByRole('button', { name: /Avluya dön/i })).toBeVisible({ timeout: 5000 });

    // Video kaydının sınıfa dönüşü ve 4 masayı net gösterebilmesi için 2 saniye bekle
    await page.waitForTimeout(2000);

    // Oynanış süresini ölç ve konsola raporla
    const totalElapsedSeconds = ((Date.now() - adventureStartTime) / 1000).toFixed(1);
    console.log(`[Akıllı Tahta Sultanhanı Macerası (${testInfo.project.name})] Ölçülen Toplam Oynanış Süresi: ${totalElapsedSeconds} saniye`);

    // 7. Görsel Kayıt: Sınıfta Akıllı Tahtanın Önünde Kalış
    await page.screenshot({ path: 'docs/assets/grade3_smartboard_return_classroom.png' });

    // LocalStorage verisinde 4 masanın korunduğunu ve büyük görevin tamamlandığını doğrula
    const savedState = await page.evaluate(() => {
      const raw = window.localStorage.getItem('dek_campus_v1_state');
      return raw ? JSON.parse(raw) : null;
    });

    const progress = savedState?.missionProgressByKey?.['kapilarin-anlattigi-hikaye::grade-3'];
    expect(progress?.completedStages).toEqual(['kesfet', 'ogren', 'uret', 'paylas']);
    expect(progress?.completed).toBe(true);

    // Kesintisiz Ekran Kaydı Videosunu docs/assets/videos Klasörüne Kaydet
    await page.close();
    const video = page.video();
    if (video) {
      const videosDir = path.resolve('docs/assets/videos');
      if (!fs.existsSync(videosDir)) {
        fs.mkdirSync(videosDir, { recursive: true });
      }
      const videoPath = await video.path();
      const targetName =
        testInfo.project.name === 'mobile-chrome'
          ? 'grade3_smartboard_mobile_continuous.webm'
          : 'grade3_smartboard_desktop_continuous.webm';
      fs.copyFileSync(videoPath, path.join(videosDir, targetName));
    }
  });
});
