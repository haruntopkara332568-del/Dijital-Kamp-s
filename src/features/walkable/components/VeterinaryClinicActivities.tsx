import { useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Droplet, Eye, Footprints, PawPrint, Volume2 } from 'lucide-react';
import { VET_BODY_EXAMPLES, VET_CARE_ACTIONS, VET_EVIDENCE, VET_OBSERVATION, type VetActivityId } from '@/src/data/veterinaryClinicContent';
import type { SupportedGrade } from '@/src/types/campus';
import { BONCUK_ATLAS_URL } from '../engine/veterinaryClinicSceneRenderer';

const choiceClass = 'min-h-[44px] w-full rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-left text-sm font-semibold hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-teal-800';
const nextClass = 'min-h-[44px] rounded-lg bg-teal-800 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800 disabled:opacity-55';

function Next({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <div className="flex justify-end pt-1">
      <button type="button" className={nextClass} onClick={onClick} disabled={disabled}>{children}</button>
    </div>
  );
}

function Feedback({ text }: { text: string }) {
  return text ? <p role="status" className="rounded-md bg-amber-50 px-2 py-1.5 text-sm font-semibold text-amber-950">{text}</p> : null;
}

const clueIcons = [PawPrint, Eye, Footprints];

function Observation({ grade, onDone }: { grade: SupportedGrade; onDone: () => void }) {
  const [selected, setSelected] = useState<number[]>([]);
  const [hint, setHint] = useState('');
  const observation = VET_OBSERVATION[grade];
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-bold">{observation.prompt}</legend>
      {observation.clues.map((clue, index) => {
        const Icon = grade === 2 ? clueIcons[index] : null;
        const checked = selected.includes(index);
        return (
          <label key={clue} className="flex min-h-[44px] items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-sm font-semibold">
            <input
              type="checkbox"
              className="size-4 accent-teal-800"
              checked={checked}
              onChange={() => {
                setHint('');
                setSelected((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index]);
              }}
            />
            {Icon && <Icon aria-hidden="true" className="size-5 shrink-0 text-teal-800" />}
            {clue}
          </label>
        );
      })}
      <Feedback text={hint} />
      <Next disabled={!selected.length} onClick={() => {
        if (selected.length === observation.correct.length && observation.correct.every((item) => selected.includes(item))) onDone();
        else setHint('Boncuk’u masada gördüğün hâliyle düşün. Yalnız gördüğün ipuçlarını seç.');
      }}>Gözlemlerimi Onayla</Next>
    </fieldset>
  );
}

const exampleMotion = {
  wary: { rotate: [0, -4, 0], x: [0, -3, 0] },
  calm: { scaleY: [1, 1.035, 1] },
  retreat: { x: [1, -10, 1], scale: [1, 0.95, 1] },
};

function BodyLanguage({ onDone }: { onDone: () => void }) {
  const [hint, setHint] = useState('');
  const reduced = useReducedMotion();
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-bold">Hangi köpek kendini rahat hissediyor?</legend>
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {VET_BODY_EXAMPLES.map(({ pose, label }, index) => (
          <button
            key={pose}
            type="button"
            className="min-w-0 rounded-lg border border-teal-200 bg-white px-1.5 py-2 text-xs font-semibold shadow-sm hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-teal-800"
            onClick={() => {
              if (pose === 'calm') onDone();
              else setHint('Üç köpeğin patilerine, kuyruğuna ve duruşuna birlikte bak.');
            }}
          >
            <motion.span
              aria-hidden="true"
              className="mx-auto mb-1 block aspect-square w-full max-w-24 bg-no-repeat"
              style={{ backgroundImage: 'url(' + BONCUK_ATLAS_URL + ')', backgroundSize: '300% 200%', backgroundPosition: (pose === 'wary' ? '50%' : pose === 'calm' ? '0%' : '100%') + ' 0%' }}
              animate={reduced ? undefined : exampleMotion[pose]}
              transition={{ duration: pose === 'calm' ? 2.2 : 1.45, repeat: Infinity, repeatDelay: 0.7, ease: 'easeInOut' }}
            />
            <span className="block font-bold">{index + 1}. Görsel</span>
            <span className="block leading-tight">{label}</span>
          </button>
        ))}
      </div>
      <Feedback text={hint} />
    </fieldset>
  );
}

const evidenceIcons = { paw: PawPrint, water: Droplet, bed: Eye };

function Evidence({ grade, onDone }: { grade: SupportedGrade; onDone: () => void }) {
  const [noted, setNoted] = useState<number[]>([]);
  const [sources, setSources] = useState<Partial<Record<number, 'father' | 'seen'>>>({});
  const [hint, setHint] = useState('');
  const cards = grade === 2 ? VET_EVIDENCE.slice(0, 2) : VET_EVIDENCE;

  if (grade === 4) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-bold">Her gözlemin kaynağını seç.</p>
        {cards.map((card, index) => (
          <label key={card.text} className="grid gap-1 rounded-lg bg-teal-50 px-2.5 py-1.5 text-sm font-semibold sm:grid-cols-[1fr_auto] sm:items-center">
            {card.text}
            <select
              className="min-h-[44px] rounded-md border border-teal-300 bg-white px-2"
              value={sources[index] ?? ''}
              onChange={(event) => {
                const value = event.currentTarget.value;
                setSources((current) => ({ ...current, [index]: value === 'father' || value === 'seen' ? value : undefined }));
                setHint('');
              }}
            >
              <option value="">Kaynağı seç</option>
              <option value="father">Babam anlattı</option>
              <option value="seen">Klinikte gördüm</option>
            </select>
          </label>
        ))}
        <Feedback text={hint} />
        <Next disabled={!cards.every((_, index) => sources[index])} onClick={() => {
          if (cards.every((card, index) => sources[index] === card.source)) onDone();
          else setHint('Babanın evde gördüğü iki şeyi, klinikte senin gördüğün şeyden ayır.');
        }}>Kartımı Tamamla</Next>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-bold">Babanın söylediği iki bilgiyi kartına ekle.</p>
      <div className="grid gap-1.5">
        {cards.map((card, index) => {
          const Icon = evidenceIcons[card.icon];
          return noted.includes(index) ? null : (
            <button key={card.text} type="button" className={choiceClass + ' flex items-center gap-2'} onClick={() => {
              if (card.source !== 'father') {
                setHint('Bu ipucunu sen klinikte gördün. Babanın evde anlattıklarını seç.');
                return;
              }
              setHint('');
              setNoted((current) => current.includes(index) ? current : [...current, index]);
            }}>
              {grade === 2 && <Icon className="size-5 shrink-0 text-teal-800" aria-hidden="true" />}
              {card.text}
            </button>
          );
        })}
      </div>
      <div className="rounded-lg border border-dashed border-teal-400 p-2.5 text-sm">
        <p className="font-bold">Gözlem kartım</p>
        {noted.length ? (
          <ul className="mt-1 list-inside list-disc" aria-live="polite">{noted.map((index) => <li key={index}>{VET_EVIDENCE[index].text}</li>)}</ul>
        ) : <p className="text-teal-900">Henüz bilgi eklemedin.</p>}
      </div>
      <Feedback text={hint} />
      <Next disabled={noted.length !== 2} onClick={onDone}>Kartımı Tamamla</Next>
    </div>
  );
}

function Care({ count, dogResting, onPrepare, onDone }: { count: number; dogResting: boolean; onPrepare: (item: number) => void; onDone: () => void }) {
  const [hint, setHint] = useState('');
  const action = VET_CARE_ACTIONS[count];
  const Icon = action?.icon === 'water' ? Droplet : action?.icon === 'sound' ? Volume2 : PawPrint;
  return (
    <div className="space-y-2">
      <p className="text-sm font-bold">Bakım köşesi · {count}/{VET_CARE_ACTIONS.length}</p>
      {count > 0 && <p role="status" className="rounded-md bg-teal-50 px-2 py-1.5 text-sm font-semibold">{VET_CARE_ACTIONS[count - 1]?.placed}</p>}
      {action ? (
        <fieldset className="space-y-1.5">
          <legend className="text-sm font-semibold">{action.prompt}</legend>
          {action.choices.map((label, index) => (
            <button type="button" key={label} className={choiceClass + ' flex items-center gap-2'} onClick={() => {
              if (index === action.answer) {
                setHint('');
                onPrepare(count);
              } else setHint(action.hint);
            }}>
              <Icon className="size-4 shrink-0" aria-hidden="true" /> {label}
            </button>
          ))}
          <Feedback text={hint} />
        </fieldset>
      ) : <Next onClick={onDone} disabled={!dogResting}>{dogResting ? 'Devam Et' : 'Boncuk mindere gidiyor…'}</Next>}
    </div>
  );
}

export function VeterinaryClinicActivities({ activity, grade, careCount, dogResting, onPrepareCare, onDone }: {
  activity: VetActivityId;
  grade: SupportedGrade;
  careCount: number;
  dogResting: boolean;
  onPrepareCare: (item: number) => void;
  onDone: () => void;
}) {
  if (activity === 'observe') return <Observation grade={grade} onDone={onDone} />;
  if (activity === 'body-language') return <BodyLanguage onDone={onDone} />;
  if (activity === 'evidence') return <Evidence grade={grade} onDone={onDone} />;
  return <Care count={careCount} dogResting={dogResting} onPrepare={onPrepareCare} onDone={onDone} />;
}
