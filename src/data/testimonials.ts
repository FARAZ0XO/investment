export interface ClientTestimonial {
  id: string;
  clientName: string;
  role: string;
  organization: string;
  portfolioFocus: string;
  outcomeMetric: string;
  quote: string;
}

export const CLIENT_TESTIMONIALS: ClientTestimonial[] = [
  {
    id: 'test-1',
    clientName: 'Tariq Mehmood Siddiqui',
    role: 'Managing Director',
    organization: 'Siddiqui Textile Exports, Karachi',
    portfolioFocus: 'Shahrah-e-Faisal Commercial Suites',
    outcomeMetric: '11.4% Net Annual Rental Yield Achieved',
    quote:
      'Before working with Arish Property Consultants, our family capital sat in idle residential plots with zero cash flow. Their advisory team at Fortune Towers structured a commercial floor acquisition on Shahrah-e-Faisal that was leased to a corporate tenant within 45 days of possession.',
  },
  {
    id: 'test-2',
    clientName: 'Dr. Farah Nazir Qureshi',
    role: 'Consultant Physician',
    organization: 'Overseas Investor (Dubai / Karachi)',
    portfolioFocus: 'DHA Phase 8 & Clifton Residences',
    outcomeMetric: '+42% Capital Appreciation in 28 Months',
    quote:
      'Investing from abroad used to mean chasing brokers over phone calls for basic transfer receipts. Through the Arish Client Portal, every DHA allotment verification, payment schedule, and valuation update was documented clearly without a single surprise trip to Karachi.',
  },
  {
    id: 'test-3',
    clientName: 'Kamran Raza Merchant',
    role: 'Chief Financial Officer',
    organization: 'Indus Logistics Group',
    portfolioFocus: 'Bahria Town & DHA City Land Banking',
    outcomeMetric: 'PKR 18.4 Cr Portfolio Rebalanced',
    quote:
      'We needed disciplined ROI projections rather than speculative sales pitches. Arish Property Consultants walked us through yield vs. appreciation stress tests and handled complete SBCA and DHA due diligence on every parcel we acquired.',
  },
];
