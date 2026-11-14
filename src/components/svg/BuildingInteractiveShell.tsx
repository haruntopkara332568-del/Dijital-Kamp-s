import { Link } from 'react-router';
import { CampusBuildingSvg } from '@/src/components/svg/CampusBuildingSvg';
import { CampusLabelTag } from '@/src/components/CampusLabelTag';

interface BuildingInteractiveShellProps {
  buildingId: string;
  to: string;
  title: string;
  subtitle?: string;
  accent?: 'terracotta' | 'teal' | 'sage' | 'navy';
  selected?: boolean;
  disabled?: boolean;
  leftPercent: number;
  topPercent: number;
  size?: 'lg' | 'md';
}

/**
 * 2,5B kampüs haritasında tıklanabilir izometrik bina kabuğu:
 * Normal, hover/focus (hafif yükselme + gölge artışı), seçili ve yakında (disabled) durumlarını destekler.
 * Dekoratif SVG gölge katmanları ekran okuyucudan gizlenir; erişilebilir etiket Link üzerinde yer alır.
 */
export function BuildingInteractiveShell({
  buildingId,
  to,
  title,
  subtitle,
  accent = 'teal',
  selected = false,
  disabled = false,
  leftPercent,
  topPercent,
  size = 'lg',
}: BuildingInteractiveShellProps) {
  const buildingDimensions =
    size === 'lg'
      ? 'w-28 h-22 lg:w-36 lg:h-28'
      : 'w-24 h-20 lg:w-32 lg:h-24';

  const accessibleLabel = disabled
    ? `${title} — Yakında açılacak`
    : `${title}${subtitle ? ` (${subtitle})` : ''}${selected ? ' — Sıradaki önerilen alan' : ''}`;

  const content = (
    <div className="relative flex flex-col items-center">
      {/* Seçili veya Aktif Görev Yapısı Taban Halesi (Dekoratif) */}
      {selected && !disabled && (
        <span
          aria-hidden="true"
          className="absolute top-10 lg:top-12 w-24 lg:w-28 h-10 lg:h-12 rounded-full bg-[var(--seljuk-teal)]/22 ring-2 ring-[var(--seljuk-teal)]/55 blur-[1px] pointer-events-none"
        />
      )}

      {/* Hover ve Focus'ta Genişleyen Yumuşak Zemin Gölgesi (Dekoratif) */}
      <span
        aria-hidden="true"
        className="w-20 lg:w-24 h-4 lg:h-5 rounded-full bg-[var(--iso-shadow)]/15 blur-[2px] translate-y-18 lg:translate-y-22 transition-all duration-200 group-hover:w-24 lg:group-hover:w-28 group-hover:bg-[var(--iso-shadow)]/22 pointer-events-none"
      />

      <CampusBuildingSvg
        buildingId={buildingId}
        className={`${buildingDimensions} -mt-3 drop-shadow-xs transition-transform duration-200 ${
          disabled ? 'opacity-60 grayscale-[35%]' : 'group-hover:scale-[1.03]'
        }`}
      />

      <CampusLabelTag
        title={title}
        subtitle={subtitle}
        accent={accent}
        selected={selected}
        disabled={disabled}
        className="-mt-1"
      />
    </div>
  );

  const positionStyle = {
    left: `${leftPercent}%`,
    top: `${topPercent}%`,
  };

  if (disabled) {
    return (
      <div
        style={positionStyle}
        aria-disabled="true"
        aria-label={accessibleLabel}
        className="absolute -translate-x-1/2 -translate-y-1/2 select-none cursor-not-allowed min-w-[44px] min-h-[44px]"
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      to={to}
      style={positionStyle}
      aria-label={accessibleLabel}
      className="absolute -translate-x-1/2 -translate-y-1/2 iso-building-trigger group rounded-xl p-1 min-w-[44px] min-h-[44px] focus-visible:outline-3 focus-visible:outline-[var(--seljuk-navy)] focus-visible:ring-4 focus-visible:ring-[var(--seljuk-teal)]/35"
    >
      {content}
    </Link>
  );
}
