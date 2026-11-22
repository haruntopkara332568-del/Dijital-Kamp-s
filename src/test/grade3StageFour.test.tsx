import { afterEach, describe, expect, it } from 'vitest';
import { GRADE_3_STAGE_4 } from '@/src/data/grade3Stage4Content';
import { SULTANHANI_VIEWS, sultanhaniSlots } from '@/src/data/sultanhaniStageFourAssets';
import { GRADE_3_STAGE_FOUR_TABLES } from '@/src/features/missions/Grade3StageFourView';
import { getEnglishNameSpeech, splitForSpeech } from '@/src/services/englishNameSpeech';
import { completeGrade3StageFourTable, getGrade3StageFourKey, isSultanhaniCard,
  loadGrade3StageFourProgress, type SultanhanıCard } from '@/src/services/grade3Stage4Progress';
import { SULTANHANI_CARD_HEIGHT, SULTANHANI_CARD_WIDTH } from '@/src/utils/sultanhaniCard';

const card: SultanhanıCard = {
  version: 1,
  viewId: 'exterior',
  labels: [{ wordId: 'gate', slotId: 'gate' }, { wordId: 'door', slotId: 'door' }, { wordId: 'wall', slotId: 'wall' }],
  sentenceIds: ['gate', 'sultanhani'],
};

describe('3. sınıf 4. aşama Sultanhanı', () => {
  afterEach(() => localStorage.clear());

  it('registers exactly four tables for the fourth stage', () => {
    expect(Object.keys(GRADE_3_STAGE_FOUR_TABLES)).toEqual(
      Object.keys(GRADE_3_STAGE_4.titles).map((table) => '4:' + table),
    );
  });

  it('uses the shared Unicode split and keeps the full English fallback', () => {
    const text = 'This is Sultanhanı.';
    const parts = splitForSpeech(text, ['Sultanhanı']);
    expect(parts).toEqual([{ lang: 'en', text: 'This is ' }, { lang: 'tr', text: 'Sultanhanı.' }]);
    expect(parts.map(({ text }) => text).join('')).toBe(text);
    expect(splitForSpeech('Sultanhanıabc.', ['Sultanhanı'])).toEqual([{ lang: 'en', text: 'Sultanhanıabc.' }]);
    expect(getEnglishNameSpeech(text)).toEqual({ lang: 'en-US', text: 'This is Sool-tahn-hah-nuh.' });
  });

  it('requires three different matching labels, one or two approved sentences, and valid slots', () => {
    expect(SULTANHANI_VIEWS.every((view) => sultanhaniSlots(view).length >= 3)).toBe(true);
    expect(isSultanhaniCard(card)).toBe(true);
    expect(isSultanhaniCard({ ...card, labels: card.labels.slice(0, 2) })).toBe(false);
    expect(isSultanhaniCard({ ...card, labels: card.labels.map(() => card.labels[0]) })).toBe(false);
    expect(isSultanhaniCard({ ...card, sentenceIds: ['gate', 'door', 'wall'] })).toBe(false);
    expect([SULTANHANI_CARD_WIDTH, SULTANHANI_CARD_HEIGHT]).toEqual([1200, 800]);
  });

  it('keeps a card and table completion separate by profile and stage', () => {
    const alpha = 'stage-four-a';
    const beta = 'stage-four-b';
    const older = 'dek_campus_profile_v1:stage-four-a:state:how-old-are-you::grade-3';
    localStorage.setItem(older, 'önceki aşama');
    const started = loadGrade3StageFourProgress(alpha);
    const saved = completeGrade3StageFourTable(alpha, started, 'uret', card);
    completeGrade3StageFourTable(alpha, saved, 'paylas');
    expect(loadGrade3StageFourProgress(alpha)).toEqual({ card, completed: { uret: true, paylas: true }, persistent: true });
    expect(loadGrade3StageFourProgress(beta)).toEqual({ completed: {}, persistent: true });
    expect(localStorage.getItem(older)).toBe('önceki aşama');
  });

  it('keeps invalid persisted data and continues the session', () => {
    const profile = 'stage-four-corrupt';
    const key = getGrade3StageFourKey(profile);
    localStorage.setItem(key, '{bozuk');
    const empty = loadGrade3StageFourProgress(profile);
    expect(empty).toEqual({ completed: {}, persistent: false });
    completeGrade3StageFourTable(profile, empty, 'uret', card);
    expect(loadGrade3StageFourProgress(profile)).toEqual({ completed: { uret: true }, card, persistent: false });
    expect(localStorage.getItem(key)).toBe('{bozuk');
  });
});
