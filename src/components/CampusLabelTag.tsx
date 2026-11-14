interface CampusLabelTagProps {
  title: string;
  subtitle?: string;
  accent?: 'terracotta' | 'teal' | 'sage' | 'navy';
  selected?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Büyük kutu kartlar yerine binanın yanında duran kompakt mimari tabela etiketi.
 * Normal, hover/focus, seçili ve yakında (disabled) durumlarını destekler.
 */
export function CampusLabelTag({
  title,
  subtitle,
  accent = 'teal',
  selected = false,
  disabled = false,
  className = '',
}: CampusLabelTagProps) {
  const accentColors =
    accent === 'terracotta'
      ? {
          border: 'border-[var(--terracotta)]/45',
          dot: 'bg-[var(--terracotta)]',
          subtitle: 'text-[var(--terracotta)]',
        }
      : accent === 'sage'
        ? {
            border: 'border-[var(--courtyard-sage)]/45',
            dot: 'bg-[var(--courtyard-sage)]',
            subtitle: 'text-[var(--courtyard-sage)]',
          }
        : accent === 'navy'
          ? {
              border: 'border-[var(--seljuk-navy)]/35',
              dot: 'bg-[var(--seljuk-navy)]',
              subtitle: 'text-[var(--seljuk-navy)]',
            }
          : {
              border: 'border-[var(--seljuk-teal)]/45',
              dot: 'bg-[var(--seljuk-teal)]',
              subtitle: 'text-[var(--seljuk-teal)]',
            };

  return (
    <div
      className={`rounded-lg bg-[var(--campus-surface)]/95 backdrop-blur-xs border px-2.5 py-1 lg:px-3 lg:py-1.5 shadow-sm transition-all ${
        disabled
          ? 'border-[var(--campus-border)] opacity-65'
          : selected
            ? 'border-[var(--seljuk-teal)] ring-2 ring-[var(--seljuk-teal)]/30 shadow-md'
            : `${accentColors.border} group-hover:border-[var(--seljuk-teal)] group-hover:shadow-md`
      } ${className}`}
    >
      <div className="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className={`w-2 h-2 rounded-xs shrink-0 ${disabled ? 'bg-[var(--stone-dark)]' : accentColors.dot}`}
        />
        <span className="text-[11px] lg:text-sm font-bold text-[var(--seljuk-navy)] leading-tight whitespace-nowrap">
          {title}
        </span>
      </div>
      {subtitle && (
        <p className={`text-[10px] font-semibold mt-0.5 pl-3.5 whitespace-nowrap ${disabled ? 'text-[var(--campus-ink-muted)]' : accentColors.subtitle}`}>
          {disabled ? 'Yakında' : subtitle}
        </p>
      )}
    </div>
  );
}
