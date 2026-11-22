/// <reference types="vite/client" />

import { useState, type ReactNode } from 'react';
import { Volume2 } from 'lucide-react';
import {
  GRADE_3_STAGE_4 as lesson, SULTANHANI_WORDS, sultanhaniSentence,
  type SultanhanıLabel, type SultanhanıSentence, type SultanhanıWord,
} from '@/src/data/grade3Stage4Content';
import {
  FULL_RECT, polygonArea, SHOW_SULTANHANI_ILLUSTRATION_NOTE, SULTANHANI_CROPS, SULTANHANI_HOTSPOTS,
  SULTANHANI_IMAGES, SULTANHANI_VIEWS, sultanhaniSlots, type CropRect, type SultanhanıImageId,
  type SultanhanıViewId,
} from '@/src/data/sultanhaniStageFourAssets';
import { isSultanhaniCard, type SultanhanıCard } from '@/src/services/grade3Stage4Progress';

export const stageFourButton = 'inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-lg border border-[var(--campus-border)] bg-[var(--campus-surface)] px-3 py-2 text-center font-semibold text-[var(--seljuk-navy)] hover:bg-[var(--stone-cream)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--seljuk-teal)] disabled:opacity-50';
export const stageFourPanel = 'space-y-3 rounded-xl border border-[var(--campus-border)] bg-[var(--stone-cream)]/65 p-3 sm:p-4';
const emphasis = 'font-semibold text-[var(--seljuk-navy)]';
const selectedStyle = ' ring-2 ring-[var(--seljuk-teal)] bg-[var(--seljuk-teal-soft)]';
const produceViews = SULTANHANI_VIEWS.filter((view) => {
  const enoughSlots = sultanhaniSlots(view).length >= 3;
  if (!enoughSlots && import.meta.env.DEV) console.warn('4. aşama görünümünde üç etiket yuvası bulunamadı', view.id);
  return enoughSlots;
});

export type StageFourListen = (text: string) => void;
export interface StageFourActivityProps {
  listen: StageFourListen;
  finish: (recipe?: SultanhanıCard) => void;
  card?: SultanhanıCard;
}

function ListenButton({ text, listen }: { text: string; listen: StageFourListen }) {
  return (
    <button type="button" className={stageFourButton} aria-label={lesson.listen + ': ' + text} onClick={() => listen(text)}>
      <Volume2 className="h-4 w-4" aria-hidden="true" /> {lesson.listen}
    </button>
  );
}

function Photo({ image, crop = FULL_RECT, caption, children }: {
  image: SultanhanıImageId;
  crop?: CropRect;
  caption: string;
  children?: ReactNode;
}) {
  const source = SULTANHANI_IMAGES[image];
  const [broken, setBroken] = useState(false);

  return (
    <div className="relative isolate overflow-hidden rounded-xl border border-[var(--campus-border)] bg-stone-200"
      style={{ aspectRatio: (source.width * crop.width) / (source.height * crop.height) }}>
      {broken ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-2 text-center font-semibold text-stone-700">
          <span>{lesson.placeholder}</span><span>{caption}</span>
        </div>
      ) : (
        <img src={source.url} alt={caption} draggable={false} onError={() => setBroken(true)}
          className="pointer-events-none absolute max-w-none select-none"
          style={{ width: 10000 / crop.width + '%', height: 10000 / crop.height + '%',
            left: -100 * crop.x / crop.width + '%', top: -100 * crop.y / crop.height + '%' }} />
      )}
      {!broken && children}
    </div>
  );
}

function Crop({ target }: { target: keyof typeof SULTANHANI_CROPS }) {
  const { image, crop } = SULTANHANI_CROPS[target];
  return <Photo key={target} image={image} crop={crop}
    caption={target === 'exterior' ? lesson.place : lesson.words[target]} />;
}

function targetLabel(word: SultanhanıWord) {
  return lesson.words[word];
}

function DiscoverMap({ image, targets, marked, debug, choose }: {
  image: SultanhanıImageId;
  targets: readonly SultanhanıLabel[];
  marked: (target: SultanhanıWord) => boolean;
  debug: boolean;
  choose: (target: SultanhanıWord) => void;
}) {
  const hotspots = SULTANHANI_HOTSPOTS[image].filter(({ id }) => targets.includes(id))
    .sort((a, b) => polygonArea(b.polygon) - polygonArea(a.polygon));

  return (
    <div className="space-y-2">
      <Photo image={image} caption={lesson.views[image]}>
        {hotspots.map(({ id, polygon }) => (
          <button key={id} type="button" aria-label={targetLabel(id)} tabIndex={-1}
            className={'absolute inset-0 min-h-[44px] min-w-[44px] cursor-pointer hover:bg-teal-300/45 ' +
              (debug ? 'bg-orange-400/60 ' : marked(id) ? 'bg-teal-300/35 ' : '')}
            style={{ clipPath: 'polygon(' + polygon.map(([x, y]) => x + '% ' + y + '%').join(', ') + ')' }}
            onClick={() => choose(id)} />
        ))}
      </Photo>
      <div role="group" aria-label={lesson.mapOptions + ' · ' + lesson.views[image]} className="flex flex-wrap gap-2">
        {hotspots.map(({ id }) => (
          <button key={id} type="button" className={stageFourButton + (marked(id) ? selectedStyle : '')}
            onClick={() => choose(id)}>{targetLabel(id)}</button>
        ))}
      </div>
    </div>
  );
}

export function DiscoverStageFour({ listen, finish }: StageFourActivityProps) {
  const [seen, setSeen] = useState<SultanhanıWord[]>([]);
  const [finding, setFinding] = useState(false);
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState<SultanhanıWord>();
  const [attempts, setAttempts] = useState(0);
  const expected = lesson.discover.sequence[index];
  const debug = import.meta.env.DEV && new URLSearchParams(window.location.search).get('debug') === 'hotspots';

  const choose = (target: SultanhanıWord) => {
    if (!finding) {
      setSeen((previous) => previous.includes(target) ? previous : [...previous, target]);
      setActive(target);
      listen(target);
      return;
    }
    if (target !== expected) {
      setAttempts((value) => value + 1);
      listen(expected);
      return;
    }
    setAttempts(0);
    if (index + 1 === lesson.discover.sequence.length) finish();
    setIndex(index + 1);
  };
  const marked = (target: SultanhanıWord) => !finding || (attempts > 1 && target === expected);

  if (finding && !expected) return <p role="status">{lesson.finished}</p>;
  return (
    <section className={stageFourPanel}>
      <h4 className={emphasis}>{finding ? lesson.discover.find : lesson.discover.inspect}</h4>
      <div className="flex flex-wrap items-center gap-2">
        <span role="status">{finding ? index : seen.length} / {SULTANHANI_WORDS.length}</span>
        {(finding ? expected : active) && (
          <>
            <strong lang="en-US">{finding ? expected : active}</strong>
            <ListenButton text={(finding ? expected : active)!} listen={listen} />
          </>
        )}
      </div>
      {SHOW_SULTANHANI_ILLUSTRATION_NOTE && <p className="text-sm">{lesson.illustrationNote}</p>}
      {attempts > 0 && <p role="status">{attempts > 1 ? lesson.highlight : lesson.retry + ' ' + lesson.choiceHint}</p>}
      <div className="grid gap-3 md:grid-cols-2">
        <DiscoverMap image="exterior" targets={['gate', 'door', 'wall']} choose={choose} marked={marked} debug={debug} />
        <DiscoverMap image="courtyard" targets={['courtyard']} choose={choose} marked={marked} debug={debug} />
      </div>
      <button type="button" aria-label={targetLabel('stone')} className={'grid w-fit max-w-full min-w-[130px] gap-2 ' + stageFourButton +
        (marked('stone') ? selectedStyle : '')} onClick={() => choose('stone')}>
        <span className="block w-full"><Crop target="stone" /></span>
        {targetLabel('stone')}
      </button>
      {!finding && seen.length === SULTANHANI_WORDS.length && (
        <button type="button" className={stageFourButton} onClick={() => setFinding(true)}>{lesson.discover.beginFinding}</button>
      )}
    </section>
  );
}

function LearnQuestion({ prompt, target, options, wordsOnly, finish, listen }: {
  prompt: string;
  target: SultanhanıLabel;
  options: readonly SultanhanıSentence[];
  wordsOnly?: boolean;
  finish: () => void;
  listen: StageFourListen;
}) {
  const [attempts, setAttempts] = useState(0);
  return (
    <section className={stageFourPanel}>
      <h4 className={emphasis}>{prompt}</h4>
      <div className="max-w-xs"><Crop target={target} /></div>
      {wordsOnly && <p lang="en-US" className={emphasis}>{lesson.learn.fillPattern}</p>}
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((id) => {
          const text = wordsOnly ? id : sultanhaniSentence(id).text;
          return (
            <div key={id} className="flex min-w-0 flex-col gap-1">
              <button type="button" lang="en-US" className={stageFourButton + (attempts > 1 && id === target ? selectedStyle : '')}
                disabled={attempts > 1 && id !== target}
                onClick={() => id === target ? finish() : setAttempts((value) => value + 1)}>{text}</button>
              <ListenButton text={text} listen={listen} />
            </div>
          );
        })}
      </div>
      {attempts > 0 && <p role="status">{attempts > 1 ? lesson.highlight : lesson.retry + ' ' + lesson.choiceHint}</p>}
    </section>
  );
}

function MatchPictures({ listen, finish }: StageFourActivityProps) {
  const [selected, setSelected] = useState<keyof typeof lesson.learn.matchTargets>();
  const [matched, setMatched] = useState<SultanhanıSentence[]>([]);
  const [attempts, setAttempts] = useState(0);

  return (
    <section className={stageFourPanel}>
      <h4 className={emphasis}>{lesson.learn.match}</h4>
      <div className="grid gap-2 sm:grid-cols-2">
        {lesson.learn.matchSentences.map((id) => (
          <div key={id} className="flex flex-wrap gap-2">
            <button type="button" lang="en-US" aria-pressed={selected === id} disabled={matched.includes(id)}
              className={stageFourButton + (selected === id ? selectedStyle : '')}
              onClick={() => { setSelected(id); setAttempts(0); }}>{sultanhaniSentence(id).text}</button>
            <ListenButton text={sultanhaniSentence(id).text} listen={listen} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {lesson.learn.matchImages.map((image) => {
          const correct = selected && lesson.learn.matchTargets[selected] === image;
          const alreadyMatched = lesson.learn.matchSentences.some((id) => matched.includes(id) && lesson.learn.matchTargets[id] === image);
          return (
            <button key={image} type="button" aria-label={image === 'exterior' ? lesson.place : lesson.words[image]}
              className={'w-full flex-col ' + stageFourButton +
              (correct && attempts > 1 ? selectedStyle : '')}
              disabled={!selected || alreadyMatched || (attempts > 1 && !correct)}
              onClick={() => {
                if (!selected) return;
                if (!correct) { setAttempts((value) => value + 1); return; }
                const next = [...matched, selected];
                setMatched(next);
                setSelected(undefined);
                setAttempts(0);
                if (next.length === lesson.learn.matchSentences.length) finish();
              }}>
              <span className="block w-full"><Crop target={image} /></span>
              {image === 'exterior' ? lesson.place : lesson.words[image]}
            </button>
          );
        })}
      </div>
      {attempts > 0 && <p role="status">{attempts > 1 ? lesson.highlight : lesson.retry + ' ' + lesson.choiceHint}</p>}
    </section>
  );
}

export function LearnStageFour({ completed, ...props }: StageFourActivityProps & { completed: boolean }) {
  const [index, setIndex] = useState(0);
  const question = lesson.learn.choices[index];
  const fill = lesson.learn.fills[index - lesson.learn.choices.length];

  if (completed) {
    return (
      <section className={stageFourPanel}>
        <h4 className={emphasis}>{lesson.learn.review}</h4>
        <ul className="grid gap-2 sm:grid-cols-2">
          {lesson.sentences.map(({ id, text, description }) => (
            <li key={id} className="space-y-2 rounded-lg border border-[var(--campus-border)] p-3">
              <p lang="en-US" className={emphasis}>{text}</p><p>{description}</p>
              <ListenButton text={text} listen={props.listen} />
            </li>
          ))}
        </ul>
      </section>
    );
  }
  const current = question ?? fill;
  if (!current) return <MatchPictures {...props} />;
  return <LearnQuestion key={index} prompt={question ? lesson.learn.choose : lesson.learn.fill}
    target={current.target} options={current.options} wordsOnly={!question} listen={props.listen}
    finish={() => setIndex((value) => value + 1)} />;
}

export function ProduceStageFour({ listen, finish, card }: StageFourActivityProps) {
  const [viewId, setViewId] = useState<SultanhanıViewId>(card?.viewId ?? 'exterior');
  const [labels, setLabels] = useState<SultanhanıCard['labels']>(card?.labels ?? []);
  const [sentences, setSentences] = useState<SultanhanıSentence[]>(card?.sentenceIds ?? []);
  const [selected, setSelected] = useState<SultanhanıLabel>();
  const [attempts, setAttempts] = useState(0);
  const [saved, setSaved] = useState(false);
  const view = produceViews.find(({ id }) => id === viewId);
  if (!view) return <p role="status">{lesson.empty}</p>;
  const slots = sultanhaniSlots(view);
  const recipe: SultanhanıCard = { version: 1, viewId, labels, sentenceIds: sentences };

  const place = (id: SultanhanıLabel) => {
    if (labels.some(({ slotId }) => slotId === id)) {
      setLabels((previous) => previous.filter(({ slotId }) => slotId !== id));
      setSaved(false);
    } else if (selected === id) {
      setLabels((previous) => [...previous, { wordId: id, slotId: id }]);
      setSelected(undefined);
      setAttempts(0);
      setSaved(false);
    } else if (selected) setAttempts((value) => value + 1);
  };

  return (
    <div className="space-y-4">
      <section className={stageFourPanel}>
        <h4 className={emphasis}>{lesson.produce.chooseView}</h4>
        <div className="flex flex-wrap gap-2">
          {produceViews.map(({ id }) => (
            <button key={id} type="button" aria-pressed={viewId === id} className={stageFourButton + (id === viewId ? selectedStyle : '')}
              onClick={() => {
                if (viewId === id) return;
                setViewId(id);
                setLabels([]);
                setSelected(undefined);
                setAttempts(0);
                setSaved(false);
              }}>{lesson.views[id]}</button>
          ))}
        </div>
        <p>{lesson.produce.placeLabels}</p>
        <div className="flex flex-wrap gap-2">
          {SULTANHANI_WORDS.filter((word): word is SultanhanıLabel =>
            word !== 'stone' && slots.some(({ id }) => id === word)).map((word) => (
            <button key={word} type="button" lang="en-US" aria-pressed={selected === word}
              disabled={labels.some(({ wordId }) => wordId === word)}
              className={stageFourButton + (selected === word ? selectedStyle : '')}
              onClick={() => { setSelected(word); setAttempts(0); listen(word); }}>{word}</button>
          ))}
        </div>
        <Photo key={view.id} image={view.image} crop={view.crop} caption={lesson.views[viewId]}>
          {slots.map(({ id, x, y }) => (
            <button key={id} type="button" tabIndex={-1} aria-label={targetLabel(id)}
              className={stageFourButton + ' absolute -translate-x-1/2 -translate-y-1/2 px-2 ' +
                (attempts > 1 && selected === id ? selectedStyle : '')}
              style={{ left: x + '%', top: y + '%' }} onClick={() => place(id)}>
              {labels.find(({ slotId }) => slotId === id)?.wordId ?? '○'}
            </button>
          ))}
        </Photo>
        <div role="group" aria-label={lesson.mapOptions} className="flex flex-wrap gap-2">
          {slots.map(({ id }) => (
            <button key={id} type="button" className={stageFourButton + (attempts > 1 && selected === id ? selectedStyle : '')}
              onClick={() => place(id)}>{targetLabel(id)} {labels.find(({ slotId }) => slotId === id)?.wordId}</button>
          ))}
        </div>
        {attempts > 0 && <p role="status">{attempts > 1 ? lesson.highlight : lesson.retry + ' ' + lesson.slotHint}</p>}
      </section>
      <section className={stageFourPanel}>
        <h4 className={emphasis}>{lesson.produce.chooseSentences}</h4>
        <ul className="grid gap-2 sm:grid-cols-2">
          {lesson.sentences.map(({ id, text }) => (
            <li key={id} className="flex flex-wrap items-center gap-2">
              <button type="button" lang="en-US" aria-pressed={sentences.includes(id)}
                className={stageFourButton + (sentences.includes(id) ? selectedStyle : '')}
                disabled={sentences.length === 2 && !sentences.includes(id)}
                onClick={() => {
                  setSaved(false);
                  setSentences((previous) => previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id]);
                }}>{text}</button>
              <ListenButton text={text} listen={listen} />
            </li>
          ))}
        </ul>
        <button type="button" className={stageFourButton} disabled={!isSultanhaniCard(recipe)} onClick={() => {
          finish(recipe);
          setSaved(true);
        }}>{lesson.produce.ready}</button>
        {saved && <p role="status">{lesson.produce.saved}</p>}
      </section>
    </div>
  );
}
