export interface MortgageInputs {
  mortgageAmount: number;
  grossAnnualIncome: number;
  monthlyDebtPayments: number;
  propertyTaxMonthly: number;
  condoFees: number;
  heatingCost: number;
  interestRate: number;
  amortizationYears: number;
  isRentalIncomeEnabled: boolean;
  rentalIncomeMonthly: number;
}

export interface CalculationResults {
  monthlyMortgagePayment: number;
  monthlyHomeExpenses: number;
  adjustedHomeExpenses: number;
  monthlyIncome: number;
  gdsRatio: number;
  tdsRatio: number;
  stressTestRate: number;
  stressTestGDS: number;
  stressTestTDS: number;
  cashLeftGross: number;
  totalMonthlyHousingCosts: number;
  stressTestMonthlyPayment: number;
}

// Number of compounding periods per year for each supported compounding frequency. Used to
// convert a nominal annual rate into an effective monthly rate: periodicRate = annualRate / n,
// then round-trip through the effective annual rate to get the effective monthly rate. Shared
// by calculateMonthlyMortgagePayment and calculateIdealMortgageAmount so the two can't drift.
const COMPOUNDING_PERIODS_PER_YEAR: Record<string, number> = {
  'daily': 365,
  'weekly': 52,
  'bi-weekly': 26,
  'monthly': 12,
  'quarterly': 4,
  'semi-annual': 2,
};

function getEffectiveMonthlyRate(annualRateDecimal: number, compoundingFrequency: string): number {
  // Default to semi-annual, the Canadian statutory standard, for any unrecognized value.
  const n = COMPOUNDING_PERIODS_PER_YEAR[compoundingFrequency] ?? 2;
  const periodicRate = annualRateDecimal / n;
  const effectiveAnnualRate = Math.pow(1 + periodicRate, n) - 1;
  return Math.pow(1 + effectiveAnnualRate, 1 / 12) - 1;
}

export type LoanType = 'regular' | 'interest-only';

export function calculateMonthlyMortgagePayment(
  principal: number,
  annualRate: number,
  amortizationYears: number,
  compoundingFrequency: string = 'semi-annual',
  loanType: LoanType = 'regular'
): number {
  // Note: annualRate === 0 is a valid input (the rate slider's own minimum is 0) and must
  // fall through to the monthlyRate === 0 branch below, not be treated as invalid. Also guard
  // explicitly against non-finite inputs: a NaN/Infinity principal fails every "<= 0"
  // comparison below (those comparisons are never true for NaN/Infinity) and would otherwise
  // silently fall through and poison the payment - and everything downstream (GDS/TDS) - with
  // NaN instead of failing safe to 0.
  if (
    !Number.isFinite(principal) || !Number.isFinite(annualRate) || !Number.isFinite(amortizationYears) ||
    principal <= 0 || annualRate < 0 || amortizationYears <= 0
  ) return 0;

  // Convert annual rate to decimal
  const annualRateDecimal = annualRate / 100;

  // Calculate effective monthly rate based on compounding frequency
  const monthlyRate = getEffectiveMonthlyRate(annualRateDecimal, compoundingFrequency);

  // Interest-only: no principal is ever repaid, so the payment is simply the interest on the
  // outstanding (full) balance for one period. A 0% rate legitimately produces a $0 payment
  // here - that's correct for interest-only (there's no interest to pay).
  if (loanType === 'interest-only') {
    return principal * monthlyRate;
  }

  const numberOfPayments = amortizationYears * 12;

  if (monthlyRate === 0) {
    return principal / numberOfPayments;
  }

  const monthlyPayment = principal *
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  return monthlyPayment;
}

export function calculateGDSRatio(
  monthlyMortgagePayment: number,
  propertyTaxMonthly: number,
  heatingCost: number,
  condoFees: number,
  monthlyIncome: number,
  condoFeeInclusionRate: number = 50
): number {
  // With no (or negative) income, the ratio is undefined rather than infinite/NaN - callers
  // should treat this as "cannot be calculated" and display a message instead of a number.
  // Also fail safe (return 0 rather than propagate) if any input is non-finite: a plain
  // "monthlyIncome <= 0" check alone does not catch a NaN monthlyIncome, since NaN comparisons
  // are always false and would otherwise silently divide by NaN.
  if (!Number.isFinite(monthlyIncome) || monthlyIncome <= 0) return 0;
  if (![monthlyMortgagePayment, propertyTaxMonthly, heatingCost, condoFees].every(Number.isFinite)) return 0;
  // GDS = (Monthly Mortgage Payment + Property Tax + Heating + % of Condo Fees) / Monthly Income
  const monthlyHousingCosts = monthlyMortgagePayment + propertyTaxMonthly + heatingCost + (condoFees * (condoFeeInclusionRate / 100));
  return (monthlyHousingCosts / monthlyIncome) * 100;
}

export function calculateTDSRatio(
  gdsAmount: number,
  monthlyDebtPayments: number,
  monthlyIncome: number
): number {
  // See calculateGDSRatio above: guard against zero/negative/non-finite income so callers
  // never see Infinity/NaN.
  if (!Number.isFinite(monthlyIncome) || monthlyIncome <= 0) return 0;
  if (!Number.isFinite(gdsAmount) || !Number.isFinite(monthlyDebtPayments)) return 0;
  // TDS = GDS Amount + Other Monthly Debt Payments / Monthly Income
  const totalMonthlyDebt = gdsAmount + monthlyDebtPayments;
  return (totalMonthlyDebt / monthlyIncome) * 100;
}

// Single source of truth for the B-20 qualifying benchmark rate. Previously this value was
// defined twice and out of sync: getStressTestRate() used 5.20% while the live UI and
// calculateAllRatios's default param used 5.25%. getStressTestRate() itself is dead code (never
// called anywhere) - this is a cleanup of the duplicated constant, not a live-behavior change.
export const B20_BENCHMARK_RATE = 5.25;

export function getStressTestRate(contractRate: number): number {
  // Canadian stress test: higher of contract rate + 2% or Bank of Canada 5-year benchmark (B-20 rate)
  return Math.max(contractRate + 2, B20_BENCHMARK_RATE);
}

export function calculateAllRatios(
  inputs: MortgageInputs,
  compoundingFrequency: string = 'semi-annual',
  benchmarkStressRate: number = B20_BENCHMARK_RATE,
  condoFeeInclusionRate: number = 50,
  rentalIncomePortionRate: number = 50,
  stressTestType: 'contract' | 'b20' = 'contract',
  rentalIncomeMethod: 'add-back' | 'offset' = 'offset',
  // The "Regular"/"Interest Only" selector in the UI was previously rendered but never actually
  // read - this function always computed the amortizing payment regardless of which one was
  // selected. Threading it through here (and into calculateIdealMortgageAmount below) makes the
  // toggle real.
  loanType: LoanType = 'regular'
): CalculationResults {
  // Calculate total monthly income including rental income
  const baseMonthlyIncome = inputs.grossAnnualIncome / 12;
  let monthlyIncome = baseMonthlyIncome;

  // Apply rental income based on method
  if (inputs.isRentalIncomeEnabled && rentalIncomeMethod === 'add-back') {
    const rentalIncomeContribution = inputs.rentalIncomeMonthly * (rentalIncomePortionRate / 100);
    monthlyIncome = baseMonthlyIncome + rentalIncomeContribution;
  }

  const monthlyMortgagePayment = calculateMonthlyMortgagePayment(
    inputs.mortgageAmount,
    inputs.interestRate,
    inputs.amortizationYears,
    compoundingFrequency,
    loanType
  );
  
  // For display purposes, always show the base (unadjusted) home expenses
  const monthlyHomeExpenses = inputs.propertyTaxMonthly + inputs.heatingCost + inputs.condoFees;

  // Home expenses net of the rental income offset - this is the figure that actually
  // corresponds to the "(incl. rental offset)" label in the UI. Previously this was computed
  // (as totalExpensesForGDS) but never returned, so the UI rendered the unadjusted
  // monthlyHomeExpenses next to a label claiming it included the offset. Clamped at 0: rental
  // income can cancel out home expenses but should never make them negative.
  let adjustedHomeExpenses = monthlyHomeExpenses;
  if (inputs.isRentalIncomeEnabled && rentalIncomeMethod === 'offset') {
    const rentalOffset = inputs.rentalIncomeMonthly * (rentalIncomePortionRate / 100);
    adjustedHomeExpenses = Math.max(0, monthlyHomeExpenses - rentalOffset);
  }

  const totalMonthlyHousingCosts = monthlyMortgagePayment + monthlyHomeExpenses;
  
  // For GDS calculation, use base expenses and subtract rental income from total
  let gdsPropertyTax = inputs.propertyTaxMonthly;
  let gdsHeating = inputs.heatingCost;
  let gdsCondoFees = inputs.condoFees;
  
  // Apply rental income offset to GDS calculation using selected percentage
  if (inputs.isRentalIncomeEnabled && rentalIncomeMethod === 'offset') {
    const rentalOffset = inputs.rentalIncomeMonthly * (rentalIncomePortionRate / 100);
    const totalGDSExpenses = gdsPropertyTax + gdsHeating + (gdsCondoFees * (condoFeeInclusionRate / 100));
    // Clamp: the rental offset can zero out GDS expenses but must never drive them negative
    // (which would credit the "surplus" rent against the mortgage payment itself).
    const adjustedGDSExpenses = Math.max(0, totalGDSExpenses - rentalOffset);

    // Proportionally reduce each component to maintain the ratio
    const reductionRatio = totalGDSExpenses > 0 ? adjustedGDSExpenses / totalGDSExpenses : 1;
    gdsPropertyTax = gdsPropertyTax * reductionRatio;
    gdsHeating = gdsHeating * reductionRatio;
    gdsCondoFees = gdsCondoFees * reductionRatio;
  }

  const gdsRatio = calculateGDSRatio(
    monthlyMortgagePayment,
    gdsPropertyTax,
    gdsHeating,
    gdsCondoFees,
    monthlyIncome,
    condoFeeInclusionRate
  );
  
  const gdsAmount = monthlyMortgagePayment + gdsPropertyTax + gdsHeating + (gdsCondoFees * (condoFeeInclusionRate / 100));
  const tdsRatio = calculateTDSRatio(gdsAmount, inputs.monthlyDebtPayments, monthlyIncome);
  
  // Stress test calculations based on type
  let stressTestRate: number;
  if (stressTestType === 'contract') {
    stressTestRate = inputs.interestRate; // Use contract rate as-is for CONTRACT
  } else { // b20
    stressTestRate = Math.max(inputs.interestRate + 2, benchmarkStressRate); // Higher of (rate + 2%) or 5.25%
  }
  const stressTestMortgagePayment = calculateMonthlyMortgagePayment(
    inputs.mortgageAmount,
    stressTestRate,
    inputs.amortizationYears,
    compoundingFrequency,
    loanType
  );
  
  const stressTestGDS = calculateGDSRatio(
    stressTestMortgagePayment,
    gdsPropertyTax,
    gdsHeating,
    gdsCondoFees,
    monthlyIncome,
    condoFeeInclusionRate
  );
  
  const stressTestGDSAmount = stressTestMortgagePayment + gdsPropertyTax + gdsHeating + (gdsCondoFees * (condoFeeInclusionRate / 100));
  const stressTestTDS = calculateTDSRatio(stressTestGDSAmount, inputs.monthlyDebtPayments, monthlyIncome);
  
  // Cash left calculation based on rental income method
  let cashLeftIncome = baseMonthlyIncome;
  let cashLeftExpenses = monthlyMortgagePayment + monthlyHomeExpenses + inputs.monthlyDebtPayments;
  
  // Both methods include rental income in cash left income calculation
  if (inputs.isRentalIncomeEnabled) {
    cashLeftIncome = baseMonthlyIncome + inputs.rentalIncomeMonthly;
  }
  
  const cashLeftGross = cashLeftIncome - cashLeftExpenses;
  
  return {
    monthlyMortgagePayment,
    monthlyHomeExpenses,
    adjustedHomeExpenses,
    monthlyIncome,
    gdsRatio,
    tdsRatio,
    stressTestRate,
    stressTestGDS,
    stressTestTDS,
    cashLeftGross,
    totalMonthlyHousingCosts,
    stressTestMonthlyPayment: stressTestMortgagePayment
  };
}

export function calculateIdealMortgageAmount(
  targetGdsRatio: number,
  inputs: MortgageInputs,
  compoundingFrequency: string = 'semi-annual',
  condoFeeInclusionRate: number = 50,
  rentalIncomePortionRate: number = 50,
  stressTestType: 'contract' | 'b20' = 'contract',
  rentalIncomeMethod: 'add-back' | 'offset' = 'offset',
  // Mirrors the loanType parameter added to calculateAllRatios: this function back-solves a
  // loan amount that reproduces the exact target GDS ratio when the SAME settings are fed back
  // into calculateAllRatios, so it must honour loanType too or the two would disagree in
  // interest-only mode.
  loanType: LoanType = 'regular',
  // Same overridable benchmark calculateAllRatios exposes - this sibling function previously
  // hardcoded the constant directly with no way for a caller to override it.
  benchmarkStressRate: number = B20_BENCHMARK_RATE
): number {
  // Calculate monthly income
  const baseMonthlyIncome = inputs.grossAnnualIncome / 12;
  let monthlyIncome = baseMonthlyIncome;
  
  if (inputs.isRentalIncomeEnabled && rentalIncomeMethod === 'add-back') {
    const rentalIncomeContribution = inputs.rentalIncomeMonthly * (rentalIncomePortionRate / 100);
    monthlyIncome = baseMonthlyIncome + rentalIncomeContribution;
  }
  
  // Calculate GDS home expenses with rental income offset
  let gdsPropertyTax = inputs.propertyTaxMonthly;
  let gdsHeating = inputs.heatingCost;
  let gdsCondoFees = inputs.condoFees;
  
  if (inputs.isRentalIncomeEnabled && rentalIncomeMethod === 'offset') {
    const rentalOffset = inputs.rentalIncomeMonthly * (rentalIncomePortionRate / 100);
    const totalGDSExpenses = gdsPropertyTax + gdsHeating + (gdsCondoFees * (condoFeeInclusionRate / 100));
    // Clamp: same reasoning as calculateAllRatios - rental offset must not drive GDS expenses negative.
    const adjustedGDSExpenses = Math.max(0, totalGDSExpenses - rentalOffset);

    const reductionRatio = totalGDSExpenses > 0 ? adjustedGDSExpenses / totalGDSExpenses : 1;
    gdsPropertyTax = gdsPropertyTax * reductionRatio;
    gdsHeating = gdsHeating * reductionRatio;
    gdsCondoFees = gdsCondoFees * reductionRatio;
  }
  
  // Calculate stress test rate
  let stressTestRate: number;
  if (stressTestType === 'contract') {
    stressTestRate = inputs.interestRate;
  } else {
    stressTestRate = Math.max(inputs.interestRate + 2, benchmarkStressRate);
  }
  
  // Calculate target GDS amount based on target ratio
  const targetGdsAmount = monthlyIncome * (targetGdsRatio / 100);
  
  // Calculate home expenses for GDS calculation
  const homeExpensesForGds = gdsPropertyTax + gdsHeating + (gdsCondoFees * (condoFeeInclusionRate / 100));
  
  // Calculate maximum mortgage payment
  const maxMortgagePayment = targetGdsAmount - homeExpensesForGds;
  
  if (maxMortgagePayment <= 0) return 0;
  
  // Calculate mortgage amount from payment using stress test rate
  const numberOfPayments = inputs.amortizationYears * 12;

  // Calculate monthly rate based on compounding frequency (shared helper - see
  // calculateMonthlyMortgagePayment).
  const stressTestRateDecimal = stressTestRate / 100;
  const monthlyRate = getEffectiveMonthlyRate(stressTestRateDecimal, compoundingFrequency);

  if (loanType === 'interest-only') {
    // Interest-only payment = principal * monthlyRate, so the inverse is a simple division. At
    // a 0% monthly rate the payment is $0 no matter the principal, so there's no unique amount
    // that produces a given non-zero target payment - treat that as unreachable (return 0, the
    // same sentinel already used for "no amount works") rather than guessing/returning Infinity.
    if (monthlyRate === 0) return 0;
    return Math.max(0, maxMortgagePayment / monthlyRate);
  }

  if (monthlyRate === 0) {
    return maxMortgagePayment * numberOfPayments;
  }

  const mortgageAmount = maxMortgagePayment * ((1 - Math.pow(1 + monthlyRate, -numberOfPayments)) / monthlyRate);

  return Math.max(0, mortgageAmount);
}

// CMHC's maximum GDS/TDS limits - used as the default basis for "what you qualify for" below.
export const MAX_LIMITS = { gds: 39, tds: 44 } as const;
// Most lenders' preferred (tighter) GDS/TDS limits, used alongside MAX_LIMITS to classify a
// pair of ratios into a plain-language status below.
export const PREFERRED_LIMITS = { gds: 32, tds: 40 } as const;

export type RatioStatusLevel = 'within' | 'borderline' | 'over';

// Plain-language verdict for a pair of GDS/TDS ratios: within the lender-preferred range,
// borderline (above preferred but still within CMHC's maximum), or over the maximum limit.
export function getRatioStatus(gds: number, tds: number): { level: RatioStatusLevel; headline: string; detail: string } {
  const within = gds <= PREFERRED_LIMITS.gds && tds <= PREFERRED_LIMITS.tds;
  const borderline = !within && gds <= MAX_LIMITS.gds && tds <= MAX_LIMITS.tds;

  if (within) {
    return {
      level: 'within',
      headline: 'Within lender guidelines',
      detail: 'Your GDS and TDS ratios are within the range most lenders prefer for approval.'
    };
  }
  if (borderline) {
    return {
      level: 'borderline',
      headline: 'Borderline — CMHC maximum range',
      detail: 'Your ratios are above what most lenders prefer but still within CMHC’s maximum limits, so approval may depend on your credit and lender.'
    };
  }
  return {
    level: 'over',
    headline: 'Over the limit',
    detail: 'Your ratios are above the maximum guidelines most lenders use, which will make it difficult to qualify at this amount.'
  };
}

export interface DebtServiceSettings {
  compoundingFrequency: string;
  condoFeeInclusionRate: number;
  rentalIncomePortionRate: number;
  stressTestType: 'contract' | 'b20';
  rentalIncomeMethod: 'add-back' | 'offset';
  loanType: LoanType;
  benchmarkStressRate?: number;
}

export interface QualificationResult {
  qualifyingRate: number;
  maxMortgage: number;
  bindingRatio: 'gds' | 'tds';
  maxMonthlyPayment: number;
  requiredAnnualIncome: number;
  monthlyRoomGds: number;
  monthlyRoomTds: number;
}

// Closed-form inverse of calculateMonthlyMortgagePayment's regular/amortizing branch (PV-of-
// annuity). Qualification (max mortgage / required income) always uses this - never the
// interest-only formula - regardless of the loan type selected in the UI: qualifying math is
// deliberately loanType-independent (matches the same policy choice in the sibling
// max-mortgage-calculator).
function invertRegularPayment(
  payment: number,
  annualRate: number,
  amortizationYears: number,
  compoundingFrequency: string
): number {
  if (
    !Number.isFinite(payment) || payment <= 0 ||
    !Number.isFinite(annualRate) || annualRate < 0 ||
    !Number.isFinite(amortizationYears) || amortizationYears <= 0
  ) return 0;

  const numberOfPayments = amortizationYears * 12;
  const monthlyRate = getEffectiveMonthlyRate(annualRate / 100, compoundingFrequency);

  if (monthlyRate === 0) return payment * numberOfPayments;

  return payment * (1 - Math.pow(1 + monthlyRate, -numberOfPayments)) / monthlyRate;
}

// Computes the largest mortgage, and the minimum income, the entered numbers support at the
// given GDS/TDS limits (CMHC maximums by default) by inverting the standard GDS/TDS formulas.
export function calculateQualification(
  inputs: MortgageInputs,
  settings: DebtServiceSettings,
  limits: { gds: number; tds: number } = MAX_LIMITS
): QualificationResult {
  const benchmarkStressRate = settings.benchmarkStressRate ?? B20_BENCHMARK_RATE;
  const qualifyingRate = settings.stressTestType === 'b20'
    ? Math.max(inputs.interestRate + 2, benchmarkStressRate)
    : inputs.interestRate;

  const g = limits.gds / 100;
  const t = limits.tds / 100;

  const baseMonthlyIncome = inputs.grossAnnualIncome / 12;
  const B = Number.isFinite(baseMonthlyIncome) ? baseMonthlyIncome : 0;

  // Rental add-back contributes to income; offset instead reduces home costs below. Only one
  // applies at a time (mirrors calculateAllRatios).
  const rentalContribution = inputs.isRentalIncomeEnabled && Number.isFinite(inputs.rentalIncomeMonthly)
    ? inputs.rentalIncomeMonthly * (settings.rentalIncomePortionRate / 100)
    : 0;
  const Ra = inputs.isRentalIncomeEnabled && settings.rentalIncomeMethod === 'add-back' ? rentalContribution : 0;

  // GDS home costs (property tax + heat + condo-inclusion%), net of the rental offset - same
  // proportional-reduction/clamp logic as calculateAllRatios, so this stays consistent with the
  // displayed ratios.
  let gdsPropertyTax = inputs.propertyTaxMonthly;
  let gdsHeating = inputs.heatingCost;
  let gdsCondoFees = inputs.condoFees;
  if (inputs.isRentalIncomeEnabled && settings.rentalIncomeMethod === 'offset') {
    const totalGdsExpenses = gdsPropertyTax + gdsHeating + (gdsCondoFees * (settings.condoFeeInclusionRate / 100));
    const adjustedGdsExpenses = Math.max(0, totalGdsExpenses - rentalContribution);
    const reductionRatio = totalGdsExpenses > 0 ? adjustedGdsExpenses / totalGdsExpenses : 1;
    gdsPropertyTax *= reductionRatio;
    gdsHeating *= reductionRatio;
    gdsCondoFees *= reductionRatio;
  }
  const homeCosts = gdsPropertyTax + gdsHeating + (gdsCondoFees * (settings.condoFeeInclusionRate / 100));

  const D = Number.isFinite(inputs.monthlyDebtPayments) ? inputs.monthlyDebtPayments : 0;

  // --- Max mortgage & required income: always the regular/amortizing qualifying formula,
  // regardless of settings.loanType.
  const termGds = (B + Ra) * g - homeCosts;
  const termTds = (B + Ra) * t - homeCosts - D;
  const maxPayment = Math.min(termGds, termTds);
  const bindingRatio: 'gds' | 'tds' = termGds <= termTds ? 'gds' : 'tds';

  const maxMortgage = maxPayment > 0
    ? invertRegularPayment(maxPayment, qualifyingRate, inputs.amortizationYears, settings.compoundingFrequency)
    : 0;
  const maxMonthlyPayment = calculateMonthlyMortgagePayment(
    maxMortgage, qualifyingRate, inputs.amortizationYears, settings.compoundingFrequency, 'regular'
  );

  const currentPI = calculateMonthlyMortgagePayment(
    inputs.mortgageAmount, qualifyingRate, inputs.amortizationYears, settings.compoundingFrequency, 'regular'
  );
  const H = currentPI + homeCosts;
  const requiredAnnualIncome = 12 * Math.max(0, Math.max(H / g, (H + D) / t) - Ra);

  // --- Monthly room: headroom against the ratios as actually DISPLAYED (settings.loanType +
  // contract/b20 as selected) - deliberately NOT the forced-regular qualification numbers
  // above. This answers "how much headroom do my current numbers leave", not "what could I
  // qualify for".
  const displayedIncome = B + Ra;
  const displayedPayment = calculateMonthlyMortgagePayment(
    inputs.mortgageAmount, qualifyingRate, inputs.amortizationYears, settings.compoundingFrequency, settings.loanType
  );
  const currentGdsCosts = displayedPayment + homeCosts;
  const monthlyRoomGds = g * displayedIncome - currentGdsCosts;
  const monthlyRoomTds = t * displayedIncome - (currentGdsCosts + D);

  return {
    qualifyingRate,
    maxMortgage,
    bindingRatio,
    maxMonthlyPayment,
    requiredAnnualIncome,
    monthlyRoomGds,
    monthlyRoomTds
  };
}

export interface DebtItems {
  carLoanMonthly: number;
  studentLoanMonthly: number;
  otherLoanMonthly: number;
  creditCardBalance: number;
  lineOfCreditBalance: number;
  helocBalance: number;
  helocRate: number;
}

export interface DebtObligations {
  carLoan: number;
  studentLoan: number;
  otherLoans: number;
  creditCard: number;
  lineOfCredit: number;
  heloc: number;
  total: number;
}

export const REVOLVING_MIN_PAYMENT_RATE = 0.03;
export const HELOC_QUALIFYING_AMORTIZATION_YEARS = 25;

// Negative/non-finite balances or monthly amounts fail safe to 0 rather than poisoning the
// total with NaN/negative debt "relief".
function safeNonNegative(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

// Converts the six itemized debt fields into the monthly obligation each one actually counts
// as toward TDS: car/student/other loans pass through as entered, credit card and unsecured
// LOC balances convert at REVOLVING_MIN_PAYMENT_RATE (3% of balance/month), and the HELOC
// converts via a standard amortizing payment over HELOC_QUALIFYING_AMORTIZATION_YEARS at the
// HELOC's own rate.
export function calculateDebtObligations(debts: DebtItems): DebtObligations {
  const carLoan = safeNonNegative(debts.carLoanMonthly);
  const studentLoan = safeNonNegative(debts.studentLoanMonthly);
  const otherLoans = safeNonNegative(debts.otherLoanMonthly);
  const creditCardBalance = safeNonNegative(debts.creditCardBalance);
  const lineOfCreditBalance = safeNonNegative(debts.lineOfCreditBalance);
  const helocBalance = safeNonNegative(debts.helocBalance);
  // A negative/NaN HELOC rate clamps to 0% (still amortized -> balance/300), it does NOT zero
  // out the obligation the way a non-finite/negative balance does above.
  const helocRate = Number.isFinite(debts.helocRate) && debts.helocRate > 0 ? debts.helocRate : 0;

  const creditCard = creditCardBalance * REVOLVING_MIN_PAYMENT_RATE;
  const lineOfCredit = lineOfCreditBalance * REVOLVING_MIN_PAYMENT_RATE;

  // Secured HELOC: standard amortizing payment over 25y at helocRate. Using 'monthly'
  // compounding here (not the mortgage default semi-annual) makes the effective monthly rate
  // exactly helocRate/12, the nominal-rate convention LOCs use - unlike mortgages, they're not
  // semi-annual-compounded. At 0% this naturally falls through to helocBalance/300, and a 0
  // balance is guarded to $0 by calculateMonthlyMortgagePayment's own principal<=0 check.
  const heloc = calculateMonthlyMortgagePayment(
    helocBalance, helocRate, HELOC_QUALIFYING_AMORTIZATION_YEARS, 'monthly', 'regular'
  );

  const total = carLoan + studentLoan + otherLoans + creditCard + lineOfCredit + heloc;

  return { carLoan, studentLoan, otherLoans, creditCard, lineOfCredit, heloc, total };
}

export function getStressTestStatus(gdsRatio: number, tdsRatio: number): {
  level: 'excellent' | 'good' | 'caution' | 'poor';
  color: string;
  message: string;
} {
  // Canadian mortgage qualification guidelines
  if (gdsRatio <= 32 && tdsRatio <= 40) {
    return {
      level: 'excellent',
      color: 'text-green-600',
      message: 'Excellent - Well within qualification guidelines'
    };
  } else if (gdsRatio <= 35 && tdsRatio <= 42) {
    return {
      level: 'good',
      color: 'text-yellow-600',
      message: 'Good - May qualify with strong credit and down payment'
    };
  } else if (gdsRatio <= 39 && tdsRatio <= 44) {
    return {
      level: 'caution',
      color: 'text-orange-600',
      message: 'Caution - May face challenges qualifying'
    };
  } else {
    return {
      level: 'poor',
      color: 'text-red-600',
      message: 'High risk - Unlikely to qualify without changes'
    };
  }
}

export function formatCurrencyDetailed(amount: any) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}
