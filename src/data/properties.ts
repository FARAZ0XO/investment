export type PropertyCategory = 'Commercial' | 'Residential' | 'Plots';

export interface PropertyListing {
  id: string;
  title: string;
  category: PropertyCategory;
  location: string;
  district: string;
  pricePkr: number;
  sizeLabel: string;
  annualRentalYieldPercent: number;
  annualAppreciationPercent: number;
  projectedFiveYearRoiPercent: number;
  possessionStatus: string;
  downPaymentPercent: number;
  tenureYears: number;
  imageUrl: string;
  imageAlt: string;
  summary: string;
  highlights: string[];
  verificationCode: string;
}

export const OFFICE_INFO = {
  companyName: 'ARISH PROPERTY CONSULTANTS',
  phoneDisplay: '03075522866',
  phoneHref: 'tel:03075522866',
  whatsappNumber: '03075522866',
  email: 'advisory@arishproperty.pk',
  address: 'Suite No. 302, 3rd Floor, Fortune Towers, Main Shahrah-e-Faisal, Block-6 PECHS, Karachi',
  hours: 'Monday – Saturday · 10:00 AM – 7:30 PM PKT',
};

export const PROPERTY_LISTINGS: PropertyListing[] = [
  {
    id: 'prop-pechs-exec-suite',
    title: 'Shahrah-e-Faisal Executive Corporate Suite',
    category: 'Commercial',
    location: 'Block-6 PECHS, Main Shahrah-e-Faisal',
    district: 'Karachi Central Corridor',
    pricePkr: 42_500_000,
    sizeLabel: '1,850 Sq. Ft.',
    annualRentalYieldPercent: 11.2,
    annualAppreciationPercent: 14.0,
    projectedFiveYearRoiPercent: 138.4,
    possessionStatus: 'Ready for Lease',
    downPaymentPercent: 30,
    tenureYears: 3,
    imageUrl: '/src/assets/images/prop_commercial_tower_1795085237593.jpg',
    imageAlt: 'Modern glass corporate office tower facade along Main Shahrah-e-Faisal in Karachi',
    summary:
      'Grade-A corporate floor suite adjacent to Fortune Towers with active multinational tenant demand, dedicated fiber backbone, and verified SBCA commercialization.',
    highlights: [
      'SBCA & KDA commercial lease documentation verified',
      '11.2% net corporate rental yield with 5% annual escalation clause',
      '2 reserved basement parking bays and high-speed elevator access',
    ],
    verificationCode: 'APC-VER-8821',
  },
  {
    id: 'prop-dha-phase8-villa',
    title: 'DHA Phase 8 Contemporary Courtyard Villa',
    category: 'Residential',
    location: 'Zone B, DHA Phase 8',
    district: 'Defence Housing Authority, Karachi',
    pricePkr: 115_000_000,
    sizeLabel: '500 Sq. Yds.',
    annualRentalYieldPercent: 5.8,
    annualAppreciationPercent: 16.5,
    projectedFiveYearRoiPercent: 144.2,
    possessionStatus: 'Completed Structure',
    downPaymentPercent: 40,
    tenureYears: 2,
    imageUrl: '/src/assets/images/prop_dha_villa_1795085237904.jpg',
    imageAlt: 'Contemporary architectural villa with cantilevered concrete roof and landscaped courtyard in DHA Phase 8',
    summary:
      'Five-bedroom architectural residence featuring cantilevered concrete decks, imported double-glazed fenestration, and strong expatriate rental appetite.',
    highlights: [
      'DHA A-Category clear transfer & completion certificate',
      'Solar hybrid 15kW installation and subterranean rainwater tank',
      '3 minutes from Creek Marina and DHA Golf Club',
    ],
    verificationCode: 'APC-VER-8840',
  },
  {
    id: 'prop-clifton-sky-penthouse',
    title: 'Clifton Block 4 Sea-View Sky Penthouse',
    category: 'Residential',
    location: 'Block 4, Clifton',
    district: 'Clifton Coastal Belt, Karachi',
    pricePkr: 89_000_000,
    sizeLabel: '3,400 Sq. Ft.',
    annualRentalYieldPercent: 7.4,
    annualAppreciationPercent: 15.0,
    projectedFiveYearRoiPercent: 136.0,
    possessionStatus: 'Possession Q2 2027',
    downPaymentPercent: 25,
    tenureYears: 4,
    imageUrl: '/src/assets/images/prop_clifton_penthouse_1795085237337.jpg',
    imageAlt: 'Luxury high-rise penthouse living area overlooking Karachi coastal skyline at sunset',
    summary:
      'Full-floor duplex penthouse commanding unobstructed Arabian Sea panoramas, delivered with travertine finishes and flexible 48-month construction-linked installments.',
    highlights: [
      '48-month developer installment schedule at 0% markup',
      'Private elevator lobby with biometric access control',
      'High short-stay corporate executive occupancy potential',
    ],
    verificationCode: 'APC-VER-8854',
  },
  {
    id: 'prop-fortune-corridor-floor',
    title: 'Fortune Corridor Institutional Office Floor',
    category: 'Commercial',
    location: 'Block-6 PECHS, Shahrah-e-Faisal',
    district: 'Karachi Financial Strip',
    pricePkr: 78_000_000,
    sizeLabel: '3,200 Sq. Ft.',
    annualRentalYieldPercent: 12.1,
    annualAppreciationPercent: 13.5,
    projectedFiveYearRoiPercent: 141.6,
    possessionStatus: 'Tenanted Asset',
    downPaymentPercent: 35,
    tenureYears: 3,
    imageUrl: '/src/assets/images/hero_karachi_skyline_1795085238383.jpg',
    imageAlt: 'High-rise glass commercial tower along Shahrah-e-Faisal business corridor at golden hour',
    summary:
      'Yield-producing commercial floor within walking distance of Arish Property Consultants headquarters, leased to a fintech enterprise with immediate quarterly cash flow.',
    highlights: [
      'Immediate rental cash flow from Day 1 of transfer',
      '3-year locked corporate tenancy with bank-guaranteed cheques',
      'Direct access to Shahrah-e-Faisal transit and airport corridor',
    ],
    verificationCode: 'APC-VER-8879',
  },
  {
    id: 'prop-bahria-jinnah-plot',
    title: 'Jinnah Avenue Main Boulevard Commercial Plot',
    category: 'Plots',
    location: 'Jinnah Avenue, Bahria Town Karachi',
    district: 'Bahria Town Corridor',
    pricePkr: 64_000_000,
    sizeLabel: '250 Sq. Yds.',
    annualRentalYieldPercent: 0,
    annualAppreciationPercent: 21.0,
    projectedFiveYearRoiPercent: 159.4,
    possessionStatus: 'Possession & Utility Ready',
    downPaymentPercent: 30,
    tenureYears: 3,
    imageUrl: '/src/assets/images/prop_plot_development_1795085237556.jpg',
    imageAlt: 'Aerial view of wide paved boulevard and landscaped commercial-residential corridor',
    summary:
      'High-visibility corner commercial plot approved for Ground + 8 mixed-use construction along the primary 400-foot arterial avenue.',
    highlights: [
      'Approved Ground + 8 commercial FAR ratio',
      'Possession granted with underground power and water mains',
      'Corner orientation maximizing retail frontage',
    ],
    verificationCode: 'APC-VER-8902',
  },
  {
    id: 'prop-dha-city-sector3',
    title: 'DHA City Sector 3 Prime Boulevard Plot',
    category: 'Plots',
    location: 'Sector 3, DHA City Karachi',
    district: 'M-9 Superhighway Corridor',
    pricePkr: 18_500_000,
    sizeLabel: '500 Sq. Yds.',
    annualRentalYieldPercent: 0,
    annualAppreciationPercent: 19.5,
    projectedFiveYearRoiPercent: 143.8,
    possessionStatus: 'Balloted & Developed',
    downPaymentPercent: 50,
    tenureYears: 2,
    imageUrl: '/src/assets/images/prop_plot_development_1795085237556.jpg',
    imageAlt: 'Master-planned boulevard infrastructure and residential sector parks in DHA City',
    summary:
      'Ideal medium-horizon land banking allocation adjacent to operational educational and healthcare campuses with rapid M-9 infrastructure appreciation.',
    highlights: [
      'Clear DHA City allotment file ready for direct transfer',
      '60-foot wide carpeted road frontage near central park',
      'Low entry ticket suitable for diversified portfolio hedging',
    ],
    verificationCode: 'APC-VER-8915',
  },
];
