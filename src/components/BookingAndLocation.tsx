import { useEffect, useState, type FormEvent } from 'react';
import { CalendarCheck, Clock, MapPin, MessageCircle, Phone } from 'lucide-react';
import { OFFICE_INFO, PROPERTY_LISTINGS } from '../data/properties';
import {
  buildWhatsAppUrl,
  validateBookingInput,
  type BookingFormInput,
} from '../utils/investmentMath';

interface BookingAndLocationProps {
  selectedPropertyId: string;
  prefilledNotes: string;
  onBookingCreated: () => void;
}

export function BookingAndLocation({
  selectedPropertyId,
  prefilledNotes,
  onBookingCreated,
}: BookingAndLocationProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [propertyId, setPropertyId] = useState(selectedPropertyId || PROPERTY_LISTINGS[0].id);
  const [preferredDate, setPreferredDate] = useState('2026-12-05');
  const [visitType, setVisitType] = useState<BookingFormInput['visitType']>('site-visit');
  const [notes, setNotes] = useState(prefilledNotes);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [confirmation, setConfirmation] = useState<{
    id: string;
    fullName: string;
    preferredDate: string;
    propertyTitle: string;
  } | null>(null);

  useEffect(() => {
    if (selectedPropertyId) setPropertyId(selectedPropertyId);
  }, [selectedPropertyId]);

  useEffect(() => {
    if (prefilledNotes) setNotes(prefilledNotes);
  }, [prefilledNotes]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');
    setConfirmation(null);

    const payload: BookingFormInput = {
      fullName,
      phone,
      email,
      propertyId,
      preferredDate,
      visitType,
      notes,
    };

    const validation = validateBookingInput(payload);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        else setServerError(data.error || 'Could not submit booking.');
        return;
      }

      const matchedProperty = PROPERTY_LISTINGS.find((p) => p.id === propertyId);
      setConfirmation({
        id: data.booking.id,
        fullName: data.booking.fullName,
        preferredDate: data.booking.preferredDate,
        propertyTitle: matchedProperty?.title || 'Advisory Consultation',
      });
      onBookingCreated();
    } catch {
      setServerError('Network error while submitting your booking. Please call 03075522866.');
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappDirectUrl = buildWhatsAppUrl(
    OFFICE_INFO.whatsappNumber,
    'Assalam-o-Alaikum Arish Property Consultants, I would like to schedule an appointment at your Fortune Towers office.',
  );

  return (
    <section id="booking-location" className="scroll-mt-16 bg-white py-16">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-wide text-emerald-900">
            05. Appointment Scheduling &amp; Headquarters
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Book a Site Visit or Office Consultation
          </h2>
          <p className="mt-2 text-base text-slate-600">
            Meet our senior investment advisors at Fortune Towers on Shahrah-e-Faisal or reserve a
            private property inspection.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
          {/* Booking Form Column */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 sm:p-8 lg:col-span-7">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
              <CalendarCheck className="h-4 w-4 text-emerald-900" aria-hidden="true" />
              <h3 className="font-display text-lg font-semibold text-slate-950">
                Property Booking &amp; Site Inspection Form
              </h3>
            </div>

            {confirmation && (
              <div
                role="status"
                data-testid="booking-confirmation"
                className="mt-5 rounded-lg border border-emerald-800/30 bg-emerald-50 p-4 text-sm text-emerald-950"
              >
                <p className="font-semibold">
                  Booking Confirmed · Reference{' '}
                  <span className="font-mono">{confirmation.id}</span>
                </p>
                <p className="mt-1 text-xs text-emerald-900">
                  Thank you, {confirmation.fullName}. Your {visitType.replace('-', ' ')} for{' '}
                  <strong>{confirmation.propertyTitle}</strong> on{' '}
                  <span className="font-mono">{confirmation.preferredDate}</span> is scheduled. Our
                  Fortune Towers desk (03075522866) will confirm via WhatsApp.
                </p>
              </div>
            )}

            {serverError && (
              <div
                role="alert"
                className="mt-5 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-xs font-medium text-red-900"
              >
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="booking-name" className="block text-xs font-semibold text-slate-700">
                    Full Name
                  </label>
                  <input
                    id="booking-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Muhammad Salman"
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-800 focus:outline-none"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-red-700">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="booking-phone" className="block text-xs font-semibold text-slate-700">
                    Mobile / WhatsApp Number
                  </label>
                  <input
                    id="booking-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="03075522866"
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-800 focus:outline-none"
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-700">{errors.phone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="booking-email" className="block text-xs font-semibold text-slate-700">
                    Email Address
                  </label>
                  <input
                    id="booking-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="investor@company.pk"
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-800 focus:outline-none"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-700">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="booking-date" className="block text-xs font-semibold text-slate-700">
                    Preferred Date
                  </label>
                  <input
                    id="booking-date"
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 focus:border-emerald-800 focus:outline-none"
                  />
                  {errors.preferredDate && (
                    <p className="mt-1 text-xs text-red-700">{errors.preferredDate}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="booking-property"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Property / Investment Focus
                  </label>
                  <select
                    id="booking-property"
                    value={propertyId}
                    onChange={(e) => setPropertyId(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-800 focus:outline-none"
                  >
                    {PROPERTY_LISTINGS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                    <option value="custom-portfolio-advisory">Custom Portfolio Advisory</option>
                  </select>
                  {errors.propertyId && (
                    <p className="mt-1 text-xs text-red-700">{errors.propertyId}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="booking-type" className="block text-xs font-semibold text-slate-700">
                    Appointment Format
                  </label>
                  <select
                    id="booking-type"
                    value={visitType}
                    onChange={(e) =>
                      setVisitType(e.target.value as BookingFormInput['visitType'])
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-800 focus:outline-none"
                  >
                    <option value="site-visit">On-Site Property Inspection</option>
                    <option value="office-consultation">
                      Fortune Towers Office Consultation
                    </option>
                    <option value="virtual-briefing">Overseas Investor Video Briefing</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="booking-notes" className="block text-xs font-semibold text-slate-700">
                  Investment Objectives or Calculator Summary (Optional)
                </label>
                <textarea
                  id="booking-notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Share target budget, preferred payment plan, or questions for our advisory team..."
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-800 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-emerald-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-emerald-900"
              >
                {submitting ? 'Confirming Appointment...' : 'Confirm Booking Request'}
              </button>
            </form>
          </div>

          {/* Office Location & Direct Channels Column */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 sm:p-8 lg:col-span-5">
            <div>
              <h3 className="font-display text-lg font-semibold text-slate-950">
                Karachi Head Office
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Walk-in investor briefings and title verification reviews are hosted at our
                Shahrah-e-Faisal advisory suite.
              </p>

              <div className="mt-6 space-y-4 border-y border-slate-200 py-5 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-900" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-slate-950">Office Address</p>
                    <p className="mt-0.5 leading-relaxed text-slate-600">{OFFICE_INFO.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-emerald-900" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-slate-950">Direct Advisory Line</p>
                    <a
                      href={OFFICE_INFO.phoneHref}
                      className="mt-0.5 inline-block font-mono font-semibold text-emerald-900 hover:underline tabular-nums"
                    >
                      {OFFICE_INFO.phoneDisplay}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-emerald-900" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-slate-950">Advisory Hours</p>
                    <p className="mt-0.5 text-slate-600">{OFFICE_INFO.hours}</p>
                  </div>
                </div>
              </div>

              {/* Clean Architectural Street Schematic for Fortune Towers, Block-6 PECHS */}
              <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900">
                    Corridor Guide · Block-6 PECHS
                  </span>
                  <span className="font-mono text-slate-500">Shahrah-e-Faisal</span>
                </div>
                <svg
                  viewBox="0 0 360 130"
                  className="mt-3 h-32 w-full rounded border border-slate-200 bg-white"
                  role="img"
                  aria-label="Schematic corridor map showing Fortune Towers on Main Shahrah-e-Faisal, Block-6 PECHS, Karachi"
                >
                  {/* Grid & secondary streets */}
                  <line x1="85" y1="0" x2="85" y2="130" stroke="#e2e8f0" strokeWidth="6" />
                  <line x1="210" y1="0" x2="210" y2="130" stroke="#e2e8f0" strokeWidth="6" />
                  <line x1="0" y1="30" x2="360" y2="30" stroke="#f1f5f9" strokeWidth="4" />

                  {/* Main Shahrah-e-Faisal Boulevard */}
                  <line x1="0" y1="88" x2="360" y2="72" stroke="#0f172a" strokeWidth="14" />
                  <line
                    x1="0"
                    y1="88"
                    x2="360"
                    y2="72"
                    stroke="#94a3b8"
                    strokeWidth="1"
                    strokeDasharray="6 6"
                  />

                  {/* Nursery Flyover marker */}
                  <rect x="42" y="75" width="44" height="22" rx="4" fill="#334155" />
                  <text x="64" y="89" textAnchor="middle" fill="#ffffff" fontSize="7" fontFamily="sans-serif">
                    Nursery
                  </text>

                  {/* Fortune Towers Building Pin */}
                  <rect x="190" y="34" width="52" height="28" rx="4" fill="#064e3b" />
                  <text
                    x="216"
                    y="47"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="7"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                  >
                    Fortune
                  </text>
                  <text x="216" y="56" textAnchor="middle" fill="#a7f3d0" fontSize="6.5" fontFamily="sans-serif">
                    Suite 302
                  </text>

                  {/* Labels */}
                  <text x="150" y="114" fill="#475569" fontSize="8" fontFamily="sans-serif">
                    Main Shahrah-e-Faisal (Towards Airport) →
                  </text>
                  <text x="220" y="20" fill="#64748b" fontSize="7.5" fontFamily="sans-serif">
                    Block-6 PECHS
                  </text>
                </svg>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 whitespace-nowrap"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Chat on WhatsApp
              </a>
              <a
                href={OFFICE_INFO.phoneHref}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50 whitespace-nowrap"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                Call 03075522866
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
