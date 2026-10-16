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
  monthlyIncome: number;
  gdsRatio: number;
  tdsRatio: number;
  stressTestRate: number;
  stressTestGDS: number;
  stressTestTDS: number;
  cashLeftGross: number;
  totalMonthlyHousingCosts: number;
}

export function calculateMonthlyMortgagePayment(
  principal: number,
  annualRate: number,
  amortizationYears: number,
  compoundingFrequency: string = 'semi-annual'
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
  let monthlyRate: number;
  
  if (compoundingFrequency === 'monthly') {
    monthlyRate = annualRateDecimal / 12;
  } else if (compoundingFrequency === 'semi-annual') {
    // Canadian standard: semi-annual compounding
    // Convert semi-annual rate to effective monthly rate
    const semiAnnualRate = annualRateDecimal / 2;
    const effectiveAnnualRate = Math.pow(1 + semiAnnualRate, 2) - 1;
    monthlyRate = Math.pow(1 + effectiveAnnualRate, 1/12) - 1;
  } else { // annual
    monthlyRate = Math.pow(1 + annualRateDecimal, 1/12) - 1;
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
  // GDS = (Monthly Mortgage Payment + Property Tax + Heating + % of Condo Fees) / Monthly Income
  const monthlyHousingCosts = monthlyMortgagePayment + propertyTaxMonthly + heatingCost + (condoFees * (condoFeeInclusionRate / 100));
  return (monthlyHousingCosts / monthlyIncome) * 100;
}

export function calculateTDSRatio(
  gdsAmount: number,
  monthlyDebtPayments: number,
  monthlyIncome: number
): number {
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
  rentalIncomeMethod: 'add-back' | 'offset' = 'offset'
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
    compoundingFrequency
  );
  
  // For display purposes, always show the base home expenses
  const monthlyHomeExpenses = inputs.propertyTaxMonthly + inputs.heatingCost + inputs.condoFees;
  
  // Calculate total expenses for GDS calculation
  let totalExpensesForGDS = inputs.propertyTaxMonthly + inputs.heatingCost + inputs.condoFees;
  
  // Deduct selected percentage of rental income from total expenses for GDS calculation
  if (inputs.isRentalIncomeEnabled && rentalIncomeMethod === 'offset') {
    const rentalOffset = inputs.rentalIncomeMonthly * (rentalIncomePortionRate / 100);
    totalExpensesForGDS = Math.max(0, totalExpensesForGDS - rentalOffset);
  }
  
  const adjustedHomeExpenses = totalExpensesForGDS;
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
    compoundingFrequency
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
    monthlyIncome,
    gdsRatio,
    tdsRatio,
    stressTestRate,
    stressTestGDS,
    stressTestTDS,
    cashLeftGross,
    totalMonthlyHousingCosts
  };
}

export function calculateIdealMortgageAmount(
  targetGdsRatio: number,
  inputs: MortgageInputs,
  compoundingFrequency: string = 'semi-annual',
  condoFeeInclusionRate: number = 50,
  rentalIncomePortionRate: number = 50,
  stressTestType: 'contract' | 'b20' = 'contract',
  rentalIncomeMethod: 'add-back' | 'offset' = 'offset'
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
    stressTestRate = Math.max(inputs.interestRate + 2, B20_BENCHMARK_RATE);
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
  
  // Calculate monthly rate based on compounding frequency
  let monthlyRate: number;
  const stressTestRateDecimal = stressTestRate / 100;
  
  if (compoundingFrequency === 'monthly') {
    monthlyRate = stressTestRateDecimal / 12;
  } else if (compoundingFrequency === 'semi-annual') {
    const semiAnnualRate = stressTestRateDecimal / 2;
    const effectiveAnnualRate = Math.pow(1 + semiAnnualRate, 2) - 1;
    monthlyRate = Math.pow(1 + effectiveAnnualRate, 1/12) - 1;
  } else {
    monthlyRate = Math.pow(1 + stressTestRateDecimal, 1/12) - 1;
  }
  
  if (monthlyRate === 0) {
    return maxMortgagePayment * numberOfPayments;
  }
  
  const mortgageAmount = maxMortgagePayment * ((1 - Math.pow(1 + monthlyRate, -numberOfPayments)) / monthlyRate);
  
  return Math.max(0, mortgageAmount);
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
