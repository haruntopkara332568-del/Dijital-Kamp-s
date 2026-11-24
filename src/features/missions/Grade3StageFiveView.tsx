import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Award, Hand, Heart, Sparkles, UserRound, Volume2 } from 'lucide-react';
import { useOptionalCampus } from '@/src/app/CampusProviders';
import { getStudentCharacter, STUDENT_ATLAS_FRAME, type StudentCharacterId } from '@/src/data/studentCharacters';
import type { StageThreeAge } from '@/src/data/grade3Stage3Content';
import {
  GRADE_3_STAGE_5 as lesson, STAGE_FIVE_AGES, STAGE_FIVE_CAN_ID, STAGE_FIVE_DISCOVER_TASKS,
  STAGE_FIVE_LEARN_TASKS, STAGE_FIVE_PRODUCE_TASKS, STAGE_FIVE_REHEARSALS, STAGE_FIVE_TASKS,
  stageFiveRehearsal, type StageFiveDiscoverItem, type StageFiveSpeaker, type StageFiveTaskId, type StageFiveTurn,
} from '@/src/data/grade3Stage5Content';
import { SULTANHANI_TOURIST_NPC } from '@/src/data/sultanhaniNpc';
import { getEnglishNameSpeech } from '@/src/services/englishNameSpeech';
import { completeStageFiveTask, loadStageFiveProgress } from '@/src/services/grade3Stage5Progress';
import { getSpeechVoices, speakSegments, stopSpeaking } from '@/src/services/speech';
import type { MissionStageId } from '@/src/types/campus';

const button = 'min-h-[44px] rounded-lg border border-[var(--campus-border)] bg-[var(--campus-surface)] px-3 py-2 text-sm font-semibold text-[var(--seljuk-navy)] hover:border-[var(--seljuk-teal)] focus-visible:outline-2 focus-visible:outline-[var(--seljuk-teal)] disabled:opacity-50';
const primary = 'min-h-[44px] rounded-lg bg-[var(--seljuk-teal)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--seljuk-teal-hover)] focus-visible:outline-2 focus-visible:outline-[var(--seljuk-navy)] disabled:opacity-50';
const panel = 'space-y-3 rounded-xl border border-[var(--campus-border)] bg-[var(--stone-cream)] p-3 sm:p-4';
const bubble = 'rounded-xl border border-[var(--campus-border)] bg-[var(--campus-surface)] px-3 py-2 font-semibold text-[var(--seljuk-navy)]';
const muted = 'text-sm text-[var(--campus-ink-muted)]';

type Listen = (lines: readonly string[], speaker?: StageFiveSpeaker) => Promise<void>;
type Finish = (id: StageFiveTaskId) => void;
type ActivityProps = { completed: readonly StageFiveTaskId[]; finish: Finish; listen: Listen; reading: string | null };

const voicePitch: Record<StageFiveSpeaker, number> = { Alex: 0.97, Sen: 1.08, Can: 1.04 };

function ListenButton({ onClick, disabled, children }: {
  onClick: () => void;
  disabled?: boolean;
  children?: ReactNode;
}) {
  return (
    <button type="button" className={button + ' inline-flex items-center gap-2'} onClick={onClick} disabled={disabled}>
      <Volume2 aria-hidden="true" className="size-4 text-[var(--seljuk-teal)]" />
      {children ?? 'Dinle'}
    </button>
  );
}

function Feedback({ children }: { children: ReactNode }) {
  return <p role="status" className="text-sm font-medium text-[var(--seljuk-navy)]">{children}</p>;
}

function DiscoverVisual({ id }: { id: StageFiveDiscoverItem['id'] }) {
  if (id === 'place' || id === 'beautiful') {
    const image = id === 'place' ? lesson.images.exterior : lesson.images.courtyard;
    return <img alt="" src={image.url} className="h-24 w-full rounded-lg object-cover sm:h-28" />;
  }
  const Icon = id === 'welcome' ? Hand : Heart;
  return (
    <span aria-hidden="true" className="flex h-24 w-full items-center justify-center rounded-lg bg-[var(--seljuk-teal-soft)] text-[var(--seljuk-teal)] sm:h-28">
      <Icon className="size-12" />
    </span>
  );
}

function DiscoverStation({ completed, finish, listen, reading }: ActivityProps) {
  const task = STAGE_FIVE_DISCOVER_TASKS.find(({ id }) => !completed.includes(id));
  return (
    <>
      <figure className="mx-auto max-w-lg rounded-xl bg-[var(--seljuk-navy)] p-3 text-center text-white">
        <img src={lesson.images.exterior.url} alt="Sultanhanı Kervansarayı’nın önü ve taç kapısı" className="mx-auto max-h-52 w-full rounded-lg bg-black/15 object-contain" />
        <figcaption className="mt-1 text-sm font-semibold">Sultanhanı Kervansarayı</figcaption>
      </figure>
      <section className={panel} aria-label="Rehberin ifadeleri">
        <ListenButton onClick={() => void listen(lesson.discover.map(({ text }) => text))}>Rehberi sırayla dinle</ListenButton>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {lesson.discover.map((item) => (
            <article key={item.id} className="space-y-2">
              <DiscoverVisual id={item.id} />
              <p className={bubble + (reading === item.text ? ' ring-2 ring-[var(--seljuk-teal)]' : '')} lang="en"> {item.text}</p>
              <p className={muted}>{item.meaning}</p>
              <ListenButton onClick={() => void listen([item.text])}>Tekrar dinle</ListenButton>
              {'withAlex' in item && (
                <div className="space-y-1">
                  <p className={muted}>Alex’i karşıla.</p>
                  <p className={bubble} lang="en">{item.withAlex}</p>
                  <ListenButton onClick={() => void listen([item.withAlex])} />
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
      {task && <DiscoverMatch key={task.id} task={task} finish={finish} listen={listen} />}
    </>
  );
}

function DiscoverMatch({ task, finish, listen }: {
  task: (typeof STAGE_FIVE_DISCOVER_TASKS)[number];
  finish: Finish;
  listen: Listen;
}) {
  const [wrong, setWrong] = useState(false);
  const phrase = lesson.discover.find(({ id }) => id === task.phrase)!;
  return (
    <section className={panel} aria-label="Görseli eşleştir">
      <p className="font-semibold">Cümleyi dinle ve uygun görseli seç.</p>
      <div className="flex flex-wrap items-center gap-2">
        <p className={bubble} lang="en">{phrase.text}</p>
        <ListenButton onClick={() => void listen([phrase.text])} />
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {lesson.discover.map((choice) => (
          <button type="button" key={choice.id} className={button + ' space-y-2 text-center'} onClick={() => {
            if (choice.id === task.phrase) finish(task.id);
            else setWrong(true);
          }}>
            <DiscoverVisual id={choice.id} />
            <span className="block">{choice.label}</span>
          </button>
        ))}
      </div>
      {wrong && <Feedback>Tekrar dene. {task.hint}</Feedback>}
    </section>
  );
}

function LearnStation({ completed, finish, listen, reading }: ActivityProps) {
  const task = STAGE_FIVE_LEARN_TASKS.find(({ id }) => !completed.includes(id));
  const practiceOnYourOwn = task?.id === 'pair-place' || task?.id === 'pair-agree';
  return (
    <>
      {!practiceOnYourOwn && (
        <section className={panel} aria-label="Örnek konuşma">
          <ol className="space-y-3">
            {lesson.learn.map(({ speaker, text, meaning, note }, index) => (
              <li key={text} className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-bold">{index + 1}. {speaker}</p>
                  <p className={bubble + (reading === text ? ' ring-2 ring-[var(--seljuk-teal)]' : '')} lang="en">{text}</p>
                  <p className={muted}>{meaning} {note}</p>
                </div>
                <ListenButton onClick={() => void listen([text], speaker)} />
              </li>
            ))}
          </ol>
        </section>
      )}
      {task && (
        <LearnMatch key={task.id} task={task} finish={finish} listen={listen} independent={practiceOnYourOwn} />
      )}
    </>
  );
}

function LearnMatch({ task, finish, listen, independent }: {
  task: (typeof STAGE_FIVE_LEARN_TASKS)[number];
  finish: Finish;
  listen: Listen;
  independent: boolean;
}) {
  const [wrong, setWrong] = useState(false);
  return (
    <section className={panel} aria-label={independent ? 'Konuşmayı tek başına tamamla' : 'Doğru yanıtı eşleştir'}>
      <p className="font-semibold">{independent ? 'Şimdi iki konuşma çiftini tek başına tamamla.' : 'Alex’in sözüne uygun yanıtı seç.'}</p>
      <div className="flex flex-wrap items-center gap-2">
        <p className={bubble}>Alex <span lang="en" className="block">{task.prompt}</span></p>
        <ListenButton onClick={() => void listen([task.prompt], 'Alex')} />
      </div>
      <div className="flex flex-wrap gap-2">
        {task.choices.map((choice) => (
          <button type="button" key={choice} className={button} lang="en" onClick={() => {
            if (choice === task.answer) finish(task.id);
            else setWrong(true);
          }}>{choice}</button>
        ))}
      </div>
      {wrong && <Feedback>Tekrar dene. {task.hint}</Feedback>}
    </section>
  );
}

function ProduceStation({ completed, finish, listen }: ActivityProps) {
  const task = STAGE_FIVE_PRODUCE_TASKS.find(({ id }) => !completed.includes(id));
  return task ? <BuildSequence key={task.id} task={task} finish={finish} listen={listen} /> : null;
}

function BuildSequence({ task, finish, listen }: {
  task: (typeof STAGE_FIVE_PRODUCE_TASKS)[number];
  finish: Finish;
  listen: Listen;
}) {
  const [selected, setSelected] = useState<number[]>([]);
  const [wrong, setWrong] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const isDialogue = task.id === 'build-dialogue';
  const label = (index: number) => {
    const card = task.cards[index];
    return <>{'speaker' in card && <span className="mr-1" lang="tr">{card.speaker}</span>}<span lang="en">{card.text}</span></>;
  };

  return (
    <section className={panel} aria-label={task.title}>
      <h4 className="font-bold">{task.title}</h4>
      <p className={muted}>Kartlara doğru sırayla dokun. Geri almak için seçtiğin karta tekrar dokun.</p>
      {isDialogue && !wrong && (
        <div className="space-y-2">
          <button type="button" className={button} aria-expanded={showExample} onClick={() => setShowExample(!showExample)}>
            {showExample ? 'Örneği gizle' : 'Örneği göster'}
          </button>
          {showExample && (
            <div className={bubble}>
              <ol className="ml-5 list-decimal">{task.cards.map((card, index) => <li key={card.text}>{label(index)}</li>)}</ol>
              <ListenButton onClick={() => void listen(task.cards.map(({ text }) => text))}>Örneği dinle</ListenButton>
            </div>
          )}
        </div>
      )}
      <div role="group" aria-label="Seçtiğin kartlar" className="flex min-h-14 flex-wrap items-center gap-2 rounded-lg border border-dashed border-[var(--seljuk-teal)] p-2">
        {selected.length === 0 && <p className={muted}>Kartların sırası burada görünecek.</p>}
        {selected.map((index) => (
          <button type="button" key={index} className={button} onClick={() => setSelected(selected.filter((item) => item !== index))}>
            {label(index)}
          </button>
        ))}
      </div>
      <div role="group" aria-label="Karışık kartlar" className="flex flex-wrap gap-2">
        {task.order.map((index) => (
          <button type="button" key={index} className={button} disabled={selected.includes(index)} onClick={() => setSelected([...selected, index])}>
            {label(index)}
          </button>
        ))}
      </div>
      {wrong && <Feedback>Tekrar dene. {task.hint}</Feedback>}
      <div className="flex flex-wrap gap-2">
        <button type="button" className={primary} disabled={selected.length !== task.cards.length} onClick={() => {
          if (selected.every((index, position) => index === position)) finish(task.id);
          else {
            setWrong(true);
            setShowExample(false);
          }
        }}>Sırayı kontrol et</button>
        <button type="button" className={button} disabled={selected.length === 0} onClick={() => setSelected([])}>Kartları geri al</button>
      </div>
    </section>
  );
}

function SpeakerCard({ name, atlas, line, visible = true, onAvailability }: {
  name: string;
  atlas?: string;
  line?: string;
  visible?: boolean;
  onAvailability?: (loaded: boolean) => void;
}) {
  return (
    <div className={visible ? 'flex min-w-0 flex-col items-center gap-1 rounded-lg bg-[var(--campus-surface)] p-2 text-center' : 'hidden'}>
      <div className="relative w-14 overflow-hidden sm:w-20" style={{ aspectRatio: STUDENT_ATLAS_FRAME.width / STUDENT_ATLAS_FRAME.height }}>
        {atlas ? (
          <img
            src={atlas}
            alt=""
            className="absolute inset-0 h-[400%] w-[400%] max-w-none"
            onLoad={onAvailability ? () => onAvailability(true) : undefined}
            onError={onAvailability ? () => onAvailability(false) : undefined}
          />
        ) : <UserRound className="m-auto size-10 text-[var(--seljuk-teal)]" aria-hidden="true" />}
      </div>
      <p className="max-w-full break-words text-sm font-bold">{name}</p>
      {line && <p role="status" className={bubble + ' w-full break-words'} lang="en">{line}</p>}
    </div>
  );
}

function Rehearsal({ guided, profileAlias, characterId, listen, finish }: {
  guided: boolean;
  profileAlias: string;
  characterId?: StudentCharacterId;
  listen: Listen;
  finish: Finish;
}) {
  const [age, setAge] = useState<StageThreeAge>(9);
  const [canReady, setCanReady] = useState(false);
  const [plan, setPlan] = useState<StageFiveTurn[] | null>(null);
  const [cursor, setCursor] = useState(0);
  const [shown, setShown] = useState(false);
  const [busy, setBusy] = useState(false);
  const [wrong, setWrong] = useState(false);
  const turn = plan?.[cursor];
  const line = shown ? turn : plan?.[cursor - 1];
  const castCan = characterId !== STAGE_FIVE_CAN_ID && (!plan || plan.some(({ speaker }) => speaker === 'Can'));

  const present = async (next: StageFiveTurn) => {
    setShown(true);
    setWrong(false);
    setBusy(true);
    await listen([next.text], next.speaker);
    setBusy(false);
  };

  const advance = () => {
    if (!plan || busy) return;
    const next = plan[cursor + 1];
    if (!next) {
      finish(guided ? STAGE_FIVE_REHEARSALS[0] : STAGE_FIVE_REHEARSALS[1]);
      return;
    }
    setCursor(cursor + 1);
    setShown(false);
    if (!next.choices) void present(next);
  };

  return (
    <section className={panel} aria-label="Alex ile karşılıklı konuşma">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(88px,1fr))] gap-2">
        <SpeakerCard name={'Sen · ' + profileAlias} atlas={getStudentCharacter(characterId)?.atlasUrl} line={line?.speaker === 'Sen' ? line.text : undefined} />
        <SpeakerCard name="Alex" atlas={SULTANHANI_TOURIST_NPC.atlasUrl} line={line?.speaker === 'Alex' ? line.text : undefined} />
        {castCan && (
          <SpeakerCard name="Can" atlas={getStudentCharacter(STAGE_FIVE_CAN_ID)?.atlasUrl} line={line?.speaker === 'Can' ? line.text : undefined} visible={canReady} onAvailability={setCanReady} />
        )}
      </div>
      {!turn ? (
        <>
          <p className="font-semibold">{guided ? 'İlk prova' : 'İkinci prova'}</p>
          <fieldset className="space-y-2">
            <legend className={muted}>Bu provada söyleyeceğin örnek yaşı seç.</legend>
            <div className="flex flex-wrap gap-2">
              {STAGE_FIVE_AGES.map(({ value }) => (
                <button type="button" className={button + ' aria-pressed:bg-[var(--seljuk-teal-soft)]'} key={value} aria-pressed={age === value} onClick={() => setAge(value)}>{value}</button>
              ))}
            </div>
          </fieldset>
          <button type="button" className={primary} onClick={() => setPlan(stageFiveRehearsal(age, castCan && canReady))}>Provayı başlat</button>
        </>
      ) : shown ? (
        <div className="flex flex-wrap gap-2">
          <ListenButton disabled={busy} onClick={() => void present(turn)}>Tekrar dinle</ListenButton>
          <button type="button" className={primary} disabled={busy} onClick={advance}>
            {busy ? 'Dinleniyor…' : cursor + 1 === plan?.length ? 'Provayı tamamla' : 'Devam et'}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="font-semibold">Sıra sende. Uygun cümleyi seç.</p>
          {guided && turn.hint && <p className={muted}>{turn.hint}</p>}
          {turn.text.includes('years old.') && <p className={muted}>Örnek yaşın {age}.</p>}
          <div className="flex flex-wrap gap-2">
            {turn.choices?.map((choice) => (
              <button type="button" key={choice} lang="en" className={button} onClick={() => {
                if (choice === turn.text) void present(turn);
                else setWrong(true);
              }}>{choice}</button>
            ))}
          </div>
          {wrong && <Feedback>Tekrar dene. {turn.hint}</Feedback>}
        </div>
      )}
    </section>
  );
}

function ShareStation({ completed, finish, listen, profileAlias, characterId }: ActivityProps & {
  profileAlias: string;
  characterId?: StudentCharacterId;
}) {
  if (STAGE_FIVE_REHEARSALS.every((rehearsal) => completed.includes(rehearsal))) {
    return (
      <div className={panel + ' flex flex-col items-center text-center'} role="status">
        <Award aria-hidden="true" className="size-10 text-[var(--seljuk-teal)]" />
        <p className="font-bold">{lesson.titles.paylas}</p>
        <p className={muted}>İki provayı da tamamladın, {profileAlias}.</p>
      </div>
    );
  }
  const guided = !completed.includes(STAGE_FIVE_REHEARSALS[0]);
  return <Rehearsal key={guided ? 'guided' : 'independent'} guided={guided} profileAlias={profileAlias} characterId={characterId} listen={listen} finish={finish} />;
}

export function Grade3StageFiveView({ entryTable }: { entryTable: MissionStageId }) {
  const campus = useOptionalCampus();
  const profile = campus?.activeProfile;
  const speechEnabled = campus?.state.speechEnabled ?? true;
  const [progress, setProgress] = useState<ReturnType<typeof loadStageFiveProgress>>(() =>
    profile ? loadStageFiveProgress(profile.id) : { completed: [], persistent: false },
  );
  const [notice, setNotice] = useState('');
  const [reading, setReading] = useState<string | null>(null);
  const request = useRef<AbortController | null>(null);

  const cancelSpeech = useCallback(() => {
    if (!request.current) return;
    request.current.abort();
    request.current = null;
    stopSpeaking();
  }, []);

  useEffect(() => cancelSpeech, [cancelSpeech]);
  useEffect(() => {
    if (!speechEnabled) cancelSpeech();
  }, [cancelSpeech, speechEnabled]);

  const listen: Listen = async (lines, speaker) => {
    cancelSpeech();
    setReading(null);
    if (!speechEnabled) {
      setNotice('Ses kapalı. Ekrandaki metinden devam edebilirsin.');
      return;
    }

    setNotice('');
    const controller = new AbortController();
    request.current = controller;
    const { signal } = controller;
    const current = () => request.current === controller && !signal.aborted;
    const noAudio = 'Ses kullanılamıyor. Ekrandaki metinden devam edebilirsin.';
    try {
      const voices = await getSpeechVoices(signal);
      if (!current()) return;
      if (!voices?.['en-US']) {
        setNotice(noAudio);
        return;
      }

      const { spoken } = await speakSegments(lines.map((line) => getEnglishNameSpeech(line)), {
        onSegmentStart: (index) => { if (current()) setReading(lines[index]); },
        queued: {
          signal,
          voices,
          rates: { 'en-US': 0.85, 'tr-TR': 0.9 },
          pitch: speaker ? voicePitch[speaker] : 1.02,
          onTimeoutFallback: () => {
            stopSpeaking();
            if (current()) setNotice(noAudio);
          },
        },
      });
      if (current() && !spoken) setNotice(noAudio);
    } catch {
      if (current()) setNotice(noAudio);
    } finally {
      if (current()) {
        request.current = null;
        stopSpeaking();
        setReading(null);
      }
    }
  };

  if (!profile) return <p className={muted + ' p-4'}>Öğrenci profilini seçerek devam edebilirsin.</p>;

  const finish: Finish = (task) => {
    cancelSpeech();
    setReading(null);
    setProgress(completeStageFiveTask(profile.id, progress.completed, task));
  };
  const tableTasks = STAGE_FIVE_TASKS[entryTable];
  const done = tableTasks.filter((task) => progress.completed.includes(task)).length;
  const activities: ActivityProps = { completed: progress.completed, finish, listen, reading };

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-3 text-[var(--campus-ink)] sm:p-5">
      <h3 className="text-xl font-bold text-[var(--seljuk-navy)]">{lesson.titles[entryTable]}</h3>
      <p role="status" className={muted}>{done === tableTasks.length ? 'Bu masayı tamamladın.' : done + ' / ' + tableTasks.length + ' adım tamamlandı'}</p>
      {!progress.persistent && <p className={muted}>İlerlemen bu oturumda saklanıyor.</p>}
      {notice && <Feedback>{notice}</Feedback>}
      {entryTable === 'kesfet' && <DiscoverStation {...activities} />}
      {entryTable === 'ogren' && <LearnStation {...activities} />}
      {entryTable === 'uret' && <ProduceStation {...activities} />}
      {entryTable === 'paylas' && <ShareStation {...activities} profileAlias={profile.alias} characterId={profile.characterId} />}
      {done === tableTasks.length && entryTable === 'uret' && (
        <p className="flex items-center gap-2 font-semibold text-[var(--seljuk-navy)]"><Sparkles aria-hidden="true" className="size-4" />Konuşmanı hazırladın!</p>
      )}
    </div>
  );
}
