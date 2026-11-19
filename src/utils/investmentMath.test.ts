import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateInvestmentProjection,
  formatPkr,
  validateBookingInput,
  validateInquiryInput,
  buildWhatsAppUrl,
} from './investmentMath';

test('calculateInvestmentProjection computes down payment, monthly installment, and ROI accurately', () => {
  const result = calculateInvestmentProjection({
    propertyPricePkr: 40_000_000, // 4 Crore
    downPaymentPercent: 25,
    tenureYears: 4,
    annualAppreciationPercent: 10,
    annualRentalYieldPercent: 6,
  });

  assert.equal(result.downPaymentAmount, 10_000_000);
  assert.equal(result.financedAmount, 30_000_000);
  assert.equal(result.monthlyInstallment, 625_000); // 30M / 48 months
  assert.equal(result.yearlyProjections.length, 4);

  // Year 1 property value = 40M * 1.10 = 44M
  assert.equal(result.yearlyProjections[0].propertyValue, 44_000_000);
  // Year 1 rent = 44M * 0.06 = 2,640,000
  assert.equal(result.yearlyProjections[0].annualRentalIncome, 2_640_000);
  assert.ok(result.totalNetProfit > 0);
  assert.ok(result.totalRoiPercent > 0);
});

test('calculateInvestmentProjection handles 100% down payment (cash purchase)', () => {
  const result = calculateInvestmentProjection({
    propertyPricePkr: 25_000_000,
    downPaymentPercent: 100,
    tenureYears: 3,
    annualAppreciationPercent: 12,
    annualRentalYieldPercent: 0,
  });

  assert.equal(result.downPaymentAmount, 25_000_000);
  assert.equal(result.financedAmount, 0);
  assert.equal(result.monthlyInstallment, 0);
  assert.equal(result.totalRentalEarned, 0);
  assert.equal(result.finalPropertyValue, Math.round(25_000_000 * Math.pow(1.12, 3)));
});

test('formatPkr formats Crore, Lac, and standard PKR correctly', () => {
  assert.equal(formatPkr(42_500_000), 'PKR 4.25 Cr');
  assert.equal(formatPkr(1_850_000), 'PKR 18.50 Lac');
  assert.equal(formatPkr(85_000), 'PKR 85,000');
  assert.equal(formatPkr(42_500_000, false), 'PKR 42,500,000');
});

test('validateBookingInput rejects missing/invalid fields and accepts valid Pakistani contact details', () => {
  const invalid = validateBookingInput({
    fullName: 'A',
    phone: '123',
    email: 'bad-email',
    propertyId: '',
    preferredDate: '',
    visitType: 'office-consultation',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.fullName);
  assert.ok(invalid.errors.phone);
  assert.ok(invalid.errors.email);
  assert.ok(invalid.errors.propertyId);
  assert.ok(invalid.errors.preferredDate);

  const valid = validateBookingInput({
    fullName: 'Tariq Mehmood',
    phone: '03075522866',
    email: 'tariq@example.pk',
    propertyId: 'prop-fortune-corridor',
    preferredDate: '2026-12-01',
    visitType: 'site-visit',
  });
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, {});
});

test('validateInquiryInput checks required inquiry fields', () => {
  const invalid = validateInquiryInput({
    fullName: '',
    phone: '03075522866',
    email: 'invalid',
    topic: 'Commercial',
    message: 'Hi',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.fullName);
  assert.ok(invalid.errors.email);
  assert.ok(invalid.errors.message);
});

test('buildWhatsAppUrl converts local 03075522866 into wa.me/923075522866 URL', () => {
  const url = buildWhatsAppUrl('03075522866', 'Hello Arish Property Consultants');
  assert.equal(
    url,
    'https://wa.me/923075522866?text=Hello%20Arish%20Property%20Consultants',
  );
});
