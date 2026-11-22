import { useState } from 'react';
import { Check, Download, Volume2 } from 'lucide-react';
import {
  GRADE_3_STAGE_3 as content,
  isGrade3StageThreeTableComplete,
  type Grade3StageThreeCompleted,
  type Grade3StageThreeTask,
  type StageThreeAge,
  type StageThreeLine,
  type StageThreeSpeaker,
} from '@/src/data/grade3Stage3Content';
import { getStudentCharacter, type StudentCharacterId } from '@/src/data/studentCharacters';

export type StageThreeListen = (lines: readonly string[], onLine?: (index: number) => void) => void;

interface ActivityProps {
  completed: Grade3StageThreeCompleted;
  finish: (task: Grade3StageThreeTask) => void;
  listen: StageThreeListen;
  showText: boolean;
}

export const stageThreeButton = 'min-h-[44px] min-w-[44px] rounded-lg border border-[var(--campus-border)] bg-[var(--campus-surface)] px-3 py-2 font-semibold text-[var(--seljuk-navy)] hover:bg-[var(--stone-cream)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--seljuk-teal)] disabled:opacity-55';
const panel = 'space-y-3 rounded-xl border border-[var(--campus-border)] bg-[var(--stone-cream)]/65 p-3 sm:p-4';
const term = 'font-semibold leading-snug text-[var(--seljuk-navy)]';

function ListenButton({ listen, label }: { listen: () => void; label: string }) {
  return (
    <button type="button" className={stageThreeButton + ' inline-flex items-center justify-center gap-1.5'}
      aria-label={label} onClick={listen}>
      <Volume2 className="h-4 w-4 shrink-0 text-[var(--seljuk-teal)]" aria-hidden="true" />
      {label}
    </button>
  );
}

function HearPrompt({ text, listen, label, showText }: Pick<ActivityProps, 'listen' | 'showText'> & {
  text: string;
  label: string;
}) {
  return (
    <div className="flex flex-wrap items-start gap-3">
      <ListenButton label={label} listen={() => listen([text])} />
      <details open={showText || undefined} className="min-w-0 grow">
        <summary className={stageThreeButton + ' flex cursor-pointer items-center'}>{content.common.read}</summary>
        <p className={term + ' p-2 text-lg'} lang="en-US">{text}</p>
      </details>
    </div>
  );
}

function TaskDone() {
  return (
    <p role="status" className="flex items-center gap-2 font-semibold text-[var(--seljuk-teal)]">
      <Check className="h-5 w-5" aria-hidden="true" /> {content.common.taskDone}
    </p>
  );
}

function Speaker({ speaker, characterId }: { speaker: StageThreeSpeaker; characterId?: StudentCharacterId }) {
  const person = getStudentCharacter(speaker === 'Sen' ? characterId : content.characters[speaker].characterId);
  return (
    <span className="inline-flex items-center gap-2 font-bold text-[var(--seljuk-navy)]">
      {person && (
        <span aria-hidden="true" className="h-10 w-8 shrink-0 rounded-lg bg-[var(--seljuk-teal-soft)] bg-top-left bg-no-repeat"
          style={{ backgroundImage: `url(${person.atlasUrl})`, backgroundSize: '400% 400%' }} />
      )}
      {speaker}
    </span>
  );
}

type Choice<Value> = { value: Value; label: string };

function ChoiceTask<Value extends string | number>({
  prompt, options, correct, hint, finish, language, stones, hintButton, retryText, listen,
}: {
  prompt: string;
  options: readonly Choice<Value>[];
  correct: (value: Value) => boolean;
  hint: string;
  finish: (value: Value) => void;
  language?: 'en-US';
  stones?: boolean;
  hintButton?: string;
  retryText?: string;
  listen?: StageThreeListen;
}) {
  const [attempts, setAttempts] = useState(0);
  const [hintOpen, setHintOpen] = useState(false);
  const reveal = attempts >= 2;

  return (
    <fieldset className="min-w-0 space-y-3">
      <legend className={term}>{prompt}</legend>
      <div className={stones ? 'grid grid-cols-2 gap-2 sm:grid-cols-4' : 'flex flex-wrap gap-2'}>
        {options.map(({ value, label }) => {
          const matches = correct(value);
          return (
            <button key={value} type="button" lang={language}
              disabled={reveal && !matches}
              className={stageThreeButton +
                (stones ? ' min-h-[64px] rounded-2xl border-2 bg-[var(--stone-cream)] text-xl shadow-sm' : '') +
                (reveal && matches ? ' ring-2 ring-[var(--seljuk-teal)]' : '')}
              onClick={() => matches ? finish(value) : setAttempts((previous) => previous + 1)}>
              {label}
            </button>
          );
        })}
      </div>
      {attempts > 0 && (
        <div className="space-y-2">
          <p role="status">
            {reveal ? content.common.reveal : content.common.tryAgain}
            {!reveal && (!hintButton || hintOpen) ? ' ' + hint : ''}
          </p>
          {attempts === 1 && hintButton && !hintOpen && (
            <button type="button" className={stageThreeButton} onClick={() => setHintOpen(true)}>{hintButton}</button>
          )}
          {retryText && listen && (
            <ListenButton label={content.common.replay} listen={() => listen([retryText])} />
          )}
        </div>
      )}
    </fieldset>
  );
}

function textChoices(values: readonly string[]): Choice<string>[] {
  return values.map((value) => ({ value, label: value }));
}

const ageChoices: Choice<StageThreeAge>[] = content.ages.map(({ value }) => ({ value, label: String(value) }));

function ConversationLine({ line, listen, current, characterId }: {
  line: StageThreeLine;
  listen: StageThreeListen;
  current?: boolean;
  characterId?: StudentCharacterId;
}) {
  return (
    <div aria-current={current ? 'step' : undefined} className={
      'flex flex-wrap items-center gap-2 rounded-lg border p-2 ' +
      (current ? 'border-[var(--seljuk-teal)] bg-[var(--seljuk-teal-soft)]' : 'border-[var(--campus-border)] bg-[var(--campus-surface)]')
    }>
      {line.speaker && <Speaker speaker={line.speaker} characterId={characterId} />}
      <span lang="en-US" className={term + ' grow text-lg'}>{line.text}</span>
      <ListenButton label={content.common.listen + ': ' + line.text} listen={() => listen([line.text])} />
    </div>
  );
}

function Conversation({ lines, listen }: { lines: readonly StageThreeLine[]; listen: StageThreeListen }) {
  const [active, setActive] = useState(0);
  return (
    <div className="space-y-2">
      <ListenButton label={content.common.dialogueListen}
        listen={() => listen(lines.map(({ text }) => text), setActive)} />
      {lines.map((line, index) => (
        <ConversationLine key={index} line={line} current={index === active} listen={(texts) => {
          setActive(index);
          listen(texts);
        }} />
      ))}
    </div>
  );
}

export function DiscoverStageThree({ completed, finish, listen, showText }: ActivityProps) {
  const lesson = content.discover;
  const round = lesson.rounds.find(({ task }) => !completed[task]);
  if (round) {
    const recognized = lesson.rounds.filter(({ task }) => completed[task]).length;
    return (
      <section key={round.task} className={panel}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Speaker speaker={lesson.narrator} />
          <p role="status" className="flex items-center gap-2 font-semibold text-[var(--seljuk-teal)]">
            {recognized > 0 && <Check className="h-5 w-5" aria-hidden="true" />}
            {recognized} / {lesson.rounds.length}
          </p>
        </div>
        <HearPrompt text={round.word} label={lesson.numberListen} listen={listen} showText={showText} />
        <ChoiceTask prompt={lesson.listenAndPick} options={ageChoices} stones
          correct={(value) => value === round.value} hint={lesson.numberHint}
          retryText={round.word} listen={listen} finish={() => finish(round.task)} />
      </section>
    );
  }

  return (
    <section className={panel}>
      <Conversation lines={lesson.lines} listen={listen} />
      {completed.understandAge ? <TaskDone /> : (
        <ChoiceTask prompt={lesson.ageQuestion} options={ageChoices} stones
          correct={(value) => value === content.characters.Can.age}
          hint={lesson.ageHint} finish={() => finish('understandAge')} />
      )}
    </section>
  );
}

export function LearnStageThree({ completed, finish, listen, showText }: ActivityProps) {
  const lesson = content.learn;
  const [questionSelected, setQuestionSelected] = useState(false);
  const [age, setAge] = useState<StageThreeAge | null>(null);
  const ageLine = age === null ? lesson.ageFrame : lesson.ageAnswer(age);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        {lesson.cards.map(({ text, explanation }) => (
          <section key={text} className={panel}>
            <p className={term + ' text-lg'} lang="en-US">{text}</p>
            <p>{explanation}</p>
            <ListenButton label={content.common.listen + ': ' + text} listen={() => listen([text])} />
          </section>
        ))}
      </div>
      <section className={panel}>
        <p className={term}>{lesson.pairPrompt}</p>
        {completed.pair ? <TaskDone /> : (
          <>
            <button type="button" lang="en-US" className={stageThreeButton} aria-pressed={questionSelected}
              onClick={() => setQuestionSelected(true)}>{lesson.question}</button>
            {questionSelected && (
              <ChoiceTask prompt={lesson.cards[1].explanation} options={textChoices(lesson.pairOptions)} language="en-US"
                correct={(value) => value === lesson.pairOptions[1]}
                hint={lesson.pairHint} finish={() => finish('pair')} />
            )}
          </>
        )}
      </section>
      {completed.pair && (
        <section className={panel}>
          <p className={term}>{lesson.agePrompt}</p>
          {completed.buildAge ? <TaskDone /> : (
            <>
              <div className="flex flex-wrap gap-2">
                {content.ages.map(({ value }) => (
                  <button key={value} type="button" className={stageThreeButton + ' aria-pressed:ring-2 aria-pressed:ring-[var(--seljuk-teal)]'}
                    aria-pressed={age === value} onClick={() => setAge(value)}>{value}</button>
                ))}
              </div>
              <p lang="en-US" aria-live="polite" className={term + ' text-lg'}>{ageLine}</p>
              <div className="flex flex-wrap gap-2">
                {age !== null && (
                  <ListenButton label={content.common.listen + ': ' + ageLine} listen={() => listen([ageLine])} />
                )}
                <button type="button" className={stageThreeButton} disabled={age === null} onClick={() => finish('buildAge')}>
                  {lesson.confirmAge}
                </button>
              </div>
            </>
          )}
        </section>
      )}
      {completed.buildAge && (
        <section className={panel}>
          <HearPrompt text={lesson.identifyText} label={content.common.listen} listen={listen} showText={showText} />
          {completed.identify ? <TaskDone /> : (
            <ChoiceTask prompt={lesson.identifyPrompt}
              options={lesson.people.map(({ speaker, label }) => ({ value: speaker, label }))}
              correct={(value) => value === content.characters.Can.name}
              hint={lesson.identifyHint} finish={() => finish('identify')} />
          )}
        </section>
      )}
    </div>
  );
}

function OrderTask({ title, cards, mixed, hint, guided, dialogue, finish, listen }: {
  title: string;
  cards: readonly StageThreeLine[];
  mixed: readonly number[];
  hint: string;
  guided?: boolean;
  dialogue?: boolean;
  finish: () => void;
  listen: StageThreeListen;
}) {
  const lesson = content.produce;
  const [order, setOrder] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const reveal = attempts >= 2;
  const complete = order.length === cards.length;
  const label = ({ speaker, text }: StageThreeLine) => speaker ? speaker + ': ' + text : text;
  const texts = order.map((index) => cards[index].text);

  return (
    <section className={panel}>
      <h4 className={term}>{title}</h4>
      <p>{lesson.orderPrompt}</p>
      {(guided || reveal) && (
        <div className={'rounded-lg border border-[var(--campus-border)] p-3 ' +
          (reveal ? 'bg-[var(--seljuk-teal-soft)]' : 'text-[var(--campus-ink-muted)]')}>
          <p className="font-semibold">{reveal ? lesson.orderReveal : lesson.example}</p>
          <ol className="list-decimal pl-5">
            {cards.map((card, index) => <li key={index}>{label(card)}</li>)}
          </ol>
          {dialogue && (
            <ListenButton label={content.common.dialogueListen} listen={() => listen(cards.map(({ text }) => text))} />
          )}
        </div>
      )}
      <div className="flex min-h-[50px] flex-wrap gap-2 rounded-lg border border-dashed border-[var(--campus-border)] p-1.5">
        {order.map((index, slot) => (
          <button key={index} type="button" className={stageThreeButton}
            onClick={() => setOrder((previous) => previous.filter((entry) => entry !== index))}>
            {slot + 1}. {label(cards[index])}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {mixed.filter((index) => !order.includes(index)).map((index) => (
          <button key={index} type="button" className={stageThreeButton}
            onClick={() => setOrder((previous) => [...previous, index])}>{label(cards[index])}</button>
        ))}
      </div>
      {attempts === 1 && <p role="status">{content.common.tryAgain} {hint}</p>}
      <div className="flex flex-wrap gap-2">
        {complete && <ListenButton label={content.common.listen} listen={() => listen(dialogue ? texts : [texts.join(' ')])} />}
        {reveal && (
          <button type="button" className={stageThreeButton} onClick={() => setOrder(cards.map((_, index) => index))}>
            {lesson.applyOrder}
          </button>
        )}
        <button type="button" className={stageThreeButton} disabled={!complete} onClick={() => {
          if (order.every((index, position) => index === position)) finish();
          else setAttempts((count) => count + 1);
        }}>{lesson.check}</button>
      </div>
    </section>
  );
}

function AgeDialogueBuilder({ dialogueAge, saveDialogue, listen }: {
  dialogueAge?: StageThreeAge;
  saveDialogue: (age: StageThreeAge) => void;
  listen: StageThreeListen;
}) {
  const lesson = content.produce;
  const [draftAge, setDraftAge] = useState<StageThreeAge | null>(null);
  const [editing, setEditing] = useState(dialogueAge === undefined);

  if (dialogueAge !== undefined && !editing) {
    return (
      <section className={panel}>
        <h4 className={term}>{lesson.savedDialogue}</h4>
        <Conversation lines={lesson.dialogue(dialogueAge)} listen={listen} />
        <button type="button" className={stageThreeButton} onClick={() => {
          setDraftAge(null);
          setEditing(true);
        }}>{lesson.editDialogue}</button>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <section className={panel}>
        <h4 className={term}>{lesson.independent}</h4>
        <ConversationLine line={{ speaker: content.characters.Can.name, text: lesson.question }} listen={listen} />
        <fieldset className="min-w-0 space-y-2">
          <legend className={term}>{lesson.pickDialogueAge}</legend>
          <div className="flex flex-wrap gap-2">
            {content.ages.map(({ value }) => (
              <button key={value} type="button"
                className={stageThreeButton + ' aria-pressed:ring-2 aria-pressed:ring-[var(--seljuk-teal)]'}
                aria-pressed={value === draftAge} onClick={() => setDraftAge(value)}>{value}</button>
            ))}
          </div>
        </fieldset>
      </section>
      {draftAge !== null && (
        <OrderTask key={draftAge} title={lesson.firstSentence}
          cards={lesson.dialogue(draftAge)[1].text.split(' ').map((text) => ({ text }))}
          mixed={[2, 0, 3, 1]} hint={lesson.sentenceHint} listen={listen} finish={() => {
            saveDialogue(draftAge);
            setEditing(false);
          }} />
      )}
    </div>
  );
}

export function ProduceStageThree({ completed, finish, listen, dialogueAge, saveDialogue }: ActivityProps & {
  dialogueAge?: StageThreeAge;
  saveDialogue: (age: StageThreeAge) => void;
}) {
  const lesson = content.produce;
  if (!completed.orderAnswer) {
    return <OrderTask key="answer" title={lesson.firstSentence} cards={lesson.answer.split(' ').map((text) => ({ text }))}
      mixed={[2, 0, 3, 1]} hint={lesson.sentenceHint} listen={listen} finish={() => finish('orderAnswer')} />;
  }
  if (!completed.orderQuestion) {
    return <OrderTask key="question" title={lesson.secondSentence} cards={lesson.question.split(' ').map((text) => ({ text }))}
      mixed={[2, 3, 1, 0]} hint={lesson.sentenceHint} listen={listen} finish={() => finish('orderQuestion')} />;
  }
  if (!completed.guided) {
    return <OrderTask key="guided" title={lesson.guided} cards={lesson.guidedLines} mixed={[2, 0, 3, 1]}
      hint={lesson.dialogueHint} dialogue guided listen={listen} finish={() => finish('guided')} />;
  }
  return <AgeDialogueBuilder dialogueAge={dialogueAge} saveDialogue={saveDialogue} listen={listen} />;
}

function ShareRound({ completed, finish, listen, characterId, independent }: ActivityProps & {
  characterId?: StudentCharacterId;
  independent: boolean;
}) {
  const lesson = content.share;
  const round = lesson.rounds[independent ? 1 : 0];
  const tasks = round.tasks;
  const [age, setAge] = useState<StageThreeAge | null>(null);
  const answerOptions: Choice<StageThreeAge | 'unrelated'>[] = content.ages.map(({ value }) => ({
    value, label: lesson.ageAnswer(value),
  }));
  if (independent) answerOptions.splice(1, 0, { value: 'unrelated', label: lesson.unrelated });
  const speaker = round.speaker;
  const participant = lesson.participant;
  const hintButton = independent ? lesson.hintButton : undefined;
  const greet = completed[tasks.greet];
  const answered = completed[tasks.age];
  const asked = completed[tasks.ask];

  return (
    <section className={panel}>
      <h4 className={term}>{round.title}</h4>
      <ConversationLine line={{ speaker, text: lesson.greeting }} current={!greet} listen={listen} />
      {!greet ? (
        <>
          <Speaker speaker={participant} characterId={characterId} />
          <ChoiceTask prompt={lesson.greetPrompt} options={textChoices([lesson.question, lesson.greeting])} language="en-US"
            correct={(value) => value === lesson.greeting} hint={lesson.greetHint} hintButton={hintButton}
            finish={() => finish(tasks.greet)} />
        </>
      ) : (
        <>
          <ConversationLine line={{ speaker: participant, text: lesson.greeting }} characterId={characterId} listen={listen} />
          <ConversationLine line={{ speaker, text: lesson.question }} current={!answered} listen={listen} />
          {!answered ? (
            <>
              <Speaker speaker={participant} characterId={characterId} />
              {!independent && <p lang="en-US" className={term}>{lesson.ageFrame}</p>}
              <ChoiceTask key="age" prompt={lesson.agePrompt} options={answerOptions} language="en-US"
                correct={(value) => value !== 'unrelated'} hint={lesson.ageHint} hintButton={hintButton} finish={(value) => {
                  if (value !== 'unrelated') {
                    setAge(value);
                    finish(tasks.age);
                  }
                }} />
            </>
          ) : (
            <>
              {age !== null && (
                <ConversationLine line={{ speaker: participant, text: lesson.ageAnswer(age) }}
                  characterId={characterId} listen={listen} />
              )}
              {!asked ? (
                <>
                  <Speaker speaker={participant} characterId={characterId} />
                  <ChoiceTask key="question" prompt={lesson.askPrompt} language="en-US" hintButton={hintButton}
                    options={textChoices(independent ? [lesson.unrelated, lesson.question, round.answer] : [round.answer, lesson.question])}
                    correct={(value) => value === lesson.question} hint={lesson.askHint} finish={() => finish(tasks.ask)} />
                </>
              ) : (
                <>
                  <ConversationLine line={{ speaker: participant, text: lesson.question }}
                    characterId={characterId} listen={listen} />
                  <ConversationLine line={{ speaker, text: round.answer }} listen={listen} current />
                  <button type="button" className={stageThreeButton} onClick={() => finish(tasks.end)}>{lesson.endRound}</button>
                </>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}

export function ShareStageThree({ dialogueAge, ...props }: ActivityProps & {
  characterId?: StudentCharacterId;
  dialogueAge?: StageThreeAge;
}) {
  const lesson = content.share;
  const lines = dialogueAge === undefined ? undefined : content.produce.dialogue(dialogueAge);
  const completed = isGrade3StageThreeTableComplete('paylas', props.completed);
  const independent = props.completed.eceEnd === true;
  const download = lines?.map(({ speaker, text }) => speaker + ': ' + text).join('\n');

  return (
    <div className="space-y-4">
      {lines && download ? (
        <section className={panel}>
          <h4 className={term}>{lesson.dialogueTitle}</h4>
          <Conversation lines={lines} listen={props.listen} />
          <a href={'data:text/plain;charset=utf-8,' + encodeURIComponent(download)}
            download={lesson.dialogueFilename}
            className={stageThreeButton + ' inline-flex items-center gap-2'}>
            <Download className="h-4 w-4" aria-hidden="true" /> {lesson.downloadDialogue}
          </a>
        </section>
      ) : <p role="status" className={panel}>{lesson.noDialogue}</p>}
      {completed ? (
        <section className={panel + ' text-center'} aria-label={lesson.badgeText}>
          <Check className="mx-auto h-8 w-8 text-[var(--seljuk-teal)]" aria-hidden="true" />
          <h4 lang="en-US" className="text-xl font-bold text-[var(--seljuk-navy)]">{lesson.badge}</h4>
          <p>{lesson.badgeText}</p>
        </section>
      ) : <ShareRound key={independent ? 'can' : 'ece'} {...props} independent={independent} />}
    </div>
  );
}
