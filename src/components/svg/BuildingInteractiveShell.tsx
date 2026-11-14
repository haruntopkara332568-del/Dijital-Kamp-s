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
 * Büyük kutu kartlar yerine doğrudan binayı ve altındaki kompakt mimari tabelayı sunar.
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
  const buildingDimensions = size === 'lg' ? 'w-36 h-28' : 'w-32 h-24';

  const content = (
    <div className="relative flex flex-col items-center">
      {/* Seçili veya Vurgulu Yapı Taban Halesi */}
      {selected && !disabled && (
        <span
          aria-hidden="true"
          className="absolute top-12 w-28 h-12 rounded-full bg-[var(--seljuk-teal)]/20 ring-2 ring-[var(--seljuk-teal)]/50 blur-[1px] pointer-events-none"
        />
      )}

      {/* Hover'da Tabanda Genişleyen Yumuşak Gölge */}
      <span
        aria-hidden="true"
        className="w-24 h-5 rounded-full bg-[var(--iso-shadow)]/15 blur-[2px] translate-y-22 transition-all duration-200 group-hover:w-28 group-hover:bg-[var(--iso-shadow)]/22 pointer-events-none"
      />

      <CampusBuildingSvg
        buildingId={buildingId}
        className={`${buildingDimensions} -mt-4 drop-shadow-xs transition-transform duration-200 ${
          disabled ? 'opacity-60 grayscale-[35%]' : 'group-hover:scale-[1.03]'
        }`}
      />

      <CampusLabelTag
        title={title}
        subtitle={subtitle}
        accent={accent}
        selected={selected}
        disabled={disabled}
        className="-mt-1.5"
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
        className="absolute -translate-x-1/2 -translate-y-1/2 select-none cursor-not-allowed"
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      to={to}
      style={positionStyle}
      className="absolute -translate-x-1/2 -translate-y-1/2 iso-building-trigger group rounded-xl p-1 focus-visible:outline-3 focus-visible:outline-[var(--seljuk-teal)]"
    >
      {content}
    </Link>
  );
}
