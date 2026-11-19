import { useEffect, useState, type FormEvent } from 'react';
import { MapPin, MessageCircle, Phone, X } from 'lucide-react';
import { OFFICE_INFO } from '../data/properties';
import {
  buildWhatsAppUrl,
  validateInquiryInput,
  type InquiryFormInput,
} from '../utils/investmentMath';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Commercial Investment');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sentRefId, setSentRefId] = useState<string | null>(null);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');
    setSentRefId(null);

    const payload: InquiryFormInput = {
      fullName,
      phone,
      email,
      topic,
      message,
    };

    const validation = validateInquiryInput(payload);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        else setServerError(data.error || 'Could not send inquiry.');
        return;
      }

      setSentRefId(data.inquiry.id);
      setFullName('');
      setPhone('');
      setEmail('');
      setMessage('');
    } catch {
      setServerError('Unable to submit inquiry right now. Please reach us directly on 03075522866.');
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappQuickUrl = buildWhatsAppUrl(
    OFFICE_INFO.whatsappNumber,
    `Hello Arish Property Consultants, I have a quick inquiry regarding ${topic}.`,
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
    >
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-xl border border-slate-200 bg-white">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-xs font-semibold text-emerald-900">Quick Advisory Desk</p>
            <h3 id="contact-modal-title" className="mt-0.5 font-display text-xl font-bold text-slate-950">
              Contact ARISH PROPERTY CONSULTANTS
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close contact dialog"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-950"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6">
          {/* Direct Contact Channels Bar */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs">
            <div className="flex items-start gap-2 text-slate-700">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-900" aria-hidden="true" />
              <span>{OFFICE_INFO.address}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2.5">
              <a
                href={OFFICE_INFO.phoneHref}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 font-mono font-semibold text-slate-900 hover:bg-slate-100"
              >
                <Phone className="h-3.5 w-3.5 text-emerald-900" aria-hidden="true" />
                {OFFICE_INFO.phoneDisplay}
              </a>
              <a
                href={whatsappQuickUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md bg-emerald-900 px-3 py-1.5 font-semibold text-white hover:bg-emerald-800"
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                Instant WhatsApp Chat
              </a>
            </div>
          </div>

          {sentRefId && (
            <div
              role="status"
              data-testid="contact-confirmation"
              className="mt-4 rounded-lg border border-emerald-800/30 bg-emerald-50 p-3.5 text-xs text-emerald-950"
            >
              <p className="font-semibold">
                Inquiry Received · Reference <span className="font-mono">{sentRefId}</span>
              </p>
              <p className="mt-1 text-emerald-900">
                An advisor at Fortune Towers will respond shortly on your phone or email.
              </p>
            </div>
          )}

          {serverError && (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-900"
            >
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="inq-name" className="block text-xs font-semibold text-slate-700">
                  Your Name
                </label>
                <input
                  id="inq-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ayesha Siddiqui"
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-800 focus:outline-none"
                />
                {errors.fullName && <p className="mt-1 text-xs text-red-700">{errors.fullName}</p>}
              </div>

              <div>
                <label htmlFor="inq-phone" className="block text-xs font-semibold text-slate-700">
                  Phone / WhatsApp
                </label>
                <input
                  id="inq-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="03075522866"
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-800 focus:outline-none"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-700">{errors.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="inq-email" className="block text-xs font-semibold text-slate-700">
                  Email Address
                </label>
                <input
                  id="inq-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.pk"
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-800 focus:outline-none"
                />
                {errors.email && <p className="mt-1 text-xs text-red-700">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="inq-topic" className="block text-xs font-semibold text-slate-700">
                  Inquiry Topic
                </label>
                <select
                  id="inq-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-800 focus:outline-none"
                >
                  <option value="Commercial Investment">Commercial Investment</option>
                  <option value="Residential Acquisition">Residential Acquisition</option>
                  <option value="Overseas Investor Advisory">Overseas Investor Advisory</option>
                  <option value="Client Portal Support">Client Portal Support</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="inq-message" className="block text-xs font-semibold text-slate-700">
                Message
              </label>
              <textarea
                id="inq-message"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your target location, yield goals, or preferred call time..."
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-800 focus:outline-none"
              />
              {errors.message && <p className="mt-1 text-xs text-red-700">{errors.message}</p>}
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-emerald-900 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
              >
                {submitting ? 'Sending...' : 'Send Quick Inquiry'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
