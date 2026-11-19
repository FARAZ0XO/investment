export interface InvestmentInput {
  propertyPricePkr: number;
  downPaymentPercent: number;
  tenureYears: number;
  annualAppreciationPercent: number;
  annualRentalYieldPercent: number;
}

export interface YearlyProjection {
  year: number;
  propertyValue: number;
  annualRentalIncome: number;
  cumulativeRentalIncome: number;
  installmentPaidCumulative: number;
  remainingBalance: number;
  totalWealth: number;
  netProfit: number;
  roiPercent: number;
}

export interface InvestmentResult {
  propertyPricePkr: number;
  downPaymentAmount: number;
  financedAmount: number;
  monthlyInstallment: number;
  annualRentalIncomeYear1: number;
  finalPropertyValue: number;
  totalRentalEarned: number;
  totalNetProfit: number;
  totalRoiPercent: number;
  annualizedReturnPercent: number;
  yearlyProjections: YearlyProjection[];
}

export interface BookingFormInput {
  fullName: string;
  phone: string;
  email: string;
  propertyId: string;
  preferredDate: string;
  visitType: 'site-visit' | 'office-consultation' | 'virtual-briefing';
  notes?: string;
}

export interface InquiryFormInput {
  fullName: string;
  phone: string;
  email: string;
  topic: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * Deterministic real estate ROI & installment projection calculator.
 * Assumes zero-interest developer installment schedule over the tenure
 * (standard in Karachi prime off-plan & commercial floor investments),
 * compounded annual capital appreciation, and rental income escalating
 * proportionally with property valuation once operational (from Year 1).
 */
export function calculateInvestmentProjection(input: InvestmentInput): InvestmentResult {
  const price = Math.max(0, Number.isFinite(input.propertyPricePkr) ? input.propertyPricePkr : 0);
  const downPct = Math.min(100, Math.max(0, Number.isFinite(input.downPaymentPercent) ? input.downPaymentPercent : 0));
  const years = Math.min(20, Math.max(1, Math.round(Number.isFinite(input.tenureYears) ? input.tenureYears : 1)));
  const apprRate = Math.max(0, Number.isFinite(input.annualAppreciationPercent) ? input.annualAppreciationPercent : 0) / 100;
  const rentalYield = Math.max(0, Number.isFinite(input.annualRentalYieldPercent) ? input.annualRentalYieldPercent : 0) / 100;

  const downPaymentAmount = Math.round(price * (downPct / 100));
  const financedAmount = Math.max(0, price - downPaymentAmount);
  const totalMonths = years * 12;
  const monthlyInstallment = totalMonths > 0 ? Math.round(financedAmount / totalMonths) : 0;

  const yearlyProjections: YearlyProjection[] = [];
  let cumulativeRental = 0;

  for (let year = 1; year <= years; year++) {
    const propertyValue = Math.round(price * Math.pow(1 + apprRate, year));
    const annualRentalIncome = Math.round(propertyValue * rentalYield);
    cumulativeRental += annualRentalIncome;

    const installmentPaidCumulative = Math.min(financedAmount, monthlyInstallment * year * 12);
    const remainingBalance = Math.max(0, financedAmount - installmentPaidCumulative);
    const totalInvestedToDate = downPaymentAmount + installmentPaidCumulative;
    const totalWealth = propertyValue + cumulativeRental - remainingBalance;
    const netProfit = totalWealth - totalInvestedToDate;
    const roiPercent = price > 0 ? Number(((netProfit / price) * 100).toFixed(1)) : 0;

    yearlyProjections.push({
      year,
      propertyValue,
      annualRentalIncome,
      cumulativeRentalIncome: cumulativeRental,
      installmentPaidCumulative,
      remainingBalance,
      totalWealth,
      netProfit,
      roiPercent,
    });
  }

  const lastYear = yearlyProjections[yearlyProjections.length - 1];
  const finalPropertyValue = lastYear ? lastYear.propertyValue : price;
  const totalRentalEarned = lastYear ? lastYear.cumulativeRentalIncome : 0;
  const totalNetProfit = lastYear ? lastYear.netProfit : 0;
  const totalRoiPercent = price > 0 ? Number(((totalNetProfit / price) * 100).toFixed(1)) : 0;
  const annualizedReturnPercent =
    price > 0 && years > 0
      ? Number(((Math.pow((price + totalNetProfit) / price, 1 / years) - 1) * 100).toFixed(1))
      : 0;

  return {
    propertyPricePkr: price,
    downPaymentAmount,
    financedAmount,
    monthlyInstallment,
    annualRentalIncomeYear1: yearlyProjections[0]?.annualRentalIncome ?? 0,
    finalPropertyValue,
    totalRentalEarned,
    totalNetProfit,
    totalRoiPercent,
    annualizedReturnPercent,
    yearlyProjections,
  };
}

export function formatPkr(amount: number, compact = true): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  const abs = Math.abs(safe);
  const sign = safe < 0 ? '-' : '';

  if (compact) {
    if (abs >= 10_000_000) {
      return `${sign}PKR ${(abs / 10_000_000).toFixed(2)} Cr`;
    }
    if (abs >= 100_000) {
      return `${sign}PKR ${(abs / 100_000).toFixed(2)} Lac`;
    }
  }

  return `${sign}PKR ${Math.round(abs).toLocaleString('en-US')}`;
}

export function normalizePakistanPhone(raw: string): string {
  return raw.replace(/[\s\-()]/g, '');
}

export function isValidPhone(raw: string): boolean {
  const cleaned = normalizePakistanPhone(raw.trim());
  // Matches 03075522866, +923075522866, 923075522866, or international E.164 10-15 digits
  return /^(\+?92|0)?3\d{9}$/.test(cleaned) || /^\+?[1-9]\d{8,14}$/.test(cleaned);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function validateBookingInput(input: BookingFormInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.fullName || input.fullName.trim().length < 2) {
    errors.fullName = 'Please enter your full name (at least 2 characters).';
  }
  if (!input.phone || !isValidPhone(input.phone)) {
    errors.phone = 'Enter a valid mobile number (e.g., 03075522866 or +92 307 5522866).';
  }
  if (!input.email || !isValidEmail(input.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!input.propertyId || input.propertyId.trim().length === 0) {
    errors.propertyId = 'Please select a property or advisory focus.';
  }
  if (!input.preferredDate || !/^\d{4}-\d{2}-\d{2}$/.test(input.preferredDate)) {
    errors.preferredDate = 'Please select a preferred visit or consultation date.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateInquiryInput(input: InquiryFormInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.fullName || input.fullName.trim().length < 2) {
    errors.fullName = 'Please enter your full name.';
  }
  if (!input.phone || !isValidPhone(input.phone)) {
    errors.phone = 'Enter a valid contact number (e.g., 03075522866).';
  }
  if (!input.email || !isValidEmail(input.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!input.message || input.message.trim().length < 5) {
    errors.message = 'Please include a brief inquiry message (at least 5 characters).';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  const cleaned = normalizePakistanPhone(phoneNumber);
  const intl = cleaned.startsWith('0')
    ? `92${cleaned.slice(1)}`
    : cleaned.startsWith('+')
      ? cleaned.slice(1)
      : cleaned;
  return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
}
