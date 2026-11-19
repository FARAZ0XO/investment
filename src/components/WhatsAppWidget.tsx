import { useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { OFFICE_INFO } from '../data/properties';
import { buildWhatsAppUrl } from '../utils/investmentMath';

const QUICK_TOPICS = [
  'Schedule a consultation at Fortune Towers (Suite 302)',
  'Request Shahrah-e-Faisal commercial floor availability',
  'Discuss DHA Phase 8 & Clifton residential ROI',
];

export function WhatsAppWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(
    'Assalam-o-Alaikum Arish Property Consultants, I would like information on verified Karachi investment properties.',
  );

  const whatsappHref = buildWhatsAppUrl(OFFICE_INFO.whatsappNumber, message);

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3">
      {open && (
        <div
          role="dialog"
          aria-label="WhatsApp Support Composer"
          className="w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-4 shadow-lg"
        >
          <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <p className="font-display text-sm font-bold text-slate-950">
                WhatsApp Advisory Support
              </p>
              <p className="mt-0.5 font-mono text-xs text-emerald-900 tabular-nums">
                {OFFICE_INFO.phoneDisplay} · Block-6 PECHS Desk
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close WhatsApp support box"
              className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-3 space-y-1.5">
            <p className="text-[11px] font-semibold text-slate-500">Quick Prompts</p>
            {QUICK_TOPICS.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => setMessage(`Hello Arish Property Consultants, I would like to ${topic.toLowerCase()}.`)}
                className="block w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-left text-xs text-slate-700 hover:border-emerald-800 hover:bg-emerald-50/40"
              >
                {topic}
              </button>
            ))}
          </div>

          <div className="mt-3">
            <label htmlFor="wa-message-input" className="sr-only">
              WhatsApp message
            </label>
            <textarea
              id="wa-message-input"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-800 focus:outline-none"
            />
          </div>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800"
          >
            <Send className="h-3.5 w-3.5" aria-hidden="true" />
            Start WhatsApp Chat
          </a>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label="WhatsApp Support 03075522866"
        className="inline-flex h-12 items-center gap-2 rounded-full bg-emerald-900 px-4 text-sm font-semibold text-white shadow-md transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-900"
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
        <span className="hidden sm:inline whitespace-nowrap">WhatsApp Support</span>
      </button>
    </div>
  );
}
