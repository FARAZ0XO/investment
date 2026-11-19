import { useState } from 'react';
import { ArrowRight, Building2 } from 'lucide-react';
import { OFFICE_INFO } from '../data/properties';

interface HeroSectionProps {
  onOpenContact: () => void;
  onJumpToBooking: () => void;
}

export function HeroSection({ onOpenContact, onJumpToBooking }: HeroSectionProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <section id="top" className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Editorial Column */}
          <div className="flex flex-col justify-between lg:col-span-6">
            <div>
              <p className="text-xs font-medium tracking-wide text-emerald-900">
                Karachi Commercial &amp; Residential Investment Advisory
              </p>
              <h1
                className="mt-4 font-display font-bold tracking-tight text-slate-950 [text-wrap:balance]"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.35rem)', lineHeight: 1.08 }}
              >
                Disciplined real estate investments built for measurable yield.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                Arish Property Consultants advises institutional buyers, corporate tenants, and overseas
                investors on title-verified assets across Shahrah-e-Faisal, DHA Phase 8, Clifton, and
                Bahria Town Karachi.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={onJumpToBooking}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-900"
                >
                  Schedule Consultation
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <a
                  href="#calculator"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                >
                  Explore ROI Calculator
                </a>
              </div>
            </div>

            <div className="mt-10 border-t border-slate-200 pt-5 text-sm text-slate-600">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="font-semibold text-slate-900">Advisory Desk:</span>{' '}
                  <a
                    href={OFFICE_INFO.phoneHref}
                    className="font-mono font-medium text-emerald-900 hover:underline tabular-nums"
                  >
                    {OFFICE_INFO.phoneDisplay}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={onOpenContact}
                  className="font-medium text-slate-800 underline underline-offset-4 hover:text-emerald-900 whitespace-nowrap"
                >
                  Quick Inquiry &amp; WhatsApp
                </button>
              </div>
              <p className="mt-1.5 text-xs text-slate-500">{OFFICE_INFO.address}</p>
            </div>
          </div>

          {/* Right Architectural Showcase Frame */}
          <div className="lg:col-span-6">
            <div className="relative h-72 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:h-96 lg:h-full lg:min-h-[420px]">
              {!imgError ? (
                <img
                  src="/src/assets/images/hero_karachi_skyline_1795085238383.jpg"
                  alt="Modern glass commercial tower on Main Shahrah-e-Faisal business corridor"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-emerald-950 p-6 text-center text-white">
                  <Building2 className="h-10 w-10 text-emerald-300" aria-hidden="true" />
                  <p className="mt-3 font-display text-lg font-semibold">ARISH PROPERTY CONSULTANTS</p>
                  <p className="mt-1 text-sm text-slate-300">Main Shahrah-e-Faisal, Karachi</p>
                </div>
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent p-6 text-white">
                <p className="text-xs font-medium text-emerald-200">
                  Featured Corridor · Block-6 PECHS, Main Shahrah-e-Faisal
                </p>
                <p className="mt-1 font-display text-lg font-semibold">
                  Fortune Towers Investment Desk &amp; Institutional Assets
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Quantitative Proof Row Below Hero Split */}
        <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-slate-50 px-6 py-5">
            <p className="font-mono text-2xl font-semibold text-slate-950 tabular-nums">PKR 14.2B+</p>
            <p className="mt-1 text-sm text-slate-600">Commercial &amp; residential volume advised</p>
          </div>
          <div className="bg-slate-50 px-6 py-5">
            <p className="font-mono text-2xl font-semibold text-emerald-900 tabular-nums">18.4% Avg.</p>
            <p className="mt-1 text-sm text-slate-600">Annualized 3-year portfolio appreciation</p>
          </div>
          <div className="bg-slate-50 px-6 py-5">
            <p className="font-mono text-2xl font-semibold text-slate-950 tabular-nums">420+ Files</p>
            <p className="mt-1 text-sm text-slate-600">SBCA &amp; DHA verified title transfers</p>
          </div>
          <div className="bg-slate-50 px-6 py-5">
            <p className="font-mono text-2xl font-semibold text-slate-950 tabular-nums">03075522866</p>
            <p className="mt-1 text-sm text-slate-600">Direct WhatsApp &amp; Fortune Towers desk</p>
          </div>
        </div>
      </div>
    </section>
  );
}
