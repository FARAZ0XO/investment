import { OFFICE_INFO } from '../data/properties';

interface FooterProps {
  onOpenContact: () => void;
}

export function Footer({ onOpenContact }: FooterProps) {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 py-12 text-slate-300">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-base font-bold tracking-tight text-white">
              {OFFICE_INFO.companyName}
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
              Independent real estate investment advisory specializing in title-verified Karachi
              commercial floors, residential developments, and institutional asset custody.
            </p>
          </div>

          <div className="md:col-span-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Karachi Office
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{OFFICE_INFO.address}</p>
            <p className="mt-2 font-mono text-sm text-emerald-300 tabular-nums">
              Direct: <a href={OFFICE_INFO.phoneHref}>{OFFICE_INFO.phoneDisplay}</a>
            </p>
          </div>

          <div className="md:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Navigation
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href="#listings" className="hover:text-white">
                  Property Listings
                </a>
              </li>
              <li>
                <a href="#calculator" className="hover:text-white">
                  Investment Calculator
                </a>
              </li>
              <li>
                <a href="#client-portal" className="hover:text-white">
                  Secure Client Portal
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-white">
                  Client Testimonials
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenContact}
                  className="text-left text-emerald-300 hover:text-emerald-200"
                >
                  Quick Contact Inquiry
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-slate-800 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} {OFFICE_INFO.companyName}. All rights reserved.</p>
          <p>{OFFICE_INFO.hours}</p>
        </div>
      </div>
    </footer>
  );
}
