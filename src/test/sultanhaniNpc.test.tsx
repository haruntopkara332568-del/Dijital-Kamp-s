import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { CampusProviders } from '@/src/app/CampusProviders';
import { WalkableCampusView } from '@/src/features/walkable/WalkableCampusView';
import { WalkableCanvasEngine } from '@/src/features/walkable/engine/WalkableCanvasEngine';
import {
  PORTAL,
  SULTANHANI_INNER,
  SULTANHANI_SQUARE,
  renderSultanhaniEntities,
} from '@/src/features/walkable/engine/sultanhaniSceneRenderer';
import { CHARACTER_SCALES, drawTouristNpc } from '@/src/features/walkable/engine/characterRenderer';
import { isPositionBlocked } from '@/src/features/walkable/engine/pathfinding';
import {
  SULTANHANI_CARAVANSERAI_ASSET_URL,
  SULTANHANI_INNER_WALKABLE_ASSET_URL,
  SULTANHANI_TOURIST_ATLAS_URL,
  clearCachedAssetForTesting,
  setCachedAssetForTesting,
  triggerAssetLoadErrorForTesting,
  getSultanhaniTouristAtlas,
} from '@/src/features/walkable/engine/assetLoader';
import { SULTANHANI_TOURIST_NPC } from '@/src/data/sultanhaniNpc';
import {
  SULTANHANI_NEXT_PHASE,
  SULTANHANI_READY_STUDENT_NAMES,
  SULTANHANI_TIMINGS,
  advanceSultanhaniFlowState,
  buildSultanhaniDialogExchanges,
  buildSultanhaniDialogueSteps,
  buildSultanhaniSpeechSegments,
  buildSultanhaniUnusedExtendedSteps,
  canTransitionSultanhaniPhase,
  getSpeechTimeoutMs,
  resolveSultanhaniStudentName,
} from '@/src/data/sultanhaniDialogContent';
import { NpcSpeechBubble } from '@/src/features/walkable/components/NpcSpeechBubble';
import {
  clearAllCampusData,
  createInitialStudentState,
  createStudentProfile,
  loadStudentState,
  saveStudentState,
} from '@/src/services/storage';
import type { WalkableSceneConfig } from '@/src/features/walkable/types';

function createMockCanvasContext() {
  return {
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
    createRadialGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
    createLinearGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'left',
    textBaseline: 'top',
    fillText: vi.fn(),
    strokeText: vi.fn(),
    measureText: vi.fn().mockReturnValue({ width: 50 }),
  } as unknown as CanvasRenderingContext2D;
}

class MockUtterance {
  constructor(public text: string) {}
  lang = '';
  rate = 0;
  pitch = 1;
  voice: { lang: string; name?: string } | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
}

function setupMockSpeech(languages: string[] = ['en-US', 'tr-TR']) {
  const utterances: MockUtterance[] = [];
  const synth = Object.assign(new EventTarget(), {
    getVoices: vi.fn(() => languages.map((lang) => ({ lang, name: `Voice-${lang}` }))),
    speak: vi.fn((utterance: MockUtterance) => {
      utterances.push(utterance);
    }),
    cancel: vi.fn(),
  });
  vi.stubGlobal('speechSynthesis', synth);
  vi.stubGlobal('SpeechSynthesisUtterance', MockUtterance);
  return { utterances, synth };
}

describe('Sultanhanı Dış Meydan Etkileşimli Konuşma ve Geçiş Doğrulaması (Sürüm 2.1)', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await clearAllCampusData();
    clearCachedAssetForTesting(SULTANHANI_TOURIST_ATLAS_URL);
    setCachedAssetForTesting(
      SULTANHANI_TOURIST_ATLAS_URL,
      { complete: true, naturalWidth: 560, naturalHeight: 720 } as unknown as HTMLImageElement,
    );
    setCachedAssetForTesting(
      SULTANHANI_CARAVANSERAI_ASSET_URL,
      { complete: true, naturalWidth: 553, naturalHeight: 466 } as unknown as HTMLImageElement,
    );
    setCachedAssetForTesting(
      SULTANHANI_INNER_WALKABLE_ASSET_URL,
      { complete: true, naturalWidth: 1024, naturalHeight: 585 } as unknown as HTMLImageElement,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('1. NPC config ve durum makinesi kuralları sağlanır; eski Türkçe konuşma kaldırılmıştır', () => {
    expect(SULTANHANI_TOURIST_NPC.id).toBe('turist-sultanhani');
    expect(SULTANHANI_TOURIST_NPC.scene).toBe('sultanhani_square');
    expect('dialogueLines' in SULTANHANI_TOURIST_NPC).toBe(false);
    expect('cooldownMs' in SULTANHANI_TOURIST_NPC).toBe(false);

    expect(SULTANHANI_TOURIST_NPC.width).toBe(CHARACTER_SCALES.scale15.width);
    expect(SULTANHANI_TOURIST_NPC.height).toBe(CHARACTER_SCALES.scale15.height);

    // Başlangıç konumu doğuş noktasından 4–6 öğrenci boyu uzakta
    const distFromSpawn = Math.hypot(
      SULTANHANI_TOURIST_NPC.startPosition.x - SULTANHANI_SQUARE.spawn.x,
      SULTANHANI_TOURIST_NPC.startPosition.y - SULTANHANI_SQUARE.spawn.y,
    );
    expect(distFromSpawn).toBeGreaterThanOrEqual(CHARACTER_SCALES.scale15.height * 4);
    expect(distFromSpawn).toBeLessThanOrEqual(CHARACTER_SCALES.scale15.height * 6);
    expect(
      isPositionBlocked(
        SULTANHANI_TOURIST_NPC.startPosition.x,
        SULTANHANI_TOURIST_NPC.startPosition.y,
        SULTANHANI_SQUARE.obstacles,
        SULTANHANI_SQUARE.width,
        SULTANHANI_SQUARE.height,
      ),
    ).toBe(false);

    // Kapı hedefi yürünebilir portal ağzında olmalı
    expect(
      isPositionBlocked(
        PORTAL.doorWalkTarget.x,
        PORTAL.doorWalkTarget.y,
        SULTANHANI_SQUARE.obstacles,
        SULTANHANI_SQUARE.width,
        SULTANHANI_SQUARE.height,
      ),
    ).toBe(false);

    // Tek yönlü durum makinesi geçişleri
    expect(SULTANHANI_NEXT_PHASE.ARRIVAL).toBe('APPROACH');
    expect(canTransitionSultanhaniPhase('ARRIVAL', 'APPROACH')).toBe(true);
    expect(canTransitionSultanhaniPhase('APPROACH', 'DIALOG_1')).toBe(false);
    expect(canTransitionSultanhaniPhase('DIALOG_2', 'DIALOG_1')).toBe(false);
    expect(canTransitionSultanhaniPhase('TRANSITION', 'DONE')).toBe(true);
  });

  it('2. Öğrenci adı önceliği, İngilizce diyalog sırası ve Türkçe isim parçalama/Alex/Can kuralları doğrudur', () => {
    expect(resolveSultanhaniStudentName('Zeynep', 'ece')).toBe('Zeynep');
    expect(resolveSultanhaniStudentName('', 'arda')).toBe('Arda');
    expect(SULTANHANI_READY_STUDENT_NAMES).toContain(resolveSultanhaniStudentName(null, null, 0));

    const exchanges = buildSultanhaniDialogExchanges(1);
    expect(
      exchanges.map((ex) => `${ex.studentText} -> ${ex.touristText}`),
    ).toEqual([
      'Hello! -> Hello!',
      'Good morning! -> Good morning!',
      "What's your name? -> My name is Alex.",
    ]);

    const steps = buildSultanhaniDialogueSteps('Ece', 1);
    expect(steps.map((s) => `${s.speaker}:${s.text}`)).toEqual([
      'student:Hello!',
      'tourist:Hello!',
      'student:Good morning!',
      'tourist:Good morning!',
      "student:What's your name?",
      'tourist:My name is Alex.',
    ]);

    // Akıştan çıkarılan adımlar silinmemiş, ayrı listede korunmuştur ve aktif akışta yoktur
    const unusedSteps = buildSultanhaniUnusedExtendedSteps('Ece', 1);
    expect(unusedSteps.map((s) => `${s.speaker}:${s.text}`)).toEqual([
      "tourist:What's your name?",
      'student:My name is Ece.',
      'tourist:Nice to meet you, Ece!',
      'student:Nice to meet you, too!',
    ]);

    // Saf durum makinesi geçiş fonksiyonu: "değişim sonrası turist cevabı" ve "son değişimden sonra yürüyüş"
    const total = exchanges.length;
    const afterSelect = advanceSultanhaniFlowState(
      { stepPhase: 'STUDENT_CHOICE', exchangeIndex: 0 },
      { type: 'STUDENT_OPTION_SELECTED' },
      total,
    )!;
    expect(afterSelect).toEqual({ stepPhase: 'STUDENT_SPEAKING', exchangeIndex: 0 });
    const waitTourist = advanceSultanhaniFlowState(
      afterSelect,
      { type: 'STUDENT_SPEECH_COMPLETE' },
      total,
    )!;
    expect(waitTourist).toEqual({ stepPhase: 'WAIT_BEFORE_TOURIST', exchangeIndex: 0 });
    const touristSpeaking = advanceSultanhaniFlowState(
      waitTourist,
      { type: 'START_TOURIST_REPLY' },
      total,
    )!;
    expect(touristSpeaking).toEqual({ stepPhase: 'TOURIST_SPEAKING', exchangeIndex: 0 });
    // Aynı adım ikinci kez tetiklenemez
    expect(
      advanceSultanhaniFlowState(touristSpeaking, { type: 'FORCE_TOURIST_REPLY_WATCHDOG' }, total),
    ).toBeNull();

    // Son değişimden (total - 1) sonra yürüyüşe (WALK_TO_DOOR) geçilir
    const lastAfterTourist = advanceSultanhaniFlowState(
      { stepPhase: 'TOURIST_SPEAKING', exchangeIndex: total - 1 },
      { type: 'TOURIST_SPEECH_COMPLETE' },
      total,
    )!;
    const walkToDoor = advanceSultanhaniFlowState(
      lastAfterTourist,
      { type: 'AFTER_TOURIST_PAUSE_COMPLETE' },
      total,
    )!;
    expect(walkToDoor).toEqual({ stepPhase: 'WALK_TO_DOOR', exchangeIndex: total - 1 });
    expect(
      advanceSultanhaniFlowState(walkToDoor, { type: 'FORCE_WALK_WATCHDOG' }, total),
    ).toBeNull();
    // "How are you?" ve "Goodbye!" içermemeli
    for (const s of steps) {
      expect(s.text).not.toMatch(/How are you|Goodbye/i);
      if (s.options) {
        expect(s.options).toHaveLength(3);
        for (const opt of s.options) {
          expect(opt.text).not.toMatch(/How are you|Goodbye/i);
        }
      }
    }

    // Seçenek konumu tüm sıralarda aynı indekste sabit kalmamalı
    const correctIndices = steps
      .filter((s) => s.options)
      .map((s) => s.options!.findIndex((o) => o.isCorrect));
    expect(new Set(correctIndices).size).toBeGreaterThan(1);

    // İsim parçalama kuralları
    expect(
      buildSultanhaniSpeechSegments('My name is Ece.', { hasTurkishVoice: true }),
    ).toEqual([
      { lang: 'en-US', text: 'My name is ' },
      { lang: 'tr-TR', text: 'Ece.' },
    ]);

    // Alex İngilizce kalır
    expect(
      buildSultanhaniSpeechSegments('My name is Alex.', { hasTurkishVoice: true }),
    ).toEqual([{ lang: 'en-US', text: 'My name is Alex.' }]);

    // "can" fiili ile "Can" ismi karışmaz
    expect(
      buildSultanhaniSpeechSegments('You can meet Can!', { hasTurkishVoice: true }),
    ).toEqual([
      { lang: 'en-US', text: 'You can meet ' },
      { lang: 'tr-TR', text: 'Can!' },
    ]);

    // Türkçe ses yokken yedek İngilizce okunuş
    expect(
      buildSultanhaniSpeechSegments('Nice to meet you, Ece!', { hasTurkishVoice: false }),
    ).toEqual([{ lang: 'en-US', text: 'Nice to meet you, Eh-jeh!' }]);
  });

  it('3. Devriye döngüsü, 1.5x/2.0x histerezis eşiği ve startEncounterFacing iki karakteri birbirine döndürür', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    vi.spyOn(canvas, 'getContext').mockReturnValue(createMockCanvasContext());

    const onNpcProximityChange = vi.fn();
    const config: WalkableSceneConfig = {
      width: SULTANHANI_SQUARE.width,
      height: SULTANHANI_SQUARE.height,
      playerSpawn: SULTANHANI_SQUARE.spawn,
      obstacles: SULTANHANI_SQUARE.obstacles,
      interactiveZones: [],
      npc: SULTANHANI_TOURIST_NPC,
      isNpcVisible: () => true,
    };

    const engine = new WalkableCanvasEngine(canvas, config, {
      onActiveZoneChange: vi.fn(),
      onNpcProximityChange,
    });
    const step = (dt: number) =>
      (engine as unknown as { update: (delta: number) => void }).update(dt);

    // 115 px mesafede (1.5 < d < 2.0) yaklaşma henüz tetiklenmez
    engine.player.x = engine.npc!.x - 115;
    engine.player.y = engine.npc!.y;
    step(0.05);
    expect(onNpcProximityChange).not.toHaveBeenCalledWith(expect.objectContaining({ inRange: true }));

    // 90 px mesafede (<= 101 px) eşik aşılır
    engine.player.x = engine.npc!.x - 90;
    step(0.05);
    expect(onNpcProximityChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ inRange: true }),
    );

    // startEncounterFacing girişleri kilitler, devriyeyi durdurur ve yüzleri birbirine çevirir
    engine.startEncounterFacing();
    expect(engine.getInputDisabled()).toBe(true);
    expect(engine.npc!.direction).toBe('left');
    expect(engine.player.direction).toBe('right');
    const frozenX = engine.npc!.x;
    step(0.4);
    expect(engine.npc!.x).toBe(frozenX);

    engine.destroy();
  });

  it('4. Seçenek paneli (>=44px, Dinle önizleme, 1. yanlış ipucu, 2. yanlış vurgulama) doğru çalışır', () => {
    const onSelectOption = vi.fn();
    const onPreviewOption = vi.fn();
    const steps = buildSultanhaniDialogueSteps('Ece', 0);
    const firstStep = steps[0];

    const { rerender } = render(
      <NpcSpeechBubble
        activeBubble={{ speaker: 'tourist', speakerLabel: 'Alex', text: 'Good morning!' }}
        anchorPos={{ x: 640, y: 360 }}
        choicePrompt={{
          stepId: firstStep.id,
          options: firstStep.options!,
          wrongAttempts: 0,
          hintTurkish: firstStep.hintTurkish,
        }}
        onSelectOption={onSelectOption}
        onPreviewOption={onPreviewOption}
      />,
    );

    const previewButtons = screen.getAllByRole('button', { name: /^Seçeneği dinle:/ });
    expect(previewButtons[0].className).toContain('min-h-[44px]');
    expect(previewButtons[0].className).toContain('min-w-[44px]');
    fireEvent.click(previewButtons[0]);
    expect(onPreviewOption).toHaveBeenCalledTimes(1);
    expect(onSelectOption).not.toHaveBeenCalled();

    // 1. yanlış deneme: cezalandırıcı "Yanlış" sözcüğü yok, "Tekrar dene!" ve ipucu var
    rerender(
      <NpcSpeechBubble
        activeBubble={null}
        anchorPos={{ x: 400, y: 360 }}
        choicePrompt={{
          stepId: firstStep.id,
          options: firstStep.options!,
          wrongAttempts: 1,
          hintTurkish: firstStep.hintTurkish,
        }}
        onSelectOption={onSelectOption}
        onPreviewOption={onPreviewOption}
      />,
    );
    const banner = screen.getByTestId('choice-feedback-banner');
    expect(banner.textContent).toContain('Tekrar dene!');
    expect(banner.textContent).not.toMatch(/yanlış/i);

    // 2. yanlış deneme: doğru seçenek vurgulanır
    rerender(
      <NpcSpeechBubble
        activeBubble={null}
        anchorPos={{ x: 400, y: 360 }}
        choicePrompt={{
          stepId: firstStep.id,
          options: firstStep.options!,
          wrongAttempts: 2,
          hintTurkish: firstStep.hintTurkish,
        }}
        onSelectOption={onSelectOption}
        onPreviewOption={onPreviewOption}
      />,
    );
    const correctBtn = screen.getByRole('button', { name: 'Hello!' });
    expect(correctBtn.closest('[data-highlighted]') ?? correctBtn).toHaveAttribute('data-highlighted', 'true');
  });

  it('5. Tam akış: yaklaşma -> FACING -> DIALOG_1 -> DIALOG_2 -> birlikte kapıya yürüyüş -> iç mekân DONE ve temizlik', async () => {
    vi.useFakeTimers();
    const { utterances, synth } = setupMockSpeech(['en-US', 'tr-TR']);

    const profile = createStudentProfile('Ece', 'avatar_1', 3);
    const st = createInitialStudentState();
    st.selectedGrade = 3;
    st.speechEnabled = true;
    saveStudentState(st);

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(createMockCanvasContext());
    HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
      left: 0,
      top: 0,
      width: 1280,
      height: 720,
    });

    const flushAllMicrotasks = async () => {
      for (let i = 0; i < 6; i++) {
        await Promise.resolve();
      }
    };

    render(
      <MemoryRouter initialEntries={['/']}>
        <CampusProviders>
          <WalkableCampusView characterId="ece" initialScene="sultanhani_square" />
        </CampusProviders>
      </MemoryRouter>,
    );

    const engine = (window as unknown as { __WALKABLE_ENGINE__?: WalkableCanvasEngine })
      .__WALKABLE_ENGINE__!;
    expect(engine).toBeDefined();
    expect(engine.npc?.id).toBe('turist-sultanhani');
    expect(screen.queryByTestId('npc-speech-bubble')).not.toBeInTheDocument();

    // 1. Yaklaşma -> FACING (800 ms bekleme) -> DIALOG_1 (Öğrenci 3'lü seçenek açılır)
    await act(async () => {
      engine.setPosition({ x: engine.npc!.x - 80, y: engine.npc!.y });
      (engine as unknown as { update: (delta: number) => void }).update(0.05);
    });
    expect(engine.getInputDisabled()).toBe(true);
    expect(document.querySelector('[data-encounter-phase]')?.getAttribute('data-encounter-phase')).toBe('FACING');

    await act(async () => {
      vi.advanceTimersByTime(SULTANHANI_TIMINGS.facingPauseMs + 20);
      await flushAllMicrotasks();
    });
    expect(document.querySelector('[data-encounter-phase]')?.getAttribute('data-encounter-phase')).toBe('DIALOG_1');
    expect(screen.getByTestId('student-choice-panel')).toBeInTheDocument();

    const finishNextUtterances = async () => {
      for (let safety = 0; safety < 10; safety++) {
        await flushAllMicrotasks();
        const pending = utterances.find((u) => u.onend !== null);
        if (pending) {
          pending.onend?.();
          await flushAllMicrotasks();
        } else {
          break;
        }
      }
    };

    const chooseAnswerAndFinishExchange = async (
      correctText: string,
      expectedTouristReply: string,
    ) => {
      const btn = screen.getByRole('button', { name: correctText });
      await act(async () => {
        fireEvent.click(btn);
        await flushAllMicrotasks();
      });
      // Öğrenci balonu açık, turist balonu henüz yok
      expect(screen.getByTestId('npc-speech-bubble')).toHaveAttribute('data-speaker', 'student');
      expect(screen.getByTestId('npc-speech-bubble').textContent).toContain(correctText);

      // Öğrenci sesi biter -> öğrenci balonu kapanır -> 500 ms sonra turist balonu açılır
      await act(async () => {
        await finishNextUtterances();
      });
      expect(screen.queryByTestId('npc-speech-bubble')).not.toBeInTheDocument();

      await act(async () => {
        vi.advanceTimersByTime(SULTANHANI_TIMINGS.afterStudentLinePauseMs + 20);
        await flushAllMicrotasks();
      });
      expect(screen.getByTestId('npc-speech-bubble')).toHaveAttribute('data-speaker', 'tourist');
      expect(screen.getByTestId('npc-speech-bubble').textContent).toContain(expectedTouristReply);

      // Turist sesi biter -> turist balonu kapanır -> 600 ms sonra sıradaki adıma geçilir
      await act(async () => {
        await finishNextUtterances();
      });
      expect(screen.queryByTestId('npc-speech-bubble')).not.toBeInTheDocument();

      await act(async () => {
        vi.advanceTimersByTime(SULTANHANI_TIMINGS.afterTouristLinePauseMs + 20);
        await flushAllMicrotasks();
      });
    };

    // Değişim 1: Yanlış seçim -> Tekrar dene! -> Doğru "Hello!" -> Turist "Hello!"
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Nice to meet you.' }));
      await flushAllMicrotasks();
    });
    expect(screen.getByTestId('choice-feedback-banner').textContent).toContain('Tekrar dene!');

    await chooseAnswerAndFinishExchange('Hello!', 'Hello!');

    // Değişim 2: Öğrenci "Good morning!" -> Turist "Good morning!"
    await chooseAnswerAndFinishExchange('Good morning!', 'Good morning!');

    // Değişim 3: Öğrenci "What's your name?" -> Turist "My name is Alex." -> WALK_TO_DOOR
    expect(document.querySelector('[data-encounter-phase]')?.getAttribute('data-encounter-phase')).toBe('DIALOG_2');
    const cancelCountBeforeThird = synth.cancel.mock.calls.length;
    await chooseAnswerAndFinishExchange("What's your name?", 'My name is Alex.');

    // Turist cevabından önce ekstra speechSynthesis.cancel() çağrılmamış olmalı (yalnızca öğrenci başında 1 kez)
    expect(synth.cancel.mock.calls.length - cancelCountBeforeThird).toBe(1);
    expect(utterances.some((u) => u.text === 'My name is Alex.' && u.pitch === 0.95)).toBe(true);
    expect(profile.alias).toBe('Ece');

    // 3. değişim biter bitmez tüm balonlar kapanır ve WALK_TO_DOOR başlar
    expect(document.querySelector('[data-encounter-phase]')?.getAttribute('data-encounter-phase')).toBe('WALK_TO_DOOR');
    expect(screen.queryByTestId('npc-speech-bubble')).not.toBeInTheDocument();
    expect(screen.queryByTestId('student-choice-panel')).not.toBeInTheDocument();

    // Birlikte kapıya yürüyüş -> kapıya varınca TRANSITION aşamasına geçer
    await act(async () => {
      for (let i = 0; i < 60; i++) {
        (engine as unknown as { update: (delta: number) => void }).update(0.1);
      }
    });
    expect(document.querySelector('[data-encounter-phase]')?.getAttribute('data-encounter-phase')).toBe('TRANSITION');

    await act(async () => {
      vi.advanceTimersByTime(SULTANHANI_TIMINGS.transitionFadeMs + 50);
    });

    // İç mekân sahnesine geçildiğinde durum DONE ve iki karakter yan yana görünür
    expect(document.querySelector('[data-scene]')?.getAttribute('data-scene')).toBe('sultanhani_inner');
    expect(document.querySelector('[data-encounter-phase]')?.getAttribute('data-encounter-phase')).toBe('DONE');
    const innerEngine = (window as unknown as { __WALKABLE_ENGINE__?: WalkableCanvasEngine })
      .__WALKABLE_ENGINE__!;
    expect(innerEngine.player.x).toBe(SULTANHANI_INNER.playerSpawn.x);
    expect(innerEngine.npc?.x).toBe(SULTANHANI_INNER.touristSpawn.x);

    // İlerleme şeması değişmedi, Stage 3/4 konuşmaları başlamadı
    expect(loadStudentState().selectedGrade).toBe(3);
    expect(screen.queryByTestId('npc-speech-bubble')).not.toBeInTheDocument();

    // Sınıfa Dön tıklandığında temizlenir ve classroom'a döner
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Sınıfa dön' }));
      vi.advanceTimersByTime(650);
    });
    expect(document.querySelector('[data-scene]')?.getAttribute('data-scene')).toBe('classroom');
    expect(document.querySelector('[data-encounter-phase]')?.getAttribute('data-encounter-phase')).toBe('ARRIVAL');
  });

  it('6. Ses kapalıyken, onend gelmezken (1.5x koruma) ve Sınıfa Dön ile yarıda çıkışta akış takılmaz', async () => {
    vi.useFakeTimers();
    const { utterances } = setupMockSpeech(['en-US']);
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // 1.5x timeout korumasını doğrula
    expect(getSpeechTimeoutMs('Hello!')).toBe(3000);

    const st = createInitialStudentState();
    st.selectedGrade = 3;
    st.speechEnabled = false;
    saveStudentState(st);

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(createMockCanvasContext());
    HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
      left: 0,
      top: 0,
      width: 1280,
      height: 720,
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <CampusProviders>
          <WalkableCampusView initialScene="sultanhani_square" />
        </CampusProviders>
      </MemoryRouter>,
    );

    const engine = (window as unknown as { __WALKABLE_ENGINE__?: WalkableCanvasEngine })
      .__WALKABLE_ENGINE__!;

    await act(async () => {
      engine.setPosition({ x: engine.npc!.x - 80, y: engine.npc!.y });
      (engine as unknown as { update: (delta: number) => void }).update(0.05);
      vi.advanceTimersByTime(SULTANHANI_TIMINGS.facingPauseMs + 20);
      await Promise.resolve();
    });

    // Ses kapalıyken de seçim paneli açılır ve hiç utterance oynatılmaz
    expect(utterances).toHaveLength(0);
    expect(screen.getByTestId('student-choice-panel')).toBeInTheDocument();

    // Konuşma ortasında Sınıfa Dön'e tıklanınca durum temizlenir
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Sınıfa dön' }));
      vi.advanceTimersByTime(650);
    });
    expect(document.querySelector('[data-scene]')?.getAttribute('data-scene')).toBe('classroom');
    expect(screen.queryByTestId('student-choice-panel')).not.toBeInTheDocument();
    warnSpy.mockRestore();
  });

  it('7. onend gelmezken 1.5x koruma tek console.warn ile ilerler ve 12 sn yürüyüş bekçisi sahneyi kilitlemez', async () => {
    vi.useFakeTimers();
    setupMockSpeech(['en-US']);
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const st = createInitialStudentState();
    st.selectedGrade = 3;
    st.speechEnabled = true;
    saveStudentState(st);

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(createMockCanvasContext());
    HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
      left: 0,
      top: 0,
      width: 1280,
      height: 720,
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <CampusProviders>
          <WalkableCampusView initialScene="sultanhani_square" />
        </CampusProviders>
      </MemoryRouter>,
    );

    const engine = (window as unknown as { __WALKABLE_ENGINE__?: WalkableCanvasEngine })
      .__WALKABLE_ENGINE__!;

    await act(async () => {
      engine.setPosition({ x: engine.npc!.x - 80, y: engine.npc!.y });
      (engine as unknown as { update: (delta: number) => void }).update(0.05);
      vi.advanceTimersByTime(SULTANHANI_TIMINGS.facingPauseMs + 20);
      await Promise.resolve();
    });

    // "Hello!" seçimi yapılıyor ama öğrenci onend hiç gelmiyor -> 2000 ms'de turist cevabı bekçisi devreye girer
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Hello!' }));
      for (let i = 0; i < 6; i++) await Promise.resolve();
    });
    await act(async () => {
      vi.advanceTimersByTime(SULTANHANI_TIMINGS.touristReplyWatchdogMs + 20);
      for (let i = 0; i < 6; i++) await Promise.resolve();
    });
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('npc-speech-bubble')).toHaveAttribute('data-speaker', 'tourist');

    // Turist onend de hiç gelmezse 1.5x (3000 ms) koruma devreye girer ve balon kapanır
    await act(async () => {
      vi.advanceTimersByTime(getSpeechTimeoutMs('Hello!') + 50);
      for (let i = 0; i < 6; i++) await Promise.resolve();
    });
    expect(warnSpy).toHaveBeenCalledTimes(2);
    expect(screen.queryByTestId('npc-speech-bubble')).not.toBeInTheDocument();
  });

  it('8. Görsel yüklenemezse NPC gizlenir ve tek console.warn yazılır', () => {
    clearCachedAssetForTesting(SULTANHANI_TOURIST_ATLAS_URL);
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    triggerAssetLoadErrorForTesting(SULTANHANI_TOURIST_ATLAS_URL);
    triggerAssetLoadErrorForTesting(SULTANHANI_TOURIST_ATLAS_URL);

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(getSultanhaniTouristAtlas()).toBeNull();

    const mockCtx = createMockCanvasContext();
    renderSultanhaniEntities(
      mockCtx,
      {
        x: 625,
        y: 760,
        width: 22,
        height: 28,
        direction: 'up',
        state: 'idle',
        speed: 160,
        walkFrame: 0,
        grade: 3,
      },
      null,
    );
    drawTouristNpc(mockCtx, {
      id: SULTANHANI_TOURIST_NPC.id,
      name: SULTANHANI_TOURIST_NPC.name,
      x: 880,
      y: 645,
      width: 53,
      height: 67,
      direction: 'left',
      state: 'idle',
      speed: 80,
      walkFrame: 0,
      visible: true,
    });
    expect(mockCtx.drawImage).not.toHaveBeenCalled();
  });
});
