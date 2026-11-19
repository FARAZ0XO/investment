import { CLIENT_TESTIMONIALS } from '../data/testimonials';

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="scroll-mt-16 border-b border-slate-200 bg-slate-50 py-16">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-wide text-emerald-900">
            04. Client Track Record
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Trusted by Institutional &amp; Overseas Investors
          </h2>
          <p className="mt-2 text-base text-slate-600">
            Verified outcomes from clients who transitioned from fragmented brokerage deals to
            documented, yield-producing portfolios.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {CLIENT_TESTIMONIALS.map((item) => (
            <figure
              key={item.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6"
            >
              <div>
                <p className="font-mono text-xs font-semibold text-emerald-900 tabular-nums">
                  {item.outcomeMetric}
                </p>
                <blockquote className="mt-4 text-sm leading-relaxed text-slate-700">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
              </div>

              <figcaption className="mt-6 border-t border-slate-100 pt-4">
                <p className="font-display text-sm font-bold text-slate-950">{item.clientName}</p>
                <p className="mt-0.5 text-xs text-slate-600">
                  {item.role} · {item.organization}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-500">{item.portfolioFocus}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
