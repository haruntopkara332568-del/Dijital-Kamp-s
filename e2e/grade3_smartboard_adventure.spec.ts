import { finishWalkableEntry } from './walkableEntry';
import { test, expect, type Page } from '@playwright/test';
import { SULTANHANI_TOURIST_NPC } from '../src/data/sultanhaniNpc';
import { SULTANHANI_ACTIVE_EXCHANGE_DEFINITIONS } from '../src/data/sultanhaniDialogContent';
import { PORTAL, SULTANHANI_INNER, SULTANHANI_SQUARE } from '../src/features/walkable/engine/sultanhaniSceneRenderer';
import type { WalkableCanvasEngine } from '../src/features/walkable/engine/WalkableCanvasEngine';
import {
  createInitialStudentState,
  getMissionProgressKey,
  getProfileStateKey,
  LOCAL_STORAGE_ACTIVE_PROFILE_KEY,
  LOCAL_STORAGE_PROFILES_KEY,
  PROFILE_STATE_KEY_PREFIX,
} from '../src/services/storage';
import type { MissionStageId, StudentProfile } from '../src/types/campus';

async function readEncounter(page: Page) {
  return page.evaluate(() => {
    const engine = (window as unknown as { __WALKABLE_ENGINE__: WalkableCanvasEngine }).__WALKABLE_ENGINE__;
    const { player, npc } = engine;
    return {
      player: { x: player.x, y: player.y, direction: player.direction },
      playerState: player.state,
      alex: npc && { x: npc.x, y: npc.y, direction: npc.direction, state: npc.state },
      distance: npc ? Math.hypot(player.x - npc.x, player.y - npc.y) : Infinity,
    };
  });
}

async function walkOnCanvas(page: Page, target: { x: number; y: number }, isMobile: boolean) {
  const canvas = page.getByTestId('walkable-canvas');
  const position = await canvas.evaluate((element, target) => {
    const engine = (window as unknown as { __WALKABLE_ENGINE__: WalkableCanvasEngine }).__WALKABLE_ENGINE__;
    const canvas = element as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (target.x - engine.camera.x) * engine.zoom * rect.width / canvas.width,
      y: (target.y - engine.camera.y) * engine.zoom * rect.height / canvas.height,
    };
  }, target);
  if (isMobile) {
    await canvas.tap({ position });
  } else {
    await canvas.click({ position });
  }
}

async function enterClassroomWithNewStudent(page: Page, isMobile: boolean) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Animasyonu Atla' }).click();
  await finishWalkableEntry(page);

  const pathPoint = { x: 830, y: 410 };
  await walkOnCanvas(page, pathPoint, isMobile);
  await expect.poll(async () => {
    const { player } = await readEncounter(page);
    return Math.hypot(player.x - pathPoint.x, player.y - pathPoint.y);
  }).toBeLessThan(12);
  await walkOnCanvas(page, { x: 970, y: 350 }, isMobile);
  await expect(page.getByText('İngilizce Sınıfına Gir')).toBeVisible();
  await page.getByRole('button', { name: /Etkileşimi Başlat/i }).click();
  await expect(page.locator('[data-scene="classroom"]')).toBeVisible();

  await walkOnCanvas(page, { x: 480, y: 202 }, isMobile);
  await expect(page.getByText(/Büyük Görev: Kervansaray Macerası/i)).toBeVisible();
}

async function enterSquareFromBoard(page: Page) {
  await page.getByRole('button', { name: /Etkileşimi Başlat/i }).click();
  await expect(page.locator('[data-scene="sultanhani_square"]')).toBeVisible();
}

async function returnToClassroom(page: Page) {
  await page.getByRole('button', { name: 'Sınıfa dön', exact: true }).click();
  await expect(page.locator('[data-scene="classroom"]')).toBeVisible();
}

async function moveLeftFromInnerEntrance(page: Page, isMobile: boolean) {
  const waitForMovement = () => expect.poll(async () => (await readEncounter(page)).player.x).toBeLessThan(422);
  if (!isMobile) {
    await page.keyboard.down('ArrowLeft');
    try {
      await waitForMovement();
    } finally {
      await page.keyboard.up('ArrowLeft');
    }
    return;
  }

  const rect = await page.getByRole('button', { name: 'Sol', exact: true }).boundingBox();
  if (!rect) throw new Error('Mobile direction pad is not visible.');
  const touch = await page.context().newCDPSession(page);
  await touch.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }],
  });
  try {
    await waitForMovement();
  } finally {
    await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await touch.detach();
  }
}

async function interactAtPortal(page: Page, isMobile: boolean, prompt: string) {
  await expect(page.getByText(prompt, { exact: true })).toBeVisible();
  if (isMobile) {
    await page.getByRole('button', { name: /Etkileşimi Başlat/i }).tap();
  } else {
    await page.keyboard.press('e');
  }
}

async function waitUntilNear(page: Page, target: { x: number; y: number }) {
  await expect.poll(async () => {
    const { player, playerState } = await readEncounter(page);
    return playerState === 'idle' && Math.hypot(player.x - target.x, player.y - target.y) < 12;
  }).toBe(true);
}

async function waitForAlexToStop(page: Page) {
  await expect.poll(async () => {
    const { alex, distance, playerState } = await readEncounter(page);
    return playerState === 'idle' && alex?.state === 'idle' && distance >= 32 && distance < 85;
  }).toBe(true);
}

async function exploreInnerCourtyard(page: Page, isMobile: boolean) {
  await expect(page.getByText('Sultanhanı Meydanı’na Çık', { exact: true })).toHaveCount(0);
  const onArrival = await readEncounter(page);
  expect(onArrival.player).toMatchObject(SULTANHANI_INNER.playerSpawn);
  expect(onArrival.alex).toMatchObject({ ...SULTANHANI_INNER.touristSpawn, state: 'idle' });
  await moveLeftFromInnerEntrance(page, isMobile);
  await expect.poll(async () => (await readEncounter(page)).alex?.state).toBe('walk');
  await waitForAlexToStop(page);

  const besideStone = { x: 402, y: 444 };
  await walkOnCanvas(page, besideStone, isMobile);
  await waitUntilNear(page, besideStone);
  const beyondStone = { x: 520, y: 370 };
  await walkOnCanvas(page, beyondStone, isMobile);
  await expect.poll(() => page.evaluate(
    () => (window as unknown as { __WALKABLE_ENGINE__: WalkableCanvasEngine }).__WALKABLE_ENGINE__.getPathWaypoints().length,
  )).toBeGreaterThan(1);
  await waitUntilNear(page, beyondStone);
  await waitForAlexToStop(page);
  const atRest = (await readEncounter(page)).alex;
  await page.waitForTimeout(400);
  expect((await readEncounter(page)).alex).toEqual(atRest);

  const towardsEntrance = { x: 520, y: 468 };
  await walkOnCanvas(page, towardsEntrance, isMobile);
  await waitUntilNear(page, towardsEntrance);
  await waitForAlexToStop(page);
  const reversed = await readEncounter(page);
  expect(reversed.alex!.y).toBeLessThan(reversed.player.y - 24);
}

async function exitToSquare(page: Page, isMobile: boolean) {
  await walkOnCanvas(page, SULTANHANI_INNER.exit, isMobile);
  await interactAtPortal(page, isMobile, 'Sultanhanı Meydanı’na Çık');
  const square = page.locator('[data-scene="sultanhani_square"]');
  await expect(square).toBeVisible();
  await expect(square).toHaveAttribute('data-encounter-phase', 'DONE');
  const arrived = await readEncounter(page);
  expect(arrived.player).toMatchObject(SULTANHANI_SQUARE.portalExit.player);
  expect(arrived.alex).toMatchObject({ ...SULTANHANI_SQUARE.portalExit.alex, state: 'idle' });
}

async function mockEncounterSpeech(page: Page) {
  await page.addInitScript(() => {
    class TestUtterance {
      constructor(public text: string) {}
      onend: (() => void) | null = null;
      pitch = 1;
    }
    const events: string[] = [];
    let current: TestUtterance | null = null;
    let timer = 0;
    const synth = Object.assign(new EventTarget(), {
      getVoices: () => [{ lang: 'en-US', name: 'English test voice' }],
      speak: (utterance: TestUtterance) => {
        if (current) events.push('overlap');
        current = utterance;
        const speaker = utterance.pitch > 1 ? 'student' : 'tourist';
        events.push(speaker + ':start:' + utterance.text);
        timer = window.setTimeout(() => {
          current = null;
          events.push(speaker + ':end:' + utterance.text);
          utterance.onend?.();
        }, utterance.text === 'What is your name?' ? 2100 : speaker === 'student' ? 2300 : 650);
      },
      cancel: () => {
        if (current) events.push('cancel:' + current.text);
        window.clearTimeout(timer);
        current = null;
      },
    });
    Object.defineProperties(window, {
      speechSynthesis: { value: synth },
      SpeechSynthesisUtterance: { value: TestUtterance },
      sultanhaniTestSpeechEvents: { value: events },
    });
  });
  return () => page.evaluate(
    () => (window as unknown as { sultanhaniTestSpeechEvents: string[] }).sultanhaniTestSpeechEvents,
  );
}

test.describe('3. Sınıf Akıllı Tahta — Sultanhanı Kervansarayı Macerası (Aşama 6.5)', () => {

  for (const completedStages of [[], ['kesfet', 'ogren', 'uret']] satisfies MissionStageId[][]) {
    test('Senaryo 1: Akıllı tahta ' + completedStages.length + ' tamamlanmış masayla açılır', async ({ page }) => {
      const profileId = 'smartboard-test';
      const missionId = 'kapilarin-anlattigi-hikaye';
      const stateKey = getProfileStateKey(profileId);
      const missionKey = getMissionProgressKey(missionId, 3);
      const state = createInitialStudentState();
      state.hasSeenGate = true;
      state.hasCompletedOnboarding = true;
      state.selectedGrade = 3;
      state.speechEnabled = false;

      if (completedStages.length > 0) {
        state.missionProgressByKey[missionKey] = {
          missionId,
          missionVersion: '1.0.0',
          grade: 3,
          currentStage: 'paylas',
          completedStages,
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
          selfEvaluation: null,
          completed: false,
          updatedAt: state.updatedAt,
        };
      }

      const profile: StudentProfile = {
        id: profileId,
        alias: 'Gezgin',
        avatarId: 'avatar_1',
        characterId: 'ece',
        selectedGrade: 3,
        createdAt: state.updatedAt,
        lastUsedAt: state.updatedAt,
      };
      await page.addInitScript((entries) => {
        for (const [key, value] of entries) window.localStorage.setItem(key, value);
      }, [
        [LOCAL_STORAGE_PROFILES_KEY, JSON.stringify([profile])],
        [LOCAL_STORAGE_ACTIVE_PROFILE_KEY, profileId],
        [stateKey, JSON.stringify(state)],
      ]);
      await page.goto('/');
      await finishWalkableEntry(page);

      const interact = async (x: number, y: number, prompt: RegExp) => {
        await page.evaluate((position) => {
          (window as unknown as { __WALKABLE_ENGINE__: WalkableCanvasEngine })
            .__WALKABLE_ENGINE__.setPosition(position);
        }, { x, y });
        await expect(page.getByText(prompt)).toBeVisible();
        await page.getByRole('button', { name: /Etkileşimi Başlat/i }).click();
      };

      const classroom = page.locator('[data-scene="classroom"]');
      const visitSmartBoard = async () => {
        await interact(480, 180, /Büyük Görev: Kervansaray Macerası/i);
        await expect(page.locator('[data-scene="sultanhani_square"]')).toBeVisible();
        await page.getByRole('button', { name: 'Sınıfa dön', exact: true }).click();
        await expect(classroom).toBeVisible();
      };

      await interact(970, 335, /İngilizce Sınıfına Gir/i);
      await expect(classroom).toBeVisible();
      await visitSmartBoard();

      const desk = page.getByRole('dialog');
      const stageGroup = desk.getByRole('group', { name: '3. sınıf aşamaları' });
      for (const stage of [1, 2, 3, 4]) {
        await interact(265, 240, /Keşfet Masası'na Otur/i);
        const button = stageGroup.getByRole('button', { name: new RegExp('^' + stage + '\\. Aşama') });
        await button.click();
        await expect(button).toHaveAttribute('aria-pressed', 'true');
        await desk.getByRole('button', { name: 'Masadan kalk ve sınıfa dön' }).click();
        await visitSmartBoard();
      }

      if (completedStages.length > 0) {
        await interact(665, 240, /Öğren Masası'na Otur/i);
        await expect(desk).toBeVisible();
      } else {
        await interact(665, 240, /Önce Keşfet Masası/i);
        await expect(page.getByText("Önce Keşfet Masası'ndaki etkinliği tamamlamalısın.")).toBeVisible();
      }

      const savedProgress = await page.evaluate(({ stateKey, missionKey }) => {
        const raw = window.localStorage.getItem(stateKey);
        return raw ? JSON.parse(raw).missionProgressByKey[missionKey] : undefined;
      }, { stateKey, missionKey });
      expect(savedProgress).toEqual(state.missionProgressByKey[missionKey]);
    });
  }

  test('Akıllı tahtadan gelen öğrenci Alex ile tanışır, iç avluyu gezer ve meydana döner', async ({ page, isMobile }) => {
    test.setTimeout(85_000);
    const speechEvents = await mockEncounterSpeech(page);
    await enterClassroomWithNewStudent(page, isMobile);
    await enterSquareFromBoard(page);

    const panel = page.getByTestId('student-choice-panel');
    const bubble = page.getByTestId('npc-speech-bubble');
    const npc = SULTANHANI_TOURIST_NPC;
    const spawn = SULTANHANI_SQUARE.spawn;
    const startingDistance = Math.hypot(spawn.x - npc.startPosition.x, spawn.y - npc.startPosition.y);
    await expect.poll(async () => {
      const { alex, distance } = await readEncounter(page);
      return alex?.state === 'walk' && distance < startingDistance - 20 && distance > npc.interactionEnterRadius + 25;
    }).toBe(true);
    await expect(panel).toHaveCount(0);

    await expect(panel).toBeVisible();
    const meeting = await readEncounter(page);
    expect(meeting.player).toEqual({ ...spawn, direction: 'right' });
    expect(meeting.alex).toMatchObject({ direction: 'left', state: 'idle' });
    expect(meeting.distance).toBeLessThanOrEqual(npc.interactionEnterRadius);
    await expect(panel).toHaveCount(1);

    for (const { studentText, touristText } of SULTANHANI_ACTIVE_EXCHANGE_DEFINITIONS) {
      await panel.getByRole('button', { name: studentText, exact: true }).click();
      await expect(bubble).toHaveAttribute('data-speaker', 'student');
      await expect(bubble).toContainText(studentText);
      await expect(panel).toHaveCount(0);
      await expect(bubble).toHaveAttribute('data-speaker', 'tourist');
      await expect(bubble).toContainText(touristText);
    }

    const square = page.locator('[data-scene="sultanhani_square"]');
    const introduction = page.getByTestId('student-introduction-panel');
    await expect(bubble.getByText('What is your name?', { exact: true })).toBeVisible();
    await expect(bubble).toHaveAttribute('data-speaker', 'tourist');
    await expect.poll(speechEvents).toContain('tourist:start:What is your name?');
    await expect(introduction).toHaveCount(0);
    await expect.poll(speechEvents).toContain('tourist:end:What is your name?');
    await expect(introduction.getByText('My name is …', { exact: true })).toBeVisible();
    await expect(introduction.getByText('Şimdi kendi adını söyle.', { exact: true })).toBeVisible();
    await expect(introduction.locator('input, textarea')).toHaveCount(0);
    await expect(bubble).toHaveCount(0);

    await introduction.getByRole('button', { name: 'Söyledim', exact: true }).click();
    await expect(square).toHaveAttribute('data-encounter-phase', 'WALK_TO_DOOR', { timeout: 6_000 });
    await expect.poll(async () => {
      const { player, alex } = await readEncounter(page);
      return player.y < meeting.player.y - 16 && Boolean(alex && meeting.alex && alex.x < meeting.alex.x - 16);
    }).toBe(true);
    await expect(page.locator('[data-scene="sultanhani_inner"]')).toBeVisible({ timeout: 8_000 });
    await exploreInnerCourtyard(page, isMobile);
    await exitToSquare(page, isMobile);
    await page.waitForTimeout(2600);
    await expect(square).toHaveAttribute('data-encounter-phase', 'DONE');
    await expect(panel).toHaveCount(0);
    await expect(introduction).toHaveCount(0);
    expect((await readEncounter(page)).alex).toMatchObject({ ...SULTANHANI_SQUARE.portalExit.alex, state: 'idle' });

    await walkOnCanvas(page, { x: PORTAL.centerX, y: PORTAL.triggerY + 24 }, isMobile);
    await interactAtPortal(page, isMobile, 'Taç Kapıdan İçeri Gir');
    const inner = page.locator('[data-scene="sultanhani_inner"]');
    await expect(inner).toBeVisible({ timeout: 8000 });
    await expect(inner).toHaveAttribute('data-encounter-phase', 'DONE');
    expect((await readEncounter(page)).player).toMatchObject(SULTANHANI_INNER.playerSpawn);

    await exitToSquare(page, isMobile);
    await expect(panel).toHaveCount(0);
    await returnToClassroom(page);

    const savedProgress = await page.evaluate(({ activeKey, profilePrefix }) => {
      const profileId = localStorage.getItem(activeKey);
      const raw = localStorage.getItem(profilePrefix + profileId + ':state');
      return raw ? JSON.parse(raw).missionProgressByKey : null;
    }, { activeKey: LOCAL_STORAGE_ACTIVE_PROFILE_KEY, profilePrefix: PROFILE_STATE_KEY_PREFIX });
    expect(savedProgress).toEqual({});
  });

  test('Yaklaşma veya replik sırasında sınıfa dönüldüğünde sonraki açılış temiz başlar', async ({ page, isMobile }) => {
    test.setTimeout(60_000);
    const speechEvents = await mockEncounterSpeech(page);
    const panel = page.getByTestId('student-choice-panel');
    const bubble = page.getByTestId('npc-speech-bubble');

    await enterClassroomWithNewStudent(page, isMobile);
    await enterSquareFromBoard(page);
    await expect(page.locator('[data-scene="sultanhani_square"]')).toHaveAttribute('data-encounter-phase', 'APPROACH');
    await returnToClassroom(page);
    await expect(panel).toHaveCount(0);

    await expect(page.getByText(/Büyük Görev: Kervansaray Macerası/i)).toBeVisible();
    await enterSquareFromBoard(page);
    await walkOnCanvas(page, { x: 733, y: 721 }, isMobile);
    await panel.getByRole('button', { name: 'Hello!', exact: true }).click();
    await expect(bubble).toHaveAttribute('data-speaker', 'student');
    await expect(bubble).toHaveAttribute('data-speaker', 'tourist');
    await expect.poll(speechEvents).toEqual([
      'student:start:Hello!',
      'student:end:Hello!',
      'tourist:start:Hello!',
      'tourist:end:Hello!',
    ]);

    await panel.getByRole('button', { name: 'Good morning!', exact: true }).click();
    await expect.poll(speechEvents).toContain('student:start:Good morning!');
    await returnToClassroom(page);
    await expect(bubble).toHaveCount(0);

    await expect(page.getByText(/Büyük Görev: Kervansaray Macerası/i)).toBeVisible();
    await enterSquareFromBoard(page);
    await expect(panel.getByRole('button', { name: 'Hello!', exact: true })).toBeVisible();
    await expect(panel).toHaveCount(1);
    expect(await speechEvents()).toEqual([
      'student:start:Hello!',
      'student:end:Hello!',
      'tourist:start:Hello!',
      'tourist:end:Hello!',
      'student:start:Good morning!',
      'cancel:Good morning!',
    ]);
    await returnToClassroom(page);
  });
});
