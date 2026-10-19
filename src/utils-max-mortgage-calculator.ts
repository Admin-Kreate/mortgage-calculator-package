export interface MortgageResult {
  maxMortgageAmount: number,
  monthlyMortgagePayment: number,
  stressTestRate: number,
  gdsRatio: number,
  tdsRatio: number,
  actualGdsRatio: number,
  actualTdsRatio: number,
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

type LoanType = 'REGULAR' | 'INTEREST_ONLY';

function normalizeLoanType(loanType: string | undefined): LoanType {
  return (loanType || '').trim().toUpperCase() === 'INTEREST_ONLY' ? 'INTEREST_ONLY' : 'REGULAR';
}

function calculateMortgagePayment(principal: number, annualRate: number, amortizationMonths: number, compounding: string = 'semi-annual', loanType: string = 'REGULAR'): number {
  const annualRateDecimal = annualRate / 100;
  const normalizedCompounding = normalizeCompounding(compounding);
  const normalizedLoanType = normalizeLoanType(loanType);

  if (normalizedLoanType === 'INTEREST_ONLY') {
    // Interest-only: the payment is simply principal x periodic rate, there
    // is no amortizing paydown component.
    if (annualRate === 0) return 0;
    const effectiveMonthlyRate = effectiveMonthlyRateFromAnnual(annualRateDecimal, normalizedCompounding);
    return principal * effectiveMonthlyRate;
  }

  if (annualRate === 0) {
    return principal / amortizationMonths;
  }

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

  // MX-3: use a proper undefined check - 0 is a valid, deliberately-entered
  // ratio and must not be replaced by the default.
  const customGds = params.customGdsRatio !== undefined ? params.customGdsRatio : 35;
  const rawCustomTds = params.customTdsRatio !== undefined ? params.customTdsRatio : 42;

  // MX-4: TDS must be >= GDS (TDS is a superset of GDS - it can never be the
  // tighter constraint). This is primarily enforced at input time in
  // max-mortgage-calculator.ts; this clamp is a defensive backstop so the
  // math can never produce a nonsense binding constraint even if an invalid
  // combination reaches this function some other way.
  const customTds = Math.max(rawCustomTds, customGds);

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
  const normalizedLoanType = normalizeLoanType(loanType);

  // Calculate maximum mortgage amount using stress test rate.
  //
  // NOTE (qualification, not payment display): this always uses the regular
  // amortizing-payment formula, regardless of loan type. An earlier revision
  // sized the max amount for INTEREST_ONLY as `availableForMortgage / rate`
  // (i.e. "principal = payment / rate"), which let a borrower qualify for
  // ~14% MORE mortgage by selecting Interest Only than Regular on identical
  // income - a non-amortizing, higher-risk product qualifying for a LARGER
  // loan. That is an invented underwriting rule with no cited lender/B-20
  // basis, so it was reverted: how much someone can borrow no longer depends
  // on loan type. What their payment on that amount looks like still does
  // (see calculateMortgagePayment below), which is what "Interest Only" is
  // meant to change - not the size of the mortgage itself.
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
  // compounding AND loan type as the amount side above (MX-1/MX-8).
  const monthlyMortgagePayment = calculateMortgagePayment(maxMortgageAmount, interestRate, totalAmortizationMonths, normalizedCompounding, normalizedLoanType);
  
  // Calculate actual GDS and TDS ratios
  const totalMonthlyHousingCosts = monthlyMortgagePayment + fixedHousingCosts;
  const totalMonthlyDebtCosts = totalMonthlyHousingCosts + monthlyDebtPayments;
  
  // MX-5-style guard: gross income can be 0 (slider minimum), guard the
  // division so these ratios never become Infinity/NaN.
  const actualGdsRatio = adjustedGrossIncome > 0 ? (totalMonthlyHousingCosts / adjustedGrossIncome) * 100 : 0;
  const actualTdsRatio = adjustedGrossIncome > 0 ? (totalMonthlyDebtCosts / adjustedGrossIncome) * 100 : 0;
  
  // MX-12: "Home Expenses (incl. rental offset)" must match its label - use
  // the same inclusion-rate-adjusted condo fee figure the qualifying math
  // used (fixedHousingCosts), and actually net out the rental offset.
  // (Moved up from below the return block so cashLeftGross, right below,
  // can be built from it - see MX-12 comment there for why.)
  const homeExpensesNetOfOffset = Math.max(0, fixedHousingCosts - rentalIncomeOffset);

  // MX-12: cashLeftGross previously used the FULL, un-portioned condoFees
  // and the FULL, un-portioned rentalIncomeMonthly regardless of which
  // rental rule/portion/condo-inclusion-rate was selected, while
  // homeExpensesNetOfOffset (above) correctly applied all three. That made
  // the four numbers actually shown to the user in the breakdown - mortgage,
  // debt, home expenses, cash left - silently fail to sum back to gross
  // income in most configurations (e.g. even at condoFeeInclusionRate=100%
  // with OFFSET, a portion < 100% left a gap; with ADD-BACK, the gap was
  // exactly the un-portioned rentalIncomeMonthly). That's confusing and
  // looks broken even though it never touched isQualified or
  // maxMortgageAmount, which don't depend on cashLeftGross at all.
  //
  // Fix: derive cashLeftGross from the SAME effective figures the
  // qualifying math already computed - adjustedGrossIncome (which already
  // reflects the selected rental rule and portion: it includes the
  // portioned rental amount for ADD-BACK, or excludes it entirely for
  // OFFSET because that portioned amount is instead netted out of
  // homeExpensesNetOfOffset below) and homeExpensesNetOfOffset (which
  // already reflects the selected condo-fee inclusion rate and the capped
  // rental offset). This is a deliberate choice: "Cash Left" now shows what
  // is left over on the SAME qualifying basis as the rest of the panel,
  // not a separate "true real-world cash flow" figure using full condo
  // fees/full rental income - so by construction:
  //   monthlyMortgagePayment + monthlyDebtPayments + homeExpensesNetOfOffset + cashLeftGross === adjustedGrossIncome
  // for both rental rules and all condo-inclusion-rates, always.
  const cashLeftGross = adjustedGrossIncome - monthlyMortgagePayment - homeExpensesNetOfOffset - monthlyDebtPayments;
  
  // MX-10: when adjustedGrossIncome is 0 (gross income slider can go to $0),
  // the guard above forces actualGdsRatio/actualTdsRatio to 0 to avoid
  // NaN/Infinity in the ratio *display*. But 0/0 is not "0% of budget used"
  // - it silently made isQualified evaluate to true (0 <= any positive
  // limit) even when fixed housing costs and/or existing debt were clearly
  // unaffordable on $0 income (e.g. $500/mo of property tax+condo+heat with
  // $0 income - cashLeftGross went negative, yet isQualified reported
  // true). Handle the zero/negative-income case explicitly: qualified only
  // if there are truly no housing/debt costs to cover either.
  const isQualified = adjustedGrossIncome > 0
    ? actualGdsRatio <= (gdsRatio * 100) && actualTdsRatio <= (tdsRatio * 100)
    : totalMonthlyHousingCosts <= 0 && totalMonthlyDebtCosts <= 0;
  
  return {
    maxMortgageAmount: Math.round(maxMortgageAmount),
    monthlyMortgagePayment: Math.round(monthlyMortgagePayment * 100) / 100,
    stressTestRate: Math.round(stressTestRate * 100) / 100,
    gdsRatio: Math.round(customGds * 100) / 100, // Return the input GDS ratio
    tdsRatio: Math.round(customTds * 100) / 100, // Return the input TDS ratio
    actualGdsRatio: Math.round(actualGdsRatio * 100) / 100,
    actualTdsRatio: Math.round(actualTdsRatio * 100) / 100,
    monthlyGrossIncome: Math.round(adjustedGrossIncome * 100) / 100,
    totalMonthlyHousingCosts: Math.round(totalMonthlyHousingCosts * 100) / 100,
    totalMonthlyDebtCosts: Math.round(totalMonthlyDebtCosts * 100) / 100,
    homeExpenses: Math.round(homeExpensesNetOfOffset * 100) / 100,
    includedCondoFees: Math.round(includedCondoFees * 100) / 100,
    cashLeftGross: Math.round(cashLeftGross * 100) / 100,
    isQualified,
  };
}