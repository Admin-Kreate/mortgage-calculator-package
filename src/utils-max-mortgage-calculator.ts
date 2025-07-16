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

function calculateMortgagePayment(principal: number, annualRate: number, amortizationMonths: number, compounding: string = 'Semi-Annual'): number {
  if (annualRate === 0) {
    return principal / amortizationMonths;
  }
  
  // Convert annual rate to effective monthly rate based on compounding frequency
  let effectiveMonthlyRate: number;
  const annualRateDecimal = annualRate / 100;
  
  switch (compounding) {
    case 'Monthly':
      effectiveMonthlyRate = annualRateDecimal / 12;
      break;
    case 'Semi-Annual':
      // Canadian standard: semi-annual compounding, monthly payments
      // Formula: ((1 + r/2)^(2/12)) - 1
      effectiveMonthlyRate = Math.pow(1 + annualRateDecimal / 2, 2/12) - 1;
      break;
    case 'Annual':
      // Annual compounding: ((1 + r)^(1/12)) - 1
      effectiveMonthlyRate = Math.pow(1 + annualRateDecimal, 1/12) - 1;
      break;
    default:
      effectiveMonthlyRate = Math.pow(1 + annualRateDecimal / 2, 2/12) - 1;
  }
  
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
  
  // Calculate rental income based on rule and portion
  let effectiveRentalIncome = 0;
  let rentalIncomeOffset = 0;
  
  if (includeRentalIncome) {
    const rentalPortion = rentalIncomePortion / 100;
    const rentalAmount = rentalIncomeMonthly * rentalPortion;
    
    if (rentalIncomeRule === 'ADD-BACK') {
      // Add back - Added to the income
      effectiveRentalIncome = rentalAmount;
    } else { // OFFSET
      // Set off - subtracted from expenses
      rentalIncomeOffset = rentalAmount;
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
  
  // Calculate fixed housing expenses with condo fees inclusion rate applied
  const includedCondoFees = condoFees * (condoFeeInclusionRate / 100);
  const fixedHousingCosts = propertyTaxMonthly + includedCondoFees + heatCosts;
  
  // Available amount for mortgage payment (apply rental income offset for OFFSET rule)
  const availableForMortgage = Math.min(
    maxHousingCosts - fixedHousingCosts + rentalIncomeOffset,
    maxTotalDebtCosts - monthlyDebtPayments - fixedHousingCosts + rentalIncomeOffset
  );
  
  // Calculate maximum mortgage amount using stress test rate
  let maxMortgageAmount = 0;
  if (availableForMortgage > 0) {
    // Use same compounding logic for stress test calculation
    let effectiveMonthlyStressRate: number;
    const stressRateDecimal = stressTestRate / 100;
    
    switch (compounding) {
      case 'monthly':
        effectiveMonthlyStressRate = stressRateDecimal / 12;
        break;
      case 'semi-annual':
        effectiveMonthlyStressRate = Math.pow(1 + stressRateDecimal / 2, 2/12) - 1;
        break;
      case 'annual':
        effectiveMonthlyStressRate = Math.pow(1 + stressRateDecimal, 1/12) - 1;
        break;
      default:
        effectiveMonthlyStressRate = Math.pow(1 + stressRateDecimal / 2, 2/12) - 1;
    }
    
    if (effectiveMonthlyStressRate > 0) {
      const denominator = effectiveMonthlyStressRate * Math.pow(1 + effectiveMonthlyStressRate, totalAmortizationMonths);
      const numerator = Math.pow(1 + effectiveMonthlyStressRate, totalAmortizationMonths) - 1;
      maxMortgageAmount = availableForMortgage * (numerator / denominator);
    } else {
      maxMortgageAmount = availableForMortgage * totalAmortizationMonths;
    }
  }
  
  // Calculate actual monthly payment at contract rate
  const monthlyMortgagePayment = calculateMortgagePayment(maxMortgageAmount, interestRate, totalAmortizationMonths, compounding);
  
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