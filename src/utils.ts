export interface MortgageData {
  purchasePrice: number;
  downPaymentAmount: number;
  downPaymentPercentage: number;
  interestRate: number;
  amortizationPeriod: number;
  paymentFrequency: string;
  rateType: string;
  termLength: number;
  propertyTaxes: number;
  heatingCosts: number;
  condoFees: number;
  extraPaymentType: string;
  extraPaymentAmount: number;
  extraPaymentFrequency: string;
}

export const defaultMortgageData: MortgageData = {
  purchasePrice: 500000,
  downPaymentAmount: 100000,
  downPaymentPercentage: 20,
  interestRate: 4.75,
  amortizationPeriod: 25,
  paymentFrequency: 'monthly',
  rateType: 'fixed',
  termLength: 5,
  propertyTaxes: 3600,
  heatingCosts: 1200,
  condoFees: 0,
  extraPaymentType: 'none',
  extraPaymentAmount: 0,
  extraPaymentFrequency: 'monthly',
};

// Calculate mortgage payment and other values
export function calculateMortgage(data: MortgageData) {
  // Calculate mortgage amount (purchase price - down payment)
  const mortgageAmount = data.purchasePrice - data.downPaymentAmount;
  
  // Calculate CMHC mortgage insurance if down payment is less than 20%.
  // Down payments below 5% aren't legal for an insured mortgage in Canada;
  // the UI (calculator.ts) is expected to enforce that 5% floor on input.
  // As a defensive fallback here, anything under 10% (including, in error,
  // under 5%) is still charged the highest premium tier below rather than
  // silently falling through with a 0% rate/no premium.
  let mortgageInsurance = 0;
  if (data.downPaymentPercentage < 20) {
    let rate: number;
    if (data.downPaymentPercentage >= 15) {
      rate = 0.028;
    } else if (data.downPaymentPercentage >= 10) {
      rate = 0.031;
    } else {
      // 5%-9.99% down, and a defensive fallback for anything lower.
      rate = 0.04;
    }

    mortgageInsurance = mortgageAmount * rate;
  }
  
  // Total mortgage including insurance
  const totalMortgage = mortgageAmount + mortgageInsurance;
  
  // Canadian mortgages use semi-annual compounding
  // Calculate the semi-annual interest rate
  const semiAnnualRate = data.interestRate / 100 / 2;
  
  // Convert to effective monthly rate using the formula: (1 + r/m)^(m/n) - 1
  // where r is annual rate, m is compounding periods per year (2 for semi-annual),
  // and n is payments per year (12 for monthly)
  const effectiveMonthlyRate = Math.pow(1 + semiAnnualRate, 2 / 12) - 1;
  
  // Number of monthly payments for amortization period
  const totalNumberOfPayments = data.amortizationPeriod * 12;
  
  // Number of monthly payments for term. The term can never be longer than
  // the amortization period itself (you can't have a 10-year term on a
  // 5-year amortization), so it's capped here.
  const termNumberOfPayments = Math.min(data.termLength, data.amortizationPeriod) * 12;
  
  // Calculate monthly payment using the mortgage formula with effective rate
  const monthlyPayment = totalMortgage * 
    (effectiveMonthlyRate * Math.pow(1 + effectiveMonthlyRate, totalNumberOfPayments)) / 
    (Math.pow(1 + effectiveMonthlyRate, totalNumberOfPayments) - 1);
  
  // Calculate total payments over amortization period
  const totalPayments = monthlyPayment * totalNumberOfPayments;
  
  // Calculate total interest over amortization period
  const totalInterestPaid = totalPayments - totalMortgage;
  
  // Calculate principal and interest for first payment
  const firstPaymentInterest = totalMortgage * effectiveMonthlyRate;
  const firstPaymentPrincipal = monthlyPayment - firstPaymentInterest;
  
  // Calculate interest to principal ratio
  const interestPrincipalRatio = Math.round((totalInterestPaid / totalMortgage) * 100);

  // Simulate the real amortization schedule over the term (capped above at
  // the amortization period) instead of relying purely on the closed-form
  // remaining-balance formula, which can go negative once the number of
  // payments simulated exceeds the point the loan is actually paid off.
  const termSchedule = simulateAmortizationSchedule(
    totalMortgage,
    effectiveMonthlyRate,
    monthlyPayment,
    termNumberOfPayments
  );

  const termPrincipalPaid = termSchedule.totalPrincipal;
  const termInterestPaid = termSchedule.totalInterest;
  const remainingPrincipalAtEndOfTerm = termSchedule.endingBalance;
  const termPayments = termSchedule.totalPrincipal + termSchedule.totalInterest;

  return {
    monthlyPayment: Math.round(monthlyPayment),
    mortgageAmount: Math.round(mortgageAmount),
    mortgageInsurance: Math.round(mortgageInsurance),
    principal: Math.round(firstPaymentPrincipal),
    interest: Math.round(firstPaymentInterest),
    totalMortgagePlusInterest: Math.round(totalPayments),
    totalInterestPaid: Math.round(totalInterestPaid),
    interestPrincipalRatio,
    // Term-related calculations
    termPayments: Math.round(termPayments),
    termPrincipalPaid: Math.round(termPrincipalPaid),
    termInterestPaid: Math.round(termInterestPaid),
    remainingPrincipalAtEndOfTerm: Math.round(remainingPrincipalAtEndOfTerm)
  };
}

// Simulate a monthly amortization schedule - optionally with extra
// principal payments applied - and report what actually happens, rather
// than using closed-form formulas that can go negative once the number of
// payments simulated exceeds the point the loan is fully paid off.
function simulateAmortizationSchedule(
  principal: number,
  monthlyRate: number,
  monthlyPayment: number,
  numberOfPayments: number,
  extraPaymentForMonth?: (monthIndex: number) => number
): { months: number; totalInterest: number; totalPrincipal: number; endingBalance: number } {
  let balance = principal;
  let totalInterest = 0;
  let totalPrincipal = 0;
  let months = 0;

  for (let month = 1; month <= numberOfPayments; month++) {
    if (balance <= 0.005) {
      break;
    }

    const interestPortion = balance * monthlyRate;
    let principalPortion = monthlyPayment - interestPortion;

    if (extraPaymentForMonth) {
      principalPortion += extraPaymentForMonth(month);
    }

    // Never pay down more principal than remains outstanding, and never
    // let a payment reduce principal by a negative amount.
    if (principalPortion > balance) {
      principalPortion = balance;
    }
    if (principalPortion < 0) {
      principalPortion = 0;
    }

    balance -= principalPortion;
    totalInterest += interestPortion;
    totalPrincipal += principalPortion;
    months = month;
  }

  return {
    months,
    totalInterest,
    totalPrincipal,
    endingBalance: Math.max(0, balance),
  };
}

// Calculate advanced results including all costs and stress test
export function calculateAdvancedResults(data: MortgageData) {
  // Calculate base mortgage results
  const mortgageResults = calculateMortgage(data);
  
  // Calculate monthly costs for property taxes, heating, and condo fees
  const propertyTaxesMonthly = Math.round(data.propertyTaxes / 12);
  const heatingCostsMonthly = Math.round(data.heatingCosts / 12);
  const condoFeesMonthly = data.condoFees;
  
  // Calculate total monthly payment
  const totalMonthlyPayment = mortgageResults.monthlyPayment + 
    propertyTaxesMonthly + heatingCostsMonthly + condoFeesMonthly;
  
  // Calculate impact of extra payments
  let yearsSaved = 0;
  let interestSaved = 0;
  
  if (data.extraPaymentType !== 'none' && data.extraPaymentAmount > 0) {
    // This is a simplified calculation - in a real implementation, we would 
    // recalculate the amortization schedule with extra payments
    const extraPaymentYearly = data.extraPaymentFrequency === 'monthly' ? 
      data.extraPaymentAmount * 12 : data.extraPaymentAmount;
      
    // Rough estimate of years saved based on extra payments
    yearsSaved = Math.min(
      Math.round(extraPaymentYearly * data.amortizationPeriod / mortgageResults.mortgageAmount),
      data.amortizationPeriod - 1
    );
    
    // Rough estimate of interest saved
    interestSaved = Math.round(yearsSaved * 12 * mortgageResults.interest);
  }
  
  // Calculate stress test values
  // The qualifying rate is typically 2% higher than the contract rate or the Bank of Canada benchmark rate, whichever is higher
  const qualifyingRate = Math.max(data.interestRate + 2, 5.25);
  
  // Calculate stress test payment using the qualifying rate with semi-annual compounding
  const stressTestSemiAnnualRate = qualifyingRate / 100 / 2;
  const stressTestEffectiveMonthlyRate = Math.pow(1 + stressTestSemiAnnualRate, 2 / 12) - 1;
  const numberOfPayments = data.amortizationPeriod * 12;
  const mortgageAmount = data.purchasePrice - data.downPaymentAmount;
  
  const stressTestPayment = mortgageAmount * 
    (stressTestEffectiveMonthlyRate * Math.pow(1 + stressTestEffectiveMonthlyRate, numberOfPayments)) / 
    (Math.pow(1 + stressTestEffectiveMonthlyRate, numberOfPayments) - 1);
  
  // Calculate income required (using 32% GDS ratio)
  const annualPayment = stressTestPayment * 12 + data.propertyTaxes + data.heatingCosts + data.condoFees * 12;
  const incomeRequired = Math.round(annualPayment / 0.32);
  
  return {
    totalMonthlyPayment: Math.round(totalMonthlyPayment),
    mortgagePayment: mortgageResults.monthlyPayment,
    propertyTaxesMonthly,
    heatingCostsMonthly,
    condoFeesMonthly,
    yearsSaved,
    interestSaved,
    qualifyingRate,
    stressTestPayment: Math.round(stressTestPayment),
    incomeRequired,
  };
}

export function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
  return formattedDate;
}
