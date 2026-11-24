import { useEffect, type RefObject } from 'react';
import { Sparkles, Telescope, X } from 'lucide-react';
import {
  OBSERVATORY_CLASSROOM,
  OBSERVATORY_STATIONS,
  type ObservatoryStationDefinition,
} from '@/src/data/observatoryClassroomConfig';

interface ObservatoryArchitecturalLabelsProps {
  layerRef: RefObject<HTMLDivElement | null>;
}

/**
 * Gözlemevi sınıfındaki tüm Türkçe başlık ve tabela metinlerini görselin içine gömmeden
 * doğrudan React/HTML katmanıyla referans mimarideki kemer ve kürsülere birebir oturtur.
 */
export function ObservatoryArchitecturalLabels({
  layerRef,
}: ObservatoryArchitecturalLabelsProps) {
  const { width, height, title, subtitle, headerPlacement, centerPodiumPlacement } =
    OBSERVATORY_CLASSROOM;

  return (
    <div
      ref={layerRef}
      aria-label="Yerden Göklere gözlemevi mimari başlıkları"
      style={{
        width,
        height,
        visibility: 'hidden',
        transformOrigin: '0 0',
      }}
      className="pointer-events-none absolute top-0 left-0 z-10 select-none overflow-hidden"
    >
      {/* Merkezî Kemer Ana Başlık: YERDEN GÖKLERE */}
      <div
        style={{
          left: headerPlacement.titleCenterX,
          top: headerPlacement.titleTopY,
          width: 224,
          transform: 'translateX(-50%)',
        }}
        className="absolute text-center"
      >
        <h1
          className="font-serif text-[21px] font-extrabold tracking-[0.06em] text-[#f7df9d] uppercase leading-none"
          style={{
            textShadow: '0 2px 6px rgba(9, 18, 42, 0.95), 0 0 12px rgba(247, 223, 157, 0.25)',
          }}
        >
          {title}
        </h1>
      </div>

      {/* Merkezî Altın Şerit Alt Başlık: Uzayı Keşfediyorum */}
      <div
        style={{
          left: headerPlacement.subtitleCenterX,
          top: headerPlacement.subtitleTopY,
          width: 168,
          transform: 'translateX(-50%)',
        }}
        className="absolute text-center"
      >
        <p className="font-serif text-[13.5px] font-bold tracking-[0.02em] text-[#172747] leading-none">
          {subtitle}
        </p>
      </div>

      {/* Dört Keşif Alanı Kemer Başlıkları */}
      {OBSERVATORY_STATIONS.map((station) => {
        if (!station.archLabel) return null;
        return (
          <div
            key={station.id}
            data-observatory-label={station.id}
            style={{
              left: station.archLabel.x,
              top: station.archLabel.y,
              width: station.archLabel.width,
              transform: 'translate(-50%, -50%)',
              fontSize: `${station.archLabel.fontSize}px`,
            }}
            className="absolute text-center font-bold leading-[1.18] text-[#fff8e6]"
          >
            {station.archLabel.lines.map((line) => (
              <span
                key={line}
                className="block"
                style={{
                  textShadow: '0 1px 4px rgba(8, 16, 36, 0.96)',
                }}
              >
                {line}
              </span>
            ))}
          </div>
        );
      })}

      {/* Merkezî Güneş Sistemi Bilgi Kürsüsü Başlığı ve Temsilî Gösterim İbaresi */}
      <div
        style={{
          left: centerPodiumPlacement.titleCenterX,
          top: centerPodiumPlacement.titleTopY,
          width: 132,
          transform: 'translateX(-50%)',
        }}
        className="absolute text-center"
      >
        <span
          className="block text-[12.5px] font-extrabold tracking-wide text-[#f8f3e3]"
          style={{ textShadow: '0 1px 3px rgba(7, 17, 38, 0.95)' }}
        >
          Güneş Sistemi
        </span>
      </div>

      <div
        style={{
          left: centerPodiumPlacement.representativeCenterX,
          top: centerPodiumPlacement.representativeTopY,
          width: 120,
          transform: 'translateX(-50%)',
        }}
        className="absolute text-center"
      >
        <span className="inline-block rounded-full border border-[#f6dc9b]/50 bg-[#0d1f44]/85 px-2 py-[1px] text-[7.5px] font-semibold tracking-wide text-[#f7e7ba]">
          {centerPodiumPlacement.representativeLabel}
        </span>
      </div>
    </div>
  );
}

interface ObservatoryStationCardProps {
  station: ObservatoryStationDefinition | null;
  onClose: () => void;
}

/**
 * Gözlemevindeki keşif alanları, merkezî Güneş Sistemi veya pirinç teleskoba
 * yaklaşıp etkileşim başlatıldığında açılan bilimsel özet kartı.
 */
export function ObservatoryStationCard({ station, onClose }: ObservatoryStationCardProps) {
  useEffect(() => {
    if (!station) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [station, onClose]);

  if (!station) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="observatory-station-title"
      data-testid="observatory-station-card"
      data-station-id={station.id}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#09142c]/70 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border-2 border-[#d8a94c] bg-[#102042]/95 p-5 sm:p-6 text-[#f8f1dd] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e6be6c]/50 bg-[#1b3263] text-[#f6dc9b]">
              {station.kind === 'telescope' ? (
                <Telescope className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              )}
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-wider text-[#f3cc7a] uppercase">
                {station.badgeLabel}
              </span>
              <h2
                id="observatory-station-title"
                className="text-lg font-extrabold text-[#fff7e2]"
              >
                {station.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Bilgi kartını kapat"
            className="inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-xl border border-[#f6dc9b]/30 bg-[#182d59] text-[#f7e7ba] transition-colors hover:bg-[#223e77]"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <p className="mb-3.5 text-sm leading-relaxed text-[#e6ecf8]">{station.summary}</p>

        <ul className="mb-4 space-y-2 rounded-2xl border border-[#f6dc9b]/20 bg-[#0b1733]/80 p-3.5 text-xs sm:text-sm text-[#f4ecda]">
          {station.scientificFacts.map((fact) => (
            <li key={fact} className="flex items-start gap-2">
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f3cc7a]"
                aria-hidden="true"
              />
              <span>{fact}</span>
            </li>
          ))}
        </ul>

        {station.representativeNotice && (
          <p className="mb-4 rounded-xl border border-[#f3cc7a]/35 bg-[#1b315f]/85 px-3 py-2 text-xs font-semibold text-[#fbe4a8]">
            {station.representativeNotice}
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] cursor-pointer rounded-xl bg-[#d8a94c] px-5 py-2 text-sm font-bold text-[#102042] transition-colors hover:bg-[#e8be66]"
          >
            Gözlemevine Devam Et
          </button>
        </div>
      </div>
    </div>
  );
}
