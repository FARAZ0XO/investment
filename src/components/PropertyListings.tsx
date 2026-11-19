import { useMemo, useState } from 'react';
import { Building2, Search } from 'lucide-react';
import { PROPERTY_LISTINGS, type PropertyCategory, type PropertyListing } from '../data/properties';
import { formatPkr } from '../utils/investmentMath';

interface PropertyListingsProps {
  onSelectForBooking: (property: PropertyListing) => void;
  onSelectForCalculator: (property: PropertyListing) => void;
  onOpenDetail: (property: PropertyListing) => void;
}

type CategoryFilter = 'All' | PropertyCategory;
type SortOrder = 'roi-desc' | 'price-asc' | 'price-desc';

const CATEGORIES: CategoryFilter[] = ['All', 'Commercial', 'Residential', 'Plots'];

export function PropertyListings({
  onSelectForBooking,
  onSelectForCalculator,
  onOpenDetail,
}: PropertyListingsProps) {
  const [category, setCategory] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('roi-desc');
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const filteredListings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = PROPERTY_LISTINGS.filter((item) => {
      const matchesCategory = category === 'All' || item.category === category;
      const matchesQuery =
        q.length === 0 ||
        item.title.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.district.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });

    return [...filtered].sort((a, b) => {
      if (sortOrder === 'price-asc') return a.pricePkr - b.pricePkr;
      if (sortOrder === 'price-desc') return b.pricePkr - a.pricePkr;
      return b.projectedFiveYearRoiPercent - a.projectedFiveYearRoiPercent;
    });
  }, [category, searchQuery, sortOrder]);

  const resetFilters = () => {
    setCategory('All');
    setSearchQuery('');
    setSortOrder('roi-desc');
  };

  return (
    <section id="listings" className="scroll-mt-16 border-b border-slate-200 bg-slate-50 py-16">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold tracking-wide text-emerald-900">
              01. Vetted Property Portfolio
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              High-Conviction Investment Listings
            </h2>
            <p className="mt-2 max-w-2xl text-base text-slate-600">
              Every property undergoes legal title verification, comparable valuation benchmarking, and
              rental demand modeling before entering our advisory inventory.
            </p>
          </div>

          <p className="font-mono text-sm font-medium text-slate-600 tabular-nums" data-testid="listing-count">
            Showing {filteredListings.length} of {PROPERTY_LISTINGS.length} properties
          </p>
        </div>

        {/* Interactive Filter Toolbar */}
        <div className="mt-8 flex flex-col gap-4 border-y border-slate-200 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div
            role="tablist"
            aria-label="Property Category Filter"
            className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-slate-200/70 p-1"
          >
            {CATEGORIES.map((tab) => {
              const active = category === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setCategory(tab)}
                  className={`rounded-md px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-emerald-900 ${
                    active
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  {tab === 'All' ? 'All Properties' : tab}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                aria-label="Search properties by district or title"
                placeholder="Search DHA, PECHS, Clifton..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-800 focus:outline-none sm:w-64"
              />
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="property-sort" className="text-xs font-medium text-slate-600 whitespace-nowrap">
                Sort by
              </label>
              <select
                id="property-sort"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-800 focus:outline-none"
              >
                <option value="roi-desc">Highest 5-Yr ROI</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Listings Grid or Empty State */}
        {filteredListings.length === 0 ? (
          <div className="mt-10 rounded-xl border border-slate-200 bg-white px-6 py-14 text-center">
            <p className="font-display text-lg font-semibold text-slate-900">
              No properties match your current filters
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Clear your search query or switch back to all categories to view available Karachi holdings.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 rounded-lg bg-emerald-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredListings.map((property) => {
              const isBroken = brokenImages[property.id];
              return (
                <article
                  key={property.id}
                  data-testid={`property-card-${property.id}`}
                  className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  {/* 4:3 Image Container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    {!isBroken ? (
                      <img
                        src={property.imageUrl}
                        alt={property.imageAlt}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={() =>
                          setBrokenImages((prev) => ({ ...prev, [property.id]: true }))
                        }
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-slate-900 p-4 text-center text-white">
                        <Building2 className="h-8 w-8 text-emerald-300" aria-hidden="true" />
                        <p className="mt-2 text-xs font-medium text-slate-200">{property.title}</p>
                      </div>
                    )}
                  </div>

                  {/* Card Body with Zero-Pill Metadata */}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500">
                      <span className="text-emerald-900">{property.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{property.sizeLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span>{property.possessionStatus}</span>
                    </div>

                    <h3 className="mt-2 font-display text-lg font-bold leading-snug text-slate-950">
                      {property.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">{property.location}</p>
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">
                      {property.summary}
                    </p>

                    {/* Quantitative Financial Strip */}
                    <div className="mt-5 grid grid-cols-3 gap-3 border-y border-slate-100 py-3.5">
                      <div>
                        <p className="text-xs text-slate-500">Asking Price</p>
                        <p className="mt-0.5 font-mono text-sm font-semibold text-slate-950 tabular-nums">
                          {formatPkr(property.pricePkr)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Rental Yield</p>
                        <p className="mt-0.5 font-mono text-sm font-semibold text-slate-950 tabular-nums">
                          {property.annualRentalYieldPercent > 0
                            ? `${property.annualRentalYieldPercent}% / yr`
                            : 'Land Gain'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">5-Yr ROI</p>
                        <p className="mt-0.5 font-mono text-sm font-semibold text-emerald-900 tabular-nums">
                          +{property.projectedFiveYearRoiPercent}%
                        </p>
                      </div>
                    </div>

                    {/* Action Row */}
                    <div className="mt-5 flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => onSelectForBooking(property)}
                        className="flex-1 rounded-lg bg-emerald-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-800 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-emerald-900"
                      >
                        Book Visit
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelectForCalculator(property)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-50 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-slate-900"
                      >
                        Calculate ROI
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenDetail(property)}
                        aria-label={`View full details for ${property.title}`}
                        className="rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-950 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-slate-900"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
