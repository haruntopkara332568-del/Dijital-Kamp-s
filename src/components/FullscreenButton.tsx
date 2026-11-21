import { Maximize, Minimize } from 'lucide-react';
import { useFullscreen } from '@/src/hooks/useFullscreen';

export interface FullscreenButtonProps {
  className?: string;
  variant?: 'header' | 'prominent' | 'floating';
  showText?: boolean;
}

/**
 * Gerçek tam ekran desteği varsa görünen, tarayıcı desteklemiyorsa otomatik gizlenen
 * erişilebilir tam ekran açma/kapama kontrolü.
 */
export function FullscreenButton({
  className = '',
  variant = 'header',
  showText = true,
}: FullscreenButtonProps) {
  const { isFullscreen, isSupported, toggleFullscreen } = useFullscreen();

  // Tarayıcı gerçek tam ekranı desteklemiyorsa çalışmayan düğme gösterme
  if (!isSupported) {
    return null;
  }

  const label = isFullscreen ? 'Tam ekrandan çık' : 'Tam ekrana geç';
  const Icon = isFullscreen ? Minimize : Maximize;

  let baseStyles =
    'min-h-[44px] inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer font-semibold select-none';

  if (variant === 'floating') {
    baseStyles +=
      ' px-3.5 py-2 rounded-xl bg-[var(--campus-surface)]/95 backdrop-blur-xs text-[var(--seljuk-navy)] border border-[var(--campus-border)] shadow-md hover:bg-[var(--stone-cream)] text-xs active:scale-[0.98]';
  } else if (variant === 'prominent') {
    baseStyles +=
      ' px-5 py-2.5 rounded-lg border border-[var(--campus-border)] bg-[var(--stone-cream)] hover:bg-[var(--campus-surface-muted)] text-sm text-[var(--seljuk-navy)] shadow-xs active:scale-[0.99]';
  } else {
    // variant === 'header'
    baseStyles +=
      ' px-3 sm:px-3.5 py-1.5 rounded-lg bg-[var(--stone-cream)] hover:bg-[var(--campus-surface-muted)] text-[var(--seljuk-navy)] border border-[var(--campus-border)] text-xs shadow-xs';
  }

  return (
    <button
      type="button"
      onClick={() => void toggleFullscreen()}
      className={`${baseStyles} ${className}`.trim()}
      aria-label={label}
      title={label}
    >
      <Icon className="w-4 h-4 text-[var(--seljuk-teal)] shrink-0" aria-hidden="true" />
      {showText && <span>{label}</span>}
    </button>
  );
}
