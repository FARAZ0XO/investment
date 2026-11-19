import { useEffect } from 'react';
import { Check, MessageCircle, X } from 'lucide-react';
import { OFFICE_INFO, type PropertyListing } from '../data/properties';
import { buildWhatsAppUrl, formatPkr } from '../utils/investmentMath';

interface PropertyDetailModalProps {
  property: PropertyListing | null;
  onClose: () => void;
  onBookVisit: (property: PropertyListing) => void;
  onLoadCalculator: (property: PropertyListing) => void;
}

export function PropertyDetailModal({
  property,
  onClose,
  onBookVisit,
  onLoadCalculator,
}: PropertyDetailModalProps) {
  useEffect(() => {
    if (!property) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [property, onClose]);

  if (!property) return null;

  const whatsappHref = buildWhatsAppUrl(
    OFFICE_INFO.whatsappNumber,
    `Hello Arish Property Consultants, I would like the dossier and floor plan for ${property.title} (${property.verificationCode}).`,
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="property-detail-title"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-xs font-medium text-slate-500">
              {property.category} · {property.verificationCode} · {property.district}
            </p>
            <h3 id="property-detail-title" className="mt-1 font-display text-xl font-bold text-slate-950">
              {property.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close property dossier"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-950"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6">
          <div className="aspect-[16/9] w-full overflow-hidden rounded-lg bg-slate-100">
            <img
              src={property.imageUrl}
              alt={property.imageAlt}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-slate-500">Asking Price</p>
              <p className="mt-0.5 font-mono text-sm font-semibold text-slate-950 tabular-nums">
                {formatPkr(property.pricePkr)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Size / Area</p>
              <p className="mt-0.5 font-mono text-sm font-semibold text-slate-950 tabular-nums">
                {property.sizeLabel}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Down Payment</p>
              <p className="mt-0.5 font-mono text-sm font-semibold text-slate-950 tabular-nums">
                {property.downPaymentPercent}% ({property.tenureYears} Yr Plan)
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">5-Yr Est. ROI</p>
              <p className="mt-0.5 font-mono text-sm font-semibold text-emerald-900 tabular-nums">
                +{property.projectedFiveYearRoiPercent}%
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-slate-700">{property.summary}</p>

          <div className="mt-5">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Due Diligence Highlights
            </h4>
            <ul className="mt-3 space-y-2.5">
              {property.highlights.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-800" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onBookVisit(property);
              }}
              className="rounded-lg bg-emerald-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 whitespace-nowrap"
            >
              Book Site Visit
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onLoadCalculator(property);
              }}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap"
            >
              Model in Calculator
            </button>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-800 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-900 hover:bg-emerald-100 whitespace-nowrap"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              WhatsApp Advisory
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
