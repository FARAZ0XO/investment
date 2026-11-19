import { useMemo, useState } from 'react';
import { ArrowRight, Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import { PROPERTY_LISTINGS, type PropertyListing } from '../data/properties';
import {
  calculateInvestmentProjection,
  formatPkr,
  type InvestmentInput,
} from '../utils/investmentMath';

interface InvestmentCalculatorProps {
  externalInput?: Partial<InvestmentInput> & { propertyTitle?: string };
  onApplyToBooking: (summaryText: string, propertyId?: string) => void;
}

export function InvestmentCalculator({
  externalInput,
  onApplyToBooking,
}: InvestmentCalculatorProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PROPERTY_LISTINGS[0].id);
  const [propertyPricePkr, setPropertyPricePkr] = useState<number>(
    externalInput?.propertyPricePkr ?? PROPERTY_LISTINGS[0].pricePkr,
  );
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(
    externalInput?.downPaymentPercent ?? PROPERTY_LISTINGS[0].downPaymentPercent,
  );
  const [tenureYears, setTenureYears] = useState<number>(
    externalInput?.tenureYears ?? 5,
  );
  const [annualAppreciationPercent, setAnnualAppreciationPercent] = useState<number>(
    externalInput?.annualAppreciationPercent ?? PROPERTY_LISTINGS[0].annualAppreciationPercent,
  );
  const [annualRentalYieldPercent, setAnnualRentalYieldPercent] = useState<number>(
    externalInput?.annualRentalYieldPercent ?? PROPERTY_LISTINGS[0].annualRentalYieldPercent,
  );
  const [showScheduleTable, setShowScheduleTable] = useState(false);

  // Sync whenever user clicks "Calculate ROI" on a property card
  const [lastExternalKey, setLastExternalKey] = useState<string>('');
  const externalKey = externalInput
    ? `${externalInput.propertyPricePkr}-${externalInput.downPaymentPercent}-${externalInput.annualAppreciationPercent}-${externalInput.annualRentalYieldPercent}-${externalInput.propertyTitle}`
    : '';
  if (externalInput && externalKey !== lastExternalKey && externalInput.propertyPricePkr) {
    setLastExternalKey(externalKey);
    setPropertyPricePkr(externalInput.propertyPricePkr);
    setDownPaymentPercent(externalInput.downPaymentPercent ?? 30);
    setTenureYears(externalInput.tenureYears ?? 5);
    setAnnualAppreciationPercent(externalInput.annualAppreciationPercent ?? 14);
    setAnnualRentalYieldPercent(externalInput.annualRentalYieldPercent ?? 8);
    const matching = PROPERTY_LISTINGS.find((p) => p.title === externalInput.propertyTitle);
    if (matching) setSelectedPresetId(matching.id);
  }

  const handlePresetChange = (id: string) => {
    setSelectedPresetId(id);
    const found: PropertyListing | undefined = PROPERTY_LISTINGS.find((p) => p.id === id);
    if (found) {
      setPropertyPricePkr(found.pricePkr);
      setDownPaymentPercent(found.downPaymentPercent);
      setTenureYears(Math.max(found.tenureYears, 5));
      setAnnualAppreciationPercent(found.annualAppreciationPercent);
      setAnnualRentalYieldPercent(found.annualRentalYieldPercent);
    }
  };

  const projection = useMemo(
    () =>
      calculateInvestmentProjection({
        propertyPricePkr,
        downPaymentPercent,
        tenureYears,
        annualAppreciationPercent,
        annualRentalYieldPercent,
      }),
    [
      propertyPricePkr,
      downPaymentPercent,
      tenureYears,
      annualAppreciationPercent,
      annualRentalYieldPercent,
    ],
  );

  const maxChartValue = useMemo(() => {
    const last = projection.yearlyProjections[projection.yearlyProjections.length - 1];
    return Math.max(1, last ? last.propertyValue + last.cumulativeRentalIncome : propertyPricePkr);
  }, [projection, propertyPricePkr]);

  const handleSendToBooking = () => {
    const summary = `ROI Calculation (${tenureYears}-Yr Horizon): Asset ${formatPkr(
      propertyPricePkr,
    )} · Down Payment ${downPaymentPercent}% (${formatPkr(
      projection.downPaymentAmount,
    )}) · Est. Monthly Installment ${formatPkr(
      projection.monthlyInstallment,
    )} · Projected Net Profit ${formatPkr(projection.totalNetProfit)} (+${projection.totalRoiPercent}% ROI).`;
    onApplyToBooking(summary, selectedPresetId);
  };

  return (
    <section id="calculator" className="scroll-mt-16 border-b border-slate-200 bg-white py-16">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold tracking-wide text-emerald-900">
              02. Quantitative Financial Modeling
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Interactive Property Investment Calculator
            </h2>
            <p className="mt-2 max-w-2xl text-base text-slate-600">
              Stress-test down payment structures, zero-markup installment timelines, compounded capital
              appreciation, and rental cash flows in PKR before committing capital.
            </p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Controls Column */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 lg:col-span-5">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
              <Calculator className="h-4 w-4 text-emerald-900" aria-hidden="true" />
              <h3 className="font-display text-base font-semibold text-slate-950">
                Investment Parameters
              </h3>
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <label
                  htmlFor="calc-preset"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Load Benchmark Property
                </label>
                <select
                  id="calc-preset"
                  value={selectedPresetId}
                  onChange={(e) => handlePresetChange(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-800 focus:outline-none"
                >
                  {PROPERTY_LISTINGS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({formatPkr(p.pricePkr)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Property Value */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <label htmlFor="calc-price" className="text-slate-700">
                    Property Acquisition Value
                  </label>
                  <span className="font-mono text-slate-950 tabular-nums" data-testid="calc-price-display">
                    {formatPkr(propertyPricePkr)}
                  </span>
                </div>
                <input
                  id="calc-price"
                  type="range"
                  min={10_000_000}
                  max={200_000_000}
                  step={500_000}
                  value={propertyPricePkr}
                  onChange={(e) => setPropertyPricePkr(Number(e.target.value))}
                  className="mt-2 h-2 w-full cursor-pointer accent-emerald-900"
                />
                <div className="mt-1 flex justify-between font-mono text-[11px] text-slate-500 tabular-nums">
                  <span>PKR 1.00 Cr</span>
                  <span>PKR 20.00 Cr</span>
                </div>
              </div>

              {/* Down Payment */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <label htmlFor="calc-down" className="text-slate-700">
                    Initial Down Payment
                  </label>
                  <span className="font-mono text-slate-950 tabular-nums">
                    {downPaymentPercent}% ({formatPkr(projection.downPaymentAmount)})
                  </span>
                </div>
                <input
                  id="calc-down"
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                  className="mt-2 h-2 w-full cursor-pointer accent-emerald-900"
                />
              </div>

              {/* Holding / Installment Horizon */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <label htmlFor="calc-tenure" className="text-slate-700">
                    Investment &amp; Payment Horizon
                  </label>
                  <span className="font-mono text-slate-950 tabular-nums">{tenureYears} Years</span>
                </div>
                <input
                  id="calc-tenure"
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="mt-2 h-2 w-full cursor-pointer accent-emerald-900"
                />
              </div>

              {/* Appreciation & Rental Yield */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="calc-appreciation"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Annual Appreciation (%)
                  </label>
                  <input
                    id="calc-appreciation"
                    type="number"
                    min={0}
                    max={40}
                    step={0.5}
                    value={annualAppreciationPercent}
                    onChange={(e) => setAnnualAppreciationPercent(Math.max(0, Number(e.target.value)))}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-950 tabular-nums focus:border-emerald-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="calc-yield" className="block text-xs font-semibold text-slate-700">
                    Annual Rental Yield (%)
                  </label>
                  <input
                    id="calc-yield"
                    type="number"
                    min={0}
                    max={25}
                    step={0.2}
                    value={annualRentalYieldPercent}
                    onChange={(e) => setAnnualRentalYieldPercent(Math.max(0, Number(e.target.value)))}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-950 tabular-nums focus:border-emerald-800 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSendToBooking}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-emerald-900"
              >
                Apply Projection to Booking Form
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Output & Chart Column */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7">
            <div>
              {/* 4 Output Metric Tiles */}
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                  <p className="text-xs font-medium text-slate-500">Projected ROI</p>
                  <p
                    className="mt-1 font-mono text-lg font-bold text-emerald-900 whitespace-nowrap tabular-nums"
                    data-testid="calc-total-roi"
                  >
                    +{projection.totalRoiPercent}%
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-slate-500 whitespace-nowrap tabular-nums">
                    {projection.annualizedReturnPercent}% CAGR
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                  <p className="text-xs font-medium text-slate-500">Total Net Profit</p>
                  <p
                    className="mt-1 font-mono text-lg font-bold text-slate-950 whitespace-nowrap tabular-nums"
                    data-testid="calc-net-profit"
                  >
                    {formatPkr(projection.totalNetProfit)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500 whitespace-nowrap">
                    Over {tenureYears} yrs
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                  <p className="text-xs font-medium text-slate-500">Monthly Payment</p>
                  <p
                    className="mt-1 font-mono text-lg font-bold text-slate-950 whitespace-nowrap tabular-nums"
                    data-testid="calc-monthly-installment"
                  >
                    {formatPkr(projection.monthlyInstallment)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500 whitespace-nowrap">
                    {downPaymentPercent === 100 ? 'Full cash paid' : `${tenureYears * 12} months`}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                  <p className="text-xs font-medium text-slate-500">Exit Asset Value</p>
                  <p className="mt-1 font-mono text-lg font-bold text-slate-950 whitespace-nowrap tabular-nums">
                    {formatPkr(projection.finalPropertyValue)}
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-slate-500 whitespace-nowrap tabular-nums">
                    Rent: {formatPkr(projection.totalRentalEarned)}
                  </p>
                </div>
              </div>

              {/* Stacked Year-by-Year Valuation Chart */}
              <div className="mt-7">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-display text-sm font-semibold text-slate-900">
                    Year-by-Year Asset Value &amp; Cumulative Rental Growth
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="inline-block h-2.5 w-2.5 rounded-xs bg-slate-900" />
                      Appreciated Asset Value
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="inline-block h-2.5 w-2.5 rounded-xs bg-emerald-700" />
                      Cumulative Rental Cash Flow
                    </span>
                  </div>
                </div>

                <div className="mt-5 space-y-3" aria-label="Projected annual wealth breakdown">
                  {projection.yearlyProjections.map((row) => {
                    const assetWidth = Math.max(4, (row.propertyValue / maxChartValue) * 100);
                    const rentWidth = Math.max(0, (row.cumulativeRentalIncome / maxChartValue) * 100);
                    return (
                      <div key={row.year} className="grid grid-cols-12 items-center gap-3 text-xs">
                        <span className="col-span-2 font-mono font-medium text-slate-600 tabular-nums sm:col-span-1">
                          Yr {row.year}
                        </span>
                        <div className="col-span-6 flex h-5 overflow-hidden rounded bg-slate-100 sm:col-span-8">
                          <div
                            style={{ width: `${assetWidth}%` }}
                            className="h-full bg-slate-900 transition-all duration-150"
                            title={`Asset Value: ${formatPkr(row.propertyValue)}`}
                          />
                          {rentWidth > 0 && (
                            <div
                              style={{ width: `${rentWidth}%` }}
                              className="h-full bg-emerald-700 transition-all duration-150"
                              title={`Cumulative Rent: ${formatPkr(row.cumulativeRentalIncome)}`}
                            />
                          )}
                        </div>
                        <span className="col-span-4 text-right font-mono font-semibold text-slate-900 tabular-nums sm:col-span-3">
                          {formatPkr(row.propertyValue + row.cumulativeRentalIncome)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Expandable Full Amortization & Equity Ledger */}
            <div className="mt-7 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setShowScheduleTable((prev) => !prev)}
                aria-expanded={showScheduleTable}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-900 hover:text-emerald-800"
              >
                {showScheduleTable ? (
                  <>
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                    Hide Detailed Year-by-Year Ledger
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                    View Detailed Year-by-Year Ledger
                  </>
                )}
              </button>

              {showScheduleTable && (
                <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-3 py-2.5 font-semibold">Year</th>
                        <th className="px-3 py-2.5 font-semibold">Property Value</th>
                        <th className="px-3 py-2.5 font-semibold">Annual Rent</th>
                        <th className="px-3 py-2.5 font-semibold">Remaining Balance</th>
                        <th className="px-3 py-2.5 font-semibold text-right">Net Profit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                      {projection.yearlyProjections.map((row) => (
                        <tr key={row.year} className="hover:bg-slate-50/70">
                          <td className="px-3 py-2 text-slate-900">Year {row.year}</td>
                          <td className="px-3 py-2 text-slate-900">{formatPkr(row.propertyValue)}</td>
                          <td className="px-3 py-2 text-emerald-900">
                            {formatPkr(row.annualRentalIncome)}
                          </td>
                          <td className="px-3 py-2 text-slate-600">
                            {formatPkr(row.remainingBalance)}
                          </td>
                          <td className="px-3 py-2 text-right font-semibold text-slate-950">
                            {formatPkr(row.netProfit)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
