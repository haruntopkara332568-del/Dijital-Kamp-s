import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { FullscreenButton } from '@/src/components/FullscreenButton';
import { STUDENT_ATLAS_FRAME, STUDENT_CHARACTERS, type StudentCharacterId } from '@/src/data/studentCharacters';

export function CharacterSelectionView({ onConfirm }: { onConfirm: (characterId: StudentCharacterId) => void }) {
  const [selectedId, setSelectedId] = useState<StudentCharacterId | null>(null);

  return (
    <main className="min-h-dvh bg-[var(--campus-canvas)] px-4 py-5 sm:py-10">
      <form
        className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-[var(--campus-border)] bg-[var(--campus-surface)] shadow-sm"
        onSubmit={(event) => {
          event.preventDefault();
          if (selectedId) onConfirm(selectedId);
        }}
      >
        <div aria-hidden="true" className="h-1 bg-gradient-to-r from-[var(--seljuk-navy)] via-[var(--seljuk-teal)] to-[var(--terracotta)]" />
        <div className="space-y-5 p-4 sm:p-6">
          <header className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-[var(--seljuk-navy)] sm:text-2xl">Karakterini Seç</h1>
              <p className="mt-1 text-sm text-[var(--campus-ink-muted)]">Avluda hangi karakterle gezmek istersin?</p>
            </div>
            <FullscreenButton showText={false} />
          </header>

          <fieldset className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <legend className="sr-only">Yürüyüş karakteri</legend>
            {STUDENT_CHARACTERS.map((character) => (
              <label key={character.id} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="student-character"
                  value={character.id}
                  checked={selectedId === character.id}
                  onChange={() => setSelectedId(character.id)}
                  className="peer sr-only"
                />
                <span className="flex h-full flex-col items-center gap-1 rounded-xl border-2 border-[var(--campus-border)] bg-[var(--stone-cream)] px-2 py-2 text-sm font-bold text-[var(--seljuk-navy)] transition-colors hover:border-[var(--seljuk-teal)] peer-checked:border-[var(--seljuk-teal)] peer-checked:bg-[var(--seljuk-teal-soft)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--seljuk-teal)]">
                  <span
                    aria-hidden="true"
                    className="w-full max-w-20 bg-no-repeat sm:max-w-24"
                    style={{
                      aspectRatio: `${STUDENT_ATLAS_FRAME.width} / ${STUDENT_ATLAS_FRAME.height}`,
                      backgroundImage: `url(${character.atlasUrl})`,
                      backgroundPosition: 'left top',
                      backgroundSize: `${STUDENT_ATLAS_FRAME.columns * 100}% ${STUDENT_ATLAS_FRAME.rows * 100}%`,
                    }}
                  />
                  {character.label}
                </span>
                {selectedId === character.id && (
                  <span aria-hidden="true" className="absolute right-2 top-2 rounded-full bg-[var(--seljuk-teal)] p-1 text-white">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </label>
            ))}
          </fieldset>

          <button
            type="submit"
            disabled={!selectedId}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--seljuk-teal)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--seljuk-teal-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--seljuk-teal)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Bu karakterle devam et
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </form>
    </main>
  );
}
