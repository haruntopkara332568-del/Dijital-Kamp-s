import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AlertTriangle, X } from 'lucide-react';
import { CAMPUS_BRAND } from '@/src/data/brandConfig';
import { useCampus } from '@/src/app/CampusProviders';

interface DeleteDataModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * İki adımlı, vazgeçilebilir "Verilerimi Sil" onay penceresi (Bölüm 5 ve 18).
 * Yalnızca uygulamanın kendi localStorage ve IndexedDB verilerini temizler.
 */
export function DeleteDataModal({ open, onClose }: DeleteDataModalProps) {
  const navigate = useNavigate();
  const { resetAllData } = useCampus();
  const [step, setStep] = useState<1 | 2>(1);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!open) return null;

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    await resetAllData();
    setIsDeleting(false);
    setStep(1);
    onClose();
    navigate('/');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-data-title"
    >
      <div className="w-full max-w-md rounded-xl bg-[var(--campus-surface)] border border-[var(--campus-border)] p-6 shadow-lg space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--alert-rose-soft)] text-[var(--alert-rose)] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 id="delete-data-title" className="text-lg font-bold text-[var(--campus-ink)]">
              {step === 1 ? 'Verilerini Silmek İstiyor musun?' : 'Son Onay: Tüm Veriler Silinsin mi?'}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Kapat"
            className="min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center text-[var(--campus-ink-muted)] hover:bg-[var(--campus-surface-muted)] cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {step === 1 ? (
          <div className="space-y-3 text-sm text-[var(--campus-ink)]">
            <p>
              Bu işlem yalnızca {CAMPUS_BRAND.name} içindeki kayıtlarını temizler. Cihazındaki diğer
              uygulamalara veya dosyalara dokunulmaz.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[var(--campus-ink-muted)]">
              <li>Seçtiğin sınıf düzeyi ve ses ayarların</li>
              <li>Görevlerdeki ilerlemen ve seçimlerin</li>
              <li>Bu tarayıcıya kaydettiğin çizimler ve yazılar</li>
            </ul>
            <p className="text-xs text-[var(--campus-ink-muted)]">
              İndirdiğin PNG görselleri bilgisayarında veya tabletinde kalmaya devam eder.
            </p>
          </div>
        ) : (
          <div className="space-y-3 text-sm text-[var(--campus-ink)]">
            <p className="font-semibold text-[var(--alert-rose)]">
              Bu işlem geri alınamaz. Kaydettiğin tüm kampüs ilerlemesi ve çizim taslakları silinecektir.
            </p>
            <p className="text-[var(--campus-ink-muted)]">
              Eminsen &ldquo;Evet, hepsini sil&rdquo; düğmesine dokun; devam etmek istemiyorsan
              &ldquo;Vazgeç&rdquo; ile güvenle geri dönebilirsin.
            </p>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="min-h-[44px] px-5 py-2.5 rounded-lg border border-[var(--campus-border)] bg-[var(--campus-surface)] hover:bg-[var(--campus-surface-muted)] text-sm font-semibold text-[var(--campus-ink)] cursor-pointer"
          >
            Vazgeç
          </button>

          {step === 1 ? (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[var(--alert-rose)] hover:opacity-90 text-sm font-semibold text-white cursor-pointer"
            >
              Devam Et
            </button>
          ) : (
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[var(--alert-rose)] hover:opacity-90 disabled:opacity-60 text-sm font-semibold text-white cursor-pointer"
            >
              {isDeleting ? 'Siliniyor...' : 'Evet, hepsini sil'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
