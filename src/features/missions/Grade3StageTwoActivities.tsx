import { useState } from 'react';
import { Check, Volume2 } from 'lucide-react';
import {
  GRADE_3_STAGE_2 as content,
  isGrade3StageTwoTableComplete,
  type Grade3StageTwoCompleted,
  type Grade3StageTwoTask,
} from '@/src/data/grade3Stage2Content';
import { getStudentCharacter, type StudentCharacterId } from '@/src/data/studentCharacters';

export type StageTwoListen = (
  texts: readonly string[],
  onLine?: (index: number) => void,
  personalGreeting?: boolean,
) => void;

interface ActivityProps {
  completed: Grade3StageTwoCompleted;
  finish: (task: Grade3StageTwoTask) => void;
  listen: StageTwoListen;
}

export const stageTwoButton = 'min-h-[44px] min-w-[44px] rounded-lg border border-[var(--campus-border)] bg-[var(--campus-surface)] px-3 py-2 text-sm font-semibold text-[var(--seljuk-navy)] hover:bg-[var(--stone-cream)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--seljuk-teal)] disabled:opacity-55';
const panel = 'space-y-3 rounded-xl border border-[var(--campus-border)] bg-[var(--stone-cream)]/65 p-3 sm:p-4';
const term = 'font-semibold leading-snug text-[var(--seljuk-navy)]';

function ListenButton({ text, listen, label, iconOnly }: {
  text: string;
  listen: () => void;
  label?: string;
  iconOnly?: boolean;
}) {
  return (
    <button type="button" className={stageTwoButton + ' inline-flex items-center justify-center gap-1.5'}
      aria-label={`${label ?? content.common.listen}: ${text}`} onClick={listen}>
      <Volume2 className="h-4 w-4 shrink-0 text-[var(--seljuk-teal)]" aria-hidden="true" />
      {!iconOnly && (label ?? content.common.listen)}
    </button>
  );
}

function TaskComplete() {
  return (
    <p role="status" className="flex items-center gap-2 text-sm font-semibold text-[var(--seljuk-teal)]">
      <Check className="h-4 w-4" aria-hidden="true" />
      {content.common.taskDone}
    </p>
  );
}

function Person({ name, characterId }: { name: string; characterId?: StudentCharacterId }) {
  const person = getStudentCharacter(characterId);
  return (
    <span className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-[var(--seljuk-navy)]">
      {person && (
        <span aria-hidden="true" className="h-10 w-8 rounded-lg bg-[var(--seljuk-teal-soft)] bg-top-left bg-no-repeat"
          style={{ backgroundImage: `url(${person.atlasUrl})`, backgroundSize: '400% 400%' }} />
      )}
      {name}
    </span>
  );
}

function ChoiceTask({
  prompt, options, correctIndex, hint, finish, listen, language = 'en-US', hintOnRequest = false,
}: {
  prompt: string;
  options: readonly string[];
  correctIndex: number;
  hint: string;
  finish: () => void;
  language?: 'en-US' | 'tr';
  hintOnRequest?: boolean;
  listen?: StageTwoListen;
}) {
  const [attempts, setAttempts] = useState(0);
  const [hintOpen, setHintOpen] = useState(false);
  const revealed = attempts >= 2;
  return (
    <fieldset className="min-w-0 space-y-3">
      <legend className={term}>{prompt}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option, index) => (
          <div key={option} className="flex min-w-0 gap-1.5">
            <button type="button" lang={language}
              className={stageTwoButton + ' flex-1' + (revealed && index === correctIndex ? ' ring-2 ring-[var(--seljuk-teal)]' : '')}
              disabled={revealed && index !== correctIndex}
              onClick={() => {
                if (index === correctIndex) finish();
                else setAttempts((count) => count + 1);
              }}>
              {option}
            </button>
            {listen && <ListenButton text={option} listen={() => listen([option])} iconOnly />}
          </div>
        ))}
      </div>
      {attempts > 0 && (
        <p role="status" className="text-sm text-[var(--campus-ink)]">
          {revealed ? content.common.reveal : `${content.common.tryAgain} ${!hintOnRequest || hintOpen ? hint : ''}`}
        </p>
      )}
      {hintOnRequest && attempts === 1 && !hintOpen && (
        <button type="button" className={stageTwoButton} onClick={() => setHintOpen(true)}>
          {content.share.hintButton}
        </button>
      )}
    </fieldset>
  );
}

export function DiscoverStageTwo({ completed, finish, listen }: ActivityProps) {
  const lesson = content.discover;
  const [activeLine, setActiveLine] = useState(0);
  return (
    <div className="space-y-4">
      <section className={panel}>
        <ListenButton text={lesson.scene.map((line) => line.text).join(' ')} label={content.common.replay}
          listen={() => listen(lesson.scene.map((line) => line.text), setActiveLine)} />
        <ol className="space-y-2">
          {lesson.scene.map((line, index) => (
            <li key={line.text} aria-current={activeLine === index ? 'step' : undefined}
              className={'flex flex-wrap items-center gap-2 rounded-lg border p-2 ' +
                (activeLine === index ? 'border-[var(--seljuk-teal)] bg-[var(--seljuk-teal-soft)]' : 'border-[var(--campus-border)] bg-[var(--campus-surface)]')}>
              <Person name={line.speaker} characterId={line.speaker === 'Ece' ? 'ece' : 'deniz'} />
              <span lang="en-US" className={term + ' flex-1'}>{line.text}</span>
              <ListenButton text={line.text} listen={() => {
                setActiveLine(index);
                listen([line.text]);
              }} />
            </li>
          ))}
        </ol>
      </section>
      <section className={panel}>
        <p lang="en-US" className={term}>{lesson.question}</p>
        {completed.speaker ? <TaskComplete /> : (
          <ChoiceTask prompt={lesson.speakerPrompt} options={lesson.speakers} correctIndex={1} hint={lesson.speakerHint}
            finish={() => finish('speaker')} language="tr" />
        )}
      </section>
      {completed.speaker && (
        <section className={panel}>
          <p lang="en-US" className={term}>{lesson.answer}</p>
          {completed.question ? <TaskComplete /> : (
            <ChoiceTask prompt={lesson.questionPrompt} options={lesson.questionOptions} correctIndex={1}
              hint={lesson.questionHint} finish={() => finish('question')} />
          )}
        </section>
      )}
    </div>
  );
}

export function LearnStageTwo({ completed, finish, listen }: ActivityProps) {
  const lesson = content.learn;
  const [questionSelected, setQuestionSelected] = useState(false);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        {lesson.groups.map((group) => (
          <section key={group.title} className={panel}>
            <h4 className={term}>{group.title}</h4>
            <p className="text-sm text-[var(--campus-ink-muted)]">{group.description}</p>
            {group.phrases.map((phrase) => (
              <div key={phrase} className="flex flex-wrap items-center gap-2">
                <span lang="en-US" className={term + ' flex-1'}>{phrase}</span>
                <ListenButton text={phrase} listen={() => listen([phrase])} />
              </div>
            ))}
          </section>
        ))}
      </div>
      <section className={panel}>
        <p className={term}>{lesson.matchPrompt}</p>
        {completed.match ? <TaskComplete /> : (
          <>
            <button type="button" className={stageTwoButton} lang="en-US" aria-pressed={questionSelected}
              onClick={() => setQuestionSelected(true)}>{lesson.question}</button>
            {questionSelected && (
              <ChoiceTask prompt={lesson.groups[1].title} options={lesson.answerOptions} correctIndex={1}
                hint={lesson.matchHint} finish={() => finish('match')} />
            )}
          </>
        )}
      </section>
      {completed.match && (
        <section className={panel}>
          <div className="flex flex-wrap items-center gap-2">
            <span lang="en-US" className={term}>{lesson.sceneText}</span>
            <ListenButton text={lesson.sceneText} listen={() => listen([lesson.sceneText])} />
          </div>
          {completed.scene ? <TaskComplete /> : (
            <ChoiceTask prompt={lesson.scenePrompt} options={lesson.scenes} correctIndex={1}
              hint={lesson.sceneHint} finish={() => finish('scene')} language="tr" />
          )}
        </section>
      )}
    </div>
  );
}

function OrderTask({
  title, items, mixed, hint, guided, finish, listen, sentence,
}: {
  title: string;
  items: readonly string[];
  mixed: readonly number[];
  hint: string;
  guided?: boolean;
  finish: () => void;
  listen: StageTwoListen;
  sentence?: boolean;
}) {
  const lesson = content.produce;
  const [order, setOrder] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const revealed = attempts >= 2;
  const orderedItems = order.map((index) => items[index]);
  const spokenOrder = sentence ? [orderedItems.join(' ')] : orderedItems;
  return (
    <section className={panel}>
      <h4 className={term}>{title}</h4>
      <p className="text-sm text-[var(--campus-ink-muted)]">{lesson.reordering}</p>
      {(guided || revealed) && (
        <div className={'rounded-lg border border-[var(--campus-border)] p-2 text-sm ' +
          (revealed ? 'bg-[var(--seljuk-teal-soft)] text-[var(--seljuk-navy)]' : 'text-[var(--campus-ink-muted)]')}>
          <p className="font-semibold">{revealed ? lesson.correctOrder : lesson.sample}</p>
          <ol lang="en-US" className="list-decimal pl-6">{items.map((item) => <li key={item}>{item}</li>)}</ol>
        </div>
      )}
      <div className="flex min-h-[48px] flex-wrap gap-2 rounded-lg border border-dashed border-[var(--campus-border)] p-1.5">
        {order.map((index, slot) => (
          <button type="button" key={index} lang="en-US" className={stageTwoButton}
            onClick={() => setOrder((previous) => previous.filter((item) => item !== index))}>
            {slot + 1}. {items[index]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {mixed.filter((index) => !order.includes(index)).map((index) => (
          <button type="button" key={index} lang="en-US" className={stageTwoButton}
            onClick={() => setOrder((previous) => [...previous, index])}>{items[index]}</button>
        ))}
      </div>
      {attempts > 0 && (
        <p role="status" className="text-sm text-[var(--campus-ink)]">
          {revealed ? lesson.orderReveal : `${content.common.tryAgain} ${hint}`}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {order.length === items.length && (
          <ListenButton text={spokenOrder.join(' ')} listen={() => listen(spokenOrder)} iconOnly />
        )}
        {revealed && (
          <button type="button" className={stageTwoButton} onClick={() => setOrder(items.map((_, index) => index))}>
            {content.common.orderHelp}
          </button>
        )}
        <button type="button" className={stageTwoButton} disabled={order.length !== items.length}
          onClick={() => {
            if (order.every((index, position) => index === position)) finish();
            else setAttempts((count) => count + 1);
          }}>
          {content.common.check}
        </button>
      </div>
    </section>
  );
}

export function ProduceStageTwo({ completed, finish, listen }: ActivityProps) {
  const lesson = content.produce;
  if (!completed.sentence) {
    return <OrderTask title={lesson.sentenceTitle} items={lesson.sentence.split(' ')} mixed={lesson.mixedSentence}
      hint={lesson.sentenceHint} finish={() => finish('sentence')} listen={listen} sentence />;
  }
  if (!completed.guidedDialogue) {
    return <OrderTask key="guided" title={lesson.guidedTitle} items={lesson.guided} mixed={lesson.mixedGuided}
      hint={lesson.orderHint} guided finish={() => finish('guidedDialogue')} listen={listen} />;
  }
  if (!completed.independentDialogue) {
    return <OrderTask key="independent" title={lesson.independentTitle} items={lesson.independent}
      mixed={lesson.mixedIndependent} hint={lesson.orderHint} finish={() => finish('independentDialogue')} listen={listen} />;
  }
  return <TaskComplete />;
}

function ConversationLine({
  name, characterId, text, listen, current, personalGreeting,
}: {
  name: string;
  characterId?: StudentCharacterId;
  text: string;
  listen: StageTwoListen;
  current?: boolean;
  personalGreeting?: boolean;
}) {
  return (
    <div aria-current={current ? 'step' : undefined}
      className={'flex flex-wrap items-center gap-2 rounded-lg border p-2 ' +
        (current ? 'border-[var(--seljuk-teal)] bg-[var(--seljuk-teal-soft)]' : 'border-[var(--campus-border)] bg-[var(--campus-surface)]')}>
      <Person name={name} characterId={characterId} />
      <span lang="en-US" className={term + ' flex-1'}>{text}</span>
      <ListenButton text={text} listen={() => listen([text], undefined, personalGreeting)} />
    </div>
  );
}

export function ShareStageTwo({
  completed, finish, listen, profileName, characterId,
}: ActivityProps & { profileName?: string; characterId?: StudentCharacterId }) {
  const lesson = content.share;
  const [fallbackName, setFallbackName] = useState('');
  const name = profileName?.trim() || getStudentCharacter(characterId)?.label || fallbackName;
  if (isGrade3StageTwoTableComplete('paylas', completed)) {
    return (
      <section className={panel + ' text-center'} aria-label={lesson.badgeText}>
        <Check className="mx-auto h-8 w-8 text-[var(--seljuk-teal)]" aria-hidden="true" />
        <h4 lang="en-US" className="text-lg font-bold text-[var(--seljuk-navy)]">{lesson.badge}</h4>
        <p>{lesson.badgeText}</p>
      </section>
    );
  }
  if (!name) {
    return (
      <fieldset className={panel}>
        <legend className={term}>{lesson.chooseName}</legend>
        <div className="flex flex-wrap gap-2">
          {lesson.names.map((option) => (
            <button type="button" key={option} className={stageTwoButton} onClick={() => setFallbackName(option)}>
              {option}
            </button>
          ))}
        </div>
      </fieldset>
    );
  }

  const secondRound = completed.eceReply === true;
  const round = lesson.rounds[secondRound ? 1 : 0];
  const sampleCharacter = secondRound ? 'deniz' : 'ece';
  const introductionTask = secondRound ? 'canIntroduction' : 'eceIntroduction';
  const replyTask = secondRound ? 'canReply' : 'eceReply';
  const introduced = completed[introductionTask] === true;
  const introduction = lesson.introduce(name);
  const partnerReply = lesson.partnerReply(name);
  const extra = secondRound ? [lesson.extraDistractor] : [];

  return (
    <section className={panel}>
      <h4 className={term}>{round.title}</h4>
      <ConversationLine name={round.speaker} characterId={sampleCharacter} text={lesson.greeting}
        listen={listen} current={!introduced} />
      {introduced ? (
        <>
          <ConversationLine name={lesson.participant} characterId={characterId} text={introduction} listen={listen} />
          <ConversationLine name={round.speaker} characterId={sampleCharacter} text={partnerReply}
            listen={listen} current personalGreeting />
          <ChoiceTask key={replyTask} prompt={lesson.replyPrompt}
            options={[lesson.replyDistractors[0], lesson.reply, lesson.replyDistractors[1], ...extra]}
            correctIndex={1} hint={lesson.replyHint} hintOnRequest={secondRound} listen={listen}
            finish={() => finish(replyTask)} />
        </>
      ) : (
        <>
          <Person name={lesson.participant} characterId={characterId} />
          {!secondRound && <p lang="en-US" className={term}>{lesson.frame}</p>}
          <ChoiceTask key={introductionTask} prompt={lesson.introductionPrompt}
            options={[lesson.introduceDistractors[0], introduction, lesson.introduceDistractors[1], ...extra]}
            correctIndex={1} hint={lesson.introductionHint} hintOnRequest={secondRound} listen={listen}
            finish={() => finish(introductionTask)} />
        </>
      )}
    </section>
  );
}
