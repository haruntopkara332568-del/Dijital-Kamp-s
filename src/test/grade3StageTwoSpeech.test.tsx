import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getGrade3StageTwoSpeech, splitForSpeech } from '@/src/data/grade3Stage2Content';
import { Grade3StageTwoView } from '@/src/features/missions/Grade3StageTwoView';

const names = ['Ece', 'Can', 'Ali'];

describe('splitForSpeech', () => {
  it.each([
    ['My name is Ece.', [{ lang: 'en', text: 'My name is ' }, { lang: 'tr', text: 'Ece.' }]],
    ["Hello! What's your name?", [{ lang: 'en', text: "Hello! What's your name?" }]],
    ['Nice to meet you, Ali!', [{ lang: 'en', text: 'Nice to meet you, ' }, { lang: 'tr', text: 'Ali!' }]],
    ['My name is Can.', [{ lang: 'en', text: 'My name is ' }, { lang: 'tr', text: 'Can.' }]],
    ['can, Canan, Can!', [{ lang: 'en', text: 'can, Canan, ' }, { lang: 'tr', text: 'Can!' }]],
  ])('preserves the text and language of %s', (text, expected) => {
    const parts = splitForSpeech(text, names);
    expect(parts).toEqual(expected);
    expect(parts.map((part) => part.text).join('')).toBe(text);
  });

  it.each(['', ' ', ' ... ! '])('returns no spoken parts for %j', (text) => {
    expect(splitForSpeech(text, names)).toEqual([]);
  });

  it.each([
    ['My name is Ece.', 'My name is Eh-jeh.'],
    ['Nice to meet you, Elif!', 'Nice to meet you, Eh-leef!'],
    ['My name is Gezgin Ada.', 'My name is Gezgin Ada.'],
    ['Nice to meet you, too!', 'Nice to meet you, too!'],
  ])('prepares one English-voice line for %s', (text, spokenText) => {
    expect(getGrade3StageTwoSpeech(text, text.startsWith('Nice to meet you, '))).toEqual({
      text: spokenText,
      lang: 'en-US',
    });
  });
});

class MockUtterance {
  constructor(public text: string) {}

  lang = '';
  rate = 0;
  voice: { lang: string } | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
}

function mockVoices(languages: string[]) {
  const utterances: MockUtterance[] = [];
  const synth = Object.assign(new EventTarget(), {
    getVoices: vi.fn(() => languages.map((lang) => ({ lang }))),
    speak: vi.fn((utterance: MockUtterance) => utterances.push(utterance)),
    cancel: vi.fn(),
  });
  vi.stubGlobal('speechSynthesis', synth);
  vi.stubGlobal('SpeechSynthesisUtterance', MockUtterance);
  return { utterances, synth };
}

const canIntroduction = 'My name is Can.';
const noAudio = 'Ses bu cihazda kullanılamıyor.';

async function listen(text: string) {
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Dinle: ' + text })));
}

async function settle(utterance: MockUtterance, event: 'onend' | 'onerror' = 'onend') {
  await act(async () => utterance[event]?.());
}

describe('3. sınıf 2. Aşama ses kuyruğu', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('uses one English voice throughout the dialogue when both voices are available', async () => {
    const languages: string[] = [];
    const { utterances, synth } = mockVoices(languages);
    render(<Grade3StageTwoView entryTable="kesfet" />);
    expect(synth.speak).not.toHaveBeenCalled();

    await act(async () => fireEvent.click(screen.getByRole('button', { name: /^Konuşmayı dinle:/ })));
    expect(utterances).toHaveLength(0);
    languages.push('tr-TR', 'en-US');
    await act(async () => synth.dispatchEvent(new Event('voiceschanged')));

    const lines = ["Hello! What's your name?", 'My name is Jahn.', 'Nice to meet you!', 'Nice to meet you, too!'];
    const voice = utterances[0].voice;
    expect(voice).toEqual({ lang: 'en-US' });
    for (const [index, text] of lines.entries()) {
      expect(utterances[index]).toMatchObject({ text, lang: 'en-US', rate: 0.85 });
      expect(utterances[index].voice).toBe(voice);
      await settle(utterances[index]);
    }

    expect(utterances).toHaveLength(lines.length);
    expect(synth.cancel).not.toHaveBeenCalled();
    expect(synth.getVoices).toHaveBeenCalledTimes(2);
    expect(screen.getByText(canIntroduction, { exact: true })).toBeVisible();
  });

  it('shows a notice without playing a lone Turkish name when English voices are missing', async () => {
    const { synth } = mockVoices(['tr-TR']);
    render(<Grade3StageTwoView entryTable="kesfet" />);
    await listen(canIntroduction);
    expect(synth.speak).not.toHaveBeenCalled();
    expect(screen.getByText(noAudio)).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Yeni Arkadaşımla Tanışıyorum' })).toBeVisible();
  });

  it('continues to the next line after a playback error and shows the notice', async () => {
    const { utterances } = mockVoices(['en-US', 'tr-TR']);
    render(<Grade3StageTwoView entryTable="kesfet" />);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: /^Konuşmayı dinle:/ })));
    await settle(utterances[0], 'onerror');
    expect(utterances[1]).toMatchObject({ text: 'My name is Jahn.', lang: 'en-US' });
    await settle(utterances[1]);
    await settle(utterances[2]);
    await settle(utterances[3]);
    expect(screen.getByText(noAudio)).toBeVisible();
  });

  it('keeps the full sentence when only the English voice is installed', async () => {
    const { utterances } = mockVoices(['en-US']);
    render(<Grade3StageTwoView entryTable="kesfet" />);
    await listen(canIntroduction);
    expect(utterances).toMatchObject([{ text: 'My name is Jahn.', lang: 'en-US' }]);
    await settle(utterances[0]);
    expect(screen.getByText(canIntroduction, { exact: true })).toBeVisible();
  });

  it('ignores callbacks from canceled requests and stops playback on unmount', async () => {
    const { utterances, synth } = mockVoices(['en-US', 'tr-TR']);
    const view = render(<Grade3StageTwoView entryTable="kesfet" />);
    await listen(canIntroduction);
    const staleEnd = utterances[0].onend;
    const staleError = utterances[0].onerror;

    await listen('Nice to meet you!');
    expect(synth.cancel).toHaveBeenCalledTimes(1);
    await act(async () => {
      staleEnd?.();
      staleError?.();
    });
    expect(utterances.map(({ text }) => text)).toEqual(['My name is Jahn.', 'Nice to meet you!']);

    view.unmount();
    expect(synth.cancel).toHaveBeenCalledTimes(2);
    expect(utterances[1].onend).toBeNull();
  });
});
