import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { GradeTier } from '@/src/types/campus';

export interface CampusButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  tier?: GradeTier;
  children: ReactNode;
}

/**
 * Ortak kampüs düğme bileşeni.
 * Tüm ekranlarda minimum 44×44 px dokunma hedefi, ilkokulda (2–4) 48 px ferah yükseklik sunar.
 */
export function CampusButton({
  variant = 'primary',
  tier = 'ortaokul',
  className = '',
  type = 'button',
  children,
  ...rest
}: CampusButtonProps) {
  const heightClass = tier === 'ilkokul' ? 'min-h-[48px] px-5 py-2.5 text-sm sm:text-base' : 'min-h-[44px] px-4 py-2 text-sm';

  const variantClass =
    variant === 'primary'
      ? 'bg-[var(--seljuk-teal)] hover:bg-[var(--seljuk-teal-hover)] text-white border border-transparent shadow-xs'
      : variant === 'secondary'
        ? 'bg-[var(--seljuk-navy)] hover:bg-[var(--seljuk-navy-shade)] text-white border border-transparent shadow-xs'
        : variant === 'danger'
          ? 'bg-[var(--campus-surface)] hover:bg-[var(--alert-rose-soft)] text-[var(--alert-rose)] border border-[var(--alert-rose)]/45'
          : 'bg-[var(--stone-cream)] hover:bg-[var(--campus-surface-muted)] text-[var(--seljuk-navy)] border border-[var(--campus-border)]';

  return (
    <button
      type={type}
      className={`${heightClass} ${variantClass} rounded-lg font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export interface CampusCardProps {
  tone?: 'surface' | 'stone' | 'teal-soft' | 'gold-soft';
  tier?: GradeTier;
  showCrownAccent?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Sade Anadolu–Selçuklu taş-krem kart kabuğu.
 */
export function CampusCard({
  tone = 'surface',
  tier = 'ortaokul',
  showCrownAccent = false,
  className = '',
  children,
}: CampusCardProps) {
  const toneClass =
    tone === 'stone'
      ? 'bg-[var(--stone-cream)] border-[var(--campus-border)]'
      : tone === 'teal-soft'
        ? 'bg-[var(--seljuk-teal-soft)]/55 border-[var(--seljuk-teal)]/35'
        : tone === 'gold-soft'
          ? 'bg-[var(--sandstone-gold-soft)]/70 border-[var(--sandstone-gold)]/35'
          : 'bg-[var(--campus-surface)] border-[var(--campus-border)]';

  const padClass = tier === 'ilkokul' ? 'p-5 sm:p-6' : 'p-4 sm:p-5';

  return (
    <section className={`rounded-2xl border shadow-xs overflow-hidden ${toneClass} ${className}`}>
      {showCrownAccent && (
        <div
          aria-hidden="true"
          className="h-1.5 w-full bg-gradient-to-r from-[var(--seljuk-navy)] via-[var(--seljuk-teal)] to-[var(--terracotta)]"
        />
      )}
      <div className={padClass}>{children}</div>
    </section>
  );
}

export interface CampusSectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  headingLevel?: 'h1' | 'h2' | 'h3';
  tier?: GradeTier;
  action?: ReactNode;
}

export function CampusSectionHeader({
  eyebrow,
  title,
  description,
  headingLevel = 'h2',
  tier = 'ortaokul',
  action,
}: CampusSectionHeaderProps) {
  const titleClass =
    headingLevel === 'h1'
      ? tier === 'ilkokul'
        ? 'text-2xl sm:text-3xl font-bold text-[var(--seljuk-navy)]'
        : 'text-2xl sm:text-3xl font-bold tracking-tight text-[var(--seljuk-navy)]'
      : headingLevel === 'h3'
        ? 'text-base sm:text-lg font-bold text-[var(--seljuk-navy)]'
        : tier === 'ilkokul'
          ? 'text-xl sm:text-2xl font-bold text-[var(--seljuk-navy)]'
          : 'text-lg sm:text-xl font-bold text-[var(--seljuk-navy)]';

  const HeadingTag = headingLevel;

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-1 min-w-0 flex-1">
        {eyebrow && (
          <p className="text-xs font-semibold text-[var(--seljuk-teal)]">{eyebrow}</p>
        )}
        <HeadingTag className={titleClass}>{title}</HeadingTag>
        {description && (
          <p
            className={`${
              tier === 'ilkokul' ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
            } text-[var(--campus-ink-muted)] leading-relaxed`}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export interface CampusBadgeProps {
  tone?: 'teal' | 'navy' | 'terracotta' | 'sage' | 'gold' | 'neutral';
  children: ReactNode;
  className?: string;
}

export function CampusBadge({
  tone = 'teal',
  children,
  className = '',
}: CampusBadgeProps) {
  const toneClass =
    tone === 'navy'
      ? 'bg-[var(--seljuk-navy-soft)] text-[var(--seljuk-navy)] border-[var(--seljuk-navy)]/25'
      : tone === 'terracotta'
        ? 'bg-[var(--terracotta-soft)] text-[var(--terracotta-deep)] border-[var(--terracotta)]/30'
        : tone === 'sage'
          ? 'bg-[var(--courtyard-sage-soft)] text-[var(--courtyard-sage-shade)] border-[var(--courtyard-sage)]/30'
          : tone === 'gold'
            ? 'bg-[var(--sandstone-gold-soft)] text-[var(--sandstone-gold-shade)] border-[var(--sandstone-gold)]/30'
            : tone === 'neutral'
              ? 'bg-[var(--stone-cream)] text-[var(--campus-ink-muted)] border-[var(--campus-border)]'
              : 'bg-[var(--seljuk-teal-soft)] text-[var(--seljuk-teal-shade)] border-[var(--seljuk-teal)]/30';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold tabular-nums ${toneClass} ${className}`}
    >
      {children}
    </span>
  );
}

export interface CampusProgressBarProps {
  label: string;
  current: number;
  total: number;
  steps?: Array<{ id: string; label: string; done?: boolean; active?: boolean }>;
}

/**
 * Erişilebilir ilerleme göstergesi ve sade adım çubuğu.
 */
export function CampusProgressBar({
  label,
  current,
  total,
  steps,
}: CampusProgressBarProps) {
  const safeTotal = Math.max(1, total);
  const clamped = Math.min(safeTotal, Math.max(0, current));
  const percent = Math.round((clamped / safeTotal) * 100);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2 text-xs font-semibold">
        <span className="text-[var(--campus-ink)]">{label}</span>
        <span className="tabular-nums text-[var(--seljuk-teal)]">
          {clamped} / {safeTotal} (%{percent})
        </span>
      </div>

      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={safeTotal}
        aria-valuenow={clamped}
        className="h-2.5 w-full rounded-full bg-[var(--stone-light)] overflow-hidden"
      >
        <div
          className="h-full rounded-full bg-[var(--seljuk-teal)] transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      {steps && steps.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold tabular-nums ${
                step.done
                  ? 'border-[var(--courtyard-sage)]/50 bg-[var(--courtyard-sage-soft)] text-[var(--campus-ink)]'
                  : step.active
                    ? 'border-[var(--seljuk-teal)] bg-[var(--seljuk-teal-soft)] text-[var(--seljuk-navy)]'
                    : 'border-[var(--campus-border)] bg-[var(--stone-cream)] text-[var(--campus-ink-muted)]'
              }`}
            >
              {step.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
