import { useEffect, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { GRADE_3_STAGE_4 as lesson, sultanhaniSentence } from '@/src/data/grade3Stage4Content';
import { SHOW_SULTANHANI_ILLUSTRATION_NOTE, SULTANHANI_IMAGES, SULTANHANI_VIEWS } from '@/src/data/sultanhaniStageFourAssets';
import { renderSultanhaniCard, SULTANHANI_CARD_HEIGHT, SULTANHANI_CARD_WIDTH } from '@/src/utils/sultanhaniCard';
import { stageFourButton, stageFourPanel, type StageFourActivityProps } from './Grade3StageFourActivities';

export function ShareStageFour({ card, finish }: StageFourActivityProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const objectUrl = useRef<string | null>(null);
  const mounted = useRef(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fallback, setFallback] = useState('');
  const description = card ? [lesson.title, lesson.place, ...card.labels.map(({ wordId }) => wordId),
    ...card.sentenceIds.map((id) => sultanhaniSentence(id).text)].join(' · ') : lesson.title;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = null;
    };
  }, []);

  useEffect(() => {
    if (!card) return;
    const view = SULTANHANI_VIEWS.find(({ id }) => id === card.viewId);
    if (!view) return;
    const image = new Image();
    let canceled = false;
    function showError() { if (!canceled) setError(true); }
    image.onerror = showError;
    image.onload = () => {
      void (async () => {
        await document.fonts?.ready;
        if (canceled) return;
        const context = canvas.current?.getContext('2d');
        if (!context || !renderSultanhaniCard(context, card, image)) {
          showError();
          return;
        }
        setReady(true);
      })().catch(showError);
    };
    image.src = SULTANHANI_IMAGES[view.image].url;
    return () => {
      canceled = true;
      image.onload = null;
      image.onerror = null;
    };
  }, [card]);

  if (!card) return <p role="status" className={stageFourPanel}>{lesson.share.empty}</p>;

  const download = () => {
    if (!canvas.current || saving) return;
    setSaving(true);
    setError(false);
    try {
      canvas.current.toBlob((blob) => {
        if (!mounted.current) return;
        setSaving(false);
        if (!blob) { setError(true); return; }
        try {
          if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
          const url = URL.createObjectURL(blob);
          objectUrl.current = url;
          const link = document.createElement('a');
          const ios = /iP(?:ad|hone|od)/.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
          if (ios || !('download' in link)) {
            setFallback(url);
            return;
          }
          link.href = url;
          link.download = lesson.share.filename;
          document.body.append(link);
          try { link.click(); } finally { link.remove(); }
          finish();
        } catch {
          setError(true);
        }
      }, 'image/png');
    } catch {
      setSaving(false);
      setError(true);
    }
  };

  return (
    <section className={stageFourPanel}>
      {SHOW_SULTANHANI_ILLUSTRATION_NOTE && <p className="text-sm">{lesson.illustrationNote}</p>}
      <canvas ref={canvas} width={SULTANHANI_CARD_WIDTH} height={SULTANHANI_CARD_HEIGHT}
        role="img" aria-label={description} className={ready ? 'h-auto w-full rounded-lg border' : 'hidden'} />
      {!ready && error && (
        <div className="grid aspect-[3/2] place-content-center gap-2 rounded-xl bg-stone-200 p-4 text-center">
          <strong>{lesson.placeholder}</strong>
          <p>{description}</p>
        </div>
      )}
      {error && <p role="status">{lesson.share.saveError}</p>}
      <button type="button" className={stageFourButton} disabled={!ready || saving} onClick={download}>
        <Download className="h-4 w-4" aria-hidden="true" /> {lesson.share.download}
      </button>
      {fallback && (
        <figure className="space-y-2">
          <img src={fallback} alt={description} className="h-auto w-full rounded-lg" onLoad={() => finish()} onError={() => setError(true)} />
          <figcaption>{lesson.share.touchSave}</figcaption>
        </figure>
      )}
    </section>
  );
}
