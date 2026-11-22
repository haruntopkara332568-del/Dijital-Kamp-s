import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CampusProviders } from '@/src/app/CampusProviders';
import { createInitialStudentState, getProfileStateKey, LOCAL_STORAGE_ACTIVE_PROFILE_KEY, LOCAL_STORAGE_PROFILES_KEY } from '@/src/services/storage';
import { getEnglishNameSpeech, splitForSpeech } from '@/src/services/englishNameSpeech';
import { GRADE_3_STAGE_3, isGrade3StageThreeTableComplete } from '@/src/data/grade3Stage3Content';
import { Grade3StageThreeView } from '@/src/features/missions/Grade3StageThreeView';
import { completeGrade3StageThreeTask, getGrade3StageThreeKey, loadGrade3StageThreeProgress } from '@/src/services/grade3Stage3Progress';

describe('3. Aşama İngilizce ifadeleri ve ilerlemesi', () => {
  it.each([
    ['How old are you?', ['Ece', 'Can']],
    ["I'm nine years old.", ['Ece', 'Can']],
    ['I Can Ask About Age!', []],
  ])('preserves %s when there is no name to pronounce', (text, names) => {
    expect(splitForSpeech(text, names)).toEqual([{ lang: 'en', text }]);
  });

  it('uses the existing name pronunciation and retains punctuation', () => {
    const text = 'Nice to meet you, Can!';
    expect(splitForSpeech(text, ['Can'])).toEqual([
      { lang: 'en', text: 'Nice to meet you, ' },
      { lang: 'tr', text: 'Can!' },
    ]);
    expect(getEnglishNameSpeech(text, true)).toEqual({ lang: 'en-US', text: 'Nice to meet you, Jahn!' });
    expect(splitForSpeech('', ['Can'])).toEqual([]);
  });

  it('unlocks Paylaş after the two sentences and one dialogue, and records both rounds for the badge', () => {
    expect(isGrade3StageThreeTableComplete('uret', { orderAnswer: true, orderQuestion: true })).toBe(false);
    expect(isGrade3StageThreeTableComplete('uret', { orderAnswer: true, orderQuestion: true, guided: true })).toBe(true);
    expect(isGrade3StageThreeTableComplete('paylas', { eceEnd: true, canEnd: true })).toBe(false);
    expect(isGrade3StageThreeTableComplete('paylas', {
      eceGreet: true, eceAge: true, eceAsk: true, eceEnd: true,
      canGreet: true, canAge: true, canAsk: true, canEnd: true,
    })).toBe(true);
  });

  it('keeps 3. Aşama isolated by profile and preserves a corrupt record and 2. Aşama', () => {
    const keyA = getGrade3StageThreeKey('stage-three-a');
    const keyB = getGrade3StageThreeKey('stage-three-b');
    const stageTwoKey = 'dek_campus_profile_v1:stage-three-a:state:my-name-is::grade-3';
    window.localStorage.setItem(stageTwoKey, 'previous-stage');
    window.localStorage.setItem(keyB, '{corrupt');
    try {
      expect(keyA).toBe('dek_campus_profile_v1:stage-three-a:state:how-old-are-you::grade-3');
      completeGrade3StageThreeTask('stage-three-a', {}, 'eight');
      expect(loadGrade3StageThreeProgress('stage-three-a')).toEqual({ completed: { eight: true }, persistent: true });
      expect(loadGrade3StageThreeProgress('stage-three-b')).toEqual({ completed: {}, persistent: false });
      completeGrade3StageThreeTask('stage-three-b', {}, 'seven');
      expect(loadGrade3StageThreeProgress('stage-three-b').completed).toEqual({ seven: true });
      expect(window.localStorage.getItem(keyB)).toBe('{corrupt');
      expect(window.localStorage.getItem(stageTwoKey)).toBe('previous-stage');
    } finally {
      [keyA, keyB, stageTwoKey].forEach((key) => window.localStorage.removeItem(key));
    }
  });
});

class MockUtterance {
  constructor(public text: string) {}

  lang = '';
  rate = 0;
  voice: { name: string; lang: string } | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
}

function mockVoices(voices: { name: string; lang: string }[]) {
  const utterances: MockUtterance[] = [];
  const synth = Object.assign(new EventTarget(), {
    getVoices: vi.fn(() => voices),
    speak: vi.fn((utterance: MockUtterance) => utterances.push(utterance)),
    cancel: vi.fn(),
  });
  vi.stubGlobal('speechSynthesis', synth);
  vi.stubGlobal('SpeechSynthesisUtterance', MockUtterance);
  return { synth, utterances };
}

async function playNumber() {
  await act(async () => fireEvent.click(screen.getByRole('button', { name: GRADE_3_STAGE_3.discover.numberListen })));
}

describe('3. Aşama ses kuyruğu', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('reads number stones in English with the existing narrator and advances on a correct stone', async () => {
    const voice = { name: 'Microsoft Zira', lang: 'en-US' };
    const { synth, utterances } = mockVoices([{ name: 'Microsoft Tolga', lang: 'tr-TR' }, voice]);
    const log = vi.spyOn(console, 'info').mockImplementation(() => {});
    render(<Grade3StageThreeView entryTable="kesfet" />);
    expect(synth.speak).not.toHaveBeenCalled();

    await playNumber();
    expect(utterances[0]).toMatchObject({ text: 'eight', lang: 'en-US', rate: 0.85 });
    expect(utterances[0].voice).toBe(voice);
    fireEvent.click(screen.getByRole('button', { name: '8' }));
    await playNumber();
    expect(utterances[1]).toMatchObject({ text: 'seven', lang: 'en-US' });
    expect(utterances[1].voice).toBe(voice);
    expect(synth.getVoices).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledExactlyOnceWith('[ses] en: Microsoft Zira, tr: Microsoft Zira (adlar için aynı ses)');
  });

  it.each([
    [{ name: 'Microsoft Tolga', lang: 'tr-TR' }],
    [{ name: 'Microsoft David', lang: 'en-US' }],
  ])('shows the word and continues when %o is the only available voice', async (voice) => {
    const { synth } = mockVoices([voice]);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Grade3StageThreeView entryTable="kesfet" />);
    await playNumber();
    expect(synth.speak).not.toHaveBeenCalled();
    expect(screen.getByText(GRADE_3_STAGE_3.common.audioUnavailable)).toBeVisible();
    expect(screen.getByText('eight', { exact: true })).toBeVisible();
    expect(screen.getByRole('button', { name: '8' })).toBeEnabled();
  });

  it('ignores callbacks from an older request and cancels playback on exit', async () => {
    const { synth, utterances } = mockVoices([{ name: 'Microsoft Zira', lang: 'en-US' }]);
    const view = render(<Grade3StageThreeView entryTable="kesfet" />);
    await playNumber();
    const staleError = utterances[0].onerror;
    await playNumber();
    await act(async () => staleError?.());
    expect(synth.cancel).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(GRADE_3_STAGE_3.common.audioUnavailable)).not.toBeInTheDocument();
    view.unmount();
    expect(synth.cancel).toHaveBeenCalledTimes(2);
    expect(utterances[1].onend).toBeNull();
  });
});


describe('Üret ve Paylaş yaş diyaloğu', () => {
  const profileId = 'stage-three-dialogue';
  const otherProfile = 'stage-three-other-dialogue';
  const key = getGrade3StageThreeKey(profileId);
  const otherKey = getGrade3StageThreeKey(otherProfile);
  const secondKey = getProfileStateKey(profileId) + ':my-name-is::grade-3';
  const completed = { pair: true, buildAge: true, identify: true,
    orderAnswer: true, orderQuestion: true, guided: true, independent: true };
  const content = GRADE_3_STAGE_3;

  function renderTable(table: 'uret' | 'paylas', id = profileId) {
    const now = new Date().toISOString();
    window.localStorage.setItem(LOCAL_STORAGE_PROFILES_KEY, JSON.stringify([profileId, otherProfile].map((id) => ({
      id, alias: 'Gezgin', avatarId: 'avatar_1', selectedGrade: 3, createdAt: now, lastUsedAt: now,
    }))));
    window.localStorage.setItem(LOCAL_STORAGE_ACTIVE_PROFILE_KEY, id);
    window.localStorage.setItem(getProfileStateKey(id), JSON.stringify({
      ...createInitialStudentState(),
      selectedGrade: 3,
    }));
    return render(
      <MemoryRouter>
        <CampusProviders><Grade3StageThreeView entryTable={table} /></CampusProviders>
      </MemoryRouter>,
    );
  }

  afterEach(() => {
    cleanup();
    [key, otherKey, secondKey, getProfileStateKey(profileId), getProfileStateKey(otherProfile),
      LOCAL_STORAGE_ACTIVE_PROFILE_KEY, LOCAL_STORAGE_PROFILES_KEY].forEach((key) => window.localStorage.removeItem(key));
  });

  it('keeps a legacy record and guides Paylaş to Üret when no product has been saved', () => {
    const legacy = JSON.stringify({ version: 1, completed });
    window.localStorage.setItem(key, legacy);
    renderTable('paylas');

    expect(screen.getByText(content.share.noDialogue)).toBeVisible();
    expect(screen.queryByRole('link', { name: content.share.downloadDialogue })).not.toBeInTheDocument();
    expect(window.localStorage.getItem(key)).toBe(legacy);
  });

  it('saves the dialogue built with cards, opens it in Paylaş and exports the same lines', () => {
    window.localStorage.setItem(key, JSON.stringify({ version: 1, completed }));
    window.localStorage.setItem(otherKey, JSON.stringify({ version: 1, completed, dialogueAge: 8 }));
    window.localStorage.setItem(secondKey, 'previous-stage');
    const builder = renderTable('uret');
    fireEvent.click(screen.getByRole('button', { name: '10' }));
    expect(screen.getByRole('button', { name: content.produce.check })).toBeDisabled();
    expect(loadGrade3StageThreeProgress(profileId).dialogueAge).toBeUndefined();

    for (const word of ["I'm", 'ten', 'years', 'old.']) {
      fireEvent.click(screen.getByRole('button', { name: word }));
    }
    fireEvent.click(screen.getByRole('button', { name: content.produce.check }));
    expect(screen.getByText("I'm ten years old.", { exact: true })).toBeVisible();
    builder.unmount();

    const share = renderTable('paylas');
    const download = screen.getByRole('link', { name: content.share.downloadDialogue });
    expect(screen.getByText(content.share.dialogueTitle)).toBeVisible();
    expect(download).toHaveAttribute('download', content.share.dialogueFilename);
    const href = download.getAttribute('href')!;
    expect(decodeURIComponent(href.slice(href.indexOf(',') + 1))).toBe("Can: How old are you?\nSen: I'm ten years old.");
    fireEvent.click(screen.getByRole('button', { name: 'Hello!' }));
    expect(loadGrade3StageThreeProgress(profileId).dialogueAge).toBe(10);
    expect(loadGrade3StageThreeProgress(profileId).completed).toMatchObject({ ...completed, eceGreet: true });
    expect(window.localStorage.getItem(secondKey)).toBe('previous-stage');
    share.unmount();

    renderTable('paylas', otherProfile);
    expect(screen.getByText("I'm eight years old.", { exact: true })).toBeVisible();
    expect(screen.queryByText("I'm ten years old.", { exact: true })).not.toBeInTheDocument();
  });

  it('ignores an invalid fictional age while retaining the completed tasks', () => {
    window.localStorage.setItem(key, JSON.stringify({ version: 1, completed, dialogueAge: 11 }));
    expect(loadGrade3StageThreeProgress(profileId)).toEqual({ completed, persistent: true });
  });
});
