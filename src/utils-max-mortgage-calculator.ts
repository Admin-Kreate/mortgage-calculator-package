export interface MortgageResult {
  maxMortgageAmount: number,
  monthlyMortgagePayment: number,
  stressTestRate: number,
  gdsRatio: number,
  tdsRatio: number,
  monthlyGrossIncome: number,
  totalMonthlyHousingCosts: number,
  totalMonthlyDebtCosts: number,
  homeExpenses: number,
  includedCondoFees: number,
  cashLeftGross: number,
  isQualified: boolean,
}

export interface MortgageParams {
  grossAnnualIncome: number;
  monthlyDebtPayments: number;
  propertyTaxMonthly: number;
  condoFees: number;
  heatCosts: number;
  interestRate: number;
  amortizationYears: number;
  amortizationMonths: number;
  affordabilityLevel: number;
  rentalIncomeMonthly: number;
  includeRentalIncome: boolean;
}

export function formatCurrency(amount: number, detailed = false): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: detailed ? 2 : 0,
    maximumFractionDigits: detailed ? 2 : 0,
  }).format(amount);
}

export function formatPercentage(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

export function parseNumericValue(value: string): number {
  // Remove currency symbols, commas, and other non-numeric characters except decimal points
  const cleaned = value.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
}

export function formatNumericInput(value: number): string {
  return new Intl.NumberFormat('en-CA').format(value);
}

export function calculateMonthlyFromYearly(yearly: number): number {
  return yearly / 12;
}

export function calculateYearlyFromMonthly(monthly: number): number {
  return monthly * 12;
}

export function getAffordabilityLabel(level: number): string {
  if (level <= 33) return 'Conservative';
  if (level <= 66) return 'Baseline';
  return 'Standard';
}

export function getAffordabilityColor(level: number): string {
  if (level <= 33) return 'text-green-600';
  if (level <= 66) return 'text-yellow-600';
  return 'text-red-600';
}

type CompoundingFrequency = 'monthly' | 'semi-annual' | 'annual';

// MX-1: single normalisation point for compounding. The UI sends lowercase
// strings ('monthly', 'semi-annual', 'annual') but only Monthly, Semi-Annual
// and Annual are mathematically implemented below (Daily/Weekly/Bi-Weekly/
// Quarterly are not - the dropdown has been restricted to the supported
// three in max-mortgage-calculator.ts). Anything unrecognised falls back to
// the Canadian standard, semi-annual compounding.
function normalizeCompounding(compounding: string): CompoundingFrequency {
  const normalized = (compounding || '').trim().toLowerCase();
  if (normalized === 'monthly') return 'monthly';
  if (normalized === 'annual') return 'annual';
  return 'semi-annual';
}

// Converts a nominal annual rate into the effective monthly rate for the
// given compounding frequency. Used by BOTH the max-amount (stress test)
// side and the actual-payment (contract rate) side so they can never
// disagree (MX-1).
function effectiveMonthlyRateFromAnnual(annualRateDecimal: number, compounding: CompoundingFrequency): number {
  switch (compounding) {
    case 'monthly':
      return annualRateDecimal / 12;
    case 'annual':
      // Annual compounding: ((1 + r)^(1/12)) - 1
      return Math.pow(1 + annualRateDecimal, 1 / 12) - 1;
    case 'semi-annual':
    default:
      // Canadian standard: semi-annual compounding, monthly payments
      // Formula: ((1 + r/2)^(2/12)) - 1
      return Math.pow(1 + annualRateDecimal / 2, 2 / 12) - 1;
  }
}

function calculateMortgagePayment(principal: number, annualRate: number, amortizationMonths: number, compounding: string = 'semi-annual'): number {
  if (annualRate === 0) {
    return principal / amortizationMonths;
  }

  const annualRateDecimal = annualRate / 100;
  const normalizedCompounding = normalizeCompounding(compounding);
  const effectiveMonthlyRate = effectiveMonthlyRateFromAnnual(annualRateDecimal, normalizedCompounding);

  const numerator = effectiveMonthlyRate * Math.pow(1 + effectiveMonthlyRate, amortizationMonths);
  const denominator = Math.pow(1 + effectiveMonthlyRate, amortizationMonths) - 1;

  return principal * (numerator / denominator);
}

export function calculateMaxMortgage(params: {
  grossAnnualIncome: number;
  monthlyDebtPayments: number;
  propertyTaxMonthly: number;
  condoFees: number;
  heatCosts: number;
  interestRate: number;
  amortizationYears: number;
  amortizationMonths: number;
  affordabilityLevel: number;
  rentalIncomeMonthly: number;
  includeRentalIncome: boolean;
  stressTestRule: string;
  condoFeeInclusionRate: number;
  rentalIncomeRule: string;
  rentalIncomePortion: number;
  loanType: string;
  compounding: string;
  customGdsRatio?: number;
  customTdsRatio?: number;
}): MortgageResult {
  const {
    grossAnnualIncome,
    monthlyDebtPayments,
    propertyTaxMonthly,
    condoFees,
    heatCosts,
    interestRate,
    amortizationYears,
    amortizationMonths,
    affordabilityLevel,
    rentalIncomeMonthly,
    includeRentalIncome,
    stressTestRule,
    condoFeeInclusionRate,
    rentalIncomeRule,
    rentalIncomePortion,
    loanType,
    compounding,
  } = params;

  const monthlyGrossIncome = grossAnnualIncome / 12;
  const totalAmortizationMonths = (amortizationYears * 12) + amortizationMonths;
  
  // Apply stress test based on rule (CONTRACT uses contract rate, B20 uses minimum 5.25% or contract rate + 2%)
  let stressTestRate: number;
  if (stressTestRule === 'CONTRACT') {
    stressTestRate = interestRate;
  } else {
    stressTestRate = Math.max(5.25, interestRate + 2);
  }
  
  // Calculate fixed housing expenses with condo fees inclusion rate applied.
  // Computed before the rental income offset so the offset (MX-6) can be
  // capped against it.
  const includedCondoFees = condoFees * (condoFeeInclusionRate / 100);
  const fixedHousingCosts = propertyTaxMonthly + includedCondoFees + heatCosts;

  // Calculate rental income based on rule and portion
  let effectiveRentalIncome = 0;
  let rentalIncomeOffset = 0;

  if (includeRentalIncome) {
    const rentalPortion = rentalIncomePortion / 100;
    const rentalAmount = rentalIncomeMonthly * rentalPortion;

    if (rentalIncomeRule === 'ADD-BACK') {
      // Add back - Added to the income
      effectiveRentalIncome = rentalAmount;
    } else {
      // OFFSET - Set off against housing expenses. MX-6: the offset cannot
      // reduce housing costs below zero - it is capped at the fixed housing
      // costs it is meant to be offsetting, otherwise it becomes an
      // uncapped, mislabeled income add-back that manufactures unlimited
      // extra borrowing power.
      rentalIncomeOffset = Math.min(rentalAmount, fixedHousingCosts);
    }
  }
  const adjustedGrossIncome = monthlyGrossIncome + effectiveRentalIncome;

  // Use custom GDS/TDS ratios from form input (fallback to defaults)
  const customGds = params.customGdsRatio || 35;
  const customTds = params.customTdsRatio || 42;
  const gdsRatio = customGds / 100;
  const tdsRatio = customTds / 100;

  const maxHousingCosts = adjustedGrossIncome * gdsRatio;
  const maxTotalDebtCosts = adjustedGrossIncome * tdsRatio;

  // Available amount for mortgage payment (apply rental income offset for OFFSET rule)
  const availableForMortgage = Math.min(
    maxHousingCosts - fixedHousingCosts + rentalIncomeOffset,
    maxTotalDebtCosts - monthlyDebtPayments - fixedHousingCosts + rentalIncomeOffset
  );
  
  // MX-1: normalise once, use everywhere (amount side AND payment side).
  const normalizedCompounding = normalizeCompounding(compounding);

  // Calculate maximum mortgage amount using stress test rate
  let maxMortgageAmount = 0;
  if (availableForMortgage > 0) {
    const stressRateDecimal = stressTestRate / 100;
    const effectiveMonthlyStressRate = effectiveMonthlyRateFromAnnual(stressRateDecimal, normalizedCompounding);

    if (effectiveMonthlyStressRate > 0) {
      const denominator = effectiveMonthlyStressRate * Math.pow(1 + effectiveMonthlyStressRate, totalAmortizationMonths);
      const numerator = Math.pow(1 + effectiveMonthlyStressRate, totalAmortizationMonths) - 1;
      maxMortgageAmount = availableForMortgage * (numerator / denominator);
    } else {
      maxMortgageAmount = availableForMortgage * totalAmortizationMonths;
    }
  }

  // Calculate actual monthly payment at contract rate - same normalised
  // compounding as the amount side above (MX-1).
  const monthlyMortgagePayment = calculateMortgagePayment(maxMortgageAmount, interestRate, totalAmortizationMonths, normalizedCompounding);
  
  // Calculate actual GDS and TDS ratios
  const totalMonthlyHousingCosts = monthlyMortgagePayment + fixedHousingCosts;
  const totalMonthlyDebtCosts = totalMonthlyHousingCosts + monthlyDebtPayments;
  
  const actualGdsRatio = (totalMonthlyHousingCosts / adjustedGrossIncome) * 100;
  const actualTdsRatio = (totalMonthlyDebtCosts / adjustedGrossIncome) * 100;
  
  // Calculate cash left using full condo fees (no inclusion rate effect) and include full rental income (no percentage reduction)
  const totalMonthlyDebtCostsForCashLeft = monthlyMortgagePayment + (propertyTaxMonthly + condoFees + heatCosts) + monthlyDebtPayments;
  const baseIncomeForCashLeft = monthlyGrossIncome + (includeRentalIncome ? rentalIncomeMonthly : 0);
  const cashLeftGross = baseIncomeForCashLeft - totalMonthlyDebtCostsForCashLeft;
  
  const isQualified = actualGdsRatio <= (gdsRatio * 100) && actualTdsRatio <= (tdsRatio * 100);
  
  return {
    maxMortgageAmount: Math.round(maxMortgageAmount),
    monthlyMortgagePayment: Math.round(monthlyMortgagePayment * 100) / 100,
    stressTestRate: Math.round(stressTestRate * 100) / 100,
    gdsRatio: Math.round(customGds * 100) / 100, // Return the input GDS ratio
    tdsRatio: Math.round(customTds * 100) / 100, // Return the input TDS ratio
    monthlyGrossIncome: Math.round(adjustedGrossIncome * 100) / 100,
    totalMonthlyHousingCosts: Math.round(totalMonthlyHousingCosts * 100) / 100,
    totalMonthlyDebtCosts: Math.round(totalMonthlyDebtCosts * 100) / 100,
    homeExpenses: Math.round((propertyTaxMonthly + condoFees + heatCosts) * 100) / 100,
    includedCondoFees: Math.round(includedCondoFees * 100) / 100,
    cashLeftGross: Math.round(cashLeftGross * 100) / 100,
    isQualified,
  };
}