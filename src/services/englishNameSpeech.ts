import type { DialogueSegment } from '@/src/types/campus';

const namePronunciations = [
  { display: 'Ece', spokenTr: 'Ece', spokenEnFallback: 'Eh-jeh' },
  { display: 'Can', spokenTr: 'Can', spokenEnFallback: 'Jahn' },
  { display: 'Elif', spokenTr: 'Elif', spokenEnFallback: 'Eh-leef' },
  { display: 'Mert', spokenTr: 'Mert', spokenEnFallback: 'Mehrt' },
  { display: 'Zeynep', spokenTr: 'Zeynep', spokenEnFallback: 'Zay-nep' },
  { display: 'Ali', spokenTr: 'Ali', spokenEnFallback: 'Ah-lee' },
  { display: 'Sultanhanı', spokenTr: 'Sultanhanı', spokenEnFallback: 'Sool-tahn-hah-nuh' },
] as const;

const sampleNames = namePronunciations.map(({ display }) => display);

const fullNamePrefix = 'My name is ';
const shortNamePrefix = "I'm ";
const greetingPrefix = 'Nice to meet you, ';

type SpeechPart = { lang: 'en' | 'tr'; text: string };

function matchNames(names: readonly string[]): RegExp | null {
  const alternatives = [...names].filter((name) => name.trim())
    .sort((first, second) => second.length - first.length)
    .map((name) => name.replace(/[.*+?^$\x7b\x7d()|[\]\\]/g, '\\$&'));
  if (!alternatives.length) return null;

  const word = '[\\p{L}\\p{M}\\p{N}_]';
  return new RegExp('(?<!' + word + ')(?:' + alternatives.join('|') + ')(?!' + word + ')', 'gu');
}

export function splitForSpeech(text: string, names: readonly string[]): SpeechPart[] {
  const pattern = matchNames(names);
  const parts: SpeechPart[] = [];
  let cursor = 0;
  let leadingPunctuation = '';

  const add = (lang: SpeechPart['lang'], value: string) => {
    if (/[\p{L}\p{N}]/u.test(value)) {
      parts.push({ lang, text: leadingPunctuation + value });
      leadingPunctuation = '';
    } else {
      const previous = parts.at(-1);
      if (previous) previous.text += value;
      else leadingPunctuation += value;
    }
  };

  for (const match of pattern ? text.matchAll(pattern) : []) {
    add('en', text.slice(cursor, match.index));
    add('tr', match[0]);
    cursor = match.index + match[0].length;
  }
  add('en', text.slice(cursor));
  return parts;
}

export function getEnglishNameSpeech(text: string, personalGreeting?: boolean): DialogueSegment {
  const prefixes = personalGreeting ? [greetingPrefix] : [fullNamePrefix, shortNamePrefix];
  const prefix = prefixes.find((candidate) => text.startsWith(candidate));
  const name = prefix && /[.!]$/.test(text) ? text.slice(prefix.length, -1) : undefined;
  const names = name ? [name] : sampleNames;
  const pattern = matchNames(names);
  const parts = splitForSpeech(text, names);
  if (!pattern || parts.map((part) => part.text).join('') !== text) return { text, lang: 'en-US' };

  const spokenText = parts.map((part) => {
    if (part.lang === 'en') return part.text;
    return part.text.replace(pattern, (match) => (
      namePronunciations.find(({ display }) => display === match)?.spokenEnFallback ?? match
    ));
  }).join('');
  return { text: spokenText, lang: 'en-US' };
}
